// banter.js: hotter takes for the Media screen. Fictional TV pundits who disagree with each other, fan-channel
// creators, fans blaming referees, VAR and the opposition's tactics, reply threads with rival fans, and a weekly
// VAR Watch where (fictional) former referees judge the big decisions of the past week. Loaded after social.js.
// Everyone here is invented for the game: no real pundit, referee, creator or channel is quoted.

const PUNDITS = [
  { k: 'rk', n: 'Rob Kettering', h: '@RobKettering', o: 'former England full-back', st: 'blunt' },
  { k: 'ds', n: 'Danny Shields', h: '@DannyShields5', o: 'former centre-back', st: 'heated' },
  { k: 'wo', n: 'Wesley Ojo', h: '@WesOjo9', o: 'former striker', st: 'emotional' },
  { k: 'pd', n: 'Pascal Dumont', h: '@PascalDumont', o: 'former midfielder', st: 'hot' },
  { k: 'ar', n: 'Álvaro Requena', h: '@AlvaroRequena', o: 'former Spain defender', st: 'heated', es: 1 }
];
const CREATORS = [
  { k: 'fc', n: 'Big Lenny', h: '@BigLennyLive', o: '{club} fan channel', st: 'meltdown' },
  { k: 'xg', n: 'xG Ollie', h: '@xGOllie', o: 'stats account', st: 'stats' },
  { k: 'bt', n: 'Kicks & Giggles', h: '@KicksAndGiggles', o: 'banter page', st: 'banter' },
  { k: 'tk', n: 'Tactics Tash', h: '@TacticsTash', o: 'tactics analyst', st: 'tactics' }
];
const REFS = [
  { k: 'kb', n: 'Keith Barlow', h: '@KeithBarlowRef', o: 'former Premier League referee' },
  { k: 'so', n: 'Sandra Okafor', h: '@SandraOkaforRef', o: 'former FIFA referee' },
  { k: 'mv', n: 'Miguel Vidal', h: '@MiguelVidalArb', o: 'former LaLiga referee', es: 1 }
];
function pundit(es, not) { const pool = PUNDITS.filter(p => (es ? true : !p.es) && p.k !== not); return R.wpick(pool, p => es && p.es ? 3 : 1); }
function punditPost(p, text, extra) { return post(Object.assign({ k: 'pun', a: p.n, h: p.h, o: p.o, t: text }, extra || {})); }
function creatorPost(c, text, tid, extra) { return post(Object.assign({ k: 'cre', a: c.k === 'fc' ? (c.n) : c.n, h: c.k === 'fc' ? '@' + tslug(tName(tid)) + 'TalkTV' : c.h, o: c.k === 'fc' ? tName(tid) + ' fan channel' : c.o, t: text, tid }, extra || {})); }
function reply(p, tid, text, who) { const a = who || fanAcct(tid); (p.rep = p.rep || []).push({ a: a.n, h: a.h, t: text, tid }); if (p.rep.length > 6) p.rep.length = 6; return p; }

