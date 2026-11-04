# Browser check: playable shoot-out, penalty line-up, WUPH.com, intro poster. python3 tests/so_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_so.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            # intro: go to the poster card
            await pg.mouse.click(10, 10); await pg.wait_for_timeout(250); await pg.mouse.click(10, 10); await pg.wait_for_timeout(900)
            await pg.screenshot(path=str(out / f'so_poster_{vw}.png'))
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
            await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            fid = await pg.evaluate("()=>userFixtureOn(G.date)?userFixtureOn(G.date).id:(()=>{let g=0;while(!userFixtureOn(G.date)&&g++<40){const r=advance();if(r.type==='match')break;}return userFixtureOn(G.date).id})()")
            await pg.evaluate(f"()=>{{startLive('{fid}');UI.match.run=false;clearTimeout(UI.match.timer)}}"); await pg.wait_for_timeout(300)
            # a penalty on the 2D pitch: put a pen event in the next minute and check positions
            pos = await pg.evaluate("""()=>{const LM=UI.match,M=LM.M,V=LM.vis,SC=V.live;const s=0;const e=M.sides[0].ps.find(x=>x.on&&x.role!=='GK');
              const st={k:'place',at:wpt(0,.895,.5),e,pen:0};penLineUp(V,M,SC,st);let inside=0,out=0;
              for(const side of [0,1])for(const x of M.sides[side].ps.filter(q=>q.on)){if(x===e)continue;const p=SC.ov.get(x);if(x.role==='GK')continue;if(p.x>.843&&p.y>.2&&p.y<.8)inside++;else out++;}
              return {inside,out}}""")
            print(vw, 'penalty line-up: players inside the box', pos['inside'], '| outside', pos['out'])
            # force a shoot-out
            await pg.evaluate("()=>{const M=UI.match.M;M.min=120;M.et=true;M.need=true;M.score=[1,1];shootout(M);renderMatch()}"); await pg.wait_for_timeout(200)
            for i in range(12):
                if await pg.evaluate("()=>UI.match.M.so.over"): break
                if await pg.query_selector('[data-a="sokick"]'):
                    await pg.click('[data-a="sokick"][data-v="L"]')
                else:
                    await pg.click('[data-a="sodive"][data-v="R"]')
                await pg.wait_for_timeout(700)
                if i == 1: await pg.screenshot(path=str(out / f'so_kick_{vw}.png'))
            if not await pg.evaluate("()=>UI.match.M.so.over"): await pg.click('[data-a="soauto"]'); await pg.wait_for_timeout(700)
            print(vw, 'shoot-out', await pg.evaluate("()=>UI.match.M.pens.join('-')+' done '+UI.match.M.done"), '| continue btn', await pg.locator('[data-a="mfinish"]').count(), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.screenshot(path=str(out / f'so_end_{vw}.png'))
            await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{G.date='2026-11-04';tributeDM();UI.scr='media';render()}"); await pg.wait_for_timeout(200)
            print(vw, 'WUPH band', (await pg.inner_text('main .band')).split('\n')[0], '| ticks', await pg.locator('.vchk').count())
            await pg.screenshot(path=str(out / f'so_wuph_{vw}.png'))
            await pg.close()
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
