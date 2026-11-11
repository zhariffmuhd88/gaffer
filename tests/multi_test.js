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
for (const n of ['Carabao Cup', 'FA Cup', 'Premier League', 'Champions League']) honour('ARS', n);
console.log(G.news.filter(n => /Double|Treble|Quadruple/.test(n.title)).map(n => n.title + ' :: ' + n.body).reverse().join('\\n'));
console.log('points rules:', fxHasPoints({ comp: 'PL' }), fxHasPoints({ comp: 'FA', rnd: 'Third round' }), fxHasPoints({ comp: 'UCL', rnd: 'Matchday 3' }), fxHasPoints({ comp: 'UCL', rnd: 'Round of 16' }), fxHasPoints({ comp: 'PSF' }));
// a real cup tie through the whole post-match pipeline: no league-points wording in the feed
const f = Object.values(G.fx).find(x => x.comp === 'FA' || x.comp === 'LC') || addFx({ comp: 'FA', d: G.date, h: 'ARS', a: 'TOT', rnd: 'Third round' });
f.h = 'ARS'; f.a = 'TOT'; const n0 = G.feedId || 0;
for (let k = 0; k < 25; k++) { f.r = k % 3 ? [2, 1] : [1, 1]; f.pen = k % 3 ? null : [4, 3]; f.rt = [[], []]; try { postMatch(f, preMatch(f)); } catch (e) { } }
const posts = G.feed.filter(p => p.id > n0); const bad = posts.filter(p => /three points|points dropped|drop points|the points/i.test(p.t + ' ' + (p.rep || []).map(r => r.t).join(' ')));
console.log('cup-tie posts', posts.length, 'with league-points wording', bad.length, bad.slice(0, 2).map(p => p.t).join(' | '));
`);
