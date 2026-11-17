// badges.js: your own club badges. You can upload an image as the badge of the club you manage (Club > Overview) or of
// any other club, friendly opponents such as Arsenal Legends included (in the club's pop-up). It is kept in this
// browser on this device only (IndexedDB), never in the save, a save export, the repository or the published game,
// so the game itself never ships any real club logo. Where a badge exists it replaces the colour swatch everywhere
// (tables, links, the match header), and in the 3D view it shows in the score box, on the big screen and on the shirts.
// Loaded after cine.js (uses idbGet/idbSet).

const BADGES = {};     // tid -> blob: URL for the page (short, so tables stay light)
const BADGE_IMG = {};  // tid -> loaded Image, for canvases (big screen) and 3D textures
let _badgeData = {};   // tid -> data URL as stored on the device
function badgeLoad() {
  return idbGet('badges').then(v => {
    let o = {}; try { o = v ? (typeof v === 'string' ? JSON.parse(v) : v) : {}; } catch (e) { o = {}; }
    _badgeData = o || {}; for (const k of Object.keys(BADGES)) { try { URL.revokeObjectURL(BADGES[k]); } catch (e) { } delete BADGES[k]; delete BADGE_IMG[k]; }
    for (const [tid, d] of Object.entries(_badgeData)) badgeMount(tid, d);
  }).catch(() => { });
}
function badgeMount(tid, d) {
  try {
    const [h, b64] = d.split(','); const mime = (h.match(/data:([^;]+)/) || [])[1] || 'image/png'; const bin = atob(b64); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    BADGES[tid] = URL.createObjectURL(new Blob([u8], { type: mime }));
  } catch (e) { BADGES[tid] = d; }
  const im = new Image(); im.onload = () => { BADGE_IMG[tid] = im; }; im.src = BADGES[tid];
}
function badgeSave() { return idbSet('badges', JSON.stringify(_badgeData)); }
// shrink to at most 256 px, keep transparency
function shrinkBadge(file) {
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type || '')) { rej(new Error('not an image')); return; }
    const fr = new FileReader(); fr.onerror = () => rej(fr.error);
    fr.onload = () => { const im = new Image(); im.onerror = () => rej(new Error('not an image')); im.onload = () => { const s = Math.min(1, 256 / Math.max(im.width, im.height)); const [c, g] = cvs(Math.max(1, Math.round(im.width * s)), Math.max(1, Math.round(im.height * s))); g.drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/png')); }; im.src = fr.result; };
    fr.readAsDataURL(file);
  });
}

// everywhere the game draws a club's colour swatch
const _badgeSw = badge;
badge = function (tid) { const u = BADGES[tid]; if (u) return `<img class="badge bimg" src="${u}" alt="">`; return _badgeSw(tid); };

// the upload box: Club > Overview for your club, and in any club's pop-up (e.g. friendly opponents such as Arsenal Legends)
function badgeBoxHtml(tid, compact) {
  tid = tid || G.user; const t = T(tid); if (!t) return ''; const has = !!BADGES[tid];
  const pic = has ? `<img src="${BADGES[tid]}" alt="${esc(t.name)} badge" style="width:${compact ? 48 : 72}px;height:${compact ? 48 : 72}px;object-fit:contain;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:4px">` : `<span style="display:inline-block;width:${compact ? 32 : 48}px;height:${compact ? 40 : 60}px;background:linear-gradient(90deg,${t.c1} 0 50%,${t.c2} 50% 100%);border:1px solid rgba(255,255,255,.35)"></span>`;
  const btns = `<label class="btn" style="cursor:pointer">${has ? 'Replace badge' : 'Upload badge'}<input type="file" class="badgeFile" data-tid="${esc(tid)}" accept="image/*" style="display:none"></label>${has ? `<button class="btn" data-a="badgedel" data-v="${esc(tid)}">Remove</button>` : ''}`;
  if (compact) return `<div class="box pad badgebox" style="margin-top:10px"><label class="lb">Badge on this device</label><div class="row" style="gap:10px;align-items:center;flex-wrap:wrap">${pic}${btns}</div><p class="dim" style="font-size:12px;margin:6px 0 0">Kept in this browser only; never in your save or published.</p></div>`;
  return `<div class="box pad" style="margin-top:10px"><h3 class="h3" style="margin-top:0">Club badge</h3>
  <p class="dim" style="font-size:12.5px;margin:0 0 8px">Upload a badge or logo for ${esc(t.name)}. It stays in this browser on this device only: it is not part of your save or a save export and is never uploaded or published. Replace it or remove it at any time. Other clubs (friendly opponents such as Arsenal Legends too) get the same option in their pop-up: tap the club's name anywhere.</p>
  <div class="row" style="gap:12px;align-items:center;flex-wrap:wrap">${pic}${btns}</div>
  <p class="dim" style="font-size:12px;margin:8px 0 0">PNG with a transparent background works best. Shown in tables, the match header and the 3D view.</p></div>`;
}
const _scrClubB = scrClub;
scrClub = function () { const h = _scrClubB(); return (UI.tab.club || 'ov') === 'ov' ? h + badgeBoxHtml(G.user) : h; };
// any club's pop-up
const _clubModalB = clubModal;
clubModal = function (tid) {
  _clubModalB(tid);
  try { if (T(tid) && UI.modal && !UI.modal.includes('badgebox')) { const i = UI.modal.lastIndexOf('</div>'); if (i > 0) { UI.modal = UI.modal.slice(0, i) + badgeBoxHtml(tid, true) + UI.modal.slice(i); UI.badgeClub = tid; render(); } } } catch (e) { console.error(e); }
};
function badgeRefresh(tid) { if (UI.modal && UI.badgeClub === tid && UI.modal.includes('badgebox')) { UI.modal = null; clubModal(tid); } else render(); }
ACT.badgedel = (v) => { const tid = v || G.user; delete _badgeData[tid]; try { URL.revokeObjectURL(BADGES[tid]); } catch (e) { } delete BADGES[tid]; delete BADGE_IMG[tid]; badgeSave().then(() => { toast('Badge removed from this device.'); badgeRefresh(tid); }); };
document.addEventListener('change', (ev) => {
  const el = ev.target; if (!el || !el.classList || !el.classList.contains('badgeFile') || !el.files || !el.files[0] || !G) return;
  const tid = el.dataset.tid || G.user; if (!T(tid)) return;
  shrinkBadge(el.files[0]).then(d => { _badgeData[tid] = d; badgeMount(tid, d); return badgeSave(); }).then(() => { toast('Badge saved on this device.'); setTimeout(() => badgeRefresh(tid), 60); }).catch(() => toast('That file could not be used as a badge.'));
});
badgeLoad().then(() => { try { if (G && G.user) render(); } catch (e) { } });
