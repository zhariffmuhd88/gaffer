"""Build src/data_edlo.js: Eredivisie (ED, top flight only) and EFL League One (LO) 2026/27.

Raw input: tools/ed_lo_raw/<LG>_<ID>.txt. First line: head coach. Then "name|pos|country|shirt|age" rows from the clubs'
FotMob squad pages (fetched 12 Nov 2026); a few clubs only showed name, broad position and country on FotMob, so
their missing ages and shirt numbers are filled in (ages are estimates); Heerenveen ages come from ESPN, Telstar's
list from VAVEL. Club lists, stadiums and capacities: Wikipedia "2026-27 Eredivisie" and "2026-27 EFL League One".
Colours, reputations, budgets and every player rating are game estimates (a club level, an age curve and hand-set
ratings for well-known players).
Usage: python3 tools/build_edlo.py
"""
import pathlib, json, hashlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent

# id: (name, short, c1, c2, stadium, capacity, rep, budget £m, formation, base rating, captain)
CLUBS = {
 'ED': {
  'PSV': ('PSV Eindhoven', 'PSV', '#ed1c24', '#ffffff', 'Philips Stadion', 35000, 82, 45, '4-3-3', 76, 'Jerdy Schouten'),
  'AJX': ('Ajax', 'Ajax', '#ffffff', '#d2122e', 'Johan Cruyff Arena', 55865, 82, 45, '4-3-3', 75, 'Davy Klaassen'),
  'FEY': ('Feyenoord', 'Feyenoord', '#e2001a', '#ffffff', 'De Kuip', 47500, 81, 40, '4-3-3', 75, 'Luciano Valente'),
  'AZ': ('AZ Alkmaar', 'AZ', '#d5001c', '#ffffff', 'AFAS Stadion', 19478, 77, 25, '4-3-3', 73, 'Jordy Clasie'),
  'TWE': ('FC Twente', 'Twente', '#e2001a', '#ffffff', 'De Grolsch Veste', 30205, 74, 18, '4-2-3-1', 71, 'Robin Pröpper'),
  'UTR': ('FC Utrecht', 'Utrecht', '#d2001a', '#ffffff', 'Stadion Galgenwaard', 23750, 73, 15, '4-2-3-1', 71, ''),
  'NEC': ('NEC Nijmegen', 'NEC', '#c8102e', '#00843d', 'Goffertstadion', 12650, 70, 10, '3-4-2-1', 69, 'Tjaronn Chery'),
  'GAE': ('Go Ahead Eagles', 'Go Ahead', '#e2001a', '#ffd200', 'De Adelaarshorst', 10000, 69, 8, '4-3-3', 68, 'Joris Kramer'),
  'HEE': ('SC Heerenveen', 'Heerenveen', '#0056a4', '#ffffff', 'Abe Lenstra Stadion', 26100, 69, 10, '4-3-3', 68, ''),
  'GRO': ('FC Groningen', 'Groningen', '#00a650', '#ffffff', 'Euroborg', 22550, 68, 8, '4-2-3-1', 67, 'Thijmen Blokzijl'),
  'SPAR': ('Sparta Rotterdam', 'Sparta', '#e2001a', '#ffffff', 'Sparta Stadion', 11026, 67, 6, '4-3-3', 67, 'Bruno Martins Indi'),
  'PEC': ('PEC Zwolle', 'PEC Zwolle', '#0b3b8c', '#ffffff', 'MAC³PARK stadion', 14000, 66, 6, '4-3-3', 66, 'Ryan Thomas'),
  'FOR': ('Fortuna Sittard', 'Fortuna', '#ffd200', '#00843d', 'Fortuna Sittard Stadion', 12000, 66, 6, '4-2-3-1', 66, 'Ivo Pinto'),
  'EXC': ('Excelsior', 'Excelsior', '#e2001a', '#000000', 'Van Donge & De Roo Stadion', 4500, 64, 4, '4-3-3', 65, 'Casper Widell'),
  'TEL': ('Telstar', 'Telstar', '#ffffff', '#0b3b8c', 'BUKO Stadion', 5338, 63, 3, '4-3-3', 64, ''),
  'ADO': ('ADO Den Haag', 'ADO', '#00843d', '#ffd200', 'Werktalent Stadion', 15000, 65, 6, '4-3-3', 65, 'Juho Kilo'),
  'CMB': ('SC Cambuur', 'Cambuur', '#ffd200', '#0b3b8c', 'Kooi Stadion', 15000, 63, 4, '4-3-3', 64, 'Nicky Souren'),
  'WIL': ('Willem II', 'Willem II', '#e2001a', '#ffffff', 'Koning Willem II Stadion', 15220, 64, 5, '4-3-3', 65, 'Jari Schuurman'),
 },
 'LO': {
  'LEI': ('Leicester City', 'Leicester', '#003090', '#ffffff', 'King Power Stadium', 32259, 60, 12, '4-2-3-1', 66, 'Harry Souttar'),
  'LUT': ('Luton Town', 'Luton', '#f78f1e', '#002d62', 'Kenilworth Road', 12056, 58, 8, '3-4-2-1', 64, 'Kal Naismith'),
  'SHW': ('Sheffield Wednesday', 'Sheff Wed', '#005eb8', '#ffffff', 'Hillsborough Stadium', 39732, 56, 4, '4-2-3-1', 61, 'Liam Palmer'),
  'OXF': ('Oxford United', 'Oxford', '#ffd200', '#002147', 'Kassam Stadium', 12500, 55, 5, '4-2-3-1', 63, 'Cameron Brannagan'),
  'HUD': ('Huddersfield Town', 'Huddersfield', '#0e63ad', '#ffffff', 'Kirklees Stadium', 24121, 55, 5, '3-4-2-1', 63, 'Ryan Ledson'),
  'PLY': ('Plymouth Argyle', 'Plymouth', '#00553f', '#ffffff', 'Home Park', 17900, 54, 4, '4-2-3-1', 62, 'Joe Edwards'),
  'STO': ('Stockport County', 'Stockport', '#1b4a9c', '#ffffff', 'Edgeley Park', 10852, 54, 4, '3-5-2', 63, 'Oliver Norwood'),
  'REA': ('Reading', 'Reading', '#004494', '#ffffff', 'Madejski Stadium', 24161, 53, 3, '4-2-3-1', 62, 'Lewis Wing'),
  'BNS': ('Barnsley', 'Barnsley', '#d71920', '#ffffff', 'Oakwell', 23287, 52, 3, '4-3-3', 61, 'Cameron McGeehan'),
  'BRA': ('Bradford City', 'Bradford', '#7a003c', '#f7a823', 'Valley Parade', 24840, 52, 3, '4-2-3-1', 62, 'Antoni Sarcevic'),
  'WIG': ('Wigan Athletic', 'Wigan', '#1d59af', '#ffffff', 'Brick Community Stadium', 25138, 52, 3, '3-5-2', 60, 'Max Power'),
  'PET': ('Peterborough United', 'Peterborough', '#005eb8', '#ffffff', 'London Road Stadium', 13512, 52, 3, '4-2-3-1', 60, 'Carl Johnston'),
  'MAN': ('Mansfield Town', 'Mansfield', '#f5a300', '#003c71', 'Field Mill', 10022, 50, 2, '4-4-2', 60, 'Ryan Sweeney'),
  'MKD': ('MK Dons', 'MK Dons', '#ffffff', '#000000', 'Stadium MK', 30500, 51, 3, '3-4-2-1', 61, 'Alex Gilbey'),
  'BLP': ('Blackpool', 'Blackpool', '#f68712', '#ffffff', 'Bloomfield Road', 16500, 51, 3, '3-5-2', 61, 'George Honeyman'),
  'LOR': ('Leyton Orient', 'Leyton Orient', '#c8102e', '#ffffff', 'Brisbane Road', 9271, 50, 2, '4-3-3', 61, 'Isaac Hayden'),
  'CAMU': ('Cambridge United', 'Cambridge Utd', '#f5a300', '#000000', 'Abbey Stadium', 7937, 48, 2, '4-2-3-1', 60, 'Dominic Ball'),
  'WYC': ('Wycombe Wanderers', 'Wycombe', '#87ceeb', '#002d62', 'Adams Park', 10446, 50, 2, '4-2-3-1', 61, 'Jack Grimmer'),
  'BRT': ('Burton Albion', 'Burton', '#ffd200', '#000000', 'Pirelli Stadium', 6912, 47, 2, '3-5-2', 59, 'Curtis Tilt'),
  'STE': ('Stevenage', 'Stevenage', '#c8102e', '#ffffff', 'Broadhall Way', 7318, 47, 2, '4-4-2', 60, 'Carl Piergianni'),
  'NCO': ('Notts County', 'Notts County', '#000000', '#ffffff', 'Meadow Lane', 19841, 49, 2, '3-4-2-1', 60, 'Matthew Palmer'),
  'WIM': ('AFC Wimbledon', 'AFC Wimbledon', '#0033a0', '#ffd200', 'Plough Lane', 9215, 48, 2, '4-4-2', 60, 'Ryan Johnson'),
  'BRO': ('Bromley', 'Bromley', '#ffffff', '#000000', 'Hayes Lane', 6100, 45, 2, '4-4-2', 58, 'Omar Sowunmi'),
  'DON': ('Doncaster Rovers', 'Doncaster', '#e2001a', '#ffffff', 'Eco-Power Stadium', 15231, 49, 2, '4-2-3-1', 60, 'Owen Bailey'),
 },
}
# hand-set ratings for well-known players (game estimates)
STARS = {
 # PSV
 'Sergiño Dest': 78, 'Ivan Perišić': 77, 'Jerdy Schouten': 78, 'Guus Til': 78, 'Ricardo Pepi': 77, 'Dennis Man': 77, 'Ryan Flamingo': 77, 'Lutsharel Geertruida': 77,
 'Sven Mijnans': 77, 'Ruben van Bommel': 77, 'Paul Wanner': 78, 'Matěj Kovár': 76, 'Armando Obispo': 74, 'Sam Lammers': 73, 'Alassane Pléa': 74, 'Filip Kostić': 74,
 'Kilian Sildillia': 73, 'Mauro Júnior': 75, 'Esmir Bajraktarević': 75, 'Kodai Sano': 75, 'Adamo Nagalo': 74, 'Yarek Gąsiorowski': 74,
 # Ajax
 'Marc ter Stegen': 80, 'Julian Brandt': 79, 'Yves Bissouma': 78, 'Sofyan Amrabat': 77, 'Thilo Kehrer': 76, 'Oscar Gloukh': 79, 'Daley Blind': 73, 'Steven Berghuis': 75,
 'Kasper Dolberg': 77, 'Viktor Tsigankov': 77, 'Simon Adingra': 76, 'Marcos Leonardo': 77, 'Lucas Rosa': 75, 'Youri Baas': 77, 'Davy Klaassen': 74, 'Owen Wijndal': 73,
 'Caio Henrique': 75, 'Tolu Arokodare': 76, 'Anton Gaaei': 74, 'Maarten Paes': 75, 'Jorthy Mokio': 74, 'Rayane Bounida': 72, 'Oliver Edvardsen': 74,
 # Feyenoord
 'Luciano Valente': 77, 'Sem Steijn': 77, 'Anis Hadj Moussa': 78, 'Tsuyoshi Watanabe': 76, 'Givairo Read': 77, 'Jakub Moder': 76, 'Gjivai Zechiël': 76, 'Gijs Smal': 74,
 'Jordan Bos': 74, 'Thomas Beelen': 74, 'Jeremiah St. Juste': 74, 'Reiss Nelson': 75, 'Gonçalo Borges': 75, 'Oussama Targhalline': 75, 'Tjark Ernst': 74, 'Nacho Ferri': 72,
 'Mika Mármol': 74, 'Mats Deijl': 73, 'Bart Nieuwkoop': 72, 'Charles Vanhoutte': 73, 'Gaoussou Diarra': 72,
 # AZ
 'Kees Smit': 79, 'Peer Koopmeiners': 75, 'Jordy Clasie': 72, 'Calvin Stengs': 75, 'Ro-Zangelo Daal': 74, 'Mexx Meerdink': 76, 'Weslley Pinto': 74, 'Seiya Maikuma': 74,
 'Wouter Goes': 75, 'Wesley Hoedt': 73, 'Mateo Chávez': 75, 'Rome Owusu-Oduro': 74, 'Denso Kasius': 73, 'Mees de Wit': 73, 'Valdemar Byskov': 73, 'Jizz Hornkamp': 72,
 # Twente, Utrecht, NEC and others
 'Wout Weghorst': 75, 'Younes Taha': 74, 'Marko Pjaca': 72, 'Daan Rots': 74, 'Ramiz Zerrouki': 74, 'Naci Ünüvar': 73, 'Bart van Rooij': 73, 'Lars Unnerstall': 72,
 'Robin Pröpper': 72, 'Kristian Hlynsson': 73, 'Vasilios Barkas': 74, 'Victor Jensen': 74, 'Yoann Cathline': 74, 'Kevin Paredes': 73, 'Siebe Horemans': 73,
 'Ángel Alarcón': 73, 'Matisse Didden': 73, 'Dani de Wit': 73, 'Noah Ohio': 73, 'Miliano Jonathans': 73, 'Joris van Overeem': 72, 'Dušan Tadić': 76, 'Tjaronn Chery': 72,
 'Perr Schuurs': 74, 'Philippe Sandler': 72, 'Darko Nejašmić': 72, 'Willum Willumsson': 72, 'Emre Mor': 72, 'Noé Lebreton': 72, 'Gonzalo Crettaz': 72, 'Dennis Geiger': 72,
 'Jasper Cillessen': 71, 'Mohammed Ihattaren': 72, 'Ole Romeny': 73, 'Mees Hilgers': 74, 'Tonny Vilhena': 70, 'Bruno Martins Indi': 70, 'Shunsuke Mito': 73,
 'Younes Namli': 71, 'Nick Viergever': 69, 'Alireza Jahanbakhsh': 70, 'Maas Willemsen': 73, 'Chido Obi': 72, 'Justin Hubner': 72, 'Brynjólfur Willumsson': 72,
 'Remko Pasveer': 66, 'Jens Toornstra': 67, 'Bryan Linssen': 69,
 # League One
 'Harry Souttar': 72, 'Caleb Okoli': 72, 'Jakub Stolarczyk': 71, 'Conor Chaplin': 70, 'Emil Riis': 70, 'John Lundstram': 69, 'Will Smallbone': 69,
 'Bobby De Cordova-Reid': 69, 'Wes Burns': 69, 'Liam Cullen': 68, 'Woyo Coulibaly': 69, 'Luke Thomas': 68, 'Christian McFarlane': 68, 'Kamari Doyle': 67, 'Alex McCarthy': 64,
 'Mads Andersen': 68, 'Kal Naismith': 65, 'Shandon Baptiste': 67, 'Liam Walsh': 67, 'Kasey Palmer': 66, 'Nahki Wells': 64, 'Jamie Donley': 67, 'Teden Mengi': 67,
 'Barry Bannan': 67, 'Max Lowe': 65, 'Yan Valery': 67, 'Liam Cooper': 64, 'Louie Barry': 67, 'Ali Al Hamadi': 66, 'Callum Slattery': 66, 'Davis Keillor-Dunn': 67,
 'Cameron Brannagan': 67, 'Michał Helik': 66, 'Jeon Jin-Woo': 66, 'Tyler Goodrham': 66, 'Bojan Radulović': 66, 'Marcus Harness': 65, 'Joe Taylor': 66, 'Archie Collins': 66,
 'Oliver Norwood': 65, 'Benoný Andrésson': 67, 'Jack Diamond': 66, 'Lewis Bate': 66, 'Lewis Wing': 66, 'George Earthy': 66, 'Malachi Boateng': 66, 'Danny Ings': 66,
 'Michael Smith': 63, 'David McGoldrick': 60, 'Cauley Woodrow': 64, 'Scott Hogan': 62, 'Max Power': 63, 'Jerry Yates': 65, 'Alfie May': 64, 'Michael Cheek': 64,
 'Josh Magennis': 61, 'Isaac Hayden': 66, 'Antoni Sarcevic': 63, 'George Honeyman': 64,
}
NAT_FIX = {'Türkiye': 'Turkey', 'Bosnia-Herzegovina': 'Bosnia and Herzegovina', 'Czech Republic': 'Czechia', 'DR Congo': 'DR Congo', 'Ivory Coast': "Côte d'Ivoire",
           'United States': 'USA', 'South Korea': 'Korea Republic', 'Cabo Verde': 'Cape Verde', 'Republic of Ireland': 'Ireland'}
