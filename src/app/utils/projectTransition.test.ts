import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getProjectTransitionTiming,
  prefersReducedProjectMotion,
  roundTransitionRect,
} from './projectTransition';

describe('getProjectTransitionTiming', () => {
  it('uses compact forward timings on a 390px viewport', () => {
    expect(getProjectTransitionTiming(390, 'forward')).toEqual({
      navigateDelay: 400,
      morphDuration: 0.55,
      overlayDuration: 650,
      reverseDelay: 0,
    });
  });

  it('uses desktop forward timings on a 1440px viewport', () => {
    expect(getProjectTransitionTiming(1440, 'forward')).toEqual({
      navigateDelay: 550,
      morphDuration: 0.7,
      overlayDuration: 800,
      reverseDelay: 0,
    });
  });

  it('uses compact reverse timings on a 390px viewport', () => {
    expect(getProjectTransitionTiming(390, 'reverse')).toEqual({
      navigateDelay: 0,
      morphDuration: 0.5,
      overlayDuration: 600,
      reverseDelay: 0,
    });
  });

  it('uses desktop reverse timings on a 1440px viewport', () => {
    expect(getProjectTransitionTiming(1440, 'reverse')).toEqual({
      navigateDelay: 0,
      morphDuration: 0.6,
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
