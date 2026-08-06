import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/500-italic.css';
import './AgptShowcase.css';
import { useEffect, useRef, useState } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { ImageLightbox } from '../components/ImageLightbox';
import { useLang, useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import pHome from 'figma:asset/agpt-p-home.webp';
import pGrossesse from 'figma:asset/agpt-p-grossesse.webp';
import pClub from 'figma:asset/agpt-p-club.webp';
import pArticle from 'figma:asset/agpt-p-article.webp';
import pAnnuaire from 'figma:asset/agpt-p-annuaire.webp';

const SITE = [pHome, pGrossesse, pClub, pArticle, pAnnuaire];
const SITE_URL = 'https://www.agirpourtoutes.com';

const PALETTE = [
  { name: 'Crème', hex: '#FDF7F2' },
  { name: 'Blush', hex: '#FBEDE7' },
  { name: 'Rose', hex: '#E93C8C' },
  { name: 'Mauve', hex: '#C99B93' },
  { name: 'Bordeaux', hex: '#5E1C33' },
];

const STRINGS = {
  fr: {
    study: 'Étude de cas',
    heroEyebrow: ['Identité de marque', 'Site web', '2024'],
    thesisPre: 'Une marque chaleureuse ',
    thesisEm: 'pour accompagner les femmes.',
    metaLabels: ['Rôle', 'Client', 'Nature', 'Année'],
    metaValues: ['UX/UI & Direction artistique', 'Agir Pour Toutes', 'Marque + plateforme', '2024'],
    visit: 'Voir le site',
    cue: '↓ étude de cas',
    // 01
    s1eyebrow: '01 — Contexte',
    s1pre: 'Une feuille blanche, ',
    s1k: 'une marque à faire naître.',
    s1note:
      'Agir Pour Toutes accompagne les femmes à chaque étape — grossesse, naissance, post-partum, bien-être. Sans identité ni site, l’enjeu : créer un univers chaleureux, premium et crédible, sans tomber dans les clichés de la maternité.',
    interventionsLabel: 'Mon rôle',
    interventions: [
      'Création de l’identité visuelle',
      'Direction artistique',
      'Conception du site web',
      'Supports visuels associés',
    ],
    // 02 signature
    s2eyebrow: '02 — L’univers de marque',
    s2pre: 'Un univers ',
    s2k: 'chaleureux, premium, féminin.',
    paletteLabel: 'Palette',
    typoLabel: 'Typographie',
    s2note:
      'Une identité éditoriale : serif élégant, palette douce ponctuée de rose, photographie chaleureuse — l’équilibre entre émotion et crédibilité.',
    // 03 site
    s3eyebrow: '03 — Le site',
    s3pre: 'Présenter la mission, ',
    s3k: 'commercialiser les clubs.',
    s3note:
      'Le site présente les univers d’accompagnement, valorise les contenus et permet la vente des clubs thématiques.',
    siteCaps: [
      'Page d’accueil',
      'Univers « Ma Grossesse »',
      'Un club ouvert',
      'Article de contenu',
      'Annuaire des praticiennes',
    ],
    // 04
    s4eyebrow: '04 — La démarche',
    s4pre: 'De l’identité ',
    s4k: 'à la plateforme.',
    steps: [
      {
        t: 'Identité de marque',
        b: 'Logo, palette et typographies — un univers chaleureux et moderne, tout en gardant une dimension crédible et institutionnelle.',
      },
      {
        t: 'Direction artistique',
        b: 'Un univers graphique cohérent pour structurer l’image de la marque sur l’ensemble de ses supports, digitaux et événementiels.',
      },
      {
        t: 'Conception de la plateforme',
        b: 'Le site pour présenter la mission d’AGPT, valoriser les contenus proposés et commercialiser les clubs thématiques.',
      },
      {
        t: 'Accompagnement des fondatrices',
        b: 'Collaboration directe pour clarifier les idées, ajuster les propositions et faire évoluer la direction artistique à travers plusieurs itérations.',
      },
    ],
    // 05
    s5eyebrow: '05 — Impact',
    s5pre: 'Une marque ',
    s5k: 'qui vit sur tous ses supports.',
    gains: [
      'Identité complète de la marque AGPT créée',
      'Plateforme digitale lancée',
      'Univers visuel de la marque structuré',
      'Identité utilisée sur toute la communication, les événements et la communauté',
    ],
  },
  en: {
    study: 'Case study',
    heroEyebrow: ['Brand identity', 'Website', '2024'],
    thesisPre: 'A warm brand ',
    thesisEm: 'to support women.',
    metaLabels: ['Role', 'Client', 'Type', 'Year'],
    metaValues: ['UX/UI & Art direction', 'Agir Pour Toutes', 'Brand + platform', '2024'],
    visit: 'Visit the site',
    cue: '↓ case study',
    s1eyebrow: '01 — Context',
    s1pre: 'A blank page, ',
    s1k: 'a brand to bring to life.',
    s1note:
      'Agir Pour Toutes supports women at every stage — pregnancy, birth, post-partum, wellbeing. With no identity and no site, the challenge: build a warm, premium and credible world, without falling into motherhood clichés.',
    interventionsLabel: 'My role',
    interventions: [
      'Visual identity creation',
      'Art direction',
      'Website design',
      'Associated visual assets',
    ],
    s2eyebrow: '02 — The brand world',
    s2pre: 'A world that is ',
    s2k: 'warm, premium, feminine.',
    paletteLabel: 'Palette',
    typoLabel: 'Typography',
    s2note:
      'An editorial identity: an elegant serif, a soft palette accented with rose, warm photography — the balance between emotion and credibility.',
    s3eyebrow: '03 — The site',
    s3pre: 'Show the mission, ',
    s3k: 'sell the clubs.',
    s3note:
      'The site presents the support worlds, showcases the content and enables the sale of the thematic clubs.',
    siteCaps: [
      'Home page',
      '“My Pregnancy” world',
      'An open club',
      'Content article',
      'Practitioner directory',
    ],
    s4eyebrow: '04 — The approach',
    s4pre: 'From identity ',
    s4k: 'to platform.',
    steps: [
      {
        t: 'Brand identity',
        b: 'Logo, palette and typography — a warm, modern world while keeping a credible, institutional dimension.',
      },
      {
        t: 'Art direction',
        b: 'A coherent visual world to structure the brand image across all its media, digital and events.',
      },
      {
        t: 'Platform design',
        b: 'The site to present AGPT’s mission, showcase the content and sell the thematic clubs.',
      },
      {
        t: 'Working with the founders',
        b: 'Direct collaboration to clarify ideas, adjust proposals and evolve the art direction through several iterations.',
      },
    ],
    s5eyebrow: '05 — Impact',
    s5pre: 'A brand ',
    s5k: 'that lives across every medium.',
    gains: [
      'The full AGPT brand identity created',
      'The digital platform launched',
      'The brand’s visual world structured',
      'Identity used across all communication, events and community',
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

// Signature — la planche d'identité (palette + typographie + logo, natifs)
function BrandBoard({ t }: { t: { paletteLabel: string; typoLabel: string } }) {
  return (
    <div className="board reveal">
      <span className="board-venus" aria-hidden="true">
        ♀
      </span>
      <p className="board-wordmark">
        <em>Agir</em> pour toutes.
      </p>
      <div className="board-grid">
        <div className="board-block">
          <span className="board-h label">{t.paletteLabel}</span>
          <div className="swatches">
            {PALETTE.map((c) => (
              <div className="swatch" key={c.hex}>
                <span className="swatch-c" style={{ background: c.hex }} />
                <span className="swatch-n">{c.name}</span>
                <span className="swatch-x num">{c.hex}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="board-block">
          <span className="board-h label">{t.typoLabel}</span>
          <div className="typo">
            <span className="typo-aa">Aa</span>
            <div className="typo-txt">
              <p className="typo-serif">Agir Pour Toutes</p>
              <p className="typo-meta">Playfair Display — titres</p>
              <p className="typo-sans">Grossesse · Naissance · Post-partum</p>
              <p className="typo-meta">Manrope — texte courant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgptShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [lb, setLb] = useState<number | null>(null);

  // Marque claire → force le thème light du site (header/footer clairs).
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
        const nn = it.sp.length;
        it.sp.forEach((s, i) => {
          s.style.opacity = String(Math.max(0.18, Math.min(1, p * nn - i)));
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
    <div className="agpt-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
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
          <h1 aria-label={projet.title}>Agir Pour Toutes</h1>
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
          <a className="visit" href={SITE_URL} target="_blank" rel="noopener noreferrer">
            {t.visit} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {/* 01 CONTEXTE */}
      <section className="wrap sec">
        <span className="ey label">{t.s1eyebrow}</span>
        <Lead id="agpt-s1" pre={t.s1pre} k={t.s1k} />
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

      {/* 02 SIGNATURE — univers de marque */}
      <section className="wrap sec">
        <span className="ey label">{t.s2eyebrow}</span>
        <Lead id="agpt-s2" pre={t.s2pre} k={t.s2k} />
        <BrandBoard t={t} />
        <p className="note note-center">{t.s2note}</p>
      </section>

      {/* 03 LE SITE */}
      <section className="wrap sec">
        <span className="ey label">{t.s3eyebrow}</span>
        <Lead id="agpt-s3" pre={t.s3pre} k={t.s3k} />
        <p className="note">{t.s3note}</p>
        <div className="tiles reveal">
          {SITE.map((src, i) => (
            <button
              key={src}
              type="button"
              className="tile"
              aria-label={t.siteCaps[i]}
              onClick={(e) => {
                e.currentTarget.blur();
                setLb(i);
              }}
            >
              <span className="tile-img">
                <img src={src} alt={t.siteCaps[i]} loading="lazy" decoding="async" />
              </span>
              <span className="tile-cap">{t.siteCaps[i]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 04 DÉMARCHE */}
      <section className="wrap sec">
        <span className="ey label">{t.s4eyebrow}</span>
        <Lead id="agpt-s4" pre={t.s4pre} k={t.s4k} />
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
        <Lead id="agpt-s5" pre={t.s5pre} k={t.s5k} />
        <ul className="gains reveal">
          {t.gains.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>

      <ContactFooter />

      {lb !== null && (
        <ImageLightbox images={SITE} currentIndex={lb} onClose={() => setLb(null)} />
      )}
    </div>
  );
}
