// intl.js: international football. Nations, Nations League, Euro and World Cup qualifiers and finals, friendlies,
// England management (squads, call-ups, caps), dual club + country role. Competitions are data (G.intl.ed), so more
// playable nations can be added later: everything England-specific goes through PLAY_NAT.
// Loaded after history.js, before intro.js.

const PLAY_NAT = 'ENG'; // nations the user can manage (only England for now)
const INTL_NAMES = { UNL: 'Nations League', EQ: 'Euro qualifiers', EURO: 'European Championship', WCQ: 'World Cup qualifiers', WC: 'World Cup', FR: 'Friendly' };
Object.assign(COMP_NAME, INTL_NAMES);
Object.assign(COMP_SHORT, { UNL: 'UNL', EQ: 'EQ', EURO: 'EURO', WCQ: 'WCQ', WC: 'WC', FR: 'FRI' });
const INTL_C = Object.keys(INTL_NAMES);
function isIntlF(f) { return !!f && INTL_C.includes(f.comp); }
function isNatT(tid) { return !!(G && tid && G.teams[tid] && G.teams[tid].nat); }
function NID(c) { return 'N_' + c; }
const ENGID = NID(PLAY_NAT);

// ---------- nations ----------
let _NR = null;
function natRows() {
  if (_NR) return _NR;
  _NR = NATS_RAW.split('\n').map(l => { const [c, name, conf, rk, c1, c2] = l.split('|'); return { c, name, conf, rank: parseInt(rk, 10), est: rk.endsWith('e'), c1, c2 }; });
  return _NR;
}
function natRow(c) { return natRows().find(n => n.c === c); }
const UEFA_OUT = ['RUS']; // suspended by UEFA
function uefaCodes() { return natRows().filter(n => n.conf === 'UEFA' && !UEFA_OUT.includes(n.c)).map(n => n.c); }
function eloFromRank(r) { return Math.round(2000 - 280 * Math.log10(Math.max(1, r))); }
function strFromElo(e) { return clamp(Math.round(52 + (e - 1350) / 650 * 35), 50, 88); }
function natShort(n) { return { 'Republic of Ireland': 'Rep. Ireland', 'Bosnia and Herzegovina': 'Bosnia', 'Northern Ireland': 'N. Ireland', 'North Macedonia': 'N. Macedonia', 'Trinidad and Tobago': 'Trinidad', 'Equatorial Guinea': 'Eq. Guinea', 'Papua New Guinea': 'PNG', 'Solomon Islands': 'Solomon Is.' }[n] || n; }
function natMgr(name) { const m = MGR_DATA.find(x => x[2] === 'n' && x[3] === name); return m ? m[0] : 'Head coach'; }
function addNation(n) {
  const id = NID(n.c);
  if (G.teams[id]) return;
  const elo = eloFromRank(n.rank);
  G.teams[id] = { id, name: n.name, short: natShort(n.name), nat: true, code: n.c, conf: n.conf, lite: true, str: strFromElo(elo), rep: strFromElo(elo), stadium: n.c === 'ENG' ? 'Wembley Stadium' : n.name + ' national stadium', cap: n.c === 'ENG' ? 90000 : 40000, c1: n.c1, c2: n.c2, mgr: natMgr(n.name) };
  G.intl.elo[n.c] = elo;
}
function natRankList() { return Object.entries(G.intl.elo).sort((a, b) => b[1] - a[1]).map(x => x[0]); }
function natRank(c) { return natRankList().indexOf(c) + 1; }

// ---------- dates ----------
// international dates follow the 2026/27 windows, moved by 52 weeks a season like the club calendar
function winD(y, w, off) { return addDays(INTL_WINDOWS[w].a, 364 * (y - 2026) + off); }
function winRange(y, w) { return [winD(y, w, 0), addDays(INTL_WINDOWS[w].b, 364 * (y - 2026))]; }
function yShift(d, years) { return addDays(d, 364 * years); }

// ---------- player pool ----------
function engEligible(p) { return p && p.nat === PLAY_NAT && !['RETIRED', 'FA'].includes(p.c) && !String(p.c).startsWith('REL_') && p.age >= 17; }
function natPool(c) { return Object.values(G.players).filter(p => p && p.nat === c && !['RETIRED', 'FA'].includes(p.c) && !String(p.c).startsWith('REL_') && p.age >= 17); }
function poolScore(p) { const fm = p.form && p.form.length ? p.form.reduce((a, b) => a + b, 0) / p.form.length : 6.6; return p.ca + (fm - 6.6) * 2 + (p.inj > 10 ? -40 : p.inj > 0 ? -6 : 0); }
const NEED = { G: 3, D: 9, M: 8, A: 6 };
function pickSquad(pool, size) {
  const by = { G: [], D: [], M: [], A: [] };
  for (const p of pool.slice().sort((a, b) => poolScore(b) - poolScore(a))) by[POS_GROUP[p.pos] || 'M'].push(p);
  const out = [];
  for (const g in NEED) out.push(...by[g].slice(0, Math.round(NEED[g] * size / 26)));
  const rest = pool.filter(p => !out.includes(p)).sort((a, b) => poolScore(b) - poolScore(a));
  while (out.length < size && rest.length) out.push(rest.shift());
  return out.slice(0, size);
}
function natSquad(c) {
  if (c === PLAY_NAT) { const ids = userIsEng() ? G.intl.squad : G.intl.aiSq; if (ids && ids.length) return ids.map(P).filter(Boolean); }
  const t = T(NID(c)); const min = (t ? t.str : 60) - 12;
  return pickSquad(natPool(c).filter(p => p.ca >= min), 23);
}
function engStr() { const xi = pickSquad(natPool(PLAY_NAT).filter(p => p.inj <= 0), 26).sort((a, b) => b.ca - a.ca).slice(0, 13); return xi.length ? Math.round(xi.reduce((s, p) => s + p.ca, 0) / xi.length) : 80; }
function setupEnglandPool() {
  for (const l of ENG_ABROAD.split('\n')) {
    const [n, pos, age, club, ca] = l.split('|');
    if (Object.values(G.players).some(p => p.n === n)) continue;
    const p = mkPlayer({ n, c: 'ABROAD', ab: club, pos, age: +age, nat: PLAY_NAT, ca: +ca, seed: hash(n) % 999, pa: +ca + (age < 24 ? 3 : 0) });
    p.wage = 0; G.players[p.id] = p;
  }
  const byName = {}; for (const p of Object.values(G.players)) if (p) (byName[p.n] = byName[p.n] || []).push(p);
  for (const l of ENG_CAPS.split('\n')) {
    const [n, c, g] = l.split('|'); const ps = byName[n]; if (!ps) continue;
    const p = ps.find(x => x.nat === PLAY_NAT) || ps[0];
    p.nat = PLAY_NAT; p.ic = parseInt(c.replace('~', ''), 10); p.ig = parseInt(g.replace('~', ''), 10); if (c.includes('~')) p.icE = 1;
  }
}

// ---------- state ----------
function userIsEng() { return !!(G && G.intl && G.intl.job === PLAY_NAT); }
function ensureEngUser() {
  const t = T(ENGID); if (!t) return;
  if (!userIsEng()) { t.lite = true; t.str = engStr(); delete t.tac; return; }
  t.lite = false; t.mgr = G.mgr;
  if (!t.tac) t.tac = { form: '4-2-3-1', xi: [], bench: [], ment: 3, press: 2, tempo: 2, width: 2, pass: 2 };
  if (!t.fin) t.fin = newFin();
  t.bal = t.bal || 0; t.tb = t.tb || 0; t.wb = t.wb || 1; t.rep = 90;
  if (!G.intl.squad || !G.intl.squad.length) G.intl.squad = pickSquad(natPool(PLAY_NAT), 26).map(p => p.id);
  G.sq[ENGID] = G.intl.squad.slice();
  try { autoPick(ENGID); } catch (e) { console.error(e); }
}
function intlInit() {
  if (G.intl) return;
  G.intl = { v: 1, mode: 'club', job: null, club: null, sw: 0, elo: {}, ed: {}, order: [], hist: [], squad: [], aiSq: [], prev: [], ann: {}, fa: 60, tasks: [], called: {}, seen: {}, fr: [] };
  for (const n of natRows()) addNation(n);
  setupEnglandPool();
  T(ENGID).str = engStr();
  buildUNL27();
  scheduleCycle(0);
  intlCatchUp();
}
function intlTask(d, k, a) { G.intl.tasks.push({ d, k, a: a || null }); }

