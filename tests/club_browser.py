# Browser check: intro sting, stadium, board, history and rankings. Run after build.py: python3 tests/club_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_club.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + html + '</body></html>')
URL = 'file://' + str(w.resolve())

async def intro_shots(b, vw, vh, tag, errs):
    ctx = await b.new_context(viewport={'width': vw, 'height': vh})
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL); await pg.wait_for_timeout(2150)
    print(tag, 'intro visible:', await pg.is_visible('.intro .ic-ayep.on'))
    await pg.screenshot(path=str(out / f'intro_ayep_{tag}.png'))
    await pg.mouse.click(vw // 2, vh // 2); await pg.wait_for_timeout(900)
    print(tag, 'disclaimer on:', await pg.is_visible('.intro .ic-disc.on'))
    await pg.screenshot(path=str(out / f'intro_disc_{tag}.png'))
    await pg.mouse.click(vw // 2, vh // 2); await pg.wait_for_timeout(1500)
    print(tag, 'logo on:', await pg.is_visible('.intro .ic-logo.on'))
    await pg.screenshot(path=str(out / f'intro_logo_{tag}.png'))
    await pg.mouse.click(vw // 2, vh // 2); await pg.wait_for_timeout(700)
    print(tag, 'intro gone after taps:', await pg.query_selector('.intro') is None)
    # reload: plays again, Skip intro removes it at once
    await pg.reload(); await pg.wait_for_timeout(500)
    await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(600)
    print(tag, 'skip works:', await pg.query_selector('.intro') is None)
    return ctx, pg

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        errs = []
        ctx, pg = await intro_shots(b, 1280, 900, 'desk', errs)
        await intro_shots(b, 390, 844, 'm390', errs)
        # key press advances, timer finishes on its own
        await pg.reload(); await pg.wait_for_timeout(300); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
        print('key advances to disclaimer:', await pg.is_visible('.intro .ic-disc.on'))
        await pg.wait_for_timeout(7000); print('intro ends by itself:', await pg.query_selector('.intro') is None)
        # game
        await pg.click('[data-a="startdiv"][data-v="PL"]') if await pg.query_selector('[data-a="startdiv"][data-v="PL"]') else None
        await pg.click('[data-v="LEE"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(200)
        for i in range(30):
            await pg.click('#go'); await pg.wait_for_timeout(40)
            if await pg.query_selector('[data-a="quicksim"]'):
                await pg.click('[data-a="quicksim"]'); await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(100)
                if await pg.query_selector('[data-a="iv"]'): await pg.click('[data-a="iv"] >> nth=-1')
            if 'Oct' in await pg.inner_text('.top .date'): break
        print('date', await pg.inner_text('.top .date'))
        await pg.click('nav [data-v="club"]'); await pg.click('[data-a="tab"][data-k="club"][data-v="stad"]'); await pg.wait_for_timeout(150)
        txt = await pg.inner_text('main')
        print('stadium tab:', 'Record attendance' in txt, 'Drawn illustration' in txt, '| stands:', await pg.locator('main table.t tbody tr').count())
        await pg.screenshot(path=str(out / 'club_stadium.png'), full_page=True)
        await pg.click('[data-a="tab"][data-k="club"][data-v="board"]'); await pg.wait_for_timeout(100)
        await pg.evaluate("()=>{G.board=85; userTeam().bal=Math.max(userTeam().bal,150);}")
        await pg.select_option('#bsi', '2'); await pg.wait_for_timeout(80); await pg.select_option('#bsz', '2'); await pg.wait_for_timeout(80)
        await pg.click('[data-a="breq"][data-v="exp"]'); await pg.wait_for_timeout(80)
        await pg.click('[data-a="breq"][data-v="tr"]'); await pg.wait_for_timeout(80)
        await pg.screenshot(path=str(out / 'club_board.png'), full_page=True)
        for i in range(12):
            await pg.click('#go'); await pg.wait_for_timeout(40)
            if await pg.query_selector('[data-a="quicksim"]'):
                await pg.click('[data-a="quicksim"]'); await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(100)
                if await pg.query_selector('[data-a="iv"]'): await pg.click('[data-a="iv"] >> nth=-1')
            if await pg.evaluate("()=>G.brd.pend.length===0"): break
        print('board replies:', await pg.evaluate("()=>G.news.filter(n=>/^Board /.test(n.title)).map(n=>n.title).join(' | ')"))
        print('works:', await pg.evaluate("()=>G.brd.proj.map(p=>p.k+' '+p.end).join(', ')"), '| home venue works:', await pg.evaluate("()=>{const f=Object.values(G.fx).find(f=>f.h===G.user&&!f.r);return f?JSON.stringify(venueOf(f).works):'-'}"))
        await pg.click('nav [data-v="club"]'); await pg.click('[data-a="tab"][data-k="club"][data-v="stad"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'club_works.png'), full_page=True)
        await pg.click('[data-a="tab"][data-k="club"][data-v="hon"]'); await pg.wait_for_timeout(80)
        print('honours tab:', (await pg.inner_text('main')).count('English champions'))
        await pg.click('nav [data-v="history"]'); await pg.wait_for_timeout(100)
        print('history rows:', await pg.locator('main table.t tbody tr').count(), '| links in history:', await pg.locator('main table .lnk').count())
        await pg.screenshot(path=str(out / 'hist_lg.png'))
        await pg.click('[data-a="tab"][data-k="hist"][data-v="rank"]'); await pg.wait_for_timeout(100)
        print('rank rows:', await pg.locator('main table.t tbody tr').count(), '| me row:', await pg.locator('main tr.me').count())
        await pg.screenshot(path=str(out / 'hist_rank.png'))
        await pg.click('[data-a="tab"][data-k="hist"][data-v="club"]'); await pg.select_option('#hcl', 'MUN'); await pg.wait_for_timeout(100)
        print('MUN honours text:', (await pg.inner_text('main table.t')).split('\n')[1][:60])
        await pg.click('nav [data-v="mgr"]'); print('manager rankings box:', 'World rankings' in await pg.inner_text('main'))
        await pg.click('nav [data-v="table"]'); await pg.click('main .lnk[data-a="clubview"] >> nth=1'); await pg.wait_for_timeout(150)
        print('club modal stadium:', await pg.locator('.modal .stadsvg').count())
        await pg.screenshot(path=str(out / 'club_modal.png'))
        await pg.keyboard.press('Escape')
        await pg.click('nav [data-v="game"]'); print('game options/about:', 'Play the intro' in await pg.inner_text('main'), 'fan-made game' in await pg.inner_text('main'))
        await pg.click('nav [data-v="finance"]'); print('finance build row:', 'Building work' in await pg.inner_text('main'))
        # mobile views
        await pg.set_viewport_size({'width': 390, 'height': 844})
        await pg.click('nav [data-v="club"]'); await pg.click('[data-a="tab"][data-k="club"][data-v="stad"]'); await pg.wait_for_timeout(150)
        print('390 overflow:', await pg.evaluate("()=>document.documentElement.scrollWidth>window.innerWidth+1"))
        await pg.screenshot(path=str(out / 'club_stadium_m.png'), full_page=False)
        await pg.click('nav [data-v="history"]'); await pg.click('[data-a="tab"][data-k="hist"][data-v="rank"]'); await pg.wait_for_timeout(100)
        await pg.screenshot(path=str(out / 'hist_rank_m.png'))
        print('errors', errs)
        await b.close()
asyncio.run(main())
