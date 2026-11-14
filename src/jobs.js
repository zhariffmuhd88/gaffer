// jobs.js: Manager options. Job security for every club manager (very secure ... very unsecure), worked out from the
// league position against the board's target, recent form and how patient each club's board and fans are.
// Managers who stay very unsecure get sacked; their clubs have a caretaker for a few weeks. You can apply for vacant
// jobs and declare interest in jobs whose manager is under pressure; your own board and fans notice, above all when
// it is a rival, though some understand a step up. Your own job depends on the same patience levels.
// Loaded after leagueone.js (needs LG_ALL, boardTarget, tableOf, isRival).

const SEC_LV = [[80, 'Very secure', 'grn'], [62, 'Secure', 'grn'], [45, 'Stable', ''], [28, 'Unsecure', 'amb'], [0, 'Very unsecure', 'red']];
function secLv(v) { return SEC_LV.find(x => v >= x[0]); }
function secTag(v) { const l = secLv(v); return `<span class="${l[2]}" style="white-space:nowrap"><b>${l[1]}</b></span>`; }
function secBar(v) { const l = secLv(v); const col = l[2] === 'grn' ? 'var(--grn)' : l[2] === 'amb' ? 'var(--amb, #e0a020)' : l[2] === 'red' ? 'var(--red)' : 'var(--dim)'; return `<span style="display:inline-block;width:70px;height:8px;background:var(--line);border-radius:4px;vertical-align:middle;overflow:hidden"><span style="display:block;height:100%;width:${Math.round(v)}%;background:${col}"></span></span>`; }
// board and fan patience per club: below 1 means impatient (big clubs mostly), above 1 patient
function clubPat(tid) {
  const t = T(tid); const h = hash(t.name + '|pat');
  const b = clamp(1.22 - Math.max(0, t.rep - 70) * 0.016 + ((h % 21) - 10) / 50, 0.65, 1.35);
  const f = clamp(1.18 - Math.max(0, t.rep - 74) * 0.013 + ((Math.floor(h / 21) % 21) - 10) / 50, 0.65, 1.35);
  return { b, f };
}
function patLabel(x) { return x < 0.8 ? 'Very impatient' : x < 0.95 ? 'Impatient' : x < 1.1 ? 'Average' : x < 1.22 ? 'Patient' : 'Very patient'; }
function jobClubs() { const out = []; for (const k of LG_ALL()) for (const t of divTeams(k)) if (T(t) && !T(t).lite && !T(t).nat) out.push(t); return out; }
function lgRow(tid) { const d = divOf(tid); if (!d) return null; const tb = tableOf(d); const i = tb.findIndex(r => r.t === tid); return i < 0 ? null : { d, pos: i + 1, n: tb.length, r: tb[i] }; }
function mgrSecRaw(tid) {
  const L = lgRow(tid); if (!L || L.r.p < 3) return 66;
  let tg = 10; try { tg = boardTarget(tid).pos; } catch (e) { }
  const perf = clamp((tg - L.pos) / (L.n / 5), -2.6, 2);
  const f5 = (L.r.form || []).slice(-5); const fp = f5.reduce((a, x) => a + (x === 'W' ? 3 : x === 'D' ? 1 : 0), 0);
  const form = f5.length ? (fp - f5.length * 1.4) / 3 : 0;
  return 56 + perf * 14 + form * 9;
}
function msOf(tid) { G.ms = G.ms || {}; return G.ms[tid] || (G.ms[tid] = { s: 66, since: G.date }); }
function userSec() { const pt = clubPat(G.user); const raw = (G.board ?? 60) * 0.65 + (G.fans ?? 60) * 0.35; return clamp(Math.round(50 + (raw - 50) / ((pt.b * .6 + pt.f * .4))), 0, 100); }
function mgrOf(tid) { return tid === G.user ? G.mgr : (T(tid).mgr || 'Vacant'); }
function isVac(tid) { const t = T(tid); return !!(t && t.vac); }
// how likely a club is to want you
function jobFit(tid) { const t = T(tid); return (G.mgrRep || 50) - t.rep + ((G.jint || []).some(x => x.tid === tid) ? 4 : 0) + (divOf(tid) === 'CH' || divOf(tid) === 'LO' ? 6 : 0); }
function fitLabel(v) { return v >= 2 ? ['Good chance', 'grn'] : v >= -6 ? ['Possible', ''] : v >= -14 ? ['Long shot', 'amb'] : ['Very unlikely', 'red']; }

