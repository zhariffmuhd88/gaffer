# GAFFER 26/27

A retro, CM 01/02-inspired football management game with real Premier League and Championship 2026/27 squads, plus reserve (U21) and academy (U18) sides with their own youth leagues. It runs in the browser as a single HTML file and saves to browser storage.

## Layout

- `src/`: game source (data, match engine, season, transfers, UI, 2D matchday, awards, manager profile, styles)
- `build.py`: joins `src/` into `gaffer.html` (and `bundle.js` for tests)
- `gaffer.html`: the latest built game
- `tests/`: Node simulation tests and Playwright smoke tests (run from the repo root after building), e.g. `node tests/ch_test.js WHU 2`
- `tools/build_ch.py`: builds `src/data_ch.js` (Championship squads) from the raw lists in `tools/ch_raw/` (FotMob team pages, 24-28 Oct 2026); ratings are game estimates
- `tools/build_youth.py`: builds `src/data_youth.js` (real reserve and academy players for 28 clubs) from `tools/youth_raw/` (FotMob U21 team pages, 28-29 Oct 2026); clubs without a published list get generated youth players marked GEN
- `docs/screenshots/`: reference screenshots

## Build

```bash
python3 build.py      # writes gaffer.html + bundle.js
python3 build_pwa.py  # writes the web app: index.html, manifest, sw.js, icons/
```

`src/vis.js` is an older draft of the 2D view and is not part of the build.
