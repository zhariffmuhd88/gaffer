// ===== UI for extensions =====
Object.assign(TAC_OPTS, {
  line: ['Defensive line', ['Deep', 'Normal', 'High']],
  tackle: ['Tackling', ['Stay on feet', 'Normal', 'Get stuck in']],
  trap: ['Offside trap', ['Off', 'On']],
  counter: ['Counter-attack', ['Off', 'On']],
  waste: ['Time-wasting when ahead', ['Off', 'On']],
  focus: ['Attack focus', ['Left', 'Mixed', 'Middle', 'Right']]
});
const TAC_HELP = {
  ment: 'Higher means more players commit forward, leaving space behind.',
  press: 'A high press wins the ball higher up but tires players and causes fouls.',
  tempo: 'Quick tempo creates more chances of lower quality.',
  width: 'Wide play creates more crosses; narrow play suits short passing through the middle.',
  pass: 'Short passing keeps the ball; direct passing looks for runners in behind.',
  line: 'A high line squeezes the pitch but invites balls in behind. A deep line concedes long shots instead.',
  tackle: 'Getting stuck in wins more duels but brings more fouls and cards.',
  trap: 'Catches runners offside, but when it fails the chance is a clear one.',
  counter: 'Break quickly when you win the ball back. Works best when the opponent attacks.',
  waste: 'Slows the game down to protect a lead late on.',
  focus: 'Which flank, or the middle, your attacks go through.'
};
function roleRef(t, i) { return slotPR(t, i); }
function roleStars(v) { const n = clamp(Math.round((v - 6) / 2.6), 0, 5); return '★'.repeat(n) + '☆'.repeat(5 - n); }

