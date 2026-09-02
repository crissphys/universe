const LIQUID_GLASS_URL = 'https://cdn.jsdelivr.net/npm/@ybouane/liquidglass@1.0.3/dist/index.js';

let modulePromise = null;
let instances = [];
let initialization = null;
let themeObserver = null;

const root = document.documentElement;

function animationsEnabled() {
  if (root.dataset.universeAnimations === 'off') return false;
  try {
    return localStorage.getItem('universe_animations') !== 'off';
  } catch (_) {
    return true;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (_) {
    return false;
  }
}

function loadLibrary() {
  modulePromise ||= import(LIQUID_GLASS_URL);
  return modulePromise;
}

function compactConfig() {
  return window.matchMedia('(max-width: 720px)').matches;
}

function panelDefaults() {
  const compact = compactConfig();
  return {
    blurAmount: compact ? 0.025 : 0.055,
    refraction: compact ? 0.28 : 0.42,
    chromAberration: compact ? 0.008 : 0.016,
    edgeHighlight: compact ? 0.08 : 0.14,
    specular: compact ? 0.07 : 0.13,
    fresnel: compact ? 0.38 : 0.55,
    distortion: 0.01,
    cornerRadius: compact ? 26 : 32,
    zRadius: compact ? 15 : 24,
    opacity: 0.86,
    saturation: 0.08,
    brightness: 0.035,
    shadowOpacity: compact ? 0.12 : 0.18,
    shadowSpread: compact ? 6 : 9,
    shadowOffsetY: 2,
    floating: false,
    button: false,
    bevelMode: 0
  };
}

function buttonDefaults() {
  const compact = compactConfig();
  return {
    blurAmount: compact ? 0.02 : 0.04,
    refraction: compact ? 0.24 : 0.34,
    chromAberration: compact ? 0.006 : 0.012,
    edgeHighlight: 0.12,
    specular: 0.12,
    fresnel: 0.48,
    distortion: 0.008,
    cornerRadius: 15,
    zRadius: compact ? 9 : 13,
    opacity: 0.88,
    saturation: 0.06,
    brightness: 0.02,
    shadowOpacity: 0.14,
    shadowSpread: 6,
    shadowOffsetY: 2,
    floating: false,
    button: true,
    bevelMode: 0
  };
}

function removeOrphanCanvases() {
  document.querySelectorAll('[data-liquid-glass] > canvas').forEach((canvas) => canvas.remove());
}

function destroy() {
  instances.forEach((instance) => {
    try { instance.destroy(); } catch (_) {}
  });
  instances = [];
  removeOrphanCanvases();
  root.dataset.liquidGlass = animationsEnabled() ? 'fallback' : 'off';
}

async function createInstance(LiquidGlass, rootElement, glassElements, defaults) {
  if (!rootElement || !glassElements.length) return null;
  return LiquidGlass.init({
    root: rootElement,
    glassElements,
    defaults
  });
}

async function createInstanceSafely(LiquidGlass, rootElement, glassElements, defaults, label) {
  try {
    return await createInstance(LiquidGlass, rootElement, glassElements, defaults);
  } catch (error) {
    glassElements.forEach((element) => {
      element.querySelectorAll(':scope > canvas').forEach((canvas) => canvas.remove());
    });
    window.__utsLiquidGlassErrors ||= [];
    window.__utsLiquidGlassErrors.push(`${label}: ${error?.message || error}`);
    console.warn(`Universe LiquidGlass (${label}): se activo el respaldo visual.`, error);
    return null;
  }
}

async function initialize() {
  if (initialization) return initialization;
  if (!animationsEnabled() || !supportsWebGL()) {
    destroy();
    return null;
  }

  initialization = (async () => {
    root.dataset.liquidGlass = 'loading';
    try {
      const { LiquidGlass } = await loadLibrary();
      if (!animationsEnabled()) {
        root.dataset.liquidGlass = 'off';
        return null;
      }

      destroy();
      const featureRoot = document.querySelector('[data-liquid-root="features"]');
      const featurePanel = featureRoot?.querySelector(':scope > [data-liquid-glass="panel"]');
      const actionRoot = document.querySelector('[data-liquid-root="actions"]');
      const actionButton = actionRoot?.querySelector(':scope > [data-liquid-glass="button"]');

      window.__utsLiquidGlassErrors = [];
      const featureInstance = await createInstanceSafely(
        LiquidGlass,
        featureRoot,
        featurePanel ? [featurePanel] : [],
        panelDefaults(),
        'panel'
      );
      if (featureInstance) instances.push(featureInstance);

      const buttonInstance = await createInstanceSafely(
        LiquidGlass,
        actionRoot,
        actionButton ? [actionButton] : [],
        buttonDefaults(),
        'boton'
      );
      if (buttonInstance) instances.push(buttonInstance);

      root.dataset.liquidGlass = instances.length ? 'ready' : 'fallback';
      return instances;
    } catch (error) {
      destroy();
      root.dataset.liquidGlass = 'fallback';
      console.warn('Universe LiquidGlass: se activo el respaldo visual.', error);
      return null;
    } finally {
      initialization = null;
    }
  })();

  return initialization;
}

function refreshTheme() {
  const scenes = document.querySelectorAll('.home-liquid-feature-scene, .home-action-liquid-scene');
  instances.forEach((instance) => {
    scenes.forEach((scene) => {
      try { instance.markChanged(scene); } catch (_) {}
    });
  });
}

function start() {
  root.dataset.liquidGlass = animationsEnabled() ? 'fallback' : 'off';
  const boot = () => initialize();
  if ('requestIdleCallback' in window) window.requestIdleCallback(boot, { timeout: 900 });
  else window.setTimeout(boot, 260);

  window.addEventListener('universe:animationschange', (event) => {
    if (event.detail?.enabled === false) destroy();
    else initialize();
  });

  themeObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === 'data-universe-theme')) refreshTheme();
  });
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-universe-theme'] });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