// ---------- fixtures helpers ----------
function ifx(o) { const f = addFx(o); bumpSeasonEnd(f.d); return f; }
function bumpSeasonEnd(d) {
  const tk = G.tasks.find(t => t.t === 'seasonEnd'); if (!tk) return;
  const end = sd(CAL.END);
  if (d > tk.d && d >= end && d <= addDays(end, 70)) tk.d = addDays(d, 1);
}
function fxWin(f) {
  if (!f || !f.r) return null;
  if (f.pen) return f.pen[0] > f.pen[1] ? f.h : f.a;
  let a = f.r[0], b = f.r[1];
  if (f.l1 && G.fx[f.l1] && G.fx[f.l1].r) { const l = G.fx[f.l1]; a += l.r[1]; b += l.r[0]; }
  return a > b ? f.h : b > a ? f.a : null;
}
function fxLose(f) { const w = fxWin(f); return w ? (w === f.h ? f.a : f.h) : null; }
function rr(ids, double) {
  const arr = ids.slice(); if (arr.length % 2) arr.push(null);
  const n = arr.length, rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs = [];
    for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i]; if (a && b) pairs.push(r % 2 ? [b, a] : [a, b]); }
    rounds.push(pairs); arr.splice(1, 0, arr.pop());
  }
  return double ? rounds.concat(rounds.map(p => p.map(([a, b]) => [b, a]))) : rounds;
}
function gTable(teams, fids) {
  const rows = {}; for (const t of teams) rows[t] = { t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  for (const id of fids) {
    const f = G.fx[id]; if (!f || !f.r || !rows[f.h] || !rows[f.a]) continue;
    const [a, b] = f.r; const H = rows[f.h], A = rows[f.a];
    H.p++; A.p++; H.gf += a; H.ga += b; A.gf += b; A.ga += a;
    if (a > b) { H.w++; A.l++; H.pts += 3; } else if (b > a) { A.w++; H.l++; A.pts += 3; } else { H.d++; A.d++; H.pts++; A.pts++; }
  }
  return Object.values(rows).map(r => (r.gd = r.gf - r.ga, r)).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || natRank(T(x.t).code) - natRank(T(y.t).code));
}
function edFx(E) { return Object.values(E.fx || {}).flat().concat((E.ko || []).flatMap(r => r.fx)); }

// ---------- Nations League 2026/27 (four leagues, real draw) ----------
function buildUNL27() {
  const E = { key: 'UNL27', comp: 'UNL', type: 'unl4', name: 'Nations League 2026/27', y: 2026, groups: {}, fx: {}, ko: [], stage: 'league' };
  const md = [winD(2026, 0, 5), winD(2026, 0, 8), winD(2026, 0, 12), winD(2026, 0, 15), winD(2026, 1, 3), winD(2026, 1, 6)];
  const real = UNL27_REAL.replace(/\n/g, '').split(';').filter(Boolean).map(s => { const [h, a, sc] = s.split('|'); return { h, a, sc: sc.split('-').map(Number) }; });
  for (const g in UNL27_GROUPS) {
    const codes = UNL27_GROUPS[g].split(' ');
    E.groups[g] = codes.map(NID); E.fx[g] = [];
    const rl = real.filter(x => codes.includes(x.h));
    let rounds;
    if (rl.length === 8) {
      rounds = [0, 1, 2, 3].map(i => rl.slice(i * 2, i * 2 + 2).map(x => [x.h, x.a, x.sc]));
      const done = new Set(rl.map(x => x.h + x.a)); const left = [];
      for (const a of codes) for (const b of codes) if (a !== b && !done.has(a + b)) left.push([a, b]);
      const ok = (p, q) => new Set([...p, ...q]).size === 4;
      let s = null; for (let i = 1; i < left.length && !s; i++) if (ok(left[0], left[i])) { const r1 = [left[0], left[i]], r2 = left.filter((_, j) => j !== 0 && j !== i); s = [r1, r2]; }
      if (s && s[1].some(([a, b]) => a === 'ENG' && b === 'CRO')) s.reverse();
      rounds.push(...s);
    } else rounds = rr(codes, true).map(r => r.map(([a, b]) => [a, b]));
    rounds.slice(0, 6).forEach((pairs, i) => { for (const [a, b, sc] of pairs) { const f = ifx({ comp: 'UNL', ed: 'UNL27', grp: g, d: md[i], h: NID(a), a: NID(b), rnd: `League ${g[0]} · Group ${g} · MD${i + 1}` }); if (sc) f.real = sc; E.fx[g].push(f.id); } });
  }
  G.intl.ed.UNL27 = E; G.intl.order.push('UNL27');
}
// ---------- Nations League from 2028/29 (three divisions of 18, groups of six) ----------
function buildUNL3(key, y, rankFrom) {
  const order = (rankFrom || uefaOrder()).filter(c => !UEFA_OUT.includes(c));
  const E = { key, comp: 'UNL', type: 'unl3', name: `Nations League ${y}/${String(y + 1).slice(2)}`, y, groups: {}, fx: {}, ko: [], stage: 'league' };
  const md = [winD(y, 0, 5), winD(y, 0, 8), winD(y, 0, 12), winD(y, 0, 15), winD(y, 1, 3), winD(y, 1, 6)];
  ['A', 'B', 'C'].forEach((dv, di) => {
    const div = order.slice(di * 18, di * 18 + 18); if (!div.length) return;
    const pots = [div.slice(0, 6), div.slice(6, 12), div.slice(12, 18)].map(p => R.shuffle(p.slice()));
    for (let gi = 0; gi < 3; gi++) {
      const g = dv + (gi + 1); const codes = [];
      for (const pot of pots) codes.push(...pot.slice(gi * 2, gi * 2 + 2));
      E.groups[g] = codes.map(NID); E.fx[g] = [];
      const rounds = rr(codes, false).slice(0, 5);
      rounds.push([[codes[1], codes[0]], [codes[3], codes[2]], [codes[5], codes[4]]].filter(([a, b]) => a && b));
      rounds.forEach((pairs, i) => { for (const [a, b] of pairs) E.fx[g].push(ifx({ comp: 'UNL', ed: key, grp: g, d: md[i], h: NID(a), a: NID(b), rnd: `League ${dv} · Group ${g} · MD${i + 1}` }).id); });
    }
  });
  G.intl.ed[key] = E; G.intl.order.push(key);
}
function uefaOrder() {
  // latest Nations League ranking, else ranking points
  const last = G.intl.order.slice().reverse().map(k => G.intl.ed[k]).find(E => E.comp === 'UNL' && E.stage !== 'league');
  const base = last ? unlRanking(last) : [];
  const rest = uefaCodes().filter(c => !base.includes(c)).sort((a, b) => natRank(a) - natRank(b));
  return base.concat(rest);
}
function unlRanking(E) {
  const out = [];
  const lgs = [...new Set(Object.keys(E.groups).map(g => g[0]))].sort();
  for (const lg of lgs) {
    const rows = [];
    for (const g of Object.keys(E.groups).filter(x => x[0] === lg)) gTable(E.groups[g], E.fx[g]).forEach((r, i) => rows.push({ c: T(r.t).code, pos: i, ppg: r.pts / Math.max(1, r.p), gd: r.gd / Math.max(1, r.p) }));
    rows.sort((a, b) => a.pos - b.pos || b.ppg - a.ppg || b.gd - a.gd);
    if (E.fin && lg === 'A') { const f = E.fin.map(t => T(t).code); rows.sort((a, b) => { const ia = f.indexOf(a.c), ib = f.indexOf(b.c); if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); return 0; }); }
    out.push(...rows.map(r => r.c));
  }
  return out;
}
function unlProgress(E) {
  if (E.stage === 'league') {
    const all = Object.values(E.fx).flat(); if (!all.every(id => G.fx[id].r)) return;
    const A = Object.keys(E.groups).filter(g => g[0] === 'A');
    const tabs = A.map(g => gTable(E.groups[g], E.fx[g]));
    let q;
    if (E.type === 'unl4') q = [[tabs[1][1].t, tabs[0][0].t], [tabs[0][1].t, tabs[1][0].t], [tabs[3][1].t, tabs[2][0].t], [tabs[2][1].t, tabs[3][0].t]];
    else { const top = tabs.flatMap(t => t.slice(0, 2)); const thirds = tabs.map(t => t[2]).sort((a, b) => b.pts - a.pts || b.gd - a.gd).slice(0, 2); const s = top.concat(thirds).map(r => r.t); q = [[s[7], s[0]], [s[6], s[1]], [s[5], s[2]], [s[4], s[3]]]; }
    const y = E.y; const d1 = winD(y, 2, 3), d2 = winD(y, 2, 6);
    const round = { n: 'Quarter-final', fx: [], pairs: q };
    for (const [a, b] of q) { const l1 = ifx({ comp: 'UNL', ed: E.key, d: d1, h: a, a: b, rnd: 'Quarter-final', leg: 1 }); const l2 = ifx({ comp: 'UNL', ed: E.key, d: d2, h: b, a: a, rnd: 'Quarter-final', leg: 2, l1: l1.id, need: true }); round.fx.push(l1.id, l2.id); }
    E.ko.push(round); E.stage = 'qf';
    news('Nations League', `${E.name}: the league phase is over. Quarter-finals: ${q.map(([a, b]) => tName(a) + ' v ' + tName(b)).join(', ')}.`, null, true);
    return;
  }
  const last = E.ko[E.ko.length - 1]; if (!last || !last.fx.every(id => G.fx[id].r)) return;
  const y = E.y;
  if (last.n === 'Quarter-final') {
    const w = last.fx.filter(id => G.fx[id].leg === 2).map(id => fxWin(G.fx[id]));
    const r = { n: 'Semi-final', fx: [] };
    r.fx.push(ifx({ comp: 'UNL', ed: E.key, d: winD(y, 3, 2), h: w[0], a: w[1], rnd: 'Semi-final', need: true, neutral: true, ven: 'Nations League Finals venue', vcap: 50000 }).id);
    r.fx.push(ifx({ comp: 'UNL', ed: E.key, d: winD(y, 3, 3), h: w[2], a: w[3], rnd: 'Semi-final', need: true, neutral: true, ven: 'Nations League Finals venue', vcap: 50000 }).id);
    E.ko.push(r); E.stage = 'finals';
  } else if (last.n === 'Semi-final') {
    const w = last.fx.map(id => fxWin(G.fx[id])), l = last.fx.map(id => fxLose(G.fx[id]));
    const r = { n: 'Final', fx: [] };
    r.fx.push(ifx({ comp: 'UNL', ed: E.key, d: winD(y, 3, 6), h: l[0], a: l[1], rnd: 'Third place', need: true, neutral: true, ven: 'Nations League Finals venue', vcap: 50000 }).id);
    r.fx.push(ifx({ comp: 'UNL', ed: E.key, d: winD(y, 3, 6), h: w[0], a: w[1], rnd: 'Final', need: true, neutral: true, ven: 'Nations League Finals venue', vcap: 60000 }).id);
    E.ko.push(r);
  } else if (last.n === 'Final') {
    const fF = G.fx[last.fx[1]], f3 = G.fx[last.fx[0]];
    E.fin = [fxWin(fF), fxLose(fF), fxWin(f3), fxLose(f3)];
    finishEdition(E, E.fin[0], E.fin[1]);
  }
}

