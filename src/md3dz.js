// md3dz.js: 3D matchday, Phase 5. Loaded after md3dy.js (figure, frame3d and build3d call these helpers).
// 1. A stable look per player from his id: skin tone (a wide, even palette), hair style, hair colour, beard and boots.
//    Nothing is guessed from nationality or name. Player pop-up > Appearance lets you set any of it (stored in p.look).
// 2. Body shape from attributes: strong players stockier, quick ones leaner, height by position and heading.
// 3. Kit patterns in club colours (stripes, hoops, halves, sash, centre band, contrasting sleeves; no logos), the away
//    kit when colours clash (kitFor), keeper gloves, long sleeves in cold or wet weather, tights and snoods in snow.
// 4. Celebrations: knee slide, run to the fans, arms out, fist pump; each player has his own favourite; team-mates pile on.
// 5. Ceremonies: walk-out from the tunnel and a team photo line-up before kick-off, handshakes at full time, then the
//    winners applaud their fans. Low quality: simpler hair and no faces.

const LOOK_SKIN = ['#f6d7c0', '#eccaa9', '#e0b48f', '#d2a27a', '#c08e66', '#a97650', '#93613f', '#7c4f32', '#653f28', '#4e301f', '#3b2418'];
const LOOK_SKIN_N = ['Very light', 'Light', 'Light-medium', 'Medium-light', 'Medium', 'Medium-tan', 'Tan', 'Medium-deep', 'Deep', 'Very deep', 'Darkest'];
const LOOK_HAIR = ['short', 'buzz', 'bald', 'curly', 'long', 'dreads', 'fade'];
const LOOK_HAIR_N = { short: 'Short', buzz: 'Buzz cut', bald: 'Bald', curly: 'Curly', long: 'Long, tied back', dreads: 'Dreadlocks', fade: 'Fade' };
const LOOK_HCOL = ['#0e0e0e', '#2a1d14', '#4b3220', '#6b4a2b', '#a5773f', '#c9a35c', '#e0c98f', '#9a9a9a', '#b5432b'];
const LOOK_HCOL_N = ['Black', 'Dark brown', 'Brown', 'Light brown', 'Dark blond', 'Blond', 'Platinum', 'Grey', 'Red'];
const LOOK_BEARD = ['none', 'stubble', 'full', 'goatee'];
const LOOK_BEARD_N = { none: 'Clean-shaven', stubble: 'Stubble', full: 'Full beard', goatee: 'Goatee' };
const LOOK_BOOT = ['#111111', '#f2f2f2', '#ff3b6b', '#2ec4ff', '#ffd23f', '#39e36b', '#ff7a1a', '#8b5cf6'];
const LOOK_BOOT_N = ['Black', 'White', 'Pink', 'Sky blue', 'Yellow', 'Green', 'Orange', 'Purple'];
const CELEBS = ['slide', 'fans', 'arms', 'pump', 'jump'];
const CELEB_N = { slide: 'knee slide', fans: 'runs to the fans', arms: 'arms out', pump: 'fist pump', jump: 'leap' };

