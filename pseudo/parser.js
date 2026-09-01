/* ============================================================
   parser.js — tokens → AST (descenso recursivo).

   Un solo AST para los dos dialectos. La diferencia entre `V(I)` y `V[i]`
   desaparece aquí: ambos producen el mismo nodo `idx`. La ambigüedad de
   `nombre(args)` — ¿llamada a función o acceso a arreglo? — no se resuelve
   en el parser sino en el intérprete, que sí sabe qué funciones existen.

   Nunca lanza: acumula en `errores` y sigue. Cada error trae `sugerencia`
   cuando corresponde a uno de los veinte fallos frecuentes del curso.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const P = window.AYP.pseudo = window.AYP.pseudo || {};

  P.parse = function (tokens, errLex) {
    let i = 0;
    const errores = (errLex || []).slice();

    const tk = () => tokens[i];
    const tipo = () => tokens[i].tipo;
    const val = () => tokens[i].valor;
    const linea = () => tokens[i].linea;
    const avanzar = () => tokens[i++];

    function err(mensaje, sugerencia, t) {
      const x = t || tk();
      errores.push({ linea: x.linea, col: x.col, mensaje, sugerencia: sugerencia || null });
    }
    function es(tp, v) { return tokens[i].tipo === tp && (v === undefined || tokens[i].valor === v); }
    function esKW(v) { return es('KW', v); }

    /* `y`, `o`, `no` llegan como identificadores porque también son nombres
       de variable del profesor (`Entero … S, Y, X` en el preparcial).

       Se decide por dos señales, y hacen falta las dos:
         · Mismo renglón que lo anterior. En este pseudocódigo cada sentencia
           ocupa una línea, así que una `Y` al principio de un renglón nuevo
           es una variable que empieza una sentencia, no un «y» lógico.
         · No le sigue una flecha de asignación. `Y ← …` es siempre asignar. */
    function esLog(p) {
      const t = tokens[i];
      if (t.tipo !== 'ID' || t.valor !== p) return false;
      const prev = tokens[i - 1];
      if (prev && prev.linea !== t.linea) return false;
      const sig = tokens[i + 1];
      if (sig && (sig.tipo === 'ASIG' || sig.tipo === 'EQ')) return false;
      return true;
    }

    /* Lo mismo con los tipos: `Entero X` declara, pero `CADENA` a secas es
       una variable. Sólo hay declaración si al tipo le sigue un nombre. */
    function esTipo() {
      return tokens[i].tipo === 'ID' && P.TIPOS[tokens[i].valor] &&
        tokens[i + 1] && tokens[i + 1].tipo === 'ID';
    }
    function comer(tp, v, mensaje, sugerencia) {
      if (es(tp, v)) return avanzar();
      err(mensaje || ('Falta «' + (v || tp) + '».'), sugerencia);
      return null;
    }
    /* Salta hasta un token de sincronización para poder seguir informando. */
    function recuperar(stops) {
      while (!es('EOF')) {
        if (tipo() === 'KW' && stops.indexOf(val()) >= 0) return;
        avanzar();
      }
    }

    /* ---------------- expresiones ---------------- */

    function expr() { return exprO(); }

    function exprO() {
      let n = exprY();
      while (esLog('o')) { const l = linea(); avanzar(); n = { t: 'bin', op: 'o', a: n, b: exprY(), linea: l }; }
      return n;
    }
    function exprY() {
      let n = exprNo();
      while (esLog('y')) { const l = linea(); avanzar(); n = { t: 'bin', op: 'y', a: n, b: exprNo(), linea: l }; }
      return n;
    }
    function exprNo() {
      if (esLog('no') && tokens[i + 1] && ['PAR_A','ID','NUM','KW'].indexOf(tokens[i + 1].tipo) >= 0)
        { const l = linea(); avanzar(); return { t: 'un', op: 'no', a: exprNo(), linea: l }; }
      return exprRel();
    }
    const REL = { EQ: '=', NE: '<>', LT: '<', GT: '>', LE: '<=', GE: '>=' };
    function exprRel() {
      let n = exprCat();
      if (REL[tipo()]) {
        const op = REL[tipo()], l = linea();
        avanzar();
        n = { t: 'bin', op, a: n, b: exprCat(), linea: l };
      }
      return n;
    }
    function exprCat() {
      let n = exprAd();
      while (es('CONCAT')) { const l = linea(); avanzar(); n = { t: 'bin', op: '||', a: n, b: exprAd(), linea: l }; }
      return n;
    }
    function exprAd() {
      let n = exprMul();
      while (es('MAS') || es('MENOS')) {
        const op = tipo() === 'MAS' ? '+' : '-', l = linea();
        avanzar(); n = { t: 'bin', op, a: n, b: exprMul(), linea: l };
      }
      return n;
    }
    function exprMul() {
      let n = exprPot();
      while (es('POR') || es('ENTRE') || esKW('MOD')) {
        const op = tipo() === 'POR' ? '*' : (tipo() === 'ENTRE' ? '/' : 'mod'), l = linea();
        avanzar(); n = { t: 'bin', op, a: n, b: exprPot(), linea: l };
      }
      return n;
    }
    function exprPot() {
      const n = exprUn();
      if (es('POT')) { const l = linea(); avanzar(); return { t: 'bin', op: '^', a: n, b: exprPot(), linea: l }; }
      return n;
    }
    function exprUn() {
      if (es('MENOS')) { const l = linea(); avanzar(); return { t: 'un', op: '-', a: exprUn(), linea: l }; }
      if (es('MAS')) { avanzar(); return exprUn(); }
      return primario();
    }

    function listaArgs(cierre) {
      const args = [];
      if (!es(cierre)) {
        args.push(expr());
        while (es('COMA')) { avanzar(); args.push(expr()); }
      }
      comer(cierre, undefined, 'Falta cerrar el paréntesis de los argumentos.');
      return args;
    }

    function primario() {
      const l = linea();

      if (es('NUM')) { const v = val(); avanzar(); return { t: 'num', v, linea: l }; }
      if (es('STR')) { const v = val(); avanzar(); return { t: 'str', v, linea: l }; }
      if (esKW('TRUE')) { avanzar(); return { t: 'bool', v: true, linea: l }; }
      if (esKW('FALSE')) { avanzar(); return { t: 'bool', v: false, linea: l }; }

      /* parte entera [| x |] */
      if (es('PEI')) {
        avanzar();
        const e = expr();
        comer('PED', undefined, 'Falta cerrar la parte entera con «|]».');
        return { t: 'llam', nombre: 'int', args: [e], linea: l, interna: true };
      }

      if (es('PAR_A')) {
        avanzar();
        const e = expr();
        comer('PAR_C', undefined, 'Falta cerrar el paréntesis.');
        return e;
      }

      if (es('ID')) {
        const nombre = val(), texto = tk().texto;
        avanzar();
        /* nombre(...)  → indeciso: llamada o índice. Lo resuelve el intérprete. */
        if (es('PAR_A')) {
          avanzar();
          const args = listaArgs('PAR_C');
          return { t: 'llam_o_idx', nombre, texto, args, linea: l };
        }
        /* nombre[i][j] → siempre índice */
        if (es('COR_A')) {
          const indices = [];
          while (es('COR_A')) {
            avanzar();
            indices.push(expr());
            comer('COR_C', undefined, 'Falta cerrar el corchete del índice.');
          }
          return { t: 'idx', nombre, texto, indices, linea: l };
        }
        return { t: 'var', nombre, texto, linea: l };
      }

      if (es('ASIG')) {
        err('Aquí se esperaba un valor, no una asignación.',
          'Revisa si sobra una flecha «←».');
        avanzar();
        return { t: 'num', v: 0, linea: l };
      }

      err('No se entiende «' + (tk().texto || tipo()) + '» dentro de una expresión.');
      avanzar();
      return { t: 'num', v: 0, linea: l };
    }

    /* ---------------- destinos (lado izquierdo) ---------------- */

    function lvalue() {
      const l = linea();
      if (!es('ID')) {
        err('Aquí se esperaba el nombre de una variable.');
        avanzar();
        return null;
      }
      const nombre = val(), texto = tk().texto;
      avanzar();
      const indices = [];
      if (es('PAR_A')) {
        avanzar();
        indices.push(expr());
        while (es('COMA')) { avanzar(); indices.push(expr()); }
        comer('PAR_C', undefined, 'Falta cerrar el paréntesis del índice.');
      } else if (es('COR_A')) {
        while (es('COR_A')) {
          avanzar();
          indices.push(expr());
          comer('COR_C', undefined, 'Falta cerrar el corchete del índice.');
        }
      }
      return indices.length
        ? { t: 'idx', nombre, texto, indices, linea: l }
        : { t: 'var', nombre, texto, linea: l };
    }

    /* ---------------- sentencias ---------------- */

    const CIERRES = ['FIN', 'FPARA', 'FMQ', 'FSI', 'SINO', 'FINSUB', 'FINFUN', 'HASTA'];

    function bloque(hasta) {
      const out = [];
      let guard = 0;
      while (!es('EOF') && ++guard < 20000) {
        if (tipo() === 'KW' && hasta.indexOf(val()) >= 0) break;
        const s = sentencia();
        if (s) out.push(s);
      }
      return out;
    }

    function sentencia() {
      const l = linea();

      /* declaración de tipo (dialecto Parcial): Entero A[9], S, X */
      if (esTipo()) {
        const tipoTxt = tk().texto;
        avanzar();
        const vars = [];
        do {
          if (!es('ID')) break;
          const nombre = val(), texto = tk().texto;
          avanzar();
          const dims = [];
          while (es('COR_A') || es('PAR_A')) {
            const cierre = tipo() === 'COR_A' ? 'COR_C' : 'PAR_C';
            avanzar();
            if (!es(cierre)) {
              dims.push(expr());
              while (es('COMA')) { avanzar(); dims.push(expr()); }
            }
            comer(cierre, undefined, 'Falta cerrar la dimensión.');
          }
          vars.push({ nombre, texto, dims });
        } while (es('COMA') && avanzar());
        return { t: 'decl', tipoTxt, vars, linea: l };
      }

      if (esKW('LEA')) {
        avanzar();
        const destinos = [lvalue()];
        while (es('COMA')) { avanzar(); destinos.push(lvalue()); }
        return { t: 'lea', destinos: destinos.filter(Boolean), linea: l };
      }

      if (esKW('ESCRIBA')) {
        avanzar();
        const exprs = [expr()];
        while (es('COMA')) { avanzar(); exprs.push(expr()); }
        return { t: 'escriba', exprs, linea: l };
      }

      if (esKW('SI')) {
        avanzar();
        const cond = expr();
        if (!esKW('ENTONCES')) err('Falta «ENTONCES» después de la condición.', 'La forma es: SI (condición) ENTONCES');
        else avanzar();
        const entonces = bloque(['SINO', 'FSI'].concat(CIERRES));
        let sino = null;
        if (esKW('SINO')) { avanzar(); sino = bloque(['FSI'].concat(CIERRES)); }
        if (esKW('FSI')) avanzar();
        else err('Falta cerrar el condicional con «F-SI».', 'Cada SI abre y cierra: SI … ENTONCES … F-SI');
        return { t: 'si', cond, entonces, sino, linea: l };
      }

      if (esKW('PARA')) {
        avanzar();
        if (!es('ID')) { err('El PARA necesita una variable de control.', 'La forma es: PARA I = 1, N, 1 HAGA'); recuperar(CIERRES); return null; }
        const v = val(), vtexto = tk().texto;
        avanzar();
        if (es('ASIG')) avanzar();
        else if (es('EQ')) avanzar();
        else err('Falta el «=» de la variable de control.', 'La forma es: PARA I = 1, N, 1 HAGA');
        const desde = expr();
        comer('COMA', undefined, 'Falta la coma antes del valor final.', 'El PARA lleva tres partes: PARA I = inicio, fin, paso');
        const hasta = expr();
        let paso = null;
        if (es('COMA')) { avanzar(); paso = expr(); }
        if (esKW('HAGA')) avanzar();
        else err('Falta «HAGA» al final de la cabecera del PARA.', 'La forma es: PARA I = 1, N, 1 HAGA');
        const cuerpo = bloque(['FPARA'].concat(CIERRES));
        if (esKW('FPARA')) avanzar();
        else err('Falta cerrar el ciclo con «F-PARA».');
        return { t: 'para', v, vtexto, desde, hasta, paso, cuerpo, linea: l };
      }

      if (esKW('MQ')) {
        avanzar();
        const cond = expr();
        if (esKW('HAGA')) avanzar();
        const cuerpo = bloque(['FMQ'].concat(CIERRES));
        if (esKW('FMQ')) avanzar();
        else err('Falta cerrar el ciclo con «F_MQ».');
        return { t: 'mq', cond, cuerpo, linea: l };
      }

      if (esKW('HAGA')) {
        avanzar();
        const cuerpo = bloque(['HASTA'].concat(CIERRES));
        if (esKW('HASTA')) avanzar();
        else err('Falta «HASTA» para cerrar el ciclo.');
        const cond = expr();
        return { t: 'hagahasta', cuerpo, cond, linea: l };
      }

      if (esKW('EJECUTE')) {
        avanzar();
        if (!es('ID')) { err('EJECUTE necesita el nombre de una subrutina.'); recuperar(CIERRES); return null; }
        const nombre = val(), texto = tk().texto;
        avanzar();
        let args = [];
        if (es('PAR_A')) { avanzar(); args = listaArgs('PAR_C'); }
        return { t: 'ejecute', nombre, texto, args, linea: l };
      }

      if (esKW('RETORNA')) {
        avanzar();
        const e = es('EOF') || tipo() === 'KW' ? null : expr();
        return { t: 'retorna', expr: e, linea: l };
      }

      /* asignación, o llamada suelta a subrutina sin EJECUTE */
      if (es('ID')) {
        const guardado = i;
        const dest = lvalue();
        if (es('ASIG')) {
          avanzar();
          return { t: 'asig', dest, expr: expr(), linea: l };
        }
        if (es('EQ')) {
          err('Aquí «=» compara, no asigna.', 'La asignación se escribe con la flecha ←  (o <- si no la tienes en el teclado).');
          avanzar();
          return { t: 'asig', dest, expr: expr(), linea: l };
        }
        /* nombre(args) suelto → invocación al estilo del dialecto Parcial */
        i = guardado;
        const nombre = val(), texto = tk().texto;
        avanzar();
        if (es('PAR_A')) {
          avanzar();
          const args = listaArgs('PAR_C');
          return { t: 'ejecute', nombre, texto, args, implicito: true, linea: l };
        }
        err('«' + texto + '» por sí solo no hace nada.', 'Quizá falta la flecha de asignación ← o la palabra EJECUTE.');
        return null;
      }

      err('No se entiende «' + (tk().texto || tipo()) + '» aquí.');
      avanzar();
      return null;
    }

    /* ---------------- declaraciones de nivel superior ---------------- */

    function params() {
      const out = [];
      if (!es('PAR_A')) return out;
      avanzar();
      while (!es('PAR_C') && !es('EOF')) {
        let tipoTxt = null;
        if (esTipo()) { tipoTxt = tk().texto; avanzar(); }
        if (!es('ID')) { avanzar(); continue; }
        const nombre = val(), texto = tk().texto;
        avanzar();
        let esArreglo = false;
        while (es('COR_A') || es('PAR_A')) {
          const cierre = tipo() === 'COR_A' ? 'COR_C' : 'PAR_C';
          esArreglo = true;
          avanzar();
          while (!es(cierre) && !es('EOF')) avanzar();
          comer(cierre);
        }
        out.push({ nombre, texto, tipoTxt, esArreglo });
        if (es('COMA')) avanzar();
      }
      comer('PAR_C', undefined, 'Falta cerrar el paréntesis de los parámetros.');
      return out;
    }

    function procedimiento(clase) {
      const l = linea();
      avanzar();                                  // SUBRUTINA | FUNCION
      if (!es('ID')) { err('Falta el nombre del ' + (clase === 'sub' ? 'la subrutina' : 'la función') + '.'); recuperar(['INICIO', 'SUBRUTINA', 'FUNCION']); return null; }
      const nombre = val(), texto = tk().texto;
      avanzar();
      const ps = params();
      /* Tipo de retorno del dialecto Parcial: `Funcion f(...) entero`.
         Tiene que ir en el MISMO renglón que el paréntesis de cierre; si no,
         se estaría comiendo el `Entero` de la primera declaración del cuerpo. */
      let tipoRet = null;
      if (tk().tipo === 'ID' && P.TIPOS[tk().valor] &&
          tokens[i - 1] && tk().linea === tokens[i - 1].linea) { tipoRet = tk().texto; avanzar(); }
      const cierre = clase === 'sub' ? 'FINSUB' : 'FINFUN';
      const cuerpo = bloque([cierre, 'FIN', 'INICIO', 'SUBRUTINA', 'FUNCION']);
      if (esKW(cierre)) avanzar();
      else if (esKW('FIN')) {
        avanzar();
        if (es('ID')) avanzar();                  // Fin CalculaC
      } else {
        err('Falta cerrar ' + (clase === 'sub' ? 'la subrutina' : 'la función') + ' «' + texto + '».',
          clase === 'sub' ? 'Se cierra con FIN_SUBRUTINA.' : 'Se cierra con FIN_FUNCION.');
      }
      return { t: clase === 'sub' ? 'subrutina' : 'funcion', nombre, texto, params: ps, cuerpo, tipoRet, linea: l };
    }

    /* ---------------- programa ---------------- */

    const subs = {}, funs = {};
    let principal = null;
    let guard = 0;

    while (!es('EOF') && ++guard < 5000) {
      if (esKW('SUBRUTINA')) {
        const p = procedimiento('sub');
        if (p) subs[p.nombre] = p;
      } else if (esKW('FUNCION')) {
        const p = procedimiento('fun');
        if (p) funs[p.nombre] = p;
      } else if (esKW('INICIO')) {
        const l = linea();
        avanzar();
        const cuerpo = bloque(['FIN', 'SUBRUTINA', 'FUNCION']);
        if (esKW('FIN')) avanzar();
        else err('Falta «FIN» al terminar el algoritmo principal.');
        if (principal) err('Sólo puede haber un algoritmo principal.', 'Ya hay un INICIO … FIN más arriba.');
        else principal = { t: 'principal', cuerpo, linea: l };
      } else {
        err('Fuera de INICIO/FIN sólo caben SUBRUTINA y FUNCION.',
          'El algoritmo principal empieza con INICIO y termina con FIN.');
        avanzar();
        recuperar(['INICIO', 'SUBRUTINA', 'FUNCION']);
      }
    }

    if (!principal) {
      err('No hay algoritmo principal.', 'Todo programa necesita un bloque INICIO … FIN.',
        tokens[tokens.length - 1]);
    }

    return { ast: { principal, subs, funs }, errores };
  };

  /* Atajo: texto → programa listo para ejecutar */
  P.compilar = function (fuente) {
    const { tokens, errores } = P.lex(fuente || '');
    P.resolverNombres(tokens);
    const r = P.parse(tokens, errores);
    return { ast: r.ast, errores: r.errores, tokens, fuente: fuente || '' };
  };
})();
