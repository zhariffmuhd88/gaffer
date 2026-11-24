// move.js: Phase 11, smarter player movement on and off the ball (2D and 3D matchday).
// Only the picture changes: the result and every event still come from match.js. Each frame we look at the play
// (who has the ball, the next pass, a cross coming in, the defensive lines) and refine where every player wants to be:
//  - attack: forwards on the last defender's shoulder (never offside before the pass), a timed run for a through ball,
//    wingers holding width or the far-side winger tucking in, full-backs overlapping (inverted full-backs underlap),
//    midfielders arriving late in the box, a triangle of support around the ball and a safe pass back;
//  - crosses and cut-backs: near-post, far-post, penalty-spot and edge-of-the-box runs, the striker peeling off his marker;
//  - defending: a flat back line that steps up and drops together (offside trap when set), a compact block that shifts
//    to the ball, pressing triggers from the pressing setting, a cover shadow on the nearest pass, the keeper sweeping.
// The game's attributes shape it: Off the ball, Anticipation and Work rate are read from Creativity, Flair,
// Positioning, Determination and Teamwork (the game has no separate attributes for them); Positioning keeps the line
// tidy; Pace, Stamina and condition set the speed, so tired players jog and arrive late. Tactics count too: width,
// tempo, defensive line, pressing and the offside trap.
// "Movement arrows" (2D and 3D) draw the next intended runs of the user's team; a stamina arrow marks fading players.
// Loaded after md3ds.js.

