// rivalry.js: louder WUPH.com, longer news and two money streams. Loaded after compare.js.
//  1. Fan banter: club insecurities and the comebacks to them (counts come from the real honours lists plus this
//     save, so a jibe changes when a club wins the trophy in the game), name-calling (Judas, rat, finished, Netflix
//     FC), hate-watching rivals, ex-players facing their old club, Gen Z slang.
//  2. Fictional pundits now have former clubs, and fans call out the bias.
//  3. News: long write-ups for trophy winners and for headline transfers (with shirt sales).
//  4. Finance: shirt sales from big signings, a choice of shirt sponsor with perks and clauses.
//  5. Honours: the Premier League gold trophy for an unbeaten title season (Arsenal 2003/04, plus this save).
// Fans, pundits and sponsors are invented. Jibes are fan opinion in a game, never presented as fact.

// ---------- pundits' former clubs ----------
const PUNDIT_CLUBS = { rk: ['MUN', 'CHE'], ds: ['ARS', 'INT'], wo: ['LIV', 'BAY'], pd: ['ACM', 'MCI'], ar: ['RMA', 'LIV'], mb: ['INT', 'JUV'], ta: ['TOT', 'ARS'], lb: ['BAY', 'BVB'] };
PUNDITS.push(
  { k: 'mb', n: 'Marco Bellandi', h: '@MarcoBellandi8', o: 'former Italy midfielder', st: 'hot' },
  { k: 'ta', n: 'Tyrone Asante', h: '@TyroneAsante11', o: 'former winger', st: 'banter' },
  { k: 'lb', n: 'Lukas Brenner', h: '@LukasBrenner1', o: 'former Germany goalkeeper', st: 'blunt' }
);
const PUNDIT_CN = { MUN: 'Man Utd', CHE: 'Chelsea', ARS: 'Arsenal', INT: 'Inter', LIV: 'Liverpool', BAY: 'Bayern', ACM: 'AC Milan', MCI: 'Man City', RMA: 'Real Madrid', JUV: 'Juventus', TOT: 'Spurs', BVB: 'Dortmund' };
for (const p of PUNDITS) { const c = PUNDIT_CLUBS[p.k]; if (c && !p.cl) { p.cl = c; p.o += ` (ex-${c.map(x => PUNDIT_CN[x]).join(', ')})`; } }
let _pvTeams = null;
const _pundRV = pundit;
pundit = function (es, not) {
  if (_pvTeams && R.chance(.7)) { const pool = PUNDITS.filter(p => p.k !== not && p.cl && p.cl.some(c => _pvTeams.includes(c))); if (pool.length) return R.pick(pool); }
  return _pundRV(es, not);
};
const _pvRV = punditVerdict;
punditVerdict = function (r, sUser) {
  _pvTeams = [r.f.h, r.f.a]; const before = G.feedId || 0;
  try { _pvRV(r, sUser); } finally { _pvTeams = null; }
  try {
    const p = feed()[0]; if (!p || p.id <= before || p.k !== 'pun') return;
    const pd = PUNDITS.find(x => x.n === p.a); const ex = pd && pd.cl && pd.cl.find(c => c === r.f.h || c === r.f.a); if (!ex) return;
    const other = ex === r.f.h ? r.f.a : r.f.h;
    reply(p, other, R.pick([`Ex-${tName(ex)} player defending ${tName(ex)}. Shocking. Truly shocking 🙄`, `Bias much? You played for them for years mate`, `Take the ${tName(ex)} scarf off before you go on air 🧣`, `${p.a.split(' ')[0]} still thinks he's in the ${tName(ex)} dressing room 💀`, `Least biased ${tName(ex)} legend 😂`]));
    if (R.chance(.5)) reply(p, ex, R.pick(['He actually knows ball, unlike you', `${p.a.split(' ')[0]} won more than your whole club tbh`, 'Ratio + he played at the top level + you didn\'t']));
  } catch (e) { console.error(e); }
};

// ---------- Gen Z slang ----------
const GZ_END = [' fr', ' fr fr', ' no cap', ' ngl', ' 💀', ' ikr', ' ykb', ' (respectfully)', ' lowkey', ' highkey', ' and that\'s on period', ' it\'s giving relegation', ' 😭😭', ' I\'m crying', ' bro is cooked', ' ✋😐🤚', ' not the {opp} fans coping'];
const GZ_START = ['Nah ', 'Bro ', 'Y\'all ', 'Lowkey ', 'Not gonna lie, ', 'The way ', 'POV: ', 'Ngl '];
const GZ_REPLY = ['ykb 🤷', 'IKR', 'Fr fr', 'Y tho', 'No cap', 'Who let him cook 😭', 'This is copium', 'Hopium levels are insane', 'Touch grass', 'You don\'t know ball', 'Ratio', 'L take', 'Mid', 'Stop glazing', 'Rent free 🏠', 'Delulu is not the solulu', 'Source: trust me bro', 'Ok and? 🤷', 'NPC take', 'Aura -1000', '"If" is doing a LOT of heavy lifting there', 'If my grandma had wheels she\'d be a bike 🚲', 'And if your aunt had a moustache she\'d be your uncle 🥸', 'Sir, this is a Wendy\'s', 'Bro woke up and chose violence 💀', 'He\'s HIM and you know it'];
function genz(t) {
  if (!t || /^(🚨|LIVE|FULL-TIME)/.test(t) || !R.chance(.3)) return t;
  if (R.chance(.35)) { const s = R.pick(GZ_START); return s + t[0].toLowerCase() + t.slice(1); }
  return t.replace(/[.!]?\s*$/, '') + R.pick(GZ_END).replace(' not the {opp} fans coping', ' 😂');
}
const _fpRV = fanPost;
fanPost = function (tid, text, extra) { return _fpRV(tid, genz(text), extra); };
const _repRV = reply;
reply = function (p, tid, text, who) { const r = _repRV(p, tid, R.chance(.12) ? R.pick(GZ_REPLY) : genz(text), who); return r; };