// stable hash of the player id only (never nationality or name)
function lookHash(id, salt) { return hash(String(id) + '|' + salt); }
function lookOf(p) {
  const id = p && p.id || 'x'; const o = (p && p.look) || {};
  const d = {
    skin: lookHash(id, 's') % LOOK_SKIN.length, hair: LOOK_HAIR[lookHash(id, 'h') % LOOK_HAIR.length],
    hcol: lookHash(id, 'c') % LOOK_HCOL.length, beard: LOOK_BEARD[lookHash(id, 'b') % 7 < 3 ? 0 : lookHash(id, 'b') % LOOK_BEARD.length],
    boot: lookHash(id, 'k') % LOOK_BOOT.length, celeb: CELEBS[lookHash(id, 'e') % CELEBS.length]
  };
  return Object.assign(d, o);
}
// body shape from attributes (1-20): strength widens, pace slims, height from position and heading
function bodyOf(p) {
  let A = {}; try { A = attrs(p) || {}; } catch (e) { }
  const str = A.Str || 10, pac = A.Pac || 10, hea = A.Hea || A.Aer || 10; const pos = p && p.pos || 'MC';
  const w = Math.max(.9, Math.min(1.14, 1 + (str - 10) * .014 - (pac - 10) * .006));
  let h = 1 + (hea - 10) * .007 + (pos === 'GK' ? .05 : pos === 'DC' ? .035 : /AM|W|DL|DR/.test(pos) ? -.025 : 0) + ((lookHash(p && p.id, 'ht') % 9) - 4) * .006;
  h = Math.max(.92, Math.min(1.09, h)); return { w, h };
}
// kit patterns in club colours, for the clubs where the pattern is well known (no logos)
const KIT_PATS = [
  [/Newcastle|Brighton|Sunderland|Stoke|Sheffield United|Brentford|Southampton|Juventus|Inter\b|Milan|Atl[ée]tico|Barcelona|Athletic|Crystal Palace|Udinese|Atalanta|Bologna|Genoa|Huddersfield|Sheffield Wed|West Brom|PSV|Girona|Real Sociedad|Lens|Club Brugge/, 'stripes'],
  [/Celtic|Queens Park|Reading|Sporting/, 'hoops'], [/Blackburn|Feyenoord/, 'halves'], [/Rayo|River Plate/, 'sash'], [/Ajax/, 'band'], [/Arsenal|Burnley|Aston Villa|West Ham/, 'sleeves']
];
function kitPat(tid, kit) {
  const t = T(tid); if (!t || !kit || kit.body !== t.c1) return 'plain'; // the change kit stays plain
  for (const [re, p] of KIT_PATS) if (re.test(t.name || '')) return p; return 'plain';
}
function shirtTex(T3, kit, pat) {
  if (!pat || pat === 'plain' || pat === 'sleeves') return null;
  const [c, g] = cvs(128, 128); g.fillStyle = kit.body; g.fillRect(0, 0, 128, 128); g.fillStyle = kit.trim;
  if (pat === 'stripes') for (let i = 0; i < 8; i++) g.fillRect(i * 16 + 8, 0, 8, 128);
  else if (pat === 'hoops') for (let i = 0; i < 4; i++) g.fillRect(0, i * 32 + 16, 128, 16);
  else if (pat === 'halves') { g.fillRect(0, 0, 32, 128); g.fillRect(96, 0, 32, 128); } // the cylinder's seam is at the back: half each side
  else if (pat === 'sash') { g.beginPath(); g.moveTo(52, 0); g.lineTo(80, 0); g.lineTo(108, 128); g.lineTo(80, 128); g.fill(); }
  else if (pat === 'band') g.fillRect(52, 0, 24, 128);
  return new T3.CanvasTexture(c);
}
// kit for the conditions: long sleeves when cold or wet, tights and snood in snow
function kitWx(V) { const m = V.meta || {}; const mo = +String(G.date || '2026-08-01').slice(5, 7); return { long: m.wx === 'rain' || m.wx === 'snow' || ((mo >= 11 || mo <= 2) && m.night), snow: m.wx === 'snow' }; }

