// Admisión UNI 2026-2 · Primera prueba: Aptitud Académica y Humanidades.
// Transcripción pregunta por pregunta del cuadernillo del examen. Las fórmulas van en TeX (KaTeX), las
// figuras son recortes del cuadernillo y las tablas se reescriben en HTML. La figura de la pregunta 1 se
// redibuja en SVG porque el escaneo tenía un trazo de lápiz sobre una cifra. La clave está codificada
// para que no se lea a simple vista.
const R = String.raw;
const vf = 'Marque la alternativa que contenga la secuencia correcta.';
const suf = ['la información I por sí sola es suficiente.', 'la información II por sí sola es suficiente.', 'son necesarias ambas informaciones.', 'cada información por separado es suficiente.', 'las informaciones dadas son insuficientes.'];
const romans = ['I', 'II', 'III', 'IV', 'V'];
const antonym = 'Elija el término que, al sustituir la palabra subrayada, exprese el significado opuesto de la oración.';
const connector = 'Elija la alternativa que, al insertarse en los espacios en blanco, una adecuadamente las ideas del texto.';
const definition = 'Elija la palabra que se defina con la premisa planteada.';
const inclusion = 'Elija la oración que, al insertarse en el espacio en blanco, complete de manera lógica la información global del texto.';
const lexical = 'Elija el término que, al sustituir la palabra subrayada, resulte el más adecuado para el contexto planteado.';
const blank = '<span class="uexam__blank"></span>';

// Pregunta 1: los operadores anidados. Los valores son los del cuadernillo (la cifra tapada por el lápiz
// es 2, la única que hace coincidir la figura con alguna alternativa).
const opFigure = `<svg viewBox="0 0 460 312" role="img" aria-label="E igual a un cuadrado grande que contiene cuatro operadores: arriba a la izquierda un triángulo con 2, 1 y un triángulo interior con 3, 1 y 5; arriba a la derecha un cuadrado con 1, 4, 2 y un cuadrado interior con 7, 6, 3 y 5; abajo a la izquierda un cuadrado con un triángulo interior de 2, 1 y 3, y los números 2, 6 y 4; abajo a la derecha un triángulo con 2, 3 y un cuadrado interior con 1, 2, 4 y 3." font-family="'Times New Roman',Times,serif" fill="none" stroke="#111" stroke-width="2">
<text x="8" y="166" font-size="24" fill="#111" stroke="none">E =</text>
<rect x="60" y="8" width="392" height="298"/>
<polygon points="72,150 165,22 258,150"/><polygon points="190,148 214,108 238,148" stroke-width="1.5"/>
<rect x="272" y="22" width="166" height="128"/><rect x="386" y="104" width="46" height="42" stroke-width="1.5"/>
<rect x="72" y="165" width="178" height="133"/><polygon points="80,214 104,172 128,214" stroke-width="1.5"/>
<polygon points="265,298 355,168 445,298"/><rect x="379" y="260" width="40" height="36" stroke-width="1.5"/>
<g fill="#111" stroke="none" font-size="18" text-anchor="middle">
<text x="165" y="60">2</text><text x="92" y="142">1</text>
<text x="284" y="44">1</text><text x="424" y="44">4</text><text x="284" y="142">2</text>
<text x="238" y="190">2</text><text x="86" y="290">6</text><text x="236" y="290">4</text>
<text x="355" y="204">2</text><text x="287" y="290">3</text>
</g>
<g fill="#111" stroke="none" font-size="13" text-anchor="middle">
<text x="214" y="129">3</text><text x="201" y="145">1</text><text x="228" y="145">5</text>
<text x="398" y="121">7</text><text x="420" y="121">6</text><text x="398" y="141">3</text><text x="420" y="141">5</text>
<text x="104" y="195">2</text><text x="92" y="210">1</text><text x="116" y="210">3</text>
<text x="390" y="276">1</text><text x="408" y="276">2</text><text x="390" y="292">4</text><text x="408" y="292">3</text>
</g></svg>`;

const sq = inner => `<span class="uexam__sq">${inner}</span>`;
const ci = inner => `<span class="uexam__ci">${inner}</span>`;