// ---------- tactics (replaces the earlier screen) ----------
function scrTactics() {
  const t = userTeam(); const tac = t.tac;
  if (!tac.xi || tac.xi.length !== 11) autoPick(G.user);
  if (!tac.pr) tac.pr = [];
  ensureCaptains(G.user);
  const slots = FORMS[tac.form];
  const sel = UI.tSel;
  const pitch = slots.map((s, i) => {
    const p = P(tac.xi[i]); const f = p ? fam(p.pos, s[0]) : 0;
    const cls = !p ? 'empty' : f >= .85 ? '' : f >= .7 ? 'f-ok' : 'f-bad';
    const pr = PR[roleRef(t, i)];
    return `<button class="slot ${cls} ${sel && sel.type === 'xi' && sel.i === i ? 'sel' : ''}" style="left:${s[1]}%;bottom:${s[2]}%" data-a="tslot" data-v="${i}" aria-label="${pr.n}"><span class="sh" style="${shirt(G.user)}">${p ? p.no || '' : '+'}</span><span class="nm">${p ? esc(surname(p.n)) : 'Empty'}${p && p.id === t.capt ? ' (C)' : ''}${p && !available(p) ? ' ⚠' : ''}</span><span class="rl">${esc(pr.n)}</span></button>`;
  }).join('');
  const role = sel && sel.type === 'xi' ? slots[sel.i][0] : null;
  const sq = squad(G.user).slice().sort((a, b) => role ? effSkill(b, role, false) - effSkill(a, role, false) : POS_ORDER[a.pos] - POS_ORDER[b.pos] || b.ca - a.ca);
  const where = (id) => { const xi = tac.xi.indexOf(id); if (xi >= 0) return `<span class="yel mono">${ROLE_LABEL[slots[xi][0]]}</span>`; const b = tac.bench.indexOf(id); if (b >= 0) return `<span class="cyan mono">SUB ${b + 1}</span>`; return '<span class="dim">-</span>'; };
  const xiP = tac.xi.map(P).filter(Boolean);
  let rolePanel = '';
  if (role) {
    const cur = roleRef(t, sel.i); const p = P(tac.xi[sel.i]);
    rolePanel = `<div class="box pad" style="margin-bottom:10px"><h2 class="sect" style="margin-top:0">Player role · ${ROLE_LABEL[role]}</h2>
      <div style="display:grid;gap:4px">${rolesFor(role).map(k => `<button class="btn ${k === cur ? 'on' : ''}" style="text-align:left;display:flex;justify-content:space-between;gap:8px" data-a="setrole" data-v="${k}"><span><b>${PR[k].n}</b> <span class="${k === cur ? '' : 'dim'}" style="font-weight:400">· ${esc(PR[k].d)}</span></span>${p ? `<span class="stars" title="How well ${esc(surname(p.n))} suits this role">${roleStars(roleFit(p, k))}</span>` : ''}</button>`).join('')}</div>
      <p class="dim" style="font-size:12.5px;margin-bottom:0">Key attributes for ${PR[cur].n}: ${PR[cur].k.map(k => ATTR_NAMES[k]).join(', ')}. Pick a player below to put him in this slot.</p></div>`;
  }
  const allSq = squad(G.user).slice().sort((a, b) => lead(b) - lead(a));
  const cp = captainProblem();
  return `<div class="band">Tactics<small>${esc(tac.form)} · pick a slot to set its role or change the player</small></div>
  <div class="row" style="margin:10px 0"><div><label class="lb" for="formsel">Formation</label><select class="f" id="formsel" data-a="form">${Object.keys(FORMS).map(f => `<option ${f === tac.form ? 'selected' : ''}>${f}</option>`).join('')}</select></div>
  <span class="spacer"></span><button class="btn" data-a="autopick">Auto-pick best XI</button></div>
  <div class="tact">
    <div><div class="pitch"><div class="half"></div><div class="circ"></div>${pitch}</div>
      <h2 class="sect">Bench</h2>
      <div class="row" style="gap:4px">${Array.from({ length: 9 }, (_, i) => { const p = P(tac.bench[i]); return `<button class="btn ${sel && sel.type === 'bench' && sel.i === i ? 'on' : ''}" style="font-size:12px;padding:3px 7px" data-a="tbench" data-v="${i}">${p ? (p.no || '') + ' ' + esc(surname(p.n)) + ' <span class="dim">' + POS_LABEL[p.pos] + '</span>' : 'Empty'}</button>`; }).join('')}</div>
      <h2 class="sect">Leadership</h2>
      <div class="box pad"><div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">${[['capt', 'Club captain'], ['vice', 'Vice-captain']].map(([k, l]) => `<div><label class="lb" for="cap-${k}">${l}</label><select class="f" id="cap-${k}" style="width:100%" data-a="captsel" data-k="${k}">${allSq.map(p => `<option value="${p.id}" ${t[k] === p.id ? 'selected' : ''}>${esc(p.n)} · lead ${lead(p)}</option>`).join('')}</select></div>`).join('')}</div>
      ${cp ? `<p class="amb" style="margin-bottom:0;font-size:13px">Dressing room concern: ${esc(cp.join('; '))}.</p>` : '<p class="dim" style="margin-bottom:0;font-size:13px">The squad respects the current leadership group. The captain gives a small boost on the pitch; the vice-captain takes over when he is not playing.</p>'}</div>
    </div>
    <div style="min-width:0">
      ${rolePanel}
      <div class="box pad" style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">${Object.entries(TAC_OPTS).map(([k, [lab, opts]]) => `<div><label class="lb" title="${esc(TAC_HELP[k] || '')}">${lab}</label><div class="seg">${opts.map((o, i) => `<button class="${tacVal(tac, k) === i + 1 ? 'on' : ''}" data-a="tac" data-k="${k}" data-v="${i + 1}">${o}</button>`).join('')}</div><div class="dim" style="font-size:11.5px;margin-top:2px">${esc(TAC_HELP[k] || '')}</div></div>`).join('')}</div>
      <div class="grid3" style="margin-top:10px">${[['pk', 'Penalties'], ['fk', 'Free kicks'], ['ck', 'Corners']].map(([k, l]) => `<div><label class="lb" for="tk-${k}">${l}</label><select class="f" id="tk-${k}" style="width:100%" data-a="taker" data-k="${k}">${xiP.map(p => `<option value="${p.id}" ${tac[k] === p.id ? 'selected' : ''}>${esc(p.n)}</option>`).join('')}</select></div>`).join('')}</div>
      <h2 class="sect">${role ? 'Best fits for ' + ROLE_LABEL[role] : 'Squad'}</h2>
      <div class="tw" style="max-height:520px;overflow-y:auto"><table class="t"><thead><tr><th class="n">#</th><th>Name</th><th>Pos</th><th class="n">Ovr</th>${role ? '<th class="n">Fit</th><th>Role</th>' : ''}<th class="n">Cond</th><th>In team</th><th></th></tr></thead><tbody>
      ${sq.map(p => `<tr class="click" data-a="tpick" data-v="${p.id}"><td class="n">${p.no || ''}</td><td>${esc(p.n)}</td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.ca}</td>${role ? `<td class="n ${fam(p.pos, role) >= .85 ? 'grn' : fam(p.pos, role) >= .7 ? 'amb' : 'red'}">${Math.round(effSkill(p, role, false))}</td><td class="stars">${roleStars(roleFit(p, roleRef(t, sel.i)))}</td>` : ''}<td class="n ${condCls(p.cond)}">${Math.round(p.cond)}%</td><td>${where(p.id)}</td><td>${statusTags(p)}</td></tr>`).join('')}
      </tbody></table></div>
    </div>
  </div>`;
}

