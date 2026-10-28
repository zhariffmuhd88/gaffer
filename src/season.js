// ===== NEW GAME, CALENDAR, COMPETITIONS, DAY LOOP =====
const BASE_YEAR = 2026;
const CAL = {
  league: ['2026-08-22', '2026-08-29', '2026-09-05', '2026-09-12', '2026-09-19', '2026-10-10', '2026-10-17', '2026-10-24', '2026-10-31', '2026-11-07', '2026-11-21', '2026-11-28', '2026-12-02', '2026-12-05', '2026-12-12', '2026-12-19', '2026-12-26', '2026-12-29', '2027-01-02', '2027-01-16', '2027-01-23', '2027-01-30', '2027-02-06', '2027-02-10', '2027-02-13', '2027-02-27', '2027-03-06', '2027-03-13', '2027-03-20', '2027-04-03', '2027-04-10', '2027-04-17', '2027-04-21', '2027-04-27', '2027-05-01', '2027-05-08', '2027-05-15', '2027-05-30'],
  LC: [['Second Round', ['2026-08-26']], ['Third Round', ['2026-09-23']], ['Fourth Round', ['2026-10-28']], ['Quarter-final', ['2026-12-16']], ['Semi-final', ['2027-01-13', '2027-02-03']], ['Final', ['2027-03-21'], 1]],
  FA: [['Third Round', ['2027-01-09']], ['Fourth Round', ['2027-02-20']], ['Fifth Round', ['2027-03-03']], ['Quarter-final', ['2027-03-27']], ['Semi-final', ['2027-04-25'], 1], ['Final', ['2027-05-22'], 1]],
  E: {
    UCL: { md: ['2026-09-15', '2026-09-29', '2026-10-20', '2026-11-03', '2026-11-24', '2026-12-08', '2027-01-19', '2027-01-26'], ko: [['Knockout play-off', ['2027-02-16', '2027-02-23']], ['Round of 16', ['2027-03-09', '2027-03-16']], ['Quarter-final', ['2027-04-06', '2027-04-13']], ['Semi-final', ['2027-04-28', '2027-05-05']], ['Final', ['2027-06-05'], 1]] },
    UEL: { md: ['2026-09-17', '2026-10-01', '2026-10-22', '2026-11-05', '2026-11-26', '2026-12-10', '2027-01-21', '2027-01-28'], ko: [['Knockout play-off', ['2027-02-18', '2027-02-25']], ['Round of 16', ['2027-03-11', '2027-03-18']], ['Quarter-final', ['2027-04-08', '2027-04-15']], ['Semi-final', ['2027-04-29', '2027-05-06']], ['Final', ['2027-05-19'], 1]] },
    UECL: { md: ['2026-09-17', '2026-10-01', '2026-10-22', '2026-11-05', '2026-11-26', '2026-12-10', '2027-01-21', '2027-01-28'], ko: [['Knockout play-off', ['2027-02-18', '2027-02-25']], ['Round of 16', ['2027-03-11', '2027-03-18']], ['Quarter-final', ['2027-04-08', '2027-04-15']], ['Semi-final', ['2027-04-29', '2027-05-06']], ['Final', ['2027-05-26'], 1]] }
  },
  FA_DRAW: '2026-12-01', WIN1_CLOSE: '2026-09-01', WIN2_OPEN: '2027-01-01', WIN2_CLOSE: '2027-02-01', END: '2027-06-08', START: '2026-08-13',
  // Championship: 46 rounds, 15 Aug 2026 - 1 May 2027 (real season 14 Aug - 1 May); no games on international or FA Cup weekends
  ch: ['2026-08-15', '2026-08-18', '2026-08-22', '2026-08-29', '2026-09-01', '2026-09-05', '2026-09-12', '2026-09-15', '2026-09-19', '2026-09-29', '2026-10-10', '2026-10-17', '2026-10-20', '2026-10-24', '2026-10-31', '2026-11-03', '2026-11-07', '2026-11-21', '2026-11-24', '2026-11-28', '2026-12-01', '2026-12-05', '2026-12-12', '2026-12-19', '2026-12-26', '2026-12-29', '2027-01-02', '2027-01-16', '2027-01-19', '2027-01-23', '2027-01-30', '2027-02-06', '2027-02-13', '2027-02-16', '2027-02-27', '2027-03-06', '2027-03-09', '2027-03-13', '2027-03-16', '2027-03-20', '2027-04-03', '2027-04-10', '2027-04-13', '2027-04-17', '2027-04-24', '2027-05-01'],
  // play-offs (new 2026/27 format): 5v8 and 6v7 eliminators, two-legged semis with 3rd and 4th, final at Wembley
  PO: [['Eliminator', ['2027-05-05']], ['Semi-final', ['2027-05-09', '2027-05-13']], ['Final', ['2027-05-29'], 1]], PO_DRAW: '2027-05-02'
};
function sd(s) { return addDays(s, 364 * (G.year - BASE_YEAR)); } // shift a base date to the current season
const COMP_NAME = { PL: 'Premier League', CH: 'Championship', PO: 'Championship play-offs', LC: 'Carabao Cup', FA: 'FA Cup', UCL: 'Champions League', UEL: 'Europa League', UECL: 'Conference League' };
const COMP_SHORT = { PL: 'PL', CH: 'CH', PO: 'PO', LC: 'LC', FA: 'FAC', UCL: 'UCL', UEL: 'UEL', UECL: 'UECL' };
const LEAGUE_COMPS = ['PL', 'CH'];
const PARACHUTE = [45, 37]; // £m per season for the two seasons after relegation from the Premier League

