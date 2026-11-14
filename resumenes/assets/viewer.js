/* Visor de documento: todas las páginas en una columna continua (sin iframe ni visor de Drive).
   PDF: pdf.js (cargado solo al abrir un PDF) dibuja cada página en un canvas cuando se acerca a la pantalla
   y la libera cuando se aleja, así un PDF de cientos de páginas no llena la memoria del teléfono.
   Imagen: la imagen original. Mientras carga, la vista previa ocupa el lugar de la primera página. */
(function () {
  'use strict';
  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/';
  var pdfjsReady = null;
  function loadPdfjs() {
    if (!pdfjsReady) {
      pdfjsReady = import(PDFJS + 'pdf.min.mjs').then(function (lib) {
        lib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.mjs';
        return lib;
      });
      pdfjsReady.catch(function () { pdfjsReady = null; });
    }
    return pdfjsReady;
  }

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function posterPage(src, ratio) {
    var p = el('div', 'page poster');
    p.style.aspectRatio = ratio || '3 / 4';
    var img = el('img');
    img.alt = '';
    img.decoding = 'async';
    img.src = src;
    p.append(img);
    return p;
  }

  // render(host, { url, ext, headers, maxPages, poster, onError, onPages }) -> { destroy }
  function render(host, opts) {
    var alive = true;
    var cleanups = [];
    host.textContent = '';
    host.setAttribute('aria-busy', 'true');
    var poster = opts.poster ? posterPage(opts.poster, opts.posterRatio) : null;
    if (poster) host.append(poster);

    function fail(err) {
      if (!alive) return;
      host.removeAttribute('aria-busy');
      if (opts.onError) opts.onError(err); else host.textContent = 'No se pudo abrir el archivo.';
    }

    if (opts.ext !== 'pdf') {
      var page = el('figure', 'page');
      page.style.margin = '0';
      page.style.aspectRatio = opts.posterRatio || '3 / 4';
      if (opts.poster) { page.style.backgroundImage = 'url("' + opts.poster + '")'; page.classList.add('has-poster'); }
      var img = el('img');
      img.alt = opts.alt || '';
      img.decoding = 'async';
      img.addEventListener('load', function () {
        page.style.aspectRatio = '';
        page.style.backgroundImage = '';
        page.classList.add('ready');
        img.classList.add('ready');
        host.removeAttribute('aria-busy');
        if (opts.onPages) opts.onPages(1);
      });
      img.addEventListener('error', function () { fail(new Error('image')); });
      if (opts.headers) {
        // Pending files need the session header, which <img> cannot send: fetch and show a blob.
        fetch(opts.url, { headers: opts.headers }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
          .then(function (b) { if (!alive) return; var u = URL.createObjectURL(b); cleanups.push(function () { URL.revokeObjectURL(u); }); img.src = u; })
          .catch(fail);
      } else {
        img.src = opts.url;
      }
      page.append(img);
      if (poster) poster.replaceWith(page); else host.append(page);
      return { destroy: function () { alive = false; cleanups.forEach(function (f) { f(); }); } };
    }

    var task = null;
    var doc = null;
    var io = null;
    var resizeTimer = 0;
    var pages = [];

    loadPdfjs().then(function (lib) {
      if (!alive) return;
      task = lib.getDocument({ url: opts.url, httpHeaders: opts.headers || undefined, disableAutoFetch: true, rangeChunkSize: 262144, isEvalSupported: false });
      return task.promise.then(function (pdf) {
        if (!alive) { pdf.destroy(); return; }
        doc = pdf;
        return pdf.getPage(1).then(function (first) {
          var vp = first.getViewport({ scale: 1 });
          var total = Math.min(pdf.numPages, opts.maxPages || pdf.numPages);
          var frag = document.createDocumentFragment();
          for (var n = 1; n <= total; n++) {
            var p = el('div', 'page');
            p.style.aspectRatio = vp.width + ' / ' + vp.height;
            p.dataset.n = n;
            if (n === 1 && opts.poster) { p.style.backgroundImage = 'url("' + opts.poster + '")'; p.classList.add('has-poster'); }
            var label = el('span', 'page-n');
            label.textContent = n + ' / ' + pdf.numPages;
            p.append(label);
            frag.append(p);
            pages.push({ el: p, n: n, canvas: null, task: null, width: 0 });
          }
          if (poster) poster.remove();
          host.append(frag);
          host.removeAttribute('aria-busy');
          if (opts.onPages) opts.onPages(pdf.numPages);
          io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              var rec = pages[Number(e.target.dataset.n) - 1];
              if (e.isIntersecting) draw(rec); else release(rec);
            });
          }, { rootMargin: '150% 0px' });
          pages.forEach(function (rec) { io.observe(rec.el); });
          window.addEventListener('resize', onResize);
        });
      });
    }).catch(fail);

    function draw(rec) {
      var width = rec.el.clientWidth;
      if (!doc || !width || rec.task || (rec.canvas && rec.width === width)) return;
      doc.getPage(rec.n).then(function (pg) {
        if (!alive) return;
        var base = pg.getViewport({ scale: 1 });
        rec.el.style.aspectRatio = base.width + ' / ' + base.height;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var vp = pg.getViewport({ scale: (width * dpr) / base.width });
        var canvas = el('canvas');
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        canvas.setAttribute('aria-label', 'Página ' + rec.n);
        canvas.setAttribute('role', 'img');
        rec.task = pg.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport: vp });
        return rec.task.promise.then(function () {
          rec.task = null;
          if (!alive) return;
          if (rec.canvas) rec.canvas.remove();
          rec.canvas = canvas;
          rec.width = width;
          rec.el.prepend(canvas);
          rec.el.classList.add('ready');
        });
      }).catch(function () { rec.task = null; });
    }

    function release(rec) {
      if (rec.task) { rec.task.cancel(); rec.task = null; }
      if (rec.canvas) {
        rec.canvas.width = rec.canvas.height = 0;
        rec.canvas.remove();
        rec.canvas = null;
        rec.width = 0;
        rec.el.classList.remove('ready');
      }
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        pages.forEach(function (rec) {
          if (!rec.canvas) return;
          var r = rec.el.getBoundingClientRect();
          if (r.bottom > -innerHeight && r.top < innerHeight * 2) draw(rec);
        });
      }, 200);
    }

    return {
      destroy: function () {
        alive = false;
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        if (io) io.disconnect();
        pages.forEach(release);
        if (task) task.destroy();
        cleanups.forEach(function (f) { f(); });
      }
    };
  }

  // Preview for an upload, made in the browser the same way tools/make-resumenes-thumbs.py makes the
  // catalog's: first PDF page or the image, its shape snapped to 16:9 ... 9:16, 360 px wide.
  // Resolves { blob, r: '4:5' } (WebP, or JPEG where the browser cannot encode WebP) or null.
  var RATIOS = [[16, 9], [3, 2], [4, 3], [5, 4], [1, 1], [4, 5], [3, 4], [2, 3], [9, 16]];
  function snap(w, h) {
    return RATIOS.reduce(function (best, r) { return Math.abs(Math.log(w / h / (r[0] / r[1]))) < Math.abs(Math.log(w / h / (best[0] / best[1]))) ? r : best; });
  }
  function snapshot(file, isPdf) {
    var W = 360;
    function toBlob(source, sw, sh) {
      var r = snap(sw, sh);
      var cw = sw, ch = sh, sx = 0;
      if (sw / sh > r[0] / r[1]) { cw = sh * r[0] / r[1]; sx = (sw - cw) / 2; } else { ch = sw * r[1] / r[0]; } // wider: centre; taller: top
      var c = el('canvas');
      c.width = W;
      c.height = Math.round(W * r[1] / r[0]);
      var ctx = c.getContext('2d', { alpha: false });
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(source, sx, 0, cw, ch, 0, 0, c.width, c.height);
      return new Promise(function (res) {
        c.toBlob(function (b) {
          if (b && b.type === 'image/webp') return res({ blob: b, r: r.join(':') });
          c.toBlob(function (j) { res(j ? { blob: j, r: r.join(':') } : null); }, 'image/jpeg', 0.72);
        }, 'image/webp', 0.62);
      });
    }
    if (!isPdf) {
      return createImageBitmap(file).then(function (bmp) { return toBlob(bmp, bmp.width, bmp.height).finally(function () { bmp.close(); }); }).catch(function () { return null; });
    }
    if (file.size > 80 * 1048576) return Promise.resolve(null); // shortcut: very large PDFs go without a preview
    return loadPdfjs().then(function (lib) {
      return file.arrayBuffer().then(function (buf) { return lib.getDocument({ data: buf, isEvalSupported: false }).promise; });
    }).then(function (pdf) {
      return pdf.getPage(1).then(function (pg) {
        var base = pg.getViewport({ scale: 1 });
        var vp = pg.getViewport({ scale: (W * 2) / base.width });
        var c = el('canvas');
        c.width = Math.floor(vp.width);
        c.height = Math.floor(vp.height);
        return pg.render({ canvasContext: c.getContext('2d', { alpha: false }), viewport: vp }).promise.then(function () {
          pdf.destroy();
          return toBlob(c, c.width, c.height);
        });
      });
    }).catch(function () { return null; });
  }

  window.ResViewer = { render: render, snapshot: snapshot };
})();
