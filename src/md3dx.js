// md3dx.js: 3D matchday, Phase 3. Loaded after md3d.js (frame3d and build3d call these helpers).
// A. action poses from the 2D plan step (kicks on passes, crosses and shots; jumps for headers; slide tackles;
//    keeper catches, throws and kicks; throw-ins), a run cycle by speed (walk, jog, sprint), names on shirts,
//    the captain's armband, collar and sleeve trim (in figure()).
// B. a referee and two assistants (flag up for offside), both managers in their technical areas, a fourth official
//    with a substitution board.
// C. a score and clock box, a GOAL banner with the scorer, a live big screen in the stadium, a fly-over before kick-off.
// D. a panelled ball that spins the way it travels, a trail on hard shots, the net ripples on goals.
// Club colours only; no logos or crests. Low quality skips the trail and keeps the rest cheap.

// ---------- textures ----------
function nameTex(T3, name, col) {
  const [c, g] = cvs(256, 64); g.clearRect(0, 0, 256, 64); g.fillStyle = col; g.font = 'bold 40px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const s = String(name || '').toUpperCase().slice(0, 14); let fs = 40; while (fs > 18 && g.measureText(s).width > 240) { fs -= 2; g.font = `bold ${fs}px sans-serif`; }
  g.fillText(s, 128, 34); return new T3.CanvasTexture(c);
}
function ballTex(T3) {
  const [c, g] = cvs(256, 128); g.fillStyle = '#f7f7f7'; g.fillRect(0, 0, 256, 128);
  // a classic panelled look: dark pentagons in a staggered grid, thin seams between the white panels
  const pent = (x, y, r) => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fill(); };
  g.fillStyle = '#16181d';
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) pent(i * 43 + (row % 2 ? 21 : 0), 22 + row * 42, row === 1 ? 11 : 8);
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.2;
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) { const x = i * 43 + (row % 2 ? 21 : 0), y = 22 + row * 42; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 21, y + 21); g.moveTo(x, y); g.lineTo(x - 21, y + 21); g.stroke(); }
  return new T3.CanvasTexture(c);
}
function subTex(T3, outN, inN) {
  const [c, g] = cvs(128, 64); g.fillStyle = '#0b0d14'; g.fillRect(0, 0, 128, 64); g.font = 'bold 34px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#ff3b3b'; g.fillText(String(outN), 34, 34); g.fillStyle = '#39e36b'; g.fillText(String(inN), 94, 34);
  return new T3.CanvasTexture(c);
}
// the live big screen: one canvas shared by every screen in the ground
function liveScreen(T3) {
  const [c, g] = cvs(512, 256); const tex = new T3.CanvasTexture(c);
  return { c, g, tex, txt: null };
}
function drawScreen(S3, M, sc, clock) {
  const L = S3.scr; if (!L) return; const bi = (typeof BADGE_IMG === 'object') ? [BADGE_IMG[M.sides[0].tid], BADGE_IMG[M.sides[1].tid]] : []; const txt = `${M.sides[0].tid}|${sc[0]}|${sc[1]}|${M.sides[1].tid}|${clock}|${!!bi[0]}${!!bi[1]}`; if (L.txt === txt) return; L.txt = txt;
  const g = L.g; g.fillStyle = '#05070f'; g.fillRect(0, 0, 512, 256); g.strokeStyle = '#2b3350'; g.lineWidth = 8; g.strokeRect(4, 4, 504, 248);
  const k = S3.kits; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = k[0].body; g.fillRect(24, 40, 150, 90); g.fillStyle = k[1].body; g.fillRect(338, 40, 150, 90);
  g.font = 'bold 54px sans-serif';
  [[0, 99], [1, 413]].forEach(([i, cx]) => { const im = bi[i]; if (im && im.width) { const s = Math.min(80 / im.width, 80 / im.height); const w = im.width * s, h = im.height * s; try { g.drawImage(im, cx - w / 2, 85 - h / 2, w, h); } catch (e) { } } else { g.fillStyle = k[i].trim; g.fillText(M.sides[i].tid, cx, 88); } });
  g.fillStyle = '#ffffff'; g.font = 'bold 84px sans-serif'; g.fillText(`${sc[0]}-${sc[1]}`, 256, 88);
  g.fillStyle = '#ffd23f'; g.font = 'bold 50px monospace'; g.fillText(clock, 256, 196);
  L.tex.needsUpdate = true;
}

