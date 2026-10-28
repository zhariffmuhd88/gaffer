// ===== EXTENSIONS: roles, tactics, captaincy, staff, training, scouting, loans, theme =====

// ---- player roles ----
// u: change to [def, mid, att] contribution; sh/as/hd: shot, assist, header-shot weight multipliers; cr: adds crosses; foul: foul weight
const PR = {
  GK: { n: 'Goalkeeper', s: ['GK'], k: ['Ref', 'Han', 'Aer'], u: [0, 0, 0], d: 'Stays on his line and concentrates on shot-stopping.' },
  SK: { n: 'Sweeper Keeper', s: ['GK'], k: ['Kic', 'OvO', 'Pac'], u: [0, .1, 0], d: 'Starts attacks with his feet and sweeps behind a high line.' },
  CD: { n: 'Central Defender', s: ['DC'], k: ['Tck', 'Mar', 'Hea', 'Pos'], u: [.05, 0, 0], d: 'Wins the ball and keeps things simple.' },
  BPD: { n: 'Ball-Playing Defender', s: ['DC'], k: ['Pas', 'Pos', 'Tck'], u: [-.05, .2, .03], as: 1.5, d: 'Carries and passes the ball out from the back.' },
  NCB: { n: 'No-Nonsense Defender', s: ['DC'], k: ['Hea', 'Str', 'Tck'], u: [.1, -.08, 0], d: 'Clears his lines and dominates in the air.' },
  FB: { n: 'Full-Back', s: ['DL', 'DR'], k: ['Tck', 'Mar', 'Pos'], u: [.08, 0, -.05], d: 'Defends first and supports when safe.' },
  WB: { n: 'Wing-Back', s: ['DL', 'DR', 'WBL', 'WBR'], k: ['Crs', 'Pac', 'Sta', 'Dri'], u: [-.1, .05, .2], as: 1.4, cr: 1, d: 'Bombs forward to provide width and crosses.' },
  IFB: { n: 'Inverted Full-Back', s: ['DL', 'DR'], k: ['Pas', 'Pos', 'Tck'], u: [0, .25, -.05], d: 'Steps into midfield in possession.' },
  CWB: { n: 'Complete Wing-Back', s: ['WBL', 'WBR'], k: ['Crs', 'Dri', 'Sta', 'Pac', 'Pas'], u: [-.15, .1, .3], as: 1.6, cr: 1, d: 'Plays almost as a winger, very attacking.' },
  ANC: { n: 'Anchor', s: ['DM'], k: ['Pos', 'Mar', 'Tck'], u: [.15, -.05, -.05], d: 'Sits in front of the defence and screens.' },
  DLP: { n: 'Deep-Lying Playmaker', s: ['DM', 'MC'], k: ['Pas', 'Cre', 'Tea'], u: [-.05, .2, .05], as: 1.5, d: 'Dictates play from deep.' },
  BWM: { n: 'Ball-Winning Midfielder', s: ['DM', 'MC'], k: ['Tck', 'Sta', 'Str', 'Det'], u: [.15, .05, -.05], foul: 1.4, d: 'Hunts the ball aggressively. Picks up cards.' },
  CM: { n: 'Central Midfielder', s: ['MC'], k: ['Pas', 'Tck', 'Tea'], u: [0, 0, 0], d: 'Balanced role in all phases.' },
  BBM: { n: 'Box-to-Box Midfielder', s: ['MC'], k: ['Sta', 'Pas', 'Tck', 'Fin'], u: [.05, .05, .1], sh: 1.4, d: 'Covers every blade of grass and arrives in the box.' },
  MEZ: { n: 'Mezzala', s: ['MC'], k: ['Dri', 'Pas', 'Cre', 'Fin'], u: [-.08, 0, .25], sh: 1.4, as: 1.2, d: 'Drifts into the half-spaces to attack.' },
  WM: { n: 'Wide Midfielder', s: ['ML', 'MR'], k: ['Sta', 'Crs', 'Tea', 'Tck'], u: [.1, .05, -.05], cr: .5, d: 'Works up and down the flank, helps the full-back.' },
  W: { n: 'Winger', s: ['ML', 'MR', 'AML', 'AMR'], k: ['Pac', 'Dri', 'Crs'], u: [-.05, 0, .12], as: 1.3, cr: 1, d: 'Hugs the touchline, beats his man and crosses.' },
  WP: { n: 'Wide Playmaker', s: ['ML', 'MR'], k: ['Pas', 'Cre', 'Dri'], u: [0, .2, .05], as: 1.5, d: 'Comes inside to create.' },
  IF: { n: 'Inside Forward', s: ['AML', 'AMR'], k: ['Fin', 'Dri', 'Pac', 'Lon'], u: [-.05, 0, .15], sh: 1.6, as: .8, d: 'Cuts inside onto his stronger foot to shoot.' },
  IW: { n: 'Inverted Winger', s: ['AML', 'AMR', 'ML', 'MR'], k: ['Dri', 'Pas', 'Cre', 'Lon'], u: [0, .12, .08], as: 1.3, sh: 1.1, d: 'Comes inside to combine and create.' },
  AP: { n: 'Advanced Playmaker', s: ['AMC'], k: ['Pas', 'Cre', 'Fla'], u: [0, .15, .05], as: 1.6, d: 'The creative hub between the lines.' },
  T10: { n: 'Number 10', s: ['AMC'], k: ['Cre', 'Dri', 'Fla', 'Lon'], u: [-.1, .05, .15], sh: 1.2, as: 1.3, d: 'Free role: creates and scores.' },
  SS: { n: 'Shadow Striker', s: ['AMC'], k: ['Fin', 'Dri', 'Pac', 'Lon'], u: [-.05, -.1, .2], sh: 1.7, as: .8, d: 'Runs beyond the striker into the box.' },
  AF: { n: 'Advanced Forward', s: ['FC'], k: ['Fin', 'Pac', 'Dri'], u: [-.05, 0, .1], sh: 1.2, d: 'Plays on the shoulder of the last defender.' },
  TM: { n: 'Target Man', s: ['FC'], k: ['Hea', 'Str', 'Fin'], u: [0, .05, .05], hd: 2.2, as: 1.2, sh: .9, d: 'Holds the ball up and attacks crosses.' },
  POA: { n: 'Poacher', s: ['FC'], k: ['Fin', 'Pac', 'Det'], u: [0, -.1, .15], sh: 1.6, as: .6, d: 'Lives in the box and finishes chances.' },
  F9: { n: 'False Nine', s: ['FC'], k: ['Pas', 'Cre', 'Dri'], u: [0, .2, 0], sh: .8, as: 1.7, d: 'Drops deep to link play and drag defenders out.' },
  PF: { n: 'Pressing Forward', s: ['FC'], k: ['Sta', 'Det', 'Tck', 'Fin'], u: [.05, .08, 0], d: 'Leads the press from the front.' }
};
const DEF_PR = { GK: 'GK', DC: 'CD', DL: 'FB', DR: 'FB', WBL: 'WB', WBR: 'WB', DM: 'ANC', MC: 'CM', ML: 'W', MR: 'W', AMC: 'AP', AML: 'IF', AMR: 'IF', FC: 'AF' };
function rolesFor(slot) { return Object.keys(PR).filter(k => PR[k].s.includes(slot)); }
function prOf(code, slot) { return PR[code] && PR[code].s.includes(slot) ? code : DEF_PR[slot]; }
function roleFit(p, code) { const a = attrs(p); const k = PR[code].k; return k.reduce((s, x) => s + (a[x] || 1), 0) / k.length; } // 1-20
function slotPR(t, i) { const slot = FORMS[t.tac.form][i][0]; return prOf(t.tac.pr && t.tac.pr[i], slot); }

