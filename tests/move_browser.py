# Phase 11: smarter movement in the 2D matchday. Records every frame of live play and checks that players stay on the
# pitch, never jump (no teleporting outside set pieces), attackers stay onside before a pass, the movement arrows
# toggle works and no page errors happen. Also takes a sequence of screenshots of an attack with the arrows on.
# python3 tests/move_browser.py OUT_DIR
import asyncio, json, pathlib, sys
from playwright.async_api import async_playwright
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
w = out / 'wrap_mv.html'
w.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + pathlib.Path('gaffer.html').read_text() + '</body></html>')
HOOK = """()=>{window.MVT={frames:0,maxJump:0,jumpAt:null,offChecks:0,offBad:0,offMax:0,outside:0,boxRuns:0,sup:0,cover:0,thr:0};
const _r=runScene;runScene=function(LM,SC,dt){const before=new Map([...SC.pos].map(([e,p])=>[e,{x:p.x,y:p.y}]));const si=SC.si;const r=_r.apply(this,arguments);
 if(SC!==LM.vis.live||LM.vis.rp)return r; const T=window.MVT; T.frames++; const cs=SC.plan[SC.si];
 const setp=SC.kick||!cs||['place','kickoff','whistle','celebrate','goal','net','pen'].includes(cs.k)||SC.si!==si||dt>80||dt<=0;
 for(const [e,p] of SC.pos){ if(p.x<-.05||p.x>1.05||p.y<-.08||p.y>1.08){T.outside++;T.oe=[e.role,+p.x.toFixed(3),+p.y.toFixed(3),cs&&cs.k];} const b=before.get(e); if(b&&!setp&&!(SC.fallen.get(e)>SC.t)&&!(SC.dive&&SC.dive.e===e)){const d=Math.hypot(p.x-b.x,p.y-b.y)/dt*16; if(d>T.maxJump){T.maxJump=d;T.jumpAt=cs&&cs.k;}}}
 if(SC.mv){T.boxRuns+=SC.mv.box.size;T.sup+=SC.mv.sup.size;T.cover+=SC.mv.cover.size;if(SC.mv.thr)T.thr++;}
 if(cs&&SC.holder&&!setp){const V=LM.vis,M=SC.M;const a=sideOf(V,M,SC.holder),d=1-a;
  const xs=onPitch(M,d).map(e=>SC.pos.get(e)).filter(Boolean).map(p=>a===0?p.x:1-p.x).sort((x,y)=>y-x); const line=Math.max(.5,xs[1],a===0?SC.ball.x:1-SC.ball.x);
  for(const e of onPitch(M,a)){ if(e===SC.holder||SC.ov.has(e))continue; const p=SC.pos.get(e); if(!p)continue; const x=a===0?p.x:1-p.x; T.offChecks++; if(x>line+.02){T.offBad++;T.offMax=Math.max(T.offMax,x-line);} }}
 return r;};}"""
async def shot(pg, path):
    bb = await pg.evaluate("()=>{const r=document.getElementById('p2dwrap').getBoundingClientRect();window.scrollTo(0,0);return {x:r.left,y:r.top+scrollY,width:r.width,height:Math.max(50,r.height)}}")
    await pg.screenshot(path=path, clip=bb, full_page=True)
async def run(p, vw, tag):
    b = await p.chromium.launch(); errs = []
    pg = await b.new_page(viewport={'width': vw, 'height': 900}); pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.route('**/three.min.js', lambda r: r.abort())
    await pg.goto('file://' + str(w.resolve())); await pg.wait_for_timeout(300)
    await pg.click('.intro .ic-skip'); await pg.wait_for_timeout(300)
    await pg.click('[data-v="ARS"]'); await pg.click('[data-a="start"]'); await pg.wait_for_timeout(300)
    await pg.evaluate("()=>{try{localStorage.setItem('gaffer.lineups','0')}catch(e){};UI.lineupAuto=false;let g=0;while(!userFixtureOn(G.date)&&g++<60){const r=advance();if(r.type==='match')break;}startLive(userFixtureOn(G.date).id);}"); await pg.wait_for_timeout(400)
    await pg.evaluate(HOOK)
    if sys.argv[2:] == ["base"]: await pg.evaluate("()=>{UI.mvOff=true;window.mvSpeed=undefined;}")
    btn = await pg.evaluate("()=>!!document.querySelector('[data-a=\"mmove\"]')")
    await pg.click('[data-a="mmove"]'); await pg.wait_for_timeout(200)
    on = await pg.evaluate("()=>UI.mvArrows===true && /on/.test(document.querySelector('[data-a=\"mmove\"]').textContent)")
    ov = await pg.evaluate("()=>document.documentElement.scrollWidth>innerWidth+1")
    await pg.evaluate("()=>{if(!UI.match.run)ACT.mrun();}")
    shots = 0
    for i in range(60):
        await pg.wait_for_timeout(500)
        if tag == 'desk' and shots < 4:
            k = await pg.evaluate("()=>{const SC=UI.match.vis.live;const cs=SC.plan[SC.si];const h=SC.holder;if(!h||!cs)return '';const V=UI.match.vis;const a=sideOf(V,SC.M,h);const x=a===0?SC.ball.x:1-SC.ball.x;return x>.6&&SC.M.sides[a].tid===G.user?cs.k:''}")
            if k:
                await shot(pg, str(out / f'mv_attack{shots}.png')); shots += 1; await pg.wait_for_timeout(250)
    T = await pg.evaluate("()=>window.MVT")
    # tired players: drop condition and check the speed factor and the stamina arrow
    tired = await pg.evaluate("()=>{if(typeof mvSpeed!=='function')return [1,1,false];const M=UI.match.M;const e=M.sides[0].ps.find(x=>x.on&&x.role==='MC'&&!x.p.pseudo)||M.sides[0].ps.find(x=>x.on&&x.role!=='GK');const c0=e.p.cond;e.p.cond=100;const SC=UI.match.vis.live;const k0=SC.kick;SC.kick=false;const a=mvSpeed(SC,e,0);e.p.cond=40;const b=mvSpeed(SC,e,0);const f=mvFading(e);e.p.cond=c0;SC.kick=k0;return [+a.toFixed(2),+b.toFixed(2),f]}")
    print(tag, 'button', btn, 'on', on, 'overflow', ov)
    print(tag, 'frames', T['frames'], 'maxJump/16ms %.4f' % T['maxJump'], 'at', T['jumpAt'], 'outside', T['outside'], T.get('oe'))
    print(tag, 'onside checks', T['offChecks'], 'beyond the line', T['offBad'], 'max %.3f' % T['offMax'])
    print(tag, 'box-run frames', T['boxRuns'], 'support', T['sup'], 'cover', T['cover'], 'through-run frames', T['thr'])
    print(tag, 'speed fresh/tired', tired, 'shots', shots)
    print(tag, 'errors', errs[:5])
    ok = btn and on and not ov and T['frames'] > 200 and T['maxJump'] < .15 and T['outside'] == 0 and T['offChecks'] > 0 and T['offBad'] / max(1, T['offChecks']) < .02 and T['sup'] > 0 and tired[1] < tired[0] and tired[2] and not errs
    print(tag, 'PASS' if ok else 'FAIL')
    if not ok: BAD.append(tag)
    await b.close()
BAD = []
async def main():
    async with async_playwright() as p:
        await run(p, 1280, 'desk')
        if len(sys.argv) < 3: await run(p, 390, 'phone')
asyncio.run(main())
if BAD: sys.exit(1)
