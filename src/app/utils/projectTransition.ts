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

// Aller : la navigation part à la FIN du morph (navigateDelay =
// morphDuration) pour que le montage de la page d'arrivée ne fasse pas
// saccader l'animation ; la révélation (fadeDuration) n'a lieu que quand la
// page est montée (poignée de main `hasArrived`), overlayDuration servant de
// filet de sécurité. Retour : overlayDuration est la durée totale réelle.
export function getProjectTransitionTiming(
  width: number,
  direction: ProjectTransitionDirection,
) {
  if (width < 1024) {
    return direction === 'forward'
      ? {
          navigateDelay: 550,
          morphDuration: 0.55,
          fadeDuration: 0.2,
          overlayDuration: 3000,
          reverseDelay: 0,
        }
      : {
          navigateDelay: 0,
          morphDuration: 0.5,
          fadeDuration: 0.2,
          overlayDuration: 600,
          reverseDelay: 0,
        };
  }

  return direction === 'forward'
    ? {
        navigateDelay: 700,
        morphDuration: 0.7,
        fadeDuration: 0.25,
        overlayDuration: 3000,
        reverseDelay: 0,
      }
    : {
        navigateDelay: 0,
        morphDuration: 0.6,
        fadeDuration: 0.25,
        overlayDuration: 700,
        reverseDelay: 0,
      };
}

export const prefersReducedProjectMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
