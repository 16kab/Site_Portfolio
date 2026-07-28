import '@fontsource-variable/bricolage-grotesque';
import './SymaShowcase.css';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';
import { scrollBodyTo } from '../utils/scrollBodyTo';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
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

const MTOP = 134; // doit refléter --mtop dans SymaShowcase.css
const SITE_URL = 'https://logo-syma.vercel.app/';

type Lead = { pre: string; k: string; post: string };
type Cap = { b: string; r: string };

// Logos SVG (recolorables). Ordre = affichage dans la rangée des modèles.
const LOGOS = [fatSvg, goofySvg, journalSvg, lebeauSvg, manuscritSvg, verticalSvg, fluidSvg];
const LOGO_NAMES = ['FAT', 'Goofy', 'Journal', 'le beau', 'manuscrit', 'Vertical', 'fluid'];

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
// Style {fond, logo} de la carte A et de la carte B, par palette.
const CARD_STYLES: Record<PaletteKey, { bg: string; logo: string }[]> = {
  palette1: [
    { bg: '#18233f', logo: '#f7f3e7' },
    { bg: '#ff4d6d', logo: '#18233f' },
  ],
  palette2: [
    { bg: '#610023', logo: '#f7eee5' },
    { bg: '#f35b43', logo: '#610023' },
  ],
};

const STRINGS = {
  fr: {
    study: 'Étude de cas',
    heroEyebrow: ['Site web', 'Studio de marque', '2025'],
    thesisPre: 'Choisir une identité de marque, ',
    thesisEm: 'à plusieurs.',
    railSub: "Comparateur d'identité — logos, palettes, typo : on tranche ensemble.",
    metaLabels: ['Rôle', 'Nature', 'Portée', 'Année'],
    metaValues: ['Design & Front', 'Site web', 'Outil de décision', '2025'],
    nav: ['Contexte', 'Rôle', 'Comparateur', 'Système', 'Impact'],
    cue: '↓ étude de cas',
    visit: 'Visiter le site',
    enlarge: (name: string) => `Agrandir « ${name} »`,
    s1lead: {
      pre: 'Choisir un logo par mails et captures, ',
      k: "c'est un choix qui s'éparpille.",
      post: '',
    } as Lead,
    s1note:
      'SYMA rassemble les directions au même endroit — on compare, on classe, on tranche, sans perdre le fil des avis.',
    s2lead: {
      pre: 'Du concept à l’interface, ',
      k: 'puis au code.',
      post: '',
    } as Lead,
    s2note:
      "Exploration des directions de logo, système de marque (palette, typo, icônes), UI du comparateur, et le front (recolorisation SVG en direct, vote).",
    interventionsLabel: 'Interventions',
    interventions: [
      'Directions de logo & système de marque',
      'UI du comparateur et du vote',
      'Front : recolorisation SVG en direct',
      'Palette, typographies, iconographie',
    ],
    s3lead: {
      pre: 'Deux directions, ',
      k: 'une bascule de palette',
      post: ' — et le choix devient évident.',
    } as Lead,
    cmpHint: 'Cliquez une palette — les deux directions se recolorent.',
    cmpModels: 'Modèles',
    s4lead: {
      pre: 'Un système complet : ',
      k: 'palette, typo, icônes.',
      post: '',
    } as Lead,
    sysScreens: [
      { b: 'Iconographie', r: ' — un jeu d’icônes cohérent' },
      { b: 'Typographies', r: ' — titre, texte, accent décoratif' },
      { b: 'Valider', r: ' — le choix acté, partagé' },
    ] as Cap[],
    s5lead: {
      pre: 'Une identité ',
      k: 'assumée collectivement',
      post: '.',
    } as Lead,
    s5note:
      "Fini les fils de mails : chacun compare, vote, et le studio tranche sur une base commune. [Impact réel à affiner.]",
  },
  en: {
    study: 'Case study',
    heroEyebrow: ['Website', 'Brand studio', '2025'],
    thesisPre: 'Choosing a brand identity, ',
    thesisEm: 'together.',
    railSub: 'Identity comparator — logos, palettes, type: decide together.',
    metaLabels: ['Role', 'Type', 'Scope', 'Year'],
    metaValues: ['Design & Front-end', 'Website', 'Decision tool', '2025'],
    nav: ['Context', 'Role', 'Comparator', 'System', 'Impact'],
    cue: '↓ case study',
    visit: 'Visit the site',
    enlarge: (name: string) => `Enlarge "${name}"`,
    s1lead: {
      pre: 'Picking a logo over emails and screenshots, ',
      k: 'a choice that scatters.',
      post: '',
    } as Lead,
    s1note:
      'SYMA gathers the directions in one place — you compare, rank, decide, without losing the thread of opinions.',
    s2lead: {
      pre: 'From concept to interface, ',
      k: 'then to code.',
      post: '',
    } as Lead,
    s2note:
      'Logo direction exploration, brand system (palette, type, icons), comparator UI, and the front-end (live SVG recoloring, voting).',
    interventionsLabel: 'Contributions',
    interventions: [
      'Logo directions & brand system',
      'Comparator and voting UI',
      'Front-end: live SVG recoloring',
      'Palette, typography, iconography',
    ],
    s3lead: {
      pre: 'Two directions, ',
      k: 'one palette switch',
      post: ' — and the choice becomes obvious.',
    } as Lead,
    cmpHint: 'Click a palette — both directions recolor.',
    cmpModels: 'Models',
    s4lead: {
      pre: 'A full system: ',
      k: 'palette, type, icons.',
      post: '',
    } as Lead,
    sysScreens: [
      { b: 'Iconography', r: ' — a coherent icon set' },
      { b: 'Typography', r: ' — heading, body, decorative accent' },
      { b: 'Validate', r: ' — the choice locked in, shared' },
    ] as Cap[],
    s5lead: {
      pre: 'An identity ',
      k: 'owned collectively',
      post: '.',
    } as Lead,
    s5note:
      'No more email threads: everyone compares, votes, and the studio decides on common ground. [Real impact to refine.]',
  },
};

