// lineup.js: a broadcast-style pre-match line-up graphic. Before kick-off it shows each team in turn: team name and
// formation, the starting XI on a pitch (shirts in club colours and kit pattern, number and surname), the substitutes,
// and a strip with the competition (its logo if you uploaded one on this device) and the round. Tap to move on.
// It can be opened again during the match from the Line-ups button. No real logos are shipped. Loaded after md3dz.js.

function shirtSvg(kit, pat, gk, gkCol) {
  const b = gk ? gkCol : kit.body, t = gk ? '#1b1b1b' : kit.trim; const id = 'sp' + Math.random().toString(36).slice(2, 8);
  let fill = `<rect width="60" height="60" fill="${b}"/>`;
  if (!gk) {
    if (pat === 'stripes') fill += [0, 1, 2, 3, 4].map(i => `<rect x="${i * 12 + 6}" width="6" height="60" fill="${t}"/>`).join('');
    else if (pat === 'hoops') fill += [0, 1, 2].map(i => `<rect y="${i * 18 + 14}" width="60" height="8" fill="${t}"/>`).join('');
    else if (pat === 'halves') fill += `<rect x="30" width="30" height="60" fill="${t}"/>`;
    else if (pat === 'sash') fill += `<polygon points="8,0 22,0 52,60 38,60" fill="${t}"/>`;
    else if (pat === 'band') fill += `<rect x="24" width="12" height="60" fill="${t}"/>`;
  }
  const sl = !gk && pat === 'sleeves' ? t : b;
  return `<svg viewBox="0 0 60 56" class="lushirt" aria-hidden="true"><defs><clipPath id="${id}"><path d="M18 4 L24 2 Q30 8 36 2 L42 4 L54 12 L49 24 L44 21 L44 54 L16 54 L16 21 L11 24 L6 12 Z"/></clipPath></defs>
  <g clip-path="url(#${id})">${fill}<path d="M6 12 L18 4 L16 21 L11 24 Z M54 12 L42 4 L44 21 L49 24 Z" fill="${sl}"/></g>
  <path d="M18 4 L24 2 Q30 8 36 2 L42 4 L54 12 L49 24 L44 21 L44 54 L16 54 L16 21 L11 24 L6 12 Z" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>
  <path d="M24 2 Q30 8 36 2" fill="none" stroke="${t}" stroke-width="2"/></svg>`;
}
function lineupHtml(LM, s) {
  const M = LM.M, V = LM.vis || {}; const S = M.sides[s]; const t = T(S.tid) || {}; const f = G.fx[M.fid] || {};
  const kits = V.kits || kitFor(M); const vs = V.kits ? sideOf(V, M, S.ps[0]) : s; const kit = kits[vs]; const gkc = gkColour(kits);
  const pat = kitPat(S.tid, kit); const xi = S.ps.filter(e => e.on || true).slice(0, 11);
  const no = (p, i) => p.no || (i + 1);
  const slots = xi.map((e, i) => {
    const x = 100 - e.x, y = 6 + (e.y / 90) * 84; const gk = e.role === 'GK';
    return `<div class="luP" style="left:${x}%;top:${y}%">${shirtSvg(kit, pat, gk, gkc)}<span class="luN">${no(e.p, i)}</span><span class="luT">${esc(surname(e.p.n || '').toUpperCase())}${S.capt && e.p.id === S.capt ? ' <b>(C)</b>' : ''}</span></div>`;
  }).join('');
  const subs = (S.bench || []).map((p, i) => `<div><span class="mono">${p.no || 12 + i}</span> ${esc(surname(p.n || '').toUpperCase())}</div>`).join('');
  const comp = COMP_NAME[M.comp] || ''; const rnd = typeof f.rnd === 'number' ? 'Matchweek ' + f.rnd : (f.rnd || '');
  const bdg = typeof BADGES === 'object' && BADGES[S.tid] ? `<img src="${BADGES[S.tid]}" alt="" class="luB">` : `<span class="luB luSw" style="background:linear-gradient(90deg,${t.c1} 0 50%,${t.c2} 50% 100%)"></span>`;
  const cl = typeof cLogo === 'function' ? cLogo(M.comp, 26) : '';
  return `<div class="luCard" style="--luA:${kit.body};--luB:${kit.trim}">
    <div class="luHead">${bdg}<span class="luName">${esc((t.name || S.tid).toUpperCase())}</span><span class="luForm">${esc(S.form || '')}</span></div>
    <div class="luBody"><div class="luSubs"><div class="luSubsH">SUBSTITUTES</div>${subs || '<div class="dim">—</div>'}<div class="luMgr">MANAGER<br><b>${esc(String((S.tid === G.user ? G.mgr : (t.mgr || '')) || '').toUpperCase())}</b></div></div>
    <div class="luPitch"><svg class="luLines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="1" y="1" width="98" height="98" fill="none"/><rect x="26" y="1" width="48" height="16" fill="none"/><rect x="38" y="1" width="24" height="6" fill="none"/><line x1="1" y1="99" x2="99" y2="99"/><path d="M36 99 A14 12 0 0 1 64 99" fill="none"/></svg>${slots}</div></div>
    <div class="luFoot"><span class="luComp">${cl}${esc(comp.toUpperCase())}</span><span class="luRnd">${esc(rnd)}${M.neutral ? '' : ' · ' + esc((venueOf(f) || {}).name || '')}</span></div>
    <div class="luHint">${s === 0 ? 'Tap for the away line-up' : 'Tap to close'} · <span class="mono">${s + 1}/2</span></div></div>`;
}
function lineupShow(LM, s) {
  let o = document.getElementById('luov'); if (!o) { o = document.createElement('div'); o.id = 'luov'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Team line-ups'); document.body.appendChild(o); o.addEventListener('click', (ev) => { if (ev.target.closest('[data-luclose]')) { lineupClose(); return; } const n = (+o.dataset.s || 0) + 1; if (n > 1) lineupClose(); else lineupShow(UI.match, n); }); }
  if (s === 0 && UI.lineupOn !== true) { UI.lineupOn = true; o.dataset.run = LM.run ? '1' : ''; LM.run = false; LM.hold = true; }
  clearTimeout(UI.luT); UI.luT = setTimeout(() => { if (UI.lineupOn && (+o.dataset.s || 0) === s) { if (s === 0) lineupShow(UI.match, 1); else lineupClose(); } }, 7000);
  o.dataset.s = s; o.innerHTML = `<button class="luX" data-luclose="1" aria-label="Close">×</button>${lineupHtml(LM, s)}`; o.className = 'on';
}
function lineupClose() {
  clearTimeout(UI.luT); const o = document.getElementById('luov'); if (!o) return; o.className = ''; o.innerHTML = ''; const LM = UI.match; UI.lineupOn = false;
  if (LM) { LM.hold = !!(LM.v3s && LM.v3s.flyHeld); if (o.dataset.run === '1' && !LM.hold) { LM.run = true; try { renderMatch(); schedule(); } catch (e) { } } else if (o.dataset.run === '1' && LM.v3s) LM.v3s.flyRun = true; }
}
ACT.luopen = () => { if (UI.match) lineupShow(UI.match, 0); };
const _rmLU = renderMatch;
renderMatch = function () {
  const r = _rmLU.apply(this, arguments);
  try {
    const LM = UI.match; if (!LM) return r;
    const mv = document.querySelector('[data-a="mview"]'); if (mv && !document.querySelector('[data-a="luopen"]')) mv.parentElement.insertAdjacentHTML('beforeend', '<button data-a="luopen" title="Team line-ups">Line-ups</button>');
    if (!LM.luShown && LM.M && LM.M.min === 0 && !LM.M.done && !(LM.vis && LM.vis.rp)) { LM.luShown = true; if (UI.lineupAuto !== false) setTimeout(() => { if (UI.match === LM) lineupShow(LM, 0); }, 50); }
  } catch (e) { console.error(e); }
  return r;
};
// the 3D fly-over and walk-out wait until the line-ups are closed
const _fly3dLU = fly3d;
fly3d = function (S3, LM, ts) { if (UI.lineupOn && !S3.fly) return null; return _fly3dLU(S3, LM, ts); };
// Game > Options: show the line-ups before every match (on by default)
try { const v = localStorage.getItem('gaffer.lineups'); if (v === '0') UI.lineupAuto = false; } catch (e) { }
ACT.lutog = () => { UI.lineupAuto = UI.lineupAuto === false; try { localStorage.setItem('gaffer.lineups', UI.lineupAuto === false ? '0' : '1'); } catch (e) { } render(); };
const _scrGameLU = scrGame;
scrGame = function () { return _scrGameLU() + `<div class="box pad" style="margin-top:10px"><b>Pre-match line-ups</b> <span class="dim" style="font-size:12.5px">Broadcast-style line-up graphic for both teams before kick-off (tap to move on; it also moves on by itself).</span> <button class="btn" data-a="lutog">${UI.lineupAuto === false ? 'Off' : 'On'}</button></div>`; };
