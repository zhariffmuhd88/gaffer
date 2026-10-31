// laliga.js: Spain as a second country. La Liga with real squads, Segunda División (team level),
// Copa del Rey, Supercopa de España, Spanish clubs in Europe, awards, migration of older saves.
// Loaded after intl_ui.js. Countries and leagues are data: SPAIN describes the Spanish pyramid.

const SPAIN = { code: 'ESP', top: 'LL', second: 'SD', cup: 'CDR', super: 'SCE', rel: 3, segUp: 2 };
Object.assign(STADIA, LL_STADIA);
Object.assign(COMP_NAME, { LL: 'La Liga', SD: 'Segunda División', CDR: 'Copa del Rey', SCE: 'Supercopa de España' });
Object.assign(COMP_SHORT, { LL: 'LL', SD: 'SD', CDR: 'CdR', SCE: 'SCE' });
if (!LEAGUE_COMPS.includes('LL')) LEAGUE_COMPS.push('LL');
Object.assign(COMP_LINK, { 'La Liga': 'LL', 'Segunda División': 'SD', 'Copa del Rey': 'CDR', 'Supercopa de España': 'SCE', 'Filiales (B teams)': 'LLB', 'División de Honor Juvenil': 'DHJ' });
RIVALS.push(['RMA', 'ATM'], ['RMA', 'BAR'], ['BAR', 'EPY'], ['BET', 'SEV'], ['ATH', 'RSO'], ['VAL', 'LEV'], ['CEL', 'DEP'], ['VAL', 'VIL'], ['ATH', 'OSA'], ['ALA', 'ATH'], ['RMA', 'RAY'], ['ATM', 'GET'], ['MAL', 'SEV'], ['ELC', 'VAL'], ['RAC', 'ATH']);

// 2026/27 calendar (base year). La Liga runs 16 Aug 2026 - 23 May 2027, clear of FIFA windows.
CAL.ll = ['2026-08-16', '2026-08-23', '2026-08-30', '2026-09-06', '2026-09-13', '2026-09-20', '2026-10-11', '2026-10-18', '2026-10-25', '2026-11-01', '2026-11-08', '2026-11-22', '2026-11-29', '2026-12-03', '2026-12-06', '2026-12-13', '2026-12-20', '2027-01-03', '2027-01-10', '2027-01-17', '2027-01-24', '2027-01-31', '2027-02-08', '2027-02-14', '2027-02-21', '2027-02-28', '2027-03-07', '2027-03-14', '2027-03-21', '2027-04-04', '2027-04-11', '2027-04-18', '2027-04-22', '2027-04-26', '2027-05-02', '2027-05-09', '2027-05-16', '2027-05-23'];
// Copa del Rey: single games (the lower-division side hosts) up to the quarter-finals, two-legged semis, final in Seville
CAL.CDR = [['First round', ['2026-10-28']], ['Round of 32', ['2026-12-16']], ['Round of 16', ['2027-01-13']], ['Quarter-final', ['2027-02-11']], ['Semi-final', ['2027-03-03', '2027-04-07']], ['Final', ['2027-04-24'], 1]];
CAL.CDR_DRAW = '2026-10-14';
// Supercopa 2027 in Istanbul (RFEF): semi-finals 2 and 3 Feb, final 6 Feb
CAL.SCE = { sf: ['2027-02-02', '2027-02-03'], f: '2027-02-06', draw: '2027-01-20' };
const SCE_VEN_2027 = [['Chobani Stadyumu Fenerbahçe Şükrü Saracoğlu, Istanbul', 47430], ['Tüpraş Stadium, Istanbul', 42590], ['RAMS Park, Istanbul', 53000]];
// Spanish clubs in Europe 2026/27 (real qualification from 2025/26)
const EURO_ES_START = { UCL: ['BAR', 'RMA', 'VIL', 'ATM', 'BET'], UEL: ['RSO', 'CEL'], UECL: ['GET'] };
// Supercopa 2027: Barcelona (champions) v Atlético (cup runners-up), Real Sociedad (cup winners) v Real Madrid (runners-up)
const SCE_START = ['BAR', 'ATM', 'RSO', 'RMA'];

