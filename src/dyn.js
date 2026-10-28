// ===== SQUAD DYNAMICS: happiness, player talks, media =====
const RIVALS = [['ARS', 'TOT'], ['ARS', 'CHE'], ['LIV', 'EVE'], ['LIV', 'MUN'], ['MCI', 'MUN'], ['NEW', 'SUN'], ['CRY', 'BHA'], ['CHE', 'TOT'], ['CHE', 'FUL'], ['BRE', 'FUL'], ['LEE', 'MUN'], ['NFO', 'LEE'], ['COV', 'AVL'], ['IPS', 'NOR'], ['ARS', 'MUN'], ['LIV', 'MCI']];
function isRival(a, b) { return RIVALS.some(([x, y]) => (x === a && y === b) || (x === b && y === a)); }
function hap(p) { return p.hap == null ? 65 : p.hap; }
function setHap(p, d) { p.hap = clamp(hap(p) + d, 0, 100); }
const STATUS_LABEL = { key: 'Key player', first: 'First team', rotation: 'Rotation', backup: 'Squad player', youth: 'Prospect' };
const STATUS_EXP = { key: .8, first: .6, rotation: .35, backup: .15, youth: .05 };
function squadStatus(p) { if (p.age <= 19 && p.ca < 78) return 'youth'; return importance(p); }
function teamGames() { return Object.values(G.fx).filter(f => f.r && (f.h === G.user || f.a === G.user)).length; }
function startRatio(p) { const n = teamGames() - (p.mi || 0); return n > 0 ? p.st.s / n : null; }
function hapLabel(h) { return h >= 80 ? 'Delighted' : h >= 65 ? 'Content' : h >= 50 ? 'Settled' : h >= 35 ? 'Frustrated' : h >= 20 ? 'Unhappy' : 'Wants out'; }
function hapCls(h) { return h >= 65 ? 'grn' : h >= 50 ? '' : h >= 35 ? 'amb' : 'red'; }
function moraleLabel(m) { return m >= 85 ? 'Superb' : m >= 70 ? 'Good' : m >= 55 ? 'Okay' : m >= 40 ? 'Low' : 'Very low'; }
function teamSpirit() { const sq = squad(G.user); if (!sq.length) return 50; return sq.reduce((s, p) => s + p.mor * .6 + hap(p) * .4, 0) / sq.length; }
function concerns(p) {
  const out = []; const st = squadStatus(p); const r = startRatio(p); const n = teamGames();
  if (r != null && n - (p.mi || 0) >= 4 && r + .15 < STATUS_EXP[st] && p.inj <= 0) out.push('wants more first-team football');
  if (p.con <= G.year + 1 && p.ca >= 72 && p.age < 32) out.push('is worried about his contract');
  if (p.prom) out.push(`was promised ${p.prom.need} starts in ${p.prom.of} games`);
  if (p.req) out.push('has asked to leave');
  if (p.form.length >= 3 && +formAvg(p) < 6.3) out.push('is short of confidence');
  return out;
}

