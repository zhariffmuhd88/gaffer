// ===== CORE: utilities, players, tactics =====
let G = null; // whole game state
const SAVE_KEY = 'gaffer2627.save.v1';

const R = {
  f: () => Math.random(),
  i: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  chance: (p) => Math.random() < p,
  shuffle: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  wpick: (items, wfn) => { let tot = 0; const ws = items.map(x => { const w = Math.max(0, wfn(x)); tot += w; return w; }); if (tot <= 0) return items[0]; let r = Math.random() * tot; for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; },
  gauss: () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
};
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function poisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }

// ---- dates (UTC strings YYYY-MM-DD) ----
function dParse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
function dStr(dt) { return dt.toISOString().slice(0, 10); }
function addDays(s, n) { const d = dParse(s); d.setUTCDate(d.getUTCDate() + n); return dStr(d); }
function dDiff(a, b) { return Math.round((dParse(b) - dParse(a)) / 86400000); }
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function dNice(s, withDow = true) { const d = dParse(s); return (withDow ? DOW[d.getUTCDay()] + ' ' : '') + d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
function dShort(s) { const d = dParse(s); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; }
function dow(s) { return dParse(s).getUTCDay(); }
function money(m) { if (m == null) return '-'; const neg = m < 0; m = Math.abs(m); let s; if (m >= 1) s = '£' + (m >= 100 ? m.toFixed(0) : m.toFixed(1)) + 'm'; else s = '£' + Math.round(m * 1000) + 'k'; return (neg ? '-' : '') + s; }
function wageStr(k) { return '£' + (k >= 100 ? Math.round(k) : k.toFixed(1)) + 'k/w'; }
function seasonLabel(y) { return y + '/' + String((y + 1) % 100).padStart(2, '0'); }

// ---- positions & roles ----
const ATTR_OUT = ['Tck', 'Mar', 'Hea', 'Pas', 'Cre', 'Dri', 'Fin', 'Crs', 'Lon', 'Pos', 'Pac', 'Sta', 'Str', 'Det', 'Tea', 'Fla'];
const ATTR_GK = ['Han', 'Ref', 'Aer', 'Kic', 'OvO'];
const ATTR_NAMES = { Tck: 'Tackling', Mar: 'Marking', Hea: 'Heading', Pas: 'Passing', Cre: 'Creativity', Dri: 'Dribbling', Fin: 'Finishing', Crs: 'Crossing', Lon: 'Long Shots', Pos: 'Positioning', Pac: 'Pace', Sta: 'Stamina', Str: 'Strength', Det: 'Determination', Tea: 'Teamwork', Fla: 'Flair', Han: 'Handling', Ref: 'Reflexes', Aer: 'Aerial Ability', Kic: 'Kicking', OvO: 'One on Ones' };
// offsets from base per position (1-20 scale)
const PROFILE = {
  GK: { Tck: -9, Mar: -8, Hea: -6, Pas: -4, Cre: -7, Dri: -8, Fin: -11, Crs: -9, Lon: -10, Pos: 1, Pac: -5, Sta: -3, Str: 0, Det: 0, Tea: 0, Fla: -7, Han: 1, Ref: 1.5, Aer: 0, Kic: -1, OvO: 0.5 },
  CB: { Tck: 1.5, Mar: 1.5, Hea: 1.5, Pas: -2, Cre: -4, Dri: -4, Fin: -6, Crs: -5, Lon: -5, Pos: 1.5, Pac: -1, Sta: 0, Str: 1.5, Det: 0.5, Tea: 0.5, Fla: -5 },
  LB: { Tck: 0.5, Mar: 0, Hea: -2, Pas: -0.5, Cre: -2, Dri: -0.5, Fin: -5, Crs: 1, Lon: -3, Pos: 0, Pac: 1.5, Sta: 1.5, Str: -1, Det: 0, Tea: 0.5, Fla: -2 },
  RB: { Tck: 0.5, Mar: 0, Hea: -2, Pas: -0.5, Cre: -2, Dri: -0.5, Fin: -5, Crs: 1, Lon: -3, Pos: 0, Pac: 1.5, Sta: 1.5, Str: -1, Det: 0, Tea: 0.5, Fla: -2 },
  DM: { Tck: 1, Mar: 0.5, Hea: -1, Pas: 0.5, Cre: -1.5, Dri: -1.5, Fin: -4, Crs: -3, Lon: -1.5, Pos: 1.5, Pac: -1.5, Sta: 1, Str: 0.5, Det: 0.5, Tea: 1.5, Fla: -3 },
  CM: { Tck: -1, Mar: -1.5, Hea: -2.5, Pas: 1.5, Cre: 0.5, Dri: 0, Fin: -2, Crs: -1.5, Lon: 0, Pos: -0.5, Pac: -1, Sta: 1.5, Str: -1, Det: 0.5, Tea: 1, Fla: -0.5 },
  AM: { Tck: -4, Mar: -4.5, Hea: -3.5, Pas: 1, Cre: 1.5, Dri: 1, Fin: 0, Crs: -1, Lon: 0.5, Pos: -2, Pac: -0.5, Sta: -0.5, Str: -2.5, Det: 0, Tea: 0, Fla: 1.5 },
  LW: { Tck: -4.5, Mar: -5, Hea: -4, Pas: -0.5, Cre: 0.5, Dri: 1.5, Fin: 0, Crs: 1, Lon: -0.5, Pos: -2, Pac: 2, Sta: 0, Str: -3, Det: 0, Tea: -0.5, Fla: 1.5 },
  RW: { Tck: -4.5, Mar: -5, Hea: -4, Pas: -0.5, Cre: 0.5, Dri: 1.5, Fin: 0, Crs: 1, Lon: -0.5, Pos: -2, Pac: 2, Sta: 0, Str: -3, Det: 0, Tea: -0.5, Fla: 1.5 },
  ST: { Tck: -6, Mar: -6.5, Hea: 0.5, Pas: -1.5, Cre: -1, Dri: 0.5, Fin: 2.5, Crs: -3, Lon: 0, Pos: -3, Pac: 0.5, Sta: -1, Str: 0.5, Det: 0.5, Tea: -1, Fla: 0.5 }
};
const POS_LABEL = { GK: 'GK', CB: 'D C', LB: 'D L', RB: 'D R', DM: 'DM', CM: 'M C', AM: 'AM C', LW: 'AM L', RW: 'AM R', ST: 'F C' };
const POS_GROUP = { GK: 'G', CB: 'D', LB: 'D', RB: 'D', DM: 'M', CM: 'M', AM: 'M', LW: 'A', RW: 'A', ST: 'A' };
const POS_ORDER = { GK: 0, RB: 1, CB: 2, LB: 3, DM: 4, CM: 5, AM: 6, RW: 7, LW: 8, ST: 9 };

// role skill weights
const ROLE_W = {
  GK: { Han: .3, Ref: .35, OvO: .15, Aer: .12, Kic: .08 },
  DC: { Tck: .24, Mar: .24, Hea: .2, Pos: .17, Str: .1, Pac: .05 },
  DL: { Tck: .2, Mar: .15, Pac: .2, Crs: .13, Sta: .1, Pos: .12, Pas: .1 },
  DR: { Tck: .2, Mar: .15, Pac: .2, Crs: .13, Sta: .1, Pos: .12, Pas: .1 },
  WBL: { Pac: .2, Crs: .2, Sta: .15, Tck: .15, Dri: .1, Pas: .1, Mar: .1 },
  WBR: { Pac: .2, Crs: .2, Sta: .15, Tck: .15, Dri: .1, Pas: .1, Mar: .1 },
  DM: { Tck: .25, Pos: .2, Pas: .2, Mar: .1, Sta: .1, Tea: .15 },
  MC: { Pas: .25, Cre: .15, Tea: .15, Sta: .15, Tck: .1, Dri: .1, Lon: .1 },
  ML: { Crs: .2, Pac: .2, Dri: .2, Pas: .15, Sta: .15, Cre: .1 },
  MR: { Crs: .2, Pac: .2, Dri: .2, Pas: .15, Sta: .15, Cre: .1 },
  AMC: { Cre: .25, Pas: .2, Dri: .2, Fin: .15, Lon: .1, Fla: .1 },
  AML: { Dri: .25, Pac: .2, Fin: .15, Crs: .15, Cre: .15, Fla: .1 },
  AMR: { Dri: .25, Pac: .2, Fin: .15, Crs: .15, Cre: .15, Fla: .1 },
  FC: { Fin: .35, Hea: .15, Dri: .15, Pac: .15, Str: .1, Fla: .1 }
};
// contribution of each role to defence/midfield/attack
const ROLE_U = {
  GK: [0, 0, 0], DC: [1, .1, 0], DL: [.8, .25, .15], DR: [.8, .25, .15], WBL: [.6, .35, .3], WBR: [.6, .35, .3],
  DM: [.55, .7, .05], MC: [.25, 1, .3], ML: [.2, .6, .5], MR: [.2, .6, .5], AMC: [.05, .55, .8], AML: [.05, .35, .9], AMR: [.05, .35, .9], FC: [0, .1, 1]
};
const ROLE_LABEL = { GK: 'GK', DC: 'D C', DL: 'D L', DR: 'D R', WBL: 'WB L', WBR: 'WB R', DM: 'DM', MC: 'M C', ML: 'M L', MR: 'M R', AMC: 'AM C', AML: 'AM L', AMR: 'AM R', FC: 'F C' };
const ROLE_NOUN = { GK: 'goalkeeper', DC: 'centre-back', DL: 'left-back', DR: 'right-back', WBL: 'left wing-back', WBR: 'right wing-back', DM: 'holding midfielder', MC: 'midfielder', ML: 'left winger', MR: 'right winger', AMC: 'playmaker', AML: 'left winger', AMR: 'right winger', FC: 'striker' };
// familiarity: player pos -> role
const FAM = {
  GK: { GK: 1 },
  CB: { DC: 1, DL: .72, DR: .72, DM: .78, WBL: .6, WBR: .6 },
  LB: { DL: 1, WBL: 1, ML: .82, DC: .72, DR: .7, AML: .65, MC: .55, DM: .6 },
  RB: { DR: 1, WBR: 1, MR: .82, DC: .72, DL: .7, AMR: .65, MC: .55, DM: .6 },
  DM: { DM: 1, MC: .95, DC: .78, AMC: .7, ML: .6, MR: .6 },
  CM: { MC: 1, DM: .9, AMC: .88, ML: .75, MR: .75, AML: .65, AMR: .65, FC: .5 },
  AM: { AMC: 1, MC: .85, AML: .86, AMR: .86, FC: .78, ML: .75, MR: .75, DM: .55 },
  LW: { AML: 1, ML: .95, AMR: .82, MR: .75, FC: .78, AMC: .78, WBL: .65, DL: .5 },
  RW: { AMR: 1, MR: .95, AML: .82, ML: .75, FC: .78, AMC: .78, WBR: .65, DR: .5 },
  ST: { FC: 1, AMC: .72, AML: .72, AMR: .72, ML: .5, MR: .5 }
};
function fam(pos, role) { return (FAM[pos] && FAM[pos][role]) || .35; }

const FORMS = {
  '4-4-2': [['GK', 50, 5], ['DR', 85, 24], ['DC', 62, 20], ['DC', 38, 20], ['DL', 15, 24], ['MR', 85, 52], ['MC', 62, 48], ['MC', 38, 48], ['ML', 15, 52], ['FC', 62, 80], ['FC', 38, 80]],
  '4-3-3': [['GK', 50, 5], ['DR', 85, 24], ['DC', 62, 20], ['DC', 38, 20], ['DL', 15, 24], ['MC', 72, 50], ['DM', 50, 40], ['MC', 28, 50], ['AMR', 82, 74], ['FC', 50, 84], ['AML', 18, 74]],
  '4-2-3-1': [['GK', 50, 5], ['DR', 85, 24], ['DC', 62, 20], ['DC', 38, 20], ['DL', 15, 24], ['DM', 62, 40], ['DM', 38, 40], ['AMR', 82, 66], ['AMC', 50, 64], ['AML', 18, 66], ['FC', 50, 85]],
  '4-1-4-1': [['GK', 50, 5], ['DR', 85, 24], ['DC', 62, 20], ['DC', 38, 20], ['DL', 15, 24], ['DM', 50, 37], ['MR', 85, 56], ['MC', 62, 54], ['MC', 38, 54], ['ML', 15, 56], ['FC', 50, 84]],
  '4-4-1-1': [['GK', 50, 5], ['DR', 85, 24], ['DC', 62, 20], ['DC', 38, 20], ['DL', 15, 24], ['MR', 85, 50], ['MC', 62, 46], ['MC', 38, 46], ['ML', 15, 50], ['AMC', 50, 68], ['FC', 50, 85]],
  '4-3-2-1': [['GK', 50, 5], ['DR', 85, 24], ['DC', 62, 20], ['DC', 38, 20], ['DL', 15, 24], ['MC', 75, 46], ['MC', 50, 42], ['MC', 25, 46], ['AMC', 64, 68], ['AMC', 36, 68], ['FC', 50, 85]],
  '4-1-2-1-2': [['GK', 50, 5], ['DR', 85, 24], ['DC', 62, 20], ['DC', 38, 20], ['DL', 15, 24], ['DM', 50, 36], ['MC', 70, 50], ['MC', 30, 50], ['AMC', 50, 66], ['FC', 62, 84], ['FC', 38, 84]],
  '3-5-2': [['GK', 50, 5], ['DC', 72, 20], ['DC', 50, 17], ['DC', 28, 20], ['WBR', 88, 44], ['MC', 66, 50], ['DM', 50, 40], ['MC', 34, 50], ['WBL', 12, 44], ['FC', 62, 82], ['FC', 38, 82]],
  '3-4-3': [['GK', 50, 5], ['DC', 72, 20], ['DC', 50, 17], ['DC', 28, 20], ['WBR', 88, 46], ['MC', 62, 46], ['MC', 38, 46], ['WBL', 12, 46], ['AMR', 80, 74], ['FC', 50, 84], ['AML', 20, 74]],
  '3-4-2-1': [['GK', 50, 5], ['DC', 72, 20], ['DC', 50, 17], ['DC', 28, 20], ['WBR', 88, 46], ['MC', 62, 44], ['MC', 38, 44], ['WBL', 12, 46], ['AMC', 64, 68], ['AMC', 36, 68], ['FC', 50, 85]],
  '5-3-2': [['GK', 50, 5], ['WBR', 88, 30], ['DC', 70, 19], ['DC', 50, 17], ['DC', 30, 19], ['WBL', 12, 30], ['MC', 70, 50], ['MC', 50, 46], ['MC', 30, 50], ['FC', 62, 80], ['FC', 38, 80]],
  '5-4-1': [['GK', 50, 5], ['WBR', 88, 30], ['DC', 70, 19], ['DC', 50, 17], ['DC', 30, 19], ['WBL', 12, 30], ['MR', 85, 54], ['MC', 62, 50], ['MC', 38, 50], ['ML', 15, 54], ['FC', 50, 82]]
};
const PREF_FORM = { ARS: '4-3-3', MCI: '4-2-3-1', LIV: '4-2-3-1', MUN: '3-4-2-1', CHE: '3-4-2-1', AVL: '4-2-3-1', TOT: '4-2-3-1', NEW: '4-3-3', BOU: '4-2-3-1', SUN: '4-2-3-1', CRY: '3-4-2-1', BHA: '4-2-3-1', BRE: '4-3-3', FUL: '4-2-3-1', EVE: '4-2-3-1', LEE: '4-3-3', NFO: '3-4-2-1', COV: '4-2-3-1', IPS: '4-2-3-1', HUL: '3-4-2-1' };

// ---- player attributes (derived deterministically from ability) ----
const _attrCache = new Map();
function attrs(p) {
  const key = p.id + ':' + p.ca + ':' + p.pos + ':' + (p.abv || 0);
  let a = _attrCache.get(key);
  if (a) return a;
  a = {};
  const base = 1 + (p.ca - 35) * 0.33;
  const prof = PROFILE[p.pos];
  const keys = p.pos === 'GK' ? ATTR_OUT.concat(ATTR_GK) : ATTR_OUT;
  for (const k of keys) {
    const h = hash(p.n + '|' + k + '|' + (p.seed || 0));
    const noise = ((h % 1000) / 1000 - 0.5) * 4.2;
    let v = base + (prof[k] || 0) + noise;
    if (k === 'Det' || k === 'Tea') v = base - 1 + noise * 1.2;
    if (k === 'Pac' && p.age > 30) v -= (p.age - 30) * 0.45;
    a[k] = clamp(Math.round(v + ((p.ab && p.ab[k]) || 0)), 1, 20);
  }
  if (_attrCache.size > 6000) _attrCache.clear();
  _attrCache.set(key, a);
  return a;
}
function roleSkill(p, role) {
  const a = attrs(p), w = ROLE_W[role];
  let s = 0, t = 0;
  for (const k in w) { s += (a[k] || 1) * w[k]; t += w[k]; }
  return (s / t) * 5; // 0-100
}
function bestRole(p) { const f = FAM[p.pos]; let best = null, bv = -1; for (const r in f) if (f[r] === 1) { const v = roleSkill(p, r); if (v > bv) { bv = v; best = r; } } return best; }

// ---- value / wage ----
function ageFactor(age) { return age <= 19 ? 1.6 : age <= 21 ? 1.5 : age <= 24 ? 1.3 : age <= 27 ? 1.1 : age <= 29 ? .9 : age <= 31 ? .6 : age <= 33 ? .35 : .15; }
function calcValue(p) {
  let v = 0.32 * Math.exp(0.115 * (p.ca - 40)) * ageFactor(p.age);
  if (p.pa > p.ca + 6 && p.age < 23) v *= 1 + (p.pa - p.ca) / 60;
  if (p.pos === 'GK') v *= .7;
  const yrs = (p.con || G.year + 2) - G.year;
  if (yrs <= 0) v *= .35; else if (yrs === 1) v *= .7;
  v = v < 1 ? Math.round(v * 20) / 20 : v < 10 ? Math.round(v * 4) / 4 : Math.round(v);
  return Math.max(0.05, v);
}
function calcWageDemand(p, rep) { const r = rep || 75; return Math.max(3, Math.round(7 * Math.exp(0.08 * (p.ca - 40)) * (0.55 + 0.5 * r / 93) * (p.age >= 32 ? .8 : 1))); }

// ---- divisions ----
function divOf(tid) { if (!G || !tid) return null; if (G.pl.includes(tid)) return 'PL'; if (G.champTeams && G.champTeams.includes(tid) && G.teams[tid] && !G.teams[tid].lite) return 'CH'; if (G.ll && G.ll.includes(tid)) return 'LL'; if (G.sa && G.sa.includes(tid)) return 'SA'; if (G.xl) for (const k in G.xl) if (G.xl[k].includes(tid)) return k; return null; }
function fullTeams() { return G.pl.concat((G.champTeams || []).filter(t => G.teams[t] && !G.teams[t].lite), G.ll || [], G.sa || [], ...Object.values(G.xl || {})); }
// country of a club (England unless it plays in a Spanish competition)
const XL_CTRY = { BL: 'GER', L1: 'FRA', SPL: 'KSA', ED: 'NED', LO: 'ENG' };
function ctryOf(tid) { if (G && G.xl) for (const k in G.xl) if (G.xl[k].includes(tid)) return XL_CTRY[k]; if (G && ((G.sa && G.sa.includes(tid)) || (G.sb && G.sb.includes(tid)) || (G.sc && G.sc.includes(tid)))) return 'ITA'; return G && ((G.ll && G.ll.includes(tid)) || (G.seg && G.seg.includes(tid)) || (G.pf && G.pf.includes(tid))) ? 'ESP' : 'ENG'; }
function youthIds(tid) { return G && G.res ? ((G.res[tid] || []).concat((G.acad && G.acad[tid]) || [])) : []; }
// every league with full squads in this save, England first
function LG_ALL() { return ['PL', 'CH', 'LO', 'LL', 'SA', 'BL', 'L1', 'SPL', 'ED'].filter(k => k === 'PL' || (k === 'CH' ? divTeams('CH').length : k === 'LL' ? (G.ll || []).length : k === 'SA' ? (G.sa || []).length : !!(G.xl && G.xl[k] && G.xl[k].length))); }
function divTeams(div) { return div === 'CH' ? (G.champTeams || []).filter(t => G.teams[t] && !G.teams[t].lite) : div === 'LL' ? (G.ll || []) : div === 'SA' ? (G.sa || []) : G.xl && G.xl[div] ? G.xl[div] : G.pl; }
function wageFor(p, tid) { const t = G.teams[tid]; return Math.max(2, Math.round(calcWageDemand(p, t ? t.rep : 70) * ({ CH: 0.45, LL: 0.8, SA: 0.75, BL: 0.72, L1: 0.65, SPL: 0.9, ED: 0.5, LO: 0.22 }[divOf(tid)] || 1))); }

// ---- compact save format: skip default player fields, round decimals; restore fills them back ----
const P_DEF = { listed: false, injT: '', inj: 0, sus: 0, yel: 0, ym: 0, ymr: 0, mi: 0, low: 0, prom: null };
function saveJSON(o) {
  return JSON.stringify(o, function (k, v) {
    if (typeof v === 'number' && !Number.isInteger(v)) return Math.round(v * 100) / 100;
    if (this && this.pos && this.n && this.id && this.seed !== undefined) { // a player
      if (k in P_DEF && v === P_DEF[k]) return undefined;
      if (k === 'form' && Array.isArray(v) && !v.length) return undefined;
      if (k === 'st' && v && !Object.values(v).some(x => x)) return undefined;
    }
    return v;
  });
}
function fillPlayer(p) { for (const k in P_DEF) if (p[k] === undefined) p[k] = P_DEF[k]; if (!p.form) p.form = []; if (!p.st) p.st = newStats(); if (!p.car) p.car = { a: 0, g: 0 }; return p; }

let _pid = 0;
function mkPlayer(o) {
  const id = 'p' + (++_pid);
  const p = Object.assign({ id, mor: 72, cond: 100, inj: 0, injT: '', sus: 0, yel: 0, form: [], st: newStats(), car: { a: 0, g: 0 }, listed: false, seed: 0 }, o);
  if (p.pa == null) {
    const g = p.age <= 19 ? R.i(8, 24) : p.age <= 21 ? R.i(5, 16) : p.age <= 23 ? R.i(2, 10) : p.age <= 26 ? R.i(0, 4) : 0;
    p.pa = Math.min(96, p.ca + g);
  }
  return p;
}
function newStats() { return { a: 0, s: 0, g: 0, as: 0, r: 0, mom: 0, cs: 0, y: 0, rc: 0 }; }
function genName() { return R.pick(FIRST) + ' ' + R.pick(LAST); }
const NATS_YOUTH = ['ENG', 'ENG', 'ENG', 'ENG', 'SCO', 'WAL', 'IRL', 'NIR', 'FRA', 'ESP', 'NED', 'POR', 'GER', 'BEL', 'NGA', 'GHA', 'BRA', 'DEN'];

// ---- team helpers ----
function T(id) { return G.teams[id]; }
function tName(id, short = true) { const t = G.teams[id]; if (!t) return id; return short ? (t.short || t.name) : t.name; }
function P(id) { return G.players[id]; }
function squad(tid) { return (G.sq[tid] || []).map(P).filter(Boolean); }
function isUser(tid) { return tid === G.user; }
function available(p) { return p.inj <= 0 && p.sus <= 0; }
function userTeam() { return T(G.user); }
// ---- save compression: LZW over UTF-8 bytes, variable code width, packed 15 bits per UTF-16 char ----
const LZ_TAG = '\u0001GZ1';
function lzPack(str) {
  const bytes = new TextEncoder().encode(str);
  const out = []; let acc = 0, nb = 0;
  const put = (code, w) => { while (w > 0) { const t = Math.min(w, 15 - nb); w -= t; acc = (acc << t) | (code >>> w); code &= (1 << w) - 1; nb += t; if (nb === 15) { out.push(acc + 32); acc = 0; nb = 0; } } };
  const MAX = 1 << 20, HS = 1 << 22, HM = HS - 1;
  if (!lzPack.hk) { lzPack.hk = new Int32Array(HS); lzPack.hv = new Int32Array(HS); }
  const hk = lzPack.hk, hv = lzPack.hv; hk.fill(-1);
  let next = 257, w = 9, cur = -1;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (cur < 0) { cur = b; continue; }
    const key = cur * 256 + b; let h = (key ^ (key >>> 13) ^ (key << 7)) & HM;
    while (hk[h] !== -1 && hk[h] !== key) h = (h + 1) & HM;
    if (hk[h] === key) { cur = hv[h]; continue; }
    put(cur, w);
    if (next < MAX) { hk[h] = key; hv[h] = next++; if (next > (1 << w) && w < 20) w++; }
    else { put(256, w); hk.fill(-1); next = 257; w = 9; }
    cur = b;
  }
  if (cur >= 0) put(cur, w);
  if (nb > 0) put(0, 15 - nb);
  let s = LZ_TAG + bytes.length + ';';
  for (let i = 0; i < out.length; i += 8192) s += String.fromCharCode.apply(null, out.slice(i, i + 8192));
  return s;
}
function lzUnpack(s) {
  const semi = s.indexOf(';'); const total = +s.slice(LZ_TAG.length, semi);
  const bytes = new Uint8Array(total); let bp = 0;
  let pos = semi + 1, acc = 0, nb = 0;
  const get = (w) => { let v = 0; while (w > 0) { if (nb === 0) { acc = s.charCodeAt(pos++) - 32; nb = 15; } const t = Math.min(w, nb); nb -= t; w -= t; v = (v << t) | (acc >>> nb); acc &= (1 << nb) - 1; } return v; };
  const MAX = 1 << 20;
  let pre = new Int32Array(MAX), last = new Uint8Array(MAX), first = new Uint8Array(MAX), len = new Int32Array(MAX);
  for (let i = 0; i < 256; i++) { pre[i] = -1; last[i] = i; first[i] = i; len[i] = 1; }
  let next = 257, w = 9, prev = -1;
  const emit = (c) => { const L = len[c]; let k = bp + L - 1; let x = c; while (x >= 0 && k >= bp) { bytes[k--] = last[x]; x = pre[x]; } bp += L; };
  while (bp < total) {
    const c = get(w);
    if (c === 256) { next = 257; w = 9; prev = -1; continue; }
    if (prev < 0) { emit(c); prev = c; continue; }
    let fc;
    if (c < next) fc = first[c]; else fc = first[prev];
    if (next < MAX) { pre[next] = prev; last[next] = fc; first[next] = first[prev]; len[next] = len[prev] + 1; next++; if (next + 1 > (1 << w) && w < 20) w++; }
    emit(c); prev = c;
  }
  return new TextDecoder().decode(bytes);
}
