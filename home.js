(function () {
  'use strict';

  var menuButton = document.getElementById('home-menu-toggle');
  var menu = document.getElementById('home-nav-links');

  function setMenu(open) {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('open', open);
    document.body.classList.toggle('home-menu-open', open);
  }

  function closeMenu() {
    setMenu(false);
  }

  if (menuButton && menu) {
    menu.setAttribute('aria-hidden', 'true');
    menuButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var open = menuButton.getAttribute('aria-expanded') === 'true';
      setMenu(!open);
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    }, { passive: true });
  }

  var accountSlot = document.getElementById('home-account-slot');

  function placeAccountButton() {
    if (!accountSlot) return false;
    var button = document.getElementById('uts-google-auth-button') || document.querySelector('[data-uts-account-button="true"]');
    if (!button) return false;
    if (button.parentNode !== accountSlot) accountSlot.appendChild(button);
    return true;
  }

  if (!placeAccountButton() && document.body && 'MutationObserver' in window) {
    var accountObserver = new MutationObserver(function () {
      if (placeAccountButton()) accountObserver.disconnect();
    });
    accountObserver.observe(document.body, { childList: true, subtree: true });
  }

  var reducedMotion = document.documentElement.dataset.universeAnimations === 'off';
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.home-reveal'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    revealItems.forEach(function (item) { observer.observe(item); });
  }

  var countdowns = Array.prototype.slice.call(document.querySelectorAll('.home-countdown[data-target]'));
  var countdownTimer = 0;

  function two(value) { return String(Math.max(0, value)).padStart(2, '0'); }

  function renderCountdown() {
    if (!countdowns.length) return;
    var now = Date.now();
    var nextCountdown = null;

    countdowns.forEach(function (countdown) {
      var target = new Date(countdown.getAttribute('data-target')).getTime();
      var distance = target - now;
      var caption = countdown.querySelector('.countdown-caption');
      var values;

      countdown.classList.remove('is-next');
      if (!Number.isFinite(target) || distance <= 0) {
        values = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        countdown.classList.add('is-complete');
        if (caption) caption.textContent = countdown.getAttribute('data-complete') || 'Prueba finalizada';
      } else {
        countdown.classList.remove('is-complete');
        if (!nextCountdown || target < nextCountdown.target) nextCountdown = { node: countdown, target: target };
        values = {
          days: Math.floor(distance / 86400000),
          hours: Math.floor((distance % 86400000) / 3600000),
          minutes: Math.floor((distance % 3600000) / 60000),
          seconds: Math.floor((distance % 60000) / 1000)
        };
        if (caption) caption.textContent = 'Tiempo restante';
      }

      Object.keys(values).forEach(function (unit) {
        var node = countdown.querySelector('[data-count="' + unit + '"]');
        if (node) node.textContent = two(values[unit]);
      });
    });

    if (nextCountdown) nextCountdown.node.classList.add('is-next');
    else if (countdownTimer) window.clearInterval(countdownTimer);
  }

  if (countdowns.length) {
    renderCountdown();
    countdownTimer = window.setInterval(renderCountdown, 1000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) renderCountdown();
    });
  }

  var year = document.getElementById('home-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
