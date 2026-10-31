// Old save: a career started before Spain was added, loaded in December 2026. Spain is added on load.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; playerModal = () => {};
newGame('CHE', 'Old');
// turn it into an old save: Spanish clubs back to team-level European sides, no Spanish leagues
const back = { RMA: 'Real Madrid', BAR: 'Barcelona', ATM: 'Atletico Madrid', RSO: 'Real Sociedad', VIL: 'Villarreal', BET: 'Real Betis', SEV: 'Sevilla', CEL: 'Celta Vigo', RAY: 'Rayo Vallecano', GET: 'Getafe CF' };
const sw = (x) => back[x] ? 'E_' + slug(back[x]) : x;
for (const [id, n] of Object.entries(back)) addLite('E_' + slug(n), n, 80);
for (const f of Object.values(G.fx)) { f.h = sw(f.h); f.a = sw(f.a); }
for (const c in G.euro) G.euro[c].teams = G.euro[c].teams.map(sw);
for (const id of Object.keys(G.fx)) { const f = G.fx[id]; if (['LL', 'CDR', 'SCE'].includes(f.comp) || (G.ll.includes(f.h) || G.ll.includes(f.a))) { G.byDate[f.d] = G.byDate[f.d].filter(x => x !== id); delete G.fx[id]; } }
for (const id of G.ll) { for (const pid of G.sq[id]) { const p = G.players[pid]; if (p.nat === 'ENG' && ['Jude Bellingham', 'Trent Alexander-Arnold', 'Anthony Gordon'].includes(p.n)) { p.c = 'ABROAD'; p.ab = 'Real Madrid'; } else delete G.players[pid]; } for (const pid of [].concat(G.res[id] || [], G.acad[id] || [])) delete G.players[pid]; delete G.res[id]; delete G.acad[id]; delete G.sq[id]; delete G.teams[id]; }
for (const id of G.seg.concat(G.pf)) delete G.teams[id];
delete G.ll; delete G.seg; delete G.pf; delete G.llLeague; delete G.segL; delete G.cups.CDR; delete G.cups.SCE; delete G.sceTeams; delete G.yl.LLB; delete G.yl.DHJ;
G.tasks = G.tasks.filter(t => t.t !== 'drawCDR' && t.t !== 'drawSCE'); for (const k in G.euroIn) G.euroIn[k] = G.euroIn[k].filter(t => !back[t] && t !== 'GET');
let g = 0; while (G.date < '2026-12-10' && g++ < 5000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } }
console.log('old save at', G.date, '| ll', !!G.ll, '| E_RealMadrid', !!G.teams.E_RealMadrid, '| UCL teams with E_', G.euro.UCL.teams.filter(t => t.startsWith('E_')).length);
const json = saveJSON(G); restore(JSON.parse(json));
console.log('after load: ll', G.ll.length, '| seg', G.seg.length, '| E_RealMadrid gone', !G.teams.E_RealMadrid, '| UCL Spanish', G.euro.UCL.teams.filter(t => G.ll.includes(t)).join(','));
const lt = llTable(); console.log('LL table after', lt[0].p, 'games:', lt.slice(0, 4).map(r => tName(r.t) + ' ' + r.pts).join(', '), '| next LL', Object.values(G.fx).filter(f => f.comp === 'LL' && !f.r).sort((a, b) => a.d < b.d ? -1 : 1)[0].d);
const bel = Object.values(G.players).filter(p => p.n === 'Jude Bellingham'); console.log('Bellingham', bel.length, bel.map(p => p.c + ' caps ' + p.ic).join(';'), '| CDR', G.cups.CDR.rounds.map(r => r.ties.length).join('/'), '| msg', G.news[0].title);
let errs = 0; g = 0; while (G.date < '2027-06-30' && g++ < 9000) { let r; try { r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } } catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 3).join(' | ')); break; } }
console.log('end of season', G.date, '| LL champion', G.lastSeasonES && tName(G.lastSeasonES.champ), '| CdR', G.lastSeasonES && G.lastSeasonES.cdr && tName(G.lastSeasonES.cdr), '| SCE', G.chist.length && G.chist[G.chist.length - 1].c.SCE && G.chist[G.chist.length - 1].c.SCE.w, '| errors', errs);
`);
