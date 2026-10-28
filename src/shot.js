const XG = { through: .29, open: .095, header: .085, long: .033, pen: .78, fk: .06, corner: .07 };
const STYLE_Q = { tapin: 1, placed: 2, driven: 3, header: 3, pen: .5, curler: 5, diving: 5, volley: 6, chip: 6, round: 4, screamer: 8, fkcurl: 7, panenka: 6, bicycle: 10, solo: 7 };
const STYLE_N = { tapin: 'tap-in', placed: 'placed finish', driven: 'low drive', curler: 'curler', chip: 'chip over the keeper', round: 'finish after rounding the keeper', volley: 'volley', bicycle: 'bicycle kick', header: 'header', diving: 'diving header', screamer: 'long-range screamer', fkcurl: 'free kick', pen: 'penalty', panenka: 'Panenka penalty', solo: 'solo goal' };
const SKILLS = { stepover: 'stepover', nutmeg: 'nutmeg', cruyff: 'Cruyff turn', roulette: 'roulette', elastico: 'elastico', feint: 'body feint' };
function shotStyle(e, ae, type, res) {
  const a = attrs(e.p); const fla = a.Fla || 8, dri = a.Dri || 8;
  let st, sk = null;
  if (type === 'pen') st = fla >= 15 && R.chance(.08) ? 'panenka' : 'pen';
  else if (type === 'fk') st = 'fkcurl';
  else if (type === 'long') st = (a.Lon || 8) >= 14 && R.chance(.55) ? (R.chance(.5) ? 'screamer' : 'curler') : 'driven';
  else if (type === 'header' || type === 'corner') st = fla >= 15 && ae && R.chance(.008) ? 'bicycle' : type === 'corner' && R.chance(.15) ? 'volley' : R.chance(.15) ? 'diving' : 'header';
  else if (type === 'through') st = R.chance(clamp(.18 + (fla - 12) * .04, .05, .5)) ? 'chip' : R.chance(.15) ? 'round' : 'placed';
  else {
    if (ae && R.chance(.14)) st = 'volley';
    else if (dri + fla >= 30 && R.chance(.12)) st = 'solo';
    else st = R.wpick([['placed', 4], ['driven', 3], ['curler', fla >= 13 ? 3 : 1], ['tapin', 1.5]], x => x[1])[0];
  }
  if (st === 'solo' || ((type === 'open' || type === 'through') && dri >= 14 && R.chance(clamp(.12 + (fla - 12) * .03, .03, .4)))) sk = R.pick(Object.keys(SKILLS));
  let det = null;
  if (res === 'save') det = st === 'chip' ? 'backpedal' : (type === 'through' || st === 'round') ? R.pick(['smother', 'dive', 'dive']) : type === 'pen' ? 'dive' : R.wpick([['dive', 4], ['fingertip', 3], ['catch', 2], ['parry', 2]], x => x[1])[0];
  if (res === 'miss') det = type === 'pen' ? R.pick(['wide', 'over', 'post']) : R.wpick([['wide', 4], ['over', 3], ['block', 3], ['post', 1.1], ['clear', .5]], x => x[1])[0];
  return { st, sk, det };
}
function skillLine(sk, def) { const d = def ? pn(def.p) : 'his marker'; return { stepover: `does a stepover and leaves ${d} for dead`, nutmeg: `nutmegs ${d}!`, cruyff: `pulls off a Cruyff turn to escape ${d}`, roulette: `spins away from ${d} with a roulette`, elastico: `beats ${d} with an elastico`, feint: `drops a shoulder and glides past ${d}` }[sk]; }
function goalLine(st, type, ae) {
  const as = ae ? pn(ae.p) + "'s" : 'the';
  return {
    tapin: `taps in from close range after ${as} low ball across`,
    placed: type === 'through' ? `latches onto ${as} through ball and slots it past the keeper` : 'places it calmly into the bottom corner',
    driven: 'drills a low shot into the corner',
    curler: 'curls a beauty into the far top corner',
    chip: `runs onto ${as} pass and dinks a delicate chip over the keeper!`,
    round: 'rounds the keeper and rolls it into the empty net',
    volley: `meets ${as} cross with a thumping volley!`,
    bicycle: `scores with an outrageous bicycle kick from ${as} cross!`,
    header: `rises to head home ${as} cross`,
    diving: `throws himself at ${as} cross and scores with a diving header!`,
    screamer: 'unleashes an unstoppable thunderbolt from 30 yards!',
    fkcurl: 'curls the free kick over the wall and into the top corner',
    pen: 'sends the keeper the wrong way from the spot',
    panenka: 'chips a cheeky Panenka penalty straight down the middle!',
    solo: 'goes on a mazy solo run and finishes it off himself!'
  }[st];
}
function shot(M, si, e, ae, type) {
  const S = M.sides[si], O = M.sides[1 - si];
  if (!e) return;
  const a = attrs(e.p);
  const key = type === 'header' || type === 'corner' ? 'Hea' : type === 'long' || type === 'fk' ? 'Lon' : 'Fin';
  const skill = a[key] * 5 * (0.6 + 0.4 * e.p.cond / 100);
  let xg = XG[type] * Math.pow(skill / 70, 1.0);
  if (type !== 'pen') xg *= Math.pow(S.u.att / O.u.def, 0.35);
  const gk = O.u.gk || 50;
  let pg = clamp(xg * Math.pow(72 / gk, 1.0), .01, .9);
  if (type === 'pen') pg = clamp(.76 + (a.Fin - 13) * .01 - (gk - 70) * .004, .6, .9);
  if (M.wx === 'rain' && type !== 'pen') pg = Math.min(.9, pg * 1.05);
  const nf = M.comp === 'CH' && G.normCH ? G.normCH : G.normF;
  if (nf && type !== 'pen') pg *= nf;
  S.st.sh++; S.st.xg += xg;
  const sname = cap1(pn(e.p));
  const gkE = O.ps.find(x => x.on && x.role === 'GK');
  const gkn = gkE ? pn(gkE.p) : 'the keeper';
  const defs = O.ps.filter(x => x.on && ['DC', 'DL', 'DR', 'WBL', 'WBR', 'DM'].includes(x.role));
  const def = defs.length ? R.pick(defs) : null;
  if (ae === e) ae = null;
  if (type === 'pen') say(M, M.min, 'big', `PENALTY to ${S.name}!${R.chance(.3) ? ' It is given after a VAR review.' : ''} ${sname} steps up...`, si);
  const res = R.chance(pg) ? 'goal' : R.chance(type === 'pen' ? .6 : .31) ? 'save' : 'miss';
  const sty = shotStyle(e, ae, type, res);
  if (M.shots) M.shots.push({ min: M.min, side: si, xg: +xg.toFixed(3), goal: res === 'goal' });
  const vis = (r, extra) => { if (M.live) M.vis.push(Object.assign({ min: M.min, t: 'shot', side: si, e, ae, r, type, st: sty.st, sk: sty.sk, det: sty.det, def, gk: gkE }, extra || {})); };
  if (sty.sk) say(M, M.min, 'skill', `${sname} ${skillLine(sty.sk, def)}`, si);
  if (res === 'goal' && type !== 'pen' && R.chance(.035)) {
    S.st.ot++;
    const why = R.pick(['offside', 'offside', 'a handball', 'a foul in the build-up']);
    vis('var');
    say(M, M.min, 'var', `${sname} puts it in the net... but VAR is checking. NO GOAL! It is ruled out for ${why}.`, si);
    M.ev.push({ min: M.min, t: 'var', side: si, p: e.p.id });
    return;
  }
  if (res === 'goal') {
    S.st.ot++;
    M.score[si]++; vis('goal');
    e.g++; e.rt += 0.9 + (STYLE_Q[sty.st] >= 6 ? .2 : 0);
    if (ae && type !== 'pen') { ae.as++; ae.rt += .6; } else ae = null;
    if (gkE) gkE.rt -= .3;
    for (const d of O.ps) if (d.on && ['DC', 'DL', 'DR', 'WBL', 'WBR'].includes(d.role)) d.rt -= .12;
    M.ev.push({ min: M.min, t: 'goal', side: si, p: e.p.id, a: ae ? ae.p.id : null, type, own: false, st: sty.st, sk: sty.sk });
    const assist = ae && !['tapin', 'chip', 'volley', 'bicycle', 'header', 'diving'].includes(sty.st) && !(sty.st === 'placed' && type === 'through');
    const gl = `${sname} ${goalLine(sty.st, type, ae)}${assist ? ', assisted by ' + pn(ae.p) : ''}`;
    say(M, M.min, 'goal', `GOAL! ${S.name} ${M.score[si] > M.score[1 - si] ? 'lead' : 'score'}. ${gl}${gl.endsWith('!') ? '' : '.'} ${M.sides[0].name} ${M.score[0]}-${M.score[1]} ${M.sides[1].name}`, si);
    if (M.live && R.chance(.05)) say(M, M.min, 'var', 'VAR has a quick look... and the goal stands.', si);
    return;
  }
  if (ae) ae.rt += 0.08;
  if (res === 'save') {
    S.st.ot++; O.st.sv++; vis('save');
    if (gkE) gkE.rt += type === 'pen' ? .9 : sty.det === 'catch' ? .12 : .25;
    e.rt += .1;
    const G1 = cap1(gkn);
    const line = type === 'pen' ? `Saved! ${G1} guesses right and keeps out the penalty!` : {
      dive: `${G1} dives full stretch to keep out ${sname}'s shot!`,
      fingertip: `${G1} gets his fingertips to ${sname}'s effort and tips it round the post!`,
      catch: `${sname}'s shot is comfortably held by ${gkn}.`,
      parry: `${G1} parries ${sname}'s shot away.`,
      smother: `${G1} rushes off his line and smothers it at ${sname}'s feet!`,
      backpedal: `${sname} tries to chip ${gkn}, but he backpedals and tips it over the bar!`
    }[sty.det];
    say(M, M.min, 'save', line, si);
    if (sty.det === 'fingertip' || sty.det === 'backpedal' || R.chance(.35)) corner(M, si);
  } else {
    if (type === 'through' || type === 'pen') e.rt -= .15;
    if ((sty.det === 'block' || sty.det === 'clear') && def) def.rt += sty.det === 'clear' ? .35 : .1;
    vis('miss');
    const hd = type === 'header' || type === 'corner';
    const line = {
      wide: hd ? `${sname} heads wide.` : type === 'pen' ? `${sname} drags the penalty wide!` : `${sname} drags the shot wide.`,
      over: hd ? `${sname} heads over from a good position.` : type === 'pen' ? `${sname} blazes the penalty over the bar!` : `${sname} fires over the bar.`,
      block: `${sname}'s shot is blocked by ${def ? pn(def.p) : 'a defender'}.`,
      post: hd || sty.st === 'chip' ? `${sname} hits the crossbar!` : `${sname} hits the post!`,
      clear: `${def ? cap1(pn(def.p)) : 'A defender'} clears ${sname}'s effort off the line!`
    }[sty.det];
    say(M, M.min, 'miss', line, si);
    if (sty.det === 'block' || sty.det === 'clear' || R.chance(.2)) corner(M, si);
  }
}
function attackFail(M, S, O, side) {
  if (R.chance(.09)) {
    const d = pickBy(O, x => ({ DC: 3, DL: 2, DR: 2, WBL: 1.5, WBR: 1.5, DM: 3, MC: 1.5 }[x.role] || .3) * attrs(x.p).Tck);
    const v = pickBy(S, x => ASSIST_W[x.role]);
    if (d && v) { M.vis.push({ min: M.min, t: 'tackle', side: 1 - side, e: d, v }); say(M, M.min, 'fl', `${cap1(pn(d.p))} with a perfectly timed sliding tackle on ${pn(v.p)}.`, 1 - side); }
  } else if (R.chance(.06)) {
    const c = pickBy(S, x => (attrs(x.p).Dri + attrs(x.p).Fla) * (['AML', 'AMR', 'AMC', 'ML', 'MR', 'FC'].includes(x.role) ? 2 : .3));
    const d = pickBy(O, x => ['DC', 'DL', 'DR', 'DM', 'WBL', 'WBR'].includes(x.role) ? 1 : .1);
    if (c && d && attrs(c.p).Dri >= 12) { const sk = R.pick(Object.keys(SKILLS)); M.vis.push({ min: M.min, t: 'dribble', side, e: c, def: d, sk }); say(M, M.min, 'skill', `${cap1(pn(c.p))} ${skillLine(sk, d)}, but the move breaks down.`, side); }
  } else if (R.chance(0.08)) flavor(M, S, O);
}
