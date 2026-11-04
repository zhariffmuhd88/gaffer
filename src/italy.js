// italy.js: Italy as a third country. Serie A with real squads, Serie B (team level), Coppa Italia,
// Supercoppa Italiana, Italian clubs in Europe, awards, migration of older saves. Loaded after laliga.js
// and reuses its helpers (h2hSort, CUP_NEXT, the start-of-career hooks).

Object.assign(STADIA, SA_STADIA);
Object.assign(COMP_NAME, { SA: 'Serie A', SB: 'Serie B', CIT: 'Coppa Italia', SCI: 'Supercoppa Italiana', PRI: 'Campionato Primavera 1', U18I: 'Campionato Under-18' });
Object.assign(COMP_SHORT, { SA: 'SA', SB: 'SB', CIT: 'CIt', SCI: 'SCI' });
if (!LEAGUE_COMPS.includes('SA')) LEAGUE_COMPS.push('SA');
Object.assign(COMP_LINK, { 'Serie A': 'SA', 'Serie B': 'SB', 'Coppa Italia': 'CIT', 'Supercoppa Italiana': 'SCI', 'Campionato Primavera 1': 'PRI', 'Campionato Under-18': 'U18I' });
RIVALS.push(['INT', 'ACM'], ['ROM', 'LAZ'], ['JUV', 'TOR'], ['INT', 'JUV'], ['JUV', 'ACM'], ['NAP', 'ROM'], ['NAP', 'JUV'], ['FIO', 'JUV'], ['ATA', 'BGN'], ['INT', 'NAP'], ['GEN', 'ACM'], ['FIO', 'BGN'], ['ACM', 'MNZ'], ['COM', 'INT'], ['UDI', 'VEN'], ['PAR', 'BGN'], ['LEC', 'NAP']);

