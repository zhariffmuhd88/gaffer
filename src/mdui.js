// ===== MATCHDAY UI: live match screen, other scores, shouts, momentum, post-match =====
function atmBase(f) {
  const v = venueOf(f); const fill = attendanceOf(f) / v.cap;
  let a = 40 + fill * 25;
  if (isRival(f.h, f.a)) a += 12;
  if (f.rnd === 'Final' || String(f.rnd).includes('Semi')) a += 15;
  if ((T(f.h).rep || 60) >= 85 && (T(f.a).rep || 60) >= 85) a += 8;
  if (f.comp === 'UCL') a += 6;
  return clamp(a, 30, 95);
}
// ---- other matches on the same day ----
function setupOthers(LM) {
  const M = LM.M; LM.others = []; LM.vidi = [];
  for (const id of (G.byDate[G.date] || [])) {
    if (id === M.fid) continue; const f = G.fx[id]; if (f.r) continue;
    if (T(f.h).lite && T(f.a).lite) { LM.others.push({ f, quick: true }); continue; }
    const pre = preMatch(f); const M2 = createMatch(id, false);
    LM.others.push({ f, M2, pre, g: 0, rc: 0 });
  }
}
function stepOthers(LM, toMin) {
  for (const o of LM.others) {
    if (o.quick || o.M2.done) continue;
    while (!o.M2.done && o.M2.min < toMin) { stepMinute(o.M2); o.M2.ht = false; o.M2.alert = null; }
    vidiCheck(LM, o);
  }
}
function vidiCheck(LM, o) {
  const M2 = o.M2, f = o.f;
  const gs = M2.ev.filter(e => e.t === 'goal');
  while (o.g < gs.length) {
    const e = gs[o.g]; o.g++;
    const sc = [0, 0]; for (let i = 0; i < o.g; i++) sc[gs[i].side]++;
    const p = P(e.p);
    LM.vidi.unshift({ min: e.min, k: 'goal', comp: f.comp, txt: `${tName(f.h)} ${sc[0]}-${sc[1]} ${tName(f.a)}`, who: p ? surname(p.n) : '' });
  }
  const rs = M2.ev.filter(e => e.t === 'rc');
  while (o.rc < rs.length) { const e = rs[o.rc]; o.rc++; const p = P(e.p); LM.vidi.unshift({ min: e.min, k: 'rc', comp: f.comp, txt: `${tName(e.side === 0 ? f.h : f.a)}`, who: p ? surname(p.n) : '' }); }
}
function finishOthers(LM) {
  for (const o of LM.others) {
    if (o.fin) continue; o.fin = true;
    if (o.quick) { if (!o.f.r) quickFixture(o.f); continue; }
    if (!o.M2.done) simulateFull(o.M2);
    vidiCheck(LM, o);
    finalizeMatch(o.M2); postMatch(o.f, o.pre);
  }
}
function liveTable(LM, dScore) {
  const tb = tableOf(LM.M.comp === 'CH' ? 'CH' : 'PL').map(r => ({ ...r }));
  const idx = {}; tb.forEach(r => idx[r.t] = r);
  const add = (f, sc) => { if (f.comp !== LM.M.comp || !idx[f.h] || !idx[f.a] || f.r) return; addRes(idx[f.h], sc[0], sc[1]); addRes(idx[f.a], sc[1], sc[0]); };
  add(G.fx[LM.M.fid], dScore);
  for (const o of LM.others) if (o.M2 && !o.fin) add(o.f, o.M2.score);
  return tb.sort(sortTable);
}
// ---- momentum & atmosphere ----
function momentum(LM) {
  const M = LM.M; let m = (M.pside === 0 ? .25 : -.25);
  for (const s of M.shots.filter(x => x.min === M.min)) m += (s.side === 0 ? 1 : -1) * (.35 + s.xg * 2.5);
  LM.mom[M.min] = clamp(m, -1, 1);
}
function atmTick(LM) {
  const M = LM.M; LM.atm += (LM.atmBase - LM.atm) * .05;
  for (const e of M.ev.filter(x => x.min === M.min && x.t === 'goal')) LM.atm = clamp(LM.atm + (e.side === 0 || G.fx[M.fid].neutral ? 14 : -7), 15, 100);
  if (M.shots.some(x => x.min === M.min && x.xg > .2)) LM.atm = Math.min(100, LM.atm + 2);
}
// ---- touchline shouts ----
const SHOUTS = [['push', 'Push forward', 'is on the touchline urging his side forward.'], ['flanks', 'Hit the flanks', 'wants the ball out wide.'], ['calm', 'Calm it down', 'is telling his players to slow it down and stay on their feet.'], ['focus', 'Concentrate', 'demands more concentration at the back.'], ['enc', 'Encourage', 'is applauding his players and geeing them up.']];
function doShout(LM, k) {
  const M = LM.M, ui = uSide(M), S = M.sides[ui];
  if (M.done) return;
  if (LM.shoutCd && M.min < LM.shoutCd) { toast(`You can shout again in ${LM.shoutCd - M.min} minute(s).`); return; }
  const prev = { width: S.tac.width, tackle: S.tac.tackle, tempo: S.tac.tempo };
  if (k === 'flanks') S.tac.width = 3;
  if (k === 'calm') { S.tac.tackle = 1; S.tac.tempo = 1; }
  if (k === 'enc') for (const e of S.ps) if (e.on && !e.p.pseudo) e.p.mor = clamp(e.p.mor + 3, 5, 100);
  S.shout = { k, until: M.min + 10, prev }; LM.shoutCd = M.min + 10; units(S);
  const sh = SHOUTS.find(x => x[0] === k);
  M.com.push({ min: M.min, k: 'shout', text: `${G.mgr} ${sh[2]}`, side: ui });
  toast(`${sh[1]}: in effect for 10 minutes.`);
  renderMatch();
}
function shoutExpire(LM) {
  const S = LM.M.sides[uSide(LM.M)];
  if (S.shout && LM.M.min >= S.shout.until) { const p = S.shout.prev; if (S.shout.k === 'flanks') S.tac.width = p.width; if (S.shout.k === 'calm') { S.tac.tackle = p.tackle; S.tac.tempo = p.tempo; } S.shout = null; units(S); }
}

