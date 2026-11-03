// Club life: requests, documentary, Cup Winners' Cup, Club World Cup, trophy room, statue, son, save file text. node tests/clublife_test.js [CLUB]
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
const CLUB = process.argv[2] || 'ARS';
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {}; playerModal = () => {};
newGame('${CLUB}', 'T'); console.log('doc:', docStart() || 'ok', Math.round(userTeam().bal));
let g = 0, errs = 0, answered = 0;
while (g++ < 30000 && G.hist.length < 1) { try { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const M = createMatch(r.fid, false); simulateFull(M); finalizeMatch(M); postMatch(f, pre); finishDay(); }
  const open = reqList().filter(x => x.st === 'open'); if (open.length && answered < 4) { const x = open[0]; console.log(G.date, 'request', x.t, P(x.pid).n, '->', answerRequest(x.id, REQ_T[x.t].opts[answered % REQ_T[x.t].opts.length][0])); answered++; }
} catch (e) { errs++; console.log('ERR', G.date, e.stack.split('\\n').slice(0, 4).join(' | ')); break; } }
console.log('requests', reqList().length, reqList().map(x => x.t + ':' + x.st).join(' '));
console.log('doc episodes', G.doc && G.doc.ep);
const h = G.chist[G.chist.length - 1]; console.log('CWC', h.c.CWC ? tName(h.c.CWC.w) + ' beat ' + tName(h.c.CWC.r) : 'none', '| CWX', h.c.CWX ? tName(h.c.CWX.w) : 'none');
console.log('trophy room svg', trophyRoomSvg(G.user).length, '| parade', paradeSvg(G.user, 'FA Cup').length);
G.statues = {}; const st = curStint(); st.tro = ['2026/27 Premier League', '2026/27 FA Cup', '2026/27 Champions League']; checkStatue(); console.log('statue', JSON.stringify(G.statues));
st.from = '2020-07-01'; checkSon(); console.log('son ask', G.son && G.son.st); signSon('Adam Zhariff'); const s = P(G.son.pid); console.log('son', s.n, s.age, s.pa, s.sq, s.nat);
const json = saveJSON(G); const z = lzPack(json); importSaveText(z); console.log('import compressed ok', G.ll.length, '| errors', errs);
`);
