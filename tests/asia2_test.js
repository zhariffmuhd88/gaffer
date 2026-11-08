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
console.log('AS_SEL squad', squad('AS_SEL').length, squad('AS_SEL').slice(0, 4).map(p => p.n + ' ' + p.pos + ' ' + p.age + ' ' + p.nat + ' ' + p.ca).join(' | '));
console.log('legends', G.sq.ARL.length, P(G.legXI[10]).n, P(G.legXI[10]).ca, 'natPool FRA has Henry?', natPool('FRA').some(p => p.leg));
clubModal('AS_JPN'); console.log('club modal JPN rows', (UI.modal.match(/data-a="player"/g) || []).length, UI.modal.includes('Hideo Oshima'));
clubModal('ARL'); console.log('club modal ARL rows', (UI.modal.match(/data-a="player"/g) || []).length);
playerModal(G.legXI[9]); console.log('legend modal note', UI.modal.includes('not available to sign'), 'sign btn', UI.modal.includes('signas'));
const tgt = squad('AS_JPN').find(p => p.n === 'Dean David'); playerModal(tgt.id); console.log('asia modal sign btn', UI.modal.includes('signas'), 'fee', asiaFee(tgt));
G.window = true; console.log('sign:', signAsia(tgt.id).msg, '| JPN squad now', squad('AS_JPN').length, '| in ARS', squad('ARS').some(p => p === tgt));
UI.filt = { lg: 'AS' }; UI.scr = 'transfers'; UI.tab.tr = 'search';
// friendly vs JPN with real players + legends match; then a full season to check nothing breaks
bookTour(['JPN'], psFree()[0]);
let g = 0, errs = 0;
const end = sd('2027-08-20');
while (G.date < end && g++ < 40000) { try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, true); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); if (f.comp === 'PSF' && (f.tour || f.leg)) console.log('  ', f.d, tName(f.h), f.r.join('-'), tName(f.a), '| rated', f.rt.map(x => x.length).join('/'), '| MoM', f.momN, '| scoreboard', [0, 1].map(i => M.ev.filter(e => e.t === 'goal' && e.side === i).map(e => surname(pnById(M, e.p)) + ' ' + e.min).join(', ')).join(' || ')); } } catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); if (errs > 3) break; } }
console.log('season 2 date', G.date, 'year', G.year, '| legends age', P(G.legXI[10]).age, P(G.legXI[10]).ca, '| JPN squad', squad('AS_JPN').length, '| errs', errs);
`);