function slug(s) { return s.replace(/[^A-Za-z0-9]/g, ''); }
function newGame(userId, mgrName) {
  _pid = 0; _attrCache.clear();
  G = { v: 1, year: BASE_YEAR, user: userId, mgr: mgrName || 'Manager', mgrRep: 55, date: CAL.START, teams: {}, players: {}, sq: {}, pl: [], champ: null, fx: {}, byDate: {}, news: [], newsId: 0, offers: [], hist: [], honours: {}, fa: [], board: 70, fid: 0, tasks: [], window: true, euroNext: null, sacked: false, records: {}, lastResults: [], seasonEnded: false };
  G.champTeams = CH_CLUBS.map(c => c.id);
  for (const c of PL_CLUBS) addFullTeam(c, 'PL');
  for (const c of CH_CLUBS) addFullTeam(c, 'CH');
  for (const id of fullTeams()) { for (const p of squad(id)) { p.wage = wageFor(p, id) * R.i(85, 110) / 100 * (T(id).para ? 1.25 : 1); p.val = calcValue(p); } setBudgets(id, true); }
  // lite teams: League One and below, European clubs
  for (const [n, s] of LOWER) addLite('L_' + slug(n), n, s);
  for (const k in EURO) for (const [n, s] of EURO[k]) addLite('E_' + slug(n), n, s);
  G.lowerTeams = LOWER.map(c => 'L_' + slug(c[0]));
  G.l1 = G.lowerTeams.slice(0, 24);
  G.ded = {}; for (const c of CH_CLUBS) if (c.ded) G.ded[c.id] = c.ded;
  G.euroIn = JSON.parse(JSON.stringify(EURO_START));
  for (const id of fullTeams()) autoPick(id);
  buildSeason();
  migrate();
  welcomeNews();
  return G;
}
function addFullTeam(c, div) {
  const t = { id: c.id, name: c.name, short: c.short || c.name, c1: c.c1, c2: c.c2, stadium: c.stadium, cap: c.cap, mgr: c.mgr, rep: c.rep, bal: c.bal, lite: false, tac: { form: c.form || PREF_FORM[c.id] || '4-2-3-1', xi: [], bench: [], ment: 3, press: 2, tempo: 2, width: 2, pass: 2 }, fin: newFin() };
  if (c.capt) t.captN = c.capt;
  if (div === 'CH' && c.rep >= 68) t.para = PARACHUTE.slice(); // relegated from the Premier League in May 2026
  G.teams[c.id] = t; G.sq[c.id] = []; if (div === 'PL') G.pl.push(c.id);
  addSquadRows(c.id, c.sq, div === 'PL' ? ({ COV: 3, HUL: 3, IPS: 2, LEE: 1 }[c.id] || 0) : 0);
  return t;
}
function addSquadRows(tid, sq, boost) {
  for (const line of sq.trim().split('\n')) {
    const [no, n, pos, age, nat, ca] = line.split('|');
    const p = mkPlayer({ n, c: tid, no: +no, pos, age: +age, nat, ca: +ca + (boost || 0) });
    p.con = G.year + R.i(p.age >= 32 ? 1 : 2, p.age >= 30 ? 2 : p.age <= 21 ? 5 : 4);
    G.players[p.id] = p; G.sq[tid].push(p.id);
  }
}
function addLite(id, name, str, stadium, cap) { G.teams[id] = { id, name, short: name, str, lite: true, stadium: stadium || name + ' ground', cap: cap || 20000, c1: '#8a8f99', c2: '#ffffff' }; }
function newFin() { return { in: { gate: 0, tv: 0, com: 0, prize: 0, sales: 0 }, out: { wages: 0, buys: 0, other: 0 } }; }
function wageBill(tid) { return squad(tid).reduce((s, p) => s + (p.wage || 0) * (p.loan && p.loan.ws != null ? p.loan.ws : 1), 0); }
function setBudgets(tid, first) {
  const t = T(tid);
  t.tb = Math.max(3, Math.round(t.bal * 0.45 + (t.rep - 60) * (first ? 1 : 0.8)));
  t.wb = Math.round(wageBill(tid) * 1.1);
}

