// scenario.js: optional "what if" storyline. Manchester City sanctions (game scenario, not a real ruling).
// Real situation when this was written (Oct 2026): City were reported guilty on 114 of the 115 Premier League charges in
// Sept 2026 and are appealing; the appeal is expected to be heard by January 2027 and no sanction had been announced.
// In the game the sanction lands after the appeal: 60 points deducted this season and in each of the next four seasons,
// plus a £500m fine. It can be switched off in Game > Options until it is announced. Loaded after selection.js.

const MCI_SC = { tid: 'MCI', ann: '2027-01-29', pts: 60, seasons: 5, fine: 500 };
function mciState() { if (!G.mci) G.mci = { on: true, done: false, from: null }; return G.mci; }
function mciApplies(y) { const s = mciState(); return s.done && s.from != null && y >= s.from && y < s.from + MCI_SC.seasons; }
function mciApplyDed() { if (mciApplies(G.year) && T(MCI_SC.tid)) G.ded[MCI_SC.tid] = (G.ded[MCI_SC.tid] || 0) + MCI_SC.pts; }
function mciAnnounce() {
  const s = mciState(); const t = T(MCI_SC.tid); if (!t || s.done || !s.on) return;
  s.done = true; s.from = G.year; G.ded = G.ded || {};
  mciApplyDed();
  t.bal -= MCI_SC.fine; t.fin.out.fine = (t.fin.out.fine || 0) + MCI_SC.fine; t.tb = 0;
  for (const p of squad(MCI_SC.tid)) { if (typeof setHap === 'function') setHap(p, p.ca >= 84 ? -14 : -8); p.mor = clamp(p.mor - 10, 5, 100); }
  const last = seasonLabel(G.year + MCI_SC.seasons - 1);
  news('Manchester City sanctioned', `Game scenario: after the appeal, the independent commission hands Manchester City a ${MCI_SC.pts}-point deduction this season and in each of the next four seasons (to ${last}), and a £${MCI_SC.fine}m fine. City drop to ${ordinal(tableOf(divOf(MCI_SC.tid) || 'PL').findIndex(r => r.t === MCI_SC.tid) + 1)} in the table.`, MCI_SC.tid, true);
  if (G.user === MCI_SC.tid) msg('The verdict', `The commission has ruled: ${MCI_SC.pts} points deducted this season and for each of the next four, and a £${MCI_SC.fine}m fine taken from the club's account. Your transfer budget is frozen at zero. The board no longer expects results in the table: keep the squad together and the club stable. Several senior players are unsettled.`);
  if (G.user !== MCI_SC.tid && divOf(G.user) === 'PL') msg('Title race', `Manchester City's ${MCI_SC.pts}-point deduction reshapes the Premier League table. Check the League screen.`, { k: 'nav', v: 'table' });
}
// the sanction reaches the table on announcement day
const _dtMci = dailyTick;
dailyTick = function () {
  try { const s = mciState(); if (s.on && !s.done && G.date >= MCI_SC.ann) mciAnnounce(); } catch (e) { console.error(e); }
  return _dtMci.apply(this, arguments);
};
// later seasons: deduction again at the start of each of the next four seasons
const _seMci = seasonEnd;
seasonEnd = function () {
  // the board does not sack a City manager for a relegation the sanction made certain
  try { if (G.user === MCI_SC.tid && mciApplies(G.year)) G.board = Math.max(G.board, 85); } catch (e) { }
  const r = _seMci.apply(this, arguments);
  try { G.ded = G.ded || {}; mciApplyDed(); if (mciApplies(G.year) && T(MCI_SC.tid)) news('Manchester City', `Manchester City start the ${seasonLabel(G.year)} season on −${MCI_SC.pts} points (year ${G.year - mciState().from + 1} of ${MCI_SC.seasons} of the sanction).`, MCI_SC.tid, true); } catch (e) { console.error(e); }
  return r;
};
// board expectations: survival is out of reach, so the board judges stability instead
const _btMci = boardTarget;
boardTarget = function (tid) {
  const id = tid || G.user;
  if (id === MCI_SC.tid && G.ded && G.ded[id] >= 30) return { pos: divOf(id) === 'CH' ? 24 : 20, txt: 'keep the club stable through the sanctions' };
  return _btMci(tid);
};
// new careers and older saves: the storyline is on unless switched off; a save past the date gets it straight away
const _ngMci = newGame;
newGame = function (u, n) {
  const r = _ngMci(u, n);
  try { mciState(); news('Manchester City appeal', `City, reported guilty on 114 of the 115 Premier League charges, are appealing. The appeal is due to be heard in January; any sanction follows after it. (Game scenario: switch it off in Game > Options.)`, 'MCI', true); } catch (e) { console.error(e); }
  return r;
};
const _rsMci = restore;
restore = function (o) { _rsMci(o); try { const s = mciState(); if (s.on && !s.done && G.date >= MCI_SC.ann && G.year === BASE_YEAR) mciAnnounce(); } catch (e) { console.error(e); } };
// Game > Options toggle (until the verdict)
const _scrGameMci = scrGame;
scrGame = function () {
  const html = _scrGameMci(); if (!G) return html;
  const s = mciState();
  const box = `<div class="box pad"><h2 class="sect" style="margin-top:0">Storylines</h2>${s.done ? `<p style="margin:0">Manchester City sanction: <b>in force</b> since ${dNice(MCI_SC.ann, false)} (−${MCI_SC.pts} points a season for ${MCI_SC.seasons} seasons, £${MCI_SC.fine}m fine).</p>` : `<label class="row" style="gap:8px;cursor:pointer"><input type="checkbox" data-a="mcitg" ${s.on ? 'checked' : ''}> Manchester City sanction: −${MCI_SC.pts} points this season and the next four, £${MCI_SC.fine}m fine (announced ${dNice(MCI_SC.ann, false)})</label>`}
    <p class="dim" style="font-size:12.5px;margin-bottom:0">A game scenario, not a real ruling. In real life City were reported guilty on 114 of 115 charges in September 2026 and are appealing; no sanction had been announced as of late October 2026.</p></div>`;
  const i = html.lastIndexOf('</div><div id="exp">');
  return i > 0 ? html.slice(0, i) + box + html.slice(i) : html + box;
};
document.addEventListener('change', (ev) => { const el = ev.target; if (el && el.dataset && el.dataset.a === 'mcitg' && G) { mciState().on = el.checked; autosave(); toast(el.checked ? 'The Manchester City sanction storyline is on.' : 'The Manchester City sanction storyline is off.'); } });
