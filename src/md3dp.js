// md3dp.js: 3D matchday, Phase 8 — modern rendering. Loaded after md3dr.js.
// Colour pipeline: sRGB output with ACES filmic tone mapping; every colour and canvas texture is converted to linear so
// the picture keeps its colours. High quality: physically based materials (roughness) for players, ball, pitch and
// stands, soft shadows (PCF soft, larger map), a richer grass texture with a bump map, a wet pitch that really shines,
// and a light bloom around floodlights and screens (glow sprites, cheap on phones). Low quality keeps the light
// Lambert materials and hard shadows off; slow devices drop back by themselves.

function render3dSetup(S3) {
  const T3 = S3.T3, ren = S3.ren; if (!ren) return;
  try { ren.outputEncoding = T3.sRGBEncoding; ren.toneMapping = T3.ACESFilmicToneMapping; ren.toneMappingExposure = S3.night ? 1.05 : 1.12; } catch (e) { }
  S3.hq = !S3.lo;
  if (S3.hq) { try { ren.shadowMap.type = T3.PCFSoftShadowMap; S3.sun.shadow.mapSize.set(2048, 2048); S3.sun.shadow.radius = 3; S3.sun.shadow.bias = -.0004; S3.sun.shadow.normalBias = .02; } catch (e) { } }
  // lights and fog are in linear space too
  try { for (const l of [S3.sun, S3.hemi]) if (l) { l.color.convertSRGBToLinear(); if (l.groundColor) l.groundColor.convertSRGBToLinear(); } if (S3.scene.fog) S3.scene.fog.color.convertSRGBToLinear(); } catch (e) { }
  pbrScan(S3, true);
}
// convert materials once: textures to sRGB, colours to linear, Lambert/Phong to standard (High only)
function pbrMat(S3, m) {
  if (!m) return m; const T3 = S3.T3;
  if (m.map && m.map.encoding !== T3.sRGBEncoding) { m.map.encoding = T3.sRGBEncoding; m.map.needsUpdate = true; m.needsUpdate = true; }
  if (m.userData.pbr) return m;
  let n = m;
  if (S3.hq && !S3.slow && (m.type === 'MeshLambertMaterial' || m.type === 'MeshPhongMaterial')) {
    const wet = m.type === 'MeshPhongMaterial';
    n = new T3.MeshStandardMaterial({ color: m.color, map: m.map, roughness: wet ? .32 : m.userData.rough || .82, metalness: 0, transparent: m.transparent, opacity: m.opacity, side: m.side, skinning: m.skinning, depthWrite: m.depthWrite, bumpMap: m.userData.bump || null, bumpScale: m.userData.bump ? .03 : 1 });
    n.userData = Object.assign({}, m.userData);
  }
  if (n.color) n.color.convertSRGBToLinear();
  n.userData.pbr = true; n.needsUpdate = true; return n;
}
function pbrObj(S3, o) {
  if (!o.material) return;
  if (Array.isArray(o.material)) o.material = o.material.map(m => pbrMat(S3, m)); else o.material = pbrMat(S3, o.material);
}
function pbrScan(S3, all) { try { S3.scene.traverse(o => pbrObj(S3, o)); } catch (e) { console.error(e); } }
// shared materials (the skinned body geometry is shared, materials are per player) are fine: each object converts once

// richer grass: blade streaks and noise, plus a bump map for the standard material
function grassDetail(T3, mat) {
  try {
    const tex = mat.map; const c = tex.image; const g = c.getContext('2d'); const W = c.width, H = c.height;
    // fine noise and short blade streaks, drawn under the lines' brightness
    for (let i = 0; i < 9000; i++) { const x = Math.random() * W, y = Math.random() * H; const l = Math.random(); g.fillStyle = l < .5 ? `rgba(20,60,20,${.05 + Math.random() * .07})` : `rgba(140,200,120,${.03 + Math.random() * .05})`; g.fillRect(x, y, 1 + Math.random() * 1.5, 2 + Math.random() * 3); }
    tex.needsUpdate = true;
    const [bc, bg] = cvs(512, 332); const im = bg.createImageData(512, 332); for (let i = 0; i < im.data.length; i += 4) { const v = 110 + Math.random() * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } bg.putImageData(im, 0, 0);
    const bump = new T3.CanvasTexture(bc); bump.wrapS = bump.wrapT = T3.RepeatWrapping; bump.repeat.set(6, 4); mat.userData.bump = bump; mat.userData.rough = .95;
  } catch (e) { }
}
// a soft bloom around floodlights and the big screens (glow sprites rather than a post-process pass)
function bloom3d(S3) {
  const T3 = S3.T3; if (!S3.hq) return;
  const [c, g] = cvs(128, 128); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,248,225,.55)'); r.addColorStop(.35, 'rgba(255,240,200,.18)'); r.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const mat = new T3.SpriteMaterial({ map: new T3.CanvasTexture(c), transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: S3.night ? 1 : .35 });
  const pts = [];
  if (!S3.bowl) for (const x of [-1, 1]) for (const z of [-1, 1]) pts.push([x * (P3.L / 2 + 16), 43, z * (P3.W / 2 + 16), S3.night ? 26 : 12]);
  else for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; pts.push([Math.cos(a) * (P3.L / 2 + 22), 27, Math.sin(a) * (P3.W / 2 + 20), S3.night ? 14 : 0]); }
  for (const [x, y, z, s] of pts) if (s) { const sp = new T3.Sprite(mat); sp.userData.glow = true; sp.position.set(x, y, z); sp.scale.set(s, s, 1); S3.scene.add(sp); }
}
// called from build3d after the scene and S3 exist
function phase8Build(S3, LM) {
  S3.night = !!(LM.vis.meta && LM.vis.meta.night);
  try { const pitch = S3.scene.children.find(o => o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && o.material && o.material.map && o.rotation.x < -1.5 && o.geometry.parameters && o.geometry.parameters.width >= P3.L); if (pitch) grassDetail(S3.T3, pitch.material); } catch (e) { }
  try { bloom3d(S3); } catch (e) { }
  render3dSetup(S3);
}
// keep new objects (players created later, swapped textures) in the same pipeline
function phase8Frame(S3) { S3.p8n = (S3.p8n || 0) + 1; if (S3.p8n % 20 === 1) pbrScan(S3); }
