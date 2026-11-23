// budget.js: move money between the transfer budget and the weekly wage budget (as in Football Manager).
// £1m of transfer budget pays about £19.2k a week for one season (1,000k / 52 weeks). The wage budget can go up as far
// as the transfer budget allows, and down to the current wage bill (the difference goes back to transfers).
// Shown on the Transfers screen and in Club > Finances. Loaded after rewards.js.

const WAGE_PER_M = 1000 / 52; // £k per week for each £1m moved
function budgetRange(t) {
  const bill = wageBill(G.user); const min = Math.max(0, Math.ceil(bill * 10) / 10), max = t.wb + Math.max(0, t.tb) * WAGE_PER_M;
  return { min: Math.min(min, t.wb), max: Math.max(max, t.wb), bill };
}
function budgetBoxHtml() {
  const t = T(G.user); if (!t || t.nat) return ''; const r = budgetRange(t); const step = Math.max(.5, Math.round((r.max - r.min) / 200 * 10) / 10);
  return `<div class="box pad" id="budgetBox" style="margin:8px 0"><div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:6px"><b>Budget split</b><span class="dim" style="font-size:12px">Move money between transfers and wages · £1m ≈ ${wageStr(WAGE_PER_M)} for a season</span></div>
  <div class="row" style="gap:10px;align-items:center;margin-top:6px;flex-wrap:wrap"><span class="mono" style="min-width:120px">Transfers <b id="bsT">${money(t.tb)}</b></span>
  <input type="range" id="bsR" min="${r.min.toFixed(1)}" max="${r.max.toFixed(1)}" step="${step}" value="${t.wb.toFixed(1)}" style="flex:1;min-width:160px" aria-label="Weekly wage budget">
  <span class="mono" style="min-width:140px;text-align:right">Wages <b id="bsW">${wageStr(t.wb)}</b></span></div>
  <div class="row" style="justify-content:space-between;margin-top:4px;flex-wrap:wrap;gap:6px"><span class="dim" style="font-size:12px">Current wage bill ${wageStr(r.bill)}${r.bill > t.wb ? ' <b class="red">(over budget)</b>' : ` · room ${wageStr(t.wb - r.bill)}`}</span><button class="btn" data-a="bsApply" id="bsA" disabled>Confirm</button></div></div>`;
}
function budgetPreview(v) { const t = T(G.user); const d = v - t.wb; return { wb: v, tb: Math.max(0, Math.round((t.tb - d / WAGE_PER_M) * 10) / 10) }; }
document.addEventListener('input', (ev) => {
  const el = ev.target; if (!el || el.id !== 'bsR') return; const p = budgetPreview(+el.value);
  const a = document.getElementById('bsT'), b = document.getElementById('bsW'), c = document.getElementById('bsA');
  if (a) a.textContent = money(p.tb); if (b) b.textContent = wageStr(p.wb); if (c) c.disabled = Math.abs(p.wb - T(G.user).wb) < .05;
});
ACT.bsApply = () => {
  const el = document.getElementById('bsR'); if (!el) return; const t = T(G.user); const p = budgetPreview(+el.value);
  const d = p.wb - t.wb; if (Math.abs(d) < .05) return;
  t.wb = Math.round(p.wb * 10) / 10; t.tb = p.tb; autosave();
  toast(d > 0 ? `Wage budget raised to ${wageStr(t.wb)}; transfer budget now ${money(t.tb)}.` : `Wage budget lowered to ${wageStr(t.wb)}; transfer budget now ${money(t.tb)}.`);
  render();
};
const _scrBS = screen;
screen = function (s) {
  let h = _scrBS(s);
  try {
    if (s === 'transfers' && G.user && T(G.user) && !T(G.user).nat) { const i = h.indexOf('</div>', h.indexOf('<div class="band">Transfers')); if (i > 0) h = h.slice(0, i + 6) + budgetBoxHtml() + h.slice(i + 6); }
  } catch (e) { console.error(e); }
  return h;
};
// Club > Board tab too (where the club finances box lives)
const _scrClubBS = scrClub;
scrClub = function () { const h = _scrClubBS(); try { if ((UI.tab.club || 'ov') === 'board' && G.user && T(G.user) && !T(G.user).nat) return h + budgetBoxHtml(); } catch (e) { } return h; };
