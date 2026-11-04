// Italy: two seasons (adapted from ll_test.js) with both leagues. Goal rates, promotions, cups, Spanish awards, cross-league transfers, save size.
// Run from the repo root: node tests/ll_test.js [CLUB] [SEASONS] [NAT]   (NAT = ESP to manage Spain alongside the club)
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
const CLUB = process.argv[2] || 'LAZ', SEASONS = +(process.argv[3] || 2), NAT = process.argv[4] || '';
const t0 = Date.now();
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; playerModal = () => {};
newGame('${CLUB}', 'Tester');
console.log('user', G.user, divOf(G.user), '| SA clubs', G.sa.length, '| players', squad('INT').length, '| SB', G.sb.length, '| SC', G.sc.length, '| play nat', PLAY_NAT, '| euroIn', JSON.stringify(G.euroIn));
console.log('SA fixtures', Object.values(G.fx).filter(f => f.comp === 'SA').length, '| UCL Italian', G.euro.UCL.teams.filter(t => G.sa.includes(t)).join(','), '| UEL', G.euro.UEL.teams.filter(t => G.sa.includes(t)).join(','), '| lites left', Object.keys(G.teams).filter(k => /^E_(Inter|Juventus|Roma)/.test(k)).join(','), '| Chalobah', (P => P && P.c + ' caps ' + P.ic)(Object.values(G.players).find(p => p.n === 'Trevoh Chalobah')), '| Barella caps', Object.values(G.players).find(p => p.n === 'Nicolò Barella').ic, '| ITA pool', natPool('ITA').length, '| Josep', Object.values(G.players).filter(p => p.n === 'Josep Martínez').map(p => p.c).join(','));
console.log('CIT R1', G.cups.CIT.rounds[0].ties.length, G.cups.CIT.rounds[0].ties.slice(0,3).map(t => tName(t.t[0]) + ' v ' + tName(t.t[1])).join(', '), '| SCI', G.cups.SCI.rounds[0].ties.map(t => tName(t.t[0]) + ' v ' + tName(t.t[1]) + ' ' + G.fx[t.fx[0]].d).join(''));
console.log('youth', resSquad('INT').length, acadSquad('INT').length, resSquad('INT').slice(0, 3).map(p => p.n + ' ' + p.nat).join(', '), '| comps', yCompOf('INT', 'r'), yCompOf('INT', 'a'));
if ('${NAT}') { setPlayNat('${NAT}'); G.intl.offer = true; console.log('take nat:', takeEngland('dual') || 'ok', G.intl.job, PLAY_NAT, ENGID); }
let guard = 0, seasons = 0, errs = 0; const tStart = Date.now();
const xfer0 = new Set(); for (const p of Object.values(G.players)) if (divOf(p.c)) xfer0.add(p.id + ':' + ctryOf(p.c));
while (guard++ < 80000 && seasons < ${SEASONS}) {
  let r;
  try { r = advance(); } catch (e) { errs++; console.log('ERR advance', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); break; }
  if (r.type === 'match') { try { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } catch (e) { errs++; console.log('ERR match', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); break; } }
  if (r.type === 'sacked') { const o = jobOffers(); console.log('sacked; offers', o.map(t => t + '(' + divOf(t) + ')').join(',')); if (o.length) takeJob(o[0]); else break; }
  if (G.intl && G.intl.job && G.intl.sqDue && !G.intl.sqDone && G.date >= addDays(G.intl.sqDue, -2)) confirmSquad(pickSquad(natPool(PLAY_NAT), 25).map(p => p.id));
  if (G.date >= sd('2027-05-24') && !G._gp) { G._gp = 1; const fs3 = Object.values(G.fx); for (const c of ['PL','LL','SA']) { const x = fs3.filter(f => f.comp === c && f.r); console.log('gpg', c, (x.reduce((s, f) => s + f.r[0] + f.r[1], 0) / x.length).toFixed(2), x.length, '| home win %', Math.round(100*x.filter(f=>f.r[0]>f.r[1]).length/x.length)); } }
  if (G.date === sd('2027-05-14')) { const c = G.cups.CIT; console.log('Coppa', c.rounds.slice(3).map(rd => rd.n + ': ' + rd.ties.map(t => tName(t.t[0]) + ' v ' + tName(t.t[1]) + ' ' + t.fx.map(id => (G.fx[id].r || []).join('-')).join('/')).join(', ')).join(' / '), '| winner', c.winner && tName(c.winner), '| SCI', G.cups.SCI.winner && tName(G.cups.SCI.winner)); }
  if (G.date === sd('2027-02-07')) { const c = G.cups.SCE; console.log('Supercopa', c.rounds.map(rd => rd.ties.map(t => tName(t.t[0]) + ' v ' + tName(t.t[1]) + ' ' + (G.fx[t.fx[0]].r || []).join('-') + (G.fx[t.fx[0]].pen ? ' p' + G.fx[t.fx[0]].pen.join('-') : '')).join(', ')).join(' / '), '| winner', c.winner && tName(c.winner)); }
  if (G.hist.length > seasons) {
    seasons = G.hist.length; const L = G.lastSeasonIT || {};
    console.log('=== season', G.hist[seasons - 1].s, '| user pos', G.hist[seasons - 1].upos, G.hist[seasons - 1].div, '| sacked', G.sacked, '| now', G.date);
    console.log('SA top5', (L.lt || []).slice(0, 5).map(([t, p]) => tName(t) + ' ' + p).join(', '), '| down', (L.down || []).map(t => tName(t)).join(', '), '| up', (L.up || []).map(t => tName(t)).join(', '), '| CIT', L.cit && tName(L.cit), '| SB top', (L.sb||[]).slice(0,3).map(([t,p])=>tName(t)+' '+p).join(', '));
    const ch = G.chist[G.chist.length - 1]; console.log('chist', Object.keys(ch.c).join(','), '| SA ts', JSON.stringify(ch.c.SA && ch.c.SA.ts), '| SCI', ch.c.SCI && ch.c.SCI.w, '| CIT', ch.c.CIT && ch.c.CIT.w);
    const A = G.awards.s.filter(x => x.lg === 'SA').pop(); console.log('SA awards', A && ('best ' + (A.best && A.best.n) + ' | Pichichi ' + (A.boot && A.boot.n + ' ' + A.boot.g) + ' | Zamora ' + (A.zam && A.zam.n + ' ' + A.zam.gpg) + ' | TOS ' + A.tos.length + ' | GOS ' + (A.gos && A.gos.n)));
    console.log('SA months', G.awards.m.filter(x => x.lg === 'SA').length, '| gotmSA', (G.gotmSA || []).length, '| next euro', JSON.stringify(G.euroIn), '| sci next', (G.sciTeams || []).map(t => tName(t)).join(','), '| seeds', (G.citSeeds||[]).join(','));
  }
}
const allF = Object.values(G.fx);
const gpg = (c) => { const fs2 = allF.filter(f => f.comp === c && f.r); return fs2.length ? (fs2.reduce((s, f) => s + f.r[0] + f.r[1], 0) / fs2.length).toFixed(2) + ' (' + fs2.length + ')' : '-'; };
console.log('goals per game this season: PL', gpg('PL'), '| CH', gpg('CH'), '| LL', gpg('LL'), '| SA', gpg('SA'), '| CIT', gpg('CIT'));
let cross = 0; const ex = []; for (const p of Object.values(G.players)) if (divOf(p.c)) { const k = p.id + ':' + ctryOf(p.c); if (!xfer0.has(k) && [...['ENG', 'ESP', 'ITA']].some(c => xfer0.has(p.id + ':' + c))) { cross++; if (ex.length < 5) ex.push(p.n + ' -> ' + tName(p.c)); } }
console.log('cross-league moves', cross, ex.join('; '));
console.log('errors', errs, '| sim time', ((Date.now() - tStart) / 1000).toFixed(1) + 's');
console.log('screens', (UI.tab.tb = 'sa', scrTable()).length, (UI.tab.tb = 'sb', scrTable()).length, (UI.tab.tb = 'pl', scrTable()).includes('data-v="sa"'), (UI.tab.cp = 'CIT', scrComps()).length, (UI.tab.cp = 'SCI', scrComps()).length, (UI.tab.cp = 'UCL', scrComps()).includes('data-v="CIT"'), (UI.tab.hist = 'SA', scrHistory()).length, (UI.tab.hist = 'SCI', scrHistory()).length, (UI.tab.awl = 'SA', UI.tab.aw = 'season', scrAwards()).length);
const parts = {}; for (const k in G) parts[k] = saveJSON(G[k] === undefined ? null : G[k]).length; console.log('save parts KB', Object.entries(parts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + Math.round(v / 1024)).join(', '));
console.log('national team', PLAY_NAT, G.intl.job, '| games', engFixtures().filter(f => f.r).length, engFixtures().filter(f => f.r).slice(-4).map(f => tName(f.h) + ' ' + f.r.join('-') + ' ' + tName(f.a)).join(' | '), '| caps leaders', Object.values(G.players).filter(p => p.nat === PLAY_NAT).sort((a, b) => (b.ic || 0) - (a.ic || 0)).slice(0, 3).map(p => p.n + ' ' + p.ic).join(', '));
const json = saveJSON(G); restore(JSON.parse(json)); const tz = Date.now(); const z = lzPack(json); const tz2 = Date.now(); const back = lzUnpack(z); console.log('save', Math.round(json.length / 1024) + ' KB JSON,', Math.round(z.length / 1024) + 'K chars compressed (' + (tz2 - tz) + ' ms, unpack ' + (Date.now() - tz2) + ' ms, round trip ' + (back === json) + ') | restore ok', G.ll.length, G.sa.length);
`);
console.log('time', ((Date.now() - t0) / 1000).toFixed(1) + 's');
