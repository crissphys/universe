(function () {
  'use strict';

  const FALLOFF_CURVES = {
    linear: t => t,
    smooth: t => t * t * (3 - 2 * t),
    sharp: t => t * t * t
  };

  const hexToRgb = hex => {
    const h = hex.replace('#', '');
    const value = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const number = parseInt(value.slice(0, 6), 16);
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
  };

  const DEFAULTS = {
    cellSize: 70,
    color: '#D946EF',
    radius: 140,
    falloff: 'smooth',
    holdTime: 400,
    fadeDuration: 800,
    lineWidth: 1.2,
    maxOpacity: 1,
    fillOpacity: 0,
    gridOpacity: 0,
    cellRadius: 0,
    clickPulse: true,
    pulseSpeed: 600
  };

  const mount = (container, options) => {
    if (!container || container.dataset.cursorGridMounted === 'true') return null;

    const props = Object.assign({}, DEFAULTS, options || {});
    const canvas = document.createElement('canvas');
    canvas.className = 'cursor-grid__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.classList.add('cursor-grid');
    container.appendChild(canvas);
    container.dataset.cursorGridMounted = 'true';

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cols = 0;
    let rows = 0;
    let offX = 0;
    let offY = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let width = 0;
    let height = 0;
    const pulses = [];
    let raf = 0;
    let running = false;
    let lastFrame = 0;

    const rebuild = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / props.cellSize) + 1;
      rows = Math.ceil(height / props.cellSize) + 1;
      offX = (width - cols * props.cellSize) / 2;
      offY = (height - rows * props.cellSize) / 2;
      alphas = new Float32Array(cols * rows);
      touched = new Float64Array(cols * rows);
    };

    const cellCenter = index => [
      offX + (index % cols) * props.cellSize + props.cellSize / 2,
      offY + Math.floor(index / cols) * props.cellSize + props.cellSize / 2
    ];

    const energize = (x, y, boost) => {
      const radius = Math.max(props.radius, 1);
      const ease = FALLOFF_CURVES[props.falloff] || FALLOFF_CURVES.linear;
      const now = performance.now();
      const minCol = Math.max(0, Math.floor((x - radius - offX) / props.cellSize));
      const maxCol = Math.min(cols - 1, Math.floor((x + radius - offX) / props.cellSize));
      const minRow = Math.max(0, Math.floor((y - radius - offY) / props.cellSize));
      const maxRow = Math.min(rows - 1, Math.floor((y + radius - offY) / props.cellSize));

      for (let row = minRow; row <= maxRow; row += 1) {
        for (let col = minCol; col <= maxCol; col += 1) {
          const index = row * cols + col;
          const [cx, cy] = cellCenter(index);
          const distance = Math.hypot(cx - x, cy - y);
          if (distance > radius) continue;
          const level = ease(1 - distance / radius) * props.maxOpacity * (boost === undefined ? 1 : boost);
          if (level > alphas[index]) alphas[index] = level;
          if (level > 0) touched[index] = now;
        }
      }
    };

    const draw = now => {
      const elapsed = Math.min(now - lastFrame, 50);
      lastFrame = now;
      ctx.clearRect(0, 0, width, height);
      const [red, green, blue] = hexToRgb(props.color);

      if (props.gridOpacity > 0) {
        ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${props.gridOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let col = 0; col <= cols; col += 1) {
          const x = Math.round(offX + col * props.cellSize) + 0.5;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let row = 0; row <= rows; row += 1) {
          const y = Math.round(offY + row * props.cellSize) + 0.5;
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      for (let pulseIndex = pulses.length - 1; pulseIndex >= 0; pulseIndex -= 1) {
        const pulse = pulses[pulseIndex];
        const age = (now - pulse.t0) / 1000;
        const ringRadius = age * props.pulseSpeed;
        if (ringRadius > Math.hypot(width, height)) {
          pulses.splice(pulseIndex, 1);
          continue;
        }

        const band = props.cellSize;
        const minCol = Math.max(0, Math.floor((pulse.x - ringRadius - band - offX) / props.cellSize));
        const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringRadius + band - offX) / props.cellSize));
        const minRow = Math.max(0, Math.floor((pulse.y - ringRadius - band - offY) / props.cellSize));
        const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringRadius + band - offY) / props.cellSize));

        for (let row = minRow; row <= maxRow; row += 1) {
          for (let col = minCol; col <= maxCol; col += 1) {
            const index = row * cols + col;
            const [cx, cy] = cellCenter(index);
            const distance = Math.hypot(cx - pulse.x, cy - pulse.y);
            if (Math.abs(distance - ringRadius) < band / 2 && props.maxOpacity > alphas[index]) {
              alphas[index] = props.maxOpacity;
              touched[index] = now;
            }
          }
        }
      }

      let anyVisible = pulses.length > 0;
      const fadeStep = elapsed / Math.max(props.fadeDuration, 16);
      const half = props.cellSize / 2;

      for (let index = 0; index < alphas.length; index += 1) {
        let alpha = alphas[index];
        if (alpha <= 0) continue;
        if (now - touched[index] > props.holdTime) {
          alpha = Math.max(0, alpha - fadeStep);
          alphas[index] = alpha;
          if (alpha <= 0) continue;
        }
        anyVisible = true;

        const [cx, cy] = cellCenter(index);
        const gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, props.cellSize);
        gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
        const x = cx - half + 0.5;
        const y = cy - half + 0.5;
        const size = props.cellSize - 1;

        ctx.beginPath();
        if (props.cellRadius > 0 && typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, size, size, props.cellRadius);
        } else {
          ctx.rect(x, y, size, size);
        }
        if (props.fillOpacity > 0) {
          ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * props.fillOpacity})`;
          ctx.fill();
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = props.lineWidth;
        ctx.stroke();
      }

      if (anyVisible) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        if (props.gridOpacity <= 0) ctx.clearRect(0, 0, width, height);
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    };

    const pointInside = event => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return x >= 0 && y >= 0 && x <= rect.width && y <= rect.height ? [x, y] : null;
    };

    const onPointerMove = event => {
      const point = pointInside(event);
      if (!point) return;
      energize(point[0], point[1]);
      wake();
    };

    const onPointerDown = event => {
      if (!props.clickPulse) return;
      const point = pointInside(event);
      if (!point) return;
      pulses.push({ x: point[0], y: point[1], t0: performance.now() });
      wake();
    };

    const resizeObserver = new ResizeObserver(() => {
      rebuild();
      wake();
    });
    resizeObserver.observe(container);
    rebuild();
    wake();

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    return {
      destroy() {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerDown);
        canvas.remove();
        delete container.dataset.cursorGridMounted;
      }
    };
  };

  window.CursorGrid = { mount };

  const initialize = () => {
    const container = document.getElementById('cepre-cursor-grid');
    if (!container) return;
    let instance = null;
    const sync = () => {
      const enabled = document.documentElement.dataset.universeAnimations !== 'off';
      if (!enabled && instance) {
        instance.destroy();
        instance = null;
        return;
      }
      if (!enabled || instance) return;
      instance = mount(container, {
        cellSize: 30,
        color: '#4b919c',
        radius: 80,
        falloff: 'linear',
        holdTime: 0,
        fadeDuration: 1050,
        lineWidth: 0.9,
        maxOpacity: 1,
        fillOpacity: 0,
        gridOpacity: 0,
        cellRadius: 0,
        clickPulse: true,
        pulseSpeed: 300
      });
    };
    sync();
    window.addEventListener('universe:animationschange', sync);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
