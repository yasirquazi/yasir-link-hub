import { defineConfig } from 'astro/config';

// Static output, deployable as-is to Cloudflare Pages (build output: dist).
export default defineConfig({
  // the live address: used for the link-preview image. Change it when you add your own domain.
  site: 'https://yasir-link-hub.yasirquazi2000.workers.dev',
  output: 'static',
  build: {
    format: 'directory',
    inlineStylesheets: 'always', // one request per page on slow networks
  },
  compressHTML: true,
});
