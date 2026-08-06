import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import './CharteSpvieShowcase.css';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import couleurs from 'figma:asset/charte-couleurs.webp';
import typo from 'figma:asset/charte-typo.webp';
import typoEcriture from 'figma:asset/charte-typo-ecriture.webp';
import pattern from 'figma:asset/charte-pattern.webp';
import elements from 'figma:asset/charte-elements.webp';
import logo from 'figma:asset/charte-logo.webp';
import logoExplication from 'figma:asset/charte-logo-explication.webp';
import zones from 'figma:asset/charte-zones.webp';
import marques from 'figma:asset/charte-marques.webp';
import wealth from 'figma:asset/charte-wealth.webp';
import international from 'figma:asset/charte-international.webp';
import epargne from 'figma:asset/charte-epargne.webp';
import photos from 'figma:asset/charte-photos.webp';
import carteVisite from 'figma:asset/charte-carte-visite.webp';
import papeterie from 'figma:asset/charte-papeterie.webp';
import socialLinkedin from 'figma:asset/charte-social-linkedin.webp';
import socialFacebook from 'figma:asset/charte-social-facebook.webp';
import reseaux from 'figma:asset/charte-reseaux.webp';
import mockup1 from 'figma:asset/charte-mockup-1.webp';
import mockup2 from 'figma:asset/charte-mockup-2.webp';
import mockup3 from 'figma:asset/charte-mockup-3.webp';
import mockup4 from 'figma:asset/charte-mockup-4.webp';
import mockupSite from 'figma:asset/charte-mockup-site.webp';
import miseEnSituation from 'figma:asset/charte-mise-en-situation.webp';

const preventFocusScroll = (e: { preventDefault: () => void }) => e.preventDefault();

// Champ parallaxe : slides curées, positionnées (x/y en %), à 3 profondeurs.
// back = petit/sombre/flou/lent · mid = net · front = grand/flou/rapide (devant le texte).
type FieldItem = { src: string; depth: 'back' | 'mid' | 'front'; x: number; y: number; w: number };
const FIELD: FieldItem[] = [
  { src: mockupSite, depth: 'front', x: 9, y: 14, w: 30 },
  { src: photos, depth: 'front', x: 92, y: 86, w: 32 },
  { src: couleurs, depth: 'mid', x: 15, y: 66, w: 21 },
  { src: mockup1, depth: 'mid', x: 84, y: 30, w: 22 },
  { src: marques, depth: 'mid', x: 80, y: 74, w: 19 },
  { src: carteVisite, depth: 'back', x: 30, y: 26, w: 15 },
  { src: pattern, depth: 'back', x: 68, y: 16, w: 15 },
  { src: socialLinkedin, depth: 'back', x: 26, y: 88, w: 14 },
  { src: mockup3, depth: 'back', x: 58, y: 92, w: 14 },
];

const APPS = [mockup1, mockup2, mockup3, mockup4, mockupSite, carteVisite, papeterie, socialLinkedin, socialFacebook, reseaux, miseEnSituation, photos];
const LOGO_SLIDES = [logo, logoExplication, zones];
const MARQUE_SLIDES = [marques, wealth, international, epargne];

