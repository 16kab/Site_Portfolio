import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import './CharteSpvieShowcase.css';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import couleurs from 'figma:asset/charte-couleurs.webp';
import typo from 'figma:asset/charte-typo.webp';
import typoEcriture from 'figma:asset/charte-typo-ecriture.webp';
import pattern from 'figma:asset/charte-pattern.webp';
import elements from 'figma:asset/charte-elements.webp';
import logo from 'figma:asset/charte-logo.webp';
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
import presentation from 'figma:asset/charte-presentation.webp';
import identite from 'figma:asset/charte-identite.webp';
import sommaire from 'figma:asset/charte-sommaire.webp';
import declinaisonsLogo from 'figma:asset/charte-declinaisons-logo.webp';
import restrictions from 'figma:asset/charte-restrictions.webp';
import typoEcriture2 from 'figma:asset/charte-typo-ecriture-2.webp';
import patternPrint from 'figma:asset/charte-pattern-print.webp';
import spvieGroupe from 'figma:asset/charte-spvie-groupe.webp';
import mockupPpt from 'figma:asset/charte-mockup-ppt.webp';
import slidesPpt from 'figma:asset/charte-slides-ppt.webp';
import brandStrategie from 'figma:asset/charte-brand-strategie.webp';
import assetIcones from 'figma:asset/charte-asset-icones.webp';
import autresMarques from 'figma:asset/charte-autres-marques.webp';

const preventFocusScroll = (e: { preventDefault: () => void }) => e.preventDefault();

// Slot = [plan (a/m/f), x%, y%, largeur vw]. a = 1er plan (grand, net,
// rapide) · m = 2e (moyen, léger flou) · f = 3e (petit, flou, lent).
type Slot = ['a' | 'm' | 'f', number, number, number];

// Plusieurs GABARITS de composition distincts (gros visuel à gauche/droite,
// haut/bas…) : chaque scène en utilise un différent → disposition variée.
// Le centre reste toujours libre pour le texte.
const V: Slot[][] = [
  [['a', 13, 46, 23], ['m', 87, 30, 19], ['m', 85, 75, 18], ['f', 34, 12, 12], ['f', 68, 90, 12], ['f', 12, 84, 11]],
  [['a', 87, 52, 23], ['m', 14, 32, 19], ['m', 16, 78, 18], ['f', 64, 11, 12], ['f', 30, 90, 12], ['f', 88, 84, 11]],
  [['a', 14, 32, 22], ['m', 86, 66, 19], ['m', 85, 24, 17], ['f', 32, 90, 12], ['f', 62, 12, 12], ['f', 12, 78, 11]],
  [['a', 86, 66, 22], ['m', 15, 32, 19], ['m', 17, 74, 18], ['f', 66, 13, 12], ['f', 40, 90, 12], ['f', 88, 26, 11]],
  [['a', 15, 68, 23], ['m', 85, 36, 19], ['m', 83, 80, 16], ['f', 40, 12, 12], ['f', 66, 88, 12], ['f', 13, 30, 11]],
  [['a', 85, 30, 22], ['m', 15, 58, 19], ['m', 30, 84, 17], ['f', 70, 86, 12], ['f', 12, 26, 12], ['f', 88, 76, 11]],
];

const PALETTE = [
  { hex: '#17332f', name: 'Vert-pin' },
  { hex: '#10d18a', name: 'Émeraude' },
  { hex: '#2b2440', name: 'Prune' },
  { hex: '#8b7ff0', name: 'Violet' },
  { hex: '#3d92d1', name: 'Bleu' },
  { hex: '#f5f6f3', name: 'Crème' },
];

// `imgs` = visuels EN RAPPORT avec le propos, ORDONNÉS (le 1er = 1er plan).
// `v` = index du gabarit de composition (différent d'une scène à l'autre).
const SCENES: { id: string; extra?: 'palette' | 'specimen' | 'steps' | 'gains'; v: number; imgs: string[] }[] = [
  { id: 'intro', v: 0, imgs: [mockupSite, photos, miseEnSituation, brandStrategie, assetIcones, autresMarques] },
  { id: 'contexte', v: 1, imgs: [presentation, identite, sommaire] },
  { id: 'logo', v: 2, imgs: [declinaisonsLogo, logo, zones] },
  { id: 'couleurs', extra: 'palette', v: 3, imgs: [couleurs, restrictions, marques] },
  { id: 'typo', extra: 'specimen', v: 4, imgs: [typo, typoEcriture, typoEcriture2] },
  { id: 'pattern', v: 5, imgs: [pattern, elements, patternPrint] },
  { id: 'marques', v: 2, imgs: [spvieGroupe, wealth, international, epargne] },
  { id: 'applications', v: 0, imgs: [mockup1, mockup2, mockup3, mockup4] },
  { id: 'demarche', extra: 'steps', v: 4, imgs: [reseaux, socialLinkedin, papeterie, mockupPpt] },
  { id: 'impact', extra: 'gains', v: 1, imgs: [carteVisite, socialFacebook, slidesPpt] },
];

