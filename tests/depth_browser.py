# Assistant manager report: squad depth table (stars against the first eleven, verdicts) and "Where to strengthen"
# recommendations with a button into Player search. python3 tests/depth_browser.py OUT
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_depth.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in (1280, 390):
            pg = await b.new_page(viewport={'width': vw, 'height': 1100}); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(300)
            await pg.click('[data-v="LUT"]' if await pg.locator('[data-v="LUT"]').count() else '[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            # thin out the full-backs so the report has something to say
            await pg.evaluate("()=>{const sq=squad(G.user).filter(p=>p.pos==='LB');for(const p of sq.slice(0)){p.c='FA';G.sq[G.user]=G.sq[G.user].filter(x=>x!==p.id);}autoPick(G.user);UI.scr='reports';UI.tab.rep='as';render();}"); await pg.wait_for_timeout(300)
            d = await pg.evaluate("()=>{const t=document.body.innerText;return [t.includes('Squad depth'), t.includes('Where to strengthen'), document.querySelectorAll('[data-a=\"depthsearch\"]').length, /Left-back[\\s\\S]{0,200}(Lacking|Nobody)/.test(t)]}")
            await pg.screenshot(path=str(out / f'depth_{vw}.png'), full_page=True)
            ov = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1")
            if d[2]: await pg.click('[data-a="depthsearch"]'); await pg.wait_for_timeout(300)
            srch = await pg.evaluate("()=>[UI.scr, UI.filt.grp]")
            print(vw, 'depth', d, 'overflow', ov, 'search', srch)
            if not (d[0] and d[1] and d[2] >= 1 and d[3] and not ov and srch[0] == 'transfers' and srch[1]): errs.append('depth ' + str([d, ov, srch]))
        print('errors', errs); await b.close()
        if errs: sys.exit(1)
asyncio.run(main())
