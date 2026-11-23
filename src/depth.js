// depth.js: squad depth in the assistant manager's report (Football Manager style).
// For every position in the current formation: the best three options with a star rating against the level of the
// first eleven, and a verdict (Good, Adequate, Lacking quality, Lacking depth, Ageing). The assistant then recommends
// which positions to strengthen, with a target level, and a button that opens Player search for that position.
// A better assistant judges more accurately (small noise from his ability). Loaded after reports.js.

const DEPTH_ROLES = [['GK', 'Goalkeeper', 'GK'], ['DR', 'Right-back', 'LB,RB'], ['DC', 'Centre-back', 'CB'], ['DL', 'Left-back', 'LB,RB'], ['DM', 'Defensive midfield', 'DM,CM'], ['MC', 'Central midfield', 'DM,CM'], ['AMR', 'Right wing', 'LW,RW'], ['AMC', 'Attacking midfield', 'AM'], ['AML', 'Left wing', 'LW,RW'], ['FC', 'Striker', 'ST']];
const DEPTH_ALIAS = { WBR: 'DR', WBL: 'DL', MR: 'AMR', ML: 'AML' };
function depthReport() {
  const t = userTeam(); const form = t.tac.form || '4-2-3-1'; const slots = (FORMS[form] || []).map(s => DEPTH_ALIAS[s[0]] || s[0]);
  const need = {}; for (const r of slots) need[r] = (need[r] || 0) + 1;
  const sq = squad(G.user).filter(p => !p.loan || !p.loan.out);
  const ab = typeof staffAb === 'function' ? staffAb('asst') : 12; const noise = (id) => ((hash(String(id) + 'dp') % 9) - 4) * (20 - ab) / 40;
  // ability at a position on the same scale as overall rating: his rating, scaled by how well he fits that role
  const NAT = { GK: 'GK', CB: 'DC', LB: 'DL', RB: 'DR', DM: 'DM', CM: 'MC', AM: 'AMC', LW: 'AML', RW: 'AMR', ST: 'FC' };
  const eff = (p, r) => { const nat = effSkill(p, NAT[p.pos] || r, false) || 1; return p.ca * Math.min(1.04, effSkill(p, r, false) / nat) + noise(p.id); };
  // the level of the first eleven: average of the best option in each slot
  const xiIds = (t.tac.xi || []).filter(Boolean).map(P).filter(Boolean);
  const bench = xiIds.length >= 9 ? xiIds.reduce((s, p) => s + p.ca, 0) / xiIds.length : sq.slice().sort((a, b) => b.ca - a.ca).slice(0, 11).reduce((s, p, i, a) => s + p.ca / a.length, 0);
  const stars = (v) => Math.max(.5, Math.min(5, Math.round(((v - (bench - 12)) / 3) * 2) / 2)); // first-eleven level = 4 stars
  const rows = [];
  for (const [r, name, grp] of DEPTH_ROLES) {
    const n = need[r] || 0; const opts = sq.filter(p => (r === 'GK') === (p.pos === 'GK')).map(p => [p, eff(p, r)]).filter(x => x[1] >= x[0].ca * .85).sort((a, b) => b[1] - a[1]);
    const top = opts.slice(0, Math.max(3, n + 1));
    const competent = opts.filter(x => x[1] >= bench - 8);
    const starters = top.slice(0, Math.max(1, n));
    const best = top[0] ? top[0][1] : 0; const avgStart = starters.length ? starters.reduce((s, x) => s + x[1], 0) / starters.length : 0;
    const verdicts = [];
    if (n) {
      if (!top.length || avgStart < bench - 5) verdicts.push(['Lacking quality', 3]);
      if (competent.length < n * 2) verdicts.push(['Lacking depth', competent.length < n + 1 ? 2.5 : 1.5]);
      if (starters.some(x => x[0].age >= 31) && !opts.slice(n).some(x => x[0].age <= 27 && x[1] >= bench - 6)) verdicts.push(['Ageing', 1]);
      if (starters.some(x => x[0].inj > 21)) verdicts.push(['Long-term injury', 1]);
    }
    const word = !n ? 'Not used in this formation' : verdicts.length ? verdicts.map(v => v[0]).join(' · ') : (avgStart >= bench + 2 ? 'Good' : 'Adequate');
    rows.push({ r, name, grp, n, top, word, score: verdicts.reduce((s, v) => s + v[1], 0) * (n ? 1 : 0), best, bench });
  }
  const recs = rows.filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map(x => {
    const lvl = Math.round(x.bench + (x.word.includes('quality') ? 2 : -3));
    const kind = x.word.includes('quality') ? `a first-choice ${x.name.toLowerCase()} better than what we have` : x.word.includes('depth') ? `another ${x.name.toLowerCase()} to give us cover` : x.word.includes('Ageing') ? `a younger ${x.name.toLowerCase()} to take over` : `cover at ${x.name.toLowerCase()} while our man is injured`;
    return { ...x, txt: `We need ${kind}. I'd look for someone rated around ${lvl} or better${x.best ? ` (our best there is about ${Math.round(x.best)})` : ''}.`, lvl };
  });
  return { rows, recs, bench: Math.round(bench), form, stars };
}
function depthHtml() {
  const D = depthReport(); const st = (v) => { const s = D.stars(v); return `<span class="stars" title="${s} stars" style="font-size:13px">${'★'.repeat(Math.floor(s))}${s % 1 ? '½' : ''}<span class="dim">${'☆'.repeat(5 - Math.ceil(s))}</span></span>`; };
  const cls = (w) => /quality/.test(w) ? 'red' : /depth|Ageing|injury/.test(w) ? 'yel' : /Good/.test(w) ? 'grn' : 'dim';
  const body = D.rows.filter(x => x.n || x.top.length).map(x => `<tr${x.n ? '' : ' class="dim"'}><td style="white-space:nowrap"><b>${esc(x.name)}</b>${x.n > 1 ? ` <span class="dim">×${x.n}</span>` : ''}</td>
    <td>${x.top.slice(0, 3).map(([p, v]) => `<div class="click" data-a="player" data-v="${p.id}" style="white-space:nowrap">${esc(surname(p.n))} <span class="dim mono" style="font-size:11.5px">${p.age}</span> ${st(v)}${p.inj > 0 ? ' <span class="red">+</span>' : ''}</div>`).join('') || '<span class="red">Nobody</span>'}</td>
    <td class="${cls(x.word)}" style="font-size:12.5px">${esc(x.word)}</td></tr>`).join('');
  const recs = D.recs.length ? D.recs.map((x, i) => `<div class="box pad" style="margin-bottom:6px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="font-size:18px">${i + 1}</b><div style="flex:1;min-width:180px"><b>${esc(x.name)}</b> <span class="${cls(x.word)}" style="font-size:12px">${esc(x.word)}</span><div style="font-size:13px">“${esc(x.txt)}”</div></div><button class="btn pri" data-a="depthsearch" data-v="${x.grp}" data-k="${x.lvl}">Find players</button></div>`).join('') : '<p class="dim">The squad is well covered in every position. No signings needed.</p>';
  return `<h2 class="sect">Squad depth <span class="dim" style="font-size:14px">${esc(D.form)} · stars against our first eleven (≈${D.bench})</span></h2>
  <div class="tw"><table class="t"><thead><tr><th>Position</th><th>Options</th><th>Verdict</th></tr></thead><tbody>${body}</tbody></table></div>
  <h2 class="sect">Where to strengthen</h2>${recs}`;
}
ACT.depthsearch = (v, el) => { UI.filt = Object.assign({}, UI.filt, { grp: v, q: '', club: '', lg: '', st: '', max: '', age: '', con: '', hap: '', int: '' }); UI.scr = 'transfers'; UI.tab.tr = 'search'; render(); try { toast(`Showing ${v.replace(',', '/')} players. Our target level is about ${el && el.dataset ? el.dataset.k : ''}+.`); } catch (e) { } };
// in the assistant manager tab of Reports
const _scrRepD = scrReports;
scrReports = function () {
  let h = _scrRepD();
  try { if ((UI.tab.rep || 'as') === 'as' && T(G.user) && !isNatT(G.user)) { const i = h.lastIndexOf('<p class="dim" style="font-size:12.5px">A better assistant'); const add = depthHtml(); h = i > 0 ? h.slice(0, i) + add + h.slice(i) : h + add; } } catch (e) { console.error(e); }
  return h;
};