// ---------- reading a match ----------
function matchRead(f) {
  const st = f.st || [{}, {}]; const inc = f.inc || [];
  const res = (side) => { const gf = f.r[side], ga = f.r[1 - side]; return gf > ga ? 'W' : gf < ga ? 'L' : 'D'; };
  const r = { f, tid: [f.h, f.a], po: [st[0].po || 50, st[1].po || 50], xg: [st[0].xg || 0, st[1].xg || 0], sh: [st[0].sh || 0, st[1].sh || 0], res: [res(0), res(1)], inc };
  r.dis = [0, 1].map(s => inc.filter(x => x[0] === 'D' && x[2] === s)); // disallowed goals for side s
  r.pen = [0, 1].map(s => inc.filter(x => x[0] === 'P' && x[2] === s)); // penalties won by side s
  r.red = [0, 1].map(s => inc.filter(x => x[0] === 'R' && x[2] === s)); // red cards against side s
  r.mgr = [mgrName(f.h), mgrName(f.a)];
  return r;
}
// what the losing side's fans blame
function grievance(r, s) {
  const o = 1 - s; const out = [];
  if (r.dis[s].length) out.push(['var', `Goal ruled out for ${r.dis[s][0][4]}. ${R.pick(['VAR is a joke', 'Absolute robbery', 'How long were they drawing those lines for?', 'Scrap VAR. Now.'])}`]);
  if (r.pen[o].length) out.push(['ref', `That penalty against us was ${R.pick(['never', 'NEVER', 'a joke', 'soft as butter'])} a penalty. ${R.pick(['He went down like he\'d been shot 🙄', 'Ref bottled it under pressure', 'Barely any contact'])}`]);
  if (r.red[s].length) out.push(['ref', `${P(r.red[s][0][3]) ? P(r.red[s][0][3]).n : 'Our lad'} sent off${r.red[s][0][4] === 'r2' ? ' for two soft yellows' : ''}. ${R.pick(['Changed the whole game', 'Never a red in a million years', 'Ref lost control from minute one'])}`]);
  if (r.po[o] <= 38) out.push(['bus', `${tName(r.tid[o])} parked the bus for 90 minutes. ${R.pick(['Anti-football', 'Time-wasting from the first minute', 'Keeper took a minute over every goal kick', 'That\'s not football, that\'s survival mode'])}. ${R.pick(['Ref did nothing about it', 'Embarrassing from a club that size'])}`]);
  if (r.xg[s] > r.xg[o] + .6) out.push(['xg', `We had ${r.xg[s].toFixed(1)} xG to their ${r.xg[o].toFixed(1)}. Football is cruel. ${R.pick(['Daylight robbery', 'Smash and grab', 'Their keeper had the game of his life'])}`]);
  if (!out.length) out.push(['self', R.pick(['No excuses. We were second best all over the pitch', 'Can\'t even blame the ref. That was on us', 'Bottled it. Again.'])]);
  return out;
}
// rival fans' answer
const COMEBACK = ['Cry more 😂', 'Scoreboard. 🤫', 'VAR didn\'t miss your striker\'s sitter mate', 'Imagine blaming the ref when you had {sh} shots and scored {g}', 'Every week it\'s the ref with you lot 🤣', 'Bus parked? We just defended better than you attacked 🚌😂', 'Ref this, VAR that. Get better players.', '3 points in the bag, enjoy your tears 💧'];

