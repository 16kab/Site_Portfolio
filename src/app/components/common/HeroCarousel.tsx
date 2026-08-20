'use client';

// Hero éditorial piloté par une pellicule. Cf. spec
// 2026-08-20-projets-hero-carousel-design.md. Géométrie mesurée (ResizeObserver),
// jamais codée en dur : identique en preview 600px et en 4K.
import * as React from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import { cn } from '@/lib/utils';

export interface HeroCarouselItem {
  id?: string | number;
  title: string;
  image: string;
  credit?: string;
  meta?: string[];
  accent?: string;
}

export interface HeroCarouselProps {
  items: HeroCarouselItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Tiré au clic sur la carte DÉJÀ focus (i === index) et sur le cue CTA. */
  onItemActivate?: (index: number, img: HTMLImageElement | null) => void;
  /** Tiré à chaque changement d'index (+ au montage) avec le <img> de la carte focus. */
  onFocusedImageChange?: (img: HTMLImageElement | null) => void;
  /** Libellé du cue d'ouverture (ex. « Voir le projet »). Masqué si absent. */
  ctaLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
}

const CARD_H = 0.264;
const CARD_AR = 0.75;
const GAP = 0.038;
const STRIP_TOP = 0.5;
const TITLE = 0.067;
const LABEL = 0.0103;
const PAD = 0.017;
const RAIL = 0.2;
const WHEEL_THRESHOLD = 60;
const WHEEL_COOLDOWN = 420;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function HeroCarousel({
  items,
  index: controlled,
  defaultIndex = 0,
  onIndexChange,
  onItemActivate,
  onFocusedImageChange,
  ctaLabel,
  autoplay = false,
  autoplayDelay = 4000,
  className,
}: HeroCarouselProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
  const [dragging, setDragging] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const reduced = useReducedMotion();

  const last = items.length - 1;
  const index = clamp(controlled ?? uncontrolled, 0, Math.max(0, last));

  const go = React.useCallback(
    (next: number) => {
      const clamped = clamp(next, 0, Math.max(0, last));
      if (controlled === undefined) setUncontrolled(clamped);
      if (clamped !== index) onIndexChange?.(clamped);
    },
    [controlled, index, last, onIndexChange],
  );

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const read = () => setBox({ w: stage.clientWidth, h: stage.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const fullH = clamp(box.h * CARD_H, 96, 360);
  const halfH = fullH / 2;
  const cardW = fullH * CARD_AR;
  const gap = Math.max(4, Math.round(cardW * GAP));
  const step = cardW + gap;
  const pad = Math.max(16, Math.round(box.w * PAD));
  const label = Math.max(9, Math.round(box.h * LABEL));

  const xFor = React.useCallback(
    (i: number) => box.w / 2 - (i * step + cardW / 2),
    [box.w, step, cardW],
  );
  const x = useMotionValue(0);
  const target = xFor(index);

  const spring = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 34, mass: 0.9 };
  const swing = reduced
    ? { duration: 0 }
    : { duration: 0.7, ease: 'easeOut' as const };

  // biome-ignore lint/correctness/useExhaustiveDependencies: spring est recréé à chaque rendu (dépendre dessus relancerait l'anim en boucle) ; reduced est déjà reflété dans spring/target.
  React.useEffect(() => {
    if (dragging) return;
    const run = animate(x, target, spring);
    return () => run.stop();
  }, [target, dragging, reduced, x]);

  // Remonte l'image de la carte focus au parent (pour le reverse-morph).
  // biome-ignore lint/correctness/useExhaustiveDependencies: index/box.w sont les déclencheurs voulus (recalcul au changement de focus ou de mesure) ; onFocusedImageChange est la seule dép. de callback nécessaire.
  React.useEffect(() => {
    if (!onFocusedImageChange) return;
    const img = stageRef.current?.querySelector<HTMLImageElement>(
      '[data-hc-card][aria-current="true"] img',
    );
    onFocusedImageChange(img ?? null);
  }, [index, box.w, onFocusedImageChange]);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let acc = 0;
    let until = 0;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const stuck = (delta > 0 && index === last) || (delta < 0 && index === 0);
      if (stuck) {
        acc = 0;
        return;
      }
      e.preventDefault();
      const now = e.timeStamp;
      if (now < until) return;
      acc += delta;
      if (Math.abs(acc) < WHEEL_THRESHOLD) return;
      go(index + Math.sign(acc));
      acc = 0;
      until = now + WHEEL_COOLDOWN;
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [go, index, last]);

  React.useEffect(() => {
    if (!autoplay || paused || dragging || items.length < 2) return;
    const id = window.setTimeout(
      () => go(index === last ? 0 : index + 1),
      autoplayDelay,
    );
    return () => window.clearTimeout(id);
  }, [autoplay, autoplayDelay, dragging, go, index, items.length, last, paused]);

  const active = items[index];
  if (!active) return null;

  const lines = active.title.split('\n');
  const accent = active.accent ?? '#8a8a8a';

  const activate = () => {
    const img = stageRef.current?.querySelector<HTMLImageElement>(
      '[data-hc-card][aria-current="true"] img',
    );
    onItemActivate?.(index, img ?? null);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: widget composite (carousel) au clavier, aucun élément sémantique natif ne convient.
    <div
      ref={stageRef}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: racine focusable du carousel (flèches/Entrée gérées ici), pattern ARIA carousel standard.
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Projets"
      onKeyDown={(e) => {
        const keys: Record<string, number> = {
          ArrowLeft: index - 1,
          ArrowRight: index + 1,
          Home: 0,
          End: last,
        };
        if (e.key === 'Enter') {
          e.preventDefault();
          activate();
          return;
        }
        if (!(e.key in keys)) return;
        e.preventDefault();
        go(keys[e.key]!);
      }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ fontFamily: 'Manrope, sans-serif' }}
      className={cn(
        'relative h-full min-h-[24rem] w-full overflow-hidden bg-black text-white select-none',
        'outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-inset',
        className,
      )}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={swing}
        >
          <motion.img
            src={active.image}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: reduced ? 1.28 : 1.42 }}
            animate={{ scale: 1.28 }}
            transition={reduced ? { duration: 0 } : { duration: 6, ease: 'linear' }}
          />
          <div className="absolute inset-0" style={{ backgroundColor: accent, mixBlendMode: 'color' }} />
          <div className="absolute inset-0 opacity-55" style={{ backgroundColor: accent, mixBlendMode: 'multiply' }} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/45" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }}
      />

      {/* Bloc titre au-dessus de la pellicule */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col justify-end"
        style={{
          height: `${STRIP_TOP * 100}%`,
          paddingLeft: pad,
          paddingRight: pad,
          paddingBottom: Math.round(box.h * 0.028),
        }}
      >
        <div className="flex w-full flex-wrap items-end gap-x-[6vw] gap-y-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h2
              key={index}
              className="font-semibold leading-[0.88] tracking-[-0.03em]"
              style={{ fontFamily: 'Manrope, sans-serif', fontSize: Math.max(24, Math.round(box.h * TITLE)) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
            >
              {lines.map((line, i) => (
                <span key={i} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={
                      reduced ? { duration: 0 } : { duration: 0.62, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }
                    }
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h2>
          </AnimatePresence>

          {active.credit ? (
            <motion.p
              key={`credit-${index}`}
              className="uppercase tracking-[0.14em] opacity-80"
              style={{ fontFamily: MONO, fontSize: label }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {active.credit}
            </motion.p>
          ) : null}

          {active.meta?.length ? (
            <div className="ml-auto flex items-end" style={{ gap: `${Math.max(16, box.w * 0.055)}px` }}>
              {active.meta.map((fact, i) => (
                <motion.span
                  key={`${index}-${fact}`}
                  className="whitespace-nowrap uppercase tracking-[0.14em] opacity-80"
                  style={{ fontFamily: MONO, fontSize: label }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.45, delay: 0.12 + i * 0.06 }}
                >
                  {fact}
                </motion.span>
              ))}
            </div>
          ) : null}
        </div>

        {ctaLabel ? (
          <button
            type="button"
            onClick={activate}
            className="mt-3 inline-flex w-fit items-center gap-1.5 uppercase tracking-[0.14em] opacity-90 transition-opacity hover:opacity-100"
            style={{ fontFamily: MONO, fontSize: label }}
          >
            {ctaLabel} <span aria-hidden>↗</span>
          </button>
        ) : null}
      </div>

      {/* Pellicule */}
      <div className="absolute inset-x-0" style={{ top: `${STRIP_TOP * 100}%`, height: fullH }}>
        <motion.div
          className="flex items-start"
          style={{ gap, x, cursor: dragging ? 'grabbing' : 'grab' }}
          drag="x"
          dragMomentum={false}
          dragElastic={0.08}
          dragConstraints={{ left: xFor(last), right: xFor(0) }}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_, info) => {
            setDragging(false);
            const thrown = x.get() + info.velocity.x * 0.12;
            go(Math.round((box.w / 2 - thrown - cardW / 2) / step));
          }}
        >
          {items.map((item, i) => (
            <motion.button
              key={item.id ?? i}
              type="button"
              data-hc-card
              aria-label={item.title.replace(/\n/g, ' ')}
              aria-current={i === index}
              onClick={() => {
                if (i === index) activate();
                else go(i);
              }}
              className="relative shrink-0 overflow-hidden rounded-none bg-white/5"
              style={{ width: cardW }}
              animate={{ height: i === index ? fullH : halfH }}
              transition={spring}
            >
              <img
                src={item.image}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
                style={{ objectPosition: '50% 26%' }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-0 bg-black"
                animate={{ opacity: i === index ? 0 : 0.12 }}
                transition={spring}
              />
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Rail de position */}
      <div className="absolute" style={{ left: pad, bottom: Math.max(14, box.h * 0.022), width: box.w * RAIL }}>
        <div className="flex justify-between tabular-nums opacity-80" style={{ fontFamily: MONO, fontSize: label }}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{String(items.length).padStart(2, '0')}</span>
        </div>
        <div className="relative mt-2 h-px w-full bg-white/25">
          <motion.div
            className="absolute inset-y-0 bg-white"
            style={{ width: `${100 / items.length}%` }}
            animate={{ left: `${(index / items.length) * 100}%` }}
            transition={spring}
          />
        </div>
      </div>
    </div>
  );
}
