/* Panel de revisión: la página solo muestra; cada lectura y cada decisión la autoriza el servidor
   (/api/resumenes/admin/*, rol verificado contra ADMIN_EMAILS / ADMIN_EMAIL_SHA256 en cada petición). */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const token = () => { try { return localStorage.getItem('universe_auth_token') || ''; } catch { return ''; } };
  let status = 'pending';
  const viewers = [];
  let gsi = false;

  async function api(path, method = 'GET', body) {
    const headers = { Authorization: 'Bearer ' + token() };
    if (body) headers['Content-Type'] = 'application/json';
    const r = await fetch('/api/resumenes' + path, { method, headers, cache: 'no-store', body: body ? JSON.stringify(body) : undefined });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(out.error || 'http'), { status: r.status });
    return out;
  }
  function node(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  const size = b => b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB';
  const date = t => t ? new Date(t).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  let toastTimer = 0;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2400); }

  function gate(msg) {
    $('panel').hidden = true;
    $('denied').hidden = true;
    $('gate').hidden = false;
    if (msg) $('gate-msg').textContent = msg;
    const host = $('gate').querySelector('[data-google-signin]');
    if (!gsi && window.UniverseGoogleAuth) { gsi = true; UniverseGoogleAuth.open(host); }
  }

  async function load() {
    const u = window.UniverseGoogleAuth && UniverseGoogleAuth.user();
    if (!u || u.provider !== 'google') return gate();
    $('gate').hidden = true;
    viewers.splice(0).forEach(v => v.destroy());
    const q = $('queue');
    q.textContent = 'Cargando…';
    let data;
    try { data = await api('/admin/queue?status=' + status); } catch (e) {
      q.textContent = '';
      if (e.status === 403) { $('panel').hidden = true; $('denied').hidden = false; return; }
      if (e.status === 401) return gate('Tu sesión venció. Vuelve a ingresar.');
      q.textContent = 'No se pudo cargar la lista.';
      return;
    }
    $('denied').hidden = true;
    $('panel').hidden = false;
    if (status === 'pending') $('n-pending').textContent = data.items.length || '';
    q.textContent = '';
    if (!data.items.length) { q.append(node('p', 'notice', status === 'pending' ? 'No hay resúmenes pendientes.' : 'No hay resúmenes en esta lista.')); return; }
    data.items.forEach(it => q.append(card(it)));
  }

  function card(it) {
    const c = node('article', 'review');
    const prev = node('div', 'review-prev');
    prev.setAttribute('aria-label', 'Vista previa');
    const body = node('div');
    body.append(node('h2', '', it.t));
    if (it.d) body.append(node('p', 'doc-desc', it.d));
    const dl = node('dl', 'doc-meta');
    [['Año', it.y], ['Archivo', it.name + ' · ' + size(it.s)], ['Subido por', it.ownerName + (it.ownerEmail ? ' (' + it.ownerEmail + ')' : '')], ['Fecha', date(it.createdAt)], ['Nota', it.note]].forEach(([k, v]) => {
      if (v) dl.append(node('dt', '', k), node('dd', '', String(v)));
    });
    body.append(dl);
    const actions = node('div', 'review-actions');
    if (it.status === 'pending' || it.status === 'approved') {
      const note = node('input');
      note.placeholder = 'Motivo (opcional, lo ve quien lo subió)';
      note.maxLength = 300;
      note.setAttribute('aria-label', 'Motivo del rechazo');
      const ok = node('button', 'btn-ok', 'Aprobar');
      ok.type = 'button';
      const no = node('button', 'btn-no', it.status === 'approved' ? 'Retirar' : 'Rechazar');
      no.type = 'button';
      if (it.status === 'approved') ok.hidden = true;
      const decide = async action => {
        ok.disabled = no.disabled = true;
        try {
          await api('/admin/review', 'POST', { id: it.id, action, note: note.value });
          toast(action === 'approve' ? 'Aprobado y publicado' : 'Rechazado');
          c.remove();
          if (!$('queue').children.length) load();
        } catch (e) {
          ok.disabled = no.disabled = false;
          toast(e.status === 403 ? 'Sin permisos de administrador' : 'No se pudo guardar la decisión');
        }
      };
      ok.addEventListener('click', () => decide('approve'));
      no.addEventListener('click', () => decide('reject'));
      actions.append(note, ok, no);
    }
    if (it.status !== 'rejected') {
      const open = node('a', 'btn-quiet', 'Abrir archivo');
      open.href = '#';
      open.addEventListener('click', async e => {
        e.preventDefault();
        const r = await fetch('/api/resumenes/file/' + it.id, { headers: { Authorization: 'Bearer ' + token() } });
        if (!r.ok) return toast('No se pudo abrir el archivo');
        const url = URL.createObjectURL(await r.blob());
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      });
      actions.append(open);
      viewers.push(ResViewer.render(prev, { url: '/api/resumenes/file/' + it.id, ext: it.e, headers: { Authorization: 'Bearer ' + token() }, maxPages: 3, alt: it.t, onError: () => { prev.textContent = 'No se pudo mostrar la vista previa.'; } }));
    } else {
      prev.append(node('p', 'notice', 'El archivo rechazado se eliminó del almacenamiento.'));
    }
    body.append(actions);
    c.append(prev, body);
    return c;
  }

  document.querySelectorAll('[data-status]').forEach(b => b.addEventListener('click', () => {
    status = b.dataset.status;
    document.querySelectorAll('[data-status]').forEach(x => { const on = x === b; x.setAttribute('aria-pressed', on); x.setAttribute('aria-selected', on); });
    load();
  }));
  addEventListener('universe-google-auth', load);
  if (document.readyState === 'complete') load(); else addEventListener('load', load);
})();
