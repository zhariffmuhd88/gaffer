# Transfers > Player search: the "Would join you" filter, the "Loan listed" status, and the transfer outlook in the player pop-up. python3 tests/trsearch_browser.py OUT
import asyncio, pathlib
from playwright.async_api import async_playwright
import sys
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_tr.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in (1280, 390):
            pg = await b.new_page(viewport={'width': vw, 'height': 1000}); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(300)
            await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{UI.scr='transfers';UI.tab.tr='search';render();}"); await pg.wait_for_timeout(200)
            n0 = await pg.evaluate("()=>document.body.innerText.match(/(\\d+) players match/)?.[1]")
            await pg.select_option('#fst', 'loan'); await pg.wait_for_timeout(300)
            n1 = await pg.evaluate("()=>document.body.innerText.match(/(\\d+) players match/)?.[1]")
            await pg.select_option('#fst', ''); await pg.select_option('#fint', 'yes'); await pg.wait_for_timeout(300)
            n2 = await pg.evaluate("()=>document.body.innerText.match(/(\\d+) players match/)?.[1]")
            await pg.select_option('#fint', 'maybe'); await pg.wait_for_timeout(300)
            n3 = await pg.evaluate("()=>document.body.innerText.match(/(\\d+) players match/)?.[1]")
            ov = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1")
            await pg.screenshot(path=str(out/f'tr_{vw}.png'))
            pid = await pg.evaluate("()=>{const p=Object.values(G.players).find(p=>p.c==='MCI');playerModal(p.id);return [(UI.modal||'').includes('Transfer outlook'), (UI.modal||'').length]}")
            print(vw, 'all', n0, 'loan listed', n1, 'keen', n2, 'consider', n3, 'overflow', ov, 'outlook', pid)
            if not (int(n1) < int(n0) and int(n1) > 0 and int(n2) <= int(n3) and not ov and pid[0]): errs.append('filters ' + str([n0, n1, n2, n3, ov, pid]))
        print('errors', errs); await b.close()
        if errs: sys.exit(1)
asyncio.run(main())
