import {
  CanvasTexture,
  Color,
  type ColorRepresentation,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from 'three';

/**
 * Painted in the material, like No Rest for the Wicked: every surface gets
 * its own hand-painted albedo, generated once from its colour (no image
 * files) — broad touches and small strokes of slightly different hues,
 * values and temperatures, wear on the edges — then lit by the real lights
 * of the room. The same canvas drives a bump map so the paint ridges catch
 * the light (impasto). Strokes live in the UVs: they stay on the objects.
 */
type Kind = 'brush' | 'wood';
type Edges = 'worn' | 'dark' | false;
const cache = new Map<string, Texture>();

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement('canvas');
  element.width = size;
  element.height = size;
  const ctx = element.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [element, ctx];
}

const scratch = new Color();
const hsl = { h: 0, s: 0, l: 0 };

/** A colour near `base`: hue, saturation and value nudged like on a palette. */
function nearby(base: Color, hue: number, sat: number, light: number): string {
  base.getHSL(hsl);
  scratch.setHSL(
    (hsl.h + (Math.random() - 0.5) * hue + 1) % 1,
    Math.min(1, Math.max(0, hsl.s + (Math.random() - 0.5) * sat)),
    Math.min(1, Math.max(0, hsl.l + (Math.random() - 0.5) * light)),
  );
  return scratch.getStyle();
}

type StrokeOptions = {
  width: number;
  length: number;
  angle: number;
  color: string;
  alpha: number;
};

/** One slightly curved stroke, drawn on the neighbouring tiles too. */
function stroke(
  ctx: CanvasRenderingContext2D,
  size: number,
  x: number,
  y: number,
  o: StrokeOptions,
): void {
  const dx = Math.cos(o.angle) * o.length * 0.5;
  const dy = Math.sin(o.angle) * o.length * 0.5;
  const bend = (Math.random() - 0.5) * 0.5;
  ctx.strokeStyle = o.color;
  ctx.globalAlpha = o.alpha;
  ctx.lineWidth = o.width;
  for (const ox of [-size, 0, size]) {
    for (const oy of [-size, 0, size]) {
      const cx = x + ox;
      const cy = y + oy;
      if (cx < -o.length || cx > size + o.length) continue;
      if (cy < -o.length || cy > size + o.length) continue;
      ctx.beginPath();
      ctx.moveTo(cx - dx, cy - dy);
      ctx.quadraticCurveTo(cx - dy * bend, cy + dx * bend, cx + dx, cy + dy);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function paintedTexture(
  color: ColorRepresentation,
  kind: Kind,
  edges: Edges,
): Texture {
  const base = new Color(color);
  const key = `${base.getHexString()}|${kind}|${edges}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const size = 256;
  const [element, ctx] = canvas(size);
  ctx.fillStyle = base.getStyle();
  ctx.fillRect(0, 0, size, size);
  ctx.lineCap = 'round';
  const wood = kind === 'wood';

  // 1. broad touches that build the surface, direction drifting in patches
  for (let i = 0; i < (wood ? 90 : 70); i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const flow =
      Math.sin((x / size) * Math.PI * 4) + Math.cos((y / size) * Math.PI * 6);
    stroke(ctx, size, x, y, {
      width: wood ? 6 + Math.random() * 10 : 18 + Math.random() * 26,
      length: wood ? 80 + Math.random() * 160 : 40 + Math.random() * 60,
      angle: wood
        ? (Math.random() - 0.5) * 0.1
        : flow * 0.8 + (Math.random() - 0.5) * 0.6,
      color: nearby(base, 0.04, 0.12, 0.16),
      alpha: 0.35 + Math.random() * 0.35,
    });
  }
  // 2. temperature accents: a warm touch here, a cold one there
  for (let i = 0; i < 18; i++) {
    const warm = Math.random() < 0.55;
    base.getHSL(hsl);
    scratch.setHSL(
      warm ? 0.07 : 0.55,
      Math.max(0.25, hsl.s),
      hsl.l * (warm ? 1.1 : 0.9),
    );
    stroke(ctx, size, Math.random() * size, Math.random() * size, {
      width: 10 + Math.random() * 16,
      length: 20 + Math.random() * 40,
      angle: wood ? 0 : Math.random() * Math.PI,
      color: scratch.getStyle(),
      alpha: 0.08 + Math.random() * 0.1,
    });
  }
  // 3. small strokes: the hand's detail, a bit lighter and darker
  for (let i = 0; i < (wood ? 160 : 120); i++) {
    stroke(ctx, size, Math.random() * size, Math.random() * size, {
      width: 2 + Math.random() * 5,
      length: wood ? 30 + Math.random() * 90 : 8 + Math.random() * 20,
      angle: wood ? (Math.random() - 0.5) * 0.08 : Math.random() * Math.PI,
      color: nearby(base, 0.03, 0.1, 0.3),
      alpha: 0.25 + Math.random() * 0.35,
    });
  }
  // 4. wear on the edges (box faces and cylinder rims have their edges on
  //    the UV borders): rubbed light strokes, or darker cavities
  if (edges) {
    const band = size * 0.09;
    for (let i = 0; i < 70; i++) {
      const side = i % 4;
      const along = Math.random() * size;
      const depth = Math.random() * band;
      const x = side === 0 ? depth : side === 1 ? size - depth : along;
      const y = side === 2 ? depth : side === 3 ? size - depth : along;
      base.getHSL(hsl);
      scratch.setHSL(
        hsl.h,
        hsl.s * 0.7,
        edges === 'worn' ? hsl.l + 0.18 : hsl.l * 0.55,
      );
      stroke(ctx, size, x, y, {
        width: 2 + Math.random() * 5,
        length: 10 + Math.random() * 30,
        angle: side < 2 ? Math.PI / 2 : 0,
        color: scratch.getStyle(),
        alpha: 0.3 + Math.random() * 0.4,
      });
    }
  }

  const texture = new CanvasTexture(element);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
}

type PaintOptions = {
  roughness?: number;
  metalness?: number;
  repeat?: number;
  wood?: boolean;
  /** Painted wear on the edges of box-like objects. */
  edges?: Edges;
  /** Relief of the brush strokes (0 = flat). */
  impasto?: number;
  emissive?: ColorRepresentation;
  emissiveIntensity?: number;
};

/** Standard material painted in its own colour, lit by the real lights. */
export function paint(
  color: ColorRepresentation,
  options: PaintOptions = {},
): MeshStandardMaterial {
  const repeat = options.repeat ?? 1;
  // edge wear only makes sense when the texture spans the whole face
  const edges = repeat === 1 ? (options.edges ?? false) : false;
  const map = paintedTexture(
    color,
    options.wood ? 'wood' : 'brush',
    edges,
  ).clone();
  map.repeat.set(repeat, repeat);
  return new MeshStandardMaterial({
    color: '#ffffff',
    map,
    bumpMap: map,
    bumpScale: options.impasto ?? 0.35,
    roughness: options.roughness ?? 0.85,
    metalness: options.metalness ?? 0,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 1,
  });
}

/** Palette (CLAUDE.md §2.5). Shadows come from the grade, not from black. */
export const palette = {
  wall: '#4d4434',
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