// ---------- officials, managers, fourth official ----------
function refKit(kits) { for (const c of ['#111111', '#f2e600', '#ff3d8b', '#2fd36b', '#00a7e1']) if (colDist(c, kits[0].body) > 110 && colDist(c, kits[1].body) > 110) return c; return '#111111'; }
function addFlag(T3, f, col) {
  const arm = f.g.children.find(c => c.name === 'armR'); if (!arm) return null;
  const fl = new T3.Group(); fl.name = 'flag';
  const st = new T3.Mesh(new T3.CylinderGeometry(.015, .015, .6, 5), new T3.MeshLambertMaterial({ color: '#222' })); st.position.y = -.3; fl.add(st);
  const cl = new T3.Mesh(new T3.PlaneGeometry(.32, .24), new T3.MeshLambertMaterial({ color: col, side: T3.DoubleSide })); cl.position.set(0, -.5, .16); cl.rotation.y = Math.PI / 2; fl.add(cl);
  fl.position.y = -.74; arm.add(fl); return fl;
}
function buildCast3d(S3, LM, T3) {
  const kits = LM.vis.kits; const rk = refKit(kits); const k = { body: rk, trim: rk === '#111111' ? '#444444' : '#111111' };
  const mk = (kit, hairN) => { const g = figure(T3, kit, false, null, 0); g.traverse(o => { if (o.isMesh) o.castShadow = !S3.lo; }); S3.scene.add(g); return { g, last: null, ph: Math.random() * 6, v: 0, n: hairN }; };
  S3.refs = [mk(k, 1), mk(k, 2), mk(k, 3)]; // referee, assistant on the near touchline, assistant on the far one
  S3.refs[0].g.position.set(-6, 0, 8); S3.refs[1].g.position.set(20, 0, -(P3.W / 2 + 1)); S3.refs[2].g.position.set(-20, 0, P3.W / 2 + 1);
  S3.flags = [null, addFlag(T3, S3.refs[1], '#ffd23f'), addFlag(T3, S3.refs[2], '#ff3d3d')];
  // the two managers in their technical areas, in dark suits
  const suit = (c) => ({ body: c, trim: '#15171c' });
  S3.mgrs = [mk(suit('#1d2230'), 2), mk(suit('#2a2a2e'), 0)];
  S3.mgrs.forEach((m, i) => { m.home = { x: i ? 9 : -9, z: -(P3.W / 2 + 2.4) }; m.g.position.set(m.home.x, 0, m.home.z); });
  // the fourth official between the dugouts, with the board hidden until a substitution
  S3.fourth = mk({ body: rk, trim: k.trim }, 1); S3.fourth.g.position.set(0, 0, -(P3.W / 2 + 2.2)); S3.fourth.g.rotation.y = -Math.PI / 2;
  const bd = new T3.Mesh(new T3.PlaneGeometry(.9, .45), new T3.MeshBasicMaterial({ map: subTex(T3, 0, 0) })); bd.position.set(.35, 2.75, 0); bd.rotation.y = -Math.PI / 2; bd.visible = false; S3.fourth.g.add(bd); S3.subBoard = bd;
}
// walking officials: move toward a target with a top speed, run cycle from speed
function walkTo(f, to, dt, vmax, face) {
  const p = f.g.position; const dx = to.x - p.x, dz = to.z - p.z, d = Math.hypot(dx, dz); const step = Math.min(d, vmax * dt / 1000);
  if (d > .05) { p.x += dx / d * step; p.z += dz / d * step; }
  const v = dt > 0 ? step / (dt / 1000) : 0; f.v = f.v * .8 + v * .2;
  const ang = face != null ? face : (d > .3 ? Math.atan2(-dz, dx) : f.g.rotation.y);
  let da = ang - f.g.rotation.y; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; f.g.rotation.y += da * .15;
  gait3d(f, dt); return f.v;
}
// run cycle by speed: walk, jog, sprint (legs and arms swing, the body leans and bobs)
function gait3d(f, dt) {
  const v = Math.min(10, f.v || 0); f.ph += (dt / 1000) * (v < .3 ? 0 : 3 + v * 1.25);
  const amp = v < .3 ? 0 : Math.min(.95, .2 + v * .085); const sw = Math.sin(f.ph) * amp;
  setPose(f, { legs: [-sw, sw], arms: [[0, sw * .9], [0, -sw * .9]], lean: -Math.min(.24, v * .025), lift: v < .3 ? 0 : Math.abs(Math.sin(f.ph)) * Math.min(.08, v * .012) });
}
function setPose(f, P) {
  let li = 0;
  for (const c of f.g.children) {
    if (c.name === 'leg') { c.rotation.z = (P.legs || [0, 0])[li++] || 0; }
    else if (c.name === 'armL' || c.name === 'armR') { const a = (P.arms || [])[c.name === 'armR' ? 1 : 0] || [0, 0]; c.rotation.x = a[0]; c.rotation.z = a[1]; }
  }
  f.g.rotation.z = P.lean || 0; f.g.rotation.x = P.roll || 0; f.g.position.y = P.lift || 0;
}
// the second-last defender of the team defending the goal at sign sg (+1 = the +x goal), for the assistants' line
function offsideLine(S3, sg) {
  const xs = []; let gkSide = null;
  for (const [e, f] of S3.figs) if (f.g.visible && e.role === 'GK' && Math.sign(f.g.position.x) === sg) gkSide = f.sd;
  for (const [e, f] of S3.figs) if (f.g.visible && f.sd === gkSide) xs.push(f.g.position.x * sg);
  xs.sort((a, b) => b - a); return (xs.length > 1 ? xs[1] : 20) * sg;
}
function cast3d(S3, LM, SC, bw, ts, dt) {
  if (!S3.refs) return; const V = LM.vis, M = LM.M;
  // referee: about 12 m from play, on the diagonal, never in the way of the ball
  const ref = S3.refs[0]; const side = bw.z > 0 ? -1 : 1;
  const tgt = { x: Math.max(-P3.L / 2 + 10, Math.min(P3.L / 2 - 10, bw.x - Math.sign(bw.x || 1) * 7)), z: Math.max(-P3.W / 2 + 4, Math.min(P3.W / 2 - 4, bw.z + side * 9)) };
  walkTo(ref, tgt, dt, 7.5, ref.v < .5 ? Math.atan2(-(bw.z - ref.g.position.z), bw.x - ref.g.position.x) : null);
  // assistants: one per half, level with the offside line
  for (const [i, sg] of [[1, 1], [2, -1]]) {
    const a = S3.refs[i]; const lx = Math.max(0, Math.min(P3.L / 2 - 1, Math.max(offsideLine(S3, sg) * sg, bw.x * sg))) * sg;
    walkTo(a, { x: lx, z: (i === 1 ? -1 : 1) * (P3.W / 2 + 1) }, dt, 8, Math.atan2(-(0 - a.g.position.z), 0));
    const up = SC.offShow && SC.t < SC.offShow && Math.sign(bw.x || 1) === sg;
    const arm = a.g.children.find(c => c.name === 'armR'); if (up && arm) { arm.rotation.z = Math.PI * .95; arm.rotation.x = 0; }
    else if (arm) { arm.rotation.x = -.15; }
  }
  // managers pace the technical area and jump when their side scores
  const cs = SC.plan && SC.plan[SC.si];
  S3.mgrs.forEach((m, i) => {
    const sd = i; const party = cs && cs.k === 'celebrate' && cs.side === sd && SC.t < cs.te && !V.rp;
    const ang = Math.atan2(-(0 - m.g.position.z), bw.x - m.g.position.x);
    if (party) { m.g.rotation.y = -Math.PI / 2; setPose(m, { legs: [.2, -.2], arms: [[-2.7, 0], [2.7, 0]], lift: Math.abs(Math.sin(ts / 150 + i)) * .5 }); return; }
    const pace = Math.sin(ts / 3200 + i * 2) * 2.2; walkTo(m, { x: m.home.x + pace, z: m.home.z }, dt, 1.6, Math.abs(m.v) < .4 ? ang : null);
  });
  // fourth official with the board for a substitution
  const fo = S3.fourth; const up = S3.sub && ts - S3.sub.t < 7000;
  S3.subBoard.visible = !!up; const arm = fo.g.children.find(c => c.name === 'armR'); if (arm) { arm.rotation.z = up ? 2.6 : 0; arm.rotation.x = 0; }
  const armL = fo.g.children.find(c => c.name === 'armL'); if (armL) { armL.rotation.z = up ? 2.6 : 0; armL.rotation.x = 0; }
}
// substitutions: a player who was on the pitch goes off and a new one comes on
function subWatch3d(S3, LM, T3, ts) {
  const M = LM.M; if (LM.vis.rp) return;
  for (let s = 0; s < 2; s++) {
    const on = M.sides[s].ps.filter(e => e.on); const prev = S3.onPrev && S3.onPrev[s];
    if (prev) { const inn = on.filter(e => !prev.includes(e)), out = prev.filter(e => !on.includes(e) && !e.red && !e.rc); if (inn.length && out.length) { const no = (e) => e.p.no || (M.sides[s].ps.indexOf(e) + 1); S3.sub = { t: ts, side: s }; try { const old = S3.subBoard.material.map; S3.subBoard.material.map = subTex(T3, no(out[0]), no(inn[0])); S3.subBoard.material.needsUpdate = true; if (old && old.dispose) old.dispose(); } catch (e) { } } }
    (S3.onPrev = S3.onPrev || [])[s] = on;
  }
}

