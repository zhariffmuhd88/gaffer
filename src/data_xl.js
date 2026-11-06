// ===== DATA: Bundesliga, Ligue 1 and Saudi Pro League 2026/27 (top flights only). Squads and head coaches: FotMob team pages (6 Nov 2026).
// Club list: Bundesliga.com, Wikipedia "2026-27 Ligue 1", Arab News 2026/27 SPL preview. Ratings, stadium details for German and Saudi clubs,
// colours, reputations and budgets (£m) are game estimates.
const XL_CLUBS = [
{"lg": "BL", "id": "BAY", "name": "Bayern Munich", "short": "Bayern", "c1": "#dc052d", "c2": "#ffffff", "stadium": "Allianz Arena", "cap": 75024, "mgr": "Vincent Kompany", "capt": "Manuel Neuer", "rep": 92, "bal": 160, "form": "4-2-3-1",sq:`
1|Manuel Neuer|GK|40|GER|83
26|Sven Ulreich|GK|38|GER|74
40|Jonas Urbig|GK|23|GER|76
48|Leon Klanac|GK|19|GER|64
23|Sacha Boey|RB|26|FRA|77
27|Konrad Laimer|RB|29|AUT|80
44|Josip Stanišić|RB|26|CRO|80
2|Tarek Buchmann|CB|21|GER|73
3|Dayot Upamecano|CB|28|FRA|84
4|Min-Jae Kim|CB|29|KOR|84
5|Jonathan Tah|CB|30|GER|83
21|Hiroki Ito|CB|27|JPN|79
11|Nathaniel Brown|LB|23|GER|77
19|Alphonso Davies|LB|26|CAN|82
6|Joshua Kimmich|DM|31|GER|87
8|Tom Bischof|DM|21|GER|78
39|Bara Ndiaye|DM|18|SEN|70
45|Aleksandar Pavlović|DM|22|GER|83
47|David Santos Daiber|DM|19|POR|68
38|Erblin Osmani|CM|17|KOS|71
7|Serge Gnabry|AM|31|GER|80
10|Jamal Musiala|AM|23|GER|88
34|Ismael Saibari|AM|25|MAR|79
42|Lennart Karl|AM|18|GER|79
17|Michael Olise|RW|24|FRA|88
14|Luis Díaz|LW|29|COL|86
9|Harry Kane|ST|33|ENG|90
`},
{"lg": "BL", "id": "BVB", "name": "Borussia Dortmund", "short": "Dortmund", "c1": "#fde100", "c2": "#000000", "stadium": "Signal Iduna Park", "cap": 81365, "mgr": "Niko Kovač", "capt": "Emre Can", "rep": 86, "bal": 90, "form": "4-2-3-1",sq:`
1|Gregor Kobel|GK|28|SUI|85
30|Patrick Drewes|GK|33|GER|72
31|Silas Ostrzinski|GK|22|GER|70
33|Alexander Meyer|GK|35|GER|72
2|Jan-Luca Riedl|CB|18|GER|69
3|Waldemar Anton|CB|30|GER|80
4|Nico Schlotterbeck|CB|26|GER|84
5|Ramy Bensebaini|CB|31|ALG|77
22|Joane Gadou|CB|19|FRA|71
23|Emre Can|CB|32|GER|76
39|Filippo Mane|CB|21|ITA|75
49|Luca Reggiani|CB|18|ITA|63
36|Kauã Prates|LB|18|BRA|66
26|Julian Ryerson|RB|28|NOR|80
24|Daniel Svensson|LB|24|SWE|79
7|Jobe Bellingham|DM|21|ENG|82
8|Felix Nmecha|DM|26|GER|81
20|Marcel Sabitzer|DM|32|AUT|78
25|Joey Veerman|DM|27|NED|78
44|Enzo Duarte|DM|17|LUX|61
14|Maximilian Beier|AM|24|GER|81
17|Carney Chukwuemeka|AM|23|AUT|77
18|Ethan Nwaneri|AM|19|ENG|80
28|Justin Lerma|AM|18|ECU|68
40|Samuele Inácio|AM|18|ITA|61
45|Giannis Konstantelias|AM|23|GRE|73
19|Konstantinos Karetsas|RW|18|GRE|66
41|Mathis Albert|LW|17|USA|65
9|Serhou Guirassy|ST|30|GUI|84
21|Fábio Silva|ST|24|POR|77
`},
{"lg": "BL", "id": "B04", "name": "Bayer Leverkusen", "short": "Leverkusen", "c1": "#e32221", "c2": "#000000", "stadium": "BayArena", "cap": 30210, "mgr": "Carles Martínez", "capt": "Robert Andrich", "rep": 85, "bal": 80, "form": "3-4-2-1",sq:`
1|Mark Flekken|GK|33|NED|80
28|Janis Blaswich|GK|35|GER|66
36|Niklas Lomb|GK|33|GER|71
20|Guéla Doué|RB|24|CIV|79
2|Facundo Medina|CB|27|ARG|79
4|Jarell Quansah|CB|23|ENG|80
5|Loic Badé|CB|26|FRA|80
8|Robert Andrich|CB|32|GER|79
12|Edmond Tapsoba|CB|27|BFA|81
15|Tim Oermann|CB|23|GER|75
3|Miguel Gutiérrez|LB|25|ESP|80
17|Lucas Vázquez|RB|35|ESP|75
42|Montrell Culbreath|RW|19|GER|67
6|Equi Fernández|DM|24|ARG|78
18|Kennet Eichhorn|DM|17|GER|65
24|Aleix García|DM|29|ESP|82
45|Gabriel Minutillo|CM|16|GER|58
7|Jonas Hofmann|AM|34|GER|75
10|Malik Tillman|AM|24|USA|81
11|Martin Terrier|AM|29|FRA|79
23|Nathan Tella|AM|27|NGA|78
30|Ibrahim Maza|AM|20|ALG|79
19|Moussa Diaby|RW|27|FRA|80
9|Afonso Moreira|LW|21|POR|76
29|Eliesse Ben Seghir|LW|21|MAR|79
14|Patrik Schick|ST|30|CZE|82
22|Victor Okoh Boniface|ST|25|NGA|80
35|Christian Kofane|ST|20|CMR|76
`},
{"lg": "BL", "id": "RBL", "name": "RB Leipzig", "short": "Leipzig", "c1": "#dd0741", "c2": "#ffffff", "stadium": "Red Bull Arena", "cap": 47069, "mgr": "Martín Demichelis", "capt": "David Raum", "rep": 84, "bal": 85, "form": "4-2-3-1",sq:`
1|Ørjan Håskjold Nyland|GK|36|NOR|71
25|Leopold Zingerle|GK|32|GER|68
26|Maarten Vandevoordt|GK|24|BEL|79
16|Lukas Klostermann|RB|30|GER|73
17|Ridle Baku|RB|28|GER|77
39|Benjamin Henrichs|RB|29|GER|77
47|Viggo Gebel|RB|18|GER|61
2|Abdoul Koné|CB|21|FRA|75
3|Maxime Estève|CB|24|FRA|78
4|Willi Orbán|CB|34|HUN|78
23|Castello Lukeba|CB|23|FRA|82
22|David Raum|LB|28|GER|81
35|Max Finkgräfe|LB|22|GER|70
21|Neil El Aynaoui|DM|25|MAR|80
6|Ezechiel Banzuzi|CM|21|COD|71
8|Assan Ouédraogo|CM|20|GER|79
13|Nicolas Seiwald|CM|25|AUT|79
14|Christoph Baumgartner|CM|27|AUT|82
20|Rocco Reitz|CM|24|GER|73
37|Benno Kaltefleiter|CM|18|GER|65
30|Andrija Maksimović|RW|19|SRB|67
10|Brajan Gruda|RW|22|GER|79
11|Johan Bakayoko|RW|23|BEL|81
7|Antonio Nusa|LW|21|NOR|82
9|Marc Guiu|ST|20|ESP|74
27|Tidiam Gomis|ST|20|FRA|69
28|Christopher Nkunku|ST|28|FRA|82
40|Rômulo|ST|24|BRA|76
45|Samba Konaté|ST|17|FRA|61
`},
{"lg": "BL", "id": "VFB", "name": "VfB Stuttgart", "short": "Stuttgart", "c1": "#e32219", "c2": "#ffffff", "stadium": "MHPArena", "cap": 60449, "mgr": "Sebastian Hoeneß", "capt": "Atakan Karazor", "rep": 82, "bal": 60, "form": "4-2-3-1",sq:`
1|Fabian Bredlow|GK|31|GER|75
33|Marius Funk|GK|30|GER|68
41|Dennis Seimen|GK|20|GER|58
46|Stefan Drljača|GK|27|GER|65
4|Josha Vagnoman|RB|25|GER|76
22|Lorenz Assignon|RB|26|FRA|77
2|Ameen Al Dakhil|CB|24|BEL|79
3|Ramon Hendriks|CB|25|NED|77
14|Luca Jaquez|CB|23|SUI|71
23|Dan-Axel Zagadou|CB|27|FRA|76
24|Jeff Chabot|CB|28|GER|79
29|Finn Jeltsch|CB|20|GER|79
7|Maximilian Mittelstädt|LB|29|GER|80
6|Angelo Stiller|DM|25|GER|83
16|Atakan Karazor|DM|30|TUR|77
21|Grischa Prömel|DM|31|GER|72
11|Bilal El Khannouss|AM|22|MAR|80
28|Nikolas Nartey|AM|26|DEN|77
8|Tiago Tomás|RW|24|POR|77
10|Chris Führich|LW|28|GER|79
18|Jamie Leweling|LW|25|GER|80
44|Leo Sauer|LW|20|SVK|60
9|Ermedin Demirović|ST|28|BIH|80
17|Dženan Pejčinović|ST|21|GER|73
26|Deniz Undav|ST|30|GER|82
`},
{"lg": "BL", "id": "SGE", "name": "Eintracht Frankfurt", "short": "Frankfurt", "c1": "#e1000f", "c2": "#000000", "stadium": "Deutsche Bank Park", "cap": 58000, "mgr": "Adi Hütter", "capt": "Robin Koch", "rep": 81, "bal": 60, "form": "4-2-3-1",sq:`
1|Noah Atubolu|GK|24|GER|80
33|Jens Grahl|GK|38|GER|66
40|Kauã|GK|23|BRA|65
2|Elias Baum|RB|21|GER|70
3|Lilian Brassier|CB|26|FRA|76
4|Robin Koch|CB|30|GER|80
5|Otávio|CB|20|BRA|67
34|Nnamdi Collins|CB|22|GER|76
37|Jeremiaha Maluze|CB|21|GER|69
26|Keita Kosugi|LB|20|JPN|63
8|Farès Chaïbi|DM|23|ALG|78
25|Raphael Onyedika|DM|25|NGA|77
6|Oscar Højlund|CM|21|DEN|76
22|Timothy Chandler|LW|36|USA|65
15|Noël Aséko|AM|20|GER|66
27|Mario Götze|AM|34|GER|76
42|Can Uzun|AM|20|TUR|80
20|Ritsu Doan|RW|28|JPN|80
29|Ayoube Amaimouni-Echghouyab|RW|21|MAR|68
31|Love Arrhov|LW|18|SWE|64
7|Ansgar Knauff|ST|24|GER|77
9|Jonathan Burkardt|ST|26|GER|81
11|Younes Ebnoutalib|ST|23|GER|76
35|Malik Pimpong|ST|18|DEN|63
`},
{"lg": "BL", "id": "TSG", "name": "Hoffenheim", "short": "Hoffenheim", "c1": "#1961b5", "c2": "#ffffff", "stadium": "PreZero Arena", "cap": 30150, "mgr": "Christian Ilzer", "capt": "Oliver Baumann", "rep": 77, "bal": 45, "form": "3-4-2-1",sq:`
1|Oliver Baumann|GK|36|GER|79
37|Luca Philipp|GK|25|GER|70
34|Vladimír Coufal|RB|34|CZE|75
2|Robin Hranáč|CB|26|CZE|71
5|Ozan Kabak|CB|26|TUR|77
21|Albian Hajdari|CB|23|KOS|76
13|Bernardo|LB|31|BRA|72
15|Valentin Gendrey|LB|26|FRA|68
39|Mats Rots|LB|20|NED|66
7|Leon Avdullahu|DM|22|KOS|77
17|Nathan De Cat|DM|18|BEL|62
32|Cajetan Lenz|DM|20|GER|61
18|Wouter Burger|CM|25|NED|77
20|Bambasé Conté|AM|23|GER|70
27|Andrej Kramarić|AM|35|CRO|79
8|Patrick Wimmer|RW|25|AUT|76
14|Adam Daghim|RW|21|DEN|68
9|Max Moerstedt|ST|20|GER|68
10|Adam Hložek|ST|24|CZE|78
11|Fisnik Asllani|ST|24|KOS|76
19|Tim Lemperle|ST|24|GER|75
`},
{"lg": "BL", "id": "SCF", "name": "SC Freiburg", "short": "Freiburg", "c1": "#e2001a", "c2": "#000000", "stadium": "Europa-Park Stadion", "cap": 34700, "mgr": "Julian Schuster", "capt": "Christian Günter", "rep": 78, "bal": 40, "form": "4-2-3-1",sq:`
1|Mio Backhaus|GK|22|GER|67
21|Florian Müller|GK|28|GER|69
24|Jannik Huth|GK|32|GER|70
17|Lukas Kübler|RB|34|GER|68
29|Philipp Treu|RB|25|GER|76
3|Philipp Lienhart|CB|30|AUT|77
5|Anthony Jung|CB|35|GER|69
28|Matthias Ginter|CB|32|GER|78
37|Max Rosenfelder|CB|23|GER|72
43|Bruno Ogbus|CB|20|SUI|61
27|Berkay Yılmaz|LB|21|TUR|65
30|Christian Günter|LB|33|GER|71
33|Jordy Makengo|LB|25|COD|67
6|Patrick Osterhage|DM|26|GER|76
8|Maximilian Eggestein|DM|29|GER|78
16|Yannik Engelhardt|DM|25|GER|73
20|Rihito Yamamoto|DM|24|JPN|67
39|Rouven Tarnutzer|CM|19|GER|61
14|Yuito Suzuki|AM|25|JPN|78
19|Jan-Niklas Beste|RW|27|GER|77
22|Cyriaque Irié|RW|21|BFA|68
23|Florent Muslija|LW|28|KOS|72
7|Derry Scherhant|LW|23|GER|74
32|Vincenzo Grifo|LW|33|ITA|77
9|Lucas Höler|ST|32|GER|71
31|Igor Matanović|ST|23|CRO|76
42|Keisuke Goto|ST|21|JPN|60
`},
{"lg": "BL", "id": "M05", "name": "Mainz 05", "short": "Mainz", "c1": "#c3141e", "c2": "#ffffff", "stadium": "Mewa Arena", "cap": 33305, "mgr": "Urs Fischer", "capt": "Silvan Widmer", "rep": 75, "bal": 30, "form": "3-4-2-1",sq:`
1|Alexander Schwolow|GK|34|GER|67
27|Robin Zentner|GK|32|GER|75
40|Maximilian Kinzig|GK|22|GER|60
3|Fabio Gruber|CB|24|PER|70
4|Stefan Posch|CB|29|AUT|77
15|Lennard Maloney|CB|27|USA|67
16|Stefan Bell|CB|35|GER|67
21|Danny da Costa|RB|33|GER|71
31|Dominik Kohr|CB|32|GER|67
48|Kacper Potulski|CB|19|POL|57
5|Eric Martel|DM|24|GER|74
6|Kaishu Sano|CM|25|JPN|78
7|Jae-Sung Lee|CM|34|KOR|75
8|Paul Nebel|CM|24|GER|77
10|Nadiem Amiri|CM|30|GER|79
24|Sota Kawasaki|CM|25|JPN|66
19|Anthony Caci|RB|29|FRA|69
30|Silvan Widmer|RB|33|SUI|65
47|Rael Nakuzola|LW|19|GER|56
2|Phillipp Mwene|LB|32|AUT|69
20|Otto Ruoppi|AM|20|FIN|65
9|Phillip Tietz|ST|29|GER|73
11|Ransford Königsdörffer|ST|25|GHA|75
17|Benedict Hollerbach|ST|25|GER|76
23|Sheraldo Becker|ST|31|SUR|70
26|Silas Katompa Mvumpa|ST|28|COD|67
`},
{"lg": "BL", "id": "BMG", "name": "Borussia Mönchengladbach", "short": "M'gladbach", "c1": "#000000", "c2": "#ffffff", "stadium": "Borussia-Park", "cap": 54042, "mgr": "Alexander Blessin", "capt": "Tim Kleindienst", "rep": 76, "bal": 35, "form": "4-2-3-1",sq:`
1|Moritz Nicolas|GK|29|GER|76
21|Tobias Sippel|GK|38|GER|66
23|Jan Olschowsky|GK|24|GER|70
22|Yukhym Konoplya|RB|27|UKR|72
2|Fabio Chiarodia|CB|21|ITA|69
4|Kevin Diks|CB|30|IDN|76
5|Jan Leszczyński|CB|19|POL|66
6|Ko Itakura|CB|29|JPN|78
14|Daiki Hashioka|CB|27|JPN|66
16|Philipp Sander|CB|28|GER|67
26|Lukas Ullrich|LB|22|GER|63
29|Joseph Scally|RB|23|USA|67
17|Jens Castrop|LB|23|KOR|68
7|Kevin Stöger|DM|33|AUT|77
8|Enzo Leopold|CM|26|GER|74
10|Florian Neuhaus|CM|29|GER|76
25|Robin Hack|AM|28|GER|76
36|Wael Mohya|AM|17|GER|62
38|Hugo Bolin|AM|23|SWE|67
19|Nicolas-Gerrit Kühn|RW|26|GER|72
3|Isac Lidberg|ST|28|SWE|71
9|Franck Honorat|RW|30|FRA|77
11|Tim Kleindienst|ST|31|GER|79
18|Shuto Machino|ST|27|JPN|77
`},
{"lg": "BL", "id": "FCU", "name": "Union Berlin", "short": "Union Berlin", "c1": "#eb1923", "c2": "#ffffff", "stadium": "Stadion An der Alten Försterei", "cap": 22012, "mgr": "Mauro Lustrinelli", "capt": "Christopher Trimmel", "rep": 74, "bal": 30, "form": "3-5-2",sq:`
1|Frederik Rønnow|GK|34|DEN|77
25|Carl Klaus|GK|32|GER|68
31|Matheo Raab|GK|27|GER|63
18|Josip Juranović|RB|31|CRO|66
2|Felix Uduokhai|CB|29|GER|71
3|Andrik Markgraf|CB|20|GER|65
4|Zeno Van Den Bosch|CB|23|BEL|71
5|Marvin Friedrich|CB|30|GER|68
14|Leopold Querfeld|CB|22|AUT|77
34|Stanley N'Soki|CB|27|FRA|68
15|Tom Rothe|LB|22|GER|64
19|Janik Haberer|RB|32|GER|68
28|Christopher Trimmel|RB|39|AUT|66
17|Derrick Köhn|LB|27|GHA|65
6|Aljoscha Kemlein|DM|22|GER|66
8|Rani Khedira|DM|32|TUN|76
13|András Schäfer|DM|27|HUN|70
20|Michel Aebischer|CM|29|SUI|69
24|Robert Skov|LW|30|DEN|71
11|Woo-Yeong Jeong|AM|27|KOR|74
30|Kastriot Imeri|LW|26|SUI|69
9|Livan Burcu|LW|22|GER|68
7|Oliver Burke|ST|29|SCO|73
21|Tim Skarke|ST|30|GER|70
23|Andrej Ilić|ST|26|SRB|75
27|Marin Ljubičić|ST|24|CRO|67
29|Emmanuel Latte Lath|ST|27|CIV|66
`},
{"lg": "BL", "id": "FCA", "name": "FC Augsburg", "short": "Augsburg", "c1": "#ba3733", "c2": "#46714d", "stadium": "WWK Arena", "cap": 30660, "mgr": "Manuel Baum", "capt": "Jeffrey Gouweleeuw", "rep": 72, "bal": 25, "form": "3-4-2-1",sq:`
1|Finn Dahmen|GK|28|GER|75
22|Nediljko Labrović|GK|27|CRO|65
48|Tom Wisbereit|GK|18|GER|55
7|Young-Woo Seol|RB|27|KOR|72
2|Calvin Brackelmann|CB|27|GER|69
5|Chrislain Matsima|CB|24|FRA|73
6|Jeffrey Gouweleeuw|CB|35|NED|66
14|Yannik Keitel|CB|26|GER|70
35|Juma Bah|CB|20|SLE|58
40|Noahkai Banks|CB|19|USA|54
8|Sima Suso|CB|21|GER|68
19|Robin Fellhauer|RB|28|GER|70
27|Marius Wolf|RB|31|GER|65
16|Hennes Behrens|LB|21|GER|66
4|Han-Noah Massengo|DM|25|FRA|74
18|Tim Breithaupt|DM|24|GER|64
23|Faik Sakar|CM|18|GER|58
10|Mert Kömür|AM|21|TUR|75
20|Alexis Claude-Maurice|AM|28|FRA|75
21|Arijon Ibrahimović|AM|20|GER|62
30|Anton Kade|AM|22|GER|63
32|Fabian Rieder|AM|24|SUI|76
9|Rodrigo Ribeiro|ST|21|POR|68
11|Michael Gregoritsch|ST|32|AUT|69
15|Steve Mounié|ST|32|BEN|65
39|Uchenna Ogundu|ST|20|NGA|61
`},
{"lg": "BL", "id": "SVW", "name": "Werder Bremen", "short": "Werder", "c1": "#1d9053", "c2": "#ffffff", "stadium": "Weserstadion", "cap": 42100, "mgr": "Daniel Thioune", "capt": "Marco Friedl", "rep": 75, "bal": 30, "form": "3-5-2",sq:`
1|Karl Hein|GK|24|EST|75
25|Markus Kolke|GK|36|GER|59
30|Alexander Schlager|GK|30|AUT|64
3|Oskar Wójcik|CB|23|POL|69
4|Niklas Stark|CB|31|GER|74
5|Amos Pieper|CB|28|GER|74
22|Julián Malatini|CB|25|ARG|65
32|Marco Friedl|CB|28|AUT|76
2|Olivier Deman|LB|26|BEL|70
27|Felix Agu|LB|26|NGA|65
8|Mitchell Weiser|RB|32|GER|75
6|Jens Stage|DM|29|DEN|77
14|Senne Lynen|DM|27|BEL|76
23|Dariusz Stalmach|CM|20|POL|59
24|Patrice Covic|CM|19|CRO|64
28|Skelly Alvero|CM|24|FRA|70
15|Ludovit Reis|AM|26|NED|69
18|Eren Dinkçi|AM|24|TUR|67
20|Chuki|AM|22|ESP|68
9|Keke Topp|ST|22|GER|70
10|Niclas Füllkrug|ST|33|GER|77
11|Justin Njinmah|ST|25|GER|75
17|Marco Grüll|ST|28|AUT|70
21|Dawid Kownacki|ST|29|POL|69
26|Cedric Itten|ST|29|SUI|66
`},
{"lg": "BL", "id": "KOE", "name": "1. FC Köln", "short": "Köln", "c1": "#ed1c24", "c2": "#ffffff", "stadium": "RheinEnergieStadion", "cap": 50000, "mgr": "René Wagner", "capt": "Timo Hübers", "rep": 73, "bal": 25, "form": "4-2-3-1",sq:`
1|Marvin Schwäbe|GK|31|GER|75
20|Ron-Robert Zieler|GK|37|GER|60
21|Martin James|GK|18|FRA|59
17|Alessio Castro-Montes|RB|29|BEL|66
2|Joël Schmied|CB|28|SUI|72
4|Timo Hübers|CB|30|GER|71
22|Jahmai Simpson-Pusey|CB|21|ENG|63
24|Luka Lochoshvili|CB|28|GEO|65
28|Sebastian Sebulonsen|RB|26|NOR|66
33|Rav van den Berg|CB|22|NED|66
14|Gideon Mensah|LB|28|GHA|66
3|Borna Sosa|LB|28|CRO|67
6|Ellyes Skhiri|DM|31|TUN|77
23|Paul Okon-Engstler|DM|21|AUS|67
5|Tom Krauß|CM|25|GER|72
8|Ísak Jóhannesson|CM|23|ISL|69
29|Jan Thielmann|RW|24|GER|70
37|Linton Maina|RW|27|GER|67
7|Gian-Luca Waldschmidt|RW|30|GER|69
10|Saïd El Mala|LW|20|GER|79
11|Reigan Heskey|LW|18|ENG|61
9|Ragnar Ache|ST|28|GER|71
15|Imad Rondić|ST|27|BIH|65
19|Malek El Mala|ST|21|GER|66
27|Thijs Dallinga|ST|26|NED|74
30|Marius Bülter|ST|33|GER|69
`},
{"lg": "BL", "id": "HSV", "name": "Hamburger SV", "short": "Hamburg", "c1": "#0a3f86", "c2": "#ffffff", "stadium": "Volksparkstadion", "cap": 57000, "mgr": "Merlin Polzin", "capt": "Yussuf Poulsen", "rep": 74, "bal": 30, "form": "3-4-2-1",sq:`
1|Daniel Heuer Fernandes|GK|33|POR|65
12|Sander Tangvik|GK|23|NOR|65
41|Fernando Dickes|GK|19|GER|58
7|Zakaria El Ouahdi|RB|24|MAR|72
44|Mario Vušković|CB|25|CRO|65
17|Warmed Omari|CB|26|COM|69
23|Jordan Torunarigha|CB|29|NGA|69
24|Nicolás Capaldo|CB|28|ARG|66
33|Sebastiaan Bornauw|CB|27|BEL|69
39|Joel Agyekum|CB|21|GER|62
3|David Møller Wolfe|LB|24|NOR|69
4|Bilal Nadir|DM|22|MAR|64
22|Kofi Amoako|DM|21|GER|62
6|Albert Sambi Lokonga|CM|27|BEL|75
21|Nicolai Remberg|CM|26|GER|69
18|Bakery Jatta|RW|28|GAM|66
28|Miro Muheim|LB|28|SUI|66
5|Martin Adeline|AM|22|FRA|65
10|Immanuël Pherai|AM|25|SUR|71
11|Albert Grønbæk|AM|25|DEN|75
20|Fábio Vieira|RW|26|POR|77
38|Alexander Røssing|LW|19|NOR|64
9|Terem Moffi|ST|27|NGA|75
15|Yussuf Poulsen|ST|32|DEN|74
19|Otto Stange|ST|19|GER|58
27|Patson Daka|ST|28|ZAM|74
`},
{"lg": "BL", "id": "S04", "name": "Schalke 04", "short": "Schalke", "c1": "#004d9d", "c2": "#ffffff", "stadium": "Veltins-Arena", "cap": 62271, "mgr": "Miron Muslić", "capt": "Kenan Karaman", "rep": 74, "bal": 20, "form": "4-2-3-1",sq:`
1|Loris Karius|GK|33|GER|72
22|Kevin Müller|GK|35|GER|58
2|Faaris Yusufu|GK|21|GER|61
5|Timo Becker|RB|29|GER|70
3|Tomás Kalas|CB|33|CZE|65
4|Hasan Kuruçay|CB|29|TUR|71
25|Nikola Katić|CB|30|BIH|63
43|Mertcan Ayhan|CB|20|TUR|54
8|Robin Gosens|LB|32|GER|74
30|Anton Donkor|LB|28|GER|68
39|Maximilian Wöber|LB|28|AUT|65
17|Adrian Gantenbein|RB|25|SUI|69
27|Finn Porath|RB|29|GER|68
6|Ron Schallenberg|DM|28|GER|67
13|Satoshi Tanaka|DM|24|JPN|65
23|Soufian El-Faouzi|DM|24|MAR|69
24|Adil Aouchiche|DM|24|ALG|64
14|Janik Bachmann|CM|30|GER|66
19|Kenan Karaman|AM|32|TUR|63
21|Dejan Ljubičić|RW|29|AUT|67
29|Junior Dina Ebimbe|LW|25|CMR|63
7|Hee-Chan Hwang|ST|30|KOR|68
9|Moussa Sylla|ST|26|MLI|69
10|Edin Džeko|ST|40|BIH|75
11|Bryan Lasme|ST|27|FRA|71
15|Emil Højlund|ST|21|DEN|65
`},
{"lg": "BL", "id": "SVE", "name": "SV Elversberg", "short": "Elversberg", "c1": "#000000", "c2": "#ffffff", "stadium": "Ursapharm-Arena an der Kaiserlinde", "cap": 10000, "mgr": "Vincent Wagner", "capt": "Maximilian Rohr", "rep": 64, "bal": 12, "form": "4-2-3-1",sq:`
20|Nicolas Kristof|GK|26|AUT|66
1|Frank Lehmann|GK|37|GER|61
28|Tim Boss|GK|33|GER|66
30|Jan Gyamerah|RB|31|GHA|68
3|Florian Le Joncour|CB|31|FRA|70
19|Lukas Pinckert|CB|26|GER|65
26|Luca Sirch|CB|27|GER|64
31|Maximilian Rohr|CB|31|GER|69
2|Nicholas Mickelson|LB|27|THA|66
21|Lasse Günther|LB|23|GER|66
6|Amara Condé|DM|29|GER|68
8|Łukasz Poręba|DM|26|POL|67
17|Frederik Schmahl|DM|23|GER|69
43|Felix Keidel|DM|23|GER|61
15|Raif Adam|CM|21|GER|66
7|Maurice Krattenmacher|RW|21|GER|65
10|Noah Darvich|RW|20|GER|64
25|Lukas Petkov|RW|25|BUL|68
29|Tom Zimmerschied|LW|28|GER|69
39|Cole Campbell|LW|20|USA|63
9|Noel Futkeu|ST|23|GER|70
16|Luca Pfeiffer|ST|30|GER|68
24|Luca Schnellbacher|ST|32|GER|64
42|David Mokwa|ST|22|FRA|56
`},
{"lg": "BL", "id": "SCP", "name": "SC Paderborn", "short": "Paderborn", "c1": "#0058a6", "c2": "#000000", "stadium": "Home Deluxe Arena", "cap": 15000, "mgr": "Ralf Kettemann", "capt": "Marcel Hoffmeier", "rep": 64, "bal": 12, "form": "4-2-3-1",sq:`
1|Markus Schubert|GK|28|GER|68
15|Nahuel Noll|GK|23|GER|63
21|Jano ter Horst|RB|24|GER|67
4|Nyamekye Awortwie-Grant|CB|26|GER|67
20|Felix Götze|CB|28|GER|69
22|Mattes Hansen|CB|22|GER|61
25|Tjark Scheller|CB|24|GER|67
33|Marcel Hoffmeier|CB|27|GER|67
17|Laurin Curda|RB|25|GER|64
24|Niklas Mohr|LB|22|GER|60
23|Raphael Obermair|LB|30|PHI|68
5|Santiago Castañeda|DM|21|USA|63
6|Tom Baack|DM|27|GER|67
8|Luka Djuric|DM|23|BIH|68
28|Laurin Ulrich|CM|21|GER|62
11|Sven Michel|AM|36|GER|65
26|Sebastian Klaas|AM|28|GER|63
40|Gabriel Vidović|AM|22|CRO|59
44|Timur Gayret|RW|28|GER|64
9|Rayan Philippe|RW|26|FRA|67
7|Oliver Batista Meier|ST|25|GER|71
18|Marvin Pieringer|ST|27|GER|63
27|Steffen Tigges|ST|28|GER|69
30|Stefano Marino|ST|22|GER|63
`},
{"lg": "L1", "id": "PSG", "name": "Paris Saint-Germain", "short": "PSG", "c1": "#004170", "c2": "#da291c", "stadium": "Parc des Princes", "cap": 47926, "mgr": "Luis Enrique", "capt": "Marquinhos", "rep": 95, "bal": 180, "form": "4-3-3",sq:`
30|Lucas Chevalier|GK|24|FRA|83
39|Matvey Safonov|GK|27|RUS|80
16|Alessandro Longoni|GK|18|ITA|73
2|Achraf Hakimi|RB|28|MAR|87
5|Marquinhos|CB|32|BRA|84
6|Ilya Zabarnyi|CB|24|UKR|82
51|Willian Pacho|CB|25|ECU|85
12|Lucas Digne|LB|33|FRA|77
21|Lucas Hernández|LB|30|FRA|81
25|Nuno Mendes|LB|24|POR|87
4|Lucas Beraldo|CB|22|BRA|79
8|Fabián Ruiz|CM|30|ESP|84
17|Vitinha|CM|26|POR|89
24|Senny Mayulu|CM|20|FRA|78
27|Dro Fernández|CM|18|ESP|76
33|Warren Zaïre-Emery|CM|20|FRA|83
87|João Neves|CM|22|POR|87
11|Maghnes Akliouche|RW|24|FRA|82
14|Désiré Doué|RW|21|FRA|86
7|Khvicha Kvaratskhelia|LW|25|GEO|88
22|Mika Godts|LW|21|BEL|79
9|Ferran Torres|ST|26|ESP|81
10|Ousmane Dembélé|ST|29|FRA|88
47|Quentin Ndjantou|ST|19|FRA|73
`},
{"lg": "L1", "id": "OM", "name": "Marseille", "short": "Marseille", "c1": "#2faee0", "c2": "#ffffff", "stadium": "Stade Vélodrome", "cap": 67394, "mgr": "Bruno Génésio", "capt": "Timothy Weah", "rep": 84, "bal": 60, "form": "4-2-3-1",sq:`
1|Jeffrey De Lange|GK|28|NED|76
40|Jelle Van Neck|GK|22|BEL|63
92|Théo Vermot|GK|29|FRA|66
22|Timothy Weah|RB|26|USA|78
74|Kelyann Bezahaf|RB|20|FRA|66
4|CJ Egan-Riley|CB|23|ENG|76
13|Derek Cornelius|CB|28|CAN|70
18|Bamo Meité|CB|24|CIV|70
21|Nayef Aguerd|CB|30|MAR|80
25|Ulisses Garcia|LB|30|SUI|74
33|Emerson|LB|32|ITA|76
6|Tochukwu Nnadi|DM|23|NGA|77
8|Himad Abdelli|DM|26|ALG|77
19|Geoffrey Kondogbia|DM|33|CTA|77
23|Pierre-Emile Højbjerg|DM|31|DEN|80
42|Nouhoum Kamissoko|DM|21|MLI|63
7|Angel Gomes|AM|26|ENG|79
48|Keyliane Abdallah|RW|20|FRA|64
14|Igor Paixão|LW|26|BRA|80
77|Amine Harit|LW|29|MAR|77
9|Amine Gouiri|ST|26|ALG|80
11|Neal Maupay|ST|30|FRA|76
29|Faris Moumbagna|ST|26|CMR|75
`},
{"lg": "L1", "id": "ASM", "name": "Monaco", "short": "Monaco", "c1": "#e51b22", "c2": "#ffffff", "stadium": "Stade Louis II", "cap": 18523, "mgr": "Filipe Luís", "capt": "Denis Zakaria", "rep": 82, "bal": 60, "form": "4-2-3-1",sq:`
1|Lukáš Hrádecký|GK|36|FIN|79
16|Philipp Köhn|GK|28|SUI|69
40|Jules Stawiecki|GK|19|FRA|62
2|Vanderson|RB|25|BRA|80
49|Ilane Touré|RB|20|FRA|62
15|Eric Dier|CB|32|ENG|77
22|Mohammed Salisu|CB|27|GHA|78
72|Sadibou Sané|CB|22|SEN|69
4|Jordan Teze|CB|27|NED|78
13|Christian Mawissa|LB|21|FRA|73
20|Flávio Nazinho|LB|23|POR|72
6|Denis Zakaria|DM|29|SUI|81
8|Lamine Camara|DM|22|SEN|80
28|Mamadou Coulibaly|DM|22|FRA|77
19|Pape Cabral|CM|19|FRA|69
10|Aleksandr Golovin|AM|30|RUS|80
18|Takumi Minamino|AM|31|JPN|79
31|Ansu Fati|AM|24|ESP|77
7|Mathys Detourbet|LW|19|FRA|70
11|Matthis Abline|LW|23|FRA|78
17|Stanis Idumbo|LW|21|COD|73
9|Folarin Balogun|ST|25|USA|80
14|Mika Biereth|ST|23|DEN|78
29|Paris Brunner|ST|20|GER|67
`},
{"lg": "L1", "id": "OL", "name": "Lyon", "short": "Lyon", "c1": "#ffffff", "c2": "#1d3c8f", "stadium": "Groupama Stadium", "cap": 59186, "mgr": "Jorge Maciel", "capt": "Corentin Tolisso", "rep": 82, "bal": 45, "form": "4-2-3-1",sq:`
1|Dominik Greif|GK|29|SVK|77
40|Rémy Descamps|GK|30|FRA|66
25|Justin Bengui|GK|21|FRA|64
13|Zachary Athekame|RB|21|SUI|70
37|Steeve Kango|RB|19|FRA|69
19|Moussa Niakhaté|CB|30|SEN|78
20|Felix Bacher|CB|26|AUT|72
21|Ruben Kluivert|CB|25|NED|76
22|Clinton Mata|CB|33|ANG|71
85|Noham Kamara|CB|19|FRA|61
3|Nicolás Tagliafico|LB|34|ARG|77
16|Abner|LB|26|BRA|76
5|Paul Akouokou|DM|28|CIV|72
23|Tyler Morton|DM|24|ENG|77
2|Mads Bidstrup|CM|25|DEN|77
6|Tanner Tessmann|CM|25|USA|77
8|Corentin Tolisso|CM|32|FRA|79
99|Noah Nartey|CM|21|DEN|64
76|Mohamed Ouédraogo|LW|23|BFA|69
18|Khalis Merah|AM|19|FRA|63
10|Pavel Šulc|AM|25|CZE|78
7|Ernest Nuamah|RW|23|GHA|77
24|Julien Duranville|RW|20|BEL|64
11|Keito Nakamura|LW|26|JPN|77
17|Loïs Openda|ST|26|BEL|81
45|Rémi Himbert|ST|18|FRA|57
`},
{"lg": "L1", "id": "LOSC", "name": "Lille", "short": "Lille", "c1": "#e01e13", "c2": "#1a2c5b", "stadium": "Stade Pierre-Mauroy", "cap": 50186, "mgr": "Davide Ancelotti", "capt": "Benjamin André", "rep": 81, "bal": 45, "form": "4-2-3-1",sq:`
1|Berke Özer|GK|26|TUR|79
12|Orlando Gill|GK|26|PAR|72
40|Zadig Lanssade|GK|18|FRA|59
2|Loun Srdanovic|RB|20|SUI|66
22|Tiago Santos|RB|24|POR|77
3|Nathan Ngoy|CB|23|BEL|77
4|Alexsandro Ribeiro|CB|27|BRA|77
23|Tanguy Nianzou|CB|24|FRA|72
26|Isaac Cossier|CB|19|FRA|67
15|Romain Perraud|LB|29|FRA|77
24|Calvin Verdonk|LB|29|IDN|75
19|Başar Önal|LW|22|TUR|71
6|Nabil Bentaleb|DM|31|ALG|76
21|Benjamin André|DM|36|FRA|76
14|Maurits Kjærgaard|CM|23|DEN|69
17|Ngal'ayel Mukau|CM|22|COD|77
10|Hákon Arnar Haraldsson|AM|23|ISL|79
5|Tiago Morais|RW|21|POR|70
7|Dilane Bakwa|RW|24|FRA|78
8|Ethan Mbappé|RW|19|FRA|72
11|Osame Sahraoui|LW|25|MAR|77
28|Gaëtan Perrin|LW|30|FRA|73
9|Olivier Giroud|ST|40|FRA|75
18|Ayase Ueda|ST|28|JPN|77
29|Hamza Igamane|ST|24|MAR|76
`},
{"lg": "L1", "id": "RCL", "name": "Lens", "short": "Lens", "c1": "#fdea01", "c2": "#e5200f", "stadium": "Stade Bollaert-Delelis", "cap": 37705, "mgr": "Yannick Cahuzac", "capt": "Florian Thauvin", "rep": 79, "bal": 35, "form": "3-4-2-1",sq:`
40|Robin Risser|GK|21|FRA|76
1|Régis Gurtner|GK|39|FRA|69
16|Mathieu Gorgelin|GK|36|FRA|66
3|Maik Nawrocki|CB|25|POL|75
4|Nidal Čelik|CB|20|BIH|65
6|Samson Baidoo|CB|22|AUT|76
20|Jean-Clair Todibo|CB|26|FRA|79
24|Jonathan Gradit|CB|33|FRA|73
25|Ismaëlo Ganiou|CB|21|FRA|67
13|Jhoanner Chávez|LB|24|ECU|68
2|Ruben Aguilar|RB|33|FRA|70
23|Saud Abdulhamid|RB|27|KSA|74
14|Matthieu Udol|LB|30|FRA|72
5|Andrija Bulatović|DM|19|MNE|69
8|Yacine Titraoui|DM|23|ALG|76
21|Amadou Haidara|DM|28|MLI|77
7|Florian Sotoca|AM|36|FRA|70
10|Florian Thauvin|AM|33|FRA|79
27|Michaël Cuisance|AM|27|FRA|69
9|Thorgan Hazard|AM|33|BEL|73
19|Abdallah Sima|AM|25|SEN|76
22|Michał Skóras|LW|26|POL|70
28|Junior Kadile|LW|23|COD|72
11|Odsonne Édouard|ST|28|FRA|77
29|Franjo Ivanović|ST|23|CRO|69
`},
{"lg": "L1", "id": "OGCN", "name": "Nice", "short": "Nice", "c1": "#e30613", "c2": "#000000", "stadium": "Allianz Riviera", "cap": 35624, "mgr": "Olivier Pantaloni", "capt": "Jonathan Clauss", "rep": 78, "bal": 35, "form": "3-4-2-1",sq:`
23|Yéhvann Diouf|GK|26|SEN|77
77|Teddy Boulhendi|GK|25|ALG|66
36|Alidu Seidu|RB|26|GHA|73
5|Mohamed Abdelmonem|CB|27|EGY|76
33|Antoine Mendy|CB|22|SEN|66
55|Youssouf Ndayishimiye|CB|28|BDI|68
64|Moïse Bombito|CB|26|CAN|77
84|Hamza Koutoune|CB|20|MAR|63
2|Ali Abdi|LB|32|TUN|75
92|Jonathan Clauss|RB|34|FRA|77
27|Niels Nkounkou|LB|26|FRA|71
6|Hicham Boudaoui|DM|27|ALG|77
19|Laurent Abergel|DM|33|FRA|70
28|Axel Witsel|DM|37|BEL|63
8|Morgan Sanson|CM|32|FRA|74
99|Salis Abdul Samed|CM|26|GHA|63
7|Gauthier Hein|AM|30|FRA|73
10|Sofiane Diop|AM|26|MAR|77
22|Issiaga Camara|LW|21|GUI|66
21|Isak Jansson|LW|24|SWE|73
9|Mohamed Amoura|ST|26|ALG|78
11|Elye Wahi|ST|23|CIV|76
29|Nathan N'Goumou|ST|26|CMR|69
44|Zoumana Diallo|ST|21|FRA|66
`},
{"lg": "L1", "id": "SRFC", "name": "Rennes", "short": "Rennes", "c1": "#e13327", "c2": "#000000", "stadium": "Roazhon Park", "cap": 29778, "mgr": "Franck Haise", "capt": "Valentin Rongier", "rep": 78, "bal": 40, "form": "4-2-3-1",sq:`
30|Brice Samba|GK|32|FRA|79
16|Nicolas Lemaître|GK|29|FRA|68
60|Kilian Belazzoug|GK|20|ALG|56
14|Bryan Reynolds|RB|25|USA|68
95|Przemysław Frankowski|RB|31|POL|63
4|Charlie Cresswell|CB|24|ENG|76
5|Gonçalo Oliveira|CB|20|POR|67
24|Anthony Rouault|CB|25|FRA|73
48|Abdelhamid Aït Boudlal|CB|20|MAR|63
18|Mahamadou Nagida|LB|21|CMR|70
26|Quentin Merlin|LB|24|FRA|76
28|Adrien Thomasson|DM|32|FRA|71
6|Djaoui Cissé|CM|22|FRA|73
17|Sebastian Szymański|CM|27|POL|78
21|Valentin Rongier|CM|31|FRA|77
45|Mahdi Camara|CM|28|FRA|64
11|Musa Al-Taamari|RW|29|JOR|77
10|Ludovic Blas|RW|28|FRA|78
70|Arnaud Nordin|LW|28|FRA|69
9|Estéban Lepaul|ST|26|FRA|78
12|Eliezer Mayenda|ST|21|ESP|66
22|Boulaye Dia|ST|29|SEN|69
90|Issa Soumaré|ST|26|SEN|63
`},
{"lg": "L1", "id": "RCSA", "name": "Strasbourg", "short": "Strasbourg", "c1": "#0a4ea2", "c2": "#ffffff", "stadium": "Stade de la Meinau", "cap": 29230, "mgr": "Hugo Oliveira", "capt": "Dário Essugo", "rep": 77, "bal": 45, "form": "4-2-3-1",sq:`
1|Filip Jörgensen|GK|24|DEN|76
12|Miłosz Piekutowski|GK|20|POL|64
16|Genesis Antwi|RB|19|SWE|64
4|Jeyland Mitchell|CB|22|CRC|68
6|Ismaël Doukouré|CB|23|FRA|77
24|Lucas Høgsberg|CB|20|DEN|67
31|Karim Coulibaly|CB|19|GER|63
15|Mateo Del Blanco|LB|23|ARG|69
36|Oso|LB|23|ESP|67
8|Maxi Oyedele|DM|21|POL|77
21|Pape Demba Diop|DM|23|SEN|67
23|Diogo Sousa|DM|20|POR|61
29|Samir El Mourabet|DM|21|MAR|64
14|Dário Essugo|CM|21|POR|77
10|Giovanni Reyna|AM|23|USA|75
11|Sebastian Nanasi|AM|24|SWE|77
7|Samuel Amo-Ameyaw|RW|20|ENG|69
80|Gessime Yassine|RW|20|MAR|57
19|Fabio Baldé|LW|21|POR|64
20|Martial Godo|LW|23|CIV|72
9|Joaquín Panichelli|ST|24|ARG|78
26|Omari Kellyman|ST|21|ENG|66
40|Conrad Harder|ST|21|DEN|60
30|Jacobo Ortega|ST|20|ESP|67
`},
{"lg": "L1", "id": "TFC", "name": "Toulouse", "short": "Toulouse", "c1": "#5a2d82", "c2": "#ffffff", "stadium": "Stadium de Toulouse", "cap": 33150, "mgr": "Jens Berthel Askou", "capt": "Rasmus Nicolaisen", "rep": 72, "bal": 20, "form": "3-4-2-1",sq:`
16|Guillaume Restes|GK|21|FRA|77
1|Theo Collin|GK|20|FRA|63
14|Niko Sigur|RB|23|CAN|66
94|Ismaïl Diallo|RB|23|FRA|62
22|Rafik Messali|RB|23|ALG|66
2|Rasmus Nicolaisen|CB|29|DEN|67
3|Mark McKenzie|CB|27|USA|68
5|Seny Koumbassa|CB|19|FRA|66
19|David Odogu|CB|20|GER|62
12|Christ Tapé|LB|20|CIV|63
17|Abu Francis|DM|25|GHA|64
18|Mathis Amougou|DM|20|FRA|59
23|Cristian Cásseres|DM|26|VEN|76
31|Niklas Schmidt|DM|28|GER|69
8|Thomas Jørgensen|CM|21|DEN|68
9|Santiago Hidalgo|AM|21|ARG|64
15|Aron Dønnum|AM|28|NOR|68
7|Julián Vignolo|RW|19|ARG|62
11|Sion Oppong|LW|19|SWE|62
13|Jacen Russell-Rowe|ST|24|CAN|65
20|Casper Tengstedt|ST|26|DEN|70
`},
{"lg": "L1", "id": "SB29", "name": "Brest", "short": "Brest", "c1": "#e2001a", "c2": "#ffffff", "stadium": "Stade Francis-Le Blé", "cap": 15931, "mgr": "Julien Lachuer", "capt": "Brendan Chardonnet", "rep": 72, "bal": 20, "form": "4-3-3",sq:`
1|Egil Selvik|GK|29|NOR|70
16|Noe Poillion|GK|19|FRA|57
30|Mathieu Patouillet|GK|22|FRA|58
20|Luck Zogbé|RB|21|CIV|64
70|Kenny Lala|RB|35|FRA|55
4|Gautier Lloris|CB|31|FRA|70
5|Brendan Chardonnet|CB|31|FRA|67
71|Raphaël Le Guen|CB|20|FRA|58
29|Lucas Tousart|CB|29|FRA|74
2|Bradley Locko|LB|24|FRA|72
18|Justin Bourgault|LB|21|FRA|65
6|Mamady Diambou|DM|23|MLI|67
8|Hugo Magnetti|DM|28|FRA|72
13|Joris Chotard|DM|25|FRA|69
7|Joseph Boende|CM|21|BEL|63
11|Noah Edjouma|AM|21|FRA|67
23|Kamory Doumbia|AM|23|MLI|66
17|Mama Baldé|RW|30|GNB|69
9|Pathé Mboup|LW|23|SEN|72
10|Giovani Versini|ST|22|FRA|66
19|Ludovic Ajorque|ST|32|FRA|74
39|Djylian N'Guessan|ST|18|FRA|54
`},
{"lg": "L1", "id": "AJA", "name": "Auxerre", "short": "Auxerre", "c1": "#ffffff", "c2": "#00428c", "stadium": "Stade Abbé Deschamps", "cap": 21379, "mgr": "Will Still", "capt": "Elisha Owusu", "rep": 69, "bal": 15, "form": "3-4-2-1",sq:`
1|Paul Nardi|GK|32|FRA|64
23|Mamadou Diop|GK|26|MTN|61
37|Louis Mezerette|GK|20|FRA|57
27|Lamine Sy|RB|24|SEN|64
29|Marvin Senaya|RB|25|GHA|64
4|Axel Tuanzebe|CB|28|COD|71
13|Telli Siwe|CB|21|FRA|62
15|Christ Makosso|CB|22|CGO|64
20|Sinaly Diomandé|CB|25|CIV|64
24|Bryan Okoh|CB|23|SUI|67
92|Clément Akpa|CB|24|CIV|63
93|Sékou Fofana|LB|23|CIV|62
22|Fredrik Oppegård|LB|24|NOR|68
5|Kévin Danois|CM|22|FRA|63
8|Naouirou Ahamada|CM|24|FRA|69
17|Pierre Ekwah|CM|24|FRA|63
18|Assane Dioussé|CM|29|SEN|66
10|Danny Namaso|AM|26|CMR|65
21|Romain Faivre|RW|28|FRA|66
3|Rémy Lascary|LW|23|FRA|68
77|Aristide Zossou|LW|21|CIV|60
9|Cameron Archer|ST|24|ENG|69
31|Ryan Rodin|ST|20|FRA|57
`},
{"lg": "L1", "id": "SCO", "name": "Angers", "short": "Angers", "c1": "#000000", "c2": "#ffffff", "stadium": "Stade Raymond Kopa", "cap": 18752, "mgr": "Stéphane Gilli", "capt": "Haris Belkebla", "rep": 68, "bal": 12, "form": "3-4-2-1",sq:`
1|Anthony Lopes|GK|36|POR|59
16|Melvin Zinga|GK|24|CGO|65
40|Oumar Pona|GK|20|FRA|55
2|Carlens Arcus|RB|30|HAI|65
4|Ousmane Camara|CB|23|MLI|65
20|Marius Louër|CB|19|FRA|56
21|Jordan Lefort|CB|33|MTN|61
24|Emmanuel Biumla|CB|21|FRA|60
27|Lilian Rao-Lisoa|RB|26|FRA|65
17|Joseph Kalulu|LB|21|FRA|64
93|Haris Belkebla|DM|32|ALG|62
8|Branco van den Boomen|CM|31|NED|68
6|Louis Mouton|AM|24|FRA|69
14|Yassin Belkhdim|RW|24|FRA|65
11|Harouna Djibirin|RW|19|CMR|63
18|Jim Allevinah|RW|31|GAB|66
26|Anthony Bermont|LW|21|FRA|63
10|Amine Sbaï|LW|25|MAR|70
7|Usman Simbakoli|ST|24|CTA|69
9|Prosper Peter|ST|19|FRA|63
19|Amine El Ouazzani|ST|25|MAR|67
`},
{"lg": "L1", "id": "HAC", "name": "Le Havre", "short": "Le Havre", "c1": "#0f2d5b", "c2": "#87cefa", "stadium": "Stade Océane", "cap": 25178, "mgr": "Didier Digard", "capt": "Rassoul Ndiaye", "rep": 68, "bal": 12, "form": "3-4-2-1",sq:`
16|Arnaud Bodart|GK|28|BEL|60
77|Lionel Mpasi-Nzau|GK|32|COD|60
93|Gauthier Gallon|GK|33|FRA|58
12|Elias Jelert|RB|23|DEN|65
5|Ahmed Touba|CB|28|ALG|65
15|Ayumu Seko|CB|26|JPN|64
23|Vincent Sasso|CB|35|FRA|59
32|Timothée Pembélé|CB|24|FRA|63
27|Enzo Koffi|LB|20|FRA|57
97|Lamine N'Diaye|LB|21|SEN|60
26|Simon Ebonog|DM|22|FRA|63
78|Daren Mosengo|DM|20|FRA|56
6|Junior Mwanga|CM|23|FRA|66
7|Amir Richardson|CM|24|MAR|65
14|Rassoul Ndiaye|AM|24|SEN|67
17|Kaito Mizuta|AM|26|JPN|67
30|Sota Nakamura|AM|24|JPN|61
9|Josh Maja|ST|27|NGA|69
10|Felix Mambimbi|ST|25|SUI|69
19|Joan Tincrès|ST|20|FRA|58
25|Mbwana Samatta|ST|33|TAN|65
38|Rayan Fofana|ST|20|CIV|58
`},
{"lg": "L1", "id": "FCL", "name": "Lorient", "short": "Lorient", "c1": "#f58220", "c2": "#000000", "stadium": "Stade du Moustoir", "cap": 18890, "mgr": "Alexandre Dujeux", "capt": "Montassar Talbi", "rep": 68, "bal": 12, "form": "3-4-2-1",sq:`
38|Yvon Mvogo|GK|32|SUI|63
1|Benjamin Leroy|GK|37|FRA|62
21|Bingourou Kamara|GK|30|SEN|65
3|Montassar Talbi|CB|28|TUN|70
32|Nathaniel Adjei|CB|24|GHA|63
55|Nosa Edward Obaretin|CB|23|ITA|62
95|Souleymane Touré|CB|23|FRA|63
30|Srdjan Kuzmić|LB|22|SVN|60
11|Théo Le Bris|RB|24|FRA|66
20|Dembo Sylla|RB|23|GUI|65
77|Panos Katseris|RB|25|GRE|62
43|Arsène Kouassi|LB|22|BFA|60
2|Alec Georgen|DM|28|FRA|67
8|Noah Cadiou|DM|28|FRA|70
62|Arthur Avom|DM|21|CMR|55
7|Bandiougou Fadiga|AM|25|FRA|69
17|Jean-Victor Makengo|AM|28|FRA|61
10|Isak Steiner Jensen|LW|22|DEN|67
19|Souleymane Faye|LW|23|SEN|65
9|Mohamed Bamba|ST|24|CIV|67
15|Aiyegun Tosin|ST|28|BEN|61
18|Ibrahima Baldé|ST|23|FRA|63
`},
{"lg": "L1", "id": "PFC", "name": "Paris FC", "short": "Paris FC", "c1": "#1a2a57", "c2": "#d6b46a", "stadium": "Stade Jean-Bouin", "cap": 20000, "mgr": "Liam Rosenior", "capt": "Pierre Lees-Melou", "rep": 72, "bal": 40, "form": "4-3-3",sq:`
1|Kevin Trapp|GK|36|GER|76
16|Obed Nkambadio|GK|23|FRA|67
14|Hamari Traoré|RB|34|MLI|65
17|Adama Camara|RB|30|MLI|66
25|Yoan Koré|RB|21|FRA|61
5|Mamadou Mbow|CB|26|SEN|68
6|Otávio|CB|24|BRA|67
31|Samir Chergui|CB|27|ALG|67
42|Diego Coppola|CB|22|ITA|75
19|Nhoa Sangui|LB|20|FRA|61
28|Thibault De Smet|LB|28|BEL|64
8|Patrick Zabi|DM|20|CIV|65
20|Maxime Lopez|DM|28|FRA|75
33|Pierre Lees-Melou|DM|33|FRA|66
4|Vincent Marchetti|CM|29|FRA|66
7|Pablo Pagis|AM|23|FRA|68
10|Ilan Kebbal|RW|28|ALG|76
93|Jonathan Ikoné|RW|28|FRA|75
15|Luca Koleosho|LW|22|ITA|65
27|Moses Simon|LW|31|NGA|75
9|Lassine Sinayoko|ST|26|MLI|67
11|Jean-Philippe Krasso|ST|29|CIV|66
18|Omar Sissoko|ST|20|FRA|62
`},
{"lg": "L1", "id": "LMFC", "name": "Le Mans", "short": "Le Mans", "c1": "#c8102e", "c2": "#ffd700", "stadium": "Stade Marie-Marvingt", "cap": 25000, "mgr": "Patrick Videira", "capt": "Edwin Quarshie", "rep": 64, "bal": 10, "form": "4-3-3",sq:`
1|Ewan Hatfout|GK|26|FRA|67
98|Nicolas Kocik|GK|28|FRA|59
55|Augustin Delbecque|GK|24|FRA|60
5|Harold Voyer|CB|29|FRA|69
15|Noa Boissé|CB|20|FRA|62
16|Raúl Torrente|CB|25|ESP|67
17|Samuel Yohou|CB|35|FRA|61
21|Théo Eyoum|CB|24|FRA|66
19|Djibril Sidibé|RB|34|FRA|61
12|João Almeida|LB|20|BRA|61
76|Yasser Larouci|LB|25|ALG|63
22|Lucas Calodat|LW|24|FRA|67
8|Alexandre Lauray|DM|29|FRA|69
23|Daouda Traoré|DM|20|FRA|56
29|Lucas Bretelle|DM|24|FRA|62
6|Edwin Quarshie|CM|31|CTA|70
11|Adil Bourabaa|CM|21|ALG|67
27|Martin Rossignol|CM|23|FRA|62
7|Billal Brahimi|CM|26|ALG|70
10|Jean Vercruysse|AM|26|FRA|70
18|Lucas Buadés|AM|28|FRA|66
9|Antoine Rabillard|ST|31|FRA|68
13|Habibou Mouhamadou Diallo|ST|31|SEN|65
14|Louis Mafouta|ST|32|CTA|62
25|Dame Gueye|ST|31|SEN|67
`},
{"lg": "L1", "id": "ESTAC", "name": "Troyes", "short": "Troyes", "c1": "#1f5aa6", "c2": "#ffffff", "stadium": "Stade de l'Aube", "cap": 20400, "mgr": "Stéphane Dumont", "capt": "Adrien Monfray", "rep": 64, "bal": 10, "form": "4-3-3",sq:`
1|Zacharie Boucher|GK|34|FRA|63
33|Patrick Beach|GK|23|AUS|62
40|Hillel Konaté|GK|31|BFA|61
2|Lucas Maronnier|RB|26|FRA|69
31|Noah Donkor|RB|19|FRA|61
44|Yvann Titi|RB|20|FRA|56
4|Michel Diaz|CB|23|CIV|70
6|Adrien Monfray|CB|35|FRA|62
3|Anis Ouzenadji|LB|19|FRA|62
5|Paolo Gozzi|CB|25|ITA|70
14|Ismaël Boura|LB|26|COM|66
8|Mouhamed Diop|DM|26|SEN|70
26|Alexandre Phliponeau|DM|26|FRA|64
11|Iron Gomis|CM|26|FRA|66
22|Hugo Picard|LW|23|FRA|63
9|Jérémy Le Douaron|AM|28|FRA|70
17|Antoine Mille|AM|29|FRA|63
29|Dermane Karim|AM|22|TOG|65
10|Merwan Ifnaou|RW|28|FRA|65
7|Kandet Diawara|LW|26|GUI|67
20|Renaud Ripart|ST|33|FRA|63
23|Timothé Nkada|ST|27|FRA|67
`},
{"lg": "SPL", "id": "HIL", "name": "Al-Hilal", "short": "Al-Hilal", "c1": "#0057b8", "c2": "#ffffff", "stadium": "Kingdom Arena", "cap": 26000, "mgr": "Simone Inzaghi", "capt": "Salem Al Dawsari", "rep": 86, "bal": 150, "form": "4-2-3-1",sq:`
37|Yassine Bounou|GK|35|MAR|83
33|Mohammed Al Owais|GK|35|KSA|62
17|Mohammed Al Yami|GK|29|KSA|72
2|Mohammed Mahzari|RB|24|KSA|77
88|Hamad Al Yami|RB|27|KSA|66
3|Kalidou Koulibaly|CB|35|SEN|80
4|Yusuf Akçiçek|CB|20|TUR|75
78|Ali Lajami|CB|30|KSA|67
87|Hassan Al Tambakti|CB|27|KSA|75
19|Théo Hernández|LB|29|FRA|83
24|Moteb Al Harbi|LB|26|KSA|74
8|Rúben Neves|DM|29|POR|83
6|Nasser Al Dawsari|CM|27|KSA|73
18|Murad Al Hawsawi|CM|25|KSA|72
22|Sergej Milinković-Savić|CM|31|SRB|83
28|Mohamed Kanno|CM|32|KSA|74
70|Saïmon Bouabré|AM|20|FRA|75
93|Abdullah Al Anazi|AM|23|KSA|69
96|Suhayb Al Zaid|RW|22|KSA|64
27|Sultan Mandash|RW|32|KSA|71
7|Gabriel Martinelli|LW|25|BRA|82
29|Salem Al Dawsari|LW|35|KSA|77
38|Crysencio Summerville|LW|25|NED|79
77|Nawaf Al Habashi|LW|28|KSA|69
11|Ollie Watkins|ST|30|ENG|82
75|Mohamed Meïté|ST|19|CIV|67
`},
{"lg": "SPL", "id": "NAS", "name": "Al-Nassr", "short": "Al-Nassr", "c1": "#ffd200", "c2": "#0b2a6f", "stadium": "Al-Awwal Park", "cap": 25000, "mgr": "Ange Postecoglou", "capt": "Cristiano Ronaldo", "rep": 85, "bal": 150, "form": "4-2-3-1",sq:`
24|Bento|GK|27|BRA|79
1|Nawaf Al Aqidi|GK|26|KSA|72
61|Mubarak Al Buainain|GK|21|KSA|62
2|Sultan Al Ghannam|RB|32|KSA|72
12|Nawaf Boushal|RB|27|KSA|68
3|Mohamed Simakan|CB|26|FRA|80
4|Nader Al Sharari|CB|30|KSA|75
5|Abdulelah Al Amri|CB|29|KSA|72
26|Iñigo Martínez|CB|35|ESP|78
6|Saad Al Nasser|LB|25|KSA|72
23|Aiman Yahya|LB|25|KSA|73
83|Salem Al Najdi|LB|23|KSA|64
11|Samú Costa|DM|25|POR|78
17|Abdullah Al Khaibari|CM|30|KSA|71
20|Ângelo|CM|21|BRA|76
21|Kingsley Coman|RW|30|FRA|80
10|Sadio Mané|LW|34|SEN|79
16|Mohammed Marran|AM|25|KSA|72
14|Sami Al Najei|RW|29|KSA|69
29|Abdulrahman Ghareeb|LW|29|KSA|68
7|Cristiano Ronaldo|ST|41|POR|82
9|Abdullah Al Hamdan|ST|27|KSA|71
79|João Félix|ST|26|POR|80
`},
{"lg": "SPL", "id": "AHL", "name": "Al-Ahli", "short": "Al-Ahli", "c1": "#00703c", "c2": "#ffffff", "stadium": "King Abdullah Sports City", "cap": 62345, "mgr": "Marino Pušić", "capt": "Roger Ibañez", "rep": 84, "bal": 130, "form": "4-2-3-1",sq:`
16|Édouard Mendy|GK|34|SEN|78
1|Abdulrahman Al Sanbi|GK|25|KSA|72
62|Abdullah Abdo|GK|24|KSA|61
27|Ali Majrashi|RB|27|KSA|70
29|Mohammed Abdulrahman|RB|23|KSA|68
3|Roger Ibañez|CB|27|BRA|79
5|Mohammed Sulaiman|CB|22|KSA|73
24|Abubacarr Kinteh|CB|19|GAM|66
28|Merih Demiral|CB|28|TUR|80
46|Rayan Hamed|CB|24|KSA|68
2|Zakaria Hawsawi|LB|25|KSA|75
31|Saad Yaslam|LB|26|KSA|71
4|Ibrahima Diaby|DM|19|FRA|74
6|Valentin Atangana|DM|21|FRA|74
30|Ziyad Al Johani|DM|24|KSA|69
25|Faisal Fallatah|CM|20|KSA|63
7|Trincão|AM|26|POR|80
8|Eduard Spertsyan|AM|26|ARM|78
19|Artem Bondarenko|AM|26|UKR|77
20|Matheus Gonçalves|AM|21|BRA|75
11|Meshal Al Mutairi|LW|27|KSA|75
13|Galeno|LW|28|BRA|79
47|Saleh Abu Al Shamat|LW|24|KSA|67
9|Feras Al Brikan|ST|26|KSA|73
17|Ivan Toney|ST|30|ENG|81
21|Abdullah Radif|ST|23|KSA|67
`},
{"lg": "SPL", "id": "ITT", "name": "Al-Ittihad", "short": "Al-Ittihad", "c1": "#ffd200", "c2": "#000000", "stadium": "King Abdullah Sports City", "cap": 62345, "mgr": "Jens Wissing", "capt": "Danilo Pereira", "rep": 84, "bal": 120, "form": "4-3-3",sq:`
1|Predrag Rajković|GK|30|SRB|78
50|Mohammed Al Absi|GK|24|KSA|64
88|Osama Al Mermesh|GK|23|KSA|66
13|Muhannad Al Shanqeeti|RB|27|KSA|67
32|Ahmed Al Julaydan|RB|22|KSA|65
2|Danilo Pereira|CB|35|POR|75
4|Jan-Carlo Šimić|CB|21|SRB|76
6|Saad Al Mosa|CB|23|KSA|74
15|Hassan Kadesh|CB|34|KSA|65
20|Ahmed Sharahili|CB|32|KSA|65
25|Faris Abdi|LB|27|KSA|70
42|Muath Fagihy|LB|24|KSA|67
5|Richard Ríos|DM|26|COL|80
17|Mahamadou Doumbia|DM|22|MLI|76
30|Dion Lopy|DM|24|SEN|77
80|Hamed Al Ghamdi|DM|27|KSA|65
8|Mukhtar Ali|CM|28|KSA|71
10|Houssem Aouar|AM|28|ALG|78
22|Marwan Al Sahafi|RW|22|KSA|72
7|Roger Fernandes|LW|20|POR|76
34|Steven Bergwijn|LW|29|NED|77
23|Georginio Wijnaldum|AM|35|NED|74
9|George Ilenikhena|ST|20|NGA|67
11|Saleh Al Shehri|ST|32|KSA|72
21|Youssef En-Nesyri|ST|29|MAR|79
`},
{"lg": "SPL", "id": "QAD", "name": "Al-Qadsiah", "short": "Al-Qadsiah", "c1": "#c8102e", "c2": "#ffd700", "stadium": "Prince Saud bin Jalawi Stadium", "cap": 26000, "mgr": "Brendan Rodgers", "capt": "Nacho", "rep": 80, "bal": 120, "form": "4-3-3",sq:`
1|Koen Casteels|GK|34|BEL|79
28|Ahmed Al Kassar|GK|35|KSA|61
50|Meshari Sunyur|GK|24|KSA|60
4|Jehad Thakri|CB|25|KSA|72
6|Nacho|CB|36|ESP|76
12|Yasser Al Shahrani|LB|34|KSA|68
17|Gastón Álvarez|CB|26|URU|76
23|Waleed Al Ahmad|CB|27|KSA|70
26|Ali Diabaté|CB|19|CIV|68
15|Mohammed Al Qahtani|LB|24|KSA|68
24|Mohammed Qassim|DM|31|KSA|67
5|Julian Weigl|CM|31|GER|76
8|Nahitan Nández|CM|30|URU|76
10|Musab Al Juwayr|CM|23|KSA|73
11|Ali Hazazi|CM|32|KSA|71
14|Tijjani Reijnders|CM|28|NED|84
18|Abdulmalik Al Jaber|CM|22|KSA|62
2|Mohammed Abu Al Shamat|RW|24|KSA|70
7|Turki Al Ammar|LW|27|KSA|72
22|Christopher Bonsu Baah|LW|21|GHA|76
9|Abdullah Al Salem|ST|33|KSA|73
19|Haitham Asiri|ST|25|KSA|66
30|Mahamadou Sangaré|ST|19|FRA|65
32|Mateo Retegui|ST|27|ITA|81
33|Julián Quiñones|ST|29|MEX|79
`},
{"lg": "SPL", "id": "SHB", "name": "Al-Shabab", "short": "Al-Shabab", "c1": "#ffffff", "c2": "#000000", "stadium": "Prince Faisal bin Fahd Stadium", "cap": 22500, "mgr": "Thomas Letsch", "capt": "Ali Al Bulayhi", "rep": 76, "bal": 50, "form": "4-2-3-1",sq:`
1|Mory Diaw|GK|33|SEN|73
33|Mohammed Al Mahasnah|GK|29|KSA|64
23|Abdulaziz Al Awardi|GK|24|KSA|62
17|Mohammed Al Thani|RB|29|KSA|62
27|Abdullah Al Hawsawi|RB|30|KSA|63
14|Ali Al Bulayhi|CB|36|KSA|61
2|Mohammed Al Shwirekh|CB|28|KSA|71
3|Mamadou Barry|CB|21|SEN|69
4|Tin Jedvaj|CB|30|CRO|72
5|Ali Makki|CB|27|KSA|69
15|Lazar Stojanović|LB|21|SRB|66
21|Dhari Al Anazi|LB|26|KSA|64
6|Awad Al Nashri|DM|24|KSA|66
8|Josh Brownhill|DM|30|ENG|75
18|Thomas Partey|CM|33|GHA|78
29|Yacine Adli|CM|26|FRA|76
40|Ali Al Asmari|CM|29|KSA|64
22|Hammam Al Hammami|RW|22|KSA|59
24|Abdulrahman Al Obud|RW|31|KSA|63
55|Abdullah Matuq|RW|23|KSA|58
10|Yannick Carrasco|LW|33|BEL|77
11|Daniel Podence|LW|31|POR|76
9|Roger Martínez|ST|32|COL|74
49|Ricardo Mathias|ST|20|BRA|61
97|Morad Khodari|ST|23|KSA|61
`},
{"lg": "SPL", "id": "ETT", "name": "Al-Ettifaq", "short": "Al-Ettifaq", "c1": "#00843d", "c2": "#e2001a", "stadium": "Prince Mohamed bin Fahd Stadium", "cap": 26000, "mgr": "Arthur Papas", "capt": "Jack Hendry", "rep": 74, "bal": 40, "form": "4-3-3",sq:`
1|Marek Rodák|GK|29|SVK|74
23|Ahmad Al Harbi|GK|32|KSA|59
61|Radhi Al Otaibi|RB|26|KSA|58
3|Abdullah Madu|CB|33|KSA|68
4|Jack Hendry|CB|31|SCO|72
5|Pedro Henrique|CB|31|BRA|68
70|Abdullah Khateeb|CB|31|KSA|60
78|Marzouq Tambakti|CB|23|KSA|58
13|Meshal Al Alaeli|LB|22|KSA|59
33|Madallah Al Olayan|LB|32|KSA|64
87|Meshal Sibyani|LB|25|KSA|61
42|Abdoulaye Kanté|DM|21|CIV|62
10|Álvaro Medrán|CM|32|ESP|73
11|Ondrej Duda|CM|31|SVK|75
26|Riyadh Sharahili|CM|33|KSA|62
77|Abdulelah Hawsawi|CM|25|KSA|57
58|Yasir Shammari|AM|22|KSA|57
17|Jordan Larsson|RW|29|SWE|74
24|Jalal Al Salem|RW|21|KSA|57
7|Khalid Al Ghannam|LW|25|KSA|65
43|Bersant Celina|LW|30|KOS|72
9|Moussa Dembélé|ST|30|FRA|76
71|Matija Gluščević|ST|22|SRB|59
20|Abdulhakim Maghfori|ST|20|KSA|54
`},
{"lg": "SPL", "id": "TAA", "name": "Al-Taawoun", "short": "Al-Taawoun", "c1": "#ffd200", "c2": "#003b6f", "stadium": "King Abdullah Sport City Stadium", "cap": 25000, "mgr": "Vuk Rašović", "capt": "Mohammed Al Kuwaykibi", "rep": 73, "bal": 35, "form": "4-2-3-1",sq:`
1|Mailson|GK|30|BRA|74
30|Abdullah Al Jadani|GK|35|KSA|55
25|Abdulrahman Al Senaid|GK|20|KSA|55
6|Bassam Al Hurayji|RB|26|KSA|64
70|Abdulrahman Hindi|RB|23|KSA|56
5|Zineddine Belaïd|CB|27|ALG|71
32|Muteb Al Mufarrij|CB|30|KSA|60
40|Ibrahim Mahnashi|CB|26|KSA|62
44|Nasser Al Haleel|CB|26|KSA|60
55|Jair Collahuazo|CB|20|ECU|58
93|Awn Al Saluli|LB|28|KSA|58
19|Oscar Dorley|DM|28|LBR|67
4|Mustapha Samb|CM|21|SEN|67
16|Faris Al Ghamdi|CM|23|KSA|62
18|Aschraf El Mahdioui|DM|30|MAR|72
20|Bassem Al Arini|AM|22|KSA|62
23|Rakan Al Tulayhi|AM|23|KSA|61
88|Marin Petkov|RW|23|BUL|60
7|Mohammed Al Kuwaykibi|RW|31|KSA|66
8|Parfait Guiagon|LW|25|CIV|73
14|Saif Rajab|LW|21|KSA|61
9|Abderrazak Hamdallah|ST|35|MAR|73
10|Nedim Bajrami|ST|27|ALB|73
17|Mohammed Al Aqel|ST|26|KSA|65
47|Younes El Bahraoui|ST|21|MAR|63
`},
{"lg": "SPL", "id": "NEO", "name": "NEOM", "short": "NEOM", "c1": "#3b2a72", "c2": "#ffffff", "stadium": "NEOM Stadium", "cap": 15000, "mgr": "Christophe Galtier", "capt": "Alexandre Lacazette", "rep": 72, "bal": 60, "form": "4-3-3",sq:`
1|Marcin Bułka|GK|27|POL|78
81|Luís Maximiano|GK|27|POR|74
33|Abdulrahman Dagriri|GK|36|KSA|59
2|Mohammed Al Burayk|RB|34|KSA|65
4|Khalifah Al Dawsari|RB|27|KSA|66
15|Abdulmalik Al Oyayari|RB|22|KSA|57
5|Malang Sarr|CB|27|SEN|74
44|Nathan Zézé|CB|21|FRA|75
55|Mohammed Al Dossary|CB|25|KSA|59
27|Islam Hawsawi|LB|24|KSA|65
19|Mohannad Abu Taha|LB|23|JOR|70
6|Abbas Al Hassan|CM|22|KSA|66
8|Faisal Al Ghamdi|CM|25|KSA|68
18|Alaa Al Hejji|CM|30|KSA|64
23|Valentín Vada|CM|30|ARG|73
72|Amadou Koné|CM|21|CIV|61
24|Abdulaziz Noor|RW|27|KSA|62
77|Muhannad Al Saad|RW|23|KSA|59
7|Giorgos Masouras|LW|32|GRE|72
10|Saïd Benrahma|LW|31|ALG|76
14|Khalil Al Absi|LW|25|KSA|63
9|Abdulaziz Al Othman|ST|22|KSA|64
70|Haroune Camara|ST|28|KSA|57
91|Alexandre Lacazette|ST|35|FRA|77
`},
{"lg": "SPL", "id": "KHA", "name": "Al-Khaleej", "short": "Al-Khaleej", "c1": "#ffd200", "c2": "#00843d", "stadium": "Prince Mohamed bin Fahd Stadium", "cap": 26000, "mgr": "José Gomes", "capt": "Majed Kanabah", "rep": 71, "bal": 25, "form": "4-2-3-1",sq:`
49|Anthony Moris|GK|36|LUX|72
96|Marwan Al Haidari|GK|30|KSA|60
1|Mohammed Ibrahim|GK|21|KSA|58
2|Hamad Al Jayzani|RB|33|KSA|64
27|Fawaz Al Soqoor|RB|30|KSA|65
3|Mohammed Al Khabrani|CB|33|KSA|66
4|Kiki Kouyaté|CB|29|MLI|72
13|Ahmed Asiri|CB|34|KSA|63
14|Ali Al Shaafi|CB|24|KSA|62
17|Abdullah Al Hafith|CB|33|KSA|62
5|Pedro Rebocho|LB|31|POR|72
26|Raed Al Shanqiti|LB|20|KSA|58
8|Omar Mascarell|DM|33|EQG|72
10|Angelo Fulgini|CM|30|FRA|74
12|Majed Kanabah|CM|33|KSA|63
15|Mansour Hamzi|CM|34|KSA|63
16|Bader Munshi|CM|27|KSA|65
19|Miguel Crespo|CM|30|POR|72
11|Saleh Al Amri|RW|33|KSA|62
28|Hussain Al Eissa|LW|25|KSA|66
18|Nawaf Al Saadi|RW|26|KSA|64
7|Joshua King|ST|34|NOR|71
9|Mateo Benegas|ST|20|ARG|66
99|Musa Barrow|ST|27|GAM|73
`},
{"lg": "SPL", "id": "FAT", "name": "Al-Fateh", "short": "Al-Fateh", "c1": "#0060a8", "c2": "#ffffff", "stadium": "Al-Fateh Club Stadium", "cap": 20000, "mgr": "Jamal Sellami", "capt": "Mourad Batna", "rep": 71, "bal": 25, "form": "4-2-3-1",sq:`
1|Adrian Šemper|GK|28|CRO|73
31|Habib Al Watyan|GK|30|KSA|60
94|Waleed Al Anzi|GK|30|KSA|59
22|Abdulrahman Al Khaibari|RB|26|KSA|65
3|Kennedy Boateng|CB|29|TOG|73
4|Ziyad Al Jari|CB|24|KSA|68
5|Faisal Darisi|CB|29|KSA|68
17|Marwane Saadane|CB|34|MAR|63
19|Robin Kelder|CB|21|NED|64
16|Abdulelah Al Khaibari|LB|29|KSA|65
8|Mihai Lixandru|DM|25|ROU|73
28|Zaydou Youssouf|DM|27|COM|74
6|Ali Al Hassan|CM|29|KSA|66
20|Hossam Essadak|CM|21|MAR|65
70|Jordan Harrison|CM|24|AUS|64
27|Ali Alamine Ali|RW|21|FRA|62
88|Othman Al Othman|RW|23|KSA|61
87|Sattam Al Tumbukti|LW|25|KSA|57
29|Ali Al Masoud|RW|22|KSA|57
10|Lukáš Haraslín|LW|30|SVK|73
23|Sorriso|LW|21|BRA|67
7|Fahad Al Zubaidi|ST|24|KSA|66
9|Wilfried Kanga|ST|28|CIV|72
11|Mourad Batna|ST|36|MAR|72
21|Jefferson Ramos|ST|21|CPV|64
`},
{"lg": "SPL", "id": "FAY", "name": "Al-Fayha", "short": "Al-Fayha", "c1": "#f58220", "c2": "#003b6f", "stadium": "Al Majma'ah Sports City", "cap": 7000, "mgr": "Fábio Carille", "capt": "Paulo Oliveira", "rep": 70, "bal": 20, "form": "4-2-3-1",sq:`
52|Orlando Mosquera|GK|31|PAN|72
1|Abdulraouf Al Duqayl|GK|31|KSA|62
13|Sattam Al Shammari|GK|22|KSA|58
22|Mohammed Al Baqawi|RB|31|KSA|63
2|Makhir Al Rashidi|CB|27|KSA|65
15|Paulo Oliveira|CB|34|POR|64
21|Ziyad Al Sahafi|CB|32|KSA|63
25|Omar Colley|CB|33|GAM|70
12|Turki Al Jaadi|LB|23|KSA|59
24|Ahmed Bamasud|LB|30|KSA|60
47|Mohammed Al Dowaish|RB|22|KSA|54
5|Hugo Moura|DM|28|BRA|72
30|Alfa Semedo|DM|29|GNB|64
7|Nawaf Al Harthi|CM|27|KSA|63
29|Al Baraa Adawi|CM|22|KSA|56
40|Yago|CM|20|BRA|53
20|Abdullah Al Qahtani|LW|27|KSA|59
14|Mansor Al Beshe|AM|26|KSA|61
77|Rayan Enad|RW|25|KSA|55
27|Sultan Al Jabri|RW|26|KSA|63
10|Fashion Sakala|LW|29|ZAM|72
9|Malek Al Abdulmenem|ST|28|KSA|66
17|Lázaro|ST|24|BRA|64
23|Jason|ST|32|ESP|66
`},
{"lg": "SPL", "id": "KHO", "name": "Al-Kholood", "short": "Al-Kholood", "c1": "#e2001a", "c2": "#ffd700", "stadium": "Al Hazem Club Stadium", "cap": 8000, "mgr": "Des Buckingham", "capt": "John Buckley", "rep": 69, "bal": 20, "form": "4-2-3-1",sq:`
30|Mohammed Al Shammari|GK|34|KSA|56
1|Hamed Al Shanqiti|GK|21|KSA|63
48|Muhannad Al Yahya|GK|22|KSA|54
15|Ramzi Solan|RB|28|KSA|61
24|Odai Slimani|RB|21|KSA|57
5|Edgaras Utkus|CB|26|LTU|70
25|Mansour Camara|CB|19|GUI|59
38|Shaquille Pinas|CB|28|SUR|67
47|Abdulrahman Al Obaid|CB|22|KSA|57
7|Sultan Al Shehri|LB|31|KSA|68
8|Seydouba Cissé|DM|25|GUI|70
6|John Buckley|CM|27|ENG|70
39|Abdulrahman Al Dosari|CM|29|KSA|65
26|Yaseen Al Zubaidi|RW|23|KSA|65
70|Muhammad Sawaan|LW|26|KSA|60
10|Iker Kortajarena|AM|26|ESP|72
17|Adam Berry|AM|20|ENG|58
67|Mohammed Al Rashdi|AM|24|KSA|56
77|Antoine Essomba|RW|22|CMR|59
11|Coba da Costa|LW|24|GNB|67
18|Ramiro Enrique|ST|25|ARG|72
22|Julien Domingues|ST|30|FRA|65
99|Guga|ST|20|BRA|53
`},
{"lg": "SPL", "id": "RIY", "name": "Al-Riyadh", "short": "Al-Riyadh", "c1": "#e2001a", "c2": "#000000", "stadium": "Prince Faisal bin Fahd Stadium", "cap": 22500, "mgr": "Maurício Dulac", "capt": "Yahia Al Shehri", "rep": 69, "bal": 20, "form": "4-2-3-1",sq:`
82|Milan Borjan|GK|39|CAN|70
97|Emad Fidaa|GK|29|KSA|56
28|Jan Petek|GK|20|SVN|54
2|Sultan Al Essa|RB|21|KSA|61
13|Osama Al Bawardi|RB|27|KSA|62
17|Abdullah Tarmin|RB|29|KSA|58
5|Hussam Majrashi|CB|22|KSA|63
26|Rodrigo Abascal|CB|32|URU|66
67|Mohammed Al Khaibari|CB|24|KSA|54
3|Yasser Al Musa|LB|23|KSA|64
23|Hussain Qassem|LB|29|KSA|62
22|Victor Lekhal|DM|32|ALG|64
6|Kader Keïta|CM|25|CIV|70
16|Faisal Al Subhi|CM|27|KSA|64
20|Tozé|CM|33|POR|66
43|Bernard Mensah|CM|32|GHA|61
11|Hassan Al Ali|RW|24|KSA|64
88|Yahia Al Shehri|LW|36|KSA|54
19|Hussain Al Shurafaa|AM|24|KSA|58
10|Teddy Okou|RW|28|FRA|65
7|Trézéguet|LW|32|EGY|72
14|Essam Bahri|LW|21|KSA|61
32|Luca Ramírez|ST|20|ARG|60
77|Leandro Antunes|ST|29|POR|61
`},
{"lg": "SPL", "id": "HAZ", "name": "Al-Hazem", "short": "Al-Hazem", "c1": "#e2001a", "c2": "#ffffff", "stadium": "Al Hazem Club Stadium", "cap": 8000, "mgr": "Jalel Kadri", "capt": "Amir Sayoud", "rep": 68, "bal": 15, "form": "4-2-3-1",sq:`
36|Jindřich Staněk|GK|30|CZE|73
14|Bruno Varela|GK|32|CPV|63
33|Majed Al Ghamdi|GK|28|KSA|56
2|Saud Al Rashed|RB|28|KSA|67
82|Abdulaziz Al Harbi|RB|23|KSA|60
4|Sultan Tanker|CB|28|KSA|65
5|Mohammed Issa|CB|24|KSA|64
8|Mory Konaté|CB|32|GUI|68
13|Abdullah Al Shanqiti|CB|27|KSA|62
3|Mohamed Amine Ben Hmida|LB|30|TUN|68
12|Farhan Al Azmi|LB|31|KSA|63
27|Ahmed Al Nakhli|LB|24|KSA|61
17|Bonheur Mugisha|DM|26|RWA|67
6|Khalid Al Subaie|CM|27|KSA|64
24|Aboubacar Bah|CM|21|GUI|60
28|Sofiane Bendebka|AM|34|ALG|66
10|Amir Sayoud|RW|36|ALG|66
22|Abdulaziz Al Dhuwayhi|RW|26|KSA|61
98|Ayman Al Hujaili|RW|28|KSA|55
7|Elton Acolatse|LW|31|NED|69
21|Amadou Bamba Dieng|ST|21|SEN|65
77|Mohammed Al Hamdani|LW|25|KSA|56
9|Afimico Pululu|ST|27|COD|67
11|Waleed Al Shanqiti|ST|32|KSA|60
`},
{"lg": "SPL", "id": "ABH", "name": "Abha", "short": "Abha", "c1": "#00843d", "c2": "#ffffff", "stadium": "Prince Sultan bin Abdul Aziz Stadium", "cap": 20000, "mgr": "Damir Burić", "capt": "Nabil Fekir", "rep": 67, "bal": 15, "form": "4-2-3-1",sq:`
16|Donovan Léon|GK|34|FRA|64
21|Abdulrahman Al Bouq|GK|27|KSA|58
26|Mustafa Malayekah|GK|40|KSA|53
23|Mohammed Al Dossary|RB|27|KSA|60
66|Nawaf Al Ghulaimish|RB|21|KSA|55
3|Juriën Gaari|CB|32|CUW|69
19|Abdullah Al Fahad|CB|32|KSA|61
22|Abdou Diallo|CB|30|SEN|67
37|Abdulbasit Hindi|CB|29|KSA|61
12|Khaled Al Shamrani|LB|27|KSA|57
29|Majed Dawran|RB|23|KSA|60
80|Safwan Al Johani|LB|23|KSA|54
4|Basil Al Sayyali|DM|25|KSA|66
6|Faisal Al Subiani|DM|23|KSA|61
7|Feras Al Ghamdi|DM|26|KSA|62
8|Nasser Al Daajani|DM|29|KSA|60
32|Loreintz Rosier|CM|28|FRA|62
55|Mateo Borrell|CM|20|ARG|54
17|Abdulkarim Darisi|RW|23|KSA|62
14|Georges-Kévin N'Koudou|LW|31|CMR|62
10|Nabil Fekir|AM|33|FRA|75
11|Alimami Gory|RW|30|MLI|69
28|Bader Al Mutairi|RW|22|KSA|60
20|Keshim Al Qahtani|ST|26|KSA|57
44|Michy Batshuayi|ST|33|BEL|74
`},
{"lg": "SPL", "id": "FAI", "name": "Al-Faisaly", "short": "Al-Faisaly", "c1": "#ffd200", "c2": "#000000", "stadium": "Al Majma'ah Sports City", "cap": 7000, "mgr": "Giovanni Solinas", "capt": "Mohammed Jahfali", "rep": 67, "bal": 15, "form": "4-2-3-1",sq:`
1|Fernando Pacheco|GK|34|ESP|72
26|Mohammed Al Hasawi|GK|37|KSA|57
21|Abdulelah Nassief|GK|20|KSA|51
2|Yaseen Barnawi|RB|33|KSA|64
3|Khalid Al Harbi|RB|24|KSA|66
4|Abdoulaye Seck|CB|34|SEN|63
5|Andrei Girotto|CB|34|BRA|64
70|Mohammed Jahfali|CB|36|KSA|55
87|Abdullah Bin Subayt|CB|22|KSA|55
50|Mohammed Al Shanqiti|LB|27|KSA|55
6|Eid Al Muwallad|DM|24|KSA|62
18|Mohammed Al Aqeel|DM|29|KSA|62
20|Jaime Seoane|DM|29|ESP|65
16|Jaber Issa|CM|29|KSA|62
8|Flávio|CM|30|BRA|68
77|Abdulrahman Al Sharif|CM|29|KSA|55
10|Ibrahima Ndiaye|RW|28|SEN|67
13|Christian Bassogog|RW|31|CMR|64
11|André-Jordy Ella|LW|21|GAB|62
14|Abdullah Al Mogren|AM|29|KSA|60
30|Théo Bongonda|RW|30|COD|74
7|Yousef Al Shammari|ST|28|KSA|64
19|Alexandre Mendy|ST|32|GNB|62
71|Ahmed Abdu|ST|30|KSA|58
`},
{"lg": "SPL", "id": "DIR", "name": "Al-Diriyah", "short": "Al-Diriyah", "c1": "#8b5a2b", "c2": "#ffffff", "stadium": "Prince Faisal bin Fahd Stadium", "cap": 22500, "mgr": "Bruno Lage", "capt": "Idrissa Gana Gueye", "rep": 70, "bal": 60, "form": "4-2-3-1",sq:`
1|Waleed Abdullah|GK|39|KSA|59
25|Berat Djimsiti|CB|33|ALB|75
19|Chancel Mbemba|CB|32|COD|75
4|Qasem Lajami|CB|30|KSA|64
2|Abdulaziz Al Faraj|RB|26|KSA|65
13|Hussain Al Sibyani|LB|27|KSA|64
27|Idrissa Gana Gueye|DM|37|SEN|74
10|Enzo Millot|AM|24|FRA|79
8|Óscar Rodríguez|AM|28|ESP|74
7|Adil Boulbina|LW|23|ALG|74
9|Darwin Núñez|ST|27|URU|81
`},
];
