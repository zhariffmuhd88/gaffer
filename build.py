import pathlib
src=pathlib.Path('src')
js='\n'.join((src/f).read_text() for f in ['data.js','core.js','match.js','shot.js','season.js','transfers.js','ext.js','meta.js','ui.js','ui2.js','ui3.js','dyn.js','ui4.js','diff.js','matchday.js','mdui.js','awards.js','manager.js','boot.js'])
css=(src/'style.css').read_text()
html=f'''<title>Gaffer 26/27</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Retro football management game with real Premier League 2026/27 squads.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans+Condensed:wght@400;500;600;700&family=VT323&display=swap">
<style>
{css}
</style>
<div id="app"><div style="padding:40px;font-family:monospace;color:#ffd23f">Loading GAFFER 26/27...</div></div>
<script>
{js}
</script>
'''
pathlib.Path('gaffer.html').write_text(html)
pathlib.Path('bundle.js').write_text(js)
print(len(html)//1024,'KB')