const STRINGS = {
  fr: {
    heroEyebrow: ['Branding', 'Direction artistique', '2024'],
    metaRole: 'Direction artistique',
    metaClient: 'SPVIE Assurances',
    metaYear: '2024',
    pdf: 'Voir le brand book',
    cue: 'défiler',
    paletteLabel: 'La palette',
    specimenName: 'Outfit',
    steps: [
      { t: "Analyse de l'existant", b: 'La charte de 2017, ses éléments obsolètes et ses incohérences.' },
      { t: 'Nouvelle direction', b: 'Plus moderne, plus crédible, sans renier la marque.' },
      { t: 'Système de marque', b: 'Logo, palette, typo, iconographie, design system.' },
      { t: 'Présentation', b: 'À la direction de la communication et au cofondateur.' },
    ],
    gains: ['Non déployé (changement de direction)', "A ouvert la réflexion sur l'image de SPVIE", "A prouvé la capacité de l'équipe à penser l'identité à l'échelle stratégique"],
    zoom: 'Agrandir',
    scenes: {
      intro: { ey: '', pre: 'Redonner à SPVIE ', k: 'une image à la hauteur.', note: 'Une proposition complète — logo, couleurs, typographie, motifs — pour réunir tout le groupe sous une identité cohérente et crédible.' },
      contexte: { ey: '01 — Contexte', pre: 'Une charte de 2017, ', k: 'devenue incohérente.', note: "Les supports s'étaient multipliés, l'identité devenait hétérogène, et le style « casseur de codes » vieillissait mal pour l'assurance. La direction a challengé l'équipe design." },
      logo: { ey: '02 — Le logo', pre: 'Un logo ', k: 'plus net, plus sûr.', note: 'Le mot-symbole « spvie assurances » et sa signature « // » — déclinaisons, zones de protection et usages encadrés.' },
      couleurs: { ey: '03 — Les couleurs', pre: 'Une palette ', k: 'moderne et crédible.', note: 'Un vert-pin en socle, un émeraude en signal, des teintes secondaires pour rythmer les supports.' },
      typo: { ey: '04 — La typographie', pre: 'Une typographie ', k: 'géométrique et lisible.', note: 'Des titres affirmés, un corps clair — une lecture cohérente sur tous les supports.' },
      pattern: { ey: '05 — Le pattern', pre: 'Un motif ', k: '« // » qui signe tout.', note: 'Le « // » du logo devient un système de formes inclinées qui cadre les images et unifie la marque.' },
      marques: { ey: '06 — Les marques', pre: 'Un groupe, ', k: 'plusieurs marques.', note: 'Une identité harmonisée où chaque marque affirme son caractère par sa couleur — Wealth Management, International, Épargne & Retraite.' },
      applications: { ey: '07 — Les applications', pre: 'Une identité ', k: 'qui tient partout.', note: 'Papeterie, réseaux sociaux, présentations, web — le système décliné sur les supports du quotidien.' },
      demarche: { ey: '08 — La démarche', pre: "De l'analyse ", k: 'au système.', note: '' },
      impact: { ey: '09 — Impact', pre: 'Une vision ', k: 'qui a ouvert le débat.', note: '' },
    },
  },
  en: {
    heroEyebrow: ['Branding', 'Art direction', '2024'],
    metaRole: 'Art direction',
    metaClient: 'SPVIE Assurances',
    metaYear: '2024',
    pdf: 'View the brand book',
    cue: 'scroll',
    paletteLabel: 'The palette',
    specimenName: 'Outfit',
    steps: [
      { t: 'Analyzing the existing', b: 'The 2017 identity, its obsolete elements and inconsistencies.' },
      { t: 'A new direction', b: 'More modern, more credible, without disowning the brand.' },
      { t: 'A brand system', b: 'Logo, palette, type, iconography, design system.' },
      { t: 'Presentation', b: 'To the communications leadership and the co-founder.' },
    ],
    gains: ['Not deployed (leadership change)', "Opened the reflection on SPVIE's image", 'Proved the team could think identity at a strategic scale'],
    zoom: 'Enlarge',
    scenes: {
      intro: { ey: '', pre: 'Giving SPVIE ', k: 'an image worthy of the group.', note: 'A complete proposal — logo, colors, typography, patterns — to unite the whole group under one coherent, credible identity.' },
      contexte: { ey: '01 — Context', pre: 'A 2017 identity, ', k: 'grown inconsistent.', note: 'Assets had multiplied, the identity had become heterogeneous, and the "rule-breaking" style aged badly for insurance. Leadership challenged the design team.' },
      logo: { ey: '02 — The logo', pre: 'A logo ', k: 'sharper, more confident.', note: 'The "spvie assurances" wordmark and its "//" signature — variants, clear space and controlled usage.' },
      couleurs: { ey: '03 — Colors', pre: 'A palette ', k: 'modern and credible.', note: 'A pine green base, an emerald signal, secondary tones to pace the supports.' },
      typo: { ey: '04 — Typography', pre: 'Typography ', k: 'geometric and legible.', note: 'Bold headings, a clear body — consistent reading across every support.' },
      pattern: { ey: '05 — The pattern', pre: 'A "//" motif ', k: 'that signs everything.', note: 'The logo\'s "//" becomes a system of slanted shapes that frames images and unifies the brand.' },
      marques: { ey: '06 — The brands', pre: 'One group, ', k: 'several brands.', note: 'A harmonized identity where each brand asserts its character through color — Wealth Management, International, Savings & Retirement.' },
      applications: { ey: '07 — Applications', pre: 'An identity ', k: 'that holds up everywhere.', note: 'Stationery, social media, presentations, web — the system applied to everyday supports.' },
      demarche: { ey: '08 — The approach', pre: 'From analysis ', k: 'to system.', note: '' },
      impact: { ey: '09 — Impact', pre: 'A vision ', k: 'that opened the debate.', note: '' },
    },
  },
};

