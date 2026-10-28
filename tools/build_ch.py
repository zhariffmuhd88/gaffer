"""Build src/data_ch.js (Championship 2026/27 clubs with real squads) from raw squad lists.

Raw input: lines "## CODE|Coach" followed by "no|full name|positions|age|nationality"
(squads from FotMob team pages, as of 24-28 Oct 2026). Ratings are game estimates:
a club level plus age adjustments, with hand-set values for known players.
Usage: python3 tools/build_ch.py RAW_DIR
"""
import sys, pathlib, re, hashlib, json

CLUBS = {
 # code: name, short, c1, c2, stadium, cap, captain, rep, bal(£m), level, formation
 'WHU': ('West Ham United', 'West Ham', '#7a263a', '#1bb1e7', 'London Stadium', 62500, 'Jarrod Bowen', 72, 60, 72, '4-2-3-1'),
 'WOL': ('Wolverhampton Wanderers', 'Wolves', '#fdb913', '#231f20', 'Molineux Stadium', 31750, 'Toti Gomes', 70, 45, 70, '3-4-2-1'),
 'BUR': ('Burnley', 'Burnley', '#6c1d45', '#99d6ea', 'Turf Moor', 21990, 'Josh Cullen', 68, 45, 69, '4-2-3-1'),
 'SOU': ('Southampton', 'Southampton', '#d71920', '#f4f4f4', "St Mary's Stadium", 32384, 'Jack Stephens', 67, 40, 68, '4-2-3-1'),
 'MID': ('Middlesbrough', 'Middlesbrough', '#e11b22', '#f4f4f4', 'Riverside Stadium', 34742, 'Luke Ayling', 66, 30, 68, '4-2-3-1'),
 'SHU': ('Sheffield United', 'Sheff Utd', '#ee2737', '#111111', 'Bramall Lane', 32050, 'Japhet Tanganga', 65, 25, 67, '3-5-2'),
 'NOR': ('Norwich City', 'Norwich', '#fff200', '#00a650', 'Carrow Road', 27359, 'Kenny McLean', 64, 25, 66, '4-2-3-1'),
 'WBA': ('West Bromwich Albion', 'West Brom', '#122f67', '#f4f4f4', 'The Hawthorns', 26850, 'George Campbell', 63, 20, 66, '4-2-3-1'),
 'WAT': ('Watford', 'Watford', '#fbee23', '#111111', 'Vicarage Road', 22200, 'Mattie Pollock', 63, 20, 66, '4-3-3'),
 'MIL': ('Millwall', 'Millwall', '#001d5e', '#f4f4f4', 'The Den', 20146, 'Jake Cooper', 62, 15, 65, '4-2-3-1'),
 'BRC': ('Bristol City', 'Bristol City', '#e21a23', '#f4f4f4', 'Ashton Gate', 26462, 'Jason Knight', 62, 15, 65, '3-4-2-1'),
 'SWA': ('Swansea City', 'Swansea', '#f4f4f4', '#121212', 'Swansea.com Stadium', 21088, 'Ben Cabango', 62, 15, 65, '4-2-3-1'),
 'STK': ('Stoke City', 'Stoke', '#e03a3e', '#f4f4f4', 'bet365 Stadium', 30089, 'Viktor Johansson', 62, 20, 65, '4-2-3-1'),
 'DER': ('Derby County', 'Derby', '#f4f4f4', '#111111', 'Pride Park Stadium', 33597, 'Lewis Travis', 61, 15, 64, '3-4-2-1'),
 'QPR': ('Queens Park Rangers', 'QPR', '#1d5ba4', '#f4f4f4', 'Loftus Road', 18439, 'Jimmy Dunne', 60, 10, 64, '4-2-3-1'),
 'PNE': ('Preston North End', 'Preston', '#f4f4f4', '#001e5b', 'Deepdale', 23408, 'Ali McCann', 60, 10, 64, '3-4-2-1'),
 'BLB': ('Blackburn Rovers', 'Blackburn', '#009ee0', '#f4f4f4', 'Ewood Park', 31367, 'Todd Cantwell', 60, 10, 64, '3-4-2-1'),
 'BIR': ('Birmingham City', 'Birmingham', '#1641a6', '#f4f4f4', "St Andrew's", 29409, 'Christoph Klarer', 64, 30, 66, '4-2-3-1'),
 'WRE': ('Wrexham', 'Wrexham', '#d71920', '#f4f4f4', 'Racecourse Ground', 10771, 'Dominic Hyam', 62, 25, 65, '3-5-2'),
 'CHA': ('Charlton Athletic', 'Charlton', '#d4021d', '#f4f4f4', 'The Valley', 27111, 'Greg Docherty', 59, 12, 63, '4-4-2'),
 'POR': ('Portsmouth', 'Portsmouth', '#001489', '#f4f4f4', 'Fratton Park', 20867, 'Marlon Pack', 59, 12, 63, '4-2-3-1'),
 'BOL': ('Bolton Wanderers', 'Bolton', '#f4f4f4', '#263c7e', 'Toughsheet Community Stadium', 28723, 'Eoin Toal', 58, 10, 62, '4-2-3-1'),
 'CAR': ('Cardiff City', 'Cardiff', '#0070b5', '#f4f4f4', 'Cardiff City Stadium', 33280, 'Calum Chambers', 58, 10, 62, '4-2-3-1'),
 'LIN': ('Lincoln City', 'Lincoln', '#e2231a', '#f4f4f4', 'Sincil Bank', 11400, 'Tendayi Darikwa', 56, 6, 61, '4-2-3-1'),
}
# FotMob lists Nicky Hayen, but Burnley sacked him on 24 Oct 2026 and had not named a successor.
COACH_FIX = {'BUR': 'Caretaker manager'}
DEDUCT = {'SOU': 4}  # points deduction for 2026/27 (Wikipedia, 2026-27 EFL Championship)

