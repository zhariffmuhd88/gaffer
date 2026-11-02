# Browser check for the selection box on the Tactics screen. python3 tests/sel_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_sel.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        pg = await b.new_page(viewport={'width': 1280, 'height': 900})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(400); await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(400)
        await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
        await pg.click('nav [data-v="tactics"]'); await pg.wait_for_timeout(150)
        await pg.click('[data-a="selpick"][data-v="youth"]'); await pg.wait_for_timeout(150)
        print('youth starters:', await pg.evaluate("()=>userTeam().tac.xi.filter(id=>P(id).sq).length"))
        await pg.fill('#selname', 'Cup kids'); await pg.click('[data-a="selsave"]'); await pg.wait_for_timeout(150)
        await pg.click('[data-a="selpick"][data-v="best"]'); await pg.wait_for_timeout(100)
        await pg.fill('#selname', 'First XI'); await pg.click('[data-a="selsave"]'); await pg.wait_for_timeout(150)
        await pg.select_option('#selset', '0'); await pg.click('[data-a="selload"][data-v="1"]'); await pg.wait_for_timeout(150)
        print('after load Cup kids, youth starters:', await pg.evaluate("()=>userTeam().tac.xi.filter(id=>P(id).sq).length"), '| sets', await pg.evaluate("()=>tacSets().map(s=>s.n).join(', ')"))
        await pg.screenshot(path=str(out / 'sel_desk.png'))
        await pg.click('[data-a="selpick"][data-v="best"]'); await pg.wait_for_timeout(100)
        await pg.click('[data-a="tslot"][data-v="6"]'); await pg.click('[data-a="tmove"][data-v="up"]'); await pg.click('[data-a="tslot"][data-v="6"]'); await pg.wait_for_timeout(100)
        await pg.click('[data-a="tslot"][data-v="1"]'); await pg.click('[data-a="tmove"][data-v="up"]'); await pg.click('[data-a="tmove"][data-v="up"]'); await pg.wait_for_timeout(100)
        print('custom form:', await pg.evaluate("()=>userTeam().tac.form+' '+FORMS[userTeam().tac.form][1][0]+' '+FORMS[userTeam().tac.form][6][0]"))
        await pg.screenshot(path=str(out / 'move_desk.png'))
        await pg.click('[data-a="tswap"]'); await pg.click('[data-a="tslot"][data-v="2"]'); await pg.wait_for_timeout(100)
        print('swap done, selection cleared:', await pg.evaluate("()=>UI.tSel===null"))
        await pg.click('[data-a="tslot"][data-v="8"]'); await pg.wait_for_timeout(100)
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(150)
        print('390 overflow:', await pg.evaluate("()=>document.documentElement.scrollWidth>window.innerWidth+1"))
        await pg.screenshot(path=str(out / 'sel_m.png'))
        print('errors', errs); await b.close()
asyncio.run(main())
