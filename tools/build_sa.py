"""Build src/data_sa.js: Italy (Serie A 2026/27 clubs with real squads, Serie B and a Serie C selection at team
level, stadium facts, Italy national team data).

Raw input: tools/sa_raw/*.txt, blocks "## CODE|Coach|Name|Short|c1|c2|Stadium|cap|Captain|rep|bal(£m)|formation"
followed by "name|pos|age|nationality|rating|shirt". Squads: FotMob team pages (4 Nov 2026); coaches, captains and
stadiums: Wikipedia "2026–27 Serie A" (read 4 Nov 2026; Parma and Venezia coaches from FotMob). Ages, positions and
ratings are game estimates.
Usage: python3 tools/build_sa.py
"""
import pathlib, json
ROOT = pathlib.Path(__file__).resolve().parent.parent

clubs = []
for f in sorted((ROOT / 'tools/sa_raw').glob('sa*.txt')):
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

for c in clubs:
    used = set()
    for r in c['rows']:
        if r[0] in used:
            k = 2
            while k in used: k += 1
            r[0] = k
        used.add(r[0])

# Stadium facts: year opened and stand names [main side, opposite side, home end, other end] (compiled, not individually checked)
STAD = {
 'INT': ('1926', ['Tribuna Arancio', 'Tribuna Blu', 'Curva Nord', 'Curva Sud'], 1, 0),
 'ACM': ('1926', ['Tribuna Arancio', 'Tribuna Blu', 'Curva Sud', 'Curva Nord'], 1, 0),
 'JUV': ('2011', ['Tribuna Ovest', 'Tribuna Est', 'Curva Sud', 'Curva Nord'], 1, 0),
 'NAP': ('1959', ['Tribuna Posillipo', 'Distinti', 'Curva B', 'Curva A'], 1, 0),
 'ROM': ('1953', ['Tribuna Monte Mario', 'Tribuna Tevere', 'Curva Sud', 'Curva Nord'], 1, 0),
 'LAZ': ('1953', ['Tribuna Monte Mario', 'Tribuna Tevere', 'Curva Nord', 'Curva Sud'], 1, 0),
 'ATA': ('1928', ['Tribuna Giulio Cesare', 'Tribuna Rinascimento', 'Curva Nord', 'Curva Sud'], 0, 1),
 'COM': ('1927', ['Tribuna', 'Distinti', 'Curva Azzurra', 'Settore Ospiti'], 0, 1),
 'BGN': ('1927', ['Tribuna', 'Distinti', 'Curva Andrea Costa', 'Curva San Luca'], 1, 0),
 'FIO': ('1931', ['Tribuna', 'Maratona', 'Curva Fiesole', 'Curva Ferrovia'], 1, 0),
 'TOR': ('1933', ['Tribuna Grande Torino', 'Distinti', 'Curva Maratona', 'Curva Primavera'], 1, 0),
 'UDI': ('1976', ['Tribuna Centrale', 'Distinti', 'Curva Nord', 'Curva Sud'], 0, 1),
 'GEN': ('1911', ['Tribuna', 'Distinti', 'Gradinata Nord', 'Gradinata Sud'], 0, 1),
 'SAS': ('1995', ['Tribuna Centrale', 'Distinti', 'Curva Sud', 'Curva Nord'], 0, 1),
 'PAR': ('1923', ['Tribuna Petitot', 'Tribuna Est', 'Curva Nord', 'Curva Sud'], 0, 1),
 'CAG': ('2017', ['Tribuna', 'Distinti', 'Curva Nord', 'Curva Sud'], 0, 1),
 'LEC': ('1966', ['Tribuna Centrale', 'Tribuna Est', 'Curva Nord', 'Curva Sud'], 1, 0),
 'MNZ': ('1988', ['Tribuna Centrale', 'Distinti', 'Curva Sud', 'Curva Nord'], 0, 1),
 'FRO': ('2017', ['Tribuna Centrale', 'Distinti', 'Curva Nord', 'Curva Sud'], 0, 1),
 'VEN': ('1913', ['Tribuna', 'Distinti', 'Curva Sud', 'Curva Nord'], 0, 0),
}
stadia = {k: {'o': o, 'rec': None, 'pitch': '105 × 68 m', 'st': st, **({'bowl': 1} if bowl else {}), **({'c': 1} if cor else {})} for k, (o, st, bowl, cor) in STAD.items()}