# Ratings set by hand (club code -> {surname or full name: rating}); anything else uses the heuristic.
R = {
 'WHU': {'Bowen': 80, 'Hermansen': 77, 'Areola': 72, 'Walker-Peters': 75, 'Kilman': 76, 'Mavropanos': 74, 'Álvarez': 76, 'Souček': 74, 'Engels': 73, 'Castellanos': 74, 'Solomon': 73, 'Piroe': 72, 'Cornet': 70, 'Magassa': 71, 'Boiro': 70, 'Morato': 72, 'Veltman': 67, 'Pablo': 68, 'Mukasa': 66, 'Kanté': 68, 'Scarles': 66, 'Lamadrid': 66, 'Austbø': 63, 'Ajala': 60, 'Orford': 62, 'Herrick': 58},
 'WOL': {'José Sá': 75, 'Virgínia': 68, 'Ruddy': 60, 'Trippier': 72, 'Mosquera': 75, 'Toti Gomes': 73, 'Djiga': 70, 'Krejcí': 74, 'Konan': 69, 'Bueno': 71, 'Munetsi': 72, 'André': 74, 'Jordan James': 72, 'Boubacar Traoré': 69, 'Doyle': 71, 'Bellegarde': 73, 'Tchatchoua': 71, 'Fer López': 72, 'Mané': 70, 'Bertrand Traoré': 68, 'Rodrigo Gomes': 71, 'Saïd': 71, 'Chirewa': 66, 'Jiménez': 69, 'Armstrong': 72, 'Neave': 63},
 'BUR': {'Weiß': 71, 'Amos': 58, 'Coudert': 64, 'Walker': 72, 'Roberts': 68, 'Sambo': 66, 'Sonne': 68, 'Alleyne': 66, 'Humphreys': 70, 'Ahmedhodžić': 72, 'Ekdal': 71, 'Beyer': 69, 'Igor Julio': 72, 'Pires': 69, 'Raghouber': 67, 'Laurent': 68, 'Hatate': 74, 'Cullen': 70, 'Ramsey': 70, 'Mejbri': 71, 'Castell': 62, 'Edwards': 70, 'Trésor': 71, 'Bruun Larsen': 69, 'Banel': 66, 'Ramazani': 71, 'Obafemi': 66, 'Vardy': 66, 'Amdouni': 71, 'Hountondji': 69, 'Broja': 71, 'Barnes': 61},
 'SOU': {'Peretz': 71, 'Long': 64, 'Jamie Jones': 58, 'Abbott': 66, 'Bree': 68, 'Stephens': 68, 'Schlotterbeck': 70, 'Wood': 68, 'Manning': 69, 'Welington': 68, 'Downes': 71, 'Jander': 71, 'Bragg': 64, 'Ward-Prowse': 73, 'Roerslev': 67, 'Azaz': 72, 'Fellows': 71, 'Matsuki': 68, 'Scienza': 70, 'Edozie': 68, 'Larin': 70, 'Dobbin': 67, 'Mubama': 65},
 'MID': {'Vítek': 71, 'Brynn': 62, 'McLaughlin': 58, 'Brittain': 68, 'Phillips': 68, 'Alfie Jones': 69, 'Ayling': 65, 'Edmundson': 67, 'Malanda': 70, 'Borges': 67, 'Byram': 64, 'Bangura': 66, 'Arfsten': 69, 'Berhalter': 71, 'Barron': 68, 'Morris': 71, 'McCabe': 63, 'Castledine': 64, 'McGree': 71, 'Pukštas': 69, 'Cozier-Duberry': 66, 'Peart-Harris': 66, 'Sarmiento': 68, 'Hamilton': 66, 'Joseph': 67, 'Lankshear': 70, 'Conway': 69, 'Strelec': 69},
 'SHU': {'Cooper': 69, 'Davies': 62, 'Choudhury': 67, 'Seriki': 65, 'Doherty': 66, 'Tanganga': 69, 'Kitching': 67, 'McGuinness': 66, 'Baptiste': 64, 'McCallum': 66, 'Burrows': 69, 'Norrington-Davies': 65, 'Rothwell': 66, 'Peck': 68, 'Riedewald': 64, 'Arblaster': 68, 'Phillips': 70, 'Shackleton': 64, 'Donovan': 63, 'Chong': 67, 'Brereton': 68, 'Cannon': 69, 'Ayew': 66, 'Campbell': 68, 'Oné': 62, 'Bamford': 66},
 'NOR': {'Kovačević': 69, 'Grimshaw': 63, 'Stacey': 66, 'Fisher': 66, 'Darling': 69, 'Yongwa': 66, 'McConville': 65, 'Alves': 63, 'Córdoba': 67, 'Mahovo': 63, 'Chrisene': 63, 'Mattsson': 69, 'Wright': 67, 'Topić': 68, 'McLean': 65, 'Field': 64, 'Ben Slimane': 67, 'Maghoma': 65, 'Brooks': 66, 'Crnac': 70, 'Diallo': 65, 'Makama': 65, 'Schwartau': 66, 'Ahmed': 64, 'Musaba': 65, 'Touré': 66, 'Kvistgaarden': 70},
 'WBA': {"O'Leary": 67, 'Ingram': 62, 'Mepham': 68, 'Phillips': 68, 'Campbell': 68, 'Pereira': 65, 'Styles': 69, 'Townsend': 63, 'Galves': 64, 'Collyer': 67, 'Myhre': 67, 'Molumby': 68, 'Diakité': 69, 'Nzingoula': 63, 'Morgan': 63, 'Price': 68, 'Whitwell': 61, 'Johnston': 68, 'Bany': 66, 'Tunde': 62, 'Stewart': 64, 'Heggebø': 67},
 'WAT': {'Ravaglia': 66, 'Walker': 58, 'Bachmann': 66, 'Ngakia': 66, 'Diatta': 69, 'Haktab Traoré': 66, 'Coulibaly': 67, 'Keben': 66, 'Pollock': 68, 'Mlačić': 60, 'Clarridge': 60, 'Bola': 65, 'Zemura': 66, 'Kyprianou': 69, 'Bove': 72, 'Kayembe': 66, 'Mullins': 60, 'Payero': 69, 'Grieves': 60, 'Bravo': 66, 'Baah': 67, 'Maamma': 68, 'Nabizada': 60, 'Vata': 64, 'Mavididi': 69, 'Kjerrumgaard': 67, 'Boadu': 68, 'Antonio': 64, 'Doumbia': 62},
 'MIL': {'Jensen': 68, 'Crocombe': 62, 'Marschall': 60, 'Osei-Tutu': 65, 'Crama': 67, 'Leonard': 61, 'Cooper': 67, 'Taylor': 66, 'Baggott': 66, 'Batth': 61, 'Sturge': 64, 'Doughty': 66, 'Servais': 63, 'Metcalfe': 64, 'Kelly': 62, 'Luongo': 63, 'De Norre': 68, 'Mazou-Sacko': 62, 'Neghli': 69, 'Cundle': 66, 'Sykes': 66, 'Esse': 67, 'Lisbie': 63, 'Issoufou': 60, 'Arconte': 67, 'Ivanović': 69, 'Dykes': 65, 'Coburn': 66, 'Lovelace': 61},
 'BRC': {'Tickle': 68, 'Thomas': 60, 'Collins': 60, 'Eissat': 63, 'Atkinson': 66, 'McNally': 68, 'Dickie': 67, 'Tanner': 65, 'Eile': 67, 'Pring': 66, 'Cardines': 62, 'Randell': 68, 'De Keersmaecker': 67, 'Williams': 65, 'Knight': 70, 'Yah': 63, 'Twine': 70, 'Horvat': 67, 'Hirakawa': 68, 'Wallace': 64, 'Greenwood': 66, 'Bell': 67, 'Tolaj': 67, 'Ballard': 63, 'Adebayo': 67},
 'SWA': {'Fisher': 66, 'Vigouroux': 66, 'Farman': 57, 'Key': 67, 'Lissah': 62, 'Seelt': 66, 'Cabango': 68, 'Burgess': 66, 'Parente': 61, 'Welsh': 65, 'Tymon': 66, 'Fulton': 63, 'Stamenić': 68, 'Eustaquio': 72, 'Widell': 66, 'Just': 67, 'Iorpenda': 62, 'Franco': 68, 'Monga': 64, 'Ronald': 69, 'Eom': 68, 'Opoku': 63, 'Yeo': 63, 'Vipotnik': 68, 'Stewart': 64, 'Idah': 69},
 'STK': {'Johansson': 69, 'Griffiths': 64, 'Fielding': 56, 'Tchamadeu': 68, 'Galbraith': 68, 'Graham': 64, 'Wilmot': 69, 'Lawal': 67, 'Gibson': 63, 'Talovierov': 64, 'Ben Johnson': 66, 'Cresswell': 63, 'Bocat': 65, 'Bombino': 63, 'Devenny': 66, 'Pearson': 66, 'Ingelsson': 65, 'Rigo': 67, 'McGlynn': 68, 'Soumaré': 67, 'Bae Jun-ho': 69, 'Manhoef': 69, 'Boženík': 67, 'Cissé': 66, 'Hirst': 67, 'Gallagher': 64},
 'DER': {'Zetterström': 68, "O'Donnell": 56, 'Vickers': 62, 'Johnston': 66, 'Ward': 64, 'Nyambe': 66, 'Clarke': 67, 'Langås': 67, 'Sanderson': 68, 'Cashin': 68, 'Murkin': 64, 'Forsyth': 60, 'Taylor': 62, 'Hedges': 63, 'Ozoh': 66, 'Mowatt': 63, 'Travis': 67, 'Fraulo': 64, 'Clark': 66, 'Szmodics': 66, 'Bilbija': 66, 'Fuseini': 66, 'Brewster': 65, 'Blackett-Taylor': 63, 'Agyemang': 69, 'Morris': 68, 'Salvesen': 66, 'Meister': 66},
 'QPR': {'Charles': 66, 'Ward': 62, 'Adamson': 63, 'Mbengue': 64, 'Dunne': 67, 'Morrison': 65, 'Edwards': 67, 'Clarke-Salter': 67, 'Kemper': 65, 'Cirkin': 65, 'Lamptey': 67, 'Kamara': 68, 'Alemayehu': 62, 'Madsen': 67, 'Varane': 66, 'Vale': 65, 'Smyth': 66, 'Saito': 67, 'Dembélé': 66, 'Poku': 66, 'Chair': 69, 'Lloyd': 62, 'Burrell': 65, 'Kone': 67, 'Obikwu': 62, 'Kolli': 63},
 'PNE': {'Iversen': 69, 'Nicholls': 60, 'Lindsay': 66, 'Storey': 66, 'Hughes': 64, 'Gibson': 66, 'Offiah': 65, 'Vukčević': 64, 'Clarke': 67, 'Potts': 63, 'Small': 67, 'Leroy': 67, 'Devine': 68, 'McCann': 68, 'Thompson': 66, 'Moran': 64, 'Valentín': 66, 'Wiley': 68, 'Carroll': 59, 'Mills': 66, 'Gibbs': 62, 'Burgzorg': 66, 'Erabi': 65, 'Lang': 67, 'Kenny': 67},
 'BLB': {'Pears': 66, 'Tóth': 66, 'Atcheson': 61, 'McLoughlin': 66, 'Wharton': 65, 'Carter': 66, 'Miller': 67, 'Alebiosu': 66, 'Fevrier': 63, 'Pickering': 65, 'Ribeiro': 66, 'De Neve': 64, 'Morsy': 67, 'Baradji': 66, 'Forshaw': 62, 'Montgomery': 62, 'Beyuku': 61, 'Kargbo': 64, 'Cantwell': 69, 'Morishita': 68, 'Afolayan': 65, 'Guðjohnsen': 67, 'Ohashi': 67, 'Jørgensen': 64},
 'BIR': {'Beadle': 69, 'Allsop': 63, 'Mayo': 58, 'Osayi-Samuel': 69, 'Iwata': 69, 'Klarer': 70, 'Neumann': 67, 'Fry': 66, 'Laird': 67, 'Buchanan': 66, 'Cochrane': 66, 'Lund': 67, 'Paik': 69, 'Leonard': 67, 'Solís': 66, 'Bird': 67, 'Gardner-Hickman': 67, 'Stansfield': 71, 'Vicente': 68, 'Roberts': 67, 'Gray': 68, 'Wright': 66, 'Millar': 67, 'Priske': 67, 'Vázquez': 66, 'Ducksch': 67},
 'WRE': {'Ward': 66, 'Patterson': 69, 'Burton': 60, 'Imray': 65, 'Doyle': 70, 'Cleworth': 67, 'Hyam': 67, 'Worrall': 68, 'Vyner': 66, 'Ekomié': 65, 'Kaboré': 68, 'James': 61, 'Longman': 66, 'Cacace': 69, 'Thomason': 67, 'Revan': 62, 'Whiteman': 67, 'Sheaf': 68, 'Matty James': 62, 'Dobson': 67, 'Windass': 68, "O'Hare": 68, 'Rathbone': 67, "O'Brien": 67, 'Broadhead': 69, 'Cadamarteri': 64, 'Moore': 66, 'Smith': 66},
 'CHA': {'Okonkwo': 66, 'Brooks': 60, 'Mannion': 59, 'McNamara': 65, 'Ramsay': 63, 'Lloyd Jones': 66, 'Koumetio': 64, 'Bell': 64, 'Sichenje': 63, 'Burke': 64, 'Bindon': 66, 'Edwards': 64, 'Mesík': 64, 'Coventry': 67, 'Chalobah': 66, 'Noor Ouma': 63, 'Skipp': 69, 'Docherty': 67, 'Knibbs': 66, 'Carey': 66, 'Rankin-Costello': 64, 'Apter': 63, 'Campbell': 67, 'Grant': 66, 'Alli': 63, 'Nkeng': 60, 'Leaburn': 67, 'Kelman': 64, 'Godden': 63, 'Mbick': 59},
 'POR': {'Schmid': 67, 'Killip': 60, 'Bielica': 62, 'Devlin': 66, 'Arthur': 62, 'Ogilvie': 65, 'Poole': 66, 'Shaughnessy': 66, 'Dia': 65, 'Meghoma': 63, 'Swanson': 64, 'Pack': 63, 'Kosznovszky': 66, 'Bailey': 64, 'Adams': 64, 'Shein': 65, 'Mohamed': 64, 'Swift': 66, 'Segečić': 67, 'Kamara': 67, 'Umeh-Chibueze': 61, 'Anderson': 62, 'Murphy': 65, 'Blair': 63, 'Bishop': 67, 'Shade': 64, 'Waddingham': 64, 'Marezi': 62},
 'BOL': {'Bonham': 61, 'Broome': 60, 'Bazunu': 67, 'Brunt': 63, 'Forino-Joseph': 63, 'Davies': 64, 'Toal': 66, 'Famewo': 63, 'Conway': 62, 'Simons': 65, 'Sheehan': 65, 'Ito': 65, 'Erhahon': 64, 'Watson': 63, 'Larrazabal': 64, 'Stephenson': 63, 'Rodrigues': 64, 'McAtee': 66, 'Iling-Junior': 66, 'Nelson': 64, 'Dong': 64, 'Gale': 63, 'Bair': 64, 'Dalby': 63, 'Hardie': 62},
 'CAR': {'Trott': 65, 'Tyrer': 59, 'Turner': 60, 'Ng': 65, 'Kpakio': 62, 'Fish': 64, 'Osho': 64, 'Bielik': 67, 'Chambers': 66, 'Lawlor': 61, 'Bagan': 64, 'Scanlon': 62, 'Turnbull': 68, 'Robertson': 65, 'Moylan': 64, 'Rubin Colwill': 66, 'Joel Colwill': 64, 'Tanner': 65, 'Ashford': 65, 'Willock': 64, 'Davies': 64, 'Salech': 65, 'Robinson': 63},
 'LIN': {'Wickens': 64, 'Pardington': 58, 'Gauci': 60, 'Darikwa': 60, 'Coubiș': 62, 'Towler': 62, 'Bradley': 60, 'Hamer': 62, 'Elerewe': 60, 'Reach': 61, 'Elder': 61, 'Honohan': 61, 'Bayliss': 63, 'McGrandles': 62, 'Varfolomeev': 63, 'Konak': 60, 'Oyegoke': 62, 'Ogbene': 66, 'Hackett': 61, 'Jefferies': 61, 'House': 63, 'Melia': 64, 'Ladefoged': 64, 'Street': 63, 'Olaofe': 62, 'Wheatley': 62, 'Draper': 61},
}
POS_FIX = {('SOU', 'Mads Roerslev'): 'RB', ('PNE', 'Caleb Wiley'): 'LB', ('PNE', 'Harry Clarke'): 'RB', ('PNE', 'Brad Potts'): 'RB', ('WRE', 'Issa Kaboré'): 'RB', ('WRE', 'Liberato Cacace'): 'LB', ('WRE', 'George Thomason'): 'CM', ('BLB', 'Ryan Alebiosu'): 'RB', ('BLB', 'Yuri Ribeiro'): 'LB', ('BLB', 'Harry Pickering'): 'LB', ('MID', 'Max Arfsten'): 'LB', ('WBA', 'Nolan Galves'): 'RB', ('STK', 'Justin Devenny'): 'CM', ('DER', 'Ryan Hedges'): 'LW', ('BIR', 'Taylor Gardner-Hickman'): 'DM', ('MIL', 'Mathis Servais'): 'DM', ('BOL', 'Toby Ritchie'): 'CM', ('WOL', 'Jackson Tchatchoua'): 'RB'}
NAT = {'England': 'ENG', 'Scotland': 'SCO', 'Wales': 'WAL', 'Northern Ireland': 'NIR', 'Ireland': 'IRL', 'France': 'FRA', 'Spain': 'ESP', 'Portugal': 'POR', 'Germany': 'GER', 'Netherlands': 'NED', 'Belgium': 'BEL', 'Denmark': 'DEN', 'Sweden': 'SWE', 'Norway': 'NOR', 'Iceland': 'ISL', 'Finland': 'FIN', 'Brazil': 'BRA', 'Argentina': 'ARG', 'Mexico': 'MEX', 'Greece': 'GRE', 'Czech Republic': 'CZE', 'Slovakia': 'SVK', 'Slovenia': 'SVN', 'Croatia': 'CRO', 'Serbia': 'SRB', 'Bosnia-Herzegovina': 'BIH', 'Montenegro': 'MNE', 'Albania': 'ALB', 'Hungary': 'HUN', 'Poland': 'POL', 'Romania': 'ROU', 'Ukraine': 'UKR', 'Austria': 'AUT', 'Switzerland': 'SUI', 'Italy': 'ITA', 'Turkey': 'TUR', 'Türkiye': 'TUR', 'Israel': 'ISR', 'Latvia': 'LVA', 'Estonia': 'EST', 'Cyprus': 'CYP', 'Kazakhstan': 'KAZ', 'United States': 'USA', 'Canada': 'CAN', 'Jamaica': 'JAM', 'Trinidad and Tobago': 'TRI', 'Barbados': 'BRB', 'Saint Lucia': 'LCA', 'St Kitts and Nevis': 'SKN', 'Curacao': 'CUW', 'Haiti': 'HAI', 'Martinique': 'MTQ', 'Guadeloupe': 'GLP', 'Suriname': 'SUR', 'Venezuela': 'VEN', 'Colombia': 'COL', 'Ecuador': 'ECU', 'Peru': 'PER', 'Chile': 'CHI', 'Panama': 'PAN', 'Ivory Coast': 'CIV', 'Senegal': 'SEN', 'Mali': 'MLI', 'Burkina Faso': 'BFA', 'Ghana': 'GHA', 'Nigeria': 'NGA', 'Cameroon': 'CMR', 'Gabon': 'GAB', 'Congo': 'CGO', 'DR Congo': 'COD', 'Kenya': 'KEN', 'Zimbabwe': 'ZIM', 'Namibia': 'NAM', 'Sierra Leone': 'SLE', 'Gambia': 'GAM', 'Benin': 'BEN', 'Comoros': 'COM', 'Tunisia': 'TUN', 'Algeria': 'ALG', 'Morocco': 'MAR', 'Egypt': 'EGY', 'Japan': 'JPN', 'South Korea': 'KOR', 'Australia': 'AUS', 'New Zealand': 'NZL', 'Indonesia': 'IDN', 'Bangladesh': 'BAN', 'Jordan': 'JOR', 'Afghanistan': 'AFG', 'Unknown': 'ENG'}

