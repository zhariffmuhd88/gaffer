// social.js: the emotional side of the game. A Media screen with a social feed: fan reactions to results,
// signings, sales and trophies, transfer rumours from (fictional) reporters with reliability tiers that can come true,
// insider "done deal" posts, club news, trending hashtags and a fan mood meter. Loaded after scenario.js.
// All reporters, outlets and fan accounts are invented for the game; no real journalist or outlet is quoted.

// ---------- reporters (fictional) ----------
const JOURN = [
  { k: 'mh', n: 'Marcus Hale', h: '@MarcusHaleFC', o: 'The Dossier', tier: 1, rel: .92, es: 0, style: 'sober' },
  { k: 'lf', n: 'Luca Ferraro', h: '@LucaFerraroMkt', o: 'Independent', tier: 1, rel: .86, es: 0, style: 'insider' },
  { k: 'eb', n: 'Ellie Brennan', h: '@EllieBrennanBPD', o: 'Back Page Daily', tier: 2, rel: .6, es: 0, style: 'paper' },
  { k: 'gp', n: 'Gary Pratt', h: '@GaryPrattSplash', o: 'The Sunday Splash', tier: 3, rel: .2, es: 0, style: 'tabloid' },
  { k: 'jm', n: 'Javier Montero', h: '@JMonteroVest', o: 'El Vestuario', tier: 1, rel: .82, es: 1, style: 'sober' },
  { k: 'pr', n: 'Paco Ríos', h: '@PacoRiosGol', o: 'Radio Gol', tier: 3, rel: .3, es: 1, style: 'tabloid' }
];
const TIER_N = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' };
function jr(k) { return JOURN.find(j => j.k === k); }
function pickJourn(es) { const pool = JOURN.filter(j => es ? true : !j.es); return R.wpick(pool, j => (es && j.es ? 2.2 : 1) * (j.tier === 1 ? 1 : j.tier === 2 ? 1.3 : 1.6)); }

// ---------- fans ----------
const FAN_NICK = { ARS: 'Gooner', CHE: 'Blue', LIV: 'Red', MUN: 'UnitedTilIDie', MCI: 'Citizen', TOT: 'COYS', NEW: 'Toon', AVL: 'Villan', EVE: 'Toffee', WHU: 'Iron', LEE: 'MOT', SUN: 'Mackem', CRY: 'Eagle', BHA: 'Seagull', BRE: 'Bee', FUL: 'Cottager', BOU: 'Cherry', NFO: 'Tricky', WOL: 'Wolf', BUR: 'Claret', RMA: 'Madridista', BAR: 'Cule', ATM: 'Colchonero', ATH: 'Lehoi', BET: 'Betico', SEV: 'Sevillista', VAL: 'Che', RSO: 'Txuri', CEL: 'Celeste', VIL: 'Groguet', EPY: 'Perico', OSA: 'Rojillo' };
const FAN_NAMES = ['Gav', 'Dan', 'Sully', 'Macca', 'Jonno', 'Lewis', 'Becky', 'Priya', 'Tom', 'Amir', 'Kev', 'Sophie', 'Robbo', 'Nina', 'Deano', 'Ola', 'Jake', 'Hannah', 'Big Steve', 'Mo', 'Liam', 'Chloe', 'Raj', 'Ellis', 'Pablo', 'Marta', 'Iker', 'Lucía', 'Sergi', 'Ane'];
function fanAcct(tid) {
  const t = T(tid) || {}; const nick = FAN_NICK[tid] || tslug(t.short || t.name || 'Fan').slice(0, 10);
  const nm = R.pick(FAN_NAMES); const num = R.chance(.6) ? R.i(1, 99) : '';
  return { n: nm + (R.chance(.35) ? ' ⚽' : ''), h: '@' + nick + tslug(nm) + num };
}
function rivalOf(tid) { const r = RIVALS.find(([a, b]) => a === tid || b === tid); return r ? (r[0] === tid ? r[1] : r[0]) : null; }

