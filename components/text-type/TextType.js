(function () {
  'use strict';

  const mount = (element, options) => {
    if (!element || element.dataset.textTypeMounted === 'true') return null;

    const settings = Object.assign({
      text: [],
      typingSpeed: 50,
      initialDelay: 0,
      pauseDuration: 2000,
      deletingSpeed: 30,
      loop: true,
      showCursor: true,
      hideCursorWhileTyping: false,
      cursorCharacter: '|',
      variableSpeed: null,
      startOnVisible: false,
      reverseMode: false
    }, options || {});
    const texts = (Array.isArray(settings.text) ? settings.text : [settings.text]).filter(Boolean);
    if (!texts.length) return null;

    const content = document.createElement('span');
    content.className = 'text-type__content';
    const cursor = document.createElement('span');
    cursor.className = 'text-type__cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = settings.cursorCharacter;
    element.replaceChildren(content);
    if (settings.showCursor) element.appendChild(cursor);

    let currentTextIndex = 0;
    let currentCharacterIndex = 0;
    let deleting = false;
    let timeout = 0;
    let stopped = false;
    let visible = !settings.startOnVisible;
    let observer = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const currentText = () => {
      const sentence = texts[currentTextIndex];
      return settings.reverseMode ? Array.from(sentence).reverse().join('') : sentence;
    };

    const speed = () => {
      if (!settings.variableSpeed) return settings.typingSpeed;
      const min = Number(settings.variableSpeed.min) || settings.typingSpeed;
      const max = Number(settings.variableSpeed.max) || min;
      return Math.random() * (max - min) + min;
    };

    const updateCursor = () => {
      if (!settings.showCursor || !settings.hideCursorWhileTyping) return;
      const isTyping = deleting || currentCharacterIndex < currentText().length;
      cursor.classList.toggle('text-type__cursor--hidden', isTyping);
    };

    const schedule = (callback, delay) => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(callback, delay);
    };

    const step = () => {
      if (stopped || !visible) return;
      const sentence = currentText();

      if (deleting) {
        if (currentCharacterIndex > 0) {
          currentCharacterIndex -= 1;
          content.textContent = sentence.slice(0, currentCharacterIndex);
          updateCursor();
          schedule(step, settings.deletingSpeed);
          return;
        }

        deleting = false;
        if (currentTextIndex === texts.length - 1 && !settings.loop) return;
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        updateCursor();
        schedule(step, settings.typingSpeed);
        return;
      }

      if (currentCharacterIndex < sentence.length) {
        currentCharacterIndex += 1;
        content.textContent = sentence.slice(0, currentCharacterIndex);
        updateCursor();
        schedule(step, speed());
        return;
      }

      if (!settings.loop && currentTextIndex === texts.length - 1) return;
      deleting = true;
      updateCursor();
      schedule(step, settings.pauseDuration);
    };

    const start = () => {
      if (!visible || stopped) return;
      if (reducedMotion) {
        content.textContent = texts[0];
        cursor.hidden = true;
        return;
      }
      schedule(step, settings.initialDelay);
    };

    if (settings.startOnVisible && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        visible = true;
        observer.disconnect();
        start();
      }, { threshold: .1 });
      observer.observe(element);
    } else {
      visible = true;
      start();
    }

    element.dataset.textTypeMounted = 'true';
    return {
      destroy() {
        stopped = true;
        window.clearTimeout(timeout);
        if (observer) observer.disconnect();
        element.replaceChildren();
        delete element.dataset.textTypeMounted;
      }
    };
  };

  window.TextType = { mount };

  const initialize = () => {
    const element = document.getElementById('home-text-type');
    let instance = null;
    const start = language => {
      if (instance) instance.destroy();
      const english = String(language || '').toLowerCase().startsWith('en');
      instance = mount(element, {
        text: english
          ? ['starts here.', 'moves forward.', 'goes further.']
          : ['empieza aquí.', 'avanza contigo.', 'llega más lejos.'],
        typingSpeed: 45,
        pauseDuration: 900,
        showCursor: true,
        cursorCharacter: '|',
        deletingSpeed: 30,
        loop: true
      });
    };
    start(document.documentElement.dataset.universeLanguage || document.documentElement.lang || 'es');
    window.addEventListener('universe:languagechange', event => start(event.detail && event.detail.language));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
