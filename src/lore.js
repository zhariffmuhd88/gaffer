// lore.js: season-by-season player history, club lore (legends, rivals, fans' villains), clickable manager profiles
// with playing and managing careers, and "favoured / least favoured" clubs and people on player and manager profiles.
// Loaded after aihap.js.

// ---------- real-world club lore (fan sentiment, with the factual reason) ----------
// legends: [name, why]; villains: [name, why] = people booed or disliked by that club's supporters
const CLUB_LORE = {
  ARS: { leg: [['Arsène Wenger', 'manager 1996–2018, three league titles, the 2003/04 Invincibles'], ['Thierry Henry', "the club's record goalscorer"], ['Dennis Bergkamp', 'Dutch genius, 1995–2006'], ['Patrick Vieira', 'Invincibles captain'], ['Tony Adams', 'one-club captain'], ['Ian Wright', 'goalscoring hero of the 1990s'], ['Robert Pires', 'Invincibles winger'], ['Santi Cazorla', 'fans\' favourite playmaker']],
    vil: [['Ruud van Nistelrooy', 'Manchester United striker at the heart of the 2003 "Battle of Old Trafford"'], ['Robin van Persie', 'left for rivals Manchester United in 2012'], ['Emmanuel Adebayor', 'joined Manchester City and later Tottenham; his 2009 celebration in front of the away end'], ['José Mourinho', 'years of touchline feuds with Arsène Wenger'], ['Ashley Cole', 'left for Chelsea in 2006']] },
  TOT: { leg: [['Jimmy Greaves', "the club's great goalscorer of the 1960s"], ['Glenn Hoddle', 'midfield artist of the 1980s'], ['Ledley King', 'one-club captain'], ['Gary Mabbutt', 'long-serving captain'], ['Gareth Bale', 'winger who lit up White Hart Lane'], ['Son Heung-min', 'captain and 2025 Europa League winner'], ['Harry Kane', "the club's record goalscorer"]],
    vil: [['Sol Campbell', 'left on a free transfer for Arsenal in 2001'], ['Emmanuel Adebayor', 'former Arsenal striker'], ['Arsène Wenger', 'Arsenal manager for 22 years']] },
  MUN: { leg: [['Sir Alex Ferguson', 'manager 1986–2013, 13 league titles'], ['Sir Bobby Charlton', 'Munich survivor and World Cup winner'], ['George Best', 'Ballon d\'Or winner 1968'], ['Eric Cantona', 'the King of Old Trafford'], ['Ryan Giggs', 'record appearance maker'], ['Paul Scholes', 'one-club midfielder'], ['Wayne Rooney', "the club's record goalscorer"]],
    vil: [['Carlos Tevez', 'joined neighbours Manchester City in 2009'], ['Arsène Wenger', 'the great rivalry with Ferguson\'s United'], ['Steven Gerrard', 'Liverpool captain']] },
  CHE: { leg: [['Frank Lampard', "the club's record goalscorer"], ['John Terry', 'captain, five league titles'], ['Didier Drogba', 'scorer in the 2012 Champions League final'], ['Gianfranco Zola', 'Italian magician of the late 1990s'], ['Petr Čech', 'goalkeeper of the title years'], ['José Mourinho', 'three league titles in two spells']],
    vil: [['Rafael Benítez', 'interim manager in 2012/13, never accepted by the fans'], ['Steven Gerrard', 'Liverpool captain who turned Chelsea down in 2005']] },
  LIV: { leg: [['Bill Shankly', 'built the modern club'], ['Bob Paisley', 'three European Cups as manager'], ['Kenny Dalglish', 'player and title-winning manager'], ['Steven Gerrard', 'captain, 2005 Champions League winner'], ['Jamie Carragher', 'one-club defender'], ['Ian Rush', "the club's record goalscorer"], ['Jürgen Klopp', '2019 Champions League and 2020 league title'], ['Mohamed Salah', 'modern goalscoring great']],
    vil: [['Fernando Torres', 'left for Chelsea in January 2011'], ['Michael Owen', 'joined Manchester United in 2009'], ['Gary Neville', 'Manchester United full-back and celebrations in front of the Kop']] },
  MCI: { leg: [['Sergio Agüero', '93:20 and the 2012 title'], ['Vincent Kompany', 'captain of four title-winning sides'], ['David Silva', 'playmaker of the title years'], ['Yaya Touré', 'powerhouse midfielder'], ['Colin Bell', 'hero of the 1960s and 70s'], ['Pep Guardiola', 'the 2023 treble']],
    vil: [['Gary Neville', 'Manchester United full-back and pundit']] },
  EVE: { leg: [['Dixie Dean', '60 league goals in 1927/28'], ['Neville Southall', 'record appearance maker'], ['Duncan Ferguson', 'cult hero'], ['Tim Cahill', 'big-game goalscorer'], ['Leighton Baines', 'left-back of the Moyes years']], vil: [] },
  NEW: { leg: [['Alan Shearer', "the club's record goalscorer"], ['Kevin Keegan', 'player and the "Entertainers" manager'], ['Jackie Milburn', 'hero of the 1950s FA Cup wins'], ['Sir Bobby Robson', 'beloved manager 1999–2004']], vil: [] },
  WHU: { leg: [['Bobby Moore', '1966 World Cup-winning captain'], ['Sir Geoff Hurst', 'hat-trick in the 1966 World Cup final'], ['Mark Noble', 'one-club captain'], ['Billy Bonds', 'captain and manager']], vil: [['Frank Lampard', 'left West Ham for Chelsea in 2001']] },
  AVL: { leg: [['Paul McGrath', 'supporters\' favourite defender'], ['Peter Withe', 'scored the 1982 European Cup winner'], ['Gabriel Agbonlahor', 'local lad'], ['Unai Emery', 'took the club back into the Champions League']], vil: [] },
  RMA: { leg: [['Alfredo Di Stéfano', 'five European Cups in a row'], ['Raúl', 'captain and long-time record scorer'], ['Cristiano Ronaldo', "the club's record goalscorer"], ['Iker Casillas', 'captain and goalkeeper'], ['Zinedine Zidane', 'player and three-time Champions League-winning coach'], ['Sergio Ramos', 'captain of four Champions League wins']], vil: [['Gerard Piqué', 'outspoken Barcelona defender']] },
  BAR: { leg: [['Lionel Messi', "the club's record goalscorer"], ['Johan Cruyff', 'player and Dream Team coach'], ['Xavi Hernández', 'midfield heart of the Guardiola era'], ['Andrés Iniesta', 'scorer of the 2010 World Cup winner'], ['Carles Puyol', 'captain'], ['Pep Guardiola', 'the 2009 sextuple']], vil: [['Luís Figo', 'moved straight to Real Madrid in 2000'], ['José Mourinho', 'Real Madrid manager in the Clásico wars of 2010–13']] },
  ATM: { leg: [['Luis Aragonés', 'player and coach'], ['Diego Simeone', 'player and the coach of two league titles'], ['Fernando Torres', 'El Niño, the academy hero'], ['Koke', 'one-club captain']], vil: [] },
  JUV: { leg: [['Alessandro Del Piero', "the club's record goalscorer"], ['Gianluigi Buffon', 'goalkeeper for 19 seasons'], ['Michel Platini', 'three Ballons d\'Or at Juventus'], ['Pavel Nedvěd', 'Ballon d\'Or 2003'], ['Giorgio Chiellini', 'defender and captain']], vil: [['Leonardo Bonucci', 'left for Milan in 2017 (and returned)']] },
  NAP: { leg: [['Diego Maradona', 'the two league titles of 1987 and 1990'], ['Marek Hamšík', 'captain and record appearance maker'], ['Lorenzo Insigne', 'local captain'], ['Dries Mertens', "the club's record goalscorer"]], vil: [['Gonzalo Higuaín', 'moved to Juventus in 2016']] },
  INT: { leg: [['Javier Zanetti', 'record appearance maker'], ['Giacinto Facchetti', 'captain of Grande Inter'], ['Sandro Mazzola', 'Grande Inter forward'], ['Diego Milito', 'two goals in the 2010 Champions League final'], ['José Mourinho', 'the 2010 treble']], vil: [['Romelu Lukaku', 'talks with Juventus in 2023 turned the fans against him']] },
  ACM: { leg: [['Paolo Maldini', 'one-club captain'], ['Franco Baresi', 'captain, shirt retired'], ['Marco van Basten', 'three Ballons d\'Or'], ['Andriy Shevchenko', 'Ballon d\'Or 2004'], ['Kaká', 'Ballon d\'Or 2007']], vil: [['Gianluigi Donnarumma', 'left on a free transfer in 2021']] },
  ROM: { leg: [['Francesco Totti', 'one-club captain'], ['Daniele De Rossi', 'Capitan Futuro'], ['Bruno Conti', 'World Cup winner of 1982']], vil: [] },
  BAY: { leg: [['Franz Beckenbauer', 'Der Kaiser'], ['Gerd Müller', 'record goalscorer'], ['Philipp Lahm', 'captain of the 2013 treble'], ['Thomas Müller', 'record appearance maker'], ['Oliver Kahn', 'goalkeeper and captain']], vil: [] },
  BVB: { leg: [['Jürgen Klopp', 'two league titles'], ['Marco Reus', 'local hero'], ['Michael Zorc', 'captain and sporting director'], ['Roman Weidenfeller', 'goalkeeper of the Klopp years']], vil: [['Mario Götze', 'agreed to join Bayern before the 2013 Champions League final'], ['Robert Lewandowski', 'joined Bayern in 2014']] },
  PSG: { leg: [['Zlatan Ibrahimović', 'goalscorer of the first Qatari-era titles'], ['Thiago Silva', 'captain for eight seasons'], ['Edinson Cavani', 'long-time record scorer'], ['Pauleta', 'hero of the early 2000s']], vil: [] },
  OM: { leg: [['Jean-Pierre Papin', 'five straight scoring titles'], ['Didier Drogba', 'one season that became legend'], ['Basile Boli', 'scored the 1993 European Cup winner']], vil: [] },
  AJX: { leg: [['Johan Cruyff', 'three European Cups as a player'], ['Marco van Basten', 'academy striker'], ['Frank Rijkaard', 'player and 1995 winner'], ['Jari Litmanen', 'the 1995 Champions League team']], vil: [] },
  FEY: { leg: [['Wim van Hanegem', 'the 1970 European Cup side'], ['Coen Moulijn', 'winger of the 1960s'], ['Robin van Persie', 'came home as a player in 2018 and later became head coach']], vil: [] },
  PSV: { leg: [['Willy van der Kuijlen', "the club's record goalscorer"], ['Phillip Cocu', 'player and coach'], ['Ronaldo', 'the Brazilian\'s two seasons in Eindhoven']], vil: [] }
};
function loreOf(tid) { return CLUB_LORE[tid] || { leg: [], vil: [] }; }