// ---------- Euro qualifying (12 groups, hosts in separate groups) ----------
const EURO_HOSTS = { EURO28: ['ENG', 'SCO', 'WAL', 'IRL'], EURO32: ['ITA', 'TUR'] };
function buildEQ(key, y, euroKey) {
  const order = uefaOrder();
  const hosts = EURO_HOSTS[euroKey] || [];
  const unl = G.intl.ed[G.intl.order.slice().reverse().find(k => G.intl.ed[k].comp === 'UNL')];
  const qf = unl && unl.ko[0] ? unl.ko[0].pairs.flat().map(t => T(t).code) : [];
  const groups = Array.from({ length: 12 }, (_, i) => ({ g: 'G' + (i + 1), cap: i < 6 ? 5 : 4, t: [] }));
  // Nations League quarter-finalists go into the four-team groups
  qf.forEach((c, i) => groups[6 + (i % 6)].t.push(c));
  const rest = order.filter(c => !qf.includes(c));
  while (rest.length) {
    const open = groups.filter(g => g.t.length < g.cap).sort((a, b) => a.t.length - b.t.length);
    if (!open.length) break;
    const lvl = open[0].t.length; const slots = open.filter(g => g.t.length === lvl);
    const pot = R.shuffle(rest.splice(0, slots.length));
    for (const c of pot) {
      let g = slots.find(s => s.t.length === lvl && !(hosts.includes(c) && s.t.some(x => hosts.includes(x))));
      if (!g) g = slots.find(s => s.t.length === lvl);
      if (!g) { rest.push(c); continue; }
      g.t.push(c);
    }
  }
  const E = { key, comp: 'EQ', type: 'eq', name: `Euro ${euroKey.slice(-2) === '28' ? 2028 : 2000 + +euroKey.slice(-2)} qualifying`, y, euro: euroKey, hosts, groups: {}, fx: {}, ko: [], stage: 'league' };
  const md = [winD(y - 1, 2, 4), winD(y - 1, 2, 7), winD(y - 1, 3, 4), winD(y - 1, 3, 7), winD(y, 0, 4), winD(y, 0, 7), winD(y, 0, 11), winD(y, 0, 14), winD(y, 1, 4), winD(y, 1, 7)];
  for (const G0 of groups) {
    E.groups[G0.g] = G0.t.map(NID); E.fx[G0.g] = [];
    const rounds = rr(G0.t, true); const dates = G0.t.length === 5 ? md : md.slice(4);
    rounds.forEach((pairs, i) => { for (const [a, b] of pairs) E.fx[G0.g].push(ifx({ comp: 'EQ', ed: key, grp: G0.g, d: dates[i], h: NID(a), a: NID(b), rnd: `Group ${G0.g.slice(1)} · MD${i + 1}` }).id); });
  }
  G.intl.ed[key] = E; G.intl.order.push(key);
  const eg = Object.keys(E.groups).find(g => E.groups[g].includes(ENGID));
  news('Euro qualifying draw', `The ${E.name} draw has been made. ${eg ? `England are in Group ${eg.slice(1)} with ${E.groups[eg].filter(t => t !== ENGID).map(t => tName(t)).join(', ')}.` : ''}`, null, true);
}
function eqProgress(E) {
  if (E.stage === 'league') {
    const all = Object.values(E.fx).flat(); if (!all.every(id => G.fx[id].r)) return;
    const tabs = Object.keys(E.groups).map(g => gTable(E.groups[g], E.fx[g]));
    const win = tabs.map(t => t[0]), ru = tabs.map(t => t[1]).sort((a, b) => b.pts / b.p - a.pts / a.p || b.gd / b.p - a.gd / a.p || b.gf / b.p - a.gf / a.p);
    const q = win.map(r => r.t).concat(ru.slice(0, 8).map(r => r.t));
    const hostsOut = E.hosts.map(NID).filter(h => !q.includes(h)).sort((a, b) => eqPos(E, a) - eqPos(E, b));
    const hostQ = hostsOut.slice(0, 2); q.push(...hostQ);
    const spots = 24 - q.length;
    const unl = G.intl.ed[G.intl.order.find(k => G.intl.ed[k].comp === 'UNL')];
    const unlOrd = unl ? unlRanking(unl).map(NID) : [];
    const pool = ru.slice(8).map(r => r.t).filter(t => !q.includes(t));
    for (const t of unlOrd) { if (pool.length >= spots * 4) break; if (!q.includes(t) && !pool.includes(t)) pool.push(t); }
    E.qual = q; E.stage = spots > 0 ? 'po' : 'done';
    const paths = []; const pp = pool.slice(0, spots * 4).sort((a, b) => natRank(T(a).code) - natRank(T(b).code));
    for (let i = 0; i < spots; i++) paths.push([pp[i], pp[pp.length - 1 - i], pp[spots + i], pp[pp.length - 1 - spots - i]].filter(Boolean));
    const r = { n: 'Play-off semi-final', fx: [], paths };
    for (const p of paths) { r.fx.push(ifx({ comp: 'EQ', ed: E.key, d: winD(E.y, 2, 3), h: p[0], a: p[1], rnd: 'Play-off semi-final', need: true }).id); r.fx.push(ifx({ comp: 'EQ', ed: E.key, d: winD(E.y, 2, 3), h: p[2], a: p[3], rnd: 'Play-off semi-final', need: true }).id); }
    if (spots > 0) E.ko.push(r);
    news(E.name, `Qualified for Euro ${E.euro.slice(-2) === '28' ? 2028 : ''}: ${q.map(t => tName(t)).join(', ')}.${hostQ.length ? ` Host places: ${hostQ.map(t => tName(t)).join(', ')}.` : ''}${spots ? ` ${spots} more places go to the play-offs in March.` : ''}`, null, true);
    if (!spots) intlTask(addDays(G.date, 3), 'drawFinals', E.euro);
    return;
  }
  const last = E.ko[E.ko.length - 1]; if (!last || !last.fx.every(id => G.fx[id].r)) return;
  if (last.n === 'Play-off semi-final') {
    const r = { n: 'Play-off final', fx: [] };
    for (let i = 0; i < last.fx.length; i += 2) { const a = fxWin(G.fx[last.fx[i]]), b = fxWin(G.fx[last.fx[i + 1]]); const [h, aw] = natRank(T(a).code) <= natRank(T(b).code) ? [a, b] : [b, a]; r.fx.push(ifx({ comp: 'EQ', ed: E.key, d: winD(E.y, 2, 6), h, a: aw, rnd: 'Play-off final', need: true }).id); }
    E.ko.push(r);
  } else if (last.n === 'Play-off final') {
    const w = last.fx.map(id => fxWin(G.fx[id])); E.qual.push(...w); E.stage = 'done';
    news(E.name, `Play-off winners: ${w.map(t => tName(t)).join(', ')}. The finals line-up is complete.`, null, true);
    intlTask(addDays(G.date, 6), 'drawFinals', E.euro);
  }
}
function eqPos(E, tid) { for (const g in E.groups) { const i = gTable(E.groups[g], E.fx[g]).findIndex(r => r.t === tid); if (i >= 0) return i; } return 9; }

