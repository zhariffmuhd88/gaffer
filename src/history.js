// history.js: competition history (real winners + every in-game season), club honours, manager world rankings.
// Loaded after club.js.

const HIST_COMPS = [['LG', 'English champions', 'PL'], ['CH', 'Championship', 'CH'], ['FA', 'FA Cup', 'FA'], ['LC', 'League Cup', 'LC'], ['UCL', 'European Cup / Champions League', 'UCL'], ['UEL', 'UEFA Cup / Europa League', 'UEL'], ['UECL', 'Conference League', 'UECL']];
const HIST_ALIAS = { 'The Wednesday': 'Sheffield Wednesday', 'Birmingham': 'Birmingham City', 'Inter Milan': 'Inter', 'Paris Saint-Germain': 'Paris SG', 'Atlético Madrid': 'Atletico Madrid', 'Milan': 'AC Milan', 'PSV Eindhoven': 'PSV', 'Porto': 'FC Porto', 'SC Freiburg': 'Freiburg', 'Red Star Belgrade': 'Red Star Belgrade' };
let _HR = null;
function histRows() {
  if (_HR) return _HR;
  _HR = {};
  for (const k in HIST) _HR[k] = HIST[k].split('\n').map(l => { const [y, w, r] = l.split('|'); return { y: +y, w: HIST_ALIAS[w] || w, r: HIST_ALIAS[r] || r }; });
  return _HR;
}
function histSeason(y, code) { return code === 'FA' || code === 'LC' ? String(y + 1) : seasonLabel(y); }
let _NI = null;
function teamByName(n) {
  if (!_NI || _NI.g !== G || _NI.n !== Object.keys(G.teams).length) { _NI = { g: G, n: Object.keys(G.teams).length, m: {} }; for (const t of Object.values(G.teams)) { _NI.m[t.name] = t.id; if (t.short) _NI.m[t.short] = _NI.m[t.short] || t.id; } }
  return _NI.m[n] || null;
}
function teamOrName(n) { const id = teamByName(n); return id ? tLink(id, true) : esc(n); }

// ---------- in-game season records ----------
function chistStore() { if (!G.chist) G.chist = []; return G.chist; }
function compStats(code) {
  const goals = {}, rat = {}, apps = {};
  for (const f of Object.values(G.fx)) {
    if (f.comp !== code || !f.r) continue;
    if (f.sc) for (const e of f.sc) if (e[2] === 'G' && e[3] && P(e[3]) && !(e[5] === 'og')) goals[e[3]] = (goals[e[3]] || 0) + 1;
    if (f.rt) for (const side of f.rt) if (side) for (const [id, r] of side) { rat[id] = (rat[id] || 0) + r; apps[id] = (apps[id] || 0) + 1; }
  }
  const tsId = Object.keys(goals).sort((a, b) => goals[b] - goals[a] || (apps[a] || 0) - (apps[b] || 0))[0];
  const maxA = Math.max(0, ...Object.values(apps));
  const minA = LEAGUE_COMPS.includes(code) ? Math.max(5, maxA * .5) : Math.max(2, Math.min(4, maxA * .6));
  const bpId = Object.keys(apps).filter(id => apps[id] >= minA && P(id)).sort((a, b) => rat[b] / apps[b] - rat[a] / apps[a])[0];
  const pk = (id, v) => id && P(id) ? [P(id).n, P(id).c, v, id] : null;
  return { ts: pk(tsId, goals[tsId]), bp: bpId ? pk(bpId, +(rat[bpId] / apps[bpId]).toFixed(2)) : null };
}
function finalOf(code) { return Object.values(G.fx).find(f => f.comp === code && f.rnd === 'Final' && f.r); }
function recordSeason() {
  const rec = { y: G.year, s: seasonLabel(G.year), c: {} };
  const add = (code, w, r) => { const st = compStats(code); rec.c[code] = { w: w || null, r: r || null, ts: st.ts, bp: st.bp }; };
  const tb = leagueTable(), ct = champTable();
  add('PL', tb[0].t, tb[1].t);
  add('CH', ct[0].t, ct[1].t);
  for (const c of ['FA', 'LC', 'PO']) { const cup = G.cups[c]; if (!cup) continue; const f = finalOf(c); const w = cup.winner; add(c, w, f ? (f.h === w ? f.a : f.h) : null); }
  for (const c of ['UCL', 'UEL', 'UECL']) { const E = G.euro && G.euro[c]; if (!E) continue; const f = finalOf(c); const w = E.winner; add(c, w, f ? (f.h === w ? f.a : f.h) : null); }
  return rec;
}