// ---------- the user's match: blame, banter, pundits, creators ----------
function hotTakes(f) {
  const u = G.user; const s = f.h === u ? 0 : 1, o = 1 - s; const r = matchRead(f);
  const won = r.res[s] === 'W', lost = r.res[s] === 'L';
  const opp = r.tid[o]; const derby = isRival(u, opp);
  const v = { opp: tName(opp), us: tName(u), sh: r.sh[s], g: f.r[s], mo: r.mgr[o], mu: r.mgr[s] };
  // our fans: blame the ref, VAR or the opposition when we drop points
  if (!won) {
    const gs = R.shuffle(grievance(r, s)).slice(0, lost ? 2 : 1);
    for (const [k, t] of gs) {
      const p = fanPost(u, t, { big: k !== 'self' && (derby || lost) });
      if (k !== 'self') { reply(p, opp, fill(R.pick(COMEBACK), v)); if (R.chance(.7)) reply(p, u, R.pick(['Keep crying? You lot were time-wasting at 0-0 😂', 'Wait till we see you at our place', `Say that after the ref gets demoted. ${R.pick(['Disgrace', 'Shambles'])}`, 'Imagine celebrating that performance 🤡'])); if (R.chance(.5)) reply(p, opp, R.pick(['Ratio 😂', 'Seethe.', 'Highlights on loop tonight 🍿'])); }
      if (k === 'var' || k === 'ref') trend(k === 'var' ? 'VARdisgrace' : 'RefOut', 3);
    }
  } else {
    // the opponents blame us, our fans laugh
    const gs = grievance(r, o); const [k, t] = R.pick(gs);
    if (k !== 'self') { const p = fanPost(opp, t, { u: 1 }); reply(p, u, fill(R.pick(COMEBACK), { sh: r.sh[o], g: f.r[o] })); if (R.chance(.6)) reply(p, opp, R.pick(['Enjoy it, you won\'t be top for long', 'We\'ll see you in the return fixture 😤', 'Cheated. Simple.'])); if (R.chance(.5)) reply(p, u, R.pick(['Cry more 🤣', '😂😂😂', 'Is this the famous rivalry? Thought it was a training match'])); }
    if (r.po[s] <= 40) { const p = fanPost(u, `Low possession? Don't care. ${v.mu.split(' ').pop()} out-thought ${v.mo.split(' ').pop()}. Tactical masterclass 🧠`); reply(p, opp, 'Parking the bus isn\'t a tactic'); }
  }
  // fan-channel creator for our club (big emotions after derbies and defeats)
  if (lost || derby || R.chance(.35)) {
    const c = CREATORS[0];
    const t = lost ? R.pick([`LIVE NOW 🔴 MELTDOWN. ${tName(u)} ${f.r[s]}-${f.r[o]} ${tName(opp)}. I'm calling it: this squad isn't good enough and the board knows it. Comments are OPEN 😡`, `I've thrown my remote. Genuinely. ${f.r[s]}-${f.r[o]}. ${v.mu.split(' ').pop()} has to answer for that second half. Watchalong reaction up now`, `Emergency stream in 10 mins. That was the worst 90 minutes I've watched this season. We need to talk about ${R.pick(squad(u).slice(0, 11)).n}`])
      : won ? R.pick([`WE'RE BACK 🔥🔥 ${f.r[s]}-${f.r[o]}! Watchalong reaction LIVE now, I nearly lost my voice at the winner`, `Told you all on Friday's stream. ${v.mu.split(' ').pop()} knows ball. ${f.r[s]}-${f.r[o]}! 🎉`, `Scenes in the studio 😂 ${tName(opp)} fans in my comments are VERY quiet tonight`])
        : `Two points dropped and I'm fuming. Full rant live in 5 🎙️ ${f.r[s]}-${f.r[o]}`;
    const p = creatorPost(c, t, u, { u: 1, big: derby });
    if (R.chance(.7)) reply(p, opp, R.pick(['Your channel is the only thing louder than your excuses 😂', 'Clip this for the "best fan reactions" compilation 🍿', 'Same rant as last week lol']));
  }
  // stats account settles nothing
  if (Math.abs(r.xg[0] - r.xg[1]) > .5 && R.chance(.6)) { const w = r.xg[0] > r.xg[1] ? 0 : 1; const p = creatorPost(CREATORS[1], `xG: ${tName(f.h)} ${r.xg[0].toFixed(2)} - ${r.xg[1].toFixed(2)} ${tName(f.a)}. Possession ${r.po[0]}-${r.po[1]}. ${f.r[w] > f.r[1 - w] ? 'Deserved.' : 'Football, eh? 🤷'}`, f.h, { u: 1 }); reply(p, r.tid[1 - w], R.pick(['xG doesn\'t win trophies', 'Nobody asked', 'Delete this'])); }
  // pundits disagree on the big talking point
  punditVerdict(r, s);
}
function punditVerdict(r, sUser) {
  const f = r.f; const es = ctryOf(f.h) === 'ESP';
  const w = r.res[0] === 'W' ? 0 : r.res[1] === 'W' ? 1 : null; const l = w == null ? null : 1 - w;
  const p1 = pundit(es), p2 = pundit(es, p1.k);
  const T1 = (k) => T(k) ? tName(k) : k;
  let a, b;
  if (w == null) { a = `${T1(f.h)} and ${T1(f.a)} both looked scared to lose. ${R.pick(['Nobody took a risk', 'Two managers playing not to lose', 'Poor game, poor quality'])}.`; b = `I'm sorry, I disagree. That was a chess match. ${R.pick(['Both coaches got it right', 'Tactically fascinating', 'Draw was fair'])}.`; }
  else if (r.red[l].length || r.pen[w].length || r.dis[l].length) { const why = r.red[l].length ? 'the red card' : r.pen[w].length ? 'the penalty' : 'the disallowed goal'; a = `${T1(r.tid[l])} will moan about ${why}, but ${R.pick(['they were awful long before that', 'they didn\'t lay a glove on them', 'you make your own luck'])}.`; b = `Rubbish. ${why[0].toUpperCase() + why.slice(1)} decided that game. ${R.pick(['I\'d be livid if I was in that dressing room', 'Referees have to be braver', 'That\'s the VAR problem in a nutshell'])}.`; }
  else if (r.po[w] <= 40) { a = `${r.mgr[w].split(' ').pop()} got his tactics spot on. Sat in, hit them on the break. ${R.pick(['Masterclass', 'Textbook', 'Brilliant game plan'])}.`; b = `Masterclass? They had ${r.po[w]}% of the ball and parked the bus. ${R.pick(['That\'s not a game plan, that\'s survival', 'Football is dying', 'Nobody pays to watch that'])}.`; }
  else if (f.r[w] - f.r[l] >= 3) { a = `${T1(r.tid[l])} were a disgrace. ${R.pick(['No leaders on that pitch', 'Soft, soft, soft', 'Some of those players should be embarrassed to take their wages'])}.`; b = `Calm down. Give ${T1(r.tid[w])} some credit, they were ${R.pick(['outstanding', 'ruthless', 'on another level'])} today.`; }
  else { a = `${T1(r.tid[w])} ${R.pick(['showed real character', 'found a way', 'look like a proper team now'])}. ${R.pick(['Title talk is real', 'Top four for me', 'That\'s a big result'])}.`; b = `Steady on. They were ${R.pick(['lucky', 'second best for an hour', 'rescued by their keeper'])}. ${T1(r.tid[l])} deserved more.`; }
  const p = punditPost(p1, a, { tid: w == null ? f.h : r.tid[w], u: sUser != null ? 1 : 0, big: true });
  p.rep = [{ a: p2.n, h: p2.h, t: b, tid: null }];
  reply(p, r.tid[l == null ? 1 : l], R.pick([`Finally someone talking sense, ${p2.n.split(' ')[0]}`, `${p1.n.split(' ')[0]} always hated us`, 'Agenda pundit 🙄']));
  if (R.chance(.6)) reply(p, r.tid[w == null ? 0 : w], R.pick([`${p2.n.split(' ')[0]} still bitter after all these years 😂`, `${p1.n.split(' ')[0]} spot on as always`, 'Pundits arguing again 🍿']));
}