// ---- live loop ----
function startLive(fid, instant) {
  const f = G.fx[fid];
  const pre = preMatch(f);
  const M = createMatch(fid, true);
  const LM = UI.match = { M, pre, speed: UI.speedPref != null ? UI.speedPref : 1, run: !instant, panel: null, sel: null, talked: false, mom: [], atmBase: atmBase(f), autoRp: UI.autoRp !== false, rtab: 'stats', ptab: 'xg', replays: [], heat: new Map() };
  LM.atm = LM.atmBase;
  LM.prePos = {}; tableOf(LM.M.comp === 'CH' ? 'CH' : 'PL').forEach((r, i) => LM.prePos[r.t] = i + 1);
  setupOthers(LM);
  UI.modal = null;
  if (instant) {
    while (!M.done) { stepMinute(M); M.ht = false; M.alert = null; momentum(LM); }
    stepOthers(LM, 200); for (const o of LM.others) if (o.M2 && !o.M2.done) simulateFull(o.M2);
    LM.view = 'text'; render(); return;
  }
  LM.view = UI.viewPref || '2d'; visInit(LM);
  SND.init(); setTimeout(() => SND.whistle(1, true), 300);
  render(); schedule();
}
function schedule(d) { const LM = UI.match; if (!LM || !LM.run) return; clearTimeout(LM.timer); LM.timer = setTimeout(tick, d != null ? d : SPEEDS[LM.speed][1]); }
function tick() {
  const LM = UI.match; if (!LM || !LM.run) return;
  if (visBusy(LM)) { clearTimeout(LM.timer); LM.timer = setTimeout(tick, 90); return; }
  const M = LM.M;
  stepMinute(M);
  stepOthers(LM, M.min);
  momentum(LM); atmTick(LM); shoutExpire(LM);
  let delay = SPEEDS[LM.speed][1];
  if (LM.vis) { const d = visNewMinute(LM, delay); if (LM.view === '2d') delay = Math.min(delay, d); }
  if (M.ht) SND.whistle(2, true);
  if (M.done) SND.whistle(3, true);
  if (M.alert) { LM.alertTxt = M.alert; M.alert = null; LM.run = false; LM.panel = 'subs'; }
  if (M.ht) { M.ht = false; LM.run = false; LM.panel = 'talk'; LM.talked = false; }
  if (M.done) { LM.run = false; stepOthers(LM, 200); }
  renderMatch();
  schedule(delay);
}
function finishLive() {
  const LM = UI.match; const M = LM.M; const f = G.fx[M.fid];
  clearTimeout(LM.timer); if (LM.vis) cancelAnimationFrame(LM.vis.raf); SND.setCrowd(0); SND.pause();
  finishOthers(LM);
  finalizeMatch(M); postMatch(f, LM.pre);
  finishDay();
  UI.match = null; UI.scr = 'inbox'; UI.msg = null;
  const ui = uSide(M), gf = M.score[ui], ga = M.score[1 - ui];
  const won = gf > ga || (M.pens && M.pens[ui] > M.pens[1 - ui]), lost = !won && (gf < ga || !!M.pens);
  pressAfterMatch(f, won, lost);
  G.fans = clamp((G.fans ?? 60) + (won ? 1.5 : lost ? -2 : 0), 0, 100);
  if (!G.sacked) interviewModal(M);
  toast(`${won ? 'Win' : lost ? (M.pens ? 'Out on penalties' : 'Defeat') : 'Draw'} · ${M.sides[0].name} ${M.score[0]}-${M.score[1]} ${M.sides[1].name}`);
  render();
}

