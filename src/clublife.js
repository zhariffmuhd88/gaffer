// clublife.js: player requests with answers in the inbox, a fly-on-the-wall documentary, the revived Cup Winners'
// Cup (post-season, game scenario), a Club World Cup (game format), trophy room, trophy parade, manager statue,
// the manager's son in the academy, and save export/import as a file. Loaded after banter.js.

// ===================== 1. player requests =====================
// G.reqs: [{id, pid, t: play|contract|loan|leave, d, due, st: open|done|ignored}]
const REQ_T = {
  play: { title: 'Wants first-team football', opts: [['promise', 'Promise him more starts (3 in the next 5)'], ['fight', 'Tell him to fight for his place'], ['loan', 'Agree to a loan'], ['letgo', 'Let him go (transfer list)']] },
  contract: { title: 'Wants a new contract', opts: [['talks', 'Open contract talks now'], ['summer', 'Talk again next summer'], ['letgo', 'Not in my plans (list him)']] },
  loan: { title: 'Wants to go out on loan', opts: [['loan', 'Agree to a loan'], ['stay', 'Stay and learn here'], ['encourage', 'Encourage him, promise chances']] },
  leave: { title: 'Wants to leave', opts: [['stay', 'Ask him to stay'], ['letgo', 'Agree, transfer list him'], ['refuse', 'Refuse outright']] }
};
function reqList() { if (!G.reqs) G.reqs = []; return G.reqs; }
function reqOpen(pid) { return reqList().find(r => r.pid === pid && r.st === 'open'); }
function makeRequest(p, t) {
  const r = { id: (G.reqId = (G.reqId || 0) + 1), pid: p.id, t, d: G.date, due: addDays(G.date, t === 'leave' || t === 'contract' ? 5 : 7), st: 'open' };
  reqList().push(r);
  const why = { play: `has started ${p.st.s} of ${teamGames() - (p.mi || 0)} games he was fit for and feels he deserves more.`, contract: `is out of contract in summer ${p.con} and wants to know where he stands.`, loan: 'feels he needs regular senior football to develop.', leave: `says he ${(concerns(p)[0]) || 'is unhappy at the club'}.` }[t];
  msg(`${p.n}: ${REQ_T[t].title}`, `${p.n} ${why} He wants an answer by ${dNice(r.due, false)}. You can also talk to him from his profile first.`, { k: 'req', r: r.id });
  if (t === 'leave' || p.ca >= 80) { try { journPost(jr(ctryOf(G.user) === 'ESP' ? 'jm' : 'eb'), `${p.n} ${t === 'leave' ? 'wants out of' : 'is unsettled at'} ${tName(G.user, true)}. Talks with the manager this week.`, { u: 1, big: p.ca >= 82 }); } catch (e) { } }
}
function friendsOf(p) { return squad(G.user).filter(q => q.id !== p.id && (q.nat === p.nat || Math.abs(q.age - p.age) <= 1) && q.ca >= p.ca - 8).slice(0, 3); }
function answerRequest(id, k) {
  const r = reqList().find(x => x.id === id); if (!r || r.st !== 'open') return 'Already answered.';
  const p = P(r.pid); if (!p || p.c !== G.user) { r.st = 'done'; return 'He is no longer at the club.'; }
  r.st = 'done'; r.ans = k; let out;
  const tk = (key) => { const x = talkTo(p.id, key); return x ? x.reply : ''; };
  if (k === 'promise' || k === 'fight' || k === 'stay' || k === 'encourage' || k === 'letgo') out = tk(k);
  else if (k === 'loan') {
    if (G.window) { const res = loanOut(p.id, ({ ESP: 'sd', ITA: 'sb' }[ctryOf(G.user)] || 'ch')); out = res.msg; if (res.ok) setHap(p, 10); }
    else { p.loanNext = 1; setHap(p, 6); out = "Thanks boss. I'll go in the next window."; }
  } else if (k === 'talks') { setHap(p, 6); UI.modal = null; setTimeout(() => { try { playerModal(p.id); } catch (e) { } }, 0); out = "Good. Let's get it sorted."; }
  else if (k === 'summer') { setHap(p, p.ca >= 76 ? -6 : -2); out = "I'll wait, but I won't wait forever."; }
  else if (k === 'refuse') { setHap(p, -14); p.mor = clamp(p.mor - 8, 5, 100); for (const q of friendsOf(p)) setHap(q, -3); out = "Then I'll make my feelings known."; try { news('Media', `${p.n}'s camp unhappy after ${G.mgr} blocks his exit.`, G.user); } catch (e) { } }
  if (k === 'letgo' && r.t !== 'leave') for (const q of friendsOf(p)) setHap(q, -2);
  return `${surname(p.n)}: "${out}"`;
}
function requestTick() {
  if (!T(G.user) || T(G.user).lite || isNatT(G.user)) return;
  // unanswered requests
  for (const r of reqList()) if (r.st === 'open' && G.date > r.due) {
    r.st = 'ignored'; const p = P(r.pid); if (!p || p.c !== G.user) continue;
    setHap(p, -10); for (const q of friendsOf(p)) setHap(q, -2);
    msg('Request ignored', `${p.n} feels ignored after you didn't answer his request. Some team-mates side with him.`);
  }
  // loans agreed out of window
  if (G.window) for (const p of squad(G.user)) if (p.loanNext) { delete p.loanNext; const res = loanOut(p.id, ({ ESP: 'sd', ITA: 'sb' }[ctryOf(G.user)] || 'ch')); if (res.ok) msg('Loan', `As agreed, ${res.msg}`); }
  if (teamGames() < 4 || R.chance(.5)) return;
  const sq = squad(G.user).filter(p => !reqOpen(p.id) && !p.loan && p.inj <= 0 && !(p.reqAt && dDiff(p.reqAt, G.date) < 50));
  const cand = [];
  for (const p of sq) {
    const st = squadStatus(p), rr = startRatio(p), h = hap(p);
    if (p.req && !reqList().some(r => r.pid === p.id && r.t === 'leave')) cand.push([p, 'leave', 5]);
    if (rr != null && rr + .2 < STATUS_EXP[st] && p.age >= 20 && h < 60 && !p.prom) cand.push([p, 'play', 3]);
    if (p.con <= G.year + 1 && p.ca >= 70 && p.age <= 31 && G.date >= sd('2026-10-15')) cand.push([p, 'contract', 2]);
    if (p.age <= 21 && (rr == null || rr < .15) && p.ca >= 62 && p.ca < firstTeamBar(G.user)) cand.push([p, 'loan', 1.5]);
  }
  if (!cand.length) return;
  const [p, t] = R.wpick(cand, c => c[2]); p.reqAt = G.date; makeRequest(p, t);
}
const _wkCL = weekly;
weekly = function () { _wkCL(); try { if (!G.sacked) requestTick(); } catch (e) { console.error(e); } };
const _maCL = msgActions;
msgActions = function (m) {
  if (m && m.act && m.act.k === 'req') {
    const r = reqList().find(x => x.id === m.act.r); if (!r) return '';
    if (r.st !== 'open') return `<div class="dim" style="margin-top:12px">${r.st === 'ignored' ? 'You did not answer in time.' : 'Answered' + (r.ans ? ': ' + esc((REQ_T[r.t].opts.find(o => o[0] === r.ans) || [, r.ans])[1]) : '') + '.'}</div>`;
    return `<div style="display:grid;gap:6px;margin-top:14px">${REQ_T[r.t].opts.map(([k, l]) => `<button class="btn" style="text-align:left" data-a="reqans" data-v="${r.id}" data-k="${k}">${esc(l)}</button>`).join('')}<button class="btn" data-a="player" data-v="${r.pid}" style="text-align:left">Talk to him first (open profile)</button></div>`;
  }
  if (m && m.act && m.act.k === 'son') return sonForm(m);
  return _maCL(m);
};

