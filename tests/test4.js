const fs=require('fs');
const code=['data','core','match','shot','season','transfers','ext','meta'].map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
let dyn=fs.readFileSync('src/dyn.js','utf8'); dyn=dyn.slice(0,dyn.indexOf('Object.assign(ACT'));
const localStorage={setItem(){},getItem(){return null}};
function formAvg(p){return p.form.length?(p.form.reduce((a,b)=>a+b,0)/p.form.length).toFixed(1):'-';}
function surname(n){return n.split(' ').slice(-1)[0];}
function readable(){return '#fff'}
eval(code+dyn+`
newGame('LIV','T');
const t=userTeam(); console.log('capt',P(t.capt).n,'vice',P(t.vice).n,'staff',Object.values(G.staff).map(s=>s.role+':'+s.ab).join(' '));
// roles
t.tac.form='4-3-3'; autoPick(G.user,true); t.tac.pr=['SK','FB','BPD','CD','WB','MEZ','DLP','BBM','IF','TM','W']; t.tac.line=3; t.tac.counter=2; t.tac.trap=2; t.tac.tackle=3;
G.train='att'; squad(G.user).forEach(p=>{ if(p.age<=22) p.tf='fin'; });
console.log(startScouting('sa'));
// loan in & swap & loan out
const tgt=Object.values(G.players).find(p=>p.c==='CHE'&&importance(p)==='backup'&&p.pos!=='GK');
console.log('loanin',loanInRequest(tgt.id,100).msg);
const yo=squad(G.user).find(p=>p.age<=19); console.log('loanout',loanOut(yo.id,'ch').msg);
const big=Object.values(G.players).find(p=>p.c==='BRE'&&p.ca>=78); const sw=squad(G.user).find(p=>p.ca>=76&&p.ca<=80&&!p.loan);
console.log(makeBid(big.id, 5, sw.id).msg);
console.log(appointCaptain('capt', squad(G.user).filter(p=>p.age<=20)[0].id));
let g=0;
while(g++<4000 && G.hist.length<2){ const r=advance(); if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,true);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}
 for(const n of G.news.filter(n=>n.act&&!n.done)){ n.done=true; const o=G.offers.find(x=>x.id===n.act.o); if(!o)continue; if(n.act.k==='terms'){ console.log('terms',offerTerms(o.id,o.wage,3).msg);} if(n.act.k==='counter') console.log('counter',o.counter, acceptCounter(o.id).msg); if(n.act.k==='incoming') respondOffer(o.id,false); }
 if(r.type==='sacked'){ takeJob(jobOffers()[0]); }
}
console.log('hist',G.hist.map(h=>h.s+' '+h.team+' '+h.upos).join(' | '));
console.log('loan back?', P(yo.id).c, P(yo.id).ca, 'tgt back', P(tgt.id).c);
console.log('prospects',(G.prospects||[]).length,'trained ab',squad(G.user).filter(p=>p.ab).length);
console.log(G.news.filter(n=>/Training|Scouting|Dressing|Loan/.test(n.title)).slice(0,5).map(n=>n.title+': '+n.body.slice(0,80)).join('\\n'));
`);
