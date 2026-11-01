// selection.js: squad selection helpers on the Tactics screen.
// Saved tactics (shape, roles, instructions, set-piece takers and lineup), best XI, squad rotation and a youth (U21) XI.
// Reserve and academy players may now start as well as sit on the bench. Loaded after laliga.js.

const SEL_MAX = 8; // saved tactics per club
const YOUTH_AGE = 21;

// ---------- picking ----------
function lastStarters(tid) {
  const fs = Object.values(G.fx).filter(f => f.r && f.rt && (f.h === tid || f.a === tid)).sort((a, b) => a.d < b.d ? 1 : -1);
  const out = []; // most recent first: sets of starters
  for (const f of fs.slice(0, 3)) { const side = f.rt[f.h === tid ? 0 : 1] || []; out.push(new Set(side.filter(x => !x[4]).map(x => x[0]))); }
  return out;
}
// fill the current formation slot by slot from a pool, scarce roles first (same order as autoPick)
function pickFrom(tid, pool, score, benchPool) {
  const t = T(tid); const slots = FORMS[t.tac.form];
  const prio = (r) => ({ GK: 0, FC: 1, DC: 2, DM: 3, AMC: 4, DL: 5, DR: 5, WBL: 5, WBR: 5, MC: 6, AML: 7, AMR: 7, ML: 8, MR: 8 }[r]);
  const order = slots.map((s, i) => i).sort((a, b) => prio(slots[a][0]) - prio(slots[b][0]));
  const used = new Set(); const xi = new Array(11).fill(null);
  for (const i of order) {
    const role = slots[i][0]; let best = null, bv = -1;
    for (const p of pool) {
      if (used.has(p.id) || (role === 'GK') !== (p.pos === 'GK')) continue;
      const v = score(p, role); if (v > bv) { bv = v; best = p; }
    }
    if (best) { xi[i] = best.id; used.add(best.id); }
  }
  t.tac.xi = xi;
  const bp = (benchPool || pool).filter(p => !used.has(p.id) && available(p)).sort((a, b) => b.ca - a.ca);
  const bench = []; const gk = bp.find(p => p.pos === 'GK'); if (gk) bench.push(gk.id);
  for (const p of bp) { if (bench.length >= 9) break; if (p.pos !== 'GK') bench.push(p.id); }
  t.tac.bench = bench;
  const holes = xi.filter(x => !x).length;
  validateLineup(tid); // fills any gaps from the first team and tops the bench up
  autoTakers(tid);
  return holes;
}
// rotation: start from the best XI, then rest up to four of the most tired or most used starters when a fresher
// squad player is close enough in quality for that slot (fringe players get a game, the side stays competitive)
const ROT_MAX = 4;
function pickRotation(tid) {
  autoPick(tid, true);
  const t = T(tid); const tac = t.tac; const slots = FORMS[tac.form];
  const recent = lastStarters(tid);
  const load = (p) => (100 - p.cond) + (recent[0] && recent[0].has(p.id) ? 6 : 0) + (recent[1] && recent[1].has(p.id) ? 4 : 0) + (recent[2] && recent[2].has(p.id) ? 2 : 0);
  const order = tac.xi.map((id, i) => [i, P(id)]).filter(([, p]) => p).sort((a, b) => load(b[1]) - load(a[1]));
  let changes = 0; const out = [];
  for (const [i, cur] of order) {
    if (changes >= ROT_MAX || load(cur) < 8) break;
    const role = slots[i][0]; const base = effSkill(cur, role, false);
    let best = null, bv = -1;
    for (const q of squad(tid)) {
      if (!available(q) || tac.xi.includes(q.id) || (role === 'GK') !== (q.pos === 'GK') || load(q) >= load(cur) - 4) continue;
      const v = effSkill(q, role, false); if (v >= base * (role === 'GK' ? .93 : .9) && v > bv) { bv = v; best = q; }
    }
    if (best) { tac.xi[i] = best.id; out.push(cur); changes++; }
  }
  tac.bench = tac.bench.filter(id => !tac.xi.includes(id));
  for (const p of out) if (!tac.bench.includes(p.id)) tac.bench.unshift(p.id);
  tac.bench = tac.bench.slice(0, 9);
  validateLineup(tid); autoTakers(tid);
  return changes;
}
function youthPool(tid) {
  const ys = (typeof youthIds === 'function' ? youthIds(tid) : []).map(P).filter(p => p && p.c === tid && p.sq);
  return squad(tid).concat(ys).filter(p => available(p) && p.age <= YOUTH_AGE);
}
function pickYouth(tid) {
  const pool = youthPool(tid);
  return { holes: pickFrom(tid, pool, (p, role) => effSkill(p, role) * (p.cond < 70 ? .85 : 1)), n: pool.length };
}