// ---------- real-world manager careers (to 2025/26, game summary) ----------
// name: [playing clubs, managing jobs, favoured clubs, favoured people]
const MGR_CAREER = {
  'Mikel Arteta': ['Barcelona B, Paris Saint-Germain (loan), Rangers, Real Sociedad, Everton, Arsenal', 'Manchester City (assistant), Arsenal', 'Arsenal, Everton, Real Sociedad', 'Pep Guardiola (mentor), Arsène Wenger (his manager at Arsenal)'],
  'Pep Guardiola': ['Barcelona, Brescia, Roma, Al-Ahli, Dorados', 'Barcelona B, Barcelona, Bayern Munich, Manchester City', 'Barcelona, Manchester City', 'Johan Cruyff (mentor), Juan Manuel Lillo'],
  'Arne Slot': ['PEC Zwolle, NAC Breda, Sparta Rotterdam', 'Cambuur, AZ, Feyenoord, Liverpool', 'Feyenoord, Liverpool', ''],
  'Unai Emery': ['Real Sociedad, Toledo, Racing Ferrol, Leganés, Lorca', 'Lorca, Almería, Valencia, Spartak Moscow, Sevilla, Paris Saint-Germain, Arsenal, Villarreal, Aston Villa', 'Sevilla, Villarreal, Aston Villa', ''],
  'Eddie Howe': ['Bournemouth, Portsmouth', 'Bournemouth, Burnley, Newcastle United', 'Bournemouth, Newcastle United', ''],
  'Diego Simeone': ['Vélez Sarsfield, Pisa, Sevilla, Atlético Madrid, Inter, Lazio, Racing Club', 'Racing Club, Estudiantes, River Plate, San Lorenzo, Catania, Atlético Madrid', 'Atlético Madrid, Racing Club', ''],
  'Carlo Ancelotti': ['Parma, Roma, Milan', 'Reggiana, Parma, Juventus, Milan, Chelsea, Paris Saint-Germain, Real Madrid, Bayern Munich, Napoli, Everton, Brazil', 'Milan, Real Madrid', ''],
  'Hansi Flick': ['Bayern Munich, Köln', 'Hoffenheim, Bayern Munich, Germany, Barcelona', 'Bayern Munich, Barcelona', 'Joachim Löw (worked as his assistant)'],
  'Vincent Kompany': ['Anderlecht, Hamburg, Manchester City', 'Anderlecht, Burnley, Bayern Munich', 'Manchester City, Anderlecht', 'Pep Guardiola (his manager at City)'],
  'Luis Enrique': ['Sporting Gijón, Real Madrid, Barcelona', 'Barcelona B, Roma, Celta Vigo, Barcelona, Spain, Paris Saint-Germain', 'Barcelona, Sporting Gijón', ''],
  'Xabi Alonso': ['Real Sociedad, Eibar (loan), Liverpool, Real Madrid, Bayern Munich', 'Real Sociedad B, Bayer Leverkusen, Real Madrid', 'Real Sociedad, Liverpool, Real Madrid', 'Carlo Ancelotti, Pep Guardiola, José Mourinho (his coaches)'],
  'Antonio Conte': ['Lecce, Juventus', 'Arezzo, Bari, Atalanta, Siena, Juventus, Italy, Chelsea, Inter, Tottenham, Napoli', 'Juventus, Lecce', ''],
  'Massimiliano Allegri': ['Pescara, Cagliari, Perugia, Napoli', 'Cagliari, Milan, Juventus', 'Juventus, Milan', ''],
  'Luciano Spalletti': ['Spezia, Empoli', 'Empoli, Udinese, Roma, Zenit, Inter, Napoli, Italy, Juventus', 'Napoli, Roma', ''],
  'Andoni Iraola': ['Athletic Club, New York City FC', 'AEK Larnaca, Mirandés, Rayo Vallecano, Bournemouth', 'Athletic Club', ''],
  'Oliver Glasner': ['SV Ried', 'LASK, Wolfsburg, Eintracht Frankfurt, Crystal Palace', 'Eintracht Frankfurt, Crystal Palace', ''],
  'Marco Silva': ['Estoril', 'Estoril, Sporting CP, Olympiacos, Hull City, Watford, Everton, Fulham', 'Fulham, Estoril', ''],
  'Thomas Frank': ['', 'Brøndby, Brentford, Tottenham', 'Brentford', ''],
  'José Mourinho': ['', 'Benfica, União de Leiria, Porto, Chelsea, Inter, Real Madrid, Manchester United, Tottenham, Roma, Fenerbahçe', 'Porto, Chelsea, Inter', ''],
  'Thomas Tuchel': ['Augsburg, Ulm (lower leagues)', 'Mainz, Borussia Dortmund, Paris Saint-Germain, Chelsea, Bayern Munich, England', 'Chelsea, Mainz', ''],
  'Ruben Amorim': ['Belenenses, Benfica, Braga, Al-Wakrah', 'Casa Pia, Braga, Sporting CP, Manchester United', 'Sporting CP, Benfica', ''],
  'Enzo Maresca': ['West Brom, Juventus, Sevilla, Olympiacos, Málaga', 'Ascoli, Parma, Leicester City, Chelsea', 'Leicester City, Chelsea', 'Pep Guardiola (worked with him at City)'],
  'Jürgen Klopp': ['Mainz', 'Mainz, Borussia Dortmund, Liverpool', 'Liverpool, Borussia Dortmund, Mainz', ''],
  'Arsène Wenger': ['Strasbourg (and amateur clubs)', 'Nancy, Monaco, Nagoya Grampus, Arsenal', 'Arsenal, Monaco', ''],
  'Didier Deschamps': ['Nantes, Marseille, Bordeaux, Juventus, Chelsea, Valencia', 'Monaco, Juventus, Marseille, France', 'Marseille, Juventus', ''],
  'Xavi Hernández': ['Barcelona, Al Sadd', 'Al Sadd, Barcelona', 'Barcelona', 'Pep Guardiola, Johan Cruyff'],
  'Nuno Espírito Santo': ['Vitória Guimarães, Deportivo, Porto, Dynamo Moscow', 'Rio Ave, Valencia, Porto, Wolves, Tottenham, Al-Ittihad, Nottingham Forest', 'Wolves, Porto', ''],
  'David Moyes': ['Celtic, Cambridge United, Bristol City, Shrewsbury, Dunfermline, Hamilton, Preston', 'Preston, Everton, Manchester United, Real Sociedad, Sunderland, West Ham, Everton', 'Everton, West Ham', ''],
  'Sir Alex Ferguson': ['Queen\'s Park, St Johnstone, Dunfermline, Rangers, Falkirk, Ayr United', 'East Stirlingshire, St Mirren, Aberdeen, Scotland, Manchester United', 'Manchester United, Aberdeen', '']
};

