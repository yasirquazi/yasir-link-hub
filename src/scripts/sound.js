// One sound engine for the whole site. It is loaded once and survives page
// changes (the site swaps pages in place), so the music keeps playing between
// the map and the project pages. Pages talk to it through window.YQSound.

const FILES = ['hover', 'open', 'rustle', 'shutter', 'blow', 'light', 'zoom', 'press', 'music'];
const GAIN = { hover: 0.18, open: 0.45, rustle: 0.14, shutter: 0.65, blow: 0.55, light: 0.5, zoom: 0.24, press: 0.36 };
const MUS_VOL = 0.24;
const X = 5; // seconds of crossfade between passes of the music

const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} };
// the sound folder, resolved once against the page we first landed on
let DIR = null;
function dir() {
  if (!DIR) { const m = document.querySelector('meta[name="yq-root"]'); DIR = new URL((m ? m.content : './') + 'table/sfx/', location.href).href; }
  return DIR;
}

let A = null, master = null, bed = null, on = store('sfx') === '1';
const bufs = {}, loading = {}, bytes = {};

function ac() {
  if (!A) {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    // iOS 17+: treat this as media playback so the ringer/silent switch doesn't mute it
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    A = new C(); master = A.createGain(); master.connect(A.destination);
    A.addEventListener('statechange', () => { if (on && A.state === 'running') startBed(); });
  }
  if (A.state === 'suspended' && !document.hidden) A.resume().catch(() => {});
  return A;
}
const fetchBytes = (n) => bytes[n] || (bytes[n] = fetch(dir() + n + '.mp3').then((r) => r.arrayBuffer()).catch((e) => { delete bytes[n]; throw e; }));
function load(n) {
  if (bufs[n]) return Promise.resolve(bufs[n]);
  if (loading[n]) return loading[n];
  const a = ac(); if (!a) return Promise.resolve(null);
  loading[n] = fetchBytes(n)
    .then((d) => new Promise((ok, no) => a.decodeAudioData(d, ok, no)))
    .then((b) => (bufs[n] = b))
    .catch(() => { delete loading[n]; return null; });
  return loading[n];
}
function play(n, rate) {
  if (!on) return;
  const a = ac(), b = bufs[n]; if (!a) return;
  if (!b) { load(n); return; } // first use warms it up; it plays from then on
  const s = a.createBufferSource(), g = a.createGain();
  s.buffer = b; s.playbackRate.value = rate || 1; g.gain.value = GAIN[n] || 0.5;
  s.connect(g); g.connect(master); s.start();
}
// Soft background music that crossfades over itself, so there is never a gap
function startBed() {
  const a = ac(); if (!a || bed || !on || a.state !== 'running') return;
  bed = { g: a.createGain(), on: true, timer: 0 };
  bed.g.gain.setValueAtTime(1, a.currentTime); bed.g.connect(master);
  const me = bed;
  load('music').then((b) => {
    if (!b || bed !== me || !me.on) return;
    (function pass(t, first) {
      if (bed !== me || !me.on) return;
      const s = a.createBufferSource(), g = a.createGain(); s.buffer = b; s.connect(g); g.connect(me.g);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(MUS_VOL, t + (first ? 1 : X));
      g.gain.setValueAtTime(MUS_VOL, t + b.duration - X); g.gain.exponentialRampToValueAtTime(0.0001, t + b.duration);
      s.start(t); me.mus = s;
      me.timer = setTimeout(() => pass(t + b.duration - X), (t + b.duration - X - a.currentTime - 1) * 1000);
    })(a.currentTime + 0.05, true);
  });
}
function stopBed() {
  if (!bed || !A) return; const b = bed; bed = null; b.on = false; clearTimeout(b.timer);
  b.g.gain.cancelScheduledValues(A.currentTime); b.g.gain.setValueAtTime(b.g.gain.value || 1, A.currentTime);
  b.g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + 1.2);
  setTimeout(() => { try { b.mus && b.mus.stop(); } catch (e) {} b.g.disconnect(); }, 1400);
}
const warm = () => FILES.filter((n) => n !== 'music').forEach(load);
function sync() { document.documentElement.classList.toggle('snd', on); dispatchEvent(new CustomEvent('yq-sound', { detail: on })); }
function setOn(v) {
  on = v; store('sfx', on ? '1' : '0'); sync();
  if (on) { ac(); warm(); load('press').then(() => play('press')); startBed(); } else stopBed();
}
// Browsers only allow sound after a tap, click or key press. A remembered 'on'
// tries straight away and otherwise starts at the first one.
function wake() { if (on) { ac(); warm(); startBed(); if (A && A.state !== 'running') A.resume().then(startBed, () => {}); } }
['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach((t) => addEventListener(t, wake, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => { if (!A) return; if (document.hidden) A.suspend(); else if (on) A.resume(); });
// the html element is replaced on every page change, so put the class back
document.addEventListener('astro:after-swap', () => document.documentElement.classList.toggle('snd', on));

window.YQSound = {
  get on() { return on; }, setOn, toggle: () => setOn(!on), play, warm, prefetch: () => fetchBytes('music').catch(() => {}),
};
sync();
if (on) { ac(); setTimeout(() => window.YQSound.prefetch(), 800); }
