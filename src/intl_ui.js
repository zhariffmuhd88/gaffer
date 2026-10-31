// intl_ui.js: International screen (job, squad selection, fixtures, competitions, rankings, records, history),
// friendlies, press conference after a squad is named, nation pop-up, start-screen career mode, links.

function edList() { return G.intl.order.map(k => G.intl.ed[k]).filter(Boolean); }
function natLink(tid) { return tLink(tid, true); }
function fxLine(f) {
  const sc = f.r ? `<b class="mono">${f.r[0]}-${f.r[1]}</b>${f.pen ? ` <span class="dim">(${f.pen[0]}-${f.pen[1]} pens)</span>` : f.et ? ' <span class="dim">aet</span>' : ''}` : '<span class="dim mono">v</span>';
  return `<tr class="${f.r ? 'click' : ''}" ${f.r ? `data-a="report" data-v="${f.id}"` : ''}><td class="mono">${dShort(f.d)} ${f.d.slice(0, 4)}</td><td><span class="mono dim">${COMP_SHORT[f.comp]}</span> <span class="dim" style="font-size:12px">${esc(f.rnd || '')}</span></td><td class="n">${natLink(f.h)}</td><td class="n" style="text-align:center">${sc}</td><td>${natLink(f.a)}</td><td class="dim" style="font-size:12px">${esc(f.ven || (T(f.h) || {}).stadium || '')}</td></tr>`;
}
function fxTable(fs) { return fs.length ? `<div class="tw"><table class="t"><tbody>${fs.map(fxLine).join('')}</tbody></table></div>` : '<p class="dim">No matches.</p>'; }
function grpTableHtml(teams, fids, title, mark) {
  const rows = gTable(teams, fids);
  return `<div class="box" style="margin-bottom:10px"><div class="pad" style="padding-bottom:0"><b>${esc(title)}</b></div><div class="tw"><table class="t"><thead><tr><th class="n">#</th><th>Team</th><th class="n">P</th><th class="n">W</th><th class="n">D</th><th class="n">L</th><th class="n">GD</th><th class="n">Pts</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${r.t === ENGID ? 'me' : ''}"><td class="n">${i + 1}${mark && mark(i) ? ' <span class="grn">●</span>' : ''}</td><td>${natLink(r.t)}</td><td class="n">${r.p}</td><td class="n">${r.w}</td><td class="n">${r.d}</td><td class="n">${r.l}</td><td class="n">${r.gd > 0 ? '+' : ''}${r.gd}</td><td class="n"><b>${r.pts}</b></td></tr>`).join('')}</tbody></table></div></div>`;
}
function edHtml(E) {
  let h = `<p class="dim">${esc(E.name)} · ${E.stage === 'done' ? 'finished' : E.stage === 'league' || E.stage === 'groups' ? 'group stage' : 'knockout stage'}${E.hosts && E.hosts.length ? ' · hosts: ' + E.hosts.map(c => tName(NID(c))).join(', ') : ''}</p>`;
  if (E.fin) h += `<div class="box pad" style="margin-bottom:10px">🏆 <b>${tName(E.fin[0], false)}</b> <span class="dim">beat ${tName(E.fin[1], false)} in the final</span></div>`;
  if (E.qual && E.qual.length) h += `<div class="box pad" style="margin-bottom:10px"><b>Qualified (${E.qual.length}):</b> ${E.qual.map(natLink).join(', ')}</div>`;
  for (const r of (E.ko || []).slice().reverse()) h += `<h2 class="sect">${esc(r.n)}</h2>${fxTable(r.fx.map(id => G.fx[id]))}`;
  const gs = Object.keys(E.groups || {});
  const eg = gs.find(g => E.groups[g].includes(ENGID));
  const show = UI.tab.igall ? gs : (eg ? [eg] : gs.slice(0, 4));
  const mark = E.comp === 'EQ' ? (i => i === 0) : E.comp === 'WCQ' ? (i => i < 3) : E.type === 'fin' ? (i => i < 2) : null;
  if (gs.length) {
    h += `<h2 class="sect">Groups</h2><div class="grid2">${show.map(g => grpTableHtml(E.groups[g], E.fx[g], E.comp === 'UNL' ? `League ${g[0]} · Group ${g}` : E.comp === 'WCQ' ? (g === 'L2' ? 'League 2' : 'League 1 · Group ' + g.slice(-1)) : 'Group ' + g.replace('G', ''), mark)).join('')}</div>`;
    if (gs.length > show.length || UI.tab.igall) h += `<button class="btn" data-a="igall">${UI.tab.igall ? 'Show England\'s group only' : `Show all ${gs.length} groups`}</button>`;
    if (eg) h += `<h2 class="sect">England's matches</h2>${fxTable(E.fx[eg].map(id => G.fx[id]).filter(f => f.h === ENGID || f.a === ENGID))}`;
  }
  return h;
}
function engRecords() {
  const cur = natPool(PLAY_NAT).concat(Object.values(G.players).filter(p => p && p.nat === PLAY_NAT && p.c === 'RETIRED'));
  const merge = (raw, key) => {
    const m = {}; for (const x of raw.split(';')) { const [n, v] = x.split('|'); m[n] = { n, v: +v, real: 1 }; }
    for (const p of cur) { const v = p[key] || 0; if (!v) continue; if (!m[p.n] || v > m[p.n].v) m[p.n] = { n: p.n, v, pid: p.id, act: p.c !== 'RETIRED' }; }
    return Object.values(m).sort((a, b) => b.v - a.v).slice(0, 15);
  };
  const tbl = (rows, lbl) => `<div class="tw"><table class="t"><thead><tr><th class="n">#</th><th>Player</th><th class="n">${lbl}</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${r.act ? 'me' : ''}"><td class="n">${i + 1}</td><td>${r.pid ? pLink(r.pid, r.n) : esc(r.n)}${r.act ? ' <span class="dim">(active)</span>' : ''}</td><td class="n"><b class="mono">${r.v}</b></td></tr>`).join('')}</tbody></table></div>`;
  return `<div class="grid2"><div><h2 class="sect">Most caps</h2>${tbl(merge(ENG_REC_CAPS, 'ic'), 'Caps')}</div><div><h2 class="sect">Top scorers</h2>${tbl(merge(ENG_REC_GOALS, 'ig'), 'Goals')}</div></div>
  <p class="dim" style="font-size:12px">All-time records from the FA and Wikipedia; current players add every cap and goal they win in this save.</p>`;
}
function intlHistHtml() {
  const block = (code, label) => {
    const rows = INTL_HIST[code].split(';').map(x => x.split('|')).reverse();
    const game = G.intl.hist.filter(h => h.comp === code && h.w).slice().reverse();
    return `<h2 class="sect">${label}</h2><div class="tw"><table class="t"><thead><tr><th>Year</th><th>Winner</th><th>Runner-up</th></tr></thead><tbody>${game.map(h => `<tr class="${h.w === ENGID ? 'me' : ''}"><td class="mono">${esc(h.name)}</td><td>${natLink(h.w)}</td><td>${natLink(h.r)}</td></tr>`).join('')}${game.length ? '<tr><td colspan="3" class="dim" style="font-size:12px">Above: played in this save. Below: real history.</td></tr>' : ''}${rows.map(([y, w, r]) => `<tr class="${w === 'England' ? 'me' : ''}"><td class="mono">${y}</td><td>${esc(w)}</td><td class="dim">${esc(r)}</td></tr>`).join('')}</tbody></table></div>`;
  };
  const eh = G.intl.hist.filter(h => h.eng);
  return `${eh.length ? `<h2 class="sect">England in this save</h2><div class="tw"><table class="t"><tbody>${eh.slice().reverse().map(h => `<tr><td>${esc(h.name)}</td><td><b>${esc(h.eng)}</b></td></tr>`).join('')}</tbody></table></div>` : ''}<div class="grid2"><div>${block('WC', 'World Cup')}</div><div>${block('EURO', 'European Championship')}${block('UNL', 'Nations League')}</div></div><p class="dim" style="font-size:12px">Real winners from Wikipedia list pages and SI.com (read 31 Oct 2026).</p>`;
}
function rankHtml() {
  const L = natRankList(); const conf = UI.tab.irc || 'ALL';
  const rows = L.map((c, i) => ({ c, i: i + 1 })).filter(x => conf === 'ALL' || T(NID(x.c)).conf === conf).slice(0, 80);
  const real = {}; for (const n of natRows()) real[n.c] = n;
  return `<div class="tabs" style="margin-top:8px">${['ALL', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'].map(k => `<button class="${conf === k ? 'on' : ''}" data-a="tab" data-k="irc" data-v="${k}">${k === 'ALL' ? 'World' : k}</button>`).join('')}</div>
  <div class="tw"><table class="t"><thead><tr><th class="n">#</th><th>Nation</th><th>Confederation</th><th class="n">Points</th><th class="n">Oct 2026</th></tr></thead><tbody>${rows.map(x => `<tr class="${x.c === PLAY_NAT ? 'me' : ''}"><td class="n">${x.i}</td><td>${natLink(NID(x.c))}</td><td class="dim">${T(NID(x.c)).conf}</td><td class="n mono">${G.intl.elo[x.c]}</td><td class="n dim mono">${real[x.c].rank}${real[x.c].est ? '*' : ''}</td></tr>`).join('')}</tbody></table></div>
  <p class="dim" style="font-size:12px">The game ranking starts from the real FIFA ranking (October 2026 release, top 50) and moves with every international result in this save. * = position estimated (outside the published top 50).</p>`;
}
function squadSelHtml() {
  const pool = natPool(PLAY_NAT).sort((a, b) => poolScore(b) - poolScore(a));
  const sel = new Set(UI.isel || G.intl.squad || []);
  const grp = UI.tab.isg || 'all';
  const show = pool.filter(p => grp === 'all' || POS_GROUP[p.pos] === grp || (grp === 'sel' && sel.has(p.id))).slice(0, 120);
  const cnt = [...sel].length;
  const B = nextEngBlock();
  const club = (p) => p.c === 'ABROAD' ? esc(p.ab || 'Abroad') : tName(p.c);
  return `<div class="box pad" style="margin:10px 0"><div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><div><b class="${cnt >= 23 && cnt <= 26 ? 'grn' : 'amb'}">${cnt} selected</b> <span class="dim">(23 to 26, at least 3 goalkeepers)</span>${B ? `<div class="dim" style="font-size:12.5px">Next: ${B.fx.map(f => `${dShort(f.d)} ${f.h === ENGID ? 'v' : 'at'} ${tName(f.h === ENGID ? f.a : f.h)}`).join(' · ')}${G.intl.sqDue && !G.intl.sqDone ? ` · squad due ${dShort(G.intl.sqDue)}` : ''}</div>` : ''}</div>
    <div class="row" style="gap:6px"><button class="btn" data-a="isauto">Pick best 26</button><button class="btn" data-a="isclear">Clear</button><button class="btn pri" data-a="isok">Confirm squad</button></div></div></div>
  <div class="tabs">${[['all', 'All'], ['sel', 'Selected'], ['G', 'Goalkeepers'], ['D', 'Defenders'], ['M', 'Midfielders'], ['A', 'Forwards']].map(([k, l]) => `<button class="${grp === k ? 'on' : ''}" data-a="tab" data-k="isg" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="tw"><table class="t"><thead><tr><th></th><th>Name</th><th>Pos</th><th class="n">Age</th><th>Club</th><th class="n">Ovr</th><th class="n">Caps</th><th class="n">Goals</th><th class="n">Fit</th></tr></thead><tbody>${show.map(p => `<tr class="${sel.has(p.id) ? 'me' : ''}"><td><input type="checkbox" data-a="istog" data-v="${p.id}" ${sel.has(p.id) ? 'checked' : ''} aria-label="Select ${esc(p.n)}"></td><td>${pLink(p.id)}</td><td class="mono">${p.pos}</td><td class="n">${p.age}</td><td>${club(p)}</td><td class="n"><b class="mono">${p.ca}</b></td><td class="n">${p.ic || 0}${p.icE ? '<span class="dim">*</span>' : ''}</td><td class="n">${p.ig || 0}</td><td class="n">${p.inj > 0 ? `<span class="red">inj ${p.inj}d</span>` : Math.round(p.cond) + '%'}</td></tr>`).join('')}</tbody></table></div>
  <p class="dim" style="font-size:12px">Caps and goals start from the real figures after the Sep/Oct 2026 window (* = estimate). Players at clubs abroad are included.</p>`;
}
function friendlyHtml() {
  // free international dates in the next windows where England has no match
  const used = new Set(engFixtures(G.date).map(f => f.d));
  const slots = [];
  for (let y = G.year; y <= G.year + 1; y++) for (let w = 0; w < 4; w++) for (const off of (w === 0 ? [5, 8, 12, 15] : [3, 6])) { const d = winD(y, w, off); if (d > addDays(G.date, 10) && !used.has(d) && ![...used].some(u => Math.abs(dDiff(u, d)) < 3)) slots.push(d); }
  const opp = natRankList().filter(c => c !== PLAY_NAT).slice(0, 60);
  const fr = engFixtures().filter(f => f.comp === 'FR');
  return `<div class="box pad" style="margin:10px 0"><h3 class="h3">Arrange a friendly</h3><div class="row" style="gap:8px;flex-wrap:wrap"><select class="f" id="frd" aria-label="Date">${slots.slice(0, 12).map(d => `<option value="${d}">${dNice(d, true)}</option>`).join('') || '<option value="">No free dates</option>'}</select><select class="f" id="fro" aria-label="Opponent">${opp.map(c => `<option value="${c}">${esc(T(NID(c)).name)} (#${natRank(c)})</option>`).join('')}</select><select class="f" id="frv" aria-label="Venue"><option value="h">Wembley</option><option value="a">Away</option></select><button class="btn pri" data-a="frok">Arrange</button></div><p class="dim" style="font-size:12.5px;margin-bottom:0">Friendlies go on free dates inside FIFA windows. They count for caps and ranking points but matter less to the FA.</p></div>
  <h2 class="sect">Friendlies</h2>${fxTable(fr)}`;
}
function scrIntl() {
  const tab = UI.tab.int || 'ov';
  const eng = userIsEng();
  const t = T(ENGID);
  const tabs = [['ov', 'Overview'], ['sq', 'Squad'], ['fx', 'Fixtures'], ['comp', 'Competitions'], ['rank', 'World ranking'], ['rec', 'Records'], ['hist', 'History']].concat(eng ? [['fr', 'Friendlies']] : []);
  let body = '';
  if (tab === 'ov') {
    const live = edList().filter(E => E.stage !== 'done' && (Object.values(E.groups || {}).some(g => g.includes(ENGID)) || (E.qual || []).includes(ENGID)));
    const B = nextEngBlock();
    body = `<div class="grid3" style="margin-top:10px">
      <div class="box pad"><label class="lb">England manager</label><div style="font-size:18px;font-weight:700">${esc(eng ? G.mgr : t.mgr)}</div><div class="dim">${eng ? (G.intl.mode === 'dual' ? `Dual role with ${tName(G.intl.sw ? G.intl.club : G.user, false)}` : 'Full-time national team job') : 'You are not the England manager'}</div></div>
      <div class="box pad"><label class="lb">${eng ? 'FA confidence' : 'World ranking'}</label>${eng ? `<div class="big ${G.intl.fa < 30 ? 'red' : G.intl.fa < 55 ? 'amb' : 'grn'}">${Math.round(G.intl.fa)}%</div><div class="bar"><i style="width:${G.intl.fa}%"></i></div>` : `<div class="big">${ordinal(natRank(PLAY_NAT))}</div><div class="dim">${G.intl.elo[PLAY_NAT]} points</div>`}</div>
      <div class="box pad"><label class="lb">Next games</label>${B ? B.fx.map(f => `<div>${dShort(f.d)} · ${f.h === ENGID ? 'v' : 'at'} ${natLink(f.h === ENGID ? f.a : f.h)} <span class="dim mono">${COMP_SHORT[f.comp]}</span></div>`).join('') : '<span class="dim">None scheduled</span>'}</div>
    </div>
    ${eng ? '' : `<div class="box pad" style="margin-top:10px"><h3 class="h3">The England job</h3><p>${G.intl.vacant ? 'The England job is vacant.' : G.intl.offer ? 'The FA has asked to speak to you.' : `England are managed by ${esc(t.mgr)}. You can still apply; the FA looks at your reputation (${Math.round(G.mgrRep)}).`}</p><div class="row" style="gap:8px">${!isNatT(G.user) && !G.sacked ? '<button class="btn pri" data-a="intltake" data-v="dual">Apply: club and England</button>' : ''}<button class="btn" data-a="intltake" data-v="nat">Apply: England only</button></div></div>`}
    ${eng ? `<div class="box pad" style="margin-top:10px"><h3 class="h3">FA expectations</h3>${live.length ? live.map(E => `<div>${esc(E.name)}: <b>${esc(faTarget(E).txt)}</b> <span class="dim">· now: ${esc(engStage(E) || '-')}</span></div>`).join('') : '<span class="dim">No competition under way.</span>'}<div class="row" style="margin-top:10px"><button class="btn warn" data-a="intlquit">Resign as England manager</button></div></div>` : ''}
    <h2 class="sect">Competitions</h2><div class="tw"><table class="t"><tbody>${edList().slice().reverse().map(E => `<tr class="click" data-a="ied" data-v="${E.key}"><td>${esc(E.name)}</td><td class="dim">${E.stage === 'done' ? (E.fin ? 'Won by ' + tName(E.fin[0], false) : 'Finished') : 'In progress'}</td><td>${esc(engStage(E) || '')}</td></tr>`).join('')}</tbody></table></div>
    ${G.intl.tasks.length ? `<p class="dim" style="font-size:12.5px">Coming up: ${G.intl.tasks.slice().sort((a, b) => a.d < b.d ? -1 : 1).slice(0, 3).map(tk => `${dNice(tk.d, false)} ${tk.k === 'eq' ? 'Euro qualifying draw' : tk.k === 'unl3' ? 'Nations League draw' : tk.k === 'wcq' ? 'World Cup qualifying draw' : tk.k === 'drawFinals' ? 'finals draw' : 'new cycle'}`).join(' · ')}</p>` : ''}`;
  } else if (tab === 'sq') body = eng ? squadSelHtml() : `<h2 class="sect">Latest England squad</h2>${(G.intl.aiSq || []).length ? `<div class="tw"><table class="t"><thead><tr><th>Name</th><th>Pos</th><th>Club</th><th class="n">Caps</th><th class="n">Goals</th></tr></thead><tbody>${G.intl.aiSq.map(P).filter(Boolean).map(p => `<tr class="${p.c === G.user ? 'me' : ''}"><td>${pLink(p.id)}</td><td class="mono">${p.pos}</td><td>${p.c === 'ABROAD' ? esc(p.ab) : tName(p.c)}</td><td class="n">${p.ic || 0}</td><td class="n">${p.ig || 0}</td></tr>`).join('')}</tbody></table></div>` : '<p class="dim">The next squad is named about nine days before the next international window.</p>'}`;
  else if (tab === 'fx') body = `<h2 class="sect">England fixtures and results</h2>${fxTable(engFixtures().slice(-40))}`;
  else if (tab === 'comp') { const L = edList(); const k = UI.tab.ied && G.intl.ed[UI.tab.ied] ? UI.tab.ied : (L.slice().reverse().find(E => E.stage !== 'done') || L[L.length - 1] || {}).key; body = `<div class="row" style="margin:10px 0"><select class="f" id="iedsel" data-a="iedsel" aria-label="Competition">${L.map(E => `<option value="${E.key}" ${E.key === k ? 'selected' : ''}>${esc(E.name)}</option>`).join('')}</select></div>${k ? edHtml(G.intl.ed[k]) : ''}`; }
  else if (tab === 'rank') body = rankHtml();
  else if (tab === 'rec') body = engRecords();
  else if (tab === 'hist') body = intlHistHtml();
  else if (tab === 'fr') body = friendlyHtml();
  return `<div class="band">International<small>England · ${ordinal(natRank(PLAY_NAT))} in the world · data checked ${INTL_ASOF}</small></div>
  <div class="tabs" style="margin-top:4px">${tabs.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="int" data-v="${k}">${l}</button>`).join('')}</div>${body}`;
}
function pressModal() {
  const dropped = (G.intl.prev || []).filter(id => !G.intl.squad.includes(id)).map(P).filter(p => p && p.ca >= 82).sort((a, b) => b.ca - a.ca)[0];
  const q = dropped ? `Why is ${dropped.n} not in the squad?` : 'What are your hopes for these games?';
  const opts = dropped ? [['earn', 'He has to earn his place back.'], ['door', 'The door is open. I have spoken to him.'], ['squad', 'It is a squad decision. Nothing personal.']] : [['win', 'We expect to win every game.'], ['calm', 'One game at a time.'], ['young', 'It is a chance to look at young players.']];
  UI.press = dropped ? dropped.id : null;
  UI.modal = `<div class="band"><span>Press conference · England</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc"><p><b>${esc(q)}</b></p><div style="display:grid;gap:6px">${opts.map(([k, l]) => `<button class="btn" data-a="ipress" data-v="${k}">${esc(l)}</button>`).join('')}</div></div>`;
  render();
}
Object.assign(ACT, {
  intltake: (v) => { const e = takeEngland(v); if (e) toast(e); else { toast('You are the new England manager.'); UI.tab.int = 'sq'; } autosave(); render(); },
  intlquit: () => { leaveEngland('You have resigned as England manager.'); autosave(); render(); },
  ied: (v) => { UI.tab.int = 'comp'; UI.tab.ied = v; render(); },
  igall: () => { UI.tab.igall = !UI.tab.igall; render(); },
  isauto: () => { UI.isel = pickSquad(natPool(PLAY_NAT), 26).map(p => p.id); render(); },
  isclear: () => { UI.isel = []; render(); },
  isok: () => { const e = confirmSquad(UI.isel || G.intl.squad || []); if (e) return toast(e); UI.isel = null; autosave(); toast('England squad confirmed.'); pressModal(); },
  ipress: (k) => {
    const p = P(UI.press);
    if (k === 'earn') { G.intl.fa = clamp(G.intl.fa + 1, 0, 100); if (p) setHap(p, -5); }
    if (k === 'door') { if (p) setHap(p, 4); }
    if (k === 'win') { G.fans = clamp((G.fans ?? 60) + 3, 0, 100); G.intl.fa = clamp(G.intl.fa + 1, 0, 100); }
    if (k === 'young') { for (const id of G.intl.squad) { const q = P(id); if (q && q.age <= 22) setHap(q, 2); } }
    UI.modal = null; toast('The press conference is over.'); render();
  },
  frok: () => {
    const d = ($('#frd') || {}).value, c = ($('#fro') || {}).value, v = ($('#frv') || {}).value;
    if (!d || !c) return toast('No free date.');
    const home = v !== 'a';
    ifx({ comp: 'FR', ed: 'FR', d, h: home ? ENGID : NID(c), a: home ? NID(c) : ENGID, rnd: 'International friendly', ven: home ? 'Wembley Stadium' : null, vcap: home ? 90000 : null });
    news('Friendly arranged', `England will play ${T(NID(c)).name} ${home ? 'at Wembley' : 'away'} on ${dNice(d, false)}.`, ENGID);
    autosave(); toast('Friendly arranged.'); render();
  }
});
document.addEventListener('change', (ev) => {
  const el = ev.target; if (!el || !el.dataset) return;
  if (el.dataset.a === 'istog') { const s = new Set(UI.isel || G.intl.squad || []); if (el.checked) s.add(el.dataset.v); else s.delete(el.dataset.v); UI.isel = [...s]; render(); }
  if (el.dataset.a === 'iedsel') { UI.tab.ied = el.value; render(); }
});
// inbox action link to the International screen
const _scrIntlScreen = screen;
screen = function (s) { if (s === 'intl') return G.intl ? scrIntl() : ''; return _scrIntlScreen(s); };

// nation pop-up
const _clubModalN = clubModal;
clubModal = function (tid) {
  const t = T(tid); if (!t || !t.nat) return _clubModalN(tid);
  const sq = natSquad(t.code).slice(0, 23);
  const stars = (NAT_STARS[t.code] || '').split(';').filter(Boolean).map(x => x.split('|')[0]);
  const fs = Object.values(G.fx).filter(f => f.r && (f.h === tid || f.a === tid)).sort((a, b) => a.d < b.d ? 1 : -1).slice(0, 8);
  const r = natRow(t.code);
  UI.modal = `<div class="band"><span>${badge(tid)} ${esc(t.name)}</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">
    <dl class="kv"><dt>Confederation</dt><dd>${t.conf}</dd><dt>Game ranking</dt><dd>${ordinal(natRank(t.code))} · ${G.intl.elo[t.code]} pts <span class="dim">(FIFA Oct 2026: ${r.rank}${r.est ? ', estimated' : ''})</span></dd><dt>Manager</dt><dd>${esc(t.code === PLAY_NAT && userIsEng() ? G.mgr : t.mgr)}</dd><dt>Home ground</dt><dd>${esc(t.stadium)}</dd>${stars.length ? `<dt>Star players</dt><dd>${stars.map(esc).join(', ')}</dd>` : ''}</dl>
    ${sq.length ? `<h2 class="sect">Players in this game's database</h2><div class="tw"><table class="t"><thead><tr><th>Name</th><th>Pos</th><th>Club</th><th class="n">Ovr</th><th class="n">Caps</th><th class="n">Goals</th></tr></thead><tbody>${sq.map(p => `<tr><td>${pLink(p.id)}</td><td class="mono">${p.pos}</td><td>${p.c === 'ABROAD' ? esc(p.ab || 'Abroad') : tName(p.c)}</td><td class="n">${p.ca}</td><td class="n">${p.ic || 0}</td><td class="n">${p.ig || 0}</td></tr>`).join('')}</tbody></table></div>` : ''}
    ${fs.length ? `<h2 class="sect">Recent results</h2>${fxTable(fs)}` : ''}</div>`;
  render();
};
// player pop-up: international caps
const _peI = playerExtra;
playerExtra = function (p) { const h = _peI(p); if (!p || !(p.ic || p.ig) || !G.intl) return h; return h + `<div class="box pad" style="margin-top:8px"><label class="lb">International</label><b>${esc((T(NID(p.nat)) || {}).name || p.nat)}</b> · ${p.ic || 0} caps, ${p.ig || 0} goals${p.icE ? ' <span class="dim">(starting figure estimated)</span>' : ''}</div>`; };

// links: competitions and nations
Object.assign(COMP_LINK, { 'Nations League': 'UNL', 'Euro qualifiers': 'EQ', 'European Championship': 'EURO', 'World Cup qualifiers': 'WCQ', 'World Cup': 'WC' });
const _goCompI = goComp;
goComp = function (code) {
  if (!INTL_C.includes(code)) return _goCompI(code);
  UI.modal = null; UI.mstack = []; UI.mcur = null; UI.scr = 'intl'; UI.tab.int = 'comp';
  const E = edList().slice().reverse().find(x => x.comp === code); if (E) UI.tab.ied = E.key;
  if (code === 'WC' || code === 'EURO') UI.tab.int = E ? 'comp' : 'hist';
  render(); window.scrollTo(0, 0);
};

// nav: International screen; club screens hidden while running England full-time or during England duty
const _renderNav = render;
render = function () {
  _renderNav();
  try {
    if (!G || UI.match || !G.intl) return;
    const nav = document.querySelector('nav.nav'); if (!nav) return;
    if (!nav.querySelector('[data-v="intl"]')) { const after = nav.querySelector('[data-v="comps"]'); const b = document.createElement('button'); b.dataset.a = 'nav'; b.dataset.v = 'intl'; b.textContent = 'International'; if (UI.scr === 'intl') b.className = 'on'; if (after) after.after(b); else nav.appendChild(b); }
    if (isNatT(G.user)) for (const k of ['transfers', 'finance', 'staff', 'club', 'dyn', 'train']) { const b = nav.querySelector(`[data-v="${k}"]`); if (b) b.hidden = true; }
  } catch (e) { console.error(e); }
};

// start screen: career mode
const _rsI = renderStart;
renderStart = function () {
  _rsI();
  const go = document.querySelector('[data-a="start"]'); if (!go) return;
  const m = UI.cmode || 'club';
  const row = go.closest('.row') || go.parentElement;
  row.insertAdjacentHTML('beforebegin', `<div class="row" style="gap:8px;margin:0 0 10px;flex-wrap:wrap"><span class="lb" style="margin:0">Career</span><div class="seg">${[['club', 'Club only'], ['nat', 'England only'], ['dual', 'Club + England']].map(([k, l]) => `<button class="${m === k ? 'on' : ''}" data-a="cmode" data-v="${k}">${l}</button>`).join('')}</div><span class="dim" style="font-size:12.5px">${m === 'nat' ? 'Manage England full-time; no club needed.' : m === 'dual' ? 'Run your club and England at the same time.' : 'Manage a club; you can apply for the England job later.'}</span></div>`);
  if (m === 'nat') go.disabled = false;
};
const _startI = ACT.start;
ACT.start = () => {
  const m = UI.cmode || 'club';
  if (m === 'nat' && !UI.newClub) UI.newClub = 'ARS';
  const keep = UI.newClub, keepMgr = T ? null : null;
  _startI();
  if (!G) return;
  if (m === 'nat') { const club = G.user; const orig = (PL_CLUBS.concat(CH_CLUBS)).find(c => c.id === club); G.intl.offer = true; takeEngland('nat'); if (orig) T(club).mgr = orig.mgr; if (G.mgrP) G.mgrP.rec = []; G.mgrRep = Math.max(G.mgrRep, 60); }
  else if (m === 'dual') { G.intl.offer = true; takeEngland('dual'); }
  UI.scr = m === 'club' ? 'mgr' : 'intl'; autosave(); render();
};
Object.assign(ACT, { cmode: (v) => { const n = $('#mgrname'); if (n) UI.mgrName = n.value; UI.cmode = v; render(); } });
const _maI = msgActions;
msgActions = function (m) { if (m && m.act && m.act.k === 'nav') return `<div class="row" style="margin-top:14px"><button class="btn pri" data-a="nav" data-v="${esc(m.act.v)}">Open International</button></div>`; return _maI(m); };