// ---------- prematch extras ----------
function asstBox(f) {
  if (!G.staff) ensureStaff();
  if (!UI.asstRep || UI.asstRep.fid !== f.id) UI.asstRep = { fid: f.id, lines: assistantReport(f) };
  return `<div class="box pad" style="margin-top:12px"><h2 class="sect" style="margin-top:0">Assistant's report · ${esc(G.staff.asst.n)}</h2>${UI.asstRep.lines.map(l => `<div>· ${esc(l)}</div>`).join('')}<div class="dim" style="font-size:12px;margin-top:4px">Report quality depends on your assistant's ability (${G.staff.asst.ab}/20).</div></div>`;
}
function talkBox(f) {
  if (G.ptalk && G.ptalk.fid === f.id) return `<div class="box pad" style="margin-top:12px"><h2 class="sect" style="margin-top:0">Team talk</h2><p class="grn" style="margin:0">${esc(G.ptalk.res)}</p></div>`;
  return `<div class="box pad" style="margin-top:12px"><h2 class="sect" style="margin-top:0">Team talk</h2><div style="display:grid;gap:5px">${PTALK.map(([k, l]) => `<button class="btn" style="text-align:left" data-a="ptalk2" data-k="${k}" data-v="${f.id}">“${esc(l)}”</button>`).join('')}</div><p class="dim" style="font-size:12.5px;margin-bottom:0">The right message depends on whether you are favourites. Your assistant manager makes it land harder.</p></div>`;
}