POS_FIX = {'LM': 'LW', 'RM': 'RW', 'LWB': 'LB', 'RWB': 'RB', 'Defender': 'CB', 'Midfielder': 'CM', 'Attacker': 'ST', 'Forward': 'ST', 'Unspecified': 'CM'}

src = (ROOT / 'src/data_intl.js').read_text()
raw = src.split('const NATS_RAW = `', 1)[1].split('`', 1)[0]
N2C = {}
for line in raw.strip().splitlines():
    c, name = line.split('|')[:2]; N2C[name.lower()] = c
ALIAS = {'turkey': 'TUR', 'usa': 'USA', 'korea republic': 'KOR', "côte d'ivoire": 'CIV', 'czechia': 'CZE', 'bosnia and herzegovina': 'BIH', 'dr congo': 'COD',
         'congo': 'CGO', 'scotland': 'SCO', 'england': 'ENG', 'wales': 'WAL', 'northern ireland': 'NIR', 'ireland': 'IRL', 'cape verde': 'CPV', 'guinea-bissau': 'GNB',
         'burundi': 'BDI', 'saint kitts and nevis': 'SKN', 'antigua and barbuda': 'ATG', 'turks and caicos islands': 'TCA', 'montserrat': 'MSR', 'grenada': 'GRN',
         'dominica': 'DMA', 'bermuda': 'BER', 'guyana': 'GUY', 'trinidad and tobago': 'TRI', 'dominican republic': 'DOM', 'malta': 'MLT', 'afghanistan': 'AFG',
         'kenya': 'KEN', 'malawi': 'MWI', 'uganda': 'UGA', 'sierra leone': 'SLE', 'gambia': 'GAM', 'zimbabwe': 'ZIM', 'curaçao': 'CUW', 'suriname': 'SUR',
         'indonesia': 'IDN', 'new zealand': 'NZL', 'iraq': 'IRQ', 'iran': 'IRN', 'latvia': 'LVA', 'cyprus': 'CYP', 'montenegro': 'MNE', 'georgia': 'GEO', 'israel': 'ISR'}
