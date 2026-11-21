/* UNIverse · Planificador: temporizador de estudio (Pomodoro y otros métodos) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'universe-focus-v1';
  // [estudio, descanso, nombre]
  const METHODS = [[25, 5, 'Pomodoro'], [20, 5, 'Corto'], [50, 10, 'Bloque'], [52, 17, '52 · 17'], [90, 20, 'Profundo'], [105, 15, 'Maratón']];
  const COOL = 5; // segundos de aviso entre fases
  const dlg = $('#focus');
  if (!dlg) return;

  let st = load() || { m: 2, phase: 'idle', endsAt: 0, left: null, n: 1, next: 'break', title: '', sub: '', id: '', sound: true };
  let tick = 0, ac = null, alarms = [], pip = null, vpip = null, wake = null, lastShown = '', baseTitle = document.title;

  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} }
  const running = () => st.phase !== 'idle';
  const paused = () => st.left != null;
  const durOf = ph => ph === 'study' ? METHODS[st.m][0] * 60000 : ph === 'break' ? METHODS[st.m][1] * 60000 : COOL * 1000;
  const remaining = () => paused() ? st.left : Math.max(0, st.endsAt - Date.now());

  /* ---------- Motor ---------- */
  function begin(phase = 'study') {
    st.phase = phase; st.endsAt = Date.now() + durOf(phase); st.left = null;
    save(); arm(); render(true);
  }
  // Recupera fases que terminaron con la pestaña en segundo plano.
  function advance() {
    let guard = 0;
    while (running() && !paused() && Date.now() >= st.endsAt && guard++ < 60) {
      const end = st.endsAt, fresh = Date.now() - end < 15000;
      if (st.phase === 'cool') {
        st.phase = st.next; st.endsAt = end + durOf(st.phase);
        if (st.phase === 'study') st.n++;
      } else {
        const was = st.phase;
        st.next = was === 'study' ? 'break' : 'study';
        st.phase = 'cool'; st.endsAt = end + COOL * 1000;
        if (fresh) notify(was);
        if (was === 'study') document.dispatchEvent(new CustomEvent('focus:studied', { detail: { id: st.id } }));
      }
      save(); arm();
    }
  }
  function pause() { if (!running() || paused()) return; st.left = remaining(); save(); arm(); render(true); }
  function resume() { if (!paused()) return; st.endsAt = Date.now() + st.left; st.left = null; save(); arm(); render(true); }
  function skip() {
    if (!running()) return;
    if (paused()) resume();
    st.endsAt = Date.now(); advance();
    if (st.phase === 'cool') { st.endsAt = Date.now(); advance(); } // saltar no espera el aviso
    render(true);
  }
  function stop() {
    st.phase = 'idle'; st.left = null; st.n = 1; save(); arm();
    document.title = baseTitle; render(true); closePip();
  }

  /* ---------- Alarma (Web Audio programado: suena aunque la pestaña esté en segundo plano) ---------- */
  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }
  function tone(at, f, len, vol) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(g); g.connect(ac.destination);
    o.start(at); o.stop(at + len + 0.03);
    alarms.push(o);
  }
  function arm() {
    alarms.forEach(o => { try { o.stop(); } catch {} });
    alarms = [];
    if (!st.sound || !running() || paused() || !audio()) return;
    const coolStart = st.phase === 'cool' ? st.endsAt - COOL * 1000 : st.endsAt;
    const now = Date.now(), t0 = ac.currentTime;
    const at = ms => t0 + (ms - now) / 1000;
    for (let i = 0; i < COOL; i++) {
      const t = coolStart + i * 1000;
      if (t < now - 40) continue;
      tone(at(t), 1046, 0.11, 0.09); tone(at(t + 160), 1046, 0.11, 0.09);
    }
    const fin = coolStart + COOL * 1000;
    if (fin >= now) { tone(at(fin), 784, 0.22, 0.1); tone(at(fin + 220), 1175, 0.45, 0.1); }
  }

  /* ---------- Avisos fuera de la página ---------- */
  function notify(was) {
    if (!document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
    const [s, b] = METHODS[st.m];
    try { new Notification(was === 'study' ? 'Descanso en 5 s' : 'A estudiar en 5 s', { body: was === 'study' ? `${b} min de descanso` : `${s} min · ${st.title || 'Estudio'}`, tag: 'universe-focus', renotify: true, icon: '/favicon.svg' }); } catch {}
  }
  function askNotify() { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {}); }
  async function keepAwake() {
    if (!('wakeLock' in navigator) || !dlg.open || document.hidden || wake) return;
    try { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } catch {}
  }

  /* ---------- Vista ---------- */
  const fmtT = ms => { const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(x).padStart(2, '0'); };
  const label = () => st.phase === 'study' ? 'Estudio' : st.phase === 'break' ? 'Descanso' : st.phase === 'cool' ? (st.next === 'break' ? 'Descanso en' : 'Estudio en') : 'Listo';
  function view() {
    const left = remaining(), cool = st.phase === 'cool';
    const total = durOf(st.phase === 'idle' ? 'study' : st.phase);
    return { left, cool, txt: st.phase === 'idle' ? fmtT(durOf('study')) : cool ? String(Math.max(1, Math.ceil(left / 1000))) : fmtT(left), p: st.phase === 'idle' ? 0 : 1 - left / total, lbl: label() };
  }
  function render(force) {
    advance();
    const v = view();
    const key = v.txt + v.lbl + paused() + st.m;
    if (!force && key === lastShown) { progress(v); return; }
    lastShown = key;
    dlg.dataset.phase = st.phase;
    dlg.classList.toggle('is-paused', paused());
    $('#f-time').textContent = v.txt;
    $('#f-label').textContent = v.lbl;
    $('#f-round').textContent = st.phase === 'idle' ? '' : `Ronda ${st.n}`;
    $('#f-title').textContent = st.title || 'Estudio libre';
    $('#f-sub').textContent = st.sub || '';
    $('#f-play').setAttribute('aria-label', !running() || paused() ? 'Iniciar' : 'Pausar');
    $('#f-play').dataset.state = !running() || paused() ? 'play' : 'pause';
    $('#f-sound').setAttribute('aria-pressed', String(st.sound));
    $$('#f-methods button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === st.m)));
    if (v.cool) { const n = $('#f-time'); n.classList.remove('beat'); void n.offsetWidth; n.classList.add('beat'); }
    progress(v);
    document.title = running() ? `${v.cool ? v.txt + ' s' : v.txt} · ${v.lbl}` : baseTitle;
    $('#f-pill').hidden = !running() || dlg.open;
    $('#f-pill-t').textContent = `${v.lbl} ${v.cool ? v.txt + ' s' : v.txt}`;
    if (pip) paintPip(v);
    if (vpip) paintVideo(v);
  }
  function progress(v) { $('#f-bar').style.transform = `scaleX(${Math.min(1, Math.max(0, v.p)).toFixed(4)})`; }
  function loop() { clearInterval(tick); tick = setInterval(() => render(false), 250); }

  /* ---------- Ventana flotante ---------- */
  const canDocPip = 'documentPictureInPicture' in window;
  const canVideoPip = !!(document.pictureInPictureEnabled && HTMLCanvasElement.prototype.captureStream);
  async function openPip() {
    askNotify();
    if (canDocPip) {
      try {
        const w = await window.documentPictureInPicture.requestWindow({ width: 300, height: 190 });
        const d = w.document;
        d.head.innerHTML = `<meta charset="utf-8"><title>UNIverse</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@500;600&display=swap"><link rel="stylesheet" href="/planificador/plan.css?v=${encodeURIComponent($('link[href*="plan.css"]').href.split('v=')[1] || '')}">`;
        d.body.className = 'pip-body';
        d.body.innerHTML = `<div class="pip" id="pip"><p class="pip-l" id="pl"></p><p class="pip-t" id="pt"></p><div class="pip-bar"><i id="pb"></i></div><div class="pip-c"><button type="button" id="pp" aria-label="Pausar"></button><button type="button" id="ps" aria-label="Saltar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 7 5-7 5zM15 5v10"/></svg></button></div></div>`;
        d.getElementById('pp').onclick = () => { paused() || !running() ? (running() ? resume() : begin()) : pause(); };
        d.getElementById('ps').onclick = skip;
        w.addEventListener('pagehide', () => { pip = null; $('#f-pip').setAttribute('aria-pressed', 'false'); });
        pip = d; $('#f-pip').setAttribute('aria-pressed', 'true');
        render(true);
        return;
      } catch {}
    }
    if (canVideoPip) {
      try {
        const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270;
        const vid = document.createElement('video'); vid.muted = true; vid.playsInline = true;
        vid.srcObject = cv.captureStream(4);
        vpip = { cv, vid, g: cv.getContext('2d') };
        paintVideo(view());
        await vid.play();
        await vid.requestPictureInPicture();
        vid.addEventListener('leavepictureinpicture', () => { vpip = null; $('#f-pip').setAttribute('aria-pressed', 'false'); });
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({ title: 'Temporizador', artist: 'UNIverse' });
          navigator.mediaSession.setActionHandler('play', () => { running() ? resume() : begin(); vid.play(); });
          navigator.mediaSession.setActionHandler('pause', () => pause());
          try { navigator.mediaSession.setActionHandler('nexttrack', skip); } catch {}
        }
        $('#f-pip').setAttribute('aria-pressed', 'true');
      } catch { vpip = null; }
    }
  }
  function closePip() {
    if (pip) { try { pip.defaultView.close(); } catch {} pip = null; }
    if (vpip && document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
    vpip = null;
  }
  function paintPip(v) {
    const d = pip;
    d.getElementById('pip').dataset.phase = st.phase;
    d.getElementById('pl').textContent = v.lbl;
    d.getElementById('pt').textContent = v.txt;
    d.getElementById('pb').style.transform = `scaleX(${Math.min(1, Math.max(0, v.p)).toFixed(4)})`;
    const pp = d.getElementById('pp');
    pp.innerHTML = paused() || !running() ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4.5v11l9-5.5z"/></svg>' : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4.5v11M13 4.5v11"/></svg>';
  }
  function paintVideo(v) {
    const { g, cv } = vpip;
    const accent = st.phase === 'break' ? '#6fd3a5' : st.phase === 'cool' ? '#ffb94a' : '#ff6b4a';
    g.fillStyle = '#0b0b0e'; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = '#a1a1aa'; g.font = '500 26px Geist, system-ui, sans-serif'; g.textAlign = 'center';
    g.fillText(v.lbl + (paused() ? ' · pausa' : ''), 240, 62);
    g.fillStyle = '#f4f4f5'; g.font = `600 ${v.cool ? 150 : 118}px Geist, system-ui, sans-serif`;
    g.fillText(v.txt, 240, 192);
    g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(40, 232, 400, 6);
    g.fillStyle = accent; g.fillRect(40, 232, 400 * Math.min(1, Math.max(0, v.p)), 6);
  }

  /* ---------- Controles ---------- */
  dlg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'f-play') { audio(); !running() ? begin() : paused() ? resume() : pause(); }
    else if (b.id === 'f-skip') skip();
    else if (b.id === 'f-stop') { stop(); dlg.close(); }
    else if (b.id === 'f-min') dlg.close();
    else if (b.id === 'f-pip') { pip || vpip ? closePip() : openPip(); }
    else if (b.id === 'f-sound') { st.sound = !st.sound; save(); arm(); render(true); }
    else if (b.parentElement.id === 'f-methods') { st.m = +b.dataset.i; st.n = 1; audio(); begin('study'); }
  });
  dlg.addEventListener('close', () => { render(true); if (wake) { wake.release().catch(() => {}); wake = null; } });
  dlg.addEventListener('cancel', e => { e.preventDefault(); dlg.close(); });
  document.addEventListener('keydown', e => {
    if (!dlg.open || e.target.closest('input, textarea, select')) return;
    if (e.code === 'Space') { e.preventDefault(); $('#f-play').click(); }
  });
  $('#f-pill').addEventListener('click', () => open());
  document.addEventListener('visibilitychange', () => { render(true); arm(); keepAwake(); });
  $('#f-pip').hidden = !canDocPip && !canVideoPip;
  $('#f-methods').innerHTML = METHODS.map(([s, b, n], i) => `<button type="button" data-i="${i}"><b>${s}<i>·</i>${b}</b><span>${esc(n)}</span></button>`).join('');

  function open(detail) {
    if (detail && (detail.id !== st.id || !running())) { st.title = detail.title || ''; st.sub = detail.sub || ''; st.id = detail.id || ''; }
    if (!dlg.open) dlg.showModal();
    audio();
    if (!running()) { st.n = 1; begin('study'); askNotify(); }
    keepAwake();
    render(true);
  }
  document.addEventListener('focus:open', e => open(e.detail));
  loop();
  render(true);
  if (running()) arm();

  window.__focus = { get state() { return st; }, skip, pause, resume, stop, METHODS };
})();