function pLinkL(id) { const p = P(id); return p ? `<button class="lnk" data-a="player" data-v="${id}" style="background:none;border:0;padding:0;color:var(--text);text-decoration:underline;font:inherit">${esc(p.n)}</button>` : ''; }
// ---------- season history of every player ----------
// p.sh rows: [season, club id or name, apps, goals, assists, clean sheets, manager]
const ZST = () => ({ a: 0, g: 0, as: 0, cs: 0 });
function shClub(c, p) { return T(c) ? c : (p.gone || p.ab || (c === 'ABROAD' ? 'Abroad' : c)); }
function shPush(p, club) {
  const b = p.stb || ZST(); const st = p.st || newStats();
  const r = [seasonLabel(G.year), shClub(club, p), st.a - b.a, st.g - b.g, st.as - b.as, st.cs - b.cs, T(club) ? mgrOf(club) : ''];
  if (r[2] > 0) (p.sh = p.sh || []).push(r);
  // a player who goes straight to a rival is a villain to his old club
  if (p.shc && T(p.shc) && T(p.c) && p.c !== p.shc && isRival(p.shc, p.c) && (p.car && p.car.a >= 20)) { G.vil = G.vil || {}; (G.vil[p.shc] = G.vil[p.shc] || []).push([p.id, p.c, seasonLabel(G.year)]); }
}
function shSync(p) {
  if (!p || p.pseudo || p.leg) return;
  // only players with games this season (or a real career) are tracked, to keep saves small
  if (p.shc === undefined) { if (p.st.a > 0 || (p.car && p.car.a >= 20)) p.shc = p.c; return; }
  if (p.c !== p.shc) { shPush(p, p.shc); p.shc = p.c; p.stb = { a: p.st.a, g: p.st.g, as: p.st.as, cs: p.st.cs }; }
}
const _wkLore = weekly;
weekly = function () { _wkLore.apply(this, arguments); try { if (G && G.players) { for (const id in G.players) shSync(G.players[id]); loreMgrScan(); } } catch (e) { console.error(e); } };
const _seLore = seasonEnd;
seasonEnd = function () {
  try {
    for (const id in G.players) { const p = G.players[id]; if (!p || p.pseudo || p.leg) continue; shSync(p); shPush(p, p.c); delete p.stb; if (p.shc !== undefined) p.shc = p.c; }
    // managers' league finishes
    G.mrec = G.mrec || {};
    for (const k of LG_ALL()) tableOf(k).forEach((r, i) => { const m = r.t === G.user ? G.mgr : (T(r.t) && T(r.t).mgr); if (m && !/caretaker/i.test(m)) (G.mrec[m] = G.mrec[m] || []).push([seasonLabel(G.year), r.t, i + 1, k]); });
  } catch (e) { console.error(e); }
  return _seLore.apply(this, arguments);
};
// managers' jobs in this save
function loreMgrScan() {
  G.mcur = G.mcur || {}; G.mh = G.mh || {};
  for (const k of LG_ALL()) for (const tid of divTeams(k)) {
    const t = T(tid); if (!t || t.lite) continue; const m = tid === G.user ? G.mgr : t.mgr; if (!m) continue;
    const was = G.mcur[tid];
    if (was !== m) {
      if (was) { const h = (G.mh[was] || []).find(x => x[0] === tid && !x[2]); if (h) h[2] = G.date; }
      if (!/caretaker/i.test(m)) (G.mh[m] = G.mh[m] || []).push([tid, was ? G.date : null, null]);
      G.mcur[tid] = m;
    }
  }
}
// trophies won by managers in this save
const _honLore = honour;
honour = function (tid, name) { const r = _honLore.apply(this, arguments); try { const t = T(tid); if (t && !t.nat) { const m = tid === G.user ? G.mgr : t.mgr; if (m && !/caretaker/i.test(m)) { G.mtro = G.mtro || {}; (G.mtro[m] = G.mtro[m] || []).push([seasonLabel(G.year), tid, name]); } } } catch (e) { } return r; };

