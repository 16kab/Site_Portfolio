/// <reference types="vite/client" />

// Résolveur maison « figma:asset/* » → src/assets/* (cf. vite.config.ts)
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}
