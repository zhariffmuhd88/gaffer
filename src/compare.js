// compare.js: FC-style player comparison. Up to three players from anywhere (any club, youth, abroad, free agents),
// a hexagon radar of face stats derived from the game's 1-20 attributes, card headers, a side-by-side attribute
// table with the better value highlighted, season stats with per-90 numbers, form and happiness.
// Loaded after extras.js. Reached from the player profile ("Compare"), the Squad and Transfers screens.

const CMP_COL = ['#ffd23f', '#45e1f0', '#ff73d8'];
const FACE_OUT = [['PAC', { Pac: 1 }], ['SHO', { Fin: .55, Lon: .3, Pos: .15 }], ['PAS', { Pas: .5, Cre: .3, Crs: .2 }], ['DRI', { Dri: .65, Fla: .35 }], ['DEF', { Tck: .45, Mar: .4, Hea: .15 }], ['PHY', { Str: .45, Sta: .35, Hea: .2 }]];
const FACE_GK = [['DIV', { Ref: .5, OvO: .3, Aer: .2 }], ['HAN', { Han: 1 }], ['KIC', { Kic: 1 }], ['REF', { Ref: 1 }], ['SPD', { Pac: 1 }], ['POS', { Pos: 1 }]];
function faceStats(p, gk) {
  const a = attrs(p); const spec = gk ? FACE_GK : FACE_OUT;
  return spec.map(([k, w]) => { let s = 0, t = 0; for (const x in w) if (a[x] != null) { s += a[x] * w[x]; t += w[x]; } const v = t ? s / t : 1; return [k, clamp(Math.round(24 + v * 3.55), 25, 99)]; });
}
function cmpPlayers() { UI.cmp = (UI.cmp || []).filter(id => P(id)); return UI.cmp.map(P); }
function estMins(p) { return p.st.s * 86 + Math.max(0, p.st.a - p.st.s) * 24; }
function per90(n, p) { const m = estMins(p); return m >= 90 ? (n * 90 / m).toFixed(2) : '-'; }
function clubTxt(p) { return T(p.c) ? tName(p.c) : p.c === 'FA' ? 'Free agent' : p.c === 'ABROAD' ? (p.ab || p.gone || 'Abroad') : String(p.c).startsWith('REL_') ? 'Without a club' : (p.gone || p.c); }
function radarSvg(ps, gk) {
  const N = 6, cx = 180, cy = 140, R = 96; const sc = (v) => R * clamp((v - 40) / 59, 0.03, 1);
  const ang = (i) => -Math.PI / 2 + i * 2 * Math.PI / N;
  const pt = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r];
  const labels = (gk ? FACE_GK : FACE_OUT).map(x => x[0]);
  let g = '';
  for (const f of [.25, .5, .75, 1]) g += `<polygon points="${[...Array(N)].map((_, i) => pt(i, R * f).join(',')).join(' ')}" fill="none" stroke="rgba(152,163,214,${f === 1 ? .55 : .22})" stroke-width="1"/>`;
  for (let i = 0; i < N; i++) { const [x, y] = pt(i, R); g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(152,163,214,.22)"/>`; }
  ps.forEach((p, j) => {
    const fs = faceStats(p, gk); const pts = fs.map(([, v], i) => pt(i, sc(v)).join(',')).join(' ');
    g += `<polygon points="${pts}" fill="${CMP_COL[j]}" fill-opacity=".16" stroke="${CMP_COL[j]}" stroke-width="2.2" stroke-linejoin="round"/>`;
    fs.forEach(([, v], i) => { const [x, y] = pt(i, sc(v)); g += `<circle cx="${x}" cy="${y}" r="3" fill="${CMP_COL[j]}"/>`; });
  });
  labels.forEach((l, i) => {
    const [x, y] = pt(i, R + 26); const vals = ps.map((p, j) => `<tspan fill="${CMP_COL[j]}">${faceStats(p, gk)[i][1]}</tspan>`).join('<tspan fill="#98a3d6"> · </tspan>');
    g += `<text x="${x}" y="${y - 4}" text-anchor="middle" font-size="13" font-weight="700" fill="#edf0ff">${l}</text><text x="${x}" y="${y + 11}" text-anchor="middle" font-size="11.5" font-family="monospace">${vals}</text>`;
  });
  return `<svg class="cmpradar" viewBox="0 0 360 290" role="img" aria-label="Radar chart of ${labels.join(', ')}">${g}</svg>`;
}
function formSpark(p, col) {
  const f = (p.form || []).slice(-8); if (f.length < 2) return '<span class="dim">-</span>';
  const W = 90, H = 26; const x = (i) => 3 + i * (W - 6) / (f.length - 1); const y = (v) => H - 3 - (clamp(v, 5, 9) - 5) / 4 * (H - 6);
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="${f.map((v, i) => x(i) + ',' + y(v)).join(' ')}" fill="none" stroke="${col}" stroke-width="2"/>${f.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="2" fill="${col}"/>`).join('')}</svg>`;
}
function cmpCard(p, j) {
  return `<div class="cmpcard" style="border-top:4px solid ${CMP_COL[j]}"><div class="row" style="justify-content:space-between;align-items:flex-start;gap:6px;flex-wrap:nowrap">
    <div><div class="cmpovr" style="color:${CMP_COL[j]}">${p.ca}</div><div class="mono dim" style="font-size:12px">${POS_LABEL[p.pos]}</div></div>
    <button class="x" data-a="cmprm" data-v="${p.id}" aria-label="Remove ${esc(p.n)}" style="position:static">×</button></div>
    <div class="click" data-a="player" data-v="${p.id}" style="font-weight:700;margin-top:4px">${esc(p.n)}</div>
    <div class="dim" style="font-size:12.5px">${p.age} · ${esc(natRow(p.nat) ? natRow(p.nat).name : p.nat)}</div>
    <div style="font-size:12.5px">${esc(clubTxt(p))}</div>
    <div class="dim mono" style="font-size:12px">${money(calcValue(p))} · ${wageStr(p.wage || 0)}</div>
    <div class="stars" style="font-size:13px" title="Scout's view of potential">${potStars(p)}</div></div>`;
}
function cmpTable(ps, gk) {
  const anyGk = ps.some(p => p.pos === 'GK');
  const keys = gk ? ['Han', 'Ref', 'Aer', 'Kic', 'OvO', 'Pos', 'Pas', 'Pac', 'Sta', 'Str', 'Det', 'Tea'] : ATTR_OUT.concat(anyGk ? ATTR_GK : []);
  const A = ps.map(attrs);
  const row = (lab, vals, fmt, low) => {
    const nums = vals.map(v => typeof v === 'number' ? v : parseFloat(v)).map(v => isNaN(v) ? null : v);
    const ok = nums.filter(v => v != null); const best = ok.length > 1 ? (low ? Math.min(...ok) : Math.max(...ok)) : null;
    const allSame = ok.length > 1 && ok.every(v => v === ok[0]);
    return `<tr><td>${lab}</td>${vals.map((v, j) => `<td class="n mono ${best != null && !allSame && nums[j] === best ? 'cmpbest' : ''}" style="${best != null && !allSame && nums[j] === best ? `color:${CMP_COL[j]}` : ''}">${fmt ? fmt(v) : v}</td>`).join('')}</tr>`;
  };
  const head = `<thead><tr><th></th>${ps.map((p, j) => `<th class="n" style="color:${CMP_COL[j]}">${esc(surname(p.n))}</th>`).join('')}</tr></thead>`;
  const face = (gk ? FACE_GK : FACE_OUT).map((x, i) => row(`<b>${x[0]}</b>`, ps.map(p => faceStats(p, gk)[i][1]))).join('');
  const att = keys.map(k => row(ATTR_NAMES[k], A.map(a => a[k] == null ? '-' : a[k]))).join('');
  const st = [
    row('Apps (starts)', ps.map(p => `${p.st.a} (${p.st.s})`)),
    row('Goals', ps.map(p => p.st.g)), row('Assists', ps.map(p => p.st.as)),
    row('Average rating', ps.map(p => p.st.a ? +(p.st.r / p.st.a).toFixed(2) : '-')),
    row('Player of the match', ps.map(p => p.st.mom || 0)),
    row('Goals per 90', ps.map(p => per90(p.st.g, p))), row('Assists per 90', ps.map(p => per90(p.st.as, p))),
    row('Goal involvements per 90', ps.map(p => per90(p.st.g + p.st.as, p))),
    ...(ps.some(p => p.pos === 'GK') ? [row('Clean sheets', ps.map(p => p.st.cs || 0))] : []),
    row('Disciplinary points', ps.map(p => (p.st.y || 0) + (p.st.rc || 0) * 3), null, true),
    row('Career apps (this save)', ps.map(p => p.car.a)), row('Career goals (this save)', ps.map(p => p.car.g)),
    row('International caps', ps.map(p => p.ic || 0))
  ].join('');
  const extra = `<tr><td>Form (last ratings)</td>${ps.map((p, j) => `<td class="n">${formSpark(p, CMP_COL[j])}</td>`).join('')}</tr>
    <tr><td>Happiness</td>${ps.map(p => { if (p.c !== G.user) return '<td class="n dim">-</td>'; const h = Math.round(hap(p)); return `<td class="n ${hapCls(h)}">${hapLabel(h)}</td>`; }).join('')}</tr>
    <tr><td>Condition / morale</td>${ps.map(p => `<td class="n mono">${Math.round(p.cond)}% / ${Math.round(p.mor)}</td>`).join('')}</tr>
    <tr><td>Contract until</td>${ps.map(p => `<td class="n mono">${p.con || '-'}</td>`).join('')}</tr>`;
  return `<h2 class="sect">Face stats</h2><div class="tw"><table class="t cmpt">${head}<tbody>${face}</tbody></table></div>
  <h2 class="sect">This season</h2><div class="tw"><table class="t cmpt">${head}<tbody>${st}${extra}</tbody></table></div>
  <p class="dim" style="font-size:12px;margin:4px 0 0">Per-90 numbers use estimated minutes (starts and substitute appearances). Disciplinary points: yellow 1, red 3; lower is better.</p>
  <h2 class="sect">Attributes</h2><div class="tw"><table class="t cmpt">${head}<tbody>${att}</tbody></table></div>`;
}
function cmpSearch(q) {
  q = (q || '').trim().toLowerCase(); if (q.length < 2) return '';
  const have = new Set(UI.cmp || []);
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const qq = norm(q);
  const hits = Object.values(G.players).filter(p => p && p.n && p.c !== 'RETIRED' && !have.has(p.id) && norm(p.n).includes(qq)).sort((a, b) => b.ca - a.ca).slice(0, 8);
  return hits.length ? hits.map(p => `<button class="btn cmphit" data-a="cmpadd" data-v="${p.id}"><b>${esc(p.n)}</b> <span class="dim">${POS_LABEL[p.pos]} · ${p.age} · ${esc(clubTxt(p))}</span> <span class="mono yel">${p.ca}</span></button>`).join('') : '<span class="dim">No player found.</span>';
}
function scrCompare() {
  const ps = cmpPlayers();
  const gk = ps.length > 0 && ps.every(p => p.pos === 'GK');
  const tray = `<div class="box pad" style="margin-top:8px"><label class="lb" for="cmpq">Add a player (any club, youth, abroad, free agent)</label><input class="f" id="cmpq" autocomplete="off" placeholder="Type a name…" style="width:100%;max-width:420px" value="${esc(UI.cmpQ || '')}"><div id="cmpres" class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">${cmpSearch(UI.cmpQ)}</div>
    <div class="dim" style="font-size:12.5px;margin-top:6px">Compare up to three players. ${ps.length >= 3 ? 'Adding another replaces the last one.' : ''} You can also press Compare on any player's profile.</div></div>`;
  if (!ps.length) return `<div class="band">Compare players<small>FC-style comparison</small></div>${tray}`;
  return `<div class="band">Compare players<small>${ps.map(p => esc(p.n)).join(' v ')}</small></div>${tray}
  <div class="cmpcards" style="margin-top:10px">${ps.map(cmpCard).join('')}</div>
  <div class="cmpwrap">${radarSvg(ps, gk)}</div>
  ${ps.length > 1 && ps.some(p => p.pos === 'GK') && !gk ? '<p class="dim" style="font-size:12.5px;text-align:center;margin:0">Outfield face stats are shown because the players play different positions.</p>' : ''}
  ${cmpTable(ps, gk)}`;
}
const _scrCmp = screen;
screen = function (s) { if (s === 'compare') { try { return scrCompare(); } catch (e) { console.error(e); return '<p class="dim">Comparison unavailable.</p>'; } } return _scrCmp(s); };
function cmpAdd(pid) { UI.cmp = (UI.cmp || []).filter(id => id !== pid); if (UI.cmp.length >= 3) UI.cmp[2] = pid; else UI.cmp.push(pid); }
Object.assign(ACT, {
  cmpadd: (v) => { cmpAdd(v); UI.cmpQ = ''; UI.modal = null; UI.mstack = []; UI.scr = 'compare'; render(); window.scrollTo(0, 0); },
  cmprm: (v) => { UI.cmp = (UI.cmp || []).filter(id => id !== v); render(); },
  cmpgo: () => { UI.modal = null; UI.scr = 'compare'; render(); window.scrollTo(0, 0); }
});
document.addEventListener('input', (ev) => { const el = ev.target; if (!el || el.id !== 'cmpq') return; UI.cmpQ = el.value; const r = document.getElementById('cmpres'); if (r) r.innerHTML = cmpSearch(el.value); });
// "Compare" on every player profile
const _pmCmp = playerModal;
playerModal = function (pid) {
  _pmCmp(pid);
  try {
    if (!UI.modal || !P(pid)) return; const k = '<div class="row" style="margin-top:14px">'; const i = UI.modal.lastIndexOf(k); if (i < 0) return;
    const n = (UI.cmp || []).filter(id => id !== pid).length;
    UI.modal = UI.modal.slice(0, i + k.length) + `<button class="btn" data-a="cmpadd" data-v="${pid}">⇄ Compare${n ? ` (with ${n} other${n > 1 ? 's' : ''})` : ''}</button>` + UI.modal.slice(i + k.length);
    render();
  } catch (e) { console.error(e); }
};
// entry points on the Squad and Transfers screens
const _scrCmp2 = screen;
screen = function (s) {
  const h = _scrCmp2(s);
  if ((s === 'squad' || s === 'transfers') && typeof h === 'string') { const i = h.indexOf('</div>', h.indexOf('<div class="band">')); if (i > 0) return h.slice(0, i + 6) + `<div class="row" style="margin:8px 0 0"><button class="btn" data-a="cmpgo">⇄ Compare players${(UI.cmp || []).length ? ` (${UI.cmp.length})` : ''}</button></div>` + h.slice(i + 6); }
  return h;
};
