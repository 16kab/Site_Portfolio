import { useEffect, useState } from 'react';

/**
 * Renvoie `true` quand le thème sombre est actif (classe `dark` sur
 * <html>) et se met à jour à chaque bascule. Factorise l'observation du
 * thème auparavant dupliquée dans plusieurs composants.
 *
 * L'écriture du thème (bascule, persistance) reste la responsabilité de
 * AnimatedThemeToggler ; ce hook est en lecture seule.
 */
export function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
