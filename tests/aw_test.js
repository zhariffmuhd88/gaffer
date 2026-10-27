const fs=require('fs');
const code=['data','core','match','shot','season','transfers','ext','meta'].map(f=>fs.readFileSync('src/'+f+'.js','utf8')).join('\n');
let dyn=fs.readFileSync('src/dyn.js','utf8'); dyn=dyn.slice(0,dyn.indexOf('Object.assign(ACT'));
let aw=fs.readFileSync('src/awards.js','utf8'); aw=aw.slice(0,aw.indexOf('// ---------- UI'));
let diff=fs.readFileSync('src/diff.js','utf8'); diff=diff.slice(0,diff.indexOf('// club picker'));
let mg=fs.readFileSync('src/manager.js','utf8'); mg=mg.slice(0,mg.indexOf('// ---- start screen'));
const localStorage={setItem(){},getItem(){return null}};
function formAvg(p){return '-'}function surname(n){return n.split(' ').slice(-1)[0]}function readable(){return '#fff'}function esc(s){return s}function uiCol(c){return c}function seeded(s){let a=s>>>0;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}}
eval(code+dyn+aw+diff+mg+`
newGame('IPS','Tester'); ensureProfile();
let g=0;while(g++<6000&&G.hist.length<2){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,true);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();} if(r.type==='sacked'){takeJob(jobOffers()[0]);}}
console.log('months',G.awards.m.length, G.awards.m.map(x=>x.key+':'+(x.potm&&x.potm.n)+'/'+(x.motm&&x.motm.mgr)).join(' | '));
for(const s of G.awards.s) console.log(s.s, 'POTS',s.best&&s.best.n,'YP',s.young&&s.young.n,'Boot',s.boot&&s.boot.n+' '+s.boot.g,'Play',s.play&&s.play.n+' '+s.play.as,'Glove',s.glove&&s.glove.n+' '+s.glove.cs,'MOS',s.mos&&s.mos.mgr+' '+s.mos.tid,'TOS',s.tos.length,'GOS',s.gos&&s.gos.n);
console.log('rec',JSON.stringify(G.mgrP.rec.map(r=>[r.tid,r.p,r.w,r.d,r.l,r.tro])),'aw',JSON.stringify(G.mgrP.aw),'rep',G.mgrRep.toFixed(1));
`);