const TIER = { a: 'avant', m: 'milieu', f: 'fond' } as const;

// Clic sur une image : elle s'agrandit en douceur DEPUIS sa position (FLIP)
// vers un grand format centré, plutôt que d'ouvrir un visionneur d'un coup.
function ZoomView({ src, rect, onClose }: { src: string; rect: DOMRect; onClose: () => void }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [closing, setClosing] = useState(false);

  useLayoutEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const t = el.getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - (t.left + t.width / 2);
    const dy = rect.top + rect.height / 2 - (t.top + t.height / 2);
    const s = t.width ? rect.width / t.width : 1;
    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    requestAnimationFrame(() => {
      el.style.transition = 'transform .55s cubic-bezier(.2,.85,.25,1)';
      el.style.transform = 'none';
    });
  }, [rect]);

  const close = () => {
    if (closing) return;
    const el = imgRef.current;
    if (el) {
      const t = el.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - (t.left + t.width / 2);
      const dy = rect.top + rect.height / 2 - (t.top + t.height / 2);
      const s = t.width ? rect.width / t.width : 1;
      el.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
      el.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    }
    setClosing(true);
    window.setTimeout(onClose, 400);
  };

  return (
    <div
      className={`zoom-overlay${closing ? ' closing' : ''}`}
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <img
        ref={imgRef}
        className="zoom-img"
        src={src}
        alt=""
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
      />
    </div>
  );
}

