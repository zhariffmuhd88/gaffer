// preseason.js: pre-season friendlies. Loaded after rivalry.js.
//  - The manager arranges friendlies (date, opponent, home or away), or lets the assistant do it.
//  - Asia Tour: up to four stops from Selangor, Japan, Singapore, Hong Kong and China. Each stop pays an appearance
//    fee and raises the club's reputation, fan mood and commercial income for the season.
//  - Every pre-season: Arsenal Legends (prime-years ratings, game estimates). The first XI plays the first half and
//    the eleven substitutes play the second half.
// Friendlies do not count towards player stats, cards, form or the board's confidence.
COMP_NAME.PSF = 'Pre-season friendly'; COMP_SHORT.PSF = 'FRN';
const PS_DATES = ['2026-07-04', '2026-07-08', '2026-07-11', '2026-07-15', '2026-07-18', '2026-07-22', '2026-07-25', '2026-07-29', '2026-08-01', '2026-08-05', '2026-08-08', '2026-08-12', '2026-08-15', '2026-08-18'];
const ASIA = {
  SEL: { c: 'Malaysia', n: 'Selangor FC', str: 64, ven: 'MBPJ Stadium, Petaling Jaya', cap: 25000, f: .9, flag: '🇲🇾' },
  JPN: { c: 'Japan', n: 'Yokohama F. Marinos', str: 70, ven: 'Nissan Stadium, Yokohama', cap: 72000, f: 1.2, flag: '🇯🇵' },
  SGP: { c: 'Singapore', n: 'Lion City Sailors', str: 62, ven: 'National Stadium, Singapore', cap: 55000, f: 1, flag: '🇸🇬' },
  HKG: { c: 'Hong Kong', n: 'Kitchee', str: 60, ven: 'Kai Tak Stadium, Hong Kong', cap: 50000, f: 1, flag: '🇭🇰' },
  CHN: { c: 'China', n: 'Shanghai Port', str: 68, ven: 'Shanghai Stadium', cap: 56000, f: 1.3, flag: '🇨🇳' }
};
// Arsenal Legends: estimated prime-years ability; ab = attribute bonuses for their trademark strengths
const LEGENDS_XI = [
  ['Jens Lehmann', 'GK', 86, { Ref: 2, OvO: 2 }], ['Lauren', 'RB', 83, { Sta: 2, Tck: 1 }], ['Sol Campbell', 'CB', 88, { Str: 3, Hea: 2, Tck: 1 }], ['Kolo Touré', 'CB', 85, { Pac: 2, Tck: 2 }], ['Thomas Vermaelen', 'LB', 83, { Hea: 2, Lon: 1 }],
  ['Freddie Ljungberg', 'RW', 85, { Sta: 2, Fin: 2 }], ['Patrick Vieira', 'CM', 92, { Tck: 2, Str: 3, Sta: 2, Pas: 1 }], ['Gilberto Silva', 'DM', 86, { Pos: 3, Tea: 3 }], ['Robert Pirès', 'LW', 89, { Cre: 2, Crs: 2, Fla: 2 }],
  ['Dennis Bergkamp', 'AM', 91, { Fla: 5, Cre: 4, Pas: 3 }], ['Thierry Henry', 'ST', 94, { Pac: 3, Fin: 3, Fla: 2, Dri: 2 }]
];
const LEGENDS_SUBS = [
  ['David Seaman', 'GK', 88, { Han: 2, Pos: 2 }], ['Lee Dixon', 'RB', 84, { Pos: 2, Sta: 1 }], ['Martin Keown', 'CB', 86, { Mar: 3, Tck: 2 }], ['Tony Adams', 'CB', 89, { Hea: 3, Det: 3, Pos: 2 }], ['Nigel Winterburn', 'LB', 83, { Tea: 2, Sta: 2 }],
  ['Tomáš Rosický', 'CM', 85, { Pas: 3, Fla: 2 }], ['Aaron Ramsey', 'CM', 85, { Sta: 3, Fin: 1 }], ['Santi Cazorla', 'CM', 88, { Pas: 3, Cre: 3, Dri: 2 }], ['Mesut Özil', 'AM', 90, { Cre: 5, Pas: 3 }],
  ['Alexis Sánchez', 'ST', 89, { Det: 3, Dri: 2, Sta: 2 }], ['Ian Wright', 'ST', 89, { Fin: 4, Pac: 2 }]
];
// order matches the 4-4-2 slots: GK DR DC DC DL MR MC MC ML FC FC
const LEG_ORDER1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LEG_ORDER2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // GK Dixon Keown Adams Winterburn | Rosicky(MR) Ramsey Cazorla Özil(ML) | Alexis Wright
function legP(x, i, k) { return { id: 'lg' + k + i, n: x[0], pseudo: true, leg: true, pos: x[1], ca: x[2], age: 28, mor: 85, cond: 100, seed: 100 + i + k * 20, ab: x[3], abv: 50 }; }
function ensureLegends() {
  if (!G.teams.ARL) { addLite('ARL', 'Arsenal Legends', 88, 'Emirates Stadium', 60704); }
  Object.assign(G.teams.ARL, { leg: true, short: 'Arsenal Legends', c1: '#db0007', c2: '#ffffff', str: 88, stadium: 'Emirates Stadium', cap: 60704 });
}
function ensureAsia() { for (const k in ASIA) { const a = ASIA[k], id = 'AS_' + k; if (!G.teams[id]) addLite(id, a.n, a.str, a.ven, a.cap); else G.teams[id].str = a.str; } }
const _mkSidePS = mkSide;
mkSide = function (tid, home) {
  const t = T(tid);
  if (t && t.leg) {
    const S = _mkSidePS(tid, home); // pseudo side with the right shape, then put the legends in a 4-4-2
    const slots = FORMS['4-4-2'];
    S.form = '4-4-2'; S.ps = slots.map((s, i) => ({ p: legP(LEGENDS_XI[LEG_ORDER1[i]], i, 1), role: s[0], pr: DEF_PR[s[0]], x: s[1], y: s[2], on: true, rt: 6.3, g: 0, as: 0, yc: 0, rc: 0, inj: false, mins: 0, subOn: 0 }));
    S.bench = []; S.subs = 0; S.windows = 0; S.leg2 = LEG_ORDER2.map((j, i) => legP(LEGENDS_SUBS[j], i, 2));
    S.tac = Object.assign(S.tac, { ment: 4, press: 3, tempo: 3, pass: 2 });
    return S;
  }
  return _mkSidePS(tid, home);
};
const _stepPS = stepMinute;
stepMinute = function (M) {
  const r = _stepPS(M);
  if (M.min >= 46 && !M.legSwap) for (let s = 0; s < 2; s++) { const S = M.sides[s]; if (!S.leg2) continue; M.legSwap = true; S.ps.forEach((e, i) => { if (S.leg2[i]) { e.p = S.leg2[i]; e.rt = 6.3; e.g = 0; e.as = 0; e.yc = 0; e.mins = 0; e.on = true; } }); say(M, 46, 'tac', `Eleven changes for Arsenal Legends at half-time: ${S.leg2.map(p => p.n.split(' ').slice(-1)[0]).join(', ')} come on.`, s); }
  return r;
};

