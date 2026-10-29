// ===== UI =====
const UI = { scr: 'inbox', msg: null, sort: { k: 'pos', d: 1 }, tSel: null, tab: {}, filt: { q: '', grp: '', max: '', club: '', sort: 'ca' }, short: [], match: null, pre: null, results: null, toastT: null, newClub: null };
const $ = (s, r = document) => r.querySelector(s);
const app = () => document.getElementById('app');
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function badge(tid) { const t = T(tid); if (!t) return ''; return `<i class="badge" style="background:linear-gradient(90deg,${t.c1} 0 50%,${t.c2} 50% 100%)"></i>`; }
function tLink(tid, full) { return `${badge(tid)} ${esc(tName(tid, full))}`; }
function shirt(tid) { const t = T(tid) || {}; return `background:${t.c1 || '#555'};color:${readable(t.c1 || '#555')}`; }
function readable(hex) { const h = hex.replace('#', ''); const r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16); return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#111' : '#fff'; }
function surname(n) { const s = n.split(' '); return s.length > 1 ? s.slice(1).join(' ') : n; }
function avgR(p) { return p.st.a ? (p.st.r / p.st.a).toFixed(2) : '-'; }
function formAvg(p) { return p.form.length ? (p.form.reduce((a, b) => a + b, 0) / p.form.length).toFixed(1) : '-'; }
function aClass(v) { return v >= 16 ? 'a-hi' : v >= 11 ? 'a-mid' : v >= 7 ? 'a-lo' : 'a-vlo'; }
function rClass(r) { return r >= 7.5 ? 'grn' : r >= 6.7 ? '' : r >= 6 ? 'amb' : 'red'; }
function stars(ca) { const n = clamp(Math.round((ca - 55) / 7.5), 0, 5); return '★'.repeat(n) + '☆'.repeat(5 - n); }
function condCls(c) { return c >= 90 ? 'grn' : c >= 75 ? '' : c >= 60 ? 'amb' : 'red'; }
function toast(m) { let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = m; el.hidden = false; clearTimeout(UI.toastT); UI.toastT = setTimeout(() => { el.hidden = true; }, 3400); }
function statusTags(p) {
  let s = '';
  if (p.inj > 0) s += `<span class="tag inj" title="${esc(p.injT)}">INJ ${Math.ceil(p.inj / 7)}w</span> `;
  if (p.sus > 0) s += `<span class="tag sus">SUS ${p.sus}</span> `;
  if (p.listed) s += `<span class="tag lst">LIST</span> `;
  if (p.loan && !p.loan.out) s += `<span class="tag out" title="On loan">LOAN</span> `;
  if (p.con <= G.year + 1 && p.c === G.user && !p.sq) s += `<span class="tag out" title="Contract ends summer ${p.con}">EXP</span> `;
  if (p.gen) s += `<span class="tag gen" title="Generated player: not a real person">GEN</span> `;
  return s;
}
function unreadCount() { return G.news.filter(n => !n.read).length; }

