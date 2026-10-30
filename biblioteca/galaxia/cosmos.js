/* Star map: each collection is a spiral galaxy, each of its books one bright star. Canvas 2D, no deps. */
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const WIDE = [[.30, .26], [.47, .17], [.64, .30], [.82, .18], [.55, .50], [.80, .48], [.95, .32], [.12, .19], [.15, .45], [.36, .43]];
  const TALL = [[.24, .18], [.64, .14], [.86, .26], [.42, .30], [.68, .41], [.19, .40], [.88, .51], [.48, .52], [.13, .55], [.32, .47]];
  // catalogs with only a few collections: spread them over the sky instead of the top-left corner
  const FEW_WIDE = [[.26, .30], [.58, .20], [.84, .36], [.46, .50]];
  const FEW_TALL = [[.30, .17], [.66, .28], [.34, .42], [.70, .52]];

  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function sprite(size, inner, outer) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, inner);
    grd.addColorStop(.25, outer);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    return c;
  }

  function Cosmos(root, collections, opts = {}) {
    const canvas = root.querySelector('canvas');
    const labels = root.querySelector('.cosmos-labels');
    const ctx = canvas.getContext('2d', { alpha: false });
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = matchMedia('(pointer: coarse)');
    const glowW = sprite(128, 'rgba(255,255,255,.55)', 'rgba(200,210,230,.12)');
    const glowR = sprite(128, 'rgba(255,130,100,.55)', 'rgba(255,100,70,.12)');
    const max = Math.max(...collections.map(c => c.books.length));

    let W = 0, H = 0, dpr = 1, tall = false, scale = 1;
    let t = 0, last = 0, raf = 0, running = false, visible = true;
    let hover = -1, focus = -1, px = 0, py = 0, mx = 0, my = 0, scrollY = 0;
    let zoom = null, nextScan = 1800;
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    let frozen = saveData, samples = 0, sampleSum = 0;
    const bg = [];
    const gals = collections.map((c, i) => {
      const r = rng(1000 + i * 7919);
      const n = c.books.length;
      const arms = n > 20 ? 3 : 2;
      const parts = [];
      const dust = Math.min(420, 60 + n * 9);
      for (let k = 0; k < dust + n; k++) {
        const star = k >= dust;
        const d = Math.pow(r(), star ? .8 : 1.35);
        const arm = Math.floor(r() * arms);
        const a = arm * TAU / arms + d * 4.2 + (r() - .5) * (star ? .5 : .9) * (1.1 - d);
        parts.push({ d, a, star, s: star ? 1.4 + r() * 1.2 : .5 + r() * .9, b: star ? .75 + r() * .25 : .12 + r() * .4, tw: r() * TAU });
      }
      return {
        c, i, n, parts,
        incl: .42 + r() * .38,
        tilt: (r() - .5) * 1.6,
        spin: (.00006 + r() * .00005) * (r() > .5 ? 1 : -1),
        rot: r() * TAU,
        x: 0, y: 0, R: 0, ring: 0
      };
    });

    function seedBg() {
      bg.length = 0;
      const r = rng(42);
      const count = Math.round(Math.min(520, (W * H) / 2600));
      for (let k = 0; k < count; k++) { const z = Math.pow(r(), 1.8); bg.push({ x: r(), y: r(), z: .15 + z * .85, s: z > .92 ? 1.8 : .5 + z * 1.1, tw: r() * TAU, tws: r() < .08 ? .4 + r() * 1.6 : 0 }); }
    }

    function layout() {
      const rect = root.getBoundingClientRect();
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      dpr = Math.min(devicePixelRatio || 1, coarse.matches ? 1.5 : 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      tall = H > W * 1.05;
      const few = gals.length <= FEW_WIDE.length;
      const P = few ? (tall ? FEW_TALL : FEW_WIDE) : tall ? TALL : WIDE;
      scale = Math.min(W, H * (tall ? .75 : 1.3)) * (few ? (tall ? 1.1 : 1.35) : 1);
      gals.forEach((g, i) => {
        g.x = P[i % P.length][0] * W;
        g.y = P[i % P.length][1] * H;
        g.R = scale * (tall ? .085 : .062) * (0.5 + Math.sqrt(g.n / max));
      });
      seedBg();
      placeLabels();
      if (!running) draw();
    }

    function placeLabels() {
      labels.querySelectorAll('.gal').forEach((a, i) => {
        const g = gals[i];
        a.style.transform = `translate(${Math.round(g.x)}px, ${Math.round(g.y + g.R * g.incl + 10)}px)`;
      });
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#0a0a0b';
      ctx.fillRect(0, 0, W, H);

      // camera (zoom into a galaxy on selection)
      let cz = 1, cx = 0, cy = 0;
      if (zoom) {
        const p = Math.min(1, (performance.now() - zoom.t0) / zoom.dur);
        const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        cz = 1 + e * 2.2; cx = zoom.g.x; cy = zoom.g.y;
        if (p >= 1 && !zoom.done) { zoom.done = true; zoom.cb && zoom.cb(); }
      }
      if (cz !== 1) { ctx.translate(cx, cy); ctx.scale(cz, cz); ctx.translate(-cx, -cy); }

      // parallax offsets
      mx += (px - mx) * .06; my += (py - my) * .06;
      const sy = scrollY * .25;

      ctx.globalCompositeOperation = 'lighter';
      for (const s of bg) {
        const x = s.x * W + mx * 14 * s.z;
        const y = ((s.y * H - sy * s.z) % H + H) % H + my * 10 * s.z;
        const a = .22 + .6 * s.z * (s.tws ? .6 + .4 * Math.sin(t * .001 * s.tws + s.tw) : 1);
        ctx.fillStyle = `rgba(234,234,234,${a.toFixed(3)})`;
        ctx.fillRect(x, y, s.s, s.s);
      }

      for (const g of gals) {
        const hot = g.i === hover || g.i === focus;
        const ox = g.x + mx * 22, oy = g.y + my * 16 - sy * .4;
        const cos = Math.cos(g.tilt), sin = Math.sin(g.tilt);
        const glow = hot ? glowR : glowW;
        const gs = g.R * (hot ? 3.4 : 2.8);
        ctx.globalAlpha = hot ? .9 : .65;
        ctx.drawImage(glow, ox - gs / 2, oy - gs / 2, gs, gs);
        ctx.globalAlpha = 1;
        const rot = g.rot + t * g.spin;
        for (const p of g.parts) {
          const a = p.a + rot / (p.d * .8 + .35);
          const rr = p.d * g.R;
          const lx = Math.cos(a) * rr, ly = Math.sin(a) * rr * g.incl;
          const x = ox + lx * cos - ly * sin, y = oy + lx * sin + ly * cos;
          let al = p.b;
          if (p.star) al *= .7 + .3 * Math.sin(t * .002 + p.tw);
          if (p.star && hot) ctx.fillStyle = `rgba(255,128,100,${al.toFixed(3)})`;
          else ctx.fillStyle = `rgba(236,236,240,${al.toFixed(3)})`;
          ctx.fillRect(x - p.s / 2, y - p.s / 2, p.s, p.s);
        }
        g.ox = ox; g.oy = oy;
      }

      // reticle on hovered / focused galaxy
      ctx.globalCompositeOperation = 'source-over';
      gals.forEach(g => {
        const target = (g.i === hover || g.i === focus) ? 1 : 0;
        g.ring += (target - g.ring) * .16;
        if (g.ring < .02) return;
        // orbit ellipse that follows the galaxy's own tilt, with one body travelling on it
        const rx = g.R * (1.7 - .2 * g.ring), ry = rx * g.incl;
        ctx.strokeStyle = `rgba(255,107,74,${(g.ring * .55).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(g.ox, g.oy, rx, ry, g.tilt, 0, TAU);
        ctx.stroke();
        const a = t * .0012 + g.i;
        const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
        const cs = Math.cos(g.tilt), sn = Math.sin(g.tilt);
        ctx.fillStyle = `rgba(255,140,110,${g.ring.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(g.ox + ex * cs - ey * sn, g.oy + ex * sn + ey * cs, 2.4, 0, TAU);
        ctx.fill();
      });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    function frame(now) {
      const dt = Math.min(50, now - (last || now));
      last = now;
      t += dt * (reduce.matches ? .25 : 1);
      if (hover < 0 && !zoom && now > nextScan) { focus = (focus + 1) % gals.length; nextScan = now + 2600; opts.onHover && opts.onHover(collections[focus]); }
      draw();
      if (samples < 45 && last && dt) { samples++; if (samples > 5) sampleSum += dt; if (samples === 45 && sampleSum / 40 > 24) { frozen = true; stop(); return; } }
      raf = requestAnimationFrame(frame);
    }
    const start = () => { if (!frozen && !running && visible && !document.hidden) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    function hitTest(x, y) {
      let best = -1, bd = Infinity;
      gals.forEach(g => {
        const d = Math.hypot(x - (g.ox ?? g.x), y - (g.oy ?? g.y));
        const lim = Math.max(g.R * 1.3, 34);
        if (d < lim && d < bd) { bd = d; best = g.i; }
      });
      return best;
    }

    function setHover(i) {
      if (i === hover) return;
      hover = i;
      if (i >= 0) focus = -1;
      nextScan = performance.now() + 3500;
      canvas.style.cursor = i >= 0 ? 'pointer' : '';
      labels.querySelectorAll('.gal').forEach((a, k) => a.classList.toggle('is-hot', k === i));
      opts.onHover && opts.onHover(i >= 0 ? collections[i] : focus >= 0 ? collections[focus] : null);
      if (!running) { for (let k = 0; k < 12; k++) gals.forEach(g => { g.ring += (((g.i === hover || g.i === focus) ? 1 : 0) - g.ring) * .16; }); draw(); }
    }

    function select(i) {
      if (i < 0) return;
      const done = () => { zoom = null; opts.onSelect && opts.onSelect(collections[i]); };
      if (reduce.matches || !running) return done();
      zoom = { g: gals[i], t0: performance.now(), dur: 520, cb: () => { done(); } };
    }

    // DOM labels (real links: accessible + tappable)
    labels.innerHTML = '';
    collections.forEach((c, i) => {
      const a = document.createElement('a');
      a.className = 'gal';
      a.href = `#${c.slug}`;
      a.innerHTML = `<b>${c.number}</b><span class="gal-name">${c.name}</span><span class="gal-n">${c.books.length}</span>`;
      a.addEventListener('pointerenter', () => setHover(i));
      a.addEventListener('pointerleave', () => setHover(-1));
      a.addEventListener('focus', () => setHover(i));
      a.addEventListener('blur', () => setHover(-1));
      a.addEventListener('click', e => { e.preventDefault(); select(i); });
      labels.append(a);
    });

    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (e.pointerType === 'mouse') { px = (x / W - .5) * 2; py = (y / H - .5) * 2; }
      if (e.target === canvas) setHover(hitTest(x, y));
    });
    root.addEventListener('pointerleave', () => { px = py = 0; setHover(-1); });
    canvas.addEventListener('click', e => {
      const r = root.getBoundingClientRect();
      select(hitTest(e.clientX - r.left, e.clientY - r.top));
    });

    new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }).observe(root);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    addEventListener('scroll', () => { scrollY = Math.min(H, window.scrollY); }, { passive: true });
    new ResizeObserver(() => layout()).observe(root);

    layout();
    start();
    return {
      focus(slug) { focus = collections.findIndex(c => c.slug === slug); },
      hover(slug) { setHover(slug ? collections.findIndex(c => c.slug === slug) : -1); }
    };
  }

  window.Cosmos = Cosmos;
})();
