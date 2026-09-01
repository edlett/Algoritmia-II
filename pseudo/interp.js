/* ============================================================
   interp.js — AST → traza.

   La traza es la lista completa de estados por los que pasa el programa.
   Cada paso es una fotografía entera (no un delta): con programas de examen
   no pasa de unos miles de pasos, y poder saltar a cualquier punto al
   instante vale más que la memoria que se ahorraría.

   Todas las reglas semánticas salen de §5 de la base de conocimiento:
   índices base 1, ← asigna, || concatena, <> es distinto, una función
   devuelve un solo dato, EJECUTE sólo para subrutinas, las locales mueren
   al retornar.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const P = window.AYP.pseudo = window.AYP.pseudo || {};

  /* ---------- valores ---------- */

  const esArr = v => v !== null && typeof v === 'object' && v.__arr === true;

  function nuevoArr(base) {
    return { __arr: true, dims: [], datos: [], base: base === undefined ? 1 : base };
  }

  /* Formateo para mostrar: coma decimal en español, cadenas entre comillas. */
  function texto(v) {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number') {
      if (!isFinite(v)) return v > 0 ? '∞' : '-∞';
      const r = Math.round(v * 1e6) / 1e6;
      return String(r).replace('.', ',');
    }
    if (esArr(v)) return '(arreglo)';
    return String(v);
  }
  P.texto = texto;

  /* ---------- errores de ejecución ---------- */

  function ErrEjec(mensaje, linea, sugerencia) {
    this.mensaje = mensaje; this.linea = linea; this.sugerencia = sugerencia || null;
    this.__ejec = true;
  }
  const alto = (m, l, s) => { throw new ErrEjec(m, l, s); };

  /* Señal de retorno (no es un error: es control de flujo) */
  function Retorno(valor) { this.valor = valor; this.__ret = true; }

  /* ============================================================
     ejecutar
     ============================================================ */
  P.ejecutar = function (prog, opts) {
    opts = opts || {};
    const ast = prog.ast;
    const base = opts.base === 0 ? 0 : 1;
    const maxPasos = opts.maxPasos || 20000;
    const maxProf = opts.maxProfundidad || 450;

    const entradas = (opts.entradas || []).slice();
    let iEntrada = 0;

    const pasos = [];
    const salida = [];
    let error = null;
    let toca = { lee: {}, escribe: {} };

    if (!ast || !ast.principal) {
      return { pasos: [], salida: [], error: { mensaje: 'No hay algoritmo principal que ejecutar.', linea: 1 }, resumen: null };
    }

    /* ---------- marcos ---------- */
    const pila = [];
    const marcoActual = () => pila[pila.length - 1];

    function nuevoMarco(nombre, tipo, linea) {
      return { nombre, tipo, linea, vars: Object.create(null), orden: [] };
    }

    function leerVar(nombre, linea) {
      const m = marcoActual();
      if (nombre in m.vars) return m.vars[nombre];
      return undefined;
    }
    function escribirVar(nombre, valor) {
      const m = marcoActual();
      if (!(nombre in m.vars)) m.orden.push(nombre);
      m.vars[nombre] = valor;
    }

    /* ---------- arreglos ---------- */

    function obtenerArr(nombre, crear, linea) {
      const m = marcoActual();
      let a = m.vars[nombre];
      if (esArr(a)) return a;
      if (a === undefined || a === null) {
        if (!crear) return null;
        a = nuevoArr(base);
        escribirVar(nombre, a);
        return a;
      }
      alto('«' + nombre.toUpperCase() + '» ya guarda un valor simple; no se puede usar como arreglo.', linea);
    }

    function chequeaIndice(nombre, idx, linea) {
      if (typeof idx !== 'number' || !isFinite(idx) || Math.floor(idx) !== idx) {
        alto('El índice de «' + nombre.toUpperCase() + '» tiene que ser un número entero (llegó ' + texto(idx) + ').', linea);
      }
      if (idx < base) {
        alto('Índice ' + idx + ' fuera de rango en «' + nombre.toUpperCase() + '».', linea,
          base === 1 ? 'En pseudocódigo los índices empiezan en 1: el primer elemento es ' + nombre.toUpperCase() + '(1).' : null);
      }
      if (idx > 4000) alto('Índice demasiado grande (' + idx + ') en «' + nombre.toUpperCase() + '».', linea);
    }

    function leerCelda(nombre, indices, linea) {
      const a = obtenerArr(nombre, false, linea);
      if (!a) alto('El arreglo «' + nombre.toUpperCase() + '» todavía no tiene ningún valor.', linea,
        'Antes de leerlo hay que llenarlo, por ejemplo con LEA ' + nombre.toUpperCase() + '(I) dentro de un PARA.');
      indices.forEach(x => chequeaIndice(nombre, x, linea));
      registrar('lee', nombre, indices);
      if (indices.length === 1) {
        const v = a.datos[indices[0] - a.base];
        return v === undefined ? null : v;
      }
      const fila = a.datos[indices[0] - a.base];
      if (fila === undefined || fila === null) return null;
      const v = fila[indices[1] - a.base];
      return v === undefined ? null : v;
    }

    function escribirCelda(nombre, indices, valor, linea) {
      const a = obtenerArr(nombre, true, linea);
      indices.forEach(x => chequeaIndice(nombre, x, linea));
      if (indices.length === 1) {
        const k = indices[0] - a.base;
        while (a.datos.length <= k) a.datos.push(null);
        a.datos[k] = valor;
        a.dims = [Math.max(a.dims[0] || 0, a.datos.length)];
      } else {
        const r = indices[0] - a.base, c = indices[1] - a.base;
        while (a.datos.length <= r) a.datos.push([]);
        if (!Array.isArray(a.datos[r])) a.datos[r] = [];
        while (a.datos[r].length <= c) a.datos[r].push(null);
        a.datos[r][c] = valor;
        let anchoMax = 0;
        a.datos.forEach(f => { if (Array.isArray(f)) anchoMax = Math.max(anchoMax, f.length); });
        a.dims = [a.datos.length, anchoMax];
      }
      registrar('escribe', nombre, indices);
    }

    function registrar(clase, nombre, indices) {
      const d = toca[clase];
      (d[nombre] = d[nombre] || []).push(indices.slice());
    }

    /* ---------- funciones internas ---------- */

    const INTERNAS = {
      int: (a, l) => { num(a[0], l, 'INT'); return Math.trunc(a[0]); },
      abs: (a, l) => { num(a[0], l, 'ABS'); return Math.abs(a[0]); },
      raiz: (a, l) => { num(a[0], l, 'RAIZ'); return Math.sqrt(a[0]); },
      redondear: (a, l) => { num(a[0], l, 'REDONDEAR'); return Math.round(a[0]); },
      mod: (a, l) => { num(a[0], l, 'MOD'); num(a[1], l, 'MOD'); return residuo(a[0], a[1], l); },
      long: (a, l) => cad(a[0], l, 'LONG').length,
      der: (a, l) => { const s = cad(a[0], l, 'DER'), n = Math.max(0, a[1] | 0); return n >= s.length ? s : s.slice(s.length - n); },
      izq: (a, l) => { const s = cad(a[0], l, 'IZQ'), n = Math.max(0, a[1] | 0); return s.slice(0, n); },
      substr: (a, l) => {
        const s = cad(a[0], l, 'SUBSTR');
        const p = a[1] | 0, n = a[2] === undefined ? 1 : (a[2] | 0);
        if (p < 1) alto('SUBSTR cuenta las posiciones desde 1.', l, 'El primer carácter es SUBSTR(C, 1, 1).');
        return s.substr(p - 1, n);
      },
      val: (a, l) => {
        const s = String(a[0] === null ? '' : a[0]).trim().replace(',', '.');
        const v = Number(s);
        if (s === '' || isNaN(v)) alto('VAL sólo convierte cadenas que contengan un número; llegó «' + s + '».', l);
        return v;
      },
      str: (a, l) => (typeof a[0] === 'number' ? String(a[0]) : String(a[0] === null ? '' : a[0])),
      mayuscula: (a, l) => cad(a[0], l, 'MAYUSCULA').toUpperCase(),
      minuscula: (a, l) => cad(a[0], l, 'MINUSCULA').toLowerCase()
    };

    function num(v, l, quien) {
      if (typeof v !== 'number' || !isFinite(v))
        alto(quien + ' necesita un número (llegó ' + texto(v) + ').', l);
      return v;
    }
    function cad(v, l, quien) {
      if (esArr(v)) alto(quien + ' necesita una cadena, no un arreglo completo.', l);
      if (v === null || v === undefined) alto(quien + ' recibió una variable sin valor.', l);
      return typeof v === 'number' ? String(v) : String(v);
    }
    function residuo(a, b, l) {
      if (b === 0) alto('No se puede hallar el residuo entre 0.', l);
      return a - Math.trunc(a / b) * b;
    }

    /* ---------- evaluación de expresiones ---------- */

    function evaluar(n) {
      switch (n.t) {
        case 'num': return n.v;
        case 'str': return n.v;
        case 'bool': return n.v;

        case 'var': {
          const v = leerVar(n.nombre, n.linea);
          if (v === undefined)
            alto('La variable «' + (n.texto || n.nombre) + '» no tiene ningún valor todavía.', n.linea,
              'Hay que asignarle algo (con ←) o leerla (con LEA) antes de usarla.');
          return v;
        }

        case 'idx': {
          const idx = n.indices.map(evaluar);
          return leerCelda(n.nombre, idx, n.linea);
        }

        case 'llam_o_idx': {
          /* Aquí se resuelve la ambigüedad de los paréntesis del manual. */
          if (ast.funs[n.nombre]) return llamarFuncion(ast.funs[n.nombre], n.args.map((a, k) => evalArg(a, ast.funs[n.nombre], k)), n.linea);
          if (INTERNAS[n.nombre]) return INTERNAS[n.nombre](n.args.map(evaluar), n.linea);
          if (ast.subs[n.nombre])
            alto('«' + (n.texto || n.nombre) + '» es una subrutina y no devuelve ningún valor.', n.linea,
              'Las subrutinas se invocan aparte, con EJECUTE ' + (n.texto || n.nombre) + '(…).');
          const idx = n.args.map(evaluar);
          return leerCelda(n.nombre, idx, n.linea);
        }

        case 'llam': {   /* [| x |] y demás internas explícitas */
          if (INTERNAS[n.nombre]) return INTERNAS[n.nombre](n.args.map(evaluar), n.linea);
          alto('No existe la función «' + n.nombre + '».', n.linea);
          break;
        }

        case 'un': {
          if (n.op === '-') return -num(evaluar(n.a), n.linea, 'El signo menos');
          if (n.op === 'no') return !verdad(evaluar(n.a), n.linea);
          break;
        }

        case 'bin': return binario(n);
      }
      alto('No se pudo evaluar la expresión.', n.linea);
    }

    /* ¿El procedimiento usa ese parámetro con índices? Se mira su cuerpo.
       Es lo que permite distinguir un parámetro de salida que es un VECTOR
       (hay que crearlo y pasarlo por referencia) de uno que es un ESCALAR
       (se pasa por valor y se copia de vuelta al terminar). */
    const cacheArr = {};
    function usaComoArreglo(def, nombre) {
      const k = def.nombre + '|' + nombre;
      if (k in cacheArr) return cacheArr[k];
      let hit = false;
      (function mirar(n) {
        if (!n || hit || typeof n !== 'object') return;
        if (Array.isArray(n)) { n.forEach(mirar); return; }
        if ((n.t === 'idx' || n.t === 'llam_o_idx') && n.nombre === nombre &&
            !ast.funs[n.nombre] && !INTERNAS[n.nombre]) { hit = true; return; }
        Object.keys(n).forEach(x => { if (x !== 't' && x !== 'nombre') mirar(n[x]); });
      })(def.cuerpo);
      cacheArr[k] = hit;
      return hit;
    }

    /* Los arreglos se pasan por REFERENCIA. Si la variable todavía no existe
       y el procedimiento la va a indexar, se crea vacía: así funciona el
       parámetro de SALIDA del manual, donde `EJECUTE leavector(N, A)` es
       justamente lo que da vida al vector A. */
    function evalArg(n, def, k) {
      if (n.t === 'var') {
        const v = leerVar(n.nombre, n.linea);
        if (esArr(v)) return v;
        if (v === undefined) {
          const formal = def && def.params[k];
          const comoArr = formal && (formal.esArreglo || usaComoArreglo(def, formal.nombre));
          if (comoArr) {
            const a = nuevoArr(base);
            escribirVar(n.nombre, a);
            return a;
          }
          return null;   /* escalar de salida: entra vacío y se copia de vuelta */
        }
      }
      return evaluar(n);
    }

    /* Copia de vuelta (copy-out): al terminar una SUBRUTINA, los argumentos
       que eran variables sueltas reciben el valor final de su parámetro
       formal. Es exactamente la semántica de los parámetros S y E/S del
       manual, y es lo que hace que `EJECUTE contar(N, V, NEG, POS, CER)`
       deje los tres contadores en el algoritmo principal. */
    function copiarDeVuelta(def, nodos, marco) {
      if (!nodos) return;
      nodos.forEach((n, k) => {
        if (!n || n.t !== 'var') return;
        const formal = def.params[k];
        if (!formal) return;
        const v = marco.vars[formal.nombre];
        if (esArr(v)) return;                 /* ya iba por referencia */
        if (v === undefined) return;
        escribirVar(n.nombre, v);
      });
    }

    function verdad(v, l) {
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v !== 0;
      alto('Aquí se esperaba una condición verdadera o falsa.', l);
    }

    function binario(n) {
      const op = n.op;

      if (op === 'y') return verdad(evaluar(n.a), n.linea) && verdad(evaluar(n.b), n.linea);
      if (op === 'o') return verdad(evaluar(n.a), n.linea) || verdad(evaluar(n.b), n.linea);

      const a = evaluar(n.a), b = evaluar(n.b);

      if (op === '||') {
        if (esArr(a) || esArr(b)) alto('No se pueden concatenar arreglos.', n.linea);
        return String(a === null ? '' : a) + String(b === null ? '' : b);
      }

      if (op === '=' || op === '<>') {
        const igual = (typeof a === 'string' || typeof b === 'string')
          ? String(a) === String(b) : a === b;
        return op === '=' ? igual : !igual;
      }

      if (op === '<' || op === '>' || op === '<=' || op === '>=') {
        if (typeof a === 'string' || typeof b === 'string') {
          const x = String(a), y = String(b);
          return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
        }
        num(a, n.linea, 'La comparación'); num(b, n.linea, 'La comparación');
        return op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b;
      }

      /* aritmética: el + admite cadenas por comodidad, el resto no */
      if (op === '+' && (typeof a === 'string' || typeof b === 'string')) return String(a) + String(b);
      num(a, n.linea, 'La operación «' + op + '»'); num(b, n.linea, 'La operación «' + op + '»');
      switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': if (b === 0) alto('División entre cero.', n.linea); return a / b;
        case '^': return Math.pow(a, b);
        case 'mod': return residuo(a, b, n.linea);
      }
      alto('Operador desconocido «' + op + '».', n.linea);
    }

    /* ---------- llamadas ---------- */

    function enlazarParams(def, args, linea, quien) {
      if (args.length !== def.params.length) {
        alto('«' + def.texto + '» espera ' + def.params.length + ' parámetro(s) y recibió ' + args.length + '.', linea,
          'Los parámetros actuales y los formales van uno a uno, en el mismo orden y en la misma cantidad.');
      }
      const m = nuevoMarco(def.texto, quien, linea);
      def.params.forEach((p, k) => {
        m.vars[p.nombre] = args[k];
        m.orden.push(p.nombre);
      });
      return m;
    }

    function llamarFuncion(def, args, linea) {
      if (pila.length >= maxProf)
        alto('Demasiadas llamadas anidadas dentro de «' + def.texto + '».', linea,
          'Revisa el método de las dos preguntas: ¿hay caso base y cada llamada es a un caso más pequeño?');
      const m = enlazarParams(def, args, linea, 'funcion');
      pila.push(m);
      paso(def.linea, 'llamada', 'Se llama a la función ' + def.texto + '.');
      let valor;
      try {
        ejecutarBloque(def.cuerpo);
        valor = m.vars[def.nombre];
        if (valor === undefined)
          alto('La función «' + def.texto + '» terminó sin dejar ningún resultado.', def.linea,
            'Antes de cerrarla hay que escribir  ' + def.texto + ' ← resultado.');
      } catch (e) {
        if (e && e.__ret) valor = e.valor;
        else { pila.pop(); throw e; }
      }
      if (esArr(valor))
        alto('Una función sólo puede devolver un dato, no un conjunto.', def.linea,
          'Para devolver un vector o una matriz hay que usar una SUBRUTINA.');
      pila.pop();
      paso(linea, 'retorno', def.texto + ' devuelve ' + texto(valor) + '.');
      return valor;
    }

    function llamarSubrutina(def, args, linea, nodos) {
      if (pila.length >= maxProf)
        alto('Demasiadas llamadas anidadas dentro de «' + def.texto + '».', linea,
          'Revisa el método de las dos preguntas: ¿hay caso base y cada llamada es a un caso más pequeño?');
      const m = enlazarParams(def, args, linea, 'subrutina');
      pila.push(m);
      paso(def.linea, 'llamada', 'Se ejecuta la subrutina ' + def.texto + '.');
      try {
        ejecutarBloque(def.cuerpo);
      } catch (e) {
        if (!(e && e.__ret)) { pila.pop(); throw e; }
      }
      const m2 = pila.pop();
      copiarDeVuelta(def, nodos, m2);
      paso(linea, 'retorno', 'Termina ' + def.texto + ' y el control vuelve.');
    }

    /* ---------- instantánea ---------- */

    function copiarArr(a) {
      return {
        dims: a.dims.slice(),
        base: a.base,
        datos: a.dims.length > 1
          ? a.datos.map(f => Array.isArray(f) ? f.slice() : [])
          : a.datos.slice()
      };
    }

    function instantanea() {
      const m = marcoActual();
      const vars = {}, arrays = {};
      if (m) {
        m.orden.forEach(k => {
          const v = m.vars[k];
          if (esArr(v)) arrays[k] = copiarArr(v);
          else vars[k] = v;
        });
      }
      /* los arreglos del principal siempre se ven, aunque estemos dentro
         de un procedimiento: es lo que hace legible la prueba de escritorio */
      const raiz = pila[0];
      if (raiz && raiz !== m) {
        raiz.orden.forEach(k => {
          const v = raiz.vars[k];
          if (esArr(v) && !(k in arrays)) arrays[k] = copiarArr(v);
        });
      }
      return { vars, arrays };
    }

    function paso(linea, evento, nota, extra) {
      if (pasos.length >= maxPasos) {
        alto('El programa lleva ' + maxPasos + ' pasos y no termina.', linea,
          'Puede ser un ciclo que nunca cambia su condición, o una recursión sin caso base.');
      }
      const snap = instantanea();
      const p = {
        n: pasos.length,
        linea,
        evento,
        nota: nota || '',
        pila: pila.map(f => ({ nombre: f.nombre, tipo: f.tipo, linea: f.linea })),
        vars: snap.vars,
        arrays: snap.arrays,
        lee: toca.lee,
        escribe: toca.escribe,
        salida: salida.slice()
      };
      if (extra) Object.assign(p, extra);
      pasos.push(p);
      toca = { lee: {}, escribe: {} };
      return p;
    }

    /* ---------- sentencias ---------- */

    function ejecutarBloque(lista) {
      for (let k = 0; k < lista.length; k++) ejecutarSent(lista[k]);
    }

    function ejecutarSent(s) {
      switch (s.t) {

        case 'decl': {
          s.vars.forEach(v => {
            const ya = leerVar(v.nombre);
            /* Si el arreglo ya viene precargado (prueba de escritorio), la
               declaración sólo confirma su tamaño: no borra el contenido. */
            if (esArr(ya)) {
              if (v.dims && v.dims.length) {
                const d = v.dims.map(e => evaluar(e));
                ya.dims = d.slice();
                if (d.length === 1) { while (ya.datos.length < d[0]) ya.datos.push(null); }
                else {
                  while (ya.datos.length < d[0]) ya.datos.push([]);
                  ya.datos.forEach(f => { if (Array.isArray(f)) while (f.length < d[1]) f.push(null); });
                }
              }
              return;
            }
            if (v.dims && v.dims.length) {
              const a = nuevoArr(base);
              const d = v.dims.map(e => evaluar(e));
              a.dims = d.slice();
              if (d.length === 1) { for (let k = 0; k < d[0]; k++) a.datos.push(null); }
              else { for (let r = 0; r < d[0]; r++) { const f = []; for (let c = 0; c < d[1]; c++) f.push(null); a.datos.push(f); } }
              escribirVar(v.nombre, a);
            } else if (ya === undefined) {
              escribirVar(v.nombre, null);
            }
          });
          paso(s.linea, 'declaracion',
            'Se reserva memoria para ' + s.vars.map(v => v.texto).join(', ') + '.');
          return;
        }

        case 'lea': {
          const nombres = [];
          s.destinos.forEach(d => {
            if (iEntrada >= entradas.length)
              alto('El programa pide un dato más y ya no quedan entradas.', s.linea,
                'Añade el valor en la casilla de entradas: se consumen en el orden en que aparecen los LEA.');
            let v = entradas[iEntrada++];
            if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v.replace(',', '.'))))
              v = Number(v.replace(',', '.'));
            if (d.t === 'var') { escribirVar(d.nombre, v); nombres.push(d.texto + ' = ' + texto(v)); }
            else {
              const idx = d.indices.map(evaluar);
              escribirCelda(d.nombre, idx, v, s.linea);
              nombres.push(d.texto + '(' + idx.join(', ') + ') = ' + texto(v));
            }
          });
          paso(s.linea, 'lectura', 'Se lee ' + nombres.join(' y ') + '.');
          return;
        }

        case 'escriba': {
          const partes = s.exprs.map(e => {
            const v = evaluar(e);
            return esArr(v) ? '(arreglo)' : texto(v);
          });
          const linea = partes.join(' ');
          salida.push(linea);
          paso(s.linea, 'escritura', 'Se imprime: ' + linea);
          return;
        }

        case 'asig': {
          const v = evaluar(s.expr);
          if (s.dest.t === 'var') {
            const antes = leerVar(s.dest.nombre);
            escribirVar(s.dest.nombre, v);
            paso(s.linea, 'asignacion',
              s.dest.texto + ' pasa a valer ' + texto(v) +
              (antes !== undefined && !esArr(antes) ? ' (antes ' + texto(antes) + ')' : '') + '.',
              { cambio: { nombre: s.dest.nombre, antes: esArr(antes) ? null : antes, ahora: v } });
          } else {
            const idx = s.dest.indices.map(evaluar);
            escribirCelda(s.dest.nombre, idx, v, s.linea);
            paso(s.linea, 'asignacion',
              s.dest.texto + '(' + idx.join(', ') + ') pasa a valer ' + texto(v) + '.');
          }
          return;
        }

        case 'si': {
          const c = verdad(evaluar(s.cond), s.linea);
          paso(s.linea, 'condicion',
            'La condición resulta ' + (c ? 'verdadera: se entra al SI.' : 'falsa: ' + (s.sino ? 'se va al SINO.' : 'se salta el bloque.')),
            { cond: { texto: P.fmtExpr ? P.fmtExpr(s.cond) : '', valor: c } });
          if (c) ejecutarBloque(s.entonces);
          else if (s.sino) ejecutarBloque(s.sino);
          return;
        }

        case 'para': {
          const desde = num(evaluar(s.desde), s.linea, 'El valor inicial del PARA');
          const hasta = num(evaluar(s.hasta), s.linea, 'El valor final del PARA');
          const paso1 = s.paso === null ? 1 : num(evaluar(s.paso), s.linea, 'El paso del PARA');
          if (paso1 === 0)
            alto('El paso del PARA es 0: el ciclo nunca terminaría.', s.linea,
              'El PARA lleva tres partes: PARA I = inicio, fin, paso.');
          let v = desde, vuelta = 0;
          escribirVar(s.v, v);
          while (paso1 > 0 ? v <= hasta : v >= hasta) {
            vuelta++;
            escribirVar(s.v, v);
            paso(s.linea, 'iteracion',
              'Vuelta ' + vuelta + ' del ciclo: ' + s.vtexto + ' = ' + texto(v) + '.',
              { iteracion: { v: s.v, valor: v, vuelta } });
            ejecutarBloque(s.cuerpo);
            v = leerVar(s.v);
            if (typeof v !== 'number') v = desde + vuelta * paso1;
            v += paso1;
            escribirVar(s.v, v);
          }
          paso(s.linea, 'iteracion',
            'El ciclo termina: ' + s.vtexto + ' = ' + texto(v) + ' ya ' +
            (paso1 > 0 ? 'pasó de ' : 'bajó de ') + texto(hasta) + '.');
          return;
        }

        case 'mq': {
          let vuelta = 0;
          for (;;) {
            const c = verdad(evaluar(s.cond), s.linea);
            paso(s.linea, 'condicion',
              c ? 'La condición se cumple: vuelta ' + (vuelta + 1) + ' del MQ.'
                : 'La condición ya no se cumple: sale del MQ.',
              { cond: { texto: P.fmtExpr ? P.fmtExpr(s.cond) : '', valor: c } });
            if (!c) break;
            vuelta++;
            ejecutarBloque(s.cuerpo);
          }
          return;
        }

        case 'hagahasta': {
          let vuelta = 0;
          for (;;) {
            vuelta++;
            paso(s.linea, 'iteracion', 'Vuelta ' + vuelta + ' del HAGA.');
            ejecutarBloque(s.cuerpo);
            const c = verdad(evaluar(s.cond), s.linea);
            paso(s.linea, 'condicion',
              c ? 'Se cumple la condición de salida: termina el HAGA.' : 'Todavía no se cumple: otra vuelta.',
              { cond: { texto: P.fmtExpr ? P.fmtExpr(s.cond) : '', valor: c } });
            if (c) break;
          }
          return;
        }

        case 'ejecute': {
          const sub = ast.subs[s.nombre];
          if (sub) {
            llamarSubrutina(sub, s.args.map((a, k) => evalArg(a, sub, k)), s.linea, s.args);
            return;
          }
          const fn = ast.funs[s.nombre];
          if (fn) {
            if (s.implicito) { llamarFuncion(fn, s.args.map((a, k) => evalArg(a, fn, k)), s.linea); return; }
            alto('«' + s.texto + '» es una función, no una subrutina.', s.linea,
              'Las funciones no se llaman con EJECUTE: su resultado se usa, por ejemplo  X ← ' + s.texto + '(…).');
          }
          alto('No existe ninguna subrutina llamada «' + s.texto + '».', s.linea,
            'Revisa que esté declarada con SUBRUTINA ' + s.texto + ' (…) y que el nombre coincida.');
          return;
        }

        case 'retorna': {
          const v = s.expr ? evaluar(s.expr) : null;
          const m = marcoActual();
          if (m) escribirVar(m.nombre.toLowerCase ? P.norm(m.nombre) : m.nombre, v);
          paso(s.linea, 'retorno', 'Devuelve ' + texto(v) + '.');
          throw new Retorno(v);
        }
      }
      alto('Instrucción desconocida.', s.linea || 1);
    }

    /* ---------- arranque ---------- */

    const raiz = nuevoMarco('INICIO', 'principal', ast.principal.linea);
    pila.push(raiz);

    /* precarga de arreglos (para las pruebas de escritorio) */
    const pre = opts.precarga || {};
    Object.keys(pre).forEach(k => {
      const nombre = P.norm(k);
      const datos = pre[k];
      const a = nuevoArr(base);
      if (Array.isArray(datos) && Array.isArray(datos[0])) {
        a.datos = datos.map(f => f.slice());
        let ancho = 0; a.datos.forEach(f => ancho = Math.max(ancho, f.length));
        a.dims = [a.datos.length, ancho];
      } else if (Array.isArray(datos)) {
        a.datos = datos.slice();
        a.dims = [a.datos.length];
      } else return;
      raiz.vars[nombre] = a;
      raiz.orden.push(nombre);
    });
    Object.keys(opts.variables || {}).forEach(k => {
      const nombre = P.norm(k);
      raiz.vars[nombre] = opts.variables[k];
      raiz.orden.push(nombre);
    });

    paso(ast.principal.linea, 'inicio', 'Empieza el algoritmo principal.');

    try {
      ejecutarBloque(ast.principal.cuerpo);
      paso(ast.principal.linea, 'fin', 'El algoritmo termina.');
    } catch (e) {
      if (e && e.__ejec) error = { mensaje: e.mensaje, linea: e.linea, sugerencia: e.sugerencia };
      else if (e && e.__ret) paso(ast.principal.linea, 'fin', 'El algoritmo termina.');
      else error = { mensaje: 'Error inesperado: ' + (e && e.message ? e.message : e), linea: 0 };
      if (error) {
        pasos.push({
          n: pasos.length, linea: error.linea, evento: 'error',
          nota: error.mensaje, sugerencia: error.sugerencia,
          pila: pila.map(f => ({ nombre: f.nombre, tipo: f.tipo, linea: f.linea })),
          vars: instantanea().vars, arrays: instantanea().arrays,
          lee: {}, escribe: {}, salida: salida.slice()
        });
      }
    }

    /* ---------- resumen ---------- */
    const visitas = {};
    pasos.forEach(p => { visitas[p.linea] = (visitas[p.linea] || 0) + 1; });
    let profMax = 0;
    pasos.forEach(p => profMax = Math.max(profMax, p.pila.length));

    return {
      pasos, salida, error,
      resumen: {
        pasos: pasos.length,
        visitas,
        profundidadMax: profMax,
        entradasUsadas: iEntrada,
        lineaCaliente: Object.keys(visitas).sort((a, b) => visitas[b] - visitas[a])[0]
      }
    };
  };
})();
