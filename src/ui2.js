// ---------- tactics ----------
const TAC_OPTS = {
  ment: ['Mentality', ['Defensive', 'Cautious', 'Balanced', 'Attacking', 'All-out']],
  press: ['Pressing', ['Low block', 'Standard', 'High press']],
  tempo: ['Tempo', ['Patient', 'Normal', 'Quick']],
  width: ['Width', ['Narrow', 'Normal', 'Wide']],
  pass: ['Passing', ['Short', 'Mixed', 'Direct']]
};
function tacControls(tac, prefix) {
  return Object.entries(TAC_OPTS).map(([k, [lab, opts]]) => `<div><label class="lb">${lab}</label><div class="seg">${opts.map((o, i) => { const v = k === 'ment' ? i + 1 : i + 1; return `<button class="${tac[k] === v ? 'on' : ''}" data-a="${prefix}" data-k="${k}" data-v="${v}">${o}</button>`; }).join('')}</div></div>`).join('');
}
function scrTactics() {
  const t = userTeam(); const tac = t.tac;
  if (!tac.xi || tac.xi.length !== 11) autoPick(G.user);
  const slots = FORMS[tac.form];
  const sel = UI.tSel; // {type:'xi'|'bench', i}
  const pitch = slots.map((s, i) => {
    const p = P(tac.xi[i]); const f = p ? fam(p.pos, s[0]) : 0;
    const cls = !p ? 'empty' : f >= .85 ? '' : f >= .7 ? 'f-ok' : 'f-bad';
    return `<button class="slot ${cls} ${sel && sel.type === 'xi' && sel.i === i ? 'sel' : ''}" style="left:${s[1]}%;bottom:${s[2]}%" data-a="tslot" data-v="${i}" aria-label="${ROLE_LABEL[s[0]]}"><span class="sh" style="${shirt(G.user)}">${p ? p.no || '' : '+'}</span><span class="nm">${p ? esc(surname(p.n)) : 'Empty'}${p && !available(p) ? ' ⚠' : ''}</span><span class="rl">${ROLE_LABEL[s[0]]}${p ? ' · ' + Math.round(effSkill(p, s[0], false)) : ''}</span></button>`;
  }).join('');
  const role = sel && sel.type === 'xi' ? slots[sel.i][0] : null;
  const sq = squad(G.user).slice().sort((a, b) => role ? effSkill(b, role, false) - effSkill(a, role, false) : POS_ORDER[a.pos] - POS_ORDER[b.pos] || b.ca - a.ca);
  const where = (id) => { const xi = tac.xi.indexOf(id); if (xi >= 0) return `<span class="yel mono">${ROLE_LABEL[slots[xi][0]]}</span>`; const b = tac.bench.indexOf(id); if (b >= 0) return `<span class="cyan mono">SUB ${b + 1}</span>`; return '<span class="dim">-</span>'; };
  const takers = [['capt', 'Captain'], ['pk', 'Penalties'], ['fk', 'Free kicks'], ['ck', 'Corners']];
  const xiP = tac.xi.map(P).filter(Boolean);
  return `<div class="band">Tactics<small>${esc(tac.form)} · pick a slot on the pitch, then a player from the list</small></div>
  <div class="row" style="margin:10px 0"><div><label class="lb" for="formsel">Formation</label><select class="f" id="formsel" data-a="form">${Object.keys(FORMS).map(f => `<option ${f === tac.form ? 'selected' : ''}>${f}</option>`).join('')}</select></div>
  <span class="spacer"></span><button class="btn" data-a="autopick">Auto-pick best XI</button></div>
  <div class="tact">
    <div><div class="pitch"><div class="half"></div><div class="circ"></div>${pitch}</div>
      <h2 class="sect">Bench</h2>
      <div class="row" style="gap:4px">${Array.from({ length: 9 }, (_, i) => { const p = P(tac.bench[i]); return `<button class="btn ${sel && sel.type === 'bench' && sel.i === i ? 'on' : ''}" style="font-size:12px;padding:3px 7px" data-a="tbench" data-v="${i}">${p ? (p.no || '') + ' ' + esc(surname(p.n)) + ' <span class="dim">' + POS_LABEL[p.pos] + '</span>' : 'Empty'}</button>`; }).join('')}</div>
    </div>
    <div style="min-width:0">
      <div class="box pad" style="display:grid;gap:10px">${tacControls(tac, 'tac')}</div>
      <div class="grid3" style="margin-top:10px">${takers.map(([k, l]) => `<div><label class="lb" for="tk-${k}">${l}</label><select class="f" id="tk-${k}" style="width:100%" data-a="taker" data-k="${k}">${xiP.map(p => `<option value="${p.id}" ${tac[k] === p.id ? 'selected' : ''}>${esc(p.n)}</option>`).join('')}</select></div>`).join('')}</div>
      <h2 class="sect">${role ? 'Best fits for ' + ROLE_LABEL[role] : 'Squad'}</h2>
      <div class="tw" style="max-height:520px;overflow-y:auto"><table class="t"><thead><tr><th class="n">#</th><th>Name</th><th>Pos</th><th class="n">Ovr</th>${role ? '<th class="n">Fit</th>' : ''}<th class="n">Cond</th><th>In team</th><th></th></tr></thead><tbody>
      ${sq.map(p => `<tr class="click" data-a="tpick" data-v="${p.id}"><td class="n">${p.no || ''}</td><td>${esc(p.n)}</td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.ca}</td>${role ? `<td class="n ${fam(p.pos, role) >= .85 ? 'grn' : fam(p.pos, role) >= .7 ? 'amb' : 'red'}">${Math.round(effSkill(p, role, false))}</td>` : ''}<td class="n ${condCls(p.cond)}">${Math.round(p.cond)}%</td><td>${where(p.id)}</td><td>${statusTags(p)}</td></tr>`).join('')}
      </tbody></table></div>
    </div>
  </div>`;
}
function tacticsPick(pid) {
  const tac = userTeam().tac; const sel = UI.tSel;
  if (!sel) { // no slot chosen: open player
    return playerModal(pid);
  }
  const arr = sel.type === 'xi' ? tac.xi : tac.bench;
  const cur = arr[sel.i];
  if (cur === pid) { UI.tSel = null; return render(); }
  const p = P(pid);
  if (sel.type === 'xi' && (FORMS[tac.form][sel.i][0] === 'GK') !== (p.pos === 'GK')) { if (p.pos === 'GK') toast('Goalkeepers can only play in goal.'); else toast('Pick a goalkeeper for the GK slot.'); return; }
  const xiIdx = tac.xi.indexOf(pid), bIdx = tac.bench.indexOf(pid);
  if (xiIdx >= 0) tac.xi[xiIdx] = cur || null; else if (bIdx >= 0) { if (cur) tac.bench[bIdx] = cur; else tac.bench.splice(bIdx, 1); }
  arr[sel.i] = pid;
  tac.xi = tac.xi.map(x => x || null);
  tac.bench = tac.bench.filter(Boolean);
  // fill holes in XI
  if (tac.xi.some(x => !x)) validateLineup(G.user);
  autoTakers(G.user);
  UI.tSel = null; autosave(); render();
}

