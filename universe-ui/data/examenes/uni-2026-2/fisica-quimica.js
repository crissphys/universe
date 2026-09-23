// Admisión UNI 2026-2 · Tercera prueba: Física y Química.
// Transcripción pregunta por pregunta del cuadernillo del examen. Las fórmulas van en TeX (KaTeX) y las
// figuras son recortes del cuadernillo. La clave está codificada para que no se lea a simple vista.
const R = String.raw;
const vf = 'Marque la alternativa que contenga la secuencia correcta.';

export default {
  id: 'fisica-quimica',
  sections: [['Física', 1, 20], ['Química', 21, 40]],
  figures: {c04: [885, 724], c07: [670, 485], c12: [897, 480], c15: [907, 710], c24: [381, 425], c36: [639, 562]},
  key: 'RERERERCREJEQ0RERURDREREQ0FCREVFQkNFQ0VDQkVDQ0VCQUJDQg==',
  questions: [
    {
      q: R`Dos alambres metálicos rectos con coeficientes de dilatación lineal \(\alpha_1\) y \(\alpha_2\) \((\alpha_1\lt \alpha_2)\) tienen la misma longitud \(l_0\) a la temperatura \(T\). Determine el valor del incremento en la temperatura \((\Delta T)\), necesario para que la diferencia entre sus longitudes sea \(l_0/10\).`,
      o: [R`\(\dfrac{1}{20(\alpha_2-\alpha_1)}\)`, R`\(\dfrac{1}{10(\alpha_2-\alpha_1)}\)`, R`\(\dfrac{1}{5(\alpha_2-\alpha_1)}\)`, R`\(\dfrac{1}{2(\alpha_2-\alpha_1)}\)`, R`\(\dfrac{1}{(\alpha_2-\alpha_1)}\)`],
      cols: 1
    },
    {
      q: R`Una esfera metálica, de coeficiente de dilatación lineal \(\alpha\), tiene un radio \(R\) a la temperatura \(T\). Determine el valor del incremento de temperatura \((\Delta T)\) para el cual el radio de la esfera se duplica.`,
      o: [R`\(\dfrac{1}{3\alpha}\)`, R`\(\dfrac{5}{3\alpha}\)`, R`\(\dfrac{7}{3\alpha}\)`, R`\(\dfrac{3}{\alpha}\)`, R`\(\dfrac{5}{\alpha}\)`]
    },
    {
      q: R`Una partícula realiza un MAS a lo largo del eje \(X\) con posición de equilibrio en el origen de coordenadas y 1,5&nbsp;s de periodo. Calcule, aproximadamente, la distancia (en cm) de la partícula al origen de coordenadas en el instante cuando la aceleración es 35&nbsp;cm/s<sup>2</sup>. \((\pi=3{,}1415)\)`,
      o: ['0,99', '1,99', '2,99', '3,99', '4,99']
    },
    {
      q: R`Un bloque de masa \(m\) se deja caer desde el reposo de la parte más alta de una rampa, de altura \(h\) (medida desde el suelo) y que tiene forma de un cuarto de circunferencia, tal como se muestra en la figura adjunta, tal que en el punto más bajo de la rampa su rapidez es 4,6&nbsp;m/s. Calcule, aproximadamente, el valor de la altura \(h\) (en m). Considere que las superficies son lisas y que la magnitud de la aceleración de la gravedad es de 9,81&nbsp;m/s<sup>2</sup>.
        [[fig:c04]]`,
      o: ['1,08', '2,62', '3,25', '5,62', '7,72']
    },
    {
      q: R`Un ancla de acero, de densidad igual a \(7870\ \text{kg/m}^3\), es 200&nbsp;N más ligero en agua que en el aire. Determine, aproximadamente, el peso del ancla (en \(10^3\) N) sumergida totalmente en el agua. \((g=9{,}81\ \text{m/s}^2)\)`,
      o: ['0,88', '1,37', '1,77', '2,02', '3,05']
    },
    {
      q: R`Un instrumento llamado decibelímetro mide el nivel de intensidad de las ondas sonoras producidas por una fuente a cierta distancia, cuyo valor es de 120&nbsp;dB. Calcule el valor correspondiente a la intensidad (en W/m<sup>2</sup>). Considere que el valor de la intensidad umbral del sonido es \(I_o=10^{-12}\) W/m<sup>2</sup>.`,
      o: [R`\(10^{-4}\)`, R`\(10^{-3}\)`, R`\(10^{-2}\)`, R`\(10^{-1}\)`, '1']
    },
    {
      q: R`La figura muestra un sistema mecánico en equilibrio. Si no hay fricción entre la superficie horizontal y la superficie del bloque \(B\), calcule, aproximadamente, la magnitud de la aceleración (en m/s<sup>2</sup>) del bloque \(A\), cuando se aplica una fuerza \(2\vec{F}\) sobre el bloque \(B\). Considere que \(m_A=300\) g, \(m_B=500\) g y que la magnitud de la aceleración, debido a la gravedad, es \(g=9{,}81\ \text{m/s}^2\).
        [[fig:c07]]`,
      o: ['1,7', '2,7', '3,7', '4,7', '5,7']
    },
    {
      q: R`Si a una altura de 350&nbsp;km sobre la superficie de la Tierra, el peso de un cuerpo tiene una magnitud de 25&nbsp;N, calcule en cuántos km debe aumentarse la altura para que su nuevo peso tenga una magnitud igual a 16&nbsp;N. Considere que el radio de la Tierra es 6370&nbsp;km.`,
      o: ['980', '1330', '1680', '2030', '4060']
    },
    {
      q: R`Se tiene un móvil que realiza un movimiento circular, de modo que su trayectoria tiene un radio de longitud \(R\).<br>Determine la veracidad (V) o falsedad (F) de las siguientes proposiciones:`,
      items: [
        'Si el móvil gira una vuelta completa, su longitud recorrida es nula.',
        R`Si el móvil gira media vuelta, la magnitud del desplazamiento es \(2\pi R\) y su longitud recorrida es \(2R\).`,
        R`Si el móvil se mueve un cuarto de vuelta, su longitud recorrida es \(\sqrt{2}R\).`
      ],
      after: vf,
      o: ['VVV', 'FFV', 'FVV', 'FVF', 'FFF']
    },
    {
      q: R`Una partícula, cuya masa es de 500&nbsp;g, se suelta desde cierta altura, respecto del suelo. Calcule, aproximadamente, el tiempo (en s) que demora la partícula en adquirir una energía cinética de 1&nbsp;J. Considere que la magnitud de la aceleración de la gravedad es de 9,81&nbsp;m/s<sup>2</sup>.`,
      o: ['0,1', '0,2', '0,3', '0,4', '0,5']
    },
    {
      q: R`En un terremoto, se generan varios tipos de ondas sísmicas. Las más conocidas son las ondas P (primarias o de presión) y S (secundarias o de esfuerzos cortantes). Considerando que las ondas de tipo P y de tipo S, generadas en un mismo punto dentro de la corteza terrestre, se propagan en línea recta, cada una con rapidez de 6,5&nbsp;km/s y 3,5&nbsp;km/s, respectivamente, y que la diferencia de los tiempos de llegada de las ondas a una misma estación sísmica es de 33&nbsp;s. Calcule, aproximadamente, la distancia (en km) entre el punto donde se generaron las ondas hasta la posición de la estación sísmica.`,
      o: ['80', '160', '250', '300', '350']
    },
    {
      q: R`Usando un voltímetro ideal, se lleva a cabo un conjunto de mediciones del voltaje \(V\) entre los bornes de una batería real, a través de una resistencia variable \(R\). Los resultados se muestran en el gráfico \(V\) vs \(R\), adjunto en la figura.
        [[fig:c12]]
        Indique cuál es la máxima corriente (en A) que podría generar la batería.`,
      o: ['No es posible ese resultado experimental.', '1', '4', '10', '12'],
      cols: 1
    },
    {
      q: R`Una partícula de \(4\ \mu\text{C}\) ingresa perpendicularmente a una región del espacio, donde existe un campo magnético uniforme \(\vec{B}=0{,}25\hat{k}\ \text{T}\) con una velocidad \(\vec{v}=100\hat{\imath}\ \text{m/s}\). Calcule la fuerza magnética (en \(\mu\)N) que actúa sobre ella.`,
      o: [R`\(+100\hat{\imath}\)`, R`\(+100\hat{\jmath}\)`, R`\(-100\hat{\jmath}\)`, R`\(-50\hat{\jmath}\)`, R`\(-100\hat{\imath}\)`]
    },
    {
      q: R`Una máquina térmica, que desarrolla un ciclo de Carnot, tiene una eficiencia de 0,6. Si la temperatura del foco frío es 275&nbsp;°C, calcule la temperatura (en °C) del foco caliente.`,
      o: ['697', '797', '897', '997', '1097']
    },
    {
      q: R`Luego de lanzar un cuerpo, este explota partiéndose en tres fragmentos. Si las masas y las velocidades de cada uno de los fragmentos producidos un instante después de la explosión son los que se muestran en la figura, halle la velocidad del cuerpo (en m/s) un instante antes de su explosión.
        [[fig:c15]]`,
      o: [R`\(20\hat{\jmath}\)`, R`\(60\hat{\imath}\)`, R`\(15\hat{\imath}\)`, R`\(60\hat{\imath}+20\hat{\jmath}\)`, R`\(15\hat{\imath}+60\hat{\jmath}\)`]
    },
    {
      q: R`La radiación electromagnética que proviene del Sol viaja fuera de la atmósfera con longitudes de onda que varían entre 280&nbsp;nm a 3000&nbsp;nm. ¿Cuáles son las energías de los fotones, en eV, que corresponden a las longitudes de onda indicadas?
        <span class="uexam__data">Datos:<br>Constante de Planck: \(4{,}1\times10^{-15}\ \text{eV}\cdot\text{s}\).<br>Velocidad de la luz: \(3\times10^{8}\ \text{m/s}\)</span>`,
      o: ['3,39 y 0,41', '4,39 y 0,41', '4,39 y 1,41', '5,39 y 1,41', '5,39 y 2,41']
    },
    {
      q: R`Al colocar un objeto a 20&nbsp;cm de una lente divergente se forma su imagen a 4&nbsp;cm de dicha lente. Calcule el valor de la distancia focal (en cm) de la lente.`,
      o: ['1', '2', '3', '4', '5']
    },
    {
      q: R`El campo magnético máximo de una onda electromagnética que se propaga en el vacío es \(40\ \mu\text{T}\). Calcule, aproximadamente, la densidad promedio de energía de la onda electromagnética en \(\text{mJ/m}^3\).
        <span class="uexam__data">Dato: Permitividad magnética del vacío \(4\pi\times10^{-7}\ \text{T}\cdot\text{m/A}\)</span>`,
      o: ['0,24', '0,34', '0,44', '0,54', '0,64']
    },
    {
      q: R`Una espira conductora circular se encuentra en el plano de esta página y transporta una corriente inducida en sentido horario. Señale la proposición correcta.`,
      o: [
        'Un campo magnético constante está dirigido hacia la página.',
        'Un campo magnético constante está dirigido desde la página hacia afuera.',
        'Un campo magnético creciente está dirigido hacia la página.',
        'Un campo magnético decreciente está dirigido hacia la página.',
        'Un campo magnético decreciente está dirigido desde la página hacia afuera.'
      ]
    },
    {
      q: R`En un experimento electrostático, se observa que un electrón acelera a razón de \(5\times10^{14}\ \text{m/s}^2\) entre dos placas planas, paralelas, cargadas y separadas por 2&nbsp;cm. Calcule, en voltios, la diferencia de potencial entre las placas.
        <span class="uexam__data">Datos:<br>Masa del electrón: \(9{,}1\times10^{-31}\ \text{kg}\)<br>Carga del electrón: \(1{,}6\times10^{-19}\ \text{C}\)</span>`,
      o: ['42,34', '56,88', '67,86', '75,24', '87,88']
    },
    {
      q: R`Para el siguiente sistema en equilibrio, a 298&nbsp;K:
        \[\mathrm{NH_4HS_{(s)}}\rightleftarrows\mathrm{NH_{3(g)}}+\mathrm{H_2S_{(g)}}\]
        Calcule el valor de \(K_p\), si \(K_c=1{,}81\times10^{-4}\)
        <span class="uexam__data">Dato: \(R=0{,}082\ \dfrac{\text{atm}\cdot\text{L}}{\text{mol}\cdot\text{K}}\)</span>`,
      o: ['0,108', '0,820', '1,081', '1,810', '2,161']
    },
    {
      q: R`Calcule la cantidad de moles (en mol) de nitrógeno molecular, que se fuga de un recipiente de acero de 10&nbsp;L de capacidad, si su presión descendió de 4 a 2 atmósferas y se mantiene la temperatura constante a 25&nbsp;°C.
        <span class="uexam__data">Dato: \(R=0{,}082\ \dfrac{\text{atm}\cdot\text{L}}{\text{mol}\cdot\text{K}}\)</span>`,
      o: ['0,41', '0,62', '0,81', '0,89', '1,22']
    },
    {
      q: R`Respecto a las definiciones y teorías de ácido-base, señale si las siguientes proposiciones son verdaderas (V) o falsas (F).`,
      items: [R`El ion \(\mathrm{Cu^{2+}}\) es un ácido de Lewis.`, R`El compuesto \(\mathrm{NH_3}\) es considerado una base de Arrhenius.`, R`El \(\mathrm{HCO_3^-}\) puede actuar como ácido de Bronsted-Lowry.`],
      after: vf,
      o: ['VVV', 'VVF', 'VFF', 'VFV', 'FFV']
    },
    {
      q: R`Con respecto a la estructura del ácido benzoico que se muestra a continuación:
        [[fig:c24]]
        Marque la alternativa correcta.`,
      o: [R`Presenta en total 3 enlaces \(\pi\).`, R`El anillo aromático presenta 3 enlaces \(\sigma\).`, R`El grupo funcional carboxílico presenta 2 enlaces \(\sigma\).`, R`Presenta en total 15 enlaces \(\sigma\).`, 'Presenta 8 enlaces simples.']
    },
    {
      q: 'Indique la alternativa que contiene la secuencia correcta de acuerdo a la ecuación química - clasificación.',
      o: [
        R`\(\mathrm{HNO_{3(ac)}}+\mathrm{NaOH_{(ac)}}\rightarrow\mathrm{NaC\ell_{(ac)}}+\mathrm{H_2O_{(\ell)}}\): Desplazamiento simple`,
        R`\(\mathrm{2HgO_{(s)}}\xrightarrow{\ \text{calor}\ }\mathrm{2Hg_{(\ell)}}+\mathrm{O_{2(g)}}\): Adición`,
        R`\(\mathrm{NaOH_{(ac)}}+\mathrm{NH_4C\ell_{(ac)}}\rightarrow\mathrm{NaC\ell_{(ac)}}+\mathrm{NH_{3(ac)}}+\mathrm{H_2O_{(\ell)}}\): Descomposición`,
        R`\(\mathrm{CH_{4(g)}}+\mathrm{2O_{2(g)}}\rightarrow\mathrm{CO_{2(g)}}+\mathrm{2H_2O_{(g)}}\): Combustión completa`,
        R`\(\mathrm{Cr_2(SO_4)_{3(ac)}}+\mathrm{6KOH_{(ac)}}\rightarrow\mathrm{2Cr(OH)_{3(s)}}+\mathrm{3K_2SO_{4(ac)}}\): Redox`
      ]
    },
    {
      q: 'En relación al uso común de los cristales líquidos, marque la alternativa correcta.',
      o: ['Bombillas LED', 'Sensores de movimiento', 'Pantallas de relojes digitales', 'Discos duros', 'Paneles solares'],
      cols: 1
    },
    {
      q: 'Indique qué semirreacción ocurrirá en el ánodo durante el proceso de electrólisis de una solución acuosa diluida de ácido clorhídrico.',
      o: [
        R`\(\mathrm{H_{2(g)}}+\mathrm{2OH^-_{(ac)}}\rightarrow\mathrm{2H_2O_{(\ell)}}+2e^-\)`,
        R`\(\mathrm{H_{2(g)}}\rightarrow\mathrm{2H^+_{(ac)}}+2e^-\)`,
        R`\(\mathrm{4OH^-_{(ac)}}\rightarrow\mathrm{O_{2(g)}}+\mathrm{2\,H_2O_{(\ell)}}+4e^-\)`,
        R`\(\mathrm{2H_2O_{(\ell)}}\rightarrow\mathrm{O_{2(g)}}+\mathrm{4H^+_{(ac)}}+4e^-\)`,
        R`\(\mathrm{2Cl^-_{(ac)}}\rightarrow\mathrm{Cl_{2(g)}}+2e^-\)`
      ],
      cols: 1
    },
    {
      q: R`¿Cuál de los siguientes elementos químicos es un metal alcalino-térreo del periodo 3 y que es usado en la elaboración de luces de bengala?
        <span class="uexam__data">Dato: números atómicos: Na = 11; Mg = 12; Aℓ = 13; Si = 14; Cℓ = 17</span>`,
      o: ['Cℓ', 'Na', 'Si', 'Aℓ', 'Mg']
    },
    {
      q: 'Calcule el estado de oxidación del átomo central en cada uno de los compuestos químicos que figuran en cada proposición, en el orden que aparecen.',
      items: [
        'El permanganato de potasio es un compuesto utilizado como agente oxidante en muchas reacciones químicas.',
        'El ácido sulfúrico es un compuesto químico corrosivo y, a nivel mundial, es el más producido.',
        'El ácido perclórico es un potente oxidante y puede reaccionar con hidrocarburos.'
      ],
      after: 'Marque la alternativa que presenta la secuencia correcta.',
      o: ['+7, +7, +7', '−7, −6, +7', '+7, −6, −7', '+7, +6, +7', '+7, −7, +7'],
      cols: 1
    },
    {
      q: 'Determine la veracidad (V) o falsedad (F), respecto a los tipos de nomenclatura inorgánica.',
      items: [
        'La nomenclatura Stock utiliza los números romanos para determinar los estados de oxidación de las especies químicas.',
        'La nomenclatura Sistemática hace uso de prefijos y sufijos, según el número de especies químicas presentes en la fórmula.',
        'La nomenclatura Stock es utilizada solo para las funciones donde se encuentran las especies químicas no metálicas.'
      ],
      after: vf,
      o: ['FFF', 'FFV', 'VVV', 'VVF', 'VFF']
    },
    {
      q: R`Calcule la molaridad (en mol/L) de una solución acuosa que resulta al disolver 3,87&nbsp;g de \(\mathrm{K_2Cr_2O_7}\) en un volumen final de 35&nbsp;mL.
        <span class="uexam__data">Dato: masa molar \(\mathrm{K_2Cr_2O_7}=294\ g/mol\)</span>`,
      o: ['0,13', '0,26', '0,37', '0,57', '0,98']
    },
    {
      q: 'Complete correctamente la siguiente afirmación:<br>“El número cuántico <span class="uexam__blank"></span> determina las orientaciones espaciales de los orbitales atómicos y toma valores <span class="uexam__blank"></span>”',
      o: [
        'azimutal, enteros entre 0 y (n−1)',
        'principal, enteros y positivos',
        'spin, de +1/2 y −1/2',
        R`magnético, enteros entre \(-\ell\) y \(+\ell\)`,
        'momento angular, enteros entre 0 y (n−1)'
      ],
      cols: 1
    },
    {
      q: 'Con respecto a las siguientes proposiciones:',
      items: [
        'Las celdas de combustión sirven para obtener energía calorífica.',
        'La nanotecnología ha permitido el desarrollo de materiales con nuevas y mejores propiedades.',
        'Los nuevos polímeros orgánicos solo se destruyen a temperaturas superiores que las temperaturas de fusión de muchos metales.'
      ],
      after: 'Marque la alternativa correcta.',
      o: ['Solo I', 'Solo II', 'Solo III', 'I y II', 'II y III']
    },
    {
      q: 'Respecto a los ácidos y bases, señale si las siguientes proposiciones son verdaderas (V) o falsas (F).',
      items: [
        'La solución acuosa de una sustancia que presenta un pOH = 2 es ácida a 25&nbsp;°C.',
        'Todas las sustancias denominadas bases débiles son insolubles en agua.',
        R`Una sustancia ácida, que se disuelve en agua, puede producir iones hidronio (\(\mathrm{H_3O^+}\)).`
      ],
      after: vf,
      o: ['VFV', 'VFF', 'FVF', 'FFV', 'VVF']
    },
    {
      q: R`Calcule cuántos miliequivalentes (meq) de \(\mathrm{A\ell C\ell_3}\) hay en 60&nbsp;mL de una solución que contiene 50&nbsp;g/L de \(\mathrm{A\ell C\ell_3}\).
        <span class="uexam__data">Dato: masas atómicas: Cℓ = 35,5; Aℓ = 27</span>`,
      o: ['67,31', '67,41', '67,48', '67,53', '67,56']
    },
    {
      q: R`La morfina es un compuesto químico que se extrae del opio. Además, es un analgésico usado en medicina y presenta la siguiente estructura:
        [[fig:c36]]
        Al respecto, indique ¿qué grupos funcionales presenta la morfina?`,
      o: ['Alcohol, amina, ácido carboxílico', 'Aldehído, amina, alqueno', 'Aldehído, amida, éter', 'Alcohol, amina, éter', 'Aldehído, amida, alqueno'],
      cols: 1
    },
    {
      q: 'Respecto a las ventajas del uso de las tecnologías limpias, se tiene las siguientes proposiciones:',
      items: [
        'Hace posible la administración de recursos naturales y reduce los desechos producidos.',
        'Permite el reciclaje de los desechos industriales.',
        'Hace posible el uso de los recursos naturales en forma desmedida.'
      ],
      after: 'Marque la alternativa correcta.',
      o: ['Solo I', 'Solo II', 'Solo III', 'I y II', 'I, II y III']
    },
    {
      q: 'Las propiedades de las sustancias son características que se presentan para diferenciarse unas de otras. Marque la alternativa que presenta propiedades intensivas y físicas a la vez.',
      o: ['Oxidabilidad, peso', 'Volumen, densidad', 'Maleabilidad, tamaño', 'Color, densidad', 'Peso, volumen'],
      cols: 1
    },
    {
      q: 'Indique el sistema en equilibrio que no se perturba al aumentar la presión a temperatura constante.',
      o: [
        R`\(\mathrm{PC\ell_{5(g)}}\rightleftarrows\mathrm{PC\ell_{3(g)}}+\mathrm{C\ell_{2(g)}}\)`,
        R`\(\mathrm{2SO_{2(g)}}+\mathrm{O_{2(g)}}\rightleftarrows\mathrm{2SO_{3(g)}}\)`,
        R`\(\mathrm{2H_{2(g)}}+\mathrm{O_{2(g)}}\rightleftarrows\mathrm{2H_2O_{(g)}}\)`,
        R`\(\mathrm{H_{2(g)}}+\mathrm{I_{2(g)}}\rightleftarrows\mathrm{2HI_{(g)}}\)`,
        R`\(\mathrm{2NH_{3(g)}}\rightleftarrows\mathrm{N_{2(g)}}+\mathrm{3H_{2(g)}}\)`
      ],
      cols: 1
    },
    {
      q: 'Respecto al comportamiento de los electrodos en una celda electrolítica, marque la alternativa correcta.',
      o: [
        'El ánodo es el polo negativo, porque atrae cationes.',
        'El cátodo es el electrodo donde ocurre la oxidación.',
        'Ambos electrodos ganan electrones por acción de la corriente.',
        'La oxidación ocurre en el ánodo, que es el polo positivo.',
        'En la electrólisis, el cátodo siempre es el polo positivo, porque recibe electrones del ánodo.'
      ]
    }
  ]
};
