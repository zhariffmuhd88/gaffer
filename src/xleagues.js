// xleagues.js: Bundesliga (BL), Ligue 1 (L1) and Saudi Pro League (SPL), top flights only (no lower divisions,
// no relegation: the user asked for top flights only). Real squads in data_xl.js. Clubs play their real 2026/27
// European places (German and French), have youth leagues, awards and title announcements, and can be managed.
// Loaded after italy.js.

const XL = {
  BL: { n: 'Bundesliga', c: 'GER', start: '2026-08-28', end: '2027-05-22', winter: ['2026-12-21', '2027-01-08'], boot: 'Torjägerkanone' },
  L1: { n: 'Ligue 1', c: 'FRA', start: '2026-08-21', end: '2027-05-29', winter: ['2026-12-22', '2027-01-01'], boot: 'Ligue 1 top scorer' },
  SPL: { n: 'Saudi Pro League', c: 'KSA', start: '2026-08-27', end: '2027-05-27', winter: ['2026-12-28', '2027-01-08'], boot: 'Saudi Pro League top scorer' }
};
const XL_CODES = Object.keys(XL);
const XL_BREAKS = [['2026-09-21', '2026-10-06'], ['2026-11-09', '2026-11-17'], ['2027-03-22', '2027-03-30']];
Object.assign(COMP_NAME, { BL: 'Bundesliga', L1: 'Ligue 1', SPL: 'Saudi Pro League', BLR: 'Regionalliga (reserves)', BLA: 'U19 DFB-Nachwuchsliga', L1R: 'National 3 (reserves)', L1A: 'Championnat National U19', SPR: 'Saudi Elite League U21', SPA: 'Saudi U19 League' });
Object.assign(COMP_SHORT, { BL: 'BL', L1: 'L1', SPL: 'SPL' });
for (const k of XL_CODES) if (!LEAGUE_COMPS.includes(k)) LEAGUE_COMPS.push(k);
Object.assign(COMP_LINK, { Bundesliga: 'BL', 'Ligue 1': 'L1', 'Saudi Pro League': 'SPL' });
RIVALS.push(['BAY', 'BVB'], ['BVB', 'S04'], ['HSV', 'SVW'], ['KOE', 'BMG'], ['KOE', 'B04'], ['SGE', 'M05'], ['VFB', 'SCF'], ['RBL', 'BAY'], ['PSG', 'OM'], ['OL', 'ASM'], ['OL', 'OM'], ['RCL', 'LOSC'], ['OGCN', 'ASM'], ['SRFC', 'FCL'], ['SB29', 'SRFC'], ['PSG', 'PFC'],
  ['HIL', 'NAS'], ['AHL', 'ITT'], ['HIL', 'ITT'], ['NAS', 'ITT'], ['SHB', 'HIL'], ['ETT', 'QAD'], ['NAS', 'SHB']);
// European places in the game's 2026/27 draw (German and French clubs that were team-level sides until now)
const XL_LITE = { 'Paris SG': 'PSG', 'Bayern Munich': 'BAY', 'Bayer Leverkusen': 'B04', 'Borussia Dortmund': 'BVB', 'Marseille': 'OM', 'Monaco': 'ASM', 'RB Leipzig': 'RBL', 'VfB Stuttgart': 'VFB',
  'Eintracht Frankfurt': 'SGE', 'Lyon': 'OL', 'Lille': 'LOSC', 'Nice': 'OGCN', 'Lens': 'RCL', 'Freiburg': 'SCF', 'Hoffenheim': 'TSG', 'Strasbourg': 'RCSA', 'Rennes': 'SRFC', 'Mainz': 'M05', 'Augsburg': 'FCA',
  'Al-Hilal': 'HIL', 'Al-Ahli': 'AHL', 'Al-Nassr': 'NAS', 'Al-Ittihad': 'ITT', 'Al-Qadsiah': 'QAD', 'Al-Shabab': 'SHB', 'Paris FC': 'PFC', 'Bayern': 'BAY', 'Dortmund': 'BVB', 'Leverkusen': 'B04', 'Leipzig': 'RBL',
  'Stuttgart': 'VFB', 'Frankfurt': 'SGE', 'Paris Saint-Germain': 'PSG', 'PSG': 'PSG', 'Werder Bremen': 'SVW', "Borussia Mönchengladbach": 'BMG', 'Union Berlin': 'FCU', 'Hamburg': 'HSV', 'Hamburger SV': 'HSV', 'Schalke 04': 'S04', 'Köln': 'KOE', '1. FC Köln': 'KOE' };
