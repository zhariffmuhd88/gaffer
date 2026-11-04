// reports.js: the assistant manager's weekly report (who deserves to start, who to drop, form, sell list),
// monthly scout reports (scouts assigned to leagues or regions, with a recruitment brief) and the reasons
// behind each player's happiness. Loaded after clublife.js.

// ---------- helpers ----------
function fAvg(p, n) { const f = (p.form || []).slice(-(n || 5)); return f.length ? f.reduce((a, b) => a + b, 0) / f.length : null; }
// a staff member's judgement: small, stable error that shrinks with ability
function judge(v, ab, salt) { return v + ((hash(salt + '|' + (G.year || 0)) % 1000) / 1000 - 0.5) * (20 - ab) * 0.08; }
function posGrpN(g) { return { G: 'goalkeeper', D: 'defender', M: 'midfielder', A: 'forward' }[g] || 'player'; }

// ---------- assistant manager: weekly report ----------
function assistantReport() {
  if (!G || G.sacked || !T(G.user) || isNatT(G.user)) return null;
  ensureStaff();
  const ab = staffAb('asst'); const as = G.staff.asst; const t = userTeam();
  const sq = squad(G.user).filter(p => !p.loan || !p.loan.out);
  const xi = new Set((t.tac.xi || []).filter(Boolean));
  const fit = (p) => p.inj <= 0 && !(p.sus > 0);
  const fm = (p) => { const f = fAvg(p, 5); return f == null ? null : judge(f, ab, p.id + 'f'); };
  const withForm = sq.filter(p => (p.form || []).length >= 2);
  const inForm = withForm.filter(p => fm(p) >= 7.0).sort((a, b) => fm(b) - fm(a)).slice(0, 3)
    .map(p => [p.id, `${fAvg(p).toFixed(2)} average over his last ${Math.min(5, p.form.length)} games${p.st.g ? `, ${p.st.g} goal${p.st.g > 1 ? 's' : ''} this season` : ''}${p.st.as ? `, ${p.st.as} assist${p.st.as > 1 ? 's' : ''}` : ''}.`]);
  const under = withForm.filter(p => fm(p) < 6.45 || (p.ca >= 80 && fm(p) < 6.7)).sort((a, b) => (fm(a) - a.ca / 40) - (fm(b) - b.ca / 40)).slice(0, 3)
    .map(p => [p.id, p.ca >= 80 ? `Below the standard we expect from him (${fAvg(p).toFixed(2)} recently).` : `Struggling: ${fAvg(p).toFixed(2)} average recently.`]);
  // deserves to start: fit non-starters who are in form or clearly better than the weakest starter in their area
  const start = [], drop = [];
  for (const g of ['G', 'D', 'M', 'A']) {
    const inXI = sq.filter(p => xi.has(p.id) && POS_GROUP[p.pos] === g);
    const out = sq.filter(p => !xi.has(p.id) && fit(p) && POS_GROUP[p.pos] === g && p.age >= 17);
    if (!inXI.length) continue;
    const weakest = inXI.slice().sort((a, b) => ((fm(a) ?? 6.6) + a.ca / 12) - ((fm(b) ?? 6.6) + b.ca / 12))[0];
    const cand = out.filter(p => (fm(p) == null || fm(p) >= 6.7) && (((fm(p) ?? 6.5) >= 7.0 && p.ca >= weakest.ca - 4) || judge(p.ca, ab, p.id + 'c') >= weakest.ca + 3)).sort((a, b) => b.ca - a.ca)[0];
    if (cand && cand.id !== weakest.id) start.push([cand.id, `Start him ahead of ${weakest.n}${fm(weakest) != null ? ` (${fAvg(weakest).toFixed(2)} recently)` : ''}${fm(cand) != null ? `; he has averaged ${fAvg(cand).toFixed(2)} when called on` : ''}.`, weakest.id]);
  }
  for (const p of sq.filter(p => xi.has(p.id))) {
    const f = fm(p);
    if (!fit(p)) drop.push([p.id, p.inj > 0 ? `Injured (${p.inj} days). Take him out of the team.` : 'Suspended. Take him out of the team.']);
    else if (p.cond < 74) drop.push([p.id, `Tired (${Math.round(p.cond)}% condition). Rest him for the next game.`]);
    else if (f != null && f < 6.3 && p.form.length >= 3) drop.push([p.id, `Out of form (${fAvg(p).toFixed(2)}). A spell on the bench could help.`]);
  }
  // sell list for the next window
  const sell = [];
  const wages = sq.map(p => p.wage || 0).sort((a, b) => a - b); const medW = wages[Math.floor(wages.length / 2)] || 1;
  const senior = sq.filter(p => p.age >= 20).sort((a, b) => a.ca - b.ca);
  for (const p of sq) {
    if (p.age < 20) continue;
    const imp = importance(p); let why = null;
    if (p.req) why = 'has asked to leave; sell while his value holds';
    else if (hap(p) < 30 && imp !== 'key') why = 'is unhappy and unsettling the dressing room';
    else if (p.age >= 31 && imp !== 'key' && p.con <= G.year + 1) why = `is ${p.age} and his best days are behind him; his contract ends in ${p.con}`;
    else if (imp === 'backup' && (p.wage || 0) > medW * 1.3) why = `is a squad player on a big wage (${wageStr(p.wage)})`;
    else if (senior.indexOf(p) >= 0 && senior.indexOf(p) < 2 && p.age >= 23 && p.age <= 29 && imp === 'backup') why = 'is not good enough for this squad';
    if (why) sell.push([p.id, `${why[0].toUpperCase() + why.slice(1)}. Estimated value ${money(calcValue(p))}.`]);
  }
  sell.sort((a, b) => calcValue(P(b[0])) - calcValue(P(a[0])));
  const rep = { d: G.date, by: as.n, ab, inForm, under, start: start.slice(0, 4), drop: drop.slice(0, 4), sell: sell.slice(0, 4) };
  // summary line
  const nm = (x) => x && P(x[0]) ? P(x[0]).n : null;
  const bits = [];
  if (inForm[0]) bits.push(`${nm(inForm[0])} is our best performer right now`);
  if (start[0]) bits.push(`${nm(start[0])} deserves a start`);
  if (drop[0]) bits.push(`${nm(drop[0])} should come out of the team`);
  if (sell[0]) bits.push(`I would sell ${nm(sell[0])}${G.window ? '' : ' in the next window'}`);
  rep.sum = bits.length ? bits.join('; ') + '.' : 'Nothing worrying this week. Keep the same group going.';
  G.asstRep = rep;
  return rep;
}

