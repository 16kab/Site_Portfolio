import {
  CanvasTexture,
  type ColorRepresentation,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from 'three';

/**
 * Small procedural textures generated once at startup (no image files).
 * They only add value variation: the paint filter turns it into strokes.
 */
let blotches: Texture | null = null;
let grain: Texture | null = null;

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement('canvas');
  element.width = size;
  element.height = size;
  const ctx = element.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [element, ctx];
}

function toTexture(element: HTMLCanvasElement): Texture {
  const texture = new CanvasTexture(element);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

/** Soft tileable blotches, like uneven paint on a wall. */
export function blotchTexture(): Texture {
  if (blotches) return blotches;
  const size = 256;
  const [element, ctx] = canvas(size);
  ctx.fillStyle = '#d6d6d6';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 12 + Math.random() * 46;
    const light = Math.random() > 0.5;
    const alpha = 0.05 + Math.random() * 0.09;
    // draw the blob on every tile neighbour so the texture wraps
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        const g = ctx.createRadialGradient(
          x + dx,
          y + dy,
          0,
          x + dx,
          y + dy,
          r,
        );
        const tone = light ? '255,255,255' : '40,30,40';
        g.addColorStop(0, `rgba(${tone},${alpha})`);
        g.addColorStop(1, `rgba(${tone},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
      }
    }
  }
  blotches = toTexture(element);
  return blotches;
}

/** Stretched streaks used for wood. */
export function grainTexture(): Texture {
  if (grain) return grain;
  const size = 256;
  const [element, ctx] = canvas(size);
  ctx.fillStyle = '#cfcfcf';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 70; i++) {
    const y = Math.random() * size;
    const h = 1 + Math.random() * 7;
    const tone = Math.random() > 0.55 ? 255 : 30;
    ctx.fillStyle = `rgba(${tone},${tone * 0.8},${tone * 0.6},${0.05 + Math.random() * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 16) {
      ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 3);
    }
    for (let x = size; x >= 0; x -= 16) {
      ctx.lineTo(x, y + h + Math.sin(x * 0.05 + i) * 3);
    }
    ctx.fill();
  }
  grain = toTexture(element);
  return grain;
}

type PaintOptions = {
  roughness?: number;
  metalness?: number;
  repeat?: number;
  wood?: boolean;
  emissive?: ColorRepresentation;
  emissiveIntensity?: number;
};

/** Standard material with procedural value variation. */
export function paint(
  color: ColorRepresentation,
  options: PaintOptions = {},
): MeshStandardMaterial {
  const base = options.wood ? grainTexture() : blotchTexture();
  const map = base.clone();
  const repeat = options.repeat ?? 1;
  map.repeat.set(repeat, repeat);
  return new MeshStandardMaterial({
    color,
    map,
    roughness: options.roughness ?? 0.85,
    metalness: options.metalness ?? 0,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 1,
  });
}

/** Palette (CLAUDE.md §2.5). Shadows come from the grade, not from black. */
export const palette = {
  wall: '#4a3a4e',
  wallpaperStripe: '#3d2f42',
  floor: '#5a3a26',
  ceiling: '#2e2532',
  wood: '#7a4a2a',
  woodDark: '#4b2c1a',
  plastic: '#1d1a1c',
  skin: '#c98f74',
  sweater: '#6b2a2e',
  jeans: '#2b3550',
  sofa: '#5b3b54',
  sofaDark: '#432a3e',
  curtain: '#3d4f5e',
  rug: '#7a3b2b',
  brass: '#b08a4a',
};
