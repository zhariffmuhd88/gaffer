# Phase 15: half-time/full-time cards, Player of the Match, heatmap and pass network on the pitch (3D), ticker,
# lower-thirds, picture-in-picture replay, the two-question pitch-side interview. Real three.js r128.
# python3 tests/p15_browser.py OUT_DIR
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
    # play a while at top speed to collect heat and passes
    await pg.evaluate("()=>{UI.match.speed=SPEEDS.length-1;UI.match.autoRp=false;if(!UI.match.run)ACT.mrun();}")
    for i in range(60):
        await pg.wait_for_timeout(500)
        if await pg.evaluate("()=>UI.match.M.min>=12"): break
    await pg.evaluate("()=>{if(UI.match.run)ACT.mrun();}")
    tk = await pg.evaluate("()=>{const t=document.querySelector('#p2dwrap .tick15');return t?t.textContent.slice(0,60):''}")
    check(tag, 'POSSESSION' in tk, 'stats ticker ' + tk)
    # half-time card
    await pg.evaluate("()=>{UI.match.run=true;bcShow(UI.match,'ht',0);clearTimeout(UI.bcT);}"); await pg.wait_for_timeout(400)
    h = await pg.evaluate("()=>({on:document.getElementById('bcov').classList.contains('on'),rows:document.querySelectorAll('#bcov .bcRow').length,top:document.querySelectorAll('#bcov .bcTop').length,run:UI.match.run,hold:UI.match.hold,of:document.documentElement.scrollWidth>innerWidth+1})")
    check(tag, h['on'] and h['rows'] == 7 and h['top'] == 3 and not h['run'] and h['hold'] and not h['of'], 'half-time card ' + str(h))
    if shots: await pg.screenshot(path=str(out / f'p15_ht_{tag}.png'))
    await pg.evaluate("()=>document.getElementById('bcov').click()"); await pg.wait_for_timeout(300)
    h2 = await pg.evaluate("()=>({on:document.getElementById('bcov').classList.contains('on'),run:UI.match.run,hold:UI.match.hold})")
    check(tag, not h2['on'] and h2['run'] and not h2['hold'], 'half-time card closes and play resumes ' + str(h2))
    await pg.evaluate("()=>{if(UI.match.run)ACT.mrun();}")
    # full time: two pages, Player of the Match
    await pg.evaluate("()=>{bcShow(UI.match,'ft',0);clearTimeout(UI.bcT);}"); await pg.wait_for_timeout(300)
    await pg.evaluate("()=>{document.getElementById('bcov').click();clearTimeout(UI.bcT);}"); await pg.wait_for_timeout(300)
    f = await pg.evaluate("()=>({potm:!!document.querySelector('#bcov .bcPotm'),shirt:!!document.querySelector('#bcov .bcPotm svg'),name:(document.querySelector('#bcov .bcPn')||{}).textContent||'',of:document.documentElement.scrollWidth>innerWidth+1})")
    check(tag, f['potm'] and f['shirt'] and f['name'] and not f['of'], 'Player of the Match card ' + str(f))
    if shots: await pg.screenshot(path=str(out / f'p15_potm_{tag}.png'))
    await pg.evaluate("()=>document.getElementById('bcov').click()"); await pg.wait_for_timeout(300)
    # heatmap and pass network on the 3D pitch
    await pg.evaluate("()=>bcShow(UI.match,'ht',0)"); await pg.wait_for_timeout(200)
    await pg.evaluate("()=>document.querySelector('#bcov [data-a=\"bcovl\"][data-v=\"heat\"][data-k=\"0\"]').click()"); await pg.wait_for_timeout(900)
    o = await pg.evaluate("()=>{const S3=UI.match.v3s;return {mesh:!!(S3.ovl15&&S3.ovl15.visible),chip:(document.querySelector('.ovx15')||{}).textContent||'',heat:UI.match.th?Array.from(UI.match.th[0]).reduce((a,b)=>a+b,0):0}}")
    check(tag, o['mesh'] and 'Heatmap' in o['chip'] and o['heat'] > 50, 'heatmap on the 3D pitch ' + str(o))
    if shots:
        await pg.evaluate("()=>{UI.match.v3s.dbg={want:{x:0,y:78,z:26},look:{x:0,y:0,z:0}};}"); await pg.wait_for_timeout(500)
        await real3d.canvas_shot(pg, out / f'p15_heat_{tag}.png')
    await pg.evaluate("()=>{const L=UI.match;const s=L.pn&&L.pn[1].size>L.pn[0].size?1:0;L.ovl13={kind:'pass',side:s};L.ovlV=(L.ovlV||0)+1;renderMatch();}"); await pg.wait_for_timeout(700)
    pn = await pg.evaluate("()=>{const L=UI.match,s=L.ovl13.side;return {side:s,links:L.pn?L.pn[s].size:0,nodes:L.pp?[...L.pp.values()].filter(q=>q.s===s).length:0,chip:(document.querySelector('.ovx15')||{}).textContent||''}}")
    check(tag, pn['links'] >= 2 and pn['nodes'] >= 4 and 'Pass' in pn['chip'], 'pass network ' + str(pn))
    if shots: await real3d.canvas_shot(pg, out / f'p15_pass_{tag}.png')
    await pg.evaluate("()=>{UI.match.v3s.dbg=null;}"); await pg.click('.ovx15'); await pg.wait_for_timeout(300)
    gone = await pg.evaluate("()=>!UI.match.ovl13&&!document.querySelector('.ovx15')"); check(tag, gone, 'overlay cleared')
    # lower-third for a booking
    await pg.evaluate("()=>{const M=UI.match.M;const e=onPitch(M,1)[3];M.ev.push({min:M.min,t:'yc',side:1,p:e.p.id});renderMatch();}"); await pg.wait_for_timeout(300)
    lt = await pg.evaluate("()=>({on:document.querySelector('.lt15')&&document.querySelector('.lt15').classList.contains('on'),t:UI.match.ltLast})")
    check(tag, lt['on'] and lt['t'] == 'YELLOW CARD', 'lower-third ' + str(lt))
    if shots: await real3d.canvas_shot(pg, out / f'p15_lower_{tag}.png', '#p2dwrap')
    # picture-in-picture replay
    await pg.evaluate("""()=>{const LM=UI.match,SC=LM.vis.live;LM.replays.push({min:LM.M.min,label:'Test',snap:{pos:new Map([...SC.pos].map(([k,v])=>[k,{...v}])),ball:{...SC.ball},holder:null,poss:0},plan:[{k:'idle',w:4,rpEnd:true}],side:0});startReplay(LM,LM.replays.length-1);}""")
    await pg.wait_for_timeout(1200)
    pip = await pg.evaluate("()=>{const V=UI.match.vis;const el=document.querySelector('.pip15');return {rp:!!(V.rp&&V.rp.pip),rate:V.live.rate,on:!!el&&el.classList.contains('on'),w:el?el.querySelector('canvas').width:0}}")
    check(tag, pip['rp'] and pip['rate'] == 1 and pip['on'] and pip['w'] > 100, 'picture-in-picture replay ' + str(pip))
    if shots: await real3d.canvas_shot(pg, out / f'p15_pip_{tag}.png', '#p2dwrap')
    await pg.evaluate("()=>endReplay(UI.match)")
    # pitch-side interview, two questions
    await pg.evaluate("()=>{const M=UI.match.M;interviewModal(M);render();}"); await pg.wait_for_timeout(300)
    iv = await pg.evaluate("()=>({rep:/Pitch-side reporter/.test(UI.modal||''),n:(UI.modal||'').split('data-a=\"iv1\"').length-1})")
    check(tag, iv['rep'] and iv['n'] == 3, 'interview question 1 ' + str(iv))
    if shots: await pg.screenshot(path=str(out / f'p15_iv_{tag}.png'))
    f0 = await pg.evaluate("()=>G.fans??60")
    await pg.evaluate("()=>ACT.iv1('team')"); await pg.wait_for_timeout(200)
    q2 = await pg.evaluate("()=>(UI.modal||'').split('data-a=\"iv2\"').length-1"); check(tag, q2 == 3, f'interview question 2 ({q2} answers)')
    await pg.evaluate("()=>ACT.iv2('fans')"); f1 = await pg.evaluate("()=>[G.fans,UI.modal]")
    check(tag, f1[0] > f0 and not f1[1], f'interview effect on the fans {f0} -> {f1[0]}')
    print(tag, 'errors', errs[:5])
    if errs: BAD.append('errors')
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p, 1280, 'desk'); await run(p, 390, 'phone')
asyncio.run(main())
print('PASS' if not BAD else 'FAIL ' + str(BAD))
if BAD: sys.exit(1)
