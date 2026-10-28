// ---------- pre-match ----------
function scrPrematch() {
  const f = userFixtureOn(G.date);
  if (!f) { UI.scr = 'inbox'; return scrInbox(); }
  const issues = validateLineup(G.user);
  const home = f.h === G.user, opp = home ? f.a : f.h, ot = T(opp);
  const tbs = { PL: leagueTable(), CH: champTable() }; const tbOf = (t) => tbs[divOf(t)] || [];
  const pos = (t) => { const i = tbOf(t).findIndex(r => r.t === t); return i >= 0 ? ordinal(i + 1) + (divOf(t) === 'CH' && divOf(G.user) !== 'CH' ? ' (Championship)' : '') : '-'; };
  const formOf = (t) => { const r = tbOf(t).find(x => x.t === t); return r ? `<span class="form">${r.form.slice(-5).map(x => `<span class="${x}">${x}</span>`).join('')}</span>` : ''; };
  const tac = userTeam().tac;
  const xi = tac.xi.map(P);
  const slots = FORMS[tac.form];
  let oppInfo;
  if (ot.lite) oppInfo = `<p>${esc(ot.name)} are simulated at team level (strength ${ot.str}). ${ot.str >= teamStrength(G.user) ? 'They look stronger than you on paper.' : 'You are favourites on paper.'}</p>`;
  else { autoPick(opp); const oxi = ot.tac.xi.map(P).filter(Boolean); oppInfo = `<p class="dim">${esc(ot.mgr)} · usual shape ${ot.tac.form} · league position ${pos(opp)} ${formOf(opp)}</p><div class="tw"><table class="t"><tbody>${oxi.map((p, i) => `<tr class="click" data-a="player" data-v="${p.id}"><td class="mono dim">${ROLE_LABEL[FORMS[ot.tac.form][i][0]]}</td><td>${esc(p.n)}</td><td class="n">${p.ca}</td></tr>`).join('')}</tbody></table></div>`; }
  return `<div class="band yel">${COMP_NAME[f.comp]} · ${esc(typeof f.rnd === 'number' ? 'Matchweek ' + f.rnd : f.rnd || '')}${f.leg ? ' · leg ' + f.leg : ''}<small>${dNice(f.d)} · ${esc(venueOf(f).name)}</small></div>
  <div class="score" style="margin-top:10px"><div class="tm">${badge(f.h)}<span>${esc(tName(f.h))}</span></div><div class="sc" style="font-size:38px">v</div><div class="tm r"><span>${esc(tName(f.a))}</span>${badge(f.a)}</div></div>
  ${mdCard(f)}
  ${f.l1 && G.fx[f.l1].r ? `<p class="yel">First leg: ${esc(tName(G.fx[f.l1].h))} ${G.fx[f.l1].r[0]}-${G.fx[f.l1].r[1]} ${esc(tName(G.fx[f.l1].a))}</p>` : ''}
  ${issues.length ? `<div class="box pad amb" style="margin-top:10px">Lineup changes: ${esc(issues.join('; '))}.</div>` : ''}
  <div class="grid2" style="margin-top:12px">
    <div><h2 class="sect" style="margin-top:0">Your XI · ${esc(tac.form)}</h2><div class="tw"><table class="t"><tbody>${xi.map((p, i) => `<tr class="click" data-a="player" data-v="${p.id}"><td class="mono dim">${ROLE_LABEL[slots[i][0]]}</td><td>${esc(p.n)}</td><td class="n">${p.ca}</td><td class="n ${condCls(p.cond)}">${Math.round(p.cond)}%</td></tr>`).join('')}</tbody></table></div>
      <p class="dim" style="font-size:13px">Bench: ${tac.bench.map(id => esc(surname(P(id).n))).join(', ')}</p></div>
    <div><h2 class="sect" style="margin-top:0">Opponent · ${esc(ot.name)}</h2>${oppInfo}</div>
  </div>
  ${asstBox(f)}
  ${pressBox(f)}
  ${talkBox(f)}
  <div class="ctrl" style="margin-top:14px"><button class="go" data-a="kickoff">PLAY MATCH ▸</button><button class="btn" data-a="nav" data-v="tactics">Change tactics</button><button class="btn" data-a="quicksim">Simulate instantly</button></div>`;
}

