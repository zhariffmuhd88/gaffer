// ===== MATCHDAY: stadium view, movement, skills, replays, live scores, sound =====
// The engine decides what happens each minute; this layer stages it on a 2D pitch.

// ---------- kits ----------
function colDist(a, b) { const A = hexRgb(a), B = hexRgb(b); return Math.sqrt(A.reduce((s, v, i) => s + (v - B[i]) ** 2, 0)); }
function kitFor(M) {
  const h = T(M.sides[0].tid), a = T(M.sides[1].tid);
  const hk = { body: h.c1 || '#8a8f99', trim: h.c2 || '#ffffff' };
  let ak = { body: a.c1 || '#8a8f99', trim: a.c2 || '#ffffff' };
  if (colDist(hk.body, ak.body) < 120) ak = colDist(hk.body, ak.trim) >= 120 ? { body: ak.trim, trim: ak.body } : { body: lum(hk.body) > .4 ? '#1b1f2e' : '#f2f2f2', trim: ak.body };
  if (colDist(hk.body, ak.body) < 90) ak = { body: lum(hk.body) > .4 ? '#1b1f2e' : '#f2f2f2', trim: '#d0b23c' };
  return [hk, ak];
}
function uiCol(c) { return lum(c) < .06 ? lighten(c, .12) : c; }

// ---------- sound (generated, no files) ----------
const SND = {
  ctx: null, on: true, crowd: null, master: null, lvl: 0,
  pref() { try { const v = localStorage.getItem('gaffer.snd'); if (v != null) this.on = v === '1'; } catch (e) { } },
  save() { try { localStorage.setItem('gaffer.snd', this.on ? '1' : '0'); } catch (e) { } },
  init() {
    if (!this.on) return;
    try {
      if (this.ctx) { this.ctx.resume(); return; }
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      const ctx = this.ctx = new C();
      this.master = ctx.createGain(); this.master.gain.value = .7; this.master.connect(ctx.destination);
      const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b0 = .99765 * b0 + w * .099; b1 = .963 * b1 + w * .2965; b2 = .57 * b2 + w * 1.0527; d[i] = (b0 + b1 + b2 + w * .1848) * .18; }
      this.noise = buf;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(lp); lp.connect(g); g.connect(this.master); src.start();
      this.crowd = g;
    } catch (e) { this.ctx = null; }
  },
  setCrowd(v) { if (!this.ctx || !this.crowd) return; this.lvl = v; this.crowd.gain.setTargetAtTime(this.on ? v : 0, this.ctx.currentTime, .35); },
  burst(freq, q, peak, up, hold, down) {
    if (!this.ctx || !this.on) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = this.noise; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + up); g.gain.setValueAtTime(peak, t + up + hold); g.gain.exponentialRampToValueAtTime(.0005, t + up + hold + down);
    src.connect(bp); bp.connect(g); g.connect(this.master); src.start(t); src.stop(t + up + hold + down + .1);
  },
  roar() { this.burst(650, .6, 1.1, .25, 1.4, 2.6); this.burst(1400, .9, .35, .3, 1.2, 2.2); },
  ooh() { this.burst(380, 2.5, .45, .3, .25, .9); },
  groan() { this.burst(260, 2, .3, .2, .3, 1.1); },
  whistle(n, long) {
    if (!this.ctx || !this.on) return;
    const ctx = this.ctx; let t = ctx.currentTime + .02;
    for (let i = 0; i < n; i++) {
      const L = long && i === n - 1 ? .75 : .22;
      const o = ctx.createOscillator(); o.frequency.value = 2950;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 42; const lg = ctx.createGain(); lg.gain.value = 140; lfo.connect(lg); lg.connect(o.frequency);
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + .02); g.gain.setValueAtTime(.09, t + L - .03); g.gain.linearRampToValueAtTime(0, t + L);
      o.connect(g); g.connect(this.master); o.start(t); lfo.start(t); o.stop(t + L + .05); lfo.stop(t + L + .05);
      t += L + .14;
    }
  },
  pause() { if (this.ctx) this.ctx.suspend(); },
  resume() { if (this.ctx && this.on) this.ctx.resume(); }
};
SND.pref();

// ---------- view setup ----------
function seeded(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function visInit(LM) {
  const M = LM.M, f = G.fx[M.fid];
  const cv = document.createElement('canvas'); cv.className = 'p2d'; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Live 2D match view');
  const ven = venueOf(f);
  const V = {
    cv, ctx: cv.getContext('2d'), kits: kitFor(M), venue: ven, att: attendanceOf(f), meta: M.meta || fxMeta(f),
    cam: { x: 0, y: 0, z: 1 }, camMode: UI.camPref || 'full', layers: null, w: 0, h: 0, lastTs: 0, cheer: null,
    side: new Map(), rp: null, rpQueue: [], wxp: [], lastSnd: 0
  };
  for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) V.side.set(e, s);
  V.live = newScene(V, M, true);
  LM.vis = V; LM.replays = []; LM.heat = new Map();
  cv.addEventListener('click', () => { if (V.rp) endReplay(LM); });
  const loop = (ts) => { if (UI.match !== LM) return; visFrame(LM, ts); V.raf = requestAnimationFrame(loop); };
  V.raf = requestAnimationFrame(loop);
}
function newScene(V, M, live) {
  const SC = { live, M, pos: new Map(), ball: { x: .5, y: .5, h: 0 }, plan: [], t: 0, end: 0, si: -1, from: { x: .5, y: .5, h: 0 }, poss: 0, holder: null, ov: new Map(), fallen: new Map(), dive: null, net: null, trails: [], fx: [], trail: [], kick: true, rate: 1, minDur: 500, hold: false, reveal: 0 };
  for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) if (e.on) SC.pos.set(e, teamTarget(SC, e, s, V));
  return SC;
}
function sideOf(V, M, e) { let s = V.side.get(e); if (s == null) { s = M.sides[0].ps.includes(e) ? 0 : 1; V.side.set(e, s); } return s; }

