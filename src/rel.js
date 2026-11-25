// rel.js: relationships with managers and players at other clubs. Loaded after occasion.js.
//  - G.rel.m: manager name -> -100..100 (follows the manager when he changes club)
//  - G.rel.p: player id -> -100..100 (players at other clubs, including your former players)
//  - Build them through private messages, dinners, words in the media (press conferences, the post-match interview,
//    the Relationships screen) and handshakes after a game.
//  - Effects: friendly managers ask a little less for their players and send tip-offs; feuds raise the price and
//    spill into the papers. Players who like you are keener to join and ask for slightly lower wages.
// Real managers and players only appear in reported, in-game events; nothing here is a quote from a real person.

function RL() { if (!G.rel) G.rel = { m: {}, p: {}, cd: {}, log: [], sq: null, hs: {} }; const r = G.rel; r.hs = r.hs || {}; r.cd = r.cd || {}; r.log = r.log || []; return r; }
function mgrKey(tid) { const t = T(tid); return t && t.mgr ? String(t.mgr).replace(/\s*\(caretaker\)/i, '').trim() : ''; }
function relClubOk(tid) { const t = T(tid); return !!(t && tid !== G.user && !t.lite && !t.leg && !t.nat && mgrKey(tid) && mgrKey(tid) !== 'Unknown'); }
function relM(tid) { const k = mgrKey(tid); return k ? (RL().m[k] || 0) : 0; }
function relP(pid) { return RL().p[pid] || 0; }
function relRoll(s) { return (hash(String(s) + '|' + G.date + '|' + (G.mgr || '')) % 1000) / 1000; }
function relLog(kind, key, dv, txt) { const r = RL(); r.log.unshift({ d: G.date, k: kind, key, dv: Math.round(dv), t: txt }); if (r.log.length > 40) r.log.length = 40; }
function relAdj(kind, key, d, txt) {
  if (!key && key !== 0) return 0; const r = RL(); const o = kind === 'm' ? r.m : r.p;
  o[key] = clamp(Math.round(((o[key] || 0) + d) * 10) / 10, -100, 100); if (txt) relLog(kind, key, d, txt); return o[key];
}
function relLabel(v) { return v >= 60 ? 'Close friends' : v >= 25 ? 'Friendly' : v > -25 ? 'Neutral' : v > -60 ? 'Frosty' : 'Feud'; }
function relCls(v) { return v >= 25 ? 'grn' : v > -25 ? '' : v > -60 ? 'amb' : 'red'; }
function relBar(v) {
  const w = Math.min(50, Math.abs(v) / 2); const col = v >= 0 ? 'var(--grn)' : 'var(--red)';
  return `<span class="relbar" title="${Math.round(v)}"><i style="${v >= 0 ? 'left:50%' : `left:${50 - w}%`};width:${w}%;background:${col}"></i></span>`;
}
function relTag(v) { return `<span class="reltag ${relCls(v)}">${relLabel(v)} <span class="mono">${v > 0 ? '+' : ''}${Math.round(v)}</span></span>`; }
// cooldowns
function relCdKey(kind, key, act) { return kind + ':' + key + ':' + act; }
function relWait(kind, key, act, days) { const d = RL().cd[relCdKey(kind, key, act)]; if (!d) return 0; const g = dDiff(d, G.date); return g >= days ? 0 : days - g; }
function relMark(kind, key, act) { RL().cd[relCdKey(kind, key, act)] = G.date; }
function mgrTid(name) { for (const tid of fullTeams()) if (mgrKey(tid) === name) return tid; return null; }
// transfer effects shown in the player and club views
function relFeeMult(tid) { return 1 - clamp(relM(tid), -100, 100) * 0.0012; }   // +100 -> 12% off, -100 -> 12% more
function relFeeTxt(tid) { const m = relFeeMult(tid); const pc = Math.round((1 - m) * 100); return pc > 0 ? `asks about ${pc}% less from you` : pc < 0 ? `asks about ${-pc}% more from you` : 'no effect on fees'; }

