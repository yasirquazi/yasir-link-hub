// Draws the three maps Blender needs for each artifact, on a 1000×1000 canvas:
//   h: height (black = table, white = highest relief)
//   c: base colour
//   m: material  (R = metallic, G = roughness, B = clear coat)
// Blender turns h into real geometry, and uses it again as fine bump detail.
import fs from 'fs';
import { VALUES_EDGE, HIREIN5, NOX, YAJ_WORD } from '/home/claude/yq-hub/src/lib/logos.js';

const G = (v) => { const n = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${n},${n},${n})`; };
const M = (metal, rough, coat = 0) => `rgb(${Math.round(metal * 255)},${Math.round(rough * 255)},${Math.round(coat * 255)})`;
const P = (cx, cy, r, deg) => { const a = (deg * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
const f = (n) => n.toFixed(1);
const ring = (r, w, fill, cx = 500, cy = 500) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${fill}" stroke-width="${w}"/>`;
const disc = (r, fill, cx = 500, cy = 500) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
// a smooth closed blob around (cx, cy)
function blob(cx, cy, R, n, wob, seed, squash = 1) {
  const r = rng(seed); const pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * 360; const rr = R * (1 + (r() - 0.5) * 2 * wob); const [x, y] = P(cx, cy, rr, a); pts.push([x, cy + (y - cy) * squash]); }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
const arcPath = (id, r, start = 180, sweep = 1, cx = 500, cy = 500) => {
  const [x1, y1] = P(cx, cy, r, start), [x2, y2] = P(cx, cy, r, start + 359.9 * (sweep ? 1 : -1));
  return `<path id="${id}" d="M${f(x1)} ${f(y1)}A${r} ${r} 0 1 ${sweep} ${f(x2)} ${f(y2)}" fill="none"/>`;
};
const legend = (id, r, text, size, fill, start = 180, extra = '') =>
  arcPath(id, r, start) + `<text fill="${fill}" style="font:900 ${size}px Cinzel;letter-spacing:${extra || 4}px"><textPath href="#${id}" startOffset="0">${text}</textPath></text>`;
const blur = (id, s) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

const CURSOR = 'M0 0V36L9.5 27.5L16 42L22.5 39L16.2 24.8H28.5Z';
const GOLD = '#efd592', SILVER = '#c9c9cc', BRASS = '#dcb56a';

// ─────────────────────────────────────────── 1. Portfolio: a gold coin
function coin() {
  const beads = (r, n, rad, fill) => Array.from({ length: n }, (_, i) => { const [x, y] = P(500, 500, r, (i * 360) / n); return `<circle cx="${f(x)}" cy="${f(y)}" r="${rad}" fill="${fill}"/>`; }).join('');
  const quatrefoil = (fill, w) => [0, 90, 180, 270].map((a) => { const [x, y] = P(500, 500, 120, a); return `<circle cx="${f(x)}" cy="${f(y)}" r="128" fill="none" stroke="${fill}" stroke-width="${w}"/>`; }).join('');
  const fleur = (a, fill) => { const [x, y] = P(500, 500, 262, a); return `<g transform="translate(${f(x)} ${f(y)}) rotate(${a + 90})"><path d="M0 -26C10 -12 10 4 0 14C-10 4 -10 -12 0 -26ZM-4 14C-18 16 -26 6 -20 -4C-14 4 -8 8 -4 8ZM4 14C18 16 26 6 20 -4C14 4 8 8 4 8Z" fill="${fill}"/></g>`; };
  const cursor = (fill) => `<g transform="translate(500 500) rotate(-12) translate(-95 -150) scale(6.6)"><path d="${CURSOR}" fill="${fill}" stroke="${fill}" stroke-width="1.2" stroke-linejoin="round"/></g>`;
  const text = '✠ YASIR · QVAZI ✠ PRODVCT · DESIGNER ';
  const h = `<defs>${blur('b', 2.2)}${blur('rim', 6)}</defs><g filter="url(#b)">` +
    disc(420, G(0.34)) + `<g filter="url(#rim)">${ring(404, 30, G(0.62))}</g>` + beads(372, 72, 6.5, G(0.6)) +
    ring(352, 5, G(0.55)) + legend('l', 302, text, 54, G(0.6), 180, 3) + ring(282, 5, G(0.55)) +
    quatrefoil(G(0.56), 9) + [45, 135, 225, 315].map((a) => fleur(a, G(0.58))).join('') +
    `<g filter="url(#rim)">${cursor(G(0.72))}</g>` + cursor(G(0.78)) + `</g>`;
  const c = disc(424, GOLD);
  const m = disc(424, M(1, 0.24));
  return { h, c, m };
}