// ---------- fixtures ----------
function scrFixtures() {
  const tab = UI.tab.fx || 'mine';
  let fs = Object.values(G.fx).filter(f => tab === 'mine' ? (f.h === G.user || f.a === G.user) : f.comp === 'PL').sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : 0);
  let body;
  if (tab === 'mine') {
    body = `<div class="tw"><table class="t"><thead><tr><th>Date</th><th>Comp</th><th>Round</th><th>Opponent</th><th class="c">H/A</th><th class="c">Result</th><th>Scorers</th></tr></thead><tbody>${fs.map(f => { const home = f.h === G.user, opp = home ? f.a : f.h; let res = ''; if (f.r) { const gf = home ? f.r[0] : f.r[1], ga = home ? f.r[1] : f.r[0]; let w = gf > ga ? 'W' : gf < ga ? 'L' : 'D'; if (f.pen) { const pw = home ? f.pen[0] > f.pen[1] : f.pen[1] > f.pen[0]; w = pw ? 'W' : 'L'; } res = `<span class="form"><span class="${w}">${w}</span></span> <b class="mono">${gf}-${ga}</b>${f.pen ? ' <span class="dim">p</span>' : f.et ? ' <span class="dim">aet</span>' : ''}`; } const sc = f.sc ? f.sc.filter(s => s[2] === 'G' && s[1] === (home ? 0 : 1)).map(s => esc(surname(P(s[3]) ? P(s[3]).n : '?')) + ' ' + s[0] + "'").join(', ') : ''; return `<tr class="click ${f.d === G.date && !f.r ? 'me' : ''}" data-a="report" data-v="${f.id}"><td class="mono">${dNice(f.d)}</td><td class="mono dim">${COMP_SHORT[f.comp]}</td><td class="dim">${esc(f.rnd ? (typeof f.rnd === 'number' ? 'Round ' + f.rnd : f.rnd + (f.leg ? ' (leg ' + f.leg + ')' : '')) : '')}</td><td>${tLink(opp)}</td><td class="c">${f.neutral ? 'N' : home ? 'H' : 'A'}</td><td class="c">${res || '<span class="dim">' + (f.d < G.date ? '' : 'v') + '</span>'}</td><td class="dim" style="white-space:normal;min-width:140px">${sc}</td></tr>`; }).join('')}</tbody></table></div>`;
  } else {
    const rounds = tab === 'ch' && G.chLeague ? G.chLeague.rounds : G.league.rounds;
    const ri = UI.tab.round != null ? UI.tab.round : Math.max(0, rounds.findIndex(r => r.some(id => !G.fx[id].r)));
    const r = rounds[ri] || rounds[rounds.length - 1];
    body = `<div class="row" style="margin-bottom:8px"><button class="btn" data-a="round" data-v="${Math.max(0, ri - 1)}">◂ Prev</button><b class="yel" style="font-family:var(--f-disp);font-size:22px">Matchweek ${ri + 1} · ${dNice(G.fx[r[0]].d, false)}</b><button class="btn" data-a="round" data-v="${Math.min(rounds.length - 1, ri + 1)}">Next ▸</button></div><div class="tw">${resTable(r.map(id => G.fx[id]), false)}</div>`;
  }
  return `<div class="band">Fixtures &amp; results<small>${seasonLabel(G.year)}</small></div>
  <div class="tabs" style="margin-top:8px"><button class="${tab === 'mine' ? 'on' : ''}" data-a="tab" data-k="fx" data-v="mine">${esc(userTeam().short)}</button><button class="${tab === 'pl' ? 'on' : ''}" data-a="tab" data-k="fx" data-v="pl">Premier League rounds</button>${G.chLeague ? `<button class="${tab === 'ch' ? 'on' : ''}" data-a="tab" data-k="fx" data-v="ch">Championship rounds</button>` : ''}</div>${body}`;
}
function matchReport(fid) {
  const f = G.fx[fid]; if (!f) return;
  let inner;
  if (!f.r) inner = `<p class="dim">Not played yet. Kick-off ${dNice(f.d)}${f.neutral ? ' at a neutral venue' : ' at ' + esc(T(f.h).stadium)}.</p>`;
  else {
    const sc = (side) => (f.sc || []).filter(s => s[1] === side).map(s => `${s[2] === 'R' ? '<span class="red">▮</span> ' : ''}${esc(P(s[3]) ? P(s[3]).n : 'Unknown')} ${s[0]}'${s[2] === 'G' && s[4] && P(s[4]) ? ` <span class="dim">(${esc(surname(P(s[4]).n))})</span>` : ''}`).join('<br>');
    const lite = (side) => T(side === 0 ? f.h : f.a).lite;
    const st = f.st;
    inner = `<div class="score" style="margin-bottom:10px"><div class="tm">${badge(f.h)}<span>${esc(tName(f.h))}</span></div><div class="sc">${f.r[0]}-${f.r[1]}</div><div class="tm r"><span>${esc(tName(f.a))}</span>${badge(f.a)}</div>
      <div class="sub"><div>${sc(0) || (lite(0) && f.r[0] ? 'Goals scored' : '')}</div><div style="text-align:right">${sc(1) || (lite(1) && f.r[1] ? 'Goals scored' : '')}</div></div></div>
      ${f.pen ? `<p class="yel">Penalties: ${f.pen[0]}-${f.pen[1]}</p>` : f.et ? '<p class="dim">After extra time</p>' : ''}
      ${st ? statBars(st.map(s => ({ po: s.po, sh: s.sh, ot: s.ot, co: s.co, fo: s.fo, yc: s.yc, rc: s.rc, xg: s.xg }))) : ''}
      ${f.momN ? `<p>Player of the match: <b class="yel">${esc(f.momN)}</b></p>` : ''}
      ${f.att ? `<p class="dim">Attendance ${f.att.toLocaleString('en-GB')}</p>` : ''}
      ${f.rt ? `<div class="grid2">${[0, 1].map(i => f.rt[i] && f.rt[i].length ? `<div class="tw"><table class="t"><thead><tr><th>${esc(tName(i ? f.a : f.h))}</th><th class="n">Rtg</th></tr></thead><tbody>${f.rt[i].map(([id, r, g, a, on]) => `<tr><td>${on ? '<span class="grn">↑</span> ' : ''}${esc(P(id) ? P(id).n : '?')}${g ? ' ⚽'.repeat(g) : ''}</td><td class="n ${rClass(r)}">${r.toFixed(1)}</td></tr>`).join('')}</tbody></table></div>` : '<div></div>').join('')}</div>` : ''}`;
  }
  UI.modal = `<div class="band"><span>${COMP_NAME[f.comp]} · ${esc(typeof f.rnd === 'number' ? 'Matchweek ' + f.rnd : f.rnd || '')}</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">${inner}</div>`;
  render();
}
function statBars(st) {
  const rows = [['po', 'Possession %'], ['sh', 'Shots'], ['ot', 'On target'], ['xg', 'xG'], ['co', 'Corners'], ['fo', 'Fouls'], ['yc', 'Yellow cards'], ['rc', 'Red cards']];
  return rows.map(([k, l]) => { const a = st[0][k] || 0, b = st[1][k] || 0, tot = a + b || 1; return `<div class="stat"><span class="v">${a}</span><span class="lbl">${l}</span><span class="v">${b}</span><div class="sbar"><i style="width:${a / tot * 100}%;background:var(--cyan)"></i><i style="width:${b / tot * 100}%;background:var(--amb)"></i></div></div>`; }).join('');
}

