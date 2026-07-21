import { type ReactNode, useEffect, useRef } from 'react';
import { useAnimate, useReducedMotion } from 'motion/react';
import { useLang } from './LanguageContext';

/**
 * Transition douce au changement de langue : le contenu fait un bref fondu
 * (opacité) à la bascule FR/EN, dans le vocabulaire de mouvement du site.
 *
 * Opacité seule, volontairement : `filter`/`transform` sur un ancêtre
 * casseraient le positionnement des éléments `position: fixed` (le menu
 * sticky des pages À propos / détail). Aucun remontage non plus — le contenu
 * routé conserve son scroll et son état ; seul un fondu est rejoué.
 */
export function LanguageTransition({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const shouldReduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (shouldReduceMotion || !scope.current) return;

    // Le texte a déjà basculé (rendu synchrone) ; on le fait réapparaître
    // en fondu depuis une opacité atténuée — épuré, sans clignotement.
    animate(
      scope.current,
      { opacity: [0.35, 1] },
      { duration: 0.4, ease: 'easeOut' },
    );
  }, [lang, shouldReduceMotion, animate, scope]);

  return <div ref={scope}>{children}</div>;
}

export default LanguageTransition;
