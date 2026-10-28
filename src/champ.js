// champ.js: Championship migration for older saves, monthly player progression and rating history.
// Loaded after links.js, before boot.js.

// ---------- old saves: turn the team-level Championship into real squads ----------
function migrateChampionship() {
  if (!G || !G.champTeams) return;
  if (!G.ded) G.ded = {};
  let changed = 0;
  for (const tid of G.champTeams) {
    const t = T(tid); if (!t || !t.lite) continue;
    const code = CH_LEGACY[tid] || tid;
    const c = CH_CLUBS.find(x => x.id === code);
    if (c && !(t.relSquad && t.relSquad.length)) {
      Object.assign(t, { name: c.name, short: c.short, c1: c.c1, c2: c.c2, stadium: c.stadium, cap: c.cap, mgr: c.mgr, rep: c.rep, bal: c.bal, lite: false, captN: c.capt, tac: { form: c.form || '4-2-3-1', xi: [], bench: [], ment: 3, press: 2, tempo: 2, width: 2, pass: 2 }, fin: newFin() });
      if (c.rep >= 68 && G.year === BASE_YEAR) t.para = PARACHUTE.slice();
      G.sq[tid] = [];
      addSquadRows(tid, c.sq, 0);
      for (const p of squad(tid)) { p.con = G.year + R.i(p.age >= 32 ? 1 : 2, p.age >= 30 ? 2 : p.age <= 21 ? 5 : 4); p.wage = wageFor(p, tid) * R.i(85, 110) / 100 * (t.para ? 1.25 : 1); p.val = calcValue(p); }
      setBudgets(tid, true);
    } else promote(tid, 'CH'); // former Premier League clubs get their old squads back; others get a generated squad
    for (const k in TAC_DEF) if (t.tac[k] == null) t.tac[k] = TAC_DEF[k];
    if (!t.tac.pr) t.tac.pr = [];
    autoPick(tid); ensureCaptains(tid);
    changed++;
  }
  if (!G.l1) G.l1 = G.lowerTeams.filter(x => !G.champTeams.includes(x) && !G.pl.includes(x)).slice(0, 24);
  if (!G.cups.PO) G.cups.PO = { id: 'PO', rounds: CAL.PO.map(([n, ds, neu]) => ({ n, d: ds.map(sd), neutral: !!neu, ties: [], done: false })), ri: 0, winner: null, seeds: [] };
  if (changed) msg('The Championship', `All ${G.champTeams.length} Championship clubs now have real first-team squads (as of late October 2026), so you can scout, sign and loan their players. This season's Championship table carries on as before; full Championship fixtures with the new six-team play-offs start next season, when you can also apply for Championship jobs.`);
}
const _migC = migrate;
migrate = function () { _migC(); try { migrateChampionship(); } catch (e) { console.error(e); } };

