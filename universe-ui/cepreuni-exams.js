const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export async function renderExams(out) {
  out.innerHTML = '<p role="status">Cargando exámenes…</p>';
  let data;
  try {
    const response = await fetch('/universe-ui/data/cepreuni-exams.json');
    if (!response.ok) throw new Error('No disponible');
    data = await response.json();
  } catch {
    out.innerHTML = '<p class="p-notice">No se pudieron cargar los exámenes. Recarga la página para volver a intentarlo.</p>';
    return;
  }
  if (!out.isConnected) return;
  out.innerHTML = `<a href="/cepreuni" class="text-button">← CEPREUNI</a>
    <section class="catalog-volume"><header class="catalog-divider"><span>BIBLIOTECA DE EXÁMENES</span><h2>${esc(data.category)}</h2><a href="${esc(data.source)}" data-live target="_blank" rel="noopener noreferrer">Ver carpeta de origen ↗</a></header>
    <div class="p-filter"><input class="p-input" type="search" aria-label="Buscar examen" placeholder="Buscar ciclo, examen o solucionario…"><select class="p-select" aria-label="Sección de exámenes"><option value="">Todos los exámenes</option>${data.sections.map(s => `<option value="${s.id}">${esc(s.label)}</option>`).join('')}</select></div>
    <p class="p-result" role="status"></p><div class="exam-results"></div></section>
    <dialog class="exam-preview" aria-labelledby="exam-preview-title"><div class="dialog-head"><h2 id="exam-preview-title">Vista previa del documento</h2><button class="button" type="button">Cerrar</button></div><div class="exam-frame"></div><p><a data-live target="_blank" rel="noopener noreferrer">Abrir documento en Drive ↗</a></p></dialog>`;
  const query = out.querySelector('input'), select = out.querySelector('select');
  const results = out.querySelector('.exam-results'), dialog = out.querySelector('dialog');
  const frame = dialog.querySelector('.exam-frame');
  const documents = new Map(data.sections.flatMap(s => s.documents.map(d => [d.id, {...d, section:s.label}])));
  dialog.querySelector('button').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { frame.replaceChildren(); document.body.classList.remove('modal-open'); });
  results.addEventListener('click', event => {
    const button = event.target.closest('[data-preview]');
    if (!button) return;
    const doc = documents.get(button.dataset.preview);
    dialog.querySelector('h2').textContent = `${doc.section} · ${doc.title}`;
    dialog.querySelector('a').href = doc.url;
    frame.innerHTML = `<img src="https://drive.google.com/thumbnail?id=${encodeURIComponent(doc.id)}&amp;sz=w1600" alt="Primera página de ${esc(doc.section + ' · ' + doc.title)}"><p class="source-note">Vista previa de la primera página. Abre el documento en Drive para leer todas las páginas.</p>`;
    frame.querySelector('img').addEventListener('error', event => { event.target.hidden = true; frame.querySelector('p').textContent = 'Drive no pudo cargar la vista previa. Abre el documento con el enlace inferior.'; }, {once:true});
    document.body.classList.add('modal-open');
    dialog.showModal();
  });
  function render() {
    let count = 0;
    results.innerHTML = data.sections.filter(s => !select.value || s.id === select.value).map(s => {
      const hits = s.documents.filter(d => norm(s.label + ' ' + d.title).includes(norm(query.value.trim())));
      count += hits.length;
      if (!hits.length) return '';
      return `<section class="catalog-section"><h3>${esc(s.label)}<small>${hits.length} ${hits.length === 1 ? 'documento' : 'documentos'}</small></h3><div class="p-books">${hits.map(d => `<article class="p-book exam-book"><button type="button" class="exam-thumb" data-preview="${esc(d.id)}" aria-label="Vista previa de ${esc(s.label + ' · ' + d.title)}"><img src="https://drive.google.com/thumbnail?id=${encodeURIComponent(d.id)}&amp;sz=w400" alt="Vista previa de ${esc(d.title)}" loading="lazy" width="240" height="320"><span>Ver vista previa</span></button><span class="p-label">${esc(s.label)}</span><h4>${esc(d.title)}</h4><a class="text-button" href="${esc(d.url)}" data-live target="_blank" rel="noopener noreferrer">Abrir documento ↗</a></article>`).join('')}</div></section>`;
    }).join('') || '<p class="p-empty">No hay exámenes con estos filtros.</p>';
    out.querySelector('.p-result').textContent = `${count} ${count === 1 ? 'documento' : 'documentos'} · Ciclo preuniversitario`;
    results.querySelectorAll('img').forEach(img => img.addEventListener('error', () => { img.hidden = true; img.parentElement.classList.add('preview-unavailable'); }, {once:true}));
  }
  query.addEventListener('input', render);
  select.addEventListener('change', render);
  render();
}