// 2026/27 calendar (base year). Serie A runs 22 Aug 2026 - 30 May 2027 with breaks for the international windows.
CAL.sa = ['2026-08-22', '2026-08-29', '2026-09-05', '2026-09-12', '2026-09-19', '2026-10-10', '2026-10-17', '2026-10-24', '2026-10-28', '2026-10-31', '2026-11-07', '2026-11-21', '2026-11-28', '2026-12-05', '2026-12-12', '2026-12-19', '2027-01-03', '2027-01-06', '2027-01-10', '2027-01-17', '2027-01-24', '2027-01-31', '2027-02-07', '2027-02-14', '2027-02-21', '2027-02-28', '2027-03-07', '2027-03-14', '2027-03-21', '2027-04-03', '2027-04-10', '2027-04-17', '2027-04-24', '2027-05-01', '2027-05-08', '2027-05-16', '2027-05-23', '2027-05-30'];
// Coppa Italia: single games up to the quarter-finals (the higher-ranked club hosts), two-legged semis, final at the Olimpico
CAL.CIT = [['First round', ['2026-08-15']], ['Second round', ['2026-09-16']], ['Round of 16', ['2026-12-02']], ['Quarter-final', ['2027-02-03']], ['Semi-final', ['2027-03-03', '2027-04-21']], ['Final', ['2027-05-13'], 1]];
// Supercoppa: one match, league champions v cup winners (2026: Inter v Lazio at San Siro, 22 Dec)
CAL.SCI = '2026-12-22';
const EURO_IT_START = { UCL: ['INT', 'NAP', 'ROM', 'COM'], UEL: ['ACM', 'JUV'], UECL: ['ATA'] };
const CIT_SEEDS_START = ['INT', 'NAP', 'ROM', 'COM', 'ACM', 'JUV', 'ATA', 'BGN']; // 2025/26 top eight
const SCI_START = ['INT', 'LAZ'];
// European lite sides that are now real Italian clubs (older saves and the EURO pool)
const IT_LITE_MAP = { E_Inter: 'INT', E_ACMilan: 'ACM', E_Juventus: 'JUV', E_Napoli: 'NAP', E_Roma: 'ROM', E_Lazio: 'LAZ', E_Atalanta: 'ATA', E_Bologna: 'BGN', E_Como: 'COM', E_Fiorentina: 'FIO' };
const IT_LITE_NAMES = ['Inter', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Bologna', 'Como', 'Fiorentina'];
for (const k in EURO) EURO[k] = EURO[k].filter(([n]) => !IT_LITE_NAMES.includes(n));

function itLevel(tid) { return G.sa && G.sa.includes(tid) ? 3 : G.sb && G.sb.includes(tid) ? 2 : 1; }

// ---------- setting up Italy ----------
function addItaly() {
  if (typeof SA_CLUBS === 'undefined') return;
  G.sa = [];
  for (const c of SA_CLUBS) addFullTeam(c, 'SA');
  G.sb = []; G.sc = [];
  for (const [n, s, stad, cap] of SB_CLUBS) { const id = 'B_' + slug(n); addLite(id, n, s, stad, cap); G.teams[id].c1 = '#1d5c96'; G.sb.push(id); }
  for (const [n, s] of SC_CLUBS) { const id = 'C_' + slug(n); addLite(id, n, s); G.teams[id].c1 = '#5b6f3a'; G.sc.push(id); }
  G.sciTeams = SCI_START.slice(); G.citSeeds = CIT_SEEDS_START.slice();
}
const _asIT = addSpain;
addSpain = function () { _asIT(); try { addItaly(); } catch (e) { console.error(e); } };
function genNameIT() { return R.pick(FIRST_IT) + ' ' + R.pick(LAST_IT); }
// generated players at Italian clubs get Italian names (most of them Italian nationals)
function italianise(fromPid) {
  for (const p of Object.values(G.players)) {
    if (!p || !p.gen || p.itN || (+p.id.slice(1)) <= fromPid) continue;
    if (ctryOf(p.c) !== 'ITA') continue;
    p.n = genNameIT(); if (R.chance(.8)) p.nat = 'ITA'; p.itN = 1;
  }
}

// ---------- tables ----------
function saTable() {
  const rows = G.saLeague ? divTable(G.sa, G.saLeague.rounds, G.dedIT) : G.sa.map(t => ({ t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }));
  return G.saLeague && rows.some(r => r.p >= 2) ? h2hSort(rows, G.saLeague.rounds) : rows;
}
function sbTable() {
  const tb = {}; for (const t of G.sb || []) tb[t] = { t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] };
  if (G.sbL) for (const r of G.sbL.rounds) for (const f of r) if (f.r && tb[f.h] && tb[f.a]) { addRes(tb[f.h], f.r[0], f.r[1]); addRes(tb[f.a], f.r[1], f.r[0]); tb[f.h].form.push(f.r[0] > f.r[1] ? 'W' : f.r[0] < f.r[1] ? 'L' : 'D'); tb[f.a].form.push(f.r[1] > f.r[0] ? 'W' : f.r[1] < f.r[0] ? 'L' : 'D'); }
  return Object.values(tb).sort(sortTable);
}

// ---------- season build ----------
function buildItaly() {
  if (!G.sa || !G.sa.length) return;
  const gl = leagueNorm(G.sa); if (G.normSA0 == null) G.normSA0 = gl;
  G.normSA = 0.87 * clamp(Math.exp(-(gl - G.normSA0) * .035), .8, 1.2);
  const r = roundRobin(R.shuffle(G.sa)); const h1 = R.shuffle(r), h2 = R.shuffle(r.map(x => x.map(([a, b]) => [b, a])));
  G.saLeague = { rounds: h1.concat(h2).map((pairs, ri) => pairs.map(([h, a]) => addFx({ comp: 'SA', d: sd(CAL.sa[ri]), h, a, rnd: ri + 1 }).id)) };
  const sr = roundRobin(R.shuffle(G.sb)); const s2 = sr.map(x => x.map(([a, b]) => [b, a]));
  G.sbL = { rounds: R.shuffle(sr).concat(R.shuffle(s2)).map(x => x.map(([h, a]) => ({ h, a, r: null }))), played: 0 };
  G.cups.CIT = { id: 'CIT', rounds: CAL.CIT.map(([n, ds, neu]) => ({ n, d: ds.map(sd), neutral: !!neu, ties: [], done: false })), ri: 0, winner: null };
  G.cups.SCI = { id: 'SCI', rounds: [{ n: 'Final', d: [sd(CAL.SCI)], neutral: false, ties: [], done: false }], ri: 0, winner: null };
  G.dedIT = {};
  drawCIT(); drawSCI();
}
const _bsIT = buildSeason;
buildSeason = function () { _bsIT(); try { buildItaly(); } catch (e) { console.error(e); } };