// ---------- layout ----------
function layout(V) {
  const W = V.w;
  const capR = clamp(V.venue.cap / 75000, .15, 1.2);
  const sd = Math.round(W * (.028 + .05 * capR));
  const pad = Math.max(6, Math.round(W * .018));
  const pw = W - 2 * (sd + pad), ph = Math.round(pw * .62);
  return { W, H: ph + 2 * (sd + pad), sd, pad, pw, ph, ox: sd + pad, oy: sd + pad };
}
function buildLayers(V, M) {
  const L = V.L, dpr = V.dpr, W = L.W, H = L.H;
  const mk = () => { const c = document.createElement('canvas'); c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr); const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, x]; };
  const night = V.meta.night, wx = V.meta.wx;
  const [bg, b] = mk(), [hf, h] = mk(), [af, a] = mk();
  const ht = T(M.sides[0].tid), at = T(M.sides[1].tid);
  // surroundings & stands
  b.fillStyle = night ? '#04060d' : '#454b57'; b.fillRect(0, 0, W, H);
  b.fillStyle = night ? '#121622' : '#2a2f3a';
  b.fillRect(0, 0, W, L.sd); b.fillRect(0, H - L.sd, W, L.sd); b.fillRect(0, 0, L.sd, H); b.fillRect(W - L.sd, 0, L.sd, H);
  b.fillStyle = night ? '#0a0d16' : '#20242d';
  for (const [x, y] of [[0, 0], [W - L.sd, 0], [0, H - L.sd], [W - L.sd, H - L.sd]]) b.fillRect(x, y, L.sd, L.sd);
  // grass
  const gx = L.sd, gy = L.sd, gw = W - 2 * L.sd, gh = H - 2 * L.sd;
  const g1 = wx === 'snow' ? '#5d8a63' : wx === 'rain' ? '#175c30' : '#1b6a37', g2 = wx === 'snow' ? '#66926b' : wx === 'rain' ? '#1a6535' : '#1f7541';
  for (let i = 0; i < 14; i++) { b.fillStyle = i % 2 ? g1 : g2; b.fillRect(gx + i * gw / 14, gy, gw / 14 + 1, gh); }
  if (wx === 'snow') { const gr = b.createLinearGradient(0, gy, 0, gy + gh); gr.addColorStop(0, 'rgba(235,240,245,.45)'); gr.addColorStop(.12, 'rgba(235,240,245,0)'); gr.addColorStop(.88, 'rgba(235,240,245,0)'); gr.addColorStop(1, 'rgba(235,240,245,.45)'); b.fillStyle = gr; b.fillRect(gx, gy, gw, gh); }
  if (night) { b.save(); b.globalCompositeOperation = 'lighter'; for (const [x, y] of [[gx, gy], [gx + gw, gy], [gx, gy + gh], [gx + gw, gy + gh]]) { const r = b.createRadialGradient(x, y, 0, x, y, gw * .55); r.addColorStop(0, 'rgba(255,255,230,.12)'); r.addColorStop(1, 'rgba(255,255,230,0)'); b.fillStyle = r; b.fillRect(gx, gy, gw, gh); } b.restore(); }
  // advertising boards
  const bh = Math.max(3, L.pad * .45);
  const c1 = uiCol(ht.c1 || '#555'), c2 = ht.c2 || '#fff';
  const seg = Math.max(30, W / 16);
  for (let x = gx, i = 0; x < gx + gw; x += seg, i++) { b.fillStyle = i % 2 ? c1 : '#10131c'; b.fillRect(x, gy, Math.min(seg, gx + gw - x), bh); b.fillRect(x, gy + gh - bh, Math.min(seg, gx + gw - x), bh); }
  if (W > 520) { b.font = `600 ${Math.max(6, bh * .8)}px "IBM Plex Mono", monospace`; b.textBaseline = 'middle'; b.textAlign = 'center'; for (let x = gx, i = 0; x < gx + gw; x += seg, i++) { b.fillStyle = i % 2 ? readable(c1) : c2; b.fillText(i % 3 === 0 ? 'GAFFER 26/27' : i % 3 === 1 ? tName(M.sides[0].tid).toUpperCase() : 'MATCHDAY', x + seg / 2, gy + bh / 2 + .5); } }
  // pitch markings
  const px = (x) => L.ox + x * L.pw, py = (y) => L.oy + y * L.ph;
  b.strokeStyle = 'rgba(255,255,255,.8)'; b.lineWidth = Math.max(1, W / 600);
  b.strokeRect(px(0), py(0), L.pw, L.ph);
  b.beginPath(); b.moveTo(px(.5), py(0)); b.lineTo(px(.5), py(1)); b.stroke();
  b.beginPath(); b.arc(px(.5), py(.5), L.ph * .135, 0, 6.29); b.stroke();
  b.fillStyle = 'rgba(255,255,255,.85)'; b.beginPath(); b.arc(px(.5), py(.5), 1.6, 0, 6.29); b.fill();
  for (const s of [0, 1]) {
    const x0 = s ? px(1) : px(0), dir = s ? -1 : 1;
    const box = (dx, dy) => b.strokeRect(Math.min(x0, x0 + dir * L.pw * dx), py(.5 - dy / 2), L.pw * dx, L.ph * dy);
    box(.157, .59); box(.052, .27);
    b.beginPath(); b.arc(px(s ? .895 : .105), py(.5), 1.6, 0, 6.29); b.fill();
    b.beginPath(); b.arc(px(s ? .895 : .105), py(.5), L.ph * .135, s ? Math.PI * .7 : -Math.PI * .3, s ? Math.PI * 1.3 : Math.PI * .3); b.stroke();
    // goal frame and net
    const gd = Math.max(5, L.pad * .7);
    b.fillStyle = 'rgba(255,255,255,.16)'; b.fillRect(s ? x0 : x0 - gd, py(.45), gd, L.ph * .1);
    b.strokeStyle = 'rgba(255,255,255,.35)'; b.lineWidth = .6; for (let k = 1; k < 5; k++) { b.beginPath(); b.moveTo(s ? x0 : x0 - gd, py(.45 + k * .02)); b.lineTo(s ? x0 + gd : x0, py(.45 + k * .02)); b.stroke(); }
    b.strokeStyle = '#fff'; b.lineWidth = Math.max(1.5, W / 420); b.strokeRect(s ? x0 : x0 - gd, py(.45), gd, L.ph * .1);
    b.lineWidth = Math.max(1, W / 600); b.strokeStyle = 'rgba(255,255,255,.8)';
  }
  for (const [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { b.fillStyle = '#ffd23f'; b.fillRect(px(x) - 1, py(y) - 4, 2, 4); }
  // stand names
  const names = V.venue.stands; const fs = Math.max(7, Math.min(13, L.sd * .3));
  b.font = `600 ${fs}px "IBM Plex Sans Condensed", Arial, sans-serif`; b.textAlign = 'center'; b.textBaseline = 'middle';
  const label = (txt, x, y, rot) => { b.save(); b.translate(x, y); if (rot) b.rotate(rot); b.fillStyle = 'rgba(255,255,255,.06)'; const tw = b.measureText(txt.toUpperCase()).width + 10; b.fillRect(-tw / 2, -fs * .7, tw, fs * 1.4); b.fillStyle = 'rgba(255,255,255,.5)'; b.fillText(txt.toUpperCase(), 0, .5); b.restore(); };
  // crowd
  const rnd = seeded(hash(M.fid + ht.id));
  const fill = clamp(V.att / V.venue.cap, .3, 1);
  const gap = Math.max(3.2, L.sd / 7.5), rr = gap * .36;
  const homeCols = [uiCol(ht.c1 || '#888'), uiCol(ht.c1 || '#888'), uiCol(ht.c1 || '#888'), ht.c2 || '#fff', '#e6e6e6', '#30343f'];
  const awayCols = [uiCol(at.c1 || '#888'), uiCol(at.c1 || '#888'), at.c2 || '#fff', '#d8d8d8'];
  const neutral = V.venue.neutral;
  const awayZone = (x, y) => neutral ? x > W / 2 : (x > W - L.sd && y < L.sd + (H - 2 * L.sd) * (.28 + .12 * (1 - fill)));
  const dot = (x, y) => {
    const away = awayZone(x, y);
    if (rnd() > (away ? .95 : fill)) { b.fillStyle = night ? 'rgba(80,90,110,.35)' : 'rgba(110,118,135,.55)'; b.fillRect(x - rr * .7, y - rr * .7, rr * 1.4, rr * 1.4); return; }
    const ctx = away ? a : h; const cols = away ? awayCols : homeCols;
    ctx.fillStyle = cols[Math.floor(rnd() * cols.length)]; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.29); ctx.fill();
  };
  for (let y = gap * .7; y < L.sd - gap * .3; y += gap) for (let x = gap * .7; x < W - gap * .3; x += gap) { dot(x, y); dot(x, H - y); }
  for (let x = gap * .7; x < L.sd - gap * .3; x += gap) for (let y = L.sd + gap * .5; y < H - L.sd - gap * .3; y += gap) { dot(x, y); dot(W - x, y); }
  label(names[0], W / 2, L.sd / 2); label(names[1], W / 2, H - L.sd / 2); label(names[2], L.sd / 2, H / 2, -Math.PI / 2); label(names[3], W - L.sd / 2, H / 2, Math.PI / 2);
  if (!neutral && L.sd > 14) { b.save(); b.translate(W - L.sd / 2, L.sd + 6); b.font = `600 ${Math.max(6, fs * .75)}px "IBM Plex Sans Condensed", Arial`; b.fillStyle = 'rgba(255,255,255,.55)'; b.textAlign = 'center'; b.textBaseline = 'top'; b.fillText('AWAY', 0, 0); b.restore(); }
  // floodlight pylons
  if (night) for (const [x, y] of [[L.sd * .5, L.sd * .5], [W - L.sd * .5, L.sd * .5], [L.sd * .5, H - L.sd * .5], [W - L.sd * .5, H - L.sd * .5]]) {
    b.save(); b.globalCompositeOperation = 'lighter'; const r = b.createRadialGradient(x, y, 0, x, y, L.sd * 2.2); r.addColorStop(0, 'rgba(255,250,215,.55)'); r.addColorStop(1, 'rgba(255,250,215,0)'); b.fillStyle = r; b.fillRect(x - L.sd * 2.2, y - L.sd * 2.2, L.sd * 4.4, L.sd * 4.4); b.restore();
    b.fillStyle = '#fffbe0'; b.fillRect(x - 3, y - 3, 6, 6);
  }
  V.layers = { bg, hf, af };
  // weather particles
  V.wxp = [];
  const n = wx === 'rain' ? 110 : wx === 'snow' ? 80 : 0;
  for (let i = 0; i < n; i++) V.wxp.push({ x: Math.random() * W, y: Math.random() * H, v: .6 + Math.random() * .6 });
}