// ─────────────────────────────────────────── 2. The Values Edge: an enamelled rosette brooch
function rosette() {
  const LOB = Array.from({ length: 8 }, (_, i) => P(500, 500, 300, -90 + i * 45 + 22.5));
  const lobes = (r, fill) => LOB.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fill}"/>`).join('') + disc(r + 180, fill);
  const COLORS = ['#e2b52e', '#18935a', '#7c2e16', '#523093', '#105c9a', '#d6402f', '#ec7436', '#e4586a'];
  const petals = (fill, stroke) => `<g transform="translate(500 500) scale(4.05) translate(-60 -60)">` + VALUES_EDGE.map((d, i) => `<path d="${d}" fill="${fill || COLORS[i]}" ${stroke || ''}/>`).join('') + `</g>`;
  const gems = (fn) => LOB.map(([x, y], i) => fn(x, y, i)).join('');
  const gran = (fill) => LOB.map(([x, y]) => { const [gx, gy] = [x, y]; return [0, 1, 2, 3, 4, 5].map((k) => { const [dx, dy] = P(gx, gy, 72, k * 60 + 30); return `<circle cx="${f(dx)}" cy="${f(dy)}" r="7" fill="${fill}"/>`; }).join(''); }).join('');
  const domeGrad = `<radialGradient id="dome"><stop offset="0" stop-color="${G(0.72)}"/><stop offset=".7" stop-color="${G(0.62)}"/><stop offset="1" stop-color="${G(0.5)}"/></radialGradient>`;
  const h = `<defs>${blur('b', 2)}${blur('s', 5)}${domeGrad}</defs><g filter="url(#b)">` +
    `<g filter="url(#s)">${lobes(118, G(0.62))}</g>` + lobes(100, G(0.42)) +
    ring(286, 12, G(0.6)) + petals(G(0.5)) + petals('none', `stroke="${G(0.58)}" stroke-width="1.3"`) +
    gems((x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="50" fill="url(#dome)"/>`) + gran(G(0.56)) +
    disc(46, 'url(#dome)') + ring(62, 8, G(0.6)) + `</g>`;
  const c = lobes(122, GOLD) + petals() + gems((x, y, i) => `<circle cx="${f(x)}" cy="${f(y)}" r="47" fill="${COLORS[(i + 4) % 8]}"/>`) + disc(54, GOLD);
  const m = lobes(122, M(1, 0.26)) + petals(M(0, 0.12, 1)) + gems((x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="47" fill="${M(0, 0.04, 1)}"/>`) + disc(54, M(1, 0.2));
  return { h, c, m };
}