const EURO_XL_START = { UCL: [], UEL: [], UECL: [] };
for (const k in EURO) { for (const [n] of EURO[k]) if (XL_LITE[n]) EURO_XL_START[k].push(XL_LITE[n]); EURO[k] = EURO[k].filter(([n]) => !XL_LITE[n]); }
function xlId(name) { return XL_LITE[name] || (typeof XL_CLUBS !== 'undefined' && (XL_CLUBS.find(c => c.name === name || c.short === name) || {}).id) || null; }

// ---------- names for generated players at German, French and Saudi clubs ----------
const XL_NAMES = {
  GER: [['Lukas', 'Leon', 'Finn', 'Jonas', 'Elias', 'Paul', 'Felix', 'Noah', 'Luca', 'Ben', 'Tim', 'Niklas', 'Moritz', 'Jan', 'Max', 'Tom', 'Julian', 'Erik', 'Nico', 'Jakob'], ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hartmann', 'Lange', 'Werner', 'Krause', 'Lehmann', 'Köhler']],
  FRA: [['Lucas', 'Hugo', 'Théo', 'Nathan', 'Enzo', 'Mathis', 'Louis', 'Noah', 'Tom', 'Rayan', 'Yanis', 'Adam', 'Maël', 'Ilyes', 'Kylian', 'Antoine', 'Jules', 'Bastien', 'Sacha', 'Mohamed'], ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'Fournier', 'Diallo', 'Traoré', 'Camara', 'Mendy', 'Bonnet', 'Girard', 'Fontaine', 'Rousseau']],
  KSA: [['Mohammed', 'Abdullah', 'Faisal', 'Saud', 'Khalid', 'Fahad', 'Sultan', 'Turki', 'Nawaf', 'Abdulrahman', 'Saleh', 'Ali', 'Omar', 'Yasser', 'Hamad', 'Majed', 'Rayan', 'Ziyad', 'Meshal', 'Bader'], ['Al Dawsari', 'Al Shehri', 'Al Ghamdi', 'Al Harbi', 'Al Otaibi', 'Al Qahtani', 'Al Zahrani', 'Al Mutairi', 'Al Anazi', 'Al Shammari', 'Al Malki', 'Al Amri', 'Hawsawi', 'Fallatah', 'Al Juhani', 'Al Subaie', 'Al Rashidi', 'Kanno', 'Al Asmari', 'Al Shahrani']]
};
function localiseXL(fromPid) {
  for (const p of Object.values(G.players)) {
    if (!p || !p.gen || p.xlN || (+p.id.slice(1)) <= fromPid) continue;
    const c = ctryOf(p.c); const N = XL_NAMES[c]; if (!N) continue;
    p.n = R.pick(N[0]) + ' ' + R.pick(N[1]); if (R.chance(c === 'KSA' ? .95 : .75)) p.nat = c; p.xlN = 1;
  }
}

