// Silver favicons, second pass: polish and wear like a real struck/repoussé piece.
//  fav-s-struck2 : hand-struck coin — rolled polished rim, satin field, scratches, domed monogram
//  fav-s-baroque : repoussé tray — shells, C/S-scrolls and beading around an oval field
import fs from 'fs';
const G = (v) => { const n = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${n},${n},${n})`; };
const M = (metal, rough, coat = 0) => `rgb(${Math.round(metal * 255)},${Math.round(rough * 255)},${Math.round(coat * 255)})`;
const P = (cx, cy, r, deg) => { const a = (deg * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
const f = (n) => n.toFixed(1);
const blur = (id, s) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function blob(R, n, wob, seed, sq = 1) {
  const r = rng(seed); const pts = [];
  for (let i = 0; i < n; i++) { const [x, y] = P(500, 500, R * (1 + (r() - 0.5) * 2 * wob), (i / n) * 360); pts.push([x, 500 + (y - 500) * sq]); }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
// a rounded (domed) relief: the same shape stacked from wide-and-low to sharp-and-high
const dome = (shape, v, id = 'd') => `<g filter="url(#${id}1)">${shape(G(v - 0.1))}</g><g filter="url(#${id}2)">${shape(G(v - 0.04))}</g><g filter="url(#${id}3)">${shape(G(v))}</g>`;
const domeDefs = (id = 'd', a = 12, b = 5, c = 1.6) => blur(id + '1', a) + blur(id + '2', b) + blur(id + '3', c);
const YQ = (fill, size, y, w, stroke = 6) =>
  `<text x="500" y="${y}" text-anchor="middle" fill="${fill}" stroke="${fill}" stroke-width="${stroke}" stroke-linejoin="round" textLength="${w}" lengthAdjust="spacingAndGlyphs" style="font:900 ${size}px Cinzel">YQ</text>`;
// wear: random scratches and nicks over an area (clipped by the caller)
function scratches(seed, n, fill, wMin = 1.6, wMax = 3.2) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = 120 + r() * 760, y = 120 + r() * 760, L = 30 + r() * 240 * (r() < 0.25 ? 1 : 0.4), a = r() * 180, bend = (r() - 0.5) * 30;
    const [x2, y2] = P(x, y, L, a), [mx, my] = P((x + x2) / 2, (y + y2) / 2, bend, a + 90);
    s += `<path d="M${f(x)} ${f(y)}Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}" stroke="${fill}" stroke-width="${(wMin + r() * (wMax - wMin)).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < n / 3; i++) { const x = 140 + r() * 720, y = 140 + r() * 720; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(3 + r() * 6)}" ry="${f(2 + r() * 3)}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})" fill="${fill}"/>`; }
  return s;
}
const SILVER = '#dcdee4';

// ───────────────────────── 1 · hand-struck coin, polished and worn
function struck2() {
  const body = blob(470, 11, 0.035, 41);
  const field = blob(388, 11, 0.03, 41);
  const stars = (fill) => [[500, 168, 24], [322, 232, 13], [678, 232, 13], [500, 842, 17], [296, 764, 11], [704, 764, 11]].map(([x, y, r]) =>
    `<path d="M${x} ${y - r}L${x + r * 0.26} ${y - r * 0.26}L${x + r} ${y}L${x + r * 0.26} ${y + r * 0.26}L${x} ${y + r}L${x - r * 0.26} ${y + r * 0.26}L${x - r} ${y}L${x - r * 0.26} ${y - r * 0.26}Z" fill="${fill}"/>`).join('');
  const beads = (fill) => Array.from({ length: 64 }, (_, i) => { const [x, y] = P(500, 500, 402 + Math.sin(i * 1.7) * 3, i * 5.625); return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(4.2 + (i % 3) * 0.6)}" fill="${fill}"/>`; }).join('');
  const clip = `<clipPath id="fl"><path d="${field}"/></clipPath>`;
  const defs = `<defs>${blur('rim', 9)}${blur('fs', 7)}${blur('b', 1.1)}${domeDefs('d', 5, 2.6, 1.1)}${clip}</defs>`;
  const h = defs +
    `<g filter="url(#rim)"><path d="${body}" fill="${G(0.62)}"/></g>` +              // rolled rim
    `<g filter="url(#fs)"><path d="${field}" fill="${G(0.4)}"/></g>` +                // field sinks inside it
    `<g filter="url(#b)">${beads(G(0.47))}</g>` +
    dome((c) => stars(c), 0.47) +
    dome((c) => YQ(c, 400, 640, 500), 0.66) +
    `<g clip-path="url(#fl)" filter="url(#b)">${scratches(7, 22, G(0.385), 1.2, 2)}</g>`;   // a few shallow nicks
  const c = `<path d="${body}" fill="${SILVER}"/><path d="${field}" fill="#c4c6cd"/>` + YQ('#eceef3', 400, 640, 500) + stars('#e4e6ec');
  const m = `<path d="${body}" fill="${M(1, 0.12)}"/><path d="${field}" fill="${M(1, 0.42)}"/>` +
    `<g clip-path="url(#fl)">${scratches(91, 220, M(1, 0.2), 0.7, 1.3)}${scratches(7, 22, M(1, 0.18), 1.2, 2)}</g>` + YQ(M(1, 0.14), 400, 640, 500) + stars(M(1, 0.16));
  return { h, c, m, clip };
}

