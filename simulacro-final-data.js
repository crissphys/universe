(function () {
  'use strict';
  var banks = window.UNIVERSE_EXAM_BANKS = window.UNIVERSE_EXAM_BANKS || {};
  banks['admision-uni-2027-1'] = {
  "id": "admision-uni-2027-1",
  "title": "Simulacro de admisión UNI 2027-1",
  "shortTitle": "Admisión UNI 2027-1",
  "description": "Nuevo simulacro de admisión en desarrollo. Actualmente contiene el bloque de Trigonometría.",
  "status": "draft",
  "durationSeconds": 10800,
  "questions": [
    {
      "id": 1,
      "course": "Trigonometría",
      "topic": "Curvas paramétricas",
      "frequency": "alta",
      "passage": "",
      "text": "Grafique la curva definida por las ecuaciones paramétricas dadas:<span class=\"ufe-equation-stack\"><span><i>x</i> = sen <i>t</i> + cos <i>t</i> <b>(1)</b></span><span><i>y</i> = sen <i>t</i> − cos <i>t</i> <b>(2)</b></span></span>",
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
      "text": "Calcule el número de soluciones de la ecuación:<span class=\"ufe-display-equation\">| arccsc (<i>x</i>/2) | = √(<i>x</i>² − 2)</span>",
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
      "text": "Si se cumple las siguientes condiciones:<span class=\"ufe-equation-stack\"><span>cos 2θ = cot <i>y</i> + tan <i>x</i> <b>(1)</b></span><span>cot 2θ = cot <i>x</i> + tan <i>y</i> <b>(2)</b></span></span>halle el valor de:<span class=\"ufe-display-equation\">csc(2<i>x</i> − 2<i>y</i>) + 2/(1 + tan θ) + cot(2<i>y</i> − 2<i>x</i>)</span>",
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
      "visual": "<svg class=\"ufe-main-diagram\" viewBox=\"0 0 680 360\" role=\"img\" aria-label=\"Configuración geométrica con los puntos A, B, C, D, E, F, G y H\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M45 305H635L430 40L45 305Z\"/><path d=\"M45 305L215 38L635 305\"/><path d=\"M215 38V305M430 40V305\"/><path d=\"M45 305L430 206M215 172L635 305\"/><path d=\"M202 292H215V305M417 292H430V305\"/><path d=\"M197 67A33 33 0 0 0 211 92M414 72A34 34 0 0 1 430 96M436 98A35 35 0 0 1 457 73\"/><path d=\"M66 300A28 28 0 0 1 70 294M73 293A39 39 0 0 1 82 286\"/></g><g fill=\"currentColor\" font-size=\"22\" font-weight=\"600\"><text x=\"26\" y=\"329\">A</text><text x=\"202\" y=\"28\">B</text><text x=\"426\" y=\"27\">C</text><text x=\"642\" y=\"326\">D</text><text x=\"421\" y=\"329\">E</text><text x=\"206\" y=\"329\">F</text><text x=\"196\" y=\"166\">G</text><text x=\"437\" y=\"207\">H</text><text x=\"165\" y=\"105\">40°</text><text x=\"384\" y=\"105\">70°</text><text x=\"447\" y=\"122\">40°</text></g></svg>"
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
    }
  ]
};
  window.UNIVERSE_FINAL_EXAM_QUESTIONS = banks['admision-uni-2027-1'].questions;
})();
