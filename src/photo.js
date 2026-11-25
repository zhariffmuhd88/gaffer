// photo.js: Phase 12. Photo mode, highlight clips and automatic 3D quality.
// Photo mode: pauses the match, frees the camera (drag/pinch, plus orbit, height and zoom buttons), hides the graphics,
// offers four looks (Broadcast, Film, Black and white, Vintage) and saves a PNG (download, or the share sheet on phones).
// Clips: "Save clip" plays a goal replay again and records the pitch (2D or 3D) with MediaRecorder (MP4 where the
// browser supports it, otherwise WebM), then offers the file. Browsers without MediaRecorder get a short message.
// Quality: Auto (default) watches the frame time and steps down by itself — High → Medium (no shadows, lower
// resolution, no glow) → Low (no 3D crowd, simpler players). Choosing Low or High by hand always wins.
// Loaded after move.js.

const PH_FILTERS = [['bc', 'Broadcast'], ['film', 'Film'], ['bw', 'Black & white'], ['vin', 'Vintage']];
try { if (localStorage.getItem('gaffer_v3q') === 'auto') UI.v3q = undefined; } catch (e) { }
function phCss(f) { return f === 'film' ? 'contrast(1.08) saturate(.85) sepia(.18) brightness(1.02)' : f === 'bw' ? 'grayscale(1) contrast(1.18)' : f === 'vin' ? 'sepia(.55) saturate(.8) contrast(.92) brightness(1.05)' : 'contrast(1.06) saturate(1.12)'; }
// pixel version of the same looks (ctx.filter is missing on older Safari), with vignette and grain for film/vintage
function phApply(cv, f) {
  const x = cv.getContext('2d'), w = cv.width, h = cv.height; const im = x.getImageData(0, 0, w, h), d = im.data;
  const cx = w / 2, cy = h / 2, R = Math.hypot(cx, cy); let seed = 7;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    let r = d[i], g = d[i + 1], b = d[i + 2]; const L = .299 * r + .587 * g + .114 * b;
    if (f === 'bw') { const v = (L - 128) * 1.18 + 128; r = g = b = v; }
    else if (f === 'vin') { const sr = L * 1.07 + 22, sg = L * .95 + 12, sb = L * .76; r = r * .45 + sr * .55; g = g * .45 + sg * .55; b = b * .45 + sb * .55; r = r * .92 + 14; g = g * .92 + 12; b = b * .92 + 10; }
    else if (f === 'film') { r = (r - 128) * 1.08 + 134; g = (g - 128) * 1.06 + 128; b = (b - 128) * 1.02 + 118; const m = (r + g + b) / 3; r = m + (r - m) * .85; g = m + (g - m) * .85; b = m + (b - m) * .85; }
    else { const m = (r + g + b) / 3; r = m + (r - m) * 1.12; g = m + (g - m) * 1.12; b = m + (b - m) * 1.12; r = (r - 128) * 1.06 + 128; g = (g - 128) * 1.06 + 128; b = (b - 128) * 1.06 + 128; }
    if (f === 'film' || f === 'vin' || f === 'bw') { const px = p % w, py = (p / w) | 0; const v = 1 - Math.pow(Math.hypot(px - cx, py - cy) / R, 2.2) * (f === 'bw' ? .35 : .45); seed = (seed * 16807) % 2147483647; const n = ((seed & 255) - 128) * (f === 'film' ? .09 : .06); r = r * v + n; g = g * v + n; b = b * v + n; }
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
  x.putImageData(im, 0, 0);
}
function phOn(LM) { return !!(LM && LM.photo); }
ACT.mphoto = () => {
  const LM = UI.match; if (!LM || !LM.v3s) return; const S3 = LM.v3s;
  if (LM.photo) { // leave photo mode
    LM.hold = LM.photo.hold; LM.run = LM.photo.run; S3.free = LM.photo.free; LM.photo = null;
    const w = document.getElementById('p2dwrap'); if (w) { w.classList.remove('photo'); const c = w.querySelector('canvas.p3d'); if (c) c.style.filter = ''; }
    renderMatch(); try { if (LM.run && typeof schedule === 'function') schedule(); } catch (e) { } return;
  }
  LM.photo = { run: LM.run, hold: LM.hold, free: S3.free, f: 'bc' }; LM.run = false; LM.hold = true;
  if (!S3.free && S3.camPos && S3.look) { const dx = S3.camPos.x - S3.look.x, dy = S3.camPos.y - S3.look.y, dz = S3.camPos.z - S3.look.z; const d = Math.hypot(dx, dy, dz) || 40; S3.free = { yaw: Math.atan2(dz, dx), pitch: Math.max(.06, Math.asin(Math.max(-1, Math.min(1, dy / d)))), dist: d }; }
  renderMatch();
};
ACT.mphf = (v) => { const LM = UI.match; if (!phOn(LM)) return; LM.photo.f = v; phPanel(LM); };
ACT.mphc = (v) => {
  const LM = UI.match; if (!phOn(LM)) return; const S3 = LM.v3s; const F = S3.free; if (!F) return;
  if (v === 'l') F.yaw -= .26; if (v === 'r') F.yaw += .26; if (v === 'u') F.pitch = Math.min(1.45, F.pitch + .12); if (v === 'd') F.pitch = Math.max(.06, F.pitch - .12);
  if (v === 'in') F.dist = Math.max(6, F.dist * .85); if (v === 'out') F.dist = Math.min(140, F.dist * 1.18);
};
ACT.mphsave = async () => {
  const LM = UI.match; if (!phOn(LM)) return; const S3 = LM.v3s;
  try {
    S3.ren.render(S3.scene, S3.cam); const src = S3.ren.domElement;
    const cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height; cv.getContext('2d').drawImage(src, 0, 0); phApply(cv, LM.photo.f);
    const M = LM.M; const name = `gaffer-${(T(M.sides[0].tid) || {}).short || 'home'}-${(T(M.sides[1].tid) || {}).short || 'away'}-${M.min}min.png`.replace(/[^\w.-]+/g, '');
    const blob = await new Promise(r => cv.toBlob(r, 'image/png')); LM.photo.last = { size: blob ? blob.size : 0, w: cv.width, h: cv.height };
    phDeliver(blob, name, 'Photo saved');
  } catch (e) { console.error(e); toast('Could not save the photo on this device.'); }
};
function phDeliver(blob, name, msg) {
  if (!blob) { toast('Nothing to save.'); return; }
  try { const f = new File([blob], name, { type: blob.type }); if (/iP(hone|ad|od)/.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: name }).catch(() => { }); return; } } catch (e) { }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  toast(`${msg}: ${name}`);
}
function phPanel(LM) {
  const w = document.getElementById('p2dwrap'); if (!w) return; let p = w.querySelector('.phpanel'); const c = w.querySelector('canvas.p3d');
  if (!phOn(LM)) { if (p) p.remove(); return; }
  w.classList.add('photo'); if (c) c.style.filter = phCss(LM.photo.f);
  const html = `<div class="row" style="gap:4px;flex-wrap:wrap;justify-content:center">${PH_FILTERS.map(([k, l]) => `<button class="btn ${LM.photo.f === k ? 'on' : ''}" data-a="mphf" data-v="${k}">${l}</button>`).join('')}</div>
   <div class="row" style="gap:4px;flex-wrap:wrap;justify-content:center;margin-top:4px">${[['l', '⟲ Orbit'], ['r', 'Orbit ⟳'], ['u', 'Higher'], ['d', 'Lower'], ['in', 'Zoom +'], ['out', 'Zoom −']].map(([k, l]) => `<button class="btn" data-a="mphc" data-v="${k}">${l}</button>`).join('')}<button class="btn pri" data-a="mphsave">Save photo</button><button class="btn" data-a="mphoto">Done</button></div>`;
  if (!p) { w.insertAdjacentHTML('beforeend', `<div class="phpanel">${html}</div>`); } else p.innerHTML = html;
}
// ---------- clips ----------
function clipSupport() { return typeof MediaRecorder !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream; }
function clipMime() { const c = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']; for (const m of c) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) { } } return ''; }
ACT.mclip = (v) => {
  const LM = UI.match; if (!LM || !LM.vis) return; const i = +v; const r = LM.replays[i]; if (!r) return;
  if (!clipSupport()) { toast('Clips need a browser that can record video (MediaRecorder). Try Chrome, Edge, Firefox or a recent Safari.'); return; }
  if (LM.clip) { toast('Already recording a clip.'); return; }
  const cv = LM.v3 && LM.v3s ? LM.v3s.ren.domElement : LM.vis.cv; if (!cv) return;
  let rec; const chunks = []; const mime = clipMime();
  try { rec = new MediaRecorder(cv.captureStream(30), mime ? { mimeType: mime, videoBitsPerSecond: 4e6 } : undefined); } catch (e) { toast('This browser could not record the pitch.'); return; }
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = () => { const type = (rec.mimeType || mime || 'video/webm').split(';')[0]; const blob = new Blob(chunks, { type }); LM.clip = null; LM.lastClip = { size: blob.size, type }; phDeliver(blob, `gaffer-goal-${r.label.replace(/[^\w]+/g, '-')}.${type.includes('mp4') ? 'mp4' : 'webm'}`, 'Clip saved'); renderMatch(); };
  startReplay(LM, i); const SC = LM.vis.rp; LM.clip = { rec, SC, t0: Date.now() };
  rec.start(250); toast('Recording the replay…'); renderMatch();
  const poll = setInterval(() => { const V = LM.vis; if (!V || V.rp !== SC || Date.now() - LM.clip.t0 > 20000 || UI.match !== LM) { clearInterval(poll); try { rec.stop(); } catch (e) { LM.clip = null; } } }, 200);
};
// ---------- automatic quality ----------
function aqLabel(S3) { return UI.v3q ? (UI.v3q === 'lo' ? 'Quality: Low' : 'Quality: High') : `Quality: Auto${S3 ? ' · ' + ['Low', 'Medium', 'High'][S3.aq == null ? (S3.lo ? 1 : 2) : S3.aq] : ''}`; }
ACT.m3q = () => {
  // Auto → Low → High → Auto
  UI.v3q = !UI.v3q ? 'lo' : UI.v3q === 'lo' ? 'hi' : undefined; try { localStorage.setItem('gaffer_v3q', UI.v3q || 'auto'); } catch (e) { }
  const LM = UI.match; if (LM && LM.v3s && window.THREE) { const old = LM.v3s; try { old.ren.domElement.remove(); } catch (e) { } LM.v3s = null; LM.v3s = build3d(LM, window.THREE); LM.v3s.mode = old.mode; }
  renderMatch();
};
function aqStep(S3, to) {
  S3.aq = to;
  if (to <= 1) { try { S3.ren.setPixelRatio(1); const c = S3.ren.domElement; S3.ren.setSize(c.clientWidth, c.clientHeight, false); } catch (e) { } if (S3.sun) S3.sun.castShadow = false; S3.ren.shadowMap.autoUpdate = false; S3.scene.traverse(o => { if (o.isSprite && o.userData && o.userData.glow) o.visible = false; }); S3.noGlow = true; }
  if (to <= 0) {
    if (S3.fans) { if (S3.fans.mB) S3.fans.mB.visible = false; if (S3.fans.mH) S3.fans.mH.visible = false; }
    if (S3.rig && !S3.rigOff) { S3.rigOff = true; S3.slow = true; for (const [, f] of S3.figs) { S3.scene.remove(f.g); if (f.sh) S3.scene.remove(f.sh); } S3.figs.clear(); }
  }
  const b = document.querySelector('[data-a="m3q"]'); if (b) b.textContent = aqLabel(S3);
}
function aqFrame(S3, ts) {
  if (UI.v3q || S3.aqDone) return; if (S3.aq == null) S3.aq = S3.lo ? 1 : 2;
  const dt = ts - (S3.aqT || ts); S3.aqT = ts; if (dt <= 0 || dt > 250 || document.hidden) return;
  S3.aqN = (S3.aqN || 0) + 1; if (S3.aqN < 60) return; S3.aqS = (S3.aqS || 0) + dt; S3.aqC = (S3.aqC || 0) + 1;
  if (S3.aqC >= 90) { const avg = S3.aqS / S3.aqC; S3.aqS = 0; S3.aqC = 0; S3.aqLast = avg; if (avg > 38 && S3.aq > 0) aqStep(S3, S3.aq - 1); else if (avg < 30 && S3.aqN > 600) S3.aqDone = true; }
}
const _f3Ph = frame3d;
frame3d = function (LM, ts) { _f3Ph(LM, ts); try { if (LM.v3s) aqFrame(LM.v3s, ts); } catch (e) { } };
// ---------- buttons ----------
const _rmPh = renderMatch;
renderMatch = function () {
  const r = _rmPh.apply(this, arguments);
  try {
    const LM = UI.match; if (!LM) return r;
    const q = document.querySelector('[data-a="m3q"]');
    if (q) { q.textContent = aqLabel(LM.v3s); q.classList.toggle('on', UI.v3q === 'lo'); q.title = 'Auto picks the quality by itself; Low or High fixes it'; if (!document.querySelector('[data-a="mphoto"]')) q.insertAdjacentHTML('afterend', `<button class="btn ${LM.photo ? 'on' : ''}" data-a="mphoto" title="Pause, move the camera, pick a look and save a picture">📷 Photo mode</button>`); }
    // Save clip next to each goal replay
    if (LM.replays && LM.replays.length) for (const b of document.querySelectorAll('[data-a="mrp"]')) { if (b.nextElementSibling && b.nextElementSibling.dataset && b.nextElementSibling.dataset.a === 'mclip') continue; b.insertAdjacentHTML('afterend', `<button class="btn" style="font-size:12.5px;padding:3px 9px" data-a="mclip" data-v="${b.dataset.v}" title="Record this replay as a video">${LM.clip ? '● Rec' : '⬇ Clip'}</button>`); }
    phPanel(LM);
  } catch (e) { console.error(e); }
  return r;
};
