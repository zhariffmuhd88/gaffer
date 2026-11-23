// Agreed transfers survive the window closing: terms can still be agreed and the move completes when the next window opens. node tests/deal_test.js
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; autosave = () => {}; const _r = render; render = () => {};
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
function playTo(pred) { let g = 0; while (!pred() && g++ < 300000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } if (G.sacked) { G.sacked = false; G.board = 60; } } }
newGame('ARS', 'T');
const p = Object.values(G.players).filter(q => q.c === 'AVL' && importance(q) !== 'key').sort((a, b) => b.ca - a.ca)[0];
T(G.user).tb = 300; T(G.user).wb = 99999;
const o = { id: 'oT1', pid: p.id, from: p.c, fee: 30, st: 'accepted', d: G.date, user: true, wage: Math.round(wageFor(p, G.user)) }; G.offers.push(o);
playTo(() => !G.window); console.log('window closed on', G.date, 'offer', o.st, G.offers.includes(o));
ok(G.offers.includes(o) && o.st === 'accepted', 'accepted deal kept when the window closes');
const r = offerTerms(o.id, o.wage, 4); console.log(r.msg); ok(r.ok && o.st === 'agreed' && p.c === 'AVL', 'terms agreed while closed, no move yet');
playTo(() => G.window); console.log('window open on', G.date, 'player now at', p.c, 'offer', o.st);
ok(p.c === G.user && o.st === 'done', 'move completes when the window opens');
console.log(fail ? 'DEAL FAIL ' + fail : 'DEAL OK'); if (fail) process.exit(1);
`);