// ---------- actions ----------
const REL_MACTS = [
  ['msg', 'Send a message', 7], ['dinner', 'Invite to dinner', 28], ['praise', 'Praise him in the media', 14],
  ['dig', 'Have a dig in the media', 14], ['advice', 'Ask for a tip-off', 28]
];
const REL_PACTS = [['pmsg', 'Send a message', 14], ['ppraise', 'Praise him in the media', 21], ['chat', 'Chat at full time', 0]];
function relLastMatch() {
  if (!G.fx || !G.user) return null;
  let best = null; for (const f of Object.values(G.fx)) { if (!f.r || (f.h !== G.user && f.a !== G.user)) continue; if (!best || dDiff(best.d, f.d) > 0) best = f; }
  if (!best || dDiff(best.d, G.date) > 3) return null; return best;
}
function relMgrAct(tid, k) {
  if (!relClubOk(tid)) return null; const m = mgrKey(tid), v = relM(tid), club = tName(tid); const a = REL_MACTS.find(x => x[0] === k); if (!a) return null;
  if (relWait('m', m, k, a[2])) return { txt: `You did that recently. Try again in ${relWait('m', m, k, a[2])} day(s).`, cls: 'dim' };
  const roll = relRoll(m + k); let txt, cls = 'grn';
  if (k === 'msg') { if (v <= -60 && roll < .5) { relAdj('m', m, 1, 'Message left unanswered'); txt = `${m} leaves your message unanswered.`; cls = 'dim'; } else { const d = 4 + Math.round(roll * 3); relAdj('m', m, d, 'Private message'); txt = `${m} replies with a friendly message.`; } }
  else if (k === 'dinner') { if (v < -40) { relLog('m', m, 0, 'Dinner invitation turned down'); txt = `${m} turns down the invitation.`; cls = 'amb'; } else { const d = 9 + Math.round(roll * 5); relAdj('m', m, d, 'Dinner together'); txt = `You have dinner with ${m}. Plenty of football talk and a few laughs.`; } }
  else if (k === 'praise') { relAdj('m', m, 8, 'Praised in the media'); try { news('Media', `${G.mgr} praises the work ${m} is doing at ${club}.`, G.user); } catch (e) { } if (isRival(G.user, tid)) G.fans = clamp((G.fans ?? 60) - 1, 0, 100); txt = `${m} appreciates the kind words.${isRival(G.user, tid) ? ' Some of your fans are less impressed.' : ''}`; }
  else if (k === 'dig') {
    relAdj('m', m, -14, 'Criticised in the media'); try { news('Media', `${G.mgr} takes a swipe at ${m} and ${club} in his press conference.`, G.user); } catch (e) { }
    if (isRival(G.user, tid)) G.fans = clamp((G.fans ?? 60) + 2, 0, 100); try { for (const p of squad(tid)) p.mor = clamp(p.mor - 2, 5, 100); } catch (e) { }
    txt = `The comments make the back pages. ${m} will not forget them.`; cls = 'amb';
  }
  else if (k === 'advice') {
    if (v < 40) return { txt: `You need a friendly relationship (+40) before ${m} shares tip-offs.`, cls: 'dim' };
    const tip = relTip(tid); relAdj('m', m, 2, 'Asked for a tip-off');
    if (tip) { msg('Tip-off from ' + m, `${m} (${club}) gets in touch privately. ${tip}`); txt = `${m} passes on a tip. Check your inbox.`; }
    else { txt = `${m} has nothing to pass on right now, but is happy to help next time.`; cls = 'dim'; }
  }
  relMark('m', m, k); autosave(); return { txt, cls };
}
function relTip(tid) {
  const pool = squad(tid).filter(p => !p.loan && p.c === tid);
  const unhappy = pool.filter(p => hap(p) < 40 || p.listed || p.req).sort((a, b) => b.ca - a.ca)[0];
  if (unhappy) return `${unhappy.n} is ${p_reason(unhappy)} and could be had for a fair price.`;
  const loan = pool.filter(p => typeof loanListed === 'function' && loanListed(p)).sort((a, b) => b.pa - a.pa)[0];
  if (loan) return `${tName(tid)} would let young ${loan.n} (${loan.age}) go out on loan for a season.`;
  // a player elsewhere in the league who wants out
  const lg = divOf(tid); const other = Object.values(G.players).filter(p => p.c && p.c !== G.user && divOf(p.c) === lg && (p.req || hap(p) < 30)).sort((a, b) => b.ca - a.ca)[0];
  if (other) return `Word is that ${other.n} at ${tName(other.c)} is ${p_reason(other)}.`;
  return null;
}
function p_reason(p) { return p.req ? 'pushing for a move' : p.listed ? 'on the transfer list' : 'unhappy with his situation'; }
function relPlayerAct(pid, k) {
  const p = P(pid); if (!p || !p.c || p.c === G.user) return null; const a = REL_PACTS.find(x => x[0] === k); if (!a) return null;
  if (k === 'chat') {
    const f = relLastMatch(); const opp = f ? (f.h === G.user ? f.a : f.h) : null;
    if (!f || opp !== p.c) return { txt: `You can only do that within three days of playing ${tName(p.c)}.`, cls: 'dim' };
    if (RL().hs['c' + f.id + ':' + pid]) return { txt: 'You already spoke to him after that game.', cls: 'dim' };
    RL().hs['c' + f.id + ':' + pid] = 1; relAdj('p', pid, 8, `Chat after the game v ${tName(p.c)}`); autosave(); return { txt: `You have a quick word with ${p.n} at the final whistle. He seems pleased you made the effort.`, cls: 'grn' };
  }
  if (relWait('p', pid, k, a[2])) return { txt: `You did that recently. Try again in ${relWait('p', pid, k, a[2])} day(s).`, cls: 'dim' };
  let txt, cls = 'grn';
  if (k === 'pmsg') { relAdj('p', pid, 6, 'Private message'); txt = `${p.n} thanks you for getting in touch.`; }
  else if (k === 'ppraise') {
    relAdj('p', pid, 10, 'Praised in the media'); try { setHap(p, -3); } catch (e) { }
    if (relClubOk(p.c)) relAdj('m', mgrKey(p.c), -5, `Praised his player ${p.n} in public`);
    try { news('Media', `${G.mgr} heaps praise on ${tName(p.c)}'s ${p.n}. Is he a transfer target?`, G.user); } catch (e) { }
    txt = `${p.n} is flattered. ${relClubOk(p.c) ? mgrKey(p.c) + ' is not happy about it.' : ''}`.trim();
  }
  relMark('p', pid, k); autosave(); return { txt, cls };
}
function relHandshake(fid, k) {
  const f = G.fx[fid]; if (!f) return null; const opp = f.h === G.user ? f.a : f.h; if (!relClubOk(opp)) return null;
  const r = RL(); if (r.hs[fid]) return { txt: 'Done.', cls: 'dim' }; const m = mgrKey(opp); r.hs[fid] = k;
  let txt, cls = 'grn';
  if (k === 'warm') { relAdj('m', m, 6, `Warm handshake after the game v ${tName(opp)}`); txt = `You shake hands warmly with ${m} and swap a few words.`; }
  else if (k === 'brief') { relAdj('m', m, 1, `Brief handshake v ${tName(opp)}`); txt = `A quick handshake with ${m}, then down the tunnel.`; cls = ''; }
  else { relAdj('m', m, -10, `Skipped the handshake v ${tName(opp)}`); try { news('Media', `${G.mgr} walks straight past ${m} at full time. No handshake.`, G.user); } catch (e) { } if (isRival(G.user, opp)) G.fans = clamp((G.fans ?? 60) + 1, 0, 100); txt = `The cameras catch you walking past ${m}. It will be in the papers.`; cls = 'amb'; }
  autosave(); return { txt, cls };
}