// ---- rendering ----
function momSvg(LM, kits, dScore) {
  const M = LM.M, n = M.et || M.min > 90 ? 120 : 90;
  const c0 = uiCol(kits[0].body), c1 = uiCol(kits[1].body);
  let bars = '';
  for (let i = 1; i <= Math.min(M.min, n); i++) {
    const v = ((LM.mom[i] || 0) + (LM.mom[i - 1] || 0) * .6 + (LM.mom[i - 2] || 0) * .3) / 1.9;
    const h = Math.abs(v) * 13; const x = (i - 1) * (300 / n);
    bars += `<rect x="${x.toFixed(1)}" y="${v >= 0 ? (15 - h).toFixed(1) : 15}" width="${(300 / n * .8).toFixed(2)}" height="${h.toFixed(1)}" fill="${v >= 0 ? c0 : c1}"/>`;
  }
  const hide = momHide(LM);
  for (const e of M.ev.filter(x => x.t === 'goal' && !(hide && x.min === M.min))) bars += `<circle cx="${((e.min - .5) * 300 / n).toFixed(1)}" cy="${e.side === 0 ? 2.6 : 27.4}" r="2.2" fill="#fff"/>`;
  bars += `<line x1="${150 * 90 / n}" y1="0" x2="${150 * 90 / n}" y2="30" stroke="rgba(255,255,255,.25)" stroke-dasharray="1 1"/>`;
  return `<svg class="mom" viewBox="0 0 300 30" preserveAspectRatio="none" role="img" aria-label="Match momentum"><line x1="0" y1="15" x2="300" y2="15" stroke="rgba(255,255,255,.2)"/>${bars}</svg>`;
}
function momHide(LM) { const V = LM.vis; return !!(V && LM.view === '2d' && V.pending && V.pendingMin === LM.M.min); }
function xgSvg(LM, kits) {
  const M = LM.M, n = M.et ? 120 : 90;
  const cum = [[0, 0], [0, 0]]; const pts = [[`10,110`], [`10,110`]]; let mx = .5;
  const tot = [0, 0]; for (const s of M.shots) tot[s.side] += s.xg; mx = Math.max(.6, tot[0], tot[1]) * 1.1;
  const X = (m) => (10 + m / n * 280).toFixed(1), Y = (v) => (110 - v / mx * 95).toFixed(1);
  const acc = [0, 0]; const marks = [];
  for (const s of M.shots.slice().sort((a, b) => a.min - b.min)) {
    pts[s.side].push(`${X(s.min)},${Y(acc[s.side])}`); acc[s.side] += s.xg; pts[s.side].push(`${X(s.min)},${Y(acc[s.side])}`);
    if (s.goal) marks.push(`<circle cx="${X(s.min)}" cy="${Y(acc[s.side])}" r="3.5" fill="${uiCol(kits[s.side].body)}" stroke="#fff" stroke-width="1.2"/>`);
  }
  for (let i = 0; i < 2; i++) pts[i].push(`${X(Math.max(90, M.min))},${Y(acc[i])}`);
  let grid = ''; for (const m of [0, 15, 30, 45, 60, 75, 90].concat(M.et ? [105, 120] : [])) grid += `<line x1="${X(m)}" y1="15" x2="${X(m)}" y2="110" stroke="rgba(255,255,255,.08)"/><text x="${X(m)}" y="120" fill="currentColor" font-size="7" text-anchor="middle">${m}'</text>`;
  return `<svg viewBox="0 0 300 124" class="xgsvg" role="img" aria-label="Expected goals timeline">${grid}
    ${[0, 1].map(i => `<polyline points="${pts[i].join(' ')}" fill="none" stroke="${uiCol(kits[i].body)}" stroke-width="2"/>`).join('')}${marks.join('')}
    <text x="12" y="10" font-size="8" fill="${uiCol(kits[0].body)}">${esc(M.sides[0].name)} xG ${tot[0].toFixed(2)}</text><text x="288" y="10" font-size="8" fill="${uiCol(kits[1].body)}" text-anchor="end">${esc(M.sides[1].name)} xG ${tot[1].toFixed(2)}</text></svg>`;
}
function scoresPanel(LM) {
  const rows = LM.others.map(o => {
    const f = o.f; const sc = o.quick ? (f.r ? f.r : null) : o.M2.score; const mn = o.quick ? (f.r ? 'FT' : '') : o.M2.done ? 'FT' : o.M2.min ? o.M2.min + "'" : '';
    return `<tr><td class="mono dim">${COMP_SHORT[f.comp]}</td><td style="text-align:right">${esc(tName(f.h))}</td><td class="c mono"><b>${sc ? sc[0] + '-' + sc[1] : 'v'}</b></td><td>${esc(tName(f.a))}</td><td class="mono dim">${mn}</td></tr>`;
  }).join('');
  const vd = LM.vidi.slice(0, 14).map(v => `<div><span class="dim">${v.min}'</span> ${v.k === 'goal' ? '<b class="yel">GOAL</b>' : '<b class="red">RED</b>'} ${esc(v.txt)}${v.who ? ` <span class="dim">(${esc(v.who)})</span>` : ''}</div>`).join('');
  return `${rows ? `<div class="tw"><table class="t"><tbody>${rows}</tbody></table></div>` : '<p class="dim">No other matches today.</p>'}${LM.others.length ? `<h2 class="sect">Vidiprinter</h2><div class="box vidi">${vd || '<div class="dim">No goals elsewhere yet.</div>'}</div>` : ''}`;
}
function tablePanel(LM, dScore) {
  const tb = liveTable(LM, dScore);
  return `<div class="tw"><table class="t"><thead><tr><th class="n">#</th><th>Team</th><th class="n">P</th><th class="n">GD</th><th class="n">Pts</th><th></th></tr></thead><tbody>${tb.map((r, i) => { const was = LM.prePos[r.t] || i + 1; const mv = was - (i + 1); return `<tr class="${r.t === G.user ? 'me' : ''}"><td class="n">${i + 1}</td><td>${tLink(r.t)}</td><td class="n">${r.p}</td><td class="n">${r.gf - r.ga > 0 ? '+' : ''}${r.gf - r.ga}</td><td class="n"><b>${r.pts}</b></td><td class="${mv > 0 ? 'grn' : mv < 0 ? 'red' : 'dim'} mono">${mv > 0 ? '▲' + mv : mv < 0 ? '▼' + (-mv) : '–'}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function renderMatch() {
  const LM = UI.match, M = LM.M; const [A, B] = M.sides; const ui = uSide(M);
  const f = G.fx[M.fid]; const V = LM.vis; const kits = V ? V.kits : kitFor(M);
  const hide = momHide(LM);
  const dScore = hide ? M.score.map((s, i) => s - M.ev.filter(e => e.t === 'goal' && e.side === i && e.min === M.min).length) : M.score;
  const com = hide ? M.com.filter(c => c.min < M.min || c.k === 'shout' || c.k === 'ko') : M.com;
  const key = com.filter(c => ['goal', 'rc', 'yc', 'big', 'ht', 'ft', 'inj', 'sub', 'save', 'miss', 'pen', 'var', 'skill', 'shout'].includes(c.k));
  const last = key.length ? key[key.length - 1] : com[com.length - 1];
  const evs = hide ? M.ev.filter(e => e.min < M.min) : M.ev;
  const scorers = (i) => evs.filter(e => e.t === 'goal' && e.side === i).map(e => esc(surname(pnById(M, e.p))) + ' ' + e.min + "'").join(', ');
  const reds = (i) => evs.filter(e => e.t === 'rc' && e.side === i).map(e => '<span class="red">▮</span> ' + esc(surname(pnById(M, e.p)))).join(' ');
  const done = M.done && !hide;
  const clock = done ? 'FT' : M.min === 0 ? 'KO' : (M.min > 90 && !M.et ? '90' : M.min) + "'";
  const S = M.sides[ui];
  const st = M.sides.map(s => ({ po: Math.round(100 * s.st.po / Math.max(1, A.st.po + B.st.po)), sh: s.st.sh, ot: s.st.ot, co: s.st.co, fo: s.st.fo, yc: s.st.yc, rc: s.st.rc, xg: +s.st.xg.toFixed(2) }));
  const lineup = (s) => `<div class="tw"><table class="t"><thead><tr><th>${esc(s.name)}</th><th class="n">Rtg</th><th class="n">Cnd</th></tr></thead><tbody>${s.ps.map(e => `<tr style="${e.on ? '' : 'opacity:.45'}"><td><span class="mono dim">${ROLE_LABEL[e.role]}</span> ${esc(e.p.pseudo ? cap1(ROLE_NOUN[e.role]) : surname(e.p.n))}${e.g ? ' ⚽'.repeat(e.g) : ''}${e.yc ? ' <span class="yel">▮</span>' : ''}${e.rc ? ' <span class="red">▮</span>' : ''}${e.inj ? ' <span class="red">✚</span>' : ''}${e.subOn ? ' <span class="grn">↑' + e.subOn + "'</span>" : ''}</td><td class="n ${rClass(e.rt)}">${e.rt.toFixed(1)}</td><td class="n ${condCls(e.p.cond)}">${Math.round(e.p.cond)}</td></tr>`).join('')}</tbody></table></div>`;
  let panel = '';
  if (LM.panel === 'talk' && !M.done) {
    const diff = M.score[ui] + M.agg[ui] - M.score[1 - ui] - M.agg[1 - ui];
    panel = `<div class="box pad" style="margin-top:10px"><h2 class="sect" style="margin-top:0">${M.min >= 90 ? 'Before extra time' : 'Half-time'} team talk</h2><p class="dim">You are ${diff > 0 ? 'ahead' : diff < 0 ? 'behind' : 'level'}. What do you tell the players?</p>${LM.talked ? `<p class="grn">${esc(LM.talked)}</p>` : `<div class="row">${[['praise', 'Praise them'], ['encourage', 'Encourage'], ['demand', 'Demand more'], ['calm', 'Keep calm, stay focused']].map(([k, l]) => `<button class="btn" data-a="talk" data-v="${k}">${l}</button>`).join('')}</div>`}</div>`;
  }
  if (LM.panel === 'subs' && !M.done) {
    const on = S.ps.filter(e => e.on);
    panel = `<div class="box pad" style="margin-top:10px">${LM.alertTxt ? `<div class="alert" style="margin-bottom:8px">${esc(LM.alertTxt)}</div>` : ''}<h2 class="sect" style="margin-top:0">Substitutions · ${S.subs} left</h2>
      <div class="grid2"><div><label class="lb">Take off</label>${on.map(e => `<button class="btn ${LM.sel === S.ps.indexOf(e) ? 'on' : ''}" style="display:block;width:100%;text-align:left;margin-bottom:3px" data-a="subOut" data-v="${S.ps.indexOf(e)}"><span class="mono">${ROLE_LABEL[e.role]}</span> ${esc(surname(e.p.n))} <span class="dim">${e.rt.toFixed(1)} · ${Math.round(e.p.cond)}%</span>${e.inj ? ' <span class="red">injured</span>' : ''}${e.yc ? ' <span class="yel">booked</span>' : ''}</button>`).join('')}</div>
      <div><label class="lb">Bring on</label>${S.bench.map((p, i) => `<button class="btn" style="display:block;width:100%;text-align:left;margin-bottom:3px" data-a="subIn" data-v="${i}" ${LM.sel == null || S.subs <= 0 ? 'disabled' : ''}><span class="mono">${POS_LABEL[p.pos]}</span> ${esc(p.n)} <span class="dim">${p.ca}${LM.sel != null ? ' · fit ' + Math.round(effSkill(p, S.ps[LM.sel].role)) : ''}</span></button>`).join('') || '<span class="dim">Bench is empty.</span>'}</div></div>
      <h2 class="sect">Team instructions</h2><div style="display:grid;gap:8px">${tacControls(S.tac, 'mtac')}</div></div>`;
  }
  const two = V && LM.view === '2d';
  const meta = M.meta || fxMeta(f);
  const rtabs = [['stats', 'Stats'], ['scores', 'Scores' + (LM.vidi && LM.vidi.length ? ` (${LM.vidi.filter(v => v.k === 'goal').length})` : '')], ...(LEAGUE_COMPS.includes(M.comp) ? [['table', 'Live table']] : []), ['lineups', 'Line-ups']];
  const rbody = LM.rtab === 'scores' ? scoresPanel(LM) : LM.rtab === 'table' && LEAGUE_COMPS.includes(M.comp) ? tablePanel(LM, dScore) : LM.rtab === 'lineups' ? `<div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${lineup(A)}${lineup(B)}</div>` : `<div class="box pad">${statBars(st)}</div>`;
  const shoutCd = LM.shoutCd && M.min < LM.shoutCd ? LM.shoutCd - M.min : 0;
  const activeShout = S.shout ? SHOUTS.find(x => x[0] === S.shout.k)[1] : null;
  let post = '';
  if (done) {
    const played = S.ps.filter(e => (e.mins > 0 || e.on) && !e.p.pseudo);
    const hsel = LM.heatSel && played.some(e => e.p.id === LM.heatSel) ? LM.heatSel : (played[0] && played[0].p.id);
    LM.heatSel = hsel;
    const ptabs = [['xg', 'xG timeline'], ['heat', 'Heatmaps'], ...(LM.replays.length ? [['rp', 'Goal replays']] : [])];
    const pbody = LM.ptab === 'heat' ? `<div class="row" style="margin-bottom:8px"><label class="lb" for="heatsel" style="margin:0">Player</label><select class="f" id="heatsel" data-a="heatsel">${played.map(e => `<option value="${e.p.id}" ${e.p.id === hsel ? 'selected' : ''}>${esc(e.p.n)} · ${ROLE_LABEL[e.role]} · ${e.rt.toFixed(1)}</option>`).join('')}</select></div><canvas id="heatcv" width="480" height="310" class="heatcv"></canvas>`
      : LM.ptab === 'rp' ? `<div class="rps">${LM.replays.map((r, i) => `<button class="btn" data-a="mrp" data-v="${i}">▶ ${esc(r.label)}</button>`).join('')}</div><p class="dim" style="margin-bottom:0">Replays play on the pitch above.</p>`
        : `<div class="xgwrap">${xgSvg(LM, kits)}</div>`;
    post = `<div class="box pad" style="margin-top:10px"><div class="row" style="justify-content:space-between"><h2 class="sect" style="margin:0">Full-time analysis</h2><div class="seg">${ptabs.map(([k, l]) => `<button class="${LM.ptab === k ? 'on' : ''}" data-a="mptab" data-v="${k}">${l}</button>`).join('')}</div></div><div style="margin-top:10px">${pbody}</div></div>`;
  }
  app().innerHTML = `<div class="start" style="max-width:1180px;padding-top:12px">
    <div class="band"><span>${COMP_NAME[M.comp]} · ${esc(typeof f.rnd === 'number' ? 'Matchweek ' + f.rnd : f.rnd || '')}</span><small>${esc(venueOf(f).name)} · ${meta.ko} · ${WX_TXT[meta.wx]} ${meta.temp}°C · Ref ${esc(meta.ref.n)}${M.agg[0] + M.agg[1] || f.l1 ? ` · aggregate ${dScore[0] + M.agg[0]}-${dScore[1] + M.agg[1]}` : ''}</small></div>
    <div class="score"><div class="tm">${badge(A.tid)}<span>${esc(A.name)}</span></div><div><div class="sc">${dScore[0]}-${dScore[1]}</div><div class="mn">${clock}${M.pens && !hide ? ` · pens ${M.pens[0]}-${M.pens[1]}` : ''}</div></div><div class="tm r"><span>${esc(B.name)}</span>${badge(B.tid)}</div>
      <div class="sub"><div>${scorers(0)} ${reds(0)}</div><div style="text-align:right">${scorers(1)} ${reds(1)}</div></div></div>
    ${momSvg(LM, kits, dScore)}
    <div class="ticker" aria-live="polite">${last ? `<span class="mono">${last.min}'</span> ${esc(last.text)}` : ''}</div>
    <div class="ctrl">
      ${done ? `<button class="go" data-a="mfinish">CONTINUE ▸</button>` : M.done ? '' : `<button class="btn pri" data-a="mrun">${LM.run ? '❚❚ Pause' : '▶ Play'}</button>`}
      ${M.done ? '' : `<div class="seg">${SPEEDS.map(([l], i) => `<button class="${LM.speed === i ? 'on' : ''}" data-a="mspeed" data-v="${i}">${l}</button>`).join('')}</div>
      <button class="btn ${LM.panel === 'subs' ? 'on' : ''}" data-a="mpanel" data-v="subs">Subs &amp; tactics</button><button class="btn" data-a="mskip">Skip to end</button>`}
      ${V ? `<div class="seg"><button class="${two ? 'on' : ''}" data-a="mview" data-v="2d">2D pitch</button><button class="${!two ? 'on' : ''}" data-a="mview" data-v="text">Text only</button></div>` : ''}
      ${two ? `<div class="seg"><button class="${V.camMode !== 'follow' ? 'on' : ''}" data-a="mcam" data-v="full">Full pitch</button><button class="${V.camMode === 'follow' ? 'on' : ''}" data-a="mcam" data-v="follow">Follow ball</button></div>
      <button class="btn ${LM.autoRp ? 'on' : ''}" data-a="mautorp" title="Show a slow-motion replay after every goal">Auto replay ${LM.autoRp ? 'on' : 'off'}</button>` : ''}
      ${V ? `<button class="btn ${SND.on ? 'on' : ''}" data-a="msnd">Sound ${SND.on ? 'on' : 'off'}</button>` : ''}
    </div>
    ${!M.done ? `<div class="shouts"><span class="dim" style="font-size:12.5px">TOUCHLINE${activeShout ? ` · <span class="grn">${esc(activeShout)} active</span>` : shoutCd ? ` · ready in ${shoutCd}'` : ''}</span>${SHOUTS.map(([k, l]) => `<button class="btn ${S.shout && S.shout.k === k ? 'on' : ''}" style="font-size:12.5px;padding:3px 9px" data-a="mshout" data-v="${k}" ${shoutCd ? 'disabled' : ''}>${l}</button>`).join('')}</div>` : ''}
    ${two && LM.replays.length && !done ? `<div class="rps"><span class="dim" style="font-size:12.5px">REPLAYS</span>${LM.replays.map((r, i) => `<button class="btn" style="font-size:12.5px;padding:3px 9px" data-a="mrp" data-v="${i}">▶ ${esc(r.label)}</button>`).join('')}</div>` : ''}
    ${panel}
    ${post}
    <div class="mgrid">
      <div style="min-width:0">${two ? '<div id="p2dwrap"></div>' : ''}<div class="log" style="${two ? 'height:190px;border-top:0' : ''}">${com.slice().reverse().map(c => `<div class="${c.k}"><span class="m">${c.min}'</span><span>${esc(c.text)}</span></div>`).join('')}</div></div>
      <div style="min-width:0"><div class="tabs" style="margin-bottom:8px">${rtabs.map(([k, l]) => `<button class="${LM.rtab === k ? 'on' : ''}" data-a="mrtab" data-v="${k}">${l}</button>`).join('')}</div>${rbody}</div>
    </div>
  </div>`;
  if (two) { const w = document.getElementById('p2dwrap'); if (w) w.appendChild(V.cv); }
  if (done && LM.ptab === 'heat') { const cv = document.getElementById('heatcv'); if (cv) drawHeat(cv, heatFor(LM, LM.heatSel)); }
}

// ---- pre-match card ----
function lineupSvg(f, kits) {
  let dots = '';
  for (let s = 0; s < 2; s++) {
    const tid = s ? f.a : f.h, t = T(tid);
    const form = t.lite ? '4-2-3-1' : t.tac.form; const slots = FORMS[form];
    const xi = t.lite ? [] : t.tac.xi.map(P);
    slots.forEach((sl, i) => {
      const depth = sl[2] / 100, across = sl[1] / 100;
      const x = s === 0 ? 8 + depth * .46 * 194 : 202 - depth * .46 * 194, y = s === 0 ? 8 + across * 120 : 128 - across * 120;
      const gk = sl[0] === 'GK'; const body = gk ? (s ? '#e9e04a' : '#4ad3ea') : kits[s].body;
      const no = xi[i] ? xi[i].no : (t.lite ? i + 1 : '');
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${body}" stroke="${gk ? '#111' : kits[s].trim}" stroke-width="1.4"/><text x="${x.toFixed(1)}" y="${(y + 2.2).toFixed(1)}" font-size="6" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" fill="${gk ? '#111' : readable(body)}">${no || ''}</text>`;
    });
  }
  return `<svg viewBox="0 0 210 136" class="lusvg" role="img" aria-label="Both starting line-ups"><rect width="210" height="136" fill="#1b6a37"/><g fill="none" stroke="rgba(255,255,255,.7)" stroke-width=".8"><rect x="2" y="2" width="206" height="132"/><line x1="105" y1="2" x2="105" y2="134"/><circle cx="105" cy="68" r="17"/><rect x="2" y="30" width="32" height="76"/><rect x="176" y="30" width="32" height="76"/></g>${dots}
    <text x="6" y="132" font-size="6.5" fill="#fff" font-weight="600">${esc(tName(f.h))} · ${T(f.h).lite ? '' : T(f.h).tac.form}</text><text x="204" y="132" font-size="6.5" fill="#fff" font-weight="600" text-anchor="end">${esc(tName(f.a))} · ${T(f.a).lite ? '' : T(f.a).tac.form}</text></svg>`;
}
function mdCard(f) {
  const v = venueOf(f), m = fxMeta(f), att = attendanceOf(f);
  const kits = kitFor({ sides: [{ tid: f.h }, { tid: f.a }] });
  const note = m.wx === 'rain' ? 'A wet surface makes goalkeepers more likely to spill shots.' : m.wx === 'snow' ? 'Snow slows the game down. Expect fewer chances.' : m.night ? 'Under the floodlights.' : '';
  return `<div class="mdcard"><div class="mdinfo">
    <div><label class="lb">Venue</label><div style="font-size:17px;font-weight:700">${esc(v.name)}</div><div class="dim">Capacity ${v.cap.toLocaleString('en-GB')} · expected crowd ${att.toLocaleString('en-GB')}</div></div>
    <div class="row" style="gap:18px;align-items:flex-start"><div><label class="lb">Kick-off</label><b class="mono">${m.ko}</b></div><div><label class="lb">Weather</label><b>${WX_TXT[m.wx]}</b> <span class="dim">${m.temp}°C</span></div><div><label class="lb">Referee</label><b>${esc(m.ref.n)}</b> <span class="dim">${refDesc(m.ref.s)}</span></div></div>
    ${note ? `<div class="dim" style="font-size:12.5px">${note}</div>` : ''}
    <div class="dim" style="font-size:12.5px">Stands: ${esc(v.stands.join(' · '))}</div>
  </div>${lineupSvg(f, kits)}</div>`;
}