// ---- tactical defaults ----
const TAC_DEF = { ment: 3, press: 2, tempo: 2, width: 2, pass: 2, line: 2, tackle: 2, trap: 1, counter: 1, waste: 1, focus: 2 };
function tacVal(tac, k) { return (tac && tac[k]) || TAC_DEF[k]; }

// ---- leadership & captaincy ----
const REAL_CAPT = { ARS: 'Martin Odegaard', AVL: 'John McGinn', BOU: 'Adam Smith', BRE: 'Nathan Collins', BHA: 'Lewis Dunk', CHE: 'Reece James', COV: 'Matt Grimes', CRY: 'Dean Henderson', EVE: 'James Tarkowski', FUL: 'Tom Cairney', HUL: 'Lewie Coyle', IPS: "Dara O'Shea", LEE: 'Ethan Ampadu', LIV: 'Virgil van Dijk', MCI: 'Ruben Dias', MUN: 'Bruno Fernandes', NEW: 'Dan Burn', NFO: 'Ryan Yates', SUN: 'Granit Xhaka', TOT: 'Micky van de Ven' };
function lead(p) {
  if (p.pseudo) return 10;
  const a = attrs(p);
  const n = ((hash(p.n + '|Lea') % 1000) / 1000 - 0.5) * 5;
  return clamp(Math.round(a.Det * 0.45 + a.Tea * 0.25 + (p.age - 18) * 0.32 + n + (p.lb || 0)), 1, 20);
}
function bestLeaders(tid) { return squad(tid).slice().sort((a, b) => lead(b) - lead(a)); }
function ensureCaptains(tid) {
  const t = T(tid); if (!t || t.lite) return;
  const sq = squad(tid);
  if (!t.capt || !sq.some(p => p.id === t.capt)) {
    const cn = REAL_CAPT[tid] || t.captN; const real = cn && sq.find(p => p.n === cn);
    if (real) { real.lb = Math.max(real.lb || 0, 4); t.capt = real.id; }
    else t.capt = (bestLeaders(tid)[0] || {}).id;
  }
  if (!t.vice || t.vice === t.capt || !sq.some(p => p.id === t.vice)) t.vice = (bestLeaders(tid).find(p => p.id !== t.capt) || {}).id;
}
function captainProblem() {
  const t = userTeam(); const c = P(t.capt); if (!c) return null;
  const best = bestLeaders(G.user).filter(p => p.age > 19);
  const top = best[0];
  const issues = [];
  if (top && lead(top) - lead(c) >= 5) issues.push(`${surname(top.n)} is a far more natural leader than ${surname(c.n)}`);
  const r = startRatio(c); if (r != null && teamGames() - (c.mi || 0) >= 5 && r < .45) issues.push(`${surname(c.n)} rarely starts, so the armband carries little weight`);
  if (hap(c) < 35) issues.push(`${surname(c.n)} is unhappy, which spreads through the dressing room`);
  return issues.length ? issues : null;
}
function appointCaptain(kind, pid) {
  const t = userTeam(); const old = kind === 'capt' ? t.capt : t.vice; if (old === pid) return null;
  const p = P(pid); const out = [];
  if (kind === 'capt') {
    if (old && P(old) && P(old).c === G.user) { setHap(P(old), -12); out.push(`${P(old).n} is disappointed to lose the armband.`); }
    if (t.vice === pid) t.vice = old;
    t.capt = pid; setHap(p, 8);
    const top = bestLeaders(G.user).filter(q => q.age > 19)[0];
    if (top && top.id !== pid && lead(top) - lead(p) >= 5) { for (const q of squad(G.user)) q.mor = clamp(q.mor - 4, 5, 100); setHap(top, -6); out.push(`Several senior players question the decision. They see ${top.n} as the natural leader.`); }
    else { for (const q of squad(G.user)) q.mor = clamp(q.mor + 2, 5, 100); out.push(`The squad approves of ${p.n} as captain.`); }
  } else {
    if (old && P(old) && P(old).c === G.user) setHap(P(old), -5);
    if (t.capt === pid) return 'He is already the captain.';
    t.vice = pid; setHap(p, 4); out.push(`${p.n} is the new vice-captain.`);
  }
  return out.join(' ');
}

