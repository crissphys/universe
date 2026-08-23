import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'universe-i18n-catalog.js');
const ignored = new Set(['.git', 'output', 'node_modules', 'assets']);
const sourceExtensions = new Set(['.html', '.js']);

const naturalOverrides = {
  'Inicio': 'Home',
  'Admisión': 'Admissions',
  'Admisión UNI': 'UNI Admissions',
  'CEPREUNI': 'CEPREUNI',
  'Temario': 'Syllabus',
  'Clases': 'Classes',
  'Biblioteca': 'Library',
  'Simulacros': 'Mock Exams',
  'Simulacros y exámenes': 'Mock Exams & Past Papers',
  'Privacidad': 'Privacy',
  'Cuenta': 'Account',
  'Mi cuenta': 'My Account',
  'Imágenes por URL': 'Image URLs',
  'Una dirección https:// por línea': 'One https:// address per line',
  'Subir imágenes': 'Upload images',
  'Puedes añadir todas las fotos que necesites. Cada archivo debe pesar menos de 750 KB para que el comunicado cargue con rapidez.': 'You can add as many photos as you need. Each file must be under 750 KB so the announcement loads quickly.',
  'Imágenes del comunicado': 'Announcement images',
  'Soporte': 'Help & Support',
  'Soporte por WhatsApp': 'WhatsApp Support',
  'Contactar por WhatsApp': 'Contact us on WhatsApp',
  'Comunidad en vivo': 'Live community',
  'UNITALK': 'UNITALK',
  'mini': 'mini',
  'Conectado a UNITALK': 'Connected to UNITALK',
  'Abrir UNITALK': 'Open UNITALK',
  'Últimos mensajes': 'Latest messages',
  'Visible para toda la comunidad': 'Visible to the whole community',
  'Actualizar mensajes': 'Refresh messages',
  'Escribe un mensaje para UNITALK': 'Write a message for UNITALK',
  'Escribe algo para la comunidad…': 'Share something with the community…',
  'Publicar': 'Post',
  'Necesitas una cuenta de Google registrada para publicar.': 'You need a registered Google account to post.',
  '¿Problemas? Te ayudamos': 'Need a hand? We’ve got you.',
  'Abrir soporte privado': 'Open private support',
  'Cerrar soporte': 'Close support',
  'Tu consulta': 'Your request',
  'Chat privado': 'Private chat',
  'Escribe tu consulta...': 'Tell us what’s going on…',
  'Enviar': 'Send',
  'Solucionado': 'Resolved',
  'Adjuntar imagen': 'Attach image',
  'Quitar': 'Remove',
  'Entrar como invitado': 'Continue as guest',
  'Seguir como invitado': 'Keep browsing as guest',
  'Continuar con Google': 'Continue with Google',
  'Iniciar sesión con Google': 'Sign in with Google',
  'Cerrar sesión': 'Sign out',
  'Cargando página': 'Loading page',
  'Preparando Universe to Study...': 'Getting Universe to Study ready…',
  'Ver más': 'See more',
  'Ver todo': 'View all',
  'Volver': 'Go back',
  'Buscar': 'Search',
  'Buscar por nombre o código': 'Search by name or student ID',
  'Buscar carrera': 'Search for a major',
  'Selecciona tu carrera': 'Choose your major',
  'Carrera a comparar': 'Major to compare',
  'Calculadora': 'Score Calculator',
  'Calculadora CEPREUNI': 'CEPREUNI Score Calculator',
  'Calculadora de admisión': 'Admissions Score Calculator',
  'Ranking de promedios': 'Score Ranking',
  'Máximos y mínimos CEPREUNI 2026-2': 'CEPREUNI 2026-2 Score Ranges',
  'Máximos y mínimos': 'Score ranges',
  'Ingresantes': 'Admitted students',
  'Ingresantes CEPREUNI 2026-2': 'CEPREUNI 2026-2 Admitted Students',
  'Ingresantes UNI 2026-2': 'UNI 2026-2 Admitted Students',
  'Fijas CEPREUNI': 'CEPREUNI High-Frequency Topics',
  'Fijas de Admisión': 'High-Frequency Admissions Topics',
  'Guía de aulas': 'Classroom Guide',
  'Información CEPREUNI': 'CEPREUNI Starter Guide',
  'Seré estudiante CEPREUNI': 'I’m joining CEPREUNI',
  'Seré padre o madre de un estudiante CEPREUNI': 'I’m supporting a CEPREUNI student',
  'Voy a estudiar': 'Student track',
  'Voy a acompañar': 'Family track',
  'Elegir otro perfil': 'Choose another track',
  'Guía del estudiante 2026-2': '2026-2 Student Guide',
  'Manual de biblioteca': 'Library Handbook',
  'Modo oscuro': 'Dark mode',
  'Modo claro': 'Light mode',
  'Activar tema oscuro': 'Switch to dark mode',
  'Activar tema claro': 'Switch to light mode',
  'Español': 'Spanish',
  'Inglés': 'English',
  'Cambiar idioma': 'Switch language',
  'Puntaje': 'Score',
  'Promedio': 'Average',
  'Promedio actual': 'Current average',
  'Puntaje máximo': 'Top score',
  'Puntaje mínimo': 'Cutoff score',
  'Desviación estándar': 'Standard deviation',
  'Postulantes': 'Applicants',
  'Ingresaron': 'Admitted',
  'Facultad': 'School',
  'Especialidad': 'Major',
  'Carrera': 'Major',
  'Código': 'Student ID',
  'Nombre': 'Name',
  'Sede': 'Campus',
  'Puesto': 'Rank',
  'Nota': 'Score',
  'Ver resultados': 'View results',
  'Comparar puntajes': 'Compare scores',
  'Ver ingresantes': 'Meet the admitted students',
  'Resultados por concurso': 'Results by admissions cycle',
  'Fuentes y metodología': 'Sources & methodology',
  'Metodología editorial': 'Editorial standards',
  'Correcciones': 'Corrections',
  'Contacto': 'Contact',
  'Nosotros': 'About us',
  'Términos': 'Terms',
  'Términos y condiciones': 'Terms & Conditions',
  'Todos los derechos reservados.': 'All rights reserved.',
  'Preguntas frecuentes': 'FAQs',
  'Recursos recomendados': 'Recommended resources',
  'Material de práctica': 'Practice material',
  'Exámenes anteriores': 'Past papers',
  'Pregunta': 'Question',
  'Siguiente': 'Next',
  'Anterior': 'Previous',
  'Finalizar simulacro': 'Finish mock exam',
  'Tiempo restante': 'Time left',
  'CEPREUNI 2027-1': 'CEPREUNI 2027-1',
  'El próximo ciclo está por comenzar.': 'The next CEPREUNI cycle is almost here.',
  'Sigue la cuenta regresiva de la prueba de selección y del inicio de clases del Ciclo Preuniversitario CEPREUNI 2027-1.': 'Count down to the placement test and the first day of the CEPREUNI 2027-1 Pre-University Cycle.',
  'PRIMER EVENTO': 'FIRST EVENT',
  'SEGUNDO EVENTO': 'SECOND EVENT',
  'Prueba de selección': 'Placement test',
  'Prueba de selección finalizada': 'Placement test completed',
  'Ciclo Preuniversitario': 'Pre-University Cycle',
  'Inicio de clases': 'First day of classes',
  'Las clases ya comenzaron': 'Classes have started',
  'Domingo · 9:00 a. m.': 'Sunday · 9:00 a.m.',
  'Lunes · 7:30 a. m.': 'Monday · 7:30 a.m.',
  'Fechas del Ciclo Preuniversitario CEPREUNI 2027-1': 'CEPREUNI 2027-1 Pre-University Cycle dates',
  'Ir a CEPREUNI ↗': 'Visit CEPREUNI ↗',
  'Respuesta correcta': 'Correct answer',
  'Respuesta incorrecta': 'Not quite',
  'Publicar': 'Post',
  'Comentar': 'Comment',
  'Comentarios': 'Comments',
  'Me gusta': 'Like',
  'No me gusta': 'Dislike',
  'Recientes': 'Latest',
  'Para ti': 'For you',
  'Siguiendo': 'Following',
  'Explorar': 'Explore',
  'Notificaciones': 'Notifications',
  'Mensajes': 'Messages',
  'Guardados': 'Saved',
  'Perfil': 'Profile',
  'Ajustes': 'Settings',
  '¿Qué quieres compartir con la comunidad?': 'What’s on your mind?',
  'Sin resultados': 'No matches found',
  'No se encontraron resultados': 'No matches found',
  'Información oficial': 'Official information',
  'Dato referencial': 'For reference only',
  'Proyección': 'Projection',
  'Ciclo': 'Cycle',
  'Examen': 'Exam',
  'Humanidades': 'Humanities',
  'Matemática': 'Mathematics',
  'Matemáticas': 'Mathematics',
  'Ciencias': 'Science',
  'Física': 'Physics',
  'Química': 'Chemistry',
  'Aritmética': 'Arithmetic',
  'Álgebra': 'Algebra',
  'Geometría': 'Geometry',
  'Trigonometría': 'Trigonometry',
  'Razonamiento Matemático': 'Mathematical Reasoning',
  'Razonamiento Verbal': 'Verbal Reasoning',
  'Psicología': 'Psychology',
  'Geografía': 'Geography',
  'Historia': 'History',
  'Literatura': 'Literature',
  'Economía': 'Economics',
  'Filosofía': 'Philosophy',
  'Lenguaje': 'Language Arts',
  'Actualidad': 'Current Affairs',
  'Inglés': 'English',
  'Tu ruta de ingreso empieza aquí.': 'Your path to admission starts here.',
  'Convierte una meta grande en un plan claro. Revisa el temario, practica con simulacros, compara tu avance y estudia acompañado desde un solo lugar.': 'Turn a big goal into a game plan. Check the syllabus, take realistic mock exams, track your progress and keep moving forward—all in one place.',
  'Explorar admisión': 'Explore admissions',
  'Entrar a clases': 'Browse classes',
  'PRUEBAS UNI': 'UNI EXAMS',
  'VACANTES 2026-2': '2026-2 SEATS',
  'ESPECIALIDADES': 'MAJORS',
  'Organiza': 'Get organized',
  'Practica': 'Practice',
  'Conecta': 'Connect',
  'Disponible': 'Ready when you are',
  'Temarios UNI, San Marcos y CEPREUNI': 'UNI, San Marcos & CEPREUNI syllabi',
  'Pon a prueba tu avance': 'Put your progress to the test',
  'Calculadora y referencias CEPREUNI': 'CEPREUNI score tools & benchmarks',
  'Publica, pregunta y comparte en UNITALK': 'Post, ask and share on UNITALK',
  'Convocatoria y vacantes': 'Admissions calendar & seats',
  'Web oficial': 'Official website',
  'Clases y repasos': 'Classes & review sessions',
  'Avisos de la comunidad': 'Community updates',
  'Canal de solucionarios': 'Answer-key channel',
  'Materiales y archivos': 'Study materials & files',
  'Asistencia y plataforma': 'Attendance & student platform',
  'DÍAS': 'DAYS',
  'HORAS': 'HOURS',
  'MIN': 'MIN',
  'SEG': 'SEC',
  'PRIMERA PRUEBA FINALIZADA': 'EXAM 1 COMPLETED',
  'SEGUNDA PRUEBA FINALIZADA': 'EXAM 2 COMPLETED',
  'TERCERA PRUEBA FINALIZADA': 'EXAM 3 COMPLETED',
  'Lunes · 9:00 a. m.': 'Monday · 9:00 a.m.',
  'Miércoles · 9:00 a. m.': 'Wednesday · 9:00 a.m.',
  'Viernes · 9:00 a. m.': 'Friday · 9:00 a.m.',
  'TU PLATAFORMA': 'YOUR STUDY HUB',
  'Abrir admisión': 'Explore admissions',
  'Ver herramientas': 'See tools',
  'Elegir una clase': 'Pick a class',
  'Explorar biblioteca': 'Browse the library',
  'Comenzar práctica': 'Start practicing',
  'Entrar a UNITALK': 'Join UNITALK',
  'DATOS OFICIALES · PROCESO 2026-2': 'OFFICIAL DATA · 2026-2 ADMISSIONS',
  'Analizar puntajes': 'Analyze scores',
  'TOTAL APROBADO': 'TOTAL SEATS',
  'vacantes en todas las modalidades': 'seats across all admission tracks',
  'vacantes de proceso ordinario': 'regular-admission seats',
  'vacantes CEPREUNI': 'CEPREUNI seats',
  'especialidades registradas': 'majors offered',
  'Inscripción oficial': 'Official registration',
  'Guía de inscripción': 'Registration guide',
  'Temario organizado': 'Organized syllabus',
  'Simulacros Universe': 'Universe mock exams',
  'NUEVA ETAPA CEPREUNI': 'NEW CEPREUNI INTAKE'
  ,'Tu ruta de ingreso': 'Your path to admission'
  ,'empieza aquí.': 'starts here.'
  ,'Convierte un objetivo grande en un plan claro. Revisa el temario, practica con simulacros, compara tu avance y estudia acompañado desde un solo lugar.': 'Turn a big goal into a game plan. Check the syllabus, take realistic mock exams, track your progress and keep moving forward—all in one place.'
  ,'pruebas UNI': 'UNI EXAMS'
  ,'vacantes 2026-2': '2026-2 SEATS'
  ,'especialidades': 'MAJORS'
  ,'Tu espacio de estudio': 'YOUR STUDY HUB'
  ,'Una ruta. Todo conectado.': 'One path. Everything in sync.'
  ,'Revisa qué estudiar': 'See what to study'
  ,'Simulacros y exámenes cronometrados': 'Realistic, timed mock exams'
  ,'Interpreta tus resultados': 'Make sense of your scores'
  ,'Aprende con la comunidad': 'Learn with the community'
  ,'Conecta y continúa': 'CONNECT AND KEEP GOING'
  ,'Todos los accesos importantes, en un solo lugar.': 'Everything you need, all in one place.'
  ,'Los tres cronómetros usan la hora indicada para el proceso: 9:00 a. m. Revisa cualquier cambio de última hora en la convocatoria oficial.': 'All three countdowns use the scheduled 9:00 a.m. start. Double-check the official notice for any last-minute changes.'
  ,'Los tres cronómetros usan la hora indicada para el proceso: 9:00 a. m. Revisa cualquier cambio de último momento en la convocatoria oficial.': 'All three countdowns use the scheduled 9:00 a.m. start. Double-check the official notice for any last-minute changes.'
  ,'Primera prueba finalizada': 'Exam 1 completed'
  ,'Segunda prueba finalizada': 'Exam 2 completed'
  ,'Tercera prueba finalizada': 'Exam 3 completed'
  ,'días': 'days'
  ,'horas': 'hours'
  ,'min': 'min'
  ,'seg': 'sec'
  ,'Tu plataforma': 'YOUR STUDY HUB'
  ,'Elige lo que necesitas hoy.': 'Pick what you need today.'
  ,'Menos menús repetidos y más accesos útiles. Cada módulo resuelve una parte distinta de tu preparación.': 'Less menu hopping, more useful shortcuts. Each module tackles a different part of your prep.'
  ,'PROCESO DE INGRESO': 'ADMISSIONS'
  ,'INGRESO DIRECTO': 'DIRECT ENTRY'
  ,'APRENDE POR TEMA': 'LEARN BY TOPIC'
  ,'RECURSOS ORDENADOS': 'ORGANIZED RESOURCES'
  ,'ENTRENA CON TIEMPO': 'TIMED PRACTICE'
  ,'COMUNIDAD UNIVERSE': 'UNIVERSE COMMUNITY'
};

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function looksTranslatable(value, force) {
  const text = normalize(value);
  if (text.length < 2 || text.length > 1800) return false;
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(text)) return false;
  if (/^(https?:|mailto:|tel:|data:|#[\w-]+|\.?\.?\/)/i.test(text)) return false;
  if (/^[\w./:@-]+\.(?:js|css|json|png|jpe?g|svg|webp|pdf)(?:\?.*)?$/i.test(text)) return false;
  if (/^[.#\[\]()>+~*{}:=,;\w-]+$/.test(text) && !/[áéíóúñü¿¡ ]/i.test(text)) return false;
  if (/\b(?:function|return|querySelector|addEventListener|classList|innerHTML|textContent|createElement|getElementById)\b|(?:document|window)\.|\)\s*\{|\}\s*else\s*\{|\.map\s*\(|\.forEach\s*\(|\.join\s*\(|['"]\s*\+\s*[\w$]|[\w$]\s*\+\s*['"]/i.test(text)) return false;
  if (force) return true;
  return /[áéíóúñü¿¡]/i.test(text) || /\b(?:de|del|la|las|el|los|para|por|con|sin|una|uno|que|como|ver|buscar|nota|puntaje|promedio|carrera|examen|curso|estudiante|ingreso|ingresantes|pregunta|respuesta|inicio|cuenta|soporte|biblioteca|temario|simulacro|privacidad|publicar|comentario|selecciona|información|resultados|admisión|ciclo|sede|facultad|especialidad|máximo|mínimo|abrir|cerrar|mostrar|filtrar|ordenar|guardar|continuar|finalizar|disponible|vacantes|materiales|archivos|asistencia|plataforma|días|horas|segundos|organiza|practica|conecta)\b/i.test(text);
}

function addText(set, value, force) {
  const text = normalize(decodeEntities(value));
  if (looksTranslatable(text, force)) set.add(text);
}

async function walk(directory, files = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full, files);
    else if (sourceExtensions.has(path.extname(entry.name).toLowerCase()) && full !== output) files.push(full);
  }
  return files;
}

function collectHtml(source, set) {
  const visible = source
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(style|svg|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ');
  for (const match of visible.matchAll(/>([^<>]+)</g)) addText(set, match[1], true);
  for (const match of visible.matchAll(/\b(?:placeholder|title|aria-label|alt|data-empty|data-label|data-complete|content)\s*=\s*["']([^"']+)["']/gi)) addText(set, match[1], true);
}

function collectJavaScript(source, set) {
  const literalPattern = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  for (const match of source.matchAll(literalPattern)) {
    let literal = match[2]
      .replace(/\\n/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\(["'`])/g, '$1');
    if (literal.includes('<')) {
      for (const textMatch of literal.matchAll(/>([^<>]+)</g)) addText(set, textMatch[1]);
      for (const attrMatch of literal.matchAll(/\b(?:placeholder|title|aria-label|alt|data-empty|data-label|data-complete)\s*=\s*["']([^"']+)["']/gi)) addText(set, attrMatch[1]);
    } else {
      addText(set, literal);
    }
  }
}

function protectPlaceholders(text) {
  const placeholders = [];
  const protectedText = text.replace(/\$\{[^}]+}|\{\{[^}]+}}|%[sdif]|\b(?:PC|EP|EF)\d?\b/g, token => {
    const key = `ZXPH${placeholders.length}ZX`;
    placeholders.push(token);
    return key;
  });
  return { protectedText, placeholders };
}

function restorePlaceholders(text, placeholders) {
  return placeholders.reduce((result, token, index) => result.replace(new RegExp(`ZXPH\\s*${index}\\s*ZX`, 'gi'), token), text);
}

async function translate(text, attempt = 0) {
  if (naturalOverrides[text]) return naturalOverrides[text];
  const { protectedText, placeholders } = protectPlaceholders(text);
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=' + encodeURIComponent(protectedText);
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Universe-I18n-Catalog/1.0' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const translated = payload?.[0]?.map(part => part?.[0] || '').join('') || text;
    return restorePlaceholders(normalize(translated), placeholders);
  } catch (error) {
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
      return translate(text, attempt + 1);
    }
    console.warn(`Could not translate: ${text.slice(0, 80)}`, error.message);
    return text;
  }
}

async function main() {
  const strings = new Set(Object.keys(naturalOverrides));
  const files = await walk(root);
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    if (file.endsWith('.html')) collectHtml(source, strings);
    collectJavaScript(source, strings);
  }

  let previous = {};
  try {
    const oldSource = await fs.readFile(output, 'utf8');
    const json = oldSource.match(/Object\.freeze\((\{[\s\S]*})\);?\s*$/)?.[1];
    if (json) previous = JSON.parse(json);
  } catch {}

  const sourceStrings = [...strings].sort((a, b) => a.localeCompare(b, 'es'));
  const catalog = {};
  let cursor = 0;
  const workers = Array.from({ length: 7 }, async () => {
    while (cursor < sourceStrings.length) {
      const index = cursor++;
      const source = sourceStrings[index];
      catalog[source] = naturalOverrides[source] || previous[source] || await translate(source);
      if ((index + 1) % 100 === 0) console.log(`Translated ${index + 1}/${sourceStrings.length}`);
    }
  });
  await Promise.all(workers);

  const ordered = Object.fromEntries(sourceStrings.map(source => [source, catalog[source]]));
  const outputSource = `/* Generated by tools/build-i18n-catalog.mjs. Do not edit mechanically translated entries by hand. */\nwindow.UNIVERSE_I18N_CATALOG = Object.freeze(${JSON.stringify(ordered, null, 2)});\n`;
  await fs.writeFile(output, outputSource, 'utf8');
  console.log(`Wrote ${sourceStrings.length} translations to ${path.relative(root, output)}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
