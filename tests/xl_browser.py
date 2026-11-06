# Browser check: start in the Bundesliga / Ligue 1 / Saudi Pro League, tables, desktop and 390px. python3 tests/xl_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_xl.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw, lg, club in [(1280, 'BL', 'BVB'), (390, 'L1', 'OM'), (390, 'SPL', 'NAS')]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
            await pg.click(f'[data-a="startdiv"][data-v="{lg}"]'); await pg.wait_for_timeout(150)
            print(vw, lg, 'clubs on start', await pg.locator('[data-a="pick"]').count(), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            if vw == 1280: await pg.screenshot(path=str(out / 'xl_start.png'))
            await pg.click(f'[data-v="{club}"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{let g=0;while(G.date<sd('2026-10-20')&&g++<3000){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}}UI.modal=null;UI.scr='table';UI.tab.tb=null;render()}")
            print(vw, lg, 'user', await pg.evaluate("()=>G.user+' '+divOf(G.user)"), '| table rows', await pg.locator('main table tbody tr').count(), '| band', (await pg.inner_text('main .band')).split('\n')[0], '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.screenshot(path=str(out / f'xl_table_{lg}.png'))
            for s in ['squad', 'home', 'fixtures', 'comps', 'staff', 'reports', 'club']:
                await pg.evaluate(f"()=>{{UI.scr='{s}';render()}}"); await pg.wait_for_timeout(80)
            await pg.close()
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
