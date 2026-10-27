// ===== TEAM RATING & DIFFICULTY =====
// Rating = average overall of the best XI (one goalkeeper + ten outfield players).
function bestXIRating(players) {
  const gk = players.filter(p => p.pos === 'GK').sort((a, b) => b.ca - a.ca)[0];
  const out = players.filter(p => p.pos !== 'GK').sort((a, b) => b.ca - a.ca).slice(0, 10);
  const xi = (gk ? [gk] : []).concat(out);
  return xi.length ? Math.round(xi.reduce((s, p) => s + p.ca, 0) / xi.length * 10) / 10 : 0;
}
const DIFF = [
  { k: 'Easy', c: 'var(--grn)', d: 'A title-winning squad. The pressure is to win everything.' },
  { k: 'Normal', c: 'var(--cyan)', d: 'Strong enough for the top four, with room to improve.' },
  { k: 'Hard', c: 'var(--yel)', d: 'A mid-table squad. Europe would be a big achievement.' },
  { k: 'Very hard', c: 'var(--amb)', d: 'Thin quality. A relegation scrap is likely without smart signings.' },
  { k: 'Extreme', c: 'var(--red)', d: 'The weakest squad in the league. Survival would be a miracle.' }
];
function diffFromRank(rank) { return DIFF[rank <= 3 ? 0 : rank <= 7 ? 1 : rank <= 13 ? 2 : rank <= 17 ? 3 : 4]; }
// before a game exists: read ratings from the squad data
function startRatings() {
  const list = PL_CLUBS.map(c => {
    const ps = c.sq.trim().split('\n').map(l => { const [, , pos, , , ca] = l.split('|'); return { pos, ca: +ca + ({ COV: 3, HUL: 3, IPS: 2, LEE: 1 }[c.id] || 0) }; });
    return { id: c.id, r: bestXIRating(ps) };
  }).sort((a, b) => b.r - a.r);
  const out = {}; list.forEach((x, i) => out[x.id] = { r: x.r, rank: i + 1, diff: diffFromRank(i + 1) });
  return out;
}
// during a career: live squads
function leagueRatings() {
  const list = G.pl.map(id => ({ id, r: bestXIRating(squad(id)) })).sort((a, b) => b.r - a.r);
  const out = {}; list.forEach((x, i) => out[x.id] = { r: x.r, rank: i + 1, diff: diffFromRank(i + 1) });
  return out;
}
function diffChip(d) { return `<span class="dchip" style="--dc:${d.c}">${d.k}</span>`; }

// club picker with rating and difficulty
renderStart = function () {
  const saved = loadSave();
  const sel = UI.newClub;
  const RT = startRatings();
  const clubs = PL_CLUBS.slice().sort((a, b) => RT[b.id].r - RT[a.id].r);
  const sd = sel ? RT[sel] : null;
  app().innerHTML = `<div class="start">
    <div class="title">GAFFER<span>26/27</span></div>
    <div class="strap">Football management · Premier League 2026/27 · real squads</div>
    ${saved ? `<div class="box pad row" style="margin-bottom:18px"><div><b class="yel">Saved career found</b><div class="dim">${esc(saved.mgr)} · ${esc(saved.teams[saved.user].name)} · ${dNice(saved.date)}</div></div><span class="spacer"></span><button class="btn pri" data-a="load">Continue career</button></div>` : ''}
    <div class="band">New career<small>Clubs are ranked by team rating. Difficulty follows the rating.</small></div>
    <div class="box pad">
      <div class="row" style="margin-bottom:12px"><div style="min-width:220px;flex:1;max-width:340px"><label class="lb" for="mgrname">Manager name</label><input class="f" id="mgrname" style="width:100%" maxlength="28" value="${esc(UI.mgrName || 'Zhariff')}"></div>
      ${sd ? `<div style="flex:2;min-width:220px"><label class="lb">Selected</label><b>${esc(PL_CLUBS.find(c => c.id === sel).name)}</b> · rating <b class="mono">${sd.r.toFixed(1)}</b> (${ordinal(sd.rank)} of 20) · ${diffChip(sd.diff)}<div class="dim" style="font-size:12.5px">${esc(sd.diff.d)}</div></div>` : '<div class="spacer"></div>'}
      <button class="go" data-a="start" ${sel ? '' : 'disabled'}>START ▸</button></div>
      <div class="row dim" style="gap:12px;font-size:12.5px;margin-bottom:10px">${DIFF.map(d => `<span>${diffChip(d)} ${d === DIFF[0] ? 'top 3' : d === DIFF[1] ? '4th–7th' : d === DIFF[2] ? '8th–13th' : d === DIFF[3] ? '14th–17th' : 'bottom 3'}</span>`).join('')}</div>
      <div class="clubs">${clubs.map(c => { const r = RT[c.id]; return `<button class="clubpick ${sel === c.id ? 'on' : ''}" data-a="pickclub" data-v="${c.id}"><span class="strip" style="background:linear-gradient(${c.c1} 0 60%,${c.c2} 60% 100%)"></span><span class="in"><span class="row" style="justify-content:space-between;gap:6px;flex-wrap:nowrap"><b style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.name)}</b><span class="mono yel" style="font-size:15px;flex:none">${r.r.toFixed(1)}</span></span><span>${diffChip(r.diff)} <span class="dim" style="font-size:12px">#${r.rank}</span></span><small>${esc(c.mgr)} · ${esc(c.stadium)}</small><small>Budget ${money(Math.max(3, Math.round(c.bal * 0.45 + (c.rep - 60))))}</small></span></button>`; }).join('')}</div>
    </div>
    <p class="dim" style="max-width:70ch;margin-top:16px">Team rating is the average overall of each club's best eleven (one goalkeeper and ten outfield players). Squads follow the 2026/27 Premier League first-team rosters as of 24 October 2026. Player ratings are game estimates. Progress is saved in this browser; use Game › Export to keep a backup.</p>
  </div>`;
};
// club screen: rating, difficulty and league ranking
const _scrClub0 = scrClub;
scrClub = function () {
  const RT = leagueRatings(); const me = RT[G.user];
  const top = Object.entries(RT).sort((a, b) => a[1].rank - b[1].rank);
  const box = me ? `<div class="grid3" style="margin-top:10px">
    <div class="box pad"><label class="lb">Team rating</label><div class="big">${me.r.toFixed(1)}</div><div class="dim">${ordinal(me.rank)} best squad in the league</div></div>
    <div class="box pad"><label class="lb">Difficulty</label><div style="margin:6px 0">${diffChip(me.diff)}</div><div class="dim" style="font-size:13px">${esc(me.diff.d)}</div></div>
    <div class="box pad"><label class="lb">Squad ratings</label><div style="max-height:110px;overflow-y:auto;font-size:13px">${top.map(([id, x]) => `<div class="row" style="justify-content:space-between;${id === G.user ? 'color:var(--yel);font-weight:700' : ''}"><span>${x.rank}. ${esc(tName(id))}</span><span class="mono">${x.r.toFixed(1)}</span></div>`).join('')}</div></div>
  </div>` : '';
  const html = _scrClub0();
  const i = html.indexOf('<div class="grid3"');
  return i > 0 ? html.slice(0, i) + box + html.slice(i) : html + box;
};
