// DFB-Pokal / Coupe de France: draw, screen, and an old save (no cups) migrating mid-season
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
for (const club of ['LIV', 'ARS']) {
  newGame(club, 'T');
  console.log('===', club, 'start', G.date, 'first comp', psFirstComp(), 'free', psFree().join(' '));
  bookTour(['SEL', 'JPN', 'CHN'], psFree()[0]);
  assistantFriendlies(false);
  for (const f of psList()) console.log('  ', f.d, tName(f.h), 'v', tName(f.a), '|', f.rnd, '|', venueOf(f).name);
  const star = squad(club).sort((a, b) => b.ca - a.ca)[0]; const st0 = JSON.stringify(star.st), rep0 = T(club).rep, bal0 = T(club).bal;
  let g = 0, errs = 0; const fc0 = psFirstComp();
  while (G.date < fc0 && g++ < 400) { try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, true); simulateFull(M); if (f.leg) { const ls = M.sides.find(S => S.leg2); console.log('   legends XI end:', ls.ps.map(e => e.p.n.split(' ').pop() + '(' + e.role + ')').join(' '), '| goals:', M.com.filter(c => c.k === 'goal').map(c => c.text.slice(0, 60)).join(' / ')); } finalizeMatch(M); postMatch(f, pre); finishDay(); console.log('  ', f.d, tName(f.h), f.r.join('-'), tName(f.a)); } } catch (e) { errs++; console.log('ERR', e.stack.split('\\n').slice(0, 4).join(' | ')); if (errs > 3) break; } }
  console.log('  star stats unchanged', JSON.stringify(star.st) === st0, '| rep', rep0, '->', T(club).rep.toFixed(1), '| fr income', (T(club).fin.in.fr || 0).toFixed(1), '| boost', G.ps.boost, '| errs', errs);
}
`);