function isB(tid) { const t = T(tid); return !!(t && t.bteam); }
function esLevel(tid) { return G.ll && G.ll.includes(tid) ? 3 : G.seg && G.seg.includes(tid) ? 2 : 1; }

// ---------- setting up Spain ----------
function addSpain() {
  if (typeof LL_CLUBS === 'undefined') return;
  G.ll = [];
  for (const c of LL_CLUBS) addFullTeam(c, 'LL');
  G.seg = []; G.pf = [];
  for (const [n, s, stad, cap, b] of SEG_CLUBS) { const id = 'S_' + slug(n); addLite(id, n, s, stad, cap); if (b) G.teams[id].bteam = 1; G.teams[id].c1 = '#b0413e'; G.seg.push(id); }
  for (const [n, s] of PF_CLUBS) { const id = 'F_' + slug(n); addLite(id, n, s); G.teams[id].c1 = '#8a6d3b'; G.pf.push(id); }
  if (G.euroIn) for (const k in EURO_ES_START) G.euroIn[k] = (G.euroIn[k] || []).filter(t => !EURO_ES_START[k].includes(t)).concat(EURO_ES_START[k]);
  G.sceTeams = SCE_START.slice();
}
// generated players at Spanish clubs get Spanish names (most of them Spanish nationals)
function genNameES() { return R.pick(FIRST_ES) + ' ' + R.pick(LAST_ES); }
function hispanise(fromPid) {
  for (const p of Object.values(G.players)) {
    if (!p || !p.gen || p.esN || (+p.id.slice(1)) <= fromPid) continue;
    if (ctryOf(p.c) !== 'ESP') continue;
    p.n = genNameES(); if (R.chance(.8)) p.nat = 'ESP'; p.esN = 1;
  }
}

// ---------- tables ----------
function llTable() { return G.llLeague ? divTable(G.ll, G.llLeague.rounds, G.dedES) : G.ll.map(t => ({ t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] })); }
// head-to-head first on equal points (La Liga rule), then goal difference, goals scored
function h2hSort(rows, rounds) {
  const out = rows.slice(); const groups = {};
  for (const r of out) (groups[r.pts] = groups[r.pts] || []).push(r);
  const h2h = (ids) => { const s = {}; for (const id of ids) s[id] = { pts: 0, gd: 0 }; for (const rd of rounds) for (const fid of rd) { const f = G.fx[fid]; if (!f || !f.r || !s[f.h] || !s[f.a]) continue; const [a, b] = f.r; s[f.h].gd += a - b; s[f.a].gd += b - a; if (a > b) s[f.h].pts += 3; else if (b > a) s[f.a].pts += 3; else { s[f.h].pts++; s[f.a].pts++; } } return s; };
  const res = [];
  for (const k of Object.keys(groups).map(Number).sort((a, b) => b - a)) {
    const g = groups[k]; if (g.length === 1) { res.push(g[0]); continue; }
    const s = h2h(g.map(r => r.t));
    g.sort((a, b) => s[b.t].pts - s[a.t].pts || s[b.t].gd - s[a.t].gd || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || (a.t < b.t ? -1 : 1));
    res.push(...g);
  }
  return res;
}
const _llTable0es = llTable;
llTable = function () { const rows = _llTable0es(); return G.llLeague && rows.some(r => r.p >= 2) ? h2hSort(rows, G.llLeague.rounds) : rows; };
function segTable() {
  const tb = {}; for (const t of G.seg || []) tb[t] = { t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] };
  if (G.segL) for (const r of G.segL.rounds) for (const f of r) if (f.r && tb[f.h] && tb[f.a]) { addRes(tb[f.h], f.r[0], f.r[1]); addRes(tb[f.a], f.r[1], f.r[0]); tb[f.h].form.push(f.r[0] > f.r[1] ? 'W' : f.r[0] < f.r[1] ? 'L' : 'D'); tb[f.a].form.push(f.r[1] > f.r[0] ? 'W' : f.r[1] < f.r[0] ? 'L' : 'D'); }
  return Object.values(tb).sort(sortTable);
}

