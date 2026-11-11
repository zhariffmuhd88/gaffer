// statue.js: an illustrated bronze statue for a manager who reaches legend status at a club (the existing rule in
// clublife.js: a league title and five seasons, or three major trophies). The statue's head is the manager's own
// avatar (hair, beard, glasses) cast in bronze; the pose follows the honours won. Eight or more trophies at the club
// add a gold laurel and "Club legend" on the plaque. Shown as an unveiling on the day, on the club's honours page and
// on the manager profile. Loaded after cine.js.
function statueStint(tid) {
  const mp = G.mgrP; const st = (mp && mp.rec || []).filter(s => s.tid === tid);
  const tro = st.flatMap(s => s.tro || []); const p = st.reduce((a, s) => a + (s.p || 0), 0), w = st.reduce((a, s) => a + (s.w || 0), 0);
  const y0 = st.length ? dParse(st[0].from).getUTCFullYear() : G.year; const last = st[st.length - 1]; const y1 = last && last.to ? dParse(last.to).getUTCFullYear() : null;
  return { tro, p, w, y0, y1 };
}
function statueHead(mp) {
  // the manager's avatar without background or clothes: neck, ears, head, hair, beard, glasses
  try {
    const s = avatarSvg(Object.assign({}, mp, { photo: null }), 100);
    const m = s.match(/<g clip-path="url\(#[^"]+\)">([\s\S]*)<\/g><circle cx="50" cy="50" r="48\.5"/); if (!m) return '';
    const i = m[1].indexOf('<rect x="44" y="60"'); return i >= 0 ? m[1].slice(i) : m[1];
  } catch (e) { return ''; }
}
function statueSvg(tid, opts) {
  opts = opts || {}; const t = T(tid) || { name: 'Club', c1: '#c8102e', c2: '#ffffff', stadium: '' }; const c1 = t.c1 || '#c8102e', c2 = t.c2 || '#ffffff';
  const S = (G.statues && G.statues[tid]) || { n: G.mgr }; const mp = G.mgrP || { name: S.n, av: randomAvatar(1) };
  const info = statueStint(tid); const n = info.tro.length; const legend = S.leg || n >= 8;
  const pose = info.tro.some(x => /Champions League|Premier League|La Liga|Serie A|Bundesliga|Ligue 1/.test(x)) ? 'trophy' : n >= 3 ? 'fist' : 'point';
  const id = 'st' + Math.floor(Math.random() * 1e9); const B = `url(#${id}b)`, BD = `url(#${id}d)`;
  const years = `${info.y0}–${info.y1 || ''}`;
  // the figure (in a 600 x 440 scene; feet on the plinth at y 290, centre x 300)
  let arms = '';
  if (pose === 'trophy') arms = `<path d="M258 134 Q244 100 264 64 L282 70 Q268 102 280 136 Z M342 134 Q356 100 336 64 L318 70 Q332 102 320 136 Z" fill="${B}"/><circle cx="273" cy="62" r="7" fill="${B}"/><circle cx="327" cy="62" r="7" fill="${B}"/>
    <g fill="${BD}"><path d="M281 30 h38 l-4 26 q-15 12 -30 0 z"/><path d="M281 34 q-14 2 -12 14 q2 8 13 9 M319 34 q14 2 12 14 q-2 8 -13 9" fill="none" stroke="${BD}" stroke-width="4"/><rect x="295" y="56" width="10" height="12"/></g>`;
  else if (pose === 'fist') arms = `<path d="M338 132 Q362 112 356 76 L344 76 Q348 106 326 124 Z" fill="${B}"/><circle cx="350" cy="70" r="8" fill="${B}"/><path d="M262 132 Q246 170 254 208 L266 206 Q260 172 274 140 Z" fill="${B}"/><circle cx="259" cy="212" r="6.5" fill="${B}"/>`;
  else arms = `<path d="M336 132 Q370 128 404 118 L406 130 Q372 142 334 148 Z" fill="${B}"/><path d="M404 118 l14 -2 l-1 7 l-13 5 z" fill="${B}"/><path d="M264 134 Q240 160 252 188 L262 184 Q256 162 276 142 Z" fill="${B}"/>`;
  const figure = `<g>
    <path d="M274 210 L268 286 L294 286 L299 222 Z M326 210 L332 286 L306 286 L301 222 Z" fill="${BD}"/>
    <ellipse cx="281" cy="288" rx="14" ry="4.5" fill="${BD}"/><ellipse cx="319" cy="288" rx="14" ry="4.5" fill="${BD}"/>
    <path d="M256 130 Q300 114 344 130 Q356 178 348 240 Q300 250 252 240 Q244 178 256 130 Z" fill="${B}"/>
    <path d="M300 126 L300 238 M284 128 L300 160 L316 128" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="2.4"/>
    ${arms}
    <g transform="translate(${300 - 50 * 1.22},${98 - 43 * 1.22}) scale(1.22)" filter="url(#${id}f)">${statueHead(mp)}</g>
  </g>`;
  // scarves and flowers left at the base
  let tributes = '';
  for (let i = 0; i < 9; i++) { const x = 214 + i * 21, y = 400 + (i % 2) * 6; tributes += i % 3 === 2 ? `<g transform="translate(${x},${y})"><circle r="5" fill="#e23b4a"/><circle cx="7" cy="2" r="4.5" fill="#ffd23f"/><circle cx="-6" cy="3" r="4" fill="#fff"/><path d="M0 4 L1 16" stroke="#2f7d36" stroke-width="2"/></g>` : `<g transform="translate(${x},${y}) rotate(${(i * 37) % 30 - 15})"><rect x="-14" y="-4" width="28" height="8" fill="${c1}"/><rect x="-14" y="-4" width="28" height="8" fill="none" stroke="${c2}" stroke-width="2" stroke-dasharray="5 5"/></g>`; }
  // a crowd of admirers
  let crowd = ''; for (let i = 0; i < 26; i++) { const x = i < 13 ? 20 + i * 14 : 410 + (i - 13) * 14, y = 330 + ((i * 7) % 20); const c = i % 3 ? c1 : i % 2 ? c2 : '#2a2f40'; crowd += `<circle cx="${x}" cy="${y - 14}" r="5.5" fill="#3a2c24"/><rect x="${x - 6}" y="${y - 9}" width="12" height="20" rx="4" fill="${c}"/>`; }
  const facade = Array.from({ length: 20 }, (_, i) => `<rect x="${i * 30 + 2}" y="70" width="26" height="170" fill="${i % 2 ? '#d9e3ee' : '#c4d3e2'}" opacity=".55"/>`).join('');
  const laurel = legend ? `<g fill="#e6b422" stroke="#8a6a12" stroke-width=".6">${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${262 - i * 2}" cy="${320 + i * 5}" rx="6" ry="3" transform="rotate(${-40 + i * 12} ${262 - i * 2} ${320 + i * 5})"/><ellipse cx="${338 + i * 2}" cy="${320 + i * 5}" rx="6" ry="3" transform="rotate(${40 - i * 12} ${338 + i * 2} ${320 + i * 5})"/>`).join('')}</g>` : '';
  const cloth = opts.unveil ? `<g class="st-cloth"><path d="M240 20 Q300 0 360 20 L392 292 Q300 306 208 292 Z" fill="${c1}"/><path d="M240 20 Q300 0 360 20 L392 292 Q300 306 208 292 Z" fill="url(#${id}c)"/></g>` : '';
  return `<svg viewBox="0 0 600 440" class="statuesvg${opts.unveil ? ' unveil' : ''}" role="img" aria-label="Bronze statue of ${esc(S.n || G.mgr)} outside ${esc(t.stadium || t.name)}" style="width:100%;max-width:${opts.small ? 300 : 640}px;display:block;border:1px solid var(--line);background:#0b0e1a">
  <defs>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5b26b"/><stop offset=".55" stop-color="#f7d9a8"/><stop offset="1" stop-color="#cfe2f3"/></linearGradient>
    <linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="#5a3a1c"/><stop offset=".35" stop-color="#b9824a"/><stop offset=".55" stop-color="#d9a76a"/><stop offset="1" stop-color="#4a2f16"/></linearGradient>
    <linearGradient id="${id}d" x1="0" x2="1"><stop offset="0" stop-color="#3d2712"/><stop offset=".5" stop-color="#8a5d31"/><stop offset="1" stop-color="#2f1e0e"/></linearGradient>
    <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#5d6068"/><stop offset=".5" stop-color="#9a9da6"/><stop offset="1" stop-color="#4b4e55"/></linearGradient>
    <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="rgba(0,0,0,.35)"/><stop offset=".5" stop-color="rgba(255,255,255,.12)"/><stop offset="1" stop-color="rgba(0,0,0,.35)"/></linearGradient>
    <filter id="${id}f"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues=".2 .62 .95"/><feFuncG type="table" tableValues=".12 .4 .74"/><feFuncB type="table" tableValues=".05 .2 .45"/></feComponentTransfer></filter>
  </defs>
  <rect width="600" height="440" fill="url(#${id}s)"/>
  <rect y="60" width="600" height="190" fill="${mix(c1, '#1a1d26', .35)}"/>${facade}
  <rect y="54" width="600" height="14" fill="${c2}" opacity=".9"/>${[110, 490].map(x => `<text x="${x}" y="64.5" text-anchor="middle" font-size="10" font-weight="700" fill="${c1}" letter-spacing="3">${esc((t.stadium || t.name).toUpperCase())}</text>`).join('')}
  <rect y="250" width="600" height="190" fill="#b9b3a8"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${-200 + i * 80} 440 L${150 + i * 25} 250" stroke="#a49e93" stroke-width="1"/>`).join('')}<path d="M0 300 H600 M0 350 H600 M0 405 H600" stroke="#a49e93"/>
  ${crowd}
  <rect x="196" y="380" width="208" height="24" fill="url(#${id}g)"/><rect x="212" y="300" width="176" height="82" fill="url(#${id}g)"/><rect x="222" y="288" width="156" height="14" fill="url(#${id}g)"/>
  <rect x="238" y="310" width="124" height="${legend ? 62 : 58}" rx="3" fill="url(#${id}d)" stroke="#2a1b0c"/>
  <text x="300" y="327" text-anchor="middle" font-size="12" font-weight="700" fill="#f3d9a6" letter-spacing="1">${esc((S.n || G.mgr).toUpperCase())}</text>
  <text x="300" y="341" text-anchor="middle" font-size="9" fill="#e9cf9c">Manager · ${years}</text>
  <text x="300" y="354" text-anchor="middle" font-size="9" fill="#e9cf9c">${n} trophies · ${info.p} games</text>
  ${legend ? `<text x="300" y="367" text-anchor="middle" font-size="9" font-weight="700" fill="#ffd86b" letter-spacing="2">CLUB LEGEND</text>` : ''}
  ${laurel}
  ${figure}
  ${tributes}
  ${cloth}
  </svg>`;
}
// unveiling on the day, then on the honours page and the manager profile
const _chkSt = checkStatue;
checkStatue = function () {
  const before = !!(G.statues && G.statues[G.user]); _chkSt();
  try {
    const S = G.statues && G.statues[G.user]; if (!S) return;
    if (!before) G.statueShow = G.user;
    else if (!S.leg && statueStint(G.user).tro.length >= 8) { S.leg = 1; G.statueShow = G.user; msg('Club legend', `${T(G.user).name} add a gold laurel and the words "Club legend" to the plaque on ${G.mgr}'s statue: ${statueStint(G.user).tro.length} trophies at the club.`); }
  } catch (e) { console.error(e); }
};
const _renSt = render;
render = function () {
  try { if (G && G.statueShow && !UI.match && !UI.modal) { const tid = G.statueShow; G.statueShow = null; UI.modal = `<div class="band"><span>Statue unveiled</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">${statueSvg(tid, { unveil: true })}<p>${esc(T(tid).name)} unveil a bronze statue of ${esc(G.mgr)} outside ${esc(T(tid).stadium)}. Supporters leave scarves and flowers at the plinth.</p></div>`; } } catch (e) { console.error(e); }
  _renSt.apply(this, arguments);
};
const _chSt = clubHonoursHtml;
clubHonoursHtml = function (tid) {
  let h = _chSt(tid);
  try { if (G.statues && G.statues[tid]) h = `<h2 class="sect">Statue</h2><div style="margin:6px 0 12px">${statueSvg(tid)}</div>` + h; } catch (e) { console.error(e); }
  return h;
};
const _smSt = scrManager;
scrManager = function () {
  let h = _smSt();
  try {
    const ids = Object.keys(G.statues || {}); if (!ids.length) return h;
    const box = `<h2 class="sect">Statues</h2><div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-start">${ids.map(tid => `<div style="flex:1 1 280px;max-width:320px">${statueSvg(tid, { small: 1 })}<div class="dim" style="font-size:12.5px;margin-top:4px">${tLink(tid, true)} · ${esc(T(tid).stadium || '')}</div></div>`).join('')}</div>`;
    const i = h.lastIndexOf('</div>'); return i > 0 ? h.slice(0, i) + box + h.slice(i) : h + box;
  } catch (e) { console.error(e); return h; }
};
