// polish.js: grouped navigation actions, inbox (weekly Staff digest, filters, mark all read), quieter Media badge,
// first-week tips. Loaded after preseason.js.
ACT.navg = (g) => {
  if (window.matchMedia && window.matchMedia('(max-width: 760px)').matches) { UI.navM = g; render(); navScroll(true); return; }
  let shut = {}; try { shut = JSON.parse(localStorage.getItem('gaffer_navshut') || '{}'); } catch (e) { }
  shut[g] = !shut[g]; try { localStorage.setItem('gaffer_navshut', JSON.stringify(shut)); } catch (e) { }
  render();
};

const _navPL = ACT.nav;
ACT.nav = (v) => { UI.navM = null; if (G && G.tips) G.tips.seen[v] = 1; _navPL(v); };

// ---------- inbox ----------
const DIGEST_T = /^(Assistant manager report|Fitness|Scout reports|Scouting report|Dressing room|Player development|Squad morale)$/;
function weekStart(d) { const x = new Date(d + 'T12:00:00Z'); const dow = (x.getUTCDay() + 6) % 7; x.setUTCDate(x.getUTCDate() - dow); return x.toISOString().slice(0, 10); }
const _msgPL = msg;
function toDigest(title, body, action) {
  const wk = weekStart(G.date); let m = G.news.find(n => n.dg === wk);
  if (!m) { _msgPL(`Staff digest · week of ${dShort(wk)}`, '', null); m = G.news[0]; m.dg = wk; m.parts = []; }
  else { G.news.splice(G.news.indexOf(m), 1); G.news.unshift(m); }
  const last = m.parts[m.parts.length - 1];
  if (last && last.t === title && !action) { last.b += '\n' + body; last.d = G.date; } else m.parts.push({ t: title, b: body, d: G.date, act: action || null });
  m.read = false; m.d = G.date;
  m.body = [...new Set(m.parts.map(p => p.t))].join(' · ');
}
msg = function (title, body, action) {
  if (!G || (action && action.k !== 'nav') || !DIGEST_T.test(title)) return _msgPL(title, body, action);
  toDigest(title, body, action);
};
const _newsPL = news;
news = function (title, body, tid, global) {
  if (G && !global && tid && tid === G.user && DIGEST_T.test(title)) return toDigest(title, body, null);
  return _newsPL(title, body, tid, global);
};
const IB_CATS = [['imp', 'Important'], ['tr', 'Transfers'], ['staff', 'Staff'], ['media', 'Media'], ['all', 'All']];
function msgCat(n) {
  if (n.dg || /^(Assistant|Scout|Fitness|Dressing room|Player development|Squad morale|Training|Physio|Welcome to the academy|Your son)/.test(n.title)) return 'staff';
  if (n.act || /Transfer|Offer for|Rumour|Loan|[Ss]igning|Shirt|[Ss]ponsor|window|contract|Wants to|Deadline|Bid|bid/.test(n.title)) return 'tr';
  if ((n.tid && n.tid !== G.user) || /^(Media|VAR Watch|Documentary|Player of the Month|Young Player|Goal of the Month|Manager of the Month|Team of the|Fair Play|Big-money|Blockbuster|Invincibles)/.test(n.title)) return 'media';
  return 'imp';
}
function inboxList(cat) { return G.news.filter(n => cat === 'all' || msgCat(n) === cat); }
scrInbox = function () {
  const cat = UI.ibf || 'all'; const list = inboxList(cat);
  if (!UI.msg || !list.some(x => x.id === UI.msg)) UI.msg = list[0] ? list[0].id : null;
  const m = list.find(x => x.id === UI.msg);
  if (m && !m.read) m.read = true;
  const lr = G.lastResults && G.lastResults.length ? lastResultsBox() : '';
  const unr = (c) => inboxList(c).filter(n => !n.read).length;
  const body = (n) => n.parts ? n.parts.map(p => `<h4 style="margin:12px 0 4px;color:var(--yel)">${esc(p.t)} <span class="dim mono" style="font-size:11px">${dShort(p.d)}</span></h4><div style="white-space:pre-line">${esc(p.b)}</div>${p.act && p.act.lab ? `<button class="btn" style="margin-top:6px" data-a="repgo" data-v="${esc(p.act.v)}" data-k="${esc(p.act.tab || '')}">${esc(p.act.lab)}</button>` : ''}`).join('') : `<div>${esc(n.body)}</div>`;
  return `<div class="band">Inbox<small>${unreadCount()} unread · ${G.news.length} messages</small></div>
  <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:6px;margin-top:8px"><div class="seg" role="tablist">${IB_CATS.map(([k, l]) => `<button class="${cat === k ? 'on' : ''}" data-a="ibf" data-v="${k}" role="tab" aria-selected="${cat === k}">${l}${unr(k) ? ` <span class="cnt" style="background:var(--red);color:#fff;font-size:11px;padding:0 4px">${unr(k)}</span>` : ''}</button>`).join('')}</div><button class="btn" data-a="ibread">Mark all read</button></div>
  <div class="inbox" style="margin-top:8px">
    <div class="box mlist">${list.map(n => `<div class="mitem ${n.id === (m && m.id) ? 'on' : ''} ${n.read ? '' : 'unread'}" data-a="msg" data-v="${n.id}"><b>${esc(n.title)}</b><span class="d">${dShort(n.d)}</span><span class="x">${esc(n.body)}</span></div>`).join('') || '<div class="pad dim">No messages here.</div>'}</div>
    <div style="min-width:0">${m ? `<div class="box mbody"><h3>${esc(m.title)}</h3><div class="dim mono" style="font-size:12px;margin-bottom:10px">${dNice(m.d)}</div>${body(m)}${msgActions(m)}</div>` : ''}${lr}</div>
  </div>`;
};
Object.assign(ACT, {
  ibf: (v) => { UI.ibf = v; UI.msg = null; render(); },
  ibread: () => { const cat = UI.ibf || 'all'; for (const n of inboxList(cat)) n.read = true; autosave(); render(); }
});
// Media badge: only unread posts about your own club, shown as 9+ at most
mediaUnread = function () { if (!G || !G.feed) return 0; const n = G.feed.filter(p => !p.seen && p.tid === G.user && ['club', 'jour', 'pun', 'off'].includes(p.k)).length; return n > 9 ? '9+' : n; };

