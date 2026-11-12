// xleagues.js: Bundesliga (BL), Ligue 1 (L1) and Saudi Pro League (SPL), top flights only (no lower divisions,
// no relegation: the user asked for top flights only). Real squads in data_xl.js. Clubs play their real 2026/27
// European places (German and French), have youth leagues, awards and title announcements, and can be managed.
// Loaded after italy.js.

const XL = {
  BL: { n: 'Bundesliga', c: 'GER', start: '2026-08-28', end: '2027-05-22', winter: ['2026-12-21', '2027-01-08'], boot: 'Torjägerkanone' },
  L1: { n: 'Ligue 1', c: 'FRA', start: '2026-08-21', end: '2027-05-29', winter: ['2026-12-22', '2027-01-01'], boot: 'Ligue 1 top scorer' },
  SPL: { n: 'Saudi Pro League', c: 'KSA', start: '2026-08-27', end: '2027-05-27', winter: ['2026-12-28', '2027-01-08'], boot: 'Saudi Pro League top scorer' },
  ED: { n: 'Eredivisie', c: 'NED', start: '2026-08-08', end: '2027-05-16', winter: ['2026-12-21', '2027-01-08'], boot: 'Eredivisie top scorer' },
  // League One plays on the Championship's dates (46 rounds); promotion to and relegation from the Championship, four down to League Two
  LO: { n: 'League One', c: 'ENG', eng: 1, boot: 'League One Golden Boot' }
};
const XL_CODES = Object.keys(XL);
const XL_BREAKS = [['2026-09-21', '2026-10-06'], ['2026-11-09', '2026-11-17'], ['2027-03-22', '2027-03-30']];
Object.assign(COMP_NAME, { BL: 'Bundesliga', L1: 'Ligue 1', SPL: 'Saudi Pro League', BLR: 'Regionalliga (reserves)', BLA: 'U19 DFB-Nachwuchsliga', L1R: 'National 3 (reserves)', L1A: 'Championnat National U19', SPR: 'Saudi Elite League U21', SPA: 'Saudi U19 League', ED: 'Eredivisie', LO: 'League One', EDJ: 'Beloften (reserves)', EDU: 'O19 Divisie', LOP: 'PDL North/South (reserves)', LOU: 'EFL Youth Alliance' });
Object.assign(COMP_SHORT, { BL: 'BL', L1: 'L1', SPL: 'SPL', ED: 'ERE', LO: 'LG1' });
for (const k of XL_CODES) if (!LEAGUE_COMPS.includes(k)) LEAGUE_COMPS.push(k);
Object.assign(COMP_LINK, { Bundesliga: 'BL', 'Ligue 1': 'L1', 'Saudi Pro League': 'SPL', Eredivisie: 'ED', 'League One': 'LO' });
RIVALS.push(['BAY', 'BVB'], ['BVB', 'S04'], ['HSV', 'SVW'], ['KOE', 'BMG'], ['KOE', 'B04'], ['SGE', 'M05'], ['VFB', 'SCF'], ['RBL', 'BAY'], ['PSG', 'OM'], ['OL', 'ASM'], ['OL', 'OM'], ['RCL', 'LOSC'], ['OGCN', 'ASM'], ['SRFC', 'FCL'], ['SB29', 'SRFC'], ['PSG', 'PFC'],
  ['HIL', 'NAS'], ['AHL', 'ITT'], ['HIL', 'ITT'], ['NAS', 'ITT'], ['SHB', 'HIL'], ['ETT', 'QAD'], ['NAS', 'SHB'],
  ['AJX', 'FEY'], ['AJX', 'PSV'], ['PSV', 'FEY'], ['FEY', 'SPAR'], ['FEY', 'EXC'], ['SPAR', 'EXC'], ['GRO', 'HEE'], ['HEE', 'CMB'], ['AJX', 'UTR'], ['TWE', 'GAE'], ['ADO', 'SPAR'], ['WIL', 'PSV'],
  ['SHW', 'BNS'], ['BRA', 'HUD'], ['OXF', 'WYC'], ['LUT', 'MKD'], ['STO', 'WIG'], ['WIM', 'BRO'], ['PET', 'CAMU'], ['MAN', 'NCO'], ['DON', 'BNS'], ['BLP', 'WIG'], ['LEI', 'NCO']);
