/* Strands (React Bits, JS-CSS variant) ported to vanilla JS: same shaders, props and defaults.
   ogl comes from /universe-ui/vendor/ogl.min.js (bundled from the ogl npm package, no build step).
   createStrands(container, options) mounts the canvas and returns {update, setMotion, destroy}.
   The loop only runs while the container is on screen, the tab is visible and motion is enabled;
   otherwise one still frame is kept. Requires WebGL2 and throws without it so callers can fall back. */
import { Renderer, Program, Mesh, Color, Triangle, RenderTarget } from './vendor/ogl.min.js';

const MAX_STRANDS = 12;
const MAX_COLORS = 8;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount;
uniform int uStrandCount;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaviness;
uniform float uThickness;
uniform float uGlow;
uniform float uTaper;
uniform float uSpread;
uniform float uHueShift;
uniform float uIntensity;
uniform float uOpacity;
uniform float uScale;
uniform float uSaturation;

out vec4 fragColor;

const float PI = 3.14159265;

vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(2.0 * PI * (t + vec3(0.00, 0.33, 0.67)));
}

vec3 samplePalette(float t) {
  t = fract(t);
  float scaled = t * float(uColorCount);
  int idx = int(floor(scaled));
  float blend = fract(scaled);
  int nextIdx = idx + 1;
  if (nextIdx >= uColorCount) nextIdx = 0;
  return mix(uColors[idx], uColors[nextIdx], blend);
}

vec3 strandColor(float t) {
  if (uColorCount > 0) return samplePalette(t);
  return spectrum(t);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv /= max(uScale, 0.0001);

  float e = 0.06 + uIntensity * 0.94;
  float env = pow(max(cos(uv.x * PI * 1.3), 0.0), uTaper);

  vec3 col = vec3(0.0);

  for (int i = 0; i < ${MAX_STRANDS}; i++) {
    if (i >= uStrandCount) break;

    float fi = float(i);
    float ph = fi * 1.7 * uSpread;
    float freq = (2.0 + fi * 0.35) * uWaviness;
    float spd = 1.4 + fi * 1.2;

    float tt = uTime * uSpeed;
    float w = sin(uv.x * freq + tt * spd + ph) * 0.60
            + sin(uv.x * freq * 1.1 - tt * spd * 0.7 + ph * 1.7) * 0.40;

    float amp = (0.1 + 0.02 * e) * env * uAmplitude;
    float y = w * amp;

    float d = abs(uv.y - y);
    float thick = (0.001 + 0.05 * e) * (0.35 + env) * uThickness;
    float g = thick / (d + thick * 0.45);
    g = g * g;

    float h = fi / float(uStrandCount) + uv.x * 0.30 + uTime * 0.04 + uHueShift;
    col += strandColor(h) * g * env;
  }

  col *= 0.45 + 0.7 * e;
  col = 1.0 - exp(-col * uGlow);

  float gray = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = max(mix(vec3(gray), col, uSaturation), 0.0);

  float lum = max(max(col.r, col.g), col.b);
  float alpha = clamp(lum, 0.0, 1.0) * uOpacity;

  fragColor = vec4(col * uOpacity, alpha);
}
`;

const GLASS_FRAG = `#version 300 es
precision highp float;

uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uRefraction;
uniform float uDispersion;

out vec4 fragColor;