// ---------- weekly: former players, drift, tip-offs and feuds in the papers ----------
function relWeekly() {
  if (!G.user || !T(G.user)) return; const r = RL();
  const cur = {}; for (const p of squad(G.user)) cur[p.id] = Math.round(hap(p));
  if (r.sq) for (const pid in r.sq) { if (pid in cur) continue; const p = P(pid); if (p && p.c && p.c !== G.user && T(p.c)) { const good = r.sq[pid] >= 50; relAdj('p', pid, good ? 25 : -15, good ? `Left you on good terms for ${tName(p.c)}` : `Left you unhappy for ${tName(p.c)}`); } }
  r.sq = cur;
  for (const o of [r.m, r.p]) for (const k in o) { const v = o[k]; if (Math.abs(v) > 15) o[k] = Math.round((v - Math.sign(v) * .5) * 10) / 10; }
  const roll = relRoll('wk'); if (roll > .45) return;
  const ms = Object.entries(r.m).map(([n, v]) => [n, v, mgrTid(n)]).filter(x => x[2] && relClubOk(x[2]));
  const fr = ms.filter(x => x[1] >= 45), fe = ms.filter(x => x[1] <= -45);
  const fans = Object.entries(r.p).filter(([pid, v]) => v >= 50 && P(pid) && P(pid).c && P(pid).c !== G.user && !P(pid).relFan);
  const opts = []; if (fr.length) opts.push('tip'); if (fe.length) opts.push('feud'); if (fans.length) opts.push('fan');
  if (!opts.length) return; const k = opts[hash(G.date + 'relk') % opts.length];
  if (k === 'tip') { const [n, , tid] = fr[hash(G.date + 'relt') % fr.length]; const tip = relTip(tid); if (tip) { msg('Tip-off from ' + n, `${n} (${tName(tid)}) gets in touch privately. ${tip}`); relLog('m', n, 0, 'Sent you a tip-off'); } }
  else if (k === 'feud') { const [n, , tid] = fe[hash(G.date + 'relf') % fe.length]; relAdj('m', n, -2, 'The feud rumbles on in the papers'); try { news('Media', `Asked about ${G.mgr}, ${n} (${tName(tid)}) gives a pointed answer in his press conference. The feud rumbles on.`, G.user); } catch (e) { } }
  else { const [pid] = fans[hash(G.date + 'relp') % fans.length]; const p = P(pid); p.relFan = true; relLog('p', pid, 0, 'Said he would like to work with you'); try { news('Media', `${p.n} (${tName(p.c)}) tells an interviewer he would love to work with ${G.mgr} one day.`, G.user); } catch (e) { } }
}
const _wdRel = weeklyDynamics;
weeklyDynamics = function () { const r = _wdRel.apply(this, arguments); try { relWeekly(); } catch (e) { console.error(e); } return r; };