// ---------- World Cup qualifying (UEFA, two leagues, six games each) ----------
function circ(codes) {
  // 6 games each: offsets 1, 3, 5 split by parity = 6 perfect matchings
  const n = codes.length, rounds = [];
  for (const k of [1, 3, 5]) for (const par of [0, 1]) { const r = []; for (let i = par; i < n; i += 2) r.push([codes[i], codes[(i + k) % n]]); rounds.push(r); }
  return rounds;
}
const WC_HOSTS = { WC30: ['ESP', 'POR', 'MAR', 'ARG', 'URU', 'PAR'], WC34: ['KSA'] };
function buildWCQ(key, y, wcKey) {
  const hosts = WC_HOSTS[wcKey] || [];
  const order = uefaOrder().filter(c => !hosts.includes(c));
  const L1 = order.slice(0, 36), L2 = order.slice(36);
  const E = { key, comp: 'WCQ', type: 'wcq', name: `World Cup ${wcKey === 'WC30' ? 2030 : 2000 + +wcKey.slice(2)} qualifying (UEFA)`, y, wc: wcKey, groups: {}, fx: {}, ko: [], stage: 'league' };
  const md = [winD(y, 0, 5), winD(y, 0, 8), winD(y, 0, 12), winD(y, 0, 15), winD(y, 1, 3), winD(y, 1, 6)];
  const pots = [L1.slice(0, 12), L1.slice(12, 24), L1.slice(24, 36)].map(p => R.shuffle(p.slice()));
  const gs = [[], [], []]; for (let gi = 0; gi < 3; gi++) for (let k = 0; k < 4; k++) for (const pot of pots) gs[gi].push(pot[gi * 4 + k]);
  const add = (g, codes) => { E.groups[g] = codes.map(NID); E.fx[g] = []; circ(codes).forEach((pairs, i) => { for (const [a, b] of pairs) E.fx[g].push(ifx({ comp: 'WCQ', ed: key, grp: g, d: md[i], h: NID(a), a: NID(b), rnd: `${g.startsWith('L2') ? 'League 2' : 'League 1 · Group ' + g.slice(-1)} · MD${i + 1}` }).id); }); };
  gs.forEach((codes, i) => add('L1' + 'ABC'[i], codes.filter(Boolean)));
  if (L2.length >= 8) add('L2', R.shuffle(L2.slice(0, 16)).concat([]).slice(0, L2.length - (L2.length % 2)));
  G.intl.ed[key] = E; G.intl.order.push(key);
  const eg = Object.keys(E.groups).find(g => E.groups[g].includes(ENGID));
  news('World Cup qualifying', `${E.name} begins. ${eg ? `England are in ${eg.startsWith('L2') ? 'League 2' : 'League 1, Group ' + eg.slice(-1)}.` : ''} Top three in each League 1 group qualify; twenty teams play off for five more places.`, null, true);
}
function wcqProgress(E) {
  if (E.stage === 'league') {
    const all = Object.values(E.fx).flat(); if (!all.every(id => G.fx[id].r)) return;
    const q = [], po = [];
    for (const g of ['L1A', 'L1B', 'L1C']) { const t = gTable(E.groups[g], E.fx[g]); q.push(...t.slice(0, 3).map(r => r.t)); po.push(...t.slice(3, 9).map(r => r.t)); }
    if (E.groups.L2) po.push(...gTable(E.groups.L2, E.fx.L2).slice(0, 2).map(r => r.t));
    E.qual = q; E.stage = 'po';
    const pp = po.slice(0, 20).sort((a, b) => natRank(T(a).code) - natRank(T(b).code)); const paths = [];
    for (let i = 0; i < 5; i++) paths.push([pp[i], pp[19 - i], pp[5 + i], pp[14 - i]].filter(Boolean));
    const r = { n: 'Play-off semi-final', fx: [], paths };
    for (const p of paths) { if (p.length < 4) continue; r.fx.push(ifx({ comp: 'WCQ', ed: E.key, d: winD(E.y, 2, 3), h: p[0], a: p[1], rnd: 'Play-off semi-final', need: true }).id); r.fx.push(ifx({ comp: 'WCQ', ed: E.key, d: winD(E.y, 2, 3), h: p[2], a: p[3], rnd: 'Play-off semi-final', need: true }).id); }
    E.ko.push(r);
    news(E.name, `Through to the World Cup: ${q.map(t => tName(t)).join(', ')}. Twenty teams go into the March play-offs.`, null, true);
    return;
  }
  const last = E.ko[E.ko.length - 1]; if (!last || !last.fx.every(id => G.fx[id].r)) return;
  if (last.n === 'Play-off semi-final') {
    const r = { n: 'Play-off final', fx: [] };
    for (let i = 0; i < last.fx.length; i += 2) { const a = fxWin(G.fx[last.fx[i]]), b = fxWin(G.fx[last.fx[i + 1]]); const [h, aw] = natRank(T(a).code) <= natRank(T(b).code) ? [a, b] : [b, a]; r.fx.push(ifx({ comp: 'WCQ', ed: E.key, d: winD(E.y, 2, 6), h, a: aw, rnd: 'Play-off final', need: true }).id); }
    E.ko.push(r);
  } else if (last.n === 'Play-off final') {
    const w = last.fx.map(id => fxWin(G.fx[id])); E.qual.push(...w); E.stage = 'done';
    news(E.name, `Play-off winners: ${w.map(t => tName(t)).join(', ')}.`, null, true);
    intlTask(addDays(G.date, 6), 'drawFinals', E.wc);
  }
}

