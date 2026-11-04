# GAFFER 26/27

A retro, CM 01/02-inspired football management game with real Premier League and Championship 2026/27 squads, plus reserve (U21) and academy (U18) sides with their own youth leagues. It runs in the browser as a single HTML file and saves to browser storage. Clubs have drawn stadiums, board requests and building work, and a History section keeps real past winners, club honours and manager world rankings. An International section adds 142 nations, the Nations League, Euro 2028 and World Cup 2030 qualifying and finals, friendlies and caps, with England, Spain or Italy playable as a full-time or dual (club + country) job.

Spain is the second country: all 20 La Liga clubs with real squads (as of 31 Oct 2026), the Segunda División (team level, top two plus play-off winner promoted), the Copa del Rey (lower-division sides host single-game ties, two-legged semi-finals) and the four-team Supercopa (Istanbul, February 2027). La Liga ties are split by head-to-head record first. Spanish clubs play in their real 2026/27 European places, win La Liga awards (Player/Manager/Goal of the Month, Pichichi, Zamora, Team of the Season) and can trade players with English clubs. You can start in England or Spain and move between them.

Italy is the third country: all 20 Serie A clubs with real squads (FotMob, 4 Nov 2026), Serie B (team level: top two promoted plus a play-off winner; bottom three plus the play-out loser drop to Serie C), the Coppa Italia (Serie A clubs outside last season's top eight and all of Serie B start in the first round, the top eight join in the round of 16, two-legged semi-finals, final at the Stadio Olimpico) and the one-match Supercoppa Italiana (Inter v Lazio at San Siro, 22 Dec 2026; afterwards champions v cup winners). Serie A ties are split by head-to-head record first. Italian clubs play in their real 2026/27 European places (Inter, Napoli, Roma and Como in the Champions League; Milan and Juventus in the Europa League; Atalanta in the Conference League), win Serie A awards (capocannoniere, Player/Manager/Goal of the Month, Team of the Season) and have Primavera and Under-18 youth leagues. Italy (coach Roberto Mancini) is playable, with caps from Wikipedia (5 Oct 2026) and the all-time caps and goals records. History adds Italian champions since 1929/30, the Coppa Italia and the Supercoppa. Older saves get Italy on load: this season's Serie A table up to the load date is filled in with simulated results.

On the Tactics screen you can pick the best XI, rotate the squad (up to four tired or overused starters rested), field a youth XI (players aged 21 or under, including reserves and academy, who may now start) and save up to eight named tactics with their lineup. Tap a shirt to move that player up, down, left or right (his position changes when he crosses into another zone, giving a custom shape such as 4-3-3*) or to swap him with a team-mate or a bench player.

A Reports screen (after Staff) holds the assistant manager's weekly report: who deserves to start and whom he would start them ahead of, who should be dropped or rested, the best form, who is underperforming and whom to sell in the next window (a better assistant judges more accurately). It also holds monthly scout reports: three scouts (the chief scout and two regional scouts) can each be assigned to a league (Premier League, Championship, La Liga, Serie A) or a region (South America, West Africa, Scandinavia, Iberia, Eastern Europe, UK & Ireland), with a brief (win-now signing, stop-gap, high-potential youngster or wonderkid) and a position, and recommend players with fee, scouted potential and a note. A player's profile now lists what he is happy about and what bothers him: the league position, Champions League football, the captaincy (proud to be captain, rates the captain, or feels he should have the armband), team-mates (a world-class team-mate, a friend, a training-ground row, a rival keeping him out of the team, being underpaid next to someone), the manager (his last chat, broken or pending promises), form, contract and the team's results.

Penalty shoot-outs in a match you watch are played kick by kick: pick each taker and where he aims, and choose which way your keeper dives (quick sims and skipped matches resolve them automatically). For penalties during a match, everyone except the taker and the defending keeper lines up outside the box and the D. The social network in the game is WUPH.com (fictional); official and verified accounts (clubs, reporters, pundits, creators, former referees) carry a ✅. The intro includes a "Kick racism out of football" card. A tribute marks the death of CD Tenerife striker Jesús de Miguel (2 to 3 Nov 2026, as reported by the press): news, club and fan posts, a minute's applause before your next match, and a message against the online racist abuse that followed; no statements are attributed to real people or governing bodies.

The WUPH.com screen (formerly Media) adds the emotional side: fans react to results, derbies, signings, sales and trophies; a fan mood meter and trending hashtags; transfer rumours from fictional reporters with reliability tiers (Tier 1 usually right, Tier 3 mostly gossip) that can turn into real bids and transfers; insider "done deal" posts; club news; board-pressure stories. Fictional TV pundits argue over each big game, fan-channel creators melt down or celebrate, fans blame referees, VAR and the opposition's tactics in reply threads with rival fans, and every Monday a VAR Watch has fictional former referees judge the week's biggest calls (correct, wrong or debatable). Match incidents (disallowed goals, penalties, red cards) are recorded on each fixture.

Storyline (game scenario, not a real ruling; can be switched off in Game > Options until it lands): after their appeal, Manchester City are deducted 60 points on 29 Jan 2027 and in each of the next four seasons, and fined £500m.

> Fan-made game for personal, non-commercial use only; not affiliated with the Premier League, the EFL, LaLiga, the RFEF, UEFA, The FA, any club, or Sports Interactive / SEGA, and no official logos are used.

## Layout

- `src/`: game source (data, match engine, season, transfers, UI, 2D matchday, awards, manager profile, styles)
- `build.py`: joins `src/` into `gaffer.html` (and `bundle.js` for tests)
- `gaffer.html`: the latest built game
- `tests/`: Node simulation tests and Playwright smoke tests (run from the repo root after building), e.g. `node tests/ch_test.js WHU 2`
- `tools/build_ch.py`: builds `src/data_ch.js` (Championship squads) from the raw lists in `tools/ch_raw/` (FotMob team pages, 24-28 Oct 2026); ratings are game estimates
- `tools/build_youth.py`: builds `src/data_youth.js` (real reserve and academy players for 28 clubs) from `tools/youth_raw/` (FotMob U21 team pages, 28-29 Oct 2026); clubs without a published list get generated youth players marked GEN
- `tools/build_hist.py`: builds `src/data_hist.js` (real winners and runners-up to 2025/26) from `tools/hist_raw/` (Wikipedia list pages, read 30 Oct 2026)
- `src/data_stadia.js`: stadium facts (opening year, record crowd, pitch size, stand names) from Wikipedia stadium pages; `src/data_mgr.js`: managers and major honours for the world rankings
- `tools/build_ll.py`: builds `src/data_ll.js` (La Liga squads, Segunda and Primera Federación sides, Spanish stadium facts, Spain caps) from `tools/ll_raw/` (FotMob team pages, 31 Oct 2026; coaches, captains and grounds from Wikipedia "2026-27 La Liga"); ages, positions and ratings are game estimates, Spanish reserve and academy players are generated (GEN)
- `src/selection.js`: Best XI / Rotate / Youth XI and saved tactics on the Tactics screen
- `src/social.js`: Media screen (fans, fictional reporters, rumours, trending)
- `src/clublife.js`: player requests with answers, documentary, revived Cup Winners' Cup (game scenario) and Club World Cup (game format), trophy room, trophy parade, statue, manager's son, save export/import as a file
- `src/banter.js`: pundits, creators, blame and banter threads, VAR Watch
- `src/scenario.js`: optional storylines (Manchester City sanction)
- `src/laliga.js`: Spanish competitions, Copa del Rey and Supercopa draws, season end, migration that adds Spain to older saves
- `src/data_intl.js`: nations (FIFA ranking, Oct 2026), Nations League 2026/27 draw and results, England caps, international winners; checked 31 Oct 2026
- `docs/screenshots/`: reference screenshots

## Build

```bash
python3 build.py      # writes gaffer.html + bundle.js
python3 build_pwa.py  # writes the web app: index.html, manifest, sw.js, icons/
```

Saves are compressed in browser storage (LZW, about a tenth of the JSON size); older uncompressed saves still load. Export backup gives plain JSON.

`src/vis.js` is an older draft of the 2D view and is not part of the build.
