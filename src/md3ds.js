// md3ds.js: 3D matchday, Phase 10 — stadium detail and shape by club size. Loaded after md3dc.js.
// Grounds now follow the capacity: small grounds (under 22,000) have low stands with open corners, a covered terrace at
// the home end and floodlight pylons; mid-size grounds keep single-tier stands with pylons; big grounds (45,000+) get two
// tiers with a band of glass executive boxes. Arsenal's home stays the Emirates-inspired bowl (no names or logos).
// Every ground gets stairways and vomitories on the stands, roof trusses, a players' tunnel with an extending cover,
// technical-area markings, goal stanchions and animated LED perimeter boards with generic messages (the club name and
// any badge you uploaded on this device; no real sponsors).

function stadiumKind(V) { const cap = (V.venue && V.venue.cap) || 30000; return cap < 22000 ? 'small' : cap < 45000 ? 'mid' : 'big'; }
// builds the stands for non-bowl grounds; returns the rake list used for the 3D crowd and other placements
function buildStands3d(T3, scene, o) {
  const { kind, roofM, wallM, ct, hc, ac, fill } = o; const L = P3.L, W = P3.W; const stands = [];
  const mk = (p) => {
    const g = stand3(T3, scene, { w: p.w, d: p.d, h: p.h, tex: ct(p.side ? ac : hc, p.side ? Math.min(1, fill + .1) : fill, p.side), roofM, wallM, x: p.x, z: p.z, ry: p.ry });
    if (p.y0) g.position.y = p.y0; if (p.noRoof) g.children.forEach(c => { if (c.geometry && c.geometry.parameters && Math.abs(c.geometry.parameters.height - .6) < .01) c.visible = false; });
    standDetail(T3, g, p); stands.push(Object.assign({ y0: p.y0 || 0, g }, p)); return g;
  };
  if (kind === 'small') {
    const dz = W / 2 + 4.5, dx = L / 2 + 5.5;
    mk({ w: L * .7, d: 14, h: 9, x: 0, z: -dz, ry: 0, side: 0, main: true });
    mk({ w: L * .8, d: 9, h: 5.5, x: 0, z: dz, ry: Math.PI, side: 0 });
    mk({ w: W * .85, d: 10, h: 5, x: -dx, z: 0, ry: Math.PI / 2, side: 0, terrace: true });
    mk({ w: W * .7, d: 8, h: 4.5, x: dx, z: 0, ry: -Math.PI / 2, side: 1 });
  } else if (kind === 'mid') {
    const dz = W / 2 + 6, dx = L / 2 + 7;
    mk({ w: L + 10, d: 22, h: 15, x: 0, z: -dz, ry: 0, side: 0, main: true });
    mk({ w: L + 10, d: 18, h: 12, x: 0, z: dz, ry: Math.PI, side: 0 });
    mk({ w: W + 8, d: 18, h: 12, x: -dx, z: 0, ry: Math.PI / 2, side: 0 });
    mk({ w: W + 8, d: 18, h: 12, x: dx, z: 0, ry: -Math.PI / 2, side: 1 });
  } else {
    const dz = W / 2 + 6, dx = L / 2 + 7;
    const sides = [{ w: L + 14, x: 0, z: -dz, ry: 0, side: 0, main: true }, { w: L + 14, x: 0, z: dz, ry: Math.PI, side: 0 }, { w: W + 12, x: -dx, z: 0, ry: Math.PI / 2, side: 0 }, { w: W + 12, x: dx, z: 0, ry: -Math.PI / 2, side: 1 }];
    for (const s of sides) {
      mk(Object.assign({}, s, { d: 16, h: 10, noRoof: true }));
      // upper tier: set back and raised, with a band of glass boxes between the tiers
      const c = Math.cos(s.ry), sn = Math.sin(s.ry), back = 13; const ux = s.x - sn * back, uz = s.z - c * back;
      mk(Object.assign({}, s, { x: ux, z: uz, d: 18, h: 14, y0: 12, upper: true }));
      glassBand(T3, scene, s, back);
    }
  }
  return stands;
}
// stairways, vomitories and roof trusses on one stand (children of its group, in its local frame)
function standDetail(T3, g, p) {
  const a = Math.atan2(p.h, p.d), len = Math.hypot(p.d, p.h); const n = [0, Math.sin(a), Math.cos(a)];
  const stairM = new T3.MeshLambertMaterial({ color: '#8a8f99' }), vomM = new T3.MeshBasicMaterial({ color: '#0b0d12' }), trussM = new T3.MeshLambertMaterial({ color: '#5d6472' });
  const nStairs = Math.max(2, Math.floor(p.w / 14));
  for (let i = 1; i < nStairs; i++) { const x = -p.w / 2 + i * p.w / nStairs; const st = new T3.Mesh(new T3.PlaneGeometry(1.1, len), stairM); st.rotation.x = -a; st.position.set(x, p.h / 2 + n[1] * .06, -p.d / 2 + 1 + n[2] * .06); g.add(st);
    if (!p.terrace && i % 2) { const v = new T3.Mesh(new T3.PlaneGeometry(2.4, 1.8), vomM); v.rotation.x = -a; v.position.set(x + 2.2, p.h * .45 + n[1] * .08, -p.d * .45 + 1 + n[2] * .08); g.add(v); } }
  if (p.terrace) { // crush barriers across a standing terrace
    for (let r = 1; r < 5; r++) { const u = r * p.d / 5; const bar = new T3.Mesh(new T3.BoxGeometry(p.w - 2, .08, .08), stairM); bar.position.set(0, u * p.h / p.d + 1, 1 - u + .2); g.add(bar); }
  }
  if (!p.noRoof) for (let i = 0; i <= Math.floor(p.w / 10); i++) { const x = -p.w / 2 + i * p.w / Math.floor(p.w / 10); const t = new T3.Mesh(new T3.BoxGeometry(.25, .9, p.d * .85), trussM); t.position.set(x, p.h + 5.3, -p.d * .5); t.rotation.x = .06; g.add(t); }
}
function glassBand(T3, scene, s, back) {
  const glass = new T3.MeshLambertMaterial({ color: '#9fc3d9', transparent: true, opacity: .55 }), warm = new T3.MeshBasicMaterial({ color: '#ffd9a0' }), fr = new T3.MeshLambertMaterial({ color: '#2b303b' });
  const g = new T3.Group(); const w = s.w - 4;
  const band = new T3.Mesh(new T3.BoxGeometry(w, 2.6, .3), fr); band.position.set(0, 11, -14.6); g.add(band);
  const n = Math.floor(w / 4);
  for (let i = 0; i < n; i++) { const x = -w / 2 + 2 + i * 4; const pane = new T3.Mesh(new T3.PlaneGeometry(3.6, 1.9), glass); pane.position.set(x, 11, -14.4); g.add(pane); if (i % 3 !== 1) { const lt = new T3.Mesh(new T3.PlaneGeometry(3.2, 1.2), warm); lt.position.set(x, 11, -14.55); g.add(lt); } }
  g.position.set(s.x, 0, s.z); g.rotation.y = s.ry; scene.add(g);
}
// floodlight pylons at the corners of older, smaller grounds
function pylons3d(T3, scene, kind) {
  if (kind === 'big') return; const m = new T3.MeshLambertMaterial({ color: '#7b818c' }), lamp = new T3.MeshBasicMaterial({ color: '#fffbe6' });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const g = new T3.Group(); const H = 40;
    for (const [lx, lz] of [[-.8, -.8], [.8, -.8], [-.8, .8], [.8, .8]]) { const leg = new T3.Mesh(new T3.BoxGeometry(.18, H, .18), m); leg.position.set(lx * (1 - .0), H / 2, lz); g.add(leg); }
    for (let y = 4; y < H; y += 4) { const b1 = new T3.Mesh(new T3.BoxGeometry(1.7, .1, .1), m); b1.position.set(0, y, -.8); g.add(b1); const b2 = b1.clone(); b2.position.z = .8; g.add(b2); const b3 = new T3.Mesh(new T3.BoxGeometry(.1, .1, 1.7), m); b3.position.set(-.8, y, 0); g.add(b3); const b4 = b3.clone(); b4.position.x = .8; g.add(b4); }
    const head = new T3.Mesh(new T3.BoxGeometry(5, 3, .5), m); head.position.set(0, H + 1.5, 0); g.add(head);
    for (let i = 0; i < 8; i++) { const l = new T3.Mesh(new T3.PlaneGeometry(.9, .9), lamp); l.position.set(-1.8 + (i % 4) * 1.2, H + .9 + Math.floor(i / 4) * 1.2, .26); g.add(l); }
    g.position.set(sx * (P3.L / 2 + 16), 0, sz * (P3.W / 2 + 16)); g.lookAt(0, 0, 0); g.rotation.x = 0; g.rotation.z = 0; scene.add(g);
  }
}
// tunnel with an extending cover, technical areas, goal stanchions
function pitchDetail3d(T3, scene, kits) {
  const white = new T3.MeshBasicMaterial({ color: '#ffffff' });
  const tun = new T3.Mesh(new T3.CylinderGeometry(1.8, 1.8, 7, 16, 1, true, 0, Math.PI), new T3.MeshLambertMaterial({ color: kits[0].body, side: T3.DoubleSide }));
  tun.rotation.z = Math.PI / 2; tun.rotation.y = Math.PI / 2; tun.position.set(0, .05, -(P3.W / 2 + 5.4)); scene.add(tun);
  const mouth = new T3.Mesh(new T3.PlaneGeometry(3.4, 2.4), new T3.MeshBasicMaterial({ color: '#07080c' })); mouth.position.set(0, 1.2, -(P3.W / 2 + 8.8)); scene.add(mouth);
  // technical areas: dashed white lines in front of each dugout
  for (const cx of [-9, 9]) {
    for (let i = 0; i < 10; i++) { const d = new T3.Mesh(new T3.PlaneGeometry(.6, .1), white); d.rotation.x = -Math.PI / 2; d.position.set(cx - 5 + i * 1.1, .03, -(P3.W / 2 + 1)); scene.add(d); }
    for (const e of [-1, 1]) for (let i = 0; i < 3; i++) { const d = new T3.Mesh(new T3.PlaneGeometry(.1, .6), white); d.rotation.x = -Math.PI / 2; d.position.set(cx + e * 5, .03, -(P3.W / 2 + 1.4 + i * 1.1)); scene.add(d); }
  }
  // goal stanchions: back bars that give the net its shape
  const bar = new T3.MeshLambertMaterial({ color: '#e8e8e8' });
  for (const s of [-1, 1]) { const gx = s * (P3.L / 2 + 2); for (const z of [-3.66, 3.66]) { const st = new T3.Mesh(new T3.CylinderGeometry(.04, .04, 2.4, 6), bar); st.position.set(gx, 1.2, z); scene.add(st); const top = new T3.Mesh(new T3.CylinderGeometry(.035, .035, 2.1, 6), bar); top.rotation.z = Math.PI / 2; top.position.set(gx - s * 1, 2.42, z); scene.add(top); } const bk = new T3.Mesh(new T3.CylinderGeometry(.035, .035, 7.32, 6), bar); bk.rotation.x = Math.PI / 2; bk.position.set(gx, .03, 0); scene.add(bk); }
}
// animated LED perimeter boards: generic messages, the club name and an uploaded badge
function ledTex(T3, home, kit) {
  const [c, g] = cvs(2048, 64); const tid = home.id || ''; const im = typeof BADGE_IMG === 'object' && BADGE_IMG[tid];
  const segs = [[kit.body, kit.trim, String(home.short || home.name || '').toUpperCase()], ['#0b1220', '#ffd23f', 'STADIUM TOURS'], ['#111', '#39e36b', 'TOGETHER WE CAN'], [kit.trim, kit.body, 'MATCHDAY'], ['#0b1220', '#ffffff', 'GAFFER 26/27'], ['#16324f', '#9ff', 'SEASON TICKETS ON SALE']];
  const w = 2048 / segs.length;
  segs.forEach(([bg, fg, txt], i) => { g.fillStyle = bg; g.fillRect(i * w, 0, w, 64); g.fillStyle = fg; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 30; while (fs > 16 && g.measureText(txt).width > w - (im ? 70 : 20)) { fs -= 2; g.font = `bold ${fs}px sans-serif`; } g.fillText(txt, i * w + w / 2 + (im && i === 0 ? 24 : 0), 34); if (im && i === 0) try { g.drawImage(im, i * w + 10, 6, 52, 52); } catch (e) { } });
  const t = new T3.CanvasTexture(c); t.wrapS = T3.RepeatWrapping; t.repeat.set(1.6, 1); return t;
}
function phase10Frame(S3, dt) { if (S3.led) { S3.led.offset.x = (S3.led.offset.x + dt / 1000 * .045) % 1; } }
