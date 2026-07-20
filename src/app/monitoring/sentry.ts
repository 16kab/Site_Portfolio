import * as Sentry from '@sentry/react';

/**
 * Initialise Sentry (monitoring d'erreurs en production).
 *
 * Chargé dynamiquement et uniquement si `VITE_SENTRY_DSN` est défini — donc
 * dormant par défaut (aucun impact sur le bundle d'entrée, aucune requête).
 * Pour l'activer : créer un projet Sentry (gratuit) et renseigner la variable
 * d'environnement `VITE_SENTRY_DSN` dans Vercel.
 */
export function initSentry(dsn: string) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Traces légères : suffisant pour un portfolio, sans surcoût réseau notable
    tracesSampleRate: 0.1,
    // Pas de session replay par défaut (vie privée + poids)
    integrations: [],
  });
}