// ---------- cups ----------
// Coppa Italia first round: Serie A clubs outside last season's top eight and all of Serie B; the top eight join in the round of 16
function drawCIT() {
  const seeds = (G.citSeeds || CIT_SEEDS_START).filter(t => G.sa.includes(t)).slice(0, 8);
  const sa = R.shuffle(G.sa.filter(t => !seeds.includes(t))), sb = R.shuffle(G.sb.slice());
  const pairs = [];
  while (sa.length && sb.length) pairs.push([sa.shift(), sb.shift()]);
  const rest = sa.concat(sb); for (let i = 0; i + 1 < rest.length; i += 2) pairs.push([rest[i], rest[i + 1]]);
  G.citSeeds = seeds;
  drawFixed('CIT', 0, pairs);
}
function drawSCI() {
  const s = G.sciTeams; if (!s || s.length < 2 || s.some(t => !T(t))) return;
  const cup = G.cups.SCI; const rd = cup.rounds[0]; rd.ties = [];
  const f = addFx({ comp: 'SCI', d: rd.d[0], h: s[0], a: s[1], rnd: 'Final', need: true });
  rd.ties.push({ t: [s[0], s[1]], fx: [f.id], w: null }); cup.ri = 0;
}
// higher level hosts; equal level: the stronger side (a seed in the round of 16) hosts
function citPair(a, b) { const la = itLevel(a), lb = itLevel(b); return la !== lb ? (la > lb ? [a, b] : [b, a]) : R.chance(.5) ? [a, b] : [b, a]; }
Object.assign(CUP_NEXT, {
  CIT: (winners) => {
    const cup = G.cups.CIT; const ri = cup.ri + 1;
    for (const t of cup.rounds[ri - 1].ties) if (T(t.w) && !T(t.w).lite) prize(t.w, 0.2 * ri);
    const nr = cup.rounds[ri]; let pairs = [];
    if (ri === 2) { const seeds = (G.citSeeds || []).filter(t => T(t)); const w = R.shuffle(winners); seeds.forEach((s, i) => { if (w[i]) pairs.push([s, w[i]]); }); for (let i = seeds.length; i + 1 < w.length; i += 2) pairs.push(citPair(w[i], w[i + 1])); }
    else { const l = R.shuffle(winners); for (let i = 0; i + 1 < l.length; i += 2) pairs.push(nr.d.length === 2 || nr.neutral ? [l[i], l[i + 1]] : citPair(l[i], l[i + 1])); }
    drawFixed('CIT', ri, pairs);
    if (nr.neutral) for (const t of nr.ties) for (const id of t.fx) { G.fx[id].ven = 'Stadio Olimpico, Rome'; G.fx[id].vcap = 70634; G.fx[id].neutral = true; }
    const ut = nr.ties.find(t => t.t.includes(G.user));
    if (ut) news('Coppa Italia draw', `${nr.n}: ${tName(ut.t[0])} v ${tName(ut.t[1])} (${dNice(nr.d[0], false)}).`, G.user);
  }
});
const _venueIT = venueOf;
venueOf = function (f) { if (f && f.ven && f.comp === 'CIT') return { name: f.ven, cap: f.vcap || 70634, neutral: true, stands: STANDS_DEF }; return _venueIT(f); };

// Serie B (38 rounds) keeps pace with Serie A rounds
const _fdIT = finishDay;
finishDay = function () {
  const r = _fdIT.apply(this, arguments);
  try {
    if (G.sbL && r && r.ids) {
      const lf = r.ids.map(id => G.fx[id]).filter(f => f && f.comp === 'SA');
      if (lf.length) {
        const rnd = Math.max(...lf.map(f => f.rnd)); const target = Math.min(G.sbL.rounds.length, Math.floor(rnd * G.sbL.rounds.length / 38));
        while (G.sbL.played < target) { for (const f of G.sbL.rounds[G.sbL.played]) f.r = quickScore(f.h, f.a); G.sbL.played++; }
      }
    }
  } catch (e) { console.error(e); }
  return r;
};

