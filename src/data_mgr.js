// ===== DATA: managers for the world rankings (major honours as manager, up to the end of 2025/26) =====
// [name, nationality, status, club or job, honours, worked in England]
// status: a = club job, n = national team, f = without a job, r = retired or not coaching, d = died
// honours: L top-five-league title, l other top-flight title, C European Cup/Champions League, E UEFA Cup/Europa League,
// K Conference League, W Cup Winners' Cup, I Intercontinental/Club World Cup, A other continental club cup,
// D major domestic cup, d league cup, N World Cup, X Euro/Copa América/Asian Cup, S second-tier title.
// Club jobs for European clubs checked against news reports, Oct 2026. Honours counts are game summaries.
const MGR_W = { L: 20, l: 8, C: 30, E: 15, K: 8, W: 12, I: 6, A: 8, D: 6, d: 4, N: 35, X: 20, S: 4 };
const MGR_CODE_N = { L: 'top-five league', l: 'other league', C: 'European Cup', E: 'UEFA Cup/Europa League', K: 'Conference League', W: "Cup Winners' Cup", I: 'world club title', A: 'continental cup', D: 'domestic cup', d: 'league cup', N: 'World Cup', X: 'continental nations cup', S: 'second-tier title' };
const MGR_DATA = [
  // legends
  ['Sir Alex Ferguson', 'Scotland', 'r', 'Retired', 'L13 l3 C2 W2 I2 D9 d5 S1', 1],
  ['Arsène Wenger', 'France', 'r', 'Retired', 'L4 D9', 1],
  ['Bob Paisley', 'England', 'd', 'Liverpool legend', 'L6 C3 E1 d3', 1],
  ['Brian Clough', 'England', 'd', 'Nottingham Forest legend', 'L2 C2 d4 S1', 1],
  ['Johan Cruyff', 'Netherlands', 'd', 'Barcelona legend', 'L4 C1 W2 D3', 0],
  ['Rinus Michels', 'Netherlands', 'd', 'Ajax legend', 'L1 l4 C1 D5 X1', 0],
  ['Jürgen Klopp', 'Germany', 'r', 'Not coaching', 'L3 C1 I1 D2 d2', 1],
  ['Sir Matt Busby', 'Scotland', 'd', 'Manchester United legend', 'L5 C1 D2', 1],
  ['Bill Shankly', 'Scotland', 'd', 'Liverpool legend', 'L3 E1 D2 S1', 1],
  ['Arrigo Sacchi', 'Italy', 'r', 'Retired', 'L1 C2 I2', 0],
  ['Herbert Chapman', 'England', 'd', 'Arsenal legend', 'L4 D2', 1],
  ['Sir Bobby Robson', 'England', 'd', 'Ipswich Town legend', 'l4 E1 W1 D3', 1],
  ['Giovanni Trapattoni', 'Italy', 'r', 'Retired', 'L8 l2 C1 E3 W1 I1 D3', 0],
  ['Marcello Lippi', 'Italy', 'r', 'Retired', 'L5 l3 C1 I1 A1 N1 D1', 0],
  ['Vicente del Bosque', 'Spain', 'r', 'Retired', 'L2 C2 I1 N1 X1', 0],
  ['Kenny Dalglish', 'Scotland', 'r', 'Retired', 'L4 D2 d1', 1],
  ['Sir Alf Ramsey', 'England', 'd', 'England legend', 'L1 N1 S1', 1],
  ['Louis van Gaal', 'Netherlands', 'r', 'Retired', 'L3 l4 C1 E1 I1 D4', 1],
  ['Fabio Capello', 'Italy', 'r', 'Retired', 'L7 C1', 1],
  // active, European clubs and national teams
  ['José Mourinho', 'Portugal', 'a', 'Real Madrid', 'L6 l2 C2 E2 K1 D4 d4', 1],
  ['Pep Guardiola', 'Spain', 'f', 'Without a club', 'L12 C3 I4 D7 d5', 1],
  ['Carlo Ancelotti', 'Italy', 'n', 'Brazil', 'L6 C5 I4 D4', 1],
  ['Luis Enrique', 'Spain', 'a', 'Paris SG', 'L5 C3 I1 D5', 0],
  ['Hansi Flick', 'Germany', 'a', 'Barcelona', 'L4 C1 I1 D2', 0],
  ['Vincent Kompany', 'Belgium', 'a', 'Bayern Munich', 'L2 S1', 1],
  ['Cristian Chivu', 'Romania', 'a', 'Inter', 'L1', 0],
  ['Luciano Spalletti', 'Italy', 'a', 'Juventus', 'L1 l2 D3', 0],
  ['Massimiliano Allegri', 'Italy', 'a', 'Napoli', 'L6 D5', 0],
  ['Rúben Amorim', 'Portugal', 'a', 'AC Milan', 'l2 d3', 1],
  ['Diego Simeone', 'Argentina', 'a', 'Atletico Madrid', 'L2 l2 E2 D1', 0],
  ['Niko Kovač', 'Croatia', 'a', 'Borussia Dortmund', 'L1 D2', 0],
  ['Thomas Tuchel', 'Germany', 'n', 'England', 'L3 C1 I1 D2 d1', 1],
  ['Luis de la Fuente', 'Spain', 'n', 'Spain', 'N1 X1', 0],
  ['Lionel Scaloni', 'Argentina', 'n', 'Argentina', 'N1 X2', 0],
  ['Antonio Conte', 'Italy', 'f', 'Without a club', 'L6 D1 S1', 1],
  ['Arne Slot', 'Netherlands', 'f', 'Without a club', 'L1 l1 D1', 1],
  // Premier League and Championship managers in the game (club comes from the game itself)
  ['Mikel Arteta', 'Spain', 'a', '', 'L1 D1', 1],
  ['Enzo Maresca', 'Italy', 'a', '', 'K1 I1 S1', 1],
  ['Andoni Iraola', 'Spain', 'a', '', '', 1],
  ['Michael Carrick', 'England', 'a', '', '', 1],
  ['Xabi Alonso', 'Spain', 'a', '', 'L1 D1', 1],
  ['Unai Emery', 'Spain', 'a', '', 'L1 E5 D2 d2', 1],
  ['Roberto De Zerbi', 'Italy', 'a', '', '', 1],
  ['Matthias Jaissle', 'Germany', 'a', '', 'l2 D1 A2', 1],
  ['Marco Rose', 'Germany', 'a', '', 'l2 D1', 1],
  ['Regis Le Bris', 'France', 'a', '', '', 1],
  ['Pierre Sage', 'France', 'a', '', '', 1],
  ['Fabian Hurzeler', 'Germany', 'a', '', 'S1', 1],
  ['Keith Andrews', 'Republic of Ireland', 'a', '', '', 1],
  ['Alvaro Arbeloa', 'Spain', 'a', '', '', 1],
  ['David Moyes', 'Scotland', 'a', '', 'K1', 1],
  ['Daniel Farke', 'Germany', 'a', '', 'S3', 1],
  ['Oliver Glasner', 'Austria', 'a', '', 'E1 K1 D1', 1],
  ['Frank Lampard', 'England', 'a', '', 'S1', 1],
  ['Sergej Jakirovic', 'Croatia', 'a', '', 'l2 D1', 1],
  ['Nuno Espírito Santo', 'Portugal', 'a', '', 'l1 S1', 1],
  ['César Peixoto', 'Portugal', 'a', '', '', 1],
  ['Tonda Eckert', 'Germany', 'a', '', '', 1],
  ['Kim Hellberg', 'Sweden', 'a', '', '', 1],
  ['Chris Wilder', 'England', 'a', '', '', 1],
  ['Philippe Clement', 'Belgium', 'a', '', 'l3 d1', 1],
  ['John Mousinho', 'England', 'a', '', '', 1],
  ['James Morrison', 'Scotland', 'a', '', '', 1],
  ['Alessio Dionisi', 'Italy', 'a', '', 'S1', 1],
  ['Alex Neil', 'Scotland', 'a', '', '', 1],
  ['Michael Skubala', 'England', 'a', '', '', 1],
  ['Vítor Matos', 'Portugal', 'a', '', '', 1],
  ['Mark Robins', 'England', 'a', '', '', 1],
  ['John Eustace', 'England', 'a', '', '', 1],
  ['Julien Stéphan', 'France', 'a', '', '', 1],
  ['Graham Alexander', 'Scotland', 'a', '', '', 1],
  ['Tony Mowbray', 'England', 'a', '', 'S1', 1],
  ['Chris Davies', 'Wales', 'a', '', '', 1],
  ['Phil Parkinson', 'England', 'a', '', '', 1],
  ['Nathan Jones', 'Wales', 'a', '', '', 1],
  ['Steven Schumacher', 'England', 'a', '', '', 1],
  ['Brian Barry-Murphy', 'Republic of Ireland', 'a', '', '', 1]
];
const REGION_OF = (() => {
  const R = {};
  const put = (reg, list) => list.forEach(n => R[n] = reg);
  put('Europe', ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Republic of Ireland', 'Spain', 'Portugal', 'France', 'Germany', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Denmark', 'Norway', 'Sweden', 'Poland', 'Croatia', 'Serbia', 'Turkey', 'Romania']);
  put('Asia', ['Malaysia', 'Saudi Arabia', 'UAE', 'Japan', 'South Korea', 'China', 'Indonesia', 'Singapore', 'Thailand', 'Vietnam', 'Philippines', 'India']);
  put('Africa', ['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Egypt', 'Morocco']);
  put('South America', ['Brazil', 'Argentina', 'Uruguay', 'Colombia']);
  put('North America', ['Mexico', 'USA', 'Canada']);
  put('Oceania', ['Australia', 'New Zealand']);
  return R;
})();
