import '@fontsource/manrope/400.css';
import '@fontsource/manrope/600.css';
import '@fontsource/vt323/400.css';
import './salon.css';
import { config } from './config';
import { App } from './core/App';
import { applyApartmentLayout } from './scene/layout';

const container = document.getElementById('salon');

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return canvas.getContext('webgl2') !== null;
  } catch {
    return false;
  }
}

function fallback(root: HTMLElement): void {
  root.innerHTML = `
    <div class="salon-fallback">
      <p>Ce navigateur ne peut pas afficher le salon (WebGL 2 indisponible).</p>
      <a href="/">Voir les projets</a>
    </div>`;
}

function hint(root: HTMLElement): void {
  const element = document.createElement('div');
  element.className = 'salon-hint';
  element.innerHTML =
    '<span>↑ ↓ zapper</span><span>1-9 chaîne</span>' +
    '<span>+ − volume</span><span>M muet</span><span>P power</span><span>L changer de DA</span>';
  root.appendChild(element);
  window.setTimeout(() => element.classList.add('is-hidden'), 7000);
}

async function reachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    // the dev server answers unknown paths with the HTML page
    const type = response.headers.get('content-type') ?? '';
    return response.ok && !type.includes('text/html');
  } catch {
    return false;
  }
}

async function boot(root: HTMLElement): Promise<void> {
  if (!webglAvailable()) {
    fallback(root);
    return;
  }
  // the OSD canvas needs the pixel font before its first draw
  await document.fonts.load('32px VT323').catch(() => undefined);
  // the downloaded apartment moves the TV, lamp and cat paths: decide
  // before anything is built (a missing file keeps the code room)
  if (config.apartment.enabled && (await reachable(config.apartment.url))) {
    applyApartmentLayout();
  } else {
    config.apartment.enabled = false;
  }
  const app = new App(root);
  await app.start();
  hint(root);

  const params = new URLSearchParams(window.location.search);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse || params.has('touch')) {
    const { TouchControls } = await import('./core/TouchControls');
    new TouchControls(root, app.input);
  }
  if (import.meta.env.DEV) {
    const { createDevPanel } = await import('./core/DevPanel');
    createDevPanel(app);
    // handle for debugging from the browser console
    Object.assign(window, { salon: { app, config } });
  }
}

if (container) void boot(container);
