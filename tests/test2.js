const fs=require('fs');
const code=['data','core','match','season','transfers'].map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
const localStorage={setItem(){},getItem(){return null}};
eval(code+`
newGame('HUL','Tester');
let guard=0;
const t0=Date.now();
while(guard++<6000 && G.hist.length<3){
  const r=advance();
  if(r.type==='match'){ const f=G.fx[r.fid]; const pre=preMatch(f); const M=createMatch(r.fid,true); simulateFull(M); finalizeMatch(M); postMatch(f,pre); finishDay(); }
  if(r.type==='sacked'){ const jobs=jobOffers(); console.log('sacked, jobs',jobs); takeJob(jobs[jobs.length-1]); }
  // user transfer activity test
  if(G.window && R.chance(.05)){ const t=R.pick(Object.values(G.players).filter(p=>G.pl.includes(p.c)&&p.c!==G.user&&p.ca<75)); if(t){ const res=makeBid(t.id, askingPrice(t)); } }
  for(const n of G.news.filter(n=>n.act&&!n.done)){ n.done=true; const o=G.offers.find(x=>x.id===n.act.o); if(!o)continue; if(n.act.k==='terms'){ const r2=offerTerms(o.id,o.wage,3); if(!r2.ok) console.log('terms',r2.msg);} if(n.act.k==='incoming') respondOffer(o.id,R.chance(.3)); if(n.act.k==='counter') acceptCounter(o.id); }
}
console.log('time',Date.now()-t0);
for(const h of G.hist) console.log(JSON.stringify(h));
console.log('user',G.user,'year',G.year,'pl',G.pl.join(','));
console.log('squad sizes',G.pl.map(t=>t+':'+G.sq[t].length).join(' '));
console.log('players',Object.keys(G.players).length,'fa',G.fa.length, 'save KB', Math.round(JSON.stringify(G).length/1024));
`);
