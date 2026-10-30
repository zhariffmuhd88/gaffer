// youth.js: reserve (U21) and academy (U18) squads, youth leagues, promotions and the summer academy intake.
// Loaded after champ.js, before boot.js. Real players come from YOUTH (data_youth.js); generated ones carry gen: true.

const YOUTH_COMPS = { PL2: 'Premier League 2', PL2D2: 'PL2 Division 2', U18: 'U18 Premier League', PDL: 'U18 Professional Development League' };
const YLEVEL = { f: 'First team', r: 'Reserves', a: 'Academy' };
STAFF_ROLES.hoyd = 'Head of Youth Development';
STAFF_FX.hoyd = 'Runs the academy: stronger intakes each summer and faster progress for reserve and academy players.';
const Y_AGE = { 15: 40, 16: 43, 17: 46, 18: 50, 19: 54, 20: 57, 21: 60, 22: 62, 23: 64, 24: 65 };
const Y_PLAN = { r: { GK: 2, CB: 4, LB: 2, RB: 2, DM: 2, CM: 2, AM: 1, LW: 1, RW: 1, ST: 2 }, a: { GK: 2, CB: 3, LB: 1, RB: 1, DM: 1, CM: 2, AM: 1, LW: 1, RW: 1, ST: 2 } };

// ---------- squad levels ----------
function yList(tid, lvl) { const L = lvl === 'a' ? G.acad : G.res; return ((L && L[tid]) || []).map(P).filter(p => p && p.c === tid && p.sq === lvl); }
function resSquad(tid) { return yList(tid, 'r'); }
function acadSquad(tid) { return yList(tid, 'a'); }
function levelOf(p) { return p.sq || (G.sq[p.c] && G.sq[p.c].includes(p.id) ? 'f' : null); }
function freeNo(tid, from) { const used = new Set(squad(tid).map(q => q.no)); let n = from || 2; while (used.has(n)) n++; return n; }
function yDetach(p, tid) {
  G.sq[tid] = (G.sq[tid] || []).filter(x => x !== p.id);
  for (const L of [G.res, G.acad]) if (L && L[tid]) L[tid] = L[tid].filter(x => x !== p.id);
  const t = T(tid); if (t && t.tac) { t.tac.xi = t.tac.xi.map(x => x === p.id ? null : x); t.tac.bench = (t.tac.bench || []).filter(x => x !== p.id); }
}
function setLevel(p, lvl) {
  const tid = p.c; if (!T(tid)) return;
  yDetach(p, tid);
  if (lvl === 'f') { delete p.sq; G.sq[tid].push(p.id); if (!p.no || squad(tid).some(q => q !== p && q.no === p.no)) p.no = freeNo(tid, p.age <= 21 ? 30 : 2); if (p.wage < 3) p.wage = Math.max(3, Math.round(wageFor(p, tid) * .6)); }
  else { p.sq = lvl; const L = lvl === 'a' ? G.acad : G.res; L[tid] = (L[tid] || []).concat(p.id); }
  if (tid === G.user) validateLineup(G.user); else if (lvl !== 'f') autoPick(tid);
}
function firstTeamBar(tid) { const cas = squad(tid).map(p => p.ca).sort((a, b) => b - a); return cas[17] || cas[cas.length - 1] || 55; }

