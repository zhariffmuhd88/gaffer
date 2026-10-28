// ===== MATCH ENGINE =====
const BASE = { def: 4.5, mid: 4.1, att: 3.9 };

function roleToPos(role) { return { GK: 'GK', DC: 'CB', DL: 'LB', DR: 'RB', WBL: 'LB', WBR: 'RB', DM: 'DM', MC: 'CM', ML: 'LW', MR: 'RW', AMC: 'AM', AML: 'LW', AMR: 'RW', FC: 'ST' }[role]; }
function pn(p) { return p.pseudo ? p.n : p.n; }
function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// --- automatic selection ---
function effSkill(p, role, forMatch = true) {
  let s = roleSkill(p, role) * fam(p.pos, role);
  if (forMatch) s *= (0.55 + 0.45 * p.cond / 100);
  return s;
}
function autoPick(tid, keepForm) {
  const t = T(tid);
  const form = (keepForm && t.tac.form) || t.tac.form || PREF_FORM[tid] || '4-2-3-1';
  const slots = FORMS[form];
  const pool = squad(tid).filter(p => available(p));
  const used = new Set();
  const xi = new Array(11).fill(null);
  // fill order: GK, FC, DC, then the rest by scarcity
  const order = slots.map((s, i) => i).sort((a, b) => prio(slots[a][0]) - prio(slots[b][0]));
  function prio(r) { return { GK: 0, FC: 1, DC: 2, DM: 3, AMC: 4, DL: 5, DR: 5, WBL: 5, WBR: 5, MC: 6, AML: 7, AMR: 7, ML: 8, MR: 8 }[r]; }
  for (const i of order) {
    const role = slots[i][0];
    let best = null, bv = -1;
    for (const p of pool) {
      if (used.has(p.id)) continue;
      if (role !== 'GK' && p.pos === 'GK') continue;
      if (role === 'GK' && p.pos !== 'GK') continue;
      let v = effSkill(p, role);
      if (p.cond < 75) v *= 0.85; // rest tired players
      if (v > bv) { bv = v; best = p; }
    }
    if (best) { xi[i] = best.id; used.add(best.id); }
  }
  // emergency: fill gaps with anyone
  for (let i = 0; i < 11; i++) if (!xi[i]) { const p = squad(tid).find(q => !used.has(q.id) && (slots[i][0] === 'GK') === (q.pos === 'GK')) || squad(tid).find(q => !used.has(q.id)); if (p) { xi[i] = p.id; used.add(p.id); } }
  const rest = pool.filter(p => !used.has(p.id)).sort((a, b) => b.ca - a.ca);
  const bench = [];
  const gk = rest.find(p => p.pos === 'GK'); if (gk) bench.push(gk.id);
  for (const p of rest) { if (bench.length >= 9) break; if (p.pos === 'GK') continue; bench.push(p.id); }
  t.tac.form = form; t.tac.xi = xi; t.tac.bench = bench;
  autoTakers(tid);
}
function autoTakers(tid) {
  const t = T(tid); const xi = t.tac.xi.map(P).filter(Boolean);
  if (!xi.length) return;
  const by = (k) => xi.slice().sort((a, b) => attrs(b)[k] - attrs(a)[k])[0].id;
  if (!t.tac.capt || !t.tac.xi.includes(t.tac.capt)) t.tac.capt = xi.slice().sort((a, b) => (b.age + b.ca / 3) - (a.age + a.ca / 3))[0].id;
  if (!t.tac.pk || !t.tac.xi.includes(t.tac.pk)) t.tac.pk = by('Fin');
  if (!t.tac.fk || !t.tac.xi.includes(t.tac.fk)) t.tac.fk = by('Lon');
  if (!t.tac.ck || !t.tac.xi.includes(t.tac.ck)) t.tac.ck = by('Crs');
}
// validate user lineup; returns list of issues fixed
function validateLineup(tid) {
  const t = T(tid); const issues = [];
  const slots = FORMS[t.tac.form];
  const sqIds = new Set(G.sq[tid]);
  const seen = new Set();
  for (let i = 0; i < 11; i++) {
    const p = P(t.tac.xi[i]);
    if (!p || !sqIds.has(p.id) || !available(p) || seen.has(p.id)) {
      if (p && !available(p)) issues.push(pn(p) + ' is unavailable');
      // replacement
      let best = null, bv = -1;
      for (const q of squad(tid)) {
        if (!available(q) || seen.has(q.id) || t.tac.xi.includes(q.id) && q.id !== t.tac.xi[i]) continue;
        if ((slots[i][0] === 'GK') !== (q.pos === 'GK')) continue;
        const v = effSkill(q, slots[i][0]); if (v > bv) { bv = v; best = q; }
      }
      if (best) { t.tac.xi[i] = best.id; issues.push(pn(best) + ' comes into the XI'); }
    }
    if (t.tac.xi[i]) seen.add(t.tac.xi[i]);
  }
  t.tac.bench = (t.tac.bench || []).filter(id => P(id) && sqIds.has(id) && available(P(id)) && !seen.has(id));
  const rest = squad(tid).filter(p => available(p) && !seen.has(p.id) && !t.tac.bench.includes(p.id)).sort((a, b) => b.ca - a.ca);
  while (t.tac.bench.length < 9 && rest.length) { const p = rest.shift(); t.tac.bench.push(p.id); }
  t.tac.bench = t.tac.bench.slice(0, 9);
  autoTakers(tid);
  return issues;
}

