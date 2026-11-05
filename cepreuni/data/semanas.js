/* UNIverse · CEPREUNI · semanas y temas.
   Contrato (solo se agregan campos, nunca se renombran):
   window.UNIVERSE_CEPREUNI_WEEKS = {
     cycles: { pre|basico|ien: { weeks: [[inicio, fin] x 20] (fechas ISO, lunes a sábado, hora de Lima),
                                 days:  { 'AAAA-MM-DD': { k: 'off' | 'virtual' | 'rec', t: texto } } } },
     silabo: { pre: { alg|ari|geo|tri|fis|qui: [20 x [temas]], hum: { lit|fil|rv|len|ing|his|eco|geo|psi: [20 x texto] } } }
   }
   Fuentes: cronogramas CEPREUNI 2027-1 (Pre, Básico) y Cronograma IEN 2027 para las fechas; los temas vienen del sílabo
   de la Guía del estudiante CEPREUNI 2026-2 y sirven de referencia para 2027-1 (la semana N usa los temas de la semana N). */
window.UNIVERSE_CEPREUNI_WEEKS = (function () {
  var preWeeks = [
    ['2026-08-31', '2026-09-05'], ['2026-09-07', '2026-09-12'], ['2026-09-14', '2026-09-19'], ['2026-09-21', '2026-09-26'],
    ['2026-09-28', '2026-10-03'], ['2026-10-05', '2026-10-10'], ['2026-10-12', '2026-10-17'], ['2026-10-19', '2026-10-24'],
    ['2026-10-26', '2026-10-31'], ['2026-11-02', '2026-11-07'], ['2026-11-09', '2026-11-14'], ['2026-11-16', '2026-11-21'],
    ['2026-11-23', '2026-11-28'], ['2026-11-30', '2026-12-05'], ['2026-12-07', '2026-12-12'], ['2026-12-14', '2026-12-19'],
    ['2027-01-04', '2027-01-09'], ['2027-01-11', '2027-01-16'], ['2027-01-18', '2027-01-23'], ['2027-01-25', '2027-01-30']
  ];
  var preDays = {
    '2026-10-03': { k: 'virtual', t: 'Clase virtual por las elecciones municipales del domingo 4 de octubre.' },
    '2026-10-08': { k: 'off', t: 'No se dicta clase. Se recupera el lunes 21 de diciembre.' },
    '2026-12-08': { k: 'off', t: 'No se dicta clase. Se recupera el martes 22 de diciembre.' },
    '2026-12-09': { k: 'off', t: 'No se dicta clase. Se recupera el miércoles 23 de diciembre.' },
    '2026-12-21': { k: 'rec', t: 'Recuperación de la clase del jueves 8 de octubre.' },
    '2026-12-22': { k: 'rec', t: 'Recuperación de la clase del martes 8 de diciembre.' },
    '2026-12-23': { k: 'rec', t: 'Recuperación de la clase del miércoles 9 de diciembre.' }
  };
  return {
    version: '2026-11-05',
    cycles: {
      pre: { weeks: preWeeks, days: preDays },
      basico: { weeks: preWeeks, days: preDays },
      ien: {
        weeks: [
          ['2026-07-06', '2026-07-11'], ['2026-07-13', '2026-07-18'], ['2026-07-20', '2026-07-25'], ['2026-08-03', '2026-08-08'],
          ['2026-08-10', '2026-08-15'], ['2026-08-17', '2026-08-22'], ['2026-08-24', '2026-08-29'], ['2026-08-31', '2026-09-05'],
          ['2026-09-07', '2026-09-12'], ['2026-09-14', '2026-09-19'], ['2026-09-21', '2026-09-26'], ['2026-09-28', '2026-10-03'],
          ['2026-10-05', '2026-10-10'], ['2026-10-12', '2026-10-17'], ['2026-10-19', '2026-10-24'], ['2026-10-26', '2026-10-31'],
          ['2026-11-02', '2026-11-07'], ['2026-11-09', '2026-11-14'], ['2026-11-16', '2026-11-21'], ['2026-11-23', '2026-11-28']
        ],
        days: {
          '2026-07-23': { k: 'virtual', t: 'Clase virtual por feriado.' },
          '2026-08-06': { k: 'virtual', t: 'Clase virtual por feriado.' },
          '2026-10-08': { k: 'virtual', t: 'Clase virtual por feriado.' }
        }
      }
    },
    silabo: {
      pre: {
        fis: [
          ['Unidades y análisis dimensional', 'Vectores', 'Funciones y gráficas'],
          ['Cinemática en una dimensión: MRU, MRUV, caída libre'],
          ['Cinemática en dos dimensiones: proyectiles', 'Movimiento circular'],
          ['Leyes de Newton: estática', 'Fuerzas, fricción y diagrama de cuerpo libre'],
          ['Equilibrio de cuerpo rígido y torque', 'Leyes de Newton: dinámica'],
          ['Gravitación universal', 'Trabajo y energía'],
          ['Conservación de la energía y potencia', 'Impulso y cantidad de movimiento'],
          ['Choques y centro de masa', 'Oscilaciones: MAS'],
          ['Péndulo simple', 'Ondas mecánicas'],
          ['Ondas sonoras', 'Fluidos: presión, Pascal, Arquímedes'],
          ['Temperatura y calor', 'Calorimetría y cambios de fase'],
          ['Transferencia de calor', 'Termodinámica: gases ideales'],
          ['Primera y segunda ley de la termodinámica', 'Electrostática: Coulomb y campo eléctrico'],
          ['Potencial eléctrico', 'Condensadores'],
          ['Energía de un condensador', 'Corriente eléctrica y ley de Ohm'],
          ['Circuitos de corriente continua', 'Leyes de Kirchhoff y efecto Joule'],
          ['Electromagnetismo: campo y fuerza magnética'],
          ['Inducción electromagnética', 'Ondas electromagnéticas'],
          ['Óptica geométrica: espejos y lentes'],
          ['Física moderna: Planck y efecto fotoeléctrico']
        ],
        qui: [
          ['Materia y estructura atómica', 'Modelos atómicos'],
          ['Números cuánticos', 'Configuración electrónica'],
          ['Tabla periódica y propiedades periódicas'],
          ['Sin sesión en la guía de referencia'],
          ['Enlace químico: iónico y covalente'],
          ['Hibridación y geometría molecular', 'Fuerzas intermoleculares'],
          ['Nomenclatura inorgánica'],
          ['Estequiometría: mol y reacciones químicas'],
          ['Balance de ecuaciones y leyes ponderales', 'Fórmula empírica y molecular'],
          ['Reactivo limitante y rendimiento', 'Estados de agregación', 'Estado gaseoso'],
          ['Leyes de los gases ideales', 'Mezcla de gases'],
          ['Estado líquido y sólido', 'Soluciones y coloides'],
          ['Concentración de soluciones', 'Equilibrio químico'],
          ['Equilibrio químico: Kc, Kp y Le Chatelier'],
          ['Ácidos y bases: pH', 'Electroquímica: celdas galvánicas'],
          ['Electrólisis', 'Química orgánica: el carbono y las cadenas'],
          ['Hidrocarburos y grupos funcionales'],
          ['Nomenclatura orgánica', 'Petróleo y combustión', 'Ecología'],
          ['Contaminación ambiental'],
          ['Química aplicada: nanotecnología y materiales modernos']
        ],
        ari: [
          ['Razones y proporciones', 'Magnitudes proporcionales'],
          ['Regla de tres', 'Reparto proporcional'],
          ['Tanto por cuanto y aplicaciones comerciales'],
          ['Interés simple y compuesto'],
          ['Descuento y letras de cambio'],
          ['Mezcla y aleación'],
          ['Estadística: tablas y gráficos'],
          ['Medidas de tendencia central'],
          ['Medidas de dispersión', 'Análisis combinatorio'],
          ['Conteo avanzado', 'Probabilidad'],
          ['Modelos aleatorios discretos', 'Sistemas de numeración'],
          ['Conteo de números y cifras', 'Adición'],
          ['Sustracción y multiplicación', 'División'],
          ['Divisibilidad'],
          ['Criterios de divisibilidad y ecuaciones diofánticas', 'Números primos'],
          ['Divisores de un número', 'Función de Euler'],
          ['MCD y MCM'],
          ['Números racionales e irracionales'],
          ['Fracciones y decimales', 'Potenciación'],
          ['Razonamiento matemático: problemas diversos', 'Radicación']
        ],
        alg: [
          ['Lógica proposicional'],
          ['Equivalencia lógica', 'Conjuntos', 'Números reales'],
          ['Conjuntos acotados', 'Operaciones binarias'],
          ['Ecuaciones de primer y segundo grado', 'Inecuaciones'],
          ['Radicales y valor absoluto', 'Polinomios'],
          ['Operaciones con polinomios: Horner y Ruffini'],
          ['Teorema del resto y cocientes notables', 'Factorización', 'MCD y MCM de polinomios'],
          ['Funciones: dominio, rango y gráficas', 'Tipos de funciones'],
          ['Operaciones y composición de funciones', 'Técnicas de graficación'],
          ['Función inversa'],
          ['Funciones polinomiales', 'Exponencial y logaritmo'],
          ['Números complejos'],
          ['Forma polar y raíces de complejos', 'Matrices'],
          ['Determinantes', 'Matriz inversa y adjunta'],
          ['Sistemas de ecuaciones lineales', 'Regla de Cramer'],
          ['Método de Gauss y Rouché-Frobenius', 'Sistemas no lineales'],
          ['Programación lineal'],
          ['Optimización: método gráfico', 'Juegos lógicos', 'Sucesiones'],
          ['Límite de sucesiones', 'Sucesión de Fibonacci'],
          ['Series y convergencia', 'Progresiones y binomio de Newton']
        ],
        geo: [
          ['Nociones básicas', 'Ángulos', 'Triángulos'],
          ['Congruencia de triángulos', 'Bisectriz y base media'],
          ['Polígonos', 'Cuadriláteros'],
          ['Circunferencia'],
          ['Ángulos en la circunferencia', 'Proporcionalidad'],
          ['Semejanza de triángulos', 'Puntos notables'],
          ['Recta y circunferencia de Euler', 'Relaciones métricas en el triángulo'],
          ['Relaciones métricas en la circunferencia', 'Polígonos regulares'],
          ['Polígonos regulares notables', 'Número áureo', 'Simetría en el plano'],
          ['Longitud de la circunferencia', 'Áreas de regiones poligonales'],
          ['Relación de áreas triangulares', 'Áreas cuadrangulares'],
          ['Áreas circulares', 'Geometría en el espacio'],
          ['Rectas cruzadas y recta-plano', 'Ángulo diedro'],
          ['Ángulos poliedros y triedro', 'Poliedros'],
          ['Poliedros regulares', 'Simetría en el espacio'],
          ['Prisma', 'Tronco de prisma'],
          ['Pirámide', 'Tronco de pirámide'],
          ['Cilindro', 'Tronco de cilindro'],
          ['Cono', 'Superficie esférica'],
          ['Esfera', 'Conteo de figuras']
        ],
        tri: [
          ['Ángulo trigonométrico', 'Razones trigonométricas de ángulos agudos'],
          ['Triángulos rectángulos y ángulos verticales', 'Longitud de arco y sector circular'],
          ['Aplicaciones de longitud de arco', 'Introducción a la geometría analítica'],
          ['La recta y sus ecuaciones', 'Razones de ángulos de cualquier magnitud'],
          ['Reducción al primer cuadrante', 'Circunferencia trigonométrica I'],
          ['Circunferencia trigonométrica II', 'Identidades de arco simple'],
          ['Identidades de arcos compuestos, doble y mitad'],
          ['Arco triple', 'Transformaciones trigonométricas'],
          ['Series y sumatorias trigonométricas', 'Funciones trigonométricas I'],
          ['Funciones trigonométricas II y III'],
          ['Teoría de periodos', 'Funciones inversas I'],
          ['Funciones inversas II', 'Propiedades de las funciones'],
          ['Ecuaciones trigonométricas', 'Sistemas e inecuaciones'],
          ['Resolución de triángulos', 'Ángulos horizontales'],
          ['Área de regiones triangulares'],
          ['Fórmulas trigonométricas para triángulos'],
          ['Lugar geométrico: circunferencia', 'Parábola'],
          ['Elipse', 'Hipérbola'],
          ['Tangente a una cónica', 'Traslación y rotación de ejes'],
          ['Coordenadas polares', 'Números complejos']
        ],
        hum: {
          lit: ['Teoría literaria y figuras', 'Épica griega: Homero', 'Tragedia griega', 'Literatura medieval y Renacimiento', 'Realismo: Flaubert y Dostoievski', 'Narrativa contemporánea: Kafka', 'Poesía del Siglo de Oro español', 'Teatro del Siglo de Oro: Lope de Vega', 'Calderón de la Barca', 'Nueva narrativa latinoamericana: Borges y Rulfo', 'García Márquez', 'Poesía hispanoamericana: Neruda y Paz', 'Literatura peruana colonial: crónicas', 'Costumbrismo peruano', 'Romanticismo', 'Posmodernismo y colónida', 'Vanguardia: Vallejo y Mariátegui', 'Indigenismo: Ciro Alegría', 'Narrativa peruana: Vargas Llosa', 'Repaso'],
          fil: ['Introducción a la filosofía', 'Presocráticos', 'Sócrates y Platón', 'Aristóteles y periodo helenístico', 'Renacimiento y racionalismo', 'La Ilustración', 'Kant y Hegel', 'Comte y Marx', 'Nietzsche y existencialismo', 'Filosofía analítica', 'Axiología: los valores', 'Ética: teorías éticas', 'Ética contemporánea', 'Gnoseología', 'Epistemología', 'Lógica I: proposiciones', 'Lógica II: principios lógicos', 'Lógica III: silogismo', 'Repaso 1', 'Repaso 2'],
          rv: ['Definiciones', 'Analogías', 'Precisión léxica', 'Antónimos', 'Conectores', 'Información eliminada', 'Plan de redacción', 'Progresión temática', 'Cohesión textual', 'Niveles de lectura', 'Tema central e idea principal', 'Textos continuos', 'Textos discontinuos', 'Mapas conceptuales', 'El resumen', 'Sentido contextual', 'Inferencia', 'Compatibilidad e incompatibilidad', 'Extrapolación', 'Texto filosófico y científico'],
          len: ['Lengua, habla y mayúsculas', 'Mayúsculas II', 'La sílaba y el hiato', 'Tilde diacrítica', 'Grafías y prefijos', 'Género y número del sustantivo', 'Determinantes', 'Semántica: polisemia y homonimia', 'Repaso I', 'Frase nominal y concordancia', 'El verbo y su conjugación', 'Formas no personales del verbo', 'Preposiciones', 'La oración simple', 'Predicado y concordancia verbal', 'Signos de puntuación', 'Oración compuesta I', 'Repaso II', 'Subordinada sustantiva', 'Subordinada adjetiva'],
          ing: ['Possessive adjectives', 'Greetings and subject pronouns', 'Possessive ’s', 'Possessive pronouns', 'Prepositions of time', 'Asking for directions', 'Prepositions of movement', 'Would like', 'Countable and uncountable nouns', 'Adverbs', 'Comparatives and superlatives', 'Ever, never, yet, just, already', 'Present perfect vs simple past', 'Phrasal verbs II', 'Past perfect', 'First conditional', 'Second and third conditionals', 'Mixed conditional II', 'Repaso 1', 'Repaso 2'],
          his: ['Prehistoria', 'Poblamiento americano y peruano', 'Edad Antigua I: Mesopotamia y Egipto', 'Altas culturas andinas I', 'Edad Antigua II: Grecia y Roma', 'Altas culturas andinas II', 'Edad Media', 'Tahuantinsuyo', 'Humanismo y Renacimiento', 'Perú colonial: la conquista', 'Revoluciones burguesas del siglo XVIII', 'Rebeliones indígenas e Ilustración', 'Revoluciones industriales e imperialismo', 'Perú republicano del siglo XIX', 'Revolución rusa y Segunda Guerra Mundial', 'Reconstrucción nacional y República Aristocrática', 'Descolonización y revolución china', 'Perú de 1930 a 1980', 'Crisis de la URSS y guerra de los Balcanes', 'Perú de 1980 a 1992'],
          eco: ['Concepto de economía', 'Doctrinas económicas I', 'Doctrinas económicas II', 'Necesidades, bienes y servicios', 'Producción y sectores', 'Demanda y oferta', 'Equilibrio y control de precios', 'Teoría de la empresa', 'Modelos de mercado', 'Dinero e inflación', 'Sistema financiero', 'Sector público y tributos', 'Rol del Estado', 'Producto bruto interno', 'Desarrollo sostenible y pobreza', 'Comercio internacional', 'Balanza de pagos', 'Organismos y globalización', 'Repaso 1', 'Repaso 2'],
          geo: ['Objeto de la geografía y coordenadas', 'Cartografía', 'Organización política y fronteras', 'Integración regional', 'Censos y demografía', 'Descentralización', 'Planificación concertada', 'Defensa civil y seguridad ciudadana', 'Violencia, corrupción y pobreza', 'Desastres naturales y contaminación', 'Áreas protegidas', 'Geomorfología del Perú', 'El mar peruano', 'Hidrografía', 'Regiones naturales', 'Ecorregiones', 'Actividades extractivas', 'Actividades transformativas y distributivas', 'Repaso 1', 'Repaso 2'],
          psi: ['La psicología y sus métodos', 'Historia y escuelas', 'Psicoanálisis', 'Factores biológicos I: la neurona', 'Factores biológicos II: sistema nervioso', 'Conciencia y atención', 'Sensación', 'Percepción', 'Memoria', 'Pensamiento y lenguaje', 'Imaginación y creatividad', 'Afectividad, motivación y voluntad', 'Inteligencia', 'Aprendizaje', 'Personalidad', 'Socialización', 'Sexualidad', 'Salud psicológica', 'Repaso 1', 'Repaso 2']
        }
      }
    }
  };
})();
