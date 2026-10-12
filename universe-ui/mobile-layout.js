(function () {
  let sequence = 0;
  function compact(nav) {
    if (nav.dataset.mobileMenu) return;
    nav.dataset.mobileMenu = 'ready';
    nav.id ||= `mobile-branches-${++sequence}`;
    const current = nav.querySelector('[aria-current="page"] .branched-menu__label');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-branches-toggle';
    button.setAttribute('aria-controls', nav.id);
    button.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.textContent = current ? `Menú · ${current.textContent}` : 'Explorar UNIverse';
    button.append(label);
    button.insertAdjacentHTML('beforeend', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
    nav.before(button);
    const close = () => {
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('mobile-branches-open');
    };
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(expanded));
      nav.classList.toggle('mobile-branches-open', expanded);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) close();
    });
    nav.addEventListener('keydown', event => {
      if (event.key === 'Escape' && matchMedia('(max-width:760px)').matches) { close(); button.focus(); }
    });
  }
  document.querySelectorAll('.side-rail .branched-menu').forEach(compact);
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.matches('.side-rail .branched-menu')) compact(node);
      node.querySelectorAll('.side-rail .branched-menu').forEach(compact);
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