// ---------- team shape ----------
const DEF_ROLES = ['DC', 'DL', 'DR', 'WBL', 'WBR'];
function teamTarget(SC, e, s, V) {
  const M = SC.M, S = M.sides[s];
  const b = SC.ball; const bx = s === 0 ? b.x : 1 - b.x, by = s === 0 ? b.y : 1 - b.y;
  const depth = e.y / 100, across = e.x / 100, role = e.role;
  const w = S.tac.width || 2;
  let x, y;
  if (SC.kick) {
    x = role === 'GK' ? .03 : .06 + depth * .4; x = Math.min(x, .47);
    y = .07 + across * .86;
  } else if (role === 'GK') {
    x = .025 + clamp(bx - .45, 0, .55) * .07 + (e.pr === 'SK' ? clamp(bx - .4, 0, .6) * .12 : 0);
    y = .5 + (by - .5) * .14;
  } else if (SC.poss === s) {
    x = .1 + depth * .6 + (bx - .45) * .55;
    if (bx > .58) {
      if (role === 'FC') x = Math.max(x, .85 + (hash(String(e.p.id)) % 7) / 100);
      else if (['AML', 'AMR', 'ML', 'MR'].includes(role)) x = Math.max(x, .78);
      else if (role === 'AMC') x = Math.max(x, .73);
      else if (role === 'WBL' || role === 'WBR' || e.pr === 'WB' || e.pr === 'CWB') x = Math.max(x, .7);
      else if (e.pr === 'BBM' || e.pr === 'MEZ') x = Math.max(x, .68);
    }
    x = Math.min(x, .94);
    const spread = w === 3 ? 1.08 : w === 1 ? .82 : .95;
    y = .5 + (.07 + across * .86 - .5) * spread + (by - .5) * .14;
    if (e.pr === 'IF' || e.pr === 'IW' || e.pr === 'IFB') y += (.5 - y) * .25;
  } else {
    const ln = S.tac.line || 2;
    const line = clamp(bx - .14, .05, [0, .28, .37, .46][ln]);
    const off = DEF_ROLES.includes(role) ? 0 : role === 'DM' ? .1 : ['MC', 'ML', 'MR'].includes(role) ? .2 : role === 'AMC' || role === 'AML' || role === 'AMR' ? .3 : .42;
    x = Math.min(line + off, .72);
    y = .5 + (.07 + across * .86 - .5) * .78 + (by - .5) * .3;
  }
  y = clamp(y, .03, .97);
  return s === 0 ? { x, y } : { x: 1 - x, y: 1 - y };
}