// ---------- season end (called from seasonEnd before the new season is built) ----------
function italySeasonEnd(st) {
  if (!G.sa || !G.sa.length) return;
  st = st || saTable();
  const y = G.year;
  if (G.sbL) while (G.sbL.played < G.sbL.rounds.length) { for (const f of G.sbL.rounds[G.sbL.played]) f.r = quickScore(f.h, f.a); G.sbL.played++; }
  const bt = sbTable();
  // Serie B: top two up, 3rd to 8th play off (simplified to a four-team bracket of 3rd-6th); bottom three down plus the play-out loser
  const poW = quickPO(quickPO(bt[2].t, bt[5].t), quickPO(bt[3].t, bt[4].t), true);
  const up = [bt[0].t, bt[1].t, poW];
  const down = st.slice(17).map(r => r.t);
  const champ = st[0].t; honour(champ, 'Serie A');
  st.forEach((r, i) => prize(r.t, (20 - i) * 1.7 + 5));
  const outL = quickPO(bt[15].t, bt[16].t) === bt[15].t ? bt[16].t : bt[15].t;
  const sbDown = bt.slice(-3).map(r => r.t).concat(outL);
  const scUp = (G.sc || []).slice().sort((a, b) => (T(b).str + R.i(-4, 4)) - (T(a).str + R.i(-4, 4))).slice(0, 4);
  // Europe: top four Champions League, 5th and the Coppa Italia winners Europa League, next place Conference League
  const citW = G.cups.CIT && G.cups.CIT.winner;
  const order = st.map(r => r.t).filter(t => !down.includes(t));
  const ucl = order.slice(0, 4);
  const uel = [order[4]]; if (citW && G.sa.includes(citW) && !ucl.includes(citW) && !uel.includes(citW) && !down.includes(citW)) uel.push(citW); else uel.push(order[5]);
  const uecl = [order.find(t => !ucl.includes(t) && !uel.includes(t))];
  for (const k of ['UCL', 'UEL', 'UECL']) G.euroIn[k] = (G.euroIn[k] || []).concat({ UCL: ucl, UEL: uel, UECL: uecl }[k].filter(t => t && !(G.euroIn[k] || []).includes(t)));
  // next Supercoppa: champions v cup winners (cup runners-up if the champions did the double)
  const citF = typeof finalOf === 'function' ? finalOf('CIT') : null; const citR = citF && citW ? (citF.h === citW ? citF.a : citF.h) : null;
  let opp = citW && citW !== champ ? citW : citR && citR !== champ ? citR : st[1].t;
  if (!T(opp) || T(opp).lite) opp = st[1].t;
  G.sciTeams = [champ, opp];
  G.citSeeds = order.slice(0, 8);
  for (const t of down) { const tt = T(t); tt.rep = Math.min(tt.rep, 72); if (t !== G.user) relegationExodus(t, G.sa.filter(x => !down.includes(x))); relegate(t); }
  for (const t of up) { promote(t, 'SA'); }
  G.sa = G.sa.filter(t => !down.includes(t)).concat(up);
  G.sb = G.sb.filter(t => !up.includes(t) && !sbDown.includes(t)).concat(down, scUp);
  G.sc = (G.sc || []).filter(t => !scUp.includes(t)).concat(sbDown);
  for (const t of G.sa) { if (up.includes(t)) continue; const tt = T(t); const i = st.findIndex(r => r.t === t); tt.rep = clamp(Math.round(tt.rep * .85 + (100 - (i + 1) * 2) * .15), 58, 96); }
  G.lastSeasonIT = { s: seasonLabel(y), champ, lt: st.map(r => [r.t, r.pts]), down, up, poW, sb: bt.slice(0, 8).map(r => [r.t, r.pts]), cit: citW || null };
  news('Serie A', `${tName(champ, false)} are Serie A champions ${seasonLabel(y)}. Relegated to Serie B: ${down.map(t => tName(t)).join(', ')}. Promoted: ${up.map(t => tName(t)).join(', ')} (${tName(poW)} through the play-offs).`, null, true);
}
const _seIT = seasonEnd;
seasonEnd = function () { const from = _pid; const r = _seIT.apply(this, arguments); try { italianise(from); } catch (e) { console.error(e); } return r; };