// --- build sides ---
function pseudoSide(team) {
  const form = '4-2-3-1';
  const ps = FORMS[form].map((s, i) => ({ id: 'x' + team.id + i, n: 'the ' + team.name + ' ' + ROLE_NOUN[s[0]], pseudo: true, pos: roleToPos(s[0]), ca: clamp(team.str + Math.round(R.gauss() * 3), 40, 95), age: 26, mor: 70, cond: 100, seed: i }));
  const bench = [0, 1, 2, 3, 4].map(i => ({ id: 'xb' + team.id + i, n: 'a ' + team.name + ' substitute', pseudo: true, pos: ['CB', 'CM', 'LW', 'ST', 'DM'][i], ca: clamp(team.str - 4, 40, 95), age: 24, mor: 70, cond: 100, seed: 20 + i }));
  return { form, ps, bench, tac: { ment: 3, press: 2, tempo: 2, width: 2, pass: 2 } };
}
function mkSide(tid, home) {
  const t = T(tid);
  let form, list, bench, tac;
  if (t.lite) { const s = pseudoSide(t); form = s.form; list = s.ps; bench = s.bench; tac = s.tac; }
  else {
    if (!isUser(tid)) { autoPick(tid); aiTactics(tid); } else validateLineup(tid);
    form = t.tac.form; list = t.tac.xi.map(P); bench = t.tac.bench.map(P).filter(Boolean); tac = t.tac;
  }
  const slots = FORMS[form];
  const S = {
    tid, home, name: tName(tid), form, subs: 5, windows: 3, bench: bench.slice(),
    tac: Object.fromEntries(Object.keys(TAC_DEF).map(k => [k, tacVal(tac, k)])),
    capt: t.capt || (t.tac && t.tac.capt), vice: t.vice, pk: t.tac && t.tac.pk, fk: t.tac && t.tac.fk, ck: t.tac && t.tac.ck,
    ps: list.map((p, i) => ({ p, role: slots[i][0], pr: t.lite ? DEF_PR[slots[i][0]] : slotPR(t, i), x: slots[i][1], y: slots[i][2], on: true, rt: 6.3, g: 0, as: 0, yc: 0, rc: 0, inj: false, mins: 0, subOn: 0 })),
    st: { sh: 0, ot: 0, co: 0, fo: 0, yc: 0, rc: 0, po: 0, off: 0, sv: 0, xg: 0 }, u: null, dayF: clamp(1 + R.gauss() * 0.055, .88, 1.12)
  };
  return S;
}
function aiTactics(tid) {
  const t = T(tid);
  t.tac.ment = 3; t.tac.press = t.rep >= 85 ? 3 : 2; t.tac.tempo = 2; t.tac.width = 2; t.tac.pass = t.rep >= 85 ? 1 : 2;
}
function units(S) {
  let gk = 40, d = 0, dw = 0, m = 0, mw = 0, a = 0, aw = 0;
  for (const e of S.ps) {
    if (!e.on) continue;
    const p = e.p;
    const pr = prE(e);
    const base = p.pseudo ? roleSkill(p, e.role) : roleSkill(p, e.role) * .7 + (pr.k ? roleFit(p, e.pr || DEF_PR[e.role]) * 5 * .3 : roleSkill(p, e.role) * .3);
    let s = base * fam(p.pos, e.role) * (0.55 + 0.45 * p.cond / 100) * (0.94 + 0.12 * (p.mor || 70) / 100);
    if (e.inj) s *= 0.6;
    if (e.role === 'GK') { gk = s; if (e.pr === 'SK') m += .1 * s, mw += .1; continue; }
    const u0 = ROLE_U[e.role], du = pr.u || [0, 0, 0];
    const u = [Math.max(0, u0[0] + du[0]), Math.max(0, u0[1] + du[1]), Math.max(0, u0[2] + du[2])];
    d += u[0] * s; dw += u[0]; m += u[1] * s; mw += u[1]; a += u[2] * s; aw += u[2];
  }
  const tac = S.tac;
  const mt = tac.ment - 3;
  let def = (dw ? d / dw : 30) * (0.78 + 0.22 * dw / BASE.def) * (1 - mt * 0.045);
  let mid = (mw ? m / mw : 30) * (0.78 + 0.22 * mw / BASE.mid) * (1 + (tac.press - 2) * 0.03);
  let att = (aw ? a / aw : 30) * (0.78 + 0.22 * aw / BASE.att) * (1 + mt * 0.055);
  const ln = tac.line - 2; def *= 1 - ln * .02; mid *= 1 + ln * .025; att *= 1 + ln * .015;
  if (tac.tackle === 3) def *= 1.02; if (tac.tackle === 1) def *= .98;
  const ce = S.ps.find(e => e.on && (e.p.id === S.capt)) || S.ps.find(e => e.on && e.p.id === S.vice);
  const cb = ce ? 1 + (lead(ce.p) - 10) * .0025 : .99; def *= cb; mid *= cb; att *= cb;
  if (S.tid === G.user) { const tr = trainTeam(); if (tr === 'att') { att *= 1.025; def *= .99; } if (tr === 'def') { def *= 1.025; att *= .99; } if (tr === 'light') { mid *= .99; att *= .99; } }
  if (S.shout) { const sk = S.shout.k; if (sk === 'push') { att *= 1.045; def *= .965; } else if (sk === 'focus') { def *= 1.03; att *= .985; } else if (sk === 'enc') { mid *= 1.02; att *= 1.015; } }
  const df = S.dayF || 1;
  S.u = { gk: gk * (0.5 + df / 2), def: def * df, mid: mid * df, att: att * df };
  return S.u;
}