// ---------- season build ----------
function buildSpain() {
  if (!G.ll || !G.ll.length) return;
  const gl = leagueNorm(G.ll); if (G.normLL0 == null) G.normLL0 = gl;
  G.normLL = 0.86 * clamp(Math.exp(-(gl - G.normLL0) * .035), .8, 1.2);
  const r = roundRobin(R.shuffle(G.ll)); const h1 = R.shuffle(r), h2 = R.shuffle(r.map(x => x.map(([a, b]) => [b, a])));
  G.llLeague = { rounds: h1.concat(h2).map((pairs, ri) => pairs.map(([h, a]) => addFx({ comp: 'LL', d: sd(CAL.ll[ri]), h, a, rnd: ri + 1 }).id)) };
  const sr = roundRobin(R.shuffle(G.seg)); const s2 = sr.map(x => x.map(([a, b]) => [b, a]));
  G.segL = { rounds: R.shuffle(sr).concat(R.shuffle(s2)).map(x => x.map(([h, a]) => ({ h, a, r: null }))), played: 0 };
  G.cups.CDR = { id: 'CDR', rounds: CAL.CDR.map(([n, ds, neu]) => ({ n, d: ds.map(sd), neutral: !!neu, ties: [], done: false })), ri: 0, winner: null };
  G.cups.SCE = { id: 'SCE', rounds: [{ n: 'Semi-final', d: CAL.SCE.sf.map(sd), neutral: true, ties: [], done: false }, { n: 'Final', d: [sd(CAL.SCE.f)], neutral: true, ties: [], done: false }], ri: 0, winner: null };
  G.tasks.push({ d: sd(CAL.CDR_DRAW), t: 'drawCDR' }, { d: sd(CAL.SCE.draw), t: 'drawSCE' });
  G.dedES = {};
}
const _bsLes = buildSeason;
buildSeason = function () { _bsLes(); try { buildSpain(); } catch (e) { console.error(e); } };

// ---------- cups ----------
// pair teams so the bigger clubs meet lower-division sides; the lower-division team hosts
function cdrPairs(teams) {
  const byL = {}; for (const t of R.shuffle(teams)) (byL[esLevel(t)] = byL[esLevel(t)] || []).push(t);
  const list = [].concat(byL[3] || [], byL[2] || [], byL[1] || []);
  const pairs = []; let i = 0, j = list.length - 1;
  while (i < j) { const a = list[i], b = list[j]; const la = esLevel(a), lb = esLevel(b); pairs.push(la === lb ? (R.chance(.5) ? [a, b] : [b, a]) : la < lb ? [a, b] : [b, a]); i++; j--; }
  return pairs;
}
function drawCDR() {
  const sce = G.sceTeams || [];
  const ll = G.ll.filter(t => !sce.includes(t)), seg = G.seg.filter(t => !isB(t)), pf = (G.pf || []).slice();
  let ent = ll.concat(seg, pf); if (ent.length % 2) ent = ent.slice(0, ent.length - 1);
  drawFixed('CDR', 0, cdrPairs(ent));
  news('Copa del Rey draw', `First round: ${ll.length} La Liga clubs, ${seg.length} from the Segunda División and ${pf.length} from Primera Federación. Lower-division sides host; the four Supercopa clubs join in the round of 32.`, null, true);
}
function drawSCE() {
  const s = G.sceTeams; if (!s || s.length < 4 || s.some(t => !T(t))) return;
  const cup = G.cups.SCE; const rd = cup.rounds[0]; rd.ties = [];
  const ven = G.year === BASE_YEAR ? SCE_VEN_2027 : null;
  [[s[0], s[1]], [s[2], s[3]]].forEach(([h, a], i) => { const f = addFx({ comp: 'SCE', d: rd.d[i], h, a, rnd: 'Semi-final', need: true, neutral: true, ven: ven ? ven[i][0] : 'Neutral venue', vcap: ven ? ven[i][1] : 45000 }); rd.ties.push({ t: [h, a], fx: [f.id], w: null }); });
  cup.ri = 0;
  news('Supercopa de España', `Semi-finals${ven ? ' in Istanbul' : ''}: ${tName(s[0])} v ${tName(s[1])} (${dNice(rd.d[0], false)}), ${tName(s[2])} v ${tName(s[3])} (${dNice(rd.d[1], false)}).`, s.includes(G.user) ? G.user : null, true);
}
const CUP_NEXT = {
  CDR: (winners, rd) => {
    const cup = G.cups.CDR; const ri = cup.ri + 1;
    for (const t of rd.ties) if (!T(t.w).lite) prize(t.w, 0.2 * ri);
    let next = winners.slice();
    if (ri === 1) next = next.concat((G.sceTeams || []).filter(t => T(t) && !next.includes(t)));
    const nr = cup.rounds[ri];
    let pairs;
    if (nr.d.length === 2 || nr.neutral) { const l = R.shuffle(next); pairs = []; for (let i = 0; i + 1 < l.length; i += 2) pairs.push([l[i], l[i + 1]]); }
    else pairs = cdrPairs(next);
    drawFixed('CDR', ri, pairs);
    if (nr.neutral) for (const t of nr.ties) for (const id of t.fx) { G.fx[id].ven = 'Estadio de La Cartuja, Seville'; G.fx[id].vcap = 70000; }
  },
  SCE: (winners) => {
    const ven = G.year === BASE_YEAR ? SCE_VEN_2027[2] : null;
    drawFixed('SCE', 1, [[winners[0], winners[1]]]);
    for (const t of G.cups.SCE.rounds[1].ties) for (const id of t.fx) { G.fx[id].ven = ven ? ven[0] : 'Neutral venue'; G.fx[id].vcap = ven ? ven[1] : 50000; }
  }
};
const _venueLes = venueOf;
venueOf = function (f) { if (f && f.ven && (f.comp === 'CDR' || f.comp === 'SCE')) return { name: f.ven, cap: f.vcap || 50000, neutral: true, stands: STANDS_DEF }; return _venueLes(f); };