export default {
  id: 'aptitud-humanidades',
  sections: [
    ['Razonamiento matemático', 1, 32], ['Actualidad', 33, 38],
    ['Analogías', 39, 40, 'Razonamiento verbal'], ['Antonimia contextual', 41, 43, 'Razonamiento verbal'],
    ['Coherencia y cohesión textual', 44, 47, 'Razonamiento verbal'], ['Comprensión de lectura', 48, 50, 'Razonamiento verbal'],
    ['Comunicación y lengua', 51, 54], ['Conectores lógico-textuales', 55, 57, 'Razonamiento verbal'],
    ['Definiciones', 58, 61, 'Razonamiento verbal'], ['Economía', 62, 65], ['Filosofía', 66, 68],
    ['Geografía y desarrollo nacional', 69, 71], ['Historia del Perú y del mundo', 72, 75],
    ['Inclusión de enunciado', 76, 78, 'Razonamiento verbal'], ['Información eliminada', 79, 81, 'Razonamiento verbal'],
    ['Inglés', 82, 84], ['Literatura', 85, 87], ['Lógica', 88, 90],
    ['Plan de redacción', 91, 94, 'Razonamiento verbal'], ['Precisión léxica en contexto', 95, 97, 'Razonamiento verbal'],
    ['Psicología', 98, 100]
  ],
  figures: {h01a: [822, 217], h03q: [994, 251], h03o: [971, 480], h07: [586, 439], h13: [634, 717], h14: [935, 426], h18: [977, 434], h19: [977, 641], h24: [924, 283], h27: [893, 493], h29: [399, 399], h30: [945, 546]},
  svgs: {h01b: opFigure},
  key: 'QUREQkVEQ0VFRUFFQ0RFQkFCRUFCQUJFREVFREJBQkRCRUJBQ0NDRUFBREJDQkJFQUVBQkNEQkJDQUFDQ0VDQUNBQkRCQ0RFREJEQ0FCREJDQkNDQ0FEREFBQ0JFQ0NDREVERQ==',
  questions: [
    // ─── Razonamiento matemático ───
    {
      q: `Sean los operadores matemáticos definidos mediante:
        [[fig:h01a]]
        Halle el valor de
        [[svg:h01b]]`,
      o: ['78', '86', '102', '120', '136']
    },
    {
      q: R`Si la siguiente proposición es falsa:
        \[((p\wedge q)\to(r\wedge s))\vee(r\to s)\]
        Indique la veracidad (V) o falsedad (F) de las siguientes proposiciones:`,
      items: [R`\((\sim p\leftrightarrow q)\leftrightarrow(r\leftrightarrow s)\)`, R`\((p\vee q)\wedge(r\vee s)\)`, R`\((p\to q)\to(r\to s)\)`],
      after: vf,
      o: ['FFF', 'FVF', 'VFF', 'VVF', 'VVV']
    },
    {
      q: `Determine la figura que continúa la secuencia.
        [[fig:h03q]]`,
      ofig: 'h03o'
    },
    {
      q: 'Al realizar dos encuestas sobre el próximo campeón del mundo en fútbol: en la primera encuesta se consideró solo los países de Brasil y España, de ello se obtuvo que el 35&nbsp;% opinó que el campeón sería España. En la segunda encuesta, se consideró solo los países de Brasil, España y Alemania, de ello resultó que el 40&nbsp;% opinó que el campeón sería Alemania. Por consiguiente, las proporciones entre los participantes que dan como campeón a Brasil y España coinciden con la proporción de los resultados de la primera encuesta, ¿qué porcentaje opina, en la segunda encuesta, que Brasil campeonará?',
      o: ['30', '35', '37', '39', '41']
    },
    {
      q: R`Se define el operador matemático \(\varphi\) para \(a,b\) reales no negativos mediante
        \[a\,\varphi\,b=\sqrt{\frac{a+b}{2}}\]
        Calcule el valor \(E=(2\,\varphi\,6)\,\varphi\,(32\,\varphi\,40)\)`,
      o: ['0', '1', '2', '3', '4']
    },
    {
      q: 'Se afirma lo siguiente:',
      items: ['Muchas manzanas son dulces.', 'Todo dulce es agradable.'],
      after: 'Entonces, indique la proposición correcta.',
      o: ['Ninguna manzana es dulce.', 'Ninguna manzana es agradable.', 'Algunas manzanas son agradables.', 'Toda manzana es agradable.', 'Muchas manzanas no son agradables.']
    },
    {
      q: R`Se desea calcular el área de la región triangular \(ABC\) mostrada a continuación:
        [[fig:h07]]
        Información brindada:`,
      items: [R`\(\alpha=60^\circ\)`, R`\(\overline{BH}=\sqrt{3}\,\mu\)`],
      after: 'Para resolver el problema',
      o: suf
    },
    {
      q: 'Cien alumnos del CEPRE-UNI rindieron un Simulacro de Aptitud Académica que comprende Razonamiento Matemático (RM) y Razonamiento Verbal (RV). Se desea saber cuántos alumnos respondieron las preguntas de RM.<br>Información brindada:',
      items: ['Los que respondieron: solamente RM o solamente RV son 70 alumnos.', 'Todos los alumnos respondieron RM o RV.'],
      after: 'Para resolver el problema',
      o: ['la información I sola es suficiente.', 'la información II sola es suficiente.', 'es necesario utilizar ambas informaciones.', 'cada información por separado es suficiente.', 'las informaciones dadas son insuficientes.']
    },
    {
      q: R`Un número natural \(n\) es un <strong>número perfecto</strong>, si la suma de sus divisores positivos y propios de \(n\) es igual a \(n\). Por ejemplo, 6 es el menor número perfecto.<br>Si la calificación de este examen es de 0 a 20, calcule la nota que usted obtendrá, sabiendo que es la mitad de un número perfecto de dos cifras.`,
      o: ['12', '14', '16', '18', '20']
    },
    {
      q: 'En una prueba de entrada, la puntuación de las preguntas se da de la siguiente manera: 4 puntos por cada pregunta bien contestada, −1 punto por cada pregunta mal contestada y ningún punto por pregunta no respondida. Si Mateo responde todas las 75 preguntas de la prueba y obtiene 125 de nota, entonces ¿cuántas preguntas respondió correctamente?',
      o: ['30', '35', '40', '45', '50']
    },
    {
      q: `Cuatro estudiantes: Armando (A), Braulio (B), Carmen (C) y Doris (D) presentan en este momento distintas edades y se decide comparar estas edades con la relación “menor que”, según la siguiente tabla de valores veritativos.
        <div class="uexam__tablewrap"><table class="uexam__truth"><thead><tr><th><span>→</span>menor que</th><th>A</th><th>B</th><th>C</th><th>D</th></tr></thead>
        <tbody><tr><th>A</th><td>F</td><td>F</td><td>V</td><td>V</td></tr><tr><th>B</th><td>V</td><td>F</td><td>V</td><td>V</td></tr><tr><th>C</th><td>F</td><td>F</td><td>F</td><td>F</td></tr><tr><th>D</th><td>F</td><td>F</td><td>V</td><td>F</td></tr></tbody></table></div>
        Por ejemplo, A → B quiere decir que A&lt;B es falso (F). Determine el orden de las edades de menor a mayor.`,
      o: ['BADC', 'DABC', 'DCBA', 'DBCA', 'ADBC']
    },
    {
      q: `Si los operadores matemáticos <span class="uexam__sq uexam__sq--mini"></span> y <span class="uexam__ci uexam__ci--mini"></span> satisfacen
        <span class="uexam__opline">${sq(ci('<i>x</i> − 2'))} = 4<i>x</i> + 5</span>
        donde
        <span class="uexam__opline">${sq('<i>x</i> + 1')} = 2<i>x</i> + 3</span>
        calcule el valor de
        <span class="uexam__opline">${sq(ci(sq('8')))}</span>`,
      o: ['81', '82', '83', '84', '85']
    },
    {
      q: `Sobre una evaluación en un salón de clases, se realiza la siguiente tabla del número de preguntas contestadas vs el número de alumnos que rindieron la prueba.
        [[fig:h13]]
        Indique la veracidad (V) o falsedad (F) de las siguientes proposiciones:`,
      items: ['El porcentaje de alumnos que contestaron 10 o menos preguntas es 15&nbsp;%.', 'El número de alumnos que contestaron, por lo menos, 25 preguntas es 14.', 'Solo un alumno contestó 38 preguntas.'],
      after: vf,
      o: ['VFV', 'FVF', 'VVF', 'VFF', 'FFF']
    },
    {
      q: 'Indique la figura discordante.',
      ofig: 'h14'
    },
    {
      q: 'Se desea calcular el área de la región triangular de un triángulo rectángulo.<br>Información brindada:',
      items: ['Las medidas de los catetos', 'La medida de la hipotenusa'],
      after: 'Para resolver el problema',
      o: suf
    },
    {
      q: R`Sean los operadores matemáticos \(\triangle\) y \(\nabla\) definidos mediante:
        \[\begin{aligned}\triangle\left(ax^2+bx+c\right)&=2ax+b\\ \nabla\left(ax^2+bx+c\right)&=\frac{1}{3}ax^3+\frac{1}{2}bx^2+cx\end{aligned}\]
        Calcule la suma de los coeficientes del polinomio resultante al reducir:
        \[x\,\triangle\!\left(\frac{\nabla\left(x\,\triangle\!\left(\frac{\nabla P(x)}{x}\right)\right)}{x}\right)\]
        Siendo \(P(x)=729x^2-512x+8\)`,
      o: ['112', '156', '196', '216', '486']
    },
    {
      q: 'En una tienda, un abrigo está con el 40&nbsp;% de descuento y una camisa está con el 30&nbsp;% de descuento. Si se paga con la tarjeta de la tienda, se obtiene además un descuento del 10&nbsp;% sobre la compra final. ¿Cuánto cuesta el abrigo si se compran ambas prendas?<br>Información brindada:',
      items: ['El descuento final, si se paga con la tarjeta de la tienda, es de 374,25 soles.', 'Sin ningún descuento, el abrigo cuesta tanto como lo que se paga por dos camisas, pero sin la tarjeta de la tienda.'],
      after: 'Para resolver el problema',
      o: ['la información I es suficiente.', 'la información II es suficiente.', 'es necesario usar ambas informaciones.', 'cada una por separado es suficiente.', 'las informaciones dadas son insuficientes.']
    },
    {
      q: 'Indique la figura discordante.',
      ofig: 'h18'
    },
    {
      q: `El diagrama muestra la cantidad de frutas que consume un grupo de alumnos a la semana.
        [[fig:h19]]
        Indique la veracidad (V) o falsedad (F) de las siguientes proposiciones:`,
      items: ['El número de alumnos que consume menos de 2 frutas es 21.', 'El número total de frutas que consumen a la semana es 227.', 'Los alumnos que consumen por lo menos 5 frutas semanales, en total consumen más del 50&nbsp;% del total de frutas.'],
      after: vf,
      o: ['VVF', 'VVV', 'VFV', 'FVV', 'FFV']
    },
    {
      q: R`Dadas las proposiciones lógicas \(p,q,r\) y \(t\). Si se sabe que \((\sim p\wedge q)\to(r\vee\sim t)\) es falsa, determine el valor de verdad de \(p,q,r\) y \(t\), en ese orden.`,
      o: ['FVFF', 'VVFF', 'FVFV', 'FVVF', 'VFVF']
    },
    {
      q: 'Un hombre, 3 mujeres y 4 niños pueden hacer un trabajo en 96 horas; a su vez, 2 hombres y 8 niños pueden realizar el mismo trabajo en 80 horas y, por otro lado, 2 hombres y 3 mujeres pueden hacerlo en 120 horas. Usando estas relaciones, ¿en cuánto tiempo, en horas, 5 hombres y 22 niños podrían hacer dicho trabajo?',
      o: ['28', '30', '32', '35', '40']
    },
    {
      q: R`Si \(a,b\) y \(c\) son reales positivos, distintos de la unidad, que satisfacen la condición
        \[\frac{a}{1-a}+\frac{b}{1-b}+\frac{c}{1-c}=1,\]
        determine el valor de
        \[\frac{1}{1-a}+\frac{1}{1-b}+\frac{1}{1-c}.\]`,
      o: ['1', '2', '3', '4', '5']
    },
    {
      q: 'Considerando el alfabeto español, determine la letra que continúa en la siguiente sucesión:<span class="uexam__seq">B, C, D, R, Q, P, L, M, N, T, S, ?</span>',
      o: ['U', 'R', 'O', 'W', 'V']
    },
    {
      q: 'De las figuras, señale aquella que no guarda ninguna relación con las demás.',
      ofig: 'h24'
    },
    {
      q: R`En un cuadrado mágico, la suma de elementos de cada fila, cada columna y cada diagonal son iguales. En el siguiente cuadrado mágico mostrado.
        <div class="uexam__tablewrap"><table class="uexam__magic"><tbody>
        <tr><td>0</td><td>20</td><td><i>a</i></td></tr><tr><td><i>c</i></td><td>4</td><td></td></tr><tr><td></td><td>−12</td><td><i>b</i></td></tr>
        </tbody></table></div>
        Calcule el valor de \(a\cdot b\cdot c\)`,
      o: ['128', '168', '256', '336', '448']
    },
    {
      q: R`En la siguiente secuencia de números naturales, calcule el valor de \(x+y\)
        <span class="uexam__seq">3, 8, 10, 15, 17, 22, 24, <i>x</i>, <i>y</i></span>`,
      o: ['35', '40', '50', '60', '70']
    },
    {
      q: `En los gráficos se muestran las decisiones de las juntas de acreedores de 500 empresas con deudas pendientes de pago.
        [[fig:h27]]
        Para las empresas reestructuradas, ¿cuántos lograron la aprobación de los convenios de saneamiento?`,
      o: ['35', '38', '40', '41', '43']
    },
    {
      q: 'Determine el elemento que complete la sucesión de letras del alfabeto español:<span class="uexam__seq">YX1, UTS1, OÑNM2, …</span>',
      o: ['FEDCB3', 'FEDCB2', 'EDCBA3', 'HGFED3', 'FECBA2']
    },
    {
      q: `Calcule la cantidad máxima de cuadrados que se pueden observar en la figura.
        [[fig:h29]]`,
      o: ['20', '22', '25', '28', '30']
    },
    {
      q: `El gráfico muestra las edades de los estudiantes ingresantes a la carrera de INGENIERÍA CIVIL para el año 2017-2.
        [[fig:h30]]
        Indique la veracidad (V) o falsedad (F) de las siguientes proposiciones:`,
      items: ['El 40&nbsp;% de los ingresantes tiene la edad de 18 años.', 'La muestra corresponde a 80 estudiantes de Ingeniería Civil.', 'El 90&nbsp;% de los estudiantes son mayores de edad (mayores o iguales a 18 años).', 'El diagrama de barras muestra la variable edad y la frecuencia relativa.'],
      after: vf,
      o: ['VVVF', 'VVFV', 'FVFV', 'VVFF', 'FVFF']
    },
    {
      q: 'En una progresión geométrica de números naturales, el segundo término es 6 y el cuarto es 54, calcule el sexto término de dicha progresión.',
      o: ['460', '476', '486', '490', '500']
    },
    {
      q: 'El precio de lista de un artículo asciende a <i>S/</i>480. Si el vendedor permite un descuento de 10&nbsp;% sobre dicho precio, ganaría 8&nbsp;% del precio de costo. Calcule el porcentaje de ganancia, respecto del precio de costo si se decide no hacer ningún descuento.',
      o: ['15', '20', '25', '28', '30']
    },

    // ─── Actualidad ───
    {
      q: 'Ante la inminente presencia del fenómeno El Niño, el ministro de Defensa del Perú señaló que una de las medidas para afrontar este problema natural es',
      o: ['mejorar la arquitectura de las viviendas.', 'establecer protocolos de salubridad.', 'invertir en alumbrado público.', 'descolmatar los ríos más vulnerables.', 'implementar penas más severas por corrupción.']
    },
    {
      q: '¿En qué país se está desarrollando el XXXVIII Campeonato Europeo de Natación?',
      o: ['España', 'Francia', 'Italia', 'Rusia', 'Alemania']
    },
    {
      q: 'De la siguiente afirmación: En julio, ocurrió el ingreso abrupto de 50 mil marroquíes a Ceuta, ciudad española en el continente africano. Señale lo correcto.',
      o: ['Tuvieron que regresar al lugar de donde partieron.', 'Se quedaron a vivir bajo el régimen español.', 'Han sido encarcelados por violar leyes migratorias.', 'Pidieron asilo político en beneficio de su integridad.', 'Recibieron el apoyo internacional europeo.']
    },
    {
      q: 'Indique la verdad (V) o falsedad (F) de los siguientes enunciados:',
      items: [
        'Según la reciente encuesta de Datum Internacional, la presidenta Keiko Fujimori inicia su gobierno con aprobación ciudadana.',
        'La actual mandataria del Perú sostuvo una reunión con autoridades para coordinar acciones y dar prioridad a la lucha contra la criminalidad.',
        'El fiscal de la Nación Tomás Gálvez presentó el diagnóstico sobre la situación del Ministerio Público, la importancia de su fortalecimiento institucional y el trabajo conjunto con la PNP frente a la inseguridad y criminalidad.'
      ],
      o: ['VFF', 'FVV', 'VVV', 'FFF', 'FFV']
    },
    {
      q: 'En el actual periodo gubernamental 2026, ¿quién es el exmandatario encarcelado que ha presentado un pedido de gracia presidencial por padecer un cuadro de depresión y ansiedad?',
      o: ['Alejandro Toledo', 'Ollanta Humala', 'Pedro Pablo Kuczynski', 'Francisco Sagasti', 'Pedro Castillo']
    },
    {
      q: `En muchos países europeos, el calor provoca incendios, sequías y muertes. En este contexto, Italia permanece en alerta debido a una ${blank}`,
      o: ['muerte por calor.', 'severa falta de agua fluvial.', 'ola de calor extremo.', 'alerta por incendios.', 'disminución de calor.']
    },

    // ─── Razonamiento verbal: analogías ───
    {
      q: 'Elija el par análogo al par base escrito en mayúsculas.<span class="uexam__pair">COMPÁS : CIRCUNFERENCIA ::</span>',
      o: ['regla : cuantificación', 'reloj : tiempo', 'termómetro : calor', 'brújula : orientación', 'transportador : ángulo']
    },
    {
      q: 'Elija el par análogo al par base escrito en mayúsculas.<span class="uexam__pair">AFLIGIR : TRISTEZA ::</span>',
      o: ['dañar : melancolía', 'confundir : angustia', 'aturdir : perturbación', 'molestar : fatiga', 'estresar : sosiego']
    },

    // ─── Antonimia contextual ───
    {
      q: `${antonym}<span class="uexam__quote">La respuesta que dio el conferencista a la pregunta del asistente fue <u>desatinada</u>.</span>`,
      o: ['prudente', 'temeraria', 'acertada', 'mesurada', 'aplaudida']
    },
    {
      q: `${antonym}<span class="uexam__quote">Después de haber estado ausente varias semanas, abrazó <u>fríamente</u> a sus familiares.</span>`,
      o: ['efusivamente', 'calurosamente', 'fuertemente', 'jovialmente', 'vigorosamente']
    },
    {
      q: 'Elija la alternativa que, al sustituir la palabra subrayada, exprese el significado opuesto de la oración.<span class="uexam__quote">Fue de conocimiento público que el agente policial <u>expuso</u> al autor del homicidio.</span>',
      o: ['encubrió', 'ocultó', 'protegió', 'silenció', 'tapó']
    },

    // ─── Coherencia y cohesión textual ───
    {
      q: 'Elija el orden correcto que deben seguir los enunciados para que el texto sea coherente y cohesivo<div class="uexam__passage">I. Posteriormente a ellos, Luis Dejean construyó el circo Napoleón, en 1852. II. Actualmente, la mayor parte de los circos son sociedades o razones sociales. III. El veneciano Antonio Franconi y sus hijos se hicieron cargo de este circo tras la Revolución Francesa. IV. El creador del circo fue el inglés Philip Astley quien abrió uno en París en 1783. V. Además, los circos actuales emplean colectivos de artistas y compañías de teatro acrobático.</div>',
      o: ['II - V - IV - I - III', 'IV - I - III - II - V', 'IV - III - I - II - V', 'II - III - IV - I - V', 'IV - I - III - V - II']
    },
    {
      q: 'Luego de analizar el texto, elija la alternativa que contenga la respuesta a la pregunta planteada.<div class="uexam__passage">Las experiencias del pasado demuestran que los programas de educación de personas adultas para comunidades indígenas han tenido éxito debido a que han estado bajo el control de las propias comunidades locales. Entonces, es importante crear un espacio para las comunidades en las universidades. Los pueblos indígenas poseen una herencia de sabiduría enormemente rica y compleja, basada en paradigmas muy diferentes a aquellos que se sostienen en las universidades occidentales. La sabiduría indígena, por ejemplo, está basada en una estrecha simbiosis con la naturaleza. Se debe tener cuidado de no destruir la sabiduría indígena al tratar de imponer enfoques científicos occidentales aunados a la tendencia de explotar el medio ambiente y la naturaleza.</div>Respecto a las comunidades indígenas, podemos afirmar que',
      o: ['cada una de ellas debería contar con una universidad estatal.', 'deben tener control de los contenidos de los programas educativos.', 'deberían construir con sus propios recursos una universidad intercultural.', 'su heterogeneidad hace imposible que creen conocimientos nuevos.', 'asimilarán distintas tradiciones y costumbres occidentales.']
    },
    {
      q: 'Luego de analizar el texto, elija la alternativa que contenga la respuesta a la pregunta planteada.<div class="uexam__passage">La atmósfera responde a los cambios en el océano rápidamente, mientras que el océano, debido a sus propiedades físicas, posee una mayor inercia y toma más tiempo llegar a un nuevo estado de equilibrio. Esto crea desequilibrios entre ellos, ya que el estado del océano no estaría determinado solamente por el estado actual atmosférico, sino que integra los estados atmosféricos precedentes a los cuales todavía se está ajustando. Este desequilibrio es la fuente fundamental de variabilidad en los dos sistemas. En general, los seres humanos se adaptan a las condiciones medias del clima en la región donde viven y lidian con sus variaciones. Esto incluye la existencia de eventos climáticos extremos, por lo general asociados a los desastres climáticos, ya que el clima no siempre se mantiene dentro de los límites que la sociedad espera y las condiciones caen fuera del rango de lo esperado. Un evento climático extremo de baja probabilidad puede ocurrir con inusitada frecuencia e incluso repetirse en pocos años. Un desastre asociado al clima puede aparecer a través de muchas formas, desde la rápida aparición de eventos de corta vida como los huracanes hasta la lenta fluctuación que, en ocasiones, lleva a una condición de sequía. Por ello, los recursos climáticos son mejor explotados a medida que se conocen los diferentes tipos de variaciones que los afectan. La interacción entre los sistemas atmósfera y océano está presente en prácticamente todas las escalas temporales y espaciales.</div>Según el texto, el estudio de las variaciones del clima permite',
      o: ['la reducción de riesgo de los desastres.', 'aprovechar mejor los recursos climáticos.', 'predecir la ocurrencia de climas extremos.', 'adaptarse a las condiciones climatológicas.', 'desarrollar teorías sobre el cambio climático.']
    },
    {
      q: 'Elija el orden correcto que deben seguir los enunciados para que el texto sea coherente y cohesivo.',
      items: [
        'Tras su formación, se dedicó a la docencia en la Universidad Nacional Mayor de San Marcos.',
        'Además de desempeñarse en estas actividades intelectuales, ocupó importantes cargos políticos.',
        'Hipólito Unanue fue un científico y político peruano nacido en Lima, en 1755.',
        'Gracias a su labor en este diario, contribuyó, grandemente, a la difusión de las ideas científicas en el país.',
        'En paralelo a este trabajo, fue editor del periódico <i>Mercurio Peruano</i>.'
      ],
      o: ['I – III – V – IV – II', 'III – V – I – IV – II', 'I – V – III – II – IV', 'III – I – V – IV – II', 'III – I – IV – V – II']
    },

    // ─── Comprensión de lectura ───
    {
      q: '<div class="uexam__passage">La nanotecnología o tecnología nanométrica en la sociedad conlleva a la caracterización, fabricación o manipulación de estructuras, aparatos o materiales que tienen tamaños entre 1 y 100 nm. A esta escala, el material presenta mejores propiedades físicas y químicas que contribuyen al mejoramiento de nuestra calidad de vida. La nanotecnología se aplica en diversas áreas; por ejemplo, el procesamiento y envasado de alimentos, la fabricación de productos cosméticos, el tratamiento de aguas contaminadas, la elaboración de materiales para la construcción, automóviles y aparatos telefónicos modernos. Desde los semilleros de investigación, también se hace un trabajo de divulgación y formación en nanotecnología, que impactan grandemente en diversos sectores de la sociedad.</div>¿Cuál es el tema central del texto?',
      o: ['Las propiedades físicas y químicas de los materiales nanométricos', 'El mejoramiento de los productos cosméticos, gracias a la nanotecnología', 'El impacto de la tecnología nanométrica en la sociedad', 'La nanotecnología como un tópico de crítica contemporánea', 'La elaboración de materiales para construir aparatos con nanotecnología']
    },
    {
      q: 'Luego de analizar el texto, elija la alternativa que contenga la respuesta de la siguiente pregunta.<div class="uexam__passage"><strong>TEXTO</strong><br>El incremento de incendios en España en los años 70 y 80 se explica, especialmente, por el aumento en continuidad de la vegetación, debido al abandono rural. El cambio climático no tuvo un papel protagonista. A medida que dejamos que avance el cambio climático, el papel relativo del clima en los incendios aumenta. Hay que recordar que, en España, y en muchos países europeos, la masa forestal está en aumento, a pesar de los incendios.<br><br>En efecto, el incremento de las temperaturas, olas de calor y sequías facilita en gran manera los incendios, pero se requieren también igniciones y vegetación discontinua. Esto es una buena noticia, pues las igniciones controladas y las discontinuidades en la vegetación son más sencillas que reducir el cambio climático de golpe.</div>Es compatible con el texto afirmar que',
      o: ['el aumento de incendios en España, en el siglo XIX, se debió al incremento en la continuidad de la vegetación.', 'el surgimiento de incendios no solamente se debe a olas de calor.', 'el cambio climático no influye en la aparición de incendios.', 'son imprescindibles las igniciones para facilitar el incremento de las temperaturas.', 'en todo Europa y Asia, la masa forestal disminuye condicionada por los incendios.']
    },
    {
      q: 'Luego de analizar el texto, elija la alternativa que contenga la respuesta a la pregunta planteada.<div class="uexam__passage">No hay posibilidad de un desarrollo sostenible si la sociedad moderna, en su conjunto, no disminuye drásticamente sus emisiones de gases de efecto invernadero. En este contexto, es necesario que surja la ciudad resiliente como un modelo de sociedad organizada que tenga la capacidad institucional financiera para superar los cambios físicos, económicos y ecológicos generados por el cambio climático y otros desafíos del futuro. Las ciudades deben reducir sus emisiones de carbono, invertir en la conservación del medio ambiente, evitar la deforestación, restaurar los ecosistemas degradados, y fomentar el acceso a energía limpia que sea accesible y eficiente. El sector energético es uno de los más contaminantes y, por lo tanto, una prioridad en la acción contra el cambio climático. La sociedad moderna ha presentado un crecimiento económico con la utilización de combustibles fósiles; no obstante, estos producen altas emisiones de gases de efecto invernadero en comparación con otros recursos energéticos.</div>Marque la alternativa cuya información es incompatible con el contenido del texto.',
      o: ['El uso de combustibles fósiles permite a la sociedad moderna un desarrollo sostenible.', 'Las ciudades resilientes permitirían un desarrollo sostenible.', 'El sector energético contribuye al problema de la contaminación.', 'El crecimiento económico de la sociedad moderna conlleva altas emisiones de gases de efecto invernadero.', 'El acceso a energía limpia sería posible de lograr con las ciudades resilientes.']
    },

    // ─── Comunicación y lengua ───
    {
      q: 'Elija la alternativa en la cual el uso de la conjunción <i>que</i> es correcto.',
      o: ['Sinceramente, me alegro que hayas aprobado el curso.', 'No cabe duda que ganaremos esa competencia.', 'Me convencieron que debía visitar a mis amigos.', 'Estoy seguro que mañana tendremos mucho sol.', 'Señaló que la captura del prófugo era inminente.']
    },
    {
      q: 'Marque la alternativa que presenta verbo transitivo.',
      o: ['Te entregaron la carta.', 'El niño ingresó al jardín.', 'Carmela descansa allí.', 'Ellas regresaron ayer.', 'Marcelo salió de viaje.']
    },
    {
      q: '¿Cuál de los siguientes enunciados presenta uso correcto de mayúscula?',
      o: ['Mis sobrinos gemelos nacieron en el mes de Junio.', '¡Muy impresionante! controlas tu miedo durante las evaluaciones.', 'El actual Ministro de Energía y Minas es egresado de la UNI.', 'Concéntrate en el momento: Siente, no pienses, confía en ti.', 'El tigre de Bengala se encuentra en peligro de extinción.']
    },
    {
      q: 'Señale la oración que presenta error de acentuación ortográfica.',
      o: ['El Sistema Nacional de Gestión del Riesgo de Desastres está dirigido por la Presidencia del Consejo de Ministros.', 'La depredación es la explotación indebida de recursos naturales por crecimiento demografico.', 'El efecto invernadero es un fenómeno atmosférico natural que mantiene la temperatura del planeta.', 'Sobre el trópico de Capricornio, se encuentran los desiertos Atacama y Tarapacá, situados en la costa de Chile.', 'El desierto posee poco valor para desarrollar una economía sólida, por las escasas facilidades para la vida humana.']
    },

    // ─── Conectores lógico-textuales ───
    {
      q: `${connector}<div class="uexam__passage">Los estereotipos son modelos fijos de cualidades o de conductas sociales. ${blank}, son creencias generalizadas sobre una persona o un grupo; ${blank}, se heredan de la cultura o de la familia, ${blank} pueden generar un trato desigual e injusto.</div>`,
      o: ['Sin embargo – solo si – porque', 'Es decir – además – empero', 'También – por ende – a pesar de que', 'Incluso – por ello – asimismo', 'Aunque – no obstante – también']
    },
    {
      q: `${connector}<div class="uexam__passage">${blank} el precio del algodón ha bajado, los ingresos de los productores han disminuido; ${blank}, no han podido pagar sus deudas. ${blank}, demandan apoyo del Estado.</div>`,
      o: ['Debido a que - además - Por consiguiente', 'Aunque - empero - Por lo tanto', 'Dado que - por ello - En consecuencia', 'Aun cuando - ergo - Así', 'Puesto que - verbigracia - Por ende']
    },
    {
      q: `${connector}<div class="uexam__passage">${blank} el deporte es vital para la salud, el IPD crea programas deportivos gratuitos; ${blank}, invierte recursos en infraestructura. ${blank}, solo pocos acceden a estos beneficios.</div>`,
      o: ['Debido a que - por eso - Es decir', 'Puesto que - por ello - No obstante', 'Aunque - además - Desde luego', 'No obstante - esto es - Verbigracia', 'Pese a que - incluso - En resumen']
    },

    // ─── Definiciones ───
    {
      q: `${definition}<span class="uexam__quote">${blank}: Dicho de una persona: llegar a un país extranjero.</span>`,
      o: ['Peregrinar', 'Emigrar', 'Acudir', 'Inmigrar', 'Arribar']
    },
    {
      q: `${definition}<span class="uexam__quote">${blank}: Sano, sin lesión ni deterioro.</span>`,
      o: ['Incólume', 'Vivo', 'Íntegro', 'Fuerte', 'Salubre']
    },
    {
      q: `${definition}<span class="uexam__quote">${blank}: No conceder lo que se pide o solicita.</span>`,
      o: ['Denegar', 'Denigrar', 'Reprimir', 'Impugnar', 'Impedir']
    },
    {
      q: `${definition}<span class="uexam__quote">${blank}: Pesar ocasionado por no haber hecho algo o por haber dejado de hacer algo.</span>`,
      o: ['Inquietud', 'Remordimiento', 'Pesadumbre', 'Culpa', 'Arrepentimiento']
    },

    // ─── Economía ───
    {
      q: '¿Cómo se denomina al tipo de dinero que es establecido por el Banco Central de Reserva del Perú y posee un valor legal mayor al valor real?',
      o: ['Dinero mercancía', 'Bancario', 'Fiduciario', 'Intrínseco', 'Valor divisa']
    },
    {
      q: 'La “deslocalización” de la producción es un fenómeno estrechamente ligado a la globalización. Además, implica que una empresa traslade parte de sus procesos productivos a otro país. ¿Qué motivaciones económicas principales impulsan a las empresas a deslocalizar su producción y qué efectos potenciales puede producir esto en el mercado laboral de su país de origen?',
      o: [
        'Motivación: Aumentar los costos de producción y reducir la calidad del producto<br>Efecto: Creación masiva de empleo en el país de origen',
        'Motivación: Acceder a mercados emergentes de alta demanda con costos relativamente altos<br>Efecto: Sin impacto significativo en el empleo del país de origen',
        'Motivación: Buscar reducir los costos, acceder a recursos naturales específicos o aprovechar regulaciones menos estrictas<br>Efecto: Potencial pérdida de empleo en los diferentes sectores o de servicios en el país de origen',
        'Motivación: Fomentar el proteccionismo económico en el país de origen<br>Efecto: Fortalecimiento de los sindicatos locales',
        'Motivación: Mejorar la reputación de la marca<br>Efecto: Disminución de la productividad en el país de origen'
      ]
    },
    {
      q: 'De acuerdo con la siguiente información, ¿qué función cumple el Estado?<div class="uexam__passage">Este sector público corrige la desigualdad de la distribución de la riqueza con la aplicación de un conjunto de medidas destinadas a trasladar recursos a los sectores menos favorecidos.</div>',
      o: ['Reguladora', 'Proveedora', 'Redistributiva', 'Correctiva', 'Estabilizadora']
    },
    {
      q: '¿Cuál es la escuela que propone la teoría subjetiva del valor que está definida por la utilidad marginal?',
      o: ['Neoclásica', 'Socialista', 'Monetaria', 'Keynesiana', 'Fisiocrática']
    },

    // ─── Filosofía ───
    {
      q: 'Relacione los siguientes enunciados con su respectiva teoría axiológica. Posteriormente, identifique la alternativa correcta.',
      items: ['La belleza se encuentra en la escultura y es reconocida por la persona.', 'Arturo valora el celular porque puede comunicarse con sus amistades.', 'Determinar que la escultura es bella es relativo.', 'La expresión “El chocolate es delicioso” no tiene valor veritativo.'],
      list2: ['Objetivismo', 'Relacionismo', 'Subjetivismo', 'Emotivismo'],
      o: ['Ib, IIa, IIIc, IVd', 'Ia, IIc, IIIb, IVd', 'Ic, IIb, IIIa, IVd', 'Id, IIb, IIIc, IVa', 'Id, IIa, IIIb, IVc']
    },
    {
      q: '¿Cómo se denomina a los maestros que enseñaron artes oratorias y cuestionaron el conocimiento de la verdad absoluta?',
      o: ['Los peripatéticos', 'Los platónicos', 'Los estoicos', 'Los epicúreos', 'Los sofistas']
    },
    {
      q: '¿Qué está proponiendo Friedrich Nietzsche cuando afirma: “Dios ha muerto ... nosotros lo hemos matado”?',
      o: ['La necesidad de una reforma religiosa', 'Una crítica a la metafísica tradicional', 'La superioridad de la ciencia sobre la filosofía', 'La inmortalidad del alma basada en los sacramentos', 'La muerte de los líderes políticos']
    },

    // ─── Geografía y desarrollo nacional ───
    {
      q: 'De acuerdo con las siguientes características relacionadas a las actividades agrícolas en el Perú, identifique los enunciados verdaderos.',
      items: ['La agricultura extensiva abastece, suficientemente, al mercado interno y externo.', 'La agricultura intensiva es más tecnificada y tiene apoyo financiero.', 'Las inundaciones y la salinización son problemas de la agricultura en la costa.'],
      o: ['Solo I', 'Solo II', 'I y II', 'II y III', 'I, II y III']
    },
    {
      q: 'El Estado peruano es la nación, jurídicamente establecida en un determinado territorio, conformada por instituciones, leyes y autoridades. A partir de lo mencionado, identifique los enunciados verdaderos.',
      items: ['El Estado se organiza según el principio de separación de poderes.', 'El presidente de la República tiene poder vitalicio.', 'El Poder Judicial administra justicia, según la jerarquía social y económica.', 'El Congreso actual está dividido en la cámara de senadores y diputados.'],
      o: ['I y II', 'I y IV', 'I, III y IV', 'I, II y III', 'I, II y IV']
    },
    {
      q: 'De acuerdo a la Corte Internacional de Justicia de la Haya, respecto del diferendo marítimo entre Perú y Chile. ¿Desde dónde parte la delimitación?',
      o: ['Hito N°&nbsp;1', 'Punto de la Concordia', 'Boca de Capones', 'Punta Aguja', 'península de Illescas']
    },

    // ─── Historia del Perú y del mundo ───
    {
      q: `La Confederación Perú-Boliviana creada en 1836 perjudicaba los intereses de los ${blank} en el Perú y de ${blank} en el exterior.`,
      o: ['liberales - Argentina', 'conservadores - Chile', 'intelectuales - Ecuador', 'monarquistas - Brasil', 'republicanos - Colombia']
    },
    {
      q: 'La Unión de Repúblicas Socialistas Soviéticas se desintegró tras la caída del muro de Berlín en 1989. A continuación, identifique una de sus causas.',
      o: ['La crisis de los misiles entre Cuba y Estados Unidos', 'El progreso tecnológico de la República Democrática de Alemania', 'El surgimiento de la Comunidad de Estados Independientes', 'La corrupción del PCUS y el desgaste económico por la carrera bélica', 'La guerra entre las dos coreas en el Sudeste asiático']
    },
    {
      q: '¿Cuál (es) de los siguientes enunciados, respecto al Imperio Carolingio, son verdaderos?',
      items: ['Los ducados fueron provincias militarizadas en las fronteras del imperio.', 'Carlomagno fue coronado emperador por el papa León III.', 'El Imperio carolingio se desintegró con el Tratado de Verdún (843).'],
      o: ['Solo I', 'Solo II', 'Solo III', 'I y II', 'II y III']
    },
    {
      q: '¿Cuál de los siguientes precursores promovió la independencia de los pueblos y fue autor de la llamada <i>Carta a los españoles americanos</i>?',
      o: ['José Baquíjano y Carrillo', 'José de la Riva Agüero', 'Vicente Morales Duárez', 'Toribio Rodríguez de Mendoza', 'Juan Pablo Vizcardo y Guzmán']
    },

    // ─── Inclusión de enunciado ───
    {
      q: `${inclusion}<div class="uexam__passage">I. Aristóteles dedicó muchos años al estudio y descripción de los animales. II. No obstante, impulsado por su inclinación hacia la claridad y el orden, fue más allá y desarrolló una clasificación de estos. III. Para ello, agrupó cuidadosamente a los animales en clases, según sus semejanzas biológicas. IV. ${blank}. V. Un ejemplo fue el delfín, que, aunque se consideraba un pez por habitar en el agua, respira, pare y amamanta a sus crías, razones por las que lo clasificó como mamífero.</div>`,
      o: ['Durante esta clasificación, Aristóteles observó que algunos animales presentaban características de más de dos clases.', 'Esta labor la realizó a partir de observaciones minuciosas, tanto de la anatomía como del comportamiento de los animales.', 'Al realizar este trabajo, se encontró con animales que no podían ser clasificados, debido a que presentaban características variadas.', 'En este proceso, notó que algunos animales no encajaban en la clase con la que aparentemente guardaban mayor similitud.', 'Existían animales que representaron una mayor dificultad, debido a que era casi imposible observarlo en su hábitat natural.']
    },
    {
      q: `${inclusion}<div class="uexam__passage">I. El programa espacial soviético Vostok tuvo seis misiones importantes entre 1961 y 1963. II. La primera de ellas, Vostok 1, tuvo gran relevancia mediática, debido a que permitió llevar, por primera vez, a un solo hombre al espacio. III. ${blank} IV. Durante este tiempo completó una órbita alrededor de la Tierra. V. Esta misión permitió estudiar los efectos de la ingravidez en los seres humanos, por lo que aportó valiosa información para futuras exploraciones espaciales.</div>`,
      o: ['Gracias a ello, la Unión Soviética fue la pionera en la carrera espacial por muchos años.', 'La travesía fue realizada por Yuri Gagarin a bordo del Vostok-k, el 12 de abril de 1961.', 'La misión permitió que Yuri Gagarin entre en órbita, luego de 9 minutos del despegue.', 'De acuerdo con la versión oficial, los tripulantes permanecieron en el espacio 108 minutos.', 'Esta misión fue realizada por Yuri Gagarin, quien oficialmente estuvo 108 minutos en el espacio.']
    },
    {
      q: `${inclusion}<div class="uexam__passage">I. La pólvora fue inventada en China en el siglo IX de nuestra era. II. Según fuentes taoístas, los alquimistas estaban buscando un tratamiento para conseguir la inmortalidad cuando dieron con su fórmula. III. ${blank} IV. Fue recién en el siglo XI que le encontraron otra utilidad: la fabricación de armas de guerra. V. Es con esta aplicación que la fórmula fue llevada a la India y luego a Medio Oriente.</div>`,
      o: ['El poder de la pólvora permitió que fuera usada para elaborar, exclusivamente, cañones.', 'Durante mucho tiempo, fue utilizada solo para la elaboración de fuegos artificiales.', 'Pasaron muchos años para que sus descubridores le encuentren alguna aplicación.', 'Mientras permaneció en China, únicamente la usaron para fabricar fuegos artificiales.', 'Al no conseguir su principal cometido, buscaron algún uso práctico para la pólvora.']
    },

    // ─── Información eliminada ───
    {
      q: 'Elija la oración que es impertinente o es redundante con el contenido global del texto.<div class="uexam__passage">I. La cleptomanía es un trastorno de salud mental que presenta una sintomatología variada. II. Uno de los síntomas de la cleptomanía es la incapacidad para resistir fuertes impulsos de apropiarse de objetos que no son necesarios. III. La persona cleptómana suele sentir tensión, ansiedad o excitación. IV. Debido a la cleptomanía, quien la padece siente placer, alivio o satisfacción al hurtar. V. El cleptómano, generalmente, siente culpa, remordimiento y odio hacia sí mismo.</div>',
      o: romans
    },
    {
      q: 'Señale la alternativa que es impertinente o es redundante con el contenido global del texto.<div class="uexam__passage">I. La tragedia griega se originó con los ditirambos, cantos en honor al dios Dionisio. II. Destacan entre las tragedias la <i>Orestíada</i>, de Esquilo, y <i>Edipo rey</i>, de Sófocles. III. Los temas de la tragedia giraban en torno de la inexorabilidad del destino signado por los dioses. IV. La noción misma de tragedia alude a dos ideas: la incapacidad humana de escapar de un sino y el discernimiento entre lo malo y lo bueno. V. Las tragedias solían versar sobre eventos universales y dolorosos.</div>',
      o: romans
    },
    {
      q: 'Señale la alternativa que es impertinente o es redundante con el contenido global del texto.<div class="uexam__passage">I. Los manifestantes que derriban monumentos dedicados a esclavistas y genocidas son, a menudo, acusados de “borrar el pasado”. II. Los movimientos antirracistas han impulsado una mirada crítica en torno a la esclavitud y al colonialismo al destruir sus monumentos. III. Sus acciones están obligando a escrutar más de cerca a los personajes que son honrados en estos monumentos. IV. Gracias a estos movimientos, se ha generado un debate público que cuestiona las acciones “heroicas” de estos personajes. V. Esto permite que la historia se vuelva a contar, pero desde el punto de vista de las víctimas de los personajes que son honrados en los monumentos.</div>',
      o: romans
    },

    // ─── Inglés ───
    {
      q: `Marque la alternativa que debe insertarse en el espacio en blanco para que la oración presente sentido completo.<span class="uexam__quote"><i>The woman sitting next to me on the plane was very nervous because she ${blank} before.</i></span>`,
      o: ['<i>didn’t fly</i>', '<i>has flown</i>', '<i>hasn’t fly</i>', '<i>wasn’t flying</i>', '<i>hadn’t flown</i>']
    },
    {
      q: `Señale la alternativa que debe insertarse en el espacio en blanco para que la oración presente sentido completo.<span class="uexam__quote"><i>According to last researches, dolphins, whales and ${blank} other sea creatures use highly sophisticated navigation systems.</i></span>`,
      o: ['<i>any</i>', '<i>many</i>', '<i>each one</i>', '<i>a little</i>', '<i>much</i>']
    },
    {
      q: `¿Qué alternativa completa correctamente el espacio en blanco para que la oración presente sentido completo?<span class="uexam__quote"><i>What time ${blank} the professor arrive at the university yesterday?</i></span>`,
      o: ['<i>did</i>', '<i>do</i>', '<i>will</i>', '<i>was</i>', '<i>does</i>']
    },

    // ─── Literatura ───
    {
      q: 'Respecto a la Generación del 50, marque la alternativa que contenga la relación correcta entre autor y obra.',
      items: ['Enrique Congrains Martín', 'Eleodoro Vargas Vicuña', 'Julio Ramón Ribeyro'],
      list2: ['<i>La palabra del mudo</i>', '<i>Lima, hora cero</i>', '<i>Ñahuín</i>'],
      o: ['Ia, IIc, IIIb', 'Ib, IIc, IIIa', 'Ib, IIa, IIIc', 'Ic, IIa, IIIb', 'Ic, IIb, IIIa']
    },
    {
      q: 'Identifique la figura literaria que predomina en los siguientes versos de José Santos Chocano.<div class="uexam__verse">¡Los caballos eran fuertes!<br>¡Los caballos eran ágiles!<br>Sus pescuezos eran finos<br>y sus ancas relucientes<br>y sus cascos musicales...<br>¡Los caballos eran fuertes!<br>¡Los caballos eran ágiles!</div>',
      o: ['Hipérbaton', 'Hipérbole', 'Símil', 'Metáfora', 'Anáfora']
    },
    {
      q: 'La especie lírica de la literatura prehispánica que se define como el canto que trata sobre temas agrícolas y cuya finalidad es suplicar por cosechas beneficiosas se denomina',
      o: ['<i>haylli</i>', '<i>ayataqui</i>', '<i>haraui</i>', '<i>aymoray</i>', '<i>cacharpari</i>']
    },

    // ─── Lógica ───
    {
      q: '¿Cuál es el número de combinaciones posibles de una proposición con 3 variables?',
      o: ['2', '4', '8', '16', '32']
    },
    {
      q: '¿Cuál de las alternativas que se presenta a continuación <u>no</u> es una proposición lógica?',
      o: [R`\(4\times 7=28\)`, R`\(6\times 8=37\)`, 'La capital del Perú es Chiclayo.', 'La Tierra es plana.', '¡Dime la verdad!']
    },
    {
      q: 'La proposición “<i>Si llueve, las calles se mojan</i>” se formaliza de la siguiente manera:',
      o: [R`\(p\to q\)`, R`\(p\wedge q\)`, R`\(p\vee q\)`, R`\(p\leftrightarrow q\)`, R`\(\sim p\to q\)`]
    },

    // ─── Plan de redacción ───
    {
      q: 'Elija la alternativa que contenga la secuencia correcta que deben seguir los enunciados para que la estructura del texto sea adecuada.<span class="uexam__title">ARGUMENTOS DE ZENÓN DE ELEA</span>',
      items: [
        'Se sabe por Platón, que Zenón escribió una obra que consistía en una colección de argumentos.',
        'Llevaba a cabo este cometido a través de la reducción al absurdo de las hipótesis contrarias.',
        'Platón sostuvo que estos tenían como finalidad defender la teoría metafísica de su maestro.',
        'Este procedimiento es conocido por los fragmentos mencionados por Simplicio.',
        'Zenón de Elea fue un filósofo griego, discípulo de Parménides, que vivió durante el siglo V a.C.'
      ],
      o: ['V – I – II – IV – III', 'I – III – V – II – IV', 'I – III – V – IV – II', 'V – I – III – IV – II', 'V – I – III – II – IV']
    },
    {
      q: 'Elija la alternativa que contenga la secuencia correcta que deben seguir los enunciados para que la estructura del texto sea adecuada.<span class="uexam__title">OBJETIVOS DE LA NEUROEDUCACIÓN EN EL APRENDIZAJE</span>',
      items: [
        'La adecuación de sus estrategias sirve para promover mayor retención de la información.',
        'La neuroeducación nos brinda valiosas herramientas para comprender cómo se desarrolla.',
        'Identificar las barreras cognitivas de los estudiantes también permite la neuroeducación.',
        'Al entender su proceso, los educadores pueden adaptar sus estrategias de enseñanza.',
        'El cerebro humano es el órgano central que se encarga del proceso de aprendizaje.'
      ],
      o: ['II – I – IV – III – V', 'II – V – III – I – IV', 'II – IV – I – III – V', 'V – II – I – IV – III', 'V – II – IV – I – III']
    },
    {
      q: 'Luego de analizar el texto, elija la alternativa que contenga la respuesta a la pregunta planteada.<div class="uexam__passage">El mercado libre no existe. Todos los mercados tienen reglas y límites que acotan la libertad de elección. Si un mercado parece libre, solo es porque aceptamos tan incondicionalmente sus restricciones de base que ya no las vemos. No se puede definir con objetividad lo “libre” que es un mercado. Es una definición política. No es cierto lo que dicen siempre los economistas de libre mercado, eternos defensores del mercado contra la intromisión del Gobierno por motivos políticos: el Estado siempre está presente, y a esos economistas la política les impulsa tanto como a los demás.</div>Resulta compatible con el texto sostener que el mercado',
      o: ['carece de toda intervención estatal.', 'llamado “libre” puede definirse objetivamente.', 'se caracteriza por siempre gozar de libre albedrío.', 'es un espacio que está regulado por economistas.', 'está siempre dirigido por reglas: presenta restricciones.']
    },
    {
      q: 'Elija la alternativa que contenga la secuencia correcta que deben seguir los enunciados para que la estructura del texto sea la adecuada.<span class="uexam__title">EL CARBONO</span>',
      items: [
        'Las combinaciones del carbono son numerosas.',
        'El carbono es un no metal que se halla en estado cristalizado molecular o amorfo.',
        'El resto de las combinaciones entran en el campo de la química inorgánica.',
        'Estos compuestos se estudian dentro de la química orgánica.',
        'Los compuestos que origina el carbono con el hidrógeno, el oxígeno y el nitrógeno entran en la constitución de los organismos vivos.'
      ],
      o: ['II - I - III - IV - V', 'II - V - IV - III - I', 'II - I - V - IV - III', 'II - V - I - IV - III', 'II - I - III - V - IV']
    },

    // ─── Precisión léxica en contexto ───
    {
      q: `${lexical}<span class="uexam__quote">Luego de analizar las pruebas y alegatos presentados, el juez decidió <u>culpar</u> al acusado.</span>`,
      o: ['responsabilizar', 'castigar', 'denunciar', 'condenar', 'procesar']
    },
    {
      q: `${lexical}<span class="uexam__quote">El grupo de escaladores decidió <u>establecerse</u> cerca del río para descansar debido a la hora y a las bajas temperaturas.</span>`,
      o: ['dormir', 'yacer', 'detenerse', 'parar', 'acampar']
    },
    {
      q: `${lexical}<span class="uexam__quote">El chef <u>puso</u> los ingredientes en la mesa para facilitar la preparación del estofado.</span>`,
      o: ['arrimó', 'dispuso', 'organizó', 'situó', 'presentó']
    },

    // ─── Psicología ───
    {
      q: '¿Cuál de las etapas del proceso creativo concibe la idea conscientemente verificada, elaborada y luego aplicada?',
      o: ['Preparación', 'Incubación', 'Iluminación', 'Verificación', 'Inventiva']
    },
    {
      q: '¿Qué tipo de pensamiento es el que busca soluciones nuevas a un problema que plantea respuestas originales y multidireccionales?',
      o: ['Coherente', 'Lógico', 'Convergente', 'Divergente', 'No lógico']
    },
    {
      q: 'Henry se cayó de su bicicleta el sábado pasado y se lastimó la pierna derecha. A consecuencia de ello, siente mucho dolor en dicha extremidad. ¿Qué neurotransmisor necesitaría para disminuir su dolor?',
      o: ['Endorfina', 'Acetilcolina', 'Dopamina', 'Serotonina', 'Norepinefrina']
    }
  ]
};