// ---------- saved tactics ----------
function tacSets(tid) { const t = T(tid || G.user); if (!t.sets) t.sets = []; return t.sets; }
function saveTacSet(name) {
  const t = userTeam(); const tac = t.tac; const sets = tacSets();
  name = String(name || '').trim().slice(0, 30) || `${tac.form} (${dShort(G.date)})`;
  const o = { n: name, form: tac.form, xi: tac.xi.slice(), bench: tac.bench.slice(), pr: (tac.pr || []).slice(), opt: {}, pk: tac.pk, fk: tac.fk, ck: tac.ck, d: G.date };
  for (const k in TAC_DEF) o.opt[k] = tacVal(tac, k);
  const i = sets.findIndex(s => s.n.toLowerCase() === name.toLowerCase());
  if (i >= 0) sets[i] = o; else { if (sets.length >= SEL_MAX) return `You can keep up to ${SEL_MAX} saved tactics. Delete one first.`; sets.push(o); }
  return null;
}
function loadTacSet(i, withLineup) {
  const s = tacSets()[i]; if (!s) return 'That saved tactic no longer exists.';
  const tac = userTeam().tac;
  tac.form = FORMS[s.form] ? s.form : tac.form; tac.pr = (s.pr || []).slice();
  for (const k in s.opt || {}) tac[k] = s.opt[k];
  if (!withLineup) { validateLineup(G.user); return null; }
  const ok = (id) => { const p = P(id); return p && p.c === G.user && available(p); };
  const missing = s.xi.filter(id => id && !ok(id)).map(id => P(id) ? surname(P(id).n) : 'a player who has left');
  tac.xi = s.xi.map(id => ok(id) ? id : null);
  tac.bench = s.bench.filter(id => ok(id) && !tac.xi.includes(id));
  if (ok(s.pk)) tac.pk = s.pk; if (ok(s.fk)) tac.fk = s.fk; if (ok(s.ck)) tac.ck = s.ck;
  validateLineup(G.user); autoTakers(G.user);
  return missing.length ? `Loaded. Not available: ${missing.join(', ')} (replaced by the best fit).` : null;
}

// ---------- reserve and academy players may start ----------
const _vlS = validateLineup;
validateLineup = function (tid) {
  const t = T(tid); if (!t || !t.tac) return _vlS(tid);
  const ys = new Set(youthIds(tid).filter(id => P(id) && P(id).c === tid && P(id).sq && available(P(id))));
  if (!ys.size) return _vlS(tid);
  // keep youth starters: put them into the squad list for the check, then restore
  const keep = t.tac.xi.filter(id => ys.has(id));
  if (!keep.length) return _vlS(tid);
  const sq = G.sq[tid]; G.sq[tid] = sq.concat(keep);
  try { return _vlS(tid); } finally { G.sq[tid] = sq; }
};
const _tpS = tacticsPick;
tacticsPick = function (pid) {
  const p = P(pid);
  if (p && p.sq && UI.tSel && UI.tSel.type === 'xi') {
    // same as the base pick, without the youth.js restriction
    const tac = userTeam().tac; const sel = UI.tSel; const cur = tac.xi[sel.i];
    if ((FORMS[tac.form][sel.i][0] === 'GK') !== (p.pos === 'GK')) return toast(p.pos === 'GK' ? 'Goalkeepers can only play in goal.' : 'Pick a goalkeeper for the GK slot.');
    const bIdx = tac.bench.indexOf(pid); if (bIdx >= 0) { if (cur) tac.bench[bIdx] = cur; else tac.bench.splice(bIdx, 1); }
    tac.xi[sel.i] = pid; UI.tSel = null; validateLineup(G.user); autoTakers(G.user); autosave(); return render();
  }
  return _tpS(pid);
};

