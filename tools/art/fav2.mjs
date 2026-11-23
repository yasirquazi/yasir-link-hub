// Silver favicon options. Drawn from two references: a niello case (black inlay
// in engraved silver) and hand-struck silver coins with uneven edges.
// Monogram in Cinzel, the serif used for the project names on the map.
import fs from 'fs';
const G = (v) => { const n = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${n},${n},${n})`; };
const M = (metal, rough, coat = 0) => `rgb(${Math.round(metal * 255)},${Math.round(rough * 255)},${Math.round(coat * 255)})`;
const P = (cx, cy, r, deg) => { const a = (deg * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
const f = (n) => n.toFixed(1);
const disc = (r, fill) => `<circle cx="500" cy="500" r="${r}" fill="${fill}"/>`;
const ring = (r, w, fill, extra = '') => `<circle cx="500" cy="500" r="${r}" fill="none" stroke="${fill}" stroke-width="${w}" ${extra}/>`;
const blur = (id, s) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function blob(R, n, wob, seed, cx = 500, cy = 500) {
  const r = rng(seed); const pts = [];
  for (let i = 0; i < n; i++) pts.push(P(cx, cy, R * (1 + (r() - 0.5) * 2 * wob), (i / n) * 360));
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
const YQ = (fill, size, y, w, stroke = 8) =>
  `<text x="500" y="${y}" text-anchor="middle" fill="${fill}" stroke="${fill}" stroke-width="${stroke}" stroke-linejoin="round" textLength="${w}" lengthAdjust="spacingAndGlyphs" style="font:900 ${size}px Cinzel">YQ</text>`;
const SILVER = '#d9dbe2', NIELLO = '#121216';
const star = (x, y, r, fill) => `<path d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z" fill="${fill}"/>`;
const hatch = (fill, clip) => `<g clip-path="url(#${clip})" stroke="${fill}" stroke-width="2.2">` +
  Array.from({ length: 70 }, (_, i) => `<path d="M${i * 30 - 500} 0L${i * 30 + 500} 1000"/><path d="M${i * 30 - 500} 1000L${i * 30 + 500} 0"/>`).join('') + `</g>`;