// ---------- the biggest game of each round (not the user's): one pundit row ----------
function roundTalking(ids) {
  const fs = ids.map(id => G.fx[id]).filter(f => f && f.r && ['PL', 'LL', 'UCL'].includes(f.comp) && f.h !== G.user && f.a !== G.user && !T(f.h).lite && !T(f.a).lite);
  if (!fs.length) return;
  const f = fs.sort((a, b) => (T(b.h).rep + T(b.a).rep + (isRival(b.h, b.a) ? 15 : 0) + ((b.inc || []).length * 5)) - (T(a.h).rep + T(a.a).rep + (isRival(a.h, a.a) ? 15 : 0) + ((a.inc || []).length * 5)))[0];
  if (T(f.h).rep + T(f.a).rep < 160 && !(f.inc || []).length) return;
  punditVerdict(matchRead(f), null);
  const r = matchRead(f); const l = r.res[0] === 'L' ? 0 : r.res[1] === 'L' ? 1 : null;
  if (l != null) { const [k, t] = R.pick(grievance(r, l)); if (k !== 'self') { const p = fanPost(r.tid[l], t); reply(p, r.tid[1 - l], fill(R.pick(COMEBACK), { sh: r.sh[l], g: f.r[l] })); } }
  if (R.chance(.4)) { const c = CREATORS[2]; creatorPost(c, R.pick([`${tName(r.tid[l == null ? 0 : l])} fans this weekend 📉😭`, `POV: you told your mates ${tName(r.tid[l == null ? 1 : l])} were "back" 🤡`, `Ref's phone has been ringing nonstop since ${tName(f.h)} v ${tName(f.a)} 😂📞`]), f.h); }
}
const _fdBan = finishDay;
finishDay = function () { const r = _fdBan.apply(this, arguments); try { if (r && r.ids && !G.sacked) roundTalking(r.ids); } catch (e) { console.error(e); } return r; };
const _pmBan = postMatch;
postMatch = function (f, pre) { _pmBan(f, pre); try { if ((f.h === G.user || f.a === G.user) && f.r && !isNatT(G.user)) hotTakes(f); } catch (e) { console.error(e); } };