// weekly update, called from weekly()
function weeklyDynamics() {
  const n = teamGames();
  const tb = userTable(); const pos = tb.findIndex(r => r.t === G.user) + 1; const tgt = boardTarget().pos;
  for (const p of squad(G.user)) {
    if (p.hap == null) p.hap = 65;
    let d = (65 - p.hap) * 0.04; // drift
    const st = squadStatus(p); const r = startRatio(p);
    if (n - (p.mi || 0) >= 4 && r != null && p.inj <= 0) { const gap = r - STATUS_EXP[st]; d += clamp(gap * 9, -3, 2); }
    d += (p.mor - 65) / 30;
    if (n >= 6) d += pos <= tgt ? .6 : pos > tgt + 4 ? -.8 : 0;
    if (p.con <= G.year + 1 && p.ca >= 74 && p.age < 31 && G.date >= sd('2026-11-01')) d -= 1;
    // promises
    if (p.prom && n - p.prom.mb >= p.prom.of) {
      const got = p.st.s - p.prom.sb;
      if (got >= p.prom.need) { d += 12; msg('Promise kept', `${p.n} is pleased you kept your word and gave him ${got} starts.`); }
      else { d -= 25; p.trust = (p.trust || 0) - 1; msg('Promise broken', `${p.n} feels let down. You promised ${p.prom.need} starts in ${p.prom.of} games and he got ${got}.`); }
      p.prom = null;
    }
    setHap(p, d);
    p.mor = Math.min(p.mor, hap(p) + 35);
    // transfer requests
    if (hap(p) < 22) { p.low = (p.low || 0) + 1; } else p.low = 0;
    if (!p.req && p.low >= 3 && p.age > 19) { const why = concerns(p)[0]; p.req = true; msg('Transfer request', `${p.n} has handed in a transfer request. He says he ${why || 'is unhappy at the club'}. Talk to him from his profile or the Dynamics screen.`); if (R.chance(.6)) mediaStory(`Reports say ${p.n} has asked to leave ${userTeam().short} after falling out of favour.`, -3); }
    if (p.req && hap(p) >= 55) { p.req = false; msg('Transfer request withdrawn', `${p.n} has withdrawn his transfer request and is committed to the club again.`); }
  }
  // captaincy
  const cp = captainProblem(); if (cp) { for (const p of squad(G.user)) p.mor = clamp(p.mor - .8, 5, 100); if (R.chance(.15)) msg('Dressing room', 'Senior players are unsettled about the captaincy: ' + cp[0] + '.'); }
  // occasional media stories
  if (R.chance(.18)) randomStory();
}
function mediaStory(text, fanD) { G.fans = clamp((G.fans == null ? 60 : G.fans) + (fanD || 0), 0, 100); news('Media', text, G.user); }
function randomStory() {
  const sq = squad(G.user);
  const opts = [];
  const unhappy = sq.filter(p => hap(p) < 35); if (unhappy.length) { const p = R.pick(unhappy); opts.push(() => mediaStory(`Sources close to ${p.n} say he is frustrated with his situation at ${userTeam().short}.`, -1)); }
  const star = sq.filter(p => p.ca >= 82 && +formAvg(p) >= 7.2); if (star.length) { const p = R.pick(star); opts.push(() => mediaStory(`${p.n} is attracting attention from abroad after a strong run of form.`, 0)); }
  const tb = userTable(); const pos = tb.findIndex(r => r.t === G.user) + 1;
  if (teamGames() >= 5) { if (pos <= boardTarget().pos) opts.push(() => mediaStory(`Pundits praise ${G.mgr}'s work at ${userTeam().short}, who sit ${ordinal(pos)}.`, 3)); else opts.push(() => mediaStory(`Questions are being asked about ${G.mgr}'s future with ${userTeam().short} ${ordinal(pos)} in the table.`, -2)); }
  if (opts.length) R.pick(opts)();
}

