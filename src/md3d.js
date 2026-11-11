// md3d.js: 3D matchday view. A third option next to "2D pitch" and "Text only". It draws the same live scene as the
// 2D view (positions, ball, set pieces, replays) with three.js r128, loaded from cdnjs only when 3D is chosen, and
// falls back to 2D if it cannot load. The match engine and the 2D plan are unchanged.
// Stage 2: stadium with roofs, floodlights, boards, dugouts and corner flags; day/night light and rain/snow from the
// fixture; shirt numbers; goalkeeper kits; celebrations, keeper dives, goal orbit camera, 3D replays; on-screen labels;
// quality toggle (low = no shadows, lower resolution), paused while the tab is hidden.
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
let _threeP = null, _last3 = null;
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (_threeP) return _threeP;
  _threeP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = THREE_URL; s.async = true; s.onload = () => window.THREE ? res(window.THREE) : rej(new Error('three.js missing')); s.onerror = () => { _threeP = null; rej(new Error('three.js did not load')); }; document.head.appendChild(s); });
  return _threeP;
}
const P3 = { L: 105, W: 68 }; // pitch metres
const W3 = (p) => ({ x: (p.x - .5) * P3.L, z: (p.y - .5) * P3.W });
function q3lo() { return UI.v3q ? UI.v3q === 'lo' : (window.innerWidth < 760); }
function cvs(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function pitchTex(T3) {
  const [c, g] = cvs(1024, 664);
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#2f7d36' : '#368b3d'; g.fillRect(i * 64, 0, 64, 664); }
  const sx = 1024 / P3.L, sy = 664 / P3.W, X = (m) => m * sx, Y = (m) => m * sy;
  g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 3;
  g.strokeRect(X(0) + 2, Y(0) + 2, X(P3.L) - 4, Y(P3.W) - 4);
  g.beginPath(); g.moveTo(X(P3.L / 2), 0); g.lineTo(X(P3.L / 2), Y(P3.W)); g.stroke();
  g.beginPath(); g.ellipse(X(P3.L / 2), Y(P3.W / 2), X(9.15), Y(9.15), 0, 0, 7); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(X(P3.L / 2), Y(P3.W / 2), 4, 0, 7); g.fill();
  for (const side of [0, 1]) {
    const x0 = side ? P3.L : 0, d = side ? -1 : 1;
    g.strokeRect(Math.min(X(x0), X(x0 + d * 16.5)), Y(P3.W / 2 - 20.16), X(16.5), Y(40.32));
    g.strokeRect(Math.min(X(x0), X(x0 + d * 5.5)), Y(P3.W / 2 - 9.16), X(5.5), Y(18.32));
    g.beginPath(); g.arc(X(x0 + d * 11), Y(P3.W / 2), 4, 0, 7); g.fill();
    g.beginPath(); g.ellipse(X(x0 + d * 11), Y(P3.W / 2), X(9.15), Y(9.15), 0, side ? Math.PI - .93 : -.93, side ? Math.PI + .93 : .93); g.stroke();
  }
  const t = new T3.CanvasTexture(c); t.anisotropy = 4; return t;
}
// rows of supporters: mostly the home colours, an away end, some empty seats when the ground is not full
function crowdTex(T3, cols, fill, night) {
  const [c, g] = cvs(512, 256);
  g.fillStyle = night ? '#141826' : '#2a3042'; g.fillRect(0, 0, 512, 256);
  for (let r = 0; r < 16; r++) {
    const y = 6 + r * 15.5; g.fillStyle = night ? '#1c2132' : '#343b50'; g.fillRect(0, y + 9, 512, 4);
    for (let x = 3; x < 510; x += 6) {
      if (Math.random() > fill) continue;
      g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(x, y + 3, 4, 6);
      g.fillStyle = night ? '#8a6d58' : '#c99a73'; g.fillRect(x + .5, y, 3, 3);
    }
  }
  const t = new T3.CanvasTexture(c); t.wrapS = T3.RepeatWrapping; t.repeat.set(3, 1); return t;
}
function boardTex(T3, txt, bg, fg) {
  const [c, g] = cvs(1024, 64); g.fillStyle = bg; g.fillRect(0, 0, 1024, 64); g.fillStyle = fg; g.font = 'bold 38px sans-serif'; g.textBaseline = 'middle';
  for (let x = 20; x < 1024; x += 340) g.fillText(txt, x, 34);
  return new T3.CanvasTexture(c);
}
function numTex(T3, n, col, bg) {
  const [c, g] = cvs(64, 64); g.clearRect(0, 0, 64, 64); g.fillStyle = col; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n || ''), 32, 35);
  return new T3.CanvasTexture(c);
}
function gkColour(kits) { for (const c of ['#e7d630', '#1f9a4a', '#ff7a1a', '#8a3cff', '#14b5c8', '#222222']) if (colDist(c, kits[0].body) > 120 && colDist(c, kits[1].body) > 120) return c; return '#e7d630'; }
function stand3(T3, scene, o) {
  // a raked stand: crowd on a sloped face, back wall, roof
  const g = new T3.Group(); const { w, d, h, tex, roofM, wallM } = o;
  const rake = new T3.Mesh(new T3.PlaneGeometry(w, Math.hypot(d, h)), new T3.MeshLambertMaterial({ map: tex })); rake.rotation.x = -Math.atan2(h, d); rake.position.set(0, h / 2, -d / 2 + 1); g.add(rake);
  const back = new T3.Mesh(new T3.BoxGeometry(w, h + 4, 1), wallM); back.position.set(0, (h + 4) / 2, -d); g.add(back);
  const roof = new T3.Mesh(new T3.BoxGeometry(w + 2, .6, d * .9), roofM); roof.position.set(0, h + 6, -d * .5); roof.rotation.x = .06; g.add(roof);
  const sides = [-1, 1].map(s => { const m = new T3.Mesh(new T3.BoxGeometry(1, h + 4, d), wallM); m.position.set(s * w / 2, (h + 4) / 2, -d / 2); return m; }); sides.forEach(m => g.add(m));
  g.position.set(o.x, 0, o.z); g.rotation.y = o.ry; scene.add(g); return g;
}
function build3d(LM, T3) {
  if (_last3 && _last3 !== LM.v3s) { try { _last3.ren.dispose(); _last3.ren.forceContextLoss && _last3.ren.forceContextLoss(); } catch (e) { } _last3 = null; }
  const V = LM.vis, M = LM.M; const kits = V.kits; const home = T(M.sides[0].tid), away = T(M.sides[1].tid);
  const night = !!(V.meta && V.meta.night), wx = V.meta && V.meta.wx; const lo = q3lo();
  const scene = new T3.Scene(); const sky = night ? '#05070f' : (wx === 'rain' ? '#6f7a88' : wx === 'snow' ? '#b9c3cf' : '#8fb9e3');
  scene.background = new T3.Color(sky); scene.fog = new T3.Fog(sky, 150, 320);
  const cam = new T3.PerspectiveCamera(42, 16 / 9, .5, 700);
  const ren = new T3.WebGLRenderer({ antialias: !lo, powerPreference: 'high-performance' }); ren.setPixelRatio(lo ? 1 : Math.min(1.75, window.devicePixelRatio || 1)); ren.shadowMap.enabled = !lo;
  ren.domElement.className = 'p3d'; ren.domElement.setAttribute('role', 'img'); ren.domElement.setAttribute('aria-label', 'Live 3D match view'); ren.domElement.style.display = 'block'; ren.domElement.style.width = '100%';
  scene.add(new T3.HemisphereLight(night ? '#9fb2ff' : '#e6eeff', '#203020', night ? .55 : .8));
  const sun = new T3.DirectionalLight(night ? '#fff6dd' : '#ffffff', night ? .65 : .85); sun.position.set(-40, 90, 50); sun.castShadow = !lo; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50, near: 10, far: 220 }); if (sun.shadow.camera.updateProjectionMatrix) sun.shadow.camera.updateProjectionMatrix(); scene.add(sun);
  // ground and pitch
  const turf = new T3.Mesh(new T3.PlaneGeometry(P3.L + 30, P3.W + 26), new T3.MeshLambertMaterial({ color: '#2b6f31' })); turf.rotation.x = -Math.PI / 2; turf.position.y = -.02; turf.receiveShadow = true; scene.add(turf);
  const pitch = new T3.Mesh(new T3.PlaneGeometry(P3.L, P3.W), new T3.MeshLambertMaterial({ map: pitchTex(T3) })); pitch.rotation.x = -Math.PI / 2; pitch.receiveShadow = true; scene.add(pitch);
  // goals with nets set behind the line
  const postM = new T3.MeshLambertMaterial({ color: '#ffffff' }); const netM = new T3.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .22, side: T3.DoubleSide, wireframe: true });
  for (const s of [-1, 1]) {
    const gx = s * P3.L / 2, g = new T3.Group();
    for (const z of [-3.66, 3.66]) { const p = new T3.Mesh(new T3.CylinderGeometry(.08, .08, 2.44, 8), postM); p.position.set(gx, 1.22, z); p.castShadow = true; g.add(p); }
    const bar = new T3.Mesh(new T3.CylinderGeometry(.08, .08, 7.32, 8), postM); bar.rotation.x = Math.PI / 2; bar.position.set(gx, 2.44, 0); g.add(bar);
    const net = new T3.Mesh(new T3.BoxGeometry(2, 2.44, 7.32, 4, 5, 10), netM); net.position.set(gx + s * 1.02, 1.22, 0); g.add(net);
    scene.add(g);
  }
  // corner flags
  const flagM = new T3.MeshBasicMaterial({ color: home.c2 && colDist(home.c2, '#2f7d36') > 80 ? home.c2 : '#f5d90a', side: T3.DoubleSide });
  for (const x of [-1, 1]) for (const z of [-1, 1]) { const p = new T3.Mesh(new T3.CylinderGeometry(.04, .04, 1.5, 6), postM); p.position.set(x * P3.L / 2, .75, z * P3.W / 2); scene.add(p); const f = new T3.Mesh(new T3.PlaneGeometry(.45, .3), flagM); f.position.set(x * P3.L / 2 + .22, 1.35, z * P3.W / 2); scene.add(f); }
  // stands: home colours on three sides, the away end behind one goal
  const fill = Math.max(.35, Math.min(1, (V.att || 30000) / ((home.cap || 40000) || 40000)));
  const hc = [kits[0].body, kits[0].body, kits[0].trim, '#d9d9d9', '#555b6e'], ac = [kits[1].body, kits[1].body, kits[1].trim, '#d9d9d9'];
  const roofM = new T3.MeshLambertMaterial({ color: night ? '#1a1e2a' : '#c9ced8' }), wallM = new T3.MeshLambertMaterial({ color: night ? '#121522' : '#3a4152' });
  const dz = P3.W / 2 + 6, dx = P3.L / 2 + 7;
  const bowl = M.sides[0].tid === 'ARS'; // Arsenal's home: the bowl
  if (bowl) buildBowl(T3, scene, { night, fill, home: kits[0], away: kits[1] }); else {
  stand3(T3, scene, { w: P3.L + 10, d: 22, h: 15, tex: crowdTex(T3, hc, fill, night), roofM, wallM, x: 0, z: -dz, ry: 0 });
  stand3(T3, scene, { w: P3.L + 10, d: 18, h: 12, tex: crowdTex(T3, hc, fill, night), roofM, wallM, x: 0, z: dz, ry: Math.PI });
  stand3(T3, scene, { w: P3.W + 8, d: 18, h: 12, tex: crowdTex(T3, hc, fill, night), roofM, wallM, x: -dx, z: 0, ry: Math.PI / 2 });
  stand3(T3, scene, { w: P3.W + 8, d: 18, h: 12, tex: crowdTex(T3, ac, Math.min(1, fill + .1), night), roofM, wallM, x: dx, z: 0, ry: -Math.PI / 2 });
  }
  // advertising boards and dugouts
  const bt = boardTex(T3, `${(home.short || home.name).toUpperCase()}   ·   GAFFER 26/27   ·   WUPH.com`, home.c1 || '#c8102e', '#ffffff');
  for (const [z, ry] of [[-(P3.W / 2 + 2.5), 0], [P3.W / 2 + 2.5, Math.PI]]) { const b = new T3.Mesh(new T3.PlaneGeometry(P3.L, .9), new T3.MeshBasicMaterial({ map: bt })); b.position.set(0, .45, z); b.rotation.y = ry; scene.add(b); }
  for (const [x, ry] of [[-(P3.L / 2 + 2.5), Math.PI / 2], [P3.L / 2 + 2.5, -Math.PI / 2]]) { const b = new T3.Mesh(new T3.PlaneGeometry(P3.W, .9), new T3.MeshBasicMaterial({ map: bt })); b.position.set(x, .45, 0); b.rotation.y = ry; scene.add(b); }
  const dugM = new T3.MeshLambertMaterial({ color: '#1d2230', transparent: true, opacity: .85 });
  for (const x of [-9, 9]) { const d = new T3.Mesh(new T3.BoxGeometry(8, 2.2, 2.2), dugM); d.position.set(x, 1.1, -(P3.W / 2 + 4.2)); scene.add(d); }
  // floodlight pylons at the corners; glowing at night
  const pyM = new T3.MeshLambertMaterial({ color: '#9aa2b1' }); const lampM = new T3.MeshBasicMaterial({ color: night ? '#fffbe0' : '#e8ecf2' });
  const glow = night ? (() => { const [c, g] = cvs(64, 64); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,250,220,1)'); r.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T3.SpriteMaterial({ map: new T3.CanvasTexture(c), transparent: true, depthWrite: false, blending: T3.AdditiveBlending }); })() : null;
  if (!bowl) for (const x of [-1, 1]) for (const z of [-1, 1]) {
    const px = x * (P3.L / 2 + 16), pz = z * (P3.W / 2 + 16);
    const p = new T3.Mesh(new T3.CylinderGeometry(.5, .8, 42, 8), pyM); p.position.set(px, 21, pz); scene.add(p);
    const lamp = new T3.Mesh(new T3.BoxGeometry(6, 4, .6), lampM); lamp.position.set(px, 43, pz); lamp.lookAt(0, 0, 0); scene.add(lamp);
    if (glow) { const s = new T3.Sprite(glow); s.position.set(px, 43, pz); s.scale.set(22, 22, 1); scene.add(s); }
  }
  // ball
  const ball = new T3.Mesh(new T3.SphereGeometry(.42, 16, 12), new T3.MeshLambertMaterial({ color: '#ffffff' })); ball.castShadow = !lo; scene.add(ball);
  const bsh = new T3.Mesh(new T3.CircleGeometry(.5, 16), new T3.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .3 })); bsh.rotation.x = -Math.PI / 2; bsh.position.y = .02; scene.add(bsh);
  // rain or snow
  let wxp = null;
  if (wx === 'rain' || wx === 'snow') {
    const n = lo ? 700 : 1600; const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 160; pos[i * 3 + 1] = Math.random() * 50; pos[i * 3 + 2] = (Math.random() - .5) * 120; }
    const geo = new T3.BufferGeometry(); geo.setAttribute('position', new T3.BufferAttribute(pos, 3));
    wxp = new T3.Points(geo, new T3.PointsMaterial({ color: wx === 'rain' ? '#c6d3e6' : '#ffffff', size: wx === 'rain' ? .3 : .45, transparent: true, opacity: wx === 'rain' ? .75 : .95 }));
    wxp.userData = { snow: wx === 'snow' }; scene.add(wxp);
  }
  const S3 = { scene, cam, ren, ball, bsh, wxp, figs: new Map(), camPos: null, look: null, mode: (LM.v3s && LM.v3s.mode) || UI.v3cam || 'tv', lo, gk: gkColour(kits), T3 };
  _last3 = S3; return S3;
}
function figure(T3, kit, gk, gkCol, num) {
  const g = new T3.Group();
  const shirtCol = gk ? gkCol : kit.body;
  const shirt = new T3.MeshLambertMaterial({ color: shirtCol });
  const trim = new T3.MeshLambertMaterial({ color: gk ? '#1b1b1b' : kit.trim }); const skin = new T3.MeshLambertMaterial({ color: ['#c99a73', '#8d5a3b', '#e2b896', '#5e3a26'][(num || 0) % 4] });
  const sock = new T3.MeshLambertMaterial({ color: gk ? shirtCol : kit.body }); const boot = new T3.MeshLambertMaterial({ color: '#111111' }); const hair = new T3.MeshLambertMaterial({ color: ['#2a1d14', '#0e0e0e', '#6b4a2b', '#c9a35c'][(num || 0) % 4] });
  const torso = new T3.Mesh(new T3.CylinderGeometry(.34, .27, .95, 10), shirt); torso.position.y = 1.5; torso.castShadow = true; g.add(torso);
  const shorts = new T3.Mesh(new T3.CylinderGeometry(.28, .3, .36, 10), trim); shorts.position.y = .9; g.add(shorts);
  for (const s of [-1, 1]) {
    const leg = new T3.Group(); leg.position.set(0, .82, s * .14); leg.name = 'leg';
    const thigh = new T3.Mesh(new T3.CylinderGeometry(.11, .09, .78, 6), sock); thigh.position.y = -.4; thigh.castShadow = true; leg.add(thigh);
    const b = new T3.Mesh(new T3.BoxGeometry(.28, .1, .14), boot); b.position.set(.06, -.8, 0); leg.add(b);
    g.add(leg);
    const arm = new T3.Group(); arm.position.set(0, 1.9, s * .42); arm.name = 'arm' + (s > 0 ? 'R' : 'L');
    const a = new T3.Mesh(new T3.CylinderGeometry(.075, .065, .72, 6), shirt); a.position.y = -.36; arm.add(a);
    const hand = new T3.Mesh(new T3.SphereGeometry(.07, 6, 5), skin); hand.position.y = -.74; arm.add(hand); g.add(arm);
  }
  const head = new T3.Mesh(new T3.SphereGeometry(.22, 12, 10), skin); head.position.y = 2.22; head.castShadow = true; g.add(head);
  const cap = new T3.Mesh(new T3.SphereGeometry(.225, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), hair); cap.position.y = 2.25; g.add(cap);
  if (num) { const nb = new T3.Mesh(new T3.PlaneGeometry(.5, .5), new T3.MeshBasicMaterial({ map: numTex(T3, num, gk ? '#111' : kit.trim), transparent: true })); nb.position.set(-.33, 1.58, 0); nb.rotation.y = -Math.PI / 2; g.add(nb); }
  g.scale.setScalar(1.35); return g;
}
// the label the 2D view would show (Penalty!, GOAL!, saves), plus REPLAY
function overlay3d(LM, SC) {
  const w = document.getElementById('p2dwrap'); if (!w) return;
  let o = w.querySelector('.o3d'); if (!o) { w.style.position = 'relative'; o = document.createElement('div'); o.className = 'o3d'; o.setAttribute('aria-live', 'polite'); w.appendChild(o); }
  const fx = (SC.fx || []).filter(f => f.txt && SC.t - f.t0 < f.life); const f = fx[fx.length - 1];
  const txt = (LM.vis.rp ? 'REPLAY' + (SC.label ? ' · ' + SC.label : '') + (f ? ' · ' : '') : '') + (f ? f.txt : '');
  if (o.textContent !== txt) { o.textContent = txt; o.className = 'o3d' + (f && f.big ? ' big' : '') + (txt ? ' on' : ''); if (f && f.col) o.style.color = f.col; else o.style.color = ''; }
}
function frame3d(LM, ts) {
  const V = LM.vis, M = LM.M, S3 = LM.v3s, T3 = window.THREE; if (!S3 || !V) return;
  const el = S3.ren.domElement; if (!el.isConnected || document.hidden) return;
  const W = el.parentElement ? el.parentElement.clientWidth : 600, H = Math.round(Math.max(220, Math.min(560, W * .56)));
  if (S3.w !== W || S3.h !== H) { S3.w = W; S3.h = H; S3.ren.setSize(W, H); S3.cam.aspect = W / H; S3.cam.updateProjectionMatrix(); }
  const SC = V.rp || V.live; const seen = new Set(); const cs = SC.plan && SC.plan[SC.si];
  const celeb = cs && cs.k === 'celebrate' && SC.t < cs.te ? cs : null;
  const b = SC.ball || { x: .5, y: .5, h: 0 }; const bw = W3(b);
  for (let s = 0; s < 2; s++) for (const e of M.sides[s].ps) {
    const p = SC.pos.get(e); if (!p || (!e.on && !V.rp)) continue; seen.add(e);
    let f = S3.figs.get(e); if (!f) { f = { g: figure(T3, V.kits[sideOf(V, M, e)], e.role === 'GK', S3.gk, e.p.no || (M.sides[s].ps.indexOf(e) + 1)), last: null, ph: Math.random() * 6 }; S3.figs.set(e, f); S3.scene.add(f.g); f.g.traverse(o => { if (o.isMesh) o.castShadow = !S3.lo; }); }
    const w = W3(p); const prev = f.last || w; const dx = w.x - prev.x, dz = w.z - prev.z; const sp = Math.hypot(dx, dz);
    f.g.position.set(w.x, 0, w.z);
    // face the way he runs; when standing, face the ball
    const ang = sp > .03 ? Math.atan2(-dz, dx) : Math.atan2(-(bw.z - w.z), bw.x - w.x);
    let da = ang - f.g.rotation.y; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; f.g.rotation.y += da * .25;
    f.ph += Math.min(.6, sp * 1.4); const sw = Math.sin(f.ph) * Math.min(.75, sp * 3);
    const party = celeb && sideOf(V, M, e) === celeb.side;
    let li = 0; for (const c of f.g.children) {
      if (c.name === 'leg') c.rotation.z = (li++ ? 1 : -1) * sw;
      else if (c.name === 'armL' || c.name === 'armR') { const side = c.name === 'armR' ? 1 : -1; c.rotation.z = party ? 0 : -side * sw * .8; c.rotation.x = party ? side * 2.7 : 0; }
    }
    // keeper dive
    let lift = 0, roll = 0;
    if (SC.dive && SC.dive.e === e && SC.t >= SC.dive.t0) { const q = Math.min(1, (SC.t - SC.dive.t0) / Math.max(1, SC.dive.t1 - SC.dive.t0)); const dir = SC.dive.to.y >= SC.dive.from.y ? 1 : -1; roll = dir * Math.min(1, q * 1.6) * (SC.dive.stretch ? 1.35 : .5); lift = Math.sin(Math.PI * Math.min(1, q)) * (SC.dive.stretch ? .9 : .3); }
    const down = SC.fallen && SC.fallen.get && SC.fallen.get(e);
    if (down) { roll = 1.45; lift = .3; }
    if (party && !down) lift = Math.abs(Math.sin(ts / 140 + f.ph)) * .7;
    f.g.rotation.x = roll; f.g.position.y = lift;
    f.g.visible = true; f.last = w;
  }
  for (const [e, f] of S3.figs) if (!seen.has(e)) f.g.visible = false;
  const bh = .42 + (b.h || 0) * 4.5;
  S3.ball.position.set(bw.x, bh, bw.z); S3.ball.rotation.x += .1; S3.bsh.position.set(bw.x, .02, bw.z); S3.bsh.scale.setScalar(Math.max(.4, 1 - (b.h || 0) * .5));
  // weather
  if (S3.wxp) { const a = S3.wxp.geometry.attributes.position; const snow = S3.wxp.userData.snow; for (let i = 0; i < a.count; i++) { let y = a.getY(i) - (snow ? .08 : .9); if (y < 0) y = 50; a.setY(i, y); if (snow) a.setX(i, a.getX(i) + Math.sin(ts / 900 + i) * .02); } a.needsUpdate = true; }
  // cameras: broadcast (follows the ball), wide, behind the goal; a slow orbit around the scorer after a goal; low and close for replays
  const tx = Math.max(-P3.L / 2 + 8, Math.min(P3.L / 2 - 8, bw.x)), tz = bw.z * .5;
  let want, look, k = .06;
  if (celeb && SC.pos.get(celeb.e)) { const sp = W3(SC.pos.get(celeb.e)); const a = ts / 2600; want = { x: sp.x + Math.cos(a) * 16, y: 6.5, z: sp.z + Math.sin(a) * 16 }; look = { x: sp.x, y: 1.6, z: sp.z }; k = .05; }
  else if (V.rp) { const sgn = bw.x >= 0 ? 1 : -1; want = { x: bw.x - sgn * 14, y: 4.5, z: bw.z - 18 }; look = { x: bw.x + sgn * 6, y: 1.2, z: bw.z }; k = .09; }
  else if (S3.mode === 'wide') { want = { x: tx * .3, y: 56, z: -36 }; look = { x: tx * .6, y: 0, z: tz * .4 + 6 }; }
  else if (S3.mode === 'behind') { const sgn = bw.x >= 0 ? 1 : -1; want = { x: sgn * (P3.L / 2 + 14), y: 11, z: bw.z * .35 }; look = { x: bw.x - sgn * 6, y: 0, z: bw.z }; }
  else { want = { x: tx * .85, y: 19, z: -39 }; look = { x: tx, y: 0, z: tz + 4 }; } // TV gantry under the roof edge of the main stand
  if (!S3.camPos || S3.cut !== !!(celeb || V.rp)) { S3.cut = !!(celeb || V.rp); if (!S3.camPos || S3.cut) { S3.camPos = { ...want }; S3.look = { ...look }; } }
  for (const a of ['x', 'y', 'z']) { S3.camPos[a] += (want[a] - S3.camPos[a]) * k; S3.look[a] += (look[a] - S3.look[a]) * k * 1.5; }
  S3.cam.position.set(S3.camPos.x, S3.camPos.y, S3.camPos.z); S3.cam.lookAt(S3.look.x, S3.look.y, S3.look.z);
  overlay3d(LM, SC);
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
      const mode = LM.v3s ? LM.v3s.mode : (UI.v3cam || 'tv');
      if (cs) cs.parentElement.outerHTML = `<div class="seg">${[['tv', 'TV camera'], ['wide', 'Wide'], ['behind', 'Behind goal']].map(([k, l]) => `<button class="${mode === k ? 'on' : ''}" data-a="m3cam" data-v="${k}">${l}</button>`).join('')}</div><button class="btn ${q3lo() ? 'on' : ''}" data-a="m3q" title="Low quality: no shadows, lower resolution; smoother on phones">Low quality ${q3lo() ? 'on' : 'off'}</button>`;
      if (LM.v3s) attach3d(LM); else start3d(LM);
    } else if (LM.vis.cv) { LM.vis.cv.style.display = ''; const o = document.querySelector('#p2dwrap .o3d'); if (o) o.remove(); }
  } catch (e) { console.error(e); }
};
const _mview3 = ACT.mview;
ACT.mview = (v) => {
  const LM = UI.match; if (!LM) return;
  if (v === '3d') { LM.v3 = true; UI.v3Pref = true; _mview3('2d'); start3d(LM); return; }
  LM.v3 = false; UI.v3Pref = false; _mview3(v);
};
ACT.m3cam = (v) => { const LM = UI.match; UI.v3cam = v; if (LM && LM.v3s) { LM.v3s.mode = v; LM.v3s.camPos = null; } renderMatch(); };
// quality: rebuild the scene with or without shadows and at a lower resolution
ACT.m3q = () => {
  UI.v3q = q3lo() ? 'hi' : 'lo'; try { localStorage.setItem('gaffer_v3q', UI.v3q); } catch (e) { }
  const LM = UI.match; if (LM && LM.v3s && window.THREE) { const old = LM.v3s; try { old.ren.domElement.remove(); } catch (e) { } LM.v3s = null; LM.v3s = build3d(LM, window.THREE); LM.v3s.mode = old.mode; }
  renderMatch();
};
try { const q = localStorage.getItem('gaffer_v3q'); if (q) UI.v3q = q; } catch (e) { }
// keep the choice for the next match
const _sl3 = startLive;
startLive = function () { const r = _sl3.apply(this, arguments); try { const LM = UI.match; if (LM && LM.vis && UI.v3Pref && LM.view === '2d') { LM.v3 = true; start3d(LM); renderMatch(); } } catch (e) { console.error(e); } return r; };