// ---------- finals tournaments (Euro 24 teams, World Cup 48 teams) ----------
const FIN_SPEC = {
  EURO28: { comp: 'EURO', name: 'Euro 2028', size: 24, start: '2028-06-09', ko: [['Round of 16', ['2028-06-24', '2028-06-24', '2028-06-25', '2028-06-25', '2028-06-26', '2028-06-26', '2028-06-27', '2028-06-27']], ['Quarter-final', ['2028-06-30', '2028-06-30', '2028-07-01', '2028-07-01']], ['Semi-final', ['2028-07-04', '2028-07-05']], ['Final', ['2028-07-09']]], ven: ['Wembley Stadium', 'Aviva Stadium, Dublin', 'Principality Stadium, Cardiff', 'Hampden Park, Glasgow', 'Tottenham Hotspur Stadium', 'Etihad Stadium', 'Hill Dickinson Stadium', "St James' Park", 'Villa Park'], final: 'Wembley Stadium', semis: 'Wembley Stadium' },
  WC30: { comp: 'WC', name: 'World Cup 2030', size: 48, start: '2030-06-13', ko: [['Round of 32', ['2030-06-30', '2030-06-30', '2030-06-30', '2030-06-30', '2030-07-01', '2030-07-01', '2030-07-01', '2030-07-01', '2030-07-02', '2030-07-02', '2030-07-02', '2030-07-02', '2030-07-03', '2030-07-03', '2030-07-03', '2030-07-03']], ['Round of 16', ['2030-07-05', '2030-07-05', '2030-07-06', '2030-07-06', '2030-07-07', '2030-07-07', '2030-07-08', '2030-07-08']], ['Quarter-final', ['2030-07-10', '2030-07-10', '2030-07-11', '2030-07-11']], ['Semi-final', ['2030-07-14', '2030-07-15']], ['Final', ['2030-07-21']]], ven: ['Madrid', 'Barcelona', 'Seville', 'Bilbao', 'Valencia', 'Lisbon', 'Porto', 'Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir'], final: 'World Cup final venue', semis: null, third: '2030-07-20' }
};
function finSpec(key) {
  if (FIN_SPEC[key]) return FIN_SPEC[key];
  const base = key.startsWith('EURO') ? 'EURO28' : 'WC30'; const yrs = +key.slice(-2) - +base.slice(-2);
  const b = FIN_SPEC[base];
  return Object.assign({}, b, { name: (base === 'EURO28' ? 'Euro 20' : 'World Cup 20') + key.slice(-2), start: yShift(b.start, yrs), ko: b.ko.map(([n, ds]) => [n, ds.map(d => yShift(d, yrs))]), third: b.third ? yShift(b.third, yrs) : null, ven: base === 'EURO28' ? ['Host venue'] : ['Host venue'], final: 'Final venue', semis: null });
}
function wcQualifiers(key) {
  const hosts = (WC_HOSTS[key] || []).map(NID);
  const ueq = G.intl.ed[G.intl.order.slice().reverse().find(k => G.intl.ed[k].comp === 'WCQ' && G.intl.ed[k].wc === key)];
  const q = new Set(hosts.concat(ueq ? ueq.qual : []));
  const slots = { CONMEBOL: 6, CAF: 10, AFC: 8, CONCACAF: 6, OFC: 1 };
  for (const conf in slots) {
    const have = [...q].filter(t => T(t).conf === conf).length;
    const cand = natRows().filter(n => n.conf === conf && !q.has(NID(n.c))).map(n => ({ t: NID(n.c), s: G.intl.elo[n.c] + R.gauss() * 45 })).sort((a, b) => b.s - a.s);
    for (const c of cand.slice(0, Math.max(0, slots[conf] - have))) q.add(c.t);
  }
  const rest = natRows().filter(n => n.conf !== 'UEFA' && !q.has(NID(n.c))).sort((a, b) => G.intl.elo[b.c] - G.intl.elo[a.c]);
  while (q.size < 48 && rest.length) q.add(NID(rest.shift().c));
  return [...q].slice(0, 48);
}
function drawFinals(key) {
  if (G.intl.ed[key]) return;
  const S = finSpec(key);
  let teams;
  if (S.comp === 'EURO') { const eq = G.intl.ed[G.intl.order.slice().reverse().find(k => G.intl.ed[k].comp === 'EQ' && G.intl.ed[k].euro === key)]; teams = eq ? eq.qual.slice(0, 24) : []; if (teams.length < 24) teams = teams.concat(uefaCodes().map(NID).filter(t => !teams.includes(t)).sort((a, b) => natRank(T(a).code) - natRank(T(b).code))).slice(0, 24); }
  else teams = wcQualifiers(key);
  const hosts = (EURO_HOSTS[key] || WC_HOSTS[key] || []).map(NID).filter(h => teams.includes(h));
  const ng = S.size / 4; const ord = teams.slice().sort((a, b) => (hosts.includes(b) - hosts.includes(a)) || natRank(T(a).code) - natRank(T(b).code));
  const pots = [0, 1, 2, 3].map(i => R.shuffle(ord.slice(i * ng, i * ng + ng)));
  if (hosts.length) pots[0] = hosts.slice(0, ng).concat(R.shuffle(pots[0].filter(t => !hosts.includes(t))));
  const E = { key, comp: S.comp, type: 'fin', name: S.name, y: +S.start.slice(0, 4) - 1, groups: {}, fx: {}, ko: [], stage: 'groups', hosts: hosts.map(t => T(t).code) };
  const L = 'ABCDEFGHIJKL';
  let vi = 0; const ven = () => S.ven[(vi++) % S.ven.length];
  for (let gi = 0; gi < ng; gi++) {
    const g = L[gi]; const ts = pots.map(p => p[gi]).filter(Boolean);
    E.groups[g] = ts; E.fx[g] = [];
    const d1 = addDays(S.start, Math.floor(gi * 6 / ng)); const ds = [d1, addDays(d1, 5), addDays(d1, 9)];
    const pairs = [[[ts[0], ts[1]], [ts[2], ts[3]]], [[ts[0], ts[2]], [ts[3], ts[1]]], [[ts[3], ts[0]], [ts[1], ts[2]]]];
    pairs.forEach((rp, i) => { for (let [a, b] of rp) { if (!a || !b) continue; if (b === ENGID && S.comp === 'EURO' && hosts.includes(ENGID)) [a, b] = [b, a]; const atW = a === ENGID && S.comp === 'EURO' && hosts.includes(ENGID); E.fx[g].push(ifx({ comp: S.comp, ed: key, grp: g, d: ds[i], h: a, a: b, rnd: `Group ${g} · MD${i + 1}`, neutral: !atW && !hosts.includes(a), ven: atW ? 'Wembley Stadium' : ven(), vcap: atW ? 90000 : 50000 }).id); } });
  }
  G.intl.ed[key] = E; G.intl.order.push(key);
  const eg = Object.keys(E.groups).find(g => E.groups[g].includes(ENGID));
  news(S.name + ' draw', `The ${S.name} draw has been made.${eg ? ` England are in Group ${eg} with ${E.groups[eg].filter(t => t !== ENGID).map(t => tName(t)).join(', ')}.` : ' England have not qualified.'}`, null, true);
}
function finProgress(E) {
  const S = finSpec(E.key);
  if (E.stage === 'groups') {
    const all = Object.values(E.fx).flat(); if (!all.every(id => G.fx[id].r)) return;
    const tabs = Object.keys(E.groups).map(g => ({ g, t: gTable(E.groups[g], E.fx[g]) }));
    const nThird = S.size === 24 ? 4 : 8;
    const W = tabs.map(x => x.t[0]).sort(cmpRow), Rn = tabs.map(x => x.t[1]).sort(cmpRow), Th = tabs.map(x => x.t[2]).sort(cmpRow).slice(0, nThird);
    const seeds = W.concat(Rn, Th).map(r => r.t);
    const n = seeds.length; const grpOf = {}; for (const x of tabs) for (const r of x.t) grpOf[r.t] = x.g;
    const pairs = []; const pool = seeds.slice();
    while (pool.length) { const a = pool.shift(); let j = pool.length - 1; while (j > 0 && grpOf[pool[j]] === grpOf[a]) j--; pairs.push([a, pool.splice(j, 1)[0]]); }
    const order = bracketOrder(pairs.length).map(i => pairs[i]);
    E.stage = 'ko'; koRound(E, S, 0, order);
    const out = Object.keys(E.groups).flatMap(g => E.groups[g]).filter(t => !seeds.includes(t));
    if (out.includes(ENGID)) news(S.name, 'England are out of the tournament after the group stage.', ENGID, true);
    return;
  }
  const last = E.ko[E.ko.length - 1]; if (!last || !last.fx.every(id => G.fx[id].r)) return;
  const main = last.fx.filter(id => G.fx[id].rnd !== 'Third place');
  const w = main.map(id => fxWin(G.fx[id]));
  if (last.n === 'Final') { const f = G.fx[main[0]]; E.fin = [fxWin(f), fxLose(f)]; const t3 = last.fx.find(id => G.fx[id].rnd === 'Third place'); if (t3) E.fin.push(fxWin(G.fx[t3])); E.stage = 'done'; finishEdition(E, E.fin[0], E.fin[1]); return; }
  const lose = main.map(id => fxLose(G.fx[id]));
  if (lose.includes(ENGID)) news(S.name, `England are knocked out in the ${last.n.toLowerCase()}.`, ENGID, true);
  const ri = S.ko.findIndex(k => k[0] === last.n) + 1;
  const pairs = []; for (let i = 0; i < w.length; i += 2) pairs.push([w[i], w[i + 1]]);
  koRound(E, S, ri, pairs, last.n === 'Semi-final' ? lose : null);
}
function cmpRow(a, b) { return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf; }
function bracketOrder(n) { if (n === 16) return [0, 15, 7, 8, 3, 12, 4, 11, 1, 14, 6, 9, 2, 13, 5, 10]; if (n === 8) return [0, 7, 3, 4, 1, 6, 2, 5]; return Array.from({ length: n }, (_, i) => i); }
function koRound(E, S, ri, pairs, semiLosers) {
  const [n, ds] = S.ko[ri]; const r = { n, fx: [] };
  pairs.forEach(([a, b], i) => {
    const eng = a === ENGID || b === ENGID; const host = S.comp === 'EURO' && E.hosts.includes(PLAY_NAT) && eng;
    let ven = n === 'Final' ? S.final : n === 'Semi-final' && S.semis ? S.semis : S.ven[(i + ri) % S.ven.length];
    if (host) ven = 'Wembley Stadium';
    const [h, aw] = host && b === ENGID ? [b, a] : [a, b];
    r.fx.push(ifx({ comp: S.comp, ed: E.key, d: ds[i] || ds[ds.length - 1], h, a: aw, rnd: n, need: true, neutral: !(host && ven === 'Wembley Stadium'), ven, vcap: ven === 'Wembley Stadium' ? 90000 : 60000 }).id);
  });
  if (semiLosers && S.third) r.fx.unshift(ifx({ comp: S.comp, ed: E.key, d: S.third, h: semiLosers[0], a: semiLosers[1], rnd: 'Third place', need: true, neutral: true, ven: S.ven[0], vcap: 50000 }).id);
  E.ko.push(r);
}

// ---------- end of a competition ----------
const INTL_TRO = { UNL: 'Nations League', EURO: 'European Championship', WC: 'World Cup' };
function finishEdition(E, w, r) {
  E.stage = 'done';
  G.intl.hist.push({ key: E.key, comp: E.comp, name: E.name, w, r, d: G.date });
  honour(w, INTL_TRO[E.comp] || E.name);
  news(E.name, `${tName(w, false)} win the ${E.name}, beating ${tName(r, false)} in the final.`, w, true);
  faReview(E);
}

