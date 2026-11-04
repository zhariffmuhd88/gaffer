# Browser check: Reports screen (assistant and scouts) and happiness reasons. python3 tests/rep_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_rep.html'
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
        await pg.goto(URL); await pg.wait_for_timeout(400); await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(400)
        await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
        ok = await pg.evaluate("""()=>{let g=0;while(G.date<sd('2026-10-26')&&g++<3000){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}}UI.modal=null;render();return teamGames()}""")
        print('advanced:', ok, await pg.evaluate("()=>G.date+' games '+teamGames()"))
        await pg.click('nav [data-v="reports"]'); await pg.wait_for_timeout(150)
        print('assistant sections:', await pg.locator('main h2.sect').count())
        await pg.screenshot(path=str(out / 'rep_asst.png'), full_page=True)
        await pg.click('[data-a="tab"][data-k="rep"][data-v="sc"]'); await pg.wait_for_timeout(150)
        await pg.select_option('select[data-k="1:reg"]', 'L:SA'); await pg.wait_for_timeout(100)
        await pg.select_option('select[data-k="1:pref"]', 'wonder'); await pg.wait_for_timeout(100)
        await pg.click('[data-a="screp"]'); await pg.wait_for_timeout(200)
        print('scout 2:', await pg.evaluate("()=>JSON.stringify(G.scouts[1])"), '| recs', await pg.evaluate("()=>G.scRep.reps[1].recs.map(x=>P(x.pid).n+' '+P(x.pid).age).join(', ')"))
        await pg.screenshot(path=str(out / 'rep_scout.png'), full_page=True)
        pid = await pg.evaluate("()=>squad(G.user).sort((a,b)=>hap(a)-hap(b))[0].id")
        await pg.evaluate(f"()=>playerModal('{pid}')"); await pg.wait_for_timeout(200)
        el = await pg.query_selector('.modal .hapl')
        if el: await el.scroll_into_view_if_needed()
        await pg.screenshot(path=str(out / 'rep_hap.png'))
        print('happiness lists:', await pg.locator('.modal .hapl').count(), (await pg.inner_text('.modal .grid2 >> nth=-1')).replace('\n', ' | ')[:400] if await pg.locator('.modal .hapl').count() else '')
        await pg.keyboard.press('Escape')
        await pg.set_viewport_size({'width': 390, 'height': 844})
        for t in ['as', 'sc']:
            await pg.evaluate(f"()=>{{UI.tab.rep='{t}';UI.scr='reports';render()}}"); await pg.wait_for_timeout(120)
            print('390', t, 'overflow:', await pg.evaluate("()=>document.documentElement.scrollWidth>window.innerWidth+1"))
        await pg.screenshot(path=str(out / 'rep_m.png'))
        await pg.evaluate(f"()=>playerModal('{pid}')"); await pg.wait_for_timeout(150)
        print('390 modal overflow:', await pg.evaluate("()=>document.documentElement.scrollWidth>window.innerWidth+1"))
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
