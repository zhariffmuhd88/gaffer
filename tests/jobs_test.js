// Manager options: job security, sackings, vacancies, applications and declared interest. node tests/jobs_test.js
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; autosave = () => {};
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
function playTo(pred) { let g = 0; while (!pred() && g++ < 200000) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } if (G.sacked) { G.sacked = false; G.board = 60; } } }
newGame('BRE', 'T');
playTo(() => G.date >= '2026-12-20');
const lv = {}; for (const t of jobClubs()) { if (t === G.user) continue; const l = secLv(msOf(t).s)[1]; lv[l] = (lv[l] || 0) + 1; }
console.log('security levels', JSON.stringify(lv));
const byLg = {}; for (const x of G.sackLog || []) byLg[x.lg] = (byLg[x.lg] || 0) + 1; console.log('sackings by Dec 20', JSON.stringify(byLg), (G.sackLog || []).slice(0, 4).map(x => x.n + ' (' + T(x.tid).name + ', ' + ordinal(x.pos) + ')').join('; '));
console.log('vacant', jobClubs().filter(isVac).map(t => T(t).name + ' [' + T(t).mgr + ']').join(', '));
const sec = scrJobs(); ok(/Job centre/.test(sec) && /Your job security/.test(sec), 'screen');
UI.tab.jb = 'sec'; ok(/Very secure|Secure|Stable/.test(scrJobs()), 'security tab'); UI.tab.jb = 'press'; ok(/Managers under pressure/.test(scrJobs()), 'pressure tab'); UI.tab.jb = 'centre';
// declare interest at a rival and at a bigger club
const b0 = G.board, f0 = G.fans ?? 60;
const hot = jobClubs().filter(t => t !== G.user && !isVac(t) && msOf(t).s < 45);
if (hot.length) { const t = hot[0]; console.log(declareInterest(t)); console.log('board', b0, '->', G.board, 'fans', f0, '->', G.fans, '| rival', isRival(G.user, t)); ok(G.board < b0, 'board reacts'); }
const rv = RIVALS.filter(r => r.includes('BRE')).map(r => r[0] === 'BRE' ? r[1] : r[0])[0];
if (rv) { msOf(rv).s = 20; const b1 = G.board; console.log(declareInterest(rv)); console.log('rival interest: board', b1, '->', G.board, 'fans ->', G.fans); }
// apply for a vacancy (force one if none)
let v = jobClubs().find(t => isVac(t) && t !== G.user); if (!v) { v = jobClubs().find(t => t !== G.user && divOf(t) === 'LO'); sackAI(v, 'Test.'); }
G.mgrRep = 80; console.log(applyJob(v)); const until = addDays(G.date, 12); playTo(() => G.date >= until);
const off = (G.joff || []).find(o => o.tid === v); console.log('offer from', T(v).name, !!off, G.news.filter(n => n.act && n.act.k === 'job').map(n => n.title).join(' | '));
if (off) { const old = G.user; console.log(acceptJob(v)); ok(G.user === v && T(v).mgr === G.mgr, 'took the job'); ok(isVac(old) && /caretaker/.test(T(old).mgr), 'old club has a caretaker'); }
playTo(() => G.year > BASE_YEAR);
const tot = {}; for (const x of G.sackLog || []) tot[x.lg] = (tot[x.lg] || 0) + 1; console.log('sackings in the season', JSON.stringify(tot), 'total', (G.sackLog || []).length);
console.log(fail ? 'FAIL ' + fail : 'OK');
`);
