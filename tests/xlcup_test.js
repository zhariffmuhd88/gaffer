// DFB-Pokal / Coupe de France: draw, screen, and an old save (no cups) migrating mid-season
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('BAY', 'T');
for (const c of ['DFB', 'CDF']) { const cup = G.cups[c]; console.log(c, cup.rounds.map(r => r.n + ' ' + r.d.join('&')).join(' / '), '| R1', cup.rounds[0].ties.map(t => t.t.map(x => tName(x)).join(' v ')).join(', '), '| byes', cup.byes.length); }
UI.tab.cp = 'DFB'; const h = scrComps(); console.log('screen ok', h.includes('DFB-Pokal'), h.includes('First round'));
UI.tab.cp = 'LC'; console.log('LC tab has DFB button', scrComps().includes('data-v="DFB"'));
// old save: drop the cups and jump to February
let g = 0; while (G.date < sd('2027-02-20') && g++ < 20000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } }
const snap = JSON.parse(JSON.stringify(G)); delete snap.cups.DFB; delete snap.cups.CDF; for (const id in snap.fx) if (['DFB','CDF'].includes(snap.fx[id].comp)) delete snap.fx[id];
restore(snap);
for (const c of ['DFB', 'CDF']) { const cup = G.cups[c]; console.log('migrated', c, 'ri', cup.ri, cup.rounds.map(r => r.n + ':' + r.ties.length + (r.done ? '✓' : '')).join(' ')); }
`);
