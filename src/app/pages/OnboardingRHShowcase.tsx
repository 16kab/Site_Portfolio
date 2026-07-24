import '@fontsource-variable/bricolage-grotesque';
import './OnboardingRHShowcase.css';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';
import { scrollBodyTo } from '../utils/scrollBodyTo';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import arrAccueil from 'figma:asset/onb-arrivant-accueil.webp';
import arrParcours from 'figma:asset/onb-arrivant-parcours.webp';
import arrDetail from 'figma:asset/onb-arrivant-detail-etape.webp';
import arrSuccess from 'figma:asset/onb-arrivant-success.webp';
import arrEquipe from 'figma:asset/onb-arrivant-equipe.webp';
import rhDash from 'figma:asset/onb-rh-tableau-de-bord.webp';
import rhModeles from 'figma:asset/onb-rh-modeles.webp';
import rhParcours from 'figma:asset/onb-rh-parcours.webp';
import rhDetail from 'figma:asset/onb-rh-detail-etape.webp';
import rhEquipe from 'figma:asset/onb-rh-equipe.webp';

const MTOP = 134; // doit refléter --mtop dans OnboardingRHShowcase.css

const ARR_URL = 'spvie.dev/onboarding';
const RH_URL = 'rh.spvie.dev';

type Lead = { pre: string; k: string; post: string };
type Cap = { b: string; r: string };