function createMatch(fid, live = false) {
  const f = G.fx[fid];
  const M = { fid, comp: f.comp, live, neutral: !!f.neutral, need: !!f.need, agg: [0, 0], min: 0, half: 1, score: [0, 0], ev: [], com: [], vis: [], shots: [], done: false, et: false, pens: null, paused: false, sides: [mkSide(f.h, !f.neutral), mkSide(f.a, false)] };
  if (f.l1) { const l1 = G.fx[f.l1]; if (l1 && l1.r) { // leg1 had teams reversed
    M.agg = l1.h === f.h ? [l1.r[0], l1.r[1]] : [l1.r[1], l1.r[0]]; } }
  const meta = fxMeta(f); M.meta = meta; M.wx = meta.wx; M.refK = .75 + meta.ref.s / 40;
  units(M.sides[0]); units(M.sides[1]);
  const h = M.sides[0], a = M.sides[1];
  say(M, 0, 'ko', `${h.name} v ${a.name}, ${venueOf(f).name}. Kick-off ${meta.ko}. ${WX_TXT[meta.wx]}, ${meta.temp}°C. Referee: ${meta.ref.n}.`);
  if (f.l1 && G.fx[f.l1].r) say(M, 0, 'info', `First leg: ${tName(G.fx[f.l1].h)} ${G.fx[f.l1].r[0]}-${G.fx[f.l1].r[1]} ${tName(G.fx[f.l1].a)}.`);
  say(M, 0, 'info', 'Kick-off! ' + h.name + ' get us under way.');
  return M;
}
function say(M, min, k, text, side) { if (M.live) M.com.push({ min, k, text, side }); }
function active(S) { return S.ps.filter(e => e.on); }
function pickBy(S, wfn, exclude) { const c = active(S).filter(e => e !== exclude && !e.inj); return c.length ? R.wpick(c, wfn) : active(S)[0]; }

