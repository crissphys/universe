import * as THREE from '/universe-ui/vendor/three.module.min.js';
import { GLTFLoader } from './assets/vendor/GLTFLoader.js';

const title = document.querySelector('.literature-title-head');
if (title) initBooks().catch(error => console.warn('Book decoration unavailable:', error));

async function initBooks() {
  const host = document.createElement('div');
  host.className = 'book-orbit';
  host.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
  camera.position.z = 1000;
  scene.add(new THREE.HemisphereLight(0xfff4de, 0x425575, 2.8));
  const light = new THREE.DirectionalLight(0xffffff, 3.2);
  light.position.set(-300, 400, 800);
  scene.add(light);
  const rim = new THREE.DirectionalLight(0x9acbff, 1.8);
  rim.position.set(400, -100, 350);
  scene.add(rim);
  const loader = new GLTFLoader();
  const files = ['book-open.glb', 'book-closed.glb', 'book-open-wide.glb', 'book-closed-gold.glb'];
  const loaded = await Promise.allSettled(files.map(file => loader.loadAsync(`/biblioteca/literatura/assets/models/${file}`)));
  const models = loaded.flatMap((result, index) => result.status === 'fulfilled' ? [{ scene: result.value.scene, closed: files[index].startsWith('book-closed') }] : []);
  if (!models.length) { renderer.dispose(); return; }
  host.dataset.modelCount = String(models.length);
  const order = [0, 1, 2, 3, 1, 0];
  const books = Array.from({ length: 6 }, (_, index) => {
    const source = models[order[index] % models.length];
    const model = source.scene.clone(true);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    const normalized = new THREE.Group();
    normalized.add(model);
    normalized.scale.setScalar(1 / Math.max(size.x, size.y, size.z));
    const group = new THREE.Group();
    group.add(normalized);
    scene.add(group);
    return { group, closed: source.closed, phase: index * 1.7, x: 0, y: 0, drift: 3, tilt: (index % 2 ? -1 : 1) * .22 };
  });
  const desktop = matchMedia('(min-width:1101px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let width = 1, height = 1, frame = 0, lastPaint = 0;

  function layout() {
    host.classList.toggle('book-orbit--title', !desktop.matches);
    host.dataset.bookCount = desktop.matches ? '6' : '4';
    (desktop.matches ? document.body : title).append(host);
    width = host.clientWidth;
    height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    const content = document.querySelector('.platform-body').getBoundingClientRect();
    const rail = document.querySelector('.side-rail').getBoundingClientRect();
    const left = Math.max(36, content.left / 2);
    const right = Math.min(width - 36, content.right + (width - content.right) / 2);
    const leftScale = Math.min(128, Math.max(24, content.left * .65), Math.max(24, (height - rail.bottom - 40) / 3.2));
    const leftTop = Math.min(height - 60, rail.bottom + leftScale * .6 + 18);
    const leftBottom = height - leftScale * .6 - 18;
    const positions = desktop.matches
      ? [[left, leftTop], [right, height * .22], [left, (leftTop + leftBottom) / 2], [right, height * .52], [left, leftBottom], [right, height * .83]]
      : [[width * .09, height * .28], [width * .88, height * .15], [width * .12, height * .82], [width * .9, height * .77]];
    books.forEach((book, index) => {
      book.group.visible = index < positions.length;
      if (!book.group.visible) return;
      book.x = positions[index][0] - width / 2;
      book.y = height / 2 - positions[index][1];
      const available = index % 2 ? width - content.right : content.left;
      const scale = desktop.matches ? (index % 2 ? Math.min(128, Math.max(24, available * .65)) : leftScale) : Math.min(68, width * .16);
      book.drift = desktop.matches ? Math.min(5, available * .06) : 3;
      book.group.scale.setScalar(scale * (index === 2 ? .88 : 1));
    });
    paint(performance.now());
  }

  function paint(now) {
    const time = reduced.matches ? 0 : now / 1000;
    books.forEach(book => {
      if (!book.group.visible) return;
      const wave = time * .52 + book.phase;
      book.group.position.set(book.x + Math.sin(wave * .7) * book.drift, book.y + Math.sin(wave) * (desktop.matches ? 9 : 5), 0);
      book.group.rotation.set((book.closed ? .2 : .45) + Math.sin(wave * .8) * .12, (book.closed ? 1.2 : .16) + Math.cos(wave * .65) * .22, book.tilt + Math.sin(wave * .9) * .09);
    });
    renderer.render(scene, camera);
  }

  function animate(now) {
    frame = 0;
    if (document.hidden || reduced.matches) return;
    if (now - lastPaint >= 1000 / 24) { paint(now); lastPaint = now; }
    frame = requestAnimationFrame(animate);
  }
  function resume() {
    host.dataset.motion = reduced.matches ? 'static' : 'animated';
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) {
      paint(performance.now());
      if (!reduced.matches) frame = requestAnimationFrame(animate);
    }
  }
  const observer = new ResizeObserver(layout);
  observer.observe(title);
  observer.observe(document.querySelector('.side-rail'));
  window.addEventListener('resize', layout, { passive: true });
  desktop.addEventListener('change', layout);
  reduced.addEventListener('change', resume);
  document.addEventListener('visibilitychange', resume);
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); if (frame) cancelAnimationFrame(frame); frame = 0; });
  renderer.domElement.addEventListener('webglcontextrestored', resume);
  layout();
  resume();
}
