import '@fontsource-variable/bricolage-grotesque';
import './OnboardingRHShowcase.css';
import { useEffect, useRef, useState } from 'react';
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
    defiler: 'Défiler',
    enlarge: (name: string) => `Agrandir l'écran « ${name} »`,
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
    arrScreens: [
      { b: 'Accueil', r: ' — tout au même endroit' },
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
    rhScreens: [
      { b: 'Tableau de bord', r: ' — qui en est où' },
      { b: 'Modèles de bienvenue', r: ' — le contenu, réutilisable' },
      { b: 'Constructeur de parcours', r: ' — glisser-déposer, par Business Unit' },
      { b: 'Édition d’une étape', r: ' — média, documents, feedback' },
      { b: 'Équipe', r: ' — la vue RH' },
    ] as Cap[],
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
    defiler: 'Scroll',
    enlarge: (name: string) => `Enlarge the "${name}" screen`,
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
    arrScreens: [
      { b: 'Home', r: ' — everything in one place' },
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
    rhScreens: [
      { b: 'Dashboard', r: ' — who is where' },
      { b: 'Welcome templates', r: ' — reusable content' },
      { b: 'Journey builder', r: ' — drag-and-drop, per Business Unit' },
      { b: 'Editing a step', r: ' — media, documents, feedback' },
      { b: 'Team', r: ' — the HR view' },
    ] as Cap[],
    s5lead: {
      pre: 'A first day ',
      k: 'that no longer improvises',
      post: '.',
    } as Lead,
    s5note:
      'For HR, a clear view and zero forgotten step. For the newcomer, autonomy and the feeling of being expected. [Real impact and figures to refine.]',
  },
};

const ARRIVANT = [arrAccueil, arrParcours, arrDetail, arrSuccess, arrEquipe];
const RH = [rhDash, rhModeles, rhParcours, rhDetail, rhEquipe];
const ALL = [...ARRIVANT, ...RH];

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

