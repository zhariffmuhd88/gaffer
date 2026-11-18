// rewards.js: Manager career XP and rewards (in the spirit of long-career unlocks).
// Your manager career earns XP on this device across all your saves: wins, draws, trophies, promotions and every full
// season you complete. Milestones unlock rewards; each unlocked reward can be redeemed once in every save (for example
// 5 full seasons -> £200m transfer budget; 7 full seasons -> sign any player from any club for free).
// The career record is kept in this browser (localStorage) and never leaves the device. Loaded after bdo.js.

const CAREER_KEY = 'gaffer_career_v1';
const RW_TITLES = ['Sunday League', 'Non-League', 'Journeyman', 'Established', 'Respected', 'Elite', 'World Class', 'Legendary', 'Icon', 'Immortal'];
const RW_XP = { win: 10, draw: 4, season: 500, trophy: 250, league: 400, promo: 300 };
// level L needs 300 x (L-1) x L XP: L2 600, L3 1,800, L4 3,600, L5 6,000, L6 9,000, L7 12,600 ...
function rwXpFor(L) { return 300 * (L - 1) * L; }
function rwLevel(xp) { let L = 1; while (xp >= rwXpFor(L + 1)) L++; return L; }
const REWARDS = [
  { id: 'k20', need: ['seasons', 1], name: '£20m transfer kitty', desc: 'The board adds £20m to your transfer budget.' },
  { id: 'trust', need: ['seasons', 2], name: "Board and fans' trust", desc: 'Board confidence +15 and fan mood +10: more patience when results dip.' },
  { id: 'refresh', need: ['level', 3], name: 'Squad refresh', desc: 'Every injury in your squad is healed, everyone is fully fit and morale is lifted.' },
  { id: 'wonder', need: ['seasons', 3], name: 'Wonderkid', desc: 'A 16-year-old with world-class potential joins your academy.' },
  { id: 'cash', need: ['trophies', 3], name: 'Sponsor windfall', desc: '£100m into the club account, £50m of it for transfers.' },
  { id: 'k200', need: ['seasons', 5], name: '£200m transfer budget', desc: 'The board releases £200m for transfers.' },
  { id: 'con', need: ['level', 6], name: 'Contract security', desc: 'Every contract in your first-team squad is extended by two years on the same wages.' },
  { id: 'free1', need: ['seasons', 7], name: 'Free signing', desc: 'Sign any player from any club for free (one player). Open his profile and use the reward button.' },
  { id: 'free2', need: ['seasons', 10], name: 'Legacy package', desc: 'Two more free signings and £300m for transfers.' }
];

