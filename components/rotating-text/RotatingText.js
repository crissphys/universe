(function () {
  'use strict';

  const splitIntoCharacters = text => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), segment => segment.segment);
    }
    return Array.from(text);
  };

  const mount = (element, options) => {
    if (!element || element.dataset.rotatingTextMounted === 'true') return null;

    const settings = Object.assign({
      texts: [],
      rotationInterval: 2000,
      staggerDuration: 25,
      staggerFrom: 'last',
      loop: true,
      auto: true
    }, options || {});
    const texts = settings.texts.filter(Boolean);
    if (!texts.length) return null;

    let currentIndex = 0;
    let interval = 0;
    let exitTimer = 0;
    let stopped = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = (text, animate) => {
      element.replaceChildren();
      const words = text.split(' ');
      const totalCharacters = words.reduce((sum, word) => sum + splitIntoCharacters(word).length, 0);
      let characterIndex = 0;

      words.forEach((word, wordIndex) => {
        const wordElement = document.createElement('span');
        wordElement.className = 'text-rotate-word';

        splitIntoCharacters(word).forEach(character => {
          const characterElement = document.createElement('span');
          characterElement.className = 'text-rotate-element';
          characterElement.textContent = character;
          const delayIndex = settings.staggerFrom === 'last'
            ? totalCharacters - 1 - characterIndex
            : characterIndex;
          characterElement.style.setProperty('--rotate-delay', `${delayIndex * settings.staggerDuration}ms`);
          wordElement.appendChild(characterElement);
          characterIndex += 1;
        });

        element.appendChild(wordElement);
        if (wordIndex !== words.length - 1) {
          const space = document.createElement('span');
          space.className = 'text-rotate-space';
          space.textContent = ' ';
          element.appendChild(space);
        }
      });

      element.classList.remove('is-exiting', 'is-visible');
      if (!animate || reducedMotion) {
        element.classList.add('is-visible');
        return;
      }
      requestAnimationFrame(() => requestAnimationFrame(() => element.classList.add('is-visible')));
    };

    const next = () => {
      if (stopped || texts.length < 2) return;
      const nextIndex = currentIndex === texts.length - 1
        ? (settings.loop ? 0 : currentIndex)
        : currentIndex + 1;
      if (nextIndex === currentIndex) return;

      element.classList.remove('is-visible');
      element.classList.add('is-exiting');
      window.clearTimeout(exitTimer);
      exitTimer = window.setTimeout(() => {
        currentIndex = nextIndex;
        render(texts[currentIndex], true);
      }, 430);
    };

    render(texts[currentIndex], false);
    if (settings.auto && !reducedMotion && texts.length > 1) {
      interval = window.setInterval(next, settings.rotationInterval);
    }
    element.dataset.rotatingTextMounted = 'true';

    return {
      next,
      destroy() {
        stopped = true;
        window.clearInterval(interval);
        window.clearTimeout(exitTimer);
        element.replaceChildren();
        delete element.dataset.rotatingTextMounted;
      }
    };
  };

  window.RotatingText = { mount };

  const initialize = () => {
    mount(document.getElementById('home-rotating-title'), {
      texts: ['empieza aquí.', 'avanza contigo.', 'llega más lejos.'],
      staggerFrom: 'last',
      staggerDuration: 25,
      rotationInterval: 2000,
      loop: true,
      auto: true
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
