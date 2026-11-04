// Title clinch announcements: once per league per season, never while someone can still catch the leader.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame(process.argv[2] || 'ARS', 'T');
let g = 0, errs = 0; const seen = {};
while (G.hist.length < 1 && g++ < 20000) { try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); }
  for (const div in (G.clinch || {})) if (!seen[div]) { seen[div] = 1; const tb = tableOf(div); const tot = leagueGames(div); const ok = !tb.slice(1).some(r => r.pts + 3 * (tot - r.p) >= tb[0].pts); console.log(G.date, div, tName(tb[0].t), tb[0].pts, 'v', tName(tb[1].t), tb[1].pts, '| played', tb[0].p + '/' + tot, '| valid', ok); } }
  catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 3).join(' | ')); break; } }
console.log('news', G.news.filter(n => / are champions$/.test(n.title)).map(n => n.d + ' ' + n.title).join(' / '));
console.log('inbox', G.news.filter(n => /CHAMPIONS!|Title race over/.test(n.title)).map(n => n.title).join(', '), '| WUPH posts', G.feed.filter(p => /CHAMPIONS|champions/.test(p.t)).length, '| trends', Object.keys(G.trend || {}).filter(k => /Champions/.test(k)).join(','), '| errors', errs);
`);
