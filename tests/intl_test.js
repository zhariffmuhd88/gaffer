// International cycle: Nations League, Euro 2028 qualifying + finals, Nations League 2028/29, World Cup 2030 qualifying + finals.
// Run from the repo root: node tests/intl_test.js [MODE club|nat|dual] [CLUB] [SEASONS]
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
const MODE = process.argv[2] || 'dual', CLUB = process.argv[3] || 'ARS', SEASONS = +(process.argv[4] || 4);
const t0 = Date.now();
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;globalThis.DBG = 1; toast = (m) => {}; render = () => {}; playerModal = () => {};
newGame('${CLUB}', 'Tester');
if ('${MODE}' !== 'club') { G.intl.offer = true; console.log('take job:', takeEngland('${MODE}') || 'ok', '| user', G.user, '| mode', G.intl.mode); }
console.log('nations', Object.values(G.teams).filter(t => t.nat).length, '| England pool', natPool('ENG').length, '| Kane caps', Object.values(G.players).find(p => p.n === 'Harry Kane').ic, '| UNL fixtures', Object.values(G.fx).filter(f => f.comp === 'UNL').length);
console.log('England str (AI)', T(ENGID).str, '| top ranks', natRankList().slice(0, 6).join(','));
let guard = 0, seasons = 0, swaps = 0, lastSw = 0, engPlayed = 0, errs = 0;
const seen = new Set();
while (guard++ < 80000 && seasons < ${SEASONS}) {
  let r;
  try { r = advance(); } catch (e) { errs++; console.log('ERR advance', e.stack.split('\\n').slice(0, 3).join(' | ')); break; }
  if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); if (isIntlF(f)) engPlayed++; }
  if (r.type === 'sacked') { const o = jobOffers(); if (o.length) takeJob(o[0]); else { console.log('sacked, no offers'); break; } }
  if (globalThis.DBG && (G.date === '2028-05-01' || G.date === '2028-06-20')) { const E = G.intl.ed.EURO28; console.log('DBG', G.date, 'seasonEnd task', (G.tasks.find(t => t.t === 'seasonEnd') || {}).d, '| euro played', E ? edFx(E).filter(id => G.fx[id] && G.fx[id].r).length + '/' + edFx(E).length : '-', '| missing', E ? edFx(E).filter(id => !G.fx[id]).length : '-'); }
  if (G.intl.sw !== lastSw) { if (G.intl.sw) swaps++; lastSw = G.intl.sw; }
  if (G.intl.job && G.intl.sqDue && !G.intl.sqDone && G.date >= addDays(G.intl.sqDue, -2)) confirmSquad(pickSquad(natPool('ENG'), 25).map(p => p.id));
  for (const k of G.intl.order) { const E = G.intl.ed[k]; const tag = k + E.stage; if (!seen.has(tag)) { seen.add(tag); console.log(G.date, k, E.stage, E.fin ? 'winner ' + tName(E.fin[0]) + ' (ru ' + tName(E.fin[1]) + ')' : '', E.qual ? 'qualified ' + E.qual.length + (E.qual.includes(ENGID) ? ' incl ENG' : ' no ENG') : '', '| England:', engStage(E) || '-'); } }
  if (G.hist.length > seasons) { seasons = G.hist.length; console.log('=== season end', G.hist[seasons - 1].s, 'team', G.hist[seasons - 1].team, 'pos', G.hist[seasons - 1].upos, '| date now', G.date, '| user', G.user, '| sacked', G.sacked); }
}
console.log('swaps', swaps, '| England matches played by user', engPlayed, '| errors', errs);
console.log('intl hist:', G.intl.hist.map(h => h.name + ': ' + (h.w ? tName(h.w) : h.eng)).join(' | '));
const top = Object.values(G.players).filter(p => p.nat === 'ENG').sort((a, b) => (b.ic || 0) - (a.ic || 0)).slice(0, 5);
console.log('England caps leaders:', top.map(p => p.n + ' ' + p.ic + '/' + (p.ig || 0)).join(', '));
const fra = Object.values(G.players).filter(p => p.nat === 'FRA' && p.ic).sort((a, b) => b.ic - a.ic).slice(0, 3);
console.log('France caps (DB players):', fra.map(p => p.n + ' ' + p.ic + '/' + (p.ig || 0)).join(', '));
console.log('ranking top 8:', natRankList().slice(0, 8).map(c => c + ' ' + G.intl.elo[c]).join(', '), '| England', natRank('ENG'));
console.log('FA', Math.round(G.intl.fa), '| mgr rec:', G.mgrP ? G.mgrP.rec.map(s => tName(s.tid) + ' ' + s.p + ' ' + (s.tro.join('/') || '-') + (s.to ? '' : ' (open)')).join(' | ') : '-');
const me = rankList('all').find(x => x.me); console.log('user rank all-time', me.rk, me.pts, me.club.txt);
console.log('screens', scrIntl().length, (UI.tab.int = 'comp', scrIntl()).length, (UI.tab.int = 'rec', scrIntl()).length, (UI.tab.int = 'hist', scrIntl()).length, (UI.tab.int = 'rank', scrIntl()).length, (UI.tab.int = 'sq', scrIntl()).length);
const json = saveJSON(G); restore(JSON.parse(json)); console.log('save', Math.round(json.length / 1024) + ' KB', '| restore ok', !!G.intl.ed.UNL27);
`);
console.log('time', ((Date.now() - t0) / 1000).toFixed(1) + 's');