// ---------- scheduling ----------
function psFirstComp() { const fs = Object.values(G.fx).filter(f => (f.h === G.user || f.a === G.user) && !f.r && f.comp !== 'PSF').map(f => f.d).sort(); return fs[0] || sd('2026-08-22'); }
function psFree() {
  const first = psFirstComp(); const used = new Set(Object.values(G.fx).filter(f => f.h === G.user || f.a === G.user).map(f => f.d));
  return PS_DATES.map(sd).filter(d => d > addDays(G.date, 1) && d <= addDays(first, -3) && !used.has(d) && ![...used].some(u => Math.abs(dDiff(u, d)) < 3));
}
function psFx(o) { const f = addFx(Object.assign({ comp: 'PSF', ed: 'PSF' }, o)); return f; }
function psList() { return Object.values(G.fx).filter(f => f.comp === 'PSF' && (f.h === G.user || f.a === G.user)).sort((a, b) => a.d.localeCompare(b.d)); }
function scheduleLegends() {
  if (!G.user || !T(G.user) || T(G.user).nat || T(G.user).lite) return;
  ensureLegends(); if (psList().some(f => f.h === 'ARL' || f.a === 'ARL')) return;
  const free = psFree(); if (!free.length) return;
  const d = free.includes(sd('2026-08-08')) ? sd('2026-08-08') : free[free.length - 1];
  const arsHome = G.user === 'ARS';
  psFx({ d, h: arsHome ? 'ARS' : 'ARL', a: arsHome ? 'ARL' : G.user, rnd: 'Arsenal Legends match', ven: 'Emirates Stadium', vcap: 60704, leg: 1 });
  news('Arsenal Legends', `${tName(G.user, false)} will face Arsenal Legends at the Emirates Stadium on ${dNice(d, false)}: Lehmann, Lauren, Campbell, Touré, Vermaelen, Ljungberg, Vieira, Gilberto, Pirès, Bergkamp and Henry start, with Seaman, Dixon, Keown, Adams, Winterburn, Rosický, Ramsey, Cazorla, Özil, Alexis and Wright playing the second half. (Game scenario; ratings are estimates of their prime years.)`, G.user, true);
}
function psSetup() {
  if (!G || !G.user || !T(G.user) || T(G.user).nat || T(G.user).lite) return;
  if (G.ps && G.ps.y === G.year) return;
  G.ps = { y: G.year, tour: null, boost: 0 };
  ensureAsia(); scheduleLegends();
  if (G.psAuto) assistantFriendlies(true);
  else msg('Pre-season', `Pre-season friendlies: arrange your own, let your assistant do it, or take the squad on an Asia Tour (Selangor, Japan, Singapore, Hong Kong, China). See Fixtures › Pre-season. The annual Arsenal Legends match is already in the diary.`);
}
const _bsPS = buildSeason;
buildSeason = function () { _bsPS(); try { G.ps = null; psSetup(); } catch (e) { console.error(e); } };
function psOppPool() {
  const u = G.user; const d = divOf(u);
  return fullTeams().filter(t => t !== u).sort((a, b) => (T(b).rep || 0) - (T(a).rep || 0));
}
function assistantFriendlies(auto) {
  const free = psFree(); if (!free.length) return 0;
  const pool = psOppPool(); const u = G.user; const r = T(u).rep || 70;
  const near = pool.filter(t => Math.abs((T(t).rep || 70) - r) <= 6), lower = pool.filter(t => (T(t).rep || 70) < r - 8);
  const picks = [];
  const take = (arr) => { const c = R.shuffle(arr.filter(t => !picks.includes(t))); if (c.length) picks.push(c[0]); };
  take(lower); take(lower); take(near); if (r >= 82) take(pool.filter(t => (T(t).rep || 0) >= 84));
  const ds = free.filter((d, i) => i % 1 === 0).slice(0, picks.length); let n = 0;
  ds.forEach((d, i) => { const opp = picks[i]; if (!opp || (G.byDate[d] || []).some(id => [G.fx[id].h, G.fx[id].a].includes(opp))) return; const home = i % 2 === 0; psFx({ d, h: home ? u : opp, a: home ? opp : u, rnd: 'Pre-season friendly' }); n++; });
  const a = G.staff && G.staff.asst; const an = (a && a.n) || 'Your assistant';
  if (n) msg('Pre-season friendlies', `${an} has arranged ${n} friendl${n > 1 ? 'ies' : 'y'}: ${psList().filter(f => !(f.h === 'ARL' || f.a === 'ARL')).map(f => `${tName(f.h === u ? f.a : f.h)} (${f.h === u ? 'H' : 'A'}, ${dNice(f.d, false)})`).join(', ')}.${auto ? ' (Assistant arranges every pre-season: change this in Fixtures › Pre-season.)' : ''}`);
  return n;
}
function bookTour(stops, start) {
  if (G.ps.tour) return toast('You are already going on a tour this summer.');
  const free = psFree().filter(d => d >= start); const u = G.user;
  if (free.length < stops.length) return toast('Not enough free dates after that start date.');
  ensureAsia(); const ms = [];
  stops.forEach((k, i) => { const a = ASIA[k]; const f = psFx({ d: free[i], h: 'AS_' + k, a: u, rnd: `Asia Tour: ${a.c}`, ven: a.ven, vcap: a.cap, tour: k }); ms.push(f.id); });
  const fee = stops.reduce((s, k) => s + tourFee(k), 0);
  G.ps.tour = { stops, ms, fee };
  news('Asia Tour', `${tName(u, false)} announce a pre-season Asia Tour: ${stops.map((k, i) => `${ASIA[k].n} at the ${ASIA[k].ven} (${dNice(free[i], false)})`).join(', ')}. Expected appearance fees about ${money(fee)}, plus a lift in global popularity and commercial income.`, u, true);
  try { fanPost(u, R.pick([`ASIA TOUR 🌏✈️ ${stops.map(k => ASIA[k].flag).join('')} Let's go!!`, `Asia Tour confirmed. ${stops.includes('SEL') ? 'See you in Petaling Jaya, Selangor fans 🔴🟡' : 'Our fans out there are the best'}`]), { u: 1, big: true }); } catch (e) { }
}
function tourFee(k) { const r = (T(G.user).rep || 70) / 100; return Math.round(Math.pow(r, 3) * 4.5 * ASIA[k].f * 10) / 10; }

