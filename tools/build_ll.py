"""Build src/data_ll.js: Spain (La Liga 2026/27 clubs with real squads, Segunda División and
Primera Federación at team level, stadium facts, Spain national team data).

Raw input: tools/ll_raw/*.txt, blocks "## CODE|Coach|Name|Short|c1|c2|Stadium|cap|Captain|rep|bal(£m)|formation"
followed by "name|pos|age|nationality|rating|shirt". Squads: FotMob team pages (31 Oct 2026); coaches,
captains and stadiums: Wikipedia "2026–27 La Liga" (read 31 Oct 2026). Ages, positions and ratings are game estimates.
Usage: python3 tools/build_ll.py
"""
import pathlib, json
ROOT = pathlib.Path(__file__).resolve().parent.parent

clubs = []
for f in sorted((ROOT / 'tools/ll_raw').glob('ll*.txt')):
    cur = None
    for line in f.read_text().splitlines():
        line = line.strip()
        if not line: continue
        if line.startswith('##'):
            code, coach, name, short, c1, c2, stad, cap, capt, rep, bal, form = [x.strip() for x in line[2:].split('|')]
            cur = {'id': code, 'name': name, 'short': short, 'c1': c1, 'c2': c2, 'stadium': stad, 'cap': int(cap), 'mgr': coach, 'capt': capt, 'rep': int(rep), 'bal': int(bal), 'form': form, 'rows': []}
            clubs.append(cur); continue
        n, pos, age, nat, ca, no = [x.strip() for x in line.split('|')]
        cur['rows'].append([int(no), n, pos, int(age), nat, int(ca)])

for c in clubs:  # unique shirt numbers
    used = set()
    for r in c['rows']:
        if r[0] in used:
            k = 2
            while k in used: k += 1
            r[0] = k
        used.add(r[0])

# Stadium facts: year opened and stand names [main side, opposite side, home end, other end].
# rec None = no verified record attendance. Pitch sizes are the LaLiga standard (105 x 68 m) unless noted.
STAD = {
 'RMA': ('1947', ['Lateral Oeste', 'Lateral Este', 'Fondo Sur', 'Fondo Norte'], 1, 0),
 'BAR': ('1957', ['Tribuna', 'Lateral', 'Gol Nord', 'Gol Sud'], 1, 0),
 'ATM': ('1994 (Atlético since 2017)', ['Tribuna Oeste', 'Tribuna Este', 'Fondo Sur', 'Fondo Norte'], 1, 0),
 'VIL': ('1923', ['Tribuna', 'Preferencia', 'Fondo Norte', 'Fondo Sur'], 0, 1),
 'BET': ('1999 (Betis since 2025)', ['Tribuna', 'Preferencia', 'Gol Norte', 'Gol Sur'], 1, 0),
 'ATH': ('2013', ['Tribuna Principal', 'Tribuna Este', 'Tribuna Norte', 'Tribuna Sur'], 0, 1),
 'RSO': ('1993', ['Tribuna Principal', 'Tribuna Este', 'Fondo Norte', 'Fondo Sur'], 1, 0),
 'SEV': ('1958', ['Preferencia', 'Fondo', 'Gol Norte', 'Gol Sur'], 1, 0),
 'CEL': ('1928', ['Tribuna', 'Río', 'Marcador', 'Gol'], 0, 0),
 'GET': ('1998', ['Tribuna', 'Preferencia', 'Fondo Norte', 'Fondo Sur'], 0, 1),
 'RAY': ('1976', ['Tribuna', 'Preferencia', 'Fondo', 'Muro'], 0, 0),
 'VAL': ('1923', ['Tribuna Central', 'Grada de Preferencia', 'Gol Norte', 'Gol Sur'], 0, 1),
 'OSA': ('1967', ['Tribuna Principal', 'Tribuna Preferencia', 'Gol Norte', 'Gol Sur'], 0, 1),
 'EPY': ('2009', ['Tribuna', 'Lateral', 'Gol Nord', 'Gol Sud'], 1, 0),
 'ALA': ('1924', ['Tribuna Principal', 'Preferencia', 'Fondo Norte', 'Fondo Sur'], 0, 1),
 'LEV': ('1969', ['Tribuna', 'Lateral', 'Gol Nord', 'Gol Sud'], 0, 1),
 'ELC': ('1976', ['Tribuna', 'Preferencia', 'Fondo Norte', 'Fondo Sur'], 1, 0),
 'RAC': ('1988', ['Tribuna', 'Preferencia', 'Fondo Norte', 'Fondo Sur'], 0, 1),
 'DEP': ('1944', ['Tribuna', 'Preferencia', 'Pabellón', 'Maratón'], 0, 1),
 'MAL': ('1941', ['Tribuna', 'Preferencia', 'Fondo Norte', 'Fondo Sur'], 0, 1),
}
stadia = {k: {'o': o, 'rec': None, 'pitch': '105 × 68 m', 'st': st, **({'bowl': 1} if bowl else {}), **({'c': 1} if cor else {})} for k, (o, st, bowl, cor) in STAD.items()}