// ---------- plan building ----------
function onPitch(M, s, f) { return M.sides[s].ps.filter(e => e.on && (!f || f(e))); }
function goalX(s) { return s === 0 ? 1 : 0; }
function wpt(s, x, y) { return s === 0 ? { x, y } : { x: 1 - x, y: 1 - y }; }
function buildPlan(LM, SC, evs, poss) {
  const M = LM.M, V = LM.vis, plan = [];
  let holder = SC.holder, hs = holder ? sideOf(V, M, holder) : null;
  const push = (st) => { plan.push(st); return st; };
  const toSide = (s, prefer) => {
    if (holder && hs === s) return;
    const c = onPitch(M, s, x => x.role !== 'GK' && (!prefer || prefer.includes(x.role)));
    const r = c.length ? R.pick(c) : onPitch(M, s)[0];
    push({ k: 'pass', to: r, w: 1, loose: true }); holder = r; hs = s;
  };
  const buildUp = (s, n) => {
    toSide(s, ['DC', 'DM', 'MC', 'DL', 'DR']);
    for (let i = 0; i < n; i++) {
      const cur = holder;
      const c = onPitch(M, s, x => x !== cur && x.role !== 'GK');
      if (!c.length) break;
      const nx = R.wpick(c, x => Math.pow(Math.max(2, x.y - cur.y + 25), 1.6) / (1 + Math.abs(x.x - cur.x) / 30));
      push({ k: 'pass', to: nx, w: 1 }); holder = nx;
    }
  };
  const S = (s) => M.sides[s];
  const passes = (s) => { const p = S(s).tac.pass || 2; return p === 1 ? R.i(3, 5) : p === 3 ? R.i(1, 2) : R.i(2, 3); };
  let goalSeen = false;
  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i];
    if (ev.t === 'shot') {
      const s = ev.side, e = ev.e, ae = ev.ae, gx = goalX(s), dir = s === 0 ? 1 : -1;
      const gy = .5 + (R.f() - .5) * .085;
      let shotFrom;
      if (ev.type === 'pen') {
        push({ k: 'whistle', txt: 'Penalty!', w: .9 });
        shotFrom = wpt(s, .895, .5);
        push({ k: 'place', at: shotFrom, e, w: .9 });
      } else if (ev.type === 'fk') {
        shotFrom = wpt(s, .74 + R.f() * .05, .3 + R.f() * .4);
        push({ k: 'place', at: shotFrom, e, w: .9 });
      } else if (ev.type === 'corner') {
        shotFrom = wpt(s, .9 + R.f() * .03, .4 + R.f() * .2);
        push({ k: 'cross', to: shotFrom, e, w: 1.1 });
      } else if (ev.type === 'header') {
        buildUp(s, Math.max(1, passes(s) - 1));
        const cr = ae || holder; const wing = R.chance(.5) ? .1 : .9;
        if (holder !== cr) { push({ k: 'pass', to: cr, w: 1 }); holder = cr; }
        push({ k: 'carry', e: cr, to: wpt(s, .86, wing), w: 1 });
        shotFrom = wpt(s, .9 + R.f() * .03, .42 + R.f() * .16);
        push({ k: 'cross', to: shotFrom, e, w: 1.1 });
      } else if (ev.type === 'through') {
        buildUp(s, Math.max(1, passes(s) - 1));
        if (ae && holder !== ae) { push({ k: 'pass', to: ae, w: 1 }); holder = ae; }
        shotFrom = wpt(s, .8 + R.f() * .05, .35 + R.f() * .3);
        push({ k: 'pass', to: e, place: shotFrom, w: 1.1, through: true });
        holder = e;
        if (ev.sk) push({ k: 'skill', e, def: ev.def || nearestOpp(SC, M, V, e), sk: ev.sk, w: 1.4 });
        if (ev.st === 'round') push({ k: 'carry', e, to: wpt(s, .93, gy + (R.chance(.5) ? .07 : -.07)), w: 1, roundGk: true });
      } else if (ev.type === 'long') {
        buildUp(s, passes(s));
        shotFrom = wpt(s, .68 + R.f() * .05, .3 + R.f() * .4);
        if (holder !== e) push({ k: 'pass', to: e, place: shotFrom, w: 1 }); else push({ k: 'carry', e, to: shotFrom, w: 1 });
        holder = e;
        if (ev.sk) push({ k: 'skill', e, def: ev.def || nearestOpp(SC, M, V, e), sk: ev.sk, w: 1.4 });
      } else {
        buildUp(s, passes(s));
        if (ev.st === 'solo') {
          if (holder !== e) { push({ k: 'pass', to: e, place: wpt(s, .58, .5 + (R.f() - .5) * .5), w: 1 }); holder = e; }
          push({ k: 'skill', e, def: nearestOpp(SC, M, V, e), sk: ev.sk || 'feint', w: 1.4, far: true });
          push({ k: 'skill', e, def: ev.def || nearestOpp(SC, M, V, e), sk: R.pick(Object.keys(SKILLS)), w: 1.4 });
          shotFrom = null;
        } else {
          shotFrom = wpt(s, ev.st === 'tapin' ? .94 : .82 + R.f() * .05, ev.st === 'tapin' ? gy : .35 + R.f() * .3);
          if (ev.st === 'volley' || ev.st === 'tapin') { const cr = ae || holder; if (holder !== cr) { push({ k: 'pass', to: cr, w: 1 }); holder = cr; } push({ k: 'carry', e: cr, to: wpt(s, .85, R.chance(.5) ? .12 : .88), w: 1 }); push({ k: ev.st === 'tapin' ? 'pass' : 'cross', to: ev.st === 'tapin' ? e : shotFrom, e, place: shotFrom, w: 1.1 }); }
          else { if (holder !== e) push({ k: 'pass', to: e, place: shotFrom, w: 1 }); holder = e; if (ev.sk) push({ k: 'skill', e, def: ev.def || nearestOpp(SC, M, V, e), sk: ev.sk, w: 1.4 }); }
        }
      }
      holder = e; hs = s;
      // the shot itself
      let tgt, h = 0, curve = 0, fast = true;
      const st = ev.st, res = ev.r;
      const posty = gy < .5 ? .455 : .545;
      if (res === 'goal' || res === 'var') tgt = { x: gx + dir * .012, y: st === 'panenka' ? .5 : gy };
      else if (res === 'save') tgt = { x: gx - dir * (ev.det === 'smother' ? .03 : .012), y: ev.det === 'catch' ? .5 + (gy - .5) * .4 : gy };
      else if (ev.det === 'post') tgt = { x: gx, y: posty };
      else if (ev.det === 'wide') tgt = { x: gx + dir * .02, y: .5 + (R.chance(.5) ? 1 : -1) * (.075 + R.f() * .12) };
      else if (ev.det === 'over') { tgt = { x: gx + dir * .02, y: gy }; h = 1.1; }
      else if (ev.det === 'block') { const d = ev.def || nearestOpp(SC, M, V, e); tgt = null; plan.push({ k: 'shot', e, st, res, h: 0, block: d, w: .9, side: s, revealAfter: true }); plan.push({ k: 'deflect', to: wpt(s, .97, R.chance(.5) ? .2 : .8), w: .7, out: true }); plan.push({ k: 'idle', w: .5 }); holder = null; continue; }
      else if (ev.det === 'clear') tgt = { x: gx - dir * .004, y: gy };
      if (st === 'chip') h = 1.2; else if (st === 'panenka') h = .55; else if (st === 'fkcurl') { h = .5; curve = (R.chance(.5) ? 1 : -1) * .06; } else if (st === 'curler') curve = (gy > .5 ? 1 : -1) * .05; else if (st === 'screamer') h = .25;
      if (st === 'bicycle') h = .2;
      if (st === 'panenka' || st === 'chip') fast = false;
      const gk = ev.gk || onPitch(M, 1 - s, x => x.role === 'GK')[0];
      const shotStep = push({ k: 'shot', e, st, sk: ev.sk, res, det: ev.det, tgt, h, curve, fast, gk, w: st === 'chip' || st === 'panenka' ? 1.3 : .8, side: s, from: shotFrom, rp: true, pen: ev.type === 'pen' });
      if (res === 'goal' || res === 'var') {
        push({ k: 'net', side: s, w: 1.3, rpEnd: res === 'goal' });
        if (res === 'var') { push({ k: 'var', w: 2.2 }); push({ k: 'whistle', txt: 'NO GOAL', w: .9, big: true }); push({ k: 'pass', to: gk, w: 1 }); holder = gk; hs = 1 - s; }
        else { goalSeen = true; push({ k: 'celebrate', e, side: s, w: 2.4, replayHere: true }); push({ k: 'kickoff', side: 1 - s, w: 1 }); holder = null; }
      } else if (res === 'save') {
        const det = ev.det;
        if (det === 'catch' || det === 'smother') { push({ k: 'save', det, to: null, gk, w: .9 }); holder = gk; hs = 1 - s; }
        else if (det === 'parry') { push({ k: 'save', det, to: wpt(s, .86, gy < .5 ? .25 : .75), gk, w: .9 }); holder = null; }
        else push({ k: 'save', det, to: wpt(s, 1.015, gy < .5 ? .4 : .6), h: .5, gk, w: .9, out: true });
      } else if (ev.det === 'post') { push({ k: 'post', to: wpt(s, .86, posty < .5 ? .3 : .7), w: .9 }); }
      else if (ev.det === 'clear') { const d = ev.def || nearestOpp(SC, M, V, e); shotStep.clearBy = d; push({ k: 'deflect', to: wpt(s, 1.015, gy < .5 ? .2 : .8), w: .8, out: true, txt: 'Cleared off the line!', def: d }); }
      else push({ k: 'out', txt: ev.det === 'over' ? 'Over' : 'Wide', w: .7 });
      shotStep.revealAfter = true;
    } else if (ev.t === 'corner') {
      const s = ev.side; const y = R.chance(.5) ? 0 : 1; const flag = wpt(s, 1, y);
      const tk = onPitch(M, s, x => ['AML', 'AMR', 'MR', 'ML', 'MC', 'AMC'].includes(x.role))[0] || onPitch(M, s)[1];
      push({ k: 'place', at: flag, e: tk, w: .8, txt: 'Corner' }); holder = tk; hs = s;
      const nx = evs[i + 1];
      if (!(nx && nx.t === 'shot' && nx.type === 'corner')) { const d = onPitch(M, 1 - s, x => x.role === 'DC')[0] || onPitch(M, 1 - s)[1]; push({ k: 'cross', to: wpt(s, .9, .5), e: d, w: 1 }); push({ k: 'header', e: d, to: wpt(s, .62, .3 + R.f() * .4), w: .8 }); holder = null; }
    } else if (ev.t === 'foul') {
      const vs = 1 - ev.side; buildUp(vs, 1);
      push({ k: 'foul', e: ev.e, v: holder, w: .9 });
      push({ k: 'whistle', txt: ev.card === 'y' ? 'Yellow card' : ev.card ? 'Red card' : 'Foul', card: ev.card, w: ev.card ? 1.3 : .8 });
    } else if (ev.t === 'off') {
      const s = ev.side; buildUp(s, 1);
      const r = onPitch(M, s, x => x.role === 'FC' || x.role === 'AML' || x.role === 'AMR')[0];
      if (r) push({ k: 'pass', to: r, place: wpt(s, .82, .3 + R.f() * .4), w: 1, through: true, offside: true });
      push({ k: 'whistle', txt: 'Offside', w: .8, offside: s });
      holder = null;
    } else if (ev.t === 'tackle') {
      const as = 1 - ev.side; buildUp(as, 1);
      if (holder !== ev.v && ev.v && ev.v.on) { push({ k: 'pass', to: ev.v, w: 1 }); holder = ev.v; }
      push({ k: 'tackle', e: ev.e, v: holder, w: 1.1 }); holder = ev.e; hs = ev.side;
    } else if (ev.t === 'dribble') {
      buildUp(ev.side, 1);
      if (holder !== ev.e) { push({ k: 'pass', to: ev.e, w: 1 }); holder = ev.e; }
      push({ k: 'skill', e: ev.e, def: ev.def, sk: ev.sk, w: 1.4 });
      const d2 = nearestOpp(SC, M, V, ev.e); if (d2) { push({ k: 'tackle', e: d2, v: ev.e, w: 1 }); holder = d2; hs = 1 - ev.side; }
    }
  }
  if (!plan.length) { buildUp(poss, R.i(2, 4)); }
  return { plan, goal: goalSeen };
}
function nearestOpp(SC, M, V, e) {
  const s = sideOf(V, M, e); const p = SC.pos.get(e) || { x: .5, y: .5 };
  let best = null, bd = 9; for (const o of onPitch(M, 1 - s, x => x.role !== 'GK')) { const q = SC.pos.get(o); if (!q) continue; const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = o; } } return best;
}
function schedulePlan(SC, plan, dur) {
  const sh = SC.t || 0;
  if (sh) { for (const l of SC.fx) l.t0 -= sh; for (const t of SC.trails) t.t0 -= sh; for (const [k, v] of SC.fallen) { if (v - sh <= 0) SC.fallen.delete(k); else SC.fallen.set(k, v - sh); } if (SC.offShow) SC.offShow -= sh; }
  const W = plan.reduce((s, x) => s + (x.w || 1), 0) || 1;
  let t = 0; for (const st of plan) { st.ts = t; t += (st.w || 1) / W * dur; st.te = t; st.done = false; st.entered = false; }
  SC.plan = plan; SC.t = 0; SC.end = t; SC.si = -1; SC.minDur = dur;
  const rv = plan.find(x => x.revealAfter); SC.reveal = rv ? rv.te : plan.some(x => x.k === 'whistle') ? plan.find(x => x.k === 'whistle').ts + 1 : 0;
}
// called once per simulated minute
function visNewMinute(LM, ms) {
  const V = LM.vis, M = LM.M, SC = V.live;
  const evs = M.vis.filter(v => v.min === M.min);
  for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) { if (!V.side.has(e)) V.side.set(e, s); if (e.on && !SC.pos.has(e)) SC.pos.set(e, wpt(s, .5, 1.04)); }
  const poss = M.pside != null ? M.pside : SC.poss;
  const snap = { pos: new Map([...SC.pos].map(([k, v]) => [k, { x: v.x, y: v.y }])), ball: { ...SC.ball }, holder: SC.holder, poss: SC.poss };
  const { plan, goal } = buildPlan(LM, SC, evs, poss);
  const big = evs.some(v => v.t === 'shot');
  const sp = LM.speed;
  let dur = ms;
  if (goal) dur = [6200, 5200, 4300, 3300][sp];
  else if (big) dur = [3600, 2900, 2000, 1300][sp];
  else if (evs.length) dur = Math.max(ms, [2200, 1700, 1100, 700][sp]);
  else dur = Math.max(ms, sp === 3 ? 45 : ms);
  SC.poss = poss; SC.kick = false; SC.ov.clear(); SC.dive = null; SC.net = null;
  schedulePlan(SC, plan, dur);
  SC.hold = evs.length > 0; V.pendingMin = M.min; V.pending = SC.reveal > 0;
  if (goal) {
    const gi = plan.findIndex(x => x.replayHere);
    const ge = M.ev.filter(e => e.t === 'goal' && e.min === M.min).pop();
    const segEnd = plan.findIndex(x => x.rpEnd);
    LM.replays.push({ min: M.min, label: `${M.min}' ${ge ? surname(pnById(M, ge.p)) : 'Goal'}`, snap, plan: plan.slice(0, segEnd + 1).map(x => ({ ...x })), side: ge ? ge.side : 0 });
    if (LM.autoRp !== false) SC.pendingRp = { at: plan[gi].te, idx: LM.replays.length - 1 };
  }
  return dur;
}
function visBusy(LM) { const V = LM.vis; if (!V || LM.view !== '2d' || !V.cv.isConnected) return false; return !!V.rp || (V.live.hold && V.live.t < V.live.end); }

