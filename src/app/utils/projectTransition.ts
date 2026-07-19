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

// Timings resserrés : l'overlay se termine juste après la fin du morph
// (overlayDuration ≈ morphDuration + fenêtre de révélation), et la navigation
// est déclenchée avant, pour que la page soit prête au moment du fondu. Plus
// de temps mort entre « l'image a fini de grandir » et « on voit la page ».
export function getProjectTransitionTiming(
  width: number,
  direction: ProjectTransitionDirection,
) {
  if (width < 1024) {
    return direction === 'forward'
      ? {
          navigateDelay: 400,
          morphDuration: 0.55,
          overlayDuration: 650,
          reverseDelay: 0,
        }
      : {
          navigateDelay: 0,
          morphDuration: 0.5,
          overlayDuration: 600,
          reverseDelay: 0,
        };
  }

  return direction === 'forward'
    ? {
        navigateDelay: 550,
        morphDuration: 0.7,
        overlayDuration: 800,
        reverseDelay: 0,
      }
    : {
        navigateDelay: 0,
        morphDuration: 0.6,
        overlayDuration: 700,
        reverseDelay: 0,
      };
}

export const prefersReducedProjectMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
