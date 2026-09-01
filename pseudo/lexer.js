/* ============================================================
   lexer.js — texto → tokens.

   Acepta los DOS dialectos del profesor sin configuración:
     · Libro   INICIO … PARA I = 1, N, 1 HAGA … V(I) … F-PARA … FIN
     · Parcial Inicio … Para i = 1, N, 1 hacer … V[i] … Finpara … Fin

   Decisiones:
   · Palabras clave insensibles a MAYÚSCULAS y a TILDES (FUNCIÓN = funcion).
   · Identificadores insensibles a mayúsculas: el manual escribe `N` en la
     cabecera y `n` en la llamada recursiva del factorial. Se guarda el texto
     original para mostrar y una clave normalizada para buscar.
   · `F-PARA` / `F-SI` / `F-MQ` llevan guion, que en cualquier otro sitio es
     el operador menos. Se reconocen como caso especial tras leer `F`.
   · `[|` y `|]` (parte entera) se prueban antes que `[` y que `||`.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const P = window.AYP.pseudo = window.AYP.pseudo || {};

  /* ---------- normalización ---------- */
  /* Se quitan las tildes pero NO la eñe: TAMAÑO es un identificador real
     del manual y `tamano`/`tamaño` deben ser la misma variable, así que la
     eñe también se pliega. Es consistente porque se aplica siempre. */
  function norm(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ñ/g, 'n');
  }
  P.norm = norm;

  /* ---------- tabla de palabras clave ---------- */
  const KW = {
    inicio: 'INICIO', fin: 'FIN',
    lea: 'LEA', leer: 'LEA', escriba: 'ESCRIBA', escribir: 'ESCRIBA', imprima: 'ESCRIBA',
    para: 'PARA', haga: 'HAGA', hacer: 'HAGA',
    f_para: 'FPARA', fpara: 'FPARA', finpara: 'FPARA', fin_para: 'FPARA',
    mq: 'MQ', mientras: 'MQ', mientrasque: 'MQ',
    f_mq: 'FMQ', fmq: 'FMQ', finmq: 'FMQ', finmientras: 'FMQ', fin_mq: 'FMQ',
    hasta: 'HASTA',
    si: 'SI', entonces: 'ENTONCES', sino: 'SINO',
    f_si: 'FSI', fsi: 'FSI', finsi: 'FSI', fin_si: 'FSI',
    subrutina: 'SUBRUTINA', procedimiento: 'SUBRUTINA',
    fin_subrutina: 'FINSUB', finsubrutina: 'FINSUB', f_subrutina: 'FINSUB',
    funcion: 'FUNCION',
    fin_funcion: 'FINFUN', finfuncion: 'FINFUN', f_funcion: 'FINFUN',
    ejecute: 'EJECUTE', ejecutar: 'EJECUTE', llamar: 'EJECUTE',
    retorna: 'RETORNA', retorne: 'RETORNA', retornar: 'RETORNA', devuelva: 'RETORNA',
    mod: 'MOD',
    true: 'TRUE', verdadero: 'TRUE', false: 'FALSE', falso: 'FALSE'
  };
  P.KW = KW;

  /* ---------- palabras CONTEXTUALES ----------
     No pueden ser palabras clave fijas porque el profesor las usa como
     nombres de variables:
       · `Y` es una variable en el punto 1 del preparcial
         (Entero A[9], B[9], C[9], M[9][9], S, Y, X)
       · `CADENA` es un parámetro en el ejemplo 5 del capítulo 2
         (FUNCION verificar (CADENA))
     Se emiten como identificadores y el parser decide por el contexto. */
  P.LOGICAS = { y: 1, o: 1, no: 1 };
  P.TIPOS = {
    entero: 1, real: 1, cadena: 1, logico: 1,
    caracter: 1, booleano: 1, texto: 1, flotante: 1
  };

  /* ---------- nombres declarados por el usuario ----------
     El manual declara `SUBRUTINA leer(V, T, I)` y `leer` choca con la
     instrucción `Leer` del dialecto Parcial. Se resuelve mirando el
     programa entero antes de parsear: lo que el usuario declara como
     procedimiento gana siempre sobre la palabra clave. */
  P.resolverNombres = function (tokens) {
    const propios = Object.create(null);
    for (let k = 0; k < tokens.length - 1; k++) {
      const t = tokens[k];
      if (t.tipo === 'KW' && (t.valor === 'SUBRUTINA' || t.valor === 'FUNCION')) {
        const n = tokens[k + 1];
        if (n && (n.tipo === 'ID' || n.tipo === 'KW')) propios[norm(n.texto)] = 1;
      }
    }
    if (!Object.keys(propios).length) return tokens;
    tokens.forEach(t => {
      if (t.tipo === 'KW' && propios[norm(t.texto)]) {
        t.tipo = 'ID';
        t.valor = norm(t.texto);
      }
    });
    return tokens;
  };

  /* Operadores, del más largo al más corto: el orden es la desambiguación. */
  const OPS = [
    ['<-', 'ASIG'], ['←', 'ASIG'],
    ['[|', 'PEI'], ['|]', 'PED'],
    ['||', 'CONCAT'],
    ['<>', 'NE'], ['!=', 'NE'],
    ['<=', 'LE'], ['>=', 'GE'],
    ['==', 'EQ'],
    ['<', 'LT'], ['>', 'GT'], ['=', 'EQ'],
    ['+', 'MAS'], ['-', 'MENOS'], ['*', 'POR'], ['/', 'ENTRE'], ['^', 'POT'],
    ['(', 'PAR_A'], [')', 'PAR_C'], ['[', 'COR_A'], [']', 'COR_C'],
    [',', 'COMA'], [';', 'PYC'], [':', 'DOSP']
  ];

  const esLetra = c => /[A-Za-z_À-ɏ]/.test(c);
  const esNum = c => c >= '0' && c <= '9';
  const esIdent = c => esLetra(c) || esNum(c);

  /* ---------- lexer ---------- */
  P.lex = function (src) {
    const tk = [];
    const errores = [];
    let i = 0, linea = 1, col = 1;
    const N = src.length;

    const push = (tipo, valor, l, c, texto) =>
      tk.push({ tipo, valor, linea: l, col: c, texto: texto !== undefined ? texto : String(valor) });

    while (i < N) {
      const c = src[i];

      /* saltos de línea y espacios */
      if (c === '\n') { i++; linea++; col = 1; continue; }
      if (c === ' ' || c === '\t' || c === '\r') { i++; col++; continue; }

      /* comentarios: // …  ·  { … }  ·  /* … *\/ */
      if (c === '/' && src[i + 1] === '/') {
        while (i < N && src[i] !== '\n') i++;
        continue;
      }
      if (c === '{') {
        while (i < N && src[i] !== '}') { if (src[i] === '\n') { linea++; col = 1; } i++; }
        i++; continue;
      }
      if (c === '/' && src[i + 1] === '*') {
        i += 2;
        while (i < N && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') { linea++; col = 1; } i++; }
        i += 2; continue;
      }

      const l0 = linea, c0 = col;

      /* números */
      if (esNum(c)) {
        let j = i;
        while (j < N && esNum(src[j])) j++;
        if (src[j] === '.' && esNum(src[j + 1])) { j++; while (j < N && esNum(src[j])) j++; }
        const t = src.slice(i, j);
        push('NUM', parseFloat(t), l0, c0, t);
        col += j - i; i = j; continue;
      }

      /* cadenas: comilla simple (manual) o doble (ESCRIBA) */
      if (c === "'" || c === '"') {
        const cierre = c;
        let j = i + 1, val = '';
        while (j < N && src[j] !== cierre) {
          if (src[j] === '\n') { errores.push({ linea: l0, col: c0, mensaje: 'Cadena sin cerrar.' }); break; }
          val += src[j]; j++;
        }
        push('STR', val, l0, c0, src.slice(i, j + 1));
        col += j + 1 - i; i = j + 1; continue;
      }

      /* identificadores y palabras clave */
      if (esLetra(c)) {
        let j = i;
        while (j < N && esIdent(src[j])) j++;
        let texto = src.slice(i, j);
        let n = norm(texto);

        /* caso especial: F-PARA, F-SI, F-MQ, FIN-SUBRUTINA … */
        if (src[j] === '-' && esLetra(src[j + 1] || '')) {
          let k = j + 1;
          while (k < N && esIdent(src[k])) k++;
          const cand = n + '_' + norm(src.slice(j + 1, k));
          if (KW[cand]) { texto = src.slice(i, k); n = cand; j = k; }
        }
        /* caso especial: FIN SUBRUTINA / FIN FUNCION separados por espacio */
        if ((n === 'fin') && /^[ \t]+/.test(src.slice(j))) {
          const m = /^[ 	]+([A-Za-z_À-ɏ][A-Za-z0-9_À-ɏ]*)/.exec(src.slice(j));
          if (m) {
            const cand = 'fin_' + norm(m[1]);
            if (cand === 'fin_subrutina' || cand === 'fin_funcion') {
              texto = src.slice(i, j + m[0].length); n = cand; j += m[0].length;
            }
          }
        }

        if (KW[n]) push('KW', KW[n], l0, c0, texto);
        else push('ID', n, l0, c0, texto);
        col += j - i; i = j; continue;
      }

      /* operadores */
      let hit = null;
      for (const [s, t] of OPS) {
        if (src.startsWith(s, i)) { hit = [s, t]; break; }
      }
      if (hit) {
        push(hit[1], hit[0], l0, c0, hit[0]);
        i += hit[0].length; col += hit[0].length; continue;
      }

      errores.push({ linea: l0, col: c0, mensaje: 'Carácter que no pertenece al pseudocódigo: «' + c + '».' });
      i++; col++;
    }

    push('EOF', null, linea, col, '');
    return { tokens: tk, errores };
  };
})();
