import '@fontsource/sora/400.css';
import '@fontsource/sora/500.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '@fontsource/sora/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './SymaShowcase.css';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import accueil from 'figma:asset/syma-accueil.webp';
import iconographie from 'figma:asset/syma-iconographie.webp';
import typographies from 'figma:asset/syma-typographies.webp';
import valider from 'figma:asset/syma-valider.webp';
import fatSvg from '../../assets/syma-logos/fat.svg?raw';
import goofySvg from '../../assets/syma-logos/goofy.svg?raw';
import journalSvg from '../../assets/syma-logos/journal.svg?raw';
import lebeauSvg from '../../assets/syma-logos/lebeau.svg?raw';
import manuscritSvg from '../../assets/syma-logos/manuscrit.svg?raw';
import verticalSvg from '../../assets/syma-logos/vertical.svg?raw';
import fluidSvg from '../../assets/syma-logos/fluid.svg?raw';

const SITE_URL = 'https://logo-syma.vercel.app/';

// Logos SVG (recolorables). Ordre = logo1..logo7 du vrai site.
const LOGOS = [fatSvg, goofySvg, journalSvg, lebeauSvg, manuscritSvg, verticalSvg, fluidSvg];
const LOGO_NAMES = ['Logo 1', 'Logo 2', 'Logo 3', 'Logo 4', 'Logo 5', 'Logo 6', 'Logo 7'];

// Palettes exactes du site SYMA (js/palettes.js).
const PALETTES = {
  palette1: {
    label: 'Palette 1',
    colors: ['#18233f', '#788ce3', '#92bad4', '#f7f3e7', '#e0f479', '#ff4d6d', '#000000', '#ffffff'],
  },
  palette2: {
    label: 'Palette 2',
    colors: ['#f35b43', '#610023', '#9f9536', '#f7c6dc', '#f7eee5', '#000000', '#ffffff'],
  },
} as const;
type PaletteKey = keyof typeof PALETTES;

// Config initiale des deux panneaux (identique au vrai site, main.js).
type PanelConfig = { label: string; logoIdx: number; palette: PaletteKey; bg: string; logo: string };
const PANEL_A: PanelConfig = { label: 'A', logoIdx: 0, palette: 'palette1', bg: '#18233f', logo: '#ffffff' };
const PANEL_B: PanelConfig = { label: 'B', logoIdx: 1, palette: 'palette1', bg: '#f7f3e7', logo: '#18233f' };

// Écrans produit du récit (ordre = étapes de l'étude de cas).
const STORY_IMAGES = [accueil, iconographie, typographies, valider];

