/**
 * Prepares a downloaded Sketchfab glTF for the salon (scene/Apartment.ts,
 * scene/Hand.ts): shrinks the textures, paints the colour textures
 * (Kuwahara filter baked into the image: the paint lives in the material,
 * the real lights of the room do the rest) and recompresses everything as
 * WebP.
 *
 *   node scripts/build-model.mjs <unzipped gltf folder> <output folder> [paint]
 *
 * `paint` is the brush radius on the colour textures (default 5; the skin
 * of the hand takes a softer 3). Example output: public/salon/models/chinatown/
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import sharp from 'sharp';

const [source, output, brush] = process.argv.slice(2);
if (!source || !output) {
  console.error('usage: node scripts/build-model.mjs <gltf folder> <output> [paint]');
  process.exit(1);
}

/** Size and treatment per texture role. */
const ROLES = {
  baseColor: { size: 2048, paint: Number(brush ?? 5), quality: 84 },
  normal: { size: 1024, paint: 0, quality: 88 },
  metallicRoughness: { size: 512, paint: 0, quality: 80 },
  emissive: { size: 512, paint: 0, quality: 80 },
  transmission: { size: 256, paint: 0, quality: 80 },
};

function roleOf(uri) {
  for (const role of Object.keys(ROLES)) if (uri.includes(role)) return role;
  return 'metallicRoughness';
}

/**
 * Classic Kuwahara filter on an RGB(A) buffer: each pixel takes the mean of
 * the least varied of its four quadrants, which flattens surfaces into
 * strokes while keeping edges. Summed-area tables make it O(1) per pixel.
 */
function kuwahara(data, width, height, channels, radius) {
  const n = width * height;
  const stride = width + 1;
  const sum = [0, 1, 2].map(() => new Float64Array(stride * (height + 1)));
  const sq = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    const row = [0, 0, 0];
    let rowSq = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      let lum = 0;
      for (let c = 0; c < 3; c++) {
        row[c] += data[i + c];
        lum += data[i + c];
      }
      lum /= 3;
      rowSq += lum * lum;
      const at = (y + 1) * stride + x + 1;
      for (let c = 0; c < 3; c++) sum[c][at] = sum[c][at - stride] + row[c];
      sq[at] = sq[at - stride] + rowSq;
    }
  }
  const box = (table, x0, y0, x1, y1) =>
    table[(y1 + 1) * stride + x1 + 1] -
    table[y0 * stride + x1 + 1] -
    table[(y1 + 1) * stride + x0] +
    table[y0 * stride + x0];
  const out = Buffer.from(data);
  const clampX = (x) => Math.min(width - 1, Math.max(0, x));
  const clampY = (y) => Math.min(height - 1, Math.max(0, y));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let best = Number.POSITIVE_INFINITY;
      let pick = null;
      for (const [dx, dy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        const x0 = clampX(dx < 0 ? x - radius : x);
        const x1 = clampX(dx < 0 ? x : x + radius);
        const y0 = clampY(dy < 0 ? y - radius : y);
        const y1 = clampY(dy < 0 ? y : y + radius);
        const count = (x1 - x0 + 1) * (y1 - y0 + 1);
        const r = box(sum[0], x0, y0, x1, y1) / count;
        const g = box(sum[1], x0, y0, x1, y1) / count;
        const b = box(sum[2], x0, y0, x1, y1) / count;
        const mean = (r + g + b) / 3;
        const variance = box(sq, x0, y0, x1, y1) / count - mean * mean;
        if (variance < best) {
          best = variance;
          pick = [r, g, b];
        }
      }
      const i = (y * width + x) * channels;
      out[i] = pick[0];
      out[i + 1] = pick[1];
      out[i + 2] = pick[2];
    }
  }
  if (n === 0) return out;
  return out;
}

async function texture(uri) {
  const role = roleOf(uri);
  const { size, paint, quality } = ROLES[role];
  // read through Node: libvips chokes on long Windows paths
  const file = readFileSync(join(source, decodeURIComponent(uri)));
  let image = sharp(file).resize(size, size, { fit: 'inside' });
  const meta = await sharp(file).metadata();
  if (paint) {
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    // two passes: broad strokes, then a smaller one to soften the blocks
    let painted = kuwahara(data, info.width, info.height, info.channels, paint);
    painted = kuwahara(painted, info.width, info.height, info.channels, 2);
    image = sharp(painted, {
      raw: { width: info.width, height: info.height, channels: info.channels },
    });
  }
  const name = `${basename(uri).replace(/\.[a-z]+$/i, '')}.webp`;
  writeFileSync(
    join(output, 'textures', name),
    await image.webp({ quality }).toBuffer(),
  );
  return { name, hasAlpha: meta.hasAlpha };
}

mkdirSync(join(output, 'textures'), { recursive: true });
const gltf = JSON.parse(readFileSync(join(source, 'scene.gltf'), 'utf8'));
const alpha = new Map();
for (const image of gltf.images ?? []) {
  const started = Date.now();
  const { name, hasAlpha } = await texture(image.uri);
  console.log(`${name} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
  alpha.set(image, hasAlpha);
  image.uri = `textures/${name}`;
  image.mimeType = 'image/webp';
}
// materials flagged BLEND whose colour texture has no alpha are opaque:
// sorting them as transparent would only cause glitches
for (const material of gltf.materials ?? []) {
  const index = material.pbrMetallicRoughness?.baseColorTexture?.index;
  if (material.alphaMode !== 'BLEND' || index === undefined) continue;
  const image = gltf.images[gltf.textures[index].source];
  if (!alpha.get(image)) delete material.alphaMode;
}
writeFileSync(join(output, 'scene.gltf'), JSON.stringify(gltf));
copyFileSync(join(source, 'scene.bin'), join(output, 'scene.bin'));
console.log('done');