// ---------- league table ----------
function tableHtml(rows, zones, opts = {}) {
  return `<div class="tw"><table class="t"><thead><tr><th class="n">Pos</th><th>Team</th><th class="n">P</th><th class="n">W</th><th class="n">D</th><th class="n">L</th><th class="n">GF</th><th class="n">GA</th><th class="n">GD</th><th class="n">Pts</th>${opts.form ? '<th>Form</th>' : ''}</tr></thead><tbody>
  ${rows.map((r, i) => `<tr class="${r.t === G.user ? 'me' : ''}"><td class="n ${zones ? zones(i) : ''}">${i + 1}</td><td>${tLink(r.t)}</td><td class="n">${r.p}</td><td class="n">${r.w}</td><td class="n">${r.d}</td><td class="n">${r.l}</td><td class="n">${r.gf}</td><td class="n">${r.ga}</td><td class="n">${r.gf - r.ga > 0 ? '+' : ''}${r.gf - r.ga}</td><td class="n"><b>${r.pts}</b></td>${opts.form ? `<td class="form">${r.form.slice(-5).map(x => `<span class="${x}">${x}</span>`).join('')}</td>` : ''}</tr>`).join('')}
  </tbody></table></div>`;
}
function scrTable() {
  const tab = UI.tab.tb || (userDiv() === 'CH' ? 'ch' : 'pl');
  const body = tab === 'pl' ? tableHtml(leagueTable(), i => i < 5 ? 'zone-ucl' : i < 7 ? 'zone-uel' : i < 8 ? 'zone-uecl' : i >= 17 ? 'zone-rel' : '', { form: true }) + `<p class="dim" style="margin-top:6px"><span class="cyan">▌</span> Champions League · <span class="amb">▌</span> Europa League · <span class="grn">▌</span> Conference League · <span class="red">▌</span> Relegation. FA Cup and Carabao Cup winners can take European places.</p>`
    : tableHtml(champTable(), i => i < 2 ? 'zone-ucl' : i < (G.chLeague ? 8 : 6) ? 'zone-uel' : G.chLeague && i >= 21 ? 'zone-rel' : '', { form: !!G.chLeague }) + (G.chLeague ? `<p class="dim" style="margin-top:6px"><span class="cyan">▌</span> Automatic promotion · <span class="amb">▌</span> Play-offs (new for 2026/27: 5th v 8th and 6th v 7th eliminators, then two-legged semi-finals with 3rd and 4th, final at Wembley) · <span class="red">▌</span> Relegation to League One.${Object.keys(G.ded || {}).length ? ' ' + Object.entries(G.ded).map(([t, n]) => `${tName(t)} were deducted ${n} points.`).join(' ') : ''}</p>${poHtml()}` : `<p class="dim" style="margin-top:6px">This season's Championship is simulated at team level (your save started before the Championship had real squads). Full Championship fixtures start next season.</p>`);
  return `<div class="band">League tables<small>${seasonLabel(G.year)}</small></div><div class="tabs" style="margin-top:8px"><button class="${tab === 'pl' ? 'on' : ''}" data-a="tab" data-k="tb" data-v="pl">Premier League</button><button class="${tab === 'ch' ? 'on' : ''}" data-a="tab" data-k="tb" data-v="ch">Championship</button></div>${body}`;
}

