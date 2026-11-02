// Media feed: fan reactions, rumours (some come true), insider posts, trophies. node tests/social_test.js [CLUB] [SEASONS]
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
const CLUB = process.argv[2] || 'ARS', SEAS = +(process.argv[3] || 1);
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('${CLUB}', 'T'); let g = 0, errs = 0;
while (g++ < 30000 && G.hist.length < ${SEAS}) { try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } if (r.type === 'sacked') { const o = jobOffers(); if (o.length) takeJob(o[0]); else break; } } catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); break; } }
const F = G.feed; const by = (k) => F.filter(p => p.k === k).length;
console.log('feed', F.length, '| fan', by('fan'), 'jour', by('jour'), 'club', by('club'), '| rumours', G.rum.length, 'closed', G.rum.filter(r => r.st !== 'open').length, 'came true', G.rum.filter(r => r.hit).length);
for (const j of JOURN) { const m = G.rum.filter(r => r.j === j.k && r.st !== 'open'); console.log('  ', j.n, 'T' + j.tier, m.filter(r => r.hit).length + '/' + m.length); }
console.log('fans', Math.round(G.fans), '| trending', Object.entries(G.trend || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]).join(' '));
console.log('sample:'); for (const p of F.slice(0, 12)) console.log('  [' + p.k + '] ' + p.a + ' ' + p.h + ': ' + p.t);
console.log('errors', errs, '| html', scrMedia().length, '| save KB', Math.round(saveJSON(G).length / 1024), 'feed KB', Math.round(JSON.stringify(G.feed).length / 1024));
`);
