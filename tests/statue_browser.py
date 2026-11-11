# Statue: unveiling pop-up, the club honours page and the manager profile; bronze and "Club legend" versions.
# python3 tests/statue_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_st.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
SETUP = """(n)=>{ensureProfile();const st=curStint();st.tro=['2026/27 Premier League','2027/28 FA Cup','2027/28 Champions League','2028/29 Premier League','2029/30 Carabao Cup','2030/31 Premier League','2031/32 FA Cup','2032/33 Europa League'].slice(0,n);st.p=240;st.w=160;st.from=sd('2026-07-01');
 G.mgrP.av={skin:3,hair:6,hc:1,beard:2,glasses:1,outfit:3};G.statues={};const _y=stintYears;stintYears=()=>6;checkStatue();stintYears=_y;render();}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(400)
            await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            await pg.evaluate(SETUP, 4); await pg.wait_for_timeout(3600)
            print(vw, 'unveil modal', await pg.locator('.modal .statuesvg').count(), '| head drawn', await pg.evaluate("()=>document.querySelector('.modal .statuesvg').innerHTML.includes('ellipse cx=\"50\" cy=\"43\"')"))
            await pg.screenshot(path=str(out / f'statue_unveil_{vw}.png'))
            await pg.evaluate("()=>{UI.modal=null;render();}")
            await pg.evaluate(SETUP, 8); await pg.wait_for_timeout(3600)
            print(vw, 'legend plaque', await pg.evaluate("()=>document.querySelector('.modal .statuesvg').textContent.includes('CLUB LEGEND')"))
            await pg.screenshot(path=str(out / f'statue_legend_{vw}.png'))
            await pg.evaluate("()=>{UI.modal=null;UI.scr='mgr';render();}"); await pg.wait_for_timeout(200)
            print(vw, 'manager page statues', await pg.locator('main .statuesvg').count(), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.close()
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