// ===================== 2. documentary =====================
const DOC_NAME = 'Behind the Badge';
function docOffer() { const t = userTeam(); return Math.round((3 + t.rep * 0.12) * 10) / 10; }
function docStart() {
  const t = userTeam(); if (G.doc && G.doc.y === G.year) return 'There is already a documentary this season.';
  const fee = docOffer(); G.doc = { y: G.year, tid: G.user, fee, ep: 0 };
  t.bal += fee; t.fin.in.com += fee; G.fans = clamp((G.fans ?? 60) + 3, 0, 100);
  msg('Documentary', `The board signs a season-long fly-on-the-wall series, "${DOC_NAME}: ${t.name}". The club receives ${money(fee)} up front plus a bonus if viewing figures are strong. Cameras will be in the dressing room all season.`);
  try { journPost(jr('mh'), `${tName(G.user, true)} agree a fly-on-the-wall documentary for this season. Cameras everywhere, including the dressing room.`, { u: 1, big: true }); } catch (e) { }
  return null;
}
function docWeek() {
  const D = G.doc; if (!D || D.y !== G.year || D.tid !== G.user || !R.chance(.3)) return;
  D.ep++; const sq = squad(G.user); const p = R.pick(sq);
  const ev = R.pick(['rant', 'tension', 'star', 'fans']);
  if (ev === 'rant') { for (const q of sq) q.mor = clamp(q.mor + R.i(-3, 4), 5, 100); fanPost(G.user, `Episode ${D.ep} of ${DOC_NAME}: the half-time team talk is going viral 😳🔥`, { big: true }); trend(DOC_NAME.replace(/ /g, ''), 3); }
  else if (ev === 'tension') { setHap(p, -6); news('Media', `${DOC_NAME} episode ${D.ep} shows ${p.n} arguing with the coaching staff. He is not happy about how he was portrayed.`, G.user); fanPost(G.user, `That ${surname(p.n)} scene in ${DOC_NAME}... 👀 dressing room isn't as happy as we thought`); }
  else if (ev === 'star') { setHap(p, 5); p.mor = clamp(p.mor + 6, 5, 100); fanPost(G.user, `${surname(p.n)} is the star of ${DOC_NAME}. What a character 😂❤️`, { big: true }); }
  else { G.fans = clamp((G.fans ?? 60) + 2, 0, 100); const t = userTeam(); const b = Math.round(t.rep * 0.02 * 10) / 10; t.bal += b; t.fin.in.com += b; fanPost(G.user, `Binge-watched ${DOC_NAME} in one night. Proud of this club 💙`); }
}
const _wkDoc = weekly;
weekly = function () { _wkDoc(); try { if (!G.sacked) docWeek(); } catch (e) { console.error(e); } };
const _cbCL = scrClubBoard;
scrClubBoard = function () {
  const h = _cbCL(); const D = G.doc && G.doc.y === G.year && G.doc.tid === G.user ? G.doc : null;
  return h + `<div class="box pad" style="margin-top:10px"><h3 class="h3">Documentary</h3>${D ? `<p style="margin:0">"${DOC_NAME}" is filming this season (${D.ep} episodes so far). Paid ${money(D.fee)} up front.</p>` : `<p style="margin:0 0 8px">A streaming service wants to film a season-long fly-on-the-wall series ("${DOC_NAME}", fictional) at the club: ${money(docOffer())} up front and more if it is popular. Expect dressing-room drama, morale swings and press stories.</p><button class="btn pri" data-a="docgo">Agree to the documentary</button>`}</div>`;
};