// ---------- scouts: assignments and monthly reports ----------
const SC_PREF = { win: 'Win-now signing', stop: 'Stop-gap (cheap, experienced)', young: 'High-potential youngster', wonder: 'Wonderkid (19 or under)' };
const SC_LEAGUES = { PL: 'Premier League', CH: 'Championship', LL: 'La Liga', SA: 'Serie A' };
function scRegions() { const o = {}; for (const k in SC_LEAGUES) if (divTeams(k).length) o['L:' + k] = SC_LEAGUES[k]; for (const k in REGIONS) o['R:' + k] = REGIONS[k].n; return o; }
function ensureScouts() {
  ensureStaff();
  if (!G.scouts) {
    const ab = staffAb('scout'); const ud = userDiv();
    const other = ['LL', 'SA', 'PL'].find(x => x !== ud && divTeams(x).length) || 'CH';
    G.scouts = [{ chief: 1, reg: 'L:' + ud, pref: 'win', pos: '' }, { n: genName(), ab: clamp(ab - 3 + R.i(-2, 2), 4, 18), reg: 'L:' + other, pref: 'young', pos: '' }, { n: genName(), ab: clamp(ab - 4 + R.i(-2, 2), 4, 18), reg: 'R:sa', pref: 'wonder', pos: '' }];
  }
  return G.scouts;
}
function scName(s) { return s.chief ? G.staff.scout.n : s.n; }
function scAb(s) { return s.chief ? staffAb('scout') : s.ab; }
function potBy(p, ab, who) { const noise = ((hash(p.id + '|pa|' + who) % 1000) / 1000 - 0.5) * (22 - ab) * 1.3; return clamp(Math.round(Math.max(p.ca, p.pa + noise)), p.ca, 99); }
function groupLevel(g) { const xs = squad(G.user).filter(p => POS_GROUP[p.pos] === g).map(p => p.ca).sort((a, b) => b - a); const n = { G: 1, D: 4, M: 4, A: 3 }[g]; const top = xs.slice(0, n); return top.length ? top.reduce((a, b) => a + b, 0) / top.length : 70; }
function scoutRecs(s) {
  const ab = scAb(s), who = scName(s); const [kind, code] = s.reg.split(':'); const u = userTeam(); const bud = Math.max(3, u.tb || 0);
  const seen = new Set((G.scSeen || []).slice(-40));
  const pg = s.pos ? [s.pos] : ['G', 'D', 'M', 'A'];
  if (kind === 'R') return scoutRegion(s, code, ab, who);
  const pool = Object.values(G.players).filter(p => p && divOf(p.c) === code && p.c !== G.user && !p.loan && pg.includes(POS_GROUP[p.pos]) && !seen.has(p.id));
  let list = [];
  const pot = (p) => potBy(p, ab, who);
  if (s.pref === 'wonder') list = pool.filter(p => p.age <= 19 && pot(p) >= 78).sort((a, b) => pot(b) - pot(a));
  else if (s.pref === 'young') list = pool.filter(p => p.age <= 21 && pot(p) >= 74).sort((a, b) => (pot(b) + b.ca * .3) - (pot(a) + a.ca * .3));
  else if (s.pref === 'stop') list = pool.filter(p => p.age >= 28 && p.ca >= groupLevel(POS_GROUP[p.pos]) - 4 && (p.con <= G.year + 1 || askingPrice(p) <= bud)).sort((a, b) => (b.ca - askingPrice(b) * .4) - (a.ca - askingPrice(a) * .4));
  else list = pool.filter(p => p.age >= 22 && p.age <= 30 && p.ca >= groupLevel(POS_GROUP[p.pos]) + 1).sort((a, b) => (b.ca - Math.max(0, askingPrice(b) - bud) * .3) - (a.ca - Math.max(0, askingPrice(a) - bud) * .3));
  if (list.length < 3) {
    const band = s.pref === 'wonder' ? (p) => p.age <= 19 : s.pref === 'young' ? (p) => p.age <= 21 : s.pref === 'stop' ? (p) => p.age >= 28 : (p) => p.age >= 22 && p.age <= 30;
    const more = pool.filter(p => band(p) && !list.includes(p)).sort((a, b) => (s.pref === 'wonder' || s.pref === 'young' ? pot(b) - pot(a) : b.ca - a.ca));
    list = list.concat(more);
  }
  const aff = list.filter(p => askingPrice(p) <= bud * 1.25); const pick = (aff.length >= 3 ? aff : list).slice(0, 3);
  return pick.map(p => {
    const fee = askingPrice(p), pt = pot(p);
    const note = s.pref === 'wonder' ? `Rare talent. I see him reaching ${pt >= 88 ? 'world class' : pt >= 82 ? 'a top international level' : 'a strong first-team level'}.` :
      s.pref === 'young' ? `Already ${p.ca >= 72 ? 'close to first-team level' : 'developing well'}, with room to grow.` :
      s.pref === 'stop' ? `${p.ca >= groupLevel(POS_GROUP[p.pos]) - 4 ? 'Experienced and ready now' : 'Experienced cover, below our first-choice level'}${p.con <= G.year + 1 ? `; his contract ends in ${p.con}, so he could be cheap` : ''}.` :
      (p.ca >= groupLevel(POS_GROUP[p.pos]) + 1 ? `Would improve our ${posGrpN(POS_GROUP[p.pos])}s straight away.` : `The best ${posGrpN(POS_GROUP[p.pos])} I saw, but not clearly better than what we have.`);
    return { pid: p.id, fee, pot: pt, note: note + (fee > bud ? ' Over our current budget.' : '') };
  });
}
// regions outside the game's leagues: the scout finds new players there (signable from Transfers › Scouting)
function scoutRegion(s, code, ab, who) {
  const reg = REGIONS[code]; const out = []; const want = s.pos ? Object.keys(POS_GROUP).filter(k => POS_GROUP[k] === s.pos) : null;
  for (let i = 0; i < 3; i++) {
    const pos = want ? R.pick(want) : R.pick(['GK', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'AM', 'LW', 'RW', 'ST', 'ST']);
    let age, ca, pa;
    if (s.pref === 'wonder') { age = R.i(16, 18); ca = clamp(Math.round(54 + (age - 16) * 3 + R.gauss() * 4 + ab * .3), 48, 72); pa = clamp(ca + R.i(16, 26) + Math.round(ab * .3), 78, 95); }
    else if (s.pref === 'young') { age = R.i(18, 21); ca = clamp(Math.round(60 + (age - 18) * 2.5 + R.gauss() * 4 + ab * .3), 55, 76); pa = clamp(ca + R.i(8, 16), 70, 90); }
    else if (s.pref === 'stop') { age = R.i(28, 32); ca = clamp(Math.round(groupLevel(POS_GROUP[pos]) - 4 + R.gauss() * 3), 60, 82); pa = ca; }
    else { age = R.i(23, 28); ca = clamp(Math.round(groupLevel(POS_GROUP[pos]) + R.gauss() * 3), 62, 84); pa = ca + R.i(0, 3); }
    const p = mkPlayer({ n: R.pick(reg.f) + ' ' + R.pick(reg.l), c: 'ABROAD', pos, age, nat: R.pick(reg.nat), ca, pa, seed: R.i(1, 999) });
    p.gone = reg.where; p.con = G.year + (s.pref === 'stop' ? 1 : 2); p.wage = calcWageDemand(p, 70); p.scouted = true; p.no = 0;
    G.players[p.id] = p; G.prospects = (G.prospects || []).concat(p.id).slice(-30);
    out.push({ pid: p.id, fee: askingPrice(p), pot: potBy(p, ab, who), note: `Plays for ${reg.where}. ${s.pref === 'stop' ? 'Ready-made and should come cheap.' : s.pref === 'win' ? 'Good enough to play for us now.' : 'One for the future.'}` });
  }
  return out;
}
function scoutMonth(force) {
  if (!G || G.sacked || !T(G.user) || isNatT(G.user)) return;
  const key = G.date.slice(0, 7); if (!force && G.scM === key) return; G.scM = key;
  const reps = [];
  for (const [i, s] of ensureScouts().entries()) {
    if (!s.reg) continue;
    let recs = []; try { recs = scoutRecs(s); } catch (e) { console.error(e); }
    G.scSeen = (G.scSeen || []).concat(recs.map(r => r.pid)).slice(-60);
    reps.push({ i, n: scName(s), ab: scAb(s), reg: s.reg, pref: s.pref, pos: s.pos, recs });
  }
  G.scRep = { d: G.date, m: key, reps };
  const top = reps.map(r => r.recs[0] && P(r.recs[0].pid) ? `${r.n}: ${P(r.recs[0].pid).n} (${scRegions()[r.reg] || ''})` : null).filter(Boolean);
  msg('Scout reports', `Your scouts have filed their ${monthLabel(key)} reports. ${top.length ? 'Top picks: ' + top.join('; ') + '.' : 'Nobody worth signing this month.'}`, { k: 'nav', v: 'reports', lab: 'Open scout reports', tab: 'sc' });
}

