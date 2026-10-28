// Two-season simulation with the Championship as a full division.
// Run from the repo root: node tests/ch_test.js [CLUB] [SEASONS]
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js');
const code = files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
const CLUB = process.argv[2] || 'WHU', SEASONS = +(process.argv[3] || 2);
const t0 = Date.now();
(0, eval)(code + `
;globalThis.__G = () => G;
newGame('${CLUB}', 'Tester');
const start = {}; for (const p of Object.values(G.players)) start[p.id] = p.ca;
const report = (lab) => {
  const res = {};
  for (const c of ['PL', 'CH']) { const fx = Object.values(G.fx).filter(f => f.comp === c && f.r); let g = 0, hw = 0, d = 0; for (const f of fx) { g += f.r[0] + f.r[1]; if (f.r[0] > f.r[1]) hw++; else if (f.r[0] === f.r[1]) d++; } res[c] = fx.length + ' games, ' + (g / fx.length).toFixed(2) + ' goals/game, home ' + Math.round(hw / fx.length * 100) + '%, draws ' + Math.round(d / fx.length * 100) + '%'; }
  const top = (div) => Object.values(G.players).filter(p => divOf(p.c) === div && p.st.lg).sort((a, b) => b.st.lg - a.st.lg).slice(0, 4).map(p => p.n + ' (' + tName(p.c) + ') ' + p.st.lg);
  console.log('== ' + lab, JSON.stringify(res));
  console.log('PL top scorers:', top('PL').join('; '));
  console.log('CH top scorers:', top('CH').join('; '));
  const ct = champTable(); console.log('CH table:', ct.map((r, i) => (i + 1) + '.' + tName(r.t) + ' ' + r.pts + (r.ded ? '(-' + r.ded + ')' : '')).join(' '));
  const po = G.cups.PO; console.log('Play-offs:', po.rounds.map(r => r.n + ': ' + r.ties.map(t => tName(t.t[0]) + ' v ' + tName(t.t[1]) + ' -> ' + (t.w ? tName(t.w) : '?')).join(', ')).join(' | '), 'winner', po.winner && tName(po.winner));
  console.log('PL table top/bottom:', leagueTable().map((r, i) => (i + 1) + '.' + tName(r.t) + ' ' + r.pts).filter((x, i) => i < 4 || i > 16).join(' '));
};
let guard = 0, done = 0;
const seasonStart = () => { for (const p of Object.values(G.players)) start[p.id] = p.ca; };
while (guard++ < 20000 && G.hist.length < ${SEASONS}) {
  if (!done && G.date >= sd('2027-05-31')) { done = 1; report('Season ' + seasonLabel(G.year)); }
  const r = advance();
  if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); }
  if (r.type === 'sacked') { const o = jobOffers()[0]; console.log('SACKED, new job', o); takeJob(o); }
  if (r.type === 'season') {
    const h = G.hist[G.hist.length - 1];
    console.log('Season end', h.s, '| user', h.team, h.div, h.upos, '| promoted', h.prom.join(', '), '| relegated', h.rel.join(', '), '| CH relegated', h.chRel.join(', '), '| L1 up', h.l1prom.join(', '), '| verdict:', G.lastSeason.verdict);
    // growth by age group across the season (before the summer step was applied the start snapshot was taken)
    const grp = { 'U21': [], '22-25': [], '26-29': [], '30-32': [], '33+': [] };
    for (const p of Object.values(G.players)) { if (start[p.id] == null || !divOf(p.c)) continue; const a = p.age - 1; const k = a <= 21 ? 'U21' : a <= 25 ? '22-25' : a <= 29 ? '26-29' : a <= 32 ? '30-32' : '33+'; grp[k].push(p.ca - start[p.id]); }
    console.log('Rating change over the season (incl. summer):', Object.entries(grp).map(([k, v]) => k + ' ' + (v.reduce((s, x) => s + x, 0) / v.length).toFixed(2) + ' (n=' + v.length + ')').join(', '));
    const ex = Object.values(G.players).filter(p => p.ch && p.ch.v.length >= 8 && p.age <= 21 && divOf(p.c)).sort((a, b) => (b.ch.v[b.ch.v.length - 1] - b.ch.v[0]) - (a.ch.v[a.ch.v.length - 1] - a.ch.v[0]))[0];
    if (ex) console.log('Example riser:', ex.n, tName(ex.c), 'from', ex.ch.k, ex.ch.v.join(','), 'pa', ex.pa);
    console.log('Divisions now: PL', G.pl.length, 'CH', G.champTeams.length, divTeams('CH').length, 'full | L1', G.l1.length, '| CH fixtures next season', G.chLeague && G.chLeague.rounds.length);
    seasonStart(); done = 0;
  }
}
const json = JSON.stringify(G);
console.log('Save size', Math.round(json.length / 1024) + ' KB', '| players', Object.keys(G.players).length, '| fixtures', Object.keys(G.fx).length);
const fin = T(G.user); console.log('User', G.user, divOf(G.user), 'bal', fin.bal.toFixed(1), 'tb', fin.tb, 'wb', fin.wb, 'wagebill', wageBill(G.user).toFixed(0));
const chFin = divTeams('CH').map(t => tName(t) + ' ' + T(t).bal.toFixed(0)).join(', '); console.log('CH balances:', chFin);
console.log('Dev news:', G.news.filter(n => n.title === 'Player development').slice(0, 3).map(n => n.body).join(' || '));
`);
console.log('time', ((Date.now() - t0) / 1000).toFixed(1) + 's');
