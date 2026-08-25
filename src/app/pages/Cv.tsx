import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageMeta from '../components/PageMeta';
import { ROUTES } from '../config';
import { ROUTE_META } from '../config/seo';
import { useLang } from '../i18n';
import { getCvContent } from './Cv.content';
import './Cv.css';

const CV_META = ROUTE_META[ROUTES.CV];

export default function Cv() {
  const { lang } = useLang();
  const c = getCvContent(lang);
  // Apparence LOCALE de la feuille (indépendante du thème du site) :
  // clair (papier blanc, texte noir) ou sombre (feuille noire, texte blanc).
  // L'impression force toujours le blanc (voir Cv.css @media print).
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="cv-page">
      <PageMeta {...CV_META} />

      <div className="cv-toolbar">
        <div className="cv-switch">
          <button
            type="button"
            className="cv-switch-opt"
            aria-pressed={!dark}
            onClick={() => setDark(false)}
            aria-label={lang === 'fr' ? 'CV clair' : 'Light CV'}
          >
            <span className="cv-swatch cv-swatch--light" />
          </button>
          <button
            type="button"
            className="cv-switch-opt"
            aria-pressed={dark}
            onClick={() => setDark(true)}
            aria-label={lang === 'fr' ? 'CV sombre' : 'Dark CV'}
          >
            <span className="cv-swatch cv-swatch--dark" />
          </button>
        </div>

        <button
          type="button"
          className="cv-download"
          onClick={() => window.print()}
        >
          <Printer size={16} />
          {c.download}
        </button>
      </div>

      <article
        className={dark ? 'cv-sheet cv-sheet--dark' : 'cv-sheet'}
        data-testid="cv-sheet"
        data-variant={dark ? 'dark' : 'light'}
      >
        <header className="cv-header">
          <div>
            <h1 className="cv-name">{c.name}</h1>
            <p className="cv-title">{c.title}</p>
            <ul className="cv-contact">
              <li>
                <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
              </li>
              <li>{c.contact.phone}</li>
              <li>{c.contact.location}</li>
              <li>
                {c.contact.linkedin ? (
                  <a
                    href={c.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                ) : (
                  'LinkedIn'
                )}
              </li>
              <li>{c.contact.site}</li>
            </ul>
          </div>
          {/* Emplacement photo — placeholder tant que l'asset n'est pas fourni */}
          <div className="cv-photo" aria-hidden="true">
            photo
          </div>
        </header>

        {/* Ordre DOM linéaire : Expérience d'abord, puis colonne latérale */}
        <div className="cv-body">
          <section className="cv-main">
            <h2 className="cv-label">{c.labels.experience}</h2>
            {c.experiences.map((exp) => (
              <div className="cv-exp" key={`${exp.company}-${exp.role}`}>
                <div className="cv-exp-head">
                  <span className="cv-exp-role">{exp.role}</span>
                  <span className="cv-exp-period">{exp.period}</span>
                </div>
                <div className="cv-exp-company">
                  {exp.company} · {exp.contract}
                </div>
                <ul className="cv-bullets">
                  {exp.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div className="cv-tags">
                  {exp.tags.map((tag) => (
                    <span className="cv-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className="cv-aside">
            <div className="cv-aside-block">
              <h2 className="cv-label">{c.labels.skills}</h2>
              <ul className="cv-list">
                {c.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="cv-aside-block">
              <h2 className="cv-label">{c.labels.tools}</h2>
              <ul className="cv-list">
                {c.tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="cv-aside-block">
              <h2 className="cv-label">{c.labels.education}</h2>
              {c.education.map((ed) => (
                <div className="cv-edu" key={ed.title}>
                  <div className="cv-edu-title">{ed.title}</div>
                  <div className="cv-edu-meta">
                    {ed.school} · {ed.period}
                  </div>
                </div>
              ))}
            </div>
            <div className="cv-aside-block">
              <h2 className="cv-label">{c.labels.languages}</h2>
              <ul className="cv-list">
                {c.languages.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
