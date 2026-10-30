// club.js: stadium details and drawn stadium, facilities, board requests and building works.
// Loaded after champ.js / youth.js, before history.js.

// ---------- stadium model ----------
const STAND_SHARE = [0.31, 0.27, 0.22, 0.20]; // main side, opposite side, home end, other end (game estimate)
const FAC_LBL = ['Basic', 'Basic', 'Basic', 'Basic', 'Adequate', 'Adequate', 'Adequate', 'Average', 'Average', 'Average', 'Good', 'Good', 'Good', 'Very good', 'Very good', 'Excellent', 'Excellent', 'Superb', 'Superb', 'State of the art', 'State of the art'];
function facStart(t, k) {
  const r = t.rep || 60;
  if (k === 'tr') return clamp(Math.round((r - 50) / 2.4), 4, 20);
  const lv = typeof clubYouthLevel === 'function' ? clubYouthLevel(t.id) : 0;
  return clamp(Math.round((r - 52) / 2.6 + lv * 1.5), 4, 20);
}
function ensureStadium(tid) {
  const t = T(tid); if (!t || t.lite) return null;
  if (!t.sdm) {
    const S = STADIA[tid] || {};
    const names = S.st || (typeof STANDS !== 'undefined' && STANDS[tid]) || STANDS_DEF;
    const caps = STAND_SHARE.map(x => Math.round(t.cap * x / 10) * 10);
    caps[0] += t.cap - caps.reduce((a, b) => a + b, 0);
    t.sdm = { st: names.map((n, i) => ({ n, cap: caps[i] })), o: S.o || '-', rec: S.rec || null, pitch: S.pitch || '105 × 68 m', bowl: !!S.bowl, c: !!(S.c || S.bowl), note: S.note || '', hi: null };
  }
  if (!t.fac) t.fac = { tr: facStart(t, 'tr'), yth: facStart(t, 'yth') };
  return t.sdm;
}
function facLvl(k, tid) { const t = T(tid || G.user); if (!t || t.lite) return 10; ensureStadium(t.id); return t.fac[k] || 10; }
function standCapNow(s) { return Math.max(0, s.cap - (s.w ? s.w.red : 0)); }
function syncCap(tid) { const t = T(tid), m = t.sdm; if (!m) return; t.cap = m.st.reduce((a, s) => a + standCapNow(s), 0); }
function ticketYield(t) { return divOf(t.id) === 'CH' ? 8 + t.rep * 0.33 : 20 + t.rep * 0.38; }
function ticketLevel(t) { const y = ticketYield(t); return y >= 52 ? 'Premium' : y >= 44 ? 'High' : y >= 34 ? 'Average' : y >= 26 ? 'Affordable' : 'Low'; }
function homeAttendance(tid) {
  const fs = Object.values(G.fx).filter(f => f.h === tid && f.r && f.att && LEAGUE_COMPS.includes(f.comp));
  if (!fs.length) return null;
  const tot = fs.reduce((a, f) => a + f.att, 0);
  const hi = fs.reduce((m, f) => f.att > m.att ? f : m, fs[0]);
  return { avg: Math.round(tot / fs.length), n: fs.length, hi };
}
function ensureAllStadia() { for (const id of fullTeams()) ensureStadium(id); }