function seasonRows(p) {
  const rows = (p.sh || []).slice();
  const b = p.stb || ZST(); const st = p.st || newStats();
  if (st.a - (b.a || 0) > 0) rows.push([seasonLabel(G.year) + ' (now)', shClub(p.c, p), st.a - b.a, st.g - b.g, st.as - b.as, st.cs - b.cs, T(p.c) ? mgrOf(p.c) : '']);
  return rows;
}
function clubCell(c) { return T(c) ? tLink(c, true) : esc(c); }
function historyHtml(p) {
  const rows = seasonRows(p); const gk = p.pos === 'GK';
  const tot = rows.reduce((s, r) => [s[0] + r[2], s[1] + r[3], s[2] + r[4], s[3] + r[5]], [0, 0, 0, 0]);
  const pre = (p.exc || []).filter(x => T(x));
  return `<h2 class="sect">History</h2>${rows.length ? `<div class="tw"><table class="t"><thead><tr><th>Season</th><th>Club</th><th class="n">Apps</th><th class="n">Goals</th><th class="n">Assists</th>${gk ? '<th class="n">Clean sheets</th>' : ''}</tr></thead><tbody>${rows.map(r => `<tr><td class="mono">${esc(r[0])}</td><td>${clubCell(r[1])}</td><td class="n">${r[2]}</td><td class="n">${r[3]}</td><td class="n">${r[4]}</td>${gk ? `<td class="n">${r[5]}</td>` : ''}</tr>`).join('')}${rows.length > 1 ? `<tr><td><b>Total</b></td><td></td><td class="n"><b>${tot[0]}</b></td><td class="n"><b>${tot[1]}</b></td><td class="n"><b>${tot[2]}</b></td>${gk ? `<td class="n"><b>${tot[3]}</b></td>` : ''}</tr>` : ''}</tbody></table></div>` : '<p class="dim">No first-team games in this save yet.</p>'}<p class="dim" style="font-size:12px;margin-top:4px">Seasons from 2026/27 (all competitions).${pre.length ? ` Earlier clubs: ${pre.map(x => tLink(x, true)).join(', ')}.` : ''}</p>`;
}