const _promIT = promote;
promote = function (tid, div) {
  if (div !== 'SA') return _promIT(tid, div);
  const from = _pid; _promIT(tid, 'PL');
  const t = T(tid); t.rep = clamp(t.str + 4, 62, 74); t.bal = 28;
  italianise(from);
};

// ---------- awards: Serie A goal of the month ----------
const _gomIT = goalOfMonth;
goalOfMonth = function () {
  _gomIT();
  try {
    if (!G.sa || !G.sa.length) return;
    const d = dParse(G.date); d.setUTCMonth(d.getUTCMonth() - 1); const key = dStr(d).slice(0, 7);
    G.gotmSA = G.gotmSA || []; if (G.gotmSA.some(x => x.m === key)) return;
    const c = goalCandidates(key, 'SA'); if (!c.length) return;
    const w = c[0]; w.m = key; w.s = seasonLabel(G.year); G.gotmSA.push(w);
    news('Serie A Goal of the Month', `${w.n} (${tName(w.club)}) wins Serie A Goal of the Month for ${MON[+key.slice(5) - 1]} with his ${STYLE_N[w.st]} against ${tName(w.opp)}.`, w.club, divOf(G.user) === 'SA');
  } catch (e) { console.error(e); }
};
const _gocIT = goComp;
goComp = function (code) {
  if (code === 'SA' || code === 'SB') { UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'table'; UI.tab.tb = code === 'SA' ? 'sa' : 'sb'; render(); window.scrollTo(0, 0); return; }
  if (code === 'CIT' || code === 'SCI') { UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'comps'; UI.tab.cp = code; render(); window.scrollTo(0, 0); return; }
  _gocIT(code);
};

