import {
  CanvasTexture,
  type ColorRepresentation,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from 'three';

/**
 * Hand-painted surfaces generated once at startup (no image files): tiled
 * canvases covered with brush dabs, used both as colour variation and as a
 * bump map so the strokes catch the light (impasto).
 */
type Kind = 'brush' | 'wood';
const cache = new Map<Kind, Texture>();

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement('canvas');
  element.width = size;
  element.height = size;
  const ctx = element.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [element, ctx];
}

/**
 * Covers the canvas with short curved strokes. Their direction drifts
 * slowly across the tile, in patches, like a painter working an area.
 */
function paintStrokes(kind: Kind): Texture {
  const size = 512;
  const [element, ctx] = canvas(size);
  ctx.fillStyle = '#c4c4c4';
  ctx.fillRect(0, 0, size, size);
  ctx.lineCap = 'round';
  const wood = kind === 'wood';
  const count = wood ? 420 : 380;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    // tileable flow field: integer frequencies over the tile
    const flow =
      Math.sin((x / size) * Math.PI * 2 * 2) +
      Math.cos((y / size) * Math.PI * 2 * 3);
    const angle = wood
      ? (Math.random() - 0.5) * 0.12
      : flow * 0.9 + (Math.random() - 0.5) * 0.5;
    const length = wood ? 90 + Math.random() * 160 : 50 + Math.random() * 70;
    const width = wood ? 4 + Math.random() * 10 : 16 + Math.random() * 22;
    const light = Math.random() > 0.5;
    const value = light ? 225 + Math.random() * 30 : 95 + Math.random() * 60;
    const alpha = 0.12 + Math.random() * 0.22;
    const dx = Math.cos(angle) * length * 0.5;
    const dy = Math.sin(angle) * length * 0.5;
    // control point pushed sideways: a slightly curved stroke
    const bend = (Math.random() - 0.5) * 0.6;
    const bx = -dy * bend;
    const by = dx * bend;

    ctx.strokeStyle = `rgba(${value},${value * 0.97},${value * 0.94},${alpha})`;
    ctx.lineWidth = width;
    // draw on the neighbouring tiles too so the texture wraps seamlessly
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const cx = x + ox;
        const cy = y + oy;
        if (cx < -length || cx > size + length) continue;
        if (cy < -length || cy > size + length) continue;
        ctx.beginPath();
        ctx.moveTo(cx - dx, cy - dy);
        ctx.quadraticCurveTo(cx + bx, cy + by, cx + dx, cy + dy);
        ctx.stroke();
      }
    }
  }

  const texture = new CanvasTexture(element);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function strokes(kind: Kind): Texture {
  let texture = cache.get(kind);
  if (!texture) {
    texture = paintStrokes(kind);
    cache.set(kind, texture);
  }
  return texture;
}

type PaintOptions = {
  roughness?: number;
  metalness?: number;
  repeat?: number;
  wood?: boolean;
  /** Relief of the brush strokes (0 = flat). */
  impasto?: number;
  emissive?: ColorRepresentation;
  emissiveIntensity?: number;
};

/** Standard material covered with hand-painted brush strokes. */
export function paint(
  color: ColorRepresentation,
  options: PaintOptions = {},
): MeshStandardMaterial {
  const map = strokes(options.wood ? 'wood' : 'brush').clone();
  const repeat = options.repeat ?? 1;
  map.repeat.set(repeat, repeat);
  return new MeshStandardMaterial({
    color,
    map,
    bumpMap: map,
    bumpScale: options.impasto ?? 0.25,
    roughness: options.roughness ?? 0.85,
    metalness: options.metalness ?? 0,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 1,
  });
}

/** Palette (CLAUDE.md §2.5). Shadows come from the grade, not from black. */
export const palette = {
  wall: '#3f3442',
  wallpaperStripe: '#3d2f42',
  floor: '#4e321f',
  ceiling: '#262029',
  wood: '#74452a',
  woodDark: '#43281a',
  plastic: '#1d1a1c',
  skin: '#c4876a',
  sweater: '#5e2428',
  jeans: '#28304a',
  sofa: '#4f3449',
  sofaDark: '#3a2536',
  curtain: '#34444f',
  rug: '#6e3426',
  brass: '#a98446',
};
