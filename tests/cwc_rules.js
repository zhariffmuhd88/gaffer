// Cup Winners' Cup entry rules over two seasons: a save that missed 2026/27 invites the 2026/27 cup winners in 2027/28.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('ARS', 'T'); const MISS = process.argv[2] === 'miss';
if (MISS) { delete G.cups.CWC; G.tasks = G.tasks.filter(t => t.t !== 'drawCWC'); }
let g = 0, errs = 0, shown = 0;
while (G.hist.length < 2 && g++ < 40000) { try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); }
  const c = G.cups.CWC; if (c && c.winner && shown < G.hist.length + 1) { shown = G.hist.length + 1; console.log(seasonLabel(G.year), G.date, 'CWC', c.ent.length, 'teams:', c.ent.map(([t, w, n, co]) => tName(t) + ' [' + n + ', ' + w + ', ' + co + ']').join('; '), '| byes', (c.byes||[]).map(t => tName(t)).join(','), '| rounds', c.rounds.map(r => r.n + ' ' + r.d.join('')).join(' / '), '| winner', tName(c.winner)); }
} catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 3).join(' | ')); break; } }
console.log('fair play', JSON.stringify((G.fpHist || []).map(x => Object.entries(x).map(([k, v]) => k + ':' + (k === 's' ? v : tName(v))).join(' '))), '| chist CWC', G.chist.map(r => r.s + ' ' + (r.c.CWC ? tName(r.c.CWC.w) : '-')).join(', '), '| errors', errs);
`);
