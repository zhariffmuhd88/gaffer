// md3d.js: 3D matchday view, stage 1. A third option next to "2D pitch" and "Text only". It draws the same live
// scene as the 2D view (positions, ball, replays) with three.js, loaded from cdnjs only when 3D is chosen, and
// falls back to 2D if it cannot load. The match engine and the 2D plan are unchanged.
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
let _threeP = null;
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (_threeP) return _threeP;
  _threeP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = THREE_URL; s.async = true; s.onload = () => window.THREE ? res(window.THREE) : rej(new Error('three.js missing')); s.onerror = () => { _threeP = null; rej(new Error('three.js did not load')); }; document.head.appendChild(s); });
  return _threeP;
}
const P3 = { L: 105, W: 68 }; // pitch metres
function pitchTex(T3) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 664; const g = c.getContext('2d');
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#2f7d36' : '#358a3c'; g.fillRect(i * 64, 0, 64, 664); }
  const sx = 1024 / P3.L, sy = 664 / P3.W, X = (m) => m * sx, Y = (m) => m * sy;
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3;
  g.strokeRect(X(0) + 2, Y(0) + 2, X(P3.L) - 4, Y(P3.W) - 4);
  g.beginPath(); g.moveTo(X(P3.L / 2), 0); g.lineTo(X(P3.L / 2), Y(P3.W)); g.stroke();
  g.beginPath(); g.ellipse(X(P3.L / 2), Y(P3.W / 2), X(9.15), Y(9.15), 0, 0, 7); g.stroke();
  for (const side of [0, 1]) {
    const x0 = side ? P3.L : 0, d = side ? -1 : 1;
    g.strokeRect(Math.min(X(x0), X(x0 + d * 16.5)), Y(P3.W / 2 - 20.16), X(16.5), Y(40.32));
    g.strokeRect(Math.min(X(x0), X(x0 + d * 5.5)), Y(P3.W / 2 - 9.16), X(5.5), Y(18.32));
    g.beginPath(); g.arc(X(x0 + d * 11), Y(P3.W / 2), 4, 0, 7); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.ellipse(X(x0 + d * 11), Y(P3.W / 2), X(9.15), Y(9.15), 0, side ? Math.PI - .93 : -.93, side ? Math.PI + .93 : .93); g.stroke();
  }
  const t = new T3.CanvasTexture(c); t.anisotropy = 4; return t;
}
function crowdTex(T3, c1, c2) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#1c1f2b'; g.fillRect(0, 0, 256, 64);
  const cols = [c1, c2, '#d9d9d9', '#555b6e', c1, '#2a2f40'];
  for (let i = 0; i < 1400; i++) { g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(Math.random() * 256, Math.random() * 64, 2, 2); }
  const t = new T3.CanvasTexture(c); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(6, 3); return t;
}
function build3d(LM, T3) {
  const V = LM.vis, M = LM.M; const kits = V.kits; const home = T(M.sides[0].tid);
  const scene = new T3.Scene(); scene.background = new T3.Color('#0b0e1a'); scene.fog = new T3.Fog('#0b0e1a', 140, 260);
  const cam = new T3.PerspectiveCamera(32, 16 / 9, .5, 600);
  const ren = new T3.WebGLRenderer({ antialias: true }); ren.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); ren.shadowMap.enabled = true;
  ren.domElement.className = 'p3d'; ren.domElement.setAttribute('role', 'img'); ren.domElement.setAttribute('aria-label', 'Live 3D match view');
  scene.add(new T3.HemisphereLight('#dfe8ff', '#20301f', .75));
  const sun = new T3.DirectionalLight('#ffffff', .8); sun.position.set(-40, 90, 50); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50, near: 10, far: 220 }); if (sun.shadow.camera.updateProjectionMatrix) sun.shadow.camera.updateProjectionMatrix(); scene.add(sun);
  // grass around and the pitch
  const turf = new T3.Mesh(new T3.PlaneGeometry(P3.L + 24, P3.W + 20), new T3.MeshLambertMaterial({ color: '#2b6f31' })); turf.rotation.x = -Math.PI / 2; turf.position.y = -.02; turf.receiveShadow = true; scene.add(turf);
  const pitch = new T3.Mesh(new T3.PlaneGeometry(P3.L, P3.W), new T3.MeshLambertMaterial({ map: pitchTex(T3) })); pitch.rotation.x = -Math.PI / 2; pitch.receiveShadow = true; scene.add(pitch);
  // goals
  const postM = new T3.MeshLambertMaterial({ color: '#ffffff' }); const netM = new T3.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .18, side: T3.DoubleSide, wireframe: true });
  for (const s of [-1, 1]) {
    const gx = s * P3.L / 2, g = new T3.Group();
    for (const z of [-3.66, 3.66]) { const p = new T3.Mesh(new T3.CylinderGeometry(.08, .08, 2.44, 8), postM); p.position.set(gx, 1.22, z); g.add(p); }
    const bar = new T3.Mesh(new T3.CylinderGeometry(.08, .08, 7.32, 8), postM); bar.rotation.x = Math.PI / 2; bar.position.set(gx, 2.44, 0); g.add(bar);
    const net = new T3.Mesh(new T3.BoxGeometry(2, 2.44, 7.32, 4, 4, 8), netM); net.position.set(gx + s * 1, 1.22, 0); g.add(net);
    scene.add(g);
  }
  // stands on four sides
  const standM = [crowdTex(T3, kits[0].body, kits[0].trim), crowdTex(T3, kits[1].body, kits[1].trim)];
  const stand = (w, d, h, x, z, ry, tex) => { const m = new T3.Mesh(new T3.BoxGeometry(w, h, d), [new T3.MeshLambertMaterial({ color: '#23283a' }), new T3.MeshLambertMaterial({ color: '#23283a' }), new T3.MeshLambertMaterial({ color: '#2d3346' }), new T3.MeshLambertMaterial({ color: '#23283a' }), new T3.MeshLambertMaterial({ map: tex }), new T3.MeshLambertMaterial({ color: '#23283a' })]); m.position.set(x, h / 2, z); m.rotation.y = ry; scene.add(m); };
  stand(P3.L + 30, 14, 16, 0, -(P3.W / 2 + 16), 0, standM[0]);
  stand(P3.L + 30, 14, 12, 0, P3.W / 2 + 16, Math.PI, standM[0]);
  stand(P3.W + 20, 14, 12, -(P3.L / 2 + 18), 0, Math.PI / 2, standM[0]);
  stand(P3.W + 20, 14, 12, P3.L / 2 + 18, 0, -Math.PI / 2, standM[1]);
  // advertising boards
  const adM = new T3.MeshBasicMaterial({ color: home.c1 || '#c8102e' });
  for (const z of [-(P3.W / 2 + 3), P3.W / 2 + 3]) { const b = new T3.Mesh(new T3.BoxGeometry(P3.L, .9, .1), adM); b.position.set(0, .45, z); scene.add(b); }
  // ball
  const ball = new T3.Mesh(new T3.SphereGeometry(.42, 16, 12), new T3.MeshLambertMaterial({ color: '#ffffff' })); ball.castShadow = true; scene.add(ball);
  const bsh = new T3.Mesh(new T3.CircleGeometry(.5, 16), new T3.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .3 })); bsh.rotation.x = -Math.PI / 2; bsh.position.y = .02; scene.add(bsh);
  return { scene, cam, ren, ball, bsh, figs: new Map(), camPos: null, look: null, mode: 'tv' };
}
function figure(T3, kit, gk) {
  const g = new T3.Group();
  const shirt = new T3.MeshLambertMaterial({ color: gk ? (lum(kit.body) > .5 ? '#1f8a3a' : '#e7d630') : kit.body });
  const trim = new T3.MeshLambertMaterial({ color: kit.trim }); const skin = new T3.MeshLambertMaterial({ color: '#c99a73' }); const sock = new T3.MeshLambertMaterial({ color: gk ? '#222' : kit.body });
  const body = new T3.Mesh(new T3.CylinderGeometry(.38, .3, 1.0, 10), shirt); body.position.y = 1.55; body.castShadow = true; g.add(body);
  const shorts = new T3.Mesh(new T3.CylinderGeometry(.3, .32, .4, 10), trim); shorts.position.y = .9; g.add(shorts);
  for (const s of [-1, 1]) { const leg = new T3.Mesh(new T3.CylinderGeometry(.11, .1, .75, 6), sock); leg.position.set(0, .38, s * .15); leg.castShadow = true; leg.name = 'leg'; g.add(leg);
    const arm = new T3.Mesh(new T3.CylinderGeometry(.08, .07, .8, 6), shirt); arm.position.set(0, 1.55, s * .45); arm.name = 'arm'; g.add(arm); }
  const head = new T3.Mesh(new T3.SphereGeometry(.26, 12, 10), skin); head.position.y = 2.32; head.castShadow = true; g.add(head);
  g.scale.setScalar(1.35); return g;
}
const W3 = (p) => ({ x: (p.x - .5) * P3.L, z: (p.y - .5) * P3.W });
function frame3d(LM, ts) {
  const V = LM.vis, M = LM.M, S3 = LM.v3s, T3 = window.THREE; if (!S3 || !V) return;
  const el = S3.ren.domElement; if (!el.isConnected) return;
  const W = el.parentElement ? el.parentElement.clientWidth : 600, H = Math.round(Math.max(220, Math.min(560, W * .56)));
  if (S3.w !== W || S3.h !== H) { S3.w = W; S3.h = H; S3.ren.setSize(W, H); S3.cam.aspect = W / H; S3.cam.updateProjectionMatrix(); }
  const SC = V.rp || V.live; const seen = new Set();
  for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) {
    const p = SC.pos.get(e); if (!p || (!e.on && !V.rp)) continue; seen.add(e);
    let f = S3.figs.get(e); if (!f) { f = { g: figure(T3, V.kits[sideOf(V, M, e)], e.role === 'GK'), last: null, ph: Math.random() * 6 }; S3.figs.set(e, f); S3.scene.add(f.g); }
    const w = W3(p); const prev = f.last || w; const dx = w.x - prev.x, dz = w.z - prev.z; const sp = Math.hypot(dx, dz);
    f.g.position.set(w.x, 0, w.z); if (sp > .02) f.g.rotation.y = Math.atan2(-dz, dx);
    f.ph += Math.min(.6, sp * 1.4); const sw = Math.sin(f.ph) * Math.min(.7, sp * 3);
    let li = 0; for (const c of f.g.children) if (c.name === 'leg') { c.rotation.z = (li++ ? 1 : -1) * sw; } else if (c.name === 'arm') { c.rotation.z = (li % 2 ? -1 : 1) * sw * .7; }
    const down = SC.fallen && SC.fallen.get && SC.fallen.get(e); f.g.rotation.x = down ? Math.PI / 2 * .9 : 0; f.g.position.y = down ? .4 : 0;
    f.g.visible = true; f.last = w;
  }
  for (const [e, f] of S3.figs) if (!seen.has(e)) f.g.visible = false;
  const b = SC.ball || { x: .5, y: .5, h: 0 }; const bw = W3(b); const bh = .42 + (b.h || 0) * 4.5;
  S3.ball.position.set(bw.x, bh, bw.z); S3.ball.rotation.x += .1; S3.bsh.position.set(bw.x, .02, bw.z);
  // broadcast camera on the main stand side, following the ball
  const tx = Math.max(-P3.L / 2 + 8, Math.min(P3.L / 2 - 8, bw.x)), tz = bw.z * .5;
  const want = S3.mode === 'wide' ? { x: tx * .35, y: 62, z: -78 } : S3.mode === 'behind' ? { x: (bw.x >= 0 ? -1 : 1) * (P3.L / 2 + 22) + bw.x * .3, y: 20, z: bw.z * .4 } : { x: tx * .85, y: 30, z: -58 };
  const look = S3.mode === 'behind' ? { x: bw.x, y: 0, z: bw.z } : { x: tx, y: 0, z: tz };
  if (!S3.camPos) { S3.camPos = { ...want }; S3.look = { ...look }; }
  const k = .06; for (const a of ['x', 'y', 'z']) { S3.camPos[a] += (want[a] - S3.camPos[a]) * k; S3.look[a] += (look[a] - S3.look[a]) * k * 1.5; }
  S3.cam.position.set(S3.camPos.x, S3.camPos.y, S3.camPos.z); S3.cam.lookAt(S3.look.x, S3.look.y, S3.look.z);
  S3.ren.render(S3.scene, S3.cam);
}
function start3d(LM) {
  loadThree().then((T3) => {
    if (UI.match !== LM || !LM.v3 || !LM.vis) return;
    if (!LM.v3s) LM.v3s = build3d(LM, T3);
    attach3d(LM);
    if (!LM.v3raf) { const loop = (ts) => { if (UI.match !== LM || !LM.v3) { LM.v3raf = null; return; } try { frame3d(LM, ts); } catch (e) { console.error(e); } LM.v3raf = requestAnimationFrame(loop); }; LM.v3raf = requestAnimationFrame(loop); }
  }).catch(() => { LM.v3 = false; UI.v3Pref = false; toast('The 3D view needs an internet connection to load. Showing the 2D pitch.'); renderMatch(); });
}
function attach3d(LM) {
  const w = document.getElementById('p2dwrap'); if (!w || !LM.v3s) return;
  const el = LM.v3s.ren.domElement; if (el.parentElement !== w) w.appendChild(el);
  if (LM.vis && LM.vis.cv) LM.vis.cv.style.display = 'none';
}
const _rm3 = renderMatch;
renderMatch = function () {
  _rm3.apply(this, arguments);
  try {
    const LM = UI.match; if (!LM || !LM.vis) return;
    const seg = document.querySelector('[data-a="mview"][data-v="2d"]');
    if (seg && !seg.parentElement.querySelector('[data-v="3d"]')) {
      seg.insertAdjacentHTML('afterend', `<button class="${LM.v3 && LM.view === '2d' ? 'on' : ''}" data-a="mview" data-v="3d">3D</button>`);
      if (LM.v3 && LM.view === '2d') seg.classList.remove('on');
    }
    if (LM.v3 && LM.view === '2d') {
      const cs = document.querySelector('[data-a="mcam"][data-v="full"]');
      if (cs) cs.parentElement.outerHTML = `<div class="seg">${[['tv', 'TV camera'], ['wide', 'Wide'], ['behind', 'Behind goal']].map(([k, l]) => `<button class="${(LM.v3s ? LM.v3s.mode : 'tv') === k ? 'on' : ''}" data-a="m3cam" data-v="${k}">${l}</button>`).join('')}</div>`;
      if (LM.v3s) attach3d(LM); else start3d(LM);
    } else if (LM.vis.cv) LM.vis.cv.style.display = '';
  } catch (e) { console.error(e); }
};
const _mview3 = ACT.mview;
ACT.mview = (v) => {
  const LM = UI.match; if (!LM) return;
  if (v === '3d') { LM.v3 = true; UI.v3Pref = true; _mview3('2d'); start3d(LM); return; }
  LM.v3 = false; UI.v3Pref = false; _mview3(v);
};
ACT.m3cam = (v) => { const LM = UI.match; if (LM && LM.v3s) { LM.v3s.mode = v; LM.v3s.camPos = null; } renderMatch(); };
// keep the choice for the next match
const _sl3 = startLive;
startLive = function () { const r = _sl3.apply(this, arguments); try { const LM = UI.match; if (LM && LM.vis && UI.v3Pref && LM.view === '2d') { LM.v3 = true; start3d(LM); renderMatch(); } } catch (e) { console.error(e); } return r; };