// ---------- weekly ----------
function sackAI(tid, why) {
  const t = T(tid); const old = t.mgr; const L = lgRow(tid);
  t.vac = { since: G.date, wk: R.i(2, 5), old };
  t.mgr = `${genName()} (caretaker)`;
  G.sackLog = [{ d: G.date, tid, n: old, pos: L ? L.pos : null, lg: L ? L.d : '' }].concat(G.sackLog || []).slice(0, 40);
  news('Manager', `${t.name} have sacked ${old}${L ? ` with the club ${ordinal(L.pos)} in the ${COMP_NAME[L.d] || L.d}` : ''}. ${why || 'The board ran out of patience after a poor run.'} A caretaker takes charge while the club looks for a permanent replacement.`, tid, true);
  try { fanPost(tid, R.pick([`Right decision. Should've happened weeks ago`, `Thanks for everything, but it wasn't working. Time for a fresh start`, `Sacking the manager again… the problem is upstairs`]), { big: true }); trend(tslug(t.short || t.name) + 'Out', 2); } catch (e) { }
  // you had declared interest: the club calls you first
  if ((G.jint || []).some(x => x.tid === tid) && !G.sacked && jobFit(tid) + R.i(-4, 4) >= -8) jobOffer(tid, 'They had noted your interest.');
}
function appointAI(tid) {
  const t = T(tid); const was = t.mgr; delete t.vac; t.mgr = genName(); G.ms[tid] = { s: 72, since: G.date };
  news('Manager', `${t.name} have appointed ${t.mgr} as their new head coach${/caretaker/i.test(was) ? `, replacing caretaker ${was.replace(/ \(caretaker\)/i, '')}` : ''}.`, tid, true);
  G.jint = (G.jint || []).filter(x => x.tid !== tid); G.japp = (G.japp || []).filter(x => x.tid !== tid);
}
function jobOffer(tid, why) {
  G.joff = (G.joff || []).filter(x => x.tid !== tid).concat({ tid, until: addDays(G.date, 7) });
  const t = T(tid);
  msg(`Job offer: ${t.name}`, `${t.name} want ${G.mgr} as their new manager. ${why || ''} Target: ${boardTarget(tid).txt}. The offer stands for a week.`, { k: 'job', tid });
}
function jobsWeek() {
  const live = Object.keys(G.byDate || {}).some(d => d >= G.date);
  for (const tid of jobClubs()) {
    if (tid === G.user) { const m = msOf(tid); m.s = userSec(); continue; }
    const t = T(tid); const m = msOf(tid);
    if (t.vac) { if (dDiff(t.vac.since, G.date) >= t.vac.wk * 7) appointAI(tid); continue; }
    const pt = clubPat(tid); const pat = pt.b * .6 + pt.f * .4;
    let eff = 50 + (mgrSecRaw(tid) - 50) / pat;
    const wk = dDiff(m.since, G.date) / 7; if (wk < 8) eff += (8 - wk) * 2.5;
    if ((G.jint || []).some(x => x.tid === tid)) eff -= 4; // a known candidate circling adds pressure
    m.s = Math.round(clamp(m.s * .55 + eff * .45, 0, 100));
    const L = lgRow(tid);
    if (live && L && L.r.p >= 6 && wk >= 6) { if (m.s < 18 && R.chance(.4)) sackAI(tid); else if (m.s < 28 && R.chance(.06)) sackAI(tid); }
  }
  // applications are answered after a few days
  for (const a of (G.japp || []).filter(a => !a.done && a.due <= G.date)) {
    a.done = 1; const t = T(a.tid); if (!t || !t.vac) continue;
    if (jobFit(a.tid) + R.i(-5, 5) >= -6) jobOffer(a.tid, 'Your application impressed the board.');
    else msg(`Application: ${t.name}`, `${t.name} thank ${G.mgr} for applying but are looking at other candidates.`);
  }
  G.joff = (G.joff || []).filter(x => x.until >= G.date);
  G.jint = (G.jint || []).filter(x => dDiff(x.d, G.date) < 84);
}
// summer: boards that ran out of patience change manager before the new season; everyone else starts fresh
function jobsSummer() {
  for (const tid of jobClubs()) {
    if (tid === G.user) continue; const t = T(tid); const m = msOf(tid);
    if (t.vac) { appointAI(tid); continue; }
    if (m.s < 30 && R.chance(.55)) { const old = t.mgr; t.mgr = genName(); news('Manager', `${t.name} part company with ${old} after a disappointing season. ${t.mgr} takes over for the new campaign.`, tid, true); G.sackLog = [{ d: G.date, tid, n: old, pos: null, lg: divOf(tid) || '' }].concat(G.sackLog || []).slice(0, 40); G.ms[tid] = { s: 72, since: G.date }; }
    else m.s = Math.round(m.s * .4 + 66 * .6);
  }
  G.jint = []; G.japp = [];
}
const _seJob = seasonEnd;
seasonEnd = function () { const r = _seJob.apply(this, arguments); try { if (G && G.teams) jobsSummer(); } catch (e) { console.error(e); } return r; };
const _wkJob = weekly;
weekly = function () { _wkJob.apply(this, arguments); try { if (G && G.teams) jobsWeek(); } catch (e) { console.error(e); } };

