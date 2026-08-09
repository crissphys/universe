(function () {
  'use strict';

  var menuButton = document.getElementById('home-menu-toggle');
  var menu = document.getElementById('home-nav-links');

  function closeMenu() {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
  }

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      var open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    }, { passive: true });
  }

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  var countdown = document.querySelector('.home-countdown[data-target]');
  var countdownTimer = 0;

  function two(value) { return String(Math.max(0, value)).padStart(2, '0'); }

  function renderCountdown() {
    if (!countdown) return;
    var target = new Date(countdown.getAttribute('data-target')).getTime();
    var distance = target - Date.now();
    var caption = countdown.querySelector('.countdown-caption');
    var values;

    if (!Number.isFinite(target) || distance <= 0) {
      values = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      if (caption) caption.textContent = 'Primera prueba · fecha alcanzada';
      if (countdownTimer) window.clearInterval(countdownTimer);
    } else {
      values = {
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
        seconds: Math.floor((distance % 60000) / 1000)
      };
    }

    Object.keys(values).forEach(function (unit) {
      var node = countdown.querySelector('[data-count="' + unit + '"]');
      if (node) node.textContent = two(values[unit]);
    });
  }

  if (countdown) {
    renderCountdown();
    countdownTimer = window.setInterval(renderCountdown, 1000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) renderCountdown();
    });
  }

  var year = document.getElementById('home-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