// ─────────────────────────────────────────── 3. Hirein5: a silver repoussé plaque
function plaque() {
  const RX = 300, RY = 410;
  const ell = (dx, fill, extra = '') => `<ellipse cx="500" cy="500" rx="${RX - dx}" ry="${RY - dx}" fill="${fill}" ${extra}/>`;
  const scal = (n, rad, inset, fill) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; const x = 500 + (RX - inset) * Math.cos(a), y = 500 + (RY - inset) * Math.sin(a); return `<circle cx="${f(x)}" cy="${f(y)}" r="${rad}" fill="${fill}"/>`; }).join('');
  const rays = (fill) => Array.from({ length: 72 }, (_, i) => { const [x, y] = P(500, 470, 330, i * 5); return `<path d="M500 470L${f(x)} ${f(y)}" stroke="${fill}" stroke-width="2.2"/>`; }).join('');
  const shells = (fill) => [0, 90, 180, 270].map((a) => { const x = 500 + (RX - 18) * Math.cos((a * Math.PI) / 180), y = 500 + (RY - 18) * Math.sin((a * Math.PI) / 180); return `<g transform="translate(${f(x)} ${f(y)}) rotate(${a + 90})"><path d="M-46 0C-46 -40 46 -40 46 0C30 -8 16 -10 0 -10C-16 -10 -30 -8 -46 0Z" fill="${fill}"/>${[-30, -15, 0, 15, 30].map((dx) => `<path d="M0 6L${dx} -30" stroke="${G(0.5)}" stroke-width="3"/>`).join('')}</g>`; }).join('');
  const logo = (fill) => `<g transform="translate(500 452) scale(1.6) translate(-96 -100)">` + HIREIN5.map((d) => `<path d="${d}" fill="${fill}"/>`).join('') + `</g>`;
  const clipE = `<clipPath id="ce"><ellipse cx="500" cy="500" rx="${RX - 58}" ry="${RY - 58}"/></clipPath>`;
  const h = `<defs>${blur('b', 2)}${blur('s', 7)}${clipE}</defs><g filter="url(#b)">` +
    `<g filter="url(#s)">${scal(30, 30, 12, G(0.52))}${ell(0, G(0.5))}</g>` + ell(18, G(0.66)) + ell(40, G(0.5)) + ell(56, G(0.3)) +
    `<g clip-path="url(#ce)">${rays(G(0.24))}</g>` + shells(G(0.68)) +
    `<g filter="url(#s)">${logo(G(0.55))}</g>` + logo(G(0.62)) +
    `<path id="lg" d="M330 690Q500 790 670 690" fill="none"/><text fill="${G(0.46)}" text-anchor="middle" style="font:900 52px Cinzel;letter-spacing:12px"><textPath href="#lg" startOffset="50%">HIREIN·V</textPath></text>` + `</g>`;
  const c = `<g>${scal(30, 32, 12, SILVER)}${ell(-2, SILVER)}</g>`;
  const m = `<g>${scal(30, 32, 12, M(1, 0.3))}${ell(-2, M(1, 0.3))}</g>`;
  return { h, c, m };
}

// ─────────────────────────────────────────── 4. Nox: a black wax seal
function blackWax() {
  const body = blob(500, 505, 365, 9, 0.09, 11);
  const lump = blob(500, 505, 300, 7, 0.05, 23);
  const flame = (fill) => `<g transform="translate(500 492) scale(.78) translate(-153 -182)"><path d="${NOX}" fill="${fill}" fill-rule="evenodd"/></g>`;
  const stars = (fill) => [[370, 400, 9], [640, 380, 11], [628, 610, 8], [380, 620, 10], [500, 300, 7]].map(([x, y, r]) => `<path d="M${x} ${y - r * 2}L${x + r * 0.5} ${y - r * 0.5}L${x + r * 2} ${y}L${x + r * 0.5} ${y + r * 0.5}L${x} ${y + r * 2}L${x - r * 0.5} ${y + r * 0.5}L${x - r * 2} ${y}L${x - r * 0.5} ${y - r * 0.5}Z" fill="${fill}"/>`).join('');
  const dome = `<radialGradient id="wd" cx=".45" cy=".42"><stop offset="0" stop-color="${G(0.64)}"/><stop offset="1" stop-color="${G(0.34)}"/></radialGradient>`;
  const h = `<defs>${blur('b', 2.5)}${blur('w', 12)}${blur('r', 9)}${dome}</defs>` +
    `<g filter="url(#w)"><path d="${body}" fill="url(#wd)"/></g>` +
    `<g filter="url(#r)"><path d="${lump}" fill="${G(0.66)}"/>${disc(248, G(0.36))}</g>` +
    `<g filter="url(#b)">${ring(236, 6, G(0.44))}${stars(G(0.46))}${flame(G(0.56))}</g>`;
  const c = `<path d="${body}" fill="#8f8ea8"/>` + flame(`#f2f2f8`) + stars(`#f2f2f8`);
  const m = `<path d="${body}" fill="${M(1, 0.3)}"/>` + flame(M(1, 0.12)) + stars(M(1, 0.12));
  return { h, c, m };
}

