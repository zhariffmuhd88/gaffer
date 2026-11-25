// atmos.js: Phase 13. Stadium sound, commentary captions, VAR, goal-line technology and the referee's cards.
// Sound is made with Web Audio (no audio files) and starts only after a tap (iOS): the crowd swells when a team
// attacks (louder for the home side), groans and "ooh"s, a goal roar that differs for home and away goals, clap
// patterns and a hummed chant now and then, "olé" on long passing spells, and a PA chime with text announcements.
// One volume slider next to the sound button. Commentary captions describe key moments with the players' names and
// varied wording (switchable). VAR: the engine already decides disallowed goals (shot.js, "NO GOAL"); those get the
// full check — VAR CHECK graphic, referee's hand to his ear, a picture of the move with the offside line, then NO GOAL.
// Some goals that stand, penalties and red cards get a check too, always ending with the engine's decision (GOAL
// STANDS, PENALTY STANDS, RED CARD STANDS); some red cards go to the pitch-side monitor. Goal-line technology shows for
// goals after a scramble and for saves on the line. The referee raises the yellow or red card in 3D and a sent-off
// player walks off. All officials and announcements are fictional and generic. Loaded after photo.js.

try { const v = localStorage.getItem('gaffer.vol'); if (v != null) SND.vol = +v; } catch (e) { }
if (SND.vol == null || isNaN(SND.vol)) SND.vol = .8;
try { const v = localStorage.getItem('gaffer.cmt'); UI.cmt = v == null ? true : v === '1'; } catch (e) { UI.cmt = true; }
// ---------- sound ----------
const _sndInit = SND.init.bind(SND);
SND.init = function () { _sndInit(); try { if (this.master) this.master.gain.value = .875 * this.vol; } catch (e) { } };
SND.setVol = function (v) { this.vol = v; try { localStorage.setItem('gaffer.vol', String(v)); } catch (e) { } if (this.master && this.ctx) this.master.gain.setTargetAtTime(.875 * v, this.ctx.currentTime, .05); };
SND.roar = function (side) {
  const V = UI.match && UI.match.vis; const neutral = V && V.venue && V.venue.neutral; const home = side == null || neutral || side === 0;
  if (home) { this.burst(650, .6, 1.15, .25, 1.6, 2.8); this.burst(1400, .9, .38, .3, 1.3, 2.4); this.burst(220, 1.2, .3, .3, 1.2, 2); }
  else { this.burst(900, .8, .42, .2, 1.1, 1.8); this.burst(1700, 1.1, .16, .25, .9, 1.6); this.groan(); } // the away end celebrates, the home crowd groans
};
SND.tone = function (f, t0, dur, peak, type) {
  if (!this.ctx || !this.on) return; const ctx = this.ctx, t = ctx.currentTime + t0;
  const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.value = f; const g = ctx.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .02); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
  o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + .05);
};
SND.chime = function () { this.tone(659, 0, 1.1, .12); this.tone(523, .45, 1.4, .12); this.tone(1318, 0, .5, .03); };
SND.clap = function (t0, peak) {
  if (!this.ctx || !this.on) return; const ctx = this.ctx, t = ctx.currentTime + t0;
  const src = ctx.createBufferSource(); src.buffer = this.noise; const hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 1600; hp.Q.value = .7;
  const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak || .5, t + .008); g.gain.exponentialRampToValueAtTime(.0005, t + .16);
  src.connect(hp); hp.connect(g); g.connect(this.master); src.start(t, Math.random()); src.stop(t + .2);
};
// clap patterns: "clap clap, clap-clap-clap" and the slow build
SND.claps = function (kind) {
  const pat = kind === 1 ? [0, .5, 1.0, 1.25, 1.5, 2.25, 2.75, 3.25, 3.5, 3.75] : kind === 2 ? [0, .9, 1.7, 2.4, 3.0, 3.5, 3.9, 4.2, 4.45, 4.65, 4.82, 4.96] : [0, .45, .9, 1.35, 1.8, 2.25];
  pat.forEach(t => this.clap(t, .45));
};
// a hummed chant: noise through moving "vowel" filters, in a sing-song rhythm
SND.vowel = function (t0, dur, f1, f2, peak) {
  if (!this.ctx || !this.on) return; const ctx = this.ctx, t = ctx.currentTime + t0;
  const src = ctx.createBufferSource(); src.buffer = this.noise; src.loop = true; const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .08); g.gain.setValueAtTime(peak, t + dur * .7); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
  for (const [f, q, m] of [[f1, 6, 1], [f2, 8, .6]]) { const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; const gm = ctx.createGain(); gm.gain.value = m; src.connect(b); b.connect(gm); gm.connect(g); }
  g.connect(this.master); src.start(t); src.stop(t + dur + .05);
};
SND.chant = function () { [[0, .5, 500, 900], [.55, .5, 650, 1100], [1.1, .9, 560, 950], [2.2, .5, 500, 900], [2.75, .5, 650, 1100], [3.3, 1.1, 450, 800]].forEach(([t, d, a, b]) => this.vowel(t, d, a, b, .5)); };
SND.ole = function () { this.vowel(0, .35, 550, 900, .55); this.vowel(.38, .8, 420, 1900, .7); };
// the crowd swells when a team attacks; more for the home side, a murmur during VAR
const _setCrowd = SND.setCrowd.bind(SND);
SND.setCrowd = function (v) {
  try {
    const LM = UI.match, V = LM && LM.vis, SC = V && V.live;
    if (SC && LM.run && !SC.kick) { const att = SC.poss, bx = att === 0 ? SC.ball.x : 1 - SC.ball.x; const home = V.venue.neutral || att === 0; if (bx > .66) v += (bx - .66) * (home ? .55 : .18); }
    if (LM && LM.varOn) v = Math.min(v, .07);
  } catch (e) { }
  _setCrowd(v);
};
// iOS: audio only after a tap
document.addEventListener('pointerdown', () => { try { if (UI.match && SND.on) { SND.init(); SND.resume(); } } catch (e) { } }, { passive: true });
document.addEventListener('input', (ev) => { const el = ev.target; if (el && el.id === 'sndVol') { SND.setVol(+el.value / 100); } });
// ---------- PA announcements ----------
function paSay(LM, txt) {
  LM.pa = { txt, t: Date.now() }; SND.chime();
  const w = document.getElementById('p2dwrap'); if (!w) return; let el = w.querySelector('.pa13'); if (!el) { w.insertAdjacentHTML('beforeend', '<div class="pa13"></div>'); el = w.querySelector('.pa13'); }
  el.innerHTML = `<span class="mono" style="color:#ffd23f">PA</span> ${esc(txt)}`; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 5200);
}
function paWatch(LM) {
  const M = LM.M; if (!LM.vis || !SND.ctx) return; LM.paSeen = LM.paSeen || { n: M.ev.length, att: false, ko: false };
  const S = LM.paSeen; const V = LM.vis;
  if (!S.ko && M.min >= 0 && LM.run) { S.ko = true; paSay(LM, `Good ${V.meta && V.meta.night ? 'evening' : 'afternoon'} and welcome to ${V.venue.name || 'the stadium'}. Please enjoy the game and look after each other.`); }
  for (; S.n < M.ev.length; S.n++) { const e = M.ev[S.n]; if (e.t === 'sub') { const pin = pnById(M, e.p), pout = pnById(M, e.o); const no = shirtNo(M, e.p); paSay(LM, `Substitution for ${(T(M.sides[e.side].tid) || {}).name || 'the team'}: ${no ? 'number ' + no + ', ' : ''}${pin} replaces ${pout}.`); } }
  if (!S.att && M.min >= 70 && V.att) { S.att = true; paSay(LM, `Today's attendance is ${Number(V.att).toLocaleString('en-GB')}. Thank you for your support.`); }
}
function shirtNo(M, pid) { for (const s of M.sides) { const e = s.ps.find(x => x.p.id === pid); if (e) return e.no || e.p.no || ''; } return ''; }
// ---------- commentary ----------
function cmtPick(arr, k) { return arr[Math.abs(k) % arr.length]; }
function cmtName(e) { return e && e.p ? surname(e.p.n) : ''; }
function cmtLine(LM, SC, st) {
  const k = (hash(String(SC.t | 0) + st.k) >>> 0); const n = cmtName(st.e), to = cmtName(st.to && st.to.p ? st.to : null);
  switch (st.k) {
    case 'pass': if (st.through && to) return cmtPick([`${n} slides it through for ${to}…`, `Lovely ball from ${n}, ${to} is in!`, `${n} splits the defence for ${to}.`], k); if (st.lofted && to) return cmtPick([`${n} goes long towards ${to}.`, `A raking pass from ${n}.`], k); return null;
    case 'cross': return n ? cmtPick([`${n} whips it in…`, `Cross from ${n}!`, `${n} looks for a head in the middle.`], k) : 'In comes the cross…';
    case 'skill': return n ? cmtPick([`${n} dances past his man.`, `Lovely feet from ${n}!`, `${n} beats one…`], k) : null;
    case 'shot': return n ? (st.pen ? cmtPick([`${n} steps up…`, `${n} to take the penalty…`], k) : cmtPick([`${n} shoots!`, `${n} has a go!`, `${n} lets fly!`, `Chance for ${n}!`], k)) : null;
    case 'net': { const sc = LM.M.ev.filter(e => e.t === 'goal').pop(); const who = sc ? surname(pnById(LM.M, sc.p)) : ''; return cmtPick([`GOAL! ${who} scores!`, `It's in! ${who}!`, `${who} finds the net!`, `What a finish from ${who}!`], k); }
    case 'save': { const g = cmtName(st.gk); return g ? cmtPick([`Saved by ${g}!`, `Great stop from ${g}.`, `${g} gets down well.`], k) : 'Saved!'; }
    case 'post': return cmtPick(['Off the woodwork!', 'Rattles the frame of the goal!', 'So close — it hits the post!'], k);
    case 'out': return st.txt && /wide|over/i.test(st.txt) ? cmtPick(['Just wide.', 'Off target.', 'Over the bar.'], k) : null;
    case 'tackle': return n ? cmtPick([`Big tackle from ${n}.`, `${n} wins it back.`, `Strong challenge by ${n}.`], k) : null;
    case 'foul': return n ? cmtPick([`${n} brings his man down.`, `Foul by ${n}.`, `${n} is a little late there.`], k) : null;
    case 'whistle': if (st.card) { const c = SC.lastFoul ? cmtName(SC.lastFoul) : ''; return st.card === 'y' ? cmtPick([`Yellow card for ${c}.`, `${c} goes into the book.`], k) : cmtPick([`Red card! ${c} is sent off!`, `${c} has to go — straight red!`], k); } if (st.offside != null) return cmtPick(['The flag is up for offside.', 'Offside, says the assistant.'], k); return null;
    case 'place': if (st.pen != null) return 'Penalty!'; if (st.txt === 'Corner') return cmtPick(['Corner kick.', `${n} over to take the corner.`], k); if (/free/i.test(st.txt || '')) return `Free kick, ${n} stands over it.`; return null;
    case 'var': return 'The VAR is checking this goal…';
    case 'kickoff': return null;
  }
  return null;
}
function cmtShow(LM, txt, big) {
  if (!UI.cmt || !txt) return; const w = document.getElementById('p2dwrap'); if (!w) return;
  let el = w.querySelector('.cmt13'); if (!el) { w.insertAdjacentHTML('beforeend', '<div class="cmt13" aria-live="polite"></div>'); el = w.querySelector('.cmt13'); }
  const now = Date.now(); if (!big && LM.cmtT && now - LM.cmtT < 1100) return; LM.cmtT = now;
  el.textContent = txt; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), big ? 3600 : 2600);
  LM.cmtLast = txt; LM.cmtN = (LM.cmtN || 0) + 1;
}
// ---------- VAR and goal-line technology ----------
function varShow(LM, stage, kind, res, snap) {
  const w = document.getElementById('p2dwrap'); if (!w) return; let el = w.querySelector('.var13');
  if (!el) { w.insertAdjacentHTML('beforeend', '<div class="var13"></div>'); el = w.querySelector('.var13'); }
  if (!stage) { el.classList.remove('on'); LM.varOn = false; return; }
  LM.varOn = true; LM.varLog = (LM.varLog || []).concat([stage + ':' + kind + (res ? ':' + res : '')]);
  const what = { goal: 'Checking goal', pen: 'Checking penalty', red: 'Checking red card', ofr: 'On-field review' }[kind] || 'Checking';
  const dia = snap ? varDiagram(snap) : '';
  el.innerHTML = stage === 'check' ? `<div class="vh">VAR</div><div class="vt">${what}<span class="vdots"><i>.</i><i>.</i><i>.</i></span></div>${dia}`
    : `<div class="vh">VAR</div><div class="vt ${/NO GOAL|OVERTURNED/.test(res) ? 'red' : 'grn'}">${esc(res)}</div>${dia}`;
  el.classList.add('on');
}
// a picture of the move: the attacking half, the offside line (second-last defender) and the attacker
function varDiagram(s) {
  const W = 220, H = 120, X = (x) => 8 + (s.dir > 0 ? (x - .5) : (.5 - x)) * 2 * (W - 16), Y = (y) => 6 + y * (H - 12);
  const lx = X(s.line), ax = X(s.att.x), ay = Y(s.att.y);
  const dots = s.def.map(p => `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.4" fill="#f2f2f2" stroke="#222"/>`).join('');
  return `<svg class="vdia" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Offside line"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="#2e8b3e" stroke="#fff" stroke-width="1.5"/><rect x="${W - 40}" y="${H * .2}" width="38" height="${H * .6}" fill="none" stroke="#fff"/>${dots}<line x1="${lx.toFixed(1)}" y1="2" x2="${lx.toFixed(1)}" y2="${H - 2}" stroke="#45e1f0" stroke-width="2"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="4.2" fill="#ffd23f" stroke="#222"/><text x="${(lx + 4).toFixed(1)}" y="14" fill="#45e1f0" font-size="10" font-family="monospace">LINE</text></svg>`;
}
function varSnap(LM, SC, side, att) {
  const M = LM.M, V = LM.vis; const pv = SC.lastPassSnap || null; const pos = pv ? pv.pos : SC.pos; const dir = side === 0 ? 1 : -1;
  const def = onPitch(M, 1 - side).map(e => pos.get(e)).filter(Boolean); const xs = def.map(p => dir > 0 ? p.x : 1 - p.x).sort((a, b) => b - a);
  const lineF = xs[1] != null ? xs[1] : .8; const line = dir > 0 ? lineF : 1 - lineF;
  let ap = att && pos.get(att); if (!ap) ap = { x: line - dir * .01, y: .5 };
  return { dir, line, att: { x: ap.x, y: ap.y }, def: def.filter(p => (dir > 0 ? p.x : 1 - p.x) > .5) };
}
function glt(LM, goal) {
  const w = document.getElementById('p2dwrap'); if (!w) return; let el = w.querySelector('.glt13'); if (!el) { w.insertAdjacentHTML('beforeend', '<div class="glt13"></div>'); el = w.querySelector('.glt13'); }
  el.innerHTML = `<svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#111" stroke="#ddd" stroke-width="3"/><path d="M14 34 l12 12 l24 -26" stroke="${goal ? '#2fd36b' : '#ff5f5f'}" stroke-width="6" fill="none" ${goal ? '' : 'style="display:none"'}/><path d="M18 18 L46 46 M46 18 L18 46" stroke="#ff5f5f" stroke-width="6" ${goal ? 'style="display:none"' : ''}/></svg><div><div class="dim" style="font-size:11px;letter-spacing:1px">GOAL-LINE TECHNOLOGY</div><b style="font-size:20px">${goal ? 'GOAL' : 'NO GOAL'}</b></div>`;
  el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); LM.gltN = (LM.gltN || 0) + 1;
}
// run a VAR sequence on the live match: check (hand to ear), then the decision
function varRun(LM, SC, kind, res, snap, ms) {
  if (LM.varBusy) return; LM.varBusy = true; const S3 = LM.v3s; LM.ref13 = { ear: true, ofr: kind === 'ofr' };
  varShow(LM, 'check', kind, null, snap); SND.setCrowd(.05);
  setTimeout(() => { if (UI.match !== LM) return; varShow(LM, 'done', kind, res, snap); LM.ref13 = null; if (/STANDS|GOAL$/.test(res) && kind !== 'red') SND.burst(650, .6, .5, .2, .6, 1.6); else SND.groan(); cmtShow(LM, kind === 'goal' && /NO GOAL/.test(res) ? 'No goal! The VAR has ruled it out.' : res.charAt(0) + res.slice(1).toLowerCase() + '.', true); }, ms || 2600);
  setTimeout(() => { if (UI.match !== LM) return; varShow(LM, null); LM.varBusy = false; }, (ms || 2600) + 2000);
  if (S3) S3.varT = performance.now();
}
// ---------- hook into each step of the live 2D/3D scene ----------
const _enterStep13 = enterStep;
enterStep = function (LM, SC, st) {
  _enterStep13(LM, SC, st);
  try {
    if (!SC.live || LM.vis.rp) return;
    const M = LM.M, V = LM.vis;
    if (st.k === 'pass' || st.k === 'cross' || st.k === 'skill') { SC.lastPassSnap = { pos: new Map([...SC.pos].map(([e, p]) => [e, { x: p.x, y: p.y }])), to: st.to || st.e }; }
    if (st.k === 'foul') SC.lastFoul = st.e;
    if (st.k === 'shot') SC.lastShooter = st.e;
    // passing spells: olé
    if (st.k === 'pass') { if (SC.olS === SC.poss) SC.olN = (SC.olN || 0) + 1; else { SC.olS = SC.poss; SC.olN = 1; } if (SC.olN >= 5 && (V.venue.neutral || SC.poss === 0)) { SND.ole(); LM.oleN = (LM.oleN || 0) + 1; } } else if (['tackle', 'foul', 'out', 'net', 'save', 'kickoff'].includes(st.k)) SC.olN = 0;
    cmtShow(LM, cmtLine(LM, SC, st), st.k === 'net' || st.k === 'var' || (st.k === 'whistle' && !!st.card));
    // VAR: the engine's disallowed goal
    if (st.k === 'var') { const sh = SC.lastShooter; const side = sh ? sideOf(V, M, sh) : SC.poss; varRun(LM, SC, 'goal', 'NO GOAL', varSnap(LM, SC, side, SC.lastPassSnap && SC.lastPassSnap.to || sh), (st.te - st.ts) * .75); }
    // goals that stand: a check now and then, or goal-line technology after a scramble
    if (st.k === 'net') {
      const h = hash(String(M.fid) + M.min + 'var') % 100; const prev = SC.plan.slice(Math.max(0, SC.si - 3), SC.si).map(x => x.k);
      if (h < 22) { const side = st.side; varRun(LM, SC, 'goal', 'GOAL STANDS', varSnap(LM, SC, side, SC.lastPassSnap && SC.lastPassSnap.to || SC.lastShooter), 2400); }
      else if (prev.includes('save') || prev.includes('post') || prev.includes('deflect') || h > 88) glt(LM, true);
    }
    if (st.k === 'save' && (st.det === 'backpedal' || st.det === 'fingertip' || st.det === 'smother') && (hash(String(M.min) + st.det + M.fid) % 3 === 0)) glt(LM, false);
    if (st.k === 'place' && st.pen != null && (hash(String(M.fid) + M.min + 'pk') % 100) < 45) varRun(LM, SC, 'pen', 'PENALTY STANDS', null, 2000);
    if (st.k === 'whistle' && st.card) {
      const e = SC.lastFoul; LM.card13 = { c: st.card === 'y' ? 'y' : 'r', t: performance.now(), e };
      if (st.card !== 'y') {
        if (e) { const s = sideOf(V, M, e); const p = SC.pos.get(e) || { y: .5 }; SC.ov.set(e, { x: s === 0 ? .44 : .56, y: p.y < .5 ? -.05 : 1.05 }); SC.sentOff = e; }
        const h = hash(String(M.fid) + M.min + 'rc') % 3; if (h === 0) varRun(LM, SC, 'ofr', 'RED CARD STANDS', null, 3200); else if (h === 1) varRun(LM, SC, 'red', 'RED CARD STANDS', null, 2200);
      }
    }
  } catch (er) { console.error(er); }
};
// crowd moments between the big events: claps and chants
function crowdMoments(LM) {
  if (!SND.ctx || !SND.on || !LM.run || LM.varOn) return; const now = Date.now(); LM.cmNext = LM.cmNext || now + 9000;
  if (now < LM.cmNext) return; LM.cmNext = now + 16000 + (hash(String(now)) % 14000);
  const r = (now / 1000 | 0) % 3; if (r === 2) SND.chant(); else SND.claps(r); LM.crowdN = (LM.crowdN || 0) + 1;
}
const _visFrame13 = visFrame;
visFrame = function (LM, ts) { _visFrame13(LM, ts); try { if (UI.match === LM) { crowdMoments(LM); paWatch(LM); } } catch (e) { } };
// ---------- 3D: referee cards, hand to ear, pitch-side monitor ----------
function cardMesh3(T3, col) { const m = new T3.Mesh(new T3.PlaneGeometry(.2, .28), new T3.MeshBasicMaterial({ color: col, side: T3.DoubleSide })); m.renderOrder = 4; return m; }
const _cast13 = cast3d;
cast3d = function (S3, LM, SC, bw, ts, dt) {
  _cast13(S3, LM, SC, bw, ts, dt);
  try {
    if (!S3.refs) return; const T3 = S3.T3 || window.THREE; const ref = S3.refs[0];
    if (!S3.c13) { S3.c13 = { y: cardMesh3(T3, '#ffd23f'), r: cardMesh3(T3, '#ff2b2b') }; S3.scene.add(S3.c13.y); S3.scene.add(S3.c13.r); S3.c13.y.visible = S3.c13.r.visible = false;
      // pitch-side monitor by the halfway line
      const mon = new T3.Group(); const pole = new T3.Mesh(new T3.CylinderGeometry(.05, .05, 1.4, 6), new T3.MeshLambertMaterial({ color: '#333' })); pole.position.y = .7; mon.add(pole);
      const scr = new T3.Mesh(new T3.BoxGeometry(.9, .6, .08), new T3.MeshLambertMaterial({ color: '#111' })); scr.position.y = 1.65; mon.add(scr); const gl = new T3.Mesh(new T3.PlaneGeometry(.8, .5), new T3.MeshBasicMaterial({ color: '#3a7bd5' })); gl.position.set(0, 1.65, .045); mon.add(gl);
      mon.position.set(3.5, 0, P3.W / 2 + 2.2); mon.rotation.y = Math.PI; S3.scene.add(mon); S3.mon13 = mon; }
    const c = LM.card13; const on = c && performance.now() - c.t < 2600 && !LM.vis.rp;
    const arm = armOf(ref, 1);
    if (on) { const m = c.c === 'y' ? S3.c13.y : S3.c13.r; (c.c === 'y' ? S3.c13.r : S3.c13.y).visible = false; m.visible = true; const a = ref.g.rotation.y; m.position.set(ref.g.position.x + Math.sin(a) * .25, 2.45, ref.g.position.z + Math.cos(a) * .25); m.lookAt(S3.cam.position); if (arm) { arm.rotation.z = Math.PI * .92; arm.rotation.x = 0; } }
    else { S3.c13.y.visible = false; S3.c13.r.visible = false; }
    const r = LM.ref13;
    if (r && r.ofr && S3.mon13) { const tx = S3.mon13.position.x - .9, tz = S3.mon13.position.z - .3; const k = Math.min(1, dt / 350); ref.g.position.x += (tx - ref.g.position.x) * k; ref.g.position.z += (tz - ref.g.position.z) * k; ref.g.rotation.y = 0; }
    else if (r && r.ear && arm) { arm.rotation.z = 2.5; arm.rotation.x = -.5; }
  } catch (er) { }
};
// ---------- controls: commentary toggle and volume ----------
ACT.mcmt = () => { UI.cmt = !UI.cmt; try { localStorage.setItem('gaffer.cmt', UI.cmt ? '1' : '0'); } catch (e) { } renderMatch(); };
const _rm13 = renderMatch;
renderMatch = function () {
  const r = _rm13.apply(this, arguments);
  try {
    const b = document.querySelector('[data-a="msnd"]');
    if (b && !document.getElementById('sndVol')) b.insertAdjacentHTML('afterend', `<label class="row" style="gap:4px;align-items:center;font-size:12px" title="Volume"><span aria-hidden="true">🔊</span><input type="range" id="sndVol" min="0" max="100" step="5" value="${Math.round(SND.vol * 100)}" style="width:80px" aria-label="Volume"></label><button class="btn ${UI.cmt ? 'on' : ''}" data-a="mcmt" title="Commentary captions">Commentary ${UI.cmt ? 'on' : 'off'}</button>`);
  } catch (e) { }
  return r;
};