// ---- fixtures ----
function addFx(o) { const id = 'f' + (++G.fid); const f = Object.assign({ id, r: null }, o); G.fx[id] = f; (G.byDate[f.d] = G.byDate[f.d] || []).push(id); return f; }
function roundRobin(ids) {
  const n = ids.length; const arr = ids.slice(); const rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs = [];
    for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i]; pairs.push(r % 2 === 0 ? (i === 0 ? [a, b] : [b, a]) : (i === 0 ? [b, a] : [a, b])); }
    rounds.push(pairs);
    arr.splice(1, 0, arr.pop());
  }
  return rounds;
}
function leagueNorm(teams) {
  const avg = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const gk = [], att = [];
  for (const t of (teams || G.pl)) { const sq = squad(t); const g = sq.filter(p => p.pos === 'GK').sort((a, b) => b.ca - a.ca)[0]; if (g) gk.push(g.ca); att.push(avg(sq.filter(p => ['ST', 'LW', 'RW', 'AM'].includes(p.pos)).sort((a, b) => b.ca - a.ca).slice(0, 3).map(p => p.ca))); }
  return avg(att) - avg(gk);
}
function buildSeason() {
  const gap = leagueNorm(); if (G.norm0 == null) G.norm0 = gap;
  G.normF = clamp(Math.exp(-(gap - G.norm0) * .035), .8, 1.2);
  // the Championship gets its own calibration (about 2.6 goals a game, as in recent seasons)
  if (divTeams('CH').length) { const gc = leagueNorm(divTeams('CH')); if (G.normCH0 == null) G.normCH0 = gc; G.normCH = 0.86 * clamp(Math.exp(-(gc - G.normCH0) * .035), .8, 1.2); }
  G.fx = {}; G.byDate = {}; G.tasks = [];
  // Premier League
  const order = R.shuffle(G.pl);
  const first = roundRobin(order);
  const second = first.map(r => r.map(([a, b]) => [b, a]));
  const all = R.shuffle(first.slice(1)).concat([first[0]]); // keep variety
  const rounds = first.concat(second);
  // shuffle within halves but keep halves apart
  const h1 = R.shuffle(first), h2 = R.shuffle(second);
  const lr = h1.concat(h2);
  G.league = { rounds: lr.map((pairs, ri) => pairs.map(([h, a]) => addFx({ comp: 'PL', d: sd(CAL.league[ri]), h, a, rnd: ri + 1 }).id)) };
  // Championship: real fixtures when the division has full squads (legacy saves keep a team-level table until their next season)
  if (divTeams('CH').length === G.champTeams.length) {
    const cr = roundRobin(R.shuffle(G.champTeams)); const ch1 = R.shuffle(cr), ch2 = R.shuffle(cr.map(r => r.map(([a, b]) => [b, a])));
    G.chLeague = { rounds: ch1.concat(ch2).map((pairs, ri) => pairs.map(([h, a]) => addFx({ comp: 'CH', d: sd(CAL.ch[ri]), h, a, rnd: ri + 1 }).id)) };
    G.champ = null;
  } else {
    const cr = roundRobin(R.shuffle(G.champTeams)); const cr2 = cr.map(r => r.map(([a, b]) => [b, a]));
    G.champ = { rounds: cr.concat(cr2).map(r => r.map(([h, a]) => ({ h, a, r: null }))), played: 0 }; G.chLeague = null;
  }
  // Carabao Cup
  const euroPL = [].concat(G.euroIn.UCL, G.euroIn.UEL, G.euroIn.UECL);
  G.cups = {};
  G.cups.LC = { id: 'LC', rounds: CAL.LC.map(([n, ds, neu]) => ({ n, d: ds.map(sd), neutral: !!neu, ties: [], done: false })), ri: 0, winner: null };
  const lcR2 = R.shuffle(G.pl.filter(t => !euroPL.includes(t)).concat(R.shuffle(G.champTeams).slice(0, 32 - (20 - euroPL.length))));
  drawRound('LC', 0, lcR2);
  G.cups.FA = { id: 'FA', rounds: CAL.FA.map(([n, ds, neu]) => ({ n, d: ds.map(sd), neutral: !!neu, ties: [], done: false })), ri: 0, winner: null };
  G.tasks.push({ d: sd(CAL.FA_DRAW), t: 'drawFA' });
  // Championship play-offs
  G.cups.PO = { id: 'PO', rounds: CAL.PO.map(([n, ds, neu]) => ({ n, d: ds.map(sd), neutral: !!neu, ties: [], done: false })), ri: 0, winner: null, seeds: [] };
  if (G.chLeague) G.tasks.push({ d: sd(CAL.PO_DRAW), t: 'drawPO' });
  // Europe
  G.euro = {};
  for (const c of ['UCL', 'UEL', 'UECL']) buildEuro(c);
  G.window = true;
  G.tasks.push({ d: sd(CAL.WIN1_CLOSE), t: 'winClose' }, { d: sd(CAL.WIN2_OPEN), t: 'winOpen' }, { d: sd(CAL.WIN2_CLOSE), t: 'winClose' }, { d: sd(CAL.END), t: 'seasonEnd' });
  for (const id of fullTeams()) T(id).fin = newFin();
}
function drawRound(cid, ri, teams) {
  const cup = G.cups[cid]; const rd = cup.rounds[ri];
  const list = R.shuffle(teams);
  rd.ties = [];
  for (let i = 0; i + 1 < list.length; i += 2) {
    const h = list[i], a = list[i + 1];
    const tie = { t: [h, a], fx: [], w: null };
    if (rd.d.length === 2) {
      const l1 = addFx({ comp: cid, d: rd.d[0], h, a, rnd: rd.n, leg: 1 });
      const l2 = addFx({ comp: cid, d: rd.d[1], h: a, a: h, rnd: rd.n, leg: 2, l1: l1.id, need: true });
      tie.fx = [l1.id, l2.id];
    } else { const f = addFx({ comp: cid, d: rd.d[0], h, a, rnd: rd.n, need: true, neutral: rd.neutral }); tie.fx = [f.id]; }
    rd.ties.push(tie);
  }
  cup.ri = ri;
}
function tieWinner(tie) {
  const last = G.fx[tie.fx[tie.fx.length - 1]];
  if (!last.r) return null;
  if (last.pen) return last.pen[0] > last.pen[1] ? last.h : last.a;
  if (tie.fx.length === 1) return last.r[0] > last.r[1] ? last.h : last.a;
  const l1 = G.fx[tie.fx[0]];
  const ga = last.r[0] + l1.r[1], gb = last.r[1] + l1.r[0];
  return ga > gb ? last.h : last.a;
}
function checkCupProgress(cid) {
  const cup = G.cups[cid]; const rd = cup.rounds[cup.ri];
  if (!rd || !rd.ties.length || rd.done) return;
  if (!rd.ties.every(t => G.fx[t.fx[t.fx.length - 1]].r)) return;
  rd.done = true;
  for (const t of rd.ties) t.w = tieWinner(t);
  const winners = rd.ties.map(t => t.w);
  if (cup.ri === cup.rounds.length - 1) {
    cup.winner = winners[0]; honour(cup.winner, COMP_NAME[cid]);
    news(COMP_NAME[cid] + ' winners', `${tName(cup.winner, false)} win the ${COMP_NAME[cid]}!`, cup.winner, true);
    if (cid !== 'PO') prize(cup.winner, cid === 'FA' ? 4 : 2.5);
    return;
  }
  if (cid === 'PO') { poNextRound(); return; }
  let next = winners;
  if (cid === 'LC' && cup.ri === 0) { const euroPL = [].concat(G.euroIn.UCL, G.euroIn.UEL, G.euroIn.UECL); next = winners.concat(euroPL); const restC = G.champTeams.filter(t => !rd.ties.some(x => x.t.includes(t))); next = next.concat(R.shuffle(restC).concat(R.shuffle(G.lowerTeams))).slice(0, 32); }
  drawRound(cid, cup.ri + 1, next);
  const u = G.user;
  const ut = cup.rounds[cup.ri].ties.find(t => t.t.includes(u));
  if (ut) { const opp = ut.t[0] === u ? ut.t[1] : ut.t[0]; news(COMP_NAME[cid] + ' draw', `${cup.rounds[cup.ri].n}: ${tName(ut.t[0])} v ${tName(ut.t[1])} (${dNice(cup.rounds[cup.ri].d[0], false)}).`, u); }
  for (const t of rd.ties) if (!T(t.w).lite) prize(t.w, cid === 'FA' ? 0.3 * (cup.ri + 1) : 0.15 * (cup.ri + 1));
}
// fixed pairings (first-named team hosts the first leg / the single game)
function drawFixed(cid, ri, pairs) {
  const cup = G.cups[cid]; const rd = cup.rounds[ri]; rd.ties = [];
  for (const [h, a] of pairs) {
    const tie = { t: [h, a], fx: [], w: null };
    if (rd.d.length === 2) { const l1 = addFx({ comp: cid, d: rd.d[0], h, a, rnd: rd.n, leg: 1 }); const l2 = addFx({ comp: cid, d: rd.d[1], h: a, a: h, rnd: rd.n, leg: 2, l1: l1.id, need: true }); tie.fx = [l1.id, l2.id]; }
    else { const f = addFx({ comp: cid, d: rd.d[0], h, a, rnd: rd.n, need: true, neutral: rd.neutral }); tie.fx = [f.id]; }
    rd.ties.push(tie);
  }
  cup.ri = ri;
  const ut = rd.ties.find(t => t.t.includes(G.user));
  if (ut) news(COMP_NAME[cid], `${rd.n}: ${tName(ut.t[0])} v ${tName(ut.t[1])} (${dNice(rd.d[0], false)}${rd.d[1] ? ' and ' + dNice(rd.d[1], false) : ''}).`, G.user);
}
// play-offs: 5th v 8th and 6th v 7th (higher seed at home), then 3rd v lowest remaining and 4th v the other over two legs
function drawPO() {
  const ct = champTable(); const seeds = ct.slice(2, 8).map(r => r.t); G.cups.PO.seeds = seeds;
  drawFixed('PO', 0, [[seeds[2], seeds[5]], [seeds[3], seeds[4]]]);
  news('Championship play-offs', `Play-off places: ${seeds.map((t, i) => (i + 3) + '. ' + tName(t)).join(', ')}.`, null, true);
}
function poNextRound() {
  const cup = G.cups.PO; const seeds = cup.seeds;
  const w = cup.rounds[cup.ri].ties.map(t => t.w);
  if (cup.ri === 0) { const rest = w.sort((a, b) => seeds.indexOf(a) - seeds.indexOf(b)); drawFixed('PO', 1, [[rest[1], seeds[0]], [rest[0], seeds[1]]]); }
  else drawFixed('PO', 2, [[w[0], w[1]]]);
}

