/* ChromaGrid (React Bits) ported to vanilla JS: same spotlight/grayscale behaviour, no gsap.
   Markup lives in the page; add data-chroma-grid to the container. Options as data attributes:
   data-radius (px), data-damping (s), data-fade-out (s), data-ease ("powerN.out"). */
(() => {
  const easeFor = name => {
    const power = /^power(\d)\.out$/.exec(name || '');
    const n = power ? Number(power[1]) + 1 : 4;
    return p => 1 - Math.pow(1 - p, n);
  };
  const number = (value, fallback) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const still = () => document.documentElement.classList.contains('motion-off') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(root) {
    const fade = root.querySelector('.chroma-fade');
    const damping = number(root.dataset.damping, 0.45);
    const fadeOut = number(root.dataset.fadeOut, 0.6);
    const ease = easeFor(root.dataset.ease);
    root.style.setProperty('--r', `${number(root.dataset.radius, 300)}px`);

    const pos = { x: 0, y: 0 };
    let tween = null;
    const paint = () => {
      root.style.setProperty('--x', `${pos.x}px`);
      root.style.setProperty('--y', `${pos.y}px`);
    };
    const center = () => {
      const { width, height } = root.getBoundingClientRect();
      pos.x = width / 2;
      pos.y = height / 2;
      paint();
    };
    center();
    addEventListener('resize', () => { if (!tween) center(); });

    const step = now => {
      const t = Math.min(1, (now - tween.start) / (damping * 1000));
      const k = ease(t);
      pos.x = tween.fromX + (tween.toX - tween.fromX) * k;
      pos.y = tween.fromY + (tween.toY - tween.fromY) * k;
      paint();
      tween = t < 1 ? { ...tween, frame: requestAnimationFrame(step) } : null;
    };
    const moveTo = (x, y) => {
      if (tween) cancelAnimationFrame(tween.frame);
      if (still()) { pos.x = x; pos.y = y; tween = null; paint(); return; }
      tween = { fromX: pos.x, fromY: pos.y, toX: x, toY: y, start: performance.now() };
      tween.frame = requestAnimationFrame(step);
    };
    const setFade = (opacity, seconds) => {
      fade.style.transition = `opacity ${still() ? 0 : seconds}s ease-out`;
      fade.style.opacity = opacity;
    };

    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      moveTo(e.clientX - r.left, e.clientY - r.top);
      setFade(0, 0.25);
    });
    root.addEventListener('pointerleave', () => setFade(1, fadeOut));

    root.querySelectorAll('.chroma-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
      });
    });
  }

  const start = () => document.querySelectorAll('[data-chroma-grid]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