// ===================== 3. Cup Winners' Cup revived (post-season, game scenario) =====================
Object.assign(COMP_NAME, { CWC: "Cup Winners' Cup", CWX: 'Club World Cup' });
Object.assign(COMP_SHORT, { CWC: 'CWC', CWX: 'CWC' });
Object.assign(COMP_LINK, { "Cup Winners' Cup": 'CWC', 'Club World Cup': 'CWX' });
Object.assign(TRO_W, { "Cup Winners' Cup": 12, 'Club World Cup': 6 });
CAL.CWC = { draw: '2027-05-25', rounds: [['Quarter-final', ['2027-05-31'], 1], ['Semi-final', ['2027-06-02'], 1], ['Final', ['2027-06-05'], 1]] };
CAL.CWX = { draw: '2026-12-01', rounds: [['Semi-final', ['2026-12-17'], 1], ['Final', ['2026-12-22'], 1]] };
const CWX_TEAMS = [['Flamengo', 75], ['Palmeiras', 74], ['River Plate', 73], ['Al-Hilal', 74], ['Al-Ahli', 73], ['Al Ahly', 70], ['Pyramids FC', 68], ['Cruz Azul', 70], ['Monterrey', 70], ['Urawa Red Diamonds', 66], ['Seattle Sounders', 66], ['Auckland City', 55]];
function liteByName(n, s) { const id = 'W_' + slug(n); if (!G.teams[id]) addLite(id, n, s); return id; }
function cupRounds(spec) { return spec.map(([n, ds, neu]) => ({ n, d: ds.map(sd), neutral: !!neu, ties: [], done: false })); }
const _bsCL = buildSeason;
buildSeason = function () {
  _bsCL();
  try { G.cups.CWC = { id: 'CWC', rounds: cupRounds(CAL.CWC.rounds), ri: 0, winner: null }; G.cups.CWX = { id: 'CWX', rounds: cupRounds(CAL.CWX.rounds), ri: 0, winner: null }; G.tasks.push({ d: sd(CAL.CWC.draw), t: 'drawCWC' }, { d: sd(CAL.CWX.draw), t: 'drawCWX' }); } catch (e) { console.error(e); }
};
function drawCWC() {
  const ent = []; for (const c of ['FA', 'CDR', 'CIT']) { const w = G.cups[c] && G.cups[c].winner; if (w && !ent.includes(w)) ent.push(w); }
  if (G.cups.LC && G.cups.LC.winner && !ent.includes(G.cups.LC.winner) && ent.length < 2) ent.push(G.cups.LC.winner);
  const lite = R.shuffle([].concat(EURO.UCL, EURO.UEL).filter(x => x[1] >= 74).map(x => 'E_' + slug(x[0])).filter(id => G.teams[id] && !ent.includes(id)));
  while (ent.length < 8 && lite.length) ent.push(lite.shift());
  const l = R.shuffle(ent); const pairs = []; for (let i = 0; i + 1 < l.length; i += 2) pairs.push([l[i], l[i + 1]]);
  drawFixed('CWC', 0, pairs);
  for (const t of G.cups.CWC.rounds[0].ties) for (const id of t.fx) { G.fx[id].ven = 'Neutral host city'; G.fx[id].vcap = 45000; }
  news("Cup Winners' Cup", `Game scenario: UEFA revives the Cup Winners' Cup as a week-long tournament for domestic cup winners after the season. Quarter-finals: ${pairs.map(([a, b]) => tName(a) + ' v ' + tName(b)).join(', ')}.`, ent.includes(G.user) ? G.user : null, true);
}
function drawCWX() {
  const prev = (G.chist || []).slice().reverse().find(h => h.c && h.c.UCL && h.c.UCL.w);
  let eu = prev ? prev.c.UCL.w : null; if (!eu || !T(eu)) eu = G.teams.E_ParisSG ? 'E_ParisSG' : null; // 2025/26 winners: Paris Saint-Germain
  if (!eu) return;
  const others = R.shuffle(CWX_TEAMS.slice(0, 10)).slice(0, 3).map(([n, s]) => liteByName(n, s));
  const l = [eu].concat(others);
  drawFixed('CWX', 0, [[l[0], l[3]], [l[1], l[2]]]);
  for (const r of G.cups.CWX.rounds) for (const t of r.ties) for (const id of t.fx) { G.fx[id].ven = 'Neutral venue'; G.fx[id].vcap = 60000; }
  news('Club World Cup', `Game format: the European champions ${tName(eu, true)} face ${others.map(t => tName(t)).join(', ')} in a four-team Club World Cup in December.`, eu === G.user ? G.user : null, true);
}
const _dtCL = dailyTick;
dailyTick = function () {
  try { for (const tk of G.tasks.filter(t => t.d === G.date)) { if (tk.t === 'drawCWC' && G.cups.CWC) drawCWC(); if (tk.t === 'drawCWX' && G.cups.CWX) drawCWX(); } } catch (e) { console.error(e); }
  return _dtCL.apply(this, arguments);
};
const _fdCL = finishDay;
finishDay = function () { const r = _fdCL.apply(this, arguments); try { for (const c of ['CWC', 'CWX']) if (G.cups[c] && G.cups[c].rounds[G.cups[c].ri] && G.cups[c].rounds[G.cups[c].ri].ties.length) { checkCupProgress(c); for (const rd of G.cups[c].rounds) for (const t of rd.ties) for (const id of t.fx) if (!G.fx[id].ven) { G.fx[id].ven = 'Neutral venue'; G.fx[id].vcap = 50000; } } } catch (e) { console.error(e); } return r; };
const _venCL = venueOf;
venueOf = function (f) { if (f && f.ven && (f.comp === 'CWC' || f.comp === 'CWX')) return { name: f.ven, cap: f.vcap || 50000, neutral: true, stands: STANDS_DEF }; return _venCL(f); };
const _rsCL = recordSeason;
recordSeason = function () { const rec = _rsCL(); try { for (const c of ['CWC', 'CWX']) { const cup = G.cups[c]; if (!cup || !cup.winner) continue; const f = finalOf(c); rec.c[c] = { w: cup.winner, r: f ? (f.h === cup.winner ? f.a : f.h) : null, ts: null, bp: null }; } } catch (e) { console.error(e); } return rec; };
HIST_COMPS.push(['CWX', 'Club World Cup (in this save)', 'CWX']);
// competitions screen tabs
const _cpCL = scrComps;
scrComps = function () {
  const tab = UI.tab.cp;
  if (tab !== 'CWC' && tab !== 'CWX') { const h = _cpCL(); const add = `<button data-a="tab" data-k="cp" data-v="CWC">Cup Winners' Cup</button><button data-a="tab" data-k="cp" data-v="CWX">Club World Cup</button>`; const i = h.indexOf('</div>', h.indexOf('<div class="tabs"')); return i > 0 ? h.slice(0, i) + add + h.slice(i) : h; }
  UI.tab.cp = 'LC'; const h = _cpCL(); UI.tab.cp = tab;
  const cup = G.cups[tab]; if (!cup) return h;
  const i0 = h.indexOf('<div class="tabs"'); const i1 = h.indexOf('</div>', i0);
  const tabs = h.slice(i0, i1).replace(/ class="on"/g, ' class=""') + `<button class="${tab === 'CWC' ? 'on' : ''}" data-a="tab" data-k="cp" data-v="CWC">Cup Winners' Cup</button><button class="${tab === 'CWX' ? 'on' : ''}" data-a="tab" data-k="cp" data-v="CWX">Club World Cup</button></div>`;
  let body = cup.winner ? `<div class="box pad yel" style="margin-bottom:8px">Winners: ${tLink(cup.winner, true)}</div>` : '';
  body += cup.rounds.slice().reverse().filter(r => r.ties.length).map(r => `<h2 class="sect">${r.n} <span class="dim mono" style="font-size:16px">${r.d.map(d => dShort(d)).join(' & ')}</span></h2><div class="tw">${tiesTable(r)}</div>`).join('') || `<p class="dim">${tab === 'CWC' ? `Game scenario: UEFA brings back the Cup Winners' Cup after the season (draw ${dNice(sd(CAL.CWC.draw), false)}, final ${dNice(sd(CAL.CWC.rounds[CAL.CWC.rounds.length - 1][1][0]), false)}). Ten clubs, two each from England, Spain, Italy, Germany and France: the domestic cup winners first, then runners-up, the Fair Play Award winner or the highest-placed league club. The six best-ranked clubs in Europe get byes to the quarter-finals; the other four play a preliminary round. Counts as a major trophy.` : `Game format: a four-team Club World Cup in December for the European champions and three continental champions (draw ${dNice(sd(CAL.CWX.draw), false)}).`}</p>`;
  return `<div class="band">Cups &amp; Europe<small>${COMP_NAME[tab]} ${seasonLabel(G.year)}</small></div>${tabs}${body}`;
};
const _gcCL = goComp;
goComp = function (code) { if (code === 'CWC' || code === 'CWX') { UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'comps'; UI.tab.cp = code; render(); return; } _gcCL(code); };

