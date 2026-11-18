// Career XP and rewards: XP from matches and seasons, unlocks, redeeming once per save, free signing. node tests/rewards_test.js
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
const _ls = {}; global.localStorage = { setItem(k, v) { _ls[k] = String(v); }, getItem(k) { return k in _ls ? _ls[k] : null; }, removeItem(k) { delete _ls[k]; } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; autosave = () => {}; const _r = render; render = () => {};
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
function playTo(pred) { let g = 0; while (!pred() && g++ < 300000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } if (G.sacked) { G.sacked = false; G.board = 60; } } }
newGame('ARS', 'T');
playTo(() => G.date >= '2026-10-01');
let c = career(); console.log('after Oct 1: xp', c.xp, 'games', c.games, 'wins', c.wins, 'draws', c.draws);
ok(c.games >= 5 && c.xp > 0, 'XP from matches');
ok(/Manager level/.test(scrRewards()) && /Locked/.test(scrRewards()), 'rewards screen');
ok(/Not unlocked/.test(rwRedeem('k200')), 'locked reward refused');
playTo(() => G.year > BASE_YEAR);
c = career(); console.log('after season 1: xp', c.xp, 'level', rwLevel(c.xp), 'seasons', c.seasons, 'trophies', c.trophies, 'log', JSON.stringify(c.log.slice(-4)));
ok(c.seasons === 1, 'one full season counted');
const tb0 = T(G.user).tb; console.log(rwRedeem('k20')); ok(Math.abs(T(G.user).tb - tb0 - 20) < .01, '£20m added'); ok(/Already/.test(rwRedeem('k20')), 'once per save');
ok(G.news.some(n => /Reward unlocked/.test(n.title)), 'unlock message');
// the same season cannot count twice (as if an older save were reloaded and replayed)
careerGain('s' + seasonLabel(G.year - 1), 'seasons', 500, 'dup'); ok(career().seasons === 1, 'no double counting');
// fast-forward the device record to 7 seasons and test the big rewards
c = career(); c.seasons = 7; c.xp = 13000; careerSave(c);
const tb1 = T(G.user).tb; console.log(rwRedeem('k200')); ok(Math.abs(T(G.user).tb - tb1 - 200) < .01, '£200m added');
console.log(rwRedeem('wonder')); const wk = Object.values(G.players).find(p => p.wk && p.c === G.user); ok(wk && wk.pa >= 89 && wk.age === 16, 'wonderkid'); console.log('wonderkid', wk && wk.n, wk && wk.pos, wk && wk.ca, wk && wk.pa);
ok(rwFreeTokens() === 0, 'no token before redeeming'); console.log(rwRedeem('free1')); ok(rwFreeTokens() === 1, 'token after redeeming');
const star = Object.values(G.players).filter(p => p.c === 'MCI').sort((a, b) => b.ca - a.ca)[0];
ok(/Sign for free/.test(playerExtra(star)), 'free signing button'); const bal = T(G.user).bal; console.log(rwSignFree(star.id));
console.log('chk', star.c, T(G.user).bal - bal, rwFreeTokens()); ok(star.c === G.user && T(G.user).bal >= bal - .01 && rwFreeTokens() === 0, 'signed for free'); ok(!/Sign for free/.test(playerExtra(squad('LIV')[0])), 'token used up');
// a new save keeps the device record but rewards are fresh
newGame('LIV', 'T'); ok(career().seasons === 7 && !rwUsed('k200') && /Redeem/.test(scrRewards()), 'new save: rewards redeemable again');
console.log(fail ? 'REWARDS FAIL ' + fail : 'REWARDS OK');
if (fail) process.exit(1);
`);