// ---- staff ----
const STAFF_ROLES = { dof: 'Director of Football', asst: 'Assistant Manager', coach: 'First-Team Coach', scout: 'Chief Scout', physio: 'Head Physio' };
const STAFF_FX = {
  dof: 'Negotiates transfers: lowers asking prices and wage demands, recommends targets.',
  asst: 'Prepares opposition reports and strengthens your team talks.',
  coach: 'Runs training: speeds up player development and sharpens training focus.',
  scout: 'Judges potential more accurately and finds prospects on scouting trips.',
  physio: 'Reduces injuries in matches and speeds up recovery.'
};
function mkStaff(role, ab) { ab = clamp(Math.round(ab), 3, 20); return { role, n: genName(), ab, age: R.i(34, 64), wage: Math.round(2 + Math.pow(ab, 1.6) / 2) }; }
function ensureStaff() {
  if (!G.staff) { const base = 7 + (userTeam().rep - 60) / 3.5; G.staff = {}; for (const r in STAFF_ROLES) G.staff[r] = mkStaff(r, base + R.i(-3, 3)); }
  if (!G.staffPool || !G.staffPool.length) refreshStaffPool();
}
function refreshStaffPool() { G.staffPool = []; for (const r in STAFF_ROLES) for (let i = 0; i < 4; i++) G.staffPool.push(mkStaff(r, R.i(5, 19))); }
function staffAb(r) { return G.staff && G.staff[r] ? G.staff[r].ab : 10; }
function staffWages() { return G.staff ? Object.values(G.staff).reduce((s, x) => s + (x ? x.wage : 0), 0) : 0; }
function hireStaff(idx) {
  const s = G.staffPool[idx]; if (!s) return 'That person is no longer available.';
  const cur = G.staff[s.role]; const comp = cur ? Math.round(cur.wage * 26) / 1000 : 0;
  const t = userTeam(); t.bal -= comp; t.fin.out.other += comp;
  G.staff[s.role] = s; G.staffPool.splice(idx, 1);
  return `${s.n} joins as ${STAFF_ROLES[s.role]}.${cur ? ` ${cur.n} leaves with ${money(comp)} compensation.` : ''}`;
}
function dofFee() { return 1.06 - staffAb('dof') * 0.006; }   // 0.94 - 1.04
function dofWage() { return 1.05 - staffAb('dof') * 0.004; }
function physioInj() { return 1.25 - staffAb('physio') * 0.022; }
function asstMult() { return 0.75 + staffAb('asst') / 40; }

