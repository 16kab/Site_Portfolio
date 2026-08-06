import '@fontsource-variable/bricolage-grotesque';
import './RefonteSpvieShowcase.css';
import { useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import pHome from 'figma:asset/spvie-site-home.webp';
import pCategorie from 'figma:asset/spvie-site-categorie.webp';
import pOffre from 'figma:asset/spvie-site-offre.webp';

const preventFocusScroll = (e: { preventDefault: () => void }) => e.preventDefault();
const PAGES = [pCategorie, pOffre];

const STRINGS = {
  fr: {
    study: 'Étude de cas',
    heroEyebrow: ['Refonte de site', 'SPVIE Assurances', '2025'],
    thesisPre: 'Plus clair, plus crédible, ',
    thesisEm: 'pensé pour convertir.',
    metaLabels: ['Rôle', 'Client', 'Nature', 'Année'],
    metaValues: ['UX/UI · à l’initiative', 'SPVIE Assurances', 'Site vitrine', '2025'],
    cue: '↓ étude de cas',
    // 01
    s1eyebrow: '01 — Contexte',
    s1pre: 'Près de 280 pages produits, ',
    s1k: 'un site à réinventer.',
    s1note:
      'La vitrine principale de SPVIE reposait sur un design vieillissant et une architecture de près de 280 pages produits : navigation difficile, offres peu lisibles, efficacité limitée comme outil d’acquisition. Avec l’arrivée d’une direction orientée croissance, j’ai pris l’initiative de proposer une vision de refonte.',
    interventionsLabel: 'Mon rôle',
    interventions: [
      'Nouvelle architecture de navigation',
      'Nouvelle hiérarchie de contenu',
      'Direction visuelle modernisée',
      'Pages produits pédagogiques & conversion',
      'Présentation au DSI',
    ],
    // 02 signature
    s2eyebrow: '02 — La refonte',
    s2pre: 'La nouvelle homepage, ',
    s2k: 'de haut en bas.',
    s2note:
      'Une hiérarchie claire, des offres pédagogiques, de la réassurance et des appels à l’action orientés devis. Faites défiler pour parcourir la refonte.',
    addr: 'spvie-assurances.com',
    // 03 pages
    s3eyebrow: '03 — Les pages',
    s3pre: 'Des offres ',
    s3k: 'enfin lisibles.',
    s3note:
      'Une page catégorie qui oriente vers la bonne offre, et une page produit pédagogique qui rassure et pousse au devis.',
    pageCaps: ['Page catégorie', 'Page offre'],
    // 04
    s4eyebrow: '04 — La démarche',
    s4pre: 'De l’analyse ',
    s4k: 'à la vision.',
    steps: [
      {
        t: 'Analyse de l’existant',
        b: 'Étude de l’architecture et des pages produits pour repérer les problèmes de lisibilité et de navigation dans un écosystème de plusieurs centaines de pages.',
      },
      {
        t: 'Simplification de l’architecture',
        b: 'Une nouvelle structure de navigation pour accéder plus vite aux offres et clarifier la hiérarchie de l’information.',
      },
      {
        t: 'Refonte de l’expérience',
        b: 'De nouvelles maquettes axées sur la pédagogie des offres, la réassurance et une hiérarchie visuelle plus claire.',
      },
      {
        t: 'Vision orientée acquisition',
        b: 'Une logique plus orientée conversion : parcours de devis mis en avant et meilleure valorisation des offres.',
      },
    ],
    // 05
    s5eyebrow: '05 — Impact',
    s5pre: 'Une vision ',
    s5k: 'adoptée par le DSI.',
    gains: [
      'Proposition validée par le DSI',
      'Base de réflexion pour l’évolution future du site',
      'Idées déjà intégrées à l’écosystème (menu, footer)',
      'Image du groupe modernisée',
    ],
  },
  en: {
    study: 'Case study',
    heroEyebrow: ['Website redesign', 'SPVIE Assurances', '2025'],
    thesisPre: 'Clearer, more credible, ',
    thesisEm: 'built to convert.',
    metaLabels: ['Role', 'Client', 'Type', 'Year'],
    metaValues: ['UX/UI · self-initiated', 'SPVIE Assurances', 'Marketing site', '2025'],
    cue: '↓ case study',
    s1eyebrow: '01 — Context',
    s1pre: 'Nearly 280 product pages, ',
    s1k: 'a site to reinvent.',
    s1note:
      'SPVIE’s main website relied on a dated design and an architecture of nearly 280 product pages: hard navigation, unclear offers, limited efficiency as an acquisition tool. As a growth-focused leadership arrived, I took the initiative to propose a redesign vision.',
    interventionsLabel: 'My role',
    interventions: [
      'New navigation architecture',
      'New content hierarchy',
      'Modernized visual direction',
      'Pedagogical, conversion-oriented product pages',
      'Presentation to the CIO',
    ],
    s2eyebrow: '02 — The redesign',
    s2pre: 'The new homepage, ',
    s2k: 'top to bottom.',
    s2note:
      'A clear hierarchy, pedagogical offers, reassurance and quote-oriented calls to action. Scroll to walk through the redesign.',
    addr: 'spvie-assurances.com',
    s3eyebrow: '03 — The pages',
    s3pre: 'Offers that are ',
    s3k: 'finally readable.',
    s3note:
      'A category page that guides toward the right offer, and a pedagogical product page that reassures and drives to a quote.',
    pageCaps: ['Category page', 'Offer page'],
    s4eyebrow: '04 — The approach',
    s4pre: 'From analysis ',
    s4k: 'to vision.',
    steps: [
      {
        t: 'Analyzing the existing site',
        b: 'Studying the architecture and product pages to spot readability and navigation issues in an ecosystem of several hundred pages.',
      },
      {
        t: 'Simplifying the architecture',
        b: 'A new navigation structure to reach offers faster and clarify the information hierarchy.',
      },
      {
        t: 'Redesigning the experience',
        b: 'New mockups focused on offer pedagogy, reassurance and a clearer visual hierarchy.',
      },
      {
        t: 'An acquisition-driven vision',
        b: 'A more conversion-oriented logic: quote journeys highlighted and offers better showcased.',
      },
    ],
    s5eyebrow: '05 — Impact',
    s5pre: 'A vision ',
    s5k: 'adopted by the CIO.',
    gains: [
      'Proposal validated by the CIO',
      'A basis for the site’s future evolution',
      'Ideas already integrated into the ecosystem (menu, footer)',
      'A modernized group image',
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

// Signature — la refonte qui défile : cadre navigateur épinglé, la homepage
// scrolle à l'intérieur (translateY piloté par le scroll, dans l'effet).
function ScrollFrame({ addr, src, alt }: { addr: string; src: string; alt: string }) {
  return (
    <section className="rs-section">
      <div className="rs-sticky">
        <div className="rs-frame">
          <span className="rs-bar">
            <span className="dot r" />
            <span className="dot y" />
            <span className="dot g" />
            <span className="rs-addr">{addr}</span>
          </span>
          <span className="rs-viewport">
            <img className="rs-page" src={src} alt={alt} decoding="async" />
          </span>
        </div>
      </div>
    </section>
  );
}

export default function RefonteSpvieShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [lb, setLb] = useState<number | null>(null);

  // Refonte = site clair → force le thème light du site.
  useEffect(() => {
    const el = document.documentElement;
    const wasDark = el.classList.contains('dark');
    if (wasDark) el.classList.remove('dark');
    return () => {
      if (wasDark) el.classList.add('dark');
    };
  }, []);

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

    // Signature : la homepage défile dans le cadre épinglé.
    const rsSec = root.querySelector<HTMLElement>('.rs-section');
    const rsPage = root.querySelector<HTMLElement>('.rs-page');
    const rsVp = root.querySelector<HTMLElement>('.rs-viewport');
    const rsUpdate = () => {
      if (!rsSec || !rsPage || !rsVp) return;
      const rect = rsSec.getBoundingClientRect();
      const dist = rsSec.offsetHeight - innerHeight;
      let p = dist > 0 ? -rect.top / dist : 0;
      p = Math.max(0, Math.min(1, p));
      const maxShift = Math.max(0, rsPage.offsetHeight - rsVp.clientHeight);
      rsPage.style.transform = `translateY(${-(p * maxShift).toFixed(1)}px)`;
    };

    function onScrollRaw() {
      litUpdate();
      heroZoom();
      rsUpdate();
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
    if (rsPage) {
      const imgEl = rsPage as HTMLImageElement;
      if (!imgEl.complete) imgEl.addEventListener('load', onScrollRaw, { once: true });
    }
    cleanups.push(() => document.body.removeEventListener('scroll', onScroll));
    cleanups.push(() => window.removeEventListener('resize', onScrollRaw));

    return () => cleanups.forEach((fn) => fn());
  }, [lang]);

  return (
    <div className="refonte-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
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
          <h1 aria-label={projet.title}>Refonte du site SPVIE</h1>
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
        <Lead id="rs-s1" pre={t.s1pre} k={t.s1k} />
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

      {/* 02 SIGNATURE — la refonte qui défile */}
      <section className="wrap sec sec-tight">
        <span className="ey label">{t.s2eyebrow}</span>
        <Lead id="rs-s2" pre={t.s2pre} k={t.s2k} />
        <p className="note">{t.s2note}</p>
      </section>
      <ScrollFrame addr={t.addr} src={pHome} alt="Homepage refondue de SPVIE" />

      {/* 03 LES PAGES */}
      <section className="wrap sec">
        <span className="ey label">{t.s3eyebrow}</span>
        <Lead id="rs-s3" pre={t.s3pre} k={t.s3k} />
        <p className="note">{t.s3note}</p>
        <div className="pages reveal">
          {PAGES.map((src, i) => (
            <button
              key={src}
              type="button"
              className="page-tile"
              aria-label={t.pageCaps[i]}
              onMouseDown={preventFocusScroll}
              onClick={(e) => {
                e.currentTarget.blur();
                setLb(i);
              }}
            >
              <span className="bwin">
                <span className="bbar">
                  <span className="dot r" />
                  <span className="dot y" />
                  <span className="dot g" />
                  <span className="baddr">{t.addr}</span>
                </span>
                <span className="bshot">
                  <img src={src} alt={t.pageCaps[i]} loading="lazy" decoding="async" />
                </span>
              </span>
              <span className="page-cap">{t.pageCaps[i]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 04 DÉMARCHE */}
      <section className="wrap sec">
        <span className="ey label">{t.s4eyebrow}</span>
        <Lead id="rs-s4" pre={t.s4pre} k={t.s4k} />
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
        <Lead id="rs-s5" pre={t.s5pre} k={t.s5k} />
        <ul className="gains reveal">
          {t.gains.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>

      <ContactFooter />

      {lb !== null && (
        <ImageLightbox images={PAGES} currentIndex={lb} onClose={() => setLb(null)} />
      )}
    </div>
  );
}