// ---------- manager rankings ----------
const TRO_W = { 'Premier League': 20, 'Championship': 4, 'Championship play-offs': 2, 'FA Cup': 6, 'Carabao Cup': 4, 'Champions League': 30, 'Europa League': 15, 'Conference League': 8 };
const AW_W = { 'Manager of the Month': 1, 'Manager of the Season': 5 };
function mrk() { if (!G.mrk) G.mrk = { pts: {}, tro: {}, prev: {}, mv: {}, seen: {} }; return G.mrk; }
let _MI = null;
function mgrIndex() { if (_MI) return _MI; _MI = {}; for (const m of MGR_DATA) _MI[m[0]] = m; return _MI; }
function mgrBase(m) { let s = 0; for (const tok of (m[4] || '').split(' ')) { if (!tok) continue; s += (MGR_W[tok[0]] || 0) * (+tok.slice(1) || 1); } return s; }
function mgrOfTeam(tid) {
  const t = T(tid); if (!t) return null;
  if (!t.lite) return t.mgr;
  const m = MGR_DATA.find(x => x[2] === 'a' && x[3] === t.name); return m ? m[0] : null;
}
function mgrClub(m) {
  const id = fullTeams().find(t => T(t).mgr === m[0] && t !== G.user);
  if (id) return { tid: id, txt: tName(id, true) };
  if (m[3]) return { tid: teamByName(m[3]), txt: m[3] };
  return { tid: null, txt: 'Without a club' };
}
function mgrActive(m) {
  if (m[2] === 'r' || m[2] === 'd') return false;
  return true;
}
function userPoints() {
  const mp = G.mgrP; if (!mp) return 0; let s = 0;
  for (const st of mp.rec || []) for (const tr of st.tro || []) { const n = tr.replace(/^\d{4}\/\d{2} /, ''); s += TRO_W[n] || 0; }
  for (const a of mp.aw || []) s += AW_W[a.n] || 0;
  return s + (mrk().pts['@user'] || 0);
}
function rankPool() {
  const M = mrk(); const out = [];
  for (const m of MGR_DATA) {
    if (G.mgrP && m[0] === G.mgrP.name) continue;
    const extra = M.pts[m[0]] || 0; const cl = mgrClub(m);
    const ingameActive = !m[3] && !fullTeams().some(t => T(t).mgr === m[0]);
    out.push({ k: m[0], n: m[0], nat: m[1], st: ingameActive && m[2] === 'a' ? 'f' : m[2], club: ingameActive && m[2] === 'a' ? { tid: null, txt: 'Without a club' } : cl, pts: mgrBase(m) + extra, base: m[4], eng: m[5] || (cl.tid && divOf(cl.tid)), extra });
  }
  const mp = G.mgrP || {};
  out.push({ k: '@user', n: G.mgr, nat: mp.nat || 'England', st: G.sacked ? 'f' : 'a', club: { tid: G.sacked ? null : G.user, txt: G.sacked ? 'Without a club' : tName(G.user, true) }, pts: userPoints(), base: '', eng: 1, me: 1 });
  return out;
}
function rankList(kind) {
  let pool = rankPool();
  if (kind === 'cur') pool = pool.filter(x => x.st !== 'r' && x.st !== 'd');
  else if (kind === 'eng') pool = pool.filter(x => x.eng);
  else if (kind === 'eur') pool = pool.filter(x => REGION_OF[x.nat] === 'Europe');
  else if (kind === 'reg') { const reg = userRegion(); pool = pool.filter(x => REGION_OF[x.nat] === reg); }
  pool.sort((a, b) => b.pts - a.pts || (a.me ? -1 : b.me ? 1 : a.n.localeCompare(b.n)));
  let r = 0, last = null; pool.forEach((x, i) => { if (x.pts !== last) { r = i + 1; last = x.pts; } x.rk = r; });
  return pool;
}
function userRegion() { const nat = (G.mgrP && G.mgrP.nat) || 'England'; return REGION_OF[nat] || 'Europe'; }
function seasonFinishPoints() {
  const M = mrk();
  const give = (tid, p) => { if (!p) return; const k = tid === G.user ? '@user' : T(tid).mgr; if (k !== '@user' && !mgrIndex()[k]) return; M.pts[k] = (M.pts[k] || 0) + p; };
  leagueTable().forEach((r, i) => give(r.t, [6, 4, 3, 2, 2, 1, 1, 1, 1, 1][i] || 0));
  champTable().forEach((r, i) => { if (!T(r.t).lite) give(r.t, [3, 2, 1, 1, 1, 1][i] || 0); });
}
function updateRanks() {
  const M = mrk();
  const before = M.prev.all ? M.prev.all['@user'] : null;
  for (const kind of ['all', 'cur', 'eng', 'eur', 'reg']) {
    const L = rankList(kind); const now = {}; L.forEach(x => now[x.k] = x.rk);
    const prev = M.prev[kind] || {}; M.mv[kind] = {};
    for (const k in now) if (prev[k]) M.mv[kind][k] = prev[k] - now[k];
    M.prev[kind] = now;
  }
  // inbox news for the user's climb
  const all = rankList('all'); const me = all.find(x => x.me); if (!me) return;
  for (const th of [50, 25, 10, 3, 1]) if (me.rk <= th && !(M.seen['t' + th])) { M.seen['t' + th] = 1; msg(th === 1 ? 'World number one' : `Top ${th} in the world`, th === 1 ? `${G.mgr} is now the highest-ranked manager of all time in the GAFFER world rankings, with ${me.pts} points.` : `${G.mgr} has climbed into the top ${th} of the all-time manager rankings (${ordinal(me.rk)}, ${me.pts} points).`); break; }
  const passed = all.filter(x => !x.me && (x.st === 'r' || x.st === 'd') && x.pts < me.pts && !M.seen['p' + x.k]);
  if (passed.length && me.pts > 0) { for (const x of passed) M.seen['p' + x.k] = 1; const top = passed.sort((a, b) => b.pts - a.pts).slice(0, 3); msg('Rankings: legends passed', `With ${me.pts} points, ${G.mgr} has moved past ${top.map(x => x.n + ' (' + x.pts + ')').join(', ')}${passed.length > 3 ? ` and ${passed.length - 3} more` : ''} in the all-time rankings.`); }
  if (before) { const d = before - M.prev.all['@user']; if (d) news('Manager rankings', `${G.mgr} ${d > 0 ? 'rises' : 'drops'} ${Math.abs(d)} place${Math.abs(d) === 1 ? '' : 's'} to ${ordinal(M.prev.all['@user'])} in the all-time manager rankings.`, G.user); }
}

