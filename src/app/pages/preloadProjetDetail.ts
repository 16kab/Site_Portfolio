let preloaded = false;

/**
 * Précharge le chunk lazy de la page Détail projet (même module que le
 * `lazy(() => import('./pages/ProjetDetail'))` d'App : Vite dédoublonne).
 * Appelé au survol d'une carte et en tâche de fond depuis la liste, pour
 * que la page soit prête quand la transition « morph » se termine.
 */
export function preloadProjetDetail() {
  if (preloaded) return;
  preloaded = true;
  void import('./ProjetDetail');
}
