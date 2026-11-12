// leagueone.js: League One with real squads (an XL league, code LO, on the Championship's dates), promotion and
// relegation with the Championship (relegated clubs keep their squads), four clubs down to League Two (team level)
// and four up from it. Also migrates older saves: League One, the Eredivisie and the KNVB Cup are added.
// Loaded after xleagues.js.

// team-level League One sides in older data -> real clubs
const LO_ALIAS = { 'Leicester City': 'LEI', 'Sheffield Wednesday': 'SHW', 'Oxford United': 'OXF', 'Luton Town': 'LUT', 'Plymouth Argyle': 'PLY', 'Stockport County': 'STO',
  Huddersfield: 'HUD', 'Huddersfield Town': 'HUD', Barnsley: 'BNS', Wigan: 'WIG', 'Wigan Athletic': 'WIG', Reading: 'REA', Peterborough: 'PET', 'Peterborough United': 'PET',
  Mansfield: 'MAN', 'Mansfield Town': 'MAN', Wycombe: 'WYC', 'Wycombe Wanderers': 'WYC', Blackpool: 'BLP', 'Leyton Orient': 'LOR', 'Burton Albion': 'BRT', Doncaster: 'DON',
  'Doncaster Rovers': 'DON', 'Bradford City': 'BRA', 'AFC Wimbledon': 'WIM', 'MK Dons': 'MKD', 'Notts County': 'NCO', Bromley: 'BRO', 'Cambridge United': 'CAMU', Stevenage: 'STE' };
function loOn() { return !!(G && G.xl && G.xl.LO && G.xl.LO.length); }
function uniq(a) { return [...new Set(a)]; }

// ---------- new games: the team-level copies of League One clubs go ----------
function loDedupe() {
  if (!loOn() || G.loDone) return;
  const ids = new Set(G.xl.LO);
  const gone = {};
  for (const id of G.lowerTeams || []) { const t = T(id); if (!t || !t.lite) continue; const x = LO_ALIAS[t.name]; if (x && ids.has(x)) gone[id] = x; }
  for (const id in gone) delete G.teams[id];
  G.lowerTeams = uniq(G.xl.LO.concat((G.lowerTeams || []).filter(id => !gone[id])));
  G.l1 = G.xl.LO.slice(); G.loDone = 1;
}

// ---------- season end ----------
const _sloLO = simLeagueOne;
simLeagueOne = function () {
  if (!loOn()) return _sloLO();
  const st = xlTable('LO'); if (st.length < 8 || !st[0].p) return _sloLO();
  const po = quickPO(quickPO(st[2].t, st[5].t), quickPO(st[3].t, st[4].t), true);
  const prom = [st[0].t, st[1].t, po];
  const down = st.slice(-4).map(r => r.t);
  // League Two (team level): four go up
  const l2 = (G.lowerTeams || []).filter(t => T(t) && T(t).lite && !T(t).nat && !G.pl.includes(t) && !G.champTeams.includes(t) && !G.xl.LO.includes(t));
  const up = l2.map(t => [t, (T(t).str || 45) + R.i(0, 8)]).sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => x[0]);
  G._loPend = { down, up };
  G.lastL1 = st.slice(0, 6).map(r => [r.t, r.pts]);
  G.lastLO = { s: seasonLabel(G.year), champ: st[0].t, prom, down, up, po };
  news('League One', `${tName(st[0].t, false)} are League One champions and go up with ${tName(st[1].t, false)}. ${tName(po, false)} win the play-offs. Relegated to League Two: ${down.map(t => tName(t, false)).join(', ')}. Up from League Two: ${up.map(t => tName(t, false)).join(', ')}.`, null, true);
  if (prom.includes(G.user)) G._loUser = 'up';
  if (down.includes(G.user)) { G._loUser = 'down'; G.sacked = true; }
  return { prom, table: st };
};
// Championship clubs relegated to League One keep their squads
const _relLO = relegate;
relegate = function (tid) {
  if (loOn() && G.champTeams.includes(tid) && T(tid) && !T(tid).lite) {
    const t = T(tid); t.rep = clamp(Math.min(t.rep, 60), 45, 60);
    for (const p of squad(tid)) p.wage = Math.max(1, Math.round(p.wage * 0.7));
    if (!G.xl.LO.includes(tid)) G.xl.LO.push(tid);
    if (tid !== G.user) try { relegationExodus(tid, divTeams('CH')); } catch (e) { console.error(e); }
    return;
  }
  return _relLO(tid);
};
// League One clubs going up already have squads
const _proLO = promote;
promote = function (tid, div) {
  if (div === 'CH' && loOn() && G.xl.LO.includes(tid) && T(tid) && !T(tid).lite) {
    G.xl.LO = G.xl.LO.filter(x => x !== tid);
    const t = T(tid); t.rep = clamp(Math.max(t.rep, 56), 56, 66);
    for (const p of squad(tid)) p.wage = Math.round(p.wage * 1.35);
    return;
  }
  return _proLO(tid, div);
};
// a League Two side going up gets a League One squad
function promoteToLO(tid) {
  const t = T(tid); if (!t) return;
  _proLO(tid, 'CH');
  t.rep = clamp(Math.round((t.str || 45) + 2), 42, 54); t.bal = 3;
  for (const p of squad(tid)) if (p.gen) { p.ca = clamp(p.ca - 5, 45, 70); p.pa = Math.max(p.pa, p.ca); p.wage = wageFor(p, tid); p.val = calcValue(p); }
  if (!G.xl.LO.includes(tid)) G.xl.LO.push(tid);
  try { setBudgets(tid, true); autoPick(tid); ensureCaptains(tid); } catch (e) { console.error(e); }
}
// before next season's fixtures: League One loses four to League Two and gains four
function loApplyPending() {
  if (!loOn()) return;
  const P0 = G._loPend; delete G._loPend;
  if (P0) {
    for (const t of P0.down) { if (!G.xl.LO.includes(t)) continue; G.xl.LO = G.xl.LO.filter(x => x !== t); _relLO(t); }
    for (const t of P0.up) promoteToLO(t);
  }
  for (const t of G.xl.LO) { const tt = T(t); if (tt && tt.para) { /* parachute money only for clubs that left the Premier League */ } }
  G.lowerTeams = uniq(G.xl.LO.concat(G.lowerTeams || [])).filter(t => T(t) && !G.pl.includes(t) && !G.champTeams.includes(t));
  G.l1 = G.xl.LO.slice();
}
const _bsLO = buildSeason;
buildSeason = function () { try { loDedupe(); loApplyPending(); } catch (e) { console.error(e); } return _bsLO.apply(this, arguments); };
// the manager's own League One season: promotion bonus, or the sack after relegation to League Two
const _seLO = seasonEnd;
seasonEnd = function () {
  const r = _seLO.apply(this, arguments);
  try {
    const u = G._loUser; delete G._loUser;
    if (u) {
      const uname = (T(G.user) || {}).name || 'Your club';
      const v = u === 'up' ? `Promotion! ${uname} will play in the Championship next season.` : `${uname} have been relegated to League Two and the board has dismissed you.`;
      if (u === 'up') { G.board = clamp(G.board + 25, 0, 100); G.mgrRep = clamp(G.mgrRep + 5, 20, 99); }
      if (G.lastSeason) G.lastSeason.verdict = v;
      msg(u === 'up' ? 'Promoted to the Championship' : 'Relegated to League Two', v);
    }
  } catch (e) { console.error(e); }
  return r;
};

