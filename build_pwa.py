"""Build the installable web app (PWA) into the repo root: index.html, manifest, service worker, icons.
Run after build.py: python3 build.py && python3 build_pwa.py"""
import pathlib, hashlib, json
from PIL import Image, ImageDraw, ImageFont
root = pathlib.Path('.')
js = (root/'bundle.js').read_text()
css = (root/'src'/'style.css').read_text()
ver = hashlib.sha1((js+css).encode()).hexdigest()[:10]
FONTS = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans+Condensed:wght@400;500;600;700&family=VT323&display=swap'
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Gaffer 26/27</title>
<meta name="description" content="Retro football management game with real Premier League 2026/27 squads.">
<meta name="theme-color" content="#090d26">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Gaffer">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>
{css}
html,body{{overscroll-behavior:none;-webkit-tap-highlight-color:transparent}}
</style>
</head>
<body>
<div id="app"><div style="padding:40px;font-family:monospace;color:#ffd23f">Loading GAFFER 26/27...</div></div>
<script>
{js}
</script>
<script>
if ('serviceWorker' in navigator) {{
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {{}}));
}}
</script>
</body>
</html>
'''
(root/'index.html').write_text(html)

manifest = {
  "name": "Gaffer 26/27", "short_name": "Gaffer", "start_url": "./", "scope": "./",
  "display": "standalone", "orientation": "any",
  "background_color": "#090d26", "theme_color": "#090d26",
  "description": "Retro football management game with real Premier League 2026/27 squads.",
  "icons": [
    {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
(root/'manifest.webmanifest').write_text(json.dumps(manifest, indent=2))

sw = f'''// GAFFER service worker. Version changes on every build so phones pick up updates.
const CACHE = 'gaffer-{ver}';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => {{
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
}});
self.addEventListener('activate', e => {{
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('gaffer-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
}});
self.addEventListener('fetch', e => {{
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Game page: network first (to get updates), cached copy when offline.
  if (req.mode === 'navigate' || (url.origin === location.origin && url.pathname.endsWith('/index.html'))) {{
    e.respondWith(fetch(req).then(r => {{ const c = r.clone(); caches.open(CACHE).then(ca => ca.put('index.html', c)); return r; }})
      .catch(() => caches.match('index.html').then(r => r || caches.match('./'))));
    return;
  }}
  // Everything else (icons, Google Fonts): cache first, then network.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {{
    if (r && (r.ok || r.type === 'opaque')) {{ const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); }}
    return r;
  }})));
}});
'''
(root/'sw.js').write_text(sw)

# Icons: retro teletext badge — navy field, yellow "G", pitch stripe.
def icon(size, pad=0.0, rounded=True):
    S = 1024
    im = Image.new('RGB', (S, S), '#090d26'); d = ImageDraw.Draw(im)
    m = int(S*pad)
    d.rectangle([m, m, S-m, S-m], fill='#12258a')
    # pitch band
    d.rectangle([m, int(S*.68), S-m, S-m], fill='#1f7a3a')
    for i in range(6):
        if i % 2: d.rectangle([m+i*(S-2*m)//6, int(S*.68), m+(i+1)*(S-2*m)//6, S-m], fill='#24873f')
    d.line([m, int(S*.68), S-m, int(S*.68)], fill='#ffd23f', width=18)
    font = None
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf']:
        try: font = ImageFont.truetype(f, int(S*(.5-pad*.6))); break
        except Exception: pass
    font = font or ImageFont.load_default()
    t = 'G'; bb = d.textbbox((0, 0), t, font=font)
    x = (S-(bb[2]-bb[0]))//2-bb[0]; y = int(S*.36)-(bb[3]-bb[1])//2-bb[1]
    d.text((x+22, y+22), t, font=font, fill='#000')
    d.text((x, y), t, font=font, fill='#ffd23f')
    # ball
    r = int(S*.055); cx, cy = int(S*.73), int(S*.84)
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill='#ffffff', outline='#000', width=8)
    return im.resize((size, size), Image.LANCZOS)
ic = root/'icons'; ic.mkdir(exist_ok=True)
icon(192).save(ic/'icon-192.png'); icon(512).save(ic/'icon-512.png')
icon(180).save(ic/'apple-touch-icon.png'); icon(512, pad=.0).save(ic/'icon-maskable-512.png')
print('PWA built, cache', ver, len(html)//1024, 'KB')
