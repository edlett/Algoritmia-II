/* ============================================================
   unidad3.js — Cadenas de caracteres. 4 h de clase, mucho más de estudio.
   Las siete primitivas son las del §2.1 del Manual de Informática II.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};
  AYP.data.unidades = AYP.data.unidades || {};

  AYP.data.unidades[3] = {
    id: 3, nombre: 'Cadenas', corte: 'cadenas', horas: 4,
    temas: [

      {
        id: 'primitivas',
        viz: ['operaciones-cadena'],
        titulo: 'Las siete primitivas',
        semana: 7, horas: 1, manual: '§2.1', clave: true,
        resumen: 'LONG, DER, IZQ, SUBSTR, VAL, STR y la concatenación. No hay más, y no hace falta más.',
        teoria: {
          notacion: '\\text{SUBSTR}(C, p, k) \\text{ exige } p \\ge 1 \\ \\text{ y } \\ p + k - 1 \\le \\text{LONG}(C)',
          concepto: 'En pseudocódigo no existen length() ni charAt() ni substring(): eso es Java. El manual define siete operaciones y con ellas se resuelve todo el capítulo. Una cadena literal va entre comillas simples, y una cadena no admite operaciones matemáticas.',
          procedimiento: [
            'LONG(cad) devuelve cuántos caracteres tiene.',
            'IZQ(cad, n) toma n caracteres desde la izquierda; DER(cad, n) desde la derecha.',
            'SUBSTR(cad, posini, n) toma n caracteres a la derecha desde posini. Las posiciones empiezan en 1.',
            'VAL(cad) convierte cadena a número; STR(num) convierte número a cadena.',
            'A || B concatena. No es lo mismo que B || A.'
          ],
          logica: 'STR y VAL son el puente entre los dos mundos. Con STR un número se vuelve recorrible carácter a carácter, y con VAL cada carácter vuelve a ser número para poder compararlo o sumarlo. Ese ida y vuelta es lo que resuelve todos los problemas de dígitos sin usar divisiones enteras.',
          trampas: [
            'C ← \'casa\' asigna la palabra; C ← CASA copia el contenido de la variable CASA. El manual insiste en esta diferencia.',
            'SUBSTR(C, 0, 1) para el primer carácter. Es SUBSTR(C, 1, 1).',
            'Confundir la cadena vacía con una cadena de espacios en blanco: no son lo mismo.',
            'Intentar sumar dos cadenas con + esperando concatenar: el operador es ||.'
          ]
        },
        patrones: ['recorrer-cadena'],
        ejemplos: [{
          id: 'e-c-primitivas',
          enunciado: 'Las siete primitivas, una por una',
          fuente: 'Manual §2.1',
          codigo: `INICIO
    C ← 'argentina'
    ESCRIBA "cadena:", C
    ESCRIBA "LONG:", LONG(C)
    ESCRIBA "IZQ 2:", IZQ(C, 2)
    ESCRIBA "DER 2:", DER(C, 2)
    ESCRIBA "SUBSTR 3,2:", SUBSTR(C, 3, 2)
    A ← 'ar'
    B ← 'bol'
    ESCRIBA "A || B:", A || B
    ESCRIBA "B || A:", B || A
    N ← 101
    D ← STR(N)
    ESCRIBA "STR(101):", D
    ESCRIBA "VAL de vuelta:", VAL(D) + 1
FIN`,
          entradas: [],
          hoja: ['C', 'A', 'B', 'D'],
          explicacion: 'Las dos últimas líneas demuestran el puente: STR convierte 101 en la cadena \'101\', y VAL la devuelve a número, por eso sumarle 1 da 102 y no \'1011\'.'
        }],
        banco: [
          { id: 'u3-pr-01', enunciado: 'Dada una cadena A, decir cuántas vocales tiene.', dificultad: 'baja', estructura: ['recorrer-cadena', 'contador'], fuente: 'Manual §2.3-1' },
          { id: 'u3-pr-02', enunciado: 'Generar una cadena B a partir de una A existente, con los caracteres de A que están en posiciones impares.', dificultad: 'baja', estructura: ['recorrer-cadena', 'construir'], fuente: 'Manual §2.3-4' },
          { id: 'u3-pr-03', enunciado: 'Leer una cadena y determinar cuántas vocales la conforman; además, si alguna se repite, contar cuántas veces aparece.', dificultad: 'media', estructura: ['recorrer-cadena', 'contador', 'doble-ciclo'], fuente: 'Manual §2.3-6' }
        ]
      },

      {
        id: 'construir',
        viz: ['operaciones-cadena'],
        titulo: 'Recorrer y construir cadenas',
        semana: 7, horas: 1, manual: '§2.2 ej. 1 y 2', clave: true,
        resumen: 'El patrón STR → LONG → SUBSTR → VAL, y la construcción por concatenación dentro de un ciclo.',
        teoria: {
          concepto: 'Recorrer una cadena es tomar sus caracteres de uno en uno con SUBSTR(C, I, 1) dentro de un PARA de 1 a LONG(C). Construir una cadena es lo simétrico: empezar con la cadena vacía e ir concatenando.',
          procedimiento: [
            'Recorrer: L ← LONG(C), luego PARA I = 1, L, 1 y dentro D ← SUBSTR(C, I, 1).',
            'Si el carácter tiene que compararse como número: NUM ← VAL(D).',
            'Construir: C2 ← \'\' antes del ciclo, y dentro C2 ← C2 || LETRA.',
            'Para construir al revés basta recorrer al revés: PARA I = L, 1, -1.'
          ],
          logica: 'El acumulador de cadenas es el mismo patrón que el acumulador numérico, cambiando el 0 por la cadena vacía y el + por el ||. Verlo así ahorra memorizar un patrón nuevo.',
          trampas: [
            'Olvidar inicializar C2 en cadena vacía: al concatenar sobre una variable sin valor el algoritmo se cae.',
            'Calcular LONG(C) dentro del ciclo: funciona, pero lo recalcula en cada vuelta.',
            'En el recorrido inverso, poner el paso +1 y esperar que baje.'
          ]
        },
        patrones: ['recorrer-cadena', 'construir'],
        ejemplos: [
          {
            id: 'e-c-digitospares',
            enunciado: 'Sea N un número cualquiera, diga cuántos de sus dígitos son pares',
            fuente: 'Manual §2.2, ejemplo 1',
            codigo: `INICIO
    LEA N
    PAR ← 0
    C ← STR(N)
    L ← LONG(C)
    PARA I = 1, L, 1 HAGA
        D ← SUBSTR(C, I, 1)
        NUM ← VAL(D)
        SI (NUM MOD 2 = 0) ENTONCES
            PAR ← PAR + 1
        F-SI
    F-PARA
    ESCRIBA "El número de dígitos pares que tiene", N, "es", PAR
FIN`,
            entradas: ['246813'],
            hoja: ['I', 'D', 'NUM', 'PAR'],
            explicacion: 'Éste es EL patrón del capítulo. La columna D de la hoja va mostrando el carácter que se está mirando y NUM su valor numérico. Memoriza las cinco líneas de la cabecera: sirven para cualquier problema de dígitos.'
          },
          {
            id: 'e-c-invertir',
            enunciado: 'Utilice una función para invertir una cadena',
            fuente: 'Manual §2.2 ej. 2 / §2.3-5',
            codigo: `FUNCION invertir (C)
    L ← LONG(C)
    C2 ← ''
    PARA I = L, 1, -1 HAGA
        LETRA ← SUBSTR(C, I, 1)
        C2 ← C2 || LETRA
    F-PARA
    invertir ← C2
FIN_FUNCION

INICIO
    LEA A
    ESCRIBA "Al revés:", invertir(A)
FIN`,
            entradas: ['algoritmia'],
            hoja: ['I', 'LETRA', 'C2'],
            explicacion: 'La columna C2 de la hoja crece letra a letra: ése es el acumulador de cadenas. Fíjate también en el panel de pila: al llamar a invertir aparece un marco nuevo y al terminar desaparece con el resultado.'
          },
          {
            id: 'e-c-palindromo',
            enunciado: 'Verificar si una cadena es palíndroma',
            fuente: 'Manual §2.2, ejemplo 2',
            codigo: `FUNCION invertir (C)
    L ← LONG(C)
    C2 ← ''
    PARA I = L, 1, -1 HAGA
        C2 ← C2 || SUBSTR(C, I, 1)
    F-PARA
    invertir ← C2
FIN_FUNCION

INICIO
    LEA CAD
    L ← LONG(CAD)
    M ← [| L / 2 |]
    IZQUIERDA ← IZQ(CAD, M)
    SI (L MOD 2 = 0) ENTONCES
        DERECHA ← DER(CAD, M)
    SINO
        DERECHA ← DER(CAD, M)
    F-SI
    SI (invertir(DERECHA) = IZQUIERDA) ENTONCES
        ESCRIBA "Es palíndrome"
    SINO
        ESCRIBA "No es palíndrome"
    F-SI
FIN`,
            entradas: ['reconocer'],
            hoja: ['L', 'M', 'IZQUIERDA', 'DERECHA'],
            explicacion: 'El manual lo resuelve partiendo por la mitad con [| L/2 |], no con dos punteros. Con longitud impar el carácter central se ignora, y por eso da igual: nunca puede romper la simetría.'
          }
        ],
        banco: [
          { id: 'u3-co-01', enunciado: 'Diseñe un algoritmo que lea dos palabras y las compare carácter por carácter, con el fin de determinar el orden alfabético de las palabras.', dificultad: 'media', estructura: ['recorrer-cadena', 'bandera'], fuente: 'Manual §2.3-7' },
          { id: 'u3-co-02', enunciado: 'Haga un algoritmo que determine si dentro de un texto se encuentra un valor numérico real.', dificultad: 'alta', estructura: ['recorrer-cadena', 'bandera'], fuente: 'Manual §2.3-8' },
          { id: 'u3-co-03', enunciado: 'Sea un número en base 10, haga un procedimiento para convertirlo a base 16.', dificultad: 'alta', estructura: ['acumulador', 'construir'], fuente: 'Manual §2.3-2', nota: 'Por encima de 9 los dígitos son letras: ahí es donde hacen falta las cadenas.' },
          { id: 'u3-co-04', enunciado: 'Cuente cuántas palabras de una cadena se escriben igual en orden inverso. Ejemplo: en \'xhs adr ala zsx dddees adadad xxxx\' hay dos.', dificultad: 'alta', estructura: ['recorrer-cadena', 'construir', 'bandera'], fuente: 'Manual §3.2-7' }
        ]
      },

      {
        id: 'buscar-subcadena',
        viz: ['ventana-deslizante'],
        titulo: 'Buscar una subcadena',
        semana: 10, horas: 1, manual: '§2.3-9', clave: true,
        resumen: 'La ventana deslizante: comparar trozo a trozo con SUBSTR hasta encontrar la coincidencia.',
        teoria: {
          notacion: '\\text{ventanas} = \\text{LONG}(T) - \\text{LONG}(P) + 1',
          concepto: 'Para saber si st1 está dentro de una cadena mayor no hay ninguna primitiva: hay que deslizar una ventana del tamaño de st1 a lo largo de la cadena grande y comparar en cada posición.',
          procedimiento: [
            'L1 ← LONG(grande), L2 ← LONG(buscada).',
            'Recorrer I de 1 hasta L1 − L2 + 1: más allá ya no cabe la ventana.',
            'En cada I, TROZO ← SUBSTR(grande, I, L2).',
            'Si TROZO = buscada, se encontró en la posición I y se levanta la bandera.'
          ],
          logica: 'El límite del ciclo es L1 − L2 + 1 y no L1. Si la cadena grande tiene 10 caracteres y la buscada 4, la última ventana posible empieza en la posición 7. Empezar en la 8 daría un trozo más corto que nunca puede coincidir.',
          trampas: [
            'Recorrer hasta L1: se comparan trozos incompletos.',
            'Olvidar el +1 del límite: se pierde la última posición válida.',
            'No usar bandera y seguir buscando después de haber encontrado.'
          ]
        },
        patrones: ['ventana', 'bandera'],
        ejemplos: [{
          id: 'e-c-ventana',
          enunciado: 'Decir si la cadena st1 aparece dentro de la cadena TEXTO y en qué posición',
          fuente: 'Manual §2.3-9',
          codigo: `FUNCION contiene (GRANDE, BUSCADA)
    L1 ← LONG(GRANDE)
    L2 ← LONG(BUSCADA)
    POS ← 0
    I ← 1
    MQ ((I <= L1 - L2 + 1) y (POS = 0)) HAGA
        TROZO ← SUBSTR(GRANDE, I, L2)
        SI (TROZO = BUSCADA) ENTONCES
            POS ← I
        F-SI
        I ← I + 1
    F_MQ
    contiene ← POS
FIN_FUNCION

INICIO
    LEA TEXTO
    LEA ST1
    P ← contiene(TEXTO, ST1)
    SI (P > 0) ENTONCES
        ESCRIBA "Encontrada en la posición", P
    SINO
        ESCRIBA "No está"
    F-SI
FIN`,
          entradas: ['La nina de sus ojos', 'nina'],
          hoja: ['I', 'TROZO', 'POS'],
          explicacion: 'La columna TROZO de la hoja es la ventana deslizándose: \'La n\', \'a ni\', \' nin\', \'nina\'. En cuanto coincide, POS deja de ser 0 y el ciclo para.'
        }],
        banco: [
          { id: 'u3-bu-01', enunciado: 'Contar cuántas veces aparece una subcadena dentro de otra (pueden solaparse).', dificultad: 'media', estructura: ['ventana', 'contador'] },
          { id: 'u3-bu-02', enunciado: 'Reemplazar todas las apariciones de una subcadena por otra dentro de un texto.', dificultad: 'alta', estructura: ['ventana', 'construir'] }
        ]
      },

      {
        id: 'cadenas-matriz',
        viz: ['cadena-matriz', 'ventana-deslizante'],
        titulo: 'Cadenas dentro de una matriz',
        semana: 10, horas: 1, manual: '§2.3-9 · Preparcial 2 punto 2', clave: true,
        resumen: 'El ejercicio que cae: buscar una frase dentro de una matriz de frases e informar sus coordenadas.',
        teoria: {
          concepto: 'Es la composición de dos temas: el doble ciclo de matrices y la ventana deslizante de cadenas. Cada casilla de la matriz contiene una frase entera, y hay que mirar dentro de cada una.',
          procedimiento: [
            'Doble PARA sobre las N filas y M columnas.',
            'En cada casilla, aplicar la búsqueda de subcadena sobre M(I,J).',
            'Al encontrarla, informar la frase completa y las coordenadas [I, J].',
            'Con subrutina: los resultados salen por parámetros, porque son varios datos.'
          ],
          logica: 'Aquí se ve por qué la modularidad no es un adorno. Buscar dentro de una cadena ya es un problema con su propio ciclo; meterlo entero dentro del doble ciclo de la matriz da tres niveles de anidamiento ilegibles. Separando la búsqueda en una función, el algoritmo principal cabe en diez líneas.',
          trampas: [
            'Comparar la casilla completa con st1 en vez de buscar dentro de ella.',
            'Informar [J, I] en vez de [I, J].',
            'Salir del doble ciclo en cuanto se encuentra la primera, cuando el enunciado pide todas.'
          ]
        },
        patrones: ['doble-ciclo', 'ventana'],
        ejemplos: [{
          id: 'e-c-matriz',
          enunciado: 'Se tiene una matriz M de cadenas de tamaño n×m. Escriba una subrutina para indicar si una cadena st1 ocurre dentro de una cadena M[i][j]',
          fuente: 'Preparcial 2, punto 2 (= Manual §2.3-9)',
          codigo: `FUNCION contiene (GRANDE, BUSCADA)
    L1 ← LONG(GRANDE)
    L2 ← LONG(BUSCADA)
    POS ← 0
    I ← 1
    MQ ((I <= L1 - L2 + 1) y (POS = 0)) HAGA
        SI (SUBSTR(GRANDE, I, L2) = BUSCADA) ENTONCES
            POS ← I
        F-SI
        I ← I + 1
    F_MQ
    contiene ← POS
FIN_FUNCION

SUBRUTINA buscarEnMatriz (MAT, N, M, ST1)
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            SI (contiene(MAT(I,J), ST1) > 0) ENTONCES
                ESCRIBA "Cadena encontrada y esta dentro de la cadena:", MAT(I,J)
                ESCRIBA "ubicada en la posicion:", I, J
            F-SI
        F-PARA
    F-PARA
FIN_SUBRUTINA

INICIO
    LEA ST1
    EJECUTE buscarEnMatriz(M, 3, 4, ST1)
FIN`,
          entradas: ['La nina'],
          precarga: {
            M: [
              ['Gato con botas', 'Mar muerto', 'Soy capaz', 'Todo lo puedo'],
              ['Dama y caballero', 'Querer es poder', 'Dios te ama', 'Vida eterna'],
              ['La nina de sus ojos', 'Soy exitoso', 'La vida es bella', 'Naturaleza es vida']
            ]
          },
          hoja: ['I', 'J'],
          explicacion: 'Ésta es la matriz literal del preparcial. La respuesta esperada es la frase «La nina de sus ojos» en la posición [3, 1]. Sigue el panel de memoria: la casilla que se está inspeccionando se pinta de azul, casilla por casilla, fila por fila.'
        }],
        banco: [
          { id: 'u3-cm-01', enunciado: 'Dada una matriz de N×M de cadenas, decir cuál es la frase más larga y en qué posición está.', dificultad: 'media', estructura: ['doble-ciclo', 'maximo'] },
          { id: 'u3-cm-02', enunciado: 'Dada una matriz N×M, verificar si una cadena de caracteres se encuentra en ella, informando todas las posiciones donde aparece.', dificultad: 'alta', estructura: ['doble-ciclo', 'ventana', 'contador'], fuente: 'Manual §2.3-9' }
        ]
      }
    ]
  };
})();
