# Browser check for reserves and academy. Run from the repo root after build.py: python3 tests/youth_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_youth.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1280, 'height': 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(600)
        await pg.click('[data-v="CHE"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(200)
        for i in range(40):
            await pg.click('#go'); await pg.wait_for_timeout(40)
            if await pg.query_selector('[data-a="quicksim"]'):
                await pg.click('[data-a="quicksim"]'); await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(100)
                if await pg.query_selector('[data-a="iv"]'): await pg.click('[data-a="iv"] >> nth=-1')
            if 'Dec' in await pg.inner_text('.top .date'): break
        print('date', await pg.inner_text('.top .date'))
        await pg.click('nav [data-v="squad"]'); await pg.click('[data-a="tab"][data-k="sq"][data-v="r"]'); await pg.wait_for_timeout(100)
        print('reserves band:', (await pg.inner_text('main .band')).replace('\n', ' '))
        await pg.screenshot(path=str(out / 'y_reserves.png'), full_page=True)
        await pg.click('main tr[data-a="player"] >> nth=0'); await pg.wait_for_timeout(100)
        print('modal level box:', (await pg.inner_text('.modal')).count('Squad level'), '| promote btn', bool(await pg.query_selector('.modal [data-a="ylvl"][data-k="f"]')))
        await pg.screenshot(path=str(out / 'y_player.png'))
        await pg.click('.modal [data-a="ylvl"][data-k="f"]'); await pg.wait_for_timeout(150)
        print('after promote:', (await pg.inner_text('.modal')).split('Squad level')[1][:40].replace('\n', ' '))
        await pg.keyboard.press('Escape')
        await pg.click('[data-a="tab"][data-k="sq"][data-v="a"]'); await pg.wait_for_timeout(80)
        print('academy band:', (await pg.inner_text('main .band')).replace('\n', ' '))
        await pg.click('nav [data-v="tactics"]'); await pg.click('[data-a="tbench"] >> nth=0'); await pg.wait_for_timeout(100)
        print('bench youth list:', 'Reserves & academy' in await pg.inner_text('main'))
        rows = await pg.query_selector_all('main h2.sect + .tw tr[data-a="tpick"]')
        await pg.click('text=Reserves & academy'); 
        last = pg.locator('main tr[data-a="tpick"]').last
        await last.click(); await pg.wait_for_timeout(100)
        print('bench now has youth:', await pg.evaluate("()=>userTeam().tac.bench.some(id=>P(id).sq)"))
        await pg.click('nav [data-v="table"]'); await pg.click('[data-a="tab"][data-v="y"]'); await pg.wait_for_timeout(100)
        print('youth tables:', (await pg.inner_text('main .tabs >> nth=1')).replace('\n', ' | '))
        await pg.screenshot(path=str(out / 'y_tables.png'))
        await pg.click('main tr[data-a="player"] >> nth=0'); await pg.wait_for_timeout(100); await pg.keyboard.press('Escape')
        await pg.click('nav [data-v="staff"]'); print('staff hoyd:', 'Head of Youth Development' in await pg.inner_text('main'))
        await pg.click('nav [data-v="league"]' if await pg.query_selector('nav [data-v="league"]') else 'nav [data-v="table"]')
        await pg.click('nav [data-v="table"]'); await pg.click('[data-a="tab"][data-v="pl"]'); await pg.click('main .lnk[data-a="clubview"] >> nth=2'); await pg.wait_for_timeout(100)
        print('club modal youth:', (await pg.inner_text('.modal')).count('Reserves'), (await pg.inner_text('.modal')).count('Academy'))
        await pg.keyboard.press('Escape')
        await pg.set_viewport_size({'width': 390, 'height': 844})
        await pg.click('nav [data-v="squad"]'); await pg.click('[data-a="tab"][data-k="sq"][data-v="r"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'y_reserves_m.png'))
        print('errors', errs)
        await b.close()
asyncio.run(main())