// ---- training ----
const TRAIN_TEAM = { bal: 'Balanced', fit: 'Fitness', att: 'Attacking', def: 'Defending', set: 'Set pieces', light: 'Light / recovery' };
const TRAIN_TEAM_D = { bal: 'No particular emphasis.', fit: 'Players recover condition faster, slightly more knocks in training.', att: 'Sharper in the final third, a little looser at the back.', def: 'Better organised defensively, a little less threat going forward.', set: 'More dangerous from corners and free kicks.', light: 'Fastest recovery, fewer injuries, a little less sharp.' };
const TRAIN_IND = { '': 'None', fin: 'Finishing', cre: 'Creativity', def: 'Defending', phy: 'Physical', aer: 'Aerial', gk: 'Goalkeeping', lea: 'Leadership' };
const TRAIN_ATTRS = { fin: ['Fin', 'Lon', 'Fla'], cre: ['Pas', 'Cre', 'Dri'], def: ['Tck', 'Mar', 'Pos'], phy: ['Pac', 'Sta', 'Str'], aer: ['Hea', 'Str'], gk: ['Han', 'Ref', 'OvO'], lea: [] };
function trainTeam() { return G.train || 'bal'; }
function monthlyTraining() {
  const cab = staffAb('coach');
  for (const p of squad(G.user)) {
    if (!p.tf || p.inj > 0) continue;
    if (p.age > 29 && p.tf !== 'lea') continue;
    const ch = (cab / 20) * 0.55 * (p.age <= 21 ? 1.3 : p.age <= 25 ? 1 : .6);
    if (!R.chance(ch)) continue;
    if (p.tf === 'lea') { p.lb = Math.min(4, (p.lb || 0) + 1); continue; }
    const k = R.pick(TRAIN_ATTRS[p.tf]); p.ab = p.ab || {};
    if ((p.ab[k] || 0) >= 4) continue;
    p.ab[k] = (p.ab[k] || 0) + 1; p.abv = (p.abv || 0) + 1;
    if (p.age <= 23 && p.ca < p.pa && R.chance(.15)) p.ca++;
    news('Training', `${p.n} has improved his ${ATTR_NAMES[k].toLowerCase()} in training.`, G.user);
  }
}

