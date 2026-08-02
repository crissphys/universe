export const DEFAULT_EXAM_ID = 'admision-uni-2027-1';

export const EXAM_BANKS = {
  "admision-uni-2027-1": {
    "id": "admision-uni-2027-1",
    "title": "Simulacro de admisión UNI 2027-1",
    "shortTitle": "Admisión UNI 2027-1",
    "description": "Nuevo simulacro de admisión en desarrollo. Actualmente contiene los bloques de Trigonometría, Aritmética, Álgebra, Geometría, Física, Química, Razonamiento Matemático y Razonamiento Verbal.",
    "status": "draft",
    "durationMs": 3600000,
    "questionCount": 78,
    "key": {
      "1": {
        "course": "Trigonometría",
        "topic": "Curvas paramétricas",
        "answer": "Gráfico A",
        "solution": "Al sumar los cuadrados se obtiene x²+y²=(sen t+cos t)²+(sen t−cos t)²=2. La curva es una circunferencia de centro en el origen y radio √2: el gráfico A.",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "2": {
        "course": "Trigonometría",
        "topic": "Ecuaciones con funciones trigonométricas inversas",
        "answer": "2",
        "solution": "Sea u=|x|≥2. El lado izquierdo depende de u, disminuye desde π/2 hacia 0, mientras u−2 crece desde 0; por ello existe una sola intersección positiva. La simetría x↔−x produce exactamente 2 soluciones.",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "3": {
        "course": "Trigonometría",
        "topic": "Transformaciones trigonométricas",
        "answer": "1",
        "solution": "Al reemplazar cotangentes y tangentes por senos y cosenos, y usar las dos condiciones dadas, la expresión se reduce a una identidad constante. Su valor es 1.",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "4": {
        "course": "Trigonometría",
        "topic": "Curvas de rodadura",
        "answer": "(R + r) sen(2πr/(R + r))",
        "solution": "En una vuelta, el punto recorre un ángulo 2πr/(R+r) alrededor del centro fijo. Su abscisa es el radio de la trayectoria, R+r, multiplicado por el seno de ese ángulo.",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "5": {
        "course": "Trigonometría",
        "topic": "Funciones trigonométricas inversas",
        "answer": "1",
        "solution": "I es falsa porque arccos es decreciente; II ni siquiera está definida para π/2; III no es una identidad para todo real. IV es verdadera porque arccsc es decreciente en [1,+∞). Hay una sola proposición correcta.",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "6": {
        "course": "Trigonometría",
        "topic": "Cálculo de ángulos",
        "answer": "100°",
        "solution": "El seguimiento de los ángulos de 40° y 70°, junto con las dos perpendiculares a AD, determina los ángulos de las rectas concurrentes. El ángulo BGD resulta 100°.",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "7": {
        "course": "Trigonometría",
        "topic": "Área de un cuadrilátero",
        "answer": "arctan(4S/(a² + b² − c² − d²))",
        "solution": "Si θ es el ángulo entre diagonales, S=(1/2)pq senθ. Al expresar p²+q² con los cuatro lados y eliminar las diagonales por ley de cosenos, se obtiene tanθ=4S/(a²+b²−c²−d²).",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "8": {
        "course": "Trigonometría",
        "topic": "Resolución de triángulos oblicuángulos",
        "answer": "ab sen θ/√(a² + b² − 2ab cos θ)",
        "solution": "El triángulo PMQ tiene lados a y b y ángulo incluido θ, por lo que PQ=√(a²+b²−2ab cosθ). Igualando el área (1/2)ab senθ=(1/2)PQ·h se obtiene la distancia mínima indicada.",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "9": {
        "course": "Trigonometría",
        "topic": "Ley de senos",
        "answer": "2ℓ sen γ sen(30° + α)/sen(30° − γ)",
        "solution": "Aplicando la ley de senos en los triángulos CDB y DBA y sustituyendo los ángulos marcados, se elimina la diagonal DB. Así, AB=2ℓ senγ sen(30°+α)/sen(30°−γ).",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "10": {
        "course": "Aritmética",
        "topic": "Media ponderada y sistemas de numeración",
        "answer": "6,4",
        "solution": "De la resta en base 8 se obtiene a=5, m=2 y p=7, con k=8. La media ponderada es (2·10+7·25+5·25+8·40)/100=6,4.",
        "auditSource": "Lumbreras - 2026-I - Admisión UNI - Matemática (Solucionario).pdf, p. 4, pregunta N.º 4"
      },
      "11": {
        "course": "Aritmética",
        "topic": "Distribución de frecuencias",
        "answer": "VVF",
        "solution": "La frecuencia total es 400. El grupo 30–39 representa 80/400=20 % (V); desde 40 años hay 210>200 (V); el total no es 500 (F). La secuencia es VVF.",
        "auditSource": "Lumbreras - 2025-II - Admisión UNI - Matemática (Solucionario).pdf, p. 7, pregunta N.º 7"
      },
      "12": {
        "course": "Aritmética",
        "topic": "Números decimales periódicos",
        "answer": "8",
        "solution": "Al convertir los decimales periódicos se obtiene 17a+11n=100. Módulo 11 da a=2 y, al sustituir, n=6; por tanto, n+a=8.",
        "auditSource": "Lumbreras - 2025-I - Admisión UNI - Matemática (Solucionario).pdf, p. 4, pregunta N.º 3"
      },
      "13": {
        "course": "Aritmética",
        "topic": "Media aritmética y media geométrica",
        "answer": "18",
        "solution": "a+b=30 y ab=144. Entonces (a−b)²=(a+b)²−4ab=900−576=324, de donde |a−b|=18.",
        "auditSource": "Lumbreras - 2024-II - Admisión UNI - Matemática (Solucionario).pdf, p. 7, pregunta N.º 8"
      },
      "14": {
        "course": "Aritmética",
        "topic": "Media aritmética y varianza",
        "answer": "FVF",
        "solution": "Sumar 5 a todos los datos no cambia la varianza, aumenta la media en 5 y hace disminuir VAR/MA. La secuencia es FVF.",
        "auditSource": "Lumbreras - 2024-I - Admisión UNI - Matemática (Solucionario).pdf, p. 9, pregunta N.º 14"
      },
      "15": {
        "course": "Aritmética",
        "topic": "Interés simple",
        "answer": "10 000",
        "solution": "Con interés simple, M=C(1+rt)=C(1+0,06·4)=1,24C. Por ello, C=12 400/1,24=10 000.",
        "auditSource": "Lumbreras - 2023-II - Admisión UNI - Matemática (Solucionario).pdf, p. 8, pregunta N.º 12"
      },
      "16": {
        "course": "Aritmética",
        "topic": "Vencimiento común",
        "answer": "82",
        "solution": "Como los valores nominales son iguales, el vencimiento común es el promedio de los tiempos. Cinco meses equivalen a 150 días: (24+72+150)/3=82 días.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Matemática (Solucionario - Turno tarde).pdf, p. 10, pregunta N.º 15"
      },
      "17": {
        "course": "Aritmética",
        "topic": "Series telescópicas",
        "answer": "0,97",
        "solution": "La suma telescópica usa 1/[k(k+1)]=1/k−1/(k+1). Por ello a(50)=1−1/50=0,98 y a(50)−0,01=0,97.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Matemática (Solucionario - Turno mañana).pdf, p. 12, pregunta N.º 18"
      },
      "18": {
        "course": "Aritmética",
        "topic": "Numeración y raíz cúbica",
        "answer": "1",
        "solution": "Las divisiones cúbicas dan abc=p³+37 y cba=(p+1)³+45. Al restar se obtiene p=5 y luego abc=162. Así, |2a−b−c+p|=|2−6−2+5|=1.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Matemática (Solucionario - Turno mañana).pdf, p. 12, pregunta N.º 17"
      },
      "19": {
        "course": "Álgebra",
        "topic": "Rango de una función cuadrática",
        "answer": "0",
        "solution": "f(x)=2x²+4x+1=2(x+1)²−1. El mínimo es a=−1; entonces a³+a²=−1+1=0.",
        "auditSource": "Lumbreras - 2026-I - Admisión UNI - Matemática (Solucionario).pdf, p. 7, pregunta N.º 13"
      },
      "20": {
        "course": "Álgebra",
        "topic": "Sistemas lineales con infinitas soluciones",
        "answer": "solo III",
        "solution": "La reducción por filas deja una variable libre t y produce x₁=−2/5+(8/5)t, x₂=−3/5−(22/5)t y x₃=t. Solo la parametrización III representa el conjunto solución.",
        "auditSource": "Lumbreras - 2025-II - Admisión UNI - Matemática (Solucionario).pdf, p. 11, pregunta N.º 14"
      },
      "21": {
        "course": "Álgebra",
        "topic": "Valores propios de matrices",
        "answer": "I y III",
        "solution": "A y Aᵀ tienen el mismo polinomio característico (I verdadera). Las matrices diagonales mostradas tienen autovalores 3 y 5, respectivamente (II falsa). En una simétrica real 2×2 con término fuera de la diagonal no nulo, el discriminante es positivo (III verdadera).",
        "auditSource": "Lumbreras - 2024-II - Admisión UNI - Matemática (Solucionario).pdf, p. 9, pregunta N.º 13"
      },
      "22": {
        "course": "Álgebra",
        "topic": "Ecuaciones matriciales",
        "answer": "Matriz B",
        "solution": "Se despeja X multiplicando por la inversa de la matriz izquierda y por la inversa de la matriz derecha. El producto da X=[[0,−2],[1,3]], que corresponde a la matriz B.",
        "auditSource": "Lumbreras - 2024-I - Admisión UNI - Matemática (Solucionario).pdf, p. 15, pregunta N.º 27"
      },
      "23": {
        "course": "Álgebra",
        "topic": "Series geométricas infinitas",
        "answer": "13/3",
        "solution": "La primera serie vale (1/4)/(1−1/4)=1/3 y la segunda 1/(1−3/4)=4. La suma es 1/3+4=13/3.",
        "auditSource": "Lumbreras - 2022-II - Admisión UNI - Matemática (Solucionario).pdf, p. 20, pregunta N.º 31"
      },
      "24": {
        "course": "Álgebra",
        "topic": "Funciones exponencial y logarítmica",
        "answer": "FFF",
        "solution": "I falla, por ejemplo, con x=1. II y III tampoco son siempre verdaderas: una función logarítmica o exponencial es creciente solo cuando su base es mayor que 1. La secuencia es FFF.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Matemática (Solucionario - Turno tarde).pdf, p. 13, pregunta N.º 21"
      },
      "25": {
        "course": "Álgebra",
        "topic": "Sucesiones y convergencia",
        "answer": "No es convergente.",
        "solution": "Como n/eⁿ tiende a 0, para n grande los términos pares tienen parte entera 0 y los impares parte entera −1. La sucesión alterna entre ambos valores y no converge.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Matemática (Solucionario - Turno tarde).pdf, p. 12, pregunta N.º 19"
      },
      "26": {
        "course": "Álgebra",
        "topic": "Ecuaciones logarítmicas",
        "answer": "{2; 3}",
        "solution": "La ecuación equivale a (5−x)³=35−x³. Al expandir: 15x²−75x+90=0, es decir, (x−2)(x−3)=0. Ambas soluciones cumplen las condiciones del logaritmo.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Matemática (Solucionario - Turno mañana).pdf, p. 8, pregunta N.º 10"
      },
      "27": {
        "course": "Álgebra",
        "topic": "Programación lineal en poliedros",
        "answer": "mínimo en P de f(x̄) = f(A) < máximo en P de f(x̄)",
        "solution": "Una función lineal alcanza extremos en vértices de un poliedro convexo. Si A, B y C comparten el mínimo, el máximo debe ser estrictamente mayor; por eso mín f=f(A)<máx f.",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "28": {
        "course": "Geometría",
        "topic": "Circunferencias y pentágono regular",
        "answer": "48",
        "solution": "Las relaciones de tangencia fijan radios perpendiculares a las tangentes. Usando los ángulos centrales de 72° del pentágono y el seguimiento de arcos en C₁ y C₂, el arco MEP mide 48°.",
        "auditSource": "Validación independiente; el enunciado no aparece en los PDFs suministrados."
      },
      "29": {
        "course": "Geometría",
        "topic": "Poliedros y fórmula de Euler",
        "answer": "14",
        "solution": "Hay F=18 caras. El conteo de incidencias da 2E=6·4+12·3=60, luego E=30. Por Euler, V−E+F=2 y V=14.",
        "auditSource": "Lumbreras - 2025-II - Admisión UNI - Matemática (Solucionario).pdf, p. 16, pregunta N.º 22"
      },
      "30": {
        "course": "Geometría",
        "topic": "Medianas de un triángulo rectángulo",
        "answer": "5",
        "solution": "Al expresar las tres medianas mediante coordenadas y exigir perpendicularidad entre las dos indicadas, la relación métrica resultante con hipotenusa 5√3 da un cateto de longitud 5.",
        "auditSource": "Lumbreras - 2025-II - Admisión UNI - Matemática (Solucionario).pdf, p. 15, pregunta N.º 21"
      },
      "31": {
        "course": "Geometría",
        "topic": "Volumen de una pirámide regular",
        "answer": "(4√2/3)a³",
        "solution": "La base cuadrada tiene área 4a². Del triángulo formado por la arista lateral 2a y el radio a√2 de la base, la altura es a√2. Así, V=(1/3)(4a²)(a√2)=4√2a³/3.",
        "auditSource": "Lumbreras - 2025-I - Admisión UNI - Matemática (Solucionario).pdf, p. 15, pregunta N.º 25"
      },
      "32": {
        "course": "Geometría",
        "topic": "Semejanza y transversal en triángulo isósceles",
        "answer": "96",
        "solution": "Las semejanzas que aparecen al prolongar BC relacionan los segmentos AE, EF y CD. Al sustituir 50, 80 y 60 en esas proporciones se obtiene DF=96 cm.",
        "auditSource": "Lumbreras - 2024-I - Admisión UNI - Matemática (Solucionario).pdf, p. 18, pregunta N.º 33"
      },
      "33": {
        "course": "Geometría",
        "topic": "Volumen de un tronco de cono",
        "answer": "70π/3",
        "solution": "En la base, R²=4²+2²=20. A media altura, r=R/2 y r²=5. Para h=2, V=(πh/3)(R²+Rr+r²)=(2π/3)(20+10+5)=70π/3.",
        "auditSource": "Lumbreras - 2023-II - Admisión UNI - Matemática (Solucionario).pdf, p. 13, pregunta N.º 21"
      },
      "34": {
        "course": "Geometría",
        "topic": "Segmento entre puntos medios",
        "answer": "5",
        "solution": "Al prolongar AB y CD, los segmentos de base media miden ML=4 y NL=3 y son perpendiculares. El triángulo MLN es 3–4–5; por tanto, MN=5.",
        "auditSource": "Lumbreras - 2023-I - Admisión UNI - Matemática (Solucionario).pdf, p. 14, pregunta N.º 22"
      },
      "35": {
        "course": "Geometría",
        "topic": "Hexágono regular y áreas",
        "answer": "9",
        "solution": "Del área 18√3=(3√3/2)s² se obtiene s=2√3. El hexágono de puntos medios tiene lado 3 y perímetro 18; su superficie lateral es 18·2=36 m². A 4 m² por galón se requieren 9.",
        "auditSource": "Lumbreras - 2022-II - Admisión UNI - Matemática (Solucionario).pdf, p. 16, pregunta N.º 25"
      },
      "36": {
        "course": "Geometría",
        "topic": "Rectas y planos en el espacio",
        "answer": "Si L₁ y L₂ son rectas paralelas y sean π₁ y π₂ planos que las contienen, respectivamente, de modo que se intersectan. Entonces la recta de intersección es paralela a L₁ y L₂.",
        "solution": "Los dos planos contienen rectas con una misma dirección. Si los planos se cortan, su recta de intersección conserva esa dirección y es paralela tanto a L₁ como a L₂.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Matemática (Solucionario - Turno tarde).pdf, p. 13, pregunta N.º 20"
      },
      "37": {
        "course": "Física",
        "topic": "Trabajo de una fuerza variable",
        "answer": "21",
        "solution": "El trabajo es el área algebraica bajo F(x)=10−2x entre 0 y 7: W=[(10+(−4))/2]·7=21 J.",
        "auditSource": "Lumbreras - 2026-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 3, pregunta N.º 2"
      },
      "38": {
        "course": "Física",
        "topic": "Nivel de intensidad sonora",
        "answer": "1",
        "solution": "120=10 log(I/10⁻¹²). Entonces log(I/10⁻¹²)=12 e I=1 W/m².",
        "auditSource": "Lumbreras - 2025-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 4, pregunta N.º 3"
      },
      "39": {
        "course": "Física",
        "topic": "Principio de Arquímedes",
        "answer": "4,7",
        "solution": "El volumen de la madera es 0,012 m³. Igualando empuje y peso cuando queda totalmente sumergida y despejando el volumen del plomo se obtiene 4,7×10⁻⁴ m³.",
        "auditSource": "Lumbreras - 2025-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 4, pregunta N.º 4"
      },
      "40": {
        "course": "Física",
        "topic": "Movimiento de una carga en un campo magnético",
        "answer": "2,8",
        "solution": "La rapidez perpendicular al campo es 5×10⁵ m/s. Con r=mv/(|q|B), r=(9,11×10⁻³¹·5×10⁵)/(1,6×10⁻¹⁹·10⁻³)≈2,8 mm.",
        "auditSource": "Lumbreras - 2025-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 5, pregunta N.º 5"
      },
      "41": {
        "course": "Física",
        "topic": "Asociación de resistencias",
        "answer": "8",
        "solution": "Cada rama tiene dos resistencias en serie: 2R=6 Ω. Las dos ramas iguales están en paralelo, por lo que la corriente total se divide por igual; en la rama superior circulan 8 A.",
        "auditSource": "Lumbreras - 2024-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 4, pregunta N.º 3"
      },
      "42": {
        "course": "Física",
        "topic": "Calorimetría y cambios de fase",
        "answer": "132,9",
        "solution": "El hielo requiere 0,4·333+0,4·4,18·100=300,4 kJ. Cada kilogramo de vapor que condensa a 100 °C entrega 2260 kJ; m=300,4/2260=0,1329 kg=132,9 g.",
        "auditSource": "Lumbreras - 2024-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 4, pregunta N.º 4"
      },
      "43": {
        "course": "Física",
        "topic": "Efecto fotoeléctrico",
        "answer": "5chλ/(6ch − λE)",
        "solution": "Primero, φ=hc/λ−E. Para el segundo metal, hc/λ₂=1,2φ+E. Sustituyendo y despejando resulta λ₂=5hcλ/(6hc−λE).",
        "auditSource": "Lumbreras - 2024-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 7, pregunta N.º 9"
      },
      "44": {
        "course": "Física",
        "topic": "Teorema trabajo-energía",
        "answer": "−2,00",
        "solution": "Por trabajo y energía, Wfr=ΔK=0−(1/2)(10)(20²)=−2000 J=−2,00 kJ.",
        "auditSource": "Lumbreras - 2023-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 4, pregunta N.º 3"
      },
      "45": {
        "course": "Física",
        "topic": "Campo magnético de un solenoide",
        "answer": "2,5",
        "solution": "Hay 100 vueltas por centímetro, es decir n=10 000 m⁻¹. De B=μ₀nI, I=(10π×10⁻³)/(4π×10⁻⁷·10 000)=2,5 A.",
        "auditSource": "Lumbreras - 2023-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 4, pregunta N.º 3"
      },
      "46": {
        "course": "Física",
        "topic": "Espejos esféricos",
        "answer": "7,5",
        "solution": "Para el espejo convexo f=−5 cm e imagen virtual i=−3 cm. Con 1/f=1/o+1/i se obtiene 1/o=−1/5+1/3=2/15 y o=7,5 cm.",
        "auditSource": "Lumbreras - 2023-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 6, pregunta N.º 7"
      },
      "47": {
        "course": "Química",
        "topic": "Celdas galvánicas y potenciales de reducción",
        "answer": "Zn, Ag₂O",
        "solution": "La semirreacción con mayor potencial de reducción es la de Ag₂O (+0,344 V), por lo que Ag₂O se reduce. El zinc invierte su semirreacción y se oxida.",
        "auditSource": "Lumbreras - 2026-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 11, pregunta N.º 25"
      },
      "48": {
        "course": "Química",
        "topic": "Funciones orgánicas en las penicilinas",
        "answer": "solo III",
        "solution": "No hay alcohol: el OH aromático es fenol; tampoco aparece aldehído. Solo la amoxicilina posee el grupo amina primaria −NH₂. Únicamente III es correcta.",
        "auditSource": "Lumbreras - 2025-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 16, pregunta N.º 28"
      },
      "49": {
        "course": "Química",
        "topic": "Equilibrio químico y principio de Le Châtelier",
        "answer": "solo III",
        "solution": "Δn gaseoso=4−2=2, así que Kp≠Kc. Un catalizador no desplaza el equilibrio. Al aumentar el volumen se favorece el lado con más moles gaseosos, la derecha. Solo III.",
        "auditSource": "Lumbreras - 2025-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 16, pregunta N.º 27"
      },
      "50": {
        "course": "Química",
        "topic": "Electrólisis y ley de Faraday",
        "answer": "0,91",
        "solution": "Por la ley de Faraday, m=ItM/(nF)=(5·600·58,7)/(2·96 500)≈0,91 g.",
        "auditSource": "Lumbreras - 2024-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 17, pregunta N.º 27"
      },
      "51": {
        "course": "Química",
        "topic": "Química ambiental y capa de ozono",
        "answer": "FVV",
        "solution": "El ozono protege principalmente de radiación ultravioleta, no infrarroja (F). Los radicales de cloro lo destruyen (V) y su pérdida aumenta los problemas en la piel (V): FVV.",
        "auditSource": "Lumbreras - 2024-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 16, pregunta N.º 26"
      },
      "52": {
        "course": "Química",
        "topic": "Ecuación de los gases ideales",
        "answer": "1,12",
        "solution": "n=17,6/44=0,4 mol y T=280 K. Con PV=nRT, P=(0,4·0,082·280)/8,2=1,12 atm.",
        "auditSource": "Lumbreras - 2024-I - Admisión UNI - Física y Química (Solucionario).pdf, p. 23, pregunta N.º 40"
      },
      "53": {
        "course": "Química",
        "topic": "Constante de acidez",
        "answer": "8,3 × 10⁻⁸",
        "solution": "Para HA débil, x=[H₃O⁺]=5×10⁻⁵ M. Ka=x²/(0,03−x)≈(5×10⁻⁵)²/0,03=8,3×10⁻⁸.",
        "auditSource": "Lumbreras - 2023-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 17, pregunta N.º 27"
      },
      "54": {
        "course": "Química",
        "topic": "Propiedades periódicas",
        "answer": "La energía de ionización, también denominada potencial de ionización, disminuye a medida que el número atómico aumenta en un grupo en la tabla periódica.",
        "solution": "En un grupo, la energía de ionización disminuye al aumentar el número atómico. Las demás opciones contradicen las tendencias periódicas o definen incorrectamente la electronegatividad.",
        "auditSource": "Lumbreras - 2023-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 18, pregunta N.º 28"
      },
      "55": {
        "course": "Química",
        "topic": "Propiedades intensivas y extensivas",
        "answer": "0, 4",
        "solution": "Punto de fusión, solubilidad, densidad y masa molar no dependen de la cantidad de muestra: las cuatro son intensivas. Hay 0 propiedades extensivas y 4 intensivas.",
        "auditSource": "Lumbreras - 2022-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 10, pregunta N.º 12"
      },
      "56": {
        "course": "Química",
        "topic": "Nomenclatura de compuestos aromáticos",
        "answer": "1-etil-3-metilbenceno",
        "solution": "Se numera el anillo para obtener los localizadores más bajos, 1 y 3, y se ordenan alfabéticamente los sustituyentes. El nombre es 1-etil-3-metilbenceno.",
        "auditSource": "Lumbreras - 2022-II - Admisión UNI - Física y Química (Solucionario).pdf, p. 13, pregunta N.º 17"
      },
      "57": {
        "course": "Razonamiento matemático",
        "topic": "Lógica proposicional y contrapositiva",
        "answer": "(p → q) → (¬q → ¬p)",
        "solution": "Si p es «aumenta la inflación» y q es «disminuye la balanza», el enunciado es (p→q)→(¬q→¬p), aplicación de la contrapositiva.",
        "auditSource": "Lumbreras - 2026-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 3, pregunta N.º 1"
      },
      "58": {
        "course": "Razonamiento matemático",
        "topic": "Interpretación de gráficos estadísticos",
        "answer": "FVF",
        "solution": "El total es 150. Acción o Terror suma 40, es 26,7 % y no 36,7 % (F); Drama/Suspenso=40/30=4/3 (V); 30+25+15=70 no supera 75 (F). Resultado FVF.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario - Turno mañana).pdf, p. 5, pregunta N.º 4"
      },
      "59": {
        "course": "Razonamiento matemático",
        "topic": "Distribuciones gráficas numéricas",
        "answer": "38",
        "solution": "La regla inferior es superior·5 más un incremento: 11=2·5+1, 22=4·5+2. Entonces x=7·5+3=38.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario - Turno mañana).pdf, p. 10, pregunta N.º 12"
      },
      "60": {
        "course": "Razonamiento matemático",
        "topic": "Numeración y cifras invertidas",
        "answer": "12",
        "solution": "Si el número es 10a+b, al invertirlo: 10b+a=1,75(10a+b). De ahí b=2a; el mayor número es 48 y la suma de cifras es 12.",
        "auditSource": "Lumbreras - 2022-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 6, pregunta N.º 6"
      },
      "61": {
        "course": "Razonamiento matemático",
        "topic": "Desarrollo y plegado de cubos",
        "answer": "Solo 4",
        "solution": "Al plegar la red, las dos diagonales no pueden converger en el mismo vértice y deben respetarse las caras con círculos. Solo el sólido 4 cumple; el solucionario advierte que las alternativas originales omitían esa respuesta.",
        "auditSource": "Lumbreras - 2022-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 8, pregunta N.º 9"
      },
      "62": {
        "course": "Razonamiento matemático",
        "topic": "Ordenamiento de información",
        "answer": "E será designada al Mimdes.",
        "solution": "Con B en Mintra, E solo puede ocupar MEF o Minedu según sus opciones declaradas. Por ello nunca puede ser cierto que E sea designada al Mimdes.",
        "auditSource": "Lumbreras - 2024-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 7, pregunta N.º 8"
      },
      "63": {
        "course": "Razonamiento matemático",
        "topic": "Operación definida por tabla",
        "answer": "I y II",
        "solution": "La tabla es simétrica respecto de la diagonal, por lo que la operación es conmutativa. Además, 5⁻¹=5 y 7⁻¹=7; así, 3*5⁻¹=7=7⁻¹. I y II son verdaderas.",
        "auditSource": "Lumbreras - 2024-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 9, pregunta N.º 14"
      },
      "64": {
        "course": "Razonamiento matemático",
        "topic": "Sucesiones exponenciales",
        "answer": "15 625",
        "solution": "La sucesión sigue 0¹, 1², 2³, 3⁴, 4⁵. El siguiente término es 5⁶=15 625.",
        "auditSource": "Lumbreras - 2024-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 4, pregunta N.º 3"
      },
      "65": {
        "course": "Razonamiento matemático",
        "topic": "Función escalón unitario",
        "answer": "4 − 2μ₋₁(t) + 2μ₃(t)",
        "solution": "g sube 2 unidades en t=3: g=1+2μ₃. h sube 2 en t=−1: h=−3+2μ₋₁. Por tanto, g−h=4−2μ₋₁(t)+2μ₃(t).",
        "auditSource": "Lumbreras - 2025-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 5, pregunta N.º 4"
      },
      "66": {
        "course": "Razonamiento matemático",
        "topic": "Calendarios y conteo de días",
        "answer": "martes",
        "solution": "Al contar los días transcurridos desde el lunes 6 de enero hasta el 28 de julio y reducir el total módulo 7, el desplazamiento es de un día. Por ello fue martes.",
        "auditSource": "Lumbreras - 2025-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 9, pregunta N.º 14"
      },
      "67": {
        "course": "Razonamiento matemático",
        "topic": "Equivalencias lógicas",
        "answer": "Juan no ingresará a la UNI o estudiará Ingeniería Civil.",
        "solution": "La implicación p→q es lógicamente equivalente a ¬p∨q: «Juan no ingresará a la UNI o estudiará Ingeniería Civil».",
        "auditSource": "Lumbreras - 2025-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 5, pregunta N.º 4"
      },
      "68": {
        "course": "Razonamiento verbal",
        "topic": "Inclusión de enunciado",
        "answer": "Además, al hombre se le considera un animal político y social.",
        "solution": "El texto enumera características que Aristóteles atribuye al ser humano. La inclusión coherente añade su dimensión política y social y mantiene el referente de la conclusión V.",
        "auditSource": "Lumbreras - 2026-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 13, pregunta N.º 36"
      },
      "69": {
        "course": "Razonamiento verbal",
        "topic": "Analogías",
        "answer": "tren : locomotora",
        "solution": "La relación es todo–parte funcional: el casquillo es una parte esencial de la lámpara, como la locomotora lo es del tren.",
        "auditSource": "Lumbreras - 2025-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 20, pregunta N.º 35"
      },
      "70": {
        "course": "Razonamiento verbal",
        "topic": "Plan de redacción",
        "answer": "IV - III - I - II - V",
        "solution": "El orden es cronológico: creación por Astley en 1783 (IV), continuación tras la Revolución Francesa (III), circo Napoléon en 1852 (I) y situación actual (II–V).",
        "auditSource": "Lumbreras - 2025-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 22, pregunta N.º 40"
      },
      "71": {
        "course": "Razonamiento verbal",
        "topic": "Información eliminada",
        "answer": "V",
        "solution": "I–IV siguen la evolución de los recursos de escenificación. V cambia el eje hacia corrientes dramáticas y autores; por eso es el enunciado no pertinente.",
        "auditSource": "Lumbreras - 2024-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 21, pregunta N.º 37"
      },
      "72": {
        "course": "Razonamiento verbal",
        "topic": "Comprensión de lectura: incompatibilidad",
        "answer": "Los términos «economía» y «crematística» son una herencia de una lengua neolatina.",
        "solution": "El texto afirma expresamente que «economía» y «crematística» proceden del griego. Por ello es incompatible decir que son herencia de una lengua neolatina.",
        "auditSource": "Lumbreras - 2024-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 23, pregunta N.º 44"
      },
      "73": {
        "course": "Razonamiento verbal",
        "topic": "Definiciones",
        "answer": "Protervo",
        "solution": "«Protervo» significa perverso, obstinado en la maldad; es la palabra que coincide exactamente con la definición.",
        "auditSource": "Lumbreras - 2023-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 21, pregunta N.º 39"
      },
      "74": {
        "course": "Razonamiento verbal",
        "topic": "Plan de redacción",
        "answer": "II - V - III - IV - I",
        "solution": "Primero se presenta al creador (II), luego su artículo de 1954 (V), después la divulgación (III) y, al final, las dos definiciones enlazadas (IV–I).",
        "auditSource": "Lumbreras - 2023-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 28, pregunta N.º 55"
      },
      "75": {
        "course": "Razonamiento verbal",
        "topic": "Precisión léxica",
        "answer": "determinaron",
        "solution": "«Determinaron» expresa descubrir o fijar con precisión las dos causas tras el análisis; es más preciso que «se tuvieron».",
        "auditSource": "Lumbreras - 2023-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 27, pregunta N.º 53"
      },
      "76": {
        "course": "Razonamiento verbal",
        "topic": "Conectores lógicos",
        "answer": "A pesar de que - por lo que",
        "solution": "La primera relación es concesiva: aunque está en fase experimental, hubo respuesta positiva. La segunda introduce consecuencia: por lo que se espera su formalización.",
        "auditSource": "Lumbreras - 2022-II - Admisión UNI - Aptitud Académica y Humanidades (Solucionario).pdf, p. 26, pregunta N.º 42"
      },
      "77": {
        "course": "Razonamiento verbal",
        "topic": "Ordenamiento de enunciados",
        "answer": "III - IV - V - I - II",
        "solution": "Se presenta la especie (III), se describe su rasgo físico (IV), se indica su hábitat (V), se precisa ese hábitat remoto (I) y se cierra con el dato histórico de su descripción (II).",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario - Turno tarde).pdf, p. 22, pregunta N.º 37"
      },
      "78": {
        "course": "Razonamiento verbal",
        "topic": "Definiciones",
        "answer": "Malquistar",
        "solution": "«Malquistar» significa indisponer o enemistar a una persona con otra u otras, por lo que coincide literalmente con la definición.",
        "auditSource": "Lumbreras - 2022-I - Admisión UNI - Aptitud Académica y Humanidades (Solucionario - Turno tarde).pdf, p. 24, pregunta N.º 42"
      }
    }
  },
  "cepreuni-final-2026-2": {
    "id": "cepreuni-final-2026-2",
    "title": "Simulacro final CEPREUNI 2026-2",
    "shortTitle": "Final CEPREUNI 2026-2",
    "description": "Banco anterior completo de 60 preguntas, conservado como archivo.",
    "status": "archived",
    "durationMs": 10800000,
    "questionCount": 60,
    "key": {
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
        "topic": "Identidades de suma y diferencia",
        "answer": "3/4",
        "solution": "De la condición, a/r=−tan74°. Al sustituir, la expresión se transforma en (1+tan74°tan21°)/(tan74°−tan21°)=cot(74°−21°)=cot53°≈3/4."
      },
      "28": {
        "course": "Trigonometría",
        "topic": "Ecuaciones trigonométricas",
        "answer": "7π/4−arctan(1/2)",
        "solution": "cosx≠0 en las soluciones. Al dividir entre cos²x: 2tan²x+3tanx+1=0, de donde tanx=−1 o tanx=−1/2. En [0,π) las soluciones son 3π/4 y π−arctan(1/2); su suma es 7π/4−arctan(1/2)."
      },
      "29": {
        "course": "Trigonometría",
        "topic": "Resolución de triángulos",
        "answer": "2√7",
        "solution": "El tercer lado es √(8²+10²−160cos60°)=2√21. El área es 20√3. Así, R=abc/(4Δ)=2√7."
      },
      "30": {
        "course": "Trigonometría",
        "topic": "Razones de ángulo mitad",
        "answer": "1/2",
        "solution": "Por Herón, el área es 84, el semiperímetro 21 y el inradio r=84/21=4. Como tan(A/2)=r/(s−a), resulta 4/(21−13)=1/2."
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
      }
    }
  }
};

export function getExamBank(value) {
  var id = String(value || '').replace(/[^a-zA-Z0-9_-]/g, '');
  return EXAM_BANKS[id] || EXAM_BANKS[DEFAULT_EXAM_ID];
}
