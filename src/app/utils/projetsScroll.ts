/**
 * Mémoire de la position de défilement de la liste des projets.
 *
 * Indépendante de la transition « morph » : elle survit à toute navigation
 * (y compris projet → autre projet → liste), ce que le snapshot de
 * transition ne fait pas (il n'est conservé que pour un aller-retour direct
 * liste ↔ détail). Simple singleton de module, réinitialisé au rechargement.
 */
let projetsScrollTop = 0;

export const saveProjetsScroll = (top: number) => {
  projetsScrollTop = top;
};

export const getProjetsScroll = () => projetsScrollTop;

/**
 * Position à restaurer au retour sur la liste. On n'utilise le scrollTop du
 * snapshot que s'il provient bien de la liste (aller-retour direct) ; sinon
 * (ex. projet → autre projet → liste, snapshot issu d'une page détail) on
 * s'appuie sur la mémoire dédiée à la liste.
 */
export function resolveInitialProjetsScroll(
  snapshot: { originPath: string; scrollTop: number } | null,
): number {
  return snapshot?.originPath === '/projets'
    ? snapshot.scrollTop
    : getProjetsScroll();
}
