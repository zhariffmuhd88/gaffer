# Browser check: former players on the Staff screen, non-playing profile, national trophy news art and parade popup. python3 tests/exnat_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_exnat.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
            await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{UI.scr='staff';render()}"); await pg.wait_for_timeout(200)
            n = await pg.locator('[data-a="expro"]').count()
            print(vw, 'profile buttons', n, '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.screenshot(path=str(out / f'ex_staff_{vw}.png'), full_page=True)
            await pg.locator('[data-a="expro"]').first.click(); await pg.wait_for_timeout(200)
            await pg.screenshot(path=str(out / f'ex_pro_{vw}.png'), full_page=False)
            await pg.locator('[data-a="exhire"]').first.click(); await pg.wait_for_timeout(200)
            print(vw, 'hired', await pg.evaluate("()=>Object.values(G.staff).filter(s=>s.pid).map(s=>s.n+' '+s.role).join(',')"))
            await pg.evaluate("()=>{UI.modal=null;finishEdition(G.intl.ed.UNL27,NID('ENG'),NID('ESP'));render()}"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=str(out / f'nat_pop_{vw}.png'), full_page=False)
            await pg.evaluate("()=>{UI.modal=null;UI.scr='inbox';UI.ibf='all';UI.msg=G.news.find(n=>n.art&&n.art.k==='ntro').id;render()}"); await pg.wait_for_timeout(200)
            print(vw, 'inbox art svg', await pg.locator('.mbody svg').count())
            await pg.screenshot(path=str(out / f'nat_inbox_{vw}.png'), full_page=False)
            await pg.close()
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
