# Holiday: the assistant runs the club for a set period. Run from repo root after build.py: python3 tests/hol_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright

out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.'); out.mkdir(parents=True, exist_ok=True)
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_hol.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>')
BAD = []
def check(tag, ok, msg):
    print(tag, 'ok  ' if ok else 'FAIL', msg)
    if not ok: BAD.append(tag + ' ' + msg)

async def wait_back(pg, secs=240):
    for _ in range(secs * 4):
        if await pg.evaluate("()=>!G.holiday&&!!(UI.modal&&UI.modal.includes('Back from holiday'))"): return True
        await pg.wait_for_timeout(250)
    return False

async def run(p, vw, tag):
    b = await p.chromium.launch(); pg = await b.new_page(viewport=vw)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(600)
    await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(200)
    # a one-week holiday in July, window open: an offer below his value is rejected, one above it is accepted
    await pg.evaluate("()=>{UI.modal=null;render()}")
    ids = await pg.evaluate("()=>{const mk=(k,m)=>{const p=squad(G.user).sort((a,b)=>a.ca-b.ca)[k];const o={id:'o'+(++G.newsId),pid:p.id,from:G.user,fee:Math.max(.1,Math.round(calcValue(p)*m*10)/10),st:'incoming',d:addDays(G.date,-3),abroad:true,buyer:'Test FC'};G.offers.push(o);return [o.id,p.id]};return [mk(3,.5),mk(4,1.3)]}")
    await pg.click('#holbtn'); await pg.wait_for_timeout(100)
    await pg.select_option('[data-hol="offers"]', 'value')
    await pg.click('[data-a="holset"][data-v="7"]'); await pg.wait_for_timeout(100)
    await pg.click('[data-a="holgo"]')
    await wait_back(pg, 60)
    r = await pg.evaluate(f"()=>({{a:G.offers.find(o=>o.id==='{ids[0][0]}').st,b:G.offers.find(o=>o.id==='{ids[1][0]}').st,sold:P('{ids[1][1]}').c!==G.user,why:G.holLast.why}})")
    check(tag, r['a'] == 'rejected' and r['b'] == 'done' and r['sold'], 'assistant answers offers by your rule ' + str(r))
    await pg.click('[data-a="holdone"]'); await pg.wait_for_timeout(100)
    # start the holiday in mid-September, when the season is under way
    await pg.evaluate("()=>{UI.modal=null;let g=0;while(G.date<'2026-09-12'&&g++<3000){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}if(r.type==='offer'){for(const o of offersDue())respondOffer(o.id,false)}}G.offers.forEach(o=>{if(o.st==='incoming')o.st='rejected'});render()}")
    check(tag, await pg.query_selector('#holbtn') is not None, 'Holiday button next to Continue')
    ov = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+2")
    check(tag, not ov, 'header still fits')
    await pg.click('#holbtn'); await pg.wait_for_timeout(150)
    n = await pg.evaluate("()=>document.querySelectorAll('[data-a=\"holset\"]').length")
    check(tag, n >= 4, f'period presets ({n})')
    # pick a custom date through the date field: 40 days, covering several matches
    until = await pg.evaluate("()=>addDays(G.date,40)")
    await pg.fill('[data-hol="date"]', until); await pg.wait_for_timeout(150)
    r = await pg.evaluate("()=>({u:UI.hol.until,txt:document.querySelector('.hol').innerText})")
    check(tag, r['u'] == until and 'match' in r['txt'], 'custom return date ' + r['u'])
    await pg.screenshot(path=str(out / f'hol_setup_{tag}.png'))
    d0 = await pg.evaluate("()=>G.date")
    await pg.click('[data-a="holgo"]'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=str(out / f'hol_run_{tag}.png'))
    back = await wait_back(pg)
    r = await pg.evaluate(f"()=>({{date:G.date,why:G.holLast&&G.holLast.why,rec:G.holLast,played:Object.values(G.fx).filter(f=>f.r&&(f.h===G.user||f.a===G.user)&&f.d>='{d0}').length,inbox:G.news.some(n=>n.title==='Back from holiday'),unplayed:Object.values(G.fx).filter(f=>!f.r&&(f.h===G.user||f.a===G.user)&&f.d<G.date).length}})")
    check(tag, back and r['why'] in ('done', 'big', 'job') and r['played'] >= 3 and r['unplayed'] == 0, 'holiday runs to the end and the assistant plays the matches ' + str(r)[:220])
    check(tag, r['inbox'], 'report in the inbox')
    if r['why'] == 'done': check(tag, r['date'] == until, f'back on the chosen day {r["date"]}')
    await pg.screenshot(path=str(out / f'hol_back_{tag}.png'))
    await pg.click('[data-a="holdone"]'); await pg.wait_for_timeout(150)
    # come back early
    await pg.evaluate("()=>{UI.modal=null;render()}")
    await pg.click('#holbtn'); await pg.wait_for_timeout(100)
    await pg.click('[data-a="holset"][data-v="end"]'); await pg.wait_for_timeout(100)
    await pg.click('[data-a="holgo"]'); await pg.wait_for_timeout(400)
    await pg.click('[data-a="holstop"]')
    back = await wait_back(pg, 60)
    r = await pg.evaluate("()=>({why:G.holLast&&G.holLast.why,date:G.date,end:holMax()})")
    check(tag, back and r['date'] < r['end'], 'Come back now stops the holiday ' + str(r))
    ov = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+2")
    check(tag, not ov, 'no horizontal overflow')
    check(tag, not errs, 'errors ' + str(errs[:3]))
    await b.close()

async def main():
    async with async_playwright() as p:
        await run(p, {'width': 1280, 'height': 900}, 'desk')
        await run(p, {'width': 390, 'height': 844}, 'phone')
    print('FAIL' if BAD else 'ALL OK', BAD)
    sys.exit(1 if BAD else 0)
asyncio.run(main())
