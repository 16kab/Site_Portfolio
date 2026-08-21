import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { useLang } from '../i18n';

export interface Reference {
  id: number;
  quote: { fr: string; en: string };
  name?: string; // absent en placeholder (anti fausse identité)
  role: { fr: string; en: string };
  company?: { fr: string; en: string };
}

// Placeholder NEUTRE : attributions génériques (rôle + secteur), aucune
// personne réelle, aucune entreprise réelle. À remplacer par de vraies
// références (ajouter `name`, vrais `company`) quand elles seront fournies.
export const referencesData: Reference[] = [
  {
    id: 1,
    quote: {
      fr: `Il transforme un besoin flou en interface claire — et il livre, sans qu'on ait à repasser derrière.`,
      en: `He turns a fuzzy need into a clear interface — and ships it, without anyone having to redo the work.`,
    },
    role: { fr: 'Direction Produit', en: 'Head of Product' },
    company: { fr: 'SaaS B2B', en: 'B2B SaaS' },
  },
  {
    id: 2,
    quote: {
      fr: `Une identité pensée de bout en bout, cohérente sur chaque support. On s'est senti compris.`,
      en: `An identity thought through end to end, consistent on every medium. We felt understood.`,
    },
    role: { fr: 'Fondatrice', en: 'Founder' },
    company: { fr: 'Association', en: 'Non-profit' },
  },
  {
    id: 3,
    quote: {
      fr: `Rigueur produit et sens du détail visuel dans la même personne — rare et précieux.`,
      en: `Product rigor and an eye for visual detail in the same person — rare and valuable.`,
    },
    role: { fr: 'Lead Design', en: 'Design Lead' },
    company: { fr: 'Studio', en: 'Studio' },
  },
];

const LABEL_STYLE = {
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 500,
  fontSize: '13px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--portfolio-text-muted)',
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function ContactReferences() {
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const active = referencesData[index];
  const count = referencesData.length;

  const next = () => setIndex((i) => (i + 1) % count);
  const trans = (d: number) =>
    reduced ? { duration: 0 } : { duration: d, ease: EASE };
  const pad2 = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="mx-auto w-full max-w-3xl px-2 text-center">
      {/* Contexte (rôle · secteur) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`ctx-${active.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={trans(0.3)}
          className="mb-8 inline-flex items-center gap-3"
          style={LABEL_STYLE}
        >
          <span
            aria-hidden="true"
            style={{
              width: '32px',
              height: '1px',
              backgroundColor: 'var(--portfolio-card-border)',
            }}
          />
          {active.company ? active.company[lang] : ''}
        </motion.div>
      </AnimatePresence>

      {/* Citation (aria-live pour annoncer le changement) */}
      <div aria-live="polite" className="relative overflow-hidden">
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

      {/* Auteur : (nom ·) rôle · secteur */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`author-${active.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={trans(0.3)}
          className="mt-10 flex items-center justify-center gap-3"
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '14px',
            color: 'var(--portfolio-text-secondary)',
          }}
        >
          <span style={{ color: 'var(--portfolio-text-muted)' }}>
            {pad2(index + 1)} / {pad2(count)}
          </span>
          <span
            aria-hidden="true"
            style={{
              width: '24px',
              height: '1px',
              backgroundColor: 'var(--portfolio-card-border)',
            }}
          />
          <span>
            {active.name ? `${active.name} · ` : ''}
            {active.role[lang]}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Navigation : points + suivant */}
      <div className="mt-10 flex items-center justify-center gap-6">
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
              className="p-1 cursor-pointer"
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
                      : 'var(--portfolio-card-border)',
                  transform: i === index ? 'scale(1)' : 'scale(0.75)',
                }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center gap-1 cursor-pointer"
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '13px',
            letterSpacing: '0.04em',
            color: 'var(--portfolio-text-secondary)',
          }}
        >
          {lang === 'fr' ? 'Suivant' : 'Next'}
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default ContactReferences;
