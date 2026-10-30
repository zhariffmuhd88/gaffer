// ===== DATA: real winners and runners-up before 2026/27 (Wikipedia list pages, read 30 Oct 2026) =====
// rows: season start year|winner|runner-up. LG = English champions (First Division to 1991/92, Premier League after).
const HIST = {
LG:`1888|Preston North End|Aston Villa
1889|Preston North End|Everton
1890|Everton|Preston North End
1891|Sunderland|Preston North End
1892|Sunderland|Preston North End
1893|Aston Villa|Sunderland
1894|Sunderland|Everton
1895|Aston Villa|Derby County
1896|Aston Villa|Sheffield United
1897|Sheffield United|Sunderland
1898|Aston Villa|Liverpool
1899|Aston Villa|Sheffield United
1900|Liverpool|Sunderland
1901|Sunderland|Everton
1902|The Wednesday|Aston Villa
1903|The Wednesday|Manchester City
1904|Newcastle United|Everton
1905|Liverpool|Preston North End
1906|Newcastle United|Bristol City
1907|Manchester United|Aston Villa
1908|Newcastle United|Everton
1909|Aston Villa|Liverpool
1910|Manchester United|Aston Villa
1911|Blackburn Rovers|Everton
1912|Sunderland|Aston Villa
1913|Blackburn Rovers|Aston Villa
1914|Everton|Oldham Athletic
1919|West Bromwich Albion|Burnley
1920|Burnley|Manchester City
1921|Liverpool|Tottenham Hotspur
1922|Liverpool|Sunderland
1923|Huddersfield Town|Cardiff City
1924|Huddersfield Town|West Bromwich Albion
1925|Huddersfield Town|Arsenal
1926|Newcastle United|Huddersfield Town
1927|Everton|Huddersfield Town
1928|The Wednesday|Leicester City
1929|Sheffield Wednesday|Derby County
1930|Arsenal|Aston Villa
1931|Everton|Arsenal
1932|Arsenal|Aston Villa
1933|Arsenal|Huddersfield Town
1934|Arsenal|Sunderland
1935|Sunderland|Derby County
1936|Manchester City|Charlton Athletic
1937|Arsenal|Wolverhampton Wanderers
1938|Everton|Wolverhampton Wanderers
1946|Liverpool|Manchester United
1947|Arsenal|Manchester United
1948|Portsmouth|Manchester United
1949|Portsmouth|Wolverhampton Wanderers
1950|Tottenham Hotspur|Manchester United
1951|Manchester United|Tottenham Hotspur
1952|Arsenal|Preston North End
1953|Wolverhampton Wanderers|West Bromwich Albion
1954|Chelsea|Wolverhampton Wanderers
1955|Manchester United|Blackpool
1956|Manchester United|Tottenham Hotspur
1957|Wolverhampton Wanderers|Preston North End
1958|Wolverhampton Wanderers|Manchester United
1959|Burnley|Wolverhampton Wanderers
1960|Tottenham Hotspur|Sheffield Wednesday
1961|Ipswich Town|Burnley
1962|Everton|Tottenham Hotspur
1963|Liverpool|Manchester United
1964|Manchester United|Leeds United
1965|Liverpool|Leeds United
1966|Manchester United|Nottingham Forest
1967|Manchester City|Manchester United
1968|Leeds United|Liverpool
1969|Everton|Leeds United
1970|Arsenal|Leeds United
1971|Derby County|Leeds United
1972|Liverpool|Arsenal
1973|Leeds United|Liverpool
1974|Derby County|Liverpool
1975|Liverpool|Queens Park Rangers
1976|Liverpool|Manchester City
1977|Nottingham Forest|Liverpool
1978|Liverpool|Nottingham Forest
1979|Liverpool|Manchester United
1980|Aston Villa|Ipswich Town
1981|Liverpool|Ipswich Town
1982|Liverpool|Watford
1983|Liverpool|Southampton
1984|Everton|Liverpool
1985|Liverpool|Everton
1986|Everton|Liverpool
1987|Liverpool|Manchester United
1988|Arsenal|Liverpool
1989|Liverpool|Aston Villa
1990|Arsenal|Liverpool
1991|Leeds United|Manchester United
1992|Manchester United|Aston Villa
1993|Manchester United|Blackburn Rovers
1994|Blackburn Rovers|Manchester United
1995|Manchester United|Newcastle United
1996|Manchester United|Newcastle United
1997|Arsenal|Manchester United
1998|Manchester United|Arsenal
1999|Manchester United|Arsenal
2000|Manchester United|Arsenal
2001|Arsenal|Liverpool
2002|Manchester United|Arsenal
2003|Arsenal|Chelsea
2004|Chelsea|Arsenal
2005|Chelsea|Manchester United
2006|Manchester United|Chelsea
2007|Manchester United|Chelsea
2008|Manchester United|Liverpool
2009|Chelsea|Manchester United
2010|Manchester United|Chelsea
2011|Manchester City|Manchester United
2012|Manchester United|Manchester City
2013|Manchester City|Liverpool
2014|Chelsea|Manchester City
2015|Leicester City|Arsenal
2016|Chelsea|Tottenham Hotspur
2017|Manchester City|Manchester United
2018|Manchester City|Liverpool
2019|Liverpool|Manchester City
2020|Manchester City|Manchester United
2021|Manchester City|Liverpool
2022|Manchester City|Arsenal
2023|Manchester City|Arsenal
2024|Liverpool|Arsenal
2025|Arsenal|Manchester City`,
CH:`2004|Sunderland|Wigan Athletic
2005|Reading|Sheffield United
2006|Sunderland|Birmingham City
2007|West Bromwich Albion|Stoke City
2008|Wolverhampton Wanderers|Birmingham City
2009|Newcastle United|West Bromwich Albion
2010|Queens Park Rangers|Norwich City
2011|Reading|Southampton
2012|Cardiff City|Hull City
2013|Leicester City|Burnley
2014|Bournemouth|Watford
2015|Burnley|Middlesbrough
2016|Newcastle United|Brighton & Hove Albion
2017|Wolverhampton Wanderers|Cardiff City
2018|Norwich City|Sheffield United
2019|Leeds United|West Bromwich Albion
2020|Norwich City|Watford
2021|Fulham|Bournemouth
2022|Burnley|Sheffield United
2023|Leicester City|Ipswich Town
2024|Leeds United|Burnley
2025|Coventry City|Ipswich Town`,
FA:`1871|Wanderers|Royal Engineers
1872|Wanderers|Oxford University
1873|Oxford University|Royal Engineers
1874|Royal Engineers|Old Etonians
1875|Wanderers|Old Etonians
1876|Wanderers|Oxford University
1877|Wanderers|Royal Engineers
1878|Old Etonians|Clapham Rovers
1879|Clapham Rovers|Oxford University
1880|Old Carthusians|Old Etonians
1881|Old Etonians|Blackburn Rovers
1882|Blackburn Olympic|Old Etonians
1883|Blackburn Rovers|Queen's Park
1884|Blackburn Rovers|Queen's Park
1885|Blackburn Rovers|West Bromwich Albion
1886|Aston Villa|West Bromwich Albion
1887|West Bromwich Albion|Preston North End
1888|Preston North End|Wolverhampton Wanderers
1889|Blackburn Rovers|The Wednesday
1890|Blackburn Rovers|Notts County
1891|West Bromwich Albion|Aston Villa
1892|Wolverhampton Wanderers|Everton
1893|Notts County|Bolton Wanderers
1894|Aston Villa|West Bromwich Albion
1895|The Wednesday|Wolverhampton Wanderers
1896|Aston Villa|Everton
1897|Nottingham Forest|Derby County
1898|Sheffield United|Derby County
1899|Bury|Southampton
1900|Tottenham Hotspur|Sheffield United
1901|Sheffield United|Southampton
1902|Bury|Derby County
1903|Manchester City|Bolton Wanderers
1904|Aston Villa|Newcastle United
1905|Everton|Newcastle United
1906|The Wednesday|Everton
1907|Wolverhampton Wanderers|Newcastle United
1908|Manchester United|Bristol City
1909|Newcastle United|Barnsley
1910|Bradford City|Newcastle United
1911|Barnsley|West Bromwich Albion
1912|Aston Villa|Sunderland
1913|Burnley|Liverpool
1914|Sheffield United|Chelsea
1919|Aston Villa|Huddersfield Town
1920|Tottenham Hotspur|Wolverhampton Wanderers
1921|Huddersfield Town|Preston North End
1922|Bolton Wanderers|West Ham United
1923|Newcastle United|Aston Villa
1924|Sheffield United|Cardiff City
1925|Bolton Wanderers|Manchester City
1926|Cardiff City|Arsenal
1927|Blackburn Rovers|Huddersfield Town
1928|Bolton Wanderers|Portsmouth
1929|Arsenal|Huddersfield Town
1930|West Bromwich Albion|Birmingham
1931|Newcastle United|Arsenal
1932|Everton|Manchester City
1933|Manchester City|Portsmouth
1934|Sheffield Wednesday|West Bromwich Albion
1935|Arsenal|Sheffield United
1936|Sunderland|Preston North End
1937|Preston North End|Huddersfield Town
1938|Portsmouth|Wolverhampton Wanderers
1945|Derby County|Charlton Athletic
1946|Charlton Athletic|Burnley
1947|Manchester United|Blackpool
1948|Wolverhampton Wanderers|Leicester City
1949|Arsenal|Liverpool
1950|Newcastle United|Blackpool
1951|Newcastle United|Arsenal
1952|Blackpool|Bolton Wanderers
1953|West Bromwich Albion|Preston North End
1954|Newcastle United|Manchester City
1955|Manchester City|Birmingham City
1956|Aston Villa|Manchester United
1957|Bolton Wanderers|Manchester United
1958|Nottingham Forest|Luton Town
1959|Wolverhampton Wanderers|Blackburn Rovers
1960|Tottenham Hotspur|Leicester City
1961|Tottenham Hotspur|Burnley
1962|Manchester United|Leicester City
1963|West Ham United|Preston North End
1964|Liverpool|Leeds United
1965|Everton|Sheffield Wednesday
1966|Tottenham Hotspur|Chelsea
1967|West Bromwich Albion|Everton
1968|Manchester City|Leicester City
1969|Chelsea|Leeds United
1970|Arsenal|Liverpool
1971|Leeds United|Arsenal
1972|Sunderland|Leeds United
1973|Liverpool|Newcastle United
1974|West Ham United|Fulham
1975|Southampton|Manchester United
1976|Manchester United|Liverpool
1977|Ipswich Town|Arsenal
1978|Arsenal|Manchester United
1979|West Ham United|Arsenal
1980|Tottenham Hotspur|Manchester City
1981|Tottenham Hotspur|Queens Park Rangers
1982|Manchester United|Brighton & Hove Albion
1983|Everton|Watford
1984|Manchester United|Everton
1985|Liverpool|Everton
1986|Coventry City|Tottenham Hotspur
1987|Wimbledon|Liverpool
1988|Liverpool|Everton
1989|Manchester United|Crystal Palace
1990|Tottenham Hotspur|Nottingham Forest
1991|Liverpool|Sunderland
1992|Arsenal|Sheffield Wednesday
1993|Manchester United|Chelsea
1994|Everton|Manchester United
1995|Manchester United|Liverpool
1996|Chelsea|Middlesbrough
1997|Arsenal|Newcastle United
1998|Manchester United|Newcastle United
1999|Chelsea|Aston Villa
2000|Liverpool|Arsenal
2001|Arsenal|Chelsea
2002|Arsenal|Southampton
2003|Manchester United|Millwall
2004|Arsenal|Manchester United
2005|Liverpool|West Ham United
2006|Chelsea|Manchester United
2007|Portsmouth|Cardiff City
2008|Chelsea|Everton
2009|Chelsea|Portsmouth
2010|Manchester City|Stoke City
2011|Chelsea|Liverpool
2012|Wigan Athletic|Manchester City
2013|Arsenal|Hull City
2014|Arsenal|Aston Villa
2015|Manchester United|Crystal Palace
2016|Arsenal|Chelsea
2017|Chelsea|Manchester United
2018|Manchester City|Watford
2019|Arsenal|Chelsea
2020|Leicester City|Chelsea
2021|Liverpool|Chelsea
2022|Manchester City|Manchester United
2023|Manchester United|Manchester City
2024|Crystal Palace|Manchester City
2025|Manchester City|Chelsea`,
LC:`1960|Aston Villa|Rotherham United
1961|Norwich City|Rochdale
1962|Birmingham City|Aston Villa
1963|Leicester City|Stoke City
1964|Chelsea|Leicester City
1965|West Bromwich Albion|West Ham United
1966|Queens Park Rangers|West Bromwich Albion
1967|Leeds United|Arsenal
1968|Swindon Town|Arsenal
1969|Manchester City|West Bromwich Albion
1970|Tottenham Hotspur|Aston Villa
1971|Stoke City|Chelsea
1972|Tottenham Hotspur|Norwich City
1973|Wolverhampton Wanderers|Manchester City
1974|Aston Villa|Norwich City
1975|Manchester City|Newcastle United
1976|Aston Villa|Everton
1977|Nottingham Forest|Liverpool
1978|Nottingham Forest|Southampton
1979|Wolverhampton Wanderers|Nottingham Forest
1980|Liverpool|West Ham United
1981|Liverpool|Tottenham Hotspur
1982|Liverpool|Manchester United
1983|Liverpool|Everton
1984|Norwich City|Sunderland
1985|Oxford United|Queens Park Rangers
1986|Arsenal|Liverpool
1987|Luton Town|Arsenal
1988|Nottingham Forest|Luton Town
1989|Nottingham Forest|Oldham Athletic
1990|Sheffield Wednesday|Manchester United
1991|Manchester United|Nottingham Forest
1992|Arsenal|Sheffield Wednesday
1993|Aston Villa|Manchester United
1994|Liverpool|Bolton Wanderers
1995|Aston Villa|Leeds United
1996|Leicester City|Middlesbrough
1997|Chelsea|Middlesbrough
1998|Tottenham Hotspur|Leicester City
1999|Leicester City|Tranmere Rovers
2000|Liverpool|Birmingham City
2001|Blackburn Rovers|Tottenham Hotspur
2002|Liverpool|Manchester United
2003|Middlesbrough|Bolton Wanderers
2004|Chelsea|Liverpool
2005|Manchester United|Wigan Athletic
2006|Chelsea|Arsenal
2007|Tottenham Hotspur|Chelsea
2008|Manchester United|Tottenham Hotspur
2009|Manchester United|Aston Villa
2010|Birmingham City|Arsenal
2011|Liverpool|Cardiff City
2012|Swansea City|Bradford City
2013|Manchester City|Sunderland
2014|Chelsea|Tottenham Hotspur
2015|Manchester City|Liverpool
2016|Manchester United|Southampton
2017|Manchester City|Arsenal
2018|Manchester City|Chelsea
2019|Manchester City|Aston Villa
2020|Manchester City|Tottenham Hotspur
2021|Liverpool|Chelsea
2022|Manchester United|Newcastle United
2023|Liverpool|Chelsea
2024|Newcastle United|Liverpool
2025|Manchester City|Arsenal`,
UCL:`1955|Real Madrid|Reims
1956|Real Madrid|Fiorentina
1957|Real Madrid|Milan
1958|Real Madrid|Reims
1959|Real Madrid|Eintracht Frankfurt
1960|Benfica|Barcelona
1961|Benfica|Real Madrid
1962|Milan|Benfica
1963|Inter Milan|Real Madrid
1964|Inter Milan|Benfica
1965|Real Madrid|Partizan
1966|Celtic|Inter Milan
1967|Manchester United|Benfica
1968|Milan|Ajax
1969|Feyenoord|Celtic
1970|Ajax|Panathinaikos
1971|Ajax|Inter Milan
1972|Ajax|Juventus
1973|Bayern Munich|Atlético Madrid
1974|Bayern Munich|Leeds United
1975|Bayern Munich|Saint-Étienne
1976|Liverpool|Borussia Mönchengladbach
1977|Liverpool|Club Brugge
1978|Nottingham Forest|Malmö FF
1979|Nottingham Forest|Hamburger SV
1980|Liverpool|Real Madrid
1981|Aston Villa|Bayern Munich
1982|Hamburger SV|Juventus
1983|Liverpool|Roma
1984|Juventus|Liverpool
1985|Steaua București|Barcelona
1986|Porto|Bayern Munich
1987|PSV Eindhoven|Benfica
1988|Milan|Steaua București
1989|Milan|Benfica
1990|Red Star Belgrade|Marseille
1991|Barcelona|Sampdoria
1992|Marseille|Milan
1993|Milan|Barcelona
1994|Ajax|Milan
1995|Juventus|Ajax
1996|Borussia Dortmund|Juventus
1997|Real Madrid|Juventus
1998|Manchester United|Bayern Munich
1999|Real Madrid|Valencia
2000|Bayern Munich|Valencia
2001|Real Madrid|Bayer Leverkusen
2002|Milan|Juventus
2003|Porto|Monaco
2004|Liverpool|Milan
2005|Barcelona|Arsenal
2006|Milan|Liverpool
2007|Manchester United|Chelsea
2008|Barcelona|Manchester United
2009|Inter Milan|Bayern Munich
2010|Barcelona|Manchester United
2011|Chelsea|Bayern Munich
2012|Bayern Munich|Borussia Dortmund
2013|Real Madrid|Atlético Madrid
2014|Barcelona|Juventus
2015|Real Madrid|Atlético Madrid
2016|Real Madrid|Juventus
2017|Real Madrid|Liverpool
2018|Liverpool|Tottenham Hotspur
2019|Bayern Munich|Paris Saint-Germain
2020|Chelsea|Manchester City
2021|Real Madrid|Liverpool
2022|Manchester City|Inter Milan
2023|Real Madrid|Borussia Dortmund
2024|Paris Saint-Germain|Inter Milan
2025|Paris Saint-Germain|Arsenal`,
UEL:`1971|Tottenham Hotspur|Wolverhampton Wanderers
1972|Liverpool|Borussia Mönchengladbach
1973|Feyenoord|Tottenham Hotspur
1974|Borussia Mönchengladbach|Twente
1975|Liverpool|Club Brugge
1976|Juventus|Athletic Bilbao
1977|PSV Eindhoven|Bastia
1978|Borussia Mönchengladbach|Red Star Belgrade
1979|Eintracht Frankfurt|Borussia Mönchengladbach
1980|Ipswich Town|AZ
1981|IFK Göteborg|Hamburger SV
1982|Anderlecht|Benfica
1983|Tottenham Hotspur|Anderlecht
1984|Real Madrid|Videoton
1985|Real Madrid|1. FC Köln
1986|IFK Göteborg|Dundee United
1987|Bayer Leverkusen|Espanyol
1988|Napoli|VfB Stuttgart
1989|Juventus|Fiorentina
1990|Inter Milan|Roma
1991|Ajax|Torino
1992|Juventus|Borussia Dortmund
1993|Inter Milan|Austria Salzburg
1994|Parma|Juventus
1995|Bayern Munich|Bordeaux
1996|Schalke 04|Inter Milan
1997|Inter Milan|Lazio
1998|Parma|Marseille
1999|Galatasaray|Arsenal
2000|Liverpool|Alavés
2001|Feyenoord|Borussia Dortmund
2002|Porto|Celtic
2003|Valencia|Marseille
2004|CSKA Moscow|Sporting CP
2005|Sevilla|Middlesbrough
2006|Sevilla|Espanyol
2007|Zenit Saint Petersburg|Rangers
2008|Shakhtar Donetsk|Werder Bremen
2009|Atlético Madrid|Fulham
2010|Porto|Braga
2011|Atlético Madrid|Athletic Bilbao
2012|Chelsea|Benfica
2013|Sevilla|Benfica
2014|Sevilla|Dnipro Dnipropetrovsk
2015|Sevilla|Liverpool
2016|Manchester United|Ajax
2017|Atlético Madrid|Marseille
2018|Chelsea|Arsenal
2019|Sevilla|Inter Milan
2020|Villarreal|Manchester United
2021|Eintracht Frankfurt|Rangers
2022|Sevilla|Roma
2023|Atalanta|Bayer Leverkusen
2024|Tottenham Hotspur|Manchester United
2025|Aston Villa|SC Freiburg`,
UECL:`2021|Roma|Feyenoord
2022|West Ham United|Fiorentina
2023|Olympiacos|Fiorentina
2024|Chelsea|Real Betis
2025|Crystal Palace|Rayo Vallecano`
};
