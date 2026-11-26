// holiday.js: go on holiday for a set period. Your assistant picks the team and plays every match, answers offers
// for your players by the rule you set, and the game runs day by day until you are back (or something needs you).
// Loaded after aisquad.js.

function holMax() { const end = (G.tasks || []).filter(t => t.t === 'seasonEnd').map(t => t.d).sort()[0]; return end || addDays(G.date, 120); }
function holWindowOpen() { const d = (G.tasks || []).filter(t => t.t === 'winOpen' && t.d > G.date).map(t => t.d).sort()[0]; return d || null; }
function holNextMatchAfter(days) { const fs = Object.values(G.fx || {}).filter(f => !f.r && (f.h === G.user || f.a === G.user) && f.d > G.date).sort((a, b) => a.d < b.d ? -1 : 1); return fs; }
function holPresets() {
  const out = [['7', '1 week', addDays(G.date, 7)], ['14', '2 weeks', addDays(G.date, 14)], ['30', '1 month', addDays(G.date, 30)]];
  const w = holWindowOpen(); if (w) out.push(['win', 'Until the window opens', w]);
  out.push(['end', 'Until the end of the season', holMax()]);
  return out.filter(x => x[2] > G.date && x[2] <= holMax());
}
function holModal() {
  if (G.sacked) return toast('You need a job before you can take a holiday.');
  const H = UI.hol = UI.hol || { until: addDays(G.date, 14), offers: 'reject', finals: true, sel: '14' };
  if (H.until <= G.date) H.until = addDays(G.date, 7);
  const ps = holPresets(); const fs = holNextMatchAfter().filter(f => f.d <= H.until);
  UI.modal = `<div class="hol"><div class="band"><span>Go on holiday</span><button class="x" data-a="close">✕</button></div><div class="mc">
    <p style="margin-top:0">Your assistant takes charge: he picks the team for every match, plays them, and runs the club day to day until you are back.</p>
    <label class="lb">How long?</label>
    <div class="row hol-ps">${ps.map(([k, l, d]) => `<button class="btn sm ${H.sel === k ? 'pri' : ''}" data-a="holset" data-v="${k}">${l}<span class="dim"> · ${esc(dShort(d))}</span></button>`).join('')}</div>
    <div class="row" style="margin-top:8px;align-items:center;gap:8px"><label class="lb" for="holdate" style="margin:0">Or back on</label><input class="f" type="date" id="holdate" data-hol="date" value="${H.until}" min="${addDays(G.date, 1)}" max="${holMax()}" style="max-width:180px"></div>
    <div class="dim" style="font-size:13px;margin-top:6px">Back on <b>${esc(dNice(H.until))}</b> · ${dDiff(G.date, H.until)} day(s) · ${fs.length} match${fs.length === 1 ? '' : 'es'} while you are away${fs.length ? `: ${fs.slice(0, 6).map(f => `${COMP_SHORT[f.comp] || f.comp} ${f.h === G.user ? 'v ' + esc(tName(f.a)) : 'at ' + esc(tName(f.h))}`).join(', ')}${fs.length > 6 ? '…' : ''}` : ''}.</div>
    <label class="lb" for="holoff" style="margin-top:12px">Offers for your players</label>
    <select class="f" id="holoff" data-hol="offers"><option value="reject" ${H.offers === 'reject' ? 'selected' : ''}>Reject them all</option><option value="value" ${H.offers === 'value' ? 'selected' : ''}>Accept offers at or above his value, reject the rest</option><option value="listed" ${H.offers === 'listed' ? 'selected' : ''}>Accept offers for transfer-listed players only</option><option value="stop" ${H.offers === 'stop' ? 'selected' : ''}>Come back to answer them myself</option></select>
    <label class="row" style="margin-top:10px;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" data-hol="finals" ${H.finals ? 'checked' : ''}> Come back for cup semi-finals and finals</label>
    <div class="dim" style="font-size:12.5px;margin-top:6px">You also come back early if the season ends, you lose your job, or a club offers you a job.</div>
    <div class="row" style="margin-top:14px"><button class="btn pri" data-a="holgo">Go on holiday</button><button class="btn" data-a="close">Cancel</button></div>
  </div></div>`;
  render();
}
function holBig(f) { return f && (f.rnd === 'Final' || String(f.rnd || '').includes('Semi')); }
function holOffer(o) {
  const H = G.holiday, p = P(o.pid); const val = calcValue(p);
  const acc = H.offers === 'value' ? o.fee >= val : H.offers === 'listed' ? !!p.listed : false;
  const r = respondOffer(o.id, acc); H.log.push({ k: 'offer', t: `${acc ? 'Accepted' : 'Rejected'} ${money(o.fee)} from ${o.abroad ? o.buyer : tName(o.to)} for ${p.n}${r && r.ok === false && acc ? ' (fell through)' : ''}` });
}
function holPlay(fid) {
  const f = G.fx[fid]; const H = G.holiday;
  try { autoPick(G.user, true); } catch (e) { }
  const pre = preMatch(f); const M = createMatch(fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre);
  const ui = uSide(M), gf = M.score[ui], ga = M.score[1 - ui];
  const won = gf > ga || (M.pens && M.pens[ui] > M.pens[1 - ui]), lost = !won && (gf < ga || !!M.pens);
  G.fans = clamp((G.fans ?? 60) + (won ? 1.5 : lost ? -2 : 0), 0, 100);
  H.res.push({ d: f.d, comp: f.comp, rnd: f.rnd || '', opp: f.h === G.user ? f.a : f.h, home: f.h === G.user, gf, ga, pens: M.pens ? [M.pens[ui], M.pens[1 - ui]] : null, w: won ? 'W' : lost ? 'L' : 'D' });
  finishDay();
}
// one day (or one match) at a time; returns a reason to stop or null
function holStep() {
  const H = G.holiday;
  if (G.sacked) return 'sacked';
  if (G.date >= H.until && !userFixtureOn(G.date)) return 'done';
  const uf = userFixtureOn(G.date);
  if (uf) { if (H.finals && holBig(uf)) return 'big'; holPlay(uf.id); return null; }
  const due = typeof offersDue === 'function' ? offersDue() : [];
  if (due.length) { if (H.offers === 'stop') return 'offer'; due.forEach(holOffer); }
  const jobs0 = (G.joff || []).length;
  const r = advance();
  if (r.type === 'season') return 'season';
  if (r.type === 'sacked' || G.sacked) return 'sacked';
  if (r.type === 'offer') { const d2 = offersDue(); if (H.offers === 'stop' && d2.length) return 'offer'; d2.forEach(holOffer); }
  if ((G.joff || []).length > jobs0) return 'job';
  if (r.type === 'match') { const f = G.fx[r.fid]; if (H.finals && holBig(f)) return 'big'; holPlay(r.fid); }
  return null;
}
function holGo() {
  const H0 = UI.hol; if (!H0 || H0.until <= G.date) return;
  const t = userTeam();
  G.holiday = { from: G.date, until: H0.until, offers: H0.offers, finals: H0.finals, res: [], log: [], pos0: holPos(), bal0: t.bal, sq0: squad(G.user).map(p => p.id), tac0: t.tac ? JSON.parse(JSON.stringify(t.tac)) : null, news0: (G.news || []).length };
  UI.modal = `<div class="hol"><div class="band"><span>On holiday</span></div><div class="mc"><p id="holprog" style="margin:0">Leaving the club in your assistant's hands…</p><div class="holbar"><i id="holbarI" style="width:0%"></i></div><div class="row" style="margin-top:10px"><button class="btn" data-a="holstop">Come back now</button></div></div></div>`;
  render(); UI.holRun = true; setTimeout(holLoop, 30);
}
function holLoop() {
  const H = G.holiday; if (!H) return; let why = null, n = 0; const t0 = performance.now();
  try { while (!why && UI.holRun && performance.now() - t0 < 120 && n++ < 40) why = holStep(); } catch (e) { console.error(e); why = 'error'; }
  if (!UI.holRun && !why) why = 'early';
  if (why) return holEnd(why);
  const tot = Math.max(1, dDiff(H.from, H.until)), done = clamp(dDiff(H.from, G.date), 0, tot);
  const el = document.getElementById('holprog'); if (el) el.innerHTML = `${esc(dNice(G.date))} · ${H.res.length} match${H.res.length === 1 ? '' : 'es'} played${H.res.length ? ` · last: ${holResTxt(H.res[H.res.length - 1])}` : ''}`;
  const b = document.getElementById('holbarI'); if (b) b.style.width = Math.round(done / tot * 100) + '%';
  setTimeout(holLoop, 16);
}
function holPos() { try { const tb = tableOf(userDiv()); const i = tb.findIndex(r => r.t === G.user); return i >= 0 ? i + 1 : null; } catch (e) { return null; } }
function holResTxt(r) { return `${r.w} ${r.gf}-${r.ga}${r.pens ? ` (${r.pens[0]}-${r.pens[1]} pens)` : ''} ${r.home ? 'v' : 'at'} ${tName(r.opp)}`; }
function holEnd(why) {
  const H = G.holiday; UI.holRun = false; G.holiday = null; if (!H) return;
  const t = userTeam();
  // put your own team selection back for the players still available
  try { if (H.tac0 && t.tac && H.tac0.xi) { const ok = (id) => id && P(id) && P(id).c === G.user && available(P(id)); if (H.tac0.xi.every(ok)) { t.tac.xi = H.tac0.xi.slice(); if (H.tac0.bench) t.tac.bench = H.tac0.bench.filter(ok); } } } catch (e) { }
  const w = H.res.filter(r => r.w === 'W').length, d = H.res.filter(r => r.w === 'D').length, l = H.res.filter(r => r.w === 'L').length;
  const pos1 = holPos(), now = squad(G.user).map(p => p.id);
  const outP = H.sq0.filter(id => !now.includes(id)).map(P).filter(Boolean), inP = now.filter(id => !H.sq0.includes(id)).map(P).filter(Boolean);
  const reason = { done: 'Your holiday is over.', early: 'You cut your holiday short.', big: 'You came back for a big match.', offer: 'You came back to answer an offer for one of your players.', season: 'The season is over.', sacked: 'You came back to bad news.', job: 'A club has offered you a job.', error: 'You were called back.' }[why] || '';
  const res = H.res.map(r => `<tr><td class="mono dim">${esc(dShort(r.d))}</td><td>${esc(COMP_SHORT[r.comp] || r.comp)}${r.rnd && r.comp !== 'PL' && r.comp !== 'CH' ? ` <span class="dim holrnd">${esc(r.rnd)}</span>` : ''}</td><td>${r.home ? 'v' : 'at'} ${tLink(r.opp)}</td><td class="mono"><b class="${r.w === 'W' ? 'grn' : r.w === 'L' ? 'red' : ''}">${r.w} ${r.gf}-${r.ga}</b>${r.pens ? ` <span class="dim">(${r.pens[0]}-${r.pens[1]} p)</span>` : ''}</td></tr>`).join('');
  G.holLast = { from: H.from, to: G.date, w, d, l, why };
  msg('Back from holiday', `You were away from ${dNice(H.from)} to ${dNice(G.date)}. ${H.res.length ? `Your assistant's record: won ${w}, drew ${d}, lost ${l}.` : 'There were no matches.'}${pos1 ? ` You are ${ordinal(pos1)} in the league${H.pos0 && H.pos0 !== pos1 ? ` (were ${ordinal(H.pos0)})` : ''}.` : ''}${H.log.length ? ' Offers: ' + H.log.map(x => x.t).join('; ') + '.' : ''}`);
  UI.scr = 'inbox'; UI.msg = null;
  UI.modal = `<div class="hol"><div class="band"><span>Back from holiday</span><button class="x" data-a="close">✕</button></div><div class="mc">
    <p style="margin-top:0"><b>${esc(reason)}</b> ${esc(dNice(H.from))} to ${esc(dNice(G.date))}.</p>
    <div class="grid3"><div class="box pad"><label class="lb">Record</label><div class="big">${w}-${d}-${l}</div><div class="dim">W-D-L</div></div><div class="box pad"><label class="lb">League</label><div class="big">${pos1 ? ordinal(pos1) : '–'}</div><div class="dim">${H.pos0 && pos1 ? (H.pos0 === pos1 ? 'no change' : pos1 < H.pos0 ? `up from ${ordinal(H.pos0)}` : `down from ${ordinal(H.pos0)}`) : ''}</div></div><div class="box pad"><label class="lb">Balance</label><div class="big">${money(t.bal)}</div><div class="dim">${t.bal - H.bal0 >= 0 ? '+' : ''}${money(t.bal - H.bal0)}</div></div></div>
    ${res ? `<h2 class="sect">Results</h2><div class="tw"><table class="t"><tbody>${res}</tbody></table></div>` : ''}
    ${H.log.length ? `<h2 class="sect">Offers</h2><ul class="rellog">${H.log.map(x => `<li>${esc(x.t)}</li>`).join('')}</ul>` : ''}
    ${outP.length || inP.length ? `<h2 class="sect">Squad changes</h2><p style="margin:0">${outP.length ? 'Left: ' + outP.map(p => esc(p.n)).join(', ') + '. ' : ''}${inP.length ? 'Joined: ' + inP.map(p => esc(p.n)).join(', ') + '.' : ''}</p>` : ''}
    <p class="dim" style="font-size:13px">${(G.news || []).length - H.news0} new message(s) are waiting in your inbox.</p>
    <div class="row"><button class="btn pri" data-a="holdone">${why === 'season' ? 'See the season review' : why === 'sacked' || why === 'job' ? 'Look at jobs' : why === 'big' ? 'Go to the match' : why === 'offer' ? 'Answer the offer' : 'Back to work'}</button></div>
  </div></div>`;
  UI.holWhy = why; autosave(); render();
}
function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
Object.assign(ACT, {
  holiday: () => holModal(),
  holset: (v) => { const p = holPresets().find(x => x[0] === v); if (p) { UI.hol.until = p[2]; UI.hol.sel = v; } holModal(); },
  holgo: () => holGo(),
  holstop: () => { UI.holRun = false; },
  holdone: () => { const why = UI.holWhy; UI.holWhy = null; UI.modal = null; if (why === 'season') return seasonModal(); if (why === 'sacked' || (why === 'job' && G.sacked)) return jobsModal(); if (why === 'big') { UI.scr = 'prematch'; } if (why === 'offer' && typeof offerDueModal === 'function' && offerDueModal()) return render(); if (why === 'job') UI.scr = 'jobs'; render(); }
});
document.addEventListener('change', (ev) => {
  const el = ev.target, k = el && el.dataset && el.dataset.hol; if (!k || !UI.hol) return;
  if (k === 'date') { const d = el.value; if (d && d > G.date && d <= holMax()) { UI.hol.until = d; UI.hol.sel = null; } holModal(); }
  else if (k === 'finals') UI.hol.finals = el.checked;
  else UI.hol[k] = el.value;
});
// a Holiday button next to Continue
const _rdHol = render;
render = function () {
  const r = _rdHol.apply(this, arguments);
  try { if (G && G.holiday && !UI.holRun && !UI.holRec) { UI.holRec = true; setTimeout(() => { UI.holRec = false; if (G.holiday && !UI.holRun) holEnd('early'); }, 0); } } catch (e) { }
  try { const go = document.getElementById('go'); if (go && G && G.user && !G.sacked && !document.getElementById('holbtn') && !UI.match) go.insertAdjacentHTML('beforebegin', '<button class="holbtn" id="holbtn" data-a="holiday" title="Go on holiday" aria-label="Go on holiday">Holiday</button>'); } catch (e) { }
  return r;
};
// stop the day loop on the day you are back
const _dtHol = dailyTick;
dailyTick = function () { const r = _dtHol.apply(this, arguments); if (r) return r; try { if (G.holiday && G.date >= G.holiday.until) return { type: 'day' }; } catch (e) { } return r; };
