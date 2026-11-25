# Offers for your players must be answered before they run out. Run from repo root after build.py: python3 tests/offer_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright

out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.'); out.mkdir(parents=True, exist_ok=True)
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_offer.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>')
BAD = []
def check(tag, ok, msg):
    print(tag, 'ok  ' if ok else 'FAIL', msg)
    if not ok: BAD.append(tag + ' ' + msg)

ADD = """(k)=>{const p=squad(G.user).filter(x=>!x.loan&&!G.offers.some(o=>o.pid===x.id&&o.st==='incoming')).sort((a,b)=>a.ca-b.ca)[k];const o={id:'o'+(++G.newsId),pid:p.id,from:G.user,fee:5,st:'incoming',d:G.date,abroad:true,buyer:'Test FC'};G.offers.push(o);msg('Offer for '+p.n,'Test FC have made an offer.',{k:'incoming',o:o.id});return {id:o.id,by:offerReplyBy(o),pid:p.id}}"""

async def step(pg):
    # one press of Continue, playing any match that comes up with the quick sim
    await pg.click('#go'); await pg.wait_for_timeout(120)
    if await pg.query_selector('[data-a="quicksim"]'):
        await pg.click('[data-a="quicksim"]'); await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(120)
        for _ in range(3):
            b = await pg.query_selector_all('[data-a^="iv"]')
            if not b: break
            await b[-1].click(); await pg.wait_for_timeout(100)

async def run(p, vw, tag):
    b = await p.chromium.launch(); pg = await b.new_page(viewport=vw)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(600)
    await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(200)
    await pg.evaluate("()=>{UI.modal=null;render()}")
    # no random offers during the test, so only ours are in play
    await pg.evaluate("()=>{const _t=transferAI;transferAI=function(){const c=R.chance;R.chance=(x)=>x===0.22?false:c(x);try{return _t.apply(this,arguments)}finally{R.chance=c}};}")
    o = await pg.evaluate(ADD, 0)
    inbox = await pg.evaluate(f"()=>{{const m=G.news.find(n=>n.act&&n.act.o==='{o['id']}');return msgActions(m)}}")
    check(tag, 'Reply by' in inbox, 'inbox message shows the reply-by date')
    for i in range(30):
        if await pg.evaluate("()=>!!(UI.modal&&UI.modal.includes('class=\"offdue\"'))"): break
        await step(pg)
    st = await pg.evaluate(f"()=>({{date:G.date,st:G.offers.find(x=>x.id==='{o['id']}').st,modal:!!(UI.modal&&UI.modal.includes('class=\"offdue\"'))}})")
    check(tag, st['modal'] and st['date'] == o['by'] and st['st'] == 'incoming', f"game stops on the reply-by day {o['by']} with the offer open " + str(st))
    await pg.screenshot(path=str(out / f'offer_due_{tag}.png'))
    # cannot get past it: Continue, tapping outside, Escape
    d0 = st['date']
    await pg.evaluate("()=>onContinue()"); await pg.wait_for_timeout(200)
    await pg.mouse.click(3, vw['height'] - 3); await pg.wait_for_timeout(100)
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
    st = await pg.evaluate("()=>({date:G.date,modal:!!(UI.modal&&UI.modal.includes('class=\"offdue\"'))})")
    check(tag, st['modal'] and st['date'] == d0, 'Continue, tapping outside and Escape do not skip it ' + str(st))
    # navigating away and pressing Continue brings it back
    await pg.evaluate("()=>{UI.modal=null;UI.scr='squad';render()}")
    await pg.evaluate("()=>onContinue()"); await pg.wait_for_timeout(200)
    st = await pg.evaluate("()=>({date:G.date,modal:!!(UI.modal&&UI.modal.includes('class=\"offdue\"'))})")
    check(tag, st['modal'] and st['date'] == d0, 'Continue reopens it after leaving ' + str(st))
    # reject: the window closes and the game moves on
    await pg.click(f'[data-a="offdR"][data-v="{o["id"]}"]'); await pg.wait_for_timeout(150)
    st = await pg.evaluate(f"()=>({{st:G.offers.find(x=>x.id==='{o['id']}').st,modal:!!UI.modal}})")
    check(tag, st['st'] == 'rejected' and not st['modal'], 'reject closes it ' + str(st))
    await step(pg)
    check(tag, await pg.evaluate(f"()=>G.date>'{d0}'"), 'the game moves on after the answer')
    # two offers due together; accept one, the other stays until answered
    await pg.evaluate("()=>G.offers.forEach(o=>{if(o.st==='incoming')o.st='rejected'})")  # offers from transfer rumours
    o1 = await pg.evaluate(ADD, 1); o2 = await pg.evaluate(ADD, 2)
    await pg.evaluate(f"()=>{{for(const id of ['{o1['id']}','{o2['id']}'])G.offers.find(x=>x.id===id).d=addDays(G.date,-6);}}")
    await pg.evaluate("()=>onContinue()"); await pg.wait_for_timeout(200)
    n = await pg.evaluate("()=>document.querySelectorAll('.offdue-it').length")
    check(tag, n == 2, f'both due offers listed ({n})')
    await pg.click(f'[data-a="offdA"][data-v="{o1["id"]}"]'); await pg.wait_for_timeout(150)
    st = await pg.evaluate(f"()=>({{c:P('{o1['pid']}').c,n:document.querySelectorAll('.offdue-it').length,modal:!!(UI.modal&&UI.modal.includes('class=\"offdue\"'))}})")
    check(tag, st['c'] != 'ARS' and st['n'] == 1 and st['modal'], 'accept sells him, the other offer still needs an answer ' + str(st))
    await pg.screenshot(path=str(out / f'offer_two_{tag}.png'))
    await pg.click(f'[data-a="offdC"][data-v="{o2["id"]}"]'); await pg.wait_for_timeout(150)
    st = await pg.evaluate(f"()=>({{st:G.offers.find(x=>x.id==='{o2['id']}').st,modal:!!UI.modal}})")
    check(tag, st['st'] in ('done', 'rejected') and not st['modal'], 'counter answers the last one ' + str(st))
    # an offer that arrives the day before the window closes is due at once
    r = await pg.evaluate(ADD.replace("return {id", "const wc=G.tasks.filter(t=>t.t==='winClose'&&t.d>G.date).map(t=>t.d).sort()[0];o.d=addDays(wc,-1);return {wc,exp:addDays(wc,-1),id"), 3)
    check(tag, r['by'] == r['exp'], 'reply-by is the day before the window closes ' + str(r))
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