// ---------- player poses from the plan step ----------
function actPose3d(S3, f, e, SC, V, M, ts) {
  const st = SC.plan && SC.plan[SC.si]; if (!st) return null;
  const dt = SC.t - (st.ts || 0); const len = Math.max(1, (st.te || 0) - (st.ts || 0)); const fr = Math.max(0, Math.min(1, dt / len));
  const kickQ = dt / 420;
  const kick = (q, foot) => { // foot 1 = right
    const th = q < .35 ? -.95 * (q / .35) : q < .6 ? -.95 + 2.45 * ((q - .35) / .25) : 1.5 * (1 - (q - .6) / .4);
    const lg = foot ? [-.15, th] : [th, -.15]; return { legs: lg, arms: [[-.7, -.3], [.7, -.3]], lean: q < .6 ? .1 : -.05 };
  };
  const jump = (q) => ({ legs: [-.45, .25], arms: [[-1.1, .6], [1.1, .6]], lift: Math.sin(Math.PI * Math.min(1, q)) * 1.0, lean: -.15 });
  const throwP = (q, both) => { const z = q < .45 ? 3.4 : 3.4 - 2.4 * Math.min(1, (q - .45) / .3); return { legs: [.2, -.2], arms: both ? [[0, z], [0, z]] : [[-.4, -.2], [0, z]], lean: q < .45 ? .12 : -.12 }; };
  const isKicker = S3.kicker === e;
  if ((st.k === 'pass' || st.k === 'cross') && isKicker && kickQ < 1) {
    const p = f.g.position; const wide = Math.abs(p.z) > P3.W / 2 - 1.2;
    if (wide && st.k === 'pass' && SC.from && (SC.from.y < .035 || SC.from.y > .965)) return throwP(kickQ, true); // throw-in
    if (e.role === 'GK') { const to = st.place || SC.pos.get(st.to); const d = to ? Math.hypot(to.x - SC.from.x, to.y - SC.from.y) : 0; if (d < .28) return throwP(kickQ, false); }
    return kick(kickQ, (f.foot | 0));
  }
  if (st.k === 'shot' && st.e === e && kickQ < 1.1) {
    if (st.st === 'diving' || st.st === 'header' || (SC.from && SC.from.h > .2)) return st.st === 'diving' ? null : jump(kickQ * .9);
    if (st.st === 'bicycle') return { legs: [-.4, 2.6], arms: [[-1.2, 0], [1.2, 0]], lean: 1.9 * Math.min(1, kickQ * 2), lift: Math.sin(Math.PI * Math.min(1, kickQ)) * 1.1 };
    return kick(Math.min(1, kickQ), (f.foot | 0));
  }
  if (st.k === 'header' && st.e === e && dt < 520) return jump(dt / 520);
  if (st.k === 'cross' && st.e === e && fr > .72) return jump((fr - .72) / .28);
  if (st.k === 'tackle' && st.e === e && dt < 800) { const q = dt / 800; const k = q < .7 ? 1 : 1 - (q - .7) / .3; return { legs: [.55 * k, 1.35 * k], arms: [[-.8 * k, -.6 * k], [.8 * k, -.6 * k]], lean: 1.1 * k, lift: .12 * k }; }
  if (st.k === 'save' && st.gk === e && dt < 1000 && (st.det === 'catch' || st.det === 'smother' || st.det === 'parry')) return { legs: [.15, -.15], arms: [[-.25, 1.75], [.25, 1.75]], lean: -.1 };
  if (st.k === 'foul' && st.e === e && dt < 600) return { legs: [.2, 1.0], arms: [[-.6, -.4], [.6, -.4]], lean: .25 };
  return null;
}

