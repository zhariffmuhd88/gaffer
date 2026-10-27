import asyncio, pathlib
from playwright.async_api import async_playwright
html=pathlib.Path('gaffer.html').read_text()
page_html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+html+'</body></html>'
pathlib.Path('wrap.html').write_text(page_html)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':1280,'height':900})
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console:'+m.text) if m.type=='error' else None)
        await pg.goto('file://'+str(pathlib.Path('wrap.html').resolve()))
        await pg.wait_for_timeout(800)
        await pg.click('[data-v="ARS"]')
        await pg.click('[data-a="start"]')
        for s in ['train','staff','dyn','squad','tactics','fixtures','table','comps','stats','transfers','finance','club','game','inbox']:
            await pg.click(f'nav [data-v="{s}"]'); await pg.wait_for_timeout(50)
        # tactics interaction
        await pg.click('nav [data-v="tactics"]'); await pg.click('.slot >> nth=9'); await pg.click('[data-a="setrole"] >> nth=1'); print('role set:', await pg.inner_text('.slot >> nth=9'))
        await pg.click('[data-a="tac"][data-k="line"][data-v="3"]'); await pg.select_option('#cap-vice', index=3)
        await pg.click('nav [data-v="transfers"]'); await pg.click('[data-a="tab"][data-v="scout"]'); await pg.click('[data-a="scout"] >> nth=0'); await pg.click('[data-a="tab"][data-v="loans"]'); await pg.click('[data-a="tab"][data-v="search"]')
        await pg.click('nav [data-v="squad"]'); await pg.click('tr[data-a="player"] >> nth=20'); await pg.click('[data-a="loanout"][data-k="ch"]'); print('loanout ok')
        await pg.click('nav [data-v="staff"]'); await pg.click('[data-a="hire"] >> nth=0')
        await pg.click('nav [data-v="train"]'); await pg.click('[data-a="train"][data-v="att"]')
        # player modal + bid
        await pg.click('nav [data-v="transfers"]'); await pg.click('tr[data-a="player"] >> nth=5'); await pg.click('[data-a="bidOpen"]'); await pg.click('[data-a="bid"]')
        await pg.keyboard.press('Escape')
        # continue to first match
        for i in range(6):
            await pg.click('#go'); await pg.wait_for_timeout(300)
            if await pg.query_selector('[data-a="kickoff"]'): break
        txt=await pg.inner_text('main')
        print('PREMATCH found:', 'PLAY MATCH' in txt)
        await pg.click('[data-a="ptalk2"] >> nth=0'); print('asst:', 'Assistant' in await pg.inner_text('main'))
        await pg.click('[data-a="press"] >> nth=0'); print('press:', (await pg.inner_text('main')).count('Press conference'))
        await pg.click('[data-a="kickoff"]')
        await pg.click('[data-a="mspeed"][data-v="3"]')
        await pg.wait_for_timeout(2600)
        # half-time panel?
        if await pg.query_selector('[data-a="talk"]'):
            await pg.click('[data-a="talk"][data-v="encourage"]'); print('talk ok')
        await pg.screenshot(path='shot_match.png', full_page=False)
        if not await pg.query_selector('[data-a="subOut"]'):
            await pg.click('[data-a="mpanel"][data-v="subs"]')
        await pg.click('[data-a="subOut"] >> nth=1'); await pg.click('[data-a="subIn"] >> nth=0')
        await pg.click('[data-a="mskip"]')
        await pg.click('[data-a="mfinish"]')
        await pg.wait_for_timeout(300)
        print('interview:', bool(await pg.query_selector('[data-a="iv"]')))
        await pg.click('[data-a="iv"] >> nth=0')
        await pg.click('nav [data-v="dyn"]'); await pg.click('tr[data-a="player"] >> nth=0'); await pg.click('[data-a="ptalk"][data-k="time"]'); print('talk:', (await pg.inner_text('#talkreply'))[:100]); await pg.keyboard.press('Escape')
        print('after match main:', (await pg.inner_text('.top'))[:120].replace('\n',' | '))
        # advance several times with quick sims
        for i in range(25):
            await pg.click('#go'); await pg.wait_for_timeout(120)
            if await pg.query_selector('[data-a="quicksim"]'):
                await pg.click('[data-a="quicksim"]'); await pg.click('[data-a="mfinish"]'); await pg.click('[data-a="iv"] >> nth=-1')
        print('date now', await pg.inner_text('.top .date'))
        await pg.click('nav [data-v="table"]')
        await pg.click('nav [data-v="squad"]')
        await pg.screenshot(path='shot_squad.png')
        await pg.set_viewport_size({'width':390,'height':844})
        await pg.click('nav [data-v="tactics"]')
        print('mobile scrollWidth', await pg.evaluate('document.documentElement.scrollWidth'))
        await pg.screenshot(path='shot_mobile.png')
        # old-save migration
        await pg.evaluate("(()=>{const s=JSON.parse(localStorage.getItem(SAVE_KEY)); delete s.staff; delete s.staffPool; delete s.train; for(const id in s.teams){const t=s.teams[id]; delete t.capt; delete t.vice; if(t.tac){delete t.tac.pr; delete t.tac.line; delete t.tac.trap;}} localStorage.setItem(SAVE_KEY, JSON.stringify(s));})()")
        await pg.reload(); await pg.wait_for_timeout(500)
        await pg.click('nav [data-v="tactics"]'); await pg.click('nav [data-v="staff"]'); print('migrated staff rows', len(await pg.query_selector_all('[data-a="hire"]')))
        print('band color', await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--band')"))
        print('ERRORS', errs[:10])
        await b.close()
asyncio.run(main())
