import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import './CharteSpvieShowcase.css';
import { useEffect, useRef, useState } from 'react';
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
import presentation from 'figma:asset/charte-presentation.webp';

const preventFocusScroll = (e: { preventDefault: () => void }) => e.preventDefault();

// [src, profondeur (b/m/f), x%, y%, largeur en vw] — les images flottent
// AUTOUR du texte central (on évite la zone centrale ~35-65%).
type Img = [string, 'b' | 'm' | 'f', number, number, number];

const PALETTE = [
  { hex: '#17332f', name: 'Vert-pin' },
  { hex: '#10d18a', name: 'Émeraude' },
  { hex: '#2b2440', name: 'Prune' },
  { hex: '#8b7ff0', name: 'Violet' },
  { hex: '#3d92d1', name: 'Bleu' },
  { hex: '#f5f6f3', name: 'Crème' },
];

// Ordre + contenu des scènes. `images` = visuels EN RAPPORT avec le propos.
const SCENES: { id: string; extra?: 'palette' | 'specimen' | 'steps' | 'gains'; h: number; images: Img[] }[] = [
  { id: 'intro', h: 130, images: [[mockupSite, 'f', 11, 16, 28], [couleurs, 'm', 15, 68, 19], [marques, 'm', 85, 30, 18], [photos, 'b', 82, 80, 16], [carteVisite, 'b', 30, 88, 13]] },
  { id: 'contexte', h: 130, images: [[presentation, 'f', 84, 20, 27], [mockup2, 'm', 15, 30, 19], [papeterie, 'b', 22, 82, 15]] },
  { id: 'logo', h: 140, images: [[logo, 'm', 16, 30, 22], [logoExplication, 'f', 86, 74, 28], [zones, 'b', 78, 22, 16]] },
  { id: 'couleurs', extra: 'palette', h: 145, images: [[couleurs, 'f', 85, 26, 28], [mockupSite, 'b', 15, 78, 17]] },
  { id: 'typo', extra: 'specimen', h: 140, images: [[typo, 'm', 15, 28, 21], [typoEcriture, 'f', 86, 76, 27]] },
  { id: 'pattern', h: 140, images: [[pattern, 'f', 15, 24, 28], [elements, 'm', 85, 72, 22]] },
  { id: 'marques', h: 150, images: [[wealth, 'm', 16, 26, 20], [international, 'f', 87, 30, 22], [epargne, 'm', 82, 78, 20], [marques, 'b', 20, 80, 16]] },
  { id: 'applications', h: 175, images: [[mockup1, 'm', 13, 22, 19], [mockup4, 'f', 88, 20, 24], [carteVisite, 'b', 30, 42, 13], [papeterie, 'm', 84, 60, 18], [socialLinkedin, 'b', 14, 66, 15], [reseaux, 'm', 68, 84, 18], [socialFacebook, 'b', 40, 88, 13], [mockup3, 'f', 90, 88, 22]] },
  { id: 'demarche', extra: 'steps', h: 150, images: [[mockup2, 'b', 13, 24, 16], [miseEnSituation, 'b', 87, 78, 17]] },
  { id: 'impact', extra: 'gains', h: 135, images: [[mockupSite, 'b', 14, 26, 17], [marques, 'b', 86, 74, 16]] },
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

const DEPTH = { b: 'back', m: 'mid', f: 'front' } as const;
const SCALE = { b: '0.62', m: '0.8', f: '1' } as const;
const OPA = { b: '0.5', m: '1', f: '0.88' } as const;

export default function CharteSpvieShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [lb, setLb] = useState<{ imgs: string[]; i: number } | null>(null);

  // Monde sombre assumé (comme la charte) : force le thème dark du site.
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

    // Le texte de chaque scène apparaît UNE FOIS à l'entrée (puis reste) :
    // rien ne disparaît en cours de route, tout se suit naturellement.
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.35 },
    );
    root.querySelectorAll<HTMLElement>('.scene-text').forEach((el) => {
      if (reduce) el.classList.add('in');
      else io.observe(el);
    });

    // Parallaxe de profondeur : les visuels dérivent selon la position de leur
    // scène dans le viewport (+ léger décalage souris). Aucune opacité pilotée
    // au scroll → les images entrent/sortent naturellement du cadre.
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('.scene')).map((el) => ({
      el,
      imgs: Array.from(el.querySelectorAll<HTMLElement>('.scene-img')),
    }));
    const shift = (d: string) => (d === 'front' ? 0.12 : d === 'mid' ? 0.05 : -0.08);
    const mfac = (d: string) => (d === 'front' ? 42 : d === 'mid' ? 26 : 16);
    let mx = 0;
    let my = 0;

    function frame() {
      if (reduce) return;
      const vh = innerHeight;
      for (const sc of scenes) {
        const r = sc.el.getBoundingClientRect();
        const rel = r.top + r.height / 2 - vh / 2; // 0 quand la scène est centrée
        for (const im of sc.imgs) {
          const d = im.dataset.depth || 'mid';
          const dx = -mx * mfac(d);
          const dy = rel * shift(d) - my * mfac(d);
          const s = im.dataset.scale || '1';
          im.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) scale(${s})`;
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
      io.disconnect();
      document.body.removeEventListener('scroll', schedule);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', frame);
    };
  }, [lang]);

  const openLb = (imgs: Img[], i: number) => setLb({ imgs: imgs.map((x) => x[0]), i });

  return (
    <div className="charte-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
      <PageMeta title={`${projet.title} — Alexis Kabiche`} description={projet.description} path={`/projets/${projet.id}`} />

      {SCENES.map((scene, si) => {
        const sc = t.scenes[scene.id as keyof typeof t.scenes];
        return (
          <section className="scene" key={scene.id}>
            <div className="scene-pin">
              <div className="scene-imgs">
                {scene.images.map((im, ii) => (
                  <button
                    key={im[0] + ii}
                    type="button"
                    className={`scene-img d-${DEPTH[im[1]]}`}
                    data-depth={DEPTH[im[1]]}
                    data-scale={SCALE[im[1]]}
                    data-op={OPA[im[1]]}
                    aria-label={t.zoom}
                    style={{ left: `${im[2]}%`, top: `${im[3]}%`, width: `${im[4]}vw` }}
                    onMouseDown={preventFocusScroll}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      openLb(scene.images, ii);
                    }}
                  >
                    <img src={im[0]} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>

              <div className="scene-text">
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
                        <span className="spec-big">Aa</span>
                        <span className="spec-name title">{t.specimenName}</span>
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
            {si === 0 && (
              <div className="cue label" aria-hidden="true">
                {t.cue}
              </div>
            )}
          </section>
        );
      })}

      <ContactFooter />

      {lb && <ImageLightbox images={lb.imgs} currentIndex={lb.i} onClose={() => setLb(null)} />}
    </div>
  );
}