// ---------- creating youth players ----------
function mkYouth(tid, lvl, o) {
  const p = mkPlayer({ n: o.n, c: tid, pos: o.pos, age: o.age, nat: o.nat, ca: o.ca, seed: R.i(1, 999) });
  if (o.gen) p.gen = true;
  if (o.est) p.ageEst = true;
  let gap = o.age <= 17 ? R.i(8, 30) : o.age <= 19 ? R.i(5, 24) : o.age <= 21 ? R.i(2, 16) : R.i(0, 8);
  if (R.chance(.07)) gap += R.i(6, 12); // a few genuine prospects
  p.pa = clamp(o.ca + gap + (o.paB || 0), o.ca, 94);
  p.con = G.year + R.i(1, 3); p.no = 0;
  p.wage = lvl === 'a' ? 1 : clamp(Math.round(1 + (o.ca - 50) / 4), 1, 8);
  p.val = calcValue(p); p.sq = lvl; p.ys = { a: 0, g: 0, r: 0 };
  G.players[p.id] = p;
  const L = lvl === 'a' ? G.acad : G.res; L[tid] = (L[tid] || []).concat(p.id);
  return p;
}
function clubYouthLevel(tid) { const t = T(tid); return clamp(((t.rep || 60) - 70) / 8, -3, 3); }
function genYouth(tid, lvl, pos, age, bonus) {
  const ca = Math.round((Y_AGE[age] || 40) + clubYouthLevel(tid) - 2 + (bonus || 0) + R.gauss() * 3);
  return mkYouth(tid, lvl, { n: genName(), pos, age, nat: R.pick(NATS_YOUTH), ca: lvl === 'a' ? clamp(ca, 36, 62) : clamp(ca, 46, 70), gen: true, paB: bonus ? Math.round(bonus) : 0 });
}
function ensureYouth(tid) {
  G.res = G.res || {}; G.acad = G.acad || {};
  if ((G.res[tid] && G.res[tid].length) || (G.acad[tid] && G.acad[tid].length)) return;
  G.res[tid] = []; G.acad[tid] = [];
  const code = (typeof CH_LEGACY !== 'undefined' && CH_LEGACY[tid]) || tid;
  const rows = YOUTH[code] && !(T(tid).relSquad) ? YOUTH[code].trim().split('\n') : [];
  const taken = new Set(Object.values(G.players).filter(p => p.c === tid).map(p => p.n));
  for (const row of rows) {
    const [lvl, n, pos, age, nat, ca] = row.split('|');
    if (taken.has(n)) continue;
    mkYouth(tid, lvl, { n, pos, age: parseInt(age), est: age.includes('~'), nat, ca: +ca });
  }
  for (const lvl of ['r', 'a']) {
    const have = {}; for (const p of yList(tid, lvl)) have[p.pos] = (have[p.pos] || 0) + 1;
    for (const pos in Y_PLAN[lvl]) for (let i = have[pos] || 0; i < Y_PLAN[lvl][pos]; i++) genYouth(tid, lvl, pos, lvl === 'a' ? R.i(16, 18) : R.i(19, 21));
  }
}