// ---------- setup ----------
function addXL() {
  if (typeof XL_CLUBS === 'undefined') return;
  G.xl = {}; for (const k of XL_CODES) G.xl[k] = [];
  for (const c of XL_CLUBS) addFullTeam(c, c.lg);
}
const _asXL = addSpain;
addSpain = function () { _asXL(); try { addXL(); } catch (e) { console.error(e); } };
// calendar: Saturdays from the start to the end of the season, skipping the international windows and winter break
function xlDates(k) {
  const L = XL[k]; const n = 2 * (G.xl[k].length - 1); const skip = XL_BREAKS.concat([L.winter]);
  const ok = (d) => !skip.some(([a, b]) => d >= a && d <= b);
  const out = []; const d = dParse(L.start); const end = dParse(L.end);
  while (d <= end) { const s = dStr(d); if (ok(s)) out.push(s); d.setUTCDate(d.getUTCDate() + 7); }
  // too few weekends: add midweek rounds (Wednesdays) in the busiest stretch
  const mid = []; const m = dParse(L.start); m.setUTCDate(m.getUTCDate() + 25); while (dStr(m) < L.end) { const s = dStr(m); if (ok(s)) mid.push(s); m.setUTCDate(m.getUTCDate() + 7); }
  while (out.length < n && mid.length) out.push(mid.splice(Math.floor(mid.length / 2), 1)[0]);
  out.sort();
  while (out.length > n) out.splice(Math.floor(out.length / 2), 1);
  return out;
}
function buildXL() {
  if (!G.xl) return;
  G.xlL = {}; G.normX = G.normX || {}; G.normX0 = G.normX0 || {};
  for (const k of XL_CODES) {
    const teams = G.xl[k]; if (!teams || teams.length < 2) continue;
    const gl = leagueNorm(teams); if (G.normX0[k] == null) G.normX0[k] = gl;
    G.normX[k] = (k === 'BL' ? 0.92 : k === 'L1' ? 0.8 : 0.86) * clamp(Math.exp(-(gl - G.normX0[k]) * .035), .8, 1.2);
    const ds = xlDates(k);
    const r = roundRobin(R.shuffle(teams)); const h1 = R.shuffle(r), h2 = R.shuffle(r.map(x => x.map(([a, b]) => [b, a])));
    G.xlL[k] = { rounds: h1.concat(h2).map((pairs, ri) => pairs.map(([h, a]) => addFx({ comp: k, d: sd(ds[ri] || ds[ds.length - 1]), h, a, rnd: ri + 1 }).id)) };
  }
}
const _bsXL = buildSeason;
buildSeason = function () { _bsXL(); try { buildXL(); } catch (e) { console.error(e); } };
function xlTable(k) {
  const teams = (G.xl && G.xl[k]) || [];
  if (!G.xlL || !G.xlL[k]) return teams.map(t => ({ t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }));
  return divTable(teams, G.xlL[k].rounds, G.ded);
}
const _toXL = tableOf;
tableOf = function (div) { return XL[div] ? xlTable(div) : _toXL(div); };

// ---------- season end: European places, champions (no relegation) ----------
function xlSeasonEnd() {
  if (!G.xl) return;
  for (const k of XL_CODES) {
    const st = xlTable(k); if (!st.length || !st[0].p) continue;
    const champ = st[0].t; honour(champ, XL[k].n);
    st.forEach((r, i) => prize(r.t, (st.length - i) * (k === 'SPL' ? 1.4 : 1.6) + 4));
    for (const r of st) { const tt = T(r.t); const i = st.indexOf(r); tt.rep = clamp(Math.round(tt.rep * .88 + (100 - (i + 1) * 2.2) * .12), 58, 96); }
    G.lastSeasonXL = G.lastSeasonXL || {}; G.lastSeasonXL[k] = { s: seasonLabel(G.year), champ, lt: st.map(r => [r.t, r.pts]) };
    news(XL[k].n, `${tName(champ, false)} are ${XL[k].n} champions ${seasonLabel(G.year)} with ${st[0].pts} points.`, champ, champ === G.user);
  }
}
const _seXL = seasonEnd;
seasonEnd = function () { const from = _pid; try { xlSeasonEnd(); } catch (e) { console.error(e); } const r = _seXL.apply(this, arguments); try { localiseXL(from); } catch (e) { console.error(e); } return r; };
// European places: added after transfers.js resets G.euroIn (it calls spainSeasonEnd right after)
const _euXL = typeof spainSeasonEnd === 'function' ? spainSeasonEnd : null;
if (_euXL) spainSeasonEnd = function (lt) { _euXL(lt); try { if (G.lastSeasonXL) for (const k of ['BL', 'L1']) { const L = G.lastSeasonXL[k]; if (!L || L.s !== seasonLabel(G.year)) continue; const o = L.lt.map(x => x[0]); for (const [c, l] of [['UCL', o.slice(0, 4)], ['UEL', [o[4]]], ['UECL', [o[5]]]]) G.euroIn[c] = (G.euroIn[c] || []).concat(l.filter(t => t && !G.euroIn[c].includes(t))); } } catch (e) { console.error(e); } };
const _ngXL = newGame;
newGame = function (u, n) { const r = _ngXL(u, n); try { localiseXL(0); if (G.intl && !G.intl.job && typeof setPlayNat === 'function' && PLAYABLE_NATS.includes(ctryOf(G.user))) setPlayNat(ctryOf(G.user)); } catch (e) { console.error(e); } return r; };