// ---------- honours helpers ----------
function rvH(tid, code) { try { const h = clubHonours(tid).find(x => x.code === code); return h ? { n: h.n, last: h.last } : { n: 0, last: null }; } catch (e) { return { n: 0, last: null }; } }
function rvSince(label) { const y = parseInt(label, 10); return y ? G.year - y : null; }
let _mostC = null;
// the club with the most wins of a competition (real lists + this save)
function rvMost(code) {
  _mostC = _mostC || {}; if (_mostC[code] && _mostC[code].y === G.year && _mostC[code].n === (G.chist || []).length) return _mostC[code].t;
  const c = {}; for (const r of (histRows()[code] || [])) c[r.w] = (c[r.w] || 0) + 1;
  const map = { LG: 'PL' }; for (const h of G.chist || []) { const x = h.c[map[code] || code]; if (x && x.w && T(x.w)) c[T(x.w).name] = (c[T(x.w).name] || 0) + 1; }
  const ks = Object.keys(c).sort((a, b) => c[b] - c[a]); const best = ks[0]; const t = best && !(ks[1] && c[ks[1]] === c[best]) ? teamByName(best) : null; // ties: nobody claims 'most'
  _mostC[code] = { y: G.year, n: (G.chist || []).length, t }; return t;
}
const RV_LBL = { LG: 'league titles', FA: 'FA Cups', LC: 'League Cups', UCL: 'European Cups', UEL: 'UEFA Cups / Europa Leagues', LL: 'La Liga titles', CDR: 'Copas del Rey', SA: 'Scudetti', CIT: 'Coppa Italias' };
// rival fans' jibes about a club's sore points
function rvTaunts(tid) {
  const n = tName(tid); const out = []; const add = (c, ...s) => { if (c) out.push(...s); };
  const ucl = rvH(tid, 'UCL'), lg = rvH(tid, ctryOf(tid) === 'ESP' ? 'LL' : ctryOf(tid) === 'ITA' ? 'SA' : 'LG');
  const ls = lg.last ? rvSince(lg.last) : null;
  switch (tid) {
    case 'ARS': add(!ucl.n, 'Still no Champions League 😂 Every August it\'s "this is our year"', 'Zero Big Ears in the cabinet. Ykb.', 'Arsenal fans when you mention the Champions League: 🙈'); add(ucl.n === 1, 'One Champions League and they think they\'re Real Madrid 😂'); out.push('Arsenal babies crying to the ref again 🍼', 'Bottle jobs. The 🍾 emoji was made for you'); break;
    case 'MCI': out.push('115 😂', 'Oil money FC ⛽ Every trophy comes with an asterisk*', 'Empty seats at the Etihad again 🪑', 'Plastic. Sportswashing with extra steps', 'Imagine needing a Gulf state to win the league'); break;
    case 'CHE': out.push('No history before Roman\'s roubles 💸', 'Plastic Chelsea. Bought every trophy you\'ve got', 'A billion spent and still mid 🤡', 'Loan Army FC. How many players are you paying this week?'); break;
    case 'MUN': out.push('Fergie Time merchants ⏱️ 8 minutes of stoppage time when you\'re losing', 'Twenty years of refs doing you favours (allegedly) 👀', 'Living in the 90s. Get a new song'); add(ls >= 8, `${ls} years since your last league title 😂 Netflix FC`); break;
    case 'LIV': out.push('Remember the 30-year wait for a league title? We do 😂', 'Feeling sorry for yourselves again? Classic', 'History doesn\'t win you games, mate'); break;
    case 'TOT': add(ls >= 30, `Last league title ${lg.last}. Black and white telly days 📺`); out.push('Spursy. That\'s it, that\'s the tweet', 'Trophy cabinet doubles as a storage cupboard 🧹', 'Lads it\'s Tottenham 💀'); break;
    case 'NEW': out.push('Sportswashing FC', 'Didn\'t care about you lot until the takeover money arrived'); break;
    case 'RMA': out.push('Ref Madrid 😂', 'VAR wears white in the Bernabéu', 'Half those Champions Leagues were refereeing gifts (allegedly) 👀'); break;
    case 'BAR': out.push('Economic levers FC 🎰 How many futures have you sold this year?', 'In debt up to the eyeballs and still flexing', 'Remontada\'d. Again. 🤡'); break;
    case 'ATM': add(!ucl.n, 'Three Champions League finals, zero trophies 😂', 'Never won the Champions League. Never will.'); out.push('Park the bus FC 🚌'); break;
    case 'JUV': out.push('Calciopoli 🕵️ Remember the titles you lost?', 'Serie B in 2006/07 and they still act like royalty'); break;
    case 'INT': out.push('Got handed the 2005/06 title in an office 😂', 'Pazza Inter: bottle it in May, every May'); break;
    case 'ACM': out.push('Living off the 2000s. Wake up', 'All those European Cups and the stadium is still half empty some nights'); break;
    case 'BAY': out.push('Farmers\' league 🚜 Eleven titles in a row is easy when nobody competes', 'Bundesliga = Bayern + 17 sparring partners'); break;
    case 'PSG': out.push('Oil money FC ⛽', 'Farmers\' league kings 🚜 Try winning a real league'); add(!ucl.n, 'All that money and no Champions League 😂'); break;
    case 'BVB': out.push('Bayern\'s feeder club 😂', 'Sell your best player to Bayern every summer, it\'s tradition'); break;
  }
  if (divOf(tid) === 'SPL') out.push('Retirement home league 🧓', 'Pension league. Nice weather though ☀️');
  if (!out.length) { out.push(`${n}? Small club mentality`, `${n} fans acting like they've won something 😂`, 'Mid-table merchants. Know your place'); add(ls >= 25, `Last league title ${lg.last}. Get a grip`); }
  return out;
}
// the comebacks
function rvBrags(tid) {
  const out = []; const n = tName(tid);
  for (const code of ['LG', 'UCL', 'FA', 'LL', 'SA', 'CDR', 'CIT', 'LC']) { if (rvMost(code) === tid) { const h = rvH(tid, code); if (h.n) out.push(`${h.n} ${RV_LBL[code]}. Most of anyone. Look it up 📚`); } }
  const uel = rvH(tid, 'UEL'); if (uel.n) out.push(`${uel.n > 1 ? uel.n + ' UEFA Cups / Europa Leagues' : 'Europa League winners in ' + uel.last}. Where's yours? 🏆`);
  const fa = rvH(tid, 'FA'); if (fa.n >= 5 && rvMost('FA') !== tid) out.push(`${fa.n} FA Cups. Proper cup pedigree`);
  const ucl = rvH(tid, 'UCL'); if (ucl.n >= 2) out.push(`${ucl.n} European Cups. ${ucl.n}. Say it with me 🏆`);
  else if (ucl.n === 1 && ucl.last) out.push(`Champions of Europe in ${ucl.last}. Where were you? 🏆`);
  const gold = rvH(tid, 'GOLD'); if (gold.n) out.push(`Gold trophy. Unbeaten season. Invincibles. Name another club with one 🏆✨`, 'We went a whole season unbeaten. Your club went a whole season unbeaten at home? Didn\'t think so');
  const lg = rvH(tid, ctryOf(tid) === 'ESP' ? 'LL' : ctryOf(tid) === 'ITA' ? 'SA' : 'LG'); if (lg.n >= 5) out.push(`${lg.n} league titles. Scoreboard 📊`);
  if (tid === 'MUN') out.push('Still the biggest club in the world. Cope');
  if (tid === 'MCI') out.push('Treble winners. Cry about it');
  if (tid === 'CHE') out.push('London\'s first Champions League winners. Seethe');
  if (!out.length) out.push(`At least ${n} have a soul`, 'Proper club with proper fans. You wouldn\'t understand', 'Scoreboard from today says otherwise 😂');
  return out;
}
// a thread: one fan of `att` digs at `tgt`, the target's fans hit back, the argument goes on
function rivalryThread(att, tgt, why) {
  if (!T(att) || !T(tgt) || T(att).lite || T(tgt).lite) return;
  const p = fanPost(att, (why ? why + ' ' : '') + R.pick(rvTaunts(tgt)), { u: att === G.user || tgt === G.user ? 1 : 0, big: true });
  reply(p, tgt, R.pick(rvBrags(tgt)));
  if (R.chance(.7)) reply(p, att, R.pick(rvBrags(att).concat(GZ_REPLY.slice(18))));
  if (R.chance(.6)) reply(p, tgt, R.pick(rvTaunts(att)));
  if (R.chance(.5)) reply(p, R.pick([att, tgt]), R.pick(GZ_REPLY));
  trend(tslug(tName(tgt)) + 'Banter', 1);
}

