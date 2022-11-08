import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    extraBabelPlugins: ["transform-remove-console"],
    ignores: ['**/*.bak*'],
    transformer: 'esbuild',
    platform: 'node',
  },
  esm: {
    extraBabelPlugins: ["transform-remove-console"],
    ignores: ['**/*.bak*'],
    transformer: 'babel'
  },
  // umd: {
  //   output: 'dist/unpkg',
  //   extraBabelPlugins: ["transform-remove-console"],
  // },
  platform: 'browser',
});