// ---------- happiness: the reasons behind it ----------
function hapReasons(p) {
  const pos = [], neg = []; if (!p || p.c !== G.user) return { pos, neg };
  const t = userTeam(); const sq = squad(G.user).filter(q => q.id !== p.id); const xi = new Set((t.tac.xi || []).filter(Boolean));
  const n = teamGames();
  // club position
  try {
    const tb = userTable(); const ps = tb.findIndex(r => r.t === G.user) + 1; const tgt = boardTarget().pos;
    if (n >= 4 && ps) { if (ps === 1) pos.push(`Loves being top of the ${COMP_NAME[userDiv()]}`); else if (ps <= tgt) pos.push(`Proud of the club's ${ordinal(ps)} place in the league`); else if (ps > tgt + 3) neg.push(`Unhappy with the club sitting ${ordinal(ps)} in the league`); }
  } catch (e) { }
  if (G.euro && G.euro.UCL && G.euro.UCL.teams.includes(G.user)) pos.push('Excited to be playing Champions League football');
  // captaincy
  const capt = P(t.capt);
  if (t.capt === p.id) pos.push(`Is proud to captain ${t.name}`);
  else if (t.vice === p.id) pos.push('Enjoys his role as vice-captain');
  else if (capt) {
    const cp = typeof captainProblem === 'function' ? captainProblem() : null;
    const best = typeof bestLeaders === 'function' ? bestLeaders(G.user)[0] : null;
    if (cp && best && best.id === p.id) neg.push(`Feels he should be captain instead of ${capt.n}`);
    else if (lead(capt) >= 14 && hash(p.id + capt.id) % 3 === 0) pos.push(`Thinks ${capt.n} is a great captain`);
  }
  // team-mates
  const star = sq.filter(q => q.ca >= 85).sort((a, b) => b.ca - a.ca)[0];
  if (star && hash(p.id + star.id) % 2 === 0) pos.push(`Thinks ${star.n} is a world-class player`);
  const friend = sq.filter(q => q.nat === p.nat && Math.abs(q.age - p.age) <= 8).sort((a, b) => hash(p.id + a.id) % 97 - hash(p.id + b.id) % 97)[0];
  if (friend) pos.push(`Gets on well with ${friend.n}${p.nat !== 'ENG' && natRow(p.nat) ? ` (both ${natRow(p.nat).name})` : ''}`);
  const foe = sq.find(q => q.age >= 18 && p.age >= 18 && hash([p.id, q.id].sort().join('|')) % 331 === 0);
  if (foe) neg.push(`Has fallen out with ${foe.n} after a training-ground row`);
  const r = startRatio(p); const st = squadStatus(p);
  if (!xi.has(p.id) && p.inj <= 0 && r != null && n - (p.mi || 0) >= 4 && r + .15 < STATUS_EXP[st]) {
    const rival = sq.filter(q => xi.has(q.id) && q.pos === p.pos).sort((a, b) => b.st.s - a.st.s)[0] || sq.filter(q => xi.has(q.id) && POS_GROUP[q.pos] === POS_GROUP[p.pos]).sort((a, b) => b.st.s - a.st.s)[0];
    neg.push(rival ? `Unhappy that ${rival.n} keeps starting ahead of him` : 'Wants more first-team football');
  } else if (r != null && n - (p.mi || 0) >= 4 && r >= STATUS_EXP[st]) pos.push('Happy with his playing time');
  const rich = sq.filter(q => q.ca <= p.ca - 3 && (q.wage || 0) >= (p.wage || 0) * 1.5 && q.age >= 21).sort((a, b) => b.wage - a.wage)[0];
  if (rich && p.ca >= 70) neg.push(`Feels underpaid next to ${rich.n} (${wageStr(rich.wage)} v his ${wageStr(p.wage)})`);
  // the manager
  if (p.lt && dDiff(p.lt.d, G.date) <= 35) { if (p.lt.dh > 0) pos.push(`Appreciated his last chat with the manager (${p.lt.l})`); else if (p.lt.dh < 0) neg.push(`Upset by the manager's words in their last chat (${p.lt.l})`); }
  if ((p.trust || 0) < 0) neg.push(`Hasn't forgiven ${G.mgr} for a broken promise`);
  if (p.prom) neg.push(`Waiting for the ${p.prom.need} starts he was promised`);
  if (p.req) neg.push('Has asked to leave the club');
  // form, contract, results
  const fa = fAvg(p, 5);
  if (fa != null && p.form.length >= 3) { if (fa >= 7.2) pos.push(`Enjoying his football (${fa.toFixed(2)} average in his last games)`); else if (fa < 6.3) neg.push('Short of confidence after a poor run of form'); }
  if (p.con <= G.year + 1 && p.ca >= 72 && p.age < 32) neg.push(`Worried about his contract, which ends in ${p.con}`);
  const res = Object.values(G.fx).filter(f => f.r && (f.h === G.user || f.a === G.user)).sort((a, b) => a.d < b.d ? -1 : 1).slice(-5);
  const wins = res.filter(f => (f.h === G.user ? f.r[0] - f.r[1] : f.r[1] - f.r[0]) > 0).length;
  if (res.length >= 4 && wins >= 4) pos.push("Buoyed by the team's winning run");
  if (p.mor < 45) neg.push('Low on morale');
  return { pos, neg };
}
// small weekly effects of the team-mate, wage, captaincy and Europe factors
function hapWeek() {
  for (const p of squad(G.user)) {
    const r = hapReasons(p); let d = 0;
    for (const x of r.pos) if (/world-class|great captain|Gets on well|captain \w|vice-captain|Champions League/.test(x)) d += .25;
    for (const x of r.neg) if (/fallen out|underpaid|should be captain/.test(x)) d -= .4;
    if (d) setHap(p, d);
  }
}
const TALK_L = { praise: 'praised his form', criticise: 'criticised his form', time: 'playing time', contract: 'contract', encourage: 'encouragement', stay: 'asked him to stay', letgo: 'agreed to sell him' };
const _talkR = talkTo;
talkTo = function (pid, k) { const p = P(pid); const h0 = p ? hap(p) : 0; const r = _talkR(pid, k); try { if (p && p.c === G.user && r && r.cls !== 'dim') p.lt = { d: G.date, k, l: TALK_L[k] || k, dh: Math.round(hap(p) - h0) }; } catch (e) { console.error(e); } return r; };
function hapReasonsHtml(p) {
  const r = hapReasons(p); if (!r.pos.length && !r.neg.length) return '';
  const li = (xs, c, ic) => xs.map(x => `<li><span class="${c}">${ic}</span> ${esc(x)}</li>`).join('');
  return `<div class="grid2" style="margin-top:8px;gap:10px"><div class="box pad"><label class="lb">Happy about</label><ul class="hapl">${li(r.pos, 'grn', '▲') || '<li class="dim">Nothing in particular</li>'}</ul></div><div class="box pad"><label class="lb">Bothered by</label><ul class="hapl">${li(r.neg, 'red', '▼') || '<li class="dim">Nothing at the moment</li>'}</ul></div></div>`;
}
const _tbR = talkBlock;
talkBlock = function (p) {
  const h = _tbR(p); if (!h || p.c !== G.user) return h;
  const k = '<div class="row" style="margin-top:8px">'; const i = h.indexOf(k);
  let x = ''; try { x = hapReasonsHtml(p); } catch (e) { console.error(e); }
  return i > 0 ? h.slice(0, i) + x + h.slice(i) : h + x;
};

