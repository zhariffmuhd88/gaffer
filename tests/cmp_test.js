// Player comparison: face stats ranges, screen with 1-3 players, GK v outfield, search.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('ARS', 'T');
const by = (n) => Object.values(G.players).find(p => p.n === n);
for (const n of ['Bukayo Saka', 'Kylian Mbappé', 'Lamine Yamal', 'Virgil van Dijk', 'Rodri', 'David Raya', 'Gianluigi Donnarumma']) { const p = by(n); console.log(n.padEnd(22), p.ca, p.pos, JSON.stringify(faceStats(p, p.pos === 'GK'))); }
const youth = Object.values(G.players).find(p => p.c === 'ARS' && p.age <= 17); const intl = by('Harry Kane');
UI.cmp = [by('Bukayo Saka').id, by('Lamine Yamal').id, youth.id]; const h = scrCompare();
console.log('3 players screen', h.length, h.includes('<polygon'), (h.match(/<polygon/g) || []).length, '| best marks', (h.match(/cmpbest/g) || []).length);
UI.cmp = [by('David Raya').id, by('Gianluigi Donnarumma').id]; console.log('GK v GK uses GK axes', scrCompare().includes('>DIV<'));
UI.cmp = [by('David Raya').id, intl.id]; console.log('GK v outfield uses outfield axes', scrCompare().includes('>PAC<'), '| Kane club', clubTxt(intl));
console.log('search "yamal"', cmpSearch('yamal').includes('Lamine'), '| search accent-free "mbappe"', cmpSearch('mbappe').includes('Mbapp'));
cmpAdd(by('Rodri').id); cmpAdd(by('Pedri').id); cmpAdd(by('Saka') ? 'x' : by('Bukayo Saka').id); console.log('max 3', UI.cmp.length);
`);