// ---------- after the user's match: rivalry threads, hate-watching, ex-players, Netflix FC ----------
function rvResult(f, tid) { const s = f.h === tid ? 0 : 1; const a = f.r[s], b = f.r[1 - s]; return a > b ? 'W' : a < b ? 'L' : (f.pen ? (f.pen[s] > f.pen[1 - s] ? 'W' : 'L') : 'D'); }
function rvStreak(tid) { const fs = Object.values(G.fx).filter(x => x.r && (x.h === tid || x.a === tid)).sort((a, b) => b.d.localeCompare(a.d)); let n = 0; for (const x of fs) { if (rvResult(x, tid) === 'L') n++; else break; } return n; }
function rivalsOf(tid) { return RIVALS.filter(([a, b]) => a === tid || b === tid).map(([a, b]) => a === tid ? b : a).filter(t => T(t) && !T(t).lite); }
function exPlayers(f) {
  if (!f.rt) return;
  [0, 1].forEach(s => {
    const side = f.rt[s] || []; const opp = s ? f.h : f.a; const me = s ? f.a : f.h;
    for (const [pid, rt, g] of side) {
      const p = P(pid); if (!p || !p.exc || !p.exc.includes(opp) || T(opp).lite) continue;
      if (g > 0) { const q = fanPost(opp, R.pick([`Of course the rat scores against us 🐀`, `${p.n} scores and celebrates in front of us. Judas. 🐍`, `Taught him everything he knows and this is how he repays us. ${p.n}, never welcome back`]), { big: true, u: opp === G.user || me === G.user ? 1 : 0 }); reply(q, me, R.pick([`${surname(p.n)} said "thanks for the memories" 😂`, 'Should\'ve paid him then', 'Revenge is a dish best served at the near post 🥶'])); trend('Judas', 2); }
      else if (rt < 6.3) { const q = fanPost(opp, R.pick([`${p.n} was booed every touch and deserved it 😂 Finished.`, `Dodged a bullet selling ${p.n}. Washed.`, `${surname(p.n)} came back to our place and did nothing. Karma 🙏`]), { u: opp === G.user || me === G.user ? 1 : 0 }); reply(q, me, 'Still better than anyone you\'ve got'); }
      else if (R.chance(.4)) fanPost(me, `${p.n} against his old club, quiet assassin 🥶 ${R.pick(['He\'s HIM', 'Aura +1000'])}`, { u: me === G.user ? 1 : 0 });
    }
  });
}
const _pmRV = postMatch;
postMatch = function (f, pre) {
  _pmRV(f, pre);
  try {
    if (!f.r || isNatT(G.user)) return;
    exPlayers(f);
    const u = G.user; if (f.h !== u && f.a !== u) return;
    const opp = f.h === u ? f.a : f.h; const res = rvResult(f, u); const derby = isRival(u, opp);
    const score = `${tName(f.h)} ${f.r[0]}-${f.r[1]} ${tName(f.a)}`;
    // the beaten side's fans get it about their club's sore points
    if (!T(opp).lite && (derby ? R.chance(.85) : R.chance(.35))) { if (res === 'W') rivalryThread(u, opp, `${score}.`); else if (res === 'L') rivalryThread(opp, u, `${score}.`); else { const a = R.pick([u, opp]); rivalryThread(a, a === u ? opp : u); } }
    // rival fans hate-watching our game
    for (const rv of rivalsOf(u).filter(t => t !== opp).slice(0, 2)) {
      if (!R.chance(.55)) continue;
      const t = res === 'W' ? R.pick([`Hate-watched ${tName(u)} for 90 minutes and they win ${f.r[0]}-${f.r[1]}. Ref carried them fr`, `Watching ${tName(u)} win is my villain origin story 😤`, `Only watched to see ${tName(u)} drop points. Wasted my evening 🙄`]) : R.pick([`Hate-watching ${tName(u)} is my cardio 🍿 ${score}`, `Put the ${tName(u)} game on just to see them suffer. Worth every second 😂`, `${tName(u)} dropped points. Best part of my week ngl`, `Live-tweeting the ${tName(u)} meltdown 🍿🍿 ${score}`]);
      const p = fanPost(rv, t, { u: 1 }); reply(p, u, R.pick(['Obsessed 😂 Rent free 🏠', 'Imagine watching our games instead of your own', 'Get your own club to support', 'You lot watch us more than your own team 💀']));
    }
    // losing streak: Netflix FC
    const ls = rvStreak(u);
    if (res === 'L' && ls >= 3) { const rv = rivalsOf(u)[0] || opp; const p = fanPost(rv, R.pick([`${tName(u)} have lost ${ls} in a row. Netflix FC 🎬 Somebody greenlight the documentary`, `${tName(u)} is a circus 🎪🤡 ${ls} defeats on the bounce`, `${tName(u)} fans: "we're building something". Building what, a clown car? 🤡`]), { u: 1, big: true }); reply(p, u, R.pick(['It\'s a blip. A long blip', 'Enjoy it, we\'ll be back', 'At least we have history'])); trend('NetflixFC', 2); }
    // underperforming stars after a poor game
    const side = f.rt ? f.rt[f.h === u ? 0 : 1] : [];
    for (const [pid, rt] of side) { const p = P(pid); if (!p || p.ca < 78 || rt > 5.8 || !p.form || p.form.length < 4) continue; const avg = p.form.reduce((a, b) => a + b, 0) / p.form.length; if (avg < 6.35 && R.chance(.6)) { const q = fanPost(u, R.pick([`${p.n} is finished. Done. Washed 🪦`, `${p.n} fell off harder than my WiFi`, `Sell ${p.n} to the Saudi Pro League while someone will still pay for him`, `${surname(p.n)} plays like he's on a 5-a-side stag do`, `${p.n}, fraud of the century. I said it`]), {}); reply(q, u, R.pick(['He\'s one game from turning it around, relax', 'Agreed. Bench him', 'Give him time fr', 'Respectfully, he\'s cooked'])); break; } }
  } catch (e) { console.error(e); }
};
// rivals elsewhere: one hate-watch thread per day from the round's results
const _fdRV = finishDay;
finishDay = function () {
  const r = _fdRV.apply(this, arguments);
  try {
    if (!r || !r.ids || G.sacked) return r;
    const fs = r.ids.map(id => G.fx[id]).filter(f => f && f.r && f.h !== G.user && f.a !== G.user && LEAGUE_COMPS.includes(f.comp) && !T(f.h).lite && !T(f.a).lite);
    const cand = [];
    for (const f of fs) for (const t of [f.h, f.a]) if (rvResult(f, t) === 'L') for (const rv of rivalsOf(t)) cand.push([rv, t, f]);
    if (cand.length && R.chance(.7)) { const [rv, t, f] = R.pick(cand); const p = fanPost(rv, R.pick([`Hate-watched ${tName(t)} lose ${f.r[0]}-${f.r[1]}. Better than our own match tbh 🍿`, `${tName(t)} losing is a public holiday in my house 🎉`, `${tName(t)} fans have gone very quiet 🤫`]), { u: rv === G.user ? 1 : 0 }); reply(p, t, R.pick(rvBrags(t))); if (R.chance(.6)) reply(p, rv, R.pick(rvTaunts(t))); }
  } catch (e) { console.error(e); }
  return r;
};