# Serie B 2026/27 (Wikipedia, read 4 Nov 2026): name, team strength (game estimate), stadium, capacity
SB = [
 ('Hellas Verona', 70, 'Stadio Marcantonio Bentegodi', 39211), ('Pisa', 69, 'Arena Garibaldi', 12508), ('Cremonese', 69, 'Stadio Giovanni Zini', 20641),
 ('Palermo', 69, 'Stadio Renzo Barbera', 36365), ('Empoli', 68, 'Stadio Carlo Castellani', 16284), ('Sampdoria', 67, 'Stadio Luigi Ferraris', 33205),
 ('Modena', 66, 'Stadio Alberto Braglia', 21151), ('Cesena', 66, 'Orogel Stadium-Dino Manuzzi', 20194), ('Catanzaro', 66, 'Stadio Nicola Ceravolo', 14650),
 ('Padova', 65, 'Stadio Euganeo', 32420), ('Südtirol', 65, 'Stadio Druso', 5539), ('Juve Stabia', 65, 'Stadio Romeo Menti', 7642),
 ('Mantova', 64, 'Stadio Danilo Martelli', 14884), ('Carrarese', 64, 'Stadio dei Marmi', 4194), ('Avellino', 64, 'Stadio Partenio-Adriano Lombardi', 26000),
 ('Virtus Entella', 63, 'Stadio Comunale', 5535), ('Vicenza', 63, 'Stadio Romeo Menti', 12000), ('Benevento', 63, 'Stadio Ciro Vigorito', 16867),
 ('Arezzo', 62, 'Stadio Città di Arezzo', 13128), ('Ascoli', 62, 'Stadio Cino e Lillo Del Duca', 12461),
]
# Serie C clubs used for promotion to Serie B (selection; strengths are game estimates)
SC = [('Bari', 58), ('Spezia', 58), ('Salernitana', 57), ('Reggiana', 57), ('Cittadella', 56), ('Ternana', 56), ('Pescara', 56),
      ('Perugia', 55), ('Catania', 56), ('Triestina', 54), ('Lecco', 54), ('Novara', 54), ('Foggia', 53), ('Crotone', 54), ('Trapani', 53), ('Feralpisalò', 53)]

# Italy national team (FotMob squad and Wikipedia caps as of 5 Oct 2026; ~ marks an estimate)
ITA_ABROAD = [('Diego Coppola', 'CB', 22, 'Paris FC', 75), ('Samuele Inácio', 'AM', 18, 'Borussia Dortmund', 70), ('Issa Doumbia', 'CM', 23, 'Sporting CP', 74),
              ('Mohamed Alì Zoma', 'ST', 19, 'Nürnberg', 67)]
ITA_CAPS = [('Gianluigi Donnarumma', 87, 0), ('Nicolò Barella', 73, 10), ('Giovanni Di Lorenzo', 56, 5), ('Alessandro Bastoni', 46, 5), ('Federico Dimarco', 38, 3),
 ('Bryan Cristante', 48, 2), ('Davide Frattesi', 38, 9), ('Moise Kean', 28, 13), ('Gianluca Mancini', 22, 2), ('Riccardo Calafiori', 17, 1), ('Federico Chiesa', 51, 7),
 ('Lorenzo Pellegrini', 36, 6), ('Manuel Locatelli', 36, 3), ('Raoul Bellanova', 6, 0), ('Alessandro Buongiorno', 12, 0), ('Nicolò Fagioli', 9, 0),
 ('Sandro Tonali', '~30', '~2'), ('Guglielmo Vicario', '~5', 0), ('Marco Carnesecchi', '~3', 0), ('Massimo Pessina', '~1', 0), ('Giorgio Scalvini', '~5', 0),
 ('Matteo Ruggeri', '~3', 0), ('Michael Kayode', '~2', 0), ('Honest Ahanor', '~1', 0), ('Daniele Ghilardi', '~3', 0), ('Diego Coppola', '~2', 0),
 ('Eddy Kouadio', '~1', 0), ('Rolando Mandragora', '~5', 0), ('Samuele Ricci', '~10', 0), ('Alessandro Romano', '~1', 0), ('Samuele Inácio', '~1', 0),
 ('Issa Doumbia', '~1', 0), ('Antonio Vergara', '~2', 0), ('Nicolò Cambiaghi', '~4', '~1'), ('Francesco Pio Esposito', '~10', '~4'), ('Gianluca Scamacca', '~22', '~3'),
 ('Mohamed Alì Zoma', '~1', 0), ('Daniel Maldini', '~5', '~1'), ('Sebastiano Esposito', '~2', 0), ('Andrea Cambiaso', '~18', '~1'), ('Destiny Udogie', '~14', 0),
 ('Giacomo Raspadori', '~44', '~9'), ('Mattia Zaccagni', '~14', '~2'), ('Matteo Politano', '~25', '~3'), ('Nicolò Rovella', '~6', 0)]
