import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    extraBabelPlugins: ["transform-remove-console"],
    transformer: 'esbuild',
    platform: 'node',
  },
  esm: {
    extraBabelPlugins: ["transform-remove-console"],
    transformer: 'babel'
  },
  umd: {
    output: 'dist/unpkg',
    extraBabelPlugins: ["transform-remove-console"],
  },
  platform: 'browser',
});
