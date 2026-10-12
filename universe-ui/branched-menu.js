const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const defaults = [
  { label: 'Explora', children: [
    { value: '/explorar', label: 'Plataforma', icon: 'grid' },
    { value: '/cepreuni', label: 'CEPREUNI', icon: 'cap' },
    { value: '/admision', label: 'Admisión UNI', icon: 'cap' }
  ] },
  { label: 'Aprende', children: [
    { value: '/temario', label: 'Temario', icon: 'list' },
    { value: '/clases', label: 'Clases', icon: 'play' },
    { value: '/biblioteca', label: 'Biblioteca', icon: 'book' }
  ] },
  { label: 'Practica', children: [
    { value: '/simulacros', label: 'Simulacros', icon: 'target' },
    { value: '/examenes', label: 'Exámenes', icon: 'layers' }
  ] },
  { label: 'Avanza', children: [
    { value: '/planificador', label: 'Planificador', icon: 'calendar' },
    { value: '/unitalk', label: 'UNITALK', icon: 'users' }
  ] }
];

const routeAliases = {
  '/cepreuni': ['/calculadora', '/fijas-cepreuni', '/informacion-cepreuni', '/ingresantes-cepreuni', '/docentes-cepreuni'],
  '/admision': ['/cantidad-de-postulantes', '/resultados-admision', '/calculadora-admision', '/fichas-admision', '/ranking', '/ranking-admision', '/ingresantes-uni-2026-2'],
  '/clases': ['/aula']
};
const matchesRoute = (activePath, value) => {
  const path = value.replace(/\/$/, '') || '/';
  return activePath === path
    || (path !== '/' && activePath.startsWith(`${path}/`))
    || (routeAliases[path] || []).some(alias => activePath === alias || activePath.startsWith(`${alias}/`));
};

const PAD = 6;
const MARK = 16;
const rowY = (index, rowHeight) => PAD + index * rowHeight + rowHeight / 2;
const branch = (index, rowHeight, trunk, radius, endX) => {
  const y = rowY(index, rowHeight);
  return `M ${trunk} ${y - radius} A ${radius} ${radius} 0 0 0 ${trunk + radius} ${y} H ${endX}`;
};
const reach = (index, rowHeight, trunk, radius, endX) => {
  const y = rowY(index, rowHeight);
  return `M ${trunk} 0 V ${y - radius} A ${radius} ${radius} 0 0 0 ${trunk + radius} ${y} H ${endX}`;
};
const pathLength = (index, rowHeight, trunk, radius, endX) =>
  rowY(index, rowHeight) - radius + (Math.PI * radius) / 2 + (endX - trunk - radius);