// ---------- older saves: add League One, the Eredivisie and the KNVB Cup ----------
function edloSwap(map) {
  const sw = (x) => map[x] || x;
  for (const f of Object.values(G.fx)) { f.h = sw(f.h); f.a = sw(f.a); }
  for (const c in G.euro || {}) { const E = G.euro[c]; E.teams = (E.teams || []).map(sw); if (E.final) E.final = E.final.map(sw); if (E.winner) E.winner = sw(E.winner); for (const r of E.ko || []) for (const t of r.ties) { t.t = t.t.map(sw); if (t.w) t.w = sw(t.w); } if (E.table) for (const row of E.table) if (row.t) row.t = sw(row.t); }
  for (const c in G.cups || {}) { for (const r of G.cups[c].rounds || []) for (const t of r.ties || []) { t.t = t.t.map(sw); if (t.w) t.w = sw(t.w); } if (G.cups[c].winner) G.cups[c].winner = sw(G.cups[c].winner); if (G.cups[c].byes) G.cups[c].byes = G.cups[c].byes.map(sw); }
  for (const k in G.euroIn || {}) G.euroIn[k] = G.euroIn[k].map(sw);
  G.lowerTeams = uniq((G.lowerTeams || []).map(sw)); if (G.l1) G.l1 = uniq(G.l1.map(sw));
  for (const id in map) delete G.teams[id];
}
function edloSetup(ids) {
  for (const id of ids) {
    for (const p of squad(id)) { p.wage = p.wage || wageFor(p, id) * R.i(85, 110) / 100; p.val = calcValue(p); }
    setBudgets(id, true); autoPick(id); ensureCaptains(id);
    const t = T(id); for (const q in TAC_DEF) if (t.tac[q] == null) t.tac[q] = TAC_DEF[q]; if (!t.tac.pr) t.tac.pr = [];
    if (typeof ensureYouth === 'function') try { ensureYouth(id); } catch (e) { console.error(e); }
  }
}
function edloAddClub(c, byName) {
  addFullTeam(c, c.lg);
  for (const l of c.sq.trim().split('\n')) {
    const [no, n] = l.split('|'); const old = byName[n]; if (!old) continue; const fresh = squad(c.id).find(p => p.n === n); if (!fresh) continue;
    G.sq[c.id] = G.sq[c.id].map(id => id === fresh.id ? old.id : id); delete G.players[fresh.id];
    old.c = c.id; old.no = +no; delete old.ab; delete old.gone; old.con = fresh.con; G.fa = (G.fa || []).filter(x => x !== old.id);
  }
}
function edloFillSeason(codes) {
  const saved = G.tasks.slice(); buildXL(codes); G.tasks = saved;
  for (const k of codes) for (const fid of [].concat(...G.xlL[k].rounds)) { const f = G.fx[fid]; if (f.d < G.date) quickFixture(f); }
  if (G.yl) for (const k of codes) { const teams = G.xl[k].slice(); for (const c of XL_Y[k]) G.yl[c] = { teams: R.shuffle(teams), rounds: roundRobin(teams.slice()), ri: 0, res: [], sc: {} }; }
}
function migrateEDLO() {
  if (!G || !G.teams || !G.xl || typeof EDLO_CLUBS === 'undefined') return;
  const from = _pid; const added = [];
  const byName = {}; for (const p of Object.values(G.players)) if (p && (p.c === 'ABROAD' || p.c === 'FA')) byName[p.n] = p;
  if (!G.xl.ED) {
    G.xl.ED = [];
    for (const c of EDLO_CLUBS.filter(c => c.lg === 'ED')) edloAddClub(c, byName);
    edloSetup(G.xl.ED);
    // Dutch clubs that were team-level European opponents are now the real clubs
    const map = {}; for (const id in G.teams) { const t = G.teams[id]; if (t && t.lite && (id.startsWith('E_') || id.startsWith('W_'))) { const x = xlId(t.name); if (x && G.xl.ED.includes(x)) map[id] = x; } }
    edloSwap(map);
    for (const p of Object.values(G.players)) { if (!p || p.c !== 'ABROAD' || p.scouted) continue; const id = xlId(p.gone || p.ab || ''); if (id && G.xl.ED.includes(id) && squad(id).length < 34) { G.sq[id].push(p.id); p.c = id; delete p.gone; delete p.ab; p.wage = Math.max(p.wage || 0, wageFor(p, id)); } }
    edloFillSeason(['ED']);
    added.push('the Eredivisie (18 clubs)');
  }
  if (G.xl.ED && G.xl.ED.length && G.cups && !G.cups.KNVB && typeof drawXLCup === 'function') {
    const saved = G.tasks.slice(); G.cups.KNVB = { id: 'KNVB', rounds: xlCupRounds('KNVB'), ri: 0, winner: null }; drawXLCup('KNVB'); G.tasks = saved;
    for (let k = 0; k < 6; k++) { const cup = G.cups.KNVB; const rd = cup.rounds[cup.ri]; if (!rd || !rd.ties.length || rd.done) break; let all = true; for (const t of rd.ties) for (const id of t.fx) { const f = G.fx[id]; if (!f.r) { if (f.d < G.date) quickFixture(f); else all = false; } } if (!all) break; checkCupProgress('KNVB'); }
  }
  if (!G.xl.LO) {
    G.xl.LO = [];
    const real = EDLO_CLUBS.filter(c => c.lg === 'LO');
    const map = {};
    if (G.year === BASE_YEAR) {
      // first season: the real 24 clubs; the team-level copies are replaced
      for (const c of real) edloAddClub(c, byName);
      for (const id of G.lowerTeams || []) { const t = T(id); if (t && t.lite && LO_ALIAS[t.name] && G.xl.LO.includes(LO_ALIAS[t.name])) map[id] = LO_ALIAS[t.name]; }
    } else {
      // later seasons: this save's League One line-up; known clubs get their real squads, the rest generated ones
      const members = (G.l1 && G.l1.length ? G.l1 : (G.lowerTeams || []).slice(0, 24)).filter(id => T(id));
      for (const id of members) {
        const t = T(id); const x = LO_ALIAS[t.name]; const c = x && real.find(r => r.id === x);
        if (c && !G.teams[c.id]) { edloAddClub(c, byName); map[id] = c.id; }
        else if (t.lite && !t.nat) promoteToLO(id);
        else if (!t.lite && !G.xl.LO.includes(id)) G.xl.LO.push(id);
      }
    }
    edloSwap(map);
    edloSetup(G.xl.LO);
    G.lowerTeams = uniq(G.xl.LO.concat(G.lowerTeams || [])).filter(t => T(t) && !G.pl.includes(t) && !G.champTeams.includes(t));
    G.l1 = G.xl.LO.slice(); G.loDone = 1;
    edloFillSeason(['LO']);
    added.push('League One (24 clubs, with promotion and relegation)');
  }
  if (G.intl && !G.intl.ned && typeof setupNetherlandsPool === 'function') try { setupNetherlandsPool(); } catch (e) { console.error(e); }
  if (!added.length) return;
  localiseXL(from);
  msg('New leagues', `Added to your save: ${added.join(' and ')}, with real first-team squads (FotMob, 12 November 2026). This season's results up to today were filled in at team level. Players earlier sold to these clubs have joined them. The Netherlands can now be managed too (International screen).`);
}
const _rsEDLO = restore;
restore = function (obj) { _rsEDLO(obj); try { migrateEDLO(); } catch (e) { console.error(e); } };
const _rnEDLO = render;
render = function () { if (G && G.teams && G.xl && (!G.xl.ED || !G.xl.LO)) { try { migrateEDLO(); } catch (e) { console.error(e); } } _rnEDLO(); };
