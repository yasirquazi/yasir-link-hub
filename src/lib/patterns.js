// Geometric tiles as tiny SVG data URIs, used as CSS backgrounds.
const tiles = {
  star: `<path d='M10 10h20v20H10zM20 5.9 34.1 20 20 34.1 5.9 20z'/><path d='M0-4 4 0 0 4M40-4 36 0 40 4M0 36 4 40 0 44M40 36 36 40 40 44'/>`,
  rosette: `<circle cx='20' cy='20' r='10'/><circle cx='10' cy='20' r='10'/><circle cx='30' cy='20' r='10'/><circle cx='20' cy='10' r='10'/><circle cx='20' cy='30' r='10'/>`,
  girih: `<path d='M14 6h12l8 8v12l-8 8H14l-8-8V14z'/><path d='M0 0 6 6M40 0 34 6M0 40 6 34M40 40 34 34M20 0v6M20 34v6M0 20h6M34 20h6'/>`,
  quatrefoil: `<path d='M20 12a6 6 0 1 1 8 8 6 6 0 1 1-8 8 6 6 0 1 1-8-8 6 6 0 1 1 8-8z'/><circle cx='0' cy='0' r='2'/><circle cx='40' cy='0' r='2'/><circle cx='0' cy='40' r='2'/><circle cx='40' cy='40' r='2'/>`,
  lattice: `<path d='M0 0 40 40M40 0 0 40M20 0 40 20 20 40 0 20z'/><circle cx='20' cy='20' r='3.5'/>`,
  zellige: `<path d='M14 14h12v12H14zM20 11.5 28.5 20 20 28.5 11.5 20zM0 0h40v40H0z'/>`,
};

export function patternURL(name, color, opacity = 0.42) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>` +
    `<g fill='none' stroke='${color}' stroke-width='1.1' opacity='${opacity}'>` +
    (tiles[name] || tiles.star) +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) =>
  '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

const base = {
  design: { bg: '#1f4d3a', fg: '#e8d8ab' },
  client: { bg: '#6b1d22', fg: '#e3c27a' },
  personal: { bg: '#1d3b86', fg: '#eadfc6' },
};
// panel: the lighter "screen" colour inside canvas cards
export const palette = Object.fromEntries(
  Object.entries(base).map(([k, c]) => [k, { ...c, panel: mix(c.bg, c.fg, 0.16), deep: mix(c.bg, '#000000', 0.28) }])
);
