// occasion.js: Phase 16. The big occasions, kits and conditions.
// Trophy lift: after a won final (club or national team) or the game that clinches the league, the winners line up in
// front of a podium, medals are handed out down the line, the captain lifts a generic trophy (its shape depends on
// the competition type; no real trophy replicas or logos), confetti and fireworks, then the squad photo with the
// trophy — Photo mode (Phase 12) saves it. Kits: every club has home, away and third kits in its colours; the away
// side wears the first one that does not clash; the user's club can edit all three (colours and pattern), stored in the
// save. Conditions: late kick-offs go from sunset into floodlights during the match, fog limits the far view on some
// winter days, wind bends the flags and corner flags, puddles in heavy rain. Pitch side: ball boys, a mascot holding
// the home captain's hand at the walk-out, sprinklers before kick-off on summer days. Loaded after bcast.js.

// ---------- kits ----------
const KIT3_PAL = ['#0f6b5a', '#4a2a7a', '#e8b923', '#2b6fd6', '#c43d2b', '#1b1f2e', '#f2f2f2', '#ff7a1a', '#7ec8e3', '#8b1e3f'];
const KIT_PATN = ['plain', 'stripes', 'hoops', 'halves', 'sash', 'band', 'sleeves'];
function kitSet(tid) {
  const t = T(tid) || {}; const ed = (G.kitEd && G.kitEd[tid]) || {};
  const home = { body: t.c1 || '#8a8f99', trim: t.c2 || '#ffffff' };
  const away = colDist(home.trim, home.body) >= 120 && lum(home.trim) > .55 ? { body: home.trim, trim: home.body } : { body: lum(home.body) > .45 ? '#1b1f2e' : '#f2f2f2', trim: home.body };
  let best = KIT3_PAL[0], bd = -1; for (const c of KIT3_PAL) { const d = Math.min(colDist(c, home.body), colDist(c, away.body)); if (d > bd) { bd = d; best = c; } }
  const third = { body: best, trim: lum(best) > .5 ? '#1b1f2e' : '#ffffff' };
  const fix = (k, e, kind) => Object.assign({}, k, e && e.body ? { body: e.body } : {}, e && e.trim ? { trim: e.trim } : {}, e && e.pat ? { pat: e.pat } : {}, { kind });
  return { home: fix(home, ed.home, 'home'), away: fix(away, ed.away, 'away'), third: fix(third, ed.third, 'third') };
}
const _kitFor16 = kitFor;
kitFor = function (M) {
  try {
    const H = kitSet(M.sides[0].tid), A = kitSet(M.sides[1].tid); const hk = H.home;
    for (const k of [A.home, A.away, A.third]) if (colDist(hk.body, k.body) >= 120) return [hk, k];
    return [hk, [A.home, A.away, A.third].sort((a, b) => colDist(hk.body, b.body) - colDist(hk.body, a.body))[0]];
  } catch (e) { return _kitFor16(M); }
};
const _kitPat16 = kitPat;
kitPat = function (tid, kit) { if (kit && kit.pat) return kit.pat; if (kit && kit.kind && kit.kind !== 'home') return 'plain'; return _kitPat16(tid, kit); };
function kitEditorHtml(tid) {
  const K = kitSet(tid); const gk = '#e7d630';
  return `<div class="box pad" style="margin-top:10px" id="kitEd"><h2 class="sect" style="margin-top:0">Kits</h2><p class="dim" style="font-size:12.5px;margin-top:0">Home, away and third kits. The away team wears the first kit that does not clash. Changes are saved with this game.</p>
  <div class="kit16">${['home', 'away', 'third'].map(k => { const kt = K[k]; const pat = k === 'home' && !kt.pat ? kitPat(tid, kt) : (kt.pat || 'plain'); return `<div class="kit16c"><b>${k[0].toUpperCase() + k.slice(1)}</b><div class="kit16s">${shirtSvg(kt, pat, false, gk)}</div>
    <label>Main <input type="color" data-kit="${k}" data-f="body" value="${kt.body}"></label><label>Second <input type="color" data-kit="${k}" data-f="trim" value="${kt.trim}"></label>
    <label>Pattern <select data-kit="${k}" data-f="pat">${KIT_PATN.map(p => `<option value="${p}"${p === pat ? ' selected' : ''}>${p === 'sleeves' ? 'Contrast sleeves' : p[0].toUpperCase() + p.slice(1)}</option>`).join('')}</select></label></div>`; }).join('')}</div>
  <div class="row" style="margin-top:6px"><button class="btn" data-a="kitreset">Back to club colours</button></div></div>`;
}
document.addEventListener('change', (ev) => {
  const el = ev.target; if (!el || !el.dataset || !el.dataset.kit || !G || !G.user) return;
  G.kitEd = G.kitEd || {}; const E = G.kitEd[G.user] = G.kitEd[G.user] || {}; const k = el.dataset.kit; E[k] = E[k] || {}; E[k][el.dataset.f] = el.value;
  try { autosave(); } catch (e) { } render();
});
ACT.kitreset = () => { if (G.kitEd) delete G.kitEd[G.user]; try { autosave(); } catch (e) { } render(); };
const _scrClub16 = scrClub;
scrClub = function () { const h = _scrClub16(); try { if ((UI.tab.club || 'ov') === 'ov' && G.user && T(G.user)) return h + kitEditorHtml(G.user); } catch (e) { console.error(e); } return h; };
// ---------- trophy lift ----------
function trophyKind(M) { const f = G.fx[M.fid] || {}; if (isNatT(M.sides[0].tid) || isNatT(M.sides[1].tid)) return 'intl'; if (/^(UCL|UEL|UECL)$/.test(M.comp)) return 'euro'; if (!f.rnd) return 'league'; return 'cup'; }
function trophyCheck(LM) {
  const M = LM.M; if (!M.done || LM.trophyChecked) return; LM.trophyChecked = true;
  const f = G.fx[M.fid] || {}; const [a, b] = M.score; const pw = M.pens ? (M.pens[0] > M.pens[1] ? 0 : 1) : null; const win = a > b ? 0 : b > a ? 1 : pw;
  let side = null; if (f.rnd === 'Final' && win != null) side = win; else if (typeof titleClinch3d === 'function') { const c = titleClinch3d(LM); if (c != null && ((c === 0 && a >= b) || (c === 1 && b >= a))) side = c; }
  if (side == null) return; LM.trophy = { side, kind: trophyKind(M), t0: performance.now(), name: f.rnd === 'Final' ? (COMP_NAME[M.comp] || 'Cup') : (COMP_NAME[M.comp] || 'League') + ' champions' };
  trophyBanner(LM);
}
function trophyBanner(LM) {
  const w = document.getElementById('p2dwrap'); if (!w || !LM.trophy) return; let el = w.querySelector('.tr16'); if (!el) { w.insertAdjacentHTML('beforeend', '<div class="tr16"></div>'); el = w.querySelector('.tr16'); }
  const S = LM.M.sides[LM.trophy.side]; const k = (LM.vis && LM.vis.kits) ? LM.vis.kits[LM.trophy.side] : { body: '#ffd23f' };
  el.innerHTML = `${trophySvg(LM.trophy.kind)}<div><span>${esc(String(LM.trophy.name).toUpperCase())}</span><b style="border-bottom:3px solid ${k.body}">${esc((S.name || '').toUpperCase())}</b><i>${LM.trophy.kind === 'league' ? 'CHAMPIONS' : 'WINNERS'}</i></div>`; el.classList.add('on'); if (!LM.trophyBT) LM.trophyBT = setTimeout(() => { try { el.classList.remove('on'); LM.trophyHide = true; } catch (e) { } }, 7000);
}
function trophySvg(kind) {
  const g = '#e9c46a', d = '#b8892e';
  if (kind === 'league') return `<svg viewBox="0 0 60 80" width="46" height="62" aria-hidden="true"><rect x="16" y="66" width="28" height="10" fill="${d}"/><rect x="22" y="58" width="16" height="9" fill="${g}"/><path d="M14 12 h32 v8 q0 22 -16 30 q-16 -8 -16 -30z" fill="${g}"/><ellipse cx="30" cy="10" rx="17" ry="5" fill="${d}"/><circle cx="30" cy="4" r="4" fill="${g}"/></svg>`;
  if (kind === 'intl') return `<svg viewBox="0 0 60 80" width="46" height="62" aria-hidden="true"><rect x="18" y="66" width="24" height="10" fill="#2f7d36"/><path d="M24 66 q-6 -20 2 -36 h8 q8 16 2 36z" fill="${g}"/><circle cx="30" cy="22" r="14" fill="${g}" stroke="${d}" stroke-width="2"/><path d="M18 22 h24 M30 8 v28" stroke="${d}" stroke-width="1.5"/></svg>`;
  if (kind === 'euro') return `<svg viewBox="0 0 70 80" width="52" height="62" aria-hidden="true"><rect x="22" y="66" width="26" height="10" fill="${d}"/><path d="M26 66 l3 -12 h12 l3 12z" fill="${g}"/><path d="M20 10 h30 q0 34 -15 44 q-15 -10 -15 -44z" fill="${g}"/><path d="M20 14 q-18 4 -14 24 q4 14 16 10" stroke="${g}" stroke-width="5" fill="none"/><path d="M50 14 q18 4 14 24 q-4 14 -16 10" stroke="${g}" stroke-width="5" fill="none"/></svg>`;
  return `<svg viewBox="0 0 70 80" width="52" height="62" aria-hidden="true"><rect x="22" y="66" width="26" height="10" fill="${d}"/><rect x="29" y="54" width="12" height="13" fill="${g}"/><path d="M18 14 h34 q0 30 -17 40 q-17 -10 -17 -40z" fill="${g}"/><path d="M18 18 q-12 2 -10 14 q2 8 12 8" stroke="${g}" stroke-width="4" fill="none"/><path d="M52 18 q12 2 10 14 q-2 8 -12 8" stroke="${g}" stroke-width="4" fill="none"/></svg>`;
}
function trophyMesh(T3, kind) {
  const g = new T3.Group(); const m = new T3.MeshPhongMaterial({ color: '#f2cf6b', emissive: '#4a3208', specular: '#fff2c0', shininess: 90 }); // gold that reads without an environment map
  const dk = new T3.MeshLambertMaterial({ color: kind === 'intl' ? '#2f7d36' : '#5a3d12' });
  const base = new T3.Mesh(new T3.CylinderGeometry(.16, .2, .16, 12), dk); base.position.y = .08; g.add(base);
  if (kind === 'intl') { const st = new T3.Mesh(new T3.CylinderGeometry(.06, .11, .32, 10), m); st.position.y = .32; g.add(st); const gl = new T3.Mesh(new T3.SphereGeometry(.17, 14, 10), m); gl.position.y = .62; g.add(gl); }
  else if (kind === 'league') { const st = new T3.Mesh(new T3.CylinderGeometry(.05, .08, .16, 10), m); st.position.y = .24; g.add(st); const cup = new T3.Mesh(new T3.CylinderGeometry(.2, .07, .36, 14), m); cup.position.y = .5; g.add(cup); const lid = new T3.Mesh(new T3.SphereGeometry(.2, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), m); lid.position.y = .68; g.add(lid); const k = new T3.Mesh(new T3.SphereGeometry(.05, 8, 6), m); k.position.y = .9; g.add(k); }
  else { const st = new T3.Mesh(new T3.CylinderGeometry(.05, .09, .2, 10), m); st.position.y = .26; g.add(st); const cup = new T3.Mesh(new T3.CylinderGeometry(.22, .08, .38, 14, 1, true), m); cup.position.y = .55; g.add(cup);
    const ear = kind === 'euro' ? .2 : .13; for (const sx of [-1, 1]) { const h = new T3.Mesh(new T3.TorusGeometry(ear, .025, 6, 14, Math.PI * 1.3), m); h.position.set(sx * (.22 + ear * .5), .55, 0); h.rotation.z = sx > 0 ? -Math.PI * .65 : Math.PI * .35; g.add(h); } }
  return g;
}
function trophyStage(S3, LM, e, f, ts) {
  const Tr = LM.trophy; if (!Tr) return null; const age = (performance.now() - Tr.t0) / 1000; if (age < 9) return null; // handshakes first
  const M = LM.M, V = LM.vis; const vs = sideOf(V, M, e); const ord = ceremonyOrder(S3, M); const s = M.sides.findIndex(x => x.ps.includes(e)); const i = ord[s] ? ord[s].indexOf(e) : -1; if (i < 0) return null;
  const z0 = -4; // just in front of the halfway line, facing the main stand and the TV camera
  if (s !== Tr.side) { const x = -9 + i * 1.8; return { w: { x, z: z0 + 14 }, face: -Math.PI / 2, pose: { legs: [0, 0], arms: [[-.6 - Math.abs(Math.sin(ts / 140 + i)) * .3, .9], [.6 + Math.abs(Math.sin(ts / 140 + i)) * .3, .9]] } }; } // the losers applaud
  const capt = trophyCapt(S3, LM); const n = ord[s].length; const t = age - 9;
  if (t < 9) { // line up and get the medals one by one
    const x = -((n - 1) / 2) * 1.5 + i * 1.5; const got = t > 2 + i * .55; if (got) trophyMedal(S3, f);
    return { w: { x, z: z0 }, face: -Math.PI / 2, pose: { legs: [0, 0], arms: [[0, .15], [0, .15]] } };
  }
  if (t < 20) { // the lift: captain on the podium, everyone jumping behind him
    if (e === capt) return { w: { x: 0, z: z0 - 2.4 }, face: Math.PI / 2, pose: { legs: [0, 0], arms: [[-2.75, .1], [2.75, .1]], lift: .55 + (t > 10.5 ? Math.abs(Math.sin(ts / 260)) * .12 : 0) } };
    const k = i - (ord[s].indexOf(capt) < i ? 1 : 0); const row = k % 2, col = k >> 1; const x = -6 + col * 2.2 + row * 1.1;
    return { w: { x, z: z0 + row * 1.4 }, face: Math.PI / 2, pose: { legs: [.2, -.2], arms: [[-2.5, .3], [2.5, .3]], lift: t > 10.5 ? Math.abs(Math.sin(ts / 170 + i)) * .5 : 0 } };
  }
  // the squad photo with the trophy
  if (e === capt) return { w: { x: 0, z: z0 - 1.2 }, face: Math.PI / 2, pose: { legs: [-1.3, -1.3], arms: [[-1.1, .5], [1.1, .5]], lean: .25, lift: -.42 } };
  const k = i - (ord[s].indexOf(capt) < i ? 1 : 0); const back = k < 6; const col = back ? k : k - 6; const x = -((back ? 5 : 3.5) / 2) * 1.3 + col * 1.3 + (back ? 0 : -.2);
  return { w: { x: x + (back ? 0 : (col >= 2 ? 1.3 : 0)), z: back ? z0 : z0 - 1.2 }, face: Math.PI / 2, pose: back ? { legs: [0, 0], arms: [[-2.6, .2], [2.6, .2]] } : { legs: [-1.3, -1.3], arms: [[-.2, .6], [.2, .6]], lean: .25, lift: -.42 } };
}
function trophyCapt(S3, LM) { if (LM.trophyCapt) return LM.trophyCapt; const M = LM.M, S = M.sides[LM.trophy.side]; const ord = ceremonyOrder(S3, M)[LM.trophy.side] || []; LM.trophyCapt = ord.find(e => S.capt && e.p.id === S.capt) || ord.slice().sort((a, b) => (b.p.ca || 0) - (a.p.ca || 0))[0]; return LM.trophyCapt; }
function trophyMedal(S3, f) { if (f.medal) return; const T3 = S3.T3; const m = new T3.Mesh(new T3.CircleGeometry(.09, 12), new T3.MeshBasicMaterial({ color: '#e9c46a', side: T3.DoubleSide })); m.position.set(.2, 1.55, 0); m.rotation.y = Math.PI / 2; f.g.add(m); f.medal = m; }
const _cer16 = cer3d;
cer3d = function (S3, LM, e, f, ts) {
  try { if (LM.M.done) { trophyCheck(LM); const r = trophyStage(S3, LM, e, f, ts); if (r) return r; } } catch (er) { console.error(er); }
  const r = _cer16(S3, LM, e, f, ts);
  try { if (r && r.w && S3.fly && !S3.flyDone && !S3.mascT) { const ord = ceremonyOrder(S3, LM.M); const capt = ord[0] && (ord[0].find(x => LM.M.sides[0].capt && x.p.id === LM.M.sides[0].capt) || ord[0][1]); if (e === capt) S3.mascW = { x: r.w.x - .8, z: r.w.z, face: r.face, hide: r.hide }; } } catch (er) { }
  return r;
};
// ---------- conditions and pitch side, every 3D frame ----------
function occ3d(S3, LM, SC, ts, dt) {
  const T3 = S3.T3, V = LM.vis, M = LM.M, meta = V.meta || {}; const now = performance.now();
  if (!S3.oc16) {
    const O = S3.oc16 = {}; const f = G.fx[M.fid] || {}; const h = hash(String(M.fid) + 'wx16'); const mo = +String(f.d || G.date || '2026-08-01').slice(5, 7);
    O.wind = Math.min(1, ((h % 100) / 100) * .8 + (meta.wx === 'rain' ? .3 : 0) + (meta.wx === 'snow' ? .1 : 0));
    O.dusk = !meta.night && +String(meta.ko || '15:00').slice(0, 2) >= 16 && meta.wx !== 'rain' && meta.wx !== 'snow';
    O.fog = meta.wx === 'fog' || (meta.wx === 'cloud' && (mo >= 11 || mo <= 2) && h % 4 === 0);
    O.puddles = meta.wx === 'rain' && (h >> 3) % 3 !== 0;
    O.summer = mo >= 5 && mo <= 9 && !meta.night && meta.wx !== 'rain' && (meta.temp == null || meta.temp >= 15);
    Object.assign(O, S3.oc16force || {}); // test hook
    if (O.fog && S3.scene.fog) { S3.scene.fog.near = 25; S3.scene.fog.far = 115; const c = new T3.Color('#a9b2bb'); try { if (S3.ren.outputEncoding === T3.sRGBEncoding) c.convertSRGBToLinear(); } catch (e) { } S3.scene.fog.color = c; S3.scene.background = c.clone(); }
    // flags to blow in the wind: stand flags and corner flags
    O.flags = []; S3.scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry') { const p = o.geometry.parameters; if ((p.width === 2.2 && p.height === 1.3) || (p.width === .45 && p.height === .3)) O.flags.push({ o, ry: o.rotation.y, sx: o.scale.x, ph: Math.random() * 6 }); } });
    // puddles
    if (O.puddles) { const mat = new T3.MeshPhongMaterial({ color: '#3b4a52', shininess: 120, specular: '#9fb3c0', transparent: true, opacity: .55, depthWrite: false }); O.pud = []; for (let i = 0; i < 7; i++) { const r = hash('pd' + i + M.fid); const m = new T3.Mesh(new T3.CircleGeometry(1, 20), mat); m.rotation.x = -Math.PI / 2; m.scale.set(1.2 + (r % 30) / 10, 0.8 + ((r >> 5) % 20) / 10, 1); m.position.set(((r % 1000) / 1000 - .5) * P3.L * .8, .035, (((r >> 10) % 1000) / 1000 - .5) * P3.W * .7); S3.scene.add(m); O.pud.push(m); } }
    // ball boys in tracksuits, a mascot, sprinklers
    O.bb = []; const bbKit = { body: '#2b3a55', trim: '#ffd23f' };
    for (const [x, z, r] of [[P3.L / 2 + 2.2, -12, -Math.PI / 2], [P3.L / 2 + 2.2, 12, -Math.PI / 2], [-P3.L / 2 - 2.2, -12, Math.PI / 2], [-P3.L / 2 - 2.2, 12, Math.PI / 2], [-26, P3.W / 2 + 1.8, Math.PI], [26, P3.W / 2 + 1.8, Math.PI]].slice(0, S3.lo ? 4 : 6)) {
      const g = figure(T3, bbKit, false, null, 0, { look: lookOf({ id: 'bb' + x + z }), lo: true }); g.scale.setScalar(.72); g.position.set(x, 0, z); g.rotation.y = r; S3.scene.add(g); O.bb.push({ g, r });
      const ball = new T3.Mesh(new T3.SphereGeometry(.11, 8, 6), new T3.MeshLambertMaterial({ color: '#ffffff' })); ball.position.set(.25, 1.0, 0); g.add(ball); }
    const hk = V.kits[0]; O.masc = figure(T3, hk, false, null, 0, { look: lookOf({ id: 'mascot' + M.fid }), lo: true }); O.masc.scale.setScalar(.6); O.masc.visible = false; S3.scene.add(O.masc);
    if (O.summer) { const n = S3.lo ? 240 : 720; const pos = new Float32Array(n * 3); const geo = new T3.BufferGeometry(); geo.setAttribute('position', new T3.BufferAttribute(pos, 3)); O.spr = new T3.Points(geo, new T3.PointsMaterial({ color: '#dff3ff', size: .22, transparent: true, opacity: .75, depthWrite: false })); O.spr.visible = false; O.sprN = n; S3.scene.add(O.spr); }
  }
  const O = S3.oc16;
  // wind
  const w = O.wind; if (w > .05) for (const fl of O.flags) { const a = Math.sin(ts / (420 - w * 200) + fl.ph) * (.15 + w * .45); fl.o.rotation.y = fl.ry + a; fl.o.scale.x = fl.sx * (1 - w * .18 + Math.sin(ts / 160 + fl.ph) * w * .06); }
  // sunset into floodlights over the match
  if (O.dusk && S3.sun) { const q = clamp((M.min || 0) / 90, 0, 1); if (O.q == null || Math.abs(q - O.q) > .01) { O.q = q; if (!O.c0) O.c0 = { sky: S3.scene.background.clone(), si: S3.sun.intensity, hi: S3.hemi ? S3.hemi.intensity : 1 };
      const dusk = new T3.Color('#f08a4b'), nite = new T3.Color('#0b1430'); const c = q < .5 ? O.c0.sky.clone().lerp(dusk, q * 2) : dusk.clone().lerp(nite, (q - .5) * 2); try { if (S3.ren.outputEncoding === T3.sRGBEncoding && q > 0) { /* colours above are display colours */ } } catch (e) { }
      S3.scene.background = c; if (S3.scene.fog) S3.scene.fog.color = c; S3.sun.intensity = O.c0.si * (1 - q * .75); if (S3.hemi) S3.hemi.intensity = O.c0.hi * (1 - q * .45);
      S3.scene.traverse(o => { if (o.isSprite && o.userData && o.userData.glow && !S3.noGlow) o.material.opacity = Math.max(o.material.opacity, .35 + q * .65); }); S3.dusk = q; } }
  // ball boys look at the ball
  if (SC && SC.ball) for (const b of O.bb) { const bw = W3(SC.ball); b.g.rotation.y = b.r + Math.sin(ts / 2400 + b.g.position.x) * .25 + clamp(Math.atan2(-(bw.z - b.g.position.z), bw.x - b.g.position.x) - b.r, -.6, .6) * .4; }
  // the mascot walks out holding the home captain's hand
  const flying = S3.fly && !S3.flyDone; if (flying && S3.mascW && !S3.mascW.hide) { O.masc.visible = true; O.masc.position.set(S3.mascW.x, 0, S3.mascW.z); O.masc.rotation.y = S3.mascW.face || 0; const a = armOf({ g: O.masc }, 1); if (a) { a.rotation.z = .5; } } else O.masc.visible = false; S3.mascW = null;
  // sprinklers before kick-off on a summer day
  if (O.spr) { const on = flying && (!S3.fly || (ts - S3.fly) < (S3.flyLen || 6500) * .45); O.spr.visible = on; if (on) { const arr = O.spr.geometry.attributes.position.array; const src = [[-30, -18], [-30, 18], [0, -18], [0, 18], [30, -18], [30, 18]];
    for (let i = 0; i < O.sprN; i++) { const j = i % 6; const [sx, sz] = src[j]; const t = ((ts / 1100) + i * .137) % 1; const ang = ts / 1600 + j * 1.1 + (i % 7) * .04; const R = 9 * t; arr[i * 3] = sx + Math.cos(ang) * R; arr[i * 3 + 1] = .2 + Math.sin(Math.PI * t) * 2.2; arr[i * 3 + 2] = sz + Math.sin(ang) * R; } O.spr.geometry.attributes.position.needsUpdate = true; } }
  // trophy: on the podium, then in the captain's hands; fireworks over the stands
  const Tr = LM.trophy; if (Tr) { const age = (now - Tr.t0) / 1000;
    if (!O.tro && age > 9) { O.tro = trophyMesh(T3, Tr.kind); O.tro.scale.setScalar(1.4); S3.scene.add(O.tro); const k = V.kits[Tr.side]; O.pod = new T3.Group(); const pb = new T3.Mesh(new T3.BoxGeometry(6, .5, 2.4), new T3.MeshLambertMaterial({ color: '#1b1f2e' })); pb.position.y = .25; O.pod.add(pb); const band = new T3.Mesh(new T3.BoxGeometry(6.02, .2, 2.42), new T3.MeshLambertMaterial({ color: k.body })); band.position.y = .42; O.pod.add(band); O.pod.position.set(0, 0, -6.4); S3.scene.add(O.pod); try { if (!S3.conf) confetti3d(S3, Tr.side); } catch (e) { } }
    if (O.tro) { const t = age - 9; const capt = trophyCapt(S3, LM); const cf = capt && S3.figs.get(capt);
      if (t < 10.5 || !cf) { O.tro.position.set(1.8, .5, -6.4); O.tro.rotation.set(0, 0, 0); }
      else if (t < 20) { O.tro.position.set(cf.g.position.x, cf.g.position.y + 2.35 + Math.abs(Math.sin(ts / 260)) * .12, cf.g.position.z); }
      else { O.tro.position.set(cf.g.position.x, cf.g.position.y + 1.25, cf.g.position.z - .45); }
      if (t > 10.5 && (!O.fwT || ts - O.fwT > 650)) { O.fwT = ts; occFirework(S3, V.kits[Tr.side]); }
      // the camera looks at the ceremony
      if (SC) { SC.ball = { x: .5, y: z2y(-5), h: 0 }; SC.holder = null; } if (S3.ball) S3.ball.visible = false; }
    occFireworks(S3, dt); }
}
function z2y(z) { return z / P3.W + .5; }
function occFirework(S3, kit) {
  const T3 = S3.T3; S3.fw16 = S3.fw16 || []; if (S3.fw16.length > 8) { const o = S3.fw16.shift(); S3.scene.remove(o.p); }
  const n = S3.lo ? 60 : 140; const pos = new Float32Array(n * 3), vel = []; const cx = (Math.random() - .5) * P3.L, cy = 28 + Math.random() * 14, cz = (Math.random() < .5 ? -1 : 1) * (P3.W / 2 + 20 + Math.random() * 10);
  for (let i = 0; i < n; i++) { pos[i * 3] = cx; pos[i * 3 + 1] = cy; pos[i * 3 + 2] = cz; const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = 9 + Math.random() * 5; vel.push([Math.sqrt(1 - u * u) * Math.cos(th) * s, u * s, Math.sqrt(1 - u * u) * Math.sin(th) * s]); }
  const geo = new T3.BufferGeometry(); geo.setAttribute('position', new T3.BufferAttribute(pos, 3));
  const col = Math.random() < .5 ? kit.body : (Math.random() < .5 ? kit.trim : '#ffd23f');
  const p = new T3.Points(geo, new T3.PointsMaterial({ color: col, size: 1.1, transparent: true, opacity: 1, depthWrite: false, blending: T3.AdditiveBlending })); S3.scene.add(p); S3.fw16.push({ p, vel, age: 0 });
}
function occFireworks(S3, dt) {
  if (!S3.fw16) return; const s = dt / 1000;
  for (const f of S3.fw16) { f.age += s; const a = f.p.geometry.attributes.position.array; for (let i = 0; i < f.vel.length; i++) { const v = f.vel[i]; v[1] -= 6 * s; a[i * 3] += v[0] * s; a[i * 3 + 1] += v[1] * s; a[i * 3 + 2] += v[2] * s; v[0] *= .985; v[2] *= .985; } f.p.geometry.attributes.position.needsUpdate = true; f.p.material.opacity = Math.max(0, 1 - f.age / 2.2); f.p.visible = f.age < 2.3; }
}
const _cast16 = cast3d;
cast3d = function (S3, LM, SC, bw, ts, dt) { _cast16(S3, LM, SC, bw, ts, dt); try { occ3d(S3, LM, SC, ts, dt); } catch (er) { console.error(er); } };
// 2D: the banner after a trophy
const _rm16 = renderMatch;
renderMatch = function () { const r = _rm16.apply(this, arguments); try { const LM = UI.match; if (LM && LM.M.done) { trophyCheck(LM); if (LM.trophy && !LM.trophyHide) trophyBanner(LM); } } catch (e) { console.error(e); } return r; };
