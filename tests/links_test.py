# Clickable names: run from repo root after build.py. Writes screenshots to the folder given as argv[1] (default .)
import asyncio, pathlib, sys, time
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_links.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1280, 'height': 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' else None)
        await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(600)
        await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]')
        # play into the season with quick sims
        for i in range(40):
            await pg.click('#go'); await pg.wait_for_timeout(60)
            if await pg.query_selector('[data-a="quicksim"]'):
                await pg.click('[data-a="quicksim"]'); await pg.click('[data-a="mfinish"]')
                if await pg.query_selector('[data-a="iv"]'): await pg.click('[data-a="iv"] >> nth=-1')
        print('date', await pg.inner_text('.top .date'))
        # inbox links
        await pg.click('nav [data-v="inbox"]')
        n = await pg.eval_on_selector_all('.mbody .lnk', 'e=>e.map(x=>x.dataset.a+":"+x.textContent)')
        print('inbox links', n[:8])
        # fixtures: comp + teams + scorers, open report from score cell, then player, club, back
        await pg.click('nav [data-v="fixtures"]')
        print('fixture links', len(await pg.query_selector_all('main .lnk')))
        await pg.click('tr[data-a="report"] td.c >> nth=0'); await pg.wait_for_timeout(100)
        print('report links', await pg.eval_on_selector_all('.modal .lnk', 'e=>e.slice(0,10).map(x=>x.dataset.a+":"+x.textContent)'))
        await pg.click('.modal .lnk[data-a="player"] >> nth=0'); await pg.wait_for_timeout(100)
        print('player modal:', (await pg.inner_text('.modal .band'))[:60].replace('\n', ' '), '| back btn', bool(await pg.query_selector('[data-a="mback"]')))
        await pg.click('.modal .lnk[data-a="clubview"] >> nth=0'); await pg.wait_for_timeout(100)
        print('club modal:', (await pg.inner_text('.modal .band'))[:60].replace('\n', ' '))
        await pg.screenshot(path=str(out / 'links_club.png'))
        await pg.click('[data-a="mback"]'); await pg.wait_for_timeout(100)
        print('back ->', (await pg.inner_text('.modal .band'))[:60].replace('\n', ' '))
        await pg.click('[data-a="mback"]'); await pg.wait_for_timeout(100)
        print('back ->', (await pg.inner_text('.modal .band'))[:60].replace('\n', ' '))
        await pg.screenshot(path=str(out / 'links_report.png'))
        cl = await pg.query_selector('.modal .lnk[data-a="gocomp"]')
        if cl: await cl.click(); await pg.wait_for_timeout(100); print('comp link ->', await pg.inner_text('main .band'), '| modal open', bool(await pg.query_selector('.modal')))
        # lite club from Europe
        await pg.click('nav [data-v="comps"]'); await pg.click('[data-a="tab"][data-v="UCL"]')
        lites = await pg.query_selector_all('main .lnk[data-a="clubview"]')
        print('UCL club links', len(lites))
        if lites: await lites[-1].click(); await pg.wait_for_timeout(100); print('lite club:', (await pg.inner_text('.modal'))[:140].replace('\n', ' '))
        await pg.keyboard.press('Escape')
        # stats -> club link inside a player row opens the club, not the player
        await pg.click('nav [data-v="stats"]')
        await pg.click('main tr[data-a="player"] .lnk[data-a="clubview"] >> nth=0'); await pg.wait_for_timeout(100)
        print('stats club click ->', (await pg.inner_text('.modal .band'))[:40].replace('\n', ' '))
        await pg.keyboard.press('Escape')
        # timing of a render on a heavy screen
        await pg.click('nav [data-v="transfers"]')
        t = await pg.evaluate('()=>{const a=performance.now(); for(let i=0;i<5;i++) render(); return (performance.now()-a)/5}')
        print('transfers render ms', round(t, 1))
        await pg.click('nav [data-v="fixtures"]')
        t = await pg.evaluate('()=>{const a=performance.now(); for(let i=0;i<5;i++) render(); return (performance.now()-a)/5}')
        print('fixtures render ms', round(t, 1))
        # mobile
        await pg.set_viewport_size({'width': 390, 'height': 844})
        await pg.click('nav [data-v="inbox"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'links_inbox_m.png'))
        print('errors', errs)
        await b.close()
asyncio.run(main())
