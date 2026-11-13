// aihap.js: players at clubs the computer runs get the same kind of happiness detail as your own squad.
// Each week every player's mood is worked out from concrete reasons (game time against his status, the league
// position against the club's target, his faith in the manager, form, contract, wages, whether he has outgrown the
// club, captaincy, Champions League football, a new manager, homesickness). The strongest reasons are kept and shown
// on his player card. Unsettled players are cheaper to prise away. Loaded after jobs.js.

function aiClubs() { try { return jobClubs().filter(t => t !== G.user); } catch (e) { return []; } }
function clubLevel(tid) { const ca = squad(tid).map(p => p.ca).sort((a, b) => b - a).slice(0, 14); return ca.length ? ca.reduce((a, b) => a + b, 0) / ca.length : 65; }
function aiHapWeek() {
  const ssn = sd('2026-07-20'); const games = {};
  for (const f of Object.values(G.fx)) { if (!f.r || f.d < ssn || f.comp === 'PSF') continue; games[f.h] = (games[f.h] || 0) + 1; games[f.a] = (games[f.a] || 0) + 1; }
  const ucl = new Set([...((G.euroIn && G.euroIn.UCL) || []), ...((G.euro && G.euro.UCL && G.euro.UCL.teams) || [])]);
  for (const tid of aiClubs()) {
    const t = T(tid); const L = lgRow(tid); let tg = null; try { tg = boardTarget(tid).pos; } catch (e) { }
    const ms = msOf(tid); const lvl = clubLevel(tid); const n = games[tid] || 0;
    const newMgr = dDiff(ms.since, G.date) < 42 && ms.since > sd('2026-07-25');
    for (const p of squad(tid)) {
      if (p.loan || p.pseudo) continue;
      const R0 = []; const add = (v, k, a) => { if (Math.abs(v) >= 1) R0.push(a ? [Math.round(v), k, a] : [Math.round(v), k]); };
      const st = squadStatus(p); const amb = p.ca >= 78 ? 1.3 : p.ca >= 70 ? 1 : .7;
      // game time against his status
      if (n >= 4 && p.inj <= 0) { const r = p.st.s / n; const gap = r - STATUS_EXP[st]; if (gap < -.2) add(gap * 24, st === 'key' || st === 'first' ? 'gs' : 'gw'); else if (r >= .7 && st !== 'youth') add(4, 'gr'); else if (st === 'youth' && p.st.s >= 2) add(4, 'gy'); }
      // league position against the target
      if (L && L.r.p >= 5 && tg) {
        const d = tg - L.pos;
        if (d >= 3) add(Math.min(9, d * 1.6) * amb, 'lp', [L.pos]);
        else if (d <= -4) add(Math.max(-12, d * 1.5) * amb, 'le', [L.pos, tg]);
        if (L.pos === 1 && L.r.p >= 10) add(5, 'ti');
        if (L.pos > L.n - 3 && L.r.p >= 10) add(-6 * amb, 'rl');
      }
      // the manager
      if (/caretaker/i.test(t.mgr || '')) add(-3, 'ct');
      else if (newMgr) add(st === 'backup' || st === 'rotation' ? -3 : 4, st === 'backup' || st === 'rotation' ? 'nu' : 'nx');
      else if (ms.s < 28) add(-8 * amb, 'lf');
      else if (ms.s < 40) add(-3, 'dm');
      else if (ms.s >= 78 && (st === 'key' || st === 'first')) add(4, 'bp');
      // form
      if (p.form.length >= 3) { const fa = +formAvg(p); if (fa >= 7.3) add(6, 'fl'); else if (fa < 6.3) add(-5, 'sc'); }
      // contract and wages
      if (p.con <= G.year + 1 && p.ca >= 72 && p.age < 32 && G.date >= sd('2026-10-01')) add(-5, 'cn');
      let fair = 0; try { fair = wageFor(p, tid); } catch (e) { }
      if (fair && p.wage && p.wage < fair * .65 && p.ca >= 70) add(-5, 'up');
      // ambition and the club
      if (p.ca >= lvl + 7 && p.age >= 21 && p.age <= 30) add(-Math.min(10, (p.ca - lvl - 5) * 1.5), 'og');
      if (t.rep >= 88) add(3, 'bc');
      if (ucl.has(tid) && (st === 'key' || st === 'first')) add(3, 'cl');
      if (t.capt === p.id) add(5, 'cp');
      // homesick (young players far from home)
      if (p.age <= 21 && p.nat !== ctryOf(tid) && hash(p.n + '|home') % 5 === 0) add(-4, 'hs');
      R0.sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]));
      const target = clamp(64 + R0.reduce((s, x) => s + x[0], 0), 5, 97);
      p.hr = R0.slice(0, 4); if (!p.hr.length) delete p.hr;
      const old = hap(p); p.hap = Math.round(clamp(old + (target - old) * .3, 0, 100) * 10) / 10;
      // a big name falling out of love makes the news
      if (old >= 40 && p.hap < 40 && p.ca >= 80 && R0[0] && R0[0][0] < 0 && R.chance(.5)) { try { journPost(jr('gp'), `${p.n} unsettled at ${t.name}: sources say he ${hrText(p, R0[0])}. Clubs are monitoring the situation.`, {}); } catch (e) { } }
    }
  }
}
const _wkAH = weekly;
weekly = function () { _wkAH.apply(this, arguments); try { if (G && G.teams) aiHapWeek(); } catch (e) { console.error(e); } };

