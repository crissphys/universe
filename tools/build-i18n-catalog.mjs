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
  'Planificador': 'Planner',
  'Ruta personal de estudio': 'Personal study route',
  'Tu cronograma personal de estudio': 'Your personal study schedule',
  'Crea un cronograma con todos los temas UNI o las semanas CEPREUNI, edítalo y estudia con recordatorios y temporizador.': 'Build a schedule with every UNI topic or the CEPREUNI weekly route, edit it, and study with reminders and a focus timer.',
  'Crear mi cronograma →': 'Build my schedule →',
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
  ,'Catálogo Lumbreras | Biblioteca Universe to Study': 'Lumbreras Catalog | Universe to Study Library'
  ,'Catálogo de Editorial Lumbreras con 205 libros de 18 cursos en 9 colecciones. Abre cada libro directamente en Google Drive.': 'Explore 205 Lumbreras titles across 18 subjects and 9 collections. Open each book directly in Google Drive.'
  ,'Preparando el catálogo...': 'Preparing the catalog…'
  ,'Editoriales': 'Publishers'
  ,'Biblioteca editorial': 'Publisher library'
  ,'Catálogo Lumbreras': 'Lumbreras Catalog'
  ,'Libros organizados por colección y curso para encontrar cada tomo sin perder tiempo.': 'Browse books by collection and subject so you can find the right volume quickly.'
  ,'Editorial destacada': 'Featured publisher'
  ,'AVISO IMPORTANTE': 'IMPORTANT NOTICE'
  ,'Esta biblioteca virtual es un repositorio digital creado para que el contenido sea más accesible para todas las personas. Nuestro equipo no lucra de ninguna forma con esta página, ya que no usamos acortadores ni publicidad en los enlaces. Todo este contenido proviene del vasto internet y nosotros lo hemos organizado. Del mismo modo, los invitamos a visitar la página de Lumbreras Editores para obtener mejor información sobre la compra y venta de libros. Gracias.': 'This virtual library is a digital repository designed to make these resources more accessible to everyone. Our team does not profit from this page in any way: we do not use link shorteners or place advertising on any of the links. We have gathered and organized material available across the open web. We also encourage you to visit the Lumbreras Editores website for official information about purchasing books. Thank you.'
  ,'Visitar Lumbreras Editores': 'Visit Lumbreras Editores'
  ,'LIBROS ROJOS ANTIGUOS': 'CLASSIC RED BOOKS'
  ,'Serie de teoría y problemas resueltos de Editorial Lumbreras.': 'Lumbreras theory books and fully worked problems.'
  ,'LIBROS ROJOS NUEVOS': 'NEW RED BOOKS'
  ,'Nueva edición de la Colección Ciencias y Humanidades de Editorial Lumbreras.': 'The new edition of Lumbreras’ Science and Humanities collection.'
  ,'LIBROS AZULES': 'BLUE BOOKS'
  ,'Nueva colección de Ciencias y Humanidades de Editorial Lumbreras.': 'Lumbreras’ new Science and Humanities collection.'
  ,'Historia, ciencias, letras y razonamiento para la preparación preuniversitaria.': 'History, science, language arts and reasoning for pre-university study.'
  ,'Edición Especial': 'Special Edition'
  ,'Libros de edición especial de la colección azul de Lumbreras.': 'Special-edition titles from the Lumbreras Blue Books collection.'
  ,'Esenciales': 'Essentials'
  ,'Colección de fundamentos esenciales organizada por curso.': 'Essential foundations organized by subject.'
  ,'Libros': 'Books'
  ,'Textos de teoría y fundamentos esenciales.': 'Core theory and foundational textbooks.'
  ,'Solucionarios': 'Solution Manuals'
  ,'Respuestas desarrolladas para practicar y comprobar procedimientos.': 'Fully worked answers for practice and checking each method.'
  ,'Temas Selectos': 'Selected Topics'
  ,'Colección de teoría y práctica por temas específicos, desde nivel básico hasta avanzado.': 'Focused theory and practice, from foundational to advanced topics.'
  ,'Compendios Académicos': 'Academic Compendiums'
  ,'Colección integral de teoría y práctica preuniversitaria de Editorial Lumbreras.': 'A comprehensive Lumbreras collection of pre-university theory and practice.'
  ,'Colección Edición Antigua': 'Classic Edition Collection'
  ,'Compendios académicos de la edición clásica de Lumbreras.': 'Academic compendiums from the classic Lumbreras edition.'
  ,'Colección Edición Nueva': 'New Edition Collection'
  ,'Nueva edición de compendios académicos por asignatura.': 'New academic compendiums organized by subject.'
  ,'Compendios Académicos UNI': 'UNI Academic Compendiums'
  ,'Colección especializada para la preparación del examen de admisión UNI.': 'A specialized collection for the UNI entrance examination.'
  ,'Diversos': 'Additional Guides'
  ,'Guías complementarias de cultura general, matemáticas y ciencias.': 'Supplementary guides in general knowledge, mathematics and science.'
  ,'Guías': 'Guides'
  ,'Selección de Preguntas': 'Question Collections'
  ,'Libros de preguntas y solucionarios organizados por universidad y curso.': 'Question books and solution manuals organized by university and subject.'
  ,'Selección de Preguntas Libros': 'Question Collection Books'
  ,'Libros completos por tipo de admisión.': 'Complete books organized by admission track.'
  ,'Solucionarios UNSA': 'UNSA Solution Manuals'
  ,'Solucionarios UNCP': 'UNCP Solution Manuals'
  ,'Solucionarios individuales por curso.': 'Individual solution manuals by subject.'
  ,'Próximas ampliaciones del catálogo': 'Upcoming catalog additions'
  ,'El catálogo seguirá creciendo': 'More titles are coming'
  ,'Las próximas colecciones y cursos se incorporarán en esta misma biblioteca.': 'New collections and subjects will be added to this library.'
  ,'Volver a la biblioteca': 'Back to the library'
  ,'Abrir libro': 'Open book'
  ,'colecciones': 'collections'
  ,'cursos': 'subjects'
  ,'libros': 'books'
  ,'Catálogo Cuzcano | Biblioteca Universe to Study': 'Cuzcano Catalog | Universe to Study Library'
  ,'Catálogo PREUNI de Editorial Cuzcano con libros Tipo Admisión de Álgebra, Aritmética, Física, Química, Geometría y Trigonometría.': 'Explore Editorial Cuzcano’s PREUNI admission-prep books for Algebra, Arithmetic, Physics, Chemistry, Geometry and Trigonometry.'
  ,'Preparando el catálogo Cuzcano...': 'Preparing the Cuzcano catalog…'
  ,'Catálogo Cuzcano': 'Cuzcano Catalog'
  ,'Libros PREUNI organizados por colección para encontrar rápidamente cada curso y su autor.': 'Browse PREUNI books by collection to quickly find each subject and its author.'
  ,'catálogo': 'catalog'
  ,'sección': 'section'
  ,'PREUNI': 'PREUNI'
  ,'Recopilaciones completas de seminarios resueltos y propuestos para preparación preuniversitaria.': 'Complete collections of worked and proposed seminars for pre-university preparation.'
  ,'Tipo Admisión': 'Admission Prep'
  ,'Curso completo para preparación y práctica orientada al examen de admisión.': 'Complete courses for entrance-exam preparation and practice.'
  ,'El catálogo Cuzcano seguirá creciendo': 'The Cuzcano catalog will keep growing'
  ,'Las siguientes colecciones se incorporarán en esta misma página.': 'New collections will be added to this page.'
  ,'Ver catálogo de Editorial Cuzcano': 'View the Editorial Cuzcano catalog'
  ,'Catálogos de Editorial Cuzcano con libros PREUNI Tipo Admisión y solucionarios de Geometría CEPREUNI 2015-2.': 'Editorial Cuzcano catalogs featuring PREUNI admission-prep books and CEPREUNI 2015-2 Geometry solution manuals.'
  ,'Libros PREUNI y solucionarios CEPREUNI organizados por catálogo, curso, autor y temas.': 'PREUNI books and CEPREUNI solution manuals organized by catalog, subject, author and topic.'
  ,'catálogos': 'catalogs'
  ,'secciones': 'sections'
  ,'SOLUCIONARIOS CEPREUNI 2015-2': 'CEPREUNI 2015-2 SOLUTION MANUALS'
  ,'Materiales de estudio organizados por seminario, con los temas de Geometría indicados en cada portada.': 'Study materials organized by seminar, with each cover’s Geometry topics clearly listed.'
  ,'solucionarios disponibles': 'solution manuals available'
  ,'Seis seminarios CEPREUNI con contenidos progresivos de geometría plana y del espacio.': 'Six CEPREUNI seminars covering progressively advanced plane and solid geometry.'
  ,'seminarios': 'seminars'
  ,'Temas incluidos': 'Topics covered'
  ,'Segmentos y ángulos': 'Segments and angles'
  ,'Conjuntos convexos y no convexos': 'Convex and non-convex sets'
  ,'Partición de un conjunto': 'Partition of a set'
  ,'Triángulos y polígonos': 'Triangles and polygons'
  ,'Cuadriláteros': 'Quadrilaterals'
  ,'Circunferencia': 'Circle'
  ,'Teoremas de Poncelet, Pithot y Thales': 'Poncelet, Pitot and Thales theorems'
  ,'Proporcionalidad': 'Proportionality'
  ,'Semejanza de triángulos': 'Triangle similarity'
  ,'Relaciones métricas': 'Metric relations'
  ,'Polígonos regulares': 'Regular polygons'
  ,'Análisis de figuras': 'Figure analysis'
  ,'Razonamiento matemático': 'Mathematical reasoning'
  ,'Áreas de regiones triangulares': 'Areas of triangular regions'
  ,'Áreas cuadrangulares y circulares': 'Areas of quadrilateral and circular regions'
  ,'Geometría del espacio': 'Solid geometry'
  ,'Rectas y planos': 'Lines and planes'
  ,'Ángulos diedros, poliedros y triedros': 'Dihedral, polyhedral and trihedral angles'
  ,'Ángulo poliedro': 'Polyhedral angle'
  ,'Poliedros y poliedros regulares': 'Polyhedra and regular polyhedra'
  ,'Prisma': 'Prism'
  ,'Pirámide, cilindro y cono': 'Pyramid, cylinder and cone'
  ,'Teorema de Arquímedes': 'Archimedes’ theorem'
  ,'Superficie esférica y esfera': 'Spherical surface and sphere'
  ,'Teorema de Pappus-Guldinus': 'Pappus–Guldinus theorem'
  ,'Abrir solucionario': 'Open solution manual'
  ,'Catálogo 02': 'Catalog 02'
  ,'6 solucionarios disponibles': '6 solution manuals available'
  ,'6 seminarios': '6 seminars'
  ,'CEPREUNI 2015-2 · Geometría': 'CEPREUNI 2015-2 · Geometry'
  ,'Solucionarios de Geometría CEPREUNI 2015-2': 'CEPREUNI 2015-2 Geometry solution manuals'
  ,'Solucionario 1': 'Solution Manual 1'
  ,'Solucionario 2': 'Solution Manual 2'
  ,'Solucionario 3': 'Solution Manual 3'
  ,'Solucionario 4': 'Solution Manual 4'
  ,'Solucionario 5': 'Solution Manual 5'
  ,'Solucionario 6': 'Solution Manual 6'
  ,'Abrir Solucionario 1 de Geometría CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Geometry Solution Manual 1 in Google Drive'
  ,'Abrir Solucionario 2 de Geometría CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Geometry Solution Manual 2 in Google Drive'
  ,'Abrir Solucionario 3 de Geometría CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Geometry Solution Manual 3 in Google Drive'
  ,'Abrir Solucionario 4 de Geometría CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Geometry Solution Manual 4 in Google Drive'
  ,'Abrir Solucionario 5 de Geometría CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Geometry Solution Manual 5 in Google Drive'
  ,'Abrir Solucionario 6 de Geometría CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Geometry Solution Manual 6 in Google Drive'
  ,'Portada del Solucionario 1 de Geometría CEPREUNI': 'Cover of CEPREUNI Geometry Solution Manual 1'
  ,'Portada del Solucionario 2 de Geometría CEPREUNI': 'Cover of CEPREUNI Geometry Solution Manual 2'
  ,'Portada del Solucionario 3 de Geometría CEPREUNI': 'Cover of CEPREUNI Geometry Solution Manual 3'
  ,'Portada del Solucionario 4 de Geometría CEPREUNI': 'Cover of CEPREUNI Geometry Solution Manual 4'
  ,'Portada del Solucionario 5 de Geometría CEPREUNI': 'Cover of CEPREUNI Geometry Solution Manual 5'
  ,'Portada del Solucionario 6 de Geometría CEPREUNI': 'Cover of CEPREUNI Geometry Solution Manual 6'
  ,'Catálogos de Editorial Cuzcano con libros PREUNI Tipo Admisión y solucionarios de Geometría y Aritmética CEPREUNI 2015-2.': 'Editorial Cuzcano catalogs featuring PREUNI admission-prep books and CEPREUNI 2015-2 Geometry and Arithmetic solution manuals.'
  ,'Materiales de estudio de Geometría y Aritmética organizados por seminario, con los temas indicados en cada portada.': 'Geometry and Arithmetic study materials organized by seminar, with the topics shown on each cover.'
  ,'12 solucionarios disponibles': '12 solution manuals available'
  ,'Seis seminarios CEPREUNI con contenidos progresivos de aritmética, proporcionalidad, estadística y probabilidades.': 'Six CEPREUNI seminars covering progressively advanced arithmetic, proportionality, statistics and probability.'
  ,'CEPREUNI 2015-2 · Aritmética': 'CEPREUNI 2015-2 · Arithmetic'
  ,'Solucionarios de Aritmética CEPREUNI 2015-2': 'CEPREUNI 2015-2 Arithmetic solution manuals'
  ,'Razones y proporciones': 'Ratios and proportions'
  ,'Magnitudes proporcionales': 'Proportional quantities'
  ,'Regla de tres simple y compuesta': 'Simple and compound rule of three'
  ,'Repartos proporcionales y regla de compañía': 'Proportional distribution and partnership rule'
  ,'Tanto por ciento': 'Percentages'
  ,'Regla de interés': 'Interest rule'
  ,'Regla de descuento': 'Discount rule'
  ,'Regla de mezcla y aleación': 'Mixture and alloy rule'
  ,'Estadística': 'Statistics'
  ,'Estadística descriptiva': 'Descriptive statistics'
  ,'Medidas de tendencia central y dispersión': 'Measures of central tendency and dispersion'
  ,'Tablas y gráficos estadísticos': 'Statistical tables and charts'
  ,'Análisis combinatorio': 'Combinatorics'
  ,'Probabilidades': 'Probability'
  ,'Numeración': 'Numeration'
  ,'Cuatro operaciones': 'Four basic operations'
  ,'Sucesiones y series': 'Sequences and series'
  ,'Divisibilidad': 'Divisibility'
  ,'Divisibilidad y sus criterios': 'Divisibility and its rules'
  ,'Números primos': 'Prime numbers'
  ,'Divisores positivos de un número': 'Positive divisors of a number'
  ,'M.C.M. y M.C.D.': 'LCM and GCD'
  ,'Números racionales': 'Rational numbers'
  ,'Fracciones': 'Fractions'
  ,'Expresiones decimales': 'Decimal expressions'
  ,'Potenciación': 'Exponentiation'
  ,'Radicación': 'Radicals'
  ,'Abrir Solucionario 1 de Aritmética CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Arithmetic Solution Manual 1 in Google Drive'
  ,'Abrir Solucionario 2 de Aritmética CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Arithmetic Solution Manual 2 in Google Drive'
  ,'Abrir Solucionario 3 de Aritmética CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Arithmetic Solution Manual 3 in Google Drive'
  ,'Abrir Solucionario 4 de Aritmética CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Arithmetic Solution Manual 4 in Google Drive'
  ,'Abrir Solucionario 5 de Aritmética CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Arithmetic Solution Manual 5 in Google Drive'
  ,'Abrir Solucionario 6 de Aritmética CEPREUNI 2015-2 en Google Drive': 'Open CEPREUNI 2015-2 Arithmetic Solution Manual 6 in Google Drive'
  ,'Portada del Solucionario 1 de Aritmética CEPREUNI': 'Cover of CEPREUNI Arithmetic Solution Manual 1'
  ,'Portada del Solucionario 2 de Aritmética CEPREUNI': 'Cover of CEPREUNI Arithmetic Solution Manual 2'
  ,'Portada del Solucionario 3 de Aritmética CEPREUNI': 'Cover of CEPREUNI Arithmetic Solution Manual 3'
  ,'Portada del Solucionario 4 de Aritmética CEPREUNI': 'Cover of CEPREUNI Arithmetic Solution Manual 4'
  ,'Portada del Solucionario 5 de Aritmética CEPREUNI': 'Cover of CEPREUNI Arithmetic Solution Manual 5'
  ,'Portada del Solucionario 6 de Aritmética CEPREUNI': 'Cover of CEPREUNI Arithmetic Solution Manual 6'
  ,'Prof. Jimmy García Ch.': 'Prof. Jimmy García Ch.'
  ,'Catálogo Universe | Biblioteca Universe to Study': 'Universe Catalog | Universe to Study Library'
  ,'Catálogo de solucionarios CEPREUNI 2027-1 preparados por UNIVERSE y CICLESOLUS.': 'CEPREUNI 2027-1 solution manual catalog prepared by UNIVERSE and CICLESOLUS.'
  ,'Preparando el catálogo Universe...': 'Preparing the Universe catalog…'
  ,'Biblioteca original': 'Original library'
  ,'Catálogo Universe': 'Universe Catalog'
  ,'Solucionarios CEPREUNI desarrollados para acompañar tu preparación, organizados por ciclo y curso.': 'CEPREUNI solution manuals developed to support your preparation, organized by term and subject.'
  ,'Resumen del catálogo': 'Catalog overview'
  ,'catálogo': 'catalog'
  ,'colección': 'collection'
  ,'próximos libros': 'upcoming books'
  ,'UNIVERSE y CICLESOLUS': 'UNIVERSE and CICLESOLUS'
  ,'Contenido original en colaboración': 'Original collaborative content'
  ,'Estos materiales son preparados y publicados exclusivamente por UNIVERSE y CICLESOLUS para estudiantes del ciclo preuniversitario CEPREUNI 2027-1.': 'These materials are prepared and published exclusively by UNIVERSE and CICLESOLUS for students in the CEPREUNI 2027-1 pre-university term.'
  ,'SOLUCIONARIOS CEPREUNI 2027-1': 'CEPREUNI 2027-1 SOLUTION MANUALS'
  ,'La colección se publicará progresivamente. Las portadas ya están listas y los enlaces aparecerán cuando cada solucionario esté disponible.': 'The collection will be released progressively. The covers are ready, and links will appear as each solution manual becomes available.'
  ,'Próximamente': 'Coming soon'
  ,'Materiales de estudio': 'Study materials'
  ,'Seis cursos del ciclo preuniversitario CEPREUNI 2027-1.': 'Six subjects from the CEPREUNI 2027-1 pre-university term.'
  ,'Próximos solucionarios CEPREUNI 2027-1': 'Upcoming CEPREUNI 2027-1 solution manuals'
  ,'En preparación': 'In preparation'
  ,'Álgebra, próximamente': 'Algebra, coming soon'
  ,'Aritmética, próximamente': 'Arithmetic, coming soon'
  ,'Geometría, próximamente': 'Geometry, coming soon'
  ,'Trigonometría, próximamente': 'Trigonometry, coming soon'
  ,'Física, próximamente': 'Physics, coming soon'
  ,'Química, próximamente': 'Chemistry, coming soon'
  ,'Portada de Álgebra, material de estudio CEPREUNI 2027-1': 'Cover of Algebra study material for CEPREUNI 2027-1'
  ,'Portada de Aritmética, material de estudio CEPREUNI 2027-1': 'Cover of Arithmetic study material for CEPREUNI 2027-1'
  ,'Portada de Geometría, material de estudio CEPREUNI 2027-1': 'Cover of Geometry study material for CEPREUNI 2027-1'
  ,'Portada de Trigonometría, material de estudio CEPREUNI 2027-1': 'Cover of Trigonometry study material for CEPREUNI 2027-1'
  ,'Portada de Física, material de estudio CEPREUNI 2027-1': 'Cover of Physics study material for CEPREUNI 2027-1'
  ,'Portada de Química, material de estudio CEPREUNI 2027-1': 'Cover of Chemistry study material for CEPREUNI 2027-1'
  ,'Próxima publicación': 'Upcoming release'
  ,'Los solucionarios estarán disponibles próximamente': 'The solution manuals will be available soon'
  ,'Cuando cada libro esté listo, su tarjeta incluirá el acceso correspondiente en esta misma página.': 'When each book is ready, its card will provide access from this page.'
  ,'Logo de Editorial Universe': 'Editorial Universe logo'
  ,'En colaboración con CICLESOLUS': 'In collaboration with CICLESOLUS'
  ,'Ver catálogo de Editorial Universe': 'View the Editorial Universe catalog'
  ,'Recursos, seguimiento y comunidad para postulantes UNI y estudiantes CEPREUNI.': 'Resources, progress tracking and community support for UNI applicants and CEPREUNI students.'
  ,'disponible': 'available'
  ,'próximos': 'upcoming'
  ,'1 disponible · 5 próximos': '1 available · 5 upcoming'
  ,'Materiales de estudio CEPREUNI 2027-1': 'CEPREUNI 2027-1 study materials'
  ,'Abrir Álgebra CEPREUNI 2027-1 en modo lector': 'Open CEPREUNI 2027-1 Algebra in reading mode'
  ,'Disponible': 'Available'
  ,'Abrir en modo lector': 'Open in reading mode'
  ,'Álgebra ya está disponible': 'Algebra is now available'
  ,'El documento se abre en modo lector y mostrará automáticamente las actualizaciones que se publiquen.': 'The document opens in reading mode and will automatically show every published update.'
  ,'Biblioteca CEPREUNI 2027-1 | Universe to Study': 'CEPREUNI 2027-1 Library | Universe to Study'
  ,'Materiales del Ciclo Preuniversitario CEPREUNI 2027-1 organizados por entrega, con vista previa de cada carátula.': 'CEPREUNI 2027-1 Pre-University Cycle materials organized by release, with a preview of every cover.'
  ,'Preparando la biblioteca CEPREUNI...': 'Preparing the CEPREUNI library…'
  ,'Ciclo preuniversitario': 'Pre-University Cycle'
  ,'Biblioteca del ciclo': 'Cycle library'
  ,'Materiales CEPREUNI 2027-1': 'CEPREUNI 2027-1 Materials'
  ,'Materiales del ciclo preuniversitario organizados por entrega, con la carátula real de cada PDF para que encuentres rápidamente lo que necesitas.': 'Pre-university cycle materials organized by release, with the real cover of every PDF so you can quickly find what you need.'
  ,'sección': 'section'
  ,'material': 'material'
  ,'Centro de Estudios Preuniversitarios de la Universidad Nacional de Ingeniería': 'Pre-University Studies Center of the National University of Engineering'
  ,'Logo oficial de CEPREUNI': 'Official CEPREUNI logo'
  ,'Ciclo preuniversitario 2027-1': '2027-1 Pre-University Cycle'
  ,'MATERIALES CEPREUNI': 'CEPREUNI MATERIALS'
  ,'Publicaciones académicas organizadas según el orden de entrega del ciclo 2027-1.': 'Academic materials organized in the order they are released during the 2027-1 cycle.'
  ,'PRIMER MATERIAL': 'FIRST MATERIAL'
  ,'Primera entrega del ciclo preuniversitario CEPREUNI 2027-1.': 'First release of the CEPREUNI 2027-1 Pre-University Cycle.'
  ,'Libros del primer material CEPREUNI 2027-1': 'Books in the first CEPREUNI 2027-1 material release'
  ,'Abrir Álgebra Libro 1 de CEPREUNI 2027-1 en Google Drive': 'Open CEPREUNI 2027-1 Algebra Book 1 in Google Drive'
  ,'Vista previa de la carátula de Álgebra Libro 1, primer material CEPREUNI 2027-1': 'Cover preview of Algebra Book 1, first CEPREUNI 2027-1 material release'
  ,'Vista previa del PDF': 'PDF preview'
  ,'41 páginas · Material de estudio': '41 pages · Study material'
  ,'Abrir material': 'Open material'
  ,'Próximos materiales': 'Upcoming materials'
  ,'Esta biblioteca seguirá creciendo': 'This library will keep growing'
  ,'Las próximas entregas y cursos se añadirán en esta misma página, manteniendo la vista previa de cada carátula.': 'Upcoming releases and subjects will be added to this page, always with a preview of every cover.'
  ,'Volver a CEPREUNI': 'Back to CEPREUNI'
  ,'Biblioteca CEPREUNI 2027-1': 'CEPREUNI 2027-1 Library'
  ,'Materiales del ciclo organizados por entrega, con vista previa de la carátula de cada PDF.': 'Cycle materials organized by release, with a preview of every PDF cover.'
  ,'Perfil único Universe': 'Unified Universe profile'
  ,'Tu nombre': 'Your name'
  ,'Completa tu situación académica': 'Complete your academic information'
  ,'Indica qué buscas en la comunidad': 'Tell the community what you need'
  ,'Esta misma identidad se usa en tu cuenta, en UNITalk y en los demás espacios de Universe.': 'This same identity is used across your account, UNITalk and every other Universe space.'
  ,'Ver mi perfil en UNITalk': 'View my UNITalk profile'
  ,'Configuración única': 'One profile setup'
  ,'Información de tu perfil': 'Your profile information'
  ,'Completa solo lo que corresponde a tu situación. El correo y el teléfono siempre serán privados.': 'Complete only the fields that apply to you. Your email address and phone number always remain private.'
  ,'Un solo perfil · Un solo guardado': 'One profile · One save button'
  ,'Identidad': 'Identity'
  ,'Así aparecerás en Universe y UNITalk.': 'This is how you will appear on Universe and UNITalk.'
  ,'Nombre visible': 'Display name'
  ,'Usuario público': 'Public username'
  ,'Teléfono privado': 'Private phone number'
  ,'Descripción breve': 'Short bio'
  ,'Cuéntale a la comunidad qué estudias, qué meta tienes o cómo pueden ayudarte.': 'Tell the community what you study, what your goal is or how others can help you.'
  ,'Situación académica': 'Academic status'
  ,'Los campos se adaptan automáticamente a tu elección.': 'The form automatically adapts to your selection.'
  ,'¿Cuál es tu situación actual?': 'What is your current academic status?'
  ,'Soy de CEPREUNI': 'I study at CEPREUNI'
  ,'Estudio en una academia': 'I attend a prep academy'
  ,'Soy autodidacta': 'I study independently'
  ,'Ya soy estudiante UNI': 'I am already a UNI student'
  ,'Programa o modalidad': 'Program or track'
  ,'Selecciona una modalidad': 'Select a program'
  ,'Básico': 'Basic'
  ,'Preuniversitario (PRE)': 'Pre-University (PRE)'
  ,'Escolar': 'School Program'
  ,'Repaso': 'Review Program'
  ,'Ciclo o modalidad': 'Program or track'
  ,'Selecciona tu ciclo': 'Select your program'
  ,'Carrera UNI': 'UNI major'
  ,'Ejemplo: Ingeniería Civil': 'Example: Civil Engineering'
  ,'Ciclo universitario': 'Current university term'
  ,'Objetivo principal': 'Primary goal'
  ,'En la comunidad estoy...': 'In the community, I am...'
  ,'Dispuesto/a a apoyar': 'Available to help others'
  ,'Buscando material': 'Looking for study materials'
  ,'Quiero apoyar y busco material': 'Available to help and looking for materials'
  ,'Aquí para estudiar y conocer personas': 'Here to study and meet other students'
  ,'Estudiante UNI': 'UNI student'
  ,'Estudiante autodidacta': 'Independent student'
  ,'Estudia en una academia': 'Attends a prep academy'
  ,'Apoya y busca material': 'Helps others and looks for materials'
  ,'Privacidad': 'Privacy'
  ,'Controla qué información académica aparece en UNITalk.': 'Choose which academic details appear on UNITalk.'
  ,'Quién puede ver mi perfil': 'Who can view my profile'
  ,'Mantener datos académicos privados': 'Keep academic details private'
  ,'Mostrar ciclo, modalidad o carrera': 'Show my term, program or major'
  ,'Mostrar objetivo y lo que busco': 'Show my goal and what I need'
  ,'Todo listo en un solo lugar': 'Everything in one place'
  ,'Revisa tus datos y guarda el perfil completo.': 'Review your information and save your complete profile.'
  ,'Guardar todos los cambios': 'Save all changes'
  ,'Es el mismo perfil que utilizas en todo Universe.': 'This is the same profile you use throughout Universe.'
  ,'Editar mi perfil único': 'Edit my unified profile'
  ,'Perfil y privacidad': 'Profile and privacy'
  ,'La identidad y privacidad se administran juntas desde tu perfil único.': 'Manage your identity and privacy together from your unified profile.'
  ,'Abrir configuración del perfil': 'Open profile settings'
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
