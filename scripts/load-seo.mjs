/**
 * Charge src/app/config/seo.ts (et ses dépendances) dans un contexte Node,
 * en neutralisant les imports d'assets (figma:asset, images) inutiles pour
 * les métadonnées. Partagé par prerender-meta.mjs et check-prerender.mjs.
 */
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function loadSeo() {
  const result = await build({
    entryPoints: [path.join(root, 'src/app/config/seo.ts')],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    plugins: [
      {
        name: 'stub-assets',
        setup(b) {
          b.onResolve({ filter: /^figma:asset\// }, (args) => ({
            path: args.path,
            namespace: 'stub',
          }));
          b.onResolve({ filter: /\.(webp|png|jpe?g|svg|csv)$/ }, (args) => ({
            path: args.path,
            namespace: 'stub',
          }));
          b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
            contents: 'export default ""',
            loader: 'js',
          }));
        },
      },
    ],
  });
  const code = result.outputFiles[0].text;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  return import(dataUrl);
}