// ---------- transfer effects ----------
const _askRel = askingPrice;
askingPrice = function (p) { const v = _askRel(p); try { if (G.user && p && p.c && p.c !== G.user && relClubOk(p.c)) { const m = relFeeMult(p.c); if (m !== 1) return Math.max(0.1, Math.round(v * m * 10) / 10); } } catch (e) { } return v; };
const _piRel = playerInterest;
playerInterest = function (p, toTid) {
  let i = _piRel(p, toTid); try { if (toTid === G.user && p) { const v = relP(p.id); if (v >= 50 || p.relFan) i = i === 'no' ? 'maybe' : 'yes'; else if (v <= -40) i = i === 'yes' ? 'maybe' : 'no'; } } catch (e) { } return i;
};
const _wfRel = wageFor;
wageFor = function (p, tid) { const w = _wfRel(p, tid); try { if (tid === G.user && p && p.c !== G.user && relP(p.id) >= 40) return Math.max(2, Math.round(w * .95)); } catch (e) { } return w; };

// ---------- press conference and post-match interview ----------
PRESS_ANS.splice(PRESS_ANS.length - 1, 0, ['praisemgr', 'Praise their manager: "One of the best coaches around."']);
const _paRel = pressAnswer;
pressAnswer = function (fid, k) {
  const f = G.fx[fid]; const opp = f ? (f.h === G.user ? f.a : f.h) : null; const m = opp && relClubOk(opp) ? mgrKey(opp) : '';
  if (k === 'praisemgr') { G.press = { fid, k }; if (m) relAdj('m', m, 7, 'Praised before your game'); for (const p of squad(G.user)) p.mor = clamp(p.mor + 1, 5, 100); return m ? `${m} hears about it and appreciates the respect.` : 'A gracious answer. Nobody will read much into it.'; }
  const txt = _paRel(fid, k);
  try { if (m) { if (k === 'mind') relAdj('m', m, -8, 'Mind games before your game'); else if (k === 'respect') relAdj('m', m, 3, 'Showed respect before your game'); } } catch (e) { }
  return txt;
};
function relIvQ(I) {
  const opp = I.relT, m = mgrKey(opp), s = surname(m), v = relM(opp);
  const q = v >= 25 ? `You and ${m} get on well. Did you have a word after the game?` : v <= -25 ? `Things have been frosty between you and ${m}. Any handshake today?` : `What did you make of ${m}'s ${tName(opp)} side today?`;
  return { q, a: [['warm', `Praise him: "${s} is a top coach. His team made it hard for us."`], ['neutral', 'Keep it polite: "Good game. We move on."'], ['dig', `Have a dig: "We were the only team trying to play football."`]] };
}
const _ivmRel = interviewModal;
interviewModal = function (M) {
  _ivmRel(M); try { const I = UI.iv; if (!I || !UI.modal || !UI.modal.includes('data-a="iv1"')) return; const opp = M.sides[1 - uSide(M)].tid; if (!relClubOk(opp)) return; I.relT = opp; UI.modal = UI.modal.replace('>1/2<', '>1/3<'); } catch (e) { console.error(e); }
};
const _iv1Rel = ACT.iv1;
ACT.iv1 = function (v) { const I = UI.iv; _iv1Rel(v); try { if (I && I.relT && UI.modal) { UI.modal = UI.modal.replace('>2/2<', '>2/3<'); render(); } } catch (e) { } };
const _iv2Rel = ACT.iv2;
ACT.iv2 = function (v) {
  const I = UI.iv; _iv2Rel(v);
  try {
    if (!I || !I.relT) return; const Q = relIvQ(I); UI.iv = I;
    UI.modal = `<div class="bcIv"><div class="bcIvH"><span class="bcLive">LIVE</span><b>${esc(I.rep || '')}</b><span class="dim">Pitch-side reporter · Matchday Live</span><span class="mono" style="margin-left:auto">3/3</span></div><div class="mc"><p style="font-size:16px">“${esc(Q.q)}”</p><div style="display:grid;gap:5px">${Q.a.map(([k, l]) => `<button class="btn" style="text-align:left" data-a="iv3" data-v="${k}">${esc(l)}</button>`).join('')}</div><p class="dim" style="font-size:12.5px;margin-bottom:0">Your answer changes your relationship with ${esc(mgrKey(I.relT))}.</p></div></div>`;
    render();
  } catch (e) { console.error(e); UI.modal = null; UI.iv = null; render(); }
};
ACT.iv3 = (v) => {
  const I = UI.iv || {}; const opp = I.relT; let txt = '';
  if (opp && relClubOk(opp)) {
    const m = mgrKey(opp);
    if (v === 'warm') { relAdj('m', m, 9, 'Praised him in your post-match interview'); txt = `${m} will like that. Your relationship improves.`; }
    else if (v === 'dig') { relAdj('m', m, -12, 'Had a dig in your post-match interview'); if (isRival(G.user, opp)) G.fans = clamp((G.fans ?? 60) + 3, 0, 100); try { news('Media', `${G.mgr} has a dig at ${m}'s ${tName(opp)} after the game.`, G.user); } catch (e) { } txt = `The fans enjoy it. ${m} will not.`; }
    else { relAdj('m', m, 2, 'Polite words after the game'); txt = 'Polite and professional.'; }
  }
  UI.modal = null; UI.iv = null; autosave(); if (txt) toast(txt); render();
};

