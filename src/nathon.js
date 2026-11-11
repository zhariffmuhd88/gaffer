// nathon.js: national-team trophies are celebrated: a long news story, a victory parade, honours for the squad
// and the manager, drawn trophies (generic designs, no real logos) in the inbox, the International history tab
// and the manager profile. Loaded after exstaff.js.

const NT_KIND = { WC: 'globe', EURO: 'euro', UNL: 'unl' };
const NT_TROPHY = { WC: 'World Cup', EURO: 'European Championship trophy', UNL: 'Nations League trophy' };
const NT_TAG = { WC: 'WORLD CHAMPIONS', EURO: 'CHAMPIONS OF EUROPE', UNL: 'NATIONS LEAGUE WINNERS' };
const NT_CITY = { ENG: 'London', ESP: 'Madrid', FRA: 'Paris', GER: 'Berlin', ITA: 'Rome', POR: 'Lisbon', NED: 'Amsterdam', BEL: 'Brussels', CRO: 'Zagreb', BRA: 'Rio de Janeiro', ARG: 'Buenos Aires', URU: 'Montevideo', DEN: 'Copenhagen', SUI: 'Bern', AUT: 'Vienna', NOR: 'Oslo', SWE: 'Stockholm', SCO: 'Glasgow', WAL: 'Cardiff', POL: 'Warsaw', TUR: 'Istanbul', SRB: 'Belgrade', GRE: 'Athens', CZE: 'Prague', HUN: 'Budapest', UKR: 'Kyiv', MAR: 'Rabat', SEN: 'Dakar', JPN: 'Tokyo', KOR: 'Seoul', USA: 'New York', MEX: 'Mexico City', COL: 'Bogotá', IRL: 'Dublin' };
const NT_HIST_ALIAS = { GER: ['Germany', 'West Germany'], CZE: ['Czechia', 'Czech Republic', 'Czechoslovakia'], RUS: ['Russia', 'Soviet Union'] };