// ---------- monthly progression ----------
// Yearly change by age (rating points). Most of it is applied month by month during the season
// (Aug-May), scaled by minutes, match ratings, coaching and happiness; a smaller summer step remains.
const GROW = [[18, 3.5], [19, 3.2], [20, 3.0], [21, 2.6], [22, 2.2], [23, 1.6], [24, 1.1], [25, .6], [26, .3], [27, .1], [28, 0], [29, -.3], [30, -.6], [31, -1], [32, -1.5], [33, -2.2]];
function ageGrowth(age) { for (const [a, g] of GROW) if (age <= a) return g; return -3; }
const SEASON_MONTHS = ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05'];
function monthKey(d) { return d.slice(0, 7); }
function prevMonthStart(d) { const y = +d.slice(0, 4), m = +d.slice(5, 7); return m === 1 ? (y - 1) + '-12-01' : y + '-' + String(m - 1).padStart(2, '0') + '-01'; }
function monthlyProgress() {
  const now = G.date; const from = prevMonthStart(now); const mm = from.slice(5, 7);
  if (!SEASON_MONTHS.includes(mm)) return;
  // minutes and ratings from last month's fixtures
  const apps = {}, rsum = {}, games = {};
  for (const f of Object.values(G.fx)) {
    if (!f.r || f.d < from || f.d >= now) continue;
    for (const tid of [f.h, f.a]) games[tid] = (games[tid] || 0) + 1;
    if (f.rt) for (const side of f.rt) if (side) for (const [id, r, , , on] of side) { apps[id] = (apps[id] || 0) + (on ? .5 : 1); rsum[id] = (rsum[id] || 0) + r; }
  }
  const coachU = typeof staffAb === 'function' ? staffAb('coach') : 10;
  const ups = [], downs = [];
  for (const p of Object.values(G.players)) {
    if (!p || ['RETIRED', 'ABROAD', 'FA'].includes(p.c) || String(p.c).startsWith('REL_')) continue;
    const t = T(p.c); if (!t) continue;
    if (p.cax == null) p.cax = p.ca;
    let g = ageGrowth(p.age);
    const n = apps[p.id] || 0, gm = games[p.c] || 0;
    let share = t.lite ? .75 : gm ? clamp(n / gm, 0, 1) : .3;
    if (g > 0) {
      g *= clamp((p.pa - p.cax) / 6, 0, 1);
      g *= 0.45 + 0.85 * share;
      if (n >= 1 && rsum[p.id]) { const avg = rsum[p.id] / Math.max(1, Math.ceil(n)); g *= clamp(1 + (avg - 6.6) * 0.35, .6, 1.5); }
      g *= p.c === G.user ? 0.85 + coachU / 50 : 1.05;
      const h = typeof hap === 'function' ? hap(p) : 65; if (h < 35) g *= .8; else if (h > 75) g *= 1.05;
    } else if (g < 0) g *= share > .6 ? .9 : 1;
    const d = g / 10 + R.gauss() * .22;
    const before = p.ca;
    p.cax = clamp(p.cax + d, 30, 96);
    p.ca = Math.round(p.cax);
    if (p.ca > p.pa) p.pa = p.ca;
    if (p.ca !== before) p.val = calcValue(p);
    // history: start month + values (last 24 months)
    if (!t.lite || p.loan) {
      const k = monthKey(from);
      if (!p.ch || !p.ch.k) p.ch = { k, v: [] };
      p.ch.v.push(p.ca);
      if (p.ch.v.length > 24) { p.ch.v.shift(); p.ch.k = addMonths(p.ch.k, 1); }
    }
    const owner = p.loan && p.loan.out ? p.loan.from : p.c;
    if (owner === G.user) {
      const base = p.lastNews != null ? p.lastNews : before;
      if (p.ca >= base + 2 || (p.ca > before && Math.floor(p.ca / 5) > Math.floor(before / 5) && p.age <= 24)) { ups.push(p); p.lastNews = p.ca; }
      else if (p.ca <= base - 2) { downs.push(p); p.lastNews = p.ca; }
    }
  }
  if (ups.length) news('Player development', ups.length === 1 ? `${ups[0].n} has improved to ${ups[0].ca}.` : `Improving: ${ups.slice(0, 6).map(p => `${p.n} (now ${p.ca})`).join(', ')}${ups.length > 6 ? ` and ${ups.length - 6} more` : ''}.`, G.user);
  if (downs.length) news('Player development', `Coaching staff report a drop in sharpness: ${downs.slice(0, 5).map(p => `${p.n} (now ${p.ca})`).join(', ')}.`, G.user);
}
function addMonths(k, n) { let y = +k.slice(0, 4), m = +k.slice(5, 7) + n; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return y + '-' + String(m).padStart(2, '0'); }
const _dtC = dailyTick;
dailyTick = function () {
  if (G.date.endsWith('-01')) { try { monthlyProgress(); } catch (e) { console.error(e); } }
  return _dtC();
};
// smaller summer step now that most change happens during the season
developPlayers = function () {
  for (const p of Object.values(G.players)) {
    if (p.c === 'RETIRED' || p.c === 'ABROAD') continue;
    p.age++;
    let d;
    if (p.age <= 21) d = R.i(0, 2) + (p.c === G.user && R.chance(staffAb('coach') / 40) ? 1 : 0);
    else if (p.age <= 24) d = R.i(0, 1);
    else if (p.age <= 28) d = R.i(0, 2) - 1;
    else if (p.age <= 31) d = R.i(-1, 0);
    else if (p.age <= 33) d = R.i(-2, 0);
    else d = R.i(-3, -1);
    if (d > 0) d = Math.min(d, Math.max(0, p.pa - p.ca));
    p.ca = clamp(p.ca + d, 35, 96); p.cax = p.ca;
    if (p.ca > p.pa) p.pa = p.ca;
    p.val = calcValue(p);
    if (p.age >= 34 && (p.age >= 38 || R.chance((p.age - 33) * .18) || p.ca < 60)) {
      if (G.sq[p.c]) G.sq[p.c] = G.sq[p.c].filter(x => x !== p.id);
      if (p.c === G.user) news('Retirement', `${p.n} has announced his retirement from professional football.`, G.user);
      p.c = 'RETIRED'; G.fa = G.fa.filter(x => x !== p.id); continue;
    }
    if (p.con <= G.year + 1 && G.sq[p.c]) {
      if (p.c === G.user) {
        G.sq[p.c] = G.sq[p.c].filter(x => x !== p.id); news('Contract', `${p.n}'s contract has expired and he has left the club.`, G.user); p.c = 'FA'; G.fa.push(p.id);
      } else if (divOf(p.c)) {
        if (p.age <= 33 && p.ca >= T(p.c).rep - 16 && R.chance(.9)) { p.con = G.year + 1 + R.i(1, 3); p.wage = wageFor(p, p.c); }
        else { G.sq[p.c] = G.sq[p.c].filter(x => x !== p.id); p.c = 'FA'; G.fa.push(p.id); }
      }
    }
  }
  G.fa = G.fa.filter(id => P(id) && P(id).c === 'FA').sort((a, b) => P(b).ca - P(a).ca).slice(0, 120);
};