// your own job: an impatient board reacts more to each result and sacks sooner; very unhappy fans add pressure
const _brJob = boardReact;
boardReact = function (f) { const b0 = G.board; _brJob(f); try { const pt = clubPat(G.user); G.board = clamp(b0 + (G.board - b0) / pt.b, 0, 100); } catch (e) { } };
checkBoard = function () {
  if (G.sacked || !T(G.user) || T(G.user).lite || isNatT(G.user)) return;
  const L = lgRow(G.user); if (!L || L.r.p < Math.max(4, L.n / 3)) return;
  const pt = clubPat(G.user); const thr = 8 + (1 - pt.b) * 25 + ((G.fans ?? 60) < 25 ? 3 + (1 - pt.f) * 10 : 0);
  if (G.board < thr) { G.sacked = true; msg('Sacked', `The ${userTeam().name} board has lost patience after a run of poor results and has terminated your contract. ${pt.b < .95 ? 'This is a board that expects results quickly.' : ''}`); }
};

// ---------- your moves ----------
function jobReaction(tid, verb) {
  if (G.sacked || !T(G.user) || T(G.user).lite) return '';
  const cur = userTeam(); const t = T(tid); const rival = isRival(G.user, tid); const step = t.rep - cur.rep;
  let b, f, txt;
  if (rival) { b = -15; f = -22; txt = `Fury at ${cur.name}: ${G.mgr} ${verb} at rivals ${t.name}. The board calls it a betrayal.`; }
  else if (step >= 8) { b = -4; f = -3; txt = `${cur.name}'s board is disappointed that ${G.mgr} ${verb} at ${t.name}, but accepts that it would be a step up.`; }
  else { b = -8; f = -8; txt = `${cur.name}'s board is unhappy: ${G.mgr} ${verb} at ${t.name}, ${step <= -8 ? 'a smaller club' : 'a club of similar standing'}.`; }
  G.board = clamp(G.board + b, 0, 100); G.fans = clamp((G.fans ?? 60) + f, 0, 100);
  for (const p of squad(G.user)) p.mor = clamp(p.mor - (rival ? 4 : 2), 5, 100);
  msg('Board', `${txt} Board confidence ${b}, fans ${f}.`);
  try {
    const c = tslug(cur.short || cur.name);
    if (rival) { fanPost(G.user, R.pick([`${G.mgr} sniffing around THEM?? Get out of our club 🐍`, `Judas behaviour. Never forget this.`, `Imagine flirting with ${t.short || t.name}. Disgraceful.`]), { big: true, u: 1 }); trend(c + 'Judas', 4); }
    else if (step >= 8) { fanPost(G.user, R.pick([`Can't blame him for wanting ${t.short || t.name}. Gutted though`, `Ambitious manager, bigger club. That's football`, `Fair play for being honest, but if your head is elsewhere, go`]), { u: 1 }); fanPost(G.user, `Zero loyalty. Disappointed.`, { u: 1 }); }
    else { fanPost(G.user, R.pick([`Why would you even want ${t.short || t.name}? Sideways move and disrespectful`, `Commit to us or leave. Simple.`]), { u: 1 }); trend(c + 'Out', 2); }
    if (R.chance(.5)) journPost(jr('gp'), `${G.mgr} ${verb} at ${t.name}. ${cur.name} supporters not impressed.`, { u: 1 });
  } catch (e) { }
  return txt;
}
function applyJob(tid) {
  const t = T(tid); if (!t || !t.vac) return 'That job has been filled.';
  G.japp = G.japp || []; if (G.japp.some(a => a.tid === tid && !a.done)) return 'You have already applied.';
  G.japp.push({ tid, d: G.date, due: addDays(G.date, R.i(3, 9)) });
  jobReaction(tid, 'has applied for the job');
  news('Manager', `${G.mgr} applies for the vacant ${t.name} job.`, tid, true);
  return `Application sent to ${t.name}. Expect an answer within about a week.`;
}
function declareInterest(tid) {
  const t = T(tid); if (!t || t.vac) return applyJob(tid);
  if (msOf(tid).s >= 45) return `${t.name}'s manager is not under pressure.`;
  G.jint = G.jint || []; if (G.jint.some(x => x.tid === tid)) return 'You have already declared interest.';
  G.jint.push({ tid, d: G.date });
  jobReaction(tid, 'has declared interest in the job');
  news('Manager', `${G.mgr} makes it known he would be interested in the ${t.name} job, piling more pressure on ${t.mgr}.`, tid, true);
  try { fanPost(tid, R.pick([`${G.mgr} wants the job? Not sure about that`, `If the board gets ${G.mgr} in, I'm all for it`, `Disrespectful while our manager is still in the job`]), { big: false }); } catch (e) { }
  return `You have declared interest in the ${t.name} job. If ${t.mgr} is sacked, they will call you first.`;
}
function acceptJob(tid) {
  const o = (G.joff || []).find(x => x.tid === tid && x.until >= G.date); if (!o) return 'The offer has expired.';
  const old = G.user; const wasEmployed = !G.sacked && T(old) && !T(old).lite; const t = T(tid);
  if (wasEmployed) {
    const rival = isRival(old, tid);
    news('Manager', `${G.mgr} leaves ${T(old).name} to become ${t.name} manager.${rival ? ' The move to a rival has gone down terribly with supporters.' : ''}`, old, true);
    try { fanPost(old, rival ? R.pick([`Traitor. Don't ever come back.`, `Of all the clubs… THEM? 🐍`]) : R.pick([`Good luck I guess. Thanks for the memories`, `Bye then. Next.`]), { big: true }); } catch (e) { }
  }
  delete t.vac; G.joff = []; G.jint = []; G.japp = [];
  takeJob(tid);
  if (wasEmployed && T(old)) { const ot = T(old); ot.vac = { since: G.date, wk: R.i(2, 4), old: G.mgr }; ot.mgr = `${genName()} (caretaker)`; }
  G.ms[tid] = { s: 75, since: G.date };
  return `You are the new manager of ${t.name}.`;
}
Object.assign(ACT, {
  japply: (v) => { toast(applyJob(v)); autosave(); render(); },
  jint: (v) => { toast(declareInterest(v)); autosave(); render(); },
  jacc: (v) => { const m = acceptJob(v); toast(m); UI.modal = null; UI.scr = 'inbox'; UI.msg = null; render(); },
  jdec: (v) => { G.joff = (G.joff || []).filter(x => x.tid !== v); toast('Offer declined.'); render(); },
  jlg: (v) => { UI.jlg = v; render(); }
});
const _maJob = msgActions;
msgActions = function (m) {
  if (m && m.act && m.act.k === 'job') {
    const o = (G.joff || []).find(x => x.tid === m.act.tid && x.until >= G.date);
    return o ? `<div class="row" style="margin-top:14px"><button class="btn pri" data-a="jacc" data-v="${o.tid}">Accept the ${esc(T(o.tid).name)} job</button><button class="btn" data-a="jdec" data-v="${o.tid}">Decline</button></div>` : '<div class="dim" style="margin-top:12px">This offer is no longer open.</div>';
  }
  return _maJob(m);
};
// after a sacking, open jobs come first in the job centre
const _joJob = jobOffers;
jobOffers = function () { const v = jobClubs().filter(t => isVac(t) && t !== G.user && jobFit(t) >= -10); return [...new Set(v.concat(_joJob()))].slice(0, 7); };

