export const EXAM_COUNT = 65;
export const EXAM_KEY = {
  "1": {
    "course": "Física",
    "topic": "Circuitos eléctricos",
    "answer": "16/3 W",
    "solution": "La condición de puente equilibrado exige 4/8 = 6/R, luego R = 12 Ω. La corriente de esa rama es 12/(6+12)=2/3 A y P=I²R=16/3 W."
  },
  "2": {
    "course": "Física",
    "topic": "Movimiento parabólico",
    "answer": "30(1+√2) m",
    "solution": "La ecuación vertical es −20=20t−5t², que da t=2+2√2 s. Como vₓ=15 m/s, el alcance es 15t=30(1+√2) m."
  },
  "3": {
    "course": "Física",
    "topic": "Inducción electromagnética",
    "answer": "0,80 C",
    "solution": "La fem motriz es ε=Bℓv=(0,80)(0,50)(2t)=0,80t V. Entonces i=ε/R=0,40t A y la carga es q=∫₀²0,40t dt=0,80 C."
  },
  "4": {
    "course": "Física",
    "topic": "Termodinámica",
    "answer": "(2/5)(1−ln2)",
    "solution": "Wneto=nRT−nRTln2=nRT(1−ln2). El único calor absorbido es Q₁=CpΔT=(5/2)nRT. La eficiencia es (2/5)(1−ln2)."
  },
  "5": {
    "course": "Física",
    "topic": "Óptica geométrica",
    "answer": "−2/3",
    "solution": "La primera lente forma imagen a 60 cm y m₁=−2. Para la segunda, esa imagen es objeto virtual a 20 cm: dₒ₂=−20 cm, dᵢ₂=20/3 cm y m₂=1/3. Así, m=m₁m₂=−2/3."
  },
  "6": {
    "course": "Física",
    "topic": "Estática de fluidos",
    "answer": "20/√3 N",
    "solution": "El exceso de empuje sobre el peso es (1000−600)(0,005)(10)=20 N. Las componentes verticales de las cuerdas cumplen 2Tsen60°=20; por tanto, T=20/√3 N."
  },
  "7": {
    "course": "Física",
    "topic": "Transformadores",
    "answer": "8/9 A",
    "solution": "El transformador entrega al secundario Pₛ=(48 V)(4 A)=192 W; los 8 V perdidos en la línea explican que la carga reciba 40 V, pero no cambian Pₛ. Como η=Pₛ/Pₚ=0,90, Iₚ=192/(0,90·240)=8/9 A."
  },
  "8": {
    "course": "Química",
    "topic": "Estequiometría y composición de mezclas",
    "answer": "13,35 g",
    "solution": "Si x e y son los moles de Mg y Al: 24x+27y=5,10 y x+(3/2)y=5,60/22,4=0,25. Al restar las ecuaciones equivalentes se obtiene y=0,10 mol y x=0,10 mol. Se forman 0,10 mol de AlCl₃: m=0,10·133,5=13,35 g."
  },
  "9": {
    "course": "Química",
    "topic": "Soluciones reguladoras",
    "answer": "4,39",
    "solution": "El HCl consume acetato: n(A⁻)=0,15 mol y n(HA)=0,35 mol. Así, pH=4,76+log(0,15/0,35)=4,76+log(3/7)≈4,39."
  },
  "10": {
    "course": "Química",
    "topic": "Equilibrio químico",
    "answer": "(17−√33)/32 M",
    "solution": "Si se forman x mol/L de B, [A]=1−2x. Entonces 4=x/(1−2x)², es decir 16x²−17x+4=0. Las raíces son (17±√33)/32; solo (17−√33)/32≈0,352 M satisface x<0,5."
  },
  "11": {
    "course": "Química",
    "topic": "Electroquímica",
    "answer": "1,0408 V",
    "solution": "n=2 y Q=[Zn²⁺]/[Cu²⁺]=100. Entonces E=1,10−(0,0592/2)log100=1,0408 V."
  },
  "12": {
    "course": "Química",
    "topic": "Isomería orgánica",
    "answer": "4",
    "solution": "Son pentan-1-ol, 2-metilbutan-1-ol, 3-metilbutan-1-ol y 2,2-dimetilpropan-1-ol."
  },
  "13": {
    "course": "Química",
    "topic": "Enlace químico y geometría molecular",
    "answer": "I, II y III",
    "solution": "XeF₄ tiene cuatro enlaces Xe−F y dos pares libres opuestos: seis dominios con geometría electrónica octaédrica. Los cuatro F forman un cuadrado plano y sus dipolos se cancelan."
  },
  "14": {
    "course": "Química",
    "topic": "Equilibrio de solubilidad",
    "answer": "2,15×10⁻⁴ M",
    "solution": "Si la solubilidad es s, [Ca²⁺]=s y [F⁻]=2s; Kps=4s³. Así, s=(10⁻¹¹)^(1/3)=2,15×10⁻⁴ M."
  },
  "15": {
    "course": "Álgebra",
    "topic": "Matrices y potencias",
    "answer": "864",
    "solution": "Como Aⁿ=[[1,n],[0,1]], A²⁰=[[1,20],[0,1]] y A⁻¹⁰=[[1,−10],[0,1]]. Así B=[[2,10],[0,2]]. Para una matriz triangular de Jordan, B⁵=[[32,5·2⁴·10],[0,32]]=[[32,800],[0,32]]. La suma pedida es 864."
  },
  "16": {
    "course": "Álgebra",
    "topic": "Polinomios y relaciones de raíces",
    "answer": "47/60",
    "solution": "Para P(x)=∏(x−r), se cumple P′(t)/P(t)=Σ1/(t−r). Con t=−2, la suma pedida es −P′(−2)/P(−2). Como P′(−2)=47 y P(−2)=−60, resulta 47/60."
  },
  "17": {
    "course": "Álgebra",
    "topic": "Logaritmos",
    "answer": "4+√2",
    "solution": "Sea y=log₂x. Entonces y+1/y=5/2, de donde y=2 o y=1/2. Así, x=4 o x=√2; su suma es 4+√2."
  },
  "18": {
    "course": "Álgebra",
    "topic": "Programación lineal entera",
    "answer": "41",
    "solution": "La intersección de las fronteras es (3,4), que es entera y factible; allí Z=41. La evaluación de los demás vértices y puntos enteros fronterizos da valores menores."
  },
  "19": {
    "course": "Aritmética",
    "topic": "Congruencias",
    "answer": "157",
    "solution": "N=2+5a y la condición módulo 7 da a=3+7b. Entonces N=17+35b; módulo 9 resulta b≡4, y el menor valor es N=157."
  },
  "20": {
    "course": "Aritmética",
    "topic": "Interés compuesto",
    "answer": "S/2000",
    "solution": "Después de dos años hay 1,21C. Luego (1,21C−1210)(1,10)=1331, por lo que 1,21C=2420 y C=2000."
  },
  "21": {
    "course": "Aritmética",
    "topic": "Combinatoria",
    "answer": "3600",
    "solution": "Hay 7!=5040 ordenamientos circulares. Con Ana y Bruno juntos hay 2·6!=1440. La diferencia es 3600."
  },
  "22": {
    "course": "Aritmética",
    "topic": "Probabilidad condicional y teorema de Bayes",
    "answer": "12/13",
    "solution": "P(RR|A)=C(2,2)/C(5,2)=1/10 y P(RR|B)=C(4,2)/C(5,2)=6/10. Por Bayes, P(B|RR)=[(2/3)(6/10)]/[(1/3)(1/10)+(2/3)(6/10)]=12/13."
  },
  "23": {
    "course": "Geometría",
    "topic": "Relaciones métricas en el triángulo",
    "answer": "2√37",
    "solution": "Por Apolonio, m²=(2·13²+2·15²−14²)/4=148; por tanto, m=2√37."
  },
  "24": {
    "course": "Geometría",
    "topic": "Potencia de un punto",
    "answer": "10",
    "solution": "Por potencia de P: 12²=8(8+x). De allí, 144=64+8x y x=10."
  },
  "25": {
    "course": "Geometría",
    "topic": "Esfera y segmentos esféricos",
    "answer": "πr²h−πh³/12",
    "solution": "Si a y b son los radios de las bases, V=(πh/6)(3a²+3b²+h²). De la geometría de la esfera, a²+b²=2r²−h²/2. Al sustituir se obtiene V=πr²h−πh³/12."
  },
  "26": {
    "course": "Geometría",
    "topic": "Relación de Euler en poliedros",
    "answer": "12",
    "solution": "3F=2E y 4V=2E. Con Euler V−E+F=2 se obtiene V=6, E=12 y F=8."
  },
  "27": {
    "course": "Trigonometría",
    "topic": "Curvas paramétricas",
    "answer": "Gráfico A"
  },
  "28": {
    "course": "Trigonometría",
    "topic": "Ecuaciones con funciones trigonométricas inversas",
    "answer": "2"
  },
  "29": {
    "course": "Trigonometría",
    "topic": "Transformaciones trigonométricas",
    "answer": "1"
  },
  "30": {
    "course": "Trigonometría",
    "topic": "Curvas de rodadura",
    "answer": "(R + r) sen(2πr/(R + r))"
  },
  "31": {
    "course": "Razonamiento matemático",
    "topic": "Sucesiones no lineales",
    "answer": "274",
    "solution": "a₂=2·1+1=3; a₃=3·3+2=11; a₄=4·11+6=50; a₅=5·50+24=274."
  },
  "32": {
    "course": "Razonamiento matemático",
    "topic": "Operadores matemáticos",
    "answer": "9/11",
    "solution": "Primero, 1/2★1/3=(1/2+1/3)/(1+1/6)=(5/6)/(7/6)=5/7. Luego 5/7★1/4=(5/7+1/4)/(1+5/28)=(27/28)/(33/28)=9/11."
  },
  "33": {
    "course": "Razonamiento matemático",
    "topic": "Ordenamiento lógico",
    "answer": "D-A-B-C",
    "solution": "El bloque B-C debe quedar después de A. Como A no puede ir en un extremo y D debe estar junto a ella, el único orden posible es D-A-B-C."
  },
  "34": {
    "course": "Razonamiento matemático",
    "topic": "Análisis de gráficos",
    "answer": "26 min",
    "solution": "El volumen hasta 14 min es 4(10+30)/2 + 6·30 + 4(30+10)/2 = 340 L. Faltan 120 L, que a 10 L/min requieren 12 min; total 26 min."
  },
  "35": {
    "course": "Razonamiento matemático",
    "topic": "Suficiencia de datos",
    "answer": "Cada información por separado es suficiente",
    "solution": "Con I: x=6a, y=6b y ab=5, por lo que {x,y}={6,30} y la suma es 36. Con II: xy=MCD·MCM permite hallar MCD=180/30=6 y se llega al mismo par. Cada dato basta por separado."
  },
  "36": {
    "course": "Razonamiento matemático",
    "topic": "Conjuntos e inclusión-exclusión",
    "answer": "15",
    "solution": "La unión es 70+65+50−40−30−25+15=105. Por tanto, 120−105=15 no estudian ninguno."
  },
  "37": {
    "course": "Razonamiento matemático",
    "topic": "Probabilidad condicional",
    "answer": "5/8",
    "solution": "P(D)=0,60·0,02+0,40·0,05=0,032. Por Bayes, P(B|D)=0,40·0,05/0,032=0,020/0,032=5/8."
  },
  "38": {
    "course": "Razonamiento matemático",
    "topic": "Verdaderos y mentirosos",
    "answer": "Solo Ana",
    "solution": "Si Bruno miente, la afirmación de Ana es verdadera y la de Carla es falsa; además, Ana y Carla no son del mismo tipo, por lo que Bruno efectivamente miente. Es la única configuración consistente."
  },
  "39": {
    "course": "Razonamiento matemático",
    "topic": "Conteo de figuras",
    "answer": "27",
    "solution": "Se cuentan 16 triángulos mínimos, 7 de orden 2, 3 de orden 3 y 1 de orden 4: en total 27."
  },
  "40": {
    "course": "Razonamiento matemático",
    "topic": "Relojes",
    "answer": "180/11",
    "solution": "A las 3:t, el minutero está a 6t grados y el horario a 90+0,5t. Igualando: 5,5t=90, luego t=180/11 min."
  },
  "41": {
    "course": "Razonamiento verbal",
    "topic": "Comprensión de lectura",
    "answer": "La solidez científica depende de superar pruebas capaces de refutar una teoría",
    "solution": "El texto contrapone la confirmación trivial con la contrastación riesgosa y falsable."
  },
  "42": {
    "course": "Razonamiento verbal",
    "topic": "Inferencia",
    "answer": "Formula predicciones más arriesgadas y susceptibles de prueba",
    "solution": "El texto valora la exposición a pruebas capaces de hacer fracasar una teoría. Por ello, entre teorías compatibles con los datos disponibles, se favorece provisionalmente la que asume mayor riesgo contrastable."
  },
  "43": {
    "course": "Razonamiento verbal",
    "topic": "Sentido contextual",
    "answer": "Protegida artificialmente de toda posible refutación",
    "solution": "La expresión describe una teoría capaz de reinterpretar cualquier resultado para no ser rechazada."
  },
  "44": {
    "course": "Razonamiento verbal",
    "topic": "Compatibilidad textual",
    "answer": "Toda modificación de una hipótesis auxiliar es ilegítima",
    "solution": "El texto admite modificaciones legítimas cuando generan predicciones independientes."
  },
  "45": {
    "course": "Razonamiento verbal",
    "topic": "Evaluación argumentativa",
    "answer": "El valor explicativo exige consecuencias contrastables más allá del caso acomodado",
    "solution": "Sin nuevas consecuencias contrastables, el ajuste solo protege retrospectivamente a la teoría."
  },
  "46": {
    "course": "Razonamiento verbal",
    "topic": "Conectores lógicos",
    "answer": "sin embargo / Aunque / por ello",
    "solution": "«Sin embargo» contrapone plausibilidad y falta de novedad; «aunque» concede que explicaba el caso, y «por ello» introduce la consecuencia de no permitir una prueba independiente."
  },
  "47": {
    "course": "Razonamiento verbal",
    "topic": "Analogías",
    "answer": "candidato : evaluación",
    "solution": "La hipótesis y el candidato son sometidos a un procedimiento que determina su validez o suficiencia: contrastación y evaluación."
  },
  "48": {
    "course": "Razonamiento verbal",
    "topic": "Precisión léxica",
    "answer": "refutó / restringió",
    "solution": "«Refutar» corresponde a invalidar una teoría mediante razones o evidencia; la negación aclara que eso no ocurrió. «Restringir el alcance» expresa que una predicción conserva validez solo en condiciones más limitadas."
  },
  "49": {
    "course": "Razonamiento verbal",
    "topic": "Plan de redacción",
    "answer": "II-I-III",
    "solution": "Primero se presenta el propósito general, después el principio que lo permite y finalmente sus aplicaciones."
  },
  "50": {
    "course": "Razonamiento verbal",
    "topic": "Eliminación de oraciones",
    "answer": "IV",
    "solution": "I, II, III y V describen el procedimiento y la función editorial de la revisión por pares. IV introduce otro criterio de validación científica, la reproducibilidad, y rompe la unidad específica del párrafo."
  },
  "51": {
    "course": "Humanidades",
    "topic": "Filosofía moral",
    "answer": "Se realiza por deber conforme a una máxima universalizable",
    "solution": "La ética kantiana vincula el valor moral con actuar por deber y con máximas universalizables."
  },
  "52": {
    "course": "Humanidades",
    "topic": "Empirismo moderno",
    "answer": "El hábito generado por la conjunción constante de fenómenos",
    "solution": "Hume sostiene que observamos sucesión constante, y el hábito produce la expectativa causal."
  },
  "53": {
    "course": "Humanidades",
    "topic": "Historia del Perú republicano",
    "answer": "I-II-III-IV",
    "solution": "Yungay ocurrió en 1839, la abolición en 1854, el Combate del Dos de Mayo en 1866 y la Guerra del Pacífico comenzó en 1879."
  },
  "54": {
    "course": "Humanidades",
    "topic": "Historia política del Perú",
    "answer": "La reacción de sectores civiles vinculados a la economía frente al predominio del caudillismo militar",
    "solution": "El civilismo articuló a sectores propietarios y profesionales que buscaban organizar el Estado mediante un partido civil y desplazar el predominio político de los caudillos militares. Pardo fue el primer presidente civil de la República."
  },
  "55": {
    "course": "Humanidades",
    "topic": "Microeconomía",
    "answer": "|Ed|=2 y el ingreso total disminuye 12 %",
    "solution": "Con variaciones porcentuales respecto de los valores iniciales, |Ed|=20/10=2. El nuevo ingreso es (1,10P)(0,80Q)=0,88PQ, por lo que disminuye 12 %."
  },
  "56": {
    "course": "Humanidades",
    "topic": "Macroeconomía",
    "answer": "2",
    "solution": "c(1−t)=0,80·0,75=0,60. Entonces k=1/[1−0,60+0,10]=1/0,50=2."
  },
  "57": {
    "course": "Humanidades",
    "topic": "Geografía física del Perú",
    "answer": "Menor productividad marina y mayor probabilidad de lluvias convectivas",
    "solution": "El debilitamiento del afloramiento reduce el aporte de nutrientes y afecta la productividad marina. A la vez, el mar más cálido favorece evaporación y convección, elevando la probabilidad de lluvias intensas en la costa norte."
  },
  "58": {
    "course": "Humanidades",
    "topic": "Psicología cognitiva",
    "answer": "Operaciones concretas",
    "solution": "La conservación y la seriación son logros de las operaciones concretas. La dificultad ante proposiciones hipotéticas sin apoyo material indica que aún no domina las operaciones formales."
  },
  "59": {
    "course": "Humanidades",
    "topic": "Sintaxis",
    "answer": "I, II y III",
    "solution": "«Aunque» introduce concesión; la relativa sin comas restringe a «los técnicos» y es especificativa; el sujeto de «reanudaron» es «los técnicos que llegaron temprano», cuyo núcleo es «técnicos»."
  },
  "60": {
    "course": "Humanidades",
    "topic": "Literatura peruana",
    "answer": "La comunidad andina defiende una práctica cultural frente a autoridades que intentan imponer una modernización externa",
    "solution": "La novela representa el choque entre la comunidad de Puquio y las autoridades que prohíben la corrida indígena, conflicto que articula tradición andina, poder estatal y modernización."
  },
  "61": {
    "course": "Trigonometría",
    "topic": "Funciones trigonométricas inversas",
    "answer": "1"
  },
  "62": {
    "course": "Trigonometría",
    "topic": "Cálculo de ángulos",
    "answer": "100°"
  },
  "63": {
    "course": "Trigonometría",
    "topic": "Área de un cuadrilátero",
    "answer": "arctan(4S/(a² + b² − c² − d²))"
  },
  "64": {
    "course": "Trigonometría",
    "topic": "Resolución de triángulos oblicuángulos",
    "answer": "ab sen θ/√(a² + b² − 2ab cos θ)"
  },
  "65": {
    "course": "Trigonometría",
    "topic": "Ley de senos",
    "answer": "2ℓ sen γ sen(30° + α)/sen(30° − γ)"
  }
};
