import { motion } from 'motion/react';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import ScrollFadeIn from '../components/ScrollFadeIn';
import { useState, useRef, useEffect } from 'react';
import ContactFooter from '../components/ContactFooter';
import RollingText from '../components/RollingText';
import PageMeta from '../components/PageMeta';
import { ROUTES } from '../config';
import { ROUTE_META } from '../config/seo';
import { useLang, useT } from '../i18n';
import { useScrollSpy } from '../hooks';
import { CardCarousel, InfoCard } from '../components/common/CardCarousel';
import { Lightbulb, Compass, Users, FileText } from 'lucide-react';

interface ExpertiseSection {
  number: string;
  title: string;
  description: string;
  badges: string[];
}

interface PrincipleCard {
  number: string;
  title: string;
  description: string;
}

interface EnvironmentCard {
  number: string;
  title: string;
  description: string;
}

const expertiseSections: ExpertiseSection[] = [
  {
    number: '001',
    title: 'UX & Product Design',
    description:
      "Transformer des problématiques floues en interfaces claires et structurées. Intervention sur l'ensemble du cycle produit, de la phase de découverte aux interactions finalisées, avec une attention constante portée aux usages réels.",
    badges: [
      'Conception produit de bout en bout',
      'Workflows complexes',
      'Multi-plateforme',
      "Design d'interaction",
      'Prototypage',
      'Parcours utilisateurs',
    ],
  },
  {
    number: '002',
    title: 'Brand & Visual Design',
    description:
      "Construire et faire évoluer des identités visuelles cohérentes, pensées pour s'intégrer dans des environnements produits. L'objectif n'est pas uniquement esthétique, mais d'assurer lisibilité, différenciation et continuité sur l'ensemble des points de contact.",
    badges: [
      'Direction artistique',
      'Identité de marque',
      'Charte graphique',
      'Systèmes visuels',
      'Déclinaison multi-supports',
    ],
  },
  {
    number: '003',
    title: "Workflows augmentés par l'IA",
    description:
      "Intégrer l'IA comme un outil au service de la réflexion, et non comme une finalité. Elle intervient pour accélérer l'exploration, structurer les idées, identifier des patterns ou challenger des hypothèses, tout en laissant la prise de décision ancrée dans une logique humaine et contextualisée.",
    badges: [
      'Outils assistés par IA',
      "Aide à la structuration et à l'exploration",
      'Détection de patterns',
      'Support à la réflexion et à la décision',
      'Interaction humain–IA',
    ],
  },
  {
    number: '004',
    title: 'Design Systems & Ops',
    description:
      'Mettre en place les fondations qui rendent le design fiable et reproductible. Bibliothèques de composants, architecture de tokens, modèles de gouvernance — des éléments structurants qui optimisent durablement les processus.',
    badges: [
      'Architecture de composants',
      'Design tokens',
      'Gouvernance',
      'Modèles de contribution',
      'Organisation des équipes',
      'Documentation',
    ],
  },
  {
    number: '005',
    title: 'Recherche & Stratégie',
    description:
      "Prendre des décisions basées sur des données et des observations, plutôt que sur l'intuition. Transformer des signaux qualitatifs et quantitatifs en orientations exploitables.",
    badges: [
      'Recherche utilisateur',
      'Synthèse',
      "Architecture de l'information",
      'Stratégie produit',
      'Décisions pilotées par la donnée',
      'Alignement des parties prenantes',
    ],
  },
];

const principlesData: PrincipleCard[] = [
  {
    number: '001',
    title: 'Moins, mais mieux',
    description:
      "Éliminer le superflu pour ne conserver que l'essentiel. Chaque élément doit être justifié par sa fonction, pas par son apparence.",
  },
  {
    number: '002',
    title: "Priorité à l'usage",
    description:
      "Les décisions partent de situations réelles et de besoins concrets. L'empathie n'est pas une étape, c'est un socle.",
  },
  {
    number: '003',
    title: 'Efficacité structurée',
    description:
      "S'appuyer sur des systèmes scalables, des composants réutilisables et de l'automatisation lorsque c'est pertinent. L'efficacité traduit une bonne utilisation des ressources, pas un raccourci.",
  },
  {
    number: '004',
    title: 'Clarté dans les échanges',
    description:
      "Un design pertinent doit pouvoir être expliqué. La qualité du raisonnement et sa transmission sont aussi importantes que l'exécution visuelle.",
  },
];