const SYS_SCREENS = [iconographie, typographies, valider];

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

function Lead({ id, lead }: { id: string; lead: Lead }) {
  return (
    <p className="lead illuminate title" id={id}>
      {renderWords(lead.pre, false, 'p')}
      {renderWords(lead.k, true, 'k')}
      {renderWords(lead.post, false, 'o')}
    </p>
  );
}

// Logo SVG inline recoloré via currentColor (le conteneur porte `color`).
function SvgLogo({ svg, className }: { svg: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector('svg');
    if (!el) return;
    // On retire width/height pour laisser le CSS dimensionner selon le contexte
    // (carte = largeur pilotée + hauteur auto ; puce = contain). Le viewBox reste.
    el.removeAttribute('width');
    el.removeAttribute('height');
    el.querySelectorAll('path, polygon, circle, rect, text').forEach((p) => {
      (p as SVGElement & { style: CSSStyleDeclaration }).style.fill = 'currentColor';
    });
  }, [svg]);
  return (
    <span
      ref={ref}
      className={className}
      aria-hidden="true"
      // biome-ignore lint: SVG de marque interne, contenu maîtrisé.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function BrowserFrame({ src, alt, url }: { src: string; alt: string; url: string }) {
  return (
    <span className="bwin">
      <span className="bbar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="baddr">{url}</span>
      </span>
      <span className="bshot">
        <img src={src} alt={alt} />
      </span>
    </span>
  );
}