const STRINGS = {
  fr: {
    heroEyebrow: ['Site web', 'Identité de marque', '2026'],
    thesisPre: 'Donner une identité à ',
    thesisEm: 'une agence qui se lance.',
    metaLabels: ['Rôle', 'Nature', 'Portée', 'Année', 'Outils'],
    metaValues: ['Identité de marque & dev', 'Site web', 'Identité + comparateur', '2026', 'Illustrator · Figma · Claude Code'],
    visit: 'Visiter le site',
    cue: '↓ étude de cas',
    // Comparateur
    cmpEyebrow: 'Le comparateur',
    cmpTitlePre: 'Comparez les directions, ',
    cmpTitleEm: 'recolorez en direct.',
    cmpModel: 'Modèle',
    cmpPalette: 'Palette',
    cmpFond: 'Fond',
    cmpLogo: 'Logo',
    cmpNote:
      'Recréé à l’identique : chaque carte a son modèle, sa palette, sa couleur de fond et de logo — sélecteurs indépendants. Les logos sont de vrais SVG recolorés en direct, comme sur le site.',
    // Récit
    storyEyebrow: 'L’étude de cas',
    enlarge: (name: string) => `Agrandir « ${name} »`,
    steps: [
      {
        t: 'Le contexte',
        b: 'Choisir un logo par mails et captures, c’est un choix qui s’éparpille. En plus de l’identité, j’ai construit un comparateur pour fluidifier nos échanges : aligner les directions, comparer, commenter — sans perdre le fil des avis.',
      },
      {
        t: 'L’iconographie',
        b: 'Un jeu d’icônes cohérent, validable une par une. Chaque piste peut être acceptée, refusée avec un retour, ou complétée par une demande libre.',
      },
      {
        t: 'Les typographies',
        b: 'Titre, texte courant, accent décoratif : le système typographique se prévisualise en contexte pour trancher sur du concret plutôt que sur des noms de polices.',
      },
      {
        t: 'Valider, ensemble',
        b: 'Le choix acté, partagé, sans ambiguïté. Fini les fils de mails : les fondatrices comparent, votent et tranchent sur une base commune — livré à une agence de com qui se lance.',
      },
    ],
  },
  en: {
    heroEyebrow: ['Website', 'Brand identity', '2026'],
    thesisPre: 'Giving an identity to ',
    thesisEm: 'an agency just getting started.',
    metaLabels: ['Role', 'Type', 'Scope', 'Year', 'Tools'],
    metaValues: ['Brand identity & dev', 'Website', 'Identity + comparator', '2026', 'Illustrator · Figma · Claude Code'],
    visit: 'Visit the site',
    cue: '↓ case study',
    cmpEyebrow: 'The comparator',
    cmpTitlePre: 'Compare the directions, ',
    cmpTitleEm: 'recolor them live.',
    cmpModel: 'Model',
    cmpPalette: 'Palette',
    cmpFond: 'Background',
    cmpLogo: 'Logo',
    cmpNote:
      'Rebuilt faithfully: each card has its own model, palette, background and logo color — independent selectors. The logos are real SVGs recolored live, just like on the site.',
    storyEyebrow: 'The case study',
    enlarge: (name: string) => `Enlarge "${name}"`,
    steps: [
      {
        t: 'The context',
        b: 'Picking a logo over emails and screenshots is a choice that scatters. On top of the identity, I built a comparator to smooth our back-and-forth: line up the directions, compare, comment — without losing the thread of opinions.',
      },
      {
        t: 'Iconography',
        b: 'A coherent icon set, validated one by one. Each option can be accepted, rejected with feedback, or supplemented by a free request.',
      },
      {
        t: 'Typography',
        b: 'Heading, body, decorative accent: the type system is previewed in context, so the call is made on something concrete rather than on font names.',
      },
      {
        t: 'Validate, together',
        b: 'The choice locked in, shared, unambiguous. No more email threads: the founders compare, vote and decide on common ground — delivered to a communications agency just getting started.',
      },
    ],
  },
};

// ── Petits composants ────────────────────────────────────────────
function renderWords(text: string, accent: boolean, keyPrefix: string) {
  return text.split(/(\s+)/).map((tok, i) => {
    if (tok === '') return null;
    if (/^\s+$/.test(tok)) return tok;
    return (
      <span key={keyPrefix + i} className={accent ? 'wd k' : 'wd'}>
        {tok}
      </span>
    );
  });
}