// European places in the game's 2026/27 draw (German and French clubs that were team-level sides until now)
const XL_LITE = { 'Paris SG': 'PSG', 'Bayern Munich': 'BAY', 'Bayer Leverkusen': 'B04', 'Borussia Dortmund': 'BVB', 'Marseille': 'OM', 'Monaco': 'ASM', 'RB Leipzig': 'RBL', 'VfB Stuttgart': 'VFB',
  'Eintracht Frankfurt': 'SGE', 'Lyon': 'OL', 'Lille': 'LOSC', 'Nice': 'OGCN', 'Lens': 'RCL', 'Freiburg': 'SCF', 'Hoffenheim': 'TSG', 'Strasbourg': 'RCSA', 'Rennes': 'SRFC', 'Mainz': 'M05', 'Augsburg': 'FCA',
  'Al-Hilal': 'HIL', 'Al-Ahli': 'AHL', 'Al-Nassr': 'NAS', 'Al-Ittihad': 'ITT', 'Al-Qadsiah': 'QAD', 'Al-Shabab': 'SHB', 'Paris FC': 'PFC', 'Bayern': 'BAY', 'Dortmund': 'BVB', 'Leverkusen': 'B04', 'Leipzig': 'RBL',
  'Stuttgart': 'VFB', 'Frankfurt': 'SGE', 'Paris Saint-Germain': 'PSG', 'PSG': 'PSG', 'Werder Bremen': 'SVW', "Borussia Mönchengladbach": 'BMG', 'Union Berlin': 'FCU', 'Hamburg': 'HSV', 'Hamburger SV': 'HSV', 'Schalke 04': 'S04', 'Köln': 'KOE', '1. FC Köln': 'KOE',
  PSV: 'PSV', 'PSV Eindhoven': 'PSV', Ajax: 'AJX', Feyenoord: 'FEY', 'AZ Alkmaar': 'AZ', AZ: 'AZ', Twente: 'TWE', 'FC Twente': 'TWE', Utrecht: 'UTR', 'FC Utrecht': 'UTR' };
const EURO_XL_START = { UCL: [], UEL: [], UECL: [] };
for (const k in EURO) { for (const [n] of EURO[k]) if (XL_LITE[n]) EURO_XL_START[k].push(XL_LITE[n]); EURO[k] = EURO[k].filter(([n]) => !XL_LITE[n]); }
function xlId(name) { return XL_LITE[name] || (typeof XL_CLUBS !== 'undefined' && (XL_CLUBS.find(c => c.name === name || c.short === name) || {}).id) || null; }

