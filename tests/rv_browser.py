# Browser check: in-match position swap / move, extra-time half-time team talk, shirt sponsor screen. python3 tests/rv_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_rv.html'
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
            fid = await pg.evaluate("()=>{let g=0;while(!userFixtureOn(G.date)&&g++<40){const r=advance();if(r.type==='match')break;}return userFixtureOn(G.date).id}")
            await pg.evaluate(f"()=>{{startLive('{fid}');UI.match.run=false;clearTimeout(UI.match.timer);UI.match.panel='subs';renderMatch()}}"); await pg.wait_for_timeout(300)
            r0 = await pg.evaluate("()=>{const S=UI.match.M.sides[uSide(UI.match.M)];return S.ps.filter(e=>e.on).map(e=>e.role).join(',')}")
            btns = pg.locator('[data-a="mswp"]'); n = await btns.count()
            await btns.nth(9).click(); await pg.wait_for_timeout(150); await pg.locator('[data-a="mswp"]').nth(5).click(); await pg.wait_for_timeout(150)
            r1 = await pg.evaluate("()=>{const S=UI.match.M.sides[uSide(UI.match.M)];return S.ps.filter(e=>e.on).map(e=>e.role).join(',')}")
            await pg.locator('[data-a="mswp"]').nth(7).click(); await pg.wait_for_timeout(150)
            await pg.select_option('#mrole', 'AMC'); await pg.wait_for_timeout(200)
            r2 = await pg.evaluate("()=>{const S=UI.match.M.sides[uSide(UI.match.M)];return S.ps.filter(e=>e.on).map(e=>e.role).join(',')}")
            print(vw, 'pos buttons', n, '\n  before', r0, '\n  swap  ', r1, '\n  move  ', r2)
            await pg.screenshot(path=str(out / f'rv_pos_{vw}.png'), full_page=False)
            # extra time: half-time pause at 105
            ht = await pg.evaluate("()=>{const LM=UI.match,M=LM.M;LM.panel=null;M.need=true;M.min=89;M.score=[1,1];M.agg=[0,0];let k=0;while(M.min<106&&!M.done&&k++<40){stepMinute(M);if(M.ht&&M.min>=105)return 'paused at '+M.min;M.ht=false;}return 'no pause, min '+M.min}")
            await pg.evaluate("()=>{const LM=UI.match;LM.M.ht=true;tick&&0;LM.panel='talk';LM.talked=false;renderMatch()}"); await pg.wait_for_timeout(150)
            print(vw, 'ET half-time:', ht, '| talk title', (await pg.inner_text('main .sect') if await pg.locator('main .sect').count() else '?'))
            await pg.evaluate("()=>{UI.match.M.done=true;UI.match=null;UI.scr='finance';render()}"); await pg.wait_for_timeout(200)
            print(vw, 'sponsor offers', await pg.locator('[data-a="sponok"]').count(), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.screenshot(path=str(out / f'rv_fin_{vw}.png'), full_page=True)
            await pg.locator('[data-a="sponok"]').first.click(); await pg.wait_for_timeout(200)
            print(vw, 'signed', await pg.evaluate("()=>G.spon.cur.name+' '+G.spon.offers.length"))
            await pg.close()
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