// ---------- favoured / least favoured ----------
function playerLikes(p) {
  const fav = [], favP = [], bad = [];
  const apps = {}; for (const r of seasonRows(p)) if (T(r[1])) apps[r[1]] = (apps[r[1]] || 0) + r[2];
  const byApps = Object.entries(apps).sort((a, b) => b[1] - a[1]);
  for (const [c, a] of byApps) if (a >= 25 || (c === p.c && hap(p) >= 62)) fav.push([c, c === p.c ? 'his club' : `${a} games for them`]);
  for (const k in CLUB_LORE) if (CLUB_LORE[k].leg.some(x => x[0] === p.n)) fav.push([k, 'a club legend there']);
  // managers he played under the most
  const mg = {}; for (const r of seasonRows(p)) if (r[6] && r[6] !== G.mgr && !/caretaker/i.test(r[6])) mg[r[6]] = (mg[r[6]] || 0) + r[2]; else if (r[6] === G.mgr && p.c === G.user) mg[r[6]] = (mg[r[6]] || 0) + r[2];
  const topM = Object.entries(mg).sort((a, b) => b[1] - a[1])[0]; if (topM && topM[1] >= 15) favP.push([topM[0], `played ${topM[1]} games under him`]);
  if (T(p.c) && !T(p.c).lite) { const sq = squad(p.c).filter(q => q.id !== p.id); const friend = sq.filter(q => q.nat === p.nat && Math.abs(q.age - p.age) <= 8).sort((a, b) => hash(p.id + a.id) % 97 - hash(p.id + b.id) % 97)[0]; if (friend) favP.push([friend.n, 'team-mate he gets on well with', friend.id]); }
  // least favoured
  for (const k in G.vil || {}) for (const v of G.vil[k]) if (v[0] === p.id) bad.push([k, `fans see him as a traitor after his move to ${tName(v[1], false)}`]);
  for (const k in CLUB_LORE) if (CLUB_LORE[k].vil.some(x => x[0] === p.n)) bad.push([k, 'booed by their supporters']);
  if (p.hr && p.hr.some(x => x[1] === 'lf') && T(p.c)) bad.push(['@' + mgrOf(p.c), 'has lost faith in him']);
  return { fav: fav.slice(0, 4), favP: favP.slice(0, 3), bad: bad.slice(0, 3) };
}
function likesHtml(L, who) {
  const it = (x) => x[0][0] === '@' ? `<b>${esc(x[0].slice(1))}</b> <span class="dim">(${esc(x[1])})</span>` : T(x[0]) ? `${tLink(x[0], true)} <span class="dim">(${esc(x[1])})</span>` : x[2] && P(x[2]) ? `${pLinkL(x[2])} <span class="dim">(${esc(x[1])})</span>` : `<b>${esc(x[0])}</b> <span class="dim">(${esc(x[1])})</span>`;
  const sec = (t, xs) => xs.length ? `<div style="margin:4px 0"><span class="lb">${t}</span> ${xs.map(it).join(' · ')}</div>` : '';
  const body = sec('Favoured clubs', L.fav) + sec('Favoured people', L.favP) + sec('Least favoured', L.bad);
  return `<h2 class="sect">Likes and dislikes</h2>${body || `<p class="dim">Nothing known yet about ${who}'s favourite clubs and people.</p>`}`;
}
const _peLore = playerExtra;
playerExtra = function (p) {
  const h = _peLore(p);
  try { if (p && !p.pseudo && !p.leg) return h + historyHtml(p) + likesHtml(playerLikes(p), surname(p.n)); } catch (e) { console.error(e); }
  return h;
};

