// preseason.js: pre-season friendlies. Loaded after rivalry.js.
//  - The manager arranges friendlies (date, opponent, home or away), or lets the assistant do it.
//  - Asia Tour: up to four stops from Selangor, Japan, Singapore, Hong Kong and China. Each stop pays an appearance
//    fee and raises the club's reputation, fan mood and commercial income for the season.
//  - Every pre-season: Arsenal Legends (prime-years ratings, game estimates). The first XI plays the first half and
//    the eleven substitutes play the second half.
// Friendlies do not count towards player stats, cards, form or the board's confidence.
COMP_NAME.PSF = 'Pre-season friendly'; COMP_SHORT.PSF = 'FRN';
const PS_DATES = ['2026-07-04', '2026-07-08', '2026-07-11', '2026-07-15', '2026-07-18', '2026-07-22', '2026-07-25', '2026-07-29', '2026-08-01', '2026-08-05', '2026-08-08', '2026-08-12', '2026-08-15', '2026-08-18'];
const ASIA = {
  SEL: { c: 'Malaysia', n: 'Selangor FC', str: 64, ven: 'MBPJ Stadium, Petaling Jaya', cap: 25000, f: .9, flag: '🇲🇾' },
  JPN: { c: 'Japan', n: 'Yokohama F. Marinos', str: 70, ven: 'Nissan Stadium, Yokohama', cap: 72000, f: 1.2, flag: '🇯🇵' },
  SGP: { c: 'Singapore', n: 'Lion City Sailors', str: 62, ven: 'National Stadium, Singapore', cap: 55000, f: 1, flag: '🇸🇬' },
  HKG: { c: 'Hong Kong', n: 'Kitchee', str: 60, ven: 'Kai Tak Stadium, Hong Kong', cap: 50000, f: 1, flag: '🇭🇰' },
  CHN: { c: 'China', n: 'Shanghai Port', str: 68, ven: 'Shanghai Stadium', cap: 56000, f: 1.3, flag: '🇨🇳' }
};
// Real squads for the Asia Tour opponents: FotMob team pages (Selangor via starting11.com; Kitchee via Wikipedia's
// 2025-26 season page, the latest list found), read 8 Nov 2026. Ratings are game estimates. Names as listed there.
const ASIA_SQ = {
  SEL: { coach: 'Kim Pan-gon', sq: [['Al Hafiz', 'GK', 61], ['Al Amin', 'GK', 58], ['Nazrel', 'GK', 52], ['Quentin Cheng', 'RB', 63], ['Ankrah', 'CB', 64], ['Xhemajli', 'CB', 66], ['Khalili', 'LB', 60], ['Safuwan Baharudin', 'CB', 62], ['Tabinas', 'CB', 63], ["Ra'op", 'RB', 58], ['Afkar', 'LB', 56], ['Laine', 'CM', 61], ['Makrillos', 'AM', 64], ['Boumous', 'AM', 66], ['Sosa', 'CM', 64], ['Azih', 'DM', 64], ['Alex Agyarkwa', 'CM', 63], ['Mahamé Siby', 'DM', 66], ['Mahadi', 'CM', 58], ['Bashah', 'CM', 56], ['Izwan', 'CM', 56], ['Faisal Halim', 'LW', 66], ['Kay Tejan', 'ST', 66], ['A. Selvan', 'RW', 59], ['Chrigor', 'ST', 67], ['Pernambuco', 'RW', 64]] },
  JPN: { coach: 'Hideo Oshima', sq: [['Park Il-gyu', 'GK', 68], ['Rubén Blanco', 'GK', 66], ['Hiroki Iikura', 'GK', 62], ['Yuya Tsuboi', 'GK', 57], ['Jeison Quiñónes', 'CB', 70], ['Thomas Deng', 'CB', 69], ['Ryotaro Tsunoda', 'CB', 68], ['Ken Matsubara', 'RB', 69], ['Kosei Suwama', 'RB', 66], ['Toichi Suzuki', 'LB', 64], ['Taisei Inoue', 'CB', 64], ['Takuto Kimura', 'LB', 63], ['Shota Fujii', 'CB', 62], ['Kanta Sekitomi', 'CB', 60], ['Kanata Hirano', 'RB', 58], ['Taiki Watanabe', 'DM', 68], ['Takuya Kida', 'DM', 69], ['Riku Yamane', 'CM', 70], ['Jun Amano', 'AM', 67], ['Tevis', 'AM', 68], ['Daiya Tono', 'CM', 66], ['Kei Chinen', 'CM', 66], ['Kosuke Matsumura', 'AM', 64], ['Yuta Tanaka', 'CM', 62], ['Dean David', 'ST', 70], ['Yuri Araújo', 'LW', 69], ['Jordy Croux', 'RW', 68], ['Kaina Tanimura', 'ST', 66], ['George Onaiwu', 'ST', 66], ['Ryo Miyaichi', 'LW', 64], ['Tomoki Kondo', 'RW', 62], ['Hikaru Takahashi', 'ST', 60], ['Rio Nitta', 'RW', 60], ['Shin Miidera', 'ST', 58]] },
  SGP: { coach: 'Mark Jackson', sq: [['Ivan Sušak', 'GK', 62], ['Adib Azahari', 'GK', 58], ['Victor Aznar', 'GK', 56], ['Toni Datković', 'CB', 66], ['Bailey Wright', 'CB', 65], ['Diogo Costa', 'CB', 63], ['Hugo Gomes', 'CB', 62], ['Hariss Harun', 'DM', 62], ['Lionel Tan', 'CB', 60], ['Jorge Karse', 'LB', 60], ['Ryhan Stewart', 'RB', 60], ['Nur Adam Abdullah', 'LB', 58], ['Adrian Jaccard', 'RB', 54], ['Tiryaq Suhaimi', 'CB', 52], ['Bart Ramselaar', 'AM', 68], ['Tsiy Ndenge', 'CM', 66], ['Kyoga Nakamura', 'CM', 62], ['Song Ui-young', 'AM', 62], ['Giovanni Haag', 'DM', 62], ['Hami Syahin', 'CM', 60], ['Muhammad Asis', 'CM', 55], ['Yasir Nizamudin', 'CM', 52], ['Izrafil Yusof', 'CM', 52], ['Ahmad Danial', 'CM', 52], ['Yazid Rais', 'CM', 52], ['Lennart Thy', 'ST', 66], ['Antonio Mance', 'ST', 64], ['Matthias Phaëton', 'LW', 64], ['Bobby Adekanye', 'RW', 63], ['Shawal Anuar', 'RW', 60], ['Glenn Kweh', 'LW', 58], ['Ilhan Fandi', 'ST', 58], ['Abdul Rasaq Akeem', 'ST', 55], ['Farhan Zulkifli', 'LW', 54], ['Izzan Rifqi', 'ST', 50]] },
  HKG: { coach: 'Iñigo Calderón', sq: [['Wang Zhenpeng', 'GK', 60], ['Law Tsz Chun', 'RB', 58], ['Roger Riera', 'CB', 62], ['Matheus Dantas', 'CB', 61], ['Jason Kam', 'CB', 57], ['Jay Haddow', 'LB', 56], ['Jordan Lam', 'CB', 56], ['Callum Beattie', 'RB', 55], ['Asier Illarramendi', 'DM', 66], ['Kendy Ikegami', 'CM', 60], ['Yumemi Kanda', 'CM', 60], ['Cheng Chin Lung', 'AM', 59], ['Tan Chun Lok', 'CM', 58], ['Pong Cheuk Hei', 'CM', 55], ['Ruslan Mingazow', 'AM', 62], ['Adrián Revilla', 'ST', 63], ['Leandro Martínez', 'ST', 63], ['Juninho', 'RW', 58], ['Seb Buddle', 'LW', 57]] },
  CHN: { coach: 'Kevin Muscat', sq: [['Yan Junling', 'GK', 66], ['Chen Wei', 'GK', 62], ['Li Zhiliang', 'GK', 57], ['Zhang Yuhang', 'GK', 55], ['Tyias Browning', 'CB', 66], ['Wei Zhen', 'CB', 64], ['Wang Shenchao', 'CB', 64], ['Miguel Campos', 'RB', 64], ['Zhang Linpeng', 'RB', 62], ['Fu Huan', 'LB', 62], ['Umidjan Yusup', 'LB', 60], ['Wang Zhenao', 'CB', 60], ['Alex Yang', 'RB', 60], ['Yue Xin', 'CB', 58], ['Bao Shimeng', 'LB', 58], ['Li Shuai', 'CB', 58], ['Wang Dongcheng', 'CB', 55], ['Mateus Vital', 'AM', 70], ['Óscar Melendo', 'AM', 68], ['Jean Claude', 'DM', 66], ['Jaume Grau', 'CM', 66], ['Yang Shiyuan', 'CM', 63], ['Kuai Jiwen', 'CM', 63], ['Liu Ruofan', 'CM', 62], ['Lu Yongtao', 'CM', 60], ['Zhang Yuan', 'CM', 58], ['Li Ruilong', 'DM', 58], ['Cao Zhezhe', 'CM', 56], ['Leonardo', 'ST', 70], ['Gabrielzinho', 'RW', 68], ['Wu Lei', 'ST', 66], ['Prince Ampem', 'LW', 64], ['Liu Zhurun', 'RW', 62], ['Matthew Orr', 'ST', 60], ['Li Xinxiang', 'LW', 58], ['Wen Junxiang', 'ST', 58], ['Cui Juncheng', 'ST', 56], ['Zhang Junjie', 'ST', 55]] }
};
const SLOT_PREF = { GK: ['GK'], DR: ['RB', 'CB'], DL: ['LB', 'CB', 'RB'], DC: ['CB', 'DM'], DM: ['DM', 'CM'], MC: ['CM', 'DM', 'AM'], AMR: ['RW', 'AM', 'LW'], AML: ['LW', 'AM', 'RW'], AMC: ['AM', 'CM'], FC: ['ST', 'RW', 'LW'], MR: ['RW', 'AM'], ML: ['LW', 'AM'] };
function rosterSide(S, k) {
  const R0 = ASIA_SQ[k]; const form = '4-2-3-1'; const slots = FORMS[form];
  ensureAsiaPlayers(); const pool = squad('AS_' + k).filter(p => p.inj <= 0); for (const p of pool) p.cond = 100;
  const left = pool.slice(); const take = (prefs) => { const sc = (p) => p.ca - 4 * prefs.indexOf(p.pos); const c0 = left.filter(p => prefs.includes(p.pos)).sort((a, b) => sc(b) - sc(a))[0]; if (c0) { left.splice(left.indexOf(c0), 1); return c0; } const c = left.filter(p => p.pos !== 'GK').sort((a, b) => b.ca - a.ca)[0]; if (c) left.splice(left.indexOf(c), 1); return c; };
  const xi = slots.map(s => take(SLOT_PREF[s[0]] || ['CM']));
  S.form = form; S.ps = slots.map((s, i) => ({ p: xi[i], role: s[0], pr: DEF_PR[s[0]], x: s[1], y: s[2], on: true, rt: 6.3, g: 0, as: 0, yc: 0, rc: 0, inj: false, mins: 0, subOn: 0 }));
  const gk2 = left.filter(p => p.pos === 'GK').sort((a, b) => b.ca - a.ca)[0];
  S.bench = (gk2 ? [gk2] : []).concat(left.filter(p => p.pos !== 'GK').sort((a, b) => b.ca - a.ca).slice(0, 8));
  return S;
}
// ---------- real player records for the tour clubs and the legends (viewable, comparable; tour players can be signed) ----------
const ASIA_NAT = { 'Rubén Blanco': 'ESP', 'Jeison Quiñónes': 'COL', 'Thomas Deng': 'AUS', 'Tevis': 'BRA', 'Jordy Croux': 'BEL', 'Dean David': 'ISR', 'Yuri Araújo': 'BRA',
  'Victor Aznar': 'BRA', 'Ivan Sušak': 'CRO', 'Jorge Karse': 'GEO', 'Hugo Gomes': 'BRA', 'Toni Datković': 'CRO', 'Bailey Wright': 'AUS', 'Diogo Costa': 'POR', 'Tsiy Ndenge': 'CMR', 'Bart Ramselaar': 'NED', 'Giovanni Haag': 'FRA', 'Lennart Thy': 'GER', 'Antonio Mance': 'CRO', 'Matthias Phaëton': 'GLP', 'Bobby Adekanye': 'NED',
  'Miguel Campos': 'POR', 'Jean Claude': 'TOG', 'Mateus Vital': 'BRA', 'Jaume Grau': 'ESP', 'Óscar Melendo': 'ESP', 'Gabrielzinho': 'BRA', 'Matthew Orr': 'HKG', 'Prince Ampem': 'GHA', 'Leonardo': 'BRA',
  'Roger Riera': 'ESP', 'Matheus Dantas': 'BRA', 'Asier Illarramendi': 'ESP', 'Kendy Ikegami': 'BRA', 'Yumemi Kanda': 'JPN', 'Ruslan Mingazow': 'TKM', 'Adrián Revilla': 'ESP', 'Leandro Martínez': 'ESP',
  'Kay Tejan': 'NED', 'Chrigor': 'BRA', 'Pernambuco': 'BRA', 'Alex Agyarkwa': 'GHA', 'Safuwan Baharudin': 'SGP', 'Xhemajli': '', 'Ankrah': '', 'Boumous': '', 'Sosa': '', 'Azih': '', 'Makrillos': '', 'Mahamé Siby': '', 'Tabinas': '' };
