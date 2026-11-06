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
for (const fla of [8, 12, 15, 18, 20]) { const p = Object.values(G.players)[0]; const e = { p: Object.assign({}, p) }; attrs = ((o) => (q) => q === e.p ? Object.assign({}, o(p), { Fla: fla, Dri: 12 }) : o(q))(attrs); let c = 0; for (let i = 0; i < 20000; i++) if (shotStyle(e, null, 'through', 'goal').st === 'chip') c++; console.log('flair', fla, 'chip share of through-ball goals', (c / 200).toFixed(1) + '%'); }
// real games: chip goals share
let g = 0, goals = 0, chips = 0; while (G.date < sd('2026-12-01') && g++ < 9000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, true); simulateFull(M); for (const v of M.com) { if (v.k === 'goal') { goals++; if (/chip/.test(v.text)) chips++; } } finalizeMatch(M); postMatch(f, pre); finishDay(); } }
console.log('user live games: goals', goals, 'chips', chips);
`);
