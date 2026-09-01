/* ============================================================
   unidad5.js — Recursividad (12 h) y concepto de memoria (2 h).
   El método de las dos preguntas es literal del §3 del manual.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};
  AYP.data.unidades = AYP.data.unidades || {};

  AYP.data.unidades[5] = {
    id: 5, nombre: 'Recursividad', corte: 'recursividad', horas: 12,
    temas: [

      {
        id: 'dos-preguntas',
        viz: ['arbol-recursion'],
        titulo: 'El método de las dos preguntas',
        semana: 13, horas: 3, manual: '§3 y §3.1 ej. 1', clave: true,
        resumen: 'Caso base y llamador más pequeño: el criterio con el que el profesor corrige toda recursión.',
        teoria: {
          notacion: 'n! = \\begin{cases} 1 & \\text{si } n \\le 1 \\\\ n \\cdot (n-1)! & \\text{si } n > 1 \\end{cases}',
          concepto: 'Recursividad es un procedimiento que se llama a sí mismo. Es una alternativa que reemplaza a las estructuras repetitivas y sirve para problemas que no se resuelven bien con ciclos. Para que sea correcta no debe generar una secuencia infinita de llamadas.',
          procedimiento: [
            'Pregunta 1, CASO-BASE: ¿hay una salida no recursiva, y el procedimiento funciona para ese caso?',
            'Pregunta 2, LLAMADOR MÁS PEQUEÑO: ¿cada llamada recursiva se refiere a un caso más pequeño del problema original?',
            'Si alguna respuesta es «no», la recursión no termina.',
            'En el código, el caso base es la rama del SI y el llamador más pequeño la del SINO.'
          ],
          logica: 'Cada llamada apila un marco en memoria con sus propias variables locales. El caso base es lo único que detiene el apilamiento; a partir de ahí la pila se deshace hacia atrás devolviendo valores. Por eso una recursión sin caso base no da un resultado equivocado: agota la memoria.',
          trampas: [
            'Escribir el caso base pero que no devuelva nada.',
            'Llamar con el mismo argumento: f(N) llamando a f(N), o incluso a f(N+1).',
            'Poner la llamada recursiva antes de comprobar el caso base.',
            'Creer que recursivo es siempre mejor: para el factorial, la versión con ciclo usa una sola casilla de memoria y la recursiva usa N.'
          ]
        },
        patrones: ['caso-base'],
        ejemplos: [
          {
            id: 'e-r-factorial',
            enunciado: 'Halle el factorial de un número n, en las dos versiones',
            fuente: 'Manual §3.1, ejemplo 1',
            codigo: `FUNCION factorial (N)
    SI (N = 0) ENTONCES
        factorial ← 1
    SINO
        factorial ← N * factorial(N - 1)
    F_SI
FIN_FUNCION

FUNCION factorIterativo (N)
    FACTOR ← 1
    PARA I = 1, N, 1 HAGA
        FACTOR ← FACTOR * I
    F_PARA
    factorIterativo ← FACTOR
FIN_FUNCION

INICIO
    LEA X
    ESCRIBA "Recursivo:", factorial(X)
    ESCRIBA "Iterativo:", factorIterativo(X)
FIN`,
            entradas: [5],
            hoja: ['N', 'I', 'FACTOR'],
            explicacion: 'Reproduce y mira sólo el panel «Pila de llamadas». En la versión recursiva la pila crece hasta seis marcos y luego se deshace uno a uno; en la iterativa nunca pasa de dos. Ésa es exactamente la diferencia de coste en memoria que el syllabus pide analizar.'
          },
          {
            id: 'e-r-potencia',
            enunciado: 'Hallar X elevado a N de forma recursiva',
            fuente: 'Manual §3.1, ejemplo 4',
            codigo: `FUNCION potencia (X1, N1)
    SI (N1 = 1) ENTONCES
        potencia ← X1
    SINO
        potencia ← X1 * potencia(X1, N1 - 1)
    F_SI
FIN_FUNCION

INICIO
    LEA X, N
    Y ← potencia(X, N)
    ESCRIBA "El resultado es", Y
FIN`,
            entradas: [3, 4],
            hoja: ['X1', 'N1'],
            explicacion: 'El caso base aquí es N1 = 1, no N1 = 0: cada función elige el suyo. Comprueba la pregunta 2: la llamada es a N1 − 1, estrictamente más pequeño. Fíjate en la columna N1 de la hoja: baja 4, 3, 2, 1 y ahí para.'
          },
          {
            id: 'e-r-mcd',
            enunciado: 'Algoritmo de Euclides recursivo: MCD(M,N) = M si N = 0, y MCD(N, M mod N) si N > 0',
            fuente: 'Manual §3.2-8',
            codigo: `FUNCION mcd (M, N)
    SI (N = 0) ENTONCES
        mcd ← M
    SINO
        mcd ← mcd(N, M MOD N)
    F_SI
FIN_FUNCION

INICIO
    LEA A, B
    ESCRIBA "MCD:", mcd(A, B)
FIN`,
            entradas: [48, 18],
            hoja: ['M', 'N'],
            explicacion: 'El llamador más pequeño no siempre es «uno menos»: aquí es el residuo, que baja mucho más rápido. La columna N de la hoja va 18, 12, 6, 0 y en cuatro llamadas termina.'
          }
        ],
        banco: [
          { id: 'u5-dp-01', enunciado: 'Escribir la suma de los N primeros naturales de forma recursiva y señalar el caso base y el llamador más pequeño.', dificultad: 'baja', estructura: ['caso-base'] },
          { id: 'u5-dp-02', enunciado: 'Se dice que dos números son amigos si cada uno es igual a la suma de los divisores del otro (220 y 284). Resolverlo utilizando sólo funciones recursivas.', dificultad: 'alta', estructura: ['caso-base', 'acumulador'], fuente: 'Manual §3.2-1' },
          { id: 'u5-dp-03', enunciado: 'Diga cuántos y cuáles números de tres cifras (100 a 999) no tienen dígitos repetidos. No utilice cadenas. Use por lo menos una función y una subrutina.', dificultad: 'alta', estructura: ['caso-base', 'contador'], fuente: 'Manual §3.2-6' },
          { id: 'u5-dp-04', enunciado: 'Dada una función recursiva sin caso base, explicar qué ocurre en memoria y en qué línea habría que arreglarla.', dificultad: 'baja', estructura: ['teoria'] }
        ]
      },

      {
        id: 'recursion-arreglos',
        viz: ['arbol-recursion'],
        titulo: 'Recursividad sobre vectores y matrices',
        semana: 14, horas: 4, manual: '§3.1 ej. 2, 3 y 7', clave: true,
        resumen: 'Recorrer sin ciclos: el índice viaja como parámetro y la condición de parada sustituye al F-PARA.',
        teoria: {
          notacion: '\\text{suma}(V, i) = \\begin{cases} 0 & \\text{si } i > N \\\\ V_i + \\text{suma}(V, i+1) & \\text{si } i \\le N \\end{cases}',
          concepto: 'Para recorrer un arreglo recursivamente, el índice deja de ser una variable de ciclo y pasa a ser un parámetro. Cada llamada procesa una posición y delega el resto en sí misma con el índice avanzado.',
          procedimiento: [
            'Vector: SUBRUTINA leer(V, T, I) con SI (I <= T) ENTONCES … EJECUTE leer(V, T, I+1).',
            'La invocación inicial pasa I = 1.',
            'Matriz: dos condicionales anidados. Se avanza en J y, al agotarse la fila, se salta a I+1 con J = 1.',
            'Función acumuladora: suma(X, I) = suma(X, I−1) + X(I), con caso base I = 1.'
          ],
          logica: 'La versión que acumula hacia atrás —suma(X, I−1) + X(I)— es más natural que la que acumula hacia adelante, porque el caso base queda en el primer elemento y no hace falta arrastrar un total como parámetro.',
          trampas: [
            'Olvidar pasar el índice inicial en la primera invocación.',
            'En la matriz, saltar a I+1 sin poner J de vuelta en 1.',
            'Poner la llamada recursiva fuera del SI: se ejecuta siempre y no para.'
          ]
        },
        patrones: ['caso-base', 'recorrido'],
        ejemplos: [
          {
            id: 'e-r-vector',
            enunciado: 'Leer un vector y sumar sus elementos, todo de forma recursiva',
            fuente: 'Manual §3.1, ejemplos 2 y 3',
            codigo: `SUBRUTINA leerV(V, T, I)
    SI (I <= T) ENTONCES
        LEA V(I)
        EJECUTE leerV(V, T, I + 1)
    F_SI
FIN_SUBRUTINA

FUNCION suma (X, I)
    SI (I = 1) ENTONCES
        suma ← X(1)
    SINO
        suma ← suma(X, I - 1) + X(I)
    F_SI
FIN_FUNCION

INICIO
    LEA N
    EJECUTE leerV(A, N, 1)
    ESCRIBA "La suma es", suma(A, N)
FIN`,
            entradas: [5, 10, 20, 30, 40, 50],
            hoja: ['I', 'T'],
            explicacion: 'Ni un solo PARA en todo el algoritmo. En el panel de pila verás cinco marcos de leerV apilados antes de que empiecen a deshacerse, y luego otros cinco de suma. Ése apilamiento es lo que el syllabus llama «impacto de la recursividad en la memoria».'
          },
          {
            id: 'e-r-matriz',
            enunciado: 'Leer una matriz de forma recursiva',
            fuente: 'Manual §3.1, ejemplo 7',
            codigo: `SUBRUTINA leamatriz (I, J, N1, M1, MAT)
    SI (I <= N1) ENTONCES
        SI (J <= M1) ENTONCES
            LEA MAT(I, J)
            EJECUTE leamatriz(I, J + 1, N1, M1, MAT)
        SINO
            EJECUTE leamatriz(I + 1, 1, N1, M1, MAT)
        F_SI
    F_SI
FIN_SUBRUTINA

SUBRUTINA escribir (I, J, N1, M1, MAT)
    SI (I <= N1) ENTONCES
        SI (J <= M1) ENTONCES
            ESCRIBA MAT(I, J)
            EJECUTE escribir(I, J + 1, N1, M1, MAT)
        SINO
            EJECUTE escribir(I + 1, 1, N1, M1, MAT)
        F_SI
    F_SI
FIN_SUBRUTINA

INICIO
    LEA N, M
    EJECUTE leamatriz(1, 1, N, M, A)
    EJECUTE escribir(1, 1, N, M, A)
FIN`,
            entradas: [2, 3, 1, 2, 3, 4, 5, 6],
            hoja: ['I', 'J'],
            explicacion: 'Éste es el patrón más difícil del capítulo. El SINO interior es el que hace de «fin de fila»: cuando J se pasa de M1, en vez de leer nada llama otra vez con I+1 y J de vuelta en 1. Sigue las columnas I y J de la hoja para verlo.'
          }
        ],
        banco: [
          { id: 'u5-ra-01', enunciado: 'Sea una cadena de caracteres A, diga cuántas vocales tiene, de forma recursiva.', dificultad: 'media', estructura: ['caso-base', 'recorrer-cadena'], fuente: 'Manual §3.2-4' },
          { id: 'u5-ra-02', enunciado: 'Sea una matriz A cuadrada de N elementos, halle en forma recursiva A elevado a K.', dificultad: 'alta', estructura: ['caso-base', 'doble-ciclo'], fuente: 'Manual §3.2-5' },
          { id: 'u5-ra-03', enunciado: 'Sea una matriz A de N×M, escriba en un vector todos los elementos de la matriz que sean primos, usando subrutinas recursivas.', dificultad: 'alta', estructura: ['caso-base', 'contador'], fuente: 'Manual §3.1 ejemplo 7' },
          { id: 'u5-ra-04', enunciado: 'Hallar la transpuesta de una matriz A de N×M de forma recursiva, aunque no sea cuadrada.', dificultad: 'alta', estructura: ['caso-base'], fuente: 'Manual §3.2-3' }
        ]
      },

      {
        id: 'recursion-avanzada',
        viz: ['arbol-recursion', 'hanoi'],
        titulo: 'Recursión contra iteración',
        semana: 15, horas: 3, manual: '§3', clave: false,
        resumen: 'Cuándo compensa, cuánto cuesta y por qué Fibonacci recursivo es una trampa.',
        teoria: {
          notacion: 'T(n) = 2\\,T(n-1) + 1 \\;\\Longrightarrow\\; T(n) = 2^{n} - 1',
          concepto: 'El syllabus pide analizar la aplicabilidad y la eficiencia de la recursividad. La recursión gana en claridad cuando el problema se define a sí mismo; pierde en memoria siempre, y a veces pierde catastróficamente en tiempo.',
          procedimiento: [
            'Contar los pasos: la traza los reporta al final.',
            'Contar la profundidad máxima de la pila: es la memoria extra que consume.',
            'Buscar subproblemas repetidos: si los hay, la recursión ingenua los recalcula.',
            'Toda recursión simple se puede convertir en ciclo, y al revés.'
          ],
          logica: 'Fibonacci recursivo llama dos veces por nivel, así que el número de llamadas se duplica: para fib(30) son más de un millón, y casi todas recalculan lo mismo. El factorial recursivo llama una sola vez por nivel y por eso sólo cuesta memoria, no tiempo.',
          trampas: [
            'Usar recursión doble sin darse cuenta del coste.',
            'Confundir profundidad de la pila con número de llamadas: fib(6) tiene profundidad 6 pero 25 llamadas.'
          ]
        },
        patrones: ['caso-base'],
        ejemplos: [{
          id: 'e-r-fibonacci',
          enunciado: 'Fibonacci recursivo contra Fibonacci iterativo: el mismo resultado, muy distinto coste',
          fuente: 'complemento',
          codigo: `FUNCION fibR (N)
    SI (N <= 2) ENTONCES
        fibR ← 1
    SINO
        fibR ← fibR(N - 1) + fibR(N - 2)
    F_SI
FIN_FUNCION

FUNCION fibI (N)
    A ← 1
    B ← 1
    SI (N <= 2) ENTONCES
        fibI ← 1
    SINO
        PARA I = 3, N, 1 HAGA
            C ← A + B
            A ← B
            B ← C
        F-PARA
        fibI ← B
    F_SI
FIN_FUNCION

INICIO
    LEA N
    ESCRIBA "Recursivo:", fibR(N)
    ESCRIBA "Iterativo:", fibI(N)
FIN`,
          entradas: [8],
          hoja: ['N', 'A', 'B', 'C'],
          explicacion: 'Con N = 8 la traza ya reporta muchos más pasos en la versión recursiva. Sube a 12 en el banco de trabajo y compara: el iterativo crece de uno en uno y el recursivo se dispara. El motivo es que fibR(5) se calcula varias veces desde ramas distintas.'
        }],
        banco: [
          { id: 'u5-av-01', enunciado: 'Convertir a recursiva la búsqueda lineal con bandera de la unidad 1 y comparar el número de pasos.', dificultad: 'media', estructura: ['caso-base', 'bandera'], fuente: 'Manual §3.1 ejemplo 2' },
          { id: 'u5-av-02', enunciado: 'Sean tres matrices A, B y C del mismo tamaño N y cuadradas. Encuentre la suma de todos los elementos de A y la multiplicación de todos los de B. Si el total de A es mayor que el de B, halle D = A*B − C, si no D = (B+C)*A. Use por lo menos una función o una subrutina.', dificultad: 'alta', estructura: ['descomponer', 'doble-ciclo'], fuente: 'Manual §3.2-2' }
        ]
      },

      {
        id: 'memoria',
        viz: ['lifo-fifo'],
        titulo: 'Memoria: estáticas contra dinámicas',
        semana: 16, horas: 2, manual: 'syllabus, concepto de memoria',
        resumen: 'Pilas, colas y listas, y por qué la pila es exactamente lo que sostiene la recursividad.',
        teoria: {
          notacion: '\\text{pila: LIFO} \\qquad \\text{cola: FIFO}',
          concepto: 'Las estructuras estáticas —vectores y matrices— tienen tamaño fijo y ocupan memoria contigua reservada de antemano. Las dinámicas crecen y decrecen durante la ejecución y viven en memoria enlazada.',
          procedimiento: [
            'Pila (LIFO, Last In First Out): se apila y se desapila por el mismo extremo.',
            'Cola (FIFO, First In First Out): se encola por el final y se desencola por el frente.',
            'Lista: nodos enlazados; insertar y eliminar es re-enlazar punteros, no desplazar datos.'
          ],
          logica: 'La pila no es un tema aparte: es lo que has estado viendo en el panel «Pila de llamadas» durante toda la unidad de recursividad. Cada llamada apila un marco, cada retorno lo desapila, y el orden es estrictamente el último en entrar es el primero en salir. Estudiar los dos temas juntos ahorra la mitad del trabajo.',
          trampas: [
            'Confundir el orden de salida de una pila con el de una cola.',
            'Creer que insertar en una lista cuesta lo mismo que en un vector: en el vector hay que desplazar, en la lista sólo re-enlazar.',
            'Suponer que una estructura dinámica es siempre mejor: el acceso por índice directo sólo lo da el vector.'
          ]
        },
        patrones: ['desplazamiento'],
        ejemplos: [{
          id: 'e-r-pila',
          enunciado: 'Una pila LIFO simulada sobre un vector',
          fuente: 'syllabus, concepto de memoria',
          codigo: `SUBRUTINA apilar (P, TOPE, VALOR)
    TOPE ← TOPE + 1
    P(TOPE) ← VALOR
    ESCRIBA "Apilo", VALOR, "- tope en", TOPE
FIN_SUBRUTINA

SUBRUTINA desapilar (P, TOPE)
    SI (TOPE > 0) ENTONCES
        ESCRIBA "Desapilo", P(TOPE), "- tope en", TOPE - 1
        TOPE ← TOPE - 1
    SINO
        ESCRIBA "La pila esta vacia"
    F-SI
FIN_SUBRUTINA

INICIO
    T ← 0
    EJECUTE apilar(P, T, 10)
    EJECUTE apilar(P, T, 20)
    EJECUTE apilar(P, T, 30)
    EJECUTE desapilar(P, T)
    EJECUTE desapilar(P, T)
    EJECUTE apilar(P, T, 40)
    EJECUTE desapilar(P, T)
FIN`,
          entradas: [],
          hoja: ['TOPE', 'VALOR'],
          explicacion: 'Sale 30 antes que 20 y que 10: último en entrar, primero en salir. Nota que TOPE es un parámetro de Entrada-Salida: entra con un valor y sale modificado. Compara este panel de memoria con el panel «Pila de llamadas» de factorial(5): es la misma estructura.'
        }],
        banco: [
          { id: 'u5-me-01', enunciado: 'Simular una cola FIFO sobre un vector con dos índices, frente y final.', dificultad: 'media', estructura: ['cabecera-sub'] },
          { id: 'u5-me-02', enunciado: 'Explicar por qué la recursividad necesita una pila y qué pasa cuando esa pila se llena.', dificultad: 'baja', estructura: ['teoria'] },
          { id: 'u5-me-03', enunciado: 'Comparar el coste de insertar un elemento al principio de un vector contra insertarlo al principio de una lista enlazada.', dificultad: 'baja', estructura: ['teoria'] }
        ]
      }
    ]
  };
})();
