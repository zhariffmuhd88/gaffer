// aisquad.js: AI clubs manage their squads like the user does. Loaded after offerdue.js.
//  - Each AI club reviews its squad about once a month (and when a window opens): surplus, ageing or out-of-favour
//    players go on the transfer list, and players who are too good for the bench or have outgrown the club hand in
//    transfer requests (so the search filters "Transfer listed" and "Wants to leave" find real players).
//  - Listed players and players who want out are cheaper, keener to move and get sold between AI clubs during windows.
//  - Flags clear when the player moves, and are reviewed again at the next review.

function aiRoll(s) { return (hash(String(s) + '|' + G.date) % 1000) / 1000; }
function aiTeams() { return fullTeams().filter(t => t !== G.user && T(t) && !T(t).lite && G.sq[t]); }
function aiAvgXI(tid) { const s = squad(tid).filter(p => p.c === tid).map(p => p.ca).sort((a, b) => b - a).slice(0, 11); return s.length ? s.reduce((a, b) => a + b, 0) / s.length : 60; }
function aiClear(p) { if (p.aiL) { p.listed = false; p.aiL = false; } if (p.aiR) { p.req = false; p.aiR = false; if (hap(p) < 50) p.hap = 62; } p.aiClub = null; }
function aiReview(tid, quiet) {
  const t = T(tid); if (!t || t.lite || tid === G.user) return;
  const sq = squad(tid).filter(p => p.c === tid && !p.loan);
  for (const p of sq) aiClear(p);
  const avg = aiAvgXI(tid), yr = G.year, out = [];
  // transfer list: surplus to requirements
  const cand = [];
  const gks = sq.filter(p => p.pos === 'GK').sort((a, b) => b.ca - a.ca);
  for (const p of sq) {
    const imp = importance(p), left = (p.con || yr) - yr; let s = 0;
    if (imp === 'backup' && p.age >= 22 && p.ca < avg - 6) s += 2 + (avg - 6 - p.ca) / 4;
    if (p.age >= 31 && imp !== 'key' && left <= 1) s += 2;
    if (imp === 'rotation' && p.age >= 29 && p.ca < avg - 4 && left <= 1) s += 1;
    if (p.age <= 19 || imp === 'key' || imp === 'first') s = 0;
    if (p.pos === 'GK' && gks.indexOf(p) < 3 && !(p.age >= 33 && left <= 1)) s = 0;   // clubs keep three keepers
    if (s > 0) cand.push([p, s + aiRoll(p.id + 'L') * 1.5]);
  }
  const cap = clamp(sq.length - 21, 1, 5);
  cand.sort((a, b) => b[1] - a[1]);
  for (const [p, s] of cand.slice(0, cap)) if (s >= 1.6) { p.listed = true; p.aiL = true; p.aiClub = tid; out.push(['L', p]); }
  // transfer requests: outgrown the club, or good enough to start elsewhere
  const req = [];
  for (const p of sq) {
    if (p.listed || p.age < 20 || p.age > 31) continue; const imp = importance(p); const r = aiRoll(p.id + 'R'); let w = 0;
    if (p.ca >= avg + 5 && t.rep <= p.ca - 6 && t.rep < 86 && p.age <= 30) w = .3;   // outgrown this club
    else if ((imp === 'rotation' || imp === 'backup') && p.ca >= avg - 3 && p.age >= 21) w = .16;  // not playing enough
    if (w && r < w) req.push(p);
  }
  for (const p of req.sort((a, b) => b.ca - a.ca).slice(0, 2)) { p.req = true; p.aiR = true; p.aiClub = tid; p.hap = Math.min(hap(p), 12 + Math.round(aiRoll(p.id + 'H') * 14)); out.push(['R', p]); }
  t.aiRev = G.date;
  if (!quiet) for (const [k, p] of out.filter(x => x[1].ca >= (divOf(tid) === divOf(G.user) ? 74 : 82)).sort((a, b) => b[1].ca - a[1].ca).slice(0, 1)) {
    try { news('Transfer', k === 'R' ? `${p.n} has handed in a transfer request at ${tName(tid)}.` : `${tName(tid)} have placed ${p.n} on the transfer list.`, tid); } catch (e) { }
  }
  return out;
}
function aiReviewDue() {
  const ts = aiTeams();
  if (!G.aiRevD) { for (const t of ts) { aiReview(t, true); T(t).aiRev = addDays(G.date, -(hash(t) % 28)); } G.aiRevD = G.date; return; }
  for (const t of ts) { const tt = T(t); if (!tt.aiRev || dDiff(tt.aiRev, G.date) >= 30) aiReview(t); }
}
// listed and unsettled players move between AI clubs during a window
function aiSellOff() {
  if (!G.window) return;
  const pool = Object.values(G.players).filter(p => (p.aiL || p.aiR) && p.c && p.c !== G.user && p.c === p.aiClub && !p.loan && T(p.c) && !T(p.c).lite && squad(p.c).length > 20);
  let n = 0;
  for (const p of pool.sort((a, b) => aiRoll(a.id + 'S') - aiRoll(b.id + 'S'))) {
    if (n >= 3) break; if (aiRoll(p.id + 'S2') > .22) continue;
    const fee = askingPrice(p);
    const buyers = aiTeams().filter(b => b !== p.c && T(b).tb >= fee && T(b).rep >= p.ca - 14 && T(b).rep <= p.ca + 6 && squad(b).length < 30 && playerInterest(p, b) === 'yes');
    if (!buyers.length) continue; const b = buyers[hash(p.id + G.date) % buyers.length];
    T(b).tb -= fee; completeTransfer(p, b, fee, wageFor(p, b), 2 + (hash(p.id) % 3)); n++;
  }
}
function aiWeekly() { aiReviewDue(); aiSellOff(); for (const p of Object.values(G.players)) if ((p.aiL || p.aiR) && p.c !== p.aiClub) aiClear(p); }