// ---------- transfers: Judas / rat, headline news, shirt sales ----------
const CLUB_FOUNDED = { ARS: 1886, AVL: 1874, BOU: 1899, BRE: 1889, BHA: 1901, BUR: 1882, CHE: 1905, EVE: 1878, FUL: 1879, LEE: 1919, LIV: 1892, MCI: 1880, MUN: 1878, NEW: 1892, NFO: 1865, SUN: 1879, TOT: 1882, WHU: 1895, WOL: 1877, RMA: 1902, BAR: 1899, ATM: 1903, ATH: 1898, SEV: 1890, VAL: 1919, BET: 1907, RSO: 1909, VIL: 1923, JUV: 1897, ACM: 1899, INT: 1908, ROM: 1927, LAZ: 1900, NAP: 1926, ATA: 1907, BAY: 1900, BVB: 1909, B04: 1904, RBL: 2009, VFB: 1893, SGE: 1899, PSG: 1970, OM: 1899, OL: 1950, ASM: 1924, HIL: 1957, NAS: 1955, ITT: 1927, AHL: 1937 };
function shirtSales(p, to) {
  const t = T(to); if (!t || t.lite) return 0;
  const s = Math.max(0, p.ca - 76); if (!s) return 0;
  const age = p.age || 25;
  let rev = Math.pow(s, 1.7) * .06 * Math.pow((t.rep || 70) / 85, 2) * (age <= 27 ? 1.1 : age >= 32 ? .7 : 1) * (p.ca >= 88 ? 1.3 : 1);
  rev = Math.round(rev * 10) / 10; if (rev < .1) return 0;
  t.bal += rev; t.fin.in.shirt = (t.fin.in.shirt || 0) + rev;
  return rev;
}
function judas(p, from, to, fee) {
  if (!from || !to || !T(from) || !T(to) || T(from).lite || T(to).lite) return;
  const fav = (p.car && p.car.a >= 40) || (p.st && p.st.g >= 8) || p.ca >= 82;
  const riv = isRival(from, to); const peer = (T(to).rep || 0) >= (T(from).rep || 0) - 3;
  if (!(riv || (fav && peer))) return;
  const t = riv ? [`${p.n} to ${tName(to)}?! JUDAS 🐍🐍🐍`, `Rat 🐀 Joining THEM. Hope the money keeps you warm, ${surname(p.n)}`, `Never a real ${tName(from)} fan, just a mercenary with an agent`, `Burning my ${surname(p.n)} shirt tonight 🔥`] : [`${p.n} kissed the badge in May and he's off to ${tName(to)} in the summer. Snake 🐍`, `Loyalty is dead. ${surname(p.n)} chose the money`, `Good riddance ${surname(p.n)}. You were never that good anyway (I'm coping)`];
  const q = fanPost(from, R.pick(t), { big: true, u: from === G.user || to === G.user ? 1 : 0 });
  reply(q, to, R.pick([`He wanted a club that wins things 🏆`, `Upgrade 📈`, 'Cry more, he\'s ours now 😂', 'He chose ambition. Ykb']));
  if (riv) { trend('Judas', 3); reply(q, from, 'Never forget. Never forgive.'); }
}
function bigTransferNews(p, from, to, fee, wage, years) {
  if (!T(to) || T(to).lite) return;
  G.feeRec = G.feeRec || {}; G.clubRec = G.clubRec || {};
  const clubRec = fee > 0 && G.clubRec[to] != null && fee > G.clubRec[to]; const lgRec = fee > 0 && G.feeRec.all != null && fee > G.feeRec.all;
  const star = p.ca >= 86; const big = fee >= 55 || star || (clubRec && fee >= 25) || lgRec && fee >= 25;
  if (fee > 0) { G.clubRec[to] = Math.max(G.clubRec[to] || 0, fee); G.feeRec.all = Math.max(G.feeRec.all || 0, fee); }
  const shirt = shirtSales(p, to);
  if (!big) return;
  const pos = POS_LABEL[p.pos] || p.pos; const nat = p.nat ? p.nat : '';
  const recTxt = lgRec && fee >= 25 ? ` It is the biggest fee paid by any club in this save.` : clubRec && fee >= 25 ? ` It is the most ${tName(to)} have paid for a player in this save.` : '';
  const car = p.car && p.car.a ? ` In this game he has made ${p.car.a} appearances and scored ${p.car.g} goals.` : '';
  const shirtTxt = shirt ? ` The club shop reported strong demand from the first morning: an estimated ${Math.round(shirt * 1e6 / 22 / 1000) * 1000 > 0 ? (Math.round(shirt * 1e6 / 22 / 1000) * 1000).toLocaleString('en-GB') : 'several thousand'} shirts with his name on the back are expected to sell, worth about ${money(shirt)} to the club (game estimate).` : '';
  const hype = star ? ` Supporters gathered outside ${esc(T(to).stadium || 'the ground')} to welcome one of the biggest names in world football, and his name has been trending all day on WUPH.com.` : ` Supporters see it as a statement of intent.`;
  const fromTxt = from && T(from) && !T(from).lite ? ` For ${tName(from)}, it ends his time at the club${fee ? `; the fee is a major boost to their budget` : ''}.` : '';
  news(star ? 'Blockbuster signing' : 'Big-money signing', `${tName(to, false)} have completed the signing of ${p.n} (${p.age}, ${pos}${nat ? ', ' + nat : ''}) from ${from && T(from) ? tName(from) : 'abroad'}${fee ? ` for ${money(fee)}` : ' on a free transfer'}.${recTxt} He signs a ${years || 3}-year contract worth a reported ${wageStr(wage || p.wage || 0)}.${car}${hype}${shirtTxt}${fromTxt}`, to, true);
  if (to === G.user && shirt) msg('Shirt sales', `${p.n}'s arrival has boosted shirt sales: about ${money(shirt)} of extra commercial income so far (Finances › Shirt sales).`);
}
const _ctRV = completeTransfer;
completeTransfer = function (p, toTid, fee, wage, years) {
  const from = p.c; _ctRV(p, toTid, fee, wage, years);
  try { if (T(from) && from !== toTid) { p.exc = (p.exc || []).filter(x => x !== toTid).concat(from).slice(-6); } judas(p, T(from) ? from : null, toTid, fee || 0); bigTransferNews(p, T(from) ? from : null, toTid, fee || 0, wage, years); } catch (e) { console.error(e); }
};