// ---------- replays ----------
function startReplay(LM, idx) {
  const V = LM.vis, M = LM.M, r = LM.replays[idx]; if (!r) return;
  const SC = newScene(V, M, false);
  SC.pos = new Map([...r.snap.pos].map(([k, v]) => [k, { ...v }])); SC.ball = { ...r.snap.ball }; SC.holder = r.snap.holder; SC.poss = r.snap.poss; SC.kick = false;
  const plan = r.plan.map(x => ({ ...x }));
  const W = plan.reduce((s, x) => s + (x.w || 1), 0);
  // slow motion: about 1.4 s per unit, with the final shot slowest
  schedulePlan(SC, plan, clamp(W * 1250, 5200, 11000));
  SC.plan.forEach(st => { if (st.k === 'shot') { const d = st.te - st.ts; st.te += d * .8; } });
  let t = 0; for (const st of SC.plan) { const d = st.te - st.ts; st.ts = t; t += d; st.te = t; } SC.end = t + 900;
  SC.label = r.label; V.rp = SC; V.live.rate = 0;
}
function endReplay(LM) { const V = LM.vis; V.rp = null; V.live.rate = 1; }

// ---------- per-frame update ----------
function stepPos(SC, st) {
  const e = st.e || st.to; return e ? SC.pos.get(e) : null;
}
function enterStep(LM, SC, st) {
  const V = LM.vis, M = SC.M;
  st.entered = true;
  SC.from = { ...SC.ball };
  const lab = (txt, big, col, at) => SC.fx.push({ txt, t0: SC.t, life: big ? 2200 : 1300, big, col, at });
  switch (st.k) {
    case 'pass': SC.holder = null; if (st.place) SC.ov.set(st.to, st.place); { const tp = st.place || SC.pos.get(st.to); if (tp) SC.trails.push({ x1: SC.ball.x, y1: SC.ball.y, x2: tp.x, y2: tp.y, t0: SC.t, through: st.through }); } break;
    case 'carry': SC.holder = st.e; SC.ov.set(st.e, st.to); break;
    case 'skill': {
      SC.holder = st.e; const p = SC.pos.get(st.e) || SC.ball; const s = sideOf(V, M, st.e); const dir = s === 0 ? 1 : -1;
      const dp = st.def ? SC.pos.get(st.def) : null;
      st.to = { x: clamp((dp ? dp.x : p.x) + dir * (st.far ? .12 : .07), .03, .97), y: clamp(p.y + (R.f() - .5) * .08, .05, .95) };
      if (dp && st.def) SC.ov.set(st.def, { x: dp.x, y: dp.y + (p.y - dp.y) * .5 });
      SC.ov.set(st.e, st.to); lab(SKILLS[st.sk].toUpperCase(), false, '#45e1f0', st.e); break;
    }
    case 'cross': SC.holder = null; if (st.e && st.to) SC.ov.set(st.e, st.to); SC.trails.push({ x1: SC.ball.x, y1: SC.ball.y, x2: st.to.x, y2: st.to.y, t0: SC.t, air: true }); break;
    case 'place': SC.holder = st.e; SC.ball = { x: st.at.x, y: st.at.y, h: 0 }; SC.from = { ...SC.ball }; if (st.e) { const s = sideOf(V, M, st.e); SC.ov.set(st.e, { x: st.at.x - (s === 0 ? .012 : -.012), y: st.at.y }); SC.pos.set(st.e, { x: st.at.x - (s === 0 ? .03 : -.03), y: st.at.y }); } if (st.txt) lab(st.txt, false, '#fff'); break;
    case 'shot': {
      SC.holder = null;
      const nm = { chip: 'CHIP!', volley: 'VOLLEY!', bicycle: 'BICYCLE KICK!', diving: 'DIVING HEADER!', screamer: 'WHAT A STRIKE!', panenka: 'PANENKA!', fkcurl: 'FREE KICK', curler: 'CURLER' }[st.st];
      if (nm && st.res !== 'miss') lab(nm, false, '#ffd23f', st.e);
      if (st.st === 'bicycle' || st.st === 'diving') SC.fallen.set(st.e, st.te + 500);
      if (st.block) { const bp = SC.pos.get(st.block); const sp = SC.pos.get(st.e) || SC.ball; const s = st.side; st.tgt = { x: sp.x + (s === 0 ? .05 : -.05), y: sp.y }; SC.ov.set(st.block, { x: st.tgt.x + (s === 0 ? .01 : -.01), y: st.tgt.y }); if (bp) SC.pos.set(st.block, { x: bp.x + (st.tgt.x - bp.x) * .7, y: bp.y + (st.tgt.y - bp.y) * .7 }); }
      if (st.clearBy) { SC.ov.set(st.clearBy, { x: st.tgt.x, y: st.tgt.y }); const p = SC.pos.get(st.clearBy); if (p) SC.pos.set(st.clearBy, { x: p.x + (st.tgt.x - p.x) * .6, y: p.y + (st.tgt.y - p.y) * .6 }); }
      if (st.gk && st.tgt && st.res !== 'miss') {
        const gp = SC.pos.get(st.gk) || { x: st.tgt.x, y: .5 };
        let ty = st.tgt.y; if (st.res === 'goal') ty = st.pen || st.st === 'panenka' ? .5 + (R.chance(.5) ? .06 : -.06) : gp.y + (st.tgt.y - gp.y) * (st.st === 'chip' ? .2 : .55);
        const dx = st.det === 'smother' ? (st.side === 0 ? -.035 : .035) : 0;
        SC.dive = { e: st.gk, from: { ...gp }, to: { x: gp.x + dx, y: ty }, t0: st.ts + (st.te - st.ts) * (st.pen ? .15 : .35), t1: st.te, stretch: st.det === 'catch' ? 0 : 1 };
      }
      break;
    }
    case 'net': SC.net = { side: st.side, t0: SC.t }; lab('GOAL!', true, null); if (SC.live) { SND.roar(); V.cheer = { side: st.side === 0 ? 'h' : 'a', t0: performance.now() }; if (V.venue.neutral) V.cheer.side = st.side === 0 ? 'h' : 'a'; } break;
    case 'save': {
      const nm = { dive: 'WHAT A SAVE!', fingertip: 'FINGERTIP SAVE!', catch: 'Saved', parry: 'Parried', smother: 'SMOTHERED!', backpedal: 'TIPPED OVER!' }[st.det];
      lab(nm, false, st.det === 'catch' || st.det === 'parry' ? '#fff' : '#45e1f0');
      if (SC.live) SND.ooh();
      if (!st.to) { const gp = SC.pos.get(st.gk); st.to = gp ? { x: gp.x, y: gp.y } : { ...SC.ball }; }
      break;
    }
    case 'post': lab(SC.ball.y > .48 && SC.ball.y < .52 ? 'OFF THE BAR!' : 'OFF THE POST!', false, '#ffa73d'); if (SC.live) SND.ooh(); break;
    case 'out': lab(st.txt, false, '#fff'); if (SC.live) SND.groan(); break;
    case 'deflect': if (st.txt) lab(st.txt, false, '#45e1f0'); else lab('Blocked', false, '#fff'); if (SC.live) SND.ooh(); break;
    case 'header': SC.holder = null; SC.ov.set(st.e, { ...SC.ball }); break;
    case 'tackle': { const vp = st.v ? SC.pos.get(st.v) : null; if (vp) SC.ov.set(st.e, { x: vp.x, y: vp.y }); SC.holder = null; lab('TACKLE!', false, '#fff'); if (st.v) SC.fallen.set(st.v, st.te + 300); break; }
    case 'foul': { const vp = st.v ? SC.pos.get(st.v) : SC.ball; if (vp && st.e) SC.ov.set(st.e, { x: vp.x, y: vp.y }); if (st.v) SC.fallen.set(st.v, st.te + 900); break; }
    case 'whistle': lab(st.txt, !!st.big, st.card === 'y' ? '#ffd23f' : st.card ? '#ff5f5f' : st.big ? '#ff5f5f' : '#fff'); if (SC.live) SND.whistle(st.card || st.big ? 1 : 1, !!st.card || !!st.big); if (st.offside != null) SC.offShow = SC.t + 1200; break;
    case 'var': lab('VAR CHECK', true, '#ffa73d'); break;
    case 'celebrate': { const s = st.side, flag = wpt(s, .985, R.chance(.5) ? .03 : .97); SC.ov.set(st.e, flag); for (const e of onPitch(M, s, x => x !== st.e && x.role !== 'GK')) { if (R.chance(.7)) SC.ov.set(e, { x: flag.x + (R.f() - .5) * .08 - (s === 0 ? .04 : -.04), y: flag.y + (flag.y < .5 ? .05 : -.05) + (R.f() - .5) * .08 }); } break; }
    case 'kickoff': SC.ov.clear(); SC.kick = true; SC.holder = null; SC.net = null; SC.dive = null; SC.poss = st.side; break;
  }
}
function updateBall(SC, st, f) {
  const B = SC.ball, F = SC.from;
  const ease = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const lerp = (to, e, h) => { B.x = F.x + (to.x - F.x) * e; B.y = F.y + (to.y - F.y) * e; B.h = h || 0; };
  switch (st.k) {
    case 'pass': { const to = st.place || SC.pos.get(st.to) || F; const e = Math.min(1, f * 1.25); lerp(to, ease(e), st.lofted ? Math.sin(Math.PI * e) * .4 : 0); if (f >= .8) SC.holder = st.to; break; }
    case 'cross': case 'header': lerp(st.to, ease(Math.min(1, f * 1.15)), Math.sin(Math.PI * Math.min(1, f * 1.15)) * (st.k === 'header' ? .5 : .9)); if (f >= .9 && st.e && st.k === 'cross') SC.holder = st.e; break;
    case 'shot': {
      const to = st.tgt || F; const e = st.fast ? 1 - Math.pow(1 - f, 2.4) : ease(f);
      lerp(to, e, Math.sin(Math.PI * e) * (st.h || 0));
      if (st.curve) { const nx = -(to.y - F.y), ny = to.x - F.x, L = Math.hypot(nx, ny) || 1; const c = Math.sin(Math.PI * e) * st.curve; B.x += nx / L * c; B.y += ny / L * c; }
      break;
    }
    case 'save': case 'post': case 'deflect': { const to = st.to || F; const e = 1 - Math.pow(1 - Math.min(1, f * 1.3), 2); lerp(to, e, st.h ? Math.sin(Math.PI * e) * st.h : 0); if (st.k === 'save' && !st.out && f >= .95 && (st.det === 'catch' || st.det === 'smother')) SC.holder = st.gk; break; }
    case 'net': { const s = st.side; const to = { x: goalX(s) + (s === 0 ? .02 : -.02), y: F.y }; lerp(to, Math.min(1, f * 3), 0); break; }
    case 'kickoff': lerp({ x: .5, y: .5 }, ease(Math.min(1, f * 1.3)), 0); break;
    case 'idle': case 'whistle': case 'var': case 'celebrate': case 'out': B.h = Math.max(0, B.h - .05); break;
  }
}
function visFrame(LM, ts) {
  const V = LM.vis, M = LM.M, cv = V.cv;
  if (!cv.isConnected) { V.lastTs = ts; return; }
  const W = Math.round(cv.clientWidth || 600), dpr = Math.min(2, window.devicePixelRatio || 1);
  if (V.w !== W || V.dpr !== dpr) { V.w = W; V.dpr = dpr; V.L = layout(V); cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(V.L.H * dpr); cv.style.height = V.L.H + 'px'; buildLayers(V, M); V.cam = { x: W / 2, y: V.L.H / 2, z: 1 }; }
  const dt = Math.min(80, ts - (V.lastTs || ts)); V.lastTs = ts;
  const SC = V.rp || V.live;
  runScene(LM, V.live, dt * V.live.rate);
  if (V.rp) { runScene(LM, V.rp, dt); if (V.rp.t > V.rp.end) endReplay(LM); }
  // automatic replay after a goal celebration
  const L0 = V.live; if (L0.pendingRp && L0.t >= L0.pendingRp.at && !V.rp) { const idx = L0.pendingRp.idx; L0.pendingRp = null; if (LM.view === '2d') startReplay(LM, idx); }
  if (V.pending && V.live.t >= V.live.reveal) { V.pending = false; renderMatch(); return; }
  // heatmap sampling (live scene only)
  if (!V.rp && LM.run && dt > 0) { if ((V.hs = (V.hs || 0) + dt) > 120) { V.hs = 0; heatSample(LM, V.live); } }
  // crowd sound
  if (SC.live && ts - V.lastSnd > 250) { V.lastSnd = ts; const bx = V.live.ball.x; const ex = Math.max(0, Math.abs(bx - .5) - .25) * 1.2; SND.setCrowd(clamp(.05 + (LM.atm || 60) / 900 + ex * .25, 0, .3)); }
  drawScene(LM, SC, ts);
}
function runScene(LM, SC, dt) {
  const V = LM.vis, M = SC.M;
  if (dt > 0) SC.t += dt;
  // steps
  if (SC.plan.length) {
    let i = SC.si;
    while (i + 1 < SC.plan.length && SC.t >= SC.plan[i + 1].ts) { i++; enterStep(LM, SC, SC.plan[i]); }
    if (i >= 0 && i !== SC.si) SC.si = i;
    if (SC.si >= 0) { const st = SC.plan[SC.si]; const f = clamp((SC.t - st.ts) / Math.max(1, st.te - st.ts), 0, 1); updateBall(SC, st, f); }
  }
  const cs = SC.plan[SC.si];
  const moving = cs && SC.t < cs.te && ['shot', 'save', 'post', 'deflect', 'net', 'kickoff', 'cross', 'header', 'pass'].includes(cs.k) && !(cs.k === 'pass' && SC.holder === cs.to);
  if (SC.holder && !moving) {
    const hp = SC.pos.get(SC.holder); if (hp) { const s = sideOf(V, M, SC.holder); let zx = 0, zy = 0; if (cs && cs.k === 'skill' && SC.t < cs.te) { const f = (SC.t - cs.ts) / Math.max(1, cs.te - cs.ts); zy = Math.sin(f * Math.PI * 4) * .014; } SC.ball.x += (hp.x + (s === 0 ? .009 : -.009) + zx - SC.ball.x) * .35; SC.ball.y += (hp.y + zy - SC.ball.y) * .35; SC.ball.h = 0; }
  }
  // players
  const tau = clamp(SC.minDur * .16, 60, 650);
  const k = 1 - Math.exp(-Math.max(0, dt) / tau);
  const pressers = new Set();
  const ps = SC.poss, ds = 1 - ps;
  if (!SC.kick) { const c = onPitch(M, ds, x => x.role !== 'GK').map(e => [e, SC.pos.get(e)]).filter(x => x[1]).sort((a, b) => Math.hypot(a[1].x - SC.ball.x, a[1].y - SC.ball.y) - Math.hypot(b[1].x - SC.ball.x, b[1].y - SC.ball.y)); const n = (M.sides[ds].tac.press || 2) === 3 ? 2 : 1; for (let i = 0; i < n && i < c.length; i++) pressers.add(c[i][0]); }
  const tt = SC.t / 1000;
  for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) {
    if (!e.on) { SC.pos.delete(e); continue; }
    let cur = SC.pos.get(e); if (!cur) { cur = wpt(s, .5, 1.04); SC.pos.set(e, cur); }
    if (SC.fallen.get(e) > SC.t) continue;
    let t = SC.ov.get(e);
    if (!t) {
      t = teamTarget(SC, e, s, V);
      const wob = (hash(String(e.p.id)) % 100) / 100 * 6.28; t.x += Math.sin(tt * .8 + wob) * .005; t.y += Math.cos(tt * .6 + wob) * .008;
      if (SC.holder === e) t = { x: SC.ball.x - (s === 0 ? .009 : -.009), y: SC.ball.y };
      else if (pressers.has(e)) t = { x: SC.ball.x + (s === 0 ? -.02 : .02), y: SC.ball.y + (cur.y < SC.ball.y ? -.015 : .015) };
    }
    if (SC.dive && SC.dive.e === e && SC.t >= SC.dive.t0) { const f = clamp((SC.t - SC.dive.t0) / Math.max(1, SC.dive.t1 - SC.dive.t0), 0, 1); cur.x = SC.dive.from.x + (SC.dive.to.x - SC.dive.from.x) * f; cur.y = SC.dive.from.y + (SC.dive.to.y - SC.dive.from.y) * Math.min(1, f * 1.4); continue; }
    cur.x += (t.x - cur.x) * k; cur.y += (t.y - cur.y) * k;
  }
  // ball trail
  SC.trail.push({ x: SC.ball.x, y: SC.ball.y, h: SC.ball.h }); if (SC.trail.length > 10) SC.trail.shift();
}

