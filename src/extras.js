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