// ---------- ball spin, trail, net ripple ----------
function ball3d(S3, SC, st, bh, bw, dt) {
  const T3 = S3.T3, b = S3.ball; const prev = S3.bprev; S3.bprev = { x: bw.x, y: bh, z: bw.z };
  if (!prev || dt <= 0) return;
  const dx = bw.x - prev.x, dy = bh - prev.y, dz = bw.z - prev.z; const d = Math.hypot(dx, dz);
  if (d > 1e-4 && d < 30) { try { const ax = new T3.Vector3(dz, 0, -dx).normalize(); b.rotateOnWorldAxis(ax, d / .42); if (st && st.curve) b.rotateOnWorldAxis(new T3.Vector3(0, 1, 0), Math.sign(st.curve) * d * .6); } catch (e) { } }
  // a short trail behind hard, fast shots
  if (!S3.trail) return; const sp = Math.hypot(dx, dy, dz) / (dt / 1000);
  const hot = st && st.k === 'shot' && st.fast !== false && sp > 14 && d < 30;
  S3.tpos.unshift({ x: bw.x, y: bh, z: bw.z, on: hot }); S3.tpos.length = Math.min(S3.tpos.length, S3.trail.length);
  S3.trail.forEach((m, i) => { const p = S3.tpos[i + 1]; if (!p || !p.on) { m.visible = false; return; } m.visible = true; m.position.set(p.x, p.y, p.z); const k = 1 - i / S3.trail.length; m.scale.setScalar(.85 * k + .1); m.material.opacity = .45 * k; });
}
function makeTrail(S3, T3) {
  if (S3.lo) return; S3.tpos = []; S3.trail = [];
  for (let i = 0; i < 12; i++) { const m = new T3.Mesh(new T3.SphereGeometry(.4, 8, 6), new T3.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .4, depthWrite: false })); m.visible = false; S3.scene.add(m); S3.trail.push(m); }
}
function netRipple3d(S3, SC, bw, bh, ts) {
  if (!S3.nets) return;
  if (SC.net && S3.netT0 !== SC.net.t0 + ':' + (SC === S3.sc)) { S3.netT0 = SC.net.t0 + ':' + (SC === S3.sc); S3.rip = { sg: Math.sign(bw.x || 1), z: bw.z, y: Math.max(.3, Math.min(2.3, bh)), t: ts }; }
  for (const n of S3.nets) {
    const r = S3.rip && S3.rip.sg === n.sg ? S3.rip : null; const age = r ? (ts - r.t) / 1000 : 9; if (age > 2.6 && !n.dirty) continue;
    const pa = n.mesh.geometry.attributes.position, a = pa.array, base = n.base; n.dirty = age <= 2.6;
    for (let i = 0; i < pa.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1] + 1.22, bz = base[i * 3 + 2];
      if (age > 2.6) { a[i * 3] = bx; continue; }
      const back = (bx * n.sg + 1) / 2; const dd = Math.hypot(by - r.y, bz - r.z); const amp = .75 * Math.exp(-dd * dd / 2.2) * Math.exp(-age * 1.8) * Math.cos(age * 11 - dd * 2);
      a[i * 3] = bx + n.sg * amp * (.25 + back);
    }
    pa.needsUpdate = true;
  }
}

