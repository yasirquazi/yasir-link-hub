// One emblem per project, made like medieval heraldry, signs and illumination.
// Every emblem has its own silhouette. Drawn in SVG (viewBox 0 0 160 160):
// `base` is the body, `top` is the device that floats above it when it tilts.
// Gold edges use the shared #foil gradient defined in Base.astro.
//
// Classes: m  body (colour + gold edge)    m2 inner panel (deeper)
//          k  device fill (ivory)          ks device stroke
//          gd gold fill                    dot small gold dot
import { VALUES_EDGE, HIREIN5, NOX, YAJ_WORD } from './logos.js';

const pt = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)].map((v) => v.toFixed(2)).join(' ');
};
const starPoly = (n, R, r, rot = -90, cx = 80, cy = 80) =>
  'M' + Array.from({ length: n * 2 }, (_, i) => pt(cx, cy, i % 2 ? r : R, rot + (i * 180) / n)).join('L') + 'Z';
const sparkle = (x, y, s) =>
  `<path class="gd" d="M${x} ${y - s}C${x + s * 0.12} ${y - s * 0.12} ${x + s * 0.12} ${y - s * 0.12} ${x + s} ${y}C${x + s * 0.12} ${y + s * 0.12} ${x + s * 0.12} ${y + s * 0.12} ${x} ${y + s}C${x - s * 0.12} ${y + s * 0.12} ${x - s * 0.12} ${y + s * 0.12} ${x - s} ${y}C${x - s * 0.12} ${y - s * 0.12} ${x - s * 0.12} ${y - s * 0.12} ${x} ${y - s}Z"/>`;
const dots = (list) => list.map(([x, y, r]) => `<circle class="dot" cx="${x}" cy="${y}" r="${r}"/>`).join('');
// a soft light falling from the top-left across the body
const sheen = (clip) => `<path d="${clip}" fill="url(#sheen)" opacity=".55"/>`;

// ── Portfolio: a heater shield bearing a design cursor ──
const SHIELD = 'M28 20H132V70C132 110 106 136 80 148C54 136 28 110 28 70Z';
const SHIELD_IN = 'M38 30H122V70C122 104 101 126 80 136C59 126 38 104 38 70Z';

// ── The Values Edge: an eight-lobed rose window ──
const lobes = Array.from({ length: 8 }, (_, i) => pt(80, 80, 47, -90 + i * 45).split(' '));
const roseCircles = (cls, extra = '') =>
  lobes.map(([x, y]) => `<circle class="${cls}" cx="${x}" cy="${y}" r="27" ${extra}/>`).join('') +
  `<circle class="${cls}" cx="80" cy="80" r="52" ${extra}/>`;
const GLASS = ['#e8b832', '#1f9a57', '#8a3a1e', '#5e3a98', '#1f63a0', '#d8453a', '#e8783c', '#e05a6a'];

// ── Hirein5: a swallow-tailed gonfalon on a rod ──
const BANNER = 'M36 24H124V146L80 118L36 146Z';
const BANNER_IN = 'M45 32H115V129L80 107L45 129Z';

// ── Nox: a lozenge of night sky ──
const LOZ = 'M80 6 154 80 80 154 6 80Z';
const LOZ_IN = 'M80 20 140 80 80 140 20 80Z';

// ── MOFAD: a hanging tavern signboard ──
const notch = (a, b, c, d, r) =>
  `M${a + r} ${b}H${c - r}A${r} ${r} 0 0 0 ${c} ${b + r}V${d - r}A${r} ${r} 0 0 0 ${c - r} ${d}H${a + r}A${r} ${r} 0 0 0 ${a} ${d - r}V${b + r}A${r} ${r} 0 0 0 ${a + r} ${b}Z`;
const BOARD = notch(22, 44, 138, 140, 12);
const BOARD_IN = notch(31, 53, 129, 131, 8);

// ── Student portfolio: an illuminated initial with vines ──
const TILE = 'M32 32H128V128H32Z';
const TILE_IN = 'M40 40H120V120H40Z';

// ── Quran Flashcards: an open codex on an eight-pointed star ──
const STAR8 = starPoly(8, 74, 57, -90 + 22.5);
const COVER = 'M10 54C40 42 66 45 80 56C94 45 120 42 150 54V126C120 116 94 118 80 129C66 118 40 116 10 126Z';
const PAGE_L = 'M18 56C42 47 64 50 78 59V122C64 113 42 112 18 119Z';
const PAGE_R = 'M142 56C118 47 96 50 82 59V122C96 113 118 112 142 119Z';

