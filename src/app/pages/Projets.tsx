import './Projets.css';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import ContactFooter from '../components/ContactFooter';
import FilterBar from '../components/common/FilterBar';
import ProjetTile from '../components/common/ProjetTile';
import PageMeta from '../components/PageMeta';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import { getTousProjets } from '../data/projetsData';
import { ROUTES } from '../config';
import { ROUTE_META } from '../config/seo';
import { useLang, useT } from '../i18n';
import { usePageTransition } from '../context/PageTransitionContext';
import { filterProjets, type FilterValue } from '../utils/filterProjets';

const STRINGS = {
  fr: { eyebrow: 'Mes travaux', title: 'Projets' },
  en: { eyebrow: 'My work', title: 'Projects' },
};
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
  const t = useT(STRINGS);
  const { lang } = useLang();
  const tousProjets = getTousProjets(lang);
  const location = useLocation();
  const { snapshot, direction, beginReverse, clearTransition } =
    usePageTransition();
  const cardRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});
  const [filter, setFilter] = useState<FilterValue>('all');
  const visibles = filterProjets(tousProjets, filter);
  const [isReturnVisit] = useState(
    () =>
      snapshot?.originPath === '/projets' && location.pathname === '/projets',
  );
  const [reduceReturnMotion] = useState(() => prefersReducedProjectMotion());
  // Figés au montage : l'animation de retour ne concerne que l'état présent
  // à l'arrivée sur la page. Sans cela, un clic de carte depuis une liste
  // « de retour » (beginForward → nouveau snapshot) relançait cet effet, qui
  // écrasait l'aller par un reverse (image plein écran repliée sur la carte).
  const [mountSnapshot] = useState(() => snapshot);
  const [mountDirection] = useState(() => direction);
  const shouldStartReverse =
    isReturnVisit && mountSnapshot !== null && mountDirection !== 'reverse';

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

  // Animation de retour (morph) — le scroll est déjà restauré ci-dessus.
  // Ne dépend que de valeurs figées au montage : s'exécute une seule fois.
  useLayoutEffect(() => {
    if (!shouldStartReverse || !mountSnapshot) return;

    if (reduceReturnMotion) {
      clearTransition();
      return;
    }

    const image = cardRefs.current[mountSnapshot.projectLink];
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
    mountSnapshot,
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
      <PageMeta {...ROUTE_META[ROUTES.PROJETS]} />
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
                {t.eyebrow}
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
                {t.title}
              </h1>
            </ScrollRevealTitle>
          </div>

          {/* Filtre par discipline */}
          <FilterBar value={filter} onChange={setFilter} />

          {/* Mosaïque des projets */}
          <motion.div layout={!reduceReturnMotion} className="projets-mosaic">
            <AnimatePresence mode="popLayout">
              {visibles.map((projet, index) => (
                <motion.div
                  key={projet.link}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{
                    duration: reduceReturnMotion ? 0 : 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`mosaic-cell cell-${projet.tileSize}`}
                >
                  <ProjetTile
                    link={projet.link}
                    title={projet.text}
                    category={projet.category}
                    image={projet.image}
                    tileSize={projet.tileSize}
                    priority={index < 2}
                    ref={(imageElement) => {
                      cardRefs.current[projet.link] = imageElement;
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Contact Footer */}
      <ContactFooter />
    </motion.div>
  );
}