// ---------- trophies: the long write-up ----------
const RV_HCODE = { 'Premier League': 'LG', 'Championship': 'CH', 'FA Cup': 'FA', 'Carabao Cup': 'LC', 'Champions League': 'UCL', 'Europa League': 'UEL', 'Conference League': 'UECL', 'La Liga': 'LL', 'Copa del Rey': 'CDR', 'Supercopa de España': 'SCE', "Cup Winners' Cup": 'CWC', 'Serie A': 'SA', 'Coppa Italia': 'CIT', 'Supercoppa Italiana': 'SCI' };
function trophyStory(tid, name) {
  const t = T(tid); if (!t || t.lite || t.nat) return;
  const code = RV_HCODE[name]; let n, last;
  if (code) { const h = rvH(tid, code); n = h.n + 1; last = h.last; }
  else { const won = (G.honours[tid] || []).filter(x => x.replace(/^\d{4}\/\d{2} /, '') === name); n = won.length; last = won.length > 1 ? won[won.length - 2].slice(0, 7) : null; }
  const yrs = last ? rvSince(last) : null;
  const total = (() => { try { return clubHonours(tid).reduce((s, h) => s + (h.n || 0), 0) + 1; } catch (e) { return 0; } })();
  const nth = n === 1 ? 'first' : ordinal(n);
  const story = n === 1 ? `It is the first ${name} in the club's history, a day that will be remembered for generations.` : yrs != null && yrs >= 20 ? `It is their ${nth} ${name} and their first since ${last}, ending a wait of ${yrs} years.` : `It is their ${nth} ${name}${last ? `; the last one came in ${last}` : ''}.`;
  const founded = CLUB_FOUNDED[tid] ? ` Founded in ${CLUB_FOUNDED[tid]}, ${t.name} ` : ` ${t.name} `;
  const hon = total > 1 ? `${founded}now count ${total} major honours across the domestic and European competitions recorded in this game.` : `${founded}have their first major honour.`;
  const lead = tid === G.user ? ` Manager ${G.mgr} becomes the latest name in the club's story.` : '';
  const proud = ` It is a proud day for the supporters, the players, the staff and everyone affiliated with the club, and the celebrations in ${esc(t.stadium ? t.stadium.replace(/ Stadium$/, '') : 'the city')} and beyond are expected to go long into the night.`;
  news(`${t.name}: ${name} winners`, `${t.name} are ${name} winners ${seasonLabel(G.year)}! ${story}${hon}${lead}${proud}`, tid, true);
  try { const fp = fanPost(tid, R.pick([`${name.toUpperCase()} WINNERS 🏆🏆🏆 I'm not crying, you're crying`, `We did it. ${nth === 'first' ? 'First ever' : nth[0].toUpperCase() + nth.slice(1)} ${name}. Proudest day of my life`, `Tell your grandkids you were here for this 🏆`]), { big: true, u: tid === G.user ? 1 : 0 }); const rv = rivalsOf(tid)[0]; if (rv) { reply(fp, rv, R.pick(rvTaunts(tid))); reply(fp, tid, R.pick(rvBrags(tid).concat(['Scoreboard 🏆', 'Seethe. Cope. Mald.']))); } } catch (e) { }
}
const _honRV = honour;
honour = function (tid, name) {
  _honRV(tid, name);
  try { if (!/Fair Play|Manager of/.test(name)) trophyStory(tid, name); } catch (e) { console.error(e); }
  try { if (tid === G.user && G.spon && G.spon.cur && G.spon.cur.trophy && T(tid) && !T(tid).nat && name !== 'Premier League gold trophy') { const b = G.spon.cur.trophy; const t = T(tid); t.bal += b; t.fin.in.spon = (t.fin.in.spon || 0) + b; msg('Sponsor bonus', `${G.spon.cur.name} pay a trophy bonus of ${money(b)} for the ${name}.`); } } catch (e) { console.error(e); }
};