// ---------- day loop ----------
const _dtLes = dailyTick;
dailyTick = function () {
  try {
    if (G.ll && G.ll.length) for (const tk of G.tasks.filter(t => t.d === G.date)) { if (tk.t === 'drawCDR') drawCDR(); if (tk.t === 'drawSCE') drawSCE(); }
  } catch (e) { console.error(e); }
  return _dtLes.apply(this, arguments);
};
// the Segunda (42 rounds) keeps pace with La Liga rounds
const _fdLes = finishDay;
finishDay = function () {
  const r = _fdLes.apply(this, arguments);
  try {
    if (G.segL && r && r.ids) {
      const lf = r.ids.map(id => G.fx[id]).filter(f => f && f.comp === 'LL');
      if (lf.length) {
        const rnd = Math.max(...lf.map(f => f.rnd)); const target = Math.min(G.segL.rounds.length, Math.floor(rnd * G.segL.rounds.length / 38));
        while (G.segL.played < target) { for (const f of G.segL.rounds[G.segL.played]) f.r = quickScore(f.h, f.a); G.segL.played++; }
      }
    }
  } catch (e) { console.error(e); }
  return r;
};

// ---------- season end (called from seasonEnd before the new season is built) ----------
function spainSeasonEnd(lt) {
  if (!G.ll || !G.ll.length) return;
  lt = lt || llTable();
  const y = G.year;
  // finish the Segunda if needed
  if (G.segL) while (G.segL.played < G.segL.rounds.length) { for (const f of G.segL.rounds[G.segL.played]) f.r = quickScore(f.h, f.a); G.segL.played++; }
  const st = segTable(); const elig = st.filter(r => !isB(r.t));
  const poW = quickPO(quickPO(elig[2].t, elig[5].t), quickPO(elig[3].t, elig[4].t), true);
  const up = [elig[0].t, elig[1].t, poW];
  const down = lt.slice(17).map(r => r.t);
  const champ = lt[0].t; honour(champ, 'La Liga');
  lt.forEach((r, i) => prize(r.t, (20 - i) * 1.9 + 6));
  // Segunda: bottom four drop to Primera Federación, top four of a simulated Primera Federación come up
  const segDown = st.slice(-4).map(r => r.t);
  const pfUp = (G.pf || []).slice().sort((a, b) => (T(b).str + R.i(-4, 4)) - (T(a).str + R.i(-4, 4))).slice(0, 4);
  // Europe: top four Champions League, 5th and the cup winners Europa League, next place Conference League
  const cdrW = G.cups.CDR && G.cups.CDR.winner;
  const order = lt.map(r => r.t).filter(t => !down.includes(t));
  const ucl = order.slice(0, 4);
  let uel = [order[4]]; if (cdrW && G.ll.includes(cdrW) && !ucl.includes(cdrW) && !uel.includes(cdrW) && !down.includes(cdrW)) uel.push(cdrW); else uel.push(order[5]);
  const uecl = [order.find(t => !ucl.includes(t) && !uel.includes(t))];
  for (const k of ['UCL', 'UEL', 'UECL']) G.euroIn[k] = (G.euroIn[k] || []).concat({ UCL: ucl, UEL: uel, UECL: uecl }[k].filter(Boolean));
  // next Supercopa: league champions v cup runners-up, cup winners v league runners-up
  const cdrF = typeof finalOf === 'function' ? finalOf('CDR') : null; const cdrR = cdrF && cdrW ? (cdrF.h === cdrW ? cdrF.a : cdrF.h) : null;
  const pool = [champ, lt[1].t]; let cw = cdrW && T(cdrW) && !pool.includes(cdrW) && G.ll.concat(up).includes(cdrW) ? cdrW : null; let cr = cdrR && T(cdrR) && !pool.includes(cdrR) && cdrR !== cw && G.ll.concat(up).includes(cdrR) ? cdrR : null;
  const extra = order.filter(t => !pool.includes(t) && t !== cw && t !== cr);
  if (!cw) cw = extra.shift(); if (!cr) cr = extra.shift();
  G.sceTeams = [champ, cr, cw, lt[1].t];
  // promotion and relegation
  for (const t of down) { const tt = T(t); tt.rep = Math.min(tt.rep, 72); if (t !== G.user) relegationExodus(t, G.ll.filter(x => !down.includes(x))); relegate(t); }
  for (const t of up) { promote(t, 'LL'); const tt = T(t); tt.rep = clamp(tt.rep, 62, 74); tt.bal = 30; }
  G.ll = G.ll.filter(t => !down.includes(t)).concat(up);
  G.seg = G.seg.filter(t => !up.includes(t) && !segDown.includes(t)).concat(down, pfUp);
  G.pf = (G.pf || []).filter(t => !pfUp.includes(t)).concat(segDown);
  for (const t of G.ll) { if (up.includes(t)) continue; const tt = T(t); const i = lt.findIndex(r => r.t === t); tt.rep = clamp(Math.round(tt.rep * .85 + (100 - (i + 1) * 2) * .15), 58, 96); }
  G.lastSeasonES = { s: seasonLabel(y), champ, lt: lt.map(r => [r.t, r.pts]), down, up, poW, seg: st.slice(0, 6).map(r => [r.t, r.pts]), cdr: cdrW || null };
  news('La Liga', `${tName(champ, false)} are La Liga champions ${seasonLabel(y)}. Relegated to the Segunda División: ${down.map(t => tName(t)).join(', ')}. Promoted: ${up.map(t => tName(t)).join(', ')} (${tName(poW)} through the play-offs).`, null, true);
  G._esFrom = _pid;
}
// generated players created over the summer at Spanish clubs get Spanish names
const _seLes = seasonEnd;
seasonEnd = function () { const from = _pid; const r = _seLes.apply(this, arguments); try { hispanise(from); } catch (e) { console.error(e); } return r; };

