// ===== DATA: Premier League 2026/27 (squads as of 24 Oct 2026; ratings are game estimates) =====
const PL_CLUBS = [
{id:'ARS',name:'Arsenal',c1:'#d61f2c',c2:'#ffffff',stadium:'Emirates Stadium',cap:60704,mgr:'Mikel Arteta',rep:93,bal:140,sq:`
1|David Raya|GK|31|ESP|86
13|Kepa Arrizabalaga|GK|32|ESP|77
30|Illan Meslier|GK|26|FRA|75
2|William Saliba|CB|25|FRA|89
3|Cristhian Mosquera|CB|22|ESP|77
4|Ben White|RB|29|ENG|82
5|Piero Hincapie|LB|24|ECU|82
6|Gabriel Magalhaes|CB|28|BRA|88
12|Jurrien Timber|RB|25|NED|84
15|Ezri Konsa|CB|29|ENG|82
33|Riccardo Calafiori|LB|24|ITA|82
49|Myles Lewis-Skelly|LB|20|ENG|80
89|Marli Salmon|CB|17|ENG|64
8|Martin Odegaard|AM|27|NOR|86
10|Eberechi Eze|AM|28|ENG|84
23|Mikel Merino|CM|30|ESP|82
36|Martin Zubimendi|DM|27|ESP|85
39|Bruno Guimaraes|DM|28|BRA|86
41|Declan Rice|CM|27|ENG|89
7|Bukayo Saka|RW|25|ENG|89
14|Viktor Gyokeres|ST|28|SWE|85
17|Christos Tzolis|LW|24|GRE|79
20|Noni Madueke|RW|24|ENG|81
29|Kai Havertz|ST|27|GER|84
43|Andre Harriman-Annous|LW|18|ENG|63
56|Max Dowman|AM|16|ENG|70
44|Ibrahim|CM|18|ENG|60
45|Julienne|CM|18|ENG|60`},
{id:'MCI',name:'Manchester City',short:'Man City',c1:'#6cabdd',c2:'#0b2a4a',stadium:'Etihad Stadium',cap:61038,mgr:'Enzo Maresca',rep:93,bal:160,sq:`
1|Gianluigi Donnarumma|GK|27|ITA|88
13|Marcus Bettinelli|GK|34|ENG|68
28|Geronimo Rulli|GK|34|ARG|78
3|Ruben Dias|CB|29|POR|87
6|Marc Guehi|CB|26|ENG|85
21|Rayan Ait-Nouri|LB|25|ALG|82
22|Vitor Reis|CB|20|BRA|74
24|Josko Gvardiol|LB|24|CRO|86
27|Matheus Nunes|RB|28|POR|80
33|Nico O'Reilly|LB|21|ENG|80
45|Abdukodir Khusanov|CB|22|UZB|80
82|Rico Lewis|RB|21|ENG|79
61|Kaden Braithwaite|CB|18|ENG|62
5|Elliot Anderson|DM|23|SCO|84
8|Mateo Kovacic|CM|32|CRO|80
10|Rayan Cherki|AM|23|FRA|86
17|Enzo Fernandez|CM|25|ARG|85
32|Ayyoub Bouaddi|DM|19|FRA|76
37|Allan|CM|22|BRA|74
47|Phil Foden|AM|26|ENG|86
7|Iliman Ndiaye|LW|26|SEN|81
9|Erling Haaland|ST|26|NOR|92
11|Jeremy Doku|LW|24|BEL|83
42|Antoine Semenyo|RW|26|GHA|84
56|McAidoo|ST|18|ENG|62
75|Floyd Samba|ST|16|FRA|60`},
{id:'LIV',name:'Liverpool',c1:'#c8102e',c2:'#00b2a9',stadium:'Anfield',cap:61276,mgr:'Andoni Iraola',rep:91,bal:110,sq:`
1|Alisson Becker|GK|34|BRA|87
25|Giorgi Mamardashvili|GK|26|GEO|82
28|Freddie Woodman|GK|29|ENG|68
56|Vitezslav Jaros|GK|25|CZE|70
2|Joe Gomez|CB|29|ENG|79
4|Virgil van Dijk|CB|35|NED|86
5|Jeremy Jacquet|CB|21|FRA|79
6|Milos Kerkez|LB|22|HUN|82
12|Conor Bradley|RB|23|NIR|80
15|Giovanni Leoni|CB|19|ITA|76
21|Kostas Tsimikas|LB|30|GRE|76
30|Jeremie Frimpong|RB|25|NED|82
33|Ronald Araujo|CB|27|URU|83
44|Luke Chambers|LB|22|ENG|70
3|Wataru Endo|DM|33|JPN|74
7|Florian Wirtz|AM|23|GER|88
8|Dominik Szoboszlai|CM|25|HUN|85
10|Alexis Mac Allister|CM|27|ARG|86
38|Ryan Gravenberch|DM|24|NED|86
42|Trey Nyoni|CM|19|ENG|72
53|James McConnell|CM|22|ENG|72
9|Alexander Isak|ST|26|SWE|87
14|Federico Chiesa|RW|28|ITA|77
18|Cody Gakpo|LW|27|NED|83
22|Hugo Ekitike|ST|24|FRA|84
23|Victor Munoz|LW|22|ESP|79
29|Bradley Barcola|LW|23|FRA|84
67|Lewis Koumas|RW|21|WAL|70
73|Rio Ngumoha|LW|18|ENG|74
76|Jayden Danns|ST|20|ENG|68`},
{id:'MUN',name:'Manchester United',short:'Man Utd',c1:'#da291c',c2:'#fbe122',stadium:'Old Trafford',cap:74158,mgr:'Michael Carrick',rep:89,bal:95,sq:`
1|Senne Lammens|GK|24|BEL|80
12|Karl Darlow|GK|35|WAL|68
22|Tom Heaton|GK|40|ENG|60
45|Dermot Mee|GK|23|NIR|60
2|Diogo Dalot|RB|27|POR|79
3|Noussair Mazraoui|RB|28|MAR|78
4|Matthijs de Ligt|CB|27|NED|81
5|Harry Maguire|CB|33|ENG|77
6|Lisandro Martinez|CB|28|ARG|82
13|Patrick Dorgu|LB|21|DEN|78
15|Leny Yoro|CB|20|FRA|80
23|Luke Shaw|LB|31|ENG|77
26|Ayden Heaven|CB|20|ENG|74
41|Harry Amass|LB|19|ENG|72
7|Mason Mount|AM|27|ENG|78
8|Bruno Fernandes|AM|32|POR|87
17|Andrey Santos|CM|22|BRA|80
18|Youri Tielemans|CM|29|BEL|80
20|Carlos Baleba|DM|22|CMR|82
25|Manuel Ugarte|DM|25|URU|76
37|Kobbie Mainoo|CM|21|ENG|80
38|Jack Fletcher|CM|19|ENG|66
39|Tyler Fletcher|CM|19|SCO|66
9|Marcus Rashford|LW|28|ENG|80
10|Matheus Cunha|AM|27|BRA|84
11|Joshua Zirkzee|ST|25|NED|76
16|Amad Diallo|RW|24|CIV|81
19|Bryan Mbeumo|RW|27|CMR|84
30|Benjamin Sesko|ST|23|SVN|82
31|Shea Lacey|RW|19|ENG|70`},
{id:'CHE',name:'Chelsea',c1:'#034694',c2:'#dba111',stadium:'Stamford Bridge',cap:40044,mgr:'Xabi Alonso',rep:89,bal:120,sq:`
1|Emiliano Martinez|GK|34|ARG|84
28|Teddy Sharman-Lowe|GK|23|ENG|66
39|Mike Penders|GK|21|BEL|74
44|Gabriel Slonina|GK|22|USA|68
2|Marco Palestra|RB|21|ITA|76
3|Wesley Fofana|CB|25|FRA|80
5|Maxence Lacroix|CB|26|FRA|81
6|Levi Colwill|CB|23|ENG|84
24|Reece James|RB|26|ENG|85
27|Malo Gusto|RB|23|FRA|80
29|Pep Chavarria|LB|28|ESP|77
30|Aaron Anselmino|CB|21|ARG|70
34|Josh Acheampong|CB|20|ENG|74
4|Valentin Barco|LB|22|ARG|76
7|Pedro Neto|RW|26|POR|83
10|Cole Palmer|AM|24|ENG|88
14|Jordan Henderson|CM|36|ENG|76
21|Jorrel Hato|LB|20|NED|79
23|Geovany Quenda|RW|19|POR|77
25|Moises Caicedo|DM|24|ECU|88
45|Romeo Lavia|DM|22|BEL|79
32|Mahdi Nicoll-Jazuli|CM|16|ENG|58
9|Joao Pedro|ST|25|BRA|84
11|Jamie Gittens|LW|22|ENG|79
17|Morgan Rogers|AM|24|ENG|84
18|Danny Welbeck|ST|35|ENG|74
22|Emmanuel Emegha|ST|23|NED|74
41|Estevao|RW|19|BRA|82`},
{id:'AVL',name:'Aston Villa',c1:'#670e36',c2:'#95bfe5',stadium:'Villa Park',cap:36887,mgr:'Unai Emery',rep:82,bal:60,sq:`
1|Zion Suzuki|GK|24|JPN|79
40|Marco Bizot|GK|35|NED|72
42|Wright|GK|21|ENG|58
2|Matty Cash|RB|29|POL|80
3|Victor Lindelof|CB|32|SWE|78
4|Taylor Harwood-Bellis|CB|24|ENG|75
5|Tyrone Mings|CB|33|ENG|76
13|Matteo Ruggeri|LB|24|ITA|76
14|Pau Torres|CB|29|ESP|82
22|Ian Maatsen|LB|24|NED|79
29|Aaron Wan-Bissaka|RB|28|ENG|77
35|Joao Gomes|DM|25|BRA|80
48|Cisse|CB|21|SEN|66
6|Ross Barkley|CM|32|ENG|75
7|John McGinn|AM|32|SCO|80
8|Boubacar Kamara|DM|26|FRA|83
10|Emiliano Buendia|AM|29|ARG|78
19|Mbaye|AM|18|FRA|70
24|Amadou Onana|CM|25|BEL|81
26|Lamare Bogarde|DM|22|NED|72
27|Leon Goretzka|CM|31|GER|79
44|Johan Manzambi|AM|21|SUI|78
47|Alysson Edward|AM|20|BRA|72
11|Nicolas Jackson|ST|25|SEN|80
17|Alejandro Garnacho|LW|22|ARG|79
18|Tammy Abraham|ST|29|ENG|75
53|George Hemmings|ST|19|ENG|68`},
{id:'TOT',name:'Tottenham Hotspur',short:'Spurs',c1:'#f4f4f4',c2:'#132257',stadium:'Tottenham Hotspur Stadium',cap:62850,mgr:'Roberto De Zerbi',rep:85,bal:110,sq:`
31|Antonin Kinsky|GK|23|CZE|77
39|Martin Dubravka|GK|37|SVK|72
40|Brandon Austin|GK|27|ENG|64
51|Jacob Knightbridge|GK|18|ENG|58
3|Andy Robertson|LB|32|SCO|79
4|Tosin Adarabioyo|CB|28|ENG|76
5|Marcos Senesi|CB|29|ARG|78
6|Jan Paul van Hecke|CB|26|NED|80
13|Destiny Udogie|LB|23|ITA|79
23|Pedro Porro|RB|27|ESP|81
33|Ben Davies|LB|33|WAL|73
37|Micky van de Ven|CB|25|NED|85
7|Xavi Simons|AM|23|NED|84
8|Conor Gallagher|CM|26|ENG|80
10|James Maddison|AM|29|ENG|81
14|Archie Gray|CM|20|ENG|77
15|Lucas Bergvall|CM|20|SWE|79
16|Sandro Tonali|DM|26|ITA|85
18|Mateus Fernandes|CM|22|POR|77
30|Rodrigo Bentancur|DM|29|URU|79
11|Mathys Tel|ST|21|FRA|77
17|Savio|RW|22|BRA|81
19|Dominic Solanke|ST|28|ENG|80
20|Mohammed Kudus|RW|26|GHA|83
21|Dejan Kulusevski|RW|26|SWE|81
22|Omar Marmoush|ST|27|EGY|83
27|Mykhailo Mudryk|LW|25|UKR|74
28|Wilson Odobert|LW|21|FRA|76
47|Mikey Moore|RW|19|ENG|74
68|Luca Williams-Barnett|RW|18|ENG|62`},
{id:'NEW',name:'Newcastle United',short:'Newcastle',c1:'#241f20',c2:'#f4f4f4',stadium:"St James' Park",cap:52729,mgr:'Matthias Jaissle',rep:84,bal:90,sq:`
1|Nick Pope|GK|34|ENG|81
21|Lukas Hornicek|GK|24|CZE|73
24|Ewen Jaouen|GK|23|FRA|64
29|Mark Gillespie|GK|34|ENG|62
2|Tino Livramento|RB|23|ENG|81
3|Lewis Hall|LB|21|ENG|80
4|Sven Botman|CB|26|NED|81
5|Fabian Schar|CB|34|SUI|77
12|Malick Thiaw|CB|25|GER|81
33|Dan Burn|CB|34|ENG|77
37|Amar Dedic|RB|24|BIH|77
6|Nico Gonzalez|DM|24|ESP|79
7|Joelinton|CM|30|BRA|81
8|Aladji Bamba|CM|19|FRA|70
14|Sean Steur|CM|18|NED|68
17|Bazoumana Toure|LW|20|CIV|75
28|Joe Willock|CM|27|ENG|76
41|Jacob Ramsey|AM|25|ENG|78
67|Lewis Miley|CM|20|ENG|76
11|Harvey Barnes|LW|28|ENG|79
19|Anthony Elanga|RW|24|SWE|81
23|Jacob Murphy|RW|31|ENG|77
9|Yoane Wissa|ST|29|COD|81
10|William Osula|ST|23|DEN|75
20|Matias Fernandez-Pardo|ST|21|BEL|76`},
{id:'BOU',name:'Bournemouth',c1:'#b50e12',c2:'#111111',stadium:'Vitality Stadium',cap:12357,mgr:'Marco Rose',rep:74,bal:45,sq:`
1|Djordje Petrovic|GK|27|SRB|79
17|Fraser Forster|GK|38|ENG|66
20|Michele Di Gregorio|GK|29|ITA|80
3|Adrien Truffert|LB|24|FRA|78
5|James Hill|CB|24|ENG|76
6|Julio Soler|LB|21|ARG|70
14|Antonio Silva|CB|22|POR|81
15|Adam Smith|RB|35|ENG|70
18|Bafode Diakite|CB|25|FRA|76
44|Veljko Milosavljevic|CB|19|SRB|68
4|Lewis Cook|CM|29|ENG|76
7|David Brooks|RW|29|WAL|73
8|Alex Scott|CM|23|ENG|79
10|Ryan Christie|CM|31|SCO|74
11|Ben Doak|RW|20|SCO|76
12|Tyler Adams|DM|27|USA|79
16|Marcus Tavernier|AM|27|ENG|79
24|Juanlu Sanchez|RB|23|ESP|76
27|Alex Toth|CM|21|HUN|68
9|Evanilson|ST|27|BRA|80
19|Justin Kluivert|LW|27|NED|81
21|Amine Adli|RW|26|MAR|76
22|Eli Junior Kroupi|ST|20|FRA|74
29|Daniel Jebbison|ST|23|CAN|68
30|Rodriguez|ST|22|URU|72
37|Rayan|RW|20|BRA|77`},
{id:'SUN',name:'Sunderland',c1:'#eb172b',c2:'#f4f4f4',stadium:'Stadium of Light',cap:48095,mgr:'Regis Le Bris',rep:72,bal:40,sq:`
22|Robin Roefs|GK|23|NED|79
31|Melker Ellborg|GK|22|SWE|66
21|Simon Moore|GK|36|ENG|60
17|Reinildo Mandava|LB|32|MOZ|75
32|Trai Hume|RB|24|NIR|74
20|Nordi Mukiele|RB|28|FRA|77
12|Thomas Meunier|RB|34|BEL|72
4|Kevin Danso|CB|28|AUT|79
5|Dan Ballard|CB|26|NIR|76
6|Dayann Methalie|CB|21|FRA|64
15|Omar Alderete|CB|29|PAR|76
13|Luke O'Nien|CB|31|ENG|70
27|Noah Sadiki|DM|21|COD|77
28|Enzo Le Fee|AM|26|FRA|79
34|Granit Xhaka|CM|33|SUI|82
19|Habib Diarra|CM|22|SEN|78
11|Chris Rigg|CM|19|ENG|76
8|Alan Browne|CM|31|IRL|70
29|Jules Ahoka|CM|20|FRA|62
37|Jocelin Ta Bi|CM|20|CIV|70
10|Nilson Angulo|LW|23|ECU|75
39|Malick Fofana|LW|21|BEL|80
14|Romaine Mundle|LW|23|ENG|72
7|Chemsdine Talbi|RW|21|MAR|75
57|Tymur Tutierov|RW|21|UKR|66
18|Wilson Isidor|ST|26|FRA|77
9|Brian Brobbey|ST|24|NED|77`},
{id:'CRY',name:'Crystal Palace',short:'C Palace',c1:'#1b458f',c2:'#c4122e',stadium:'Selhurst Park',cap:25194,mgr:'Pierre Sage',rep:77,bal:50,sq:`
1|Dean Henderson|GK|29|ENG|80
44|Walter Benitez|GK|33|ARG|78
31|Remi Matthews|GK|32|ENG|62
3|Tyrick Mitchell|LB|27|ENG|79
4|Chadi Riad|CB|23|MAR|76
5|Axel Disasi|CB|28|FRA|79
6|Jaydee Canvot|CB|20|FRA|74
17|Takehiro Tomiyasu|RB|27|JPN|77
21|Honest Ahanor|CB|18|ITA|72
25|Anan Khalaili|RB|22|ISR|75
26|Chris Richards|CB|26|USA|79
30|Oscar Mingueza|RB|27|ESP|77
33|Ben Chilwell|LB|29|ENG|74
8|Jefferson Lerma|DM|31|COL|76
18|Daichi Kamada|AM|30|JPN|78
19|Will Hughes|CM|31|ENG|74
20|Adam Wharton|CM|22|ENG|83
23|Quinten Timber|CM|25|NED|77
10|Yeremy Pino|RW|23|ESP|80
11|Dwight McNeil|LW|26|ENG|78
12|Zavier Gozo|LW|19|USA|70
24|Dario Osorio|RW|22|CHI|74
9|Eddie Nketiah|ST|27|ENG|76
14|Jean-Philippe Mateta|ST|29|FRA|81
22|Jorgen Strand Larsen|ST|26|NOR|79
29|Evann Guessand|ST|25|CIV|76`},
{id:'BHA',name:'Brighton & Hove Albion',short:'Brighton',c1:'#0057b8',c2:'#f4f4f4',stadium:'American Express Stadium',cap:32176,mgr:'Fabian Hurzeler',rep:78,bal:70,sq:`
1|Bart Verbruggen|GK|24|NED|80
23|Jason Steele|GK|36|ENG|66
38|Tom McGill|GK|26|CAN|65
3|Hadjam|LB|23|ALG|74
4|Pascal Struijk|CB|27|NED|77
5|Lewis Dunk|CB|34|ENG|76
20|Costinha|RB|26|POR|75
21|Olivier Boscagli|CB|28|FRA|77
24|Ferdi Kadioglu|RB|27|TUR|79
30|Svoboda|CB|28|AUT|72
44|Luka Vuskovic|CB|19|CRO|79
8|Jack Hinshelwood|CM|21|ENG|75
13|Pascal Gross|DM|35|GER|76
14|Chema Andres|DM|21|ESP|74
15|Osman|CM|21|GHA|68
25|Diego Gomez|AM|23|PAR|78
26|Yasin Ayari|CM|23|SWE|77
27|Mats Wieffer|DM|26|NED|77
29|Maxim De Cuyper|LW|25|BEL|77
33|Matt O'Riley|AM|25|DEN|76
35|Malick Yalcouye|CM|20|MLI|74
9|Charalampos Tzimas|ST|20|GRE|72
10|Georginio Rutter|ST|24|FRA|78
11|Yankuba Minteh|RW|22|GAM|78
12|Promise David|ST|25|CAN|70
19|Stefanos Kostoulas|ST|19|GRE|75
22|Kaoru Mitoma|LW|29|JPN|80`},
{id:'BRE',name:'Brentford',c1:'#e30613',c2:'#f4f4f4',stadium:'Gtech Community Stadium',cap:17250,mgr:'Keith Andrews',rep:74,bal:45,sq:`
1|Caoimhin Kelleher|GK|27|IRL|81
12|Hakon Valdimarsson|GK|25|ISL|70
31|Ellery Balcombe|GK|27|ENG|64
2|Aaron Hickey|RB|24|SCO|75
3|Rico Henry|LB|29|ENG|74
4|Sepp van den Berg|CB|24|NED|77
20|Kristoffer Ajer|CB|28|NOR|77
22|Nathan Collins|CB|25|IRL|79
23|Keane Lewis-Potter|LB|25|ENG|76
25|El Hadji Malick Diouf|LB|21|SEN|75
33|Michael Kayode|RB|22|ITA|76
6|Yehor Yarmolyuk|DM|22|UKR|75
8|Mathias Jensen|CM|30|DEN|74
10|Josh Dasilva|CM|28|ENG|70
14|Fabio Carvalho|AM|24|POR|72
18|Pape Sangare|DM|24|MLI|74
24|Mikkel Damsgaard|AM|26|DEN|78
27|Vitaly Janelt|DM|28|GER|76
44|Jannik Schuster|CM|20|AUT|72
7|Kevin Schade|LW|24|GER|78
11|Dango Ouattara|RW|24|BFA|77
19|Jaidon Anthony|LW|26|ENG|75
9|Igor Thiago|ST|25|BRA|81
13|Callum Wilson|ST|34|ENG|72`},
{id:'FUL',name:'Fulham',c1:'#f4f4f4',c2:'#111111',stadium:'Craven Cottage',cap:28107,mgr:'Alvaro Arbeloa',rep:73,bal:40,sq:`
1|Bernd Leno|GK|34|GER|81
23|Benjamin Lecomte|GK|35|FRA|70
2|Kenny Tete|RB|30|NED|76
3|Calvin Bassey|CB|26|NGA|77
4|Jorge Cuenca|CB|26|ESP|76
5|Joachim Andersen|CB|30|DEN|79
21|Timothy Castagne|RB|30|BEL|76
22|David Affengruber|CB|25|AUT|75
30|Ryan Sessegnon|LB|26|ENG|75
33|Antonee Robinson|LB|29|USA|80
6|Harrison Reed|DM|31|ENG|74
8|Cesar Palacios|AM|22|ESP|74
10|Tom Cairney|CM|35|SCO|72
15|Hugo Larsson|CM|22|SWE|78
16|Sander Berge|DM|28|NOR|78
19|Shea Charles|DM|22|NIR|76
20|Manuel Angel|CM|20|ESP|72
24|Josh King|AM|19|ENG|74
32|Emile Smith Rowe|AM|26|ENG|79
34|Chibuzo Nwoko|CM|18|ENG|62
17|Alex Iwobi|AM|30|NGA|78
7|Gonzalo Garcia|ST|22|ESP|80
9|Rodrigo Muniz|ST|25|BRA|77
11|Kevin|LW|23|BRA|78
14|Oscar Bobb|RW|23|NOR|78
35|Macauley Zepa|ST|19|CMR|64`},
{id:'EVE',name:'Everton',c1:'#003399',c2:'#f4f4f4',stadium:'Hill Dickinson Stadium',cap:52769,mgr:'David Moyes',rep:75,bal:55,sq:`
1|Jordan Pickford|GK|32|ENG|83
12|Mark Travers|GK|27|IRL|74
31|Tom King|GK|31|WAL|65
2|Ainsley Maitland-Niles|RB|29|ENG|73
4|Jarrad Branthwaite|CB|24|ENG|81
5|Michael Keane|CB|33|ENG|74
6|James Tarkowski|CB|33|ENG|78
15|Jake O'Brien|CB|25|IRL|77
16|Vitaliy Mykolenko|LB|27|UKR|77
8|Kiernan Dewsbury-Hall|CM|28|ENG|78
23|Christian Norgaard|DM|32|DEN|77
24|Charly Alcaraz|AM|23|ARG|76
30|Hayden Hackney|CM|24|ENG|76
34|Merlin Rohl|AM|24|GER|75
37|James Garner|CM|25|ENG|80
45|Harrison Armstrong|CM|19|ENG|70
10|Jack Grealish|LW|30|ENG|81
11|Thierno Barry|ST|23|FRA|78
19|Tyrique George|LW|20|ENG|74
20|Tyler Dibling|RW|20|ENG|77
22|Brennan Johnson|RW|25|WAL|79`},
{id:'LEE',name:'Leeds United',short:'Leeds',c1:'#f4f4f4',c2:'#1d428a',stadium:'Elland Road',cap:37633,mgr:'Daniel Farke',rep:72,bal:45,sq:`
1|James Trafford|GK|23|ENG|79
16|Michael Zetterer|GK|31|GER|70
21|Cairns|GK|20|ENG|60
2|Jayden Bogle|RB|26|ENG|75
3|Gabriel Gudmundsson|LB|27|SWE|75
5|Tarik Muharemovic|CB|23|BIH|76
6|Joe Rodon|CB|28|WAL|77
15|Jaka Bijol|CB|27|SVN|77
24|James Justin|RB|28|ENG|74
26|Melvin Bard|LB|26|FRA|74
30|Nico Elvedi|CB|30|SUI|76
4|Ethan Ampadu|DM|26|WAL|77
8|Sean Longstaff|CM|28|ENG|76
11|Brenden Aaronson|AM|25|USA|75
18|Anton Stach|CM|27|GER|77
22|Ao Tanaka|CM|27|JPN|76
44|Ilia Gruev|DM|26|BUL|74
7|Daniel James|RW|28|WAL|76
10|Harry Wilson|RW|29|WAL|79
19|Noah Okafor|LW|26|SUI|76
9|Dominic Calvert-Lewin|ST|29|ENG|77
14|Lukas Nmecha|ST|27|GER|74`},
{id:'NFO',name:'Nottingham Forest',short:"Nott'm Forest",c1:'#dd0000',c2:'#f4f4f4',stadium:'City Ground',cap:31212,mgr:'Oliver Glasner',rep:77,bal:55,sq:`
12|John Victor|GK|30|BRA|74
26|Matz Sels|GK|34|BEL|79
33|Steven Benda|GK|28|GER|68
2|Ousmane Diomande|CB|22|CIV|79
3|Neco Williams|RB|25|WAL|78
4|Morato|CB|25|BRA|76
5|Murillo|CB|24|BRA|81
23|Jair Cunha|CB|21|BRA|73
25|Luca Netz|LB|23|GER|74
27|Daniel Munoz|RB|30|COL|80
31|Nikola Milenkovic|CB|28|SRB|80
34|Ola Aina|RB|29|NGA|77
37|Nicolo Savona|RB|23|ITA|75
44|Zach Abbott|CB|20|ENG|70
6|Ibrahim Sangare|DM|28|CIV|77
8|Nicolas Dominguez|CM|28|ARG|77
10|Morgan Gibbs-White|AM|26|ENG|84
21|Xaver Schlager|CM|28|AUT|78
22|Ryan Yates|CM|28|ENG|74
24|James McAtee|AM|23|ENG|77
7|Callum Hudson-Odoi|LW|25|ENG|78
14|Dan Ndoye|RW|25|SUI|79
9|Chris Wood|ST|34|NZL|78
11|Igor Jesus|ST|25|BRA|77
15|Arnaud Kalimuendo|ST|24|FRA|77
19|Liam Delap|ST|23|ENG|78`},
{id:'COV',name:'Coventry City',short:'Coventry',c1:'#59cbe8',c2:'#0b2240',stadium:'CBS Arena',cap:32609,mgr:'Frank Lampard',rep:64,bal:30,sq:`
19|Carl Rushworth|GK|25|ENG|74
25|Sam Bentley|GK|33|ENG|66
13|Ben Wilson|GK|34|ENG|64
2|Ethan Pinnock|CB|33|JAM|72
3|Jay Dasilva|LB|28|ENG|71
4|Bobby Thomas|CB|25|ENG|73
12|Mfuni|CB|18|ENG|62
20|Kesler-Hayden|RB|24|ENG|67
21|Jake Bidwell|LB|33|ENG|65
24|Aurele Amenda|CB|23|SUI|71
26|Luke Woolfenden|CB|28|ENG|70
27|Milan van Ewijk|RB|26|NED|74
5|Jack Rudoni|AM|25|ENG|74
6|Matt Grimes|DM|31|ENG|73
7|Tatsuhiro Sakamoto|RW|30|JPN|73
8|Caleb Yirenkyi|DM|20|GHA|70
10|Ephron Mason-Clark|LW|27|ENG|72
16|Frank Onyeka|CM|28|NGA|72
22|Joel Latibeaudiere|CM|26|JAM|68
23|Brandon Thomas-Asante|LW|27|GHA|71
29|Victor Torp|CM|27|DEN|71
38|Gustavo Hamer|AM|29|NED|74
9|Ellis Simms|ST|25|ENG|70
11|Haji Wright|ST|28|USA|74
14|Taiwo Awoniyi|ST|29|NGA|72
17|Loum Tchaouna|RW|23|FRA|72
34|Gboho|RW|25|FRA|68
49|Cherif|ST|19|FRA|68`},
{id:'IPS',name:'Ipswich Town',short:'Ipswich',c1:'#0044a9',c2:'#f4f4f4',stadium:'Portman Road',cap:30056,mgr:"Gary O'Neil",rep:65,bal:30,sq:`
1|Alex Palmer|GK|30|ENG|74
28|Christian Walton|GK|30|ENG|72
37|Kjell Scherpen|GK|26|NED|68
27|David Button|GK|37|ENG|62
2|Darnell Furlong|RB|30|ENG|71
3|Leif Davis|LB|26|ENG|75
4|Cedric Kipre|CB|29|CIV|72
6|Issa Diop|CB|29|MAR|74
18|Ben Johnson|RB|26|ENG|72
24|Jacob Greaves|CB|26|ENG|73
26|Dara O'Shea|CB|27|IRL|76
42|Abdoul Ouattara|RB|20|CIV|66
5|Azor Matusiwa|DM|28|NED|76
12|Florentino Luis|DM|27|POR|76
14|Jack Taylor|CM|28|IRL|72
23|Sasa Lukic|CM|30|SRB|74
25|Exequiel Palacios|CM|28|ARG|80
32|Marcelino Nunez|CM|26|CHI|73
10|Julio Enciso|AM|22|PAR|76
33|Anis Mehmeti|AM|25|ALB|71
7|Abdul Fatawu|RW|22|GHA|76
8|Sindre Walle Egeli|LW|20|NOR|70
11|Jaden Philogene|LW|24|ENG|74
20|Kasey McAteer|RW|24|IRL|68
21|Chiedozie Ogbene|RW|29|IRL|70
38|Daizen Maeda|LW|28|JPN|78
47|Jack Clarke|LW|25|ENG|74
9|Zian Flemming|ST|28|NED|72
19|Emersonn|ST|22|BRA|70
29|Chuba Akpom|ST|30|ENG|70`},
{id:'HUL',name:'Hull City',short:'Hull',c1:'#f5a12d',c2:'#111111',stadium:'MKM Stadium',cap:24983,mgr:'Sergej Jakirovic',rep:63,bal:30,sq:`
1|Butland|GK|33|ENG|74
12|Phillips|GK|31|ENG|66
19|Konstantinos Tzolakis|GK|23|GRE|75
2|Lewie Coyle|RB|31|ENG|70
3|Giles|LB|26|ENG|71
4|Charlie Hughes|CB|23|ENG|69
6|Semi Ajayi|CB|32|NGA|70
15|John Egan|CB|34|IRL|70
17|Paddy McNair|CB|31|NIR|69
18|Brooke Norton-Cuffy|RB|22|ENG|72
22|Lucas Herrington|CB|19|AUS|72
23|Matt Targett|LB|31|ENG|70
32|Mendy|CB|22|FRA|66
5|Hidemasa Morita|CM|31|JPN|78
8|Eliot Matazo|DM|24|BEL|70
14|Hjerto-Dahl|CM|20|NOR|68
20|Oscar Zambrano|DM|22|ECU|72
24|Darko Gyabi|CM|22|ENG|70
25|Matt Crooks|CM|32|ENG|70
26|Kieran Dowell|AM|29|ENG|70
27|Regan Slater|CM|27|ENG|70
29|Lucas Gourna-Douath|DM|23|FRA|72
33|Abdulkadir Omur|AM|27|TUR|73
36|Mouzakitis|CM|19|GRE|68
42|Tim Iroegbunam|DM|23|ENG|72
7|Thomas|LW|27|WAL|70
10|Mohamed Belloumi|RW|24|ALG|72
21|Stroud|LW|24|SWE|68
9|Oli McBurnie|ST|30|SCO|71
11|Joe Gelhardt|ST|24|ENG|71
47|Vaz|ST|19|FRA|66
50|Cho|ST|22|FRA|68`}
];