// ---- Europe ----
function buildEuro(c) {
  const pls = G.euroIn[c] || [];
  const poolIds = R.shuffle(EURO[c].map(x => 'E_' + slug(x[0])));
  let need = 36 - pls.length;
  let ids = poolIds.slice(0, need);
  if (ids.length < need) { const extra = R.shuffle([].concat(...Object.values(EURO)).map(x => 'E_' + slug(x[0])).filter(x => !ids.includes(x))); ids = ids.concat(extra.slice(0, need - ids.length)); }
  const teams = R.shuffle(pls.concat(ids));
  const E = { id: c, teams, md: [], ko: CAL.E[c].ko.map(([n, ds, neu]) => ({ n, d: ds.map(sd), neutral: !!neu, ties: [], done: false })), ki: -1, phase: 'league', winner: null };
  // league phase pairings
  const played = {}; teams.forEach(t => played[t] = new Set());
  const homes = {}; teams.forEach(t => homes[t] = 0);
  for (let m = 0; m < 8; m++) {
    let pairs = null;
    for (let tries = 0; tries < 400 && !pairs; tries++) {
      const pool = R.shuffle(teams); const pr = []; const used = new Set(); let ok = true;
      for (const t of pool) {
        if (used.has(t)) continue;
        const o = pool.find(x => x !== t && !used.has(x) && !played[t].has(x) && !(pls.includes(t) && pls.includes(x)));
        if (!o) { ok = false; break; }
        used.add(t); used.add(o); pr.push([t, o]);
      }
      if (ok) pairs = pr;
    }
    if (!pairs) { const pool = R.shuffle(teams); pairs = []; for (let i = 0; i < 36; i += 2) pairs.push([pool[i], pool[i + 1]]); }
    E.md.push(pairs.map(([a, b]) => { played[a].add(b); played[b].add(a); const [h, aw] = homes[a] <= homes[b] ? [a, b] : [b, a]; homes[h]++; return addFx({ comp: c, d: sd(CAL.E[c].md[m]), h, a: aw, rnd: 'Matchday ' + (m + 1) }).id; }));
  }
  G.euro[c] = E;
  if (pls.length) for (const t of pls) { prize(t, c === 'UCL' ? 18 : c === 'UEL' ? 4.3 : 3.2); }
}
function euroTable(c) {
  const E = G.euro[c]; const tb = {};
  for (const t of E.teams) tb[t] = { t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  for (const md of E.md) for (const fid of md) { const f = G.fx[fid]; if (!f.r) continue; addRes(tb[f.h], f.r[0], f.r[1]); addRes(tb[f.a], f.r[1], f.r[0]); }
  return Object.values(tb).sort(sortTable);
}
function addRes(row, gf, ga) { row.p++; row.gf += gf; row.ga += ga; if (gf > ga) { row.w++; row.pts += 3; } else if (gf === ga) { row.d++; row.pts++; } else row.l++; }
function sortTable(a, b) { return b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || (a.t < b.t ? -1 : 1); }
function checkEuroProgress(c) {
  const E = G.euro[c];
  if (E.phase === 'league') {
    if (!E.md.every(md => md.every(fid => G.fx[fid].r))) return;
    const tb = euroTable(c);
    E.final = tb.map(r => r.t);
    E.phase = 'ko'; E.ki = 0;
    for (const r of tb.slice(24)) if (!T(r.t).lite) news(EURO_NAMES[c], `${tName(r.t, false)} are eliminated after finishing ${ordinal(tb.indexOf(r) + 1)} in the league phase.`, r.t);
    const po = []; for (let i = 0; i < 8; i++) po.push([tb[8 + i].t, tb[23 - i].t]); // seeded team hosts second leg
    euroDraw(c, 0, po.map(([s, u]) => [u, s]));
    E.top8 = tb.slice(0, 8).map(r => r.t);
    for (const r of tb.slice(0, 8)) if (!T(r.t).lite) { news(EURO_NAMES[c], `${tName(r.t, false)} finish in the top eight and go straight to the round of 16.`, r.t); prize(r.t, c === 'UCL' ? 9 : 2); }
    return;
  }
  const rd = E.ko[E.ki];
  if (!rd || rd.done || !rd.ties.length || !rd.ties.every(t => G.fx[t.fx[t.fx.length - 1]].r)) return;
  rd.done = true;
  for (const t of rd.ties) { t.w = tieWinner(t); const l = t.t.find(x => x !== t.w); if (!T(l).lite) news(EURO_NAMES[c], `${tName(l, false)} are knocked out by ${tName(t.w)} in the ${rd.n.toLowerCase()}.`, l); if (!T(t.w).lite) prize(t.w, c === 'UCL' ? 11 + E.ki * 2 : 1.5 + E.ki); }
  const w = rd.ties.map(t => t.w);
  if (E.ki === E.ko.length - 1) { E.winner = w[0]; honour(w[0], EURO_NAMES[c]); news(EURO_NAMES[c] + ' winners', `${tName(w[0], false)} win the ${EURO_NAMES[c]}!`, w[0], true); if (!T(w[0]).lite) prize(w[0], c === 'UCL' ? 25 : 8); return; }
  let next;
  if (E.ki === 0) { const t8 = R.shuffle(E.top8); const ws = R.shuffle(w); next = t8.map((t, i) => [ws[i], t]); }
  else { const ws = R.shuffle(w); next = []; for (let i = 0; i + 1 < ws.length; i += 2) next.push([ws[i], ws[i + 1]]); }
  euroDraw(c, E.ki + 1, next);
}
function euroDraw(c, ki, pairs) {
  const E = G.euro[c]; const rd = E.ko[ki]; E.ki = ki; rd.ties = [];
  for (const [h, a] of pairs) {
    const tie = { t: [h, a], fx: [], w: null };
    if (rd.d.length === 2) { const l1 = addFx({ comp: c, d: rd.d[0], h, a, rnd: rd.n, leg: 1 }); const l2 = addFx({ comp: c, d: rd.d[1], h: a, a: h, rnd: rd.n, leg: 2, l1: l1.id, need: true }); tie.fx = [l1.id, l2.id]; }
    else { const f = addFx({ comp: c, d: rd.d[0], h, a, rnd: rd.n, need: true, neutral: true }); tie.fx = [f.id]; }
    rd.ties.push(tie);
  }
  const ut = rd.ties.find(t => t.t.includes(G.user));
  if (ut) news(EURO_NAMES[c] + ' draw', `${rd.n}: ${tName(ut.t[0])} v ${tName(ut.t[1])}.`, G.user);
}
function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

// ---- league table ----
function divTable(teams, rounds, ded) {
  const tb = {};
  for (const t of teams) tb[t] = { t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: -((ded && ded[t]) || 0), form: [], ded: (ded && ded[t]) || 0 };
  for (const r of rounds) for (const fid of r) { const f = G.fx[fid]; if (!f || !f.r || !tb[f.h] || !tb[f.a]) continue; addRes(tb[f.h], f.r[0], f.r[1]); addRes(tb[f.a], f.r[1], f.r[0]); tb[f.h].form.push(f.r[0] > f.r[1] ? 'W' : f.r[0] < f.r[1] ? 'L' : 'D'); tb[f.a].form.push(f.r[1] > f.r[0] ? 'W' : f.r[1] < f.r[0] ? 'L' : 'D'); }
  return Object.values(tb).sort(sortTable);
}
function leagueTable() { return divTable(G.pl, G.league.rounds, G.ded); }
function champTable() {
  if (G.chLeague) return divTable(G.champTeams, G.chLeague.rounds, G.ded);
  const tb = {};
  for (const t of G.champTeams) tb[t] = { t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] };
  for (const r of G.champ.rounds) for (const f of r) if (f.r) { addRes(tb[f.h], f.r[0], f.r[1]); addRes(tb[f.a], f.r[1], f.r[0]); }
  return Object.values(tb).sort(sortTable);
}
function tableOf(div) { return div === 'CH' ? champTable() : leagueTable(); }
function userDiv() { return divOf(G.user) || 'PL'; }
function userTable() { return tableOf(userDiv()); }

