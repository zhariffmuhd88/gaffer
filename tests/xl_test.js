// Bundesliga, Ligue 1, Saudi Pro League: one or two seasons as a club in one of them.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame(process.argv[2] || 'BVB', 'T'); const SEASONS = +(process.argv[3] || 1);
console.log('user', G.user, divOf(G.user), ctryOf(G.user), '| XL', XL_CODES.map(k => k + ':' + G.xl[k].length + ' fx ' + Object.values(G.fx).filter(f => f.comp === k).length).join(' '), '| UCL XL', G.euro.UCL.teams.filter(t => divOf(t) && ['BL','L1'].includes(divOf(t))).join(','), '| lites left', Object.keys(G.teams).filter(k => /^E_(ParisSG|BayernMunich)/.test(k)).join(','));
console.log('Kane', (p => p.c)(Object.values(G.players).find(p => p.n === 'Harry Kane')), '| Kane copies', Object.values(G.players).filter(p => p.n === 'Harry Kane').length, '| Fabián Ruiz', Object.values(G.players).filter(p => p.n === 'Fabián Ruiz').map(p => p.c).join(','), '| GER pool', natPool('GER').length, '| youth BVB', resSquad('BVB').length, acadSquad('BVB').length, yCompOf('BVB','r'), '| sample youth name', (acadSquad('BVB')[0] || {}).n);
console.log('BL dates', Object.values(G.fx).filter(f => f.comp === 'BL').map(f => f.d).filter((d, i, a) => a.indexOf(d) === i).sort().join(' '));
let g = 0, errs = 0;
while (G.hist.length < SEASONS && g++ < 40000) { try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); }
  if (G.date >= sd('2027-05-30') && !G._gp) { G._gp = 1; for (const c of ['PL', 'LL', 'SA', 'BL', 'L1', 'SPL']) { const x = Object.values(G.fx).filter(f => f.comp === c && f.r); console.log('gpg', c, (x.reduce((s, f) => s + f.r[0] + f.r[1], 0) / x.length).toFixed(2), x.length); } for (const k of XL_CODES) { const t = xlTable(k); console.log(k, 'top', t.slice(0, 4).map(r => tName(r.t) + ' ' + r.pts).join(', '), '| bottom', t.slice(-2).map(r => tName(r.t) + ' ' + r.pts).join(', ')); } }
} catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); break; } }
console.log('next euroIn', JSON.stringify(G.euroIn), '| awards', G.awards.s.filter(x => ['BL','L1','SPL'].includes(x.lg)).map(x => x.lg + ' ' + (x.boot && x.boot.n)).join('; '), '| clinch', JSON.stringify(G.clinch), '| fair play', JSON.stringify(G.fp));
UI.tab.tb = 'xBL'; const h1 = scrTable(); UI.tab.tb = 'pl'; const h2 = scrTable(); UI.tab.awl = 'BL'; console.log('screens', h1.length, h2.includes('data-v="xSPL"'), (UI.tab.stl = 'SPL', scrStats()).length, '| errors', errs, '| save KB', Math.round(saveJSON(G).length / 1024));
`);