// ---------- drawn trophies (generic shapes) ----------
function ntMix(a, b, t) { try { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => Math.round(v + (B[i] - v) * t))); } catch (e) { return a; } }
function natTrophySvg(kind, s) {
  s = s || 1; const g = (inner) => `<g transform="scale(${s})">${inner}</g>`;
  if (kind === 'globe') return g(`<defs><radialGradient id="ntg" cx=".35" cy=".35"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#e6b422"/><stop offset="1" stop-color="#9c6f10"/></radialGradient></defs>
    <rect x="-13" y="20" width="26" height="9" rx="2" fill="#7a5410"/><rect x="-11" y="13" width="22" height="8" rx="2" fill="#c8961c"/>
    <path d="M-10,13 C-14,0 -4,-6 -6,-14 L6,-14 C4,-6 14,0 10,13 Z" fill="url(#ntg)"/><path d="M-4,10 C-8,0 2,-4 -1,-12" stroke="#9c6f10" stroke-width="1.4" fill="none"/><path d="M4,10 C8,0 -2,-4 1,-12" stroke="#9c6f10" stroke-width="1.4" fill="none"/>
    <circle cx="0" cy="-24" r="12" fill="url(#ntg)"/><ellipse cx="0" cy="-24" rx="5" ry="12" fill="none" stroke="#9c6f10" stroke-width="1"/><path d="M-12,-24 h24 M-10,-30 h20 M-10,-18 h20" stroke="#9c6f10" stroke-width="1"/>`);
  if (kind === 'euro') return g(`<defs><linearGradient id="nte" x1="0" x2="1"><stop offset="0" stop-color="#8d96a8"/><stop offset=".45" stop-color="#f4f6fb"/><stop offset="1" stop-color="#9aa3b5"/></linearGradient></defs>
    <rect x="-12" y="22" width="24" height="7" rx="2" fill="#5d6577"/><path d="M-9,22 L-5,8 L5,8 L9,22 Z" fill="url(#nte)"/><rect x="-3" y="-6" width="6" height="15" fill="url(#nte)"/>
    <path d="M-12,-34 L12,-34 L9,-12 Q0,-2 -9,-12 Z" fill="url(#nte)"/><path d="M-12,-34 q-8,4 -6,12 q2,6 9,6 M12,-34 q8,4 6,12 q-2,6 -9,6" fill="none" stroke="#c9cfdb" stroke-width="2"/>`);
  return g(`<defs><linearGradient id="ntu" x1="0" x2="1"><stop offset="0" stop-color="#9aa3b5"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#8d96a8"/></linearGradient></defs>
    <rect x="-12" y="22" width="24" height="7" rx="2" fill="#2a3550"/><path d="M-8,22 L-3,-30 L3,-30 L8,22 Z" fill="url(#ntu)"/><path d="M-12,-30 L12,-30 L6,-40 L-6,-40 Z" fill="url(#ntu)"/>
    ${[0, 1, 2, 3, 4].map(i => `<circle cx="${-6 + i * 3}" cy="${-4 + (i % 2) * 4}" r="1.4" fill="#2a3550"/>`).join('')}`);
}
function natCelebSvg(tid, comp, label) {
  const t = T(tid) || {}; const c1 = t.c1 || '#c00', c2 = t.c2 || '#fff';
  let conf = ''; for (let i = 0; i < 70; i++) { const x = (i * 89) % 600, y = (i * 37) % 230; conf += `<rect x="${x}" y="${y}" width="4" height="8" fill="${[c1, c2, '#ffd54a'][i % 3]}" transform="rotate(${i * 31} ${x} ${y})" opacity=".9"/>`; }
  let rays = ''; for (let i = 0; i < 18; i++) { const a = i * 20 * Math.PI / 180; rays += `<path d="M300,120 L${300 + Math.cos(a) * 340},${120 + Math.sin(a) * 340} L${300 + Math.cos(a + .17) * 340},${120 + Math.sin(a + .17) * 340} Z" fill="#fff" opacity=".07"/>`; }
  return `<svg viewBox="0 0 600 250" role="img" aria-label="${esc(t.name || '')} ${esc(NT_TAG[comp] || 'winners')}" style="width:100%;max-width:640px;display:block;background:linear-gradient(135deg,${c1},${ntMix(c1, '#000000', .45)});border:1px solid var(--line);border-radius:6px">
    ${rays}<rect x="0" y="196" width="600" height="54" fill="${c2}" opacity=".9"/><rect x="0" y="190" width="600" height="6" fill="#ffd54a"/>
    <g transform="translate(300,112)">${natTrophySvg(NT_KIND[comp], 2.3)}</g>${conf}
    <text x="300" y="230" text-anchor="middle" font-size="26" font-weight="900" letter-spacing="3" fill="${readable(c2)}">${esc(NT_TAG[comp] || 'WINNERS')}</text>
    <text x="300" y="30" text-anchor="middle" font-size="18" font-weight="800" fill="${readable(c1)}">${esc(t.name || '')} · ${esc(label || '')}</text></svg>`;
}
function natParadeSvg(tid, comp, city) {
  const t = T(tid) || {}; const c1 = t.c1 || '#c00', c2 = t.c2 || '#fff';
  let crowd = ''; for (let i = 0; i < 150; i++) { const x = (i * 41) % 600, y = 158 + ((i * 53) % 62); crowd += `<circle cx="${x}" cy="${y}" r="5" fill="${['#e9c39b', '#c68f5e', '#8d5a3b', '#f1d3b5', '#5e3a24'][i % 5]}"/><rect x="${x - 4}" y="${y + 4}" width="8" height="10" fill="${i % 2 ? c1 : c2}"/>${i % 7 === 0 ? `<rect x="${x + 3}" y="${y - 18}" width="12" height="8" fill="${c1}"/><rect x="${x + 3}" y="${y - 14}" width="12" height="4" fill="${c2}"/><line x1="${x + 3}" y1="${y - 18}" x2="${x + 3}" y2="${y}" stroke="#333"/>` : ''}`; }
  let bld = ''; for (let i = 0; i < 9; i++) { const h = 50 + (i * 37) % 60; bld += `<rect x="${i * 68}" y="${150 - h}" width="60" height="${h}" fill="#8b93a6"/>${Array.from({ length: 3 }, (_, k) => `<rect x="${i * 68 + 8 + k * 17}" y="${160 - h}" width="9" height="12" fill="#cfd8ea"/>`).join('')}`; }
  let conf = ''; for (let i = 0; i < 60; i++) conf += `<rect x="${(i * 97) % 600}" y="${(i * 29) % 140}" width="4" height="7" fill="${i % 2 ? c1 : '#ffd54a'}" transform="rotate(${i * 23} ${(i * 97) % 600} ${(i * 29) % 140})"/>`;
  return `<svg viewBox="0 0 600 240" role="img" aria-label="Victory parade" style="width:100%;max-width:640px;display:block;background:linear-gradient(#5aa0e6,#bfe0ff);border-radius:6px">${bld}<rect y="148" width="600" height="92" fill="#777"/>${crowd}
    <g transform="translate(190,82)"><rect width="220" height="70" rx="8" fill="${c1}" stroke="#111"/><rect y="-10" width="220" height="12" fill="${c2}"/><rect x="10" y="12" width="200" height="22" fill="rgba(255,255,255,.35)"/>${[30, 70, 110, 150, 190].map(x => `<circle cx="${x}" cy="-14" r="5" fill="#e9c39b"/><rect x="${x - 4}" y="-10" width="8" height="10" fill="${c2}"/>`).join('')}<circle cx="44" cy="80" r="13" fill="#222"/><circle cx="176" cy="80" r="13" fill="#222"/><g transform="translate(110,-30)">${natTrophySvg(NT_KIND[comp], .9)}</g><text x="110" y="62" text-anchor="middle" font-size="13" font-weight="800" fill="${readable(c1)}">${esc(NT_TAG[comp] || 'CHAMPIONS')}</text></g>${conf}
    <text x="20" y="24" font-size="15" font-weight="800" fill="#111">${esc(t.name || '')} victory parade · ${esc(city)}</text></svg>`;
}

