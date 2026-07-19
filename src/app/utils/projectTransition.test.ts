import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getProjectTransitionTiming,
  prefersReducedProjectMotion,
  roundTransitionRect,
} from './projectTransition';

describe('getProjectTransitionTiming', () => {
  it('uses compact forward timings on a 390px viewport', () => {
    expect(getProjectTransitionTiming(390, 'forward')).toEqual({
      navigateDelay: 550,
      morphDuration: 0.55,
      fadeDuration: 0.2,
      overlayDuration: 3000,
      reverseDelay: 0,
    });
  });

  it('navigates at the end of the morph so mounting never janks it', () => {
    for (const width of [390, 1440]) {
      const timing = getProjectTransitionTiming(width, 'forward');
      expect(timing.navigateDelay).toBe(timing.morphDuration * 1000);
    }
  });

  it('uses desktop forward timings on a 1440px viewport', () => {
    expect(getProjectTransitionTiming(1440, 'forward')).toEqual({
      navigateDelay: 700,
      morphDuration: 0.7,
      fadeDuration: 0.25,
      overlayDuration: 3000,
      reverseDelay: 0,
    });
  });

  it('uses compact reverse timings on a 390px viewport', () => {
    expect(getProjectTransitionTiming(390, 'reverse')).toEqual({
      navigateDelay: 0,
      morphDuration: 0.5,
      fadeDuration: 0.2,
      overlayDuration: 600,
      reverseDelay: 0,
    });
  });

  it('uses desktop reverse timings on a 1440px viewport', () => {
    expect(getProjectTransitionTiming(1440, 'reverse')).toEqual({
      navigateDelay: 0,
      morphDuration: 0.6,
      fadeDuration: 0.25,
      overlayDuration: 700,
      reverseDelay: 0,
    });
  });
});

describe('roundTransitionRect', () => {
  it('rounds each rectangle coordinate independently', () => {
    expect(
      roundTransitionRect({ left: 1.4, top: 2.6, width: 99.5, height: 49.4 }),
    ).toEqual({
      left: 1,
      top: 3,
      width: 100,
      height: 49,
    });
  });
});

describe('prefersReducedProjectMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads the reduced motion media query preference', () => {
    const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList);

    expect(prefersReducedProjectMotion()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});
