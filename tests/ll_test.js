// Spain: two seasons with both leagues. Goal rates, promotions, cups, Spanish awards, cross-league transfers, save size.
// Run from the repo root: node tests/ll_test.js [CLUB] [SEASONS] [NAT]   (NAT = ESP to manage Spain alongside the club)
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
const CLUB = process.argv[2] || 'RSO', SEASONS = +(process.argv[3] || 2), NAT = process.argv[4] || '';
const t0 = Date.now();
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; playerModal = () => {};
newGame('${CLUB}', 'Tester');
console.log('user', G.user, divOf(G.user), '| LL clubs', G.ll.length, '| players', squad('RMA').length, '| Segunda', G.seg.length, '| PF', G.pf.length, '| play nat', PLAY_NAT, '| euroIn', JSON.stringify(G.euroIn));
console.log('LL fixtures', Object.values(G.fx).filter(f => f.comp === 'LL').length, '| UCL Spanish', G.euro.UCL.teams.filter(t => G.ll.includes(t)).join(','), '| Bellingham', (P => P && P.c + ' caps ' + P.ic)(Object.values(G.players).find(p => p.n === 'Jude Bellingham')), '| Pedri caps', Object.values(G.players).find(p => p.n === 'Pedri').ic, '| ESP pool', natPool('ESP').length);
console.log('youth', resSquad('RMA').length, acadSquad('RMA').length, resSquad('RMA').slice(0, 3).map(p => p.n + ' ' + p.nat).join(', '), '| comps', yCompOf('RMA', 'r'), yCompOf('RMA', 'a'));
if ('${NAT}') { setPlayNat('${NAT}'); G.intl.offer = true; console.log('take nat:', takeEngland('dual') || 'ok', G.intl.job, PLAY_NAT, ENGID); }
let guard = 0, seasons = 0, errs = 0; const tStart = Date.now();
const xfer0 = new Set(); for (const p of Object.values(G.players)) if (divOf(p.c)) xfer0.add(p.id + ':' + ctryOf(p.c));
while (guard++ < 80000 && seasons < ${SEASONS}) {
  let r;
  try { r = advance(); } catch (e) { errs++; console.log('ERR advance', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); break; }
  if (r.type === 'match') { try { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } catch (e) { errs++; console.log('ERR match', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); break; } }
  if (r.type === 'sacked') { const o = jobOffers(); console.log('sacked; offers', o.map(t => t + '(' + divOf(t) + ')').join(',')); if (o.length) takeJob(o[0]); else break; }
  if (G.intl && G.intl.job && G.intl.sqDue && !G.intl.sqDone && G.date >= addDays(G.intl.sqDue, -2)) confirmSquad(pickSquad(natPool(PLAY_NAT), 25).map(p => p.id));
  if (G.date === sd('2027-02-07')) { const c = G.cups.SCE; console.log('Supercopa', c.rounds.map(rd => rd.ties.map(t => tName(t.t[0]) + ' v ' + tName(t.t[1]) + ' ' + (G.fx[t.fx[0]].r || []).join('-') + (G.fx[t.fx[0]].pen ? ' p' + G.fx[t.fx[0]].pen.join('-') : '')).join(', ')).join(' / '), '| winner', c.winner && tName(c.winner)); }
  if (G.hist.length > seasons) {
    seasons = G.hist.length; const L = G.lastSeasonES || {};
    console.log('=== season', G.hist[seasons - 1].s, '| user pos', G.hist[seasons - 1].upos, G.hist[seasons - 1].div, '| sacked', G.sacked, '| now', G.date);
    console.log('LL top5', (L.lt || []).slice(0, 5).map(([t, p]) => tName(t) + ' ' + p).join(', '), '| down', (L.down || []).map(t => tName(t)).join(', '), '| up', (L.up || []).map(t => tName(t)).join(', '), '| CdR', L.cdr && tName(L.cdr));
    const ch = G.chist[G.chist.length - 1]; console.log('chist', Object.keys(ch.c).join(','), '| LL ts', JSON.stringify(ch.c.LL && ch.c.LL.ts), '| SCE', ch.c.SCE && ch.c.SCE.w);
    const A = G.awards.s.filter(x => x.lg === 'LL').pop(); console.log('LL awards', A && ('best ' + (A.best && A.best.n) + ' | Pichichi ' + (A.boot && A.boot.n + ' ' + A.boot.g) + ' | Zamora ' + (A.zam && A.zam.n + ' ' + A.zam.gpg) + ' | TOS ' + A.tos.length + ' | GOS ' + (A.gos && A.gos.n)));
    console.log('LL months', G.awards.m.filter(x => x.lg === 'LL').length, '| gotmLL', (G.gotmLL || []).length, '| next euro', JSON.stringify(G.euroIn), '| sce next', (G.sceTeams || []).map(t => tName(t)).join(','));
  }
}
const allF = Object.values(G.fx);
const gpg = (c) => { const fs2 = allF.filter(f => f.comp === c && f.r); return fs2.length ? (fs2.reduce((s, f) => s + f.r[0] + f.r[1], 0) / fs2.length).toFixed(2) + ' (' + fs2.length + ')' : '-'; };
console.log('goals per game this season: PL', gpg('PL'), '| CH', gpg('CH'), '| LL', gpg('LL'), '| CDR', gpg('CDR'));
let cross = 0; const ex = []; for (const p of Object.values(G.players)) if (divOf(p.c)) { const k = p.id + ':' + ctryOf(p.c); if (!xfer0.has(k) && [...['ENG', 'ESP']].some(c => xfer0.has(p.id + ':' + c))) { cross++; if (ex.length < 5) ex.push(p.n + ' -> ' + tName(p.c)); } }
console.log('cross-league moves', cross, ex.join('; '));
console.log('errors', errs, '| sim time', ((Date.now() - tStart) / 1000).toFixed(1) + 's');
console.log('screens', (UI.tab.tb = 'll', scrTable()).length, (UI.tab.tb = 'sd', scrTable()).length, (UI.tab.cp = 'CDR', scrComps()).length, (UI.tab.cp = 'SCE', scrComps()).length, (UI.tab.hist = 'LL', scrHistory()).length, (UI.tab.awl = 'LL', UI.tab.aw = 'season', scrAwards()).length);
const parts = {}; for (const k in G) parts[k] = saveJSON(G[k] === undefined ? null : G[k]).length; console.log('save parts KB', Object.entries(parts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + Math.round(v / 1024)).join(', '));
console.log('national team', PLAY_NAT, G.intl.job, '| games', engFixtures().filter(f => f.r).length, engFixtures().filter(f => f.r).slice(-4).map(f => tName(f.h) + ' ' + f.r.join('-') + ' ' + tName(f.a)).join(' | '), '| caps leaders', Object.values(G.players).filter(p => p.nat === 'ESP').sort((a, b) => (b.ic || 0) - (a.ic || 0)).slice(0, 3).map(p => p.n + ' ' + p.ic).join(', '));
const json = saveJSON(G); restore(JSON.parse(json)); const tz = Date.now(); const z = lzPack(json); const tz2 = Date.now(); const back = lzUnpack(z); console.log('save', Math.round(json.length / 1024) + ' KB JSON,', Math.round(z.length / 1024) + 'K chars compressed (' + (tz2 - tz) + ' ms, unpack ' + (Date.now() - tz2) + ' ms, round trip ' + (back === json) + ') | restore ok', G.ll.length);
`);
console.log('time', ((Date.now() - t0) / 1000).toFixed(1) + 's');
