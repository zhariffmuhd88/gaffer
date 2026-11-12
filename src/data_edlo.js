// ===== DATA: Eredivisie (top flight only) and EFL League One 2026/27. Squads and head coaches: FotMob team pages (12 Nov 2026);
// some ages are estimates (clubs whose FotMob page listed no ages). Club lists, stadiums and capacities: Wikipedia 2026-27 season pages.
// Ratings, colours, reputations and budgets (£m) are game estimates.
const EDLO_CLUBS = [
{"lg": "ED", "id": "PSV", "name": "PSV Eindhoven", "short": "PSV", "c1": "#ed1c24", "c2": "#ffffff", "stadium": "Philips Stadion", "cap": 35000, "mgr": "Peter Bosz", "capt": "Jerdy Schouten", "rep": 82, "bal": 45, "form": "4-3-3",sq:`
32|Matěj Kovár|GK|26|CZE|76
8|Sergiño Dest|RB|26|USA|78
25|Kilian Sildillia|RB|24|FRA|73
2|Lutsharel Geertruida|CB|26|NED|77
3|Yarek Gąsiorowski|CB|21|ESP|74
4|Armando Obispo|CB|27|CUW|74
6|Ryan Flamingo|CB|23|NED|77
22|Jerdy Schouten|CB|29|NED|78
39|Adamo Nagalo|CB|24|BFA|74
17|Mauro Júnior|LB|27|BRA|75
18|Filip Kostić|LB|34|SRB|74
10|Paul Wanner|DM|20|AUT|78
24|Kodai Sano|DM|23|JPN|75
20|Guus Til|AM|28|NED|78
21|Sven Mijnans|AM|26|NED|77
42|Shuryjano Cornecion|AM|18|NED|58
19|Esmir Bajraktarević|RW|21|BIH|75
27|Dennis Man|RW|28|ROU|77
5|Ivan Perišić|LW|37|CRO|77
7|Ruben van Bommel|LW|22|NED|77
37|Amir Bouhamdi|LW|18|MAR|64
9|Sam Lammers|ST|29|NED|73
11|Ricardo Pepi|ST|23|USA|77
14|Alassane Pléa|ST|33|FRA|74
`},
{"lg": "ED", "id": "AJX", "name": "Ajax", "short": "Ajax", "c1": "#ffffff", "c2": "#d2122e", "stadium": "Johan Cruyff Arena", "cap": 55865, "mgr": "Míchel", "capt": "Davy Klaassen", "rep": 82, "bal": 45, "form": "4-3-3",sq:`
1|Marc ter Stegen|GK|34|GER|80
26|Maarten Paes|GK|28|IDN|75
2|Lucas Rosa|RB|26|BRA|75
3|Anton Gaaei|RB|23|DEN|74
6|Thilo Kehrer|CB|30|GER|76
15|Youri Baas|CB|23|NED|77
17|Daley Blind|CB|36|NED|73
30|Aaron Bouwman|CB|19|NED|67
36|Dies Janse|CB|20|NED|67
5|Owen Wijndal|LB|26|NED|73
12|Caio Henrique|LB|29|BRA|75
21|Jofre Torrents|LB|19|ESP|68
7|Simon Adingra|LW|24|CIV|76
28|Yves Bissouma|DM|30|MLI|78
4|Sofyan Amrabat|CM|30|MAR|77
10|Oscar Gloukh|CM|22|ISR|79
18|Davy Klaassen|CM|33|NED|74
24|Jorthy Mokio|CM|18|COD|74
8|Julian Brandt|AM|30|GER|79
68|Abdellah Ouazane|AM|17|MAR|60
11|Viktor Tsigankov|RW|28|UKR|77
23|Steven Berghuis|RW|34|NED|75
43|Rayane Bounida|RW|20|MAR|72
20|Oliver Edvardsen|LW|27|NOR|74
9|Kasper Dolberg|ST|29|DEN|77
38|Marcos Leonardo|ST|23|BRA|77
99|Tolu Arokodare|ST|25|NGA|76
`},
{"lg": "ED", "id": "FEY", "name": "Feyenoord", "short": "Feyenoord", "c1": "#e2001a", "c2": "#ffffff", "stadium": "De Kuip", "cap": 47500, "mgr": "Giovanni van Bronckhorst", "capt": "Luciano Valente", "rep": 81, "bal": 40, "form": "4-3-3",sq:`
1|Tjark Ernst|GK|23|GER|74
33|Florian Kastenmeier|GK|29|GER|71
37|Mannou Berger|GK|22|NED|69
39|Liam Bossin|GK|30|IRL|67
2|Kwame Tabiri|RB|20|NED|68
3|Bart Nieuwkoop|RB|30|NED|72
20|Mats Deijl|RB|29|NED|73
26|Givairo Read|RB|20|NED|77
4|Thomas Beelen|CB|25|NED|74
5|Tsuyoshi Watanabe|CB|29|JPN|76
6|Jeremiah St. Juste|CB|30|NED|74
24|Thijs Kraaijeveld|CB|19|NED|67
32|Tijme Wessels|CB|19|NED|65
35|Mika Mármol|CB|25|ESP|74
72|Hakeem Agboluaje|CB|19|NED|60
7|Gijs Smal|LB|29|NED|74
15|Jordan Bos|LB|24|AUS|74
16|Javi López|LB|24|ESP|72
10|Luciano Valente|DM|23|NED|77
28|Oussama Targhalline|DM|24|MAR|75
34|Charles Vanhoutte|DM|28|BEL|73
8|Jakub Moder|CM|27|POL|76
9|Gjivai Zechiël|CM|22|NED|76
14|Sem Steijn|AM|24|NED|77
79|Ilai Grootfaam|RW|16|NED|56
23|Anis Hadj Moussa|RW|24|ALG|78
49|Shaqueel van Persie|RW|19|NED|65
11|Gonçalo Borges|LW|25|POR|75
17|Reiss Nelson|LW|26|ENG|75
22|Tobias van den Elshout|LW|19|NED|63
27|Gaoussou Diarra|LW|23|MLI|72
36|Jivayno Zinhagel|LW|17|NED|62
50|Theodoros Delianidis|ST|20|GRE|65
19|Nacho Ferri|ST|22|ESP|72
`},
{"lg": "ED", "id": "AZ", "name": "AZ Alkmaar", "short": "AZ", "c1": "#d5001c", "c2": "#ffffff", "stadium": "AFAS Stadion", "cap": 19478, "mgr": "Leeroy Echteld", "capt": "Jordy Clasie", "rep": 77, "bal": 25, "form": "4-3-3",sq:`
1|Rome Owusu-Oduro|GK|22|NED|74
12|Hobie Verhulst|GK|33|NED|64
28|Jari De Busser|GK|27|BEL|67
41|Jeroen Zoet|GK|35|NED|58
71|Jur Schipper|GK|20|NED|59
2|Seiya Maikuma|RB|29|JPN|74
22|Elijah Dijkstra|RB|20|NED|64
30|Denso Kasius|RB|24|NED|73
3|Wouter Goes|CB|22|NED|75
4|Lewis Schouten|CB|22|NED|67
29|Wesley Hoedt|CB|32|NED|73
5|Mateo Chávez|LB|22|MEX|75
34|Mees de Wit|LB|28|NED|73
6|Peer Koopmeiners|DM|26|NED|75
8|Jordy Clasie|DM|35|NED|72
16|Stije Resink|DM|23|NED|73
21|Dave Kwakman|DM|22|NED|68
56|Rio Robbemond|DM|21|NED|63
10|Kees Smit|CM|20|NED|79
17|Valdemar Byskov|AM|21|DEN|73
7|Weslley Pinto|RW|23|BRA|74
14|Calvin Stengs|RW|27|NED|75
24|Ayoub Oufkir|RW|20|MAR|62
11|Ro-Zangelo Daal|LW|22|NED|74
27|Wassim Bouziane|LW|19|NED|62
9|Mexx Meerdink|ST|23|NED|76
19|Jizz Hornkamp|ST|28|NED|72
`},
{"lg": "ED", "id": "TWE", "name": "FC Twente", "short": "Twente", "c1": "#e2001a", "c2": "#ffffff", "stadium": "De Grolsch Veste", "cap": 30205, "mgr": "John van den Brom", "capt": "Robin Pröpper", "rep": 74, "bal": 18, "form": "4-2-3-1",sq:`
2|Issam El Maach|GK|26|MAR|69
1|Lars Unnerstall|GK|36|GER|72
16|Joël Drommel|GK|29|NED|68
22|Remko Pasveer|GK|43|NED|66
31|Yannick Gerritsen|GK|20|NED|63
28|Bart van Rooij|RB|25|NED|73
44|Juliën Mesbahi|RB|20|NED|57
3|Bjorn Titulaer|CB|18|NED|62
4|Robin Pröpper|CB|33|NED|72
5|Ruud Nijstad|CB|18|NED|62
23|Stav Lemkin|CB|23|ISR|69
38|Max Bruns|CB|24|NED|70
39|Jip Meilink|CB|19|NED|60
24|Krzysztof Kurowski|LB|20|POL|62
29|Aske Adelgaard|LB|22|DEN|65
6|Michał Rosiak|RB|21|POL|68
7|Ramiz Zerrouki|DM|28|ALG|74
8|Daouda Weidmann|DM|23|FRA|73
18|Jordy Bawuah|DM|19|BEL|65
20|Thomas van den Belt|DM|25|NED|71
26|Benjamin Nagel|CM|18|NED|60
41|Gijs Besselink|CM|22|NED|59
10|Younes Taha|AM|23|MAR|74
14|Kristian Hlynsson|AM|22|ISL|73
9|Marko Pjaca|RW|31|CRO|72
11|Daan Rots|RW|25|NED|74
27|Sondre Ørjasæter|LW|22|NOR|62
36|Nigel Groenewald|ST|19|NED|59
37|Naci Ünüvar|LW|23|NED|73
12|Wout Weghorst|ST|34|NED|75
17|Filip Thorvaldsen|ST|20|NOR|62
25|Lucas Vennegoor of Hesselink|ST|20|NED|61
`},
{"lg": "ED", "id": "UTR", "name": "FC Utrecht", "short": "Utrecht", "c1": "#d2001a", "c2": "#ffffff", "stadium": "Stadion Galgenwaard", "cap": 23750, "mgr": "Anthony Correia", "capt": "", "rep": 73, "bal": 15, "form": "4-2-3-1",sq:`
1|Vasilios Barkas|GK|32|GRE|74
22|Sergio Padt|GK|36|NED|63
31|Mees Eppink|GK|20|NED|57
33|Kevin Gadellaa|GK|23|NED|67
2|Siebe Horemans|RB|28|BEL|73
23|Niklas Vesterlund|RB|27|DEN|66
3|Matisse Didden|CB|25|BEL|73
5|Nikolas Panayiotou|CB|26|CYP|72
6|Guus Offerhaus|CB|25|NED|71
18|Jakov Medić|CB|28|CRO|70
21|Neville Ogidi Nwankwo|CB|24|NED|67
32|Per Kloosterboer|CB|21|NED|67
92|Arthur Zagré|LB|25|BFA|65
8|Joris van Overeem|DM|32|NED|72
27|Alonzo Engwanda|DM|23|BEL|65
38|Oualid Agougil|DM|21|NED|64
7|Victor Jensen|CM|26|DEN|74
34|Davy van den Berg|CM|26|NED|67
46|Jaygo van Ommeren|CM|18|NED|57
20|Dani de Wit|AM|28|NED|73
11|Ángel Alarcón|RW|22|ESP|73
26|Miliano Jonathans|RW|22|IDN|73
39|Nordin Amrabat|RW|39|MAR|64
80|Marius Broholm|RW|21|NOR|60
30|Kevin Paredes|LW|23|USA|73
10|Yoann Cathline|LW|24|FRA|74
15|Adrian Blake|LW|21|ENG|63
9|Artem Stepanov|ST|19|UKR|68
17|Sem van Duijn|ST|22|NED|63
29|Noah Ohio|ST|23|NED|73
`},
{"lg": "ED", "id": "NEC", "name": "NEC Nijmegen", "short": "NEC", "c1": "#c8102e", "c2": "#00843d", "stadium": "Goffertstadion", "cap": 12650, "mgr": "Dick Schreuder", "capt": "Tjaronn Chery", "rep": 70, "bal": 10, "form": "3-4-2-1",sq:`
2|Martijn Overmars|GK|20|NED|56
1|Gonzalo Crettaz|GK|26|ARG|72
12|Nikolas Polster|GK|24|AUT|61
36|Freek Entius|GK|20|NED|59
38|Joep Geneste|GK|19|NED|55
3|Philippe Sandler|CB|29|NED|72
4|Perr Schuurs|CB|26|NED|74
17|Bram Nuytinck|CB|36|NED|59
21|Tobias Storm|CB|22|DEN|65
22|Ahmetcan Kaplan|CB|23|TUR|68
24|Deveron Fonville|CB|23|CUW|68
37|Merijn van de Wiel|CB|20|NED|62
42|Yassin Moslih|CB|19|NED|57
44|Mees Rensen|CB|16|NED|56
73|Gabriel Brás|CB|22|POR|56
5|Mitchel Bakker|CB|26|NED|71
66|Almugera Kabar|CB|20|GER|55
7|Emre Mor|RW|29|TUR|72
34|Kevin Kers|RB|20|NED|58
99|Clement Bischoff|LB|20|DEN|57
6|Darko Nejašmić|DM|27|CRO|72
8|Isak Hansen-Aarøen|DM|22|NOR|64
9|Tjaronn Chery|AM|38|SUR|72
10|Dušan Tadić|AM|37|SRB|76
11|Willum Willumsson|AM|28|ISL|72
18|Dennis Geiger|AM|28|GER|72
19|Adam Tahaui|AM|21|NED|62
20|Noé Lebreton|AM|22|FRA|72
26|Sam de Laat|AM|20|NED|63
35|Jamiro Monteiro|AM|32|CPV|68
77|Ayodele Thomas|LW|19|NED|59
14|Kaj Sierhuis|ST|28|NED|64
30|Bryan Linssen|ST|36|NED|69
`},
{"lg": "ED", "id": "GAE", "name": "Go Ahead Eagles", "short": "Go Ahead", "c1": "#e2001a", "c2": "#ffd200", "stadium": "De Adelaarshorst", "cap": 10000, "mgr": "Joseph Oosting", "capt": "Joris Kramer", "rep": 69, "bal": 8, "form": "4-3-3",sq:`
1|Kjetil Haug|GK|28|NOR|64
22|Nick Marsman|GK|36|NED|61
24|Jasper Cillessen|GK|37|NED|71
30|Thomas Hulleman|GK|16|NED|57
33|Nando Verdoni|GK|23|NED|66
2|Alfons Sampsted|RB|28|ISL|65
20|Eus Waayers|RB|20|NED|56
3|Gerrit Nauber|CB|34|GER|65
4|Joris Kramer|CB|30|NED|71
6|Tino Jukić|CB|25|CRO|68
25|Giovanni van Zwam|CB|22|NED|62
26|Julius Dirksen|CB|23|NED|65
28|Pim Saathof|CB|22|NED|59
31|Dani Tijman|CB|20|NED|62
35|Terence Lantveld|CB|19|NED|61
5|Dean James|LB|26|IDN|69
27|Tomas Galvez|LB|21|FIN|65
8|Evert Linthorst|DM|26|NED|68
15|Robbin Weijenberg|DM|21|NED|61
21|Melle Meulensteen|DM|27|NED|68
34|Yassir Salah Rahmouni|DM|20|NED|62
16|Victor Edvardsen|AM|30|SWE|62
10|Søren Tengstedt|RW|26|DEN|67
11|Oskar Siira Sivertsen|RW|22|NOR|63
23|Thibo Baeten|RW|24|BEL|62
17|Mathis Suray|LW|25|BEL|68
18|Richonell Margaret|LW|26|SUR|62
32|Ofosu Boakye|ST|19|NED|57
9|Stefán Sigurðarson|ST|25|ISL|70
29|Erik Flataker|ST|21|NOR|62
`},
{"lg": "ED", "id": "HEE", "name": "SC Heerenveen", "short": "Heerenveen", "c1": "#0056a4", "c2": "#ffffff", "stadium": "Abe Lenstra Stadion", "cap": 26100, "mgr": "Robin Veldman", "capt": "", "rep": 69, "bal": 10, "form": "4-3-3",sq:`
2|Sten Kremers|GK|22|NED|59
22|Bernt Klaverboer|GK|21|NED|58
30|Timo Schreuder|GK|20|NED|54
44|Andries Noppert|GK|32|NED|60
3|Mees Hilgers|CB|25|IDN|74
4|Maas Willemsen|CB|23|NED|73
5|Sam Kersten|CB|28|NED|68
13|Mats Egbring|CB|20|NED|56
19|Vasilios Zagaritis|LB|25|GRE|68
23|Darling Bladi|RB|22|FRA|59
28|Hristiyan Petrov|CB|24|BUL|62
45|Oliver Braude|RB|22|NOR|58
6|Dirk Proper|CM|24|NED|66
7|Maxence Rivera|AM|24|FRA|65
10|Ringo Meerveld|AM|23|NED|71
14|Levi Smans|CM|23|NED|67
16|Marcus Linday|DM|23|SWE|66
36|Nolhan Courtens|CM|19|BEL|59
49|Anass Bouziane|CM|19|NED|52
9|Dylan Vente|ST|27|SUR|65
11|Luca Oyen|LW|23|BEL|68
17|Roberts Uldriķis|ST|28|LVA|62
20|Jacob Trenskow|RW|25|DEN|62
21|Marko Farji|ST|22|IRQ|63
29|Lanroy Machine|LW|21|FRA|59
47|Kirayno Schaken|RW|17|NED|49
`},
{"lg": "ED", "id": "GRO", "name": "FC Groningen", "short": "Groningen", "c1": "#00a650", "c2": "#ffffff", "stadium": "Euroborg", "cap": 22550, "mgr": "Dick Lukkien", "capt": "Thijmen Blokzijl", "rep": 68, "bal": 8, "form": "4-2-3-1",sq:`
1|Etienne Vaessen|GK|31|SUR|63
13|Lovro Štubljar|GK|22|SVN|60
30|Pelle Boevink|GK|28|NED|59
31|Rijk Janse|GK|24|NED|62
73|Daan Erdman|GK|17|NED|48
5|Marco Rente|RB|29|GER|65
29|Tyrique Mercera|RB|22|CUW|63
33|Hans Hateboer|RB|32|NED|64
3|Thijmen Blokzijl|CB|21|NED|62
4|Márk Csinger|CB|23|HUN|67
15|Elvis van der Laan|CB|18|SWE|58
21|Malcolm Jeng|CB|21|SWE|59
42|Jesper Mosselaar|CB|21|NED|60
2|Wouter Prins|LB|22|NED|61
12|Nikolas Brandis|LB|21|SVK|58
8|Tika de Jonge|DM|23|NED|65
18|Tygo Land|DM|20|NED|59
24|Pelle Clement|DM|30|NED|65
44|Jismerai Dillema|CM|19|NED|57
16|Alvin Nordin|RW|18|SWE|58
7|Travis Hernes|LW|21|NOR|63
17|David van der Werff|RW|22|NED|64
11|Jacob Ondrejka|LW|24|SWE|69
34|Ryan Metu|ST|18|NED|58
69|Mark Hoekstra|ST|20|NED|51
9|Brynjólfur Willumsson|ST|26|ISL|72
19|Oskar Zawada|ST|30|POL|67
20|Nils Eggens|ST|21|NED|58
26|Thom van Bergen|ST|22|NED|60
`},
{"lg": "ED", "id": "SPAR", "name": "Sparta Rotterdam", "short": "Sparta", "c1": "#e2001a", "c2": "#ffffff", "stadium": "Sparta Stadion", "cap": 11026, "mgr": "Rogier Meijer", "capt": "Bruno Martins Indi", "rep": 67, "bal": 6, "form": "4-3-3",sq:`
1|Michael Brouwer|GK|33|NED|67
20|Filip Bednarek|GK|34|POL|58
30|Pascal Kuiper|GK|22|NED|60
2|Lushendry Martes|RB|18|NED|59
12|Boyd Reith|RB|27|NED|66
3|Max de Ligt|CB|22|NED|58
4|Marvin Young|CB|21|NED|66
5|Bruno Martins Indi|CB|34|NED|70
6|Nick Verschuren|CB|21|NED|61
7|Bas Kuipers|LB|32|NED|68
8|Teo Quintero|LB|27|VEN|69
15|Giannino Vianello|LB|19|NED|59
9|Cedric Hatenboer|DM|21|NED|67
13|Julian Baas|DM|24|NED|64
21|Jens Toornstra|DM|37|NED|67
16|Alwande Roaldsøy|CM|22|NOR|61
11|Isaac Babadi|LW|21|NED|62
18|Robin van Cruijsen|AM|20|NED|56
10|Mitchell van Bergen|RW|27|NED|67
17|Casper Terho|RW|23|FIN|61
14|Shunsuke Mito|LW|24|JPN|73
22|Joel Ideho|LW|23|NED|61
19|Milan Zonneveld|ST|23|NED|64
23|Andrej Kostić|ST|19|MNE|60
`},
{"lg": "ED", "id": "PEC", "name": "PEC Zwolle", "short": "PEC Zwolle", "c1": "#0b3b8c", "c2": "#ffffff", "stadium": "MAC³PARK stadion", "cap": 14000, "mgr": "Dennis van der Ree", "capt": "Ryan Thomas", "rep": 66, "bal": 6, "form": "4-3-3",sq:`
1|Jasper Schendelaar|GK|26|NED|67
16|Tom de Graaff|GK|21|NED|59
40|Nick Dobben|GK|18|NED|50
41|Duke Verduin|GK|23|NED|54
48|Len Bakker|GK|20|NED|48
3|Olivier Aertssen|RB|22|NED|61
6|Jan Bürger|RB|19|GER|57
18|Jayden Holtman|CB|19|NED|60
4|Tijs Velthuis|CB|24|NED|65
24|Nick Viergever|CB|37|NED|69
28|Simon Graves|CB|27|DEN|65
43|Torben Bos|CB|20|NED|52
2|Sherel Floranus|LB|28|CUW|63
33|Damian van der Haar|LB|22|NED|62
42|Dylan Ruward|LB|21|NED|54
8|Tobias Sommer|DM|24|DEN|67
30|Ryan Thomas|DM|31|NZL|66
34|Nick Fichtinger|DM|22|NED|57
26|Jadiel Pereira da Gama|CM|16|NED|57
38|Givaro Rahajaän|CM|18|NED|57
5|Filip Krastev|AM|25|BUL|63
25|Thijs Oosting|AM|26|NED|63
20|Gabriël Reiziger|RW|21|NED|62
7|Younes Namli|RW|32|DEN|71
11|Dylan Mbayo|RW|25|BEL|66
37|Gilles van der Wal|RW|18|NED|53
9|Elias Sørensen|LW|27|DEN|63
10|Odysseus Velanas|LW|28|GRE|66
22|Ibrahim Cissoko|LW|23|NED|60
12|Koen Kostons|ST|27|NED|67
17|Sydney van Hooijdonk|ST|26|NED|65
`},
{"lg": "ED", "id": "FOR", "name": "Fortuna Sittard", "short": "Fortuna", "c1": "#ffd200", "c2": "#00843d", "stadium": "Fortuna Sittard Stadion", "cap": 12000, "mgr": "Danny Buijs", "capt": "Ivo Pinto", "rep": 66, "bal": 6, "form": "4-2-3-1",sq:`
1|Luuk Koopmans|GK|32|NED|62
31|Mattijs Branderhorst|GK|32|NED|62
33|Kaylen Reitmaier|GK|22|GER|60
2|Siebe Wylin|RB|23|BEL|64
12|Ivo Pinto|RB|36|POR|56
3|Rodrigo Guth|CB|25|BRA|64
4|Iván Márquez|CB|32|ESP|62
6|Syb van Ottele|CB|24|NED|66
28|Justin Hubner|CB|23|IDN|72
35|Kevin van Burgsteden|CB|19|NED|54
8|Jasper Dahlhaus|LB|24|NED|69
15|Nick de Groot|LB|25|NED|60
20|Édouard Michut|DM|23|FRA|64
23|Philip Brittijn|DM|22|NED|63
38|Moussa Gbemou|DM|19|BEL|59
24|Daley Sinkgraven|CM|31|NED|61
5|Yassin Oukili|CM|25|NED|65
14|Sven Simons|CM|22|NED|62
22|Shiloh Zand|CM|23|NED|61
36|Alhaji Bah|CM|18|NED|56
39|Gani Buyukhan|CM|17|TUR|57
47|Amin Laoukili|CM|21|NED|56
10|Ole Romeny|AM|26|IDN|73
52|Mohammed Ihattaren|RW|24|MAR|72
7|Kristoffer Peterson|LW|31|SWE|69
27|Sjors-Lowis Hermsen|ST|20|NED|54
45|Owen Johnson|ST|21|NED|53
9|Anthony Descotte|ST|23|BEL|69
25|Lequincio Zeefuik|ST|21|NED|59
`},
{"lg": "ED", "id": "EXC", "name": "Excelsior", "short": "Excelsior", "c1": "#e2001a", "c2": "#000000", "stadium": "Van Donge & De Roo Stadion", "cap": 4500, "mgr": "Ruben den Uil", "capt": "Casper Widell", "rep": 64, "bal": 4, "form": "4-3-3",sq:`
1|Stijn van Gassel|GK|27|NED|61
2|Celton Biai|GK|25|GNB|59
3|Tijmen Holla|GK|21|NED|54
4|Marlon van de Wetering|CB|22|NED|56
5|Eric da Silva Moreira|RB|20|GER|55
6|Rick Meissen|CB|27|NED|66
7|Casper Widell|CB|26|SWE|66
12|Kasey Bos|LB|21|AUS|57
14|Jan Plug|CB|24|NED|64
8|Simon Janssen|RB|22|NED|56
9|Osman Mohamed Turay|CB|21|GER|56
10|Guilliano Cairo|LB|21|NED|60
11|Daniël van Vianen|CM|22|NED|60
13|Irakli Yegoian|DM|25|GEO|64
15|Noah Naujoks|AM|23|NED|66
16|Valentin Sulzbacher|CM|22|AUT|60
20|Lennard Hartjes|CM|24|NED|63
17|Gijs van den Berg|CM|21|NED|57
18|Quinten Kraaijvanger|CM|20|NED|56
19|Aymen Sliti|RW|21|NED|65
21|Mario Domínguez|ST|22|ESP|64
22|Alireza Jahanbakhsh|RW|32|IRN|70
23|David Garden|ST|20|NED|55
24|Ilano Silva Timas|LW|22|CPV|62
25|Yaqub Finey|ST|20|SWE|53
26|Nesto Groen|LW|22|NED|56
30|Ágúst Thorsteinsson|ST|21|ISL|60
`},
{"lg": "ED", "id": "TEL", "name": "Telstar", "short": "Telstar", "c1": "#ffffff", "c2": "#0b3b8c", "stadium": "BUKO Stadion", "cap": 5338, "mgr": "Henk Brugge", "capt": "", "rep": 63, "bal": 3, "form": "4-3-3",sq:`
1|Ronald Koeman Jr.|GK|31|NED|65
20|Daan Reiziger|GK|25|NED|56
13|Finn Mulder|GK|18|NED|48
2|Jeff Hardeveld|LB|31|NED|63
4|Abdelnour Soualhia|CB|25|FRA|62
15|Nigel Ogidi Nwankwo|CB|28|NED|63
16|Sem Valk|CB|24|NED|62
18|Gabi Caschili|RB|23|NED|60
43|Marvin Peersman|LB|35|BEL|55
28|Rojendro Oudsten|CB|18|SUR|54
5|Prince Aning|CM|22|NED|60
6|Isaiah Ahmed|DM|20|CUW|58
10|Tyrone Owusu|CM|27|NED|62
14|Harrie Kuster|CM|21|NED|59
17|Nils Rossen|CM|22|NED|61
23|Noach Shenkman|CM|20|NED|55
3|Gerald Alders|CM|21|NED|58
7|Rui Mendes|RW|27|POR|66
8|Emirhan Demircan|LW|21|TUR|64
9|Jelani Seedorf|ST|21|SUR|62
11|Nökkvi Thórisson|ST|27|ISL|63
19|Fabiano Rust|RW|21|NED|60
21|Fofin Turay|LW|22|NED|58
27|Patrick Brouwer|AM|25|NED|58
42|Ar'jany Martha|LW|23|CUW|54
12|Soufiane Hetli|RW|25|NED|64
`},
{"lg": "ED", "id": "ADO", "name": "ADO Den Haag", "short": "ADO", "c1": "#00843d", "c2": "#ffd200", "stadium": "Werktalent Stadion", "cap": 15000, "mgr": "Levi Schwiebbe", "capt": "Juho Kilo", "rep": 65, "bal": 6, "form": "4-3-3",sq:`
1|Kilian Nikièma|GK|23|BFA|62
20|Caleb Kramer|GK|20|NED|52
23|Niclas Thiede|GK|27|GER|63
2|Othniël Raterink|RB|20|NED|59
5|Jonas Jensen-Abbew|RB|24|DEN|63
3|Pascal Mulder|CB|27|NED|68
4|Matteo Waem|CB|26|BEL|68
15|Milan Hokke|CB|23|NED|65
22|Lasse Wilhelm|CB|23|GER|61
31|Devyn Payne|CB|21|USA|62
18|Sékou Sylla|LB|27|GUI|60
35|Sanyika Bergtop|LB|19|SUR|57
14|Mylian Jiménez|DM|23|NED|63
25|Juho Kilo|DM|24|FIN|64
8|Jan Žambůrek|CM|25|CZE|67
16|Finn de Bruin|CM|22|NED|61
30|Joey Brandt|CM|21|NED|59
33|Matěj Sín|CM|22|CZE|58
17|Jalen Hawkings|RW|25|USA|60
7|Daryl van Mieghem|RW|36|NED|62
24|Alex Pozo|RW|27|ESP|65
27|Nigel Thomas|RW|25|NED|62
10|Illaijh de Ruijter|LW|20|NED|62
21|Cameron Peupion|LW|24|AUS|62
32|Dani van Leonen|ST|19|NED|54
11|Evan Rottier|ST|24|NED|62
9|Jesse Bal|ST|20|NED|61
19|Luka Reischl|ST|22|AUT|59
46|Yannick Eduardo|ST|20|CZE|54
77|Donat Barany|ST|26|HUN|57
`},
{"lg": "ED", "id": "CMB", "name": "SC Cambuur", "short": "Cambuur", "c1": "#ffd200", "c2": "#0b3b8c", "stadium": "Kooi Stadion", "cap": 15000, "mgr": "Johan Plat", "capt": "Nicky Souren", "rep": 63, "bal": 4, "form": "4-3-3",sq:`
1|Thijs Jansen|GK|24|NED|59
21|Jasper Meijster|GK|21|NED|54
22|Luca Plogmann|GK|26|GER|60
24|Matthijs Kalisvaart|GK|20|NED|50
54|Jannick Coehoorn|GK|18|NED|48
2|Devid Eugene Bouah|RB|25|ITA|62
16|Rik Mulders|RB|26|NED|63
27|Wiebe Kooistra|RB|20|NED|52
3|Jorn Berkhout|CB|24|NED|64
4|Ismaël Baouf|CB|20|MAR|55
6|Jamal Amofa|CB|27|NED|65
14|Billy van Duijl|CB|21|NED|56
45|Buddy Vogelzang|CB|20|NED|50
23|Lucas Jetten|LB|19|NED|52
28|Morgan Costarelli|LB|21|FRA|58
43|Amar Bakkati|DM|19|NED|48
5|Wout Asselman|DM|21|BEL|55
48|Damian Westerhof|DM|17|NED|51
19|Danyello Look|DM|19|NED|52
8|Nicky Souren|CM|26|CUW|62
10|Rafik El Arguioui|CM|21|MAR|61
17|Ethan Apkakou|CM|20|FRA|53
18|Wiebe van der Heide|CM|20|NED|58
20|Daan Visser|CM|22|NED|60
29|Iwan Henstra|RW|20|NED|55
30|Jason Çeka|RW|26|GER|61
11|Ilyès Hamache|LW|23|FRA|63
15|Fabian Kvam|LW|21|NOR|58
38|Yme Bruinsma|ST|21|NED|59
33|Mathieu Maertens|ST|31|BEL|63
7|Sami Bouhoudane|ST|18|NED|55
9|Skye Vink|ST|20|NED|61
13|Nicolas Binder|ST|24|AUT|60
`},
{"lg": "ED", "id": "WIL", "name": "Willem II", "short": "Willem II", "c1": "#e2001a", "c2": "#ffffff", "stadium": "Koning Willem II Stadion", "cap": 15220, "mgr": "Jurgen Streppel", "capt": "Jari Schuurman", "rep": 64, "bal": 5, "form": "4-3-3",sq:`
2|Boet van der Linden|GK|20|NED|51
1|Thomas Didillon-Hödl|GK|30|FRA|63
21|Wouter van der Steen|GK|36|NED|55
26|Maxime Delanghe|GK|25|BEL|57
31|Karst de Leeuw|GK|22|NED|58
41|Tygo Kotte|GK|19|NED|50
3|Alessandro Ciranni|RB|30|BEL|62
4|Finn Stam|CB|23|NED|64
5|Justin Hoogma|CB|28|NED|64
6|Hidde ter Avest|RB|29|NED|63
14|Jens Mathijsen|RB|19|NED|54
15|Amine Et-Taïbi|RB|23|BEL|61
22|Per van Loon|LB|21|NED|57
23|Maxim Dekker|CB|22|NED|60
24|Nathan Tjoe-A-On|LB|24|IDN|63
46|Kayen Scheepens|RB|20|NED|52
83|Mats Lemmens|CB|24|BEL|61
7|Calvin Twigt|DM|23|NED|63
8|Kasper Boogaard|DM|20|NED|60
10|Jari Schuurman|CM|29|NED|68
11|Armin Culum|RW|23|SWE|65
18|Anass Zarrouk|CM|20|NED|54
19|Uriël van Aalst|AM|20|NED|58
32|Vito van Crooij|AM|30|NED|61
34|Amine Lachkar|CM|23|NED|62
40|Divano Iglesias|CM|19|NED|49
48|Julian van Esdonk|CM|20|NED|55
52|Tonny Vilhena|DM|31|NED|70
9|Jaden Slory|RW|21|NED|65
12|Devin Haen|ST|22|NED|61
17|Chido Obi|ST|18|DEN|72
20|Thijs Muller|ST|19|NED|56
28|Thomas Verheijdt|ST|34|NED|64
44|Luca Maal|ST|18|NED|48
49|Ismael Mouhoul|ST|20|NED|52
50|Eser Gürbüz|RW|19|NED|52
`},
{"lg": "LO", "id": "LEI", "name": "Leicester City", "short": "Leicester", "c1": "#003090", "c2": "#ffffff", "stadium": "King Power Stadium", "cap": 32259, "mgr": "Russell Martin", "capt": "Harry Souttar", "rep": 60, "bal": 12, "form": "4-2-3-1",sq:`
1|Jakub Stolarczyk|GK|25|POL|71
13|David Cornell|GK|35|WAL|55
21|Franco Ravizzoli|GK|29|ARG|60
29|Alex McCarthy|GK|36|ENG|64
26|Woyo Coulibaly|RB|27|MLI|69
4|Ben Nelson|CB|22|ENG|64
5|Caleb Okoli|CB|25|ITA|72
15|Harry Souttar|CB|28|AUS|72
16|Warren O'Hora|CB|27|IRL|66
24|Ilari Kangasniemi|CB|19|FIN|54
18|Christian McFarlane|LB|19|ENG|68
33|Luke Thomas|LB|25|ENG|68
6|John Lundstram|DM|32|ENG|69
12|Will Smallbone|DM|26|IRL|69
25|Louis Page|DM|18|ENG|52
36|Sammy Braybrooke|DM|22|ENG|60
8|Conor Chaplin|AM|29|ENG|70
11|Liam Cullen|AM|27|WAL|68
14|Bobby De Cordova-Reid|AM|33|JAM|69
27|Kamari Doyle|AM|21|ENG|67
7|Wes Burns|RW|31|WAL|69
20|Harry Howell|RW|18|ENG|54
37|Will Alves|LW|21|ENG|63
23|Tom Watson|LW|20|ENG|59
9|Admir Bristrić|ST|23|BIH|64
17|Emil Riis|ST|28|DEN|70
`},
{"lg": "LO", "id": "LUT", "name": "Luton Town", "short": "Luton", "c1": "#f78f1e", "c2": "#002d62", "stadium": "Kenilworth Road", "cap": 12056, "mgr": "Jack Wilshere", "capt": "Kal Naismith", "rep": 58, "bal": 8, "form": "3-4-2-1",sq:`
1|James Shea|GK|35|ENG|57
24|Josh Keeley|GK|23|IRL|59
25|Isaiah Jones|RB|27|GUY|60
2|Hakeem Odoffin|CB|28|ENG|64
5|Mads Andersen|CB|28|DEN|68
6|George Johnston|CB|28|SCO|63
15|Teden Mengi|CB|24|ENG|67
42|Christian Chigozie|CB|19|ENG|54
3|Kal Naismith|LB|34|SCO|65
12|Joe Johnson|LB|20|ENG|55
33|Harrison Ashby|RB|24|SCO|60
8|Liam Walsh|DM|29|ENG|67
16|Daniel Gore|DM|22|ENG|57
26|Shandon Baptiste|DM|28|GRN|67
4|Sverre Sandal|CM|23|NOR|64
10|Jamie Donley|AM|21|NIR|67
18|Jordan Clark|AM|33|ENG|63
19|Jayden Luker|AM|21|ENG|61
45|Kasey Palmer|AM|29|JAM|66
27|Reuell Walters|RW|21|ENG|56
7|Jake Richards|RW|19|ENG|56
14|Shayden Morris|RW|24|ENG|63
17|Tudor Mendel|RW|21|ENG|58
11|Emilio Lawrence|LW|21|SCO|58
30|Gideon Kodua|LW|22|ENG|60
9|Callum Marshall|ST|21|NIR|60
21|Nahki Wells|ST|36|BER|64
22|Devante Cole|ST|31|ENG|63
`},
{"lg": "LO", "id": "SHW", "name": "Sheffield Wednesday", "short": "Sheff Wed", "c1": "#005eb8", "c2": "#ffffff", "stadium": "Hillsborough Stadium", "cap": 39732, "mgr": "Matthew Hamshaw", "capt": "Liam Palmer", "rep": 56, "bal": 4, "form": "4-2-3-1",sq:`
2|Joe Lumley|GK|31|ENG|59
13|Ashley Maynard-Brewer|GK|27|AUS|58
3|Connal Trueman|GK|30|ENG|54
4|Jack Phillips|GK|26|ENG|54
5|Liam Palmer|RB|35|SCO|55
6|Max Lowe|LB|29|ENG|65
7|Ricardo Santos|CB|31|CPV|60
8|Di'Shon Bernard|CB|26|JAM|55
9|Liam Cooper|CB|35|SCO|64
10|Yan Valery|RB|27|TUN|67
11|Gabriel Otegbayo|CB|25|IRL|61
26|Sil Swinkels|CB|22|NED|52
12|Cole McGhee|CB|20|ENG|53
30|Ernie Weaver|LB|25|ENG|57
14|Reece James|LB|33|ENG|54
15|Callum Slattery|CM|27|ENG|66
16|Barry Bannan|CM|36|SCO|67
17|Sean Fusire|CM|21|ZIM|52
18|Billy Mitchell|DM|25|ENG|59
19|Jaden Heskey|AM|21|ENG|56
20|Tyler Onyango|CM|23|ENG|56
21|Jordi Liongola|CM|22|BDI|57
22|Jarvis Thornton|CM|26|ENG|58
23|Denny Oliver|CM|24|ENG|57
24|Jamal Lowe|ST|32|JAM|60
25|Louie Barry|LW|23|ENG|67
27|Ali Al Hamadi|ST|24|IRQ|66
28|Will Grainger|ST|30|WAL|56
29|Kieran Morrison|RW|20|NIR|49
31|Harry Gray|ST|17|ENG|48
32|George Brown|ST|26|ENG|57
48|Mason Burstow|ST|23|ENG|55
50|Davis Keillor-Dunn|AM|28|ENG|67
`},
{"lg": "LO", "id": "OXF", "name": "Oxford United", "short": "Oxford", "c1": "#ffd200", "c2": "#002147", "stadium": "Kassam Stadium", "cap": 12500, "mgr": "Aaron Ramsey", "capt": "Cameron Brannagan", "rep": 55, "bal": 5, "form": "4-2-3-1",sq:`
1|Jamie Cumming|GK|27|ENG|64
13|Simon Eastwood|GK|37|ENG|51
41|Monty Marriott|GK|20|ENG|48
2|Sam Long|RB|31|ENG|62
15|Brodie Spencer|RB|22|NIR|56
30|Peter Kioso|RB|27|COD|61
37|Aidan Elliott-Wheeler|RB|20|ENG|51
3|Ciaron Brown|CB|28|NIR|64
5|Frankie Kent|CB|30|ENG|61
6|Michał Helik|CB|31|POL|66
25|James Golding|CB|22|IRL|54
46|Aaron Lacey|CB|19|ENG|49
12|Ruben Roosken|LB|26|NED|62
22|Greg Leigh|LB|32|JAM|58
26|Jack Currie|LB|24|ENG|62
4|Kai Andrews|DM|20|WAL|54
8|Cameron Brannagan|DM|30|ENG|67
18|Jamie McDonnell|DM|22|NIR|56
32|Louie Sibley|DM|25|ENG|58
44|Harrison Bradney|DM|19|ENG|49
27|Leo Snowden|CM|18|ENG|51
11|Tyler Goodrham|AM|23|IRL|66
20|Luka Lynch|RW|19|ENG|54
57|Mo Missanga|RW|18|ENG|48
7|Jeon Jin-Woo|LW|27|KOR|66
10|Aidomo Emakhu|LW|23|IRL|61
23|Siriki Dembélé|LW|30|SCO|58
9|Mark Harris|ST|27|WAL|64
19|Gatlin O'Donkor|ST|22|ENG|60
`},
{"lg": "LO", "id": "HUD", "name": "Huddersfield Town", "short": "Huddersfield", "c1": "#0e63ad", "c2": "#ffffff", "stadium": "Kirklees Stadium", "cap": 24121, "mgr": "Martin Drury", "capt": "Ryan Ledson", "rep": 55, "bal": 5, "form": "3-4-2-1",sq:`
1|Matt Young|GK|19|ENG|52
31|Jak Alnwick|GK|33|ENG|57
33|Nik Tzanev|GK|29|NZL|61
22|Ilias Bronkhorst|RB|29|NED|61
3|Murray Wallace|CB|33|SCO|65
5|Joe Low|CB|24|WAL|60
6|Jack Whatmough|CB|30|ENG|62
12|Radinio Balker|CB|28|SUR|58
15|Ibane Bowat|CB|24|SCO|57
23|Seán Roughan|CB|23|IRL|58
29|Max Murray|CB|19|ENG|54
2|Lasse Sørensen|RW|27|DEN|62
7|Lynden Gooch|RW|30|USA|66
19|Bali Mumba|LW|25|ENG|61
27|Jay Smith-Sway|LW|19|ENG|57
4|Ryan Ledson|DM|29|ENG|66
8|Archie Collins|DM|27|ENG|66
14|Ethan Brierley|DM|22|ENG|59
17|Marcus McGuane|DM|27|ENG|63
20|Cameron Humphreys|DM|23|ENG|61
16|Herbie Kane|CM|27|ENG|63
24|Cameron Ashia|CM|21|ENG|57
10|Marcus Harness|AM|30|IRL|65
18|David Kasumu|AM|27|ENG|62
30|Derensili Sanches Fernandes|RW|25|CPV|60
9|Joe Taylor|ST|23|WAL|66
11|Ashley Fletcher|ST|31|ENG|64
25|Bojan Radulović|ST|26|SRB|66
34|Samson Tovide|ST|22|ENG|54
`},
{"lg": "LO", "id": "PLY", "name": "Plymouth Argyle", "short": "Plymouth", "c1": "#00553f", "c2": "#ffffff", "stadium": "Home Park", "cap": 17900, "mgr": "Tom Cleverley", "capt": "Joe Edwards", "rep": 54, "bal": 4, "form": "4-2-3-1",sq:`
2|Murphy Cooper|GK|21|ENG|51
3|James Storer|GK|26|IRL|57
4|Mathias Ross|CB|28|DEN|57
5|Jack MacKenzie|CB|21|SCO|55
6|Julio Pleguezuelo|CB|29|ESP|62
7|Joe Edwards|CB|22|ENG|56
8|Alex Mitchell|CB|27|ENG|57
9|Alex Hartridge|CB|24|ENG|61
10|Matthew Sorinola|CB|23|ENG|56
11|Jared Rendle|CB|20|ENG|56
12|Wes Harding|CB|21|JAM|57
13|Malachi Boateng|CM|24|ENG|66
14|Harvey White|CM|22|ENG|56
15|Xavier Amaechi|ST|27|ENG|61
16|Ronan Curtis|ST|28|IRL|56
17|Oliver Irow|CM|22|ENG|57
18|Caleb Watts|CM|24|AUS|57
19|Tyreeq Bakinson|CM|29|ENG|59
20|Michael Baidoo|CM|30|GHA|60
21|Bradley Ibrahim|CM|25|ENG|62
22|Will Evans|ST|22|WAL|57
23|Owen Oseni|ST|20|NGA|53
24|Aribim Pepple|ST|30|CAN|61
`},
{"lg": "LO", "id": "STO", "name": "Stockport County", "short": "Stockport", "c1": "#1b4a9c", "c2": "#ffffff", "stadium": "Edgeley Park", "cap": 10852, "mgr": "Jimmy McNulty", "capt": "Oliver Norwood", "rep": 54, "bal": 4, "form": "3-5-2",sq:`
1|Oliver Whatmuff|GK|19|ENG|58
26|Luca Ashby-Hammond|GK|25|ENG|57
32|Andrew Wogan|GK|20|IRL|52
2|Josh Dacres-Cogley|RB|30|ENG|61
5|Ethan Pye|CB|22|ENG|61
6|Eoghan O'Connell|CB|31|IRL|66
12|Tom Wilson-Brown|CB|22|ENG|56
24|Kyron Gordon|CB|24|ENG|60
25|Mamadou Jobe|CB|23|ENG|61
33|Brad Hills|CB|22|ENG|59
14|Tayo Edun|LB|28|ENG|60
28|Che Gardner|RB|19|JAM|55
10|Oliver Norwood|DM|35|NIR|65
4|Lewis Bate|CM|24|ENG|66
18|Lewis Fiorini|CM|24|SCO|63
15|Ryan Glover|RW|26|ENG|62
23|Ben Osborn|LW|32|ENG|59
30|Ethan Ennis|AM|21|ENG|60
42|James Bailey|AM|18|ENG|48
7|Jack Diamond|RW|26|ENG|66
16|Harry Wood|LW|24|ENG|57
20|Jason Adigun|LW|22|ENG|59
9|Benoný Andrésson|ST|21|ISL|67
19|Kyle Wootton|ST|30|ENG|60
22|Mikaël Mandron|ST|32|FRA|57
29|Adama Sidibeh|ST|28|GAM|61
40|Bruno Cina|ST|19|ENG|51
`},
{"lg": "LO", "id": "REA", "name": "Reading", "short": "Reading", "c1": "#004494", "c2": "#ffffff", "stadium": "Madejski Stadium", "cap": 24161, "mgr": "Leam Richardson", "capt": "Lewis Wing", "rep": 53, "bal": 3, "form": "4-2-3-1",sq:`
1|Joel Pereira|GK|30|POR|58
25|Jack Stevens|GK|29|ENG|59
39|Ashqar Ahmed|RB|19|ENG|53
2|Udoka Godwin-Malife|CB|26|ENG|63
15|Paudie O'Connor|CB|29|IRL|58
16|Benn Ward|CB|23|ENG|59
20|Josh Knight|CB|29|ENG|57
23|Conor Masterson|CB|28|IRL|62
3|Jeriel Dorsett|LB|24|MSR|65
5|Haydon Roberts|LB|24|ENG|64
4|Andy Rinomhota|DM|29|ZIM|60
6|Liam Fraser|DM|28|CAN|65
8|Charlie Savage|DM|23|WAL|64
10|Lewis Wing|DM|31|ENG|66
17|George Earthy|AM|22|ENG|66
28|Josh Stokes|AM|22|ENG|58
14|Randell Williams|RW|29|ENG|56
19|Kyreece Lisbie|RW|22|ENG|56
11|Daniel Kyerewaa|LW|25|GER|60
32|Paddy Lane|LW|25|NIR|56
7|Jack Marriott|ST|32|ENG|64
9|Jamie Reid|ST|32|NIR|59
18|Jacob Brown|ST|28|SCO|59
`},
{"lg": "LO", "id": "BNS", "name": "Barnsley", "short": "Barnsley", "c1": "#d71920", "c2": "#ffffff", "stadium": "Oakwell", "cap": 23287, "mgr": "Daniel Stendel", "capt": "Cameron McGeehan", "rep": 52, "bal": 3, "form": "4-3-3",sq:`
2|Cieran Slicker|GK|24|SCO|54
3|Rogan Ravenhill|GK|28|ENG|58
4|Kieren Flavell|GK|20|ENG|51
5|Arley Kay|CB|21|ENG|58
6|Ziyad Larkeche|CB|27|FRA|57
7|Sam Gale|CB|26|ENG|56
8|Jack Shepherd|CB|23|ENG|55
9|Connor O'Riordan|CB|27|IRL|60
10|Jubril Okedina|CB|25|MWI|57
11|Isaac Smith|CB|28|ENG|57
12|Connor Barratt|CB|20|IRL|49
13|Noah Town|CB|30|ENG|55
14|Callum Hudson|CB|25|ENG|56
15|Cameron McGeehan|CM|29|NIR|58
16|Tyrese Noslin|CM|20|CUW|53
17|Daniel Johnson|CM|26|JAM|55
18|Patrick Kelly|CM|26|NIR|57
19|Jonathan Bland|CM|22|WAL|52
20|Noah Saunders|CM|21|ENG|57
21|Tayo Dunne|CM|27|IRL|59
22|Vimal Yoganathan|CM|23|WAL|56
23|O'Rian Reid|CM|29|ENG|57
24|Luca Connell|CM|21|IRL|57
25|Tobi Adeyemo|ST|29|ENG|60
26|Makenzie Kirk|ST|22|NIR|58
27|Ben Touré|ST|27|CIV|57
28|Clayton Taylor|ST|21|AUS|55
29|Amani Richards|ST|20|ENG|54
30|Fábio Jaló|ST|30|POR|55
31|Reyes Cleary|ST|29|ENG|60
32|Rylan Brownlie|ST|22|AUS|58
33|Luke Alker|ST|28|ENG|55
`},
{"lg": "LO", "id": "BRA", "name": "Bradford City", "short": "Bradford", "c1": "#7a003c", "c2": "#f7a823", "stadium": "Valley Parade", "cap": 24840, "mgr": "Michael Duff", "capt": "Antoni Sarcevic", "rep": 52, "bal": 3, "form": "4-2-3-1",sq:`
2|Cameron Dawson|GK|30|ENG|55
3|Colin Doyle|GK|27|IRL|54
21|Jon McCracken|GK|26|SCO|57
4|Zac Hadi|GK|25|ENG|54
5|Reece Welch|CB|29|ENG|58
6|Macaulay Gillesphey|CB|24|ENG|56
7|Hayden Matthews|CB|20|AUS|51
15|Aden Baldwin|CB|25|ENG|58
16|George Pratt|CB|28|ENG|60
27|Corey O'Keeffe|RB|21|IRL|55
28|Matthew Pennington|CB|28|ENG|60
8|Ibou Touray|LB|21|GAM|61
9|Callum Connolly|CM|22|ENG|53
10|Josh Neufville|RW|20|ENG|56
11|Adam Phillips|CM|20|ENG|52
12|Antoni Sarcevic|CM|30|ENG|63
13|Tyreik Wright|LW|26|IRL|58
19|Kayden Jackson|ST|22|ENG|56
20|Henry Cartwright|CM|22|ENG|59
14|Kieran Morgan|CM|27|ENG|58
17|Bobby Pointon|AM|28|ENG|59
24|Will Swan|ST|25|ENG|61
18|Nick Powell|AM|26|ENG|62
22|Harry Ibbitson|CM|21|ENG|59
23|George Lapslie|CM|22|ENG|56
25|Jake Beesley|ST|24|ENG|63
26|Stephen Humphrys|ST|26|ENG|56
`},
{"lg": "LO", "id": "WIG", "name": "Wigan Athletic", "short": "Wigan", "c1": "#1d59af", "c2": "#ffffff", "stadium": "Brick Community Stadium", "cap": 25138, "mgr": "Gary Caldwell", "capt": "Max Power", "rep": 52, "bal": 3, "form": "3-5-2",sq:`
2|Joe Walsh|GK|23|ENG|57
3|Tom Watson|GK|29|ENG|57
41|Joe Whitworth|GK|21|ENG|48
4|Morgan Fox|LB|21|WAL|57
5|Jeremiah Chilokoa-Mullen|CB|25|SCO|54
6|Finley Burns|CB|30|ENG|58
7|Llyton Chapman|CB|30|ENG|56
8|Archie Harris|CB|24|WAL|59
21|K'Marni Miller|CB|24|ENG|55
23|James Carragher|CB|25|MLT|58
9|Sam Bolland|CB|30|ENG|55
10|Connor Barrett|RB|20|ENG|57
11|Jensen Weir|CM|23|ENG|63
12|Fraser Murray|CM|25|SCO|58
13|Max Power|CM|21|ENG|63
14|Reggie Walsh|CM|23|ENG|59
15|Luke Harris|CM|29|WAL|60
16|Ryan Trevitt|CM|24|ENG|54
17|Akeel Higgins|CM|20|ENG|51
18|Charlie Gray|CM|28|ENG|58
19|Chris Sze|CM|25|ENG|56
20|Callum McManaman|RW|27|ENG|59
22|Jon Mellish|CM|30|ENG|55
24|Harrison Rimmer|CM|24|ENG|57
25|Sonny Perkins|ST|24|ENG|57
26|Dara Costelloe|ST|27|IRL|54
27|Scott Hogan|ST|27|IRL|62
28|Bradley Burrowes|ST|25|ENG|55
29|Christian Saydee|ST|29|ENG|58
30|Reece Greenhalgh|ST|23|ENG|54
`},
{"lg": "LO", "id": "PET", "name": "Peterborough United", "short": "Peterborough", "c1": "#005eb8", "c2": "#ffffff", "stadium": "London Road Stadium", "cap": 13512, "mgr": "Robbie Savage", "capt": "Carl Johnston", "rep": 52, "bal": 3, "form": "4-2-3-1",sq:`
1|Alex Bass|GK|28|ENG|61
23|Collin Andeng-Ndi|GK|23|CMR|57
33|James Dornelly|RB|21|ENG|57
3|Evan Weir|CB|24|IRL|58
5|Sam Hughes|CB|29|ENG|59
6|Thomas O'Connor|CB|27|IRL|60
12|Josh Feeney|CB|21|ENG|56
18|Lucca Mendonça|CB|19|ENG|51
26|David Okagbue|CB|22|IRL|55
2|Carl Johnston|LB|24|NIR|62
13|Rio Adebisi|LB|26|ENG|59
14|Harley Mills|LB|21|ENG|57
4|Liam Kelly|DM|30|IRL|57
7|Harrison Jones|DM|21|ENG|60
8|Brandon Khela|DM|21|ENG|59
16|Ben Woods|DM|24|ENG|55
22|Donay O'Brien-Brady|DM|22|ENG|51
45|Harry Ashfield|DM|20|WAL|48
20|Chris Conn-Clarke|AM|24|NIR|56
21|Patryk Sykut|AM|18|UKR|48
28|Matthew Garbett|AM|24|NZL|58
19|Bolu Shofowoke|RW|18|ENG|51
24|Declan Frith|RW|24|ENG|54
10|Ethan Williams|LW|20|ENG|56
11|Owura Edwards|LW|25|ENG|63
9|Harry Leonard|ST|23|ENG|61
17|Vernon Masara|ST|19|ENG|51
27|Danny Ormerod|ST|20|ENG|50
`},
{"lg": "LO", "id": "MAN", "name": "Mansfield Town", "short": "Mansfield", "c1": "#f5a300", "c2": "#003c71", "stadium": "Field Mill", "cap": 10022, "mgr": "Nigel Clough", "capt": "Ryan Sweeney", "rep": 50, "bal": 2, "form": "4-4-2",sq:`
2|Anthony Núñez|GK|21|DOM|55
1|Liam Roberts|GK|31|ENG|60
21|Harry Lewis|GK|28|ENG|53
3|Kyle Knoyle|RB|30|ENG|60
4|Elliott Hewitt|CB|32|WAL|60
5|Ryan Sweeney|CB|29|IRL|60
6|Baily Cargill|CB|31|ENG|60
9|Jordan Bowery|ST|35|SKN|53
20|Frazer Blake-Tracy|LB|31|ENG|60
23|Adedeji Oshilaja|CB|33|ENG|59
7|Lucas Akins|RB|37|GRN|58
8|Stephen McLaughlin|LB|36|IRL|54
39|Owen Dodgson|LB|23|ENG|58
25|Louis Reed|DM|29|ENG|56
13|Jon Russell|AM|26|JAM|60
16|Liam Thompson|AM|24|ENG|58
19|Tyler Roberts|AM|27|WAL|60
22|Nathan Moriah-Welsh|CM|24|GUY|58
24|Regan Hendry|CM|28|SCO|59
40|George Abbott|CM|21|ENG|50
10|George Maris|AM|30|ENG|61
11|Luke Bolton|RW|27|ENG|60
28|Ollie Taylor|RW|20|ENG|52
14|Michael Smith|ST|35|ENG|63
17|David McGoldrick|ST|38|IRL|60
18|Rhys Oates|ST|31|ENG|55
`},
{"lg": "LO", "id": "MKD", "name": "MK Dons", "short": "MK Dons", "c1": "#ffffff", "c2": "#000000", "stadium": "Stadium MK", "cap": 30500, "mgr": "Paul Warne", "capt": "Alex Gilbey", "rep": 51, "bal": 3, "form": "3-4-2-1",sq:`
1|Craig MacGillivray|GK|33|SCO|58
23|Will Dennis|GK|26|ENG|59
51|Sebastian Stacey|GK|20|ENG|49
5|Charlie Goode|CB|31|ENG|62
20|Elijah Campbell|CB|22|ENG|55
21|Marvin Ekpiteta|CB|31|ENG|55
25|Curtis Nelson|CB|33|ENG|54
32|Jack Sanders|CB|27|ENG|61
41|Henry Curtis|CB|22|ENG|52
42|Elisha Boateng|CB|18|GHA|48
46|Jack Burke|CB|18|ENG|48
4|Daniel Barlaser|DM|29|ENG|61
7|Dan Crowley|DM|29|ENG|58
24|Ryan Wintle|DM|29|ENG|56
34|Callum Tripp|DM|20|WAL|51
28|Jay Matete|CM|25|ENG|57
40|Rian Silver|CM|19|ENG|48
12|Kane Wilson|RB|26|ENG|55
19|Ryan Barnett|RB|27|ENG|57
2|Gethin Jones|RB|31|AUS|62
8|Alex Gilbey|AM|31|ENG|62
17|Sam Silvera|AM|26|AUS|56
3|Damerai Singh-Hurditt|AM|30|ENG|63
47|Simone Troso|AM|20|ENG|49
22|Ibrahim Fullah|RW|19|ENG|50
26|Ben Wiles|RW|27|ENG|57
15|Cohen Bramall|LB|30|ENG|59
9|Sam Nombe|ST|28|ENG|59
10|Aaron Collins|ST|29|WAL|61
13|Callum Paterson|ST|32|SCO|57
29|Rushian Hepburn-Murphy|ST|28|ENG|57
39|Jack Perniskie|ST|18|NZL|48
`},
{"lg": "LO", "id": "BLP", "name": "Blackpool", "short": "Blackpool", "c1": "#f68712", "c2": "#ffffff", "stadium": "Bloomfield Road", "cap": 16500, "mgr": "Ian Evatt", "capt": "George Honeyman", "rep": 51, "bal": 3, "form": "3-5-2",sq:`
2|Bailey Peacock-Farrell|GK|25|NIR|55
3|Luke Southwood|GK|22|NIR|56
4|Andrew Lyons|CB|25|IRL|56
5|Zac Ashworth|LB|27|WAL|57
6|Oliver Casey|CB|21|ENG|57
7|Fraser Horsfall|CB|29|ENG|55
8|Michael Ihiekwe|CB|24|ENG|58
9|Finley Munroe|CB|27|ENG|59
10|Jordan Williams|RB|22|ENG|52
11|Oluchukwu Nwankwo|CB|22|ENG|55
12|Josh Earl|LB|20|ENG|51
13|Jordan Brown|CM|24|ENG|58
14|Leighton Clarkson|CM|26|ENG|55
15|Albie Morgan|CM|27|ENG|60
16|George Honeyman|CM|30|ENG|64
17|Karoy Anderson|CM|24|JAM|60
18|Ilmari Niskanen|RW|25|FIN|55
19|Jack Richardson|CM|29|ENG|61
20|Niall Ennis|ST|27|ENG|57
21|Josh Bowler|RW|27|ENG|57
22|Jerry Yates|ST|23|ENG|65
23|Tom Bloxham|LW|21|ENG|54
24|Hayden Coulson|LB|28|ENG|57
25|Dale Taylor|ST|28|NIR|59
26|Dion Charles|ST|28|NIR|57
27|Christopher Hamilton|ST|24|IRL|60
`},
{"lg": "LO", "id": "LOR", "name": "Leyton Orient", "short": "Leyton Orient", "c1": "#c8102e", "c2": "#ffffff", "stadium": "Brisbane Road", "cap": 9271, "mgr": "Richie Wellens", "capt": "Isaac Hayden", "rep": 50, "bal": 2, "form": "4-3-3",sq:`
1|Nathan Baxter|GK|27|ENG|57
23|Oliver Nnonyelu Dovin|GK|24|SWE|53
33|Killian Cahill|GK|22|IRL|54
2|Fin Stevens|RB|23|WAL|64
5|Joseph Olowu|CB|26|ENG|58
6|William Forrester|CB|25|ENG|64
12|Alfie Gilchrist|RB|22|ENG|55
18|Rarmani Edmonds-Green|CB|27|ENG|60
34|Phillip Chinedu|CB|20|ENG|53
19|Somto Boniface|LB|20|ENG|55
3|James Morris|LB|24|ENG|60
8|Idris El Mizouni|DM|26|TUN|63
14|Isaac Hayden|DM|31|JAM|66
20|Alex Gilbert|DM|24|IRL|61
28|Sean Clare|DM|30|TCA|55
36|Dan Carter|CM|19|ENG|51
11|Demetri Mitchell|AM|29|ENG|58
25|Charlie Wellens|AM|23|ENG|57
22|Yusuf Akhamrich|RW|21|MAR|53
27|Tony Springett|RW|24|IRL|61
44|Theo Archibald|RW|28|SCO|52
7|Oliver O'Neill|LW|23|IRL|59
10|Aaron Connolly|LW|26|IRL|59
17|Armando Dobra|LW|25|ALB|57
42|Lemar Gordon|LW|20|ENG|48
9|Jaze Kabia|ST|26|IRL|61
4|Dane Scarlett|ST|22|ENG|53
49|Nicholas Oyekunle|ST|19|ENG|49
`},
{"lg": "LO", "id": "CAMU", "name": "Cambridge United", "short": "Cambridge Utd", "c1": "#f5a300", "c2": "#000000", "stadium": "Abbey Stadium", "cap": 7937, "mgr": "Neil Harris", "capt": "Dominic Ball", "rep": 48, "bal": 2, "form": "4-2-3-1",sq:`
1|Jake Eastwood|GK|30|ENG|61
13|Gabriel Breeze|GK|22|ENG|55
31|Jasper Briggs|GK|19|ENG|49
29|Sam Curtis|RB|20|IRL|53
3|Callum Perry|CB|21|ENG|56
5|Patrick Bauer|CB|34|GER|58
6|Kelland Watts|CB|27|ENG|63
15|Cathal Heffernan|CB|21|IRL|56
33|Daniel Herd|RW|18|ENG|48
2|Liam Bennett|RB|24|ENG|58
22|Zak Bradshaw|LB|23|ENG|56
7|Isaac Heath|LW|22|ENG|55
4|Dominic Ball|DM|31|ENG|58
8|Owen Moxon|DM|28|ENG|59
17|Pelly Mpanzu|DM|32|COD|59
21|Shane McLoughlin|DM|29|IRL|55
38|George Hoddle|DM|21|ENG|55
39|Lohan McDougald|CM|17|ENG|49
10|Ben Knight|AM|24|ENG|59
11|Sullay Kaikai|AM|31|SLE|59
12|Callum Stead|AM|26|ENG|57
27|Glenn McConnell|AM|21|IRL|51
44|Ra'ees Bangura-Williams|AM|22|SLE|49
9|Louis Appéré|ST|27|SCO|57
14|Gassan Ahadme|ST|25|MAR|54
19|Shayne Lavery|ST|27|NIR|56
32|Daniel Efobi|ST|17|ENG|49
`},
{"lg": "LO", "id": "WYC", "name": "Wycombe Wanderers", "short": "Wycombe", "c1": "#87ceeb", "c2": "#002d62", "stadium": "Adams Park", "cap": 10446, "mgr": "Tom Hounsell", "capt": "Jack Grimmer", "rep": 50, "bal": 2, "form": "4-2-3-1",sq:`
2|Mikki van Sas|GK|22|NED|52
3|Conor Hazard|GK|27|NIR|55
4|Matt Macey|GK|30|ENG|59
5|Stuart Moore|GK|28|ENG|59
6|Joe Wildsmith|GK|22|ENG|55
7|Jack Grimmer|RB|24|SCO|59
8|Daniel Harvie|LB|30|SCO|59
9|Dan Casey|CB|26|IRL|61
10|Sam Parker|CB|20|WAL|55
11|Connor Taylor|CB|20|ENG|49
12|Steve Cook|CB|20|ENG|54
13|Anders Hagelskjær|CB|23|DEN|57
14|Mohamed Keita|CB|25|ENG|55
15|Josh Scowen|CM|24|ENG|59
16|Aaron Morley|CM|21|ENG|53
17|Caolan Boyd-Munce|CM|26|NIR|61
18|Luke Leahy|LB|21|ENG|54
19|Cauley Woodrow|AM|30|ENG|64
20|Ewan Henderson|CM|30|SCO|57
21|Jamie Mullins|CM|21|IRL|58
22|Malik Mothersille|AM|23|JAM|60
23|Luke Harney-Roberson|CM|29|ENG|55
24|Junior Quitirna|ST|29|GNB|60
25|Silko-Amari Thomas|ST|25|ENG|56
26|Jayden Wareham|ST|27|ENG|56
27|Emre Tezgel|ST|24|ENG|61
28|Danny Ings|ST|29|ENG|66
29|Fred Onyedinma|RW|28|NGA|56
30|Micah Olabiyi|ST|23|NED|59
31|Kyle Cross|ST|21|ENG|53
`},
{"lg": "LO", "id": "BRT", "name": "Burton Albion", "short": "Burton", "c1": "#ffd200", "c2": "#000000", "stadium": "Pirelli Stadium", "cap": 6912, "mgr": "Gary Bowyer", "capt": "Curtis Tilt", "rep": 47, "bal": 2, "form": "3-5-2",sq:`
2|Kamil Dudek|GK|21|POL|54
3|Jake Kean|GK|29|ENG|51
34|Corey Addai|GK|20|JAM|50
6|Toby Sibbick|CB|20|UGA|55
16|Curtis Tilt|CB|20|JAM|48
20|Jason Sraha|CB|21|ENG|52
4|Harvey Araujo|CB|22|ENG|55
5|Finn Delap|CB|25|ENG|55
7|Joe Lewis|CB|20|WAL|53
8|William Earley|CB|22|ENG|50
9|Jack Armer|LB|21|SCO|54
10|Kgaogelo Chauke|CM|22|RSA|56
11|Charlie Webster|CM|25|ENG|56
12|George Evans|CM|25|ENG|53
13|Will Collar|CM|25|ENG|54
14|Kyran Lofthouse|RB|22|ENG|50
17|Raphael Borges Rodrigues|CM|21|AUS|51
15|Caylan Vickers|LW|28|ENG|58
18|Emeka Adiele|CM|22|ENG|55
19|Ciaran Gilligan|CM|23|IRL|59
41|Sulyman Krubally|CM|22|ESP|48
21|Jack Willow|CM|27|ENG|56
22|Caden Gilbert|CM|25|ENG|59
23|Gbemi Arubi|ST|27|IRL|59
24|Mark O'Mahony|ST|22|IRL|58
25|Matthew Dennis|ST|27|ENG|54
26|Kain Adom|ST|25|ENG|56
27|Zac Scutt|ST|30|ENG|55
28|Miles Henry|ST|30|USA|54
`},
{"lg": "LO", "id": "STE", "name": "Stevenage", "short": "Stevenage", "c1": "#c8102e", "c2": "#ffffff", "stadium": "Broadhall Way", "cap": 7318, "mgr": "Alex Revell", "capt": "Carl Piergianni", "rep": 47, "bal": 2, "form": "4-4-2",sq:`
1|Tommy Setford|GK|27|ENG|56
2|Daniel Barden|GK|23|WAL|54
3|Luther James-Wildin|RB|29|ATG|56
5|Carl Piergianni|CB|24|ENG|58
4|Lewis Freestone|LB|26|ENG|57
14|Saxon Earley|LB|23|ENG|58
15|Terence Vancooten|CB|29|GUY|60
16|Kaelan Casey|CB|24|ENG|56
6|Alfie Thornett|CB|26|ENG|60
7|Jordan Houghton|CM|21|ENG|54
8|Terry Taylor|CM|30|WAL|58
9|Daniel Phillips|CM|21|TRI|57
10|Dan Kemp|AM|23|ENG|56
11|Jordan Roberts|CM|21|ENG|51
12|Jasper Pattenden|CM|23|ENG|55
23|Louis Thompson|CM|23|WAL|60
13|Matt Smith|CM|24|ENG|56
17|Wanya Marçal|RW|26|POR|54
18|Tatenda Mutanga|CM|20|ENG|49
19|Josh Magennis|ST|21|NIR|61
20|Oliver Sanderson|ST|28|ENG|55
21|Tuğra Turhan|ST|23|TUR|55
22|Chem Campbell|RW|29|WAL|54
27|Ben Broggio|ST|24|ENG|60
24|Michael Mellon|ST|29|SCO|54
44|Phoenix Patterson|LW|29|SCO|52
`},
{"lg": "LO", "id": "NCO", "name": "Notts County", "short": "Notts County", "c1": "#000000", "c2": "#ffffff", "stadium": "Meadow Lane", "cap": 19841, "mgr": "Martin Paterson", "capt": "Matthew Palmer", "rep": 49, "bal": 2, "form": "3-4-2-1",sq:`
1|James Belshaw|GK|36|ENG|54
21|Harry Griffiths|GK|21|ENG|54
2|James Gibbons|CB|28|ENG|61
3|Rodney McDonald|CB|34|ENG|56
4|Jacob Bedeau|CB|26|ENG|62
5|Matty Platt|CB|29|ENG|57
12|Lucas Ness|CB|24|ENG|59
26|Ishé Samuels-Smith|CB|20|ENG|54
28|Lewis Macari|CB|24|SCO|58
44|Matthew Baker|CB|23|WAL|50
10|Rosaire Longelo|RB|26|ENG|57
25|Nicholas Tsaroulla|RB|27|CYP|55
6|Max Sanders|DM|27|ENG|61
15|Jack Evans|DM|26|ENG|56
18|Matthew Palmer|DM|31|ENG|56
20|Scott Robertson|DM|25|SCO|55
27|Rory Finneran|DM|18|IRL|48
16|Dean Campbell|CM|25|SCO|57
14|Darius Lipsiuc|RW|21|IRL|52
8|Oliver Cooper|AM|26|WAL|59
11|Conor Grant|AM|25|IRL|58
17|Maziar Kouhyar|AM|29|AFG|58
42|Hindolo Mustapha|AM|20|SLE|48
7|Callum Roberts|RW|29|ENG|58
22|Beck-Ray Enoru|LW|24|ENG|58
9|Daniel Kanu|ST|21|SLE|57
19|Luka Smyth|ST|22|AUS|51
33|Emile Acquah|ST|26|ENG|55
39|Lee Ndlovu|ST|32|ZIM|55
`},
{"lg": "LO", "id": "WIM", "name": "AFC Wimbledon", "short": "AFC Wimbledon", "c1": "#0033a0", "c2": "#ffd200", "stadium": "Plough Lane", "cap": 9215, "mgr": "Johnnie Jackson", "capt": "Ryan Johnson", "rep": 48, "bal": 2, "form": "4-4-2",sq:`
1|Nathan Bishop|GK|27|ENG|59
20|Joe McDonnell|GK|32|ENG|56
39|Josef Bursik|GK|26|ENG|54
17|Andy Yiadom|RB|34|GHA|59
3|Steve Seddon|LB|28|ENG|60
6|Ryan Johnson|CB|30|NIR|59
15|Freddie Simmonds|CB|18|ENG|48
22|Riley Horan|CB|19|ENG|49
26|Dan Sweeney|CB|32|ENG|53
33|Isaac Ogundere|CB|23|ENG|58
35|Sam Goma|CB|18|ENG|48
2|Steven Sessegnon|LB|26|TCA|61
5|Ollie Harrison|CM|19|ENG|52
8|Callum Maycock|CM|28|ENG|62
10|Zack Nelson|CM|21|ENG|58
12|Alistair Smith|CM|27|ENG|59
18|Delano McCoy-Splatt|CM|22|JAM|57
21|Myles Hippolyte|CM|31|GRN|56
7|James Tilley|DM|28|ENG|63
31|Dujuan Richards|DM|20|JAM|49
34|Harry Hedges|ST|18|ENG|48
9|Jayden Stockley|ST|33|ENG|62
11|Marcus Browne|RW|28|ENG|57
14|Matty Stevens|ST|28|ENG|57
19|Donnell McNeilly|ST|21|ENG|52
23|Harry Cornick|ST|31|ENG|58
29|Aron Sasu|ST|21|NOR|53
`},
{"lg": "LO", "id": "BRO", "name": "Bromley", "short": "Bromley", "c1": "#ffffff", "c2": "#000000", "stadium": "Hayes Lane", "cap": 6100, "mgr": "Karl Robinson", "capt": "Omar Sowunmi", "rep": 45, "bal": 2, "form": "4-4-2",sq:`
1|Grant Smith|GK|32|ENG|54
30|Shamal George|GK|28|DMA|51
31|Owen Mason|GK|22|IRL|48
2|Chanse Headman|RB|21|ENG|54
12|Marcus Ifill|RB|23|ENG|53
5|Omar Sowunmi|CB|31|ENG|56
15|Deon Woodman|CB|23|KEN|58
21|Kamarl Grant|CB|23|ENG|54
45|Adam Jackson|CB|32|ENG|51
3|Richard Taylor|LB|26|ENG|61
17|Jacob Mendy|LB|29|GAM|52
10|Jodi Jones|LW|29|MLT|59
4|Ashley Charles|DM|27|GRN|60
6|George Saville|DM|33|NIR|60
22|Kamil Conteh|CM|23|SLE|58
27|Tobias Brenan|CM|20|ENG|48
8|Ben Thompson|AM|31|ENG|58
16|Will Hondermarck|AM|25|CGO|55
28|JJ McKiernan|AM|24|NIR|55
18|Corey Whitely|RW|35|ENG|54
7|Ethon Archer|LW|24|ENG|58
11|Mitch Pinnock|LW|31|ENG|60
19|Mickel Miller|LW|30|ENG|54
9|Michael Cheek|ST|35|ENG|64
14|Nicke Kabamba|ST|33|COD|52
20|Victor Adeboyejo|ST|28|NGA|54
`},
{"lg": "LO", "id": "DON", "name": "Doncaster Rovers", "short": "Doncaster", "c1": "#e2001a", "c2": "#ffffff", "stadium": "Eco-Power Stadium", "cap": 15231, "mgr": "Grant McCann", "capt": "Owen Bailey", "rep": 49, "bal": 2, "form": "4-2-3-1",sq:`
2|Tommy Simkin|GK|27|ENG|55
3|Jake Oram|GK|29|ENG|58
4|Jacob Bryant|GK|23|ENG|55
5|Josh Clarke|GK|22|NIR|54
6|Jamie Sterry|RB|26|ENG|60
7|James Husband|LB|29|ENG|60
8|Matthew Pearson|CB|27|ENG|59
9|Jay McGrath|CB|20|ENG|53
10|Neill Byrne|CB|20|IRL|52
11|Tom Nixon|CB|21|ENG|55
12|Jack Senior|LB|24|ENG|60
13|Seán Grehan|CB|21|IRL|52
14|Lincoln Pawlak|CB|30|ENG|56
15|Alex Pavan|CM|30|ENG|59
16|Owen Bailey|CM|30|ENG|59
17|George Broadbent|CM|23|ENG|58
18|Harry Clifton|CM|26|ENG|60
19|Darren Robinson|CM|28|NIR|54
20|Isaac Hutchinson|AM|23|ENG|54
21|Robbie Gotts|CM|27|ENG|56
22|Bayley McCann|CM|25|NIR|56
23|Ashton Swales|CM|22|ENG|56
24|James Collins|ST|20|IRL|54
25|Tommi O'Reilly|AM|29|ENG|59
26|Brandon Hanlan|ST|21|ENG|53
27|Alfie May|ST|23|ENG|64
28|Leon Ayinde|ST|21|ENG|55
29|Francis Okoronkwo|ST|26|ENG|59
30|Jordan Thomas|ST|29|ENG|59
31|Hakeeb Adelakun|RW|24|ENG|58
`},
];
if (typeof XL_CLUBS !== "undefined") XL_CLUBS.push(...EDLO_CLUBS);