// ---------- root render ----------
function render() {
  if (UI.match) return renderMatch();
  if (!G) return renderStart();
  const scr = UI.scr;
  const nav = [['inbox', 'Inbox'], ['squad', 'Squad'], ['tactics', 'Tactics'], ['train', 'Training'], ['dyn', 'Dynamics'], ['fixtures', 'Fixtures'], ['table', 'League'], ['comps', 'Cups & Europe'], ['stats', 'Stats'], ['awards', 'Awards'], ['transfers', 'Transfers'], ['finance', 'Finances'], ['mgr', 'Manager'], ['staff', 'Staff'], ['club', 'Club'], ['game', 'Game']];
  const nf = nextUserFixture();
  const t = userTeam();
  const nextTxt = nf ? `Next: ${COMP_SHORT[nf.comp]} · ${dShort(nf.d)} · ${nf.h === G.user ? 'v ' + tName(nf.a) + ' (H)' : 'v ' + tName(nf.h) + ' (A)'}` : (G.sacked ? 'Unemployed' : 'Season complete');
  const contLabel = G.sacked ? 'FIND JOB' : (UI.pre ? 'TO MATCH' : (userFixtureOn(G.date) ? 'TO MATCH' : 'CONTINUE'));
  app().innerHTML = `
  <header class="top">
    <div class="logo">GAFFER<span>26/27</span></div>
    <button class="club-chip tavb" data-a="nav" data-v="mgr" title="Manager profile">${typeof ensureProfile === 'function' ? (ensureProfile(), avatarSvg(G.mgrP, 30)) : ''}${badge(G.user)}<b>${esc(t.name)}</b></button>
    <div class="date">${dNice(G.date)}</div>
    <div class="next">${esc(nextTxt)}${G.window ? ' · <span class="grn">Window open</span>' : ''}</div>
    <button class="go" id="go" data-a="continue">${contLabel} ▸</button>
  </header>
  <div class="frame">
    <nav class="nav" aria-label="Sections">${nav.map(([k, l]) => `<button class="${scr === k ? 'on' : ''}" data-a="nav" data-v="${k}">${l}${k === 'inbox' && unreadCount() ? `<span class="cnt">${unreadCount()}</span>` : ''}</button>`).join('')}</nav>
    <main class="main" id="main">${screen(scr)}</main>
  </div>
  ${UI.modal ? `<div class="ov" data-a="closeov"><div class="modal" role="dialog" aria-modal="true">${UI.modal}</div></div>` : ''}`;
}
function screen(s) {
  try {
    switch (s) {
      case 'inbox': return scrInbox();
      case 'squad': return scrSquad();
      case 'tactics': return scrTactics();
      case 'fixtures': return scrFixtures();
      case 'table': return scrTable();
      case 'comps': return scrComps();
      case 'stats': return scrStats();
      case 'transfers': return scrTransfers();
      case 'finance': return scrFinance();
      case 'club': return scrClub();
      case 'game': return scrGame();
    }
  } catch (e) { console.error(e); return `<div class="box pad red">Something went wrong drawing this screen: ${esc(e.message)}</div>`; }
  return '';
}

// ---------- start ----------
function renderStart() {
  const saved = loadSave();
  const sel = UI.newClub;
  const clubs = PL_CLUBS.slice().sort((a, b) => b.rep - a.rep);
  app().innerHTML = `<div class="start">
    <div class="title">GAFFER<span>26/27</span></div>
    <div class="strap">Football management · Premier League 2026/27 · real squads</div>
    ${saved ? `<div class="box pad row" style="margin-bottom:18px"><div><b class="yel">Saved career found</b><div class="dim">${esc(saved.mgr)} · ${esc(saved.teams[saved.user].name)} · ${dNice(saved.date)}</div></div><span class="spacer"></span><button class="btn pri" data-a="load">Continue career</button></div>` : ''}
    <div class="band">New career<small>Pick a club and a name</small></div>
    <div class="box pad">
      <div class="row" style="margin-bottom:12px"><div style="min-width:220px;flex:1;max-width:340px"><label class="lb" for="mgrname">Manager name</label><input class="f" id="mgrname" style="width:100%" maxlength="28" value="${esc(UI.mgrName || 'Zhariff')}"></div>
      <div class="spacer"></div><button class="go" data-a="start" ${sel ? '' : 'disabled'}>START ▸</button></div>
      <div class="clubs">${clubs.map(c => { const t = { c1: c.c1, c2: c.c2 }; const tgt = c.rep >= 92 ? 'Title' : c.rep >= 88 ? 'Top four' : c.rep >= 80 ? 'Europe' : c.rep >= 72 ? 'Mid-table' : 'Survival'; return `<button class="clubpick ${sel === c.id ? 'on' : ''}" data-a="pickclub" data-v="${c.id}"><span class="strip" style="background:linear-gradient(${c.c1} 0 60%,${c.c2} 60% 100%)"></span><span class="in"><b>${esc(c.name)}</b><span class="stars">${'★'.repeat(Math.max(1, Math.round((c.rep - 58) / 7)))}</span><small>${esc(c.mgr)} · ${esc(c.stadium)}</small><small>Budget ${money(Math.max(3, Math.round(c.bal * 0.45 + (c.rep - 60))))} · Aim: ${tgt}</small></span></button>`; }).join('')}</div>
    </div>
    <p class="dim" style="max-width:70ch;margin-top:16px">Squads follow the 2026/27 Premier League first-team rosters as of 24 October 2026, after the summer transfer window. Player ratings, attributes, fixtures and lower-league or European opponents are game simulations. Progress is saved in this browser; use Game › Export to keep a backup.</p>
  </div>`;
}