const LEFT = ['DL', 'WBL', 'ML', 'AML'], RIGHT = ['DR', 'WBR', 'MR', 'AMR'], CENTRE = ['AMC', 'FC', 'MC'];
function focusW(S, e) { const f = S.tac.focus || 2; if (f === 1) return LEFT.includes(e.role) ? 1.5 : 1; if (f === 3) return CENTRE.includes(e.role) ? 1.35 : 1; if (f === 4) return RIGHT.includes(e.role) ? 1.5 : 1; return 1; }
function prE(e) { return PR[e.pr] || PR[DEF_PR[e.role]] || {}; }
const SHOOT_W = { GK: 0, DC: .3, DL: .35, DR: .35, WBL: .55, WBR: .55, DM: .5, MC: 1.15, ML: 1.6, MR: 1.6, AMC: 2.3, AML: 2.4, AMR: 2.4, FC: 2.8 };
const ASSIST_W = { GK: .05, DC: .3, DL: 1.3, DR: 1.3, WBL: 2, WBR: 2, DM: 1, MC: 2.4, ML: 2.8, MR: 2.8, AMC: 4, AML: 3.3, AMR: 3.3, FC: 1.5 };
const FOUL_W = { GK: .1, DC: 1.6, DL: 1.1, DR: 1.1, WBL: 1, WBR: 1, DM: 1.8, MC: 1.3, ML: .8, MR: .8, AMC: .7, AML: .6, AMR: .6, FC: .9 };

