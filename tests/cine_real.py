# Cinematic intro: real three.js frames over time, the photo card (with a generated sample photo, never a real one),
# Skip, and the fallback when three.js cannot load. python3 tests/cine_real.py OUT_DIR [THREE_JS]
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1]); tj = pathlib.Path(sys.argv[2]).read_text() if len(sys.argv) > 2 else None
w = out / 'wrap_cine.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
SAMPLE = "()=>{const c=document.createElement('canvas');c.width=800;c.height=600;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,800,600);gr.addColorStop(0,'#2b5fa8');gr.addColorStop(1,'#f0b23a');g.fillStyle=gr;g.fillRect(0,0,800,600);g.fillStyle='#fff';g.font='bold 64px sans-serif';g.fillText('SAMPLE PHOTO',140,320);return idbSet('introPhoto',c.toDataURL('image/jpeg',.8)).then(()=>localStorage.setItem('gaffer.photoCap','Test caption'))}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']); errs = []
        if tj:
            for vw, vh in [(1280, 720), (390, 844)]:
                pg = await b.new_page(viewport={'width': vw, 'height': vh}); pg.on('pageerror', lambda e: errs.append(str(e)))
                await pg.route('**/three.min.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=tj))
                await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(200)
                await pg.evaluate(SAMPLE); await pg.reload(); t0 = await pg.evaluate("()=>performance.now()")
                for at, name in [(2.6, 'fly'), (7.2, 'walk'), (10.0, 'title'), (13.6, 'dribble'), (16.9, 'goal'), (21.5, 'celebrate'), (25.6, 'photo'), (29.0, 'final')]:
                    while (await pg.evaluate("()=>performance.now()")) - t0 < at * 1000: await pg.wait_for_timeout(100)
                    await pg.screenshot(path=str(out / f'cine_{name}_{vw}.png'))
                print(vw, 'cine card on', await pg.evaluate("()=>!!document.querySelector('.intro .ic-cine.on')"), '| after end:', end='')
                await pg.wait_for_timeout(3500)
                print(' ayep shown', await pg.evaluate("()=>!!document.querySelector('.intro .ic-ayep.on')"))
                await pg.close()
        # Skip during the cinematic, and fallback without three.js
        pg = await b.new_page(viewport={'width': 1280, 'height': 800}); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/three.min.js', lambda r: r.abort())
        await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(1200)
        print('fallback: cine skipped to', await pg.evaluate("()=>{const s=document.querySelector('.intro .ic.on');return s?s.className:'none'}"))
        await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(700)
        print('skip: intro gone', await pg.evaluate("()=>!document.querySelector('.intro')"))
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