// ─────────────────────────────────────────── 5. MOFAD: red wax with gold lettering and a silk ribbon
function redWax() {
  const body = blob(500, 470, 330, 10, 0.07, 5);
  const lump = blob(500, 470, 272, 8, 0.04, 9);
  const ribbon = (fill) => `<path d="M412 560L340 930L398 880L440 950L470 590Z" fill="${fill}"/><path d="M588 560L660 930L602 880L560 950L530 590Z" fill="${fill}"/>`;
  const fold = (fill) => `<path d="M372 760L436 772" stroke="${fill}" stroke-width="10"/><path d="M628 760L564 772" stroke="${fill}" stroke-width="10"/>`;
  const letters = (fill) => `<text x="500" y="530" text-anchor="middle" fill="${fill}" stroke="${fill}" stroke-width="7" stroke-linejoin="round" textLength="390" lengthAdjust="spacingAndGlyphs" style="font:900 140px Cinzel">MOFAD</text>` +
    `<path d="M340 562H660" stroke="${fill}" stroke-width="9"/>` +
    legend('ml', 214, 'MUSEUM · OF · FOOD · AND · DRINK · ✦ · ', 32, fill, 194, 5);
  const dome = `<radialGradient id="wd" cx=".45" cy=".42"><stop offset="0" stop-color="${G(0.62)}"/><stop offset="1" stop-color="${G(0.44)}"/></radialGradient>`;
  const h = `<defs>${blur('b', 2.2)}${blur('w', 12)}${blur('r', 8)}${blur('rb', 4)}${dome}</defs>` +
    `<g filter="url(#rb)">${ribbon(G(0.3))}</g>` + `<g filter="url(#rb)">${fold(G(0.34))}</g>` +
    `<g filter="url(#w)"><path d="${body}" fill="url(#wd)"/></g>` +
    `<g filter="url(#r)"><path d="${lump}" fill="${G(0.68)}"/>${disc(250, G(0.4), 500, 470)}</g>` +
    `<g filter="url(#b)">${ring(250, 7, G(0.5), 500, 470)}${ring(180, 4, G(0.48), 500, 470)}<g transform="translate(0 -30)">${letters(G(0.52))}</g></g>`;
  const c = ribbon('#f3e5c4') + `<path d="${body}" fill="#a51e2c"/>` + ring(250, 7, '#f8e7b0', 500, 470) + ring(180, 4, '#f8e7b0', 500, 470) + `<g transform="translate(0 -30)">${letters('#fbeab8')}</g>`;
  const m = ribbon(M(0, 0.42, 0)) + `<path d="${body}" fill="${M(0, 0.22, 0.6)}"/>` + ring(250, 7, M(1, 0.18), 500, 470) + ring(180, 4, M(1, 0.18), 500, 470) + `<g transform="translate(0 -30)">${letters(M(1, 0.16))}</g>`;
  return { h, c, m };
}

