"""Build src/data_youth.js: real U21 / academy players per club (FotMob U21 team pages, 28-29 Oct 2026).

Input: tools/youth_raw/*.txt with "## CODE" headers and "full name|positions|age|nationality" rows
(age "~19" = not published, estimated). Players already in a first-team squad, older than 24 or
without a usable age/position are skipped. Ratings are game estimates from age and academy level.
Clubs without a published U21 list get generated (fictional) players in the game itself.
Usage: python3 tools/build_youth.py
"""
import pathlib, re, hashlib, json, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from build_ch import NAT, pos_code  # same nationality codes and position mapping

ROOT = pathlib.Path(__file__).resolve().parent.parent
first_team = set()  # (club, name) pairs already in first-team squads
for f in ('src/data.js', 'src/data_ch.js'):
    for blk in re.finditer(r'id"?:\s*["\'](\w+)["\'].*?sq:`(.*?)`', (ROOT / f).read_text(), re.S):
        for m in re.finditer(r'^\d+\|([^|]+)\|', blk.group(2), re.M): first_team.add((blk.group(1), m.group(1).strip()))
# academy level: elite category-one academies a little stronger, smaller academies weaker
LEVEL = {'MCI': 3, 'CHE': 3, 'ARS': 3, 'LIV': 2, 'MUN': 2, 'TOT': 2, 'SOU': 2, 'BHA': 2, 'WHU': 1, 'AVL': 1, 'EVE': 1, 'NEW': 1, 'WOL': 1, 'FUL': 1, 'CRY': 1, 'LEE': 0, 'NFO': 0, 'BOU': 0, 'SUN': 0, 'IPS': -1, 'MID': 0, 'NOR': 0, 'WBA': 0, 'STK': 0, 'BLB': 0, 'DER': -1, 'BIR': -1, 'BUR': 0}
AGE_BASE = {15: 40, 16: 43, 17: 46, 18: 50, 19: 54, 20: 57, 21: 60, 22: 62, 23: 64, 24: 65}
EXTRA_POS = {'Defender': 'CB', 'Midfielder': 'CM', 'Attacker': 'ST', 'Goalkeeper': 'GK', 'Forward': 'ST'}

def h(s): return int(hashlib.md5(s.encode()).hexdigest()[:6], 16)

def main():
    clubs = {}; cur = None; skipped = []
    for f in sorted((ROOT / 'tools/youth_raw').glob('*.txt')):
        for line in f.read_text().splitlines():
            line = line.strip()
            if not line: continue
            if line.startswith('##'): cur = line[2:].strip(); clubs.setdefault(cur, []); continue
            name, pos, age, nat = [x.strip() for x in line.split('|')]
            est = age.startswith('~'); age = age.lstrip('~')
            if not age.isdigit(): skipped.append((cur, name, 'no age')); continue
            age = int(age)
            if age > 24: skipped.append((cur, name, 'over 24')); continue
            if (cur, name) in first_team: skipped.append((cur, name, 'first team')); continue
            p = EXTRA_POS.get(pos) or pos_code(cur, name, pos)
            lvl = 'a' if age <= 18 else 'r'
            ca = AGE_BASE.get(age, 40) + LEVEL.get(cur, 0) + (h(cur + name) % 9) - 4
            ca = max(40, min(62, ca)) if lvl == 'a' else max(50, min(70, ca))
            clubs[cur].append(f'{lvl}|{name}|{p}|{age}{"~" if est else ""}|{NAT.get(nat, "ENG")}|{ca}')
    out = ',\n'.join(f'{k}:`{chr(10).join(v)}`' for k, v in clubs.items())
    src = ('// ===== DATA: real reserve (U21) and academy (U18) players, FotMob U21 team pages, 28-29 Oct 2026 =====\n'
           '// rows: level (r reserves / a academy)|name|pos|age (~ = estimated)|nat|rating (game estimate)\n'
           '// clubs not listed here have no published U21 squad and get generated (fictional) youth players\n'
           'const YOUTH = {\n' + out + '\n};\n')
    (ROOT / 'src/data_youth.js').write_text(src)
    print('clubs', len(clubs), 'players', sum(len(v) for v in clubs.values()), 'reserves', sum(1 for v in clubs.values() for r in v if r[0] == 'r'), 'academy', sum(1 for v in clubs.values() for r in v if r[0] == 'a'))
    print('skipped', len(skipped), skipped[:12])

if __name__ == '__main__':
    main()
