import '@fontsource/raleway/400.css';
import '@fontsource/raleway/500.css';
import '@fontsource/raleway/600.css';
import '@fontsource/raleway/700.css';
import '@fontsource/raleway/800.css';
import './ParcoursB2CShowcase.css';
import { useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import stepType from 'figma:asset/spvie-b2c-01-type.webp';
import stepBesoins from 'figma:asset/spvie-b2c-02-besoins.webp';
import stepBudget from 'figma:asset/spvie-b2c-03-budget.webp';
import stepCouverture from 'figma:asset/spvie-b2c-04-couverture.webp';
import stepLoader from 'figma:asset/spvie-b2c-loader.webp';
import stepOffre from 'figma:asset/spvie-b2c-05-offre.webp';
import stepComparateur from 'figma:asset/spvie-b2c-comparateur.webp';
import stepCoordonnees from 'figma:asset/spvie-b2c-06-coordonnees.webp';
import stepRecap from 'figma:asset/spvie-b2c-07-recap.webp';

// Ordre du walkthrough : loader avant l'offre, comparateur après.
const STEP_IMAGES = [
  stepType,
  stepBesoins,
  stepBudget,
  stepCouverture,
  stepLoader,
  stepOffre,
  stepComparateur,
  stepCoordonnees,
  stepRecap,
];

const preventFocusScroll = (e: { preventDefault: () => void }) => e.preventDefault();

const STRINGS = {
  fr: {
    heroEyebrow: ['Tunnel de conversion', 'SPVIE Assurances', '2024-2025'],
    thesisPre: 'Un tunnel de 30 minutes, ',
    thesisEm: 'ressenti comme 12.',
    metaLabels: ['Rôle', 'Client', 'Nature', 'Année', 'Outils'],
    metaValues: ['UX/UI Designer', 'SPVIE Assurances', 'Tunnel de conversion', '2024-2025', 'Figma · ContentSquare · Matomo'],
    cue: '↓ étude de cas',
    // 01 Contexte
    s1eyebrow: '01 — Contexte',
    s1pre: 'Le tunnel le plus stratégique du groupe, ',
    s1k: 'figé et en perte de vitesse.',
    s1note:
      'Design vieillissant, navigation confuse, offres présentées sans pédagogie. Les analyses Matomo & ContentSquare montraient une hésitation constante et un drop majeur au moment de choisir son offre — un parcours qui paraissait long et complexe.',
    interventionsLabel: 'Mon rôle',
    interventions: [
      'Benchmark concurrentiel',
      'Structuration des user flows',
      'Architecture d’information',
      'Conception des interfaces',
      'Collaboration directe avec les devs',
      'Recette technique et visuelle',
    ],
    // 02 Signature — temps ressenti
    s2eyebrow: '02 — Le résultat',
    s2pre: 'Même parcours, ',
    s2k: 'ressenti deux fois plus court.',
    trReal: 'Durée réelle',
    trFelt: 'Durée ressentie',
    trBadge: 'temps perçu divisé par deux',
    s2note:
      'En regroupant les questions et en clarifiant chaque étape, la perception de longueur a été divisée par deux — sans toucher à la logique métier.',
    statsTiles: [
      { label: 'Conversion visiteurs → devis', before: '32 %', after: '51 %', note: '+19 pts · leads qualifiés' },
      { label: 'Abandon à l’étape des offres', before: '85 %', after: '47 %', note: '−38 pts' },
      { label: 'Devis personnalisé & complet', before: '10 min', after: '5 min', note: '2× plus rapide' },
    ],
    // 03 Le parcours
    s3eyebrow: '03 — Le parcours',
    s3pre: 'Court, guidé, ',
    s3k: 'lisible à chaque étape.',
    s3note:
      'Un enchaînement step-by-step : une chose à la fois, on voit toujours où on en est, et le récapitulatif final reprend les codes du panier e-commerce.',
    stepLabels: [
      'Type d’assurance',
      'Vos besoins',
      'Votre budget',
      'Votre couverture',
      'Loader',
      'Votre offre',
      'Comparateur',
      'Vos coordonnées',
      'Récapitulatif',
    ],
    stepWord: 'Étape',
    nextWord: 'Continuer',
    prevWord: 'Précédent',
    addr: 'souscription.spvie-assurances.com',
    // 04 Démarche
    s4eyebrow: '04 — La démarche',
    s4pre: 'De l’analyse comportementale ',
    s4k: 'à l’A/B test.',
    steps: [
      {
        t: 'Audit & cadrage',
        b: 'ContentSquare + Matomo pour repérer les zones d’hésitation, doublé d’un benchmark concurrentiel des tunnels d’assurance.',
      },
      {
        t: 'Restructuration',
        b: 'Refonte de l’architecture d’information : questions regroupées en logique step-by-step pour réduire la perception de longueur, sans changer la logique métier.',
      },
      {
        t: 'Refonte des offres',
        b: 'Nouvelle hiérarchie, garanties clarifiées, micro-copy de réassurance, badges « offre recommandée » et récapitulatif dynamique inspiré du panier e-commerce.',
      },
      {
        t: 'Validation',
        b: 'Deux variantes de présentation testées en A/B testing, puis recette technique et visuelle complète avec les développeurs.',
      },
    ],
    // 05 Impact
    s5eyebrow: '05 — Impact',
    s5pre: 'Moins de friction, ',
    s5k: 'plus de devis.',
    gains: [
      'Temps perçu du parcours divisé par deux',
      'Fluidité perçue nettement améliorée',
      'Meilleure compréhension des offres',
      'Frictions principales supprimées jusqu’au devis',
      'Volume de leads en hausse (premiers retours internes)',
    ],
  },
  en: {
    heroEyebrow: ['Conversion funnel', 'SPVIE Assurances', '2024-2025'],
    thesisPre: 'A 30-minute funnel, ',
    thesisEm: 'that feels like 12.',
    metaLabels: ['Role', 'Client', 'Type', 'Year', 'Tools'],
    metaValues: ['UX/UI Designer', 'SPVIE Assurances', 'Conversion funnel', '2024-2025', 'Figma · ContentSquare · Matomo'],
    cue: '↓ case study',
    s1eyebrow: '01 — Context',
    s1pre: 'The group’s most strategic funnel, ',
    s1k: 'stuck and losing steam.',
    s1note:
      'Dated design, confusing navigation, offers presented without any pedagogy. Matomo & ContentSquare analytics showed constant hesitation and a major drop at the moment of choosing an offer — a journey that felt long and complex.',
    interventionsLabel: 'My role',
    interventions: [
      'Competitive benchmark',
      'User-flow structuring',
      'Information architecture',
      'Interface design',
      'Direct collaboration with developers',
      'Final technical & visual QA',
    ],
    s2eyebrow: '02 — The outcome',
    s2pre: 'Same journey, ',
    s2k: 'felt twice as short.',
    trReal: 'Actual duration',
    trFelt: 'Perceived duration',
    trBadge: 'perceived time halved',
    s2note:
      'By grouping the questions and clarifying every step, the perceived length was cut in half — without touching the business logic.',
    statsTiles: [
      { label: 'Visitor → quote conversion', before: '32%', after: '51%', note: '+19 pts · better leads' },
      { label: 'Drop-off at the offers step', before: '85%', after: '47%', note: '−38 pts' },
      { label: 'Personalized, complete quote', before: '10 min', after: '5 min', note: '2× faster' },
    ],
    s3eyebrow: '03 — The journey',
    s3pre: 'Short, guided, ',
    s3k: 'clear at every step.',
    s3note:
      'A step-by-step flow: one thing at a time, you always see where you are, and the final summary borrows e-commerce cart patterns.',
    stepLabels: [
      'Insurance type',
      'Your needs',
      'Your budget',
      'Your coverage',
      'Loading',
      'Your offer',
      'Comparator',
      'Your details',
      'Summary',
    ],
    stepWord: 'Step',
    nextWord: 'Continue',
    prevWord: 'Previous',
    addr: 'souscription.spvie-assurances.com',
    s4eyebrow: '04 — The approach',
    s4pre: 'From behavioral analytics ',
    s4k: 'to A/B testing.',
    steps: [
      {
        t: 'Audit & framing',
        b: 'ContentSquare + Matomo to spot hesitation zones, paired with a competitive benchmark of insurance funnels.',
      },
      {
        t: 'Restructuring',
        b: 'Reworked information architecture: questions grouped into a step-by-step logic to reduce the perceived length, without changing the business logic.',
      },
      {
        t: 'Redesigning the offers',
        b: 'New hierarchy, clarified guarantees, reassurance micro-copy, “recommended offer” badges and a dynamic summary inspired by the e-commerce cart.',
      },
      {
        t: 'Validation',
        b: 'Two presentation variants tested via A/B testing, then a full technical & visual QA with the developers.',
      },
    ],
    s5eyebrow: '05 — Impact',
    s5pre: 'Less friction, ',
    s5k: 'more quotes.',
    gains: [
      'Perceived journey time cut in half',
      'Markedly improved perceived fluidity',
      'Better understanding of the offers',
      'Main frictions removed up to the quote',
      'Higher lead volume (early internal feedback)',
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

function Lead({ id, pre, k }: { id: string; pre: string; k: string }) {
  return (
    <p className="lead illuminate title" id={id}>
      {renderWords(pre, false, 'p')}
      {renderWords(k, true, 'k')}
    </p>
  );
}

// Signature — le temps ressenti (avant/après temporel, barres animées au reveal)
function TempsRessenti({ t }: { t: (typeof STRINGS)['fr'] }) {
  return (
    <div className="tr reveal">
      <div className="tr-grid">
        <div className="tr-item">
          <span className="tr-label label">{t.trReal}</span>
          <span className="tr-num">
            30<small>min</small>
          </span>
          <span className="tr-bar">
            <span className="tr-fill full" />
          </span>
        </div>
        <div className="tr-item">
          <span className="tr-label label">{t.trFelt}</span>
          <span className="tr-num accent">
            ~12<small>min</small>
          </span>
          <span className="tr-bar">
            <span className="tr-fill felt" />
          </span>
        </div>
      </div>
      <div className="tr-badge">
        <span className="tr-badge-x">÷2</span>
        {t.trBadge}
      </div>
    </div>
  );
}

// Parcours — cadre navigateur + sélecteur d'étapes (flip) + progression
function Walkthrough({ t }: { t: (typeof STRINGS)['fr'] }) {
  const [active, setActive] = useState(0);
  const n = STEP_IMAGES.length;
  const next = () => setActive((a) => (a + 1) % n);
  const prev = () => setActive((a) => (a - 1 + n) % n);
  return (
    <div className="walk reveal">
      <div className="walk-stepper">
        {t.stepLabels.map((l, i) => (
          <div className="wstep-item" key={l}>
            <button
              type="button"
              className={i < active ? 'wstep done' : i === active ? 'wstep on' : 'wstep'}
              title={l}
              aria-label={`${t.stepWord} ${i + 1} : ${l}`}
              aria-current={i === active ? 'step' : undefined}
              onMouseDown={preventFocusScroll}
              onClick={() => setActive(i)}
            >
              {i < active ? (
                <span aria-hidden="true">✓</span>
              ) : (
                <span className="num">{i + 1}</span>
              )}
            </button>
            {i < n - 1 && <span className={i < active ? 'wstep-line done' : 'wstep-line'} />}
          </div>
        ))}
      </div>

      <div className="walk-current">
        <span className="walk-current-n label">
          {t.stepWord} {active + 1} / {n}
        </span>
        <span className="walk-current-t title">{t.stepLabels[active]}</span>
      </div>

      <div className="bwin">
        <span className="bbar">
          <span className="dot r" />
          <span className="dot y" />
          <span className="dot g" />
          <span className="baddr">{t.addr}</span>
        </span>
        <span className="bshot">
          {STEP_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={t.stepLabels[i]}
              className={i === active ? 'walk-img on' : 'walk-img'}
              loading="lazy"
              decoding="async"
            />
          ))}
        </span>
      </div>

      <div className="walk-controls">
        <button
          type="button"
          className="walk-prev"
          aria-label={t.prevWord}
          onMouseDown={preventFocusScroll}
          onClick={prev}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button" className="walk-next" onMouseDown={preventFocusScroll} onClick={next}>
          {t.nextWord} <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}

export default function ParcoursB2CShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];

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
    <div className="parcours-b2c-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
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
          <h1 aria-label={projet.title}>Parcours de souscription</h1>
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
        </div>
      </div>

      {/* 01 CONTEXTE */}
      <section className="wrap sec">
        <span className="ey label">{t.s1eyebrow}</span>
        <Lead id="pb-s1" pre={t.s1pre} k={t.s1k} />
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

      {/* 02 SIGNATURE — temps ressenti */}
      <section className="wrap sec">
        <span className="ey label">{t.s2eyebrow}</span>
        <Lead id="pb-s2" pre={t.s2pre} k={t.s2k} />
        <TempsRessenti t={t} />
        <div className="stat-tiles reveal">
          {t.statsTiles.map((s) => (
            <div className="stat-tile" key={s.label}>
              <span className="stat-tile-label label">{s.label}</span>
              <span className="stat-tile-nums">
                <span className="stat-before num">{s.before}</span>
                <span className="stat-arrow" aria-hidden="true">
                  →
                </span>
                <span className="stat-after num">{s.after}</span>
              </span>
              <span className="stat-tile-note">{s.note}</span>
            </div>
          ))}
        </div>
        <p className="note note-center">{t.s2note}</p>
      </section>

      {/* 03 LE PARCOURS */}
      <section className="wrap sec">
        <span className="ey label">{t.s3eyebrow}</span>
        <Lead id="pb-s3" pre={t.s3pre} k={t.s3k} />
        <p className="note">{t.s3note}</p>
        <Walkthrough t={t} />
      </section>

      {/* 04 DÉMARCHE */}
      <section className="wrap sec">
        <span className="ey label">{t.s4eyebrow}</span>
        <Lead id="pb-s4" pre={t.s4pre} k={t.s4k} />
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

      {/* 05 IMPACT */}
      <section className="wrap sec">
        <span className="ey label">{t.s5eyebrow}</span>
        <Lead id="pb-s5" pre={t.s5pre} k={t.s5k} />
        <ul className="gains reveal">
          {t.gains.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>

      <ContactFooter />
    </div>
  );
}