// ---------- live match ----------
const SPEEDS = [['Slow', 1100], ['Normal', 520], ['Fast', 170], ['Turbo', 45]];
function startLive(fid, instant) {
  const f = G.fx[fid];
  const pre = preMatch(f);
  const M = createMatch(fid, true);
  UI.match = { M, pre, speed: UI.speedPref != null ? UI.speedPref : 1, run: true, panel: null, sel: null, talked: false, tab: 'log' };
  UI.modal = null;
  if (instant) { simulateFull(M); UI.match.run = false; render(); return; }
  UI.match.view = UI.viewPref || '2d'; visInit(UI.match);
  render(); schedule();
}
function schedule() { const LM = UI.match; if (!LM || !LM.run) return; clearTimeout(LM.timer); LM.timer = setTimeout(tick, SPEEDS[LM.speed][1]); }
function tick() {
  const LM = UI.match; if (!LM || !LM.run) return;
  const M = LM.M;
  stepMinute(M);
  if (LM.vis) visNewMinute(LM, SPEEDS[LM.speed][1]);
  if (M.alert) { LM.alertTxt = M.alert; M.alert = null; LM.run = false; LM.panel = 'subs'; }
  if (M.ht) { M.ht = false; LM.run = false; LM.panel = 'talk'; LM.talked = false; }
  if (M.done) LM.run = false;
  renderMatch();
  schedule();
}
function uSide(M) { return M.sides[0].tid === G.user ? 0 : 1; }
function renderMatch() {
  const LM = UI.match, M = LM.M; const [A, B] = M.sides; const ui = uSide(M);
  const f = G.fx[M.fid];
  const key = M.com.filter(c => ['goal', 'rc', 'yc', 'big', 'ht', 'ft', 'inj', 'sub', 'save', 'miss', 'pen'].includes(c.k));
  const last = key.length ? key[key.length - 1] : M.com[M.com.length - 1];
  const scorers = (i) => M.ev.filter(e => e.t === 'goal' && e.side === i).map(e => esc(surname(pnById(M, e.p))) + ' ' + e.min + "'").join(', ');
  const reds = (i) => M.ev.filter(e => e.t === 'rc' && e.side === i).map(e => '<span class="red">▮</span> ' + esc(surname(pnById(M, e.p)))).join(' ');
  const clock = M.done ? 'FT' : M.min === 0 ? 'KO' : (M.min > 90 && !M.et ? '90' : M.min) + "'";
  const S = M.sides[ui];
  const st = M.sides.map(s => ({ po: Math.round(100 * s.st.po / Math.max(1, A.st.po + B.st.po)), sh: s.st.sh, ot: s.st.ot, co: s.st.co, fo: s.st.fo, yc: s.st.yc, rc: s.st.rc, xg: +s.st.xg.toFixed(2) }));
  const lineup = (s) => `<div class="tw"><table class="t"><thead><tr><th>${esc(s.name)}</th><th class="n">Rtg</th><th class="n">Cnd</th></tr></thead><tbody>${s.ps.map(e => `<tr style="${e.on ? '' : 'opacity:.45'}"><td><span class="mono dim">${ROLE_LABEL[e.role]}</span> ${esc(e.p.pseudo ? cap1(ROLE_NOUN[e.role]) : surname(e.p.n))}${e.g ? ' ⚽'.repeat(e.g) : ''}${e.yc ? ' <span class="yel">▮</span>' : ''}${e.rc ? ' <span class="red">▮</span>' : ''}${e.inj ? ' <span class="red">✚</span>' : ''}${e.subOn ? ' <span class="grn">↑' + e.subOn + "'</span>" : ''}</td><td class="n ${rClass(e.rt)}">${e.rt.toFixed(1)}</td><td class="n ${condCls(e.p.cond)}">${Math.round(e.p.cond)}</td></tr>`).join('')}</tbody></table></div>`;
  let panel = '';
  if (LM.panel === 'talk' && !M.done) {
    const diff = M.score[ui] + M.agg[ui] - M.score[1 - ui] - M.agg[1 - ui];
    panel = `<div class="box pad" style="margin-top:10px"><h2 class="sect" style="margin-top:0">${M.min >= 90 ? 'Before extra time' : 'Half-time'} team talk</h2><p class="dim">You are ${diff > 0 ? 'ahead' : diff < 0 ? 'behind' : 'level'}. What do you tell the players?</p>${LM.talked ? `<p class="grn">${esc(LM.talked)}</p>` : `<div class="row">${[['praise', 'Praise them'], ['encourage', 'Encourage'], ['demand', 'Demand more'], ['calm', 'Keep calm, stay focused']].map(([k, l]) => `<button class="btn" data-a="talk" data-v="${k}">${l}</button>`).join('')}</div>`}</div>`;
  }
  if (LM.panel === 'subs' && !M.done) {
    const on = S.ps.filter(e => e.on);
    panel = `<div class="box pad" style="margin-top:10px">${LM.alertTxt ? `<div class="alert" style="margin-bottom:8px">${esc(LM.alertTxt)}</div>` : ''}<h2 class="sect" style="margin-top:0">Substitutions · ${S.subs} left</h2>
      <div class="grid2"><div><label class="lb">Take off</label>${on.map((e, i) => `<button class="btn ${LM.sel === S.ps.indexOf(e) ? 'on' : ''}" style="display:block;width:100%;text-align:left;margin-bottom:3px" data-a="subOut" data-v="${S.ps.indexOf(e)}"><span class="mono">${ROLE_LABEL[e.role]}</span> ${esc(surname(e.p.n))} <span class="dim">${e.rt.toFixed(1)} · ${Math.round(e.p.cond)}%</span>${e.inj ? ' <span class="red">injured</span>' : ''}${e.yc ? ' <span class="yel">booked</span>' : ''}</button>`).join('')}</div>
      <div><label class="lb">Bring on</label>${S.bench.map((p, i) => `<button class="btn" style="display:block;width:100%;text-align:left;margin-bottom:3px" data-a="subIn" data-v="${i}" ${LM.sel == null || S.subs <= 0 ? 'disabled' : ''}><span class="mono">${POS_LABEL[p.pos]}</span> ${esc(p.n)} <span class="dim">${p.ca}${LM.sel != null ? ' · fit ' + Math.round(effSkill(p, S.ps[LM.sel].role)) : ''}</span></button>`).join('') || '<span class="dim">Bench is empty.</span>'}</div></div>
      <h2 class="sect">Team instructions</h2><div style="display:grid;gap:8px">${tacControls(S.tac, 'mtac')}</div></div>`;
  }
  app().innerHTML = `<div class="start" style="max-width:1180px;padding-top:12px">
    <div class="band"><span>${COMP_NAME[M.comp]} · ${esc(typeof f.rnd === 'number' ? 'Matchweek ' + f.rnd : f.rnd || '')}</span><small>${M.neutral ? 'Neutral venue' : esc(T(f.h).stadium)}${M.agg[0] + M.agg[1] || f.l1 ? ` · aggregate ${M.score[0] + M.agg[0]}-${M.score[1] + M.agg[1]}` : ''}</small></div>
    <div class="score"><div class="tm">${badge(A.tid)}<span>${esc(A.name)}</span></div><div><div class="sc">${M.score[0]}-${M.score[1]}</div><div class="mn">${clock}${M.pens ? ` · pens ${M.pens[0]}-${M.pens[1]}` : ''}</div></div><div class="tm r"><span>${esc(B.name)}</span>${badge(B.tid)}</div>
      <div class="sub"><div>${scorers(0)} ${reds(0)}</div><div style="text-align:right">${scorers(1)} ${reds(1)}</div></div></div>
    <div class="ticker" aria-live="polite">${last ? `<span class="mono">${last.min}'</span> ${esc(last.text)}` : ''}</div>
    <div class="ctrl">
      ${M.done ? `<button class="go" data-a="mfinish">CONTINUE ▸</button>` : `<button class="btn pri" data-a="mrun">${LM.run ? '❚❚ Pause' : '▶ Play'}</button>`}
      ${M.done ? '' : `<div class="seg">${SPEEDS.map(([l], i) => `<button class="${LM.speed === i ? 'on' : ''}" data-a="mspeed" data-v="${i}">${l}</button>`).join('')}</div>
      <button class="btn ${LM.panel === 'subs' ? 'on' : ''}" data-a="mpanel" data-v="subs">Subs &amp; tactics</button><button class="btn" data-a="mskip">Skip to end</button>`}
      ${LM.vis ? `<div class="seg"><button class="${LM.view === '2d' ? 'on' : ''}" data-a="mview" data-v="2d">2D pitch</button><button class="${LM.view !== '2d' ? 'on' : ''}" data-a="mview" data-v="text">Text only</button></div>` : ''}
    </div>
    ${panel}
    <div class="mgrid">
      <div style="min-width:0">${LM.vis && LM.view === '2d' ? '<div id="p2dwrap"></div>' : ''}<div class="log" style="${LM.vis && LM.view === '2d' ? 'height:200px;border-top:0' : ''}">${M.com.slice().reverse().map(c => `<div class="${c.k}"><span class="m">${c.min}'</span><span>${esc(c.text)}</span></div>`).join('')}</div></div>
      <div><div class="box pad">${statBars(st)}</div><div class="grid2" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${lineup(A)}${lineup(B)}</div></div>
    </div>
  </div>`;
  if (LM.vis && LM.view === '2d') { const w = document.getElementById('p2dwrap'); if (w) w.appendChild(LM.vis.cv); }
}
function pnById(M, id) { for (const S of M.sides) for (const e of S.ps) if (e.p.id === id) return e.p.pseudo ? cap1(ROLE_NOUN[e.role]) : e.p.n; return ''; }
function teamTalk(k) {
  const LM = UI.match, M = LM.M, ui = uSide(M), S = M.sides[ui];
  const diff = M.score[ui] + M.agg[ui] - M.score[1 - ui] - M.agg[1 - ui];
  let d, txt;
  if (k === 'praise') { d = diff >= 0 ? 6 : -3; txt = diff >= 0 ? 'The players respond well to the praise.' : 'Some players look puzzled to be praised while behind.'; }
  else if (k === 'encourage') { d = 3; txt = 'The players look motivated.'; }
  else if (k === 'demand') { d = diff < 0 ? 6 : diff === 0 ? 3 : -3; txt = diff < 0 ? 'The players are fired up and want to put things right.' : diff === 0 ? 'The players nod and get back out there.' : 'A few players feel the criticism is unfair.'; }
  else { d = diff > 0 ? 4 : 1; txt = 'The players settle down.'; }
  for (const e of S.ps) if (e.on && !e.p.pseudo) e.p.mor = clamp(e.p.mor + d, 5, 100);
  units(S); LM.talked = txt; renderMatch();
}
function finishLive() {
  const LM = UI.match; const M = LM.M; const f = G.fx[M.fid];
  clearTimeout(LM.timer);
  finalizeMatch(M); postMatch(f, LM.pre);
  const res = finishDay();
  UI.match = null; UI.scr = 'inbox'; UI.msg = null;
  const ui = uSide(M), gf = M.score[ui], ga = M.score[1 - ui];
  const won = gf > ga || (M.pens && M.pens[ui] > M.pens[1 - ui]), lost = !won && (gf < ga || !!M.pens);
  pressAfterMatch(f, won, lost);
  G.fans = clamp((G.fans ?? 60) + (won ? 1.5 : lost ? -2 : 0), 0, 100);
  if (!G.sacked) interviewModal(M);
  toast(`${gf > ga || (M.pens && M.pens[ui] > M.pens[1 - ui]) ? 'Win' : gf < ga || M.pens ? (M.pens ? 'Out on penalties' : 'Defeat') : 'Draw'} · ${M.sides[0].name} ${M.score[0]}-${M.score[1]} ${M.sides[1].name}`);
  render();
}

// ---------- season / job modals ----------
function seasonModal() {
  const L = G.lastSeason; if (!L) return;
  UI.modal = `<div class="band yel"><span>Season review ${L.s}</span><button class="x" style="color:#111" data-a="close" aria-label="Close">×</button></div><div class="mc">
    <div class="grid3"><div><label class="lb">Premier League champions</label><div style="font-size:18px;font-weight:700">${tLink(L.champ, true)}</div>${L.chChamp ? `<label class="lb" style="margin-top:8px">Championship winners</label><div style="font-weight:700">${tLink(L.chChamp, true)}</div>` : ''}</div><div><label class="lb">Your finish${L.div ? ' · ' + COMP_NAME[L.div] : ''}</label><div class="big">${ordinal(L.upos)}</div></div><div><label class="lb">Trophies</label><div>${esc(L.cupsWon.join(', ') || 'None')}</div></div></div>
    <p style="margin-top:12px">${esc(L.verdict)}</p>
    <dl class="kv"><dt>Golden Boot</dt><dd>${L.top ? esc(L.top.n + ' (' + (L.top.st.lg || 0) + ')') : '-'}</dd><dt>Player of the Season</dt><dd>${L.best ? esc(L.best.n) : '-'}</dd><dt>Young Player</dt><dd>${L.young ? esc(L.young.n) : '-'}</dd><dt>Relegated from the PL</dt><dd>${esc(L.rel.map(t => tName(t)).join(', '))}</dd><dt>Promoted to the PL</dt><dd>${esc(L.prom.map(t => tName(t)).join(', '))}</dd>${L.chRel ? `<dt>Relegated to League One</dt><dd>${esc(L.chRel.map(t => tName(t)).join(', '))}</dd><dt>Up from League One</dt><dd>${esc((L.l1prom || []).map(t => tName(t)).join(', '))}</dd>` : ''}</dl>
    <div class="row" style="margin-top:14px">${G.sacked ? '<button class="btn pri" data-a="jobs">Look for a new job</button>' : '<button class="btn pri" data-a="close">Start pre-season</button>'}</div></div>`;
  render();
}
function jobsModal() {
  let offers = jobOffers();
  if (!offers.length) offers = fullTeams().filter(t => t !== G.user).sort((a, b) => T(a).rep - T(b).rep).slice(0, 4);
  UI.modal = `<div class="band"><span>Job centre</span></div><div class="mc"><p>${esc(G.mgr)} is out of work. These clubs are interested:</p>
  <div class="tw"><table class="t"><tbody>${offers.map(t => `<tr><td>${tLink(t, true)} <span class="dim mono" style="font-size:12px">${COMP_SHORT[divOf(t)] || ''}</span></td><td class="dim">${esc(cap1(boardTarget(t).txt))}</td><td class="n">Rep ${T(t).rep}</td><td><button class="btn pri" data-a="takejob" data-v="${t}">Accept job</button></td></tr>`).join('')}</tbody></table></div></div>`;
  render();
}

// ---------- events ----------
function onContinue() {
  if (G.sacked) return jobsModal();
  if (userFixtureOn(G.date)) { UI.scr = 'prematch'; UI.modal = null; return render(); }
  const goBtn = $('#go'); if (goBtn) goBtn.disabled = true;
  setTimeout(() => {
    const r = advance();
    if (r.type === 'match') { UI.scr = 'prematch'; UI.modal = null; }
    else if (r.type === 'results') { UI.msg = null; if (UI.scr === 'prematch') UI.scr = 'inbox'; const n = r.ids.length; toast(`${dNice(G.date, false)}: ${n} result${n === 1 ? '' : 's'} in`); }
    else if (r.type === 'season') { UI.scr = 'inbox'; UI.msg = null; seasonModal(); return; }
    else if (r.type === 'sacked') { return jobsModal(); }
    render();
  }, 10);
}
const ACT = {
  nav: (v) => { UI.scr = v; UI.tSel = null; UI.modal = null; render(); window.scrollTo(0, 0); },
  continue: () => onContinue(),
  msg: (v) => { UI.msg = +v; render(); },
  sort: (v) => { UI.sort = UI.sort.k === v ? { k: v, d: -UI.sort.d } : { k: v, d: ['n', 'pos', 'nat', 'no', 'age', 'con', 'st'].includes(v) ? 1 : -1 }; render(); },
  player: (v) => { UI.talkReply = null; playerModal(v); },
  report: (v) => matchReport(v),
  clubview: (v) => clubModal(v),
  close: () => { UI.modal = null; render(); },
  closeov: (v, el, ev) => { if (ev.target === el) { UI.modal = null; render(); } },
  tab: (v, el) => { UI.tab[el.dataset.k] = v; if (el.dataset.k === 'fx') UI.tab.round = null; render(); },
  round: (v) => { UI.tab.round = +v; render(); },
  tslot: (v) => { UI.tSel = UI.tSel && UI.tSel.type === 'xi' && UI.tSel.i === +v ? null : { type: 'xi', i: +v }; render(); },
  tbench: (v) => { UI.tSel = UI.tSel && UI.tSel.type === 'bench' && UI.tSel.i === +v ? null : { type: 'bench', i: +v }; render(); },
  tpick: (v) => tacticsPick(v),
  autopick: () => { autoPick(G.user, true); UI.tSel = null; autosave(); toast('Best available XI selected.'); render(); },
  tac: (v, el) => { userTeam().tac[el.dataset.k] = +v; autosave(); render(); },
  pickclub: (v) => { const n = $('#mgrname'); if (n) UI.mgrName = n.value; UI.newClub = v; render(); },
  start: () => { const n = $('#mgrname'); const name = (n && n.value.trim()) || 'Manager'; newGame(UI.newClub, name); UI.scr = 'inbox'; UI.msg = null; autosave(); render(); },
  load: () => { const s = loadSave(); if (s) { restore(s); UI.scr = 'inbox'; render(); } },
  list: (v) => { const p = P(v); p.listed = !p.listed; toast(p.listed ? `${p.n} added to the transfer list.` : `${p.n} removed from the transfer list.`); playerModal(v); },
  shortlist: (v) => { if (UI.short.includes(v)) UI.short = UI.short.filter(x => x !== v); else UI.short.push(v); playerModal(v); },
  bidOpen: (v) => { const p = P(v); const ask = askingPrice(p); actForm(`<label class="lb" for="bidfee">Your offer to ${esc(tName(p.c))} (£m)</label><div class="row"><input class="f" id="bidfee" type="number" step="0.5" min="0" value="${Math.round(calcValue(p) * 2) / 2}" style="width:120px"><button class="btn pri" data-a="bid" data-v="${v}">Submit offer</button></div><p class="dim" style="margin-bottom:0">Market value ${money(calcValue(p))}. Your budget ${money(userTeam().tb)}. ${G.window ? '' : '<span class="red">The transfer window is closed.</span>'}</p>`); },
  bid: (v) => { const fee = +($('#bidfee').value || 0); const r = makeBid(v, fee); toast(r.msg); if (r.ok) { UI.modal = null; autosave(); render(); } },
  termsOpen: (v) => { const o = G.offers.find(x => x.id === v); const p = P(o.pid); UI.modal = `<div class="band"><span>Personal terms · ${esc(p.n)}</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc"><p>Fee agreed with ${esc(tName(o.from))}: <b>${money(o.fee)}</b>. ${esc(p.n)} is asking for <b>${wageStr(o.wage)}</b>.</p><div class="row"><div><label class="lb" for="tw">Weekly wage (£k)</label><input class="f" id="tw" type="number" value="${o.wage}" style="width:110px"></div><div><label class="lb" for="ty">Years</label><select class="f" id="ty">${[1, 2, 3, 4, 5].map(y => `<option ${y === 4 ? 'selected' : ''}>${y}</option>`).join('')}</select></div><button class="btn pri" data-a="terms" data-v="${o.id}" style="align-self:flex-end">Offer contract</button></div><p class="dim">Wage bill ${wageStr(wageBill(G.user))} of ${wageStr(userTeam().wb)} budget.</p></div>`; render(); },
  terms: (v) => { const r = offerTerms(v, +$('#tw').value, +$('#ty').value); toast(r.msg); if (r.ok) { UI.modal = null; autosave(); render(); } else { const o = G.offers.find(x => x.id === v); if (o) ACT.termsOpen(v); } },
  cntAcc: (v) => { const r = acceptCounter(v); toast(r.msg); if (r.ok) ACT.termsOpen(v); else render(); },
  withdraw: (v) => { const o = G.offers.find(x => x.id === v); if (o) o.st = 'rejected'; toast('Bid withdrawn.'); render(); },
  offAcc: (v) => { const r = respondOffer(v, true); toast(r.msg); autosave(); render(); },
  offRej: (v) => { const r = respondOffer(v, false); toast(r.msg); render(); },
  offCnt: (v) => { const o = G.offers.find(x => x.id === v); const r = respondOffer(v, false, Math.round(o.fee * 1.25 * 10) / 10); toast(r.msg); autosave(); render(); },
  renewOpen: (v) => { const p = P(v); const d = renewDemand(p); actForm(`<p style="margin-top:0">${esc(p.n)} wants about <b>${wageStr(d)}</b> to sign a new deal (currently ${wageStr(p.wage)} until ${p.con}).</p><div class="row"><div><label class="lb" for="rw">Weekly wage (£k)</label><input class="f" id="rw" type="number" value="${d}" style="width:110px"></div><div><label class="lb" for="ry">Years</label><select class="f" id="ry">${[1, 2, 3, 4, 5].map(y => `<option ${y === 3 ? 'selected' : ''}>${y}</option>`).join('')}</select></div><button class="btn pri" style="align-self:flex-end" data-a="renew" data-v="${v}">Offer contract</button></div>`); },
  renew: (v) => { const r = renewContract(v, +$('#rw').value, +$('#ry').value); toast(r.msg); if (r.ok) { autosave(); playerModal(v); } },
  releaseAsk: (v) => { const p = P(v); const cost = Math.round(p.wage * 52 * Math.max(0, p.con - G.year) / 1000 * 0.5 * 10) / 10; actForm(`<p style="margin-top:0">Releasing ${esc(p.n)} costs a settlement of about <b>${money(cost)}</b>. This cannot be undone.</p><button class="btn warn" data-a="release" data-v="${v}">Release ${esc(p.n)}</button>`); },
  release: (v) => { const r = releasePlayer(v); toast(r.msg); UI.modal = null; autosave(); render(); },
  faOpen: (v) => { const p = P(v); const d = wageFor(p, G.user); actForm(`<p style="margin-top:0">${esc(p.n)} wants about <b>${wageStr(d)}</b>.</p><div class="row"><input class="f" id="fw" type="number" value="${d}" style="width:110px"><select class="f" id="fy">${[1, 2, 3].map(y => `<option>${y}</option>`).join('')}</select><button class="btn pri" data-a="fasign" data-v="${v}">Offer contract</button></div>`); },
  fasign: (v) => { const r = freeAgentSign(v, +$('#fw').value, +$('#fy').value); toast(r.msg); if (r.ok) { UI.modal = null; autosave(); render(); } },
  kickoff: () => { const f = userFixtureOn(G.date); if (f) startLive(f.id); },
  quicksim: () => { const f = userFixtureOn(G.date); if (f) startLive(f.id, true); },
  mrun: () => { const LM = UI.match; LM.run = !LM.run; if (LM.run) { LM.panel = null; LM.alertTxt = null; LM.sel = null; } renderMatch(); schedule(); },
  mspeed: (v) => { UI.match.speed = +v; UI.speedPref = +v; renderMatch(); schedule(); },
  mpanel: (v) => { const LM = UI.match; LM.panel = LM.panel === v ? null : v; if (LM.panel) LM.run = false; renderMatch(); },
  mskip: () => { const LM = UI.match; LM.run = false; const M = LM.M; while (!M.done) { stepMinute(M); M.ht = false; M.alert = null; } renderMatch(); },
  mfinish: () => finishLive(),
  subOut: (v) => { UI.match.sel = +v; renderMatch(); },
  subIn: (v) => { const LM = UI.match, M = LM.M, ui = uSide(M), S = M.sides[ui]; const out = S.ps[LM.sel]; const pin = S.bench[+v]; if (doSub(M, ui, out, pin)) { LM.sel = null; LM.alertTxt = null; } renderMatch(); },
  mtac: (v, el) => { const LM = UI.match, S = LM.M.sides[uSide(LM.M)]; S.tac[el.dataset.k] = +v; units(S); renderMatch(); },
  talk: (v) => teamTalk(v),
  jobs: () => jobsModal(),
  takejob: (v) => { takeJob(v); UI.modal = null; UI.scr = 'inbox'; UI.msg = null; render(); },
  save: () => { autosave(); toast(loadSave() ? 'Game saved in this browser.' : 'This browser blocked saving. Use Export backup instead.'); },
  export: () => { const s = JSON.stringify(G); document.getElementById('exp').innerHTML = `<div class="box pad" style="margin-top:12px"><label class="lb" for="exptxt">Backup text (${Math.round(s.length / 1024)} KB). Copy it and keep it somewhere safe.</label><textarea id="exptxt" class="f" style="width:100%;height:120px" readonly>${esc(s)}</textarea><button class="btn pri" data-a="copyexp" style="margin-top:6px">Copy to clipboard</button></div>`; },
  copyexp: () => { const ta = $('#exptxt'); try { navigator.clipboard.writeText(ta.value).then(() => toast('Backup copied.'), () => { ta.select(); toast('Select all and copy the text manually.'); }); } catch (e) { ta.select(); toast('Select all and copy the text manually.'); } },
  import: () => { try { const o = JSON.parse($('#imp').value); if (!o || !o.players || !o.teams) throw new Error('bad'); restore(o); autosave(); UI.scr = 'inbox'; UI.msg = null; toast('Backup loaded.'); render(); } catch (e) { toast('That text is not a valid backup. Paste the full exported text.'); } },
  newAsk: () => { document.getElementById('newconf').innerHTML = `<p class="red">This replaces your current career.</p><button class="btn warn" data-a="newgo">Yes, start again</button>`; },
  newgo: () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } G = null; UI.newClub = null; UI.modal = null; render(); }
};
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-a]');
  if (!el || el.tagName === 'SELECT' || (el.tagName === 'INPUT' && el.type !== 'button')) return;
  const a = el.dataset.a;
  if (a === 'closeov') { if (ev.target === el) ACT.closeov(null, el, ev); return; }
  if (ACT[a]) { ev.stopPropagation(); ACT[a](el.dataset.v, el, ev); }
});
document.addEventListener('change', (ev) => {
  const el = ev.target; const a = el.dataset && el.dataset.a;
  if (a === 'form') { const t = userTeam(); t.tac.form = el.value; validateLineup(G.user); autosave(); render(); }
  if (a === 'taker') { userTeam().tac[el.dataset.k] = el.value; autosave(); }
  if (a === 'filt') { UI.filt[el.dataset.k] = el.value; render(); const n = document.getElementById(el.id); if (n && el.type !== 'number' && n.tagName === 'INPUT') { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && UI.modal) { UI.modal = null; render(); }
  if (ev.key === 'Enter' && ev.target.dataset && ev.target.dataset.a === 'filt') { UI.filt[ev.target.dataset.k] = ev.target.value; render(); }
});

// patch screen() for prematch
const _screen = screen;
screen = function (s) { if (s === 'prematch') { try { return scrPrematch(); } catch (e) { console.error(e); return `<div class="box pad red">${esc(e.message)}</div>`; } } return _screen(s); };

// ---------- boot ----------
function boot(data) {
  try {
    if (data && data.G) { restore(data.G); UI.scr = data.scr || 'inbox'; }
    else { const s = loadSave(); if (s && s.players) { restore(s); UI.scr = 'inbox'; } }
  } catch (e) { G = null; }
  render();
}