// ---------- first-week tips ----------
const TIPS = [['tactics', 'Pick your tactics', 'Choose a formation and team instructions before the first match.'], ['reports', 'Read the assistant report', 'Your assistant sums up the squad, form and fitness every week.'], ['reports', 'Set your scouts', 'Give each scout a region and a brief in Reports › Scouts.', 'scouts'], ['fixtures', 'Arrange pre-season', 'Book friendlies or an Asia Tour in Fixtures › Pre-season.']];
function tipsBox() {
  if (!G || !G.tips || G.tips.off || UI.match) return '';
  if (dDiff(G.tips.from, G.date) > 10) return '';
  const done = (t) => t[3] ? !!(G.scouts && G.scouts.some(s => s && s.region)) : !!G.tips.seen[t[0]];
  const left = TIPS.filter(t => !done(t)); if (!left.length) return '';
  return `<div class="box pad tipsbox" style="margin-bottom:10px;border-color:var(--yel)"><div class="row" style="justify-content:space-between;align-items:center"><b class="yel">First week: ${TIPS.length - left.length}/${TIPS.length} done</b><button class="btn" data-a="tipsoff" style="padding:2px 10px">Dismiss</button></div>
  <div style="display:grid;gap:6px;margin-top:6px">${TIPS.map(t => `<div class="row" style="gap:8px;align-items:baseline"><span class="${done(t) ? 'grn' : 'dim'}" aria-hidden="true">${done(t) ? '✓' : '○'}</span><button class="lnk" data-a="nav" data-v="${t[0]}" style="background:none;border:0;padding:0;color:var(--text);text-decoration:underline;text-align:left">${t[1]}</button><span class="dim" style="font-size:12.5px">${t[2]}</span></div>`).join('')}</div></div>`;
}
ACT.tipsoff = () => { if (G.tips) G.tips.off = 1; autosave(); render(); };
const _ngPL = newGame;
newGame = function () { const r = _ngPL.apply(this, arguments); try { G.tips = { from: G.date, seen: {}, off: 0 }; } catch (e) { } return r; };
function navScroll(smooth) {
  try { const all = document.querySelector('.gnav .ngall'); if (!all || all.scrollWidth <= all.clientWidth) return; const g = UI.navM || navGroupOf(UI.scr); const el = all.querySelector(`[data-g="${g}"]`); if (el) all.scrollTo({ left: el.offsetLeft - all.offsetLeft, behavior: smooth ? 'smooth' : 'auto' }); } catch (e) { }
}
const _renderPL = render;
render = function () {
  _renderPL.apply(this, arguments); navScroll(false);
  try { const h = tipsBox(); if (h) { const mn = document.getElementById('main'); if (mn && !mn.querySelector('.tipsbox')) mn.insertAdjacentHTML('afterbegin', h); } } catch (e) { console.error(e); }
};

