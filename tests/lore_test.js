// Player history, club lore, manager profiles, WFF storyline, Behind the Badge episodes, Ballon d'Or votes. node tests/lore_test.js
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
newGame('ARS', 'T'); docStart();
playTo(() => G.date >= '2027-01-10');
const saka = squad('ARS').find(p => p.n === 'Bukayo Saka') || squad('ARS')[0];
const ph = playerExtra(saka); ok(/<h2 class="sect">History<\\/h2>/.test(ph) && /Likes and dislikes/.test(ph), 'player history + likes'); console.log('rows', JSON.stringify(seasonRows(saka)), '| likes', JSON.stringify(playerLikes(saka)));
clubModal('ARS'); ok(/Club lore/.test(UI.modal) && /Thierry Henry/.test(UI.modal) && /Robin van Persie/.test(UI.modal), 'Arsenal lore'); UI.modal = null;
clubModal('CHE'); ok(/data-a="mgrp"/.test(UI.modal), 'manager link in club page'); UI.modal = null;
const mp = mgrProfileHtml(T('MCI').mgr); ok(/Playing career/.test(mp), 'manager profile'); console.log('MCI manager', T('MCI').mgr, /Barcelona/.test(mp) ? '(career known)' : '');
console.log('WFF log', wff().log.map(x => x[0] + ' ' + x[1]).join(' | '));
ok(wff().log.length >= 2, 'WFF storyline started'); ok(/World Football Federation/.test(scrWFF()), 'WFF screen');
wffEndorse('ch');
console.log('doc episodes', (G.doc.eps || []).length, G.doc.eps && G.doc.eps[0] ? G.doc.eps[0].title + ' — ' + G.doc.eps[0].summary : '');
ok((G.doc.eps || []).length >= 1, 'episodes'); if (G.doc.eps && G.doc.eps[0]) { const h = docEpHtml(0); ok(/Quotes/.test(h) && /Talking point/.test(h), 'episode page'); console.log(G.doc.eps[0].scenes.map(s => s[0] + ': ' + s[1]).join('\\n'), '\\nQUOTES', G.doc.eps[0].quotes.map(q => q[0] + ' (' + q[1] + '): ' + q[2]).join('\\n')); }
playTo(() => G.year > BASE_YEAR);
ok(G.bdo && G.bdo.list.length === 30, 'shortlist'); console.log('shortlist top', G.bdo.list.slice(0, 5).map(x => P(x[0]).n + ' ' + x[1]).join(', '));
ok(saka.sh && saka.sh.length >= 1, 'season row saved'); console.log('saka sh', JSON.stringify(saka.sh));
console.log('WFF pres', wff().pres, JSON.stringify(wff().res), 'rule', JSON.stringify(G.rules));
ok(wff().pres === WFF.ch.n && G.rules && G.rules.dl, 'challenger wins + law');
G.bdo.uv = G.bdo.list.slice(0, 5).map(x => x[0]).reverse();
playTo(() => G.date >= G.bdo.due && G.bdo.done);
ok(G.bdo.res && G.bdo.res.length === 10, 'ceremony'); console.log('Ballon d Or', G.bdo.res.slice(0, 3).map(x => P(x[0]).n + ' ' + x[1]).join(', '), 'voters', G.bdo.voters);
ok(/Ballon/.test(bdoResHtml()) && /your vote/.test(bdoVoteHtml()), 'bdo pages');
console.log('mrec ARS mgr', JSON.stringify((G.mrec[G.mgr] || []).slice(0, 2)), 'mh sample', Object.keys(G.mh || {}).length);
console.log(fail ? 'FAIL ' + fail : 'OK');
`);