const ASIA_HOME = { SEL: 'MAS', JPN: 'JPN', SGP: 'SGP', HKG: 'HKG', CHN: 'CHN' };
// ages: Selangor from starting11.com; other well-known players from their published birth years; the rest are estimates (26)
const ASIA_AGE = { 'Al Amin': 26, 'Nazrel': 23, 'Al Hafiz': 31, 'Quentin Cheng': 26, 'Ankrah': 25, 'Xhemajli': 27, 'Khalili': 24, 'Safuwan Baharudin': 34, 'Tabinas': 27, "Ra'op": 26, 'Afkar': 24, 'Laine': 23, 'Makrillos': 30, 'Boumous': 30, 'Sosa': 29, 'Azih': 30, 'Alex Agyarkwa': 25, 'Mahadi': 24, 'Bashah': 24, 'Izwan': 22, 'Faisal Halim': 28, 'Kay Tejan': 29, 'A. Selvan': 25, 'Chrigor': 25, 'Pernambuco': 28,
  'Wu Lei': 35, 'Yan Junling': 35, 'Zhang Linpeng': 37, 'Wang Shenchao': 37, 'Hariss Harun': 36, 'Asier Illarramendi': 36, 'Bailey Wright': 34, 'Lennart Thy': 34, 'Bart Ramselaar': 30, 'Dean David': 30, 'Ryo Miyaichi': 34, 'Jun Amano': 35, 'Rubén Blanco': 31, 'Mateus Vital': 28, 'Óscar Melendo': 29, 'Thomas Deng': 29, 'Toni Datković': 33, 'Shawal Anuar': 35, 'Tyias Browning': 32, 'Jordy Croux': 32 };