// ---------- cup magic: underdogs raise their game, favourites rotate in the early rounds ----------
const CUP_MAGIC = ['FA', 'LC', 'CDR', 'CIT', 'DFB', 'CDF'];
function tierOf(t) { const d = divOf(t); return ['PL', 'LL', 'SA', 'BL', 'L1', 'SPL', 'ED'].includes(d) ? 1 : d === 'CH' ? 2 : 3; }
const _cmPL = createMatch;
createMatch = function (fid, live) {
  const M = _cmPL(fid, live);
  try {
    const f = G.fx[fid];
    if (CUP_MAGIC.includes(f.comp) && !/Semi|Final/.test(String(f.rnd || ''))) {
      const ta = tierOf(f.h), tb = tierOf(f.a);
      if (ta !== tb) { const dog = ta > tb ? 0 : 1; const fav = 1 - dog;
        M.sides[dog].cupF = f.comp === 'CDR' ? 1.12 : 1.06; if (M.sides[fav].tid !== G.user) M.sides[fav].cupF = .95; }
    }
    // home advantage (crowd, travel): a small lift for the home side
    if (!M.neutral && !f.neutral) M.sides[0].cupF = (M.sides[0].cupF || 1) * 1.02;
    units(M.sides[0]); units(M.sides[1]);
  } catch (e) { console.error(e); }
  return M;
};

// ---------- save size: drop players who never played a game in this save and can no longer be signed ----------
function prunePlayers() {
  const inSq = new Set(); for (const k in G.sq) for (const id of G.sq[k] || []) inSq.add(id);
  const keep = new Set([].concat(G.fa || [], G.legXI || [], G.legSubs || []));
  let n = 0;
  for (const id in G.players) {
    const p = G.players[id]; if (!p || inSq.has(id) || keep.has(id) || p.leg) continue;
    const played = (p.car && p.car.a) || (p.st && p.st.a);
    if (!played && (p.c === 'RETIRED' || (p.c === 'FA' && p.age >= 33))) { delete G.players[id]; n++; }
  }
  if (G.fa) G.fa = G.fa.filter(id => G.players[id]);
  return n;
}
const _bsPL = buildSeason;
buildSeason = function () { _bsPL(); try { if (G.hist && G.hist.length) prunePlayers(); } catch (e) { console.error(e); } };

// quick-simulated games (internationals, team-level leagues and cups) ease off at big margins too
const _qsPL = quickScore;
quickScore = function (h, a, neutral) {
  const r = _qsPL(h, a, neutral);
  let k = 0; while (Math.abs(r[0] - r[1]) >= 4 && k++ < 4 && R.chance(k === 1 ? .65 : .5)) { if (r[0] > r[1]) r[0]--; else r[1]--; }
  const cap = 6 + (R.chance(.1) ? 1 : 0); if (r[0] - r[1] > cap) r[0] = r[1] + cap; if (r[1] - r[0] > cap) r[1] = r[0] + cap;
  return r;
};

