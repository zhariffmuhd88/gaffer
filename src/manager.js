// ===== MANAGER PROFILE & AVATAR =====
const NATIONS = ['Malaysia', 'England', 'Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland', 'Spain', 'Portugal', 'France', 'Germany', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Denmark', 'Norway', 'Sweden', 'Poland', 'Croatia', 'Serbia', 'Turkey', 'Brazil', 'Argentina', 'Uruguay', 'Colombia', 'Mexico', 'USA', 'Canada', 'Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Egypt', 'Morocco', 'Saudi Arabia', 'UAE', 'Japan', 'South Korea', 'China', 'Indonesia', 'Singapore', 'Thailand', 'Vietnam', 'Philippines', 'India', 'Australia', 'New Zealand'];
const BACKGROUNDS = [['none', 'No playing career', 0], ['amateur', 'Sunday league', 2], ['semi', 'Semi-professional', 4], ['pro', 'Professional', 8], ['intl', 'International', 12]];
const LICENCES = [['C', 'National C Licence', 0], ['B', 'UEFA B Licence', 2], ['A', 'UEFA A Licence', 4], ['PRO', 'UEFA Pro Licence', 7]];
const PHILOSOPHIES = ['Balanced', 'Possession football', 'High pressing', 'Counter-attacking', 'Direct football', 'Defensive solidity', 'Youth development'];
const FORMER_POS = ['Goalkeeper', 'Centre-back', 'Full-back', 'Defensive midfielder', 'Central midfielder', 'Winger', 'Attacking midfielder', 'Striker'];
const SKINS = ['#f6d5b8', '#eac09a', '#d39e74', '#b07a52', '#8a5a3b', '#5e3b26'];
const HAIRC = ['#1b1410', '#3b2416', '#6b4423', '#b8893d', '#8e8e8e', '#d9d9d9'];
const AV_OPTS = {
  skin: ['Very light', 'Light', 'Medium', 'Tan', 'Brown', 'Dark'],
  hair: ['Bald', 'Buzz cut', 'Short', 'Side parting', 'Slicked back', 'Curly', 'Long', 'Receding'],
  hc: ['Black', 'Dark brown', 'Brown', 'Blond', 'Grey', 'White'],
  beard: ['Clean-shaven', 'Stubble', 'Full beard', 'Moustache', 'Goatee'],
  glasses: ['None', 'Round', 'Rectangular'],
  outfit: ['Suit and tie', 'Club tracksuit', 'Club polo', 'Overcoat']
};
const AV_LABEL = { skin: 'Skin tone', hair: 'Hair style', hc: 'Hair colour', beard: 'Facial hair', glasses: 'Glasses', outfit: 'Matchday outfit' };
function randomAvatar(seed) { const r = seeded(seed || Math.floor(Math.random() * 1e9)); const pick = (k) => Math.floor(r() * AV_OPTS[k].length); return { skin: pick('skin'), hair: pick('hair'), hc: Math.floor(r() * 4), beard: pick('beard'), glasses: r() < .7 ? 0 : 1 + Math.floor(r() * 2), outfit: 0 }; }

function avatarSvg(mp, size, tid) {
  const id = 'av' + Math.floor(Math.random() * 1e9);
  const t = T(tid || G.user) || {}; const c1 = uiCol(t.c1 || '#2b4a8a'), c2 = t.c2 || '#ffffff';
  const bg = mix(c1, '#0a0d1c', .45);
  if (mp.photo) return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avsvg" role="img" aria-label="${esc(mp.name || 'Manager')} photo"><defs><clipPath id="${id}"><circle cx="50" cy="50" r="49"/></clipPath></defs><circle cx="50" cy="50" r="50" fill="${bg}"/><image href="${mp.photo}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/><circle cx="50" cy="50" r="48.5" fill="none" stroke="${c1}" stroke-width="2.5"/></svg>`;
  const a = mp.av || randomAvatar(1);
  const sk = SKINS[a.skin] || SKINS[1], hc = HAIRC[a.hc] || HAIRC[0], skD = mix(sk, '#000', .18);
  let body = '';
  // clothes
  if (a.outfit === 1) body += `<path d="M14 100 Q18 76 36 72 L64 72 Q82 76 86 100 Z" fill="${c1}"/><path d="M50 72 L50 100" stroke="${c2}" stroke-width="2.5"/><path d="M36 72 L44 80 L50 74 L56 80 L64 72" fill="none" stroke="${c2}" stroke-width="2"/>`;
  else if (a.outfit === 2) body += `<path d="M14 100 Q18 76 36 72 L64 72 Q82 76 86 100 Z" fill="${c1}"/><path d="M40 72 L50 82 L60 72 L57 70 L50 77 L43 70 Z" fill="${c2}"/><circle cx="66" cy="84" r="3" fill="${c2}"/>`;
  else if (a.outfit === 3) body += `<path d="M12 100 Q16 74 36 71 L64 71 Q84 74 88 100 Z" fill="#2e2a26"/><path d="M38 71 L50 90 L62 71" fill="${c1}"/><path d="M38 71 L46 100 M62 71 L54 100" stroke="#1d1a17" stroke-width="2"/>`;
  else body += `<path d="M14 100 Q18 76 36 72 L64 72 Q82 76 86 100 Z" fill="#1d2233"/><path d="M42 72 L50 84 L58 72 Z" fill="#f4f4f4"/><path d="M48.2 76 L51.8 76 L53 92 L50 96 L47 92 Z" fill="${c1}"/><path d="M36 72 L46 88 L42 72 M64 72 L54 88 L58 72" fill="#141826"/>`;
  // neck, ears, head
  body += `<rect x="44" y="60" width="12" height="14" rx="3" fill="${skD}"/><ellipse cx="31.5" cy="45" rx="3.6" ry="5.5" fill="${skD}"/><ellipse cx="68.5" cy="45" rx="3.6" ry="5.5" fill="${skD}"/><ellipse cx="50" cy="43" rx="18.5" ry="22" fill="${sk}"/>`;
  // hair
  const H = [
    '',
    `<path d="M32 38 Q33 20 50 19 Q67 20 68 38 Q66 28 50 27 Q34 28 32 38 Z" fill="${hc}" opacity=".55"/>`,
    `<path d="M31 40 Q30 17 50 16 Q71 17 69 40 Q67 28 58 26 Q50 30 40 27 Q33 30 31 40 Z" fill="${hc}"/>`,
    `<path d="M31 41 Q29 16 52 15 Q72 17 69 40 Q68 27 56 25 L44 25 Q40 25 38 29 Q34 32 31 41 Z" fill="${hc}"/><path d="M43 25 L41 30" stroke="${sk}" stroke-width="1"/>`,
    `<path d="M31 38 Q30 15 50 14 Q70 15 69 38 Q67 24 50 23 Q33 24 31 38 Z" fill="${hc}"/><path d="M38 20 Q50 17 62 20" stroke="${mix(hc, '#fff', .25)}" stroke-width="1" fill="none"/>`,
    `<g fill="${hc}">${[[36, 24], [43, 19], [50, 17], [57, 19], [64, 24], [33, 31], [67, 31], [40, 23], [60, 23], [47, 21], [54, 21]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.2"/>`).join('')}</g>`,
    `<path d="M30 52 Q27 16 50 15 Q73 16 70 52 L67 52 Q67 29 58 26 Q50 30 42 26 Q33 29 33 52 Z" fill="${hc}"/>`,
    `<path d="M31 40 Q31 30 35 27 Q38 31 37 36 Z M69 40 Q69 30 65 27 Q62 31 63 36 Z" fill="${hc}"/><path d="M38 24 Q50 21 62 24" stroke="${hc}" stroke-width="1.5" fill="none" opacity=".5"/>`
  ];
  body += H[a.hair] || '';
  // face
  body += `<path d="M40 37 Q44 35 47 37 M53 37 Q56 35 60 37" stroke="${a.hair === 0 ? '#3b2a20' : hc}" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="43.5" cy="42" rx="1.8" ry="2" fill="#1d1612"/><ellipse cx="56.5" cy="42" rx="1.8" ry="2" fill="#1d1612"/><path d="M50 44 Q48.5 50 50.5 51" stroke="${skD}" stroke-width="1.3" fill="none"/>`;
  const bc = a.hc >= 4 ? HAIRC[a.hc] : mix(hc, '#000', .1);
  if (a.beard === 1) body += `<path d="M33 48 Q34 64 50 66 Q66 64 67 48 Q62 58 50 58 Q38 58 33 48 Z" fill="${bc}" opacity=".32"/>`;
  else if (a.beard === 2) body += `<path d="M32 46 Q33 67 50 68 Q67 67 68 46 Q64 60 57 57 Q50 55 43 57 Q36 60 32 46 Z" fill="${bc}"/><path d="M45 55 Q50 53 55 55" stroke="${sk}" stroke-width="1.3" fill="none"/>`;
  else if (a.beard === 3) body += `<path d="M43 53 Q50 50 57 53 Q56 55 50 54 Q44 55 43 53 Z" fill="${bc}"/>`;
  else if (a.beard === 4) body += `<path d="M44 53 Q50 51 56 53 L55 55 Q50 54 45 55 Z M46 58 Q50 66 54 58 Q50 60 46 58 Z" fill="${bc}"/>`;
  body += `<path d="M45 56.5 Q50 59 55 56.5" stroke="#7a3d33" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  if (a.glasses === 1) body += `<g fill="none" stroke="#1a1a1a" stroke-width="1.3"><circle cx="43.5" cy="42" r="5"/><circle cx="56.5" cy="42" r="5"/><path d="M48.5 42 L51.5 42 M38.5 41 L33 40 M61.5 41 L67 40"/></g>`;
  else if (a.glasses === 2) body += `<g fill="none" stroke="#1a1a1a" stroke-width="1.4"><rect x="37.5" y="38" width="11" height="8" rx="1.5"/><rect x="51.5" y="38" width="11" height="8" rx="1.5"/><path d="M48.5 41 L51.5 41 M37.5 40 L33 39.5 M62.5 40 L67 39.5"/></g>`;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avsvg" role="img" aria-label="${esc(mp.name || 'Manager')} avatar"><defs><clipPath id="${id}"><circle cx="50" cy="50" r="49"/></clipPath></defs><circle cx="50" cy="50" r="50" fill="${bg}"/><g clip-path="url(#${id})">${body}</g><circle cx="50" cy="50" r="48.5" fill="none" stroke="${c1}" stroke-width="2.5"/></svg>`;
}

// ---- profile data ----
function repTier(r) { return r >= 80 ? ['Worldwide', 'Respected across the football world'] : r >= 67 ? ['Continental', 'Known throughout Europe'] : r >= 54 ? ['National', 'A recognised name across England'] : r >= 40 ? ['Regional', 'Known in the English game'] : ['Local', 'Still making a name for himself']; }
function makePlayingCareer(mp) {
  const r = seeded(hash(mp.name + mp.nat + mp.bg));
  const bg = mp.bg; mp.caps = 0; mp.igoals = 0; mp.pclubs = [];
  if (bg === 'none') { mp.pos = null; return; }
  mp.pos = FORMER_POS[Math.floor(r() * FORMER_POS.length)];
  const pool = bg === 'amateur' ? LOWER.map(x => x[0] + ' Sunday XI') : bg === 'semi' ? LOWER.map(x => x[0]) : CH_CLUBS.map(x => x.name).concat(Object.values(EURO).flat().map(x => x[0]).slice(0, 40)).concat(bg === 'intl' ? PL_CLUBS.map(c => c.name) : []);
  const end = (mp.born || 1985) + 33 + Math.floor(r() * 3); let y = (mp.born || 1985) + 18;
  const n = bg === 'amateur' ? 1 : 2 + Math.floor(r() * 3);
  for (let i = 0; i < n && y < end; i++) {
    const len = Math.max(1, Math.round((end - y) / (n - i) + (r() - .5) * 2));
    const apps = Math.round(len * (bg === 'amateur' ? 15 : 22 + r() * 14)); const att = ['Striker', 'Winger', 'Attacking midfielder'].includes(mp.pos);
    mp.pclubs.push({ n: pool[Math.floor(r() * pool.length)], from: y, to: Math.min(end, y + len), a: apps, g: Math.round(apps * (att ? .25 + r() * .15 : mp.pos === 'Goalkeeper' ? 0 : .03 + r() * .06)) });
    y += len;
  }
  if (bg === 'intl') { mp.caps = 5 + Math.floor(r() * 70); mp.igoals = ['Striker', 'Winger', 'Attacking midfielder'].includes(mp.pos) ? Math.floor(mp.caps * (.15 + r() * .25)) : Math.floor(mp.caps * r() * .05); }
}
function startRep(bg, lic) { return 45 + (BACKGROUNDS.find(x => x[0] === bg) || [0, 0, 0])[2] + (LICENCES.find(x => x[0] === lic) || [0, 0, 0])[2]; }
function ensureProfile() {
  if (!G) return;
  if (!G.mgrP) {
    G.mgrP = { name: G.mgr, nat: 'England', born: 1984, bg: 'pro', lic: 'PRO', phil: 'Balanced', form: userTeam().tac.form, av: randomAvatar(hash(G.mgr)), photo: null, rec: [], aw: [] };
    makePlayingCareer(G.mgrP);
    // rebuild this season's record from results so far
    const st = { tid: G.user, from: G.date, to: null, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, tro: [] };
    for (const f of Object.values(G.fx)) if (f.r && (f.h === G.user || f.a === G.user)) { addStint(st, f); if (f.d < st.from) st.from = f.d; }
    G.mgrP.rec.push(st);
  }
  if (T(G.user) && !T(G.user).lite) T(G.user).mgr = G.mgr;
}
function addStint(st, f) { const h = f.h === G.user; const gf = h ? f.r[0] : f.r[1], ga = h ? f.r[1] : f.r[0]; st.p++; st.gf += gf; st.ga += ga; if (gf > ga) st.w++; else if (gf < ga) st.l++; else st.d++; }
function curStint() { const mp = G.mgrP; let st = mp.rec[mp.rec.length - 1]; if (!st || st.to || st.tid !== G.user) { st = { tid: G.user, from: G.date, to: null, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, tro: [] }; mp.rec.push(st); } return st; }
const _pm0 = postMatch;
postMatch = function (f, pre) { _pm0(f, pre); if (G.mgrP && (f.h === G.user || f.a === G.user) && f.r) addStint(curStint(), f); };
const _ho0 = honour;
honour = function (tid, name) { _ho0(tid, name); if (tid === G.user && G.mgrP) { curStint().tro.push(seasonLabel(G.year) + ' ' + name); G.mgrRep = clamp(G.mgrRep + 4, 20, 99); } };
const _tj0 = takeJob;
takeJob = function (tid) { if (G.mgrP) { const st = G.mgrP.rec[G.mgrP.rec.length - 1]; if (st && !st.to) st.to = G.date; } _tj0(tid); ensureProfile(); };
const _mig0 = migrate;
migrate = function () { _mig0(); ensureProfile(); };
// reputation helps attract players
const _pint0 = playerInterest;
playerInterest = function (p, toTid) { const r = _pint0(p, toTid); if (toTid === G.user && r === 'maybe' && G.mgrRep >= 72) return 'yes'; if (toTid === G.user && r === 'no' && G.mgrRep >= 85 && T(p.c) && !T(p.c).lite && T(p.c).rep - T(toTid).rep <= 16) return 'maybe'; return r; };

// ---- start screen fields ----
function startProfileFields() {
  const v = UI.np || { nat: 'Malaysia', born: 1986, bg: 'pro', lic: 'A' };
  return `<div class="npf">
    <div><label class="lb" for="np-nat">Nationality</label><select class="f" id="np-nat">${NATIONS.map(n => `<option ${n === v.nat ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div><label class="lb" for="np-born">Year of birth</label><input class="f" id="np-born" type="number" min="1945" max="2004" value="${v.born}" style="width:96px"></div>
    <div><label class="lb" for="np-bg">Playing background</label><select class="f" id="np-bg">${BACKGROUNDS.map(([k, l]) => `<option value="${k}" ${k === v.bg ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div><label class="lb" for="np-lic">Coaching licence</label><select class="f" id="np-lic">${LICENCES.map(([k, l]) => `<option value="${k}" ${k === v.lic ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
  </div><p class="dim" style="font-size:12.5px;margin:6px 0 12px">Background and licence set your starting reputation, which affects which players want to join and which clubs offer you jobs. You can design your avatar or upload a photo from the Manager screen.</p>`;
}
const _rs0 = renderStart;
renderStart = function () {
  _rs0();
  const row = document.querySelector('#mgrname'); if (!row) return;
  const box = row.closest('.row'); if (box) box.insertAdjacentHTML('afterend', startProfileFields());
};
ACT.start = () => {
  const n = $('#mgrname'); const name = (n && n.value.trim()) || 'Manager';
  const np = { nat: $('#np-nat').value, born: clamp(+$('#np-born').value || 1986, 1945, 2004), bg: $('#np-bg').value, lic: $('#np-lic').value };
  UI.np = np;
  newGame(UI.newClub, name);
  G.mgrP = { name, nat: np.nat, born: np.born, bg: np.bg, lic: np.lic, phil: 'Balanced', form: userTeam().tac.form, av: randomAvatar(hash(name + np.nat)), photo: null, rec: [], aw: [] };
  makePlayingCareer(G.mgrP);
  G.mgrRep = startRep(np.bg, np.lic);
  T(G.user).mgr = name;
  UI.scr = 'mgr'; UI.msg = null; autosave(); render();
  toast('Career started. Design your avatar or upload a photo here.');
};

// ---- manager screen ----
function scrManager() {
  ensureProfile();
  const mp = G.mgrP; const [tier, tierD] = repTier(G.mgrRep);
  const age = dParse(G.date).getUTCFullYear() - mp.born;
  const tot = mp.rec.reduce((a, s) => { a.p += s.p; a.w += s.w; a.d += s.d; a.l += s.l; a.gf += s.gf; a.ga += s.ga; a.tro += s.tro.length; return a; }, { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, tro: 0 });
  const awc = {}; for (const a of mp.aw || []) awc[a.n] = (awc[a.n] || 0) + 1;
  const pct = (s) => s.p ? Math.round(s.w / s.p * 100) + '%' : '-';
  const ed = UI.mpEdit;
  const details = ed ? `<div class="box pad" style="display:grid;gap:10px">
      <div class="npf"><div><label class="lb" for="mp-name">Name</label><input class="f" id="mp-name" maxlength="28" value="${esc(mp.name)}"></div>
      <div><label class="lb" for="mp-nat">Nationality</label><select class="f" id="mp-nat">${NATIONS.map(n => `<option ${n === mp.nat ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div><label class="lb" for="mp-born">Year of birth</label><input class="f" id="mp-born" type="number" min="1945" max="2004" value="${mp.born}" style="width:96px"></div>
      <div><label class="lb" for="mp-phil">Philosophy</label><select class="f" id="mp-phil">${PHILOSOPHIES.map(n => `<option ${n === mp.phil ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div><label class="lb" for="mp-form">Preferred formation</label><select class="f" id="mp-form">${Object.keys(FORMS).map(n => `<option ${n === mp.form ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
      <div class="row"><button class="btn pri" data-a="mpsave">Save details</button><button class="btn" data-a="mpedit">Cancel</button></div>
      <p class="dim" style="margin:0;font-size:12.5px">Playing career, caps and licence are set when the career starts and do not change.</p></div>`
    : `<dl class="kv mpkv">
      <dt>Name</dt><dd><b>${esc(mp.name)}</b></dd>
      <dt>Nationality</dt><dd>${esc(mp.nat)}</dd>
      <dt>Age</dt><dd>${age} <span class="dim">(born ${mp.born})</span></dd>
      <dt>Current club</dt><dd>${tLink(G.user, true)}</dd>
      <dt>Reputation</dt><dd><b class="yel">${tier}</b> <span class="dim">· ${Math.round(G.mgrRep)}/100 · ${tierD}</span><div class="bar" style="margin-top:4px;max-width:260px"><i style="width:${G.mgrRep}%"></i></div></dd>
      <dt>Coaching licence</dt><dd>${esc((LICENCES.find(x => x[0] === mp.lic) || [, '-'])[1])}</dd>
      <dt>Playing background</dt><dd>${esc((BACKGROUNDS.find(x => x[0] === mp.bg) || [, '-'])[1])}${mp.pos ? ` · former ${esc(mp.pos.toLowerCase())}` : ''}</dd>
      <dt>International caps</dt><dd>${mp.caps ? `<b>${mp.caps}</b> caps, ${mp.igoals} goals for ${esc(mp.nat)}` : '<span class="dim">None</span>'}</dd>
      <dt>Philosophy</dt><dd>${esc(mp.phil)}</dd>
      <dt>Preferred formation</dt><dd class="mono">${esc(mp.form)}</dd>
    </dl><button class="btn" data-a="mpedit" style="margin-top:10px">Edit details</button>`;
  let avEd = '';
  if (UI.avEdit) {
    const a = mp.av;
    avEd = `<div class="box pad" style="margin-top:10px;display:grid;gap:9px">${Object.keys(AV_OPTS).map(k => `<div><label class="lb">${AV_LABEL[k]}</label><div class="seg" style="flex-wrap:wrap">${AV_OPTS[k].map((o, i) => `<button class="${a[k] === i ? 'on' : ''}" data-a="avset" data-k="${k}" data-v="${i}">${k === 'skin' || k === 'hc' ? `<i class="sw" style="background:${(k === 'skin' ? SKINS : HAIRC)[i]}"></i>` : ''}${o}</button>`).join('')}</div></div>`).join('')}
      <div class="row"><button class="btn" data-a="avrand">Randomise</button><button class="btn pri" data-a="avdone">Done</button></div></div>`;
  }
  return `<div class="band">Manager profile<small>${esc(mp.name)} · ${esc(T(G.user).name)}</small></div>
  <div class="mpgrid" style="margin-top:10px">
    <div class="box pad" style="text-align:center">
      <div class="mpav">${avatarSvg(mp, 168)}</div>
      <div style="font-family:var(--f-disp);font-size:26px;color:var(--yel);margin-top:6px">${esc(mp.name)}</div>
      <div class="dim">${esc(mp.nat)} · ${tier} reputation</div>
      <div class="row" style="justify-content:center;margin-top:10px">
        ${mp.photo ? '' : `<button class="btn ${UI.avEdit ? 'on' : ''}" data-a="avedit">Customise avatar</button>`}
        <label class="btn" for="avfile" style="cursor:pointer">${mp.photo ? 'Change photo' : 'Upload photo'}</label><input id="avfile" type="file" accept="image/*" hidden>
        ${mp.photo ? '<button class="btn warn" data-a="avnophoto">Use avatar instead</button>' : ''}
      </div>
      <p class="dim" style="font-size:12px;margin-bottom:0">A photo is shrunk to a small square and kept only in this browser's save.</p>
      ${avEd}
    </div>
    <div style="min-width:0">${details}</div>
  </div>
  <h2 class="sect">Managerial career</h2>
  <div class="tw"><table class="t"><thead><tr><th>Club</th><th>From</th><th>To</th><th class="n">P</th><th class="n">W</th><th class="n">D</th><th class="n">L</th><th class="n">GF</th><th class="n">GA</th><th class="n">Win %</th><th>Trophies</th></tr></thead><tbody>
  ${mp.rec.slice().reverse().map(s => `<tr class="${!s.to ? 'me' : ''}"><td>${tLink(s.tid, true)}</td><td class="mono">${dShort(s.from)} ${s.from.slice(0, 4)}</td><td class="mono">${s.to ? dShort(s.to) + ' ' + s.to.slice(0, 4) : 'Present'}</td><td class="n">${s.p}</td><td class="n">${s.w}</td><td class="n">${s.d}</td><td class="n">${s.l}</td><td class="n">${s.gf}</td><td class="n">${s.ga}</td><td class="n">${pct(s)}</td><td style="white-space:normal">${esc(s.tro.join(', ') || '-')}</td></tr>`).join('')}
  <tr><td><b>Total</b></td><td></td><td></td><td class="n"><b>${tot.p}</b></td><td class="n"><b>${tot.w}</b></td><td class="n"><b>${tot.d}</b></td><td class="n"><b>${tot.l}</b></td><td class="n">${tot.gf}</td><td class="n">${tot.ga}</td><td class="n"><b>${pct(tot)}</b></td><td><b>${tot.tro}</b></td></tr>
  </tbody></table></div>
  <div class="grid2" style="margin-top:4px">
    <div><h2 class="sect">Personal awards</h2><div class="box pad">${Object.keys(awc).length ? Object.entries(awc).map(([n, c]) => `<div>🏅 ${esc(n)} <b>×${c}</b></div>`).join('') + `<div class="dim" style="font-size:12.5px;margin-top:6px">${(mp.aw || []).slice(-5).reverse().map(a => `${esc(a.n)} · ${esc(tName(a.club))} · ${dShort(a.d)} ${a.d.slice(0, 4)}`).join('<br>')}</div>` : '<span class="dim">No awards yet. Manager of the Month is decided on league results each month.</span>'}</div></div>
    <div><h2 class="sect">Playing career</h2>${mp.pclubs.length ? `<div class="tw"><table class="t"><thead><tr><th>Club</th><th>Years</th><th class="n">Apps</th><th class="n">Goals</th></tr></thead><tbody>${mp.pclubs.map(c => `<tr><td>${esc(c.n)}</td><td class="mono">${c.from}–${c.to}</td><td class="n">${c.a}</td><td class="n">${c.g}</td></tr>`).join('')}${mp.caps ? `<tr><td>${esc(mp.nat)} (international)</td><td></td><td class="n">${mp.caps}</td><td class="n">${mp.igoals}</td></tr>` : ''}</tbody></table></div>` : '<div class="box pad dim">No professional playing career.</div>'}</div>
  </div>`;
}
Object.assign(ACT, {
  avedit: () => { UI.avEdit = !UI.avEdit; render(); },
  avset: (v, el) => { G.mgrP.av[el.dataset.k] = +v; autosave(); render(); },
  avrand: () => { G.mgrP.av = randomAvatar(); autosave(); render(); },
  avdone: () => { UI.avEdit = false; render(); },
  avnophoto: () => { G.mgrP.photo = null; autosave(); toast('Back to your avatar.'); render(); },
  mpedit: () => { UI.mpEdit = !UI.mpEdit; render(); },
  mpsave: () => { const mp = G.mgrP; const nm = $('#mp-name').value.trim(); if (nm) { mp.name = nm; G.mgr = nm; T(G.user).mgr = nm; } mp.nat = $('#mp-nat').value; mp.born = clamp(+$('#mp-born').value || mp.born, 1945, 2004); mp.phil = $('#mp-phil').value; mp.form = $('#mp-form').value; UI.mpEdit = false; autosave(); toast('Profile saved.'); render(); }
});
document.addEventListener('change', (ev) => {
  const el = ev.target; if (!el || el.id !== 'avfile' || !el.files || !el.files[0]) return;
  const file = el.files[0]; if (!/^image\//.test(file.type)) { toast('Please choose an image file.'); return; }
  const fr = new FileReader();
  fr.onload = () => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d'); const s = Math.min(img.width, img.height); x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 192, 192); try { G.mgrP.photo = c.toDataURL('image/jpeg', .82); autosave(); toast('Photo updated.'); } catch (e) { toast('That image could not be used. Try another one.'); } render(); }; img.onerror = () => toast('That image could not be read. Try a JPG or PNG.'); img.src = fr.result; };
  fr.onerror = () => toast('That file could not be read.');
  fr.readAsDataURL(file);
});
const _screen4 = screen;
screen = function (s) { if (s === 'mgr') return scrManager(); if (s === 'awards') return scrAwards(); return _screen4(s); };
