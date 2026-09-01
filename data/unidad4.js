/* ============================================================
   unidad4.js — Procedimientos: subrutinas y funciones. 18 h.
   El bloque más grande del semestre.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};
  AYP.data.unidades = AYP.data.unidades || {};

  AYP.data.unidades[4] = {
    id: 4, nombre: 'Procedimientos', corte: 'procedimientos', horas: 18,
    temas: [

      {
        id: 'modularidad',
        viz: ['pila-marcos'],
        titulo: 'Divide y vencerás',
        semana: 8, horas: 2, manual: '§1.2',
        resumen: 'Por qué partir un problema en procedimientos, y qué pasa con el control cuando se invoca uno.',
        teoria: {
          concepto: 'Programación modular: un problema grande se parte en subproblemas que se resuelven de forma individual e independiente. Siempre existe un algoritmo principal que decide cuáles procedimientos se ejecutan y en qué orden.',
          procedimiento: [
            'Al invocar un procedimiento, el programa que se estaba ejecutando se detiene.',
            'El control pasa al procedimiento, que se ejecuta entero.',
            'Al terminar, el control vuelve a la instrucción siguiente a la invocación.',
            'Un procedimiento puede invocar a otro, y entonces se anida.'
          ],
          logica: 'Las ventajas que enumera el manual y que se preguntan en teoría: localizar y corregir un error sin tocar el resto, verificar un procedimiento nuevo sin afectar los demás, evitar repetir líneas, y hacer el algoritmo comprensible para quien tenga que darle mantenimiento.',
          trampas: [
            'Creer que el orden en que se declaran los procedimientos es el orden en que se ejecutan: lo decide el algoritmo principal.',
            'Suponer que un procedimiento «ve» las variables del principal. En algoritmos todo se comunica por la lista de parámetros.',
            'Escribir un procedimiento gigante que hace de todo: eso es no haber dividido nada.'
          ]
        },
        patrones: ['cabecera-sub'],
        ejemplos: [{
          id: 'e-p-flujo',
          enunciado: 'El flujo de llamada y retorno, visto por dentro',
          fuente: 'Manual §1.2, Figura 1',
          codigo: `SUBRUTINA saludar (NOMBRE)
    ESCRIBA "Entro a saludar"
    ESCRIBA "Hola,", NOMBRE
    ESCRIBA "Salgo de saludar"
FIN_SUBRUTINA

SUBRUTINA despedir ()
    ESCRIBA "Entro a despedir"
    EJECUTE saludar('otra vez')
    ESCRIBA "Salgo de despedir"
FIN_SUBRUTINA

INICIO
    ESCRIBA "Empieza el principal"
    EJECUTE saludar('Edgar')
    ESCRIBA "Volvi al principal"
    EJECUTE despedir()
    ESCRIBA "Termina el principal"
FIN`,
          entradas: [],
          hoja: ['NOMBRE'],
          explicacion: 'Mira sólo el panel «Pila de llamadas» mientras corre. Los marcos se apilan al entrar y desaparecen al salir. Cuando despedir llama a saludar hay tres marcos a la vez: ésa es la Figura 1 del manual, viva.'
        }],
        banco: [
          { id: 'u4-mo-01', enunciado: 'Enumerar tres ventajas de la programación modular según el manual y explicar cada una en una frase.', dificultad: 'baja', estructura: ['teoria'] },
          { id: 'u4-mo-02', enunciado: 'Explicar qué le pasa al control del programa cuando se invoca un procedimiento desde dentro de otro procedimiento.', dificultad: 'baja', estructura: ['teoria'] }
        ]
      },

      {
        id: 'subrutinas',
        viz: ['funcion-o-subrutina'],
        titulo: 'Subrutinas',
        semana: 8, horas: 4, manual: '§1.2.1', clave: true,
        resumen: 'SUBRUTINA … FIN_SUBRUTINA, y la palabra EJECUTE que las invoca.',
        teoria: {
          concepto: 'Una subrutina es un procedimiento sin valor de retorno. Se declara con la palabra SUBRUTINA acompañada del nombre y los parámetros formales, y se cierra con FIN_SUBRUTINA. Se invoca obligatoriamente con EJECUTE.',
          procedimiento: [
            'SUBRUTINA <nombre> (lista de parámetros)',
            '    { cuerpo }',
            'FIN_SUBRUTINA',
            'Invocación: EJECUTE nombre (lista de parámetros actuales)'
          ],
          logica: 'La subrutina puede devolver cualquier cosa —un vector, una matriz, varios valores a la vez— porque no devuelve nada por su nombre: devuelve por sus parámetros. Ésa es toda la diferencia con una función, y es lo que la hace más general.',
          trampas: [
            'Invocar una subrutina sin EJECUTE.',
            'Esperar que una subrutina devuelva un valor por su nombre: no lo hace.',
            'Que no coincidan cantidad u orden de los parámetros actuales con los formales.'
          ]
        },
        patrones: ['cabecera-sub'],
        ejemplos: [{
          id: 'e-p-leavector',
          enunciado: 'Sean dos vectores A y B de tamaño N y M. Halle el mayor elemento del vector A y del vector B',
          fuente: 'Manual §1.2.5, ejemplo 1',
          codigo: `SUBRUTINA leavector (TAMANO, VEC)
    PARA I = 1, TAMANO, 1 HAGA
        LEA VEC(I)
    F_PARA
F_SUBRUTINA

FUNCION mayor (TAMANO, VEC)
    MAY ← VEC(1)
    PARA I = 2, TAMANO, 1 HAGA
        SI (MAY < VEC(I)) ENTONCES
            MAY ← VEC(I)
        F_SI
    F_PARA
    mayor ← MAY
F_FUNCION

INICIO
    LEA N, M
    EJECUTE leavector(N, A)
    EJECUTE leavector(M, B)
    ESCRIBA "El mayor elemento del vector A", mayor(N, A)
    ESCRIBA "El mayor elemento del vector B", mayor(M, B)
FIN`,
          entradas: [4, 3, 2, 9, 4, 7, 15, 6, 11],
          hoja: ['TAMANO', 'I', 'MAY'],
          explicacion: 'Ésta es LA plantilla que hay que saber reproducir de memoria. leavector LLENA un vector, así que su resultado es un conjunto y tiene que ser subrutina, invocada con EJECUTE. mayor devuelve UN número, así que es función y se usa directamente dentro del ESCRIBA. Mira cómo el mismo procedimiento sirve para A y para B sin cambiar una línea.'
        }],
        banco: [
          { id: 'u4-su-01', enunciado: 'Escribir una subrutina que reciba un vector y su tamaño y lo imprima.', dificultad: 'baja', estructura: ['cabecera-sub'] },
          { id: 'u4-su-02', enunciado: 'Escribir una subrutina que ordene un vector por Burbuja. ¿Qué tipo de parámetro es el vector?', dificultad: 'media', estructura: ['cabecera-sub', 'intercambio'], nota: 'Entra desordenado y sale ordenado: es de Entrada-Salida.' },
          { id: 'u4-su-03', enunciado: 'Sea un número que está en base X, haga un algoritmo para pasarlo a base S, donde X y S son bases menores o iguales a 10. No utilice arreglos.', dificultad: 'alta', estructura: ['cabecera-sub', 'acumulador'], fuente: 'Manual §1.2.6 subrutinas 1' },
          { id: 'u4-su-04', enunciado: 'Genere un vector con los factores primos de un número, usando una subrutina.', dificultad: 'media', estructura: ['cabecera-sub', 'doble-ciclo'], fuente: 'Manual §1.2.6 subrutinas 8' }
        ]
      },

      {
        id: 'funciones',
        viz: ['funcion-o-subrutina'],
        titulo: 'Funciones',
        semana: 9, horas: 4, manual: '§1.2.2', clave: true,
        resumen: 'FUNCION … FIN_FUNCION, el nombre que es a la vez variable, y por qué no llevan EJECUTE.',
        teoria: {
          concepto: 'Una función devuelve exactamente un dato. El nombre de la función representa dos cosas a la vez: el nombre por el que se la referencia y la variable donde viene guardado el resultado. La última instrucción antes de cerrarla es la asignación a ese nombre.',
          procedimiento: [
            'FUNCION <nombre> (lista de parámetros)',
            '    { cuerpo }',
            '    nombre ← resultado obtenido',
            'FIN_FUNCION',
            'Invocación: SIN EJECUTE. C ← promedio(A, B), o dentro de un SI o de un ESCRIBA.'
          ],
          logica: 'Como el nombre de la función es una variable, se puede usar donde quepa un valor: en una asignación, en una condición, dentro de un ESCRIBA. Por eso no necesita EJECUTE, que está reservada para las subrutinas. Y por eso mismo no puede devolver un vector: una variable guarda un dato, no un conjunto.',
          trampas: [
            'Cerrar la función sin haber asignado nada a su nombre: no devuelve nada.',
            'Poner parámetros de salida en una función. Sólo admite de Entrada (E).',
            'Usar una función para devolver un vector o una matriz. Eso obliga a subrutina.',
            'Invocarla con EJECUTE.'
          ]
        },
        patrones: ['cabecera-fun'],
        ejemplos: [
          {
            id: 'e-p-funcion',
            enunciado: 'Una función que decide si un número es primo, usada dentro de un SI',
            fuente: 'Manual §1.2.6 funciones 3',
            codigo: `FUNCION esprimo (NUM)
    CONT ← 0
    PARA K = 1, NUM, 1 HAGA
        SI (NUM MOD K = 0) ENTONCES
            CONT ← CONT + 1
        F-SI
    F-PARA
    SI (CONT = 2) ENTONCES
        esprimo ← 1
    SINO
        esprimo ← 0
    F-SI
FIN_FUNCION

INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    C ← 0
    PARA I = 1, N, 1 HAGA
        SI (esprimo(V(I)) = 1) ENTONCES
            ESCRIBA V(I), "es primo"
            C ← C + 1
        F-SI
    F-PARA
    ESCRIBA "Total de primos:", C
FIN`,
            entradas: [6, 4, 7, 9, 11, 12, 13],
            hoja: ['I', 'NUM', 'CONT', 'C'],
            explicacion: 'La función se invoca DENTRO de la condición del SI: esprimo(V(I)) = 1. Eso es lo que una subrutina no podría hacer. Observa la pila: en cada vuelta del ciclo aparece y desaparece un marco.'
          },
          {
            id: 'e-p-decidir',
            enunciado: 'El mismo problema resuelto con función y con subrutina',
            fuente: 'Manual §1.2.2.3',
            codigo: `FUNCION promedioF (A, B)
    promedioF ← (A + B) / 2
FIN_FUNCION

SUBRUTINA promedioS (A, B, R)
    R ← (A + B) / 2
FIN_SUBRUTINA

INICIO
    LEA X, Y
    C ← promedioF(X, Y)
    ESCRIBA "Con funcion:", C
    EJECUTE promedioS(X, Y, D)
    ESCRIBA "Con subrutina:", D
    SI (promedioF(X, Y) > 10) ENTONCES
        ESCRIBA "El promedio pasa de 10"
    F-SI
FIN`,
            entradas: [8, 20],
            hoja: ['X', 'Y', 'C', 'D'],
            explicacion: 'Las dos versiones dan lo mismo, pero sólo la función cabe dentro del SI de la última línea. El manual lo dice así: toda función puede expresarse también como subrutina, pero no al revés. Nota que la subrutina necesitó un parámetro extra, R, para sacar el resultado.'
          }
        ],
        banco: [
          { id: 'u4-fu-01', enunciado: 'Sea un número cualquiera, diga cuántos dígitos tiene. No utilice arreglos.', dificultad: 'media', estructura: ['cabecera-fun', 'acumulador'], fuente: 'Manual §1.2.6 funciones 1' },
          { id: 'u4-fu-02', enunciado: 'Sean dos números enteros, haga una función que determine cuál es el máximo común divisor entre ambos.', dificultad: 'media', estructura: ['cabecera-fun'], fuente: 'Manual §1.2.6 funciones 4' },
          { id: 'u4-fu-03', enunciado: 'Encuentre cuántos factores primos tiene un número A dado.', dificultad: 'media', estructura: ['cabecera-fun', 'contador'], fuente: 'Manual §1.2.6 funciones 5' },
          { id: 'u4-fu-04', enunciado: 'Utilice una función para verificar si un número cualquiera pertenece a la serie de Fibonacci o no.', dificultad: 'media', estructura: ['cabecera-fun', 'bandera'], fuente: 'Manual §1.2.6 funciones 8' },
          { id: 'u4-fu-05', enunciado: 'Para cada uno de estos resultados, decidir si hace falta función o subrutina: (a) el promedio de un vector, (b) el vector ordenado, (c) cuántos negativos hay, (d) el vector de números primos extraídos, (e) si una cadena es palíndroma.', dificultad: 'baja', estructura: ['decidir'], nota: 'Regla: ¿un solo dato? función. ¿un conjunto o nada? subrutina.' }
        ]
      },

      {
        id: 'parametros',
        viz: ['valor-vs-referencia'],
        titulo: 'Parámetros y ámbito',
        semana: 11, horas: 4, manual: '§1.2.3 y §1.2.4', clave: true,
        resumen: 'Entrada, Salida y Entrada-Salida; paso por valor y por referencia; variables locales y globales.',
        teoria: {
          concepto: 'Los parámetros formales son los de la declaración; los actuales, los de la invocación. La correspondencia es uno a uno, en el mismo orden y en la misma cantidad. Cada parámetro es de uno de tres tipos según cuándo se conoce su contenido.',
          procedimiento: [
            'Entrada (E): su contenido se necesita ANTES de ejecutar. Se pasa por valor.',
            'Salida (S): su contenido se conoce DESPUÉS de ejecutar. Se pasa por referencia.',
            'Entrada-Salida (E/S): entra con un valor y sale modificado. Por referencia.',
            'Las funciones sólo admiten parámetros de Entrada.'
          ],
          logica: 'Paso por valor significa que el procedimiento recibe una copia: si la modifica, el original no se entera. Paso por referencia significa que recibe la caja misma: lo que escriba dentro se ve fuera. Por eso un vector que hay que llenar tiene que ir por referencia, y por eso llenar un vector obliga a usar subrutina.',
          trampas: [
            'Suponer que una variable local conserva su valor entre dos llamadas: nace y muere con cada ejecución.',
            'Declarar como Entrada un parámetro que el procedimiento va a llenar.',
            'Confundir el nombre del parámetro formal con el del actual: no tienen por qué llamarse igual, y da igual.',
            'El manual aclara que locales y globales existen a nivel de programación, no de algoritmos: en pseudocódigo se comunica todo por la lista de parámetros.'
          ]
        },
        patrones: ['cabecera-sub', 'cabecera-fun'],
        ejemplos: [
          {
            id: 'e-p-valorref',
            enunciado: 'Paso por valor contra paso por referencia, ejecutándose',
            fuente: 'Manual §1.2.3.2',
            codigo: `SUBRUTINA cambiaEscalar (X)
    X ← 999
    ESCRIBA "Dentro, X vale", X
FIN_SUBRUTINA

SUBRUTINA cambiaVector (V)
    V(1) ← 999
    ESCRIBA "Dentro, V(1) vale", V(1)
FIN_SUBRUTINA

INICIO
    A ← 5
    EJECUTE cambiaEscalar(A)
    ESCRIBA "Fuera, A sigue valiendo", A
    B(1) ← 5
    EJECUTE cambiaVector(B)
    ESCRIBA "Fuera, B(1) ahora vale", B(1)
FIN`,
            entradas: [],
            hoja: ['A', 'X'],
            explicacion: 'El escalar A no cambia: el procedimiento recibió una copia. El vector B sí cambia: recibió la caja misma. Ésa es toda la diferencia entre valor y referencia, y es la razón de que llenar un vector obligue a subrutina.'
          },
          {
            id: 'e-p-local',
            enunciado: 'Una variable local nace y muere con cada llamada',
            fuente: 'Manual §1.2.4',
            codigo: `SUBRUTINA cuenta (ETIQUETA)
    C ← 0
    C ← C + 1
    ESCRIBA ETIQUETA, "C vale", C
FIN_SUBRUTINA

INICIO
    EJECUTE cuenta('primera')
    EJECUTE cuenta('segunda')
    EJECUTE cuenta('tercera')
    ESCRIBA "En el principal C no existe"
FIN`,
            entradas: [],
            hoja: ['C'],
            explicacion: 'C vale 1 las tres veces, nunca 2 ni 3. Mira el panel de variables: C aparece cuando entra el marco y desaparece al salir. Éste es el error (a) que más se falla en la prueba de escritorio del preparcial: creer que `au` conserva su valor entre vueltas.'
          }
        ],
        banco: [
          { id: 'u4-pa-01', enunciado: 'Para una subrutina que lee un vector, ¿de qué tipo es cada parámetro: el tamaño y el vector? Justificar.', dificultad: 'baja', estructura: ['teoria'], nota: 'El tamaño se necesita antes (E); el vector se conoce después (S).' },
          { id: 'u4-pa-02', enunciado: 'Para una subrutina que ordena un vector, ¿de qué tipo es el vector? ¿Y para una que sólo lo imprime?', dificultad: 'baja', estructura: ['teoria'] },
          { id: 'u4-pa-03', enunciado: 'Escribir una subrutina suma_resta(N, M, A, B, C, SIGNO) que sirva a la vez para sumar y para restar dos matrices según el valor de SIGNO.', dificultad: 'media', estructura: ['cabecera-sub', 'doble-ciclo'], fuente: 'Manual §1.2.5 ejemplo 4', nota: 'Un solo procedimiento parametrizado por el signo: el truco elegante que usa el profesor.' }
        ]
      },

      {
        id: 'pila-llamadas',
        viz: ['pila-marcos'],
        titulo: 'La pila de llamadas y la prueba de escritorio',
        semana: 11, horas: 2, manual: 'Preparcial 2, punto 1', clave: true,
        resumen: 'Trazar a mano un algoritmo que entra y sale de una función en cada vuelta. El punto que más se falla.',
        teoria: {
          concepto: 'La prueba de escritorio es rastrear el estado del programa línea por línea, sin ejecutarlo. Cuando hay procedimientos, además hay que seguir el salto de control: entrar, calcular con variables locales nuevas, devolver y continuar donde se había quedado.',
          procedimiento: [
            'Hacer una tabla con una columna por cada variable que cambia.',
            'Una fila por cada vuelta del ciclo principal.',
            'Al entrar a una función, abrir una sub-tabla con sus variables locales.',
            'Al salir, anotar sólo el valor devuelto y cerrar la sub-tabla.'
          ],
          logica: 'Las variables locales de la función se reinician en cada llamada. No hay memoria entre una vuelta y la siguiente: eso es exactamente lo que se está evaluando.',
          trampas: [
            'Olvidar que la variable local se reinicia en cada llamada.',
            'Aplicar una operación condicionada cuando la condición era falsa.',
            'Confundir M[X][Y] (fila X, columna Y) con M[Y][X].',
            'Perder el hilo a partir de la cuarta iteración: por eso conviene llevar la tabla ordenada.'
          ]
        },
        patrones: ['cabecera-fun'],
        ejemplos: [{
          id: 'e-p-r4info',
          enunciado: 'La empresa de seguridad informática "R4_Info" almacena contraseñas con este algoritmo. Realizar la prueba de escritorio y determinar el contenido de C',
          fuente: 'Preparcial 2, punto 1 (dialecto Parcial)',
          codigo: `Inicio
    Entero A[9], B[9], C[9], M[9][9], S, Y, X
    S ← 8
    Para i = 1, S, 1 hacer
        X ← A[i]
        Y ← CalculaC(X, B)
        C[i] ← M[X][Y]
    Finpara
    Para i = 1, S, 1 hacer
        Escribir C[i]
    Finpara
Fin

Funcion CalculaC(entero R, entero V[9]) entero
    Entero CC, au
    au ← R
    Si (au > 3) entonces
        au ← au - 2
    FinSi
    CC ← V[au]
    Retorna CC
Fin CalculaC`,
          entradas: [],
          precarga: {
            A: [2, 5, 1, 7, 3, 6, 4, 8, 9],
            B: [1, 3, 2, 5, 4, 7, 6, 9, 8],
            M: [
              [11, 12, 13, 14, 15, 16, 17, 18, 19],
              [21, 22, 23, 24, 25, 26, 27, 28, 29],
              [31, 32, 33, 34, 35, 36, 37, 38, 39],
              [41, 42, 43, 44, 45, 46, 47, 48, 49],
              [51, 52, 53, 54, 55, 56, 57, 58, 59],
              [61, 62, 63, 64, 65, 66, 67, 68, 69],
              [71, 72, 73, 74, 75, 76, 77, 78, 79],
              [81, 82, 83, 84, 85, 86, 87, 88, 89],
              [91, 92, 93, 94, 95, 96, 97, 98, 99]
            ]
          },
          hoja: ['i', 'X', 'au', 'Y', 'C[i]'],
          dialecto: 'parcial',
          explicacion: 'Éste es el punto 1 del preparcial, ejecutándose de verdad. Ponlo en la pestaña «Hoja», modo Resolver, y rellénala tú antes de mirar. Los valores de A, B y M son un ejemplo: en el examen te los dan a ti. Fíjate en au: se reinicia en cada llamada porque es local, y sólo se le resta 2 cuando es mayor que 3.'
        }],
        banco: [
          { id: 'u4-pe-01', enunciado: 'Trazar a mano la ejecución de la Burbuja sobre el vector [5, 2, 9, 1] y decir cuántos intercambios ocurren.', dificultad: 'media', estructura: ['prueba-escritorio'] },
          { id: 'u4-pe-02', enunciado: 'En la registraduría necesitan un algoritmo que valide formularios de votación. La matriz tiene cédula, número de puesto y número de candidato, con 100.000 votantes. Mediante procedimientos: (a) validar que cada cédula tenga 7, 8 o 10 cifras y contar los errados, (b) el puesto con más votos, (c) los votos de un candidato dado, (d) el candidato ganador.', dificultad: 'alta', estructura: ['descomponer', 'cabecera-sub', 'contador', 'maximo'], fuente: 'Preparcial 2, punto 3', nota: 'Un procedimiento por literal. Lo que se evalúa es la descomposición, no el algoritmo.' }
        ]
      }
    ]
  };
})();