// ---------- drawing ----------
function drawScene(LM, SC, ts) {
  const V = LM.vis, M = SC.M, L = V.L, c = V.ctx, dpr = V.dpr, W = L.W, H = L.H;
  const px = (x) => L.ox + x * L.pw, py = (y) => L.oy + y * L.ph;
  // camera
  const follow = V.rp || V.camMode === 'follow';
  const z = V.rp ? 2.1 : follow ? 1.85 : 1;
  const tx = follow ? px(SC.ball.x) : W / 2, ty = follow ? py(SC.ball.y) : H / 2;
  const cam = V.cam; const kk = V.rp ? .12 : .08;
  cam.z += (z - cam.z) * .1; cam.x += (tx - cam.x) * kk; cam.y += (ty - cam.y) * kk;
  const hw = W / (2 * cam.z), hh = H / (2 * cam.z);
  const cx = clamp(cam.x, hw, W - hw), cy = clamp(cam.y, hh, H - hh);
  c.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, dpr * (W / 2 - cx * cam.z), dpr * (H / 2 - cy * cam.z));
  c.drawImage(V.layers.bg, 0, 0, W, H);
  // crowd (jumps when their team scores)
  const ch = V.cheer && (performance.now() - V.cheer.t0) < 3500 ? V.cheer : null;
  const jump = (who) => ch && ch.side === who ? Math.abs(Math.sin(performance.now() / 110)) * -2.2 : 0;
  c.drawImage(V.layers.hf, 0, jump('h'), W, H); c.drawImage(V.layers.af, 0, jump('a'), W, H);
  if (ch) { c.fillStyle = `rgba(255,255,255,${.05 + .05 * Math.sin(performance.now() / 90)})`; if (ch.side === 'h') { c.fillRect(0, 0, W, L.sd); c.fillRect(0, H - L.sd, W, L.sd); c.fillRect(0, 0, L.sd, H); } else c.fillRect(W - L.sd, 0, L.sd, H / 2); }
  // net ripple
  if (SC.net) { const age = SC.t - SC.net.t0; if (age < 1600) { const gx = px(goalX(SC.net.side)), dir = SC.net.side === 0 ? 1 : -1; c.strokeStyle = `rgba(255,255,255,${.9 - age / 1800})`; c.lineWidth = 1.2; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(gx + dir * 2, py(SC.ball.y), 3 + k * 3 + Math.sin(age / 60) * 1.5, dir > 0 ? -1.2 : 1.94, dir > 0 ? 1.2 : 4.34); c.stroke(); } } }
  // pass trails
  SC.trails = SC.trails.filter(t => SC.t - t.t0 < 900);
  for (const t of SC.trails) { const a = 1 - (SC.t - t.t0) / 900; c.strokeStyle = t.air ? `rgba(255,230,140,${a * .55})` : `rgba(255,255,255,${a * .45})`; c.lineWidth = 1.2; c.setLineDash(t.through ? [5, 4] : t.air ? [2, 3] : []); c.beginPath(); c.moveTo(px(t.x1), py(t.y1)); c.lineTo(px(t.x2), py(t.y2)); c.stroke(); }
  c.setLineDash([]);
  // offside line
  const ps = SC.poss, ds = 1 - ps;
  const prog = ps === 0 ? SC.ball.x : 1 - SC.ball.x;
  const stp = SC.plan[SC.si];
  if ((prog > .58 && stp && ['pass', 'carry', 'skill'].includes(stp.k)) || (SC.offShow && SC.t < SC.offShow)) {
    const xs = onPitch(M, ds).map(e => SC.pos.get(e)).filter(Boolean).map(p => p.x).sort((a, b) => ds === 1 ? b - a : a - b);
    if (xs.length > 1) { const lx = px(xs[1]); c.strokeStyle = 'rgba(255,214,90,.6)'; c.setLineDash([4, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(lx, py(0)); c.lineTo(lx, py(1)); c.stroke(); c.setLineDash([]); }
  }
  // players
  const r = Math.max(4.5, Math.min(11, L.pw / 66));
  for (let s = 0; s < 2; s++) {
    const kit = V.kits[s];
    for (const e of M.sides[s].ps) {
      if (!e.on) continue; const p = SC.pos.get(e); if (!p) continue;
      const X = px(p.x), Y = py(p.y), gk = e.role === 'GK';
      const fallen = SC.fallen.get(e) > SC.t;
      const diving = SC.dive && SC.dive.e === e && SC.t >= SC.dive.t0 && SC.t < SC.dive.t1 + 500 && SC.dive.stretch;
      c.fillStyle = 'rgba(0,0,0,.33)'; c.beginPath(); c.ellipse(X + 1.5, Y + 2, r * (fallen ? 1.4 : 1), r * (fallen ? .6 : 1), 0, 0, 6.29); c.fill();
      c.beginPath();
      if (fallen) c.ellipse(X, Y, r * 1.35, r * .62, .3, 0, 6.29);
      else if (diving) c.ellipse(X, Y, r * .7, r * 1.6, 0, 0, 6.29);
      else c.arc(X, Y, r, 0, 6.29);
      c.fillStyle = gk ? (s ? '#e9e04a' : '#4ad3ea') : kit.body; c.fill();
      c.lineWidth = Math.max(1.2, r * .22); c.strokeStyle = gk ? '#111' : kit.trim; c.stroke();
      if (e.yc && !e.rc) { c.fillStyle = '#ffd23f'; c.fillRect(X + r - 2, Y - r - 3, 3.5, 5); }
      if (r >= 6.5 && !fallen && !diving) { c.fillStyle = gk ? '#111' : readable(kit.body); c.font = `600 ${Math.round(r * .95)}px "IBM Plex Mono", monospace`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e.p.pseudo ? String(M.sides[s].ps.indexOf(e) % 11 + 1) : String(e.p.no || ''), X, Y + .5); }
      if (SC.holder === e) { c.strokeStyle = `rgba(255,255,255,${.6 + .4 * Math.sin(ts / 140)})`; c.lineWidth = 1.5; c.beginPath(); c.arc(X, Y, r + 3, 0, 6.29); c.stroke(); }
    }
  }
  // holder name
  if (SC.holder && SC.pos.get(SC.holder) && !SC.holder.p.pseudo) { const p = SC.pos.get(SC.holder); const nm = surname(SC.holder.p.n); c.font = `600 ${Math.max(9, r * 1.15)}px "IBM Plex Sans Condensed", Arial`; c.textAlign = 'center'; c.textBaseline = 'bottom'; const tw = c.measureText(nm).width + 8; c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(px(p.x) - tw / 2, py(p.y) - r - 18, tw, 14); c.fillStyle = '#fff'; c.fillText(nm, px(p.x), py(p.y) - r - 5); }
  // ball trail + ball
  const sp = SC.trail.length > 2 ? Math.hypot(SC.trail[SC.trail.length - 1].x - SC.trail[0].x, SC.trail[SC.trail.length - 1].y - SC.trail[0].y) : 0;
  if (sp > .05) SC.trail.forEach((t, i) => { c.fillStyle = `rgba(255,255,255,${i / SC.trail.length * .35})`; c.beginPath(); c.arc(px(t.x), py(t.y) - t.h * r * 3, r * .3, 0, 6.29); c.fill(); });
  const B = SC.ball, br = r * .44 * (1 + B.h * .55), lift = B.h * r * 3.2;
  c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(px(B.x) + 1, py(B.y) + 2, r * .42, r * .3, 0, 0, 6.29); c.fill();
  c.beginPath(); c.arc(px(B.x), py(B.y) - lift, br, 0, 6.29); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#222'; c.stroke();
  // world-anchored labels
  SC.fx = SC.fx.filter(l => SC.t - l.t0 < l.life);
  // ---- screen space ----
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const toScreen = (x, y) => ({ x: (px(x) - cx) * cam.z + W / 2, y: (py(y) - cy) * cam.z + H / 2 });
  // weather
  if (V.wxp.length) {
    const rain = V.meta.wx === 'rain';
    c.strokeStyle = 'rgba(200,215,240,.35)'; c.fillStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1;
    for (const q of V.wxp) {
      if (rain) { q.y += 9 * q.v; q.x -= 2.5 * q.v; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x + 3, q.y - 10); c.stroke(); }
      else { q.y += 1.1 * q.v; q.x += Math.sin((ts / 700) + q.v * 9) * .4; c.beginPath(); c.arc(q.x, q.y, 1.4 * q.v, 0, 6.29); c.fill(); }
      if (q.y > H) { q.y = -10; q.x = Math.random() * (W + 40); } if (q.x < -10) q.x = W + 5;
    }
  }
  for (const l of SC.fx) {
    const age = (SC.t - l.t0) / l.life; const a = age < .8 ? 1 : (1 - age) / .2;
    c.globalAlpha = clamp(a, 0, 1);
    if (l.big) {
      const sz = Math.round(W / 8.5); c.font = `${sz}px VT323, "Courier New", monospace`; c.textAlign = 'center'; c.textBaseline = 'middle';
      const tw = c.measureText(l.txt).width + sz; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(W / 2 - tw / 2, H / 2 - sz * .62, tw, sz * 1.24);
      c.fillStyle = l.col || getComputedStyle(document.documentElement).getPropertyValue('--yel').trim() || '#ffd23f'; c.fillText(l.txt, W / 2, H / 2 + 2);
    } else {
      const p = l.at && SC.pos.get(l.at) ? toScreen(SC.pos.get(l.at).x, SC.pos.get(l.at).y) : toScreen(SC.ball.x, SC.ball.y);
      const sz = Math.max(12, Math.round(W / 40)); c.font = `${sz}px VT323, "Courier New", monospace`; c.textAlign = 'center'; c.textBaseline = 'bottom';
      const y = p.y - 16 - age * 14; const tw = c.measureText(l.txt).width + 10;
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(clamp(p.x, tw / 2, W - tw / 2) - tw / 2, y - sz, tw, sz + 2);
      c.fillStyle = l.col || '#fff'; c.fillText(l.txt, clamp(p.x, tw / 2, W - tw / 2), y + 1);
    }
    c.globalAlpha = 1;
  }
  // corner info
  const fsz = Math.max(10, Math.round(W / 62));
  c.font = `600 ${fsz}px "IBM Plex Sans Condensed", Arial`; c.textAlign = 'left'; c.textBaseline = 'top';
  const info = `${M.sides[0].name} attack →`;
  c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(6, 6, c.measureText(info).width + 12, fsz + 8); c.fillStyle = '#fff'; c.fillText(info, 12, 10);
  const atm = Math.round(LM.atm || 60); const aw = Math.min(110, W * .2);
  c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(W - aw - 12, 6, aw + 6, fsz + 14); c.fillStyle = '#fff'; c.textAlign = 'right'; c.font = `600 ${Math.max(8, fsz - 2)}px "IBM Plex Sans Condensed", Arial`; c.fillText('ATMOSPHERE', W - 9, 8);
  c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(W - aw - 9, fsz + 9, aw, 5); c.fillStyle = atm > 75 ? '#ff5f5f' : atm > 55 ? '#ffd23f' : '#45e1f0'; c.fillRect(W - aw - 9, fsz + 9, aw * atm / 100, 5);
  // replay overlay
  if (V.rp) {
    const bh = H * .07; c.fillStyle = '#000'; c.fillRect(0, 0, W, bh); c.fillRect(0, H - bh, W, bh);
    c.font = `${Math.round(bh * .8)}px VT323, monospace`; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillStyle = Math.floor(ts / 500) % 2 ? '#ff5f5f' : '#fff'; c.fillText('● REPLAY', 12, bh / 2);
    c.fillStyle = '#fff'; c.textAlign = 'right'; c.fillText(`${V.rp.label} · slow motion`, W - 12, bh / 2);
    c.textAlign = 'center'; c.font = `${Math.max(10, Math.round(bh * .45))}px "IBM Plex Sans Condensed", Arial`; c.fillStyle = 'rgba(255,255,255,.7)'; c.fillText('Tap the pitch to skip', W / 2, H - bh / 2);
  }
}

