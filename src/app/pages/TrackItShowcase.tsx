import '@fontsource-variable/bricolage-grotesque';
import './TrackItShowcase.css';
import { useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import avoir from 'figma:asset/trackit-avoir.webp';
import recherche from 'figma:asset/trackit-recherche.webp';
import historique from 'figma:asset/trackit-historique.webp';
import commencer from 'figma:asset/trackit-commencer.webp';
import ddBackdrop from 'figma:asset/trackit-dd-backdrop.webp';

// Empêche le focus souris (→ scroll-into-view du navigateur) sans casser le
// clavier : le click passe toujours. (Leçon de la page SYMA.)
const preventFocusScroll = (e: { preventDefault: () => void }) => e.preventDefault();

// ── Données série (signature) — d'après la capture Détail série ────
type Episode = { t: string; d: string; r: number; w: boolean };
type Season = { n: number; episodes: Episode[] };
const SERIES: {
  title: string;
  genres: string;
  date: string;
  rating: number;
  seasons: Season[];
} = {
  title: 'Daredevil : Born Again',
  genres: 'Drame · Action & Adventure · Crime',
  date: '4 mars 2025',
  rating: 8.2,
  seasons: [
    {
      n: 1,
      episodes: [
        { t: "Le diable de Hell's Kitchen", d: '2025-03-04', r: 8.4, w: true },
        { t: 'Aveugle mais lucide', d: '2025-03-11', r: 8.1, w: true },
        { t: 'Le poids de la loi', d: '2025-03-18', r: 7.9, w: true },
        { t: 'Sous le masque', d: '2025-03-25', r: 8.3, w: true },
        { t: 'Ligne rouge', d: '2025-04-01', r: 8.0, w: true },
        { t: 'Le prix du silence', d: '2025-04-08', r: 8.5, w: true },
        { t: 'Sans filet', d: '2025-04-15', r: 8.2, w: true },
        { t: 'Face au Caïd', d: '2025-04-22', r: 8.6, w: true },
        { t: 'Renaissance', d: '2025-04-29', r: 8.2, w: true },
      ],
    },
    {
      n: 2,
      episodes: [
        { t: "L'étoile polaire", d: '2026-03-24', r: 8.2, w: true },
        { t: 'Viser plus haut', d: '2026-03-31', r: 7.9, w: true },
        { t: "La balance et l'épée", d: '2026-04-07', r: 7.7, w: true },
        { t: 'Angle mort', d: '2026-04-14', r: 8.0, w: true },
        { t: 'Le juste et le fort', d: '2026-04-21', r: 7.8, w: true },
        { t: 'Contre-enquête', d: '2026-04-28', r: 0, w: false },
        { t: 'La chute', d: '2026-05-05', r: 0, w: false },
        { t: 'Verdict', d: '2026-05-12', r: 0, w: false },
      ],
    },
  ],
};
const TOTAL_EP = SERIES.seasons.reduce((a, s) => a + s.episodes.length, 0);

const STRINGS = {
  fr: {
    study: 'Étude de cas',
    heroEyebrow: ['App web', 'Suivi films & séries', '2025'],
    thesisPre: 'Ne perdez plus le fil ',
    thesisEm: 'de vos séries.',
    metaLabels: ['Rôle', 'Nature', 'Portée', 'Année'],
    metaValues: ['Design & dev full-stack', 'App web · mobile-first', 'Projet perso', '2025'],
    cue: '↓ étude de cas',
    interventionsLabel: 'Ce que j’ai construit',
    interventions: [
      'Design produit & UI (sombre, mobile-first)',
      'Front React 19 + Tailwind, animations',
      'Proxy Express + intégration TMDB',
      'Auth Google & sync Firestore',
      'Import TV Time (migration d’historique)',
    ],
    // Contexte
    s1eyebrow: '01 — Contexte',
    s1pre: 'Une série par plateforme, ',
    s1k: 'et le fil qui se perd.',
    s1note:
      'Netflix, Prime, Apple TV+, Crunchyroll… on éparpille ce qu’on regarde et on oublie où on en est. TrackIt centralise tout : recherche TMDB, suivi épisode par épisode, reprise en un tap, et import de son historique TV Time — synchronisé dans le cloud.',
    s1cap: 'La watchlist « À voir »',
    // Signature
    s2eyebrow: '02 — Le suivi',
    s2pre: 'Le cœur de l’app : ',
    s2k: 'savoir exactement où on en est.',
    s2note: 'Cochez un épisode (ou une saison entière) — la progression avance en direct.',
    serieTag: 'Série TV',
    progression: 'Progression',
    complet: 'Terminé',
    encours: 'En cours',
    episodesLabel: 'épisodes',
    saisons: 'Saisons',
    saison: 'Saison',
    resume: 'Résumé',
    markSeason: 'Cocher / décocher la saison',
    // Écrans
    s3eyebrow: '03 — Les écrans',
    s3pre: 'Sombre, ',
    s3k: 'pensé pour le canapé.',
    s3note:
      'Recherche TMDB et tendances de la semaine, statuts de suivi (À commencer, En cours, Vu, En pause), profil et habitudes de visionnage. Interface sombre, posters en vedette, navigation flottante.',
    screens: [
      { cap: 'Recherche & tendances' },
      { cap: 'Historique' },
      { cap: 'À commencer' },
    ],
    // Impact
    s4eyebrow: '04 — Impact',
    s4pre: 'Une app qu’on ouvre ',
    s4k: 'par réflexe.',
    s4note:
      'Mon tracker au quotidien, en remplacement de TV Time : suivi précis, synchronisé sur tous mes écrans, sans pub et sous mon contrôle (auto-hébergé). [Chiffres d’usage à ajouter.]',
  },
  en: {
    study: 'Case study',
    heroEyebrow: ['Web app', 'Film & TV tracker', '2025'],
    thesisPre: 'Never lose track ',
    thesisEm: 'of your shows.',
    metaLabels: ['Role', 'Type', 'Scope', 'Year'],
    metaValues: ['Design & full-stack dev', 'Web app · mobile-first', 'Personal project', '2025'],
    cue: '↓ case study',
    interventionsLabel: 'What I built',
    interventions: [
      'Product & UI design (dark, mobile-first)',
      'React 19 front-end + Tailwind, animations',
      'Express proxy + TMDB integration',
      'Google auth & Firestore sync',
      'TV Time import (history migration)',
    ],
    s1eyebrow: '01 — Context',
    s1pre: 'One show per platform, ',
    s1k: 'and you lose the thread.',
    s1note:
      'Netflix, Prime, Apple TV+, Crunchyroll… what you watch scatters and you forget where you left off. TrackIt centralizes everything: TMDB search, episode-by-episode tracking, one-tap resume, and TV Time history import — synced to the cloud.',
    s1cap: 'The “To watch” list',
    s2eyebrow: '02 — Tracking',
    s2pre: 'The heart of the app: ',
    s2k: 'knowing exactly where you are.',
    s2note: 'Check an episode (or a whole season) — progress updates live.',
    serieTag: 'TV series',
    progression: 'Progress',
    complet: 'Complete',
    encours: 'In progress',
    episodesLabel: 'episodes',
    saisons: 'Seasons',
    saison: 'Season',
    resume: 'Overview',
    markSeason: 'Check / uncheck the season',
    s3eyebrow: '03 — The screens',
    s3pre: 'Dark, ',
    s3k: 'built for the couch.',
    s3note:
      'TMDB search and weekly trends, tracking statuses (To start, Watching, Watched, Paused), profile and viewing habits. Dark interface, posters up front, floating navigation.',
    screens: [{ cap: 'Search & trends' }, { cap: 'History' }, { cap: 'Up next' }],
    s4eyebrow: '04 — Impact',
    s4pre: 'An app you open ',
    s4k: 'on reflex.',
    s4note:
      'My daily tracker, replacing TV Time: precise tracking, synced across all my screens, ad-free and under my control (self-hosted). [Usage figures to add.]',
  },
};

const SCREEN_IMAGES = [recherche, historique, commencer];

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

function IPhone({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="iphone">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}

// Signature — suivi d'épisodes interactif
function EpisodeTracker({ t }: { t: (typeof STRINGS)['fr'] }) {
  const initial: Record<string, boolean> = {};
  SERIES.seasons.forEach((s) =>
    s.episodes.forEach((e, i) => {
      initial[`${s.n}-${i}`] = e.w;
    }),
  );
  const [watched, setWatched] = useState(initial);
  const [open, setOpen] = useState<Record<number, boolean>>({ 1: false, 2: true });

  const isW = (n: number, i: number) => watched[`${n}-${i}`];
  const seasonWatchedCount = (s: Season) => s.episodes.filter((_, i) => isW(s.n, i)).length;
  const watchedCount = SERIES.seasons.reduce((a, s) => a + seasonWatchedCount(s), 0);

  // Segments de la barre : vert = vus, orange = restants de la saison en cours.
  let orange = 0;
  for (const s of SERIES.seasons) {
    const w = seasonWatchedCount(s);
    if (w < s.episodes.length) {
      orange = s.episodes.length - w;
      break;
    }
  }
  const greenPct = (watchedCount / TOTAL_EP) * 100;
  const orangePct = (orange / TOTAL_EP) * 100;
  const complete = watchedCount === TOTAL_EP;

  const toggleEp = (n: number, i: number) =>
    setWatched((w) => ({ ...w, [`${n}-${i}`]: !w[`${n}-${i}`] }));
  const toggleSeason = (s: Season) => {
    const all = seasonWatchedCount(s) === s.episodes.length;
    setWatched((w) => {
      const next = { ...w };
      s.episodes.forEach((_, i) => {
        next[`${s.n}-${i}`] = !all;
      });
      return next;
    });
  };

  return (
    <div className="tracker reveal">
      <div className="tracker-hero">
        <img className="tracker-bd" src={ddBackdrop} alt="" aria-hidden="true" />
        <div className="tracker-hero-scrim" aria-hidden="true" />
        <div className="tracker-hero-top">
          <span className="tk-tag">{t.serieTag}</span>
          <span className="tk-note">★ {SERIES.rating.toFixed(1)}</span>
        </div>
        <div className="tracker-hero-tt">
          <h3 className="title">{SERIES.title}</h3>
          <p className="tracker-genres">{SERIES.genres}</p>
        </div>
      </div>

      <div className="tracker-body">
        <div className="prog-card">
          <div className="prog-head">
            <span className="prog-label">
              {t.progression}
              <span className={complete ? 'prog-badge ok' : 'prog-badge'}>
                {complete ? t.complet : t.encours}
              </span>
            </span>
            <span className="prog-count num">
              {watchedCount} / {TOTAL_EP} {t.episodesLabel}
            </span>
          </div>
          <div className="prog-bar" role="progressbar" aria-valuenow={watchedCount} aria-valuemax={TOTAL_EP}>
            <span className="prog-green" style={{ width: `${greenPct}%` }} />
            <span className="prog-orange" style={{ width: `${orangePct}%` }} />
          </div>
        </div>

        <p className="tracker-sub label">{t.saisons}</p>
        <div className="seasons">
          {SERIES.seasons.map((s) => {
            const wc = seasonWatchedCount(s);
            const seasonDone = wc === s.episodes.length;
            const isOpen = open[s.n];
            return (
              <div className={isOpen ? 'season open' : 'season'} key={s.n}>
                <div className="season-row">
                  <button
                    type="button"
                    className="season-main"
                    aria-expanded={isOpen}
                    onMouseDown={preventFocusScroll}
                    onClick={() => setOpen((o) => ({ ...o, [s.n]: !o[s.n] }))}
                  >
                    <span className="season-poster" aria-hidden="true">
                      <img src={ddBackdrop} alt="" />
                    </span>
                    <span className="season-meta">
                      <span className="season-name">
                        {t.saison} {s.n}
                      </span>
                      <span className="season-count num">
                        {wc} / {s.episodes.length} {t.episodesLabel}
                      </span>
                    </span>
                    <span className="season-chevron" aria-hidden="true">
                      ⌄
                    </span>
                  </button>
                  <button
                    type="button"
                    className={seasonDone ? 'check season-check on' : 'check season-check'}
                    aria-label={t.markSeason}
                    aria-pressed={seasonDone}
                    onMouseDown={preventFocusScroll}
                    onClick={() => toggleSeason(s)}
                  >
                    <span aria-hidden="true">✓</span>
                  </button>
                </div>

                {isOpen && (
                  <ul className="episodes">
                    {s.episodes.map((e, i) => {
                      const on = isW(s.n, i);
                      return (
                        <li className="episode" key={e.t}>
                          <span className="ep-n num">{i + 1}</span>
                          <span className="ep-meta">
                            <span className="ep-title">{e.t}</span>
                            <span className="ep-date num">{e.d}</span>
                          </span>
                          {e.r > 0 && <span className="ep-note num">★ {e.r.toFixed(1)}</span>}
                          <button
                            type="button"
                            className={on ? 'check ep-check on' : 'check ep-check'}
                            aria-label={e.t}
                            aria-pressed={on}
                            onMouseDown={preventFocusScroll}
                            onClick={() => toggleEp(s.n, i)}
                          >
                            <span aria-hidden="true">✓</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TrackItShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);

  // Force le thème sombre du site tant que la page est montée (header/footer
  // collent au fond noir). On mémorise l'état et on restaure au démontage,
  // sans toucher localStorage (préférence utilisateur préservée).
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

    const illum: { el: HTMLElement; sp: HTMLElement[] }[] = [];
    root.querySelectorAll<HTMLElement>('.illuminate').forEach((el) => {
      const sp = Array.from(el.querySelectorAll<HTMLElement>('.wd'));
      if (!reduce) sp.forEach((s) => (s.style.opacity = '0.18'));
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
          s.style.opacity = String(Math.max(0.18, Math.min(1, p * n - i)));
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
    <div className="trackit-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
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
          <h1 aria-label={projet.title}>TrackIt</h1>
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
      <section className="wrap sec sec-context">
        <div className="context-grid">
          <div className="context-text">
            <span className="ey label">{t.s1eyebrow}</span>
            <Lead id="tk-s1" pre={t.s1pre} k={t.s1k} />
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
          <figure className="context-phone reveal">
            <IPhone src={avoir} alt={t.s1cap} />
            <figcaption className="phone-cap">{t.s1cap}</figcaption>
          </figure>
        </div>
      </section>

      {/* 02 SIGNATURE — suivi d'épisodes */}
      <section className="wrap sec">
        <span className="ey label">{t.s2eyebrow}</span>
        <Lead id="tk-s2" pre={t.s2pre} k={t.s2k} />
        <p className="note">{t.s2note}</p>
        <EpisodeTracker t={t} />
      </section>

      {/* 03 LES ÉCRANS */}
      <section className="wrap sec">
        <span className="ey label">{t.s3eyebrow}</span>
        <Lead id="tk-s3" pre={t.s3pre} k={t.s3k} />
        <p className="note">{t.s3note}</p>
        <div className="screens reveal">
          {SCREEN_IMAGES.map((src, i) => (
            <figure className="screen" key={src}>
              <IPhone src={src} alt={t.screens[i].cap} />
              <figcaption className="phone-cap">{t.screens[i].cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 04 IMPACT */}
      <section className="wrap sec">
        <span className="ey label">{t.s4eyebrow}</span>
        <Lead id="tk-s4" pre={t.s4pre} k={t.s4k} />
        <p className="note">{t.s4note}</p>
      </section>

      <ContactFooter />
    </div>
  );
}