// ---------- screens ----------
const _stIT = scrTable;
scrTable = function () {
  if (!G.sa || !G.sa.length) return _stIT();
  if (!UI.tab.tb && userDiv() === 'SA') UI.tab.tb = 'sa';
  const tab = UI.tab.tb;
  const btns = (on) => `<button class="${on === 'sa' ? 'on' : ''}" data-a="tab" data-k="tb" data-v="sa">Serie A</button><button class="${on === 'sb' ? 'on' : ''}" data-a="tab" data-k="tb" data-v="sb">Serie B</button>`;
  const SG = 'data-v="sd">Segunda</button>';
  if (tab !== 'sa' && tab !== 'sb') return _stIT().replace(SG, SG + btns(null));
  UI.tab.tb = 'll'; const h0 = _stIT(); UI.tab.tb = tab;
  const i0 = h0.indexOf('<div class="tabs"'); const i1 = h0.indexOf('</div>', i0);
  const tabs = h0.slice(i0, i1).replace(/ class="on"/g, ' class=""').replace(SG, SG + btns(tab)) + '</div>';
  let body;
  if (tab === 'sa') {
    body = tableHtml(saTable(), i => i < 4 ? 'zone-ucl' : i < 5 ? 'zone-uel' : i < 6 ? 'zone-uecl' : i >= 17 ? 'zone-rel' : '', { form: true }) + `<p class="dim" style="margin-top:6px"><span class="cyan">▌</span> Champions League · <span class="amb">▌</span> Europa League (the Coppa Italia winners take a Europa League place) · <span class="grn">▌</span> Conference League · <span class="red">▌</span> Relegation to Serie B. Equal points are separated by head-to-head record first.</p>`;
  } else {
    const bt = sbTable();
    body = `<p class="dim" style="margin:6px 0">Serie B is simulated at team level (results only). Top two go up and a play-off decides the third place; the bottom three and the play-out loser drop to Serie C.</p>` + tableHtml(bt, i => i < 2 ? 'zone-ucl' : i < 8 ? 'zone-uel' : i >= bt.length - 5 ? 'zone-rel' : '', { form: true }) + (G.lastSeasonIT ? `<p class="dim">Last season: Serie A champions ${tLink(G.lastSeasonIT.champ, true)}; promoted ${G.lastSeasonIT.up.map(t => tLink(t, true)).join(', ')}.</p>` : '');
  }
  return `<div class="band">League tables<small>${seasonLabel(G.year)}</small></div>${tabs}${body}`;
};
const _cpIT = scrComps;
scrComps = function () {
  if (!G.cups.CIT) return _cpIT();
  if (!UI.tab.cp && divOf(G.user) === 'SA') UI.tab.cp = 'CIT';
  const tab = UI.tab.cp;
  const add = `<button class="${tab === 'CIT' ? 'on' : ''}" data-a="tab" data-k="cp" data-v="CIT">Coppa Italia</button><button class="${tab === 'SCI' ? 'on' : ''}" data-a="tab" data-k="cp" data-v="SCI">Supercoppa</button>`;
  if (tab !== 'CIT' && tab !== 'SCI') { const h = _cpIT(); const i0 = h.indexOf('<div class="tabs"'); const i = h.indexOf('</div>', i0); return i > 0 ? h.slice(0, i) + add + h.slice(i) : h; }
  UI.tab.cp = 'LC'; const h = _cpIT(); UI.tab.cp = tab;
  const cup = G.cups[tab];
  let body = cup.winner ? `<div class="box pad yel" style="margin-bottom:8px">Winners: ${tLink(cup.winner, true)}</div>` : '';
  body += cup.rounds.slice().reverse().filter(r => r.ties.length).map(r => `<h2 class="sect">${r.n} <span class="dim mono" style="font-size:16px">${r.d.map(d => dShort(d)).join(' & ')}</span></h2><div class="tw">${tiesTable(r)}</div>`).join('') || `<p class="dim">${tab === 'CIT' ? `Serie A clubs outside last season's top eight and all of Serie B start in the first round; the top eight (${(G.citSeeds || []).map(t => tLink(t, true)).join(', ')}) join in the round of 16. Single games until the two-legged semi-finals; the final is at the Stadio Olimpico.` : `${(G.sciTeams || []).map(t => tLink(t, true)).join(' v ')} on ${dNice(sd(CAL.SCI), false)}.`}</p>`;
  const i0 = h.indexOf('<div class="tabs"'); const i1 = h.indexOf('</div>', i0);
  const tabs = h.slice(i0, i1).replace(/ class="on"/g, ' class=""') + add + '</div>';
  return `<div class="band">Cups &amp; Europe<small>${COMP_NAME[tab]} ${seasonLabel(G.year)}</small></div>${tabs}${body}`;
};