// ---- scouting ----
const REGIONS = {
  sa: { n: 'South America', nat: ['BRA', 'ARG', 'URU', 'COL', 'ECU', 'PAR'], f: ['Gabriel', 'Matheus', 'Thiago', 'Lautaro', 'Facundo', 'Santiago', 'Joaquin', 'Kevin', 'Luis', 'Rodrigo', 'Vitor', 'Enzo'], l: ['Silva', 'Souza', 'Pereira', 'Gomez', 'Fernandez', 'Acosta', 'Rojas', 'Medina', 'Benitez', 'Cardoso', 'Ribeiro', 'Vargas'], where: 'a club in South America' },
  af: { n: 'West Africa', nat: ['NGA', 'GHA', 'CIV', 'SEN', 'CMR', 'MLI'], f: ['Ibrahim', 'Moussa', 'Kwame', 'Samuel', 'Emmanuel', 'Ousmane', 'Victor', 'Abdul', 'Kofi', 'Cheikh'], l: ['Diallo', 'Mensah', 'Traore', 'Okafor', 'Ndiaye', 'Kone', 'Boateng', 'Sarr', 'Adeyemi', 'Camara'], where: 'an academy in West Africa' },
  sc: { n: 'Scandinavia', nat: ['NOR', 'SWE', 'DEN'], f: ['Erik', 'Oskar', 'Magnus', 'Emil', 'Jonas', 'Viktor', 'Mathias', 'Elias'], l: ['Hansen', 'Johansson', 'Nielsen', 'Larsen', 'Berg', 'Lindqvist', 'Andersen', 'Dahl'], where: 'a club in Scandinavia' },
  ib: { n: 'Spain & Portugal', nat: ['ESP', 'POR'], f: ['Pablo', 'Hugo', 'Diego', 'Joao', 'Rui', 'Alvaro', 'Nuno', 'Iker'], l: ['Garcia', 'Martinez', 'Costa', 'Santos', 'Lopez', 'Moreno', 'Ferreira', 'Navarro'], where: 'a club in Iberia' },
  ee: { n: 'Eastern Europe', nat: ['CRO', 'SRB', 'POL', 'CZE', 'UKR'], f: ['Luka', 'Marko', 'Jakub', 'Filip', 'Nikola', 'Mateusz', 'Andriy', 'Petar'], l: ['Novak', 'Kovac', 'Petrovic', 'Wisniewski', 'Horvat', 'Dvorak', 'Shevchuk', 'Jovic'], where: 'a club in Eastern Europe' },
  uk: { n: 'UK & Ireland lower leagues', nat: ['ENG', 'SCO', 'WAL', 'IRL', 'NIR'], f: FIRST.slice(0, 26), l: LAST.slice(0, 32), where: 'an EFL club' }
};
function startScouting(r) {
  if (G.scoutJob) return 'Your scout is already on an assignment.';
  const days = Math.round(36 - staffAb('scout') * 1.1);
  G.scoutJob = { r, done: addDays(G.date, days) };
  return `${G.staff.scout.n} heads off to scout ${REGIONS[r].n}. Report due ${dNice(G.scoutJob.done, false)}.`;
}
function finishScouting() {
  const job = G.scoutJob; if (!job || G.date < job.done) return;
  G.scoutJob = null;
  const reg = REGIONS[job.r]; const ab = staffAb('scout'); const out = [];
  const n = 3 + (ab >= 15 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const age = R.i(16, 21); const pos = R.pick(['GK', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'AM', 'LW', 'RW', 'ST', 'ST']);
    const ca = clamp(Math.round(52 + (age - 16) * 3 + R.gauss() * 5 + ab * .3), 45, 76);
    const pa = clamp(ca + R.i(8, 20) + Math.round(ab * .6), 60, 94);
    const p = mkPlayer({ n: R.pick(reg.f) + ' ' + R.pick(reg.l), c: 'ABROAD', pos, age, nat: R.pick(reg.nat), ca, pa, seed: R.i(1, 999) });
    p.gone = reg.where; p.con = G.year + 2; p.wage = calcWageDemand(p, 70); p.scouted = true; p.no = 0;
    G.players[p.id] = p; out.push(p.id);
  }
  G.prospects = (G.prospects || []).concat(out).slice(-24);
  msg('Scouting report', `${G.staff.scout.n} is back from ${reg.n} with ${n} players worth a look. Open Transfers › Scouting.`);
}
function potEstimate(p) {
  const ab = staffAb('scout');
  const noise = ((hash(p.id + '|pa|' + (G.staff && G.staff.scout ? G.staff.scout.n : '')) % 1000) / 1000 - 0.5) * (22 - ab) * 1.3;
  return clamp(Math.round(Math.max(p.ca, p.pa + noise)), p.ca, 99);
}
function potStars(p) { const e = potEstimate(p); const v = clamp((e - 55) / 7.5, 0, 5); const full = Math.floor(v), half = v - full >= .5; return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0)); }
function signProspect(pid) {
  const p = P(pid); const fee = Math.round(calcValue(p) * 0.8 * 10) / 10; const u = userTeam();
  if (!G.window) return { ok: false, msg: 'You can only sign players while a window is open.' };
  if (fee > u.tb) return { ok: false, msg: `His club wants ${money(fee)}, more than your budget.` };
  const w = Math.round(wageFor(p, G.user) * 0.8);
  if (wageBill(G.user) + w > u.wb + .5) return { ok: false, msg: 'Not enough room in the wage budget.' };
  const where = p.gone || 'abroad';
  completeTransfer(p, G.user, fee, w, 4); p.gone = null;
  G.prospects = G.prospects.filter(x => x !== pid);
  return { ok: true, msg: `${p.n} signs from ${where} for ${money(fee)}.` };
}

