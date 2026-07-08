import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const WORDMARK = 'ALEXIS KABICHE';

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  // Respect de la préférence d'accessibilité (mouvement réduit)
  const prefersReduced = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Le wordmark quitte l'écran juste avant le rideau
  const [wordOut, setWordOut] = useState(false);

  // Suivre les changements de thème (sombre/clair) pendant le splash
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Orchestration de la timeline
  useEffect(() => {
    const HOLD_UNTIL = prefersReduced ? 500 : 1500; // début de sortie du wordmark
    const COMPLETE_AT = prefersReduced ? 780 : 1880; // début du rideau
    const t1 = setTimeout(() => setWordOut(true), HOLD_UNTIL);
    const t2 = setTimeout(() => onComplete(), COMPLETE_AT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete, prefersReduced]);

  // Couleurs selon le thème (identiques à l'ancien loader)
  const panelBg = isDarkMode ? '#121312' : '#EAEAEA';
  const textColor = isDarkMode ? '#EAEAEA' : '#151615';

  const words = WORDMARK.split(' ');
  let letterIndex = 0;

  // Sortie de l'overlay : rideau vers le haut (ou simple fondu si mouvement réduit)
  const exitAnim = prefersReduced ? { opacity: 0 } : { y: '-100%' };
  const exitTransition = prefersReduced
    ? { duration: 0.35, ease: 'easeInOut' as const }
    : { duration: 0.8, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] };

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-6"
      style={{ backgroundColor: panelBg }}
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ ...exitAnim, transition: exitTransition }}
    >
      <motion.div
        className="flex flex-col items-center"
        animate={wordOut ? { opacity: 0, y: -14 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Wordmark « ALEXIS KABICHE » — révélation lettre par lettre via masque */}
        <div
          className="flex flex-wrap justify-center"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(26px, 6vw, 64px)',
            letterSpacing: '0.15em',
            lineHeight: 1.15,
            color: textColor,
            columnGap: '0.32em',
          }}
          aria-label="Alexis Kabiche"
        >
          {words.map((word, wi) => (
            <span key={wi} className="flex" style={{ whiteSpace: 'nowrap' }}>
              {word.split('').map((ch) => {
                const i = letterIndex++;
                return (
                  <span
                    key={i}
                    aria-hidden="true"
                    style={{ display: 'inline-block', overflow: 'hidden', lineHeight: 1.15 }}
                  >
                    <motion.span
                      style={{ display: 'inline-block' }}
                      initial={prefersReduced ? { y: 0, opacity: 0 } : { y: '115%' }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={
                        prefersReduced
                          ? { duration: 0.2, delay: i * 0.01 }
                          : { duration: 0.6, delay: 0.12 + i * 0.04, ease: [0.16, 1, 0.3, 1] }
                      }
                    >
                      {ch}
                    </motion.span>
                  </span>
                );
              })}
            </span>
          ))}
        </div>

        {/* Fine ligne tracée de gauche à droite */}
        <motion.div
          style={{
            marginTop: 'clamp(14px, 1.8vw, 24px)',
            height: '1px',
            width: 'clamp(120px, 22vw, 240px)',
            backgroundColor: textColor,
            opacity: 0.35,
            transformOrigin: 'left center',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={
            prefersReduced
              ? { duration: 0.2, delay: 0.1 }
              : { duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </motion.div>
    </motion.div>
  );
}