// hair, beard and face on the head (low quality: a simple cap, no face)
function headDress(T3, g, L, lo, skinM) {
  const hm = new T3.MeshLambertMaterial({ color: LOOK_HCOL[L.hcol] || '#2a1d14' });
  const cap = (theta, r) => { const m = new T3.Mesh(new T3.SphereGeometry(r || .228, lo ? 8 : 12, 8, 0, Math.PI * 2, 0, theta), hm); m.position.y = 2.24; g.add(m); return m; };
  const st = lo && L.hair !== 'bald' ? 'short' : L.hair;
  if (st === 'short') cap(Math.PI / 2.2);
  else if (st === 'buzz') { const m = cap(Math.PI / 2.4, .224); m.material = new T3.MeshLambertMaterial({ color: LOOK_HCOL[L.hcol], transparent: true, opacity: .75 }); }
  else if (st === 'curly') { cap(Math.PI / 2.1, .235); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const b = new T3.Mesh(new T3.SphereGeometry(.09, 6, 5), hm); b.position.set(Math.cos(a) * .12, 2.42, Math.sin(a) * .12); g.add(b); } }
  else if (st === 'long') { cap(Math.PI / 2); const bun = new T3.Mesh(new T3.SphereGeometry(.09, 8, 6), hm); bun.position.set(-.22, 2.28, 0); g.add(bun); const tail = new T3.Mesh(new T3.CylinderGeometry(.045, .02, .3, 6), hm); tail.position.set(-.27, 2.1, 0); g.add(tail); }
  else if (st === 'dreads') { cap(Math.PI / 2); for (let i = 0; i < 9; i++) { const a = Math.PI * .45 + i / 8 * Math.PI * 1.1; const d = new T3.Mesh(new T3.CylinderGeometry(.03, .025, .34, 5), hm); d.position.set(Math.cos(a) * .2, 2.1, Math.sin(a) * .2); g.add(d); } }
  else if (st === 'fade') { cap(Math.PI / 3.4); const top = new T3.Mesh(new T3.BoxGeometry(.3, .1, .26), hm); top.position.y = 2.43; g.add(top); }
  if (!lo) {
    if (L.beard === 'full' || L.beard === 'stubble') { const b = new T3.Mesh(new T3.SphereGeometry(.226, 12, 6, -Math.PI / 2, Math.PI, Math.PI / 1.9, Math.PI / 3), L.beard === 'full' ? hm : new T3.MeshLambertMaterial({ color: LOOK_HCOL[L.hcol], transparent: true, opacity: .4 })); b.position.y = 2.22; g.add(b); }
    else if (L.beard === 'goatee') { const b = new T3.Mesh(new T3.SphereGeometry(.06, 6, 5), hm); b.position.set(.19, 2.06, 0); g.add(b); }
    const eyeM = new T3.MeshBasicMaterial({ color: '#141414' });
    for (const s of [-1, 1]) { const e = new T3.Mesh(new T3.SphereGeometry(.026, 6, 5), eyeM); e.position.set(.205, 2.26, s * .075); g.add(e); const br = new T3.Mesh(new T3.BoxGeometry(.02, .02, .07), hm); br.position.set(.215, 2.31, s * .075); g.add(br); }
    const nose = new T3.Mesh(new T3.SphereGeometry(.03, 6, 5), skinM); nose.position.set(.225, 2.21, 0); g.add(nose);
  }
}

// ---------- celebrations ----------
function celebPose3d(S3, f, e, celeb, ts, SC) {
  const t = SC.t - (celeb.ts || 0); const q = Math.min(1, Math.max(0, t / 1200));
  if (e === celeb.e) {
    const st = lookOf(e.p).celeb;
    if (st === 'slide') return q < .35 ? { legs: [-.4, .4], arms: [[-1.4, .3], [1.4, .3]], lean: -.3 } : { legs: [-1.5, -1.5], arms: [[-2.3, .2], [2.3, .2]], lean: .45, lift: -.45 };
    if (st === 'fans') { const sw = Math.sin(ts / 90) * .8; return { legs: [-sw, sw], arms: [[-1.5, 0], [1.5, 0]], lean: -.2, lift: Math.abs(Math.sin(ts / 90)) * .08 }; }
    if (st === 'arms') return { legs: [.12, -.12], arms: [[-1.45, .15], [1.45, .15]], lean: .18 };
    if (st === 'pump') { const k = Math.abs(Math.sin(ts / 160)); return { legs: [.3, -.5], arms: [[-.3, -.4], [0, 2.4 + k * .6]], lean: .1, lift: .1 }; }
    return { legs: [.25, -.25], arms: [[-2.7, 0], [2.7, 0]], lift: Math.abs(Math.sin(ts / 140 + f.ph)) * .8 };
  }
  // team-mates near the scorer pile on; the rest run in with arms up
  const sf = S3.figs.get(celeb.e); const d = sf ? Math.hypot(sf.g.position.x - f.g.position.x, sf.g.position.z - f.g.position.z) : 99;
  if (d < 3.2) return { legs: [.3, -.35], arms: [[-.4, 1.6], [.4, 1.6]], lean: -.45, lift: d < 1.6 ? .35 : 0 };
  return { legs: [.25, -.25], arms: [[-2.6, 0], [2.6, 0]], lift: Math.abs(Math.sin(ts / 140 + f.ph)) * .55 };
}