// ---- loans ----
function onLoan(p) { return !!p.loan; }
function loanInRequest(pid, share) {
  const p = P(pid); const u = userTeam();
  if (!G.window) return { ok: false, msg: 'Loans can only be arranged while a window is open.' };
  if (p.loan) return { ok: false, msg: 'He is already on loan.' };
  const imp = importance(p);
  if (imp === 'key' || (imp === 'first' && p.age > 21)) return { ok: false, msg: `${tName(p.c)} see ${surname(p.n)} as a first-team player and will not loan him out.` };
  if (playerInterest(p, G.user) === 'no') return { ok: false, msg: `${p.n} does not want to join ${u.short}.` };
  const need = imp === 'backup' ? 50 : 75;
  if (share < need) return { ok: false, msg: `${tName(p.c)} want you to pay at least ${need}% of his wages.` };
  const w = p.wage * share / 100;
  if (wageBill(G.user) + w > u.wb + .5) return { ok: false, msg: 'His wages would take you over the wage budget.' };
  const from = p.c;
  G.sq[from] = G.sq[from].filter(x => x !== p.id); const ft = T(from).tac; ft.xi = ft.xi.map(x => x === p.id ? null : x); ft.bench = ft.bench.filter(x => x !== p.id);
  p.loan = { from, ws: share / 100 }; p.c = G.user; G.sq[G.user].push(p.id); p.listed = false;
  const used = new Set(squad(G.user).filter(q => q !== p).map(q => q.no)); if (!p.no || used.has(p.no)) { let n = 2; while (used.has(n)) n++; p.no = n; }
  autoPick(from);
  news('Transfer', `${p.n} joins ${u.short} on loan from ${tName(from)} until the end of the season.`, G.user, true);
  return { ok: true, msg: `${p.n} joins on loan. You pay ${share}% of his ${wageStr(p.wage)}.` };
}
function loanOut(pid, dest) {
  const p = P(pid); const u = userTeam();
  if (!G.window) return { ok: false, msg: 'Loans can only be arranged while a window is open.' };
  if (p.loan) return { ok: false, msg: 'He is a loan player himself.' };
  let to;
  if (dest === 'pl') { const c = G.pl.filter(t => t !== G.user && T(t).rep - 14 <= p.ca && T(t).rep < u.rep + 5); if (!c.length) return { ok: false, msg: 'No Premier League club wants him on loan.' }; to = R.pick(c); }
  else { const c = divTeams('CH').filter(t => t !== G.user && T(t).rep - 16 <= p.ca); to = c.length ? R.pick(c) : R.pick(G.l1 && G.l1.length ? G.l1 : G.lowerTeams); }
  G.sq[G.user] = G.sq[G.user].filter(x => x !== p.id); const tac = u.tac; tac.xi = tac.xi.map(x => x === p.id ? null : x); tac.bench = tac.bench.filter(x => x !== p.id);
  p.loan = { from: G.user, out: true }; p.c = to; p.listed = false; p.prom = null;
  if (!T(to).lite) { G.sq[to].push(p.id); autoPick(to); }
  setHap(p, p.age <= 23 ? 10 : 2);
  news('Transfer', `${p.n} joins ${tName(to)} on loan until the end of the season.`, G.user);
  return { ok: true, msg: `${p.n} goes on loan to ${tName(to)}.` };
}
function loanedOut() { return Object.values(G.players).filter(p => p.loan && p.loan.out && p.loan.from === G.user); }
function returnLoans() {
  for (const p of Object.values(G.players)) {
    if (!p.loan) continue;
    const L = p.loan; p.loan = null;
    if (G.sq[p.c]) G.sq[p.c] = G.sq[p.c].filter(x => x !== p.id);
    if (L.out) {
      if (T(p.c) && T(p.c).lite && p.age <= 23) { p.ca = Math.min(p.pa, p.ca + R.i(0, 2)); } // regular football at loan club
      p.c = L.from; if (G.sq[L.from]) G.sq[L.from].push(p.id);
      if (L.from === G.user) news('Loan', `${p.n} returns from his loan spell.`, G.user);
    } else {
      p.c = L.from;
      if (G.sq[L.from] && !T(L.from).lite) G.sq[L.from].push(p.id);
      else if (T(L.from) && T(L.from).relSquad) { p.c = 'REL_' + L.from; T(L.from).relSquad.push(p.id); }
      else { p.c = 'FA'; G.fa.push(p.id); }
    }
  }
}

