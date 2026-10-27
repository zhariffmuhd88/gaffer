// ===== AWARDS: monthly and season =====
function awStore() { if (!G.awards) G.awards = { m: [], s: [] }; return G.awards; }
function monthLabel(key) { return MON[+key.slice(5) - 1] + ' ' + key.slice(0, 4); }
function plFixtures(pred) { return Object.values(G.fx).filter(f => f.comp === 'PL' && f.r && pred(f)); }
function ratingTable(fs) {
  const m = new Map();
  for (const f of fs) for (let i = 0; i < 2; i++) for (const [pid, rt, g, as] of (f.rt ? f.rt[i] || [] : [])) {
    const p = P(pid); if (!p) continue;
    let x = m.get(pid); if (!x) { x = { pid, n: p.n, club: i === 0 ? f.h : f.a, age: p.age, pos: p.pos, a: 0, r: 0, g: 0, as: 0 }; m.set(pid, x); }
    x.a++; x.r += rt; x.g += g; x.as += as;
  }
  return [...m.values()].map(x => Object.assign(x, { avg: x.r / x.a, sc: x.r / x.a + x.g * .08 + x.as * .05 }));
}
function clubTable(fs) {
  const t = {};
  for (const f of fs) { for (const [id, gf, ga] of [[f.h, f.r[0], f.r[1]], [f.a, f.r[1], f.r[0]]]) { const x = t[id] = t[id] || { tid: id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; addRes(x, gf, ga); } }
  return Object.values(t).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
}
function mgrName(tid) { return tid === G.user ? G.mgr : (T(tid).mgr || 'Unknown'); }
function userAward(name, repUp, txt) {
  if (G.mgrP) (G.mgrP.aw = G.mgrP.aw || []).push({ s: seasonLabel(G.year), d: G.date, n: name, club: G.user });
  G.mgrRep = clamp(G.mgrRep + repUp, 20, 99);
  msg(name, txt);
}
function playerAwardBoost(pid, mor) { const p = P(pid); if (p && p.c === G.user) { p.mor = clamp(p.mor + mor, 5, 100); if (typeof setHap === 'function') setHap(p, mor / 2); } }
function monthAwards() {
  const d = dParse(G.date); d.setUTCMonth(d.getUTCMonth() - 1); const key = dStr(d).slice(0, 7);
  const A = awStore(); if (A.m.some(x => x.key === key)) return;
  const fs = plFixtures(f => f.d.startsWith(key)); if (fs.length < 20) return;
  const rounds = Math.round(fs.length / 10), minA = Math.max(1, Math.ceil(rounds * .6));
  const rt = ratingTable(fs).filter(x => x.a >= minA).sort((a, b) => b.sc - a.sc);
  const potm = rt[0], ypotm = rt.find(x => x.age <= 21);
  const ct = clubTable(fs).filter(x => x.p >= minA); const motm = ct[0];
  if (!potm && !motm) return;
  const gotm = (G.gotm || []).find(x => x.m === key);
  const rec = { key, s: seasonLabel(G.year), potm: potm && { pid: potm.pid, n: potm.n, club: potm.club, avg: +potm.avg.toFixed(2), g: potm.g, as: potm.as, a: potm.a }, ypotm: ypotm && { pid: ypotm.pid, n: ypotm.n, club: ypotm.club, avg: +ypotm.avg.toFixed(2), g: ypotm.g, as: ypotm.as }, motm: motm && { tid: motm.tid, mgr: mgrName(motm.tid), rec: `${motm.w}-${motm.d}-${motm.l}`, pts: motm.pts }, gotm: gotm && { n: gotm.n, club: gotm.club, st: gotm.st, opp: gotm.opp } };
  A.m.push(rec);
  const ml = monthLabel(key);
  if (potm) { news('Player of the Month', `${potm.n} (${tName(potm.club)}) is the Premier League Player of the Month for ${ml}: ${potm.g} goals, ${potm.as} assists, average rating ${potm.avg.toFixed(2)}.`, potm.club, true); playerAwardBoost(potm.pid, 8); }
  if (ypotm && ypotm !== potm) { news('Young Player of the Month', `${ypotm.n} (${tName(ypotm.club)}) wins Young Player of the Month for ${ml}.`, ypotm.club, true); playerAwardBoost(ypotm.pid, 6); }
  if (motm) { if (motm.tid === G.user) userAward('Manager of the Month', 1.5, `${G.mgr} is the Premier League Manager of the Month for ${ml} after a ${motm.w}-${motm.d}-${motm.l} record with ${T(G.user).name}.`); else news('Manager of the Month', `${mgrName(motm.tid)} (${tName(motm.tid)}) is Manager of the Month for ${ml} (${motm.w}-${motm.d}-${motm.l}).`, motm.tid, true); }
}
const _gom0 = goalOfMonth;
goalOfMonth = function () { _gom0(); try { monthAwards(); } catch (e) { console.error(e); } };

function teamOfSeason(rt) {
  const pool = rt.filter(x => x.a >= 15).sort((a, b) => b.avg - a.avg);
  const used = new Set(); const pick = (pos, n) => { const out = []; for (const x of pool) { if (out.length >= n) break; if (!used.has(x.pid) && pos.includes(x.pos)) { out.push(x); used.add(x.pid); } } return out; };
  const gk = pick(['GK'], 1), rb = pick(['RB'], 1), cb = pick(['CB'], 2), lb = pick(['LB'], 1), mid = pick(['DM', 'CM', 'AM'], 3), rw = pick(['RW'], 1), st = pick(['ST'], 1), lw = pick(['LW'], 1);
  const slots = [['GK', gk[0]], ['DR', rb[0]], ['DC', cb[0]], ['DC', cb[1]], ['DL', lb[0]], ['MC', mid[0]], ['DM', mid[1]], ['MC', mid[2]], ['AMR', rw[0]], ['FC', st[0]], ['AML', lw[0]]];
  return slots.filter(s => s[1]).map(([r, x]) => ({ r, pid: x.pid, n: x.n, club: x.club, avg: +x.avg.toFixed(2) }));
}
function seasonAwards() {
  const A = awStore(); const s = seasonLabel(G.year); if (A.s.some(x => x.s === s)) return;
  const fs = plFixtures(() => true); if (fs.length < 100) return;
  const rt = ratingTable(fs);
  const elig = rt.filter(x => x.a >= 20);
  const best = elig.slice().sort((a, b) => b.sc - a.sc)[0];
  const young = elig.filter(x => x.age <= 21).sort((a, b) => b.sc - a.sc)[0];
  const boot = rt.slice().sort((a, b) => b.g - a.g || a.a - b.a)[0];
  const play = rt.slice().sort((a, b) => b.as - a.as || a.a - b.a)[0];
  const cs = new Map();
  for (const f of fs) for (let i = 0; i < 2; i++) if (f.r[1 - i] === 0) { const gk = (f.rt[i] || []).find(([pid, , , , on]) => !on && P(pid) && P(pid).pos === 'GK'); if (gk) cs.set(gk[0], (cs.get(gk[0]) || 0) + 1); }
  const glove = [...cs.entries()].sort((a, b) => b[1] - a[1])[0];
  // manager of the season: biggest finish above expectation, champions get a bonus
  const tb = leagueTable(); const exp = G.pl.slice().sort((a, b) => bestXIRating(squad(b)) - bestXIRating(squad(a)));
  const mos = tb.map((r, i) => ({ tid: r.t, pos: i + 1, sc: (exp.indexOf(r.t) + 1) - (i + 1) + (i === 0 ? 6 : 0) + (i < 4 ? 1 : 0) })).sort((a, b) => b.sc - a.sc)[0];
  const tos = teamOfSeason(rt);
  const gos = typeof goalOfSeason === 'function' ? goalOfSeason() : null;
  const pk = (x) => x && { pid: x.pid, n: x.n, club: x.club, avg: +x.avg.toFixed(2), g: x.g, as: x.as, a: x.a };
  const rec = { s, best: pk(best), young: pk(young), boot: pk(boot), play: pk(play), glove: glove && { pid: glove[0], n: P(glove[0]).n, club: P(glove[0]).c, cs: glove[1] }, mos: mos && { tid: mos.tid, mgr: mgrName(mos.tid), pos: mos.pos }, tos, gos: gos && { n: gos.n, club: gos.club, st: gos.st, opp: gos.opp } };
  A.s.push(rec);
  if (best) { news('Player of the Season', `${best.n} (${tName(best.club)}) is the Premier League Player of the Season.`, best.club, true); playerAwardBoost(best.pid, 12); }
  if (young) { news('Young Player of the Season', `${young.n} (${tName(young.club)}) is the Young Player of the Season.`, young.club, true); playerAwardBoost(young.pid, 10); }
  if (boot) news('Golden Boot', `${boot.n} (${tName(boot.club)}) wins the Golden Boot with ${boot.g} league goals.`, boot.club, true);
  if (play) news('Playmaker', `${play.n} (${tName(play.club)}) wins the Playmaker award with ${play.as} league assists.`, play.club, true);
  if (glove) news('Golden Glove', `${P(glove[0]).n} wins the Golden Glove with ${glove[1]} clean sheets.`, P(glove[0]).c, true);
  if (mos) { if (mos.tid === G.user) userAward('Manager of the Season', 5, `${G.mgr} is named Premier League Manager of the Season after leading ${T(G.user).name} to ${ordinal(mos.pos)}.`); else news('Manager of the Season', `${mgrName(mos.tid)} (${tName(mos.tid)}) is Manager of the Season.`, mos.tid, true); }
  const mine = tos.filter(x => P(x.pid) && P(x.pid).c === G.user);
  if (mine.length) msg('Team of the Season', `${mine.map(x => x.n).join(', ')} ${mine.length > 1 ? 'are' : 'is'} named in the Premier League Team of the Season.`);
  for (const x of mine) playerAwardBoost(x.pid, 5);
}
const _se1 = seasonEnd;
seasonEnd = function () { try { monthAwards(); seasonAwards(); } catch (e) { console.error(e); } _se1(); };

// ---------- UI ----------
function awPlayer(x, extra) { if (!x) return '<span class="dim">-</span>'; const p = P(x.pid); return `<span class="${p ? 'click' : ''}" ${p ? `data-a="player" data-v="${x.pid}"` : ''}><b>${esc(x.n)}</b></span> <span class="dim">${esc(tName(x.club))}</span>${extra ? ` <span class="mono dim">${extra}</span>` : ''}`; }
function tosSvg(tos) {
  const POSN = { GK: [50, 92], DR: [86, 70], DC: null, DL: [14, 70], MC: null, DM: [50, 52], AMR: [82, 20], FC: [50, 12], AML: [18, 20] };
  let dc = 0, mc = 0; let out = '';
  for (const x of tos) {
    let xy = POSN[x.r]; if (x.r === 'DC') xy = [dc++ ? 64 : 36, 74]; if (x.r === 'MC') xy = [mc++ ? 72 : 28, 42];
    const t = T(x.club) || {}; const body = t.c1 || '#888';
    out += `<g><circle cx="${xy[0]}" cy="${xy[1] * .9 + 4}" r="5.2" fill="${body}" stroke="${t.c2 || '#fff'}" stroke-width="1.2"/><text x="${xy[0]}" y="${xy[1] * .9 + 13.5}" font-size="4.2" fill="#fff" text-anchor="middle" font-weight="600">${esc(surname(x.n))}</text><text x="${xy[0]}" y="${xy[1] * .9 + 18}" font-size="3.4" fill="rgba(255,255,255,.75)" text-anchor="middle">${esc(tName(x.club))} · ${x.avg.toFixed(2)}</text></g>`;
  }
  return `<svg viewBox="0 0 100 100" class="tossvg" role="img" aria-label="Team of the Season"><rect width="100" height="100" fill="#1b6a37"/><g fill="none" stroke="rgba(255,255,255,.55)" stroke-width=".5"><rect x="2" y="2" width="96" height="96"/><line x1="2" y1="50" x2="98" y2="50"/><circle cx="50" cy="50" r="10"/><rect x="25" y="84" width="50" height="14"/><rect x="25" y="2" width="50" height="14"/></g>${out}</svg>`;
}
function scrAwards() {
  const A = awStore(); const tab = UI.tab.aw || 'month';
  const cur = seasonLabel(G.year);
  let body;
  if (tab === 'month') {
    const seasons = [...new Set(A.m.map(x => x.s).concat([cur]))].reverse();
    const ss = UI.tab.aws && seasons.includes(UI.tab.aws) ? UI.tab.aws : seasons[0];
    const rows = A.m.filter(x => x.s === ss);
    body = `<div class="row" style="margin-bottom:8px"><label class="lb" for="aws" style="margin:0">Season</label><select class="f" id="aws" data-a="aws">${seasons.map(s => `<option ${s === ss ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    ${rows.length ? `<div class="tw"><table class="t"><thead><tr><th>Month</th><th>Player of the Month</th><th>Young Player</th><th>Manager of the Month</th><th>Goal of the Month</th></tr></thead><tbody>${rows.map(r => `<tr class="${r.motm && r.motm.tid === G.user ? 'me' : ''}"><td class="mono">${monthLabel(r.key)}</td><td>${awPlayer(r.potm, r.potm ? `${r.potm.g}G ${r.potm.as}A · ${r.potm.avg.toFixed(2)}` : '')}</td><td>${awPlayer(r.ypotm, r.ypotm ? r.ypotm.avg.toFixed(2) : '')}</td><td>${r.motm ? `<b>${esc(r.motm.mgr)}</b> <span class="dim">${esc(tName(r.motm.tid))} · ${r.motm.rec}</span>` : '-'}</td><td>${r.gotm ? `<b>${esc(r.gotm.n)}</b> <span class="dim">${esc(STYLE_N[r.gotm.st] || '')} v ${esc(tName(r.gotm.opp))}</span>` : '-'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="dim">Monthly awards are announced on the first day of each month, once enough league games have been played.</p>'}`;
  } else if (tab === 'season') {
    body = A.s.length ? A.s.slice().reverse().map(r => `<div class="box pad" style="margin-bottom:12px"><h2 class="sect" style="margin-top:0">${r.s}</h2><div class="awgrid"><dl class="kv">
      <dt>Player of the Season</dt><dd>${awPlayer(r.best, r.best ? r.best.avg.toFixed(2) : '')}</dd>
      <dt>Young Player</dt><dd>${awPlayer(r.young, r.young ? r.young.avg.toFixed(2) : '')}</dd>
      <dt>Golden Boot</dt><dd>${awPlayer(r.boot, r.boot ? r.boot.g + ' goals' : '')}</dd>
      <dt>Playmaker</dt><dd>${awPlayer(r.play, r.play ? r.play.as + ' assists' : '')}</dd>
      <dt>Golden Glove</dt><dd>${r.glove ? `<b>${esc(r.glove.n)}</b> <span class="dim">${r.glove.cs} clean sheets</span>` : '-'}</dd>
      <dt>Manager of the Season</dt><dd>${r.mos ? `<b class="${r.mos.tid === G.user ? 'yel' : ''}">${esc(r.mos.mgr)}</b> <span class="dim">${esc(tName(r.mos.tid))} · ${ordinal(r.mos.pos)}</span>` : '-'}</dd>
      <dt>Goal of the Season</dt><dd>${r.gos ? `<b>${esc(r.gos.n)}</b> <span class="dim">${esc(STYLE_N[r.gos.st] || '')} v ${esc(tName(r.gos.opp))}</span>` : '-'}</dd></dl>
      <div><label class="lb">Team of the Season</label>${tosSvg(r.tos)}</div></div></div>`).join('') : '<p class="dim">Season awards are presented when the season ends in May.</p>';
  } else {
    const rt = ratingTable(plFixtures(f => true)).filter(x => x.a >= 5);
    const best = rt.slice().sort((a, b) => b.sc - a.sc).slice(0, 10);
    const young = rt.filter(x => x.age <= 21).sort((a, b) => b.sc - a.sc).slice(0, 5);
    const row = (x, i) => `<tr class="click ${P(x.pid) && P(x.pid).c === G.user ? 'me' : ''}" data-a="player" data-v="${x.pid}"><td class="n">${i + 1}</td><td>${esc(x.n)}</td><td>${tLink(x.club)}</td><td class="n">${x.a}</td><td class="n">${x.g}</td><td class="n">${x.as}</td><td class="n"><b>${x.avg.toFixed(2)}</b></td></tr>`;
    const hd = '<thead><tr><th class="n">#</th><th>Player</th><th>Club</th><th class="n">Apps</th><th class="n">G</th><th class="n">A</th><th class="n">Avg</th></tr></thead>';
    body = `<p class="dim" style="margin-top:0">Who is leading the race this season (league games, at least 5 appearances).</p><h2 class="sect">Player of the Season</h2><div class="tw"><table class="t">${hd}<tbody>${best.map(row).join('') || '<tr><td colspan="7" class="dim">Not enough games yet.</td></tr>'}</tbody></table></div><h2 class="sect">Young Player of the Season</h2><div class="tw"><table class="t">${hd}<tbody>${young.map(row).join('') || '<tr><td colspan="7" class="dim">Not enough games yet.</td></tr>'}</tbody></table></div>`;
  }
  return `<div class="band">Awards<small>Premier League monthly and season awards</small></div>
  <div class="tabs" style="margin-top:8px">${[['month', 'Monthly'], ['race', 'Award race'], ['season', 'Season awards']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="aw" data-v="${k}">${l}</button>`).join('')}</div>${body}`;
}
document.addEventListener('change', (ev) => { const el = ev.target; if (el.dataset && el.dataset.a === 'aws') { UI.tab.aws = el.value; render(); } });
