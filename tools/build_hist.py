"""Build src/data_hist.js: real past winners and runners-up (Wikipedia list pages, read 30 Oct 2026).

Input: tools/hist_raw/<COMP>.txt rows "season|winner|runner-up" (season "1888-89" or final year "1872").
LG = English top flight (First Division to 1991-92, Premier League from 1992-93).
Usage: python3 tools/build_hist.py
"""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
out = []
for code in ['LG', 'CH', 'FA', 'LC', 'UCL', 'UEL', 'UECL']:
    rows = []
    for line in (ROOT / 'tools/hist_raw' / f'{code}.txt').read_text().splitlines():
        if not line.strip(): continue
        s, w, r = [x.strip() for x in line.split('|')]
        s = s.replace('–', '-')
        y = int(s[:4]) if '-' in s else int(s) - 1  # season start year
        rows.append(f'{y}|{w}|{r}')
    out.append(f'{code}:`' + '\n'.join(rows) + '`')
src = ('// ===== DATA: real winners and runners-up before 2026/27 (Wikipedia list pages, read 30 Oct 2026) =====\n'
       '// rows: season start year|winner|runner-up. LG = English champions (First Division to 1991/92, Premier League after).\n'
       'const HIST = {\n' + ',\n'.join(out) + '\n};\n')
(ROOT / 'src/data_hist.js').write_text(src)
print('ok', len(src))
