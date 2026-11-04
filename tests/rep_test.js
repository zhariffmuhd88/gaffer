// Reports: assistant weekly report, scout monthly reports, happiness reasons over half a season.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; playerModal = () => {};
newGame(process.argv[2] || 'ARS', 'Tester');
let g = 0, errs = 0;
while (G.date < sd('2026-12-20') && g++ < 9000) { try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } } catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); break; } }
const r = G.asstRep; const nm = (xs) => (xs || []).map(([id, w]) => P(id).n + ' — ' + w).join('\\n   ');
console.log('ASSISTANT', r.by, r.d, '\\n sum:', r.sum, '\\n start:\\n   ' + nm(r.start), '\\n drop:\\n   ' + nm(r.drop), '\\n form:\\n   ' + nm(r.inForm), '\\n under:\\n   ' + nm(r.under), '\\n sell:\\n   ' + nm(r.sell));
console.log('inbox asst msgs', G.news.filter(n => n.title === 'Assistant manager report').length, '| scout msgs', G.news.filter(n => n.title === 'Scout reports').length);
for (const rp of G.scRep.reps) console.log('SCOUT', rp.n, rp.reg, rp.pref, rp.recs.map(x => P(x.pid).n + ' ' + P(x.pid).age + 'y ' + P(x.pid).ca + '/' + x.pot + ' ' + (P(x.pid).c === 'ABROAD' ? P(x.pid).gone : tName(P(x.pid).c)) + ' ' + money(x.fee)).join(' | '));
G.scouts[0].reg = 'L:SA'; G.scouts[0].pref = 'wonder'; G.scouts[1].reg = 'L:CH'; G.scouts[1].pref = 'stop'; G.scouts[1].pos = 'D'; scoutMonth(true);
for (const rp of G.scRep.reps.slice(0, 2)) console.log('SCOUT2', rp.n, rp.reg, rp.pref, rp.pos, rp.recs.map(x => P(x.pid).n + ' ' + P(x.pid).pos + ' ' + P(x.pid).age + 'y ' + P(x.pid).ca + '/' + x.pot + ' ' + money(x.fee)).join(' | '));
const sq = squad(G.user).sort((a, b) => hap(a) - hap(b));
for (const p of [sq[0], sq[1], sq[Math.floor(sq.length / 2)], sq[sq.length - 1]]) { const h = hapReasons(p); console.log('HAP', p.n, Math.round(hap(p)), '\\n  + ' + h.pos.join('\\n  + '), '\\n  - ' + h.neg.join('\\n  - ')); }
const p0 = sq[0]; talkTo(p0.id, 'praise'); console.log('after talk', JSON.stringify(p0.lt));
UI.tab.rep = 'as'; const a = scrReports(); UI.tab.rep = 'sc'; const b = scrReports(); console.log('screens', a.length, b.length, talkBlock(p0).includes('Happy about'), '| errors', errs);
`);