// promoted Spanish clubs: Spanish colours and names for generated squads
const _promLes = promote;
promote = function (tid, div) {
  if (div !== 'LL') return _promLes(tid, div);
  const from = _pid; _promLes(tid, 'PL');
  const t = T(tid); t.rep = clamp(t.str + 4, 62, 74); t.bal = 30;
  hispanise(from);
};

// board targets for La Liga use the same bands as the Premier League (season.js), budgets follow
// ---------- awards: La Liga goal of the month ----------
const _gomLes = goalOfMonth;
goalOfMonth = function () {
  _gomLes();
  try {
    if (!G.ll || !G.ll.length) return;
    const d = dParse(G.date); d.setUTCMonth(d.getUTCMonth() - 1); const key = dStr(d).slice(0, 7);
    G.gotmLL = G.gotmLL || []; if (G.gotmLL.some(x => x.m === key)) return;
    const c = goalCandidates(key, 'LL'); if (!c.length) return;
    const w = c[0]; w.m = key; w.s = seasonLabel(G.year); G.gotmLL.push(w);
    news('La Liga Goal of the Month', `${w.n} (${tName(w.club)}) wins La Liga Goal of the Month for ${MON[+key.slice(5) - 1]} with his ${STYLE_N[w.st]} against ${tName(w.opp)}.`, w.club, divOf(G.user) === 'LL');
  } catch (e) { console.error(e); }
};
// monthAwards('LL') and seasonAwards('LL') run from awards.js; make sure the order is right for the first month
const _gocLes = goComp;
goComp = function (code) {
  if (code === 'LL' || code === 'SD') { UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'table'; UI.tab.tb = code === 'LL' ? 'll' : 'sd'; render(); window.scrollTo(0, 0); return; }
  if (code === 'CDR' || code === 'SCE') { UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'comps'; UI.tab.cp = code; render(); window.scrollTo(0, 0); return; }
  _gocLes(code);
};

