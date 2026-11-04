// extras.js: the playable penalty shoot-out on the match screen, the WUPH.com social network (verified ✅
// accounts) and the tribute to Jesús de Miguel (real event, Nov 2026). Loaded after reports.js.

// ===================== 1. playable penalty shoot-out =====================
const _slSO = startLive;
startLive = function (fid, instant) { _slSO(fid, instant); try { if (!instant && UI.match) UI.match.M.soLive = true; } catch (e) { console.error(e); } };
const _tickSO = tick;
tick = function () { const LM = UI.match; if (LM && LM.M.so && !LM.M.so.over && !LM.M.done) { LM.run = false; renderMatch(); return; } return _tickSO(); };
const SO_DIR = { L: 'left', C: 'middle', R: 'right' };
function soDots(M, s) {
  const k = M.so.kicks[s]; const n = Math.max(5, k.length + (M.so.turn === s && !M.so.over ? 1 : 0));
  let h = ''; for (let i = 0; i < n; i++) h += i < k.length ? (k[i] ? '<span class="sod ok">●</span>' : '<span class="sod no">✕</span>') : '<span class="sod">○</span>';
  return h;
}
function soScene(M) {
  const L = M.so.last;
  return `<div class="soscene" id="soscene"><div class="sogoal"><div class="sonet"></div></div><div class="sokp" id="sokp"><span class="sokp-h"></span><span class="sokp-b"></span></div><div class="soball" id="soball"></div>${L ? `<div class="soverdict ${L.how === 'goal' ? 'ok' : 'no'}" id="soverd">${L.how === 'goal' ? 'GOAL' : L.how === 'save' ? 'SAVED' : L.how === 'post' ? 'POST' : L.how === 'over' ? 'OVER' : 'WIDE'}</div>` : ''}</div>`;
}
function soPanel(LM) {
  const M = LM.M, so = M.so; const ui = uSide(M); const s = so.turn;
  const head = M.sides.map((S, i) => `<div class="row" style="gap:8px;align-items:center;justify-content:space-between"><b>${esc(S.name)}</b><span>${soDots(M, i)}</span><b class="mono" style="font-size:20px">${so.sc[i]}</b></div>`).join('');
  let ctl = '';
  if (!so.over) {
    if (s === ui) {
      const L = soTakers(M.sides[s]).filter(e => !so.used[s].includes(e.p.id)); const all = L.length ? L : soTakers(M.sides[s]);
      const sel = LM.soPick && all.some(e => e.p.id === LM.soPick) ? LM.soPick : all[0] && all[0].p.id;
      ctl = `<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><label class="lb" for="sopick" style="margin:0">Taker</label><select class="f" id="sopick" data-a="sopick">${all.map(e => `<option value="${e.p.id}" ${e.p.id === sel ? 'selected' : ''}>${esc(e.p.n)} · Fin ${attrs(e.p).Fin} · Det ${attrs(e.p).Det}</option>`).join('')}</select></div>
      <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><span class="dim">Where does he aim?</span><button class="btn pri" data-a="sokick" data-v="L">◀ Left</button><button class="btn pri" data-a="sokick" data-v="C">Down the middle</button><button class="btn pri" data-a="sokick" data-v="R">Right ▶</button></div>`;
    } else {
      const tk = soTaker(M, s); const gk = active(M.sides[ui]).find(e => e.role === 'GK');
      ctl = `<div class="dim">${esc(tk ? tk.p.n : 'Their taker')} steps up for ${esc(M.sides[s].name)}. Which way does ${esc(gk ? surname(gk.p.n) : 'your keeper')} go?</div>
      <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn pri" data-a="sodive" data-v="L">◀ Dive left</button><button class="btn pri" data-a="sodive" data-v="C">Stay in the middle</button><button class="btn pri" data-a="sodive" data-v="R">Dive right ▶</button></div>`;
    }
    ctl += `<div class="row" style="margin-top:8px"><button class="btn" data-a="soauto">Let the players decide the rest</button><span class="dim" style="font-size:12.5px">Left and right as seen from behind the taker.</span></div>`;
  }
  const L = so.last;
  const lastTxt = L ? `<div style="margin:6px 0 2px"><b>${esc(L.n)}</b> (${esc(M.sides[L.s].name)}) went ${SO_DIR[L.aim]}, ${esc(L.gk)} ${L.dive === 'C' ? 'stayed in the middle' : 'dived ' + SO_DIR[L.dive]}: <b class="${L.how === 'goal' ? 'grn' : 'red'}">${L.how === 'goal' ? 'scored' : L.how === 'save' ? 'saved' : L.how === 'post' ? 'hit the post' : L.how === 'over' ? 'over the bar' : 'wide'}</b>.</div>` : `<div class="dim" style="margin:6px 0 2px">${esc(M.sides[s].name)} kick first.</div>`;
  return `<div class="box pad so" style="margin-top:10px"><h2 class="sect" style="margin-top:0">Penalty shoot-out${so.n >= 10 && !so.over ? ' · sudden death' : ''}</h2>${head}${soScene(M)}${lastTxt}${ctl}</div>`;
}
function soAnimate(LM) {
  const M = LM.M, L = M.so && M.so.last; if (!L) return;
  const still = LM.soAnim === M.so.n; LM.soAnim = M.so.n;
  const b = document.getElementById('soball'), k = document.getElementById('sokp'), v = document.getElementById('soverd'); if (!b || !k) return;
  const tx = { L: 24, C: 50, R: 76 }[L.aim];
  let bx = tx, by = L.aim === 'C' ? 34 : 40;
  if (L.how === 'save') { bx = L.dive === 'C' ? 50 : L.dive === 'L' ? 31 : 69; by = 48; }
  if (L.how === 'wide') { bx = L.aim === 'R' ? 97 : 3; by = 46; }
  if (L.how === 'over') { by = 2; }
  if (L.how === 'post') { bx = L.aim === 'R' ? 89.5 : L.aim === 'L' ? 10.5 : 50; by = L.aim === 'C' ? 12 : 42; }
  const kx = { L: -95, C: 0, R: 95 }[L.dive], kr = { L: -72, C: 0, R: 72 }[L.dive];
  if (still) { b.style.left = bx + '%'; b.style.top = by + '%'; b.style.transform = 'translate(-50%,-50%) scale(.75)'; k.style.transform = `translateX(calc(-50% + ${kx}%)) ${L.dive === 'C' ? 'translateY(-12%)' : `rotate(${kr}deg)`}`; return; }
  b.style.left = '50%'; b.style.top = '92%'; b.style.transform = 'translate(-50%,-50%) scale(1.4)'; k.style.transform = 'translateX(-50%)';
  if (v) v.style.opacity = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    b.style.transition = 'left .55s cubic-bezier(.2,.7,.3,1), top .55s cubic-bezier(.2,.7,.3,1), transform .55s'; k.style.transition = 'transform .45s .08s cubic-bezier(.3,.6,.3,1)';
    b.style.left = bx + '%'; b.style.top = by + '%'; b.style.transform = 'translate(-50%,-50%) scale(.75)';
    k.style.transform = `translateX(calc(-50% + ${kx}%)) ${L.dive === 'C' ? 'translateY(-12%)' : `rotate(${kr}deg)`}`;
    if (v) setTimeout(() => { v.style.opacity = 1; }, 600);
  }));
  try { if (L.how === 'goal' && L.s === uSide(M)) SND.roar(); else if (L.how !== 'goal') SND.ooh(); } catch (e) { }
}
const _rmSO = renderMatch;
renderMatch = function () {
  _rmSO();
  try {
    const LM = UI.match; if (!LM || !LM.M.so) return;
    const ctrl = document.querySelector('.ctrl'); if (!ctrl) return;
    if (!LM.M.so.over) { const run = ctrl.querySelector('[data-a="mrun"]'); if (run) run.remove(); }
    ctrl.insertAdjacentHTML('afterend', soPanel(LM));
    soAnimate(LM);
  } catch (e) { console.error(e); }
};
function soAfter(LM) {
  const M = LM.M;
  if (M.done) { LM.run = false; try { stepOthers(LM, 200); SND.whistle(3, true); } catch (e) { } }
  renderMatch();
}
Object.assign(ACT, {
  sokick: (v) => { const LM = UI.match; if (!LM || !LM.M.so || LM.M.so.over) return; soKick(LM.M, LM.soPick, v, null); LM.soPick = null; soAfter(LM); },
  sodive: (v) => { const LM = UI.match; if (!LM || !LM.M.so || LM.M.so.over) return; soKick(LM.M, null, null, v); soAfter(LM); },
  soauto: () => { const LM = UI.match; if (!LM || !LM.M.so) return; soAuto(LM.M); soAfter(LM); }
});
document.addEventListener('change', (ev) => { const el = ev.target; if (el && el.id === 'sopick' && UI.match) UI.match.soPick = el.value; });

