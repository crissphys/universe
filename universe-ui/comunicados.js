/* Comunicados públicos: cada comunicado aparece una sola vez por navegador, en la página donde estés,
   se cierra con la X y queda disponible siempre en el botón "Comunicados". */
(() => {
  'use strict';
  if (window.UniverseAnnouncements) return;

  const API = '/api/site/comunicados';
  const SEEN_KEY = 'universe-comunicados-seen';
  const SVG = 'http://www.w3.org/2000/svg';
  const ALLOWED = new Set(['B', 'I', 'U', 'S', 'SUB', 'SUP', 'BR']);
  const script = document.currentScript;

  // Estilos: el mismo archivo junto a este script, para no tocar el <head> de cada página.
  (() => {
    if (document.querySelector('link[data-uc-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.ucCss = '';
    link.href = script && script.src ? script.src.replace(/\.js(\?|$)/, '.css$1') : '/universe-ui/comunicados.css';
    document.head.append(link);
  })();

  // Si la página no trae las variables de diseño del sitio nuevo, el CSS usa su propia paleta.
  if (!getComputedStyle(document.documentElement).getPropertyValue('--solid').trim()) document.documentElement.setAttribute('data-uc-standalone', '');

  const isEnglish = () => document.documentElement.lang === 'en';
  const t = (es, en) => (isEnglish() ? en : es);

  // ---- Memoria de "ya lo viste" (localStorage, con respaldo si el navegador lo bloquea) ----
  const memory = [];
  const readSeen = () => {
    let stored = [];
    for (const store of ['localStorage', 'sessionStorage']) {
      try {
        const value = JSON.parse(window[store].getItem(SEEN_KEY));
        if (Array.isArray(value)) { stored = value; break; }
      } catch { /* siguiente almacenamiento */ }
    }
    return [...new Set(stored.concat(memory))];
  };
  const markSeen = id => {
    const ids = readSeen();
    if (ids.includes(id)) return;
    ids.push(id);
    memory.push(id);
    for (const store of ['localStorage', 'sessionStorage']) {
      try { window[store].setItem(SEEN_KEY, JSON.stringify(ids.slice(-500))); return; } catch { /* siguiente */ }
    }
  };

  // ---- Texto enriquecido: solo b, i, u, s, sub, sup y saltos de línea (se vuelve a limpiar aquí) ----
  function cleanInto(from, to) {
    for (const node of from.childNodes) {
      if (node.nodeType === 3) to.append(node.data);
      else if (node.nodeType === 1) {
        if (ALLOWED.has(node.tagName)) {
          const el = document.createElement(node.tagName.toLowerCase());
          if (node.tagName !== 'BR') cleanInto(node, el);
          to.append(el);
        } else if (!/^(SCRIPT|STYLE)$/.test(node.tagName)) cleanInto(node, to);
      }
    }
  }

  // ---- Enlaces automáticos: URL, dominios, correos y teléfonos (en azul y con destino real) ----
  const LINK_RX = new RegExp([
    '((?:https?:\\/\\/|www\\.)[^\\s<>"\']+)',
    '([A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,})',
    '(\\b(?:[a-z0-9-]+\\.)+(?:com|pe|edu|org|net|io|gov|co|me|ly|app|dev|info|tv)\\b(?:\\/[^\\s<>"\']*)?)',
    '(\\+\\d{1,3}(?:[\\s-]?\\d{2,4}){2,4}|(?:51[\\s-]?)?9\\d{2}[\\s-]?\\d{3}[\\s-]?\\d{3}|\\(0\\d{1,2}\\)[\\s-]?\\d{3}[\\s-]?\\d{3,4})'
  ].join('|'), 'gi');
  const WHATSAPP_HINT = /(whats?app|wasap|wsp|\bwa\b)[^\d+]{0,30}$/i;

  function trimTrailing(raw) {
    let value = raw;
    while (/[.,;:!?'"\]}]$/.test(value) || (value.endsWith(')') && (value.match(/\(/g) || []).length < (value.match(/\)/g) || []).length)) value = value.slice(0, -1);
    return value;
  }

  function buildLink(match, text) {
    const before = text[match.index - 1] || '';
    const url = match[1], mail = match[2], domain = match[3], phone = match[4];
    let raw, href, inPlace = false;
    if (url || domain) {
      raw = trimTrailing(url || domain);
      if (domain && /[\w@.-]/.test(before)) return null;
      try {
        const parsed = new URL(url ? (/^www\./i.test(raw) ? 'https://' + raw : raw) : 'https://' + raw);
        if (!/^https?:$/.test(parsed.protocol)) return null;
        href = parsed.href;
        inPlace = parsed.hostname === location.hostname || /(^|\.)universetostudy\.com$/.test(parsed.hostname);
      } catch { return null; }
    } else if (mail) {
      raw = trimTrailing(mail);
      href = 'mailto:' + raw;
      inPlace = true;
    } else if (phone) {
      raw = phone.trim();
      const after = text[match.index + raw.length] || '';
      if (/[\w+]/.test(before) || /\d/.test(after)) return null;
      let digits = raw.replace(/\D/g, '');
      if (/^9\d{8}$/.test(digits)) digits = '51' + digits;
      if (digits.length < 8 || digits.length > 15) return null;
      const chatty = WHATSAPP_HINT.test(text.slice(Math.max(0, match.index - 40), match.index));
      href = chatty ? 'https://wa.me/' + digits : 'tel:+' + digits;
      inPlace = !chatty;
    } else return null;
    const a = document.createElement('a');
    a.className = 'uc-link';
    a.href = href;
    a.textContent = raw;
    if (!inPlace) { a.target = '_blank'; a.rel = 'noopener noreferrer nofollow'; }
    return { a, length: raw.length };
  }

  function linkify(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const text = node.data;
      const parts = [];
      let last = 0, match;
      LINK_RX.lastIndex = 0;
      while ((match = LINK_RX.exec(text))) {
        const built = buildLink(match, text);
        if (!built) { LINK_RX.lastIndex = match.index + 1; continue; }
        if (match.index > last) parts.push(text.slice(last, match.index));
        parts.push(built.a);
        last = match.index + built.length;
        LINK_RX.lastIndex = last;
      }
      if (!parts.length) continue;
      if (last < text.length) parts.push(text.slice(last));
      node.replaceWith(...parts);
    }
  }

  function richBody(html) {
    const parsed = new DOMParser().parseFromString('<body>' + html, 'text/html');
    const box = document.createElement('div');
    cleanInto(parsed.body, box);
    linkify(box);
    return box;
  }

  // ---- Tarjeta de un comunicado (misma para el popup y la lista) ----
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(paths) {
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = paths;
    return svg;
  }
  const CLOSE_ICON = '<path d="m6 6 12 12M6 18 18 6"/>';
  const MEGAPHONE_ICON = '<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1ZM17 9a4 4 0 0 1 0 6"/>';

  function closeButton(label, onClick) {
    const button = el('button', 'icon-button uc-close');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.append(icon(CLOSE_ICON));
    button.addEventListener('click', onClick);
    return button;
  }

  function dateLabel(stamp) {
    if (!stamp) return '';
    try { return new Date(stamp).toLocaleDateString(isEnglish() ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; }
  }

  function card(item, withMeta = true) {
    const article = el('article', 'uc-card');
    if (withMeta) {
      const meta = el('div', 'uc-meta');
      meta.append(el('span', 'uc-eyebrow', t('Comunicado', 'Announcement')), el('span', 'uc-date', dateLabel(item.createdAt)));
      article.append(meta);
    }
    if (item.image) {
      const figure = el('figure', 'uc-figure');
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || t('Imagen del comunicado', 'Announcement image');
      img.decoding = 'async';
      // Con las dimensiones conocidas se reserva el espacio exacto: no hay saltos al cargar
      // y la imagen entra completa según su proporción, sin recortes ni ampliarla de más.
      if (item.imageWidth && item.imageHeight) {
        figure.classList.add('has-ratio');
        figure.style.setProperty('--w', item.imageWidth);
        figure.style.setProperty('--r', (item.imageWidth / item.imageHeight).toFixed(5));
      }
      const reveal = () => img.classList.add('is-loaded');
      img.addEventListener('load', reveal, { once: true });
      img.addEventListener('error', () => figure.remove(), { once: true });
      if (img.complete && img.naturalWidth) reveal();
      figure.append(img);
      article.append(figure);
    }
    article.append(el('h2', 'uc-title', item.title));
    if (item.subtitle) article.append(el('p', 'uc-sub', item.subtitle));
    if (item.body) {
      const body = el('div', 'uc-body');
      body.append(...richBody(item.body).childNodes);
      article.append(body);
    }
    return article;
  }

  // ---- Diálogos ----
  let open = 0;
  const lock = on => {
    open = Math.max(0, open + (on ? 1 : -1));
    document.documentElement.classList.toggle('uc-lock', open > 0);
  };

  const calmMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-off');

  // Cierra con una salida corta (más rápida que la entrada). Sin movimiento, cierra al instante.
  function dismiss(dlg) {
    if (!dlg.open || dlg.dataset.closing || dlg.dataset.released) return;
    if (calmMotion()) { dlg.close(); return; }
    dlg.dataset.closing = '1';
    const finish = () => dlg.close();
    dlg.addEventListener('animationend', event => { if (event.target === dlg) finish(); });
    setTimeout(finish, 260);
  }

  function dialog(className, labelId) {
    const dlg = document.createElement('dialog');
    dlg.className = 'uc-dialog ' + className;
    dlg.setAttribute('aria-labelledby', labelId);
    dlg.addEventListener('click', event => { if (event.target === dlg) dismiss(dlg); });
    dlg.addEventListener('cancel', event => { event.preventDefault(); dismiss(dlg); });
    dlg.addEventListener('close', () => { lock(false); dlg.remove(); });
    return dlg;
  }

  // Cierre arrastrando hacia abajo desde la agarradera (móvil): sigue al dedo 1:1, resiste hacia
  // arriba y, al soltar, decide por distancia o por velocidad (un gesto rápido basta).
  function enableSwipeDown(dlg, handle) {
    let startY = 0, lastY = 0, lastT = 0, velocity = 0, active = false;
    handle.addEventListener('pointerdown', event => {
      if (event.button > 0) return;
      active = true;
      startY = lastY = event.clientY;
      lastT = event.timeStamp;
      velocity = 0;
      try { handle.setPointerCapture(event.pointerId); } catch { /* el gesto sigue funcionando sin captura */ }
      dlg.dataset.dragging = '1';
      delete dlg.dataset.released;
    });
    handle.addEventListener('pointermove', event => {
      if (!active) return;
      const dt = Math.max(1, event.timeStamp - lastT);
      velocity = (event.clientY - lastY) / dt;
      lastY = event.clientY;
      lastT = event.timeStamp;
      const dy = event.clientY - startY;
      dlg.style.transform = 'translateY(' + (dy < 0 ? dy * 0.15 : dy) + 'px)';
    });
    const release = event => {
      if (!active) return;
      active = false;
      delete dlg.dataset.dragging;
      dlg.dataset.released = '1';
      const dy = event.clientY - startY;
      if (event.type !== 'pointercancel' && (dy > 110 || velocity > 0.5)) {
        dlg.style.opacity = '0';
        dlg.style.transform = 'translateY(' + Math.max(dy, dlg.offsetHeight * 0.6) + 'px)';
        setTimeout(() => dlg.close(), 200);
      } else {
        dlg.style.transform = '';
        setTimeout(() => { delete dlg.dataset.released; }, 260);
      }
    };
    handle.addEventListener('pointerup', release);
    handle.addEventListener('pointercancel', release);
  }

  function show(dlg) {
    document.body.append(dlg);
    lock(true);
    dlg.showModal();
  }

  let all = [];
  let popup = null;
  let panel = null;
  let queue = [];
  let fab = null;

  function showNextPopup() {
    if (popup || panel || !queue.length) return;
    const item = queue.shift();
    markSeen(item.id);
    const dlg = dialog('uc-popup', 'uc-popup-title');
    const scroll = el('div', 'uc-scroll');
    const article = card(item);
    article.querySelector('.uc-title').id = 'uc-popup-title';
    scroll.append(article);
    const grab = el('div', 'uc-grab');
    grab.append(document.createElement('i'));
    grab.setAttribute('aria-hidden', 'true');
    dlg.append(grab, scroll, closeButton(t('Cerrar comunicado', 'Close announcement'), () => dismiss(dlg)));
    enableSwipeDown(dlg, grab);
    dlg.addEventListener('close', () => { popup = null; setTimeout(showNextPopup, 350); });
    popup = dlg;
    show(dlg);
    dlg.querySelector('.uc-close').focus({ preventScroll: true });
    scroll.scrollTop = 0;
  }

  function openPanel() {
    if (panel || !all.length) return;
    const dlg = dialog('uc-panel', 'uc-panel-title');
    const head = el('div', 'uc-panel-head');
    const heading = el('div');
    const title = el('h2', '', t('Comunicados', 'Announcements'));
    title.id = 'uc-panel-title';
    heading.append(title, el('small', '', t('Todos los comunicados publicados', 'Every published announcement')));
    const close = closeButton(t('Cerrar comunicados', 'Close announcements'), () => dismiss(dlg));
    head.append(heading, close);
    const scroll = el('div', 'uc-scroll');
    all.forEach(item => scroll.append(card(item)));
    // Un borde suave aparece bajo el encabezado solo cuando el contenido pasa por debajo.
    scroll.addEventListener('scroll', () => { dlg.toggleAttribute('data-scrolled', scroll.scrollTop > 4); }, { passive: true });
    dlg.append(head, scroll);
    dlg.addEventListener('close', () => { panel = null; setTimeout(showNextPopup, 350); });
    panel = dlg;
    show(dlg);
  }

  function renderFab() {
    if (!all.length) { if (fab) { fab.remove(); fab = null; } return; }
    if (!fab) {
      fab = el('button', 'uc-fab');
      fab.type = 'button';
      fab.addEventListener('click', openPanel);
      document.body.append(fab);
    }
    fab.replaceChildren(icon(MEGAPHONE_ICON), el('span', '', t('Comunicados', 'Announcements')), el('b', '', String(all.length)));
    fab.setAttribute('aria-label', t('Ver comunicados', 'View announcements') + ' (' + all.length + ')');
    fab.setAttribute('aria-haspopup', 'dialog');
  }

  // `fresh` se salta la caché del navegador: se usa justo después de publicar o eliminar.
  async function load(fresh) {
    try {
      const response = await fetch(API, { headers: { Accept: 'application/json' }, cache: fresh === true ? 'reload' : 'default' });
      if (!response.ok) return;
      const data = await response.json();
      all = Array.isArray(data.comunicados) ? data.comunicados.filter(item => item && item.id && item.title) : [];
    } catch { return; }
    renderFab();
    const seen = new Set(readSeen());
    const queued = new Set(queue.map(item => item.id));
    all.forEach(item => { if (!seen.has(item.id) && !queued.has(item.id)) queue.push(item); });
    queue = queue.filter(item => all.some(current => current.id === item.id));
    setTimeout(showNextPopup, 700);
  }

  window.UniverseAnnouncements = { open: openPanel, reload: () => load(true) };
  window.addEventListener('universe-comunicados-changed', () => load(true));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
})();