// ---------- screens ----------
const _stLes = scrTable;
scrTable = function () {
  const tab = UI.tab.tb || (userDiv() === 'CH' ? 'ch' : userDiv() === 'LL' ? 'll' : 'pl');
  const btns = (on) => `<button class="${on === 'll' ? 'on' : ''}" data-a="tab" data-k="tb" data-v="ll">La Liga</button><button class="${on === 'sd' ? 'on' : ''}" data-a="tab" data-k="tb" data-v="sd">Segunda</button>`;
  if (!G.ll || !G.ll.length) return _stLes();
  if (tab !== 'll' && tab !== 'sd') { if (!UI.tab.tb) UI.tab.tb = tab; return _stLes().replace('data-v="ch">Championship</button>', 'data-v="ch">Championship</button>' + btns(null)); }
  let body;
  if (tab === 'll') {
    body = tableHtml(llTable(), i => i < 4 ? 'zone-ucl' : i < 5 ? 'zone-uel' : i < 6 ? 'zone-uecl' : i >= 17 ? 'zone-rel' : '', { form: true }) + `<p class="dim" style="margin-top:6px"><span class="cyan">▌</span> Champions League · <span class="amb">▌</span> Europa League (the Copa del Rey winners take a Europa League place) · <span class="grn">▌</span> Conference League · <span class="red">▌</span> Relegation to the Segunda División. Equal points are separated by head-to-head record first.</p>`;
  } else {
    const st = segTable();
    body = `<p class="dim" style="margin:6px 0">The Segunda División is simulated at team level (results only). Top two go up, 3rd to 6th play off for the last place; B teams cannot be promoted. Bottom four drop to Primera Federación.</p>` + tableHtml(st, i => i < 2 ? 'zone-ucl' : i < 6 ? 'zone-uel' : i >= st.length - 4 ? 'zone-rel' : '', { form: true }) + (G.lastSeasonES ? `<p class="dim">Last season: champions ${tLink(G.lastSeasonES.champ, true)}; promoted ${G.lastSeasonES.up.map(t => tLink(t, true)).join(', ')}.</p>` : '');
  }
  return `<div class="band">League tables<small>${seasonLabel(G.year)}</small></div><div class="tabs" style="margin-top:8px"><button data-a="tab" data-k="tb" data-v="pl">Premier League</button><button data-a="tab" data-k="tb" data-v="ch">Championship</button>${btns(tab)}<button data-a="tab" data-k="tb" data-v="y">Youth leagues</button></div>${body}`;
};
const _cpLes = scrComps;
scrComps = function () {
  if (!G.cups.CDR) return _cpLes();
  const tab = UI.tab.cp || (divOf(G.user) === 'LL' ? 'CDR' : 'LC');
  if (!UI.tab.cp) UI.tab.cp = tab;
  const add = `<button class="${tab === 'CDR' ? 'on' : ''}" data-a="tab" data-k="cp" data-v="CDR">Copa del Rey</button><button class="${tab === 'SCE' ? 'on' : ''}" data-a="tab" data-k="cp" data-v="SCE">Supercopa</button>`;
  if (tab !== 'CDR' && tab !== 'SCE') { const h = _cpLes(); const i = h.indexOf('</div>', h.indexOf('<div class="tabs"')); return i > 0 ? h.slice(0, i) + add + h.slice(i) : h; }
  UI.tab.cp = 'LC'; let h = _cpLes(); UI.tab.cp = tab;
  const cup = G.cups[tab];
  let body = cup.winner ? `<div class="box pad yel" style="margin-bottom:8px">Winners: ${tLink(cup.winner, true)}</div>` : '';
  body += cup.rounds.slice().reverse().filter(r => r.ties.length).map(r => `<h2 class="sect">${r.n} <span class="dim mono" style="font-size:16px">${r.d.map(d => dShort(d)).join(' & ')}</span></h2><div class="tw">${tiesTable(r)}</div>`).join('') || `<p class="dim">${tab === 'CDR' ? `The first-round draw is on ${dNice(sd(CAL.CDR_DRAW), false)}. Lower-division sides host single-game ties until the semi-finals, which are two-legged; the final is in Seville.` : `Semi-finals on ${dNice(sd(CAL.SCE.sf[0]), false)} and ${dNice(sd(CAL.SCE.sf[1]), false)}, final on ${dNice(sd(CAL.SCE.f), false)}${G.year === BASE_YEAR ? ' in Istanbul' : ''}. Teams: ${(G.sceTeams || []).map(t => tLink(t, true)).join(', ')}.`}</p>`;
  const i0 = h.indexOf('<div class="tabs"'); const i1 = h.indexOf('</div>', i0);
  const tabs = h.slice(i0, i1).replace(/ class="on"/g, ' class=""') + add + '</div>';
  return `<div class="band">Cups &amp; Europe<small>${COMP_NAME[tab]} ${seasonLabel(G.year)}</small></div>${tabs}${body}`;
};

