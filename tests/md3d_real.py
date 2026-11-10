# Real 3D render screenshots: serves a local three.min.js (r128) to the page. python3 tests/md3d_real.py OUT_DIR THREE_JS [tag]
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1]); tj = pathlib.Path(sys.argv[2]).read_text(); tag = sys.argv[3] if len(sys.argv) > 3 else 'a'
w = out / 'wrap_3dr.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def shot(pg, path):
    bb = await pg.evaluate("()=>{const r=document.getElementById('p2dwrap').getBoundingClientRect();window.scrollTo(0,0);return {x:r.left,y:r.top+scrollY,width:r.width,height:Math.max(50,r.height)}}")
    await pg.screenshot(path=path, clip=bb, full_page=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'three' in m.text.lower() else None)
            await pg.route('**/three.min.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=tj))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(300)
            await pg.click('[data-v="LIV"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{let g=0;while(!userFixtureOn(G.date)&&g++<60){const r=advance();if(r.type==='match')break;}startLive(userFixtureOn(G.date).id);}"); await pg.wait_for_timeout(300)
            await pg.click('[data-a="mview"][data-v="3d"]'); await pg.wait_for_timeout(1500)
            await pg.wait_for_timeout(6000)
            el = pg.locator('#p2dwrap')
            await shot(pg, str(out / f'r3d_{tag}_tv_{vw}.png'))
            for cam in ['wide', 'behind']:
                await pg.click(f'[data-a="m3cam"][data-v="{cam}"]'); await pg.wait_for_timeout(2500)
                await shot(pg, str(out / f'r3d_{tag}_{cam}_{vw}.png'))
            print(vw, 'ok', await pg.evaluate("()=>UI.match.v3s?UI.match.v3s.figs.size:0"))
            await pg.close()
        print('errors', errs[:6]); await b.close()
asyncio.run(main())