function stepMinute(M) {
  if (M.done) return;
  M.min++;
  const min = M.min;
  const [A, B] = M.sides;
  // fatigue
  for (const S of M.sides) for (const e of S.ps) if (e.on) {
    const p = e.p; const sta = attrs(p).Sta;
    p.cond = Math.max(20, p.cond - (0.1 + (S.tac.press - 2) * 0.025 + (20 - sta) * 0.0045 + (min > 90 ? 0.05 : 0)));
    e.mins++;
  }
  if (min % 5 === 0) { units(A); units(B); }
  // possession
  const ma = Math.pow(A.u.mid, 2), mb = Math.pow(B.u.mid, 2);
  let pA = ma / (ma + mb) + (M.neutral ? 0 : 0.025) + (2 - A.tac.pass) * 0.015 - (2 - B.tac.pass) * 0.015;
  pA = clamp(pA, .25, .75);
  const side = R.chance(pA) ? 0 : 1;
  const S = M.sides[side], O = M.sides[1 - side];
  S.st.po++; M.pside = side;
  // fouls
  if (R.chance(0.23)) {
    const fs = R.chance(0.68) ? O : S; // fouls mostly by defending team
    foul(M, fs, M.sides[fs === A ? 1 : 0]);
  }
  // attack
  let mentF = 1 + (S.tac.ment - 3) * 0.1;
  if (O.tac.waste === 2 && M.min >= 65 && M.score[1 - side] + M.agg[1 - side] > M.score[side] + M.agg[side]) mentF *= .9;
  const tempoF = 1 + (S.tac.tempo - 2) * 0.14;
  if (R.chance(0.40 * mentF * tempoF * (M.wx === 'snow' ? .94 : 1))) {
    let q = 0.52 * Math.pow(S.u.att / O.u.def, 1.15) * (1 + (O.tac.ment - 3) * 0.05) * (1 - (S.tac.tempo - 2) * 0.05);
    q = clamp(q, .08, .85);
    if (R.chance(q)) chance(M, side);
    else if (M.live) attackFail(M, S, O, side);
  } else if (M.live && R.chance(0.05)) flavor(M, S, O);
  // counter-attacks for the side without the ball
  if (O.tac.counter === 2 && R.chance(0.02 * Math.pow(O.u.att / S.u.def, 1.1) * (O.tac.ment <= 3 ? 1.2 : .8))) { say(M, min, 'fl', `${O.name} break quickly on the counter!`, 1 - side); chance(M, 1 - side, 'through'); }
  // injuries
  const injMul = (A.tid === G.user || B.tid === G.user) ? (physioInj() + (trainTeam() === 'fit' ? .1 : trainTeam() === 'light' ? -.15 : 0)) : 1;
  if (R.chance(0.0042 * injMul)) {
    const vs = R.chance(.5) ? A : B; const e = R.pick(active(vs));
    if (e && !e.inj) { e.inj = true; e.injDays = R.wpick([[3, 7], [8, 21], [22, 70]], x => x[0] === 3 ? 50 : x[0] === 8 ? 35 : 15); e.injDays = R.i(e.injDays[0], e.injDays[1]); say(M, min, 'inj', `${cap1(pn(e.p))} is down injured and needs treatment.`, M.sides.indexOf(vs)); M.ev.push({ min, t: 'inj', side: M.sides.indexOf(vs), p: e.p.id }); if (M.live && isUser(vs.tid)) M.alert = cap1(pn(e.p)) + ' is injured'; }
  }
  // AI management
  for (let i = 0; i < 2; i++) { const s = M.sides[i]; if (!(M.live && isUser(s.tid))) aiManage(M, i); else { const inj = s.ps.find(e => e.on && e.inj); if (inj && !M.alert && s.subs === 0) {} } }
  // periods
  if (min === 45 && M.half === 1) { M.half = 2; say(M, 45, 'ht', `Half-time: ${A.name} ${M.score[0]}-${M.score[1]} ${B.name}.`); M.ht = true; }
  if (min === 90) endNormal(M);
  if (min === 105 && M.et) say(M, 105, 'ht', `Half-time in extra time: ${A.name} ${M.score[0]}-${M.score[1]} ${B.name}.`);
  if (min === 120 && M.et) endET(M);
}
function endNormal(M) {
  const [A, B] = M.sides;
  const ta = M.score[0] + M.agg[0], tb = M.score[1] + M.agg[1];
  if (M.need && ta === tb) {
    M.et = true; say(M, 90, 'ht', `Full-time in normal time: ${A.name} ${M.score[0]}-${M.score[1]} ${B.name}${M.agg[0] + M.agg[1] ? ` (agg ${ta}-${tb})` : ''}. We go to extra time.`); M.ht = true;
  } else finish(M);
}
function endET(M) {
  const ta = M.score[0] + M.agg[0], tb = M.score[1] + M.agg[1];
  if (ta === tb) shootout(M); else finish(M);
}
function shootout(M) {
  const takers = M.sides.map(S => active(S).filter(e => !e.inj).sort((a, b) => attrs(b.p).Fin - attrs(a.p).Fin));
  const gks = M.sides.map(S => active(S).find(e => e.role === 'GK') || active(S)[0]);
  const sc = [0, 0]; const kicks = [[], []];
  say(M, 120, 'ht', 'Extra time ends level. Penalties will decide it.');
  let round = 0;
  while (true) {
    for (let s = 0; s < 2; s++) {
      const tk = takers[s][round % takers[s].length];
      const gk = gks[1 - s];
      const p = clamp(0.76 + (attrs(tk.p).Fin - 13) * 0.012 - ((attrs(gk.p).Ref || 10) - 12) * 0.01, .55, .92);
      const ok = R.chance(p); if (ok) sc[s]++; kicks[s].push(ok);
      say(M, 120, ok ? 'pen' : 'miss', `${cap1(pn(tk.p))} ${ok ? 'scores' : R.pick(['misses!', 'sees it saved!', 'hits the post!'])} (${M.sides[s].name} ${sc[s]})`, s);
    }
    round++;
    if (round < 5) { const left = 5 - round; if (sc[0] > sc[1] + left || sc[1] > sc[0] + left) break; }
    else if (sc[0] !== sc[1]) break;
    if (round > 30) { sc[0]++; break; }
  }
  M.pens = sc; finish(M);
}
function finish(M) {
  if (M.done) return;
  M.done = true;
  const [A, B] = M.sides;
  let txt = `Full-time: ${A.name} ${M.score[0]}-${M.score[1]} ${B.name}`;
  if (M.et) txt += ' after extra time';
  if (M.pens) txt += `. ${M.pens[0] > M.pens[1] ? A.name : B.name} win ${Math.max(...M.pens)}-${Math.min(...M.pens)} on penalties`;
  else if (M.agg[0] + M.agg[1] > 0 || G.fx[M.fid].l1) { const ta = M.score[0] + M.agg[0], tb = M.score[1] + M.agg[1]; txt += `. Aggregate ${ta}-${tb}`; }
  say(M, M.min, 'ft', txt + '.');
}