def pos_code(code, name, s):
    if (code, name) in POS_FIX: return POS_FIX[(code, name)]
    first = s.split(',')[0].strip()
    m = {'GK': 'GK', 'RB': 'RB', 'RWB': 'RB', 'LB': 'LB', 'LWB': 'LB', 'CB': 'CB', 'DM': 'DM', 'CM': 'CM', 'AM': 'AM', 'RM': 'RW', 'RW': 'RW', 'LM': 'LW', 'LW': 'LW', 'ST': 'ST', 'Defender': 'CB', 'Midfielder': 'CM', 'Attacker': 'ST'}
    return m[first]

def h(s):
    return int(hashlib.md5(s.encode()).hexdigest()[:6], 16)

def rating(code, name, age, pos, no, level, gkrank):
    tab = R.get(code, {})
    parts = name.split(' ')
    for key in (name, ' '.join(parts[1:]), parts[-1], parts[0]):
        if key in tab: return tab[key]
    v = level
    v += {True: 0}.get(False, 0)
    if age <= 19: v -= 7
    elif age <= 20: v -= 5
    elif age <= 21: v -= 3
    elif age <= 22: v -= 1
    elif age >= 35: v -= 4
    elif age >= 33: v -= 2
    if pos == 'GK' and gkrank > 0: v -= 5
    if no and no >= 30: v -= 2
    v += (h(code + name) % 5) - 2
    return max(52, min(80, v))

