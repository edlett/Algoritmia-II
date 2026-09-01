/* ============================================================
   core.js — metadatos del curso, los 4 cortes y el cronograma.
   Fuente: Syllabus IST 2089, Universidad del Norte, 2026-30.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};

  AYP.data.meta = {
    nombre: 'Algoritmia y Programación II',
    alias: 'AyP II',
    codigo: 'IST 2089',
    prerrequisito: 'IST 2088',
    dependencia: 'Departamento de Ingeniería de Sistemas',
    profesor: 'Daladier Jabba M.',
    nrc: '2034 y 2035',
    periodo: '2026-30',
    creditos: 3,
    inicio: '2026-07-27',
    finClases: '2026-11-20',
    ventanaFinales: ['2026-11-23', '2026-12-02'],
    horas: { clase: 64, semanal: 4, teoria: 2, practica: 2, independiente: 6 },
    /* Horario real del NRC. 0 = domingo … 6 = sábado.
       Es dato del curso, no un ajuste: no se edita desde la interfaz.
       Se usa para calcular la próxima clase y las sesiones de cada semana. */
    horario: [
      { d: 1, ini: '07:00', fin: '09:00' },
      { d: 2, ini: '07:00', fin: '09:00' }
    ],
    escala: 5.0,
    aprueba: 3.0,
    evaluacion: [
      { id: 'parcial1', nombre: 'Parcial 1', pct: 25, semana: 6, tipo: 'parcial', corte: 1, temas: 'Arreglos de datos' },
      { id: 'lab1', nombre: 'Laboratorio 1', pct: 15, semana: 10, tipo: 'laboratorio', corte: 2, temas: 'Arreglos de datos y cadenas de caracteres' },
      { id: 'parcial2', nombre: 'Parcial 2', pct: 20, semana: 12, tipo: 'parcial', corte: 3, temas: 'Cadenas de caracteres, procedimientos' },
      { id: 'lab2', nombre: 'Laboratorio 2', pct: 10, semana: 16, tipo: 'laboratorio', corte: 4, temas: 'Procedimientos y recursividad' },
      { id: 'proyecto', nombre: 'Proyecto', pct: 10, semana: 14, tipo: 'proyecto', corte: 4, temas: 'Procedimientos y recursividad' },
      { id: 'final', nombre: 'Examen Final', pct: 20, semana: 17, tipo: 'final', corte: 4, temas: 'Todos' }
    ],
    aviso: 'Todas las evaluaciones son acumulativas. Los parciales y el final se resuelven en pseudocódigo; los laboratorios y el proyecto se entregan en Java.'
  };

  AYP.data.cortes = [
    {
      id: 'arreglos', num: 1,
      nombre: 'Arreglos',
      titulo: 'Vectores y matrices',
      lead: 'Seis semanas para instalar la estructura de datos sobre la que se apoya todo el resto del semestre. Todo lo que hay en esta ruta —y nada más que esto— entra en el Primer Parcial.',
      unidades: [1, 2], semanas: [1, 6], horas: 20, pct: 25,
      meta: { id: 'parcial1', nombre: 'Parcial 1', pct: 25, ventanaTxt: '31 ago – 4 sep 2026', ventana: ['2026-08-31', '2026-09-04'] },
      alcance: 'Concepto de vectores (lecturas y escrituras); inserción y borrado de elementos; ordenamiento por el método de la Burbuja; recorridos y búsquedas. Concepto de matrices; ordenamiento sobre matrices; transpuesta; suma, resta y multiplicación; recorridos por filas, columnas, diagonales y zig-zag.',
      resumenCorto: 'Vectores, matrices, Burbuja, recorridos y operaciones matriciales.',
      plantilla: [
        { et: 'Prueba de escritorio', desc: 'Trazar un algoritmo sobre vector y matriz paso a paso', tema: 'prueba-escritorio' },
        { et: 'Recorrido con condición', desc: 'Contar, sumar o filtrar según una propiedad', tema: 'patrones-vector' },
        { et: 'Ordenamiento', desc: 'Burbuja completa con intercambio', tema: 'burbuja' },
        { et: 'Operación matricial', desc: 'Transpuesta, suma o multiplicación con validación', tema: 'operaciones-matriz' }
      ],
      checklist: '¿Puedo escribir de memoria los cinco patrones de vector, la Burbuja completa y los cuatro recorridos de matriz, y trazar a mano un algoritmo de ocho iteraciones sin equivocarme?'
    },
    {
      id: 'cadenas', num: 2,
      nombre: 'Cadenas',
      titulo: 'Cadenas de caracteres',
      lead: 'Sólo 4 horas de clase, pero aparece en el Laboratorio 1, en el Parcial 2 y en el Final. Es el tema con la peor relación entre horas de clase y peso en la nota: el que más trabajo independiente exige.',
      unidades: [3], semanas: [7, 10], horas: 4, pct: 15,
      meta: { id: 'lab1', nombre: 'Laboratorio 1', pct: 15, ventanaTxt: 'hasta el 2 oct 2026', ventana: ['2026-09-28', '2026-10-02'] },
      alcance: 'Conceptos básicos de datos alfanuméricos; las siete primitivas del manual (LONG, DER, IZQ, SUBSTR, VAL, STR, concatenación); búsqueda de patrones dentro de cadenas; cadenas dentro de matrices.',
      resumenCorto: 'Las siete primitivas y los problemas de texto que se arman con ellas.',
      plantilla: [
        { et: 'Recorrer una cadena', desc: 'STR → LONG → SUBSTR → VAL, carácter a carácter', tema: 'primitivas' },
        { et: 'Construir una cadena', desc: 'Concatenación dentro de un ciclo', tema: 'construir' },
        { et: 'Buscar una subcadena', desc: 'Ventana deslizante con SUBSTR', tema: 'buscar-subcadena' },
        { et: 'Cadenas en matriz', desc: 'Doble ciclo + búsqueda, con coordenadas', tema: 'cadenas-matriz' }
      ],
      checklist: '¿Puedo usar las siete primitivas sin mirar, y resolver el ejercicio de buscar una frase dentro de una matriz de frases informando la posición [i, j]?'
    },
    {
      id: 'procedimientos', num: 3,
      nombre: 'Procedimientos',
      titulo: 'Subrutinas y funciones',
      lead: 'Dieciocho horas: el bloque más grande del semestre. Aquí no se evalúa el algoritmo sino la descomposición: decidir entre subrutina y función y declarar bien los parámetros.',
      unidades: [4], semanas: [7, 12], horas: 18, pct: 20,
      meta: { id: 'parcial2', nombre: 'Parcial 2', pct: 20, ventanaTxt: '19 – 23 oct 2026', ventana: ['2026-10-19', '2026-10-23'] },
      alcance: 'Programación modular y «divide y vencerás»; declaración e invocación de subrutinas (EJECUTE) y funciones; parámetros de Entrada, Salida y Entrada-Salida; paso por valor y por referencia; variables locales y globales; flujo de llamada y retorno.',
      resumenCorto: 'Modularidad: subrutinas, funciones, parámetros y ámbito.',
      plantilla: [
        { et: 'Prueba de escritorio con función', desc: 'Trazar entrando y saliendo de una función en cada vuelta', tema: 'pila-llamadas' },
        { et: 'Diseñar una subrutina', desc: 'Cadenas sobre matriz, con parámetros bien tipados', tema: 'decidir' },
        { et: 'Modularizar un problema grande', desc: 'Un procedimiento por literal del enunciado', tema: 'descomponer' }
      ],
      checklist: '¿Decido sin dudar entre función y subrutina, sé qué parámetros son E, S o E-S, y puedo trazar una llamada anidada sin perder el hilo?'
    },
    {
      id: 'recursividad', num: 4,
      nombre: 'Recursividad',
      titulo: 'Recursividad y memoria',
      lead: 'Doce horas de recursividad más dos de memoria. Cierra el semestre y concentra tres notas: el Laboratorio 2, el Proyecto y el Examen Final, que es acumulativo de todo.',
      unidades: [5, 6], semanas: [13, 16], horas: 14, pct: 40,
      meta: { id: 'final', nombre: 'Examen Final', pct: 20, ventanaTxt: '23 nov – 2 dic 2026', ventana: ['2026-11-23', '2026-12-02'] },
      metasExtra: [
        { id: 'proyecto', nombre: 'Proyecto', pct: 10, ventanaTxt: '2 – 6 nov 2026' },
        { id: 'lab2', nombre: 'Laboratorio 2', pct: 10, ventanaTxt: 'hasta el 20 nov 2026' }
      ],
      alcance: 'Concepto de recursividad; método de las dos preguntas (caso base y llamador más pequeño); recursividad sobre subrutinas y sobre funciones; conversión iterativo ↔ recursivo. Estructuras estáticas frente a dinámicas en memoria; nociones de Pilas, Colas y Listas.',
      resumenCorto: 'Recursividad con el método de las dos preguntas, y la memoria que la sostiene.',
      plantilla: [
        { et: 'Convertir a recursivo', desc: 'Pasar un algoritmo iterativo a su versión recursiva', tema: 'dos-preguntas' },
        { et: 'Recursividad sobre arreglos', desc: 'Recorrer vector o matriz sin ciclos', tema: 'recursion-arreglos' },
        { et: 'Prueba de escritorio recursiva', desc: 'Seguir la pila hasta el caso base y de vuelta', tema: 'pila-recursiva' },
        { et: 'Teoría de memoria', desc: 'Estático contra dinámico; LIFO y FIFO', tema: 'memoria' }
      ],
      checklist: '¿Aplico el método de las dos preguntas a cualquier algoritmo, sé dibujar la pila de factorial(5) y explico por qué una recursión sin caso base revienta la memoria?'
    }
  ];

  /* ---------- cronograma: 16 semanas ---------- */
  AYP.data.cronograma = [
    { n: 1, ini: '2026-07-27', fin: '2026-07-31', corte: 'arreglos', tema: 'Repaso y concepto de vector', temas: ['vector-anatomia'] },
    { n: 2, ini: '2026-08-03', fin: '2026-08-07', corte: 'arreglos', tema: 'Recorridos, patrones y búsqueda', temas: ['patrones-vector', 'busqueda'] },
    { n: 3, ini: '2026-08-10', fin: '2026-08-14', corte: 'arreglos', tema: 'Inserción, borrado y Burbuja', temas: ['insercion-borrado', 'burbuja'] },
    { n: 4, ini: '2026-08-17', fin: '2026-08-21', corte: 'arreglos', tema: 'Concepto de matriz y ciclos anidados', temas: ['matriz-anatomia', 'recorridos-matriz'] },
    { n: 5, ini: '2026-08-24', fin: '2026-08-28', corte: 'arreglos', tema: 'Operaciones con matrices', temas: ['operaciones-matriz'] },
    { n: 6, ini: '2026-08-31', fin: '2026-09-04', corte: 'arreglos', tema: 'Primer Parcial', hito: 'parcial1' },
    { n: 7, ini: '2026-09-07', fin: '2026-09-11', corte: 'cadenas', tema: 'Cadenas: las siete primitivas', temas: ['primitivas', 'construir'] },
    { n: 8, ini: '2026-09-14', fin: '2026-09-18', corte: 'procedimientos', tema: 'Modularidad y subrutinas', temas: ['modularidad', 'subrutinas'] },
    { n: 9, ini: '2026-09-21', fin: '2026-09-25', corte: 'procedimientos', tema: 'Funciones', temas: ['funciones'] },
    { n: 10, ini: '2026-09-28', fin: '2026-10-02', corte: 'cadenas', tema: 'Cadenas sobre matrices · cierre Laboratorio 1', temas: ['buscar-subcadena', 'cadenas-matriz'], hito: 'lab1' },
    { n: 0, ini: '2026-10-05', fin: '2026-10-09', corte: null, tema: 'Semana Universitaria', pausa: true },
    { n: 11, ini: '2026-10-12', fin: '2026-10-16', corte: 'procedimientos', tema: 'Parámetros, ámbito y pila de llamadas', temas: ['parametros', 'pila-llamadas'] },
    { n: 12, ini: '2026-10-19', fin: '2026-10-23', corte: 'procedimientos', tema: 'Segundo Parcial', hito: 'parcial2' },
    { n: 13, ini: '2026-10-26', fin: '2026-10-30', corte: 'recursividad', tema: 'Recursividad: las dos preguntas', temas: ['dos-preguntas'] },
    { n: 14, ini: '2026-11-02', fin: '2026-11-06', corte: 'recursividad', tema: 'Recursividad sobre arreglos · Proyecto', temas: ['recursion-arreglos'], hito: 'proyecto' },
    { n: 15, ini: '2026-11-09', fin: '2026-11-13', corte: 'recursividad', tema: 'Recursividad avanzada', temas: ['recursion-avanzada'] },
    { n: 16, ini: '2026-11-16', fin: '2026-11-20', corte: 'recursividad', tema: 'Memoria: pilas, colas y listas · cierre Laboratorio 2', temas: ['memoria'], hito: 'lab2' }
  ];
})();
