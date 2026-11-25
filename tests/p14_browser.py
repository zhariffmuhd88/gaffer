# Phase 14: free-kick wall (9.15 m, keeper, jump), corners (jostle, raised arm), penalty run-up, injuries (physios,
# buggy, limp), substitutions (walk off, high five), added-time board, managers, the shoot-out on the pitch.
# Real three.js r128. python3 tests/p14_browser.py OUT_DIR
import asyncio, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from playwright.async_api import async_playwright
import real3d
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True); BAD = []
def check(tag, ok, msg):
    print(tag, 'ok  ' if ok else 'FAIL', msg)
    if not ok: BAD.append(tag + ' ' + msg)
CAM = "(o)=>{const S3=UI.match.v3s;S3.dbg={want:o.w,look:o.l};}"
async def adv(pg, ms):
    # the live scene is driven by hand (LM.hold) so the test does not depend on the frame rate
    await pg.evaluate("(ms)=>{const LM=UI.match;for(let t=0;t<ms;t+=40)runScene(LM,LM.vis.live,40);}", ms); await pg.wait_for_timeout(150)
async def run(p, vw, tag):
    errs = []
    b, pg = await real3d.open_match(p, out, vw=vw, errs=errs)
    shots = tag == 'desk'
    await pg.evaluate("()=>{if(UI.match.run)ACT.mrun();UI.match.hold=true;UI.match.vis.live.plan=[];UI.match.vis.live.si=-1;UI.match.vis.live.kick=false;}")
    # free kick 24 m out
    fk = await pg.evaluate("""()=>{const LM=UI.match,SC=LM.vis.live,M=LM.M;const tk=onPitch(M,0).find(e=>e.role==='AMC'||e.role==='MC');
      const st={k:'place',at:{x:.78,y:.4},e:tk,ts:SC.t,te:SC.t+60000,w:1};SC.plan=[st,{k:'shot',e:tk,ts:SC.t+60000,te:SC.t+61000}];SC.si=0;enterStep(LM,SC,st);
      const W=SC.wall;if(!W)return null;const d=W.ps.map(e=>{const p=SC.ov.get(e);return Math.hypot((p.x-.78)*105,(p.y-.4)*68)});const g=SC.ov.get(W.gk);return {n:W.ps.length,dmin:Math.min(...d),dmax:Math.max(...d),gk:g}}""")
    check(tag, fk and fk['n'] >= 3 and 8.4 < fk['dmin'] and fk['dmax'] < 10.2 and abs(fk['gk']['y'] - .5) > .03, 'free-kick wall ' + str(fk))
    await adv(pg, 1800)
    if shots:
        await pg.evaluate(CAM, {'w': {'x': -21, 'y': 2.6, 'z': -8.5}, 'l': {'x': 40, 'y': 1, 'z': 0}}); await pg.wait_for_timeout(500)
        await real3d.canvas_shot(pg, out / 'p14_wall.png')
    j = await pg.evaluate("()=>new Promise(res=>{const SC=UI.match.vis.live;SC.wall.jump=SC.t-300;requestAnimationFrame(()=>requestAnimationFrame(()=>{const S3=UI.match.v3s;res(Math.max(...SC.wall.ps.map(e=>{const f=S3.figs.get(e);return f?f.g.position.y:0})))}))})")
    check(tag, j > .2, f'wall jumps ({j:.2f} m)')
    if shots: await real3d.canvas_shot(pg, out / 'p14_wall_jump.png')
    await pg.evaluate("()=>{const SC=UI.match.vis.live;SC.wall=null;SC.plan=[];SC.si=-1;SC.ov.clear();UI.match.v3s.dbg=null;}")
    # corner
    c = await pg.evaluate("""()=>{const LM=UI.match,SC=LM.vis.live,M=LM.M;const tk=onPitch(M,0).find(e=>e.role==='AML'||e.role==='MC');const st={k:'place',at:{x:1,y:0},e:tk,txt:'Corner',ts:SC.t,te:SC.t+60000};SC.plan=[st];SC.si=0;enterStep(LM,SC,st);return {pairs:SC.jostle?SC.jostle.pairs.length:0,arm:!!LM.arm13}}""")
    check(tag, c['pairs'] >= 3 and c['arm'], 'corner jostle and raised arm ' + str(c))
    await adv(pg, 1500)
    if shots:
        await pg.evaluate(CAM, {'w': {'x': 38, 'y': 9, 'z': 22}, 'l': {'x': 46, 'y': 0, 'z': 0}}); await pg.wait_for_timeout(500)
        await real3d.canvas_shot(pg, out / 'p14_corner.png')
    await pg.evaluate("()=>{const SC=UI.match.vis.live;SC.jostle=null;SC.plan=[];SC.si=-1;SC.ov.clear();UI.match.v3s.dbg=null;}")
    # penalty run-up
    pk = await pg.evaluate("""()=>{const LM=UI.match,SC=LM.vis.live,M=LM.M;const tk=onPitch(M,0).find(e=>e.role==='FC');const at=wpt(0,.895,.5);const st={k:'place',at,e:tk,pen:0,ts:SC.t,te:SC.t+3000};SC.plan=[st];SC.si=0;enterStep(LM,SC,st);const p0=SC.ov.get(tk);return {pk:!!SC.pk,back:Math.abs(p0.x-at.x)*105}}""")
    check(tag, pk['pk'] and pk['back'] > 4, 'penalty run-up from behind the ball ' + str(pk))
    await adv(pg, 2700)
    pk2 = await pg.evaluate("()=>{const SC=UI.match.vis.live;const k=SC.pk;if(!k)return null;const o=SC.ov.get(k.e);return Math.abs(o.x-k.at.x)*105}")
    check(tag, pk2 is not None and pk2 < 2, f'taker reaches the ball ({pk2})')
    await pg.evaluate("()=>{const SC=UI.match.vis.live;SC.pk=null;SC.plan=[];SC.si=-1;SC.ov.clear();}")
    # injury: physios and buggy
    await pg.evaluate("""()=>{const LM=UI.match,M=LM.M;const e=onPitch(M,0).find(x=>x.role==='MC'||x.role==='DM');e.injDays=40;M.ev.push({min:M.min,t:'inj',side:0,p:e.p.id});window._inj=e;}""")
    await adv(pg, 3000); await pg.wait_for_timeout(2500)
    inj = await pg.evaluate("()=>{const LM=UI.match,S3=LM.v3s,SC=LM.vis.live;return {i:!!LM.inj13&&LM.inj13.serious,phys:S3.sp14?S3.sp14.phys.filter(f=>f.g.visible).length:0,buggy:S3.sp14?S3.sp14.buggy.visible:false,down:SC.fallen.get(window._inj)>SC.t,limp:SC.limp&&SC.limp.get(window._inj)>SC.t}}")
    check(tag, inj['i'] and inj['phys'] == 2 and inj['buggy'] and inj['down'] and inj['limp'], 'injury: physios, buggy, player down, limp ' + str(inj))
    if shots:
        await pg.evaluate("()=>{const S3=UI.match.v3s,SC=UI.match.vis.live;const w=W3(SC.pos.get(window._inj));S3.dbg={want:{x:w.x+7,y:4.5,z:w.z+9},look:{x:w.x,y:.5,z:w.z}};}"); await pg.wait_for_timeout(600)
        await real3d.canvas_shot(pg, out / 'p14_injury.png'); await pg.evaluate("()=>{UI.match.v3s.dbg=null;}")
    # substitution: walk off, replacement from halfway
    sub = await pg.evaluate("""()=>{const LM=UI.match,M=LM.M,S=M.sides[0];const off=S.ps.find(e=>e.on&&e.role==='FC');const pin=S.bench.find(p=>p.pos!=='GK');if(!off||!pin)return null;S.subs=Math.max(1,S.subs);
       doSub(M,0,off,pin);window._off=off;window._on=S.ps[S.ps.length-1];return true}""")
    await adv(pg, 1800)
    s2 = await pg.evaluate("()=>{const SC=UI.match.vis.live,S3=UI.match.v3s;const p=SC.pos.get(window._off);const f=S3.figs.get(window._off);return {exit:!!(SC.exit&&SC.exit.has(window._off)),pos:p?[+p.x.toFixed(3),+p.y.toFixed(3)]:null,vis:!!(f&&f.g.visible),hi5:!!UI.match.hi5,on:!!SC.pos.get(window._on)}}")
    print(tag, 'sub setup', sub)
    check(tag, sub and s2['exit'] and s2['pos'] and s2['vis'] and s2['hi5'] and s2['on'], 'substitution walk-off ' + str(s2))
    # added-time board
    await pg.evaluate("()=>{const M=UI.match.M;window._min=M.min;M.min=90;}"); await adv(pg, 80)
    bd = await pg.evaluate("()=>{const el=document.querySelector('.brd14');const r={on:!!el&&el.classList.contains('on'),txt:el?el.textContent:''};UI.match.M.min=window._min;return r}")
    check(tag, bd['on'] and '+' in bd['txt'], 'added-time board ' + str(bd))
    if shots:
        await pg.evaluate(CAM, {'w': {'x': 0, 'y': 3.5, 'z': -24}, 'l': {'x': 0, 'y': 2, 'z': -36}}); await pg.wait_for_timeout(500)
        await real3d.canvas_shot(pg, out / 'p14_board.png', '#p2dwrap'); await pg.evaluate("()=>{UI.match.v3s.dbg=null;}")
    # manager appeal
    await pg.evaluate("()=>{UI.match.mgr13={kind:'appeal',side:1,until:performance.now()+3000};}"); await pg.wait_for_timeout(200)
    # shoot-out on the pitch
    so = await pg.evaluate("""()=>{const LM=UI.match,M=LM.M;const tk=onPitch(M,0).find(e=>e.role==='AMC'||e.role==='MC'||e.role==='FC');M.so={sc:[1,0],kicks:[[true],[]],used:[[tk.p.id],[]],first:0,turn:1,n:1,last:{s:0,pid:tk.p.id,n:tk.p.n,aim:'L',dive:'R',how:'goal',gk:''}};window._tk=tk;return true}""")
    await adv(pg, 1300)
    s1 = await pg.evaluate("()=>{const SC=UI.match.vis.live,M=UI.match.M;const inC=onPitch(M,1).filter(e=>e.role!=='GK').map(e=>SC.ov.get(e)).filter(p=>p&&Math.abs(p.x-.5)<.05).length;const t=SC.ov.get(window._tk);return {circle:inC,tk:t?+t.x.toFixed(3):null}}")
    if shots:
        await pg.evaluate(CAM, {'w': {'x': 14, 'y': 30, 'z': 30}, 'l': {'x': 26, 'y': 0, 'z': 0}}); await pg.wait_for_timeout(400)
        await real3d.canvas_shot(pg, out / 'p14_shootout.png')
    await adv(pg, 1000)
    s3 = await pg.evaluate("()=>{const SC=UI.match.vis.live;return {bx:+SC.ball.x.toFixed(3),by:+SC.ball.y.toFixed(3),dive:!!SC.dive}}")
    check(tag, s1['circle'] >= 8 and s1['tk'] and s1['tk'] > .6 and s3['bx'] > .95 and abs(s3['by'] - .465) < .02, 'shoot-out on the pitch ' + str(s1) + str(s3))
    if shots: await real3d.canvas_shot(pg, out / 'p14_shootout_kick.png')
    await pg.evaluate("()=>{delete UI.match.M.so;UI.match.vis.live.ov.clear();UI.match.vis.live.kick=false;}")
    of = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"); check(tag, not of, 'no overflow')
    print(tag, 'errors', errs[:5])
    if errs: BAD.append('errors')
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p, 1280, 'desk'); await run(p, 390, 'phone')
asyncio.run(main())
print('PASS' if not BAD else 'FAIL ' + str(BAD))
if BAD: sys.exit(1)