const STRINGS = {
  fr: {
    study: 'Étude de cas',
    heroEyebrow: ['Plateforme web interne', 'SPVIE', '2025'],
    thesisPre: "Faire d'un premier jour ",
    thesisEm: 'une vraie rencontre.',
    railSub:
      "Plateforme d'onboarding interne — accueillir les nouveaux, piloter côté RH.",
    metaLabels: ['Rôle', 'Contexte', 'Portée', 'Année'],
    metaValues: ['Product / UX Design', 'SPVIE · interne', 'Deux espaces', '2025'],
    nav: ['Contexte', 'Rôle', 'Arrivant', 'RH', 'Impact'],
    cue: '↓ étude de cas',
    s1lead: {
      pre: "L'intégration se jouait dans les mails et les tableurs — ",
      k: 'chacun improvisait.',
      post: '',
    } as Lead,
    s1note:
      "Pas de vue d'ensemble côté RH, pas de repères côté arrivant : le premier jour dépendait de qui s'en occupait.",
    s2lead: {
      pre: 'Product designer sur le projet, ',
      k: "du cadrage à l'interface.",
      post: '',
    } as Lead,
    s2note:
      "Recherche des deux besoins (RH et arrivant), architecture des deux espaces, UI et système de composants — en lien direct avec le développement.",
    interventionsLabel: 'Interventions',
    interventions: [
      'Recherche & entretiens (RH, managers, arrivants)',
      'Architecture des deux espaces et du parcours',
      'UI, système de composants, prototypes',
      "Suivi de l'intégration avec le développement",
    ],
    timelineTitle: 'Le parcours, de bout en bout',
    timeline: [
      { t: 'J-7', l: "Avant l'arrivée", d: 'On prépare, on accueille en amont.' },
      { t: 'Jour 1', l: 'La bienvenue', d: 'Un premier contact chaleureux.' },
      { t: '1re semaine', l: "L'immersion", d: 'Équipe, outils, repères.' },
      { t: 'J+30', l: 'Autonome', d: "L'intégration prend." },
    ],
    s3lead: {
      pre: 'Côté arrivant, ',
      k: 'un parcours qui donne envie',
      post: ' — clair, guidé, un peu gamifié.',
    } as Lead,
    accueilLabel: "L'accueil de l'arrivant",
    arrScreens: [
      { b: 'Mon parcours', r: ' — les étapes, une à une' },
      { b: 'Une étape', r: ' — le contenu, guidé' },
      { b: 'Bravo !', r: ' — la petite victoire' },
      { b: "L'équipe", r: " — l'organigramme, les visages" },
    ] as Cap[],
    facingPhrase: {
      pre: 'Ce que le RH construit, ',
      k: "l'arrivant le vit.",
    },
    facingLeft: 'Côté RH — le parcours se construit',
    facingRight: 'Côté arrivant — le parcours se vit',
    s4lead: {
      pre: 'Côté RH, ',
      k: "le pilotage en un coup d'œil",
      post: ' — et un parcours sur-mesure par métier.',
    } as Lead,
    rhSteps: [
      { t: 'Piloter', d: 'Qui en est où, les retards, les alertes.' },
      { t: 'Écrire une fois', d: "Le contenu d'accueil, réutilisable." },
      { t: 'Construire', d: 'Un tronc commun, des branches par BU.' },
      { t: 'Détailler', d: 'Média, documents, échéance, feedback.' },
      { t: 'Situer', d: "L'équipe et l'arborescence SPVIE." },
    ],
    storyZoom: "Agrandir l'écran affiché",
    s5lead: {
      pre: 'Un premier jour ',
      k: "qui ne s'improvise plus",
      post: '.',
    } as Lead,
    s5note:
      "Côté RH, une vue claire et zéro étape oubliée. Côté arrivant, de l'autonomie et le sentiment d'être attendu. [Impact réel et chiffres à affiner.]",
  },
  en: {
    study: 'Case study',
    heroEyebrow: ['Internal web platform', 'SPVIE', '2025'],
    thesisPre: 'Turning a first day into ',
    thesisEm: 'a real welcome.',
    railSub:
      'Internal onboarding platform — welcome newcomers, steer it from HR.',
    metaLabels: ['Role', 'Context', 'Scope', 'Year'],
    metaValues: ['Product / UX Design', 'SPVIE · internal', 'Two spaces', '2025'],
    nav: ['Context', 'Role', 'Newcomer', 'HR', 'Impact'],
    cue: '↓ case study',
    s1lead: {
      pre: 'Onboarding lived in emails and spreadsheets — ',
      k: 'everyone improvised.',
      post: '',
    } as Lead,
    s1note:
      'No overview for HR, no bearings for the newcomer: day one depended on whoever handled it.',
    s2lead: {
      pre: 'Product designer on the project, ',
      k: 'from framing to interface.',
      post: '',
    } as Lead,
    s2note:
      'Research on both needs (HR and newcomer), architecture of the two spaces, UI and component system — in direct contact with development.',
    interventionsLabel: 'Contributions',
    interventions: [
      'Research & interviews (HR, managers, newcomers)',
      'Architecture of the two spaces and the journey',
      'UI, component system, prototypes',
      'Onboarding follow-up with development',
    ],
    timelineTitle: 'The journey, end to end',
    timeline: [
      { t: 'D-7', l: 'Before arrival', d: 'Prepare and welcome ahead of time.' },
      { t: 'Day 1', l: 'The welcome', d: 'A warm first contact.' },
      { t: 'Week 1', l: 'Immersion', d: 'Team, tools, bearings.' },
      { t: 'D+30', l: 'Autonomous', d: 'Integration takes hold.' },
    ],
    s3lead: {
      pre: "On the newcomer's side, ",
      k: 'a journey you want to follow',
      post: ' — clear, guided, a little gamified.',
    } as Lead,
    accueilLabel: "The newcomer's home",
    arrScreens: [
      { b: 'My journey', r: ' — the steps, one by one' },
      { b: 'A step', r: ' — the content, guided' },
      { b: 'Bravo!', r: ' — the small win' },
      { b: 'The team', r: ' — the org chart, the faces' },
    ] as Cap[],
    facingPhrase: {
      pre: 'What HR builds, ',
      k: 'the newcomer lives.',
    },
    facingLeft: 'HR side — the journey is built',
    facingRight: 'Newcomer side — the journey is lived',
    s4lead: {
      pre: "On HR's side, ",
      k: 'pilot it at a glance',
      post: ' — and a tailored journey per role.',
    } as Lead,
    rhSteps: [
      { t: 'Steer', d: 'Who is where, delays, alerts.' },
      { t: 'Write once', d: 'Onboarding content, reused.' },
      { t: 'Build', d: 'A common trunk, branches per BU.' },
      { t: 'Refine', d: 'Media, documents, due date, feedback.' },
      { t: 'Map', d: 'The team and the SPVIE org chart.' },
    ],
    storyZoom: 'Enlarge the displayed screen',
    s5lead: {
      pre: 'A first day ',
      k: 'that no longer improvises',
      post: '.',
    } as Lead,
    s5note:
      'For HR, a clear view and zero forgotten step. For the newcomer, autonomy and the feeling of being expected. [Real impact and figures to refine.]',
  },
};