function foul(M, fs, vic) {
  const e = pickBy(fs, x => FOUL_W[x.role] * (prE(x).foul || 1));
  if (!e) return;
  fs.st.fo++;
  const sideIdx = M.sides.indexOf(fs);
  const pressF = (1 + (fs.tac.press - 2) * 0.2) * (fs.tac.tackle === 3 ? 1.3 : fs.tac.tackle === 1 ? .7 : 1) * (prE(e).foul || 1) * (M.refK || 1);
  let card = null;
  if (R.chance(0.0013)) card = 'r';
  else if (R.chance(0.135 * pressF * (e.yc ? .35 : 1))) card = e.yc ? 'r2' : 'y';
  if (card) {
    if (card === 'y') { e.yc = 1; e.rt -= .3; fs.st.yc++; say(M, M.min, 'yc', `${cap1(pn(e.p))} is booked for a ${R.pick(['late challenge', 'cynical foul', 'reckless tackle', 'tug on the shirt', 'trip'])}.`, sideIdx); M.ev.push({ min: M.min, t: 'yc', side: sideIdx, p: e.p.id }); }
    else { e.rc = card === 'r' ? 2 : 1; if (card === 'r2') { e.yc = 1; fs.st.yc++; } e.on = false; e.rt -= 1.2; fs.st.rc++; say(M, M.min, 'rc', card === 'r' ? `RED CARD! ${cap1(pn(e.p))} is sent off for a dangerous challenge!` : `${cap1(pn(e.p))} picks up a second yellow and is sent off!`, sideIdx); M.ev.push({ min: M.min, t: 'rc', side: sideIdx, p: e.p.id }); units(fs); if (M.live && isUser(fs.tid)) M.alert = cap1(pn(e.p)) + ' sent off'; }
  } else if (M.live && R.chance(0.12)) say(M, M.min, 'foul', `Free kick to ${vic.name} after a foul by ${pn(e.p)}.`, sideIdx);
  if (M.live) M.vis.push({ min: M.min, t: 'foul', side: sideIdx, e, card });
  // dangerous free kick
  if (R.chance(0.1)) {
    const vi = M.sides.indexOf(vic);
    const tk = vic.ps.find(x => x.on && x.p.id === vic.fk) || pickBy(vic, x => attrs(x.p).Lon * SHOOT_W[x.role]);
    shot(M, vi, tk, null, 'fk');
  }
}
function flavor(M, S, O) {
  const e = pickBy(S, x => ASSIST_W[x.role]);
  const lines = [
    `${cap1(pn(e.p))} switches play out to the flank.`,
    `${S.name} keep the ball patiently at the back.`,
    `${cap1(pn(e.p))} tries a ball over the top, but it runs through to the keeper.`,
    `Good pressing from ${O.name} forces a hurried clearance.`,
    `${cap1(pn(e.p))} is caught offside.`,
    `${S.name} are probing, looking for an opening.`,
    `${cap1(pn(e.p))} loses possession in midfield.`
  ];
  const l = R.pick(lines);
  if (l.includes('offside')) S.st.off++;
  say(M, M.min, 'fl', l, M.sides.indexOf(S));
}
function chance(M, si, force) {
  const S = M.sides[si], O = M.sides[1 - si];
  const wide = S.tac.width, direct = S.tac.pass;
  const crosses = active(S).reduce((s, e) => s + (prE(e).cr || 0), 0), tm = active(S).some(e => e.pr === 'TM');
  const types = [['through', 14 + (direct - 2) * 6 + (O.tac.line - 2) * 5], ['open', 44], ['header', 18 + (wide - 2) * 7 + crosses * 2.5 + (tm ? 5 : 0)], ['long', 21 - (O.tac.line - 2) * 4], ['pen', 2.4]];
  const type = force || R.wpick(types, x => x[1])[0];
  if (type === 'through' && O.tac.trap === 2 && R.chance(.3)) { S.st.off++; if (M.live) M.vis.push({ min: M.min, t: 'off', side: si }); say(M, M.min, 'fl', `${O.name} step up together and catch ${S.name} offside.`, si); return; }
  let shooter, assister = null;
  if (type === 'pen') { shooter = S.ps.find(x => x.on && x.p.id === S.pk) || pickBy(S, x => attrs(x.p).Fin * SHOOT_W[x.role]); }
  else if (type === 'header') shooter = pickBy(S, x => (attrs(x.p).Hea ** 2) * (SHOOT_W[x.role] + (x.role === 'DC' ? .3 : 0)) * (prE(x).hd || 1));
  else if (type === 'long') shooter = pickBy(S, x => (attrs(x.p).Lon ** 2) * (x.role === 'FC' ? 1.5 : ['MC', 'AMC', 'DM', 'AML', 'AMR'].includes(x.role) ? 2.2 : .5));
  else shooter = pickBy(S, x => attrs(x.p).Fin * SHOOT_W[x.role] * (prE(x).sh || 1) * focusW(S, x));
  if ((type !== 'pen' && type !== 'long' && R.chance(.85)) || R.chance(.25)) assister = pickBy(S, x => ASSIST_W[x.role] * (type === 'header' ? attrs(x.p).Crs * (1 + (prE(x).cr || 0)) : attrs(x.p).Pas + attrs(x.p).Cre) * (x.role === 'GK' ? 0.1 : 1) * (prE(x).as || 1) * focusW(S, x), shooter);
  shot(M, si, shooter, assister, type);
}
function corner(M, si) {
  const S = M.sides[si];
  S.st.co++; if (M.live) M.vis.push({ min: M.min, t: 'corner', side: si });
  if (R.chance(S.tid === G.user && trainTeam() === 'set' ? 0.42 : 0.33)) {
    const tk = S.ps.find(x => x.on && x.p.id === S.ck) || pickBy(S, x => attrs(x.p).Crs);
    const sh = pickBy(S, x => (attrs(x.p).Hea ** 2) * (x.role === 'DC' ? 2.2 : x.role === 'FC' ? 2 : .6), tk);
    say(M, M.min, 'fl', `Corner to ${S.name}, delivered by ${pn(tk.p)}.`, si);
    shot(M, si, sh, tk, 'corner');
  }
}

