const title = document.querySelector('.literature-title-head');
if (title) {
  const start = () => initBooks().catch(error => console.warn('Book decoration unavailable:', error));
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1000 });
  else setTimeout(start, 100);
}

async function initBooks() {
  const [THREE, { GLTFLoader }] = await Promise.all([
    import('/universe-ui/vendor/three.module.min.js'),
    import('./assets/vendor/book-loader.min.js')
  ]);
  const host = document.createElement('div');
  host.className = 'book-orbit';
  host.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
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
    model.traverse(object => { object.updateMatrix(); object.matrixAutoUpdate = false; });
    const normalized = new THREE.Group();
    normalized.add(model);
    normalized.scale.setScalar(1 / Math.max(size.x, size.y, size.z));
    normalized.updateMatrix();
    normalized.matrixAutoUpdate = false;
    const group = new THREE.Group();
    group.add(normalized);
    scene.add(group);
    return { group, radius: size.length() / (2 * Math.max(size.x, size.y, size.z)), scale: 1, closed: source.closed, phase: index * 1.7, x: 0, y: 0, drift: 3, tilt: (index % 2 ? -1 : 1) * .22 };
  });
  const desktop = matchMedia('(min-width:1101px)');
  const interval = 1000 / 24;
  const titleRect = title.getBoundingClientRect();
  let titleInView = titleRect.bottom > -64 && titleRect.top < innerHeight + 64;
  let width = 0, height = 0, frame = 0, timer = 0, layoutFrame = 0;
  let layoutKey = '', nextPaint = 0, motionSeconds = 0, motionStamp = 0;
  let pageActive = true, contextLost = false, clearRects = [];
  host.dataset.fps = '24';

  function canAnimate() {
    return pageActive && !document.hidden && !contextLost && width > 0 && height > 0 && (desktop.matches || titleInView);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    if (timer) clearTimeout(timer);
    frame = timer = 0;
  }

  function scheduleLayout() {
    if (layoutFrame || document.hidden || !pageActive) return;
    layoutFrame = requestAnimationFrame(() => { layoutFrame = 0; layout(); });
  }

  function layout() {
    host.classList.toggle('book-orbit--title', !desktop.matches);
    host.dataset.bookCount = desktop.matches ? '6' : '4';
    const parent = desktop.matches ? document.body : title;
    if (host.parentElement !== parent) parent.append(host);
    const nextWidth = host.clientWidth, nextHeight = host.clientHeight;
    if (!nextWidth || !nextHeight || contextLost) return;
    const content = document.querySelector('.platform-body').getBoundingClientRect();
    const rail = document.querySelector('.side-rail').getBoundingClientRect();
    const key = [desktop.matches, nextWidth, nextHeight, content.left, content.right, rail.bottom].join(':');
    if (key === layoutKey) return;
    layoutKey = key;
    if (width !== nextWidth || height !== nextHeight) renderer.setSize(nextWidth, nextHeight, false);
    width = nextWidth;
    height = nextHeight;
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    const leftScale = Math.min(210, Math.max(54, content.left * .95), Math.max(54, (height - rail.bottom - 30) / 2.8));
    const rightScale = Math.min(210, Math.max(54, (width - content.right) * .95));
    const left = Math.max(leftScale * .6 + 12, content.left / 2);
    const right = Math.min(width - rightScale * .6 - 12, content.right + (width - content.right) / 2);
    const leftTop = Math.min(height - 60, rail.bottom + leftScale * .6 + 18);
    const leftBottom = height - leftScale * .6 - 18;
    const positions = desktop.matches
      ? [[left, leftTop], [right, height * .22], [left, (leftTop + leftBottom) / 2], [right, height * .52], [left, leftBottom], [right, height * .83]]
      : [[width * .14, height * .28], [width * .84, height * .15], [width * .15, height * .82], [width * .85, height * .77]];
    books.forEach((book, index) => {
      book.group.visible = index < positions.length;
      if (!book.group.visible) return;
      book.x = positions[index][0] - width / 2;
      book.y = height / 2 - positions[index][1];
      const available = index % 2 ? width - content.right : content.left;
      const scale = desktop.matches ? (index % 2 ? rightScale : leftScale) : Math.min(100, width * .23);
      book.drift = desktop.matches ? Math.min(12, available * .1) : 6;
      book.scale = scale * (index === 2 ? .88 : 1);
      book.group.scale.setScalar(book.scale);
    });
    // Clear only the two book columns per frame, including their complete motion envelope.
    // A full clear is needed only after a layout change, to erase their former positions.
    clearRects = desktop.matches ? [0, 1].map(side => {
      let left = width, top = height, right = 0, bottom = 0;
      books.forEach((book, index) => {
        if (!book.group.visible || index % 2 !== side) return;
        const x = book.x + width / 2, y = height / 2 - book.y;
        const radius = book.radius * book.scale + 22;
        left = Math.min(left, x - radius); right = Math.max(right, x + radius);
        top = Math.min(top, y - radius); bottom = Math.max(bottom, y + radius);
      });
      left = Math.max(0, Math.floor(left)); top = Math.max(0, Math.floor(top));
      right = Math.min(width, Math.ceil(right)); bottom = Math.min(height, Math.ceil(bottom));
      return { x: left, y: height - bottom, w: right - left, h: bottom - top };
    }) : [{ x: 0, y: 0, w: width, h: height }];
    host.dataset.clearFraction = (clearRects.reduce((area, rect) => area + rect.w * rect.h, 0) / (width * height)).toFixed(3);
    renderer.setScissorTest(false);
    renderer.clear(true, true, false);
    resume();
  }

  function paint(now) {
    motionSeconds += Math.min(.1, Math.max(0, now - motionStamp) / 1000);
    motionStamp = now;
    const time = motionSeconds;
    books.forEach(book => {
      if (!book.group.visible) return;
      const wave = time * .8 + book.phase;
      book.group.position.set(book.x + Math.sin(wave * .7) * book.drift, book.y + Math.sin(wave) * (desktop.matches ? 18 : 10), 0);
      book.group.rotation.set((book.closed ? .2 : .45) + Math.sin(wave * .8) * .18, (book.closed ? 1.2 : .16) + Math.cos(wave * .65) * .32, book.tilt + Math.sin(wave * .9) * .16);
    });
    renderer.setScissorTest(true);
    for (const rect of clearRects) {
      renderer.setScissor(rect.x, rect.y, rect.w, rect.h);
      renderer.clear(true, true, false);
    }
    renderer.setScissorTest(false);
    renderer.render(scene, camera);
  }

  function scheduleFrame() {
    // Sleep between draws instead of waking JavaScript on every display refresh.
    timer = setTimeout(() => { timer = 0; frame = requestAnimationFrame(animate); }, Math.max(0, nextPaint - performance.now() - 8));
  }
  function animate(now) {
    frame = 0;
    if (!canAnimate()) { resume(); return; }
    if (now >= nextPaint - 1) {
      paint(now);
      nextPaint += interval;
      if (nextPaint < now) nextPaint = now + interval;
    }
    scheduleFrame();
  }
  function resume() {
    stop();
    const active = canAnimate();
    host.dataset.motion = active ? 'animated' : 'paused';
    if (active) {
      motionStamp = performance.now();
      paint(motionStamp);
      host.dataset.drawCalls = String(renderer.info.render.calls);
      nextPaint = motionStamp + interval;
      scheduleFrame();
    }
  }
  const observer = new ResizeObserver(scheduleLayout);
  observer.observe(title);
  observer.observe(document.querySelector('.side-rail'));
  const intersection = new IntersectionObserver(([entry]) => {
    if (titleInView !== entry.isIntersecting) { titleInView = entry.isIntersecting; resume(); }
  }, { rootMargin: '64px' });
  intersection.observe(title);
  window.addEventListener('resize', scheduleLayout, { passive: true });
  desktop.addEventListener('change', scheduleLayout);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) layout(); resume(); });
  window.addEventListener('pagehide', () => { pageActive = false; stop(); if (layoutFrame) cancelAnimationFrame(layoutFrame); layoutFrame = 0; });
  window.addEventListener('pageshow', () => { pageActive = true; layoutKey = ''; layout(); });
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); contextLost = true; resume(); });
  renderer.domElement.addEventListener('webglcontextrestored', () => { contextLost = false; layoutKey = ''; layout(); });
  layout();
}