// ---------- inbox ----------
function scrInbox() {
  const list = G.news;
  if (!UI.msg && list.length) UI.msg = list[0].id;
  const m = list.find(x => x.id === UI.msg) || list[0];
  if (m && !m.read) m.read = true;
  const lr = G.lastResults && G.lastResults.length ? lastResultsBox() : '';
  return `<div class="band">Inbox<small>${list.length} messages</small></div>
  <div class="inbox" style="margin-top:8px">
    <div class="box mlist">${list.map(n => `<div class="mitem ${n.id === (m && m.id) ? 'on' : ''} ${n.read ? '' : 'unread'}" data-a="msg" data-v="${n.id}"><b>${esc(n.title)}</b><span class="d">${dShort(n.d)}</span><span class="x">${esc(n.body)}</span></div>`).join('') || '<div class="pad dim">No messages.</div>'}</div>
    <div style="min-width:0">${m ? `<div class="box mbody"><h3>${esc(m.title)}</h3><div class="dim mono" style="font-size:12px;margin-bottom:10px">${dNice(m.d)}</div><div>${esc(m.body)}</div>${msgActions(m)}</div>` : ''}${lr}</div>
  </div>`;
}
function msgActions(m) {
  if (!m.act) return '';
  const o = G.offers.find(x => x.id === m.act.o);
  if (!o) return '';
  const p = P(o.pid);
  if (m.act.k === 'incoming' && o.st === 'incoming') return `<div class="row" style="margin-top:14px"><button class="btn pri" data-a="offAcc" data-v="${o.id}">Accept ${money(o.fee)}</button><button class="btn" data-a="offCnt" data-v="${o.id}">Ask for ${money(Math.round(o.fee * 1.25 * 10) / 10)}</button><button class="btn warn" data-a="offRej" data-v="${o.id}">Reject</button></div>`;
  if (m.act.k === 'counter' && o.st === 'countered') return `<div class="row" style="margin-top:14px"><button class="btn pri" data-a="cntAcc" data-v="${o.id}">Pay ${money(o.counter)}</button><button class="btn" data-a="withdraw" data-v="${o.id}">Walk away</button></div>`;
  if (m.act.k === 'terms' && o.st === 'accepted') return `<div class="row" style="margin-top:14px"><button class="btn pri" data-a="termsOpen" data-v="${o.id}">Negotiate terms with ${esc(p.n)}</button></div>`;
  return `<div class="dim" style="margin-top:12px">Status: ${esc(o.st)}</div>`;
}
function lastResultsBox() {
  const fs = G.lastResults.map(id => G.fx[id]).filter(Boolean).filter(f => f.r && (!T(f.h).lite || !T(f.a).lite));
  if (!fs.length) return '';
  const byComp = {};
  for (const f of fs) (byComp[f.comp] = byComp[f.comp] || []).push(f);
  return `<h2 class="sect">Latest results · ${dShort(fs[0].d)}</h2><div class="tw">${resTable(fs)}</div>`;
}
function resTable(fs, showComp = true) {
  return `<table class="t"><tbody>${fs.map(f => `<tr class="click ${f.h === G.user || f.a === G.user ? 'me' : ''}" data-a="report" data-v="${f.id}">${showComp ? `<td class="dim">${COMP_SHORT[f.comp]}</td>` : ''}<td style="text-align:right">${esc(tName(f.h))} ${badge(f.h)}</td><td class="c mono"><b>${f.r ? f.r[0] + ' - ' + f.r[1] : 'v'}</b>${f.pen ? ` <span class="dim">(p ${f.pen[0]}-${f.pen[1]})</span>` : f.et ? ' <span class="dim">aet</span>' : ''}</td><td>${badge(f.a)} ${esc(tName(f.a))}</td></tr>`).join('')}</tbody></table>`;
}

