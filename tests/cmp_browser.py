# Browser check: player comparison from the profile and the search box, desktop and 390px. python3 tests/cmp_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_cmp.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
            await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{let g=0;while(G.date<sd('2026-10-20')&&g++<3000){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}}UI.modal=null;UI.scr='squad';render()}")
            print(vw, 'squad compare button', await pg.locator('[data-a="cmpgo"]').count())
            pid = await pg.evaluate("()=>Object.values(G.players).find(p=>p.n==='Bukayo Saka').id")
            await pg.evaluate(f"()=>playerModal('{pid}')"); await pg.wait_for_timeout(150)
            await pg.click('.modal [data-a="cmpadd"]'); await pg.wait_for_timeout(200)
            await pg.fill('#cmpq', 'yamal'); await pg.wait_for_timeout(150)
            await pg.click('#cmpres [data-a="cmpadd"] >> nth=0'); await pg.wait_for_timeout(200)
            await pg.fill('#cmpq', 'kvarat'); await pg.wait_for_timeout(150)
            hits = await pg.locator('#cmpres [data-a="cmpadd"]').count()
            if hits: await pg.click('#cmpres [data-a="cmpadd"] >> nth=0')
            else:
                await pg.fill('#cmpq', 'mbapp'); await pg.wait_for_timeout(150); await pg.click('#cmpres [data-a="cmpadd"] >> nth=0')
            await pg.wait_for_timeout(250)
            print(vw, 'comparing', await pg.evaluate("()=>UI.cmp.map(id=>P(id).n).join(' v ')"), '| polygons', await pg.locator('.cmpradar polygon').count(), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.screenshot(path=str(out / f'cmp_{vw}.png'), full_page=False)
            el = await pg.query_selector('.cmpradar'); await el.scroll_into_view_if_needed(); await pg.screenshot(path=str(out / f'cmp_radar_{vw}.png'))
            await pg.close()
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
