// intro.js: launch sting (Ayep Interactive logo, disclaimer card, GAFFER logo), Game > Options and Game > About.
// Loaded just before boot.js. Plays once per page load, never on re-renders.

const DISCLAIMER_P = [
  'GAFFER 26/27 is a fan-made game created for personal, non-commercial use only. It is not for sale or commercial distribution.',
  'It is not affiliated with, endorsed by or connected to the Premier League, the EFL, UEFA, The FA, any football club, or Sports Interactive / SEGA (Football Manager).',
  'Real player, club, manager and stadium names are used for personal reference only; all trademarks belong to their owners. No official logos or badges are used.',
  'Player ratings, attributes and match results are fictional estimates and simulations.'
];
const DISCLAIMER_C = '© 2026 Ayep Interactive';
function introPref(k, v) {
  try { if (v === undefined) return localStorage.getItem('gaffer.' + k); localStorage.setItem('gaffer.' + k, v); } catch (e) { return null; }
}
function ayepSvg() {
  // original monogram: a bold "A" drawn from pitch lines; the crossbar is the halfway line, the centre circle sits on it,
  // the goal mouth sits between the feet and the ball drops into the centre spot.
  return `<svg class="ay-mark" viewBox="0 0 240 200" aria-hidden="true">
    <g fill="none" stroke-linecap="square">
      <rect class="ay-draw d1" x="16" y="14" width="208" height="172" stroke="rgba(69,225,240,.35)" stroke-width="2" pathLength="1"/>
      <path class="ay-draw d2" d="M58 172 L120 34 L182 172" stroke="#45e1f0" stroke-width="13" pathLength="1"/>
      <path class="ay-draw d3" d="M80 122 L160 122" stroke="#45e1f0" stroke-width="7" pathLength="1"/>
      <circle class="ay-draw d4" cx="120" cy="122" r="17" stroke="#edf0ff" stroke-width="3" pathLength="1"/>
      <path class="ay-draw d5" d="M104 186 L104 172 L136 172 L136 186" stroke="#edf0ff" stroke-width="3" pathLength="1"/>
    </g>
    <g class="ay-ball"><circle cx="120" cy="122" r="7.5" fill="#ffd23f" stroke="#090d26" stroke-width="2"/></g>
  </svg>`;
}
function gafferBadgeSvg() {
  return `<svg class="gf-badge" viewBox="0 0 120 120" aria-hidden="true">
    <rect width="120" height="120" fill="#12258a"/>
    <rect y="81.6" width="120" height="38.4" fill="#1f7a3a"/>
    ${[1, 3, 5].map(i => `<rect x="${i * 20}" y="81.6" width="20" height="38.4" fill="#24873f"/>`).join('')}
    <rect y="80.5" width="120" height="2.2" fill="#ffd23f"/>
    <text x="62.6" y="64.6" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="62" fill="#000">G</text>
    <text x="60" y="62" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="62" fill="#ffd23f">G</text>
    <circle cx="87.6" cy="100.8" r="6.6" fill="#fff" stroke="#000" stroke-width="1"/>
  </svg>`;
}
function introSting(ac) {
  try {
    const t0 = ac.currentTime + 0.05;
    const out = ac.createGain(); out.gain.value = 0.22; out.connect(ac.destination);
    // crowd: filtered noise swelling and fading
    const len = ac.sampleRate * 2.4; const buf = ac.createBuffer(1, len, ac.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / 900));
    const src = ac.createBufferSource(); src.buffer = buf;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.6;
    const cg = ac.createGain(); cg.gain.setValueAtTime(0.0001, t0); cg.gain.exponentialRampToValueAtTime(0.9, t0 + 0.55); cg.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.3);
    src.connect(bp); bp.connect(cg); cg.connect(out); src.start(t0); src.stop(t0 + 2.4);
    // referee's whistle: two blasts with a pea rattle
    for (const [s, e] of [[0.1, 0.28], [0.38, 0.9]]) {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 2950;
      const lfo = ac.createOscillator(); lfo.frequency.value = 34; const lg = ac.createGain(); lg.gain.value = 0.35; lfo.connect(lg);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0 + s); g.gain.exponentialRampToValueAtTime(0.5, t0 + s + 0.02); g.gain.setValueAtTime(0.5, t0 + e - 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t0 + e);
      lg.connect(g.gain); o.connect(g); g.connect(out); o.start(t0 + s); lfo.start(t0 + s); o.stop(t0 + e + 0.02); lfo.stop(t0 + e + 0.02);
    }
  } catch (e) { }
}
let _introOn = false;
function runIntro(opts) {
  opts = opts || {};
  if (_introOn) return; _introOn = true;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = opts.only === 'disc' ? ['disc'] : ['ayep', 'disc', 'logo'];
  const dur = reduce ? { ayep: 1000, disc: 1000, logo: 1000 } : { ayep: 2600, disc: 3200, logo: 2400 };
  const el = document.createElement('div');
  el.className = 'intro' + (reduce ? ' still' : ''); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Game intro'); el.tabIndex = -1;
  el.innerHTML = `
    <section class="ic ic-ayep"><div class="ay-wrap">${ayepSvg()}<div class="ay-word"><span class="ay-1">AYEP</span><span class="ay-2">INTERACTIVE</span></div></div></section>
    <section class="ic ic-disc"><div class="dc"><div class="dc-rule"></div><h2 class="dc-h">Please note</h2><div class="dc-rule"></div>${DISCLAIMER_P.map(p => `<p>${esc(p)}</p>`).join('')}<div class="dc-rule"></div><p class="dc-c">${esc(DISCLAIMER_C)}</p><p class="dc-tap">Tap or press any key to continue</p></div></section>
    <section class="ic ic-logo"><div class="gf-wrap">${gafferBadgeSvg()}<div class="gf-word"><span class="gf-1">GAFFER</span><span class="gf-2">26/27</span></div></div></section>
    <div class="ic-wipe"></div>
    <button class="ic-skip" type="button">Skip intro</button>`;
  document.body.appendChild(el);
  try { el.focus({ preventScroll: true }); } catch (e) { }
  let i = -1, timer = null, ac = null, finished = false;
  const show = (k) => { el.querySelectorAll('.ic').forEach(s => s.classList.toggle('on', s.classList.contains('ic-' + k))); };
  const finish = () => {
    if (finished) return; finished = true; clearTimeout(timer);
    introPref('disc', '1');
    el.classList.add('out');
    document.removeEventListener('keydown', onKey, true);
    setTimeout(() => { el.remove(); _introOn = false; if (opts.done) opts.done(); }, reduce ? 50 : 450);
  };
  const next = () => {
    clearTimeout(timer); i++;
    if (i >= cards.length) return finish();
    const k = cards[i];
    if (k === 'logo' && !reduce) { el.classList.add('wipe'); setTimeout(() => el.classList.remove('wipe'), 520); }
    show(k);
    if (k === 'logo' && ac) introSting(ac);
    timer = setTimeout(next, dur[k]);
  };
  const gesture = () => { if (!ac) { try { const C = window.AudioContext || window.webkitAudioContext; if (C) { ac = new C(); if (ac.state === 'suspended') ac.resume(); } } catch (e) { ac = null; } } };
  el.addEventListener('pointerdown', (ev) => { gesture(); if (ev.target.closest('.ic-skip')) { ev.preventDefault(); finish(); return; } next(); });
  const onKey = (ev) => { if (finished) return; gesture(); ev.preventDefault(); ev.stopPropagation(); if (ev.key === 'Escape') finish(); else next(); };
  document.addEventListener('keydown', onKey, true);
  next();
}
// boot: play once per page load (not on hot reloads or re-renders)
const _bootI = boot;
boot = function (data) {
  _bootI(data);
  try {
    if (window.__gafferIntro || (data && data.G)) return;
    window.__gafferIntro = 1;
    if (introPref('intro') === 'off') { if (introPref('disc') !== '1') runIntro({ only: 'disc' }); return; }
    runIntro();
  } catch (e) { console.error(e); }
};

