import * as esbuild from 'esbuild';
import { polyfillNode } from 'esbuild-plugin-polyfill-node';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  outdir: 'dist',
  plugins: [
    polyfillNode({
      polyfills: { util: true },
    }),
  ],
});
