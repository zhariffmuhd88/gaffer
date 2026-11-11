// exstaff.js: retired and retiring players can join the backroom staff (coach, assistant, scout, physio).
// Each one gets a non-playing profile: coaching ability by role, badges, specialities and the playing career behind it.
// Loaded after statue.js.

const EX_ROLES = ['coach', 'asst', 'scout', 'physio'];
const EX_POOL_N = 10;

// ---------- the non-playing profile (worked out from the player, so it never changes) ----------
function exNoise(p, k, span) { return ((hash(p.n + '|ex|' + k) % 1000) / 1000 - .5) * span; }
function exProfile(p) {
  const a = attrs(p); const caps = p.ic || 0; const apps = (p.car && p.car.a) || 0;
  const exp = clamp((p.age - 30) / 8, 0, 1) * 2 + Math.min(2, caps / 50) + Math.min(1.5, apps / 200);
  const mind = ((a.Det || 10) + (a.Tea || 10)) / 2; const read = ((a.Pos || 10) + (a.Cre || 10) + (a.Pas || 10)) / 3;
  const body = ((a.Sta || 10) + (a.Str || 10)) / 2;
  const ab = {
    coach: Math.round(clamp(3 + mind * .33 + read * .25 + (p.ca - 60) * .05 + exp + exNoise(p, 'c', 4), 4, 18)),
    asst: Math.round(clamp(3 + mind * .4 + read * .2 + (p.ca - 60) * .04 + exp + exNoise(p, 'a', 4), 4, 18)),
    scout: Math.round(clamp(3 + read * .38 + exp * 1.2 + (a.Fla || 10) * .08 + exNoise(p, 's', 4), 4, 18)),
    physio: Math.round(clamp(2 + body * .25 + (a.Det || 10) * .15 + exNoise(p, 'p', 5), 3, 14))
  };
  const best = EX_ROLES.slice().sort((x, y) => ab[y] - ab[x])[0];
  const grp = p.pos === 'GK' ? 'gk' : ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DC', 'DL', 'DR'].includes(p.pos) ? 'def' : ['DM', 'CM', 'AM', 'MC', 'DMC', 'AMC'].includes(p.pos) ? 'mid' : 'att';
  const spec = { gk: 'Goalkeeping and distribution', def: 'Defensive organisation and set-piece defending', mid: 'Passing patterns and pressing triggers', att: 'Finishing, movement and attacking runs' }[grp];
  const badge = ab.coach >= 15 ? 'Pro Licence' : ab.coach >= 11 ? 'A Licence' : ab.coach >= 8 ? 'B Licence' : 'Badges in progress';
  const phys = ab.physio >= 11 ? 'Sports therapy degree, studied part-time while playing' : ab.physio >= 8 ? 'Strength and conditioning certificate' : 'First-aid and rehab course';
  const traits = [];
  if ((a.Det || 0) >= 15) traits.push('Demanding perfectionist'); if ((a.Tea || 0) >= 15) traits.push("Players' favourite"); if ((a.Fla || 0) >= 15) traits.push('Free spirit with new ideas');
  if (caps >= 50) traits.push('Big-tournament experience'); if (apps >= 150) traits.push('Knows this game inside out'); if (!traits.length) traits.push('Quiet, studious type');
  const fame = Math.max(0, p.ca - 72) / 3 + Math.min(4, caps / 25);
  return { ab, best, spec, badge, phys, traits, scoutOn: NATS_REGION(p.nat), fame, wage: (r) => Math.round(2 + Math.pow(ab[r], 1.6) / 2 + fame) };
}
function NATS_REGION(nat) { try { const n = natRow(nat); return n ? n.name : nat; } catch (e) { return nat; } }