// ─────────────────────────────────────────── 6. Student portfolio: an octagonal lacquer locket
function locket() {
  const oct = (r, cy = 540) => 'M' + Array.from({ length: 8 }, (_, i) => P(500, cy, r, -90 + 22.5 + i * 45).map(f).join(' ')).join('L') + 'Z';
  const word = (fill) => `<g transform="translate(500 540) scale(9.2) translate(-31.5 -31.5)">` + YAJ_WORD.map((d) => `<path d="${d}" fill="${fill}"/>`).join('') + `</g>`;
  const vine = (fill) => Array.from({ length: 8 }, (_, i) => { const [x, y] = P(500, 540, 270, -90 + 22.5 + i * 45); return `<circle cx="${f(x)}" cy="${f(y)}" r="9" fill="${fill}"/>`; }).join('');
  const engr = (fill) => Array.from({ length: 64 }, (_, i) => { const [x1, y1] = P(500, 540, 322, i * 5.625), [x2, y2] = P(500, 540, 350, i * 5.625 + 3); return `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" stroke="${fill}" stroke-width="3"/>`; }).join('');
  const h = `<defs>${blur('b', 2)}${blur('s', 6)}<clipPath id="fr"><path d="${oct(372)}"/></clipPath></defs><g filter="url(#b)">` +
    `<g filter="url(#s)"><path d="${oct(376)}" fill="${G(0.5)}"/>${ring(58, 26, G(0.5), 500, 118)}</g>` +
    `<path d="${oct(366)}" fill="${G(0.64)}"/>` + `<g clip-path="url(#fr)">${engr(G(0.56))}</g>` +
    `<path d="${oct(318)}" fill="${G(0.58)}"/>` + `<path d="${oct(300)}" fill="${G(0.46)}"/>` +
    `<rect x="478" y="150" width="44" height="40" rx="10" fill="${G(0.62)}"/>` + ring(58, 18, G(0.62), 500, 118) +
    vine(G(0.56)) + word(G(0.54)) + `</g>`;
  const c = `<path d="${oct(380)}" fill="${GOLD}"/>` + ring(58, 26, GOLD, 500, 118) + `<rect x="474" y="146" width="52" height="48" fill="${GOLD}"/>` + `<path d="${oct(302)}" fill="#0f3b2e"/>` + vine(GOLD) + word('#e8bf4a');
  const m = `<path d="${oct(380)}" fill="${M(1, 0.24)}"/>` + ring(58, 26, M(1, 0.24), 500, 118) + `<rect x="474" y="146" width="52" height="48" fill="${M(1, 0.24)}"/>` + `<path d="${oct(302)}" fill="${M(0, 0.06, 1)}"/>` + vine(M(1, 0.24)) + word(M(1, 0.2));
  return { h, c, m };
}

