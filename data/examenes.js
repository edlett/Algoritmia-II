/* ============================================================
   examenes.js — evaluaciones reales del curso, transcritas.
   Es la mejor predicción disponible de lo que va a caer.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.data = AYP.data || {};

  AYP.data.examenes = [
    {
      id: 'preparcial2-202430',
      nombre: 'Preparcial del Segundo Parcial',
      periodo: '202430',
      corte: 'procedimientos',
      total: 5.0,
      duracion: 90,
      nota: 'Tres puntos, todo en pseudocódigo. El profesor escribe aquí en el dialecto Parcial: corchetes, tipos declarados y Retorna.',
      puntos: [
        {
          n: 1, valor: 1.0, tipo: 'Prueba de escritorio',
          enunciado: 'La empresa de seguridad informática "R4_Info" desarrolla un método de seguridad que consiste en la aplicación del algoritmo siguiente para almacenar las contraseñas. Realizar la prueba de escritorio paso a paso en la hoja de respuestas con los datos mostrados y determinar el contenido de la contraseña en el arreglo C.',
          tema: 'pila-llamadas',
          ejemplo: 'e-p-r4info',
          quePide: 'Trazar 8 iteraciones entrando y saliendo de una función en cada vuelta.',
          comoSeFalla: [
            'Olvidar que au es local y se reinicia en cada llamada.',
            'Restar 2 cuando au ≤ 3.',
            'Confundir M[X][Y] con M[Y][X].',
            'Perder el hilo a partir de la cuarta iteración.'
          ]
        },
        {
          n: 2, valor: 2.0, tipo: 'Diseñar una subrutina',
          enunciado: 'Se tiene una matriz M de cadenas de caracteres de tamaño n × m. Escriba una subrutina para indicar si una cadena st1 ocurre dentro de una cadena M[i][j].',
          ejemploDatos: 'Entrada: st1 = "La niña" · Salida: "Cadena encontrada y está dentro de la cadena:" La niña de sus ojos " ubicada en la posición:" [3, 1]',
          tema: 'cadenas-matriz',
          ejemplo: 'e-c-matriz',
          quePide: 'Doble ciclo sobre la matriz + ventana deslizante con SUBSTR dentro de cada casilla, informando coordenadas.',
          comoSeFalla: [
            'Comparar la casilla completa con st1 en vez de buscar dentro de ella.',
            'Informar [j, i] en vez de [i, j].',
            'Recorrer la ventana hasta L1 en vez de hasta L1 − L2 + 1.'
          ],
          nota: 'Es literalmente el ejercicio propuesto §2.3-9 del manual del propio profesor.'
        },
        {
          n: 3, valor: 2.0, tipo: 'Modularizar a escala',
          enunciado: 'En la registraduría necesitan un algoritmo que valide formularios de votación en formato semi-electrónico y saque ciertas estadísticas. El formulario tiene: cédula del votante, número de puesto de votación y número del candidato por el cual votó. Hay N candidatos numerados del 1 al N. El algoritmo recibirá una matriz (asumir que está llena con 100.000 votantes) y, por medio de procedimientos, hará lo siguiente:',
          literales: [
            'a. Validar que una cédula esté correctamente escrita (pueden tener 7, 8 o 10 cifras únicamente) y hacerlo para todas. Decir al final cuántos votantes están errados.',
            'b. Cuál fue el puesto de votación con mayor número de votos (informar el número del puesto y cuántos votos sacó).',
            'c. Dado el número del candidato, mostrar cuántos votos sacó.',
            'd. Número del candidato ganador de las elecciones.'
          ],
          tema: 'pila-llamadas',
          quePide: 'Un procedimiento por literal. Lo que se evalúa es la descomposición y los tipos de parámetro, no el algoritmo de cada parte.',
          comoSeFalla: [
            'Escribir un solo procedimiento gigante que hace de todo.',
            'Declarar como Entrada un parámetro que el procedimiento tiene que llenar.',
            'Validar la cédula con < o > en vez de comprobar longitud exacta de 7, 8 o 10.'
          ]
        }
      ]
    }
  ];
})();
