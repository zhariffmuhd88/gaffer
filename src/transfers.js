// ===== TRANSFERS, CONTRACTS, SEASON END =====
function importance(p) {
  const sq = squad(p.c).filter(q => POS_GROUP[q.pos] === POS_GROUP[p.pos]).sort((a, b) => b.ca - a.ca);
  const rank = sq.indexOf(p);
  const n = { G: 1, D: 4, M: 4, A: 3 }[POS_GROUP[p.pos]];
  return rank < n ? (rank === 0 && p.ca >= 84 ? 'key' : 'first') : rank < n * 2 ? 'rotation' : 'backup';
}
function askingPrice(p) {
  const base = calcValue(p);
  const imp = importance(p);
  let m = { key: 1.7, first: 1.35, rotation: 1.1, backup: .9 }[imp];
  if (p.listed) m *= .8;
  const yrs = p.con - G.year;
  if (yrs <= 1) m *= .85;
  return Math.max(0.1, Math.round(base * m * 10) / 10);
}
function playerInterest(p, toTid) {
  const from = T(p.c), to = T(toTid);
  const rf = from && !from.lite ? from.rep : 60;
  const diff = to.rep - rf;
  if (diff >= -4) return 'yes';
  if (diff >= -12) return p.listed || importance(p) === 'backup' || p.age >= 31 ? 'yes' : 'maybe';
  return 'no';
}
// user makes a bid
function makeBid(pid, fee, swap) {
  const p = P(pid); const u = userTeam();
  if (!G.window) return { ok: false, msg: 'The transfer window is closed.' };
  if (p.c === G.user) return { ok: false, msg: 'He already plays for you.' };
  if (fee > u.tb + 0.001) return { ok: false, msg: `That is more than your transfer budget of ${money(u.tb)}.` };
  if (G.offers.some(o => o.pid === pid && ['pending', 'accepted'].includes(o.st))) return { ok: false, msg: 'You already have an active bid for this player.' };
  const o = { id: 'o' + (++G.newsId), pid, to: G.user, from: p.c, fee, st: 'pending', d: G.date, user: true, swap: swap || null };
  if (swap) { const sp = P(swap); if (!sp || sp.c !== G.user || sp.loan) return { ok: false, msg: 'That player cannot be included.' }; }
  G.offers.push(o);
  return { ok: true, msg: `Bid of ${money(fee)}${swap ? ' plus ' + P(swap).n : ''} submitted to ${tName(p.c)}. Expect a reply within a day or two.` };
}
function resolveUserBids() {
  for (const o of G.offers) {
    if (!o.user || o.st !== 'pending' || dDiff(o.d, G.date) < 1) continue;
    const p = P(o.pid);
    if (!p || p.c !== o.from) { o.st = 'void'; continue; }
    const ask = askingPrice(p) * dofFee();
    const interest = playerInterest(p, G.user);
    const sp = o.swap ? P(o.swap) : null;
    if (sp && (sp.c !== G.user || playerInterest(sp, o.from) === 'no')) { o.st = 'rejected'; msg('Transfer: ' + p.n, `${sp ? sp.n : 'The player you offered'} does not want to move to ${tName(o.from)}, so the swap is off.`); continue; }
    const sv = sp ? swapValue(sp, o.from) : 0;
    if (interest === 'no') { o.st = 'rejected'; msg('Transfer: ' + p.n, `${p.n} has told ${tName(p.c)} he is not interested in joining ${userTeam().name}.`); continue; }
    if (o.fee + sv >= ask) { o.st = 'accepted'; o.wage = Math.round(wageFor(p, G.user) * (interest === 'maybe' ? 1.25 : 1.05) * dofWage()); msg('Transfer: ' + p.n, `${tName(p.c)} have accepted your ${money(o.fee)}${sp ? ' plus ' + sp.n : ''} bid for ${p.n}. He is asking for ${wageStr(o.wage)}. Open Transfers to agree personal terms.`, { k: 'terms', o: o.id }); }
    else if (o.fee + sv >= ask * .75) { o.st = 'countered'; o.counter = Math.max(0.1, Math.round((ask - sv) * 10) / 10); msg('Transfer: ' + p.n, `${tName(p.c)} rejected your ${money(o.fee)} bid for ${p.n} but would accept ${money(o.counter)}.`, { k: 'counter', o: o.id }); }
    else { o.st = 'rejected'; msg('Transfer: ' + p.n, `${tName(p.c)} rejected your ${money(o.fee)} bid for ${p.n} out of hand. They value him at well over that.`); }
  }
}
function acceptCounter(oid) { const o = G.offers.find(x => x.id === oid); if (!o || o.st !== 'countered') return { ok: false, msg: 'Offer no longer available.' }; if (o.counter > userTeam().tb) return { ok: false, msg: 'Not enough transfer budget.' }; o.fee = o.counter; o.st = 'accepted'; const p = P(o.pid); o.wage = Math.round(wageFor(p, G.user) * 1.08 * dofWage()); return { ok: true, msg: `Fee agreed at ${money(o.fee)}. ${p.n} wants ${wageStr(o.wage)}.` }; }
function offerTerms(oid, wage, years) {
  const o = G.offers.find(x => x.id === oid); if (!o || o.st !== 'accepted') return { ok: false, msg: 'This deal is no longer available.' };
  const p = P(o.pid); const u = userTeam();
  if (!G.window) return { ok: false, msg: 'The window is closed.' };
  if (o.fee > u.tb + 0.001) return { ok: false, msg: 'Not enough transfer budget.' };
  const bill = wageBill(G.user);
  if (bill + wage > u.wb * 1.0001 + 0.5) return { ok: false, msg: `That would take your wage bill to ${wageStr(bill + wage)}, over the ${wageStr(u.wb)} budget.` };
  if (wage < o.wage * 0.93) { o.wage = Math.round(o.wage * 1.02); return { ok: false, msg: `${p.n} rejects ${wageStr(wage)}. His agent insists on ${wageStr(o.wage)}.` }; }
  const sp = o.swap ? P(o.swap) : null;
  if (sp && sp.c !== G.user) return { ok: false, msg: `${sp.n} is no longer at the club, so the swap cannot go ahead.` };
  completeTransfer(p, G.user, o.fee, wage, years);
  if (sp) completeTransfer(sp, o.from, 0, Math.round(wageFor(sp, o.from)), 4);
  o.st = 'done';
  return { ok: true, msg: `${p.n} signs for ${u.name} for ${money(o.fee)} on ${wageStr(wage)} until ${G.year + years}.` };
}
function freeAgentSign(pid, wage, years) {
  const p = P(pid); const u = userTeam();
  if (!G.window) return { ok: false, msg: 'Free agents can only be signed while a transfer window is open.' };
  const dem = wageFor(p, G.user);
  if (wage < dem * .93) return { ok: false, msg: `${p.n} wants at least ${wageStr(dem)}.` };
  if (wageBill(G.user) + wage > u.wb + 0.5) return { ok: false, msg: 'That would exceed your wage budget.' };
  G.fa = G.fa.filter(x => x !== pid);
  completeTransfer(p, G.user, 0, wage, years);
  return { ok: true, msg: `${p.n} joins on a free transfer.` };
}
function completeTransfer(p, toTid, fee, wage, years) {
  const fromTid = p.c; const from = T(fromTid); const to = T(toTid);
  if (from && !from.lite && G.sq[fromTid]) { G.sq[fromTid] = G.sq[fromTid].filter(x => x !== p.id); from.bal += fee; from.fin.in.sales += fee; if (fromTid === G.user) from.tb += fee * 0.9; const tt = from.tac; if (tt) { tt.xi = tt.xi.map(x => x === p.id ? null : x); tt.bench = (tt.bench || []).filter(x => x !== p.id); } }
  if (to && !to.lite) { to.bal -= fee; to.fin.out.buys += fee; if (toTid === G.user) to.tb -= fee; G.sq[toTid].push(p.id); }
  p.c = toTid; p.wage = wage; p.con = G.year + years; p.listed = false; p.mor = 80;
  const used = new Set(squad(toTid).filter(q => q !== p).map(q => q.no)); if (used.has(p.no) || !p.no) { let n = 2; while (used.has(n)) n++; p.no = n; }
  const fromName = from ? tName(fromTid) : (p.gone || 'free agency');
  news('Transfer', `${p.n} completes a ${fee ? money(fee) + ' ' : 'free '}move from ${fromName} to ${tName(toTid)}.`, toTid, fromTid === G.user || toTid === G.user || fee >= 25);
  if (!to.lite && toTid !== G.user) autoPick(toTid);
  if (from && !from.lite && fromTid !== G.user && G.sq[fromTid]) autoPick(fromTid);
}
function sellAbroad(p, fee, club) {
  const from = T(p.c);
  G.sq[p.c] = G.sq[p.c].filter(x => x !== p.id); from.bal += fee; from.fin.in.sales += fee; if (p.c === G.user) from.tb += fee * .9;
  const tt = from.tac; tt.xi = tt.xi.map(x => x === p.id ? null : x); tt.bench = (tt.bench || []).filter(x => x !== p.id);
  news('Transfer', `${p.n} leaves ${tName(p.c)} for ${club} in a ${money(fee)} deal.`, p.c, p.c === G.user || fee >= 25);
  p.c = 'ABROAD'; p.gone = club;
}
function respondOffer(oid, accept, counter) {
  const o = G.offers.find(x => x.id === oid); if (!o || o.st !== 'incoming') return { ok: false, msg: 'This offer has expired.' };
  const p = P(o.pid);
  if (!G.window) { o.st = 'expired'; return { ok: false, msg: 'The window has closed.' }; }
  if (accept) {
    o.st = 'done';
    if (o.abroad) sellAbroad(p, o.fee, o.buyer); else completeTransfer(p, o.to, o.fee, Math.round(wageFor(p, o.to)), R.i(3, 5));
    return { ok: true, msg: `${p.n} has been sold for ${money(o.fee)}.` };
  }
  if (counter) {
    if (R.chance(o.fee / counter > .85 ? .55 : .2)) { o.fee = counter; o.st = 'done'; if (o.abroad) sellAbroad(p, o.fee, o.buyer); else completeTransfer(p, o.to, o.fee, Math.round(wageFor(p, o.to)), R.i(3, 5)); return { ok: true, msg: `They agreed to ${money(counter)}. ${p.n} has been sold.` }; }
    o.st = 'rejected'; return { ok: false, msg: `${o.abroad ? o.buyer : tName(o.to)} walked away from the deal.` };
  }
  o.st = 'rejected'; return { ok: true, msg: 'Offer rejected.' };
}
function transferAI() {
  resolveUserBids();
  // incoming bids for user players (roughly twice a week)
  if (R.chance(0.22)) {
    const cands = squad(G.user).filter(p => !p.loan && (p.listed || p.req || p.ca >= 76 || R.chance(.15)) && !G.offers.some(o => o.pid === p.id && o.st === 'incoming'));
    if (cands.length) {
      const p = R.wpick(cands, q => (q.listed || q.req ? 5 : 1) * (q.ca - 60));
      const buyers = fullTeams().filter(t => t !== G.user && T(t).tb > calcValue(p) * .9 && T(t).rep >= p.ca - 18);
      const abroad = R.chance(buyers.length ? .4 : 1);
      const fee = Math.round(calcValue(p) * (p.listed ? R.i(70, 100) : R.i(85, 125)) / 10) / 10;
      if (fee >= .1) {
        const o = { id: 'o' + (++G.newsId), pid: p.id, from: G.user, fee, st: 'incoming', d: G.date };
        if (abroad || !buyers.length) { o.abroad = true; o.buyer = R.pick([].concat(EURO.UCL, EURO.UEL).filter(x => x[1] >= p.ca - 12).map(x => x[0]).concat(['Al-Hilal', 'Al-Nassr', 'Al-Ittihad'])); }
        else o.to = R.pick(buyers);
        G.offers.push(o);
        msg('Offer for ' + p.n, `${o.abroad ? o.buyer : tName(o.to)} have made a ${money(fee)} offer for ${p.n}.`, { k: 'incoming', o: o.id });
      }
    }
  }
  // AI to AI transfers (a few per window)
  if (R.chance(0.1)) {
    const buyer = R.pick(fullTeams().filter(t => t !== G.user));
    const bt = T(buyer);
    const grp = R.pick(['D', 'M', 'A']);
    const target = R.pick(Object.values(G.players).filter(p => divOf(p.c) && !p.loan && p.c !== G.user && p.c !== buyer && POS_GROUP[p.pos] === grp && p.ca >= bt.rep - 12 && p.ca <= bt.rep + 2 && importance(p) !== 'key' && askingPrice(p) < bt.tb && playerInterest(p, buyer) === 'yes'));
    if (target && squad(target.c).length > 20) { const fee = askingPrice(target); bt.tb -= fee; completeTransfer(target, buyer, fee, wageFor(target, buyer), R.i(3, 5)); }
  }
  // AI signs free agents if short
  for (const tid of fullTeams()) if (tid !== G.user && squad(tid).length < 22 && G.fa.length) { const best = G.fa.map(P).sort((a, b) => b.ca - a.ca)[0]; if (best) { G.fa = G.fa.filter(x => x !== best.id); completeTransfer(best, tid, 0, wageFor(best, tid), 2); } }
  // expire stale incoming offers
  for (const o of G.offers) if (o.st === 'incoming' && dDiff(o.d, G.date) > 6) o.st = 'expired';
}
function releasePlayer(pid) {
  const p = P(pid); if (p.c !== G.user) return { ok: false };
  const cost = Math.round(p.wage * 52 * Math.max(0, p.con - G.year) / 1000 * 0.5 * 10) / 10;
  const t = userTeam(); t.bal -= cost; t.fin.out.other += cost;
  G.sq[G.user] = G.sq[G.user].filter(x => x !== pid); t.tac.xi = t.tac.xi.map(x => x === pid ? null : x); t.tac.bench = t.tac.bench.filter(x => x !== pid);
  p.c = 'FA'; p.listed = false; G.fa.push(pid);
  news('Transfer', `${p.n} has been released by ${t.name}.`, G.user);
  return { ok: true, msg: `${p.n} released. Settlement cost: ${money(cost)}.` };
}
function renewDemand(p) { const h = hap(p); return Math.round(Math.max(p.wage * 1.05, wageFor(p, G.user)) * (h < 60 ? 1 + (60 - h) / 100 : 1)); }
function renewContract(pid, wage, years) {
  const p = P(pid); const d = renewDemand(p);
  if (p.req || hap(p) < 20) return { ok: false, msg: `${p.n} is not interested in a new contract while he is this unhappy.` };
  if (p.age >= 33 && years > 2) return { ok: false, msg: `${p.n} is happy with a deal of up to two years, but the board will not go longer at his age.` };
  if (wage < d * .95) return { ok: false, msg: `${p.n} wants ${wageStr(d)}.` };
  const extra = wage - p.wage; if (wageBill(G.user) + extra > userTeam().wb + 0.5) return { ok: false, msg: 'That would exceed your wage budget.' };
  if (G.year + years <= p.con) return { ok: false, msg: `His current deal already runs until ${p.con}. Offer more years.` };
  p.wage = wage; p.con = G.year + years; p.mor = clamp(p.mor + 10, 0, 100);
  return { ok: true, msg: `${p.n} signs a new contract until ${p.con} on ${wageStr(wage)}.` };
}

