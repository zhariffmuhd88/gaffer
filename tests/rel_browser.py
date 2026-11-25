# Relationships with managers and players at other clubs. Run from repo root after build.py: python3 tests/rel_browser.py OUT_DIR
import asyncio, pathlib, sys
from playwright.async_api import async_playwright

out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.'); out.mkdir(parents=True, exist_ok=True)
html = pathlib.Path('gaffer.html').read_text()
w = out / 'wrap_rel.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>')
BAD = []
def check(tag, ok, msg):
    print(tag, 'ok  ' if ok else 'FAIL', msg)
    if not ok: BAD.append(tag + ' ' + msg)

async def run(p, vw, tag):
    b = await p.chromium.launch(); pg = await b.new_page(viewport=vw)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(600)
    await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(200)
    await pg.evaluate("()=>{UI.modal=null;UI.scr='rel';render()}"); await pg.wait_for_timeout(150)
    n = await pg.evaluate("()=>document.querySelectorAll('.relt tbody tr').length")
    check(tag, n >= 15, f'relationships screen lists league managers ({n})')
    check(tag, await pg.evaluate("()=>!!document.querySelector('[data-a=\"nav\"][data-v=\"rel\"]')"), 'nav item')
    # message the first manager from the screen
    r = await pg.evaluate("""()=>{const b=document.querySelector('.relt [data-a="relm"][data-k="msg"]');const tid=b.dataset.v;b.click();return {tid,v:relM(tid),dis:!!document.querySelector('.relt [data-a="relm"][data-k="msg"][data-v="'+tid+'"][disabled]'),log:G.rel.log.length}}""")
    check(tag, r['v'] > 0 and r['dis'] and r['log'] == 1, 'message raises relationship and sets a cooldown ' + str(r))
    # dig at another manager: negative, in the papers
    r = await pg.evaluate("""()=>{const t=fullTeams().filter(x=>relClubOk(x)&&divOf(x)==='PL')[3];const n0=G.news.length;relMgrAct(t,'dig');return {v:relM(t),news:G.news.length>n0}}""")
    check(tag, r['v'] < 0 and r['news'], 'dig lowers relationship and makes news ' + str(r))
    # transfer effects
    r = await pg.evaluate("""()=>{const t=fullTeams().filter(x=>relClubOk(x)&&divOf(x)==='PL')[5];const p=squad(t).sort((a,b)=>b.ca-a.ca)[2];const m=mgrKey(t);
      G.rel.m[m]=0;const a0=askingPrice(p);G.rel.m[m]=100;const a1=askingPrice(p);G.rel.m[m]=-100;const a2=askingPrice(p);G.rel.m[m]=0;
      const q=Object.values(G.players).find(x=>x.c&&x.c!==G.user&&divOf(x.c)&&playerInterest(x,G.user)==='no');let i0=null,i1=null,i2=null;
      if(q){i0=playerInterest(q,G.user);G.rel.p[q.id]=60;i1=playerInterest(q,G.user);G.rel.p[q.id]=0;}
      const y=Object.values(G.players).find(x=>x.c&&x.c!==G.user&&divOf(x.c)&&playerInterest(x,G.user)==='yes');if(y){G.rel.p[y.id]=-60;i2=playerInterest(y,G.user);G.rel.p[y.id]=0;}
      return {a0,a1,a2,i0,i1,i2}}""")
    check(tag, r['a1'] < r['a0'] < r['a2'] and (r['i0'] is None or r['i1'] == 'maybe') and r['i2'] == 'maybe', 'friendly manager asks less, feud asks more; player interest follows relationship ' + str(r))
    # club view: relationship box and a dinner invitation
    t = await pg.evaluate("()=>fullTeams().filter(x=>relClubOk(x)&&divOf(x)==='PL')[1]")
    await pg.evaluate(f"()=>clubModal('{t}')"); await pg.wait_for_timeout(150)
    check(tag, await pg.evaluate("()=>!!document.querySelector('.modal .relbox')"), 'club view shows the manager relationship')
    await pg.click('.modal [data-a="relm"][data-k="dinner"]'); await pg.wait_for_timeout(150)
    r = await pg.evaluate(f"()=>({{v:relM('{t}'),res:(document.querySelector('.modal .relbox')||{{}}).innerText||''}})")
    check(tag, r['v'] >= 9 and 'dinner' in r['res'], 'dinner in the club view ' + str(r)[:120])
    await pg.screenshot(path=str(out / f'rel_club_{tag}.png'))
    # player at another club: relationship block, praise in the media annoys his manager
    pid = await pg.evaluate(f"()=>squad('{t}').sort((a,b)=>b.ca-a.ca)[0].id")
    await pg.evaluate(f"()=>{{UI.modal=null;playerModal('{pid}')}}"); await pg.wait_for_timeout(150)
    check(tag, await pg.evaluate("()=>!!document.querySelector('.modal .relbox')"), 'player view shows the relationship block')
    mv0 = await pg.evaluate(f"()=>relM('{t}')")
    await pg.click('.modal [data-a="relp"][data-k="ppraise"]'); await pg.wait_for_timeout(150)
    r = await pg.evaluate(f"()=>({{p:relP('{pid}'),m:relM('{t}')}})")
    check(tag, r['p'] >= 10 and r['m'] < mv0, 'praising a player raises him and annoys his manager ' + str(r))
    await pg.screenshot(path=str(out / f'rel_player_{tag}.png'))
    await pg.evaluate("()=>{UI.modal=null;render()}")
    # press conference option
    r = await pg.evaluate("""()=>{const f=Object.values(G.fx).filter(f=>(f.h===G.user||f.a===G.user)&&!f.r).sort((a,b)=>a.d<b.d?-1:1).find(f=>relClubOk(f.h===G.user?f.a:f.h));if(!f)return null;const o=f.h===G.user?f.a:f.h;const v0=relM(o);const txt=pressAnswer(f.id,'praisemgr');G.press=null;return {has:PRESS_ANS.some(x=>x[0]==='praisemgr'),d:relM(o)-v0,txt}}""")
    check(tag, r and r['has'] and r['d'] >= 7, 'press conference praise for the opposing manager ' + str(r))
    # weekly: former player stays a friend, tip-off from a friendly manager
    r = await pg.evaluate("""()=>{const q=Object.values(G.players).find(x=>x.c&&x.c!==G.user&&divOf(x.c)==='PL'&&!G.rel.p[x.id]);G.rel.sq=Object.assign({},G.rel.sq||{},{[q.id]:70});
      const t=fullTeams().filter(x=>relClubOk(x)&&divOf(x)==='PL')[7];G.rel.m[mgrKey(t)]=80;const n0=G.news.length,d0=G.date;let tips=0;
      relWeekly();const fp=relP(q.id);for(let i=0;i<40&&!tips;i++){G.date=dStr(new Date(dParse(G.date).getTime()+7*864e5));relWeekly();tips=G.news.slice(0,G.news.length-n0).filter(n=>/^Tip-off|Media/.test(n.title)).length;}
      G.date=d0;return {fp,tips}}""")
    check(tag, r['fp'] >= 20 and r['tips'] >= 1, 'former player and weekly events ' + str(r))
    # play a match: the post-match interview has a third question about the opposing manager
    await pg.evaluate("()=>{UI.modal=null;UI.scr='inbox';render()}")
    got = None
    for i in range(40):
        if await pg.query_selector('.modal'): await pg.evaluate("()=>{UI.modal=null;render()}")
        await pg.click('#go'); await pg.wait_for_timeout(60)
        if await pg.query_selector('[data-a="quicksim"]'):
            await pg.click('[data-a="quicksim"]'); await pg.click('[data-a="mfinish"]'); await pg.wait_for_timeout(150)
            if await pg.query_selector('[data-a="iv1"]'):
                h = await pg.evaluate("()=>UI.modal.includes('>1/3<')")
                if not h: await pg.evaluate("()=>{UI.modal=null;UI.iv=null;render()}"); continue
                await pg.click('[data-a="iv1"] >> nth=0'); await pg.wait_for_timeout(100)
                await pg.click('[data-a="iv2"] >> nth=0'); await pg.wait_for_timeout(100)
                n3 = await pg.evaluate("()=>document.querySelectorAll('[data-a=\"iv3\"]').length")
                opp = await pg.evaluate("()=>UI.iv&&UI.iv.relT"); v0 = await pg.evaluate(f"()=>relM('{opp}')")
                await pg.screenshot(path=str(out / f'rel_iv_{tag}.png'))
                await pg.click('[data-a="iv3"] >> nth=0'); await pg.wait_for_timeout(100)
                got = {'n3': n3, 'd': await pg.evaluate(f"()=>relM('{opp}')") - v0, 'modal': await pg.evaluate("()=>!!UI.modal")}
                break
    check(tag, got and got['n3'] == 3 and got['d'] >= 9 and not got['modal'], 'interview question 3 about the opposing manager ' + str(got))
    # handshake after the game on the relationships screen
    await pg.evaluate("()=>{UI.modal=null;UI.scr='rel';render()}"); await pg.wait_for_timeout(100)
    hs = await pg.query_selector('[data-a="relhs"][data-k="warm"]')
    if hs:
        await hs.click(); await pg.wait_for_timeout(100)
    check(tag, hs is not None and await pg.evaluate("()=>!document.querySelector('[data-a=\"relhs\"]')"), 'handshake after the game')
    ov = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+2")
    check(tag, not ov, 'no horizontal overflow')
    await pg.screenshot(path=str(out / f'rel_screen_{tag}.png'), full_page=True)
    check(tag, not errs, 'errors ' + str(errs[:3]))
    await b.close()

async def main():
    async with async_playwright() as p:
        await run(p, {'width': 1280, 'height': 900}, 'desk')
        await run(p, {'width': 390, 'height': 844}, 'phone')
    print('FAIL' if BAD else 'ALL OK', BAD)
    sys.exit(1 if BAD else 0)
asyncio.run(main())
