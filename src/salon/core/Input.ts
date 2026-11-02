export type Action =
  | { type: 'chUp' }
  | { type: 'chDown' }
  | { type: 'digit'; value: number }
  | { type: 'enter' }
  | { type: 'back' }
  | { type: 'volUp' }
  | { type: 'volDown' }
  | { type: 'power' }
  | { type: 'mute' }
  | { type: 'look' };

type ActionListener = (action: Action) => void;

const KEY_ACTIONS: Record<string, Action> = {
  ArrowUp: { type: 'chUp' },
  ArrowRight: { type: 'chUp' },
  ArrowDown: { type: 'chDown' },
  ArrowLeft: { type: 'chDown' },
  Enter: { type: 'enter' },
  NumpadEnter: { type: 'enter' },
  Space: { type: 'enter' },
  Escape: { type: 'back' },
  Backspace: { type: 'back' },
  NumpadAdd: { type: 'volUp' },
  NumpadSubtract: { type: 'volDown' },
  Equal: { type: 'volUp' },
  Minus: { type: 'volDown' },
  KeyP: { type: 'power' },
  KeyM: { type: 'mute' },
  KeyL: { type: 'look' },
};

/**
 * Keyboard → remote actions, mouse / gyroscope → head direction.
 * The head target is normalised to [-1, 1] on both axes (0 = looking at
 * the TV); the camera applies its own amplitude and spring.
 */
export class Input {
  /** Normalised head target, x = yaw (right +), y = pitch (up +). */
  readonly head = { x: 0, y: 0 };
  private listeners: ActionListener[] = [];
  private gyroBase: { beta: number; gamma: number } | null = null;
  private gyroActive = false;

  constructor(private readonly target: HTMLElement) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('pointermove', this.onPointerMove);
    document.documentElement.addEventListener('pointerleave', this.recenter);
    window.addEventListener('blur', this.recenter);
  }

  onAction(listener: ActionListener): void {
    this.listeners.push(listener);
  }

  emit(action: Action): void {
    for (const listener of this.listeners) listener(action);
  }

  /** Must be called from a user gesture (iOS permission prompt). */
  async enableGyroscope(): Promise<boolean> {
    const Orientation = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof Orientation.requestPermission === 'function') {
      const answer = await Orientation.requestPermission();
      if (answer !== 'granted') return false;
    }
    this.gyroBase = null;
    this.gyroActive = true;
    window.addEventListener('deviceorientation', this.onOrientation);
    return true;
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const digit = /^(?:Digit|Numpad)(\d)$/.exec(event.code);
    if (digit) {
      event.preventDefault();
      this.emit({ type: 'digit', value: Number(digit[1]) });
      return;
    }
    // "+" on AZERTY / shifted layouts
    const action =
      event.key === '+'
        ? KEY_ACTIONS.NumpadAdd
        : event.key === '-'
          ? KEY_ACTIONS.NumpadSubtract
          : KEY_ACTIONS[event.code];
    if (!action) return;
    event.preventDefault();
    if (event.repeat && action.type !== 'volUp' && action.type !== 'volDown') {
      return;
    }
    this.emit(action);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || this.gyroActive) return;
    const rect = this.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    this.head.x = clamp(x);
    this.head.y = clamp(-y);
  };

  private recenter = (): void => {
    if (this.gyroActive) return;
    this.head.x = 0;
    this.head.y = 0;
  };

  private onOrientation = (event: DeviceOrientationEvent): void => {
    if (event.beta === null || event.gamma === null) return;
    // In landscape the device axes are swapped relative to the screen
    const angle = screen.orientation?.angle ?? 0;
    const landscape = angle === 90 || angle === 270;
    const sign = angle === 270 ? -1 : 1;
    const beta = landscape ? event.gamma * sign : event.beta;
    const gamma = landscape ? -event.beta * sign : event.gamma;
    if (!this.gyroBase) this.gyroBase = { beta, gamma };
    // ±25° of device rotation covers the full head range
    this.head.x = clamp((gamma - this.gyroBase.gamma) / 25);
    this.head.y = clamp((beta - this.gyroBase.beta) / 25);
  };
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
