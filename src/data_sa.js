// ===== DATA: Italy. Serie A 2026/27 squads (FotMob team pages, 4 Nov 2026; ages, positions and ratings are game estimates).
// Coaches, captains and stadiums: Wikipedia "2026-27 Serie A" (read 4 Nov 2026). Serie B and Serie C are team level.
// Budgets (bal) are in £m, scaled to the game's English finances.
const SA_CLUBS = [
{"id": "INT", "name": "Inter", "short": "Inter", "c1": "#0068a8", "c2": "#000000", "stadium": "Stadio Giuseppe Meazza", "cap": 75710, "mgr": "Cristian Chivu", "capt": "Lautaro Martínez", "rep": 92, "bal": 150, "form": "3-5-2",sq:`
1|Josep Martínez|GK|28|ESP|80
12|Raffaele Di Gennaro|GK|33|ITA|62
49|Ivan Provedel|GK|32|ITA|79
6|John Stones|CB|32|ENG|82
25|Manuel Akanji|CB|31|SUI|83
28|Benjamin Pavard|CB|30|FRA|80
30|Carlos Augusto|LB|27|BRA|79
31|Yann Aurel Bisseck|CB|25|GER|81
95|Alessandro Bastoni|CB|27|ITA|87
99|Djed Spence|RB|26|ENG|78
5|Aleksandar Stanković|DM|21|SRB|78
7|Piotr Zieliński|CM|32|POL|80
8|Petar Sučić|CM|23|CRO|80
11|Luis Henrique|RB|24|BRA|79
17|Andy Diouf|CM|23|FRA|77
20|Hakan Çalhanoğlu|DM|32|TUR|84
21|Curtis Jones|CM|25|ENG|81
22|Henrikh Mkhitaryan|CM|37|ARM|76
23|Nicolò Barella|CM|29|ITA|87
32|Federico Dimarco|LB|28|ITA|85
9|Marcus Thuram|ST|29|FRA|85
10|Lautaro Martínez|ST|29|ARG|88
14|Ange-Yoan Bonny|ST|23|CIV|79
48|Mattia Mosconi|ST|19|ITA|65
94|Francesco Pio Esposito|ST|21|ITA|81
`},
{"id": "ACM", "name": "AC Milan", "short": "Milan", "c1": "#fb090b", "c2": "#000000", "stadium": "San Siro", "cap": 75710, "mgr": "Rúben Amorim", "capt": "Mike Maignan", "rep": 90, "bal": 120, "form": "3-4-2-1",sq:`
1|Pietro Terracciano|GK|36|ITA|70
16|Mike Maignan|GK|31|FRA|86
96|Lorenzo Torriani|GK|21|ITA|66
5|Koni De Winter|CB|24|BEL|78
23|Fikayo Tomori|CB|28|ENG|80
31|Strahinja Pavlović|CB|25|SRB|81
34|Mario Gila|CB|26|ESP|80
42|Filippo Terracciano|RB|23|ITA|72
46|Matteo Gabbia|CB|27|ITA|78
13|Sankhoun Diawara|CB|20|FRA|68
80|Yunus Musah|CM|23|USA|77
38|Warren Bondo|DM|23|FRA|75
12|Adrien Rabiot|CM|31|FRA|83
14|Luka Modrić|CM|41|CRO|80
30|Ardon Jashari|DM|24|SUI|80
56|Alexis Saelemaekers|RB|27|BEL|80
2|Pervis Estupiñán|LB|28|ECU|79
33|Davide Bartesaghi|LB|20|ITA|75
8|Ruben Loftus-Cheek|CM|30|ENG|77
21|Samuel Chukwueze|RW|27|NGA|77
28|Christian Comotto|CM|18|ITA|64
20|Omari Hutchinson|RW|23|ENG|79
22|Diego Moreira|LW|22|BEL|76
9|Gonçalo Ramos|ST|25|POR|81
11|Christian Pulisic|RW|28|USA|84
73|Francesco Camarda|ST|18|ITA|72
25|Cheveyo Mul-Balentien|ST|19|SUR|64
`},
{"id": "JUV", "name": "Juventus", "short": "Juventus", "c1": "#000000", "c2": "#ffffff", "stadium": "Allianz Stadium", "cap": 41507, "mgr": "Luciano Spalletti", "capt": "Manuel Locatelli", "rep": 91, "bal": 130, "form": "4-2-3-1",sq:`
1|Kamil Grabara|GK|27|POL|79
23|Carlo Pinsoglio|GK|36|ITA|62
25|Guglielmo Vicario|GK|30|ITA|82
33|Neto|GK|37|BRA|68
3|Gleison Bremer|CB|29|BRA|84
4|Federico Gatti|CB|28|ITA|79
6|Lloyd Kelly|CB|28|ENG|78
15|Pierre Kalulu|CB|26|FRA|81
24|Daniele Rugani|CB|32|ITA|72
26|Jhon Lucumí|CB|28|COL|81
2|Zeki Çelik|RB|29|TUR|77
5|Manuel Locatelli|DM|28|ITA|82
8|Teun Koopmeiners|CM|28|NED|81
11|Edon Zhegrova|RW|27|KOS|81
12|Douglas Luiz|CM|28|BRA|78
19|Khéphren Thuram-Ulien|CM|25|FRA|82
20|Andrea Cambiaso|LB|26|ITA|82
22|Weston McKennie|CM|28|USA|80
29|Pape Sarr|CM|24|SEN|80
31|Nicolás González|RW|28|ARG|79
32|Juan Cabal|LB|25|COL|76
41|Augusto Owusu|CM|21|ITA|65
7|Francisco Conceição|RW|23|POR|82
9|Randal Kolo Muani|ST|27|FRA|81
10|Kenan Yıldız|LW|21|TUR|86
13|Jérémie Boga|LW|29|CIV|78
14|Arkadiusz Milik|ST|32|POL|74
17|Kerim Alajbegović|RW|19|BIH|74
18|Jeff Ekhator|ST|19|ITA|68
27|Nick Woltemade|ST|24|GER|82
`},
{"id": "NAP", "name": "Napoli", "short": "Napoli", "c1": "#12a0d7", "c2": "#ffffff", "stadium": "Stadio Diego Armando Maradona", "cap": 54732, "mgr": "Massimiliano Allegri", "capt": "Giovanni Di Lorenzo", "rep": 90, "bal": 110, "form": "4-3-3",sq:`
1|Alex Meret|GK|29|ITA|79
32|Vanja Milinković-Savić|GK|29|SRB|81
14|Nikita Contini|GK|30|ITA|62
12|Claudio Pugliese|GK|18|ITA|58
4|Alessandro Buongiorno|CB|27|ITA|82
5|Benoît Badiashile|CB|25|FRA|77
13|Amir Rrahmani|CB|32|KOS|80
16|Rafa Marín|CB|24|ESP|76
17|Mathías Olivera|LB|29|URU|79
22|Giovanni Di Lorenzo|RB|33|ITA|82
31|Sam Beukema|CB|27|NED|81
35|Luca Marianucci|CB|22|ITA|70
2|Costantino Favasuli|RB|22|ITA|68
6|Billy Gilmour|DM|25|SCO|80
7|David Neres|RW|29|BRA|81
8|Scott McTominay|CM|29|SCO|86
11|Kevin De Bruyne|AM|35|BEL|84
21|Matteo Politano|RW|33|ITA|80
26|Antonio Vergara|AM|23|ITA|76
27|Alisson Santos|LW|24|BRA|74
37|Leonardo Spinazzola|LB|33|ITA|76
68|Stanislav Lobotka|DM|31|SVK|83
99|Frank Anguissa|CM|30|CMR|82
19|Rasmus Højlund|ST|23|DEN|82
20|Lorenzo Lucca|ST|26|ITA|77
23|Giovane|ST|22|BRA|74
70|Noa Lang|LW|27|NED|80
`},
{"id": "ROM", "name": "Roma", "short": "Roma", "c1": "#8e1f2f", "c2": "#f0bc42", "stadium": "Stadio Olimpico", "cap": 70634, "mgr": "Gian Piero Gasperini", "capt": "Bryan Cristante", "rep": 87, "bal": 90, "form": "3-4-2-1",sq:`
32|Devis Vásquez|GK|28|COL|72
95|Pierluigi Gollini|GK|31|ITA|70
99|Mile Svilar|GK|27|SRB|85
3|Konstantinos Koulierakis|CB|22|GRE|76
5|Evan N'Dicka|CB|27|CIV|81
20|Nahuel Molina|RB|28|ARG|78
22|Mario Hermoso|CB|31|ESP|77
23|Gianluca Mancini|CB|30|ITA|81
26|Leonardo Balerdi|CB|27|ARG|78
87|Daniele Ghilardi|CB|23|ITA|78
2|Devyne Rensch|RB|23|NED|76
43|Wesley|RB|23|BRA|80
4|Bryan Cristante|DM|31|ITA|79
15|Marten de Roon|DM|35|NED|76
17|Manu Koné|CM|25|FRA|83
61|Niccolò Pisilli|CM|22|ITA|75
86|Rodrigo Mora|AM|19|POR|76
7|Lorenzo Pellegrini|AM|30|ITA|79
18|Matias Soulé|RW|23|ARG|82
21|Paulo Dybala|AM|32|ARG|80
77|Emanuele Lulli|CM|19|ITA|60
63|Alessandro Di Nunzio|CM|19|ITA|60
9|Santiago Castro|ST|22|ARG|78
14|Donyell Malen|ST|27|NED|81
68|Antonio Arena|ST|17|ITA|60
`},
{"id": "LAZ", "name": "Lazio", "short": "Lazio", "c1": "#87d8f7", "c2": "#ffffff", "stadium": "Stadio Olimpico", "cap": 70634, "mgr": "Gennaro Gattuso", "capt": "Mattia Zaccagni", "rep": 82, "bal": 60, "form": "4-3-3",sq:`
35|Christos Mandas|GK|25|GRE|79
40|Edoardo Motta|GK|21|ITA|68
55|Alessio Furlanetto|GK|24|ITA|60
29|Manuel Lazzari|RB|32|ITA|73
77|Adam Marušić|RB|34|MNE|74
2|Diogo Leite|CB|27|POR|76
5|Danilho Doekhi|CB|28|NED|77
25|Oliver Provstgaard|CB|23|DEN|74
37|Josip Šutalo|CB|26|CRO|77
3|Luca Pellegrini|LB|27|ITA|73
17|Nuno Tavares|LB|26|POR|78
23|Alfonso Pedraza|LB|30|ESP|76
15|Romano Floriani|RB|23|ITA|66
33|Ricardo Bordon|CB|20|BRA|64
6|Nicolò Rovella|DM|24|ITA|81
7|Fisayo Dele-Bashiru|CM|25|NGA|76
16|Davide Frattesi|CM|27|ITA|81
21|Reda Belahyane|DM|22|MAR|72
24|Kenneth Taylor|CM|24|NED|77
32|Danilo Cataldi|DM|32|ITA|73
28|Adrian Przyborek|AM|19|POL|66
8|Bruno Galassi|CM|19|ESP|62
11|Gustav Isaksen|RW|25|DEN|79
22|Matteo Cancellieri|RW|24|ITA|75
10|Mattia Zaccagni|LW|31|ITA|80
80|Albert Guðmundsson|AM|29|ISL|79
9|Andrea Pinamonti|ST|27|ITA|76
14|Tijjani Noslin|ST|27|NED|75
`},
{"id": "ATA", "name": "Atalanta", "short": "Atalanta", "c1": "#1e71b8", "c2": "#000000", "stadium": "New Balance Arena", "cap": 23439, "mgr": "Maurizio Sarri", "capt": "Éderson", "rep": 86, "bal": 90, "form": "4-3-3",sq:`
29|Marco Carnesecchi|GK|26|ITA|83
57|Marco Sportiello|GK|34|ITA|70
22|Thomas Pompei|GK|20|ITA|58
3|Odilon Kossounou|CB|25|CIV|78
4|Isak Hien|CB|27|SWE|80
23|Sead Kolašinac|CB|33|BIH|76
31|Thomas Kristensen|CB|24|DEN|75
42|Giorgio Scalvini|CB|22|ITA|81
40|Relja Obrić|CB|20|SVN|66
16|Raoul Bellanova|RB|26|ITA|78
77|Davide Zappacosta|RB|34|ITA|75
47|Lorenzo Bernasconi|LB|22|ITA|72
8|Mario Pašalić|CM|31|CRO|78
13|Éderson|CM|27|BRA|84
19|Franck Kessié|DM|29|CIV|79
70|Gianluca Gaetano|AM|26|ITA|75
7|Kamaldeen Sulemana|LW|24|GHA|76
10|Lazar Samardžić|AM|24|SRB|78
17|Charles De Ketelaere|AM|25|BEL|83
18|Giacomo Raspadori|ST|26|ITA|80
59|Nicola Zalewski|LB|24|POL|76
99|Eljif Elmas|CM|27|MKD|77
11|Jonathan Rowe|LW|23|ENG|78
9|Gianluca Scamacca|ST|27|ITA|80
90|Nikola Krstović|ST|26|MNE|79
`},
{"id": "COM", "name": "Como", "short": "Como", "c1": "#0055a4", "c2": "#ffffff", "stadium": "Stadio Giuseppe Sinigaglia", "cap": 13602, "mgr": "Cesc Fàbregas", "capt": "Lucas Da Cunha", "rep": 84, "bal": 110, "form": "4-2-3-1",sq:`
1|Jean Butez|GK|31|FRA|80
22|Mauro Vigorito|GK|36|ITA|62
97|Robert Sánchez|GK|28|ESP|80
27|Yan Couto|RB|24|BRA|78
28|Ivan Smolčić|RB|26|CRO|77
2|Marc-Oliver Kempf|CB|31|GER|77
4|Jacobo Ramón|CB|21|ESP|79
13|Alberto Dossena|CB|28|ITA|74
18|Edoardo Goldaniga|CB|32|ITA|71
53|Willy Kambwala|CB|22|COD|72
99|Trevoh Chalobah|CB|27|ENG|80
3|Álex Valle|LB|22|ESP|78
16|Kaiki|LB|23|BRA|70
5|Máximo Perrone|DM|23|ARG|81
7|Lucas Da Cunha|CM|25|FRA|80
6|Luis Milla|CM|32|ESP|77
21|Samuele Ricci|DM|25|ITA|80
8|Maxence Caqueret|CM|26|FRA|79
10|Nico Paz|AM|22|ARG|86
30|Mattia Liberali|AM|19|ITA|66
11|Assane Diao|RW|21|SEN|79
42|Jayden Addai|LW|21|NED|73
17|Jesús Rodríguez|LW|20|ESP|78
20|Martin Baturina|AM|23|CRO|80
9|Anastasios Douvikas|ST|27|GRE|77
90|Moise Kean|ST|26|ITA|83
`},
{"id": "BGN", "name": "Bologna", "short": "Bologna", "c1": "#1a2f48", "c2": "#a21c26", "stadium": "Stadio Renato Dall'Ara", "cap": 38279, "mgr": "Raffaele Palladino", "capt": "Lorenzo De Silvestri", "rep": 82, "bal": 60, "form": "4-2-3-1",sq:`
1|Łukasz Skorupski|GK|35|POL|78
25|Massimo Pessina|GK|18|ITA|70
34|Francesco Raffaelli|GK|21|ITA|58
2|Emil Holm|RB|26|SWE|78
3|Arthur Theate|LB|26|BEL|78
5|Eivind Helland|CB|21|NOR|73
14|Torbjørn Heggem|CB|27|NOR|77
16|Nicolò Casale|CB|28|ITA|76
20|Nadir Zortea|RB|27|ITA|76
29|Lorenzo De Silvestri|RB|38|ITA|68
33|Juan Miranda|LB|26|ESP|77
41|Martin Vitík|CB|23|CZE|75
23|Rahim Alhassane|LB|24|NIG|66
4|Tommaso Pobega|CM|27|ITA|77
6|Nikola Moro|DM|28|CRO|77
8|Mikel Amondarain|CM|21|ARG|66
17|Oussama El Azzouzi|DM|25|MAR|73
19|Lewis Ferguson|CM|27|SCO|81
21|Jens Odgaard|AM|27|DEN|77
36|Matteo Darmian|RB|36|ITA|71
7|Riccardo Orsolini|RW|29|ITA|81
9|Artem Dovbyk|ST|29|UKR|78
10|Federico Bernardeschi|RW|32|ITA|77
11|Samuel Mbangula|LW|22|BEL|74
22|Jay Enem|ST|23|NED|68
28|Nicolò Cambiaghi|LW|25|ITA|78
91|Roberto Piccoli|ST|25|ITA|77
`},
{"id": "FIO", "name": "Fiorentina", "short": "Fiorentina", "c1": "#5a2b81", "c2": "#ffffff", "stadium": "Stadio Artemio Franchi", "cap": 43118, "mgr": "Paolo Vanoli", "capt": "David de Gea", "rep": 81, "bal": 60, "form": "3-5-2",sq:`
43|David de Gea|GK|35|ESP|82
53|Oliver Christensen|GK|27|DEN|70
19|Luca Lezzerini|GK|31|ITA|60
2|Dodô|RB|27|BRA|80
3|Radu Drăgușin|CB|24|ROU|77
5|Marin Pongračić|CB|29|CRO|77
6|Luca Ranieri|CB|27|ITA|78
17|João Mário|RB|26|POR|74
20|Álex Jiménez|RB|21|ESP|73
21|Valde|LB|19|ESP|64
33|Viery|CB|21|BRA|65
4|Marco Brescianini|CM|26|ITA|74
14|Arthur Atta|CM|23|FRA|76
25|Alieu Njie|AM|21|SWE|68
27|Cher Ndour|CM|22|ITA|74
44|Nicolò Fagioli|CM|25|ITA|79
65|Fabiano Parisi|LB|25|ITA|75
42|Christ Inao Oulaï|CM|20|CIV|68
7|Riccardo Sottil|LW|27|ITA|73
23|Beto|ST|28|GNB|75
28|Pote|RW|28|POR|75
29|Wilfried Gnonto|LW|22|ITA|75
30|Franco Mastantuono|AM|19|ARG|80
32|Mateo Pellegrino|ST|24|ARG|72
71|Sulayman Jallow|LW|19|GAM|62
`},
{"id": "TOR", "name": "Torino", "short": "Torino", "c1": "#881f19", "c2": "#ffffff", "stadium": "Stadio Olimpico Grande Torino", "cap": 28177, "mgr": "Ignazio Abate", "capt": "Duván Zapata", "rep": 78, "bal": 40, "form": "3-5-2",sq:`
20|Lucas Perri|GK|28|BRA|76
81|Franco Israel|GK|26|URU|74
26|Diego Mascardi|GK|20|ITA|58
2|Nathan Patterson|RB|25|SCO|74
3|Cristiano Biraghi|LB|34|ITA|71
5|Eray Cömert|CB|28|SUI|73
13|Ricardo Rodríguez|CB|34|SUI|74
15|Pietro Comuzzo|CB|21|ITA|76
23|Saúl Coco|CB|27|EQG|76
29|Niccolò Fortini|LB|20|ITA|68
44|Ardian Ismajli|CB|30|ALB|75
6|Emirhan İlkhan|DM|22|TUR|70
7|Zakaria Aboukhlal|RW|26|MAR|74
8|Rolando Mandragora|CM|29|ITA|77
10|Nikola Vlašić|AM|29|CRO|78
21|Daniel Bragança|CM|27|POR|74
22|Cesare Casadei|CM|23|ITA|76
28|Kian Fitz-Jim|CM|23|NED|70
45|Rafik Belghali|RB|24|ALG|72
66|Gvidas Gineitis|CM|22|LTU|73
9|Pietro Pellegri|ST|25|ITA|68
11|Gaetano Oristanio|RW|24|ITA|71
17|Sandro Kulenović|ST|26|CRO|71
18|Giovanni Simeone|ST|31|ARG|75
19|Ché Adams|ST|30|SCO|75
91|Duván Zapata|ST|35|COL|73
`},
{"id": "UDI", "name": "Udinese", "short": "Udinese", "c1": "#000000", "c2": "#ffffff", "stadium": "Bluenergy Stadium", "cap": 25132, "mgr": "Kosta Runjaić", "capt": "Jesper Karlström", "rep": 76, "bal": 35, "form": "3-5-2",sq:`
40|Maduka Okoye|GK|27|NGA|78
41|Bartosz Mrozek|GK|26|POL|70
93|Daniele Padelli|GK|41|ITA|60
5|David Alaba|CB|34|AUT|76
13|Nicolò Bertola|CB|23|ITA|71
14|James Abankwah|CB|22|IRL|68
16|Matteo Palma|CB|18|ITA|64
27|Christian Kabasele|CB|35|BEL|71
28|Oumar Solet|CB|26|FRA|80
77|Enzo Ebosse|LB|27|CMR|70
4|Sandi Lovrić|CM|28|SVN|75
6|Oier Zarraga|CM|27|ESP|74
8|Jesper Karlström|DM|31|SWE|74
11|Hassane Kamara|LB|32|CIV|73
20|Juan Arizala|LB|21|COL|68
23|Mërgim Vojvoda|RB|31|KOS|71
24|Jakub Piotrowski|CM|29|POL|75
30|Giorgi Chakvetadze|AM|27|GEO|72
32|Jurgen Ekkelenkamp|CM|26|NED|75
38|Lennon Miller|CM|20|SCO|72
59|Alessandro Zanoli|RB|26|ITA|72
7|Idrissa Gueye|ST|20|SEN|66
9|Keinan Davis|ST|28|JAM|75
10|Nicolò Zaniolo|AM|27|ITA|76
15|Vakoun Issouf Bayo|ST|29|CIV|70
91|Lazar Jovanović|RW|19|SRB|66
`},
{"id": "GEN", "name": "Genoa", "short": "Genoa", "c1": "#a51c30", "c2": "#1a2a48", "stadium": "Stadio Luigi Ferraris", "cap": 33205, "mgr": "Daniele De Rossi", "capt": "Johan Vásquez", "rep": 76, "bal": 35, "form": "3-5-2",sq:`
1|Justin Bijlow|GK|28|NED|76
39|Daniele Sommariva|GK|29|ITA|60
99|Franz Stolz|GK|25|AUT|68
2|Mario Mitaj|LB|23|ALB|70
5|Leo Østigård|CB|26|NOR|76
16|Cody Drameh|RB|24|ENG|70
22|Johan Vásquez|CB|28|MEX|78
27|Alessandro Marcandalli|CB|24|ITA|72
34|Sebastian Otoa|CB|22|DEN|70
3|Kingsley Ehizibue|RB|31|NED|70
4|Amorim|CM|21|BRA|64
20|Stefano Sabelli|RB|33|ITA|70
77|Mikael Egill Ellertsson|LB|24|ISL|73
8|Tommaso Baldanzi|AM|23|ITA|74
10|Junior Messias|RW|35|BRA|71
25|Hamed Traorè|CM|26|CIV|72
32|Morten Frendrup|DM|25|DEN|78
92|Stephan El Shaarawy|LW|34|ITA|72
97|Djibril Sow|CM|29|SUI|74
11|Franz-Ethan Meichtry|RW|21|SUI|64
9|Vítinha|ST|26|POR|74
17|Elias Havel|ST|23|AUT|64
18|Milutin Osmajić|ST|27|MNE|72
29|Lorenzo Colombo|ST|24|ITA|73
76|Lorenzo Venturino|RW|20|ITA|67
`},
{"id": "SAS", "name": "Sassuolo", "short": "Sassuolo", "c1": "#00a752", "c2": "#000000", "stadium": "Mapei Stadium", "cap": 21515, "mgr": "Alberto Aquilani", "capt": "Domenico Berardi", "rep": 75, "bal": 30, "form": "4-3-3",sq:`
12|Andrea Satalino|GK|27|ITA|62
49|Arijanet Murić|GK|27|KOS|77
80|Gianluca Turati|GK|25|ITA|66
3|Josh Doig|LB|24|SCO|74
5|Fali Candé|LB|28|GNB|71
6|Sebastian Walukiewicz|CB|26|POL|74
15|Filip Ćaleta-Car|CB|30|CRO|74
21|Jay Idzes|CB|26|IDN|76
26|Cas Odenthal|CB|26|NED|71
27|Yeferson Paz|CB|24|COL|68
20|Bryan Van Der Brempt|RB|24|BEL|67
16|Tom Leysen|RB|23|BEL|65
46|Filippo Cinquegrano|RB|22|ITA|62
70|Edoardo Pieragnolo|LB|23|ITA|67
8|Luca Ghion|CM|26|ITA|68
11|Daniel Boloca|CM|27|ROU|72
18|Nemanja Matić|DM|38|SRB|73
33|Luca Obrador|AM|22|ESP|64
35|Luca Lipani|CM|21|ITA|70
42|Kristian Thorstvedt|CM|27|NOR|76
90|Ismaël Koné|CM|24|CAN|75
7|Cristian Volpato|AM|22|AUS|72
9|Kieron Bowie|ST|24|SCO|67
10|Domenico Berardi|RW|32|ITA|79
19|Andreas Skjellerup|ST|24|DEN|67
25|Benjamín Domínguez|LW|23|ARG|72
45|Armand Laurienté|LW|27|FRA|78
77|Samuele Pierini|RW|28|ITA|68
94|Sebastiano Esposito|ST|24|ITA|73
`},
{"id": "PAR", "name": "Parma", "short": "Parma", "c1": "#ffd200", "c2": "#0035a0", "stadium": "Stadio Ennio Tardini", "cap": 22352, "mgr": "Alberto Gilardino", "capt": "Enrico Delprato", "rep": 74, "bal": 35, "form": "3-5-2",sq:`
40|Edoardo Corvi|GK|25|ITA|72
22|Simone Ghidotti|GK|26|ITA|62
30|Giovanni Daffara|GK|21|ITA|58
3|Abdoulaye Ndiaye|CB|24|SEN|73
5|Lautaro Valenti|CB|27|ARG|72
15|Enrico Delprato|CB|26|ITA|74
34|Diego Carlos|CB|33|BRA|73
37|Mariano Troilo|CB|23|ARG|73
4|Vincent Sierro|DM|31|SUI|72
10|Adrián Bernabé|CM|25|ESP|78
14|Emanuele Valeri|LB|27|ITA|73
16|Mandela Keita|DM|24|BEL|76
27|Sascha Britschgi|RB|20|SUI|70
29|Franco Carboni|LB|23|ARG|70
32|Christian Ordóñez|CM|22|ARG|72
41|Hans Nicolussi Caviglia|DM|26|ITA|74
80|Giovanni Fabbian|AM|23|ITA|73
7|Ousmane Diallo|LW|19|ESP|66
8|Benjamín Cremaschi|CM|21|USA|70
9|David Romero|ST|23|ARG|66
11|Pontus Almqvist|RW|27|SWE|72
19|El Bilal Touré|ST|25|MLI|73
20|Matija Frigan|ST|23|CRO|72
23|Nesta Elphege|ST|25|FRA|66
`},
{"id": "CAG", "name": "Cagliari", "short": "Cagliari", "c1": "#a01b29", "c2": "#00285e", "stadium": "Unipol Domus", "cap": 16416, "mgr": "Fabio Pisacane", "capt": "Alessandro Deiola", "rep": 73, "bal": 25, "form": "3-5-2",sq:`
1|Elia Caprile|GK|25|ITA|78
12|Alen Sherri|GK|28|ALB|66
23|Boris Radunović|GK|30|SRB|68
2|Zé Pedro|CB|29|POR|71
15|Juan Rodríguez|CB|21|URU|72
22|Raphael Kofler|CB|21|ITA|62
26|Yerry Mina|CB|32|COL|74
33|Adam Obert|LB|24|SVK|71
3|Riyad Idrissi|LB|21|ITA|68
4|Alessandro Romano|CM|20|ITA|72
6|Harry Winks|CM|30|ENG|73
8|Michel Adopo|CM|26|FRA|74
17|Mattia Felici|LW|25|ITA|71
21|Roberto Gagliardini|CM|32|ITA|71
24|Giuseppe Aurelio|LB|26|ITA|68
27|Alessandro Deiola|CM|31|ITA|71
28|Yukinari Sugawara|RB|26|JPN|73
79|Yanis Massolin|CM|24|FRA|67
20|Riccardo Ciervo|RW|24|ITA|65
9|Kevin Carlos|ST|25|ESP|70
10|Jacopo Fazzini|AM|23|ITA|71
18|M'Bala Nzola|ST|30|ANG|71
39|Alieu Fadera|LW|25|GAM|71
70|Daniel Maldini|AM|25|ITA|74
19|Yael Trepy|ST|20|FRA|62
`},
{"id": "LEC", "name": "Lecce", "short": "Lecce", "c1": "#f5d300", "c2": "#d6001c", "stadium": "Stadio Via del Mare", "cap": 30354, "mgr": "Eusebio Di Francesco", "capt": "Wladimiro Falcone", "rep": 71, "bal": 20, "form": "4-3-3",sq:`
30|Wladimiro Falcone|GK|31|ITA|77
1|Marco Bleve|GK|31|ITA|60
32|Alexandru Borbei|GK|23|ROU|60
2|Ali Dembélé|RB|22|FRA|64
3|Corrie Ndaba|CB|26|IRL|67
4|Kialonda Gaspar|CB|29|ANG|72
5|Jamil Siebert|CB|24|GER|70
17|Danilo Veiga|RB|24|POR|72
18|Gaby Jean|CB|26|FRA|67
25|Antonino Gallo|LB|26|ITA|73
44|Tiago Gabriel|CB|21|POR|72
8|Sadik Fofana|CM|23|TOG|65
10|Medon Berisha|CM|23|ALB|68
14|Youssef Maleh|CM|28|MAR|70
16|Omri Gandelman|CM|26|ISR|70
20|Ivan Ilić|CM|25|SRB|72
29|Lassana Coulibaly|DM|30|MLI|72
77|Mohamed Kaba|DM|25|FRA|70
28|Olaf Gorter|CM|21|NED|62
7|Amar Fatah|ST|22|SWE|64
9|Nikola Štulić|ST|25|SRB|71
11|Konan N'Dri|RW|26|NIG|70
50|Santiago Pierotti|RW|25|ARG|71
69|Willem Geubbels|ST|25|FRA|67
99|Joël Monteiro|LW|27|SUI|68
34|Hjalte Laerke|ST|19|DEN|58
`},
{"id": "MNZ", "name": "Monza", "short": "Monza", "c1": "#e30613", "c2": "#ffffff", "stadium": "U-Power Stadium", "cap": 17102, "mgr": "Ivan Jurić", "capt": "Matteo Pessina", "rep": 70, "bal": 30, "form": "3-4-2-1",sq:`
1|Semuel Pizzignacco|GK|24|ITA|70
20|Demba Thiam|GK|28|SEN|66
12|Andrea Vailati|GK|19|ITA|56
18|Ricardo Mangas|LB|28|POR|70
2|Arvid Brorsson|CB|27|SWE|70
3|Lorenzo Lucchesi|CB|23|ITA|68
6|Valentin Antov|CB|25|BUL|70
15|Filippo Delli Carri|CB|27|ITA|68
44|Andrea Carboni|CB|25|ITA|71
33|Saverio Domanico|CB|21|ITA|60
24|Eddy Kouadio|CM|20|ITA|70
11|Omari Forson|RW|22|ENG|68
14|Pedro Obiang|DM|34|EQG|68
17|Keita Baldé|LW|31|SEN|69
19|Samuele Birindelli|RB|26|ITA|70
21|Leonardo Colombo|CM|21|ITA|64
23|Nicolas Galazzi|LW|25|ITA|66
26|Patrick Ciurria|RW|31|ITA|69
28|Andrea Colpani|AM|27|ITA|72
32|Matteo Pessina|CM|29|ITA|73
35|Jay Robinson|LW|19|ENG|60
36|Gustavo Varela|ST|21|POR|62
10|Patrick Cutrone|ST|28|ITA|70
37|Andrea Petagna|ST|31|ITA|68
47|Dany Mota|ST|28|POR|70
39|Kevin Martins|ST|21|ITA|60
`},
{"id": "FRO", "name": "Frosinone", "short": "Frosinone", "c1": "#ffd700", "c2": "#0047ab", "stadium": "Stadio Benito Stirpe", "cap": 16227, "mgr": "Massimiliano Alvini", "capt": "Ilario Monterisi", "rep": 66, "bal": 15, "form": "4-3-3",sq:`
22|Lorenzo Palmisani|GK|22|ITA|66
91|Sebastiano Desplanches|GK|23|ITA|64
12|Matteo Pisseri|GK|34|ITA|58
20|Anthony Oyono|RB|25|GAB|66
90|Enzo Tchato|CB|23|CMR|62
2|Giorgio Cittadini|CB|24|ITA|66
3|Gabriele Calvani|CB|22|ITA|62
5|Wisdom Amey|CB|21|ITA|64
25|Kevin Akpoguma|CB|31|NGA|68
30|Ilario Monterisi|CB|24|ITA|67
71|Aleksa Terzić|LB|27|SRB|67
79|Gabriele Bracaglia|CB|23|ITA|61
74|Omar Fayed|CB|23|EGY|62
73|Patrizio Masini|CM|25|ITA|66
14|Giacomo Calò|CM|29|ITA|66
27|Florian Grillitsch|DM|31|AUT|69
34|Anouar El Azzouzi|CM|25|NED|64
70|Luis Hasa|CM|22|ALB|65
92|Benjamin Lhassine Kone|CM|26|CIV|65
96|Francesco Gelli|CM|30|ITA|65
24|Alessio Zerbin|RW|27|ITA|67
10|Romano Schmid|AM|26|AUT|72
7|Farès Ghedjemis|RW|24|ALG|67
17|Giorgi Kvernadze|LW|23|GEO|66
9|Antonio Raimondo|ST|22|ITA|65
11|Daniel Bîrligea|ST|26|ROU|68
89|Tomás Bobček|ST|25|SVK|64
29|Alejandro Cichero|LW|20|VEN|60
`},
{"id": "VEN", "name": "Venezia", "short": "Venezia", "c1": "#ff6a00", "c2": "#00553a", "stadium": "Stadio Pier Luigi Penzo", "cap": 12048, "mgr": "Davide Nicola", "capt": "Gianluca Busio", "rep": 68, "bal": 20, "form": "3-5-2",sq:`
1|Filip Stanković|GK|24|SRB|72
96|Lorenzo Montipò|GK|30|ITA|68
23|Matteo Grandi|GK|34|ITA|56
14|Thierry Correia|RB|27|POR|68
2|Matías Moreno|CB|23|ARG|66
3|Joël Schingtienne|CB|24|BEL|67
4|Bartol Franjić|CB|26|CRO|67
15|Juan Jesus|CB|35|BRA|67
17|Armel Bella-Kotchap|CB|24|GER|70
25|Redouane Halhal|CB|23|MAR|64
33|Marin Šverko|CB|28|CRO|67
70|Pasquale Mazzocchi|RB|31|ITA|68
6|Gianluca Busio|CM|24|USA|72
19|Simon Sohm|CM|25|SUI|71
21|Thórir Helgason|CM|26|ISL|65
26|Toma Bašić|CM|29|CRO|67
30|Matteo Dagasso|DM|22|ITA|66
32|Alfred Duncan|CM|33|GHA|66
71|Kike Pérez|CM|29|ESP|68
18|Antoine Hainaut|LB|24|FRA|64
5|Ridgeciano Haps|LB|33|SUR|65
20|Richie Sagrado|RB|22|BEL|62
8|Lamine Fanne|AM|22|ESP|62
7|Albion Rrahmani|ST|26|KOS|67
9|Andrea Adorante|ST|26|ITA|68
10|John Yeboah|RW|26|ECU|70
29|Lion Lauberbach|ST|28|GER|65
45|Akor Adams|ST|26|NGA|70
`},
];
const SB_CLUBS = [["Hellas Verona", 70, "Stadio Marcantonio Bentegodi", 39211], ["Pisa", 69, "Arena Garibaldi", 12508], ["Cremonese", 69, "Stadio Giovanni Zini", 20641], ["Palermo", 69, "Stadio Renzo Barbera", 36365], ["Empoli", 68, "Stadio Carlo Castellani", 16284], ["Sampdoria", 67, "Stadio Luigi Ferraris", 33205], ["Modena", 66, "Stadio Alberto Braglia", 21151], ["Cesena", 66, "Orogel Stadium-Dino Manuzzi", 20194], ["Catanzaro", 66, "Stadio Nicola Ceravolo", 14650], ["Padova", 65, "Stadio Euganeo", 32420], ["Südtirol", 65, "Stadio Druso", 5539], ["Juve Stabia", 65, "Stadio Romeo Menti", 7642], ["Mantova", 64, "Stadio Danilo Martelli", 14884], ["Carrarese", 64, "Stadio dei Marmi", 4194], ["Avellino", 64, "Stadio Partenio-Adriano Lombardi", 26000], ["Virtus Entella", 63, "Stadio Comunale", 5535], ["Vicenza", 63, "Stadio Romeo Menti", 12000], ["Benevento", 63, "Stadio Ciro Vigorito", 16867], ["Arezzo", 62, "Stadio Città di Arezzo", 13128], ["Ascoli", 62, "Stadio Cino e Lillo Del Duca", 12461]];
const SC_CLUBS = [["Bari", 58], ["Spezia", 58], ["Salernitana", 57], ["Reggiana", 57], ["Cittadella", 56], ["Ternana", 56], ["Pescara", 56], ["Perugia", 55], ["Catania", 56], ["Triestina", 54], ["Lecco", 54], ["Novara", 54], ["Foggia", 53], ["Crotone", 54], ["Trapani", 53], ["Feralpisalò", 53]];
const SA_STADIA = {"INT": {"o": "1926", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Arancio", "Tribuna Blu", "Curva Nord", "Curva Sud"], "bowl": 1}, "ACM": {"o": "1926", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Arancio", "Tribuna Blu", "Curva Sud", "Curva Nord"], "bowl": 1}, "JUV": {"o": "2011", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Ovest", "Tribuna Est", "Curva Sud", "Curva Nord"], "bowl": 1}, "NAP": {"o": "1959", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Posillipo", "Distinti", "Curva B", "Curva A"], "bowl": 1}, "ROM": {"o": "1953", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Monte Mario", "Tribuna Tevere", "Curva Sud", "Curva Nord"], "bowl": 1}, "LAZ": {"o": "1953", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Monte Mario", "Tribuna Tevere", "Curva Nord", "Curva Sud"], "bowl": 1}, "ATA": {"o": "1928", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Giulio Cesare", "Tribuna Rinascimento", "Curva Nord", "Curva Sud"], "c": 1}, "COM": {"o": "1927", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Distinti", "Curva Azzurra", "Settore Ospiti"], "c": 1}, "BGN": {"o": "1927", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Distinti", "Curva Andrea Costa", "Curva San Luca"], "bowl": 1}, "FIO": {"o": "1931", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Maratona", "Curva Fiesole", "Curva Ferrovia"], "bowl": 1}, "TOR": {"o": "1933", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Grande Torino", "Distinti", "Curva Maratona", "Curva Primavera"], "bowl": 1}, "UDI": {"o": "1976", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Centrale", "Distinti", "Curva Nord", "Curva Sud"], "c": 1}, "GEN": {"o": "1911", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Distinti", "Gradinata Nord", "Gradinata Sud"], "c": 1}, "SAS": {"o": "1995", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Centrale", "Distinti", "Curva Sud", "Curva Nord"], "c": 1}, "PAR": {"o": "1923", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Petitot", "Tribuna Est", "Curva Nord", "Curva Sud"], "c": 1}, "CAG": {"o": "2017", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Distinti", "Curva Nord", "Curva Sud"], "c": 1}, "LEC": {"o": "1966", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Centrale", "Tribuna Est", "Curva Nord", "Curva Sud"], "bowl": 1}, "MNZ": {"o": "1988", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Centrale", "Distinti", "Curva Sud", "Curva Nord"], "c": 1}, "FRO": {"o": "2017", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Centrale", "Distinti", "Curva Nord", "Curva Sud"], "c": 1}, "VEN": {"o": "1913", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Distinti", "Curva Sud", "Curva Nord"]}};
const ITA_ABROAD = [["Diego Coppola", "CB", 22, "Paris FC", 75], ["Samuele Inácio", "AM", 18, "Borussia Dortmund", 70], ["Issa Doumbia", "CM", 23, "Sporting CP", 74], ["Mohamed Alì Zoma", "ST", 19, "Nürnberg", 67]];
const ITA_CAPS = [["Gianluigi Donnarumma", "87", "0"], ["Nicolò Barella", "73", "10"], ["Giovanni Di Lorenzo", "56", "5"], ["Alessandro Bastoni", "46", "5"], ["Federico Dimarco", "38", "3"], ["Bryan Cristante", "48", "2"], ["Davide Frattesi", "38", "9"], ["Moise Kean", "28", "13"], ["Gianluca Mancini", "22", "2"], ["Riccardo Calafiori", "17", "1"], ["Federico Chiesa", "51", "7"], ["Lorenzo Pellegrini", "36", "6"], ["Manuel Locatelli", "36", "3"], ["Raoul Bellanova", "6", "0"], ["Alessandro Buongiorno", "12", "0"], ["Nicolò Fagioli", "9", "0"], ["Sandro Tonali", "~30", "~2"], ["Guglielmo Vicario", "~5", "0"], ["Marco Carnesecchi", "~3", "0"], ["Massimo Pessina", "~1", "0"], ["Giorgio Scalvini", "~5", "0"], ["Matteo Ruggeri", "~3", "0"], ["Michael Kayode", "~2", "0"], ["Honest Ahanor", "~1", "0"], ["Daniele Ghilardi", "~3", "0"], ["Diego Coppola", "~2", "0"], ["Eddy Kouadio", "~1", "0"], ["Rolando Mandragora", "~5", "0"], ["Samuele Ricci", "~10", "0"], ["Alessandro Romano", "~1", "0"], ["Samuele Inácio", "~1", "0"], ["Issa Doumbia", "~1", "0"], ["Antonio Vergara", "~2", "0"], ["Nicolò Cambiaghi", "~4", "~1"], ["Francesco Pio Esposito", "~10", "~4"], ["Gianluca Scamacca", "~22", "~3"], ["Mohamed Alì Zoma", "~1", "0"], ["Daniel Maldini", "~5", "~1"], ["Sebastiano Esposito", "~2", "0"], ["Andrea Cambiaso", "~18", "~1"], ["Destiny Udogie", "~14", "0"], ["Giacomo Raspadori", "~44", "~9"], ["Mattia Zaccagni", "~14", "~2"], ["Matteo Politano", "~25", "~3"], ["Nicolò Rovella", "~6", "0"]];
NAT_REC.ITA = {"caps": [["Gianluigi Buffon", 176], ["Fabio Cannavaro", 136], ["Paolo Maldini", 126], ["Leonardo Bonucci", 121], ["Giorgio Chiellini", 117]], "goals": [["Luigi Riva", 35], ["Giuseppe Meazza", 33], ["Silvio Piola", 30], ["Alessandro Del Piero", 27], ["Roberto Baggio", 27]]};
const FIRST_IT = ["Luca", "Marco", "Matteo", "Andrea", "Alessandro", "Lorenzo", "Francesco", "Davide", "Simone", "Federico", "Riccardo", "Giacomo", "Tommaso", "Leonardo", "Gabriele", "Pietro", "Nicolò", "Filippo", "Edoardo", "Mattia", "Christian", "Daniele", "Stefano", "Antonio", "Giuseppe", "Salvatore", "Vincenzo", "Michele", "Emanuele", "Samuele", "Cristian", "Alessio", "Diego", "Giovanni", "Paolo", "Elia", "Manuel", "Jacopo", "Raffaele", "Kevin"];
const LAST_IT = ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De", "Luca", "Mancini", "Costa", "Giordano", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrara", "Galli", "Martini", "Leone", "Longo", "Gentile", "Martinelli", "Vitale", "Lombardo", "Serra", "Coppola", "De", "Santis", "D'Angelo", "Marchetti", "Parisi", "Villa", "Conte", "Ferraro", "Ferri", "Fabbri", "Bianco", "Marini", "Grasso", "Valentini", "Messina", "Sala", "De", "Angelis", "Gatti", "Pellegrini", "Palumbo", "Sanna", "Farina", "Rizzi", "Monti", "Cattaneo", "Morelli", "Amato", "Silvestri", "Mazza", "Testa", "Grassi", "Pellegrino", "Carbone", "Giuliani", "Benedetti", "Barone", "Rossetti", "Caputo", "Montanari", "Guerra", "Palmieri", "Bernardi", "Martino", "Fiore", "De", "Rosa", "Ferretti", "Bellini", "Basile", "Riva", "Donati", "Piras", "Vitali", "Battaglia", "Sartori", "Neri", "Costantini", "Milani", "Pagano", "Ruggiero", "Sorrentino"];
