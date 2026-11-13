# Browser check: Manager options screen (job centre, job security, under pressure), job offer buttons. python3 tests/jobs_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_jobs.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
            await pg.click('[data-v="BRE"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            # fast-forward to late October with quick results
            await pg.evaluate("""()=>{UI.modal=null;let g=0;while(G.date<'2026-10-25'&&g++<4000){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}if(G.sacked){G.sacked=false;}}
              const lo=jobClubs().find(t=>divOf(t)==='CH'&&!isVac(t));sackAI(lo,'Test.');UI.scr='jobs';render()}""")
            await pg.wait_for_timeout(300)
            print(vw, 'apply buttons', await pg.locator('[data-a="japply"]').count(), '| interest buttons', await pg.locator('[data-a="jint"]').count(), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.screenshot(path=str(out / f'jobs_centre_{vw}.png'), full_page=True)
            await pg.locator('[data-a="jint"]').first.click(); await pg.wait_for_timeout(200)
            await pg.click('[data-a="tab"][data-v="sec"]'); await pg.wait_for_timeout(200)
            await pg.screenshot(path=str(out / f'jobs_sec_{vw}.png'), full_page=False)
            await pg.click('[data-a="tab"][data-v="press"]'); await pg.wait_for_timeout(200)
            await pg.evaluate("()=>{const t=jobClubs().find(x=>isVac(x)&&x!==G.user);jobOffer(t,'Test.');UI.scr='inbox';UI.ibf='all';UI.msg=G.news.find(n=>n.act&&n.act.k==='job').id;render()}"); await pg.wait_for_timeout(200)
            print(vw, 'offer buttons', await pg.locator('[data-a="jacc"]').count())
            await pg.close()
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