// ---------- club lore on club pages ----------
function gameLegends(tid) {
  const out = [];
  const apps = {}; for (const id in G.players) { const p = G.players[id]; if (!p || p.pseudo) continue; let a = 0; for (const r of seasonRows(p)) if (r[1] === tid) a += r[2]; if (a >= 150) out.push([p.n, `${a} games in this save`, p.id]); }
  for (const m in G.mtro || {}) { const n = G.mtro[m].filter(x => x[1] === tid).length; if (n >= 3) out.push([m, `${n} trophies as manager in this save`]); }
  return out;
}
function gameVillains(tid) { return (G.vil && G.vil[tid] || []).filter(v => P(v[0])).map(v => [P(v[0]).n, `left for rivals ${tName(v[1], false)} (${v[2]})`, v[0]]); }
function loreHtml(tid) {
  const L = loreOf(tid); const rv = RIVALS.filter(([a, b]) => a === tid || b === tid).map(([a, b]) => a === tid ? b : a).filter(t => T(t));
  const gl = gameLegends(tid), gv = gameVillains(tid);
  const row = (x) => `<li>${x[2] && P(x[2]) ? pLinkL(x[2]) : `<b>${esc(x[0])}</b>`} <span class="dim">— ${esc(x[1])}</span></li>`;
  if (!rv.length && !L.leg.length && !L.vil.length && !gl.length && !gv.length) return '';
  return `<h2 class="sect">Club lore</h2>
  ${rv.length ? `<div style="margin:4px 0"><span class="lb">Rivals</span> ${rv.map(t => tLink(t, true)).join(' · ')}</div>` : ''}
  <div class="grid2" style="gap:10px;margin-top:6px"><div class="box pad"><label class="lb">Favoured: club legends</label><ul class="hapl">${L.leg.map(row).join('') + gl.map(row).join('') || '<li class="dim">None listed</li>'}</ul></div>
  <div class="box pad"><label class="lb">Least favoured: fans' villains</label><ul class="hapl">${L.vil.map(row).join('') + gv.map(row).join('') || '<li class="dim">None listed</li>'}</ul></div></div>
  <p class="dim" style="font-size:12px">Supporters' feelings, with the reason. Players reach legend status in this save at 150 games for the club; managers with three trophies.</p>`;
}
const _cmLore = clubModal;
clubModal = function (tid) {
  _cmLore(tid);
  try {
    const t = T(tid); if (!UI.modal || !t || t.nat) return;
    let m = UI.modal;
    if (t.mgr && tid !== G.user) m = m.replace(esc(t.mgr), `<button class="lnk" data-a="mgrp" data-v="${esc(t.mgr)}" style="background:none;border:0;padding:0;color:var(--text);text-decoration:underline;font:inherit">${esc(t.mgr)}</button>`);
    const lh = loreHtml(tid);
    if (lh) { const k = m.indexOf('<h2 class="sect">Squad</h2>'); m = k > 0 ? m.slice(0, k) + lh + m.slice(k) : m.replace(/<\/div>\s*$/, lh + '</div>'); }
    UI.modal = m; render();
  } catch (e) { console.error(e); }
};

