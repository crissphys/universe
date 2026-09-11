/* Legacy native pages invent their own ad-hoc class names for cards/panels/hero banners, so a fixed
   CSS selector list can never cover all of them. This walks the rendered DOM instead and darkens any
   surface that is still painting a light-mode background, based on what the browser actually computed —
   not on guessing a class name — while leaving genuinely branded/colored UI (pills, badges, buttons,
   data-viz bars) untouched. */
(() => {
  if (!document.body.dataset.native) return;
  const PROTECT = /pill|badge|chip|tag\b|button|btn|active|primary/i;
  function luminance(color) {
    const m = color && color.match(/\d+(?:\.\d+)?/g);
    if (!m || m.length < 3) return null;
    const [r, g, b, a] = m.map(Number);
    if (a === 0) return null;
    return (r + g + b) / 3;
  }
  function isLightGradient(image) {
    if (!image || image === 'none') return false;
    const stops = image.match(/\d+,\s*\d+,\s*\d+/g) || [];
    return stops.some(s => luminance('rgb(' + s + ')') > 225);
  }
  function fix() {
    document.querySelectorAll('.native-shell *').forEach(el => {
      const cls = String(el.className || '');
      if (PROTECT.test(cls) || el.tagName === 'BUTTON') return;
      const cs = getComputedStyle(el);
      const lum = luminance(cs.backgroundColor);
      const lightBg = lum !== null && lum > 225;
      const lightImg = isLightGradient(cs.backgroundImage);
      if (lightBg || lightImg) {
        el.style.setProperty('background-color', '#12141c', 'important');
        el.style.setProperty('background-image', 'none', 'important');
        if (lum !== null) el.style.setProperty('color', '#f5f5f7', 'important');
        return;
      }
      // Text left over from a light-mode palette (dark ink, no light background of its own to fix)
      // reads as near-invisible on the new dark page — lift it once its own background is transparent.
      if (!el.children.length && el.textContent.trim()) {
        const textLum = luminance(cs.color);
        if (textLum !== null && textLum < 90 && (lum === null || lum < 40)) {
          el.style.setProperty('color', '#f5f5f7', 'important');
        }
      }
    });
  }
  const run = () => { fix(); setTimeout(fix, 500); setTimeout(fix, 1500); setTimeout(fix, 3500); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  // Native tools render content asynchronously long after load (fetch-driven lists, dialogs) — keep
  // watching without re-walking the whole tree on every micro-mutation.
  let pending = null;
  new MutationObserver(() => { clearTimeout(pending); pending = setTimeout(fix, 200); })
    .observe(document.getElementById('native-main') || document.body, { childList: true, subtree: true });
})();
