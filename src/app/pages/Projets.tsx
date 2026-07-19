import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import ContactFooter from '../components/ContactFooter';
import NewProjectCard from '../components/common/NewProjectCard';
import PageMeta from '../components/PageMeta';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import { tousProjets } from '../data/projetsData';
import { usePageTransition } from '../context/PageTransitionContext';
import {
  prefersReducedProjectMotion,
  roundTransitionRect,
} from '../utils/projectTransition';
import {
  resolveInitialProjetsScroll,
  saveProjetsScroll,
} from '../utils/projetsScroll';
import { preloadProjetDetail } from './preloadProjetDetail';

export default function Projets() {
  const location = useLocation();
  const { snapshot, direction, beginReverse, clearTransition } =
    usePageTransition();
  const cardRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});
  const [isReturnVisit] = useState(
    () =>
      snapshot?.originPath === '/projets' && location.pathname === '/projets',
  );
  const [reduceReturnMotion] = useState(() => prefersReducedProjectMotion());
  const shouldStartReverse =
    isReturnVisit && snapshot !== null && direction !== 'reverse';

  // Position de la liste à restaurer, figée au montage. On n'utilise le
  // scrollTop du snapshot que s'il provient bien de la liste ; sinon (ex.
  // projet → autre projet → liste, où le snapshot vient d'une page détail)
  // on s'appuie sur la mémoire dédiée à la liste.
  const initialScrollRef = useRef(resolveInitialProjetsScroll(snapshot));

  // Restaure la position au montage (avant peinture, avant l'éventuel morph)
  useLayoutEffect(() => {
    document.body.scrollTop = initialScrollRef.current;
  }, []);

  // Mémorise la position pendant le défilement (pour un retour ultérieur)
  useEffect(() => {
    const onScroll = () => saveProjetsScroll(document.body.scrollTop);
    document.body.addEventListener('scroll', onScroll, { passive: true });
    return () => document.body.removeEventListener('scroll', onScroll);
  }, []);

  // Précharge le chunk de la page détail en tâche de fond : la transition
  // « morph » ne doit jamais attendre le réseau au moment du clic.
  useEffect(() => {
    const timer = setTimeout(preloadProjetDetail, 300);
    return () => clearTimeout(timer);
  }, []);

  // Animation de retour (morph) — le scroll est déjà restauré ci-dessus
  useLayoutEffect(() => {
    if (!shouldStartReverse || !snapshot) return;

    if (reduceReturnMotion) {
      clearTransition();
      return;
    }

    const image = cardRefs.current[snapshot.projectLink];
    if (!image) {
      clearTransition();
      return;
    }

    beginReverse(roundTransitionRect(image.getBoundingClientRect()));
  }, [
    beginReverse,
    clearTransition,
    reduceReturnMotion,
    shouldStartReverse,
    snapshot,
  ]);

  return (
    <motion.div
      className="relative min-h-screen projets-page"
      style={{ backgroundColor: 'var(--portfolio-bg)' }}
      initial={isReturnVisit && !reduceReturnMotion ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{
        duration: isReturnVisit && !reduceReturnMotion ? 0.2 : 0,
      }}
    >
      <PageMeta
        title="Projets — Alexis Kabiche"
        description="Tous les projets UX/UI d'Alexis Kabiche : applications métier, refontes, design systems et identité de marque."
        path="/projets"
      />
      {/* Projets Content */}
      <section
        style={{ paddingTop: 'var(--page-padding-top)' }}
        className="pb-32"
      >
        <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
          {/* Header */}
          <div className="mb-12">
            <ScrollRevealTitle delay={0}>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(0.8125rem, 0.75rem + 0.3125vw, 0.9375rem)',
                  lineHeight: '1.6',
                  color: 'var(--portfolio-text-secondary)',
                  marginBottom: '0px',
                  letterSpacing: '0.5px',
                }}
              >
                Mes travaux
              </p>
            </ScrollRevealTitle>
            <ScrollRevealTitle delay={0.05}>
              <h1
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 1rem + 5vw, 3rem)',
                  lineHeight: '1.1',
                  letterSpacing: '-1.4px',
                  color: 'var(--portfolio-text-primary)',
                }}
              >
                Projets
              </h1>
            </ScrollRevealTitle>
          </div>

          {/* Tous les projets - List simple */}
          <div className="space-y-6">
            {tousProjets.map((projet, index) => (
              <ScrollFadeIn
                key={projet.link}
                delay={Math.min(0.025 + index * 0.025, 0.1)}
                amount={0.15}
                margin="0px 0px 10% 0px"
                disabled={isReturnVisit}
              >
                <NewProjectCard
                  link={projet.link}
                  number={projet.number}
                  title={projet.text}
                  description={projet.description}
                  tags={projet.tags}
                  image={projet.image}
                  priority={index < 2}
                  ref={(imageElement) => {
                    cardRefs.current[projet.link] = imageElement;
                  }}
                />
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <ContactFooter />
    </motion.div>
  );
}