// ---------- the gold Premier League trophy ----------
const _chRV = clubHonours;
clubHonours = function (tid) {
  const out = _chRV(tid); const t = T(tid); if (!t) return out;
  const game = (G.gold || []).filter(x => x.t === tid); const real = tid === 'ARS' ? 1 : 0;
  if (real || game.length) out.splice(1, 0, { code: 'GOLD', label: 'Premier League gold trophy (unbeaten champions)', n: real + game.length, real, game: game.length, ru: 0, first: real ? '2003/04' : game[0].s, last: game.length ? game[game.length - 1].s : '2003/04' });
  return out;
};
function goldCheck() {
  const tb = leagueTable(); const c = tb[0]; if (!c || c.l || c.p < 30) return;
  G.gold = (G.gold || []).concat({ s: seasonLabel(G.year), t: c.t });
  _honRV(c.t, 'Premier League gold trophy');
  news('Invincibles!', `${tName(c.t, false)} have gone the whole Premier League season unbeaten: ${c.w} wins, ${c.d} draws and no defeats. The Premier League awards a special gold trophy for an unbeaten title season, a feat achieved before only by Arsenal's Invincibles in 2003/04. History has been made.`, c.t, true);
  try { const p = fanPost(c.t, 'INVINCIBLES 🏆✨ UNBEATEN. GOLD. FOREVER.', { big: true, u: c.t === G.user ? 1 : 0 }); for (const rv of rivalsOf(c.t).slice(0, 2)) reply(p, rv, R.pick(['Still a league title, calm down', 'Ok and? 🤷', 'Asterisk*'])); trend('Invincibles', 5); } catch (e) { }
}