const LEG_NAT = { 'Jens Lehmann': 'GER', 'Lauren': 'CMR', 'Sol Campbell': 'ENG', 'Kolo Touré': 'CIV', 'Thomas Vermaelen': 'BEL', 'Freddie Ljungberg': 'SWE', 'Patrick Vieira': 'FRA', 'Gilberto Silva': 'BRA', 'Robert Pirès': 'FRA', 'Dennis Bergkamp': 'NED', 'Thierry Henry': 'FRA',
  'David Seaman': 'ENG', 'Lee Dixon': 'ENG', 'Martin Keown': 'ENG', 'Tony Adams': 'ENG', 'Nigel Winterburn': 'ENG', 'Tomáš Rosický': 'CZE', 'Aaron Ramsey': 'WAL', 'Santi Cazorla': 'ESP', 'Mesut Özil': 'GER', 'Alexis Sánchez': 'CHI', 'Ian Wright': 'ENG' };
function ensureAsiaPlayers() {
  ensureAsia();
  for (const k in ASIA_SQ) {
    const id = 'AS_' + k; const t = T(id); t.coach = ASIA_SQ[k].coach; t.mgr = ASIA_SQ[k].coach; G.sq[id] = G.sq[id] || [];
    if (!t.made) {
      t.made = 1;
      ASIA_SQ[k].sq.forEach((x, i) => {
        const age = ASIA_AGE[x[0]] || 26; const nat = x[0] in ASIA_NAT ? ASIA_NAT[x[0]] : ASIA_HOME[k];
        const p = mkPlayer({ n: x[0], pos: x[1], ca: x[2], pa: Math.min(90, x[2] + (age <= 21 ? 8 : age <= 24 ? 3 : 0)), age, nat, c: id, seed: 300 + i, con: G.year + 2 });
        p.wage = Math.max(2, Math.round(calcWageDemand(p, 60) * .35)); p.val = calcValue(p); p.no = i + 1;
        G.players[p.id] = p; G.sq[id].push(p.id);
      });
    }
    G.sq[id] = G.sq[id].filter(pid => P(pid) && P(pid).c === id);
    // keep at least 18 players: academy graduates fill gaps left by sales and retirements
    while (G.sq[id].length < 18) { const pos = R.pick(['GK', 'CB', 'CB', 'LB', 'RB', 'CM', 'CM', 'DM', 'AM', 'LW', 'RW', 'ST']); const ca = Math.round(ASIA[k].str - 8 + R.i(-3, 3)); const p = mkPlayer({ n: genName(), pos, ca, age: R.i(18, 21), nat: ASIA_HOME[k], c: id, seed: R.i(1, 9999), con: G.year + 2 }); p.wage = 2; p.val = calcValue(p); G.players[p.id] = p; G.sq[id].push(p.id); }
  }
}
function ensureLegendPlayers() {
  ensureLegends();
  if (!G.legXI || !G.legXI.every(id => P(id))) {
    const mk = (x, i, k) => { const p = mkPlayer({ n: x[0], pos: x[1], ca: x[2], pa: x[2], age: 28, nat: LEG_NAT[x[0]] || 'ENG', c: 'ARL', seed: 100 + i + k * 20, ab: x[3], abv: 50, leg: 1, con: 9999 }); p.wage = 0; p.no = k === 1 ? i + 1 : i + 12; G.players[p.id] = p; return p.id; };
    G.legXI = LEG_ORDER1.map((j, i) => mk(LEGENDS_XI[j], i, 1)); G.legSubs = LEG_ORDER2.map((j, i) => mk(LEGENDS_SUBS[j], i, 2));
  }
  // forever in their prime: undo ageing, form and injuries every time
  const all = LEGENDS_XI.concat(LEGENDS_SUBS); const ids = G.legXI.concat(G.legSubs);
  ids.forEach((id, i) => { const p = P(id); const x = (i < 11 ? LEGENDS_XI[LEG_ORDER1[i]] : LEGENDS_SUBS[LEG_ORDER2[i - 11]]); Object.assign(p, { c: 'ARL', age: 28, ca: x[2], pa: x[2], inj: 0, injT: '', sus: 0, cond: 100, mor: 85, leg: 1, listed: false }); });
  G.sq.ARL = ids.slice();
}
// legends are never called up by national teams
const _npPS = natPool;
natPool = function (c) { return _npPS(c).filter(p => !p.leg); };
// Arsenal Legends: estimated prime-years ability; ab = attribute bonuses for their trademark strengths
const LEGENDS_XI = [
  ['Jens Lehmann', 'GK', 86, { Ref: 2, OvO: 2 }], ['Lauren', 'RB', 83, { Sta: 2, Tck: 1 }], ['Sol Campbell', 'CB', 88, { Str: 3, Hea: 2, Tck: 1 }], ['Kolo Touré', 'CB', 85, { Pac: 2, Tck: 2 }], ['Thomas Vermaelen', 'LB', 83, { Hea: 2, Lon: 1 }],
  ['Freddie Ljungberg', 'RW', 85, { Sta: 2, Fin: 2 }], ['Patrick Vieira', 'CM', 92, { Tck: 2, Str: 3, Sta: 2, Pas: 1 }], ['Gilberto Silva', 'DM', 86, { Pos: 3, Tea: 3 }], ['Robert Pirès', 'LW', 89, { Cre: 2, Crs: 2, Fla: 2 }],
  ['Dennis Bergkamp', 'AM', 91, { Fla: 5, Cre: 4, Pas: 3 }], ['Thierry Henry', 'ST', 94, { Pac: 3, Fin: 3, Fla: 2, Dri: 2 }]
];
const LEGENDS_SUBS = [
  ['David Seaman', 'GK', 88, { Han: 2, Pos: 2 }], ['Lee Dixon', 'RB', 84, { Pos: 2, Sta: 1 }], ['Martin Keown', 'CB', 86, { Mar: 3, Tck: 2 }], ['Tony Adams', 'CB', 89, { Hea: 3, Det: 3, Pos: 2 }], ['Nigel Winterburn', 'LB', 83, { Tea: 2, Sta: 2 }],
  ['Tomáš Rosický', 'CM', 85, { Pas: 3, Fla: 2 }], ['Aaron Ramsey', 'CM', 85, { Sta: 3, Fin: 1 }], ['Santi Cazorla', 'CM', 88, { Pas: 3, Cre: 3, Dri: 2 }], ['Mesut Özil', 'AM', 90, { Cre: 5, Pas: 3 }],
  ['Alexis Sánchez', 'ST', 89, { Det: 3, Dri: 2, Sta: 2 }], ['Ian Wright', 'ST', 89, { Fin: 4, Pac: 2 }]
];
// order matches the 4-4-2 slots: GK DR DC DC DL MR MC MC ML FC FC
const LEG_ORDER1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LEG_ORDER2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // GK Dixon Keown Adams Winterburn | Rosicky(MR) Ramsey Cazorla Özil(ML) | Alexis Wright
function legP(x, i, k) { return { id: 'lg' + k + i, n: x[0], pseudo: true, leg: true, pos: x[1], ca: x[2], age: 28, mor: 85, cond: 100, seed: 100 + i + k * 20, ab: x[3], abv: 50 }; }
function ensureLegends() {
  if (!G.teams.ARL) { addLite('ARL', 'Arsenal Legends', 88, 'Emirates Stadium', 60704); }
  Object.assign(G.teams.ARL, { leg: true, short: 'Arsenal Legends', c1: '#db0007', c2: '#ffffff', str: 88, stadium: 'Emirates Stadium', cap: 60704 });
}
function ensureAsia() { for (const k in ASIA) { const a = ASIA[k], id = 'AS_' + k; if (!G.teams[id]) addLite(id, a.n, a.str, a.ven, a.cap); else G.teams[id].str = a.str; } }
const _mkSidePS = mkSide;
mkSide = function (tid, home) {
  const t = T(tid);
  if (t && t.leg) {
    const S = _mkSidePS(tid, home); // pseudo side with the right shape, then put the legends in a 4-4-2
    const slots = FORMS['4-4-2'];
    ensureLegendPlayers(); const L1 = G.legXI.map(P), L2 = G.legSubs.map(P); for (const p of L1.concat(L2)) p.cond = 100;
    S.form = '4-4-2'; S.ps = slots.map((s, i) => ({ p: L1[i], role: s[0], pr: DEF_PR[s[0]], x: s[1], y: s[2], on: true, rt: 6.3, g: 0, as: 0, yc: 0, rc: 0, inj: false, mins: 0, subOn: 0 }));
    S.bench = []; S.subs = 0; S.windows = 0; S.leg2 = L2;
    S.tac = Object.assign(S.tac, { ment: 4, press: 3, tempo: 3, pass: 2 });
    return S;
  }
  if (t && t.lite && tid.startsWith('AS_') && ASIA_SQ[tid.slice(3)]) return rosterSide(_mkSidePS(tid, home), tid.slice(3));
  return _mkSidePS(tid, home);
};
const _stepPS = stepMinute;
stepMinute = function (M) {
  const r = _stepPS(M);
  if (M.min >= 46 && !M.legSwap) for (let s = 0; s < 2; s++) { const S = M.sides[s]; if (!S.leg2) continue; M.legSwap = true; const old = S.ps.filter(e => e.on); old.forEach((e, i) => { const np = S.leg2[i]; if (!np) return; e.on = false; S.ps.push({ p: np, role: e.role, pr: e.pr, x: e.x, y: e.y, on: true, rt: 6.3, g: 0, as: 0, yc: 0, rc: 0, inj: false, mins: 0, subOn: 46 }); }); try { units(S); } catch (e) { } say(M, 46, 'tac', `Eleven changes for Arsenal Legends at half-time: ${S.leg2.map(p => p.n.split(' ').slice(-1)[0]).join(', ')} come on.`, s); }
  return r;
};

