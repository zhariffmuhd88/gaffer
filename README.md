# GAFFER 26/27

A retro, CM 01/02-inspired football management game with real Premier League 2026/27 squads. It runs in the browser as a single HTML file and saves to browser storage.

## Layout

- `src/`: game source (data, match engine, season, transfers, UI, 2D matchday, awards, manager profile, styles)
- `build.py`: joins `src/` into `gaffer.html` (and `bundle.js` for tests)
- `gaffer.html`: the latest built game
- `tests/`: Node simulation tests and Playwright smoke tests (run from the repo root after building)
- `docs/screenshots/`: reference screenshots

## Build

```bash
python3 build.py      # writes gaffer.html + bundle.js
```

`src/vis.js` is an older draft of the 2D view and is not part of the build.
