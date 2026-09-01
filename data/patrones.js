/* ============================================================
   patrones.js — el tarjetero.
   El equivalente del formulario de Cálculo II: aquí no se memorizan
   fórmulas sino fragmentos de pseudocódigo reutilizables.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};

  AYP.data.patrones = [
    {
      id: 'lectura-masiva', nombre: 'Lectura masiva', corte: 1,
      cuando: 'Hay que llenar un vector o una matriz con datos de entrada.',
      codigo: `PARA I = 1, N, 1 HAGA\n    LEA V(I)\nF-PARA`,
      clave: 'Los índices van de 1 a N, ambos incluidos.',
      trampa: 'Empezar en 0 por inercia de Java.'
    },
    {
      id: 'acumulador', nombre: 'Acumulador', corte: 1,
      cuando: 'Hay que sumar o multiplicar todos los elementos de una colección.',
      codigo: `S ← 0\nPARA I = 1, N, 1 HAGA\n    S ← S + V(I)\nF-PARA`,
      clave: 'Se inicializa FUERA del ciclo. En suma con 0, en producto con 1.',
      trampa: 'Inicializar S ← 0 en un producto lo anula todo.',
      tema: 'patrones-vector'
    },
    {
      id: 'contador', nombre: 'Contador condicional', corte: 1,
      cuando: 'Hay que contar cuántos elementos cumplen una propiedad.',
      codigo: `C ← 0\nPARA I = 1, N, 1 HAGA\n    SI (V(I) MOD 2 = 0) ENTONCES\n        C ← C + 1\n    F-SI\nF-PARA`,
      clave: 'El contador sube de uno en uno; el acumulador sube el valor. No son lo mismo.',
      trampa: 'Sumar V(I) cuando lo que se pide es contar.',
      tema: 'patrones-vector'
    },
    {
      id: 'maximo', nombre: 'Máximo y mínimo', corte: 1,
      cuando: 'Hay que hallar el mayor o el menor elemento.',
      codigo: `MAY ← V(1)\nPARA I = 2, N, 1 HAGA\n    SI (V(I) > MAY) ENTONCES\n        MAY ← V(I)\n    F-SI\nF-PARA`,
      clave: 'Se inicializa con el PRIMER elemento y el ciclo arranca en 2.',
      trampa: 'Inicializar en 0: con un vector de negativos, el resultado no estaría en el vector.',
      tema: 'patrones-vector'
    },
    {
      id: 'bandera', nombre: 'Bandera (switch)', corte: 1,
      cuando: 'Hay que parar en cuanto se encuentra algo, o recordar si pasó.',
      codigo: `SW ← 0\nI ← 1\nMQ ((I <= N) y (SW = 0)) HAGA\n    SI (V(I) = X) ENTONCES\n        SW ← 1\n    SINO\n        I ← I + 1\n    F-SI\nF_MQ`,
      clave: 'La condición del MQ es doble: o se encontró, o se acabó el vector.',
      trampa: 'Olvidar el I ← I + 1 dentro del SINO: el ciclo no termina nunca.',
      tema: 'busqueda'
    },
    {
      id: 'intercambio', nombre: 'Intercambio con temporal', corte: 1,
      cuando: 'Hay que cambiar de sitio dos valores.',
      codigo: `T ← A(I)\nA(I) ← A(J)\nA(J) ← T`,
      clave: 'Son tres líneas: guardar, copiar, restituir.',
      trampa: 'Hacerlo en dos líneas sin T: los dos acaban valiendo lo mismo.',
      tema: 'burbuja'
    },
    {
      id: 'doble-ciclo', nombre: 'Doble ciclo de matriz', corte: 1,
      cuando: 'Hay que recorrer una matriz entera.',
      codigo: `PARA I = 1, N, 1 HAGA\n    PARA J = 1, M, 1 HAGA\n        ESCRIBA A(I,J)\n    F-PARA\nF-PARA`,
      clave: 'El interior da una vuelta completa por cada paso del exterior.',
      trampa: 'Cerrar los F-PARA en el orden equivocado.',
      tema: 'matriz-anatomia'
    },
    {
      id: 'diagonales', nombre: 'Diagonales', corte: 1,
      cuando: 'Hay que recorrer la diagonal principal o la secundaria.',
      codigo: `PARA I = 1, N, 1 HAGA\n    DP ← DP + A(I, I)\n    DS ← DS + A(I, N - I + 1)\nF-PARA`,
      clave: 'La secundaria lleva +1 porque los índices empiezan en 1.',
      trampa: 'Escribir A(I, N − I): se sale de la matriz en el primer elemento.',
      tema: 'recorridos-matriz'
    },
    {
      id: 'validacion', nombre: 'Validación de dimensiones', corte: 1,
      cuando: 'Antes de cualquier operación entre dos matrices.',
      codigo: `SI (N1 = N2) y (M1 = M2) ENTONCES\n    { operar }\nSINO\n    ESCRIBA "No se pueden operar las matrices"\nF-SI`,
      clave: 'Suma y resta exigen dimensiones iguales; la multiplicación exige columnas(A) = filas(B).',
      trampa: 'Omitirla. El profesor la pide siempre y forma parte de la respuesta correcta.',
      tema: 'operaciones-matriz'
    },
    {
      id: 'desplazamiento', nombre: 'Desplazamiento', corte: 1,
      cuando: 'Hay que insertar o borrar en un vector.',
      codigo: `{ insertar en K }\nPARA I = N, K, -1 HAGA\n    V(I + 1) ← V(I)\nF-PARA\nV(K) ← X\nN ← N + 1`,
      clave: 'Al insertar se va DESDE EL FINAL hacia K; al borrar, desde K hacia el final.',
      trampa: 'Desplazar en la dirección contraria: el vector se llena del mismo valor.',
      tema: 'insercion-borrado'
    },
    {
      id: 'doble-puntero', nombre: 'Dos punteros', corte: 1,
      cuando: 'Hay que recorrer dos vectores a la vez, cada uno a su ritmo.',
      codigo: `I ← 1
J ← 1
K ← 0
MQ ((I <= N) y (J <= M)) HAGA
    K ← K + 1
    SI (A(I) <= B(J)) ENTONCES
        C(K) ← A(I)
        I ← I + 1
    SINO
        C(K) ← B(J)
        J ← J + 1
    F-SI
F_MQ
{ y luego volcar la cola del que sobre }`,
      clave: 'Sólo avanza el puntero del que ganó la comparación. K avanza siempre.',
      trampa: 'Avanzar los dos a la vez, u olvidar volcar la cola del vector que sobra.',
      tema: 'intercalacion'
    },
    {
      id: 'recorrer-cadena', nombre: 'Recorrer una cadena', corte: 2,
      cuando: 'Hay que mirar los caracteres de uno en uno, o los dígitos de un número.',
      codigo: `C ← STR(N)\nL ← LONG(C)\nPARA I = 1, L, 1 HAGA\n    D ← SUBSTR(C, I, 1)\n    NUM ← VAL(D)\nF-PARA`,
      clave: 'STR y VAL son el puente entre número y texto. SUBSTR cuenta desde 1.',
      trampa: 'SUBSTR(C, 0, 1) para el primer carácter.',
      tema: 'construir'
    },
    {
      id: 'construir', nombre: 'Construir una cadena', corte: 2,
      cuando: 'Hay que armar una cadena nueva letra a letra.',
      codigo: `C2 ← ''\nPARA I = 1, L, 1 HAGA\n    C2 ← C2 || SUBSTR(C, I, 1)\nF-PARA`,
      clave: 'Es el acumulador de siempre, con la cadena vacía en vez del 0 y || en vez de +.',
      trampa: 'No inicializar C2: al concatenar sobre una variable sin valor el algoritmo se cae.',
      tema: 'construir'
    },
    {
      id: 'ventana', nombre: 'Ventana deslizante', corte: 2,
      cuando: 'Hay que buscar una subcadena dentro de otra.',
      codigo: `L1 ← LONG(GRANDE)\nL2 ← LONG(BUSCADA)\nPARA I = 1, L1 - L2 + 1, 1 HAGA\n    SI (SUBSTR(GRANDE, I, L2) = BUSCADA) ENTONCES\n        POS ← I\n    F-SI\nF-PARA`,
      clave: 'El ciclo llega a L1 − L2 + 1: más allá la ventana ya no cabe.',
      trampa: 'Recorrer hasta L1 y comparar trozos incompletos.',
      tema: 'buscar-subcadena'
    },
    {
      id: 'cabecera-sub', nombre: 'Cabecera de subrutina', corte: 3,
      cuando: 'El resultado es un conjunto, o no hay resultado.',
      codigo: `SUBRUTINA nombre (PARAM1, PARAM2)\n    { cuerpo }\nFIN_SUBRUTINA\n\n{ se invoca así }\nEJECUTE nombre(A, B)`,
      clave: 'Se invoca OBLIGATORIAMENTE con EJECUTE. Devuelve por sus parámetros.',
      trampa: 'Invocarla sin EJECUTE, o esperar que devuelva algo por su nombre.',
      tema: 'subrutinas'
    },
    {
      id: 'cabecera-fun', nombre: 'Cabecera de función', corte: 3,
      cuando: 'El resultado es un solo dato.',
      codigo: `FUNCION nombre (PARAM1, PARAM2)\n    { cuerpo }\n    nombre ← resultado\nFIN_FUNCION\n\n{ se invoca así }\nC ← nombre(A, B)`,
      clave: 'El nombre de la función ES la variable del resultado. Se invoca SIN EJECUTE.',
      trampa: 'Cerrarla sin asignar nada a su nombre; o usarla para devolver un vector.',
      tema: 'funciones'
    },
    {
      id: 'decidir', nombre: '¿Función o subrutina?', corte: 3,
      cuando: 'Siempre, antes de escribir la cabecera.',
      codigo: `{ ¿el resultado es UN SOLO DATO? }        → FUNCION\n{ ¿es un CONJUNTO, o no hay resultado? } → SUBRUTINA\n\n{ Ejemplos }\npromedio de un vector   → FUNCION\nel vector ordenado      → SUBRUTINA\ncuántos negativos hay   → FUNCION\nllenar un vector        → SUBRUTINA`,
      clave: 'Toda función puede expresarse como subrutina, pero no al revés.',
      trampa: 'Usar función para devolver un vector: imposible.',
      tema: 'funciones'
    },
    {
      id: 'parametros-tipos', nombre: 'Los tres tipos de parámetro', corte: 3,
      cuando: 'Al declarar cualquier procedimiento.',
      codigo: `Entrada (E)        se necesita ANTES     → por valor\nSalida (S)         se conoce DESPUÉS     → por referencia\nEntrada-Salida     entra y sale cambiado → por referencia\n\n{ una FUNCIÓN sólo admite parámetros de Entrada }`,
      clave: 'Formales y actuales: uno a uno, mismo orden, misma cantidad.',
      trampa: 'Declarar como Entrada un parámetro que el procedimiento va a llenar.',
      tema: 'parametros'
    },
    {
      id: 'caso-base', nombre: 'Caso base y llamador más pequeño', corte: 4,
      cuando: 'En toda recursión, sin excepción.',
      codigo: `FUNCION f (N)\n    SI (N = 0) ENTONCES\n        f ← 1              { CASO BASE }\n    SINO\n        f ← N * f(N - 1)   { LLAMADOR MÁS PEQUEÑO }\n    F_SI\nFIN_FUNCION`,
      clave: 'Las dos preguntas del profesor: ¿hay salida no recursiva? ¿cada llamada es a un caso más pequeño?',
      trampa: 'Llamar con el mismo argumento, o poner la llamada antes de comprobar el caso base.',
      tema: 'dos-preguntas'
    },
    {
      id: 'recorrido', nombre: 'Recorrido recursivo', corte: 4,
      cuando: 'Hay que recorrer un arreglo sin usar ciclos.',
      codigo: `SUBRUTINA leer (V, T, I)\n    SI (I <= T) ENTONCES\n        LEA V(I)\n        EJECUTE leer(V, T, I + 1)\n    F_SI\nFIN_SUBRUTINA\n\n{ la primera invocación pasa I = 1 }`,
      clave: 'El índice deja de ser variable de ciclo y pasa a ser parámetro.',
      trampa: 'Olvidar el índice inicial en la primera invocación.',
      tema: 'recursion-arreglos'
    },
    {
      id: 'descomponer', nombre: 'Descomponer un problema grande', corte: 3,
      cuando: 'El enunciado tiene literales a), b), c)…',
      codigo: `{ un procedimiento por literal }\nSUBRUTINA validar (MAT, N, ERRADOS)\nSUBRUTINA puestoMayor (MAT, N, PUESTO, VOTOS)\nFUNCION votosDe (MAT, N, CAND)\nFUNCION ganador (MAT, N, NCAND)\n\nINICIO\n    EJECUTE validar(M, N, E)\n    ...\nFIN`,
      clave: 'Lo que se evalúa es la descomposición, no el algoritmo de cada parte.',
      trampa: 'Escribir un solo procedimiento gigante que haga de todo.',
      tema: 'pila-llamadas'
    },
    {
      id: 'prueba-escritorio', nombre: 'Prueba de escritorio', corte: 1,
      cuando: 'Punto fijo del Parcial 1, del Parcial 2 y del Final.',
      codigo: `{ una columna por variable que cambia }\n{ una fila por vuelta del ciclo principal }\n\n  #  |  i  |  X  |  au  |  Y  | C[i]\n  1  |  1  |  2  |  2   |  3  |  23\n  2  |  2  |  5  |  3   |  2  |  52`,
      clave: 'Las variables locales de una función se REINICIAN en cada llamada.',
      trampa: 'Arrastrar el valor de una local entre vueltas; aplicar una operación cuya condición era falsa.',
      tema: 'pila-llamadas'
    }
  ];
})();
