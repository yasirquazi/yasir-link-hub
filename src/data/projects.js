// ─────────────────────────────────────────────────────────────
//  All site content lives here. To add a project, copy one
//  object, give it a unique `slug`, and rebuild.
//
//  group:    'design' | 'client' | 'personal'
//  pattern:  'star' | 'rosette' | 'girih' | 'quatrefoil' | 'lattice' | 'zellige'
//  tagline:  one line shown on the home tile
//  kind:     what it is, shown on canvas cards (e.g. 'App + website')
//  cover:    optional screenshot for canvas cards, e.g. '/covers/nox.avif' (3:2, ~688×464)
//  art:      optional PNG/SVG motif for the canvas, e.g. '/motifs/nox.svg' (square, transparent)
//  glyph:    icon drawn on the tile (see src/lib/glyphs.js)
//  shots:    { kind: 'web' | 'app', count }  → screenshot placeholders
//  description: the paragraph on the project page
//  caseStudy: link to the full case study (leave '' until it exists)
//  links:    first link is the main call to action. Leave `links`
//            empty for projects that aren't live yet.
// ─────────────────────────────────────────────────────────────

export const groups = {
  design: { label: 'Product design', short: 'Portfolio' },
  client: { label: 'Client work', short: 'Client' },
  personal: { label: 'Personal projects', short: 'Personal' },
};

