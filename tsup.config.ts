import { defineConfig } from 'tsup';
import type { Plugin } from 'esbuild';
import { compile } from 'sass';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// esbuild's default resolver has a Yarn PnP detection heuristic that can
// misfire on unrelated ancestor directories; resolving via Node's own
// require.resolve sidesteps that, and also gives us a hook to compile
// .scss (which esbuild has no built-in loader for) before bundling.
const stylesPlugin: Plugin = {
  name: 'styles',
  setup(build) {
    build.onResolve({ filter: /\.s?css$/ }, args => ({
      path: require.resolve(args.path, { paths: [args.resolveDir] })
    }));
    build.onLoad({ filter: /\.scss$/ }, args => ({
      contents: compile(args.path).css,
      loader: 'css'
    }));
  }
};

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  esbuildPlugins: [stylesPlugin],
});
