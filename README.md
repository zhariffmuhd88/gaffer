# GAFFER 26/27

A retro, CM 01/02-inspired football management game with real Premier League and Championship 2026/27 squads, plus reserve (U21) and academy (U18) sides with their own youth leagues. It runs in the browser as a single HTML file and saves to browser storage. Clubs have drawn stadiums, board requests and building work, and a History section keeps real past winners, club honours and manager world rankings. An International section adds 142 nations, the Nations League, Euro 2028 and World Cup 2030 qualifying and finals, friendlies and caps, with England playable as a full-time or dual (club + country) job.

> Fan-made game for personal, non-commercial use only; not affiliated with the Premier League, the EFL, UEFA, The FA, any club, or Sports Interactive / SEGA, and no official logos are used.

## Layout

- `src/`: game source (data, match engine, season, transfers, UI, 2D matchday, awards, manager profile, styles)
- `build.py`: joins `src/` into `gaffer.html` (and `bundle.js` for tests)
- `gaffer.html`: the latest built game
- `tests/`: Node simulation tests and Playwright smoke tests (run from the repo root after building), e.g. `node tests/ch_test.js WHU 2`
- `tools/build_ch.py`: builds `src/data_ch.js` (Championship squads) from the raw lists in `tools/ch_raw/` (FotMob team pages, 24-28 Oct 2026); ratings are game estimates
- `tools/build_youth.py`: builds `src/data_youth.js` (real reserve and academy players for 28 clubs) from `tools/youth_raw/` (FotMob U21 team pages, 28-29 Oct 2026); clubs without a published list get generated youth players marked GEN
- `tools/build_hist.py`: builds `src/data_hist.js` (real winners and runners-up to 2025/26) from `tools/hist_raw/` (Wikipedia list pages, read 30 Oct 2026)
- `src/data_stadia.js`: stadium facts (opening year, record crowd, pitch size, stand names) from Wikipedia stadium pages; `src/data_mgr.js`: managers and major honours for the world rankings
- `src/data_intl.js`: nations (FIFA ranking, Oct 2026), Nations League 2026/27 draw and results, England caps, international winners; checked 31 Oct 2026
- `docs/screenshots/`: reference screenshots

## Build

```bash
python3 build.py      # writes gaffer.html + bundle.js
python3 build_pwa.py  # writes the web app: index.html, manifest, sw.js, icons/
```

`src/vis.js` is an older draft of the 2D view and is not part of the build.