// ---------- the four-year cycle ----------
function scheduleCycle(k) {
  const Y0 = 2026 + 4 * k;
  const ek = 'EURO' + String(Y0 + 2).slice(2), wk = 'WC' + String(Y0 + 4).slice(2);
  if (k > 0) intlTask(yShift('2026-08-20', 4 * k), 'unl3', { key: 'UNL' + String(Y0 + 1).slice(2), y: Y0 });
  intlTask(yShift('2026-12-06', 4 * k), 'eq', { key: 'EQ' + String(Y0 + 2).slice(2), y: Y0 + 1, euro: ek });
  intlTask(yShift('2028-08-20', 4 * k), 'unl3', { key: 'UNL' + String(Y0 + 3).slice(2), y: Y0 + 2 });
  intlTask(yShift('2029-07-20', 4 * k), 'wcq', { key: 'WCQ' + String(Y0 + 4).slice(2), y: Y0 + 3, wc: wk });
  intlTask(yShift('2030-08-10', 4 * k), 'cycle', { k: k + 1 });
}
function runIntlTask(tk) {
  const a = tk.a || {};
  if (tk.k === 'unl3') buildUNL3(a.key, a.y);
  else if (tk.k === 'eq') buildEQ(a.key, a.y, a.euro);
  else if (tk.k === 'wcq') buildWCQ(a.key, a.y, a.wc);
  else if (tk.k === 'drawFinals') drawFinals(a);
  else if (tk.k === 'cycle') scheduleCycle(a.k);
}
function intlProgress() {
  for (const k of G.intl.order) {
    const E = G.intl.ed[k]; if (!E || E.stage === 'done') continue;
    try {
      if (E.comp === 'UNL') unlProgress(E); else if (E.comp === 'EQ') eqProgress(E); else if (E.comp === 'WCQ') wcqProgress(E); else if (E.type === 'fin') finProgress(E);
    } catch (e) { console.error(e && e.stack || e); }
  }
}

// ---------- after each day: caps, goals, ranking points ----------
const ELO_K = { WC: 55, EURO: 50, UNL: 35, EQ: 40, WCQ: 40, FR: 20 };
function intlAfterMatches(ids) {
  for (const id of ids) {
    const f = G.fx[id]; if (!isIntlF(f) || !f.r || f.ex) continue;
    f.ex = 1;
    const ch = T(f.h).code, ca = T(f.a).code; if (!ch || !ca) continue;
    const eh = G.intl.elo[ch], ea = G.intl.elo[ca];
    const exp = 1 / (1 + Math.pow(10, -((eh + (f.neutral ? 0 : 60)) - ea) / 600));
    const res = f.pen ? 0.5 + (f.pen[0] > f.pen[1] ? .1 : -.1) : f.r[0] > f.r[1] ? 1 : f.r[0] < f.r[1] ? 0 : .5;
    const k = (ELO_K[f.comp] || 30) * (1 + Math.min(3, Math.abs(f.r[0] - f.r[1])) * .25);
    G.intl.elo[ch] = Math.round(eh + k * (res - exp)); G.intl.elo[ca] = Math.round(ea - k * (res - exp));
    if (!f.ix) capsQuick(f);
    if (f.h === ENGID || f.a === ENGID) engResult(f);
  }
}
function capsQuick(f) {
  f.ix = 1;
  for (const [tid, gl] of [[f.h, f.r[0]], [f.a, f.r[1]]]) {
    const sq = natSquad(T(tid).code); if (!sq.length) continue;
    const xi = pickSquad(sq.filter(p => p.inj <= 0), 14);
    for (const p of xi) p.ic = (p.ic || 0) + 1;
    const att = xi.filter(p => ['A', 'M'].includes(POS_GROUP[p.pos]));
    for (let g = 0; g < gl; g++) { if (!att.length || R.chance(.12)) continue; const w = att.map(p => (POS_GROUP[p.pos] === 'A' ? 3 : 1) * (p.ca / 80)); let x = Math.random() * w.reduce((a, b) => a + b, 0), i = 0; while (x > w[i]) x -= w[i++]; att[Math.min(i, att.length - 1)].ig = (att[Math.min(i, att.length - 1)].ig || 0) + 1; }
  }
}
function engResult(f) {
  if (!userIsEng()) return;
  const eh = f.h === ENGID; const gf = f.r[eh ? 0 : 1], ga = f.r[eh ? 1 : 0];
  const won = fxWin(f) === ENGID || (!f.need && gf > ga), lost = fxLose(f) === ENGID || (!f.need && gf < ga);
  const w = f.comp === 'FR' ? 1 : 3;
  G.intl.fa = clamp(G.intl.fa + (won ? w : lost ? -w * 1.5 : 0), 0, 100);
}
const _pseudoI = pseudoSide;
pseudoSide = function (team) {
  const s = _pseudoI(team);
  if (!team.nat || !G.intl) return s;
  try {
    const db = natSquad(team.code).filter(p => p.inj <= 0).sort((a, b) => b.ca - a.ca);
    const stars = (NAT_STARS[team.code] || '').split(';').filter(Boolean).map(x => { const [n, pos] = x.split('|'); return { n, pos }; });
    const used = new Set();
    const take = (pos) => { let p = db.find(x => !used.has(x.n) && POS_GROUP[x.pos] === POS_GROUP[pos]); if (p) { used.add(p.n); return { n: p.n, src: p.id }; } const st = stars.find(x => !used.has(x.n) && POS_GROUP[x.pos] === POS_GROUP[pos]); if (st) { used.add(st.n); return { n: st.n }; } return null; };
    for (const e of s.ps) { const x = take(e.pos); if (x) { e.n = x.n; if (x.src) e.src = x.src; } }
    for (const e of s.bench) { const x = take(e.pos); if (x) { e.n = x.n; if (x.src) e.src = x.src; } }
  } catch (e) { console.error(e); }
  return s;
};
const _finI = finalizeMatch;
finalizeMatch = function (M) {
  const f = G.fx[M.fid];
  if (!isIntlF(f)) return _finI(M);
  const snaps = [];
  for (const S of M.sides) if (!T(S.tid).lite) for (const e of S.ps) if (!e.p.pseudo) { const p = e.p; snaps.push([p, JSON.parse(JSON.stringify(p.st)), Object.assign({}, p.car), p.yel, p.sus, p.form.slice(), p.mor]); }
  const r = _finI(M);
  for (const [p, st, car, yel, sus, form, mor] of snaps) { p.st = st; p.car = car; p.yel = yel; p.sus = sus; p.form = form; p.mor = clamp(mor + (p.mor - mor) * .5, 5, 100); }
  for (const S of M.sides) for (const e of S.ps) { if (!e.mins) continue; const p = P(e.p.pseudo ? e.p.src : e.p.id); if (!p) continue; p.ic = (p.ic || 0) + 1; p.ig = (p.ig || 0) + (e.g || 0); }
  f.ix = 1;
  return r;
};
// England's squad must always be able to field a team
function engSquadFix() {
  const t = T(ENGID); if (!t || t.lite) return;
  let ids = (G.sq[ENGID] || []).filter(id => P(id) && engEligible(P(id)));
  if (ids.map(P).filter(p => available(p)).length < 16) { const add = pickSquad(natPool(PLAY_NAT).filter(p => available(p) && !ids.includes(p.id)), 26 - Math.min(ids.length, 10)); ids = ids.filter(id => available(P(id))).slice(0, 10).concat(add.map(p => p.id)).slice(0, 26); }
  G.sq[ENGID] = ids; if (userIsEng()) G.intl.squad = ids.slice();
  const bad = !t.tac || !t.tac.xi || t.tac.xi.length < 11 || t.tac.xi.some(id => !id || !ids.includes(id) || !available(P(id)));
  if (bad) autoPick(ENGID); else t.tac.bench = (t.tac.bench || []).filter(id => ids.includes(id) && available(P(id)));
}
const _cmI = createMatch;
createMatch = function (fid) { try { const f = G.fx[fid]; if (f && isIntlF(f) && (f.h === ENGID || f.a === ENGID)) engSquadFix(); } catch (e) { console.error(e); } return _cmI.apply(this, arguments); };
const _venueI = venueOf;
venueOf = function (f) {
  if (!isIntlF(f)) return _venueI(f);
  const t = T(f.h) || {};
  return { name: f.ven || t.stadium || 'National stadium', cap: f.vcap || t.cap || 40000, neutral: !!f.neutral, stands: STANDS_DEF };
};