def main(raw_dir):
    clubs = []; cur = None
    for f in sorted(pathlib.Path(raw_dir).glob('raw*.txt')):
        for line in f.read_text().splitlines():
            line = line.strip()
            if not line: continue
            if line.startswith('##'):
                code, coach = line[2:].strip().split('|')
                cur = {'code': code, 'coach': COACH_FIX.get(code, coach), 'rows': []}; clubs.append(cur); continue
            no, name, pos, age, nat = line.split('|')
            cur['rows'].append((int(no) if no.strip() else 0, name.strip(), pos.strip(), int(age), nat.strip()))
    out = []
    missing_nat = set(); unused = {}
    for c in clubs:
        code = c['code']; name, short, c1, c2, stadium, cap, capt, rep, bal, level, form = CLUBS[code]
        used_no = set(); lines = []; gk = 0
        tab = R.get(code, {}); hit = set()
        for no, n, ps, age, nat in c['rows']:
            p = pos_code(code, n, ps)
            if no in used_no or no == 0:
                no = 40
                while no in used_no: no += 1
            used_no.add(no)
            if nat not in NAT: missing_nat.add(nat)
            parts = n.split(' ')
            for key in (n, ' '.join(parts[1:]), parts[-1], parts[0]):
                if key in tab: hit.add(key); break
            r = rating(code, n, age, p, no, level, gk if p == 'GK' else 0)
            if p == 'GK': gk += 1
            lines.append(f'{no}|{n}|{p}|{age}|{NAT.get(nat, "ENG")}|{r}')
        unused[code] = sorted(set(tab) - hit)
        obj = {'id': code, 'name': name, 'short': short, 'c1': c1, 'c2': c2, 'stadium': stadium, 'cap': cap, 'mgr': c['coach'], 'capt': capt, 'rep': rep, 'bal': bal, 'form': form}
        if code in DEDUCT: obj['ded'] = DEDUCT[code]
        js = json.dumps(obj, ensure_ascii=False)[:-1] + ',sq:`\n' + '\n'.join(lines) + '\n`}'
        out.append(js)
    src = ('// ===== DATA: EFL Championship 2026/27 (squads from FotMob team pages, 24-28 Oct 2026; ratings are game estimates) =====\n'
           '// Southampton started 2026/27 with a 4-point deduction. Burnley sacked Nicky Hayen on 24 Oct 2026 (caretaker in charge).\n'
           'const CH_CLUBS = [\n' + ',\n'.join(out) + '\n];\n'
           "// legacy lite-team ids used by saves made before the Championship had real squads\n"
           "const CH_LEGACY = {C_WestHam:'WHU',C_Wolves:'WOL',C_Burnley:'BUR',C_Southampton:'SOU',C_Middlesbrough:'MID',C_SheffieldUnited:'SHU',C_NorwichCity:'NOR',C_WestBrom:'WBA',C_Watford:'WAT',C_Millwall:'MIL',C_BristolCity:'BRC',C_SwanseaCity:'SWA',C_StokeCity:'STK',C_DerbyCounty:'DER',C_QPR:'QPR',C_Preston:'PNE',C_Blackburn:'BLB',C_BirminghamCity:'BIR',C_Wrexham:'WRE',C_Charlton:'CHA',C_Portsmouth:'POR',L_Bolton:'BOL',L_CardiffCity:'CAR',L_LincolnCity:'LIN'};\n")
    pathlib.Path('src/data_ch.js').write_text(src)
    print('clubs', len(clubs), 'players', sum(len(c['rows']) for c in clubs))
    print('missing nat', missing_nat)
    for k, v in unused.items():
        if v: print('unused overrides', k, v)

if __name__ == '__main__':
    main(sys.argv[1])