const sbImg = (tid) => (typeof BADGES === 'object' && BADGES[tid]) ? `<img src="${BADGES[tid]}" alt="">` : '';
// shirt crest from the badge you uploaded (this device only)
function crestTex3(T3, tid) { const im = typeof BADGE_IMG === 'object' && BADGE_IMG[tid]; if (!im) return null; if (!im._t3) { const t = new T3.Texture(im); t.needsUpdate = true; im._t3 = t; } return im._t3; }
// ---------- broadcast graphics: score box, GOAL banner, fly-over title ----------
function bug3d(LM, S3, ts) {
  const w = document.getElementById('p2dwrap'); if (!w) return; const M = LM.M, V = LM.vis;
  let o = w.querySelector('.sb3d'); if (!o) { o = document.createElement('div'); o.className = 'sb3d'; o.setAttribute('aria-hidden', 'true'); w.appendChild(o); }
  const hide = typeof momHide === 'function' && momHide(LM); const sc = hide ? M.score.map((s, i) => s - M.ev.filter(e => e.t === 'goal' && e.side === i && e.min === M.min).length) : M.score;
  const clock = M.done ? 'FT' : M.min === 0 ? 'KO' : (M.min > 90 && !M.et ? '90+' : M.min) + "'";
  const k = V.kits; const flying = S3.fly && !S3.flyDone;
  const h = flying ? `<span class="sbv">${esc(V.venue && V.venue.name || '')}</span>` : `${typeof cLogo === 'function' && cLogo(M.comp, 18) ? `<span class="sbl">${cLogo(M.comp, 18)}</span>` : ''}<span class="sbt" style="background:${k[0].body};color:${k[0].trim}">${sbImg(M.sides[0].tid)}${esc(M.sides[0].tid)}</span><span class="sbs">${sc[0]}-${sc[1]}</span><span class="sbt" style="background:${k[1].body};color:${k[1].trim}">${sbImg(M.sides[1].tid)}${esc(M.sides[1].tid)}</span><span class="sbc">${V.rp ? `REPLAY ${(S3.rpAng | 0) + 1}/3` : clock}</span>`;
  if (o.dataset.h !== h) { o.dataset.h = h; o.innerHTML = h; }
  drawScreen(S3, M, sc, M.done ? 'FULL TIME' : clock);
  // GOAL banner with the scorer (live only)
  let gb = w.querySelector('.gb3d'); if (!gb) { gb = document.createElement('div'); gb.className = 'gb3d'; gb.setAttribute('aria-live', 'polite'); w.appendChild(gb); }
  const SC = V.live;
  if (!V.rp && SC && SC.net && S3.goalT0 !== SC.net.t0) {
    S3.goalT0 = SC.net.t0; let sh = null; for (let i = SC.si; i >= 0; i--) { const s = SC.plan[i]; if (s && s.k === 'shot') { sh = s; break; } }
    if (sh && sh.e) { const s = sh.side != null ? sh.side : 0; gb.innerHTML = `<b>GOAL</b><span>${esc(sh.e.p ? (sh.e.p.n || '') : '')}</span><small style="background:${k[s].body};color:${k[s].trim}">${esc(M.sides[s].tid)}</small>`; S3.goalShow = ts; }
  }
  const on = S3.goalShow && ts - S3.goalShow < 3800; if (gb.classList.contains('on') !== !!on) gb.classList.toggle('on', !!on);
}
// a slow aerial pass over the stadium before kick-off; tap the picture to skip
function fly3d(S3, LM, ts) {
  const M = LM.M; if (S3.flyDone) return null;
  if (!S3.fly) { if (M.min > 1 || LM.vis.rp) { S3.flyDone = true; return null; } S3.fly = ts; try { S3.ren.domElement.addEventListener('pointerdown', () => { S3.flyDone = true; }, { once: true }); } catch (e) { } }
  const q = (ts - S3.fly) / 6500; if (q >= 1 || LM.vis.rp) { S3.flyDone = true; return null; }
  const e = q * q * (3 - 2 * q); const a = -2.3 + e * 1.75; const r = 150 - e * 105, y = 95 - e * 76;
  return { want: { x: Math.cos(a) * r * .9, y, z: Math.sin(a) * r }, look: { x: 0, y: 0, z: 0 } };
}