// ---------- England: call-ups, squads, windows ----------
function engFixtures(from) { return Object.values(G.fx).filter(f => isIntlF(f) && (f.h === ENGID || f.a === ENGID) && f.d >= (from || '0')).sort((a, b) => a.d < b.d ? -1 : 1); }
function nextEngBlock() {
  const fs = engFixtures(G.date).filter(f => !f.r); if (!fs.length) return null;
  const blk = [fs[0]]; for (const f of fs.slice(1)) { if (dDiff(blk[blk.length - 1].d, f.d) <= 12) blk.push(f); else break; }
  return { s: blk[0].d, e: blk[blk.length - 1].d, fx: blk };
}
function announceSquad(B) {
  const key = B.s; if (G.intl.ann[key]) return; G.intl.ann[key] = 1;
  const comp = COMP_NAME[B.fx[0].comp];
  const opp = B.fx.map(f => tName(f.h === ENGID ? f.a : f.h)).join(', ');
  if (userIsEng()) {
    G.intl.sqDue = addDays(B.s, -3); G.intl.sqDone = false;
    msg('England squad due', `Name your England squad (23 to 26 players) by ${dNice(G.intl.sqDue, false)}. Fixtures: ${B.fx.map(f => `${dShort(f.d)} ${f.h === ENGID ? 'v' : 'at'} ${tName(f.h === ENGID ? f.a : f.h)}`).join(', ')} (${comp}). Open International > Squad.`, { k: 'nav', v: 'intl' });
    return;
  }
  const prev = G.intl.aiSq || [];
  const sq = pickSquad(natPool(PLAY_NAT), 26).map(p => p.id);
  G.intl.aiSq = sq; T(ENGID).str = engStr();
  callupNews(sq, prev, T(ENGID).mgr, opp);
}
function callupNews(sq, prev, by, opp) {
  const newIn = sq.filter(id => !prev.includes(id) && (P(id).ic || 0) === 0).map(P);
  const dropped = prev.filter(id => !sq.includes(id) && P(id) && engEligible(P(id))).map(P).filter(p => p.ca >= 80 && p.inj <= 0);
  for (const id of sq) { const p = P(id); if (p && typeof setHap === 'function') setHap(p, prev.includes(id) ? 1 : 4); }
  for (const p of dropped) if (typeof setHap === 'function') setHap(p, -6);
  const mine = sq.map(P).filter(p => p && p.c === clubUser());
  news('England squad', `${by} names a ${sq.length}-man England squad for games against ${opp}.${newIn.length ? ` First call-ups: ${newIn.map(p => p.n).join(', ')}.` : ''}${dropped.length ? ` Left out: ${dropped.slice(0, 4).map(p => p.n).join(', ')}.` : ''}`, ENGID, true);
  if (mine.length) news('International duty', `Called up by England: ${mine.map(p => p.n).join(', ')}.`, clubUser());
  for (const p of dropped) if (p.c === clubUser()) news('Squad morale', `${p.n} is disappointed to be left out of the England squad.`, clubUser());
}
function clubUser() { return G.intl && G.intl.sw ? G.intl.club : (isNatT(G.user) ? null : G.user); }
function confirmSquad(ids) {
  const n = ids.length; if (n < 23 || n > 26) return 'Pick between 23 and 26 players.';
  if (ids.map(P).filter(p => POS_GROUP[p.pos] === 'G').length < 3) return 'Pick at least three goalkeepers.';
  const prev = G.intl.squad || [];
  G.intl.prev = prev.slice(); G.intl.squad = ids.slice(); G.intl.sqDone = true;
  if (userIsEng() && (isNatT(G.user))) { G.sq[ENGID] = ids.slice(); try { autoPick(ENGID); } catch (e) { } }
  const B = nextEngBlock();
  callupNews(ids, prev, G.mgr, B ? B.fx.map(f => tName(f.h === ENGID ? f.a : f.h)).join(', ') : 'the next games');
  return null;
}
// club call-ups for every nation during FIFA windows: fatigue and the odd injury on return
function windowTick() {
  const y = G.year;
  for (let w = 0; w < 4; w++) {
    const yy = w >= 2 ? y : y; const [a, b] = winRange(yy, w);
    if (G.date === a) {
      const playing = new Set(Object.values(G.fx).filter(f => isIntlF(f) && f.d >= a && f.d <= b).flatMap(f => [T(f.h).code, T(f.a).code]));
      G.intl.called = {};
      for (const c of playing) for (const p of natSquad(c)) if (p.c !== 'ABROAD') G.intl.called[p.id] = c;
      const cu = clubUser();
      if (cu) { const mine = Object.keys(G.intl.called).map(P).filter(p => p && p.c === cu); if (mine.length) news('International break', `${mine.length} of your players are away on international duty: ${mine.slice(0, 10).map(p => `${p.n} (${tName(NID(G.intl.called[p.id]))})`).join(', ')}${mine.length > 10 ? '…' : ''}.`, cu); }
    }
    if (G.date === addDays(b, 1) && Object.keys(G.intl.called).length) {
      const cu = clubUser();
      for (const id in G.intl.called) {
        const p = P(id); if (!p) continue;
        p.cond = Math.max(55, p.cond - R.i(4, 16));
        if (p.inj <= 0 && R.chance(.03)) { p.inj = R.i(5, 28); p.injT = R.pick(['hamstring strain', 'ankle sprain', 'calf strain', 'groin strain']); if (p.c === cu) news('International duty', `${p.n} returns from international duty with a ${p.injT} and will miss about ${Math.ceil(p.inj / 7)} week${p.inj > 7 ? 's' : ''}.`, cu); else if (G.intl.called[id] === PLAY_NAT && userIsEng() && T(p.c) && !T(p.c).lite) news('Club v country', `${T(p.c).mgr} is unhappy that ${p.n} came back from England duty injured.`, ENGID); }
      }
      G.intl.called = {};
    }
  }
}
// dual role: the user runs England during its match blocks, then goes back to the club
function swapCheck() {
  if (!userIsEng()) return;
  if (G.intl.mode === 'nat') { if (G.user !== ENGID) { G.user = ENGID; ensureEngUser(); } return; }
  const B = nextEngBlock();
  const lastPlayed = engFixtures().filter(f => f.r).pop();
  if (!G.intl.sw && B && G.date >= addDays(B.s, -2)) {
    if (!G.intl.sqDone || !G.intl.squad.length) { G.intl.squad = pickSquad(natPool(PLAY_NAT), 26).map(p => p.id); G.intl.sqDone = true; msg('England squad', 'No squad was named in time, so your assistant picked the strongest 26 available.'); }
    G.intl.club = G.user; G.user = ENGID; G.intl.sw = 1; ensureEngUser();
    msg('England duty', `You are now with the England squad. Club matters are on hold until the games are over.`);
  } else if (G.intl.sw && (!B || dDiff(G.date, B.s) > 10) && (!lastPlayed || dDiff(lastPlayed.d, G.date) >= 1)) {
    G.user = G.intl.club; G.intl.sw = 0;
    msg('Back at the club', `England duty is over. You are back at ${tName(G.user, false)}.`);
  }
}
function intlDaily() {
  if (!G.intl) return;
  for (const tk of G.intl.tasks.filter(t => t.d <= G.date)) { G.intl.tasks = G.intl.tasks.filter(x => x !== tk); try { runIntlTask(tk); } catch (e) { console.error(e); } }
  const B = nextEngBlock();
  if (B && G.date >= addDays(B.s, -9)) announceSquad(B);
  windowTick();
  swapCheck();
  faApproach();
}

