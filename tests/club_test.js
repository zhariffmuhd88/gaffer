// Stadium, board requests, building work, history and manager rankings over two seasons.
// Run from the repo root: node tests/club_test.js [CLUB]
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
const CLUB = process.argv[2] || 'LEE';
const t0 = Date.now();
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = (m) => console.log('toast:', m); render = () => {}; playerModal = () => {};
newGame('${CLUB}', 'Tester');
ensureAllStadia(); brd(); G.v5 = 1;
const t = userTeam();
console.log('stadium', t.stadium, 'cap', t.cap, '| stands', t.sdm.st.map(s => s.n + ' ' + s.cap).join(', '), '| fac', JSON.stringify(t.fac));
console.log('svg length', stadiumSvg(G.user).length, '| all clubs have stadium data:', fullTeams().every(id => STADIA[id]));
console.log('rank pool', rankPool().length, '| top 5 all-time:', rankList('all').slice(0, 5).map(x => x.n + ' ' + x.pts).join(', '));
console.log('user ranks: all', rankList('all').find(x => x.me).rk, 'cur', rankList('cur').find(x => x.me).rk, 'eng', rankList('eng').find(x => x.me).rk);
// board requests: confident board, healthy bank
G.board = 80; t.bal = Math.max(t.bal, 120);
const cap0 = t.cap;
UI.bsi = 2; UI.bsz = 1; ACT.breq('exp'); ACT.breq('tr'); ACT.breq('tb'); ACT.breq('wb');
ACT.breq('exp');
let guard = 0, seasons = 0, newAsked = false, capDuring = null, seenDone = false;
const tb0 = t.tb;
while (guard++ < 40000 && seasons < 2) {
  const r = advance();
  if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); }
  if (r.type === 'sacked') takeJob(jobOffers()[0]);
  if (capDuring == null && G.brd.proj.some(p => p.k === 'exp')) capDuring = t.cap;
  if (!seenDone && G.news.some(n => n.title === 'Stand reopens')) { seenDone = true; console.log('stand reopened', G.date, 'cap', cap0, '->', capDuring, '->', t.cap, '| bal', money(t.bal), '| build spend', money(t.fin.out.build || 0)); }
  if (G.hist.length > seasons) { seasons = G.hist.length; console.log('--- season end', G.hist[seasons - 1].s, 'pos', G.hist[seasons - 1].upos, '| chist', G.chist.length, '| ranks all', mrk().prev.all['@user'], 'cur', mrk().prev.cur['@user'], '| pts', userPoints());
    const c = G.chist[G.chist.length - 1].c; console.log('  winners:', Object.entries(c).map(([k, v]) => k + ' ' + (v.w ? tName(v.w) : '-') + ' (ru ' + (v.r ? tName(v.r) : '-') + ', ts ' + (v.ts ? v.ts[0] + ' ' + v.ts[2] : '-') + ', bp ' + (v.bp ? v.bp[0] : '-') + ')').join(' | '));
    if (!newAsked) { newAsked = true; G.board = 85; t.bal = Math.max(t.bal, 300); const no = newStadiumOptions(G.user); UI.bni = 1; UI.bname = 'Tester Park'; boardRequest('new', { name: 'Tester Park', cap: no[1].cap, cost: no[1].cost, months: 6 }); }
  }
}
console.log('board replies:', G.news.filter(n => /^Board /.test(n.title)).map(n => n.title).join(' | '));
console.log('sample reply:', (G.news.find(n => /^Board /.test(n.title)) || {}).body);
console.log('tb', money(tb0), '->', money(t.tb), '| fac', JSON.stringify(t.fac), '| projects left', G.brd.proj.map(p => p.k + ' ' + p.end).join(', '), '| log', G.brd.log.length);
console.log('stadium now', t.stadium, t.cap, '| record this save', t.sdm.hi && t.sdm.hi.att);
console.log('real managers in-game points:', Object.entries(mrk().pts).slice(0, 8).map(([k, v]) => k + ' ' + v).join(', '));
console.log('top 8 current:', rankList('cur').slice(0, 8).map(x => x.rk + '. ' + x.n + ' ' + x.pts + (x.me ? ' (YOU)' : '')).join(', '));
console.log('ranking news:', G.news.filter(n => /Rankings|Top \\d|World number|Manager rankings/.test(n.title)).map(n => n.body.slice(0, 120)).join(' || '));
const hon = clubHonours(G.user); console.log('club honours:', hon.map(h => h.label + ' ' + h.n + ' (game ' + h.game + ')').join(', '));
console.log('history html', scrHistory().length, '| club html', (UI.tab.club = 'stad', scrClub()).length, (UI.tab.club = 'board', scrClub()).length, (UI.tab.club = 'hon', scrClub()).length);
const json = saveJSON(G); const back = JSON.parse(json); restore(back); console.log('restore ok', !!G.teams[G.user].sdm, '| save size', Math.round(json.length / 1024) + ' KB');
// old save: strip new fields and migrate
for (const id in G.teams) { delete G.teams[id].sdm; delete G.teams[id].fac; } delete G.brd; delete G.v5; delete G.mrk; delete G.chist;
ensureAllStadia(); brd(); G.v5 = 1; console.log('old-save migration ok', fullTeams().every(id => T(id).sdm && T(id).fac), '| history screen', scrHistory().length > 1000);
`);
console.log('time', ((Date.now() - t0) / 1000).toFixed(1) + 's');