// ---- quick sim (team level) ----
function teamStrength(tid) {
  const t = T(tid); if (t.lite) return t.str;
  const ps = squad(tid).filter(available).sort((a, b) => b.ca - a.ca).slice(0, 14);
  if (!ps.length) return 50;
  return ps.reduce((s, p) => s + p.ca, 0) / ps.length;
}
function quickScore(h, a, neutral) {
  const sh = teamStrength(h) + (neutral ? 0 : 2.5), sa = teamStrength(a);
  const d = (sh - sa) / 10;
  const lh = clamp(1.35 * Math.exp(d * 0.55), .2, 4.5), la = clamp(1.15 * Math.exp(-d * 0.55), .2, 4.5);
  return [poisson(lh), poisson(la)];
}
function quickFixture(f) {
  let r = quickScore(f.h, f.a, f.neutral); f.r = r;
  if (f.need) {
    let agg = [0, 0]; if (f.l1) { const l1 = G.fx[f.l1]; agg = [l1.r[1], l1.r[0]]; }
    if (r[0] + agg[0] === r[1] + agg[1]) { f.et = true; if (R.chance(.45)) { if (R.chance(.5)) r[0]++; else r[1]++; } if (r[0] + agg[0] === r[1] + agg[1]) { const a = R.i(3, 5), b = a === 5 ? R.i(3, 6) : R.i(2, 5); f.pen = R.chance(.5) ? [Math.max(a, b + 1), b] : [b, Math.max(a, b + 1)]; } }
  }
  f.sc = [];
}

