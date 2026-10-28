// ===== FIXTURE META: venue, kick-off, weather, referee, goal awards =====
const STANDS = {
  ARS: ['East Stand', 'West Stand', 'North Bank', 'Clock End'],
  AVL: ['Trinity Road Stand', 'Doug Ellis Stand', 'Holte End', 'North Stand'],
  LIV: ['Main Stand', 'Sir Kenny Dalglish Stand', 'The Kop', 'Anfield Road End'],
  MUN: ['Sir Alex Ferguson Stand', 'Sir Bobby Charlton Stand', 'Stretford End', 'East Stand'],
  MCI: ['Colin Bell Stand', 'East Stand', 'South Stand', 'North Stand'],
  CHE: ['West Stand', 'East Stand', 'Matthew Harding Stand', 'Shed End'],
  TOT: ['West Stand', 'East Stand', 'South Stand', 'North Stand'],
  NEW: ['Milburn Stand', 'East Stand', 'Gallowgate End', 'Leazes End'],
  LEE: ['John Charles Stand', 'East Stand', 'The Kop', 'South Stand'],
  NFO: ['Brian Clough Stand', 'Peter Taylor Stand', 'Trent End', 'Bridgford Stand'],
  CRY: ['Main Stand', 'Arthur Wait Stand', 'Holmesdale Road', 'Whitehorse Lane'],
  FUL: ['Johnny Haynes Stand', 'Riverside Stand', 'Hammersmith End', 'Putney End'],
  SUN: ['West Stand', 'East Stand', 'Roker End', 'North Stand'],
  BHA: ['West Stand', 'East Stand', 'North Stand', 'South Stand']
};
const STANDS_DEF = ['Main Stand', 'East Stand', 'North Stand', 'South Stand'];
const WX_TXT = { clear: 'Clear skies', cloud: 'Overcast', rain: 'Rain', snow: 'Snow' };
function venueOf(f) {
  if (f.neutral) {
    if (f.comp === 'LC' || f.comp === 'FA') return { name: 'Wembley Stadium', cap: 90000, neutral: true, stands: STANDS_DEF };
    return { name: 'Neutral final venue', cap: 65000, neutral: true, stands: STANDS_DEF };
  }
  const t = T(f.h) || {};
  return { name: t.stadium || 'Home ground', cap: t.cap || 20000, stands: STANDS[f.h] || STANDS_DEF };
}
function attendanceOf(f) {
  const v = venueOf(f); if (v.neutral) return Math.round(v.cap * .97);
  const t = T(f.h) || {}; const rep = t.rep || t.str || 60;
  if (divOf(f.h) === 'CH') return Math.round(v.cap * clamp(0.55 + rep / 250 + (LEAGUE_COMPS.includes(f.comp) ? 0 : -0.12), 0.4, 0.97));
  return Math.round(v.cap * clamp(0.8 + rep / 600 + (LEAGUE_COMPS.includes(f.comp) ? 0 : -0.08), 0.5, 1));
}
function fxMeta(f) {
  const h = hash(f.id + '|' + f.d + '|' + f.h);
  const m = +f.d.slice(5, 7), wd = dow(f.d);
  let ko;
  if (f.rnd === 'Final') ko = f.comp === 'FA' ? '15:00' : f.comp === 'LC' ? '16:30' : '20:00';
  else if (wd >= 2 && wd <= 4) ko = f.comp === 'PL' ? (h % 2 ? '19:30' : '20:00') : '20:00';
  else if (wd === 6) ko = ['12:30', '15:00', '15:00', '15:00', '17:30', '20:00'][h % 6];
  else if (wd === 0) ko = ['14:00', '14:00', '16:30'][h % 3];
  else ko = '20:00';
  const hr = +ko.slice(0, 2);
  const night = hr >= 19 || (hr >= 16 && (m >= 10 || m <= 3));
  const r = (h >>> 8) % 100;
  let wx;
  if (m === 12 || m <= 2) wx = r < 7 ? 'snow' : r < 37 ? 'rain' : r < 75 ? 'cloud' : 'clear';
  else if (m >= 10) wx = r < 35 ? 'rain' : r < 75 ? 'cloud' : 'clear';
  else if (m >= 7) wx = r < 15 ? 'rain' : r < 45 ? 'cloud' : 'clear';
  else wx = r < 25 ? 'rain' : r < 60 ? 'cloud' : 'clear';
  if (f.neutral && f.rnd === 'Final' && f.comp !== 'FA' && f.comp !== 'LC') wx = 'clear';
  const base = { 1: 5, 2: 6, 3: 9, 4: 12, 5: 16, 6: 19, 7: 21, 8: 21, 9: 18, 10: 13, 11: 9, 12: 6 }[m];
  const temp = base + ((h >>> 3) % 5) - 2 - (night ? 3 : 0) - (wx === 'snow' ? 4 : 0);
  const ref = { n: FIRST[(h >>> 5) % FIRST.length] + ' ' + LAST[(h >>> 11) % LAST.length], s: 4 + ((h >>> 4) % 14) };
  return { ko, night, wx, temp, ref };
}
function refDesc(s) { return s >= 14 ? 'strict' : s <= 7 ? 'lenient' : 'average'; }