// honours won by real managers' clubs during the game
const _honH = honour;
honour = function (tid, name) {
  _honH(tid, name);
  try { if (tid !== G.user) { const k = mgrOfTeam(tid); if (k && mgrIndex()[k] && TRO_W[name]) { const M = mrk(); M.pts[k] = (M.pts[k] || 0) + TRO_W[name]; (M.tro[k] = M.tro[k] || []).push(seasonLabel(G.year) + ' ' + name); } } } catch (e) { console.error(e); }
};

// season end: record the season, finishing points, then rankings
const _seH = seasonEnd;
seasonEnd = function () {
  let rec = null;
  try { rec = recordSeason(); seasonFinishPoints(); } catch (e) { console.error(e); }
  _seH.apply(this, arguments);
  try {
    if (rec) {
      const A = G.awards && G.awards.s || [];
      for (const lg of ['PL', 'CH']) { const a = A.filter(x => x.lg === lg && x.s === rec.s).pop(); if (a && a.best && rec.c[lg]) rec.c[lg].bp = [a.best.n, a.best.club, a.best.avg, a.best.pid]; if (a && a.boot && rec.c[lg]) rec.c[lg].ts = [a.boot.n, a.boot.club, a.boot.g, a.boot.pid]; }
      chistStore().push(rec);
    }
    updateRanks();
  } catch (e) { console.error(e); }
};