// ---------- rating history chart in the player pop-up ----------
function progressSvg(p) {
  const h = p.ch; if (!h || !h.v || h.v.length < 1) return '';
  const vals = h.v.slice();
  const est = typeof potEstimate === 'function' ? potEstimate(p) : p.pa;
  const spread = Math.max(1.5, (21 - (typeof staffAb === 'function' ? staffAb('scout') : 10)) / 3);
  const lo = Math.min(...vals, est - spread) - 2, hi = Math.max(...vals, est + spread) + 2;
  const W = 300, H = 110, pl = 26, pr = 8, pt = 8, pb = 18;
  const x = i => pl + (vals.length === 1 ? (W - pl - pr) / 2 : i * (W - pl - pr) / (vals.length - 1));
  const y = v => pt + (hi - v) * (H - pt - pb) / (hi - lo);
  const line = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const ticks = []; for (let v = Math.ceil(lo / 5) * 5; v <= hi; v += 5) ticks.push(v);
  const labels = []; for (let i = 0; i < vals.length; i++) { const k = addMonths(h.k, i); if (i === 0 || k.endsWith('-01') || i === vals.length - 1) labels.push([i, MON[+k.slice(5) - 1] + (k.endsWith('-01') || i === 0 ? ' ' + k.slice(2, 4) : '')]); }
  return `<svg class="progsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Rating by month for ${esc(p.n)}: from ${vals[0]} to ${vals[vals.length - 1]}; scout's potential estimate about ${Math.round(est)}">
    <rect x="${pl}" y="${y(est + spread).toFixed(1)}" width="${W - pl - pr}" height="${(y(est - spread) - y(est + spread)).toFixed(1)}" class="pband"/>
    <text x="${W - pr - 2}" y="${(y(est + spread) - 2).toFixed(1)}" text-anchor="end" class="plab">potential (scout)</text>
    ${ticks.map(v => `<line x1="${pl}" x2="${W - pr}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="pgrid"/><text x="${pl - 4}" y="${(y(v) + 3).toFixed(1)}" text-anchor="end" class="plab">${v}</text>`).join('')}
    <path d="${line}" class="pline"/>
    ${vals.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.2" class="pdot"><title>${addMonths(h.k, i)}: ${v}</title></circle>`).join('')}
    ${labels.map(([i, l]) => `<text x="${x(i).toFixed(1)}" y="${H - 4}" text-anchor="middle" class="plab">${l}</text>`).join('')}
  </svg>`;
}
const _pxC = playerExtra;
playerExtra = function (p) {
  const base = _pxC(p);
  const ch = p.ch && p.ch.v && p.ch.v.length ? p.ch.v : null;
  const first = ch ? ch[0] : null, last = ch ? ch[ch.length - 1] : null;
  const box = `<h2 class="sect">Development</h2><div class="box pad"><div class="row" style="justify-content:space-between;gap:10px;align-items:baseline"><span class="dim" style="font-size:13px">Overall rating by month${ch && ch.length > 1 ? ` · ${last - first >= 0 ? '+' : ''}${last - first} since ${MON[+p.ch.k.slice(5) - 1]} ${p.ch.k.slice(0, 4)}` : ''}</span><span class="mono" style="font-size:13px">Potential (scout) ${potStars(p)}</span></div>${ch ? progressSvg(p) : '<p class="dim" style="margin:6px 0 0">Monthly ratings are recorded from the start of each month during the season.</p>'}</div>`;
  return base + box;
};

// ---------- play-offs panel under the Championship table ----------
function poHtml() {
  const po = G.cups && G.cups.PO; if (!po) return '';
  const rs = po.rounds.filter(r => r.ties.length);
  if (!rs.length) return `<p class="dim">The play-off draw follows the final round on ${dNice(sd(CAL.ch[CAL.ch.length - 1]), false)}. Eliminators ${dNice(po.rounds[0].d[0], false)}, semi-finals ${po.rounds[1].d.map(d => dShort(d)).join(' & ')}, final at Wembley ${dNice(po.rounds[2].d[0], false)}.</p>`;
  return `<h2 class="sect">Play-offs${po.winner ? ' · promoted: ' + tLink(po.winner, true) : ''}</h2>` + rs.slice().reverse().map(r => `<div class="dim mono" style="margin:6px 0 4px">${esc(r.n)} · ${r.d.map(d => dShort(d)).join(' & ')}${r.neutral ? ' · Wembley' : ''}</div><div class="tw">${tiesTable(r)}</div>`).join('');
}

// Championship derbies (used by press conferences and the matchday atmosphere)
RIVALS.push(['WHU', 'MIL'], ['SOU', 'POR'], ['BIR', 'WBA'], ['WOL', 'WBA'], ['BIR', 'WOL'], ['CAR', 'SWA'], ['BRC', 'CAR'], ['BLB', 'BUR'], ['BLB', 'PNE'], ['BUR', 'PNE'], ['NOR', 'IPS'], ['DER', 'NFO'], ['CHA', 'MIL'], ['MID', 'SUN'], ['SHU', 'LEE'], ['STK', 'WOL'], ['BOL', 'BLB'], ['WRE', 'CAR'], ['LIN', 'HUL'], ['QPR', 'CHE'], ['WAT', 'BRE']);