const STRINGS = {
  fr: {
    study: 'Étude de cas',
    heroEyebrow: ['Branding', 'Direction artistique', '2024'],
    manifestoPre: 'Redonner à SPVIE ',
    manifestoK: 'une image à la hauteur.',
    manifestoSub:
      'Une proposition complète — logo, couleurs, typographie, motifs — pour réunir tout le groupe sous une identité cohérente et crédible.',
    cue: '↓ étude de cas',
    metaLabels: ['Rôle', 'Client', 'Nature', 'Année'],
    metaValues: ['Direction artistique', 'SPVIE Assurances', "Système d'identité", '2024'],
    pdf: 'Voir le brand book',
    s1eyebrow: '01 — Contexte',
    s1pre: 'Une charte de 2017, ',
    s1k: 'devenue incohérente.',
    s1note:
      "La charte datait de 2017. Les supports s'étaient multipliés, l'identité devenait hétérogène, et le style historique « casseur de codes » vieillissait mal pour le secteur de l'assurance. La direction de la communication a challengé l'équipe design pour imaginer une évolution de l'identité du groupe.",
    interventionsLabel: 'Ma proposition',
    interventions: ['Évolution du logo', 'Nouvelle palette de couleurs', 'Nouvelle typographie', "Système d'iconographie", 'Base de design system'],
    s2eyebrow: '02 — Le logo',
    s2pre: 'Un logo ',
    s2k: 'plus net, plus sûr.',
    s2note: 'Le mot-symbole « spvie assurances » et sa signature « // » — déclinaisons, zones de protection et usages encadrés.',
    logoCaps: ['Logo & déclinaisons', 'Explication du logo', 'Zones de protection'],
    s3eyebrow: '03 — Les couleurs',
    s3pre: 'Une palette ',
    s3k: 'moderne et crédible.',
    s3note: 'Un vert-pin profond en socle, un émeraude franc en signal, et des teintes secondaires pour rythmer les supports.',
    paletteLabel: 'La palette',
    s4eyebrow: '04 — La typographie',
    s4pre: 'Une typographie ',
    s4k: 'géométrique et lisible.',
    s4note: 'Des titres géométriques affirmés, un corps clair — pour une lecture cohérente sur tous les supports.',
    s5eyebrow: '05 — Le pattern',
    s5pre: 'Un motif ',
    s5k: '« // » qui signe tout.',
    s5note: 'Le « // » du logo devient un système de formes inclinées qui cadre les images et unifie la marque, print comme digital.',
    s6eyebrow: '06 — Les marques',
    s6pre: 'Un groupe, ',
    s6k: 'plusieurs marques.',
    s6note: 'Une identité harmonisée où chaque marque affirme son caractère par sa couleur.',
    marqueCaps: ['Les marques du groupe', 'Wealth Management', 'International', 'Épargne & Retraite'],
    s7eyebrow: '07 — Les applications',
    s7pre: 'Une identité ',
    s7k: 'qui tient partout.',
    s7note: 'Papeterie, réseaux sociaux, présentations, web — le système décliné sur les supports du quotidien.',
    s8eyebrow: '08 — La démarche',
    s8pre: "De l'analyse ",
    s8k: 'au système.',
    steps: [
      { t: "Analyse de l'existant", b: 'Étude de la charte de 2017 : éléments obsolètes et incohérences accumulées entre les supports.' },
      { t: "Nouvelle direction visuelle", b: "Une direction plus moderne et crédible, ancrée dans l'univers de l'assurance, sans renier l'identité historique." },
      { t: 'Système de marque', b: 'Logo, palette, typographies, iconographie et principes de design system — un tout cohérent.' },
      { t: 'Présentation stratégique', b: 'Proposition présentée à la direction de la communication et au cofondateur pour nourrir la réflexion.' },
    ],
    s9eyebrow: '09 — Impact',
    s9pre: 'Une vision ',
    s9k: 'qui a ouvert le débat.',
    gains: ['Non déployé (changement de direction)', "A ouvert la réflexion sur l'évolution de l'image de SPVIE", "A démontré la capacité de l'équipe design à penser l'identité à une échelle stratégique"],
    zoom: 'Agrandir',
  },
  en: {
    study: 'Case study',
    heroEyebrow: ['Branding', 'Art direction', '2024'],
    manifestoPre: 'Giving SPVIE ',
    manifestoK: 'an image worthy of the group.',
    manifestoSub:
      'A complete proposal — logo, colors, typography, patterns — to unite the whole group under one coherent, credible identity.',
    cue: '↓ case study',
    metaLabels: ['Role', 'Client', 'Type', 'Year'],
    metaValues: ['Art direction', 'SPVIE Assurances', 'Brand identity system', '2024'],
    pdf: 'View the brand book',
    s1eyebrow: '01 — Context',
    s1pre: 'A 2017 identity, ',
    s1k: 'grown inconsistent.',
    s1note:
      'The guidelines dated back to 2017. Assets had multiplied, the identity had become heterogeneous, and the historical "rule-breaking" style was ageing badly for the insurance sector. The communications department challenged the design team to imagine an evolution of the group identity.',
    interventionsLabel: 'My proposal',
    interventions: ['Logo evolution', 'New color palette', 'New typography', 'Iconography system', 'Design-system foundations'],
    s2eyebrow: '02 — The logo',
    s2pre: 'A logo ',
    s2k: 'sharper, more confident.',
    s2note: 'The "spvie assurances" wordmark and its "//" signature — variants, clear space and controlled usage.',
    logoCaps: ['Logo & variants', 'Logo rationale', 'Clear space'],
    s3eyebrow: '03 — Colors',
    s3pre: 'A palette ',
    s3k: 'modern and credible.',
    s3note: 'A deep pine green as the base, a clear emerald as the signal, and secondary tones to pace the supports.',
    paletteLabel: 'The palette',
    s4eyebrow: '04 — Typography',
    s4pre: 'Typography ',
    s4k: 'geometric and legible.',
    s4note: 'Bold geometric headings, a clear body — for consistent reading across every support.',
    s5eyebrow: '05 — The pattern',
    s5pre: 'A "//" motif ',
    s5k: 'that signs everything.',
    s5note: 'The logo\'s "//" becomes a system of slanted shapes that frames images and unifies the brand, print and digital.',
    s6eyebrow: '06 — The brands',
    s6pre: 'One group, ',
    s6k: 'several brands.',
    s6note: 'A harmonized identity where each brand asserts its character through its color.',
    marqueCaps: ['The group brands', 'Wealth Management', 'International', 'Savings & Retirement'],
    s7eyebrow: '07 — Applications',
    s7pre: 'An identity ',
    s7k: 'that holds up everywhere.',
    s7note: 'Stationery, social media, presentations, web — the system applied to everyday supports.',
    s8eyebrow: '08 — The approach',
    s8pre: 'From analysis ',
    s8k: 'to system.',
    steps: [
      { t: 'Analyzing the existing', b: 'Studying the 2017 guidelines: obsolete elements and inconsistencies accumulated across supports.' },
      { t: 'A new visual direction', b: 'A more modern, credible direction, rooted in insurance, without disowning the historical identity.' },
      { t: 'A brand system', b: 'Logo, palette, typography, iconography and design-system principles — one coherent whole.' },
      { t: 'Strategic presentation', b: 'Proposal presented to the communications leadership and co-founder to feed the reflection.' },
    ],
    s9eyebrow: '09 — Impact',
    s9pre: 'A vision ',
    s9k: 'that opened the debate.',
    gains: ['Not deployed (leadership change)', "Opened the reflection on SPVIE's image evolution", 'Proved the design team could think identity at a strategic scale'],
    zoom: 'Enlarge',
  },
};