// ---------- who can be hired ----------
function exStatus(p) {
  if (p.stf) return { k: 'staff', t: `${STAFF_ROLES[p.stf.role]} at ${tName(p.stf.tid, false)}` };
  if (p.c === 'RETIRED') return p.gone && /at /.test(p.gone) ? { k: 'busy', t: p.gone } : { k: 'ret', t: `Retired${p.retY ? ' in ' + p.retY : ''}${p.lastC && T(p.lastC) ? ', last club ' + tName(p.lastC, false) : ''}` };
  if (p.c === 'FA') return { k: 'fa', t: 'Free agent, ready to retire' };
  if (p.c === G.user) return { k: 'own', t: `Your player (age ${p.age}), would retire to join the staff` };
  if (T(p.c) && !T(p.c).nat) return { k: 'club', t: `Retiring: final year at ${tName(p.c, false)}` };
  return null;
}
function exEligible(p) {
  if (!p || p.pseudo || p.leg || p.stf || p.sq) return false;
  if (p.c === 'RETIRED') return !(p.gone && /at /.test(p.gone)) && ((p.car && p.car.a) || p.ic || p.ca >= 70);
  if (p.c === 'FA') return p.age >= 33;
  if (p.c === G.user) return p.age >= 33 && !p.loan;
  const t = T(p.c); if (!t || t.nat || t.lite || !divOf(p.c)) return false;
  return p.age >= 34 && p.con <= G.year + 1;
}
function buildExPool() {
  const c = Object.values(G.players).filter(exEligible).map(p => [p, exProfile(p).fame + (p.c === G.user ? 6 : 0) + (p.c === 'RETIRED' ? 1 : 0) + p.ca / 20]);
  c.sort((a, b) => b[1] - a[1]);
  G.exPool = c.slice(0, EX_POOL_N).map(x => x[0].id);
}
function exPool() { if (!G.exPool) buildExPool(); G.exPool = G.exPool.filter(id => exEligible(P(id))); return G.exPool.map(P); }

// ---------- hiring ----------
function exFee(p) { if (!T(p.c) || p.c === G.user || p.c === 'RETIRED' || p.c === 'FA') return 0; return Math.round(calcValue(p) * .2 * 10) / 10; }
function hireEx(pid, role) {
  ensureStaff();
  const p = P(pid); if (!p || !exEligible(p) || !EX_ROLES.includes(role)) return 'He is no longer available.';
  const pr = exProfile(p); const t = userTeam(); const fee = exFee(p);
  if (fee && t.bal < fee) return `${tName(p.c, false)} want ${money(fee)} to release him early. You cannot afford that.`;
  const cur = G.staff[role]; const comp = cur ? Math.round(cur.wage * 26) / 1000 : 0;
  t.bal -= comp + fee; t.fin.out.other += comp + fee;
  if (cur && cur.pid && P(cur.pid)) { const q = P(cur.pid); delete q.stf; q.gone = 'Retired'; }
  const from = p.c; let how = '';
  if (from !== 'RETIRED') {
    if (G.sq[from]) G.sq[from] = G.sq[from].filter(x => x !== p.id);
    G.fa = (G.fa || []).filter(x => x !== p.id);
    for (const k of ['xi', 'bench']) if (T(from) && T(from).tac && T(from).tac[k]) T(from).tac[k] = T(from).tac[k].map(x => x === p.id ? null : x).filter((x, i) => k === 'xi' || x);
    p.lastC = T(from) ? from : p.lastC; p.retY = G.year + 1; p.c = 'RETIRED'; p.listed = false;
    how = from === G.user ? ` He hangs up his boots after ${p.car.a || 'many'} appearances in this save to start his new career.` : fee ? ` ${tName(from, false)} release him from his final year for ${money(fee)}.` : ' He confirms his retirement as a player.';
    if (from === G.user) try { validateLineup(G.user); } catch (e) { }
  }
  p.stf = { role, tid: G.user, from: G.date }; p.gone = `${STAFF_ROLES[role]} at ${t.name}`;
  G.staff[role] = { role, n: p.n, ab: pr.ab[role], age: p.age, wage: pr.wage(role), pid: p.id, ex: 1 };
  G.exPool = (G.exPool || []).filter(x => x !== p.id);
  news('Staff', `${p.n} joins ${t.name} as ${STAFF_ROLES[role]}.${how}${cur ? ` ${cur.n} leaves with ${money(comp)} compensation.` : ''}`, G.user);
  try { const fp = fanPost(G.user, R.pick([`${surname(p.n)} on the coaching staff?! Love to see it 🙌`, `Get a former pro in the dressing room. ${surname(p.n)} knows what it takes`, `${surname(p.n)} as ${STAFF_ROLES[role].toLowerCase()}… this could be the start of something`]), { u: 1 }); } catch (e) { }
  return `${p.n} joins as ${STAFF_ROLES[role]}.${how}`;
}
// a normal hire replacing an ex-player frees him again
const _hsEx = hireStaff;
hireStaff = function (idx) {
  const s = G.staffPool[idx]; const cur = s && G.staff[s.role];
  const r = _hsEx(idx);
  if (cur && cur.pid && G.staff[s.role] !== cur && P(cur.pid)) { delete P(cur.pid).stf; P(cur.pid).gone = 'Retired'; }
  return r;
};
const _rspEx = refreshStaffPool;
refreshStaffPool = function () { _rspEx(); try { if (G && G.players) buildExPool(); } catch (e) { console.error(e); } };

