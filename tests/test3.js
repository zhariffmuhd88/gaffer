const fs=require('fs');
const code=['data','core','match','season','transfers'].map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
let dyn=fs.readFileSync('src/dyn.js','utf8'); dyn=dyn.slice(0,dyn.indexOf('Object.assign(ACT'));
const localStorage={setItem(){},getItem(){return null}};
function formAvg(p){return p.form.length?(p.form.reduce((a,b)=>a+b,0)/p.form.length).toFixed(1):'-';}
function surname(n){return n.split(' ').slice(-1)[0];}
eval(code+dyn+`
newGame('ARS','T');
let g=0;
while(g++<3000 && G.hist.length<1){ const r=advance(); if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}
 if(G.date==='2026-11-02'){ const p=squad(G.user).find(q=>q.st.s<3&&q.ca>78); if(p){console.log(talkTo(p.id,'time')); console.log(talkTo(p.id,'praise')); p.lastTalk=null; console.log(talkTo(p.id,'promise'));} }
 if(r.type==='sacked'){console.log('sacked');break;}
}
const sq=squad(G.user)||[]; console.log('season done', G.hist.length);
console.log(G.news.filter(n=>/Promise|request|Media/i.test(n.title)).slice(0,8).map(n=>n.d+' '+n.title+': '+n.body.slice(0,90)).join('\\n'));
`);
