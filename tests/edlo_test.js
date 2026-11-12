// League One / Eredivisie / Netherlands checks. node tests/edlo_test.js [OLD_SAVE.json]
// 1) new game at a League One club: leagues, fixtures, no team-level duplicates, a full season with promotion/relegation;
// 2) optional: an older save (made by the previous version) migrates and keeps playing.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
global.OLD = process.argv[2] ? fs.readFileSync(process.argv[2], 'utf8') : null;
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; autosave = () => {};
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
function playTo(pred, lim) { let g = 0; while (!pred() && g++ < (lim || 200000)) { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } if (G.sacked) return 'sacked'; } }
function check(tag) {
  const lo = G.xl.LO, ed = G.xl.ED;
  ok(lo.length === 24, tag + ' LO 24 got ' + lo.length); ok(ed.length === 18, tag + ' ED 18');
  ok(lo.every(t => T(t) && !T(t).lite && squad(t).length >= 16), tag + ' LO squads');
  ok(!lo.some(t => G.champTeams.includes(t) || G.pl.includes(t)), tag + ' LO overlap');
  ok(!G.lowerTeams.some(t => G.champTeams.includes(t) || G.pl.includes(t)), tag + ' lowerTeams overlap');
  const names = Object.values(G.teams).filter(t => !t.nat).map(t => t.name); const d = names.filter((n, i) => names.indexOf(n) !== i); ok(!d.length, tag + ' duplicate club names ' + d.join(','));
  ok(divTeams('CH').length === 24, tag + ' CH 24 got ' + divTeams('CH').length);
  console.log(tag, 'LO', lo.map(t => T(t).short).join(', '));
}
if (!OLD) {
  newGame('LEI', 'T');
  check('start');
  ok(divOf('LEI') === 'LO' && ctryOf('LEI') === 'ENG', 'LEI division');
  ok(['PSV', 'AJX', 'FEY'].every(t => G.euroIn.UCL.includes(t)), 'Dutch UCL entrants');
  ok(T(NID('NED')).mgr === 'Xavi Hernández', 'NED coach');
  ok(PLAYABLE_NATS.includes('NED') && natPool('NED').some(p => p.n === 'Memphis Depay' && p.ic > 100), 'NED pool');
  const ch0 = G.champTeams.slice();
  const r = playTo(() => G.year > BASE_YEAR);
  const L = G.lastLO; console.log('season 1:', r || '', 'LO champions', tName(L.champ), '| up', L.prom.map(t => tName(t)).join(', '), '| down', L.down.map(t => tName(t)).join(', '), '| from L2', L.up.map(t => tName(t)).join(', '));
  check('season2');
  const chRel = ch0.filter(t => !G.champTeams.includes(t) && !G.pl.includes(t)); console.log('relegated from CH:', chRel.map(t => tName(t) + '(' + squad(t).length + ')').join(', '));
  ok(chRel.length === 3 && chRel.every(t => G.xl.LO.includes(t) && !T(t).lite), 'CH relegated clubs in League One with squads');
  ok(L.prom.every(t => G.champTeams.includes(t) && !T(t).lite && squad(t).length >= 16), 'LO promoted clubs in the Championship');
  ok(L.down.every(t => T(t).lite && !G.xl.LO.includes(t)), 'LO relegated clubs to League Two');
  ok(G.lastLO && G.lastLO.s === seasonLabel(BASE_YEAR), 'League One season record');
  ok(tableOf('LO').length === 24 && [].concat(...G.xlL.LO.rounds).length === 552, 'next season LO fixtures');
  const h = G.hist[G.hist.length - 1]; console.log('history row div', h.div, 'pos', h.upos, '| verdict', G.lastSeason.verdict);
} else {
  const sv = JSON.parse(OLD.startsWith(LZ_TAG) ? lzUnpack(OLD) : OLD); restore(sv);
  render(); // migration also runs on render
  check('migrated');
  ok(G.news.some(n => n.title === 'New leagues'), 'migration message');
  ok(G.intl.ned === 1, 'NED pool added');
  const pre = G.date; const r = playTo(() => G.date >= addDays(pre, 60));
  console.log('played on to', G.date, r || '');
  check('after 60 days');
  const lo = [].concat(...G.xlL.LO.rounds).map(id => G.fx[id]); console.log('LO played', lo.filter(f => f.r).length, '/', lo.length);
}
console.log(fail ? 'FAIL ' + fail : 'OK');
`);
