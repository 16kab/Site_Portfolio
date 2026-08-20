import './Projets.css';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  HeroCarousel,
  type HeroCarouselItem,
  type HeroCarouselRect,
} from '../components/common/HeroCarousel';
import PageMeta from '../components/PageMeta';
import { getTousProjets } from '../data/projetsData';
import { ROUTES } from '../config';
import { ROUTE_META } from '../config/seo';
import { useLang, useT } from '../i18n';
import { usePageTransition } from '../context/PageTransitionContext';
import {
  getProjectTransitionTiming,
  prefersReducedProjectMotion,
  roundTransitionRect,
} from '../utils/projectTransition';
import {
  resolveInitialProjetsScroll,
  saveProjetsScroll,
} from '../utils/projetsScroll';
import { preloadProjetDetail } from './preloadProjetDetail';

// Titres COURTS pour le hero-carousel (format « héro » : punchy, sur 1-2 lignes
// via \n). Les titres complets restent sur les pages détail. Clés = id projet.
const SHORT_FR: Record<string, string> = {
  mauni: 'Mauni',
  'onboarding-rh': 'Onboarding\nRH',
  syma: 'SYMA',
  trackit: 'TrackIt',
  'parcours-spvieassurances': 'Parcours\nSPVIE',
  'crm-bigbroker': 'CRM\nBigBroker',
  agpt: 'Agir Pour\nToutes',
  'refonte-spvie': 'Refonte\nSPVIE',
  'charte-spvie': 'Charte\nSPVIE',
  'mobile-cgrm': 'App\nCGRM',
};
const SHORT_EN: Record<string, string> = {
  ...SHORT_FR,
  'onboarding-rh': 'HR\nOnboarding',
};

const STRINGS = {
  fr: { cta: 'Voir le projet', cat: { mobile: 'MOBILE', web: 'WEB', branding: 'BRANDING' }, short: SHORT_FR },
  en: { cta: 'View project', cat: { mobile: 'MOBILE', web: 'WEB', branding: 'BRANDING' }, short: SHORT_EN },
};

export default function Projets() {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const tousProjets = getTousProjets(lang);
  const location = useLocation();
  const navigate = useNavigate();
  const { snapshot, direction, captureSnapshot, beginForward, beginReverse, clearTransition, isTransitioning } =
    usePageTransition();

  const items: HeroCarouselItem[] = tousProjets.map((p) => ({
    id: p.link,
    title: t.short[p.id] ?? p.text,
    image: p.image,
    credit: t.cat[p.category],
    meta: [p.year],
    accent: p.accent,
  }));

  const [isReturnVisit] = useState(
    () => snapshot?.originPath === '/projets' && location.pathname === '/projets',
  );
  const [reduceReturnMotion] = useState(() => prefersReducedProjectMotion());
  const [mountSnapshot] = useState(() => snapshot);
  const [mountDirection] = useState(() => direction);
  const shouldStartReverse =
    isReturnVisit && mountSnapshot !== null && mountDirection !== 'reverse';

  // Index de départ = carte du projet d'origine si retour, sinon 0.
  const returnIndex = mountSnapshot
    ? Math.max(0, tousProjets.findIndex((p) => p.link === mountSnapshot.projectLink))
    : 0;
  const [index, setIndex] = useState(isReturnVisit ? returnIndex : 0);
  const reverseStartedRef = useRef(false);
  const activatePendingRef = useRef(false);

  const initialScrollRef = useRef(resolveInitialProjetsScroll(snapshot));
  useLayoutEffect(() => {
    document.body.scrollTop = initialScrollRef.current;
  }, []);

  useEffect(() => {
    const onScroll = () => saveProjetsScroll(document.body.scrollTop);
    document.body.addEventListener('scroll', onScroll, { passive: true });
    return () => document.body.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(preloadProjetDetail, 300);
    return () => clearTimeout(timer);
  }, []);

  // Morph aller : clic sur la carte focus du HeroCarousel (ou cue CTA).
  // Double garde-fou contre un second déclenchement (double-clic/Entrée
  // rapide) : `isTransitioning` (état du contexte, retardé d'un rendu) ET
  // `activatePendingRef` (synchrone, vrai dès le premier appel — jamais
  // réinitialisé, on navigue de toute façon hors de la page).
  const handleActivate = (i: number, img: HTMLImageElement | null) => {
    if (activatePendingRef.current || isTransitioning) return;
    const projet = tousProjets[i];
    if (!projet || !img) return;
    activatePendingRef.current = true;
    const nextSnapshot = {
      imageSrc: projet.image,
      imageRect: roundTransitionRect(img.getBoundingClientRect()),
      projectLink: projet.link,
      originPath: location.pathname,
      scrollTop: document.body.scrollTop,
    };
    if (prefersReducedProjectMotion()) {
      captureSnapshot(nextSnapshot);
      navigate(projet.link);
      return;
    }
    const timing = getProjectTransitionTiming(window.innerWidth, 'forward');
    beginForward(nextSnapshot);
    window.setTimeout(() => navigate(projet.link), timing.navigateDelay);
  };

  // Morph retour : le HeroCarousel remonte (avant peinture) le rect calculé de
  // la carte focus (celle du projet d'origine). On lance le reverse dessus.
  const handleFocusedRectChange = (rect: HeroCarouselRect | null) => {
    if (!shouldStartReverse || reverseStartedRef.current || !mountSnapshot) return;
    if (rect == null || tousProjets[index]?.link !== mountSnapshot.projectLink) return;
    reverseStartedRef.current = true;
    if (reduceReturnMotion) {
      clearTransition();
      return;
    }
    beginReverse(roundTransitionRect(rect));
  };

  // Filet de sécurité : si l'image de la carte focus n'arrive jamais.
  useLayoutEffect(() => {
    if (!shouldStartReverse) return;
    const id = window.setTimeout(() => {
      if (!reverseStartedRef.current) {
        reverseStartedRef.current = true;
        clearTransition();
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [shouldStartReverse, clearTransition]);

  return (
    <div className="projets-page" style={{ backgroundColor: 'var(--portfolio-bg)' }}>
      <PageMeta {...ROUTE_META[ROUTES.PROJETS]} />
      <div className="projets-carousel-stage">
        <HeroCarousel
          items={items}
          index={index}
          onIndexChange={setIndex}
          onItemActivate={handleActivate}
          onFocusedRectChange={handleFocusedRectChange}
          ctaLabel={t.cta}
        />
      </div>
    </div>
  );
}
