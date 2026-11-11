// Rotate squad: all 11 change; short squads are filled from reserves/academy. node tests/rot_test.js
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;let last = ''; toast = (m) => { last = m; }; render = () => {};
newGame('ARS', 'T');
const tac = userTeam().tac; let fail = 0;
const names = () => tac.xi.map(id => surname(P(id).n) + (P(id).sq ? '*' : '')).join(', ');
autoPick(G.user, true); const best = tac.xi.slice(); console.log('best :', names());
ACT.selpick('rot'); console.log('rot  :', names()); console.log(last);
let same = tac.xi.filter(x => best.includes(x)).length; console.log('overlap', same, 'bench has old XI', best.filter(x => tac.bench.includes(x)).length, 'bench', tac.bench.length);
if (same > 0 || new Set(tac.xi).size !== 11) fail++;
// rotate again: back to (mostly) the first XI
const r1 = tac.xi.slice(); ACT.selpick('rot'); console.log('rot2 :', names()); if (tac.xi.some(x => r1.includes(x))) fail++;
// short squad: mark most of the squad injured
autoPick(G.user, true); const b2 = tac.xi.slice();
squad(G.user).filter(p => !b2.includes(p.id)).slice(6).forEach(p => { p.inj = { d: 30, n: 'Test' }; });
console.log('avail outside XI:', squad(G.user).filter(p => !b2.includes(p.id) && available(p)).length);
ACT.selpick('rot'); console.log('short:', names()); console.log(last);
const y = tac.xi.filter(id => P(id).sq).length; console.log('youth starters', y, 'overlap', tac.xi.filter(x => b2.includes(x)).length);
if (!y || new Set(tac.xi.filter(Boolean)).size !== 11) fail++;
console.log(fail ? 'FAIL' : 'OK');
`);
