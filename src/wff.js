// wff.js: football politics. The game's world governing body is a fictional stand-in, the World Football Federation
// (WFF), with fictional officials, so the storyline never puts invented words or results on real people.
// Game scenario for 2026/27: the WFF debates the "daylight" offside law (an idea first put forward publicly by
// Arsène Wenger), a challenger runs for president on it, wins the May 2027 congress vote, and the law comes in for
// 2027/28 (attackers level with any part of a defender are onside: slightly more goals). Loaded after lore.js.

const WFF = {
  name: 'World Football Federation', short: 'WFF', hq: 'Zurich, Switzerland', founded: 1904, members: 211,
  inc: { n: 'Henrik Aldenberg', nat: 'Denmark', role: 'President since 2015', bio: 'Former lawyer and administrator who expanded the Club World Cup and the World Cup. Campaigns on stability and record revenues.' },
  ch: { n: 'Laurent Mercier', nat: 'France', role: 'Chief of Global Football Development', bio: 'Former coach who spent two decades in club management before joining the WFF. Campaigns on the daylight offside law, a bigger grassroots fund and a lighter fixture calendar.' },
  sec: 'Amara Kouyaté (Secretary General)'
};
// the season's storyline: [date, key]
const WFF_PLAN = [['2026-09-16', 'prop'], ['2026-11-18', 'cand'], ['2027-01-20', 'man'], ['2027-02-17', 'poll'], ['2027-03-24', 'poll'], ['2027-04-21', 'poll'], ['2027-05-19', 'vote'], ['2027-06-09', 'law'],
  // the scandal (game scenario, fictional people): the former president's World Cup 2026 sell-off plan
  ['2027-08-25', 'leak'], ['2027-10-20', 'probe'], ['2028-01-26', 'hear'], ['2028-03-15', 'guilty'], ['2028-04-05', 'appeal'], ['2028-06-14', 'final']];