const environmentData: EnvironmentCard[] = [
  {
    number: '001',
    title: 'Impact plutôt que production',
    description:
      'Je cherche à travailler sur des sujets qui comptent réellement. Des équipes où les décisions design répondent à de vrais problèmes et sont évaluées sur des résultats concrets, pas sur un volume de livrables.',
  },
  {
    number: '002',
    title: 'Collaboration réelle',
    description:
      "Un fonctionnement transverse où design, produit et technique avancent en partenaires, sur un pied d'égalité. Pas des passations, mais des échanges continus.",
  },
  {
    number: '003',
    title: 'Maturité design',
    description:
      "Des organisations qui considèrent le design comme un levier stratégique, intégré aux décisions, et non comme une simple couche d'exécution.",
  },
  {
    number: '004',
    title: 'Problématiques complexes',
    description:
      'Un intérêt pour les environnements structurants où la complexité rend le travail de conception plus pertinent.',
  },
  {
    number: '005',
    title: "Cadre d'évolution",
    description:
      "Des contextes qui encouragent l'expérimentation, l'apprentissage continu et l'exploration de nouvelles approches (IA, design systémique, nouvelles méthodes).",
  },
  {
    number: '006',
    title: 'Culture centrée humain',
    description:
      "Des équipes qui appliquent en interne les principes qu'elles défendent : confiance, transparence et conditions favorisant des échanges sains et efficaces.",
  },
];

// ─ Traductions anglaises (le FR ci-dessus reste canonique) ─────────────
const expertiseSectionsEn: ExpertiseSection[] = [
  {
    number: '001',
    title: 'UX & Product Design',
    description:
      'Turning fuzzy problems into clear, structured interfaces. Involvement across the whole product cycle, from the discovery phase to finalised interactions, with constant attention to real-world usage.',
    badges: [
      'End-to-end product design',
      'Complex workflows',
      'Multi-platform',
      'Interaction design',
      'Prototyping',
      'User journeys',
    ],
  },
  {
    number: '002',
    title: 'Brand & Visual Design',
    description:
      'Building and evolving consistent visual identities, designed to fit within product environments. The goal is not purely aesthetic, but to ensure readability, differentiation and continuity across every touchpoint.',
    badges: [
      'Art direction',
      'Brand identity',
      'Brand guidelines',
      'Visual systems',
      'Multi-medium adaptation',
    ],
  },
  {
    number: '003',
    title: 'AI-augmented workflows',
    description:
      'Bringing AI in as a tool that serves thinking, not as an end in itself. It helps speed up exploration, structure ideas, spot patterns or challenge assumptions, while keeping decision-making grounded in human, contextual reasoning.',
    badges: [
      'AI-assisted tools',
      'Support for structuring and exploration',
      'Pattern detection',
      'Support for reasoning and decisions',
      'Human–AI interaction',
    ],
  },
  {
    number: '004',
    title: 'Design Systems & Ops',
    description:
      'Putting in place the foundations that make design reliable and repeatable. Component libraries, token architecture, governance models — structuring elements that improve processes over the long term.',
    badges: [
      'Component architecture',
      'Design tokens',
      'Governance',
      'Contribution models',
      'Team organisation',
      'Documentation',
    ],
  },
  {
    number: '005',
    title: 'Research & Strategy',
    description:
      'Making decisions based on data and observation rather than intuition. Turning qualitative and quantitative signals into actionable direction.',
    badges: [
      'User research',
      'Synthesis',
      'Information architecture',
      'Product strategy',
      'Data-driven decisions',
      'Stakeholder alignment',
    ],
  },
];