function Comparator({
  hint,
  modelsLabel,
}: {
  hint: string;
  modelsLabel: string;
}) {
  const [pal, setPal] = useState<PaletteKey>('palette1');
  const [modelA, setModelA] = useState(3); // « le beau »
  const [modelB, setModelB] = useState(6); // « fluid »
  const styles = CARD_STYLES[pal];
  const cardStyle = (i: number) =>
    ({ ['--card-bg' as string]: styles[i].bg, ['--logo-color' as string]: styles[i].logo }) as CSSProperties;
  // Clic sur une puce : devient la direction A. Si c'était déjà B, B reprend
  // l'ancien A (on ne montre jamais deux fois le même logo).
  const pickModel = (i: number) => {
    if (i === modelA) return;
    if (i === modelB) setModelB(modelA);
    setModelA(i);
  };
  return (
    <div className="cmp reveal">
      <div className="cmp-head">
        <div className="cmp-palettes" role="group" aria-label="Palette">
          {(Object.keys(PALETTES) as PaletteKey[]).map((k) => (
            <button
              key={k}
              type="button"
              className={pal === k ? 'cmp-pal on' : 'cmp-pal'}
              onClick={() => setPal(k)}
            >
              <span className="cmp-dots">
                {PALETTES[k].colors.slice(0, 6).map((c, i) => (
                  <span key={`${k}-${i}`} style={{ background: c }} />
                ))}
              </span>
              {PALETTES[k].label}
            </button>
          ))}
        </div>
        <p className="cmp-hint">{hint}</p>
      </div>

      <div className="cmp-grid">
        <div className="cmp-card" style={cardStyle(0)}>
          <span className="cmp-badge">A</span>
          <SvgLogo svg={LOGOS[modelA]} className="cmp-logo" />
        </div>
        <div className="cmp-card" style={cardStyle(1)}>
          <span className="cmp-badge">B</span>
          <SvgLogo svg={LOGOS[modelB]} className="cmp-logo" />
        </div>
      </div>

      <div className="cmp-models">
        <span className="cmp-models-lbl label">{modelsLabel}</span>
        <div className="cmp-models-row">
          {LOGOS.map((svg, i) => (
            <button
              key={LOGO_NAMES[i]}
              type="button"
              className={i === modelA || i === modelB ? 'cmp-chip on' : 'cmp-chip'}
              aria-label={LOGO_NAMES[i]}
              onClick={() => pickModel(i)}
            >
              <SvgLogo svg={svg} className="cmp-chip-logo" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SymaShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];

    // Illumination mot par mot des titres
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

    // Scroll-spy du rail
    const navButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.nav button'));
    const links: Record<string, HTMLButtonElement> = {};
    navButtons.forEach((b) => {
      links[b.dataset.to || ''] = b;
    });
    const spy = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            navButtons.forEach((b) => b.classList.remove('on'));
            const l = links[(e.target as HTMLElement).id];
            if (l) l.classList.add('on');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    root.querySelectorAll('[data-sec]').forEach((s) => spy.observe(s));
    cleanups.push(() => spy.disconnect());

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

      {/* CORPS : rail + flux */}
      <div className="wrap">
        <div className="layout">
          <aside className="rail">
            <div className="label" style={{ marginBottom: '12px' }}>
              {t.study}
            </div>
            <p className="nm">{projet.title}</p>
            <p className="sub">{t.railSub}</p>
            <dl>
              {t.metaLabels.map((l, i) => (
                <div key={l}>
                  <dt className="label">{l}</dt>
                  <dd>{t.metaValues[i]}</dd>
                </div>
              ))}
            </dl>
            <ul className="nav">
              {t.nav.map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    data-to={`syma-s${i + 1}`}
                    onClick={() => {
                      const el = rootRef.current?.querySelector<HTMLElement>(
                        `#syma-s${i + 1}`,
                      );
                      if (el) scrollBodyTo(el.offsetTop - MTOP + 1, 700);
                    }}
                  >
                    <span className="n num">{i + 1}</span> {label}
                  </button>
                </li>
              ))}
            </ul>
            <a
              className="visit"
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.visit} <span aria-hidden="true">↗</span>
            </a>
          </aside>

          <main className="stream">
            <section className="sec" id="syma-s1" data-sec>
              <span className="ey label">01 — {t.nav[0]}</span>
              <Lead id="syma-s1lead" lead={t.s1lead} />
              <p className="note">{t.s1note}</p>
            </section>

            <section className="sec" id="syma-s2" data-sec>
              <span className="ey label">02 — {t.nav[1]}</span>
              <Lead id="syma-s2lead" lead={t.s2lead} />
              <p className="note">{t.s2note}</p>
              <div className="interv">
                <span className="label">{t.interventionsLabel}</span>
                <ul>
                  {t.interventions.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="sec" id="syma-s3" data-sec>
              <span className="ey label">03 — {t.nav[2]}</span>
              <Lead id="syma-s3lead" lead={t.s3lead} />
              <Comparator hint={t.cmpHint} modelsLabel={t.cmpModels} />
            </section>

            <section className="sec" id="syma-s4" data-sec>
              <span className="ey label">04 — {t.nav[3]}</span>
              <Lead id="syma-s4lead" lead={t.s4lead} />
              <div className="sys">
                {SYS_SCREENS.map((src, i) => (
                  <figure className="sys-item reveal" key={src}>
                    <button
                      type="button"
                      className="sys-shot"
                      aria-label={t.enlarge(t.sysScreens[i].b)}
                      onClick={() => setLbIndex(i)}
                    >
                      <BrowserFrame
                        src={src}
                        alt={t.sysScreens[i].b}
                        url="logo-syma.vercel.app"
                      />
                    </button>
                    <figcaption className="sys-cap">
                      <b>{t.sysScreens[i].b}</b>
                      {t.sysScreens[i].r}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            <section className="sec" id="syma-s5" data-sec>
              <span className="ey label">05 — {t.nav[4]}</span>
              <Lead id="syma-s5lead" lead={t.s5lead} />
              <p className="note">{t.s5note}</p>
            </section>
          </main>
        </div>
      </div>

      <ContactFooter />

      {lbIndex !== null && (
        <ImageLightbox
          images={SYS_SCREENS}
          currentIndex={lbIndex}
          onClose={() => setLbIndex(null)}
        />
      )}
    </div>
  );
}