// ---------- FA expectations and the England job ----------
function faTarget(E) {
  if (E.comp === 'UNL') return { k: 'top2', txt: 'finish in the top two of the group' };
  if (E.comp === 'EQ' || E.comp === 'WCQ') return { k: 'qual', txt: 'qualify for the finals' };
  if (E.comp === 'EURO') return { k: 'sf', txt: 'reach the semi-finals' };
  if (E.comp === 'WC') return { k: 'qf', txt: 'reach the quarter-finals' };
  return { k: '-', txt: '-' };
}
function engStage(E) {
  if (!E) return null;
  if (E.fin && E.fin[0] === ENGID) return 'Winners';
  if (E.fin && E.fin[1] === ENGID) return 'Runners-up';
  const ko = (E.ko || []).slice().reverse().find(r => r.fx.some(id => G.fx[id].h === ENGID || G.fx[id].a === ENGID));
  if (ko) return ko.n;
  if (E.qual) return E.qual.includes(ENGID) ? 'Qualified' : 'Did not qualify';
  const g = Object.keys(E.groups || {}).find(g => E.groups[g].includes(ENGID));
  if (g) return ordinal(gTable(E.groups[g], E.fx[g]).findIndex(r => r.t === ENGID) + 1) + ' in group';
  return null;
}
function faReview(E) {
  const inE = Object.values(E.groups || {}).some(g => g.includes(ENGID)) || edFx(E).some(id => G.fx[id].h === ENGID || G.fx[id].a === ENGID);
  if (!inE) return;
  const st = engStage(E) || ''; const tg = faTarget(E);
  const ok = tg.k === 'sf' ? ['Winners', 'Runners-up', 'Semi-final', 'Third place'].includes(st) : tg.k === 'qf' ? ['Winners', 'Runners-up', 'Semi-final', 'Quarter-final', 'Third place'].includes(st) : tg.k === 'top2' ? true : st !== 'Did not qualify';
  G.intl.hist.push({ key: E.key + ':ENG', comp: E.comp, name: E.name, eng: st, d: G.date });
  if (!userIsEng()) { if (!ok && (E.comp === 'EURO' || E.comp === 'WC') && R.chance(.6)) { const old = T(ENGID).mgr; T(ENGID).mgr = 'Vacant'; G.intl.vacant = true; news('England', `${old} leaves the England job after the ${E.name}. The FA is looking for a new manager.`, ENGID, true); } return; }
  G.intl.fa = clamp(G.intl.fa + (ok ? 15 : -22) + (st === 'Winners' ? 20 : 0), 0, 100);
  G.mgrRep = clamp(G.mgrRep + (ok ? 3 : -3) + (st === 'Winners' ? 8 : 0), 20, 99);
  msg('FA review: ' + E.name, `England: ${st}. The FA wanted you to ${tg.txt}. ${ok ? 'They are pleased with the campaign.' : 'They are disappointed.'} FA confidence is now ${Math.round(G.intl.fa)}%.`);
  if (G.intl.fa < 20) leaveEngland('The FA has dismissed you as England manager.');
}
function faApproach() {
  if (userIsEng() || G.intl.seen['ap' + G.year] || G.date.slice(5) !== '07-15') return;
  if ((G.intl.vacant && G.mgrRep >= 55) || G.mgrRep >= 82) { G.intl.seen['ap' + G.year] = 1; msg('The FA calls', `The FA would like to talk to ${G.mgr} about the England job. You can take it alongside your club job. Open International to accept.`, { k: 'nav', v: 'intl' }); G.intl.offer = true; }
}
function takeEngland(mode) {
  if (userIsEng()) return 'You already manage England.';
  if (!(G.intl.offer || G.intl.vacant || G.mgrRep >= 68)) return `The FA thanks you for your interest but wants a manager with a bigger reputation (yours: ${Math.round(G.mgrRep)}).`;
  const old = T(ENGID).mgr;
  G.intl.job = PLAY_NAT; G.intl.offer = false; G.intl.vacant = false; G.intl.fa = 60;
  G.intl.mode = mode || (G.sacked || isNatT(G.user) ? 'nat' : 'dual');
  if (G.intl.mode === 'nat') { if (G.sacked) G.sacked = false; if (G.mgrP) { G.mgrP.rec = G.mgrP.rec.filter(st => st.to || st.p > 0); for (const st of G.mgrP.rec) if (!st.to) st.to = G.date; } G.user = ENGID; }
  ensureEngUser();
  msg('England manager', `${G.mgr} is the new England manager${G.intl.mode === 'dual' ? ` and will combine the role with the ${tName(G.intl.club || G.user, false)} job` : ''}.${old && old !== 'Vacant' ? ` ${old} steps aside.` : ''} The FA expects a strong showing in every competition.`);
  news('England', `${G.mgr} appointed England manager.`, ENGID, true);
  G.mgrRep = clamp(G.mgrRep + 3, 20, 99);
  return null;
}
function leaveEngland(why) {
  if (!userIsEng()) return;
  if (G.intl.sw) { G.user = G.intl.club; G.intl.sw = 0; }
  const nat = G.intl.mode === 'nat';
  G.intl.job = null; G.intl.mode = 'club'; T(ENGID).mgr = genName(); ensureEngUser();
  msg('England', why || 'You have left the England job.');
  if (nat) { G.sacked = true; }
}

// ---------- season, calendar and fixture hooks ----------
const _dtI = dailyTick;
// the club season only ends once every international game of the summer has been played
function intlSoon() { const lim = addDays(G.date, 14); return Object.values(G.fx).some(f => isIntlF(f) && !f.r && f.d >= G.date && f.d <= lim); }
dailyTick = function () {
  try { if (G.intl) { const tk = G.tasks.find(t => t.t === 'seasonEnd' && t.d === G.date); if (tk && intlSoon()) tk.d = addDays(G.date, 1); } } catch (e) { console.error(e); }
  const r = _dtI.apply(this, arguments); try { intlDaily(); } catch (e) { console.error(e); } return r; };
const _fdI = finishDay;
finishDay = function () {
  const r = _fdI.apply(this, arguments);
  try { if (G.intl) { intlAfterMatches(r && r.ids || []); intlProgress(); intlAfterMatches(Object.values(G.fx).filter(f => isIntlF(f) && f.r && !f.ex).map(f => f.id)); } } catch (e) { console.error(e); }
  return r;
};
const _seI = seasonEnd;
seasonEnd = function () {
  const d0 = G.date;
  if (G.intl && G.intl.sw) { G.user = G.intl.club; G.intl.sw = 0; }
  _seI.apply(this, arguments);
  if (G.date < d0) G.date = addDays(d0, 1);
  try { if (G.intl) for (const f of Object.values(G.fx)) if (isIntlF(f) && f.d > sd(CAL.END)) bumpSeasonEnd(f.d); } catch (e) { }
};
const _bsI = buildSeason;
buildSeason = function () {
  const keep = G.intl ? Object.values(G.fx || {}).filter(isIntlF) : [];
  const r = _bsI.apply(this, arguments);
  for (const f of keep) { G.fx[f.id] = f; (G.byDate[f.d] = G.byDate[f.d] || []).push(f.id); } try { if (G.intl) for (const f of Object.values(G.fx)) if (isIntlF(f) && !f.r) bumpSeasonEnd(f.d); } catch (e) { } return r; };
// international results for days that passed before the module existed (old saves) or real results already known
function intlCatchUp() {
  const due = Object.values(G.fx).filter(f => isIntlF(f) && !f.r && f.d < G.date).sort((a, b) => a.d < b.d ? -1 : 1);
  for (const f of due) {
    if (f.real) { f.r = f.real.slice(); f.sc = []; } else quickFixture(f);
    intlAfterMatches([f.id]); intlProgress();
  }
}
// club parts of the game do not apply while the user is running a national team
function natGuard(name) {
  const fn = window[name]; if (typeof fn !== 'function') return;
  window[name] = function () { if (G && isNatT(G.user)) { if (name === 'transferAI' || name === 'youthWeek') { const k = G.user, s = G.sq[k]; G.sq[k] = []; try { return fn.apply(this, arguments); } finally { G.sq[k] = s; } } return null; } return fn.apply(this, arguments); };
}
for (const n of ['boardReact', 'checkBoard', 'weeklyDynamics', 'monthlyTraining', 'transferAI', 'youthWeek']) natGuard(n);
const _btI = boardTarget;
boardTarget = function (tid) { if (isNatT(tid || G.user)) return { pos: 1, txt: 'do well in every international competition' }; return _btI(tid); };
const _ufI = userFixtureOn;
userFixtureOn = function (d) { return _ufI(d); };
// manager career: England stints sit alongside club stints
curStint = function () { const mp = G.mgrP; let st = mp.rec.slice().reverse().find(s => !s.to && s.tid === G.user); if (!st) { st = { tid: G.user, from: G.date, to: null, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, tro: [] }; mp.rec.push(st); } return st; };
const _tjI = takeJob;
takeJob = function (tid) {
  const oldClub = G.intl && G.intl.sw ? G.intl.club : G.user;
  const eng = G.mgrP && G.mgrP.rec.find(s => s.tid === ENGID && !s.to);
  if (G.intl && G.intl.sw) { G.user = G.intl.club; G.intl.sw = 0; }
  _tjI(tid);
  if (G.mgrP) for (const st of G.mgrP.rec) if (st.tid === oldClub && st.tid !== tid && !st.to) st.to = G.date;
  if (eng && userIsEng()) eng.to = null;
  if (userIsEng() && G.intl.mode === 'nat') G.intl.mode = 'dual';
};
// rankings: international trophies and national managers
Object.assign(TRO_W, { 'World Cup': 35, 'European Championship': 20, 'Nations League': 8 });
mgrOfTeam = function (tid) {
  const t = T(tid); if (!t) return null;
  if (t.nat) return t.code === PLAY_NAT && userIsEng() ? null : (mgrIndex()[t.mgr] ? t.mgr : null);
  if (!t.lite) return t.mgr;
  const m = MGR_DATA.find(x => x[2] === 'a' && x[3] === t.name); return m ? m[0] : null;
};
const _rpI = rankPool;
rankPool = function () { const out = _rpI(); if (userIsEng()) for (const x of out) if (!x.me && x.club && x.club.txt === 'England') { x.club = { tid: null, txt: 'Without a job' }; x.st = 'f'; } const me = out.find(x => x.me); if (me && userIsEng()) me.club = { tid: G.intl.mode === 'nat' ? ENGID : (G.intl.sw ? G.intl.club : G.user), txt: G.intl.mode === 'nat' ? 'England' : tName(G.intl.sw ? G.intl.club : G.user) + ' & England' }; return out; };

// ---------- migration and new careers ----------
const _renderI = render;
render = function () { if (G && G.teams && !G.intl && !G.sacked) { try { intlInit(); } catch (e) { console.error(e); } } _renderI(); };
const _ngI = newGame;
newGame = function (u, n) { const r = _ngI(u, n); try { intlInit(); } catch (e) { console.error(e); } return r; };
