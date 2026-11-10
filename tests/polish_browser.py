# Browser check: grouped nav (desktop collapse, phone rows), inbox filters + Staff digest + mark all read, first-week tips.
# python3 tests/polish_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_pol.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 860})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{try{localStorage.clear()}catch(e){}}")
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(400)
            await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            print(vw, 'groups', await pg.locator('.gnav .ngrp').count(), '| nav buttons', await pg.locator('.gnav [data-a="nav"]').count(), '| tips', await pg.locator('.tipsbox').count())
            await pg.screenshot(path=str(out / f'pol_home_{vw}.png'))
            # advance three weeks to get digests
            await pg.evaluate("()=>{let g=0;while(G.date<sd('2026-07-25')&&g++<300){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}}UI.scr='inbox';render()}")
            dg = await pg.evaluate("()=>G.news.filter(n=>n.dg).map(n=>n.title+' ['+n.parts.map(p=>p.t).join(', ')+']').slice(0,2).join(' | ')")
            print(vw, 'digests:', dg)
            for k in ['imp', 'tr', 'staff', 'media', 'all']:
                await pg.click(f'[data-a="ibf"][data-v="{k}"]'); await pg.wait_for_timeout(80)
                print('   ', k, await pg.locator('.mitem').count(), end='')
            print()
            await pg.click('[data-a="ibf"][data-v="staff"]'); await pg.wait_for_timeout(100)
            await pg.screenshot(path=str(out / f'pol_inbox_{vw}.png'))
            await pg.click('[data-a="ibf"][data-v="all"]'); await pg.click('[data-a="ibread"]'); await pg.wait_for_timeout(100)
            print(vw, 'unread after mark all', await pg.evaluate("()=>unreadCount()"), '| media badge', await pg.evaluate("()=>mediaUnread()"))
            if vw == 390:
                await pg.click('.ngt[data-v="Gclub"]'); await pg.wait_for_timeout(100)
                print(vw, 'phone group club items visible', await pg.locator('.ngrp.msel .ngi button').count())
                await pg.screenshot(path=str(out / f'pol_nav_{vw}.png'))
                await pg.click('.ngrp.msel [data-v="finance"]'); await pg.wait_for_timeout(100)
                print(vw, 'screen', await pg.evaluate("()=>UI.scr"))
            else:
                await pg.click('.ngh[data-v="Gworld"]'); await pg.wait_for_timeout(100)
                print(vw, 'world shut', await pg.locator('.ngrp.shut').count(), '| visible nav', await pg.locator('.gnav [data-a="nav"]:visible').count())
            print(vw, 'overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.close()
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
