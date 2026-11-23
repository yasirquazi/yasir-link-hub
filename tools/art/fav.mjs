// Favicon emblems: same height/colour/material maps as the project artifacts,
// but drawn bold and simple so they still read at 16–32 px.
import fs from 'fs';
const G = (v) => { const n = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${n},${n},${n})`; };
const M = (metal, rough, coat = 0) => `rgb(${Math.round(metal * 255)},${Math.round(rough * 255)},${Math.round(coat * 255)})`;
const P = (cx, cy, r, deg) => { const a = (deg * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
const f = (n) => n.toFixed(1);
const disc = (r, fill) => `<circle cx="500" cy="500" r="${r}" fill="${fill}"/>`;
const ring = (r, w, fill) => `<circle cx="500" cy="500" r="${r}" fill="none" stroke="${fill}" stroke-width="${w}"/>`;
const blur = (id, s) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function blob(R, n, wob, seed) {
  const r = rng(seed); const pts = [];
  for (let i = 0; i < n; i++) pts.push(P(500, 500, R * (1 + (r() - 0.5) * 2 * wob), (i / n) * 360));
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
// the monogram: bold Cinzel Decorative "YQ"
const YQ = (fill, size = 430, y = 650, extra = '') =>
  `<text x="500" y="${y}" text-anchor="middle" fill="${fill}" stroke="${fill}" stroke-width="10" stroke-linejoin="round" textLength="${size * 1.18}" lengthAdjust="spacingAndGlyphs" ${extra} style="font:900 ${size}px 'Cinzel Decorative'">YQ</text>`;
const GOLD = '#efd592';

// 1 · Gold signet coin: dark worn field, bright raised monogram
function coin() {
  const beads = (fill) => Array.from({ length: 40 }, (_, i) => { const [x, y] = P(500, 500, 418, i * 9); return `<circle cx="${f(x)}" cy="${f(y)}" r="11" fill="${fill}"/>`; }).join('');
  const h = `<defs>${blur('b', 2.5)}${blur('s', 8)}</defs><g filter="url(#b)">${disc(480, G(0.32))}<g filter="url(#s)">${ring(462, 36, G(0.66))}</g>${beads(G(0.58))}<g filter="url(#s)">${YQ(G(0.62))}</g>${YQ(G(0.74))}</g>`;
  const c = disc(484, GOLD) + disc(395, '#9a7434') + YQ(GOLD);
  const m = disc(484, M(1, 0.22)) + disc(395, M(1, 0.42)) + YQ(M(1, 0.16));
  return { h, c, m };
}
// 2 · Crimson wax seal with gold-leaf monogram
function wax() {
  const body = blob(450, 9, 0.06, 3), lump = blob(380, 7, 0.04, 8);
  const dome = `<radialGradient id="wd" cx=".45" cy=".42"><stop offset="0" stop-color="${G(0.62)}"/><stop offset="1" stop-color="${G(0.42)}"/></radialGradient>`;
  const h = `<defs>${blur('b', 2.5)}${blur('w', 12)}${blur('r', 9)}${dome}</defs><g filter="url(#w)"><path d="${body}" fill="url(#wd)"/></g><g filter="url(#r)"><path d="${lump}" fill="${G(0.68)}"/>${disc(350, G(0.4))}</g><g filter="url(#b)">${ring(350, 9, G(0.5))}${YQ(G(0.55), 380, 632)}</g>`;
  const c = `<path d="${body}" fill="#8e1a24"/>` + ring(350, 9, '#f8e7b0') + YQ('#fbeab8', 380, 632);
  const m = `<path d="${body}" fill="${M(0, 0.2, 0.7)}"/>` + ring(350, 9, M(1, 0.18)) + YQ(M(1, 0.16), 380, 632);
  return { h, c, m };
}
// 3 · Eight-pointed star tile: lapis enamel in a gold frame
function star() {
  const sq = (r, rot) => 'M' + [0, 1, 2, 3].map((i) => P(500, 500, r, rot + i * 90).map(f).join(' ')).join('L') + 'Z';
  const st = (r, fill) => `<path d="${sq(r, 45)}" fill="${fill}"/><path d="${sq(r, 0)}" fill="${fill}"/>`;
  const h = `<defs>${blur('b', 2.5)}${blur('s', 7)}</defs><g filter="url(#b)"><g filter="url(#s)">${st(492, G(0.6))}</g>${st(448, G(0.42))}${ring(250, 10, G(0.55))}${YQ(G(0.62), 330, 615)}</g>`;
  const c = st(496, GOLD) + st(446, '#1d3f86') + ring(250, 10, GOLD) + YQ(GOLD, 330, 615);
  const m = st(496, M(1, 0.22)) + st(446, M(0, 0.08, 1)) + ring(250, 10, M(1, 0.2)) + YQ(M(1, 0.16), 330, 615);
  return { h, c, m };
}
// 4 · Heater shield: oxblood enamel, gold border, gold monogram
function shield() {
  const S = (i) => `M${60 + i} ${40 + i}H${940 - i}V${440 - i * 0.2}C${940 - i} ${720 - i * 0.6} ${740 - i * 0.4} ${880 - i * 0.7} 500 ${972 - i}C${260 + i * 0.4} ${880 - i * 0.7} ${60 + i} ${720 - i * 0.6} ${60 + i} ${440 - i * 0.2}Z`;
  const h = `<defs>${blur('b', 2.5)}${blur('s', 8)}</defs><g filter="url(#b)"><g filter="url(#s)"><path d="${S(0)}" fill="${G(0.62)}"/></g><path d="${S(50)}" fill="${G(0.42)}"/>${YQ(G(0.6), 360, 560)}</g>`;
  const c = `<path d="${S(-4)}" fill="${GOLD}"/><path d="${S(50)}" fill="#6e1620"/>` + YQ(GOLD, 360, 560);
  const m = `<path d="${S(-4)}" fill="${M(1, 0.22)}"/><path d="${S(50)}" fill="${M(0, 0.1, 1)}"/>` + YQ(M(1, 0.16), 360, 560);
  return { h, c, m };
}

const FONT = fs.readFileSync('/home/claude/art/node_modules/@fontsource/cinzel-decorative/files/cinzel-decorative-latin-900-normal.woff2').toString('base64');
const page = (svg, bg) => `<!doctype html><html><head><style>@font-face{font-family:'Cinzel Decorative';font-weight:900;src:url(data:font/woff2;base64,${FONT})}html,body{margin:0;background:${bg}}svg{display:block}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1000 1000">${svg}</svg></body></html>`;
for (const [slug, fn] of Object.entries({ 'fav-coin': coin, 'fav-wax': wax, 'fav-star': star, 'fav-shield': shield })) {
  const { h, c, m } = fn();
  fs.writeFileSync(`/home/claude/art/maps/${slug}-h.html`, page(h, '#000'));
  fs.writeFileSync(`/home/claude/art/maps/${slug}-c.html`, page(c, 'transparent'));
  fs.writeFileSync(`/home/claude/art/maps/${slug}-m.html`, page(m, '#000'));
}
console.log('ok');