// ---------- shirt sponsors ----------
const SPON_BRANDS = [
  { n: 'Quanta Bank', k: 'bank', tag: 'retail bank' }, { n: 'Nimbus Telecom', k: 'tel', tag: 'mobile network' }, { n: 'Skyvane Airways', k: 'air', tag: 'airline' }, { n: 'Northpeak Motors', k: 'car', tag: 'car maker' },
  { n: 'VoltRush Energy', k: 'drink', tag: 'energy drink' }, { n: 'CoinHarbor', k: 'crypto', tag: 'crypto exchange' }, { n: 'Aravia Tourism Authority', k: 'tour', tag: 'tourism board' }, { n: 'Helix Cloud', k: 'tech', tag: 'tech company' },
  { n: 'Brightwell Insurance', k: 'ins', tag: 'insurer' }, { n: 'Orbita Streaming', k: 'stream', tag: 'streaming service' }
];
function sponBase() { const t = userTeam(); return Math.round(Math.pow(t.rep / 100, 4) * 2.5 * .35 * 52 * 10) / 10; }
function sponOffers() {
  const b = sponBase(); const br = R.shuffle(SPON_BRANDS.slice()); const r1 = (a, c) => Math.round(b * (a + Math.random() * (c - a)) * 10) / 10;
  const safe = { name: br[0].n, tag: br[0].tag, kind: 'Steady partner', v: r1(1, 1.1), yrs: R.i(3, 5), trophy: Math.round(b * .1 * 10) / 10, perks: ['Trophy bonus for every major honour'] };
  const rich = { name: (SPON_BRANDS.find(x => x.k === 'crypto') && R.chance(.6) ? SPON_BRANDS.find(x => x.k === 'crypto') : br.find(x => x.k === 'drink') || br[1]).n, kind: 'Big money, big risk', v: r1(1.35, 1.6), yrs: R.i(2, 3), sign: Math.round((.2 + Math.random() * .1) * 100) / 100, fans: -6, risk: .15, perks: ['Signing-on bonus paid now', 'Unpopular with supporters (fan mood -6)', 'The company could collapse: 15% chance each season that payments stop'] };
  rich.tag = (SPON_BRANDS.find(x => x.n === rich.name) || {}).tag;
  const ach = br.find(x => x !== br[0] && !['crypto', 'drink'].includes(x.k)) || br[2];
  const perf = { name: ach.n, tag: ach.tag, kind: 'Performance deal', v: r1(.85, .95), yrs: R.i(2, 4), trophy: Math.round(b * .2 * 10) / 10, ucl: Math.round(b * .3 * 10) / 10, clause: .2, tour: Math.round(b * .08 * 10) / 10, fans: 2, perks: ['Big trophy bonus', 'Champions League bonus each season you qualify', 'Pre-season tour fee paid now', 'Clause: 20% of the season\'s fee is clawed back if you miss the board\'s league target', 'Popular local partner (fan mood +2)'] };
  safe.tag = safe.tag || br[0].tag;
  return [safe, rich, perf];
}
function sponInit() {
  if (!G || !T(G.user) || T(G.user).lite || T(G.user).nat) return;
  if (G.spon && G.spon.tid === G.user) return;
  G.spon = { tid: G.user, cur: { name: 'Current shirt sponsor', kind: 'Existing deal', v: sponBase(), end: G.year, perks: ['Inherited deal, expires at the end of this season'] }, offers: sponOffers(), hist: [] };
  msg('Shirt sponsor offers', `Your shirt deal expires at the end of this season. Three companies want to replace it: see Finances › Shirt sponsor to compare the money, the perks and the clauses.`);
}
function sponAccept(i) {
  const o = G.spon && G.spon.offers[i]; if (!o) return;
  const t = userTeam(); const c = Object.assign({}, o, { end: G.year + o.yrs - 1, from: seasonLabel(G.year) });
  if (o.sign) { const s = Math.round(o.v * o.sign * 10) / 10; t.bal += s; t.fin.in.spon = (t.fin.in.spon || 0) + s; c.signPaid = s; }
  if (o.tour) { t.bal += o.tour; t.fin.in.spon = (t.fin.in.spon || 0) + o.tour; }
  if (o.fans) G.fans = clamp((G.fans ?? 60) + o.fans, 0, 100);
  if (G.spon.cur && G.spon.cur.name !== 'Current shirt sponsor') G.spon.hist.push(G.spon.cur);
  G.spon.cur = c; G.spon.offers = [];
  news('New shirt sponsor', `${tName(G.user, false)} sign a ${o.yrs}-year shirt deal with ${o.name} (${o.tag}) worth ${money(o.v)} a season.${c.signPaid ? ` A signing-on bonus of ${money(c.signPaid)} is paid now.` : ''}`, G.user, true);
  try { fanPost(G.user, o.fans < 0 ? R.pick([`${o.name} on our shirt?? Embarrassing 🤢`, `Selling our soul to ${o.name}. Great.`]) : R.pick([`${o.name} on the new kit. Clean 🔥`, `Love the ${o.name} deal, looks proper`])); } catch (e) { }
}
const _wkRV = weekly;
weekly = function () {
  _wkRV.apply(this, arguments);
  try {
    sponInit(); const t = T(G.user); if (!G.spon || !t || t.lite || t.nat) return;
    const base = Math.pow(t.rep / 100, 4) * 2.5 * .35; t.bal -= base; t.fin.in.com -= base; // the shirt deal is now paid separately
    const c = G.spon.cur; if (c && !c.dead) { const w = c.v / 52; t.bal += w; t.fin.in.spon = (t.fin.in.spon || 0) + w; }
  } catch (e) { console.error(e); }
};
const _seRV = seasonEnd;
seasonEnd = function () {
  try { goldCheck(); } catch (e) { console.error(e); }
  try {
    const t = T(G.user); const c = G.spon && G.spon.tid === G.user && G.spon.cur;
    if (c && !c.dead && t) {
      if (c.clause) { const pos = userTable().findIndex(r => r.t === G.user) + 1; const tgt = boardTarget(); if (pos > tgt.pos) { const cb = Math.round(c.v * c.clause * 10) / 10; t.bal -= cb; t.fin.in.spon = (t.fin.in.spon || 0) - cb; msg('Sponsor clause', `You finished ${ordinal(pos)} and missed the board's target (top ${tgt.pos}). ${c.name} claw back ${money(cb)} under the performance clause.`); } }
      if (c.ucl && (G.euroIn.UCL || []).includes(G.user)) { t.bal += c.ucl; t.fin.in.spon = (t.fin.in.spon || 0) + c.ucl; msg('Sponsor bonus', `${c.name} pay a Champions League bonus of ${money(c.ucl)}.`); }
      if (c.risk && R.chance(c.risk) && G.year < c.end) { c.dead = 1; news('Sponsor collapse', `${c.name}, ${tName(G.user)}'s shirt sponsor, has collapsed and stopped all payments. The club's shirts will go blank until a new partner is found.`, G.user, true); G.spon.offers = sponOffers(); msg('Shirt sponsor', `${c.name} have collapsed. New offers are waiting in Finances › Shirt sponsor.`); }
      if (G.year >= c.end && G.spon.offers.length && !c.dead) { const best = G.spon.offers.map((o, i) => [o.v, i]).sort((a, b) => b[0] - a[0])[0][1]; const n = G.spon.offers[best].name; sponAccept(best); msg('Shirt sponsor', `Your shirt deal ran out and you had not chosen a new one, so the board signed the best-paying offer: ${n}.`); }
    }
  } catch (e) { console.error(e); }
  const r = _seRV.apply(this, arguments);
  try { const c = G.spon && G.spon.cur; if (c && G.spon.tid === G.user && G.year >= c.end && !G.spon.offers.length) { G.spon.offers = sponOffers(); msg('Shirt sponsor offers', `Your deal with ${c.name} runs out at the end of this season. New offers are in Finances › Shirt sponsor.`); } } catch (e) { console.error(e); }
  return r;
};
const _finRV = scrFinance;
scrFinance = function () {
  const h = _finRV(); try { sponInit(); } catch (e) { }
  const S = G.spon; if (!S || S.tid !== G.user) return h;
  const c = S.cur;
  const card = (o, i) => `<div class="box pad"><div class="row" style="justify-content:space-between;align-items:baseline;flex-wrap:wrap"><b>${esc(o.name)}</b><span class="dim">${esc(o.tag || '')}</span></div><div class="yel" style="font-size:12px;margin:2px 0 6px">${esc(o.kind)}</div><div class="big" style="font-size:24px">${money(o.v)}<span class="dim" style="font-size:12px"> / season · ${o.yrs} years</span></div><div style="font-size:12.5px;margin-top:6px">${o.perks.map(x => `<div>• ${esc(x)}</div>`).join('')}${o.trophy ? `<div class="dim">Trophy bonus ${money(o.trophy)}</div>` : ''}${o.ucl ? `<div class="dim">Champions League bonus ${money(o.ucl)}</div>` : ''}${o.sign ? `<div class="dim">Signing-on bonus ${money(Math.round(o.v * o.sign * 10) / 10)}</div>` : ''}${o.tour ? `<div class="dim">Tour fee ${money(o.tour)}</div>` : ''}</div>${i != null ? `<button class="btn pri" style="margin-top:8px" data-a="sponok" data-v="${i}">Sign with ${esc(o.name)}</button>` : ''}</div>`;
  const box = `<h2 class="sect">Shirt sponsor</h2><div class="box pad" style="margin-bottom:8px">${c ? `<b>${esc(c.name)}</b> <span class="dim">· ${esc(c.kind)}${c.from ? ' · since ' + c.from : ''} · until the end of ${seasonLabel(c.end)}</span><div>${c.dead ? '<span class="red">Payments stopped: the company collapsed.</span>' : `${money(c.v)} a season, paid weekly under Sponsorship.`}</div>` : '<span class="dim">No shirt sponsor.</span>'}</div>
  ${S.offers.length ? `<div class="grid3">${S.offers.map((o, i) => card(o, i)).join('')}</div><p class="dim" style="font-size:12px">Signing a new deal replaces the current one straight away. If you do nothing, the board signs the best-paying offer when your deal runs out. Brands are fictional.</p>` : '<p class="dim" style="font-size:12px">New offers arrive in the last season of your deal.</p>'}`;
  const i = h.lastIndexOf('<p class="dim" style="margin-top:10px">Wages are paid');
  return i > 0 ? h.slice(0, i) + box + h.slice(i) : h + box;
};
Object.assign(ACT, { sponok: (v) => { sponAccept(+v); toast('Shirt deal signed.'); autosave(); render(); } });