// ---------- ceremonies ----------
// order of the eleven for walk-out and photo: keeper first, then the rest
function ceremonyOrder(S3, M) {
  if (S3.cord && S3.cordN === S3.figs.size) return S3.cord; const o = [[], []];
  for (let s = 0; s < 2; s++) { const ps = M.sides[s].ps.filter(e => e.on); ps.sort((a, b) => (a.role === 'GK' ? -1 : 0) - (b.role === 'GK' ? -1 : 0)); o[s] = ps; }
  S3.cord = o; S3.cordN = S3.figs.size; return o;
}
// returns {w:{x,z}, face, pose} to override a player's position and pose, or null
function cer3d(S3, LM, e, f, ts) {
  const M = LM.M, V = LM.vis; if (V.rp) return null; const sd = f.sd;
  // before kick-off, during the fly-over: walk out of the tunnel, then line up for the team photo
  if (S3.fly && !S3.flyDone) {
    const q = (ts - S3.fly) / (S3.flyLen || 6500); const ord = ceremonyOrder(S3, M); const s = M.sides.findIndex(x => x.ps.includes(e)); const i = ord[s] ? ord[s].indexOf(e) : -1; if (i < 0) return null;
    const vs = sideOf(V, M, e); const tun = { x: 0, z: -(P3.W / 2 + 4) };
    if (q < .5) { // two lines walking out side by side
      const k = q / .5; const z = tun.z + (k * (P3.W / 2 + 1)) - i * 1.4; const x = (vs ? 1.4 : -1.4);
      const walk = z > tun.z; if (!walk) return { w: { x, z: tun.z - 2 }, face: -Math.PI / 2, hide: true };
      return { w: { x, z: Math.min(z, -2) }, face: -Math.PI / 2, gait: 1.4 };
    }
    // team photo: back row standing, front row crouched, each team on its own side of the halfway line, facing the main stand
    const back = i < 6; const col = back ? i : i - 6; const x0 = (vs ? 4 : -4) + (vs ? 1 : -1) * col * 1.15 + (back ? 0 : (vs ? .55 : -.55));
    const z = back ? -2.4 : -3.6; const pose = back ? { legs: [0, 0], arms: [[-.25, 0], [.25, 0]] } : { legs: [-1.3, -1.3], arms: [[-.2, .6], [.2, .6]], lean: .25, lift: -.42 };
    return { w: { x: x0, z }, face: Math.PI / 2, pose };
  }
  // full time: handshakes along the halfway line, then the winners applaud their fans
  if (M.done) {
    if (!S3.ft) S3.ft = ts; const age = (ts - S3.ft) / 1000; const ord = ceremonyOrder(S3, M); const s = M.sides.findIndex(x => x.ps.includes(e)); const i = ord[s] ? ord[s].indexOf(e) : -1; if (i < 0) return null;
    const vs = sideOf(V, M, e);
    if (age < 9) {
      if (vs === 0) return { w: { x: -12 + i * 2.2, z: -1 }, face: -Math.PI / 2, pose: { legs: [0, 0], arms: [[0, 0], [0, 1.25]] } };
      const x = 16 - age * 3.4 - i * 2.2 + 12; const near = Math.abs(x - (-12 + Math.round((x + 12) / 2.2) * 2.2)) < .6;
      return { w: { x: Math.max(-16, Math.min(16, x)), z: .2 }, face: Math.PI, gait: near ? 0 : 1.2, pose: near ? { legs: [0, 0], arms: [[0, 0], [0, 1.25]] } : null };
    }
    const [a, b] = M.score; const pw = M.pens ? (M.pens[0] > M.pens[1] ? 0 : 1) : null; const win = a > b ? 0 : b > a ? 1 : pw;
    const won = win == null || win === vs;
    if (won) { const clap = Math.abs(Math.sin(ts / 170 + i)); const end = vs ? 1 : -1; return { w: { x: end * (20 + (i % 6) * 3), z: -(P3.W / 2 - 3) + Math.floor(i / 6) * 2.4 }, face: Math.PI / 2, gait: 1, pose: { legs: [0, 0], arms: [[-.15 - clap * .25, 1.4], [.15 + clap * .25, 1.4]] } }; }
    return { w: null, pose: { legs: [0, 0], arms: [[-.4, -.5], [.4, -.5]], lean: .22 } }; // heads down, hands on hips
  }
  return null;
}

