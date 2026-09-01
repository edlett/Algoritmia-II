/* ============================================================
   propuestos.js — los 43 ejercicios propuestos del Manual de
   Informática II, transcritos completos.

   Son los que el profesor tiene a mano para exámenes y talleres:
   el punto 2 del preparcial es literalmente el §2.3-9 de esta lista.

   Los que llevan `solucion` la traen en pseudocódigo del dialecto
   Libro, y el motor la ejecuta al arrancar la app: si no corriera,
   `AYP.model.validar()` lo cantaría por consola.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};

  AYP.data.propuestos = [

    /* ================= §1.2.6 · SUBRUTINAS ================= */
    {
      id: 'ps-01', grupo: 'Subrutinas', n: 1, corte: 3, dificultad: 'alta',
      fuente: 'Manual §1.2.6, subrutinas 1',
      enunciado: 'Sea un número que está en base X, haga un algoritmo para pasarlo a base S, donde X y S son bases menores o iguales a 10. No utilice arreglos.',
      estructura: ['cabecera-sub', 'acumulador'],
      pista: 'Dos pasos: de base X a base 10 (multiplicando por potencias), y de base 10 a base S (dividiendo y guardando residuos).',
      solucion: `FUNCION aBase10 (NUM, X)
    R ← 0
    P ← 0
    MQ (NUM > 0) HAGA
        D ← NUM MOD 10
        R ← R + D * (X ^ P)
        NUM ← [| NUM / 10 |]
        P ← P + 1
    F_MQ
    aBase10 ← R
FIN_FUNCION

FUNCION deBase10 (NUM, S)
    R ← 0
    P ← 1
    MQ (NUM > 0) HAGA
        D ← NUM MOD S
        R ← R + D * P
        NUM ← [| NUM / S |]
        P ← P * 10
    F_MQ
    deBase10 ← R
FIN_FUNCION

INICIO
    LEA NUM, X, S
    DIEZ ← aBase10(NUM, X)
    ESCRIBA "En base 10:", DIEZ
    ESCRIBA "En base", S, "es", deBase10(DIEZ, S)
FIN`,
      entradas: [1011, 2, 8]
    },
    {
      id: 'ps-02', grupo: 'Subrutinas', n: 2, corte: 1, dificultad: 'alta',
      fuente: 'Manual §1.2.6, subrutinas 2',
      enunciado: 'Sea una matriz A de N x M, genere dos vectores B y C, donde B tendrá aquellos elementos de la matriz que son primos y C los que son perfectos.',
      estructura: ['doble-ciclo', 'contador', 'cabecera-sub'],
      pista: 'Primo: contar divisores exactos y comprobar que son exactamente 2. Perfecto: la suma de sus divisores propios es el número.',
      solucion: `FUNCION esPrimo (NUM)
    CONT ← 0
    PARA K = 1, NUM, 1 HAGA
        SI (NUM MOD K = 0) ENTONCES
            CONT ← CONT + 1
        F-SI
    F-PARA
    SI (CONT = 2) ENTONCES
        esPrimo ← 1
    SINO
        esPrimo ← 0
    F-SI
FIN_FUNCION

FUNCION esPerfecto (NUM)
    S ← 0
    PARA K = 1, NUM - 1, 1 HAGA
        SI (NUM MOD K = 0) ENTONCES
            S ← S + K
        F-SI
    F-PARA
    SI (S = NUM) ENTONCES
        esPerfecto ← 1
    SINO
        esPerfecto ← 0
    F-SI
FIN_FUNCION

INICIO
    LEA N, M
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    TB ← 0
    TC ← 0
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            SI (esPrimo(A(I,J)) = 1) ENTONCES
                TB ← TB + 1
                B(TB) ← A(I,J)
            F-SI
            SI (esPerfecto(A(I,J)) = 1) ENTONCES
                TC ← TC + 1
                C(TC) ← A(I,J)
            F-SI
        F-PARA
    F-PARA
    ESCRIBA "Primos:", TB
    PARA I = 1, TB, 1 HAGA
        ESCRIBA B(I)
    F-PARA
    ESCRIBA "Perfectos:", TC
    PARA I = 1, TC, 1 HAGA
        ESCRIBA C(I)
    F-PARA
FIN`,
      entradas: [2, 3, 6, 7, 4, 28, 11, 9]
    },
    {
      id: 'ps-03', grupo: 'Subrutinas', n: 3, corte: 1, dificultad: 'media',
      fuente: 'Manual §1.2.6, subrutinas 3',
      enunciado: 'Sean dos matrices A y B cuadradas de tamaño N, haga un algoritmo que halle la suma de la primera fila de A y la primera fila de B. Si el total de A es mayor que el total de B, entonces halle C = A + B, si no halle C = A − B.',
      estructura: ['acumulador', 'validacion', 'doble-ciclo'],
      pista: 'El truco del profesor: una sola subrutina suma_resta parametrizada por el signo.',
      solucion: `FUNCION sumaFila1 (N, MAT)
    S ← 0
    PARA J = 1, N, 1 HAGA
        S ← S + MAT(1, J)
    F-PARA
    sumaFila1 ← S
FIN_FUNCION

SUBRUTINA suma_resta (N, A, B, C, SIGNO)
    PARA I = 1, N, 1 HAGA
        PARA J = 1, N, 1 HAGA
            C(I,J) ← A(I,J) + SIGNO * B(I,J)
        F-PARA
    F-PARA
FIN_SUBRUTINA

INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        PARA J = 1, N, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    PARA I = 1, N, 1 HAGA
        PARA J = 1, N, 1 HAGA
            LEA B(I,J)
        F-PARA
    F-PARA
    TA ← sumaFila1(N, A)
    TB ← sumaFila1(N, B)
    SI (TA > TB) ENTONCES
        EJECUTE suma_resta(N, A, B, C, 1)
        ESCRIBA "C = A + B"
    SINO
        EJECUTE suma_resta(N, A, B, C, -1)
        ESCRIBA "C = A - B"
    F-SI
    PARA I = 1, N, 1 HAGA
        PARA J = 1, N, 1 HAGA
            ESCRIBA C(I,J)
        F-PARA
    F-PARA
FIN`,
      entradas: [2, 9, 9, 1, 1, 2, 2, 3, 3]
    },
    {
      id: 'ps-04', grupo: 'Subrutinas', n: 4, corte: 1, dificultad: 'media',
      fuente: 'Manual §1.2.6, subrutinas 4',
      enunciado: 'Sea un número cualquiera, genere un vector con los elementos que pertenecen a la serie de Fibonacci menores o iguales a él.',
      estructura: ['acumulador', 'cabecera-sub'],
      pista: 'Dos variables que se persiguen: A ← 1, B ← 1, y en cada vuelta C ← A + B.',
      solucion: `SUBRUTINA fibonacci (LIM, V, T)
    A ← 1
    B ← 1
    T ← 0
    MQ (A <= LIM) HAGA
        T ← T + 1
        V(T) ← A
        C ← A + B
        A ← B
        B ← C
    F_MQ
FIN_SUBRUTINA

INICIO
    LEA LIM
    EJECUTE fibonacci(LIM, V, TAM)
    ESCRIBA "Elementos:", TAM
    PARA I = 1, TAM, 1 HAGA
        ESCRIBA V(I)
    F-PARA
FIN`,
      entradas: [50]
    },
    {
      id: 'ps-05', grupo: 'Subrutinas', n: 5, corte: 3, dificultad: 'media',
      fuente: 'Manual §1.2.6, subrutinas 5',
      enunciado: 'Sean dos números cualesquiera que pertenecen a los naturales, imprima todos los números primos que se encuentran entre los dos. Ejemplo: si los números son el 7 y el 25, los primos son el 7, 11, 13, 17, 19, 23.',
      estructura: ['cabecera-fun', 'contador'],
      solucion: `FUNCION esPrimo (NUM)
    CONT ← 0
    PARA K = 1, NUM, 1 HAGA
        SI (NUM MOD K = 0) ENTONCES
            CONT ← CONT + 1
        F-SI
    F-PARA
    SI (CONT = 2) ENTONCES
        esPrimo ← 1
    SINO
        esPrimo ← 0
    F-SI
FIN_FUNCION

INICIO
    LEA A, B
    PARA N = A, B, 1 HAGA
        SI (esPrimo(N) = 1) ENTONCES
            ESCRIBA N
        F-SI
    F-PARA
FIN`,
      entradas: [7, 25]
    },
    {
      id: 'ps-06', grupo: 'Subrutinas', n: 6, corte: 1, dificultad: 'alta',
      fuente: 'Manual §1.2.6, subrutinas 6',
      enunciado: 'Desarrolle un algoritmo que halle la suma de los N primeros elementos de la serie S = X − 3X²/2 + 5X⁴/6 − 7X⁸/24 + 9X¹⁶/120 … La subrutina debe tener como parámetros de entrada N, X y como parámetro de salida S.',
      estructura: ['acumulador', 'bandera'],
      pista: 'Tres cosas avanzan a la vez: el signo (×−1), el numerador impar (+2) y el exponente que se duplica. El denominador es el factorial del número de término.',
      solucion: `SUBRUTINA serie (N, X, S)
    S ← 0
    SIGNO ← 1
    NUME ← 1
    EXPO ← 1
    FACT ← 1
    PARA I = 1, N, 1 HAGA
        SI (I > 1) ENTONCES
            FACT ← FACT * I
        F-SI
        S ← S + SIGNO * NUME * (X ^ EXPO) / FACT
        SIGNO ← SIGNO * (-1)
        NUME ← NUME + 2
        SI (I = 1) ENTONCES
            EXPO ← 2
        SINO
            EXPO ← EXPO * 2
        F-SI
    F-PARA
FIN_SUBRUTINA

INICIO
    LEA N, X
    EJECUTE serie(N, X, S)
    ESCRIBA "La suma es", S
FIN`,
      entradas: [4, 2]
    },
    {
      id: 'ps-08', grupo: 'Subrutinas', n: 8, corte: 1, dificultad: 'media',
      fuente: 'Manual §1.2.6, subrutinas 8',
      enunciado: 'Genere un vector con los factores primos de un número.',
      estructura: ['cabecera-sub', 'doble-ciclo'],
      solucion: `SUBRUTINA factores (NUM, V, T)
    T ← 0
    D ← 2
    MQ (NUM > 1) HAGA
        SI (NUM MOD D = 0) ENTONCES
            T ← T + 1
            V(T) ← D
            NUM ← [| NUM / D |]
        SINO
            D ← D + 1
        F-SI
    F_MQ
FIN_SUBRUTINA

INICIO
    LEA N
    EJECUTE factores(N, V, TAM)
    ESCRIBA "Factores primos:", TAM
    PARA I = 1, TAM, 1 HAGA
        ESCRIBA V(I)
    F-PARA
FIN`,
      entradas: [360]
    },
    {
      id: 'ps-09', grupo: 'Subrutinas', n: 9, corte: 1, dificultad: 'alta',
      fuente: 'Manual §1.2.6, subrutinas 9',
      enunciado: 'Sea una matriz A de 2N x 2N dividida en cuadrantes. Halle el mayor elemento del primer cuadrante y el menor del segundo. Si la multiplicación de ellos es mayor que 15, intercambie el primer cuadrante con el segundo; si no, intercambie el tercero con el cuarto.',
      estructura: ['doble-ciclo', 'maximo', 'intercambio'],
      pista: 'El cuadrante II empieza en la columna N+1; el III en la fila N+1. Ver el visualizador «Cuadrantes».',
      solucion: `INICIO
    LEA N
    T ← 2 * N
    PARA I = 1, T, 1 HAGA
        PARA J = 1, T, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    MAY ← A(1,1)
    PARA I = 1, N, 1 HAGA
        PARA J = 1, N, 1 HAGA
            SI (A(I,J) > MAY) ENTONCES
                MAY ← A(I,J)
            F-SI
        F-PARA
    F-PARA
    MEN ← A(1, N+1)
    PARA I = 1, N, 1 HAGA
        PARA J = N+1, T, 1 HAGA
            SI (A(I,J) < MEN) ENTONCES
                MEN ← A(I,J)
            F-SI
        F-PARA
    F-PARA
    ESCRIBA "Mayor del I:", MAY, "Menor del II:", MEN
    SI (MAY * MEN > 15) ENTONCES
        PARA I = 1, N, 1 HAGA
            PARA J = 1, N, 1 HAGA
                TMP ← A(I,J)
                A(I,J) ← A(I, J+N)
                A(I, J+N) ← TMP
            F-PARA
        F-PARA
        ESCRIBA "Intercambio I con II"
    SINO
        PARA I = N+1, T, 1 HAGA
            PARA J = 1, N, 1 HAGA
                TMP ← A(I,J)
                A(I,J) ← A(I, J+N)
                A(I, J+N) ← TMP
            F-PARA
        F-PARA
        ESCRIBA "Intercambio III con IV"
    F-SI
    PARA I = 1, T, 1 HAGA
        PARA J = 1, T, 1 HAGA
            ESCRIBA A(I,J)
        F-PARA
    F-PARA
FIN`,
      entradas: [1, 4, 5, 6, 7]
    },

    /* ================= §1.2.6 · FUNCIONES ================= */
    {
      id: 'pf-01', grupo: 'Funciones', n: 1, corte: 3, dificultad: 'media',
      fuente: 'Manual §1.2.6, funciones 1',
      enunciado: 'Sea un número cualquiera, diga cuántos dígitos tiene. Nota: no utilice arreglos.',
      estructura: ['cabecera-fun', 'acumulador'],
      solucion: `FUNCION digitos (NUM)
    C ← 0
    SI (NUM = 0) ENTONCES
        C ← 1
    F-SI
    MQ (NUM > 0) HAGA
        C ← C + 1
        NUM ← [| NUM / 10 |]
    F_MQ
    digitos ← C
FIN_FUNCION

INICIO
    LEA N
    ESCRIBA N, "tiene", digitos(N), "digitos"
FIN`,
      entradas: [40275]
    },
    {
      id: 'pf-02', grupo: 'Funciones', n: 2, corte: 3, dificultad: 'baja',
      fuente: 'Manual §1.2.6, funciones 2',
      enunciado: 'Sean dos vectores A y B, halle el mayor elemento de A y de B.',
      estructura: ['cabecera-fun', 'maximo'],
      pista: 'Es el ejemplo 1 de §1.2.5: una sola función sirve para los dos vectores.',
      solucion: `SUBRUTINA leavector (TAM, VEC)
    PARA I = 1, TAM, 1 HAGA
        LEA VEC(I)
    F-PARA
FIN_SUBRUTINA

FUNCION mayor (TAM, VEC)
    MAY ← VEC(1)
    PARA I = 2, TAM, 1 HAGA
        SI (VEC(I) > MAY) ENTONCES
            MAY ← VEC(I)
        F-SI
    F-PARA
    mayor ← MAY
FIN_FUNCION

INICIO
    LEA N, M
    EJECUTE leavector(N, A)
    EJECUTE leavector(M, B)
    ESCRIBA "Mayor de A:", mayor(N, A)
    ESCRIBA "Mayor de B:", mayor(M, B)
FIN`,
      entradas: [3, 4, 5, 12, 7, 20, 3, 8, 15]
    },
    {
      id: 'pf-03', grupo: 'Funciones', n: 3, corte: 3, dificultad: 'media',
      fuente: 'Manual §1.2.6, funciones 3',
      enunciado: 'Sea un número cualquiera, la función debe arrojar como resultado 0 si es primo y 1 si no lo es.',
      estructura: ['cabecera-fun', 'contador'],
      pista: 'Ojo con la convención invertida: 0 = primo, 1 = no primo. El manual la pide así.',
      solucion: `FUNCION noPrimo (NUM)
    CONT ← 0
    PARA K = 1, NUM, 1 HAGA
        SI (NUM MOD K = 0) ENTONCES
            CONT ← CONT + 1
        F-SI
    F-PARA
    SI (CONT = 2) ENTONCES
        noPrimo ← 0
    SINO
        noPrimo ← 1
    F-SI
FIN_FUNCION

INICIO
    LEA N
    SI (noPrimo(N) = 0) ENTONCES
        ESCRIBA N, "es primo"
    SINO
        ESCRIBA N, "no es primo"
    F-SI
FIN`,
      entradas: [17]
    },
    {
      id: 'pf-04', grupo: 'Funciones', n: 4, corte: 3, dificultad: 'media',
      fuente: 'Manual §1.2.6, funciones 4',
      enunciado: 'Sean dos números enteros, haga un algoritmo que determine cuál es el máximo común divisor entre ambos.',
      estructura: ['cabecera-fun'],
      pista: 'Euclides: mientras el residuo no sea 0, se sustituye el par por (menor, residuo).',
      solucion: `FUNCION mcd (M, N)
    MQ (N <> 0) HAGA
        R ← M MOD N
        M ← N
        N ← R
    F_MQ
    mcd ← M
FIN_FUNCION

INICIO
    LEA A, B
    ESCRIBA "MCD de", A, "y", B, "es", mcd(A, B)
FIN`,
      entradas: [48, 18]
    },
    {
      id: 'pf-05', grupo: 'Funciones', n: 5, corte: 3, dificultad: 'media',
      fuente: 'Manual §1.2.6, funciones 5',
      enunciado: 'Encuentre cuántos factores primos tiene un número A dado.',
      estructura: ['cabecera-fun', 'contador'],
      solucion: `FUNCION esPrimo (NUM)
    CONT ← 0
    PARA K = 1, NUM, 1 HAGA
        SI (NUM MOD K = 0) ENTONCES
            CONT ← CONT + 1
        F-SI
    F-PARA
    SI (CONT = 2) ENTONCES
        esPrimo ← 1
    SINO
        esPrimo ← 0
    F-SI
FIN_FUNCION

FUNCION cuantosFactores (A)
    C ← 0
    PARA K = 2, A, 1 HAGA
        SI (A MOD K = 0) ENTONCES
            SI (esPrimo(K) = 1) ENTONCES
                C ← C + 1
            F-SI
        F-SI
    F-PARA
    cuantosFactores ← C
FIN_FUNCION

INICIO
    LEA A
    ESCRIBA A, "tiene", cuantosFactores(A), "factores primos distintos"
FIN`,
      entradas: [360]
    },
    {
      id: 'pf-06', grupo: 'Funciones', n: 6, corte: 1, dificultad: 'media',
      fuente: 'Manual §1.2.6, funciones 6',
      enunciado: 'Dado un vector A de n elementos, utilice una función que despliegue 0 si está ordenado ascendentemente, 1 si está desordenado y 2 si está ordenado descendentemente.',
      estructura: ['bandera', 'recorrido'],
      solucion: `FUNCION comoEsta (N, V)
    ASC ← 1
    DES ← 1
    PARA I = 1, N-1, 1 HAGA
        SI (V(I) > V(I+1)) ENTONCES
            ASC ← 0
        F-SI
        SI (V(I) < V(I+1)) ENTONCES
            DES ← 0
        F-SI
    F-PARA
    SI (ASC = 1) ENTONCES
        comoEsta ← 0
    SINO
        SI (DES = 1) ENTONCES
            comoEsta ← 2
        SINO
            comoEsta ← 1
        F-SI
    F-SI
FIN_FUNCION

INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    R ← comoEsta(N, V)
    SI (R = 0) ENTONCES
        ESCRIBA "Ordenado ascendentemente"
    SINO
        SI (R = 2) ENTONCES
            ESCRIBA "Ordenado descendentemente"
        SINO
            ESCRIBA "Desordenado"
        F-SI
    F-SI
FIN`,
      entradas: [5, 20, 16, 12, 7, 3]
    },
    {
      id: 'pf-07', grupo: 'Funciones', n: 7, corte: 1, dificultad: 'alta',
      fuente: 'Manual §1.2.6, funciones 7',
      enunciado: 'Dada una matriz A cuadrada de tamaño N x M, encuentre el determinante de esa matriz.',
      estructura: ['doble-ciclo', 'caso-base'],
      pista: 'Para N > 3 sale casi solo por recursión sobre menores. Para N = 2 y N = 3 valen las fórmulas directas.'
    },
    {
      id: 'pf-08', grupo: 'Funciones', n: 8, corte: 3, dificultad: 'media',
      fuente: 'Manual §1.2.6, funciones 8',
      enunciado: 'Utilice una función para verificar si un número cualquiera pertenece a la serie de Fibonacci o no.',
      estructura: ['cabecera-fun', 'bandera'],
      solucion: `FUNCION esFibonacci (X)
    A ← 1
    B ← 1
    SW ← 0
    SI (X = 1) ENTONCES
        SW ← 1
    F-SI
    MQ ((B < X) y (SW = 0)) HAGA
        C ← A + B
        A ← B
        B ← C
        SI (B = X) ENTONCES
            SW ← 1
        F-SI
    F_MQ
    esFibonacci ← SW
FIN_FUNCION

INICIO
    LEA N
    SI (esFibonacci(N) = 1) ENTONCES
        ESCRIBA N, "pertenece a Fibonacci"
    SINO
        ESCRIBA N, "no pertenece"
    F-SI
FIN`,
      entradas: [21]
    },

    /* ================= §1.2.6 · MISCELÁNEA ================= */
    {
      id: 'pm-01', grupo: 'Miscelánea', n: 1, corte: 1, dificultad: 'baja',
      fuente: 'Manual §1.2.6, misceláneas 1',
      enunciado: 'Dado un vector de N elementos, calcule el número de elementos negativos, positivos y ceros que existen en el vector.',
      estructura: ['contador'],
      solucion: `SUBRUTINA contar (N, V, NEG, POS, CER)
    NEG ← 0
    POS ← 0
    CER ← 0
    PARA I = 1, N, 1 HAGA
        SI (V(I) < 0) ENTONCES
            NEG ← NEG + 1
        SINO
            SI (V(I) > 0) ENTONCES
                POS ← POS + 1
            SINO
                CER ← CER + 1
            F-SI
        F-SI
    F-PARA
FIN_SUBRUTINA

INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    EJECUTE contar(N, V, NG, PS, CR)
    ESCRIBA "Negativos:", NG, "Positivos:", PS, "Ceros:", CR
FIN`,
      entradas: [6, -3, 0, 7, -1, 0, 12]
    },
    {
      id: 'pm-02', grupo: 'Miscelánea', n: 2, corte: 1, dificultad: 'alta',
      fuente: 'Manual §1.2.6, misceláneas 2',
      enunciado: 'Calcule el número de elementos diferentes que se encuentran en un vector de tamaño N.',
      estructura: ['doble-ciclo', 'bandera', 'contador'],
      pista: 'Por cada elemento, mirar si ya apareció antes. Doble ciclo con bandera.',
      solucion: `FUNCION diferentes (N, V)
    C ← 0
    PARA I = 1, N, 1 HAGA
        SW ← 0
        PARA J = 1, I-1, 1 HAGA
            SI (V(J) = V(I)) ENTONCES
                SW ← 1
            F-SI
        F-PARA
        SI (SW = 0) ENTONCES
            C ← C + 1
        F-SI
    F-PARA
    diferentes ← C
FIN_FUNCION

INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    ESCRIBA "Elementos diferentes:", diferentes(N, V)
FIN`,
      entradas: [7, 4, 9, 4, 2, 9, 7, 2]
    },
    {
      id: 'pm-03', grupo: 'Miscelánea', n: 3, corte: 1, dificultad: 'media',
      fuente: 'Manual §1.2.6, misceláneas 3',
      enunciado: 'Invierta los elementos de un vector de tamaño N, intercambiando el primero con el último, el segundo con el penúltimo y así sucesivamente.',
      estructura: ['intercambio', 'recorrido'],
      pista: 'Sólo hay que recorrer hasta la mitad: [| N/2 |].',
      solucion: `SUBRUTINA invertir (N, V)
    M ← [| N / 2 |]
    PARA I = 1, M, 1 HAGA
        T ← V(I)
        V(I) ← V(N - I + 1)
        V(N - I + 1) ← T
    F-PARA
FIN_SUBRUTINA

INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    EJECUTE invertir(N, V)
    PARA I = 1, N, 1 HAGA
        ESCRIBA V(I)
    F-PARA
FIN`,
      entradas: [5, 10, 20, 30, 40, 50]
    },
    {
      id: 'pm-04', grupo: 'Miscelánea', n: 4, corte: 3, dificultad: 'media',
      fuente: 'Manual §1.2.6, misceláneas 4',
      enunciado: 'Sean dos números naturales cualesquiera, muestre por pantalla todos aquellos números perfectos que se encuentren entre ellos.',
      estructura: ['cabecera-fun', 'acumulador'],
      solucion: `FUNCION esPerfecto (NUM)
    S ← 0
    PARA K = 1, NUM - 1, 1 HAGA
        SI (NUM MOD K = 0) ENTONCES
            S ← S + K
        F-SI
    F-PARA
    SI (S = NUM) ENTONCES
        esPerfecto ← 1
    SINO
        esPerfecto ← 0
    F-SI
FIN_FUNCION

INICIO
    LEA A, B
    PARA N = A, B, 1 HAGA
        SI (esPerfecto(N) = 1) ENTONCES
            ESCRIBA N, "es perfecto"
        F-SI
    F-PARA
FIN`,
      entradas: [1, 30]
    },
    {
      id: 'pm-05', grupo: 'Miscelánea', n: 5, corte: 1, dificultad: 'alta',
      fuente: 'Manual §1.2.6, misceláneas 5',
      enunciado: 'Desarrolle un algoritmo que elimine de un vector dado de N elementos aquellos números primos que se encuentren repetidos, de tal forma que de cada uno de ellos sólo exista uno.',
      estructura: ['doble-ciclo', 'bandera', 'desplazamiento'],
      pista: 'Construir un vector nuevo es más limpio que borrar sobre el mismo: se recorre y sólo se copia lo que no esté ya.'
    },
    {
      id: 'pm-06', grupo: 'Miscelánea', n: 6, corte: 1, dificultad: 'alta',
      fuente: 'Manual §1.2.6, misceláneas 6',
      enunciado: 'Dadas dos matrices A y B de tamaño NA x MA y NB x MB, realice un algoritmo con su respectiva subrutina para la multiplicación de A*B, en caso de que se pueda. Nota: para poder multiplicar A con B, el número de columnas de A debe ser igual al número de filas de B.',
      estructura: ['validacion', 'doble-ciclo', 'acumulador'],
      solucion: `SUBRUTINA multiplicar (NA, MA, MB, A, B, C)
    PARA I = 1, NA, 1 HAGA
        PARA J = 1, MB, 1 HAGA
            S ← 0
            PARA K = 1, MA, 1 HAGA
                S ← S + A(I,K) * B(K,J)
            F-PARA
            C(I,J) ← S
        F-PARA
    F-PARA
FIN_SUBRUTINA

INICIO
    LEA NA, MA, NB, MB
    PARA I = 1, NA, 1 HAGA
        PARA J = 1, MA, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    PARA I = 1, NB, 1 HAGA
        PARA J = 1, MB, 1 HAGA
            LEA B(I,J)
        F-PARA
    F-PARA
    SI (MA = NB) ENTONCES
        EJECUTE multiplicar(NA, MA, MB, A, B, C)
        PARA I = 1, NA, 1 HAGA
            PARA J = 1, MB, 1 HAGA
                ESCRIBA C(I,J)
            F-PARA
        F-PARA
    SINO
        ESCRIBA "No se pueden multiplicar"
    F-SI
FIN`,
      entradas: [2, 2, 2, 2, 1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      id: 'pm-07', grupo: 'Miscelánea', n: 7, corte: 1, dificultad: 'alta',
      fuente: 'Manual §1.2.6, misceláneas 7',
      enunciado: 'Sean A, B y C matrices cuadradas de N x N. Si los elementos de la diagonal principal de A coinciden con los elementos de la diagonal secundaria de B, encuentre A*(B+C); si no, entonces halle (A−C)*B.',
      estructura: ['diagonales', 'bandera', 'doble-ciclo'],
      pista: 'La comparación es elemento a elemento: A(I,I) contra B(I, N−I+1).'
    },
    {
      id: 'pm-08', grupo: 'Miscelánea', n: 8, corte: 3, dificultad: 'alta',
      fuente: 'Manual §1.2.6, misceláneas 8',
      enunciado: 'Sean dos números N1 y N2 en bases B1 y B2 respectivamente. Halle la suma de ellos: a) en la base B1 y b) en la base B2. Suponga que las bases son menores o iguales a 10.',
      estructura: ['cabecera-fun', 'acumulador'],
      pista: 'Pasar los dos a base 10, sumar, y convertir el resultado a cada base. Reutiliza las funciones del ejercicio 1 de subrutinas.'
    },
    {
      id: 'pm-09', grupo: 'Miscelánea', n: 9, corte: 1, dificultad: 'alta',
      fuente: 'Manual §1.2.6, misceláneas 9',
      enunciado: 'Cada alumno del Departamento de Sistemas posee las calificaciones correspondientes a siete asignaturas guardadas en una matriz de N x 8, donde la primera columna contiene el código de cada estudiante y las otras siete poseen las notas de cada materia. Diseñe un algoritmo que permita obtener: a) la nota definitiva de cada alumno, b) el número de asignaturas perdidas por cada alumno, c) el código del estudiante que obtuvo la mayor nota definitiva, d) el número de estudiantes que perdió más de tres materias y e) el promedio general de todos los alumnos.',
      estructura: ['doble-ciclo', 'acumulador', 'contador', 'maximo'],
      solucion: `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        PARA J = 1, 8, 1 HAGA
            LEA M(I,J)
        F-PARA
    F-PARA
    MEJOR ← 0
    MAYDEF ← 0
    MASDE3 ← 0
    TOTAL ← 0
    PARA I = 1, N, 1 HAGA
        S ← 0
        PERD ← 0
        PARA J = 2, 8, 1 HAGA
            S ← S + M(I,J)
            SI (M(I,J) < 3) ENTONCES
                PERD ← PERD + 1
            F-SI
        F-PARA
        DEF ← S / 7
        TOTAL ← TOTAL + DEF
        ESCRIBA "Codigo", M(I,1), "definitiva", DEF, "perdidas", PERD
        SI (DEF > MAYDEF) ENTONCES
            MAYDEF ← DEF
            MEJOR ← M(I,1)
        F-SI
        SI (PERD > 3) ENTONCES
            MASDE3 ← MASDE3 + 1
        F-SI
    F-PARA
    ESCRIBA "Mejor definitiva:", MEJOR, "con", MAYDEF
    ESCRIBA "Perdieron mas de tres materias:", MASDE3
    ESCRIBA "Promedio general:", TOTAL / N
FIN`,
      entradas: [2, 101, 4, 3, 5, 2, 4, 3, 5, 102, 1, 2, 1, 2, 5, 4, 3]
    },

    /* ================= §2.3 · CADENAS ================= */
    {
      id: 'pc-01', grupo: 'Cadenas', n: 1, corte: 2, dificultad: 'baja',
      fuente: 'Manual §2.3, cadenas 1',
      enunciado: 'Dada una cadena A, haga un algoritmo que diga cuántas vocales tiene.',
      estructura: ['recorrer-cadena', 'contador'],
      solucion: `FUNCION esVocal (D)
    SW ← 0
    SI (D = 'a') ENTONCES
        SW ← 1
    F-SI
    SI (D = 'e') ENTONCES
        SW ← 1
    F-SI
    SI (D = 'i') ENTONCES
        SW ← 1
    F-SI
    SI (D = 'o') ENTONCES
        SW ← 1
    F-SI
    SI (D = 'u') ENTONCES
        SW ← 1
    F-SI
    esVocal ← SW
FIN_FUNCION

INICIO
    LEA A
    L ← LONG(A)
    C ← 0
    PARA I = 1, L, 1 HAGA
        D ← SUBSTR(A, I, 1)
        SI (esVocal(D) = 1) ENTONCES
            C ← C + 1
        F-SI
    F-PARA
    ESCRIBA "Vocales:", C
FIN`,
      entradas: ['algoritmia y programacion']
    },
    {
      id: 'pc-02', grupo: 'Cadenas', n: 2, corte: 2, dificultad: 'alta',
      fuente: 'Manual §2.3, cadenas 2',
      enunciado: 'Sea un número que se encuentra en base 10, haga un procedimiento para convertirlo a base 16.',
      estructura: ['acumulador', 'construir'],
      pista: 'Por encima de 9 los dígitos son letras: ahí es donde hacen falta las cadenas.',
      solucion: `FUNCION digito16 (D)
    SI (D < 10) ENTONCES
        digito16 ← STR(D)
    SINO
        SI (D = 10) ENTONCES
            digito16 ← 'A'
        SINO
            SI (D = 11) ENTONCES
                digito16 ← 'B'
            SINO
                SI (D = 12) ENTONCES
                    digito16 ← 'C'
                SINO
                    SI (D = 13) ENTONCES
                        digito16 ← 'D'
                    SINO
                        SI (D = 14) ENTONCES
                            digito16 ← 'E'
                        SINO
                            digito16 ← 'F'
                        F-SI
                    F-SI
                F-SI
            F-SI
        F-SI
    F-SI
FIN_FUNCION

INICIO
    LEA NUM
    R ← ''
    MQ (NUM > 0) HAGA
        D ← NUM MOD 16
        R ← digito16(D) || R
        NUM ← [| NUM / 16 |]
    F_MQ
    ESCRIBA "En base 16:", R
FIN`,
      entradas: [48879]
    },
    {
      id: 'pc-03', grupo: 'Cadenas', n: 3, corte: 2, dificultad: 'alta',
      fuente: 'Manual §2.3, cadenas 3',
      enunciado: 'Sea un número que está en base 16, páselo a una base cualquiera N, donde N ≤ 10.',
      estructura: ['recorrer-cadena', 'acumulador'],
      pista: 'Primero de base 16 a base 10 recorriendo la cadena de derecha a izquierda, y luego de 10 a N.'
    },
    {
      id: 'pc-04', grupo: 'Cadenas', n: 4, corte: 2, dificultad: 'baja',
      fuente: 'Manual §2.3, cadenas 4',
      enunciado: 'Genere una cadena B a partir de una A existente, con los caracteres de A que se encuentran en posiciones impares.',
      estructura: ['recorrer-cadena', 'construir'],
      solucion: `FUNCION impares (A)
    L ← LONG(A)
    B ← ''
    PARA I = 1, L, 1 HAGA
        SI (I MOD 2 = 1) ENTONCES
            B ← B || SUBSTR(A, I, 1)
        F-SI
    F-PARA
    impares ← B
FIN_FUNCION

INICIO
    LEA A
    ESCRIBA "Original:", A
    ESCRIBA "Impares:", impares(A)
FIN`,
      entradas: ['abcdefghij']
    },
    {
      id: 'pc-05', grupo: 'Cadenas', n: 5, corte: 2, dificultad: 'baja',
      fuente: 'Manual §2.3, cadenas 5',
      enunciado: 'Utilice una función para invertir una cadena.',
      estructura: ['construir', 'recorrer-cadena'],
      solucion: `FUNCION invertir (C)
    L ← LONG(C)
    C2 ← ''
    PARA I = L, 1, -1 HAGA
        C2 ← C2 || SUBSTR(C, I, 1)
    F-PARA
    invertir ← C2
FIN_FUNCION

INICIO
    LEA A
    ESCRIBA invertir(A)
FIN`,
      entradas: ['uninorte']
    },
    {
      id: 'pc-06', grupo: 'Cadenas', n: 6, corte: 2, dificultad: 'media',
      fuente: 'Manual §2.3, cadenas 6',
      enunciado: 'Escriba un algoritmo que lea una cadena de caracteres y determine cuántas vocales la conforman. Además, si alguna de ellas se repite, cuente el número de veces que se encuentre en dicha palabra.',
      estructura: ['recorrer-cadena', 'contador', 'doble-ciclo'],
      solucion: `INICIO
    LEA A
    L ← LONG(A)
    VOC ← 'aeiou'
    TOTAL ← 0
    PARA K = 1, 5, 1 HAGA
        V ← SUBSTR(VOC, K, 1)
        C ← 0
        PARA I = 1, L, 1 HAGA
            SI (SUBSTR(A, I, 1) = V) ENTONCES
                C ← C + 1
            F-SI
        F-PARA
        TOTAL ← TOTAL + C
        SI (C > 0) ENTONCES
            ESCRIBA "La vocal", V, "aparece", C, "veces"
        F-SI
    F-PARA
    ESCRIBA "Total de vocales:", TOTAL
FIN`,
      entradas: ['murcielago']
    },
    {
      id: 'pc-07', grupo: 'Cadenas', n: 7, corte: 2, dificultad: 'media',
      fuente: 'Manual §2.3, cadenas 7',
      enunciado: 'Diseñe un algoritmo que lea dos palabras y las compare carácter por carácter, con el fin de determinar el orden alfabético de las palabras.',
      estructura: ['recorrer-cadena', 'bandera'],
      solucion: `INICIO
    LEA P1, P2
    L1 ← LONG(P1)
    L2 ← LONG(P2)
    L ← L1
    SI (L2 < L1) ENTONCES
        L ← L2
    F-SI
    I ← 1
    R ← 0
    MQ ((I <= L) y (R = 0)) HAGA
        C1 ← SUBSTR(P1, I, 1)
        C2 ← SUBSTR(P2, I, 1)
        SI (C1 < C2) ENTONCES
            R ← 1
        F-SI
        SI (C1 > C2) ENTONCES
            R ← 2
        F-SI
        I ← I + 1
    F_MQ
    SI (R = 1) ENTONCES
        ESCRIBA P1, "va antes que", P2
    SINO
        SI (R = 2) ENTONCES
            ESCRIBA P2, "va antes que", P1
        SINO
            ESCRIBA "Comparten prefijo; decide la mas corta"
        F-SI
    F-SI
FIN`,
      entradas: ['casa', 'carro']
    },
    {
      id: 'pc-08', grupo: 'Cadenas', n: 8, corte: 2, dificultad: 'alta',
      fuente: 'Manual §2.3, cadenas 8',
      enunciado: 'Haga un algoritmo que determine si dentro de un texto se encuentra un valor numérico real.',
      estructura: ['recorrer-cadena', 'bandera'],
      pista: 'Un real es una tira de dígitos que puede llevar un punto en medio. Hay que recorrer marcando el estado.'
    },
    {
      id: 'pc-09', grupo: 'Cadenas', n: 9, corte: 2, dificultad: 'alta',
      fuente: 'Manual §2.3, cadenas 9',
      enunciado: 'Dada una matriz de N x M, verifique si una cadena de caracteres se encuentra en ella.',
      estructura: ['doble-ciclo', 'ventana', 'contador'],
      pista: 'Éste es literalmente el punto 2 del preparcial. Doble ciclo + ventana deslizante, informando [i, j].',
      destacado: 'Cayó en el Preparcial 2 tal cual.',
      solucion: `FUNCION contiene (GRANDE, BUSCADA)
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
    ENC ← 0
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            SI (contiene(MAT(I,J), ST1) > 0) ENTONCES
                ESCRIBA "Cadena encontrada y esta dentro de la cadena:", MAT(I,J)
                ESCRIBA "ubicada en la posicion:", I, J
                ENC ← ENC + 1
            F-SI
        F-PARA
    F-PARA
    SI (ENC = 0) ENTONCES
        ESCRIBA "No se encontro"
    F-SI
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
      }
    },

    /* ================= §3.2 · RECURSIVIDAD ================= */
    {
      id: 'pr-01', grupo: 'Recursividad', n: 1, corte: 4, dificultad: 'alta',
      fuente: 'Manual §3.2, recursividad 1',
      enunciado: 'Se dice que dos números son amigos si cada uno de ellos es igual a la suma de los divisores del otro. Ejemplo: 284 → 1+2+4+71+142 da 220, y 220 → 1+2+4+5+10+11+20+44+55+110 da 284. Utilice sólo funciones recursivas para resolver este problema.',
      estructura: ['caso-base', 'acumulador'],
      solucion: `FUNCION sumaDiv (NUM, K)
    SI (K >= NUM) ENTONCES
        sumaDiv ← 0
    SINO
        SI (NUM MOD K = 0) ENTONCES
            sumaDiv ← K + sumaDiv(NUM, K + 1)
        SINO
            sumaDiv ← sumaDiv(NUM, K + 1)
        F-SI
    F-SI
FIN_FUNCION

INICIO
    LEA A, B
    SA ← sumaDiv(A, 1)
    SB ← sumaDiv(B, 1)
    ESCRIBA "Divisores de", A, "suman", SA
    ESCRIBA "Divisores de", B, "suman", SB
    SI ((SA = B) y (SB = A)) ENTONCES
        ESCRIBA "Son amigos"
    SINO
        ESCRIBA "No son amigos"
    F-SI
FIN`,
      entradas: [220, 284]
    },
    {
      id: 'pr-02', grupo: 'Recursividad', n: 2, corte: 4, dificultad: 'alta',
      fuente: 'Manual §3.2, recursividad 2',
      enunciado: 'Sean tres matrices A, B y C del mismo tamaño N y cuadradas. Encuentre la suma de todos los elementos de A y la multiplicación de todos los elementos de B. Si el total de A es mayor que el total de B, entonces halle D = A*B − C; si no, D = (B+C)*A. Use por lo menos una función o una subrutina.',
      estructura: ['descomponer', 'doble-ciclo'],
      pista: 'Cuatro procedimientos: sumar todo, multiplicar todo, multiplicar matrices y sumar/restar matrices.'
    },
    {
      id: 'pr-03', grupo: 'Recursividad', n: 3, corte: 4, dificultad: 'alta',
      fuente: 'Manual §3.2, recursividad 3',
      enunciado: 'Sea una matriz A de N x M, encuentre la transpuesta de la matriz aunque ésta no sea cuadrada.',
      estructura: ['caso-base', 'doble-ciclo'],
      solucion: `SUBRUTINA transponer (I, J, N, M, A, B)
    SI (I <= N) ENTONCES
        SI (J <= M) ENTONCES
            B(J, I) ← A(I, J)
            EJECUTE transponer(I, J + 1, N, M, A, B)
        SINO
            EJECUTE transponer(I + 1, 1, N, M, A, B)
        F-SI
    F-SI
FIN_SUBRUTINA

INICIO
    LEA N, M
    PARA I = 1, N, 1 HAGA
        PARA J = 1, M, 1 HAGA
            LEA A(I,J)
        F-PARA
    F-PARA
    EJECUTE transponer(1, 1, N, M, A, B)
    PARA I = 1, M, 1 HAGA
        PARA J = 1, N, 1 HAGA
            ESCRIBA B(I,J)
        F-PARA
    F-PARA
FIN`,
      entradas: [2, 3, 1, 2, 3, 4, 5, 6]
    },
    {
      id: 'pr-04', grupo: 'Recursividad', n: 4, corte: 4, dificultad: 'media',
      fuente: 'Manual §3.2, recursividad 4',
      enunciado: 'Sea una cadena de caracteres A, diga cuántas vocales tiene la cadena. De forma recursiva.',
      estructura: ['caso-base', 'recorrer-cadena'],
      solucion: `FUNCION esVocal (D)
    SW ← 0
    SI (D = 'a') ENTONCES
        SW ← 1
    F-SI
    SI (D = 'e') ENTONCES
        SW ← 1
    F-SI
    SI (D = 'i') ENTONCES
        SW ← 1
    F-SI
    SI (D = 'o') ENTONCES
        SW ← 1
    F-SI
    SI (D = 'u') ENTONCES
        SW ← 1
    F-SI
    esVocal ← SW
FIN_FUNCION

FUNCION vocales (A, I)
    SI (I > LONG(A)) ENTONCES
        vocales ← 0
    SINO
        vocales ← esVocal(SUBSTR(A, I, 1)) + vocales(A, I + 1)
    F-SI
FIN_FUNCION

INICIO
    LEA A
    ESCRIBA "Vocales:", vocales(A, 1)
FIN`,
      entradas: ['recursividad']
    },
    {
      id: 'pr-05', grupo: 'Recursividad', n: 5, corte: 4, dificultad: 'alta',
      fuente: 'Manual §3.2, recursividad 5',
      enunciado: 'Sea una matriz A cuadrada de N elementos, halle en forma recursiva A elevado a K, donde A^K = A·A·A…A, K veces.',
      estructura: ['caso-base', 'doble-ciclo'],
      pista: 'El caso base es K = 1 (la matriz misma). El recursivo multiplica A por A^(K−1).'
    },
    {
      id: 'pr-06', grupo: 'Recursividad', n: 6, corte: 4, dificultad: 'alta',
      fuente: 'Manual §3.2, recursividad 6',
      enunciado: 'Diga cuántos y cuáles números de tres cifras (100 a 999) no tienen dígitos repetidos. No utilice cadenas de caracteres. Use por lo menos una función y una subrutina.',
      estructura: ['caso-base', 'contador'],
      solucion: `FUNCION sinRepetir (NUM)
    C ← NUM MOD 10
    D ← [| NUM / 10 |] MOD 10
    U ← [| NUM / 100 |]
    SW ← 1
    SI (C = D) ENTONCES
        SW ← 0
    F-SI
    SI (C = U) ENTONCES
        SW ← 0
    F-SI
    SI (D = U) ENTONCES
        SW ← 0
    F-SI
    sinRepetir ← SW
FIN_FUNCION

SUBRUTINA recorrer (N, TOPE, C)
    SI (N <= TOPE) ENTONCES
        SI (sinRepetir(N) = 1) ENTONCES
            C ← C + 1
        F-SI
        EJECUTE recorrer(N + 1, TOPE, C)
    F-SI
FIN_SUBRUTINA

INICIO
    C ← 0
    EJECUTE recorrer(100, 130, C)
    ESCRIBA "Entre 100 y 130 sin digitos repetidos:", C
FIN`,
      entradas: []
    },
    {
      id: 'pr-07', grupo: 'Recursividad', n: 7, corte: 4, dificultad: 'alta',
      fuente: 'Manual §3.2, recursividad 7',
      enunciado: "Supongamos que tenemos una cadena de caracteres, la cual puede ser bastante grande. Diga cuántas palabras de la cadena se escriben igual en orden inverso. Ejemplo: A = 'xhs adr ala zsx dddees adadad xxxx' tiene dos palabras, 'xxxx' y 'ala'.",
      estructura: ['recorrer-cadena', 'construir', 'bandera'],
      solucion: `FUNCION invertir (C)
    L ← LONG(C)
    R ← ''
    PARA I = L, 1, -1 HAGA
        R ← R || SUBSTR(C, I, 1)
    F-PARA
    invertir ← R
FIN_FUNCION

INICIO
    LEA A
    L ← LONG(A)
    PAL ← ''
    C ← 0
    PARA I = 1, L, 1 HAGA
        D ← SUBSTR(A, I, 1)
        SI (D = ' ') ENTONCES
            SI (LONG(PAL) > 1) ENTONCES
                SI (invertir(PAL) = PAL) ENTONCES
                    C ← C + 1
                    ESCRIBA PAL
                F-SI
            F-SI
            PAL ← ''
        SINO
            PAL ← PAL || D
        F-SI
    F-PARA
    SI (LONG(PAL) > 1) ENTONCES
        SI (invertir(PAL) = PAL) ENTONCES
            C ← C + 1
            ESCRIBA PAL
        F-SI
    F-SI
    ESCRIBA "Palabras capicua:", C
FIN`,
      entradas: ['xhs adr ala zsx dddees adadad xxxx']
    },
    {
      id: 'pr-08', grupo: 'Recursividad', n: 8, corte: 4, dificultad: 'media',
      fuente: 'Manual §3.2, recursividad 8',
      enunciado: 'El algoritmo de Euclides para el cálculo del máximo común divisor se define así: MCD(M,N) = M si N = 0, y MCD(N, M mod N) si N > 0. Escriba un programa que en forma recursiva calcule MCD(M, N) para M y N ≥ 0.',
      estructura: ['caso-base'],
      solucion: `FUNCION mcd (M, N)
    SI (N = 0) ENTONCES
        mcd ← M
    SINO
        mcd ← mcd(N, M MOD N)
    F-SI
FIN_FUNCION

INICIO
    LEA A, B
    ESCRIBA "MCD:", mcd(A, B)
FIN`,
      entradas: [1071, 462]
    }
  ];
})();
