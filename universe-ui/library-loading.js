(function () {
  const key = Symbol.for('universe.libraryLoading');
  if (window[key]) return;
  window[key] = true;
  const version = '20261012-library-skeleton-v1';
  const roots = new Set(), images = new WeakMap();
  const rootSelector = '#page-view > .p-empty, #page-view > [role="status"], #book-results > .p-empty, #catalog-sections, #library-directory, #library-directory > [role="status"]';
  const imageSelector = '.p-cover img, .book-cover img, .exam-thumb img, .catalog-logo img, .tile-logo img, .editorial-fallback-logo img, .editorial-logo-card > img';
  const libraryRoute = () => /^\/biblioteca(?:\/|\.html|$)/.test(location.pathname) || /^\/cepreuni\/(ciclopre20271|examenes)(?:\/|$)/.test(location.pathname);
  const directory = () => /^\/biblioteca(?:\/|\.html)?$/.test(location.pathname);
  let visibility;

  function styles() {
    if (document.querySelector('link[href*="library-loading.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/universe-ui/library-loading.css?v=${version}`;
    document.head.append(link);
  }

  function skeleton(kind) {
    return `<div class="library-skeleton library-skeleton--${kind}" data-library-skeleton><p class="library-skeleton__status" role="status">Cargando biblioteca…</p><div class="library-skeleton__heading" aria-hidden="true"></div><div class="library-skeleton__grid" aria-hidden="true">${Array.from({ length: 6 }, () => '<div class="library-skeleton__card"><div class="library-skeleton__cover"></div><div class="library-skeleton__line"></div><div class="library-skeleton__line library-skeleton__line--short"></div></div>').join('')}</div></div>`;
  }

  function loading(root) {
    if (root.closest('[data-library-skeleton]')) return;
    const emptyMount = root.matches('#catalog-sections, #library-directory') && !root.hasChildNodes();
    const pending = root.matches('.p-empty, [role="status"]') && /cargando|preparando|conectando/i.test(root.textContent);
    if (!emptyMount && !pending) return;
    styles();
    const region = pending ? root.parentElement : root;
    region.setAttribute('aria-busy', 'true');
    roots.add(region);
    const markup = skeleton(root.id === 'library-directory' || directory() ? 'directory' : 'books');
    if (pending) root.outerHTML = markup;
    else root.innerHTML = markup;
  }

  function preview(image) {
    if (images.has(image) || (image.complete && image.naturalWidth > 0)) return;
    if (image.complete && !image.naturalWidth && image.getAttribute('src')) return;
    const frame = image.parentElement;
    styles();
    images.set(image, frame);
    frame.classList.add('library-cover-pending');
    if (visibility) visibility.observe(frame);
  }

  function settle(image) {
    const frame = images.get(image);
    if (!frame) return;
    // Run after the catalog's error handler: it may start loading a fallback cover.
    queueMicrotask(() => {
      if (!image.complete) return;
      frame.classList.remove('library-cover-pending', 'library-cover-inview');
      visibility?.unobserve(frame);
      images.delete(image);
    });
  }

  function scan(node) {
    if (!(node instanceof Element) && node !== document) return;
    if (node instanceof Element && node.matches('[data-library-skeleton]')) return;
    if (node instanceof Element && node.matches(rootSelector)) loading(node);
    node.querySelectorAll(rootSelector).forEach(loading);
    if (node instanceof Element && node.matches(imageSelector)) preview(node);
    node.querySelectorAll(imageSelector).forEach(preview);
  }

  function start() {
    if ('IntersectionObserver' in window) visibility = new IntersectionObserver(entries => {
      for (const entry of entries) {
        entry.target.classList.toggle('library-cover-inview', entry.isIntersecting);
        if (!entry.target.isConnected) visibility.unobserve(entry.target);
      }
    });
    if (libraryRoute()) scan(document);
    document.addEventListener('load', event => { if (event.target instanceof HTMLImageElement) settle(event.target); }, true);
    document.addEventListener('error', event => { if (event.target instanceof HTMLImageElement) settle(event.target); }, true);
    new MutationObserver(records => {
      if (libraryRoute()) for (const record of records) for (const node of record.addedNodes) scan(node);
      for (const root of roots) if (!root.isConnected || !root.querySelector('[data-library-skeleton]')) {
        if (root.isConnected) root.setAttribute('aria-busy', 'false');
        roots.delete(root);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