// remember when and where players retire; some well-known names take a staff job at their last club
const _dpEx = developPlayers;
developPlayers = function () {
  const before = {}; for (const id in G.players) { const p = G.players[id]; if (p && p.c !== 'RETIRED') before[id] = p.c; }
  _dpEx.apply(this, arguments);
  try {
    for (const id in before) {
      const p = G.players[id]; if (!p || p.c !== 'RETIRED') continue;
      p.retY = G.year + 1; if (T(before[id]) && !T(before[id]).nat) p.lastC = before[id];
      const last = p.lastC && T(p.lastC);
      if (last && p.lastC !== G.user && (p.ca >= 78 || (p.ic || 0) >= 40) && R.chance(.25)) {
        const role = R.pick(['coach', 'asst', 'coach', 'scout']);
        p.gone = `${STAFF_ROLES[role]} at ${last.name}`;
        if (p.car && p.car.a >= 30) news('Staff', `${p.n} retires and stays at ${last.name} as ${STAFF_ROLES[role].toLowerCase()}.`, p.lastC, true);
      }
    }
  } catch (e) { console.error(e); }
};
// staff and pool players are never pruned from the save
const _ppEx = prunePlayers;
prunePlayers = function () {
  const keep = []; for (const id in G.players) { const p = G.players[id]; if (p && p.c === 'RETIRED' && (p.stf || (G.exPool || []).includes(id) || p.nh)) keep.push([id, p]); }
  const n = _ppEx(); for (const [id, p] of keep) G.players[id] = p; return n;
};

