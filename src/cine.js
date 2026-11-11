// cine.js: the cinematic intro (about 30 seconds), rendered in-engine with three.js in the bowl stadium at night:
// a fly-over from outside, the walk-out, title cards, a dribble, a low-angle goal with the net rippling, a celebration
// with flares in the stands and confetti, an optional personal photo card, and the final title. A synthesised
// soundtrack (WebAudio) plays once sound is switched on. The photo is chosen in Game > Options and kept only in this
// browser (IndexedDB), never in the published game. Loaded after md3d.js, before intro.js.

// ---------- the personal photo: stored on this device only ----------
function idbOpen() { return new Promise((res, rej) => { try { const r = indexedDB.open('gaffer', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); }
function idbGet(k) { return idbOpen().then(db => new Promise((res) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); })).catch(() => { try { return localStorage.getItem('gaffer.' + k); } catch (e) { return null; } }); }
function idbSet(k, v) { return idbOpen().then(db => new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); v == null ? tx.objectStore('kv').delete(k) : tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(true); tx.onerror = () => rej(tx.error); })).catch(() => { try { if (v == null) localStorage.removeItem('gaffer.' + k); else localStorage.setItem('gaffer.' + k, v); return true; } catch (e) { return false; } }); }
function shrinkPhoto(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader(); fr.onerror = () => rej(fr.error);
    fr.onload = () => { const im = new Image(); im.onerror = () => rej(new Error('not an image')); im.onload = () => { const s = Math.min(1, 1400 / Math.max(im.width, im.height)); const [c, g] = cvs(Math.round(im.width * s), Math.round(im.height * s)); g.drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .86)); }; im.src = fr.result; };
    fr.readAsDataURL(file);
  });
}

// ---------- soundtrack: 128 bpm, A minor, kick / clap / hats / bass / stabs, impacts on the cuts ----------
function cineMusic() {
  const S = { ac: null, out: null, t0: 0, next: 0, iv: null };
  const BEAT = 60 / 128, STEP = BEAT / 4, ROOTS = [55, 43.65, 65.41, 49]; // A F C G
  const noise = (ac, len) => { const b = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); };
  function kick(t) { const ac = S.ac, o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + .18); env(g, t, .003, .9, .28); o.connect(g); g.connect(S.out); o.start(t); o.stop(t + .32); }
  function clap(t) { const ac = S.ac, s = ac.createBufferSource(); s.buffer = S.nb; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = .8; const g = ac.createGain(); env(g, t, .002, .5, .16); s.connect(f); f.connect(g); g.connect(S.out); s.start(t); s.stop(t + .2); }
  function hat(t, v) { const ac = S.ac, s = ac.createBufferSource(); s.buffer = S.nb; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500; const g = ac.createGain(); env(g, t, .001, v, .05); s.connect(f); f.connect(g); g.connect(S.out); s.start(t); s.stop(t + .08); }
  function bass(t, fr) { const ac = S.ac, o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(180, t + .2); const g = ac.createGain(); env(g, t, .005, .35, .2); o.connect(f); f.connect(g); g.connect(S.out); o.start(t); o.stop(t + .26); }
  function stab(t, root) { const ac = S.ac; for (const m of [4, 4 * 1.2, 4 * 1.5]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = root * m; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2200; const g = ac.createGain(); env(g, t, .01, .12, .45); o.connect(f); f.connect(g); g.connect(S.out); o.start(t); o.stop(t + .5); } }
  function boom(t) { const ac = S.ac, o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + .9); env(g, t, .005, 1, 1.1); o.connect(g); g.connect(S.out); o.start(t); o.stop(t + 1.2); const s = ac.createBufferSource(); s.buffer = S.nb; const g2 = ac.createGain(); env(g2, t, .002, .35, .5); s.connect(g2); g2.connect(S.out); s.start(t); s.stop(t + .6); }
  function riser(t, len) { const ac = S.ac, s = ac.createBufferSource(); s.buffer = S.nb; s.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(6000, t + len); const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.25, t + len); g.gain.setValueAtTime(.0001, t + len + .01); s.connect(f); f.connect(g); g.connect(S.out); s.start(t); s.stop(t + len + .02); }
  const IMPACTS = [9, 16.4, 27];
  function plan(from, to) {
    // timeline seconds -> events
    let n = Math.ceil(from / STEP); for (; n * STEP < to; n++) {
      const tl = n * STEP, at = S.t0 + tl; if (at < S.ac.currentTime) continue; const st = n % 16, bar = Math.floor(n / 16);
      const drop = tl >= 9 && tl < 30.5, intro = tl < 9;
      if (st % 4 === 0 && (drop || (tl >= 5 && tl < 8.4))) kick(at);
      if (drop && (st === 4 || st === 12)) clap(at);
      if (drop && st % 2 === 1) hat(at, .18); else if (tl >= 5 && st % 4 === 2) hat(at, .08);
      if ((drop || tl >= 5) && st % 2 === 0 && tl < 30.5) bass(at, ROOTS[bar % 4] * (st % 4 === 2 ? 2 : 1));
      if (drop && st === 0) stab(at, ROOTS[bar % 4]);
      if (intro && st === 0 && tl < 5) stab(at, ROOTS[bar % 4] / 2);
    }
    for (const x of IMPACTS) if (x >= from && x < to) boom(S.t0 + x);
    if (8.0 >= from && 8.0 < to) riser(S.t0 + 8.0, .95);
    if (26.0 >= from && 26.0 < to) riser(S.t0 + 26.0, .95);
  }
  return {
    start(ac, tl) { if (S.ac || !ac) return; S.ac = ac; S.nb = noise(ac, 1); S.out = ac.createGain(); S.out.gain.value = .22; S.out.connect(ac.destination); S.t0 = ac.currentTime - tl + .05; S.next = tl; S.iv = setInterval(() => { const now = ac.currentTime - S.t0; if (now > 31) return; plan(S.next, now + .3); S.next = now + .3; }, 100); },
    stop() { if (S.iv) clearInterval(S.iv); if (S.out) { try { S.out.gain.setTargetAtTime(.0001, S.ac.currentTime, .15); } catch (e) { } } S.iv = null; }
  };
}