// Logo SVG inline recoloré via currentColor (le conteneur porte `color`).
function SvgLogo({ svg, className, style }: { svg: string; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector('svg');
    if (!el) return;
    // On retire width/height pour laisser le CSS dimensionner selon le contexte.
    el.removeAttribute('width');
    el.removeAttribute('height');
    el.querySelectorAll('path, polygon, circle, rect, text').forEach((p) => {
      (p as SVGElement).style.fill = 'currentColor';
    });
  }, [svg]);
  return (
    <span
      ref={ref}
      className={className}
      style={style}
      aria-hidden="true"
      // biome-ignore lint: SVG de marque interne, contenu maîtrisé.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

type CmpT = {
  cmpModel: string;
  cmpPalette: string;
  cmpFond: string;
  cmpLogo: string;
};

// Empêche le focus souris (et donc le scroll-into-view du navigateur qui
// faisait sauter la page) sans casser l'accès clavier : preventDefault sur
// mousedown bloque la mise au focus mais laisse passer le click.
const preventFocusScroll = (e: { preventDefault: () => void }) => e.preventDefault();

// Un panneau du comparateur : aperçu + Modèle / Palette / Fond / Logo,
// chaque sélecteur indépendant (même agencement que le vrai site).
function Panel({ config, t }: { config: PanelConfig; t: CmpT }) {
  const [palette, setPalette] = useState<PaletteKey>(config.palette);
  const [logoIdx, setLogoIdx] = useState(config.logoIdx);
  const [bg, setBg] = useState(config.bg);
  const [logoColor, setLogoColor] = useState(config.logo);
  const colors = PALETTES[palette].colors;

  const changePalette = (k: PaletteKey) => {
    setPalette(k);
    setBg(PALETTES[k].colors[0]);
    setLogoColor(PALETTES[k].colors[1]);
  };

  return (
    <div className="cpanel">
      <div className="cpanel-preview" style={{ backgroundColor: bg }}>
        <span className="cpanel-chip">{config.label}</span>
        <SvgLogo svg={LOGOS[logoIdx]} className="cpanel-logo" style={{ color: logoColor }} />
      </div>

      <div className="cpanel-controls">
        <div className="cgroup">
          <span className="clabel label">{t.cmpModel}</span>
          <div className="thumb-row">
            {LOGOS.map((svg, i) => (
              <button
                key={LOGO_NAMES[i]}
                type="button"
                className={i === logoIdx ? 'thumb on' : 'thumb'}
                aria-label={LOGO_NAMES[i]}
                aria-pressed={i === logoIdx}
                onMouseDown={preventFocusScroll}
                onClick={() => setLogoIdx(i)}
              >
                <SvgLogo svg={svg} className="thumb-logo" />
              </button>
            ))}
          </div>
        </div>

        <div className="cgroup">
          <span className="clabel label">{t.cmpPalette}</span>
          <div className="ptabs">
            {(Object.keys(PALETTES) as PaletteKey[]).map((k) => (
              <button
                key={k}
                type="button"
                className={palette === k ? 'ptab on' : 'ptab'}
                aria-pressed={palette === k}
                onMouseDown={preventFocusScroll}
                onClick={() => changePalette(k)}
              >
                {PALETTES[k].label}
              </button>
            ))}
          </div>
        </div>

        <div className="cgroup">
          <span className="clabel label">{t.cmpFond}</span>
          <div className="swrow">
            {colors.map((c) => (
              <button
                key={`bg-${c}`}
                type="button"
                className={bg === c ? 'sw on' : 'sw'}
                style={{ background: c }}
                aria-label={`${t.cmpFond} ${c}`}
                aria-pressed={bg === c}
                onMouseDown={preventFocusScroll}
                onClick={() => setBg(c)}
              />
            ))}
          </div>
        </div>

        <div className="cgroup">
          <span className="clabel label">{t.cmpLogo}</span>
          <div className="swrow">
            {colors.map((c) => (
              <button
                key={`lg-${c}`}
                type="button"
                className={logoColor === c ? 'sw on' : 'sw'}
                style={{ background: c }}
                aria-label={`${t.cmpLogo} ${c}`}
                aria-pressed={logoColor === c}
                onMouseDown={preventFocusScroll}
                onClick={() => setLogoColor(c)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type StoryStep = { t: string; b: string };

// Récit : texte à gauche (change au scroll), image fixe à droite qui
// déborde hors du cadre et change selon l'étape active.
function Story({
  eyebrow,
  steps,
  enlarge,
}: {
  eyebrow: string;
  steps: StoryStep[];
  enlarge: (name: string) => string;
}) {
  const [active, setActive] = useState(0);
  const [lb, setLb] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const stepEls = Array.from(root.querySelectorAll<HTMLElement>('.story-step'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    stepEls.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <section className="story" ref={ref}>
      <div className="story-grid">
        <div className="story-text">
          <span className="ey label">{eyebrow}</span>
          {steps.map((s, i) => (
            <div className={i === active ? 'story-step on' : 'story-step'} data-step={i} key={s.t}>
              <span className="story-num num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="story-h title">{s.t}</h3>
              <p className="story-b">{s.b}</p>
              {/* Mobile uniquement : l'image du step, en flux (le récit collant
                  desktop reste géré par .story-media). */}
              <button
                type="button"
                className="story-inline"
                aria-label={enlarge(s.t)}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setLb(i);
                }}
              >
                <img src={STORY_IMAGES[i]} alt={s.t} loading="lazy" decoding="async" />
              </button>
            </div>
          ))}
        </div>

        <div className="story-media">
          <button
            type="button"
            className="story-sticky"
            aria-label={enlarge(steps[active].t)}
            onClick={(e) => {
              e.currentTarget.blur();
              setLb(active);
            }}
          >
            {STORY_IMAGES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={steps[i].t}
                className={i === active ? 'story-img on' : 'story-img'}
                loading="lazy"
                decoding="async"
              />
            ))}
            <span className="story-zoom" aria-hidden="true">
              ⤢
            </span>
          </button>
        </div>
      </div>

      {lb !== null && (
        <ImageLightbox images={STORY_IMAGES} currentIndex={lb} onClose={() => setLb(null)} />
      )}
    </section>
  );
}

export default function SymaShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];

    // Illumination mot par mot des titres .illuminate
    const illum: { el: HTMLElement; sp: HTMLElement[] }[] = [];
    root.querySelectorAll<HTMLElement>('.illuminate').forEach((el) => {
      const sp = Array.from(el.querySelectorAll<HTMLElement>('.wd'));
      if (!reduce) sp.forEach((s) => (s.style.opacity = '0.16'));
      illum.push({ el, sp });
    });
    function litUpdate() {
      if (reduce) return;
      const vh = innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.34;
      illum.forEach((it) => {
        const r = it.el.getBoundingClientRect();
        let p = (start - r.top) / (start - end);
        p = Math.max(0, Math.min(1, p));
        const n = it.sp.length;
        it.sp.forEach((s, i) => {
          s.style.opacity = String(Math.max(0.16, Math.min(1, p * n - i)));
        });
      });
    }

    // Reveal au scroll
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // Zoom hero au scroll
    const cover = root.querySelector<HTMLElement>('.m-hero .cover');
    const heroEl = root.querySelector<HTMLElement>('.m-hero');
    const heroZoom = () => {
      if (!cover || !heroEl || reduce) return;
      const h = heroEl.offsetHeight || 1;
      const p = Math.max(0, Math.min(1, document.body.scrollTop / h));
      cover.style.transform = p > 0.001 ? `scale(${(1 + p * 0.12).toFixed(4)})` : '';
    };

    function onScrollRaw() {
      litUpdate();
      heroZoom();
    }
    onScrollRaw();
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          onScrollRaw();
          ticking = false;
        });
        ticking = true;
      }
    };
    document.body.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScrollRaw);
    cleanups.push(() => document.body.removeEventListener('scroll', onScroll));
    cleanups.push(() => window.removeEventListener('resize', onScrollRaw));

    return () => cleanups.forEach((fn) => fn());
  }, [lang]);

  return (
    <div className="syma-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
      <PageMeta
        title={`${projet.title} — Alexis Kabiche`}
        description={projet.description}
        path={`/projets/${projet.id}`}
      />

      {/* HERO */}
      <section className="m-hero">
        <img
          className="cover"
          src={projet.image}
          alt={projet.title}
          fetchPriority="high"
          decoding="async"
        />
        <div className="scrim" aria-hidden="true" />
        <div className="wrap in">
          <div className="ey label">
            {t.heroEyebrow.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </div>
          <h1 aria-label={projet.title}>{projet.title}</h1>
          <p className="th">
            {t.thesisPre}
            <em>{t.thesisEm}</em>
          </p>
        </div>
        <div className="cue label" aria-hidden="true">
          {t.cue}
        </div>
      </section>

      {/* BARRE MÉTA */}
      <div className="wrap">
        <div className="metabar reveal">
          <dl className="metabar-meta">
            {t.metaLabels.map((l, i) => (
              <div key={l}>
                <dt className="label">{l}</dt>
                <dd>{t.metaValues[i]}</dd>
              </div>
            ))}
          </dl>
          <a className="visit" href={SITE_URL} target="_blank" rel="noopener noreferrer">
            {t.visit} <span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg></span>
          </a>
        </div>
      </div>

      {/* COMPARATEUR (signature) */}
      <section className="wrap cmp-section">
        <span className="ey label">{t.cmpEyebrow}</span>
        <h2 className="cmp-title title illuminate">
          {renderWords(t.cmpTitlePre, false, 'p')}
          {renderWords(t.cmpTitleEm, true, 'k')}
        </h2>
        <div className="cmp reveal">
          <div className="cmp-cards">
            <Panel config={PANEL_A} t={t} />
            <Panel config={PANEL_B} t={t} />
          </div>
        </div>
        <p className="cmp-note">{t.cmpNote}</p>
      </section>

      {/* RÉCIT — texte à gauche, image fixe à droite qui déborde */}
      <Story eyebrow={t.storyEyebrow} steps={t.steps} enlarge={t.enlarge} />

      <ContactFooter />
    </div>
  );
}
