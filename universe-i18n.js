(function () {
  'use strict';

  var STORAGE_KEY = 'universe_language';
  var DEFAULT_LANGUAGE = 'es';
  var SUPPORTED = ['es', 'en'];
  var language = readLanguage();
  var catalogPromise = null;
  var observer = null;
  var originalText = new WeakMap();
  var translatedText = new WeakMap();
  var originalAttributes = new WeakMap();
  var templateRules = [];
  var wordCatalog = null;

  var runtimeOverrides = {
    '¿Qué curso quieres repasar hoy?': 'What do you want to review today?',
    'El catálogo reúne los videos reales publicados por UNIverse, TODO PRE y Bastet. Cada título se conserva tal como aparece en su canal.': 'Browse real classes from UNIverse, TODO PRE and Bastet. Video titles stay exactly as published by each channel.',
    'Ver publicación oficial': 'View official release',
    'Iniciar sesión': 'Sign in',
    'Usuario': 'User',
    'Todos': 'All',
    'Tema y frecuencia': 'Topic and frequency',
    'Piso histórico': 'Historical floor',
    'Último proceso': 'Latest cycle',
    'Personas con discapacidad': 'Applicants with disabilities',
    'pruebas con nota': 'exams scored',
    'Proyección 2027-1 calculada con los cortes históricos, incluido el resultado final 2026-2. No garantiza una vacante.': 'The 2027-1 projection uses historical cutoffs, including the final 2026-2 results. It does not guarantee admission.',
    'Puntaje más alto': 'Highest score',
    'último dato disponible': 'latest available data',
    'Corte mínimo bajo': 'Lowest cutoff',
    'Conversaciones': 'Conversations',
    'Tu nombre': 'Your name',
    'tu nombre': 'Your name',
    'El chat ha sido cerrado. Vuelve a consultar volviendo a abrir el chat de soporte.': 'This support request is closed. Open support again whenever you need a new conversation.',
    'El chat ha sido cerrado. Vuelve a consultar abriendo otra vez el chat de soporte.': 'This support request is closed. Open support again whenever you need a new conversation.',
    'Soporte requiere cuenta Gmail': 'Support requires a Google account',
    'Soporte requiere cuenta de Gmail': 'Support requires a Google account',
    'Para proteger tu consulta, inicia sesión con Google. El chat usará automáticamente tu nombre de Gmail.': 'Sign in with Google to keep your request private. Support will use the name on your Google account.',
    'MODO INVITADO - UNI': 'GUEST MODE · UNI',
    'o inicia con Google': 'or sign in with Google',
    'o accede desde': 'or visit',
    'Sitio Oficial': 'Official website',
    'Cerrar': 'Close',
    'Invitado': 'Guest',
    'Agenda 2026-2': '2026-2 Syllabus',
    'Expresiones, polinomios, ecuaciones, matrices y funciones.': 'Expressions, polynomials, equations, matrices and functions.',
    'Language, sociedad y razonamiento': 'Language, society and reasoning',
    'Hechos nacionales e internacionales relevantes.': 'Key developments in Peru and around the world.',
    'Conducta, procesos cognitivos, aprendizaje y personalidad.': 'Behavior, cognitive processes, learning and personality.'
  };

  var academicPhrases = [
    ['Facultad de Ingeniería Económica, Estadística y Ciencias Sociales', 'Faculty of Economic Engineering, Statistics and Social Sciences'],
    ['Facultad de Ingeniería Geológica, Minera y Metalúrgica', 'Faculty of Geological, Mining and Metallurgical Engineering'],
    ['Facultad de Ingeniería de Petróleo, Gas Natural y Petroquímica', 'Faculty of Petroleum, Natural Gas and Petrochemical Engineering'],
    ['Facultad de Ingeniería Eléctrica y Electrónica', 'Faculty of Electrical and Electronic Engineering'],
    ['Facultad de Ingeniería Industrial y de Sistemas', 'Faculty of Industrial and Systems Engineering'],
    ['Facultad de Arquitectura, Urbanismo y Artes', 'Faculty of Architecture, Urban Planning and Arts'],
    ['Facultad de Ingeniería Química y Textil', 'Faculty of Chemical and Textile Engineering'],
    ['Facultad de Ingeniería Ambiental', 'Faculty of Environmental Engineering'],
    ['Facultad de Ingeniería Mecánica', 'Faculty of Mechanical Engineering'],
    ['Facultad de Ingeniería Civil', 'Faculty of Civil Engineering'],
    ['Facultad de Ciencias', 'Faculty of Sciences'],
    ['Ingeniería de Higiene y Seguridad Industrial', 'Occupational Health and Safety Engineering'],
    ['Ingeniería de Inteligencia Artificial', 'Artificial Intelligence Engineering'],
    ['Ingeniería de Petróleo y Gas Natural', 'Petroleum and Natural Gas Engineering'],
    ['Ingeniería de Telecomunicaciones', 'Telecommunications Engineering'],
    ['Ingeniería Mecánica Eléctrica', 'Electromechanical Engineering'],
    ['Ingeniería Mecánica-Eléctrica', 'Electromechanical Engineering'],
    ['Ingeniería de Ciberseguridad', 'Cybersecurity Engineering'],
    ['Ingeniería de la Computación', 'Computer Engineering'],
    ['Ciencia de la Computación', 'Computer Science'],
    ['Ingeniería Aeroespacial', 'Aerospace Engineering'],
    ['Ingeniería Mecatrónica', 'Mechatronics Engineering'],
    ['Ingeniería Metalúrgica', 'Metallurgical Engineering'],
    ['Ingeniería Petroquímica', 'Petrochemical Engineering'],
    ['Ingeniería Electrónica', 'Electronic Engineering'],
    ['Ingeniería Biomédica', 'Biomedical Engineering'],
    ['Ingeniería Geológica', 'Geological Engineering'],
    ['Ingeniería Económica', 'Economic Engineering'],
    ['Ingeniería Estadística', 'Statistical Engineering'],
    ['Ingeniería Industrial', 'Industrial Engineering'],
    ['Ingeniería de Sistemas', 'Systems Engineering'],
    ['Ingeniería de Software', 'Software Engineering'],
    ['Ingeniería Mecánica', 'Mechanical Engineering'],
    ['Ingeniería Sanitaria', 'Sanitary Engineering'],
    ['Ingeniería Ambiental', 'Environmental Engineering'],
    ['Ingeniería Eléctrica', 'Electrical Engineering'],
    ['Ingeniería Química', 'Chemical Engineering'],
    ['Ingeniería de Minas', 'Mining Engineering'],
    ['Ingeniería Física', 'Physics Engineering'],
    ['Ingeniería Textil', 'Textile Engineering'],
    ['Ingeniería Civil', 'Civil Engineering'],
    ['Ingeniería Naval', 'Naval Engineering'],
    ['Razonamiento Matemático', 'Mathematical Reasoning'],
    ['Razonamiento Verbal', 'Verbal Reasoning'],
    ['Aptitud Académica', 'Academic Aptitude'],
    ['Cantidades Físicas', 'Physical Quantities'],
    ['Cinemática Unidimensional', 'One-dimensional Kinematics'],
    ['Análisis de Figuras', 'Figure Analysis'],
    ['Razonamiento Lógico', 'Logical Reasoning'],
    ['Sucesiones y Distribuciones Numéricas', 'Sequences and Number Patterns'],
    ['Suficiencia de Datos', 'Data Sufficiency'],
    ['Ángulo Trigonométrico', 'Trigonometric Angles'],
    ['Razones Trigonométricas de Ángulos Agudos', 'Trigonometric Ratios of Acute Angles'],
    ['Bases del Modelo Atómico Actual', 'Foundations of the Modern Atomic Model'],
    ['Modelo Atómico Actual', 'Modern Atomic Model'],
    ['Configuración Electrónica', 'Electron Configuration'],
    ['Nociones Básicas', 'Core Concepts'],
    ['Humanidades', 'Humanities'],
    ['Matemática', 'Mathematics'],
    ['Aritmética', 'Arithmetic'],
    ['Geometría', 'Geometry'],
    ['Trigonometría', 'Trigonometry'],
    ['Álgebra', 'Algebra'],
    ['Física', 'Physics'],
    ['Química', 'Chemistry'],
    ['Literatura', 'Literature'],
    ['Historia', 'History'],
    ['Geografía', 'Geography'],
    ['Economía', 'Economics'],
    ['Psicología', 'Psychology'],
    ['Filosofía', 'Philosophy'],
    ['Lenguaje', 'Language'],
    ['Arquitectura', 'Architecture'],
    ['Urbanismo', 'Urban Planning'],
    ['Inglés', 'English'],
    ['Álg.', 'Alg.'],
    ['Arit.', 'Arith.'],
    ['CIENCIAS', 'SCIENCES'],
    ['HUMANIDADES', 'HUMANITIES'],
    ['1RA PC', 'PC 1'],
    ['2DA PC', 'PC 2'],
    ['3RA PC', 'PC 3'],
    ['4TA PC', 'PC 4'],
    ['5TA PC', 'PC 5'],
    ['6TA PC', 'PC 6'],
    ['7MA PC', 'PC 7'],
    ['Desviación de', 'Standard deviation:'],
    ['Estadísticas', 'Statistics'],
    ['Evaluación', 'Assessment'],
    ['Mínimo', 'Minimum'],
    ['Máximo', 'Maximum']
  ];

  var dynamicRules = [
    [/^(\d+)\s+colecciones?$/i, '$1 collections'],
    [/^(\d+)\s+cursos?$/i, '$1 subjects'],
    [/^(\d+)\s+libros disponibles$/i, '$1 books available'],
    [/^(\d+)\s+libros?$/i, '$1 books'],
    [/^Colección\s+(\d+)$/i, 'Collection $1'],
    [/^Sección\s+(\d+)$/i, 'Section $1'],
    [/^Libros de (.+) de Lumbreras$/i, 'Lumbreras $1 books'],
    [/^Libros de la colección (.+) de Lumbreras$/i, 'Books in the Lumbreras $1 collection'],
    [/^Abrir (.+) en Google Drive$/i, 'Open $1 in Google Drive'],
    [/^Pregunta\s+(\d+)\s+de\s+(\d+)$/i, 'Question $1 of $2'],
    [/^Pregunta\s+(\d+)$/i, 'Question $1'],
    [/^([\d.,]+)\s*%\s+del puntaje máximo$/i, '$1% of the maximum score'],
    [/^Proyección general\s+([^:]+):\s+desde\s+(.+?)\s+pts\s+en carreras de menor corte hasta\s+(.+?)\s+pts\s+en\s+(.+)\.\s+Usa el selector de abajo para ver una carrera concreta\.$/i, 'Overall projection for $1: from $2 pts for lower-cutoff majors to $3 pts for $4. Use the selector below to check a specific major.'],
    [/^El porcentaje indicará cuántos cortes mínimos históricos de\s+(.+)\s+habría superado tu puntaje\.$/i, 'This percentage shows how many of $1’s historical cutoff scores your result would have cleared.'],
    [/^(.+): la zona ideal aproximada es\s+(.+)\s+puntos\. Para el siguiente proceso\s+([^,]+), apunta como mínimo a\s+(.+)\s+puntos\s+\((.+)\)\. Además, la tendencia histórica viene subiendo, así que se agregó un margen extra\. La meta ideal queda por encima del último registro incorporado: conviene preparar un margen adicional\.$/i, '$1: the estimated target range is $2 points. For the next $3 cycle, aim for at least $4 points ($5). The historical trend is moving up, so this target includes an extra safety margin above the latest cutoff.'],
    [/^(.+): la zona ideal aproximada es\s+(.+)\s+puntos\. Para el siguiente proceso\s+([^,]+), apunta como mínimo a\s+(.+)\s+puntos\s+\((.+)\)\. Aunque la tendencia histórica bajó, se mantiene un margen de seguridad para no depender del corte mínimo\. (.+)$/i, '$1: the estimated target range is $2 points. For the next $3 cycle, aim for at least $4 points ($5). Even though the trend has eased, the estimate keeps a safety buffer instead of relying on the bare minimum. $6'],
    [/^(.+): la zona ideal aproximada es\s+(.+)\s+puntos\. Para el siguiente proceso\s+([^,]+), apunta como mínimo a\s+(.+)\s+puntos\s+\((.+)\)\. Se añadió un margen de seguridad por variación histórica\. (.+)$/i, '$1: the estimated target range is $2 points. For the next $3 cycle, aim for at least $4 points ($5). A safety buffer has been added to account for historical variation. $6'],
    [/^(\d[\d.,]*)\s+postulantes?$/i, '$1 applicants'],
    [/^(\d[\d.,]*)\s+ingresantes?$/i, '$1 admitted students'],
    [/^(\d[\d.,]*)\s+resultados?$/i, '$1 results'],
    [/^(\d[\d.,]*)\s+carpetas?$/i, '$1 folders'],
    [/^(\d[\d.,]*)\s+archivos?$/i, '$1 files'],
    [/^(\d[\d.,]*)\s+comentarios?$/i, '$1 comments'],
    [/^(\d[\d.,]*)\s+preguntas?$/i, '$1 questions'],
    [/^Mostrar más\s*\(([^)]+)\)$/i, 'Show more ($1)'],
    [/^Mostrar\s+(\d+)\s+preguntas más$/i, 'Show $1 more questions'],
    [/^Página\s+(\d+)\s+de\s+(\d+)$/i, 'Page $1 of $2'],
    [/^Puesto\s+#?(\d+)$/i, 'Rank #$1'],
    [/^Semana\s+(\d+)$/i, 'Week $1'],
    [/^Semanas\s+(\d+)\s+a\s+(\d+)\.\s+Todos los cursos y todos sus temas se muestran completos a continuación\.$/i, 'Weeks $1–$2. Every subject and topic is listed in full below.'],
    [/^Semanas\s+(\d+)\s+a\s+(\d+)$/i, 'Weeks $1–$2'],
    [/^Contenido de semanas\s+(\d+)\s+a\s+(\d+)\s+-\s+(\d+)\s+temas$/i, 'Weeks $1–$2 content · $3 topics'],
    [/^Acumulado:\s+semanas\s+(\d+)\s+a\s+(\d+)\s+-\s+(\d+)\s+temas$/i, 'Cumulative: weeks $1–$2 · $3 topics'],
    [/^Curso$/i, 'Course'],
    [/^Prueba\s+(\d+)$/i, 'Test $1'],
    [/^(\d+)\s+minutos?$/i, '$1 minutes'],
    [/^Hace\s+(\d+)\s+minutos?$/i, '$1 minutes ago'],
    [/^Hace\s+(\d+)\s+horas?$/i, '$1 hours ago'],
    [/^Hace\s+(\d+)\s+días?$/i, '$1 days ago'],
    [/^Quedan\s+(.+)$/i, '$1 left'],
    [/^Nota:\s*(.+)$/i, 'Score: $1'],
    [/^Puntaje:\s*(.+)$/i, 'Score: $1'],
    [/^Promedio:\s*(.+)$/i, 'Average: $1'],
    [/^Promedio\s+(.+)$/i, 'Average $1'],
    [/^(.+?)\s+·\s+([A-Z0-9]+)\s+·\s+([\d.,]+)\s+empatados en el mínimo$/i, '$1 · $2 · $3 tied for the lowest score'],
    [/^Puesto estimado\s+([\d.,]+)\s+de\s+([\d.,]+)\s+·\s+sobre la media$/i, 'Estimated rank $1 of $2 · above average'],
    [/^Puesto estimado\s+([\d.,]+)\s+de\s+([\d.,]+)\s+·\s+debajo de la media$/i, 'Estimated rank $1 of $2 · below average'],
    [/^Resultados finales Admisión UNI\s+(.+)$/i, 'Final UNI admission results · $1'],
    [/^([\d.,]+)\s+estudiantes con datos suficientes para el ponderado$/i, '$1 students with enough scores to calculate the weighted average'],
    [/^(\d+)\s+preguntas\s+·\s+1\s+hora$/i, '$1 questions · 1 hour'],
    [/^(\d+)\s+preguntas\s+·\s+(\d+)\s+horas$/i, '$1 questions · $2 hours'],
    [/^Código:\s*(.+)$/i, 'Student ID: $1'],
    [/^Código\s+(.+)$/i, 'Student ID $1'],
    [/^Carrera seleccionada:\s+(.+)$/i, 'Selected major: $1'],
    [/^Ingresa la nota de tu primera prueba\.$/i, 'Enter your first exam score to get started.'],
    [/^La referencia más baja de esta carrera fue\s+(.+?)\s+pts\s+\((.+?)\)\.\s+Solo compararemos las pruebas que hayas ingresado\.$/i, 'The lowest recorded cutoff for this major was $1 pts ($2). We will only use the exams you have entered.'],
    [/^(.+?)\/20\s+·\s+mínimo de\s+(\d+)\s+ciclos$/i, '$1/20 · lowest across $2 cycles'],
    [/^Siguiente:\s+(.+)$/i, 'Up next: $1'],
    [/^Cuando ingreses una nota, calcularemos la meta de las pruebas que faltan\.$/i, 'Once you enter a score, we will calculate the target for your remaining exams.'],
    [/^([\d.,]+)\s+pts por examen restante$/i, '$1 pts needed per remaining exam'],
    [/^Sube\s+([\d.,]+)\s+pts por ciclo$/i, 'Rising $1 pts per cycle'],
    [/^Baja\s+([\d.,]+)\s+pts por ciclo$/i, 'Down $1 pts per cycle'],
    [/^Tema\s+(\d+)\s+del temario\s+·\s+presente en\s+(\d+)\s+procesos$/i, 'Syllabus topic $1 · appeared in $2 admission cycles'],
    [/^(\d+)\s+de\s+(\d+)\s+exámenes$/i, '$1 of $2 exams'],
    [/^Tema$/i, 'Topic'],
    [/^Carrera:\s*(.+)$/i, 'Major: $1'],
    [/^Sede:\s*(.+)$/i, 'Campus: $1'],
    [/^Ciclo:\s*(.+)$/i, 'Cycle: $1'],
    [/^Examen\s+(.+)$/i, 'Exam $1'],
    [/^PC\s*(\d+)$/i, 'PC$1'],
    [/^Primer examen parcial$/i, 'First midterm'],
    [/^Segundo examen parcial$/i, 'Second midterm'],
    [/^Examen final$/i, 'Final exam']
  ];

  function readLanguage() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.indexOf(saved) >= 0 ? saved : DEFAULT_LANGUAGE;
    } catch (_) {
      return DEFAULT_LANGUAGE;
    }
  }

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function translateAcademicPhrases(value) {
    var output = String(value || '');
    academicPhrases.forEach(function (pair) { output = output.split(pair[0]).join(pair[1]); });
    return output;
  }

  function isIgnored(node) {
    var element = node && (node.nodeType === 1 ? node : node.parentElement);
    return !element || Boolean(element.closest('script,style,noscript,code,pre,[data-i18n-ignore],.notranslate,[translate="no"]'));
  }

  function loadCatalog() {
    if (window.UNIVERSE_I18N_CATALOG) {
      prepareCatalog();
      return Promise.resolve(window.UNIVERSE_I18N_CATALOG);
    }
    if (catalogPromise) return catalogPromise;
    document.documentElement.classList.add('uts-i18n-loading');
    catalogPromise = new Promise(function (resolve, reject) {
      var existing = document.getElementById('uts-i18n-catalog');
      var script = existing || document.createElement('script');
      if (!existing) {
        script.id = 'uts-i18n-catalog';
        script.src = '/universe-i18n-catalog.js?v=en-16';
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', function () {
        prepareCatalog();
        document.documentElement.classList.remove('uts-i18n-loading');
        resolve(window.UNIVERSE_I18N_CATALOG || {});
      }, { once: true });
      script.addEventListener('error', function () {
        document.documentElement.classList.remove('uts-i18n-loading');
        reject(new Error('Could not load the English language catalog.'));
      }, { once: true });
    });
    return catalogPromise;
  }

  function prepareCatalog() {
    var catalog = window.UNIVERSE_I18N_CATALOG || {};
    templateRules = [];
    wordCatalog = Object.create(null);
    Object.keys(catalog).forEach(function (source) {
      var target = catalog[source];
      if (/\$\{[^}]+}|\{\{[^}]+}}|%[sdif]/.test(source)) {
        var tokens = source.match(/\$\{[^}]+}|\{\{[^}]+}}|%[sdif]/g) || [];
        var expression = escapeRegExp(source);
        tokens.forEach(function (token) {
          expression = expression.replace(escapeRegExp(token), '(.+?)');
        });
        templateRules.push({ regex: new RegExp('^' + expression + '$', 'i'), tokens: tokens, target: target });
      }
      if (/^[\p{L}ÁÉÍÓÚÜÑáéíóúüñ]{2,}(?:\s+[\p{L}ÁÉÍÓÚÜÑáéíóúüñ]{2,})?$/u.test(source)) {
        wordCatalog[source.toLocaleLowerCase('es')] = target;
      }
    });
  }

  function renderTemplate(rule, match) {
    var translated = rule.target;
    rule.tokens.forEach(function (token, index) {
      translated = translated.replace(token, match[index + 1]);
    });
    return translated;
  }

  function translateUnknown(source) {
    for (var i = 0; i < dynamicRules.length; i += 1) {
      if (dynamicRules[i][0].test(source)) return translateAcademicPhrases(source.replace(dynamicRules[i][0], dynamicRules[i][1]));
    }
    for (var j = 0; j < templateRules.length; j += 1) {
      var match = source.match(templateRules[j].regex);
      if (match) return renderTemplate(templateRules[j], match);
    }

    if (wordCatalog && source.length <= 90) {
      var parts = source.split(/(\s+|[,:;|/·()])/);
      var changed = false;
      var translatedParts = parts.map(function (part) {
        var key = normalize(part).toLocaleLowerCase('es');
        if (!key || !wordCatalog[key]) return part;
        changed = true;
        return wordCatalog[key];
      });
      if (changed) return translatedParts.join('');
    }
    return source;
  }

  function translate(source) {
    var clean = normalize(source);
    if (!clean || language === 'es') return clean;
    var catalog = window.UNIVERSE_I18N_CATALOG || {};
    if (runtimeOverrides[clean]) return runtimeOverrides[clean];
    if (catalog[clean]) return translateAcademicPhrases(catalog[clean]);
    var directional = clean.match(/^(.*?)(\s*[→↗←])$/);
    if (directional && catalog[normalize(directional[1])]) return translateAcademicPhrases(catalog[normalize(directional[1])]) + directional[2];
    return translateAcademicPhrases(translateUnknown(clean));
  }

  function translatedValue(value) {
    var leading = String(value).match(/^\s*/)?.[0] || '';
    var trailing = String(value).match(/\s*$/)?.[0] || '';
    return leading + translate(value) + trailing;
  }

  function translateTextNode(node, refreshOriginal) {
    if (!node || node.nodeType !== 3 || isIgnored(node)) return;
    if (refreshOriginal || !originalText.has(node)) originalText.set(node, node.nodeValue || '');
    var source = originalText.get(node) || '';
    var next = language === 'es' ? source : translatedValue(source);
    translatedText.set(node, next);
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  function rememberAttribute(element, name, refreshOriginal) {
    var map = originalAttributes.get(element);
    if (!map) {
      map = Object.create(null);
      originalAttributes.set(element, map);
    }
    if (refreshOriginal || !(name in map)) map[name] = element.getAttribute(name);
    return map;
  }

  function translateAttributes(element, refreshOriginal) {
    if (!element || element.nodeType !== 1 || isIgnored(element)) return;
    ['placeholder', 'title', 'aria-label', 'alt', 'data-empty', 'data-label', 'data-complete'].forEach(function (name) {
      if (!element.hasAttribute(name)) return;
      var map = rememberAttribute(element, name, refreshOriginal);
      var source = map[name];
      var next = language === 'es' ? source : translate(source);
      if (element.getAttribute(name) !== next) element.setAttribute(name, next);
    });
    if (element.matches('input[type="button"],input[type="submit"],input[type="reset"]') && element.hasAttribute('value')) {
      var values = rememberAttribute(element, 'value', refreshOriginal);
      var original = values.value;
      var value = language === 'es' ? original : translate(original);
      if (element.value !== value) element.value = value;
    }
    if (element.matches('meta[name="description"],meta[property^="og:"],meta[name^="twitter:"]') && element.hasAttribute('content')) {
      var contents = rememberAttribute(element, 'content', refreshOriginal);
      var originalContent = contents.content;
      var content = language === 'es' ? originalContent : translate(originalContent);
      if (element.content !== content) element.content = content;
    }
  }

  function translateTree(root, refreshOriginal) {
    if (!root) return;
    if (root.nodeType === 3) {
      translateTextNode(root, refreshOriginal);
      return;
    }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) translateAttributes(root, refreshOriginal);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var current;
    while ((current = walker.nextNode())) {
      if (current.nodeType === 3) translateTextNode(current, refreshOriginal);
      else translateAttributes(current, refreshOriginal);
    }
  }

  function observe() {
    if (!document.documentElement) return;
    if (observer) observer.disconnect();
    observer = new MutationObserver(function (mutations) {
      observer.disconnect();
      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData') translateTextNode(mutation.target, true);
        else if (mutation.type === 'attributes') translateAttributes(mutation.target, true);
        else mutation.addedNodes.forEach(function (node) { translateTree(node, true); });
      });
      observe();
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label', 'alt', 'data-empty', 'data-label', 'data-complete', 'value', 'content']
    });
  }

  function updateSwitches() {
    document.querySelectorAll('.uts-language-switch').forEach(function (switcher) {
      switcher.querySelectorAll('[data-language]').forEach(function (button) {
        var active = button.dataset.language === language;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      switcher.setAttribute('aria-label', language === 'en' ? 'Switch language' : 'Cambiar idioma');
    });
  }

  function createSwitch() {
    var switcher = document.createElement('div');
    switcher.className = 'uts-language-switch';
    switcher.dataset.i18nIgnore = 'true';
    switcher.setAttribute('role', 'group');
    switcher.innerHTML = '<span class="uts-language-globe" aria-hidden="true">◎</span>' +
      '<button type="button" data-language="es" aria-label="Usar español">ES</button>' +
      '<button type="button" data-language="en" aria-label="Use English">EN</button>';
    switcher.querySelectorAll('[data-language]').forEach(function (button) {
      button.addEventListener('click', function () {
        setLanguage(button.dataset.language);
      });
    });
    return switcher;
  }

  function ensureSwitch() {
    var nav = document.querySelector('.home-nav, body > nav, .unitalk-topbar');
    var switcher = document.querySelector('.uts-language-switch');
    var mobile = window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
    if (mobile && document.body) {
      if (!switcher) switcher = createSwitch();
      switcher.classList.add('uts-language-switch-standalone');
      if (switcher.parentNode !== document.body) document.body.appendChild(switcher);
      updateSwitches();
      return;
    }
    if (!nav) {
      if (!switcher && document.body) {
        switcher = createSwitch();
        switcher.classList.add('uts-language-switch-standalone');
        document.body.appendChild(switcher);
      }
      updateSwitches();
      return;
    }
    var slot = nav.querySelector('#home-account-slot, .uts-nav-account-slot, .nav-actions, .unitalk-top-actions') || nav;
    if (!switcher) {
      switcher = createSwitch();
    }
    switcher.classList.remove('uts-language-switch-standalone');
    if (switcher.parentNode !== slot) {
      slot.insertBefore(switcher, slot.firstChild);
    }
    updateSwitches();
  }

  function applyLanguage(nextLanguage) {
    language = SUPPORTED.indexOf(nextLanguage) >= 0 ? nextLanguage : DEFAULT_LANGUAGE;
    document.documentElement.lang = language === 'en' ? 'en' : 'es';
    document.documentElement.dataset.universeLanguage = language;
    if (observer) observer.disconnect();
    translateTree(document, false);
    ensureSwitch();
    updateSwitches();
    observe();
    window.dispatchEvent(new CustomEvent('universe:languagechange', { detail: { language: language } }));
  }

  function setLanguage(nextLanguage) {
    if (SUPPORTED.indexOf(nextLanguage) < 0) return Promise.resolve(language);
    try { localStorage.setItem(STORAGE_KEY, nextLanguage); } catch (_) {}
    if (nextLanguage === 'en') {
      return loadCatalog().then(function () {
        applyLanguage('en');
        return language;
      }).catch(function () {
        applyLanguage('es');
        return language;
      });
    }
    applyLanguage('es');
    return Promise.resolve(language);
  }

  function audit() {
    var unresolved = [];
    var spanishPattern = /[áéíóúñü¿¡]|\b(?:para|porque|selecciona|puntaje|promedio|carrera|examen|pregunta|respuesta|buscar|ingresantes|postulantes|soporte|cuenta|biblioteca|temario|simulacro|privacidad)\b/i;
    document.querySelectorAll('body *').forEach(function (element) {
      if (isIgnored(element) || element.children.length) return;
      var text = normalize(element.textContent);
      if (text && spanishPattern.test(text) && translate(text) === text) unresolved.push(text);
    });
    return Array.from(new Set(unresolved));
  }

  window.UniverseI18n = {
    setLanguage: setLanguage,
    getLanguage: function () { return language; },
    t: function (source) { return language === 'en' ? translate(source) : source; },
    refresh: function () { translateTree(document, true); updateSwitches(); },
    audit: audit
  };

  function start() {
    ensureSwitch();
    if (language === 'en') setLanguage('en');
    else applyLanguage('es');
    window.setTimeout(ensureSwitch, 300);
    window.setTimeout(ensureSwitch, 1200);
  }

  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY && SUPPORTED.indexOf(event.newValue) >= 0) setLanguage(event.newValue);
  });
  window.addEventListener('resize', ensureSwitch);
  window.addEventListener('orientationchange', ensureSwitch);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
