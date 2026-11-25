# Phase 16: kits (home/away/third, clash choice, editor saved in the game), trophy lift (podium, medals, lift,
# fireworks, squad photo), sunset into floodlights, fog, wind, puddles, ball boys, mascot, sprinklers.
# Real three.js r128. python3 tests/p16_browser.py OUT_DIR
import asyncio, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from playwright.async_api import async_playwright
import real3d
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True); BAD = []
def check(tag, ok, msg):
    print(tag, 'ok  ' if ok else 'FAIL', msg)
    if not ok: BAD.append(tag + ' ' + msg)
async def run(p, vw, tag):
    errs = []
    b, pg = await real3d.open_match(p, out, vw=vw, errs=errs)
    shots = True
    # kits: the away side picks a kit that does not clash
    k = await pg.evaluate("""()=>{const M=UI.match.M;const A=M.sides[0].tid,B=M.sides[1].tid;const c=T(A).c1;G.kitEd=G.kitEd||{};const keep=G.kitEd[B];G.kitEd[B]={home:{body:c},away:{body:c}};const r=kitFor(M);if(keep)G.kitEd[B]=keep;else delete G.kitEd[B];const s=kitSet(A);return {kind:r[1].kind,dist:colDist(r[0].body,r[1].body),sets:[s.home.body,s.away.body,s.third.body]}}""")
    check(tag, k['kind'] == 'third' and k['dist'] >= 120 and len(set(k['sets'])) == 3, 'third kit when home and away clash ' + str(k))
    # mascot and sprinklers at the walk-out
    await pg.evaluate("()=>{const S3=UI.match.v3s;S3.oc16force={summer:true};S3.oc16=null;S3.flyDone=false;S3.fly=performance.now();S3.flyHeld=false;S3.cord=null;}")
    mseen = False
    for i in range(20):
        await pg.wait_for_timeout(300)
        w = await pg.evaluate("()=>{const O=UI.match.v3s.oc16;return {spr:!!(O&&O.spr&&O.spr.visible),masc:!!(O&&O.masc&&O.masc.visible),bb:O&&O.bb?O.bb.length:0}}")
        mseen = mseen or w['masc']
        if w['spr'] and mseen: break
    check(tag, w['spr'] and w['bb'] >= 4, 'sprinklers and ball boys at the walk-out ' + str(w))
    if shots: await real3d.canvas_shot(pg, out / f'p16_walkout_{tag}.png')
    check(tag, mseen, 'mascot walks out with the captain')
    if shots and tag == 'desk': await real3d.canvas_shot(pg, out / f'p16_mascot_{tag}.png')
    await pg.evaluate("()=>{const S3=UI.match.v3s;S3.flyDone=true;}"); await pg.wait_for_timeout(600)
    # sunset into floodlights, wind
    d = await pg.evaluate("()=>{const LM=UI.match,S3=LM.v3s;S3.oc16force={dusk:true,fog:false,puddles:true};S3.oc16=null;LM.M.min=80;return true}"); await pg.wait_for_timeout(1200)
    d = await pg.evaluate("()=>{const S3=UI.match.v3s,O=S3.oc16;const bg=S3.scene.background;return {dusk:S3.dusk,bg:bg.r+bg.g+bg.b,flags:O.flags.length,pud:O.pud?O.pud.length:0,rot:O.flags.length?Math.abs(O.flags[0].o.rotation.y-O.flags[0].ry):0}}")
    check(tag, d['dusk'] > .8 and d['bg'] < 1.2 and d['flags'] >= 4 and d['pud'] == 7, 'sunset, wind on the flags, puddles ' + str(d))
    if shots:
        await pg.evaluate("()=>{UI.match.v3s.dbg={want:{x:-40,y:22,z:46},look:{x:5,y:4,z:-10}};}"); await pg.wait_for_timeout(500)
        await real3d.canvas_shot(pg, out / f'p16_dusk_{tag}.png'); await pg.evaluate("()=>{UI.match.v3s.dbg=null;}")
    # fog
    await pg.evaluate("()=>{const S3=UI.match.v3s;S3.oc16force={fog:true,dusk:false};S3.oc16=null;}")
    for i in range(20):
        await pg.wait_for_timeout(300)
        if await pg.evaluate("()=>!!UI.match.v3s.oc16"): break
    fg = await pg.evaluate("()=>UI.match.v3s.scene.fog.far"); check(tag, fg <= 120, f'fog limits the view (far {fg})')
    if shots and tag == 'desk': await real3d.canvas_shot(pg, out / f'p16_fog_{tag}.png')
    # trophy lift after a won final
    await pg.evaluate("""()=>{UI.bcAuto=false;const LM=UI.match,M=LM.M;const f=G.fx[M.fid];window._rnd=f.rnd;f.rnd='Final';M.score=[2,1];M.done=true;LM.run=false;}""")
    for i in range(25):
        await pg.wait_for_timeout(300)
        if await pg.evaluate("()=>!!UI.match.trophy&&!!document.querySelector('.tr16.on')"): break
    t = await pg.evaluate("()=>{const L=UI.match;return {tr:L.trophy?L.trophy.kind:null,side:L.trophy?L.trophy.side:null,banner:!!document.querySelector('.tr16.on')}}")
    check(tag, t['tr'] and t['side'] == 0 and t['banner'], 'trophy ceremony starts ' + str(t))
    if shots: await real3d.canvas_shot(pg, out / f'p16_banner_{tag}.png', '#p2dwrap')
    await pg.evaluate("()=>{UI.match.trophy.t0=performance.now()-14500;}"); await pg.wait_for_timeout(1800)
    md = await pg.evaluate("()=>{const S3=UI.match.v3s;let n=0;for(const [e,f] of S3.figs)if(f.medal)n++;return {medals:n,pod:!!S3.oc16.pod,tro:!!S3.oc16.tro}}")
    check(tag, md['medals'] >= 3 and md['pod'] and md['tro'], 'podium and medals ' + str(md))
    if shots: await real3d.canvas_shot(pg, out / f'p16_medals_{tag}.png')
    await pg.evaluate("()=>{UI.match.trophy.t0=performance.now()-21000;}"); await pg.wait_for_timeout(1800)
    lf = await pg.evaluate("()=>{const S3=UI.match.v3s,O=S3.oc16;const c=trophyCapt(S3,UI.match);const f=S3.figs.get(c);return {y:O.tro.position.y,cy:f?f.g.position.y:null,fw:S3.fw16?S3.fw16.length:0,conf:!!S3.conf}}")
    check(tag, lf['y'] > 2.3 and lf['fw'] >= 1 and lf['conf'], 'captain lifts the trophy, fireworks, confetti ' + str(lf))
    if shots: await real3d.canvas_shot(pg, out / f'p16_lift_{tag}.png')
    await pg.evaluate("()=>{UI.match.trophy.t0=performance.now()-31000;}"); await pg.wait_for_timeout(1800)
    if shots: await real3d.canvas_shot(pg, out / f'p16_photo_{tag}.png')
    ph = await pg.evaluate("()=>{ACT.mphoto();return !!UI.match.photo}"); check(tag, ph, 'photo mode on the squad photo')
    await pg.evaluate("()=>{ACT.mphoto();const f=G.fx[UI.match.M.fid];f.rnd=window._rnd;}")
    # kit editor on the Club screen
    await pg.evaluate("()=>{UI.match=null;UI.scr='club';UI.tab.club='ov';render();}"); await pg.wait_for_timeout(500)
    ke = await pg.evaluate("()=>({cards:document.querySelectorAll('#kitEd .kit16c').length,shirts:document.querySelectorAll('#kitEd svg').length})")
    check(tag, ke['cards'] == 3 and ke['shirts'] == 3, 'kit editor ' + str(ke))
    await pg.evaluate("()=>{const el=document.querySelector('#kitEd [data-kit=\"third\"][data-f=\"body\"]');el.value='#7a2bd6';el.dispatchEvent(new Event('change',{bubbles:true}));const s=document.querySelector('#kitEd [data-kit=\"third\"][data-f=\"pat\"]');s.value='hoops';s.dispatchEvent(new Event('change',{bubbles:true}));}"); await pg.wait_for_timeout(400)
    sv = await pg.evaluate("()=>{const e=G.kitEd[G.user].third;return {e,set:kitSet(G.user).third}}")
    check(tag, sv['e']['body'] == '#7a2bd6' and sv['e']['pat'] == 'hoops' and sv['set']['pat'] == 'hoops', 'third kit edited and stored ' + str(sv['e']))
    of = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"); check(tag, not of, 'no overflow on the Club screen')
    if shots:
        await pg.evaluate("()=>document.getElementById('kitEd').scrollIntoView()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=str(out / f'p16_kits_{tag}.png'))
    print(tag, 'errors', errs[:5])
    if errs: BAD.append('errors')
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p, 1280, 'desk'); await run(p, 390, 'phone')
asyncio.run(main())
print('PASS' if not BAD else 'FAIL ' + str(BAD))
if BAD: sys.exit(1)
