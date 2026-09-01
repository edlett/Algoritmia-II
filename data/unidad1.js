/* ============================================================
   unidad1.js — Vectores (arreglos unidimensionales). 10 h.
   Todo el pseudocódigo está en el dialecto Libro y sale del
   Manual de Informática II o de los ejercicios propuestos.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};
  AYP.data.unidades = AYP.data.unidades || {};

  AYP.data.unidades[1] = {
    id: 1, nombre: 'Vectores', corte: 'arreglos', horas: 10,
    temas: [

      /* ------------------------------------------------ */
      {
        id: 'vector-anatomia',
        viz: ['patrones-vector'],
        titulo: 'Anatomía de un vector',
        semana: 1, horas: 2, manual: '§1.1', clave: true,
        resumen: 'Qué es una posición, qué es un contenido y por qué el índice empieza en 1.',
        teoria: {
          notacion: 'V = (V_1,\\ V_2,\\ \\dots,\\ V_N) \\qquad 1 \\le i \\le N',
          concepto: 'Un vector V de N elementos es un bloque de memoria contigua con N casillas numeradas. V(I) no es «el elemento I»: es el contenido de la posición I. Confundir posición con contenido es el error del que se derivan casi todos los demás.',
          procedimiento: [
            'Se declara implícitamente al usarlo: el manual no declara tipos.',
            'Se llena recorriendo con un PARA desde 1 hasta N.',
            'Se accede siempre por su nombre y un índice entre paréntesis: V(I).',
            'El índice tiene que ser un entero entre 1 y N.'
          ],
          logica: 'El índice base 1 del pseudocódigo choca con el base 0 de Java. En el parcial se escribe V(1) para el primero; al pasar a Java, ese mismo elemento es V[0]. El desfase sólo aparece en la traducción, nunca antes.',
          trampas: [
            'Empezar el recorrido en 0. En pseudocódigo el primer elemento es V(1).',
            'Escribir V[I] cuando el profesor explica en el tablero: él usa paréntesis en el libro y corchetes en los parciales. Ambas se entienden.',
            'Usar N como si fuera el último índice válido y a la vez el tamaño: son lo mismo aquí, precisamente porque se cuenta desde 1.'
          ]
        },
        patrones: ['lectura-masiva'],
        ejemplos: [{
          id: 'e-v-lectura',
          enunciado: 'Leer un vector de N elementos y volver a escribirlo',
          fuente: 'Manual §1.1',
          codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    PARA I = 1, N, 1 HAGA
        ESCRIBA V(I)
    F-PARA
FIN`,
          entradas: [5, 12, 7, 30, 4, 19],
          hoja: ['I', 'N'],
          explicacion: 'Dos recorridos independientes. El primero llena; el segundo muestra. Fíjate en el panel de memoria: en el primer ciclo las celdas se pintan de verde (escritura) y en el segundo de azul (lectura).'
        }],
        banco: [
          { id: 'u1-an-01', enunciado: 'Leer un vector de N elementos y escribir sólo los que están en posición impar.', dificultad: 'baja', estructura: ['recorrido'], fuente: 'derivado de §2.3-4' },
          { id: 'u1-an-02', enunciado: 'Dado un vector de N elementos, escribirlo en orden inverso sin modificarlo.', dificultad: 'baja', estructura: ['recorrido'], nota: 'PARA I = N, 1, -1 HAGA' },
          { id: 'u1-an-03', enunciado: 'Invertir los elementos de un vector de tamaño N intercambiando el primero con el último, el segundo con el penúltimo y así sucesivamente.', dificultad: 'media', estructura: ['intercambio', 'recorrido'], fuente: 'Manual §1.2.6 misceláneas 3', nota: 'Sólo hay que recorrer hasta la mitad: [| N/2 |].' }
        ]
      },

      /* ------------------------------------------------ */
      {
        id: 'patrones-vector',
        viz: ['patrones-vector'],
        titulo: 'Los cinco patrones de recorrido',
        semana: 2, horas: 3, manual: '§1.1 ej. 1 y 5', clave: true,
        resumen: 'Acumulador, contador, máximo, mínimo y bandera: con estos cinco se resuelve la mitad del curso.',
        teoria: {
          notacion: 'S=\\sum_{i=1}^{N} V_i \\qquad \\bar{x}=\\frac{1}{N}\\sum_{i=1}^{N} V_i',
          concepto: 'Casi todo ejercicio de vectores es una combinación de cinco patrones. No son fórmulas que memorizar sino formas de recorrer: lo que cambia entre ellos es qué se inicializa antes del ciclo y qué se actualiza dentro.',
          procedimiento: [
            'Acumulador: S ← 0 antes del ciclo, S ← S + V(I) dentro.',
            'Contador: C ← 0 antes, C ← C + 1 dentro de un SI.',
            'Máximo: MAY ← V(1) antes, y el ciclo arranca en I = 2.',
            'Mínimo: idéntico al máximo cambiando > por <.',
            'Bandera: SW ← 0 antes, SW ← 1 al encontrar; el MQ para en cuanto SW cambia.'
          ],
          logica: 'El máximo se inicializa con el primer elemento, no con cero. Con cero, un vector de puros negativos daría 0 como máximo, que no está en el vector. Por eso el ciclo empieza en 2: el primero ya está considerado.',
          trampas: [
            'Inicializar el acumulador dentro del ciclo: se reinicia en cada vuelta y al final vale sólo el último término.',
            'Inicializar el máximo en 0 en vez de en V(1).',
            'En un producto, inicializar en 0 en vez de en 1: lo anula todo.'
          ]
        },
        patrones: ['acumulador', 'contador', 'maximo', 'bandera'],
        ejemplos: [
          {
            id: 'e-v-mayor',
            enunciado: 'Sea un vector V de N elementos, desarrolle un algoritmo que encuentre el mayor elemento',
            fuente: 'Manual §1.1, ejemplo 1',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    MAY ← V(1)
    PARA I = 2, N, 1 HAGA
        SI (V(I) > MAY) ENTONCES
            MAY ← V(I)
        F-SI
    F-PARA
    ESCRIBA "El mayor elemento es", MAY
FIN`,
            entradas: [6, 12, 7, 30, 4, 30, 19],
            hoja: ['I', 'MAY'],
            explicacion: 'Mira la columna MAY en la hoja: sólo cambia cuando aparece un valor mayor. El vector tiene el 30 repetido a propósito: el algoritmo no lo cambia la segunda vez porque la condición es > y no >=.'
          },
          {
            id: 'e-v-mayormenor',
            enunciado: 'Escribir cada elemento de un vector y hallar el mayor y el menor',
            fuente: 'Manual §1.1, ejemplo 5',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    MAY ← V(1)
    PARA I = 2, N, 1 HAGA
        SI (V(I) > MAY) ENTONCES
            MAY ← V(I)
        F-SI
    F-PARA
    MEN ← V(1)
    PARA I = 2, N, 1 HAGA
        SI (V(I) < MEN) ENTONCES
            MEN ← V(I)
        F-SI
    F-PARA
    ESCRIBA MAY, MEN
FIN`,
            entradas: [5, 8, 3, 15, 1, 9],
            hoja: ['I', 'MAY', 'MEN'],
            explicacion: 'El manual lo resuelve con dos recorridos separados. Se puede hacer en uno solo con dos SI dentro del mismo PARA; pruébalo en el banco de trabajo y compara el número de pasos que reporta la traza.'
          },
          {
            id: 'e-v-sumapares',
            enunciado: 'Contar cuántos elementos pares hay en un vector y sumarlos',
            fuente: 'derivado de §1.2.6 misceláneas 1',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    C ← 0
    S ← 0
    PARA I = 1, N, 1 HAGA
        SI (V(I) MOD 2 = 0) ENTONCES
            C ← C + 1
            S ← S + V(I)
        F-SI
    F-PARA
    ESCRIBA "Pares:", C, "Suma:", S
FIN`,
            entradas: [6, 4, 7, 10, 3, 8, 5],
            hoja: ['I', 'C', 'S'],
            explicacion: 'Contador y acumulador conviviendo en el mismo ciclo. Los dos se inicializan fuera; los dos se actualizan sólo dentro del SI.'
          }
        ],
        banco: [
          { id: 'u1-pa-01', enunciado: 'Dado un vector de N elementos, calcular cuántos negativos, cuántos positivos y cuántos ceros hay.', dificultad: 'baja', estructura: ['contador'], fuente: 'Manual §1.2.6 misceláneas 1' },
          { id: 'u1-pa-02', enunciado: 'Calcular el promedio de los elementos de un vector de tamaño N.', dificultad: 'baja', estructura: ['acumulador'] },
          { id: 'u1-pa-03', enunciado: 'Calcular el número de elementos diferentes que hay en un vector de tamaño N.', dificultad: 'alta', estructura: ['contador', 'doble-ciclo', 'bandera'], fuente: 'Manual §1.2.6 misceláneas 2', nota: 'Por cada elemento, mirar si ya apareció antes: doble ciclo con bandera.' },
          { id: 'u1-pa-04', enunciado: 'Dado un vector A de N elementos, extraer los números primos a un vector B y los perfectos a un vector C.', dificultad: 'alta', estructura: ['contador', 'doble-ciclo'], fuente: 'Manual §1.2.6 subrutinas 2', nota: 'Primo: contar divisores exactos de 2 a numero/2. Perfecto: la suma de sus divisores propios es el número.' },
          { id: 'u1-pa-05', enunciado: 'Generar un vector con los elementos de la serie de Fibonacci menores o iguales a un número dado.', dificultad: 'media', estructura: ['acumulador'], fuente: 'Manual §1.2.6 subrutinas 4' },
          { id: 'u1-pa-06', enunciado: 'Hallar la suma de los N primeros términos de la serie S = X − 3X²/2 + 5X⁴/6 − 7X⁸/24 + 9X¹⁶/120 …', dificultad: 'alta', estructura: ['acumulador', 'bandera'], fuente: 'Manual §1.2.6 subrutinas 6', nota: 'Tres cosas avanzan a la vez: el signo (signo ← signo * (−1)), el numerador impar y el exponente que se duplica.' }
        ]
      },

      /* ------------------------------------------------ */
      {
        id: 'busqueda',
        viz: ['busqueda-binaria'],
        titulo: 'Búsqueda lineal y binaria',
        semana: 2, horas: 2, manual: '§3.1 ej. 2',
        resumen: 'Encontrar un valor: recorriendo con bandera, o partiendo el vector por la mitad.',
        teoria: {
          notacion: '\\text{lineal } O(N) \\qquad \\text{binaria } O(\\log_2 N)',
          concepto: 'Buscar es responder «¿está X en el vector, y dónde?». La búsqueda lineal recorre hasta encontrarlo. La binaria sólo funciona si el vector ya está ordenado, y descarta media lista en cada comparación.',
          procedimiento: [
            'Lineal: bandera SW ← 0, avanzar mientras (I <= N) y (SW = 0).',
            'La condición del MQ es doble a propósito: para cuando lo encuentra o cuando se acaba el vector.',
            'Binaria: INI ← 1, FIN ← N, MEDIO ← [| (INI+FIN)/2 |], y se mueve INI o FIN según la comparación.'
          ],
          logica: 'La bandera existe para poder salir antes del final. Sin ella habría que recorrer siempre las N posiciones aunque el elemento estuviera en la primera.',
          trampas: [
            'Poner las dos condiciones del MQ al revés: si se evalúa V(I) antes de comprobar I <= N, se sale del vector.',
            'Usar búsqueda binaria sobre un vector desordenado: da resultados falsos, no error.',
            'Olvidar incrementar I dentro del SINO: el ciclo no termina nunca.'
          ]
        },
        patrones: ['bandera'],
        ejemplos: [
          {
            id: 'e-v-lineal',
            enunciado: 'Dado un vector A de tamaño N, verificar si X está en el vector o no',
            fuente: 'Manual §3.1, ejemplo 2 (versión no recursiva)',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    LEA X
    SW ← 0
    I ← 1
    MQ ((I <= N) y (SW = 0)) HAGA
        SI (V(I) = X) ENTONCES
            SW ← 1
        SINO
            I ← I + 1
        F-SI
    F_MQ
    SI (SW = 1) ENTONCES
        ESCRIBA "Existe, en la posición", I
    SINO
        ESCRIBA "No existe"
    F-SI
FIN`,
            entradas: [6, 4, 8, 15, 16, 23, 42, 16],
            hoja: ['I', 'SW'],
            explicacion: 'Sigue la bandera SW en la hoja: vale 0 en todas las vueltas hasta que encuentra el 16, y ahí pasa a 1 y el ciclo se detiene. El puntero ▲ del panel de memoria marca dónde está mirando.'
          },
          {
            id: 'e-v-binaria',
            enunciado: 'Buscar X en un vector ORDENADO partiendo el rango por la mitad',
            fuente: 'complemento (no está en el manual)',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    LEA X
    INI ← 1
    FN ← N
    SW ← 0
    MQ ((INI <= FN) y (SW = 0)) HAGA
        MEDIO ← [| (INI + FN) / 2 |]
        SI (V(MEDIO) = X) ENTONCES
            SW ← 1
        SINO
            SI (V(MEDIO) < X) ENTONCES
                INI ← MEDIO + 1
            SINO
                FN ← MEDIO - 1
            F-SI
        F-SI
    F_MQ
    SI (SW = 1) ENTONCES
        ESCRIBA "Existe, en la posición", MEDIO
    SINO
        ESCRIBA "No existe"
    F-SI
FIN`,
            entradas: [8, 2, 5, 8, 12, 20, 31, 44, 57, 44],
            hoja: ['INI', 'FN', 'MEDIO', 'SW'],
            explicacion: 'Compara el número de pasos que reporta la traza con el de la búsqueda lineal sobre el mismo vector. Con 8 elementos la diferencia ya se nota; con 1000 sería abismal.'
          }
        ],
        banco: [
          { id: 'u1-bu-01', enunciado: 'Buscar en un vector todas las posiciones donde aparece un valor X (puede repetirse).', dificultad: 'media', estructura: ['recorrido', 'contador'], nota: 'Aquí no sirve la bandera: hay que recorrer entero.' },
          { id: 'u1-bu-02', enunciado: 'Dado un vector A de n elementos, devolver 0 si está ordenado ascendentemente, 1 si está desordenado y 2 si está ordenado descendentemente.', dificultad: 'media', estructura: ['bandera', 'recorrido'], fuente: 'Manual §1.2.6 funciones 6' },
          { id: 'u1-bu-03', enunciado: 'Eliminar de un vector de N elementos los números primos que estén repetidos, de forma que de cada uno quede sólo uno.', dificultad: 'alta', estructura: ['doble-ciclo', 'bandera'], fuente: 'Manual §1.2.6 misceláneas 5' }
        ]
      },

      /* ------------------------------------------------ */
      {
        id: 'insercion-borrado',
        viz: ['insercion'],
        titulo: 'Inserción y borrado',
        semana: 3, horas: 2, manual: 'syllabus, unidad I',
        resumen: 'Meter y sacar elementos de un vector reajustando los índices.',
        teoria: {
          notacion: '\\text{insertar en } p:\\quad V_{i+1} \\leftarrow V_i, \\quad i = N, \\dots, p',
          concepto: 'Un vector tiene tamaño fijo, así que insertar no es «hacer sitio»: es desplazar todo lo que está a la derecha de la posición K una casilla más allá, y luego escribir. Borrar es lo simétrico, y además reduce N.',
          procedimiento: [
            'Insertar en K: recorrer DESDE EL FINAL hacia K, copiando V(I) en V(I+1).',
            'Después de desplazar, escribir el nuevo valor en V(K) y aumentar N.',
            'Borrar en K: recorrer DESDE K hacia el final, copiando V(I+1) en V(I).',
            'Después de desplazar, reducir N en 1.'
          ],
          logica: 'La dirección del desplazamiento no es opcional. Al insertar se va de derecha a izquierda porque cada casilla se copia a una que ya está libre; si se hiciera al revés, la primera copia machacaría el valor que todavía falta mover, y el vector se llenaría del mismo número.',
          trampas: [
            'Desplazar en la dirección equivocada: el síntoma es que todo el vector se llena con el mismo valor.',
            'Olvidar actualizar N: el elemento se inserta pero no se ve al imprimir.',
            'Insertar en una posición mayor que N+1 o menor que 1.'
          ]
        },
        patrones: ['desplazamiento'],
        ejemplos: [
          {
            id: 'e-v-insertar',
            enunciado: 'Insertar el valor X en la posición K de un vector de N elementos',
            fuente: 'syllabus, unidad I',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    LEA K, X
    PARA I = N, K, -1 HAGA
        V(I + 1) ← V(I)
    F-PARA
    V(K) ← X
    N ← N + 1
    PARA I = 1, N, 1 HAGA
        ESCRIBA V(I)
    F-PARA
FIN`,
            entradas: [5, 10, 20, 30, 40, 50, 3, 99],
            hoja: ['I', 'K', 'N'],
            explicacion: 'El PARA va de N hacia K con paso −1. En el panel de memoria verás la cola del vector corriéndose una casilla a la derecha antes de que el 99 aterrice en la posición 3.'
          },
          {
            id: 'e-v-borrar',
            enunciado: 'Eliminar el elemento de la posición K de un vector de N elementos',
            fuente: 'syllabus, unidad I',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    LEA K
    PARA I = K, N - 1, 1 HAGA
        V(I) ← V(I + 1)
    F-PARA
    N ← N - 1
    PARA I = 1, N, 1 HAGA
        ESCRIBA V(I)
    F-PARA
FIN`,
            entradas: [5, 10, 20, 30, 40, 50, 2],
            hoja: ['I', 'K', 'N'],
            explicacion: 'Al borrar se avanza de izquierda a derecha. Fíjate en que la última casilla conserva su valor viejo: no se borra, simplemente deja de contarse porque N bajó.'
          }
        ],
        banco: [
          { id: 'u1-in-01', enunciado: 'Insertar un valor X en un vector ordenado de forma que siga ordenado.', dificultad: 'media', estructura: ['desplazamiento', 'bandera'], nota: 'Primero buscar la posición, después desplazar.' },
          { id: 'u1-in-02', enunciado: 'Eliminar de un vector todos los elementos iguales a X, dejándolo compacto.', dificultad: 'alta', estructura: ['desplazamiento', 'contador'] }
        ]
      },

      /* ------------------------------------------------ */
      {
        id: 'burbuja',
        viz: ['burbuja', 'intercalacion'],
        titulo: 'Ordenamiento por el método de la Burbuja',
        semana: 3, horas: 3, manual: '§1.1 ej. 2', clave: true,
        resumen: 'El único algoritmo de ordenamiento que pide el syllabus, y el intercambio con variable temporal.',
        teoria: {
          notacion: '\\text{comparaciones} = \\frac{N(N-1)}{2} \\in O(N^2)',
          concepto: 'La Burbuja compara pares de elementos y los intercambia si están en el orden equivocado. Repite el barrido hasta que ya no queda nada que intercambiar. El manual lo escribe con dos PARA anidados: el de fuera fija una posición y el de dentro la compara contra todas las siguientes.',
          procedimiento: [
            'El PARA exterior va de 1 a N−1: la última posición se acomoda sola.',
            'El PARA interior arranca en I+1: lo anterior a I ya está ordenado.',
            'Si A(I) > A(J), se intercambian con la variable temporal T.',
            'El intercambio son tres líneas: guardar, copiar, restituir.'
          ],
          logica: 'El intercambio necesita una tercera variable porque asignar A(I) ← A(J) destruye el valor que había en A(I) antes de haberlo guardado. T es la mano libre que sostiene un vaso mientras se cambian los otros dos de sitio.',
          trampas: [
            'Intercambiar en dos líneas sin T: los dos elementos acaban valiendo lo mismo.',
            'Arrancar el ciclo interior en 1 en vez de en I+1: funciona, pero hace el doble de comparaciones.',
            'Poner el PARA exterior hasta N: la última vuelta no compara nada y sobra.'
          ]
        },
        patrones: ['intercambio', 'doble-ciclo'],
        ejemplos: [
          {
            id: 'e-v-burbuja',
            enunciado: 'Desarrolle un algoritmo que ordene un vector A de N elementos ascendentemente',
            fuente: 'Manual §1.1, ejemplo 2',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA A(I)
    F-PARA
    PARA I = 1, N-1, 1 HAGA
        PARA J = I+1, N, 1 HAGA
            SI (A(I) > A(J)) ENTONCES
                T ← A(I)
                A(I) ← A(J)
                A(J) ← T
            F-SI
        F-PARA
    F-PARA
    PARA I = 1, N, 1 HAGA
        ESCRIBA A(I)
    F-PARA
FIN`,
            entradas: [6, 5, 2, 9, 1, 7, 3],
            hoja: ['I', 'J', 'T'],
            explicacion: 'Reprodúcelo a velocidad 2× y mira sólo el panel de memoria: cada intercambio pinta dos celdas de verde a la vez. El contador de visitas del margen izquierdo te dice cuántas veces se ejecutó la comparación — ése número es el coste del algoritmo.'
          },
          {
            id: 'e-v-swap',
            enunciado: 'Por qué el intercambio necesita una variable temporal',
            fuente: 'demostración',
            codigo: `INICIO
    A ← 10
    B ← 20
    T ← A
    A ← B
    B ← T
    ESCRIBA "Con T:", A, B
    C ← 10
    D ← 20
    C ← D
    D ← C
    ESCRIBA "Sin T:", C, D
FIN`,
            entradas: [],
            hoja: ['A', 'B', 'C', 'D', 'T'],
            explicacion: 'La segunda mitad es el error clásico, ejecutándose. Al llegar a D ← C, la variable C ya vale 20: el 10 original se perdió en la línea anterior y las dos acaban valiendo 20.'
          }
        ],
        banco: [
          { id: 'u1-bur-01', enunciado: 'Ordenar un vector descendentemente por el método de la Burbuja.', dificultad: 'baja', estructura: ['intercambio', 'doble-ciclo'], nota: 'Basta cambiar el sentido de la comparación.' },
          { id: 'u1-bur-02', enunciado: 'Ordenar un vector y decir cuántos intercambios hicieron falta.', dificultad: 'baja', estructura: ['intercambio', 'contador'] },
          { id: 'u1-bur-03', enunciado: 'Dados dos vectores A de tamaño N y B de tamaño M, ambos YA ordenados, fusionarlos en un tercer vector C de tamaño N+M que quede ordenado.', dificultad: 'alta', estructura: ['doble-puntero'], nota: 'Intercalación: dos punteros avanzando a distinto ritmo, y al final volcar la cola del que sobre.' },
          { id: 'u1-bur-04', enunciado: 'Ordenar un vector y, sin volver a recorrerlo, decir si estaba ya ordenado de entrada.', dificultad: 'media', estructura: ['bandera', 'intercambio'] }
        ]
      }
    ]
  };
})();