// ---------- the career record on this device ----------
function career() {
  let c = null; try { c = JSON.parse(localStorage.getItem(CAREER_KEY) || 'null'); } catch (e) { c = null; }
  return Object.assign({ xp: 0, seasons: 0, games: 0, wins: 0, draws: 0, trophies: 0, titles: 0, promos: 0, seen: {}, log: [] }, c || {});
}
function careerSave(c) {
  const ks = Object.keys(c.seen); if (ks.length > 4000) for (const k of ks.slice(0, ks.length - 3000)) delete c.seen[k];
  c.log = (c.log || []).slice(-40); try { localStorage.setItem(CAREER_KEY, JSON.stringify(c)); } catch (e) { }
}
function rwHave(c, need) { const [k, n] = need; return k === 'level' ? rwLevel(c.xp) >= n : (c[k] || 0) >= n; }
function rwNeedText(need) { const [k, n] = need; return k === 'level' ? `Manager level ${n}` : k === 'seasons' ? `${n} full season${n > 1 ? 's' : ''}` : `${n} trophies`; }
function saveId() { if (!G.cid) G.cid = 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); return G.cid; }
// add XP once per event (a reloaded save cannot count the same match, trophy or season twice)
function careerGain(key, kind, xp, why) {
  if (!G || !G.user) return; const c = career(); const k = saveId() + ':' + key; if (c.seen[k]) return; c.seen[k] = 1;
  const before = new Set(REWARDS.filter(r => rwHave(c, r.need)).map(r => r.id)); const L0 = rwLevel(c.xp);
  c.xp += xp; if (kind) c[kind] = (c[kind] || 0) + 1; if (why) c.log.push([G.date, why, xp]);
  careerSave(c);
  const L1 = rwLevel(c.xp); if (L1 > L0) msg(`Manager level ${L1}: ${RW_TITLES[Math.min(L1, RW_TITLES.length) - 1]}`, `Your career XP has reached ${c.xp.toLocaleString()}. You are now level ${L1}.`, { k: 'rw' });
  const fresh = REWARDS.filter(r => rwHave(c, r.need) && !before.has(r.id));
  for (const r of fresh) msg(`Reward unlocked: ${r.name}`, `${rwNeedText(r.need)} reached. ${r.desc} Redeem it once in each save from Manager > Rewards.`, { k: 'rw' });
}
// matches (not friendlies)
const _fmRw = finalizeMatch;
finalizeMatch = function (M) {
  const r = _fmRw.apply(this, arguments);
  try { const f = G.fx[M.fid]; const s = M.sides.findIndex(x => x.tid === G.user); if (f && s >= 0 && f.comp !== 'PSF') { const [a, b] = M.score; const me = s ? b : a, op = s ? a : b; let res = me > op ? 'win' : me < op ? 'loss' : (M.pens ? (M.pens[s] > M.pens[1 - s] ? 'win' : 'loss') : 'draw'); const c = career(); if (!c.seen[saveId() + ':g' + f.id]) { c.games++; careerSave(c); } careerGain('g' + f.id, res === 'win' ? 'wins' : res === 'draw' ? 'draws' : null, res === 'win' ? RW_XP.win : res === 'draw' ? RW_XP.draw : 0, null); } } catch (e) { console.error(e); }
  return r;
};
// trophies won by your club (or the national team you manage)
const _hoRw = honour;
honour = function (tid, name) {
  const r = _hoRw.apply(this, arguments);
  try { const mine = tid === G.user || (G.intl && G.intl.job && tid === G.intl.job); if (mine && G.user) { const lg = /League|Liga|Serie A|Bundesliga|Ligue 1|Eredivisie|Premiership|Championship|League One/.test(name) && !/Cup|Champions League|Europa|Conference/.test(name); careerGain('h' + seasonLabel(G.year) + name, 'trophies', lg ? RW_XP.league : RW_XP.trophy, `Won the ${name}`); } } catch (e) { console.error(e); }
  return r;
};
// full seasons and promotions
const RW_TIER = { PL: 1, CH: 2, LO: 3 };
const _seRw = seasonEnd;
seasonEnd = function () {
  let d0 = null; try { d0 = G && G.user ? divOf(G.user) : null; } catch (e) { }
  const lbl = G ? seasonLabel(G.year) : ''; const r = _seRw.apply(this, arguments);
  try {
    if (G && G.user) {
      careerGain('s' + lbl, 'seasons', RW_XP.season, `Completed season ${lbl}`);
      const d1 = divOf(G.user); if (d0 && d1 && RW_TIER[d0] && RW_TIER[d1] && RW_TIER[d1] < RW_TIER[d0]) careerGain('p' + lbl, 'promos', RW_XP.promo, `Promoted with ${tName(G.user, false)}`);
    }
  } catch (e) { console.error(e); }
  return r;
};

