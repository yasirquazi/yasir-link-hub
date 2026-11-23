// Relative links, so the built site works from any host.
// PREVIEW=1 adds explicit index.html for hosts without directory indexes.
const explicit = import.meta.env.PREVIEW === '1' || process.env.PREVIEW === '1';
const idx = explicit ? 'index.html' : '';

// from the home page (the map) to a project page
export const toProject = (slug) => `work/${slug}/` + idx;
// from a project page back to the map
export const toHome = () => `../../${idx}`;
