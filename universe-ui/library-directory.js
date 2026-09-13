const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export async function renderDirectory(out) {
  out.innerHTML = '<p role="status">Cargando las colecciones de la biblioteca…</p>';
  let data;
  try {
    const response = await fetch('/universe-ui/data/library-directory.json');
    if (!response.ok) throw new Error('No disponible');
    data = await response.json();
  } catch {
    out.innerHTML = '<p class="p-notice">No se pudieron cargar las colecciones. Recarga la página para volver a intentarlo.</p>';
    return;
  }
  if (!out.isConnected) return;
  out.innerHTML = `<div class="p-subhead"><h2>Toda la biblioteca</h2><span>Elige una categoría o busca tu material</span></div>
    <div class="p-filter"><input class="p-input" type="search" aria-label="Buscar colección" placeholder="Busca álgebra, resúmenes, Vallejo, UNI…"><select class="p-select" aria-label="Categoría de biblioteca"><option value="">Todas las categorías</option>${data.groups.map(g => `<option value="${g.id}">${esc(g.title)}</option>`).join('')}</select></div>
    <p class="p-result" role="status"></p><div class="library-directory-results"></div>`;
  const query = out.querySelector('input'), category = out.querySelector('select');
  function render() {
    let count = 0;
    out.querySelector('.library-directory-results').innerHTML = data.groups.filter(g => !category.value || g.id === category.value).map(g => {
      const items = g.items.filter(item => norm(g.title + ' ' + item.title).includes(norm(query.value.trim())));
      count += items.length;
      if (!items.length) return '';
      return `<section class="library-directory-group" id="${g.id}"><div class="p-subhead"><h3>${esc(g.title)}</h3><a href="${esc(g.url)}" data-live target="_blank" rel="noopener noreferrer">Ver toda la carpeta ↗</a></div><div class="library-links">${items.map(item => `<a class="p-panel library-directory-link" href="${esc(item.url)}" data-live target="_blank" rel="noopener noreferrer"><span>${esc(item.title)}</span><small>${item.type === 'folder' ? 'Abrir carpeta' : 'Abrir recurso'} ↗</small></a>`).join('')}</div></section>`;
    }).join('') || '<p class="p-empty">No hay colecciones con estos filtros.</p>';
    out.querySelector('.p-result').textContent = `${count} ${count === 1 ? 'enlace' : 'enlaces'} a carpetas y recursos de Drive`;
  }
  query.addEventListener('input', render);
  category.addEventListener('change', render);
  render();
}
