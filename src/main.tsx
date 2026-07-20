import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Le thème initial est appliqué avant le premier rendu par /theme-init.js
// (chargé depuis index.html) ; AnimatedThemeToggler gère la persistance.

// Monitoring d'erreurs : chargé dynamiquement uniquement si un DSN est
// configuré (dormant par défaut, hors du bundle d'entrée).
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  import('./app/monitoring/sentry')
    .then(({ initSentry }) => initSentry(sentryDsn))
    .catch(() => {
      /* le monitoring ne doit jamais casser le rendu */
    });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
