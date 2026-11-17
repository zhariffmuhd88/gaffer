// md3dy.js: 3D matchday, Phase 4. Loaded after md3dx.js (build3d and frame3d call these helpers).
// E. atmosphere: the crowd sways and jumps on goals, flags and banners in the stands, a tifo before derbies, flares and
//    smoke in the stands when a goal goes in (crowd atmosphere only), confetti for finals and title clinches.
// F. pitch and light: mowing patterns by club, goalmouth wear that grows over the season, a wet sheen in the rain and
//    snow settling at the edges, golden-hour light for early kick-offs, four-way player shadows under floodlights.
// G. camera: drag to orbit and pinch or scroll to zoom, a player cam, slow-motion replays from three angles.
// Club colours only (badges the user uploaded on his own device are used where they exist). Low quality keeps phones
// smooth: fewer flags and flares, no fake floodlight shadows, fewer confetti pieces.

// ---------- F. pitch ----------
function pitchLook3d(M) {
  const tid = M.sides[0].tid; const pats = ['stripes', 'wide', 'checks', 'diag'];
  const pat = tid === 'ARS' ? 'stripes' : pats[hash(String(tid)) % pats.length];
  // season wear: August fresh, worn by spring, re-laid in summer
  let wear = 0; try { const m = +G.date.slice(5, 7), d = +G.date.slice(8, 10); const k = ((m + 4) % 12) + d / 31; wear = Math.max(0, Math.min(1, k / 9.5)); } catch (e) { }
  return { pat, wear };
}
function pitchTex2(T3, o) {
  const [c, g] = cvs(1024, 664); const A = '#2f7d36', B = '#368b3d';
  const sx = 1024 / P3.L, sy = 664 / P3.W, X = (m) => m * sx, Y = (m) => m * sy;
  if (o.pat === 'checks') { for (let i = 0; i < 16; i++) for (let j = 0; j < 10; j++) { g.fillStyle = (i + j) % 2 ? A : B; g.fillRect(i * 64, j * 66.4, 64, 66.4); } }
  else if (o.pat === 'diag') { g.fillStyle = A; g.fillRect(0, 0, 1024, 664); g.save(); g.translate(512, 332); g.rotate(Math.PI / 4); for (let i = -14; i < 14; i++) if (i % 2) { g.fillStyle = B; g.fillRect(i * 60, -900, 60, 1800); } g.restore(); }
  else { const n = o.pat === 'wide' ? 10 : 16, w = 1024 / n; for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? A : B; g.fillRect(i * w, 0, w + 1, 664); } }
  // wear: bare patches in the goalmouths, around the penalty spots and in the centre circle
  if (o.wear > .05) {
    const patch = (x, y, rx, ry, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry)); gr.addColorStop(0, `rgba(122,98,62,${a})`); gr.addColorStop(.6, `rgba(110,104,60,${a * .55})`); gr.addColorStop(1, 'rgba(110,104,60,0)'); g.save(); g.translate(x, y); g.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry)); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, Math.max(rx, ry), 0, 7); g.fill(); g.restore(); };
    const a = .62 * o.wear;
    for (const s of [0, 1]) { const x0 = s ? X(P3.L) : 0, d = s ? -1 : 1; patch(x0 + d * X(3.5), Y(P3.W / 2), X(5.5), Y(7.5), a); patch(x0 + d * X(11), Y(P3.W / 2), X(3), Y(3), a * .7); }
    patch(X(P3.L / 2), Y(P3.W / 2), X(7), Y(5), a * .45);
  }
  // snow: settled along the touchlines and in the corners, the middle cleared
  if (o.snow) {
    for (const [x, y, w, h, dir] of [[0, 0, 1024, 70, 'v'], [0, 594, 1024, 70, 'v2'], [0, 0, 60, 664, 'h'], [964, 0, 60, 664, 'h2']]) {
      const gr = dir === 'v' ? g.createLinearGradient(0, 0, 0, 70) : dir === 'v2' ? g.createLinearGradient(0, 664, 0, 594) : dir === 'h' ? g.createLinearGradient(0, 0, 60, 0) : g.createLinearGradient(1024, 0, 964, 0);
      gr.addColorStop(0, 'rgba(244,247,252,.95)'); gr.addColorStop(1, 'rgba(244,247,252,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    }
    g.fillStyle = 'rgba(244,247,252,.55)'; for (let i = 0; i < 900; i++) { const e = Math.random() < .5; const x = e ? Math.random() * 1024 : (Math.random() < .5 ? Math.random() * 90 : 1024 - Math.random() * 90), y = e ? (Math.random() < .5 ? Math.random() * 90 : 664 - Math.random() * 90) : Math.random() * 664; g.fillRect(x, y, 2, 2); }
  }
  // the lines go on last (groundstaff keep them clear)
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
function pitchMat3d(T3, V, M) {
  const wx = V.meta && V.meta.wx; const o = pitchLook3d(M); o.snow = wx === 'snow';
  const map = pitchTex2(T3, o);
  if (wx === 'rain') return new T3.MeshPhongMaterial({ map, color: '#c9d6c9', shininess: 70, specular: '#56646a' }); // wet sheen
  return new T3.MeshLambertMaterial({ map });
}
// light by kick-off time: golden hour for early kick-offs on clear days
function light3d(S3, V) {
  const meta = V.meta || {}; const night = !!meta.night, wx = meta.wx; if (night || wx === 'rain' || wx === 'snow') return;
  const hr = +String(meta.ko || '15:00').slice(0, 2); const m = +String(G.date || '2026-08-01').slice(5, 7);
  const golden = hr <= 13 || ((m >= 11 || m <= 2) && hr <= 15);
  if (!golden || !S3.sun) return; S3.golden = true;
  try {
    S3.sun.color.set('#ffc786'); S3.sun.intensity = 1.0; S3.sun.position.set(-120, 38, 70);
    if (S3.hemi) { S3.hemi.color.set('#ffe0bd'); S3.hemi.intensity = .7; }
    const sky = new S3.T3.Color('#e8b685'); S3.scene.background = sky; if (S3.scene.fog) S3.scene.fog.color = sky;
  } catch (e) { }
}

// ---------- E. atmosphere ----------
function flagTex(T3, a, b, kind) {
  const [c, g] = cvs(128, 80); g.fillStyle = a; g.fillRect(0, 0, 128, 80); g.fillStyle = b;
  if (kind === 0) for (let i = 0; i < 4; i++) g.fillRect(i * 32 + 16, 0, 16, 80); else if (kind === 1) g.fillRect(0, 26, 128, 28); else { g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 80); g.lineTo(128, 50); g.lineTo(40, 0); g.fill(); }
  return new T3.CanvasTexture(c);
}
function bannerTex(T3, txt, a, b) {
  const [c, g] = cvs(512, 96); g.fillStyle = a; g.fillRect(0, 0, 512, 96); g.fillStyle = b; g.fillRect(0, 0, 512, 10); g.fillRect(0, 86, 512, 10);
  g.font = 'bold 50px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 50; while (fs > 22 && g.measureText(txt).width > 490) { fs -= 2; g.font = `bold ${fs}px sans-serif`; }
  g.fillText(txt, 256, 50); return new T3.CanvasTexture(c);
}
function tifoTex(T3, tid, k) {
  const [c, g] = cvs(1024, 512); const t = T(tid) || {}; const nm = String(t.short || t.name || tid).toUpperCase();
  g.fillStyle = k.body; g.fillRect(0, 0, 1024, 512);
  g.fillStyle = k.trim; for (let i = -4; i < 16; i++) { g.beginPath(); g.moveTo(i * 96, 512); g.lineTo(i * 96 + 48, 512); g.lineTo(i * 96 + 48 + 512, 0); g.lineTo(i * 96 + 512, 0); g.fill(); }
  g.fillStyle = k.body; g.fillRect(140, 120, 744, 272);
  const im = typeof BADGE_IMG === 'object' && BADGE_IMG[tid];
  if (im && im.width) { const s = Math.min(200 / im.width, 200 / im.height); try { g.drawImage(im, 512 - im.width * s / 2, 256 - im.height * s / 2 - 10, im.width * s, im.height * s); } catch (e) { } }
  else { g.fillStyle = k.trim; g.font = 'bold 150px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 150; while (fs > 60 && g.measureText(nm).width > 700) { fs -= 6; g.font = `bold ${fs}px sans-serif`; } g.fillText(nm, 512, 240); }
  g.fillStyle = k.trim; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText('THIS IS OUR HOME', 512, 360);
  return new T3.CanvasTexture(c);
}
function glowMat(T3, inner, outer) {
  const [c, g] = cvs(64, 64); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, inner); r.addColorStop(1, outer); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new T3.SpriteMaterial({ map: new T3.CanvasTexture(c), transparent: true, depthWrite: false, blending: T3.AdditiveBlending });
}
function smokeMat(T3) {
  const [c, g] = cvs(64, 64); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(200,200,205,.55)'); r.addColorStop(1, 'rgba(200,200,205,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new T3.SpriteMaterial({ map: new T3.CanvasTexture(c), transparent: true, depthWrite: false });
}
// a spot in the crowd for side 0 (home) or 1 (away end), with the direction facing the pitch
function crowdPt3d(S3, side, r1, r2) {
  if (S3.bowl) {
    const a0 = P3.L / 2 + 5, b0 = P3.W / 2 + 5; const t = side ? (r1 - .5) * .6 : .45 + r1 * (Math.PI * 2 - .9); const f = .12 + r2 * .7;
    const [x, z] = bowlPt(a0 + 17 * f, b0 + 17 * f, t); return { x, y: .6 + 10.4 * f + .3, z };
  }
  const dz = P3.W / 2 + 6, dx = P3.L / 2 + 7;
  if (side) { const u = 2 + r2 * 13; return { x: dx - 1 + u, y: u * 12 / 18 + .3, z: (r1 - .5) * (P3.W - 4) }; }
  const s = r1 < .38 ? 0 : r1 < .76 ? 1 : 2; const q = (r1 % .38) / .38;
  if (s === 2) { const u = 2 + r2 * 13; return { x: -(dx - 1 + u), y: u * 12 / 18 + .3, z: (q - .5) * (P3.W - 4) }; }
  const d = s ? 18 : 22, h = s ? 12 : 15; const u = 2 + r2 * (d - 6); const zz = (s ? 1 : -1) * (dz - 1 + u); return { x: (q - .5) * (P3.L - 4), y: u * h / d + .3, z: zz };
}
function buildAtmo3d(S3, LM, T3) {
  const V = LM.vis, M = LM.M, kits = V.kits; const lo = S3.lo; const f = G.fx && G.fx[M.fid];
  // waving flags held up in the crowd
  S3.flags3 = []; const nF = lo ? 6 : 16;
  const poleM = new T3.MeshLambertMaterial({ color: '#2a2a2a' });
  for (let i = 0; i < nF; i++) {
    const side = i % 5 === 4 ? 1 : 0; const k = kits[side]; const p = crowdPt3d(S3, side, ((i * 0.618) % 1), ((i * 0.37) % 1) * .8);
    const g = new T3.Group(); const pole = new T3.Mesh(new T3.CylinderGeometry(.04, .04, 3, 5), poleM); pole.position.y = 1.5; g.add(pole);
    const fl = new T3.Mesh(new T3.PlaneGeometry(2.2, 1.3), new T3.MeshLambertMaterial({ map: flagTex(T3, k.body, k.trim, i % 3), side: T3.DoubleSide })); fl.position.set(1.1, 2.3, 0); g.add(fl);
    g.position.set(p.x, p.y, p.z); g.rotation.y = Math.atan2(-p.z, -p.x) + Math.PI / 2; S3.scene.add(g); S3.flags3.push({ g, fl, ph: i * 1.7, base: g.rotation.y });
  }
  // banners on the front of the stands
  const hn = String((T(M.sides[0].tid) || {}).short || M.sides[0].tid).toUpperCase(), an = String((T(M.sides[1].tid) || {}).short || M.sides[1].tid).toUpperCase();
  const msgs = [[0, `COME ON ${hn}`], [0, `${hn} TILL I DIE`], [0, `WE ARE ${hn}`], [0, `${hn} · HOME`], [1, `${an} AWAY DAYS`], [0, `${hn} ALL OVER THE WORLD`]];
  msgs.forEach(([side, txt], i) => {
    const k = kits[side]; const m = new T3.Mesh(new T3.PlaneGeometry(9, 1.6), new T3.MeshBasicMaterial({ map: bannerTex(T3, txt, k.body, k.trim) }));
    let x, z, ry;
    if (S3.bowl) { const a0 = P3.L / 2 + 5, b0 = P3.W / 2 + 5; const t = side ? 0 : [1.2, 2.2, 3.4, 4.3, 0, 5.2][i]; [x, z] = bowlPt(a0 + .4, b0 + .4, t); m.position.set(x, 1.7, z); m.lookAt(0, 1.7, 0); }
    else { const dz = P3.W / 2 + 6, dx = P3.L / 2 + 7; if (side) { x = dx - .8; z = 0; ry = -Math.PI / 2; } else { const sp = [[-30, -1], [10, -1], [30, 1], [-12, 1], [0, 0], [-34, 1]][i]; if (sp[1] === 0) { x = -(dx - .8); z = 6; ry = Math.PI / 2; } else { x = sp[0]; z = sp[1] * (dz - .8); ry = sp[1] < 0 ? 0 : Math.PI; } } m.position.set(x, 1.7, z); m.rotation.y = ry; }
    S3.scene.add(m);
  });
  // tifo for derbies, shown at kick-off at the home end
  if (typeof isRival === 'function' && isRival(M.sides[0].tid, M.sides[1].tid)) {
    const tex = tifoTex(T3, M.sides[0].tid, kits[0]); const mat = new T3.MeshBasicMaterial({ map: tex, transparent: true, side: T3.DoubleSide });
    let m;
    if (S3.bowl) { const a0 = P3.L / 2 + 5; m = new T3.Mesh(new T3.PlaneGeometry(46, 19), mat); m.rotation.order = 'YXZ'; m.rotation.y = Math.PI / 2; m.rotation.x = -Math.atan2(10.4, 17); m.position.set(-(a0 + 8.2), 6.4, 0); }
    else { const dx = P3.L / 2 + 7; const a = Math.atan2(12, 18); m = new T3.Mesh(new T3.PlaneGeometry(P3.W + 4, Math.hypot(18, 12) - 1.5), mat); m.rotation.order = 'YXZ'; m.rotation.y = Math.PI / 2; m.rotation.x = -a; m.position.set(-(dx + 8) + Math.cos(a) * .35, 6 + Math.sin(a) * .35, 0); }
    S3.scene.add(m); S3.tifo = m;
  }
  // flares and smoke for goals (crowd atmosphere), pooled
  S3.flares = []; const nfl = lo ? 3 : 6; const fm = glowMat(T3, 'rgba(255,90,40,1)', 'rgba(255,60,20,0)'), sm = smokeMat(T3);
  for (let i = 0; i < nfl; i++) { const fs = new T3.Sprite(fm.clone()); fs.scale.set(3, 3, 1); fs.visible = false; S3.scene.add(fs); const smk = []; for (let j = 0; j < (lo ? 3 : 6); j++) { const s = new T3.Sprite(sm.clone()); s.visible = false; S3.scene.add(s); smk.push(s); } S3.flares.push({ fs, smk, t0: -1e9, p: null }); }
  // crowd textures sway; the scoring side jumps
  S3.crowd = S3.crowd || [];
  // confetti (built when needed)
  S3.final = !!(f && f.rnd === 'Final');
  // fake floodlight shadows: four soft shadows per player at night
  if (V.meta && V.meta.night && !lo) {
    const [c, g] = cvs(128, 128); g.translate(64, 64);
    for (let i = 0; i < 4; i++) { g.save(); g.rotate(Math.PI / 4 + i * Math.PI / 2); const gr = g.createLinearGradient(0, 0, 58, 0); gr.addColorStop(0, 'rgba(0,0,0,.42)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(29, 0, 29, 7, 0, 0, 7); g.fill(); g.restore(); }
    S3.sh4 = new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(c), transparent: true, depthWrite: false }); S3.sh4g = new T3.PlaneGeometry(7, 7);
    try { if (S3.sun) S3.sun.castShadow = false; } catch (e) { }
  }
  light3d(S3, V);
  camInput3d(S3);
}
function confetti3d(S3, side) {
  const T3 = S3.T3; const n = S3.lo ? 500 : 1600; const k = S3.kits[side]; const pal = [k.body, k.trim, '#ffd23f', '#ffffff'].map(c => new T3.Color(c));
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * (P3.L + 20); pos[i * 3 + 1] = 5 + Math.random() * 40; pos[i * 3 + 2] = (Math.random() - .5) * (P3.W + 20); const cc = pal[i % pal.length]; col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b; }
  const geo = new T3.BufferGeometry(); geo.setAttribute('position', new T3.BufferAttribute(pos, 3)); geo.setAttribute('color', new T3.BufferAttribute(col, 3));
  const pts = new T3.Points(geo, new T3.PointsMaterial({ size: .55, vertexColors: true })); S3.scene.add(pts); S3.conf = { pts, n };
}
function titleClinch3d(LM) {
  try {
    const M = LM.M; const f = G.fx[M.fid]; if (!f || f.rnd || !M.done) return null; const div = divOf(M.sides[0].tid); if (!div || typeof tableOf !== 'function') return null;
    const rows = tableOf(div).map(r => ({ ...r })); if (!rows.length) return null;
    if (!f.r) { const [a, b] = M.score; const H = rows.find(r => r.t === f.h), A = rows.find(r => r.t === f.a); if (H && A) { H.p++; A.p++; H.pts += a > b ? 3 : a === b ? 1 : 0; A.pts += b > a ? 3 : a === b ? 1 : 0; } rows.sort((x, y) => y.pts - x.pts); }
    const tot = (rows.length - 1) * 2; const top = rows[0], sec = rows[1]; if (!sec) return null;
    if (top.pts - sec.pts > 3 * (tot - sec.p) && (top.t === f.h || top.t === f.a)) return top.t === f.h ? 0 : 1;
  } catch (e) { } return null;
}
function atmo3d(S3, LM, SC, cs, celeb, ts, dt) {
  const V = LM.vis, M = LM.M;
  // crowd sway; the scoring side's stands jump while they celebrate
  const jump = celeb && !V.rp ? celeb.side : -1;
  for (const c of S3.crowd || []) { const j = c.side === jump; c.tex.offset.y = j ? Math.abs(Math.sin(ts / 110 + c.ph)) * .028 : Math.sin(ts / 900 + c.ph) * .003; if (j) c.tex.offset.x = (c.ox || 0) + Math.sin(ts / 170 + c.ph) * .004; }
  for (const fl of S3.flags3 || []) { const wave = jump >= 0 ? 1.8 : 1; fl.fl.rotation.y = Math.sin(ts / 260 * wave + fl.ph) * .45; fl.g.rotation.z = Math.sin(ts / 900 + fl.ph) * .18 * wave; fl.g.rotation.y = fl.base + Math.sin(ts / 1400 + fl.ph) * .3; }
  // tifo: up for the walk-out and kick-off, folded away after a couple of minutes
  if (S3.tifo) { const on = M.min <= 2 && !M.done; const m = S3.tifo.material; m.opacity += ((on ? 1 : 0) - m.opacity) * .04; S3.tifo.visible = m.opacity > .02; }
  // flares and smoke when a goal goes in
  if (celeb && !V.rp && S3.flareGoal !== celeb.e) {
    S3.flareGoal = celeb.e; const side = celeb.side; S3.flares.forEach((fl, i) => { fl.t0 = ts + i * 280; fl.p = crowdPt3d(S3, side === 0 ? 0 : 1, Math.random(), Math.random() * .7); });
  }
  for (const fl of S3.flares || []) {
    const age = (ts - fl.t0) / 1000; const on = age >= 0 && age < 9 && fl.p;
    fl.fs.visible = !!on; if (on) { fl.fs.position.set(fl.p.x, fl.p.y + 1.6, fl.p.z); const fk = .8 + Math.random() * .4; fl.fs.scale.set(3.2 * fk, 3.2 * fk, 1); fl.fs.material.opacity = Math.min(1, (9 - age) / 2); }
    fl.smk.forEach((s, j) => { const a = age - j * .5; const vis = on && a > 0; s.visible = !!vis; if (vis) { const r = (a % 4) / 4; s.position.set(fl.p.x + Math.sin(j + a) * 1.2, fl.p.y + 2 + r * 9, fl.p.z + Math.cos(j) * .8); const sc = 2 + r * 6; s.scale.set(sc, sc, 1); s.material.opacity = (1 - r) * .55 * Math.min(1, (9 - age) / 2); } });
  }
  // confetti: final whistle of a final (winners' colours), or the day the title is won
  if (M.done && !S3.conf && S3.confChecked !== true) {
    S3.confChecked = true; const [a, b] = M.score; let side = null;
    if (S3.final) side = a > b ? 0 : b > a ? 1 : (M.pens ? (M.pens[0] > M.pens[1] ? 0 : 1) : null);
    else { const c = titleClinch3d(LM); if (c != null && ((c === 0 && a >= b) || (c === 1 && b >= a))) side = c; }
    if (side != null) try { confetti3d(S3, side); } catch (e) { console.error(e); }
  }
  if (S3.conf) { const pa = S3.conf.pts.geometry.attributes.position; const arr = pa.array; const s = Math.min(.12, dt / 1000 * 3); for (let i = 0; i < S3.conf.n; i++) { arr[i * 3 + 1] -= s * (1 + (i % 5) * .2); arr[i * 3] += Math.sin(ts / 600 + i) * .02; if (arr[i * 3 + 1] < .05) arr[i * 3 + 1] = 38 + Math.random() * 6; } pa.needsUpdate = true; }
  // four soft shadows under the floodlights
  if (S3.sh4) for (const [e, f] of S3.figs) {
    if (!f.sh) { f.sh = new S3.T3.Mesh(S3.sh4g, S3.sh4); f.sh.rotation.x = -Math.PI / 2; S3.scene.add(f.sh); }
    f.sh.visible = f.g.visible; if (f.g.visible) f.sh.position.set(f.g.position.x, .03, f.g.position.z);
  }
}

// ---------- G. camera ----------
function camInput3d(S3) {
  const el = S3.ren && S3.ren.domElement; if (!el || !el.addEventListener) return;
  try { el.style.touchAction = 'pan-y'; el.style.cursor = 'grab'; } catch (e) { }
  const pts = new Map(); let pinch0 = null;
  const start = () => { if (!S3.free && S3.camPos && S3.look) { const dx = S3.camPos.x - S3.look.x, dy = S3.camPos.y - S3.look.y, dz = S3.camPos.z - S3.look.z; const d = Math.hypot(dx, dy, dz) || 40; S3.free = { yaw: Math.atan2(dz, dx), pitch: Math.asin(Math.max(-1, Math.min(1, dy / d))), dist: d }; } };
  el.addEventListener('pointerdown', (ev) => { pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); try { el.setPointerCapture(ev.pointerId); } catch (e) { } if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: S3.free ? S3.free.dist : null }; } });
  el.addEventListener('pointermove', (ev) => {
    const p = pts.get(ev.pointerId); if (!p) return; const dx = ev.clientX - p.x, dy = ev.clientY - p.y; p.x = ev.clientX; p.y = ev.clientY;
    if (pts.size === 1) { if (Math.abs(dx) + Math.abs(dy) < 1) return; start(); if (!S3.free) return; S3.free.yaw -= dx * .006; S3.free.pitch = Math.max(.06, Math.min(1.45, S3.free.pitch + dy * .005)); S3.dragged = true; }
    else if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); start(); if (!S3.free) return; S3.free.dist = Math.max(8, Math.min(140, (pinch0.dist || S3.free.dist) * pinch0.d / Math.max(20, d))); }
  });
  const up = (ev) => { pts.delete(ev.pointerId); if (pts.size < 2) pinch0 = null; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', (ev) => { start(); if (!S3.free) return; ev.preventDefault(); S3.free.dist = Math.max(8, Math.min(140, S3.free.dist * (ev.deltaY > 0 ? 1.1 : .9))); }, { passive: false });
  el.addEventListener('dblclick', () => { S3.free = null; });
}
// replays: three angles in slow motion (side-on low, behind the goal, reverse angle)
function replayCam3d(S3, SC, bw) {
  const q = SC.end ? SC.t / SC.end : 0; const ang = q < .4 ? 0 : q < .74 ? 1 : 2; const sgn = S3.rpSgn || (bw.x >= 0 ? 1 : -1);
  if (S3.rpSC !== SC) { S3.rpSC = SC; let gx = 0; for (const st of SC.plan || []) if (st.k === 'shot' && st.to) gx = st.to.x; S3.rpSgn = sgn; try { const sh = (SC.plan || []).find(st => st.k === 'shot'); if (sh && sh.side != null) S3.rpSgn = goalX(sh.side) > .5 ? 1 : -1; } catch (e) { } }
  const s = S3.rpSgn || sgn; let want, look;
  if (ang === 0) { want = { x: bw.x - s * 14, y: 4.5, z: bw.z - 18 }; look = { x: bw.x + s * 6, y: 1.2, z: bw.z }; }
  else if (ang === 1) { want = { x: s * (P3.L / 2 + 9), y: 6.5, z: bw.z * .3 }; look = { x: bw.x, y: 1, z: bw.z }; }
  else { want = { x: bw.x - s * 7, y: 2.8, z: bw.z + 15 }; look = { x: bw.x + s * 4, y: 1.3, z: bw.z }; }
  return { want, look, ang };
}
function playerCam3d(S3, SC) {
  if (S3.mode !== 'player') return null; const id = UI.v3pl; let e = null;
  for (const k of S3.figs.keys()) if (k.p && k.p.id === id && S3.figs.get(k).g.visible) { e = k; break; }
  if (!e) for (const [k, f] of S3.figs) if (f.g.visible && f.sd === 0 && k.role !== 'GK') { e = k; UI.v3pl = k.p.id; break; }
  if (!e) return null; const f = S3.figs.get(e); const p = f.g.position; const r = f.g.rotation.y; const fx = Math.cos(r), fz = -Math.sin(r);
  return { want: { x: p.x - fx * 9, y: 4.6, z: p.z - fz * 9 }, look: { x: p.x + fx * 8, y: 1.2, z: p.z + fz * 8 } };
}
function freeCam3d(S3, look) { const F = S3.free; const c = Math.cos(F.pitch); return { x: look.x + Math.cos(F.yaw) * c * F.dist, y: Math.max(1.5, look.y + Math.sin(F.pitch) * F.dist), z: look.z + Math.sin(F.yaw) * c * F.dist }; }
// the player picker shown with the Player cam
function playerPick3d(LM) {
  const M = LM.M; const s = M.sides.findIndex(x => x.tid === G.user); const S = M.sides[s < 0 ? 0 : s];
  const ps = S.ps.filter(e => e.on); return `<select class="f" data-m3pl="1" aria-label="Player to follow" style="max-width:170px;padding:4px 6px">${ps.map(e => `<option value="${esc(e.p.id)}"${UI.v3pl === e.p.id ? ' selected' : ''}>${esc((e.p.no ? e.p.no + ' ' : '') + surname(e.p.n || ''))}</option>`).join('')}</select>`;
}
document.addEventListener('change', (ev) => { const el = ev.target; if (el && el.dataset && el.dataset.m3pl) { UI.v3pl = el.value; const LM = UI.match; if (LM && LM.v3s) LM.v3s.camPos = null; } });
