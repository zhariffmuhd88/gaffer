# Real 3D render of events: night + rain, a goal celebration (orbit camera), a replay and the overlay label.
# python3 tests/md3d_events.py OUT_DIR THREE_JS
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1]); tj = pathlib.Path(sys.argv[2]).read_text()
w = out / 'wrap_3de.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def shot(pg, path):
    bb = await pg.evaluate("()=>{const r=document.getElementById('p2dwrap').getBoundingClientRect();window.scrollTo(0,0);return {x:r.left,y:r.top+scrollY,width:r.width,height:Math.max(50,r.height)}}")
    await pg.screenshot(path=path, clip=bb, full_page=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']); errs = []
        pg = await b.new_page(viewport={'width': 1280, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/three.min.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=tj))
        await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
        await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(300)
        await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{let g=0;while(!userFixtureOn(G.date)&&g++<60){const r=advance();if(r.type==='match')break;}startLive(userFixtureOn(G.date).id);const V=UI.match.vis;V.meta.night=true;V.meta.wx='rain';}"); await pg.wait_for_timeout(300)
        await pg.click('[data-a="mview"][data-v="3d"]'); await pg.wait_for_timeout(1200)
        await pg.wait_for_timeout(4000)
        await shot(pg, str(out / 'r3d_night_rain.png'))
        # wait for a goal celebration (fast speed)
        await pg.evaluate("()=>{UI.match.speed=SPEEDS.length-1;}")
        got = False
        for i in range(240):
            st = await pg.evaluate("()=>{const SC=UI.match.vis.live;const cs=SC.plan[SC.si];return cs?cs.k:''}")
            if st == 'celebrate':
                await pg.wait_for_timeout(900); await shot(pg, str(out / 'r3d_celebrate.png')); got = True
                print('label:', await pg.evaluate("()=>{const o=document.querySelector('#p2dwrap .o3d');return o?o.textContent:''}")); break
            await pg.wait_for_timeout(500)
        print('celebration captured', got)
        if got:
            for i in range(40):
                if await pg.evaluate("()=>!!UI.match.vis.rp"): await pg.wait_for_timeout(1200); await shot(pg, str(out / 'r3d_replay.png')); print('replay captured; label', await pg.evaluate("()=>document.querySelector('#p2dwrap .o3d').textContent")); break
                await pg.wait_for_timeout(400)
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