// ---------- club honours ----------
function clubHonours(tid) {
  const t = T(tid); if (!t) return [];
  const R = histRows(); const out = [];
  const nm = t.name;
  const map = { LG: 'PL', CH: 'CH', FA: 'FA', LC: 'LC', UCL: 'UCL', UEL: 'UEL', UECL: 'UECL' };
  for (const [code, label] of HIST_COMPS) {
    const rows = R[code] || [];
    const real = rows.filter(r => r.w === nm), ru = rows.filter(r => r.r === nm).length;
    const game = chistStore().filter(h => h.c[map[code]] && h.c[map[code]].w === tid);
    const gru = chistStore().filter(h => h.c[map[code]] && h.c[map[code]].r === tid).length;
    const n = real.length + game.length;
    if (n || ru || gru) out.push({ code, label, n, real: real.length, game: game.length, ru: ru + gru, last: game.length ? game[game.length - 1].s : real.length ? histSeason(real[real.length - 1].y, code) : null, first: real.length ? histSeason(real[0].y, code) : game.length ? game[0].s : null });
  }
  const po = chistStore().filter(h => h.c.PO && h.c.PO.w === tid);
  if (po.length) out.push({ code: 'PO', label: 'Championship play-offs', n: po.length, real: 0, game: po.length, ru: 0, last: po[po.length - 1].s, first: po[0].s, note: 'from 2026/27' });
  return out;
}
function clubHonoursHtml(tid) {
  const H = clubHonours(tid);
  const mine = (G.honours[tid] || []);
  return `<h2 class="sect">Major honours</h2>${H.filter(h => h.n).length ? `<div class="tw"><table class="t"><thead><tr><th>Competition</th><th class="n">Won</th><th class="n">Runners-up</th><th>First</th><th>Latest</th><th class="n">In this save</th></tr></thead><tbody>${H.map(h => `<tr><td>${esc(h.label)}</td><td class="n"><b class="${h.n ? 'yel' : 'dim'}">${h.n}</b></td><td class="n">${h.ru}</td><td class="mono">${h.first || '-'}</td><td class="mono">${h.last || '-'}</td><td class="n">${h.game || '-'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="box pad dim">No major trophies yet.</div>'}
  <h2 class="sect">Won in this save</h2><div class="box pad">${mine.length ? mine.map(h => `<div>🏆 ${esc(h)}</div>`).join('') : '<span class="dim">None yet.</span>'}</div>
  <p class="dim" style="font-size:12px">Real honours count wins up to 2025/26 in the English top flight (First Division and Premier League), the second tier since 2004/05, the FA Cup, the League Cup, the European Cup/Champions League, the UEFA Cup/Europa League and the Conference League (Wikipedia list pages, read Oct 2026). Seasons played in this game are added on top.</p>`;
}
function clubHonoursShort(tid) {
  const H = clubHonours(tid).filter(h => h.n);
  return H.length ? `<p class="dim" style="margin:6px 0 10px">🏆 ${H.map(h => `${esc(h.label)} ×${h.n}`).join(' · ')}</p>` : '';
}

// ---------- screens ----------
function histTable(code, gcode) {
  const R = histRows()[code] || [];
  const game = chistStore().slice().reverse().filter(h => h.c[gcode]);
  const ply = (x) => x ? `${P(x[3]) ? pLink(x[3], x[0]) : esc(x[0])} <span class="dim">${esc(tName(x[1]))}${x[2] != null ? ' · ' + x[2] : ''}</span>` : '<span class="dim">-</span>';
  const gRows = game.map(h => { const c = h.c[gcode]; const po = gcode === 'CH' && h.c.PO && h.c.PO.w ? ` <span class="dim">· play-offs: ${esc(tName(h.c.PO.w))}</span>` : ''; return `<tr class="${c.w === G.user ? 'me' : ''}"><td class="mono">${h.s}</td><td>${c.w ? tLink(c.w, true) : '-'}${po}</td><td>${c.r ? tLink(c.r, true) : '-'}</td><td>${ply(c.ts)}</td><td>${ply(c.bp)}</td></tr>`; }).join('');
  const rRows = R.slice().reverse().map(r => `<tr><td class="mono">${histSeason(r.y, code)}</td><td>${teamOrName(r.w)}</td><td class="dim">${teamOrName(r.r)}</td><td class="dim">-</td><td class="dim">-</td></tr>`).join('');
  // most titles
  const cnt = {}; for (const r of R) cnt[r.w] = (cnt[r.w] || 0) + 1; for (const h of game) { const w = h.c[gcode].w; if (w) { const n = T(w) ? T(w).name : w; cnt[n] = (cnt[n] || 0) + 1; } }
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return `<div class="box pad" style="margin:10px 0">${top.map(([n, c]) => `<span class="chipx">${teamOrName(n)} <b class="yel mono">${c}</b></span>`).join(' ')}</div>
  <div class="tw"><table class="t"><thead><tr><th>Season</th><th>Winner</th><th>Runner-up</th><th>Top scorer</th><th>Best player</th></tr></thead><tbody>
  ${gRows || ''}${gRows ? '<tr><td colspan="5" class="dim" style="font-size:12px">Seasons above were played in this save. Real history below.</td></tr>' : ''}${rRows}</tbody></table></div>`;
}
function rankTable(kind) {
  const L = rankList(kind); const M = mrk(); const mv = M.mv[kind] || {};
  const st = { a: '', n: '', f: '', r: 'Retired', d: 'Died' };
  return `<div class="tw"><table class="t"><thead><tr><th class="n">#</th><th class="n">±</th><th>Manager</th><th>Nation</th><th>Club / job</th><th>Major honours</th><th class="n">Points</th></tr></thead><tbody>${L.map(x => {
    const d = mv[x.k]; const arrow = d > 0 ? `<span class="grn">▲${d}</span>` : d < 0 ? `<span class="red">▼${-d}</span>` : '<span class="dim">-</span>';
    const hon = x.me ? (G.mgrP ? G.mgrP.rec.reduce((a, s) => a + s.tro.length, 0) + ' trophies' : '') : honoursText(x.base, M.tro[x.k]);
    return `<tr class="${x.me ? 'me' : ''}"><td class="n mono">${x.rk}</td><td class="n mono">${arrow}</td><td><b>${esc(x.n)}</b>${x.st === 'r' || x.st === 'd' ? ` <span class="dim">(${st[x.st]})</span>` : ''}</td><td class="dim">${esc(x.nat)}</td><td>${x.club.tid ? tLink(x.club.tid, true) : `<span class="dim">${esc(x.club.txt)}</span>`}</td><td class="dim" style="white-space:normal;font-size:12.5px">${hon}</td><td class="n"><b class="mono">${x.pts}</b></td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function honoursText(base, extra) {
  const parts = []; for (const tok of (base || '').split(' ')) { if (!tok) continue; const n = +tok.slice(1) || 1; parts.push(`${n} ${MGR_CODE_N[tok[0]]}${n > 1 && !/s$/.test(MGR_CODE_N[tok[0]]) ? 's' : ''}`); }
  let s = parts.join(', ');
  if (extra && extra.length) s += (s ? '; ' : '') + `<span class="yel">in this save: ${extra.length}</span>`;
  return s || '-';
}
function scrHistory() {
  const tab = UI.tab.hist || 'LG';
  const reg = userRegion();
  const rk = UI.tab.rk || 'all';
  let body = '';
  const comp = HIST_COMPS.find(x => x[0] === tab);
  if (comp) body = histTable(comp[0], comp[2]);
  else if (tab === 'club') {
    const ids = fullTeams().slice().sort((a, b) => T(a).name.localeCompare(T(b).name)); const cid = ids.includes(UI.tab.hcl) ? UI.tab.hcl : G.user;
    body = `<div class="row" style="margin:10px 0"><label class="lb" for="hcl" style="margin:0">Club</label><select class="f" id="hcl" data-a="hcl">${ids.map(id => `<option value="${id}" ${id === cid ? 'selected' : ''}>${esc(T(id).name)}</option>`).join('')}</select></div>${clubHonoursHtml(cid)}`;
  } else if (tab === 'rank') {
    const kinds = [['all', 'All-time world'], ['cur', 'Current world'], ['eng', 'English football'], ['eur', 'Europe']];
    if (reg !== 'Europe') kinds.push(['reg', reg]);
    body = `<div class="tabs" style="margin-top:8px">${kinds.map(([k, l]) => `<button class="${rk === k ? 'on' : ''}" data-a="tab" data-k="rk" data-v="${k}">${l}</button>`).join('')}</div>
    <p class="dim" style="font-size:12.5px">Points for major honours as a manager: Champions League 30, World Cup 35, top-five league title 20, Euro/Copa América 20, Europa League 15, Cup Winners' Cup 12, other top-flight title 8, Conference League 8, domestic cup 6, world club title 6, league cup 4, second-tier title 4. In this save, league finishes and your Manager of the Month/Season awards add points too. ${rk === 'all' ? 'Legends keep their totals for good.' : rk === 'cur' ? 'Retired managers are left out.' : rk === 'eng' ? 'Managers who have worked in English football.' : 'By nationality.'}</p>
    ${rankTable(rk)}
    <p class="dim" style="font-size:12px">Honours were compiled for this game from public records up to the end of 2025/26; club jobs as of October 2026. Movement arrows show the change since the end of last season.</p>`;
  }
  const SHORT = { LG: 'League', CH: 'Championship', FA: 'FA Cup', LC: 'League Cup', UCL: 'Champions League', UEL: 'Europa League', UECL: 'Conference League' };
  const tabs = HIST_COMPS.map(([k]) => [k, SHORT[k]]).concat([['club', 'Club honours'], ['rank', 'Rankings']]);
  return `<div class="band">History<small>Winners, honours and manager rankings</small></div>
  <div class="tabs" style="margin-top:4px">${tabs.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="hist" data-v="${k}">${esc(l)}</button>`).join('')}</div>${body}
  ${comp ? `<p class="dim" style="font-size:12px">Real winners and runners-up to 2025/26 from Wikipedia list pages (read Oct 2026). ${comp[0] === 'LG' ? 'Football League First Division up to 1991/92, Premier League from 1992/93.' : comp[0] === 'CH' ? 'Second tier as the Championship, from 2004/05.' : ''} Top scorer and best player are recorded for seasons played in this game.</p>` : ''}`;
}
document.addEventListener('change', (ev) => { const el = ev.target; if (el && el.dataset && el.dataset.a === 'hcl') { UI.tab.hcl = el.value; render(); } });
const _screenH = screen;
screen = function (s) { if (s === 'history') return scrHistory(); return _screenH(s); };

// manager profile: ranking box
const _scrMgrH = scrManager;
scrManager = function () {
  const html = _scrMgrH();
  try {
    const a = rankList('all').find(x => x.me), c = rankList('cur').find(x => x.me), e = rankList('eng').find(x => x.me);
    const reg = userRegion(); const r = reg !== 'Europe' ? rankList('reg').find(x => x.me) : rankList('eur').find(x => x.me);
    const box = `<h2 class="sect">World rankings</h2><div class="grid3"><div class="box pad"><label class="lb">All-time</label><div class="big">${ordinal(a.rk)}</div><div class="dim">${a.pts} points</div></div><div class="box pad"><label class="lb">Current</label><div class="big">${ordinal(c.rk)}</div><div class="dim">English football: ${ordinal(e.rk)}</div></div><div class="box pad"><label class="lb">${esc(reg)}</label><div class="big">${ordinal(r.rk)}</div><div class="dim"><span class="lnk" data-a="gohist" data-v="rank">Full rankings</span></div></div></div>`;
    const i = html.indexOf('<h2 class="sect">Managerial career</h2>');
    return i > 0 ? html.slice(0, i) + box + html.slice(i) : html + box;
  } catch (e) { console.error(e); return html; }
};
Object.assign(ACT, { gohist: (v) => { UI.modal = null; UI.scr = 'history'; UI.tab.hist = v || 'LG'; render(); window.scrollTo(0, 0); } });