// ---------- counting titles ----------
function natHistNames(code) { return NT_HIST_ALIAS[code] || [(natRow(code) || {}).name || code]; }
function natTitles(tid, comp) {
  const code = T(tid) && T(tid).code; const names = natHistNames(code);
  const real = (INTL_HIST[comp] || '').split(';').map(x => x.split('|')).filter(r => names.includes(r[1])).map(r => +r[0]);
  const game = ((G.intl && G.intl.hist) || []).filter(h => h.comp === comp && h.w === tid).map(h => +((String(h.name).match(/\d{4}/) || [0])[0]));
  return { real, game, n: real.length + game.length, years: real.concat(game).sort((a, b) => a - b) };
}
function natFinalFx(E) { for (const r of (E.ko || []).slice().reverse()) if (r.n === 'Final') return G.fx[r.fx[r.fx.length - 1]]; return null; }
function natTopScorer(E, tid) {
  const g = {}; for (const id of edFx(E)) { const f = G.fx[id]; if (!f || !f.sc || (f.h !== tid && f.a !== tid)) continue; const side = f.h === tid ? 0 : 1; for (const e of f.sc) if (e[2] === 'G' && e[1] === side && e[3] && P(e[3]) && e[5] !== 'og') g[e[3]] = (g[e[3]] || 0) + 1; }
  const top = Object.entries(g).sort((a, b) => b[1] - a[1])[0]; return top ? [P(top[0]), top[1]] : null;
}