// ---------- screen ----------
function scrJobs() {
  G.ms = G.ms || {};
  const tab = UI.tab.jb || 'centre';
  const tabs = `<div class="tabs">${[['centre', 'Job centre'], ['sec', 'Job security'], ['press', 'Under pressure']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="jb" data-v="${k}">${l}</button>`).join('')}</div>`;
  const pt = T(G.user) && !T(G.user).lite ? clubPat(G.user) : null;
  const me = pt ? `<div class="box pad" style="margin-bottom:12px"><label class="lb">Your job security at ${esc(userTeam().name)}</label><div style="font-size:18px">${secTag(userSec())} ${secBar(userSec())}</div><div class="dim" style="font-size:12.5px;margin-top:4px">Board confidence ${Math.round(G.board)} · Fans ${Math.round(G.fans ?? 60)} · Board: ${patLabel(pt.b)} · Fans: ${patLabel(pt.f)}. ${pt.b < .95 ? 'This board reacts quickly to bad results.' : pt.b > 1.1 ? 'This board gives managers time.' : ''}</div></div>` : (G.sacked ? `<div class="box pad" style="margin-bottom:12px"><b>You are out of work.</b> Apply for a vacant job below.</div>` : '');
  const all = jobClubs().filter(t => t !== G.user);
  const row = (t, btn) => { const L = lgRow(t); const m = msOf(t); return `<tr><td>${mLink(mgrOf(t))}</td><td>${tLink(t, true)}</td><td class="dim mono">${COMP_SHORT[divOf(t)] || ''}</td><td class="n">${L ? ordinal(L.pos) : ''}</td><td class="n dim">${(() => { try { return ordinal(boardTarget(t).pos); } catch (e) { return ''; } })()}</td><td class="mono" style="font-size:12px">${L ? (L.r.form || []).slice(-5).join('') : ''}</td><td>${secTag(m.s)} ${secBar(m.s)}</td><td>${btn || ''}</td></tr>`; };
  const head = `<thead><tr><th>Manager</th><th>Club</th><th>Lg</th><th class="n">Pos</th><th class="n" title="Board target">Target</th><th>Form</th><th>Job security</th><th></th></tr></thead>`;
  const warn = (t) => { if (G.sacked || !T(G.user) || T(G.user).lite) return ''; return isRival(G.user, t) ? ' <span class="red" title="Your fans and board will be furious">⚠ rival</span>' : T(t).rep - userTeam().rep >= 8 ? ' <span class="dim" title="Some fans will understand a step up">step up</span>' : T(t).rep - userTeam().rep <= -8 ? ' <span class="amb" title="Your board and fans will not understand it">step down</span>' : ' <span class="amb" title="Your board and fans will not like it">sideways</span>'; };
  let body = '';
  if (tab === 'centre') {
    const vac = all.filter(isVac).sort((a, b) => T(b).rep - T(a).rep);
    const appl = new Set((G.japp || []).filter(a => !a.done).map(a => a.tid)); const intd = new Set((G.jint || []).map(x => x.tid));
    const offers = (G.joff || []).filter(x => x.until >= G.date);
    body += offers.length ? `<h2 class="sect">Offers on the table</h2><div class="tw"><table class="t"><tbody>${offers.map(o => `<tr><td>${tLink(o.tid, true)}</td><td class="dim">${esc(cap1(boardTarget(o.tid).txt))}</td><td class="dim">until ${dShort(o.until)}</td><td><button class="btn pri" data-a="jacc" data-v="${o.tid}">Accept</button> <button class="btn" data-a="jdec" data-v="${o.tid}">Decline</button></td></tr>`).join('')}</tbody></table></div>` : '';
    body += `<h2 class="sect">Vacant jobs</h2><div class="tw"><table class="t"><thead><tr><th>Club</th><th>Lg</th><th>Caretaker</th><th>Vacant since</th><th>Board target</th><th>Your chance</th><th></th></tr></thead><tbody>${vac.map(t => { const f = fitLabel(jobFit(t)); return `<tr><td>${tLink(t, true)}${warn(t)}</td><td class="dim mono">${COMP_SHORT[divOf(t)] || ''}</td><td class="dim">${esc((T(t).mgr || '').replace(/ \(caretaker\)/i, ''))}</td><td class="dim">${dShort(T(t).vac.since)}</td><td class="dim">${esc(cap1(boardTarget(t).txt))}</td><td class="${f[1]}">${f[0]}</td><td>${appl.has(t) ? '<span class="dim">Applied</span>' : `<button class="btn pri" data-a="japply" data-v="${t}">Apply</button>`}</td></tr>`; }).join('') || '<tr><td colspan="7" class="dim">No vacant jobs right now. Clubs sack managers when results fall well short of what their board expects.</td></tr>'}</tbody></table></div>`;
    const hot = all.filter(t => !isVac(t) && msOf(t).s < 45).sort((a, b) => msOf(a).s - msOf(b).s);
    body += `<h2 class="sect">Jobs that may open soon</h2><p class="dim" style="margin-top:0">Managers who are unsecure or very unsecure. Declaring interest puts you first in line if the club sacks its manager, but ${G.sacked ? 'it is public' : 'your own board and fans will hear about it: a rival club is the worst case, a clear step up is easier to forgive'}.</p><div class="tw"><table class="t">${head}<tbody>${hot.map(t => row(t, intd.has(t) ? '<span class="dim">Interest declared</span>' : `<button class="btn" data-a="jint" data-v="${t}">Declare interest</button>${warn(t)}`)).join('') || '<tr><td colspan="8" class="dim">Nobody is under real pressure at the moment.</td></tr>'}</tbody></table></div>`;
    const pend = (G.japp || []).filter(a => !a.done);
    if (pend.length || intd.size) body += `<p class="dim">Pending: ${pend.map(a => `application to ${esc(T(a.tid).name)}`).concat([...intd].map(t => `interest in ${esc(T(t).name)}`)).join(' · ')}</p>`;
  } else if (tab === 'sec') {
    const lgs = LG_ALL(); const lg = UI.jlg && lgs.includes(UI.jlg) ? UI.jlg : (divOf(G.user) && lgs.includes(divOf(G.user)) ? divOf(G.user) : 'PL');
    const pick = `<div class="tabs" style="flex-wrap:wrap">${lgs.map(k => `<button class="${lg === k ? 'on' : ''}" data-a="jlg" data-v="${k}">${COMP_SHORT[k] || k}</button>`).join('')}</div>`;
    const list = divTeams(lg).filter(t => T(t) && !T(t).lite).map(t => [t, t === G.user ? userSec() : msOf(t).s]).sort((a, b) => b[1] - a[1]);
    body += pick + `<p class="dim" style="margin-top:6px">${esc(COMP_NAME[lg] || lg)}: managers ranked from very secure to very unsecure. Board and fan patience differ by club.</p><div class="tw"><table class="t"><thead><tr><th>Manager</th><th>Club</th><th class="n">Pos</th><th class="n">Target</th><th>Form</th><th>Board</th><th>Fans</th><th>Job security</th></tr></thead><tbody>${list.map(([t, s]) => { const L = lgRow(t); const p2 = clubPat(t); return `<tr class="${t === G.user ? 'me' : ''}"><td>${mLink(mgrOf(t))}</td><td>${tLink(t, true)}</td><td class="n">${L ? ordinal(L.pos) : ''}</td><td class="n dim">${(() => { try { return ordinal(boardTarget(t).pos); } catch (e) { return ''; } })()}</td><td class="mono" style="font-size:12px">${L ? (L.r.form || []).slice(-5).join('') : ''}</td><td class="dim" style="font-size:12px">${patLabel(p2.b)}</td><td class="dim" style="font-size:12px">${patLabel(p2.f)}</td><td>${isVac(t) ? '<span class="dim">Vacant</span>' : secTag(s) + ' ' + secBar(s)}</td></tr>`; }).join('')}</tbody></table></div>`;
  } else {
    const hot = all.filter(t => !isVac(t) && msOf(t).s < 45).sort((a, b) => msOf(a).s - msOf(b).s);
    body += `<h2 class="sect">Managers under pressure</h2><div class="tw"><table class="t">${head}<tbody>${hot.map(t => row(t)).join('') || '<tr><td colspan="8" class="dim">Nobody is under real pressure at the moment.</td></tr>'}</tbody></table></div>`;
    const log = G.sackLog || [];
    body += `<h2 class="sect">Sacked this season and last</h2><div class="tw"><table class="t"><tbody>${log.map(x => `<tr><td class="dim">${dShort(x.d)}</td><td>${esc(x.n)}</td><td>${tLink(x.tid, true)}</td><td class="dim">${x.pos ? ordinal(x.pos) + ' in ' + esc(COMP_SHORT[x.lg] || x.lg) : ''}</td></tr>`).join('') || '<tr><td class="dim">No sackings yet.</td></tr>'}</tbody></table></div>`;
  }
  return `<div class="band">Manager options<small>Job centre · job security</small></div>${me}${tabs}${body}`;
}
const _scrJob = screen;
screen = function (s) { if (s === 'jobs') return scrJobs(); return _scrJob(s); };