// ---------- squad ----------
const SQ_COLS = [['no', '#', 'n'], ['n', 'Name'], ['pos', 'Pos'], ['age', 'Age', 'n'], ['nat', 'Nat'], ['ca', 'Ovr', 'n'], ['cond', 'Cond', 'n'], ['mor', 'Mor', 'n'], ['fa', 'Form', 'n'], ['a', 'Apps', 'n'], ['g', 'Gls', 'n'], ['as', 'Ast', 'n'], ['ar', 'Avg', 'n'], ['val', 'Value', 'n'], ['wage', 'Wage', 'n'], ['con', 'Until', 'n'], ['st', '']];
function sqVal(p, k) { switch (k) { case 'pos': return POS_ORDER[p.pos]; case 'a': return p.st.a; case 'g': return p.st.g; case 'as': return p.st.as; case 'ar': return p.st.a ? p.st.r / p.st.a : 0; case 'fa': return p.form.length ? p.form.reduce((a, b) => a + b, 0) / p.form.length : 0; case 'val': return calcValue(p); case 'st': return p.inj + p.sus * 10; default: return p[k]; } }
function sortPlayers(list) { const { k, d } = UI.sort; return list.slice().sort((a, b) => { const va = sqVal(a, k), vb = sqVal(b, k); return (va > vb ? 1 : va < vb ? -1 : 0) * d || b.ca - a.ca; }); }
function playerTable(list, opts = {}) {
  return `<div class="tw"><table class="t"><thead><tr>${SQ_COLS.filter(c => !(opts.hide || []).includes(c[0])).map(c => `<th class="s ${c[2] || ''}" data-a="sort" data-v="${c[0]}">${c[1]}${UI.sort.k === c[0] ? (UI.sort.d > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}${opts.club ? '<th>Club</th>' : ''}</tr></thead><tbody>
  ${sortPlayers(list).map(p => { const xi = T(G.user).tac.xi.includes(p.id); return `<tr class="click" data-a="player" data-v="${p.id}">
    ${(opts.hide || []).includes('no') ? '' : `<td class="n">${p.no || ''}</td>`}
    <td>${xi && p.c === G.user ? '<span class="yel">● </span>' : ''}<b>${esc(p.n)}</b></td><td class="mono">${POS_LABEL[p.pos]}</td><td class="n">${p.age}</td><td class="mono dim">${esc(p.nat)}</td>
    <td class="n"><b>${p.ca}</b></td><td class="n ${condCls(p.cond)}">${Math.round(p.cond)}%</td><td class="n">${Math.round(p.mor)}</td><td class="n ${rClass(+formAvg(p))}">${formAvg(p)}</td>
    <td class="n">${p.st.a}</td><td class="n">${p.st.g}</td><td class="n">${p.st.as}</td><td class="n ${rClass(+avgR(p))}">${avgR(p)}</td>
    <td class="n">${money(calcValue(p))}</td><td class="n">${wageStr(p.wage)}</td><td class="n">${p.con}</td><td>${statusTags(p)}</td>${opts.club ? `<td>${tLink(p.c)}</td>` : ''}</tr>`; }).join('')}
  </tbody></table></div>`;
}
function scrSquad() {
  const sq = squad(G.user);
  const inj = sq.filter(p => p.inj > 0).length, sus = sq.filter(p => p.sus > 0).length;
  return `<div class="band">First-team squad<small>${sq.length} players · ${inj} injured · ${sus} suspended · wage bill ${wageStr(wageBill(G.user))}</small></div>
  <p class="dim" style="margin:6px 0">Names marked ● are in your starting XI. Click a player for attributes, contract and transfer options. Ovr is the game's overall rating.</p>
  ${playerTable(sq)}`;
}

// ---------- player modal ----------
function playerModal(pid) {
  const p = P(pid); if (!p) return;
  const a = attrs(p);
  const own = p.c === G.user;
  const club = T(p.c);
  const keys = p.pos === 'GK' ? ['Han', 'Ref', 'Aer', 'Kic', 'OvO', 'Pos', 'Pas', 'Pac', 'Sta', 'Str', 'Det', 'Tea'] : ATTR_OUT;
  const fams = Object.entries(FAM[p.pos]).filter(([r, v]) => v >= .85).map(([r]) => ROLE_LABEL[r]).join(', ');
  const st = p.st;
  const shortlisted = UI.short.includes(p.id);
  let acts = '';
  if (own && p.loan) {
    acts = `<span class="dim">On loan from ${esc(tName(p.loan.from))} until the summer.</span>`;
  } else if (own) {
    acts = `<button class="btn" data-a="list" data-v="${p.id}">${p.listed ? 'Remove from transfer list' : 'Add to transfer list'}</button>
      <button class="btn" data-a="renewOpen" data-v="${p.id}">Offer new contract</button>
      <button class="btn warn" data-a="releaseAsk" data-v="${p.id}">Release</button>`;
  } else if (p.c === 'FA') {
    acts = `<button class="btn pri" data-a="faOpen" data-v="${p.id}">Offer contract (free agent)</button>`;
  } else if (divOf(p.c)) {
    acts = `<button class="btn pri" data-a="bidOpen" data-v="${p.id}">Make an offer</button><button class="btn" data-a="shortlist" data-v="${p.id}">${shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}</button>`;
  }
  UI.modal = `<div class="band"><span>${p.no ? p.no + '. ' : ''}${esc(p.n)}</span><button class="x" data-a="close" aria-label="Close">×</button></div>
  <div class="mc">
    <div class="row" style="gap:18px;align-items:flex-start">
      <div><div class="big">${p.ca}</div><div class="dim" style="font-size:12px">OVERALL</div><div class="stars" style="font-size:15px">${stars(p.ca)}</div></div>
      <dl class="kv" style="flex:1;min-width:220px">
        <dt>Club</dt><dd>${club ? tLink(p.c, true) : esc(p.c === 'FA' ? 'Free agent' : p.gone || p.c)}</dd>
        <dt>Position</dt><dd>${POS_LABEL[p.pos]} <span class="dim">(also ${esc(fams)})</span></dd>
        <dt>Age / Nation</dt><dd>${p.age} · ${esc(p.nat)}</dd>
        <dt>Value</dt><dd>${money(calcValue(p))}${!own && divOf(p.c) ? ` <span class="dim">· asking around ${money(askingPrice(p))}</span>` : ''}</dd>
        <dt>Contract</dt><dd>${wageStr(p.wage)} until ${p.con}</dd>
        <dt>Condition</dt><dd class="${condCls(p.cond)}">${Math.round(p.cond)}% · morale ${Math.round(p.mor)}</dd>
        ${p.inj > 0 ? `<dt>Injury</dt><dd class="red">${esc(p.injT)}, about ${Math.ceil(p.inj / 7)} week(s)</dd>` : ''}
        ${p.sus > 0 ? `<dt>Suspended</dt><dd class="mag">${p.sus} match(es)</dd>` : ''}
      </dl>
    </div>
    <h2 class="sect">Attributes</h2>
    <div class="attrs">${keys.map(k => `<div class="attr"><span>${ATTR_NAMES[k]}</span><b class="${aClass(a[k])}">${a[k]}</b></div>`).join('')}</div>
    <h2 class="sect">This season</h2>
    <div class="row mono" style="gap:16px;font-size:14px"><span>Apps <b>${st.a}</b> (${st.s} starts)</span><span>Goals <b>${st.g}</b></span><span>Assists <b>${st.as}</b></span><span>Avg <b class="${rClass(+avgR(p))}">${avgR(p)}</b></span><span>MoM <b>${st.mom}</b></span>${p.pos === 'GK' ? `<span>Clean sheets <b>${st.cs}</b></span>` : ''}<span>Cards <b class="yel">${st.y}</b>/<b class="red">${st.rc}</b></span></div>
    <div class="dim" style="margin-top:6px;font-size:13px">Last five ratings: ${p.form.length ? p.form.map(r => `<b class="${rClass(r)}">${r.toFixed(1)}</b>`).join(' · ') : 'none yet'} · Career with this save: ${p.car.a} apps, ${p.car.g} goals</div>
    ${playerExtra(p)}
    ${talkBlock(p)}
    <div class="row" style="margin-top:14px">${acts}</div>
    <div id="pact"></div>
  </div>`;
  render();
}
function actForm(html) { const el = document.getElementById('pact'); if (el) el.innerHTML = `<div class="box pad" style="margin-top:12px">${html}</div>`; }
