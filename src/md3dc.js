// md3dc.js: 3D matchday, Phase 9 — a real 3D crowd. Loaded after md3dp.js.
// Thousands of fans as instanced figures (one draw call for bodies, one for heads) on every stand, in a mix of club
// shirts, the second colour and everyday clothes, with the away fans in their end; empty seats in thin crowds. Their
// motion runs in the GPU (a time uniform): a slow sway, standing up when their team attacks, jumping on goals.
// Near the pitch: stewards in hi-vis facing the crowd, photographers crouched behind the goals, open dugouts with padded
// seats and the substitutes sitting in them, and two substitutes per side warming up in bibs.
// Choosing Low quality by hand keeps the painted crowd only; phones get a lighter crowd; slow devices drop it.

function crowdCount(S3) { if (UI.v3q === 'lo') return 0; return S3.lo ? 2600 : 9000; }
// seat positions: [x, y, z, facing, side]
function crowdSpots(S3, LM) {
  const out = []; const M = LM.M; const fill = Math.min(1, Math.max(.35, (LM.vis.meta && LM.vis.meta.att && LM.vis.meta.cap) ? LM.vis.meta.att / LM.vis.meta.cap : .93));
  const keep = (k) => (hash('s' + k) % 1000) / 1000 < fill;
  if (S3.bowl) {
    const a0 = P3.L / 2 + 5, b0 = P3.W / 2 + 5; let k = 0;
    const tier = (d0, d1, y0, y1, rows) => {
      for (let r = 0; r < rows; r++) {
        const f = (r + .5) / rows, da = d0 + (d1 - d0) * f, y = y0 + (y1 - y0) * f; const per = 2 * (a0 + b0 + 2 * da) * 1.15; const n = Math.floor(per / .95);
        for (let i = 0; i < n; i++) { const t = (i + (r % 2) * .5) / n * Math.PI * 2; const [x, z] = bowlPt(a0 + da, b0 + da, t); if (!keep(++k)) continue; const away = Math.abs(Math.atan2(Math.sin(t), Math.cos(t))) < .3; out.push([x, y + .1, z, Math.atan2(-x, -z), away ? 1 : 0]); }
      }
    };
    tier(.8, 16.5, .6, 10.6, 13); tier(18.8, 36.5, 14.7, 30.6, 14);
  } else {
    let k = 0; const stands = S3.stands || [];
    for (const s of stands) {
      const rows = Math.floor((s.d - 2) / (s.terrace ? .8 : 1.05)), cols = Math.floor((s.w - 3) / (s.terrace ? .7 : .9)); const c = Math.cos(s.ry), sn = Math.sin(s.ry);
      for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) {
        if (!keep(++k)) continue; const u = 1.4 + r * 1.05, lx = -s.w / 2 + 1.5 + i * .9 + (r % 2) * .45, lz = 1 - u, y = u * s.h / s.d + .15;
        out.push([s.x + lx * c + lz * sn, y + (s.y0 || 0), s.z - lx * sn + lz * c, s.ry, s.side]);
      }
    }
  }
  return out;
}
function crowdMat(T3, U) {
  const m = new T3.MeshLambertMaterial({ color: '#ffffff' }); m.userData.pbr = true; // keep this material out of the PBR swap
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.uTime; sh.uniforms.uJ0 = U.uJ0; sh.uniforms.uJ1 = U.uJ1; sh.uniforms.uS0 = U.uS0; sh.uniforms.uS1 = U.uS1;
    sh.vertexShader = 'attribute float aPh; attribute float aSide; uniform float uTime, uJ0, uJ1, uS0, uS1;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float sj = mix(uJ0, uJ1, aSide); float ss = mix(uS0, uS1, aSide);
      transformed.y += ss * .42 + sin(uTime * 1.3 + aPh) * .03 + sj * abs(sin(uTime * 7.5 + aPh * 3.0)) * .55;
      transformed.x += sin(uTime * .7 + aPh * 2.0) * .03;`);
  };
  return m;
}
function buildCrowd3d(S3, LM) {
  const T3 = S3.T3; const N = crowdCount(S3); if (!N || !T3.InstancedMesh) return;
  let spots = crowdSpots(S3, LM); if (spots.length > N) { const step = spots.length / N; spots = Array.from({ length: N }, (_, i) => spots[Math.floor(i * step)]); }
  const n = spots.length; if (!n) return;
  const U = { uTime: { value: 0 }, uJ0: { value: 0 }, uJ1: { value: 0 }, uS0: { value: 0 }, uS1: { value: 0 } };
  const body = new T3.BoxGeometry(.5, .78, .32); body.translate(0, .55, 0);
  const head = new T3.SphereGeometry(.15, 6, 5); head.translate(0, 1.1, 0);
  const ph = new Float32Array(n), sd = new Float32Array(n); for (let i = 0; i < n; i++) { ph[i] = (hash('p' + i) % 628) / 100; sd[i] = spots[i][4]; }
  for (const g of [body, head]) { g.setAttribute('aPh', new T3.InstancedBufferAttribute(ph, 1)); g.setAttribute('aSide', new T3.InstancedBufferAttribute(sd, 1)); }
  const mB = new T3.InstancedMesh(body, crowdMat(T3, U), n), mH = new T3.InstancedMesh(head, crowdMat(T3, U), n);
  const o = new T3.Object3D(); const col = new T3.Color(); const kits = S3.kits;
  const every = ['#1d2433', '#3b3f46', '#111111', '#e8e8e8', '#6b5a43', '#2f4f6f', '#7a1f2b', '#5a6b3c'];
  for (let i = 0; i < n; i++) {
    const [x, y, z, ry, side] = spots[i]; o.position.set(x, y, z); o.rotation.set(0, ry, 0); const s = .92 + (hash('z' + i) % 16) / 100; o.scale.set(s, s, s); o.updateMatrix();
    mB.setMatrixAt(i, o.matrix); mH.setMatrixAt(i, o.matrix);
    const r = hash('c' + i) % 100; const k = kits[side] || kits[0];
    col.set(r < 52 ? k.body : r < 66 ? k.trim : every[r % every.length]); col.convertSRGBToLinear(); mB.setColorAt(i, col);
    col.set(LOOK_SKIN[hash('h' + i) % LOOK_SKIN.length]); col.convertSRGBToLinear(); mH.setColorAt(i, col);
  }
  for (const m of [mB, mH]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.frustumCulled = false; S3.scene.add(m); }
  S3.fans = { U, mB, mH, n, j: [0, 0], s: [0, 0] };
}
// fans react: stand up when their team attacks, jump on goals
function crowd3d(S3, LM, SC, cs, celeb, ts) {
  const F = S3.fans; if (!F) return; if (S3.slow) { F.mB.visible = F.mH.visible = false; return; }
  const V = LM.vis, M = LM.M; F.U.uTime.value = ts / 1000;
  const tj = [0, 0], tst = [0, 0];
  if (celeb && !V.rp) tj[celeb.side] = 1;
  if (cs && !V.rp && (cs.k === 'shot' || cs.k === 'cross' || cs.k === 'header')) { const s = cs.side != null ? cs.side : (SC.poss != null ? SC.poss : null); if (s != null) tst[s] = 1; }
  if (S3.fly && !S3.flyDone) tst[0] = tst[1] = 1; // up for the teams coming out
  if (M.done) { const [a, b] = M.score; if (a > b) tst[0] = 1; else if (b > a) tst[1] = 1; }
  for (let s = 0; s < 2; s++) { F.j[s] += (tj[s] - F.j[s]) * .08; F.s[s] += (Math.max(tst[s], tj[s]) - F.s[s]) * .05; }
  F.U.uJ0.value = F.j[0]; F.U.uJ1.value = F.j[1]; F.U.uS0.value = F.s[0]; F.U.uS1.value = F.s[1];
}
// ---------- near the pitch ----------
function buildPitchside3d(S3, LM) {
  const T3 = S3.T3, M = LM.M, V = LM.vis; const fig = (kit, id, o) => { const g = (S3.rig && !S3.lo ? figureRig : figure)(T3, kit, false, null, 0, Object.assign({ look: lookOf({ id }), lo: S3.lo }, o || {})); g.traverse(m => { if (m.isMesh) m.castShadow = false; }); S3.scene.add(g); return { g, rig: g.userData && g.userData.rig, ph: hash(id) % 6, v: 0, last: null }; };
  S3.side3 = [];
  // stewards in hi-vis, facing the crowd
  const hv = { body: '#d8ff21', trim: '#2a2a2a' }; const nSt = S3.lo ? 6 : 12;
  for (let i = 0; i < nSt; i++) { const top = i % 2; const x = -P3.L / 2 + 8 + (i >> 1) * (P3.L - 16) / Math.max(1, (nSt >> 1) - 1); const f = fig(hv, 'st' + i); f.g.position.set(x, 0, (top ? 1 : -1) * (P3.W / 2 + 3.6)); f.g.rotation.y = top ? -Math.PI / 2 : Math.PI / 2; S3.side3.push({ f, k: 'st' }); }
  // photographers crouched behind each goal
  const camM = new T3.MeshLambertMaterial({ color: '#111111' }); const ph = { body: '#2b2e36', trim: '#2b2e36' };
  for (const sg of [-1, 1]) for (let i = 0; i < (S3.lo ? 3 : 6); i++) { const z = (i < 3 ? -1 : 1) * (6 + (i % 3) * 3.5); const f = fig(ph, 'ph' + sg + i); f.g.position.set(sg * (P3.L / 2 + 3.4), 0, z); f.g.rotation.y = sg > 0 ? Math.PI : 0; const cam = new T3.Mesh(new T3.BoxGeometry(.35, .3, .3), camM); cam.position.set(.4, 1.55, 0); f.g.add(cam); const lens = new T3.Mesh(new T3.CylinderGeometry(.08, .09, .45, 8), camM); lens.rotation.z = Math.PI / 2; lens.position.set(.75, 1.55, 0); f.g.add(lens); S3.side3.push({ f, k: 'ph' }); }
  // open dugouts with padded seats (the old solid boxes are hidden)
  S3.scene.children.forEach(o => { if (o.isMesh && o.geometry && o.geometry.parameters && o.geometry.parameters.width === 8 && o.geometry.parameters.height === 2.2) o.visible = false; });
  const shell = new T3.MeshLambertMaterial({ color: '#d9dde3', transparent: true, opacity: .55 }), frame = new T3.MeshLambertMaterial({ color: '#2a2f3a' });
  for (let s = 0; s < 2; s++) {
    const cx = s ? 9 : -9, z0 = -(P3.W / 2 + 4.6); const seatM = new T3.MeshLambertMaterial({ color: S3.kits[s].body });
    const back = new T3.Mesh(new T3.BoxGeometry(9, 2.6, .15), frame); back.position.set(cx, 1.3, z0 - 1.1); S3.scene.add(back);
    const roof = new T3.Mesh(new T3.BoxGeometry(9.2, .1, 2.6), shell); roof.position.set(cx, 2.7, z0); roof.rotation.x = -.12; S3.scene.add(roof);
    for (const e of [-1, 1]) { const sd = new T3.Mesh(new T3.BoxGeometry(.1, 2.6, 2.4), shell); sd.position.set(cx + e * 4.55, 1.3, z0); S3.scene.add(sd); }
    for (let i = 0; i < 8; i++) { const st = new T3.Mesh(new T3.BoxGeometry(.9, .5, .7), seatM); st.position.set(cx - 3.6 + i * 1.03, .55, z0 - .55); S3.scene.add(st); const bk = new T3.Mesh(new T3.BoxGeometry(.9, .9, .15), seatM); bk.position.set(cx - 3.6 + i * 1.03, 1.15, z0 - .95); S3.scene.add(bk); }
    // the substitutes sitting in the dugout (up to six) and two warming up in bibs
    const subs = (M.sides[s].bench || []).slice(0, 6).map(p => ({ p })); const kit = S3.kits[sideOf(V, M, M.sides[s].ps[0])] || S3.kits[s];
    subs.forEach((e, i) => { const f = fig({ body: '#1b1f29', trim: kit.body }, e.p.id, { look: lookOf(e.p) }); f.g.position.set(cx - 3.6 + i * 1.03 + (i > 2 ? 1.03 : 0), .32, z0 - .4); f.g.rotation.y = -Math.PI / 2; setPose(f, { legs: [1.45, 1.45], knees: [-1.5, -1.5], arms: [[-.15, .5], [.15, .5]] }); f.snap = true; setPose(f, { legs: [1.45, 1.45], knees: [-1.5, -1.5], arms: [[-.15, .5], [.15, .5]] }); S3.side3.push({ f, k: 'sub' }); });
    const bib = s ? '#ff7a1a' : '#39e36b';
    for (let i = 0; i < 2; i++) { const e = (M.sides[s].bench || []).map(p => ({ p }))[6 + i]; const f = fig({ body: bib, trim: '#ffffff' }, e ? e.p.id : 'w' + s + i, e ? { look: lookOf(e.p) } : {}); f.g.position.set(s ? 30 : -30, 0, P3.W / 2 + 2.9); S3.side3.push({ f, k: 'warm', s, i, x0: s ? 30 : -30 }); }
  }
}
function pitchside3d(S3, ts, dt) {
  for (const o of S3.side3 || []) {
    const f = o.f; f.dt = dt;
    if (o.k === 'warm') { const x = o.x0 + Math.sin(ts / 2600 + o.i * 1.7) * 9; const prev = f.g.position.x; f.g.position.x = x; f.g.position.z = P3.W / 2 + 2.9 + o.i * 1.2; const v = Math.abs(x - prev) / Math.max(.001, dt / 1000); f.v = f.v * .8 + v * .2; f.g.rotation.y = x > prev ? 0 : Math.PI; gait3d(f, dt); }
    else if (o.k === 'st') { if (f.rig) f.rig.head.rotation.y = Math.sin(ts / 3000 + f.ph) * .4; }
    else if (o.k === 'ph') setPose(f, { legs: [-1.3, .4], knees: [-1.4, -.6], arms: [[-.3, 1.4], [.3, 1.4]], lean: .1, lift: -.35 });
  }
}
function phase9Build(S3, LM) { try { buildCrowd3d(S3, LM); } catch (e) { console.error(e); } try { buildPitchside3d(S3, LM); } catch (e) { console.error(e); } }
function phase9Frame(S3, LM, SC, cs, celeb, ts, dt) { try { crowd3d(S3, LM, SC, cs, celeb, ts); pitchside3d(S3, ts, dt); } catch (e) { console.error(e); } }
