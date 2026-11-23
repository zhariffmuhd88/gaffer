# Browser check for the 3D view wiring. The sandbox cannot download three.js, so the cdnjs request is answered with a
# stand-in THREE (a catch-all proxy) that records render calls: this checks the toggle, the camera buttons, the
# per-frame update and the fallback, not the picture. python3 tests/md3d_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_3d.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
MOCK = r"""
(function(){ window.__r3 = 0;
 const mk = () => { const f = function(){}; return new Proxy(f, { get(t, k) { if (k === Symbol.toPrimitive) return () => 0; if (k === 'then') return undefined; if (!(k in t)) t[k] = mk(); return t[k]; }, set(t, k, v) { t[k] = v; return true; }, apply() { return mk(); }, construct(t, a) { return mk(); } }); };
 const T = mk();
 T.WebGLRenderer = function(){ const c = document.createElement('canvas'); return { domElement: c, setPixelRatio(){}, setSize(w,h){ c.width=w; c.height=h; c.style.width=w+'px'; c.style.height=h+'px'; }, render(){ window.__r3++; }, shadowMap: {} }; };
 window.THREE = T; })();
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/three.min.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=MOCK))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(300)
            await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{let g=0;while(!userFixtureOn(G.date)&&g++<60){const r=advance();if(r.type==='match')break;}startLive(userFixtureOn(G.date).id);}"); await pg.wait_for_timeout(300)
            print(vw, '3D button', await pg.locator('[data-a="mview"][data-v="3d"]').count())
            await pg.click('[data-a="mview"][data-v="3d"]'); await pg.wait_for_timeout(800)
            r1 = await pg.evaluate("()=>window.__r3"); await pg.click('[data-a="mrun"]'); await pg.wait_for_timeout(2500)
            r2 = await pg.evaluate("()=>window.__r3")
            st = await pg.evaluate("()=>({v3:UI.match.v3, canvas:!!document.querySelector('#p2dwrap canvas.p3d'), cv2hidden:UI.match.vis.cv.style.display==='none', figs:UI.match.v3s?UI.match.v3s.figs.size:0, cams:document.querySelectorAll('[data-a=\"m3cam\"]').length})")
            print(vw, 'renders', r1, '->', r2, st)
            p3 = await pg.evaluate("()=>{const S3=UI.match.v3s;return {bug:(document.querySelector('#p2dwrap .sb3d')||{}).textContent||'', refs:S3.refs?S3.refs.length:0, mgrs:S3.mgrs?S3.mgrs.length:0, board:!!S3.subBoard, nets:(S3.nets||[]).length, banner:!!document.querySelector('#p2dwrap .gb3d')}}")
            print(vw, 'phase3', p3)
            # phase 4: atmosphere pieces, the player cam, drag to orbit
            p4 = await pg.evaluate("()=>{const S3=UI.match.v3s;return {flags:(S3.flags3||[]).length, crowd:(S3.crowd||[]).length, flares:(S3.flares||[]).length, playerBtn:!!document.querySelector('[data-a=\"m3cam\"][data-v=\"player\"]')}}")
            await pg.click('[data-a="m3cam"][data-v="player"]'); await pg.wait_for_timeout(400)
            pick = await pg.evaluate("()=>!!document.querySelector('select[data-m3pl]')")
            await pg.evaluate("()=>{const el=UI.match.v3s.ren.domElement;const ev=(t,x)=>el.dispatchEvent(new PointerEvent(t,{pointerId:1,clientX:x,clientY:100,bubbles:true}));ev('pointerdown',100);ev('pointermove',140);ev('pointermove',180);ev('pointerup',180);}")
            await pg.wait_for_timeout(200)
            free = await pg.evaluate("()=>!!UI.match.v3s.free")
            await pg.click('[data-a="m3cam"][data-v="tv"]'); await pg.wait_for_timeout(200)
            print(vw, 'phase4', p4, 'picker', pick, 'drag', free)
            # phase 5: appearance editor saves to G; line-up graphic opens from the button
            pid = await pg.evaluate("()=>{const e=UI.match.M.sides.find(x=>x.tid===G.user).ps[3];const d=document.createElement('div');d.id='lookT';d.innerHTML=lookEditorHtml(e.p);document.body.appendChild(d);d.querySelector('details').open=true;return e.p.id}"); await pg.wait_for_timeout(200)
            await pg.select_option('select[data-look="hair"]', 'dreads'); await pg.wait_for_timeout(200)
            await pg.select_option('select[data-look="skin"]', '9'); await pg.wait_for_timeout(200)
            look = await pg.evaluate(f"()=>JSON.stringify(P('{pid}').look||null)")
            await pg.evaluate("()=>{const d=document.getElementById('lookT');if(d)d.remove();}")
            await pg.evaluate("()=>ACT.luopen()"); await pg.wait_for_timeout(200)
            lu = await pg.evaluate("()=>[!!document.querySelector('#luov.on'), document.querySelectorAll('#luov .luP').length]")
            await pg.evaluate("()=>lineupClose()")
            print(vw, 'phase5 look', look, 'lineup', lu)
            if '"hair":"dreads"' not in look or '"skin":9' not in look or not lu[0] or lu[1] != 11: errs.append('phase 5: ' + look + str(lu))
            if not (p4['flags'] >= 6 and p4['crowd'] >= 1 and p4['flares'] >= 3 and p4['playerBtn'] and pick and free): errs.append('phase 4 pieces missing: ' + str(p4) + str([pick, free]))
            if not (p3['bug'] and p3['refs'] == 3 and p3['mgrs'] == 2 and p3['board'] and p3['banner']): errs.append('phase 3 pieces missing: ' + str(p3))
            await pg.click('[data-a="m3cam"][data-v="behind"]'); await pg.wait_for_timeout(200)
            await pg.click('[data-a="mview"][data-v="2d"]'); await pg.wait_for_timeout(200)
            print(vw, 'back to 2D: cv shown', await pg.evaluate("()=>UI.match.vis.cv.style.display!=='none' && !UI.match.v3"), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.close()
        # fallback when three.js cannot load
        pg = await b.new_page(viewport={'width': 1280, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/three.min.js', lambda r: r.abort())
        await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
        await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(300)
        await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{let g=0;while(!userFixtureOn(G.date)&&g++<60){const r=advance();if(r.type==='match')break;}startLive(userFixtureOn(G.date).id);}"); await pg.wait_for_timeout(300)
        await pg.click('[data-a="mview"][data-v="3d"]'); await pg.wait_for_timeout(800)
        print('fallback: v3', await pg.evaluate("()=>UI.match.v3"), '| 2D visible', await pg.evaluate("()=>UI.match.vis.cv.style.display!=='none'"))
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
