// Former players as staff (non-playing profiles) and national-team trophy celebrations. node tests/exnat_test.js
const fs = require("fs"); global.fs = fs;
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;let last = ''; toast = (m) => { last = m; }; render = () => {};
newGame('ARS', 'T'); ensureStaff(); let fail = 0;
// a retired player and a veteran at the club
const vets = Object.values(G.players).filter(p => p.age >= 34 && G.sq[p.c]).slice(0, 3);
vets[0].c = 'RETIRED'; G.sq[vets[0].lastC = Object.keys(G.sq).find(k => G.sq[k].includes(vets[0].id))] = G.sq[vets[0].lastC].filter(x => x !== vets[0].id); vets[0].car.a = 120; vets[0].ic = 60;
buildExPool(); const pool = exPool(); console.log('pool', pool.length, pool.map(p => p.n + ' ' + p.age + ' ' + exStatus(p).t).slice(0, 6).join(' | '));
if (!pool.length) fail++;
const own = squad('ARS').sort((a, b) => b.age - a.age)[0]; console.log('oldest ARS', own.n, own.age, exEligible(own));
const pr = exProfile(pool[0]); console.log('profile', pool[0].n, JSON.stringify(pr.ab), pr.best, pr.badge, pr.traits.join('/'));
const html = exProfileHtml(pool[0]); if (!/non-playing profile/.test(html) || !/Coaching badges/.test(html)) fail++;
const rp = pool.find(p => p.c === 'RETIRED') || pool[0]; const n0 = G.sq.ARS.length;
console.log(hireEx(rp.id, 'coach')); console.log('staff coach', G.staff.coach.n, G.staff.coach.ab, G.staff.coach.pid === rp.id, rp.gone);
if (G.staff.coach.pid !== rp.id || rp.c !== 'RETIRED') fail++;
const sh = scrStaff(); if (!/Former players open/.test(sh) || !/ex-pro/.test(sh)) { fail++; console.log('staff screen missing'); }
if (exEligible(own)) { console.log(hireEx(own.id, 'scout')); if (G.sq.ARS.includes(own.id) || own.c !== 'RETIRED' || G.staff.scout.pid !== own.id) fail++; console.log('squad', n0, '->', G.sq.ARS.length); }
// replacing the ex-player with a normal hire frees him
const i = G.staffPool.findIndex(s => s.role === 'coach'); hireStaff(i); console.log('after normal hire:', rp.gone, !!rp.stf); if (rp.stf) fail++;
// a normal profile on a player card
if (!/Non-playing profile/.test(playerExtra(rp))) fail++;
prunePlayers(); if (!P(own.id)) { fail++; console.log('pruned staff'); }
// national trophy
const E = G.intl.ed.UNL27; const before = G.news.length;
finishEdition(E, NID('ENG'), NID('ESP'));
const nn = G.news.slice(0, G.news.length - before); nn.forEach(n => console.log('NEWS', n.title, '::', n.body.slice(0, 260), n.art ? '[art ' + n.art.k + ']' : ''));
if (!nn.some(n => n.art && n.art.k === 'ntro') || !nn.some(n => n.art && n.art.k === 'npar')) fail++;
console.log('parade popup', !!G.natParade);
const E2 = { key: 'WC30', comp: 'WC', name: 'World Cup 2030', ko: [], fx: {} };
G.intl.hist.push({ key: 'WC30', comp: 'WC', name: 'World Cup 2030', w: NID('ESP'), r: NID('ARG') }); natCelebrate(E2, NID('ESP'), NID('ARG'));
console.log('WC', G.news[1].title, '::', G.news[1].body.slice(0, 200));
console.log('titles ESP WC', natTitles(NID('ESP'), 'WC').n, 'GER', natTitles(NID('GER'), 'WC').n);
const sv = natCelebSvg(NID('ESP'), 'WC', 'World Cup 2030') + natParadeSvg(NID('ESP'), 'WC', 'Madrid') + natCabinetSvg(NID('ENG'));
fs.writeFileSync(process.env.NAT_HTML || '/tmp/nat.html', '<body style="background:#111">' + sv + '<div style="width:600px">' + intlHistHtml().slice(0, 3000) + '</div></body>');
const nh = squad('ARS').filter(p => p.nh); console.log('ARS players with nh', nh.map(p => p.n + ':' + p.nh.join()).join(', '));
console.log(fail ? 'FAIL ' + fail : 'OK');
`);
