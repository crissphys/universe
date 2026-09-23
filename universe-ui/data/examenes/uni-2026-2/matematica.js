// Admisión UNI 2026-2 · Segunda prueba: Matemática.
// Transcripción pregunta por pregunta del cuadernillo del examen. Las fórmulas van en TeX (KaTeX) y las
// figuras son recortes del cuadernillo. La clave está codificada para que no se lea a simple vista.
const R = String.raw;

export default {
  id: 'matematica',
  sections: [['Aritmética', 1, 10], ['Álgebra', 11, 20], ['Geometría', 21, 30], ['Trigonometría', 31, 40]],
  figures: {m08: [952, 540], m22: [706, 574], m29: [897, 355], m30: [831, 285], m34: [909, 629], m37: [816, 362], m39: [769, 560], m40: [835, 407]},
  key: 'Q0JCRUNCQUJFQ0JFQ0REQkFDQkVDQkFCQ0JCREVEQkJFRUJDQUFBRQ==',
  questions: [
    {
      q: R`Determine el valor de verdad (V) o falsedad (F) de las siguientes proposiciones:`,
      items: [
        R`Si al precio de un artículo se le aumenta el 10&nbsp;% y luego sucesivamente se le descuenta el 10&nbsp;%, entonces el precio del artículo no se altera.`,
        R`El 0,00132&nbsp;% de una cantidad equivale a las 13,2 partes por millón (ppm) de la misma cantidad.`,
        R`Al precio de un artículo se le realizan tres descuentos sucesivos del 10&nbsp;%, 20&nbsp;% y 30&nbsp;%, por lo que se obtiene como precio final \(Q\), y al aplicar al mismo precio del artículo tres descuentos sucesivos, pero en el orden 30&nbsp;%, 20&nbsp;% y 10&nbsp;% se obtiene como precio final \(P\), entonces \(Q\lt P\).`
      ],
      after: 'Marque la alternativa que contenga la secuencia correcta.',
      o: ['VVF', 'FFV', 'FVV', 'VFF', 'FVF']
    },
    {
      q: R`Al extraer la raíz cuadrada de un número natural se obtuvo 52 de residuo; pero si le sumamos 1&nbsp;000 a este número, su raíz entera aumentará en dos y su residuo será máximo. Calcule la suma de las cifras del número indicado.`,
      o: ['16', '17', '18', '19', '20']
    },
    {
      q: R`Se establece la expresión \(S\), la cual presenta una cantidad ilimitada de sumandos, según como se muestra.
        \[S=\frac{3}{5}+\frac{2}{5^2}+\frac{4}{5^3}+\frac{2}{5^4}+\frac{4}{5^5}+\frac{2}{5^6}+\frac{4}{5^7}+\cdots\]
        Calcule el valor de \(120S\).`,
      o: ['86', '87', '88', '89', '90']
    },
    {
      q: R`Dos máquinas \(A\) y \(B\) producen 100 y 200 piezas, respectivamente. Se sabe que el 5&nbsp;% de las piezas producidas por \(A\) y el 6&nbsp;% de las producidas por \(B\) son defectuosas. Si de las 300 piezas, se elige una pieza al azar, ¿cuál es la probabilidad de que dicha pieza sea defectuosa?`,
      o: [R`\(0{,}05\overgroup{6}\)`, R`\(0{,}29\overgroup{3}\)`, R`\(0{,}32\overgroup{7}\)`, R`\(0{,}66\overgroup{7}\)`, R`\(0{,}70\overgroup{4}\)`]
    },
    {
      q: R`Determine cuántos números naturales al ser expresados en las bases 6 y 7 se escriben con tres cifras. Además, dichos números en la base 6 empiezan con cifra 4 y en la base 7 empiezan con cifra 3.`,
      o: ['31', '32', '33', '34', '35']
    },
    {
      q: R`Dado \(n\in\mathbb{N}\), se denota por \(E(n)\) al conjunto de números naturales, cuyas cifras son diferentes de la unidad y son tales que el producto de sus cifras es \(n\). Por ejemplo, \(E(12)=\{26,34,43,62,223,232,322\}\). Determine la cantidad de elementos del conjunto \(E(48)\).`,
      o: ['28', '38', '42', '46', '48']
    },
    {
      q: R`Se deposita un capital \(C\) a una tasa nominal mensual del 2&nbsp;% durante 4 meses, sea \(M_1\) el monto acumulado usando interés simple, mientras que utilizando interés compuesto capitalizable mensualmente al mismo tiempo y a la misma tasa, el monto acumulado sería \(M_2\). Calcule el valor aproximado de \(1000\cdot\frac{M_2}{M_1}\).`,
      o: ['1&nbsp;001,38', '1&nbsp;001,44', '1&nbsp;001,65', '1&nbsp;001,86', '1&nbsp;002,25']
    },
    {
      q: R`El siguiente diagrama de bastones muestra el número de exposiciones individuales que tuvieron los 15 estudiantes de un salón de clases.
        [[fig:m08]]
        ¿Cuál(es) de las siguientes afirmaciones es(son) verdadera(s)?`,
      items: ['La mediana es 5.', 'La moda es 5.', R`La media aritmética es \(4{,}7\overgroup{3}\).`],
      o: ['Solo I', 'Solo II', 'Solo III', 'II y III', 'I, II y III']
    },
    {
      q: R`Sabiendo que
        \[2^{564}=\overline{\ldots xy}_{(15)},\]
        calcule el valor de \(x+y\).`,
      o: ['6', '7', '8', '9', '10']
    },
    {
      q: R`En el cálculo del MCD de dos números naturales \(A\) y \(B\) por el Algoritmo de Euclides, se obtuvieron como cocientes sucesivos los siguientes números: \(2n,\ n,\ \frac{n}{4}\) y \(n\). Si los residuos sucesivos son \(30n\), 96 y \(6n\), respectivamente, calcule el valor de \(A-B\).`,
      o: ['3&nbsp;342', '4&nbsp;152', '4&nbsp;510', '4&nbsp;728', '5&nbsp;760']
    },
    {
      q: R`Sea \(f:\mathbb{R}\to\mathbb{R}\) una función cuya regla de correspondencia es
        \[f(x)=-3x^2+30x-82\]
        Indique la respuesta correcta con respecto a su gráfica.`,
      o: [
        R`Es cóncava hacia arriba donde \(f\) alcanza su menor valor en el punto \((5;-7)\).`,
        R`Es cóncava hacia arriba donde \(f\) alcanza su menor valor en el punto \((5;7)\).`,
        R`Es cóncava hacia abajo donde \(f\) alcanza su mayor valor en el punto \((5;7)\).`,
        R`Es cóncava hacia abajo donde \(f\) alcanza su mayor valor en el punto \((5;-7)\).`,
        R`Es cóncava hacia abajo donde \(f\) alcanza su mayor valor en el punto \((-5;-7)\).`
      ]
    },
    {
      q: R`La región admisible es determinada por las siguientes inecuaciones:
        \[\begin{gathered}3x-y\le 9\,,\\ x+2y\le 10\,,\\ x\ge 0\ ,\ y\ge 0\,.\end{gathered}\]
        Determine el punto \((x_0;y_0)\) que minimiza el valor de \(f(x,y)=-x-y\). Dé como respuesta el valor de \(x_0+y_0\).`,
      o: ['0', '3', '4', '6', '7']
    },
    {
      q: R`Resuelva la siguiente ecuación e indique el valor de \(x\)
        \[3^{(0{,}4)^{2x}}=9\]`,
      o: [R`\(\dfrac{1}{5}\log_{0{,}4}2\)`, R`\(\dfrac{1}{4}\log_{0{,}4}2\)`, R`\(\dfrac{1}{3}\log_{0{,}4}2\)`, R`\(\dfrac{1}{2}\log_{0{,}4}2\)`, R`\(\dfrac{1}{0{,}5}\log_{0{,}4}2\)`],
      cols: 1
    },
    {
      q: R`Sea \(A\) una matriz cuadrada. Determine el valor de verdad (V) o falsedad (F) de las siguientes proposiciones:`,
      items: [
        R`Si \(A\) es antisimétrica, entonces puede tener un elemento no nulo en su diagonal principal.`,
        R`La matriz \(A\) puede expresarse como la suma de una matriz simétrica con una anti-simétrica.`,
        R`Si \(A\) puede expresarse como la suma de una matriz simétrica \(B\) con una anti-simétrica \(C\), entonces existe una matriz anti-simétrica \(M\neq C\) y una matriz simétrica \(N\neq B\) tal que \(A=M+N\).`
      ],
      after: 'Marque la alternativa que contenga la secuencia correcta.',
      o: ['FFF', 'FVF', 'FVV', 'VFF', 'VVF']
    },
    {
      q: R`Sea \(S\) el conjunto solución de la siguiente ecuación:
        \[\sqrt[3]{2x+7}+\sqrt[3]{x+3}=1\]
        Determine el valor de verdad (V) o falsedad (F) de las siguientes proposiciones:`,
      items: [R`Existe un único \(x_0\in\mathbb{R}\) tal que \(x_0\in S\).`, R`La suma de los elementos del conjunto \(S\) es \(-7\).`, R`Si \(x\in S\), entonces \(x\gt -4\).`],
      after: 'Marque la alternativa que contenga la secuencia correcta.',
      o: ['VVV', 'VFV', 'VFF', 'FVV', 'FFF']
    },
    {
      q: R`Determine el conjunto solución del siguiente sistema:
        \[\begin{aligned}x^2+y^2-4x+2y&=4\\ y-x&=0\end{aligned}\]
        Dé como respuesta la suma de las coordenadas de todos los puntos solución.`,
      o: ['0', '1', '2', '3', '4']
    },
    {
      q: R`Halle el valor de la siguiente serie:
        \[\sum_{n=3}^{\infty}\frac{1}{(n-2)(n-1)}\]`,
      o: ['0', '1', '2', '3', '4']
    },
    {
      q: R`¿Cuál es la relación entre los números reales \(x\) e \(y\), de tal manera que el número complejo
        \[z=\frac{3x-4i}{5+yi}\]
        sea un número imaginario puro?`,
      o: [R`\(y=\dfrac{15}{4}x\)`, R`\(y=4x\)`, R`\(y=\dfrac{15}{2}x\)`, R`\(y=x\)`, R`\(y=-5x\)`]
    },
    {
      q: R`Dado el siguiente conjunto:
        \[A=\{x\in\mathbb{R}\,/\,\big||x-1|-1\big|\le 1-x\},\]
        entonces
        \[(\mathbb{R}\setminus\langle -1;1\rangle)\cap A\]
        es igual a`,
      o: [R`\(\emptyset\)`, R`\(\langle-\infty;-1]\)`, R`\(\left\langle-\infty;-\dfrac{1}{2}\right]\)`, R`\(\left\langle-\infty;\dfrac{1}{2}\right]\)`, R`\(\langle-\infty;1]\)`]
    },
    {
      q: R`Sea \(f:[\,a;8\,]\to[\,b;b+2\,]\) una función sobreyectiva, cuya regla de correspondencia es
        \[f(x)=\frac{\ln x}{\ln 2}\]
        Halle el valor de \(a+b\).`,
      o: ['1', '2', '3', '4', '5']
    },
    {
      q: R`Un prisma triangular regular está circunscrito a una esfera de longitud de radio \(r\). Determine el área total del prisma.`,
      o: [R`\(6\sqrt{3}\,r^2\)`, R`\(10\sqrt{3}\,r^2\)`, R`\(12\sqrt{3}\,r^2\)`, R`\(15\sqrt{3}\,r^2\)`, R`\(18\sqrt{3}\,r^2\)`]
    },
    {
      q: R`En la figura \(\overline{AB}\) y \(\overline{CD}\) son segmentos tangentes a la circunferencia de centro \(O\) en \(A\) y \(C\) respectivamente. Si \(CD=15\) u, \(AB=5\) u y \(AP=5\) u, entonces ¿cuál es la longitud (en u) de \(\overline{PQ}\)?
        [[fig:m22]]`,
      o: ['3,50', '3,75', '4,25', '4,75', '5,25']
    },
    {
      q: R`En un triángulo ABC, se traza la ceviana BD, tal que AB&nbsp;=&nbsp;5&nbsp;u, BC&nbsp;=&nbsp;7&nbsp;u, AC&nbsp;=&nbsp;6&nbsp;u y AD&nbsp;=&nbsp;4&nbsp;u. Calcule la longitud (en u) de \(\overline{BD}\).`,
      o: [R`\(\sqrt{11}\)`, R`\(\sqrt{22}\)`, R`\(\sqrt{33}\)`, R`\(\sqrt{34}\)`, '6']
    },
    {
      q: R`En un triángulo \(ABC\), la circunferencia inscrita y la exinscrita al triángulo son tangentes al lado \(\overline{BC}\) en los puntos \(M\) y \(N\), respectivamente. Si \(AC=b\) y \(AB=c\) siendo \(b\gt c\), entonces ¿cuál es la longitud de \(\overline{MN}\)?`,
      o: [R`\(b-c\)`, R`\(2(b-c)\)`, R`\(3(b-c)\)`, R`\(4(b-c)\)`, R`\(5(b-c)\)`]
    },
    {
      q: R`Un poliedro convexo está formado por 4 regiones triangulares y 5 regiones cuadrangulares. Calcule el número de diagonales de este poliedro.`,
      o: ['9', '10', '12', '13', '14']
    },
    {
      q: R`Si en un triángulo escaleno ACB, recto en C, se traza el segmento CD perpendicular a \(\overline{AB}\) (D pertenece a \(\overline{AB}\)), entonces ¿cuál o cuáles de las proposiciones siguientes son verdaderas?`,
      items: [R`El \(\angle\)BAC es congruente al \(\angle\)BCD.`, 'AD = DB', '(AD)(DB) = (CD)<sup>2</sup>'],
      o: ['Solo I', 'Solo II', 'Solo III', 'I y III', 'I, II y III']
    },
    {
      q: R`El desarrollo de la superficie lateral de un cilindro de revolución es una región rectangular, cuya diagonal mide 13 u. Si la generatriz mide 5 u, entonces ¿cuál es el volumen (en u<sup>3</sup>) del sólido determinado por el cilindro?`,
      o: [R`\(\dfrac{18}{\pi}\)`, R`\(\dfrac{36}{\pi}\)`, R`\(6\pi\)`, R`\(\dfrac{180}{\pi}\)`, R`\(\dfrac{360}{\pi}\)`]
    },
    {
      q: R`Dos círculos menores de una esfera están contenidos en planos que forman un ángulo diedro de 135°, cuyas circunferencias tienen un punto en común y las áreas de los círculos menores miden \(9\pi\) y \(16\pi\). Calcule la longitud (en u) del radio de la esfera.`,
      o: [R`\(\sqrt{15+2\sqrt{3}}\)`, R`\(\sqrt{25+12\sqrt{2}}\)`, R`\(\sqrt{50+24\sqrt{2}}\)`, R`\(5\sqrt{5}\)`, R`\(6\sqrt{5}\)`]
    },
    {
      q: R`En la figura mostrada, el triángulo \(ABC\) es recto en \(B\) y \(AM=20\) m. Calcule aproximadamente el área máxima (en m<sup>2</sup>) de la región sombreada.
        [[fig:m29]]`,
      o: ['20', '21', '22', '23', '24']
    },
    {
      q: R`En la figura se muestra un alambre de longitud \(r\) y un polígono regular de \(n\) lados y longitud de lado \(L\). Si el punto \(P\) gira en el sentido indicado, formando arcos de circunferencias hasta envolver una sola vez todo el contorno de la región poligonal, entonces ¿cuál es la longitud que recorre el punto \(P\)?
        [[fig:m30]]`,
      o: [R`\(\pi Ln\)`, R`\(\pi L(n+1)\)`, R`\(\pi L(n+2)\)`, R`\(\pi L(n+3)\)`, R`\(\pi L(2n+1)\)`]
    },
    {
      q: R`Simplifique la expresión \(F\), dada a continuación:
        \[\begin{aligned}F={}&24\sen(\alpha)\cos^3(\alpha)-32\sen^3(\alpha)\cos^3(\alpha)\\&-18\sen(\alpha)\cos(\alpha)+24\sen^3(\alpha)\cos(\alpha)\end{aligned}\]`,
      o: [R`\(\sen(3\alpha)\)`, R`\(\cos(3\alpha)\)`, R`\(\sen(6\alpha)\)`, R`\(\cos(6\alpha)\)`, '1']
    },
    {
      q: R`Determine el conjunto solución de la siguiente ecuación:
        \[3\tan^2(x)+3\sqrt{3}\tan(x)=4\]`,
      o: [
        R`\(\left\{\arctan\left(-\tfrac{4}{\sqrt{3}}\right)+m\pi\ ,\ m\in\mathbb{Z}\right\}\)`,
        R`\(\left\{\tfrac{\pi}{6}\right\}\cup\left\{\arctan\left(-\tfrac{4}{\sqrt{3}}\right)+m\pi\ ,\ m\in\mathbb{Z}\right\}\)`,
        R`\(\left\{\tfrac{\pi}{6},\ \arctan\left(-\tfrac{4}{\sqrt{3}}\right)\right\}\)`,
        R`\(\left\{\arctan\left(-\tfrac{4}{\sqrt{3}}\right)\right\}\cup\left\{n\pi\pm\tfrac{\pi}{6}\ ,\ n\in\mathbb{Z}\right\}\)`,
        R`\(\left\{m\pi+\arctan\left(-\tfrac{4}{\sqrt{3}}\right)\ ,\ m\in\mathbb{Z}\right\}\cup\left\{n\pi+\tfrac{\pi}{6}\ ,\ n\in\mathbb{Z}\right\}\)`
      ],
      cols: 1
    },
    {
      q: R`Si \(\sen(3\alpha-\theta)\cdot\sec(3\theta-\alpha)=2\sen(30^\circ)\), donde \(3\alpha-\theta\) y \(3\theta-\alpha\) son ángulos agudos, calcule el valor de
        \[\frac{\sen\left(\frac{\alpha+\theta}{3}+15^\circ\right)+\tan(\alpha+\theta)}{\sec(\alpha+\theta+15^\circ)}.\]`,
      o: [R`\(\dfrac{1}{2}\)`, R`\(\dfrac{3}{4}\)`, R`\(\dfrac{\sqrt{3}}{2}\)`, '1', R`\(\dfrac{3}{2}\)`]
    },
    {
      q: R`Las distancias desde los puntos \(A\) y \(B\) a la recta
        \[L:4x-3y-32=0,\]
        adoptan sus valores máximo y mínimo, respectivamente. Calcule el valor de
        \[\tan(\alpha)-\tan(\beta)\]
        [[fig:m34]]`,
      o: [R`\(-\dfrac{25}{6}\)`, R`\(-\dfrac{25}{4}\)`, R`\(-\dfrac{25}{2}\)`, R`\(\dfrac{25}{6}\)`, R`\(\dfrac{25}{2}\)`]
    },
    {
      q: R`Sea la función \(f\), definida por
        \[f(x)=\frac{e^{ix}-e^{-ix}}{2i}+\frac{e^{ix}+e^{-ix}}{2}+1,\]
        calcule el mayor valor real \(m\) y el menor valor real \(M\), tal que
        \[m\le|f(x)|\le M,\ \forall x\in\mathbb{R}.\]
        Dé como respuesta el valor de
        \[m^2+M^2-3.\]`,
      o: [R`\(\sqrt{2}\)`, R`\(2\sqrt{2}\)`, R`\(3\sqrt{2}\)`, R`\(4\sqrt{2}\)`, R`\(5\sqrt{2}\)`]
    },
    {
      q: R`Determine el valor de \(M\) si
        \[M=2\arctan(x)+\operatorname{arcsen}\left(\frac{1-x^2}{1+x^2}\right)+\frac{\pi}{6},\ x\gt 0\]`,
      o: [R`\(\dfrac{\pi}{8}\)`, R`\(\dfrac{\pi}{2}\)`, R`\(\dfrac{2\pi}{3}\)`, R`\(\dfrac{3\pi}{4}\)`, R`\(\dfrac{3\pi}{2}\)`]
    },
    {
      q: R`En el triángulo de la figura mostrada, se cumple que
        \[\sen^4(x)+\cos^4(x)=\frac{7}{8},\quad 0\lt x\lt \frac{\pi}{4}.\]
        Calcule el área de la región triangular (en m<sup>2</sup>).
        [[fig:m37]]`,
      o: [R`\(20(\sqrt{3}-1)\)`, R`\(25(\sqrt{3}-1)\)`, R`\(20(\sqrt{3}+1)\)`, R`\(20(\sqrt{5}+1)\)`, R`\(25(\sqrt{3}+1)\)`]
    },
    {
      q: R`En la siguiente expresión:
        \[\tan(328^\circ33'41'')\]
        al reducir el ángulo al primer cuadrante, ¿a qué es equivalente?`,
      o: [R`\(-\tan(31^\circ33'41'')\)`, R`\(-\tan(31^\circ26'19'')\)`, R`\(\tan(31^\circ26'19'')\)`, R`\(\tan(32^\circ33'34'')\)`, R`\(\tan(32^\circ33'41'')\)`],
      cols: 1
    },
    {
      q: R`Sean \(A,B,C\) constantes y \(f:\mathbb{R}\to\mathbb{R}\), con regla de correspondencia
        \[f(x)=A\sen(x)+B\cos(x)+C\sen(x)\cos(x)\]
        cuya gráfica se muestra a continuación:
        [[fig:m39]]
        Calcule el valor de \(A+B+C\).`,
      o: ['1', '2', '3', '4', '5']
    },
    {
      q: R`En el gráfico mostrado, calcule el máximo valor que toma el ángulo \(\theta\).
        [[fig:m40]]`,
      o: ['70°', '71°', '72°', '73°', '74°']
    }
  ]
};
