/* ============================================================
   unidad2.js — Matrices (arreglos bidimensionales). 10 h.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};
  AYP.data.unidades = AYP.data.unidades || {};

  AYP.data.unidades[2] = {
    id: 2, nombre: 'Matrices', corte: 'arreglos', horas: 10,
    temas: [

      {
        id: 'matriz-anatomia',
        viz: ['recorridos-matriz'],
        titulo: 'Matrices y ciclos anidados',
        semana: 4, horas: 3, manual: '§1.1 ej. 3 y 4', clave: true,
        resumen: 'Doble índice, y el reloj I/J: por cada valor de I, J da una vuelta completa.',
        teoria: {
          notacion: 'A_{ij}, \\quad 1 \\le i \\le N,\\ \\ 1 \\le j \\le M \\qquad \\text{pos} = (i-1)\\cdot M + j',
          concepto: 'Una matriz M de N×M es una rejilla: M(I,J) es la casilla de la fila I y la columna J. Se recorre con dos PARA anidados. El de fuera manda sobre las filas y el de dentro sobre las columnas.',
          procedimiento: [
            'PARA I = 1, N, 1 HAGA  → fija una fila.',
            'PARA J = 1, M, 1 HAGA  → recorre esa fila entera.',
            'Cada F-PARA cierra el ciclo que le corresponde: el de dentro primero.',
            'Para recorrer por columnas se intercambian los papeles: I por dentro y J por fuera.'
          ],
          logica: 'El ciclo interior se ejecuta completo por cada vuelta del exterior. Con N=3 y M=4 el cuerpo se ejecuta 12 veces, no 7. Ése producto es lo que hace que las matrices sean caras.',
          trampas: [
            'Escribir M(J,I) cuando se quiere M(I,J): son casillas distintas salvo en la diagonal.',
            'Cerrar los F-PARA en el orden equivocado.',
            'Confundir el número de filas con el de columnas al declarar los límites.'
          ]
        },
        patrones: ['doble-ciclo'],
        ejemplos: [{
          id: 'e-m-lectura',
          enunciado: 'Leer una matriz de N×M y escribirla',
          fuente: 'Manual §1.1',
          codigo: `INICIO
    LEA N, M
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            ESCRIBA A(I,J)
        F-PARA
    F-PARA
FIN`,
          entradas: [3, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          hoja: ['I', 'J'],
          explicacion: 'Sigue las columnas I y J en la hoja: J llega a 3 y vuelve a 1 mientras I avanza sólo una casilla. Ése es el reloj de los ciclos anidados.'
        }],
        banco: [
          { id: 'u2-an-01', enunciado: 'Leer una matriz de N×M y hallar la suma de todos sus elementos.', dificultad: 'baja', estructura: ['doble-ciclo', 'acumulador'] },
          { id: 'u2-an-02', enunciado: 'Hallar el mayor elemento de una matriz e informar en qué fila y columna está.', dificultad: 'media', estructura: ['doble-ciclo', 'maximo'] },
          { id: 'u2-an-03', enunciado: 'Cada alumno del Departamento de Sistemas tiene sus calificaciones en una matriz de N×8: la primera columna es el código y las otras siete las notas. Obtener la nota definitiva de cada alumno, cuántas asignaturas perdió cada uno, el código del de mayor definitiva, cuántos perdieron más de tres materias y el promedio general.', dificultad: 'alta', estructura: ['doble-ciclo', 'acumulador', 'contador', 'maximo'], fuente: 'Manual §1.2.6 misceláneas 9' }
        ]
      },

      {
        id: 'recorridos-matriz',
        viz: ['recorridos-matriz'],
        titulo: 'Recorridos: filas, columnas, diagonales y zig-zag',
        semana: 4, horas: 3, manual: 'syllabus, unidad II', clave: true,
        resumen: 'Las cuatro formas de barrer una matriz que pide el syllabus, y la fórmula de la diagonal secundaria.',
        teoria: {
          notacion: '\\text{diagonal principal: } i = j \\qquad \\text{secundaria: } i + j = N + 1',
          concepto: 'Recorrer no siempre es fila por fila. El syllabus pide explícitamente recorridos por filas, por columnas, por las dos diagonales y en zig-zag. Cada uno cambia sólo el orden en que se visitan las casillas.',
          procedimiento: [
            'Por filas: I fuera, J dentro.',
            'Por columnas: J fuera, I dentro.',
            'Diagonal principal: un solo ciclo, la casilla es M(I,I).',
            'Diagonal secundaria: un solo ciclo, la casilla es M(I, N−I+1).',
            'Zig-zag: recorrer al derecho las filas impares y al revés las pares.'
          ],
          logica: 'La diagonal secundaria lleva el +1 precisamente porque los índices empiezan en 1. Con base 0 sería M(I, N−1−I); con base 1 es M(I, N−I+1). Escribir M(I, N−I) es el error más frecuente del tema y se detecta enseguida: se sale de la matriz en el primer elemento.',
          trampas: [
            'La fórmula de la diagonal secundaria sin el +1.',
            'Suponer que la diagonal existe en matrices no cuadradas.',
            'En zig-zag, olvidar que el sentido depende de la paridad de la fila.'
          ]
        },
        patrones: ['doble-ciclo', 'diagonales'],
        ejemplos: [
          {
            id: 'e-m-diagonales',
            enunciado: 'Sumar la diagonal principal y la secundaria de una matriz cuadrada',
            fuente: 'syllabus, unidad II',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        PARA J = 1, N, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    DP ← 0
    DS ← 0
    PARA I = 1, N, 1 HAGA
        DP ← DP + A(I, I)
        DS ← DS + A(I, N - I + 1)
    F-PARA
    ESCRIBA "Principal:", DP, "Secundaria:", DS
FIN`,
            entradas: [3, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            hoja: ['I', 'DP', 'DS'],
            explicacion: 'Un solo ciclo recorre las dos diagonales a la vez. En el panel de memoria verás dos celdas azules por vuelta, en espejo. Con la matriz 1..9 la principal suma 15 y la secundaria también: es un cuadrado mágico parcial.'
          },
          {
            id: 'e-m-zigzag',
            enunciado: 'Recorrer una matriz en zig-zag',
            fuente: 'syllabus, unidad II',
            codigo: `INICIO
    LEA N, M
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    PARA I = 1, N, 1 HAGA
        SI (I MOD 2 = 1) ENTONCES
            PARA J = 1, M, 1 HAGA
                ESCRIBA A(I,J)
            F-PARA
        SINO
            PARA J = M, 1, -1 HAGA
                ESCRIBA A(I,J)
            F-PARA
        F-SI
    F-PARA
FIN`,
            entradas: [3, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            hoja: ['I', 'J'],
            explicacion: 'La salida queda 1 2 3 · 6 5 4 · 7 8 9. El SI sobre la paridad de I es lo único que separa el zig-zag de un recorrido normal.'
          }
        ],
        banco: [
          { id: 'u2-re-01', enunciado: 'Verificar si una matriz cuadrada es simétrica, es decir, si M(I,J) = M(J,I) para todo par.', dificultad: 'media', estructura: ['doble-ciclo', 'bandera'] },
          { id: 'u2-re-02', enunciado: 'Sean A, B y C matrices cuadradas de N×N. Si los elementos de la diagonal principal de A coinciden con los de la diagonal secundaria de B, hallar A*(B+C); si no, hallar (A−C)*B.', dificultad: 'alta', estructura: ['diagonales', 'bandera', 'doble-ciclo'], fuente: 'Manual §1.2.6 misceláneas 7' },
          { id: 'u2-re-03', enunciado: 'Sea una matriz A de 2N×2N dividida en cuadrantes. Hallar el mayor del primer cuadrante y el menor del segundo; si su multiplicación es mayor que 15, intercambiar el primer cuadrante con el segundo, si no el tercero con el cuarto.', dificultad: 'alta', estructura: ['doble-ciclo', 'maximo', 'intercambio'], fuente: 'Manual §1.2.6 subrutinas 9' }
        ]
      },

      {
        id: 'operaciones-matriz',
        viz: ['transpuesta', 'multiplicacion', 'cuadrantes'],
        titulo: 'Transpuesta, suma, resta y multiplicación',
        semana: 5, horas: 4, manual: '§1.1 ej. 3 y 4.a', clave: true,
        resumen: 'Las cuatro operaciones matriciales del syllabus, y la validación de dimensiones que nunca es opcional.',
        teoria: {
          notacion: '(A^{T})_{ij} = A_{ji} \\qquad C_{ij} = \\sum_{k=1}^{P} A_{ik}\\,B_{kj}',
          concepto: 'Las operaciones con matrices tienen requisitos de forma. Sumar y restar exige dimensiones idénticas. Multiplicar exige que las columnas de A sean tantas como las filas de B, y el resultado tiene filas de A por columnas de B. Transponer intercambia filas por columnas.',
          procedimiento: [
            'Transpuesta con matriz resultante: B(I,J) ← A(J,I).',
            'Suma: validar (N1 = N2) y (M1 = M2), y luego C(I,J) ← A(I,J) + B(I,J).',
            'Resta: idéntica cambiando el signo. El manual la resuelve con el mismo procedimiento pasando un parámetro SIGNO de 1 o −1.',
            'Multiplicación: validar M1 = N2. Cada C(I,J) es la suma de A(I,K)*B(K,J) recorriendo K, con tres ciclos anidados.'
          ],
          logica: 'La validación no es cortesía: sin ella el algoritmo lee casillas que no existen. El profesor la pide siempre y escribir el SINO con el mensaje «No se pueden sumar las matrices» forma parte de la respuesta correcta.',
          trampas: [
            'Transponer sobre la misma matriz recorriéndola entera: se transpone dos veces y queda igual. Si se hace in situ hay que recorrer sólo el triángulo superior.',
            'Suponer que la transpuesta exige matriz cuadrada: no, pero entonces B es de M×N.',
            'En la multiplicación, olvidar poner a cero el acumulador de cada C(I,J) antes del ciclo de K.'
          ]
        },
        patrones: ['doble-ciclo', 'validacion', 'acumulador'],
        ejemplos: [
          {
            id: 'e-m-transpuesta',
            enunciado: 'Sea la matriz A cuadrada de N elementos, halle la transpuesta de A utilizando una matriz resultante',
            fuente: 'Manual §1.1, ejemplo 4.a',
            codigo: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        PARA J = 1, N, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    PARA I = 1, N, 1 HAGA
        PARA J = 1, N, 1 HAGA
            B(I,J) ← A(J,I)
        F-PARA
    F-PARA
    PARA I = 1, N, 1 HAGA
        PARA J = 1, N, 1 HAGA
            ESCRIBA B(I,J)
        F-PARA
    F-PARA
FIN`,
            entradas: [3, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            hoja: ['I', 'J'],
            explicacion: 'Una sola línea hace todo el trabajo: B(I,J) ← A(J,I). En el panel de memoria verás la celda azul (lectura en A) y la verde (escritura en B) siempre reflejadas respecto de la diagonal.'
          },
          {
            id: 'e-m-suma',
            enunciado: 'Dadas dos matrices A y B de N1×M1 y N2×M2, halle la suma de ellas si ésta se puede',
            fuente: 'Manual §1.1, ejemplo 3',
            codigo: `INICIO
    LEA N1, M1, N2, M2
    PARA I = 1, N1, 1 HAGA
        PARA J = 1, M1, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    PARA I = 1, N2, 1 HAGA
        PARA J = 1, M2, 1 HAGA
            LEA B(I,J)
        F-PARA
    F-PARA
    SI (N1 = N2) y (M1 = M2) ENTONCES
        PARA I = 1, N1, 1 HAGA
            PARA J = 1, M1, 1 HAGA
                C(I,J) ← A(I,J) + B(I,J)
            F-PARA
        F-PARA
        PARA I = 1, N1, 1 HAGA
            PARA J = 1, M1, 1 HAGA
                ESCRIBA C(I,J)
            F-PARA
        F-PARA
    SINO
        ESCRIBA "No se pueden sumar las matrices"
    F-SI
FIN`,
            entradas: [2, 2, 2, 2, 1, 2, 3, 4, 10, 20, 30, 40],
            hoja: ['I', 'J'],
            explicacion: 'La validación va antes de tocar nada. Prueba a cambiar las entradas iniciales a 2, 2, 3, 3 y vuelve a ejecutar: el algoritmo entra por el SINO y no calcula nada.'
          },
          {
            id: 'e-m-multiplicacion',
            enunciado: 'Multiplicar A de N1×M1 por B de N2×M2, si se puede',
            fuente: 'Manual §1.2.6 misceláneas 6',
            codigo: `INICIO
    LEA N1, M1, N2, M2
    PARA I = 1, N1, 1 HAGA
        PARA J = 1, M1, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    PARA I = 1, N2, 1 HAGA
        PARA J = 1, M2, 1 HAGA
            LEA B(I,J)
        F-PARA
    F-PARA
    SI (M1 = N2) ENTONCES
        PARA I = 1, N1, 1 HAGA
            PARA J = 1, M2, 1 HAGA
                S ← 0
                PARA K = 1, M1, 1 HAGA
                    S ← S + A(I,K) * B(K,J)
                F-PARA
                C(I,J) ← S
            F-PARA
        F-PARA
        PARA I = 1, N1, 1 HAGA
            PARA J = 1, M2, 1 HAGA
                ESCRIBA C(I,J)
            F-PARA
        F-PARA
    SINO
        ESCRIBA "No se pueden multiplicar"
    F-SI
FIN`,
            entradas: [2, 2, 2, 2, 1, 2, 3, 4, 5, 6, 7, 8],
            hoja: ['I', 'J', 'K', 'S'],
            explicacion: 'Tres ciclos anidados. La columna S de la hoja es la clave: se pone a cero al empezar cada casilla de C y va acumulando los productos mientras K recorre. Si S no se reinicia, todas las casillas salen mal a partir de la segunda.'
          }
        ],
        banco: [
          { id: 'u2-op-01', enunciado: 'Hallar la transpuesta de una matriz A de N×M aunque no sea cuadrada.', dificultad: 'media', estructura: ['doble-ciclo'], fuente: 'Manual §3.2-3' },
          { id: 'u2-op-02', enunciado: 'Ordenar los elementos de una matriz por el método de la Burbuja, tratándola como si fuera un vector largo.', dificultad: 'alta', estructura: ['doble-ciclo', 'intercambio'], fuente: 'syllabus, unidad II' },
          { id: 'u2-op-03', enunciado: 'Sean dos matrices A y B cuadradas de tamaño N. Sumar la primera fila de A y la primera de B; si el total de A es mayor que el de B, hallar C = A + B, si no C = A − B.', dificultad: 'media', estructura: ['acumulador', 'validacion'], fuente: 'Manual §1.2.6 subrutinas 3' },
          { id: 'u2-op-04', enunciado: 'Hallar el determinante de una matriz cuadrada de N×N.', dificultad: 'alta', estructura: ['doble-ciclo', 'recursion'], fuente: 'Manual §1.2.6 funciones 7', nota: 'Para N>3 sale casi solo por recursión sobre menores.' }
        ]
      }
    ]
  };
})();