// ---------- scheduling ----------
function psFirstComp() { const fs = Object.values(G.fx).filter(f => (f.h === G.user || f.a === G.user) && !f.r && f.comp !== 'PSF').map(f => f.d).sort(); return fs[0] || sd('2026-08-22'); }
function psFree() {
  const first = psFirstComp(); const used = new Set(Object.values(G.fx).filter(f => f.h === G.user || f.a === G.user).map(f => f.d));
  return PS_DATES.map(sd).filter(d => d > addDays(G.date, 1) && d <= addDays(first, -3) && !used.has(d) && ![...used].some(u => Math.abs(dDiff(u, d)) < 3));
}
function psFx(o) { const f = addFx(Object.assign({ comp: 'PSF', ed: 'PSF' }, o)); return f; }
function psList() { return Object.values(G.fx).filter(f => f.comp === 'PSF' && (f.h === G.user || f.a === G.user)).sort((a, b) => a.d.localeCompare(b.d)); }
function scheduleLegends() {
  if (!G.user || !T(G.user) || T(G.user).nat || T(G.user).lite) return;
  ensureLegends(); if (psList().some(f => f.h === 'ARL' || f.a === 'ARL')) return;
  const free = psFree(); if (!free.length) return;
  const d = free.includes(sd('2026-08-08')) ? sd('2026-08-08') : free[free.length - 1];
  const arsHome = G.user === 'ARS';
  psFx({ d, h: arsHome ? 'ARS' : 'ARL', a: arsHome ? 'ARL' : G.user, rnd: 'Arsenal Legends match', ven: 'Emirates Stadium', vcap: 60704, leg: 1 });
  news('Arsenal Legends', `${tName(G.user, false)} will face Arsenal Legends at the Emirates Stadium on ${dNice(d, false)}: Lehmann, Lauren, Campbell, Touré, Vermaelen, Ljungberg, Vieira, Gilberto, Pirès, Bergkamp and Henry start, with Seaman, Dixon, Keown, Adams, Winterburn, Rosický, Ramsey, Cazorla, Özil, Alexis and Wright playing the second half. (Game scenario; ratings are estimates of their prime years.)`, G.user, true);
}
function psSetup() {
  if (!G || !G.user || !T(G.user) || T(G.user).nat || T(G.user).lite) return;
  if (G.ps && G.ps.y === G.year) return;
  G.ps = { y: G.year, tour: null, boost: 0 };
  ensureAsia(); scheduleLegends();
  if (G.psAuto) assistantFriendlies(true);
  else msg('Pre-season', `Pre-season friendlies: arrange your own, let your assistant do it, or take the squad on an Asia Tour (Selangor, Japan, Singapore, Hong Kong, China). See Fixtures › Pre-season. The annual Arsenal Legends match is already in the diary.`);
}
const _bsPS = buildSeason;
buildSeason = function () { _bsPS(); try { G.ps = null; ensureAsiaPlayers(); ensureLegendPlayers(); psSetup(); } catch (e) { console.error(e); } };
function psOppPool() {
  const u = G.user; const d = divOf(u);
  return fullTeams().filter(t => t !== u).sort((a, b) => (T(b).rep || 0) - (T(a).rep || 0));
}
function assistantFriendlies(auto) {
  const free = psFree(); if (!free.length) return 0;
  const pool = psOppPool(); const u = G.user; const r = T(u).rep || 70;
  const near = pool.filter(t => Math.abs((T(t).rep || 70) - r) <= 6), lower = pool.filter(t => (T(t).rep || 70) < r - 8);
  const picks = [];
  const take = (arr) => { const c = R.shuffle(arr.filter(t => !picks.includes(t))); if (c.length) picks.push(c[0]); };
  take(lower); take(lower); take(near); if (r >= 82) take(pool.filter(t => (T(t).rep || 0) >= 84));
  const ds = free.filter((d, i) => i % 1 === 0).slice(0, picks.length); let n = 0;
  ds.forEach((d, i) => { const opp = picks[i]; if (!opp || (G.byDate[d] || []).some(id => [G.fx[id].h, G.fx[id].a].includes(opp))) return; const home = i % 2 === 0; psFx({ d, h: home ? u : opp, a: home ? opp : u, rnd: 'Pre-season friendly' }); n++; });
  const a = G.staff && G.staff.asst; const an = (a && a.n) || 'Your assistant';
  if (n) msg('Pre-season friendlies', `${an} has arranged ${n} friendl${n > 1 ? 'ies' : 'y'}: ${psList().filter(f => !(f.h === 'ARL' || f.a === 'ARL')).map(f => `${tName(f.h === u ? f.a : f.h)} (${f.h === u ? 'H' : 'A'}, ${dNice(f.d, false)})`).join(', ')}.${auto ? ' (Assistant arranges every pre-season: change this in Fixtures › Pre-season.)' : ''}`);
  return n;
}
function bookTour(stops, start) {
  if (G.ps.tour) return toast('You are already going on a tour this summer.');
  const free = psFree().filter(d => d >= start); const u = G.user;
  if (free.length < stops.length) return toast('Not enough free dates after that start date.');
  ensureAsia(); const ms = [];
  stops.forEach((k, i) => { const a = ASIA[k]; const f = psFx({ d: free[i], h: 'AS_' + k, a: u, rnd: `Asia Tour: ${a.c}`, ven: a.ven, vcap: a.cap, tour: k }); ms.push(f.id); });
  const fee = stops.reduce((s, k) => s + tourFee(k), 0);
  G.ps.tour = { stops, ms, fee };
  news('Asia Tour', `${tName(u, false)} announce a pre-season Asia Tour: ${stops.map((k, i) => `${ASIA[k].n} (coach ${ASIA_SQ[k].coach}) at the ${ASIA[k].ven} (${dNice(free[i], false)})`).join(', ')}. Expected appearance fees about ${money(fee)}, plus a lift in global popularity and commercial income.`, u, true);
  try { fanPost(u, R.pick([`ASIA TOUR 🌏✈️ ${stops.map(k => ASIA[k].flag).join('')} Let's go!!`, `Asia Tour confirmed. ${stops.includes('SEL') ? 'See you in Petaling Jaya, Selangor fans 🔴🟡' : 'Our fans out there are the best'}`]), { u: 1, big: true }); } catch (e) { }
}
function tourFee(k) { const r = (T(G.user).rep || 70) / 100; return Math.round(Math.pow(r, 3) * 4.5 * ASIA[k].f * 10) / 10; }

