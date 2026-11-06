// DFB-Pokal / Coupe de France: draw, screen, and an old save (no cups) migrating mid-season
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('ARS', 'T');
const star = Object.values(G.players).filter(p => p.c !== 'ARS' && T(p.c) && !T(p.c).lite && p.ca >= 88)[0];
completeTransfer(star, 'ARS', 120, 300, 5);
console.log(G.news.slice(0,3).map(n => n.title + ': ' + n.body).join('\\n'));
const ex = squad('TOT').sort((a,b)=>b.ca-a.ca)[0]; completeTransfer(ex, 'ARS', 60, 150, 4);
for (const p of G.feed.slice(0, 8)) console.log('*', p.a, ':', p.t, '||', (p.rep||[]).map(r=>r.t).join(' || '));
for (const t of ['ARS','MCI','MUN','LIV','CHE','TOT','RMA']) console.log(t, '| taunt:', R.pick(rvTaunts(t)), '| brag:', rvBrags(t).join(' / '));
console.log('fin shirt', T('ARS').fin.in.shirt);
`);
