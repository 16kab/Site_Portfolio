export type ProjectTransitionDirection = 'forward' | 'reverse';

export interface ProjectTransitionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ProjectTransitionSnapshot {
  imageSrc: string;
  imageRect: ProjectTransitionRect;
  projectLink: string;
  originPath: string;
  scrollTop: number;
}

export function roundTransitionRect(
  rect: ProjectTransitionRect,
): ProjectTransitionRect {
  return {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}

export function getProjectTransitionTiming(
  width: number,
  direction: ProjectTransitionDirection,
) {
  if (width < 1024) {
    return direction === 'forward'
      ? {
          navigateDelay: 420,
          morphDuration: 0.65,
          overlayDuration: 800,
          reverseDelay: 0,
        }
      : {
          navigateDelay: 0,
          morphDuration: 0.6,
          overlayDuration: 650,
          reverseDelay: 0,
        };
  }

  return direction === 'forward'
    ? {
        navigateDelay: 1000,
        morphDuration: 0.8,
        overlayDuration: 2000,
        reverseDelay: 0,
      }
    : {
        navigateDelay: 0,
        morphDuration: 0.8,
        overlayDuration: 1000,
        reverseDelay: 0.3,
      };
}

export const prefersReducedProjectMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
