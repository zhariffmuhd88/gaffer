// md3dr.js: 3D matchday, Phase 6 — real human models (part 1).
// Players are now a smooth, skinned human body with a skeleton (hips, spine, chest, neck, head, shoulders, upper and
// lower arms, hands, thighs, shins and feet), built in code (no third-party model files, so nothing to license).
// Kit colours and club patterns go on the shirt, shorts and socks; skin tone, hair, beard and boots come from lookOf(p);
// body shape from bodyOf(p). The existing pose system (gait, kicks, headers, tackles, dives, celebrations, ceremonies)
// drives the bones, with knees and elbows bending naturally. Low quality keeps the old block figures, and the game
// falls back to them by itself when frames get slow. Loaded after md3dz.js.

// ---------- skinned geometry builder ----------
function rigGeo(T3) {
  const pos = [], uv = [], si = [], sw = [], idx = {}; // idx: material slot -> triangle indices
  const SEG = 14;
  const B = { hips: 0, spine: 1, chest: 2, neck: 3, head: 4, shL: 5, uaL: 6, faL: 7, hdL: 8, shR: 9, uaR: 10, faR: 11, hdR: 12, thL: 13, snL: 14, ftL: 15, thR: 16, snR: 17, ftR: 18 };
  const vert = (x, y, z, u, v, b0, b1, w) => { pos.push(x, y, z); uv.push(u, v); si.push(b0, b1, 0, 0); sw.push(w, 1 - w, 0, 0); return pos.length / 3 - 1; };
  // a tube through rings {c:[x,y,z], rx, rz, b:[b0,b1], w}; axis along y unless given
  const tube = (rings, slot, capTop, capBot) => {
    const start = pos.length / 3; const L = idx[slot] = idx[slot] || [];
    rings.forEach((r, j) => { for (let i = 0; i <= SEG; i++) { const a = Math.PI + i / SEG * Math.PI * 2; vert(r.c[0] + Math.cos(a) * r.rx, r.c[1], r.c[2] + Math.sin(a) * r.rz, i / SEG, j / (rings.length - 1), r.b[0], r.b[1], r.w); } });
    for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < SEG; i++) { const a = start + j * (SEG + 1) + i, b = a + SEG + 1; L.push(a, b, a + 1, a + 1, b, b + 1); }
    const cap = (r, up) => { const c = vert(r.c[0], r.c[1] + (up ? .01 : -.01), r.c[2], .5, up ? 1 : 0, r.b[0], r.b[1], r.w); const base = start + rings.indexOf(r) * (SEG + 1); for (let i = 0; i < SEG; i++) up ? L.push(base + i, c, base + i + 1) : L.push(base + i, base + i + 1, c); };
    if (capTop) cap(rings[rings.length - 1], true); if (capBot) cap(rings[0], false);
  };
  const ell = (cx, cy, cz, rx, ry, rz, b, slot, n) => { // an ellipsoid bound to one bone
    const start = pos.length / 3; const L = idx[slot] = idx[slot] || []; n = n || 12;
    for (let j = 0; j <= n; j++) { const t = j / n * Math.PI, y = Math.cos(t), s = Math.sin(t); for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; vert(cx + Math.cos(a) * s * rx, cy + y * ry, cz + Math.sin(a) * s * rz, i / n, 1 - j / n, b, b, 1); } }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = start + j * (n + 1) + i, b2 = a + n + 1; L.push(a, a + 1, b2, a + 1, b2 + 1, b2); }
  };
  const R = (y, rx, rz, b0, b1, w, x, z) => ({ c: [x || 0, y, z || 0], rx, rz, b: [b0, b1 == null ? b0 : b1], w: w == null ? 1 : w });
  // torso: shorts (hips) and shirt (spine, chest)
  tube([R(.74, .2, .29, B.hips), R(.86, .2, .3, B.hips), R(1.0, .19, .29, B.hips)], 'shorts', false, true);
  tube([R(.98, .19, .29, B.hips, B.spine, .6), R(1.2, .18, .28, B.spine), R(1.42, .2, .33, B.spine, B.chest, .5), R(1.62, .215, .36, B.chest), R(1.82, .2, .36, B.chest), R(1.92, .15, .25, B.chest), R(1.97, .09, .1, B.chest, B.neck, .5)], 'shirt', true, false);
  tube([R(1.93, .075, .075, B.neck), R(2.06, .07, .07, B.neck, B.head, .5)], 'skin');
  ell(0, 2.23, 0, .2, .235, .19, B.head, 'skin', 14);
  for (const s of [-1, 1]) {
    const L = s < 0; const sh = L ? B.shL : B.shR, ua = L ? B.uaL : B.uaR, fa = L ? B.faL : B.faR, hd = L ? B.hdL : B.hdR, th = L ? B.thL : B.thR, sn = L ? B.snL : B.snR, ft = L ? B.ftL : B.ftR;
    const z = s * .42;
    // sleeve, forearm, hand
    tube([R(1.66, .085, .08, ua, null, 1, 0, z), R(1.85, .095, .095, ua, null, 1, 0, z), R(1.95, .1, .09, B.chest, ua, .5, 0, s * .37)], 'sleeve', true, false);
    tube([R(1.26, .05, .048, fa, null, 1, 0, z), R(1.42, .062, .058, fa, null, 1, 0, z), R(1.56, .066, .062, ua, fa, .5, 0, z), R(1.68, .07, .065, ua, null, 1, 0, z)], 'fore', false, true);
    ell(0, 1.18, z, .06, .08, .05, hd, 'hand', 8);
    // shorts leg, thigh, knee, sock
    const zl = s * .14;
    tube([R(.7, .125, .13, th, null, 1, 0, zl), R(.86, .135, .14, th, B.hips, .7, 0, zl), R(.98, .13, .14, B.hips, null, 1, 0, zl * .8)], 'shorts');
    tube([R(.5, .09, .09, th, sn, .5, 0, zl), R(.6, .1, .1, th, null, 1, 0, zl), R(.72, .118, .12, th, null, 1, 0, zl)], 'thigh');
    tube([R(.1, .055, .055, sn, ft, .6, 0, zl), R(.28, .08, .075, sn, null, 1, 0, zl), R(.4, .088, .085, sn, null, 1, 0, zl), R(.52, .09, .09, sn, th, .6, 0, zl)], 'sock', false, true);
    ell(.07, .05, zl, .15, .055, .065, ft, 'boot', 8);
  }
  const g = new T3.BufferGeometry(); const slots = ['shirt', 'sleeve', 'fore', 'shorts', 'thigh', 'sock', 'skin', 'hand', 'boot']; const all = []; const groups = [];
  slots.forEach((k, m) => { const L = idx[k] || []; groups.push([all.length, L.length, m]); for (const v of L) all.push(v); });
  g.setIndex(all); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
  g.setAttribute('skinIndex', new T3.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new T3.Float32BufferAttribute(sw, 4));
  for (const [s0, n, m] of groups) g.addGroup(s0, n, m); g.computeVertexNormals();
  return { g, slots, B };
}
// bones in bind pose (identity rotations), positions relative to the parent
function rigBones(T3) {
  const mk = (n, x, y, z) => { const b = new T3.Bone(); b.name = n; b.position.set(x, y, z); return b; };
  const hips = mk('hips', 0, .95, 0), spine = mk('spine', 0, .25, 0), chest = mk('chest', 0, .35, 0), neck = mk('neck', 0, .38, 0), head = mk('head', 0, .12, 0);
  hips.add(spine); spine.add(chest); chest.add(neck); neck.add(head);
  const arm = (s) => { const sh = mk('sh', 0, .33, s * .36), ua = mk('ua', 0, 0, s * .06), fa = mk('fa', 0, -.34, 0), hd = mk('hd', 0, -.32, 0); chest.add(sh); sh.add(ua); ua.add(fa); fa.add(hd); return [sh, ua, fa, hd]; };
  const leg = (s) => { const th = mk('th', 0, -.07, s * .14), sn = mk('sn', 0, -.42, 0), ft = mk('ft', 0, -.4, 0); hips.add(th); th.add(sn); sn.add(ft); return [th, sn, ft]; };
  const aL = arm(-1), aR = arm(1), lL = leg(-1), lR = leg(1);
  const bones = [hips, spine, chest, neck, head, ...aL, ...aR, ...lL, ...lR];
  return { bones, hips, spine, chest, neck, head, ua: [aL[1], aR[1]], fa: [aL[2], aR[2]], th: [lL[0], lR[0]], sn: [lL[1], lR[1]], ft: [lL[2], lR[2]] };
}
let _rigGeo = null;
function figureRig(T3, kit, gk, gkCol, num, o) {
  o = o || {}; const L = o.look || lookOf({ id: 'x' + num }); const wx = o.wx || {};
  if (!_rigGeo || _rigGeo.T3 !== T3) { _rigGeo = rigGeo(T3); _rigGeo.T3 = T3; }
  const shirtCol = gk ? gkCol : kit.body; const trimCol = gk ? '#1b1b1b' : kit.trim;
  const stex = !gk && o.pat ? shirtTex(T3, kit, o.pat) : null;
  const M = (c, map) => new T3.MeshLambertMaterial(map ? { map, skinning: true } : { color: c, skinning: true });
  const skin = M(LOOK_SKIN[L.skin]); const shirt = M(shirtCol, stex); const sleeveM = !gk && o.pat === 'sleeves' ? M(kit.trim) : M(shirtCol);
  const mats = [shirt, sleeveM, wx.long ? sleeveM : skin, M(trimCol), wx.snow ? M('#16181d') : skin, M(gk ? shirtCol : kit.body), skin, gk ? M('#dfff3d') : skin, M(LOOK_BOOT[L.boot])];
  const R = rigBones(T3); const mesh = new T3.SkinnedMesh(_rigGeo.g, mats); mesh.add(R.hips); mesh.bind(new T3.Skeleton(R.bones)); mesh.frustumCulled = false; mesh.castShadow = true;
  const g = new T3.Group(); g.rotation.order = 'YZX'; g.add(mesh);
  // hair, beard and face ride on the head bone; numbers, name, crest and armband on the chest and arm
  const hg = new T3.Group(); hg.position.y = -2.05; R.head.add(hg); headDress(T3, hg, L, o.lo, new T3.MeshLambertMaterial({ color: LOOK_SKIN[L.skin] }));
  if (!o.lo) { const mo = new T3.Mesh(new T3.BoxGeometry(.02, .025, .09), new T3.MeshBasicMaterial({ color: '#5a2a24' })); mo.position.set(.2, 2.13, 0); hg.add(mo); }
  const txtCol = gk ? '#111' : (colDist(kit.trim, shirtCol) > 90 ? kit.trim : (colDist('#ffffff', shirtCol) > 120 ? '#ffffff' : '#111111'));
  const chestY = 1.55;
  if (num) { const nb = new T3.Mesh(new T3.PlaneGeometry(.42, .42), new T3.MeshBasicMaterial({ map: numTex(T3, num, txtCol), transparent: true })); nb.position.set(-.225, 1.5 - chestY, 0); nb.rotation.y = -Math.PI / 2; R.chest.add(nb); }
  if (o.name) { const nm = new T3.Mesh(new T3.PlaneGeometry(.56, .14), new T3.MeshBasicMaterial({ map: nameTex(T3, o.name, txtCol), transparent: true })); nm.position.set(-.21, 1.8 - chestY, 0); nm.rotation.y = -Math.PI / 2; R.chest.add(nm); }
  if (o.crest) { const cr = new T3.Mesh(new T3.PlaneGeometry(.17, .17), new T3.MeshBasicMaterial({ map: o.crest, transparent: true })); cr.position.set(.222, 1.75 - chestY, -.15); cr.rotation.y = Math.PI / 2; R.chest.add(cr); }
  const collar = new T3.Mesh(new T3.TorusGeometry(.12, .03, 6, 14), new T3.MeshLambertMaterial({ color: trimCol })); collar.rotation.x = Math.PI / 2; collar.position.y = 1.95 - chestY; R.chest.add(collar);
  if (o.capt) { const band = new T3.Mesh(new T3.CylinderGeometry(.1, .1, .08, 10), new T3.MeshLambertMaterial({ color: colDist('#ffd23f', shirtCol) > 90 ? '#ffd23f' : '#ffffff' })); band.position.y = -.12; R.ua[0].add(band); }
  if (wx.snow) { const sn = new T3.Mesh(new T3.CylinderGeometry(.1, .12, .12, 10), new T3.MeshLambertMaterial({ color: '#16181d' })); sn.position.y = .4; R.chest.add(sn); }
  const B = o.body || { w: 1, h: 1 }; g.scale.set(1.35 * B.w, 1.35 * B.h, 1.35 * B.w);
  g.userData.rig = R; return g;
}
// the pose system (legs/arms/lean/roll/lift) on bones: knees and elbows bend with the swing
function rigPose(f, P) {
  const R = f.rig; const legs = P.legs || [0, 0], arms = P.arms || [[0, 0], [0, 0]];
  const k = f.snap ? 1 : Math.min(1, ((f.dt || 16) / 1000) * 14); f.snap = false; // smooth blending between poses
  const to = (o, ax, v) => { o.rotation[ax] += (v - o.rotation[ax]) * k; };
  for (let i = 0; i < 2; i++) {
    const v = legs[i] || 0; to(R.th[i], 'z', v); to(R.th[i], 'x', P.inside === i + 1 ? (i ? .45 : -.45) : 0); // inside of the foot on passes
    const kn = P.knees ? P.knees[i] : -(Math.max(0, -v) * 1.15 + Math.max(0, v - .9) * .4); to(R.sn[i], 'z', kn); to(R.ft[i], 'z', -kn * .35 - v * .15);
    const a = arms[i] || [0, 0]; to(R.ua[i], 'x', a[0]); to(R.ua[i], 'z', a[1]);
    to(R.fa[i], 'z', P.elbows ? P.elbows[i] : .25 + Math.max(0, a[1]) * .45 + (Math.abs(a[0]) > 1.2 ? .2 : 0));
  }
  const lean = P.lean || 0; const small = Math.max(-.5, Math.min(.5, lean));
  to(R.spine, 'z', small * .35); to(R.chest, 'z', small * .25); to(R.neck, 'z', -small * .3);
  const g = f.g; g.rotation.z += (lean - small * .6 - g.rotation.z) * k; g.rotation.x += ((P.roll || 0) - g.rotation.x) * Math.min(1, k * 1.6); g.position.y += ((P.lift || 0) - g.position.y) * Math.min(1, k * 1.6);
}
// head turns to follow the ball
function rigLook(f, bw) {
  if (!f.rig) return; const p = f.g.position; let d = Math.atan2(-(bw.z - p.z), bw.x - p.x) - f.g.rotation.y;
  while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; d = Math.max(-1.1, Math.min(1.1, d));
  const h = f.rig.head; h.rotation.y += (d - h.rotation.y) * .15;
}
// getting up after a fall
function getUpPose(f, ts) {
  const q = Math.min(1, (ts - f.upT) / 650); if (q >= 1) { f.upT = 0; return null; }
  const r = 1 - q; return { legs: [-1.3 * r, .3 * r], arms: [[-.6 * r, .8 * r], [.6 * r, .8 * r]], roll: 1.45 * Math.max(0, r - .35) / .65, lift: .15 * r, lean: .5 * Math.sin(Math.PI * q) };
}
const _setPoseRig = setPose;
setPose = function (f, P) { if (f && f.rig) return rigPose(f, P); return _setPoseRig(f, P); };
// automatic fallback: if frames are slow with the models, switch to the block figures (unless quality was chosen)
function rigAuto3d(S3, dt) {
  if (!S3.rig || S3.rigOff || UI.v3q) return; S3.rtN = (S3.rtN || 0) + 1; S3.rtS = (S3.rtS || 0) + dt;
  if (S3.rtN === 150) { if (S3.rtS / S3.rtN > 48) { S3.rigOff = true; S3.slow = true; for (const [, f] of S3.figs) { S3.scene.remove(f.g); if (f.sh) S3.scene.remove(f.sh); } S3.figs.clear(); try { toast('3D: simpler players for smoother play on this device.'); } catch (e) { } } }
}