// ---------- heatmap ----------
const HX = 24, HY = 16;
function heatSample(LM, SC) {
  const M = LM.M, ui = uSide(M);
  for (const e of M.sides[ui].ps) {
    if (!e.on || e.p.pseudo) continue; const p = SC.pos.get(e); if (!p) continue;
    let a = LM.heat.get(e.p.id); if (!a) { a = new Float32Array(HX * HY); LM.heat.set(e.p.id, a); }
    const x = ui === 0 ? p.x : 1 - p.x, y = ui === 0 ? p.y : 1 - p.y;
    a[clamp(Math.floor(y * HY), 0, HY - 1) * HX + clamp(Math.floor(x * HX), 0, HX - 1)]++;
  }
}
function heatFor(LM, pid) {
  let a = LM.heat && LM.heat.get(pid);
  if (a && a.reduce((s, v) => s + v, 0) > 60) return a;
  // estimate from role and match flow when the 2D view was not running
  const M = LM.M, ui = uSide(M); const e = M.sides[ui].ps.find(x => x.p.id === pid); if (!e) return null;
  a = new Float32Array(HX * HY);
  const fake = { M, ball: { x: .5, y: .5 }, poss: 0, kick: false, holder: null };
  const rnd = seeded(hash(pid + M.fid));
  for (let i = 0; i < 500; i++) {
    fake.ball = { x: rnd(), y: rnd() }; fake.poss = rnd() < .5 ? 0 : 1;
    const t = teamTarget(fake, e, ui, LM.vis); const x = clamp((ui === 0 ? t.x : 1 - t.x) + (rnd() - .5) * .08, 0, .999), y = clamp((ui === 0 ? t.y : 1 - t.y) + (rnd() - .5) * .1, 0, .999);
    a[Math.floor(y * HY) * HX + Math.floor(x * HX)]++;
  }
  return a;
}
function drawHeat(cv, a) {
  const c = cv.getContext('2d'), W = cv.width, H = cv.height;
  c.fillStyle = '#1b6a37'; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.strokeRect(4, 4, W - 8, H - 8); c.beginPath(); c.moveTo(W / 2, 4); c.lineTo(W / 2, H - 4); c.stroke(); c.beginPath(); c.arc(W / 2, H / 2, H * .13, 0, 6.29); c.stroke();
  c.strokeRect(4, H * .2, W * .15, H * .6); c.strokeRect(W - 4 - W * .15, H * .2, W * .15, H * .6);
  if (!a) return;
  const mx = Math.max(...a) || 1;
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let j = 0; j < HY; j++) for (let i = 0; i < HX; i++) {
    const v = a[j * HX + i] / mx; if (v < .04) continue;
    const x = 4 + (i + .5) * (W - 8) / HX, y = 4 + (j + .5) * (H - 8) / HY, rr = (W - 8) / HX * 1.6;
    const g = c.createRadialGradient(x, y, 0, x, y, rr); const col = v > .66 ? '255,70,40' : v > .33 ? '255,170,40' : '255,235,80';
    g.addColorStop(0, `rgba(${col},${.25 + v * .45})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  c.restore();
  c.fillStyle = 'rgba(255,255,255,.75)'; c.font = '600 11px "IBM Plex Sans Condensed", Arial'; c.textAlign = 'right'; c.fillText('Attacking →', W - 8, H - 8);
}