const principlesDataEn: PrincipleCard[] = [
  {
    number: '001',
    title: 'Less, but better',
    description:
      'Cutting the superfluous to keep only the essential. Every element must be justified by its function, not its appearance.',
  },
  {
    number: '002',
    title: 'Usage first',
    description:
      'Decisions start from real situations and concrete needs. Empathy is not a step, it is a foundation.',
  },
  {
    number: '003',
    title: 'Structured efficiency',
    description:
      'Relying on scalable systems, reusable components and automation where relevant. Efficiency reflects a good use of resources, not a shortcut.',
  },
  {
    number: '004',
    title: 'Clarity in exchanges',
    description:
      'Relevant design must be explainable. The quality of the reasoning and how it is conveyed matter as much as the visual execution.',
  },
];

const environmentDataEn: EnvironmentCard[] = [
  {
    number: '001',
    title: 'Impact over output',
    description:
      'I seek to work on things that genuinely matter. Teams where design decisions address real problems and are measured on concrete outcomes, not on a volume of deliverables.',
  },
  {
    number: '002',
    title: 'Real collaboration',
    description:
      'A cross-functional way of working where design, product and engineering move forward as equal partners. Not handoffs, but continuous exchange.',
  },
  {
    number: '003',
    title: 'Design maturity',
    description:
      'Organisations that treat design as a strategic lever, embedded in decisions, rather than a mere execution layer.',
  },
  {
    number: '004',
    title: 'Complex problems',
    description:
      'An interest in structuring environments where complexity makes design work more meaningful.',
  },
  {
    number: '005',
    title: 'Room to grow',
    description:
      'Contexts that encourage experimentation, continuous learning and the exploration of new approaches (AI, systemic design, new methods).',
  },
  {
    number: '006',
    title: 'Human-centred culture',
    description:
      'Teams that apply internally the principles they advocate: trust, transparency and conditions that foster healthy, effective exchanges.',
  },
];

const STRINGS = {
  fr: {
    switchExpertises: 'Expertises',
    switchPrincipes: 'Principes',
    switchEnvironnement: 'Environnement',
    ariaExpertises: 'Aller à la section Expertises',
    ariaPrincipes: 'Aller à la section Principes',
    ariaEnvironnement: 'Aller à la section Environnement',
    heroEyebrow: "Ma façon d'être",
    heroTitle: 'À propos',
    philosophieHeading: 'Philosophie',
    philosophieP1:
      "Un bon design doit fonctionner de manière autonome au sein de l'entreprise. L'objectif est de construire des solutions que les équipes peuvent s'approprier, maintenir et faire évoluer dans la durée, indépendamment des personnes qui les ont conçues. La plupart des problèmes ne sont pas visuels, ils sont structurels. Le design ne corrige pas une réflexion insuffisante sur ce que le produit doit réellement accomplir.",
    philosophieP2:
      "Le design doit s'effacer au profit de l'usage. Il anticipe les réalités internes : évolution des priorités, contraintes budgétaires, changements d'organisation. S'il dépend en permanence d'un soutien externe ou d'un expert pour fonctionner, alors il n'est pas robuste. Un design pertinent est celui qui s'intègre durablement dans les processus et continue de produire de la valeur sans dépendance.",
    cvButton: 'Voir le Curriculum Vitae',
    expertiseEyebrow: 'Expertises',
    expertiseTitle: 'Ce que je sais faire',
    principesEyebrow: 'Principes et valeurs',
    principesTitle: 'Ce qui guide mon travail',
    envEyebrow: 'Le bon environnement fait la différence',
    envTitle: 'Ce que je recherche',
    carouselPrincipes: 'Principes',
    carouselEnvironnement: 'Environnement',
  },
  en: {
    switchExpertises: 'Expertise',
    switchPrincipes: 'Principles',
    switchEnvironnement: 'Environment',
    ariaExpertises: 'Go to the Expertise section',
    ariaPrincipes: 'Go to the Principles section',
    ariaEnvironnement: 'Go to the Environment section',
    heroEyebrow: 'How I work',
    heroTitle: 'About',
    philosophieHeading: 'Philosophy',
    philosophieP1:
      'Good design should work on its own within the company. The goal is to build solutions that teams can own, maintain and evolve over time, independently of the people who designed them. Most problems are not visual, they are structural. Design does not fix insufficient thinking about what the product should actually achieve.',
    philosophieP2:
      'Design should step back in favour of usage. It anticipates internal realities: shifting priorities, budget constraints, organisational change. If it constantly depends on external support or an expert to function, then it is not robust. Relevant design is the kind that integrates durably into processes and keeps producing value without dependency.',
    cvButton: 'View resume',
    expertiseEyebrow: 'Expertise',
    expertiseTitle: 'What I do',
    principesEyebrow: 'Principles and values',
    principesTitle: 'What guides my work',
    envEyebrow: 'The right environment makes the difference',
    envTitle: "What I'm looking for",
    carouselPrincipes: 'Principles',
    carouselEnvironnement: 'Environment',
  },
};