export function renderBranchedMenu(container, {
  items = defaults,
  activePath = location.pathname.replace(/\/$/, '') || '/',
  renderIcon = () => '',
  width = 240,
  rowHeight = 36,
  indent = 40,
  trunk = 14,
  radius = 10,
  lineWidth = 1.5,
  fontSize = 14,
  drawDuration = 400,
  foldDuration = 300,
  color = '#f5f5f5',
  accentColor = '#d5e2ff',
  lineColor = '#555b69'
} = {}) {
  if (!container) return;
  container.querySelector('.branched-menu')?._branchedMenuObserver?.disconnect();

  const matchingIndex = items.findIndex(item => item.children?.some(child => matchesRoute(activePath, child.value)));
  const fallbackIndex = activePath === '/' ? -1 : items.findIndex(item => item.children?.some(child => child.value === '/explorar'));
  const activeIndex = matchingIndex >= 0 ? matchingIndex : fallbackIndex;
  const open = new Set(activeIndex >= 0 ? [activeIndex] : []);
  const icon = item => item.icon ? `<span class="branched-menu__icon" aria-hidden="true">${renderIcon(item.icon)}</span>` : '';
  const activeValue = activeIndex >= 0
    ? items[activeIndex].children.find(child => matchesRoute(activePath, child.value))?.value
    : '';

  container.innerHTML = `
    <span class="side-rail__eyebrow">TODO CONECTA</span>
    <nav class="branched-menu" aria-label="Secciones de Universe" style="--bm-w:${width}px;--bm-ink:${color};--bm-accent:${accentColor};--bm-line:${lineColor};--bm-font:${fontSize}px;--bm-row:${rowHeight}px;--bm-indent:${indent}px;--bm-line-w:${lineWidth};--bm-draw:${drawDuration}ms;--bm-fold:${foldDuration}ms">
      <span class="branched-menu__marker" aria-hidden="true"></span>
      ${items.map((item, index) => {
        const children = item.children || [];
        const isOpen = open.has(index);
        const bodyHeight = PAD * 2 + children.length * rowHeight;
        const leafValue = item.value || item.label;
        const active = !children.length && activePath === leafValue;
        return `<section class="branched-menu__section" data-open="${isOpen ? '' : 'false'}">
          <button class="branched-menu__head" type="button" aria-expanded="${isOpen}" data-active="${active ? '' : 'false'}">${escapeHTML(item.label)}</button>
          ${children.length ? `<div class="branched-menu__body"><div class="branched-menu__fold"><div class="branched-menu__tree" style="height:${bodyHeight}px">
            <svg class="branched-menu__lines" width="${indent}" height="${bodyHeight}" aria-hidden="true">
              <path class="branched-menu__base" d="M ${trunk} 0 V ${rowY(children.length - 1, rowHeight) - Math.min(radius, rowHeight / 2 - 2)}" />
              ${children.map((child, childIndex) => `<path class="branched-menu__base" d="${branch(childIndex, rowHeight, trunk, Math.min(radius, rowHeight / 2 - 2), indent - 8)}" />`).join('')}
              ${children.map((child, childIndex) => {
                const length = pathLength(childIndex, rowHeight, trunk, Math.min(radius, rowHeight / 2 - 2), indent - 8);
                const selected = child.value === activeValue;
                return `<path class="branched-menu__reach" d="${reach(childIndex, rowHeight, trunk, Math.min(radius, rowHeight / 2 - 2), indent - 8)}" style="stroke-dasharray:${length};stroke-dashoffset:${selected ? 0 : length}" />`;
              }).join('')}
            </svg>
            ${children.map(child => {
              const selected = child.value === activeValue;
              const href = escapeHTML(child.value);
              return `<a class="branched-menu__item" href="${href}" aria-current="${selected ? 'page' : 'false'}" data-active="${selected ? '' : 'false'}">${icon(child)}<span class="branched-menu__label">${escapeHTML(child.label)}</span></a>`;
            }).join('')}
          </div></div></div>` : ''}
        </section>`;
      }).join('')}
    </nav>`;

  const nav = container.querySelector('.branched-menu');
  const sections = [...nav.querySelectorAll('.branched-menu__section')];
  const marker = nav.querySelector('.branched-menu__marker');
  const update = glide => {
    const head = activeIndex >= 0 ? sections[activeIndex]?.querySelector('.branched-menu__head') : null;
    if (!glide) marker.style.transition = 'none';
    if (head && open.has(activeIndex)) marker.style.top = `${head.offsetTop + (head.offsetHeight - MARK) / 2}px`;
    marker.toggleAttribute('data-on', Boolean(head && open.has(activeIndex)));
    if (!glide) {
      void marker.offsetHeight;
      marker.style.transition = '';
    }
  };

  sections.forEach((section, index) => {
    const head = section.querySelector('.branched-menu__head');
    head.addEventListener('click', () => {
      const isOpen = !open.has(index);
      if (isOpen) open.add(index);
      else open.delete(index);
      section.dataset.open = isOpen ? '' : 'false';
      head.setAttribute('aria-expanded', String(isOpen));
      section.querySelectorAll('.branched-menu__item').forEach(link => link.tabIndex = isOpen ? 0 : -1);
      update(true);
    });
    if (!open.has(index)) section.querySelectorAll('.branched-menu__item').forEach(link => link.tabIndex = -1);
  });

  update(true);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => update(false));
    observer.observe(nav);
    nav._branchedMenuObserver = observer;
  }
}
