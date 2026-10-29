// Reserves and academy over a full season. Run from the repo root: node tests/youth_test.js [CLUB]
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
global.toast = (m) => console.log('toast:', m);
const CLUB = process.argv[2] || 'ARS';
const t0 = Date.now();
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = (m) => console.log('toast:', m); render = () => {}; playerModal = () => {};
newGame('${CLUB}', 'Tester');
const cnt = (tid) => resSquad(tid).length + '/' + acadSquad(tid).length + ' (real ' + resSquad(tid).concat(acadSquad(tid)).filter(p => !p.gen).length + ')';
console.log('youth squads:', fullTeams().slice(0, 6).map(t => tName(t) + ' ' + cnt(t)).join(' | '), '| total youth', fullTeams().reduce((s, t) => s + resSquad(t).length + acadSquad(t).length, 0));
console.log('first team sizes unchanged:', G.pl.slice(0, 4).map(t => squad(t).length).join(','), '| staff hoyd', G.staff.hoyd && G.staff.hoyd.ab);
const r0 = resSquad(G.user).sort((a, b) => b.ca - a.ca);
console.log('user reserves top:', r0.slice(0, 5).map(p => p.n + ' ' + p.pos + ' ' + p.age + ' ' + p.ca + '/' + p.pa + (p.gen ? ' GEN' : '')).join('; '));
// user actions: promote, demote, bench call-up, loan
const pr = r0[0]; yMove(pr.id, 'f'); console.log('promoted', pr.n, 'level', levelOf(pr), 'first team', squad(G.user).length);
const dm = squad(G.user).sort((a, b) => a.ca - b.ca)[0]; yMove(dm.id, 'r'); console.log('demoted', dm.n, 'level', levelOf(dm));
const bp = resSquad(G.user).sort((a, b) => b.ca - a.ca)[0]; const tac = userTeam().tac; tac.bench[tac.bench.length - 1] = bp.id; validateLineup(G.user); console.log('bench call-up kept:', tac.bench.includes(bp.id), bp.n);
const lp = acadSquad(G.user).sort((a, b) => b.ca - a.ca)[0]; const lr = loanOut(lp.id, 'ch'); console.log('loan academy player:', lr.msg, '| level now', levelOf(lp), 'club', tName(lp.c));
const start = {}; for (const p of Object.values(G.players)) start[p.id] = p.ca;
let guard = 0, benchApps = 0;
while (guard++ < 20000 && !G.hist.length) {
  const r = advance();
  if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); if (bp.st.a) benchApps = bp.st.a; }
  if (r.type === 'sacked') takeJob(jobOffers()[0]);
  if (G.date >= sd('2027-04-20') && !globalThis.__rep) { globalThis.__rep = 1;
    for (const c of Object.keys(YOUTH_COMPS)) { const tb = yTable(c); const sc = yScorers(c, 3); console.log(c, 'rounds', G.yl[c].ri + '/' + G.yl[c].rounds.length, '| top', tb.slice(0, 3).map(x => tName(x.t) + ' ' + x.pts).join(', '), '| scorers', sc.map(([p, g]) => p.n + ' ' + g).join(', ')); }
    const ys = Object.values(G.players).filter(p => p.sq && divOf(p.c));
    const grp = { 'U17': [], '18-19': [], '20-22': [] }; for (const p of ys) { if (start[p.id] == null) continue; const k = p.age <= 17 ? 'U17' : p.age <= 19 ? '18-19' : '20-22'; grp[k].push(p.ca - start[p.id]); }
    console.log('youth change Aug-Apr:', Object.entries(grp).map(([k, v]) => k + ' ' + (v.reduce((s, x) => s + x, 0) / v.length).toFixed(2) + ' (n=' + v.length + ')').join(', '), '| avg youth apps', (ys.reduce((s, p) => s + ((p.ys && p.ys.a) || 0), 0) / ys.length).toFixed(1));
    console.log('bench call-up player first-team apps:', bp.st.a, '| loan player', lp.n, 'at', tName(lp.c), 'ca', start[lp.id], '->', lp.ca);
  }
}
const h = G.hist[0]; console.log('season end', h.s, 'user pos', h.upos);
console.log('after rollover: user', cnt(G.user), '| loan returned:', lp.n, levelOf(lp), tName(lp.c));
console.log('AI promotions sample:', fullTeams().filter(t => t !== G.user).slice(0, 5).map(t => tName(t) + ' ft ' + squad(t).length + ' res ' + resSquad(t).length + ' aca ' + acadSquad(t).length).join(' | '));
console.log('youth inbox:', G.news.filter(n => /Youth|Academy/.test(n.title)).slice(0, 4).map(n => n.title + ': ' + n.body.slice(0, 110)).join(' || '));
const json = saveJSON(G); const back = JSON.parse(json); restore(back); console.log('restore ok', Object.values(G.players).every(p => p.st && p.form)); console.log('save size', Math.round(json.length / 1024) + ' KB', '| players', Object.keys(G.players).length);
`);
console.log('time', ((Date.now() - t0) / 1000).toFixed(1) + 's');