// ---------- UI ----------
function selBox() {
  const sets = tacSets();
  return `<div class="box pad selbox" style="margin:10px 0">
    <div class="row" style="gap:6px;flex-wrap:wrap;align-items:center"><span class="lb" style="margin:0 6px 0 0">Pick team</span>
      <button class="btn" data-a="selpick" data-v="best" title="Strongest available XI; tired players are rested">Best XI</button>
      <button class="btn" data-a="selpick" data-v="rot" title="Fresh legs: players who started recently or are tired drop out, fringe players get a game">Rotate squad</button>
      <button class="btn" data-a="selpick" data-v="youth" title="Best XI and bench from players aged ${YOUTH_AGE} or under, including reserves and academy">Youth XI (U${YOUTH_AGE})</button></div>
    <div class="row" style="gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px"><span class="lb" style="margin:0 6px 0 0">Saved tactics</span>
      ${sets.length ? `<select class="f" id="selset" aria-label="Saved tactics">${sets.map((s, i) => `<option value="${i}" ${UI.selI === i ? 'selected' : ''}>${esc(s.n)} · ${esc(s.form)}</option>`).join('')}</select>
      <button class="btn" data-a="selload" data-v="1" title="Shape, roles, instructions, takers and the saved lineup">Load all</button><button class="btn" data-a="selload" data-v="0" title="Shape, roles and instructions; keeps the current players where they fit">Load tactics only</button><button class="btn warn" data-a="seldel">Delete</button>` : '<span class="dim" style="font-size:13px">None yet.</span>'}
      <span class="spacer"></span><input class="f" id="selname" maxlength="30" placeholder="Name, e.g. Cup side" style="width:170px" aria-label="Name for this tactic"><button class="btn pri" data-a="selsave">Save current</button></div>
  </div>`;
}
const _scrTacS = scrTactics;
scrTactics = function () {
  const h = _scrTacS();
  const btn = '<button class="btn" data-a="autopick">Auto-pick best XI</button>';
  const i = h.indexOf(btn); if (i < 0) return h;
  const j = h.indexOf('</div>', i);
  return h.slice(0, i) + h.slice(i + btn.length, j + 6) + selBox() + h.slice(j + 6);
};
const selIdx = () => { const el = $('#selset'); return el ? +el.value : -1; };
Object.assign(ACT, {
  selpick: (v) => {
    UI.tSel = null;
    if (v === 'best') { autoPick(G.user, true); toast('Best available XI selected.'); }
    else if (v === 'rot') { const n = pickRotation(G.user); toast(n ? `Rotated: ${n} change${n > 1 ? 's' : ''} from the best XI, tired or overused starters rested.` : 'No need to rotate: the first choices are fresh, or the alternatives are too far behind.'); }
    else { const r = pickYouth(G.user); toast(r.holes ? `Youth XI picked from ${r.n} players aged ${YOUTH_AGE} or under; ${r.holes} gap${r.holes > 1 ? 's' : ''} filled from the first team.` : `Youth XI picked from ${r.n} players aged ${YOUTH_AGE} or under.`); }
    autosave(); render();
  },
  selsave: () => { const n = $('#selname'); const e = saveTacSet(n ? n.value : ''); if (e) return toast(e); UI.selI = tacSets().length - 1; autosave(); toast('Tactic saved.'); render(); },
  selload: (v) => { const i = selIdx(); if (i < 0) return; UI.selI = i; UI.tSel = null; const m = loadTacSet(i, v === '1'); autosave(); toast(m || `Loaded "${tacSets()[i].n}".`); render(); },
  seldel: () => { const i = selIdx(); if (i < 0) return; const s = tacSets().splice(i, 1)[0]; UI.selI = null; autosave(); toast(`Deleted "${s.n}".`); render(); }
});
document.addEventListener('change', (ev) => { const el = ev.target; if (el && el.id === 'selset') UI.selI = +el.value; });