// ---------- youth leagues ----------
const XL_Y = { BL: ['BLR', 'BLA'], L1: ['L1R', 'L1A'], SPL: ['SPR', 'SPA'] };
Object.assign(YOUTH_COMPS, { BLR: 'Regionalliga (reserves)', BLA: 'U19 DFB-Nachwuchsliga', L1R: 'National 3 (reserves)', L1A: 'Championnat National U19', SPR: 'Saudi Elite League U21', SPA: 'Saudi U19 League' });
const _ylXL = yLeagueTeams; yLeagueTeams = function (c) { for (const k in XL_Y) if (XL_Y[k].includes(c)) return ((G.xl && G.xl[k]) || []).slice(); return _ylXL(c); };
const _yvXL = yLevelOf; yLevelOf = function (c) { for (const k in XL_Y) if (XL_Y[k].includes(c)) return c === XL_Y[k][0] ? 'r' : 'a'; return _yvXL(c); };
const _ycXL = yCompOf; yCompOf = function (tid, lvl) { const d = divOf(tid); if (XL_Y[d]) return lvl === 'r' ? XL_Y[d][0] : XL_Y[d][1]; return _ycXL(tid, lvl); };

// ---------- abroad: clubs that are now in the game ----------
const _saXL = sellAbroad;
sellAbroad = function (p, fee, club) { const id = xlId(club); if (id && T(id) && !T(id).lite && squad(id).length < 32) { completeTransfer(p, id, fee, wageFor(p, id), R.i(2, 4)); T(id).tb = Math.max(0, (T(id).tb || 0) - fee); return; } return _saXL(p, fee, club); };
const _lbXL = typeof liteByName === 'function' ? liteByName : null;
if (_lbXL) liteByName = function (n, s) { const id = xlId(n); if (id && T(id)) return id; return _lbXL(n, s); };

// ---------- screens: league tables ----------
const _stXL = scrTable;
scrTable = function () {
  if (!G.xl) return _stXL();
  const ud = userDiv(); if (!UI.tab.tb && XL[ud]) UI.tab.tb = 'x' + ud;
  const tab = UI.tab.tb || '';
  const btns = (on) => XL_CODES.map(k => `<button class="${on === 'x' + k ? 'on' : ''}" data-a="tab" data-k="tb" data-v="x${k}">${XL[k].n.replace('Saudi Pro League', 'Saudi PL')}</button>`).join('');
  const SB = 'data-v="sb">Serie B</button>';
  if (!tab.startsWith('x')) { const h = _stXL(); return h.includes(SB) ? h.replace(SB, SB + btns(null)) : h; }
  const k = tab.slice(1);
  UI.tab.tb = 'sa'; const h0 = _stXL(); UI.tab.tb = tab;
  const i0 = h0.indexOf('<div class="tabs"'); const i1 = h0.indexOf('</div>', i0);
  const tabs = h0.slice(i0, i1).replace(/ class="on"/g, ' class=""').replace(SB, SB + btns(tab)) + '</div>';
  const st = xlTable(k);
  const zone = k === 'SPL' ? (i => i === 0 ? 'zone-ucl' : '') : (i => i < 4 ? 'zone-ucl' : i < 5 ? 'zone-uel' : i < 6 ? 'zone-uecl' : '');
  const note = k === 'SPL' ? 'Saudi Pro League champions are crowned here; Asian competitions are not part of the game.' : `<span class="cyan">▌</span> Champions League · <span class="amb">▌</span> Europa League · <span class="grn">▌</span> Conference League.`;
  return `<div class="band">League tables<small>${XL[k].n} ${seasonLabel(G.year)}</small></div>${tabs}${tableHtml(st, zone, { form: true })}<p class="dim" style="margin-top:6px">${note} Top flight only in this game: there is no relegation from the ${XL[k].n}.</p>`;
};
const _gocXL = goComp;
goComp = function (code) { if (XL[code]) { UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'table'; UI.tab.tb = 'x' + code; render(); window.scrollTo(0, 0); return; } _gocXL(code); };