// ---------- results: no stats, money and popularity ----------
const _finPS = finalizeMatch;
finalizeMatch = function (M) {
  if (M.comp !== 'PSF') return _finPS(M);
  const keep = [];
  for (const S of M.sides) { const t = T(S.tid); if (!t || t.lite) continue; for (const p of squad(S.tid)) keep.push([p, JSON.stringify(p.st), JSON.stringify(p.car), p.yel, p.sus, JSON.stringify(p.form), p.mor]); }
  const r = _finPS(M);
  for (const [p, st, car, yel, sus, form, mor] of keep) { p.st = JSON.parse(st); p.car = JSON.parse(car); p.yel = yel; p.sus = sus; p.form = JSON.parse(form); p.mor = clamp((mor + p.mor) / 2, 5, 100); }
  return r;
};
const _bdPS = boardReact;
boardReact = function (f) { if (f.comp === 'PSF') return; return _bdPS(f); };
const _pmPS = postMatch;
postMatch = function (f, pre) {
  if (f.comp !== 'PSF') return _pmPS(f, pre);
  const keepSus = squad(G.user).map(p => [p, p.sus]);
  _pmPS(f, pre); for (const [p, s] of keepSus) p.sus = s; // friendlies do not serve suspensions
  try {
    const u = G.user; const t = T(u); if (!t || (f.h !== u && f.a !== u)) return;
    const home = f.h === u; const gf = home ? f.r[0] : f.r[1], ga = home ? f.r[1] : f.r[0];
    t.fin.in.fr = t.fin.in.fr || 0;
    if (f.tour) {
      const fee = tourFee(f.tour); t.bal += fee; t.fin.in.fr += fee;
      t.rep = Math.min(96, (t.rep || 70) + .5); G.fans = clamp((G.fans ?? 60) + 1.5, 0, 100); G.ps.boost = (G.ps.boost || 0) + .02;
      for (const p of squad(u)) p.cond = Math.max(60, (p.cond || 100) - 3); // travel
      const a = ASIA[f.tour];
      news(`Asia Tour: ${a.c}`, `${f.att || Math.round(a.cap * .92).toLocaleString('en-GB')} fans packed the ${a.ven} to watch ${tName(u)} ${gf > ga ? 'beat' : gf < ga ? 'lose to' : 'draw with'} ${a.n} ${gf}-${ga}. The club receives an appearance fee of ${money(fee)}; club reputation, fan mood and commercial income all get a lift. Players feel the travel a little.`, u);
      fanPost(u, R.pick([`The atmosphere in ${a.c} was unreal 😭🔥 ${a.flag}`, `${a.c} fans are on another level. Respect ${a.flag}`, `Tour vibes ${a.flag} ${gf}-${ga}, fitness building nicely`, `Imagine having this many fans in ${a.c} ${a.flag}. Global club ykb`]), { u: 1 });
      if (f.id === G.ps.tour.ms[G.ps.tour.ms.length - 1]) msg('Asia Tour complete', `The Asia Tour is over: ${money(G.ps.tour.stops.reduce((s, k) => s + tourFee(k), 0))} in appearance fees, a reputation lift and commercial income up about ${Math.round(G.ps.boost * 100)}% for the season.`);
    } else if (f.leg) {
      const fee = 1; t.bal += fee; t.fin.in.fr += fee; G.fans = clamp((G.fans ?? 60) + 2, 0, 100);
      news('Arsenal Legends', `${tName(f.h)} ${f.r[0]}-${f.r[1]} ${tName(f.a)} at the Emirates Stadium. A full house enjoyed one more look at Henry, Bergkamp, Vieira and Pirès in the first half and Wright, Özil, Cazorla and Alexis in the second. ${u === 'ARS' ? '' : `${tName(u)} receive an appearance fee of ${money(fee)}.`}`, u, true);
      const p = fanPost(u, gf > ga ? R.pick([`We beat the Invincibles era. Frame it 🖼️`, `Beat Arsenal Legends ${gf}-${ga}. Pre-season, but still. History 😤`]) : R.pick([`Bergkamp is still HIM 🥶`, `Henry in his prime is just unfair fr`, `Got cooked by Arsenal Legends 💀 ${gf}-${ga}`]), { u: 1, big: true });
      reply(p, 'ARS', R.pick(['Invincibles. Gold trophy. Enough said 🏆✨', 'Thierry Henry. That\'s the tweet', 'Ykb 🔴⚪']));
    } else if (!home) {
      const fee = Math.round(Math.pow(Math.max(.1, ((t.rep || 70) - 60) / 40), 2) * 2.5 * 10) / 10;
      if (fee >= .1) { t.bal += fee; t.fin.in.fr += fee; }
    }
  } catch (e) { console.error(e); }
};
const _venPS = venueOf;
venueOf = function (f) { if (f && f.comp === 'PSF' && f.ven) return { name: f.ven, cap: f.vcap || 40000, neutral: !!f.tour, stands: STANDS_DEF }; return _venPS(f); };
// the tour's commercial lift: extra commercial income every week for the rest of the season
const _wkPS = weekly;
weekly = function () {
  _wkPS.apply(this, arguments);
  try { const t = T(G.user); if (G.ps && G.ps.y === G.year && G.ps.boost && t && !t.lite) { const x = Math.pow((t.rep || 70) / 100, 4) * 2.5 * G.ps.boost; t.bal += x; t.fin.in.com += x; } } catch (e) { console.error(e); }
};
// friendlies are not in the losing-streak count or form guide banter
const _rvsPS = rvStreak;
rvStreak = function (tid) { const fs = Object.values(G.fx).filter(x => x.r && x.comp !== 'PSF' && (x.h === tid || x.a === tid)).sort((a, b) => b.d.localeCompare(a.d)); let n = 0; for (const x of fs) { if (rvResult(x, tid) === 'L') n++; else break; } return n; };