// ---- playing a fixture (non-live) ----
function playFixture(fid) {
  const f = G.fx[fid]; if (f.r) return f;
  const ht = T(f.h), at = T(f.a);
  if (ht.lite && at.lite) { quickFixture(f); return f; }
  const pre = preMatch(f);
  const M = createMatch(fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre);
  return f;
}
function preMatch(f) { const s = []; for (const tid of [f.h, f.a]) if (!T(tid).lite) for (const p of squad(tid)) if (p.sus > 0) s.push(p.id); return s; }
function postMatch(f, pre) {
  for (const id of pre) { const p = P(id); if (p && p.sus > 0) p.sus--; }
  // gate receipts and TV
  if (!f.neutral && !T(f.h).lite) {
    const t = T(f.h); const ch = divOf(f.h) === 'CH'; const lg = LEAGUE_COMPS.includes(f.comp);
    const fill = ch ? clamp(0.55 + t.rep / 250 + (lg ? 0 : -0.12), 0.4, 0.97) : clamp(0.8 + t.rep / 600 + (lg ? 0 : -0.08), 0.5, 1);
    const gate = t.cap * fill * (ch ? 8 + t.rep * 0.33 : 20 + t.rep * 0.38) / 1e6 * (lg ? 1 : 0.8);
    t.bal += gate; t.fin.in.gate += gate; f.att = Math.round(t.cap * fill);
  }
  if (f.comp === 'PL') for (const tid of [f.h, f.a]) { const t = T(tid); t.bal += 1.5; t.fin.in.tv += 1.5; }
  if (f.comp === 'CH') for (const tid of [f.h, f.a]) { const t = T(tid); t.bal += 0.12; t.fin.in.tv += 0.12; }
  if (['UCL', 'UEL', 'UECL'].includes(f.comp) && f.rnd && String(f.rnd).startsWith('Matchday')) {
    const win = f.r[0] > f.r[1] ? f.h : f.r[1] > f.r[0] ? f.a : null;
    const per = f.comp === 'UCL' ? 2.1 : f.comp === 'UEL' ? .45 : .4;
    if (win && !T(win).lite) prize(win, per);
    if (!win) for (const t of [f.h, f.a]) if (!T(t).lite) prize(t, per / 3);
  }
  // board reacts to user results
  if (f.h === G.user || f.a === G.user) { boardReact(f); const played = new Set((f.rt ? f.rt[f.h === G.user ? 0 : 1] : []).map(x => x[0])); for (const p of squad(G.user)) if (!played.has(p.id) && (p.inj > 0 || pre.includes(p.id))) p.mi = (p.mi || 0) + 1; }
}
function prize(tid, m) { const t = T(tid); if (!t || t.lite) return; t.bal += m; t.fin.in.prize += m; }
function honour(tid, name) { (G.honours[tid] = G.honours[tid] || []).push(seasonLabel(G.year) + ' ' + name); }