const PALETTE = [
  { hex: '#17332f', name: 'Vert-pin' },
  { hex: '#10d18a', name: 'Émeraude' },
  { hex: '#2b2440', name: 'Prune' },
  { hex: '#8b7ff0', name: 'Violet' },
  { hex: '#3d92d1', name: 'Bleu' },
  { hex: '#f5f6f3', name: 'Crème' },
];

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

function Lead({ id, pre, k }: { id: string; pre: string; k: string }) {
  return (
    <p className="lead illuminate title" id={id}>
      {renderWords(pre, false, 'p')}
      {renderWords(k, true, 'k')}
    </p>
  );
}

// Bloc « slides » cliquables (cadre + légende) → lightbox.
function SlideTiles({
  imgs,
  caps,
  onOpen,
  cols,
}: {
  imgs: string[];
  caps: string[];
  onOpen: (imgs: string[], i: number) => void;
  cols?: number;
}) {
  return (
    <div className="slides reveal" style={cols ? ({ ['--cols' as string]: String(cols) } as CSSProperties) : undefined}>
      {imgs.map((src, i) => (
        <button
          key={src}
          type="button"
          className="slide-tile"
          onMouseDown={preventFocusScroll}
          onClick={(e) => {
            e.currentTarget.blur();
            onOpen(imgs, i);
          }}
        >
          <span className="slide-shot">
            <img src={src} alt={caps[i] || ''} loading="lazy" decoding="async" />
          </span>
          {caps[i] && <span className="slide-cap">{caps[i]}</span>}
        </button>
      ))}
    </div>
  );
}

