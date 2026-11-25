// offerdue.js: offers for your players can no longer expire unanswered. Each offer has a reply-by date (six days
// after it arrives, or the day before the window closes, whichever is first). The game stops on that day and the
// Continue button opens the offer until you accept, counter or reject it. Loaded after rel.js.

function offerReplyBy(o) {
  let d = addDays(o.d, 6);
  try { const wc = (G.tasks || []).filter(t => t.t === 'winClose' && t.d > o.d).map(t => t.d).sort()[0]; if (wc) { const last = addDays(wc, -1); if (last < d) d = last; } } catch (e) { }
  return d < o.d ? o.d : d;
}
function offersDue() {
  if (!G || !G.offers || !G.user) return [];
  return G.offers.filter(o => o.st === 'incoming' && P(o.pid) && P(o.pid).c === G.user && G.date >= offerReplyBy(o));
}
function offerWhy(o) { const by = offerReplyBy(o); return by === addDays(o.d, 6) ? 'The offer runs out tomorrow.' : 'The transfer window closes tomorrow.'; }
function offerCounterFee(o) { return Math.round(o.fee * 1.25 * 10) / 10; }
function offerDueModal(list) {
  list = list || offersDue();
  if (!list.length) { if (UI.modal && UI.modal.includes('class="offdue"')) UI.modal = null; return false; }
  const row = (o) => { const p = P(o.pid); const who = o.abroad ? esc(o.buyer) : tLink(o.to); return `<div class="offdue-it"><div><b class="lnk" data-a="player" data-v="${p.id}">${esc(p.n)}</b> <span class="mono dim">${POS_LABEL[p.pos] || ''} · ${p.age}</span></div><div>${who} offer <b class="yel">${money(o.fee)}</b> <span class="dim">· value ${money(calcValue(p))}</span></div><div class="amb" style="font-size:12.5px">${esc(offerWhy(o))}</div><div class="row" style="margin-top:6px"><button class="btn pri" data-a="offdA" data-v="${o.id}">Accept ${money(o.fee)}</button><button class="btn" data-a="offdC" data-v="${o.id}">Ask for ${money(offerCounterFee(o))}</button><button class="btn warn" data-a="offdR" data-v="${o.id}">Reject</button></div></div>`; };
  UI.modal = `<div class="offdue"><div class="band yel"><span>Reply needed: transfer offer${list.length > 1 ? 's' : ''}</span></div><div class="mc"><p style="margin-top:0">You must answer before the game moves on.</p>${list.map(row).join('')}<div id="offdres">${UI.offRes ? `<p class="${UI.offRes.cls}" style="margin-bottom:0">${esc(UI.offRes.txt)}</p>` : ''}</div></div></div>`;
  return true;
}
function offerDueAct(oid, kind) {
  const o = G.offers.find(x => x.id === oid); if (!o) return;
  const r = kind === 'A' ? respondOffer(oid, true) : kind === 'C' ? respondOffer(oid, false, offerCounterFee(o)) : respondOffer(oid, false);
  UI.offRes = { txt: r.msg, cls: r.ok ? 'grn' : 'amb' }; autosave();
  if (!offerDueModal()) { UI.modal = null; UI.offRes = null; toast(r.msg + ' You can carry on.'); }
  render();
}
Object.assign(ACT, { offdA: (v) => offerDueAct(v, 'A'), offdC: (v) => offerDueAct(v, 'C'), offdR: (v) => offerDueAct(v, 'R') });

// stop the day loop on the reply-by day of any offer
const _dtOff = dailyTick;
dailyTick = function () { const r = _dtOff.apply(this, arguments); if (r) return r; try { if (offersDue().length) return { type: 'offer' }; } catch (e) { console.error(e); } return r; };
const _advOff = advance;
advance = function () { const r = _advOff.apply(this, arguments); if (r && r.type === 'offer' && UI._offCont) UI._offStop = true; return r; };
// Continue opens the offers that need an answer instead of moving on
const _ocOff = onContinue;
onContinue = function () {
  try { if (G && !G.sacked && offersDue().length) { UI.offRes = null; offerDueModal(); render(); return; } } catch (e) { console.error(e); }
  UI._offCont = true; const r = _ocOff.apply(this, arguments);
  setTimeout(() => { UI._offCont = false; if (UI._offStop) { UI._offStop = false; try { UI.offRes = null; if (offerDueModal()) render(); } catch (e) { console.error(e); } } }, 60);
  return r;
};
// the window cannot be dismissed by tapping outside it or pressing Escape
const _coOff = ACT.closeov;
ACT.closeov = function (v, el, ev) { if (UI.modal && UI.modal.includes('class="offdue"') && offersDue().length) return; return _coOff(v, el, ev); };
window.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && UI.modal && UI.modal.includes('class="offdue"') && G && offersDue().length) { ev.stopImmediatePropagation(); ev.preventDefault(); } }, true);
// opening another view from inside it (a player link) brings it back when that view closes
const _closeOff = ACT.close;
if (_closeOff) ACT.close = function () { const r = _closeOff.apply(this, arguments); try { if (!UI.modal && G && offersDue().length && UI._offWas) { UI._offWas = false; offerDueModal(); render(); } } catch (e) { } return r; };
const _plOff = ACT.player;
if (_plOff) ACT.player = function () { if (UI.modal && UI.modal.includes('class="offdue"')) UI._offWas = true; return _plOff.apply(this, arguments); };

// reply-by date in the inbox message
const _maOff = msgActions;
msgActions = function (m) {
  const s = _maOff(m);
  try { if (m.act && m.act.k === 'incoming') { const o = G.offers.find(x => x.id === m.act.o); if (o && o.st === 'incoming') return s + `<div class="amb" style="font-size:13px;margin-top:8px">Reply by ${esc(dNice(offerReplyBy(o)))}. The game will not move on past that day until you answer.</div>`; } } catch (e) { }
  return s;
};