// ===================== 2. WUPH.com =====================
const WUPH_VERIFIED = ['jour', 'club', 'pun', 'cre', 'var', 'off'];
const _phW = postHtml;
postHtml = function (p) {
  const h = _phW(p); if (!WUPH_VERIFIED.includes(p.k)) return h;
  const nm = `<b>${esc(p.a)}</b>`; const i = h.indexOf(nm);
  return i < 0 ? h : h.slice(0, i + nm.length) + '<span class="vchk" title="Verified account">✅</span>' + h.slice(i + nm.length);
};
const _smW = scrMedia;
scrMedia = function () {
  return _smW().replace('<div class="band">Media<small>Fans, reporters and rumours</small></div>', '<div class="band"><span class="wuph">WUPH<i>.com</i></span><small>Fans, reporters and rumours · ✅ verified account</small></div>')
    .replace('Reporters, pundits, former referees, creators, outlets and fan accounts are all fictional.', 'WUPH.com is a fictional social network. Reporters, pundits, former referees, creators, outlets and fan accounts are all fictional; ✅ marks official and verified accounts.');
};
function offPost(name, handle, text, extra) { return post(Object.assign({ k: 'off', a: name, h: handle, t: text }, extra || {})); }

// ===================== 3. tribute: Jesús de Miguel (real event) =====================
// Facts as reported (Sky Sports, 3 Nov 2026; Spanish press, 3 Nov 2026): the CD Tenerife striker, 30, collided with
// FC Andorra's goalkeeper during a Segunda División match on 2 Nov 2026, suffered a cardiac arrest and died on 3 Nov.
// Online racist abuse followed, including against a player mistaken for the goalkeeper. Posts below come from clubs
// and fictional fans in the game; no statements are attributed to real people or governing bodies.
const DM_DATE = '2026-11-03';
function tributeDM() {
  G.sto = G.sto || {}; if (G.sto.dm || G.date < DM_DATE || G.date > '2027-07-01') return;
  G.sto.dm = G.date; G.sto.dmMatch = 1;
  news('In memoriam: Jesús de Miguel', 'CD Tenerife striker Jesús de Miguel has died at the age of 30. He suffered a cardiac arrest after a collision with FC Andorra\'s goalkeeper in a Segunda División match on 2 November 2026 and died the following day. Clubs hold a minute\'s applause and players wear black armbands this week. Football\'s thoughts are with his family, his team-mates and the Tenerife supporters.', null, true);
  news('No to racism', 'After the match, racist abuse was sent online, some of it to a player who had nothing to do with the game and was mistaken for the goalkeeper. Clubs and players have condemned it. The collision was an accident: footballers do not set out to hurt each other. Racism has no place in football. Report abuse; never share it.', null, true);
  const ten = T('S_Tenerife') ? 'S_Tenerife' : null, and = T('S_Andorra') ? 'S_Andorra' : null;
  try {
    if (ten) clubPost(ten, 'Descansa en paz, Jesús. Siempre serás parte de esta familia. 💙🤍 #DEPJesúsdeMiguel', { big: true });
    if (and) clubPost(and, 'Our deepest condolences to the family of Jesús de Miguel, to CD Tenerife and to everyone who loved him. 🖤', { big: true });
    for (const t of [G.user].concat(R.shuffle((G.ll || []).concat(G.sa || [], G.pl)).slice(0, 3))) if (T(t) && !T(t).nat) clubPost(t, `Everyone at ${T(t).name} sends love to the family, friends and team-mates of Jesús de Miguel. There will be a minute's applause before our next match. 🖤`);
    if (ten) { fanPost(ten, 'Hasta siempre, Jesús. Gracias por todo. 💙🤍'); fanPost(ten, 'Heliodoro will sing your name forever. DEP 💙'); }
    fanPost(G.user, "Rest in peace Jesús de Miguel. Football is just a game. 🖤");
    fanPost(G.user, "It was an accident. Nobody goes out to hurt a fellow pro. The racist abuse afterwards is disgusting. #NoToRacism");
    offPost('WUPH Safety', '@WUPHSafety', 'We have removed racist posts about this week\'s match and suspended the accounts. Racism has no place on WUPH.com or in football. Report it, don\'t share it.', { big: true });
    journPost(jr('jm'), 'Jesús de Miguel, 30, has died after Monday\'s collision in Tenerife v Andorra. A minute\'s applause will be held at grounds across Spain this weekend.', { big: true, tid: ten || undefined });
    trend('DEPJesúsdeMiguel', 30); trend('NoToRacism', 24);
  } catch (e) { console.error(e); }
}
const _dtDM = dailyTick;
dailyTick = function () { const r = _dtDM.apply(this, arguments); try { if (G && G.teams && !G.sacked) tributeDM(); } catch (e) { console.error(e); } return r; };
const _rsDM = restore;
restore = function (obj) { _rsDM(obj); try { tributeDM(); } catch (e) { console.error(e); } };
// a minute's applause before the user's next match
const _cmDM = createMatch;
createMatch = function (fid, live) {
  const M = _cmDM.apply(this, arguments);
  try { if (G.sto && G.sto.dmMatch && M.live && (M.sides[0].tid === G.user || M.sides[1].tid === G.user)) { M.com.push({ min: 0, k: 'ko', text: 'Before kick-off, players and supporters hold a minute\'s applause in memory of Tenerife striker Jesús de Miguel. Both teams wear black armbands.' }); G.sto.dmMatch = 0; } } catch (e) { console.error(e); }
  return M;
};

