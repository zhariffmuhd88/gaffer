// ===== 2D MATCH VIEW =====
// Visual layer only: the engine decides what happens each minute; this draws it.
function colDist(a, b) { const A = hexRgb(a), B = hexRgb(b); return Math.sqrt(A.reduce((s, v, i) => s + (v - B[i]) ** 2, 0)); }
function kitFor(M) {
  const h = T(M.sides[0].tid), a = T(M.sides[1].tid);
  const hk = { body: h.c1 || '#8a8f99', trim: h.c2 || '#ffffff' };
  let ak = { body: a.c1 || '#8a8f99', trim: a.c2 || '#ffffff' };
  if (colDist(hk.body, ak.body) < 120) ak = colDist(hk.body, ak.trim) >= 120 ? { body: ak.trim, trim: ak.body } : { body: lum(hk.body) > .4 ? '#1b1f2e' : '#f2f2f2', trim: ak.body };
  if (colDist(hk.body, ak.body) < 90) ak = { body: lum(hk.body) > .4 ? '#1b1f2e' : '#f2f2f2', trim: '#d0b23c' };
  return [hk, ak];
}
function visInit(LM) {
  const cv = document.createElement('canvas'); cv.className = 'p2d'; cv.setAttribute('aria-label', 'Live 2D match view');
  const V = { cv, ctx: cv.getContext('2d'), pos: new Map(), ball: { x: .5, y: .5 }, plan: [], t0: 0, dur: 1000, poss: 0, flash: null, kits: kitFor(LM.M), w: 0, h: 0, raf: 0 };
  LM.vis = V;
  const loop = (ts) => { if (UI.match !== LM) return; visFrame(LM, ts); V.raf = requestAnimationFrame(loop); };
  V.raf = requestAnimationFrame(loop);
}
// base position of a player (x along pitch 0..1 toward the opponent goal for side 0)
function visBase(e, side, ballX, poss) {
  const depth = e.y / 100, across = e.x / 100;
  let x = .05 + depth * .42;
  if (e.role === 'GK') x = .03;
  const push = poss === side ? .15 : .02;               // attacking team steps up
  const follow = (side === 0 ? ballX : 1 - ballX) - .5;   // whole block shifts with the ball
  if (e.role !== 'GK') x += push + follow * .35; else x += Math.max(0, follow) * .06;
  x = clamp(x, .02, .93);
  let y = .07 + across * .86;
  if (side === 1) { x = 1 - x; y = 1 - y; }
  return { x, y };
}
function holderPos(V, e) { return V.pos.get(e) || { x: .5, y: .5 }; }
function sidePlayers(M, s, filter) { return M.sides[s].ps.filter(e => e.on && (!filter || filter(e))); }
// build the ball's journey for the minute that was just simulated
function visNewMinute(LM, msPerMin) {
  const V = LM.vis, M = LM.M; if (!V) return;
  const evs = (M.vis || []).filter(v => v.min === M.min);
  const poss = M.pside != null ? M.pside : V.poss;
  V.poss = poss;
  const steps = [];
  const pick = (s, roles) => { const c = sidePlayers(M, s, e => !roles || roles.includes(e.role)); return c.length ? R.pick(c) : sidePlayers(M, s)[0]; };
  const attackDir = (s) => s === 0 ? 1 : -1;
  const goalX = (s) => s === 0 ? 1 : 0;
  const main = evs.find(v => v.t === 'shot') || evs.find(v => v.t === 'corner') || evs.find(v => v.t === 'off') || evs.find(v => v.t === 'foul');
  if (main && main.t === 'shot') {
    const s = main.side;
    steps.push({ to: pick(s, ['DM', 'MC', 'DC', 'DL', 'DR']) });
    steps.push({ to: pick(s, ['MC', 'AMC', 'ML', 'MR', 'AML', 'AMR', 'WBL', 'WBR']) });
    const sx = s === 0 ? .82 : .18, sy = .5 + (R.f() - .5) * (main.type === 'long' ? .5 : .3);
    if (main.type === 'header' || main.type === 'corner') { const fy = R.chance(.5) ? .04 : .96; steps.push({ pt: { x: s === 0 ? .97 : .03, y: fy }, kick: 1 }); }
    steps.push({ to: main.e, place: { x: main.type === 'long' ? (s === 0 ? .72 : .28) : main.type === 'pen' ? (s === 0 ? .885 : .115) : sx, y: main.type === 'pen' ? .5 : sy } });
    const gx = goalX(s);
    let end;
    if (main.r === 'goal') end = { x: gx + attackDir(s) * .015, y: .5 + (R.f() - .5) * .07 };
    else if (main.r === 'save') end = { x: s === 0 ? .975 : .025, y: .5 + (R.f() - .5) * .06 };
    else end = { x: gx + attackDir(s) * .02, y: R.chance(.5) ? .5 + (R.f() > .5 ? 1 : -1) * (.07 + R.f() * .12) : .5 + (R.f() - .5) * .08 };
    steps.push({ pt: end, kick: 1, fast: 1, res: main.r, side: s });
  } else if (main && main.t === 'corner') {
    const s = main.side; steps.push({ to: pick(s, ['MC', 'AMC', 'AML', 'AMR']) }); steps.push({ pt: { x: s === 0 ? .995 : .005, y: R.chance(.5) ? .005 : .995 }, kick: 1 }); steps.push({ pt: { x: s === 0 ? .9 : .1, y: .5 + (R.f() - .5) * .2 }, kick: 1 });
  } else if (main && main.t === 'off') {
    const s = main.side; steps.push({ to: pick(s, ['MC', 'DM', 'AMC']) }); steps.push({ pt: { x: s === 0 ? .8 : .2, y: .3 + R.f() * .4 }, kick: 1, whistle: 'Offside' });
  } else if (main && main.t === 'foul') {
    const vs = 1 - main.side; steps.push({ to: pick(vs, ['MC', 'AMC', 'AML', 'AMR', 'FC']) }); steps.push({ whistle: main.card ? (main.card === 'y' ? 'Yellow card' : 'Red card') : 'Foul', stop: 1 });
  } else {
    const s = poss; const n = R.i(2, 4);
    for (let i = 0; i < n; i++) steps.push({ to: pick(s, i < 1 ? ['DC', 'DM', 'MC', 'DL', 'DR', 'GK'] : null) });
  }
  if (M.ev.some(e => e.min === M.min && e.t === 'goal')) steps.push({ kickoff: 1 });
  V.plan = steps; V.t0 = performance.now(); V.dur = Math.max(60, msPerMin * .95); V.si = 0; V.from = { x: V.ball.x, y: V.ball.y };
}
function visFrame(LM, ts) {
  const V = LM.vis, M = LM.M; const cv = V.cv; if (!cv.isConnected) return;
  const W = cv.clientWidth || 600, H = Math.round(W * .64);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (V.w !== W) { V.w = W; V.h = H; cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; V.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  // advance ball along plan
  const n = V.plan.length;
  let target = null, holder = null;
  if (n && LM.run !== undefined) {
    const prog = clamp((ts - V.t0) / V.dur, 0, 1) * n;
    const si = Math.min(n - 1, Math.floor(prog)); const f = prog - si;
    if (si !== V.si) { V.from = { x: V.ball.x, y: V.ball.y }; V.si = si; const st = V.plan[si]; if (st.whistle) V.flash = { txt: st.whistle, t: ts }; }
    const st = V.plan[si];
    if (st.kickoff && f > .3) { target = { x: .5, y: .5 }; }
    else if (st.to) { holder = st.to; const hp = st.place || holderPos(V, st.to); target = hp; if (st.place) V.pos.set(st.to, { x: V.pos.get(st.to) ? V.pos.get(st.to).x + (st.place.x - V.pos.get(st.to).x) * .2 : st.place.x, y: V.pos.get(st.to) ? V.pos.get(st.to).y + (st.place.y - V.pos.get(st.to).y) * .2 : st.place.y }); }
    else if (st.pt) target = st.pt;
    if (target && !st.stop) { const e = st.fast ? 1 - Math.pow(1 - Math.min(1, f * 1.6), 3) : f < .55 ? f / .55 : 1; const k = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; const ee = st.fast ? e : k(e); V.ball.x = V.from.x + (target.x - V.from.x) * ee; V.ball.y = V.from.y + (target.y - V.from.y) * ee; }
    if (st.res && f > .85 && !st.done) { st.done = 1; if (st.res === 'goal') V.flash = { txt: 'GOAL!', t: ts, big: 1, side: st.side }; else if (st.res === 'save') V.flash = { txt: 'Saved', t: ts }; else V.flash = { txt: 'Wide', t: ts }; }
  }
  // move players toward their targets
  const t = ts / 1000;
  for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) {
    if (!e.on) { V.pos.delete(e); continue; }
    let b = visBase(e, s, V.ball.x, V.poss);
    const wob = (hash(String(e.p.id)) % 100) / 100 * 6.28;
    b.x += Math.sin(t * .9 + wob) * .006; b.y += Math.cos(t * .7 + wob) * .01;
    if (holder === e) b = { x: V.ball.x - (s === 0 ? .012 : -.012), y: V.ball.y };
    else if (s !== V.poss && e.role !== 'GK') { const d = Math.hypot(b.x - V.ball.x, b.y - V.ball.y); if (d < .14) { b.x += (V.ball.x - b.x) * .35; b.y += (V.ball.y - b.y) * .35; } }
    const cur = V.pos.get(e) || b;
    const sp = LM.run ? .08 : .03;
    V.pos.set(e, { x: cur.x + (b.x - cur.x) * sp, y: cur.y + (b.y - cur.y) * sp });
  }
  visDraw(LM, ts);
}
function visDraw(LM, ts) {
  const V = LM.vis, M = LM.M, c = V.ctx, W = V.w, H = V.h;
  const px = (x) => 10 + x * (W - 20), py = (y) => 10 + y * (H - 20);
  // grass
  for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#1b6a37' : '#1e7440'; c.fillRect(px(i / 12), 0, (W - 20) / 12 + 1, H); }
  c.fillStyle = '#165a2e'; c.fillRect(0, 0, 10, H); c.fillRect(W - 10, 0, 10, H); c.fillRect(0, 0, W, 10); c.fillRect(0, H - 10, W, 10);
  c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.5;
  c.strokeRect(px(0), py(0), W - 20, H - 20);
  c.beginPath(); c.moveTo(px(.5), py(0)); c.lineTo(px(.5), py(1)); c.stroke();
  c.beginPath(); c.arc(px(.5), py(.5), (H - 20) * .14, 0, 6.29); c.stroke();
  for (const s of [0, 1]) {
    const x0 = s ? px(1) : px(0), dir = s ? -1 : 1;
    c.strokeRect(Math.min(x0, x0 + dir * (W - 20) * .157), py(.2), (W - 20) * .157, (H - 20) * .6);
    c.strokeRect(Math.min(x0, x0 + dir * (W - 20) * .052), py(.37), (W - 20) * .052, (H - 20) * .26);
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(s ? x0 : x0 - 6, py(.44), 6, (H - 20) * .12);
    c.beginPath(); c.arc(px(s ? .895 : .105), py(.5), 2, 0, 6.29); c.fill();
  }
  // players
  const r = Math.max(5, Math.min(11, W / 62));
  for (let s = 0; s < 2; s++) {
    const kit = V.kits[s];
    for (const e of M.sides[s].ps) {
      if (!e.on) continue; const p = V.pos.get(e); if (!p) continue;
      const gk = e.role === 'GK';
      c.beginPath(); c.arc(px(p.x) + 1.5, py(p.y) + 2, r, 0, 6.29); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill();
      c.beginPath(); c.arc(px(p.x), py(p.y), r, 0, 6.29); c.fillStyle = gk ? (s ? '#e8e04a' : '#4ad1e8') : kit.body; c.fill();
      c.lineWidth = 2; c.strokeStyle = gk ? '#111' : kit.trim; c.stroke();
      if (e.yc && !e.rc) { c.fillStyle = '#ffd23f'; c.fillRect(px(p.x) + r - 3, py(p.y) - r - 2, 4, 6); }
      if (e.inj) { c.fillStyle = '#ff5f5f'; c.fillRect(px(p.x) - 2, py(p.y) - r - 6, 4, 4); }
      if (r >= 7) { c.fillStyle = gk ? '#111' : readable(kit.body); c.font = `600 ${Math.round(r * .95)}px "IBM Plex Mono", monospace`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e.p.pseudo ? String((M.sides[s].ps.indexOf(e) % 11) + 1) : String(e.p.no || ''), px(p.x), py(p.y) + .5); }
    }
  }
  // ball
  c.beginPath(); c.arc(px(V.ball.x) + 1, py(V.ball.y) + 2, r * .42, 0, 6.29); c.fillStyle = 'rgba(0,0,0,.4)'; c.fill();
  c.beginPath(); c.arc(px(V.ball.x), py(V.ball.y), r * .42, 0, 6.29); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#222'; c.stroke();
  // labels
  c.font = `600 ${Math.max(11, Math.round(W / 55))}px "IBM Plex Sans Condensed", Arial, sans-serif`; c.textBaseline = 'top';
  c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(14, 14, Math.min(W * .45, 220), 22);
  c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(`${M.sides[0].name} attack →`, 20, 18);
  // flash
  if (V.flash) {
    const age = (ts - V.flash.t) / 1000;
    if (age > (V.flash.big ? 2.2 : 1.1)) V.flash = null;
    else {
      const big = V.flash.big; const sz = big ? Math.round(W / 9) : Math.round(W / 26);
      c.font = `${sz}px VT323, "Courier New", monospace`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.globalAlpha = Math.min(1, (big ? 2.2 : 1.1) - age);
      c.fillStyle = 'rgba(0,0,0,.55)'; const tw = c.measureText(V.flash.txt).width + sz; c.fillRect(W / 2 - tw / 2, H / 2 - sz * .65, tw, sz * 1.3);
      c.fillStyle = big ? (getComputedStyle(document.documentElement).getPropertyValue('--yel').trim() || '#ffd23f') : '#fff'; c.fillText(V.flash.txt, W / 2, H / 2);
      c.globalAlpha = 1;
    }
  }
}

Object.assign(ACT, { mview: (v) => { UI.match.view = v; UI.viewPref = v; renderMatch(); } });