// ---------- the film ----------
const CINE_LEN = 31;
function cineRun(host, ac, onEnd) {
  const ctl = { stopped: false, raf: 0 }; const music = cineMusic();
  ctl.sound = (a) => { music.start(a, ctl.tl || 0); const b = host.parentElement && host.parentElement.querySelector('.cine-snd'); if (b) b.textContent = '🔊 Sound on'; };
  ctl.stop = () => { ctl.stopped = true; cancelAnimationFrame(ctl.raf); music.stop(); try { if (ctl.ren) { ctl.ren.dispose(); ctl.ren.forceContextLoss && ctl.ren.forceContextLoss(); ctl.ren.domElement.remove(); } } catch (e) { } };
  const end = () => { if (!ctl.stopped) { ctl.stop(); onEnd && onEnd(); } };
  let photo = null, caption = 'Matchday memories';
  try { caption = localStorage.getItem('gaffer.photoCap') || caption; } catch (e) { }
  idbGet('introPhoto').then(v => { photo = v; }).catch(() => { });
  loadThree().then((T3) => { if (!ctl.stopped) build(T3); }).catch(end);
  function build(T3) {
    const lo = window.innerWidth < 760;
    const u = G && G.user && T(G.user) && !T(G.user).nat ? T(G.user) : null;
    const home = u ? { body: u.c1 || '#d0101b', trim: u.c2 || '#ffffff' } : { body: '#d0101b', trim: '#ffffff' };
    let away = { body: '#1f3c88', trim: '#ffffff' }; if (colDist(home.body, away.body) < 120) away = { body: '#f2f2f2', trim: '#111111' };
    const kits = [home, away]; const gkc = gkColour(kits);
    const scene = new T3.Scene(); scene.background = new T3.Color('#04060d'); scene.fog = new T3.Fog('#04060d', 220, 520);
    const cam = new T3.PerspectiveCamera(50, window.innerWidth / window.innerHeight, .3, 900);
    const ren = new T3.WebGLRenderer({ antialias: !lo }); ren.setPixelRatio(lo ? 1 : Math.min(1.5, window.devicePixelRatio || 1)); ren.setSize(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
    ren.domElement.className = 'cine-cv'; ren.domElement.setAttribute('aria-hidden', 'true'); host.appendChild(ren.domElement); ctl.ren = ren;
    scene.add(new T3.HemisphereLight('#a8b8ff', '#1c2a1c', .7)); const key = new T3.DirectionalLight('#fff6e0', .75); key.position.set(-30, 80, 40); scene.add(key);
    const turf = new T3.Mesh(new T3.PlaneGeometry(P3.L + 30, P3.W + 26), new T3.MeshLambertMaterial({ color: '#2b6f31' })); turf.rotation.x = -Math.PI / 2; turf.position.y = -.02; scene.add(turf);
    const pitch = new T3.Mesh(new T3.PlaneGeometry(P3.L, P3.W), new T3.MeshLambertMaterial({ map: pitchTex(T3) })); pitch.rotation.x = -Math.PI / 2; scene.add(pitch);
    buildBowl(T3, scene, { night: true, fill: .98, home, screen: 'GAFFER 26/27' });
    // goals
    const postM = new T3.MeshLambertMaterial({ color: '#ffffff' }); const netM = new T3.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .3, side: T3.DoubleSide, wireframe: true }); let net = null;
    for (const s of [-1, 1]) { const gx = s * P3.L / 2; for (const z of [-3.66, 3.66]) { const p = new T3.Mesh(new T3.CylinderGeometry(.08, .08, 2.44, 8), postM); p.position.set(gx, 1.22, z); scene.add(p); } const bar = new T3.Mesh(new T3.CylinderGeometry(.08, .08, 7.32, 8), postM); bar.rotation.x = Math.PI / 2; bar.position.set(gx, 2.44, 0); scene.add(bar); const n = new T3.Mesh(new T3.BoxGeometry(2, 2.44, 7.32, 4, 5, 10), netM); n.position.set(gx + s * 1.02, 1.22, 0); scene.add(n); if (s > 0) net = n; }
    // players: 11 a side
    const F = []; for (let s = 0; s < 2; s++) for (let i = 0; i < 11; i++) { const g = figure(T3, kits[s], i === 0, gkc, i === 0 ? 1 : [0, 2, 5, 6, 3, 8, 4, 10, 7, 9, 11][i]); scene.add(g); F.push({ g, s, i, last: null, ph: Math.random() * 6 }); }
    const ball = new T3.Mesh(new T3.SphereGeometry(.42, 16, 12), new T3.MeshLambertMaterial({ color: '#ffffff' })); scene.add(ball);
    // formations (metres; home attacks +x)
    const FORM = [[-48, 0], [-34, -20], [-36, -7], [-36, 7], [-34, 20], [-20, -12], [-22, 0], [-20, 12], [-8, -22], [-6, 0], [-8, 22]];
    const posOf = (s, i, k) => { const [x, z] = FORM[i]; return s === 0 ? [x * k, z] : [-x * k, -z]; };
    // flares, smoke, confetti
    const glow = (() => { const [c, g] = cvs(64, 64); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,90,60,1)'); r.addColorStop(.4, 'rgba(255,40,20,.6)'); r.addColorStop(1, 'rgba(255,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T3.CanvasTexture(c); })();
    const smokeT = (() => { const [c, g] = cvs(64, 64); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(220,210,210,.55)'); r.addColorStop(1, 'rgba(220,210,210,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T3.CanvasTexture(c); })();
    const flares = [], smoke = [];
    for (let k = 0; k < 7; k++) { const t = -Math.PI * .22 + (k - 3) * .045; const [x, z] = bowlPt(P3.L / 2 + 5 + 8, P3.W / 2 + 5 + 8, t); const sp = new T3.Sprite(new T3.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); sp.position.set(x, 5.5, z); sp.scale.set(5, 5, 1); sp.visible = false; scene.add(sp); flares.push(sp);
      for (let m = 0; m < 3; m++) { const sm = new T3.Sprite(new T3.SpriteMaterial({ map: smokeT, transparent: true, depthWrite: false })); sm.position.set(x, 6, z); sm.visible = false; sm.userData = { x, z, d: m * .9 + Math.random() }; scene.add(sm); smoke.push(sm); } }
    const CN = lo ? 500 : 1400; const cp = new Float32Array(CN * 3), cc = new Float32Array(CN * 3); const pal = [home.body, home.trim, '#ffd23f', '#ffffff'].map(h => new T3.Color(h));
    for (let i = 0; i < CN; i++) { cp[i * 3] = 20 + Math.random() * 45; cp[i * 3 + 1] = 20 + Math.random() * 30; cp[i * 3 + 2] = -40 + Math.random() * 40; const c = pal[i % pal.length]; cc[i * 3] = c.r; cc[i * 3 + 1] = c.g; cc[i * 3 + 2] = c.b; }
    const cg = new T3.BufferGeometry(); cg.setAttribute('position', new T3.BufferAttribute(cp, 3)); cg.setAttribute('color', new T3.BufferAttribute(cc, 3));
    const conf = new T3.Points(cg, new T3.PointsMaterial({ size: .5, vertexColors: true, transparent: true, opacity: .95 })); conf.visible = false; scene.add(conf);
    // text overlays
    const txt = host.parentElement.querySelector('.cine-txt'); const say = (h, cls) => { if (txt.dataset.h !== h) { txt.dataset.h = h; txt.className = 'cine-txt ' + (cls || ''); txt.innerHTML = h; } };
    const ph = host.parentElement.querySelector('.cine-photo');
    const fly = new T3.CatmullRomCurve3([[-230, 110, -210], [-160, 92, -130], [-95, 80, -70], [-35, 66, -28], [0, 30, -40]].map(p => new T3.Vector3(...p)));
    const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k)); const ease = (k) => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
    const t0 = performance.now(); let shake = 0;
    const place = (f, x, z, y, face) => { const p = { x, z }; const prev = f.last || p; const dx = x - prev.x, dz = z - prev.z, sp = Math.hypot(dx, dz); f.g.position.set(x, y || 0, z); f.g.rotation.y = face != null ? face : sp > .02 ? Math.atan2(-dz, dx) : f.g.rotation.y; f.ph += Math.min(.6, sp * 1.6); const sw = Math.sin(f.ph) * Math.min(.75, sp * 3); let li = 0; for (const c of f.g.children) { if (c.name === 'leg') c.rotation.z = (li++ ? 1 : -1) * sw; else if (c.name === 'armL' || c.name === 'armR') { c.rotation.x = 0; c.rotation.z = (c.name === 'armR' ? 1 : -1) * -sw * .8; } } f.last = p; };
    const arms = (f, up) => { for (const c of f.g.children) if (c.name === 'armL' || c.name === 'armR') { c.rotation.x = up ? (c.name === 'armR' ? 2.7 : -2.7) : 0; c.rotation.z = 0; } };
    const loop = () => {
      if (ctl.stopped) return; const tl = (performance.now() - t0) / 1000; ctl.tl = tl;
      if (tl > CINE_LEN) return end();
      const W = host.clientWidth || window.innerWidth, H = host.clientHeight || window.innerHeight; if (ctl.w !== W || ctl.h !== H) { ctl.w = W; ctl.h = H; ren.setSize(W, H); cam.aspect = W / H; cam.updateProjectionMatrix(); }
      let cp_, look; conf.visible = false; flares.forEach(f => f.visible = false); smoke.forEach(s => s.visible = false); ph.classList.remove('on');
      // default: everyone in formation, ball on the spot
      const k = tl < 9 ? 0 : 1; ball.position.set(0, .42, 0);
      if (tl < 5) { // fly-over from outside, over the roof, into the bowl
        F.forEach(f => f.g.visible = false); const p = fly.getPoint(ease(tl / 5)); cp_ = p; look = { x: 0, y: 5, z: 0 };
        say(tl > .8 && tl < 4.4 ? '<span class="c-small">AYEP INTERACTIVE presents</span>' : '', 'fade');
      } else if (tl < 9) { // walk-out from the tunnel
        const q = (tl - 5) / 4; F.forEach(f => { f.g.visible = true; const lead = -40 + q * 34; const z = lead - f.i * 1.7; const x = f.s ? 1.6 : -1.6; place(f, x, Math.min(z, -6 - f.i * .2)); f.g.rotation.y = Math.PI / 2; });
        cp_ = { x: 5.5, y: 2.1, z: -40 + q * 34 + 9 }; look = { x: 0, y: 1.7, z: -40 + q * 34 - 2 }; say(tl > 5.6 ? '<span class="c-small">Tonight</span>' : '', 'fade');
      } else if (tl < 11.5) { // title slam
        F.forEach(f => { f.g.visible = true; const x = (f.i - 5) * 1.25 + (f.s ? 8 : -8); place(f, x, -4, 0, Math.PI / 2); });
        cp_ = { x: 0, y: 12, z: -26 }; look = { x: 0, y: 2, z: -4 }; if (tl < 9.1) shake = 1; say('<b class="c-big">GAFFER</b>', 'slam');
      } else if (tl < 15.5) { // the dribble
        const q = (tl - 11.5) / 4; F.forEach(f => { f.g.visible = true; const [x, z] = posOf(f.s, f.i, 1); place(f, x + q * 6 * (f.s ? -1 : 1) + 8, z * .8); });
        const at = F[9]; const ax = lerp(-12, 33, q), az = lerp(-18, -6, q) + Math.sin(q * 9) * 1.2; place(at, ax, az); ball.position.set(ax + .9, .42, az + .1);
        const d1 = F[14], d2 = F[13]; place(d1, ax - 2.2, az + 1.8); place(d2, ax - 4.2, az + 3.6);
        cp_ = { x: ax - 3, y: 3.2, z: az - 15 }; look = { x: ax + 2, y: 1, z: az }; say(q > .2 ? '<span class="c-mid">Every touch counts</span>' : '', 'fade');
      } else if (tl < 18.5) { // the shot, low and behind the goal; the net ripples
        const q = (tl - 15.5); const at = F[9]; F.forEach(f => { f.g.visible = true; if (f !== at && f.i) { const [x, z] = posOf(f.s, f.i, 1); place(f, x + 12, z * .7); } });
        place(at, 34, -6, 0, Math.atan2(-(1.5 + 6), 52 - 34)); const gk = F[11]; const kick = .35, hit = .95;
        if (q < kick) { ball.position.set(34.8, .42, -5.9); for (const c of at.g.children) if (c.name === 'leg') c.rotation.z = -.9 * (q / kick); }
        else { const r = Math.min(1, (q - kick) / (hit - kick)); ball.position.set(lerp(34.8, 53.2, r), .42 + Math.sin(Math.PI * r) * 1.6 + r * 1.0, lerp(-5.9, 2.3, r)); }
        const dv = Math.max(0, Math.min(1, (q - .6) / .4)); gk.g.position.set(51.5, Math.sin(Math.PI * dv) * .8, lerp(0, 2.6, dv)); gk.g.rotation.set(dv * 1.3, Math.PI, 0);
        if (q > hit) { const d = q - hit; net.scale.set(1 + Math.sin(d * 30) * .25 * Math.exp(-d * 3), 1, 1); if (d < .1) shake = .8; }
        cp_ = { x: 56, y: 1.4, z: 6.5 }; look = { x: 38, y: 1.2, z: -3 }; say(q > hit ? '<b class="c-big goal">GOAL!</b>' : '', q > hit ? 'slam' : '');
      } else if (tl < 23.5) { // celebration in the corner, flares in the stands, confetti
        const q = (tl - 18.5) / 5; const at = F[9]; const cx = lerp(36, 49, ease(q * 1.6)), cz = lerp(-6, -29, ease(q * 1.6)); place(at, cx, cz); arms(at, q > .3);
        F.forEach(f => { f.g.visible = true; if (f.s === 0 && f !== at && f.i) { const [x, z] = posOf(0, f.i, 1); place(f, lerp(x + 12, cx - 1.5 - (f.i % 3), ease(q * 1.3)), lerp(z * .7, cz + 1.5 + (f.i % 4) * .6, ease(q * 1.3)), Math.abs(Math.sin(tl * 7 + f.i)) * .5 * (q > .45)); arms(f, q > .5 && f.i % 2); } else if (f.s === 1) { const [x, z] = posOf(1, f.i, 1); place(f, x + 12, z * .7); } });
        ball.position.set(53, .42, 2.2); net.scale.set(1, 1, 1);
        flares.forEach((f, i) => { f.visible = true; f.scale.setScalar(4.5 + Math.sin(tl * 13 + i) * .8); }); smoke.forEach(s => { s.visible = true; const a = ((tl - 18.5) * .35 + s.userData.d) % 3; s.position.set(s.userData.x, 6 + a * 4, s.userData.z); s.scale.setScalar(3 + a * 3); s.material.opacity = Math.max(0, .6 - a * .2); });
        conf.visible = true; const p = cg.attributes.position; for (let i = 0; i < CN; i++) { let y = p.getY(i) - .12; if (y < 0) y = 30; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(tl * 2 + i) * .03); } p.needsUpdate = true;
        const a = -.9 + q * 1.6; cp_ = { x: cx + Math.cos(a) * 13, y: 4.5, z: cz + Math.sin(a) * 13 + 4 }; look = { x: cx, y: 1.6, z: cz }; say(q > .25 ? '<span class="c-mid">Moments like these</span>' : '', 'fade');
      } else if (tl < 27) { // memories: the personal photo if there is one, otherwise the bowl from above
        const q = (tl - 23.5) / 3.5; F.forEach(f => f.g.visible = true); conf.visible = true; flares.forEach(f => f.visible = true);
        cp_ = { x: Math.cos(q * .8) * 95, y: 70, z: Math.sin(q * .8) * 95 - 20 }; look = { x: 0, y: 0, z: 0 };
        if (photo) { if (ph.dataset.src !== '1') { ph.querySelector('img').src = photo; ph.dataset.src = '1'; ph.querySelector('.cp-cap').textContent = caption; } ph.classList.add('on'); say(''); }
        else say('<span class="c-mid">Your club. Your story.</span>', 'fade');
      } else { // final title
        const q = (tl - 27) / 4; F.forEach(f => { f.g.visible = true; const [x, z] = posOf(f.s, f.i, 1); place(f, x, z); }); conf.visible = true;
        cp_ = { x: lerp(-30, 30, q), y: lerp(30, 20, q), z: -36 }; look = { x: 0, y: 0, z: 0 }; if (tl < 27.1) shake = 1;
        say('<b class="c-big">GAFFER</b><b class="c-yr">26/27</b><span class="c-small">Football management · tap to continue</span>', 'slam final');
      }
      shake *= .9; const sx = (Math.random() - .5) * shake, sy = (Math.random() - .5) * shake;
      cam.position.set(cp_.x + sx, cp_.y + sy, cp_.z); cam.lookAt(look.x, look.y, look.z);
      ren.render(scene, cam); ctl.raf = requestAnimationFrame(loop);
    };
    if (ac) ctl.sound(ac);
    ctl.raf = requestAnimationFrame(loop);
  }
  return ctl;
}