// Championship (simulated at team level; used for cups and promotion)
// League One and below are simulated at team level. Leicester, Oxford and Sheffield Wednesday were relegated from the Championship in May 2026.
const LOWER = [['Leicester City',62],['Sheffield Wednesday',55],['Oxford United',56],['Luton Town',54],['Plymouth Argyle',52],['Stockport County',53],['Huddersfield',53],['Barnsley',52],['Wigan',51],['Reading',51],['Peterborough',50],['Mansfield',49],['Wycombe',50],['Exeter City',48],['Blackpool',49],['Leyton Orient',49],['Burton Albion',47],['Northampton',47],['Doncaster',47],['Bradford City',48],['AFC Wimbledon',46],['MK Dons',45],['Notts County',45],['Port Vale',45],['Fleetwood',44],['Gillingham',44],['Grimsby',44],['Salford City',44],['Swindon',43],['Walsall',43],['Chesterfield',43],['Crewe',42],['Bromley',42],['Tranmere',41],['Barrow',41],['Colchester',41]];
const EURO = {
 UCL:[['Real Madrid',89],['Barcelona',88],['Paris SG',89],['Bayern Munich',89],['Inter',86],['Atletico Madrid',84],['Juventus',82],['Napoli',83],['Bayer Leverkusen',82],['Borussia Dortmund',82],['Benfica',79],['FC Porto',79],['Sporting CP',80],['PSV',78],['Ajax',77],['Feyenoord',76],['Club Brugge',76],['Galatasaray',77],['Marseille',79],['Monaco',78],['AC Milan',82],['Atalanta',81],['RB Leipzig',80],['VfB Stuttgart',78],['Eintracht Frankfurt',78],['Celtic',74],['Olympiacos',74],['Union SG',73],['Slavia Prague',72],['FC Copenhagen',72],['Red Star Belgrade',71]],
 UEL:[['Roma',80],['Lazio',77],['Real Sociedad',77],['Villarreal',79],['Real Betis',78],['Lyon',78],['Lille',78],['Nice',75],['Lens',76],['Freiburg',77],['Wolfsburg',74],['Hoffenheim',75],['Fenerbahce',77],['Besiktas',75],['AZ Alkmaar',75],['Twente',72],['Braga',75],['Rangers',74],['Bodo/Glimt',75],['Midtjylland',72],['Ferencvaros',70],['Dinamo Zagreb',71],['Shakhtar Donetsk',72],['RB Salzburg',74],['Sturm Graz',70],['Young Boys',71],['Basel',71],['Viktoria Plzen',70],['Maccabi Tel Aviv',68],['PAOK',72],['Ludogorets',68],['Malmo',69],['Fiorentina',77]],
 UECL:[['Bologna',77],['Como',76],['Sevilla',75],['Celta Vigo',74],['Rayo Vallecano',73],['Strasbourg',75],['Rennes',74],['Mainz',74],['Augsburg',72],['Gent',71],['Anderlecht',72],['Genk',72],['Utrecht',71],['Vitoria SC',70],['Rapid Wien',69],['LASK',68],['Legia Warsaw',69],['Lech Poznan',68],['Sparta Prague',72],['AEK Athens',72],['Panathinaikos',71],['Hearts',67],['Aberdeen',66],['Shamrock Rovers',62],['Brondby',68],['Molde',68],['Djurgarden',67],['Hammarby',66],['Lausanne',66],['Omonia',66],['Slovan Bratislava',66],['Partizan',68],['Samsunspor',67],['Trabzonspor',69],['Rijeka',67]]
};
const EURO_START = {UCL:['ARS','MCI','MUN','AVL','LIV'],UEL:['BOU','SUN','CRY'],UECL:['BHA']};
const EURO_NAMES = {UCL:'Champions League',UEL:'Europa League',UECL:'Conference League'};

