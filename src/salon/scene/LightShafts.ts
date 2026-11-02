import {
  AddEquation,
  Color,
  CustomBlending,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  OneFactor,
  ShaderMaterial,
  Vector3,
  ZeroFactor,
} from 'three';
import { config } from '../config';
import { layout } from './layout';

/** A light shaft: a soft cone from `from` (radius rFrom) to `to` (rTo). */
export type Beam = {
  from: Vector3;
  to: Vector3;
  rFrom: number;
  rTo: number;
};

const UP = new Vector3(0, 1, 0);

function material(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color() },
      uIntensity: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vWorld;
      varying float vAlong;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vec4 view = viewMatrix * world;
        vWorld = world.xyz;
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-view.xyz);
        vAlong = uv.y;
        gl_Position = projectionMatrix * view;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vWorld;
      varying float vAlong;
      void main() {
        // brightest where we look through the most air: the cone's middle
        float facing = abs(dot(normalize(vNormal), normalize(vView)));
        float body = pow(facing, 2.2);
        // soft at the source, fading out along the beam
        float along = smoothstep(1.0, 0.9, vAlong) * smoothstep(0.0, 0.45, vAlong);
        // slow swirls of dust in suspension
        float dust = 0.72 + 0.28 * sin(vWorld.x * 4.0 + uTime * 0.21) *
          sin(vWorld.y * 3.0 - uTime * 0.17) * sin(vWorld.z * 5.0 + uTime * 0.13);
        gl_FragColor = vec4(uColor * uIntensity * body * along * dust, 0.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    // additive colour, the alpha (screen mask) left untouched
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendSrcAlpha: ZeroFactor,
    blendDstAlpha: OneFactor,
  });
}

function shaft(beam: Beam, shader: ShaderMaterial): Mesh {
  const direction = new Vector3().subVectors(beam.to, beam.from);
  const length = direction.length();
  // cylinder top = source (uv.y = 1), bottom = far end (uv.y = 0)
  const geometry = new CylinderGeometry(
    beam.rFrom,
    beam.rTo,
    length,
    32,
    1,
    true,
  );
  geometry.translate(0, -length / 2, 0);
  const mesh = new Mesh(geometry, shader);
  mesh.position.copy(beam.from);
  mesh.quaternion.setFromUnitVectors(UP, direction.normalize().negate());
  mesh.renderOrder = 10;
  mesh.frustumCulled = false;
  return mesh;
}

/**
 * Light made visible in the air (No Rest for the Wicked's shafts): the
 * cold street light falling through the window, the warm cones above and
 * below the lampshade, the cyan glow spilling from the screen.
 */
export class LightShafts {
  readonly group = new Group();
  readonly beams: Record<'window' | 'lampDown' | 'lampUp' | 'tv', Beam>;
  private readonly window = material();
  private readonly lampDown = material();
  private readonly lampUp = material();
  private readonly tv = material();

  constructor(screenCenter: Vector3) {
    const { height } = layout.room;
    const lamp = layout.lamp;
    this.beams = {
      window: {
        from: layout.street.shaftFrom.clone(),
        to: layout.street.shaftTo.clone(),
        rFrom: 0.55,
        rTo: 1.05,
      },
      lampDown: {
        from: new Vector3(lamp.x, 1.27, lamp.z),
        to: new Vector3(lamp.x, 0.02, lamp.z),
        rFrom: 0.23,
        rTo: 0.8,
      },
      lampUp: {
        from: new Vector3(lamp.x, 1.54, lamp.z),
        to: new Vector3(lamp.x, height, lamp.z),
        rFrom: 0.15,
        rTo: 0.48,
      },
      tv: {
        from: screenCenter.clone().add(new Vector3(0, 0, 0.03)),
        to: screenCenter.clone().add(new Vector3(0.02, -0.12, 0.75)),
        rFrom: 0.3,
        rTo: 0.55,
      },
    };
    this.window.uniforms.uColor.value.set('#7d9be0');
    this.group.add(
      shaft(this.beams.window, this.window),
      shaft(this.beams.lampDown, this.lampDown),
      shaft(this.beams.lampUp, this.lampUp),
      shaft(this.beams.tv, this.tv),
    );
  }

  /**
   * @param tvColor current TV light colour (linear)
   * @param tvPower 0..1, @param lampLevel 0..1
   */
  update(
    time: number,
    tvColor: Color,
    tvPower: number,
    lampLevel: number,
  ): void {
    const amount = config.look.beams;
    this.group.visible = amount > 0.001;
    if (!this.group.visible) return;
    const { lights } = config;
    for (const m of [this.window, this.lampDown, this.lampUp, this.tv]) {
      m.uniforms.uTime.value = time;
    }
    this.window.uniforms.uIntensity.value =
      0.042 * lights.windowIntensity * amount;
    const lampColor = this.lampDown.uniforms.uColor.value as Color;
    lampColor.set(lights.lampColor);
    this.lampUp.uniforms.uColor.value.copy(lampColor);
    this.lampDown.uniforms.uIntensity.value =
      0.035 * lights.lampIntensity * lampLevel * amount;
    this.lampUp.uniforms.uIntensity.value =
      0.028 * lights.lampIntensity * lampLevel * amount;
    this.tv.uniforms.uColor.value.copy(tvColor);
    this.tv.uniforms.uIntensity.value =
      0.0045 * lights.tvIntensity * tvPower * amount;
  }
}
