import '@fontsource/quicksand/400.css';
import '@fontsource/quicksand/500.css';
import '@fontsource/quicksand/600.css';
import '@fontsource/quicksand/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './MauniShowcase.css';
import { useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import accueilL from 'figma:asset/mauni-accueil-light.webp';
import accueilD from 'figma:asset/mauni-accueil-dark.webp';
import budgetL from 'figma:asset/mauni-budget-light.webp';
import budgetD from 'figma:asset/mauni-budget-dark.webp';
import repartitionL from 'figma:asset/mauni-repartition-light.webp';
import repartitionD from 'figma:asset/mauni-repartition-dark.webp';
import epargneL from 'figma:asset/mauni-epargne-light.webp';
import epargneD from 'figma:asset/mauni-epargne-dark.webp';
import previsionnelL from 'figma:asset/mauni-previsionnel-light.webp';
import previsionnelD from 'figma:asset/mauni-previsionnel-dark.webp';
import transactionL from 'figma:asset/mauni-transaction-light.webp';
import transactionD from 'figma:asset/mauni-transaction-dark.webp';
import reglagesL from 'figma:asset/mauni-reglages-light.webp';
import reglagesD from 'figma:asset/mauni-reglages-dark.webp';

const MTOP = 134; // doit refléter --mtop dans MauniShowcase.css

type Lead = { pre: string; k: string; post: string };

const STRINGS = {
  fr: {
    study: 'Étude de cas',
    heroEyebrow: ['Application mobile', 'Finances personnelles', '2026'],
    thesisPre: 'Reprendre la main sur son argent — ',
    thesisEm: 'sans y penser.',
    railSub: 'App de budget — reprendre la main sur son argent, sans y penser.',
    metaLabels: ['Rôle', 'Plateforme', 'Portée', 'Année', 'Outils'],
    metaValues: ['Design, marque & code', 'iOS · Android', 'Concept → Produit en ligne', '2026', 'Claude Code · Illustrator'],
    nav: ['Contexte', 'Rôle', 'Écrans', 'Répartition', 'Objectifs'],
    cue: '↓ étude de cas',
    defiler: 'Défiler',
    clair: 'Clair',
    sombre: 'Sombre',
    enlarge: (name: string) => `Agrandir la capture « ${name} »`,
    s1lead: { pre: "Un découvert n'est pas un manque d'argent : c'est ", k: 'un manque de visibilité.', post: '' } as Lead,
    s1note: "Mauni remplace l'angoisse par une lecture claire — ce qui rentre, ce qui sort, ce qu'il reste.",
    bandTop: 'Compte courant · Connecté',
    bandSubLabels: ['Revenus du mois', 'Dépenses', 'Épargne'],
    bandSubValues: ['2 400,00 €', '1 500,30 €', '300,00 €'],
    s2lead: { pre: 'Seul aux commandes, ', k: 'du concept au produit en ligne.', post: '' } as Lead,
    s2note: "Recherche, architecture de l'information, UI et système de composants, direction de marque — puis le développement de l'app elle-même. Connexions bancaires et authentification réelles : un produit qui tourne, pas une maquette.",
    s3lead: { pre: 'Dix-huit écrans, ', k: 'une seule logique', post: " : le solde d'abord, la décision ensuite." } as Lead,
    s4lead: { pre: 'Douze catégories, ', k: 'un seul anneau', post: ". Le relevé illisible devient une image qu'on comprend d'un regard." } as Lead,
    s5lead: { pre: "L'épargne devient ", k: 'un projet', post: ', pas une contrainte — un montant, une échéance, une intention.' } as Lead,
    screens: [
      { b: 'Accueil', r: " — le solde, la vue d'ensemble" },
      { b: 'Budget', r: ' — suivi par catégorie' },
      { b: 'Répartition', r: " — l'anneau des dépenses" },
      { b: 'Épargne', r: ' — les objectifs mis de côté' },
      { b: 'Prévisionnel', r: ' — anticiper la fin de mois' },
      { b: 'Transactions', r: " — classées d'un geste" },
      { b: 'Réglages', r: ' — sobre, sans détour' },
    ],
  },
  en: {
    study: 'Case study',
    heroEyebrow: ['Mobile app', 'Personal finance', '2026'],
    thesisPre: 'Take back control of your money — ',
    thesisEm: 'without thinking about it.',
    railSub: 'Budgeting app — take back control of your money, without thinking about it.',
    metaLabels: ['Role', 'Platform', 'Scope', 'Year', 'Tools'],
    metaValues: ['Design, brand & code', 'iOS · Android', 'Concept → Live product', '2026', 'Claude Code · Illustrator'],
    nav: ['Context', 'Role', 'Screens', 'Breakdown', 'Goals'],
    cue: '↓ case study',
    defiler: 'Scroll',
    clair: 'Light',
    sombre: 'Dark',
    enlarge: (name: string) => `Enlarge the "${name}" screen`,
    s1lead: { pre: "An overdraft isn't a lack of money: it's ", k: 'a lack of visibility.', post: '' } as Lead,
    s1note: "Mauni replaces anxiety with a clear read — what comes in, what goes out, what's left.",
    bandTop: 'Checking account · Connected',
    bandSubLabels: ['Monthly income', 'Expenses', 'Savings'],
    bandSubValues: ['€2,400.00', '€1,500.30', '€300.00'],
    s2lead: { pre: 'Solo, ', k: 'from concept to live product.', post: '' } as Lead,
    s2note: 'Research, information architecture, UI and component system, brand direction — then building the app itself. Real bank connections and authentication: a product that runs, not a mockup.',
    s3lead: { pre: 'Eighteen screens, ', k: 'one logic', post: ': balance first, decision next.' } as Lead,
    s4lead: { pre: 'Twelve categories, ', k: 'a single ring', post: '. The unreadable statement becomes an image you grasp at a glance.' } as Lead,
    s5lead: { pre: 'Saving becomes ', k: 'a project', post: ', not a constraint — an amount, a deadline, an intention.' } as Lead,
    screens: [
      { b: 'Home', r: ' — balance, the big picture' },
      { b: 'Budget', r: ' — tracking by category' },
      { b: 'Breakdown', r: ' — the spending ring' },
      { b: 'Savings', r: ' — goals set aside' },
      { b: 'Forecast', r: ' — anticipate month-end' },
      { b: 'Transactions', r: ' — sorted in one tap' },
      { b: 'Settings', r: ' — plain, no detours' },
    ],
  },
};

const GALLERY = [
  { src: accueilL, dark: accueilD as string | null },
  { src: budgetL, dark: budgetD },
  { src: repartitionL, dark: repartitionD },
  { src: epargneL, dark: epargneD },
  { src: previsionnelL, dark: previsionnelD },
  { src: transactionL, dark: transactionD },
  { src: reglagesL, dark: reglagesD },
];

// Découpe un segment en mots enveloppés dans des <span.wd> (JSX, pas de
// mutation du DOM), pour que l'illumination survive aux re-rendus (React
// reste propriétaire des nœuds ; l'opacité est posée en style inline).
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

export default function MauniShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];

    // Le texte du hero apparaît en fondu (CSS : .m-hero .in), pas d'animation
    // lettre par lettre — la transition de page fait déjà l'apparition.

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

    // ── Compteur du solde ────────────────────────────────────────
    const amount = root.querySelector<HTMLElement>('#m-amount');
    const fmt = (n: number) =>
      lang === 'en'
        ? '€' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : n.toFixed(2).replace('.', ',') + ' €';
    if (amount) {
      if (reduce) amount.textContent = fmt(266.84);
      else {
        const cObs = new IntersectionObserver(
          (es, ob) => {
            es.forEach((e) => {
              if (e.isIntersecting) {
                let t0: number | null = null;
                const step = (ts: number) => {
                  if (t0 === null) t0 = ts;
                  const p = Math.min((ts - t0) / 1300, 1);
                  amount.textContent = fmt(266.84 * (1 - Math.pow(1 - p, 3)));
                  if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                ob.disconnect();
              }
            });
          },
          { threshold: 0.5 },
        );
        cObs.observe(amount);
        cleanups.push(() => cObs.disconnect());
      }
    }

    // ── Switch clair/sombre de la galerie (knob + fondu) ─────────
    const gtoggle = root.querySelector<HTMLElement>('#m-gtoggle');
    let gDark = false;
    const applyMode = () => {
      if (!gtoggle) return;
      gtoggle.setAttribute('data-mode', gDark ? 'dark' : 'light');
      gtoggle.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
        b.classList.toggle('on', b.dataset.mode === (gDark ? 'dark' : 'light'));
      });
      root.querySelectorAll<HTMLElement>('#m-htrack .screen').forEach((scr) => {
        const l = scr.querySelector<HTMLElement>('.lyr.l');
        const d = scr.querySelector<HTMLElement>('.lyr.d');
        if (!d || !l) return;
        l.style.opacity = gDark ? '0' : '1';
        d.style.opacity = gDark ? '1' : '0';
      });
    }
    const onToggle = (e: Event) => {
      const b = (e.target as HTMLElement).closest('button');
      if (!b) return;
      gDark = (b as HTMLElement).dataset.mode === 'dark';
      applyMode();
    };
    gtoggle?.addEventListener('click', onToggle);
    cleanups.push(() => gtoggle?.removeEventListener('click', onToggle));

    // ── Galerie épinglée : vertical → horizontal, débord + fondu ─
    const hwrap = root.querySelector<HTMLElement>('#m-hwrap');
    const hpin = root.querySelector<HTMLElement>('#m-hpin');
    const hview = root.querySelector<HTMLElement>('#m-hviewport');
    const htrack = root.querySelector<HTMLElement>('#m-htrack');
    const hbar = root.querySelector<HTMLElement>('#m-hbarfill');
    const gbar = root.querySelector<HTMLElement>('.gbar');
    let pinned = false;
    let D = 0;
    const pinModeOn = () =>
      !reduce && matchMedia('(min-width: 861px)').matches;
    function measure() {
      if (!hwrap || !hpin || !hview || !htrack) return;
      if (pinModeOn()) {
        hwrap.classList.remove('gfallback');
        hview.style.width = '';
        const left = hview.getBoundingClientRect().left;
        hview.style.width = window.innerWidth - left + 'px';
        // La barre (Défiler + switch) déborde jusqu'au bord droit comme la
        // galerie ; le switch se cale ainsi à droite au max (marge via CSS).
        if (gbar) {
          gbar.style.width = '';
          gbar.style.width =
            window.innerWidth - gbar.getBoundingClientRect().left + 'px';
        }
        D = Math.max(0, htrack.scrollWidth - hview.clientWidth);
        hwrap.style.height = hpin.offsetHeight + D + 'px';
        pinned = true;
      } else {
        hwrap.classList.add('gfallback');
        hwrap.style.height = 'auto';
        htrack.style.transform = 'none';
        hview.style.width = '';
        if (gbar) gbar.style.width = '';
        pinned = false;
      }
    }
    function hUpdate() {
      if (!hwrap || !hview || !htrack || !hbar) return;
      if (!pinned) {
        const max = hview.scrollWidth - hview.clientWidth;
        const pp = max > 0 ? hview.scrollLeft / max : 0;
        hbar.style.width = 6 + pp * 94 + '%';
        return;
      }
      let p = D > 0 ? (MTOP - hwrap.getBoundingClientRect().top) / D : 0;
      p = Math.max(0, Math.min(1, p));
      htrack.style.transform = `translateX(${(-p * D).toFixed(1)}px)`;
      hbar.style.width = 6 + p * 94 + '%';
      // Fondu de gauche : apparaît dès qu'on défile (plein à p≈0.04).
      hview.style.setProperty('--m-lfade', String(Math.min(1, p / 0.04)));
    }

    // ── Zoom de l'image hero au scroll (échelle 1 → 1.15) ────────
    const cover = root.querySelector<HTMLElement>('.m-hero .cover');
    const heroEl = root.querySelector<HTMLElement>('.m-hero');
    const heroZoom = () => {
      if (!cover || !heroEl || reduce) return;
      const h = heroEl.offsetHeight || 1;
      const p = Math.max(0, Math.min(1, document.body.scrollTop / h));
      // Pas de transform à l'état initial (échelle 1) : une transform identité
      // force quand même une couche de composition qui peut perturber la
      // capture de la view-transition du thème, là où on bascule le plus.
      cover.style.transform = p > 0.001 ? `scale(${(1 + p * 0.15).toFixed(4)})` : '';
    };

    function setup() {
      measure();
      hUpdate();
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
          hUpdate();
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

    // Glisser horizontal en mode repli (mobile / reduce)
    let dn = false;
    let sx = 0;
    let sl = 0;
    const pd = (e: PointerEvent) => {
      if (pinned || !hview) return;
      dn = true;
      sx = e.clientX;
      sl = hview.scrollLeft;
      hview.setPointerCapture(e.pointerId);
    };
    const pm = (e: PointerEvent) => {
      if (!dn || !hview) return;
      hview.scrollLeft = sl - (e.clientX - sx);
    };
    const pu = () => {
      dn = false;
    };
    const ps = () => {
      if (!pinned) hUpdate();
    };
    hview?.addEventListener('pointerdown', pd);
    hview?.addEventListener('pointermove', pm);
    hview?.addEventListener('pointerup', pu);
    hview?.addEventListener('scroll', ps);
    cleanups.push(() => {
      hview?.removeEventListener('pointerdown', pd);
      hview?.removeEventListener('pointermove', pm);
      hview?.removeEventListener('pointerup', pu);
      hview?.removeEventListener('scroll', ps);
    });

    return () => cleanups.forEach((fn) => fn());
  }, [lang]);

  return (
    <div
      className="mauni-showcase"
      ref={rootRef}
      style={{ minHeight: '100vh' }}
    >
      <PageMeta
        title={`${projet.title} — Alexis Kabiche`}
        description={projet.description}
        path={`/projets/${projet.id}`}
      />

      {/* HERO */}
      <section className="m-hero">
        <img className="cover" src={projet.image} alt={projet.title} fetchPriority="high" decoding="async" />
        <div className="scrim" aria-hidden="true" />
        <div className="wrap in">
          <div className="ey label" style={{ color: 'rgba(255,255,255,.85)' }}>
            {t.heroEyebrow.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </div>
          <h1 id="m-htitle" aria-label={projet.title}>
            {projet.title}
          </h1>
          <p className="th">
            {t.thesisPre}
            <em>{t.thesisEm}</em>
          </p>
        </div>
        <div className="label" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: '20px', textAlign: 'center', color: 'rgba(255,255,255,.72)' }}>
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

        <main className="stream">
            <section className="sec" id="m-s1" data-sec>
              <span className="ey label">01 — {t.nav[0]}</span>
              <Lead id="m-s1lead" lead={t.s1lead} />
              <p className="note">{t.s1note}</p>
            </section>

            <section className="sec" id="m-s2" data-sec>
              <span className="ey label">02 — {t.nav[1]}</span>
              <Lead id="m-s2lead" lead={t.s2lead} />
              <p className="note">{t.s2note}</p>
            </section>

            <section className="sec" id="m-s3" data-sec>
              <span className="ey label">03 — {t.nav[2]}</span>
              <Lead id="m-s3lead" lead={t.s3lead} />
              <div className="hwrap" id="m-hwrap">
                <div className="hpin" id="m-hpin">
                  <div className="gbar">
                    <div className="hbar">
                      <span>{t.defiler}</span>
                      <span className="tk">
                        <i id="m-hbarfill" />
                      </span>
                    </div>
                    <div
                      className="gswitch"
                      id="m-gtoggle"
                      data-mode="light"
                      role="group"
                      aria-label="Thème des captures"
                    >
                      <span className="knob" aria-hidden="true" />
                      <button type="button" data-mode="light" className="on">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
                        {t.clair}
                      </button>
                      <button type="button" data-mode="dark">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
                        {t.sombre}
                      </button>
                    </div>
                  </div>
                  <div className="hviewport" id="m-hviewport">
                    <div className="htrack" id="m-htrack">
                      {GALLERY.map((g, i) => (
                        <figure className="gitem" key={g.src}>
                          <button
                            type="button"
                            className="gshot"
                            aria-label={t.enlarge(t.screens[i].b)}
                            onClick={() => setLbIndex(i)}
                          >
                            <div className="device">
                              <div className="screen">
                                {g.dark ? (
                                  <>
                                    <img className="lyr l" src={g.src} alt={t.screens[i].b} />
                                    <img className="lyr d" src={g.dark} alt="" />
                                  </>
                                ) : (
                                  <img src={g.src} alt={t.screens[i].b} />
                                )}
                              </div>
                            </div>
                          </button>
                          <figcaption className="c">
                            <b>{t.screens[i].b}</b>
                            {t.screens[i].r}
                          </figcaption>
                        </figure>
                      ))}
                      <div className="gspacer" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="band reveal" role="img" aria-label={`${t.bandTop} 266,84 €`}>
                <div className="top">
                  <span className="dot" />
                  {t.bandTop}
                </div>
                <div className="amount num" id="m-amount">
                  0,00 €
                </div>
                <div className="subs">
                  {t.bandSubLabels.map((l, i) => (
                    <div key={l}>
                      <span className="l">{l}</span>
                      <span className="num">{t.bandSubValues[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="sec" id="m-s4" data-sec>
              <span className="ey label">04 — {t.nav[3]}</span>
              <div className="rep">
                <Lead id="m-s4lead" lead={t.s4lead} />
                <div className="device reveal">
                  <div className="screen">
                    <img className="s-l" src={repartitionL} alt="Mauni — répartition" />
                    <img className="s-d" src={repartitionD} alt="" />
                  </div>
                </div>
              </div>
            </section>

            <section className="sec" id="m-s5" data-sec>
              <span className="ey label">05 — {t.nav[4]}</span>
              <div className="rep">
                <Lead id="m-s5lead" lead={t.s5lead} />
                <div className="device reveal">
                  <div className="screen">
                    <img className="s-l" src={epargneL} alt="Mauni — épargne" />
                    <img className="s-d" src={epargneD} alt="" />
                  </div>
                </div>
              </div>
            </section>
        </main>
      </div>

      <ContactFooter />

      {lbIndex !== null && (
        <ImageLightbox
          images={GALLERY.map((g) => g.src)}
          currentIndex={lbIndex}
          onClose={() => setLbIndex(null)}
        />
      )}
    </div>
  );
}
