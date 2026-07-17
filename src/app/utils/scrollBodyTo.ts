/**
 * Fait défiler `document.body` (le conteneur de scroll de l'app, cf.
 * theme.css : html est fixed, c'est body qui scrolle) vers `targetTop`.
 *
 * - Respecte `prefers-reduced-motion` : saut instantané.
 * - Retourne une fonction d'annulation (à appeler à l'unmount ou si un
 *   nouveau défilement démarre) pour ne pas écrire après coup.
 */
export function scrollBodyTo(
  targetTop: number,
  duration = 800,
  onComplete?: () => void,
): () => void {
  const body = document.body;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    body.scrollTop = targetTop;
    onComplete?.();
    return () => {};
  }

  const start = body.scrollTop;
  const change = targetTop - start;
  let startTime: number | null = null;
  let rafId = 0;
  let cancelled = false;

  const step = (timestamp: number) => {
    if (cancelled) return;
    if (startTime === null) startTime = timestamp;

    const progress = Math.min((timestamp - startTime) / duration, 1);
    // ease-in-out-cubic
    const ease =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    body.scrollTop = start + change * ease;

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(step);

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
}
