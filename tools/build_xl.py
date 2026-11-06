"""Build src/data_xl.js: Bundesliga, Ligue 1 and Saudi Pro League 2026/27 (top flights only).

Raw input: tools/xl_raw/<LG>_<ID>.txt. First line: head coach. Then "name|pos|country|shirt|age" rows taken from the
clubs' FotMob squad pages (fetched 6 Nov 2026). Club list: Bundesliga.com (2026/27 head coaches), Wikipedia
"2026-27 Ligue 1" (stadiums, capacities, captains), Arab News (2026/27 Saudi Pro League preview).
Stadium names and capacities for the Bundesliga and Saudi clubs, colours, reputations, budgets and every player
rating are game estimates: a club level, an age curve and a list of hand-set ratings for well-known players.
Usage: python3 tools/build_xl.py
"""
import pathlib, json, re, hashlib
ROOT = pathlib.Path(__file__).resolve().parent.parent

# id: (name, short, c1, c2, stadium, capacity, rep, budget £m, formation, base rating, captain)
CLUBS = {
 'BL': {
  'BAY': ('Bayern Munich', 'Bayern', '#dc052d', '#ffffff', 'Allianz Arena', 75024, 92, 160, '4-2-3-1', 82, 'Manuel Neuer'),
  'BVB': ('Borussia Dortmund', 'Dortmund', '#fde100', '#000000', 'Signal Iduna Park', 81365, 86, 90, '4-2-3-1', 78, 'Emre Can'),
  'B04': ('Bayer Leverkusen', 'Leverkusen', '#e32221', '#000000', 'BayArena', 30210, 85, 80, '3-4-2-1', 77, 'Robert Andrich'),
  'RBL': ('RB Leipzig', 'Leipzig', '#dd0741', '#ffffff', 'Red Bull Arena', 47069, 84, 85, '4-2-3-1', 77, 'David Raum'),
  'VFB': ('VfB Stuttgart', 'Stuttgart', '#e32219', '#ffffff', 'MHPArena', 60449, 82, 60, '4-2-3-1', 76, 'Atakan Karazor'),
  'SGE': ('Eintracht Frankfurt', 'Frankfurt', '#e1000f', '#000000', 'Deutsche Bank Park', 58000, 81, 60, '4-2-3-1', 75, 'Robin Koch'),
  'TSG': ('Hoffenheim', 'Hoffenheim', '#1961b5', '#ffffff', 'PreZero Arena', 30150, 77, 45, '3-4-2-1', 73, 'Oliver Baumann'),
  'SCF': ('SC Freiburg', 'Freiburg', '#e2001a', '#000000', 'Europa-Park Stadion', 34700, 78, 40, '4-2-3-1', 73, 'Christian Günter'),
  'M05': ('Mainz 05', 'Mainz', '#c3141e', '#ffffff', 'Mewa Arena', 33305, 75, 30, '3-4-2-1', 72, 'Silvan Widmer'),
  'BMG': ("Borussia Mönchengladbach", "M'gladbach", '#000000', '#ffffff', 'Borussia-Park', 54042, 76, 35, '4-2-3-1', 72, 'Tim Kleindienst'),
  'FCU': ('Union Berlin', 'Union Berlin', '#eb1923', '#ffffff', 'Stadion An der Alten Försterei', 22012, 74, 30, '3-5-2', 71, 'Christopher Trimmel'),
  'FCA': ('FC Augsburg', 'Augsburg', '#ba3733', '#46714d', 'WWK Arena', 30660, 72, 25, '3-4-2-1', 70, 'Jeffrey Gouweleeuw'),
  'SVW': ('Werder Bremen', 'Werder', '#1d9053', '#ffffff', 'Weserstadion', 42100, 75, 30, '3-5-2', 71, 'Marco Friedl'),
  'KOE': ('1. FC Köln', 'Köln', '#ed1c24', '#ffffff', 'RheinEnergieStadion', 50000, 73, 25, '4-2-3-1', 70, 'Timo Hübers'),
  'HSV': ('Hamburger SV', 'Hamburg', '#0a3f86', '#ffffff', 'Volksparkstadion', 57000, 74, 30, '3-4-2-1', 70, 'Yussuf Poulsen'),
  'S04': ('Schalke 04', 'Schalke', '#004d9d', '#ffffff', 'Veltins-Arena', 62271, 74, 20, '4-2-3-1', 69, 'Kenan Karaman'),
  'SVE': ('SV Elversberg', 'Elversberg', '#000000', '#ffffff', 'Ursapharm-Arena an der Kaiserlinde', 10000, 64, 12, '4-2-3-1', 69, 'Maximilian Rohr'),
  'SCP': ('SC Paderborn', 'Paderborn', '#0058a6', '#000000', 'Home Deluxe Arena', 15000, 64, 12, '4-2-3-1', 69, 'Marcel Hoffmeier'),
 },
 'L1': {
  'PSG': ('Paris Saint-Germain', 'PSG', '#004170', '#da291c', 'Parc des Princes', 47926, 95, 180, '4-3-3', 84, 'Marquinhos'),
  'OM': ('Marseille', 'Marseille', '#2faee0', '#ffffff', 'Stade Vélodrome', 67394, 84, 60, '4-2-3-1', 76, 'Timothy Weah'),
  'ASM': ('Monaco', 'Monaco', '#e51b22', '#ffffff', 'Stade Louis II', 18523, 82, 60, '4-2-3-1', 76, 'Denis Zakaria'),
  'OL': ('Lyon', 'Lyon', '#ffffff', '#1d3c8f', 'Groupama Stadium', 59186, 82, 45, '4-2-3-1', 75, 'Corentin Tolisso'),
  'LOSC': ('Lille', 'Lille', '#e01e13', '#1a2c5b', 'Stade Pierre-Mauroy', 50186, 81, 45, '4-2-3-1', 75, 'Benjamin André'),
  'RCL': ('Lens', 'Lens', '#fdea01', '#e5200f', 'Stade Bollaert-Delelis', 37705, 79, 35, '3-4-2-1', 74, 'Florian Thauvin'),
  'OGCN': ('Nice', 'Nice', '#e30613', '#000000', 'Allianz Riviera', 35624, 78, 35, '3-4-2-1', 73, 'Jonathan Clauss'),
  'SRFC': ('Rennes', 'Rennes', '#e13327', '#000000', 'Roazhon Park', 29778, 78, 40, '4-2-3-1', 73, 'Valentin Rongier'),
  'RCSA': ('Strasbourg', 'Strasbourg', '#0a4ea2', '#ffffff', 'Stade de la Meinau', 29230, 77, 45, '4-2-3-1', 73, 'Dário Essugo'),
  'TFC': ('Toulouse', 'Toulouse', '#5a2d82', '#ffffff', 'Stadium de Toulouse', 33150, 72, 20, '3-4-2-1', 70, 'Rasmus Nicolaisen'),
  'SB29': ('Brest', 'Brest', '#e2001a', '#ffffff', 'Stade Francis-Le Blé', 15931, 72, 20, '4-3-3', 69, 'Brendan Chardonnet'),
  'AJA': ('Auxerre', 'Auxerre', '#ffffff', '#00428c', 'Stade Abbé Deschamps', 21379, 69, 15, '3-4-2-1', 68, 'Elisha Owusu'),
  'SCO': ('Angers', 'Angers', '#000000', '#ffffff', 'Stade Raymond Kopa', 18752, 68, 12, '3-4-2-1', 67, 'Haris Belkebla'),
  'HAC': ('Le Havre', 'Le Havre', '#0f2d5b', '#87cefa', 'Stade Océane', 25178, 68, 12, '3-4-2-1', 67, 'Rassoul Ndiaye'),
  'FCL': ('Lorient', 'Lorient', '#f58220', '#000000', 'Stade du Moustoir', 18890, 68, 12, '3-4-2-1', 67, 'Montassar Talbi'),
  'PFC': ('Paris FC', 'Paris FC', '#1a2a57', '#d6b46a', 'Stade Jean-Bouin', 20000, 72, 40, '4-3-3', 69, 'Pierre Lees-Melou'),
  'LMFC': ('Le Mans', 'Le Mans', '#c8102e', '#ffd700', 'Stade Marie-Marvingt', 25000, 64, 10, '4-3-3', 68, 'Edwin Quarshie'),
  'ESTAC': ('Troyes', 'Troyes', '#1f5aa6', '#ffffff', "Stade de l'Aube", 20400, 64, 10, '4-3-3', 68, 'Adrien Monfray'),
 },
 'SPL': {
  'HIL': ('Al-Hilal', 'Al-Hilal', '#0057b8', '#ffffff', 'Kingdom Arena', 26000, 86, 150, '4-2-3-1', 78, 'Salem Al Dawsari'),
  'NAS': ('Al-Nassr', 'Al-Nassr', '#ffd200', '#0b2a6f', 'Al-Awwal Park', 25000, 85, 150, '4-2-3-1', 77, 'Cristiano Ronaldo'),
  'AHL': ('Al-Ahli', 'Al-Ahli', '#00703c', '#ffffff', 'King Abdullah Sports City', 62345, 84, 130, '4-2-3-1', 77, 'Roger Ibañez'),
  'ITT': ('Al-Ittihad', 'Al-Ittihad', '#ffd200', '#000000', 'King Abdullah Sports City', 62345, 84, 120, '4-3-3', 76, 'Danilo Pereira'),
  'QAD': ('Al-Qadsiah', 'Al-Qadsiah', '#c8102e', '#ffd700', 'Prince Saud bin Jalawi Stadium', 26000, 80, 120, '4-3-3', 75, 'Nacho'),
  'SHB': ('Al-Shabab', 'Al-Shabab', '#ffffff', '#000000', 'Prince Faisal bin Fahd Stadium', 22500, 76, 50, '4-2-3-1', 72, 'Ali Al Bulayhi'),
  'ETT': ('Al-Ettifaq', 'Al-Ettifaq', '#00843d', '#e2001a', 'Prince Mohamed bin Fahd Stadium', 26000, 74, 40, '4-3-3', 70, 'Jack Hendry'),
  'TAA': ('Al-Taawoun', 'Al-Taawoun', '#ffd200', '#003b6f', 'King Abdullah Sport City Stadium', 25000, 73, 35, '4-2-3-1', 70, 'Mohammed Al Kuwaykibi'),
  'NEO': ('NEOM', 'NEOM', '#3b2a72', '#ffffff', 'NEOM Stadium', 15000, 72, 60, '4-3-3', 70, 'Alexandre Lacazette'),
  'KHA': ('Al-Khaleej', 'Al-Khaleej', '#ffd200', '#00843d', 'Prince Mohamed bin Fahd Stadium', 26000, 71, 25, '4-2-3-1', 70, 'Majed Kanabah'),
  'FAT': ('Al-Fateh', 'Al-Fateh', '#0060a8', '#ffffff', 'Al-Fateh Club Stadium', 20000, 71, 25, '4-2-3-1', 70, 'Mourad Batna'),
  'FAY': ('Al-Fayha', 'Al-Fayha', '#f58220', '#003b6f', 'Al Majma\'ah Sports City', 7000, 70, 20, '4-2-3-1', 69, 'Paulo Oliveira'),
  'KHO': ('Al-Kholood', 'Al-Kholood', '#e2001a', '#ffd700', 'Al Hazem Club Stadium', 8000, 69, 20, '4-2-3-1', 69, 'John Buckley'),
  'RIY': ('Al-Riyadh', 'Al-Riyadh', '#e2001a', '#000000', 'Prince Faisal bin Fahd Stadium', 22500, 69, 20, '4-2-3-1', 68, 'Yahia Al Shehri'),
  'HAZ': ('Al-Hazem', 'Al-Hazem', '#e2001a', '#ffffff', 'Al Hazem Club Stadium', 8000, 68, 15, '4-2-3-1', 68, 'Amir Sayoud'),
  'ABH': ('Abha', 'Abha', '#00843d', '#ffffff', 'Prince Sultan bin Abdul Aziz Stadium', 20000, 67, 15, '4-2-3-1', 67, 'Nabil Fekir'),
  'FAI': ('Al-Faisaly', 'Al-Faisaly', '#ffd200', '#000000', "Al Majma'ah Sports City", 7000, 67, 15, '4-2-3-1', 67, 'Mohammed Jahfali'),
  'DIR': ('Al-Diriyah', 'Al-Diriyah', '#8b5a2b', '#ffffff', 'Prince Faisal bin Fahd Stadium', 22500, 70, 60, '4-2-3-1', 69, 'Idrissa Gana Gueye'),
 },
}
# hand-set ratings for well-known players (game estimates)
STARS = {
 'Harry Kane': 90, 'Jamal Musiala': 88, 'Michael Olise': 88, 'Joshua Kimmich': 87, 'Luis Díaz': 86, 'Dayot Upamecano': 84, 'Manuel Neuer': 83,
 'Jonathan Tah': 83, 'Alphonso Davies': 82, 'Min-Jae Kim': 84, 'Konrad Laimer': 80, 'Aleksandar Pavlović': 83, 'Serge Gnabry': 80, 'Lennart Karl': 79,
 'Jonas Urbig': 76, 'Tom Bischof': 78, 'Josip Stanišić': 80, 'Hiroki Ito': 79, 'Sacha Boey': 77, 'Nathaniel Brown': 77, 'Ismael Saibari': 79,
 'Gregor Kobel': 85, 'Nico Schlotterbeck': 84, 'Serhou Guirassy': 84, 'Jobe Bellingham': 82, 'Felix Nmecha': 81, 'Maximilian Beier': 81, 'Julian Ryerson': 80,
 'Waldemar Anton': 80, 'Marcel Sabitzer': 78, 'Ethan Nwaneri': 80, 'Emre Can': 76, 'Daniel Svensson': 79, 'Ramy Bensebaini': 77, 'Carney Chukwuemeka': 77,
 'Fábio Silva': 77, 'Joey Veerman': 78, 'Karim Adeyemi': 82,
 'David Raum': 81, 'Christoph Baumgartner': 82, 'Christopher Nkunku': 82, 'Castello Lukeba': 82, 'Johan Bakayoko': 81, 'Antonio Nusa': 82, 'Willi Orbán': 78,
 'Neil El Aynaoui': 80, 'Nicolas Seiwald': 79, 'Maarten Vandevoordt': 79, 'Brajan Gruda': 79, 'Maxime Estève': 78, 'Assan Ouédraogo': 79, 'Benjamin Henrichs': 77, 'Ridle Baku': 77, 'Rômulo': 76,
 'Angelo Stiller': 83, 'Deniz Undav': 82, 'Ermedin Demirović': 80, 'Maximilian Mittelstädt': 80, 'Jamie Leweling': 80, 'Chris Führich': 79, 'Bilal El Khannouss': 80,
 'Jeff Chabot': 79, 'Finn Jeltsch': 79, 'Atakan Karazor': 77, 'Nikolas Nartey': 77, 'Tiago Tomás': 77, 'Dan-Axel Zagadou': 76, 'Ramon Hendriks': 77, 'Lorenz Assignon': 77, 'Josha Vagnoman': 76, 'Fabian Bredlow': 75,
 'Patrik Schick': 82, 'Edmond Tapsoba': 81, 'Jarell Quansah': 80, 'Malik Tillman': 81, 'Aleix García': 82, 'Robert Andrich': 79, 'Loic Badé': 80, 'Victor Okoh Boniface': 80,
 'Mark Flekken': 80, 'Martin Terrier': 79, 'Guéla Doué': 79, 'Facundo Medina': 79, 'Eliesse Ben Seghir': 79, 'Ibrahim Maza': 79, 'Equi Fernández': 78, 'Christian Kofane': 76,
 'Moussa Diaby': 80, 'Nathan Tella': 78, 'Jonas Hofmann': 75, 'Lucas Vázquez': 75, 'Miguel Gutiérrez': 80,
 'Jonathan Burkardt': 81, 'Robin Koch': 80, 'Ritsu Doan': 80, 'Noah Atubolu': 80, 'Can Uzun': 80, 'Mario Götze': 76, 'Farès Chaïbi': 78, 'Ansgar Knauff': 77,
 'Lilian Brassier': 76, 'Raphael Onyedika': 77, 'Nnamdi Collins': 76, 'Oscar Højlund': 76,
 'Andrej Kramarić': 79, 'Oliver Baumann': 79, 'Adam Hložek': 78, 'Fisnik Asllani': 76, 'Ozan Kabak': 77, 'Leon Avdullahu': 77, 'Vladimír Coufal': 75, 'Wouter Burger': 77,
 'Tim Lemperle': 75, 'Albian Hajdari': 76, 'Patrick Wimmer': 76,
 'Matthias Ginter': 78, 'Maximilian Eggestein': 78, 'Vincenzo Grifo': 77, 'Philipp Lienhart': 77, 'Patrick Osterhage': 76, 'Jan-Niklas Beste': 77, 'Yuito Suzuki': 78, 'Igor Matanović': 76, 'Philipp Treu': 76,
 'Nadiem Amiri': 79, 'Kaishu Sano': 78, 'Paul Nebel': 77, 'Benedict Hollerbach': 76, 'Stefan Posch': 77, 'Robin Zentner': 75, 'Jae-Sung Lee': 75,
 'Ko Itakura': 78, 'Tim Kleindienst': 79, 'Kevin Stöger': 77, 'Florian Neuhaus': 76, 'Robin Hack': 76, 'Franck Honorat': 77, 'Kevin Diks': 76, 'Shuto Machino': 77, 'Moritz Nicolas': 76,
 'Leopold Querfeld': 77, 'Rani Khedira': 76, 'Frederik Rønnow': 77, 'Andrej Ilić': 75,
 'Fabian Rieder': 76, 'Finn Dahmen': 75, 'Mert Kömür': 75, 'Alexis Claude-Maurice': 75, 'Han-Noah Massengo': 74,
 'Niclas Füllkrug': 77, 'Jens Stage': 77, 'Marco Friedl': 76, 'Senne Lynen': 76, 'Mitchell Weiser': 75, 'Justin Njinmah': 75, 'Karl Hein': 75, 'Samuel Mbangula': 75,
 'Saïd El Mala': 79, 'Ellyes Skhiri': 77, 'Marvin Schwäbe': 75, 'Mikey Moore': 74, 'Thijs Dallinga': 74,
 'Fábio Vieira': 77, 'Albert Sambi Lokonga': 75, 'Terem Moffi': 75, 'Albert Grønbæk': 75, 'Patson Daka': 74, 'Yussuf Poulsen': 74,
 'Edin Džeko': 75, 'Robin Gosens': 74, 'Loris Karius': 72,
 'Ousmane Dembélé': 88, 'Vitinha': 89, 'Achraf Hakimi': 87, 'Khvicha Kvaratskhelia': 88, 'Désiré Doué': 86, 'João Neves': 87, 'Marquinhos': 84, 'Nuno Mendes': 87,
 'Willian Pacho': 85, 'Lucas Chevalier': 83, 'Fabián Ruiz': 84, 'Warren Zaïre-Emery': 83, 'Senny Mayulu': 78, 'Ilya Zabarnyi': 82, 'Lucas Hernández': 81, 'Lucas Beraldo': 79,
 'Matvey Safonov': 80, 'Ferran Torres': 81, 'Maghnes Akliouche': 82, 'Mika Godts': 79, 'Lucas Digne': 77, 'Dro Fernández': 76,
 'Pierre-Emile Højbjerg': 80, 'Amine Gouiri': 80, 'Nayef Aguerd': 80, 'Igor Paixão': 80, 'Timothy Weah': 78, 'Angel Gomes': 79, 'Geoffrey Kondogbia': 77, 'Amine Harit': 77,
 'Emerson': 76, 'Neal Maupay': 76, 'Himad Abdelli': 77, 'CJ Egan-Riley': 76, 'Jeffrey De Lange': 76,
 'Denis Zakaria': 81, 'Aleksandr Golovin': 80, 'Takumi Minamino': 79, 'Folarin Balogun': 80, 'Lamine Camara': 80, 'Vanderson': 80, 'Lukáš Hrádecký': 79, 'Eric Dier': 77,
 'Mohammed Salisu': 78, 'Ansu Fati': 77, 'Mika Biereth': 78, 'Jordan Teze': 78, 'Mamadou Coulibaly': 77, 'Matthis Abline': 78,
 'Corentin Tolisso': 79, 'Nicolás Tagliafico': 77, 'Moussa Niakhaté': 78, 'Loïs Openda': 81, 'Tyler Morton': 77, 'Tanner Tessmann': 77, 'Pavel Šulc': 78, 'Ernest Nuamah': 77,
 'Abner': 76, 'Dominik Greif': 77, 'Keito Nakamura': 77, 'Ruben Kluivert': 76,
 'Benjamin André': 76, 'Hákon Arnar Haraldsson': 79, 'Olivier Giroud': 75, 'Nabil Bentaleb': 76, 'Berke Özer': 79, 'Romain Perraud': 77, 'Dilane Bakwa': 78, 'Ayase Ueda': 77,
 'Osame Sahraoui': 77, 'Ngal\'ayel Mukau': 77, 'Tiago Santos': 77, 'Alexsandro Ribeiro': 77, 'Nathan Ngoy': 77, 'Hamza Igamane': 76,
 'Florian Thauvin': 79, 'Robin Risser': 76, 'Jean-Clair Todibo': 79, 'Odsonne Édouard': 77, 'Amadou Haidara': 77, 'Abdallah Sima': 76, 'Samson Baidoo': 76, 'Saud Abdulhamid': 74,
 'Jonathan Clauss': 77, 'Yéhvann Diouf': 77, 'Elye Wahi': 76, 'Mohamed Amoura': 78, 'Hicham Boudaoui': 77, 'Moïse Bombito': 77, 'Mohamed Abdelmonem': 76, 'Sofiane Diop': 77,
 'Brice Samba': 79, 'Estéban Lepaul': 78, 'Ludovic Blas': 78, 'Sebastian Szymański': 78, 'Valentin Rongier': 77, 'Quentin Merlin': 76, 'Musa Al-Taamari': 77,
 'Joaquín Panichelli': 78, 'Giovanni Reyna': 75, 'Sebastian Nanasi': 77, 'Ismaël Doukouré': 77, 'Maxi Oyedele': 77, 'Dário Essugo': 77, 'Filip Jörgensen': 76,
 'Guillaume Restes': 77, 'Cristian Cásseres': 76, 'Kevin Trapp': 76, 'Diego Coppola': 75, 'Jonathan Ikoné': 75, 'Maxime Lopez': 75, 'Ilan Kebbal': 76, 'Moses Simon': 75,
 'Ludovic Ajorque': 74, 'Michy Batshuayi': 74, 'Nabil Fekir': 75, 'Lucas Tousart': 74,
 'Yassine Bounou': 83, 'Kalidou Koulibaly': 80, 'Théo Hernández': 83, 'Rúben Neves': 83, 'Sergej Milinković-Savić': 83, 'Gabriel Martinelli': 82, 'Crysencio Summerville': 79,
 'Ollie Watkins': 82, 'Salem Al Dawsari': 77, 'Mohamed Kanno': 74, 'Hassan Al Tambakti': 75, 'Yusuf Akçiçek': 75, 'Saïmon Bouabré': 75, 'Nasser Al Dawsari': 73,
 'Cristiano Ronaldo': 82, 'Sadio Mané': 79, 'Kingsley Coman': 80, 'João Félix': 80, 'Mohamed Simakan': 80, 'Iñigo Martínez': 78, 'Bento': 79, 'Samú Costa': 78, 'Ângelo': 76,
 'Sultan Al Ghannam': 72, 'Abdulelah Al Amri': 72, 'Nawaf Al Aqidi': 72,
 'Ivan Toney': 81, 'Édouard Mendy': 78, 'Merih Demiral': 80, 'Roger Ibañez': 79, 'Galeno': 79, 'Trincão': 80, 'Eduard Spertsyan': 78, 'Artem Bondarenko': 77,
 'Valentin Atangana': 74, 'Matheus Gonçalves': 75, 'Feras Al Brikan': 73, 'Ali Majrashi': 70,
 'Predrag Rajković': 78, 'Youssef En-Nesyri': 79, 'Steven Bergwijn': 77, 'Houssem Aouar': 78, 'Richard Ríos': 80, 'Danilo Pereira': 75, 'Jan-Carlo Šimić': 76,
 'Georginio Wijnaldum': 74, 'Roger Fernandes': 76, 'Mahamadou Doumbia': 76, 'Dion Lopy': 77, 'Marwan Al Sahafi': 72,
 'Tijjani Reijnders': 84, 'Mateo Retegui': 81, 'Julián Quiñones': 79, 'Koen Casteels': 79, 'Nacho': 76, 'Gastón Álvarez': 76, 'Julian Weigl': 76, 'Nahitan Nández': 76,
 'Christopher Bonsu Baah': 76, 'Musab Al Juwayr': 73,
 'Thomas Partey': 78, 'Yannick Carrasco': 77, 'Daniel Podence': 76, 'Yacine Adli': 76, 'Josh Brownhill': 75, 'Tin Jedvaj': 72, 'Roger Martínez': 74, 'Mory Diaw': 73,
 'Moussa Dembélé': 76, 'Ondrej Duda': 75, 'Álvaro Medrán': 73, 'Jordan Larsson': 74, 'Bersant Celina': 72, 'Jack Hendry': 72, 'Marek Rodák': 74,
 'Abderrazak Hamdallah': 73, 'Nedim Bajrami': 73, 'Mailson': 74, 'Parfait Guiagon': 73, 'Aschraf El Mahdioui': 72,
 'Alexandre Lacazette': 77, 'Saïd Benrahma': 76, 'Marcin Bułka': 78, 'Malang Sarr': 74, 'Valentín Vada': 73, 'Giorgos Masouras': 72, 'Nathan Zézé': 75, 'Luís Maximiano': 74,
 'Joshua King': 71, 'Angelo Fulgini': 74, 'Omar Mascarell': 72, 'Miguel Crespo': 72, 'Pedro Rebocho': 72, 'Anthony Moris': 72, 'Kiki Kouyaté': 72, 'Musa Barrow': 73,
 'Mourad Batna': 72, 'Lukáš Haraslín': 73, 'Adrian Šemper': 73, 'Wilfried Kanga': 72, 'Zaydou Youssouf': 74,
 'Darwin Núñez': 81, 'Enzo Millot': 79, 'Idrissa Gana Gueye': 74, 'Chancel Mbemba': 75, 'Berat Djimsiti': 75, 'Óscar Rodríguez': 74, 'Adil Boulbina': 74,
 'Théo Bongonda': 74, 'Fernando Pacheco': 72, 'Trézéguet': 72, 'Milan Borjan': 70, 'Jindřich Staněk': 73, 'Omar Colley': 70, 'Fashion Sakala': 72,
 'Iker Kortajarena': 72, 'John Buckley': 70, 'Ramiro Enrique': 72, 'Orlando Mosquera': 72,
}
NAT_FIX = {'Türkiye': 'Turkey', 'Bosnia-Herzegovina': 'Bosnia and Herzegovina', 'Czech Republic': 'Czechia', 'Central African Rep.': 'Central African Republic',
           'DR Congo': 'DR Congo', 'Ivory Coast': "Côte d'Ivoire", 'United States': 'USA', 'South Korea': 'Korea Republic', 'Guadeloupe': 'France', 'French Guiana': 'France'}
