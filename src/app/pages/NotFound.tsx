import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Home } from 'lucide-react';
import { useState } from 'react';
import PageMeta from '../components/PageMeta';
import RollingText from '../components/RollingText';
import { ROUTES } from '../config';

/**
 * Page 404 alignée sur la direction artistique du site (tokens
 * `--portfolio-*`, typo Manrope, thème clair/sombre) : chiffre géant estompé
 * en écho au « CONTACT » du footer, message et CTAs aux styles maison.
 */
export default function NotFound() {
  const shouldReduceMotion = useReducedMotion();
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isHomeHovered, setIsHomeHovered] = useState(false);

  const reveal = (delay: number) =>
    shouldReduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.7,
            delay,
            ease: [0.25, 0.1, 0.25, 1] as const,
          },
        };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-6"
      style={{
        backgroundColor: 'var(--portfolio-bg)',
        color: 'var(--portfolio-text-primary)',
      }}
    >
      <PageMeta
        title="Page introuvable — Alexis Kabiche"
        description="Cette page n'existe pas ou a été déplacée."
        path="/404"
      />

      {/* Chiffre géant estompé en arrière-plan (motif du footer « CONTACT ») */}
      <motion.p
        aria-hidden="true"
        className="pointer-events-none absolute select-none whitespace-nowrap"
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(220px, 42vw, 640px)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: 'var(--portfolio-text-large)',
          opacity: 0.05,
        }}
        initial={
          shouldReduceMotion
            ? { opacity: 0.05 }
            : { filter: 'blur(24px)', opacity: 0 }
        }
        animate={{ filter: 'blur(0px)', opacity: 0.05 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        404
      </motion.p>

      {/* Contenu */}
      <div className="relative z-10 text-center max-w-xl">
        <motion.p
          {...reveal(0)}
          className="mb-4 text-sm uppercase tracking-[0.2em]"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 500,
            color: 'var(--portfolio-text-muted)',
          }}
        >
          Erreur 404
        </motion.p>

        <motion.h1
          {...reveal(0.08)}
          className="mb-5 text-4xl md:text-5xl"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          Page introuvable
        </motion.h1>

        <motion.p
          {...reveal(0.16)}
          className="mx-auto mb-10 max-w-md text-base md:text-lg"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--portfolio-text-secondary)',
          }}
        >
          La page que vous recherchez n'existe pas ou a été déplacée.
        </motion.p>

        <motion.div
          {...reveal(0.24)}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 px-6 py-3 transition-colors duration-300 cursor-pointer"
            style={{
              backgroundColor: isHomeHovered
                ? 'var(--portfolio-button-bg-hover)'
                : 'var(--portfolio-button-bg)',
              color: 'var(--portfolio-button-text)',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '5px',
            }}
            onMouseEnter={() => setIsHomeHovered(true)}
            onMouseLeave={() => setIsHomeHovered(false)}
            onFocus={() => setIsHomeHovered(true)}
            onBlur={() => setIsHomeHovered(false)}
            data-cursor="hover"
          >
            <Home size={18} />
            <RollingText
              text="Retour à l'accueil"
              inView={isHomeHovered}
              transition={{ duration: 0.3, delay: 0.02, ease: 'easeOut' }}
            />
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 transition-colors duration-300 cursor-pointer"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--portfolio-text-primary)',
              border: '1px solid var(--portfolio-card-border)',
              borderColor: isBackHovered
                ? 'var(--portfolio-card-focus)'
                : 'var(--portfolio-card-border)',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '5px',
            }}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            onFocus={() => setIsBackHovered(true)}
            onBlur={() => setIsBackHovered(false)}
            data-cursor="hover"
          >
            <ArrowLeft size={18} />
            Page précédente
          </button>
        </motion.div>
      </div>
    </div>
  );
}