// ---- talking to players ----
function canTalk(p) { return !p.lastTalk || dDiff(p.lastTalk, G.date) >= 7; }
function talkTo(pid, k) {
  const p = P(pid); if (!p || p.c !== G.user) return null;
  if (!canTalk(p)) return { reply: `${surname(p.n)} says you spoke only a few days ago.`, cls: 'dim' };
  p.lastTalk = G.date;
  const fa = p.form.length ? +formAvg(p) : null; const det = attrs(p).Det; const st = squadStatus(p); const r = startRatio(p);
  let reply, dh = 0, dm = 0;
  if (k === 'praise') {
    if (fa == null) { reply = "Thanks boss, but I haven't really played yet."; dh = 1; }
    else if (fa >= 7.0) { reply = "Thanks boss. I'm enjoying my football right now."; dh = 7; dm = 8; }
    else if (fa >= 6.6) { reply = 'Cheers, I know there is more to come from me.'; dh = 3; dm = 4; }
    else { reply = "With respect, I know I haven't played well. Don't patronise me."; dh = -4; dm = -3; }
  } else if (k === 'criticise') {
    if (fa != null && fa >= 7) { reply = "I don't understand that. I've been one of our best players."; dh = -10; dm = -8; }
    else if (det >= 13) { reply = "Fair enough. I'll show you in training."; dm = 7; dh = -1; }
    else { reply = "I'm trying my best. That doesn't help me."; dm = -7; dh = -5; }
  } else if (k === 'time') {
    const exp = STATUS_EXP[st];
    if (r == null || teamGames() < 3) reply = "It's early. I'm happy to fight for my place.";
    else if (r + .15 < exp) reply = `I see myself as a ${STATUS_LABEL[st].toLowerCase()}, but I've only started ${p.st.s} of the ${teamGames() - (p.mi || 0)} games I was fit for. I need to play more.`;
    else reply = "I'm happy with my game time. Thanks for asking.";
    dh = 1;
    return { reply, cls: '', promise: r != null && r + .15 < exp && !p.prom };
  } else if (k === 'promise') {
    if (p.prom) return { reply: 'You already gave me your word.', cls: 'dim' };
    if ((p.trust || 0) < -1) { reply = "You've broken promises before. I'll believe it when I see it."; dh = 2; }
    else { reply = "That's all I want. I'll hold you to it."; dh = 10; dm = 5; }
    p.prom = { need: 3, of: 5, sb: p.st.s, mb: teamGames(), d: G.date };
  } else if (k === 'fight') {
    if (st === 'youth' || st === 'backup') { reply = "Understood. I'll keep working hard."; dh = 2; dm = 2; }
    else { reply = "I've earned more than that. I'm disappointed."; dh = -6; dm = -4; }
  } else if (k === 'encourage') {
    if (p.age <= 22) { reply = "Thanks boss, that means a lot. I want to learn."; dh = 6; dm = 6; }
    else { reply = "Appreciate it. I'll keep going."; dh = 3; dm = 3; }
  } else if (k === 'letgo') {
    p.listed = true; p.req = false; reply = "Thank you for being honest. I'll stay professional until a deal is done."; dh = 15;
  } else if (k === 'stay') {
    if ((p.trust || 0) < 0 || hap(p) < 15) { reply = "My mind is made up. I want to leave."; dh = -3; }
    else { reply = "If I am part of your plans, I'll give it another go."; dh = 14; p.req = false; }
  } else if (k === 'contract') {
    if (p.con <= G.year + 1) reply = `My deal ends in summer ${p.con}. I want to know if you see me here next season.`;
    else reply = `I'm under contract until ${p.con}. I'm not thinking about that now.`;
    return { reply, cls: '' };
  }
  setHap(p, dh); p.mor = clamp(p.mor + dm, 5, 100);
  return { reply, cls: dh > 0 ? 'grn' : dh < 0 ? 'red' : '' };
}

// ---- press conferences ----
function pressFor(f) {
  const home = f.h === G.user, opp = home ? f.a : f.h; const on = tName(opp);
  const tb = userTable(); const myPos = tb.findIndex(r => r.t === G.user) + 1; const oPos = tb.findIndex(r => r.t === opp) + 1;
  const myForm = (tb.find(r => r.t === G.user) || { form: [] }).form.slice(-4);
  const losses = myForm.filter(x => x === 'L').length;
  const inj = squad(G.user).filter(p => p.inj > 0 && p.ca >= 80);
  if (f.comp !== 'PL' && f.rnd === 'Final') return { q: `It's the ${COMP_NAME[f.comp]} final against ${on}. How are the players feeling?` };
  if (isRival(G.user, opp)) return { q: `It's a derby against ${on}. What does this game mean to you and the fans?` };
  if (losses >= 2) return { q: `Your team has lost ${losses} of the last four. Is there a problem in the dressing room?` };
  if (inj.length) return { q: `How big a blow is it to be without ${inj[0].n}?` };
  if (oPos && myPos && oPos <= 4 && LEAGUE_COMPS.includes(f.comp)) return { q: `${on} are ${ordinal(oPos)} in the table. Can you get something from this game?` };
  if (T(opp).lite) return { q: `Is there a danger of underestimating ${on}?` };
  return { q: `What are you expecting from ${on}?` };
}
const PRESS_ANS = [
  ['confident', 'Back the team: "We are going there to win."'],
  ['respect', 'Show respect: "They are a good side. We will need to be at our best."'],
  ['mind', 'Mind games: "All the pressure is on them."'],
  ['decline', 'Keep it short: "We focus on ourselves."']
];
function pressAnswer(fid, k) {
  const f = G.fx[fid]; const opp = f.h === G.user ? f.a : f.h;
  G.press = { fid, k };
  let txt;
  if (k === 'confident') { for (const p of squad(G.user)) p.mor = clamp(p.mor + 4, 5, 100); txt = 'The players liked hearing that. Expectations are high now.'; }
  else if (k === 'respect') { for (const p of squad(G.user)) p.mor = clamp(p.mor + 1, 5, 100); txt = 'A calm, sensible answer. Nobody will read much into it.'; }
  else if (k === 'mind') { if (!T(opp).lite) for (const p of squad(opp)) p.mor = clamp(p.mor - 4, 5, 100); G.fans = clamp((G.fans ?? 60) + 2, 0, 100); txt = `The quote is all over the back pages. ${tName(opp)}'s players will have seen it.`; }
  else { txt = 'The journalists look disappointed. No headlines today.'; }
  return txt;
}
function pressAfterMatch(f, won, lost) {
  if (!G.press || G.press.fid !== f.id) return;
  const k = G.press.k;
  if (k === 'confident') { if (won) G.fans = clamp((G.fans ?? 60) + 4, 0, 100); if (lost) { G.fans = clamp((G.fans ?? 60) - 4, 0, 100); G.board = clamp(G.board - 2, 0, 100); news('Media', `Your pre-match promise of a win comes back to haunt you after defeat to ${tName(f.h === G.user ? f.a : f.h)}.`, G.user); } }
  if (k === 'mind' && lost) { G.fans = clamp((G.fans ?? 60) - 3, 0, 100); news('Media', `Rival fans mock ${G.mgr}'s mind games after the defeat.`, G.user); }
  G.press = null;
}

