import {
  CanvasTexture,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from 'three';

/**
 * Hand-painted canvases for the lived-in décor (No Rest for the Wicked's
 * storytelling surfaces): faded wallpaper, water stain, crack, painted
 * corner shadow, worn plastic, knitted ribs. Generated once, no files.
 */
function canvas(
  w: number,
  h = w,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement('canvas');
  element.width = w;
  element.height = h;
  const ctx = element.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [element, ctx];
}

function texture(element: HTMLCanvasElement, color = true): Texture {
  const t = new CanvasTexture(element);
  t.colorSpace = color ? SRGBColorSpace : NoColorSpace;
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** Brush dabs over everything: the painterly grain shared by all surfaces. */
function dabs(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  size: number,
): void {
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const v = Math.random() > 0.5 ? 255 : 40;
    ctx.strokeStyle = `rgba(${v},${v * 0.95},${v * 0.9},${0.04 + Math.random() * 0.08})`;
    ctx.lineWidth = size * (0.5 + Math.random());
    const a = Math.random() * Math.PI;
    const l = size * (1.5 + Math.random() * 3);
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
}

let wallpaperCache: Texture | null = null;

/**
 * Old striped wallpaper with small damask motifs, faded and dirtier toward
 * the top (years of radiator heat and cigarette smoke). Multiplies the
 * wall colour; one tile ≈ 1.2 m wide.
 */
export function wallpaper(): Texture {
  if (wallpaperCache) return wallpaperCache;
  const size = 512;
  const [element, ctx] = canvas(size);
  ctx.fillStyle = '#d9d2c4';
  ctx.fillRect(0, 0, size, size);
  // wide stripes, slightly wavering like hand-printed paper
  for (let i = 0; i < 8; i++) {
    const x = (i / 8) * size;
    ctx.fillStyle = i % 2 ? 'rgba(120,95,110,0.22)' : 'rgba(255,245,230,0.12)';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= size; y += 32)
      ctx.lineTo(x + Math.sin(y * 0.03 + i) * 2, y);
    for (let y = size; y >= 0; y -= 32)
      ctx.lineTo(x + size / 16 + Math.sin(y * 0.03 + i) * 2, y);
    ctx.fill();
  }
  // damask motifs between stripes
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 6; j++) {
      const cx = (i / 8) * size + size / 32 + (i % 2 ? 0 : size / 16);
      const cy = (j / 6) * size + (i % 2 ? size / 12 : 0);
      ctx.fillStyle = 'rgba(95,70,85,0.25)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.quadraticCurveTo(cx + 10, cy, cx, cy + 14);
      ctx.quadraticCurveTo(cx - 10, cy, cx, cy - 14);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  dabs(ctx, size, size, 500, 6);
  // grime: darker toward the top, a few drips
  const grime = ctx.createLinearGradient(0, 0, 0, size);
  grime.addColorStop(0, 'rgba(60,40,30,0.28)');
  grime.addColorStop(0.6, 'rgba(60,40,30,0.0)');
  ctx.fillStyle = grime;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * size;
    ctx.strokeStyle = 'rgba(70,50,35,0.12)';
    ctx.lineWidth = 3 + Math.random() * 6;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(
      x + (Math.random() - 0.5) * 10,
      size * (0.2 + Math.random() * 0.4),
    );
    ctx.stroke();
  }
  wallpaperCache = texture(element);
  return wallpaperCache;
}

/** Brown ring of an old water leak (RGBA, for a decal). */
export function waterStain(): Texture {
  const size = 256;
  const [element, ctx] = canvas(size);
  for (let ring = 0; ring < 5; ring++) {
    const r = size * (0.22 + ring * 0.05) * (0.9 + Math.random() * 0.2);
    ctx.strokeStyle = `rgba(95,60,30,${0.18 - ring * 0.025})`;
    ctx.lineWidth = 6 + Math.random() * 8;
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.2) {
      const wobble =
        r * (1 + Math.sin(a * 3 + ring) * 0.12 + (Math.random() - 0.5) * 0.06);
      const x = size / 2 + Math.cos(a) * wobble;
      const y = size / 2 + Math.sin(a) * wobble * 0.8;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const fill = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size * 0.42,
  );
  fill.addColorStop(0, 'rgba(110,80,45,0.16)');
  fill.addColorStop(1, 'rgba(110,80,45,0)');
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, size, size);
  return texture(element);
}

/** A thin branching crack in the plaster (RGBA). */
export function crack(): Texture {
  const [element, ctx] = canvas(256, 512);
  ctx.strokeStyle = 'rgba(25,15,12,0.85)';
  ctx.lineCap = 'round';
  const branch = (
    x: number,
    y: number,
    angle: number,
    length: number,
    width: number,
  ) => {
    if (length < 12 || width < 0.4) return;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    let px = x;
    let py = y;
    for (let i = 0; i < 6; i++) {
      angle += (Math.random() - 0.5) * 0.8;
      px += Math.cos(angle) * (length / 6);
      py += Math.sin(angle) * (length / 6);
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    branch(px, py, angle + 0.6, length * 0.6, width * 0.7);
    if (Math.random() < 0.6)
      branch(px, py, angle - 0.5, length * 0.45, width * 0.6);
  };
  branch(128, 0, Math.PI / 2, 260, 3);
  return texture(element);
}

/** Vertical black → transparent gradient: painted shadow in the corners. */
export function cornerShadow(): Texture {
  const [element, ctx] = canvas(4, 128);
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 128);
  return texture(element, false);
}

/** Dark plastic with light scratches and rubbed edges (UV ±0.1 m). */
export function wornPlastic(): Texture {
  const size = 256;
  const [element, ctx] = canvas(size);
  ctx.fillStyle = '#bdbdbd';
  ctx.fillRect(0, 0, size, size);
  dabs(ctx, size, size, 160, 4);
  ctx.lineCap = 'round';
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const a = Math.random() * Math.PI;
    const l = 4 + Math.random() * 22;
    ctx.strokeStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.3})`;
    ctx.lineWidth = 0.6 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  return texture(element);
}

/** Knitted ribs (vertical) for the sweater. */
export function knit(): Texture {
  const [element, ctx] = canvas(128);
  ctx.fillStyle = '#b8b8b8';
  ctx.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 8) {
    const g = ctx.createLinearGradient(x, 0, x + 8, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.25)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.25)');
    g.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 8, 128);
  }
  for (let y = 0; y < 128; y += 6) {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, y, 128, 2);
  }
  return texture(element);
}

/** A row of book spines / tape labels: random colours and title bands. */
export function spines(colors: string[], count: number): Texture {
  const [element, ctx] = canvas(256, 64);
  const w = 256 / count;
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(i * w, 0, w, 64);
    ctx.fillStyle = 'rgba(230,210,170,0.55)';
    ctx.fillRect(i * w + w * 0.2, 20 + (i % 3) * 4, w * 0.6, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(i * w, 0, 1.5, 64);
  }
  dabs(ctx, 256, 64, 60, 3);
  return texture(element);
}