// ---------- screen: Fixtures › Pre-season ----------
function psHtml() {
  psSetup();
  const u = G.user, free = psFree(), list = psList();
  const opp = psOppPool();
  const groups = {}; for (const t of opp) { const d = divOf(t) || 'Other'; (groups[d] = groups[d] || []).push(t); }
  const DN = { PL: 'Premier League', CH: 'Championship', LL: 'La Liga', SA: 'Serie A', BL: 'Bundesliga', L1: 'Ligue 1', SPL: 'Saudi Pro League' };
  const ft = list.length ? `<div class="tw"><table class="t"><thead><tr><th>Date</th><th>Opponent</th><th>Venue</th><th class="c">Result</th></tr></thead><tbody>${list.map(f => { const home = f.h === u, o = home ? f.a : f.h; return `<tr><td class="mono">${dShort(f.d)}</td><td>${f.tour ? ASIA[f.tour].flag + ' ' : ''}${tLink(o, true)}${f.leg ? ' <span class="yel" style="font-size:11px">LEGENDS</span>' : ''}</td><td class="dim">${esc(f.ven || (home ? T(u).stadium : T(o).stadium) || '')}</td><td class="c mono">${f.r ? f.r.join('-') : ''}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="dim">No friendlies yet.</p>';
  const pre = psFirstComp() > G.date;
  const tour = G.ps && G.ps.tour;
  const tourBox = tour ? `<div class="box pad" style="margin-top:8px"><b>Asia Tour booked</b>: ${tour.stops.map(k => ASIA[k].flag + ' ' + ASIA[k].c).join(' → ')}. Appearance fees about ${money(tour.fee)}.</div>` : `<div class="box pad" style="margin-top:8px"><h3 class="h3">Asia Tour ✈️</h3><p class="dim" style="font-size:12.5px;margin:0 0 6px">Pick up to four stops. Each match pays an appearance fee (bigger clubs earn more) and lifts the club's reputation, fan mood and commercial income for the season. The players feel the travel a little.</p>
    <div class="row" style="flex-wrap:wrap;gap:6px">${Object.keys(ASIA).map(k => `<label class="btn" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" class="pstour" value="${k}"> ${ASIA[k].flag} ${ASIA[k].c} <span class="dim">v ${esc(ASIA[k].n)} · ~${money(tourFee(k))}</span></label>`).join('')}</div>
    <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center"><label class="lb" for="pstd" style="margin:0">Leave on</label><select class="f" id="pstd">${free.map(d => `<option value="${d}">${dNice(d, true)}</option>`).join('') || '<option value="">No free dates</option>'}</select><button class="btn pri" data-a="pstour">Book the tour</button></div></div>`;
  return `<div class="box pad" style="margin-bottom:10px"><h2 class="sect" style="margin-top:0">Pre-season ${seasonLabel(G.year)}</h2>
  ${ft}
  ${pre ? `<h3 class="h3" style="margin-top:10px">Arrange a friendly</h3><div class="row" style="gap:8px;flex-wrap:wrap"><select class="f" id="psd" aria-label="Date">${free.map(d => `<option value="${d}">${dNice(d, true)}</option>`).join('') || '<option value="">No free dates</option>'}</select><select class="f" id="pso" aria-label="Opponent">${Object.keys(groups).map(g => `<optgroup label="${DN[g] || g}">${groups[g].map(t => `<option value="${t}">${esc(T(t).name)}</option>`).join('')}</optgroup>`).join('')}</select><select class="f" id="psv" aria-label="Venue"><option value="h">Home</option><option value="a">Away</option></select><button class="btn pri" data-a="psok">Arrange</button></div>
  <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center"><button class="btn" data-a="psasst">Let my assistant arrange them</button><label class="dim" style="font-size:12.5px;display:inline-flex;gap:6px;align-items:center"><input type="checkbox" data-ps="auto" ${G.psAuto ? 'checked' : ''}> Assistant arranges every pre-season</label></div>
  ${tourBox}` : '<p class="dim" style="font-size:12.5px">Pre-season is over. Friendlies can be arranged again next summer.</p>'}
  <p class="dim" style="font-size:12px;margin-top:8px">Friendlies do not count towards stats, cards, form or the board's confidence. Arsenal Legends play every pre-season: ratings are game estimates of their prime years.</p></div>`;
}
const _fxPS = scrFixtures;
scrFixtures = function () {
  const h = _fxPS(); if (!(psFirstComp() > G.date) || !T(G.user) || T(G.user).nat) return h;
  if ((UI.tab.fx || 'mine') !== 'mine') return h;
  const i = h.indexOf('<div class="tw">'); return i > 0 ? h.slice(0, i) + psHtml() + h.slice(i) : h + psHtml();
};
Object.assign(ACT, {
  psok: () => {
    const d = ($('#psd') || {}).value, o = ($('#pso') || {}).value, v = ($('#psv') || {}).value; if (!d || !o) return toast('No free date.');
    if ((G.byDate[d] || []).some(id => [G.fx[id].h, G.fx[id].a].includes(o))) return toast(`${tName(o)} already play that day.`);
    const home = v !== 'a'; psFx({ d, h: home ? G.user : o, a: home ? o : G.user, rnd: 'Pre-season friendly' });
    news('Friendly arranged', `${tName(G.user, false)} will play ${T(o).name} ${home ? 'at home' : 'away'} on ${dNice(d, false)}.`, G.user);
    autosave(); toast('Friendly arranged.'); render();
  },
  psasst: () => { const n = assistantFriendlies(false); toast(n ? `Your assistant arranged ${n} friendlies.` : 'No free dates left.'); autosave(); render(); },
  pstour: () => {
    const stops = [...document.querySelectorAll('.pstour:checked')].map(x => x.value).slice(0, 4); const d = ($('#pstd') || {}).value;
    if (!stops.length) return toast('Pick at least one stop.'); if (!d) return toast('No free date.');
    bookTour(stops, d); autosave(); render();
  }
});
document.addEventListener('change', (ev) => { const el = ev.target; if (el && el.dataset && el.dataset.ps === 'auto') { G.psAuto = !!el.checked; autosave(); toast(G.psAuto ? 'Your assistant will arrange friendlies every pre-season.' : 'You will arrange friendlies yourself.'); } });
// older saves still in pre-season get the set-up when loaded
const _rsPSF = restore;
restore = function (obj) { _rsPSF(obj); try { if (G && G.user && T(G.user)) { ensureAsiaPlayers(); ensureLegendPlayers(); } } catch (e) { console.error(e); } try { if (G && G.user && !G.ps && psFirstComp() > addDays(G.date, 3)) psSetup(); } catch (e) { console.error(e); } };