// ---------- older saves: add the three leagues ----------
function migrateXL() {
  if (!G || !G.teams || G.xl || typeof XL_CLUBS === 'undefined') return;
  const from = _pid;
  const byName = {}; for (const p of Object.values(G.players)) if (p && (p.c === 'ABROAD' || p.c === 'FA')) byName[p.n] = p;
  G.xl = {}; for (const k of XL_CODES) G.xl[k] = [];
  for (const c of XL_CLUBS) {
    const keep = c.sq.trim().split('\n').filter(l => byName[l.split('|')[1]]);
    addFullTeam(c, c.lg);
    for (const l of keep) {
      const [no, n] = l.split('|'); const old = byName[n]; const fresh = squad(c.id).find(p => p.n === n);
      if (!old || !fresh) continue;
      G.sq[c.id] = G.sq[c.id].map(id => id === fresh.id ? old.id : id); delete G.players[fresh.id];
      old.c = c.id; old.no = +no; delete old.ab; delete old.gone; old.con = fresh.con; G.fa = (G.fa || []).filter(x => x !== old.id);
    }
  }
  // players sold abroad earlier in this save to clubs that are now in the game join those clubs
  for (const p of Object.values(G.players)) { if (!p || p.c !== 'ABROAD' || p.scouted) continue; const id = xlId(p.gone || p.ab || ''); if (id && T(id) && squad(id).length < 34) { G.sq[id].push(p.id); p.c = id; delete p.gone; delete p.ab; p.wage = Math.max(p.wage || 0, wageFor(p, id)); } }
  for (const k of XL_CODES) for (const id of G.xl[k]) { for (const p of squad(id)) { p.wage = p.wage || wageFor(p, id) * R.i(85, 110) / 100; p.val = calcValue(p); } setBudgets(id, true); autoPick(id); ensureCaptains(id); const t = T(id); for (const q in TAC_DEF) if (t.tac[q] == null) t.tac[q] = TAC_DEF[q]; if (!t.tac.pr) t.tac.pr = []; }
  // European lite sides that are now real clubs
  const map = {}; for (const id in G.teams) { const t = G.teams[id]; if (t && t.lite && (id.startsWith('E_') || id.startsWith('W_'))) { const x = xlId(t.name); if (x) map[id] = x; } }
  const sw = (x) => map[x] || x;
  for (const f of Object.values(G.fx)) { f.h = sw(f.h); f.a = sw(f.a); }
  for (const c in G.euro || {}) { const E = G.euro[c]; E.teams = E.teams.map(sw); if (E.final) E.final = E.final.map(sw); if (E.winner) E.winner = sw(E.winner); for (const r of E.ko || []) for (const t of r.ties) { t.t = t.t.map(sw); if (t.w) t.w = sw(t.w); } }
  for (const c in G.cups || {}) for (const r of G.cups[c].rounds || []) for (const t of r.ties || []) { t.t = t.t.map(sw); if (t.w) t.w = sw(t.w); }
  for (const c in G.cups || {}) if (G.cups[c].winner) G.cups[c].winner = sw(G.cups[c].winner);
  for (const k in G.euroIn || {}) G.euroIn[k] = G.euroIn[k].map(sw);
  for (const id in map) delete G.teams[id];
  // this season: fixtures from the start; rounds before today are filled in at team level
  const savedTasks = G.tasks.slice(); buildXL(); G.tasks = savedTasks;
  for (const k of XL_CODES) for (const fid of [].concat(...G.xlL[k].rounds)) { const f = G.fx[fid]; if (f.d < G.date) quickFixture(f); }
  if (typeof ensureYouth === 'function') for (const k of XL_CODES) for (const id of G.xl[k]) try { ensureYouth(id); } catch (e) { console.error(e); }
  if (G.yl) for (const k in XL_Y) { const teams = G.xl[k].slice(); for (const c of XL_Y[k]) G.yl[c] = { teams: R.shuffle(teams), rounds: roundRobin(teams.slice()), ri: 0, res: [], sc: {} }; }
  localiseXL(from);
  msg('New leagues', 'The Bundesliga, Ligue 1 and the Saudi Pro League have been added with real first-team squads (FotMob, 6 November 2026). This season\'s tables up to today were filled in with simulated results; German and French clubs in Europe now have full squads, and players earlier sold to these clubs have joined them. You can scout and sign their players and take jobs there. Top flights only: there is no relegation in these leagues.');
}
const _rsXL = restore;
restore = function (obj) { _rsXL(obj); try { migrateXL(); } catch (e) { console.error(e); } };
const _rnXL = render;
render = function () { if (G && G.teams && G.sa && !G.xl) { try { migrateXL(); } catch (e) { console.error(e); } } _rnXL(); };