// ---- actions ----
Object.assign(ACT, {
  kickoff: () => { const f = userFixtureOn(G.date); if (f) { SND.init(); startLive(f.id); } },
  mrun: () => { const LM = UI.match; LM.run = !LM.run; if (LM.run) { LM.panel = null; LM.alertTxt = null; LM.sel = null; SND.resume(); } else SND.setCrowd(.03); renderMatch(); schedule(); },
  mskip: () => {
    const LM = UI.match; LM.run = false; const M = LM.M; clearTimeout(LM.timer);
    while (!M.done) { stepMinute(M); M.ht = false; M.alert = null; momentum(LM); }
    stepOthers(LM, 200); for (const o of LM.others) if (o.M2 && !o.M2.done) simulateFull(o.M2);
    if (LM.vis) { const V = LM.vis; V.rp = null; V.live.plan = []; V.live.hold = false; V.live.rate = 1; V.pending = false; V.live.pendingRp = null; }
    SND.whistle(3, true); renderMatch();
  },
  mview: (v) => { UI.match.view = v; UI.viewPref = v; renderMatch(); },
  mcam: (v) => { UI.match.vis.camMode = v; UI.camPref = v; renderMatch(); },
  mautorp: () => { const LM = UI.match; LM.autoRp = !LM.autoRp; UI.autoRp = LM.autoRp; if (!LM.autoRp && LM.vis) LM.vis.live.pendingRp = null; renderMatch(); },
  msnd: () => { SND.on = !SND.on; SND.save(); if (SND.on) { SND.init(); SND.resume(); } else SND.setCrowd(0); renderMatch(); },
  mrp: (v) => { const LM = UI.match; if (LM.view !== '2d') { LM.view = '2d'; renderMatch(); } startReplay(LM, +v); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  mshout: (v) => doShout(UI.match, v),
  mrtab: (v) => { UI.match.rtab = v; renderMatch(); },
  mptab: (v) => { UI.match.ptab = v; renderMatch(); }
});
document.addEventListener('change', (ev) => { const el = ev.target; if (el.dataset && el.dataset.a === 'heatsel' && UI.match) { UI.match.heatSel = el.value; renderMatch(); } });
