import * as esbuild from 'esbuild';
import { polyfillNode } from 'esbuild-plugin-polyfill-node';

await esbuild.build({
  entryPoints: ['dist/index.js'],
  bundle: true,
  minify: true,
  outfile: 'dist/index.bundle.js',
  plugins: [
    polyfillNode({
      polyfills: { util: true },
    }),
  ],
});
