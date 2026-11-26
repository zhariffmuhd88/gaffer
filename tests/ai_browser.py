# AI clubs list surplus players and have players who want to leave. Run from repo root after build.py: python3 tests/ai_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright

out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.'); out.mkdir(parents=True, exist_ok=True)
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_ai.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>')
BAD = []
def check(tag, ok, msg):
    print(tag, 'ok  ' if ok else 'FAIL', msg)
    if not ok: BAD.append(tag + ' ' + msg)

SIM = """(until)=>{UI.modal=null;let g=0;while(G.date<until&&g++<4000){const r=advance();if(r.type==='match'){const f=G.fx[r.fid];const pre=preMatch(f);const M=createMatch(r.fid,false);simulateFull(M);finalizeMatch(M);postMatch(f,pre);finishDay();}if(r.type==='offer'){for(const o of offersDue())respondOffer(o.id,false)}}}"""

async def run(p, vw, tag):
    b = await p.chromium.launch(); pg = await b.new_page(viewport=vw)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(600)
    await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(200)
    # transfer search, Premier League, transfer listed
    await pg.evaluate("()=>{UI.modal=null;UI.scr='transfers';UI.tab.tr='search';Object.assign(UI.filt,{lg:'PL',st:'listed'});render()}"); await pg.wait_for_timeout(150)
    n = await pg.evaluate("()=>{const m=(document.querySelector('main').innerText.match(/(\\d+) players match/)||[])[1];return +m||0}")
    check(tag, n >= 15, f'Premier League players on the transfer list: {n}')
    await pg.screenshot(path=str(out / f'ai_listed_{tag}.png'))
    await pg.evaluate("()=>{UI.filt.st='req';render()}"); await pg.wait_for_timeout(150)
    n2 = await pg.evaluate("()=>{const m=(document.querySelector('main').innerText.match(/(\\d+) players match/)||[])[1];return +m||0}")
    check(tag, n2 >= 4, f'Premier League players who want to leave: {n2}')
    r = await pg.evaluate("()=>{const L=Object.values(G.players).filter(p=>p.c&&p.c!==G.user&&p.listed&&divOf(p.c)==='PL');const Rq=Object.values(G.players).filter(p=>p.req&&p.c!==G.user&&divOf(p.c)==='PL');return {keyL:L.filter(p=>importance(p)==='key').length,young:L.filter(p=>p.age<=19).length,elite:Rq.filter(p=>T(p.c).rep>=86&&importance(p)==='key').length,perClub:Math.max(...fullTeams().map(t=>squad(t).filter(p=>p.listed&&p.c!==G.user).length))}}")
    check(tag, r['keyL'] == 0 and r['young'] == 0 and r['elite'] == 0 and r['perClub'] <= 5, 'sensible choices (no key players or teenagers listed, no stars at elite clubs asking out) ' + str(r))
    # player view shows the status, and the price is lower
    r = await pg.evaluate("()=>{const p=Object.values(G.players).find(p=>p.req&&p.aiR&&p.c!==G.user&&divOf(p.c)==='PL');p.aiR=false;const a0=askingPrice(p);p.aiR=true;const a1=askingPrice(p);playerModal(p.id);return {a0,a1,stat:!!document.querySelector('.modal .aistat'),txt:(document.querySelector('.modal .aistat')||{}).innerText||''}}")
    check(tag, r['stat'] and r['a1'] < r['a0'] and 'Wants to leave' in r['txt'], 'player view shows Wants to leave and the club asks less ' + str(r)[:160])
    await pg.screenshot(path=str(out / f'ai_player_{tag}.png'))
    await pg.evaluate("()=>{UI.modal=null;render()}")
    if tag == 'desk':
        # through the window: lists stay populated, some listed players are sold, flags clear on a move
        r0 = await pg.evaluate("()=>Object.values(G.players).filter(p=>p.aiL||p.aiR).map(p=>p.id+'|'+p.c)")
        await pg.evaluate(SIM, '2026-10-15')
        r = await pg.evaluate("(ids)=>{let moved=0,stale=0;for(const s of ids){const [id,c]=s.split('|');const p=P(id);if(p&&p.c!==c){moved++;if((p.aiL||p.aiR)&&p.aiClub!==p.c)stale++;}}const all=Object.values(G.players).filter(p=>p.c&&p.c!==G.user);return {moved,stale,L:all.filter(p=>p.listed).length,R:all.filter(p=>p.req).length}}", r0)
        check(tag, r['moved'] >= 5 and r['stale'] == 0 and r['L'] >= 100 and r['R'] >= 20, 'after the summer: listed players sold, lists refreshed ' + str(r))
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
