import './MobileCgrmShowcase.css';
import { useEffect, useRef } from 'react';
import ContactFooter from '../components/ContactFooter';
import PageMeta from '../components/PageMeta';
import { useT } from '../i18n';
import type { Projet } from '../data/projetsData';
import accueil from 'figma:asset/cgrm-accueil.webp';
import remboursement from 'figma:asset/cgrm-remboursement.webp';
import docScreen from 'figma:asset/cgrm-document.webp';
import contrats from 'figma:asset/cgrm-contrats.webp';
import echeances from 'figma:asset/cgrm-echeances.webp';
import echanges from 'figma:asset/cgrm-echanges.webp';

// Écrans réels de l'app (ordre = index utilisé par les beats).
const SCREENS = [accueil, remboursement, docScreen, contrats, echeances, echanges];

// Chaque beat = un propos + l'écran affiché dans le téléphone épinglé.
const BEATS: { id: string; screen: number; extra?: 'steps' | 'gains' }[] = [
  { id: 'contexte', screen: 0 },
  { id: 'remboursements', screen: 1 },
  { id: 'document', screen: 2 },
  { id: 'contrats', screen: 3 },
  { id: 'echeances', screen: 4 },
  { id: 'echanges', screen: 5 },
  { id: 'demarche', screen: 0, extra: 'steps' },
  { id: 'impact', screen: 1, extra: 'gains' },
];

const STRINGS = {
  fr: {
    heroEyebrow: ['UI redesign', 'Product design', '2024'],
    metaRole: 'UX/UI Designer',
    metaClient: 'CGRM – SPVIE Groupe',
    metaYear: '2024',
    steps: [
      { t: "Analyse de l'existant", b: 'Repérer les éléments visuels obsolètes et les points de lisibilité.' },
      { t: 'Adaptation à la charte', b: 'Harmoniser l’interface avec les autres produits digitaux du groupe.' },
      { t: 'Refonte des composants', b: "Moderniser les composants UI et la hiérarchie de l'information." },
      { t: 'Recette avec les devs', b: 'Assurer la cohérence maquettes ↔ implémentation, en recette visuelle et fonctionnelle.' },
    ],
    gains: [
      'Interface mobile modernisée',
      'Lisibilité des informations améliorée',
      "Cohérence renforcée avec l'écosystème du groupe",
      'Retours internes positifs sur la clarté',
    ],
    beats: {
      contexte: { ey: '01 — Contexte', pre: 'Une app qui marchait, ', k: 'une image qui datait.', note: "CGRM a son propre espace assuré sur mobile. L'application remplissait ses fonctions, mais son interface ne reflétait plus les standards visuels des produits du groupe — refonte visuelle, à structure inchangée." },
      remboursements: { ey: '02 — Remboursements', pre: 'Le décompte, ', k: 'enfin limpide.', note: "Ce que prend en charge CGRM, la part Sécurité sociale et le reste à charge — d'un coup d'œil, grâce à une barre de répartition claire." },
      document: { ey: '03 — Envoyer un document', pre: 'Chaque envoi ', k: 'à sa place.', note: 'Portabilité, factures, décomptes, devis… des catégories explicites pour router le bon document sans hésiter.' },
      contrats: { ey: '04 — Contrats', pre: 'Tous ses contrats, ', k: 'en un coup d’œil.', note: 'Garanties, dates, bénéficiaires et numéros — hiérarchisés pour une lecture immédiate.' },
      echeances: { ey: '05 — Échéances', pre: 'Des statuts ', k: 'qui parlent.', note: 'Payé, en attente, régularisation, remboursé — chaque échéance porte sa couleur et son montant.' },
      echanges: { ey: '06 — Devis & échanges', pre: 'Le suivi des devis, ', k: 'sans anxiété.', note: "En cours, terminé, refusé : l'assuré sait toujours où en est sa demande." },
      demarche: { ey: '07 — La démarche', pre: "De l'existant ", k: 'au système.', note: '' },
      impact: { ey: '08 — Impact', pre: 'Une expérience ', k: 'modernisée.', note: '' },
    },
  },
  en: {
    heroEyebrow: ['UI redesign', 'Product design', '2024'],
    metaRole: 'UX/UI Designer',
    metaClient: 'CGRM – SPVIE Groupe',
    metaYear: '2024',
    steps: [
      { t: 'Auditing the existing app', b: 'Spotting the dated visuals and the readability pain points.' },
      { t: 'Applying the brand system', b: 'Harmonising the interface with the group’s other digital products.' },
      { t: 'Rebuilding the components', b: 'Modernising the UI components and the information hierarchy.' },
      { t: 'QA with the developers', b: 'Keeping mockups and implementation in sync, through visual and functional QA.' },
    ],
    gains: [
      'A modernised mobile interface',
      'Clearer, more readable information',
      "Stronger consistency with the group's ecosystem",
      'Positive internal feedback on clarity',
    ],
    beats: {
      contexte: { ey: '01 — Context', pre: 'An app that worked, ', k: 'a look that had aged.', note: 'CGRM has its own policyholder space on mobile. The app did its job, but its interface no longer matched the group’s visual standards — a visual redesign, at unchanged structure.' },
      remboursements: { ey: '02 — Reimbursements', pre: 'The breakdown, ', k: 'finally clear.', note: "What CGRM covers, the social-security share and what's left to pay — at a glance, thanks to a clear split bar." },
      document: { ey: '03 — Sending a document', pre: 'Every upload ', k: 'in its place.', note: 'Portability, invoices, statements, quotes… explicit categories to route the right document without hesitation.' },
      contrats: { ey: '04 — Contracts', pre: 'Every contract, ', k: 'at a glance.', note: 'Guarantees, dates, beneficiaries and numbers — ordered for immediate reading.' },
      echeances: { ey: '05 — Instalments', pre: 'Statuses ', k: 'that speak.', note: 'Paid, pending, adjustment, reimbursed — each instalment carries its colour and amount.' },
      echanges: { ey: '06 — Quotes & messages', pre: 'Tracking quotes, ', k: 'without anxiety.', note: 'In progress, done, declined: the policyholder always knows where their request stands.' },
      demarche: { ey: '07 — The approach', pre: 'From the existing app ', k: 'to a system.', note: '' },
      impact: { ey: '08 — Impact', pre: 'A modernised ', k: 'experience.', note: '' },
    },
  },
};