// AI substitutions & tactical tweaks
function aiManage(M, i) {
  const S = M.sides[i]; const min = M.min;
  const inj = S.ps.find(e => e.on && e.inj);
  if (inj && S.subs > 0 && S.bench.length) doSub(M, i, inj, bestBenchFor(S, inj.role));
  if (S.subs > 0 && [58, 68, 76, 84].includes(min)) {
    const cands = active(S).filter(e => e.role !== 'GK').sort((a, b) => (a.p.cond + a.rt * 8) - (b.p.cond + b.rt * 8));
    const out = cands[0];
    if (out && (out.p.cond < 72 || out.rt < 6.0 || min >= 76)) { const pin = bestBenchFor(S, out.role); if (pin) doSub(M, i, out, pin); }
  }
  const diff = M.score[i] + M.agg[i] - M.score[1 - i] - M.agg[1 - i];
  if (min === 70 && diff < 0) S.tac.ment = Math.min(5, S.tac.ment + 1);
  if (min === 82 && diff < 0) S.tac.ment = 5;
  if (min === 80 && diff > 0) S.tac.ment = Math.max(2, S.tac.ment - 1);
}
function bestBenchFor(S, role) {
  let best = null, bv = -1;
  for (const p of S.bench) { if ((role === 'GK') !== (p.pos === 'GK')) continue; const v = effSkill(p, role); if (v > bv) { bv = v; best = p; } }
  return best;
}
function doSub(M, i, outE, pIn) {
  const S = M.sides[i];
  if (!pIn || S.subs <= 0 || !outE.on) return false;
  outE.on = false; outE.subOff = M.min;
  S.bench = S.bench.filter(p => p !== pIn);
  S.ps.push({ p: pIn, role: outE.role, pr: outE.pr, x: outE.x, y: outE.y, on: true, rt: 6.3, g: 0, as: 0, yc: 0, rc: 0, inj: false, mins: 0, subOn: M.min });
  S.subs--;
  if (S.pk === outE.p.id) S.pk = null; if (S.ck === outE.p.id) S.ck = null; if (S.fk === outE.p.id) S.fk = null;
  say(M, M.min, 'sub', `Substitution, ${S.name}: ${cap1(pn(pIn.p ? pIn.p : pIn))} replaces ${pn(outE.p)}.`, i);
  M.ev.push({ min: M.min, t: 'sub', side: i, p: pIn.id, o: outE.p.id });
  units(S);
  return true;
}
// user changes position/role of on-pitch players (swap)
function swapRoles(M, i, e1, e2) { const S = M.sides[i]; [e1.role, e2.role] = [e2.role, e1.role]; [e1.x, e2.x] = [e2.x, e1.x]; [e1.y, e2.y] = [e2.y, e1.y]; units(S); }

function simulateFull(M) { while (!M.done) { stepMinute(M); if (M.ht) M.ht = false; } return M; }