// ---------- the non-playing profile modal ----------
function exStars(v) { return typeof roleStars === 'function' ? roleStars(v) : '★'.repeat(Math.round(v / 4)); }
function exProfileHtml(p) {
  const pr = exProfile(p); const st = exStatus(p) || { t: p.gone || 'Retired' };
  const hireable = exEligible(p) && exPool().includes(p); const fee = exFee(p);
  const clubs = [...new Set((p.exc || []).concat(p.lastC ? [p.lastC] : []).concat(T(p.c) && !T(p.c).nat ? [p.c] : []))].filter(x => T(x));
  const row = (r) => { const cur = G.staff && G.staff[r]; const up = cur && pr.ab[r] > cur.ab; return `<tr><td><b>${STAFF_ROLES[r]}</b>${r === pr.best ? ' <span class="tag" style="background:var(--yel);color:#111">best fit</span>' : ''}</td><td><span class="stars">${exStars(pr.ab[r])}</span> <span class="mono dim">${pr.ab[r]}/20</span>${up ? ' <span class="grn">▲</span>' : ''}</td><td class="n">${wageStr(pr.wage(r))}</td><td class="dim" style="font-size:12px">${cur ? `now: ${esc(cur.n)} ${cur.ab}/20` : ''}</td><td>${hireable ? `<button class="btn" data-a="exhire" data-v="${p.id}" data-k="${r}">Hire</button>` : ''}</td></tr>`; };
  return `<div class="band"><span>${esc(p.n)} · non-playing profile</span><button class="x" data-a="close" aria-label="Close">×</button></div>
  <div class="mc">
    <div class="row" style="gap:16px;align-items:flex-start;flex-wrap:wrap">
      <dl class="kv" style="flex:1;min-width:220px">
        <dt>Now</dt><dd><b>${esc(st.t)}</b></dd>
        <dt>Age / Nation</dt><dd>${p.age} · ${esc(p.nat)}</dd>
        <dt>Coaching badges</dt><dd>${esc(pr.badge)}</dd>
        <dt>Medical training</dt><dd>${esc(pr.phys)}</dd>
        <dt>Speciality</dt><dd>${esc(pr.spec)}</dd>
        <dt>Scouting</dt><dd>Best contacts in ${esc(pr.scoutOn)}</dd>
        <dt>Personality</dt><dd>${pr.traits.map(esc).join(' · ')}</dd>
      </dl>
    </div>
    <h2 class="sect">Ability by role</h2>
    <div class="tw"><table class="t"><thead><tr><th>Role</th><th>Ability</th><th class="n">Wage</th><th>Your current staff</th><th></th></tr></thead><tbody>${EX_ROLES.map(row).join('')}</tbody></table></div>
    ${hireable ? `<p class="dim" style="font-size:12.5px">${p.c === G.user ? 'Hiring him ends his playing career: he leaves the squad straight away.' : fee ? `He still has a contract at ${esc(tName(p.c, false))}; they want ${money(fee)} to let him retire early.` : p.c === 'RETIRED' ? 'Already retired: he can start straight away.' : 'He retires as a player and starts straight away.'} The person he replaces leaves with six months' wages.</p>` : p.stf ? '' : '<p class="dim" style="font-size:12.5px">Not looking for a staff job right now. The list of former players open to offers refreshes each summer.</p>'}
    <h2 class="sect">Playing career</h2>
    <dl class="kv">
      <dt>Position</dt><dd>${esc(POS_LABEL[p.pos] || p.pos)}</dd>
      <dt>Clubs (this save)</dt><dd>${clubs.length ? clubs.map(x => tLink(x, true)).join(', ') : '<span class="dim">Not recorded</span>'}</dd>
      <dt>Appearances (this save)</dt><dd>${(p.car && p.car.a) || 0} apps, ${(p.car && p.car.g) || 0} goals</dd>
      <dt>International</dt><dd>${p.ic ? `${p.ic} caps, ${p.ig || 0} goals` : '<span class="dim">Not recorded in this game</span>'}</dd>
      ${p.nh && p.nh.length ? `<dt>International honours</dt><dd>${p.nh.map(x => '🏆 ' + esc(x)).join('<br>')}</dd>` : ''}
      <dt>Playing rating at the end</dt><dd>${p.ca}</dd>
    </dl>
    <div class="row" style="margin-top:12px"><button class="btn" data-a="player" data-v="${p.id}">Player card</button></div>
  </div>`;
}
function exModal(pid) { const p = P(pid); if (!p) return; UI.modal = exProfileHtml(p); render(); }
Object.assign(ACT, {
  expro: (v) => exModal(v),
  exhire: (v, el) => { const role = el && el.dataset ? el.dataset.k : null; const m = hireEx(v, role); toast(m); autosave(); if (UI.modal) exModal(v); else render(); }
});

// player card: retired or veteran players get a link to the non-playing profile
const _peEx = playerExtra;
playerExtra = function (p) {
  const h = _peEx(p);
  try {
    if (!p || p.leg || p.pseudo) return h;
    const show = p.stf || p.c === 'RETIRED' || exEligible(p);
    if (!show) return h;
    const pr = exProfile(p); const st = exStatus(p);
    return h + `<div class="box pad" style="margin-top:8px;border-color:var(--yel)"><label class="lb">After playing</label>${st ? `<div>${esc(st.t)}</div>` : ''}<div class="dim" style="font-size:12.5px">Best fit: ${STAFF_ROLES[pr.best]} (${pr.ab[pr.best]}/20) · ${esc(pr.badge)}</div><button class="btn" style="margin-top:6px" data-a="expro" data-v="${p.id}">Non-playing profile</button></div>`;
  } catch (e) { console.error(e); return h; }
};

// staff screen: ex-players on the staff link to their profile; a list of former players open to offers
const _ssEx = scrStaff;
scrStaff = function () {
  let h = _ssEx();
  try {
    for (const r in G.staff) { const s = G.staff[r]; if (s && s.pid && P(s.pid)) h = h.replace(`<td>${esc(s.n)}</td>`, `<td><button class="lnk" data-a="expro" data-v="${s.pid}" style="background:none;border:0;padding:0;color:var(--text);text-decoration:underline">${esc(s.n)}</button> <span class="tag" title="Former player">ex-pro</span></td>`); }
    const pool = exPool();
    const rows = pool.map(p => { const pr = exProfile(p); const st = exStatus(p) || { t: '' }; return `<tr class="${p.c === G.user ? 'me' : ''}"><td><button class="lnk" data-a="expro" data-v="${p.id}" style="background:none;border:0;padding:0;color:var(--text);text-decoration:underline;text-align:left">${esc(p.n)}</button></td><td class="n">${p.age}</td><td class="dim" style="white-space:normal;min-width:160px;font-size:12.5px">${esc(st.t)}</td>${EX_ROLES.map(r => `<td class="n mono ${r === pr.best ? 'yel' : ''}">${pr.ab[r]}${G.staff[r] && pr.ab[r] > G.staff[r].ab ? '<span class="grn">▲</span>' : ''}</td>`).join('')}<td><button class="btn" data-a="expro" data-v="${p.id}">Profile</button></td></tr>`; }).join('');
    h += `<h2 class="sect">Former players open to a staff job</h2><p class="dim" style="margin-top:0">Retired players, and veterans in the last year of their contract, who would start a new career as Coach, Assistant, Scout or Physio. Open a profile to compare and hire. ▲ = better than your current staff member.</p>
    <div class="tw"><table class="t"><thead><tr><th>Name</th><th class="n">Age</th><th>Status</th><th class="n">Coach</th><th class="n">Asst</th><th class="n">Scout</th><th class="n">Physio</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="8" class="dim">Nobody at the moment. The list refreshes each summer.</td></tr>'}</tbody></table></div>`;
  } catch (e) { console.error(e); }
  return h;
};
