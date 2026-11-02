import type { Action, Input } from './Input';

const BUTTONS: { label: string; action: Action; className?: string }[] = [
  { label: 'CH+', action: { type: 'chUp' } },
  { label: 'CH−', action: { type: 'chDown' } },
  { label: 'VOL+', action: { type: 'volUp' } },
  { label: 'VOL−', action: { type: 'volDown' } },
  { label: 'OK', action: { type: 'enter' } },
  { label: '⏻', action: { type: 'power' }, className: 'is-power' },
];

/**
 * Prototype-only touch mode (CLAUDE.md §5.3): on-screen remote buttons and
 * the head driven by the gyroscope. Not the final mobile version (§13).
 */
export class TouchControls {
  constructor(root: HTMLElement, input: Input) {
    const panel = document.createElement('div');
    panel.className = 'salon-touch';
    for (const button of BUTTONS) {
      const element = document.createElement('button');
      element.type = 'button';
      element.textContent = button.label;
      if (button.className) element.classList.add(button.className);
      element.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        input.emit(button.action);
      });
      panel.appendChild(element);
    }

    const gyro = document.createElement('button');
    gyro.type = 'button';
    gyro.className = 'salon-gyro';
    gyro.textContent = 'Activer le gyroscope';
    gyro.addEventListener('click', async () => {
      const ok = await input.enableGyroscope().catch(() => false);
      gyro.textContent = ok ? 'Gyroscope actif' : 'Gyroscope refusé';
      window.setTimeout(() => gyro.remove(), 1500);
    });

    root.append(panel, gyro);
  }
}