// ---------- club pop-up with the squad, player pop-up notes, signing tour players ----------
const _cmPS = clubModal;
clubModal = function (tid) {
  const t = T(tid); if (t && t.leg) ensureLegendPlayers(); if (!t || !(t.leg || String(tid).startsWith('AS_')) || !squad(tid).length) return _cmPS(tid);
  const fs = Object.values(G.fx).filter(f => (f.h === tid || f.a === tid)).sort((a, b) => a.d < b.d ? -1 : 1);
  const sq = t.leg ? G.legXI.concat(G.legSubs).map(P) : squad(tid).sort((a, b) => (POS_ORDER[a.pos] ?? 9) - (POS_ORDER[b.pos] ?? 9) || b.ca - a.ca);
  const row = (p, i) => `<tr${t.leg && i === 11 ? ' style="border-top:2px solid var(--line,#555)"' : ''}><td class="mono dim">${t.leg ? (i < 11 ? 'XI' : '2H') : (p.no || '')}</td><td>${pLink(p.id)}</td><td class="mono">${POS_LABEL[p.pos] || p.pos}</td><td class="n">${p.age}</td><td class="mono dim">${esc(p.nat || '—')}</td><td class="n">${p.ca}</td>${t.leg ? '' : `<td class="n">${money(calcValue(p))}</td>`}</tr>`;
  UI.modal = `<div class="band"><span>${badge(tid)} ${esc(t.name)}</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">
    <dl class="kv"><dt>${t.leg ? 'Venue' : 'Stadium'}</dt><dd>${esc(t.stadium)} · ${(t.cap || 0).toLocaleString('en-GB')}</dd>${t.coach ? `<dt>Head coach</dt><dd>${esc(t.coach)}</dd>` : ''}<dt>Team strength</dt><dd>${Math.round(t.str || 0)}</dd></dl>
    <p class="dim" style="font-size:12.5px">${t.leg ? 'Arsenal Legends in their prime: XI plays the first half, the second eleven (2H) the second half. Ratings are game estimates; legends cannot be signed.' : 'Real squad; ratings and some ages are game estimates. Tap a player to view, compare or sign him.'}</p>
    <h2 class="sect">Squad</h2><div class="tw"><table class="t"><thead><tr><th>#</th><th>Name</th><th>Pos</th><th class="n">Age</th><th>Nat</th><th class="n">Rating</th>${t.leg ? '' : '<th class="n">Value</th>'}</tr></thead><tbody>${sq.map(row).join('')}</tbody></table></div>
    ${fs.length ? `<h2 class="sect">Matches this season</h2><div class="tw">${resTable(fs)}</div>` : ''}</div>`;
  render();
};
function asiaFee(p) { return Math.max(.2, Math.round(calcValue(p) * 1.15 * 10) / 10); }
function signAsia(pid) {
  const p = P(pid); if (!p || !String(p.c).startsWith('AS_')) return { ok: false, msg: 'He is no longer available.' };
  const u = userTeam(); const fee = asiaFee(p); const club = tName(p.c);
  if (!G.window) return { ok: false, msg: 'You can only sign players while a window is open.' };
  if (fee > u.tb) return { ok: false, msg: `${club} want ${money(fee)}, more than your budget (${money(u.tb)}).` };
  const w = Math.max(wageFor(p, G.user), Math.round((p.wage || 0) * 1.2));
  if (wageBill(G.user) + w > u.wb + .5) return { ok: false, msg: `He wants ${wageStr(w)}. Not enough room in the wage budget.` };
  const from = p.c; G.sq[from] = (G.sq[from] || []).filter(x => x !== pid);
  completeTransfer(p, G.user, fee, w, p.age >= 30 ? 2 : 4);
  news('Transfer', `${p.n} joins ${u.name} from ${club} for ${money(fee)}.`, G.user, true);
  try { fanPost(G.user, R.pick([`Signing ${p.n} from ${club}?? Scouting department cooking 🍳`, `${p.n} from ${club}. Hidden gem or tour souvenir? 🤔`])); } catch (e) { }
  return { ok: true, msg: `${p.n} signs from ${club} for ${money(fee)}.` };
}
ACT.signas = (v) => { const r = signAsia(v); toast(r.msg); if (r.ok) { UI.modal = null; autosave(); } render(); };
const _pmPS2 = playerModal;
playerModal = function (pid) {
  try { const q = P(pid); if (q && q.leg) ensureLegendPlayers(); } catch (e) { }
  _pmPS2(pid);
  try {
    const p = P(pid); if (!p || !UI.modal) return;
    const k = '<div class="row" style="margin-top:14px">'; const i = UI.modal.lastIndexOf(k);
    if (p.leg) { const note = `<p class="dim" style="font-size:12.5px;margin-top:8px">Arsenal Legends · rating from his prime years (game estimate) · not available to sign.</p>`; UI.modal = i >= 0 ? UI.modal.slice(0, i) + note + UI.modal.slice(i) : UI.modal; render(); return; }
    if (String(p.c).startsWith('AS_') && !T(G.user).nat && i >= 0) { UI.modal = UI.modal.slice(0, i + k.length) + `<button class="btn pri" data-a="signas" data-v="${pid}">Sign from ${esc(tName(p.c))} · ${money(asiaFee(p))}</button>` + UI.modal.slice(i + k.length); render(); }
  } catch (e) { console.error(e); }
};

