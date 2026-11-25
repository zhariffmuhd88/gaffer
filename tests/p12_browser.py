# Phase 12: photo mode (filters, camera, save PNG), highlight clip from a goal replay (MediaRecorder), automatic quality.
# Real three.js r128 + SwiftShader. python3 tests/p12_browser.py OUT_DIR
import asyncio, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from playwright.async_api import async_playwright
import real3d
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True); BAD = []
def check(tag, ok, msg):
    print(tag, 'ok  ' if ok else 'FAIL', msg)
    if not ok: BAD.append(msg)
async def run(p, vw, tag):
    errs = []
    b, pg = await real3d.open_match(p, out, vw=vw, errs=errs)
    lab = await pg.evaluate("()=>document.querySelector('[data-a=\"m3q\"]').textContent")
    check(tag, lab.startswith('Quality: Auto'), 'quality button ' + lab)
    # photo mode
    await pg.click('[data-a="mphoto"]'); await pg.wait_for_timeout(500)
    st = await pg.evaluate("()=>{const LM=UI.match;return {run:LM.run,hold:LM.hold,panel:!!document.querySelector('.phpanel'),hidden:getComputedStyle(document.querySelector('#p2dwrap .sb3d')||document.body).display,free:!!LM.v3s.free,yaw:LM.v3s.free&&LM.v3s.free.yaw}}")
    check(tag, not st['run'] and st['hold'] and st['panel'] and st['free'], 'photo mode on ' + str(st))
    y0 = st['yaw']; await pg.click('[data-a="mphc"][data-v="r"]'); await pg.click('[data-a="mphc"][data-v="u"]'); await pg.click('[data-a="mphc"][data-v="in"]'); await pg.wait_for_timeout(700)
    y1 = await pg.evaluate("()=>UI.match.v3s.free.yaw"); check(tag, abs(y1 - y0) > .2, 'orbit moved the camera')
    for f in ['bc', 'film', 'bw', 'vin']:
        await pg.click(f'[data-a="mphf"][data-v="{f}"]'); await pg.wait_for_timeout(250)
        if tag == 'desk': await real3d.canvas_shot(pg, out / f'p12_photo_{f}.png')
    async with pg.expect_download() as dl:
        await pg.click('[data-a="mphsave"]')
    d = await dl.value; path = out / f'p12_saved_{tag}.png'; await d.save_as(str(path))
    check(tag, path.stat().st_size > 20000 and d.suggested_filename.endswith('.png'), f'saved photo {d.suggested_filename} {path.stat().st_size} bytes')
    of = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"); check(tag, not of, 'no overflow in photo mode')
    await pg.click('.phpanel [data-a="mphoto"]'); await pg.wait_for_timeout(400)
    st = await pg.evaluate("()=>({photo:!!UI.match.photo,panel:!!document.querySelector('.phpanel'),hold:UI.match.hold})")
    check(tag, not st['photo'] and not st['panel'], 'photo mode off ' + str(st))
    # clip: play on fast until a goal replay exists
    if tag == 'desk':
        await pg.evaluate("()=>{UI.match.autoRp=false;UI.match.speed=SPEEDS.length-1;if(!UI.match.run)ACT.mrun();}")
        for i in range(240):
            if await pg.evaluate("()=>UI.match.replays.length>0||UI.match.M.done"): break
            await pg.wait_for_timeout(500)
        n = await pg.evaluate("()=>UI.match.replays.length")
        if n:
            await pg.evaluate("()=>{if(UI.match.run)ACT.mrun();}")
            await pg.evaluate("()=>{UI.match.ptab='rp';renderMatch();}"); await pg.wait_for_timeout(300)
            async with pg.expect_download(timeout=40000) as dl:
                await pg.click('[data-a="mclip"]')
            d = await dl.value; path = out / ('p12_clip.' + d.suggested_filename.split('.')[-1]); await d.save_as(str(path))
            check(tag, path.stat().st_size > 10000, f'clip {d.suggested_filename} {path.stat().st_size} bytes')
        else: print(tag, 'no goal in this match: clip skipped')
    # automatic quality: feed slow frames
    await pg.evaluate("()=>{UI.v3q=undefined;const S3=UI.match.v3s;S3.aq=null;S3.aqDone=false;S3.aqN=0;S3.aqS=0;S3.aqC=0;S3.aqT=0;let t=1000;for(let i=0;i<500;i++){t+=60;aqFrame(S3,t);}}")
    q = await pg.evaluate("()=>{const S3=UI.match.v3s;return {aq:S3.aq,fans:S3.fans?S3.fans.mB.visible:null,rigOff:!!S3.rigOff||!S3.rig,shadow:S3.sun?S3.sun.castShadow:null,label:document.querySelector('[data-a=\"m3q\"]').textContent}}")
    check(tag, q['aq'] == 0 and q['fans'] in (False, None) and q['rigOff'] and 'Low' in q['label'], 'auto quality stepped down ' + str(q))
    await pg.click('[data-a="m3q"]'); await pg.wait_for_timeout(1500)
    lab = await pg.evaluate("()=>document.querySelector('[data-a=\"m3q\"]').textContent"); check(tag, lab == 'Quality: Low', 'manual Low ' + lab)
    await pg.click('[data-a="m3q"]'); await pg.wait_for_timeout(1500); await pg.click('[data-a="m3q"]'); await pg.wait_for_timeout(1500)
    lab = await pg.evaluate("()=>document.querySelector('[data-a=\"m3q\"]').textContent"); check(tag, lab.startswith('Quality: Auto'), 'back to Auto ' + lab)
    print(tag, 'errors', errs[:5]); 
    if errs: BAD.append('errors')
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p, 1280, 'desk'); await run(p, 390, 'phone')
asyncio.run(main())
print('PASS' if not BAD else 'FAIL ' + str(BAD))
if BAD: sys.exit(1)
