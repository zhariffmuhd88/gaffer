# Browser check: career modes, International screen, squad selection, England matches, dual role.
# Run from the repo root after build.py: python3 tests/intl_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_intl.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + html + '</body></html>')
URL = 'file://' + str(w.resolve())

async def adv(pg, until, n=80):
    for i in range(n):
        if await pg.query_selector('.intro'):
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
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
        await pg.click('[data-a="cmode"][data-v="nat"]'); await pg.wait_for_timeout(100)
        print('start button enabled for England only:', await pg.is_enabled('[data-a="start"]'))
        await pg.screenshot(path=str(out / 'i_start.png'))
        await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
        print('user team:', await pg.evaluate("()=>G.user+' '+G.intl.mode+' '+G.intl.job"), '| screen', await pg.evaluate("()=>UI.scr"))
        hidden = await pg.evaluate("()=>['transfers','finance','club'].map(k=>{const b=document.querySelector(`nav [data-v=\"${k}\"]`);return b?b.hidden:'none'})")
        print('club nav hidden:', hidden)
        await pg.screenshot(path=str(out / 'i_overview.png'), full_page=True)
        await pg.click('[data-a="tab"][data-k="int"][data-v="sq"]'); await pg.wait_for_timeout(100)
        await pg.click('[data-a="isauto"]'); await pg.wait_for_timeout(100)
        await pg.click('[data-a="isok"]'); await pg.wait_for_timeout(200)
        print('press modal:', await pg.locator('.modal [data-a="ipress"]').count())
        await pg.screenshot(path=str(out / 'i_press.png'))
        await pg.click('.modal [data-a="ipress"] >> nth=1'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'i_squad.png'))
        ok = await adv(pg, "()=>engFixtures().filter(f=>f.r).length>=2")
        print('England games played:', await pg.evaluate("()=>engFixtures().filter(f=>f.r).map(f=>tName(f.h)+' '+f.r.join('-')+' '+tName(f.a)).join(' | ')"), ok)
        await pg.click('nav [data-v="intl"]'); await pg.click('[data-a="tab"][data-k="int"][data-v="comp"]'); await pg.wait_for_timeout(150)
        await pg.screenshot(path=str(out / 'i_comp.png'), full_page=True)
        await pg.click('main .lnk[data-a="clubview"] >> nth=1'); await pg.wait_for_timeout(150)
        print('nation modal:', (await pg.inner_text('.modal .band')).strip(), '| rows', await pg.locator('.modal table.t tbody tr').count())
        await pg.screenshot(path=str(out / 'i_nation.png'))
        await pg.keyboard.press('Escape')
        for t in ['rank', 'rec', 'hist', 'fr', 'fx']:
            await pg.click(f'[data-a="tab"][data-k="int"][data-v="{t}"]'); await pg.wait_for_timeout(80)
        await pg.click('[data-a="tab"][data-k="int"][data-v="rec"]'); await pg.wait_for_timeout(80)
        await pg.screenshot(path=str(out / 'i_records.png'))
        await pg.click('[data-a="tab"][data-k="int"][data-v="fr"]'); await pg.click('[data-a="frok"]'); await pg.wait_for_timeout(100)
        print('friendly arranged:', await pg.evaluate("()=>engFixtures().filter(f=>f.comp==='FR').length"))
        await pg.click('nav [data-v="history"]'); await pg.click('[data-a="tab"][data-k="hist"][data-v="rank"]'); await pg.wait_for_timeout(80)
        print('rankings me:', (await pg.inner_text('main tr.me')).replace('\t', ' ')[:90])
        await pg.click('nav [data-v="inbox"]'); await pg.wait_for_timeout(80)
        print('comp links in inbox:', await pg.locator('main .lnk[data-a="gocomp"]').count())
        await pg.set_viewport_size({'width': 390, 'height': 844})
        await pg.click('nav [data-v="intl"]'); await pg.click('[data-a="tab"][data-k="int"][data-v="sq"]'); await pg.wait_for_timeout(120)
        print('390 overflow:', await pg.evaluate("()=>document.documentElement.scrollWidth>window.innerWidth+1"))
        await pg.screenshot(path=str(out / 'i_squad_m.png'))
        await pg.click('[data-a="tab"][data-k="int"][data-v="comp"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'i_comp_m.png'))
        # dual career
        ctx = await b.new_context(viewport={'width': 1280, 'height': 900}); pg2 = await ctx.new_page()
        pg2.on('pageerror', lambda e: errs.append('dual:' + str(e)))
        await pg2.goto(URL); await pg2.wait_for_timeout(400)
        if await pg2.query_selector('.intro'):
            await pg2.click('.intro .ic-skip'); await pg2.wait_for_timeout(500)
        await pg2.click('[data-a="cmode"][data-v="dual"]'); await pg2.click('[data-v="TOT"]'); await pg2.click('[data-a="start"]'); await pg2.wait_for_timeout(300)
        print('dual:', await pg2.evaluate("()=>G.user+' '+G.intl.mode+' '+G.intl.job"))
        ok = await adv(pg2, "()=>G.intl.sw===1", 60)
        print('dual swapped to England:', ok, await pg2.evaluate("()=>G.date+' '+G.user"))
        await pg2.click('nav [data-v="squad"]'); await pg2.wait_for_timeout(100)
        print('squad screen during England duty:', await pg2.evaluate("()=>squad(G.user).length"), (await pg2.inner_text('main .band')).split('\n')[0])
        ok = await adv(pg2, "()=>G.intl.sw===0 && engFixtures().filter(f=>f.r).length>=4", 80)
        print('back at club:', ok, await pg2.evaluate("()=>G.date+' '+G.user"))
        await pg2.screenshot(path=str(out / 'i_dual_inbox.png'))
        print('errors', errs[:8])
        await b.close()
asyncio.run(main())
