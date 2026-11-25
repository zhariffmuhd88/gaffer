// bcast.js: Phase 15. Broadcast presentation, in the style of the pre-match line-up graphic (lineup.js).
// Half-time and full-time cards: score, scorers with minutes, a stats panel (possession, shots, on target, xG,
// corners, cards) and the top three ratings; at full time a Player of the Match card (shirt in club colours and kit
// pattern, rating, key numbers). Tap to move on; they also move on by themselves; switchable in Game. From the cards
// you can put a heatmap or a pass network for either team on the pitch (2D and 3D). During play: a live stats ticker,
// lower-thirds for cards and substitutions, and in 3D the goal replay plays picture-in-picture while play restarts.
// After the match a pitch-side interview: a fictional reporter, two questions, three answers each, with small effects
// on morale, the board and the fans (the first question uses the existing interview effects). No real broadcaster or
// competition branding (device-only logos where uploaded). Loaded after setp.js.

try { const v = localStorage.getItem('gaffer.bcast'); if (v === '0') UI.bcAuto = false; } catch (e) { }
const BC_HX = 24, BC_HY = 16;
function bcTeam(M, s) { const S = M.sides[s]; const t = T(S.tid) || {}; return { S, t, name: t.name || S.name || S.tid, short: String(S.tid || '').toUpperCase() }; }
function bcSw(M, s) { const S = M.sides[s]; const t = T(S.tid) || {}; return typeof BADGES === 'object' && BADGES[S.tid] ? `<img src="${BADGES[S.tid]}" alt="" class="bcB">` : `<span class="bcB" style="background:linear-gradient(90deg,${t.c1 || '#888'} 0 50%,${t.c2 || '#444'} 50% 100%)"></span>`; }
function bcStats(M) {
  const A = M.sides[0].st, B = M.sides[1].st; const po = Math.round(100 * A.po / Math.max(1, A.po + B.po));
  return [['Possession', po + '%', (100 - po) + '%', po / 100], ['Shots', A.sh, B.sh], ['On target', A.ot, B.ot], ['xG', A.xg.toFixed(2), B.xg.toFixed(2)], ['Corners', A.co, B.co], ['Yellow cards', A.yc, B.yc], ['Red cards', A.rc, B.rc]]
    .map(([l, a, b, f]) => { const fa = f != null ? f : (+a + +b > 0 ? +a / (+a + +b) : .5); return { l, a, b, fa }; });
}
function bcScorers(M, s) { return M.ev.filter(e => e.t === 'goal' && e.side === s).map(e => `${esc(surname(pnById(M, e.p)))} ${e.min}'${e.type === 'pen' ? ' (pen)' : ''}${e.own ? ' (og)' : ''}`).join(', '); }
function bcRatings(M) { const all = []; for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) if (!e.p.pseudo && (e.mins > 0 || e.on)) all.push([e, s]); return all.sort((a, b) => b[0].rt - a[0].rt); }
function bcCard(LM, kind, page) {
  const M = LM.M, A = bcTeam(M, 0), B = bcTeam(M, 1);
  const V = LM.vis || {}; const kits = V.kits || kitFor(M);
  const head = `<div class="bcHead"><div class="bcT">${bcSw(M, 0)}<span>${esc(A.name.toUpperCase())}</span></div><div class="bcSc"><b>${M.score[0]}–${M.score[1]}</b><span>${kind === 'ht' ? 'HALF-TIME' : 'FULL-TIME'}${M.pens ? ` · PENS ${M.pens[0]}–${M.pens[1]}` : ''}</span></div><div class="bcT r"><span>${esc(B.name.toUpperCase())}</span>${bcSw(M, 1)}</div></div>
    <div class="bcGoals"><div>${bcScorers(M, 0) || '&nbsp;'}</div><div class="r">${bcScorers(M, 1) || '&nbsp;'}</div></div>`;
  if (page === 0) {
    const st = bcStats(M).map(x => `<div class="bcRow"><span class="mono">${x.a}</span><div class="bcBar"><i style="width:${(x.fa * 100).toFixed(0)}%;background:${kits[0].body}"></i><i style="width:${(100 - x.fa * 100).toFixed(0)}%;background:${kits[1].body}"></i></div><span class="mono r">${x.b}</span><div class="bcL">${x.l}</div></div>`).join('');
    const top = bcRatings(M).slice(0, 3).map(([e, s], i) => `<div class="bcTop"><b>${i + 1}</b><span class="bcDot" style="background:${kits[s].body}"></span><span>${esc(surname(e.p.n))}</span><span class="mono">${e.rt.toFixed(1)}</span></div>`).join('');
    return `${head}<div class="bcBody"><div class="bcStats">${st}</div><div class="bcSide"><div class="bcH">TOP RATINGS</div>${top}<div class="bcH" style="margin-top:8px">ON THE PITCH</div><div class="bcOv">${[0, 1].map(s => `<button class="btn" data-a="bcovl" data-v="heat" data-k="${s}">Heatmap ${esc(bcTeam(M, s).short)}</button><button class="btn" data-a="bcovl" data-v="pass" data-k="${s}">Passes ${esc(bcTeam(M, s).short)}</button>`).join('')}</div></div></div>`;
  }
  // Player of the Match
  const [e, s] = bcRatings(M)[0] || []; if (!e) return head;
  const S = M.sides[s]; const kit = kits[s]; const pat = typeof kitPat === 'function' ? kitPat(S.tid, kit) : ''; const gs = M.ev.filter(x => x.t === 'goal' && x.p === e.p.id && !x.own).length, as = M.ev.filter(x => x.t === 'goal' && x.a === e.p.id).length;
  return `${head}<div class="bcPotm" style="--bcA:${kit.body};--bcB:${kit.trim}"><div class="bcShirt">${typeof shirtSvg === 'function' ? shirtSvg(kit, pat, e.role === 'GK', gkColour(kits)) : ''}<span>${e.p.no || ''}</span></div>
    <div><div class="bcH">PLAYER OF THE MATCH</div><div class="bcPn">${esc((e.p.n || '').toUpperCase())}</div><div class="dim">${esc(bcTeam(M, s).name)} · ${esc(e.role)}</div>
    <div class="bcNums"><div><b>${e.rt.toFixed(1)}</b><span>Rating</span></div><div><b>${gs}</b><span>Goals</span></div><div><b>${as}</b><span>Assists</span></div><div><b>${e.mins || 90}'</b><span>Minutes</span></div></div></div></div>`;
}
function bcShow(LM, kind, page) {
  let o = document.getElementById('bcov'); if (!o) { o = document.createElement('div'); o.id = 'bcov'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Match graphics'); document.body.appendChild(o);
    o.addEventListener('click', (ev) => { if (ev.target.closest('[data-a]') && !ev.target.closest('[data-bcclose]')) return; if (ev.target.closest('[data-bcclose]')) { bcClose(); return; } const L = UI.match; if (!L) { bcClose(); return; } const k = o.dataset.k, p = +o.dataset.p; if (k === 'ft' && p === 0) bcShow(L, 'ft', 1); else bcClose(); }); }
  if (!UI.bcOn) { UI.bcOn = true; o.dataset.run = LM.run ? '1' : ''; LM.run = false; LM.hold = true; }
  o.dataset.k = kind; o.dataset.p = page; const last = kind === 'ht' || page === 1;
  o.innerHTML = `<button class="luX" data-bcclose="1" aria-label="Close">×</button><div class="bcCard">${bcCard(LM, kind, page)}<div class="luHint">${last ? 'Tap to close' : 'Tap for the Player of the Match'} · <span class="mono">${kind === 'ht' ? '1/1' : (page + 1) + '/2'}</span></div></div>`; o.className = 'on';
  clearTimeout(UI.bcT); UI.bcT = setTimeout(() => { if (UI.bcOn && o.dataset.k === kind && +o.dataset.p === page) { if (!last) bcShow(LM, kind, 1); else bcClose(); } }, 9000);
  LM.bcLog = (LM.bcLog || []).concat([kind + page]);
}
function bcClose() {
  clearTimeout(UI.bcT); const o = document.getElementById('bcov'); if (!o) return; o.className = ''; o.innerHTML = ''; const LM = UI.match; const was = UI.bcOn; UI.bcOn = false;
  if (LM && was) { LM.hold = false; if (o.dataset.run === '1' && !LM.M.done) { LM.run = true; try { renderMatch(); schedule(); } catch (e) { } } }
}
ACT.bcovl = (v, el) => { const LM = UI.match; if (!LM) return; LM.ovl13 = { kind: v, side: +el.dataset.k }; LM.ovlV = (LM.ovlV || 0) + 1; bcClose(); renderMatch(); };
ACT.bcovx = () => { const LM = UI.match; if (!LM) return; LM.ovl13 = null; LM.ovlV = (LM.ovlV || 0) + 1; renderMatch(); };
ACT.bcopen = () => { const LM = UI.match; if (!LM) return; bcShow(LM, LM.M.done ? 'ft' : 'ht', 0); };
ACT.bctog = () => { UI.bcAuto = UI.bcAuto === false; try { localStorage.setItem('gaffer.bcast', UI.bcAuto === false ? '0' : '1'); } catch (e) { } render(); };
// ---------- data for the pitch overlays: team heatmaps and pass networks ----------
function bcSample(LM, SC) {
  if (!LM.th) LM.th = [new Float32Array(BC_HX * BC_HY), new Float32Array(BC_HX * BC_HY)];
  const M = LM.M; for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) { if (!e.on) continue; const p = SC.pos.get(e); if (!p) continue; LM.th[s][clamp(Math.floor(p.y * BC_HY), 0, BC_HY - 1) * BC_HX + clamp(Math.floor(p.x * BC_HX), 0, BC_HX - 1)]++; }
}
function bcPass(LM, SC, st) {
  const a = SC.holder || SC.lastHold15 || SC.lastPassFrom, b = st.to; if (!a || !b || !a.p || !b.p) return; const V = LM.vis, M = LM.M; const s = sideOf(V, M, a); if (s !== sideOf(V, M, b)) return;
  LM.pn = LM.pn || [new Map(), new Map()]; LM.pp = LM.pp || new Map();
  const k = a.p.id < b.p.id ? a.p.id + '|' + b.p.id : b.p.id + '|' + a.p.id; LM.pn[s].set(k, (LM.pn[s].get(k) || 0) + 1);
  for (const e of [a, b]) { const p = SC.pos.get(e); if (!p) continue; const q = LM.pp.get(e.p.id) || { x: 0, y: 0, n: 0, s, e }; q.x += p.x; q.y += p.y; q.n++; LM.pp.set(e.p.id, q); }
}
// draws the overlay into a 2D context; X/Y map pitch units to pixels
function bcDraw(LM, c, X, Y, W, H) {
  const O = LM.ovl13; if (!O) return; const M = LM.M, kits = (LM.vis && LM.vis.kits) || kitFor(M);
  if (O.kind === 'heat' && LM.th) {
    const a = LM.th[O.side]; let mx = 0; for (const v of a) mx = Math.max(mx, v); if (!mx) return;
    const cw = (X(1) - X(0)) / BC_HX, ch = (Y(1) - Y(0)) / BC_HY;
    for (let j = 0; j < BC_HY; j++) for (let i = 0; i < BC_HX; i++) { const v = a[j * BC_HX + i] / mx; if (v < .04) continue; const r = Math.round(255 * Math.min(1, v * 2)), g = Math.round(255 * Math.min(1, 2 - v * 2)) * .8; c.fillStyle = `rgba(${r},${g | 0},40,${(.18 + v * .5).toFixed(2)})`; c.fillRect(X(0) + i * cw, Y(0) + j * ch, cw + .5, ch + .5); }
  } else if (O.kind === 'pass' && LM.pn) {
    const pn = LM.pn[O.side]; let mx = 1; for (const v of pn.values()) mx = Math.max(mx, v); const col = kits[O.side].body;
    c.save(); c.lineCap = 'round';
    for (const [k, n] of pn) { const [i, j] = k.split('|'); const a = LM.pp.get(i), b = LM.pp.get(j); if (!a || !b || n < 2) continue; c.strokeStyle = 'rgba(255,255,255,' + (.25 + .6 * n / mx).toFixed(2) + ')'; c.lineWidth = 1 + 6 * n / mx; c.beginPath(); c.moveTo(X(a.x / a.n), Y(a.y / a.n)); c.lineTo(X(b.x / b.n), Y(b.y / b.n)); c.stroke(); }
    for (const [, q] of LM.pp) { if (q.s !== O.side) continue; const r = 5 + Math.min(12, q.n * .6) * (W / 600); c.fillStyle = col; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(X(q.x / q.n), Y(q.y / q.n), r, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.font = `bold ${Math.max(10, r)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(q.e.p.no || ''), X(q.x / q.n), Y(q.y / q.n) + .5); }
    c.restore();
  }
}
// ---------- hooks ----------
const _enterStep15 = enterStep;
enterStep = function (LM, SC, st) { if (SC.live && !LM.vis.rp && st.k === 'pass') { try { bcPass(LM, SC, st); } catch (e) { } } _enterStep15(LM, SC, st); if (st.k === 'pass' && st.to) SC.lastPassFrom = st.to; };
const _runScene15 = runScene;
runScene = function (LM, SC, dt) { const r = _runScene15(LM, SC, dt); if (SC.holder) SC.lastHold15 = SC.holder; try { if (SC.live && LM.run && dt > 0) { LM.bcS = (LM.bcS || 0) + dt; if (LM.bcS > 150) { LM.bcS = 0; bcSample(LM, SC); } } } catch (e) { } return r; };
const _mvDraw15 = mvDraw2d;
mvDraw2d = function (LM, SC, c, px, py, r) { try { if (LM.ovl13 && !(LM.v3 && LM.v3s)) bcDraw(LM, c, px, py, px(1) - px(0), py(1) - py(0)); } catch (e) { } _mvDraw15(LM, SC, c, px, py, r); };
// 3D: the overlay is a canvas texture lying on the grass
function bc3d(S3, LM) {
  const T3 = S3.T3; const O = LM.ovl13;
  if (!O) { if (S3.ovl15) S3.ovl15.visible = false; return; }
  if (!S3.ovl15) { const [cv, x] = cvs(768, 498); const tex = new T3.CanvasTexture(cv); const m = new T3.Mesh(new T3.PlaneGeometry(P3.L, P3.W), new T3.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = .06; m.renderOrder = 3; S3.scene.add(m); S3.ovl15 = m; S3.ovl15c = [cv, x, tex]; }
  const now = performance.now(); if (S3.ovlV !== LM.ovlV || now - (S3.ovlT || 0) > 2000) { S3.ovlV = LM.ovlV; S3.ovlT = now; const [cv, x, tex] = S3.ovl15c; x.clearRect(0, 0, cv.width, cv.height); bcDraw(LM, x, (u) => u * cv.width, (v) => v * cv.height, cv.width, cv.height); tex.needsUpdate = true; }
  S3.ovl15.visible = true;
}
// picture-in-picture replay in 3D: the live game keeps going on the big picture, the replay plays in a corner
const _startRp15 = startReplay;
startReplay = function (LM, idx) { _startRp15(LM, idx); try { if (LM.v3 && LM.v3s && LM.vis.rp && !LM.clip && UI.pip !== false) { LM.vis.rp.pip = true; LM.vis.live.rate = 1; LM.pipN = (LM.pipN || 0) + 1; } } catch (e) { } };
const _f3Bc = frame3d;
frame3d = function (LM, ts) {
  const V = LM.vis; const rp = V && V.rp && V.rp.pip ? V.rp : null;
  if (rp) V.rp = null; try { _f3Bc(LM, ts); } finally { if (rp) V.rp = rp; }
  try { if (LM.v3s) bc3d(LM.v3s, LM); bcPip(LM, rp); } catch (e) { }
};
function bcPip(LM, rp) {
  const w = document.getElementById('p2dwrap'); if (!w) return; let el = w.querySelector('.pip15');
  if (!rp) { if (el) el.classList.remove('on'); return; }
  if (!el) { w.insertAdjacentHTML('beforeend', '<div class="pip15"><canvas></canvas><span>REPLAY</span></div>'); el = w.querySelector('.pip15'); el.addEventListener('click', () => { try { endReplay(UI.match); } catch (e) { } }); }
  const cv = el.querySelector('canvas'), src = LM.vis.cv; if (!src || !src.width) return; const wd = Math.min(300, Math.round(w.clientWidth * .36)); const h = Math.round(wd * src.height / src.width);
  if (cv.width !== wd * 2) { cv.width = wd * 2; cv.height = h * 2; cv.style.width = wd + 'px'; cv.style.height = h + 'px'; }
  cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height); el.classList.add('on');
}
// the hidden 2D canvas keeps drawing the replay so the picture-in-picture has a picture
// ---------- ticker and lower-thirds ----------
function bcTicker(LM) {
  const w = document.getElementById('p2dwrap'); if (!w) return; const M = LM.M; const A = bcTeam(M, 0), B = bcTeam(M, 1);
  const hide = typeof momHide === 'function' && momHide(LM); const sc = hide ? M.score.map((x, i) => x - M.ev.filter(e => e.t === 'goal' && e.side === i && e.min === M.min).length) : M.score;
  const st = bcStats(M); const txt = `${A.short} ${sc[0]}–${sc[1]} ${B.short} · ${st.slice(0, 5).map(x => `${x.l.toUpperCase()} ${x.a}–${x.b}`).join(' · ')}`;
  let el = w.querySelector('.tick15'); if (!el) { w.insertAdjacentHTML('beforeend', '<div class="tick15" aria-hidden="true"><div></div></div>'); el = w.querySelector('.tick15'); }
  const d = el.firstElementChild; if (d.dataset.t !== txt) { d.dataset.t = txt; d.textContent = txt + '   ·   ' + txt; }
  w.classList.add('hasTick');
}
function bcLower(LM, kind, title, sub, col) {
  const w = document.getElementById('p2dwrap'); if (!w) return; let el = w.querySelector('.lt15'); if (!el) { w.insertAdjacentHTML('beforeend', '<div class="lt15"></div>'); el = w.querySelector('.lt15'); }
  el.innerHTML = `<i style="background:${col}"></i><div><b>${esc(title)}</b><span>${sub}</span></div>`; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 4200); LM.ltN = (LM.ltN || 0) + 1; LM.ltLast = title;
}
function bcWatch(LM) {
  const M = LM.M; LM.bcSeen = LM.bcSeen == null ? M.ev.length : LM.bcSeen;
  for (; LM.bcSeen < M.ev.length; LM.bcSeen++) { const e = M.ev[LM.bcSeen]; const tm = bcTeam(M, e.side);
    if (e.t === 'yc') bcLower(LM, 'yc', 'YELLOW CARD', `${esc(pnById(M, e.p))} · ${esc(tm.name)}`, '#ffd23f');
    else if (e.t === 'rc') bcLower(LM, 'rc', 'RED CARD', `${esc(pnById(M, e.p))} · ${esc(tm.name)}`, '#ff2b2b');
    else if (e.t === 'sub') bcLower(LM, 'sub', 'SUBSTITUTION · ' + tm.name.toUpperCase(), `<span style="color:#2fd36b">▲ ${esc(pnById(M, e.p))}</span> <span style="color:#ff6b6b">▼ ${esc(pnById(M, e.o))}</span>`, '#45e1f0'); }
  // half-time and full-time cards
  if (UI.bcAuto !== false && !LM.M.so) {
    if (M.ht && M.min === 45 && !LM.bcHT) { LM.bcHT = true; setTimeout(() => { if (UI.match === LM && !UI.lineupOn) bcShow(LM, 'ht', 0); }, 600); }
    if (M.done && !LM.bcFT) { LM.bcFT = true; setTimeout(() => { if (UI.match === LM) bcShow(LM, 'ft', 0); }, 900); }
  }
}
const _rm15 = renderMatch;
renderMatch = function () {
  const r = _rm15.apply(this, arguments);
  try {
    const LM = UI.match; if (!LM || !LM.vis) return r; bcWatch(LM); bcTicker(LM);
    const lu = document.querySelector('[data-a="luopen"]'); if (lu && !document.querySelector('[data-a="bcopen"]') && (LM.M.min >= 45 || LM.M.done)) lu.insertAdjacentHTML('afterend', '<button data-a="bcopen" title="Match stats card">Stats card</button>');
    const w = document.getElementById('p2dwrap'); if (w) { let ch = w.querySelector('.ovx15'); if (LM.ovl13) { const t = `${LM.ovl13.kind === 'heat' ? 'Heatmap' : 'Pass network'} · ${bcTeam(LM.M, LM.ovl13.side).short}`; if (!ch) { w.insertAdjacentHTML('beforeend', `<button class="ovx15" data-a="bcovx"></button>`); ch = w.querySelector('.ovx15'); } ch.textContent = t + ' ✕'; } else if (ch) ch.remove(); }
  } catch (e) { console.error(e); }
  return r;
};
// Game > Options
const _scrGameBC = scrGame;
scrGame = function () { return _scrGameBC() + `<div class="box pad" style="margin-top:10px"><b>Half-time and full-time graphics</b> <span class="dim" style="font-size:12.5px">Score, scorers, stats, top ratings and the Player of the Match (tap to move on; they also move on by themselves).</span> <button class="btn" data-a="bctog">${UI.bcAuto === false ? 'Off' : 'On'}</button></div>`; };
// ---------- the post-match interview at pitch side ----------
const BC_REPORTERS = ['Jess Morley', 'Tom Adeyemi', 'Priya Lal', 'Callum Reid', 'Ana Ferreira', 'Owen Pryce'];
const _ivModal15 = interviewModal;
interviewModal = function (M) {
  _ivModal15(M); try {
    const I = UI.iv; if (!I) return; const rep = BC_REPORTERS[hash(String(M.fid)) % BC_REPORTERS.length];
    const all = [['team', 'Praise the whole team'], ...(I.star ? [['star', `Single out ${surname(I.star.p.n)} (${I.star.rt.toFixed(1)})`]] : []), ...(I.lost && I.worst ? [['blame', `Criticise ${surname(I.worst.p.n)}`]] : []), ...(!I.won ? [['demand', 'Say the players must do better']] : []), ...(I.red || I.lost ? [['ref', 'Blame the referee']] : []), ['humble', 'Stay measured']];
    const pick = [all[0], all.find(x => x[0] !== 'team' && x[0] !== 'humble') || all[1], all[all.length - 1]].filter((x, i, a) => x && a.indexOf(x) === i).slice(0, 3);
    I.rep = rep; I.step = 1;
    UI.modal = `<div class="bcIv"><div class="bcIvH"><span class="bcLive">LIVE</span><b>${esc(rep)}</b><span class="dim">Pitch-side reporter · Matchday Live</span><span class="mono" style="margin-left:auto">1/2</span></div><div class="mc"><p style="font-size:16px">“${esc(I.q)}”</p><div style="display:grid;gap:5px">${pick.map(([k, l]) => `<button class="btn" style="text-align:left" data-a="iv1" data-v="${k}">${esc(l)}</button>`).join('')}</div></div></div>`;
  } catch (e) { console.error(e); }
};
function bcQ2(I) {
  let nx = null; try { nx = Object.values(G.fx).filter(f => (f.h === G.user || f.a === G.user) && !f.r && f.d > G.date).sort((a, b) => a.d - b.d)[0]; } catch (e) { }
  const opp = nx ? tName(nx.h === G.user ? nx.a : nx.h) : null;
  return { q: opp ? `Next up is ${opp}. What's the message to the supporters?` : `What's the message to the supporters?`, a: [['fans', 'Thank the fans: "They were incredible today."', 'fans'], ['ambition', 'Talk up the ambition: "We want to win something this season."', 'board'], ['focus', 'Keep the dressing room calm: "One game at a time."', 'mor']] };
}
ACT.iv1 = (v) => {
  const txt = interviewAnswer(v); const I = UI.iv; if (!I) { UI.modal = null; render(); return; } const Q = bcQ2(I); I.r1 = txt;
  UI.modal = `<div class="bcIv"><div class="bcIvH"><span class="bcLive">LIVE</span><b>${esc(I.rep || '')}</b><span class="dim">Pitch-side reporter · Matchday Live</span><span class="mono" style="margin-left:auto">2/2</span></div><div class="mc"><p class="dim" style="font-size:12.5px;margin-top:0">${esc(txt)}</p><p style="font-size:16px">“${esc(Q.q)}”</p><div style="display:grid;gap:5px">${Q.a.map(([k, l]) => `<button class="btn" style="text-align:left" data-a="iv2" data-v="${k}">${esc(l)}</button>`).join('')}</div></div></div>`; render();
};
ACT.iv2 = (v) => {
  const I = UI.iv || {}; let txt;
  if (v === 'fans') { G.fans = clamp((G.fans ?? 60) + 2, 0, 100); txt = 'The supporters loved that. Fan mood is up.'; }
  else if (v === 'ambition') { G.board = clamp((G.board ?? 60) + (I.lost ? -1 : 2), 0, 100); txt = I.lost ? 'Bold words after a defeat. The board raise an eyebrow.' : 'The board like the ambition.'; }
  else { for (const p of squad(G.user)) p.mor = clamp(p.mor + 1, 5, 100); txt = 'Calm and sensible. The players appreciate it.'; }
  UI.modal = null; UI.iv = null; autosave(); toast(txt); render();
};
