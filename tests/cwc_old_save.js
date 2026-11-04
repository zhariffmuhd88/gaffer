// Old save without this season's Cup Winners' Cup: it is added on load and played after the season.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('ARS', 'T');
const play = (until) => { let g = 0; while (G.date < until && g++ < 20000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } } };
play('2027-03-20');
delete G.cups.CWC; delete G.cups.CWX; G.tasks = G.tasks.filter(t => t.t !== 'drawCWC' && t.t !== 'drawCWX');
restore(JSON.parse(saveJSON(G)));
console.log('after load', G.date, '| CWC', !!G.cups.CWC, '| draw task', G.tasks.some(t => t.t === 'drawCWC'), '| CWX (Dec, already past)', !!G.cups.CWX);
play('2027-06-07');
const c = G.cups.CWC; console.log('CWC', c.rounds.map(r => r.n + ' ' + r.ties.map(t => tName(t.t[0]) + ' v ' + tName(t.t[1])).join(', ')).join(' | '), '| winner', c.winner && tName(c.winner));
`);
