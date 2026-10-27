import asyncio, pathlib
from playwright.async_api import async_playwright
html=pathlib.Path('gaffer.html').read_text()
pathlib.Path('wrap.html').write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+html+'</body></html>')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1280,'height':1000})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+str(pathlib.Path('wrap.html').resolve())); await pg.wait_for_timeout(500)
        await pg.click('[data-v="ARS"]'); await pg.select_option('#np-bg','intl'); await pg.select_option('#np-lic','PRO')
        await pg.screenshot(path='mg_start.png')
        await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
        await pg.click('[data-a="avedit"]'); await pg.click('[data-a="avset"][data-k="hair"][data-v="5"]'); await pg.click('[data-a="avset"][data-k="beard"][data-v="2"]'); await pg.click('[data-a="avset"][data-k="glasses"][data-v="1"]'); await pg.click('[data-a="avset"][data-k="outfit"][data-v="1"]')
        await pg.screenshot(path='mg_av.png', full_page=True)
        await pg.click('[data-a="avdone"]')
        await pg.set_input_files('#avfile', 'testphoto.jpg'); await pg.wait_for_timeout(700)
        print('photo set', await pg.evaluate("!!(G.mgrP.photo && G.mgrP.photo.startsWith('data:image/jpeg'))"), 'len', await pg.evaluate("G.mgrP.photo.length"))
        await pg.click('[data-a="avnophoto"]')
        # fast-forward season to November using engine
        await pg.evaluate("""(()=>{let g=0;while(g++<400&&G.date<'2026-11-03'){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}} autosave(); render();})()""")
        await pg.click('nav [data-v="awards"]'); await pg.screenshot(path='mg_awards.png', full_page=True)
        await pg.click('[data-a="tab"][data-v="race"]'); await pg.click('[data-a="tab"][data-v="season"]')
        await pg.click('nav [data-v="mgr"]'); await pg.screenshot(path='mg_profile.png', full_page=True)
        await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(200)
        print('sw', await pg.evaluate('document.documentElement.scrollWidth'))
        await pg.screenshot(path='mg_mobile.png')
        print('ERR', errs); await b.close()
asyncio.run(main())