// ===================== 4. trophy room, parade, statue =====================
const MAJOR = ['Premier League', 'La Liga', 'FA Cup', 'Copa del Rey', 'Champions League', 'Europa League', 'Conference League', "Cup Winners' Cup", 'Club World Cup', 'Carabao Cup', 'Supercopa de España', 'Championship'];
function trophySvg(kind, c) {
  // simple drawn trophies: cup, big-ears, plate
  if (kind === 'ears') return `<path d="M-9,-22 q-9,0 -9,9 q0,8 9,10 M9,-22 q9,0 9,9 q0,8 -9,10" fill="none" stroke="${c}" stroke-width="2.4"/><path d="M-9,-24 h18 l-3,20 q-6,5 -12,0 z" fill="${c}"/><rect x="-3" y="-4" width="6" height="8" fill="${c}"/><rect x="-8" y="4" width="16" height="5" fill="${c}"/>`;
  if (kind === 'plate') return `<ellipse cx="0" cy="-8" rx="13" ry="13" fill="${c}"/><ellipse cx="0" cy="-8" rx="8" ry="8" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/><rect x="-6" y="4" width="12" height="5" fill="${c}"/>`;
  return `<path d="M-8,-22 h16 l-2,14 q-6,6 -12,0 z" fill="${c}"/><path d="M-8,-20 q-7,1 -6,7 q1,4 6,5 M8,-20 q7,1 6,7 q-1,4 -6,5" fill="none" stroke="${c}" stroke-width="2"/><rect x="-2.5" y="-8" width="5" height="9" fill="${c}"/><rect x="-7" y="1" width="14" height="6" fill="${c}"/>`;
}
function trophyRoomSvg(tid) {
  const H = typeof clubHonours === 'function' ? clubHonours(tid).filter(h => h.n) : [];
  const game = (G.honours[tid] || []).map(s => s.replace(/^\d{4}\/\d{2} /, ''));
  const cnt = {}; for (const n of game) cnt[n] = (cnt[n] || 0) + 1;
  const items = H.map(h => ({ l: h.label, n: h.n, k: /Champions|European Cup/.test(h.label) ? 'ears' : /Cup Winners|Supercopa|Club World/.test(h.label) ? 'plate' : 'cup' }));
  for (const n in cnt) if (!items.some(x => x.l === n || (n === 'Premier League' && x.l === 'English champions') || (n === 'La Liga' && x.l === 'Spanish champions'))) items.push({ l: n, n: cnt[n], k: /Champions League/.test(n) ? 'ears' : 'cup' });
  const t = T(tid); const per = 6; const rows = Math.max(1, Math.ceil(items.length / per)); const W = 600, Hh = 40 + rows * 92;
  const st = G.statues && G.statues[tid];
  let g = '';
  items.forEach((it, i) => { const x = 60 + (i % per) * 92, y = 40 + Math.floor(i / per) * 92 + 50; const gold = it.k === 'ears' ? '#e8e8ef' : '#e6b422'; g += `<g transform="translate(${x},${y})">${trophySvg(it.k, gold)}<text y="22" text-anchor="middle" font-size="10" fill="#fff">${esc(it.l.length > 18 ? it.l.slice(0, 17) + '…' : it.l)}</text><text y="36" text-anchor="middle" font-size="13" font-weight="700" fill="#ffd54a">×${it.n}</text></g>`; });
  for (let r = 0; r < rows; r++) g += `<rect x="16" y="${40 + r * 92 + 60}" width="${W - 32}" height="4" fill="#6b4a2b"/>`;
  return `<svg viewBox="0 0 ${W} ${Hh}" class="troomsvg" role="img" aria-label="Trophy room of ${esc(t.name)}" style="width:100%;max-width:640px;background:linear-gradient(#1b1430,#2a1d40);border:1px solid var(--line)"><text x="${W / 2}" y="24" text-anchor="middle" font-size="14" fill="#fff" font-weight="700">${esc(t.name)} trophy room</text>${items.length ? g : `<text x="${W / 2}" y="80" text-anchor="middle" font-size="12" fill="#aaa">The cabinet is waiting for its first trophy.</text>`}${st ? `<text x="${W - 20}" y="24" text-anchor="end" font-size="11" fill="#ffd54a">🗿 Statue: ${esc(st.n)} (${st.y})</text>` : ''}</svg>`;
}
const _chCL = clubHonoursHtml;
clubHonoursHtml = function (tid) { let h = _chCL(tid); try { h = `<div style="margin:10px 0">${trophyRoomSvg(tid)}</div>` + h; } catch (e) { console.error(e); } return h; };
function paradeSvg(tid, name) {
  const t = T(tid); const c1 = t.c1 || '#c00', c2 = t.c2 || '#fff'; let crowd = '';
  for (let i = 0; i < 120; i++) { const x = (i * 37) % 600, y = 150 + ((i * 53) % 60); crowd += `<circle cx="${x}" cy="${y}" r="5" fill="${i % 3 ? c1 : c2}"/><rect x="${x - 4}" y="${y + 4}" width="8" height="10" fill="${i % 2 ? c1 : '#333'}"/>`; }
  let conf = ''; for (let i = 0; i < 60; i++) conf += `<rect x="${(i * 97) % 600}" y="${(i * 29) % 140}" width="4" height="7" fill="${i % 2 ? c1 : '#ffd54a'}" transform="rotate(${i * 23} ${(i * 97) % 600} ${(i * 29) % 140})"/>`;
  return `<svg viewBox="0 0 600 230" role="img" aria-label="Trophy parade" style="width:100%;background:linear-gradient(#5aa0e6,#bfe0ff)"><rect y="140" width="600" height="90" fill="#777"/>${crowd}<g transform="translate(200,62)"><rect width="200" height="70" rx="8" fill="${c1}" stroke="#111"/><rect y="-10" width="200" height="12" fill="${c2}"/><rect x="10" y="12" width="180" height="20" fill="rgba(255,255,255,.35)"/><circle cx="40" cy="72" r="13" fill="#222"/><circle cx="160" cy="72" r="13" fill="#222"/><g transform="translate(100,-12)">${trophySvg(/Champions/.test(name) ? 'ears' : 'cup', '#e6b422')}</g><text x="100" y="56" text-anchor="middle" font-size="13" font-weight="800" fill="${readable(c1)}">CHAMPIONS</text></g>${conf}<text x="300" y="24" text-anchor="middle" font-size="16" font-weight="800" fill="#111">${esc(t.name)} · ${esc(name)} ${seasonLabel(G.year)}</text></svg>`;
}
const _honCL = honour;
honour = function (tid, name) {
  _honCL(tid, name);
  try { if (tid === G.user && MAJOR.includes(name) && name !== 'Championship') { G.parade = { tid, name }; } } catch (e) { }
};
const _renCL = render;
render = function () {
  try { if (G && G.parade && !UI.match && !UI.modal) { const p = G.parade; G.parade = null; UI.modal = `<div class="band"><span>Trophy parade</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">${paradeSvg(p.tid, p.name)}<p>Hundreds of thousands line the streets as the ${esc(p.name)} is paraded on an open-top bus. ${esc(G.mgr)} lifts the trophy to the crowd.</p></div>`; } } catch (e) { console.error(e); }
  _renCL();
};
// statue: league title plus 5 seasons, or 3 major trophies at the club
function stintYears() { try { return dDiff(curStint().from, G.date) / 365; } catch (e) { return 0; } }
function checkStatue() {
  const tid = G.user; if (!T(tid) || T(tid).lite || isNatT(tid)) return; G.statues = G.statues || {};
  if (G.statues[tid]) return;
  const st = curStint(); const tro = (st.tro || []);
  const league = tro.some(x => /Premier League|La Liga/.test(x)); const major = tro.filter(x => MAJOR.some(m => x.endsWith(m))).length;
  if ((league && stintYears() >= 5) || major >= 3) {
    G.statues[tid] = { n: G.mgr, y: G.year + 1 };
    msg('A statue for the manager', `${T(tid).name} unveil a bronze statue of ${G.mgr} outside ${T(tid).stadium}. ${tro.length} trophies so far: ${tro.join(', ')}.`);
    try { fanPost(tid, `They've built a statue of ${G.mgr}. A LEGEND of this club 🗿❤️`, { big: true }); journPost(jr(ctryOf(tid) === 'ESP' ? 'jm' : 'mh'), `${T(tid).name} honour ${G.mgr} with a statue at ${T(tid).stadium}.`, { u: 1, big: true }); } catch (e) { }
    G.mgrRep = clamp(G.mgrRep + 3, 20, 99);
  }
}
// manager's son joins the academy after five years at the club
function checkSon() {
  if (G.son || !T(G.user) || T(G.user).lite || isNatT(G.user) || stintYears() < 5) return;
  G.son = { st: 'ask', tid: G.user };
  msg('Your son', `After five years at ${T(G.user).name}, the academy wants to sign your son. Choose his name.`, { k: 'son' });
}
function sonForm(m) {
  if (!G.son || G.son.st !== 'ask') return G.son && G.son.pid ? `<div style="margin-top:10px">${pLink(G.son.pid)} is in the academy.</div>` : '';
  const sur = surname(G.mgr) === G.mgr ? G.mgr : surname(G.mgr);
  return `<div class="row" style="gap:6px;margin-top:12px"><input class="f" id="sonname" maxlength="24" value="${esc('Junior ' + sur)}" aria-label="Your son's name"><button class="btn pri" data-a="sonok">Sign him</button></div>`;
}
function signSon(name) {
  const tid = G.son.tid; if (!T(tid) || T(tid).lite) return;
  const natRowFor = (n) => { try { const r = natRows().find(x => x.name === n); return r ? r.c : null; } catch (e) { return null; } };
  const nat = (G.mgrP && natRowFor(G.mgrP.nat)) || 'ENG';
  const p = mkYouth(tid, 'a', { n: name || ('Junior ' + surname(G.mgr)), pos: R.pick(['AM', 'ST', 'CM', 'LW']), age: 16, nat, ca: 52 });
  p.pa = R.i(84, 92); p.son = 1; p.gen = true;
  G.son = { st: 'done', pid: p.id, tid };
  msg('Welcome to the academy', `${p.n} (16, ${POS_LABEL[p.pos]}) joins the ${T(tid).name} academy. The coaches rate his potential highly, but he will have to earn everything.`);
  try { fanPost(tid, `The gaffer's son is in the academy 😍 ${p.n}, remember the name`, { big: true }); fanPost(tid, `Nepotism FC 😂 (he better be good)`); } catch (e) { }
}
const _seCL = seasonEnd;
seasonEnd = function () { const r = _seCL.apply(this, arguments); try { if (!G.sacked) { checkStatue(); checkSon(); } } catch (e) { console.error(e); } return r; };