// ---------- the celebration ----------
function natArt(a) { const m = G.news.find(x => x.id === G.newsId); if (m) m.art = a; }
function natCelebrate(E, w, r) {
  const t = T(w); if (!t || !NT_KIND[E.comp]) return;
  const code = t.code; const city = NT_CITY[code] || 'the capital'; const comp = E.comp; const tro = NT_TROPHY[comp];
  const ti = natTitles(w, comp); const n = ti.n || 1; const prev = ti.years.filter(y => y < +((String(E.name).match(/\d{4}/) || [9999])[0]));
  const last = prev.length ? prev[prev.length - 1] : null; const thisY = +((String(E.name).match(/\d{4}/) || [G.year])[0]);
  const nth = n === 1 ? 'first' : ordinal(n);
  const hist = n === 1 ? `It is the first ${tro} in ${t.name}'s history.` : last && thisY - last >= 20 ? `It is their ${nth} ${tro} and the first since ${last}, ending a wait of ${thisY - last} years.` : `It is their ${nth} ${tro}${last ? `, after ${last}` : ''}.`;
  const f = natFinalFx(E); let fin = '';
  if (f && f.r) { const wh = f.h === w; const sc = wh ? `${f.r[0]}-${f.r[1]}` : `${f.r[1]}-${f.r[0]}`; fin = ` They beat ${tName(r, false)} ${sc}${f.pen ? ` after extra time, then ${wh ? f.pen[0] : f.pen[1]}-${wh ? f.pen[1] : f.pen[0]} on penalties` : f.et ? ' after extra time' : ''} in the final${f.ven ? ` at ${f.ven}` : ''}.`; }
  else fin = ` They beat ${tName(r, false)} in the final.`;
  const ts = natTopScorer(E, w); const tsl = ts && ts[1] >= 2 ? ` ${ts[0].n} led the way with ${ts[1]} goals in the tournament.` : '';
  const userMgr = w === ENGID && userIsEng();
  const mgl = userMgr ? ` Manager ${G.mgr} becomes a national hero.` : '';
  let sq = []; try { sq = natSquad(code) || []; } catch (e) { }
  const mine = sq.filter(p => p.c === G.user);
  const ml = mine.length ? ` ${userTeam().name}'s ${mine.map(p => p.n).join(', ')} ${mine.length > 1 ? 'are' : 'is'} among the winners.` : '';
  const head = comp === 'WC' ? `${t.name} are world champions!` : comp === 'EURO' ? `${t.name} are champions of Europe!` : `${t.name} win the Nations League`;
  news(head, `${t.name} have won the ${E.name}!${fin} ${hist}${tsl}${mgl}${ml} The squad return home for a victory parade through ${city}.`, w, true);
  natArt({ k: 'ntro', tid: w, comp, l: E.name });
  const crowd = comp === 'UNL' ? 'tens of thousands of' : comp === 'EURO' ? 'hundreds of thousands of' : 'more than a million';
  news(`Victory parade in ${city}`, `${crowd[0].toUpperCase() + crowd.slice(1)} supporters line the streets of ${city} as the ${t.name} squad parade the ${tro} on an open-top bus. ${comp !== 'UNL' ? `The players and staff are expected to be recognised in the national honours list, and the ${E.name} winners will be remembered as one of the great ${t.name} sides.` : 'Players take turns lifting the trophy from the top deck as flares light up the evening.'}`, w, true);
  natArt({ k: 'npar', tid: w, comp, city });
  // honours for the squad (shown on player cards and non-playing profiles)
  for (const p of sq) { p.nh = (p.nh || []).concat(`${E.name} winner`); if (p.c === G.user) p.mor = clamp((p.mor || 70) + 10, 0, 100); }
  const honT = comp === 'WC' ? 'world champion' : comp === 'EURO' ? 'European champion' : 'Nations League winner';
  if (mine.length) msg(mine.length > 1 ? `Your players are ${honT}s` : `Your player is a ${honT}`, `${mine.map(p => p.n).join(', ')} won the ${E.name} with ${t.name}. Morale is sky high, and ${mine.length > 1 ? 'they come' : 'he comes'} back to ${userTeam().name} as ${honT}${mine.length > 1 ? 's' : ''}.`);
  // the manager
  if (userMgr) {
    G.mgrNat = (G.mgrNat || []).concat({ n: E.name, comp, tid: w, y: thisY });
    G.mgrRep = clamp(G.mgrRep + (comp === 'UNL' ? 2 : 4), 20, 99);
    if (comp !== 'UNL') { G.mgrHon = (G.mgrHon || []).concat(`National honour for services to football (${thisY})`); msg('National honours', `${G.mgr} is named in the national honours list for services to football after winning the ${E.name} with ${t.name}.`); }
  }
  if (w === ENGID) G.natParade = { tid: w, comp, l: E.name, city };
  // social
  try {
    const fp = fanPost(w, R.pick([`${NT_TAG[comp]} 🏆🏆🏆 I can't stop crying`, `${t.name.toUpperCase()}!!! ${nth === 'first' ? 'FIRST EVER' : nth.toUpperCase()} ${comp === 'WC' ? 'STAR ON THE SHIRT ⭐' : 'TROPHY'} 🏆`, `See you all in ${city} for the parade 🚌🏆`]), { big: true, u: w === ENGID ? 1 : 0 });
    reply(fp, r, R.pick(['Lucky. Very lucky.', 'We\'ll be back. Enjoy it while it lasts', 'Ref had a shocker but fair play 🤝']));
    for (const p of mine.slice(0, 2)) fanPost(G.user, `${surname(p.n)} is a ${comp === 'WC' ? 'WORLD CHAMPION' : comp === 'EURO' ? 'European champion' : 'Nations League winner'} and he plays for US 🏆😍`, { u: 1 });
    trend(t.name, 6); trend(comp === 'WC' ? 'World Cup' : E.name, 4);
  } catch (e) { }
}
const _feNH = finishEdition;
finishEdition = function (E, w, r) {
  const id0 = G.newsId; _feNH(E, w, r);
  try { if (NT_KIND[E.comp]) G.news = G.news.filter(n => !(n.id > id0 && n.title === E.name && n.body.startsWith(tName(w, false) + ' win the'))); natCelebrate(E, w, r); } catch (e) { console.error(e); }
};