// ---- swap deals ----
function swapValue(sp, toTid) { const t = T(toTid); const need = squad(toTid).filter(q => POS_GROUP[q.pos] === POS_GROUP[sp.pos] && q.ca >= sp.ca).length < 3; return calcValue(sp) * (need ? .95 : .75) * (sp.ca >= t.rep - 8 ? 1 : .6); }

// ---- assistant report ----
function assistantReport(f) {
  const opp = f.h === G.user ? f.a : f.h; const ot = T(opp);
  const us = mkSide(G.user, f.h === G.user), them = mkSide(opp, f.a === G.user); units(us); units(them);
  const ab = staffAb('asst'); const wrong = R.chance((20 - ab) / 45);
  const lines = [];
  const r = (a, b) => a / b;
  const attVsDef = r(them.u.att, us.u.def), midVs = r(us.u.mid, them.u.mid), ourAtt = r(us.u.att, them.u.def);
  if (ot.lite) lines.push(`${ot.name} are a ${ot.str >= 75 ? 'strong' : ot.str >= 64 ? 'decent' : 'modest'} side by our standards.`);
  else {
    const star = squad(opp).filter(p => available(p) && p.pos !== 'GK').sort((a, b) => b.ca - a.ca)[0];
    if (star) lines.push(`Their danger man is ${star.n}. Keep him quiet.`);
  }
  lines.push(midVs > 1.05 ? 'We should control midfield.' : midVs < .95 ? 'They are stronger in midfield; we may need to be patient or go more direct.' : 'Midfield looks evenly matched.');
  lines.push(attVsDef > 1.05 ? 'Their attack can hurt us. A deeper line or a more cautious approach would help.' : 'Our defence should cope with their attack.');
  lines.push(ourAtt > 1.05 ? 'Their defence looks vulnerable. Being positive could pay off.' : ourAtt < .95 ? 'Their back line is solid; set pieces could be important.' : 'It will be tight at both ends.');
  if (wrong) lines[lines.length - 1] = R.pick(['I think we can be really aggressive today.', 'Honestly, I expect us to win comfortably.', 'I would sit deep and play for a draw.']);
  const tired = squad(G.user).filter(p => userTeam().tac.xi.includes(p.id) && p.cond < 78);
  if (tired.length) lines.push(`${tired.map(p => surname(p.n)).join(', ')} ${tired.length > 1 ? 'look' : 'looks'} tired. Consider rotating.`);
  return lines;
}