// ---------- VAR Watch: former referees judge last week's big calls ----------
const VAR_WHY = {
  'offside': [['correct', 'The lines are clear: his shoulder is beyond the last defender. Tight, but correct.'], ['wrong', 'I\'ve looked at it ten times. The frame they used is a fraction late, he was level. Level is onside. That goal should stand.'], ['debatable', 'Within the margin of error of the technology. I can understand both sides of this one.']],
  'a handball': [['correct', 'Arm away from the body, making himself bigger. Under the law that is handball.'], ['wrong', 'His arm is in a natural position and the ball comes off his own thigh first. Not handball. Wrong call.'], ['debatable', 'Close. Accidental, but it leads directly to the goal, so you can see why it was given.']],
  'a foul in the build-up': [['correct', 'Clear push in the back in the build-up. VAR right to go back.'], ['wrong', 'That contact is normal in a contested challenge. Going back that far to find something is not what VAR is for.'], ['debatable', 'A soft foul. I wouldn\'t have given it on the pitch, but it isn\'t a clear error either way.']],
  'P': [['correct', 'Defender clips the attacker\'s standing leg. Clear penalty.'], ['wrong', 'Minimal contact, the attacker was already going down. Never a penalty and VAR should have stepped in.'], ['debatable', 'There is contact. Whether it is enough is a matter of opinion. Not a clear and obvious error.']],
  'Rr': [['correct', 'Studs up, high, with force. Endangers the opponent\'s safety. Straight red, correct.'], ['wrong', 'Reckless, yes. Excessive force, no. That\'s a yellow card, and VAR should have recommended a review.'], ['debatable', 'On the borderline between yellow and red. I\'d have gone yellow, but I can\'t call it wrong.']],
  'Rr2': [['correct', 'Two clear bookable offences. He can\'t complain.'], ['wrong', 'The second yellow was harsh. Barely a foul. The referee lost his feel for the game.'], ['debatable', 'The first booking was soft, the second fair. Harsh but within the laws.']]
};
function varWatch() {
  const from = addDays(G.date, -7);
  const fs = Object.values(G.fx).filter(f => f.r && f.inc && f.d >= from && f.d < G.date && ['PL', 'LL', 'CH', 'UCL', 'UEL', 'FA', 'CDR'].includes(f.comp));
  const cand = [];
  for (const f of fs) for (const x of f.inc) {
    const mine = f.h === G.user || f.a === G.user; const rep = (T(f.h).rep || 60) + (T(f.a).rep || 60);
    cand.push({ f, x, sc: (mine ? 500 : 0) + rep + (x[0] === 'D' ? 40 : x[0] === 'R' ? 30 : 15) + (isRival(f.h, f.a) ? 30 : 0) + Math.random() * 20 });
  }
  if (!cand.length) return;
  const picks = []; let mineN = 0; const seenF = {};
  for (const c of cand.sort((a, b) => b.sc - a.sc)) { const mine = c.f.h === G.user || c.f.a === G.user; if (mine && mineN >= 2) continue; if ((seenF[c.f.id] || 0) >= 2) continue; picks.push(c); seenF[c.f.id] = (seenF[c.f.id] || 0) + 1; if (mine) mineN++; if (picks.length >= 3) break; }
  G.varw = G.varw || [];
  const ref = R.pick(REFS.filter(r => !r.es)), refEs = REFS.find(r => r.es);
  const head = post({ k: 'var', a: ref.n, h: ref.h, o: ref.o, t: `VAR WATCH 📺 My verdict on the ${picks.length} biggest calls of the week. Thread 🧵`, big: true });
  for (const { f, x } of picks) {
    const [kind, min, side, pid] = x; const why = kind === 'D' ? x[4] : kind === 'P' ? 'P' : 'R' + x[4];
    const opts = VAR_WHY[why] || VAR_WHY.offside;
    const [verdict, expl] = R.wpick(opts, o => o[0] === 'correct' ? 6 : o[0] === 'wrong' ? 2.5 : 2.5);
    const p = P(pid); const ben = kind === 'D' ? 1 - side : kind === 'P' ? side : 1 - side; // which side the decision helped
    const vic = 1 - ben; const tids = [f.h, f.a];
    const what = kind === 'D' ? `${p ? p.n : 'The'} goal ruled out for ${x[4]}` : kind === 'P' ? `Penalty to ${tName(tids[side])}${x[4] ? ' after a VAR review' : ''}` : `${p ? p.n : 'Player'} sent off${x[4] === 'r2' ? ' (second yellow)' : ''}`;
    const judge = ctryOf(f.h) === 'ESP' ? refEs : ref;
    const verdictTxt = { correct: '✅ CORRECT', wrong: '❌ WRONG', debatable: '🤔 DEBATABLE' }[verdict];
    const pp = post({ k: 'var', a: judge.n, h: judge.h, o: judge.o, t: `${tName(f.h)} ${f.r[0]}-${f.r[1]} ${tName(f.a)}, ${min}': ${what}. ${verdictTxt}. ${expl}`, tid: tids[vic], u: tids.includes(G.user) ? 1 : 0, big: verdict === 'wrong' });
    G.varw.unshift({ d: G.date, fid: f.id, k: kind, min, what, v: verdict, j: judge.n, t: expl, vic: tids[vic] });
    if (verdict === 'wrong') { reply(pp, tids[vic], R.pick(['VINDICATED. Told you all. Where\'s the apology?', 'Cost us points. Who pays for that?', 'Every. Single. Week.', 'Sack the lot of them'])); reply(pp, tids[ben], R.pick(['Result stands though 🤷', 'Still would\'ve won anyway', 'Swings and roundabouts mate'])); trend('VARdisgrace', 4); }
    else if (verdict === 'correct') { reply(pp, tids[ben], R.pick(['Thank you. Now can the other lot stop crying?', 'Case closed 🔒', 'Told them it was right']));  reply(pp, tids[vic], R.pick(['Ex-refs always protect their mates', 'Bias. Pure bias.', 'Not having that']));  }
    else reply(pp, tids[vic], 'Debatable = wrong. Simple.');
    // the user's club
    if (tids.includes(G.user)) {
      const helped = tids[ben] === G.user;
      if (verdict === 'wrong' && !helped) { G.fans = clamp((G.fans ?? 60) - 2, 0, 100); msg('VAR Watch', `${judge.n} (${judge.o}) says the decision against you at ${tName(f.h)} v ${tName(f.a)} (${what.toLowerCase()}) was wrong. The fans are furious.`, { k: 'nav', v: 'media' }); }
      if (verdict === 'wrong' && helped) fanPost(G.user, R.pick(['We\'ll take it 😅', 'Bit lucky that one, not gonna lie', 'Karma for every decision that went against us last season']));
    }
  }
  if (G.varw.length > 60) G.varw.length = 60;
  reply(head, null, 'Great thread. The standard of refereeing this season is a talking point every single week.', { n: 'Ref Watcher', h: '@RefWatcherUK' });
}
const _wkBan = weekly;
weekly = function () { _wkBan(); try { if (!G.sacked && T(G.user)) varWatch(); } catch (e) { console.error(e); } };