// ===================== 5. save to a file =====================
async function exportSaveFile() {
  const data = lzPack(saveJSON(G)); const nm = `gaffer-${slug(userTeam().short || 'save')}-${G.date}.txt`;
  // inside a claude.ai artifact the viewer grants downloads; elsewhere (installed app, browser) use the share sheet or a link
  try { if (window.claude && window.claude.use) { const dl = await window.claude.use('downloads'); if (dl) { try { await dl.save({ filename: nm, data }); return 'Save file ready: ' + nm; } catch (e) { return e && e.code === 'declined' ? 'Export cancelled.' : 'Export is not available here. Use Export backup (text) instead.'; } } } } catch (e) { }
  const blob = new Blob([data], { type: 'application/octet-stream' });
  try { const file = new File([blob], nm, { type: 'application/octet-stream' }); if (navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|Android/.test(navigator.userAgent)) { navigator.share({ files: [file], title: 'GAFFER save' }).catch(() => { }); return 'Choose "Save to Files" to keep the save.'; } } catch (e) { }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  return 'Save file downloaded: ' + nm;
}
function importSaveText(s) {
  s = String(s || '').trim(); const o = JSON.parse(s.startsWith(LZ_TAG) ? lzUnpack(s) : s);
  if (!o || !o.players || !o.teams) throw new Error('bad');
  restore(o); autosave(); UI.scr = 'inbox'; UI.msg = null; render();
}
const _sgCL = scrGame;
scrGame = function () {
  const h = _sgCL(); if (!G) return h;
  const box = `<div class="box pad"><h2 class="sect" style="margin-top:0">Save file</h2><p class="dim" style="font-size:12.5px;margin-top:0">Move your career between the artifact, iPhone and Windows: export a file here, then import it on the other device.</p><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pri" data-a="savefile">Export save to file</button><label class="btn" style="cursor:pointer">Import save from file<input type="file" id="loadfile" accept=".txt,.gaffer,.json,text/plain,application/json,application/octet-stream" style="display:none"></label></div></div>`;
  const i = h.lastIndexOf('</div><div id="exp">');
  return i > 0 ? h.slice(0, i) + box + h.slice(i) : h + box;
};
document.addEventListener('change', (ev) => {
  const el = ev.target; if (!el || el.id !== 'loadfile' || !el.files || !el.files[0]) return;
  const rd = new FileReader(); rd.onload = () => { try { importSaveText(rd.result); toast('Save loaded from file.'); } catch (e) { toast('That file is not a GAFFER save.'); } }; rd.readAsText(el.files[0]);
});
Object.assign(ACT, {
  reqans: (v, el) => { const m = answerRequest(+v, el.dataset.k); autosave(); toast(m); render(); },
  docgo: () => { const e = docStart(); toast(e || 'Documentary agreed. The cameras arrive next week.'); autosave(); render(); },
  sonok: () => { const n = $('#sonname'); signSon(n ? n.value.trim().slice(0, 24) : ''); autosave(); render(); },
  savefile: () => { exportSaveFile().then(m => toast(m)).catch(() => toast('Export failed in this browser. Use Export backup (text) instead.')); }
});
