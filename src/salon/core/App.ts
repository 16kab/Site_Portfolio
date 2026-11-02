import {
  Timer,
  PCFShadowMap,
  Scene,
  type ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { ChannelManager } from '../channels/ChannelManager';
import { ChannelRenderer } from '../channels/ChannelRenderer';
import { Osd } from '../channels/Osd';
import { config } from '../config';
import { Composer } from '../render/Composer';
import { createCrtMaterial, updateCrtMaterial } from '../render/CrtMaterial';
import { Hand } from '../scene/Hand';
import { HeadCamera } from '../scene/HeadCamera';
import { Lamp } from '../scene/Lamp';
import { Lighting } from '../scene/Lighting';
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
  readonly audio = new Audio();
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
  private time = 0;

  constructor(private readonly container: HTMLElement) {
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
    this.channels = new ChannelManager(this.state, this.osd, this.audio);

    this.crt = createCrtMaterial(
      this.channelRenderer.texture,
      this.osd.texture,
    );
    this.tv = new Tv(this.crt);
    this.lighting = new Lighting(this.tv.screenCenter, layout.eye);

    this.hand.group.position.set(0.13, -0.118, -0.42);
    this.hand.group.rotation.set(0.62, 0.32, 0.18);
    this.head.rig.add(this.hand.group);
    this.lighting.handFill.position.set(0.02, 0.05, -0.62);
    this.head.rig.add(this.lighting.handFill);

    this.scene.add(
      this.room.group,
      this.tv.group,
      new Sofa().group,
      this.lamp.group,
      this.lighting.group,
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
        // entering a project comes in Phase 2: for now, show the channel info
        this.press('ok', () => channels.announce());
        break;
      case 'back':
        break;
    }
  };

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

    this.composer.render(this.scene, this.head.camera, time);
  };
}
