import gsap from 'gsap';
import {
  Color,
  FogExp2,
  PCFShadowMap,
  Scene,
  type ShaderMaterial,
  Timer,
  Vector3,
  WebGLRenderer,
} from 'three';
import { ChannelManager } from '../channels/ChannelManager';
import { ChannelRenderer } from '../channels/ChannelRenderer';
import { Osd } from '../channels/Osd';
import { config } from '../config';
import { ProjectPage } from '../project/ProjectPage';
import { Composer } from '../render/Composer';
import { createCrtMaterial, updateCrtMaterial } from '../render/CrtMaterial';
import { applyLook, LOOK_LABELS, toggleLook } from '../render/looks';
import { Candle } from '../scene/Candle';
import { Cat } from '../scene/Cat';
import { CatBrain } from '../scene/CatBrain';
import { Clutter } from '../scene/Clutter';
import { Dust } from '../scene/Dust';
import { Hand } from '../scene/Hand';
import { HeadCamera } from '../scene/HeadCamera';
import { Lamp } from '../scene/Lamp';
import { Lighting } from '../scene/Lighting';
import { LightShafts } from '../scene/LightShafts';
import { layout } from '../scene/layout';
import type { ButtonId } from '../scene/Remote';
import { Room } from '../scene/Room';
import { Sofa } from '../scene/Sofa';
import { Tv } from '../scene/Tv';
import { Audio } from './Audio';
import { type Action, Input } from './Input';
import { StateMachine } from './StateMachine';

/** Main loop: owns the renderer, the scene and every system. */
export class App {
  readonly renderer: WebGLRenderer;
  readonly input: Input;
  readonly audio: Audio;
  readonly state = new StateMachine('LOADING');
  private readonly scene = new Scene();
  private readonly timer = new Timer();
  private readonly head: HeadCamera;
  private readonly room = new Room();
  private readonly lamp = new Lamp();
  private readonly hand = new Hand();
  private readonly tv: Tv;
  private readonly lighting: Lighting;
  private readonly composer: Composer;
  private readonly channelRenderer = new ChannelRenderer();
  private readonly osd = new Osd();
  private readonly channels: ChannelManager;
  private readonly crt: ShaderMaterial;
  private readonly cat = new Cat();
  private readonly catBrain: CatBrain;
  private readonly sofa = new Sofa();
  private readonly shafts: LightShafts;
  private readonly dust: Dust;
  private readonly candle = new Candle();
  /** Drawn after the paint filter (sparkles it would erase). */
  private readonly overlay = new Scene();
  private readonly fog = new FogExp2(config.look.fogColor, 0);
  private readonly dustColors = Array.from({ length: 4 }, () => new Color());
  private readonly dustPowers = [0, 0, 0, 0];
  private toastTimer = 0;
  private readonly project: ProjectPage;
  private transition: gsap.core.Timeline | null = null;
  private time = 0;
  // scratch: where the viewer's head is and where it looks
  private readonly eye = new Vector3();
  private readonly forward = new Vector3();
  private readonly up = new Vector3();
  private readonly projected = new Vector3();