// ---------- redeeming (once per save) ----------
function rwUsed(id) { return !!(G.rw && G.rw[id]); }
function rwFreeTokens() { const c = career(); let n = 0; if (rwHave(c, REWARDS[7].need) && rwUsed('free1')) n += 1; if (rwHave(c, REWARDS[8].need) && rwUsed('free2')) n += 2; return Math.max(0, n - ((G.rw && G.rw.freeUsed) || 0)); }
function rwRedeem(id) {
  const c = career(); const r = REWARDS.find(x => x.id === id); if (!r || !rwHave(c, r.need)) return 'Not unlocked yet.'; if (rwUsed(id)) return 'Already redeemed in this save.';
  const t = T(G.user); if (!t) return 'You need a club to redeem rewards.';
  const sq = squad(G.user); const cash = (m, tb) => { t.bal += m; t.tb += tb; };
  if (id === 'k20') cash(20, 20);
  else if (id === 'trust') { G.board = clamp((G.board ?? 60) + 15, 0, 100); G.fans = clamp((G.fans ?? 60) + 10, 0, 100); }
  else if (id === 'refresh') sq.forEach(p => { p.inj = 0; p.injT = ''; p.cond = 100; p.mor = Math.max(p.mor || 0, 88); });
  else if (id === 'wonder') { const pos = R.pick(['ST', 'ST', 'AMC', 'MC', 'DC', 'AML', 'AMR', 'DL', 'DR', 'GK']); const p = genYouth(G.user, 'a', pos, 16, 0); p.ca = clamp(Math.max(p.ca, 56), 36, 64); p.pa = R.i(89, 95); p.val = calcValue(p); p.wk = 1; news('Academy', `${p.n}, a 16-year-old ${POS_LABEL[pos] || pos}, joins the ${tName(G.user, false)} academy. The scouts call him the best young talent they have seen in years.`, G.user, true); }
  else if (id === 'cash') cash(100, 50);
  else if (id === 'k200') cash(200, 200);
  else if (id === 'con') sq.forEach(p => { p.con = Math.max(p.con || G.year, G.year) + 2; });
  else if (id === 'free1') { /* one free signing token */ }
  else if (id === 'free2') cash(300, 300);
  G.rw = G.rw || {}; G.rw[id] = G.date; autosave();
  return `${r.name} redeemed.`;
}
function rwSignFree(pid) {
  const p = P(pid); if (!p || p.c === G.user) return 'Not available.'; if (rwFreeTokens() < 1) return 'No free signings left in this save.';
  const t = T(p.c); if (t && t.nat) return 'Not available.';
  if (p.leg || p.pseudo) return 'Not available.';
  const wage = Math.round(wageFor(p, G.user) * 100) / 100; completeTransfer(p, G.user, 0, wage, 4);
  G.rw = G.rw || {}; G.rw.freeUsed = (G.rw.freeUsed || 0) + 1; autosave();
  msg(`Free signing: ${p.n}`, `${p.n} joins ${tName(G.user, false)} for free on a four-year contract (${wageStr(wage)}), thanks to your career reward.`);
  return `${p.n} signs for free.`;
}
Object.assign(ACT, {
  rwr: (v) => { toast(rwRedeem(v)); render(); },
  rwfree: (v) => { const r = rwSignFree(v); toast(r); UI.modal = null; render(); },
  rwo: () => { UI.modal = null; UI.scr = 'rewards'; render(); }
});