export const projects = [
  {
    slug: 'portfolio',
    description:
      'Selected case studies across products and brands, showing how I take work from problem to shipped interface. They cover apps, websites and brand systems, from research and flows through to interface design and visual identity. I designed the portfolio and built it in Framer. My current work at PhonePe is not included.',
    caseStudy: '', // link to the full case study, e.g. on your portfolio
    kind: 'Portfolio site',
    glyph: 'nib',
    group: 'design',
    title: 'Product Design Portfolio',
    tagline: 'Case studies across products and brands.',
    year: 'Ongoing',
    place: 'Bangalore',
    pattern: 'star',
    summary:
      'Selected case studies across products and brands, showing how I take work from problem to shipped interface.',
    role: 'Product Designer',
    contributions: [
      'Case studies covering apps, websites and brand systems',
      'Research, flows, interface design and visual identity',
      'Designed and built the portfolio site in Framer',
    ],
    note: 'My current work at PhonePe is not included.',
    links: [{ label: 'View portfolio', url: 'https://yasirquazi.framer.website/' }],
    shots: { kind: 'web', count: 3 },
  },
  {
    slug: 'the-values-edge',
    description:
      'A website and an interactive online exercise for The Values Edge. I designed the website, from page structure to visual design, and the online exercise end to end: the question flow, the interactions and the results. The live site has since been modified by others, so it may differ from my original design.',
    caseStudy: '', // link to the full case study, e.g. on your portfolio
    kind: 'Website + exercise',
    glyph: 'scales',
    group: 'client',
    title: 'The Values Edge',
    tagline: 'Website and an online values exercise.',
    year: '2025',
    place: 'San Francisco',
    pattern: 'rosette',
    summary: 'A website and an interactive online exercise for The Values Edge.',
    role: 'Web & Product Designer',
    contributions: [
      'Designed the website, from page structure to visual design',
      'Designed the online exercise end to end: the question flow, interactions and results',
    ],
    note: 'The live site has since been modified by others, so it may differ from my original design.',
    links: [{ label: 'Visit live site', url: 'https://thevaluesedge.com/' }],
    shots: { kind: 'web', count: 3 },
  },
  {
    slug: 'hirein5',
    description:
      'A marketing website and the software product behind it, for a hiring platform. I designed the marketing website and the product itself: its core flows, screens and interface components.',
    caseStudy: '', // link to the full case study, e.g. on your portfolio
    kind: 'Website + software',
    glyph: 'people',
    group: 'client',
    title: 'Hirein5',
    tagline: 'Marketing site and hiring software.',
    year: '2024',
    place: 'Singapore',
    pattern: 'girih',
    summary: 'A marketing website and the software product behind it, for a hiring platform.',
    role: 'Product Designer',
    contributions: [
      'Designed the marketing website',
      'Designed the software product: core flows, screens and interface components',
    ],
    links: [{ label: 'Visit live site', url: 'https://hirein5.com/' }],
    shots: { kind: 'web', count: 3 },
  },
  {
    slug: 'nox',
    description:
      'App and website design for Nox, taken through to the launch of their MVP. I designed the MVP app, designed the website and built it in Framer, and launched both. Nox later brought design in-house, so their current site is by their internal designer; the link here goes to my version.',
    caseStudy: '', // link to the full case study, e.g. on your portfolio
    kind: 'App + website',
    glyph: 'moon',
    group: 'client',
    title: 'Nox',
    tagline: 'MVP app and a Framer website.',
    year: 'MVP',
    place: 'Startup',
    pattern: 'quatrefoil',
    summary:
      'App and website design for Nox, taken through to the launch of their MVP before the company brought design in-house.',
    role: 'App & Web Designer, Framer build',
    contributions: [
      'Designed the MVP app',
      'Designed the website and built it in Framer',
      'Launched both the MVP app and website',
    ],
    note: 'Nox later brought design in-house. Their current site is by their internal designer; my version is linked separately.',
    links: [
      { label: 'See my website design', url: 'https://noxtoday.framer.website/' },
      { label: 'Current site (in-house)', url: 'https://www.nox.today/' },
    ],
    shots: { kind: 'app', count: 3 },
  },
  {
    slug: 'mofad',
    description:
      "The website for MOFAD, the Museum of Food and Drink in Brooklyn. I designed the museum’s website, built it in Framer and set up a full CMS so the team can update content without touching code.",
    caseStudy: '', // link to the full case study, e.g. on your portfolio
    kind: 'Website + CMS',
    glyph: 'bowl',
    group: 'client',
    title: 'MOFAD NYC',
    tagline: 'Museum website with a full CMS.',
    year: 'Museum',
    place: 'Brooklyn, New York',
    pattern: 'lattice',
    summary: 'The website for MOFAD, the Museum of Food and Drink in Brooklyn.',
    role: 'Web Designer & Framer Developer',
    contributions: [
      'Designed the museum’s website',
      'Built it in Framer',
      'Set up a full CMS so content can be updated without code',
    ],
    links: [{ label: 'Visit live site', url: 'https://www.mofad.org/' }],
    shots: { kind: 'web', count: 3 },
  },
  {
    slug: 'student-portfolio',
    description:
      'A personal portfolio website for a student, the son of a senior tech executive. I designed the site and built it in Framer.',
    caseStudy: '', // link to the full case study, e.g. on your portfolio
    kind: 'Website',
    glyph: 'cap',
    group: 'client',
    title: 'Student Portfolio',
    tagline: 'Portfolio site built in Framer.',
    year: 'Personal site',
    place: 'Private client',
    pattern: 'zellige',
    summary: 'A personal portfolio website for a student, the son of a senior tech executive.',
    role: 'Designer & Framer Developer',
    contributions: ['Designed the portfolio site', 'Built it in Framer'],
    links: [{ label: 'Visit live site', url: 'https://simplyyaj.framer.website/' }],
    shots: { kind: 'web', count: 2 },
  },
  {
    slug: 'quran-flashcards',
    description:
      'Flashcards for studying the Quran. I designed and built the app; more details are coming soon.',
    caseStudy: '', // link to the full case study, e.g. on your portfolio
    kind: 'Mobile app',
    glyph: 'cards',
    group: 'personal',
    title: 'Quran Flashcards',
    tagline: 'Flashcards for studying the Quran.',
    year: 'Side project',
    place: '',
    pattern: 'star',
    summary: 'Flashcards for studying the Quran.',
    role: 'Designer & Builder',
    contributions: ['Designed and built the app', 'More details coming soon'],
    links: [],
    shots: { kind: 'app', count: 3 },
  },
];
