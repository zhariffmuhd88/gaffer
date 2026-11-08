// DFB-Pokal / Coupe de France: draw, screen, and an old save (no cups) migrating mid-season
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('ARS', 'T'); bookTour(['SEL', 'JPN', 'SGP', 'HKG'], psFree()[0]);
const tot = { g: 0, n: 0 };
for (const k of ['SEL', 'JPN', 'SGP', 'HKG', 'CHN']) {
  const f = addFx({ comp: 'PSF', d: G.date, h: 'AS_' + k, a: 'ARS', rnd: 'x', tour: k });
  const M = createMatch(f.id, true); const S = M.sides[0];
  console.log(k, '| XI:', S.ps.map(e => e.role + ' ' + e.p.n).join(', '));
  console.log('   bench:', S.bench.map(p => p.n).join(', '));
  simulateFull(M); console.log('   result', M.score.join('-'), '| scorers', M.com.filter(c => c.k === 'goal').map(c => c.text.replace(/^GOAL!.*?\\. /, '').split(' ').slice(0, 2).join(' ')).join('; '));
  let sc = 0; for (let i = 0; i < 40; i++) { const r = quickScore('AS_' + k, 'ARS', false); sc += r[1] - r[0]; } console.log('   avg quick margin for Arsenal', (sc / 40).toFixed(1));
}
`);
