// Old save without the Bundesliga, Ligue 1 and Saudi Pro League, loaded in December 2026.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('ARS', 'Old');
const nameOf = {}; for (const n in XL_LITE) if (!nameOf[XL_LITE[n]]) nameOf[XL_LITE[n]] = n;
const back = {}; for (const c in G.euro) for (const t of G.euro[c].teams) if (G.xl && Object.values(G.xl).some(l => l.includes(t))) { const n = nameOf[t]; back[t] = 'E_' + slug(n); addLite(back[t], n, 80); }
const sw = (x) => back[x] || x;
for (const f of Object.values(G.fx)) { f.h = sw(f.h); f.a = sw(f.a); }
for (const c in G.euro) G.euro[c].teams = G.euro[c].teams.map(sw);
const all = [].concat(...Object.values(G.xl));
for (const id of Object.keys(G.fx)) { const f = G.fx[id]; if (['BL', 'L1', 'SPL', 'DFB', 'CDF'].includes(f.comp)) { G.byDate[f.d] = G.byDate[f.d].filter(x => x !== id); delete G.fx[id]; } }
for (const id of all) { for (const pid of G.sq[id]) { const p = G.players[pid]; if (p.n === 'Harry Kane') { p.c = 'ABROAD'; p.ab = 'Bayern Munich'; } else delete G.players[pid]; } for (const pid of [].concat(G.res[id] || [], G.acad[id] || [])) delete G.players[pid]; delete G.res[id]; delete G.acad[id]; delete G.sq[id]; delete G.teams[id]; }
const sold = Object.values(G.players).find(p => p.n === 'Bruno Guimarães') || squad('NEW')[0]; G.sq[sold.c] = G.sq[sold.c].filter(x => x !== sold.id); sold.c = 'ABROAD'; sold.gone = 'Al-Hilal';
delete G.xl; delete G.xlL; delete G.cups.DFB; delete G.cups.CDF; for (const k of ['BLR', 'BLA', 'L1R', 'L1A', 'SPR', 'SPA']) delete G.yl[k];
for (const k in G.euroIn) G.euroIn[k] = G.euroIn[k].filter(t => !back[t]);
let g = 0; while (G.date < '2026-12-10' && g++ < 5000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } }
console.log('old save', G.date, '| xl', !!G.xl, '| E_ lites in UCL', G.euro.UCL.teams.filter(t => t.startsWith('E_')).length);
restore(JSON.parse(saveJSON(G)));
console.log('after load: clubs', XL_CODES.map(k => k + ' ' + G.xl[k].length).join(', '), '| PSG lite gone', !G.teams.E_ParisSG, '| UCL with BAY/PSG', G.euro.UCL.teams.filter(t => ['BAY', 'PSG', 'BVB'].includes(t)).join(','));
console.log('Kane', (P => P.c + ' copies ' + Object.values(G.players).filter(p => p.n === 'Harry Kane').length)(Object.values(G.players).find(p => p.n === 'Harry Kane')), '|', sold.n, Object.values(G.players).find(p => p.n === sold.n).c, '| BL table', xlTable('BL')[0].p, 'games', xlTable('BL').slice(0, 3).map(r => tName(r.t) + ' ' + r.pts).join(', '), '| msg', G.news[0].title);
let errs = 0; g = 0; while (G.date < '2027-06-30' && g++ < 9000) { let r; try { r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } } catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 3).join(' | ')); break; } }
console.log('season done', G.date, '| champions', XL_CODES.map(k => G.lastSeasonXL && G.lastSeasonXL[k] && tName(G.lastSeasonXL[k].champ)).join(', '), '| UCL winner', G.chist.length && G.chist[G.chist.length - 1].c.UCL && tName(G.chist[G.chist.length - 1].c.UCL.w), '| errors', errs);
`);