// ---------- names for generated players at German, French and Saudi clubs ----------
const XL_NAMES = {
  GER: [['Lukas', 'Leon', 'Finn', 'Jonas', 'Elias', 'Paul', 'Felix', 'Noah', 'Luca', 'Ben', 'Tim', 'Niklas', 'Moritz', 'Jan', 'Max', 'Tom', 'Julian', 'Erik', 'Nico', 'Jakob'], ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hartmann', 'Lange', 'Werner', 'Krause', 'Lehmann', 'Köhler']],
  FRA: [['Lucas', 'Hugo', 'Théo', 'Nathan', 'Enzo', 'Mathis', 'Louis', 'Noah', 'Tom', 'Rayan', 'Yanis', 'Adam', 'Maël', 'Ilyes', 'Kylian', 'Antoine', 'Jules', 'Bastien', 'Sacha', 'Mohamed'], ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'Fournier', 'Diallo', 'Traoré', 'Camara', 'Mendy', 'Bonnet', 'Girard', 'Fontaine', 'Rousseau']],
  KSA: [['Mohammed', 'Abdullah', 'Faisal', 'Saud', 'Khalid', 'Fahad', 'Sultan', 'Turki', 'Nawaf', 'Abdulrahman', 'Saleh', 'Ali', 'Omar', 'Yasser', 'Hamad', 'Majed', 'Rayan', 'Ziyad', 'Meshal', 'Bader'], ['Al Dawsari', 'Al Shehri', 'Al Ghamdi', 'Al Harbi', 'Al Otaibi', 'Al Qahtani', 'Al Zahrani', 'Al Mutairi', 'Al Anazi', 'Al Shammari', 'Al Malki', 'Al Amri', 'Hawsawi', 'Fallatah', 'Al Juhani', 'Al Subaie', 'Al Rashidi', 'Kanno', 'Al Asmari', 'Al Shahrani']],
  NED: [['Daan', 'Sem', 'Luuk', 'Milan', 'Levi', 'Thijs', 'Jesse', 'Bram', 'Lars', 'Ruben', 'Stijn', 'Tim', 'Jens', 'Sven', 'Noah', 'Finn', 'Mats', 'Thomas', 'Joey', 'Kevin'], ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Smits', 'de Graaf', 'van der Meer', 'Kok', 'Jacobs', 'Vermeulen', 'van Beek']]
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
function buildXL(only) {
  if (!G.xl) return;
  if (!only) G.xlL = {}; G.xlL = G.xlL || {}; G.normX = G.normX || {}; G.normX0 = G.normX0 || {};
  for (const k of only || XL_CODES) {
    const teams = G.xl[k]; if (!teams || teams.length < 2) continue;
    const gl = leagueNorm(teams); if (G.normX0[k] == null) G.normX0[k] = gl;
    G.normX[k] = ({ BL: 0.92, L1: 0.8, ED: 0.97, LO: 0.82 }[k] || 0.86) * clamp(Math.exp(-(gl - G.normX0[k]) * .035), .8, 1.2);
    const ds = XL[k].eng ? CAL.ch.slice(0, 2 * (teams.length - 1)) : xlDates(k);
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
    if (XL[k].eng) { st.forEach((r, i) => prize(r.t, (st.length - i) * .12 + .5)); for (const r of st) { const tt = T(r.t); const i = st.indexOf(r); tt.rep = clamp(Math.round(tt.rep * .85 + (62 - i * .6) * .15), 42, 62); } }
    else {
    st.forEach((r, i) => prize(r.t, (st.length - i) * (k === 'SPL' ? 1.4 : k === 'ED' ? 0.9 : 1.6) + 4));
    for (const r of st) { const tt = T(r.t); const i = st.indexOf(r); tt.rep = clamp(Math.round(tt.rep * .88 + (100 - (i + 1) * 2.2) * .12), k === 'ED' ? 55 : 58, k === 'ED' ? 88 : 96); }
    }
    G.lastSeasonXL = G.lastSeasonXL || {}; G.lastSeasonXL[k] = { s: seasonLabel(G.year), champ, lt: st.map(r => [r.t, r.pts]) };
    news(XL[k].n, `${tName(champ, false)} are ${XL[k].n} champions ${seasonLabel(G.year)} with ${st[0].pts} points.`, champ, champ === G.user);
  }
}
const _seXL = seasonEnd;
seasonEnd = function () { const from = _pid; try { xlSeasonEnd(); } catch (e) { console.error(e); } const r = _seXL.apply(this, arguments); try { localiseXL(from); } catch (e) { console.error(e); } return r; };
// European places: added after transfers.js resets G.euroIn (it calls spainSeasonEnd right after)
const _euXL = typeof spainSeasonEnd === 'function' ? spainSeasonEnd : null;
if (_euXL) spainSeasonEnd = function (lt) { _euXL(lt); try { if (G.lastSeasonXL) for (const k of ['BL', 'L1', 'ED']) { const L = G.lastSeasonXL[k]; if (!L || L.s !== seasonLabel(G.year)) continue; const o = L.lt.map(x => x[0]); for (const [c, l] of k === 'ED' ? [['UCL', o.slice(0, 2)], ['UEL', [o[2]]], ['UECL', [o[3]]]] : [['UCL', o.slice(0, 4)], ['UEL', [o[4]]], ['UECL', [o[5]]]]) G.euroIn[c] = (G.euroIn[c] || []).concat(l.filter(t => t && !G.euroIn[c].includes(t))); } } catch (e) { console.error(e); } };
const _ngXL = newGame;
newGame = function (u, n) { const r = _ngXL(u, n); try { localiseXL(0); if (G.intl && !G.intl.job && typeof setPlayNat === 'function' && PLAYABLE_NATS.includes(ctryOf(G.user))) setPlayNat(ctryOf(G.user)); } catch (e) { console.error(e); } return r; };

// ---------- youth leagues ----------
const XL_Y = { BL: ['BLR', 'BLA'], L1: ['L1R', 'L1A'], SPL: ['SPR', 'SPA'], ED: ['EDJ', 'EDU'], LO: ['LOP', 'LOU'] };
Object.assign(YOUTH_COMPS, { BLR: 'Regionalliga (reserves)', BLA: 'U19 DFB-Nachwuchsliga', L1R: 'National 3 (reserves)', L1A: 'Championnat National U19', SPR: 'Saudi Elite League U21', SPA: 'Saudi U19 League', EDJ: 'Beloften (reserves)', EDU: 'O19 Divisie', LOP: 'PDL North/South (reserves)', LOU: 'EFL Youth Alliance' });
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
  const btns = (on) => XL_CODES.filter(k => G.xl[k] && G.xl[k].length).map(k => `<button class="${on === 'x' + k ? 'on' : ''}" data-a="tab" data-k="tb" data-v="x${k}">${XL[k].n.replace('Saudi Pro League', 'Saudi PL')}</button>`).join('');
  const SB = 'data-v="sb">Serie B</button>';
  if (!tab.startsWith('x')) { const h = _stXL(); return h.includes(SB) ? h.replace(SB, SB + btns(null)) : h; }
  const k = tab.slice(1);
  UI.tab.tb = 'sa'; const h0 = _stXL(); UI.tab.tb = tab;
  const i0 = h0.indexOf('<div class="tabs"'); const i1 = h0.indexOf('</div>', i0);
  const tabs = h0.slice(i0, i1).replace(/ class="on"/g, ' class=""').replace(SB, SB + btns(tab)) + '</div>';
  const st = xlTable(k);
  const zone = k === 'SPL' ? (i => i === 0 ? 'zone-ucl' : '') : k === 'LO' ? (i => i < 2 ? 'zone-ucl' : i < 6 ? 'zone-uel' : i >= st.length - 4 ? 'zone-rel' : '') : k === 'ED' ? (i => i < 2 ? 'zone-ucl' : i < 3 ? 'zone-uel' : i < 4 ? 'zone-uecl' : '') : (i => i < 4 ? 'zone-ucl' : i < 5 ? 'zone-uel' : i < 6 ? 'zone-uecl' : '');
  const note = k === 'SPL' ? 'Saudi Pro League champions are crowned here; Asian competitions are not part of the game.' : k === 'LO' ? '<span class="cyan">▌</span> Promotion to the Championship · <span class="amb">▌</span> Play-offs (3rd v 6th, 4th v 5th, final at Wembley; simulated) · <span class="red">▌</span> Relegation to League Two (team level).' : `<span class="cyan">▌</span> Champions League · <span class="amb">▌</span> Europa League · <span class="grn">▌</span> Conference League.`;
  const tail = k === 'LO' ? '' : ` Top flight only in this game: there is no relegation from the ${XL[k].n}.`;
  return `<div class="band">League tables<small>${XL[k].n} ${seasonLabel(G.year)}</small></div>${tabs}${tableHtml(st, zone, { form: true })}<p class="dim" style="margin-top:6px">${note}${tail}</p>`;
};
const _gocXL = goComp;
goComp = function (code) { if (XL[code]) { UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'table'; UI.tab.tb = 'x' + code; render(); window.scrollTo(0, 0); return; } _gocXL(code); };

// ---------- older saves: add the three leagues ----------
function migrateXL() {
  if (!G || !G.teams || G.xl || typeof XL_CLUBS === 'undefined') return;
  const from = _pid;
  const byName = {}; for (const p of Object.values(G.players)) if (p && (p.c === 'ABROAD' || p.c === 'FA')) byName[p.n] = p;
  const XL3 = ['BL', 'L1', 'SPL']; // League One and the Eredivisie are added by migrateEDLO (leagueone.js)
  G.xl = {}; for (const k of XL3) G.xl[k] = [];
  for (const c of XL_CLUBS.filter(c => XL3.includes(c.lg))) {
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
  for (const k in G.xl) for (const id of G.xl[k]) { for (const p of squad(id)) { p.wage = p.wage || wageFor(p, id) * R.i(85, 110) / 100; p.val = calcValue(p); } setBudgets(id, true); autoPick(id); ensureCaptains(id); const t = T(id); for (const q in TAC_DEF) if (t.tac[q] == null) t.tac[q] = TAC_DEF[q]; if (!t.tac.pr) t.tac.pr = []; }
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
  for (const k in G.xl) if (G.xlL[k]) for (const fid of [].concat(...G.xlL[k].rounds)) { const f = G.fx[fid]; if (f.d < G.date) quickFixture(f); }
  if (typeof ensureYouth === 'function') for (const k in G.xl) for (const id of G.xl[k]) try { ensureYouth(id); } catch (e) { console.error(e); }
  if (G.yl) for (const k in XL_Y) { if (!G.xl[k]) continue; const teams = G.xl[k].slice(); for (const c of XL_Y[k]) G.yl[c] = { teams: R.shuffle(teams), rounds: roundRobin(teams.slice()), ri: 0, res: [], sc: {} }; }
  localiseXL(from);
  msg('New leagues', 'The Bundesliga, Ligue 1 and the Saudi Pro League have been added with real first-team squads (FotMob, 6 November 2026). This season\'s tables up to today were filled in with simulated results; German and French clubs in Europe now have full squads, and players earlier sold to these clubs have joined them. You can scout and sign their players and take jobs there. Top flights only: there is no relegation in these leagues.');
}
const _rsXL = restore;
restore = function (obj) { _rsXL(obj); try { migrateXL(); } catch (e) { console.error(e); } };
const _rnXL = render;
render = function () { if (G && G.teams && G.sa && !G.xl) { try { migrateXL(); } catch (e) { console.error(e); } } _rnXL(); };

// ---------- domestic cups: DFB-Pokal (DFB) and Coupe de France (CDF) ----------
// Only the 18 top-flight clubs are in the game, so each cup is an 18-team knockout: the four lowest-placed clubs
// of last season (or the weakest on paper) play a first round, the other 14 join in the round of 16. Single games,
// neutral final (Berlin / Saint-Denis). The winners and runners-up can qualify for the Cup Winners' Cup.
const XL_CUPS = {
  DFB: { lg: 'BL', n: 'DFB-Pokal', ven: ['Olympiastadion, Berlin', 74475], rounds: [['First round', ['2026-08-19']], ['Round of 16', ['2026-10-28']], ['Quarter-final', ['2027-02-03']], ['Semi-final', ['2027-04-21']], ['Final', ['2027-05-29'], 1]] },
  KNVB: { lg: 'ED', n: 'KNVB Cup', ven: ['De Kuip, Rotterdam', 47500], rounds: [['First round', ['2026-10-28']], ['Round of 16', ['2026-12-16']], ['Quarter-final', ['2027-02-03']], ['Semi-final', ['2027-03-03']], ['Final', ['2027-04-18'], 1]] },
  CDF: { lg: 'L1', n: 'Coupe de France', ven: ['Stade de France, Saint-Denis', 80698], rounds: [['First round', ['2026-08-19']], ['Round of 16', ['2026-12-16']], ['Quarter-final', ['2027-02-10']], ['Semi-final', ['2027-04-14']], ['Final', ['2027-05-22'], 1]] }
};
Object.assign(COMP_NAME, { DFB: 'DFB-Pokal', CDF: 'Coupe de France', KNVB: 'KNVB Cup' });
Object.assign(COMP_SHORT, { DFB: 'DFB', CDF: 'CdF', KNVB: 'KNVB' });
Object.assign(COMP_LINK, { 'DFB-Pokal': 'DFB', 'Coupe de France': 'CDF', 'KNVB Cup': 'KNVB' });
if (typeof TRO_W !== 'undefined') Object.assign(TRO_W, { 'DFB-Pokal': 6, 'Coupe de France': 5, 'KNVB Cup': 4, Bundesliga: 18, 'Ligue 1': 15, 'Saudi Pro League': 10, Eredivisie: 11, 'League One': 3 });
function xlCupRounds(c) { return XL_CUPS[c].rounds.map(([n, ds, neu]) => ({ n, d: ds.map(sd), neutral: !!neu, ties: [], done: false })); }
function drawXLCup(c) {
  const X = XL_CUPS[c]; const teams = (G.xl && G.xl[X.lg]) || []; if (teams.length < 4) return;
  const L = G.lastSeasonXL && G.lastSeasonXL[X.lg];
  const order = L && L.lt && L.lt.every(x => teams.includes(x[0])) ? L.lt.map(x => x[0]) : teams.slice().sort((a, b) => teamStrength(b) - teamStrength(a));
  const n1 = Math.max(0, 2 * (teams.length - 16)); const low = R.shuffle(order.slice(order.length - n1));
  const cup = G.cups[c]; cup.byes = order.slice(0, order.length - n1);
  const pairs = []; for (let i = 0; i + 1 < low.length; i += 2) pairs.push([low[i], low[i + 1]]);
  drawFixed(c, 0, pairs);
}
function buildXLCups() {
  if (!G.xl || !G.cups) return;
  for (const c in XL_CUPS) { if (!(G.xl[XL_CUPS[c].lg] || []).length) continue; G.cups[c] = { id: c, rounds: xlCupRounds(c), ri: 0, winner: null }; drawXLCup(c); }
}
const _bsXC = buildSeason;
buildSeason = function () { _bsXC(); try { buildXLCups(); } catch (e) { console.error(e); } };
for (const c in XL_CUPS) CUP_NEXT[c] = (winners) => {
  const cup = G.cups[c]; const ri = cup.ri + 1; const nr = cup.rounds[ri];
  for (const t of cup.rounds[ri - 1].ties) if (T(t.w) && !T(t.w).lite) prize(t.w, 0.2 * ri);
  const l = R.shuffle(ri === 1 ? winners.concat(cup.byes || []) : winners); const pairs = [];
  for (let i = 0; i + 1 < l.length; i += 2) pairs.push([l[i], l[i + 1]]);
  drawFixed(c, ri, pairs);
  if (nr.neutral) for (const t of nr.ties) for (const id of t.fx) { G.fx[id].ven = XL_CUPS[c].ven[0]; G.fx[id].vcap = XL_CUPS[c].ven[1]; G.fx[id].neutral = true; }
  const ut = nr.ties.find(t => t.t.includes(G.user));
  if (ut) news(XL_CUPS[c].n + ' draw', `${nr.n}: ${tName(ut.t[0])} v ${tName(ut.t[1])} (${dNice(nr.d[0], false)}).`, G.user);
};
const _venXC = venueOf;
venueOf = function (f) { if (f && f.ven && XL_CUPS[f.comp]) return { name: f.ven, cap: f.vcap || 70000, neutral: true, stands: STANDS_DEF }; return _venXC(f); };
const _rsXC = recordSeason;
recordSeason = function () { const rec = _rsXC(); try { for (const c in XL_CUPS) { const cup = G.cups[c]; if (!cup || !cup.winner) continue; const f = finalOf(c); rec.c[c] = { w: cup.winner, r: f ? (f.h === cup.winner ? f.a : f.h) : null }; } } catch (e) { console.error(e); } return rec; };
const _gocXC = goComp;
goComp = function (code) { if (XL_CUPS[code]) { UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'comps'; UI.tab.cp = code; render(); window.scrollTo(0, 0); return; } _gocXC(code); };
const _cpXC = scrComps;
scrComps = function () {
  if (!G.cups.DFB) return _cpXC();
  const d = divOf(G.user); if (!UI.tab.cp && (d === 'BL' || d === 'L1' || d === 'ED')) UI.tab.cp = d === 'BL' ? 'DFB' : d === 'ED' ? 'KNVB' : 'CDF';
  const tab = UI.tab.cp;
  const add = Object.keys(XL_CUPS).filter(c => G.cups[c]).map(c => `<button class="${tab === c ? 'on' : ''}" data-a="tab" data-k="cp" data-v="${c}">${XL_CUPS[c].n}</button>`).join('');
  if (!XL_CUPS[tab]) { const h = _cpXC(); const i0 = h.indexOf('<div class="tabs"'); const i = h.indexOf('</div>', i0); return i > 0 ? h.slice(0, i) + add + h.slice(i) : h; }
  UI.tab.cp = 'LC'; const h = _cpXC(); UI.tab.cp = tab;
  const cup = G.cups[tab];
  let body = cup.winner ? `<div class="box pad yel" style="margin-bottom:8px">Winners: ${tLink(cup.winner, true)}</div>` : '';
  body += cup.rounds.slice().reverse().filter(r => r.ties.length).map(r => `<h2 class="sect">${r.n} <span class="dim mono" style="font-size:16px">${r.d.map(x => dShort(x)).join(' & ')}</span></h2><div class="tw">${tiesTable(r)}</div>`).join('');
  body += `<p class="dim" style="margin-top:6px">Game format: only the ${XL[XL_CUPS[tab].lg].n} clubs are in this game, so the cup is an 18-team knockout. The four lowest-placed clubs play a first round; ${(cup.byes || []).length} clubs join in the round of 16. Single games; the final is at the ${XL_CUPS[tab].ven[0]}. Winners and runners-up can qualify for the Cup Winners' Cup.</p>`;
  const i0 = h.indexOf('<div class="tabs"'); const i1 = h.indexOf('</div>', i0);
  const tabs = h.slice(i0, i1).replace(/ class="on"/g, ' class=""') + add + '</div>';
  return `<div class="band">Cups &amp; Europe<small>${COMP_NAME[tab]} ${seasonLabel(G.year)}</small></div>${tabs}${body}`;
};
// older saves: add this season's cups; rounds already due are played at team level
function migrateXLCups() {
  if (!G || !G.xl || !G.xlL || !G.cups || G.cups.DFB || typeof cupRounds !== 'function') return;
  const savedTasks = G.tasks.slice(); buildXLCups(); G.tasks = savedTasks;
  for (const c in XL_CUPS) for (let k = 0; k < 6; k++) {
    const cup = G.cups[c]; const rd = cup.rounds[cup.ri]; if (!rd || !rd.ties.length || rd.done) break;
    let all = true; for (const t of rd.ties) for (const id of t.fx) { const f = G.fx[id]; if (!f.r) { if (f.d < G.date) quickFixture(f); else all = false; } }
    if (!all) break; checkCupProgress(c);
  }
}
const _rsXC2 = restore;
restore = function (obj) { _rsXC2(obj); try { migrateXLCups(); } catch (e) { console.error(e); } };