// ---------- older saves: add Italy ----------
function migrateItaly() {
  if (!G || !G.teams || G.sa || typeof SA_CLUBS === 'undefined') return;
  const from = _pid;
  const byName = {}; for (const p of Object.values(G.players)) if (p && (p.c === 'ABROAD' || p.c === 'FA')) byName[p.n] = p;
  G.sa = [];
  for (const c of SA_CLUBS) {
    const keep = c.sq.trim().split('\n').filter(l => byName[l.split('|')[1]]);
    addFullTeam(c, 'SA');
    for (const l of keep) {
      const [no, n] = l.split('|'); const old = byName[n]; const fresh = squad(c.id).find(p => p.n === n);
      if (!old || !fresh) continue;
      G.sq[c.id] = G.sq[c.id].map(id => id === fresh.id ? old.id : id); delete G.players[fresh.id];
      old.c = c.id; old.no = +no; delete old.ab; delete old.gone; old.con = fresh.con; G.fa = (G.fa || []).filter(x => x !== old.id);
    }
  }
  for (const id of G.sa) { for (const p of squad(id)) { p.wage = wageFor(p, id) * R.i(85, 110) / 100; p.val = calcValue(p); } setBudgets(id, true); autoPick(id); ensureCaptains(id); const t = T(id); for (const k in TAC_DEF) if (t.tac[k] == null) t.tac[k] = TAC_DEF[k]; if (!t.tac.pr) t.tac.pr = []; }
  G.sb = []; G.sc = [];
  for (const [n, s, stad, cap] of SB_CLUBS) { const id = 'B_' + slug(n); if (!G.teams[id]) addLite(id, n, s, stad, cap); G.teams[id].c1 = '#1d5c96'; G.sb.push(id); }
  for (const [n, s] of SC_CLUBS) { const id = 'C_' + slug(n); if (!G.teams[id]) addLite(id, n, s); G.teams[id].c1 = '#5b6f3a'; G.sc.push(id); }
  // European lite sides that are now real Italian clubs: swap the ids in this season's European competitions
  const sw = (x) => IT_LITE_MAP[x] || x;
  for (const f of Object.values(G.fx)) { f.h = sw(f.h); f.a = sw(f.a); }
  for (const c in G.euro || {}) { const E = G.euro[c]; E.teams = E.teams.map(sw); if (E.final) E.final = E.final.map(sw); if (E.winner) E.winner = sw(E.winner); for (const r of E.ko || []) for (const t of r.ties) { t.t = t.t.map(sw); if (t.w) t.w = sw(t.w); } }
  for (const k in G.euroIn || {}) G.euroIn[k] = G.euroIn[k].map(sw);
  for (const k in IT_LITE_MAP) delete G.teams[k];
  // this season: Serie A fixtures from August; rounds before today are filled in with team-level results
  G.cups = G.cups || {};
  G.sciTeams = SCI_START.slice(); G.citSeeds = CIT_SEEDS_START.slice();
  const savedTasks = G.tasks.slice(); buildItaly(); G.tasks = savedTasks;
  for (const fid of [].concat(...G.saLeague.rounds)) { const f = G.fx[fid]; if (f.d < G.date) quickFixture(f); }
  const done = [].concat(...G.saLeague.rounds).map(id => G.fx[id]).filter(f => f.r); const rnd = done.length ? Math.max(...done.map(f => f.rnd)) : 0;
  const target = Math.floor(rnd * G.sbL.rounds.length / 38); while (G.sbL.played < target) { for (const f of G.sbL.rounds[G.sbL.played]) f.r = quickScore(f.h, f.a); G.sbL.played++; }
  // cup rounds already due: play them at team level, round by round
  for (let k = 0; k < 6; k++) { const cup = G.cups.CIT; const rd = cup.rounds[cup.ri]; if (!rd || !rd.ties.length || rd.done) break; let all = true; for (const t of rd.ties) for (const id of t.fx) { const f = G.fx[id]; if (!f.r) { if (f.d < G.date) quickFixture(f); else all = false; } } if (!all) break; checkCupProgress('CIT'); }
  for (const t of G.cups.SCI.rounds[0].ties) for (const id of t.fx) if (G.fx[id].d < G.date && !G.fx[id].r) { quickFixture(G.fx[id]); checkCupProgress('SCI'); }
  if (typeof ensureYouth === 'function') for (const id of G.sa) try { ensureYouth(id); } catch (e) { console.error(e); }
  if (G.yl) { G.yl.PRI = { teams: R.shuffle(G.sa), rounds: roundRobin(G.sa.slice()), ri: 0, res: [], sc: {} }; G.yl.U18I = { teams: R.shuffle(G.sa), rounds: roundRobin(G.sa.slice()), ri: 0, res: [], sc: {} }; }
  if (G.intl && !G.intl.ita && typeof setupItalyPool === 'function') setupItalyPool();
  italianise(from);
  msg('Serie A', `Italy has been added: all 20 Serie A clubs with real first-team squads (as of 4 November 2026), Serie B, the Coppa Italia and the Supercoppa Italiana. This season's Serie A table up to today was filled in with simulated results; Italian clubs in Europe now have full squads. You can scout and sign players from Italian clubs, apply for Italian jobs and manage Italy.`);
}
const _rsIT = restore;
restore = function (obj) { _rsIT(obj); try { migrateItaly(); if (G.intl) setPlayNat(G.intl.nat || 'ENG'); } catch (e) { console.error(e); } };
const _renderIT = render;
render = function () { if (G && G.teams && G.ll && !G.sa) { try { migrateItaly(); } catch (e) { console.error(e); } } _renderIT(); };
const _ngIT = newGame;
newGame = function (u, n) {
  const r = _ngIT(u, n);
  try { italianise(0); if (G.intl && !G.intl.job) setPlayNat(ctryOf(G.user)); } catch (e) { console.error(e); }
  return r;
};
