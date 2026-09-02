(function () {
  'use strict';

  const mount = (container, options) => {
    if (!container || container.dataset.cardSwapMounted === 'true') return null;
    const settings = Object.assign({
      cardDistance: 38,
      verticalDistance: 30,
      delay: 5000,
      pauseOnHover: true,
      skewAmount: 4,
      easing: 'elastic'
    }, options || {});
    const cards = Array.from(container.querySelectorAll('[data-card-swap-card]'));
    if (!cards.length) return null;

    const shell = container.closest('.home-card-swap-visual');
    if (shell) {
      shell.style.setProperty('background-color', 'transparent', 'important');
      shell.style.setProperty('background-image', 'none', 'important');
    }
    const status = shell && shell.querySelector('[data-card-swap-status]');
    const previousButton = shell && shell.querySelector('[data-card-swap-previous]');
    const nextButton = shell && shell.querySelector('[data-card-swap-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let order = cards.map((_, index) => index);
    let interval = 0;
    let animationTimer = 0;
    let animating = false;
    let paused = false;

    const dimensions = () => {
      const compact = container.offsetWidth < 500;
      return {
        distanceX: settings.cardDistance * (compact ? .34 : 1),
        distanceY: settings.verticalDistance * (compact ? .58 : 1),
        skew: compact ? settings.skewAmount * .6 : settings.skewAmount
      };
    };

    const slot = position => {
      const size = dimensions();
      return {
        x: position * size.distanceX,
        y: -position * size.distanceY,
        z: -position * size.distanceX * 1.5,
        skew: size.skew,
        zIndex: cards.length - position
      };
    };

    const labelFor = card => {
      const language = document.documentElement.dataset.universeLanguage || document.documentElement.lang || 'es';
      return language.toLowerCase().startsWith('en') ? card.dataset.labelEn : card.dataset.label;
    };

    const updateAccessibility = () => {
      cards.forEach((card, index) => {
        const front = index === order[0];
        card.classList.toggle('is-front', front);
        card.setAttribute('aria-hidden', front ? 'false' : 'true');
        card.querySelectorAll('a,button').forEach(control => {
          control.tabIndex = front ? 0 : -1;
        });
      });
      if (status) {
        const active = cards[order[0]];
        status.textContent = `${cards.indexOf(active) + 1}/${cards.length} · ${labelFor(active)}`;
      }
    };

    const placeCard = (cardIndex, position, immediate) => {
      const card = cards[cardIndex];
      const target = slot(position);
      card.classList.toggle('no-transition', Boolean(immediate));
      card.style.setProperty('--slot-x', `${target.x}px`);
      card.style.setProperty('--slot-y', `${target.y}px`);
      card.style.setProperty('--slot-z', `${target.z}px`);
      card.style.setProperty('--card-skew', `${target.skew}deg`);
      card.style.zIndex = String(target.zIndex);
      card.style.transform = `translate(-50%, -50%) translate3d(${target.x}px, ${target.y}px, ${target.z}px) skewY(${target.skew}deg)`;
    };

    const placeAll = immediate => {
      order.forEach((cardIndex, position) => placeCard(cardIndex, position, immediate));
      if (immediate) requestAnimationFrame(() => cards.forEach(card => card.classList.remove('no-transition')));
      updateAccessibility();
    };

    const restart = () => {
      window.clearInterval(interval);
      if (!reducedMotion && !paused && cards.length > 1) interval = window.setInterval(next, settings.delay);
    };

    const finishSwap = (nextOrder, outgoing) => {
      order = nextOrder;
      placeCard(outgoing, cards.length - 1, true);
      cards[outgoing].classList.remove('is-dropping');
      requestAnimationFrame(() => cards[outgoing].classList.remove('no-transition'));
      updateAccessibility();
      animating = false;
    };

    const next = () => {
      if (animating || cards.length < 2) return;
      const outgoing = order[0];
      const nextOrder = order.slice(1).concat(outgoing);
      if (reducedMotion) {
        order = nextOrder;
        placeAll(true);
        restart();
        return;
      }
      animating = true;
      order = nextOrder;
      updateAccessibility();
      cards[outgoing].classList.add('is-dropping');
      nextOrder.slice(0, -1).forEach((cardIndex, position) => placeCard(cardIndex, position, false));
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(() => finishSwap(nextOrder, outgoing), 650);
      restart();
    };

    const previous = () => {
      if (animating || cards.length < 2) return;
      order = [order[order.length - 1]].concat(order.slice(0, -1));
      placeAll(reducedMotion);
      restart();
    };

    const pause = () => {
      paused = true;
      window.clearInterval(interval);
    };
    const resume = () => {
      paused = false;
      restart();
    };

    if (previousButton) previousButton.addEventListener('click', previous);
    if (nextButton) nextButton.addEventListener('click', next);
    if (settings.pauseOnHover) {
      container.addEventListener('mouseenter', pause);
      container.addEventListener('mouseleave', resume);
      container.addEventListener('focusin', pause);
      container.addEventListener('focusout', event => {
        if (!container.contains(event.relatedTarget)) resume();
      });
    }
    window.addEventListener('universe:languagechange', updateAccessibility);
    const resizeObserver = new ResizeObserver(() => placeAll(true));
    resizeObserver.observe(container);
    placeAll(true);
    restart();
    container.dataset.cardSwapMounted = 'true';

    return {
      next,
      previous,
      destroy() {
        window.clearInterval(interval);
        window.clearTimeout(animationTimer);
        resizeObserver.disconnect();
        window.removeEventListener('universe:languagechange', updateAccessibility);
        if (previousButton) previousButton.removeEventListener('click', previous);
        if (nextButton) nextButton.removeEventListener('click', next);
        delete container.dataset.cardSwapMounted;
      }
    };
  };

  window.CardSwap = { mount };

  const initialize = () => {
    mount(document.getElementById('home-card-swap'), {
      cardDistance: 38,
      verticalDistance: 30,
      delay: 5000,
      pauseOnHover: true,
      skewAmount: 4,
      easing: 'elastic'
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