miss = set()
def nat(n):
    n0 = NAT_FIX.get(n, n); k = n0.lower()
    if k in ALIAS: return ALIAS[k]
    if k in N2C: return N2C[k]
    miss.add(n); return n[:3].upper()

def h(s): return int(hashlib.md5(s.encode()).hexdigest(), 16)
def rating(name, pos, age, no, base):
    if name in STARS: return STARS[name]
    r = base - 3
    if no and no <= 11: r += 3
    elif no and no >= 40: r -= 4
    if age <= 18: r -= 9
    elif age <= 20: r -= 6
    elif age <= 22: r -= 3
    elif age >= 35: r -= 4
    elif age >= 32: r -= 1
    if pos == 'GK': r -= 2
    r += h(name) % 7 - 3
    return max(48, min(r, base + 4))

out_clubs = []
for lg, clubs in CLUBS.items():
    for cid, (name, short, c1, c2, stad, cap, rep, bal, form, base, capt) in clubs.items():
        f = ROOT / f'tools/ed_lo_raw/{lg}_{cid}.txt'
        lines = [l.strip() for l in f.read_text().splitlines() if l.strip()]
        coach = lines[0]; rows = []; used = set()
        for l in lines[1:]:
            n, pos, ctry, no, age = (l.split('|') + ['', '', '', '', ''])[:5]
            pos = POS_FIX.get(pos.split(',')[0].strip(), pos.split(',')[0].strip())
            if pos not in ('GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'): pos = 'CM'
            age = int(age) if age.strip().isdigit() else 20 + h(n + 'age') % 11  # estimate when the source has no age
            no = int(no) if no.strip().isdigit() else 0
            nc = nat(ctry)
            r = rating(n, pos, age, no, base)
            if not no or no in used:
                k = 2
                while k in used: k += 1
                no = k
            used.add(no)
            rows.append([no, n, pos, age, nc, r])
        if capt and not any(r[1] == capt for r in rows): capt = ''
        out_clubs.append({'lg': lg, 'id': cid, 'name': name, 'short': short, 'c1': c1, 'c2': c2, 'stadium': stad, 'cap': cap, 'mgr': coach, 'capt': capt,
                          'rep': rep, 'bal': bal, 'form': form, 'rows': rows})

out = ['// ===== DATA: Eredivisie (top flight only) and EFL League One 2026/27. Squads and head coaches: FotMob team pages (12 Nov 2026);',
       '// some ages are estimates (clubs whose FotMob page listed no ages). Club lists, stadiums and capacities: Wikipedia 2026-27 season pages.',
       '// Ratings, colours, reputations and budgets (£m) are game estimates.', 'const EDLO_CLUBS = [']
for c in out_clubs:
    head = {k: c[k] for k in ['lg', 'id', 'name', 'short', 'c1', 'c2', 'stadium', 'cap', 'mgr', 'capt', 'rep', 'bal', 'form']}
    out.append(json.dumps(head, ensure_ascii=False)[:-1] + ',sq:`\n' + '\n'.join('|'.join(str(x) for x in r) for r in c['rows']) + '\n`},')
out.append('];')
out.append('if (typeof XL_CLUBS !== "undefined") XL_CLUBS.push(...EDLO_CLUBS);')
(ROOT / 'src/data_edlo.js').write_text('\n'.join(out) + '\n')
print('clubs', len(out_clubs), 'players', sum(len(c['rows']) for c in out_clubs), '| unknown nationalities:', sorted(miss))