// ---------- the bowl: one continuous oval stadium (Arsenal's home ground in the 3D view, and the intro) ----------
// Inspired by a well-known North London ground: two red tiers with a thin club-level band between them, a light
// translucent roof on slim trusses that rises over the sides and dips at the ends, big screens in two corners, a
// clock on one end, a glass facade outside. No names or logos.
function bowlPt(a, b, t) { const c = Math.cos(t), s = Math.sin(t); return [a * Math.sign(c) * Math.pow(Math.abs(c), .5), b * Math.sign(s) * Math.pow(Math.abs(s), .5)]; }
function bowlStrip(T3, scene, mat, f, N, rep) {
  // f(t) -> [[x, y, z] inner, [x, y, z] outer]; a ring strip with u around the bowl and v from inner to outer
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) { const t = i / N * Math.PI * 2; const [p, q] = f(t); pos.push(...p, ...q); uv.push(i / N * rep, 0, i / N * rep, 1); if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
  const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new T3.Mesh(g, mat); scene.add(m); return m;
}
function seatsTex(T3, fill, night, home) {
  const [c, g] = cvs(512, 256); g.fillStyle = night ? '#5e0a10' : '#a3121c'; g.fillRect(0, 0, 512, 256);
  const shirts = [home.body, home.body, home.trim, '#e9e9e9', '#22252e', home.body];
  for (let r = 0; r < 18; r++) {
    const y = 4 + r * 14; g.fillStyle = night ? '#3a060a' : '#7d0d15'; g.fillRect(0, y + 10, 512, 2);
    for (let x = 2; x < 510; x += 6) {
      if ((x > 200 && x < 214 && r % 6 === 2)) { g.fillStyle = '#e9e9e9'; g.fillRect(x, y + 4, 5, 6); continue; } // a few white seats
      if (Math.random() > fill) continue;
      g.fillStyle = shirts[(Math.random() * shirts.length) | 0]; g.fillRect(x, y + 3, 4, 7);
      g.fillStyle = night ? '#8a6d58' : '#c99a73'; g.fillRect(x + .5, y, 3, 3);
    }
  }
  const t = new T3.CanvasTexture(c); t.wrapS = T3.RepeatWrapping; return t;
}
function screenTex(T3, txt) {
  const [c, g] = cvs(512, 256); g.fillStyle = '#05070f'; g.fillRect(0, 0, 512, 256); g.strokeStyle = '#2b3350'; g.lineWidth = 8; g.strokeRect(4, 4, 504, 248);
  g.fillStyle = '#ffd23f'; g.font = 'bold 64px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt || 'GAFFER 26/27', 256, 128);
  const t = new T3.CanvasTexture(c); return t;
}
function clockTex(T3) {
  const [c, g] = cvs(256, 256); g.fillStyle = '#f5f5f5'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 10; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); g.lineTo(128 + Math.sin(a) * 110, 128 - Math.cos(a) * 110); g.lineWidth = 6; g.stroke(); }
  const h = new Date(); const ha = ((h.getHours() % 12) + h.getMinutes() / 60) / 12 * Math.PI * 2, ma = h.getMinutes() / 60 * Math.PI * 2;
  g.lineCap = 'round'; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(ha) * 55, 128 - Math.cos(ha) * 55); g.stroke();
  g.lineWidth = 6; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(ma) * 85, 128 - Math.cos(ma) * 85); g.stroke();
  return new T3.CanvasTexture(c);
}
function facadeTex(T3, night) {
  const [c, g] = cvs(256, 128); g.fillStyle = night ? '#1b2a3d' : '#9fbad6'; g.fillRect(0, 0, 256, 128);
  for (let x = 0; x < 256; x += 16) { g.fillStyle = night ? '#0c121b' : '#d9e2ec'; g.fillRect(x, 0, 3, 128); }
  for (let y = 0; y < 128; y += 32) { g.fillStyle = night ? '#0c121b' : '#d9e2ec'; g.fillRect(0, y, 256, 3); }
  if (night) for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,220,150,.75)'; g.fillRect(Math.random() * 250, Math.random() * 120, 10, 6); }
  const t = new T3.CanvasTexture(c); t.wrapS = T3.RepeatWrapping; return t;
}
function buildBowl(T3, scene, o) {
  const night = !!o.night, N = 128, a0 = P3.L / 2 + 5, b0 = P3.W / 2 + 5;
  const ring = (da, y) => (t) => { const [x, z] = bowlPt(a0 + da, b0 + da, t); return [x, y, z]; };
  const strip = (mat, f, rep) => bowlStrip(T3, scene, mat, f, N, rep);
  const seats = new T3.MeshLambertMaterial({ map: seatsTex(T3, o.fill || .95, night, o.home || { body: '#d0101b', trim: '#ffffff' }), side: T3.DoubleSide });
  // lower tier, club band, upper tier
  strip(seats, (t) => [ring(0, .6)(t), ring(17, 11)(t)], 14);
  const band = new T3.MeshLambertMaterial({ color: night ? '#1d2433' : '#3b4558', emissive: night ? '#2a2414' : '#000000', side: T3.DoubleSide });
  strip(band, (t) => [ring(17, 11)(t), ring(18, 14.5)(t)], 1);
  strip(seats, (t) => [ring(18, 14.5)(t), ring(37, 31)(t)], 16);
  const wall = new T3.MeshLambertMaterial({ color: night ? '#141a26' : '#566074', side: T3.DoubleSide });
  strip(wall, (t) => [ring(37, 31)(t), ring(38, 34)(t)], 1);
  // glass facade outside and the concourse
  const fac = new T3.MeshLambertMaterial({ map: facadeTex(T3, night), side: T3.DoubleSide, emissive: night ? '#101826' : '#000000' });
  strip(fac, (t) => [ring(39, 0)(t), ring(39, 34)(t)], 24);
  const conc = new T3.MeshLambertMaterial({ color: night ? '#2b2f37' : '#a3a8b0', side: T3.DoubleSide });
  strip(conc, (t) => [ring(39, .05)(t), ring(62, .05)(t)], 1);
  // the roof: light and translucent, higher over the sides, lower at the ends
  const rh = (t) => 37 + 6 * Math.abs(Math.sin(t));
  const roof = new T3.MeshLambertMaterial({ color: '#f3f5f8', transparent: true, opacity: .62, side: T3.DoubleSide, emissive: night ? '#2a2c30' : '#000000' });
  strip(roof, (t) => { const [x1, z1] = bowlPt(a0 + 12, b0 + 12, t), [x2, z2] = bowlPt(a0 + 40, b0 + 40, t); return [[x1, rh(t), z1], [x2, rh(t) - 2.5, z2]]; }, 1);
  const trussM = new T3.MeshLambertMaterial({ color: '#cfd6df' }); const lampM = new T3.MeshBasicMaterial({ color: night ? '#fffbe0' : '#e8ecf2' });
  for (let i = 0; i < 48; i++) {
    const t = i / 48 * Math.PI * 2; const [x1, z1] = bowlPt(a0 + 12, b0 + 12, t), [x2, z2] = bowlPt(a0 + 40, b0 + 40, t); const y = rh(t) - .6;
    const len = Math.hypot(x2 - x1, z2 - z1); const tr = new T3.Mesh(new T3.BoxGeometry(len, .5, .3), trussM); tr.position.set((x1 + x2) / 2, y - 1.2, (z1 + z2) / 2); tr.rotation.y = -Math.atan2(z2 - z1, x2 - x1); tr.rotation.z = .05; scene.add(tr);
    if (i % 2 === 0) { const l = new T3.Mesh(new T3.BoxGeometry(1.4, .5, .8), lampM); l.position.set(x1, y - .3, z1); scene.add(l); }
  }
  // big screens in two corners and a clock at one end
  for (const t of [Math.PI * .25, Math.PI * 1.25]) { const [x, z] = bowlPt(a0 + 34, b0 + 34, t); const sc = new T3.Mesh(new T3.PlaneGeometry(14, 7), new T3.MeshBasicMaterial({ map: screenTex(T3, o.screen) })); sc.position.set(x, 37, z); sc.lookAt(0, 30, 0); scene.add(sc); }
  { const [x, z] = bowlPt(a0 + 36, b0 + 36, Math.PI); const ck = new T3.Mesh(new T3.CircleGeometry(3.2, 32), new T3.MeshBasicMaterial({ map: clockTex(T3) })); ck.position.set(x + 1, 35.5, z); ck.lookAt(0, 30, 0); scene.add(ck); }
  // footbridges over the concourse
  const brM = new T3.MeshLambertMaterial({ color: night ? '#3a3f4a' : '#b7bcc4' });
  for (const t of [Math.PI * .5, Math.PI * 1.5, Math.PI * .1]) { const [x, z] = bowlPt(a0 + 62, b0 + 62, t); const br = new T3.Mesh(new T3.BoxGeometry(4, .6, 40), brM); br.position.set(x * 1.08, 4, z * 1.08); br.lookAt(0, 4, 0); scene.add(br); }
  const ground = new T3.Mesh(new T3.PlaneGeometry(600, 600), new T3.MeshLambertMaterial({ color: night ? '#15181f' : '#5c6470' })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.08; scene.add(ground);
}