// ─────────────────────────────────────────── 7. Quran Flashcards: a small leather-bound mushaf
function book() {
  const X0 = 230, Y0 = 150, W = 520, H = 700;
  const corner = (fill) => [[X0, Y0, 0], [X0 + W, Y0, 90], [X0 + W, Y0 + H, 180], [X0, Y0 + H, 270]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-6 -6H112C104 18 82 22 76 40C60 44 50 64 40 76C22 82 18 104 -6 112Z" fill="${fill}"/></g>`).join('');
  const star = (r, fill) => { const sq = (rot) => 'M' + [0, 1, 2, 3].map((i) => P(X0 + W / 2, Y0 + H / 2, r, rot + i * 90).map(f).join(' ')).join('L') + 'Z'; return `<path d="${sq(45)}" fill="${fill}"/><path d="${sq(0)}" fill="${fill}"/>`; };
  const openBook = (fill) => `<g transform="translate(${X0 + W / 2} ${Y0 + H / 2}) scale(5.6) translate(-16 -16.5)"><path d="M6 12C6 11 6.8 10.2 8.2 9.8C10.5 9.1 13 9 15.2 9.2L15.5 9.2L15.5 23.5C13 23.2 10.5 23.2 8.2 23.8C6.8 24.2 6 23.4 6 22.4Z" fill="${fill}"/><path d="M26 12C26 11 25.2 10.2 23.8 9.8C21.5 9.1 19 9 16.8 9.2L16.5 9.2L16.5 23.5C19 23.2 21.5 23.2 23.8 23.8C25.2 24.2 26 23.4 26 22.4Z" fill="${fill}"/></g>`;
  const tool = (fill, w = 5) => `<rect x="${X0 + 44}" y="${Y0 + 44}" width="${W - 88}" height="${H - 88}" rx="6" fill="none" stroke="${fill}" stroke-width="${w}"/><rect x="${X0 + 60}" y="${Y0 + 60}" width="${W - 120}" height="${H - 120}" rx="4" fill="none" stroke="${fill}" stroke-width="${w * 0.6}"/>`;
  const strap = (fill) => `<path d="M${X0 + W - 20} ${Y0 + H / 2 - 52}H${X0 + W + 70}Q${X0 + W + 96} ${Y0 + H / 2} ${X0 + W + 70} ${Y0 + H / 2 + 52}H${X0 + W - 20}Z" fill="${fill}"/>`;
  const clasp = (fill) => `<rect x="${X0 + W + 14}" y="${Y0 + H / 2 - 34}" width="62" height="68" rx="14" fill="${fill}"/>`;
  const cover = `<rect x="${X0}" y="${Y0}" width="${W}" height="${H}" rx="22"/>`;
  const domeG = `<linearGradient id="cv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${G(0.5)}"/><stop offset=".08" stop-color="${G(0.56)}"/><stop offset=".92" stop-color="${G(0.56)}"/><stop offset="1" stop-color="${G(0.5)}"/></linearGradient>`;
  const h = `<defs>${blur('b', 2)}${blur('s', 7)}${domeG}</defs><g filter="url(#b)">` +
    `<g filter="url(#s)"><rect x="${X0}" y="${Y0}" width="${W}" height="${H}" rx="22" fill="url(#cv)"/>${strap(G(0.5))}</g>` +
    tool(G(0.52)) + corner(G(0.64)) + `<g filter="url(#s)">${star(150, G(0.62))}</g>` + star(138, G(0.66)) + disc(96, G(0.6), X0 + W / 2, Y0 + H / 2) + openBook(G(0.74)) + clasp(G(0.62)) + `</g>`;
  const c = cover.replace('/>', ' fill="#8a3418"/>') + strap('#7a2c12') + tool(GOLD) + corner(BRASS) + star(152, BRASS) + openBook('#f1e4c8') + clasp(BRASS);
  const m = cover.replace('/>', ` fill="${M(0, 0.55)}"/>`) + strap(M(0, 0.5)) + tool(M(1, 0.34)) + corner(M(1, 0.3)) + star(152, M(1, 0.3)) + openBook(M(0, 0.5)) + clasp(M(1, 0.3));
  return { h, c, m };
}

const FONT = fs.readFileSync('/home/claude/art/node_modules/@fontsource/cinzel/files/cinzel-latin-900-normal.woff2').toString('base64');
const page = (svg, bg) => `<!doctype html><html><head><style>@font-face{font-family:Cinzel;font-weight:900;src:url(data:font/woff2;base64,${FONT})}html,body{margin:0;background:${bg}}svg{display:block}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1000 1000">${svg}</svg></body></html>`;
const ART = { portfolio: coin, 'the-values-edge': rosette, hirein5: plaque, nox: blackWax, mofad: redWax, 'student-portfolio': locket, 'quran-flashcards': book };
fs.mkdirSync('/home/claude/art/maps', { recursive: true });
for (const [slug, fn] of Object.entries(ART)) {
  const { h, c, m } = fn();
  fs.writeFileSync(`/home/claude/art/maps/${slug}-h.html`, page(h, '#000'));
  fs.writeFileSync(`/home/claude/art/maps/${slug}-c.html`, page(c, 'transparent'));
  fs.writeFileSync(`/home/claude/art/maps/${slug}-m.html`, page(m, '#000'));
}
console.log(Object.keys(ART).join(' '));
