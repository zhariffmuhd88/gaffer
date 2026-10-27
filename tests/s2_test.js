const fs=require('fs');
const code=['data','core','match','shot','season','transfers','ext','meta'].map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
let dyn=fs.readFileSync('src/dyn.js','utf8'); dyn=dyn.slice(0,dyn.indexOf('Object.assign(ACT'));
const localStorage={setItem(){},getItem(){return null}};
function formAvg(p){return '-'}function surname(n){return n}function readable(){return '#fff'}
eval(code+dyn+`
newGame('IPS','T');
function summary(){const fx=Object.values(G.fx).filter(f=>f.comp==='PL'&&f.r);let g=0;for(const f of fx)g+=f.r[0]+f.r[1];
 const top=Object.values(G.players).filter(p=>p.st.lg).sort((a,b)=>b.st.lg-a.st.lg).slice(0,5).map(p=>p.n+'('+p.c+','+p.ca+') '+p.st.lg+'g/'+p.st.la+'a');
 const fwd=(t)=>squad(t).filter(p=>p.pos==='ST').map(p=>p.n+':'+p.ca).join(',');
 const gk=G.pl.map(t=>squad(t).filter(p=>p.pos==='GK').sort((a,b)=>b.ca-a.ca)[0]).filter(Boolean);const gkA=gk.reduce((s,p)=>s+p.ca,0)/gk.length;const xi=G.pl.map(t=>squad(t).sort((a,b)=>b.ca-a.ca).slice(0,11).reduce((s,p)=>s+p.ca,0)/11);const def=G.pl.map(t=>squad(t).filter(p=>['CB','LB','RB'].includes(p.pos)).sort((a,b)=>b.ca-a.ca).slice(0,4).reduce((s,p)=>s+p.ca,0)/4);const att=G.pl.map(t=>squad(t).filter(p=>['ST','LW','RW','AM'].includes(p.pos)).sort((a,b)=>b.ca-a.ca).slice(0,3).reduce((s,p)=>s+p.ca,0)/3);const av=a=>(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
 return 'GK '+gkA.toFixed(1)+' XI '+av(xi)+' DEF '+av(def)+' ATT '+av(att)+' gpm '+(g/fx.length).toFixed(2)+' | '+top.join('; ')+' | MUN ST: '+fwd('MUN')+' | MUN form '+T('MUN').tac.form;}
let g=0;while(g++<6000&&G.hist.length<2){ if(G.hist.length===1 && G.date>=sd('2027-05-20') && !globalThis.done2){globalThis.done2=1;console.log('S2',summary());}
 if(G.hist.length===0 && G.date>=sd('2027-05-20') && !globalThis.done1){globalThis.done1=1;console.log('S1',summary());}
 const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();} if(r.type==='sacked'){takeJob(jobOffers()[0]);}}
`);