// ---- post-match interview ----
function interviewFor(M) {
  const ui = uSide(M), S = M.sides[ui]; const gf = M.score[ui], ga = M.score[1 - ui];
  const won = gf > ga || (M.pens && M.pens[ui] > M.pens[1 - ui]); const lost = !won && (gf < ga || M.pens);
  const star = S.ps.filter(e => !e.p.pseudo && e.mins > 0).sort((a, b) => b.rt - a.rt)[0];
  const worst = S.ps.filter(e => !e.p.pseudo && e.mins >= 45).sort((a, b) => a.rt - b.rt)[0];
  const red = M.ev.find(e => e.t === 'rc' && e.side === ui);
  let q;
  if (red) q = `You had a man sent off. Was it the right decision from the referee?`;
  else if (won && gf - ga >= 3) q = `A big win. Was this your best performance of the season?`;
  else if (won) q = `Three points. What pleased you most today?`;
  else if (lost && ga - gf >= 3) q = `That was a heavy defeat. What went wrong?`;
  else if (lost) q = `A disappointing result. How do you explain it?`;
  else q = `A point today. Is that a fair result?`;
  return { q, won, lost, star, worst, red };
}
function interviewAnswer(k) {
  const I = UI.iv; const ids = squad(G.user);
  let txt = '';
  if (k === 'team') { for (const p of ids) p.mor = clamp(p.mor + (I.lost ? 2 : 3), 5, 100); txt = 'The squad appreciated the public backing.'; }
  else if (k === 'star' && I.star) { const p = I.star.p; setHap(p, 6); p.mor = clamp(p.mor + 6, 5, 100); txt = `${p.n} is delighted to be singled out.`; }
  else if (k === 'blame' && I.worst) { const p = I.worst.p; const det = attrs(p).Det; if (det >= 14) { p.mor = clamp(p.mor + 4, 5, 100); txt = `${p.n} takes the criticism on the chin and wants to respond.`; } else { p.mor = clamp(p.mor - 10, 5, 100); setHap(p, -8); txt = `${p.n} is upset at being criticised in public.`; } }
  else if (k === 'demand') { for (const p of ids) { const det = attrs(p).Det; p.mor = clamp(p.mor + (det >= 13 ? 3 : -3), 5, 100); } txt = 'Some players respond to the challenge, others feel it was harsh.'; }
  else if (k === 'ref') { G.fans = clamp((G.fans ?? 60) + 3, 0, 100); if (R.chance(.45)) { const fine = 0.05; userTeam().bal -= fine; userTeam().fin.out.other += fine; G.board = clamp(G.board - 2, 0, 100); msg('FA charge', `The FA has fined ${G.mgr} ${money(fine)} for comments about the referee.`); txt = 'The fans loved it. The FA did not.'; } else txt = 'The fans loved it. The FA has let it go this time.'; }
  else if (k === 'humble') { G.board = clamp(G.board + 1, 0, 100); txt = 'Measured and professional. The board approves.'; }
  else txt = 'You keep it brief and head down the tunnel.';
  return txt;
}

