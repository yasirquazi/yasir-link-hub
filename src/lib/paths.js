// Links and asset paths.
// On the real site (Cloudflare) everything starts from the site root ('/'), which
// stays correct while pages are swapped in place. PREVIEW=1 builds (for hosts that
// serve the site from a sub-folder) use relative paths and plain page loads instead.
export const PREVIEW = import.meta.env.PREVIEW === '1' || process.env.PREVIEW === '1';
const idx = PREVIEW ? 'index.html' : '';

// the site root, seen from a page `depth` folders deep
export const rootFrom = (depth) => (PREVIEW ? (depth ? '../'.repeat(depth) : './') : '/');
export const depthOf = (pathname) => pathname.replace(/index\.html$/, '').split('/').filter(Boolean).length;

// from the home page (the map) to a project page
export const toProject = (slug) => (PREVIEW ? `work/${slug}/${idx}` : `/work/${slug}/`);
// from a project page back to the map
export const toHome = () => (PREVIEW ? `../../${idx}` : '/');