# already at clubs in the game's other leagues (kept there)
SKIP = {'Mikey Moore', 'Samuel Mbangula'}
POS_FIX = {'LM': 'LW', 'RM': 'RW', 'LWB': 'LB', 'RWB': 'RB', 'Defender': 'CB', 'Midfielder': 'CM', 'Attacker': 'ST', 'Unspecified': 'CM'}

# nationality name -> code from the game's nation table
src = (ROOT / 'src/data_intl.js').read_text()
raw = src.split('const NATS_RAW = `', 1)[1].split('`', 1)[0]
N2C = {}
for line in raw.strip().splitlines():
    c, name = line.split('|')[:2]; N2C[name.lower()] = c
ALIAS = {'turkey': 'TUR', 'türkiye': 'TUR', 'usa': 'USA', 'united states': 'USA', 'korea republic': 'KOR', 'south korea': 'KOR', "côte d'ivoire": 'CIV', 'ivory coast': 'CIV',
         'czechia': 'CZE', 'czech republic': 'CZE', 'bosnia and herzegovina': 'BIH', 'dr congo': 'COD', 'congo': 'CGO', 'scotland': 'SCO', 'england': 'ENG', 'wales': 'WAL',
         'saudi arabia': 'KSA', 'cape verde': 'CPV', 'equatorial guinea': 'EQG', 'guinea-bissau': 'GNB', 'kosovo': 'KOS', 'north macedonia': 'MKD', 'new caledonia': 'FRA', 'burundi': 'BDI', 'central african republic': 'CTA', 'liberia': 'LBR', 'rwanda': 'RWA', 'togo': 'TOG'}