// ---------- appearance editor (player pop-up) ----------
function lookEditorHtml(p) {
  const L = lookOf(p); const sel = (k, opts) => `<select class="f" data-look="${k}" data-pid="${esc(p.id)}" style="max-width:150px">${opts.map(([v, n]) => `<option value="${esc(String(v))}"${String(L[k]) === String(v) ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  const sw = (cols, cur) => `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${cols[cur]};border:1px solid rgba(255,255,255,.4);vertical-align:-2px;margin-left:4px"></span>`;
  return `<details class="box pad" style="margin-top:8px"><summary style="cursor:pointer"><b>Appearance</b> <span class="dim" style="font-size:12px">(3D match view)</span></summary>
  <div class="grid2" style="gap:8px;margin-top:8px">
  <label class="lb">Skin tone ${sw(LOOK_SKIN, L.skin)}${sel('skin', LOOK_SKIN.map((c, i) => [i, LOOK_SKIN_N[i]]))}</label>
  <label class="lb">Hair ${sel('hair', LOOK_HAIR.map(h => [h, LOOK_HAIR_N[h]]))}</label>
  <label class="lb">Hair colour ${sw(LOOK_HCOL, L.hcol)}${sel('hcol', LOOK_HCOL.map((c, i) => [i, LOOK_HCOL_N[i]]))}</label>
  <label class="lb">Beard ${sel('beard', LOOK_BEARD.map(b => [b, LOOK_BEARD_N[b]]))}</label>
  <label class="lb">Boots ${sw(LOOK_BOOT, L.boot)}${sel('boot', LOOK_BOOT.map((c, i) => [i, LOOK_BOOT_N[i]]))}</label>
  <label class="lb">Goal celebration ${sel('celeb', CELEBS.map(c => [c, CELEB_N[c]]))}</label></div>
  <p class="dim" style="font-size:12px;margin:6px 0 0">Every player gets a look of his own from the game; nothing is guessed from nationality or name. Set it here to match the real player. ${p.look ? '<button class="btn" style="padding:2px 8px" data-a="lookreset" data-v="' + esc(p.id) + '">Reset to default</button>' : ''}</p></details>`;
}
const _peLook = playerExtra;
playerExtra = function (p) { const h = _peLook(p); try { if (p && p.id && !p.pseudo) return h + lookEditorHtml(p); } catch (e) { } return h; };
document.addEventListener('change', (ev) => {
  const el = ev.target; if (!el || !el.dataset || !el.dataset.look) return; const p = P(el.dataset.pid); if (!p) return;
  const k = el.dataset.look; const v = ['skin', 'hcol', 'boot'].includes(k) ? +el.value : el.value; p.look = Object.assign({}, p.look || {}, { [k]: v }); autosave(); toast('Appearance saved.');
  try { const LM = UI.match; if (LM && LM.v3s) for (const [e, f] of LM.v3s.figs) if (e.p === p) { LM.v3s.scene.remove(f.g); LM.v3s.figs.delete(e); } } catch (e) { }
  try { if (UI.modal && typeof playerModal === 'function') { const det = el.closest('details'); playerModal(p.id); setTimeout(() => { const d = [...document.querySelectorAll('details')].find(x => /Appearance/.test(x.textContent.slice(0, 30))); if (d && det) d.open = true; }, 0); } } catch (e) { }
});
ACT.lookreset = (v) => { const p = P(v); if (p) { delete p.look; autosave(); toast('Appearance reset.'); if (typeof playerModal === 'function') playerModal(v); } };