export const motifs = {
  portfolio: {
    c: '#22493a', c2: '#17332a', ink: '#f6ecd6', size: 1.05,
    base:
      `<path class="m" d="${SHIELD}"/>` +
      `<path class="m2" d="${SHIELD_IN}"/>` +
      sheen(SHIELD_IN) +
      // a band of small gold studs across the chief
      dots([[52, 40, 1.8], [66, 40, 1.8], [80, 40, 1.8], [94, 40, 1.8], [108, 40, 1.8]]),
    // a design cursor, turned a little in perspective, with a spark at its tip
    top:
      `<g transform="translate(58 50) rotate(-14) skewY(8) scale(1.5)">` +
      `<path d="M0 0V36L9.5 27.5L16 42L22.5 39L16.2 24.8H28.5Z" fill="#1a2a22" transform="translate(2.5 3)" opacity=".45"/>` +
      `<path class="k" d="M0 0V36L9.5 27.5L16 42L22.5 39L16.2 24.8H28.5Z" stroke="#17332a" stroke-width="1.6" stroke-linejoin="round"/>` +
      `</g>` +
      sparkle(108, 56, 9) + sparkle(54, 104, 5),
  },

  'the-values-edge': {
    c: '#2a1d1b', c2: '#1d1311', ink: '#f6ecd6', size: 1.12,
    base:
      // gold edge drawn first, then the stone over it, so only the outer rim shows
      roseCircles('ring', 'fill="none" stroke="url(#foil)" stroke-width="6"') +
      roseCircles('m', 'style="stroke:none"') +
      `<circle class="m2" cx="80" cy="80" r="51"/>`,
    // the eight Values Edge petals as stained glass, with lead lines between
    top:
      `<g transform="translate(32 32) scale(.8)">` +
      VALUES_EDGE.map((d, i) => `<path d="${d}" fill="${GLASS[i]}"/>`).join('') +
      `</g>` +
      `<circle cx="80" cy="80" r="11" fill="none" stroke="url(#foil)" stroke-width="1.4"/><circle cx="80" cy="80" r="4.5" fill="url(#foil)"/>`,
  },

  hirein5: {
    c: '#264a7d', c2: '#1a355c', ink: '#f6ecd6', size: 1.02,
    base:
      // rod with finials, and gold cords
      `<path d="M30 24 18 52M130 24 142 52" stroke="url(#foil)" stroke-width="1.6" fill="none"/>` +
      `<circle class="gd" cx="18" cy="55" r="3.4"/><circle class="gd" cx="142" cy="55" r="3.4"/>` +
      `<path class="m" d="${BANNER}"/>` +
      `<path class="m2" d="${BANNER_IN}"/>` +
      sheen(BANNER_IN) +
      `<rect x="20" y="16" width="120" height="8" rx="4" fill="url(#foil)"/>` +
      `<circle class="gd" cx="18" cy="20" r="6"/><circle class="gd" cx="142" cy="20" r="6"/>`,
    // the Hirein5 mark in ivory
    top: `<g transform="translate(51 40) scale(.3)">` + HIREIN5.map((d) => `<path class="k" d="${d}"/>`).join('') + `</g>`,
  },

  nox: {
    c: '#2b2150', c2: '#1c1538', ink: '#f6ecd6', size: 1.12,
    base:
      `<path class="m" d="${LOZ}"/>` +
      `<path class="m2" d="${LOZ_IN}"/>` +
      sheen(LOZ_IN) +
      dots([[52, 70, 1.4], [110, 62, 1.8], [104, 104, 1.2], [60, 102, 1.6], [80, 34, 1.4], [80, 128, 1.2], [36, 80, 1.1], [124, 80, 1.3]]),
    // the Nox flame-crown in gold
    top: `<g transform="translate(48 42) scale(.21)"><path d="${NOX}" fill="url(#foil)" fill-rule="evenodd"/></g>`,
  },

  mofad: {
    c: '#d8414f', c2: '#b4303e', ink: '#f8ecd6', size: 1.08,
    base:
      // wrought-iron bracket and chains
      `<path d="M10 14H150" stroke="#2a1a14" stroke-width="5" stroke-linecap="round" fill="none"/>` +
      `<path d="M10 14C10 26 22 28 24 20" stroke="#2a1a14" stroke-width="3" stroke-linecap="round" fill="none"/>` +
      `<path d="M44 16V44M116 16V44" stroke="url(#foil)" stroke-width="2.4" stroke-dasharray="4 2.5" fill="none"/>` +
      `<path class="m" d="${BOARD}"/>` +
      `<path class="m2" d="${BOARD_IN}"/>` +
      sheen(BOARD_IN),
    // the museum's name, lettered on the board
    top:
      `<text x="80" y="94" text-anchor="middle" textLength="80" lengthAdjust="spacingAndGlyphs" fill="#f8ecd6" style="font:700 25px 'Cinzel', Georgia, serif;letter-spacing:.5px">MOFAD</text>` +
      `<path d="M48 104H112" stroke="url(#foil)" stroke-width="1.4"/>` +
      `<text x="80" y="117" text-anchor="middle" textLength="72" lengthAdjust="spacingAndGlyphs" fill="#f8ecd6" opacity=".9" style="font:700 6.4px 'Cinzel', Georgia, serif;letter-spacing:.4px">MUSEUM OF FOOD &amp; DRINK</text>` +
      `<path class="gd" d="M80 62l4 4-4 4-4-4Z"/>`,
  },

  'student-portfolio': {
    c: '#c99a34', c2: '#13322c', ink: '#f6ecd6', size: 1.05,
    base:
      // vine scrolls growing out of the tile's corners
      `<path d="M32 32C18 26 12 14 22 8C32 4 38 14 30 18M128 128C142 134 148 146 138 152C128 156 122 146 130 142M128 32C138 20 150 18 152 28C154 36 144 38 142 32M32 128C22 140 10 142 8 132C6 124 16 122 18 128" stroke="url(#foil)" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
      `<path d="M20 12c6-2 9 2 8 7-5 1-9-2-8-7ZM140 148c-6 2-9-2-8-7 5-1 9 2 8 7ZM148 24c1 6-3 8-8 7 0-5 3-8 8-7ZM12 136c-1-6 3-8 8-7 0 5-3 8-8 7Z" fill="#3f6a3a"/>` +
      `<path class="m" d="${TILE}"/>` +
      `<path class="m2" d="${TILE_IN}"/>` +
      sheen(TILE_IN),
    // the Yaj wordmark in gold leaf on the green panel
    top:
      `<g transform="translate(39.7 31.2) scale(1.55)">` + YAJ_WORD.map((d) => `<path d="${d}" fill="url(#foil)"/>`).join('') + `</g>`,
  },

  'quran-flashcards': {
    c: '#b44a28', c2: '#8a3519', ink: '#f6ecd6', size: 1.1,
    base:
      `<path class="m2" d="${STAR8}"/>` +
      sheen(STAR8) +
      `<path class="m" d="${COVER}"/>` +
      `<path d="${PAGE_L}" fill="#f4ead6" stroke="url(#foil)" stroke-width="1"/>` +
      `<path d="${PAGE_R}" fill="#e9dcc4" stroke="url(#foil)" stroke-width="1"/>` +
      `<path d="M80 58V124" stroke="#2c1810" stroke-opacity=".25" stroke-width="2"/>` +
      // a ribbon marker hanging from the spine
      `<path d="M83 124V150L88 144L93 150V124Z" fill="#7a1c1c"/>`,
    // lines of script on the open pages, with gold verse markers
    top:
      `<g fill="none" stroke="#3a2416" stroke-width="2" stroke-linecap="round">` +
      `<path d="M28 70C36 66 42 72 50 68S62 64 70 67M28 82C38 78 46 84 56 80S64 77 70 79M28 94C36 90 44 96 52 92S64 89 70 91M30 106C40 102 48 107 58 104"/>` +
      `<path d="M90 67C98 64 106 70 114 66S126 64 132 68M90 79C98 76 108 82 118 78S128 77 132 80M90 91C100 88 106 94 116 90S126 89 132 92M102 104C112 101 120 106 130 103"/>` +
      `</g>` +
      `<circle class="gd" cx="72" cy="94" r="2.4"/><circle class="gd" cx="88" cy="79" r="2.4"/>` +
      sparkle(80, 34, 7),
  },
};

export const motifFor = (slug) => motifs[slug] || motifs.portfolio;