  constructor(private readonly container: HTMLElement) {
    applyLook('matiere');
    this.renderer = new WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, config.render.maxPixelRatio),
    );
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    container.appendChild(this.renderer.domElement);

    this.input = new Input(this.renderer.domElement);
    this.head = new HeadCamera(window.innerWidth / window.innerHeight);
    this.composer = new Composer(this.renderer);

    this.crt = createCrtMaterial(
      this.channelRenderer.texture,
      this.osd.texture,
    );
    this.tv = new Tv(this.crt);
    this.audio = new Audio(this.tv.screenCenter);
    this.channels = new ChannelManager(this.state, this.osd, this.audio);
    this.lighting = new Lighting(this.tv.screenCenter, layout.eye);
    this.lighting.onHeadlight = () => this.audio.carPass();
    this.catBrain = new CatBrain(
      this.cat,
      () => this.audio.cat,
      this.tv.screenCenter,
    );

    this.hand.group.position.set(0.13, -0.118, -0.4);
    this.hand.group.rotation.set(0.62, 0.32, 0.18);
    this.head.rig.add(this.hand.group);
    this.lighting.handFill.position.set(0.02, 0.05, -0.62);
    this.head.rig.add(this.lighting.handFill);
    // being sucked in ends a few centimetres in front of the glass
    this.head.travelTarget
      .copy(this.tv.screenCenter)
      .add(new Vector3(0, 0, 0.1));
    this.project = new ProjectPage(container, () => this.exitProject());

    // the pushed look: light shafts, dust, a candle, a coloured haze
    this.shafts = new LightShafts(this.tv.screenCenter);
    const { window: street, lampDown, lampUp, tv } = this.shafts.beams;
    this.dust = new Dust([street, lampDown, lampUp, tv]);
    this.overlay.add(this.dust.points);
    this.candle.group.position.set(-0.38, 0.445, 0.12);
    this.scene.fog = this.fog;

    this.scene.add(
      this.room.group,
      this.tv.group,
      this.sofa.group,
      this.shafts.group,
      this.candle.group,
      new Clutter().group,
      this.lamp.group,
      this.lighting.group,
      this.cat.group,
      this.head.rig,
    );

    this.input.onAction(this.onAction);
    // audio can only start after a user gesture
    const unlock = () => this.audio.unlock();
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);

    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
  }

  /** Compiles every shader and renders once before showing anything. */
  async start(): Promise<void> {
    this.channelRenderer.render(this.renderer, 0, 0);
    await this.renderer.compileAsync(this.scene, this.head.camera);
    this.frame();
    this.state.go('TV_ON');
    this.channels.announce();
    this.renderer.setAnimationLoop(this.frame);
  }

  resize = (): void => {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.head.camera.aspect = width / height;
    this.head.camera.updateProjectionMatrix();
    this.composer.setSize(width, height);
  };

  private onAction = (action: Action): void => {
    const channels = this.channels;
    if (this.state.is('LOADING', 'WAITING_CLICK', 'INTRO')) return;
    if (action.type === 'look') {
      const look = toggleLook();
      this.toast(LOOK_LABELS[look]);
      return;
    }
    if (this.state.is('ENTERING', 'EXITING')) return;
    if (this.state.is('IN_PROJECT')) {
      this.onProjectAction(action);
      return;
    }
    // with the TV off, only the power button does something
    if (!channels.isOn && action.type !== 'power') return;
    switch (action.type) {
      case 'chUp':
        this.press('chUp', () => channels.step(1));
        break;
      case 'chDown':
        this.press('chDown', () => channels.step(-1));
        break;
      case 'digit':
        this.press(`digit${action.value}`, () => channels.digit(action.value));
        break;
      case 'volUp':
        this.press('volUp', () => channels.changeVolume(1));
        break;
      case 'volDown':
        this.press('volDown', () => channels.changeVolume(-1));
        break;
      case 'mute':
        this.press('mute', () => channels.toggleMute());
        break;
      case 'power':
        this.press('power', () => {
          channels.togglePower();
          this.tv.setPowered(channels.isOn);
        });
        break;
      case 'enter':
        if (this.state.is('TV_ON')) this.press('ok', () => this.enterProject());
        break;
      case 'back':
        break;
    }
  };

  /** Inside a project the keyboard reads the page; Esc goes back. */
  private onProjectAction(action: Action): void {
    switch (action.type) {
      case 'chUp':
        this.project.scrollBy(-160);
        break;
      case 'chDown':
        this.project.scrollBy(160);
        break;
      case 'enter':
        this.project.scrollPage(1);
        break;
      case 'back':
        this.exitProject();
        break;
      default:
        break;
    }
  }

  /**
   * Sucked into the screen (CLAUDE.md §4.5): the head recentres, a shake
   * builds up, then a brutal accelerating zoom into the glass — FOV
   * widening, the room stretching, CRT snow — and a white flash.
   */
  private enterProject(): void {
    if (!this.channels.isOn || !this.state.go('ENTERING')) return;
    const head = this.head;
    const fx = this.composer.transition;
    const signal = this.channels.signal;
    const duration = 1.2;
    this.audio.suck(duration);
    this.transition?.kill();
    this.transition = gsap
      .timeline({
        onUpdate: () => {
          const progress = this.transition?.progress() ?? 0;
          head.shake(0.004 + progress * progress * 0.035);
        },
      })
      .to(head, { recenter: 1, duration: 0.4, ease: 'power2.out' }, 0)
      .to(head, { travel: 1, duration, ease: 'expo.in' }, 0)
      .to(head, { fovBoost: 38, duration, ease: 'power3.in' }, 0)
      .to(fx, { warp: 1, duration, ease: 'power3.in' }, 0)
      .to(signal, { noise: 0.6, duration: duration * 0.4 }, duration * 0.6)
      .to(fx, { flash: 1, duration: 0.14, ease: 'power2.in' }, duration - 0.12)
      .call(() => this.arriveInProject());
  }

  private arriveInProject(): void {
    this.state.go('IN_PROJECT');
    this.audio.setInsideTv(true);
    this.project.open(this.channels.current);
  }

  /**
   * Thrown back out (CLAUDE.md §4.7): the page collapses, the camera is
   * spat out of the glass and lands in the cushions — pushed back and up,
   * the feet flying into view — then bounces and settles on the channel.
   */
  private async exitProject(): Promise<void> {
    if (!this.state.go('EXITING')) return;
    await this.project.close();
    const head = this.head;
    const fx = this.composer.transition;
    const legs = this.sofa.legs.rotation;
    const impact = 0.45;
    this.audio.setInsideTv(false);
    this.audio.eject(impact);
    this.channels.signal.noise = 0;
    this.transition?.kill();
    this.transition = gsap
      .timeline()
      .to(fx, { flash: 0, duration: 0.35, ease: 'power2.out' }, 0)
      .to(fx, { warp: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to(head, { travel: 0, duration: impact, ease: 'power4.out' }, 0)
      .to(head, { fovBoost: 0, duration: 0.6, ease: 'power2.out' }, 0)
      .to(
        head.offset,
        { z: 0.22, y: 0.1, duration: impact, ease: 'power3.out' },
        0,
      )
      .to(head, { pitchOffset: 0.2, duration: impact, ease: 'power3.out' }, 0)
      .to(legs, { x: 1.15, duration: 0.4, ease: 'power3.out' }, 0.18)
      .call(() => head.shake(0.05), [], impact)
      .to(
        head.offset,
        { z: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' },
        impact + 0.05,
      )
      .to(
        head,
        { pitchOffset: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' },
        impact + 0.05,
      )
      .to(legs, { x: 0, duration: 0.9, ease: 'bounce.out' }, impact + 0.1)
      .to(head, { recenter: 0, duration: 0.6 }, impact + 0.5)
      .call(() => {
        this.state.go('TV_ON');
        this.channels.announce();
      });
  }

  /** Small OSD-style message at the bottom of the screen. */
  private toast(text: string): void {
    let element = this.container.querySelector<HTMLElement>('.salon-toast');
    if (!element) {
      element = document.createElement('div');
      element.className = 'salon-toast';
      this.container.append(element);
    }
    element.textContent = text;
    element.classList.add('is-visible');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(
      () => element?.classList.remove('is-visible'),
      1600,
    );
  }

  private press(button: ButtonId, effect: () => void): void {
    this.hand.press(button, () => {
      this.audio.click();
      effect();
    });
  }

  private onVisibility = (): void => {
    if (document.hidden) {
      this.renderer.setAnimationLoop(null);
    } else {
      this.timer.reset();
      this.renderer.setAnimationLoop(this.frame);
    }
  };

  private frame = (): void => {
    // clamp dt so a hitch never makes the springs explode
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 1 / 20);
    this.time += dt;
    const time = this.time;

    // inside a project the room is not visible: only the sound lives on
    if (this.state.is('IN_PROJECT')) {
      this.audio.update(dt, this.eye, this.forward, this.up);
      return;
    }

    this.head.update(dt, this.input.head);
    this.hand.update();
    this.channels.update(dt);
    this.lamp.update();
    this.room.update(time);

    const signal = this.channels.signal;
    const tubeLit = signal.signal > 0 || signal.flash > 0;
    if (tubeLit) {
      this.channelRenderer.render(
        this.renderer,
        time,
        this.channels.current.pattern,
      );
      this.channelRenderer.sample(this.renderer, dt, (r, g, b) =>
        this.lighting.setPictureColor(r, g, b),
      );
    }
    updateCrtMaterial(this.crt, time, signal);
    const lightPower =
      signal.signal * signal.collapseX * signal.collapseY + signal.flash * 0.5;
    this.lighting.update(dt, time, lightPower, signal.noise);
    this.updateAtmosphere(dt, time, lightPower);

    const camera = this.head.camera;
    camera.getWorldPosition(this.eye);
    camera.getWorldDirection(this.forward);
    this.up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    this.catBrain.update(dt, lightPower, this.eye, this.forward);
    this.audio.update(dt, this.eye, this.forward, this.up);

    // where the TV is on screen: the transitions suck the room toward it
    this.projected.copy(this.tv.screenCenter).project(camera);
    this.composer.transition.center.set(
      (this.projected.x + 1) / 2,
      (this.projected.y + 1) / 2,
    );
    this.composer.render(this.scene, this.head.camera, time, this.overlay);
  };

  private updateAtmosphere(dt: number, time: number, tvPower: number): void {
    const { look, lights } = config;
    this.fog.density = look.fog;
    this.fog.color.set(look.fogColor);
    this.candle.update(dt, time);
    const lampLevel = this.lamp.level;
    this.shafts.update(time, this.lighting.tvLight, tvPower, lampLevel);
    const [street, lampDown, lampUp, tv] = this.dustColors;
    street.set('#a9c1ff').multiplyScalar(lights.windowIntensity / 4.5);
    lampDown.set(lights.lampColor);
    lampUp.copy(lampDown);
    tv.copy(this.lighting.tvLight);
    this.dustPowers[0] = 0.9;
    this.dustPowers[1] = 0.9 * lampLevel;
    this.dustPowers[2] = 0.6 * lampLevel;
    this.dustPowers[3] = 0.7 * tvPower;
    this.dust.update(
      time,
      this.renderer.getPixelRatio(),
      this.dustColors,
      this.dustPowers,
    );
  }
}
