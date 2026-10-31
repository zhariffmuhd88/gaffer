// ===== DATA: international football (checked 31 Oct 2026) =====
// Sources: FIFA ranking top 50 (ESPN, Oct 2026 release); England squads and caps (englandfootball.com, Jul/Sep 2026; ESPN 2026/27 apps);
// UEFA Nations League 2026/27 groups and results (myfootballfacts.com, englandfootball.com); Euro 2028 qualifying and finals
// (Wikipedia, Sky Sports); FIFA match calendar windows (Wikipedia); winners lists (Wikipedia, SI.com).
// Nations ranked below 50 use estimated positions (marked e). Strength values and player ratings are game estimates.
const INTL_ASOF = '31 Oct 2026';
// code|name|confederation|FIFA rank (e = estimate)|colour 1|colour 2
const NATS_RAW = `ESP|Spain|UEFA|1|#c60b1e|#ffc400
ARG|Argentina|CONMEBOL|2|#75aadb|#ffffff
FRA|France|UEFA|3|#1f3a93|#ffffff
ENG|England|UEFA|4|#ffffff|#1d2b6b
POR|Portugal|UEFA|5|#a6192e|#006847
BRA|Brazil|CONMEBOL|6|#ffdf00|#009c3b
MAR|Morocco|CAF|7|#c1272d|#006233
BEL|Belgium|UEFA|8|#c8102e|#000000
NED|Netherlands|UEFA|9|#f36c21|#ffffff
MEX|Mexico|CONCACAF|10|#006847|#ce1126
COL|Colombia|CONMEBOL|11|#fcd116|#003893
SUI|Switzerland|UEFA|12|#d52b1e|#ffffff
GER|Germany|UEFA|13|#ffffff|#000000
CRO|Croatia|UEFA|14|#ff0000|#ffffff
ITA|Italy|UEFA|15|#0064aa|#ffffff
USA|USA|CONCACAF|16|#ffffff|#0a3161
JPN|Japan|AFC|17|#0a2b7d|#ffffff
SEN|Senegal|CAF|18|#ffffff|#00853f
NOR|Norway|UEFA|19|#ba0c2f|#ffffff
URU|Uruguay|CONMEBOL|20|#5cbfeb|#ffffff
DEN|Denmark|UEFA|21|#c8102e|#ffffff
AUT|Austria|UEFA|22|#ed2939|#ffffff
IRN|Iran|AFC|23|#ffffff|#239f40
ECU|Ecuador|CONMEBOL|24|#ffdd00|#034ea2
EGY|Egypt|CAF|25|#ce1126|#ffffff
AUS|Australia|AFC|26|#ffcd00|#00843d
CAN|Canada|CONCACAF|27|#d80621|#ffffff
ALG|Algeria|CAF|28|#ffffff|#006233
CIV|Ivory Coast|CAF|29|#f77f00|#009e60
NGA|Nigeria|CAF|30|#008751|#ffffff
TUR|Türkiye|UEFA|31|#e30a17|#ffffff
KOR|South Korea|AFC|32|#cd2e3a|#0047a0
PAR|Paraguay|CONMEBOL|33|#d52b1e|#ffffff
SWE|Sweden|UEFA|34|#fecc00|#006aa7
RUS|Russia|UEFA|35|#ffffff|#d52b1e
UKR|Ukraine|UEFA|36|#ffd500|#005bbb
POL|Poland|UEFA|37|#ffffff|#dc143c
HUN|Hungary|UEFA|38|#ce2939|#ffffff
WAL|Wales|UEFA|39|#c8102e|#ffffff
COD|DR Congo|CAF|40|#007fff|#ce1021
GRE|Greece|UEFA|41|#0d5eaf|#ffffff
CMR|Cameroon|CAF|42|#007a5e|#ce1126
SCO|Scotland|UEFA|43|#0065bd|#ffffff
SRB|Serbia|UEFA|44|#c6363c|#ffffff
SVK|Slovakia|UEFA|45|#0b4ea2|#ffffff
PAN|Panama|CONCACAF|46|#da121a|#ffffff
MLI|Mali|CAF|47|#14b53a|#fcd116
RSA|South Africa|CAF|48|#ffb612|#007749
VEN|Venezuela|CONMEBOL|49|#7b1c2e|#ffffff
CHI|Chile|CONMEBOL|50|#d52b1e|#0039a6
CZE|Czechia|UEFA|51e|#d7141a|#ffffff
TUN|Tunisia|CAF|52e|#e70013|#ffffff
UZB|Uzbekistan|AFC|53e|#0099b5|#ffffff
SVN|Slovenia|UEFA|54e|#005da4|#ffffff
QAT|Qatar|AFC|55e|#8a1538|#ffffff
CRC|Costa Rica|CONCACAF|56e|#ce1126|#002b7f
ROU|Romania|UEFA|57e|#fcd116|#002b7f
KSA|Saudi Arabia|AFC|58e|#ffffff|#006c35
IRQ|Iraq|AFC|59e|#ffffff|#007a3d
IRL|Republic of Ireland|UEFA|60e|#169b62|#ffffff
PER|Peru|CONMEBOL|61e|#ffffff|#d91023
GEO|Georgia|UEFA|62e|#ffffff|#da291c
BFA|Burkina Faso|CAF|63e|#009e49|#ef2b2d
JOR|Jordan|AFC|64e|#ffffff|#007a3d
ALB|Albania|UEFA|65e|#e41e20|#000000
MKD|North Macedonia|UEFA|66e|#d20000|#ffe600
UAE|UAE|AFC|67e|#ffffff|#00732f
CPV|Cape Verde|CAF|68e|#003893|#ffffff
JAM|Jamaica|CONCACAF|69e|#fed100|#009b3a
FIN|Finland|UEFA|70e|#ffffff|#002f6c
ISL|Iceland|UEFA|71e|#02529c|#ffffff
NIR|Northern Ireland|UEFA|72e|#00a651|#ffffff
BIH|Bosnia and Herzegovina|UEFA|73e|#002395|#fecb00
GHA|Ghana|CAF|74e|#ffffff|#006b3f
HON|Honduras|CONCACAF|75e|#ffffff|#0073cf
ISR|Israel|UEFA|76e|#ffffff|#0038b8
OMA|Oman|AFC|78e|#db161b|#ffffff
GAB|Gabon|CAF|79e|#009e60|#fcd116
GUI|Guinea|CAF|80e|#ce1126|#fcd116
MNE|Montenegro|UEFA|81e|#c40308|#d4af37
BOL|Bolivia|CONMEBOL|82e|#007934|#ffffff
BHR|Bahrain|AFC|83e|#ce1126|#ffffff
HAI|Haiti|CONCACAF|84e|#00209f|#d21034
CUW|Curaçao|CONCACAF|85e|#002b7f|#f9e814
NZL|New Zealand|OFC|86e|#ffffff|#000000
KOS|Kosovo|UEFA|87e|#244aa5|#ffffff
BUL|Bulgaria|UEFA|88e|#ffffff|#00966e
ZAM|Zambia|CAF|89e|#198a00|#ef7d00
ANG|Angola|CAF|90e|#cc092f|#000000
BEN|Benin|CAF|91e|#ffd600|#008751
SYR|Syria|AFC|92e|#ce1126|#ffffff
CHN|China|AFC|93e|#de2910|#ffffff
UGA|Uganda|CAF|94e|#fcdc04|#d90000
SLV|El Salvador|CONCACAF|95e|#0f47af|#ffffff
LUX|Luxembourg|UEFA|96e|#ed2939|#00a1de
THA|Thailand|AFC|97e|#2d2a4a|#ffffff
PLE|Palestine|AFC|98e|#ffffff|#007a3d
BLR|Belarus|UEFA|99e|#d22730|#00af66
EQG|Equatorial Guinea|CAF|100e|#3e9a00|#e32118
TRI|Trinidad and Tobago|CONCACAF|101e|#ce1126|#000000
ARM|Armenia|UEFA|102e|#d90012|#0033a0
KGZ|Kyrgyzstan|AFC|103e|#e8112d|#ffef00
MOZ|Mozambique|CAF|104e|#d21034|#007168
GUA|Guatemala|CONCACAF|105e|#4997d0|#ffffff
COM|Comoros|CAF|106e|#3a75c4|#ffffff
TAN|Tanzania|CAF|107e|#1eb53a|#00a3dd
KEN|Kenya|CAF|108e|#bb0000|#006600
PRK|North Korea|AFC|109e|#ed1c27|#ffffff
VIE|Vietnam|AFC|110e|#da251d|#ffff00
MAD|Madagascar|CAF|111e|#fc3d32|#007e3a
MTN|Mauritania|CAF|112e|#006233|#ffc400
LBY|Libya|CAF|113e|#e70013|#000000
SUD|Sudan|CAF|114e|#d21034|#007229
NAM|Namibia|CAF|115e|#003580|#d21034
KAZ|Kazakhstan|UEFA|116e|#00afca|#fec50c
AZE|Azerbaijan|UEFA|117e|#00b5e2|#ef3340
IDN|Indonesia|AFC|118e|#ce1126|#ffffff
SLE|Sierra Leone|CAF|119e|#1eb53a|#0072c6
GAM|Gambia|CAF|120e|#ce1126|#0c1c8c
CGO|Congo|CAF|121e|#009543|#fbde4a
ZIM|Zimbabwe|CAF|122e|#319208|#ffd200
CYP|Cyprus|UEFA|123e|#ffffff|#d57800
EST|Estonia|UEFA|124e|#0072ce|#000000
SUR|Suriname|CONCACAF|125e|#377e3f|#ffffff
MAS|Malaysia|AFC|126e|#cc0001|#ffcc00
FRO|Faroe Islands|UEFA|133e|#ffffff|#0065bd
IND|India|AFC|135e|#0066b3|#ff9933
LVA|Latvia|UEFA|138e|#9e3039|#ffffff
LTU|Lithuania|UEFA|143e|#fdb913|#006a44
NCL|New Caledonia|OFC|150e|#0035ad|#ed4135
FIJ|Fiji|OFC|152e|#ffffff|#002868
MDA|Moldova|UEFA|154e|#0046ae|#ffd200
SOL|Solomon Islands|OFC|155e|#0051ba|#215b33
TAH|Tahiti|OFC|158e|#ce1126|#ffffff
MLT|Malta|UEFA|165e|#ffffff|#cf142b
PNG|Papua New Guinea|OFC|166e|#ce1126|#000000
AND|Andorra|UEFA|172e|#10069f|#fedf00
SIN|Singapore|AFC|160e|#ef3340|#ffffff
PHI|Philippines|AFC|140e|#0038a8|#ce1126
GIB|Gibraltar|UEFA|200e|#da000c|#ffffff
LIE|Liechtenstein|UEFA|205e|#002b7f|#ce1126
SMR|San Marino|UEFA|210e|#5eb6e4|#ffffff`;
// a few named star players per nation (real players, Oct 2026); used to name opposition players in matches
const NAT_STARS = {
  ESP: 'Lamine Yamal|RW;Pedri|CM;Rodri|DM;Nico Williams|LW;Dani Olmo|AM;Unai Simón|GK',
  ARG: 'Lautaro Martínez|ST;Julián Álvarez|ST;Alexis Mac Allister|CM;Enzo Fernández|CM;Emiliano Martínez|GK',
  FRA: 'Kylian Mbappé|ST;Michael Olise|RW;Ousmane Dembélé|RW;William Saliba|CB;Aurélien Tchouaméni|DM;Mike Maignan|GK',
  POR: 'Bruno Fernandes|AM;Vitinha|CM;João Neves|CM;Rúben Dias|CB;Nuno Mendes|LB;Diogo Costa|GK',
  BRA: 'Vinícius Júnior|LW;Raphinha|RW;Bruno Guimarães|CM;Marquinhos|CB;Alisson|GK',
  MAR: 'Achraf Hakimi|RB;Brahim Díaz|AM;Nayef Aguerd|CB;Yassine Bounou|GK',
  BEL: 'Jérémy Doku|LW;Leandro Trossard|LW;Youri Tielemans|CM;Thibaut Courtois|GK',
  NED: 'Virgil van Dijk|CB;Frenkie de Jong|CM;Cody Gakpo|LW;Xavi Simons|AM;Ryan Gravenberch|CM',
  MEX: 'Edson Álvarez|DM;Santiago Giménez|ST;Raúl Jiménez|ST;César Montes|CB',
  COL: 'Luis Díaz|LW;James Rodríguez|AM;Jhon Arias|RW;Daniel Muñoz|RB',
  SUI: 'Granit Xhaka|CM;Manuel Akanji|CB;Breel Embolo|ST;Gregor Kobel|GK',
  GER: 'Jamal Musiala|AM;Florian Wirtz|AM;Joshua Kimmich|DM;Kai Havertz|ST;Antonio Rüdiger|CB',
  CRO: 'Joško Gvardiol|CB;Mateo Kovačić|CM;Andrej Kramarić|ST;Dominik Livaković|GK',
  ITA: 'Gianluigi Donnarumma|GK;Alessandro Bastoni|CB;Nicolò Barella|CM;Sandro Tonali|CM;Moise Kean|ST',
  USA: 'Christian Pulisic|RW;Weston McKennie|CM;Tyler Adams|DM;Antonee Robinson|LB',
  JPN: 'Takefusa Kubo|RW;Kaoru Mitoma|LW;Wataru Endo|DM;Takehiro Tomiyasu|CB',
  SEN: 'Nicolas Jackson|ST;Ismaïla Sarr|RW;Pape Matar Sarr|CM;Kalidou Koulibaly|CB',
  NOR: 'Erling Haaland|ST;Martin Ødegaard|AM;Alexander Sørloth|ST',
  URU: 'Federico Valverde|CM;Darwin Núñez|ST;Ronald Araújo|CB;Manuel Ugarte|DM',
  DEN: 'Rasmus Højlund|ST;Morten Hjulmand|DM;Pierre-Emile Højbjerg|CM',
  AUT: 'David Alaba|CB;Marcel Sabitzer|CM;Konrad Laimer|CM',
  IRN: 'Mehdi Taremi|ST;Sardar Azmoun|ST',
  ECU: 'Moisés Caicedo|DM;Piero Hincapié|CB;Willian Pacho|CB',
  EGY: 'Mohamed Salah|RW;Omar Marmoush|ST',
  AUS: 'Jackson Irvine|CM;Harry Souttar|CB;Mathew Ryan|GK',
  CAN: 'Alphonso Davies|LB;Jonathan David|ST',
  ALG: 'Riyad Mahrez|RW;Rayan Aït-Nouri|LB',
  CIV: 'Franck Kessié|CM;Simon Adingra|LW;Amad Diallo|RW',
  NGA: 'Victor Osimhen|ST;Ademola Lookman|LW;Alex Iwobi|AM',
  TUR: 'Arda Güler|AM;Hakan Çalhanoğlu|CM;Kenan Yıldız|LW',
  KOR: 'Son Heung-min|LW;Kim Min-jae|CB;Lee Kang-in|AM'
};
// UEFA Nations League 2026/27 league phase (real draw, Feb 2026)
const UNL27_GROUPS = { A1: 'FRA ITA BEL TUR', A2: 'GER NED SRB GRE', A3: 'ESP CRO ENG CZE', A4: 'POR DEN NOR WAL', B1: 'SCO SUI SVN MKD', B2: 'HUN UKR GEO NIR', B3: 'ISR AUT IRL KOS', B4: 'POL BIH ROU SWE', C1: 'ALB FIN BLR SMR', C2: 'MNE ARM CYP LVA', C3: 'KAZ SVK FRO MDA', C4: 'ISL BUL EST LUX', D1: 'GIB AND MLT', D2: 'LTU AZE LIE' };
// real results, matchdays 1-4 (24 Sep - 6 Oct 2026): home|away|score
const UNL27_REAL = `ITA|BEL|0-2;TUR|FRA|0-1;BEL|FRA|0-1;TUR|ITA|1-4;BEL|TUR|3-0;FRA|ITA|1-1;FRA|BEL|4-1;ITA|TUR|3-1;
NED|GER|1-1;SRB|GRE|1-2;SRB|NED|1-2;GER|GRE|0-1;GER|SRB|2-0;GRE|NED|2-2;GRE|GER|0-0;NED|SRB|2-1;
CZE|CRO|1-2;ENG|ESP|2-3;CZE|ENG|0-2;ESP|CRO|4-1;CRO|ENG|0-7;ESP|CZE|3-1;CRO|ESP|1-2;ENG|CZE|3-0;
NOR|DEN|3-2;POR|WAL|1-0;DEN|WAL|2-0;NOR|POR|1-2;DEN|POR|2-4;WAL|NOR|2-1;POR|NOR|2-1;WAL|DEN|0-1;
SVN|SCO|0-0;MKD|SUI|0-3;SCO|SUI|0-3;SVN|MKD|2-0;MKD|SCO|0-2;SUI|SVN|2-1;SCO|SVN|1-2;SUI|MKD|3-0;
GEO|NIR|0-1;HUN|UKR|0-1;GEO|UKR|0-0;NIR|HUN|0-0;HUN|GEO|1-0;UKR|NIR|0-3;NIR|GEO|0-0;UKR|HUN|1-2;
AUT|ISR|3-1;KOS|IRL|1-0;AUT|KOS|3-1;ISR|IRL|0-3;IRL|AUT|2-2;ISR|KOS|0-0;KOS|AUT|1-1;IRL|ISR|1-1;
POL|BIH|0-0;SWE|ROU|2-1;ROU|BIH|2-4;SWE|POL|3-1;BIH|SWE|1-1;POL|ROU|6-0;BIH|POL|1-0;ROU|SWE|0-1;
SMR|FIN|0-7;ALB|BLR|2-0;FIN|BLR|0-0;SMR|ALB|0-3;FIN|ALB|2-1;BLR|SMR|4-0;ALB|SMR|2-1;BLR|FIN|1-0;
ARM|LVA|2-0;MNE|CYP|2-1;ARM|MNE|2-3;LVA|CYP|0-0;CYP|ARM|2-0;LVA|MNE|1-2;CYP|LVA|2-1;MNE|ARM|0-0`;
// England players playing abroad (not in the club database): name|pos|age|club|rating (game estimate)
const ENG_ABROAD = `Harry Kane|ST|33|Bayern Munich|88
Jude Bellingham|AM|23|Real Madrid|89
Trent Alexander-Arnold|RB|28|Real Madrid|85
Anthony Gordon|LW|25|Barcelona|84
Jarell Quansah|CB|23|Bayer Leverkusen|80
Trevoh Chalobah|CB|27|Como|80
Ivan Toney|ST|30|Al-Ahli|80`;
// England caps|goals after the Sep/Oct 2026 window. Post-World Cup figures from englandfootball.com (Jul 2026) plus
// 2026/27 appearances (ESPN); ~ marks an estimate where no published figure was found.
const ENG_CAPS = `Harry Kane|125|91
Jordan Henderson|91|3
Jordan Pickford|93|0
Declan Rice|80|8
Marcus Rashford|78|19
Bukayo Saka|59|16
Jude Bellingham|60|11
Marc Guehi|41|1
Reece James|29|1
Ezri Konsa|28|2
Anthony Gordon|28|7
Eberechi Eze|25|3
Morgan Rogers|26|2
Kobbie Mainoo|14|0
Noni Madueke|16|1
Elliot Anderson|21|0
Dan Burn|11|0
Ivan Toney|10|1
Trevoh Chalobah|3|0
Dean Henderson|6|0
Nico O'Reilly|12|0
Jarell Quansah|9|0
James Trafford|4|0
Rio Ngumoha|2|0
Trent Alexander-Arnold|~36|~4
Lewis Hall|~5|0
Jarrad Branthwaite|~3|0
Myles Lewis-Skelly|~7|~1
Morgan Gibbs-White|~6|0
James Garner|~3|0
Dominic Calvert-Lewin|~13|~4
Cole Palmer|~12|~2
Tino Livramento|~6|0
Rico Lewis|~3|0
Jason Steele|0|0
Alex Scott|0|0
Phil Foden|~47|~4
Kyle Walker|~93|~1
Harry Maguire|~64|~7
Kieran Trippier|~54|~1
Jack Grealish|~39|~3
Mason Mount|~36|~5
Luke Shaw|~35|~3
Ross Barkley|~33|~6
Kalvin Phillips|~31|~1
Conor Gallagher|~22|0
Jarrod Bowen|~16|~1
Nick Pope|~10|0
James Maddison|~7|0
Ben White|~4|0
Dominic Solanke|~4|0
Callum Hudson-Odoi|~3|0
Levi Colwill|~2|0
Adam Wharton|~2|0
Tyrick Mitchell|~2|0
Eddie Nketiah|~1|0`;
// England records (all-time, real): name|caps or goals
const ENG_REC_CAPS = 'Peter Shilton|125;Harry Kane|125;Wayne Rooney|120;David Beckham|115;Steven Gerrard|114;Bobby Moore|108;Ashley Cole|107;Bobby Charlton|106;Frank Lampard|106;Billy Wright|105';
const ENG_REC_GOALS = 'Harry Kane|91;Wayne Rooney|53;Bobby Charlton|49;Gary Lineker|48;Jimmy Greaves|44;Michael Owen|40;Nat Lofthouse|30;Alan Shearer|30;Tom Finney|30;Vivian Woodward|29;Steve Bloomer|28';
// tournament history: year|winner|runner-up
const INTL_HIST = {
  WC: `1930|Uruguay|Argentina;1934|Italy|Czechoslovakia;1938|Italy|Hungary;1950|Uruguay|Brazil;1954|West Germany|Hungary;1958|Brazil|Sweden;1962|Brazil|Czechoslovakia;1966|England|West Germany;1970|Brazil|Italy;1974|West Germany|Netherlands;1978|Argentina|Netherlands;1982|Italy|West Germany;1986|Argentina|West Germany;1990|West Germany|Argentina;1994|Brazil|Italy;1998|France|Brazil;2002|Brazil|Germany;2006|Italy|France;2010|Spain|Netherlands;2014|Germany|Argentina;2018|France|Croatia;2022|Argentina|France;2026|Spain|Argentina`,
  EURO: `1960|Soviet Union|Yugoslavia;1964|Spain|Soviet Union;1968|Italy|Yugoslavia;1972|West Germany|Soviet Union;1976|Czechoslovakia|West Germany;1980|West Germany|Belgium;1984|France|Spain;1988|Netherlands|Soviet Union;1992|Denmark|Germany;1996|Germany|Czech Republic;2000|France|Italy;2004|Greece|Portugal;2008|Spain|Germany;2012|Spain|Italy;2016|Portugal|France;2020|Italy|England;2024|Spain|England`,
  UNL: `2019|Portugal|Netherlands;2021|France|Spain;2023|Spain|Croatia;2025|Portugal|Spain`
};
// FIFA men's windows for 2026/27 (later seasons repeat these dates moved by 52 weeks, like the club calendar)
const INTL_WINDOWS = [{ a: '2026-09-21', b: '2026-10-06' }, { a: '2026-11-09', b: '2026-11-17' }, { a: '2027-03-22', b: '2027-03-30' }, { a: '2027-06-07', b: '2027-06-15' }];
