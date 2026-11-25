# Phase 13: sound controls, commentary captions, PA, crowd moments, olé, VAR (engine NO GOAL and GOAL STANDS),
# goal-line technology, referee cards and the sent-off walk, pitch-side monitor. Real three.js r128.
# python3 tests/p13_browser.py OUT_DIR
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
    await pg.mouse.click(5, 5)
    ui = await pg.evaluate("()=>({vol:!!document.getElementById('sndVol'),cmt:!!document.querySelector('[data-a=\"mcmt\"]'),ctx:!!SND.ctx})")
    check(tag, ui['vol'] and ui['cmt'], 'volume slider and commentary button ' + str(ui))
    await pg.evaluate("()=>{const el=document.getElementById('sndVol');el.value=40;el.dispatchEvent(new Event('input',{bubbles:true}));}")
    v = await pg.evaluate("()=>[SND.vol,localStorage.getItem('gaffer.vol')]"); check(tag, abs(v[0] - .4) < 1e-6 and v[1] == '0.4', 'volume stored ' + str(v))
    await pg.evaluate("()=>{if(!UI.match.run)ACT.mrun();UI.match.cmNext=1;}"); await pg.wait_for_timeout(6000)
    st = await pg.evaluate("()=>({cmt:UI.match.cmtN||0,last:UI.match.cmtLast||'',pa:UI.match.pa?UI.match.pa.txt:'',crowd:UI.match.crowdN||0})")
    check(tag, st['cmt'] > 0 and st['pa'].startswith('Good') and st['crowd'] >= 1, 'commentary, PA and crowd ' + str(st))
    await pg.evaluate("()=>{if(UI.match.run)ACT.mrun();}")
    # olé after a passing spell
    ole = await pg.evaluate("()=>{const LM=UI.match,SC=LM.vis.live;SC.poss=0;SC.olN=0;SC.olS=0;const ps=onPitch(LM.M,0);for(let i=0;i<6;i++)enterStep(LM,SC,{k:'pass',e:ps[i+1],to:ps[i+2],ts:SC.t,te:SC.t+400});return LM.oleN||0}")
    check(tag, ole >= 1, f'olé after a passing spell ({ole})')
    # engine-disallowed goal: full VAR sequence
    await pg.evaluate("()=>{const LM=UI.match,SC=LM.vis.live;SC.lastShooter=onPitch(LM.M,0).find(e=>e.role==='FC');enterStep(LM,SC,{k:'var',ts:SC.t,te:SC.t+3000});}"); await pg.wait_for_timeout(300)
    a = await pg.evaluate("()=>({on:document.querySelector('.var13').classList.contains('on'),txt:document.querySelector('.var13').textContent,svg:!!document.querySelector('.var13 svg'),ear:!!(UI.match.ref13&&UI.match.ref13.ear)})")
    check(tag, a['on'] and 'Checking goal' in a['txt'] and a['svg'] and a['ear'], 'VAR check with offside picture ' + str(a)[:120])
    if tag == 'desk': await real3d.canvas_shot(pg, out / 'p13_var_check.png', '#p2dwrap')
    await pg.wait_for_timeout(2200)
    a = await pg.evaluate("()=>(UI.match.varLog||[]).join(',')")
    check(tag, 'done:goal:NO GOAL' in a, 'VAR decision ' + a[:80])
    if tag == 'desk': await real3d.canvas_shot(pg, out / 'p13_var_nogoal.png', '#p2dwrap')
    await pg.wait_for_timeout(2300)
    # goal-line technology
    await pg.evaluate("()=>glt(UI.match,true)"); g = await pg.evaluate("()=>document.querySelector('.glt13').classList.contains('on')"); check(tag, g, 'goal-line technology graphic')
    if tag == 'desk': await real3d.canvas_shot(pg, out / 'p13_glt.png', '#p2dwrap')
    # red card: card in the referee's hand, the player walks off
    await pg.evaluate("()=>{const LM=UI.match,SC=LM.vis.live;const e=onPitch(LM.M,1).find(x=>x.role==='MC'||x.role==='DM');SC.lastFoul=e;LM.varBusy=false;enterStep(LM,SC,{k:'whistle',card:'r',txt:'Red card',ts:SC.t,te:SC.t+1300});}")
    await pg.wait_for_timeout(900)
    rc = await pg.evaluate("()=>{const LM=UI.match,SC=LM.vis.live,S3=LM.v3s;const e=SC.sentOff;const o=e&&SC.ov.get(e);return {card:S3.c13?S3.c13.r.visible:false,walk:!!o&&(o.y<0||o.y>1),cmt:LM.cmtLast}}")
    check(tag, rc['card'] and rc['walk'] and ('Red card' in rc['cmt'] or 'red' in rc['cmt'] or 'go' in rc['cmt']), 'red card raised, player walks off ' + str(rc))
    if tag == 'desk':
        await pg.evaluate("()=>{const S3=UI.match.v3s;const r=S3.refs[0].g.position;S3.dbg={want:{x:r.x+5,y:3.2,z:r.z+6},look:{x:r.x,y:1.6,z:r.z}};}"); await pg.wait_for_timeout(500)
        await real3d.canvas_shot(pg, out / 'p13_card.png')
        await pg.evaluate("()=>{UI.match.v3s.dbg=null;}")
    of = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"); check(tag, not of, 'no overflow')
    # commentary off
    await pg.click('[data-a="mcmt"]'); c = await pg.evaluate("()=>UI.cmt===false&&localStorage.getItem('gaffer.cmt')==='0'"); check(tag, c, 'commentary switched off')
    await pg.click('[data-a="mcmt"]')
    print(tag, 'errors', errs[:5])
    if errs: BAD.append('errors')
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p, 1280, 'desk'); await run(p, 390, 'phone')
asyncio.run(main())
print('PASS' if not BAD else 'FAIL ' + str(BAD))
if BAD: sys.exit(1)
