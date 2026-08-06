import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './CrmBigBrokerShowcase.css';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import scrBoard from 'figma:asset/crm-bb-board.webp';
import scrConseiller from 'figma:asset/crm-bb-conseiller.webp';
import scrGroupes from 'figma:asset/crm-bb-groupes.webp';
import scrImport from 'figma:asset/crm-bb-import.webp';
import scrRelance from 'figma:asset/crm-bb-relance.webp';

const SCREENS = [scrBoard, scrConseiller, scrGroupes, scrImport, scrRelance];

// Données illustratives du dispatch (d'après les écrans réels).
const SOURCES = [
  { name: 'Splead', vol: 42 },
  { name: 'Datalead', vol: 31 },
  { name: 'Comparateurs', vol: 18 },
  { name: 'ANI', vol: 15 },
];
const ADVISORS = [
  { name: 'C. Blanchet', done: 12, quota: 12 },
  { name: 'I. Perez', done: 10, quota: 10 },
  { name: 'L. Torini', done: 8, quota: 8 },
  { name: 'A. Moreau', done: 4, quota: 7 },
];

const STRINGS = {
  fr: {
    study: 'Étude de cas',
    heroEyebrow: ['SaaS interne', 'BigBroker · SPVIE', '2024'],
    thesisPre: 'Centraliser les leads, ',
    thesisEm: 'piloter la performance.',
    metaLabels: ['Rôle', 'Client', 'Nature', 'Année'],
    metaValues: ['UX/UI Designer', 'BigBroker · SPVIE', 'SaaS interne', '2024'],
    cue: '↓ étude de cas',
    // 01
    s1eyebrow: '01 — Contexte',
    s1pre: 'Un volume de leads qui grimpe, ',
    s1k: 'aucun outil pour suivre.',
    s1note:
      'Les équipes téléphoniques traitaient des leads multi-sources sans centralisation : données clients éparpillées, performances difficiles à suivre, dispatch complexe et aucune visibilité sur les leads non traités.',
    interventionsLabel: 'Mon rôle',
    interventions: [
      'Hiérarchie des données',
      'Statuts & transitions des leads',
      'Interfaces principales du CRM',
      'Dashboards & tableaux de gestion',
      'Design system du produit',
      'Collaboration avec les devs',
    ],
    // 02 signature
    s2eyebrow: '02 — Le dispatch',
    s2pre: 'Des leads qui arrivent, ',
    s2k: 'répartis en temps réel.',
    dispSources: 'Sources',
    dispHub: 'Moteur de dispatch',
    dispHubSub: 'règles par source · quotas par équipe',
    dispAdvisors: 'Conseillers',
    s2note:
      'Le CRM distribue les leads selon leur origine et des règles de quota par équipe et par conseiller — et garde l’œil sur les leads non attribués.',
    // 03 écrans
    s3eyebrow: '03 — Les écrans',
    s3pre: 'Tout au même endroit, ',
    s3k: 'clair et rapide.',
    s3note:
      'Dispatch board, fiche conseiller, groupes de dispatch, import de leads, relance des devis — pensés pour la vitesse d’usage des équipes d’appel.',
    screenCaps: [
      'Dispatch board — suivi des conseillers',
      'Fiche conseiller — leads & quota',
      'Groupes de dispatch & quotas',
      'Import de leads',
      'Relance des devis',
    ],
    // 04
    s4eyebrow: '04 — La démarche',
    s4pre: 'Des ateliers métier ',
    s4k: 'aux interfaces.',
    steps: [
      {
        t: 'Besoins métier',
        b: 'Ateliers avec les équipes pour cerner les actions les plus fréquentes, les informations essentielles et les flux de travail des conseillers.',
      },
      {
        t: 'Structuration des données',
        b: 'Hiérarchiser les données clients : documents, historique des échanges, emails, commentaires, relances de devis — regroupés dans une fiche assuré claire.',
      },
      {
        t: 'Conception des interfaces',
        b: 'Dashboard de suivi, gestion du portefeuille (filtres & alertes), fiche assuré, module de tarification pour recueillir les besoins et comparer les offres.',
      },
      {
        t: 'Pilotage des leads',
        b: 'Dispatch aux conseillers, règles de distribution selon l’origine, quotas par équipe et gestion des leads non attribués.',
      },
    ],
    // 05
    s5eyebrow: '05 — Impact',
    s5pre: 'Un CRM ',
    s5k: 'qui structure le quotidien.',
    gains: [
      'Données clients centralisées',
      'Leads entrants gérés plus efficacement',
      'Activité & performances suivies',
      'Travail des conseillers mieux organisé',
      'Brique structurante de l’écosystème digital interne',
    ],
  },
  en: {
    study: 'Case study',
    heroEyebrow: ['Internal SaaS', 'BigBroker · SPVIE', '2024'],
    thesisPre: 'Centralize the leads, ',
    thesisEm: 'drive performance.',
    metaLabels: ['Role', 'Client', 'Type', 'Year'],
    metaValues: ['UX/UI Designer', 'BigBroker · SPVIE', 'Internal SaaS', '2024'],
    cue: '↓ case study',
    s1eyebrow: '01 — Context',
    s1pre: 'A rising volume of leads, ',
    s1k: 'no tool to keep up.',
    s1note:
      'Phone teams handled multi-source leads with no central tool: scattered client data, hard-to-track performance, complex dispatching and no visibility on untreated leads.',
    interventionsLabel: 'My role',
    interventions: [
      'Data hierarchy',
      'Lead statuses & transitions',
      'Core CRM interfaces',
      'Dashboards & management tables',
      'Product design system',
      'Collaboration with developers',
    ],
    s2eyebrow: '02 — Dispatch',
    s2pre: 'Leads coming in, ',
    s2k: 'routed in real time.',
    dispSources: 'Sources',
    dispHub: 'Dispatch engine',
    dispHubSub: 'rules by source · quotas by team',
    dispAdvisors: 'Advisors',
    s2note:
      'The CRM distributes leads by origin and by quota rules per team and per advisor — while keeping an eye on unassigned leads.',
    s3eyebrow: '03 — The screens',
    s3pre: 'All in one place, ',
    s3k: 'clear and fast.',
    s3note:
      'Dispatch board, advisor sheet, dispatch groups, lead import, quote follow-up — built for the speed the phone teams need.',
    screenCaps: [
      'Dispatch board — advisor monitoring',
      'Advisor sheet — leads & quota',
      'Dispatch groups & quotas',
      'Lead import',
      'Quote follow-up',
    ],
    s4eyebrow: '04 — The approach',
    s4pre: 'From business workshops ',
    s4k: 'to interfaces.',
    steps: [
      {
        t: 'Business needs',
        b: 'Workshops with the teams to pin down the most frequent actions, the essential information and the advisors’ workflows.',
      },
      {
        t: 'Data structuring',
        b: 'Hierarchizing client data: documents, exchange history, emails, comments, quote follow-ups — grouped into a clear client sheet.',
      },
      {
        t: 'Interface design',
        b: 'Monitoring dashboard, portfolio management (filters & alerts), client sheet, and a pricing module to collect needs and compare offers.',
      },
      {
        t: 'Lead piloting',
        b: 'Dispatch to advisors, distribution rules by origin, quotas per team and handling of unassigned leads.',
      },
    ],
    s5eyebrow: '05 — Impact',
    s5pre: 'A CRM ',
    s5k: 'that structures the day-to-day.',
    gains: [
      'Centralized client data',
      'Incoming leads handled more efficiently',
      'Activity & performance tracked',
      'Advisors’ work better organized',
      'A structuring block of the internal digital ecosystem',
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

// Pile de captures en éventail (façon « DisplayCards », comme la section
// arrivant d'Onboarding RH) : cartes empilées, inclinées, en niveaux de gris +
// assombries, qui se colorisent et se soulèvent au survol. Front en couleur.
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
              ['--tx' as string]: `${idx * 84}px`,
              ['--ty' as string]: `${idx * 52}px`,
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

// Signature — le dispatch en direct (connecteurs SVG + flux animé + jauges)
type DispT = { dispSources: string; dispHub: string; dispHubSub: string; dispAdvisors: string };
function DispatchDiagram({ t }: { t: DispT }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<{ id: string; d: string }[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [run, setRun] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const stage = root.querySelector<HTMLElement>('.disp-stage');
    if (!stage) return;

    const bez = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const mx = (a.x + b.x) / 2;
      return `M ${a.x} ${a.y} C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
    };
    const compute = () => {
      const cr = stage.getBoundingClientRect();
      const hubEl = stage.querySelector<HTMLElement>('[data-hub]');
      if (!hubEl) return;
      const hub = hubEl.getBoundingClientRect();
      const P: { id: string; d: string }[] = [];
      stage.querySelectorAll<HTMLElement>('[data-src]').forEach((s, i) => {
        const r = s.getBoundingClientRect();
        P.push({
          id: `s${i}`,
          d: bez(
            { x: r.right - cr.left, y: r.top + r.height / 2 - cr.top },
            { x: hub.left - cr.left, y: hub.top + hub.height / 2 - cr.top },
          ),
        });
      });
      stage.querySelectorAll<HTMLElement>('[data-adv]').forEach((a, i) => {
        const r = a.getBoundingClientRect();
        P.push({
          id: `a${i}`,
          d: bez(
            { x: hub.right - cr.left, y: hub.top + hub.height / 2 - cr.top },
            { x: r.left - cr.left, y: r.top + r.height / 2 - cr.top },
          ),
        });
      });
      setBox({ w: cr.width, h: cr.height });
      setPaths(P);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(stage);
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            setRun(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.35 },
    );
    io.observe(root);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className={run ? 'dispatch run' : 'dispatch'} ref={ref}>
      <div className="disp-stage">
        <svg
          className="disp-flow"
          viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {paths.map((p) => (
            <path key={p.id} id={`dp-${p.id}`} className="disp-line" d={p.d} />
          ))}
          {paths.map((p, idx) =>
            [0, 1].map((k) => (
              <circle key={p.id + k} className="disp-dot" r="4">
                <animateMotion dur="2.4s" begin={`${idx * 0.14 + k * 1.2}s`} repeatCount="indefinite">
                  <mpath href={`#dp-${p.id}`} />
                </animateMotion>
              </circle>
            )),
          )}
        </svg>

        <div className="disp-col disp-sources">
          <span className="disp-col-h label">{t.dispSources}</span>
          {SOURCES.map((s) => (
            <div className="src" data-src key={s.name}>
              <span className="src-name">{s.name}</span>
              <span className="src-vol num">{s.vol}</span>
            </div>
          ))}
        </div>

        <div className="disp-col disp-hub-col">
          <div className="hub" data-hub>
            <span className="hub-icon" aria-hidden="true">
              ⇄
            </span>
            <span className="hub-t">{t.dispHub}</span>
            <span className="hub-s">{t.dispHubSub}</span>
          </div>
        </div>

        <div className="disp-col disp-adv">
          <span className="disp-col-h label">{t.dispAdvisors}</span>
          {ADVISORS.map((a) => {
            const pct = Math.round((a.done / a.quota) * 100);
            return (
              <div className="adv" data-adv key={a.name}>
                <div className="adv-top">
                  <span className="adv-name">{a.name}</span>
                  <span className="adv-q num">
                    {a.done}/{a.quota}
                  </span>
                </div>
                <span className="adv-gauge">
                  <span
                    className={pct >= 100 ? 'adv-fill full' : 'adv-fill'}
                    style={{ ['--fill' as string]: `${pct}%` } as CSSProperties}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CrmBigBrokerShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [lb, setLb] = useState<number | null>(null);

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

    // La pile d'écrans déborde au-delà du bord droit du viewport.
    const fcards = root.querySelector<HTMLElement>('.feature-cards');
    const bleedFeature = () => {
      if (!fcards) return;
      fcards.style.width = '';
      if (matchMedia('(max-width: 860px)').matches) return;
      const r = fcards.getBoundingClientRect();
      fcards.style.width = `${window.innerWidth - r.left + 120}px`;
    };

    function onScrollRaw() {
      litUpdate();
      heroZoom();
    }
    onScrollRaw();
    bleedFeature();
    const onResize = () => {
      onScrollRaw();
      bleedFeature();
    };
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
    window.addEventListener('resize', onResize);
    cleanups.push(() => document.body.removeEventListener('scroll', onScroll));
    cleanups.push(() => window.removeEventListener('resize', onResize));

    return () => cleanups.forEach((fn) => fn());
  }, [lang]);

  return (
    <div className="crm-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
      <PageMeta
        title={`${projet.title} — Alexis Kabiche`}
        description={projet.description}
        path={`/projets/${projet.id}`}
      />

      {/* HERO (image claire → texte sombre) */}
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
          <h1 aria-label={projet.title}>CRM BigBroker</h1>
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
          <span className="metabar-study label">{t.study}</span>
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
        <Lead id="crm-s1" pre={t.s1pre} k={t.s1k} />
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

      {/* 02 SIGNATURE — dispatch */}
      <section className="wrap sec">
        <span className="ey label">{t.s2eyebrow}</span>
        <Lead id="crm-s2" pre={t.s2pre} k={t.s2k} />
        <DispatchDiagram t={t} />
        <p className="note note-center">{t.s2note}</p>
      </section>

      {/* 03 LES ÉCRANS — pile DisplayCards (design section « arrivant ») */}
      <section className="wrap sec">
        <span className="ey label">{t.s3eyebrow}</span>
        <div className="feature">
          <div className="feature-txt">
            <Lead id="crm-s3" pre={t.s3pre} k={t.s3k} />
            <p className="note">{t.s3note}</p>
          </div>
          <div className="feature-cards">
            <DisplayStack
              cards={SCREENS.map((src, i) => ({ src, alt: t.screenCaps[i], i }))}
              onOpen={(i) => setLb(i)}
            />
          </div>
        </div>
      </section>

      {/* 04 DÉMARCHE */}
      <section className="wrap sec">
        <span className="ey label">{t.s4eyebrow}</span>
        <Lead id="crm-s4" pre={t.s4pre} k={t.s4k} />
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
        <Lead id="crm-s5" pre={t.s5pre} k={t.s5k} />
        <ul className="gains reveal">
          {t.gains.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>

      <ContactFooter />

      {lb !== null && (
        <ImageLightbox images={SCREENS} currentIndex={lb} onClose={() => setLb(null)} />
      )}
    </div>
  );
}
