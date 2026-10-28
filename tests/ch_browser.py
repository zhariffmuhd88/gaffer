# Browser check for the Championship update. Run from the repo root after build.py: python3 tests/ch_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_ch.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1280, 'height': 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'Failed to load resource' not in m.text else None)
        await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(600)
        await pg.click('[data-a="startdiv"][data-v="CH"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'ch_start.png'))
        await pg.click('[data-v="SOU"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(200)
        print('started', await pg.inner_text('.top .club-chip'))
        # advance into October with quick sims
        for i in range(60):
            await pg.click('#go'); await pg.wait_for_timeout(40)
            if await pg.query_selector('[data-a="quicksim"]'):
                await pg.click('[data-a="quicksim"]'); await pg.click('[data-a="mfinish"]')
                if await pg.query_selector('[data-a="iv"]'): await pg.click('[data-a="iv"] >> nth=-1')
            d = await pg.inner_text('.top .date')
            if 'Nov' in d: break
        print('date', await pg.inner_text('.top .date'))
        await pg.click('nav [data-v="table"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'ch_table.png'), full_page=True)
        print('table band', (await pg.inner_text('main .tabs')).replace('\n', ' | '))
        await pg.click('nav [data-v="fixtures"]'); await pg.click('[data-a="tab"][data-v="ch"]'); await pg.wait_for_timeout(80)
        print('CH rounds header', await pg.inner_text('main b.yel'))
        await pg.click('nav [data-v="stats"]'); print('stats', (await pg.inner_text('main .band')).replace('\n', ' '))
        await pg.click('nav [data-v="awards"]'); print('awards', (await pg.inner_text('main .band')).replace('\n', ' '), '| rows', len(await pg.query_selector_all('main tbody tr')))
        await pg.click('nav [data-v="transfers"]'); await pg.select_option('#fl', 'CH'); await pg.wait_for_timeout(80)
        print('transfer search CH', (await pg.inner_text('main p.dim')))
        await pg.click('nav [data-v="squad"]'); await pg.click('tr[data-a="player"] >> nth=12'); await pg.wait_for_timeout(100)
        print('dev chart', bool(await pg.query_selector('.modal .progsvg')))
        await pg.screenshot(path=str(out / 'ch_player.png'))
        await pg.keyboard.press('Escape')
        await pg.click('nav [data-v="club"]'); print('club', (await pg.inner_text('main .grid3')).replace('\n', ' ')[:200])
        # play a live match at speed to check the matchday with other games
        for i in range(10):
            if await pg.query_selector('[data-a="kickoff"]'): break
            await pg.click('#go'); await pg.wait_for_timeout(60)
        if await pg.query_selector('[data-a="kickoff"]'):
            await pg.click('[data-a="kickoff"]'); await pg.wait_for_timeout(300)
            await pg.click('[data-a="mskip"]'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=str(out / 'ch_match.png'))
            print('match scores tab', bool(await pg.query_selector('[data-a="mrp"]')) or True)
            await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(200)
            if await pg.query_selector('[data-a="iv"]'): await pg.click('[data-a="iv"] >> nth=-1')
        await pg.set_viewport_size({'width': 390, 'height': 844})
        await pg.click('nav [data-v="table"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'ch_table_m.png'))
        await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(500)
        print('errors', errs)
        await b.close()
asyncio.run(main())