function Gallery({
  screens,
  caps,
  url,
  defiler,
  enlarge,
  onOpen,
}: {
  screens: string[];
  caps: Cap[];
  url: string;
  defiler: string;
  enlarge: (name: string) => string;
  onOpen: (i: number) => void;
}) {
  return (
    <div className="hwrap">
      <div className="hpin">
        <div className="gbar">
          <div className="hbar">
            <span>{defiler}</span>
            <span className="tk">
              <i className="hbarfill" />
            </span>
          </div>
        </div>
        <div className="hviewport">
          <div className="htrack">
            {screens.map((src, i) => (
              <figure className="gitem" key={src}>
                <BrowserFrame
                  src={src}
                  alt={caps[i].b}
                  url={url}
                  onClick={() => onOpen(i)}
                  enlargeLabel={enlarge(caps[i].b)}
                />
                <figcaption className="c">
                  <b>{caps[i].b}</b>
                  {caps[i].r}
                </figcaption>
              </figure>
            ))}
            <div className="gspacer" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

type GalleryState = {
  hwrap: HTMLElement;
  hpin: HTMLElement | null;
  hview: HTMLElement | null;
  htrack: HTMLElement | null;
  hbar: HTMLElement | null;
  pinned: boolean;
  D: number;
};

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

    // ── Galeries épinglées (multi-instances) ─────────────────────
    const galleries: GalleryState[] = Array.from(
      root.querySelectorAll<HTMLElement>('.hwrap'),
    ).map((hwrap) => ({
      hwrap,
      hpin: hwrap.querySelector<HTMLElement>('.hpin'),
      hview: hwrap.querySelector<HTMLElement>('.hviewport'),
      htrack: hwrap.querySelector<HTMLElement>('.htrack'),
      hbar: hwrap.querySelector<HTMLElement>('.hbarfill'),
      pinned: false,
      D: 0,
    }));
    const pinModeOn = () => !reduce && matchMedia('(min-width: 861px)').matches;
    function measure(g: GalleryState) {
      const { hwrap, hpin, hview, htrack } = g;
      if (!hpin || !hview || !htrack) return;
      if (pinModeOn()) {
        hwrap.classList.remove('gfallback');
        hview.style.width = '';
        const left = hview.getBoundingClientRect().left;
        hview.style.width = window.innerWidth - left + 'px';
        g.D = Math.max(0, htrack.scrollWidth - hview.clientWidth);
        hwrap.style.height = hpin.offsetHeight + g.D + 'px';
        g.pinned = true;
      } else {
        hwrap.classList.add('gfallback');
        hwrap.style.height = 'auto';
        htrack.style.transform = 'none';
        hview.style.width = '';
        g.pinned = false;
      }
    }
    function hUpdate(g: GalleryState) {
      const { hwrap, hview, htrack, hbar } = g;
      if (!hview || !htrack || !hbar) return;
      if (!g.pinned) {
        const max = hview.scrollWidth - hview.clientWidth;
        const pp = max > 0 ? hview.scrollLeft / max : 0;
        hbar.style.width = 6 + pp * 94 + '%';
        return;
      }
      let p = g.D > 0 ? (MTOP - hwrap.getBoundingClientRect().top) / g.D : 0;
      p = Math.max(0, Math.min(1, p));
      htrack.style.transform = `translateX(${(-p * g.D).toFixed(1)}px)`;
      hbar.style.width = 6 + p * 94 + '%';
      hview.style.setProperty('--m-lfade', String(Math.min(1, p / 0.04)));
    }

    // ── Zoom de l'image hero au scroll (échelle 1 → 1.12) ────────
    const cover = root.querySelector<HTMLElement>('.m-hero .cover');
    const heroEl = root.querySelector<HTMLElement>('.m-hero');
    const heroZoom = () => {
      if (!cover || !heroEl || reduce) return;
      const h = heroEl.offsetHeight || 1;
      const p = Math.max(0, Math.min(1, document.body.scrollTop / h));
      cover.style.transform = p > 0.001 ? `scale(${(1 + p * 0.12).toFixed(4)})` : '';
    };

    function setup() {
      galleries.forEach(measure);
      galleries.forEach(hUpdate);
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
          galleries.forEach(hUpdate);
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

    // Glisser horizontal en mode repli (mobile / reduce), par galerie
    galleries.forEach((g) => {
      const hview = g.hview;
      if (!hview) return;
      let dn = false;
      let sx = 0;
      let sl = 0;
      const pd = (e: PointerEvent) => {
        if (g.pinned) return;
        dn = true;
        sx = e.clientX;
        sl = hview.scrollLeft;
        hview.setPointerCapture(e.pointerId);
      };
      const pm = (e: PointerEvent) => {
        if (!dn) return;
        hview.scrollLeft = sl - (e.clientX - sx);
      };
      const pu = () => {
        dn = false;
      };
      const ps = () => {
        if (!g.pinned) hUpdate(g);
      };
      hview.addEventListener('pointerdown', pd);
      hview.addEventListener('pointermove', pm);
      hview.addEventListener('pointerup', pu);
      hview.addEventListener('scroll', ps);
      cleanups.push(() => {
        hview.removeEventListener('pointerdown', pd);
        hview.removeEventListener('pointermove', pm);
        hview.removeEventListener('pointerup', pu);
        hview.removeEventListener('scroll', ps);
      });
    });

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

            <section className="sec galsec" id="onb-s3" data-sec>
              <span className="ey label">03 — {t.nav[2]}</span>
              <Lead id="onb-s3lead" lead={t.s3lead} />
              <Gallery
                screens={ARRIVANT}
                caps={t.arrScreens}
                url={ARR_URL}
                defiler={t.defiler}
                enlarge={t.enlarge}
                onOpen={(i) => setLbIndex(i)}
              />
            </section>

            {/* CHARNIÈRE FACE-À-FACE */}
            <div className="facing reveal">
              <p className="fphrase title">
                {renderWords(t.facingPhrase.pre, false, 'fp')}
                {renderWords(t.facingPhrase.k, true, 'fk')}
              </p>
              <div className="fgrid">
                <div className="fcol">
                  <BrowserFrame src={rhParcours} alt={t.rhScreens[2].b} url={RH_URL} />
                  <span className="fcap">{t.facingLeft}</span>
                </div>
                <div className="flink" aria-hidden="true">
                  <span>→</span>
                </div>
                <div className="fcol">
                  <BrowserFrame
                    src={arrParcours}
                    alt={t.arrScreens[1].b}
                    url={ARR_URL}
                  />
                  <span className="fcap">{t.facingRight}</span>
                </div>
              </div>
            </div>

            <section className="sec galsec" id="onb-s4" data-sec>
              <span className="ey label">04 — {t.nav[3]}</span>
              <Lead id="onb-s4lead" lead={t.s4lead} />
              <Gallery
                screens={RH}
                caps={t.rhScreens}
                url={RH_URL}
                defiler={t.defiler}
                enlarge={t.enlarge}
                onOpen={(i) => setLbIndex(ARRIVANT.length + i)}
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