export default function APropos() {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const expertiseSectionsL =
    lang === 'fr' ? expertiseSections : expertiseSectionsEn;
  const principlesDataL = lang === 'fr' ? principlesData : principlesDataEn;
  const environmentDataL = lang === 'fr' ? environmentData : environmentDataEn;
  const [isCVHovered, setIsCVHovered] = useState(false);

  const expertisesRef = useRef<HTMLDivElement>(null);
  const principesRef = useRef<HTMLDivElement>(null);
  const environnementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top on mount - body is the scrolling element
    document.body.scrollTop = 0;
  }, []);

  // Menu sticky à détection de section (voir aussi la page Détail projet)
  const {
    activeSection,
    isScrolled,
    scrollToSection: scrollSpyTo,
  } = useScrollSpy<'expertises' | 'principes' | 'environnement'>(
    [
      { key: 'expertises', ref: expertisesRef },
      { key: 'principes', ref: principesRef },
      { key: 'environnement', ref: environnementRef },
    ],
    250,
  );

  // Scroll to section : offset de 140 px, cible relative au conteneur de scroll
  const scrollToSection = (
    section: 'expertises' | 'principes' | 'environnement',
  ) => {
    const ref =
      section === 'expertises'
        ? expertisesRef
        : section === 'principes'
          ? principesRef
          : environnementRef;
    if (!ref.current) return;
    const targetTop =
      ref.current.getBoundingClientRect().top +
      (document.body.scrollTop || 0) -
      140;
    scrollSpyTo(section, targetTop);
  };

  return (
    <div
      className="relative min-h-screen apropos-page"
      style={{ backgroundColor: 'var(--portfolio-bg)' }}
    >
      <PageMeta {...ROUTE_META[ROUTES.APROPOS]} />
      {/* Fixed Switch Menu - Bottom Right on desktop, Bottom Center on mobile */}
      <div
        className="fixed z-[199] left-0 right-0 md:top-[112px] md:bottom-auto"
        style={{
          bottom: '1.5rem',
          pointerEvents: 'none',
        }}
      >
        <div className="max-w-[1920px] mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 flex justify-center md:justify-end">
          <div
            className="relative inline-flex gap-2 p-2 transition-all duration-300"
            style={{
              backgroundColor: isScrolled
                ? 'var(--switch-bg-scrolled)'
                : 'var(--switch-bg-default)',
              borderRadius: '8px',
              border: `1px solid ${isScrolled ? 'var(--switch-border-scrolled)' : 'var(--switch-border-default)'}`,
              pointerEvents: 'auto',
            }}
          >
            {/* Sliding Background */}
            <motion.div
              className="hidden md:block absolute rounded-md"
              initial={false}
              style={{
                backgroundColor: isScrolled
                  ? 'var(--switch-active-bg-scrolled)'
                  : 'var(--switch-active-bg-default)',
                zIndex: 0,
              }}
              animate={{
                top: '8px',
                bottom: '8px',
                left: activeSection === 'expertises' ? '8px' : undefined,
                width:
                  activeSection === 'expertises'
                    ? '136px'
                    : activeSection === 'principes'
                      ? '120px'
                      : '160px',
                x:
                  activeSection === 'expertises'
                    ? 0
                    : activeSection === 'principes'
                      ? 'calc(136px + 8px)'
                      : 'calc(136px + 120px + 16px)',
                opacity: activeSection === null ? 0 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {/* Sliding Background Mobile - Only Icons */}
            <motion.div
              className="md:hidden absolute rounded-md"
              initial={false}
              style={{
                backgroundColor: isScrolled
                  ? 'var(--switch-active-bg-scrolled)'
                  : 'var(--switch-active-bg-default)',
                zIndex: 0,
              }}
              animate={{
                top: '8px',
                bottom: '8px',
                left: '8px',
                width: '44px',
                x:
                  activeSection === 'expertises'
                    ? 0
                    : activeSection === 'principes'
                      ? 'calc(44px + 8px)'
                      : 'calc(88px + 16px)',
                opacity: activeSection === null ? 0 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {/* Expertises Button */}
            <button
              type="button"
              onClick={() => scrollToSection('expertises')}
              aria-label={t.ariaExpertises}
              className="relative z-10 flex items-center gap-2 transition-colors duration-300 md:w-[136px] w-[44px] justify-center md:justify-start cursor-pointer"
              style={{
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
            >
              <Lightbulb
                width={18}
                height={18}
                strokeWidth={1.5}
                style={{
                  color:
                    activeSection === 'expertises'
                      ? isScrolled
                        ? 'var(--switch-active-text-scrolled)'
                        : 'var(--switch-active-text-default)'
                      : isScrolled
                        ? 'var(--switch-text-scrolled)'
                        : 'var(--switch-text-default)',
                  transition: 'color 0.3s',
                }}
                className="shrink-0"
              />
              <span
                className="hidden md:inline"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: '15px',
                  letterSpacing: '0.04px',
                  color:
                    activeSection === 'expertises'
                      ? isScrolled
                        ? 'var(--switch-active-text-scrolled)'
                        : 'var(--switch-active-text-default)'
                      : isScrolled
                        ? 'var(--switch-text-scrolled)'
                        : 'var(--switch-text-default)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s',
                }}
              >
                {t.switchExpertises}
              </span>
            </button>

            {/* Principes Button */}
            <button
              type="button"
              onClick={() => scrollToSection('principes')}
              aria-label={t.ariaPrincipes}
              className="relative z-10 flex items-center gap-2 transition-colors duration-300 md:w-[120px] w-[44px] justify-center md:justify-start cursor-pointer"
              style={{
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
            >
              <Compass
                width={18}
                height={18}
                strokeWidth={1.5}
                style={{
                  color:
                    activeSection === 'principes'
                      ? isScrolled
                        ? 'var(--switch-active-text-scrolled)'
                        : 'var(--switch-active-text-default)'
                      : isScrolled
                        ? 'var(--switch-text-scrolled)'
                        : 'var(--switch-text-default)',
                  transition: 'color 0.3s',
                }}
                className="shrink-0"
              />
              <span
                className="hidden md:inline"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: '15px',
                  letterSpacing: '0.04px',
                  color:
                    activeSection === 'principes'
                      ? isScrolled
                        ? 'var(--switch-active-text-scrolled)'
                        : 'var(--switch-active-text-default)'
                      : isScrolled
                        ? 'var(--switch-text-scrolled)'
                        : 'var(--switch-text-default)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s',
                }}
              >
                {t.switchPrincipes}
              </span>
            </button>

            {/* Environnement Button */}
            <button
              type="button"
              onClick={() => scrollToSection('environnement')}
              aria-label={t.ariaEnvironnement}
              className="relative z-10 flex items-center gap-2 transition-colors duration-300 md:w-[160px] w-[44px] justify-center md:justify-start cursor-pointer"
              style={{
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
            >
              <Users
                width={18}
                height={18}
                strokeWidth={1.5}
                style={{
                  color:
                    activeSection === 'environnement'
                      ? isScrolled
                        ? 'var(--switch-active-text-scrolled)'
                        : 'var(--switch-active-text-default)'
                      : isScrolled
                        ? 'var(--switch-text-scrolled)'
                        : 'var(--switch-text-default)',
                  transition: 'color 0.3s',
                }}
                className="shrink-0"
              />
              <span
                className="hidden md:inline"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: '15px',
                  letterSpacing: '0.04px',
                  color:
                    activeSection === 'environnement'
                      ? isScrolled
                        ? 'var(--switch-active-text-scrolled)'
                        : 'var(--switch-active-text-default)'
                      : isScrolled
                        ? 'var(--switch-text-scrolled)'
                        : 'var(--switch-text-default)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s',
                }}
              >
                {t.switchEnvironnement}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section - Title */}
        <section
          style={{ paddingTop: 'var(--page-padding-top)' }}
          className="pb-12 md:pb-12"
        >
          <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
            <div className="mb-0 md:mb-12">
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
                  {t.heroEyebrow}
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
                  {t.heroTitle}
                </h1>
              </ScrollRevealTitle>
            </div>
          </div>
        </section>

        {/* Philosophie Section */}
        <section className="pb-16 md:pb-20">
          <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
            <ScrollFadeIn delay={0.1}>
              <h3
                className="mb-6"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '24px',
                  fontWeight: 600,
                  letterSpacing: '-0.8px',
                  lineHeight: '28px',
                  color: 'var(--portfolio-text-primary)',
                }}
              >
                {t.philosophieHeading}
              </h3>

              <p
                className="mb-8 text-[15px]"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  lineHeight: '1.7',
                  color: 'var(--portfolio-text-description)',
                }}
              >
                {t.philosophieP1}
                <br />
                <br />
                {t.philosophieP2}
              </p>

              <button
                type="button"
                className="px-6 py-3 flex items-center gap-2 transition-colors duration-300 cursor-pointer relative z-10"
                style={{
                  backgroundColor: isCVHovered
                    ? 'var(--portfolio-button-bg-hover)'
                    : 'var(--portfolio-button-bg)',
                  color: 'var(--portfolio-button-text)',
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  borderRadius: '5px',
                  pointerEvents: 'auto',
                }}
                onMouseEnter={() => setIsCVHovered(true)}
                onMouseLeave={() => setIsCVHovered(false)}
              >
                <FileText size={18} />
                <RollingText
                  text={t.cvButton}
                  inView={isCVHovered}
                  transition={{ duration: 0.3, delay: 0.02, ease: 'easeOut' }}
                />
              </button>
            </ScrollFadeIn>
          </div>
        </section>

        {/* Expertises Content */}
        <section ref={expertisesRef} className="pb-16 md:pb-20">
          <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
            <div className="mb-6">
              <ScrollRevealTitle delay={0.1}>
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
                  {t.expertiseEyebrow}
                </p>
              </ScrollRevealTitle>
              <ScrollRevealTitle delay={0.1}>
                <h2
                  className="mb-6"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-1.4px',
                    color: 'var(--portfolio-text-primary)',
                    textTransform: 'none',
                  }}
                >
                  {t.expertiseTitle}
                </h2>
              </ScrollRevealTitle>
            </div>

            {/* Expertise Cards */}
            <div className="space-y-6">
              {expertiseSectionsL.map((section, index) => (
                <ScrollFadeIn key={section.number} delay={0.15 + index * 0.05}>
                  <div
                    className="p-8"
                    style={{
                      backgroundColor: 'var(--portfolio-card-bg)',
                      borderRadius: '12px',
                      border: '1px solid var(--portfolio-card-border)',
                    }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12">
                      {/* Left Column - Number & Title */}
                      <div className="lg:col-span-4">
                        <p
                          className="mb-1"
                          style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            letterSpacing: '0.037px',
                            lineHeight: '20px',
                            color: 'var(--portfolio-text-muted)',
                          }}
                        >
                          ({section.number})
                        </p>
                        <h3
                          className="mb-6 lg:mb-0"
                          style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '31px',
                            fontWeight: 600,
                            letterSpacing: '-1.113px',
                            lineHeight: '34px',
                            color: 'var(--portfolio-text-primary)',
                          }}
                        >
                          {section.title}
                        </h3>
                      </div>

                      {/* Right Column - Description & Badges */}
                      <div className="lg:col-span-8">
                        <p
                          className="mb-6 text-[15px]"
                          style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 400,
                            letterSpacing: '0.04px',
                            lineHeight: '22px',
                            color: 'var(--portfolio-text-description)',
                          }}
                        >
                          {section.description}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {section.badges.map((badge, badgeIndex) => (
                            <div
                              key={badgeIndex}
                              className="rounded-[3px] px-[8px] py-[2px]"
                              style={{
                                backgroundColor: 'var(--portfolio-badge-bg)',
                                border:
                                  '1px solid var(--portfolio-badge-border)',
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: 'Manrope, sans-serif',
                                  fontSize: '13px',
                                  fontWeight: 400,
                                  letterSpacing: '0.033px',
                                  lineHeight: '18px',
                                  color: 'var(--portfolio-text-muted)',
                                }}
                              >
                                {badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Principles Content */}
        <section ref={principesRef} className="pb-16 md:pb-20">
          <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
            <div className="mb-6">
              <ScrollRevealTitle delay={0.4}>
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
                  {t.principesEyebrow}
                </p>
              </ScrollRevealTitle>
              <ScrollRevealTitle delay={0.45}>
                <h2
                  className="mb-6"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-1.4px',
                    color: 'var(--portfolio-text-primary)',
                    textTransform: 'none',
                  }}
                >
                  {t.principesTitle}
                </h2>
              </ScrollRevealTitle>
            </div>

            {/* Principles - Horizontal Scroll on Mobile, Grid on Desktop */}
            <ScrollFadeIn delay={0.5}>
              {/* Desktop : grille */}
              <div className="hidden md:block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {principlesDataL.map((principle) => (
                    <InfoCard
                      key={principle.title}
                      number={principle.number}
                      title={principle.title}
                      description={principle.description}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile : carrousel */}
              <CardCarousel
                items={principlesDataL}
                className="md:hidden"
                label={t.carouselPrincipes}
              />
            </ScrollFadeIn>
          </div>
        </section>

        {/* Environment Content */}
        <section ref={environnementRef} className="pb-16 md:pb-20">
          <div className="mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
            <div className="mb-6">
              <ScrollRevealTitle delay={0.7}>
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
                  {t.envEyebrow}
                </p>
              </ScrollRevealTitle>
              <ScrollRevealTitle delay={0.75}>
                <h2
                  className="mb-6"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
                    lineHeight: '1.2',
                    letterSpacing: '-1.4px',
                    color: 'var(--portfolio-text-primary)',
                    textTransform: 'none',
                  }}
                >
                  {t.envTitle}
                </h2>
              </ScrollRevealTitle>
            </div>

            {/* Desktop Grid 2x3 / Mobile Carousel */}
            <ScrollFadeIn delay={0.8}>
              {/* Desktop : grille 2 colonnes */}
              <div className="hidden xl:block">
                <div className="grid grid-cols-2 gap-6">
                  {environmentDataL.map((environment) => (
                    <InfoCard
                      key={environment.title}
                      number={environment.number}
                      title={environment.title}
                      description={environment.description}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile / tablette : carrousel */}
              <CardCarousel
                items={environmentDataL}
                className="xl:hidden"
                label={t.carouselEnvironnement}
              />
            </ScrollFadeIn>
          </div>
        </section>

        {/* Contact Footer */}
        <ContactFooter />
      </div>
    </div>
  );
}
