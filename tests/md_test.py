import asyncio, pathlib
from playwright.async_api import async_playwright
html=pathlib.Path('gaffer.html').read_text()
pathlib.Path('wrap.html').write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+html+'</body></html>')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1280,'height':1000})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append('c:'+m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
        await pg.goto('file://'+str(pathlib.Path('wrap.html').resolve())); await pg.wait_for_timeout(500)
        await pg.screenshot(path='md_start.png'); await pg.click('[data-v="LIV"]'); await pg.click('[data-a="start"]'); await pg.click('nav [data-v="club"]'); await pg.screenshot(path='md_club.png')
        for i in range(8):
            await pg.click('#go'); await pg.wait_for_timeout(250)
            if await pg.query_selector('[data-a="kickoff"]'): break
        await pg.screenshot(path='md_pre.png', full_page=True)
        await pg.click('[data-a="kickoff"]'); await pg.click('[data-a="mspeed"][data-v="2"]')
        await pg.evaluate("(()=>{const M=UI.match.M; const S=M.sides[uSide(M)]; S.ps.forEach(e=>{e.p.ca=97}); units(S); S.u.att*=1.6;})()")
        # run until a goal replay or 60s
        got=False
        for i in range(160):
            await pg.wait_for_timeout(500)
            st=await pg.evaluate("(()=>{const LM=UI.match; if(!LM) return null; const V=LM.vis; return {min:LM.M.min, rp:!!(V&&V.rp), reps:LM.replays.length, done:LM.M.done, run:LM.run, panel:LM.panel}})()")
            if st and st['rp'] and not got:
                await pg.wait_for_timeout(1500); await pg.screenshot(path='md_replay.png'); got=True
            if st and st['panel']=='talk':
                await pg.click('[data-a="talk"] >> nth=0'); await pg.click('[data-a="mrun"]')
            elif st and not st['run'] and not st['done']:
                await pg.click('[data-a="mrun"]')
            if st and st['min']>=30 and i%40==0: await pg.screenshot(path='md_live.png')
            if st and st['done']: break
        print('state', st, 'replay seen', got)
        if await pg.query_selector('[data-a="mshout"]:not([disabled])'): await pg.click('[data-a="mshout"] >> nth=0')
        await pg.click('[data-a="mrtab"][data-v="scores"]'); await pg.screenshot(path='md_scores.png')
        if await pg.query_selector('[data-a="mrtab"][data-v="table"]'): await pg.click('[data-a="mrtab"][data-v="table"]')
        if await pg.query_selector('[data-a="mcam"][data-v="follow"]'): await pg.click('[data-a="mcam"][data-v="follow"]'); await pg.wait_for_timeout(800); await pg.screenshot(path='md_follow.png')
        if await pg.query_selector('[data-a="mskip"]'): await pg.click('[data-a="mskip"]')
        await pg.wait_for_timeout(1500)
        if await pg.query_selector('[data-a="mptab"][data-v="heat"]'):
            await pg.click('[data-a="mptab"][data-v="heat"]'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='md_post.png', full_page=True)
        await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(400)
        print('after', (await pg.inner_text('.top'))[:100].replace('\n',' | '))
        await pg.set_viewport_size({'width':390,'height':844})
        await pg.click('[data-a="iv"] >> nth=0') if await pg.query_selector('[data-a="iv"]') else None
        for i in range(8):
            await pg.click('#go'); await pg.wait_for_timeout(250)
            if await pg.query_selector('[data-a="kickoff"]'): break
        await pg.click('[data-a="kickoff"]'); await pg.wait_for_timeout(5000)
        print('mobile sw', await pg.evaluate('document.documentElement.scrollWidth'))
        await pg.screenshot(path='md_mobile.png')
        print('ERR', errs[:8]); await b.close()
asyncio.run(main())