const WFF_RULES = [
  { k: 'day', n: 'Daylight offside', d: 'An attacker is onside unless there is clear daylight between him and the second-last defender. First put forward publicly by Arsène Wenger.', st0: 'Proposed', tag: 'Game scenario (idea from the real world)' },
  { k: 'eight', n: 'Eight-second rule for goalkeepers', d: 'A goalkeeper holding the ball for more than eight seconds concedes a corner.', st0: 'In force', tag: 'Real-world law since 2025/26' },
  { k: 'saot', n: 'Semi-automated offside technology', d: 'Cameras track players\' limbs so offside decisions are made faster.', st0: 'In force', tag: 'Real-world technology' },
  { k: 'sin', n: 'Sin bins for dissent', d: 'Ten minutes off the pitch for dissent in professional football.', st0: 'Under review', tag: 'Game scenario' },
  { k: 'capt', n: 'Only captains approach the referee', d: 'Only the captain may speak to the referee about a decision.', st0: 'Trial', tag: 'Game scenario based on real trials' }
];
function wff() { if (!G.wff) G.wff = { log: [], poll: 41, st: {}, pres: WFF.inc.n }; return G.wff; }
let WFF_CATCH = null; // when a save is past several storyline dates, they are logged and summed up in one news item
function wffNews(title, body, big) { const W = wff(); if (WFF_CATCH) { W.log.unshift([WFF_CATCH.d, title, body]); WFF_CATCH.lines.push(`${dShort(WFF_CATCH.d)} ${WFF_CATCH.d.slice(0, 4)}: ${body.replace(/^Game scenario: /, '')}`); W.log = W.log.slice(0, 30); return; } news(title, body, null, true); W.log.unshift([G.date, title, body]); W.log = W.log.slice(0, 30); if (big) try { trend('WFF', 3); } catch (e) { } }
function wffStep(k) {
  const W = wff(); const I = WFF.inc, C = WFF.ch; const live = !WFF_CATCH;
  if (k === 'prop') { W.st.day = 'Consultation'; wffNews('WFF', `Game scenario: the ${WFF.name} opens a consultation on the "daylight" offside law. An attacker would be onside unless there is clear daylight between him and the defender. Supporters of the idea say it rewards attacking play; critics fear it will make defending impossible.`, true); if (live) try { journPost(jr('gp'), 'Daylight offside: brilliant for the game or the end of defending? Discuss.', {}); fanPost(G.user, R.pick(['Daylight offside would be class. More goals, fewer toenail VAR calls', 'Leave offside alone. Defenders have it hard enough']), {}); } catch (e) { } }
  if (k === 'cand') { wffNews('WFF election', `Game scenario: ${C.n}, the WFF's ${C.role.toLowerCase()}, will stand against president ${I.n} at the May congress. His platform: the daylight offside law, a bigger grassroots fund and a lighter fixture calendar.`, true); }
  if (k === 'man') { wffNews('WFF election', `Manifestos published. ${I.n} promises "stability and record revenues" and a 48-team Club World Cup. ${C.n} promises the daylight law, 25% of revenue to grassroots football and a mandatory winter rest for players.`); }
  if (k === 'poll') { W.poll = clamp(W.poll + R.i(3, 6), 40, 58); wffNews('WFF election', `Latest soundings of member associations: ${C.n} ${W.poll}%, ${I.n} ${100 - W.poll}%. ${W.poll >= 50 ? 'The challenger has momentum.' : 'The incumbent still leads, but the gap is closing.'}`); }
  if (k === 'vote') {
    const yes = Math.round(WFF.members * clamp(W.poll + R.i(1, 4), 52, 62) / 100); const no = WFF.members - yes - 3;
    W.pres = C.n; W.res = [yes, no, 3]; W.st.day = 'Approved for 2027/28';
    wffNews('WFF election', `Game scenario: ${C.n} is elected president of the ${WFF.name}, beating ${I.n} by ${yes} votes to ${no} (3 abstentions). His first act: putting the daylight offside law to the congress, which approves it for the 2027/28 season.`, true);
    if (live) try { fanPost(G.user, R.pick([`New WFF president, daylight offside coming. Football is about to change 👀`, `${surname(C.n)} actually did it. Daylight offside next season!`]), { big: true }); journPost(jr('mh'), `${C.n} wins the WFF presidency. Daylight offside from 2027/28.`, { big: true }); } catch (e) { }
    if (W.end) { const ok = W.end === 'ch'; G.mgrRep = clamp(G.mgrRep + (ok ? 2 : -1), 20, 99); msg('WFF election', ok ? `You backed ${C.n} publicly, and he won. Your profile in the game's corridors of power has grown.` : `You backed ${I.n}, who lost. The new president's team will remember.`); }
  }
  const A = I.n;
  if (k === 'leak') { W.ald = 'Under investigation'; W.case = [['2027-08-25', 'Documents leaked']]; wffNews('WFF scandal', `Game scenario: leaked documents published by an investigative newspaper suggest former president ${A} drew up a secret plan to sell off the commercial rights to the 2026 World Cup to a private investment fund at a fraction of their value, bypassing the WFF Council. ${A} denies any wrongdoing.`, true); if (live) try { journPost(jr('gp'), `The ${A} documents are extraordinary. The 2026 World Cup, sold off in a side deal?`, { big: true }); trend('WFFGate', 5); } catch (e) { } }
  if (k === 'probe') { W.ald = 'Suspended from football'; (W.case = W.case || []).push(['2027-10-20', 'Formal proceedings, suspended']); wffNews('WFF scandal', `The WFF's independent ethics committee opens formal proceedings against ${A} over the World Cup 2026 sell-off plan and suspends him from all football activity while the case is heard. President ${C.n}: "Nobody is above the rules of this organisation."`, true); }
  if (k === 'hear') { (W.case = W.case || []).push(['2028-01-26', 'Hearing in Zurich']); wffNews('WFF scandal', `Hearing in Zurich. A former WFF finance director tells the committee the deal was "agreed in a hotel suite, not in the Council chamber". ${A}'s lawyers say the plan was only ever a proposal and was never signed.`); }
  if (k === 'guilty') { W.ald = 'Banned from football until 2036'; (W.case = W.case || []).push(['2028-03-15', 'Guilty: 8-year ban, CHF 1m fine']); wffNews('WFF scandal', `Verdict: the ethics committee finds ${A} guilty of breaching the WFF code on conflicts of interest and abuse of position over the World Cup 2026 sell-off plan. He is banned from all football activity for eight years and fined CHF 1 million. ${C.n} announces term limits, published salaries and an independent audit of every commercial deal since 2016.`, true); if (live) try { fanPost(G.user, R.pick([`8 years for ${surname(A)}. Should've been life tbh`, `Finally some accountability at the top of football`]), { big: true }); trend(tslug(surname(A)) + 'Banned', 5); } catch (e) { } }
  if (k === 'appeal') { (W.case = W.case || []).push(['2028-04-05', 'Appeal lodged']); wffNews('WFF scandal', `${A} lodges an appeal, calling the verdict "a political execution by my successor".`); }
  if (k === 'final') { W.ald = 'Banned from football until 2036'; (W.case = W.case || []).push(['2028-06-14', 'Appeal rejected: ban stands']); wffNews('WFF scandal', `The WFF Appeal Committee rejects ${A}'s appeal. His eight-year ban stands, and the World Cup 2026 rights deal is declared void.`, true); }
  if (k === 'law') { G.rules = G.rules || {}; G.rules.dl = '2027-07-01'; W.st.day = 'In force from 1 July 2027'; wffNews('WFF', 'The daylight offside law comes into force on 1 July 2027 in every competition. Expect fewer offside calls and a few more goals.'); }
}
function wffRun() {
  const W = wff(); W.done = W.done || {}; const late = [];
  for (const [d, k] of WFF_PLAN) { const key = d + k; if (G.date < d || W.done[key]) continue; W.done[key] = 1; if (G.date > addDays(d, 10)) late.push([d, k]); else try { wffStep(k); } catch (e) { console.error(e); } }
  if (late.length) {
    WFF_CATCH = { d: null, lines: [] };
    try { for (const [d, k] of late) { WFF_CATCH.d = d; try { wffStep(k); } catch (e) { console.error(e); } } } finally { const L = WFF_CATCH.lines; WFF_CATCH = null; if (L.length) news('WFF', `What has happened at the ${WFF.name} so far (game scenario): ${L.join(' ')}`, null, true); }
  }
  // self-heal: once the congress vote is past, the challenger is president
  if (W.done['2027-05-19vote'] && W.pres !== WFF.ch.n) { W.pres = WFF.ch.n; W.st.day = W.st.day || 'Approved for 2027/28'; }
  if (W.done['2027-06-09law']) { G.rules = G.rules || {}; G.rules.dl = G.rules.dl || '2027-07-01'; }
}
// catch up as soon as a save is loaded, not only when the next day is played
const _rsWFF = restore;
restore = function (obj) { const r = _rsWFF.apply(this, arguments); try { if (G && G.teams && G.date) wffRun(); } catch (e) { console.error(e); } return r; };
const _dtWFF = dailyTick;
dailyTick = function () {
  try { if (G && G.teams) wffRun(); } catch (e) { console.error(e); }
  return _dtWFF.apply(this, arguments);
};
function wffEndorse(v) {
  const W = wff(); if (W.end) return 'You have already given your view.'; if (W.res) return 'The election is over.';
  W.end = v; const who = v === 'ch' ? WFF.ch.n : WFF.inc.n;
  if (v === 'no') { W.end = 'no'; return 'You stay neutral.'; }
  news('WFF election', `${G.mgr} publicly backs ${who} in the WFF presidential election.`, G.user, true);
  try { journPost(jr('gp'), `${G.mgr} comes out for ${who} in the WFF race.`, { u: 1 }); fanPost(G.user, v === 'ch' ? 'Gaffer backing daylight offside. Based.' : 'Why is our manager getting involved in WFF politics?', { u: 1 }); } catch (e) { }
  return `You back ${who}.`;
}
ACT.wffe = (v) => { toast(wffEndorse(v)); autosave(); render(); };
ACT.wffo = () => { UI.modal = null; UI.scr = 'wff'; render(); };
function scrWFF() {
  try { wffRun(); } catch (e) { console.error(e); }
  const W = wff(); const I = WFF.inc, C = WFF.ch; const presC = W.pres === C.n;
  const st = (r) => (W.st[r.k] || r.st0);
  const elect = W.res ? `<p><b>Result (19 May 2027):</b> ${esc(C.n)} ${W.res[0]} · ${esc(I.n)} ${W.res[1]} · abstentions ${W.res[2]}</p>` : W.done && W.done['2026-11-18cand'] ? `<p>Congress vote on 19 May 2027. Latest soundings: <b>${esc(C.n)} ${W.poll}%</b>, ${esc(I.n)} ${100 - W.poll}%.</p>${W.end ? `<p class="dim">Your position: ${W.end === 'ch' ? 'backing ' + esc(C.n) : W.end === 'inc' ? 'backing ' + esc(I.n) : 'neutral'}.</p>` : `<div class="row"><button class="btn" data-a="wffe" data-v="ch">Back ${esc(C.n)}</button><button class="btn" data-a="wffe" data-v="inc">Back ${esc(I.n)}</button><button class="btn" data-a="wffe" data-v="no">Stay neutral</button></div>`}` : '<p class="dim">The next presidential election is at the May 2027 congress.</p>';
  const cand = (x, cur) => `<div class="box pad"><label class="lb">${cur ? 'President' : W.res ? (W.ald ? esc(W.ald) : 'Former president') : 'Candidate'}</label><div style="font-size:17px;font-weight:700">${esc(x.n)}</div><div class="dim">${esc(x.nat)} · ${esc(x.role)}</div><p style="margin:6px 0 0;font-size:13px">${esc(x.bio)}</p></div>`;
  return `<div class="band">${WFF.name}<small>${WFF.short} · world governing body</small></div>
  <div class="box pad" style="margin-bottom:10px"><dl class="kv"><dt>President</dt><dd><b>${esc(W.pres)}</b></dd><dt>General secretariat</dt><dd>${esc(WFF.sec)}</dd><dt>Headquarters</dt><dd>${WFF.hq}</dd><dt>Founded</dt><dd>${WFF.founded}</dd><dt>Member associations</dt><dd>${WFF.members}</dd><dt>Competitions</dt><dd>World Cup, Club World Cup, youth and women's world cups</dd></dl>
  <p class="dim" style="font-size:12px;margin:6px 0 0">A fictional governing body for this game; its officials and their storyline are invented.</p></div>
  <h2 class="sect">Presidential election</h2><div class="grid2" style="gap:10px">${cand(presC ? C : I, true)}${cand(presC ? I : C, false)}</div>${elect}
  ${W.case ? `<h2 class="sect">The World Cup 2026 sell-off case</h2><div class="box pad"><div><b>${esc(I.n)}</b> (former president): <span class="${/Banned/.test(W.ald || '') ? 'red' : 'amb'}">${esc(W.ald || '')}</span></div>${W.case.map(c => `<div style="margin-top:4px"><span class="dim mono">${dShort(c[0])}</span> ${esc(c[1])}</div>`).join('')}</div>` : ''}
  <h2 class="sect">Laws of the game</h2><div class="tw"><table class="t"><thead><tr><th>Change</th><th>Status</th><th></th></tr></thead><tbody>${WFF_RULES.map(r => `<tr><td><b>${esc(r.n)}</b><div class="dim" style="font-size:12px;white-space:normal;min-width:200px">${esc(r.d)}</div></td><td>${esc(st(r))}</td><td class="dim" style="font-size:12px;white-space:normal">${esc(r.tag)}</td></tr>`).join('')}</tbody></table></div>
  <h2 class="sect">Latest</h2>${W.log.length ? W.log.map(x => `<div style="margin:6px 0"><span class="dim mono">${dShort(x[0])}</span> <b>${esc(x[1])}</b> ${esc(x[2])}</div>`).join('') : '<p class="dim">Nothing yet this season.</p>'}`;
}
const _scrWFF = screen;
screen = function (s) { if (s === 'wff') return scrWFF(); return _scrWFF(s); };
// news about the WFF links to its page
const _maWFF = msgActions;
msgActions = function (m) { const h = _maWFF(m); try { if (m && /^WFF/.test(m.title || '')) return h + `<div class="row" style="margin-top:10px"><button class="btn" data-a="wffo">Open the WFF page</button></div>`; } catch (e) { } return h; };