miss = set()
def nat(n):
    n0 = NAT_FIX.get(n, n); k = n0.lower()
    if k in ALIAS: return ALIAS[k]
    if k in N2C: return N2C[k]
    miss.add(n); return 'ENG' if False else (n[:3].upper())

def h(s): return int(hashlib.md5(s.encode()).hexdigest(), 16)
def rating(name, pos, age, no, base, natc, lg):
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
    if lg == 'SPL' and natc == 'KSA': r -= 4
    r += h(name) % 7 - 3
    return max(50, min(r, base + 4))

out_clubs = []
dups = []
for lg, clubs in CLUBS.items():
    for cid, (name, short, c1, c2, stad, cap, rep, bal, form, base, capt) in clubs.items():
        f = ROOT / f'tools/xl_raw/{lg}_{cid}.txt'
        lines = [l.strip() for l in f.read_text().splitlines() if l.strip()]
        coach = lines[0]; rows = []; used = set()
        for l in lines[1:]:
            n, pos, ctry, no, age = (l.split('|') + ['', '', '', '', ''])[:5]
            if n in SKIP: continue
            pos = POS_FIX.get(pos.split(',')[0].strip(), pos.split(',')[0].strip())
            if pos not in ('GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'): pos = 'CM'
            age = int(age) if age.strip().isdigit() else 20
            no = int(no) if no.strip().isdigit() else 0
            nc = nat(ctry)
            r = rating(n, pos, age, no, base, nc, lg)
            if not no or no in used:
                k = 2
                while k in used: k += 1
                no = k
            used.add(no)
            rows.append([no, n, pos, age, nc, r])
        out_clubs.append({'lg': lg, 'id': cid, 'name': name, 'short': short, 'c1': c1, 'c2': c2, 'stadium': stad, 'cap': cap, 'mgr': coach, 'capt': capt,
                          'rep': rep, 'bal': bal, 'form': form, 'rows': rows})

out = ['// ===== DATA: Bundesliga, Ligue 1 and Saudi Pro League 2026/27 (top flights only). Squads and head coaches: FotMob team pages (6 Nov 2026).',
       '// Club list: Bundesliga.com, Wikipedia "2026-27 Ligue 1", Arab News 2026/27 SPL preview. Ratings, stadium details for German and Saudi clubs,',
       '// colours, reputations and budgets (£m) are game estimates.', 'const XL_CLUBS = [']
for c in out_clubs:
    head = {k: c[k] for k in ['lg', 'id', 'name', 'short', 'c1', 'c2', 'stadium', 'cap', 'mgr', 'capt', 'rep', 'bal', 'form']}
    out.append(json.dumps(head, ensure_ascii=False)[:-1] + ',sq:`\n' + '\n'.join('|'.join(str(x) for x in r) for r in c['rows']) + '\n`},')
out.append('];')
(ROOT / 'src/data_xl.js').write_text('\n'.join(out) + '\n')
print('clubs', len(out_clubs), 'players', sum(len(c['rows']) for c in out_clubs), '| unknown nationalities:', sorted(miss))