// ===================== 4. title mathematically secured =====================
// After each matchday: if the leader's points can no longer be caught by anyone (even winning all their games),
// the title is announced in the inbox, news, WUPH.com and the trends, and the club's players celebrate.
const CLINCH_LG = { PL: 'Premier League', CH: 'Championship', LL: 'La Liga', SA: 'Serie A' };
function leagueGames(div) { const n = div === 'CH' ? 24 : divTeams(div).length || 20; return 2 * (n - 1); }
function clinchCheck() {
  if (!G || !G.teams) return;
  G.clinch = G.clinch || {}; const s = seasonLabel(G.year);
  for (const div in CLINCH_LG) {
    if (G.clinch[div] === s) continue;
    let tb; try { tb = tableOf(div); } catch (e) { continue; }
    if (!tb || tb.length < 2 || !tb[0].p) continue;
    const tot = leagueGames(div); const lead = tb[0];
    const left = tot - lead.p; if (left < 0) continue;
    const catchable = tb.slice(1).some(r => r.pts + 3 * Math.max(0, tot - r.p) >= lead.pts);
    if (catchable) continue;
    G.clinch[div] = s; announceTitle(div, lead, tb[1], left);
  }
}
function announceTitle(div, lead, second, left) {
  const t = lead.t, T0 = T(t); const name = T0 ? T0.name : tName(t); const LN = CLINCH_LG[div];
  const gap = lead.pts - second.pts; const when = left > 0 ? `with ${left} game${left > 1 ? 's' : ''} to spare` : 'on the final day';
  const mgr = t === G.user ? G.mgr : mgrName(t);
  const body = `${name} are ${LN} champions ${seasonLabel(G.year)}! The title is mathematically secured ${when}: ${lead.pts} points, ${gap} clear of ${tName(second.t)}. ${t === G.user ? `A triumph for ${G.mgr}.` : `${mgr}'s side cannot be caught.`}`;
  news(`${LN}: ${name} are champions`, body, t, true);
  try {
    if (t === G.user) {
      msg('🏆 CHAMPIONS!', `${body} The players, the board and the supporters are celebrating. The trophy will be presented after the last home game of the season.`, { k: 'nav', v: 'table', lab: 'See the table', tab: '' });
      for (const p of squad(G.user)) { p.mor = clamp(p.mor + 15, 5, 100); if (typeof setHap === 'function') setHap(p, 8); }
      G.board = clamp((G.board || 60) + 15, 0, 100); G.fans = clamp((G.fans ?? 60) + 15, 0, 100);
      if (typeof userAward === 'function') try { userAward(`${LN} title`, 6, `${G.mgr} wins the ${LN} with ${name}.`); } catch (e) { }
    } else if (second.t === G.user) msg('Title race over', `${name} have clinched the ${LN}. ${G.mgr}'s side finish the race ${gap} points behind with ${left} game${left === 1 ? '' : 's'} left.`);
    // WUPH.com
    const big = { big: true, tid: t, u: t === G.user ? 1 : 0 };
    if (T0 && !T0.lite) clubPost(t, `🏆 ${LN.toUpperCase()} CHAMPIONS ${seasonLabel(G.year)}! 🏆 It's official. Thank you to every player, every member of staff and every supporter. ${mgr}, what a season.`, big);
    for (const x of [
      `CHAMPIONS!!! 🏆🏆🏆 I've waited all season to say it. WE ARE THE CHAMPIONS!`,
      `${left > 0 ? left + ' games to spare' : 'Last day drama'} and it's DONE. ${surname(mgr)} ${R.pick(['genius', 'legend', 'you beauty'])} 😭❤️`,
      `Party in town tonight 🍾 ${name} champions of ${div === 'CH' ? 'the Championship' : div === 'PL' ? 'England' : div === 'LL' ? 'Spain' : 'Italy'}!`
    ]) fanPost(t, x, { big: true });
    if (second.t && T(second.t) && !T(second.t).lite) fanPost(second.t, R.pick([`Gutted. Fair play to ${tName(t)}, they were better over the season.`, `Can't believe we let that slip. Big summer needed.`, `Congrats to ${tName(t)} I suppose. We go again next year.`]));
    const es = ctryOf(t) === 'ESP';
    journPost(jr(es ? 'jm' : 'mh'), `${name} have been confirmed as ${LN} champions ${when}. ${lead.pts} points from ${lead.p} games.`, { big: true, tid: t });
    if (typeof PUNDITS !== 'undefined' && typeof punditPost === 'function') { const pd = R.pick(PUNDITS.filter(p => !!p.es === es) .concat(PUNDITS.filter(p => !p.es)).slice(0, 4)); punditPost(pd, `Deserved champions. ${name} have been the most consistent side in the ${LN}${gap >= 10 ? ' by a distance' : ''}. Credit to ${mgr}.`, { tid: t }); }
    offPost(LN, '@' + LN.replace(/\s/g, ''), `🏆 ${name} are ${seasonLabel(G.year)} ${LN} champions! Congratulations! 🎉`, { big: true, tid: t, u: t === G.user ? 1 : 0 });
    trend(slug(T0 ? (T0.short || T0.name) : name) + 'Champions', 40); trend('Champions', 10);
  } catch (e) { console.error(e); }
}
const _fdCl = finishDay;
finishDay = function () { const r = _fdCl.apply(this, arguments); try { clinchCheck(); } catch (e) { console.error(e); } return r; };

