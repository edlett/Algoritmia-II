/* ============================================================
   temas-extra.js — temas que el syllabus pide y que faltaban.

   Se añaden a su unidad en vez de reescribir los archivos grandes:
     · burbuja-matriz     «ordenamiento Burbuja sobre matrices», unidad II
     · series             tipología D del curso (series a arreglos)
     · intercalacion      tipología E (Merge con punteros concurrentes)
     · prueba-escritorio  el punto fijo del Parcial 1
     · pilas-colas / listas   separa el bloque de memoria, que iba apelmazado
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};
  const U = AYP.data.unidades;

  /* ---------- Unidad 1 · vectores ---------- */
  U[1].temas.push({
    id: 'intercalacion',
    viz: ['intercalacion'],
    titulo: 'Intercalación de vectores ordenados',
    semana: 3, horas: 2, manual: 'tipología E del curso', clave: true,
    resumen: 'Fusionar dos vectores ya ordenados en un tercero, con dos punteros que avanzan a distinto ritmo.',
    teoria: {
      notacion: '|C| = |A| + |B| \\qquad \\text{coste } O(N + M)',
      concepto: 'Dados dos vectores A y B YA ordenados, se puede construir un tercero C ordenado sin ordenar nada: basta comparar las cabezas de los dos y copiar la menor. El puntero del que ganó avanza; el otro se queda esperando.',
      procedimiento: [
        'Tres índices: I sobre A, J sobre B y K sobre C.',
        'Mientras queden elementos en los dos: comparar A(I) con B(J), copiar el menor y avanzar sólo ese puntero.',
        'Al agotarse uno, volcar la cola del otro tal cual.',
        'K avanza siempre, una posición por elemento copiado.'
      ],
      logica: 'Funciona porque los dos vectores están ordenados: la menor de las dos cabezas es, forzosamente, el menor de todo lo que queda. Por eso la intercalación cuesta N+M pasos y ordenar desde cero costaría mucho más — es la idea que sostiene el Merge Sort.',
      trampas: [
        'Avanzar los dos punteros a la vez: se saltan elementos.',
        'Olvidar volcar la cola del vector que sobra: C queda incompleto.',
        'Usar un solo ciclo PARA: no sirve, porque no se sabe de antemano de cuál vector saldrá cada elemento. Va con MQ.'
      ]
    },
    patrones: ['doble-puntero'],
    ejemplos: [{
      id: 'e-v-merge',
      enunciado: 'Dados dos vectores A de tamaño N y B de tamaño M, ambos ordenados, fusionarlos en C ordenado',
      fuente: 'tipología E del curso',
      codigo: `INICIO
    LEA N, M
    PARA I = 1, N, 1 HAGA
        LEA A(I)
    F-PARA
    PARA I = 1, M, 1 HAGA
        LEA B(I)
    F-PARA
    I ← 1
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
    MQ (I <= N) HAGA
        K ← K + 1
        C(K) ← A(I)
        I ← I + 1
    F_MQ
    MQ (J <= M) HAGA
        K ← K + 1
        C(K) ← B(J)
        J ← J + 1
    F_MQ
    PARA X = 1, K, 1 HAGA
        ESCRIBA C(X)
    F-PARA
FIN`,
      entradas: [4, 5, 2, 7, 11, 20, 1, 5, 9, 14, 30],
      hoja: ['I', 'J', 'K'],
      explicacion: 'Sigue las tres columnas de la hoja: I y J nunca suben a la vez, y K sube siempre. Cuando uno de los dos se agota, los dos MQ finales vuelcan lo que quedaba sin comparar nada más.'
    }],
    banco: []
  });

  U[1].temas.push({
    id: 'series',
    viz: ['patrones-vector'],
    titulo: 'Series y sucesiones sobre arreglos',
    semana: 2, horas: 2, manual: 'tipología D del curso',
    resumen: 'Traducir una serie matemática a un ciclo: signo alternante, numerador, denominador y exponente avanzando a la vez.',
    teoria: {
      notacion: '\\sum_{i=1}^{N} i = \\frac{N(N+1)}{2} \\qquad F_n = F_{n-1} + F_{n-2}',
      concepto: 'Una serie como X − 3X²/2 + 5X⁴/6 − 7X⁸/24 … no se resuelve con una fórmula: se resuelve identificando qué cambia de un término al siguiente y haciendo avanzar cada cosa dentro del mismo ciclo.',
      procedimiento: [
        'Identificar las piezas: signo, numerador, exponente, denominador.',
        'Inicializar cada una ANTES del ciclo con el valor del primer término.',
        'Dentro del ciclo: primero usar las piezas, después hacerlas avanzar.',
        'El signo alterna con SIGNO ← SIGNO * (−1).'
      ],
      logica: 'El truco está en no recalcular: el factorial del denominador se arrastra multiplicándolo por I en cada vuelta, y la potencia se arrastra multiplicando por X. Recalcularlos desde cero en cada término convierte un algoritmo lineal en uno cuadrático.',
      trampas: [
        'Hacer avanzar las piezas antes de usarlas: el primer término sale mal.',
        'Recalcular el factorial entero en cada vuelta.',
        'Confundir el índice del ciclo con el exponente cuando no coinciden.'
      ]
    },
    patrones: ['acumulador', 'bandera'],
    ejemplos: [{
      id: 'e-v-serie',
      enunciado: 'Generar un vector con los N primeros términos de la serie 1/3 − 3/5 + 16/7 − 125/9 + 1296/11 …',
      fuente: 'tipología D del curso',
      codigo: `INICIO
    LEA N
    SIGNO ← 1
    DENO ← 3
    BASE ← 1
    EXPO ← 0
    PARA I = 1, N, 1 HAGA
        A(I) ← SIGNO * (BASE ^ EXPO) / DENO
        ESCRIBA "Termino", I, "=", A(I)
        SIGNO ← SIGNO * (-1)
        DENO ← DENO + 2
        BASE ← BASE + 1
        EXPO ← EXPO + 1
    F-PARA
FIN`,
      entradas: [6],
      hoja: ['I', 'SIGNO', 'BASE', 'EXPO', 'DENO'],
      explicacion: 'Mira la hoja: cuatro columnas avanzando en paralelo, cada una a su ritmo. SIGNO va 1, −1, 1, −1; DENO sube de dos en dos; BASE y EXPO suben de uno en uno pero arrancan en valores distintos. Ése desfase es lo único difícil del ejercicio.'
    }],
    banco: []
  });

  U[1].temas.push({
    id: 'prueba-escritorio',
    titulo: 'Prueba de escritorio',
    semana: 5, horas: 2, manual: 'punto fijo del Parcial 1 y 2', clave: true,
    resumen: 'Rastrear el estado de un algoritmo a mano, sin ejecutarlo. Cae en los dos parciales y en el final.',
    teoria: {
      concepto: 'La prueba de escritorio es seguir la ejecución línea por línea llevando una tabla con el valor de cada variable. No es un ejercicio de programar: es un ejercicio de leer con precisión.',
      procedimiento: [
        'Hacer una tabla con una columna por variable que cambia.',
        'Una fila por cada vuelta del ciclo principal.',
        'Anotar SÓLO cuando el valor cambia; arrastrar el resto.',
        'Si hay una función, abrir una sub-tabla con sus locales y cerrarla al retornar.'
      ],
      logica: 'La tabla es la memoria del programa dibujada. Si la llevas ordenada, el ejercicio se vuelve mecánico; si vas de cabeza, te pierdes a la cuarta iteración. Por eso el profesor da la hoja de respuestas ya cuadriculada.',
      trampas: [
        'Arrastrar el valor de una variable local entre dos llamadas: nace y muere con cada una.',
        'Aplicar una operación cuya condición era falsa.',
        'Confundir M(X,Y) con M(Y,X).',
        'Incrementar la variable de control antes de tiempo: en un PARA, sube AL TERMINAR la vuelta.'
      ]
    },
    patrones: ['prueba-escritorio'],
    ejemplos: [{
      id: 'e-v-traza-basica',
      enunciado: 'Trace este algoritmo y diga qué imprime',
      fuente: 'clásico de parcial',
      codigo: `INICIO
    S ← 0
    C ← 0
    PARA I = 1, 6, 1 HAGA
        SI (I MOD 2 = 0) ENTONCES
            S ← S + I
            C ← C + 1
        SINO
            S ← S - I
        F-SI
    F-PARA
    ESCRIBA "S =", S
    ESCRIBA "C =", C
FIN`,
      entradas: [],
      hoja: ['I', 'S', 'C'],
      explicacion: 'Rellena la hoja tú antes de darle a reproducir. Suma 2, 4 y 6 (=12) y resta 1, 3 y 5 (=9): queda S = 3 y C = 3. El error típico es contar también los impares.'
    }],
    banco: []
  });

  /* ---------- Unidad 2 · matrices ---------- */
  U[2].temas.push({
    id: 'burbuja-matriz',
    viz: ['burbuja'],
    titulo: 'Ordenamiento sobre matrices',
    semana: 5, horas: 2, manual: 'syllabus, unidad II', clave: true,
    resumen: 'La Burbuja aplicada a una rejilla: por filas, por columnas, o tratando la matriz entera como un vector largo.',
    teoria: {
      notacion: 'N \\times M \\text{ elementos} \\;\\Longrightarrow\\; O\\big((N M)^2\\big) \\text{ si se ordena todo}',
      concepto: 'El syllabus pide explícitamente «ordenamiento Burbuja sobre matrices». Hay tres lecturas distintas del enunciado y conviene preguntar cuál se quiere: ordenar cada fila por separado, ordenar cada columna, u ordenar TODOS los elementos como si la matriz fuera un vector largo.',
      procedimiento: [
        'Por filas: la Burbuja completa va DENTRO del ciclo de filas. Tres niveles de anidamiento.',
        'Por columnas: igual, cambiando los papeles de I y J.',
        'Global: volcar la matriz a un vector de N*M, ordenar ese vector, y devolver los valores recorriendo otra vez.',
        'La versión global es la más limpia porque reutiliza la Burbuja de vectores tal cual.'
      ],
      logica: 'Volcar a un vector y devolver es preferible a intentar ordenar «en rejilla»: la Burbuja necesita comparar posiciones consecutivas, y en una matriz «la siguiente posición» después de M(I,M) es M(I+1,1), lo que obliga a aritmética de índices propensa a errores. Con el volcado, el problema difícil ya está resuelto.',
      trampas: [
        'Intentar ordenar la matriz directamente con dos índices dobles: el código se vuelve ilegible.',
        'Al devolver los valores del vector a la matriz, perder el contador K.',
        'Ordenar cada fila y creer que la matriz entera queda ordenada: no lo está entre filas.'
      ]
    },
    patrones: ['intercambio', 'doble-ciclo'],
    ejemplos: [{
      id: 'e-m-burbuja',
      enunciado: 'Ordenar todos los elementos de una matriz de N × M tratándola como un vector largo',
      fuente: 'syllabus, unidad II',
      codigo: `INICIO
    LEA N, M
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    T ← 0
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            T ← T + 1
            V(T) ← A(I,J)
        F-PARA
    F-PARA
    PARA I = 1, T-1, 1 HAGA
        PARA J = I+1, T, 1 HAGA
            SI (V(I) > V(J)) ENTONCES
                TMP ← V(I)
                V(I) ← V(J)
                V(J) ← TMP
            F-SI
        F-PARA
    F-PARA
    K ← 0
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            K ← K + 1
            A(I,J) ← V(K)
            ESCRIBA A(I,J)
        F-PARA
    F-PARA
FIN`,
      entradas: [2, 3, 9, 4, 7, 1, 8, 3],
      hoja: ['T', 'I', 'J', 'K'],
      explicacion: 'Tres fases claramente separadas: volcar, ordenar, devolver. En el panel de memoria verás la matriz A y el vector V a la vez; V se llena, se ordena y luego repinta A de arriba abajo.'
    }],
    banco: []
  });

  /* ---------- Unidad 5 · memoria, separada en dos ---------- */
  U[5].temas.push({
    id: 'pilas-colas',
    viz: ['lifo-fifo'],
    titulo: 'Pilas y colas',
    semana: 16, horas: 1, manual: 'syllabus, concepto de memoria',
    resumen: 'LIFO y FIFO simuladas sobre un vector, y por qué la pila es exactamente lo que sostiene la recursividad.',
    teoria: {
      concepto: 'Una pila (LIFO) entra y sale por el mismo extremo: el último en entrar es el primero en salir. Una cola (FIFO) entra por un extremo y sale por el otro: el primero en entrar es el primero en salir. Las dos se pueden simular sobre un vector con uno o dos índices.',
      procedimiento: [
        'Pila: un índice TOPE. Apilar es TOPE ← TOPE + 1 y escribir; desapilar es leer y TOPE ← TOPE − 1.',
        'Cola: dos índices, FRENTE y FINAL. Encolar avanza FINAL; desencolar avanza FRENTE.',
        'Antes de desapilar hay que comprobar que la pila no esté vacía (TOPE > 0).',
        'Los índices son parámetros de Entrada-Salida: entran con un valor y salen modificados.'
      ],
      logica: 'La pila no es un tema aparte de la recursividad: es lo mismo. El panel «Pila de llamadas» que has visto en cada traza es literalmente una pila LIFO, donde cada llamada apila un marco y cada retorno lo desapila. Estudiar los dos juntos ahorra la mitad del trabajo.',
      trampas: [
        'Desapilar sin comprobar si está vacía.',
        'Confundir el orden de salida de una pila con el de una cola.',
        'En la cola, olvidar que FRENTE avanza y deja huecos por detrás: hay que decidir si se compacta o se hace circular.'
      ]
    },
    patrones: ['cabecera-sub'],
    ejemplos: [{
      id: 'e-r-pilacola',
      enunciado: 'Las mismas operaciones sobre una pila y sobre una cola, para ver la diferencia',
      fuente: 'syllabus, concepto de memoria',
      codigo: `SUBRUTINA apilar (P, TOPE, VALOR)
    TOPE ← TOPE + 1
    P(TOPE) ← VALOR
FIN_SUBRUTINA

SUBRUTINA desapilar (P, TOPE, SALE)
    SI (TOPE > 0) ENTONCES
        SALE ← P(TOPE)
        TOPE ← TOPE - 1
    SINO
        SALE ← 0
    F-SI
FIN_SUBRUTINA

INICIO
    T ← 0
    EJECUTE apilar(P, T, 10)
    EJECUTE apilar(P, T, 20)
    EJECUTE apilar(P, T, 30)
    EJECUTE desapilar(P, T, X)
    ESCRIBA "Sale de la pila:", X
    EJECUTE desapilar(P, T, X)
    ESCRIBA "Sale de la pila:", X
    ESCRIBA "Quedan en la pila:", T
FIN`,
      entradas: [],
      hoja: ['T', 'VALOR', 'X'],
      explicacion: 'Sale 30 antes que 20: último en entrar, primero en salir. Fíjate en que TOPE es de Entrada-Salida: entra con un valor y vuelve modificado al principal. Si fuera de entrada, la pila no funcionaría.'
    }],
    banco: []
  });

  U[5].temas.push({
    id: 'listas',
    titulo: 'Estructuras estáticas y dinámicas',
    semana: 16, horas: 1, manual: 'syllabus, concepto de memoria',
    resumen: 'Por qué un vector cuesta desplazar y una lista sólo re-enlazar.',
    teoria: {
      concepto: 'Una estructura estática (vector, matriz) tiene tamaño fijo y ocupa memoria contigua reservada de antemano. Una dinámica (lista) crece y decrece durante la ejecución: cada nodo guarda su dato y la dirección del siguiente.',
      procedimiento: [
        'Vector: acceso directo por índice, coste 1. Insertar en medio: desplazar, coste N.',
        'Lista: acceso secuencial, hay que recorrer desde el primero. Insertar: re-enlazar, coste 1.',
        'Una lista se puede simular con dos vectores paralelos: DATO(I) y SIG(I).',
        'SIG(I) guarda el índice del siguiente nodo; un 0 marca el final.'
      ],
      logica: 'La elección no es «cuál es mejor» sino «qué operación se va a hacer más». Si el programa consulta mucho por posición, gana el vector. Si inserta y borra mucho en medio, gana la lista. El syllabus sólo pide las nociones, pero entender ese intercambio es lo que se pregunta en teoría.',
      trampas: [
        'Creer que la lista es siempre mejor: pierde el acceso directo por índice.',
        'En la simulación con vectores, confundir el orden FÍSICO (el del vector) con el LÓGICO (el que marcan los enlaces).',
        'Olvidar actualizar el enlace del nodo anterior al insertar.'
      ]
    },
    patrones: ['desplazamiento'],
    ejemplos: [{
      id: 'e-r-lista',
      enunciado: 'Una lista enlazada simulada con dos vectores: el orden físico no es el orden lógico',
      fuente: 'syllabus, concepto de memoria',
      codigo: `INICIO
    PRIMERO ← 3
    ESCRIBA "Orden fisico del vector DATO:"
    PARA I = 1, 5, 1 HAGA
        ESCRIBA DATO(I)
    F-PARA
    ESCRIBA "Orden logico siguiendo los enlaces:"
    I ← PRIMERO
    MQ (I <> 0) HAGA
        ESCRIBA DATO(I)
        I ← SIG(I)
    F_MQ
FIN`,
      entradas: [],
      precarga: { DATO: [40, 50, 10, 20, 30], SIG: [5, 0, 4, 1, 2] },
      hoja: ['I', 'PRIMERO'],
      explicacion: 'El vector guarda 40, 50, 10, 20, 30 en ese orden físico. Pero siguiendo los enlaces desde PRIMERO = 3 sale 10, 20, 30, 40, 50. Insertar en medio de esta lista es cambiar un solo número de SIG: no se mueve ni un dato.'
    }],
    banco: []
  });

  /* ---------- el cronograma también los conoce ---------- */
  const cron = AYP.data.cronograma;
  const meter = (n, ids) => {
    const s = cron.find(x => x.n === n);
    if (s) s.temas = (s.temas || []).concat(ids);
  };
  meter(2, ['series']);
  meter(3, ['intercalacion']);
  meter(5, ['prueba-escritorio', 'burbuja-matriz']);
  meter(16, ['pilas-colas', 'listas']);
})();
