// bdo.js: the Ballon d'Or, with managers voting (game scenario: club managers, you included, form the jury).
// At the end of each season a 30-man shortlist is drawn up from the season's performances (ratings, goals, assists,
// clean sheets, trophies, international titles). You rank your top five before the ceremony in late September;
// every other club manager votes too, leaning a little towards his own players, compatriots and his own league.
// Loaded after doc2.js.

const BDO_PTS = [6, 4, 3, 2, 1];
function bdoScore(p) {
  const st = p.st; if (!st || st.a < 20) return -1;
  const avg = st.r / st.a; let s = (avg - 6.6) * 45 + st.g * 1.3 + st.as * .8 + p.ca * .6 + (p.pos === 'GK' ? st.cs * .9 : 0);
  try { for (const tr of seasonTrophies(p.c)) s += (TRO_W[tr] || 3) * .9; } catch (e) { }
  const y = String(G.year + 1); for (const h of p.nh || []) if (h.includes(y)) s += /World Cup/.test(h) ? 25 : /Euro|European/.test(h) ? 18 : 5;
  return s * ({ PL: 1, LL: 1, SA: .97, BL: .97, L1: .92, ED: .8, SPL: .72, CH: .6, LO: .4 }[divOf(p.c)] || .7);
}
function bdoShortlist() {
  const ps = Object.values(G.players).filter(p => p && T(p.c) && !T(p.c).lite && !T(p.c).nat && !p.pseudo && !p.leg).map(p => [p, bdoScore(p)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 30);
  G.bdo = { s: seasonLabel(G.year), due: `${G.year + 1}-09-22`, list: ps.map(([p, sc]) => [p.id, Math.round(sc), p.c, p.st.a, p.st.g, p.st.as, p.st.cs, Math.round(p.st.r / p.st.a * 100) / 100]), uv: null, done: false };
  msg(`Ballon d'Or ${G.bdo.s}: cast your vote`, `The 30-man shortlist for the ${G.bdo.s} Ballon d'Or is out. As a manager you are part of the jury: rank your top five before the ceremony on ${dShort(G.bdo.due)}.`, { k: 'bdo' });
  news("Ballon d'Or", `The ${G.bdo.s} shortlist is out: ${ps.slice(0, 6).map(([p]) => p.n).join(', ')} and 24 more. Managers vote this year (game scenario); the winner is crowned on ${dShort(G.bdo.due)}.`, null, true);
}
const _seBdo = seasonEnd;
seasonEnd = function () { try { if (G && G.players) bdoShortlist(); } catch (e) { console.error(e); } return _seBdo.apply(this, arguments); };

function natName(code) { try { const n = natRow(code); return n ? n.name : code; } catch (e) { return code; } }
function bdoCeremony() {
  const B = G.bdo; if (!B || B.done) return; B.done = true;
  const pts = {}; const add = (pid, v) => { pts[pid] = (pts[pid] || 0) + v; };
  const cands = B.list.filter(x => P(x[0]));
  let voters = 0;
  for (const tid of jobClubs()) {
    if (tid === G.user) continue; const t = T(tid); const mn = t.mgr || ''; const md = (typeof mgrIndex === 'function' && mgrIndex()[mn]) || null; const lg = divOf(tid);
    const ranked = cands.map(x => { const p = P(x[0]); let v = x[1] * (0.7 + R.f() * .6); if (p.c === tid) v *= 1.15; if (md && natName(p.nat) === md[1]) v *= 1.08; if (divOf(p.c) === lg) v *= 1.05; return [x[0], v]; }).sort((a, b) => b[1] - a[1]).slice(0, 5);
    ranked.forEach(([pid], i) => add(pid, BDO_PTS[i])); voters++;
  }
  if (B.uv) { B.uv.forEach((pid, i) => { if (pid) add(pid, BDO_PTS[i]); }); voters++; }
  const res = Object.entries(pts).sort((a, b) => b[1] - a[1]);
  B.res = res.slice(0, 10).map(([pid, v]) => [pid, v, P(pid).c]); B.voters = voters;
  const w = P(res[0][0]); w.bdo = (w.bdo || []).concat(B.s);
  G.bdoHist = (G.bdoHist || []).concat({ s: B.s, w: w.id, n: w.n, c: w.c });
  news("Ballon d'Or", `${w.n} (${tName(w.c, false)}) wins the ${B.s} Ballon d'Or with ${res[0][1]} points from ${voters} managers' votes. ${P(res[1][0]).n} is second and ${P(res[2][0]).n} third.`, w.c, true);
  const nw = G.news.find(x => x.id === G.newsId); if (nw) nw.act = { k: 'bdor' };
  try { fanPost(w.c, R.pick([`BALLON D'OR WINNER 🏆✨ ${surname(w.n).toUpperCase()}!!!`, `Best player on the planet. Officially. ${surname(w.n)} 👑`]), { big: true, u: w.c === G.user ? 1 : 0 }); trend('BallonDor', 6); } catch (e) { }
  if (w.c === G.user) { G.fans = clamp((G.fans ?? 60) + 5, 0, 100); G.board = clamp(G.board + 3, 0, 100); w.mor = clamp(w.mor + 10, 5, 100); }
  if (B.uv) msg("Ballon d'Or", `Your vote: ${B.uv.map((pid, i) => `${i + 1}. ${P(pid) ? P(pid).n : '-'}`).join(', ')}. ${B.uv[0] === w.id ? 'Your number one won it.' : `The winner was ${w.n}.`}`, { k: 'bdor' });
}
const _dtBdo = dailyTick;
dailyTick = function () { try { if (G && G.bdo && !G.bdo.done && G.date >= G.bdo.due) bdoCeremony(); } catch (e) { console.error(e); } return _dtBdo.apply(this, arguments); };

// ---------- voting and results ----------
function bdoVoteHtml() {
  const B = G.bdo; if (!B) return '';
  UI.bdoPick = UI.bdoPick || (B.uv ? B.uv.slice() : [null, null, null, null, null]);
  const pk = UI.bdoPick; const open = !B.done;
  const rows = B.list.filter(x => P(x[0])).map(x => { const p = P(x[0]); const r = pk.indexOf(x[0]); return `<tr class="${r >= 0 ? 'me' : ''}"><td>${pLink(x[0])} <span class="dim mono">${POS_LABEL[p.pos] || p.pos}</span></td><td>${tLink(x[2], false)}</td><td class="n">${x[3]}</td><td class="n">${x[4]}</td><td class="n">${x[5]}</td><td class="n">${p.pos === 'GK' ? x[6] : ''}</td><td class="n mono">${x[7]}</td><td style="white-space:nowrap">${open ? [0, 1, 2, 3, 4].map(i => `<button class="btn${pk[i] === x[0] ? ' pri' : ''}" style="padding:2px 7px;min-width:0" data-a="bdop" data-v="${x[0]}" data-k="${i}">${i + 1}</button>`).join('') : (r >= 0 ? ordinal(r + 1) : '')}</td></tr>`; }).join('');
  return `<div class="band"><span>Ballon d'Or ${esc(B.s)} · your vote</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">
  <p>${open ? `Rank five players (1 = your winner; points 6-4-3-2-1). Votes close on ${dShort(B.due)}.` : 'Voting has closed.'}</p>
  <p><b>Your ballot:</b> ${pk.map((pid, i) => `${i + 1}. ${pid && P(pid) ? esc(P(pid).n) : '<span class="dim">—</span>'}`).join(' · ')}</p>
  ${open ? `<div class="row" style="margin-bottom:8px"><button class="btn pri" data-a="bdos">${B.uv ? 'Update my vote' : 'Submit my vote'}</button>${B.uv ? '<span class="grn" style="align-self:center">Vote submitted</span>' : ''}</div>` : ''}
  <div class="tw"><table class="t"><thead><tr><th>Player</th><th>Club</th><th class="n">Apps</th><th class="n">Gls</th><th class="n">Ast</th><th class="n">CS</th><th class="n">Avg</th><th>Rank</th></tr></thead><tbody>${rows}</tbody></table></div>
  <p class="dim" style="font-size:12px">Season stats in all competitions for ${esc(B.s)}. Game scenario: managers form the jury.</p></div>`;
}
function bdoResHtml() {
  const B = G.bdo; if (!B || !B.res) return '';
  return `<div class="band"><span>Ballon d'Or ${esc(B.s)} · results</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">
  <div class="tw"><table class="t"><thead><tr><th>#</th><th>Player</th><th>Club</th><th class="n">Points</th><th>Your vote</th></tr></thead><tbody>${B.res.map(([pid, v, c], i) => `<tr class="${i === 0 ? 'me' : ''}"><td>${i === 0 ? '🏆' : i + 1}</td><td>${pLink(pid)}</td><td>${tLink(c, false)}</td><td class="n">${v}</td><td class="dim">${B.uv && B.uv.includes(pid) ? ordinal(B.uv.indexOf(pid) + 1) : ''}</td></tr>`).join('')}</tbody></table></div>
  <p class="dim">${B.voters} managers voted.</p>${(G.bdoHist || []).length > 1 ? `<h2 class="sect">Winners in this save</h2>${G.bdoHist.map(h => `<div>${esc(h.s)}: ${pLink(h.w, h.n)} <span class="dim">(${esc(tName(h.c, false))})</span></div>`).join('')}` : ''}</div>`;
}
Object.assign(ACT, {
  bdov: () => { UI.bdoPick = null; UI.modal = bdoVoteHtml(); render(); },
  bdop: (v, el) => { const i = +(el && el.dataset ? el.dataset.k : 0); const pk = UI.bdoPick; for (let j = 0; j < 5; j++) if (pk[j] === v) pk[j] = null; pk[i] = v; UI.modal = bdoVoteHtml(); render(); },
  bdos: () => { const pk = UI.bdoPick || []; if (pk.filter(Boolean).length < 5) { toast('Rank five different players first.'); return; } G.bdo.uv = pk.slice(); toast("Your Ballon d'Or vote is in."); autosave(); UI.modal = bdoVoteHtml(); render(); },
  bdor: () => { UI.modal = bdoResHtml(); render(); }
});
const _maBdo = msgActions;
msgActions = function (m) {
  if (m && m.act && m.act.k === 'bdo') return G.bdo && !G.bdo.done ? `<div class="row" style="margin-top:12px"><button class="btn pri" data-a="bdov">${G.bdo.uv ? 'See or change my vote' : 'Vote now'}</button></div>` : '<div class="dim" style="margin-top:12px">Voting has closed.</div>';
  if (m && m.act && m.act.k === 'bdor') return G.bdo && G.bdo.res ? `<div class="row" style="margin-top:12px"><button class="btn pri" data-a="bdor">Full results</button></div>` : '';
  return _maBdo(m);
};
// awards screen and player cards
const _awBdo = scrAwards;
scrAwards = function () {
  let h = _awBdo(); const B = G.bdo;
  if (B) h = h.replace('</div>', `</div><div class="box pad" style="margin:8px 0"><b>Ballon d'Or ${esc(B.s)}</b> · ${B.res ? `Winner: ${pLink(B.res[0][0])} <button class="btn" data-a="bdor">Results</button>` : `ceremony ${dShort(B.due)} <button class="btn pri" data-a="bdov">${B.uv ? 'Your vote' : 'Vote now'}</button>`}</div>`);
  return h;
};
const _peBdo = playerExtra;
playerExtra = function (p) { const h = _peBdo(p); try { if (p && p.bdo && p.bdo.length) return h + `<div class="box pad" style="margin-top:8px;border-color:var(--yel)"><label class="lb">Ballon d'Or</label>${p.bdo.map(s => `<div>🏆 ${esc(s)}</div>`).join('')}</div>`; } catch (e) { } return h; };
