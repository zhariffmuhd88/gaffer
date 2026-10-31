// ===== DATA: Spain. La Liga 2026/27 squads (FotMob team pages, 31 Oct 2026; ages, positions and ratings are game estimates).
// Coaches, captains and stadiums: Wikipedia "2026-27 La Liga" (read 31 Oct 2026). Segunda División and Primera Federación are team level.
// Budgets (bal) are in £m, scaled to the game's English finances.
const LL_CLUBS = [
{"id": "RMA", "name": "Real Madrid", "short": "Real Madrid", "c1": "#ffffff", "c2": "#febe10", "stadium": "Santiago Bernabéu", "cap": 83186, "mgr": "José Mourinho", "capt": "Federico Valverde", "rep": 95, "bal": 210, "form": "4-3-3",sq:`
1|Thibaut Courtois|GK|34|BEL|87
13|Andriy Lunin|GK|27|UKR|79
4|Dean Huijsen|CB|21|ESP|85
3|Éder Militão|CB|28|BRA|84
22|Antonio Rüdiger|CB|33|GER|83
16|Ibrahima Konaté|CB|27|FRA|85
35|Raúl Asencio|CB|23|ESP|79
12|Trent Alexander-Arnold|RB|28|ENG|85
2|Denzel Dumfries|RB|30|NED|82
17|Marc Cucurella|LB|28|ESP|84
18|Álvaro Carreras|LB|23|ESP|82
23|Ferland Mendy|LB|31|FRA|78
14|Aurélien Tchouaméni|DM|26|FRA|86
8|Federico Valverde|CM|28|URU|88
6|Eduardo Camavinga|CM|23|FRA|84
5|Jude Bellingham|AM|23|ENG|89
15|Arda Güler|AM|21|TUR|85
20|Bernardo Silva|AM|32|POR|85
30|Thiago Pitarch|CM|19|ESP|68
10|Kylian Mbappé|ST|27|FRA|92
7|Vinícius Júnior|LW|26|BRA|89
11|Rodrygo|RW|25|BRA|84
21|Brahim Díaz|AM|27|MAR|80
9|Endrick|ST|20|BRA|78
25|Yan Diomande|RW|20|CIV|78
36|Carlos Espí|ST|20|ESP|68
`},
{"id": "BAR", "name": "Barcelona", "short": "Barcelona", "c1": "#a50044", "c2": "#004d98", "stadium": "Spotify Camp Nou", "cap": 62652, "mgr": "Hansi Flick", "capt": "Raphinha", "rep": 95, "bal": 160, "form": "4-2-3-1",sq:`
13|Joan García|GK|25|ESP|85
25|Wojciech Szczęsny|GK|36|POL|78
1|Dominik Livaković|GK|31|CRO|79
5|Pau Cubarsí|CB|19|ESP|86
24|Eric García|CB|25|ESP|81
15|Andreas Christensen|CB|30|DEN|79
18|Gerard Martín|LB|24|ESP|78
23|Jules Koundé|RB|27|FRA|86
2|João Cancelo|RB|32|POR|81
3|Alejandro Balde|LB|23|ESP|83
31|Xavi Espart|RB|19|ESP|68
21|Frenkie de Jong|CM|29|NED|86
8|Pedri|CM|23|ESP|90
16|Rodri|DM|30|ESP|87
6|Gavi|CM|22|ESP|83
22|Marc Bernal|DM|19|ESP|78
4|Fermín López|AM|23|ESP|83
20|Dani Olmo|AM|28|ESP|85
36|Brian Fariñas|CM|19|ESP|66
10|Lamine Yamal|RW|19|ESP|91
11|Raphinha|LW|29|BRA|88
19|Anthony Gordon|LW|25|ENG|84
14|Karim Adeyemi|RW|24|GER|82
9|Gabriel Jesus|ST|29|BRA|80
28|Roony Bardghji|RW|20|SWE|75
39|Jesse Bisiwu|ST|19|BEL|66
40|Hamza Abdelkarim|ST|19|EGY|67
`},
{"id": "ATM", "name": "Atlético Madrid", "short": "Atlético", "c1": "#cb3524", "c2": "#262f61", "stadium": "Riyadh Air Metropolitano", "cap": 70692, "mgr": "Diego Simeone", "capt": "Koke", "rep": 89, "bal": 110, "form": "4-4-2",sq:`
13|Jan Oblak|GK|33|SVN|85
1|Juan Musso|GK|32|ARG|77
31|Salvi Esquivel|GK|21|ESP|66
4|Cristian Romero|CB|28|ARG|86
24|Robin Le Normand|CB|30|ESP|81
17|Dávid Hancko|CB|28|SVK|82
29|Dani Martínez|CB|21|ESP|70
18|Marc Pubill|RB|23|ESP|79
14|Marcos Llorente|RB|31|ESP|82
22|Alejandro Grimaldo|LB|31|ESP|84
6|Koke|CM|34|ESP|79
8|Pablo Barrios|CM|23|ESP|83
5|Johnny Cardoso|DM|25|USA|80
23|Morten Hjulmand|DM|27|DEN|83
16|Obed Vargas|CM|21|MEX|74
26|Rodrigo Mendoza|CM|21|ESP|75
10|Álex Baena|AM|25|ESP|84
20|Giuliano Simeone|RW|23|ARG|80
11|Ademola Lookman|LW|29|NGA|84
7|Lee Kang-in|AM|25|KOR|81
19|Julián Álvarez|ST|26|ARG|88
9|Alexander Sørloth|ST|30|NOR|82
21|Jonathan David|ST|26|CAN|84
36|Arnau Ortiz|RW|20|ESP|66
`},
{"id": "VIL", "name": "Villarreal", "short": "Villarreal", "c1": "#ffe667", "c2": "#005187", "stadium": "Estadio de la Cerámica", "cap": 23008, "mgr": "Iñigo Pérez", "capt": "Gerard Moreno", "rep": 82, "bal": 60, "form": "4-4-2",sq:`
25|Péter Gulácsi|GK|36|HUN|78
1|Luíz Júnior|GK|25|BRA|77
2|Logan Costa|CB|25|CPV|79
8|Juan Foyth|CB|28|ARG|80
12|Renato Veiga|CB|23|POR|81
15|Santiago Mouriño|CB|24|URU|78
26|Pau Navarro|CB|21|ESP|73
3|Alex Freeman|RB|22|USA|77
24|Carlos Romero|LB|24|ESP|76
23|Sergi Cardona|LB|27|ESP|77
18|Pape Gueye|DM|27|SEN|80
14|Santi Comesaña|CM|30|ESP|80
16|Carlos Maciá|CM|20|ESP|70
28|Alassane Diatta|CM|21|SEN|71
6|Nathan Saliba|CM|22|CAN|74
20|Alberto Moleiro|AM|23|ESP|82
17|Tajon Buchanan|RW|27|CAN|79
19|Nicolas Pépé|RW|31|CIV|79
11|Ilias Akhomach|RW|22|MAR|77
7|Gerard Moreno|ST|34|ESP|80
9|Georges Mikautadze|ST|25|GEO|81
22|Ayoze Pérez|ST|33|ESP|79
21|Tani Oluwaseyi|ST|26|CAN|76
35|Joselillo Gaitán|LW|20|ESP|66
`},
{"id": "BET", "name": "Real Betis", "short": "Betis", "c1": "#00954c", "c2": "#ffffff", "stadium": "Estadio La Cartuja", "cap": 70000, "mgr": "Manuel Pellegrini", "capt": "Isco", "rep": 80, "bal": 55, "form": "4-2-3-1",sq:`
1|Álvaro Vallés|GK|29|ESP|79
13|Diego Conde|GK|28|ESP|74
3|Diego Llorente|CB|33|ESP|78
4|Natan|CB|25|BRA|79
5|Marc Bartra|CB|35|ESP|74
16|Valentín Gómez|CB|23|ARG|78
2|Héctor Bellerín|RB|31|ESP|77
24|Aitor Ruibal|RB|30|ESP|77
12|Ángel Ortiz|RB|22|ESP|74
23|Fran García|LB|27|ESP|78
15|Júnior Firpo|LB|30|DOM|76
21|Marc Roca|DM|29|ESP|79
18|Nelson Deossa|CM|26|COL|78
6|Facundo Bernal|CM|22|URU|73
8|Pablo Fornals|CM|30|ESP|80
25|Dani Ceballos|CM|30|ESP|80
22|Isco|AM|34|ESP|81
20|Giovani Lo Celso|AM|30|ARG|80
19|Álvaro Fidalgo|CM|29|MEX|78
17|Iker Losada|AM|25|ESP|74
7|Antony|RW|26|BRA|82
10|Abdessamad Ezzalzouli|LW|24|MAR|80
11|Rodrigo Riquelme|LW|26|ESP|77
27|Juan Hernández|RW|26|COL|76
9|Troy Parrott|ST|24|IRL|78
36|José Antonio Morante|ST|20|ESP|66
38|Dylan Vanney|LW|19|USA|65
`},
{"id": "ATH", "name": "Athletic Club", "short": "Athletic", "c1": "#ee2523", "c2": "#ffffff", "stadium": "San Mamés", "cap": 53289, "mgr": "Edin Terzić", "capt": "Iñaki Williams", "rep": 81, "bal": 70, "form": "4-2-3-1",sq:`
1|Unai Simón|GK|29|ESP|84
27|Álex Padilla|GK|23|MEX|73
3|Daniel Vivian|CB|27|ESP|80
4|Aitor Paredes|CB|26|ESP|79
5|Yeray Álvarez|CB|31|ESP|77
14|Aymeric Laporte|CB|32|ESP|80
26|Unai Eguiluz|CB|23|ESP|72
12|Jesús Areso|RB|27|ESP|77
15|Hugo Rincón|RB|22|ESP|74
17|Yuri Berchiche|LB|36|ESP|74
33|Johaneko Louis-Jean|LB|22|FRA|70
18|Mikel Jauregizar|DM|22|ESP|79
16|Iñigo Ruiz de Galarreta|CM|33|ESP|77
24|Beñat Prados|CM|25|ESP|77
30|Alejandro Rego|CM|23|ESP|74
35|Beñat Gerenabarrena|CM|21|ESP|69
8|Oihan Sancet|AM|26|ESP|83
28|Peio Canales|AM|21|ESP|72
11|Álvaro Djaló|LW|27|GNB|75
10|Nico Williams|LW|24|ESP|86
9|Iñaki Williams|RW|32|GHA|80
7|Alex Berenguer|RW|31|ESP|78
23|Robert Navarro|RW|24|ESP|76
19|Gorka Guruzeta|ST|30|ESP|78
21|Maroan Sannadi|ST|25|MAR|74
22|Nico Serrano|LW|23|ESP|71
`},
{"id": "RSO", "name": "Real Sociedad", "short": "Real Sociedad", "c1": "#0067b1", "c2": "#ffffff", "stadium": "Reale Arena", "cap": 39313, "mgr": "Pellegrino Matarazzo", "capt": "Mikel Oyarzabal", "rep": 80, "bal": 60, "form": "4-3-3",sq:`
1|Alex Remiro|GK|31|ESP|83
13|Unai Marrero|GK|25|ESP|73
5|Igor Zubeldia|CB|29|ESP|79
16|Jon Martín|CB|20|ESP|76
20|Jon Pacheco|CB|25|ESP|77
31|Luken Beitia|CB|21|ESP|68
19|Mamadou Sarr|CB|21|SEN|77
2|Jon Aramburu|RB|24|VEN|78
12|Álvaro Odriozola|RB|30|ESP|74
22|Héctor Fort|RB|20|ESP|74
3|Aihen Muñoz|LB|29|ESP|76
17|Sergio Gómez|LB|26|ESP|79
4|Jon Gorrotxategi|DM|23|ESP|75
8|Beñat Turrientes|CM|24|ESP|77
21|Yangel Herrera|CM|28|VEN|79
18|Carlos Soler|CM|29|ESP|80
24|Luka Sučić|AM|24|CRO|80
14|Takefusa Kubo|RW|25|JPN|83
7|Ander Barrenetxea|LW|24|ESP|79
11|Gonçalo Guedes|LW|29|POR|79
23|Arsen Zakharyan|AM|23|RUS|79
15|Pablo Marín|AM|23|ESP|74
10|Mikel Oyarzabal|ST|29|ESP|84
9|Orri Óskarsson|ST|22|ISL|77
36|Job Ochieng|ST|19|KEN|66
37|Álex Marchal|LW|20|ESP|65
38|Arkaitz Mariezkurrena|ST|20|ESP|64
`},
{"id": "SEV", "name": "Sevilla", "short": "Sevilla", "c1": "#ffffff", "c2": "#d81022", "stadium": "Ramón Sánchez-Pizjuán", "cap": 43883, "mgr": "Luis García", "capt": "Gabriel Suazo", "rep": 78, "bal": 35, "form": "4-2-3-1",sq:`
1|Odysseas Vlachodimos|GK|32|GRE|78
31|Fran González|GK|21|ESP|68
4|Kike Salas|CB|24|ESP|76
5|Andrés López|CB|26|ESP|74
14|Arouna Sangante|CB|24|SEN|74
3|Fábio Cardoso|CB|32|POR|74
23|Marcão|CB|30|BRA|75
33|Julio Díaz|CB|20|ESP|66
2|Juan Iglesias|RB|28|ESP|75
12|José Ángel Carmona|RB|24|ESP|76
17|Gabriel Suazo|LB|29|CHI|77
6|Lucien Agoumé|DM|24|FRA|77
18|Giorgi Kochorashvili|CM|27|GEO|74
24|Youssouf Fofana|CM|27|FRA|78
22|Manu Bueno|CM|22|ESP|71
10|Peque Fernández|AM|24|ESP|74
8|Jon Guridi|CM|31|ESP|74
34|Nico Guillén|CM|20|ESP|65
11|Rubén Vargas|LW|28|SUI|78
21|Chidera Ejuke|LW|28|NGA|77
7|Alfon González|LW|27|ESP|75
20|Félix Correia|RW|25|POR|75
16|Isaac Romero|ST|26|ESP|77
19|Lucas Stassin|ST|21|BEL|77
9|Robbie Ure|ST|22|SCO|68
38|Miguel Sierra|ST|19|ESP|64
`},
{"id": "CEL", "name": "Celta Vigo", "short": "Celta", "c1": "#8ac3ee", "c2": "#ffffff", "stadium": "Estadio Abanca Balaídos", "cap": 24870, "mgr": "Claudio Giráldez", "capt": "Iago Aspas", "rep": 76, "bal": 30, "form": "4-3-3",sq:`
13|Ionuț Radu|GK|29|ROU|77
1|Altay Bayındır|GK|28|TUR|75
25|Iván Villar|GK|29|ESP|71
2|Carl Starfelt|CB|31|SWE|76
3|Marcos Alonso|CB|35|ESP|75
18|Yoel Lago|CB|23|ESP|74
20|Javi Rodríguez|CB|23|ESP|76
5|Sebastián Cáceres|CB|26|URU|75
32|Abdoulaye Faye|CB|20|SEN|68
24|Álvaro Núñez|RB|26|ESP|74
17|Javi Rueda|RB|22|ESP|74
22|Javi Galán|LB|31|ESP|75
21|Sergio Carreira|RB|26|ESP|73
6|Ilaix Moriba|CM|23|GUI|77
14|Aleix Febas|CM|30|ESP|74
8|Miguel Román|CM|24|ESP|74
30|Jones El-Abdellaoui|AM|20|MAR|68
10|Iago Aspas|ST|39|ESP|75
7|Borja Iglesias|ST|33|ESP|77
9|Ferran Jutglà|ST|27|ESP|76
11|Pablo Durán|ST|25|ESP|75
23|Hugo Álvarez|LW|23|ESP|76
19|Williot Swedberg|RW|22|SWE|75
16|Hugo González|LW|20|ESP|67
26|Couhaib Driouech|RW|24|MAR|74
`},
{"id": "GET", "name": "Getafe", "short": "Getafe", "c1": "#005999", "c2": "#ffffff", "stadium": "Coliseum", "cap": 16500, "mgr": "José Bordalás", "capt": "Djené", "rep": 72, "bal": 20, "form": "4-4-2",sq:`
13|David Soria|GK|33|ESP|77
1|Jiří Letáček|GK|27|CZE|72
2|Djené|CB|34|TOG|75
3|Abdelkabir Abqar|CB|27|MAR|75
4|Saba Sazonov|CB|24|GEO|73
15|Sebastián Boselli|CB|23|URU|73
8|Nemanja Gudelj|CB|35|SRB|74
30|Davinchi|CB|19|ESP|67
5|Zaid Romero|CB|27|ARG|72
14|Daniel Carvajal|RB|34|ESP|78
17|Kiko Femenía|RB|35|ESP|71
26|Jean Ives Valou|RB|21|CIV|66
22|Johan Mojica|LB|34|COL|73
6|Mario Martín|DM|22|ESP|74
11|Ramón Terrats|CM|26|ESP|74
16|Francho Serrano|CM|25|ESP|73
18|Orel Mangala|CM|28|BEL|76
21|Andrés García|CM|23|ESP|70
33|Alberto Risco|CM|20|ESP|65
7|Juanmi|LW|33|ESP|73
19|Borja Mayoral|ST|29|ESP|77
10|Martín Satriano|ST|25|URU|75
9|Christantus Uche|ST|23|NGA|74
23|Enes Ünal|ST|29|TUR|75
20|Iván Azón|ST|23|ESP|74
`},
{"id": "RAY", "name": "Rayo Vallecano", "short": "Rayo", "c1": "#ffffff", "c2": "#e2001a", "stadium": "Estadio de Vallecas", "cap": 14708, "mgr": "Beñat San José", "capt": "Óscar Valentín", "rep": 72, "bal": 18, "form": "4-2-3-1",sq:`
13|Augusto Batalla|GK|30|ARG|77
25|Emil Audero|GK|29|IDN|75
1|Dani Cárdenas|GK|29|ESP|71
24|Florian Lejeune|CB|35|FRA|75
5|Marash Kumbulla|CB|26|ALB|74
3|Luiz Felipe|CB|29|ITA|75
32|Pelayo Fernández|CB|23|ESP|68
15|Mujaid Sadick|CB|26|ESP|72
2|Andrei Rațiu|RB|28|ROU|77
20|Iván Balliu|RB|34|ALB|73
33|Jozhua Vertrouwd|LB|22|NED|72
17|Adrià Pedrosa|LB|28|ESP|74
6|Pathé Ciss|DM|32|SEN|76
23|Óscar Valentín|DM|32|ESP|74
8|Unai López|CM|31|ESP|76
4|Pedro Díaz|CM|28|ESP|75
30|Gnangoro Bouare|CM|20|ESP|65
7|Isi Palazón|RW|31|ESP|78
19|Jorge de Frutos|RW|29|ESP|77
18|Álvaro García|LW|34|ESP|75
11|Giorgi Tsitaishvili|LW|26|GEO|73
21|Fran Pérez|RW|24|ESP|73
36|Rayane Belaid|LW|19|ESP|64
10|Sergio Camello|ST|25|ESP|76
9|Alemão|ST|28|BRA|74
22|Randy Nteka|ST|29|ANG|72
14|Raúl de Tomás|ST|31|ESP|73
`},
{"id": "VAL", "name": "Valencia", "short": "Valencia", "c1": "#ffffff", "c2": "#ee3524", "stadium": "Mestalla", "cap": 49430, "mgr": "Javier Aguirre", "capt": "José Gayà", "rep": 77, "bal": 30, "form": "4-4-2",sq:`
1|Stole Dimitrievski|GK|33|MKD|76
13|Cristian Rivero|GK|28|ESP|70
31|Kayne van Oevelen|GK|20|NED|65
4|Mouctar Diakhaby|CB|29|GUI|77
5|César Tárrega|CB|24|ESP|77
3|José Copete|CB|27|ESP|74
12|Justin de Haas|CB|26|NED|72
32|Iker Córdoba|CB|19|ESP|64
20|Dimitri Foulquier|RB|33|GLP|72
24|Pablo Maffeo|RB|29|ARG|75
21|Arnau Martínez|RB|23|ESP|72
14|José Gayà|LB|31|ESP|77
15|Jesús Vázquez|LB|23|ESP|74
2|Guido Rodríguez|DM|32|ARG|77
18|Pepelu|DM|28|ESP|77
8|Javi Guerra|CM|23|ESP|79
6|Aliou Dieng|CM|29|MLI|73
23|Filip Ugrinić|CM|27|SUI|76
10|Harvey Elliott|AM|23|ENG|79
27|Ryunosuke Sato|AM|20|JPN|68
35|Aaron Mayol|CM|19|ESP|64
36|David Otorbi|AM|19|ESP|64
11|Luis Rioja|LW|32|ESP|75
7|Arnaut Danjuma|LW|29|NED|76
17|Sergi Canós|RW|29|ESP|74
16|Diego López|RW|24|ESP|76
9|Hugo Duro|ST|26|ESP|77
19|Umar Sadiq|ST|29|NGA|73
22|Dani Raba|ST|31|ESP|73
`},
{"id": "OSA", "name": "Osasuna", "short": "Osasuna", "c1": "#da0b1f", "c2": "#0a346f", "stadium": "El Sadar", "cap": 23576, "mgr": "Jagoba Arrasate", "capt": "Kike Barja", "rep": 72, "bal": 18, "form": "4-2-3-1",sq:`
1|Sergio Herrera|GK|33|ESP|77
13|Aitor Fernández|GK|35|ESP|73
24|Alejandro Catena|CB|31|ESP|77
5|Jorge Herrando|CB|25|ESP|73
22|Flavien Boyomo|CB|24|CMR|74
31|Unai Santos|CB|20|ESP|64
32|Asier Osambela|CB|21|ESP|65
19|Valentin Rosier|RB|30|FRA|74
33|Iñigo Arguibide|RB|21|ESP|64
23|Abel Bretones|LB|26|ESP|75
15|Diego Rico|LB|33|ESP|72
34|Rockson Yeboah|CB|22|GHA|64
6|Lucas Torró|DM|32|ESP|76
7|Jon Moncayola|CM|28|ESP|76
8|Iker Muñoz|CM|24|ESP|74
10|Aimar Oroz|AM|25|ESP|77
16|Moi Gómez|AM|32|ESP|75
14|Rubén García|LW|33|ESP|75
11|Enrique Barja|LW|29|ESP|73
17|Romain Del Castillo|RW|30|FRA|76
21|Raúl Moro|RW|23|ESP|73
20|Jonathan Dubasin|RW|25|BEL|72
2|Ante Budimir|ST|35|CRO|77
9|Raúl García|ST|25|ESP|75
`},
{"id": "EPY", "name": "Espanyol", "short": "Espanyol", "c1": "#007fc8", "c2": "#ffffff", "stadium": "RCDE Stadium", "cap": 37776, "mgr": "Manolo González", "capt": "Javi Puado", "rep": 71, "bal": 18, "form": "4-2-3-1",sq:`
13|Marko Dmitrović|GK|34|SRB|77
1|Ángel Fortuno|GK|25|ESP|69
6|Leandro Cabrera|CB|35|URU|75
5|Clemens Riedel|CB|23|GER|73
16|Vanja Drkušić|CB|27|SVN|72
31|Roger Hinojo|CB|20|ESP|65
2|Andoni Gorosabel|RB|30|ESP|74
23|Omar El Hilali|RB|23|MAR|74
3|Quilindschy Hartman|LB|25|NED|74
4|Urko González|DM|25|ESP|75
8|Edu Expósito|CM|30|ESP|76
10|Pol Lozano|CM|26|ESP|75
30|Rafel Bauzà|CM|20|ESP|65
21|Gabriel Moscardo|DM|21|BRA|72
28|Javi Hernández|CM|21|ESP|66
17|Jofre Carreras|RW|25|ESP|74
24|Tyrhys Dolan|LW|24|ENG|74
7|Javi Puado|ST|28|ESP|77
9|Roberto Fernández|ST|24|ESP|75
19|Kike García|ST|36|ESP|72
11|Pere Milla|LW|34|ESP|72
15|Bryan Zaragoza|LW|25|ESP|76
34|Marcos Fernández|RW|22|ESP|66
22|Álex Calatrava|RW|22|ESP|68
`},
{"id": "ALA", "name": "Alavés", "short": "Alavés", "c1": "#0761af", "c2": "#ffffff", "stadium": "Mendizorrotza", "cap": 19840, "mgr": "Quique Sánchez Flores", "capt": "Antonio Sivera", "rep": 70, "bal": 15, "form": "4-4-2",sq:`
1|Antonio Sivera|GK|30|ESP|77
13|Adrián Rodríguez|GK|25|ESP|66
2|Nicolás Valentini|CB|25|ARG|73
5|Facundo Garcés|CB|27|MAS|74
4|Youssef Enríquez|CB|21|MAR|68
16|Ville Koski|CB|25|FIN|72
22|Hugo Novoa|RB|23|ESP|71
14|Nahuel Tenaglia|RB|30|ARG|75
17|Jonny Otto|RB|32|ESP|74
3|Carlos Protesoni|LB|28|URU|72
8|Antonio Blanco|DM|26|ESP|76
6|Ander Guevara|DM|29|ESP|74
23|Denis Suárez|AM|32|ESP|74
10|Carles Aleñá|CM|28|ESP|75
19|Pablo Ibáñez|CM|27|ESP|74
7|Ángel Pérez|RW|24|ESP|70
21|Abderrahman Rebbach|LW|28|ALG|73
25|Mikel Rodríguez|LW|23|ESP|69
30|Selu Diallo|CM|20|ESP|64
15|Lucas Boyé|ST|30|ARG|76
11|Toni Martínez|ST|29|ESP|75
9|Mariano Díaz|ST|33|DOM|72
20|Aitor Mañas|ST|22|ESP|68
31|Miguel Rodríguez|RW|21|ESP|65
34|Lander Pinillos|ST|19|ESP|62
`},
{"id": "LEV", "name": "Levante", "short": "Levante", "c1": "#004a8f", "c2": "#b5121b", "stadium": "Ciutat de València", "cap": 26354, "mgr": "Luís Castro", "capt": "Pablo Martínez", "rep": 68, "bal": 15, "form": "4-4-2",sq:`
1|Mathew Ryan|GK|34|AUS|76
13|Pablo Campos|GK|24|ESP|68
23|Aïssa Mandi|CB|35|ALG|73
4|Adrián de la Fuente|CB|27|ESP|72
5|Jorge Cabello|CB|23|ESP|69
28|Ifeanyi Ndukwe|CB|21|AUT|67
2|Jeremy Toljan|RB|32|GER|72
3|Manuel Sánchez|LB|26|ESP|72
22|Marc Santos|RB|23|ESP|67
30|Axel Tape|RB|19|FRA|66
33|Nacho Pérez|LB|20|ESP|63
6|Oriol Rey|DM|28|ESP|73
8|Jon Olasagasti|CM|26|ESP|73
16|Hugo Sotelo|CM|23|ESP|71
14|Enzo Bardeli|CM|22|FRA|71
10|Dani Requena|AM|24|ESP|71
7|Roger Brugué|RW|29|ESP|73
11|Víctor García|LW|29|ESP|71
20|Jorge de Asís|LW|21|ARG|68
21|Thiago Fernández|RW|22|ARG|67
9|Iván Romero|ST|25|ESP|74
19|Petar Ratkov|ST|23|SRB|72
18|Etta Eyong|ST|23|CMR|75
29|Yanis Musuayi|ST|20|BEL|64
35|Paco Cortés|ST|21|ESP|63
`},
{"id": "ELC", "name": "Elche", "short": "Elche", "c1": "#ffffff", "c2": "#05642c", "stadium": "Martínez Valero", "cap": 31388, "mgr": "Martín Anselmi", "capt": "Pedro Bigas", "rep": 68, "bal": 14, "form": "3-4-3",sq:`
13|Matías Dituro|GK|39|ARG|73
1|Alejandro Iturbe|GK|22|ESP|70
6|Pedro Bigas|CB|36|ESP|71
5|Bambo Diaby|CB|29|ESP|72
4|Víctor Chust|CB|26|ESP|73
24|Kevin Lomónaco|CB|24|ARG|72
17|Roy Revivo|LB|23|ISR|69
2|Buba Sangaré|RB|24|ESP|68
31|Matia Barzić|CB|19|ESP|62
16|Federico Redondo|DM|23|ARG|74
8|Marc Aguado|DM|26|ESP|74
14|Martim Neto|CM|23|POR|73
10|Gonzalo Villar|CM|28|ESP|74
21|Thomas Lemar|AM|30|FRA|75
20|Facundo Buonanotte|AM|21|ARG|75
11|Yago Santiago|LW|23|ESP|70
7|Germán Valera|RW|24|ESP|73
22|Grady Diangana|RW|28|COD|73
23|Tete Morente|LW|30|ESP|72
28|Ali Houary|CM|22|MAR|66
29|Adam Boayar|RW|21|MAR|66
34|Javi Morcillo|CM|19|ESP|62
3|Rubén Sánchez|RB|25|ESP|66
19|Lucas Cepeda|RW|23|CHI|72
9|Ezequiel Ponce|ST|29|ARG|73
18|Fer Niño|ST|26|ESP|72
15|Josan|RW|36|ESP|68
26|Abiel Osorio|ST|23|ARG|68
`},
{"id": "RAC", "name": "Racing Santander", "short": "Racing", "c1": "#00a34f", "c2": "#ffffff", "stadium": "El Sardinero", "cap": 22308, "mgr": "José Alberto López", "capt": "Íñigo Sainz-Maza", "rep": 66, "bal": 10, "form": "4-2-3-1",sq:`
13|Julen Agirrezabala|GK|26|ESP|75
1|Simon Eriksson|GK|25|SWE|67
2|Álvaro Mantilla|RB|25|ESP|72
4|Manu Hernando|CB|27|ESP|70
5|Pablo Ramón|CB|25|ESP|70
6|Facundo González|CB|23|URU|71
15|Pedro Felipe|CB|23|BRA|67
17|Jorge Salinas|LB|26|ESP|70
24|Jeanuël Belocian|LB|21|FRA|71
8|Aarón Martín|CM|27|ESP|70
14|Íñigo Sainz-Maza|CM|29|ESP|71
16|André Almeida|CM|26|POR|74
22|Maguette Gueye|DM|26|SEN|70
18|Matteo Prati|DM|22|ITA|71
20|Sergio Canales|AM|35|ESP|75
23|Iván Martín|AM|27|ESP|73
10|Íñigo Vicente|LW|28|ESP|75
11|Andrés Martín|RW|27|ESP|74
7|Giorgi Guliashvili|LW|24|GEO|69
9|Juan Carlos Arana|ST|26|ESP|71
19|Asier Villalibre|ST|29|ESP|70
26|Pablo García|ST|21|ESP|66
27|Iker Luque|ST|22|ESP|65
21|Yassir Zabiri|ST|21|MAR|70
`},
{"id": "DEP", "name": "Deportivo de La Coruña", "short": "Deportivo", "c1": "#0055a5", "c2": "#ffffff", "stadium": "Abanca-Riazor", "cap": 32660, "mgr": "Antonio Hidalgo", "capt": "Diego Villares", "rep": 68, "bal": 14, "form": "4-2-3-1",sq:`
1|Germán Parreño|GK|33|ESP|70
13|Leo Román|GK|26|ESP|72
25|Álvaro Fernández|GK|28|ESP|69
2|Adrià Altimira|RB|25|ESP|72
22|Ximo Navarro|RB|36|ESP|68
4|Arnau Comas|CB|26|ESP|71
5|Lucas Noubi|CB|21|BEL|69
6|Dani Barcia|CB|23|ESP|70
20|José Giménez|CB|23|URU|70
15|Miguel Loureiro|CB|29|ESP|70
30|Bright Ede|CB|21|POL|66
12|Giacomo Quagliata|LB|26|ITA|71
3|Angeliño|LB|29|ESP|74
14|Marc Casadó|DM|23|ESP|76
8|Diego Villares|CM|30|ESP|72
18|Riki Rodríguez|CM|28|ESP|71
16|Lorenzo Amatucci|DM|22|ITA|70
21|Mario Soriano|AM|24|ESP|74
7|Luismi Cruz|RW|25|ESP|72
33|Yayo|CM|20|ESP|62
34|Noé|CM|19|ESP|62
10|Yeremay Hernández|LW|24|ESP|77
11|David Mella|RW|21|ESP|73
17|Adama Traoré|RW|30|ESP|74
28|Kevin Sánchez|LW|22|ESP|66
9|Pierre-Emerick Aubameyang|ST|37|GAB|73
19|Zakaria Eddahchouri|ST|26|NED|71
29|Jonathan Asp|ST|20|DEN|65
32|Bil Nsongo|ST|20|CMR|64
`},
{"id": "MAL", "name": "Málaga", "short": "Málaga", "c1": "#5bc2e7", "c2": "#ffffff", "stadium": "La Rosaleda", "cap": 30044, "mgr": "Juan Francisco Funes", "capt": "Ramón Enríquez", "rep": 66, "bal": 10, "form": "4-2-3-1",sq:`
1|Alfonso Herrero|GK|32|ESP|71
13|Carlos López|GK|26|ESP|66
2|Carlos Puga|RB|25|ESP|69
4|Einar Galilea|CB|31|ESP|70
5|Álex Pastor|CB|26|ESP|69
12|José Salinas|LB|25|ESP|69
15|Diego Murillo|CB|23|ESP|66
6|Fernando Calero|CB|31|ESP|71
25|Juan Berrocal|CB|27|ESP|70
31|Rafita|RB|22|ESP|66
3|Adam Aznou|LB|20|MAR|69
8|Jens-Lys Cajuste|CM|27|SWE|73
16|Ramón Enríquez|CM|29|ESP|69
18|Carlos Dotor|CM|25|ESP|72
14|Rafa Rodríguez|CM|24|ESP|69
20|Pablo Martínez|CM|28|ESP|68
22|Dani Lorenzo|CM|22|ESP|70
23|Izan Merino|DM|20|ESP|67
34|Aarón Ochoa|AM|20|IRL|64
21|Haitam Abaida|LW|22|MAR|68
10|David Larrubia|AM|24|ESP|72
11|Joaquín Muñoz|LW|26|ESP|71
7|Julen Lobete|RW|26|ESP|70
9|Chupe|ST|23|ESP|70
17|Eneko Jauregi|ST|27|ESP|69
19|Juan Cruz|ST|25|ESP|67
27|Adrián Niño|ST|22|ESP|67
`},
];
const SEG_CLUBS = [["Mallorca", 67, "Estadi Mallorca Son Moix", 23142, 0], ["Girona", 67, "Montilivi", 14624, 0], ["Real Oviedo", 65, "Carlos Tartiere", 30500, 0], ["Almería", 65, "Power Horse Stadium", 18331, 0], ["Castellón", 64, "Castalia", 15500, 0], ["Las Palmas", 64, "Estadio de Gran Canaria", 32400, 0], ["Eibar", 63, "Ipurua", 8164, 0], ["Leganés", 63, "Butarque", 12454, 0], ["Granada", 63, "Nuevo Los Cármenes", 19336, 0], ["Valladolid", 63, "José Zorrilla", 27618, 0], ["Sporting Gijón", 62, "El Molinón", 29371, 0], ["Cádiz", 62, "Nuevo Mirandilla", 20724, 0], ["Burgos", 61, "El Plantío", 12200, 0], ["Córdoba", 61, "Nuevo Arcángel", 25100, 0], ["Tenerife", 60, "Heliodoro Rodríguez López", 22824, 0], ["Andorra", 60, "Estadi Nacional", 3306, 0], ["Albacete", 60, "Carlos Belmonte", 17524, 0], ["Sabadell", 58, "Nova Creu Alta", 11981, 0], ["Eldense", 57, "Nuevo Pepico Amat", 4036, 0], ["Ceuta", 57, "Alfonso Murube", 6500, 0], ["Real Sociedad B", 57, "Zubieta", 2500, 1], ["Celta Fortuna", 56, "Barreiro", 4500, 1]];
const PF_CLUBS = [["Zaragoza", 59], ["Huesca", 58], ["Mirandés", 58], ["Cultural Leonesa", 57], ["Racing Ferrol", 56], ["Real Murcia", 56], ["Hércules", 55], ["Ponferradina", 55], ["Alcorcón", 54], ["Lugo", 54], ["Gimnàstic", 55], ["Ibiza", 54], ["Algeciras", 53], ["Antequera", 53], ["Unionistas", 52], ["Arenteiro", 52], ["Atlético Baleares", 52], ["Tarazona", 51], ["Real Unión", 52], ["Sestao River", 51]];
// stadium facts (opening year, stand names); record attendances not verified
const LL_STADIA = {"RMA": {"o": "1947", "rec": null, "pitch": "105 × 68 m", "st": ["Lateral Oeste", "Lateral Este", "Fondo Sur", "Fondo Norte"], "bowl": 1}, "BAR": {"o": "1957", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Lateral", "Gol Nord", "Gol Sud"], "bowl": 1}, "ATM": {"o": "1994 (Atlético since 2017)", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Oeste", "Tribuna Este", "Fondo Sur", "Fondo Norte"], "bowl": 1}, "VIL": {"o": "1923", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Preferencia", "Fondo Norte", "Fondo Sur"], "c": 1}, "BET": {"o": "1999 (Betis since 2025)", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Preferencia", "Gol Norte", "Gol Sur"], "bowl": 1}, "ATH": {"o": "2013", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Principal", "Tribuna Este", "Tribuna Norte", "Tribuna Sur"], "c": 1}, "RSO": {"o": "1993", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Principal", "Tribuna Este", "Fondo Norte", "Fondo Sur"], "bowl": 1}, "SEV": {"o": "1958", "rec": null, "pitch": "105 × 68 m", "st": ["Preferencia", "Fondo", "Gol Norte", "Gol Sur"], "bowl": 1}, "CEL": {"o": "1928", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Río", "Marcador", "Gol"]}, "GET": {"o": "1998", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Preferencia", "Fondo Norte", "Fondo Sur"], "c": 1}, "RAY": {"o": "1976", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Preferencia", "Fondo", "Muro"]}, "VAL": {"o": "1923", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Central", "Grada de Preferencia", "Gol Norte", "Gol Sur"], "c": 1}, "OSA": {"o": "1967", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Principal", "Tribuna Preferencia", "Gol Norte", "Gol Sur"], "c": 1}, "EPY": {"o": "2009", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Lateral", "Gol Nord", "Gol Sud"], "bowl": 1}, "ALA": {"o": "1924", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna Principal", "Preferencia", "Fondo Norte", "Fondo Sur"], "c": 1}, "LEV": {"o": "1969", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Lateral", "Gol Nord", "Gol Sud"], "c": 1}, "ELC": {"o": "1976", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Preferencia", "Fondo Norte", "Fondo Sur"], "bowl": 1}, "RAC": {"o": "1988", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Preferencia", "Fondo Norte", "Fondo Sur"], "c": 1}, "DEP": {"o": "1944", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Preferencia", "Pabellón", "Maratón"], "c": 1}, "MAL": {"o": "1941", "rec": null, "pitch": "105 × 68 m", "st": ["Tribuna", "Preferencia", "Fondo Norte", "Fondo Sur"], "c": 1}};
// Spain: players based abroad (outside the game's leagues), caps|goals, all-time records
const ESP_ABROAD = [["Fabián Ruiz", "CM", 30, "Paris SG", 85], ["Ferran Torres", "ST", 26, "Paris SG", 83], ["Josep Martínez", "GK", 28, "Inter", 79], ["Iván Fresneda", "RB", 22, "Sporting CP", 77]];
const ESP_CAPS = [["David Raya", "14", "0"], ["Josep Martínez", "1", "0"], ["Unai Simón", "67", "0"], ["Dean Huijsen", "7", "0"], ["Alejandro Grimaldo", "14", "0"], ["Eric García", "22", "0"], ["Pau Cubarsí", "21", "0"], ["Marc Pubill", "4", "0"], ["Aymeric Laporte", "55", "2"], ["Marc Cucurella", "33", "1"], ["Iván Fresneda", "0", "0"], ["Mikel Merino", "52", "12"], ["Fabián Ruiz", "51", "7"], ["Fermín López", "7", "0"], ["Álex Baena", "25", "4"], ["Rodri", "71", "4"], ["Martin Zubimendi", "27", "3"], ["Pedri", "50", "6"], ["Ferran Torres", "66", "25"], ["Dani Olmo", "59", "12"], ["Yeremy Pino", "25", "4"], ["Nico Williams", "37", "6"], ["Lamine Yamal", "34", "8"], ["Mikel Oyarzabal", "62", "31"], ["Roberto Fernández", "0", "0"], ["Pedro Porro", "~20", "0"], ["Koke", "~72", "~2"], ["Daniel Carvajal", "~52", "~1"], ["Isco", "~38", "~12"], ["Carlos Espí", "0", "0"]];
const NAT_REC = {"ESP": {"caps": [["Sergio Ramos", 180], ["Iker Casillas", 167], ["Sergio Busquets", 143], ["Xavi", 133], ["Andrés Iniesta", 131]], "goals": [["David Villa", 59], ["Raúl", 44], ["Fernando Torres", 38], ["Álvaro Morata", 37], ["David Silva", 35]]}};
const FIRST_ES = ["Pablo", "Álvaro", "Hugo", "Mario", "Daniel", "Adrián", "Iker", "Unai", "Jon", "Marc", "Pol", "Sergio", "Javier", "Carlos", "Diego", "Rubén", "Alejandro", "Raúl", "Iván", "Aitor", "Asier", "Gorka", "Oier", "Nico", "Marcos", "Ander", "Óscar", "Víctor", "Bruno", "Gonzalo", "Izan", "Eneko", "Jorge", "Manu", "Rafa", "Joan", "Arnau", "Xabi", "Mikel", "Andrés"];
const LAST_ES = ["García", "Martínez", "López", "Sánchez", "Pérez", "Gómez", "Fernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero", "Navarro", "Torres", "Domínguez", "Vázquez", "Ramos", "Gil", "Serrano", "Blanco", "Molina", "Ortega", "Delgado", "Castro", "Rubio", "Marín", "Sanz", "Iglesias", "Medina", "Garrido", "Cortés", "Castillo", "Santos", "Lozano", "Guerrero", "Cano", "Prieto", "Méndez", "Calvo", "Gallego", "Vidal", "León", "Herrera", "Márquez", "Peña", "Flores", "Cabrera", "Campos", "Vega", "Fuentes", "Carrasco", "Caballero", "Reyes", "Nieto", "Aguilar", "Pascual", "Santana", "Herrero", "Lorenzo", "Montero", "Hidalgo", "Ibáñez", "Ferrer", "Benítez", "Mora", "Vicente", "Arias", "Vargas", "Carmona", "Crespo", "Román", "Pastor", "Soto", "Sáez", "Velasco", "Moya", "Soler", "Parra", "Esteban", "Bravo", "Gallardo", "Etxeberria", "Aguirre", "Goikoetxea", "Arrieta", "Larrañaga", "Iturriaga", "Urrutia"];
