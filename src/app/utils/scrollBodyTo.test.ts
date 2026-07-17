import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scrollBodyTo } from './scrollBodyTo';

describe('scrollBodyTo', () => {
  beforeEach(() => {
    document.body.scrollTop = 0;
    vi.useFakeTimers();

    let now = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => {
        now += 100;
        cb(now);
      }, 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('saute directement à la cible quand le mouvement est réduit', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    scrollBodyTo(500);

    expect(document.body.scrollTop).toBe(500);
  });

  it('anime progressivement puis atteint la cible', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    scrollBodyTo(800);
    vi.runAllTimers();

    expect(document.body.scrollTop).toBe(800);
  });

  it("n'écrit plus rien après annulation", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    const cancel = scrollBodyTo(800);
    vi.advanceTimersByTime(16); // une seule frame (~100 ms de progression)
    const positionAtCancel = document.body.scrollTop;
    cancel();
    vi.runAllTimers();

    expect(document.body.scrollTop).toBe(positionAtCancel);
    expect(document.body.scrollTop).not.toBe(800);
  });
});
