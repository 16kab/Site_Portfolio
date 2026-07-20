import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '../../i18n';

const STRINGS = {
  fr: {
    prev: 'Précédent',
    next: 'Suivant',
    goTo: (i: number) => `Aller à la carte ${i}`,
  },
  en: {
    prev: 'Previous',
    next: 'Next',
    goTo: (i: number) => `Go to card ${i}`,
  },
};

export interface InfoCardData {
  number: string;
  title: string;
  description: string;
}

interface InfoCardProps extends InfoCardData {
  /** Padding réduit (carrousel mobile, pour limiter la hauteur) */
  compact?: boolean;
  innerRef?: (el: HTMLDivElement | null) => void;
}

/**
 * Carte « (numéro) / titre / description » des sections Principes et
 * Environnement de la page À propos (grilles desktop et carrousels mobiles).
 */
export function InfoCard({
  number,
  title,
  description,
  compact = false,
  innerRef,
}: InfoCardProps) {
  return (
    <div
      className={compact ? 'p-6' : 'p-8'}
      style={{
        backgroundColor: 'var(--portfolio-card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--portfolio-card-border)',
      }}
      ref={innerRef}
    >
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
        ({number})
      </p>
      <h3
        className="mb-4"
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '24px',
          fontWeight: 600,
          letterSpacing: '-0.8px',
          lineHeight: '28px',
          color: 'var(--portfolio-text-primary)',
        }}
      >
        {title}
      </h3>
      <p
        className="leading-relaxed text-[15px]"
        style={{
          fontFamily: 'Manrope, sans-serif',
          color: 'var(--portfolio-text-description)',
        }}
      >
        {description}
      </p>
    </div>
  );
}

interface CardCarouselProps {
  items: InfoCardData[];
  /** Classe de visibilité du carrousel (ex. « md:hidden », « xl:hidden ») */
  className?: string;
  /** Libellé accessible de la région (ex. « Principes ») */
  label?: string;
}

const arrowStyle = {
  backgroundColor: 'var(--portfolio-card-bg)',
  border: '1px solid var(--portfolio-card-border)',
} as const;

const arrowClassName =
  'flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80';

/**
 * Carrousel mobile auto-contenu : gère son index, l'égalisation des
 * hauteurs de cartes (mesure au montage et au redimensionnement) et la
 * navigation par flèches.
 */
export function CardCarousel({
  items,
  className = '',
  label,
}: CardCarouselProps) {
  const t = useT(STRINGS);
  const [index, setIndex] = useState(0);
  const [heights, setHeights] = useState<number[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const measure = () => {
      setHeights(cardsRef.current.map((card) => card?.offsetHeight ?? 0));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Hauteur ajustée à la carte courante (les cartes gardent leur taille réelle)
  const currentHeight = heights[index];

  return (
    <section
      className={`${className} relative`.trim()}
      aria-roledescription="carrousel"
      aria-label={label}
    >
      {/* Cards Container : cartes à 90 %, centrées, laissant entrevoir les
          voisines (peek). Hauteur ajustée à la carte affichée. */}
      <div
        className="overflow-hidden transition-[height] duration-500 ease-out"
        style={currentHeight ? { height: `${currentHeight}px` } : undefined}
      >
        <div
          className="flex items-start gap-2 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(5% - ${index * 90}% - ${index * 0.5}rem))`,
          }}
        >
          {items.map((item, i) => (
            <div key={item.title} className="w-[90%] flex-shrink-0">
              <InfoCard
                number={item.number}
                title={item.title}
                description={item.description}
                compact
                innerRef={(el) => {
                  cardsRef.current[i] = el;
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Contrôles : flèches + points indicateurs */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          aria-label={t.prev}
          className={arrowClassName}
          style={arrowStyle}
        >
          <ChevronLeft
            className="w-5 h-5"
            style={{ color: 'var(--portfolio-text-secondary)' }}
          />
        </button>

        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t.goTo(i + 1)}
              aria-current={i === index}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === index ? '1.25rem' : '0.5rem',
                backgroundColor:
                  i === index
                    ? 'var(--portfolio-text-primary)'
                    : 'var(--portfolio-text-muted)',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIndex(index + 1)}
          disabled={index === items.length - 1}
          aria-label={t.next}
          className={arrowClassName}
          style={arrowStyle}
        >
          <ChevronRight
            className="w-5 h-5"
            style={{ color: 'var(--portfolio-text-secondary)' }}
          />
        </button>
      </div>
    </section>
  );
}