// ---------- results: no stats, money and popularity ----------
const _finPS = finalizeMatch;
finalizeMatch = function (M) {
  if (M.comp !== 'PSF') return _finPS(M);
  const keep = [];
  for (const S of M.sides) { const t = T(S.tid); if (!t || t.lite) continue; for (const p of squad(S.tid)) keep.push([p, JSON.stringify(p.st), JSON.stringify(p.car), p.yel, p.sus, JSON.stringify(p.form), p.mor]); }
  const r = _finPS(M);
  for (const [p, st, car, yel, sus, form, mor] of keep) { p.st = JSON.parse(st); p.car = JSON.parse(car); p.yel = yel; p.sus = sus; p.form = JSON.parse(form); p.mor = clamp((mor + p.mor) / 2, 5, 100); }
  return r;
};
const _bdPS = boardReact;
boardReact = function (f) { if (f.comp === 'PSF') return; return _bdPS(f); };
const _pmPS = postMatch;
postMatch = function (f, pre) {
  if (f.comp !== 'PSF') return _pmPS(f, pre);
  const keepSus = squad(G.user).map(p => [p, p.sus]);
  _pmPS(f, pre); for (const [p, s] of keepSus) p.sus = s; // friendlies do not serve suspensions
  try {
    const u = G.user; const t = T(u); if (!t || (f.h !== u && f.a !== u)) return;
    const home = f.h === u; const gf = home ? f.r[0] : f.r[1], ga = home ? f.r[1] : f.r[0];
    t.fin.in.fr = t.fin.in.fr || 0;
    if (f.tour) {
      const fee = tourFee(f.tour); t.bal += fee; t.fin.in.fr += fee;
      t.rep = Math.min(96, (t.rep || 70) + .5); G.fans = clamp((G.fans ?? 60) + 1.5, 0, 100); G.ps.boost = (G.ps.boost || 0) + .02;
      for (const p of squad(u)) p.cond = Math.max(60, (p.cond || 100) - 3); // travel
      const a = ASIA[f.tour];
      news(`Asia Tour: ${a.c}`, `${f.att || Math.round(a.cap * .92).toLocaleString('en-GB')} fans packed the ${a.ven} to watch ${tName(u)} ${gf > ga ? 'beat' : gf < ga ? 'lose to' : 'draw with'} ${a.n} ${gf}-${ga}. The club receives an appearance fee of ${money(fee)}; club reputation, fan mood and commercial income all get a lift. Players feel the travel a little.`, u);
      fanPost(u, R.pick([`The atmosphere in ${a.c} was unreal 😭🔥 ${a.flag}`, `${a.c} fans are on another level. Respect ${a.flag}`, `Tour vibes ${a.flag} ${gf}-${ga}, fitness building nicely`, `Imagine having this many fans in ${a.c} ${a.flag}. Global club ykb`]), { u: 1 });
      if (f.id === G.ps.tour.ms[G.ps.tour.ms.length - 1]) msg('Asia Tour complete', `The Asia Tour is over: ${money(G.ps.tour.stops.reduce((s, k) => s + tourFee(k), 0))} in appearance fees, a reputation lift and commercial income up about ${Math.round(G.ps.boost * 100)}% for the season.`);
    } else if (f.leg) {
      const fee = 1; t.bal += fee; t.fin.in.fr += fee; G.fans = clamp((G.fans ?? 60) + 2, 0, 100);
      news('Arsenal Legends', `${tName(f.h)} ${f.r[0]}-${f.r[1]} ${tName(f.a)} at the Emirates Stadium. A full house enjoyed one more look at Henry, Bergkamp, Vieira and Pirès in the first half and Wright, Özil, Cazorla and Alexis in the second. ${u === 'ARS' ? '' : `${tName(u)} receive an appearance fee of ${money(fee)}.`}`, u, true);
      const p = fanPost(u, gf > ga ? R.pick([`We beat the Invincibles era. Frame it 🖼️`, `Beat Arsenal Legends ${gf}-${ga}. Pre-season, but still. History 😤`]) : R.pick([`Bergkamp is still HIM 🥶`, `Henry in his prime is just unfair fr`, `Got cooked by Arsenal Legends 💀 ${gf}-${ga}`]), { u: 1, big: true });
      reply(p, 'ARS', R.pick(['Invincibles. Gold trophy. Enough said 🏆✨', 'Thierry Henry. That\'s the tweet', 'Ykb 🔴⚪']));
    } else if (!home) {
      const fee = Math.round(Math.pow(Math.max(.1, ((t.rep || 70) - 60) / 40), 2) * 2.5 * 10) / 10;
      if (fee >= .1) { t.bal += fee; t.fin.in.fr += fee; }
    }
  } catch (e) { console.error(e); }
};
const _venPS = venueOf;
venueOf = function (f) { if (f && f.comp === 'PSF' && f.ven) return { name: f.ven, cap: f.vcap || 40000, neutral: !!f.tour, stands: STANDS_DEF }; return _venPS(f); };
// the tour's commercial lift: extra commercial income every week for the rest of the season
const _wkPS = weekly;
weekly = function () {
  _wkPS.apply(this, arguments);
  try { const t = T(G.user); if (G.ps && G.ps.y === G.year && G.ps.boost && t && !t.lite) { const x = Math.pow((t.rep || 70) / 100, 4) * 2.5 * G.ps.boost; t.bal += x; t.fin.in.com += x; } } catch (e) { console.error(e); }
};
// friendlies are not in the losing-streak count or form guide banter
const _rvsPS = rvStreak;
rvStreak = function (tid) { const fs = Object.values(G.fx).filter(x => x.r && x.comp !== 'PSF' && (x.h === tid || x.a === tid)).sort((a, b) => b.d.localeCompare(a.d)); let n = 0; for (const x of fs) { if (rvResult(x, tid) === 'L') n++; else break; } return n; };

