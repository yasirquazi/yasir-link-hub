import { defineConfig } from 'astro/config';

// Static output, deployable as-is to Cloudflare Pages (build output: dist).
export default defineConfig({
  output: 'static',
  build: {
    format: 'directory',
    inlineStylesheets: 'always', // one request per page on slow networks
  },
  compressHTML: true,
});
