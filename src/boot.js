// boot (kept last)
if (window.claude && window.claude.hot) { try { window.claude.hot.snapshot(() => ({ G, scr: UI.match ? 'inbox' : UI.scr })); } catch (e) { } }
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
