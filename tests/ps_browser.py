# Browser check: Fixtures > Pre-season (arrange, assistant, Asia Tour), Arsenal Legends live, penalty foul inside the box. python3 tests/ps_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
w = out / 'wrap_ps.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for vw in [1280, 390]:
            pg = await b.new_page(viewport={'width': vw, 'height': 900})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
            await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(500)
            await pg.click('[data-v="LIV"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{UI.scr='fixtures';UI.tab.fx='mine';render()}"); await pg.wait_for_timeout(200)
            await pg.select_option('#pso', 'BAR'); await pg.click('[data-a="psok"]'); await pg.wait_for_timeout(200)
            await pg.click('.pstour[value="SEL"]'); await pg.click('.pstour[value="HKG"]'); await pg.click('[data-a="pstour"]'); await pg.wait_for_timeout(200)
            await pg.click('[data-a="psasst"]'); await pg.wait_for_timeout(200)
            print(vw, 'friendlies:', await pg.evaluate("()=>psList().map(f=>dShort(f.d)+' '+tName(f.h===G.user?f.a:f.h)).join(' | ')"), '| overflow', await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1"))
            await pg.screenshot(path=str(out / f'ps_fx_{vw}.png'), full_page=False)
            # penalty: plan with a foul and a pen in the same minute
            pl = await pg.evaluate("""()=>{const fid=psList()[0].id; startLive(fid);const LM=UI.match;LM.run=false;clearTimeout(LM.timer);const M=LM.M;
               const s=0, e=M.sides[0].ps.find(x=>x.role==='FC'), d=M.sides[1].ps.find(x=>x.role==='DC');
               const evs=[{t:'foul',side:1,e:d,card:null},{t:'shot',side:0,type:'pen',e,pv:e,def:d,r:'goal',st:'pen'}];
               const plan=buildPlan(LM,LM.vis.live,evs,0).plan;return plan.map(st=>st.k+(st.place?'@'+st.place.x.toFixed(2):'')+(st.txt?'('+st.txt+')':'')).join(' > ')}""")
            print(vw, 'pen plan:', pl)
            await pg.evaluate("()=>{UI.match=null;UI.scr='finance';render()}"); await pg.wait_for_timeout(150)
            await pg.close()
        print('errors', errs[:6])
        await b.close()
asyncio.run(main())