// ---------- club colours, Legends managers, gold trophy on show at the Legends match ----------
const ASIA_KIT = { SEL: ['#d71920', '#ffd200'], JPN: ['#0047ab', '#ffffff'], SGP: ['#0a3d91', '#ffffff'], HKG: ['#1c4c9c', '#ffffff'], CHN: ['#c8102e', '#ffffff'] };
function kitAsia() { for (const k in ASIA_KIT) { const t = T('AS_' + k); if (t) { t.c1 = ASIA_KIT[k][0]; t.c2 = ASIA_KIT[k][1]; } } const L = T('ARL'); if (L) { L.coach = 'Arsène Wenger & Mikel Arteta'; L.mgr = L.coach; } }
const _eapPS = ensureAsiaPlayers; ensureAsiaPlayers = function () { _eapPS(); kitAsia(); };
const _elpPS = ensureLegendPlayers; ensureLegendPlayers = function () { _elpPS(); kitAsia(); };
function goldTrophySvg(h) {
  return `<svg viewBox="0 0 64 80" width="${h * .8}" height="${h}" role="img" aria-label="Gold trophy"><defs><linearGradient id="gtg" x1="0" x2="1"><stop offset="0" stop-color="#8a6a12"/><stop offset=".45" stop-color="#ffe07a"/><stop offset="1" stop-color="#a77c14"/></linearGradient></defs>
  <path d="M14 8h36v14c0 12-8 20-18 20S14 34 14 22z" fill="url(#gtg)"/><path d="M14 12H6c0 10 4 15 10 16M50 12h8c0 10-4 15-10 16" fill="none" stroke="url(#gtg)" stroke-width="3"/>
  <path d="M18 4l4 5 5-6 5 6 5-6 5 6 4-5v6H18z" fill="url(#gtg)"/><rect x="28" y="42" width="8" height="14" fill="url(#gtg)"/><path d="M20 56h24l3 10H17z" fill="url(#gtg)"/><rect x="14" y="66" width="36" height="8" rx="1" fill="#2a2a2a"/><rect x="18" y="68" width="28" height="4" fill="url(#gtg)" opacity=".8"/></svg>`;
}
function goldCard() {
  return `<div class="box pad gold-show" style="display:flex;gap:12px;align-items:center;margin:8px 0;border-color:#c9a227">${goldTrophySvg(64)}<div><b style="color:#e8c547">On display: the gold Premier League trophy</b><div class="dim" style="font-size:12.5px">Presented to Arsenal for going the 2003/04 league season unbeaten. Wenger's Invincibles, with Arteta alongside him in the Legends dugout today.</div></div></div>`;
}
const _rmPS = renderMatch;
renderMatch = function () {
  _rmPS.apply(this, arguments);
  try { const LM = UI.match; if (!LM || !LM.M) return; const f = G.fx[LM.M.fid || LM.fid]; const leg = (f && f.leg) || LM.M.sides.some(S => T(S.tid) && T(S.tid).leg); if (!leg) return; const sc = document.querySelector('.score'); if (sc && !document.querySelector('.gold-show')) sc.insertAdjacentHTML('afterend', goldCard()); } catch (e) { console.error(e); }
};
const _cmPS2 = clubModal;
clubModal = function (tid) { _cmPS2(tid); try { if (T(tid) && T(tid).leg && UI.modal) { UI.modal = UI.modal.replace('<h2 class="sect">Squad</h2>', goldCard() + '<h2 class="sect">Squad</h2>').replace('<dt>Head coach</dt>', '<dt>Managers</dt>'); render(); } } catch (e) { console.error(e); } };
