# Shared helper for tests that need a real three.js r128 (tests/vendor/three.min.js, MIT licence) and WebGL (SwiftShader).
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
TJ = (ROOT / 'tests/vendor/three.min.js').read_text()
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
def wrap(out, name='wrap_r3.html'):
    w = pathlib.Path(out) / name
    w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + (ROOT / 'gaffer.html').read_text() + '</body></html>')
    return w
async def open_match(p, out, vw=1280, vh=900, club='ARS', three=True, view3d=True, errs=None):
    b = await p.chromium.launch(args=ARGS)
    pg = await b.new_page(viewport={'width': vw, 'height': vh}, accept_downloads=True)
    if errs is not None:
        pg.on('pageerror', lambda e: errs.append(str(e)))
    if three: await pg.route('**/three.min.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=TJ))
    else: await pg.route('**/three.min.js', lambda r: r.abort())
    await pg.goto('file://' + str(wrap(out).resolve())); await pg.wait_for_timeout(300)
    await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(300)
    await pg.click(f'[data-v="{club}"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
    await pg.evaluate("()=>{try{localStorage.setItem('gaffer.lineups','0')}catch(e){};let g=0;while(!userFixtureOn(G.date)&&g++<60){const r=advance();if(r.type==='match')break;}startLive(userFixtureOn(G.date).id);}"); await pg.wait_for_timeout(500)
    await pg.evaluate("()=>{try{lineupClose()}catch(e){}}")
    if view3d:
        await pg.evaluate("()=>ACT.mview('3d')"); await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{const S3=UI.match.v3s;if(S3)S3.flyDone=true;}"); await pg.wait_for_timeout(600)
    return b, pg
async def canvas_shot(pg, path, sel='canvas.p3d'):
    clip = await pg.evaluate("(s)=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height}}", sel)
    await pg.screenshot(path=str(path), clip=clip, full_page=True)