# Segunda División 2026/27 (Wikipedia, read 31 Oct 2026): name, team strength (game estimate), stadium, capacity, B team
SEG = [
 ('Mallorca', 67, 'Estadi Mallorca Son Moix', 23142, 0), ('Girona', 67, 'Montilivi', 14624, 0), ('Real Oviedo', 65, 'Carlos Tartiere', 30500, 0),
 ('Almería', 65, 'Power Horse Stadium', 18331, 0), ('Castellón', 64, 'Castalia', 15500, 0), ('Las Palmas', 64, 'Estadio de Gran Canaria', 32400, 0),
 ('Eibar', 63, 'Ipurua', 8164, 0), ('Leganés', 63, 'Butarque', 12454, 0), ('Granada', 63, 'Nuevo Los Cármenes', 19336, 0),
 ('Valladolid', 63, 'José Zorrilla', 27618, 0), ('Sporting Gijón', 62, 'El Molinón', 29371, 0), ('Cádiz', 62, 'Nuevo Mirandilla', 20724, 0),
 ('Burgos', 61, 'El Plantío', 12200, 0), ('Córdoba', 61, 'Nuevo Arcángel', 25100, 0), ('Tenerife', 60, 'Heliodoro Rodríguez López', 22824, 0),
 ('Andorra', 60, 'Estadi Nacional', 3306, 0), ('Albacete', 60, 'Carlos Belmonte', 17524, 0), ('Sabadell', 58, 'Nova Creu Alta', 11981, 0),
 ('Eldense', 57, 'Nuevo Pepico Amat', 4036, 0), ('Ceuta', 57, 'Alfonso Murube', 6500, 0), ('Real Sociedad B', 57, 'Zubieta', 2500, 1),
 ('Celta Fortuna', 56, 'Barreiro', 4500, 1),
]
# Primera Federación clubs used for Copa del Rey early rounds and Segunda promotion (selection; strengths are game estimates)
PF = [('Zaragoza', 59), ('Huesca', 58), ('Mirandés', 58), ('Cultural Leonesa', 57), ('Racing Ferrol', 56), ('Real Murcia', 56),
      ('Hércules', 55), ('Ponferradina', 55), ('Alcorcón', 54), ('Lugo', 54), ('Gimnàstic', 55), ('Ibiza', 54), ('Algeciras', 53),
      ('Antequera', 53), ('Unionistas', 52), ('Arenteiro', 52), ('Atlético Baleares', 52), ('Tarazona', 51), ('Real Unión', 52), ('Sestao River', 51)]

# Spain national team (Wikipedia "Spain national football team", current squad, caps/goals as of 26 Sep 2026;
# ~ marks an estimate for players outside that squad)
ESP_ABROAD = [('Fabián Ruiz', 'CM', 30, 'Paris SG', 85), ('Ferran Torres', 'ST', 26, 'Paris SG', 83), ('Josep Martínez', 'GK', 28, 'Inter', 79), ('Iván Fresneda', 'RB', 22, 'Sporting CP', 77)]
ESP_CAPS = [('David Raya', 14, 0), ('Josep Martínez', 1, 0), ('Unai Simón', 67, 0), ('Dean Huijsen', 7, 0), ('Alejandro Grimaldo', 14, 0), ('Eric García', 22, 0),
 ('Pau Cubarsí', 21, 0), ('Marc Pubill', 4, 0), ('Aymeric Laporte', 55, 2), ('Marc Cucurella', 33, 1), ('Iván Fresneda', 0, 0), ('Mikel Merino', 52, 12),
 ('Fabián Ruiz', 51, 7), ('Fermín López', 7, 0), ('Álex Baena', 25, 4), ('Rodri', 71, 4), ('Martin Zubimendi', 27, 3), ('Pedri', 50, 6),
 ('Ferran Torres', 66, 25), ('Dani Olmo', 59, 12), ('Yeremy Pino', 25, 4), ('Nico Williams', 37, 6), ('Lamine Yamal', 34, 8), ('Mikel Oyarzabal', 62, 31),
 ('Roberto Fernández', 0, 0), ('Pedro Porro', '~20', 0), ('Koke', '~72', '~2'), ('Daniel Carvajal', '~52', '~1'), ('Isco', '~38', '~12'), ('Carlos Espí', 0, 0)]
