/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** DSN Sentry (monitoring d'erreurs). Absent = monitoring dormant. */
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Résolveur maison « figma:asset/* » → src/assets/* (cf. vite.config.ts)
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}
