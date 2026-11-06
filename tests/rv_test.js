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
// a big signing for the user
const star = Object.values(G.players).filter(p => p.c !== 'ARS' && T(p.c) && !T(p.c).lite && p.ca >= 88)[0];
completeTransfer(star, 'ARS', 120, 300, 5);
const ex = Object.values(G.players).find(p => p.c === 'TOT' && p.ca >= 80); completeTransfer(ex, 'ARS', 40, 150, 4);
let g = 0, errs = 0, chips = 0, goals = 0;
const t0 = Date.now();
while (G.hist.length < 1 && g++ < 30000) { try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); }
  if (G.date === sd('2026-10-05') && G.spon && G.spon.offers.length) { sponAccept(1); }
} catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); if (errs > 3) break; } }
for (const f of Object.values(G.fx)) for (const e of (f.gl || [])) {}
const all = G.feed.concat([]);
const pick = (re, n) => all.filter(p => re.test(p.t + ' ' + (p.rep || []).map(r => r.t).join(' '))).slice(0, n);
console.log('--- threads'); for (const p of pick(/115|Invincib|European Cups|Fergie|Spursy|Netflix|roubles|Judas|Rat |finished|Washed|cardio|Big Ears|Oil money|Ref Madrid/i, 12)) console.log('*', p.a, ':', p.t, ' || ', (p.rep || []).map(r => r.t).join(' || '));
console.log('--- pundit'); for (const p of all.filter(p => p.k === 'pun' && (p.rep||[]).some(r => /Ex-|Bias|scarf/.test(r.t))).slice(0, 2)) console.log('*', p.a, p.h, ':', p.t, ' || ', p.rep.map(r => r.t).join(' || '));
console.log('--- genz count', all.filter(p => / fr$| no cap| ngl|ykb|ikr|grandma/i.test(p.t + (p.rep||[]).map(r=>r.t).join(' '))).length, 'of', all.length);
console.log('--- news'); for (const n of G.news.filter(n => /Blockbuster|Arsenal: |Liverpool: |Chelsea: /.test(n.title)).slice(-3)) console.log('#', n.title, ':', n.body);
console.log('--- fin', JSON.stringify(Object.fromEntries(Object.entries(T('ARS').fin.in).map(([k,v]) => [k, +v.toFixed(1)]))), 'spon', G.spon && G.spon.cur.name, G.spon && G.spon.offers.length);
console.log('honours ARS', clubHonours('ARS').filter(h=>h.code==='GOLD').map(h=>h.label+' '+h.n).join(), '| gold', JSON.stringify(G.gold||[]));
console.log('errors', errs, 'secs', (Date.now()-t0)/1000);
`);
