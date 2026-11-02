import GUI from 'lil-gui';
import { config } from '../config';
import { toggleLook } from '../render/looks';
import type { App } from './App';

/** Live tuning panel, development builds only (CLAUDE.md §14). */
export function createDevPanel(app: App): GUI {
  const gui = new GUI({ title: 'Salon — réglages' });
  gui.close();

  const render = gui.addFolder('Rendu');
  render.add(config.render, 'exposure', 0.2, 3, 0.01);

  const paint = gui.addFolder('Peinture');
  paint.add(config.paint, 'enabled');
  paint.add(config.paint, 'scale', 0.25, 1, 0.05).onFinishChange(app.resize);
  paint.add(config.paint, 'radius', 2, 10, 1);
  paint.add(config.paint, 'alpha', 0.2, 4, 0.05);
  paint.add(config.paint, 'hardness', 1, 20, 0.5);
  paint.add(config.paint, 'sharpness', 1, 18, 0.5);
  paint.add(config.paint, 'strokeNoise', 0, 0.6, 0.01);
  paint.add(config.paint, 'strokeWidth', 0.5, 6, 0.1);
  paint.add(config.paint, 'strokeLength', 4, 60, 1);
  paint.add(config.paint, 'strokeStrength', 0, 1.2, 0.01);
  paint.add(config.paint, 'impasto', 0, 2, 0.01);
  paint.add(config.paint, 'edgeBreak', 0, 5, 0.1);
  paint.add(config.paint, 'canvasStrength', 0, 0.4, 0.005);
  paint.add(config.paint, 'grainStrength', 0, 0.2, 0.005);
  paint.add(config.paint, 'vignette', 0, 1, 0.01);

  const grade = gui.addFolder('Étalonnage');
  grade.add(config.grade, 'contrast', 0.6, 2, 0.01);
  grade.add(config.grade, 'saturation', 0, 1.6, 0.01);
  grade.add(config.grade, 'shadowLift', 0, 2, 0.01);

  const crt = gui.addFolder('Écran CRT');
  crt.add(config.crt, 'curvature', 0, 0.3, 0.005);
  crt.add(config.crt, 'scanlines', 0, 1, 0.01);
  crt.add(config.crt, 'mask', 0, 0.6, 0.01);
  crt.add(config.crt, 'aberration', 0, 0.02, 0.0005);
  crt.add(config.crt, 'bloom', 0, 2, 0.01);
  crt.add(config.crt, 'brightness', 0.2, 6, 0.05);
  crt.add(config.crt, 'reflection', 0, 0.4, 0.005);
  crt.add(config.crt, 'baseNoise', 0, 0.3, 0.005);

  const head = gui.addFolder('Tête');
  head.add(config.head, 'maxYaw', 0, 45, 1);
  head.add(config.head, 'maxPitch', 0, 30, 1);
  head.add(config.head, 'restPitch', -20, 10, 0.5);
  head.add(config.head, 'stiffness', 2, 60, 0.5);
  head.add(config.head, 'damping', 1, 20, 0.25);
  head.add(config.head, 'fov', 25, 75, 1);
  head.add(config.head, 'handFollow', 0, 1, 0.05);

  const lights = gui.addFolder('Lumières');
  lights.add(config.lights, 'tvIntensity', 0, 40, 0.5);
  lights.add(config.lights, 'tvFlicker', 0, 0.6, 0.01);
  lights.add(config.lights, 'tvColorFollow', 0.5, 20, 0.5);
  lights.add(config.lights, 'lampIntensity', 0, 10, 0.1);
  lights.addColor(config.lights, 'lampColor');
  lights.add(config.lights, 'windowIntensity', 0, 16, 0.1);
  lights.add(config.lights, 'handFill', 0, 3, 0.05);
  lights.add(config.lights, 'ambientIntensity', 0, 3, 0.05);
  lights.add(config.lights, 'headlightIntensity', 0, 20, 0.5);

  const look = gui.addFolder('DA (touche L)');
  look.add({ toggle: () => toggleLook() }, 'toggle').name('DA suivante');
  look.add(config.look, 'bloom', 0, 2, 0.01).name('halo');
  look.add(config.look, 'bloomThreshold', 0, 1, 0.01).name('seuil du halo');
  look.add(config.look, 'beams', 0, 3, 0.01).name('rayons');
  look.add(config.look, 'dust', 0, 3, 0.01).name('poussière');
  look.add(config.look, 'fog', 0, 0.5, 0.005).name('brume');
  look.addColor(config.look, 'fogColor').name('couleur de la brume');
  look.add(config.look, 'candle').name('bougie');

  const sound = gui.addFolder('Mixage (son)');
  sound.add(config.audio, 'master', 0, 1.5, 0.01).name('général');
  sound.add(config.audio, 'ambience', 0, 2, 0.01).name('ambiance (tout)');
  const labels: Record<keyof typeof config.audio.mix, string> = {
    city: 'ville (fenêtre)',
    scooter: 'scooter',
    siren: 'sirène',
    neighbors: 'voisins',
    fridge: 'frigo',
    clock: 'horloge',
    creaks: 'parquet',
    upstairs: 'voisin du dessus',
    roomTone: 'air de la pièce',
    cat: 'chat',
    tvMusic: 'télé : programme',
    tvStatic: 'télé : neige / zapping',
    tvPower: 'télé : allumage / extinction',
    transitions: 'aspiration / éjection',
  };
  for (const key of Object.keys(labels) as (keyof typeof labels)[]) {
    sound.add(config.audio.mix, key, 0, 3, 0.01).name(labels[key]);
  }
  sound
    .add(
      {
        copy: () => {
          const values = JSON.stringify({ ...config.audio }, null, 2);
          void navigator.clipboard?.writeText(values);
          console.info(`[mix] copied to clipboard:\n${values}`);
        },
      },
      'copy',
    )
    .name('copier les réglages');

  const flat = gui.addFolder('Appartement');
  const place = () => app.apartment.applyTransform();
  const position = config.apartment.position;
  flat.add(position, '0', -10, 10, 0.01).name('décalage x').onChange(place);
  flat.add(position, '1', -3, 3, 0.01).name('décalage y').onChange(place);
  flat.add(position, '2', -10, 10, 0.01).name('décalage z').onChange(place);
  flat
    .add(config.apartment, 'rotationY', -180, 180, 1)
    .name('rotation')
    .onChange(place);
  flat
    .add(config.apartment, 'scale', 0.1, 3, 0.01)
    .name('échelle')
    .onChange(place);
  flat
    .add(
      {
        copy: () =>
          navigator.clipboard.writeText(
            JSON.stringify({
              position: config.apartment.position,
              rotationY: config.apartment.rotationY,
              scale: config.apartment.scale,
            }),
          ),
      },
      'copy',
    )
    .name('copier le placement');

  const zap = gui.addFolder('Zapping');
  zap.add(config.zapping, 'duration', 0.05, 0.8, 0.01);
  zap.add(config.zapping, 'noise', 0, 1, 0.01);
  zap.add(config.zapping, 'roll', 0, 0.6, 0.01);

  for (const folder of gui.folders) folder.close();
  return gui;
}
