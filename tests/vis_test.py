import asyncio, pathlib
from playwright.async_api import async_playwright
html=pathlib.Path('gaffer.html').read_text()
pathlib.Path('wrap.html').write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+html+'</body></html>')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1280,'height':900})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+str(pathlib.Path('wrap.html').resolve())); await pg.wait_for_timeout(500)
        await pg.click('[data-v="MUN"]'); await pg.click('[data-a="start"]')
        for i in range(8):
            await pg.click('#go'); await pg.wait_for_timeout(250)
            if await pg.query_selector('[data-a="kickoff"]'): break
        await pg.click('[data-a="kickoff"]'); await pg.click('[data-a="mspeed"][data-v="2"]')
        await pg.wait_for_timeout(4000)
        await pg.screenshot(path='shot_2d.png')
        await pg.click('[data-a="mview"][data-v="text"]'); await pg.click('[data-a="mview"][data-v="2d"]')
        await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(1500)
        print('sw', await pg.evaluate('document.documentElement.scrollWidth'))
        await pg.screenshot(path='shot_2d_m.png')
        await pg.click('[data-a="mskip"]'); await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(300)
        print('ERR', errs); await b.close()
asyncio.run(main())