// Game screen: options and about
const _scrGameI = scrGame;
scrGame = function () {
  const html = _scrGameI();
  const on = introPref('intro') !== 'off';
  const box = `<div class="box pad"><h2 class="sect" style="margin-top:0">Options</h2>
      <label class="row" style="gap:8px;cursor:pointer"><input type="checkbox" data-a="introtg" ${on ? 'checked' : ''}> Play the intro when the game opens</label>
      <p class="dim" style="font-size:12.5px">The disclaimer is always shown once on the very first launch. The setting is kept in this browser.</p>
      <button class="btn" data-a="introplay">Play the intro now</button></div>
    <div class="box pad"><h2 class="sect" style="margin-top:0">About</h2>${DISCLAIMER_P.map(p => `<p style="margin:0 0 8px">${esc(p)}</p>`).join('')}<p class="dim" style="margin:0">${esc(DISCLAIMER_C)}</p></div>`;
  const i = html.lastIndexOf('</div><div id="exp">');
  return i > 0 ? html.slice(0, i) + box + html.slice(i) : html + box;
};
Object.assign(ACT, { introplay: () => runIntro() });
document.addEventListener('change', (ev) => { const el = ev.target; if (el && el.dataset && el.dataset.a === 'introtg') { introPref('intro', el.checked ? 'on' : 'off'); toast(el.checked ? 'The intro will play when the game opens.' : 'The intro is off.'); } });
