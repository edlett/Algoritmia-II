/* ============================================================
   fmt.js — AST → texto, en cualquiera de los dos dialectos.

   Es lo que habilita el conmutador «Libro | Parcial»: el mismo algoritmo
   se reescribe al instante en la otra notación. Escribir a mano las dos
   versiones garantizaría que se desincronizaran; generarlas del mismo AST
   garantiza lo contrario.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const P = window.AYP.pseudo = window.AYP.pseudo || {};

  const D = {
    libro: {
      inicio: 'INICIO', fin: 'FIN',
      lea: 'LEA', escriba: 'ESCRIBA',
      para: 'PARA', haga: 'HAGA', fpara: 'F-PARA',
      mq: 'MQ', fmq: 'F_MQ', hasta: 'HASTA',
      si: 'SI', entonces: 'ENTONCES', sino: 'SINO', fsi: 'F-SI',
      sub: 'SUBRUTINA', finsub: 'FIN_SUBRUTINA',
      fun: 'FUNCION', finfun: 'FIN_FUNCION',
      ejecute: 'EJECUTE', mod: 'MOD',
      y: 'y', o: 'o', no: 'no',
      abreIdx: '(', cierraIdx: ')', sepIdx: ', ', idxPorDim: false,
      declara: false, retorna: null, mayus: true
    },
    parcial: {
      inicio: 'Inicio', fin: 'Fin',
      lea: 'Leer', escriba: 'Escribir',
      para: 'Para', haga: 'hacer', fpara: 'Finpara',
      mq: 'Mientras', fmq: 'FinMientras', hasta: 'Hasta',
      si: 'Si', entonces: 'entonces', sino: 'Sino', fsi: 'FinSi',
      sub: 'Subrutina', finsub: null,
      fun: 'Funcion', finfun: null,
      ejecute: 'Ejecutar', mod: 'mod',
      y: 'y', o: 'o', no: 'no',
      abreIdx: '[', cierraIdx: ']', sepIdx: '][', idxPorDim: true,
      declara: true, retorna: 'Retorna', mayus: false
    }
  };

  const IND = '    ';

  function nom(n, d) {
    const t = n.texto || n.nombre || '';
    return d.mayus ? t : t;
  }

  /* ---------- expresiones ---------- */

  function idxTxt(indices, d, f) {
    if (d.idxPorDim) return d.abreIdx + indices.map(f).join(d.sepIdx) + d.cierraIdx;
    return d.abreIdx + indices.map(f).join(d.sepIdx) + d.cierraIdx;
  }

  function ex(n, d, ctx) {
    if (!n) return '';
    ctx = ctx || {};
    const f = x => ex(x, d, ctx);
    switch (n.t) {
      case 'num': return String(n.v);
      case 'str': return "'" + n.v + "'";
      case 'bool': return n.v ? 'TRUE' : 'FALSE';
      case 'var': return nom(n, d);
      case 'idx': return nom(n, d) + idxTxt(n.indices, d, f);
      case 'llam': return (n.nombre === 'int' && n.interna)
        ? '[| ' + f(n.args[0]) + ' |]'
        : n.nombre.toUpperCase() + '(' + n.args.map(f).join(', ') + ')';
      case 'llam_o_idx': {
        /* Aquí se decide si `V(I)` es un índice o una llamada. Si el nombre
           no está declarado como función, es un arreglo: se imprime con los
           delimitadores del dialecto. */
        const esFun = (ctx.funs && ctx.funs[n.nombre]) || INTERNAS[n.nombre];
        if (esFun) return nom(n, d) + '(' + n.args.map(f).join(', ') + ')';
        return nom(n, d) + idxTxt(n.args, d, f);
      }
      case 'un': return n.op === '-' ? '-' + f(n.a) : d.no + ' ' + f(n.a);
      case 'bin': {
        const op = n.op === 'mod' ? ' ' + d.mod + ' '
          : n.op === 'y' ? ' ' + d.y + ' '
            : n.op === 'o' ? ' ' + d.o + ' '
              : n.op === '||' ? ' || '
                : ' ' + n.op + ' ';
        const izq = necesitaPar(n.a, n) ? '(' + f(n.a) + ')' : f(n.a);
        const der = necesitaPar(n.b, n, true) ? '(' + f(n.b) + ')' : f(n.b);
        return izq + op + der;
      }
    }
    return '';
  }

  const INTERNAS = { int:1, abs:1, raiz:1, redondear:1, mod:1, long:1, der:1, izq:1,
    substr:1, val:1, str:1, mayuscula:1, minuscula:1 };

  const PREC = { 'o': 1, 'y': 2, '=': 3, '<>': 3, '<': 3, '>': 3, '<=': 3, '>=': 3, '||': 4, '+': 5, '-': 5, '*': 6, '/': 6, 'mod': 6, '^': 7 };
  function necesitaPar(hijo, padre, derecha) {
    if (!hijo || hijo.t !== 'bin') return false;
    const a = PREC[hijo.op] || 9, b = PREC[padre.op] || 9;
    return derecha ? a <= b : a < b;
  }

  P.fmtExpr = function (n) { return ex(n, D.libro); };

  /* ---------- sentencias ---------- */

  function st(s, d, nivel, out, ctx) {
    const p = IND.repeat(nivel);
    const f = x => ex(x, d, ctx);

    switch (s.t) {
      case 'decl':
        if (!d.declara) return;
        out.push(p + cap(s.tipoTxt) + ' ' + s.vars.map(v =>
          v.texto + (v.dims && v.dims.length ? idxTxt(v.dims, d, f) : '')).join(', '));
        return;

      case 'lea':
        out.push(p + d.lea + ' ' + s.destinos.map(f).join(', '));
        return;

      case 'escriba':
        out.push(p + d.escriba + ' ' + s.exprs.map(f).join(', '));
        return;

      case 'asig':
        out.push(p + f(s.dest) + ' ← ' + f(s.expr));
        return;

      case 'si':
        out.push(p + d.si + ' (' + f(s.cond) + ') ' + d.entonces);
        s.entonces.forEach(x => st(x, d, nivel + 1, out, ctx));
        if (s.sino) {
          out.push(p + d.sino);
          s.sino.forEach(x => st(x, d, nivel + 1, out, ctx));
        }
        out.push(p + d.fsi);
        return;

      case 'para': {
        const paso = s.paso ? ', ' + f(s.paso) : '';
        out.push(p + d.para + ' ' + s.vtexto + ' = ' + f(s.desde) + ', ' + f(s.hasta) + paso + ' ' + d.haga);
        s.cuerpo.forEach(x => st(x, d, nivel + 1, out, ctx));
        out.push(p + d.fpara);
        return;
      }

      case 'mq':
        out.push(p + d.mq + ' (' + f(s.cond) + ') ' + d.haga);
        s.cuerpo.forEach(x => st(x, d, nivel + 1, out, ctx));
        out.push(p + d.fmq);
        return;

      case 'hagahasta':
        out.push(p + d.haga.toUpperCase());
        s.cuerpo.forEach(x => st(x, d, nivel + 1, out, ctx));
        out.push(p + d.hasta + ' (' + f(s.cond) + ')');
        return;

      case 'ejecute':
        out.push(p + (d.retorna ? '' : d.ejecute + ' ') + s.texto + '(' + s.args.map(f).join(', ') + ')');
        return;

      case 'retorna':
        /* El dialecto Libro no tiene `Retorna`: una función devuelve
           asignando a su propio nombre. */
        if (d.retorna) out.push(p + d.retorna + ' ' + f(s.expr));
        else out.push(p + (ctx && ctx.fn ? ctx.fn : 'resultado') + ' ← ' + f(s.expr));
        return;
    }
  }

  const cap = t => t ? t[0].toUpperCase() + t.slice(1).toLowerCase() : t;

  /* ---------- programa ---------- */

  P.fmt = function (ast, dialecto) {
    const d = D[dialecto] || D.libro;
    if (!ast) return '';
    const out = [];
    const ctx = { funs: ast.funs || {} };

    const proc = (def, clase) => {
      const cab = (clase === 'sub' ? d.sub : d.fun) + ' ' + def.texto + '(' +
        def.params.map(x => (d.declara && x.tipoTxt ? cap(x.tipoTxt) + ' ' : '') +
          x.texto + (x.esArreglo ? (d.idxPorDim ? '[]' : '') : '')).join(', ') + ')' +
        (d.declara && clase === 'fun' && def.tipoRet ? ' ' + def.tipoRet.toLowerCase() : '');
      out.push(cab);
      const ctxFn = Object.assign({}, ctx, { fn: clase === 'fun' ? def.texto : null });
      def.cuerpo.forEach(x => st(x, d, 1, out, ctxFn));
      const cierre = clase === 'sub' ? d.finsub : d.finfun;
      out.push(cierre || (d.fin + ' ' + def.texto));
      out.push('');
    };

    Object.keys(ast.subs || {}).forEach(k => proc(ast.subs[k], 'sub'));
    Object.keys(ast.funs || {}).forEach(k => proc(ast.funs[k], 'fun'));

    if (ast.principal) {
      out.push(d.inicio);
      ast.principal.cuerpo.forEach(x => st(x, d, 1, out, ctx));
      out.push(d.fin);
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  };

  /* ---------- resaltado ---------- */
  /* Tokeniza para pintar. Deliberadamente tenue: mientras corre la traza,
     el estado de ejecución es lo que tiene que leerse, no la sintaxis. */
  P.resaltar = function (fuente) {
    const { tokens } = P.lex(fuente);
    const lineas = fuente.split('\n');
    const marcas = lineas.map(() => []);
    tokens.forEach(t => {
      if (t.tipo === 'EOF') return;
      const cl = t.tipo === 'KW' ? 'kw'
        : t.tipo === 'STR' ? 'str'
          : t.tipo === 'NUM' ? 'num'
            : t.tipo === 'ID' ? 'id' : 'op';
      const fila = marcas[t.linea - 1];
      if (fila) fila.push({ col: t.col, len: t.texto.length, cl });
    });
    return lineas.map((ln, k) => {
      const ms = marcas[k].sort((a, b) => a.col - b.col);
      let out = '', pos = 0;
      ms.forEach(m => {
        const i = m.col - 1;
        if (i < pos) return;
        out += esc(ln.slice(pos, i));
        out += '<span class="t-' + m.cl + '">' + esc(ln.substr(i, m.len)) + '</span>';
        pos = i + m.len;
      });
      out += esc(ln.slice(pos));
      return out;
    });
  };

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  P.esc = esc;
})();
