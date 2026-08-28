import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const catalogPath = path.join(root, 'biblioteca', 'lumbreras', 'catalog.json');
const pagePath = path.join(root, 'biblioteca', 'lumbreras', 'index.html');
const startMarker = '<!-- LUMBRERAS_COLLECTIONS_START -->';
const endMarker = '<!-- LUMBRERAS_COLLECTIONS_END -->';

const icons = {
  flask: '<svg viewBox="0 0 24 24"><path d="M9 3h6m-4 0v5l-5.5 9.2A2.5 2.5 0 0 0 7.7 21h8.6a2.5 2.5 0 0 0 2.2-3.8L13 8V3"></path><path d="M8.2 15h7.6"></path></svg>',
  atom: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"></circle><path d="M4.9 7.5c2.1-3.5 6.8-3.8 10.7-.7s5.4 8.1 3.3 10.8-6.8 1.9-10.7-1.2S2.8 10.2 4.9 7.5Z"></path><path d="M19.1 7.5c-2.1-3.5-6.8-3.8-10.7-.7S3 14.9 5.1 17.6s6.8 1.9 10.7-1.2 5.4-6.2 3.3-8.9Z"></path></svg>',
  function: '<svg viewBox="0 0 24 24"><path d="M4 19h16M5 4v16"></path><path d="M7 16c2-1 2.5-4 4-6s3-3 6-4"></path><circle cx="11" cy="10" r="1"></circle><circle cx="17" cy="6" r="1"></circle></svg>',
  calculator: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M8 7h8v3H8zM8 14h2m4 0h2m-8 3h2m4 0h2"></path></svg>',
  geometry: '<svg viewBox="0 0 24 24"><path d="M4 19 12 4l8 15H4Z"></path><circle cx="12" cy="13" r="2"></circle><path d="M8 19l4-6 4 6"></path></svg>',
  trigonometry: '<svg viewBox="0 0 24 24"><path d="M3 12h18M12 3v18"></path><path d="M4 16c2.5 0 3-8 6-8s3.5 8 6.5 8c1.5 0 2.3-1.6 3.5-4"></path></svg>'
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
if (!Array.isArray(catalog.collections) || catalog.collections.length === 0) throw new Error('catalog.json debe contener al menos una colección.');

const seenCollections = new Set();
const seenCourseKeys = new Set();
const seenSectionKeys = new Set();
const seenUrls = new Set();
const subjects = new Set();

const validateBook = (book, context) => {
  if (!book.title || !book.series || !book.aria || !book.alt) throw new Error(`Datos incompletos en ${context}`);
  if (!book.driveUrl.startsWith('https://drive.google.com/file/d/')) throw new Error(`Enlace de Drive inválido: ${book.driveUrl}`);
  if (seenUrls.has(book.driveUrl)) throw new Error(`Enlace duplicado: ${book.driveUrl}`);
  seenUrls.add(book.driveUrl);
  if (!book.image.startsWith('/assets/library/lumbreras/')) throw new Error(`Ruta de portada inválida: ${book.image}`);
  if (!fs.existsSync(path.join(root, book.image.slice(1)))) throw new Error(`No existe la portada: ${book.image}`);
  if (book.course) subjects.add(book.course);
};

for (const collection of catalog.collections) {
  if (!/^[a-z0-9-]+$/.test(collection.slug) || seenCollections.has(collection.slug)) throw new Error(`Slug de colección inválido o duplicado: ${collection.slug}`);
  seenCollections.add(collection.slug);
  if (!collection.number || !collection.name || !collection.description) throw new Error(`Datos incompletos en la colección ${collection.slug}`);
  const hasCourses = Array.isArray(collection.courses) && collection.courses.length > 0;
  const hasBooks = Array.isArray(collection.books) && collection.books.length > 0;
  const hasSections = Array.isArray(collection.sections) && collection.sections.length > 0;
  if ([hasCourses, hasBooks, hasSections].filter(Boolean).length !== 1) throw new Error(`La colección ${collection.name} debe usar cursos, libros o secciones.`);

  if (hasCourses) {
    for (const course of collection.courses) {
      const courseKey = `${collection.slug}/${course.slug}`;
      if (!/^[a-z0-9-]+$/.test(course.slug) || seenCourseKeys.has(courseKey)) throw new Error(`Slug de curso inválido o duplicado: ${courseKey}`);
      seenCourseKeys.add(courseKey);
      subjects.add(course.name);
      if (!icons[course.icon]) throw new Error(`Icono no soportado: ${course.icon}`);
      if (!Array.isArray(course.colors) || course.colors.length !== 3) throw new Error(`Colores incompletos en ${course.name}`);
      if (!course.colors.slice(0, 2).every((color) => /^#[0-9a-f]{6}$/i.test(color)) || !/^rgba\([\d., ]+\)$/.test(course.colors[2])) throw new Error(`Formato de color inválido en ${course.name}`);
      if (!Array.isArray(course.books) || course.books.length === 0) throw new Error(`No hay libros en ${course.name}`);
      course.books.forEach((book) => validateBook(book, `${collection.name} / ${course.name}`));
    }
  } else if (hasBooks) {
    collection.books.forEach((book) => validateBook(book, collection.name));
  } else {
    for (const section of collection.sections) {
      const sectionKey = `${collection.slug}/${section.slug}`;
      if (!/^[a-z0-9-]+$/.test(section.slug) || seenSectionKeys.has(sectionKey)) throw new Error(`Slug de sección inválido o duplicado: ${sectionKey}`);
      seenSectionKeys.add(sectionKey);
      if (!section.name || !section.description || !Array.isArray(section.books) || section.books.length === 0) throw new Error(`Datos incompletos en la sección ${sectionKey}`);
      section.books.forEach((book) => validateBook(book, `${collection.name} / ${section.name}`));
    }
  }
}

const renderBook = (book) => `      <a class="book-card" href="${escapeHtml(book.driveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(book.aria)}">
        <div class="book-cover"><img src="${escapeHtml(book.image)}" alt="${escapeHtml(book.alt)}" loading="${book.eager ? 'eager' : 'lazy'}"></div>
        <div class="book-info"><span class="book-series">${escapeHtml(book.series)}</span><h4>${escapeHtml(book.title)}</h4><span class="book-open">Abrir libro <b aria-hidden="true">↗</b></span></div>
      </a>`;

const renderCourse = (course, index) => {
  const secondary = index === 0 ? '' : ' course-heading-secondary';
  const [start, end, shadow] = course.colors;
  return `    <div class="course-heading${secondary} ${escapeHtml(course.slug)}-heading" style="--course-accent:${start};--course-accent-end:${end};--course-shadow:${shadow}">
      <div class="course-icon" aria-hidden="true">${icons[course.icon]}</div>
      <div><span>Curso</span><h3>${escapeHtml(course.name)}</h3></div>
      <span class="course-rule" aria-hidden="true"></span>
    </div>

    <div class="book-grid${course.books.length < 5 ? ` book-grid-${course.books.length}` : ''}" aria-label="Libros de ${escapeHtml(course.name)} de Lumbreras">
${course.books.map(renderBook).join('\n\n')}
    </div>`;
};

const collectionBooks = (collection) => Array.isArray(collection.courses)
  ? collection.courses.flatMap((course) => course.books)
  : Array.isArray(collection.sections)
    ? collection.sections.flatMap((section) => section.books)
    : collection.books;

const renderCollectionSection = (collection, section, index) => `    <div class="collection-subsection collection-subsection-${escapeHtml(section.slug)}" aria-labelledby="${escapeHtml(collection.slug)}-${escapeHtml(section.slug)}-title">
      <header class="collection-subheading">
        <div><span>Sección ${String(index + 1).padStart(2, '0')}</span><h3 id="${escapeHtml(collection.slug)}-${escapeHtml(section.slug)}-title">${escapeHtml(section.name)}</h3><p>${escapeHtml(section.description)}</p></div>
        <strong>${section.books.length} ${section.books.length === 1 ? 'libro' : 'libros'}</strong>
      </header>
      <div class="book-grid collection-book-grid" aria-label="${escapeHtml(section.name)} de la colección ${escapeHtml(collection.name)}">
${section.books.map(renderBook).join('\n\n')}
      </div>
    </div>`;

const renderCollection = (collection) => {
  const books = collectionBooks(collection);
  const content = Array.isArray(collection.courses)
    ? collection.courses.map(renderCourse).join('\n\n')
    : Array.isArray(collection.sections)
      ? collection.sections.map((section, index) => renderCollectionSection(collection, section, index)).join('\n\n')
      : `    <div class="book-grid collection-book-grid" aria-label="Libros de la colección ${escapeHtml(collection.name)} de Lumbreras">
${collection.books.map(renderBook).join('\n\n')}
    </div>`;
  return `  <section class="catalog-collection catalog-collection-${escapeHtml(collection.slug)}" aria-labelledby="${escapeHtml(collection.slug)}-title">
    <header class="collection-heading">
      <div>
        <span class="collection-number">Colección ${escapeHtml(collection.number)}</span>
        <h2 id="${escapeHtml(collection.slug)}-title">${escapeHtml(collection.name)}</h2>
        <p>${escapeHtml(collection.description)}</p>
      </div>
      <span class="collection-count">${books.length} libros disponibles</span>
    </header>

${content}
  </section>`;
};

const allBooks = catalog.collections.flatMap(collectionBooks);
const totalBooks = allBooks.length;
const collectionCount = catalog.collections.length;
const courseCount = subjects.size;

let html = fs.readFileSync(pagePath, 'utf8');
const markerPattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
if (!markerPattern.test(html)) throw new Error('No se encontraron los marcadores de colecciones en index.html.');

html = html.replace(markerPattern, `${startMarker}\n${catalog.collections.map(renderCollection).join('\n\n')}\n  ${endMarker}`);
html = html.replace(/<span><b>\d+<\/b> colecci(?:ón|ones)<\/span>/, `<span><b>${String(collectionCount).padStart(2, '0')}</b> ${collectionCount === 1 ? 'colección' : 'colecciones'}</span>`);
html = html.replace(/<span><b>\d+<\/b> cursos?<\/span>/, `<span><b>${String(courseCount).padStart(2, '0')}</b> ${courseCount === 1 ? 'curso' : 'cursos'}</span>`);
html = html.replace(/<span><b>\d+<\/b> libros<\/span>/, `<span><b>${String(totalBooks).padStart(2, '0')}</b> libros</span>`);
html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="Catálogo de Editorial Lumbreras con ${totalBooks} libros de ${courseCount} cursos en ${collectionCount} colecciones. Abre cada libro directamente en Google Drive.">`);

fs.writeFileSync(pagePath, html, 'utf8');
console.log(`Catálogo actualizado: ${collectionCount} colecciones, ${courseCount} cursos, ${totalBooks} libros.`);
