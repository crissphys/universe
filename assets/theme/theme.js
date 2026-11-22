/* UNIverse · tema claro / oscuro compartido. Se carga en el <head> sin defer para aplicar el tema antes del primer
   pintado; la elección se guarda en el equipo (universe_theme) y vale para todas las páginas. */
(function () {
  var root = document.documentElement, th = null;
  try { th = localStorage.getItem('universe_theme'); } catch (e) {}
  root.dataset.theme = th === 'light' ? 'light' : 'dark';

  function set(next) {
    root.classList.add('theming'); root.dataset.theme = next;
    setTimeout(function () { root.classList.remove('theming'); }, 400);
    try { localStorage.setItem('universe_theme', next); } catch (e) {}
  }
  // otra pestaña cambió el tema: esta lo sigue
  addEventListener('storage', function (e) { if (e.key === 'universe_theme' && (e.newValue === 'light' || e.newValue === 'dark')) root.dataset.theme = e.newValue; });

  function mount() {
    if (document.querySelector('.ut-theme, #theme-btn')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ut-theme';
    b.setAttribute('aria-label', root.lang && root.lang.slice(0, 2) === 'en' ? 'Toggle light or dark theme' : 'Cambiar tema claro u oscuro');
    b.innerHTML = '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
    b.addEventListener('click', function () { set(root.dataset.theme === 'light' ? 'dark' : 'light'); });
    var slot = document.querySelector('header .top-actions') || document.querySelector('header.top .top-inner, header .top-inner');
    if (slot) { var acct = slot.querySelector('.acct'); slot.insertBefore(b, acct && acct.parentNode === slot ? acct : null); }
    else { b.classList.add('float'); document.body.appendChild(b); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