// ===================== 5. older saves: add this season's Cup Winners' Cup and Club World Cup =====================
// Careers started before these were added had no G.cups.CWC/CWX for the season in progress, so the post-season
// tournament never happened that year. Add them on load if their draw or first round is still to come.
function ensurePostSeasonCups() {
  if (!G || !G.cups || typeof cupRounds !== 'function') return;
  for (const [c, fn] of [['CWC', drawCWC], ['CWX', drawCWX]]) {
    if (G.cups[c]) continue;
    const spec = CAL[c]; const first = sd(spec.rounds[0][1][0]); if (G.date >= first) continue;
    G.cups[c] = { id: c, rounds: cupRounds(spec.rounds), ri: 0, winner: null };
    const dd = sd(spec.draw);
    if (G.date < dd) G.tasks.push({ d: dd, t: c === 'CWC' ? 'drawCWC' : 'drawCWX' });
    else try { fn(); } catch (e) { console.error(e); }
  }
}
const _rsPS = restore;
restore = function (obj) { _rsPS(obj); try { ensurePostSeasonCups(); } catch (e) { console.error(e); } };

// ===================== 6. Cup Winners' Cup entry rules and the Fair Play Award =====================
// Entry: this season's domestic cup winners (FA Cup, League Cup, Copa del Rey, Coppa Italia). If last season had no
// edition in this save (careers started before the tournament existed), last season's cup winners are invited too.
// If doubles leave fewer than 8 teams: the cup runners-up, then each country's Fair Play Award winner, then other
// European clubs. More than 8 teams: a preliminary round, the strongest sides get byes. Draw after the last league day.
CAL.CWC = { draw: '2027-05-31', rounds: [['Quarter-final', ['2027-06-02'], 1], ['Semi-final', ['2027-06-04'], 1], ['Final', ['2027-06-07'], 1]] };
const CWC_BIG = [['Preliminary round', ['2027-06-01'], 1], ['Quarter-final', ['2027-06-03'], 1], ['Semi-final', ['2027-06-05'], 1], ['Final', ['2027-06-07'], 1]];
const FP_LG = { PL: 'Premier League', CH: 'Championship', LL: 'La Liga', SA: 'Serie A' };
const FP_CTRY = { PL: 'England', LL: 'Spain', SA: 'Italy' };
function fairPlay() {
  const s = seasonLabel(G.year); G.fp = G.fp || {}; if (G.fp.s === s) return G.fp;
  const out = { s };
  for (const div in FP_LG) {
    const teams = divTeams(div); if (!teams.length) continue;
    const pts = {}; for (const t of teams) pts[t] = { c: 0, r: 0, g: 0 };
    for (const f of Object.values(G.fx)) { if (f.comp !== div || !f.r || !f.st) continue; [f.h, f.a].forEach((t, i) => { const x = pts[t]; if (!x) return; x.c += (f.st[i].yc || 0) + 3 * (f.st[i].rc || 0); x.r += f.st[i].rc || 0; x.g++; }); }
    const best = teams.filter(t => pts[t].g).sort((a, b) => pts[a].c - pts[b].c || pts[a].r - pts[b].r || (hash(a + s) % 7) - (hash(b + s) % 7))[0];
    if (!best) continue;
    out[div] = best;
    news('Fair Play Award', `${tName(best, false)} win the ${FP_LG[div]} Fair Play Award ${s}: ${pts[best].c} disciplinary points (yellow 1, red 3) from ${pts[best].g} league games, the fewest in the division.${div !== 'CH' ? ` It can earn a place in the Cup Winners' Cup.` : ''}`, best, best === G.user);
    try { if (T(best) && !T(best).lite) clubPost(best, `🤝 Proud to win the ${FP_LG[div]} Fair Play Award this season. Respect on and off the pitch.`, { tid: best, u: best === G.user ? 1 : 0 }); } catch (e) { }
    if (best === G.user) msg('Fair Play Award', `${T(best).name} have won the ${FP_LG[div]} Fair Play Award for the fewest cards in the league.`);
  }
  G.fp = out; G.fpHist = (G.fpHist || []).concat(out).slice(-20);
  return out;
}
function cupFinalists(c) { const cup = G.cups[c]; if (!cup || !cup.winner) return null; const f = typeof finalOf === 'function' ? finalOf(c) : null; return { w: cup.winner, r: f ? (f.h === cup.winner ? f.a : f.h) : null }; }
drawCWC = function () {
  const cup = G.cups.CWC; if (!cup) return;
  const dd = sd(CAL.CWC.draw);
  if (G.date < dd) { if (!G.tasks.some(t => t.t === 'drawCWC' && t.d === dd)) G.tasks.push({ d: dd, t: 'drawCWC' }); return; } // older saves: wait for the end of the leagues
  if (cup.rounds.some(r => r.ties.length)) return;
  const ok = (t) => t && T(t) && !T(t).nat;
  const ent = [], why = {}; const add = (t, w) => { if (ok(t) && !ent.includes(t)) { ent.push(t); why[t] = w; } };
  const CUPS = [['FA', 'FA Cup'], ['LC', 'League Cup'], ['CDR', 'Copa del Rey'], ['CIT', 'Coppa Italia']];
  for (const [c, n] of CUPS) { const x = cupFinalists(c); if (x) add(x.w, `${n} winners`); }
  // last season's winners when that edition was not played in this save
  const prev = (G.chist || []).find(r => r.y === G.year - 1);
  if (prev && !(prev.c && prev.c.CWC)) for (const [c, n] of CUPS) { const w = prev.c && prev.c[c === 'FA' ? 'FA' : c] && prev.c[c].w; if (w) add(w, `${n} winners ${prev.s} (invited)`); }
  if (ent.length < 8) for (const [c, n] of CUPS) { const x = cupFinalists(c); if (x && x.r && ent.length < 8) add(x.r, `${n} runners-up`); }
  if (ent.length < 8) { const fp = fairPlay(); for (const d of ['PL', 'LL', 'SA']) if (fp[d] && ent.length < 8) add(fp[d], `Fair Play Award, ${FP_CTRY[d]}`); } else fairPlay();
  const lite = R.shuffle([].concat(EURO.UCL, EURO.UEL).filter(x => x[1] >= 74).map(x => 'E_' + slug(x[0])).filter(id => G.teams[id] && !ent.includes(id)));
  while (ent.length < 8 && lite.length) add(lite.shift(), 'invited');
  const list = ent.slice(0, 16); const big = list.length > 8;
  cup.rounds = cupRounds(big ? CWC_BIG : CAL.CWC.rounds); cup.ri = 0; cup.winner = null;
  let pairs;
  if (big) { const bySt = list.slice().sort((a, b) => teamStrength(b) - teamStrength(a)); const byes = bySt.slice(0, 16 - list.length); const pl = R.shuffle(bySt.slice(16 - list.length)); pairs = []; for (let i = 0; i + 1 < pl.length; i += 2) pairs.push([pl[i], pl[i + 1]]); cup.byes = byes; }
  else { const l = R.shuffle(list); pairs = []; for (let i = 0; i + 1 < l.length; i += 2) pairs.push([l[i], l[i + 1]]); cup.byes = []; }
  cup.ent = list.map(t => [t, why[t]]);
  drawFixed('CWC', 0, pairs);
  for (const t of cup.rounds[0].ties) for (const id of t.fx) { G.fx[id].ven = 'Neutral host city'; G.fx[id].vcap = 45000; }
  news("Cup Winners' Cup", `Game scenario: the revived Cup Winners' Cup is played after the season by ${list.length} clubs: ${list.map(t => `${tName(t)} (${why[t]})`).join('; ')}. ${big ? `Preliminary round: ${pairs.map(([a, b]) => tName(a) + ' v ' + tName(b)).join(', ')}; byes for ${cup.byes.map(t => tName(t)).join(', ')}.` : `Quarter-finals: ${pairs.map(([a, b]) => tName(a) + ' v ' + tName(b)).join(', ')}.`}`, list.includes(G.user) ? G.user : null, true);
  if (list.includes(G.user)) msg("Cup Winners' Cup", `${T(G.user).name} are in the Cup Winners' Cup as ${why[G.user]}. ${big && !cup.byes.includes(G.user) ? 'You start in the preliminary round.' : 'You start in the quarter-finals.'} Check Cups & Europe.`);
};
CUP_NEXT.CWC = (winners) => {
  const cup = G.cups.CWC; const ri = cup.ri + 1; let next = winners.slice();
  if (ri === 1 && cup.byes && cup.byes.length) next = next.concat(cup.byes);
  const l = R.shuffle(next); const pairs = []; for (let i = 0; i + 1 < l.length; i += 2) pairs.push([l[i], l[i + 1]]);
  drawFixed('CWC', ri, pairs);
  for (const t of cup.rounds[ri].ties) for (const id of t.fx) { G.fx[id].ven = 'Neutral host city'; G.fx[id].vcap = 45000; }
  const ut = cup.rounds[ri].ties.find(t => t.t.includes(G.user)); if (ut) news("Cup Winners' Cup draw", `${cup.rounds[ri].n}: ${tName(ut.t[0])} v ${tName(ut.t[1])} (${dNice(cup.rounds[ri].d[0], false)}).`, G.user);
};
// the award is also given in seasons without a Cup Winners' Cup draw
const _seFP = seasonEnd;
seasonEnd = function () { try { fairPlay(); } catch (e) { console.error(e); } return _seFP.apply(this, arguments); };
const _cpCW = scrComps;
scrComps = function () {
  const h = _cpCW(); const c = G.cups && G.cups.CWC;
  if (UI.tab.cp !== 'CWC' || !c || !c.ent) return h;
  return h + `<h2 class="sect">Entrants</h2><div class="tw"><table class="t"><tbody>${c.ent.map(([t, w]) => `<tr><td>${tLink(t, true)}</td><td class="dim">${esc(w || '')}${(c.byes || []).includes(t) ? ' · bye to the quarter-finals' : ''}</td></tr>`).join('')}</tbody></table></div>`;
};