// ---------- drawn stadium (SVG, perspective view from behind the main stand) ----------
function stadiumSvg(tid, opt) {
  const t = T(tid); const m = ensureStadium(tid); if (!m) return '';
  opt = opt || {};
  const c1 = uiCol(t.c1 || '#888'), c2 = t.c2 || '#fff';
  const st = m.st;
  const work = new Set((G.brd && G.brd.proj || []).filter(p => p.tid === tid && p.k === 'exp').map(p => p.si));
  // world in metres: x along the pitch, y towards the far stand, z up
  const PX = 52.5, PY = 34, GAP = 7;
  const dep = (s) => clamp(9 + s.cap / 1000 * 1.05, 9, 34), hgt = (s) => dep(s) * 0.62 + 4;
  const cam = [58, -165, 108], tgt = [0, 6, 0];
  const dv = [tgt[0] - cam[0], tgt[1] - cam[1], tgt[2] - cam[2]]; const dl = Math.hypot(...dv); const d = dv.map(x => x / dl);
  const rl = Math.hypot(d[1], d[0]); const r = [d[1] / rl, -d[0] / rl, 0];
  const up = [r[1] * d[2] - r[2] * d[1], r[2] * d[0] - r[0] * d[2], r[0] * d[1] - r[1] * d[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const pr = (p) => { const v = [p[0] - cam[0], p[1] - cam[1], p[2] - cam[2]]; const z = dot(v, d); return [dot(v, r) / z, -dot(v, up) / z]; };
  const shapes = []; // [kind, points3d, attrs]
  const add = (pts, attrs, kind) => shapes.push([kind || 'poly', pts, attrs]);
  const shade = (c, k) => mix(c, '#000000', k);
  // ground and pitch
  add([[-140, -110, 0], [140, -110, 0], [140, 120, 0], [-140, 120, 0]], 'fill="#161c2c"');
  add([[-PX - GAP, -PY - GAP, 0], [PX + GAP, -PY - GAP, 0], [PX + GAP, PY + GAP, 0], [-PX - GAP, PY + GAP, 0]], 'fill="#17602f"');
  for (let i = 0; i < 12; i++) { const x0 = -PX + i * PX * 2 / 12, x1 = x0 + PX * 2 / 12; add([[x0, -PY, 0], [x1, -PY, 0], [x1, PY, 0], [x0, PY, 0]], `fill="${i % 2 ? '#1d7a3e' : '#1a6d37'}"`); }
  const LN = 'fill="none" stroke="rgba(255,255,255,.75)" stroke-width=".9"';
  add([[-PX, -PY, 0], [PX, -PY, 0], [PX, PY, 0], [-PX, PY, 0]], LN);
  add([[0, -PY, 0], [0, PY, 0]], LN, 'line');
  add(Array.from({ length: 24 }, (_, k) => [9.15 * Math.cos(k / 24 * 6.283), 9.15 * Math.sin(k / 24 * 6.283), 0]), LN);
  for (const sg of [-1, 1]) { add([[sg * PX, -20.16, 0], [sg * (PX - 16.5), -20.16, 0], [sg * (PX - 16.5), 20.16, 0], [sg * PX, 20.16, 0]], LN, 'line'); add([[sg * PX, -3.66, 0], [sg * (PX + 2), -3.66, 0], [sg * (PX + 2), 3.66, 0], [sg * PX, 3.66, 0]], 'fill="none" stroke="#fff" stroke-width="1.2"', 'line'); }
  // stands: st[0] main (near, cut away), st[1] far side, st[2] left end, st[3] right end
  const XI = PX + GAP, YI = PY + GAP;
  const F = st[1], Lf = st[2], Rt = st[3], N = st[0];
  const dF = dep(F), dL = dep(Lf), dR = dep(Rt), dN = dep(N), hF = hgt(F), hL = hgt(Lf), hR = hgt(Rt), hN = hgt(N);
  const seat = (inA, inB, outB, outA, s, i, col) => {
    add([inA, inB, outB, outA], `fill="${col || c1}" stroke="rgba(0,0,0,.45)" stroke-width=".6"`);
    for (let k = 1; k < 7; k++) { const f = k / 7; const a = inA.map((v, j) => v + (outA[j] - v) * f), b = inB.map((v, j) => v + (outB[j] - v) * f); const tier = k === 4 && s.cap > 11000; add([a, b], `stroke="${tier ? c2 : 'rgba(0,0,0,.3)'}" stroke-width="${tier ? 1.5 : .55}" fill="none"`, 'line'); }
    if (work.has(i)) add([inA, inB, outB, outA], 'fill="url(#hatch)" opacity=".92"');
  };
  const roof = (pts) => add(pts, 'fill="rgba(214,224,240,.16)" stroke="rgba(230,238,255,.6)" stroke-width=".8"');
  // far side
  seat([-XI, YI, 1], [XI, YI, 1], [XI, YI + dF, hF], [-XI, YI + dF, hF], F, 1);
  roof([[-XI, YI + dF * .4, hF + 5], [XI, YI + dF * .4, hF + 5], [XI, YI + dF + 1, hF + 6], [-XI, YI + dF + 1, hF + 6]]);
  // far corners
  if (m.c) for (const sg of [-1, 1]) {
    const dE = sg < 0 ? dL : dR, hE = sg < 0 ? hL : hR;
    add([[sg * XI, YI, 1], [sg * XI, YI + dF, hF], [sg * (XI + dE * .75), YI + dF * .75, Math.min(hF, hE)], [sg * (XI + dE), YI, hE]], `fill="${shade(c1, .22)}" stroke="rgba(0,0,0,.45)" stroke-width=".6"`);
    if (m.bowl) roof([[sg * XI, YI + dF * .4, hF + 5], [sg * XI, YI + dF + 1, hF + 6], [sg * (XI + dE + 1), YI, hE + 6], [sg * (XI + dE * .4), YI, hE + 5]]);
  }
  // ends
  seat([-XI, -YI, 1], [-XI, YI, 1], [-XI - dL, YI, hL], [-XI - dL, -YI, hL], Lf, 2, shade(c1, .08));
  seat([XI, YI, 1], [XI, -YI, 1], [XI + dR, -YI, hR], [XI + dR, YI, hR], Rt, 3, shade(c1, .08));
  roof([[-XI - dL * .4, -YI, hL + 5], [-XI - dL * .4, YI, hL + 5], [-XI - dL - 1, YI, hL + 6], [-XI - dL - 1, -YI, hL + 6]]);
  roof([[XI + dR * .4, YI, hR + 5], [XI + dR * .4, -YI, hR + 5], [XI + dR + 1, -YI, hR + 6], [XI + dR + 1, YI, hR + 6]]);
  if (!m.bowl) for (const [x, y, h] of [[-XI - dL - 3, YI + dF + 3, Math.max(hF, hL) + 24], [XI + dR + 3, YI + dF + 3, Math.max(hF, hR) + 24], [-XI - dL - 3, -YI - dN - 3, Math.max(hN, hL) + 24], [XI + dR + 3, -YI - dN - 3, Math.max(hN, hR) + 24]]) { add([[x, y, 0], [x, y, h]], 'stroke="#8f99b3" stroke-width="1.3" fill="none"', 'line'); add([[x - 3, y, h], [x + 3, y, h], [x + 3, y, h + 2.5], [x - 3, y, h + 2.5]], 'fill="#fff6c8"'); }
  // near corners and main stand, cut away so the pitch stays visible
  const near = [];
  if (m.c) for (const sg of [-1, 1]) { const dE = sg < 0 ? dL : dR, hE = sg < 0 ? hL : hR; near.push([[[sg * XI, -YI, 1], [sg * (XI + dE), -YI, hE], [sg * (XI + dE * .75), -YI - dN * .75, Math.min(hN, hE)], [sg * XI, -YI - dN, hN]], `fill="${shade(c1, .3)}" stroke="rgba(0,0,0,.45)" stroke-width=".6"`]); }
  for (const [pts, a] of near) add(pts, a + ' opacity=".55"');
  const n0 = shapes.length;
  seat([XI, -YI, 1], [-XI, -YI, 1], [-XI, -YI - dN, hN], [XI, -YI - dN, hN], N, 0, shade(c1, .15));
  for (let k = n0; k < shapes.length; k++) shapes[k][2] += ' opacity=".5"';
  add([[-XI, -YI - dN, 0], [XI, -YI - dN, 0], [XI, -YI - dN, hN], [-XI, -YI - dN, hN]], 'fill="#1e2333" opacity=".72" stroke="rgba(255,255,255,.25)" stroke-width=".6"');
  // building work: crane next to the stand
  for (const i of work) {
    const b = i === 1 ? [18, YI + dF + 8] : i === 2 ? [-XI - dL - 8, 8] : i === 3 ? [XI + dR + 8, -8] : [-18, -YI - dN - 8];
    add([[b[0], b[1], 0], [b[0], b[1], 62]], 'stroke="#ffd23f" stroke-width="1.8" fill="none"', 'line');
    add([[b[0] - 10, b[1], 60], [b[0] + 34, b[1], 60]], 'stroke="#ffd23f" stroke-width="1.8" fill="none"', 'line');
    add([[b[0] + 26, b[1], 60], [b[0] + 26, b[1], 40]], 'stroke="#ffd23f" stroke-width=".8" fill="none"', 'line');
  }
  // project and fit
  const P2 = shapes.map(([k, pts, a]) => [k, pts.map(pr), a]);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const [, pts] of P2.slice(1)) for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const sc = Math.min(360 / (x1 - x0), 222 / (y1 - y0)); const ox = 200 - (x0 + x1) / 2 * sc, oy = 136 - (y0 + y1) / 2 * sc;
  const S = (p) => [(p[0] * sc + ox).toFixed(1), (p[1] * sc + oy).toFixed(1)];
  let out = '<rect width="400" height="260" fill="#0c1124"/>';
  for (const [k, pts, a] of P2) { const q = pts.map(S); out += k === 'line' ? `<polyline points="${q.map(x => x.join(',')).join(' ')}" ${a}/>` : `<polygon points="${q.map(x => x.join(',')).join(' ')}" ${a}/>`; }
  const lab = (txt, p3, dy) => { const q = S(pr(p3)); const w = txt.length * 2.3; let x = +q[0], an = 'middle'; if (x + w > 394) { x = 394; an = 'end'; } else if (x - w < 6) { x = 6; an = 'start'; } return `<text x="${x.toFixed(1)}" y="${(+q[1] + (dy || 0)).toFixed(1)}" text-anchor="${an}" font-size="9" font-family="IBM Plex Sans Condensed, Arial Narrow, sans-serif" fill="rgba(255,255,255,.88)" stroke="#0c1124" stroke-width="2.6" paint-order="stroke">${esc(txt)}</text>`; };
  if (!opt.small) out += lab(F.n, [0, YI + dF, hF + 6], -6) + lab(Lf.n, [-XI - dL, 0, hL + 6], -6) + lab(Rt.n, [XI + dR, 0, hR + 6], -6) + lab(N.n, [0, -YI - dN, 0], 12);
  const defs = `<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#1a1a1a"/><rect width="3.5" height="7" fill="#ffd23f"/></pattern></defs>`;
  return `<svg viewBox="0 0 400 260" class="stadsvg" role="img" aria-label="Drawn illustration of ${esc(t.stadium)}">${defs}${out}</svg>`;
}

// ---------- board state ----------
function brd() { if (!G.brd) G.brd = { pend: [], cd: {}, n: {}, proj: [], log: [], ny: G.year }; if (G.brd.ny !== G.year) { G.brd.n = {}; G.brd.ny = G.year; } return G.brd; }
const REQ = {
  exp: { n: 'Stand expansion', cd: 150 },
  new: { n: 'New stadium', cd: 240 },
  tb: { n: 'Bigger transfer budget', cd: 90 },
  wb: { n: 'Bigger wage budget', cd: 90 },
  tr: { n: 'Better training facilities', cd: 120 },
  yth: { n: 'Better youth facilities', cd: 120 }
};
function seatCost(div) { return div === 'CH' ? 0.0045 : 0.006; } // £m per new seat (game estimate)
function expOptions(tid) {
  const t = T(tid), m = ensureStadium(tid), div = divOf(tid);
  return m.st.map((s, i) => {
    const sizes = [1500, 3000, 6000].map(add => ({ add, cost: Math.round(add * seatCost(div) * (i >= 2 ? 0.9 : 1) * 10) / 10, months: Math.round(5 + add / 750), red: Math.round(s.cap * 0.45 / 10) * 10 }));
    return { i, s, sizes };
  });
}
function newStadiumOptions(tid) {
  const t = T(tid); const base = Math.round(t.sdm.st.reduce((a, s) => a + s.cap, 0) / 1000) * 1000;
  return [10000, 20000, 30000].map(x => { const cap = Math.max(20000, base + x); return { cap, cost: Math.round(cap * 0.008), months: 34 }; });
}
function facCost(k) { return k === 'tr' ? 12 : 8; }
function activeProj(tid, k) { return brd().proj.find(p => p.tid === tid && (!k || p.k === k)); }
function requestBlocked(k) {
  const B = brd();
  if (B.pend.some(p => p.k === k)) return 'The board is still considering your last request.';
  if (B.cd[k] && B.cd[k] > G.date) return `The board will not discuss this again before ${dNice(B.cd[k], false)}.`;
  if ((k === 'exp' || k === 'new') && B.proj.some(p => p.tid === G.user && (p.k === 'exp' || p.k === 'new'))) return 'A stadium project is already under way.';
  if ((k === 'tr' || k === 'yth') && B.proj.some(p => p.tid === G.user && p.k === k)) return 'That work is already under way.';
  if ((k === 'tr' || k === 'yth') && facLvl(k) >= 20) return 'These facilities are already state of the art.';
  return null;
}
function boardRequest(k, opt) {
  const why = requestBlocked(k); if (why) { toast(why); return; }
  const B = brd();
  B.n[k] = (B.n[k] || 0) + 1;
  const tot = Object.values(B.n).reduce((a, b) => a + b, 0);
  if (tot > 3) G.board = clamp(G.board - 2, 0, 100); // pestering the board costs a little confidence
  B.pend.push({ k, opt: opt || {}, due: addDays(G.date, 2 + R.i(0, 4)), at: G.date });
  autosave(); toast('Request sent. The board will reply in the next few days.'); render();
}
function boardScore(k, opt) {
  const t = userTeam(); const B = brd();
  const reasons = []; let sc = 0;
  const conf = G.board; sc += (conf - 50) * 0.55;
  reasons.push(conf >= 65 ? [1, `Board confidence in you is high (${Math.round(conf)}%).`] : conf >= 45 ? [0, `Board confidence is steady (${Math.round(conf)}%).`] : [-1, `Board confidence is low (${Math.round(conf)}%).`]);
  const games = typeof teamGames === 'function' ? teamGames() : 0;
  if (games >= 6) {
    const pos = userTable().findIndex(r => r.t === G.user) + 1, tgt = boardTarget().pos, d = tgt - pos;
    sc += clamp(d, -8, 8) * 2.2;
    reasons.push(d >= 0 ? [1, `The team is ${ordinal(pos)}, on course for the target.`] : [-1, `The team is ${ordinal(pos)}, behind the target of top ${tgt}.`]);
  } else if (G.hist.length) { const h = G.hist[G.hist.length - 1]; if (h.upos <= 4 || h.promoted) { sc += 6; reasons.push([1, 'Last season went well.']); } }
  sc += (G.mgrRep - 55) * 0.18;
  const asks = (B.n[k] || 1) - 1; if (asks) { sc -= asks * 7; reasons.push([-1, `You have already asked about this ${asks === 1 ? 'once' : asks + ' times'} this season.`]); }
  let cost = 0;
  if (k === 'exp') cost = opt.cost; else if (k === 'new') cost = opt.cost * 0.4; else if (k === 'tr' || k === 'yth') cost = facCost(k);
  if (cost) {
    const f = (t.bal - cost * 0.5) / Math.max(cost, 1);
    sc += clamp(f * 8, -25, 14);
    reasons.push(t.bal >= cost ? [1, `The club can afford it (${money(t.bal)} in the bank, cost ${money(cost)}).`] : t.bal >= cost * 0.4 ? [0, `The cost of ${money(cost)} would stretch the club's finances.`] : [-1, `The club cannot afford ${money(cost)} at the moment (${money(t.bal)} in the bank).`]);
  }
  if (k === 'exp' || k === 'new') {
    const a = homeAttendance(G.user); const fill = a ? a.avg / Math.max(1, t.cap) : (t.rep >= 75 ? .95 : .85);
    sc += (fill - 0.9) * 60;
    reasons.push(fill >= 0.95 ? [1, `Home games are close to sold out (${Math.round(fill * 100)}% full).`] : [-1, `The ground is only ${Math.round(fill * 100)}% full on average.`]);
    if (k === 'new') { sc -= 8; if (t.rep < 70) { sc -= 8; reasons.push([-1, 'The club\'s standing does not yet justify a new stadium.']); } }
  }
  if (k === 'tb') {
    const r = t.tb / Math.max(1, t.bal); sc += t.bal > t.tb * 2 ? 6 : -6;
    reasons.push(t.bal > t.tb * 2 ? [1, 'There is money in the bank beyond the current budget.'] : [-1, 'Most of the club\'s cash is already in the transfer budget.']);
  }
  if (k === 'wb') {
    const use = wageBill(G.user) / Math.max(0.01, t.wb);
    sc += use > 0.95 ? 6 : -10;
    reasons.push(use > 0.95 ? [1, 'The wage bill is at the limit of the budget.'] : [-1, `The wage bill uses only ${Math.round(use * 100)}% of the current budget.`]);
    if (t.bal < 0) { sc -= 12; reasons.push([-1, 'The club is in debt.']); }
  }
  return { sc: sc + R.i(-4, 4), reasons };
}
function boardDecide(req) {
  const { k, opt } = req; const t = userTeam(); const B = brd();
  const { sc, reasons } = boardScore(k, opt);
  const ok = sc >= 0;
  const list = reasons.map(([s, x]) => `${s > 0 ? '+' : s < 0 ? '−' : '·'} ${x}`).join('\n');
  let head = '';
  if (ok) {
    if (k === 'exp') {
      const s = t.sdm.st[opt.si]; s.w = { add: opt.add, red: opt.red };
      B.proj.push({ k, tid: G.user, si: opt.si, add: opt.add, cost: opt.cost, paid: 0, start: G.date, end: addMonths(G.date, opt.months), months: opt.months });
      syncCap(G.user);
      head = `The board has approved a ${opt.add.toLocaleString('en-GB')}-seat expansion of the ${s.n}. Work starts now and should finish around ${monthYear(addMonths(G.date, opt.months))}. The ${s.n} loses about ${opt.red.toLocaleString('en-GB')} seats while the builders are in. Cost: ${money(opt.cost)}, paid monthly.`;
    } else if (k === 'new') {
      B.proj.push({ k, tid: G.user, name: opt.name, cap: opt.cap, cost: Math.round(opt.cost * 0.4), full: opt.cost, paid: 0, start: G.date, end: addMonths(G.date, opt.months), months: opt.months });
      head = `The board has approved a new ${opt.cap.toLocaleString('en-GB')}-seat stadium, ${opt.name}. Building takes about ${Math.round(opt.months / 12 * 10) / 10} years, with the move planned for ${monthYear(addMonths(G.date, opt.months))}. Long-term loans cover most of the ${money(opt.cost)} cost; the club pays ${money(Math.round(opt.cost * 0.4))} in monthly instalments.`;
    } else if (k === 'tb') {
      const add = Math.max(2, Math.round(t.tb * 0.2 * 10) / 10); t.tb += add;
      head = `The board has agreed to add ${money(add)} to your transfer budget, which is now ${money(t.tb)}.`;
    } else if (k === 'wb') {
      const add = t.wb * 0.1; t.wb += add;
      head = `The board has raised the wage budget by 10% to ${wageStr(t.wb)}.`;
    } else {
      const months = 6; B.proj.push({ k, tid: G.user, cost: facCost(k), paid: 0, start: G.date, end: addMonths(G.date, months), months });
      head = `The board has approved ${k === 'tr' ? 'an upgrade of the training ground' : 'new youth academy facilities'} for ${money(facCost(k))}. The work takes about six months.`;
    }
    G.board = clamp(G.board + 1, 0, 100);
  } else {
    B.cd[k] = addDays(G.date, REQ[k].cd);
    head = `The board has turned down your request (${REQ[k].n.toLowerCase()}). They will not discuss it again before ${dNice(B.cd[k], false)}.`;
  }
  B.log.unshift({ d: G.date, k, ok, txt: REQ[k].n + (k === 'exp' ? ` · ${t.sdm.st[opt.si].n} +${opt.add.toLocaleString('en-GB')}` : k === 'new' ? ` · ${opt.name}` : '') });
  B.log = B.log.slice(0, 30);
  msg(`Board ${ok ? 'approves' : 'rejects'}: ${REQ[k].n}`, `${head}\n\nThe board's reasons:\n${list}`);
}
function addMonths(d, n) { const x = dParse(d); x.setUTCMonth(x.getUTCMonth() + n); return x.toISOString().slice(0, 10); }
function monthYear(d) { const x = dParse(d); return MON[x.getUTCMonth()] + ' ' + x.getUTCFullYear(); }

function projectsTick() {
  const B = brd();
  // board replies
  for (const r of B.pend.filter(p => p.due <= G.date)) { B.pend = B.pend.filter(x => x !== r); try { boardDecide(r); } catch (e) { console.error(e); } }
  // monthly instalments
  if (G.date.slice(8) === '01') for (const p of B.proj) {
    const t = T(p.tid); if (!t) continue;
    const step = Math.min(p.cost - p.paid, p.cost / p.months); if (step <= 0) continue;
    p.paid += step; t.bal -= step; t.fin.out.build = (t.fin.out.build || 0) + step;
  }
  // completions
  for (const p of B.proj.filter(p => p.end <= G.date)) {
    B.proj = B.proj.filter(x => x !== p);
    const t = T(p.tid); if (!t) continue;
    const rest = p.cost - p.paid; if (rest > 0) { t.bal -= rest; t.fin.out.build = (t.fin.out.build || 0) + rest; }
    if (p.k === 'exp') {
      const s = t.sdm.st[p.si]; s.cap += p.add; delete s.w; syncCap(p.tid);
      if (p.tid === G.user) msg('Stand reopens', `Work on the ${s.n} is finished. It now holds ${s.cap.toLocaleString('en-GB')}, and ${t.stadium} holds ${t.cap.toLocaleString('en-GB')}.`);
    } else if (p.k === 'new') {
      const old = t.stadium; const caps = STAND_SHARE.map(x => Math.round(p.cap * x / 10) * 10); caps[0] += p.cap - caps.reduce((a, b) => a + b, 0);
      t.stadium = p.name; t.sdm = { st: ['Main Stand', 'East Stand', 'North Stand', 'South Stand'].map((n, i) => ({ n, cap: caps[i] })), o: String(dParse(G.date).getUTCFullYear()), rec: null, pitch: '105 × 68 m', bowl: true, c: true, note: `Replaced ${old}.`, hi: null, built: G.date };
      syncCap(p.tid);
      if (typeof STANDS !== 'undefined') delete STANDS[p.tid];
      if (p.tid === G.user) msg('New stadium opens', `${t.name} have moved into ${p.name}, a ${t.cap.toLocaleString('en-GB')}-seat stadium. ${old} hosted its last game.`);
    } else if (p.k === 'tr' || p.k === 'yth') {
      t.fac[p.k] = clamp(t.fac[p.k] + 2, 1, 20);
      if (p.tid === G.user) msg(p.k === 'tr' ? 'Training ground upgraded' : 'Youth facilities upgraded', `The work is finished. ${p.k === 'tr' ? 'Training facilities' : 'Youth facilities'} are now rated ${FAC_LBL[t.fac[p.k]].toLowerCase()} (${t.fac[p.k]}/20).`);
    }
  }
}
const _dtClub = dailyTick;
dailyTick = function () { _dtClub.apply(this, arguments); try { if (G) projectsTick(); } catch (e) { console.error(e); } };

// record crowds at home
const _pmClub = postMatch;
postMatch = function (f, pre) {
  _pmClub(f, pre);
  try { if (f.att && !f.neutral && T(f.h) && T(f.h).sdm) { const m = T(f.h).sdm; if (!m.hi || f.att > m.hi.att) m.hi = { att: f.att, opp: f.a, d: f.d }; } } catch (e) { }
};

// matchday venue: stand names follow the club's stands, closed sections during works
const _venueOfC = venueOf;
venueOf = function (f) {
  const v = _venueOfC(f); if (v.neutral) return v;
  const t = T(f.h); if (!t || t.lite || !t.sdm) return v;
  v.stands = t.sdm.st.map(s => s.n); v.cap = t.cap; v.name = t.stadium;
  v.works = t.sdm.st.map((s, i) => s.w ? i : -1).filter(i => i >= 0);
  return v;
};

// ---------- screens ----------
function facBar(k, t) { const v = t.fac[k]; return `<div class="row" style="justify-content:space-between"><span>${k === 'tr' ? 'Training ground' : 'Youth academy'}</span><b class="mono">${v}/20</b></div><div class="bar"><i style="width:${v * 5}%"></i></div><div class="dim" style="font-size:12px">${FAC_LBL[v]}</div>`; }
function stadiumPanel(tid, small) {
  const t = T(tid); const m = ensureStadium(tid); if (!m) return '';
  const a = homeAttendance(tid);
  const total = m.st.reduce((s, x) => s + x.cap, 0);
  const proj = brd().proj.filter(p => p.tid === tid);
  const stands = `<div class="tw"><table class="t"><thead><tr><th>Stand</th><th class="n">Capacity</th><th>Status</th></tr></thead><tbody>${m.st.map((s, i) => `<tr><td>${esc(s.n)}${i === 0 ? ' <span class="dim">(main)</span>' : ''}</td><td class="n">${s.w ? `<span class="amb">${standCapNow(s).toLocaleString('en-GB')}</span> <span class="dim">of ${s.cap.toLocaleString('en-GB')}</span>` : s.cap.toLocaleString('en-GB')}</td><td>${s.w ? `<span class="amb">Building +${s.w.add.toLocaleString('en-GB')}</span>` : '<span class="dim">Open</span>'}</td></tr>`).join('')}</tbody></table></div>`;
  return `<div class="stadgrid">
    <figure class="stadfig">${stadiumSvg(tid, { small })}<figcaption class="dim">Drawn illustration based on the ground's stands, roof and capacity. It is not a photo.</figcaption></figure>
    <div><dl class="kv">
      <dt>Stadium</dt><dd><b>${esc(t.stadium)}</b></dd>
      <dt>Opened</dt><dd>${esc(m.o)}</dd>
      <dt>Capacity</dt><dd>${t.cap.toLocaleString('en-GB')}${t.cap !== total ? ` <span class="dim">(${total.toLocaleString('en-GB')} when works finish)</span>` : ''}</dd>
      <dt>Record attendance</dt><dd>${m.rec ? esc(m.rec) : '<span class="dim">No verified figure</span>'}</dd>
      <dt>Highest this save</dt><dd>${m.hi ? `${m.hi.att.toLocaleString('en-GB')} <span class="dim">v ${esc(tName(m.hi.opp))}, ${dShort(m.hi.d)} ${m.hi.d.slice(0, 4)}</span>` : '<span class="dim">-</span>'}</dd>
      <dt>Average league crowd</dt><dd>${a ? `${a.avg.toLocaleString('en-GB')} <span class="dim">(${a.n} games, ${Math.min(100, Math.round(a.avg / Math.max(1, t.cap, a.hi.att) * 100))}% full)</span>` : '<span class="dim">No home league games yet</span>'}</dd>
      <dt>Pitch</dt><dd>${esc(m.pitch)}</dd>
      <dt>Roof</dt><dd>${m.bowl ? 'Continuous roof around the bowl' : m.c ? 'Covered stands with filled corners' : 'Four separate covered stands'}</dd>
      <dt>Ticket prices</dt><dd>${ticketLevel(t)} <span class="dim">· about £${Math.round(ticketYield(t))} per fan</span></dd>
      ${m.note ? `<dt>Note</dt><dd>${esc(m.note)}</dd>` : ''}
    </dl></div></div>
    <h2 class="sect">Stands</h2>${stands}
    <div class="grid2" style="margin-top:10px"><div class="box pad">${facBar('tr', t)}</div><div class="box pad">${facBar('yth', t)}</div></div>
    ${proj.length ? `<h2 class="sect">Building work</h2><div class="box pad">${proj.map(p => projLine(p)).join('<br>')}</div>` : ''}
    <p class="dim" style="font-size:12px">Opening year, record attendance, pitch size and stand names come from Wikipedia stadium pages (read Oct 2026). Stand capacities, ticket prices and facility ratings are game estimates.</p>`;
}
function projLine(p) {
  const t = T(p.tid); const pct = clamp(Math.round(dDiff(p.start, G.date) / Math.max(1, dDiff(p.start, p.end)) * 100), 0, 100);
  const what = p.k === 'exp' ? `${t.sdm.st[p.si].n}: +${p.add.toLocaleString('en-GB')} seats` : p.k === 'new' ? `New stadium: ${esc(p.name)} (${p.cap.toLocaleString('en-GB')})` : p.k === 'tr' ? 'Training ground upgrade' : 'Youth academy upgrade';
  return `<div style="margin:4px 0"><div class="row" style="justify-content:space-between"><b>${what}</b><span class="mono dim">${pct}% · due ${monthYear(p.end)}</span></div><div class="bar"><i style="width:${pct}%;background:var(--amb)"></i></div><div class="dim" style="font-size:12px">Paid ${money(p.paid)} of ${money(p.cost)}</div></div>`;
}
function scrClubStadium() { return stadiumPanel(G.user); }
function scrClubBoard() {
  const t = userTeam(); const B = brd(); ensureStadium(G.user);
  const pend = B.pend.map(p => `<div>⏳ ${esc(REQ[p.k].n)} <span class="dim">· sent ${dShort(p.at)}</span></div>`).join('');
  const blk = (k) => requestBlocked(k);
  const btn = (k, label, extra) => { const b = blk(k); return `<button class="btn ${b ? '' : 'pri'}" data-a="breq" data-v="${k}" ${extra || ''} ${b ? `title="${esc(b)}" disabled` : ''}>${label}</button>${b ? `<div class="dim" style="font-size:12px;margin-top:4px">${esc(b)}</div>` : ''}`; };
  const eo = expOptions(G.user); const si = clamp(+(UI.bsi || 0), 0, 3), sz = clamp(+(UI.bsz || 1), 0, 2); const o = eo[si].sizes[sz];
  const no = newStadiumOptions(G.user); const ni = clamp(+(UI.bni || 0), 0, 2); const nn = no[ni];
  const tgt = boardTarget();
  return `<div class="grid3" style="margin-top:10px">
    <div class="box pad"><label class="lb">Board confidence</label><div class="big ${G.board < 30 ? 'red' : G.board < 55 ? 'amb' : 'grn'}">${Math.round(G.board)}%</div><div class="dim">Target: ${esc(tgt.txt)}</div></div>
    <div class="box pad"><label class="lb">Club finances</label><div class="big" style="font-size:28px">${money(t.bal)}</div><div class="dim">Transfer budget ${money(t.tb)} · wages ${wageStr(t.wb)}</div></div>
    <div class="box pad"><label class="lb">Requests this season</label><div class="big">${Object.values(B.n).reduce((a, b) => a + b, 0)}</div><div class="dim">More than three in a season starts to annoy the board.</div></div>
  </div>
  ${pend ? `<div class="box pad" style="margin-top:10px">${pend}</div>` : ''}
  <h2 class="sect">Stadium</h2>
  <div class="grid2">
    <div class="box pad"><h3 class="h3">Expand a stand</h3>
      <div class="row" style="gap:8px;flex-wrap:wrap"><select class="f" id="bsi" data-a="bsel">${eo.map(x => `<option value="${x.i}" ${x.i === si ? 'selected' : ''}>${esc(x.s.n)} (${x.s.cap.toLocaleString('en-GB')})</option>`).join('')}</select>
      <select class="f" id="bsz" data-a="bsel">${eo[si].sizes.map((x, i) => `<option value="${i}" ${i === sz ? 'selected' : ''}>+${x.add.toLocaleString('en-GB')} seats</option>`).join('')}</select></div>
      <p class="dim" style="font-size:13px">Cost ${money(o.cost)} · about ${o.months} months · ${o.red.toLocaleString('en-GB')} seats closed during the work.</p>
      ${btn('exp', 'Ask the board')}</div>
    <div class="box pad"><h3 class="h3">Build a new stadium</h3>
      <div class="row" style="gap:8px;flex-wrap:wrap"><input class="f" id="bname" maxlength="40" value="${esc(UI.bname || 'New ' + t.short + ' Stadium')}" aria-label="Stadium name" style="flex:1;min-width:160px"><select class="f" id="bni" data-a="bsel">${no.map((x, i) => `<option value="${i}" ${i === ni ? 'selected' : ''}>${x.cap.toLocaleString('en-GB')} seats</option>`).join('')}</select></div>
      <p class="dim" style="font-size:13px">Cost ${money(nn.cost)} (the club pays 40%) · about ${Math.round(nn.months / 12 * 10) / 10} years. A multi-season project.</p>
      ${btn('new', 'Ask the board')}</div>
  </div>
  <h2 class="sect">Budgets and facilities</h2>
  <div class="grid2">
    <div class="box pad"><h3 class="h3">Transfer budget</h3><p class="dim" style="font-size:13px">Ask for about 20% more.</p>${btn('tb', 'Ask for more')}</div>
    <div class="box pad"><h3 class="h3">Wage budget</h3><p class="dim" style="font-size:13px">Ask for a 10% rise.</p>${btn('wb', 'Ask for more')}</div>
    <div class="box pad"><h3 class="h3">Training facilities</h3>${facBar('tr', t)}<p class="dim" style="font-size:13px">Upgrade +2 for ${money(facCost('tr'))}, six months. Better facilities help your players improve.</p>${btn('tr', 'Request upgrade')}</div>
    <div class="box pad"><h3 class="h3">Youth facilities</h3>${facBar('yth', t)}<p class="dim" style="font-size:13px">Upgrade +2 for ${money(facCost('yth'))}, six months. Better facilities improve academy intakes.</p>${btn('yth', 'Request upgrade')}</div>
  </div>
  ${B.proj.filter(p => p.tid === G.user).length ? `<h2 class="sect">Work in progress</h2><div class="box pad">${B.proj.filter(p => p.tid === G.user).map(projLine).join('')}</div>` : ''}
  ${B.log.length ? `<h2 class="sect">Past requests</h2><div class="tw"><table class="t"><thead><tr><th>Date</th><th>Request</th><th>Decision</th></tr></thead><tbody>${B.log.map(l => `<tr><td class="mono">${dShort(l.d)} ${l.d.slice(0, 4)}</td><td>${esc(l.txt)}</td><td class="${l.ok ? 'grn' : 'red'}">${l.ok ? 'Approved' : 'Rejected'}</td></tr>`).join('')}</tbody></table></div>` : ''}
  <p class="dim" style="font-size:12px">The board weighs its confidence in you, results against the target, the club's money, how full the ground is and how often you have asked. A refusal means waiting before asking again.</p>`;
}
Object.assign(ACT, {
  breq: (k) => {
    if (k === 'exp') { const eo = expOptions(G.user); const si = clamp(+(UI.bsi || 0), 0, 3), sz = clamp(+(UI.bsz || 1), 0, 2); const o = eo[si].sizes[sz]; return boardRequest('exp', { si, add: o.add, cost: o.cost, months: o.months, red: o.red }); }
    if (k === 'new') { const no = newStadiumOptions(G.user); const n = no[clamp(+(UI.bni || 0), 0, 2)]; const nm = (($('#bname') || {}).value || '').trim() || 'New ' + userTeam().short + ' Stadium'; UI.bname = nm; return boardRequest('new', { name: nm, cap: n.cap, cost: n.cost, months: n.months }); }
    boardRequest(k);
  }
});
document.addEventListener('change', (ev) => {
  const el = ev.target; if (!el || !el.dataset || el.dataset.a !== 'bsel') return;
  const nm = $('#bname'); if (nm) UI.bname = nm.value;
  if (el.id === 'bsi') UI.bsi = +el.value; if (el.id === 'bsz') UI.bsz = +el.value; if (el.id === 'bni') UI.bni = +el.value; render();
});

// club screen tabs
const _scrClubC = scrClub;
const CLUB_TABS = [['ov', 'Overview'], ['stad', 'Stadium'], ['board', 'Board'], ['hon', 'Honours']];
scrClub = function () {
  ensureAllStadia();
  const tab = UI.tab.club || 'ov';
  const tabs = `<div class="tabs" style="margin-top:4px">${CLUB_TABS.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="club" data-v="${k}">${l}</button>`).join('')}</div>`;
  const t = userTeam();
  const band = `<div class="band">${esc(t.name)}<small>${esc(t.stadium)} · capacity ${t.cap.toLocaleString('en-GB')}</small></div>`;
  if (tab === 'stad') return band + tabs + `<div style="margin-top:10px">${scrClubStadium()}</div>`;
  if (tab === 'board') return band + tabs + scrClubBoard();
  if (tab === 'hon') return band + tabs + (typeof clubHonoursHtml === 'function' ? clubHonoursHtml(G.user) : '');
  const html = _scrClubC();
  const i = html.indexOf('</div>'); // end of the band
  return i > 0 ? html.slice(0, i + 6) + tabs + html.slice(i + 6) : tabs + html;
};

// other clubs' pop-up: stadium block
const _clubModalC = clubModal;
clubModal = function (tid) {
  _clubModalC(tid);
  const t = T(tid); if (!t || t.lite || !UI.modal || UI.modal.includes('stadmini')) return;
  const m = ensureStadium(tid);
  const blk = `<div class="stadmini"><figure class="stadfig">${stadiumSvg(tid, { small: true })}</figure><dl class="kv"><dt>Stadium</dt><dd>${esc(t.stadium)}</dd><dt>Opened</dt><dd>${esc(m.o)}</dd><dt>Capacity</dt><dd>${t.cap.toLocaleString('en-GB')}</dd><dt>Record</dt><dd>${m.rec ? esc(m.rec) : '-'}</dd><dt>Stands</dt><dd>${m.st.map(s => esc(s.n)).join(', ')}</dd></dl></div>${typeof clubHonoursShort === 'function' ? clubHonoursShort(tid) : ''}`;
  UI.modal = UI.modal.replace('<div class="mc">', '<div class="mc">' + blk);
  render();
};

// facilities feed the game: training ground speeds up progression, youth facilities lift intakes

// migration for older saves
const _renderClub = render;
render = function () { if (G && G.teams && !G.v5) { try { ensureAllStadia(); brd(); G.v5 = 1; } catch (e) { console.error(e); } } _renderClub(); };