// Name pools for youth intake / generated squads (fictional)
const FIRST = ['Jack','Harry','Leo','Oliver','Charlie','Alfie','Theo','Mason','Kai','Ethan','Noah','Callum','Ryan','Lewis','Jamie','Rhys','Ben','Tom','Sam','Max','Luca','Marco','Diego','Mateo','Lucas','Hugo','Jonas','Emil','Lars','Kofi','Yaw','Ibrahim','Musa','Tariq','Rafael','Joao','Andre','Kian','Finn','Owen','Ellis','Reece','Jayden','Tyler','Kieran','Josh','Dylan','Aaron','Nathan','Elijah'];
const LAST = ['Walker','Hughes','Turner','Bennett','Carter','Morris','Cooper','Ward','Clarke','Baker','Price','Mitchell','Doyle','Fletcher','Harper','Lowe','Barnes','Reid','Shaw','Holland','Kelly','Nash','Pearce','Quinn','Rowe','Stone','Tate','Vaughan','Wells','Yates','Mensah','Owusu','Diallo','Traore','Silva','Costa','Moreno','Ruiz','Novak','Berg','Jansen','Larsen','Okoro','Adeyemi','Bakari','Kone','Fofana','Murray','Gallagher','Brennan','Okafor','Lindqvist','De Vries','Rossi','Marchetti','Dubois','Lambert','Hartley','Ashworth','Penrose'];
