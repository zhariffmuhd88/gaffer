// Old save: a career started before Italy was added, loaded in December 2026. Italy is added on load.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; playerModal = () => {};
newGame('CHE', 'Old');
// turn it into a save from before Italy: Italian clubs back to team-level European sides, no Italian leagues
const back = {}; for (const [k, v] of Object.entries(IT_LITE_MAP)) back[v] = k;
const sw = (x) => back[x] || x;
for (const [id, k] of Object.entries(back)) addLite(k, IT_LITE_NAMES[Object.keys(IT_LITE_MAP).indexOf(k)], 80);
for (const f of Object.values(G.fx)) { f.h = sw(f.h); f.a = sw(f.a); }
for (const c in G.euro) G.euro[c].teams = G.euro[c].teams.map(sw);
for (const id of Object.keys(G.fx)) { const f = G.fx[id]; if (['SA', 'CIT', 'SCI'].includes(f.comp) || (G.sa.includes(f.h) || G.sa.includes(f.a))) { G.byDate[f.d] = G.byDate[f.d].filter(x => x !== id); delete G.fx[id]; } }
for (const id of G.sa) { for (const pid of G.sq[id]) { const p = G.players[pid]; if (['Trevoh Chalobah', 'Josep Martínez'].includes(p.n)) { p.c = 'ABROAD'; p.ab = tName(id); } else delete G.players[pid]; } for (const pid of [].concat(G.res[id] || [], G.acad[id] || [])) delete G.players[pid]; delete G.res[id]; delete G.acad[id]; delete G.sq[id]; delete G.teams[id]; }
for (const id of G.sb.concat(G.sc)) delete G.teams[id];
delete G.sa; delete G.sb; delete G.sc; delete G.saLeague; delete G.sbL; delete G.cups.CIT; delete G.cups.SCI; delete G.sciTeams; delete G.citSeeds; delete G.yl.PRI; delete G.yl.U18I; delete G.intl.ita;
for (const k in G.euroIn) G.euroIn[k] = G.euroIn[k].filter(t => !back[t]);
let g = 0; while (G.date < '2026-12-10' && g++ < 5000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } }
console.log('old save at', G.date, '| sa', !!G.sa, '| E_Inter', !!G.teams.E_Inter, '| UCL teams with E_', G.euro.UCL.teams.filter(t => t.startsWith('E_')).length);
const json = saveJSON(G); restore(JSON.parse(json));
console.log('after load: sa', G.sa.length, '| sb', G.sb.length, '| E_Inter gone', !G.teams.E_Inter, '| Euro Italian', ['UCL', 'UEL', 'UECL'].map(c => c + ':' + G.euro[c].teams.filter(t => G.sa.includes(t)).join(',')).join(' '));
const st = saTable(); console.log('SA table after', st[0].p, 'games:', st.slice(0, 4).map(r => tName(r.t) + ' ' + r.pts).join(', '), '| next SA', Object.values(G.fx).filter(f => f.comp === 'SA' && !f.r).sort((a, b) => a.d < b.d ? -1 : 1)[0].d);
const ch = Object.values(G.players).filter(p => p.n === 'Trevoh Chalobah'); console.log('Chalobah', ch.length, ch.map(p => p.c + ' caps ' + p.ic).join(';'), '| Josep', Object.values(G.players).filter(p => p.n === 'Josep Martínez').map(p => p.c).join(','), '| CIT', G.cups.CIT.rounds.map(r => r.ties.length).join('/'), 'ri', G.cups.CIT.ri, '| SCI', G.cups.SCI.rounds[0].ties.length, '| msg', G.news[0].title);
let errs = 0; g = 0; while (G.date < '2027-06-30' && g++ < 9000) { let r; try { r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } } catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 3).join(' | ')); break; } }
console.log('end of season', G.date, '| SA champion', G.lastSeasonIT && tName(G.lastSeasonIT.champ), '| CIT', G.lastSeasonIT && G.lastSeasonIT.cit && tName(G.lastSeasonIT.cit), '| SCI', G.chist.length && G.chist[G.chist.length - 1].c.SCI && G.chist[G.chist.length - 1].c.SCI.w, '| errors', errs);
`);
