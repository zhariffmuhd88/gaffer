// Old save: a career started before the international update, loaded in December 2026.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('CHE', 'Old');
for (const id of Object.keys(G.fx)) if (isIntlF(G.fx[id])) { const f = G.fx[id]; G.byDate[f.d] = G.byDate[f.d].filter(x => x !== id); delete G.fx[id]; }
for (const id of Object.keys(G.teams)) if (G.teams[id].nat) delete G.teams[id];
for (const p of Object.values(G.players)) { delete p.ic; delete p.ig; } for (const id in G.players) if (G.players[id].c === 'ABROAD' && G.players[id].ab) delete G.players[id];
delete G.intl;
let g = 0; while (G.date < '2026-12-10' && g++ < 5000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } }
console.log('old save at', G.date, '| intl', !!G.intl);
const json = saveJSON(G); restore(JSON.parse(json));
intlInit();
const E = G.intl.ed.UNL27;
const a3 = gTable(E.groups.A3, E.fx.A3); console.log('A3 table:', a3.map(r => tName(r.t) + ' ' + r.pts).join(', '));
const eng = E.fx.A3.map(id => G.fx[id]).filter(f => f.h === ENGID || f.a === ENGID); console.log('England results:', eng.map(f => tName(f.h) + ' ' + f.r.join('-') + ' ' + tName(f.a) + (f.real ? ' (real)' : '')).join(' | '));
console.log('UNL stage', E.stage, '| QF', E.ko[0] ? E.ko[0].pairs.map(p => p.map(t => tName(t)).join(' v ')).join(', ') : '-', '| tasks', G.intl.tasks.map(t => t.k + ' ' + t.d).join(', '));
for (let i = 0; i < 3; i++) advance();
console.log('EQ28 drawn:', !!G.intl.ed.EQ28, G.intl.ed.EQ28 ? Object.keys(G.intl.ed.EQ28.groups).length + ' groups, England in ' + Object.keys(G.intl.ed.EQ28.groups).find(g => G.intl.ed.EQ28.groups[g].includes(ENGID)) : '');
console.log('Kane', JSON.stringify((({ n, ic, ig, c, ab }) => ({ n, ic, ig, c, ab }))(Object.values(G.players).find(p => p.n === 'Harry Kane'))));
`);
