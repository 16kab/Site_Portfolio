import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { scrollBodyTo } from '../utils/scrollBodyTo';
import { resolveActiveSection } from '../utils/scrollSpy';

export interface ScrollSpySection<K extends string> {
  key: K;
  ref: RefObject<HTMLElement | null>;
}

/**
 * Menu sticky à détection de section, partagé par les pages Détail projet
 * et À propos. Observe le défilement de `<body>` (le conteneur de scroll de
 * l'app) pour exposer la section active et un état « défilé », et fournit un
 * défilement programmatique qui suspend la détection le temps de l'animation.
 *
 * Les parties qui divergent entre les pages restent à l'appelant : l'offset
 * de détection (paramètre) et le calcul de la cible de `scrollToSection`
 * (l'appelant passe `targetTop`).
 */
export function useScrollSpy<K extends string>(
  sections: ScrollSpySection<K>[],
  detectionOffset: number,
) {
  const [activeSection, setActiveSection] = useState<K | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrollingProgrammatically = useRef(false);
  const cancelScrollRef = useRef<(() => void) | null>(null);

  // Toujours lire les refs de sections courantes sans relancer l'effet.
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.body.scrollTop || 0;
      setIsScrolled(scrollTop > 100);

      // Détection suspendue pendant un défilement programmatique
      if (isScrollingProgrammatically.current) return;

      const scrollPosition = scrollTop + detectionOffset;
      const tops = sectionsRef.current
        .filter((section) => section.ref.current !== null)
        .map((section) => ({
          key: section.key,
          top: (section.ref.current as HTMLElement).offsetTop,
        }));

      setActiveSection(resolveActiveSection(tops, scrollPosition));
    };

    document.body.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // position initiale

    return () => {
      document.body.removeEventListener('scroll', handleScroll);
      // Stoppe une éventuelle animation de scroll en cours
      cancelScrollRef.current?.();
    };
  }, [detectionOffset]);

  const scrollToSection = useCallback((key: K, targetTop: number) => {
    setActiveSection(key);
    isScrollingProgrammatically.current = true;

    cancelScrollRef.current?.();
    cancelScrollRef.current = scrollBodyTo(targetTop, 800, () => {
      // Réactive la détection automatique une fois le scroll terminé
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 100);
    });
  }, []);

  return { activeSection, isScrolled, scrollToSection };
}