vec2 toUv(vec2 p) {
  return p * (uResolution.y / uResolution) + 0.5;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float d = length(p);
  float r = uRadius;

  float edge = fwidth(d) * 1.5;
  float mask = 1.0 - smoothstep(r - edge, r + edge, d);
  if (mask <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }

  float z = sqrt(max(r * r - d * d, 0.0)) / r;
  float nd = d / r;

  vec2 dir = d > 0.0 ? p / d : vec2(0.0);
  float lens = smoothstep(0.85, 1.0, nd) * pow(nd, 6.0);
  vec2 offset = -dir * lens * uRefraction * 0.15;
  vec2 disp = -dir * lens * uDispersion * 0.012;

  vec3 light;
  light.r = texture(uScene, toUv(p + offset - disp)).r;
  light.g = texture(uScene, toUv(p + offset)).g;
  light.b = texture(uScene, toUv(p + offset + disp)).b;

  float fres = pow(1.0 - z, 3.0);
  vec3 rim = vec3(1.0) * fres * 0.18;

  vec2 lightDir = normalize(vec2(-0.55, 0.6));
  float spec = pow(max(dot(p / max(r, 1e-4), lightDir), 0.0), 6.0);
  spec *= smoothstep(r, r * 0.55, d);

  vec3 emissive = light + rim + vec3(spec) * 0.4;
  float emissiveA = clamp(max(max(emissive.r, emissive.g), emissive.b), 0.0, 1.0);

  float bodyA = 0.05 + fres * 0.05;

  float outA = emissiveA + bodyA * (1.0 - emissiveA);
  vec3 outRGB = emissive;

  outRGB *= mask;
  outA *= mask;

  fragColor = vec4(outRGB, outA);
}
`;

const DEFAULTS = {
  colors: ['#FF4242', '#7C3AED', '#06B6D4', '#EAB308'],
  count: 3,
  speed: 0.5,
  amplitude: 1,
  waviness: 1,
  thickness: 0.7,
  glow: 2.6,
  taper: 3,
  spread: 1,
  hueShift: 0,
  intensity: 0.6,
  saturation: 1.5,
  opacity: 1,
  scale: 1.5,
  glass: false,
  refraction: 1,
  dispersion: 1,
  glassSize: 1
};

const buildPalette = colors => {
  const filled = colors && colors.length ? colors : ['#ffffff'];
  const padded = [];
  for (let i = 0; i < MAX_COLORS; i++) {
    const c = new Color(filled[i] ?? filled[filled.length - 1]);
    padded.push([c.r, c.g, c.b]);
  }
  return padded;
};

export function createStrands(container, options = {}) {
  const props = { ...DEFAULTS, ...options };
  let motion = options.motion ?? true;

  // The React Bits version renders at dpr 1; a capped dpr keeps the lines crisp on HiDPI screens.
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr });
  const gl = renderer.gl;
  if (!renderer.isWebgl2) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    throw new Error('Strands needs WebGL2');
  }
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.canvas.style.backgroundColor = 'transparent';

  const geometry = new Triangle(gl);
  if (geometry.attributes.uv) delete geometry.attributes.uv;

  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: [1, 1] },
      uColors: { value: buildPalette(props.colors) },
      uColorCount: { value: 0 },
      uStrandCount: { value: 1 },
      uSpeed: { value: 0 },
      uAmplitude: { value: 0 },
      uWaviness: { value: 0 },
      uThickness: { value: 0 },
      uGlow: { value: 0 },
      uTaper: { value: 0 },
      uSpread: { value: 0 },
      uHueShift: { value: 0 },
      uIntensity: { value: 0 },
      uOpacity: { value: 0 },
      uScale: { value: 1 },
      uSaturation: { value: 0 }
    }
  });
  const mesh = new Mesh(gl, { geometry, program });

  const renderTarget = new RenderTarget(gl, { width: 1, height: 1 });
  const glassProgram = new Program(gl, {
    vertex: VERT,
    fragment: GLASS_FRAG,
    uniforms: {
      uScene: { value: renderTarget.texture },
      uResolution: { value: [1, 1] },
      uRadius: { value: 0.46 },
      uRefraction: { value: 1 },
      uDispersion: { value: 1 }
    }
  });
  const glassMesh = new Mesh(gl, { geometry, program: glassProgram });

  const applyProps = () => {
    const u = program.uniforms;
    u.uColors.value = buildPalette(props.colors);
    u.uColorCount.value = Math.min(props.colors.length, MAX_COLORS);
    u.uStrandCount.value = Math.min(Math.max(Math.round(props.count), 1), MAX_STRANDS);
    u.uSpeed.value = props.speed;
    u.uAmplitude.value = props.amplitude;
    u.uWaviness.value = props.waviness;
    u.uThickness.value = props.thickness;
    u.uGlow.value = props.glow;
    u.uTaper.value = props.taper;
    u.uSpread.value = props.spread;
    u.uHueShift.value = props.hueShift;
    u.uIntensity.value = props.intensity;
    u.uOpacity.value = props.opacity;
    u.uScale.value = props.scale;
    u.uSaturation.value = props.saturation;
    glassProgram.uniforms.uRefraction.value = props.refraction;
    glassProgram.uniforms.uDispersion.value = props.dispersion;
    glassProgram.uniforms.uRadius.value = 0.46 * props.glassSize;
  };
  applyProps();

  container.appendChild(gl.canvas);

  // The shaders work in drawing-buffer pixels (gl_FragCoord), so resolution follows the dpr.
  function resize() {
    const width = Math.max(1, container.offsetWidth);
    const height = Math.max(1, container.offsetHeight);
    renderer.setSize(width, height);
    const res = [gl.canvas.width, gl.canvas.height];
    program.uniforms.uResolution.value = res;
    glassProgram.uniforms.uResolution.value = res;
    renderTarget.setSize(res[0], res[1]);
  }

  let time = 0;
  let last = 0;
  let frame = 0;
  let visible = false;

  function draw() {
    program.uniforms.uTime.value = time;
    if (props.glass) {
      renderer.render({ scene: mesh, target: renderTarget });
      glassProgram.uniforms.uScene.value = renderTarget.texture;
      renderer.render({ scene: glassMesh });
    } else {
      renderer.render({ scene: mesh });
    }
  }

  const shouldRun = () => motion && visible && !document.hidden;

  function loop(t) {
    frame = 0;
    if (!shouldRun()) return;
    // Clock advances only while animating, so pausing never makes the strands jump on resume.
    time += Math.min(t - (last || t), 64) * 0.001;
    last = t;
    draw();
    frame = requestAnimationFrame(loop);
  }

  function sync() {
    if (shouldRun()) {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(loop);
      }
    } else {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      draw();
    }
  }

  const sizeObserver = new ResizeObserver(() => {
    resize();
    if (!frame) draw();
  });
  sizeObserver.observe(container);
  const viewObserver = new IntersectionObserver(entries => {
    visible = entries.some(e => e.isIntersecting);
    sync();
  });
  viewObserver.observe(container);
  document.addEventListener('visibilitychange', sync);

  resize();
  draw();

  return {
    update(next) {
      Object.assign(props, next);
      applyProps();
      if (!frame) draw();
    },
    setMotion(enabled) {
      motion = !!enabled;
      sync();
    },
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  };
}