// ---- pre-match team talk ----
const PTALK = [['win', 'I expect a win today.'], ['nopress', 'No pressure. Go out and enjoy it.'], ['prove', 'Nobody expects anything from us. Prove them wrong.'], ['fans', 'Do it for the fans.'], ['focus', 'Stay focused and respect the opponent.']];
function preTalk(fid, k) {
  const f = G.fx[fid]; const opp = f.h === G.user ? f.a : f.h;
  const fav = teamStrength(G.user) - teamStrength(opp) + (f.h === G.user ? 2 : -1);
  const big = isRival(G.user, opp) || f.rnd === 'Final' || String(f.rnd).includes('Semi');
  let d, txt;
  if (k === 'win') { d = fav > 2 ? 5 : fav > -2 ? 2 : -3; txt = fav > 2 ? 'The players look confident.' : fav > -2 ? 'The players nod. They know it is winnable.' : 'Some players look nervous about the expectation.'; }
  else if (k === 'nopress') { d = fav < -2 ? 5 : fav < 2 ? 2 : -2; txt = fav < -2 ? 'The players look relaxed and free.' : fav < 2 ? 'The atmosphere is relaxed.' : 'A couple of players look a bit too relaxed for a game they should win.'; }
  else if (k === 'prove') { d = fav < -2 ? 6 : 1; txt = fav < -2 ? 'The players are fired up.' : 'The players look puzzled. They are favourites today.'; }
  else if (k === 'fans') { d = big ? 6 : 2; txt = big ? 'The players know what this game means.' : 'The players appreciate the reminder.'; }
  else { d = 2; txt = 'The players look focused.'; }
  d = Math.round(d * asstMult());
  for (const id of userTeam().tac.xi.concat(userTeam().tac.bench)) { const p = P(id); if (!p) continue; const det = attrs(p).Det; p.mor = clamp(p.mor + d + (d < 0 && det >= 14 ? 2 : 0), 5, 100); }
  G.ptalk = { fid, k, res: txt };
  return txt;
}

// ---- club theme ----
function hexRgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); }
function rgbHex(c) { return '#' + c.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function lum(h) { const [r, g, b] = hexRgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; }
function mix(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v + (B[i] - v) * t)); }
function lighten(h, minL) { let c = h; for (let i = 0; i < 12 && lum(c) < minL; i++) c = mix(c, '#ffffff', .18); return c; }
function applyTheme(tid) {
  const st = document.documentElement.style;
  const keys = ['--band', '--band2', '--bandtx', '--yel', '--acctx', '--ink', '--panel', '--row', '--rowalt', '--line'];
  if (!tid || !T(tid)) { for (const k of keys) st.removeProperty(k); return; }
  const t = T(tid); let c1 = t.c1, c2 = t.c2;
  if (lum(c1) > .55 && lum(c2) < .55) [c1, c2] = [c2, c1]; // use the darker colour for bands (e.g. Spurs navy, Leeds blue)
  const band = lum(c1) > .55 ? '#2b2f45' : c1;
  const band2 = mix(band, '#05060f', .45);
  let acc = c2; if (lum(acc) < .3) acc = lighten(acc, .35); if (Math.abs(lum(acc) - lum(band)) < .12 && lum(band) > .2) acc = '#ffffff';
  const ink = mix('#07091a', band, .1);
  st.setProperty('--band', band); st.setProperty('--band2', band2); st.setProperty('--bandtx', readable(band));
  st.setProperty('--yel', acc); st.setProperty('--acctx', readable(acc));
  st.setProperty('--ink', ink); st.setProperty('--panel', mix('#0d1030', band, .14)); st.setProperty('--row', mix('#10133a', band, .2)); st.setProperty('--rowalt', mix('#0b0e2c', band, .1)); st.setProperty('--line', mix('#252a5c', band, .35));
}

// ---- migration for older saves ----
function migrate() {
  if (!G) return;
  for (const id of fullTeams()) { const t = T(id); if (!t.lite) { ensureCaptains(id); for (const k in TAC_DEF) if (t.tac[k] == null) t.tac[k] = TAC_DEF[k]; if (!t.tac.pr) t.tac.pr = []; } }
  ensureStaff();
  if (G.fans == null) G.fans = 60;
  if (!G.train) G.train = 'bal';
}