// VAR Watch tab: table of judged decisions above the posts
const _scrMedBan = scrMedia;
scrMedia = function () {
  const h = _scrMedBan();
  if ((UI.tab.med || 'all') !== 'var') return h;
  const V = G.varw || [];
  const tot = { correct: 0, wrong: 0, debatable: 0 }; for (const x of V) tot[x.v]++;
  const tbl = `<div class="box pad" style="margin-top:8px"><b>VAR Watch</b> <span class="dim">· former referees judge the biggest calls every Monday · this save: ✅ ${tot.correct} correct · ❌ ${tot.wrong} wrong · 🤔 ${tot.debatable} debatable</span>${V.length ? `<div class="tw" style="margin-top:6px"><table class="t"><thead><tr><th>Date</th><th>Match</th><th>Decision</th><th>Verdict</th></tr></thead><tbody>${V.slice(0, 20).map(x => { const f = G.fx[x.fid]; return `<tr class="${f && (f.h === G.user || f.a === G.user) ? 'me' : ''}"><td class="mono">${dShort(x.d)}</td><td>${f ? `${esc(tName(f.h))} ${f.r[0]}-${f.r[1]} ${esc(tName(f.a))}` : '-'}</td><td>${x.min}' ${esc(x.what)}</td><td class="${x.v === 'wrong' ? 'red' : x.v === 'correct' ? 'grn' : 'amb'}">${x.v}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="dim" style="margin:6px 0 0">The first VAR Watch comes out on Monday after a round with big decisions.</p>'}</div>`;
  const i = h.indexOf('<div class="feed"');
  return i > 0 ? h.slice(0, i) + tbl + h.slice(i) : h;
};