// reasons are saved as short codes; the words are put together when shown
function hrText(p, x) {
  const t = T(p.c) || {}; const short = t.short || t.name || 'the club'; const sS = /s$/.test(short) ? short + "'" : short + "'s";
  const mgr = (t.mgr || 'the manager').replace(/ \(caretaker\)/i, ''); const a = x[2] || [];
  return ({ gs: 'frustrated not to be a regular starter', gw: 'wants more first-team football', gr: 'enjoying regular first-team football', gy: 'thrilled to be getting first-team chances',
    lp: `proud of ${sS} league position (${ordinal(a[0])})`, le: `embarrassed by ${sS} league position (${ordinal(a[0])}, target ${ordinal(a[1])})`, ti: 'loving a title race', rl: 'worried about relegation',
    ct: 'unsettled while the club has only a caretaker in charge', nu: `unsure where he fits under new manager ${mgr}`, nx: `excited by new manager ${mgr}`, lf: `has lost faith in ${mgr}`,
    dm: `doubts about ${mgr}'s methods`, bp: `believes in ${mgr}'s project`, fl: 'in the form of his life', sc: 'short of confidence', cn: 'uncertain about his future with his contract running down',
    up: 'feels underpaid', og: 'feels he has outgrown the club', bc: 'proud to play for one of the biggest clubs in the world', cl: 'loving Champions League nights', cp: 'proud to captain the club', hs: 'homesick' })[x[1]] || '';
}
// what the player card shows: the same "Happy about / Bothered by" layout as for your own players
function aiHapHtml(p) {
  const h = Math.round(hap(p)); const rs = p.hr || [];
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  const li = (xs, c, ic) => xs.map(x => `<li><span class="${c}">${ic}</span> ${esc(cap(hrText(p, x)))}</li>`).join('');
  const pos = rs.filter(x => x[0] > 0), neg = rs.filter(x => x[0] < 0);
  return `<h2 class="sect">Happiness</h2><div class="row" style="gap:16px;flex-wrap:wrap"><span>Happiness: <b class="${hapCls(h)}">${hapLabel(h)} (${h})</b></span><span>Morale: <b>${moraleLabel(p.mor)} (${Math.round(p.mor)})</b></span><span class="dim">Status at ${esc(tName(p.c, false))}: ${STATUS_LABEL[squadStatus(p)]}</span></div>
  <div class="grid2" style="margin-top:8px;gap:10px"><div class="box pad"><label class="lb">Happy about</label><ul class="hapl">${li(pos, 'grn', '▲') || '<li class="dim">Nothing in particular</li>'}</ul></div><div class="box pad"><label class="lb">Bothered by</label><ul class="hapl">${li(neg, 'red', '▼') || '<li class="dim">Nothing in particular</li>'}</ul></div></div>${h < 50 ? `<div class="dim" style="font-size:12.5px;margin-top:4px">Unsettled players are easier and cheaper to sign.</div>` : ''}${!rs.length ? '<div class="dim" style="font-size:12.5px;margin-top:4px">His mood is updated each week once the season is under way.</div>' : ''}`;
}
const _peAH = playerExtra;
playerExtra = function (p) {
  const h = _peAH(p);
  try { if (p && p.c !== G.user && T(p.c) && !T(p.c).lite && !T(p.c).nat && !p.leg) return h + aiHapHtml(p); } catch (e) { console.error(e); }
  return h;
};
// unsettled players cost less
const _apAH = askingPrice;
askingPrice = function (p) { const v = _apAH(p); try { if (p.c !== G.user) { const h = hap(p); if (h < 50) return Math.round(v * (1 - (50 - h) / 160) * 10) / 10; } } catch (e) { } return v; };
