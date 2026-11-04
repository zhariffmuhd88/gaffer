// Shoot-out rules and conversion rate, WUPH verified posts, the Jesús de Miguel tribute.
const fs = require('fs');
const files = fs.readFileSync('build.py', 'utf8').match(/\[(.*?)\]/)[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(f => f !== 'boot.js' && f !== 'intro.js');
const el = () => ({ style: {}, classList: { add() { }, remove() { }, toggle() { } }, addEventListener() { }, appendChild() { }, setAttribute() { }, querySelector() { return null; }, querySelectorAll() { return []; }, getContext() { return null; }, innerHTML: '' });
global.window = global; global.document = { addEventListener() { }, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement: el, body: el(), documentElement: el() };
global.localStorage = { setItem() { }, getItem() { return null; }, removeItem() { } };
global.navigator = { userAgent: 'node' }; global.requestAnimationFrame = () => 0; global.matchMedia = () => ({ matches: false });
(0, eval)(files.map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n') + `
;toast = () => {}; render = () => {};
newGame('ARS', 'T');
const fid = Object.values(G.fx).find(f => f.h === 'ARS').id;
let kicks = 0, goals = 0, lens = [], bad = 0;
for (let i = 0; i < 400; i++) { const M = createMatch(fid, false); M.min = 120; M.et = true; shootout(M); const so = M.so; kicks += so.n; goals += so.sc[0] + so.sc[1]; lens.push(so.n);
  const k0 = so.kicks[0].length, k1 = so.kicks[1].length; if (!M.done || so.sc[0] === so.sc[1] || Math.abs(k0 - k1) > 1 || (k0 > 5 && k0 !== k1)) bad++; }
console.log('auto shoot-outs: conversion', (goals / kicks * 100).toFixed(1) + '%', '| avg kicks', (kicks / 400).toFixed(1), '| max', Math.max(...lens), '| rule errors', bad);
// manual: aim always matches dive => many saves
const M = createMatch(fid, true); M.soLive = true; M.min = 120; M.et = true; shootout(M); let g = 0; while (!M.so.over && g++ < 60) soKick(M, null, 'L', 'R'); console.log('manual all corners vs wrong dive: ', M.so.sc.join('-'), M.done, M.pens);
const M2 = createMatch(fid, true); M2.soLive = true; M2.min = 120; M2.et = true; shootout(M2); stepMinute(M2); console.log('skip resolves:', M2.done, M2.pens);
// tribute
while (G.date < '2026-11-05') { const r = advance(); if (r.type === 'match') { const f = G.fx[r.fid]; const pre = preMatch(f); const MM = createMatch(r.fid, false); simulateFull(MM); finalizeMatch(MM); postMatch(f, pre); finishDay(); } }
console.log('tribute', G.sto && G.sto.dm, G.news.filter(n => /Jesús|racism/i.test(n.title)).map(n => n.title).join(' / '), '| posts', G.feed.filter(p => /Jesús|racis/i.test(p.t)).length, '| verified html', postHtml(G.feed.find(p => p.k === 'club')).includes('✅'), '| fan not verified', !postHtml(G.feed.find(p => p.k === 'fan')).includes('✅'));
const M3 = createMatch(Object.values(G.fx).filter(f => !f.r && (f.h === G.user || f.a === G.user)).sort((a,b)=>a.d<b.d?-1:1)[0].id, true); console.log('applause line:', M3.com.some(c => /applause/.test(c.text)), '| again:', createMatch(Object.values(G.fx).filter(f => !f.r && (f.h === G.user || f.a === G.user)).sort((a,b)=>a.d<b.d?-1:1)[1].id, true).com.some(c => /applause/.test(c.text)));
`);
