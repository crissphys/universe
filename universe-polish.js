(function () {
  function moveThemeToggleToViewport() {
    var btn = document.getElementById('universe-theme-toggle');
    if (!btn || !document.body) return;
    if (btn.parentElement !== document.body) {
      document.body.appendChild(btn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', moveThemeToggleToViewport, { once: true });
  } else {
    moveThemeToggleToViewport();
  }
})();