const _wdAi = weeklyDynamics;
weeklyDynamics = function () { const r = _wdAi.apply(this, arguments); try { aiWeekly(); } catch (e) { console.error(e); } return r; };
// a new window: every club takes a fresh look at its squad
const _dtAi = dailyTick;
dailyTick = function () { const w0 = G.window; const r = _dtAi.apply(this, arguments); try { if (!w0 && G.window) for (const t of aiTeams()) aiReview(t, true); } catch (e) { console.error(e); } return r; };
// flags clear as soon as he moves (including to you)
const _ctAi = completeTransfer;
completeTransfer = function (p) { const r = _ctAi.apply(this, arguments); try { if (p && (p.aiL || p.aiR)) aiClear(p); if (p && p.req && p.c === G.user && !p.aiR) { p.req = false; } } catch (e) { } return r; };
// a club wants to cash in on a player who has asked to leave; and he wants to go
const _askAi = askingPrice;
askingPrice = function (p) { const v = _askAi(p); try { if (p && p.aiR && p.c !== G.user) return Math.max(0.1, Math.round(v * .85 * 10) / 10); } catch (e) { } return v; };
const _piAi = playerInterest;
playerInterest = function (p, toTid) { const i = _piAi(p, toTid); try { if (p && p.aiR && i === 'maybe') return 'yes'; } catch (e) { } return i; };
// older saves and a new game: review straight away so lists are never empty
const _scrAi = screen;
screen = function (s) { try { if (G && G.user && !G.aiRevD) aiReviewDue(); } catch (e) { console.error(e); } return _scrAi(s); };
// status line in the player view for players at other clubs
const _pmAi = playerModal;
playerModal = function (pid) {
  _pmAi.apply(this, arguments);
  try {
    const p = P(pid); if (!p || !p.c || p.c === G.user || !UI.modal || UI.modal.includes('class="aistat"') || !(p.listed || p.req)) return;
    const t = [p.listed ? `<span class="tag" style="background:var(--amb);color:#111">Transfer listed by ${esc(tName(p.c))}</span>` : '', p.req ? '<span class="tag" style="background:var(--red);color:#fff">Wants to leave</span>' : ''].join(' ');
    const why = p.req ? (importance(p) === 'rotation' || importance(p) === 'backup' ? 'He is unhappy with his playing time.' : 'He feels he has outgrown the club.') : 'The club see him as surplus to requirements.';
    UI.modal = UI.modal.replace('<div class="mc">', `<div class="mc"><div class="aistat" style="margin-bottom:8px">${t} <span class="dim" style="font-size:12.5px">${why} His club will accept less, and he is keener to move.</span></div>`); render();
  } catch (e) { console.error(e); }
};
