const fs=require('fs');
const code=['data','core','match','shot','season','transfers','ext','meta'].map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
const localStorage={setItem(){},getItem(){return null}};
let dyn=fs.readFileSync('src/dyn.js','utf8'); dyn=dyn.slice(0,dyn.indexOf('Object.assign(ACT'));
function formAvg(p){return p.form.length?(p.form.reduce((a,b)=>a+b,0)/p.form.length).toFixed(1):'-';}
function surname(n){return n.split(' ').slice(-1)[0];}
function readable(){return '#fff'}
eval(code+dyn+`
newGame('ARS','Tester');
let guard=0;
while(guard++<2000){
  if(G.date>=sd('2027-05-31')) break;
  const r=advance();
  if(r.type==='match'){ const f=G.fx[r.fid]; const pre=preMatch(f); const M=createMatch(r.fid,false); simulateFull(M); finalizeMatch(M); postMatch(f,pre); finishDay(); }
  if(r.type==='season') break;
}
const fx=Object.values(G.fx).filter(f=>f.comp==='PL'&&f.r);
let g=0,hw=0,d=0,sh=0,ot=0,co=0,yc=0,rc=0,fo=0,po=0;
for(const f of fx){g+=f.r[0]+f.r[1]; if(f.r[0]>f.r[1])hw++; else if(f.r[0]==f.r[1])d++; sh+=f.st[0].sh+f.st[1].sh; ot+=f.st[0].ot+f.st[1].ot; co+=f.st[0].co+f.st[1].co; yc+=f.st[0].yc+f.st[1].yc; rc+=f.st[0].rc+f.st[1].rc; fo+=f.st[0].fo+f.st[1].fo;}
const n=fx.length;
console.log('PL matches',n,'goals/m',(g/n).toFixed(2),'home%',(hw/n*100).toFixed(0),'draw%',(d/n*100).toFixed(0),'shots/m',(sh/n).toFixed(1),'ot/m',(ot/n).toFixed(1),'corn',(co/n).toFixed(1),'yc',(yc/n).toFixed(2),'rc',(rc/n).toFixed(2),'fouls',(fo/n).toFixed(1));
console.log(leagueTable().map(r=>r.t+':'+r.pts+'('+r.gf+'-'+r.ga+')').join(' '));
const ps=Object.values(G.players).sort((a,b)=>b.st.g-a.st.g).slice(0,10);
console.log(ps.map(p=>p.n+' '+p.st.g+'/'+p.st.as+' '+(p.st.r/p.st.a).toFixed(2)).join('; '));
const ast=Object.values(G.players).sort((a,b)=>b.st.as-a.st.as).slice(0,5); console.log('AST',ast.map(p=>p.n+' '+p.st.as).join('; '));
const inj=Object.values(G.players).filter(p=>p.inj>0).length; console.log('injured now',inj);
console.log('cups',G.cups.LC.winner,G.cups.FA.winner,G.euro.UCL.ki,G.euro.UCL.ko.map(r=>r.ties.length));
console.log('ARS bal',T('ARS').bal.toFixed(1),'tb',T('ARS').tb, 'news',G.news.length);const lg={};for(const f of Object.values(G.fx).filter(f=>f.comp==='PL'&&f.r))for(const s of f.sc)if(s[2]==='G')lg[s[3]]=(lg[s[3]]||0)+1;
console.log('LEAGUE', Object.entries(lg).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id,g])=>P(id).n+' '+g).join('; '));


console.log('BAL', G.pl.map(t=>t+':'+Math.round(T(t).bal)+'/'+PL_CLUBS.find(c=>c.id===t).bal+' w'+Math.round(wageBill(t))).join(' '));
`);