// ---------- the Rewards screen ----------
function scrRewards() {
  const c = career(); const L = rwLevel(c.xp); const lo = rwXpFor(L), hi = rwXpFor(L + 1); const pc = Math.round((c.xp - lo) / Math.max(1, hi - lo) * 100);
  const toks = G && G.user ? rwFreeTokens() : 0;
  const rows = REWARDS.map(r => {
    const got = rwHave(c, r.need), used = rwUsed(r.id);
    const btn = !got ? `<span class="dim">Locked</span>` : used ? `<span class="grn">Redeemed${typeof G.rw[r.id] === 'string' ? ' ' + dShort(G.rw[r.id]) : ''}</span>` : `<button class="btn pri" data-a="rwr" data-v="${r.id}">Redeem</button>`;
    return `<div class="box pad" style="display:flex;gap:10px;align-items:center;margin-bottom:6px;${got ? '' : 'opacity:.6'}"><div style="font-size:20px">${got ? '🔓' : '🔒'}</div><div style="flex:1;min-width:0"><b>${esc(r.name)}</b><div class="dim" style="font-size:12px">${esc(r.desc)}</div><div style="font-size:12px;margin-top:3px">Unlocks at: <b>${rwNeedText(r.need)}</b></div></div><div style="flex:none;text-align:right">${btn}</div></div>`;
  }).join('');
  return `<h1 class="h1">Rewards</h1>
  <div class="box pad"><div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><div><label class="lb">Manager level</label><div style="font-size:22px;font-weight:700">${L} · ${esc(RW_TITLES[Math.min(L, RW_TITLES.length) - 1])}</div></div>
  <div style="text-align:right"><label class="lb">Career XP</label><div class="mono" style="font-size:18px">${c.xp.toLocaleString()}</div></div></div>
  <div style="height:10px;background:var(--bg2,#1c2030);border-radius:5px;overflow:hidden;margin:8px 0 4px"><div style="height:100%;width:${pc}%;background:var(--yel,#ffd23f)"></div></div>
  <div class="dim" style="font-size:12px">${(hi - c.xp).toLocaleString()} XP to level ${L + 1}</div>
  <div class="row" style="gap:14px;flex-wrap:wrap;margin-top:10px;font-size:13px"><span>Full seasons <b>${c.seasons}</b></span><span>Matches <b>${c.games}</b></span><span>Wins <b>${c.wins}</b></span><span>Draws <b>${c.draws}</b></span><span>Trophies <b>${c.trophies}</b></span><span>Promotions <b>${c.promos}</b></span></div></div>
  ${toks ? `<div class="box pad" style="margin-top:8px;border-color:var(--yel)"><b>${toks} free signing${toks > 1 ? 's' : ''} available.</b> Open any player's profile (at any club) and press <i>Sign for free (reward)</i>.</div>` : ''}
  <h2 class="sect">Rewards</h2>
  ${rows}
  <p class="dim" style="font-size:12px">XP: win ${RW_XP.win}, draw ${RW_XP.draw}, cup or European trophy ${RW_XP.trophy}, league title ${RW_XP.league}, promotion ${RW_XP.promo}, full season ${RW_XP.season} (friendlies do not count). Your career record covers all your saves on this device and browser; unlocked rewards can be redeemed once in each save. Each match, trophy and season counts once, even if you reload an older save.</p>
  ${c.log.length ? `<h2 class="sect">Recent XP</h2>${c.log.slice(-8).reverse().map(([d, w, x]) => `<div style="font-size:13px"><span class="dim mono">${esc(dShort(d))}</span> ${esc(w)} <span class="grn">+${x}</span></div>`).join('')}` : ''}`;
}
const _scrRw = screen;
screen = function (s) { if (s === 'rewards') return scrRewards(); return _scrRw(s); };
const _maRw = msgActions;
msgActions = function (m) { if (m && m.act && m.act.k === 'rw') return '<div class="row" style="margin-top:12px"><button class="btn pri" data-a="rwo">Open Rewards</button></div>'; return _maRw(m); };
// the free-signing button on other clubs' players
const _peRw = playerExtra;
playerExtra = function (p) {
  const h = _peRw(p);
  try { if (p && G.user && p.c !== G.user && !p.leg && !p.pseudo && !(T(p.c) && T(p.c).nat) && rwFreeTokens() > 0) return h + `<div class="box pad" style="margin-top:8px;border-color:var(--yel)"><label class="lb">Career reward</label><button class="btn pri" data-a="rwfree" data-v="${p.id}">Sign for free (reward)</button> <span class="dim" style="font-size:12px">${rwFreeTokens()} left in this save</span></div>`; } catch (e) { }
  return h;
};
// saves started before rewards existed: count their finished seasons, trophies and matches once, when first loaded
function rwBackfill() {
  if (!G || !G.user || G.rwBack) return; G.rwBack = 1;
  // an id that stays the same each time this old save is loaded, so nothing is counted twice
  if (!G.cid) G.cid = 'o' + hash(String(G.user) + '|' + Object.keys(G.players || {}).slice(0, 8).join(',') + '|' + JSON.stringify((G.honours || {})[G.user] || []).slice(0, 60)).toString(36);
  try {
    for (let y = BASE_YEAR; y < G.year; y++) careerGain('s' + seasonLabel(y), 'seasons', RW_XP.season, `Completed season ${seasonLabel(y)} (earlier play)`);
    for (const h of (G.honours && G.honours[G.user]) || []) { const lg = /League|Liga|Serie A|Bundesliga|Ligue 1|Eredivisie|Premiership|Championship|League One/.test(h) && !/Cup|Champions League|Europa|Conference/.test(h); const m = h.match(/^(\S+) (.*)$/); careerGain('h' + (m ? m[1] + m[2] : h), 'trophies', lg ? RW_XP.league : RW_XP.trophy, `Won the ${m ? m[2] : h} (earlier play)`); }
    for (const f of Object.values(G.fx || {})) { if (!f.r || f.comp === 'PSF' || (f.h !== G.user && f.a !== G.user)) continue; const s = f.h === G.user ? 0 : 1; const me = f.r[s], op = f.r[1 - s]; const c = career(); if (!c.seen[saveId() + ':g' + f.id]) { c.games++; careerSave(c); } careerGain('g' + f.id, me > op ? 'wins' : me === op ? 'draws' : null, me > op ? RW_XP.win : me === op ? RW_XP.draw : 0, null); }
  } catch (e) { console.error(e); }
  try { autosave(); } catch (e) { }
}
const _rsRw = restore;
restore = function (obj) { const r = _rsRw.apply(this, arguments); try { rwBackfill(); } catch (e) { console.error(e); } return r; };
const _ngRw = newGame;
newGame = function () { const r = _ngRw.apply(this, arguments); try { if (G) G.rwBack = 1; } catch (e) { } return r; };