// ---------- screen: Fixtures › Pre-season ----------
function psHtml() {
  psSetup();
  const u = G.user, free = psFree(), list = psList();
  const opp = psOppPool();
  const groups = {}; for (const t of opp) { const d = divOf(t) || 'Other'; (groups[d] = groups[d] || []).push(t); }
  const DN = { PL: 'Premier League', CH: 'Championship', LL: 'La Liga', SA: 'Serie A', BL: 'Bundesliga', L1: 'Ligue 1', SPL: 'Saudi Pro League' };
  const ft = list.length ? `<div class="tw"><table class="t"><thead><tr><th>Date</th><th>Opponent</th><th>Venue</th><th class="c">Result</th></tr></thead><tbody>${list.map(f => { const home = f.h === u, o = home ? f.a : f.h; return `<tr><td class="mono">${dShort(f.d)}</td><td>${f.tour ? ASIA[f.tour].flag + ' ' : ''}${tLink(o, true)}${f.leg ? ' <span class="yel" style="font-size:11px">LEGENDS</span>' : ''}</td><td class="dim">${esc(f.ven || (home ? T(u).stadium : T(o).stadium) || '')}</td><td class="c mono">${f.r ? f.r.join('-') : ''}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="dim">No friendlies yet.</p>';
  const pre = psFirstComp() > G.date;
  const tour = G.ps && G.ps.tour;
  const tourBox = tour ? `<div class="box pad" style="margin-top:8px"><b>Asia Tour booked</b>: ${tour.stops.map(k => ASIA[k].flag + ' ' + ASIA[k].c).join(' → ')}. Appearance fees about ${money(tour.fee)}.</div>` : `<div class="box pad" style="margin-top:8px"><h3 class="h3">Asia Tour ✈️</h3><p class="dim" style="font-size:12.5px;margin:0 0 6px">Pick up to four stops. Each match pays an appearance fee (bigger clubs earn more) and lifts the club's reputation, fan mood and commercial income for the season. The players feel the travel a little.</p>
    <div class="row" style="flex-wrap:wrap;gap:6px">${Object.keys(ASIA).map(k => `<label class="btn" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" class="pstour" value="${k}"> ${ASIA[k].flag} ${ASIA[k].c} <span class="dim">v ${esc(ASIA[k].n)} · ~${money(tourFee(k))}</span></label>`).join('')}</div>
    <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center"><label class="lb" for="pstd" style="margin:0">Leave on</label><select class="f" id="pstd">${free.map(d => `<option value="${d}">${dNice(d, true)}</option>`).join('') || '<option value="">No free dates</option>'}</select><button class="btn pri" data-a="pstour">Book the tour</button></div></div>`;
  return `<div class="box pad" style="margin-bottom:10px"><h2 class="sect" style="margin-top:0">Pre-season ${seasonLabel(G.year)}</h2>
  ${ft}
  ${pre ? `<h3 class="h3" style="margin-top:10px">Arrange a friendly</h3><div class="row" style="gap:8px;flex-wrap:wrap"><select class="f" id="psd" aria-label="Date">${free.map(d => `<option value="${d}">${dNice(d, true)}</option>`).join('') || '<option value="">No free dates</option>'}</select><select class="f" id="pso" aria-label="Opponent">${Object.keys(groups).map(g => `<optgroup label="${DN[g] || g}">${groups[g].map(t => `<option value="${t}">${esc(T(t).name)}</option>`).join('')}</optgroup>`).join('')}</select><select class="f" id="psv" aria-label="Venue"><option value="h">Home</option><option value="a">Away</option></select><button class="btn pri" data-a="psok">Arrange</button></div>
  <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center"><button class="btn" data-a="psasst">Let my assistant arrange them</button><label class="dim" style="font-size:12.5px;display:inline-flex;gap:6px;align-items:center"><input type="checkbox" data-ps="auto" ${G.psAuto ? 'checked' : ''}> Assistant arranges every pre-season</label></div>
  ${tourBox}` : '<p class="dim" style="font-size:12.5px">Pre-season is over. Friendlies can be arranged again next summer.</p>'}
  <p class="dim" style="font-size:12px;margin-top:8px">Friendlies do not count towards stats, cards, form or the board's confidence. Arsenal Legends play every pre-season: ratings are game estimates of their prime years.</p></div>`;
}
const _fxPS = scrFixtures;
scrFixtures = function () {
  const h = _fxPS(); if (!(psFirstComp() > G.date) || !T(G.user) || T(G.user).nat) return h;
  if ((UI.tab.fx || 'mine') !== 'mine') return h;
  const i = h.indexOf('<div class="tw">'); return i > 0 ? h.slice(0, i) + psHtml() + h.slice(i) : h + psHtml();
};
Object.assign(ACT, {
  psok: () => {
    const d = ($('#psd') || {}).value, o = ($('#pso') || {}).value, v = ($('#psv') || {}).value; if (!d || !o) return toast('No free date.');
    if ((G.byDate[d] || []).some(id => [G.fx[id].h, G.fx[id].a].includes(o))) return toast(`${tName(o)} already play that day.`);
    const home = v !== 'a'; psFx({ d, h: home ? G.user : o, a: home ? o : G.user, rnd: 'Pre-season friendly' });
    news('Friendly arranged', `${tName(G.user, false)} will play ${T(o).name} ${home ? 'at home' : 'away'} on ${dNice(d, false)}.`, G.user);
    autosave(); toast('Friendly arranged.'); render();
  },
  psasst: () => { const n = assistantFriendlies(false); toast(n ? `Your assistant arranged ${n} friendlies.` : 'No free dates left.'); autosave(); render(); },
  pstour: () => {
    const stops = [...document.querySelectorAll('.pstour:checked')].map(x => x.value).slice(0, 4); const d = ($('#pstd') || {}).value;
    if (!stops.length) return toast('Pick at least one stop.'); if (!d) return toast('No free date.');
    bookTour(stops, d); autosave(); render();
  }
});
document.addEventListener('change', (ev) => { const el = ev.target; if (el && el.dataset && el.dataset.ps === 'auto') { G.psAuto = !!el.checked; autosave(); toast(G.psAuto ? 'Your assistant will arrange friendlies every pre-season.' : 'You will arrange friendlies yourself.'); } });
// older saves still in pre-season get the set-up when loaded
const _rsPSF = restore;
restore = function (obj) { _rsPSF(obj); try { if (G && G.user && !G.ps && psFirstComp() > addDays(G.date, 3)) psSetup(); } catch (e) { console.error(e); } };