// ───────────────────────── 2 · baroque repoussé tray
function baroque(o = {}) {
  const RX = o.rx || 380, RY = o.ry || 440, N = o.n || 20;   // lobes; four of them are big cartouches
  const big = (i) => i % (N / 4) === 0;       // the lobes at top/right/bottom/left
  const sx = RX / 380, sy = RY / 440;
  const content = o.content || ((c, small) => YQ(c, 270, 595, 340, 5));
  const FIELD = o.field || '#c4c6cd';
  const angOf = (i) => -90 + (i * 360) / N;
  const rOf = (deg, k = 1) => { const a = (deg * Math.PI) / 180; return [500 + RX * k * Math.cos(a), 500 + RY * k * Math.sin(a)]; };
  // outer edge: an oval pushed out into lobes, more at the cartouches
  function lobed(k, amp) {
    const pts = [];
    for (let t = 0; t < 720; t++) {
      const deg = -90 + t / 2, u = ((deg + 90) / 360) * N, li = ((Math.round(u) % N) + N) % N;
      const bump = Math.pow(Math.cos((u - Math.round(u)) * Math.PI), 0.8);
      pts.push(rOf(deg, k * (1 + (big(li) ? amp * 1.9 : amp) * bump)));
    }
    return 'M' + pts.map((p) => p.map(f).join(' ')).join('L') + 'Z';
  }
  // a C-scroll curl inside lobe i: an arc that winds inward toward the lobe centre
  function curl(i, dir) {
    const c = angOf(i), pts = [];
    for (let t = 0; t <= 1; t += 0.04) {
      const deg = c + dir * (1 - t) * (360 / N) * 0.42, k = 1.0 + 0.055 * Math.sin(t * Math.PI) - 0.07 * t;
      const sp = t > 0.6 ? (t - 0.6) / 0.4 : 0;            // tight spiral at the end
      const [x, y] = rOf(deg, k);
      const [cx, cy] = rOf(c + dir * (360 / N) * 0.06, 0.985);
      pts.push(sp ? [x + (cx - x) * sp * 0.75 + Math.cos(t * 14) * 6 * sp, y + (cy - y) * sp * 0.75 + Math.sin(t * 14) * 6 * sp] : [x, y]);
    }
    return 'M' + pts.map((p) => p.map(f).join(' ')).join('L');
  }
  const curls = (fill, w) => Array.from({ length: N }, (_, i) => big(i) ? '' : `<path d="${curl(i, 1)}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/><path d="${curl(i, -1)}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`).join('');
  // shell cartouche on the big lobes: a fan of ribs radiating outward
  const shell = (i, fill, w) => { const c = angOf(i); const [bx, by] = rOf(c, 0.93); return Array.from({ length: 9 }, (_, k) => { const [x, y] = rOf(c + (k - 4) * 3.0, 1.13); return `<path d="M${f(bx)} ${f(by)}L${f(x)} ${f(y)}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`; }).join('') + (() => { const [x, y] = rOf(c, 0.93); return `<circle cx="${f(x)}" cy="${f(y)}" r="16" fill="${fill}"/>`; })(); };
  const shells = (fill, w) => [0, N / 4, N / 2, (3 * N) / 4].map((i) => shell(i, fill, w)).join('');
  const valleys = (fill) => Array.from({ length: N }, (_, i) => { const [x, y] = rOf(angOf(i) + 180 / N, 0.985); return `<circle cx="${f(x)}" cy="${f(y)}" r="9" fill="${fill}"/>`; }).join('');
  const beads = (rx, ry, n, r, fill) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return `<circle cx="${f(500 + rx * Math.cos(a))}" cy="${f(500 + ry * Math.sin(a))}" r="${r}" fill="${fill}"/>`; }).join('');
  const E = (rx, ry, fill, extra = '') => `<ellipse cx="500" cy="500" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
  const OUT = lobed(1.0, 0.07);
  const clip = `<clipPath id="fl"><ellipse cx="500" cy="500" rx="${262 * sx}" ry="${318 * sy}"/></clipPath>`;
  const defs = `<defs>${blur('rim', 10)}${blur('m2', 5)}${blur('fs', 6)}${blur('b', 1.2)}${domeDefs('d', 6, 3, 1.2)}${clip}</defs>`;
  const h = defs +
    `<g filter="url(#rim)"><path d="${OUT}" fill="${G(0.5)}"/></g>` +
    `<g filter="url(#rim)"><path d="${lobed(0.95, 0.065)}" fill="${G(0.62)}"/></g>` +   // rolled, lobed rim
    `<g filter="url(#m2)">${E(318 * sx, 372 * sy, G(0.5))}</g>` +                                 // inner shoulder
    `<g filter="url(#b)">${curls(G(0.48), 7)}${shells(G(0.5), 6)}${valleys(G(0.68))}</g>` + // curls and ribs engraved into the rim
    `<g filter="url(#b)">${beads(296 * sx, 350 * sy, Math.round(70 * (sx + sy) / 2), 5, G(0.56))}</g>` +
    dome((c) => E(278 * sx, 334 * sy, 'none', `stroke="${c}" stroke-width="12"`), 0.6) +           // inner raised ring
    `<g filter="url(#fs)">${E(262 * sx, 318 * sy, G(0.36))}</g>` +
    dome((c) => content(c), 0.6) +
    `<g clip-path="url(#fl)" filter="url(#b)">${scratches(3, 16, G(0.35), 1.2, 2)}</g>`;
  const c = `<path d="${OUT}" fill="${SILVER}"/>` + E(262 * sx, 318 * sy, FIELD) + content('#eceef3');
  const m = `<path d="${OUT}" fill="${M(1, 0.18)}"/>` + E(262 * sx, 318 * sy, M(1, o.fieldRough || 0.38)) + `<g clip-path="url(#fl)">${scratches(55, 180, M(1, 0.2), 0.7, 1.3)}</g>` + content(M(1, 0.14));
  return { h, c, m, clip };
}


// ───────────────────────── marketing pieces in the same silver
const arcText = (id, r, text, size, fill, start, sweep = 1, ls = 6) => {
  const [x1, y1] = P(500, 500, r, start), [x2, y2] = P(500, 500, r, start + 179.9 * (sweep ? 1 : -1));
  return `<path id="${id}" d="M${f(x1)} ${f(y1)}A${r} ${r} 0 0 ${sweep} ${f(x2)} ${f(y2)}" fill="none"/><text fill="${fill}" text-anchor="middle" style="font:900 ${size}px Cinzel;letter-spacing:${ls}px"><textPath href="#${id}" startOffset="50%">${text}</textPath></text>`;
};
// a struck coin carrying any device and legends
function struckWith(seed, device, legends) {
  const body = blob(470, 11, 0.035, seed), field = blob(388, 11, 0.03, seed);
  const beads = (fill) => Array.from({ length: 64 }, (_, i) => { const [x, y] = P(500, 500, 402 + Math.sin(i * 1.7) * 3, i * 5.625); return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(4.2 + (i % 3) * 0.6)}" fill="${fill}"/>`; }).join('');
  const clip = `<clipPath id="fl"><path d="${field}"/></clipPath>`;
  const defs = `<defs>${blur('rim', 9)}${blur('fs', 7)}${blur('b', 1.1)}${domeDefs('d', 6, 3, 1.1)}${clip}</defs>`;
  const h = defs + `<g filter="url(#rim)"><path d="${body}" fill="${G(0.62)}"/></g><g filter="url(#fs)"><path d="${field}" fill="${G(0.4)}"/></g>` +
    `<g clip-path="url(#fl)" filter="url(#b)">${scratches(seed, 22, G(0.385), 1.2, 2)}</g>` +
    `<g filter="url(#b)">${beads(G(0.47))}${legends(G(0.5), 'h')}</g>` + dome((c) => device(c), 0.66);
  const c = `<path d="${body}" fill="${SILVER}"/><path d="${field}" fill="#c4c6cd"/>` + device('#eceef3') + legends('#e8eaef', 'c');
  const m = `<path d="${body}" fill="${M(1, 0.12)}"/><path d="${field}" fill="${M(1, 0.42)}"/><g clip-path="url(#fl)">${scratches(seed + 50, 220, M(1, 0.2), 0.7, 1.3)}</g>` + device(M(1, 0.14)) + legends(M(1, 0.16), 'm');
  return { h, c, m, clip };
}
const sun = (fill) => {
  let s = `<circle cx="500" cy="530" r="118" fill="${fill}"/>`;
  for (let i = 0; i < 24; i++) {
    const a = i * 15, wavy = i % 2;
    if (!wavy) { const [x1, y1] = P(500, 530, 140, a - 4), [x2, y2] = P(500, 530, 250, a), [x3, y3] = P(500, 530, 140, a + 4); s += `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}L${f(x3)} ${f(y3)}Z" fill="${fill}"/>`; }
    else { const pts = []; for (let t = 0; t <= 1; t += 0.1) { const [x, y] = P(500, 530, 140 + t * 90, a + Math.sin(t * Math.PI * 2) * 4); pts.push(`${f(x)} ${f(y)}`); } s += `<path d="M${pts.join('L')}" stroke="${fill}" stroke-width="${9}" fill="none" stroke-linecap="round"/>`; }
  }
  return s;
};
const sunFace = (fill) => `<path d="M455 505Q470 495 485 505M515 505Q530 495 545 505M470 572Q500 590 530 572" stroke="${fill}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
function sunCoin() {
  return struckWith(67, (c) => sun(c), (c, k) => arcText('sl' + k, 330, 'YASIR · QUAZI', 46, c, 180, 1, 10));
}
const moon = (fill) => `<mask id="cres" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="#000"/><circle cx="470" cy="520" r="220" fill="#fff"/><circle cx="575" cy="455" r="195" fill="#000"/></mask><rect width="1000" height="1000" fill="${fill}" mask="url(#cres)"/>` +
  [[655, 600, 14], [700, 470, 10], [620, 720, 9], [430, 250, 9], [700, 330, 12]].map(([x, y, r]) => `<path d="M${x} ${y - r * 2}L${x + r * 0.5} ${y - r * 0.5}L${x + r * 2} ${y}L${x + r * 0.5} ${y + r * 0.5}L${x} ${y + r * 2}L${x - r * 0.5} ${y + r * 0.5}L${x - r * 2} ${y}L${x - r * 0.5} ${y - r * 0.5}Z" fill="${fill}"/>`).join('');
function moonCoin() { return struckWith(83, (c) => moon(c), (c, k) => arcText('ml' + k, 330, 'PRODUCT · DESIGNER', 40, c, 180, 1, 8)); }
// silver poured like a wax seal, with an oval impression
function silverSeal() {
  const body = blob(440, 7, 0.09, 12, 1.0), lump = blob(380, 7, 0.05, 12);
  const clip = `<clipPath id="fl"><ellipse cx="500" cy="500" rx="300" ry="340"/></clipPath>`;
  const defs = `<defs>${blur('w', 14)}${blur('r', 10)}${blur('fs', 6)}${blur('b', 1.1)}${domeDefs('d', 6, 3, 1.1)}${clip}</defs>`;
  const h = defs + `<g filter="url(#w)"><path d="${body}" fill="${G(0.5)}"/></g><g filter="url(#r)"><path d="${lump}" fill="${G(0.7)}"/></g>` +
    `<g filter="url(#fs)"><ellipse cx="500" cy="500" rx="300" ry="340" fill="${G(0.4)}"/></g>` + dome((c) => YQ(c, 300, 605, 380, 5), 0.64) +
    `<g clip-path="url(#fl)" filter="url(#b)">${scratches(29, 16, G(0.385), 1.2, 2)}</g>`;
  const c = `<path d="${body}" fill="${SILVER}"/><ellipse cx="500" cy="500" rx="300" ry="340" fill="#c4c6cd"/>` + YQ('#eceef3', 300, 605, 380, 5);
  const m = `<path d="${body}" fill="${M(1, 0.1)}"/><ellipse cx="500" cy="500" rx="300" ry="340" fill="${M(1, 0.36)}"/><g clip-path="url(#fl)">${scratches(31, 200, M(1, 0.2), 0.7, 1.3)}</g>` + YQ(M(1, 0.14), 300, 605, 380, 5);
  return { h, c, m, clip };
}
const nameBlock = (fill) => `<text x="500" y="520" text-anchor="middle" fill="${fill}" stroke="${fill}" stroke-width="3" textLength="520" lengthAdjust="spacingAndGlyphs" style="font:900 96px Cinzel">YASIR QUAZI</text>` +
  `<path d="M360 556H640" stroke="${fill}" stroke-width="4"/><text x="500" y="612" text-anchor="middle" fill="${fill}" stroke="${fill}" stroke-width="1.5" textLength="470" lengthAdjust="spacingAndGlyphs" style="font:900 40px Cinzel;letter-spacing:4px">PRODUCT DESIGNER · BANGALORE</text>`;
const ASSETS = {
  'fav-s-struck2': struck2, 'fav-s-baroque': () => baroque(),
  'fav-s-baroque-dark': () => baroque({ field: '#4a4c54', fieldRough: 0.5 }),
  'mk-name-plaque': () => baroque({ rx: 470, ry: 250, n: 24, content: nameBlock }),
  'mk-sun-coin': sunCoin, 'mk-moon-coin': moonCoin, 'mk-silver-seal': silverSeal,
};

const FONT = fs.readFileSync('/home/claude/art/node_modules/@fontsource/cinzel/files/cinzel-latin-900-normal.woff2').toString('base64');
const page = (svg, bg) => `<!doctype html><html><head><style>@font-face{font-family:Cinzel;font-weight:900;src:url(data:font/woff2;base64,${FONT})}html,body{margin:0;background:${bg}}svg{display:block}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1000 1000">${svg}</svg></body></html>`;
for (const [slug, fn] of Object.entries(ASSETS)) {
  const r = fn(); const d = `<defs>${r.clip}</defs>`;
  fs.writeFileSync(`/home/claude/art/maps/${slug}-h.html`, page(r.h, '#000'));
  fs.writeFileSync(`/home/claude/art/maps/${slug}-c.html`, page(d + r.c, 'transparent'));
  fs.writeFileSync(`/home/claude/art/maps/${slug}-m.html`, page(d + r.m, '#000'));
}
console.log('ok');