// ---------- manager profiles ----------
function mgrProfileHtml(name) {
  const md = (typeof mgrIndex === 'function' && mgrIndex()[name]) || null; const car = MGR_CAREER[name];
  const tid = fullTeams().find(t => T(t).mgr === name && t !== G.user) || (name === G.mgr && !G.sacked ? G.user : null);
  const ex = Object.values(G.players).find(p => p.n === name && (p.stf || p.c === 'RETIRED'));
  const hist = (G.mh && G.mh[name]) || []; const tro = (G.mtro && G.mtro[name]) || []; const rec = (G.mrec && G.mrec[name]) || [];
  const hon = md && md[4] ? md[4].split(' ').filter(Boolean).map(tok => `${+tok.slice(1) || 1}× ${MGR_CODE_N[tok[0]] || tok[0]}`).join(', ') : '';
  // favoured / least favoured
  const fav = []; const bad = [];
  if (car && car[2]) for (const c of car[2].split(', ')) fav.push(c);
  for (const h of hist) { const days = dDiff(h[1] || sd('2026-07-01'), h[2] || G.date); if (days >= 300 && !fav.includes(tName(h[0], false))) fav.push(tName(h[0], false)); }
  for (const k in CLUB_LORE) { if (CLUB_LORE[k].leg.some(x => x[0] === name) && !fav.includes(tName(k, false))) fav.push(tName(k, false)); if (CLUB_LORE[k].vil.some(x => x[0] === name)) bad.push(`${tName(k, false)} supporters`); }
  for (const s of G.sackLog || []) if (s.n === name) bad.push(`${tName(s.tid, false)} (sacked him, ${dShort(s.d)})`);
  const favP = car && car[3] ? car[3] : '';
  return `<div class="band"><span>${esc(name)}</span><button class="x" data-a="close" aria-label="Close">×</button></div><div class="mc">
  <dl class="kv"><dt>Now</dt><dd>${tid ? `Manager of ${tLink(tid, true)}` : md && md[3] ? esc(md[3]) : 'Without a club'}</dd>
  ${md ? `<dt>Nationality</dt><dd>${esc(md[1])}</dd>` : ''}
  ${hon ? `<dt>Major honours (to 2025/26)</dt><dd>${esc(hon)}</dd>` : ''}
  ${tid && G.ms && G.ms[tid] ? `<dt>Job security</dt><dd>${secTag(tid === G.user ? userSec() : G.ms[tid].s)}</dd>` : ''}</dl>
  <h2 class="sect">Playing career</h2>${car && car[0] ? `<p style="margin:0">${esc(car[0])}</p>` : ex ? `<p style="margin:0">Former player in this save. <button class="btn" data-a="expro" data-v="${ex.id}">Non-playing profile</button></p>` : '<p class="dim" style="margin:0">Not recorded in this game.</p>'}
  <h2 class="sect">Managerial career</h2>${car && car[1] ? `<p style="margin:0 0 6px"><span class="lb">Before this save</span> ${esc(car[1])}</p>` : ''}
  ${hist.length ? `<div class="tw"><table class="t"><thead><tr><th>Club (this save)</th><th>From</th><th>To</th></tr></thead><tbody>${hist.map(h => `<tr><td>${tLink(h[0], true)}</td><td class="dim">${h[1] ? dShort(h[1]) : 'before 2026/27'}</td><td class="dim">${h[2] ? dShort(h[2]) : 'now'}</td></tr>`).join('')}</tbody></table></div>` : (car ? '' : '<p class="dim">No jobs recorded yet in this save.</p>')}
  ${rec.length ? `<h2 class="sect">League finishes (this save)</h2><div class="tw"><table class="t"><tbody>${rec.map(r => `<tr><td class="mono">${r[0]}</td><td>${tLink(r[1], true)}</td><td class="n">${ordinal(r[2])}</td><td class="dim">${esc(COMP_NAME[r[3]] || r[3])}</td></tr>`).join('')}</tbody></table></div>` : ''}
  ${tro.length ? `<h2 class="sect">Trophies (this save)</h2>${tro.map(x => `<div>🏆 ${esc(x[0])} ${esc(x[2])} <span class="dim">(${esc(tName(x[1], false))})</span></div>`).join('')}` : ''}
  <h2 class="sect">Likes and dislikes</h2>${fav.length ? `<div><span class="lb">Favoured clubs</span> ${fav.map(esc).join(' · ')}</div>` : ''}${favP ? `<div><span class="lb">Favoured people</span> ${esc(favP)}</div>` : ''}${bad.length ? `<div><span class="lb">Least favoured</span> ${bad.map(esc).join(' · ')}</div>` : ''}${!fav.length && !favP && !bad.length ? '<p class="dim">Nothing known yet.</p>' : ''}
  <p class="dim" style="font-size:12px;margin-top:8px">Careers before this save are a game summary of public records up to 2025/26.</p></div>`;
}
ACT.mgrp = (v) => { UI.modal = mgrProfileHtml(v); render(); };
function mLink(name) { if (!name || name === G.mgr || /caretaker|vacant/i.test(name)) return esc(name || ''); return `<button class="lnk" data-a="mgrp" data-v="${esc(name)}" style="background:none;border:0;padding:0;color:var(--text);text-decoration:underline;font:inherit;text-align:left">${esc(name)}</button>`; }
