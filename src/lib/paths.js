// Relative links, so the built site works from any host.
// PREVIEW=1 adds explicit index.html for hosts without directory indexes.
const explicit = import.meta.env.PREVIEW === '1' || process.env.PREVIEW === '1';
const idx = explicit ? 'index.html' : '';

export const toProject = (slug, fromRoot = true) =>
  (fromRoot ? `work/${slug}/` : `../${slug}/`) + idx;

export const toHome = () => `../../${idx}`;

export const toCanvas = () => `../../canvas/${idx}`;

export const toTable = () => `../../table/${idx}`;
