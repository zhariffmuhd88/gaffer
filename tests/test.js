const fs=require('fs');
const code=['data','core','match','season','transfers'].map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
const localStorage={setItem(){},getItem(){return null}};
eval(code+`
newGame('ARS','Tester');
let guard=0, matches=0;
const t0=Date.now();
while(guard++<2000){
  const r=advance();
  if(r.type==='match'){ const f=G.fx[r.fid]; const pre=preMatch(f); const M=createMatch(r.fid,true); simulateFull(M); finalizeMatch(M); postMatch(f,pre); finishDay(); matches++; }
  if(r.type==='season'){ break; }
  if(r.type==='sacked'){console.log('SACKED');break;}
}
console.log('time',Date.now()-t0,'ms user matches',matches);
const h=G.hist[0]; console.log(JSON.stringify(h));
console.log(G.lastSeason.tb.map(([t,p])=>t+':'+p).join(' '));
// goals stats
let gs=0,n=0,hw=0,dr=0,sh=0,ot=0,co=0,yc=0,rc=0,fo=0;
`);