const MV_DEF = ['DC', 'DL', 'DR', 'WBL', 'WBR'];
const MV_WIDE = ['AML', 'AMR', 'ML', 'MR'];
try { const v = localStorage.getItem('gaffer.mvarrows'); if (v === '1') UI.mvArrows = true; } catch (e) { }
function mvF(p, s) { return s === 0 ? { x: p.x, y: p.y } : { x: 1 - p.x, y: 1 - p.y }; }
function mvA(e) {
  // derived movement attributes (1-20), cached per player
  const p = e.p; if (p._mv && p._mv.k === p.ca) return p._mv;
  let a = null; try { a = p.pseudo ? null : attrs(p); } catch (er) { a = null; }
  const g = (k) => (a && a[k]) || 11;
  const m = { k: p.ca, otb: (g('Cre') * 2 + g('Fla') + g('Fin')) / 4, ant: (g('Pos') * 2 + g('Det') + g('Tea')) / 4, wr: (g('Det') + g('Tea') + g('Sta')) / 3, pos: g('Pos'), pac: g('Pac'), sta: g('Sta') };
  try { Object.defineProperty(p, '_mv', { value: m, enumerable: false, configurable: true, writable: true }); } catch (er) { }
  return m;
}
function mvCond(e) { const c = e.p && e.p.cond; return c == null ? 100 : c; }
function mvFading(e) { return !e.p.pseudo && mvCond(e) < 62; }
// how many players press: the pressing setting, plus one on a trigger (a heavy touch near the line, a pass being received, a back pass)
function mvPressN(SC, M, ds) {
  const pr = M.sides[ds].tac.press || 2; let n = pr === 3 ? 2 : pr === 1 ? 1 : 1;
  const c = SC.mv; if (c && c.trig && pr >= 2) n++;
  return Math.min(3, n);
}
// speed of each player: pace, condition (tired players jog), work rate when tracking back, anticipation
function mvSpeed(SC, e, s) {
  if (SC.kick || e.role === 'GK') return 1;
  const a = mvA(e); const cond = mvCond(e);
  let f = (.86 + a.pac / 140) * (.9 + a.ant / 200);
  f *= cond >= 85 ? 1.04 : cond >= 70 ? .96 : cond >= 55 ? .84 : .7;
  if (SC.poss !== s && !MV_DEF.includes(e.role)) f *= .72 + a.wr / 70; // lazy forwards are slow to track back
  if (SC.poss === s) { const tp = SC.M.sides[s].tac.tempo || 2; f *= 1 + (tp - 2) * .06; }
  return clamp(f * 1.08, .45, 1.2);
}
// the play this frame
function mvCtx(SC) {
  const LM = UI.match, V = LM && LM.vis, M = SC.M; if (!V) return null;
  const P = (e) => SC.pos.get(e);
  const c = { off: [.2, .2], cs: SC.plan[SC.si], sup: new Map(), box: new Map(), cover: new Map(), thr: null, cross: null, trig: false };
  for (let s = 0; s < 2; s++) { const xs = onPitch(M, s).map(e => { const p = P(e); return p ? mvF(p, s).x : null; }).filter(v => v != null).sort((a, b) => a - b); c.off[s] = xs.length > 1 ? xs[1] : .2; }
  // ball moving back towards the attackers' own goal (raw x per second, smoothed)
  const pv = SC.mvPrev; if (pv && SC.t > pv.t) { const inst = (SC.ball.x - pv.x) / ((SC.t - pv.t) / 1000); SC.mvBv = (SC.mvBv || 0) * .9 + clamp(inst, -3, 3) * .1; }
  SC.mvPrev = { x: SC.ball.x, t: SC.t };
  // a through ball coming in the next steps (the receiver times his run with the passer's head up)
  for (let i = Math.max(0, SC.si); i < Math.min(SC.plan.length, SC.si + 4); i++) { const st = SC.plan[i]; if (st.k === 'pass' && st.through && st.ts >= SC.t - 30) { c.thr = st; break; } if (st.k === 'shot' || st.k === 'cross' || st.k === 'goal') break; }
  const cs = c.cs; if (cs && cs.k === 'cross' && SC.t < cs.te + 500) c.cross = { side: SC.poss, ty: cs.to ? cs.to.y : .5 };
  const h = SC.holder && SC.holder.on ? SC.holder : null; const hp = h && P(h);
  if (h && hp) {
    const hs = sideOf(V, M, h); const F = mvF(hp, hs); c.h = { e: h, s: hs, F };
    // pressing triggers
    if (F.y < .1 || F.y > .9 || (cs && cs.k === 'pass' && SC.t > cs.ts + (cs.te - cs.ts) * .6) || ((hs === 0 ? -1 : 1) * (SC.mvBv || 0) > .25 && F.x < .5)) c.trig = true;
    // a wide man in the final third or at the byline: box runs for the cross or the cut-back
    if (F.x > .74 && (F.y < .24 || F.y > .76)) c.cross = c.cross || { side: hs, ty: F.y < .5 ? .62 : .38, pre: true, cut: F.x > .9 };
    // support: a triangle around the ball and a safe pass back
    const mates = onPitch(M, hs, x => x !== h && x.role !== 'GK' && !SC.ov.has(x)).map(e => [e, P(e)]).filter(x => x[1]).map(([e, p]) => [e, mvF(p, hs)]);
    const side = F.y < .5 ? 1 : -1;
    const slots = [{ x: Math.min(.93, F.x + .07), y: clamp(F.y + side * .14, .05, .95) }, { x: Math.max(.04, F.x - .06), y: clamp(F.y - side * .1, .04, .96) }];
    const used = new Set();
    for (const sl of slots) { let best = null, bd = .26; for (const [e, q] of mates) { if (used.has(e)) continue; const d = Math.hypot(q.x - sl.x, q.y - sl.y); if (d < bd) { bd = d; best = e; } } if (best) { used.add(best); c.sup.set(best, sl); } }
    const back = mates.filter(([e, q]) => !used.has(e) && (MV_DEF.includes(e.role) || e.role === 'DM') && q.x < F.x && F.x - q.x < .32).sort((a, b) => Math.hypot(a[1].x - F.x, a[1].y - F.y) - Math.hypot(b[1].x - F.x, b[1].y - F.y))[0];
    if (back && F.x > .25) c.sup.set(back[0], { x: Math.max(.05, F.x - .15), y: .5 + (F.y - .5) * .6 });
    // cover shadow: a defending midfielder stands in the line of the nearest pass
    const ds = 1 - hs; const rec = [...c.sup.keys()][0]; const rp = rec && P(rec);
    if (rp) {
      const n = mvPressN(SC, M, ds); const dl = onPitch(M, ds, x => x.role !== 'GK').map(e => [e, P(e)]).filter(x => x[1]).sort((a, b) => Math.hypot(a[1].x - hp.x, a[1].y - hp.y) - Math.hypot(b[1].x - hp.x, b[1].y - hp.y));
      const cv = dl.slice(n).find(([e]) => !MV_DEF.includes(e.role));
      if (cv) c.cover.set(cv[0], { x: hp.x + (rp.x - hp.x) * .45, y: hp.y + (rp.y - hp.y) * .45 });
    }
  }
  // box runs: near post, far post, penalty spot (cut-back), edge of the box
  if (c.cross) {
    const a = c.cross.side; const near = c.h && c.h.s === a ? (c.h.F.y < .5 ? -1 : 1) : (c.cross.ty < .5 ? 1 : -1);
    const pri = (e) => e.role === 'FC' ? 0 : e.role === 'AMC' ? 1 : MV_WIDE.includes(e.role) ? 2 : e.pr === 'BBM' || e.pr === 'MEZ' ? 2.5 : e.role === 'MC' ? 3 : 9;
    const cand = onPitch(M, a, e => e.role !== 'GK' && !MV_DEF.includes(e.role) && e.role !== 'DM' && e !== (c.h && c.h.e) && !SC.ov.has(e)).sort((x, y) => pri(x) - pri(y) || mvA(y).otb - mvA(x).otb);
    const sl = c.cross.cut ? [{ x: .885, y: .5 }, { x: .945, y: .5 + near * .06 }, { x: .93, y: .5 - near * .09 }, { x: .8, y: .5 }] : [{ x: .945, y: .5 + near * .06 }, { x: .93, y: .5 - near * .09 }, { x: .885, y: .5 }, { x: .8, y: .5 - near * .05 }];
    cand.slice(0, 4).forEach((e, i) => { if (i === 3 && mvA(e).otb < 9) return; const q = { ...sl[i] }; if (e.role === 'FC') q.peel = true; c.box.set(e, q); });
  }
  return c;
}
function mvAdjust(SC, e, s, t, c) {
  const M = SC.M, S = M.sides[s], role = e.role, a = mvA(e);
  const F = mvF(t, s), B = mvF(SC.ball, s);
  const att = SC.poss === s;
  const out = (x, y) => { x = clamp(x, .02, .98); y = clamp(y, .03, .97); return s === 0 ? { x, y } : { x: 1 - x, y: 1 - y }; };
  if (role === 'GK') {
    if (att) return t;
    // the keeper sweeps behind a high line and comes off his line for a ball over the top
    const ln = S.tac.line || 2; let x = F.x;
    if ((ln >= 3 || e.pr === 'SK') && B.x > .45) x = Math.max(x, Math.min(.16, c.off[s] - .12));
    const cs = c.cs; if (cs && cs.k === 'pass' && cs.through && SC.poss !== s && SC.t < cs.te) x = Math.max(x, .09);
    return out(x, F.y);
  }
  if (att) {
    // where the offside line is for us: the second-last defender, the halfway line or the ball, whichever is furthest forward
    const L = Math.max(.5, 1 - c.off[1 - s], B.x);
    let x = F.x, y = F.y;
    const box = c.box.get(e), sup = c.sup.get(e);
    if (box) {
      // late arrival: midfielders hold the edge of the box until the cross is on its way
      const late = !box.peel && (role === 'MC' || e.pr === 'BBM') && c.cross && c.cross.pre && box.x > .85;
      x = late ? .8 : box.x; y = box.y;
      if (box.peel) { // peel off the defender's shoulder
        let nd = null, bd = .12; for (const o of onPitch(M, 1 - s, q => q.role !== 'GK')) { const q = SC.pos.get(o); if (!q) continue; const f = mvF(q, s); const d = Math.hypot(f.x - x, f.y - y); if (d < bd) { bd = d; nd = f; } }
        if (nd) y += (y >= nd.y ? 1 : -1) * .035;
      }
      return out(Math.min(x, L - .004), y);
    }
    if (sup) { x = x + (sup.x - x) * .75; y = y + (sup.y - y) * .75; return out(Math.min(x, L - .004), y); }
    const wide = MV_WIDE.includes(role) && e.pr !== 'IF' && e.pr !== 'IW';
    const ballSide = (B.y - .5) * (F.y - .5) > 0;
    if (role === 'FC' || (role === 'AMC' && e.pr === 'SS') || (MV_WIDE.includes(role) && B.x > .55)) {
      // on the shoulder of the last defender; better movers sit closer to the line
      if (B.x > .4) x = Math.max(x, L - .012 - (20 - a.otb) * .0022);
      // a timed run for the through ball: hold the line, then go as the passer looks up
      const th = c.thr; if (th && th.to === e) { const dt = th.ts - SC.t; if (dt < 1100) { x = L - .004; const pl = th.place ? mvF(th.place, s) : null; if (pl) y += (pl.y - y) * .45; } }
    }
    if (wide) {
      if (ballSide || B.x < .4) y = F.y < .5 ? Math.min(y, .06 + (S.tac.width === 1 ? .06 : 0)) : Math.max(y, .94 - (S.tac.width === 1 ? .06 : 0));
      else y = .5 + (y - .5) * .62; // far-side winger tucks in
    }
    if (['DL', 'DR', 'WBL', 'WBR'].includes(role)) {
      const ov = S.tac.width === 3 || e.pr === 'WB' || e.pr === 'CWB' || role.startsWith('WB') || (S.tac.ment || 3) >= 4;
      if (ballSide && B.x > .55) {
        if (e.pr === 'IFB') { x = Math.max(x, B.x - .06); y = .5 + (F.y - .5) * .45; } // underlap
        else if (ov && a.wr >= 9) { x = Math.max(x, Math.min(B.x + .07, .9)); y = F.y < .5 ? .05 : .95; } // overlap
      }
    }
    if ((role === 'MC' || role === 'AMC') && B.x > .74 && a.otb >= 11) x = Math.max(x, .8 + (a.otb - 11) * .006); // arriving late at the edge of the box
    x = Math.min(x, L - .004);
    return out(x, y);
  }
  // defending
  const cv = c.cover.get(e); if (cv) { const f = mvF(cv, s); return out(F.x + (f.x - F.x) * .8, F.y + (f.y - F.y) * .8); }
  let x = F.x, y = F.y;
  if (MV_DEF.includes(role)) {
    const bv = (s === 0 ? 1 : -1) * (SC.mvBv || 0); // ball moving away from our goal (>0)
    const trap = S.tac.trap === 2;
    if (bv > .2 && B.x > x + .15) x += Math.min(.06, bv * (trap ? .05 : .03)); // step up together
    if (c.thr && SC.poss !== s) x -= .02; // drop for the ball in behind
    x -= (20 - a.pos) * .0012 * ((hash(String(e.p.id)) % 2) ? 1 : .5); // weaker positioning: a little out of line
  } else {
    // compact block: shift across to the ball
    y += (B.y - y) * .18;
  }
  return out(x, y);
}
const _ttMv = teamTarget;
teamTarget = function (SC, e, s, V) {
  const t = _ttMv(SC, e, s, V);
  if (!SC.mv || SC.kick || UI.mvOff) return t;
  try { return mvAdjust(SC, e, s, t, SC.mv); } catch (er) { return t; }
};
const _rsMv = runScene;
runScene = function (LM, SC, dt) {
  if (!SC.tg) SC.tg = new Map();
  try { SC.mv = SC.kick ? null : mvCtx(SC); } catch (er) { SC.mv = null; }
  return _rsMv(LM, SC, dt);
};
// ---------- drawing: movement arrows and stamina badges ----------
function mvUserSide(M) { return G.user == null ? -1 : M.sides[0].tid === G.user ? 0 : M.sides[1].tid === G.user ? 1 : -1; }
function mvDraw2d(LM, SC, c, px, py, r) {
  const M = SC.M, us = mvUserSide(M);
  if (UI.mvArrows && SC.tg && us >= 0) {
    c.save(); c.lineWidth = 1.3; c.strokeStyle = 'rgba(120,230,255,.75)'; c.fillStyle = 'rgba(120,230,255,.75)';
    for (const e of M.sides[us].ps) {
      if (!e.on || e === SC.holder) continue; const p = SC.pos.get(e), t = SC.tg.get(e); if (!p || !t) continue;
      const d = Math.hypot(t.x - p.x, t.y - p.y); if (d < .035) continue;
      const x1 = px(p.x), y1 = py(p.y), x2 = px(t.x), y2 = py(t.y); const an = Math.atan2(y2 - y1, x2 - x1);
      c.setLineDash([4, 3]); c.beginPath(); c.moveTo(x1 + Math.cos(an) * r, y1 + Math.sin(an) * r); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]);
      c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - Math.cos(an - .45) * 6, y2 - Math.sin(an - .45) * 6); c.lineTo(x2 - Math.cos(an + .45) * 6, y2 - Math.sin(an + .45) * 6); c.closePath(); c.fill();
    }
    c.restore();
  }
  // stamina arrows on fading players (both teams)
  for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) {
    if (!e.on || !mvFading(e)) continue; const p = SC.pos.get(e); if (!p) continue;
    const X = px(p.x) - r - 2, Y = py(p.y) - r - 1; const cnd = mvCond(e);
    c.fillStyle = cnd < 45 ? '#ff5a4a' : '#ffb347'; c.beginPath(); c.moveTo(X - 3.5, Y - 3); c.lineTo(X + 3.5, Y - 3); c.lineTo(X, Y + 3); c.closePath(); c.fill();
  }
}
ACT.mmove = () => { UI.mvArrows = !UI.mvArrows; try { localStorage.setItem('gaffer.mvarrows', UI.mvArrows ? '1' : '0'); } catch (e) { } renderMatch(); };
// the button sits with the other pitch controls (2D and 3D)
const _rmMv = renderMatch;
renderMatch = function () {
  const r = _rmMv.apply(this, arguments);
  try {
    const LM = UI.match; const ar = document.querySelector('[data-a="mautorp"]');
    if (LM && ar && !document.querySelector('[data-a="mmove"]')) ar.insertAdjacentHTML('afterend', `<button class="btn ${UI.mvArrows ? 'on' : ''}" data-a="mmove" title="Show where your players are about to run">Movement arrows ${UI.mvArrows ? 'on' : 'off'}</button>`);
  } catch (e) { }
  return r;
};
// 3D: arrows on the grass and a stamina arrow above fading players
function mvTex3(T3, col) { const [cv, x] = cvs(32, 32); x.fillStyle = col; x.beginPath(); x.moveTo(5, 8); x.lineTo(27, 8); x.lineTo(16, 26); x.closePath(); x.fill(); x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 2; x.stroke(); const t = new T3.CanvasTexture(cv); return t; }
function mv3dFrame(LM) {
  const S3 = LM.v3s, T3 = window.THREE, V = LM.vis; if (!S3 || !T3 || !V) return;
  const SC = V.rp || V.live, M = LM.M; if (!SC || !SC.pos) return;
  if (!S3.mv) {
    S3.mv = { ar: [], st: new Map(), tx: [mvTex3(T3, '#ffb347'), mvTex3(T3, '#ff5a4a')] };
    for (let i = 0; i < 11; i++) { const a = new T3.ArrowHelper(new T3.Vector3(1, 0, 0), new T3.Vector3(), 1, 0x78e6ff, .9, .6); a.visible = false; a.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = .85; o.material.depthTest = false; } o.renderOrder = 5; }); S3.scene.add(a); S3.mv.ar.push(a); }
  }
  const us = mvUserSide(M); let k = 0;
  if (UI.mvArrows && us >= 0 && SC.tg && !(S3.fly && !S3.flyDone)) for (const e of M.sides[us].ps) {
    if (k >= S3.mv.ar.length) break; if (!e.on || e === SC.holder) continue; const p = SC.pos.get(e), t = SC.tg.get(e); if (!p || !t) continue;
    const d = Math.hypot(t.x - p.x, t.y - p.y); if (d < .035) continue;
    const a = W3(p), b = W3(t); const dir = new T3.Vector3(b.x - a.x, 0, b.z - a.z); const len = dir.length(); dir.normalize();
    const ar = S3.mv.ar[k++]; ar.position.set(a.x, .15, a.z); ar.setDirection(dir); ar.setLength(len, Math.min(1.4, len * .35), Math.min(.9, len * .25)); ar.visible = true;
  }
  for (; k < S3.mv.ar.length; k++) S3.mv.ar[k].visible = false;
  // stamina arrows
  const seen = new Set();
  for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) {
    if (!e.on || !mvFading(e) || (S3.fly && !S3.flyDone)) continue; const f = S3.figs && S3.figs.get(e); if (!f || !f.g.visible) continue; seen.add(e);
    let sp = S3.mv.st.get(e); const red = mvCond(e) < 45;
    if (!sp) { sp = new T3.Sprite(new T3.SpriteMaterial({ map: S3.mv.tx[red ? 1 : 0], depthTest: false, transparent: true })); sp.scale.set(.9, .9, 1); sp.renderOrder = 6; S3.scene.add(sp); S3.mv.st.set(e, sp); }
    sp.material.map = S3.mv.tx[red ? 1 : 0]; sp.position.set(f.g.position.x, 2.75, f.g.position.z); sp.visible = true;
  }
  for (const [e, sp] of S3.mv.st) if (!seen.has(e)) sp.visible = false;
}
const _f3Mv = frame3d;
frame3d = function (LM, ts) { _f3Mv(LM, ts); try { mv3dFrame(LM); } catch (er) { } };
