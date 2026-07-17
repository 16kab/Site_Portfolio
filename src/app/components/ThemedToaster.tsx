import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { getToastConfig } from '../config';

/**
 * Toaster Sonner aligné sur le thème clair/sombre de l'application.
 * (Le suivi de thème sera factorisé dans un hook dédié — voir lot suivant.)
 */
export default function ThemedToaster() {
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

  return <Toaster {...getToastConfig(isDark)} />;
}