// ---------- youth leagues ----------
function yLeagueTeams(c) { return c === 'PL2' || c === 'U18' ? G.pl.slice() : divTeams('CH'); }
function yLevelOf(c) { return c === 'PL2' || c === 'PL2D2' ? 'r' : 'a'; }
function yCompOf(tid, lvl) { const pl = G.pl.includes(tid); return lvl === 'r' ? (pl ? 'PL2' : 'PL2D2') : (pl ? 'U18' : 'PDL'); }
function buildYouthLeagues() {
  G.res = G.res || {}; G.acad = G.acad || {};
  for (const tid of fullTeams()) ensureYouth(tid);
  // clubs that dropped to League One (team level) lose their youth squads
  for (const L of [G.res, G.acad]) for (const tid in L) if (!divOf(tid)) {
    for (const id of L[tid]) { const p = P(id); if (p && p.c === tid && p.sq) { if (p.car && p.car.a) { p.c = 'FA'; delete p.sq; } else delete G.players[id]; } }
    delete L[tid];
  }
  G.yl = {};
  for (const c of Object.keys(YOUTH_COMPS)) { const teams = R.shuffle(yLeagueTeams(c)); G.yl[c] = { teams, rounds: roundRobin(teams), ri: 0, res: [], sc: {} }; }
  for (const tid of fullTeams()) for (const p of resSquad(tid).concat(acadSquad(tid))) p.ys = { a: 0, g: 0, r: 0 };
  G.ywc = 0;
}
function yTable(c) {
  const L = G.yl && G.yl[c]; if (!L) return [];
  const tb = {}; for (const t of L.teams) tb[t] = { t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] };
  for (const [h, a, gh, ga] of L.res) { if (!tb[h] || !tb[a]) continue; addRes(tb[h], gh, ga); addRes(tb[a], ga, gh); tb[h].form.push(gh > ga ? 'W' : gh < ga ? 'L' : 'D'); tb[a].form.push(ga > gh ? 'W' : ga < gh ? 'L' : 'D'); }
  return Object.values(tb).sort(sortTable);
}
function yLineup(tid, lvl) {
  const pool = yList(tid, lvl).filter(p => p.inj <= 0);
  const gk = pool.filter(p => p.pos === 'GK').sort((a, b) => b.ca - a.ca)[0];
  const out = pool.filter(p => p.pos !== 'GK').map(p => [p, p.ca + R.gauss() * 4]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const xi = (gk ? [gk] : []).concat(out.slice(0, gk ? 10 : 11));
  return { xi, subs: out.slice(gk ? 10 : 11, (gk ? 10 : 11) + 3) };
}
const Y_GW = { ST: 5, LW: 3, RW: 3, AM: 3, CM: 1.4, DM: .7, CB: .5, LB: .5, RB: .5, GK: 0 };
const Y_AW = { ST: 2, LW: 3.5, RW: 3.5, AM: 4, CM: 2.5, DM: 1.2, CB: .4, LB: 1.4, RB: 1.4, GK: .05 };
function yPick(list, W) { return R.wpick(list, p => (W[p.pos] || .5) * Math.pow(p.ca / 55, 2) + .01); }
function yMatch(c, h, a) {
  const lvl = yLevelOf(c); const L = G.yl[c];
  const H = yLineup(h, lvl), A = yLineup(a, lvl);
  const str = (x) => x.xi.length ? x.xi.reduce((s, p) => s + p.ca, 0) / x.xi.length - (11 - x.xi.length) * 2 : 40;
  const d = (str(H) + 1.5 - str(A)) / 10;
  const gh = poisson(clamp(1.5 * Math.exp(d * .6), .3, 4.5)), ga = poisson(clamp(1.3 * Math.exp(-d * .6), .3, 4.5));
  L.res.push([h, a, gh, ga]);
  for (const [side, goals, conc] of [[H, gh, ga], [A, ga, gh]]) {
    const all = side.xi.concat(side.subs); if (!all.length) continue;
    const g = {}, as = {};
    for (let i = 0; i < goals; i++) { const s = yPick(all, Y_GW); g[s.id] = (g[s.id] || 0) + 1; L.sc[s.id] = (L.sc[s.id] || 0) + 1; if (R.chance(.75)) { const o = all.filter(p => p !== s); if (o.length) { const x = yPick(o, Y_AW); as[x.id] = (as[x.id] || 0) + 1; } } }
    for (const p of all) {
      const sub = side.subs.includes(p);
      const rt = clamp(6.6 + (goals > conc ? .4 : goals < conc ? -.35 : 0) + (g[p.id] || 0) * .6 + (as[p.id] || 0) * .3 + (p.pos === 'GK' && !conc ? .5 : 0) + R.gauss() * .45 - (sub ? .2 : 0), 5, 9.6);
      p.ys = p.ys || { a: 0, g: 0, r: 0 }; p.ys.a++; p.ys.g += g[p.id] || 0; p.ys.r += rt;
      p.ym = (p.ym || 0) + (sub ? .5 : 1); p.ymr = (p.ymr || 0) + rt;
      if (R.chance(.008)) { p.inj = R.i(5, 28); p.injT = 'a knock in a youth game'; }
      if ((g[p.id] || 0) >= 3 && p.c === G.user) news('Youth football', `${p.n} scores a hat-trick for the ${YLEVEL[lvl].toLowerCase()} in the ${YOUTH_COMPS[c]}.`, G.user);
    }
  }
}
function youthWeek() {
  if (!G.yl) buildYouthLeagues();
  const w = Math.floor(dDiff(sd('2026-08-17'), G.date) / 7);
  if (w < 0) return;
  let played = 0;
  for (const c in G.yl) {
    const L = G.yl[c]; const target = Math.min(L.rounds.length, Math.floor((w + 1) * L.rounds.length / 34));
    while (L.ri < target) { for (const [h, a] of L.rounds[L.ri]) if (T(h) && T(a) && divOf(h) && divOf(a)) yMatch(c, L.ri % 2 ? a : h, L.ri % 2 ? h : a); L.ri++; played = 1; }
  }
  if (played) G.ywc = (G.ywc || 0) + 1;
  // youth wages, AI call-ups for injuries, prospects asking for a chance
  for (const tid of fullTeams()) {
    const t = T(tid); const ys = resSquad(tid).concat(acadSquad(tid));
    const w2 = ys.reduce((s, p) => s + (p.wage || 0), 0) / 1000; t.bal -= w2; t.fin.out.wages += w2;
    if (tid !== G.user) {
      const avail = squad(tid).filter(available);
      if (avail.length < 17 || !avail.some(p => p.pos === 'GK')) {
        const need = !avail.some(p => p.pos === 'GK') ? 'GK' : null;
        const cand = resSquad(tid).filter(p => available(p) && p.age >= 17 && (!need || p.pos === need)).sort((a, b) => b.ca - a.ca)[0];
        if (cand) setLevel(cand, 'f');
      }
    }
  }
  if (!G.sacked && T(G.user) && !T(G.user).lite) {
    for (const p of resSquad(G.user)) {
      if (p.age < 19 || p.age > 23 || p.dem) continue;
      const grp = squad(G.user).filter(q => POS_GROUP[q.pos] === POS_GROUP[p.pos]).map(q => q.ca).sort((a, b) => b - a);
      if (p.ca >= (grp[2] || 0) - 1) { setHap(p, -1.5); if (p.askY !== G.year) { p.askY = G.year; news('Youth football', `${p.n} (${p.ca}) feels he is ready for first-team football and would like a chance.`, G.user); } }
    }
  }
}
const _wkY = weekly;
weekly = function () { _wkY(); try { youthWeek(); } catch (e) { console.error(e); } };
const _dtY = dailyTick;
dailyTick = function () { if (G.date.endsWith('-01')) { G.ywk = Math.max(1, G.ywc || 0); G.ywc = 0; } return _dtY(); };
const _bsY = buildSeason;
buildSeason = function () { _bsY(); try { buildYouthLeagues(); } catch (e) { console.error(e); } };

// ---------- summer: academy intake and squad rollover ----------
youthIntake = function () {
  for (const tid of fullTeams()) {
    const t = T(tid); const user = tid === G.user;
    for (const p of acadSquad(tid)) if (p.age >= 19) { setLevel(p, 'r'); if (user) (G._grads = G._grads || []).push(p.n); } // graduates move up before the new intake
    const hoyd = user ? staffAb('hoyd') : 8 + Math.round(clubYouthLevel(tid) * 2);
    const n = clamp(17 - acadSquad(tid).length + R.i(-1, 1), 4, 8) + (hoyd >= 16 ? 1 : 0);
    const fresh = [];
    for (let i = 0; i < n; i++) {
      const pos = R.pick(['GK', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'AM', 'LW', 'RW', 'ST', 'ST']);
      const bonus = (hoyd - 10) * .35 + (user ? (staffAb('scout') - 10) * .1 : 0) + (typeof facLvl === 'function' ? (facLvl('yth', tid) - 10) * .2 : 0) + (R.chance(.05) ? 6 : 0);
      fresh.push(genYouth(tid, 'a', pos, 16, bonus));
    }
    if (user && fresh.length) { const best = fresh.slice().sort((a, b) => b.pa - a.pa)[0]; news('Academy intake', `${fresh.length} youngsters join the academy: ${fresh.map(p => `${p.n} (${POS_LABEL[p.pos]})`).join(', ')}. The youth staff are most excited about ${best.n}.`, G.user); }
    if (!user) {
      // keep first-team squads workable: promote from the reserves first, then free agents, then generated players
      let guard = 0;
      while (squad(tid).length < 23 && guard++ < 12) {
        const r = resSquad(tid).filter(p => p.age >= 18).sort((a, b) => b.ca - a.ca)[0];
        if (r && r.ca >= firstTeamBar(tid) - 6) { setLevel(r, 'f'); continue; }
        const best = G.fa.map(P).filter(Boolean).sort((a, b) => b.ca - a.ca)[0];
        if (best) { G.fa = G.fa.filter(x => x !== best.id); best.c = tid; delete best.sq; best.con = G.year + 1 + R.i(1, 3); best.wage = wageFor(best, tid); best.no = freeNo(tid); G.sq[tid].push(best.id); }
        else { const p = mkPlayer({ n: genName(), c: tid, pos: R.pick(['CB', 'CM', 'ST', 'LB', 'RW']), age: R.i(21, 29), nat: R.pick(NATS_YOUTH), ca: clamp(t.rep - 12, 55, 80), seed: R.i(1, 999), gen: true }); p.con = G.year + 3; p.wage = wageFor(p, tid); p.no = freeNo(tid); G.players[p.id] = p; G.sq[tid].push(p.id); }
      }
      if (squad(tid).length > 32) { const cut = squad(tid).sort((a, b) => a.ca - b.ca).slice(0, squad(tid).length - 32); for (const p of cut) { G.sq[tid] = G.sq[tid].filter(x => x !== p.id); p.c = 'FA'; G.fa.push(p.id); } }
    }
  }
};
function yRelease(p, why) {
  const tid = p.c; yDetach(p, tid); delete p.sq;
  if (p.ca >= 52) { p.c = 'FA'; G.fa.push(p.id); } else if (p.car && p.car.a) p.c = 'FA'; else delete G.players[p.id];
  if (tid === G.user) return p.n;
  return null;
}
function youthRollover() {
  const gone = [], up = [], grads = [];
  for (const tid of fullTeams()) {
    const user = tid === G.user;
    for (const p of acadSquad(tid)) if (p.age >= 19) { setLevel(p, 'r'); if (user) grads.push(p.n); }
    if (user && G._grads) { grads.push(...G._grads); G._grads = null; }
    for (const p of resSquad(tid)) {
      if (p.age < 23) continue;
      const good = p.ca >= firstTeamBar(tid) - 1;
      if (!user && good) setLevel(p, 'f');
      else if (!user || (p.age >= 24 && !p.dem)) { const n = yRelease(p); if (n) gone.push(n); }
    }
    if (!user) for (const p of resSquad(tid).concat(acadSquad(tid))) if (p.age >= 18 && p.ca >= firstTeamBar(tid) + 2) setLevel(p, 'f');
    if (!user) { const rs = resSquad(tid).sort((a, b) => (a.ca + a.pa) - (b.ca + b.pa)); for (const p of rs.slice(0, Math.max(0, rs.length - 24))) yRelease(p); }
    for (const p of resSquad(tid).concat(acadSquad(tid))) if (p.con <= G.year) { p.con = G.year + R.i(1, 3); p.wage = p.sq === 'a' ? 1 : clamp(Math.round(1 + (p.ca - 50) / 4), 1, 8); }
    if (!user) autoPick(tid);
  }
  if (grads.length) news('Youth football', `Moving up from the academy to the reserves: ${grads.join(', ')}.`, G.user);
  if (gone.length) news('Youth football', `Released after ageing out of the reserves: ${gone.join(', ')}.`, G.user);
  if (resSquad(G.user).length > 28) news('Youth football', `Your reserve squad has ${resSquad(G.user).length} players. Release, loan or sell some so they all get game time.`, G.user);
  const old = resSquad(G.user).filter(p => p.age === 23 && !p.dem);
  if (old.length) news('Youth football', `${old.map(p => p.n).join(', ')} turn${old.length === 1 ? 's' : ''} 23. Promote, loan or sell them this season; reserves aged 24 are released in the summer.`, G.user);
}
const _seY = seasonEnd;
seasonEnd = function () { _seY(); try { if (T(G.user)) youthRollover(); autosave(); } catch (e) { console.error(e); } };

// ---------- keep levels consistent when players move ----------
const _ctY = completeTransfer;
completeTransfer = function (p, toTid, fee, wage, years) { const from = p.c, lvl = p.sq; if (lvl) { yDetach(p, from); delete p.sq; } _ctY(p, toTid, fee, wage, years); };
const _saY = sellAbroad;
sellAbroad = function (p, fee, club) { if (p.sq) { yDetach(p, p.c); delete p.sq; } _saY(p, fee, club); };
const _rpY = releasePlayer;
releasePlayer = function (pid) {
  const p = P(pid);
  if (p && p.sq && p.c === G.user) { yDetach(p, G.user); delete p.sq; p.c = 'FA'; p.listed = false; G.fa.push(pid); news('Transfer', `${p.n} has been released by ${userTeam().name}.`, G.user); return { ok: true, msg: `${p.n} released.` }; }
  return _rpY(pid);
};
const _loY = loanOut;
loanOut = function (pid, dest) {
  const p = P(pid); const lvl = p && p.sq;
  if (lvl) { G.sq[G.user].push(p.id); } // loanOut expects him in the first-team list
  const r = _loY(pid, dest);
  if (lvl) { if (r.ok) { yDetach(p, G.user); delete p.sq; p.loan.lvl = lvl; } else { G.sq[G.user] = G.sq[G.user].filter(x => x !== p.id); } }
  return r;
};
const _rlY = returnLoans;
returnLoans = function () {
  const back = Object.values(G.players).filter(p => p.loan && p.loan.out && p.loan.lvl).map(p => [p, p.loan.lvl, p.loan.from]);
  _rlY();
  for (const [p, lvl, from] of back) if (p.c === from && T(from) && !T(from).lite) { G.sq[from] = G.sq[from].filter(x => x !== p.id); p.sq = lvl; const L = lvl === 'a' ? G.acad : G.res; L[from] = (L[from] || []).concat(p.id); }
};
const _impY = importance;
importance = function (p) { return p.sq ? 'backup' : _impY(p); };
const _ensY = ensureStaff;
ensureStaff = function () {
  _ensY();
  if (G.staff && !G.staff.hoyd) G.staff.hoyd = mkStaff('hoyd', 7 + ((userTeam() || {}).rep - 60) / 3.5 + R.i(-2, 2));
  if (G.staffPool && !G.staffPool.some(s => s.role === 'hoyd')) for (let i = 0; i < 4; i++) G.staffPool.push(mkStaff('hoyd', R.i(5, 19)));
};
const _migY = migrate;
migrate = function () { _migY(); try { if (!G.res || !G.yl) buildYouthLeagues(); ensureStaff(); } catch (e) { console.error(e); } };

// ================= UI =================
function yStatsTxt(p) { const s = p.ys || { a: 0, g: 0, r: 0 }; return s.a ? `${s.a} apps · ${s.g} goals · avg ${(s.r / s.a).toFixed(2)}` : 'no youth games yet'; }
function yTableMini(c, mark) {
  const rows = yTable(c); if (!rows.length) return '';
  const i = rows.findIndex(r => r.t === mark);
  const show = rows.filter((r, k) => k < 6 || Math.abs(k - i) <= 1 || k === rows.length - 1);
  return `<div class="tw"><table class="t"><thead><tr><th class="n">Pos</th><th>Team</th><th class="n">P</th><th class="n">GD</th><th class="n">Pts</th></tr></thead><tbody>${show.map(r => { const k = rows.indexOf(r); return `<tr class="${r.t === mark ? 'me' : ''}"><td class="n">${k + 1}</td><td>${tLink(r.t)}</td><td class="n">${r.p}</td><td class="n">${r.gf - r.ga > 0 ? '+' : ''}${r.gf - r.ga}</td><td class="n"><b>${r.pts}</b></td></tr>`; }).join('')}</tbody></table></div>`;
}
function yScorers(c, n, onlyTid) {
  const L = G.yl && G.yl[c]; if (!L) return [];
  return Object.entries(L.sc).map(([id, g]) => [P(id), g]).filter(([p]) => p && (!onlyTid || p.c === onlyTid)).sort((a, b) => b[1] - a[1]).slice(0, n);
}
function yLevelScreen(lvl) {
  const tid = G.user; const list = yList(tid, lvl).sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos] || b.ca - a.ca);
  const c = yCompOf(tid, lvl); const tb = yTable(c); const pos = tb.findIndex(r => r.t === tid) + 1;
  const wages = list.reduce((s, p) => s + (p.wage || 0), 0);
  const real = list.filter(p => !p.gen).length;
  const head = `<p class="dim" style="margin:6px 0">${lvl === 'r' ? 'Under-21 players (plus a few over-age ones) who play in the ' + YOUTH_COMPS[c] + '. Reserves can be named on the first-team bench from the Tactics screen, promoted, loaned out or sold. Reserves aged 24 are released in the summer.' : 'Under-18 players who play in the ' + YOUTH_COMPS[c] + '. They move up to the reserves at 19. Your Head of Youth Development shapes each summer intake.'} ${real} of ${list.length} are real players${list.length - real ? '; the rest are generated (GEN)' : ''}.</p>`;
  const rows = list.map(p => `<tr class="click" data-a="player" data-v="${p.id}"><td><b>${esc(p.n)}</b>${p.gen ? ' <span class="tag gen" title="Generated player: not a real person">GEN</span>' : ''}</td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.age}${p.ageEst ? '<span class="dim" title="Estimated age">~</span>' : ''}</td><td class="mono dim">${esc(p.nat)}</td><td class="n"><b>${p.ca}</b></td><td class="stars">${potStars(p)}</td><td class="n">${(p.ys && p.ys.a) || 0}</td><td class="n">${(p.ys && p.ys.g) || 0}</td><td class="n">${p.ys && p.ys.a ? (p.ys.r / p.ys.a).toFixed(2) : '-'}</td><td>${statusTags(p)}</td><td style="white-space:nowrap"><button class="btn sm" data-a="ylvl" data-k="f" data-v="${p.id}">Promote</button>${lvl === 'a' ? ` <button class="btn sm" data-a="ylvl" data-k="r" data-v="${p.id}">To reserves</button>` : ''}</td></tr>`).join('');
  const sc = yScorers(c, 8);
  return `<div class="band">${YLEVEL[lvl]}<small>${list.length} players · ${YOUTH_COMPS[c]}${pos ? ' · ' + ordinal(pos) : ''} · wages ${wageStr(wages)}</small></div>${head}
  <div class="tw"><table class="t"><thead><tr><th>Name</th><th>Pos</th><th class="n">Age</th><th>Nat</th><th class="n">Ovr</th><th>Potential</th><th class="n">Apps</th><th class="n">Gls</th><th class="n">Avg</th><th></th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="11" class="dim">No players.</td></tr>'}</tbody></table></div>
  <div class="grid2" style="margin-top:10px"><div><h2 class="sect" style="margin-top:0">${YOUTH_COMPS[c]}</h2>${yTableMini(c, tid)}</div><div><h2 class="sect" style="margin-top:0">Top scorers</h2><div class="tw"><table class="t"><tbody>${sc.map(([p, g], i) => `<tr class="click ${p.c === tid ? 'me' : ''}" data-a="player" data-v="${p.id}"><td class="n">${i + 1}</td><td>${esc(p.n)}</td><td>${tLink(p.c)}</td><td class="n"><b>${g}</b></td></tr>`).join('') || '<tr><td class="dim">No goals yet.</td></tr>'}</tbody></table></div></div></div>`;
}
const _sqY = scrSquad;
scrSquad = function () {
  const tab = UI.tab.sq || 'f';
  const tabs = `<div class="tabs" style="margin-top:8px">${[['f', 'First team', squad(G.user).length], ['r', 'Reserves', resSquad(G.user).length], ['a', 'Academy', acadSquad(G.user).length]].map(([k, l, n]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="sq" data-v="${k}">${l} (${n})</button>`).join('')}</div>`;
  if (tab === 'f') { const h = _sqY(); const i = h.indexOf('</div>'); return h.slice(0, i + 6) + tabs + h.slice(i + 6); }
  const h = yLevelScreen(tab); const i = h.indexOf('</div>'); return h.slice(0, i + 6) + tabs + h.slice(i + 6);
};
// player pop-up: squad level, youth stats and moves between levels
const _pxY = playerExtra;
playerExtra = function (p) {
  let box = '';
  const own = p.c === G.user && !p.loan;
  const lvl = levelOf(p);
  if (p.sq || (own && lvl)) {
    const c = p.sq ? yCompOf(p.c, p.sq) : null;
    const moves = own ? [['f', 'First team'], ['r', 'Reserves'], ['a', 'Academy']].filter(([k]) => k !== lvl && (k !== 'a' || p.age <= 18)) : [];
    box = `<h2 class="sect">Squad level</h2><div class="box pad"><div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap"><b>${YLEVEL[lvl || 'f']}</b>${c ? `<span class="dim">${YOUTH_COMPS[c]}: ${yStatsTxt(p)}</span>` : ''}${moves.length ? `<span class="spacer"></span>${moves.map(([k, l]) => `<button class="btn sm" data-a="ylvl" data-k="${k}" data-v="${p.id}">${k === 'f' ? 'Promote to first team' : 'Move to ' + l.toLowerCase()}</button>`).join(' ')}` : ''}</div>${p.gen ? '<p class="dim" style="margin:6px 0 0;font-size:12.5px">Generated player: not a real person.</p>' : ''}${p.ageEst ? '<p class="dim" style="margin:6px 0 0;font-size:12.5px">Age not published; the game uses an estimate.</p>' : ''}</div>`;
  }
  return _pxY(p) + box;
};
function yMove(pid, lvl) {
  const p = P(pid); if (!p || p.c !== G.user) return;
  const cur = levelOf(p);
  if (lvl === 'f' && squad(G.user).length >= 32) return toast('The first-team squad is full (32). Move someone down first.');
  if (cur === 'f' && squad(G.user).length <= 16) return toast('You need at least 16 players in the first-team squad.');
  if (lvl === 'a' && p.age > 18) return toast('Only players aged 18 or under can join the academy.');
  setLevel(p, lvl);
  if (lvl === 'f' && cur !== 'f') { setHap(p, 8); p.mor = clamp(p.mor + 6, 0, 100); news('Youth football', `${p.n} is promoted to the first-team squad.`, G.user); }
  if (cur === 'f' && lvl !== 'f') p.dem = true;
  if (lvl === 'f') delete p.dem;
  if (cur === 'f' && lvl !== 'f') { if (p.age >= 22 && p.ca >= firstTeamBar(G.user) - 3) setHap(p, -6); }
  autosave();
  toast(`${p.n} moves to the ${YLEVEL[lvl].toLowerCase()}.`);
  if (UI.modal) playerModal(pid); else render();
}
Object.assign(ACT, { ylvl: (v, el) => yMove(v, el.dataset.k), ycomp: (v) => { UI.tab.yc = v; render(); } });
// tactics: reserve and academy players can be named on the bench
const _tpY = tacticsPick;
tacticsPick = function (pid) {
  const p = P(pid);
  if (p && p.sq && UI.tSel && UI.tSel.type === 'xi') return toast('Reserve and academy players can only be named on the bench. Promote him to start.');
  return _tpY(pid);
};
const _scrY = screen;
screen = function (s) {
  const html = _scrY(s);
  if (s === 'tactics' && G && UI.tSel && UI.tSel.type === 'bench') {
    const ys = resSquad(G.user).concat(acadSquad(G.user)).filter(available).sort((a, b) => b.ca - a.ca);
    const tac = userTeam().tac;
    const extra = `<h2 class="sect">Reserves &amp; academy <span class="dim" style="font-size:14px">(bench only)</span></h2><div class="tw" style="max-height:320px;overflow-y:auto"><table class="t"><tbody>${ys.map(p => `<tr class="click" data-a="tpick" data-v="${p.id}"><td>${esc(p.n)}${p.gen ? ' <span class="tag gen">GEN</span>' : ''}</td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.age}</td><td class="n"><b>${p.ca}</b></td><td class="dim">${YLEVEL[p.sq]}</td><td>${tac.bench.includes(p.id) ? '<span class="cyan mono">Bench</span>' : ''}</td></tr>`).join('')}</tbody></table></div>`;
    const i = html.lastIndexOf('</tbody></table></div>');
    if (i > 0) return html.slice(0, i + 22) + extra + html.slice(i + 22);
  }
  return html;
};
// league tables: youth competitions
const _stY = scrTable;
scrTable = function () {
  const tab = UI.tab.tb || (userDiv() === 'CH' ? 'ch' : 'pl');
  const yBtn = `<button class="${tab === 'y' ? 'on' : ''}" data-a="tab" data-k="tb" data-v="y">Youth leagues</button>`;
  if (tab !== 'y') { const h = _stY(); return h.replace('data-v="ch">Championship</button></div>', 'data-v="ch">Championship</button>' + yBtn + '</div>'); }
  const c = UI.tab.yc && YOUTH_COMPS[UI.tab.yc] ? UI.tab.yc : yCompOf(G.user, 'r');
  const sc = yScorers(c, 15);
  return `<div class="band">League tables<small>${seasonLabel(G.year)}</small></div><div class="tabs" style="margin-top:8px"><button data-a="tab" data-k="tb" data-v="pl">Premier League</button><button data-a="tab" data-k="tb" data-v="ch">Championship</button>${yBtn}</div>
  <div class="tabs" style="margin-top:4px">${Object.entries(YOUTH_COMPS).map(([k, l]) => `<button class="${c === k ? 'on' : ''}" data-a="ycomp" data-v="${k}">${l}</button>`).join('')}</div>
  <p class="dim" style="margin:6px 0">${yLevelOf(c) === 'r' ? 'Reserve (under-21) football' : 'Academy (under-18) football'}, simulated each week for ${c === 'PL2' || c === 'U18' ? 'Premier League' : 'Championship'} clubs. One round-robin season, August to April.</p>
  ${tableHtml(yTable(c), null, { form: true })}
  <h2 class="sect">Top scorers</h2><div class="tw"><table class="t"><thead><tr><th class="n">#</th><th>Player</th><th>Club</th><th>Pos</th><th class="n">Age</th><th class="n">Goals</th></tr></thead><tbody>${sc.map(([p, g], i) => `<tr class="click ${p.c === G.user ? 'me' : ''}" data-a="player" data-v="${p.id}"><td class="n">${i + 1}</td><td>${esc(p.n)}${p.gen ? ' <span class="tag gen">GEN</span>' : ''}</td><td>${tLink(p.c)}</td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.age}</td><td class="n"><b>${g}</b></td></tr>`).join('') || '<tr><td colspan="6" class="dim">No goals yet.</td></tr>'}</tbody></table></div>`;
};
// club pop-up: reserves and academy
const _cmY = clubModal;
clubModal = function (tid) {
  _cmY(tid);
  const t = T(tid); if (!t || t.lite || !UI.modal) return;
  const sec = (lvl) => { const l = yList(tid, lvl).sort((a, b) => b.ca - a.ca); return l.length ? `<h2 class="sect">${YLEVEL[lvl]} <span class="dim" style="font-size:14px">${YOUTH_COMPS[yCompOf(tid, lvl)]}</span></h2><div class="tw"><table class="t"><tbody>${l.map(p => `<tr class="click" data-a="player" data-v="${p.id}"><td>${esc(p.n)}${p.gen ? ' <span class="tag gen">GEN</span>' : ''}</td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.age}</td><td class="n"><b>${p.ca}</b></td><td class="stars">${potStars(p)}</td><td class="n dim">${(p.ys && p.ys.g) || 0} gls</td></tr>`).join('')}</tbody></table></div>` : ''; };
  UI.modal = UI.modal.replace(/<\/div>$/, sec('r') + sec('a') + '</div>');
  render();
};
// clickable youth competitions
Object.assign(COMP_LINK, { 'Premier League 2': 'PL2', 'PL2 Division 2': 'PL2D2', 'U18 Premier League': 'U18', 'U18 Professional Development League': 'PDL' });
const _gcY = goComp;
goComp = function (code) { if (YOUTH_COMPS[code]) { UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'table'; UI.tab.tb = 'y'; UI.tab.yc = code; render(); window.scrollTo(0, 0); return; } _gcY(code); };