// ---------- showing it ----------
function natArtHtml(a) {
  if (!a || !T(a.tid)) return '';
  if (a.k === 'ntro') return `<div style="margin:8px 0 12px">${natCelebSvg(a.tid, a.comp, a.l)}</div>`;
  if (a.k === 'npar') return `<div style="margin:8px 0 12px">${natParadeSvg(a.tid, a.comp, a.city)}</div>`;
  return '';
}
const _sibNH = scrInbox;
scrInbox = function () {
  const h = _sibNH();
  try {
    const m = G.news.find(x => x.id === UI.msg); if (!m || !m.art) return h;
    const k = h.indexOf('<div class="box mbody">'); if (k < 0) return h;
    const j = h.indexOf('</div>', h.indexOf('<div class="dim mono"', k)); if (j < 0) return h;
    return h.slice(0, j + 6) + natArtHtml(m.art) + h.slice(j + 6);
  } catch (e) { console.error(e); return h; }
};
const _renNH = render;
render = function () {
  try { if (G && G.natParade && !UI.match && !UI.modal) { const p = G.natParade; G.natParade = null; UI.modal = `<div class="band"><span>${esc(NT_TAG[p.comp] || 'Champions')}</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">${natCelebSvg(p.tid, p.comp, p.l)}<div style="height:10px"></div>${natParadeSvg(p.tid, p.comp, p.city)}<p>${esc(T(p.tid).name)} win the ${esc(p.l)}. The squad parade the trophy through ${esc(p.city)} on an open-top bus${userIsEng() ? `, with ${esc(G.mgr)} on the top deck` : ''}.</p></div>`; } } catch (e) { console.error(e); }
  _renNH.apply(this, arguments);
};

// national trophy cabinet on the International › History tab
function natCabinetSvg(tid) {
  const t = T(tid); if (!t) return '';
  const items = ['WC', 'EURO', 'UNL'].filter(c => c !== 'EURO' || t.conf === 'UEFA').filter(c => c !== 'UNL' || t.conf === 'UEFA').map(c => ({ c, ...natTitles(tid, c) }));
  const W = 600, H = 190;
  const g = items.map((it, i) => { const x = 100 + i * 200; return `<g transform="translate(${x},92)" opacity="${it.n ? 1 : .35}">${natTrophySvg(NT_KIND[it.c], 1.5)}</g><text x="${x}" y="152" text-anchor="middle" font-size="12" fill="#fff">${esc({ WC: 'World Cup', EURO: 'European Championship', UNL: 'Nations League' }[it.c])}</text><text x="${x}" y="174" text-anchor="middle" font-size="16" font-weight="800" fill="#ffd54a">×${it.n}</text>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.name)} trophy cabinet" style="width:100%;max-width:640px;display:block;background:linear-gradient(${ntMix(t.c1 || '#223344', '#000000', .55)},#141a2c);border:1px solid var(--line);border-radius:6px"><text x="${W / 2}" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${esc(t.name)} trophy cabinet</text>${g}<rect x="20" y="132" width="${W - 40}" height="4" fill="#6b4a2b"/></svg>`;
}
const _ihNH = intlHistHtml;
intlHistHtml = function () {
  const h = _ihNH();
  try {
    const t = T(ENGID); const yrs = ['WC', 'EURO', 'UNL'].map(c => [c, natTitles(ENGID, c)]).filter(x => x[1].n);
    const list = yrs.length ? `<div class="dim" style="font-size:12.5px;margin-top:6px">${yrs.map(([c, x]) => `${{ WC: 'World Cup', EURO: 'European Championship', UNL: 'Nations League' }[c]}: ${x.years.join(', ')}`).join(' · ')}</div>` : '';
    return `<h2 class="sect">Honours</h2>${natCabinetSvg(ENGID)}${list}` + h;
  } catch (e) { console.error(e); return h; }
};
// player cards: international honours
const _peNH = playerExtra;
playerExtra = function (p) { const h = _peNH(p); try { if (p && p.nh && p.nh.length) return h + `<div class="box pad" style="margin-top:8px"><label class="lb">International honours</label>${p.nh.map(x => `<div>🏆 ${esc(x)}</div>`).join('')}</div>`; } catch (e) { } return h; };
// manager profile: trophies won as a national manager and national honours
const _smNH = scrManager;
scrManager = function () {
  let h = _smNH();
  try {
    const L = G.mgrNat || []; const hon = G.mgrHon || []; if (!L.length && !hon.length) return h;
    const box = `<h2 class="sect">International honours</h2><div class="row" style="gap:10px;flex-wrap:wrap">${L.map(x => `<div style="flex:1 1 260px;max-width:320px">${natCelebSvg(x.tid, x.comp, x.n)}</div>`).join('')}</div>${hon.length ? `<div style="margin-top:8px">${hon.map(x => `<div>🎖️ ${esc(x)}</div>`).join('')}</div>` : ''}`;
    const i = h.lastIndexOf('</div>'); return i > 0 ? h.slice(0, i) + box + h.slice(i) : h + box;
  } catch (e) { console.error(e); return h; }
};
