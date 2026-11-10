// DFB-Pokal / Coupe de France: draw, screen, and an old save (no cups) migrating mid-season
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
// 10-season calibration run: node tests/calib.js [seasons] [userClub] > out.json-ish text
global.NS = +(process.argv[2] || 10); global.UC = process.argv[3] || 'BRE';
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; autosave = () => {};
const BIG = { PL: ['ARS','MCI','LIV','CHE','MUN','TOT','NEW'], LL: ['RMA','BAR','ATM'], SA: ['INT','ACM','JUV','NAP'], BL: ['BAY','BVB','B04','RBL'], L1: ['PSG','OM','ASM'], SPL: ['HIL','NAS','ITT','AHL'], CH: [] };
const LGS = ['PL','CH','LL','SA','BL','L1','SPL'];
const CUPS = ['FA','LC','CDR','CIT','DFB','CDF'];
const out = { seasons: [] };
function tier(t) { const d = divOf(t); return ['PL','LL','SA','BL','L1','SPL'].includes(d) ? 1 : d === 'CH' ? 2 : 3; }
const _se = seasonEnd;
seasonEnd = function () {
  const S = { y: seasonLabel(G.year), lg: {}, cups: {}, intl: {} };
  const fx = Object.values(G.fx).filter(f => f.r);
  for (const k of LGS) {
    const fs_ = fx.filter(f => f.comp === k); if (!fs_.length) continue;
    let g = 0, hw = 0, big5 = 0; for (const f of fs_) { g += f.r[0] + f.r[1]; if (f.r[0] > f.r[1]) hw++; if (Math.abs(f.r[0] - f.r[1]) >= 5) big5++; }
    let tb; try { tb = k === 'PL' ? leagueTable() : tableOf(k); } catch (e) { tb = null; }
    const ch = tb && tb[0] ? tb[0].t : null;
    S.lg[k] = { n: fs_.length, gpg: g / fs_.length, home: hw / fs_.length, m5: big5 / fs_.length, ch, chPts: tb && tb[0] ? tb[0].pts : 0, out: ch && BIG[k].length ? !BIG[k].includes(ch) : null };
  }
  for (const c of CUPS) {
    const fs_ = fx.filter(f => f.comp === c); let ups = 0, mix = 0;
    for (const f of fs_) { const th = tier(f.h), ta = tier(f.a); if (th === ta) continue; mix++; const w = typeof tieWinnerOf === 'function' ? null : null; const hw = f.r[0] > f.r[1] || (f.r[0] === f.r[1] && f.pen && f.pen[0] > f.pen[1]); const winner = hw ? f.h : f.a; if (tier(winner) > Math.min(th, ta)) ups++; }
    S.cups[c] = { w: G.cups[c] && G.cups[c].winner, ups, mix };
  }
  const ifx = fx.filter(f => isIntlF(f)); let m5 = 0, maxm = 0, ex = '';
  for (const f of ifx) { const m = Math.abs(f.r[0] - f.r[1]); if (m >= 5) m5++; if (m > maxm) { maxm = m; ex = f.h + ' ' + f.r.join('-') + ' ' + f.a; } }
  S.intl = { n: ifx.length, m5, maxm, ex, gpg: ifx.reduce((s, f) => s + f.r[0] + f.r[1], 0) / Math.max(1, ifx.length) };
  out.seasons.push(S);
  console.log('SEASON', S.y, JSON.stringify(Object.fromEntries(Object.entries(S.lg).map(([k, v]) => [k, v.ch + ' ' + v.gpg.toFixed(2)]))), 'intl5+', m5 + '/' + ifx.length, ex, '| t', ((Date.now() - T0) / 1000).toFixed(0));
  return _se.apply(this, arguments);
};
const T0 = Date.now();
newGame(UC, 'Calib');
let g = 0, errs = 0;
while (out.seasons.length < NS && g++ < 400000) {
  try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); } }
  catch (e) { errs++; console.log('ERR', G.date, 'leg:', (G.legXI || []).concat(G.legSubs || []).map(id => P(id) ? P(id).c + ':' + P(id).n.split(' ').pop() : 'X:' + id).join(' '), (G.byDate[G.date] || []).map(id => G.fx[id]).filter(f => f.h === G.user || f.a === G.user).map(f => f.h + '-' + f.a + ':' + f.comp).join(','), e.stack.split('\\n').slice(0, 3).join(' | ')); if (errs > 5) break; }
  if (G.sacked) { G.sacked = false; }
  // the calibration club is run like an AI club in the windows, so its squad does not wither
  if (G.window && squad(G.user).length < 24 && G.date.slice(8) === '15') try { for (let k = 0; k < 4; k++) aiRecruit(G.user); } catch (e) { }
}
// summary
const sum = {};
for (const k of LGS) {
  const ss = out.seasons.map(s => s.lg[k]).filter(Boolean); if (!ss.length) continue;
  const chs = {}; for (const s of ss) chs[s.ch] = (chs[s.ch] || 0) + 1;
  sum[k] = { gpg: (ss.reduce((a, s) => a + s.gpg, 0) / ss.length).toFixed(2), home: (100 * ss.reduce((a, s) => a + s.home, 0) / ss.length).toFixed(0) + '%', m5: (100 * ss.reduce((a, s) => a + s.m5, 0) / ss.length).toFixed(1) + '%', outsiders: ss.filter(s => s.out).length + '/' + ss.length, champs: Object.entries(chs).sort((a, b) => b[1] - a[1]).map(([t, n]) => t + '×' + n).join(' '), pts: (ss.reduce((a, s) => a + s.chPts, 0) / ss.length).toFixed(0) };
}
const cu = {}; for (const c of CUPS) { const ss = out.seasons.map(s => s.cups[c]).filter(Boolean); const u = ss.reduce((a, s) => a + s.ups, 0), m = ss.reduce((a, s) => a + s.mix, 0); cu[c] = { upsets: m ? (100 * u / m).toFixed(0) + '% (' + u + '/' + m + ')' : '-', winners: ss.map(s => s.w).join(' ') }; }
const it = out.seasons.map(s => s.intl); const im = it.reduce((a, s) => a + s.n, 0);
console.log('SUMMARY', JSON.stringify({ leagues: sum, cups: cu, intl: { matches: im, m5: (100 * it.reduce((a, s) => a + s.m5, 0) / Math.max(1, im)).toFixed(1) + '%', gpg: (it.reduce((a, s) => a + s.gpg * s.n, 0) / Math.max(1, im)).toFixed(2), worst: it.sort((a, b) => b.maxm - a.maxm).slice(0, 3).map(s => s.ex) }, errs, secs: ((Date.now() - T0) / 1000).toFixed(0), saveKB: (JSON.stringify(G).length / 1024).toFixed(0) }, null, 1));
`);