export default function CharteSpvieShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<{ src: string; rect: DOMRect } | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Le texte est ÉPINGLÉ au centre (il ne bouge pas) : il apparaît en fondu
    // quand sa scène est en place, tient, puis se fond pour laisser la place au
    // texte suivant. Seules les IMAGES défilent (+ profondeur par plan).
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('.scene')).map((el, idx) => ({
      el,
      idx,
      text: el.querySelector<HTMLElement>('.scene-text'),
      imgs: Array.from(el.querySelectorAll<HTMLElement>('.scene-img')),
    }));
    const smooth = (x: number) => {
      const c = Math.max(0, Math.min(1, x));
      return c * c * (3 - 2 * c);
    };
    // Vitesse additionnelle par plan : 1er plan file plus vite, 3e plan traîne.
    const shift = (tr: string) => (tr === 'avant' ? 0.16 : tr === 'milieu' ? 0.06 : -0.1);
    const mfac = (tr: string) => (tr === 'avant' ? 34 : tr === 'milieu' ? 20 : 12);
    let mx = 0;
    let my = 0;

    function frame() {
      const vh = innerHeight;
      for (const sc of scenes) {
        const r = sc.el.getBoundingClientRect();
        const travel = sc.el.offsetHeight - vh || 1;
        const p = -r.top / travel; // 0 → 1 pendant l'épinglage
        if (sc.text) {
          let op = 1;
          if (!reduce) {
            const fin = smooth((p - 0.06) / 0.2);
            const fout = smooth((0.94 - p) / 0.2);
            op = sc.idx === 0 ? fout : Math.min(fin, fout);
          }
          sc.text.style.opacity = String(op);
          sc.text.style.pointerEvents = op < 0.05 ? 'none' : '';
        }
        if (!reduce) {
          const rel = r.top + r.height / 2 - vh / 2;
          for (const el of sc.imgs) {
            const tr = el.dataset.tier || 'milieu';
            const dx = -mx * mfac(tr);
            const dy = rel * shift(tr) - my * mfac(tr);
            el.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px))`;
          }
        }
      }
    }
    let ticking = false;
    const schedule = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          frame();
          ticking = false;
        });
        ticking = true;
      }
    };
    const onMouse = (e: MouseEvent) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
      schedule();
    };
    frame();
    document.body.addEventListener('scroll', schedule, { passive: true });
    if (!reduce) window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('resize', frame);
    return () => {
      document.body.removeEventListener('scroll', schedule);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', frame);
    };
  }, [lang]);

  const openZoom = (src: string, btn: HTMLElement) => {
    const img = btn.querySelector('img');
    if (img) setZoom({ src, rect: img.getBoundingClientRect() });
  };

  return (
    <div className="charte-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
      <PageMeta title={`${projet.title} — Alexis Kabiche`} description={projet.description} path={`/projets/${projet.id}`} />

      {SCENES.map((scene) => {
        const sc = t.scenes[scene.id as keyof typeof t.scenes];
        return (
          <section className="scene" key={scene.id}>
            <div className="scene-imgs">
              {scene.imgs.map((src, ii) => {
                const slot = V[scene.v][ii];
                if (!slot) return null;
                return (
                  <button
                    key={src + ii}
                    type="button"
                    className={`scene-img t-${TIER[slot[0]]}`}
                    data-tier={TIER[slot[0]]}
                    aria-label={t.zoom}
                    style={{ left: `${slot[1]}%`, top: `${slot[2]}%`, width: `${slot[3]}vw` }}
                    onMouseDown={preventFocusScroll}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      openZoom(src, e.currentTarget);
                    }}
                  >
                    <img src={src} alt="" loading="lazy" decoding="async" />
                  </button>
                );
              })}
            </div>

            <div className="scene-text">
              <div className="st-in">
                {scene.id === 'intro' ? (
                  <>
                    <span className="ey label">
                      {t.heroEyebrow.map((e) => (
                        <span key={e}>{e}</span>
                      ))}
                    </span>
                    <h1>
                      {sc.pre}
                      <em>{sc.k}</em>
                    </h1>
                    <p className="note">{sc.note}</p>
                    <div className="intro-meta">
                      <span>{t.metaRole}</span>
                      <span>{t.metaClient}</span>
                      <span>{t.metaYear}</span>
                      {projet.pdfUrl && (
                        <a href={projet.pdfUrl} target="_blank" rel="noopener noreferrer" className="pdf">
                          {t.pdf} <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {sc.ey && <span className="ey label">{sc.ey}</span>}
                    <h2 className="lead">
                      {sc.pre}
                      <em>{sc.k}</em>
                    </h2>
                    {sc.note && <p className="note">{sc.note}</p>}
                    {scene.extra === 'palette' && (
                      <div className="palette">
                        {PALETTE.map((c) => (
                          <span className="sw" key={c.hex}>
                            <span className="sw-chip" style={{ background: c.hex }} />
                            <span className="sw-hex num">{c.hex}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {scene.extra === 'specimen' && (
                      <div className="specimen">
                        <div className="spec-item">
                          <span className="spec-big">Aa</span>
                          <span className="spec-txt">
                            <span className="spec-name title">Outfit</span>
                            <span className="spec-tag label">Titres</span>
                          </span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-big spec-poppins">Aa</span>
                          <span className="spec-txt">
                            <span className="spec-name spec-poppins">Poppins</span>
                            <span className="spec-tag label">Corps de texte</span>
                          </span>
                        </div>
                      </div>
                    )}
                    {scene.extra === 'steps' && (
                      <ol className="steps">
                        {t.steps.map((s, i) => (
                          <li key={s.t}>
                            <span className="st-n num">{String(i + 1).padStart(2, '0')}</span>
                            <span className="st-t title">{s.t}</span>
                            <span className="st-b">{s.b}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {scene.extra === 'gains' && (
                      <ul className="gains">
                        {t.gains.map((g) => (
                          <li key={g}>{g}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <ContactFooter />

      {zoom && <ZoomView src={zoom.src} rect={zoom.rect} onClose={() => setZoom(null)} />}
    </div>
  );
}
