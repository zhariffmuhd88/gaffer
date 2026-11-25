// setp.js: Phase 14. Set pieces and the human side of a match (2D and 3D).
// Free kicks: a wall 9.15 m from the ball (more men the closer it is), the keeper setting it and standing off to the
// open side, the taker's run-up, the wall jumping as the kick is struck. Penalties: run-up from behind the ball (a
// stutter for some takers); the keeper dives the way the engine decided. Penalty shoot-outs are shown on the pitch:
// both teams in the centre circle, each taker's walk to the spot, the kick and the dive from the engine's result.
// Corners: attackers and markers jostle in the box, the taker raises an arm. Injuries: the player stays down, the
// physios run on (a medical buggy for serious ones); he limps for a while or carries on. Added time: the fourth
// official's board. Substitutions: the player going off walks to the halfway line, a high five with his replacement,
// the bench applauds a big name. Touchline: managers appeal decisions, crouch at big chances, shout instructions; the
// bench jumps up for a goal. Positions follow the engine's plan; only the picture changes. Loaded after atmos.js.

const SP_M = 1 / 105, SP_W = 1 / 68; // one metre in pitch units along and across
function spDir(s) { return s === 0 ? 1 : -1; }
// ---------- free kicks ----------
function spWall(LM, SC, st) {
  const M = LM.M, V = LM.vis, tk = st.e; if (!tk) return; const s = sideOf(V, M, tk), d = spDir(s), b = st.at;
  const gx = s === 0 ? 1 : 0, dist = Math.hypot((gx - b.x) * 105, (.5 - b.y) * 68); if (dist > 38) return;
  const n = dist < 22 ? 5 : dist < 28 ? 4 : 3;
  const ux = (gx - b.x) * 105 / dist, uy = (.5 - b.y) * 68 / dist; // unit vector ball -> goal, in metres
  const c = { x: b.x + ux * 9.15 * SP_M, y: b.y + uy * 9.15 * SP_W };
  const def = onPitch(M, 1 - s, e => e.role !== 'GK').map(e => [e, SC.pos.get(e)]).filter(x => x[1]).sort((a, z) => Math.hypot(a[1].x - c.x, a[1].y - c.y) - Math.hypot(z[1].x - c.x, z[1].y - c.y)).slice(0, n).map(x => x[0]);
  const px = -uy, py = ux; const wall = [];
  def.forEach((e, i) => { const o = (i - (n - 1) / 2) * .62 + (b.y < .5 ? .3 : -.3); const p = { x: c.x + px * o * SP_M, y: c.y + py * o * SP_W }; SC.ov.set(e, p); const cur = SC.pos.get(e); if (cur) SC.pos.set(e, { x: cur.x + (p.x - cur.x) * .75, y: cur.y + (p.y - cur.y) * .75 }); wall.push(e); });
  // the keeper lines up the wall, then stands off to the open side
  const gk = onPitch(M, 1 - s, e => e.role === 'GK')[0]; if (gk) SC.ov.set(gk, { x: gx - d * .01, y: .5 + (b.y < .5 ? .045 : -.045) });
  // the taker steps back for his run-up
  SC.ov.set(tk, { x: b.x - d * 4 * SP_M, y: b.y + (b.y < .5 ? -2.5 : 2.5) * SP_W });
  SC.wall = { ps: wall, gk, t0: SC.t, jump: null, side: 1 - s }; LM.wallN = (LM.wallN || 0) + 1;
}
// ---------- corners ----------
function spCorner(LM, SC, st) {
  const M = LM.M, V = LM.vis, tk = st.e; if (!tk) return; const s = sideOf(V, M, tk), d = spDir(s);
  const att = onPitch(M, s, e => e !== tk && e.role !== 'GK' && !['DL', 'DR', 'WBL', 'WBR'].includes(e.role)).sort((a, b) => (a.role === 'DC' ? -1 : 0) - (b.role === 'DC' ? -1 : 0)).slice(0, 5);
  const def = onPitch(M, 1 - s, e => e.role !== 'GK');
  const spots = [[.955, .45], [.95, .55], [.925, .5], [.91, .42], [.905, .6]];
  const pairs = [];
  att.forEach((e, i) => { const [fx, fy] = spots[i]; const p = { x: s === 0 ? fx : 1 - fx, y: fy }; SC.ov.set(e, p);
    const m = def.filter(x => !pairs.some(q => q[1] === x)).sort((a, b) => { const pa = SC.pos.get(a) || p, pb = SC.pos.get(b) || p; return Math.hypot(pa.x - p.x, pa.y - p.y) - Math.hypot(pb.x - p.x, pb.y - p.y); })[0];
    if (m) { SC.ov.set(m, { x: p.x + d * .006, y: p.y + .012 }); pairs.push([e, m]); } });
  SC.jostle = { pairs, until: SC.t + 6000 }; LM.arm13 = { e: tk, until: performance.now() + 1800 }; LM.cornerN = (LM.cornerN || 0) + 1;
}
// ---------- penalties ----------
function spPen(LM, SC, st) {
  const e = st.e; if (!e) return; const s = sideOf(LM.vis, LM.M, e), d = spDir(s);
  SC.pk = { e, s, at: { ...st.at }, ts: st.ts, te: st.te, stutter: hash(String(e.p.id) + 'stut') % 3 === 0 };
  SC.ov.set(e, { x: st.at.x - d * 5 * SP_M, y: st.at.y + 1.5 * SP_W }); const p = SC.pos.get(e); if (p) SC.pos.set(e, { x: st.at.x - d * 4.5 * SP_M, y: st.at.y + 1.4 * SP_W });
}
// every frame: run-up timing, the jostle, the shoot-out
function spFrame(LM, SC) {
  const M = LM.M;
  if (M.so) { spShootout(LM, SC); return; }
  const cs = SC.plan[SC.si];
  if (SC.pk) { const k = SC.pk; const f = (SC.t - k.ts) / Math.max(1, k.te - k.ts); const d = spDir(k.s);
    if (cs && cs.k === 'place' && f > .55 && f < 1) { let q = (f - .55) / .45; if (k.stutter) q = q < .45 ? q : q < .7 ? .45 + (q - .45) * .25 : .51 + (q - .7) * 1.63; SC.ov.set(k.e, { x: k.at.x - d * (4.5 - 4.3 * Math.min(1, q)) * SP_M, y: k.at.y + 1.4 * (1 - Math.min(1, q)) * SP_W }); }
    if (!cs || (cs.k !== 'place' && cs.k !== 'shot')) SC.pk = null; }
  if (SC.wall) { if (cs && cs.k === 'shot' && !SC.wall.jump) { SC.wall.jump = SC.t; const tk = cs.e; if (tk) SC.ov.set(tk, { x: SC.ball.x, y: SC.ball.y }); } if (SC.wall.jump && SC.t - SC.wall.jump > 2500) SC.wall = null; if (cs && cs.k === 'kickoff') SC.wall = null; }
  if (SC.jostle) { if (SC.t > SC.jostle.until || (cs && ['shot', 'header', 'kickoff', 'pass'].includes(cs.k) && SC.t > cs.te)) SC.jostle = null; else for (const [a, m] of SC.jostle.pairs) { const pa = SC.pos.get(a), pm = SC.pos.get(m); if (!pa || !pm) continue; const w = Math.sin(SC.t / 180 + a.p.id.length) * .0025; pm.y += w; pa.y -= w * .6; } }
}
// ---------- the shoot-out on the pitch ----------
function spShootout(LM, SC) {
  const M = LM.M, so = M.so, V = LM.vis; SC.kick = true; SC.holder = null;
  const n = so.n; if (SC.soN !== n) { SC.soN = n; SC.soT0 = SC.t; }
  const L = so.last, el = SC.t - (SC.soT0 || 0);
  const spot = { x: 1 - 11 * SP_M, y: .5 };
  const tkE = L ? M.sides[L.s].ps.find(e => e.p.id === L.pid) : null;
  for (let s = 0; s < 2; s++) { const ps = onPitch(M, s); let i = 0; const out = ps.filter(e => e.role !== 'GK');
    for (const e of ps) {
      if (e.role === 'GK') { const def = L ? 1 - L.s : 1 - so.turn; SC.ov.set(e, e === onPitch(M, def, x => x.role === 'GK')[0] ? { x: .997, y: .5 } : { x: .83, y: s ? .78 : .22 }); continue; }
      if (e === tkE && el < 4200) continue;
      const k = out.indexOf(e); SC.ov.set(e, { x: .5 + (s ? 1 : -1) * .012, y: .5 + (k - (out.length - 1) / 2) * .016 }); i++;
    } }
  const aimY = { L: .465, C: .5, R: .535 }, diveY = { L: .462, C: .5, R: .538 };
  if (!L || !tkE) { SC.ball = { x: spot.x, y: spot.y, h: 0 }; return; }
  const gk = onPitch(M, 1 - L.s, x => x.role === 'GK')[0];
  if (el < 1500) { const q = el / 1500; SC.ov.set(tkE, { x: .52 + (spot.x - .02 - .52) * q, y: .5 + (spot.y - .5) * q + .01 }); SC.ball = { x: spot.x, y: spot.y, h: 0 }; }
  else if (el < 2000) { SC.ov.set(tkE, { x: spot.x - .004, y: spot.y }); SC.ball = { x: spot.x, y: spot.y, h: 0 }; if (gk && !SC.soDive) { SC.soDive = n; SC.dive = { e: gk, from: { x: .997, y: .5 }, to: { x: .995, y: diveY[L.dive] }, t0: SC.t + 380, t1: SC.t + 760, stretch: L.dive === 'C' ? 0 : 1 }; } }
  else { const q = Math.min(1, (el - 2000) / 450); let to = { x: 1.0, y: aimY[L.aim], h: L.aim === 'C' ? .25 : .15 };
    if (L.how === 'save') to = { x: .99, y: diveY[L.dive], h: .1 }; else if (L.how === 'wide') to = { x: 1.03, y: L.aim === 'R' ? .565 : .435, h: .1 }; else if (L.how === 'over') to = { x: 1.03, y: aimY[L.aim], h: 1.4 }; else if (L.how === 'post') to = { x: .999, y: L.aim === 'R' ? .538 : .462, h: .2 };
    SC.ball = { x: spot.x + (to.x - spot.x) * q, y: spot.y + (to.y - spot.y) * q, h: to.h * Math.sin(Math.PI * q * .9) };
    if (el > 2600) SC.ov.set(tkE, { x: .52, y: .5 }); if (SC.soDive === n && el > 3500) SC.soDive = null; }
  LM.soShown = n;
}
// ---------- events from the engine: substitutions, injuries, added time ----------
function spEvents(LM, SC) {
  const M = LM.M, V = LM.vis; LM.spSeen = LM.spSeen == null ? M.ev.length : LM.spSeen;
  for (; LM.spSeen < M.ev.length; LM.spSeen++) {
    const ev = M.ev[LM.spSeen]; const S = M.sides[ev.side]; if (!S) continue;
    if (ev.t === 'sub') {
      const off = S.ps.find(e => e.p.id === ev.o), on = S.ps.find(e => e.p.id === ev.p); if (!off) continue;
      const from = SC.pos.get(off) || wpt(ev.side, .5, .5); SC.exit = SC.exit || new Map();
      SC.exit.set(off, { from: { ...from }, to: { x: .5 + (ev.side ? .012 : -.012), y: -.035 }, until: SC.t + 9000, sp: off.inj ? .45 : .8 });
      if (on) SC.pos.set(on, { x: .5 + (ev.side ? .02 : -.02), y: -.035 });
      LM.hi5 = { a: off, b: on, until: performance.now() + 9000 };
      const avg = S.ps.filter(e => e.on).reduce((a, e) => a + (e.p.ca || 100), 0) / Math.max(1, S.ps.filter(e => e.on).length);
      if ((off.p.ca || 0) >= avg + 6 || (off.p.ca || 0) >= 150) LM.applaud = { side: ev.side, until: performance.now() + 7000 };
      LM.subN = (LM.subN || 0) + 1;
    }
    if (ev.t === 'inj') {
      const e = S.ps.find(x => x.p.id === ev.p); if (!e) continue; const serious = (e.injDays || 0) > 21;
      SC.fallen.set(e, SC.t + (serious ? 9000 : 6000)); LM.inj13 = { e, side: ev.side, serious, t0: performance.now(), dur: serious ? 9000 : 6000 };
      SC.limp = SC.limp || new Map(); SC.limp.set(e, SC.t + 30000); LM.injN = (LM.injN || 0) + 1;
    }
  }
  // added time: the fourth official's board at the end of each half
  if ((M.min === 45 || M.min === 90) && LM.boardMin !== M.min && !M.done) { LM.boardMin = M.min; const n = 1 + hash(String(M.fid) + M.min + 'add') % (M.min === 90 ? 6 : 3); LM.board13 = { n, until: performance.now() + 6500 }; spBoard(LM); }
}
function spBoard(LM) {
  const w = document.getElementById('p2dwrap'); if (!w || !LM.board13) return; let el = w.querySelector('.brd14'); if (!el) { w.insertAdjacentHTML('beforeend', '<div class="brd14" aria-label="Added time"></div>'); el = w.querySelector('.brd14'); }
  el.innerHTML = `<span>ADDED TIME</span><b>+${LM.board13.n}</b>`; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 6000);
}
// ---------- hooks ----------
const _enterStep14 = enterStep;
enterStep = function (LM, SC, st) {
  _enterStep14(LM, SC, st);
  try {
    if (st.k === 'place') { if (st.pen != null) spPen(LM, SC, st); else if (st.txt === 'Corner') spCorner(LM, SC, st); else { const nx = SC.plan[SC.plan.indexOf(st) + 1]; if (!nx || nx.k === 'shot') spWall(LM, SC, st); } }
    if (!SC.live || LM.vis.rp) return;
    const now = performance.now();
    if (st.k === 'foul' || (st.k === 'whistle' && st.card)) { const fs = st.e ? sideOf(LM.vis, LM.M, st.e) : SC.poss; LM.mgr13 = { kind: 'appeal', side: fs, until: now + 2200 }; }
    if (st.k === 'shot' && !st.pen) { const p = SC.pos.get(st.e); const s = st.side != null ? st.side : SC.poss; if (p && (s === 0 ? p.x : 1 - p.x) > .83) LM.mgr13 = { kind: 'crouch', side: s, until: now + 1800 }; }
    if (st.k === 'net') LM.bench13 = { side: st.side, until: now + 5000 };
    if (st.k === 'whistle' && st.card && st.card !== 'y' && SC.lastFoul) { const e = SC.lastFoul; const p = SC.pos.get(e) || { x: .5, y: .5 }; SC.exit = SC.exit || new Map(); SC.exit.set(e, { from: { ...p }, to: { x: .5, y: p.y < .5 ? -.035 : 1.035 }, until: SC.t + 14000, sp: .6 }); }
  } catch (er) { console.error(er); }
};
const _runScene14 = runScene;
runScene = function (LM, SC, dt) { try { if (SC.live) spEvents(LM, SC); } catch (er) { console.error(er); } const r = _runScene14(LM, SC, dt); try { spFrame(LM, SC); } catch (er) { console.error(er); } return r; };
// injured players limp for a while
const _mvSpeed14 = mvSpeed;
mvSpeed = function (SC, e, s) { let f = _mvSpeed14(SC, e, s); if (SC.limp && SC.limp.get(e) > SC.t) f *= .55; return f; };
// 2D: a red cross over an injured player, the wall marked
const _mvDraw14 = mvDraw2d;
mvDraw2d = function (LM, SC, c, px, py, r) {
  _mvDraw14(LM, SC, c, px, py, r);
  const I = LM.inj13; if (I && performance.now() - I.t0 < I.dur) { const p = SC.pos.get(I.e); if (p) { const X = px(p.x) + r + 3, Y = py(p.y) - r - 3; c.fillStyle = '#fff'; c.fillRect(X - 6, Y - 6, 12, 12); c.fillStyle = '#e8202a'; c.fillRect(X - 1.6, Y - 4.5, 3.2, 9); c.fillRect(X - 4.5, Y - 1.6, 9, 3.2); } }
};
// ---------- 3D ----------
function spFig(S3, kit, id) { const T3 = S3.T3; const g = figure(T3, kit, false, null, 0, { look: lookOf({ id }), lo: true }); g.traverse(m => { if (m.isMesh) m.castShadow = !S3.lo; }); const f = { g, v: 0, ph: 0 }; S3.scene.add(g); g.visible = false; return f; }
function spBuggy(T3) {
  const g = new T3.Group(); const wM = new T3.MeshLambertMaterial({ color: '#f4f4f4' }), dM = new T3.MeshLambertMaterial({ color: '#222' }), rM = new T3.MeshBasicMaterial({ color: '#e8202a' });
  const body = new T3.Mesh(new T3.BoxGeometry(2.6, .6, 1.3), wM); body.position.y = .6; g.add(body);
  const seat = new T3.Mesh(new T3.BoxGeometry(.8, .7, 1.2), wM); seat.position.set(.7, 1.15, 0); g.add(seat);
  const roof = new T3.Mesh(new T3.BoxGeometry(1.3, .06, 1.3), wM); roof.position.set(.6, 2, 0); g.add(roof);
  for (const z of [-.6, .6]) { const p = new T3.Mesh(new T3.CylinderGeometry(.03, .03, 1, 5), dM); p.position.set(1.1, 1.5, z); g.add(p); }
  const str = new T3.Mesh(new T3.BoxGeometry(1.7, .12, .6), new T3.MeshLambertMaterial({ color: '#ff8a1a' })); str.position.set(-.45, .97, 0); g.add(str);
  for (const [x, z] of [[-.9, .66], [-.9, -.66], [.9, .66], [.9, -.66]]) { const w = new T3.Mesh(new T3.CylinderGeometry(.28, .28, .2, 10), dM); w.rotation.x = Math.PI / 2; w.position.set(x, .28, z); g.add(w); }
  const c1 = new T3.Mesh(new T3.PlaneGeometry(.5, .14), rM); c1.position.set(0, .62, .66); g.add(c1); const c2 = new T3.Mesh(new T3.PlaneGeometry(.14, .5), rM); c2.position.set(0, .62, .661); g.add(c2);
  g.visible = false; return g;
}
function spBoard3(T3, n) { const [cv, x] = cvs(128, 96); x.fillStyle = '#111'; x.fillRect(0, 0, 128, 96); x.fillStyle = '#ff3030'; x.font = 'bold 64px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('+' + n, 64, 52); const m = new T3.Mesh(new T3.PlaneGeometry(.9, .68), new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(cv), side: T3.DoubleSide })); return m; }
function sp3d(S3, LM, SC, ts, dt) {
  const T3 = S3.T3, now = performance.now();
  if (!S3.sp14) { S3.sp14 = { phys: [spFig(S3, { body: '#1d8f4e', trim: '#ffffff' }, 'phys1'), spFig(S3, { body: '#1d8f4e', trim: '#ffffff' }, 'phys2')], buggy: spBuggy(T3), board: null }; S3.scene.add(S3.sp14.buggy); }
  const X = S3.sp14;
  // the wall jumps
  const W = SC.wall; if (W && W.jump) { const q = (SC.t - W.jump) / 650; if (q > 0 && q < 1) for (const e of W.ps) { const f = S3.figs.get(e); if (f) { f.g.position.y += Math.sin(Math.PI * q) * .55; const a = armOf(f, 0), b = armOf(f, 1); if (a) a.rotation.x = -.3; if (b) b.rotation.x = -.3; } } }
  // the corner taker raises an arm
  if (LM.arm13 && now < LM.arm13.until) { const f = S3.figs.get(LM.arm13.e); const a = f && armOf(f, 1); if (a) { a.rotation.z = Math.PI * .9; a.rotation.x = 0; } }
  // physios and the buggy
  const I = LM.inj13; const on = I && now - I.t0 < I.dur + 4000 && !LM.vis.rp;
  if (on) {
    const p = SC.pos.get(I.e); const tw = p ? W3(p) : { x: 0, z: 0 }; const el = now - I.t0; const home = { x: I.side ? 9 : -9, z: -(P3.W / 2 + 2.6) };
    const goBack = el > I.dur;
    X.phys.forEach((f, i) => { f.g.visible = true; const tgt = goBack ? home : { x: tw.x + (i ? .8 : -.8), z: tw.z + .6 };
      const dx = tgt.x - f.g.position.x, dz = tgt.z - f.g.position.z, d = Math.hypot(dx, dz); if (!f.init) { f.g.position.set(home.x + i, 0, home.z); f.init = true; }
      const sp = Math.min(d, 6.5 * dt / 1000); if (d > .05) { f.g.position.x += dx / d * sp; f.g.position.z += dz / d * sp; f.g.rotation.y = Math.atan2(-dz, dx); f.v = 6.5; } else f.v = 0;
      f.dt = dt; try { gait3d(f, dt); } catch (e) { }
      if (d < .3 && !goBack) { f.g.position.y = -.35; f.g.rotation.y = Math.atan2(-(tw.z - f.g.position.z), tw.x - f.g.position.x); } else f.g.position.y = 0; });
    if (I.serious) { const B = X.buggy; B.visible = true; const start = { x: -P3.L / 2 + 2, z: -(P3.W / 2 + 3) }; if (!B.init) { B.position.set(start.x, 0, start.z); B.init = true; }
      const tgt = el > I.dur ? start : { x: tw.x - 2.5, z: tw.z + 1.6 }; const dx = tgt.x - B.position.x, dz = tgt.z - B.position.z, d = Math.hypot(dx, dz); if (d > .1 && el > 1200) { const sp = Math.min(d, 7 * dt / 1000); B.position.x += dx / d * sp; B.position.z += dz / d * sp; B.rotation.y = Math.atan2(-dz, dx); } }
  } else { X.phys.forEach(f => { f.g.visible = false; f.init = false; }); X.buggy.visible = false; X.buggy.init = false; }
  // high five at the halfway line
  const H = LM.hi5; if (H && now < H.until) { const a = H.a && S3.figs.get(H.a), b = H.b && S3.figs.get(H.b); if (a && b && a.g.visible && b.g.visible) { const d = Math.hypot(a.g.position.x - b.g.position.x, a.g.position.z - b.g.position.z); if (d < 2.6) for (const f of [a, b]) { const r = armOf(f, 1); if (r) { r.rotation.z = Math.PI * .85; r.rotation.x = 0; } } } }
  // the bench: applause for a big name, jumping up for a goal
  const ap = LM.applaud && now < LM.applaud.until ? LM.applaud : null, bj = LM.bench13 && now < LM.bench13.until ? LM.bench13 : null;
  for (const o of S3.side3 || []) { if (o.k !== 'sub') continue; const s = o.f.g.position.x < 0 ? 0 : 1; const f = o.f;
    if (bj && bj.side === s) { f.g.position.y = .02 + Math.abs(Math.sin(ts / 160 + f.g.position.x)) * .4; setPose(f, { legs: [0, 0], arms: [[-2.6, .2], [2.6, .2]] }); o.up = true; }
    else if (ap && ap.side === s) { const cl = Math.sin(ts / 90) * .25; setPose(f, { legs: [1.4, 1.4], arms: [[-1.1 - cl, .5], [1.1 + cl, .5]] }); o.up = true; }
    else if (o.up) { f.g.position.y = .32; setPose(f, { legs: [1.4, 1.4], knees: [-1.4, -1.4], arms: [[0, .3], [0, .3]] }); o.up = false; } }
  // managers react
  const R = LM.mgr13; if (R && now < R.until && S3.mgrs) S3.mgrs.forEach((m, i) => {
    if (R.kind === 'appeal') { if (i !== R.side) setPose(m, { legs: [.15, -.15], arms: [[-.4, 1.5], [.4, 1.5]], lean: .05 }); else setPose(m, { arms: [[0, .4], [0, .4]] }); }
    else if (R.kind === 'crouch') { if (i === R.side) setPose(m, { legs: [-1.2, -1.2], knees: [-1.6, -1.6], arms: [[-.8, .9], [.8, .9]], lift: -.45, lean: .25 }); else setPose(m, { arms: [[-2.4, .4], [2.4, .4]] }); } });
  else if (S3.mgrs && !LM.vis.rp) { const sh = Math.floor(ts / 7000) % 2; const m = S3.mgrs[sh]; const ph = (ts % 7000) / 7000; if (ph < .25) { const a = armOf(m, 1); if (a) { a.rotation.z = 1.6; a.rotation.x = -.3; } } }
  // the fourth official's board
  const B = LM.board13; if (B && now < B.until && S3.refs) { if (!X.board || X.boardN !== B.n) { if (X.board) S3.scene.remove(X.board); X.board = spBoard3(T3, B.n); X.boardN = B.n; S3.scene.add(X.board); } X.board.visible = true; X.board.position.set(0, 2.5, -(P3.W / 2 + 1.6)); X.board.rotation.y = 0; }
  else if (X.board) X.board.visible = false;
}
const _cast14 = cast3d;
cast3d = function (S3, LM, SC, bw, ts, dt) { _cast14(S3, LM, SC, bw, ts, dt); try { sp3d(S3, LM, SC, ts, dt); } catch (er) { console.error(er); } };