NAT_REC_ITA = {'caps': [('Gianluigi Buffon', 176), ('Fabio Cannavaro', 136), ('Paolo Maldini', 126), ('Leonardo Bonucci', 121), ('Giorgio Chiellini', 117)],
               'goals': [('Luigi Riva', 35), ('Giuseppe Meazza', 33), ('Silvio Piola', 30), ('Alessandro Del Piero', 27), ('Roberto Baggio', 27)]}

FIRST_IT = 'Luca Marco Matteo Andrea Alessandro Lorenzo Francesco Davide Simone Federico Riccardo Giacomo Tommaso Leonardo Gabriele Pietro Nicolò Filippo Edoardo Mattia Christian Daniele Stefano Antonio Giuseppe Salvatore Vincenzo Michele Emanuele Samuele Cristian Alessio Diego Giovanni Paolo Elia Manuel Jacopo Raffaele Kevin'.split()
LAST_IT = [x.replace('_', ' ') for x in 'Rossi Russo Ferrari Esposito Bianchi Romano Colombo Ricci Marino Greco Bruno Gallo Conti De_Luca Mancini Costa Giordano Rizzo Lombardi Moretti Barbieri Fontana Santoro Mariani Rinaldi Caruso Ferrara Galli Martini Leone Longo Gentile Martinelli Vitale Lombardo Serra Coppola De_Santis D\'Angelo Marchetti Parisi Villa Conte Ferraro Ferri Fabbri Bianco Marini Grasso Valentini Messina Sala De_Angelis Gatti Pellegrini Palumbo Sanna Farina Rizzi Monti Cattaneo Morelli Amato Silvestri Mazza Testa Grassi Pellegrino Carbone Giuliani Benedetti Barone Rossetti Caputo Montanari Guerra Palmieri Bernardi Martino Fiore De_Rosa Ferretti Bellini Basile Riva Donati Piras Vitali Battaglia Sartori Neri Costantini Milani Pagano Ruggiero Sorrentino'.split()]

out = ['// ===== DATA: Italy. Serie A 2026/27 squads (FotMob team pages, 4 Nov 2026; ages, positions and ratings are game estimates).',
       '// Coaches, captains and stadiums: Wikipedia "2026-27 Serie A" (read 4 Nov 2026). Serie B and Serie C are team level.',
       '// Budgets (bal) are in £m, scaled to the game\'s English finances.',
       'const SA_CLUBS = [']
for c in clubs:
    head = {k: c[k] for k in ['id', 'name', 'short', 'c1', 'c2', 'stadium', 'cap', 'mgr', 'capt', 'rep', 'bal', 'form']}
    sq = '\n'.join('|'.join(str(x) for x in r) for r in c['rows'])
    out.append(json.dumps(head, ensure_ascii=False)[:-1] + ',sq:`\n' + sq + '\n`},')
out.append('];')
out.append('const SB_CLUBS = ' + json.dumps([list(x) for x in SB], ensure_ascii=False) + ';')
out.append('const SC_CLUBS = ' + json.dumps([list(x) for x in SC], ensure_ascii=False) + ';')
out.append('const SA_STADIA = ' + json.dumps(stadia, ensure_ascii=False) + ';')
out.append('const ITA_ABROAD = ' + json.dumps([list(x) for x in ITA_ABROAD], ensure_ascii=False) + ';')
out.append('const ITA_CAPS = ' + json.dumps([[a, str(b), str(c)] for a, b, c in ITA_CAPS], ensure_ascii=False) + ';')
out.append('NAT_REC.ITA = ' + json.dumps(NAT_REC_ITA, ensure_ascii=False) + ';')
out.append('const FIRST_IT = ' + json.dumps(FIRST_IT, ensure_ascii=False) + ';')
out.append('const LAST_IT = ' + json.dumps(LAST_IT, ensure_ascii=False) + ';')
src = '\n'.join(out) + '\n'
(ROOT / 'src/data_sa.js').write_text(src)
print('ok', len(clubs), 'clubs', sum(len(c['rows']) for c in clubs), 'players', len(src), 'bytes')
