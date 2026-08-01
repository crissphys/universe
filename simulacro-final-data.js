(function () {
  'use strict';
  var banks = window.UNIVERSE_EXAM_BANKS = window.UNIVERSE_EXAM_BANKS || {};
  banks['admision-uni-2027-1'] = {
  "id": "admision-uni-2027-1",
  "title": "Simulacro de admisión UNI 2027-1",
  "shortTitle": "Admisión UNI 2027-1",
  "description": "Nuevo simulacro de admisión en desarrollo. Actualmente contiene los bloques de Trigonometría, Aritmética, Álgebra, Geometría, Física y Química.",
  "status": "draft",
  "durationSeconds": 10800,
  "questions": [
    {
      "id": 1,
      "course": "Trigonometría",
      "topic": "Curvas paramétricas",
      "frequency": "alta",
      "passage": "",
      "text": "Grafique la curva definida por las ecuaciones paramétricas dadas:<span class=\"ufe-equation-stack\"><span class=\"ufe-equation-row\"><span class=\"ufe-equation-body\"><i>x</i> = sen <i>t</i> + cos <i>t</i></span><b>(1)</b></span><span class=\"ufe-equation-row\"><span class=\"ufe-equation-body\"><i>y</i> = sen <i>t</i> − cos <i>t</i></span><b>(2)</b></span></span>",
      "choices": [
        "Gráfico A",
        "Gráfico B",
        "Gráfico C",
        "Gráfico D",
        "Gráfico E"
      ],
      "visual": "<div class=\"ufe-graph-choice-grid\"><figure><b>A</b><svg viewBox=\"0 0 180 150\" role=\"img\" aria-label=\"Circunferencia de radio raíz de dos\"><path d=\"M20 75H164M90 138V12\"/><path d=\"m160 71 8 4-8 4M86 16l4-8 4 8\"/><circle cx=\"90\" cy=\"75\" r=\"48\"/><text x=\"92\" y=\"22\">√2</text><text x=\"92\" y=\"142\">−√2</text><text x=\"137\" y=\"69\">√2</text><text x=\"19\" y=\"69\">−√2</text><text x=\"166\" y=\"88\">X</text><text x=\"99\" y=\"15\">Y</text></svg></figure><figure><b>B</b><svg viewBox=\"0 0 180 150\" role=\"img\" aria-label=\"Elipse horizontal con semiejes dos y uno\"><path d=\"M14 75H166M90 138V12\"/><path d=\"m162 71 8 4-8 4M86 16l4-8 4 8\"/><ellipse cx=\"90\" cy=\"75\" rx=\"61\" ry=\"36\"/><text x=\"92\" y=\"35\">1</text><text x=\"92\" y=\"119\">−1</text><text x=\"146\" y=\"69\">2</text><text x=\"19\" y=\"69\">−2</text><text x=\"168\" y=\"88\">X</text><text x=\"99\" y=\"15\">Y</text></svg></figure><figure><b>C</b><svg viewBox=\"0 0 180 150\" role=\"img\" aria-label=\"Elipse vertical con semiejes uno y dos\"><path d=\"M18 75H164M90 140V10\"/><path d=\"m160 71 8 4-8 4M86 14l4-8 4 8\"/><ellipse cx=\"90\" cy=\"75\" rx=\"36\" ry=\"59\"/><text x=\"94\" y=\"20\">2</text><text x=\"94\" y=\"137\">−2</text><text x=\"119\" y=\"69\">1</text><text x=\"48\" y=\"69\">−1</text><text x=\"166\" y=\"88\">X</text><text x=\"99\" y=\"15\">Y</text></svg></figure><figure><b>D</b><svg viewBox=\"0 0 180 150\" role=\"img\" aria-label=\"Circunferencia unitaria\"><path d=\"M18 75H164M90 138V12\"/><path d=\"m160 71 8 4-8 4M86 16l4-8 4 8\"/><circle cx=\"90\" cy=\"75\" r=\"43\"/><text x=\"94\" y=\"29\">1</text><text x=\"94\" y=\"125\">−1</text><text x=\"128\" y=\"69\">1</text><text x=\"42\" y=\"69\">−1</text><text x=\"166\" y=\"88\">X</text><text x=\"99\" y=\"15\">Y</text></svg></figure><figure><b>E</b><svg viewBox=\"0 0 180 150\" role=\"img\" aria-label=\"Curva senoidal de cero a dos pi\"><path d=\"M17 75H166M31 132V12\"/><path d=\"m162 71 8 4-8 4M27 16l4-8 4 8\"/><path d=\"M31 75C48 37 66 37 83 75S118 113 135 75\"/><text x=\"28\" y=\"91\">0</text><text x=\"78\" y=\"91\">π</text><text x=\"130\" y=\"91\">2π</text><text x=\"168\" y=\"88\">X</text><text x=\"39\" y=\"15\">Y</text></svg></figure></div>"
    },
    {
      "id": 2,
      "course": "Trigonometría",
      "topic": "Ecuaciones con funciones trigonométricas inversas",
      "frequency": "alta",
      "passage": "",
      "text": "Calcule el número de soluciones de la ecuación:<span class=\"ufe-display-equation\">| arccsc (<i>x</i>/2) | = <span class=\"ufe-radical\">√<span class=\"ufe-radicand\"><i>x</i>²</span></span> − 2</span>",
      "choices": [
        "3",
        "2",
        "1",
        "4",
        "cero"
      ],
      "visual": ""
    },
    {
      "id": 3,
      "course": "Trigonometría",
      "topic": "Transformaciones trigonométricas",
      "frequency": "alta",
      "passage": "",
      "text": "Si se cumple las siguientes condiciones:<span class=\"ufe-equation-stack\"><span class=\"ufe-equation-row\"><span class=\"ufe-equation-body\">cos 2θ = cot <i>y</i> + tan <i>x</i></span><b>(1)</b></span><span class=\"ufe-equation-row\"><span class=\"ufe-equation-body\">cot 2θ = cot <i>x</i> + tan <i>y</i></span><b>(2)</b></span></span>halle el valor de:<span class=\"ufe-display-equation\">csc(2<i>x</i> − 2<i>y</i>) + 2/(1 + tan θ) + cot(2<i>y</i> − 2<i>x</i>)</span>",
      "choices": [
        "1/2",
        "1/4",
        "2",
        "1",
        "−1"
      ],
      "visual": ""
    },
    {
      "id": 4,
      "course": "Trigonometría",
      "topic": "Curvas de rodadura",
      "frequency": "alta",
      "passage": "",
      "text": "Halle la abscisa del punto <i>P</i> sobre la rueda de radio <i>r</i> cuando ésta gira una vuelta.",
      "choices": [
        "R cos(2πr/(R + r))",
        "R sen(2πR/(R + r))",
        "(R + r) sen(2πr/(R + r))",
        "(R + r) cos(2πr)",
        "R tan(πR/r)"
      ],
      "visual": "<svg class=\"ufe-main-diagram\" viewBox=\"0 0 640 390\" role=\"img\" aria-label=\"Rueda de radio r que rueda exteriormente sobre una circunferencia de radio R\"><defs><marker id=\"ufeArrow30\" viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0 0 10 5 0 10Z\" fill=\"currentColor\"/></marker></defs><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\"><path d=\"M86 335H590\" marker-end=\"url(#ufeArrow30)\"/><path d=\"M86 335V40\" marker-end=\"url(#ufeArrow30)\"/><path d=\"M86 150A185 185 0 0 1 271 335\"/><circle cx=\"86\" cy=\"96\" r=\"54\"/><path d=\"M86 96V150\" marker-end=\"url(#ufeArrow30)\"/><circle cx=\"358\" cy=\"218\" r=\"54\" stroke-dasharray=\"8 8\"/><circle cx=\"358\" cy=\"218\" r=\"4\" fill=\"currentColor\"/><path d=\"M305 205A55 55 0 0 1 330 170\" marker-end=\"url(#ufeArrow30)\"/></g><circle cx=\"86\" cy=\"150\" r=\"5\" fill=\"currentColor\"/><g fill=\"currentColor\" font-size=\"20\"><text x=\"62\" y=\"361\">O</text><text x=\"600\" y=\"347\">X</text><text x=\"62\" y=\"31\">Y</text><text x=\"98\" y=\"124\">r</text><text x=\"66\" y=\"173\">P</text><text x=\"205\" y=\"230\">x² + y² = R²</text></g></svg>"
    },
    {
      "id": 5,
      "course": "Trigonometría",
      "topic": "Funciones trigonométricas inversas",
      "frequency": "alta",
      "passage": "",
      "text": "De las siguientes proposiciones, indique cuántas son correctas:<span class=\"ufe-statement-list\"><span><b>I.</b> Si arccos <i>x</i>₁ &lt; arccos <i>x</i>₂ ⇒ <i>x</i>₁ &lt; <i>x</i>₂</span><span><b>II.</b> arcsen(π/2) + arccos(π/2) = π/2</span><span><b>III.</b> arcsen(sen <i>x</i>) = sen(arcsen <i>x</i>), ∀ <i>x</i> ∈ ℝ</span><span><b>IV.</b> Si <i>x</i>₁ &lt; <i>x</i>₂ ⇒ arccsc <i>x</i>₁ &gt; arccsc <i>x</i>₂, ∀ <i>x</i>₁; <i>x</i>₂ ∈ [1; +∞)</span></span>",
      "choices": [
        "Ninguna es correcta",
        "1",
        "2",
        "3",
        "Todas"
      ],
      "visual": ""
    },
    {
      "id": 6,
      "course": "Trigonometría",
      "topic": "Cálculo de ángulos",
      "frequency": "alta",
      "passage": "",
      "text": "Halle la medida del ángulo BĜD a partir del gráfico mostrado.",
      "choices": [
        "100°",
        "105°",
        "110°",
        "120°",
        "117°"
      ],
      "visual": "<svg class=\"ufe-main-diagram\" viewBox=\"0 55 441 275\" role=\"img\" aria-label=\"Gráfico original de la configuración geométrica con los puntos A, B, C, D, E, F, G y H\"><image href=\"/assets/simulacros/admision/trig-calculo-angulos-original.jpg?v=1\" x=\"0\" y=\"0\" width=\"441\" height=\"387\" preserveAspectRatio=\"xMidYMid meet\"/></svg>"
    },
    {
      "id": 7,
      "course": "Trigonometría",
      "topic": "Área de un cuadrilátero",
      "frequency": "alta",
      "passage": "",
      "text": "Dado un cuadrilátero convexo <i>ABCD</i> cuya área está representada por <i>S</i>, halle el ángulo formado por las diagonales del cuadrilátero en función de los lados <i>a</i>, <i>b</i>, <i>c</i>, <i>d</i> y <i>S</i>.",
      "choices": [
        "arcsen(S/(a² + b² + c² + d²))",
        "arccos(4S/(a² + b² + c² + d²))",
        "arctan(4S/(a² + b² − c² − d²))",
        "arcsen(4S/(b² + d² − a² − c²))",
        "arctan(4S/(b² + d² − a² − c²))"
      ],
      "visual": ""
    },
    {
      "id": 8,
      "course": "Trigonometría",
      "topic": "Resolución de triángulos oblicuángulos",
      "frequency": "alta",
      "passage": "",
      "text": "En el esquema mostrado, <i>PQ</i> representa un tramo de una carretera rectilínea. Una persona se encuentra en el punto <i>M</i>, observa <i>PQ</i> bajo un ángulo igual a θ. Halle la distancia mínima que debe recorrer la persona para llegar a la carretera, si se encuentra a una distancia <i>a</i> y <i>b</i> de los extremos <i>P</i> y <i>Q</i>, respectivamente.",
      "choices": [
        "ab cos θ/√(a² + b²)",
        "ab sen θ/√(a² + b²)",
        "ab sen θ/√(a² + b² − 2ab cos θ)",
        "ab cos θ/√(a² + b² − 2ab cos θ)",
        "ab tan θ/√(a² + b² − ab cos θ)"
      ],
      "visual": "<svg class=\"ufe-main-diagram\" viewBox=\"0 0 680 330\" role=\"img\" aria-label=\"Carretera rectilínea PQ observada desde el punto M bajo un ángulo theta\"><defs><pattern id=\"ufeRoad64\" width=\"46\" height=\"18\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-13)\"><rect width=\"46\" height=\"18\" fill=\"none\"/><path d=\"M5 9H26\" stroke=\"currentColor\" stroke-width=\"3\"/></pattern></defs><g stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\"><path d=\"M70 130L548 35\" stroke-width=\"31\" opacity=\".18\"/><path d=\"M70 130L548 35\" stroke-width=\"3\"/><path d=\"M73 142L551 47\" stroke-width=\"3\"/><path d=\"M70 130L485 277L548 35\" stroke-width=\"3\" stroke-dasharray=\"9 8\"/><path d=\"M458 267A30 30 0 0 1 493 247\" stroke-width=\"2\"/></g><g fill=\"currentColor\" font-size=\"24\" font-weight=\"600\"><text x=\"44\" y=\"143\">P</text><text x=\"557\" y=\"40\">Q</text><text x=\"481\" y=\"307\">M</text><text x=\"458\" y=\"252\">θ</text><text x=\"257\" y=\"228\">a</text><text x=\"523\" y=\"166\">b</text></g></svg>"
    },
    {
      "id": 9,
      "course": "Trigonometría",
      "topic": "Ley de senos",
      "frequency": "alta",
      "passage": "",
      "text": "Para medir <i>AB</i>, se dan ℓ, α y γ. Calcule dicho lado a partir del gráfico.",
      "choices": [
        "ℓ sen α/sen(γ + 30°)",
        "2ℓ sen α/sen(γ + 30°)",
        "2ℓ sen α/sen(γ − 30°)",
        "2ℓ sen γ/sen(α − γ)",
        "2ℓ sen γ sen(30° + α)/sen(30° − γ)"
      ],
      "visual": "<svg class=\"ufe-main-diagram\" viewBox=\"0 0 660 330\" role=\"img\" aria-label=\"Triángulo CDA con B sobre CA, CD igual a l y ángulos alfa, gamma y treinta grados\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M55 285H610L270 38Z\"/><path d=\"M270 38L342 285\"/><path d=\"M254 64A31 31 0 0 1 273 70M278 70A33 33 0 0 1 299 61\"/><path d=\"M310 285A32 32 0 0 1 333 256\"/></g><g fill=\"currentColor\" font-size=\"23\" font-weight=\"600\"><text x=\"37\" y=\"308\">C</text><text x=\"262\" y=\"28\">D</text><text x=\"332\" y=\"310\">B</text><text x=\"618\" y=\"307\">A</text><text x=\"150\" y=\"151\">ℓ</text><text x=\"246\" y=\"85\">α</text><text x=\"292\" y=\"88\">γ</text><text x=\"297\" y=\"261\">30°</text></g></svg>"
    },
    {
      "id": 10,
      "course": "Aritmética",
      "topic": "Media ponderada y sistemas de numeración",
      "frequency": "alta",
      "passage": "",
      "text": "Se seleccionó una muestra representativa de las generaciones Baby Boomers, Generación X, Millennials y Generación Z. Se encontró que los promedios de las horas semanales de conexión a redes sociales fueron, respectivamente, <i>m</i>, <i>p</i>, <i>a</i> y <i>k</i>. La distribución poblacional de estos grupos es la siguiente:<span class=\"ufe-display-equation\">Como dato adicional se sabe que <span class=\"ufe-overline\">pqr</span><sub>(k)</sub> − <span class=\"ufe-overline\">rqp</span><sub>(k)</sub> = <span class=\"ufe-overline\">a(a+2)m</span><sub>(k)</sub>, donde <i>k</i> es igual a 8.</span>Determine la media ponderada de las horas semanales de conexión a redes sociales del total de los grupos en estudio.",
      "choices": ["5,1", "5,4", "5,6", "5,7", "6,4"],
      "visual": "<svg class=\"ufe-main-diagram ufe-pie-diagram\" viewBox=\"0 0 520 400\" role=\"img\" aria-label=\"Gráfico circular de Baby Boomers, Generación X, Millennials y Generación Z\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><circle cx=\"250\" cy=\"195\" r=\"145\"/><path d=\"M250 195V50M250 195L335.2 77.7M250 195L367.3 280.2M250 195L164.8 312.3\"/><path d=\"M250 160A35 35 0 0 1 270.6 166.7\"/><path d=\"M222 216A35 35 0 0 1 216.7 184.2\"/></g><g fill=\"currentColor\" font-size=\"22\" text-anchor=\"middle\"><text x=\"278\" y=\"101\"><tspan x=\"278\">Baby</tspan><tspan x=\"278\" dy=\"23\">boomers</tspan></text><text x=\"346\" y=\"190\"><tspan x=\"346\">Generación X</tspan></text><text x=\"272\" y=\"280\"><tspan x=\"272\">Millennials</tspan><tspan x=\"272\" dy=\"24\">25 %</tspan></text><text x=\"151\" y=\"170\"><tspan x=\"151\">Generación Z</tspan><tspan x=\"151\" dy=\"24\">40 %</tspan></text><text x=\"263\" y=\"155\" font-size=\"19\">α°</text><text x=\"208\" y=\"216\" font-size=\"19\">(4α)°</text></g></svg>"
    },
    {
      "id": 11,
      "course": "Aritmética",
      "topic": "Distribución de frecuencias",
      "frequency": "alta",
      "passage": "",
      "text": "La tabla de distribución de frecuencias muestra la cantidad de obreros con defectos visuales, según su edad:<span class=\"ufe-statement-list\"><span>Determine si las siguientes proposiciones son verdaderas (V) o falsas (F):</span><span><b>I.</b> Los obreros con defectos visuales comprendidos de 30 a 39 años representan el 20 % del total de obreros con defectos visuales.</span><span><b>II.</b> La cantidad de obreros de 40 o más años son más de la mitad del total de obreros.</span><span><b>III.</b> La cantidad de obreros con defectos visuales es 500.</span></span>Señale la secuencia correcta.",
      "choices": ["VFF", "FFF", "VFV", "VVF", "VVV"],
      "visual": "<div class=\"ufe-data-table-wrap\"><table class=\"ufe-data-table\" aria-label=\"Distribución de frecuencias de obreros por edad\"><thead><tr><th>Edad</th><th>Frecuencia</th></tr></thead><tbody><tr><td>18–19</td><td>40</td></tr><tr><td>20–29</td><td>70</td></tr><tr><td>30–39</td><td>80</td></tr><tr><td>40–49</td><td>100</td></tr><tr><td>50–59</td><td>110</td></tr></tbody></table></div>"
    },
    {
      "id": 12,
      "course": "Aritmética",
      "topic": "Números decimales periódicos",
      "frequency": "alta",
      "passage": "",
      "text": "Si <span class=\"ufe-display-equation\"><span class=\"ufe-frac\"><span><i>a</i></span><span>37</span></span> + <span class=\"ufe-frac\"><span><i>n</i></span><span>9</span></span> = 0,<span class=\"ufe-overline\">(n+1)a0</span></span>calcule el valor de <i>n</i> + <i>a</i>.",
      "choices": ["5", "6", "8", "10", "11"],
      "visual": ""
    },
    {
      "id": 13,
      "course": "Aritmética",
      "topic": "Media aritmética y media geométrica",
      "frequency": "alta",
      "passage": "",
      "text": "La media aritmética de dos números naturales es 15 y su media geométrica es 12. Halle la diferencia de dichos números.",
      "choices": ["12", "16", "18", "24", "30"],
      "visual": ""
    },
    {
      "id": 14,
      "course": "Aritmética",
      "topic": "Media aritmética y varianza",
      "frequency": "alta",
      "passage": "",
      "text": "Debido a un reclamo efectuado por un grupo de alumnos del curso de química se ha decidido aumentarles 5 puntos en el examen final. Respecto a las nuevas notas (puntajes) indique el valor de verdad de las siguientes proposiciones:<span class=\"ufe-statement-list\"><span><b>I.</b> La varianza disminuye.</span><span><b>II.</b> La media aritmética aumenta.</span><span><b>III.</b> El cociente VAR/MA aumenta (MA: Media Aritmética y VAR: Varianza).</span></span>",
      "choices": ["FVF", "FVV", "VFV", "VVF", "VVV"],
      "visual": ""
    },
    {
      "id": 15,
      "course": "Aritmética",
      "topic": "Interés simple",
      "frequency": "alta",
      "passage": "",
      "text": "Sophia impone un capital a una tasa de interés simple del 6 % anual, recibiendo al cabo de 4 años un monto de 12 400 dólares. Calcule el valor del capital en dólares.",
      "choices": ["1000", "12 000", "5000", "10 000", "14 000"],
      "visual": ""
    },
    {
      "id": 16,
      "course": "Aritmética",
      "topic": "Vencimiento común",
      "frequency": "alta",
      "passage": "",
      "text": "Determina el tiempo de vencimiento común de tres letras de cambio de valores nominales iguales cuyos tiempos de vencimiento son: 24 días, 72 días y 5 meses.",
      "choices": ["86", "82", "85", "83", "84"],
      "visual": ""
    },
    {
      "id": 17,
      "course": "Aritmética",
      "topic": "Series telescópicas",
      "frequency": "alta",
      "passage": "",
      "text": "Considere <span class=\"ufe-display-equation\"><i>a</i>(<i>n</i>) = 1/2 + 1/6 + 1/12 + 1/20 + ⋯ <small>(<i>n</i> − 1 sumandos)</small></span>Determine el valor de <i>a</i>(50) − 0,01.",
      "choices": ["0,96", "0,98", "0,95", "0,99", "0,97"],
      "visual": ""
    },
    {
      "id": 18,
      "course": "Aritmética",
      "topic": "Numeración y raíz cúbica",
      "frequency": "alta",
      "passage": "",
      "text": "Al extraer la raíz cúbica del número <span class=\"ufe-overline\">abc</span> se obtiene <i>p</i> de raíz y 37 de residuo, pero al extraer la raíz cúbica del número <span class=\"ufe-overline\">cba</span> se obtiene (<i>p</i> + 1) de raíz y 45 de residuo. Entonces el valor de <span class=\"ufe-display-equation\"><i>S</i> = |2<i>a</i> − <i>b</i> − <i>c</i> + <i>p</i>|</span> es:",
      "choices": ["4", "0", "2", "1", "3"],
      "visual": ""
    },
    {
      "id": 19,
      "course": "Álgebra",
      "topic": "Rango de una función cuadrática",
      "frequency": "alta",
      "passage": "",
      "text": "La función <i>f</i>: ℝ → ℝ definida por <i>f</i>(<i>x</i>) = 2<i>x</i>² + 4<i>x</i> + 1, es tal que Ran(<i>f</i>) = [<i>a</i>, +∞). Determine <i>a</i>³ + <i>a</i>².",
      "choices": ["−2", "−1", "0", "1", "3"],
      "visual": ""
    },
    {
      "id": 20,
      "course": "Álgebra",
      "topic": "Sistemas lineales con infinitas soluciones",
      "frequency": "alta",
      "passage": "",
      "text": "Dado el sistema:<span class=\"ufe-equation-stack\"><span class=\"ufe-equation-row\"><span class=\"ufe-equation-body\">2<i>x</i>₁ + 3<i>x</i>₂ + 10<i>x</i>₃ = 1</span></span><span class=\"ufe-equation-row\"><span class=\"ufe-equation-body\">−2<i>x</i>₁ + 2<i>x</i>₂ + 12<i>x</i>₃ = 2</span></span><span class=\"ufe-equation-row\"><span class=\"ufe-equation-body\">4<i>x</i>₁ + <i>x</i>₂ − 2<i>x</i>₃ = −1</span></span></span>Determine cuál de las siguientes expresiones paramétricas representa al conjunto solución:<span class=\"ufe-parametric-list\"><span><b>I.</b> <i>x</i>₁ = −2/5 − <i>t</i>; &nbsp; <i>x</i>₂ = −13/5 + 2<i>t</i>; &nbsp; <i>x</i>₃ = −5<i>t</i>; &nbsp; <i>t</i> ∈ ℝ</span><span><b>II.</b> <i>x</i>₁ = −2/5 + <i>t</i>; &nbsp; <i>x</i>₂ = 8/5 − <i>t</i>; &nbsp; <i>x</i>₃ = −5<i>t</i> + 1; &nbsp; <i>t</i> ∈ ℝ</span><span><b>III.</b> <i>x</i>₁ = −2/5 + (8/5)<i>t</i>; &nbsp; <i>x</i>₂ = 3/5 − (22/5)<i>t</i>; &nbsp; <i>x</i>₃ = <i>t</i>; &nbsp; <i>t</i> ∈ ℝ</span></span>Indique la alternativa correcta.",
      "choices": ["solo I", "solo II", "solo III", "I y II", "II y III"],
      "visual": ""
    },
    {
      "id": 21,
      "course": "Álgebra",
      "topic": "Valores propios de matrices",
      "frequency": "alta",
      "passage": "",
      "text": "En una matriz cuadrada <i>A</i>, se denomina valor propio de <i>A</i>, a los valores <i>x</i>, que resuelvan la ecuación siguiente:<span class=\"ufe-display-equation\">|<i>A</i> − <i>xI</i>| = 0</span>donde <i>I</i> es la matriz identidad. Dadas las siguientes proposiciones:<span class=\"ufe-statement-list\"><span><b>I.</b> <i>A</i> y <i>A</i><sup>T</sup> poseen los mismos valores propios.</span><span><b>II.</b> <i>A</i> = <span class=\"ufe-matrix\"><span>3</span><span>0</span><span>0</span><span>3</span></span> y <i>B</i> = <span class=\"ufe-matrix\"><span>5</span><span>0</span><span>0</span><span>5</span></span> tienen los mismos valores propios.</span><span><b>III.</b> Toda matriz simétrica, de términos reales no nulos de orden 2 × 2, posee dos valores propios reales y diferentes.</span></span>Indique la alternativa correcta.",
      "choices": ["solo I", "solo II", "solo III", "I, II y III", "I y III"],
      "visual": ""
    },
    {
      "id": 22,
      "course": "Álgebra",
      "topic": "Ecuaciones matriciales",
      "frequency": "alta",
      "passage": "",
      "text": "Dada la siguiente ecuación matricial, determine <i>X</i>.",
      "choices": ["Matriz A", "Matriz B", "Matriz C", "Matriz D", "Matriz E"],
      "visual": "<div class=\"ufe-matrix-equation\"><span class=\"ufe-matrix\"><span>1</span><span>1</span><span>0</span><span>1</span></span><i>X</i><span class=\"ufe-matrix\"><span>0</span><span>1</span><span>1</span><span>1</span></span><span>=</span><span class=\"ufe-matrix\"><span>1</span><span>2</span><span>3</span><span>4</span></span></div><div class=\"ufe-matrix-choice-grid\"><div><b>A</b><span class=\"ufe-matrix\"><span>−4</span><span>2</span><span>−1</span><span>3</span></span></div><div><b>B</b><span class=\"ufe-matrix\"><span>0</span><span>−2</span><span>1</span><span>3</span></span></div><div><b>C</b><span class=\"ufe-matrix\"><span>0</span><span>−2</span><span>−1</span><span>−3</span></span></div><div><b>D</b><span class=\"ufe-matrix\"><span>−4</span><span>−2</span><span>−1</span><span>3</span></span></div><div><b>E</b><span class=\"ufe-matrix\"><span>0</span><span>2</span><span>1</span><span>3</span></span></div></div>"
    },
    {
      "id": 23,
      "course": "Álgebra",
      "topic": "Series geométricas infinitas",
      "frequency": "alta",
      "passage": "",
      "text": "La suma de:<span class=\"ufe-display-equation\"><span class=\"ufe-sum\"><span>∞</span><b>∑</b><span><i>i</i>=1</span></span>(1/4)<sup><i>i</i></sup> + <span class=\"ufe-sum\"><span>∞</span><b>∑</b><span><i>i</i>=0</span></span>(3/4)<sup><i>i</i></sup></span>es:",
      "choices": ["13/3", "11/3", "19/3", "8/3", "17/3"],
      "visual": ""
    },
    {
      "id": 24,
      "course": "Álgebra",
      "topic": "Funciones exponencial y logarítmica",
      "frequency": "alta",
      "passage": "",
      "text": "<i>g</i>(<i>x</i>) = Ln(<i>x</i>), indique la secuencia correcta después de determinar si la proposición es verdadera (V) o falsa (F).<span class=\"ufe-statement-list\"><span><b>I.</b> Para todo <i>x</i> &gt; 0 se tiene Log₄(2<i>x</i> + 1) &gt; Log₂(<i>x</i> + 1).</span><span><b>II.</b> La función logaritmo es creciente.</span><span><b>III.</b> La función exponencial es creciente.</span></span>",
      "choices": ["VFF", "VFV", "VVV", "FFF", "FVF"],
      "visual": ""
    },
    {
      "id": 25,
      "course": "Álgebra",
      "topic": "Sucesiones y convergencia",
      "frequency": "alta",
      "passage": "",
      "text": "Dada la siguiente sucesión (donde [<i>x</i>] representa el máximo entero de <i>x</i>):<span class=\"ufe-display-equation\"><i>x</i>ₙ = ⌊<i>n</i>(−1)<sup><i>n</i></sup>/<i>e</i><sup><i>n</i></sup>⌋</span>¿Cuál de las siguientes afirmaciones es verdadera con respecto a <i>x</i>ₙ?",
      "choices": ["Es constante a partir de cierto n.", "Es decreciente.", "No es convergente.", "Es creciente.", "Converge a 0."],
      "visual": ""
    },
    {
      "id": 26,
      "course": "Álgebra",
      "topic": "Ecuaciones logarítmicas",
      "frequency": "alta",
      "passage": "",
      "text": "Determine el conjunto solución de la ecuación:<span class=\"ufe-display-equation\">Log<sub>(5−<i>x</i>)</sub>(35 − <i>x</i>³) = 3</span>",
      "choices": ["∅", "{2; 3; 4; 6}", "{3; 4}", "{2; 3}", "{2; 3; 4}"],
      "visual": ""
    },
    {
      "id": 27,
      "course": "Álgebra",
      "topic": "Programación lineal en poliedros",
      "frequency": "alta",
      "passage": "",
      "text": "Dado el problema:<span class=\"ufe-display-equation\">min<sub>x̄∈P</sub> <i>f</i>(x̄)</span>donde <i>P</i> es una pirámide <i>A</i> − <i>BCDE</i>. Si <span class=\"ufe-display-equation\">min<sub>x̄∈P</sub> <i>f</i>(x̄) = <i>f</i>(<i>A</i>)</span>siendo <i>f</i> una función lineal de la forma <i>f</i>(x̄) = <i>ax</i> + <i>by</i> + <i>cz</i> y además se cumple que:<span class=\"ufe-display-equation\"><i>f</i>(<i>A</i>) = <i>f</i>(<i>B</i>) = <i>f</i>(<i>C</i>)</span>Indique cuál de las siguientes proposiciones es correcta:",
      "choices": ["mínimo en P de f(x̄) = máximo en P de f(x̄) = f(A)", "mínimo en P de f(x̄) = f(A) < máximo en P de f(x̄)", "f(A) = f(B) = f(C) < f(x̄), para x̄ ∉ {A, B, C}", "f(A) < f(x̄), para todo x̄ ∈ P", "f(A) = f(B) = f(C) > f(x̄), para x̄ ∉ {A, B, C}"],
      "visual": ""
    },
    {
      "id": 28,
      "course": "Geometría",
      "topic": "Circunferencias y pentágono regular",
      "frequency": "alta",
      "passage": "",
      "text": "Un pentágono regular <i>ABCDE</i> está inscrito en una circunferencia de centro <i>O</i>. Con centro en el vértice <i>A</i> y radio <i>AO</i> se traza la circunferencia <i>C</i>₁ que interseca el arco <i>AE</i> en el punto <i>P</i>. Del vértice <i>E</i> se traza el segmento tangente <i>EQ</i> a la circunferencia <i>C</i>₁ (<i>Q</i> punto de tangencia). Y con centro en <i>E</i> y radio <i>EQ</i>, se traza la circunferencia <i>C</i>₂ que interseca el arco <i>ED</i> en el punto <i>M</i>. Calcule en grados sexagesimales la medida del arco <i>MEP</i>.",
      "choices": ["12", "24", "30", "36", "48"],
      "visual": ""
    },
    {
      "id": 29,
      "course": "Geometría",
      "topic": "Poliedros y fórmula de Euler",
      "frequency": "alta",
      "passage": "",
      "text": "Un poliedro convexo está formado por seis regiones cuadrangulares y doce regiones triangulares. ¿Cuál es el número de vértices de este poliedro?",
      "choices": ["10", "11", "12", "13", "14"],
      "visual": ""
    },
    {
      "id": 30,
      "course": "Geometría",
      "topic": "Medianas de un triángulo rectángulo",
      "frequency": "alta",
      "passage": "",
      "text": "En un triángulo rectángulo, la mediana relativa a un cateto interseca perpendicularmente a la mediana relativa a la hipotenusa. Si la longitud de la hipotenusa es 5√3 <i>u</i>, entonces la longitud (en <i>u</i>) de uno de los catetos es:",
      "choices": ["2", "3", "5", "6", "10"],
      "visual": ""
    },
    {
      "id": 31,
      "course": "Geometría",
      "topic": "Volumen de una pirámide regular",
      "frequency": "alta",
      "passage": "",
      "text": "En una pirámide cuadrangular regular, la arista lateral y la arista básica miden cada una 2<i>a</i>. Calcule el volumen del sólido limitado por la pirámide.",
      "choices": ["4√2a³", "(8/3)a³", "(4√3/3)a³", "(4√2/3)a³", "(√2/3)a³"],
      "visual": ""
    },
    {
      "id": 32,
      "course": "Geometría",
      "topic": "Semejanza y transversal en triángulo isósceles",
      "frequency": "alta",
      "passage": "",
      "text": "En un triángulo <i>ABC</i> isósceles (<i>AB</i> = <i>BC</i>), el lado <i>BC</i> se prolonga hasta el punto <i>D</i> y al trazar desde <i>D</i> un segmento adecuado, interseca a los lados <i>AC</i> y <i>AB</i> en los puntos <i>F</i> y <i>E</i>, respectivamente. De este modo, <i>AE</i> = 50 cm, <i>EF</i> = 80 cm y <i>CD</i> = 60 cm. Calcule la longitud (en cm) del segmento <i>DF</i>.",
      "choices": ["96", "98", "100", "92", "94"],
      "visual": ""
    },
    {
      "id": 33,
      "course": "Geometría",
      "topic": "Volumen de un tronco de cono",
      "frequency": "alta",
      "passage": "",
      "text": "Una cuerda trazada en la base de un cono circular recto de 4 m de altura mide 8 m y la distancia de la cuerda al centro del círculo es 2 m, luego a 2 m de la base se traza un plano paralelo a dicha base, obteniéndose un tronco de cono. Calcule el volumen (en m³) del tronco de cono.",
      "choices": ["20π/3", "35π/3", "40π/3", "70π/3", "71π/3"],
      "visual": ""
    },
    {
      "id": 34,
      "course": "Geometría",
      "topic": "Segmento entre puntos medios",
      "frequency": "alta",
      "passage": "",
      "text": "En la figura, si m∠<i>BAD</i> = α, m∠<i>ADC</i> = 90° − α, <i>AB</i> = 6 cm y <i>CD</i> = 8 cm, calcule (en cm) la longitud de <i>MN</i>.",
      "choices": ["5", "4", "7", "1", "3"],
      "visual": "<svg class=\"ufe-main-diagram\" viewBox=\"0 0 680 390\" role=\"img\" aria-label=\"Figura geométrica con A, N y D colineales; M punto medio de BC\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M75 320H605L515 70L330 95L175 115L75 320Z\"/><path d=\"M175 115L330 320L515 70\"/><path d=\"M330 95V320\"/><path d=\"M238 98l4 13M245 96l4 13M410 76l4 13M417 75l4 13\"/></g><g fill=\"currentColor\"><circle cx=\"205\" cy=\"320\" r=\"5\"/><circle cx=\"455\" cy=\"320\" r=\"5\"/></g><g fill=\"currentColor\" font-size=\"24\" font-weight=\"600\"><text x=\"52\" y=\"348\">A</text><text x=\"158\" y=\"108\">B</text><text x=\"516\" y=\"57\">C</text><text x=\"610\" y=\"348\">D</text><text x=\"312\" y=\"88\">M</text><text x=\"318\" y=\"350\">N</text></g></svg>"
    },
    {
      "id": 35,
      "course": "Geometría",
      "topic": "Hexágono regular y áreas",
      "frequency": "alta",
      "passage": "",
      "text": "Un hacendado compra un terreno en forma de hexágono regular de área total 18√3 m². Luego se cerca el terreno que se encuentra dentro del polígono que se obtiene al unir los puntos medios de los lados consecutivos del terreno original. Una vez cercado el terreno, contrata a un pintor para pintar la parte exterior del cerco que tiene 2 m de altura. Sabiendo que 1 galón de pintura alcanza para 4 m², determine la cantidad de galones que se necesitan para pintar lo solicitado por el hacendado.",
      "choices": ["3√3", "18", "9", "15", "18√3"],
      "visual": ""
    },
    {
      "id": 36,
      "course": "Geometría",
      "topic": "Rectas y planos en el espacio",
      "frequency": "alta",
      "passage": "",
      "text": "¿Cuál de las siguientes proposiciones es verdadera?",
      "choices": ["Si L₁ y L₂ son rectas paralelas y sean π₁ y π₂ planos que las contienen, respectivamente, de modo que se intersectan. Entonces la recta de intersección es paralela a L₁ y L₂.", "Si 2 planos son intersectados por un tercer plano, entonces las rectas de intersección son paralelas.", "Si los planos π₁ y π₂ son perpendiculares a las rectas L₁ y L₂, respectivamente, entonces dichos planos son secantes.", "Si L₁ y L₂ son rectas paralelas y sean π₁ y π₂ planos que las contienen, respectivamente, de modo que se intersectan. Entonces la recta de intersección es paralela solo a L₁ o solo a L₂.", "Si desde un punto exterior a un plano se traza una recta L perpendicular a una recta contenida en el plano, entonces la recta es perpendicular al plano."],
      "visual": ""
    },
    {
      "id": 37,
      "course": "Física",
      "topic": "Trabajo de una fuerza variable",
      "frequency": "alta",
      "passage": "",
      "text": "A un bloque de masa <i>M</i> en reposo sobre una superficie horizontal lisa y ubicado en el origen de coordenadas, se le aplica una fuerza de la forma <span class=\"ufe-display-equation\"><i>F</i>⃗(<i>x</i>) = (10 − 2<i>x</i>) î N</span>que varía con la posición <i>x</i> expresada en metros. ¿Cuál es el trabajo (en J) realizado por la fuerza <i>F</i>⃗ desde <i>x</i> = 0 m hasta <i>x</i> = 7 m?",
      "choices": ["14", "17", "21", "23", "25"],
      "visual": ""
    },
    {
      "id": 38,
      "course": "Física",
      "topic": "Nivel de intensidad sonora",
      "frequency": "alta",
      "passage": "",
      "text": "Un decibelímetro mide un nivel de intensidad sonora de 120 decibeles. ¿Cuál es el valor correspondiente de la intensidad sonora en W/m²?",
      "choices": ["10⁻⁴", "10⁻³", "10⁻²", "10⁻¹", "1"],
      "visual": ""
    },
    {
      "id": 39,
      "course": "Física",
      "topic": "Principio de Arquímedes",
      "frequency": "alta",
      "passage": "",
      "text": "Un trozo de madera con 0,60 m de largo, 0,25 m de ancho y 0,08 m de espesor, cuya densidad es 600 kg/m³, flota parcialmente en la superficie del agua. Determine aproximadamente el volumen (en unidades de 10⁻⁴ m³) de un trozo de plomo (ρ<sub>plomo</sub> = 11 300 kg/m³) que debe sujetarse en la base de la madera para hundirla de modo que la cara superior de la madera se encuentre al mismo nivel del agua. Considere: ρ<sub>agua</sub> = 1000 kg/m³.",
      "choices": ["3,2", "3,9", "4,7", "5,6", "6,7"],
      "visual": ""
    },
    {
      "id": 40,
      "course": "Física",
      "topic": "Movimiento de una carga en un campo magnético",
      "frequency": "alta",
      "passage": "",
      "text": "Un electrón cuya velocidad es <span class=\"ufe-display-equation\"><i>v</i>⃗ = (3î + 4ĵ) × 10⁵ m/s</span>ingresa a una región donde el campo magnético es <span class=\"ufe-display-equation\"><i>B</i>⃗ = 10⁻³ k̂ T.</span>Calcule aproximadamente el radio de curvatura (en mm) de la trayectoria que describe el electrón. Considere la carga del electrón igual a 1,6 × 10⁻¹⁹ C y la masa del electrón igual a 9,11 × 10⁻³¹ kg.",
      "choices": ["1,7", "2,3", "2,8", "3,9", "5,4"],
      "visual": ""
    },
    {
      "id": 41,
      "course": "Física",
      "topic": "Asociación de resistencias",
      "frequency": "alta",
      "passage": "",
      "text": "Calcule la intensidad de corriente <i>I</i> (en A) que circula a través de la rama superior de la red de resistencias que se muestra en la figura. La batería tiene resistencia despreciable. Considere <i>R</i> = 3 Ω.",
      "choices": ["4", "6", "8", "10", "12"],
      "visual": "<svg class=\"ufe-main-diagram\" viewBox=\"0 0 680 310\" role=\"img\" aria-label=\"Circuito con dos ramas paralelas, cada una con dos resistencias R, conectado a una batería de 48 voltios\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M95 75H145l12-18 20 36 20-36 20 36 20-36 12 18h92l12-18 20 36 20-36 20 36 20-36 12 18h90V235H385\"/><path d=\"M95 75V155h50l12-18 20 36 20-36 20 36 20-36 12 18h92l12-18 20 36 20-36 20 36 20-36 12 18h90V75\"/><path d=\"M95 155V235H295\"/><path d=\"M295 213V257M323 222V248M323 235H385\"/></g><g fill=\"currentColor\" font-size=\"25\" font-weight=\"600\"><text x=\"190\" y=\"48\">R</text><text x=\"386\" y=\"48\">R</text><text x=\"190\" y=\"133\">R</text><text x=\"386\" y=\"133\">R</text><text x=\"294\" y=\"293\">48 V</text><text x=\"112\" y=\"61\">I</text></g><path d=\"M110 52h42\" stroke=\"currentColor\" stroke-width=\"3\"/><path d=\"M152 52l-12-7v14z\" fill=\"currentColor\"/></svg>"
    },
    {
      "id": 42,
      "course": "Física",
      "topic": "Calorimetría y cambios de fase",
      "frequency": "alta",
      "passage": "",
      "text": "Calcule la masa mínima aproximada (en g) de vapor de agua que se necesita para descongelar 400 g de hielo a 0 °C y llevarlo hasta 100 °C (sin convertirse en vapor).<span class=\"ufe-equation-stack\"><span><i>L</i><sub>f</sub> = 333 kJ/kg</span><span><i>L</i><sub>v</sub> = 2260 kJ/kg</span><span><i>c</i> = 4,18 kJ/(kg · K)</span></span>",
      "choices": ["102,9", "112,9", "122,9", "132,9", "142,9"],
      "visual": ""
    },
    {
      "id": 43,
      "course": "Física",
      "topic": "Efecto fotoeléctrico",
      "frequency": "alta",
      "passage": "",
      "text": "Cuando sobre una superficie metálica inciden ondas electromagnéticas con longitud de onda λ, la energía de los electrones más energéticos es <i>E</i>. Para que la energía cinética de los electrones más energéticos siga siendo <i>E</i>, encuentre la longitud de onda de la radiación que debe incidir sobre otra superficie metálica, cuya función trabajo es 20 % mayor que la anterior. Considere que <i>h</i> es la constante de Planck y <i>c</i> la velocidad de la luz en el vacío.",
      "choices": ["chλ/(5ch − λE)", "5chλ/(5ch + λE)", "5chλ/(5ch − λE)", "chλ/(6ch − λE)", "5chλ/(6ch − λE)"],
      "visual": ""
    },
    {
      "id": 44,
      "course": "Física",
      "topic": "Teorema trabajo-energía",
      "frequency": "alta",
      "passage": "",
      "text": "Un bloque de 10 kg de masa se mueve sobre una superficie horizontal sin fricción, con rapidez constante de 20 m/s, hasta que ingresa a una superficie horizontal rugosa. Determine el trabajo realizado por la fuerza de fricción (en kJ), hasta que el bloque se detenga.",
      "choices": ["−2,00", "−2,50", "−1,50", "−1,00", "−0,50"],
      "visual": ""
    },
    {
      "id": 45,
      "course": "Física",
      "topic": "Campo magnético de un solenoide",
      "frequency": "alta",
      "passage": "",
      "text": "Se tiene un solenoide de 90 cm de longitud y de 1,2 cm de radio. Si por cada centímetro de longitud se tienen 100 vueltas, calcule, en A, la corriente eléctrica en el solenoide sabiendo que en su eje el campo magnético es de 10π mT. Considere μ₀ = 4π × 10⁻⁷ T · m/A.",
      "choices": ["0,5", "1,5", "2,5", "3,5", "4,5"],
      "visual": ""
    },
    {
      "id": 46,
      "course": "Física",
      "topic": "Espejos esféricos",
      "frequency": "alta",
      "passage": "",
      "text": "Un objeto se coloca frente a un espejo convexo de 5 cm de distancia focal y la imagen se forma a 3 cm del vértice. Calcule en centímetros la distancia del objeto al vértice del espejo.",
      "choices": ["5,5", "6,5", "7,5", "8,5", "9,5"],
      "visual": ""
    },
    {
      "id": 47,
      "course": "Química",
      "topic": "Celdas galvánicas y potenciales de reducción",
      "frequency": "alta",
      "passage": "",
      "text": "La celda de óxido de plata-zinc que se emplea en los aparatos auditivos y en los relojes eléctricos se basa en las siguientes semirreacciones:<span class=\"ufe-equation-stack\"><span class=\"ufe-equation-row\"><span class=\"ufe-equation-body\">Zn²⁺<sub>(ac)</sub> + 2e⁻ → Zn<sub>(s)</sub></span><b>E° = −0,763 V</b></span><span class=\"ufe-equation-row\"><span class=\"ufe-equation-body\">Ag₂O<sub>(s)</sub> + H₂O<sub>(ℓ)</sub> + 2e⁻ → 2Ag<sub>(s)</sub> + 2OH⁻<sub>(ac)</sub></span><b>E° = +0,344 V</b></span></span>Indique la especie química que se oxida y la especie química que se reduce, respectivamente, en la celda durante la descarga.",
      "choices": ["Ag, Zn²⁺", "Zn, Ag", "Zn, H₂O", "Ag₂O, Zn²⁺", "Zn, Ag₂O"],
      "visual": ""
    },
    {
      "id": 48,
      "course": "Química",
      "topic": "Funciones orgánicas en las penicilinas",
      "frequency": "alta",
      "passage": "",
      "text": "Algunas penicilinas comunes son la amoxicilina y la penicilina G, cuyas estructuras se presentan a continuación. Dadas las siguientes proposiciones respecto a las estructuras mostradas:<span class=\"ufe-statement-list\"><span><b>I.</b> En una estructura aparece la función alcohol y en la otra no.</span><span><b>II.</b> En ambas estructuras aparece la función aldehído.</span><span><b>III.</b> Una estructura contiene una amina primaria y la otra no.</span></span>Indique la alternativa correcta.",
      "choices": ["solo I", "solo II", "solo III", "I y II", "I, II y III"],
      "visual": "<svg class=\"ufe-main-diagram\" viewBox=\"0 100 405 420\" role=\"img\" aria-label=\"Estructuras químicas de la amoxicilina y la penicilina G\"><image href=\"/assets/simulacros/admision/quimica-penicilinas-estructuras.png?v=1\" x=\"0\" y=\"0\" width=\"405\" height=\"810\" preserveAspectRatio=\"xMidYMid meet\"/></svg>"
    },
    {
      "id": 49,
      "course": "Química",
      "topic": "Equilibrio químico y principio de Le Châtelier",
      "frequency": "alta",
      "passage": "",
      "text": "Dada la siguiente reacción química:<span class=\"ufe-display-equation\">2NH₃<sub>(g)</sub> ⇌ N₂<sub>(g)</sub> + 3H₂<sub>(g)</sub></span>con constante de equilibrio <i>K</i><sub>c</sub> = 0,83 a 375 °C, se establecen las siguientes proposiciones:<span class=\"ufe-statement-list\"><span><b>I.</b> La constante <i>K</i><sub>p</sub> es igual a la constante <i>K</i><sub>c</sub>.</span><span><b>II.</b> Si se adiciona un catalizador al sistema en equilibrio, la reacción se desplaza hacia la izquierda.</span><span><b>III.</b> Al duplicar el volumen del sistema en equilibrio, la reacción se desplaza hacia la derecha.</span></span>Indique la alternativa correcta.",
      "choices": ["solo II", "solo III", "I y II", "I y III", "II y III"],
      "visual": ""
    },
    {
      "id": 50,
      "course": "Química",
      "topic": "Electrólisis y ley de Faraday",
      "frequency": "alta",
      "passage": "",
      "text": "El niquelado es un proceso utilizado con la finalidad de proteger a piezas metálicas contra la corrosión, teniendo el valor agregado de un mejor acabado. Calcule la masa (en gramos) de níquel depositada sobre una placa metálica, si ella se sumerge dentro de una celda electrolítica que contiene una solución acuosa de NiCl₂, por la cual pasa una corriente de 5 A durante 10 minutos.<span class=\"ufe-equation-stack\"><span>Datos: masa atómica del Ni = 58,7</span><span>1 F = 96 500 C</span></span>",
      "choices": ["0,03", "0,91", "1,25", "1,50", "2,00"],
      "visual": ""
    },
    {
      "id": 51,
      "course": "Química",
      "topic": "Química ambiental y capa de ozono",
      "frequency": "alta",
      "passage": "",
      "text": "El ingeniero químico mexicano Mario Molina recibió el premio Nobel de Química (año 1995), debido al estudio de la destrucción de la capa de ozono. Con respecto a la capa de ozono, determine verdadero (V) o falso (F) para cada una de las siguientes proposiciones:<span class=\"ufe-statement-list\"><span><b>I.</b> Nos protege de la radiación infrarroja.</span><span><b>II.</b> Se destruye debido a los radicales del cloro.</span><span><b>III.</b> Su destrucción genera en los humanos problemas en la piel.</span></span>Marque la alternativa correcta.",
      "choices": ["VVV", "VFV", "VFF", "FFF", "FVV"],
      "visual": ""
    },
    {
      "id": 52,
      "course": "Química",
      "topic": "Ecuación de los gases ideales",
      "frequency": "alta",
      "passage": "",
      "text": "La atmósfera de Marte está formada principalmente por dióxido de carbono (CO₂). Si una muestra de 17,6 g de este gas es atrapada por el Mars Exploration Rover en un recipiente de 8,2 L a 7 °C, calcule la presión en atm que ejerce dicho gas en el recipiente.<span class=\"ufe-equation-stack\"><span>Datos: <i>R</i> = 0,082 atm · L · mol⁻¹ · K⁻¹</span><span>Masa molar del CO₂ = 44 g/mol</span></span>",
      "choices": ["13,56", "49,28", "2,24", "1,12", "1,23"],
      "visual": ""
    },
    {
      "id": 53,
      "course": "Química",
      "topic": "Constante de acidez",
      "frequency": "alta",
      "passage": "",
      "text": "En un experimento realizado para determinar la constante de acidez de una solución 3 × 10⁻² M de un ácido monoprótico, se encontró que la concentración de H₃O⁺ es 5 × 10⁻⁵ M. Calcule la constante de acidez.",
      "choices": ["8,3 × 10⁻⁸", "8,3 × 10⁻⁷", "8,3 × 10⁻⁶", "8,3 × 10⁻⁵", "8,3 × 10⁻⁴"],
      "visual": ""
    },
    {
      "id": 54,
      "course": "Química",
      "topic": "Propiedades periódicas",
      "frequency": "alta",
      "passage": "",
      "text": "Respecto a las propiedades periódicas, ¿cuál de las siguientes proposiciones es la correcta?",
      "choices": ["El radio atómico se mantiene constante en todos los elementos de un mismo período.", "La electronegatividad es la energía que un átomo libera cuando atrae electrones hacia sí mismo, estando químicamente enlazado a otro átomo.", "La energía de ionización, también denominada potencial de ionización, disminuye a medida que el número atómico aumenta en un grupo en la tabla periódica.", "El carácter metálico aumenta en un período de izquierda a derecha.", "Para un elemento A, se cumple que el radio del catión A⁺ es mayor que el radio del átomo A."],
      "visual": ""
    },
    {
      "id": 55,
      "course": "Química",
      "topic": "Propiedades intensivas y extensivas",
      "frequency": "alta",
      "passage": "",
      "text": "El ácido acetilsalicílico «aspirina» es un compuesto que puede ser sintetizado en el laboratorio, obteniéndose como un sólido de color blanco, cuyo punto de fusión es de 138 °C, su solubilidad en el agua es de 1 mg/mL a 20 °C, presenta una densidad de 1,4 g/cm³ y una masa molar de 180,16 g/mol. Considerando las propiedades subrayadas, indique cuántas propiedades extensivas e intensivas existen, respectivamente.",
      "choices": ["4, 0", "0, 4", "3, 1", "1, 3", "2, 2"],
      "visual": ""
    },
    {
      "id": 56,
      "course": "Química",
      "topic": "Nomenclatura de compuestos aromáticos",
      "frequency": "alta",
      "passage": "",
      "text": "Se consideran compuestos aromáticos a aquellos que, generalmente, derivan del benceno. Indique el nombre del siguiente compuesto orgánico:",
      "choices": ["1-etil-5-metilbenceno", "3-metil-1-etilbenceno", "1-etil-3-metilbenceno", "1-metil-3-etilbenceno", "3-etil-1-metilbenceno"],
      "visual": "<svg class=\"ufe-main-diagram\" viewBox=\"0 0 600 330\" role=\"img\" aria-label=\"Anillo de benceno con grupos etilo y metilo en posiciones meta\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M260 70H340L382 140L340 210H260L218 140Z\"/><path d=\"M273 87H327M358 142l-28 48M267 190l-28-46\"/><path d=\"M260 70L220 25\"/><path d=\"M260 210L205 250L145 235\"/></g></svg>"
    }
  ]
};
  window.UNIVERSE_FINAL_EXAM_QUESTIONS = banks['admision-uni-2027-1'].questions;
})();
