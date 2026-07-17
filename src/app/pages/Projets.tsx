import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import ContactFooter from '../components/ContactFooter';
import NewProjectCard from '../components/common/NewProjectCard';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import { tousProjets } from '../data/projetsData';
import { usePageTransition } from '../context/PageTransitionContext';
import {
  prefersReducedProjectMotion,
  roundTransitionRect,
} from '../utils/projectTransition';

export default function Projets() {
  const location = useLocation();
  const { snapshot, isTransitioning, beginReverse, clearTransition } =
    usePageTransition();
  const cardRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});
  const [isReturnVisit] = useState(
    () =>
      snapshot?.originPath === '/projets' && location.pathname === '/projets',
  );
  const [reduceReturnMotion] = useState(() => prefersReducedProjectMotion());
  const shouldStartReverse =
    isReturnVisit && !isTransitioning && snapshot !== null;

  useLayoutEffect(() => {
    if (!shouldStartReverse || !snapshot) return;

    document.body.scrollTop = snapshot.scrollTop;

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
      initial={
        isReturnVisit && !reduceReturnMotion ? { opacity: 0 } : false
      }
      animate={{ opacity: 1 }}
      transition={{
        duration: isReturnVisit && !reduceReturnMotion ? 0.2 : 0,
      }}
    >
      {/* Projets Content */}
      <section style={{ paddingTop: 'var(--page-padding-top)' }} className="pb-32">
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
                  letterSpacing: '0.5px'
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
                  color: 'var(--portfolio-text-primary)'
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
