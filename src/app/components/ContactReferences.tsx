import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { useLang } from '../i18n';

// Icône LinkedIn en SVG inline (lucide-react ne fournit plus les logos de
// marque). Monochrome via `currentColor` → suit la couleur du lien, theme-aware.
function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export interface Reference {
  id: number;
  quote: { fr: string; en: string };
  name: string;
  role: { fr: string; en: string };
  company?: { fr: string; en: string };
  linkedin?: string;
}

// Placeholder FACTICE (à remplacer par de vraies références) : les noms sont des
// gabarits (« Prénom Nom »), les liens LinkedIn pointent vers l'accueil LinkedIn,
// aucune identité réelle. Ne pas laisser tel quel en prod : remplacer name /
// role / company / linkedin par les vraies valeurs, ou masquer la section.
export const referencesData: Reference[] = [
  {
    id: 1,
    quote: {
      fr: 'Il transforme un besoin flou en interface claire — et il livre, sans qu’on ait à repasser derrière.',
      en: 'He turns a fuzzy need into a clear interface — and ships it, without anyone having to redo the work.',
    },
    name: 'Prénom Nom',
    role: { fr: 'Direction Produit', en: 'Head of Product' },
    company: { fr: 'SaaS B2B', en: 'B2B SaaS' },
    linkedin: 'https://www.linkedin.com/',
  },
  {
    id: 2,
    quote: {
      fr: 'Une identité pensée de bout en bout, cohérente sur chaque support. On s’est senti compris.',
      en: 'An identity thought through end to end, consistent on every medium. We felt understood.',
    },
    name: 'Prénom Nom',
    role: { fr: 'Fondatrice', en: 'Founder' },
    company: { fr: 'Association', en: 'Non-profit' },
    linkedin: 'https://www.linkedin.com/',
  },
  {
    id: 3,
    quote: {
      fr: 'Rigueur produit et sens du détail visuel dans la même personne — rare et précieux.',
      en: 'Product rigor and an eye for visual detail in the same person — rare and valuable.',
    },
    name: 'Prénom Nom',
    role: { fr: 'Lead Design', en: 'Design Lead' },
    company: { fr: 'Studio', en: 'Studio' },
    linkedin: 'https://www.linkedin.com/',
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function ContactReferences() {
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const active = referencesData[index];
  const count = referencesData.length;

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);
  const trans = (d: number) =>
    reduced ? { duration: 0 } : { duration: d, ease: EASE };

  const navBtn = {
    background: 'transparent',
    border: 'none',
    color: 'var(--portfolio-text-secondary)',
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center">
      {/* Citation (aria-live pour annoncer le changement) */}
      <div aria-live="polite" className="relative w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={`quote-${active.id}`}
            initial={
              reduced ? false : { opacity: 0, y: 30, filter: 'blur(6px)' }
            }
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: -30, filter: 'blur(6px)' }
            }
            transition={trans(0.5)}
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(1.5rem, 1rem + 2.2vw, 2.5rem)',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: 'var(--portfolio-text-primary)',
            }}
          >
            {active.quote[lang]}
          </motion.blockquote>
        </AnimatePresence>
      </div>

      {/* Signature : Nom · poste · secteur + LinkedIn */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`sig-${active.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={trans(0.3)}
          className="mt-10 flex flex-col items-center gap-1"
        >
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
                fontSize: '15px',
                color: 'var(--portfolio-text-primary)',
              }}
            >
              {active.name}
            </span>
            {active.linkedin ? (
              <a
                href={active.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn — ${active.name}`}
                className="inline-flex transition-opacity hover:opacity-70"
                style={{ color: 'var(--portfolio-text-muted)' }}
              >
                <LinkedInIcon size={16} />
              </a>
            ) : null}
          </div>
          <span
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              color: 'var(--portfolio-text-muted)',
            }}
          >
            {active.role[lang]}
            {active.company ? ` · ${active.company[lang]}` : ''}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Navigation : ‹ points › (horizontal, centré) */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={
            lang === 'fr' ? 'Témoignage précédent' : 'Previous testimonial'
          }
          className="cursor-pointer p-1"
          style={navBtn}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-3" data-testid="references-dots">
          {referencesData.map((ref, i) => (
            <button
              key={ref.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={
                lang === 'fr'
                  ? `Aller au témoignage ${i + 1}`
                  : `Go to testimonial ${i + 1}`
              }
              aria-current={i === index ? 'true' : undefined}
              className="cursor-pointer p-1"
              style={{ background: 'transparent', border: 'none' }}
            >
              <span
                className="block rounded-full"
                style={{
                  width: '8px',
                  height: '8px',
                  transition: 'all 0.3s',
                  backgroundColor:
                    i === index
                      ? 'var(--portfolio-text-primary)'
                      : 'var(--portfolio-text-muted)',
                  transform: i === index ? 'scale(1)' : 'scale(0.8)',
                }}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label={lang === 'fr' ? 'Témoignage suivant' : 'Next testimonial'}
          className="cursor-pointer p-1"
          style={navBtn}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default ContactReferences;
