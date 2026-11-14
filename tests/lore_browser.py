# Browser check: player history, club lore, manager profile, WFF page, Behind the Badge episode, Ballon d'Or vote. python3 tests/lore_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_lore.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
SIM = """(until)=>{UI.modal=null;let g=0;while(G.date<until&&g++<9000){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}if(G.sacked){G.sacked=false;}}}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
            await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{UI.modal=null;docStart()}")
            await pg.evaluate(SIM, '2026-12-01')
            await pg.evaluate("()=>{const s=squad('ARS').find(p=>p.n==='Bukayo Saka')||squad('ARS')[0];playerModal(s.id)}"); await pg.wait_for_timeout(200)
            await pg.locator('text=Likes and dislikes').first.scroll_into_view_if_needed()
            await pg.screenshot(path=str(out / f'lore_player_{vw}.png'))
            await pg.evaluate("()=>{UI.modal=null;clubModal('ARS')}"); await pg.wait_for_timeout(200)
            await pg.locator('text=Club lore').first.scroll_into_view_if_needed()
            await pg.screenshot(path=str(out / f'lore_club_{vw}.png'))
            await pg.evaluate("()=>{UI.modal=null;clubModal('LIV')}"); await pg.wait_for_timeout(200)
            await pg.locator('[data-a="mgrp"]').first.click(); await pg.wait_for_timeout(200)
            print(vw, 'manager modal', (await pg.inner_text('.modal, .mc'))[:80].replace('\n', ' '))
            await pg.screenshot(path=str(out / f'lore_mgr_{vw}.png'))
            await pg.evaluate("()=>{UI.modal=null;UI.scr='wff';render()}"); await pg.wait_for_timeout(200)
            await pg.screenshot(path=str(out / f'lore_wff_{vw}.png'), full_page=True)
            n = await pg.evaluate("()=>(G.doc.eps||[]).length")
            if n: await pg.evaluate("()=>{ACT.docep(0)}"); await pg.wait_for_timeout(200); await pg.screenshot(path=str(out / f'lore_doc_{vw}.png'))
            await pg.evaluate("()=>{UI.modal=null;bdoShortlist();ACT.bdov()}"); await pg.wait_for_timeout(200)
            for i in range(5):
                await pg.locator(f'[data-a="bdop"][data-k="{i}"]').nth(i).click(); await pg.wait_for_timeout(80)
            await pg.click('[data-a="bdos"]'); await pg.wait_for_timeout(150)
            print(vw, 'episodes', n, '| vote', await pg.evaluate("()=>G.bdo.uv&&G.bdo.uv.map(id=>P(id).n).join(', ')"), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.screenshot(path=str(out / f'lore_bdo_{vw}.png'))
            await pg.close()
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