export default function MobileCgrmShowcase({ projet }: { projet: Projet }) {
  const t = useT(STRINGS);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const beats = Array.from(root.querySelectorAll<HTMLElement>('.beat'));
    const screens = Array.from(root.querySelectorAll<HTMLElement>('.scr'));
    const dots = Array.from(root.querySelectorAll<HTMLElement>('.dot'));
    let current = -1;

    // Le beat actif = celui dont le centre est le plus proche du centre de
    // l'écran. On fond alors l'écran correspondant + on avance le rail de dots.
    function frame() {
      const vh = innerHeight;
      let best = 0;
      let bestDist = Infinity;
      beats.forEach((b, i) => {
        const r = b.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      if (best === current) return;
      current = best;
      const screenIdx = Number(beats[best].dataset.screen || 0);
      screens.forEach((s, i) => {
        s.classList.toggle('on', i === screenIdx);
      });
      dots.forEach((d, i) => {
        d.classList.toggle('on', i === best);
      });
      beats.forEach((b, i) => {
        b.classList.toggle('active', i === best);
      });
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
    frame();
    document.body.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      document.body.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div className="cgrm-showcase" ref={rootRef} style={{ minHeight: '100vh' }}>
      <PageMeta title={`${projet.title} — Alexis Kabiche`} description={projet.description} path={`/projets/${projet.id}`} />

      {/* Hero = le render 3D (cible du morph d'ouverture) → atterrissage propre,
          puis bascule dans le monde clair au scroll. */}
      <section className="m-hero">
        <img className="cover" src={projet.image} alt="" fetchPriority="high" decoding="async" />
        <div className="scrim" aria-hidden="true" />
        <div className="h-in">
          <span className="ey label">
            {t.heroEyebrow.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </span>
          <h1>
            Refonte de l'application mobile <em>CGRM</em>
          </h1>
          <p className="th">{projet.subtitle}</p>
          <div className="meta">
            <span>{t.metaRole}</span>
            <span>{t.metaClient}</span>
            <span>{t.metaYear}</span>
          </div>
        </div>
      </section>

      {/* Scrollytelling : téléphone épinglé (gauche), récit qui défile (droite). */}
      <section className="story">
        <div className="story-inner">
          <div className="phone-col">
            <div className="phone">
              <span className="phone-btn btn-mute" aria-hidden="true" />
              <span className="phone-btn btn-volup" aria-hidden="true" />
              <span className="phone-btn btn-voldn" aria-hidden="true" />
              <span className="phone-btn btn-power" aria-hidden="true" />
              <div className="phone-screen">
                <span className="phone-notch" aria-hidden="true">
                  <i className="notch-cam" />
                </span>
                {SCREENS.map((src, i) => (
                  <img key={src} className={`scr${i === 0 ? ' on' : ''}`} src={src} alt="" loading="lazy" decoding="async" />
                ))}
              </div>
            </div>
            <div className="dots" aria-hidden="true">
              {BEATS.map((b, i) => (
                <span key={b.id} className={`dot${i === 0 ? ' on' : ''}`} />
              ))}
            </div>
          </div>

          <div className="beats">
            {BEATS.map((b) => {
              const bc = t.beats[b.id as keyof typeof t.beats];
              return (
                <article className="beat" data-screen={b.screen} key={b.id}>
                  <span className="ey label">{bc.ey}</span>
                  <h2 className="lead">
                    {bc.pre}
                    <em>{bc.k}</em>
                  </h2>
                  {bc.note && <p className="note">{bc.note}</p>}
                  {b.extra === 'steps' && (
                    <ol className="steps">
                      {t.steps.map((s, i) => (
                        <li key={s.t}>
                          <span className="st-n num">{String(i + 1).padStart(2, '0')}</span>
                          <span className="st-t">{s.t}</span>
                          <span className="st-b">{s.b}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {b.extra === 'gains' && (
                    <ul className="gains">
                      {t.gains.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ContactFooter />
    </div>
  );
}