// ---- news ----
function news(title, body, tid, global) {
  if (!global && tid && tid !== G.user && !['Transfer', 'Manager'].includes(title)) { if (!G.newsAll) G.newsAll = []; return; }
  G.news.unshift({ id: ++G.newsId, d: G.date, title, body, read: false, tid: tid || null });
  if (G.news.length > 250) G.news.length = 250;
}
function msg(title, body, action) { G.news.unshift({ id: ++G.newsId, d: G.date, title, body, read: false, act: action || null, tid: G.user }); }
function welcomeNews() {
  const t = userTeam();
  const exp = boardTarget();
  msg('Welcome to ' + t.name, `The board welcomes ${G.mgr} as the new manager of ${t.name}. Your transfer budget is ${money(t.tb)} and the wage budget is ${wageStr(t.wb)}. The board expects you to ${exp.txt} this season. The summer transfer window closes on ${dNice(sd(CAL.WIN1_CLOSE))}.`);
  msg('Squad data', 'Squads reflect the 2026/27 Premier League and Championship first-team rosters as of late October 2026, after the summer window. Player ratings and attributes are game estimates. League One, lower-league and European opponents are simulated at team level. Southampton start the Championship season with a 4-point deduction.');
}
function boardTarget(tid) {
  const t = T(tid || G.user);
  if (divOf(t.id) === 'CH') {
    const rc = divTeams('CH').slice().sort((a, b) => T(b).rep - T(a).rep).indexOf(t.id) + 1;
    if (rc <= 2) return { pos: 2, txt: 'win promotion' };
    if (rc <= 6) return { pos: 6, txt: 'reach the play-offs' };
    if (rc <= 12) return { pos: 12, txt: 'finish in the top half' };
    if (rc <= 18) return { pos: 18, txt: 'finish in mid-table' };
    return { pos: 21, txt: 'avoid relegation' };
  }
  const ranks = G.pl.slice().sort((a, b) => T(b).rep - T(a).rep);
  const rk = ranks.indexOf(t.id) + 1;
  if (rk <= 2) return { pos: 2, txt: 'challenge for the title' };
  if (rk <= 5) return { pos: 5, txt: 'qualify for the Champions League' };
  if (rk <= 8) return { pos: 8, txt: 'finish in the European places' };
  if (rk <= 14) return { pos: 13, txt: 'finish in mid-table' };
  return { pos: 17, txt: 'avoid relegation' };
}
function boardReact(f) {
  const u = G.user; const home = f.h === u; const gf = home ? f.r[0] : f.r[1], ga = home ? f.r[1] : f.r[0];
  const opp = home ? f.a : f.h;
  const exp = (teamStrength(u) - teamStrength(opp)) / 10;
  const res = gf > ga ? 1 : gf === ga ? 0 : -1;
  let delta = res === 1 ? 1.5 - exp * .5 : res === 0 ? -exp : -2 - exp * .5;
  if (!LEAGUE_COMPS.includes(f.comp)) delta *= .6;
  G.board = clamp(G.board + delta, 0, 100);
}

// ---- day loop ----
function datesWithMatches(from) { return Object.keys(G.byDate).filter(d => d > from).sort(); }
function nextMatchDate() { const ds = datesWithMatches(G.date); return ds[0] || null; }
function userFixtureOn(d) { return (G.byDate[d] || []).map(id => G.fx[id]).find(f => (f.h === G.user || f.a === G.user) && !f.r); }
function nextUserFixture() { const ds = Object.keys(G.byDate).filter(d => d >= G.date).sort(); for (const d of ds) { const f = userFixtureOn(d); if (f) return f; } return null; }

