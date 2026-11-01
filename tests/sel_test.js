// Squad selection: best XI, rotation, youth XI (reserves/academy may start), saved tactics. node tests/sel_test.js
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('ARS', 'T');
const play = () => { let g = 0; while (g++ < 400) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); return f; } } };
const names = () => userTeam().tac.xi.map(id => surname(P(id).n) + (P(id).sq ? '*' : '') + ' ' + P(id).age).join(', ');
autoPick(G.user, true); const best = userTeam().tac.xi.slice(); console.log('best:', names());
let f = play(); console.log('played', tName(f.h), f.r.join('-'), tName(f.a));
console.log('conds', userTeam().tac.xi.map(id => Math.round(P(id).cond)).join(','), '| others', squad(G.user).filter(p => !best.includes(p.id)).slice(0, 8).map(p => Math.round(p.cond)).join(',')); pickRotation(G.user); const rot = userTeam().tac.xi; console.log('rotated:', names(), '| changes', rot.filter(x => !best.includes(x)).length);
console.log('save:', saveTacSet('Rotation') || 'ok');
const r = pickYouth(G.user); console.log('youth XI (pool ' + r.n + ', holes ' + r.holes + '):', names(), '| bench youth', userTeam().tac.bench.filter(id => P(id).sq).length);
console.log('issues after validate:', JSON.stringify(validateLineup(G.user)), '| still youth starters', userTeam().tac.xi.filter(id => P(id).sq).length);
f = play(); const side = f.rt[f.h === G.user ? 0 : 1]; console.log('youth match', tName(f.h), f.r.join('-'), tName(f.a), '| youth who played', side.filter(x => P(x[0]).sq).length, '| youth apps sample', side.filter(x => P(x[0]).sq).slice(0, 3).map(x => P(x[0]).n + ' ' + x[1]).join(', '));
console.log('save 2:', saveTacSet('Kids') || 'ok', '| sets', tacSets().map(s => s.n + ' ' + s.form).join(', '));
userTeam().tac.form = '3-5-2'; userTeam().tac.ment = 5;
console.log('load Rotation all:', loadTacSet(0, true) || 'ok', '| form', userTeam().tac.form, '| ment', userTeam().tac.ment, '| matches saved', userTeam().tac.xi.filter((x, i) => x === tacSets()[0].xi[i]).length);
console.log('load Kids tactics only:', loadTacSet(1, false) || 'ok');
console.log('html', scrTactics().includes('selbox'), '| save/restore', (() => { const j = saveJSON(G); restore(JSON.parse(j)); return tacSets().length; })());
`);