NAT_REC = {'ESP': {'caps': [('Sergio Ramos', 180), ('Iker Casillas', 167), ('Sergio Busquets', 143), ('Xavi', 133), ('Andrés Iniesta', 131)],
                   'goals': [('David Villa', 59), ('Raúl', 44), ('Fernando Torres', 38), ('Álvaro Morata', 37), ('David Silva', 35)]}}

FIRST_ES = 'Pablo Álvaro Hugo Mario Daniel Adrián Iker Unai Jon Marc Pol Sergio Javier Carlos Diego Rubén Alejandro Raúl Iván Aitor Asier Gorka Oier Nico Marcos Ander Óscar Víctor Bruno Gonzalo Izan Eneko Jorge Manu Rafa Joan Arnau Xabi Mikel Andrés'.split()
LAST_ES = 'García Martínez López Sánchez Pérez Gómez Fernández Díaz Moreno Muñoz Álvarez Romero Navarro Torres Domínguez Vázquez Ramos Gil Serrano Blanco Molina Ortega Delgado Castro Rubio Marín Sanz Iglesias Medina Garrido Cortés Castillo Santos Lozano Guerrero Cano Prieto Méndez Calvo Gallego Vidal León Herrera Márquez Peña Flores Cabrera Campos Vega Fuentes Carrasco Caballero Reyes Nieto Aguilar Pascual Santana Herrero Lorenzo Montero Hidalgo Ibáñez Ferrer Benítez Mora Vicente Arias Vargas Carmona Crespo Román Pastor Soto Sáez Velasco Moya Soler Parra Esteban Bravo Gallardo Etxeberria Aguirre Goikoetxea Arrieta Larrañaga Iturriaga Urrutia'.split()

out = ['// ===== DATA: Spain. La Liga 2026/27 squads (FotMob team pages, 31 Oct 2026; ages, positions and ratings are game estimates).',
       '// Coaches, captains and stadiums: Wikipedia "2026-27 La Liga" (read 31 Oct 2026). Segunda División and Primera Federación are team level.',
       '// Budgets (bal) are in £m, scaled to the game\'s English finances.',
       'const LL_CLUBS = [']
for c in clubs:
    head = {k: c[k] for k in ['id', 'name', 'short', 'c1', 'c2', 'stadium', 'cap', 'mgr', 'capt', 'rep', 'bal', 'form']}
    sq = '\n'.join('|'.join(str(x) for x in r) for r in c['rows'])
    out.append(json.dumps(head, ensure_ascii=False)[:-1] + ',sq:`\n' + sq + '\n`},')
out.append('];')
out.append('const SEG_CLUBS = ' + json.dumps([list(x) for x in SEG], ensure_ascii=False) + ';')
out.append('const PF_CLUBS = ' + json.dumps([list(x) for x in PF], ensure_ascii=False) + ';')
out.append('// stadium facts (opening year, stand names); record attendances not verified')
out.append('const LL_STADIA = ' + json.dumps(stadia, ensure_ascii=False) + ';')
out.append('// Spain: players based abroad (outside the game\'s leagues), caps|goals, all-time records')
out.append('const ESP_ABROAD = ' + json.dumps([list(x) for x in ESP_ABROAD], ensure_ascii=False) + ';')
out.append('const ESP_CAPS = ' + json.dumps([[a, str(b), str(c)] for a, b, c in ESP_CAPS], ensure_ascii=False) + ';')
out.append('const NAT_REC = ' + json.dumps(NAT_REC, ensure_ascii=False) + ';')
out.append('const FIRST_ES = ' + json.dumps(FIRST_ES, ensure_ascii=False) + ';')
out.append('const LAST_ES = ' + json.dumps(LAST_ES, ensure_ascii=False) + ';')
src = '\n'.join(out) + '\n'
(ROOT / 'src/data_ll.js').write_text(src)
print('ok', len(clubs), 'clubs', sum(len(c['rows']) for c in clubs), 'players', len(src), 'bytes')
