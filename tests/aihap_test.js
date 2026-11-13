// Happiness with reasons for players at AI clubs (and reasons for your own). node tests/aihap_test.js
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; autosave = () => {};
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
newGame('ARS', 'T');
let g = 0; while (G.date < '2026-12-15' && g++ < 200000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } if (G.sacked) G.sacked = false; }
const ai = Object.values(G.players).filter(p => p.c !== G.user && T(p.c) && !T(p.c).lite && !T(p.c).nat && !p.loan);
const lv = {}; for (const p of ai) { const l = hapLabel(hap(p)); lv[l] = (lv[l] || 0) + 1; } console.log('AI happiness', JSON.stringify(lv));
console.log('with reasons', ai.filter(p => p.hr && p.hr.length).length, '/', ai.length); ok(ai.filter(p => p.hr && p.hr.length).length > ai.length * .3, 'reasons for most AI players');
const cnt = {}; for (const p of ai) for (const x of p.hr || []) { const t = hrText(p, x); { const k = t.replace(/\\(.*\\)|[A-Z][a-zé]+( [A-Z][a-zé]+)*'s|new manager .*|in [A-Z].*|faith in .*|about .*'s methods|in .*'s project/g, '…'); cnt[k] = (cnt[k] || 0) + 1; } }
console.log(Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 18).map(x => x[1] + ' ' + x[0]).join('\\n'));
const sad = ai.filter(p => p.ca >= 78).sort((a, b) => hap(a) - hap(b)).slice(0, 3); for (const p of sad) console.log('UNHAPPY', p.n, T(p.c).short, Math.round(hap(p)), JSON.stringify((p.hr || []).map(x => x[0] + ' ' + hrText(p, x))));
const glad = ai.filter(p => p.ca >= 78).sort((a, b) => hap(b) - hap(a)).slice(0, 2); for (const p of glad) console.log('HAPPY', p.n, T(p.c).short, Math.round(hap(p)), JSON.stringify((p.hr || []).map(x => x[0] + ' ' + hrText(p, x))));
const html = playerExtra(sad[0]);  const ry = squad('ARS').find(p => p.n === 'David Raya'); console.log('Raya', JSON.stringify(ry.st), squadStatus(ry), 'games', Object.values(G.fx).filter(f => f.r && (f.h === 'ARS' || f.a === 'ARS') && f.d >= sd('2026-07-20') && f.comp !== 'PSF').length, 'inj', ry.inj); ok(/Happy about/.test(html) && /Bothered by/.test(html), 'player card');

const p0 = sad[0]; const a1 = askingPrice(p0); p0.hap = 70; const a2 = askingPrice(p0); console.log('asking price unsettled', a1, 'vs settled', a2); ok(a1 < a2, 'unsettled cheaper');
console.log(fail ? 'FAIL ' + fail : 'OK');
`);