// ---------- competitions ----------
function scrComps() {
  const userEuro = ['UCL', 'UEL', 'UECL'].find(c => G.euro[c].teams.includes(G.user));
  const tab = UI.tab.cp || 'LC';
  const tabs = [['LC', 'Carabao Cup'], ['FA', 'FA Cup'], ['UCL', 'Champions League'], ['UEL', 'Europa League'], ['UECL', 'Conference League']];
  let body = '';
  if (tab === 'LC' || tab === 'FA') {
    const cup = G.cups[tab];
    body = cup.winner ? `<div class="box pad yel" style="margin-bottom:8px">Winners: ${tLink(cup.winner, true)}</div>` : '';
    body += cup.rounds.slice().reverse().filter(r => r.ties.length).map(r => `<h2 class="sect">${r.n} <span class="dim mono" style="font-size:16px">${r.d.map(d => dShort(d)).join(' & ')}</span></h2><div class="tw">${tiesTable(r)}</div>`).join('') || '<p class="dim">The draw has not been made yet.' + (tab === 'FA' ? ' Premier League clubs enter at the Third Round in January.' : '') + '</p>';
  } else {
    const E = G.euro[tab];
    body = E.winner ? `<div class="box pad yel" style="margin-bottom:8px">Winners: ${tLink(E.winner, true)}</div>` : '';
    body += E.ko.slice().reverse().filter(r => r.ties.length).map(r => `<h2 class="sect">${r.n}</h2><div class="tw">${tiesTable(r)}</div>`).join('');
    body += `<h2 class="sect">League phase</h2>` + tableHtml(euroTable(tab), i => i < 8 ? 'zone-ucl' : i < 24 ? 'zone-uel' : 'zone-rel');
  }
  return `<div class="band">Cups &amp; Europe<small>${userEuro ? 'You are in the ' + EURO_NAMES[userEuro] : 'No European football this season'}</small></div>
  <div class="tabs" style="margin-top:8px">${tabs.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="cp" data-v="${k}">${l}${k === userEuro ? ' ★' : ''}</button>`).join('')}</div>${body}`;
}
function tiesTable(r) {
  return `<table class="t"><tbody>${r.ties.map(t => { const fs = t.fx.map(id => G.fx[id]); const me = t.t.includes(G.user); const pl = t.t.some(x => !T(x).lite); return `<tr class="click ${me ? 'me' : ''}" data-a="report" data-v="${fs[fs.length - 1].id}" ${!pl && !me ? 'style="opacity:.75"' : ''}><td style="text-align:right">${t.w === t.t[0] ? '<b>' : ''}${esc(tName(t.t[0]))}${t.w === t.t[0] ? '</b>' : ''} ${badge(t.t[0])}</td><td class="c mono">${fs.map(f => f.r ? (f.h === t.t[0] ? f.r[0] + '-' + f.r[1] : f.r[1] + '-' + f.r[0]) + (f.pen ? ` (p${f.h === t.t[0] ? f.pen[0] + '-' + f.pen[1] : f.pen[1] + '-' + f.pen[0]})` : '') : 'v').join(' · ')}</td><td>${badge(t.t[1])} ${t.w === t.t[1] ? '<b>' : ''}${esc(tName(t.t[1]))}${t.w === t.t[1] ? '</b>' : ''}</td></tr>`; }).join('')}</tbody></table>`;
}

// ---------- stats ----------
function scrStats() {
  const tab = UI.tab.st || 'g'; const lg = UI.tab.stl || userDiv();
  const pls = Object.values(G.players).filter(p => divOf(p.c) === lg && (p.st.la || 0) > 0);
  const defs = { g: ['League goals', p => p.st.lg || 0], as: ['League assists', p => p.st.las || 0], r: ['Average rating (min 5 apps)', p => (p.st.la || 0) >= 5 ? p.st.lr / p.st.la : 0], cs: ['Clean sheets (all comps)', p => p.pos === 'GK' ? p.st.cs : 0], mom: ['Player of the match awards', p => p.st.mom] };
  const [lab, fn] = defs[tab];
  const list = pls.filter(p => fn(p) > 0).sort((a, b) => fn(b) - fn(a)).slice(0, 30);
  return `<div class="band">Statistics<small>${COMP_NAME[lg]} ${seasonLabel(G.year)}</small></div>
  <div class="tabs" style="margin-top:8px">${['PL', 'CH'].map(k => `<button class="${lg === k ? 'on' : ''}" data-a="tab" data-k="stl" data-v="${k}">${COMP_NAME[k]}</button>`).join('')}</div>
  <div class="tabs" style="margin-top:4px">${Object.entries(defs).map(([k, [l]]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="st" data-v="${k}">${l.split(' (')[0]}</button>`).join('')}</div>
  <div class="tw"><table class="t"><thead><tr><th class="n">#</th><th>Player</th><th>Club</th><th>Pos</th><th class="n">Apps</th><th class="n">${esc(lab.split(' (')[0])}</th></tr></thead><tbody>
  ${list.map((p, i) => `<tr class="click ${p.c === G.user ? 'me' : ''}" data-a="player" data-v="${p.id}"><td class="n">${i + 1}</td><td>${esc(p.n)}</td><td>${tLink(p.c)}</td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.st.la || 0}</td><td class="n"><b>${tab === 'r' ? fn(p).toFixed(2) : fn(p)}</b></td></tr>`).join('') || '<tr><td colspan="6" class="dim">No matches played yet.</td></tr>'}
  </tbody></table></div>`;
}

// ---------- transfers ----------
function scrTransfers() {
  const tab = UI.tab.tr || 'search';
  const u = userTeam();
  let body = '';
  if (tab === 'search') {
    const f = UI.filt;
    let list = Object.values(G.players).filter(p => divOf(p.c) && p.c !== G.user);
    if (f.lg) list = list.filter(p => divOf(p.c) === f.lg);
    if (f.q) { const q = f.q.toLowerCase(); list = list.filter(p => p.n.toLowerCase().includes(q)); }
    if (f.grp) list = list.filter(p => f.grp.includes(p.pos));
    if (f.club) list = list.filter(p => p.c === f.club);
    if (f.max) list = list.filter(p => calcValue(p) <= +f.max);
    if (f.age) list = list.filter(p => p.age <= +f.age);
    list.sort((a, b) => b.ca - a.ca);
    const shown = list.slice(0, 120);
    body = `<div class="row" style="margin-bottom:8px">
      <div><label class="lb" for="fq">Name</label><input class="f" id="fq" data-a="filt" data-k="q" value="${esc(f.q)}" placeholder="e.g. Saka"></div>
      <div><label class="lb" for="fg">Position</label><select class="f" id="fg" data-a="filt" data-k="grp"><option value="">Any</option>${[['GK', 'Goalkeeper'], ['CB', 'Centre-back'], ['LB,RB', 'Full-back'], ['DM,CM', 'Central midfield'], ['AM', 'Attacking midfield'], ['LW,RW', 'Winger'], ['ST', 'Striker']].map(([v, l]) => `<option value="${v}" ${f.grp === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div><label class="lb" for="fc">Club</label><select class="f" id="fc" data-a="filt" data-k="club"><option value="">Any</option>${['PL', 'CH'].map(d => `<optgroup label="${COMP_NAME[d]}">${divTeams(d).filter(t => t !== G.user).slice().sort((a, b) => tName(a) < tName(b) ? -1 : 1).map(t => `<option value="${t}" ${f.club === t ? 'selected' : ''}>${esc(tName(t))}</option>`).join('')}</optgroup>`).join('')}</select></div>
      <div><label class="lb" for="fl">League</label><select class="f" id="fl" data-a="filt" data-k="lg"><option value="">Any</option>${['PL', 'CH'].map(d => `<option value="${d}" ${f.lg === d ? 'selected' : ''}>${COMP_NAME[d]}</option>`).join('')}</select></div>
      <div><label class="lb" for="fm">Max value £m</label><input class="f" id="fm" type="number" min="0" style="width:90px" data-a="filt" data-k="max" value="${esc(f.max)}"></div>
      <div><label class="lb" for="fa">Max age</label><input class="f" id="fa" type="number" min="15" style="width:70px" data-a="filt" data-k="age" value="${esc(f.age || '')}"></div>
    </div><p class="dim" style="margin:0 0 6px">${list.length} players match${list.length > 120 ? ', showing the top 120 by rating' : ''}.</p>${playerTable(shown, { club: true, hide: ['no', 'mor', 'fa'] })}`;
  } else if (tab === 'short') {
    const list = UI.short.map(P).filter(p => p && divOf(p.c) && p.c !== G.user);
    body = list.length ? playerTable(list, { club: true, hide: ['no', 'mor'] }) : '<p class="dim">Your shortlist is empty. Open a player and choose Add to shortlist.</p>';
  } else if (tab === 'deals') {
    const mine = G.offers.filter(o => o.user && o.st !== 'void');
    const inc = G.offers.filter(o => o.from === G.user && !o.user);
    const row = (o, out) => { const p = P(o.pid); let act = ''; if (out) { if (o.st === 'accepted') act = `<button class="btn pri" data-a="termsOpen" data-v="${o.id}">Agree terms</button>`; else if (o.st === 'countered') act = `<button class="btn pri" data-a="cntAcc" data-v="${o.id}">Pay ${money(o.counter)}</button> <button class="btn" data-a="withdraw" data-v="${o.id}">Withdraw</button>`; } else if (o.st === 'incoming') act = `<button class="btn pri" data-a="offAcc" data-v="${o.id}">Accept</button> <button class="btn" data-a="offCnt" data-v="${o.id}">Counter</button> <button class="btn warn" data-a="offRej" data-v="${o.id}">Reject</button>`; return `<tr><td class="mono">${dShort(o.d)}</td><td class="click" data-a="player" data-v="${p.id}"><b>${esc(p.n)}</b></td><td>${out ? tLink(o.from) : (o.abroad ? esc(o.buyer) : tLink(o.to))}</td><td class="n">${money(o.fee)}</td><td>${esc({ pending: 'Awaiting reply', accepted: 'Fee agreed', countered: 'Counter-offer', rejected: 'Rejected', done: 'Completed', incoming: 'Offer received', expired: 'Expired' }[o.st] || o.st)}</td><td>${act}</td></tr>`; };
    body = `<h2 class="sect">Your bids</h2><div class="tw"><table class="t"><thead><tr><th>Date</th><th>Player</th><th>Club</th><th class="n">Fee</th><th>Status</th><th></th></tr></thead><tbody>${mine.map(o => row(o, true)).join('') || '<tr><td colspan="6" class="dim">No bids yet.</td></tr>'}</tbody></table></div>
    <h2 class="sect">Offers for your players</h2><div class="tw"><table class="t"><thead><tr><th>Date</th><th>Player</th><th>From</th><th class="n">Fee</th><th>Status</th><th></th></tr></thead><tbody>${inc.map(o => row(o, false)).join('') || '<tr><td colspan="6" class="dim">No offers.</td></tr>'}</tbody></table></div>`;
  } else if (tab === 'fa') {
    const list = G.fa.map(P).filter(Boolean);
    body = list.length ? `<p class="dim">Free agents cost no fee. Sign them while a window is open.</p>` + playerTable(list, { hide: ['no', 'mor', 'fa', 'a', 'g', 'as', 'ar'] }) : '<p class="dim">No free agents at the moment. Players whose contracts expire join this pool in the summer.</p>';
  } else if (tab === 'scout') { body = scoutTab();
  } else if (tab === 'loans') { body = loansTab();
  } else if (tab === 'list') {
    const list = squad(G.user).filter(p => p.listed);
    body = list.length ? playerTable(list) : '<p class="dim">No players listed. Listing a player makes offers more likely, at slightly lower fees.</p>';
  }
  return `<div class="band">Transfers<small>${G.window ? '<span>Window open</span>' : 'Window closed'} · Budget ${money(u.tb)} · Wages ${wageStr(wageBill(G.user))} of ${wageStr(u.wb)}</small></div>
  <div class="tabs" style="margin-top:8px">${[['search', 'Player search'], ['short', 'Shortlist (' + UI.short.length + ')'], ['deals', 'Deals'], ['fa', 'Free agents'], ['scout', 'Scouting'], ['loans', 'Loans'], ['list', 'My transfer list']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="tr" data-v="${k}">${l}</button>`).join('')}</div>${body}`;
}

// ---------- finance ----------
function scrFinance() {
  const t = userTeam(); const f = t.fin;
  const inT = Object.values(f.in).reduce((a, b) => a + b, 0), outT = Object.values(f.out).reduce((a, b) => a + b, 0);
  const rows = (o, labels, tot, col) => Object.entries(labels).map(([k, l]) => `<div style="margin:6px 0"><div class="row" style="justify-content:space-between"><span>${l}</span><b class="mono">${money(o[k] || 0)}</b></div><div class="bar"><i style="width:${tot ? Math.min(100, (o[k] || 0) / tot * 100) : 0}%;background:${col}"></i></div></div>`).join('');
  return `<div class="band">Finances<small>${seasonLabel(G.year)} so far</small></div>
  <div class="grid3" style="margin-top:10px">
    <div class="box pad"><label class="lb">Bank balance</label><div class="big ${t.bal < 0 ? 'red' : ''}">${money(t.bal)}</div></div>
    <div class="box pad"><label class="lb">Transfer budget</label><div class="big">${money(t.tb)}</div></div>
    <div class="box pad"><label class="lb">Wage bill / budget</label><div class="big" style="font-size:30px">${wageStr(wageBill(G.user))}</div><div class="dim">of ${wageStr(t.wb)}</div><div class="bar" style="margin-top:6px"><i style="width:${Math.min(100, wageBill(G.user) / t.wb * 100)}%;background:${wageBill(G.user) > t.wb ? 'var(--red)' : 'var(--grn)'}"></i></div></div>
  </div>
  <div class="grid2" style="margin-top:12px">
    <div class="box pad"><h2 class="sect" style="margin-top:0">Income · ${money(inT)}</h2>${rows(f.in, { gate: 'Matchday', tv: 'Broadcasting', com: 'Commercial', prize: 'Prize money', sales: 'Player sales' }, inT, 'var(--grn)')}</div>
    <div class="box pad"><h2 class="sect" style="margin-top:0">Expenditure · ${money(outT)}</h2>${rows(f.out, Object.assign({ wages: 'Wages', buys: 'Transfer fees', other: 'Settlements' }, f.out.build ? { build: 'Building work' } : {}), outT, 'var(--red)')}</div>
  </div>
  <p class="dim" style="margin-top:10px">Wages are paid every Monday. Home gate receipts depend on stadium size (${t.cap.toLocaleString('en-GB')} at ${esc(t.stadium)}). Selling players adds 90% of the fee to your transfer budget.</p>`;
}

// ---------- club ----------
function scrClub() {
  const t = userTeam(); const tgt = boardTarget();
  const pos = userTable().findIndex(r => r.t === G.user) + 1;
  const hon = G.honours[G.user] || [];
  const conf = Math.round(G.board);
  return `<div class="band">${esc(t.name)}<small>${esc(t.stadium)} · capacity ${t.cap.toLocaleString('en-GB')}</small></div>
  <div class="grid3" style="margin-top:10px">
    <div class="box pad"><label class="lb">Manager</label><div style="font-size:18px;font-weight:700">${esc(G.mgr)}</div><div class="dim">Reputation ${Math.round(G.mgrRep)}/100</div></div>
    <div class="box pad"><label class="lb">Board confidence</label><div class="big ${conf < 30 ? 'red' : conf < 55 ? 'amb' : 'grn'}">${conf}%</div><div class="bar"><i style="width:${conf}%;background:${conf < 30 ? 'var(--red)' : conf < 55 ? 'var(--amb)' : 'var(--grn)'}"></i></div></div>
    <div class="box pad"><label class="lb">Season target</label><div style="font-size:16px;font-weight:600">${esc(cap1(tgt.txt))}</div><div class="dim">Top ${tgt.pos} or better · currently ${ordinal(pos)}</div></div>
  </div>
  <h2 class="sect">Honours with this save</h2><div class="box pad">${hon.length ? hon.map(h => `<div>🏆 ${esc(h)}</div>`).join('') : '<span class="dim">None yet.</span>'}</div>
  <h2 class="sect">Season history</h2><div class="tw"><table class="t"><thead><tr><th>Season</th><th>Club</th><th class="n">Finish</th><th>Champions</th><th>Trophies</th><th>Golden Boot</th></tr></thead><tbody>${G.hist.map(h => `<tr><td class="mono">${h.s}</td><td>${tLink(h.team)}</td><td class="n">${ordinal(h.upos)}</td><td>${tLink(h.champ)}</td><td>${esc(h.cups.join(', ') || '-')}</td><td>${h.top ? esc(h.top[0] + ' (' + h.top[2] + ')') : ''}</td></tr>`).join('') || '<tr><td colspan="6" class="dim">Your first season is under way.</td></tr>'}</tbody></table></div>
  <h2 class="sect">Other clubs</h2><div class="tw"><table class="t"><thead><tr><th>Club</th><th>League</th><th>Manager</th><th>Stadium</th><th class="n">Rep</th><th class="n">Squad</th></tr></thead><tbody>${fullTeams().map(id => `<tr class="click" data-a="clubview" data-v="${id}"><td>${tLink(id, true)}</td><td class="mono dim">${COMP_SHORT[divOf(id)]}</td><td>${esc(T(id).mgr)}</td><td>${esc(T(id).stadium)}</td><td class="n">${T(id).rep}</td><td class="n">${G.sq[id].length}</td></tr>`).join('')}</tbody></table></div>`;
}
function clubModal(tid) {
  const t = T(tid);
  UI.modal = `<div class="band"><span>${badge(tid)} ${esc(t.name)}</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc"><p class="dim">${esc(t.mgr)} · ${esc(t.stadium)} · ${t.tac.form}</p>${playerTable(squad(tid), { hide: ['mor'] })}</div>`;
  render();
}

// ---------- game ----------
function scrGame() {
  return `<div class="band">Game<small>Save, back up, restart</small></div>
  <div class="grid2" style="margin-top:10px">
    <div class="box pad"><h2 class="sect" style="margin-top:0">Saving</h2><p>The game saves itself in this browser after every match day. Clearing browser data removes it, so export a backup now and then.</p><div class="row"><button class="btn pri" data-a="save">Save now</button><button class="btn" data-a="export">Export backup</button></div></div>
    <div class="box pad"><h2 class="sect" style="margin-top:0">Restore</h2><p>Paste a backup you exported earlier.</p><textarea id="imp" class="f" style="width:100%;height:80px" placeholder="Paste backup text here"></textarea><div class="row" style="margin-top:6px"><button class="btn" data-a="import">Load backup</button></div></div>
    <div class="box pad"><h2 class="sect" style="margin-top:0">New career</h2><p>Start over with any club. Your current save will be replaced.</p><button class="btn warn" data-a="newAsk">Start a new career</button><div id="newconf"></div></div>
  </div><div id="exp"></div>`;
}