// 1 · Hand-struck silver coin: uneven edge, worn rim, small stars, monogram
function struck() {
  const body = blob(468, 11, 0.035, 41);
  const rimIn = blob(410, 11, 0.03, 41);
  const stars = (fill) => [[500, 175, 22], [330, 230, 12], [670, 230, 12], [500, 835, 16], [300, 760, 10], [700, 760, 10]].map(([x, y, r]) => star(x, y, r, fill)).join('');
  const h = `<defs>${blur('b', 2.5)}${blur('s', 9)}</defs><g filter="url(#b)"><g filter="url(#s)"><path d="${body}" fill="${G(0.6)}"/></g><path d="${rimIn}" fill="${G(0.36)}"/>${ring(395, 5, G(0.48), 'stroke-dasharray="3 14"')}${stars(G(0.5))}<g filter="url(#s)">${YQ(G(0.56), 400, 640, 500)}</g>${YQ(G(0.68), 400, 640, 500)}</g>`;
  const c = `<path d="${body}" fill="${SILVER}"/><path d="${rimIn}" fill="#a9abb4"/>` + YQ('#eef0f5', 400, 640, 500);
  const m = `<path d="${body}" fill="${M(1, 0.3)}"/><path d="${rimIn}" fill="${M(1, 0.42)}"/>` + YQ(M(1, 0.18), 400, 640, 500);
  return { h, c, m };
}
// 2 · Niello cartouche plaque: black inlaid field, engraved silver cartouche, monogram in niello
function niello() {
  const RECT = (i, r) => `<rect x="${130 + i}" y="${40 + i}" width="${740 - i * 2}" height="${920 - i * 2}" rx="${r}"/>`;
  const cart = 'M500 150C560 230 660 250 700 330C730 400 690 450 700 500C690 550 730 600 700 670C660 750 560 770 500 850C440 770 340 750 300 670C270 600 310 550 300 500C310 450 270 400 300 330C340 250 440 230 500 150Z';
  const corner = (fill) => [[180, 90, 0], [820, 90, 90], [820, 910, 180], [180, 910, 270]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0C70 0 110 30 110 80C80 60 50 60 30 80C40 50 20 30 0 30C-10 20 -10 10 0 0Z" fill="${fill}"/><path d="M0 0C0 70 30 110 80 110C60 80 60 50 80 30C50 40 30 20 30 0Z" fill="${fill}"/></g>`).join('');
  const clip = `<clipPath id="fld">${RECT(40, 18)}</clipPath>`;
  const h = `<defs>${blur('b', 2.2)}${blur('s', 8)}${clip}</defs><g filter="url(#b)"><g filter="url(#s)"><g fill="${G(0.6)}">${RECT(0, 60)}</g></g><g fill="${G(0.66)}">${RECT(14, 50)}</g><g fill="${G(0.44)}">${RECT(40, 18)}</g>${hatch(G(0.47), 'fld')}<path d="${cart}" fill="${G(0.6)}"/><path d="${cart}" fill="none" stroke="${G(0.66)}" stroke-width="10"/>${corner(G(0.58))}${YQ(G(0.52), 250, 585, 330, 6)}</g>`;
  const c = `<g fill="${SILVER}">${RECT(-2, 60)}</g><g fill="${NIELLO}">${RECT(40, 18)}</g>${hatch('#6d6f78', 'fld')}<path d="${cart}" fill="${SILVER}"/>${corner(SILVER)}${YQ(NIELLO, 250, 585, 330, 6)}`;
  const m = `<g fill="${M(1, 0.26)}">${RECT(-2, 60)}</g><g fill="${M(0, 0.3, 0.5)}">${RECT(40, 18)}</g>${hatch(M(1, 0.3), 'fld')}<path d="${cart}" fill="${M(1, 0.24)}"/>${corner(M(1, 0.26))}${YQ(M(0, 0.3, 0.5), 250, 585, 330, 6)}`;
  return { h, c, m, clip };
}
// 3 · Niello coin: bright silver rim and monogram on a black inlaid field
function nielloCoin() {
  const body = blob(470, 12, 0.025, 77);
  const clip = `<clipPath id="fd"><circle cx="500" cy="500" r="372"/></clipPath>`;
  const h = `<defs>${blur('b', 2.4)}${blur('s', 8)}${clip}</defs><g filter="url(#b)"><g filter="url(#s)"><path d="${body}" fill="${G(0.6)}"/></g>${disc(372, G(0.42))}${hatch(G(0.45), 'fd')}${ring(410, 6, G(0.5), 'stroke-dasharray="2 16" stroke-linecap="round"')}<g filter="url(#s)">${YQ(G(0.58), 380, 632, 470)}</g>${YQ(G(0.68), 380, 632, 470)}</g>`;
  const c = `<path d="${body}" fill="${SILVER}"/>` + disc(372, NIELLO) + hatch('#5d5f68', 'fd') + YQ('#f1f2f6', 380, 632, 470);
  const m = `<path d="${body}" fill="${M(1, 0.26)}"/>` + disc(372, M(0, 0.3, 0.5)) + hatch(M(1, 0.3), 'fd') + YQ(M(1, 0.16), 380, 632, 470);
  return { h, c, m };
}
// 4 · Silver eight-pointed star with niello inlay
function nielloStar() {
  const sq = (r, rot) => 'M' + [0, 1, 2, 3].map((i) => P(500, 500, r, rot + i * 90).map(f).join(' ')).join('L') + 'Z';
  const st = (r, fill) => `<path d="${sq(r, 45)}" fill="${fill}"/><path d="${sq(r, 0)}" fill="${fill}"/>`;
  const clip = `<clipPath id="sf"><path d="${sq(440, 45)}"/><path d="${sq(440, 0)}"/></clipPath>`;
  const h = `<defs>${blur('b', 2.4)}${blur('s', 7)}${clip}</defs><g filter="url(#b)"><g filter="url(#s)">${st(494, G(0.6))}</g>${st(440, G(0.42))}${hatch(G(0.45), 'sf')}<g filter="url(#s)">${YQ(G(0.58), 330, 616, 400)}</g>${YQ(G(0.68), 330, 616, 400)}</g>`;
  const c = st(498, SILVER) + st(440, NIELLO) + hatch('#5d5f68', 'sf') + YQ('#f1f2f6', 330, 616, 400);
  const m = st(498, M(1, 0.26)) + st(440, M(0, 0.3, 0.5)) + hatch(M(1, 0.3), 'sf') + YQ(M(1, 0.16), 330, 616, 400);
  return { h, c, m };
}

const FONT = fs.readFileSync('/home/claude/art/node_modules/@fontsource/cinzel/files/cinzel-latin-900-normal.woff2').toString('base64');
const page = (svg, bg) => `<!doctype html><html><head><style>@font-face{font-family:Cinzel;font-weight:900;src:url(data:font/woff2;base64,${FONT})}html,body{margin:0;background:${bg}}svg{display:block}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1000 1000">${svg}</svg></body></html>`;
for (const [slug, fn] of Object.entries({ 'fav-s-struck': struck, 'fav-s-plaque': niello, 'fav-s-coin': nielloCoin, 'fav-s-star': nielloStar })) {
  const r = fn();
  const defsC = r.clip ? `<defs>${r.clip}</defs>` : (r.c.includes('url(#fd)') ? `<defs><clipPath id="fd"><circle cx="500" cy="500" r="372"/></clipPath></defs>` : '');
  const sfClip = (svg) => svg.includes("url(#sf)") ? `<defs>${r.h.match(/<clipPath id="sf">.*?<\/clipPath>/)[0]}</defs>` : '';
  const fdClip = (svg) => svg.includes("url(#fd)") ? `<defs><clipPath id="fd"><circle cx="500" cy="500" r="372"/></clipPath></defs>` : '';
  const fldClip = (svg) => svg.includes("url(#fld)") ? `<defs>${r.clip}</defs>` : '';
  const withDefs = (svg) => sfClip(svg) + fdClip(svg) + fldClip(svg) + svg;
  fs.writeFileSync(`/home/claude/art/maps/${slug}-h.html`, page(r.h, '#000'));
  fs.writeFileSync(`/home/claude/art/maps/${slug}-c.html`, page(withDefs(r.c), 'transparent'));
  fs.writeFileSync(`/home/claude/art/maps/${slug}-m.html`, page(withDefs(r.m), '#000'));
}
console.log('ok');
