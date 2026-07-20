import { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const hexToRgb = (hex: string): number[] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);} 
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);} 
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);} 
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

interface GrainientProps {
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  className?: string;
}

const Grainient = ({
  timeSpeed = 0.25,
  colorBalance = 0.0,
  warpStrength = 1.0,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.1,
  grainScale = 2.0,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1.0,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 0.9,
  color1 = '#FF9FFC',
  color2 = '#5227FF',
  color3 = '#B19EEF',
  className = '',
}: GrainientProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglError, setWebglError] = useState(false);
  const programRef = useRef<Program | null>(null);
  const renderFrameRef = useRef<(() => void) | null>(null);
  const isStaticRef = useRef(false);

  // Valeurs initiales figées pour la création (les mises à jour passent
  // par l'effet « uniforms » ci-dessous, sans recréer le contexte WebGL)
  const initialPropsRef = useRef({
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
    color1,
    color2,
    color3,
  });

  // Initialisation WebGL : UNE SEULE fois par montage
  useEffect(() => {
    if (!containerRef.current) return;

    let renderer: Renderer | null = null;
    let canvas: HTMLCanvasElement | null = null;
    const p = initialPropsRef.current;

    try {
      // Try to create WebGL2 renderer
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });

      const gl = renderer.gl;

      // Check if WebGL context was created successfully
      if (!gl || gl.isContextLost()) {
        throw new Error('WebGL context creation failed');
      }

      canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';

      const container = containerRef.current;
      if (!container) return;

      container.appendChild(canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uTimeSpeed: { value: p.timeSpeed },
          uColorBalance: { value: p.colorBalance },
          uWarpStrength: { value: p.warpStrength },
          uWarpFrequency: { value: p.warpFrequency },
          uWarpSpeed: { value: p.warpSpeed },
          uWarpAmplitude: { value: p.warpAmplitude },
          uBlendAngle: { value: p.blendAngle },
          uBlendSoftness: { value: p.blendSoftness },
          uRotationAmount: { value: p.rotationAmount },
          uNoiseScale: { value: p.noiseScale },
          uGrainAmount: { value: p.grainAmount },
          uGrainScale: { value: p.grainScale },
          uGrainAnimated: { value: p.grainAnimated ? 1.0 : 0.0 },
          uContrast: { value: p.contrast },
          uGamma: { value: p.gamma },
          uSaturation: { value: p.saturation },
          uCenterOffset: { value: new Float32Array([p.centerX, p.centerY]) },
          uZoom: { value: p.zoom },
          uColor1: { value: new Float32Array(hexToRgb(p.color1)) },
          uColor2: { value: new Float32Array(hexToRgb(p.color2)) },
          uColor3: { value: new Float32Array(hexToRgb(p.color3)) },
        },
      });
      programRef.current = program;

      const mesh = new Mesh(gl, { geometry, program });
      renderFrameRef.current = () => renderer?.render({ scene: mesh });

      const setSize = () => {
        const bounds = container.getBoundingClientRect();
        const width = Math.max(1, Math.floor(bounds.width));
        const height = Math.max(1, Math.floor(bounds.height));
        renderer!.setSize(width, height);
        const res = program.uniforms.iResolution.value as Float32Array;
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
        // En mode statique, re-rendre après un redimensionnement
        if (isStaticRef.current) renderFrameRef.current?.();
      };

      const ro = new ResizeObserver(setSize);
      ro.observe(container);
      setSize();

      let raf = 0;
      const t0 = performance.now();

      // prefers-reduced-motion : une seule frame, pas de boucle d'animation.
      // On fige sur t=7s (composition équilibrée du dégradé) : à t=0 la
      // frame est dominée par la couleur sombre — fond quasi noir.
      const STATIC_TIME = 7;
      isStaticRef.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (isStaticRef.current) {
        program.uniforms.iTime.value = STATIC_TIME;
        renderFrameRef.current?.();
      } else {
        const loop = (t: number) => {
          if (gl.isContextLost()) {
            cancelAnimationFrame(raf);
            setWebglError(true);
            return;
          }
          program.uniforms.iTime.value = (t - t0) * 0.001;
          renderer!.render({ scene: mesh });
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      }

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        programRef.current = null;
        renderFrameRef.current = null;
        try {
          if (container && canvas && container.contains(canvas)) {
            container.removeChild(canvas);
          }
          // Libère explicitement le contexte WebGL (les navigateurs en
          // limitent le nombre ; sans cela ils s'accumulent jusqu'au GC)
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        } catch {
          // Ignore
        }
      };
    } catch (error) {
      console.warn('WebGL initialization failed, using CSS fallback:', error);
      setWebglError(true);

      // Cleanup if there was a partial initialization
      if (
        canvas &&
        containerRef.current &&
        containerRef.current.contains(canvas)
      ) {
        try {
          containerRef.current.removeChild(canvas);
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  // Mise à jour des uniforms quand les props changent (ex. bascule de
  // thème : nouvelles couleurs) — sans recréer le contexte WebGL
  useEffect(() => {
    const program = programRef.current;
    if (!program) return;

    program.uniforms.uTimeSpeed.value = timeSpeed;
    program.uniforms.uColorBalance.value = colorBalance;
    program.uniforms.uWarpStrength.value = warpStrength;
    program.uniforms.uWarpFrequency.value = warpFrequency;
    program.uniforms.uWarpSpeed.value = warpSpeed;
    program.uniforms.uWarpAmplitude.value = warpAmplitude;
    program.uniforms.uBlendAngle.value = blendAngle;
    program.uniforms.uBlendSoftness.value = blendSoftness;
    program.uniforms.uRotationAmount.value = rotationAmount;
    program.uniforms.uNoiseScale.value = noiseScale;
    program.uniforms.uGrainAmount.value = grainAmount;
    program.uniforms.uGrainScale.value = grainScale;
    program.uniforms.uGrainAnimated.value = grainAnimated ? 1.0 : 0.0;
    program.uniforms.uContrast.value = contrast;
    program.uniforms.uGamma.value = gamma;
    program.uniforms.uSaturation.value = saturation;
    (program.uniforms.uCenterOffset.value as Float32Array).set([
      centerX,
      centerY,
    ]);
    program.uniforms.uZoom.value = zoom;
    (program.uniforms.uColor1.value as Float32Array).set(hexToRgb(color1));
    (program.uniforms.uColor2.value as Float32Array).set(hexToRgb(color2));
    (program.uniforms.uColor3.value as Float32Array).set(hexToRgb(color3));

    // Sans boucle d'animation, rendre une frame pour refléter le changement
    if (isStaticRef.current) renderFrameRef.current?.();
  }, [
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
    color1,
    color2,
    color3,
  ]);

  // CSS Fallback if WebGL fails
  if (webglError) {
    return (
      <div
        className={`grainient-container ${className}`.trim()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          background: `linear-gradient(135deg, ${color3} 0%, ${color2} 50%, ${color1} 100%)`,
          opacity: 0.8,
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`grainient-container ${className}`.trim()}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    />
  );
};

export default Grainient;