// ---------- staff ----------
function scrStaff() {
  ensureStaff();
  const pool = G.staffPool;
  return `<div class="band">Club staff<small>Wages ${wageStr(staffWages())}</small></div>
  <div class="tw" style="margin-top:10px"><table class="t"><thead><tr><th>Role</th><th>Name</th><th class="n">Age</th><th>Ability</th><th class="n">Wage</th><th>What they do</th></tr></thead><tbody>
  ${Object.keys(STAFF_ROLES).map(r => { const s = G.staff[r]; return `<tr><td><b>${STAFF_ROLES[r]}</b></td><td>${esc(s.n)}</td><td class="n">${s.age}</td><td><span class="stars">${roleStars(s.ab)}</span> <span class="mono dim">${s.ab}/20</span></td><td class="n">${wageStr(s.wage)}</td><td style="white-space:normal;min-width:220px" class="dim">${esc(STAFF_FX[r])}</td></tr>`; }).join('')}
  </tbody></table></div>
  <h2 class="sect">Available staff</h2>
  <p class="dim" style="margin-top:0">Hiring someone replaces the current person in that role, who leaves with six months' wages. The list refreshes each summer.</p>
  <div class="tw"><table class="t"><thead><tr><th>Role</th><th>Name</th><th class="n">Age</th><th>Ability</th><th class="n">Wage</th><th></th></tr></thead><tbody>
  ${pool.map((s, i) => `<tr><td>${STAFF_ROLES[s.role]}</td><td>${esc(s.n)}</td><td class="n">${s.age}</td><td><span class="stars">${roleStars(s.ab)}</span> <span class="mono dim">${s.ab}/20</span>${s.ab > G.staff[s.role].ab ? ' <span class="grn">▲</span>' : ''}</td><td class="n">${wageStr(s.wage)}</td><td><button class="btn" data-a="hire" data-v="${i}">Hire</button></td></tr>`).join('')}
  </tbody></table></div>`;
}

