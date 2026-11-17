# Club badge upload: a generated test image (not a real logo) is uploaded on Club > Overview, shown in place of the
# colour swatch, kept on this device across a reload, and never written into the save. python3 tests/badge_browser.py OUT
import asyncio, pathlib, sys, base64
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_badge.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
# a plain generated shield (purple and gold, a star): an invented test image
SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="240"><path d="M100 5 L195 40 L180 160 Q150 215 100 235 Q50 215 20 160 L5 40 Z" fill="#5b2a86" stroke="#f2c230" stroke-width="10"/><polygon points="100,60 115,105 162,105 124,132 138,178 100,150 62,178 76,132 38,105 85,105" fill="#f2c230"/></svg>'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        ctx = await b.new_context(viewport={'width': 390, 'height': 900})
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
        await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(300)
        await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(400)
        png = await pg.evaluate("""async (svg)=>{const im=new Image();await new Promise(r=>{im.onload=r;im.src='data:image/svg+xml;base64,'+btoa(svg)});const c=document.createElement('canvas');c.width=200;c.height=240;c.getContext('2d').drawImage(im,0,0);return c.toDataURL('image/png').split(',')[1]}""", SVG)
        (out / 'test_badge.png').write_bytes(base64.b64decode(png))
        await pg.evaluate("()=>{UI.scr='club';UI.tab.club='ov';render();}"); await pg.wait_for_timeout(200)
        await pg.set_input_files('.badgeFile', str(out / 'test_badge.png')); await pg.wait_for_timeout(1200)
        n = await pg.evaluate("()=>document.querySelectorAll('img.badge.bimg').length")
        # another club (the friendly opponent Arsenal Legends) from its pop-up
        await pg.evaluate("()=>{clubModal('ARL');}"); await pg.wait_for_timeout(200)
        await pg.set_input_files('.modal .badgeFile, .badgebox .badgeFile', str(out / 'test_badge.png')); await pg.wait_for_timeout(1200)
        arl = await pg.evaluate("()=>!!BADGES.ARL && !!document.querySelector('.badgebox img')")
        print('Arsenal Legends badge', arl)
        if not arl: errs.append('ARL badge missing')
        await pg.evaluate("()=>{UI.modal=null;render();}")
        await pg.evaluate("()=>{UI.scr='table';render();}"); await pg.wait_for_timeout(200)
        n2 = await pg.evaluate("()=>document.querySelectorAll('img.badge.bimg').length")
        await pg.screenshot(path=str(out / 'badge_table_390.png'))
        insave = await pg.evaluate("()=>{autosave&&autosave();return JSON.stringify(G).includes('data:image')||JSON.stringify(G).includes('blob:')}")
        ov = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1")
        await pg.reload(); await pg.wait_for_timeout(600)
        try: await pg.click('.intro .ic-skip', timeout=2000)
        except Exception: pass
        await pg.wait_for_timeout(800)
        kept = await pg.evaluate("()=>!!BADGES[G.user]")
        await pg.evaluate("()=>{UI.scr='club';UI.tab.club='ov';render();}"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=str(out / 'badge_club_390.png'), full_page=False)
        await pg.click('[data-a="badgedel"]'); await pg.wait_for_timeout(500)
        gone = await pg.evaluate("()=>!BADGES[G.user]&&!document.querySelector('img.badge.bimg')")
        print('club page imgs', n, '| table imgs', n2, '| in save', insave, '| overflow', ov, '| kept after reload', kept, '| removed', gone)
        ok = n >= 1 and n2 >= 1 and not insave and not ov and kept and gone
        print('errors', errs[:5]); print('BADGE', 'OK' if ok and not errs else 'FAIL')
        await b.close()
        if not ok or errs: sys.exit(1)
asyncio.run(main())