// ---- goal awards ----
function goalCandidates(prefix) {
  const out = [];
  for (const f of Object.values(G.fx)) {
    if (!f.r || f.comp !== 'PL' || !f.d.startsWith(prefix) || !f.sc) continue;
    for (const s of f.sc) {
      if (s[2] !== 'G' || !s[5]) continue; const p = P(s[3]); if (!p) continue;
      out.push({ q: (STYLE_Q[s[5]] || 1) + (s[6] ? 2 : 0) + (hash(f.id + '|' + s[0]) % 100) / 100, pid: p.id, n: p.n, club: s[1] === 0 ? f.h : f.a, opp: s[1] === 0 ? f.a : f.h, st: s[5], sk: s[6] || null, d: f.d, min: s[0] });
    }
  }
  return out.sort((a, b) => b.q - a.q);
}
function goalOfMonth() {
  const d = dParse(G.date); d.setUTCMonth(d.getUTCMonth() - 1); const key = dStr(d).slice(0, 7);
  G.gotm = G.gotm || []; if (G.gotm.some(x => x.m === key)) return;
  const c = goalCandidates(key); if (!c.length) return;
  const w = c[0]; w.m = key; w.s = seasonLabel(G.year); G.gotm.push(w);
  news('Goal of the Month', `${w.n} (${tName(w.club)}) wins Goal of the Month for ${MON[+key.slice(5) - 1]} with his ${STYLE_N[w.st]}${w.sk ? ' after a ' + SKILLS[w.sk] : ''} against ${tName(w.opp)}.`, w.club, true);
  const p = P(w.pid); if (p && p.c === G.user) { p.mor = clamp(p.mor + 8, 5, 100); if (typeof setHap === 'function') setHap(p, 4); }
}
function goalOfSeason() { const list = (G.gotm || []).filter(x => x.s === seasonLabel(G.year)); return list.length ? list.slice().sort((a, b) => b.q - a.q)[0] : null; }
const _seasonEnd0 = seasonEnd;
seasonEnd = function () {
  const gos = goalOfSeason();
  _seasonEnd0();
  if (gos && G.hist.length) {
    G.hist[G.hist.length - 1].gos = [gos.n, tName(gos.club), STYLE_N[gos.st]];
    if (G.lastSeason) G.lastSeason.gos = gos;
    news('Goal of the Season', `${gos.n} (${tName(gos.club)}) wins Goal of the Season for his ${STYLE_N[gos.st]} against ${tName(gos.opp)}.`, gos.club, true);
  }
};