// apply results to players/fixture
function finalizeMatch(M) {
  const f = G.fx[M.fid];
  const [A, B] = M.sides;
  f.r = M.score.slice(); f.et = M.et; f.pen = M.pens;
  f.sc = M.ev.filter(e => e.t === 'goal' || e.t === 'rc').map(e => [e.min, e.side, e.t === 'rc' ? 'R' : 'G', e.p, e.a || null, e.st || null, e.sk || null]);
  f.st = M.sides.map(S => ({ sh: S.st.sh, ot: S.st.ot, co: S.st.co, fo: S.st.fo, po: Math.round(100 * S.st.po / Math.max(1, A.st.po + B.st.po)), yc: S.st.yc, rc: S.st.rc, xg: Math.round(S.st.xg * 100) / 100 }));
  // result rating adjustments
  for (let i = 0; i < 2; i++) {
    const S = M.sides[i], diff = M.score[i] - M.score[1 - i];
    for (const e of S.ps) {
      if (!e.mins && !e.on) continue;
      e.rt += diff > 0 ? .3 : diff < 0 ? -.3 : 0;
      if (M.score[1 - i] === 0 && ['GK', 'DC', 'DL', 'DR', 'WBL', 'WBR'].includes(e.role) && e.mins >= 60) e.rt += .45;
      e.rt += (roleSkill(e.p, e.role) * fam(e.p.pos, e.role) - 70) * 0.015 + R.gauss() * 0.35;
      e.rt = clamp(Math.round(e.rt * 10) / 10, 3, 10);
    }
  }
  const all = A.ps.concat(B.ps).filter(e => e.mins > 0);
  const mom = all.reduce((b, e) => !b || e.rt > b.rt ? e : b, null);
  f.mom = mom && !mom.p.pseudo ? mom.p.id : null; f.momN = mom ? mom.p.n : '';
  f.rt = M.sides.map(S => S.ps.filter(e => e.mins > 0 && !e.p.pseudo).map(e => [e.p.id, e.rt, e.g, e.as, e.subOn || 0]));
  // players
  for (let i = 0; i < 2; i++) {
    const S = M.sides[i]; if (T(S.tid).lite) continue;
    const res = Math.sign(M.score[i] - M.score[1 - i]);
    const playedIds = new Set();
    for (const e of S.ps) {
      const p = e.p; if (p.pseudo || !e.mins) continue;
      playedIds.add(p.id);
      const st = p.st; st.a++; if (!e.subOn) st.s++; st.g += e.g; if (M.comp === 'PL' || M.comp === 'CH') { st.lg = (st.lg || 0) + e.g; st.la = (st.la || 0) + 1; st.lr = (st.lr || 0) + e.rt; st.las = (st.las || 0) + e.as; } st.as += e.as; st.r += e.rt; if (e.yc) st.y++; if (e.rc) st.rc++;
      if (mom === e) st.mom++;
      if (e.role === 'GK' && M.score[1 - i] === 0 && e.mins >= 60) st.cs++;
      p.car.a++; p.car.g += e.g;
      p.form.push(e.rt); if (p.form.length > 5) p.form.shift();
      p.mor = clamp(p.mor + res * 4 + (e.rt - 6.6) * 4, 5, 100);
      if (e.yc && !e.rc) { p.yel++; if (p.yel === 5 || p.yel === 10 || p.yel === 15) { p.sus += p.yel === 5 ? 1 : 2; news('Suspension', `${p.n} (${tName(S.tid)}) will miss ${p.yel === 5 ? 'the next match' : 'two matches'} after reaching ${p.yel} yellow cards.`, S.tid); } }
      if (e.rc) { const n = e.rc === 2 ? 3 : 1; p.sus += n; if (isUser(S.tid)) news('Suspension', `${p.n} is suspended for ${n} match${n > 1 ? 'es' : ''} after his red card.`, S.tid); }
      if (e.inj) { p.inj = e.injDays; p.injT = R.pick(['hamstring strain', 'ankle sprain', 'calf strain', 'knee ligament damage', 'groin strain', 'thigh strain', 'foot injury', 'concussion protocol']); if (p.inj > 40) p.injT = R.pick(['knee ligament damage', 'broken metatarsal', 'torn hamstring']); if (isUser(S.tid) || p.ca >= 84) news('Injury', `${p.n} (${tName(S.tid)}) will be out for about ${Math.ceil(p.inj / 7)} week${p.inj > 7 ? 's' : ''} with a ${p.injT}.`, S.tid); }
    }
    // squad morale for those not playing
    for (const p of squad(S.tid)) if (!playedIds.has(p.id)) { if (p.ca >= 78 && p.age > 20) p.mor = clamp(p.mor - 1.5, 5, 100); }
    // suspensions served
    for (const p of squad(S.tid)) if (!playedIds.has(p.id) && p.sus > 0 && !M._served) { }
  }
  return f;
}