// ---------- older saves: add Spain ----------
function migrateSpain() {
  if (!G || !G.teams || G.ll || typeof LL_CLUBS === 'undefined') return;
  const from = _pid;
  // players already in the save under the same name (e.g. England players listed abroad) move to their Spanish club
  const byName = {}; for (const p of Object.values(G.players)) if (p && (p.c === 'ABROAD' || p.c === 'FA')) byName[p.n] = p;
  G.ll = [];
  for (const c of LL_CLUBS) {
    const keep = c.sq.trim().split('\n').filter(l => byName[l.split('|')[1]]);
    addFullTeam(c, 'LL');
    for (const l of keep) {
      const [no, n] = l.split('|'); const old = byName[n]; const fresh = squad(c.id).find(p => p.n === n);
      if (!old || !fresh) continue;
      G.sq[c.id] = G.sq[c.id].map(id => id === fresh.id ? old.id : id); delete G.players[fresh.id];
      old.c = c.id; old.no = +no; delete old.ab; delete old.gone; old.con = fresh.con; G.fa = (G.fa || []).filter(x => x !== old.id);
    }
  }
  for (const id of G.ll) { for (const p of squad(id)) { p.wage = wageFor(p, id) * R.i(85, 110) / 100; p.val = calcValue(p); } setBudgets(id, true); autoPick(id); ensureCaptains(id); const t = T(id); for (const k in TAC_DEF) if (t.tac[k] == null) t.tac[k] = TAC_DEF[k]; if (!t.tac.pr) t.tac.pr = []; }
  G.seg = []; G.pf = [];
  for (const [n, s, stad, cap, b] of SEG_CLUBS) { const id = 'S_' + slug(n); if (!G.teams[id]) addLite(id, n, s, stad, cap); if (b) G.teams[id].bteam = 1; G.teams[id].c1 = '#b0413e'; G.seg.push(id); }
  for (const [n, s] of PF_CLUBS) { const id = 'F_' + slug(n); if (!G.teams[id]) addLite(id, n, s); G.teams[id].c1 = '#8a6d3b'; G.pf.push(id); }
  // European lite sides that are now real Spanish clubs: swap the ids everywhere in this season's European competitions
  const map = { E_RealMadrid: 'RMA', E_Barcelona: 'BAR', E_AtleticoMadrid: 'ATM', E_RealSociedad: 'RSO', E_Villarreal: 'VIL', E_RealBetis: 'BET', E_Sevilla: 'SEV', E_CeltaVigo: 'CEL', E_RayoVallecano: 'RAY' };
  const sw = (x) => map[x] || x;
  for (const f of Object.values(G.fx)) { f.h = sw(f.h); f.a = sw(f.a); }
  for (const c in G.euro || {}) { const E = G.euro[c]; E.teams = E.teams.map(sw); if (E.final) E.final = E.final.map(sw); if (E.winner) E.winner = sw(E.winner); for (const r of E.ko || []) for (const t of r.ties) { t.t = t.t.map(sw); if (t.w) t.w = sw(t.w); } }
  for (const k in map) delete G.teams[k];
  // this season's La Liga: fixtures from August; rounds before today are filled in with team-level results
  G.cups = G.cups || {};
  const savedTasks = G.tasks.slice(); buildSpain();
  for (const fid of [].concat(...G.llLeague.rounds)) { const f = G.fx[fid]; if (f.d < G.date) { quickFixture(f); } }
  const done = [].concat(...G.llLeague.rounds).map(id => G.fx[id]).filter(f => f.r); const rnd = done.length ? Math.max(...done.map(f => f.rnd)) : 0;
  const target = Math.floor(rnd * G.segL.rounds.length / 38); while (G.segL.played < target) { for (const f of G.segL.rounds[G.segL.played]) f.r = quickScore(f.h, f.a); G.segL.played++; }
  G.sceTeams = SCE_START.slice();
  if (G.date > sd(CAL.CDR_DRAW)) { drawCDR(); for (const t of G.cups.CDR.rounds[0].ties) for (const id of t.fx) if (G.fx[id].d < G.date) quickFixture(G.fx[id]); checkCupProgress('CDR'); }
  G.tasks = savedTasks.concat(G.tasks.filter(t => (t.t === 'drawCDR' || t.t === 'drawSCE') && t.d >= G.date));
  G.sceTeams = SCE_START.slice();
  if (G.euroIn) for (const k in EURO_ES_START) G.euroIn[k] = (G.euroIn[k] || []).filter(t => !EURO_ES_START[k].includes(t));
  if (typeof ensureYouth === 'function') for (const id of G.ll) try { ensureYouth(id); } catch (e) { console.error(e); }
  if (G.yl) { G.yl.LLB = { teams: R.shuffle(G.ll), rounds: roundRobin(G.ll.slice()), ri: 0, res: [], sc: {} }; G.yl.DHJ = { teams: R.shuffle(G.ll), rounds: roundRobin(G.ll.slice()), ri: 0, res: [], sc: {} }; }
  if (G.intl && !G.intl.esp && typeof setupSpainPool === 'function') setupSpainPool();
  hispanise(from);
  msg('La Liga', `Spain has been added: all 20 La Liga clubs with real first-team squads (as of 31 October 2026), the Segunda División, the Copa del Rey and the Supercopa. This season's La Liga table up to today was filled in with simulated results; Spanish clubs in Europe now have full squads. You can scout and sign players from Spanish clubs, apply for Spanish jobs and manage Spain.`);
}
const _rsLes = restore;
restore = function (obj) { _rsLes(obj); try { migrateSpain(); if (G.intl) setPlayNat(G.intl.nat || 'ENG'); } catch (e) { console.error(e); } };
const _renderLes = render;
render = function () { if (G && G.teams && !G.ll) { try { migrateSpain(); } catch (e) { console.error(e); } } _renderLes(); };
const _ngLes = newGame;
newGame = function (u, n) {
  const r = _ngLes(u, n);
  try { hispanise(0); if (G.intl && !G.intl.job) setPlayNat(ctryOf(G.user)); } catch (e) { console.error(e); }
  return r;
};
// a new club job in another country links the career to that country's national team (unless managing one)
const _tjLes = takeJob;
takeJob = function (tid) { _tjLes(tid); try { if (G.intl && !G.intl.job) setPlayNat(ctryOf(tid)); } catch (e) { console.error(e); } };