export default function CharteSpvieShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [lb, setLb] = useState<{ imgs: string[]; i: number } | null>(null);
  const openLb = (imgs: string[], i: number) => setLb({ imgs, i });

  // Monde sombre assumé (comme la charte) : force le thème dark du site
  // (header/footer collent), puis on habille tout en vert-pin.
  useEffect(() => {
    const el = document.documentElement;
    const wasDark = el.classList.contains('dark');
    if (!wasDark) el.classList.add('dark');
    return () => {
      if (!wasDark) el.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];

    // Illumination mot-par-mot des titres
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
        const nn = it.sp.length;
        it.sp.forEach((s, i) => {
          s.style.opacity = String(Math.max(0.16, Math.min(1, p * nn - i)));
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

    // Parallaxe du champ (souris + scroll) + manifeste
    const stage = root.querySelector<HTMLElement>('.stage');
    const items = Array.from(root.querySelectorAll<HTMLElement>('.field-item'));
    const manifesto = root.querySelector<HTMLElement>('.manifesto');
    const factor = (d: string) => (d === 'front' ? 1 : d === 'mid' ? 0.45 : 0.2);
    let mx = 0;
    let my = 0;
    function apply() {
      const vh = innerHeight;
      const sp = Math.max(0, Math.min(1.3, document.body.scrollTop / vh));
      items.forEach((el) => {
        const f = factor(el.dataset.depth || 'mid');
        const tx = reduce ? 0 : -mx * f * 46;
        const ty = reduce ? 0 : -my * f * 46 - sp * f * 220;
        const s = Number(el.dataset.scale || 1);
        el.style.transform = `translate(calc(-50% + ${tx.toFixed(1)}px), calc(-50% + ${ty.toFixed(1)}px)) scale(${s})`;
        el.style.opacity = String(Math.max(0, (Number(el.dataset.op) || 1) * (1 - sp * 0.95)));
      });
      if (manifesto) {
        manifesto.style.transform = reduce ? '' : `translateY(${(-sp * 60).toFixed(1)}px)`;
        manifesto.style.opacity = String(Math.max(0, 1 - sp * 1.15));
      }
      if (stage) stage.style.setProperty('--sp', sp.toFixed(3));
    }
    const onMouse = (e: MouseEvent) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
      apply();
    };
    apply();
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          litUpdate();
          apply();
          ticking = false;
        });
        ticking = true;
      }
    };
    document.body.addEventListener('scroll', onScroll, { passive: true });
    if (!reduce) window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('resize', apply);
    cleanups.push(() => document.body.removeEventListener('scroll', onScroll));
    cleanups.push(() => window.removeEventListener('mousemove', onMouse));
    cleanups.push(() => window.removeEventListener('resize', apply));

    return () => cleanups.forEach((fn) => fn());
  }, [lang]);

  return (
    <div className="charte-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
      <PageMeta title={`${projet.title} — Alexis Kabiche`} description={projet.description} path={`/projets/${projet.id}`} />

      {/* SIGNATURE — champ parallaxe */}
      <section className="stage">
        <span className="slashes slashes-xl s1" aria-hidden="true" />
        <span className="slashes slashes-xl s2" aria-hidden="true" />
        <div className="field" aria-hidden="true">
          {FIELD.map((it) => (
            <span
              key={it.src}
              className={`field-item d-${it.depth}`}
              data-depth={it.depth}
              data-scale={it.depth === 'front' ? '1' : it.depth === 'mid' ? '0.82' : '0.6'}
              data-op={it.depth === 'back' ? '0.55' : it.depth === 'front' ? '0.9' : '1'}
              style={{ left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}vw` }}
            >
              <img src={it.src} alt="" loading="lazy" decoding="async" />
            </span>
          ))}
        </div>
        <div className="manifesto">
          <span className="ey label">
            {t.heroEyebrow.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </span>
          <h1>
            {t.manifestoPre}
            <em>{t.manifestoK}</em>
          </h1>
          <p className="msub">{t.manifestoSub}</p>
        </div>
        <div className="cue label" aria-hidden="true">
          {t.cue}
        </div>
      </section>

      {/* BARRE MÉTA */}
      <div className="wrap">
        <div className="metabar reveal">
          <span className="metabar-study label">{t.study}</span>
          <dl className="metabar-meta">
            {t.metaLabels.map((l, i) => (
              <div key={l}>
                <dt className="label">{l}</dt>
                <dd>{t.metaValues[i]}</dd>
              </div>
            ))}
          </dl>
          {projet.pdfUrl && (
            <a className="visit" href={projet.pdfUrl} target="_blank" rel="noopener noreferrer">
              {t.pdf} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>

      {/* 01 CONTEXTE */}
      <section className="wrap sec">
        <span className="ey label">{t.s1eyebrow}</span>
        <Lead id="ch-s1" pre={t.s1pre} k={t.s1k} />
        <div className="sec-cols">
          <p className="note">{t.s1note}</p>
          <div className="interv-wrap">
            <span className="interv-label label">{t.interventionsLabel}</span>
            <ul className="interv">
              {t.interventions.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 02 LOGO */}
      <section className="wrap sec">
        <span className="ey label">{t.s2eyebrow}</span>
        <Lead id="ch-s2" pre={t.s2pre} k={t.s2k} />
        <p className="note">{t.s2note}</p>
        <SlideTiles imgs={LOGO_SLIDES} caps={t.logoCaps} onOpen={openLb} cols={3} />
      </section>

      {/* 03 COULEURS */}
      <section className="wrap sec">
        <span className="ey label">{t.s3eyebrow}</span>
        <Lead id="ch-s3" pre={t.s3pre} k={t.s3k} />
        <p className="note">{t.s3note}</p>
        <div className="palette reveal">
          {PALETTE.map((c) => (
            <div className="sw" key={c.hex}>
              <span className="sw-chip" style={{ background: c.hex }} />
              <span className="sw-name">{c.name}</span>
              <span className="sw-hex num">{c.hex}</span>
            </div>
          ))}
        </div>
        <SlideTiles imgs={[couleurs]} caps={[t.paletteLabel]} onOpen={openLb} cols={1} />
      </section>

      {/* 04 TYPO */}
      <section className="wrap sec">
        <span className="ey label">{t.s4eyebrow}</span>
        <Lead id="ch-s4" pre={t.s4pre} k={t.s4k} />
        <p className="note">{t.s4note}</p>
        <div className="specimen reveal">
          <span className="spec-big">Aa</span>
          <div className="spec-txt">
            <span className="spec-name title">Outfit</span>
            <span className="spec-glyphs">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz 0123456789</span>
          </div>
        </div>
        <SlideTiles imgs={[typo, typoEcriture]} caps={['Titres', 'Corps']} onOpen={openLb} cols={2} />
      </section>

      {/* 05 PATTERN */}
      <section className="wrap sec">
        <span className="ey label">{t.s5eyebrow}</span>
        <Lead id="ch-s5" pre={t.s5pre} k={t.s5k} />
        <p className="note">{t.s5note}</p>
        <SlideTiles imgs={[pattern, elements]} caps={['Le pattern', 'Éléments graphiques']} onOpen={openLb} cols={2} />
      </section>

      {/* 06 MARQUES */}
      <section className="wrap sec">
        <span className="ey label">{t.s6eyebrow}</span>
        <Lead id="ch-s6" pre={t.s6pre} k={t.s6k} />
        <p className="note">{t.s6note}</p>
        <SlideTiles imgs={MARQUE_SLIDES} caps={t.marqueCaps} onOpen={openLb} cols={2} />
      </section>

      {/* 07 APPLICATIONS */}
      <section className="wrap sec">
        <span className="ey label">{t.s7eyebrow}</span>
        <Lead id="ch-s7" pre={t.s7pre} k={t.s7k} />
        <p className="note">{t.s7note}</p>
        <div className="apps reveal">
          {APPS.map((src, i) => (
            <button
              key={src}
              type="button"
              className="app-tile"
              aria-label={t.zoom}
              onMouseDown={preventFocusScroll}
              onClick={(e) => {
                e.currentTarget.blur();
                openLb(APPS, i);
              }}
            >
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </section>

      {/* 08 DÉMARCHE */}
      <section className="wrap sec">
        <span className="ey label">{t.s8eyebrow}</span>
        <Lead id="ch-s8" pre={t.s8pre} k={t.s8k} />
        <ol className="demarche reveal">
          {t.steps.map((s, i) => (
            <li className="dem-step" key={s.t}>
              <span className="dem-n num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="dem-t title">{s.t}</h3>
                <p className="dem-b">{s.b}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 09 IMPACT */}
      <section className="wrap sec">
        <span className="ey label">{t.s9eyebrow}</span>
        <Lead id="ch-s9" pre={t.s9pre} k={t.s9k} />
        <ul className="gains reveal">
          {t.gains.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>

      <ContactFooter />

      {lb && <ImageLightbox images={lb.imgs} currentIndex={lb.i} onClose={() => setLb(null)} />}
    </div>
  );
}