// L'accueil est mis en vedette dans le MacBook (hors galerie) ; la galerie
// arrivant montre les 4 écrans du parcours. ALL sert d'index à la lightbox.
const ARR_GALLERY = [arrParcours, arrDetail, arrSuccess, arrEquipe];
const RH = [rhDash, rhModeles, rhParcours, rhDetail, rhEquipe];
const ALL = [arrAccueil, ...ARR_GALLERY, ...RH];

// Découpe un segment en mots enveloppés dans des <span.wd> (JSX, pas de mutation
// DOM), pour que l'illumination survive aux re-rendus + au switch de langue.
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

function BrowserFrame({
  src,
  alt,
  url,
  onClick,
  enlargeLabel,
}: {
  src: string;
  alt: string;
  url: string;
  onClick?: () => void;
  enlargeLabel?: string;
}) {
  const body = (
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
  return onClick ? (
    <button
      type="button"
      className="gshot"
      onClick={onClick}
      aria-label={enlargeLabel}
    >
      {body}
    </button>
  ) : (
    <span className="gshot">{body}</span>
  );
}

// Pile de captures en éventail (façon « DisplayCards ») : cartes empilées,
// inclinées, en niveaux de gris + assombries, qui se colorisent et se soulèvent
// au survol. La dernière (front) est déjà en couleur.
function DisplayStack({
  cards,
  onOpen,
}: {
  cards: { src: string; alt: string; i: number }[];
  onOpen: (i: number) => void;
}) {
  const n = cards.length;
  return (
    <div className="dstack">
      {cards.map((c, idx) => (
        <button
          key={c.src}
          type="button"
          className="dcard"
          data-front={idx === n - 1 ? 'true' : undefined}
          style={
            {
              ['--tx' as string]: idx * 84 + 'px',
              ['--ty' as string]: idx * 52 + 'px',
              zIndex: idx,
            } as CSSProperties
          }
          onClick={(e) => {
            e.currentTarget.blur();
            onOpen(c.i);
          }}
          aria-label={c.alt}
        >
          <span className="dcard-in">
            <img src={c.src} alt={c.alt} />
          </span>
        </button>
      ))}
    </div>
  );
}

// Scrollytelling RH horizontal : tout est épinglé — le titre en haut, les 5
// étapes alignées en dessous (chacune avec sa jauge qui se remplit 0→100 % au
// scroll), le grand écran en fondu selon l'étape active (data-active en JS).
// Repli mobile/reduce : .story-flat = liste verticale, mini-capture par étape.
function Story({
  header,
  steps,
  screens,
  url,
  zoomLabel,
  onOpen,
}: {
  header: ReactNode;
  steps: { t: string; d: string }[];
  screens: string[];
  url: string;
  zoomLabel: string;
  onOpen: (i: number) => void;
}) {
  return (
    <div className="story" data-active="0">
      <div className="story-pin">
        {header}
        <ol className="story-steps">
          {steps.map((s, i) => (
            <li className={i === 0 ? 'story-step on' : 'story-step'} key={s.t}>
              <span className="story-bar" aria-hidden="true">
                <i className="story-fill" />
              </span>
              <span className="story-num num">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="story-t title">{s.t}</span>
              <span className="story-d">{s.d}</span>
              <span className="story-mini" aria-hidden="true">
                <img src={screens[i]} alt="" loading="lazy" />
              </span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="story-shot"
          aria-label={zoomLabel}
          onClick={(e) => {
            const idx = Number(
              e.currentTarget.closest('.story')?.getAttribute('data-active') ||
                0,
            );
            e.currentTarget.blur();
            onOpen(idx);
          }}
        >
          <span className="bwin">
            <span className="bbar">
              <span className="dot r" />
              <span className="dot y" />
              <span className="dot g" />
              <span className="baddr">{url}</span>
            </span>
            <span className="bshot story-frames">
              {screens.map((src, i) => (
                <img key={src} src={src} alt={steps[i].t} />
              ))}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

export default function OnboardingRHShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];

    // ── Illumination mot par mot de tous les titres ──────────────
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

    // ── Scroll-spy du rail ───────────────────────────────────────
    const navButtons = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.nav button'),
    );
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

    // ── Reveal au scroll ─────────────────────────────────────────
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    root.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // ── Zoom de l'image hero au scroll (échelle 1 → 1.12) ────────
    const cover = root.querySelector<HTMLElement>('.m-hero .cover');
    const heroEl = root.querySelector<HTMLElement>('.m-hero');
    const heroZoom = () => {
      if (!cover || !heroEl || reduce) return;
      const h = heroEl.offsetHeight || 1;
      const p = Math.max(0, Math.min(1, document.body.scrollTop / h));
      cover.style.transform = p > 0.001 ? `scale(${(1 + p * 0.12).toFixed(4)})` : '';
    };

    // ── Scrollytelling RH : écran épinglé, étape active au scroll ─
    const story = root.querySelector<HTMLElement>('.story');
    const storyPin = story?.querySelector<HTMLElement>('.story-pin') ?? null;
    const storySteps = story
      ? Array.from(story.querySelectorAll<HTMLElement>('.story-step'))
      : [];
    const storyImgs = story
      ? Array.from(story.querySelectorAll<HTMLElement>('.story-frames img'))
      : [];
    const storyFills = story
      ? Array.from(story.querySelectorAll<HTMLElement>('.story-fill'))
      : [];
    let storyD = 0;
    function measureStory() {
      if (!story || !storyPin) return;
      if (reduce || matchMedia('(max-width: 860px)').matches) {
        story.classList.add('story-flat');
        story.style.height = 'auto';
        storyD = 0;
        return;
      }
      story.classList.remove('story-flat');
      // ~55 % de viewport de défilement par étape : assez pour lire, sans traîner.
      storyD = Math.round(storySteps.length * innerHeight * 0.55);
      story.style.height = storyPin.offsetHeight + storyD + 'px';
    }
    function storyUpdate() {
      if (!story || storyD <= 0 || story.classList.contains('story-flat'))
        return;
      let p = (MTOP - story.getBoundingClientRect().top) / storyD;
      p = Math.max(0, Math.min(0.999, p));
      const raw = p * storySteps.length;
      // Jauge de chaque étape : 0→100 % au fil de son segment de scroll
      // (les étapes passées restent pleines, les suivantes vides).
      storyFills.forEach((f, i) => {
        let frac = Math.max(0, Math.min(1, raw - i));
        if (frac > 0.985) frac = 1;
        f.style.transform = `scaleX(${frac.toFixed(3)})`;
      });
      const idx = Math.min(storySteps.length - 1, Math.floor(raw));
      if (Number(story.dataset.active) !== idx) {
        story.dataset.active = String(idx);
        storySteps.forEach((s, i) => s.classList.toggle('on', i === idx));
        storyImgs.forEach((im, i) => {
          im.style.opacity = i === idx ? '1' : '0';
        });
      }
    }

    // ── Section arrivant : la pile déborde au-delà du bord gauche ────
    const fcards = root.querySelector<HTMLElement>('.feature-cards');
    function bleedFeature() {
      if (!fcards) return;
      fcards.style.width = '';
      if (matchMedia('(max-width: 860px)').matches) return;
      const r = fcards.getBoundingClientRect();
      const bleed = 120; // px au-delà du bord droit du viewport
      fcards.style.width = window.innerWidth - r.left + bleed + 'px';
    }

    function setup() {
      measureStory();
      storyUpdate();
      bleedFeature();
      litUpdate();
      heroZoom();
    }
    setup();
    // Re-mesure après chargement des captures (dimensions correctes)
    const imgs = Array.from(root.querySelectorAll('img'));
    let pending = imgs.length;
    const onImg = () => {
      pending -= 1;
      if (pending <= 0) setup();
    };
    imgs.forEach((im) => {
      if (im.complete) onImg();
      else {
        im.addEventListener('load', onImg, { once: true });
        im.addEventListener('error', onImg, { once: true });
      }
    });

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          litUpdate();
          storyUpdate();
          heroZoom();
          ticking = false;
        });
        ticking = true;
      }
    };
    document.body.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', setup);
    cleanups.push(() => document.body.removeEventListener('scroll', onScroll));
    cleanups.push(() => window.removeEventListener('resize', setup));

    return () => cleanups.forEach((fn) => fn());
  }, [lang]);

  return (
    <div className="onboarding-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
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
                    data-to={`onb-s${i + 1}`}
                    onClick={() => {
                      const el = rootRef.current?.querySelector<HTMLElement>(
                        `#onb-s${i + 1}`,
                      );
                      if (el) scrollBodyTo(el.offsetTop - MTOP + 1, 700);
                    }}
                  >
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>{' '}
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="stream">
            <section className="sec" id="onb-s1" data-sec>
              <span className="ey label">01 — {t.nav[0]}</span>
              <Lead id="onb-s1lead" lead={t.s1lead} />
              <p className="note">{t.s1note}</p>
            </section>

            <section className="sec" id="onb-s2" data-sec>
              <span className="ey label">02 — {t.nav[1]}</span>
              <Lead id="onb-s2lead" lead={t.s2lead} />
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

            {/* FRISE DU PARCOURS (J-7 → J+30) */}
            <div className="timeline reveal">
              <div className="thead label">{t.timelineTitle}</div>
              <ol className="tline">
                {t.timeline.map((n) => (
                  <li className="tnode" key={n.t}>
                    <span className="tdot" aria-hidden="true" />
                    <span className="tt">{n.t}</span>
                    <span className="tl">{n.l}</span>
                    <span className="td">{n.d}</span>
                  </li>
                ))}
              </ol>
            </div>

            <section className="sec" id="onb-s3" data-sec>
              <span className="ey label">03 — {t.nav[2]}</span>
              <div className="feature">
                <div className="feature-txt">
                  <Lead id="onb-s3lead" lead={t.s3lead} />
                </div>
                <div className="feature-cards">
                  <DisplayStack
                    cards={[
                      { src: arrAccueil, alt: t.accueilLabel, i: 0 },
                      { src: arrParcours, alt: t.arrScreens[0].b, i: 1 },
                      { src: arrSuccess, alt: t.arrScreens[2].b, i: 3 },
                    ]}
                    onOpen={(i) => setLbIndex(i)}
                  />
                </div>
              </div>
            </section>

            {/* CHARNIÈRE FACE-À-FACE */}
            <div className="facing reveal">
              <p className="fphrase title">
                {renderWords(t.facingPhrase.pre, false, 'fp')}
                {renderWords(t.facingPhrase.k, true, 'fk')}
              </p>
              <div className="fgrid">
                <div className="fcol">
                  <BrowserFrame src={rhParcours} alt={t.rhSteps[2].t} url={RH_URL} />
                  <span className="fcap">{t.facingLeft}</span>
                </div>
                <div className="flink" aria-hidden="true">
                  <span>→</span>
                </div>
                <div className="fcol">
                  <BrowserFrame
                    src={arrParcours}
                    alt={t.arrScreens[0].b}
                    url={ARR_URL}
                  />
                  <span className="fcap">{t.facingRight}</span>
                </div>
              </div>
            </div>

            <section className="sec" id="onb-s4" data-sec>
              <span className="ey label">04 — {t.nav[3]}</span>
              <Story
                header={<Lead id="onb-s4lead" lead={t.s4lead} />}
                steps={t.rhSteps}
                screens={RH}
                url={RH_URL}
                zoomLabel={t.storyZoom}
                onOpen={(i) => setLbIndex(1 + ARR_GALLERY.length + i)}
              />
            </section>

            <section className="sec" id="onb-s5" data-sec>
              <span className="ey label">05 — {t.nav[4]}</span>
              <Lead id="onb-s5lead" lead={t.s5lead} />
              <p className="note">{t.s5note}</p>
            </section>
          </main>
        </div>
      </div>

      <ContactFooter />

      {lbIndex !== null && (
        <ImageLightbox
          images={ALL}
          currentIndex={lbIndex}
          onClose={() => setLbIndex(null)}
        />
      )}
    </div>
  );
}
