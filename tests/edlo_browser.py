# Browser check: League One / Eredivisie on the start screen, league tables, KNVB Cup, Netherlands job. python3 tests/edlo_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_edlo.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
            await pg.click('[data-a="startdiv"][data-v="LO"]'); await pg.wait_for_timeout(200)
            print(vw, 'LO clubs on start screen', await pg.locator('.clubpick').count())
            await pg.screenshot(path=str(out / f'edlo_start_lo_{vw}.png'), full_page=False)
            await pg.click('[data-a="startdiv"][data-v="ED"]'); await pg.wait_for_timeout(200)
            print(vw, 'ED clubs on start screen', await pg.locator('.clubpick').count())
            await pg.click('[data-v="PSV"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(400)
            print(vw, 'user', await pg.evaluate("()=>G.user+' '+divOf(G.user)+' linked nation '+PLAY_NAT"))
            await pg.evaluate("()=>{UI.modal=null;UI.scr='table';UI.tab.tb='xED';render()}"); await pg.wait_for_timeout(200)
            await pg.screenshot(path=str(out / f'edlo_table_ed_{vw}.png'), full_page=False)
            await pg.evaluate("()=>{UI.scr='table';UI.tab.tb='xLO';render()}"); await pg.wait_for_timeout(200)
            print(vw, 'LO table rows', await pg.locator('main table tbody tr').count(), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.screenshot(path=str(out / f'edlo_table_lo_{vw}.png'), full_page=True)
            await pg.evaluate("()=>{UI.scr='comps';UI.tab.cp='KNVB';render()}"); await pg.wait_for_timeout(200)
            print(vw, 'KNVB screen', (await pg.inner_text('main .band'))[:60].replace('\n', ' '))
            await pg.evaluate("()=>{UI.scr='intl';UI.tab.it='job';render()}"); await pg.wait_for_timeout(200)
            print(vw, 'NED job box', await pg.locator('text=The Netherlands job').count())
            await pg.screenshot(path=str(out / f'edlo_intl_{vw}.png'), full_page=False)
            await pg.close()
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