// ---------- views ----------
function relMgrBlock(tid) {
  if (!relClubOk(tid)) return ''; const m = mgrKey(tid), v = relM(tid);
  const btns = REL_MACTS.filter(([k]) => k !== 'advice' || v >= 40).map(([k, l, d]) => { const w = relWait('m', m, k, d); return `<button class="btn sm" data-a="relm" data-k="${k}" data-v="${esc(tid)}" ${w ? `disabled title="Again in ${w} day(s)"` : ''}>${l}</button>`; }).join('');
  const res = UI.relRes && UI.relRes.key === 'm:' + tid ? `<div class="${UI.relRes.cls}" style="font-size:13px;margin-top:6px">${esc(UI.relRes.txt)}</div>` : '';
  return `<div class="relbox"><div class="row" style="gap:10px;align-items:center"><b>You and ${esc(m)}</b>${relTag(v)}${relBar(v)}</div><div class="dim" style="font-size:12.5px;margin-top:3px">Transfers: ${esc(relFeeTxt(tid))}.</div><div class="row relacts">${btns}</div>${res}</div>`;
}
function relPlayerBlock(p) {
  if (!p || !p.c || p.c === G.user || !T(p.c) || T(p.c).nat) return ''; const v = relP(p.id); const f = relLastMatch(); const opp = f ? (f.h === G.user ? f.a : f.h) : null;
  const btns = REL_PACTS.filter(([k]) => k !== 'chat' || opp === p.c).map(([k, l, d]) => { const w = d ? relWait('p', p.id, k, d) : (f && RL().hs['c' + f.id + ':' + p.id] ? 1 : 0); return `<button class="btn sm" data-a="relp" data-k="${k}" data-v="${p.id}" ${w ? 'disabled' : ''}>${l}</button>`; }).join('');
  const res = UI.relRes && UI.relRes.key === 'p:' + p.id ? `<div class="${UI.relRes.cls}" style="font-size:13px;margin-top:6px">${esc(UI.relRes.txt)}</div>` : '';
  const eff = v >= 50 || p.relFan ? 'He would be keener to join you.' : v >= 40 ? 'He would ask for slightly lower wages.' : v <= -40 ? 'He is cooler on joining you.' : 'Build a relationship to make him keener to join.';
  const mb = relClubOk(p.c) ? ` · His manager: ${relTag(relM(p.c))}` : '';
  return `<h2 class="sect">Relationship</h2><div class="relbox"><div class="row" style="gap:10px;align-items:center"><b>You and ${esc(surname(p.n))}</b>${relTag(v)}${relBar(v)}${p.relFan ? '<span class="tag">Admires you</span>' : ''}</div><div class="dim" style="font-size:12.5px;margin-top:3px">${eff}${mb}</div><div class="row relacts">${btns}</div>${res}</div>`;
}
const _tbRel = talkBlock;
talkBlock = function (p) { const s = _tbRel(p); if (s || !p || p.c === G.user) return s; try { return relPlayerBlock(p); } catch (e) { console.error(e); return ''; } };
const _cmRel = clubModal;
clubModal = function (tid) { _cmRel(tid); try { if (UI.modal && relClubOk(tid) && !UI.modal.includes('class="relbox"')) { UI.modal = UI.modal.replace('<div class="mc">', '<div class="mc">' + relMgrBlock(tid)); render(); } } catch (e) { console.error(e); } };