// advance: returns {type:'match', fid} if user plays today or a day summary
function advance() {
  if (G.sacked) return { type: 'sacked' };
  // if today has unplayed fixtures (e.g. resumed mid-day), handle them
  const todays = (G.byDate[G.date] || []).filter(id => !G.fx[id].r);
  if (todays.length) {
    const uf = userFixtureOn(G.date);
    if (uf) return { type: 'match', fid: uf.id };
    return finishDay();
  }
  // move day by day until a match day or a stop event
  for (let guard = 0; guard < 400; guard++) {
    G.date = addDays(G.date, 1);
    const stop = dailyTick();
    if (stop) return stop;
    if ((G.byDate[G.date] || []).length) {
      const uf = userFixtureOn(G.date);
      if (uf) return { type: 'match', fid: uf.id };
      return finishDay();
    }
    if (G._stopForNews) { G._stopForNews = false; return { type: 'day' }; }
  }
  return { type: 'day' };
}
// simulate all remaining fixtures of today
function finishDay() {
  const ids = (G.byDate[G.date] || []).slice();
  const played = [];
  for (const id of ids) { const f = G.fx[id]; if (!f.r) { playFixture(id); played.push(id); } }
  // legacy saves: team-level Championship rounds alongside PL rounds
  if (G.champ && G.champ.rounds && ids.some(id => G.fx[id].comp === 'PL')) {
    const plRound = G.fx[ids.find(id => G.fx[id].comp === 'PL')].rnd;
    const target = Math.floor(plRound * 46 / 38);
    while (G.champ.played < target && G.champ.played < 46) { for (const f of G.champ.rounds[G.champ.played]) f.r = quickScore(f.h, f.a); G.champ.played++; }
  }
  for (const c of ['LC', 'FA', 'PO']) if (G.cups[c]) checkCupProgress(c);
  for (const c of ['UCL', 'UEL', 'UECL']) checkEuroProgress(c);
  G.lastResults = ids;
  checkBoard();
  autosave();
  return { type: 'results', ids };
}
function dailyTick() {
  // recovery & injuries
  for (const id in G.players) {
    const p = G.players[id];
    if (p.inj > 0 && p.c === G.user && p.inj > 1 && R.chance((typeof staffAb === 'function' ? staffAb('physio') : 10) / 45)) p.inj--;
    if (p.inj > 0) { p.inj--; if (p.inj === 0 && p.c === G.user) news('Fitness', `${p.n} has recovered from injury and is available again.`, G.user); }
    const sta = attrs(p).Sta;
    p.cond = Math.min(100, p.cond + 6.5 + sta * 0.25 + (p.c === G.user ? ({ fit: 1.2, light: 2.5 }[trainTeam()] || 0) : 0));
  }
  if (G.date.endsWith('-01') && T(G.user) && !T(G.user).lite) monthlyTraining();
  if (G.date.endsWith('-01')) goalOfMonth();
  finishScouting();
  // weekly finances on Mondays
  if (dow(G.date) === 1) weekly();
  // tasks
  for (const tk of G.tasks.filter(t => t.d === G.date)) {
    if (tk.t === 'drawFA') { const ent = G.pl.concat(G.champTeams, R.shuffle(G.lowerTeams).slice(0, 20)); drawRound('FA', 0, ent); const ut = G.cups.FA.rounds[0].ties.find(t => t.t.includes(G.user)); if (ut) news('FA Cup draw', `Third Round: ${tName(ut.t[0])} v ${tName(ut.t[1])} (${dNice(G.cups.FA.rounds[0].d[0], false)}).`, G.user); }
    if (tk.t === 'drawPO') drawPO();
    if (tk.t === 'winOpen') { G.window = true; msg('Transfer window open', `The January transfer window is now open until ${dNice(sd(CAL.WIN2_CLOSE))}.`); }
    if (tk.t === 'winClose') { G.window = false; msg('Transfer window closed', 'The transfer window has closed. Squads are locked until the next window.'); G.offers = G.offers.filter(o => o.st === 'done'); }
    if (tk.t === 'seasonEnd') { seasonEnd(); return { type: 'season' }; }
  }
  if (G.window) transferAI();
  return null;
}
function weekly() {
  for (const tid of fullTeams()) {
    const t = T(tid);
    if (t.para && t.para.length) { const pp = t.para[0] / 52; t.bal += pp; t.fin.in.tv += pp; }
    const w = (wageBill(tid) + (tid === G.user ? staffWages() : 0)) / 1000; t.bal -= w; t.fin.out.wages += w;
    const com = Math.pow(t.rep / 100, 4) * 2.5; t.bal += com; t.fin.in.com += com;
    for (const p of squad(tid)) { if (p.mor < 65) p.mor += 1; if (p.mor > 80) p.mor -= 1; }
  }
  if (!G.sacked && T(G.user) && !T(G.user).lite) weeklyDynamics();
  // AI manager changes occasionally
  if (dDiff(sd('2026-10-01'), G.date) > 0 && dDiff(G.date, sd('2027-04-15')) > 0 && R.chance(0.08)) {
    const tb = R.chance(.5) ? leagueTable() : champTable(); const cand = tb.slice(Math.round(tb.length / 2)).map(r => r.t).filter(t => t !== G.user && !T(t).lite && (tb.findIndex(r => r.t === t) + 1) > boardTarget(t).pos + 3);
    if (cand.length) { const t = T(R.pick(cand)); const old = t.mgr; t.mgr = genName(); news('Manager', `${t.name} have sacked ${old} and appointed ${t.mgr} as the new head coach.`, t.id, true); }
  }
  // caretakers are replaced after a few weeks
  for (const tid of fullTeams()) { const t = T(tid); if (tid !== G.user && /caretaker/i.test(t.mgr || '') && R.chance(0.3)) { t.mgr = genName(); news('Manager', `${t.name} have appointed ${t.mgr} as their new head coach.`, tid, true); }
  }
}
function checkBoard() {
  const ur = userDiv() === 'CH' && G.chLeague ? G.chLeague.rounds : G.league.rounds;
  if (G.board < 8 && !G.sacked && ur.flat().filter(id => G.fx[id].r).length > ur.flat().length / 6) {
    G.sacked = true; msg('Sacked', `The ${userTeam().name} board has lost patience after a run of poor results and has terminated your contract.`);
  }
}

// ---- save/load ----
function autosave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { } }
function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); if (!s) return null; return JSON.parse(s); } catch (e) { return null; } }
function restore(obj) { G = obj; _pid = Math.max(0, ...Object.keys(G.players).map(k => +k.slice(1) || 0)); _attrCache.clear(); }