// ---------- training ----------
function scrTraining() {
  ensureStaff();
  const sq = squad(G.user).slice().sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos] || b.ca - a.ca);
  const tr = trainTeam();
  return `<div class="band">Training<small>Coach: ${esc(G.staff.coach.n)} (${G.staff.coach.ab}/20)</small></div>
  <h2 class="sect">Team focus</h2>
  <div class="grid3">${Object.entries(TRAIN_TEAM).map(([k, l]) => `<button class="btn ${tr === k ? 'on' : ''}" style="text-align:left;padding:8px 10px" data-a="train" data-v="${k}"><b>${l}</b><div style="font-weight:400;font-size:12.5px;${tr === k ? '' : 'color:var(--dim)'}">${esc(TRAIN_TEAM_D[k])}</div></button>`).join('')}</div>
  <h2 class="sect">Individual focus</h2>
  <p class="dim" style="margin-top:0">Each month, players with a focus may improve an attribute in that area. Young players improve fastest; players over 29 only work on leadership. A better coach means more progress.</p>
  <div class="tw"><table class="t"><thead><tr><th>Player</th><th>Pos</th><th class="n">Age</th><th class="n">Ovr</th><th>Potential (scout)</th><th>Focus</th><th>Gains</th></tr></thead><tbody>
  ${sq.map(p => `<tr><td class="click" data-a="player" data-v="${p.id}"><b>${esc(p.n)}</b></td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.age}</td><td class="n">${p.ca}</td><td class="stars">${potStars(p)}</td><td><select class="f" id="tf-${p.id}" data-a="tfocus" data-v="${p.id}">${Object.entries(TRAIN_IND).filter(([k]) => k !== 'gk' || p.pos === 'GK').filter(([k]) => p.age <= 29 || k === '' || k === 'lea').map(([k, l]) => `<option value="${k}" ${(p.tf || '') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></td><td class="mono dim">${p.ab ? Object.entries(p.ab).map(([k, v]) => k + ' +' + v).join(' ') : ''}${p.lb ? ' Lea +' + p.lb : ''}</td></tr>`).join('')}
  </tbody></table></div>`;
}

// ---------- transfers extra tabs ----------
function scoutTab() {
  ensureStaff();
  const job = G.scoutJob;
  const pros = (G.prospects || []).map(P).filter(p => p && p.c === 'ABROAD');
  return `<div class="box pad"><h2 class="sect" style="margin-top:0">Scouting trips · ${esc(G.staff.scout.n)} (${G.staff.scout.ab}/20)</h2>
  ${job ? `<p>On assignment in <b>${esc(REGIONS[job.r].n)}</b>. Report due ${dNice(job.done, false)}.</p>` : `<p class="dim" style="margin-top:0">Send your chief scout to find young talent. A better scout returns sooner and finds more.</p><div class="row">${Object.entries(REGIONS).map(([k, r]) => `<button class="btn" data-a="scout" data-v="${k}">${esc(r.n)}</button>`).join('')}</div>`}</div>
  <h2 class="sect">Scouted prospects</h2>
  ${pros.length ? `<div class="tw"><table class="t"><thead><tr><th>Player</th><th>Pos</th><th class="n">Age</th><th>Nat</th><th class="n">Ovr</th><th>Potential</th><th>Club</th><th class="n">Fee</th><th></th></tr></thead><tbody>${pros.map(p => `<tr><td class="click" data-a="player" data-v="${p.id}"><b>${esc(p.n)}</b></td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.age}</td><td class="mono dim">${p.nat}</td><td class="n">${p.ca}</td><td class="stars">${potStars(p)}</td><td class="dim">${esc(p.gone)}</td><td class="n">${money(Math.round(calcValue(p) * .8 * 10) / 10)}</td><td><button class="btn pri" data-a="signpro" data-v="${p.id}">Sign</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="dim">No prospects yet.</p>'}`;
}
function loansTab() {
  const inL = squad(G.user).filter(p => p.loan);
  const outL = loanedOut();
  return `<h2 class="sect" style="margin-top:4px">Loaned in</h2>${inL.length ? `<div class="tw"><table class="t"><tbody>${inL.map(p => `<tr class="click" data-a="player" data-v="${p.id}"><td><b>${esc(p.n)}</b></td><td class="mono">${POS_LABEL[p.pos]}</td><td>from ${tLink(p.loan.from)}</td><td class="n">you pay ${Math.round(p.loan.ws * 100)}% · ${wageStr(p.wage * p.loan.ws)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="dim">Nobody. Open a squad or rotation player at another club and choose Request loan.</p>'}
  <h2 class="sect">Loaned out</h2>${outL.length ? `<div class="tw"><table class="t"><tbody>${outL.map(p => `<tr class="click" data-a="player" data-v="${p.id}"><td><b>${esc(p.n)}</b></td><td class="mono">${POS_LABEL[p.pos]}</td><td>at ${tLink(p.c)}</td><td class="dim">returns in the summer</td></tr>`).join('')}</tbody></table></div>` : '<p class="dim">Nobody. Open one of your young or fringe players and choose Loan out.</p>'}
  <p class="dim">Loans last until the end of the season. Young players who go to Championship clubs come back better for the regular football.</p>`;
}

// ---------- player modal extras ----------
function playerExtra(p) {
  const own = p.c === G.user;
  let h = `<h2 class="sect">Potential &amp; character</h2><div class="row" style="gap:18px"><span>Scout's view of potential: <span class="stars" style="font-size:14px">${potStars(p)}</span></span><span>Leadership: <b class="${aClass(lead(p))}">${lead(p)}</b></span>${own && p.id === userTeam().capt ? '<span class="tag new">CAPTAIN</span>' : ''}${own && p.id === userTeam().vice ? '<span class="tag lst">VICE-CAPTAIN</span>' : ''}${p.loan && !p.loan.out ? `<span class="tag out">ON LOAN FROM ${esc(tName(p.loan.from).toUpperCase())}</span>` : ''}</div>`;
  if (own && !p.loan) h += `<div class="row" style="margin-top:8px"><label class="lb" for="ptf" style="margin:0">Training focus</label><select class="f" id="ptf" data-a="tfocus" data-v="${p.id}">${Object.entries(TRAIN_IND).filter(([k]) => k !== 'gk' || p.pos === 'GK').filter(([k]) => p.age <= 29 || k === '' || k === 'lea').map(([k, l]) => `<option value="${k}" ${(p.tf || '') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <button class="btn" data-a="loanout" data-k="ch" data-v="${p.id}">Loan to a Championship club</button><button class="btn" data-a="loanout" data-k="pl" data-v="${p.id}">Loan to a Premier League club</button></div>`;
  if (!own && divOf(p.c) && !p.loan) { const imp = importance(p); if (imp !== 'key' && !(imp === 'first' && p.age > 21)) h += `<div class="row" style="margin-top:8px"><span class="dim">Loan:</span>${[50, 75, 100].map(s => `<button class="btn" data-a="loanin" data-k="${s}" data-v="${p.id}">Request loan, pay ${s}% wages</button>`).join('')}</div>`; }
  return h;
}

// ---------- actions ----------
Object.assign(ACT, {
  setrole: (v) => { const t = userTeam(); if (!UI.tSel || UI.tSel.type !== 'xi') return; t.tac.pr = t.tac.pr || []; t.tac.pr[UI.tSel.i] = v; autosave(); render(); },
  ptalk2: (v, el) => { const txt = preTalk(v, el.dataset.k); autosave(); toast(txt); render(); },
  hire: (v) => { toast(hireStaff(+v)); autosave(); render(); },
  train: (v) => { G.train = v; autosave(); toast(`Team training focus: ${TRAIN_TEAM[v]}.`); render(); },
  scout: (v) => { toast(startScouting(v)); autosave(); render(); },
  signpro: (v) => { const r = signProspect(v); toast(r.msg); autosave(); render(); },
  loanout: (v, el) => { const r = loanOut(v, el.dataset.k); toast(r.msg); if (r.ok) { UI.modal = null; autosave(); } render(); },
  loanin: (v, el) => { const r = loanInRequest(v, +el.dataset.k); toast(r.msg); if (r.ok) { UI.modal = null; autosave(); } render(); },
  bidOpen: (v) => { const p = P(v); const mine = squad(G.user).filter(q => !q.loan).sort((a, b) => b.ca - a.ca); actForm(`<div class="row"><div><label class="lb" for="bidfee">Cash offer to ${esc(tName(p.c))} (£m)</label><input class="f" id="bidfee" type="number" step="0.5" min="0" value="${Math.round(calcValue(p) * 2) / 2}" style="width:120px"></div><div style="min-width:0"><label class="lb" for="bidswap">Include a player (swap)</label><select class="f" id="bidswap" style="max-width:100%"><option value="">No player</option>${mine.map(q => `<option value="${q.id}">${esc(q.n)} · ${POS_LABEL[q.pos]} · ${money(calcValue(q))}</option>`).join('')}</select></div><button class="btn pri" style="align-self:flex-end" data-a="bid" data-v="${v}">Submit offer</button></div><p class="dim" style="margin-bottom:0">Market value ${money(calcValue(p))}. Your budget ${money(userTeam().tb)}. A player you include is valued by them, usually below his market price, and he must agree to move. ${G.window ? '' : '<span class="red">The transfer window is closed.</span>'}</p>`); },
  bid: (v) => { const fee = +($('#bidfee').value || 0); const sw = $('#bidswap') ? $('#bidswap').value : ''; const r = makeBid(v, fee, sw || null); toast(r.msg); if (r.ok) { UI.modal = null; autosave(); render(); } }
});
document.addEventListener('change', (ev) => {
  const el = ev.target; const a = el.dataset && el.dataset.a;
  if (a === 'captsel') { const r = appointCaptain(el.dataset.k, el.value); if (r) toast(r); autosave(); render(); }
  if (a === 'tfocus') { const p = P(el.dataset.v); p.tf = el.value; autosave(); toast(`${p.n}: ${TRAIN_IND[el.value] === 'None' ? 'no individual focus' : TRAIN_IND[el.value] + ' focus'}.`); }
  if (a === 'form') { userTeam().tac.pr = []; }
});
const _screen3 = screen;
screen = function (s) { if (s === 'staff') return scrStaff(); if (s === 'train') return scrTraining(); return _screen3(s); };
const _render0 = render;
render = function () { applyTheme(G && !G.sacked ? G.user : (G ? G.user : null)); if (G && !G.staff) migrate(); _render0(); };