// ---------- league points only where there are points: cup ties, knockouts and friendlies get cup wording ----------
function fxHasPoints(f) {
  if (!f) return true; const c = f.comp, r = String(f.rnd || '');
  if (LEAGUE_COMPS.includes(c)) return true;
  if (['UCL', 'UEL', 'UECL'].includes(c)) return /Matchday|League phase|Group/i.test(r);
  if (['UNL', 'EQ', 'WCQ'].includes(c)) return true;
  if (['WC', 'EURO', 'CA', 'AFCON', 'ACUP'].includes(c)) return /Group|Matchday/i.test(r);
  return false;
}
let _noPts = false;
const NOPTS_RX = [[/\bEasiest three points\b/gi, 'Easiest win'], [/\bThanks for the points\b/gi, 'Thanks for the easy night'], [/\bThree points, job done\b/g, 'Job done'], [/\bthree points\b/gi, 'the win'], [/\bA point\. Could be/g, 'All square. Could be'], [/\bTwo points dropped, simple as that\b/g, 'Should have won that, simple as that'], [/\bTwo points dropped\b/gi, 'Should have won that'], [/\bdropped points\b/gi, 'slipped up'], [/\bdrop points\b/gi, 'slip up'], [/\bCost us points\b/gi, 'Cost us the tie'], [/\bA point today\b/g, 'All square today']];
function ptsFix(t) { if (!_noPts || typeof t !== 'string') return t; for (const [a, b] of NOPTS_RX) t = t.replace(a, b); return t; }
const _postPL = post;
post = function (o) { if (_noPts && o) o.t = ptsFix(o.t); return _postPL(o); };
const _repPL = reply;
reply = function (p, tid, text, who) { return _repPL(p, tid, ptsFix(text), who); };
const _pmPL = postMatch;
postMatch = function (f, pre) { const was = _noPts; _noPts = !fxHasPoints(f); try { return _pmPL(f, pre); } finally { _noPts = was; } };

// ---------- doubles, trebles, quadruples ... ----------
const MULTI = ['', '', 'Double', 'Treble', 'Quadruple', 'Quintuple', 'Sextuple', 'Septuple'];
function seasonTrophies(tid) { const s = seasonLabel(G.year) + ' '; return (G.honours[tid] || []).filter(x => x.startsWith(s)).map(x => x.slice(s.length)).filter(n => !/Fair Play|gold trophy|Manager of|Player of/i.test(n)); }
function multiStory(tid, list) {
  const n = list.length; const word = MULTI[n] || `${n}-trophy haul`; const t = T(tid); const dom = list.every(x => !/Champions League|Europa|Conference|Cup Winners|Club World|Super Cup/.test(x));
  const lg = list.some(x => /Premier League|La Liga|Serie A|Bundesliga|Ligue 1|Saudi Pro League|Championship/.test(x));
  const label = dom && n === 2 ? (lg ? 'domestic Double' : 'cup Double') : dom && n === 3 ? 'domestic Treble' : word;
  news(`${t.name}: the ${label}!`, `${t.name} have won the ${label} in ${seasonLabel(G.year)}: ${list.join(', ')}. ${n >= 4 ? `A ${word.toLowerCase()} is something very few clubs in history have achieved.` : n === 3 ? 'A treble season goes straight into the club\'s history books.' : 'Two trophies in one season.'} ${tid === G.user && n >= 3 ? `${G.mgr} joins the club's greatest managers.` : ''}`, tid, true);
  try { const p = fanPost(tid, `${label.toUpperCase()} 🏆${'🏆'.repeat(Math.min(n, 6) - 1)} ${list.join(' + ')}. Say it with me: ${word.toUpperCase()}!!!`, { big: true, u: tid === G.user ? 1 : 0 }); const rv = typeof rivalsOf === 'function' ? rivalsOf(tid)[0] : null; if (rv) reply(p, rv, R.pick(['Calm down, it\'s only a ' + word.toLowerCase(), 'Asterisk*', 'Wake me up when it\'s a ' + (MULTI[n + 1] || 'bigger haul').toLowerCase() + ' 🙄'])); trend(word, 4); } catch (e) { }
  if (tid === G.user) { G.board = clamp((G.board || 50) + 4, 0, 100); G.fans = clamp((G.fans ?? 60) + 5, 0, 100); }
}
const _honPL = honour;
honour = function (tid, name) {
  _honPL(tid, name);
  try { const t = T(tid); if (!t || t.lite || t.nat || /Fair Play|gold trophy/i.test(name)) return; const list = seasonTrophies(tid); if (list.length >= 2) multiStory(tid, list); } catch (e) { console.error(e); }
};
