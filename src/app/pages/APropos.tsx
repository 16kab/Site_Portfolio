import { FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import RollingText from '../components/RollingText';
import ScrollFadeIn from '../components/ScrollFadeIn';
import { ScrollRevealTitle } from '../components/ScrollRevealTitle';
import { ROUTES } from '../config';
import { ROUTE_META } from '../config/seo';
import { useLang } from '../i18n';
import {
  type ExpertiseItem,
  getAproposContent,
  type IndexItem,
} from './APropos.content';

const CONTAINER =
  'mx-auto w-full max-w-[1920px] px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24';

const LABEL_STYLE = {
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 500,
  fontSize: '13px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--portfolio-text-muted)',
};

const SECTION_TITLE_STYLE = {
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 600,
  fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
  lineHeight: 1.2,
  letterSpacing: '-0.03em',
  color: 'var(--portfolio-text-primary)',
} as const;

// Une ligne d'index dépliable : en-tête cliquable (numéro + titre + « + »)
// qui déplie la description (+ badges) au survol (desktop) ou au clic (mobile).
function IndexRow({
  item,
  badges,
  isOpen,
  onToggle,
  onHover,
  reduced,
}: {
  item: ExpertiseItem | IndexItem;
  badges?: string[];
  isOpen: boolean;
  onToggle: () => void;
  onHover: () => void;
  reduced: boolean;
}) {
  const panelId = `apropos-panel-${item.number}`;
  return (
    <div style={{ borderTop: '1px solid var(--portfolio-card-border)' }}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        onMouseEnter={onHover}
        className="w-full text-left flex items-center gap-4 py-6 cursor-pointer"
        style={{ background: 'transparent', border: 'none' }}
      >
        <span
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            color: isOpen
              ? 'var(--portfolio-text-primary)'
              : 'var(--portfolio-text-muted)',
            transition: 'color 0.3s',
          }}
        >
          {item.number}
        </span>
        <h3
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(1.25rem, 1rem + 0.9vw, 1.9rem)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--portfolio-text-primary)',
          }}
        >
          {item.title}
        </h3>
        <span
          aria-hidden="true"
          className="ml-auto shrink-0"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '24px',
            fontWeight: 300,
            lineHeight: 1,
            color: 'var(--portfolio-text-muted)',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          +
        </span>
      </button>
      <motion.div
        id={panelId}
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={
          reduced ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
        style={{ overflow: 'hidden' }}
      >
        <div className="pb-8 pl-9" style={{ maxWidth: '72ch' }}>
          <p
            className="text-[15px]"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'var(--portfolio-text-description)',
            }}
          >
            {item.description}
          </p>
          {badges && badges.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-[3px] px-[8px] py-[2px]"
                  style={{
                    backgroundColor: 'var(--portfolio-badge-bg)',
                    border: '1px solid var(--portfolio-badge-border)',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '18px',
                    color: 'var(--portfolio-text-muted)',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

// Un sous-bloc « index » dépliable : label + titre + lignes. Gère l'état ouvert
// (une ligne à la fois) : survol sur périphérique « hover », clic partout.
function IndexSection({
  label,
  title,
  items,
  withBadges = false,
}: {
  label: string;
  title: string;
  items: (ExpertiseItem | IndexItem)[];
  withBadges?: boolean;
}) {
  const reduced = useReducedMotion();
  // Première ligne ouverte par défaut : donne l'affordance « ça se déplie ».
  const [openKey, setOpenKey] = useState<string | null>(
    items[0]?.number ?? null,
  );
  const hoverCapableRef = useRef(false);
  useEffect(() => {
    hoverCapableRef.current =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover)').matches;
  }, []);

  return (
    <section className="pb-16 md:pb-24">
      <div className={CONTAINER}>
        <ScrollRevealTitle delay={0}>
          <p className="mb-1" style={LABEL_STYLE}>
            {label}
          </p>
        </ScrollRevealTitle>
        <ScrollRevealTitle delay={0.05}>
          <h2 className="mb-8" style={SECTION_TITLE_STYLE}>
            {title}
          </h2>
        </ScrollRevealTitle>
        <ScrollFadeIn delay={0.1}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: onMouseLeave replie la ligne survolée sur desktop ; chaque ligne reste un <button> focusable/cliquable, ce conteneur ne porte aucune sémantique interactive. */}
          <div
            style={{ borderBottom: '1px solid var(--portfolio-card-border)' }}
            onMouseLeave={() => {
              if (hoverCapableRef.current) setOpenKey(null);
            }}
          >
            {items.map((item) => (
              <IndexRow
                key={item.number}
                item={item}
                badges={
                  withBadges && 'badges' in item ? item.badges : undefined
                }
                isOpen={openKey === item.number}
                onToggle={() =>
                  setOpenKey((k) => (k === item.number ? null : item.number))
                }
                onHover={() => {
                  if (hoverCapableRef.current) setOpenKey(item.number);
                }}
                reduced={!!reduced}
              />
            ))}
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}

export default function APropos() {
  const { lang } = useLang();
  const {
    strings: t,
    expertises,
    principles,
    recherche,
  } = getAproposContent(lang);
  const [cvHover, setCvHover] = useState(false);

  useEffect(() => {
    // Reset scroll au montage — body est l'élément scrollable.
    document.body.scrollTop = 0;
  }, []);

  return (
    <div
      className="relative min-h-screen apropos-page"
      style={{ backgroundColor: 'var(--portfolio-bg)' }}
    >
      <PageMeta {...ROUTE_META[ROUTES.APROPOS]} />

      {/* 1. HERO MANIFESTE */}
      <section
        style={{ paddingTop: 'var(--page-padding-top)' }}
        className="pb-16 md:pb-24"
      >
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 lg:items-end">
            <div className="lg:col-span-8">
              <ScrollRevealTitle delay={0}>
                <p className="mb-4" style={LABEL_STYLE}>
                  {t.eyebrow}
                </p>
              </ScrollRevealTitle>
              <ScrollRevealTitle delay={0.05}>
                <h1
                  style={
                    {
                      fontFamily: 'var(--font-manifeste)',
                      fontWeight: 800,
                      fontSize: 'clamp(2.5rem, 1rem + 8vw, 6rem)',
                      lineHeight: 0.98,
                      letterSpacing: '-0.03em',
                      textWrap: 'balance',
                      color: 'var(--portfolio-text-primary)',
                    } as React.CSSProperties
                  }
                >
                  {t.accroche}
                </h1>
              </ScrollRevealTitle>
            </div>

            {/* Portrait — placeholder cadré 4:5 (image fournie plus tard) */}
            <div className="lg:col-span-4">
              <ScrollFadeIn delay={0.1}>
                <div
                  aria-hidden="true"
                  className="flex items-end p-4"
                  style={{
                    aspectRatio: '4 / 5',
                    backgroundColor: 'var(--portfolio-card-bg)',
                    border: '1px solid var(--portfolio-card-border)',
                    borderRadius: '12px',
                  }}
                >
                  <span style={LABEL_STYLE}>portrait</span>
                </div>
              </ScrollFadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LE POURQUOI — philosophie en exergue */}
      <section className="pb-16 md:pb-24">
        <div className={CONTAINER}>
          <ScrollRevealTitle delay={0}>
            <p className="mb-6" style={LABEL_STYLE}>
              {t.whyLabel}
            </p>
          </ScrollRevealTitle>
          <ScrollFadeIn delay={0.05}>
            <div style={{ maxWidth: '62ch' }}>
              <p
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(1.25rem, 1.05rem + 0.9vw, 1.9rem)',
                  lineHeight: 1.45,
                  letterSpacing: '-0.01em',
                  color: 'var(--portfolio-text-primary)',
                }}
              >
                {t.philosophieP1}
              </p>
              <p
                className="mt-8 text-[15px] md:text-base"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.7,
                  color: 'var(--portfolio-text-description)',
                }}
              >
                {t.philosophieP2}
              </p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* 3. LE COMMENT — index dépliable */}
      <IndexSection
        label={t.expertiseLabel}
        title={t.expertiseTitle}
        items={expertises}
        withBadges
      />

      <IndexSection
        label={t.principesLabel}
        title={t.principesTitle}
        items={principles}
      />

      <IndexSection
        label={t.rechercheLabel}
        title={t.rechercheTitle}
        items={recherche}
      />

      {/* 4. CV — désactivé tant que /cv n'existe pas */}
      <section className="pb-20 md:pb-28">
        <div className={CONTAINER}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: pas un contrôle réel (aria-disabled, pas de onClick) — hover ne fait que déclencher l'anim texte, pas de sémantique interactive à porter. */}
          <div
            data-testid="cv-button"
            aria-disabled="true"
            className="inline-flex items-center gap-2 px-6 py-3 select-none"
            style={{
              backgroundColor: 'var(--portfolio-button-bg)',
              color: 'var(--portfolio-button-text)',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '5px',
              opacity: 0.55,
              cursor: 'not-allowed',
            }}
            onMouseEnter={() => setCvHover(true)}
            onMouseLeave={() => setCvHover(false)}
          >
            {/* TODO(cv): remplacer par <Link to="/cv"> une fois la page CV créée */}
            <FileText size={18} />
            <RollingText
              text={t.cvButton}
              inView={cvHover}
              transition={{ duration: 0.3, delay: 0.02, ease: 'easeOut' }}
            />
            <span
              className="ml-1"
              style={{
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.8,
              }}
            >
              · {t.cvSoon}
            </span>
          </div>
        </div>
      </section>

      <ContactFooter />
    </div>
  );
}