// ===== SEASON END =====
function seasonEnd() {
  const tb = leagueTable(), ct = champTable();
  const y = G.year, udiv = userDiv();
  const champ = tb[0].t; honour(champ, 'Premier League');
  const chChamp = ct[0].t; if (!T(chChamp).lite) honour(chChamp, 'Championship');
  // merit payments
  tb.forEach((r, i) => prize(r.t, (20 - i) * 2.8 + 8));
  // awards
  const pls = Object.values(G.players).filter(p => G.pl.includes(p.c) || p.st.a > 0);
  const plOnly = pls.filter(p => G.pl.includes(p.c));
  const top = plOnly.slice().sort((a, b) => (b.st.lg || 0) - (a.st.lg || 0))[0];
  const best = plOnly.filter(p => p.st.a >= 15).sort((a, b) => b.st.r / b.st.a - a.st.r / a.st.a)[0];
  const young = plOnly.filter(p => p.st.a >= 12 && p.age <= 21).sort((a, b) => b.st.r / b.st.a - a.st.r / a.st.a)[0];
  const utab = udiv === 'CH' ? ct : tb;
  const upos = utab.findIndex(r => r.t === G.user) + 1;
  const rel = tb.slice(17).map(r => r.t);
  // promotion from the Championship: top two plus the play-off winner
  let poW = G.cups.PO && G.cups.PO.winner;
  if (!poW) { const s1 = quickPO(ct[2].t, ct[5].t), s2 = quickPO(ct[3].t, ct[4].t); poW = quickPO(s1, s2, true); }
  const prom = [ct[0].t, ct[1].t, poW];
  const chRel = ct.slice(21).map(r => r.t);
  const l1 = simLeagueOne();
  const target = boardTarget();
  const cupsWon = [];
  for (const c of ['LC', 'FA']) if (G.cups[c].winner === G.user) cupsWon.push(COMP_NAME[c]);
  for (const c of ['UCL', 'UEL', 'UECL']) if (G.euro[c].winner === G.user) cupsWon.push(EURO_NAMES[c]);
  const promoted = udiv === 'CH' && prom.includes(G.user);
  const relegated = (udiv === 'PL' && rel.includes(G.user)) || (udiv === 'CH' && chRel.includes(G.user));
  G.hist.push({ s: seasonLabel(y), div: udiv, champ, chChamp, upos, team: G.user, cups: cupsWon, top: top ? [top.n, tName(top.c), top.st.lg || 0] : null, best: best ? [best.n, tName(best.c)] : null, young: young ? [young.n, tName(young.c)] : null, rel: rel.map(t => tName(t)), prom: prom.map(t => tName(t)), chRel: chRel.map(t => tName(t)), l1prom: l1.prom.map(t => tName(t)), promoted, relegated });
  // board review
  let verdict;
  const gap = upos - target.pos;
  G.board = clamp(G.board - gap * 4 + cupsWon.length * 10 + (upos === 1 ? 20 : 0) + (promoted ? 25 : 0) - (relegated ? 30 : 0), 0, 100);
  G.mgrRep = clamp(G.mgrRep + (target.pos - upos) * (udiv === 'CH' ? 0.8 : 1.5) + cupsWon.length * 6 + (upos === 1 ? (udiv === 'CH' ? 5 : 10) : 0) + (promoted ? 6 : 0) - (relegated ? 5 : 0), 20, 99);
  const uname = userTeam().name;
  if (relegated && udiv === 'CH') { G.sacked = true; verdict = `${uname} have been relegated to League One and the board has dismissed you.`; }
  else if (relegated && G.board < 40) { G.sacked = true; verdict = `${uname} have been relegated and the board has dismissed you.`; }
  else if (relegated) verdict = `${uname} have been relegated to the Championship. The board wants an immediate promotion push next season.`;
  else if (G.board < 20) { G.sacked = true; verdict = `The board is unhappy with a ${ordinal(upos)}-place finish against a target of ${target.txt}. You have been dismissed.`; }
  else if (promoted) verdict = `Promotion! ${uname} will play in the Premier League next season${ct[0].t === G.user ? ' as Championship winners' : poW === G.user ? ' after winning the play-off final' : ''}.`;
  else verdict = gap <= 0 ? `The board is delighted: ${ordinal(upos)} place met the target to ${target.txt}.` : `The board expected you to ${target.txt}. ${ordinal(upos)} place falls short, but they will give you another season.`;
  G.lastSeason = { s: seasonLabel(y), div: udiv, champ, chChamp, upos, top, best, young, rel, prom, chRel, l1prom: l1.prom, verdict, cupsWon, tb: tb.map(r => [r.t, r.pts]), ct: ct.map(r => [r.t, r.pts]) };
  msg('Season review ' + seasonLabel(y), `${tName(champ, false)} are Premier League champions and ${tName(chChamp, false)} win the Championship. You finished ${ordinal(upos)} in the ${COMP_NAME[udiv]}. ${verdict}${top ? ` Premier League Golden Boot: ${top.n} (${tName(top.c)}) with ${top.st.lg || 0} league goals.` : ''}`);
  news('Promotion and relegation', `Promoted to the Premier League: ${prom.map(t => tName(t)).join(', ')}. Relegated to the Championship: ${rel.map(t => tName(t)).join(', ')}. Relegated to League One: ${chRel.map(t => tName(t)).join(', ')}. Promoted from League One: ${l1.prom.map(t => tName(t)).join(', ')}.`, null, true);
  // European places next season
  const faW = G.cups.FA.winner, lcW = G.cups.LC.winner;
  const order = tb.map(r => r.t).filter(t => !rel.includes(t));
  const ucl = order.slice(0, 5);
  let uel = [order[5]]; if (faW && G.pl.includes(faW) && !ucl.includes(faW) && !rel.includes(faW)) uel.push(faW); else uel.push(order[6]);
  let uecl = [order.find(t => !ucl.includes(t) && !uel.includes(t))]; if (lcW && G.pl.includes(lcW) && !ucl.includes(lcW) && !uel.includes(lcW) && !rel.includes(lcW)) uecl = [lcW];
  // parachute payments step down a year
  for (const tid of G.champTeams) { const t = T(tid); if (t && t.para) { t.para.shift(); if (!t.para.length) delete t.para; } }
  // promotion / relegation
  for (const t of rel) { const tt = T(t); tt.para = PARACHUTE.slice(); tt.rep = Math.min(tt.rep, 70); for (const p of squad(t)) p.wage = Math.max(2, Math.round(p.wage * 0.6)); if (t !== G.user) relegationExodus(t, G.pl.filter(x => !rel.includes(x))); }
  for (const t of prom) { if (T(t).lite) promote(t, 'PL'); else { const tt = T(t); delete tt.para; tt.rep = Math.max(tt.rep, 64); for (const p of squad(t)) p.wage = Math.round(p.wage * 1.5); } }
  for (const t of chRel) if (!T(t).lite) relegate(t);
  for (const t of l1.prom) promote(t, 'CH');
  G.pl = G.pl.filter(t => !rel.includes(t)).concat(prom);
  G.champTeams = G.champTeams.filter(t => !prom.includes(t) && !chRel.includes(t)).concat(rel, l1.prom);
  G.l1 = G.l1.filter(t => !l1.prom.includes(t)).concat(chRel);
  G.euroIn = { UCL: ucl, UEL: uel.filter(Boolean), UECL: uecl.filter(Boolean) };
  G.ded = {};
  // players: aging, development, contracts, retirement
  returnLoans();
  developPlayers();
  youthIntake();
  for (const tid of fullTeams()) if (tid !== G.user) aiRecruit(tid);
  refreshStaffPool();
  for (const tid of fullTeams()) ensureCaptains(tid);
  if (!G.sacked && G.user) for (const p of squad(G.user)) if (p.tf && p.age > 29 && p.tf !== 'lea') p.tf = '';
  for (const tid of fullTeams()) { const t = T(tid); setBudgets(tid); if (tid === G.user) { t.tb = Math.max(divOf(tid) === 'CH' ? 2 : 5, Math.round(t.bal * .45 + (t.rep - 60) * .8 + (target.pos - upos) * 2)); } }
  for (const tid of G.pl) { if (prom.includes(tid)) continue; const t = T(tid); t.rep = clamp(Math.round(t.rep * .85 + (100 - (tb.findIndex(r => r.t === tid) + 1) * 2) * .15), 55, 96); }
  for (const tid of divTeams('CH')) { if (rel.includes(tid)) continue; const t = T(tid); const i = ct.findIndex(r => r.t === tid); if (i >= 0) t.rep = clamp(Math.round(t.rep * .85 + (74 - i) * .15), 50, 72); }
  // new season
  G.year++;
  G.date = sd('2026-07-01');
  G.offers = []; G.board = Math.max(G.board, 45);
  for (const p of Object.values(G.players)) { p.st = newStats(); p.yel = 0; p.sus = 0; p.form = []; p.cond = 100; p.prom = null; p.low = 0; p.mi = 0; }
  buildSeason();
  for (const tid of fullTeams()) { autoPick(tid); T(tid).fin = newFin(); }
  G.seasonEnded = true;
  if (!G.sacked) msg('New season ' + seasonLabel(G.year), `Pre-season has begun${divOf(G.user) === 'CH' ? ' in the Championship' : ''}. The transfer window is open until ${dNice(sd(CAL.WIN1_CLOSE))}. Transfer budget: ${money(userTeam().tb)}. Wage budget: ${wageStr(userTeam().wb)}. Target: ${boardTarget().txt}.`);
  autosave();
}
// relegated AI clubs lose most of their best players (relegation clauses, sales to Premier League clubs or abroad)
function relegationExodus(tid, plClubs) {
  const sq = squad(tid).filter(p => !p.loan).sort((a, b) => b.ca - a.ca);
  let sold = 0;
  for (const p of sq) {
    const ch = p.ca >= 78 ? .85 : p.ca >= 75 ? .6 : p.ca >= 72 ? .3 : 0;
    if (!ch || !R.chance(ch) || sold >= 9) continue;
    const fee = Math.max(1, Math.round(calcValue(p) * R.i(60, 90)) / 100);
    const buyers = plClubs.filter(b => T(b).rep >= p.ca - 10 && b !== G.user);
    if (buyers.length && R.chance(.65)) { const b = R.pick(buyers); completeTransfer(p, b, fee, wageFor(p, b), R.i(3, 5)); T(b).tb = Math.max(0, T(b).tb - fee); }
    else sellAbroad(p, fee, R.pick([].concat(EURO.UCL, EURO.UEL, EURO.UECL).filter(x => x[1] >= p.ca - 8).map(x => x[0]).concat(['Al-Hilal', 'Al-Ahli', 'Fenerbahce'])));
    sold++;
  }
  if (sold) news('Transfer', `Relegated ${tName(tid)} lose ${sold} first-team players in the summer clear-out.`, tid, true);
}
// League One is simulated at team level once a season: top two go up, 3rd-6th play off
function simLeagueOne() {
  if (!G.l1 || !G.l1.length) G.l1 = G.lowerTeams.filter(t => !G.champTeams.includes(t) && !G.pl.includes(t)).slice(0, 24);
  const tb = {}; for (const t of G.l1) tb[t] = { t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  const ids = G.l1.filter(t => T(t));
  for (const h of ids) for (const a of ids) if (h !== a) { const r = quickScore(h, a); addRes(tb[h], r[0], r[1]); addRes(tb[a], r[1], r[0]); }
  const rows = Object.values(tb).sort(sortTable);
  const po = quickPO(quickPO(rows[2].t, rows[5].t), quickPO(rows[3].t, rows[4].t), true);
  G.lastL1 = rows.slice(0, 6).map(r => [r.t, r.pts]);
  return { prom: [rows[0].t, rows[1].t, po], table: rows };
}
function quickPO(a, b, neutral) { const r = quickScore(a, b, neutral); if (r[0] === r[1]) return R.chance(.5) ? a : b; return r[0] > r[1] ? a : b; }
function relegate(tid) {
  const t = T(tid);
  t.str = Math.round(teamStrength(tid) - 4); t.lite = true;
  for (const pid of G.sq[tid]) { const p = P(pid); if (p) { p.c = 'REL_' + tid; } }
  t.relSquad = G.sq[tid]; G.sq[tid] = [];
}
function promote(tid, div) {
  const t = T(tid); const toCH = div === 'CH';
  t.lite = false; t.rep = toCH ? clamp(t.str + 4, 52, 66) : clamp(t.str + 2, 60, 75); t.bal = toCH ? 8 : 35; t.mgr = t.mgr || genName(); t.short = t.short || t.name;
  t.c1 = t.c1 === '#8a8f99' ? R.pick(['#1f6f43', '#7a1f2b', '#2b4a8a', '#a35a00', '#4b2a7a']) : t.c1; t.c2 = '#ffffff';
  t.tac = { form: '4-2-3-1', xi: [], bench: [], ment: 3, press: 2, tempo: 2, width: 2, pass: 2 }; t.fin = newFin();
  G.sq[tid] = [];
  if (t.relSquad && t.relSquad.length) { for (const pid of t.relSquad) { const p = P(pid); if (p && p.c === 'REL_' + tid) { p.c = tid; G.sq[tid].push(pid); } } }
  const plan = { GK: 3, CB: 4, LB: 2, RB: 2, DM: 2, CM: 4, AM: 2, LW: 2, RW: 2, ST: 3 };
  const have = {}; for (const p of squad(tid)) have[p.pos] = (have[p.pos] || 0) + 1;
  let no = 1;
  for (const pos in plan) for (let i = (have[pos] || 0); i < plan[pos]; i++) {
    const ca = toCH ? clamp(Math.round(61 + (t.str - 50) * .45 + R.gauss() * 3), 54, 72) : clamp(Math.round(74 + (t.str - 65) * .4 + R.gauss() * 3.5), 64, 84);
    const p = mkPlayer({ n: genName(), c: tid, no: 0, pos, age: R.i(19, 32), nat: R.pick(NATS_YOUTH), ca, gen: true });
    p.con = G.year + R.i(2, 4); p.wage = wageFor(p, tid); p.val = calcValue(p); p.seed = R.i(1, 999);
    G.players[p.id] = p; G.sq[tid].push(p.id);
  }
  const used = new Set(); for (const p of squad(tid)) { if (!p.no || used.has(p.no)) { while (used.has(no)) no++; p.no = no; } used.add(p.no); }
  setBudgets(tid, true);
}
function developPlayers() {
  for (const p of Object.values(G.players)) {
    if (p.c === 'RETIRED' || p.c === 'ABROAD') continue;
    p.age++;
    const mins = p.st.a;
    let d = 0;
    if (p.age <= 21) d = R.i(0, 4) + (mins > 15 ? 1 : 0) + (p.c === G.user && R.chance(staffAb('coach') / 40) ? 1 : 0);
    else if (p.age <= 24) d = R.i(0, 4) + (mins > 20 ? 1 : 0);
    else if (p.age <= 28) d = R.i(-1, 2);
    else if (p.age <= 31) d = R.i(-2, 1);
    else if (p.age <= 33) d = R.i(-4, 0);
    else d = R.i(-6, -1);
    if (d > 0) d = Math.min(d, Math.max(0, p.pa - p.ca));
    p.ca = clamp(p.ca + d, 35, 96);
    if (p.ca > p.pa) p.pa = p.ca;
    p.val = calcValue(p);
    // retirement
    if (p.age >= 34 && (p.age >= 38 || R.chance((p.age - 33) * .18) || p.ca < 62)) {
      if (G.sq[p.c]) G.sq[p.c] = G.sq[p.c].filter(x => x !== p.id);
      if (p.c === G.user) news('Retirement', `${p.n} has announced his retirement from professional football.`, G.user);
      p.c = 'RETIRED'; G.fa = G.fa.filter(x => x !== p.id); continue;
    }
    // contracts expiring (end of previous season year+1 boundary)
    if (p.con <= G.year + 1 - 0 && G.sq[p.c]) {
      if (p.c === G.user) {
        G.sq[p.c] = G.sq[p.c].filter(x => x !== p.id); news('Contract', `${p.n}'s contract has expired and he has left the club.`, G.user); p.c = 'FA'; G.fa.push(p.id);
      } else if (divOf(p.c)) {
        if (p.age <= 33 && p.ca >= T(p.c).rep - 16 && R.chance(.9)) { p.con = G.year + 1 + R.i(1, 3); p.wage = wageFor(p, p.c); }
        else { G.sq[p.c] = G.sq[p.c].filter(x => x !== p.id); p.c = 'FA'; G.fa.push(p.id); }
      }
    }
  }
  // trim free agent pool
  G.fa = G.fa.filter(id => P(id) && P(id).c === 'FA').sort((a, b) => P(b).ca - P(a).ca).slice(0, 80);
}
function youthIntake() {
  for (const tid of fullTeams()) {
    const t = T(tid); const n = R.i(2, 3);
    const used = new Set(squad(tid).map(p => p.no));
    for (let i = 0; i < n; i++) {
      const pos = R.pick(['GK', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'AM', 'LW', 'RW', 'ST', 'ST']);
      const ca = clamp(Math.round(48 + (t.rep - 60) * .35 + R.gauss() * 5), 40, 70);
      const p = mkPlayer({ n: genName(), c: tid, pos, age: R.i(16, 17), nat: R.pick(NATS_YOUTH), ca, pa: clamp(ca + R.i(10, 34), 55, 94), seed: R.i(1, 999), gen: true });
      let no = 40 + R.i(0, 50); while (used.has(no)) no++; used.add(no); p.no = no;
      p.con = G.year + 1 + 3; p.wage = 2 + Math.round(ca / 20); p.val = calcValue(p);
      G.players[p.id] = p; G.sq[tid].push(p.id);
      if (tid === G.user) news('Youth intake', `${p.n} (${POS_LABEL[pos]}, ${p.age}) has been promoted from the academy.`, G.user);
    }
    // AI keeps squads at a workable size
    if (tid !== G.user) {
      while (squad(tid).length < 23) {
        const best = G.fa.map(P).filter(Boolean).sort((a, b) => b.ca - a.ca)[0];
        if (best) { G.fa = G.fa.filter(x => x !== best.id); best.c = tid; best.con = G.year + 1 + R.i(1, 3); best.wage = wageFor(best, tid); G.sq[tid].push(best.id); }
        else { const p = mkPlayer({ n: genName(), c: tid, pos: R.pick(['CB', 'CM', 'ST', 'LB', 'RW']), age: R.i(21, 29), nat: R.pick(NATS_YOUTH), ca: clamp(t.rep - 12, 55, 80), seed: R.i(1, 999), gen: true }); p.con = G.year + 3; p.wage = wageFor(p, tid); p.no = 30 + squad(tid).length; G.players[p.id] = p; G.sq[tid].push(p.id); }
      }
      if (squad(tid).length > 32) { const cut = squad(tid).sort((a, b) => a.ca - b.ca).slice(0, squad(tid).length - 32); for (const p of cut) { G.sq[tid] = G.sq[tid].filter(x => x !== p.id); p.c = 'FA'; G.fa.push(p.id); } }
    }
  }
}
// take over a different club after dismissal / at season start
function jobOffers() { return fullTeams().filter(t => t !== G.user && T(t).rep <= Math.max(70, G.mgrRep + 8)).sort((a, b) => T(b).rep - T(a).rep).slice(0, 5); }
function takeJob(tid) {
  const old = G.user; G.user = tid; G.sacked = false; G.board = 65; T(tid).mgr = G.mgr; if (T(old)) T(old).mgr = genName();
  msg('New job', `${G.mgr} has been appointed manager of ${T(tid).name}. Target: ${boardTarget().txt}.`);
  autosave();
}

function aiRecruit(tid) {
  const t = T(tid); const need = { G: 2, D: 6, M: 6, A: 4 };
  const posFor = { G: ['GK'], D: ['CB', 'CB', 'LB', 'RB'], M: ['DM', 'CM', 'CM', 'AM'], A: ['LW', 'RW', 'ST', 'ST'] };
  for (const grp in need) {
    let good = squad(tid).filter(p => POS_GROUP[p.pos] === grp && p.ca >= t.rep - 12).length;
    let guard = 0;
    while (good < need[grp] && guard++ < 6) {
      const fa = G.fa.map(P).filter(p => p && POS_GROUP[p.pos] === grp && p.ca >= t.rep - 12).sort((a, b) => b.ca - a.ca)[0];
      let p;
      if (fa) { G.fa = G.fa.filter(x => x !== fa.id); p = fa; }
      else { p = mkPlayer({ n: genName(), pos: R.pick(posFor[grp]), age: R.i(21, 29), nat: R.pick(NATS_YOUTH), ca: clamp(t.rep - R.i(2, 9), 55, 90), seed: R.i(1, 999), gen: true }); G.players[p.id] = p; const fee = calcValue(p); t.bal -= fee; t.fin.out.buys += fee; }
      p.c = tid; p.con = G.year + 1 + R.i(2, 4); p.wage = wageFor(p, tid); p.listed = false;
      const used = new Set(squad(tid).map(q => q.no)); let no = 2; while (used.has(no)) no++; p.no = no;
      G.sq[tid].push(p.id); good++;
      news('Transfer', `${tName(tid)} sign ${p.n} (${POS_LABEL[p.pos]}).`, tid, false);
    }
  }
  // trim excess weakest players
  const sq = squad(tid);
  if (sq.length > 30) for (const p of sq.sort((a, b) => a.ca - b.ca).slice(0, sq.length - 30)) { G.sq[tid] = G.sq[tid].filter(x => x !== p.id); p.c = 'FA'; G.fa.push(p.id); }
}