// ---------- Game > Options: cinematic on/off and the intro photo ----------
const _scrGameC = scrGame;
scrGame = function () {
  const html = _scrGameC();
  const on = introPref('cine') !== 'off'; let cap = 'Matchday memories'; try { cap = localStorage.getItem('gaffer.photoCap') || cap; } catch (e) { }
  const box = `<div class="box pad" id="cinebox"><h2 class="sect" style="margin-top:0">Cinematic intro</h2>
    <label class="row" style="gap:8px;cursor:pointer"><input type="checkbox" data-cine="tg" ${on ? 'checked' : ''}> Play the 3D cinematic intro (needs an internet connection the first time)</label>
    <h3 class="h3" style="margin-top:10px">Intro photo</h3>
    <p class="dim" style="font-size:12.5px;margin:0 0 6px">Add one of your own photos to the intro as a "memories" card. It stays in this browser on this device only and is never uploaded or published.</p>
    <div class="row" style="gap:10px;align-items:center;flex-wrap:wrap"><img id="cinePrev" alt="Your intro photo" style="display:none;max-width:160px;max-height:110px;border:1px solid var(--line);border-radius:4px"><label class="btn" style="cursor:pointer">Choose photo<input type="file" id="cinePhoto" accept="image/*" style="display:none"></label><button class="btn" data-a="cinephotodel" id="cineDel" style="display:none">Remove photo</button></div>
    <label class="lb" for="cineCap" style="margin-top:8px">Caption</label><input class="f" id="cineCap" maxlength="40" value="${esc(cap)}" style="max-width:320px">
    <div style="margin-top:8px"><button class="btn" data-a="cineplay">Play the cinematic now</button></div></div>`;
  setTimeout(cinePrev, 0);
  const i = html.lastIndexOf('</div><div id="exp">');
  return i > 0 ? html.slice(0, i) + box + html.slice(i) : html + box;
};
function cinePrev() { const im = document.getElementById('cinePrev'); if (!im) return; idbGet('introPhoto').then(v => { im.style.display = v ? '' : 'none'; if (v) im.src = v; const d = document.getElementById('cineDel'); if (d) d.style.display = v ? '' : 'none'; }); }
Object.assign(ACT, {
  cinephotodel: () => { idbSet('introPhoto', null).then(() => { toast('Intro photo removed.'); cinePrev(); }); },
  cineplay: () => { introPref('cine', 'on'); runIntro({ cineOnly: true }); }
});
document.addEventListener('change', (ev) => {
  const el = ev.target; if (!el) return;
  if (el.dataset && el.dataset.cine === 'tg') { introPref('cine', el.checked ? 'on' : 'off'); toast(el.checked ? 'The cinematic intro will play when the game opens.' : 'The cinematic intro is off.'); }
  if (el.id === 'cinePhoto' && el.files && el.files[0]) shrinkPhoto(el.files[0]).then(d => idbSet('introPhoto', d)).then(() => { toast('Photo saved on this device for the intro.'); cinePrev(); }).catch(() => toast('That file could not be used as a photo.'));
  if (el.id === 'cineCap') { try { localStorage.setItem('gaffer.photoCap', el.value.trim() || 'Matchday memories'); } catch (e) { } toast('Caption saved.'); }
});
