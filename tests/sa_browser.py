# Browser check: Serie A start, Italian club screens, tables, cups, Italy national team. Run after build.py:
# python3 tests/sa_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_sa.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + html + '</body></html>')
URL = 'file://' + str(w.resolve())

async def adv(pg, until, n=80):
    for i in range(n):
        if await pg.query_selector('.intro'):
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(400)
        if await pg.query_selector('.modal [data-a="ipress"]'):
            await pg.click('.modal [data-a="ipress"] >> nth=1')
        await pg.click('#go'); await pg.wait_for_timeout(40)
        if await pg.query_selector('[data-a="quicksim"]'):
            await pg.click('[data-a="quicksim"]'); await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(100)
            if await pg.query_selector('[data-a="iv"]'):
                await pg.click('[data-a="iv"] >> nth=-1')
        if await pg.query_selector('.modal [data-a="close"]'):
            await pg.click('.modal [data-a="close"]')
        if await pg.evaluate(until):
            return True
    return False

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        pg = await b.new_page(viewport={'width': 1280, 'height': 900})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        await pg.goto(URL); await pg.wait_for_timeout(400); await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
        await pg.click('[data-a="startdiv"][data-v="SA"]'); await pg.wait_for_timeout(100)
        print('Serie A clubs on start screen:', await pg.locator('.clubpick').count())
        await pg.click('[data-v="FIO"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'sa_start.png'))
        await pg.click('[data-a="start"]'); await pg.wait_for_timeout(400)
        print('user:', await pg.evaluate("()=>G.user+' '+divOf(G.user)+' '+PLAY_NAT"), '| target', await pg.evaluate("()=>boardTarget().txt"))
        await pg.click('nav [data-v="table"]'); await pg.wait_for_timeout(100)
        print('table tab active:', await pg.evaluate("()=>UI.tab.tb"), '| rows', await pg.locator('main table.t tbody tr').count())
        await pg.click('nav [data-v="club"]'); await pg.wait_for_timeout(150)
        await pg.screenshot(path=str(out / 'sa_club.png'), full_page=True)
        if await pg.query_selector('[data-a="tab"][data-k="club"][data-v="stad"]'):
            await pg.click('[data-a="tab"][data-k="club"][data-v="stad"]'); await pg.wait_for_timeout(150)
            print('stands:', await pg.evaluate("()=>[...document.querySelectorAll('main table.t tbody tr td:first-child')].slice(0,4).map(x=>x.textContent).join(' | ')"))
            await pg.screenshot(path=str(out / 'sa_stadium.png'), full_page=True)
        ok = await adv(pg, "()=>Object.values(G.fx).filter(f=>f.comp==='SA'&&f.r&&(f.h===G.user||f.a===G.user)).length>=2", 60)
        print('SA games played by user:', ok, await pg.evaluate("()=>Object.values(G.fx).filter(f=>f.comp==='SA'&&f.r&&(f.h===G.user||f.a===G.user)).map(f=>tName(f.h)+' '+f.r.join('-')+' '+tName(f.a)).join(' | ')"))
        await pg.click('nav [data-v="table"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'sa_table.png'), full_page=True)
        await pg.click('[data-a="tab"][data-k="tb"][data-v="sb"]'); await pg.wait_for_timeout(100)
        print('Serie B rows:', await pg.locator('main table.t tbody tr').count())
        await pg.click('nav [data-v="comps"]'); await pg.wait_for_timeout(100)
        print('comps tab:', await pg.evaluate("()=>UI.tab.cp"), '| has Supercoppa button', await pg.locator('[data-a="tab"][data-k="cp"][data-v="SCI"]').count())
        await pg.click('[data-a="tab"][data-k="cp"][data-v="UCL"]'); await pg.wait_for_timeout(100)
        await pg.click('[data-a="tab"][data-k="cp"][data-v="CIT"]'); await pg.wait_for_timeout(100)
        print('Coppa rounds shown:', await pg.locator('main h2.sect').count())
        await pg.screenshot(path=str(out / 'sa_cit.png'), full_page=True)
        await pg.click('[data-a="tab"][data-k="cp"][data-v="SCI"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'sa_sce.png'))
        await pg.click('nav [data-v="history"]'); await pg.click('[data-a="tab"][data-k="hist"][data-v="SA"]'); await pg.wait_for_timeout(100)
        print('SA history rows:', await pg.locator('main table.t tbody tr').count(), '| top chip', (await pg.inner_text('main .chipx >> nth=0')).replace('\n', ' '))
        await pg.click('[data-a="tab"][data-k="hist"][data-v="rank"]'); await pg.click('[data-a="tab"][data-k="rk"][data-v="ita"]'); await pg.wait_for_timeout(100)
        print('Italian rankings rows:', await pg.locator('main table.t tbody tr').count())
        await pg.click('nav [data-v="intl"]'); await pg.wait_for_timeout(120)
        print('intl band:', (await pg.inner_text('main .band')).split('\n')[0:2], '| job boxes', await pg.locator('[data-a="intltake"]').count())
        await pg.screenshot(path=str(out / 'sa_intl.png'), full_page=True)
        await pg.click('nav [data-v="squad"]'); await pg.wait_for_timeout(100)
        await pg.click('main [data-a="player"] >> nth=0'); await pg.wait_for_timeout(150)
        print('player modal:', (await pg.inner_text('.modal .band')).split('\n')[0])
        await pg.keyboard.press('Escape')
        await pg.set_viewport_size({'width': 390, 'height': 844})
        for scr in ['table', 'comps', 'club', 'history']:
            await pg.click(f'nav [data-v="{scr}"]'); await pg.wait_for_timeout(100)
            print('390', scr, 'overflow:', await pg.evaluate("()=>document.documentElement.scrollWidth>window.innerWidth+1"))
        await pg.click('nav [data-v="table"]'); await pg.screenshot(path=str(out / 'sa_table_m.png'))
        # Italy national team only
        ctx = await b.new_context(viewport={'width': 1280, 'height': 900}); pg2 = await ctx.new_page()
        pg2.on('pageerror', lambda e: errs.append('nat:' + str(e)))
        await pg2.goto(URL); await pg2.wait_for_timeout(400)
        if await pg2.query_selector('.intro'):
            await pg2.click('.intro .ic-skip'); await pg2.wait_for_timeout(500)
        await pg2.click('[data-a="cmode"][data-v="nat"]'); await pg2.click('[data-a="cnat"][data-v="ITA"]'); await pg2.wait_for_timeout(100)
        await pg2.screenshot(path=str(out / 'sa_nat_start.png'))
        await pg2.click('[data-a="start"]'); await pg2.wait_for_timeout(300)
        print('Italy job:', await pg2.evaluate("()=>G.user+' '+G.intl.job+' '+PLAY_NAT+' '+G.intl.mode"), '| band', (await pg2.inner_text('main .band')).split('\n')[0:2])
        await pg2.click('[data-a="tab"][data-k="int"][data-v="sq"]'); await pg2.click('[data-a="isauto"]'); await pg2.click('[data-a="isok"]'); await pg2.wait_for_timeout(200)
        if await pg2.query_selector('.modal [data-a="ipress"]'):
            await pg2.click('.modal [data-a="ipress"] >> nth=1')
        ok = await adv(pg2, "()=>engFixtures().filter(f=>f.r).length>=1", 60)
        print('Italy games:', ok, await pg2.evaluate("()=>engFixtures().filter(f=>f.r).map(f=>tName(f.h)+' '+f.r.join('-')+' '+tName(f.a)).join(' | ')"))
        await pg2.click('nav [data-v="intl"]'); await pg2.click('[data-a="tab"][data-k="int"][data-v="rec"]'); await pg2.wait_for_timeout(100)
        print('records top:', (await pg2.inner_text('main table.t tbody tr >> nth=0')).replace('\t', ' '))
        await pg2.screenshot(path=str(out / 'sa_nat_rec.png'))
        print('errors', errs[:8])
        await b.close()
asyncio.run(main())