// ---------- screen ----------
function repRows(list, emptyTxt) {
  const xs = (list || []).filter(x => P(x[0]));
  if (!xs.length) return `<p class="dim" style="margin:4px 0">${emptyTxt}</p>`;
  return `<div class="tw"><table class="t"><tbody>${xs.map(([pid, why]) => { const p = P(pid); return `<tr class="click" data-a="player" data-v="${pid}"><td style="white-space:nowrap"><b>${esc(p.n)}</b> <span class="mono dim">${POS_LABEL[p.pos]}</span></td><td class="n mono">${p.ca}</td><td style="white-space:normal">${esc(why)}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function scrReports() {
  if (!T(G.user) || isNatT(G.user)) return '<div class="band">Reports</div><p class="dim">Staff reports are for club jobs.</p>';
  ensureStaff(); ensureScouts();
  const tab = UI.tab.rep || 'as';
  const tabs = `<div class="tabs" style="margin-top:8px"><button class="${tab === 'as' ? 'on' : ''}" data-a="tab" data-k="rep" data-v="as">Assistant manager</button><button class="${tab === 'sc' ? 'on' : ''}" data-a="tab" data-k="rep" data-v="sc">Scouts</button></div>`;
  let body = '';
  if (tab === 'as') {
    const r = G.asstRep || assistantReport();
    body = `<div class="box pad" style="margin-top:8px"><b>${esc(r.by)}</b> <span class="dim">Assistant Manager · ${r.ab}/20 · report of ${dNice(r.d, false)}</span><p style="margin:6px 0 0">“${esc(r.sum)}”</p><div class="row" style="margin-top:8px"><button class="btn" data-a="asrep">Ask for an update now</button></div></div>
    <h2 class="sect">Deserves to start</h2>${repRows(r.start, 'Nobody is knocking on the door. The current eleven is the right one.')}
    <h2 class="sect">Should be dropped or rested</h2>${repRows(r.drop, 'Everyone in the team has earned his place.')}
    <h2 class="sect">Best form</h2>${repRows(r.inForm, 'Nobody is in outstanding form yet.')}
    <h2 class="sect">Underperforming</h2>${repRows(r.under, 'Nobody is badly out of form.')}
    <h2 class="sect">Recommend selling ${G.window ? 'now' : 'in the next window'}</h2>${repRows(r.sell, 'I would keep everyone.')}
    <p class="dim" style="font-size:12.5px">A better assistant judges form and ability more accurately. A new report arrives every week.</p>`;
  } else {
    const regs = scRegions(); const S = ensureScouts(); const rep = G.scRep;
    const sel = (i, k, opts, v) => `<select class="f" data-a="scset" data-k="${i}:${k}">${Object.entries(opts).map(([a, b]) => `<option value="${a}" ${v === a ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>`;
    body = `<p class="dim" style="margin:8px 0">Give each scout a league or region and a brief. They report on the 1st of every month; players they find abroad appear under Transfers › Scouting. Budget: ${money(userTeam().tb)}.</p>
    <div class="grid3">${S.map((s, i) => `<div class="box pad"><b>${esc(scName(s))}</b> <span class="dim">${s.chief ? 'Chief Scout' : 'Scout'} · ${scAb(s)}/20</span>
      <label class="lb" style="margin-top:6px">Assignment</label>${sel(i, 'reg', regs, s.reg)}
      <label class="lb" style="margin-top:6px">Looking for</label>${sel(i, 'pref', SC_PREF, s.pref)}
      <label class="lb" style="margin-top:6px">Position</label>${sel(i, 'pos', { '': 'Any', G: 'Goalkeeper', D: 'Defender', M: 'Midfielder', A: 'Forward' }, s.pos)}</div>`).join('')}</div>
    <div class="row" style="margin-top:8px"><button class="btn" data-a="screp">Ask for reports now</button>${rep ? `<span class="dim">Last reports: ${monthLabel(rep.m)}</span>` : ''}</div>
    ${rep ? rep.reps.map(r => `<h2 class="sect">${esc(r.n)} <span class="dim" style="font-size:15px">${esc(regs[r.reg] || '')} · ${esc(SC_PREF[r.pref])}${r.pos ? ' · ' + posGrpN(r.pos) + 's' : ''}</span></h2>${r.recs.filter(x => P(x.pid)).length ? `<div class="tw"><table class="t"><thead><tr><th>Player</th><th class="n">Age</th><th>Club</th><th class="n">Ovr</th><th class="n">Pot.</th><th class="n">Fee</th><th>Scout's view</th></tr></thead><tbody>${r.recs.filter(x => P(x.pid)).map(x => { const p = P(x.pid); return `<tr class="click" data-a="player" data-v="${p.id}"><td style="white-space:nowrap"><b>${esc(p.n)}</b> <span class="mono dim">${POS_LABEL[p.pos]}</span></td><td class="n">${p.age}</td><td>${p.c === 'ABROAD' ? esc(p.gone || 'Abroad') : esc(tName(p.c))}</td><td class="n mono">${p.ca}</td><td class="n mono">${x.pot}</td><td class="n">${money(x.fee)}</td><td style="white-space:normal">${esc(x.note)}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="dim">Found nobody who fits the brief.</p>'}`).join('') : '<p class="dim">No reports yet. The first ones arrive at the start of next month, or ask for them now.</p>'}`;
  }
  return `<div class="band">Reports<small>Assistant manager and scouts</small></div>${tabs}${body}`;
}
const _scrRep = screen;
screen = function (s) { if (s === 'reports') { try { return scrReports(); } catch (e) { console.error(e); return '<p class="dim">Reports unavailable.</p>'; } } return _scrRep(s); };
Object.assign(ACT, {
  asrep: () => { assistantReport(); autosave(); render(); },
  screp: () => { if (G.scForce === G.date.slice(0, 7)) { toast('Your scouts already sent extra reports this month.'); return; } G.scForce = G.date.slice(0, 7); scoutMonth(true); autosave(); render(); }
});
document.addEventListener('change', (ev) => {
  const el = ev.target; if (!el || !el.dataset || el.dataset.a !== 'scset') return;
  const [i, k] = el.dataset.k.split(':'); const s = ensureScouts()[+i]; if (!s) return; s[k] = el.value; autosave(); render();
});
// nav entry after Staff; inbox links
const _maR = msgActions;
msgActions = function (m) { if (m && m.act && m.act.k === 'nav' && m.act.lab) return `<div class="row" style="margin-top:14px"><button class="btn pri" data-a="repgo" data-v="${esc(m.act.v)}" data-k="${esc(m.act.tab || '')}">${esc(m.act.lab)}</button></div>`; return _maR(m); };
ACT.repgo = (v, el) => { const k = el && el.dataset ? el.dataset.k : ''; if (k) UI.tab.rep = k; UI.modal = null; UI.scr = v; render(); window.scrollTo(0, 0); };

// ---------- weekly hook ----------
const _wkRep = weekly;
weekly = function () {
  _wkRep();
  try {
    if (G.sacked || !T(G.user) || isNatT(G.user)) return;
    hapWeek();
    if (teamGames() >= 1) { const r = assistantReport(); if (r) msg('Assistant manager report', `${r.by}: “${r.sum}”`, { k: 'nav', v: 'reports', lab: 'Open the full report', tab: 'as' }); }
    scoutMonth(false);
  } catch (e) { console.error(e); }
};
