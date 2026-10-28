// links.js: clickable names everywhere (players, clubs, competitions) + back button inside pop-ups.
// Loaded after manager.js, before boot.js.

// ---- link helpers ----
function pLink(pid, text) { const p = P(pid); const t = text != null ? text : (p ? p.n : '?'); return p ? `<span class="lnk" data-a="player" data-v="${esc(pid)}">${esc(t)}</span>` : esc(t); }
tLink = function (tid, full) { if (!T(tid)) return esc(tid || ''); return `<span class="lnk" data-a="clubview" data-v="${esc(tid)}">${badge(tid)} ${esc(tName(tid, full))}</span>`; };
const COMP_LINK = { 'Premier League': 'PL', 'Championship play-offs': 'PO', 'Championship': 'CH', 'Carabao Cup': 'LC', 'League Cup': 'LC', 'FA Cup': 'FA', 'Champions League': 'UCL', 'Europa League': 'UEL', 'Conference League': 'UECL' };
function cLink(code, text) { return `<span class="lnk" data-a="gocomp" data-v="${code}">${esc(text || COMP_NAME[code] || code)}</span>`; }

// ---- name index (rebuilt when the player/team count changes) ----
let _LX = null;
function linkIndex() {
  const np = Object.keys(G.players).length, nt = Object.keys(G.teams).length;
  if (_LX && _LX.np === np && _LX.nt === nt && _LX.g === G) return _LX;
  const by = new Map(); // first word -> [{s, a, v}] longest first
  const add = (s, a, v) => {
    if (!s || s.length < 4) return;
    const w = s.split(' ')[0];
    if (!by.has(w)) by.set(w, []);
    const l = by.get(w);
    if (!l.some(x => x.s === s)) l.push({ s, a, v });
  };
  for (const [name, code] of Object.entries(COMP_LINK)) add(name, 'gocomp', code);
  for (const t of Object.values(G.teams)) { add(t.name, 'clubview', t.id); if (t.short && t.short !== t.name) add(t.short, 'clubview', t.id); }
  for (const p of Object.values(G.players)) if (p && p.n && !p.pseudo) add(p.n, 'player', p.id);
  for (const l of by.values()) l.sort((a, b) => b.s.length - a.s.length);
  _LX = { np, nt, g: G, by };
  return _LX;
}
const L_LETTER = /[\p{L}\p{M}]/u;
const L_WORD = /[\p{Lu}][\p{L}\p{M}'’.-]*/gu;
function linkSegments(text, cur) {
  const { by } = linkIndex();
  const out = []; let last = 0, m;
  L_WORD.lastIndex = 0;
  while ((m = L_WORD.exec(text))) {
    const i = m.index;
    if (i > 0 && L_LETTER.test(text[i - 1])) continue;
    let w = m[0].replace(/[.'’-]+$/, '');
    const cands = by.get(w) || by.get(m[0]);
    if (!cands) continue;
    let hit = null;
    for (const c of cands) {
      if (text.startsWith(c.s, i)) { const nx = text[i + c.s.length]; if (!nx || !L_LETTER.test(nx)) { hit = c; break; } }
    }
    if (!hit) continue;
    if (cur && cur[0] === hit.a && cur[1] === hit.v) continue;
    if (hit.a === 'player' && !P(hit.v)) continue;
    out.push(text.slice(last, i));
    out.push(hit);
    last = i + hit.s.length;
    L_WORD.lastIndex = last;
  }
  if (!out.length) return null;
  out.push(text.slice(last));
  return out;
}
const L_SKIP = 'button,select,option,textarea,input,svg,canvas,header,nav,.tabs,.mlist,.main > .band,[data-a]:not([data-a="report"]):not([data-a="closeov"])';
function linkify(root) {
  if (!root || !G) return;
  const cur = UI.mcur;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const s = n.nodeValue;
      if (!s || s.length < 4 || !/\p{Lu}/u.test(s)) return NodeFilter.FILTER_REJECT;
      const el = n.parentElement;
      if (!el || el.closest(L_SKIP)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = []; let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const node of nodes) {
    const segs = linkSegments(node.nodeValue, cur);
    if (!segs) continue;
    const frag = document.createDocumentFragment();
    for (const s of segs) {
      if (typeof s === 'string') { if (s) frag.appendChild(document.createTextNode(s)); continue; }
      const sp = document.createElement('span');
      sp.className = 'lnk'; sp.dataset.a = s.a; sp.dataset.v = s.v; sp.textContent = s.s;
      frag.appendChild(sp);
    }
    node.parentNode.replaceChild(frag, node);
  }
}

// ---- competitions ----
function goComp(code) {
  UI.modal = null; UI.mstack = []; UI.mcur = null;
  if (code === 'PL' || code === 'CH' || code === 'PO') { UI.scr = 'table'; UI.tab.tb = code === 'PL' ? 'pl' : 'ch'; }
  else { UI.scr = 'comps'; UI.tab.cp = code; }
  render(); window.scrollTo(0, 0);
}

// ---- club pop-up for team-level (lite) sides ----
const _clubModalL = clubModal;
clubModal = function (tid) {
  const t = T(tid); if (!t) return;
  if (!t.lite) return _clubModalL(tid);
  const fs = Object.values(G.fx).filter(f => (f.h === tid || f.a === tid)).sort((a, b) => a.d < b.d ? -1 : 1);
  UI.modal = `<div class="band"><span>${badge(tid)} ${esc(t.name)}</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">
    <dl class="kv"><dt>Stadium</dt><dd>${esc(t.stadium)} · ${(t.cap || 0).toLocaleString('en-GB')}</dd><dt>Team strength</dt><dd>${Math.round(t.str || 0)}</dd></dl>
    <p class="dim">This club is simulated at team level, so individual players are not listed.</p>
    ${fs.length ? `<h2 class="sect">Matches this season</h2><div class="tw">${resTable(fs)}</div>` : ''}</div>`;
  render();
};

// ---- pop-up history (back button) ----
UI.mstack = UI.mstack || []; UI.mcur = null;
const M_OPEN = { player: v => { UI.talkReply = null; playerModal(v); }, clubview: v => clubModal(v), report: v => matchReport(v) };
for (const a of Object.keys(M_OPEN)) {
  ACT[a] = (v) => {
    if (UI.modal && UI.mcur && !(UI.mcur[0] === a && UI.mcur[1] === v)) UI.mstack.push(UI.mcur);
    else if (!UI.modal) UI.mstack = [];
    UI.mcur = [a, v];
    M_OPEN[a](v);
  };
}
Object.assign(ACT, {
  gocomp: (v) => goComp(v),
  mback: () => { const prev = UI.mstack.pop(); if (!prev) { UI.modal = null; UI.mcur = null; render(); return; } UI.mcur = prev; M_OPEN[prev[0]](prev[1]); },
});

// ---- render hook ----
const _renderL = render;
render = function () {
  if (G && !UI.match && UI.modal && UI.mcur) {
    // a pop-up opened some other way (e.g. talks inside the player pop-up) keeps its history
  }
  _renderL();
  if (!G || UI.match) return;
  if (!UI.modal) { UI.mstack = []; UI.mcur = null; }
  try {
    linkify(document.getElementById('main'));
    const md = document.querySelector('.ov .modal');
    if (md) {
      linkify(md);
      if (UI.mstack.length && !md.querySelector('[data-a="mback"]')) {
        const x = md.querySelector('.band .x');
        if (x) x.insertAdjacentHTML('beforebegin', `<button class="x back" data-a="mback" aria-label="Back">‹</button>`);
      }
    }
  } catch (e) { console.error(e); }
};