function scrRel() {
  const r = RL(); const lg = divOf(G.user);
  const mine = fullTeams().filter(t => relClubOk(t) && (UI.relF === 'all' ? (r.m[mgrKey(t)] || divOf(t) === lg) : divOf(t) === lg));
  mine.sort((a, b) => relM(b) - relM(a) || tName(a).localeCompare(tName(b)));
  const allM = Object.values(r.m), allP = Object.entries(r.p).filter(([pid]) => P(pid) && P(pid).c && P(pid).c !== G.user);
  const friends = allM.filter(v => v >= 25).length + allP.filter(([, v]) => v >= 25).length, foes = allM.filter(v => v <= -25).length + allP.filter(([, v]) => v <= -25).length;
  const f = relLastMatch(); let hs = '';
  if (f) { const opp = f.h === G.user ? f.a : f.h; if (relClubOk(opp)) { const done = r.hs[f.id]; const m = mgrKey(opp); hs = `<div class="box pad" style="margin-top:10px"><h2 class="sect" style="margin-top:0">After the game v ${tLink(opp)}</h2>${done ? `<p class="dim" style="margin:0">${done === 'warm' ? `You shook hands warmly with ${esc(m)}.` : done === 'brief' ? `A brief handshake with ${esc(m)}.` : `You skipped the handshake with ${esc(m)}.`}</p>` : `<p style="margin-top:0">Shake hands with ${esc(m)}?</p><div class="row"><button class="btn" data-a="relhs" data-k="warm" data-v="${f.id}">Warm handshake and a chat</button><button class="btn" data-a="relhs" data-k="brief" data-v="${f.id}">Brief handshake</button><button class="btn warn" data-a="relhs" data-k="snub" data-v="${f.id}">Walk past him</button></div>`}<div class="dim" style="font-size:12.5px;margin-top:6px">You can also have a word with any of his players: open a player from ${esc(tName(opp))} and choose Chat at full time.</div></div>`; } }
  const res = UI.relRes && UI.relRes.key === 'scr' ? `<div class="box pad ${UI.relRes.cls}" style="margin-top:8px">${esc(UI.relRes.txt)}</div>` : '';
  const mrow = (t) => { const m = mgrKey(t), v = relM(t); return `<tr><td><b>${esc(m)}</b><div class="dim" style="font-size:12px">${tLink(t)}</div></td><td>${relTag(v)}<div>${relBar(v)}</div></td><td style="white-space:normal;min-width:220px"><div class="row relacts" style="margin:0">${REL_MACTS.filter(([k]) => k !== 'advice' || v >= 40).map(([k, l, d]) => { const w = relWait('m', m, k, d); return `<button class="btn sm" data-a="relm" data-k="${k}" data-v="${esc(t)}" data-s="1" ${w ? `disabled title="Again in ${w} day(s)"` : ''}>${l}</button>`; }).join('')}</div></td></tr>`; };
  const pl = allP.sort((a, b) => b[1] - a[1]).slice(0, 30);
  const log = r.log.slice(0, 12).map(e => { const who = e.k === 'm' ? esc(e.key) : (P(e.key) ? `<span class="lnk" data-a="player" data-v="${e.key}">${esc(P(e.key).n)}</span>` : '?'); return `<li><span class="mono dim">${esc(dNice(e.d))}</span> ${who}: ${esc(e.t)} ${e.dv ? `<b class="${e.dv > 0 ? 'grn' : 'red'}">${e.dv > 0 ? '+' : ''}${e.dv}</b>` : ''}</li>`; }).join('');
  return `<div class="band">Relationships<small>Managers and players at other clubs</small></div>
  <div class="grid3" style="margin-top:10px">
    <div class="box pad"><label class="lb">Friends</label><div class="big grn">${friends}</div><div class="dim">Friendly or better</div></div>
    <div class="box pad"><label class="lb">Rivals</label><div class="big ${foes ? 'red' : ''}">${foes}</div><div class="dim">Frosty or a feud</div></div>
    <div class="box pad"><label class="lb">Why it matters</label><div class="dim" style="font-size:13px">Friendly managers ask less for their players and pass on tip-offs. Feuds raise prices and end up in the papers. Players who like you are keener to join.</div></div>
  </div>${res}${hs}
  <h2 class="sect">Managers</h2>
  <div class="row" style="margin-bottom:6px"><button class="btn sm ${UI.relF !== 'all' ? 'pri' : ''}" data-a="relf" data-v="lg">Your league</button><button class="btn sm ${UI.relF === 'all' ? 'pri' : ''}" data-a="relf" data-v="all">Your league + everyone you know</button></div>
  <div class="tw"><table class="t relt"><thead><tr><th>Manager</th><th>Relationship</th><th>Actions</th></tr></thead><tbody>${mine.map(mrow).join('') || '<tr><td colspan="3" class="dim">No managers yet.</td></tr>'}</tbody></table></div>
  <h2 class="sect">Players at other clubs</h2>
  ${pl.length ? `<div class="tw"><table class="t"><thead><tr><th>Player</th><th>Club</th><th>Relationship</th></tr></thead><tbody>${pl.map(([pid, v]) => { const p = P(pid); return `<tr class="click" data-a="player" data-v="${pid}"><td><b>${esc(p.n)}</b> <span class="mono dim">${POS_LABEL[p.pos] || ''}</span>${p.relFan ? ' <span class="tag">Admires you</span>' : ''}</td><td>${esc(tName(p.c))}</td><td>${relTag(v)}</td></tr>`; }).join('')}</tbody></table></div>` : ''}
  <p class="dim" style="font-size:13px">Open any player at another club to send him a message or praise him in the media. Players who leave you on good terms stay friends. Praising another club's player in public can annoy his manager.</p>
  <h2 class="sect">Recent</h2>${log ? `<ul class="rellog">${log}</ul>` : '<p class="dim">Nothing yet. Answer questions in press conferences and interviews, shake hands after games, or get in touch with a manager above.</p>'}`;
}
const _scrRelS = screen;
screen = function (s) { if (s === 'rel') { try { return scrRel(); } catch (e) { console.error(e); return '<p class="dim">Relationships unavailable.</p>'; } } return _scrRelS(s); };

function relRefresh(el, key, res) {
  UI.relRes = Object.assign({ key }, res || { txt: '', cls: 'dim' });
  if (el && el.closest('.modal')) { if (key.startsWith('m:')) clubModal(key.slice(2)); else { UI.talkReply = null; playerModal(key.slice(2)); } }
  else render();
}
Object.assign(ACT, {
  relm: (v, el) => { const r = relMgrAct(v, el.dataset.k); if (!r) return; relRefresh(el, el.dataset.s ? 'scr' : 'm:' + v, r); },
  relp: (v, el) => { const r = relPlayerAct(v, el.dataset.k); if (!r) return; relRefresh(el, 'p:' + v, r); },
  relhs: (v, el) => { const r = relHandshake(v, el.dataset.k); if (!r) return; relRefresh(el, 'scr', r); },
  relf: (v) => { UI.relF = v; render(); }
});