// ---- UI: dynamics screen ----
function scrDynamics() {
  const sq = squad(G.user).slice().sort((a, b) => hap(a) - hap(b));
  const spirit = Math.round(teamSpirit());
  const fans = Math.round(G.fans ?? 60);
  const unhappy = sq.filter(p => hap(p) < 35).length;
  return `<div class="band">Squad dynamics<small>Happiness, morale, promises and media</small></div>
  <div class="grid3" style="margin-top:10px">
    <div class="box pad"><label class="lb">Team spirit</label><div class="big ${spirit >= 65 ? 'grn' : spirit >= 45 ? '' : 'red'}">${spirit}</div><div class="bar"><i style="width:${spirit}%;background:${spirit >= 65 ? 'var(--grn)' : spirit >= 45 ? 'var(--cyan)' : 'var(--red)'}"></i></div></div>
    <div class="box pad"><label class="lb">Fan confidence</label><div class="big ${fans >= 60 ? 'grn' : fans >= 40 ? '' : 'red'}">${fans}</div><div class="bar"><i style="width:${fans}%;background:var(--amb)"></i></div></div>
    <div class="box pad"><label class="lb">Players with concerns</label><div class="big ${unhappy ? 'amb' : 'grn'}">${sq.filter(p => concerns(p).length).length}</div><div class="dim">${unhappy} unhappy · ${sq.filter(p => p.req).length} transfer request(s)</div></div>
  </div>
  <p class="dim" style="margin:10px 0 6px">Morale moves match to match. Happiness moves slowly: it depends on game time against the player's status, contract, promises and how the team is doing. Unhappy players can hand in a transfer request. Click a player to talk to him.</p>
  <div class="tw"><table class="t"><thead><tr><th>Player</th><th>Status</th><th class="n">Starts</th><th>Happiness</th><th class="n">Morale</th><th>Concerns</th></tr></thead><tbody>
  ${sq.map(p => { const h = Math.round(hap(p)); const c = concerns(p); return `<tr class="click" data-a="player" data-v="${p.id}"><td><b>${esc(p.n)}</b> <span class="mono dim">${POS_LABEL[p.pos]}</span></td><td>${STATUS_LABEL[squadStatus(p)]}</td><td class="n">${p.st.s}/${teamGames() - (p.mi || 0)}</td><td><span class="${hapCls(h)}">${hapLabel(h)}</span> <span class="mono dim">${h}</span></td><td class="n">${Math.round(p.mor)}</td><td style="white-space:normal;min-width:180px" class="${c.length ? 'amb' : 'dim'}">${esc(c.join('; ') || '-')}${p.req ? ' <span class="tag inj">REQUEST</span>' : ''}</td></tr>`; }).join('')}
  </tbody></table></div>`;
}
function talkBlock(p) {
  if (p.c !== G.user) return '';
  const h = Math.round(hap(p)); const c = concerns(p);
  const btns = [['praise', 'Praise his form'], ['criticise', 'Criticise his form'], ['time', 'Discuss playing time'], ['contract', 'Ask about his contract']];
  if (p.age <= 22) btns.push(['encourage', 'Encourage him']);
  const req = p.req ? `<div class="row" style="margin-top:6px"><span class="red">He has asked to leave.</span><button class="btn" data-a="ptalk" data-k="stay" data-v="${p.id}">Ask him to stay</button><button class="btn" data-a="ptalk" data-k="letgo" data-v="${p.id}">Agree to sell him</button></div>` : '';
  return `<h2 class="sect">Happiness &amp; talks</h2>
  <div class="row" style="gap:16px"><span>Status: <b>${STATUS_LABEL[squadStatus(p)]}</b></span><span>Happiness: <b class="${hapCls(h)}">${hapLabel(h)} (${h})</b></span><span>Morale: <b>${moraleLabel(p.mor)} (${Math.round(p.mor)})</b></span></div>
  <div class="dim" style="font-size:13px;margin-top:4px">${c.length ? 'He ' + esc(c.join(', ')) + '.' : 'No concerns at the moment.'}</div>
  <div class="row" style="margin-top:8px">${btns.map(([k, l]) => `<button class="btn" data-a="ptalk" data-k="${k}" data-v="${p.id}" ${canTalk(p) || k === 'contract' ? '' : 'disabled'}>${l}</button>`).join('')}</div>
  ${canTalk(p) ? '' : '<div class="dim" style="font-size:12.5px;margin-top:4px">You spoke to him recently. Wait a week before another chat.</div>'}${req}
  <div id="talkreply">${UI.talkReply && UI.talkReply.pid === p.id ? UI.talkReply.html : ''}</div>`;
}
function pressBox(f) {
  if (G.press && G.press.fid === f.id) return `<div class="box pad" style="margin-top:12px"><h2 class="sect" style="margin-top:0">Press conference</h2><p class="${G.press.res ? '' : 'dim'}">${esc(G.press.res || 'Done.')}</p></div>`;
  const pq = pressFor(f);
  return `<div class="box pad" style="margin-top:12px"><h2 class="sect" style="margin-top:0">Press conference</h2><p>“${esc(pq.q)}”</p><div style="display:grid;gap:5px">${PRESS_ANS.map(([k, l]) => `<button class="btn" style="text-align:left" data-a="press" data-k="${k}" data-v="${f.id}">${esc(l)}</button>`).join('')}</div><p class="dim" style="font-size:12.5px;margin-bottom:0">Optional. Your words affect your players, the opposition and the fans.</p></div>`;
}
function interviewModal(M) {
  const I = interviewFor(M); UI.iv = I;
  const opts = [['team', 'Praise the whole team'], ...(I.star ? [['star', `Single out ${surname(I.star.p.n)} (${I.star.rt.toFixed(1)})`]] : []), ...(I.lost && I.worst ? [['blame', `Criticise ${surname(I.worst.p.n)} (${I.worst.rt.toFixed(1)})`]] : []), ...(!I.won ? [['demand', 'Say the players must do better']] : []), ...(I.red || I.lost ? [['ref', 'Blame the referee']] : []), ['humble', 'Stay measured and professional'], ['skip', 'Walk past the cameras']];
  UI.modal = `<div class="band yel"><span>Post-match interview</span></div><div class="mc"><p style="font-size:16px">“${esc(I.q)}”</p><div style="display:grid;gap:5px">${opts.map(([k, l]) => `<button class="btn" style="text-align:left" data-a="iv" data-v="${k}">${esc(l)}</button>`).join('')}</div></div>`;
}

Object.assign(ACT, {
  ptalk: (v, el) => { const k = el.dataset.k; const r = talkTo(v, k); if (!r) return; let html = `<div class="box pad" style="margin-top:8px"><b>${esc(surname(P(v).n))}:</b> <span class="${r.cls}">“${esc(r.reply)}”</span>`; if (r.promise) html += `<div class="row" style="margin-top:8px"><button class="btn pri" data-a="ptalk" data-k="promise" data-v="${v}">Promise 3 starts in the next 5 games</button><button class="btn" data-a="ptalk" data-k="fight" data-v="${v}">Tell him to fight for his place</button></div>`; html += '</div>'; UI.talkReply = { pid: v, html }; if (r.promise) P(v).lastTalk = null; autosave(); playerModal(v); },
  press: (v, el) => { const txt = pressAnswer(v, el.dataset.k); G.press.res = txt; autosave(); render(); },
  iv: (v) => { const txt = interviewAnswer(v); UI.modal = null; UI.iv = null; autosave(); toast(txt); render(); }
});
const _screen2 = screen;
screen = function (s) { if (s === 'dyn') { try { return scrDynamics(); } catch (e) { console.error(e); return `<div class="box pad red">${esc(e.message)}</div>`; } } return _screen2(s); };