// ---------- feed ----------
function feed() { if (!G.feed) G.feed = []; return G.feed; }
function post(o) {
  const F = feed(); o.id = (G.feedId = (G.feedId || 0) + 1); o.d = G.date;
  o.lk = o.lk || Math.round(Math.pow(10, 1.6 + Math.random() * (o.big ? 3.2 : 2.2))); o.rt = Math.round(o.lk * (.08 + Math.random() * .25));
  F.unshift(o); if (F.length > 260) F.length = 260;
  return o;
}
function mediaUnread() { return G && G.feed ? G.feed.filter(p => p.u && !p.seen).length : 0; }
const fmtN = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K' : String(n);
function fanPost(tid, text, extra) { const a = fanAcct(tid); return post(Object.assign({ k: 'fan', a: a.n, h: a.h, t: text, tid, u: tid === G.user ? 1 : 0 }, extra || {})); }
function journPost(j, text, extra) { return post(Object.assign({ k: 'jour', a: j.n, h: j.h, o: j.o, tier: j.tier, t: text }, extra || {})); }
function clubPost(tid, text, extra) { const t = T(tid); return post(Object.assign({ k: 'club', a: (t.short || t.name) + ' News', h: '@' + tslug(t.short || t.name) + 'News', t: text, tid, u: tid === G.user ? 1 : 0 }, extra || {})); }
function fill(s, v) { return s.replace(/\{(\w+)\}/g, (m, k) => v[k] != null ? v[k] : m); }
function tslug(s) { return slug(String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')); }

// ---------- trending ----------
function trend(t, w) { G.trend = G.trend || {}; G.trend[t] = (G.trend[t] || 0) + (w || 1); }
function decayTrends() { if (!G.trend) return; for (const k in G.trend) { G.trend[k] *= .8; if (G.trend[k] < .5) delete G.trend[k]; } }

// ---------- fan reactions to the user's matches ----------
const FAN_T = {
  bigwin: ['WHAT. A. PERFORMANCE. {score} and it could have been more 🔥🔥', 'Absolutely battered them. {score}. This is the best I\'ve felt about us in years', '{score}!!! Somebody check on the {opp} fans 😂', 'Football heritage restored. {score}. Goodnight.'],
  win: ['Three points, job done. {score} ✅', 'Not pretty but who cares. {score}. Onto the next one', 'Get in!!! {score} 🙌', 'That\'s what we needed. {score}. Huge win', 'Ground out. Champions do that. {score}'],
  derbywin: ['DERBY DAY BELONGS TO US. {score} 🔥 {opp} fans, where are you??', 'Bragging rights secured. {score}. Work on Monday is going to be fun 😂', '{score} in the derby. Frame it. Print it. Never forget it.'],
  draw: ['A point. Could be worse, could be better. {score}', '{score}. Two points dropped, simple as that', 'Fair result tbh. {score}. Need more up front', 'Frustrating. {score}. We had the chances'],
  loss: ['{score}. Unacceptable. Something has to change', 'Embarrassing. {score}. Players should be ashamed', 'Switched off at half time. {score}. Same old problems', '{score}... I\'m not even angry, just tired', 'Bad day at the office. {score}. Go again'],
  bigloss: ['{score}. That was humiliating. I want answers', 'Worst performance I\'ve seen in years. {score}. Disgraceful', 'Absolutely gutted. {score}. Refund the travelling fans'],
  derbyloss: ['Losing to {opp}. {score}. Can\'t show my face tomorrow 😭', '{score} in the derby. There are no words', 'DERBY DEFEAT. {score}. That one hurts more than any other'],
  hero: ['{p} is HIM. Simple as that 🐐', 'Give {p} whatever contract he wants', '{p} was on another planet today', 'Someone get {p} a statue'],
  villain: ['{p} cannot be starting the next game', 'What was {p} doing out there? Shocking', 'I\'ve seen enough of {p}. Sell in the summer'],
  mgrgood: ['{m} has got this team flying 👏', 'Trust the process. {m} knows exactly what he\'s doing', '{m} masterclass today. Tactics spot on'],
  mgrbad: ['{m} has lost the dressing room. #{c}Out?', 'Same mistakes every week. {m} needs to go', 'I defended {m} for months. Not anymore', 'Subs were baffling again. What is {m} doing?']
};
function userMatchReactions(f) {
  const u = G.user; if (f.h !== u && f.a !== u) return;
  const home = f.h === u, opp = home ? f.a : f.h; const gf = home ? f.r[0] : f.r[1], ga = home ? f.r[1] : f.r[0];
  const won = gf > ga || (f.pen && (home ? f.pen[0] > f.pen[1] : f.pen[1] > f.pen[0])); const lost = !won && (gf < ga || f.pen);
  const derby = isRival(u, opp); const score = `${tName(f.h)} ${f.r[0]}-${f.r[1]} ${tName(f.a)}`;
  const kind = won ? (derby ? 'derbywin' : gf - ga >= 3 ? 'bigwin' : 'win') : lost ? (derby ? 'derbyloss' : ga - gf >= 3 ? 'bigloss' : 'loss') : 'draw';
  const v = { score, opp: tName(opp), m: G.mgr.split(' ').pop(), c: tslug(userTeam().short || userTeam().name) };
  const n = derby || kind === 'bigwin' || kind === 'bigloss' ? 4 : 3;
  const picks = R.shuffle(FAN_T[kind]).slice(0, n - 1);
  for (const s of picks) fanPost(u, fill(s, v), { big: derby });
  // player of the day / scapegoat from the ratings
  const side = f.rt ? f.rt[home ? 0 : 1] : null;
  if (side && side.length) {
    const best = side.slice().sort((a, b) => b[1] - a[1])[0], worst = side.slice().sort((a, b) => a[1] - b[1])[0];
    if (best && best[1] >= 7.6 && P(best[0])) fanPost(u, fill(R.pick(FAN_T.hero), { p: P(best[0]).n }));
    else if (lost && worst && worst[1] <= 5.6 && P(worst[0])) fanPost(u, fill(R.pick(FAN_T.villain), { p: P(worst[0]).n }));
  }
  // manager verdict follows the mood
  const mood = G.fans ?? 60;
  if (won && (mood >= 70 || derby)) fanPost(u, fill(R.pick(FAN_T.mgrgood), v));
  if (lost && mood < 40) { fanPost(u, fill(R.pick(FAN_T.mgrbad), v), { big: true }); trend(v.c + 'Out', 3); }
  // rival fans
  if (derby || R.chance(.35)) { const rv = won ? (derby ? 'Lucky. Enjoy it while it lasts.' : 'Fair play, deserved that.') : lost ? R.pick(['Easiest three points of the season 😂', 'Bottlers. Every single time.', 'Thanks for the points 👋']) : 'Boring game, boring teams.'; fanPost(opp, rv, { u: 1 }); }
  clubPost(u, `${f.r[0] + f.r[1] === 0 ? 'FULL-TIME' : 'FULL-TIME'} | ${score}${f.pen ? ` (${f.pen[0]}-${f.pen[1]} pens)` : ''} · ${COMP_NAME[f.comp] || f.comp}`);
  trend(derby ? 'DerbyDay' : tslug(tName(u)), derby ? 3 : 1.5);
}

// ---------- transfers: insiders, fans ----------
function insiderDeal(p, from, to, fee, abroad) {
  const big = fee >= 25 || to === G.user || from === G.user;
  if (!big && !R.chance(.25)) return;
  const es = ctryOf(to) === 'ESP' || (from && ctryOf(from) === 'ESP');
  const ins = es && R.chance(.5) ? jr('jm') : R.chance(.55) ? jr('lf') : jr('mh');
  const toN = abroad || tName(to, true), fromN = from ? tName(from, true) : 'free agency';
  const txt = ins.k === 'lf' ? `🚨 ${p.n} to ${toN}, DONE DEAL ✅🤝 ${fee ? money(fee) + ' fee agreed with ' + fromN : 'Free transfer'}. Contract signed, announcement imminent.` : `${p.n} completes ${fee ? money(fee) + ' ' : 'free '}move from ${fromN} to ${toN}. Medical done, ${R.i(3, 5)}-year deal.`;
  journPost(ins, txt, { big, u: (to === G.user || from === G.user) ? 1 : 0, tid: to });
  if (big) trend(tslug(p.n), 2);
  // fans of both clubs react
  if (to === G.user) {
    const sq = squad(G.user).filter(q => q.id !== p.id).map(q => q.ca).sort((a, b) => b - a); const rank = sq.filter(c => c > p.ca).length;
    const t = rank <= 3 ? [`WE ACTUALLY SIGNED ${p.n.toUpperCase()} 😱😱`, `${p.n}!!! Statement signing. The league should be scared`, `What a coup. ${p.n} is world class`] : rank <= 11 ? [`Solid signing. ${p.n} will start for us`, `Like the look of ${p.n}. Good business`, `${p.n} welcome to the family 🤝`] : [`Who? Never heard of ${p.n} 🤔`, `${p.n}... squad player at best. Is this it?`, `${fee ? money(fee) + ' for ' + p.n + '?' : p.n + ' on a free.'} We needed a star.`];
    for (const s of R.shuffle(t).slice(0, 2)) fanPost(G.user, s, { big: rank <= 3 });
    G.fans = clamp((G.fans ?? 60) + (rank <= 3 ? 4 : rank <= 11 ? 1 : -1), 0, 100);
  }
  if (from === G.user) {
    const fav = (p.car && p.car.a >= 60) || (p.st && p.st.g >= 8) || p.ca >= 82;
    const t = fav ? [`Selling ${p.n}?! Our best player. Absolute joke 😡`, `Gutted to see ${p.n} go. Legend.`, `The board have no ambition. ${p.n} gone just like that`] : [`Good money for ${p.n}. Fair deal`, `Thanks ${p.n}, all the best 👋`, `${money(fee || 0)} for ${p.n}? Take it and run`];
    for (const s of R.shuffle(t).slice(0, 2)) fanPost(G.user, s, { big: fav });
    if (fav) { G.fans = clamp((G.fans ?? 60) - 5, 0, 100); trend('Sell' + tslug(userTeam().short || userTeam().name) + 'Board', 2); }
  }
  if (to && to !== G.user && !T(to).lite && big) fanPost(to, R.pick([`${p.n} is ours!! 🔥`, `Huge signing. ${p.n} 👏`, `Overpaid? Maybe. Excited? Absolutely. Welcome ${p.n}`]));
}
const _ctSoc = completeTransfer;
completeTransfer = function (p, toTid, fee, wage, years) { const from = p.c; _ctSoc(p, toTid, fee, wage, years); try { insiderDeal(p, T(from) ? from : null, toTid, fee || 0); rumourDone(p.id, toTid); } catch (e) { console.error(e); } };
const _saSoc = sellAbroad;
sellAbroad = function (p, fee, club) { const from = p.c; _saSoc(p, fee, club); try { insiderDeal(p, from, null, fee, club); rumourDone(p.id, null); } catch (e) { console.error(e); } };

// ---------- rumours ----------
// G.rum: [{id, pid, to (club id or abroad name), j (reporter), d, end, tr (true?), st: open|done|dead, kind}]
function rumList() { if (!G.rum) G.rum = []; return G.rum; }
function rumourDone(pid, to) { for (const r of rumList()) if (r.pid === pid && r.st === 'open') { r.st = r.to === to ? 'done' : 'dead'; if (r.st === 'done') r.hit = 1; } }
const RUM_T = {
  sober: ['{to} have opened talks over {p}. Early stages, {from} want around {fee}.', 'Understand {to} are exploring a move for {p}. Shortlist, no bid yet.', '{to} are preparing an opening offer for {p}. {from} reluctant to sell mid-season.'],
  insider: ['🔁 {to} in contact with {p}\'s camp. Talks ongoing, more to follow.', '⚠️ {p}, {to} intensify talks. Club-to-club discussions now open, around {fee} the price.', '{to} want {p}. Player keen on the move 🔄'],
  paper: ['{to} ready to test {from}\'s resolve with a bid for {p}, sources say.', '{p} is a top target for {to}, who have watched him four times this season.', '{to} chiefs plot {fee} swoop for {p}.'],
  tabloid: ['EXCLUSIVE: {p} has told pals he wants out and {to} are ready to pounce 👀', 'Bombshell! {to} lining up a {fee} raid for {p}!!', '{p} spotted house-hunting near {to}\'s training ground 🏠👀']
};
function weeklyRumours() {
  const inWin = G.window; const n = inWin ? R.i(2, 4) : (R.chance(.45) ? 1 : 0);
  for (let i = 0; i < n; i++) makeRumour(R.chance(.35) ? 'user' : R.chance(.25) ? 'linkUser' : 'ai');
  // close old rumours
  for (const r of rumList()) if (r.st === 'open' && G.date > r.end) {
    r.st = 'dead';
    if (r.tr && G.window) tryRumourMove(r); // late move
    else if (R.chance(.5)) { const j = jr(r.j); const p = P(r.pid); if (p && j.tier <= 2) journPost(j, R.pick([`Update on ${p.n}: no agreement. ${r.toN} have moved on to other targets.`, `${p.n} staying put for now. Talks with ${r.toN} collapsed over the fee.`]), { u: p.c === G.user ? 1 : 0 }); }
  }
  G.rum = rumList().filter(r => r.st === 'open' || dDiff(r.d, G.date) < 120).slice(-80);
}
function makeRumour(kind) {
  let p, to, toN;
  if (kind === 'user') {
    const cands = squad(G.user).filter(q => !q.loan && q.ca >= 70); if (!cands.length) return;
    p = R.wpick(cands, q => Math.pow(q.ca - 66, 2) * (q.listed || q.req ? 3 : 1));
    const buyers = fullTeams().filter(t => t !== G.user && T(t).rep >= p.ca - 10);
    if (buyers.length && R.chance(.7)) { to = R.pick(buyers); toN = tName(to, true); } else { toN = R.pick(['Paris SG', 'Bayern Munich', 'Inter', 'Juventus', 'Al-Hilal', 'Al-Nassr', 'Napoli', 'AC Milan']); to = null; }
  } else if (kind === 'linkUser') {
    const u = userTeam(); const pool = Object.values(G.players).filter(q => divOf(q.c) && q.c !== G.user && !q.loan && q.ca >= u.rep - 6 && q.ca <= u.rep + 6); if (!pool.length) return;
    p = R.pick(pool); to = G.user; toN = tName(G.user, true);
  } else {
    const buyer = R.pick(fullTeams().filter(t => t !== G.user)); const bt = T(buyer);
    const pool = Object.values(G.players).filter(q => divOf(q.c) && q.c !== buyer && q.c !== G.user && !q.loan && q.ca >= bt.rep - 8 && q.ca <= bt.rep + 4); if (!pool.length) return;
    p = R.pick(pool); to = buyer; toN = tName(buyer, true);
  }
  if (rumList().some(r => r.pid === p.id && r.st === 'open')) return;
  const es = ctryOf(p.c) === 'ESP' || (to && ctryOf(to) === 'ESP'); const j = pickJourn(es);
  const tr = kind !== 'linkUser' && R.chance(j.rel * (G.window ? .75 : .5));
  const r = { id: (G.rumId = (G.rumId || 0) + 1), pid: p.id, to, toN, j: j.k, d: G.date, end: addDays(G.date, G.window ? R.i(8, 22) : (tr ? 150 : R.i(10, 30))), tr: tr ? 1 : 0, st: 'open', kind };
  rumList().push(r);
  const v = { p: p.n, to: toN, from: tName(p.c, true), fee: money(Math.max(1, Math.round(askingPrice(p) * R.i(90, 120) / 100))) };
  const txt = fill(R.pick(RUM_T[j.style]), v);
  journPost(j, txt, { rum: r.id, u: (p.c === G.user || to === G.user) ? 1 : 0, tid: p.c, big: p.ca >= 84 });
  // reactions
  if (p.c === G.user) { fanPost(G.user, R.pick([`If ${p.n} leaves I'm done with this club`, `${p.n} isn't for sale. End of.`, `${j.tier === 3 ? 'It\'s ' + j.o + ', ignore it 🙄' : 'Uh oh. ' + j.n + ' doesn\'t usually get these wrong'}`, `Everyone has a price. Get the money and reinvest`])); if (j.tier === 1) { news('Rumour', `${j.n} (${j.o}): ${txt}`, G.user); for (const q of [p]) if (typeof setHap === 'function') setHap(q, -2); } }
  if (to === G.user) { fanPost(G.user, R.pick([`${p.n} would be a dream signing 🤤`, `Please make this happen. ${p.n} is exactly what we need`, `${p.n}? Not convinced tbh`, `Get it done!!! ${p.n} 🙏`])); if (j.tier <= 2) news('Rumour', `${j.n} (${j.o}) links you with ${p.n} of ${tName(p.c)}. Fans are excited.`, G.user); }
  trend(tslug(p.n), 1);
}
// a true rumour about an AI club turns into a real move (or an offer for the user's player)
function tryRumourMove(r) {
  const p = P(r.pid); if (!p || !G.window || r.st !== 'open' && r.st !== 'dead') return;
  if (p.c === G.user) {
    if (G.offers.some(o => o.pid === p.id && o.st === 'incoming')) return;
    const fee = Math.round(calcValue(p) * R.i(95, 125) / 10) / 10;
    const o = { id: 'o' + (++G.newsId), pid: p.id, from: G.user, fee, st: 'incoming', d: G.date };
    if (r.to && T(r.to) && !T(r.to).lite) o.to = r.to; else { o.abroad = true; o.buyer = r.toN; }
    G.offers.push(o);
    msg('Offer for ' + p.n, `${r.toN} have made a ${money(fee)} offer for ${p.n}, as ${jr(r.j).n} (${jr(r.j).o}) reported.`, { k: 'incoming', o: o.id });
    journPost(jr(r.j), `${r.toN} have now submitted an official bid for ${p.n}: ${money(fee)}. Ball in ${tName(G.user)}'s court.`, { u: 1, big: true });
    r.st = 'done'; r.hit = 1; return;
  }
  if (!r.to || !T(r.to) || T(r.to).lite || p.c === r.to || !divOf(p.c) || r.to === G.user) return;
  const bt = T(r.to); const fee = askingPrice(p);
  if ((bt.tb < fee * .9 && bt.bal < fee * 1.6) || squad(p.c).length <= 19) return;
  bt.tb = Math.max(0, bt.tb - fee); completeTransfer(p, r.to, fee, wageFor(p, r.to), R.i(3, 5));
}
function rumourTick() {
  for (const r of rumList()) if (r.st === 'open' && r.tr && G.window && dDiff(r.d, G.date) >= 4 && R.chance(.18)) tryRumourMove(r);
}

// ---------- trophies, promotion, sackings, sanctions ----------
const _honSoc = honour;
honour = function (tid, name) {
  _honSoc(tid, name);
  try {
    if (!T(tid) || T(tid).lite) return;
    if (tid === G.user) {
      for (const s of R.shuffle([`CHAMPIONS!!! ${name.toUpperCase()} WINNERS 🏆🏆🏆`, `I'm crying. We actually did it. ${name} 🏆`, `Tell your grandkids about this season. ${name} champions`, `${G.mgr} you absolute legend. ${name} 🏆`, `Parade. Open-top bus. Now. 🚌🏆`]).slice(0, 4)) fanPost(G.user, s, { big: true });
      clubPost(G.user, `🏆 ${name.toUpperCase()} WINNERS · ${seasonLabel(G.year)}`, { big: true });
      G.fans = clamp((G.fans ?? 60) + 12, 0, 100); trend(tslug(tName(G.user)) + 'Champions', 8);
    } else {
      journPost(jr(ctryOf(tid) === 'ESP' ? 'jm' : 'mh'), `${tName(tid, true)} win the ${name}. ${mgrName(tid)}'s side ${R.pick(['deserved it', 'held their nerve', 'did it the hard way'])}.`, { tid, big: /League|Liga|Champions/.test(name) });
      const rv = rivalOf(G.user); if (rv === tid) { fanPost(G.user, R.pick([`Watching ${tName(tid)} lift the ${name} is physically painful`, `Never thought I'd see ${tName(tid)} win the ${name}. Dark day.`])); G.fans = clamp((G.fans ?? 60) - 2, 0, 100); }
    }
  } catch (e) { console.error(e); }
};
const _newsSoc = news;
news = function (title, body, tid, global) {
  _newsSoc(title, body, tid, global);
  try {
    if (!G || !G.teams) return;
    if (title === 'Manager' && /sacked/.test(body) && tid) { journPost(jr(ctryOf(tid) === 'ESP' ? 'jm' : 'mh'), body, { tid, big: true }); fanPost(tid, R.pick(['About time. Thank you and goodbye.', 'Sad way for it to end, but it had to happen.', 'Who on earth is next? Please not another gamble'])); }
    if (title === 'Manchester City sanctioned') { journPost(jr('mh'), 'The commission has spoken: Manchester City deducted 60 points this season and for the next four, plus a £500m fine. Unprecedented in English football.', { big: true }); fanPost('MCI', 'This is a witch hunt. We will appeal again. 💙', { big: true }); fanPost(R.pick(['LIV', 'ARS', 'MUN']), 'Asterisks on every title. Finally. 🍿', { big: true }); trend('115', 10); }
  } catch (e) { console.error(e); }
};

// ---------- hooks into the season ----------
const _pmSoc = postMatch;
postMatch = function (f, pre) { _pmSoc(f, pre); try { if (f.h === G.user || f.a === G.user) userMatchReactions(f); } catch (e) { console.error(e); } };
const _wkSoc = weekly;
weekly = function () { _wkSoc(); try { if (!G.sacked && T(G.user) && !isNatT(G.user)) { weeklyRumours(); decayTrends(); boardPressure(); } } catch (e) { console.error(e); } };
const _dtSoc = dailyTick;
dailyTick = function () { const r = _dtSoc.apply(this, arguments); try { if (G.window && G.rum) rumourTick(); } catch (e) { console.error(e); } return r; };
// fans turn on the manager when the board does
function boardPressure() {
  if (isNatT(G.user)) return;
  const c = tslug(userTeam().short || userTeam().name);
  if (G.board < 30 && R.chance(.5)) { const j = R.pick([jr('eb'), jr('gp'), jr(ctryOf(G.user) === 'ESP' ? 'pr' : 'gp')]); journPost(j, `${tName(G.user, true)} board growing impatient with ${G.mgr}. ${j.tier === 3 ? 'Replacement already lined up!!' : 'Next few games could be decisive.'}`, { u: 1, big: true }); trend(c + 'Out', 4); if (j.tier <= 2) news('Media', `${j.n} (${j.o}) reports the board is losing patience.`, G.user); }
  if ((G.fans ?? 60) < 30 && R.chance(.5)) { fanPost(G.user, R.pick([`Banner at the next home game. Enough is enough. #${c}Out`, `I've been a fan for 30 years and I've never felt this flat`, `Empty seats are coming. The fans have spoken.`]), { big: true }); trend(c + 'Out', 3); }
  if ((G.fans ?? 60) > 85 && R.chance(.3)) { fanPost(G.user, R.pick([`Best time to be a fan in a generation. Enjoy it 💙`, `${G.mgr} statue outside the ground when?`, `Sold out every week. What a time.`])); trend('In' + tslug(G.mgr.split(' ').pop()) + 'WeTrust', 3); }
}

// ---------- screen ----------
function postHtml(p) {
  const badgeK = p.k === 'jour' ? `<span class="tag" title="Reliability">${TIER_N[p.tier]}</span> <span class="dim">${esc(p.o)}</span>` : p.k === 'club' ? '<span class="tag">Club</span>' : '';
  const r = p.rum ? rumList().find(x => x.id === p.rum) : null;
  const st = r ? (r.st === 'done' && r.hit ? '<span class="grn mono" title="This rumour came true">✓ came true</span>' : r.st === 'dead' ? '<span class="dim mono">✗ did not happen</span>' : '<span class="amb mono">open</span>') : '';
  const tc = p.tid && T(p.tid) ? T(p.tid).c1 : '#556';
  return `<div class="post ${p.u ? 'mine' : ''}" style="border-left:3px solid ${tc}"><div class="row" style="gap:6px;align-items:baseline;flex-wrap:wrap"><b>${esc(p.a)}</b><span class="dim mono" style="font-size:12px">${esc(p.h)}</span>${badgeK}<span class="spacer"></span><span class="dim mono" style="font-size:11.5px">${dShort(p.d)}</span></div><div style="margin:4px 0 4px">${esc(p.t)}</div><div class="dim mono" style="font-size:11.5px">♥ ${fmtN(p.lk)} · ↻ ${fmtN(p.rt)} ${st}</div></div>`;
}
function scrMedia() {
  const F = feed(); for (const p of F) if (p.u) p.seen = 1;
  const tab = UI.tab.med || 'all';
  const list = F.filter(p => tab === 'all' ? true : tab === 'mine' ? p.u : tab === 'fans' ? p.k === 'fan' : tab === 'jour' ? p.k === 'jour' : tab === 'rum' ? !!p.rum : true).slice(0, 120);
  const mood = Math.round(G.fans ?? 60);
  const face = mood >= 80 ? '🤩' : mood >= 65 ? '😀' : mood >= 50 ? '🙂' : mood >= 35 ? '😐' : mood >= 20 ? '😠' : '🤬';
  const tr = Object.entries(G.trend || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const R0 = rumList(); const closed = R0.filter(r => r.st !== 'open');
  const relRow = JOURN.map(j => { const mine = closed.filter(r => r.j === j.k); const hit = mine.filter(r => r.hit).length; return `<tr><td><b>${esc(j.n)}</b> <span class="dim">${esc(j.o)}</span></td><td><span class="tag">${TIER_N[j.tier]}</span></td><td class="n mono">${mine.length ? hit + '/' + mine.length : '-'}</td></tr>`; }).join('');
  return `<div class="band">Media<small>Fans, reporters and rumours</small></div>
  <div class="grid3" style="margin-top:10px">
    <div class="box pad"><label class="lb">Fan mood</label><div class="big">${face} ${mood}</div><div class="bar"><i style="width:${mood}%;background:${mood < 35 ? 'var(--red)' : mood < 60 ? 'var(--amb)' : 'var(--grn)'}"></i></div><div class="dim" style="font-size:12.5px">Results, derbies, signings, sales and trophies move it.</div></div>
    <div class="box pad"><label class="lb">Trending</label>${tr.length ? tr.map(([t]) => `<div class="mono">#${esc(t)}</div>`).join('') : '<span class="dim">Nothing yet.</span>'}</div>
    <div class="box pad"><label class="lb">Reporters' record (this save)</label><div class="tw"><table class="t"><tbody>${relRow}</tbody></table></div></div>
  </div>
  <div class="tabs" style="margin-top:10px">${[['all', 'All'], ['mine', 'About us'], ['fans', 'Fans'], ['jour', 'Reporters'], ['rum', 'Rumours']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-k="med" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="feed" style="display:grid;gap:8px;margin-top:8px">${list.map(postHtml).join('') || '<p class="dim">Nothing yet. Play a match or wait for the transfer window.</p>'}</div>
  <p class="dim" style="font-size:12px;margin-top:10px">Reporters, outlets and fan accounts are fictional. Tier 1 reporters are usually right; Tier 3 stories are mostly gossip. A rumour marked ✓ turned into a real bid or transfer in this save.</p>`;
}
const _scrSoc = screen;
screen = function (s) { if (s === 'media') { try { return scrMedia(); } catch (e) { console.error(e); return '<p class="dim">Media unavailable.</p>'; } } return _scrSoc(s); };
// inbox: latest fan reaction after a result
const _lrbSoc = lastResultsBox;
lastResultsBox = function () {
  const h = _lrbSoc();
  try { const ps = feed().filter(p => p.u && p.d === G.date && p.k === 'fan').slice(0, 3); if (ps.length) return h + `<h2 class="sect">Fans react <span class="lnk" data-a="nav" data-v="media" style="font-size:14px">more in Media</span></h2><div style="display:grid;gap:6px">${ps.map(postHtml).join('')}</div>`; } catch (e) { console.error(e); }
  return h;
};
