/* ============================================================
   traza.js — el reproductor de pseudocódigo.

   Es el componente más usado de toda la app: todas las vistas de estado
   (código, variables, memoria, pila, salida, hoja de prueba de escritorio)
   son proyecciones sincronizadas de UNA sola traza.

   Uso:
     AYP.Traza.montar(host, {
       titulo, fuente, entradas, precarga, variables,
       hoja: ['i','X','au'],      // columnas de la prueba de escritorio
       fuenteRef: 'Manual §1.1 ej. 2',
       dialecto: 'libro' | 'parcial'
     });
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const PS = () => AYP.pseudo;
  const icon = (n, c) => (AYP.icon ? AYP.icon(n, c) : '');

  const VELOCIDADES = [
    ['0.5', '0,5×', 1200], ['1', '1×', 600], ['2', '2×', 300],
    ['4', '4×', 150], ['max', 'al máximo', 30]
  ];

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ============================================================
     montar
     ============================================================ */
  function montar(host, spec) {
    const P = PS();
    const st = {
      spec,
      dialecto: spec.dialecto || 'libro',
      fuente: spec.fuente || '',
      paso: 0,
      corriendo: false,
      timer: null,
      velocidad: 600,
      traza: null,
      prog: null,
      vista: 'estado',        // estado | hoja
      hojaModo: 'ver'         // ver | resolver
    };

    const el = document.createElement('div');
    el.className = 'traza';
    host.appendChild(el);

    fijarDialecto(st.dialecto);
    pintarArmazon();
    aplicarPaso(0);

    /* ---------- compilar ---------- */
    /* `st.fuente` es SIEMPRE el texto que se está mostrando. Al cambiar de
       dialecto se re-imprime desde el AST y se vuelve a compilar, porque
       reordenar procedimientos cambia los números de línea y la traza tiene
       que seguir apuntando donde debe. */
    function fijarDialecto(d) {
      st.dialecto = d;
      const original = spec.dialecto || 'libro';
      if (d === original) {
        /* El texto tal como lo escribió el autor: conserva su formato. */
        st.fuente = spec.fuente;
      } else {
        const base = P.compilar(spec.fuente);
        st.fuente = base.errores.length ? spec.fuente : P.fmt(base.ast, d);
      }
      compilarYEjecutar();
    }

    function compilarYEjecutar() {
      st.prog = P.compilar(st.fuente);
      if (st.prog.errores.length) { st.traza = null; return; }
      st.traza = P.ejecutar(st.prog, {
        entradas: (spec.entradas || []).slice(),
        precarga: spec.precarga || {},
        variables: spec.variables || {},
        base: spec.base === 0 ? 0 : 1
      });
    }

    /* ---------- armazón ---------- */
    function pintarArmazon() {
      const errores = st.prog.errores;
      el.innerHTML = `
        <div class="traza-head">
          <span class="tt">${esc(spec.titulo || 'Pseudocódigo')}</span>
          ${spec.fuenteRef ? `<span class="fuente">${esc(spec.fuenteRef)}</span>` : ''}
          <span class="seg2" data-rol="dialecto" role="group" aria-label="Dialecto">
            <button type="button" data-v="libro" aria-pressed="${st.dialecto === 'libro'}">Libro</button>
            <button type="button" data-v="parcial" aria-pressed="${st.dialecto === 'parcial'}">Parcial</button>
          </span>
          ${spec.hoja && spec.hoja.length ? `
          <span class="seg2" data-rol="vista" role="group" aria-label="Vista">
            <button type="button" data-v="estado" aria-pressed="true">Estado</button>
            <button type="button" data-v="hoja" aria-pressed="false">Hoja</button>
          </span>` : ''}
        </div>
        ${errores.length ? panelErrores(errores) : `
        <div class="traza-cuerpo">
          <div class="tcode corriendo" data-rol="codigo"></div>
          <div class="tpanels" data-rol="paneles"></div>
        </div>
        <div class="tnota" data-rol="nota"></div>
        <div class="tctl" data-rol="ctl">
          <button type="button" class="iconbtn" data-a="reset" title="Reiniciar (R)" aria-label="Reiniciar">${icon('refresh') || '⟲'}</button>
          <button type="button" class="iconbtn" data-a="atras" title="Un paso atrás (←)" aria-label="Un paso atrás">${icon('chevron-left') || '◀'}</button>
          <button type="button" class="iconbtn" data-a="play" title="Reproducir (Espacio)" aria-label="Reproducir">${icon('play') || '▶'}</button>
          <button type="button" class="iconbtn" data-a="adelante" title="Un paso adelante (→)" aria-label="Un paso adelante">${icon('chevron') || '▶'}</button>
          <button type="button" class="iconbtn" data-a="final" title="Ir al final" aria-label="Ir al final">${icon('skip') || '⏭'}</button>
          <input type="range" data-rol="barra" min="0" max="0" value="0" aria-label="Posición en la traza">
          <span class="paso" data-rol="contador">0 / 0</span>
          <select data-rol="vel" aria-label="Velocidad">
            ${VELOCIDADES.map(v => `<option value="${v[2]}"${v[2] === 600 ? ' selected' : ''}>${v[1]}</option>`).join('')}
          </select>
        </div>`}`;

      if (errores.length) return;

      pintarCodigo();
      el.querySelector('[data-rol="barra"]').max = String(Math.max(0, st.traza.pasos.length - 1));
      cablear();
    }

    function panelErrores(errores) {
      return `<div style="padding:14px">
        <p class="muted" style="margin-top:0">Este pseudocódigo todavía no se puede ejecutar:</p>
        <ul class="errlist">${errores.slice(0, 8).map(e =>
          `<li><span class="l">línea ${e.linea}</span>${esc(e.mensaje)}
          ${e.sugerencia ? `<span class="sug">${esc(e.sugerencia)}</span>` : ''}</li>`).join('')}</ul>
      </div>`;
    }

    /* ---------- código ---------- */
    function pintarCodigo() {
      const cont = el.querySelector('[data-rol="codigo"]');
      if (!cont) return;
      const lineas = P.resaltar(st.fuente);
      const visitas = (st.traza && st.traza.resumen) ? st.traza.resumen.visitas : {};
      cont.innerHTML = lineas.map((h, k) => {
        const n = k + 1;
        const v = visitas[n];
        return `<div class="ln" data-l="${n}">
          <span class="n">${n}</span>
          <span class="visitas">${v ? '×' + v : ''}</span>
          <span class="src">${h || '&nbsp;'}</span>
        </div>`;
      }).join('');
    }

    /* ---------- paneles de estado ---------- */

    function pintarPaneles(p) {
      const cont = el.querySelector('[data-rol="paneles"]');
      if (!cont) return;
      if (st.vista === 'hoja') { cont.innerHTML = hojaHtml(p); cablearHoja(); return; }
      cont.innerHTML =
        panelVariables(p) + panelMemoria(p) + panelPila(p) + panelSalida(p);
    }

    function panelVariables(p) {
      const ks = Object.keys(p.vars || {});
      const cambio = p.cambio ? p.cambio.nombre : null;
      const filas = ks.filter(k => !esOculta(k)).map(k => {
        const v = p.vars[k];
        const esC = k === cambio;
        const antes = esC && p.cambio.antes !== undefined && p.cambio.antes !== null
          ? `<span class="antes">${esc(PS().texto(p.cambio.antes))} → </span>` : '';
        return `<tr class="${esC ? 'cambio' : ''}"><td class="k">${esc(k.toUpperCase())}</td>
          <td class="v">${antes}${esc(PS().texto(v))}</td></tr>`;
      }).join('');
      return `<div class="tpanel"><h4>Variables</h4>
        ${filas ? `<table class="tvars">${filas}</table>` : '<p class="vacio">Todavía no hay ninguna.</p>'}
      </div>`;
    }
    const esOculta = k => false;

    function panelMemoria(p) {
      const ks = Object.keys(p.arrays || {});
      if (!ks.length) return '';
      return `<div class="tpanel"><h4>Memoria</h4>${ks.map(k => arrHtml(k, p.arrays[k], p)).join('')}</div>`;
    }

    function arrHtml(nombre, a, p) {
      const lee = (p.lee || {})[nombre] || [];
      const esr = (p.escribe || {})[nombre] || [];
      const marca = (idx) => {
        const eq = l => l.length === idx.length && l.every((x, i) => x === idx[i]);
        if (esr.some(eq)) return 'escrita';
        if (lee.some(eq)) return 'leida';
        return '';
      };
      const b = a.base;
      const NOM = `<div class="nom">${esc(nombre.toUpperCase())}</div>`;

      if (a.dims.length > 1) {
        const filas = a.datos.length, cols = a.dims[1] || 0;
        if (filas * cols > 400) return NOM + '<p class="muted">Matriz de ' + filas + '×' + cols + ' (demasiado grande para dibujar).</p>';
        let h = `<div class="tgrid" style="grid-template-columns:26px repeat(${cols}, minmax(30px,auto))">`;
        h += `<span class="idxcol"></span>`;
        for (let c = 0; c < cols; c++) h += `<span class="idxcol">${c + b}</span>`;
        for (let r = 0; r < filas; r++) {
          h += `<span class="idxrow">${r + b}</span>`;
          for (let c = 0; c < cols; c++) {
            const v = (a.datos[r] || [])[c];
            const m = marca([r + b, c + b]);
            h += `<span class="cel ${m} ${v === null || v === undefined ? 'vacia' : ''}">${v === null || v === undefined ? '·' : esc(PS().texto(v))}</span>`;
          }
        }
        return `<div class="tarr">${NOM}${h}</div></div>`.replace('</div></div>', '</div></div>');
      }

      const n = a.datos.length;
      if (!n) return `<div class="tarr">${NOM}<p class="muted">vacío</p></div>`;
      if (n > 400) return `<div class="tarr">${NOM}<p class="muted">${n} elementos.</p></div>`;
      let cel = '', idx = '', ptr = '';
      const activo = (esr[0] || lee[0] || [])[0];
      for (let k = 0; k < n; k++) {
        const v = a.datos[k];
        const m = marca([k + b]);
        cel += `<span class="cel ${m} ${v === null || v === undefined ? 'vacia' : ''}">${v === null || v === undefined ? '·' : esc(PS().texto(v))}</span>`;
        idx += `<span class="idxcol">${k + b}</span>`;
        ptr += `<span class="ptr">${activo === k + b ? '▲' : ''}</span>`;
      }
      const cols = `grid-template-columns:repeat(${n}, minmax(30px,auto))`;
      return `<div class="tarr">${NOM}
        <div class="tgrid" style="${cols}">${cel}</div>
        <div class="tgrid" style="${cols}">${idx}</div>
        <div class="tgrid" style="${cols}">${ptr}</div>
      </div>`;
    }

    function panelPila(p) {
      const pila = p.pila || [];
      if (pila.length <= 1) return '';
      return `<div class="tpanel"><h4>Pila de llamadas</h4>
        <div class="tpila">${pila.map((f, k) =>
          `<div class="marco ${k === pila.length - 1 ? 'activo' : ''}">
            <span class="tipo">${f.tipo === 'principal' ? 'principal' : f.tipo}</span>
            <span>${esc(f.nombre)}</span>
          </div>`).join('')}</div>
        <p class="muted" style="margin:6px 0 0">Profundidad ${pila.length}. Las variables del marco de arriba desaparecen al retornar.</p>
      </div>`;
    }

    function panelSalida(p) {
      const s = p.salida || [];
      return `<div class="tpanel"><h4>Salida</h4>
        <div class="tsalida">${s.length ? s.map(x => `<div>${esc(x)}</div>`).join('') : '<span class="vacio">(todavía nada)</span>'}</div>
      </div>`;
    }

    /* ---------- hoja de prueba de escritorio ---------- */

    /* La hoja del examen tiene UNA FILA POR VUELTA del ciclo principal, no
       una por paso. Y arrastra el último valor conocido de cada variable
       aunque en ese instante la ejecución esté dentro de una función: eso es
       exactamente lo que hace a mano quien resuelve la prueba de escritorio.

       Una columna puede ser una variable (`i`, `au`) o una casilla indexada
       (`C[i]`), que se resuelve leyendo el arreglo en el índice que valga la
       variable en ese momento. */
    function filasHoja() {
      const cols = spec.hoja || [];
      const N = PS().norm;
      const specs = cols.map(c => {
        const m = /^([^\[\(]+)[\[\(]\s*([^\]\)]+)\s*[\]\)]$/.exec(c.trim());
        return m ? { tipo: 'celda', arr: N(m[1]), idx: N(m[2]) }
                 : { tipo: 'var', k: N(c) };
      });

      const acum = {};
      const out = [];
      const leer = (p, s) => {
        if (s.tipo === 'var') return acum[s.k];
        const i = acum[s.idx];
        const a = (p.arrays || {})[s.arr];
        if (!a || typeof i !== 'number') return undefined;
        const v = a.dims.length > 1 ? null : a.datos[i - a.base];
        return v === null || v === undefined ? undefined : v;
      };
      const instantanea = p => specs.map(s => {
        const v = leer(p, s);
        return v === undefined ? '' : PS().texto(v);
      });

      /* Se cierra una fila al EMPEZAR la vuelta siguiente, con los valores
         acumulados hasta ese momento: si se leyeran después, la variable de
         control ya estaría incrementada y la tabla saldría corrida.
         Y sólo cuenta el PRIMER ciclo del principal: el ciclo que vuelve a
         imprimir al final no forma parte de la prueba de escritorio. */
      let lineaCiclo = null, abierta = false;
      st.traza.pasos.forEach(p => {
        if (p.evento === 'iteracion' && (p.pila || []).length <= 1) {
          if (lineaCiclo === null) lineaCiclo = p.linea;
          if (p.linea === lineaCiclo) {
            if (abierta) out.push({ n: p.n, fila: instantanea(p) });
            abierta = true;
          }
        }
        /* arrastrar todo lo que se vea, sea del marco que sea */
        specs.forEach(s => {
          if (s.tipo === 'var' && s.k in (p.vars || {})) acum[s.k] = p.vars[s.k];
        });
      });

      /* Si el algoritmo no tiene ciclo principal, se cae a un paso por
         cambio de estado para no dejar la hoja vacía. */
      if (!out.length) {
        let firma = null;
        st.traza.pasos.forEach(p => {
          specs.forEach(s => {
            if (s.tipo === 'var' && s.k in (p.vars || {})) acum[s.k] = p.vars[s.k];
          });
          const f = instantanea(p);
          const sig = f.join('|');
          if (sig === firma || f.every(x => x === '')) return;
          firma = sig;
          out.push({ n: p.n, fila: f });
        });
      }
      return out;
    }

    function hojaHtml(pActual) {
      const cols = spec.hoja || [];
      const filas = filasHoja();
      const resolver = st.hojaModo === 'resolver';
      return `<div class="tpanel">
        <h4>Hoja de prueba de escritorio</h4>
        <div class="btnrow" style="margin-bottom:8px">
          <span class="seg2" data-rol="hojamodo" role="group" aria-label="Modo de la hoja">
            <button type="button" data-v="ver" aria-pressed="${!resolver}">Ver</button>
            <button type="button" data-v="resolver" aria-pressed="${resolver}">Resolver</button>
          </span>
          ${resolver ? '<button type="button" class="btn sm" data-a="comprobar">Comprobar</button>' : ''}
        </div>
        <div class="hojawrap"><table class="hoja">
          <thead><tr><th>#</th>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>${filas.map((f, k) => `
            <tr data-paso="${f.n}" class="${!resolver && pActual && f.n <= pActual.n && (filas[k + 1] ? filas[k + 1].n > pActual.n : true) ? 'actual' : ''}">
              <td>${k + 1}</td>
              ${f.fila.map((v, c) => resolver
                ? `<td data-c="${c}" data-esperado="${esc(v)}"><input inputmode="numeric" aria-label="${esc(cols[c])} fila ${k + 1}"></td>`
                : `<td>${esc(v || '·')}</td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table></div>
        <p class="muted" style="margin-top:8px">${resolver
          ? 'Rellena la tabla y pulsa Comprobar. Cada celda errada te lleva al paso exacto donde se torció.'
          : 'Se llena sola, en el mismo formato de la hoja de respuestas del parcial.'}</p>
      </div>`;
    }

    function cablearHoja() {
      const seg = el.querySelector('[data-rol="hojamodo"]');
      if (seg) seg.querySelectorAll(':scope > button').forEach(b =>
        b.addEventListener('click', () => { st.hojaModo = b.dataset.v; pintarPaneles(pasoActual()); }));
      const comp = el.querySelector('[data-a="comprobar"]');
      if (comp) comp.addEventListener('click', comprobarHoja);
    }

    function comprobarHoja() {
      let bien = 0, mal = 0, vacias = 0;
      el.querySelectorAll('.hoja tbody td[data-c]').forEach(td => {
        const inp = td.querySelector('input');
        if (!inp) return;
        const esperado = (td.dataset.esperado || '').trim();
        const dado = (inp.value || '').trim().replace('.', ',');
        td.classList.remove('bien', 'mal');
        /* Sólo se califica lo que se respondió: dejar celdas en blanco no
           es fallar, es no haber llegado todavía. */
        if (dado === '') { if (esperado !== '') vacias++; return; }
        if (dado === esperado) { td.classList.add('bien'); bien++; }
        else {
          td.classList.add('mal'); mal++;
          const n = td.parentElement.dataset.paso;
          inp.title = 'Debía ser ' + esperado;
          if (!td.querySelector('button')) {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = 'ver paso';
            b.addEventListener('click', () => { st.vista = 'estado'; sincronizarSeg(); irA(+n); });
            td.appendChild(b);
          }
        }
      });
      nota({
        evento: 'comprobación',
        nota: bien + ' bien · ' + mal + ' mal' + (vacias ? ' · ' + vacias + ' sin responder' : '') + '.' +
          (mal ? ' Pulsa «ver paso» en una celda roja para ver dónde se torció.'
               : (vacias ? ' Todo lo que respondiste está bien.' : ' Prueba de escritorio perfecta.'))
      });
    }

    /* ---------- pintar un paso ---------- */

    function pasoActual() {
      return st.traza && st.traza.pasos[st.paso];
    }

    function aplicarPaso(n) {
      if (!st.traza || !st.traza.pasos.length) return;
      st.paso = Math.max(0, Math.min(n, st.traza.pasos.length - 1));
      const p = st.traza.pasos[st.paso];

      const cont = el.querySelector('[data-rol="codigo"]');
      if (cont) {
        const prev = cont.querySelector('.ln.activa');
        if (prev) prev.classList.remove('activa', 'errada');
        const ln = cont.querySelector('.ln[data-l="' + p.linea + '"]');
        if (ln) {
          ln.classList.add('activa');
          if (p.evento === 'error') ln.classList.add('errada');
          const cr = cont.getBoundingClientRect(), lr = ln.getBoundingClientRect();
          if (lr.top < cr.top + 16 || lr.bottom > cr.bottom - 16)
            cont.scrollTop += lr.top - cr.top - cr.height / 2;
        }
      }

      pintarPaneles(p);
      nota(p);

      const barra = el.querySelector('[data-rol="barra"]');
      if (barra) barra.value = String(st.paso);
      const cnt = el.querySelector('[data-rol="contador"]');
      if (cnt) cnt.textContent = (st.paso + 1) + ' / ' + st.traza.pasos.length;
      const atras = el.querySelector('[data-a="atras"]'), ade = el.querySelector('[data-a="adelante"]');
      if (atras) atras.disabled = st.paso === 0;
      if (ade) ade.disabled = st.paso >= st.traza.pasos.length - 1;
    }

    function nota(p) {
      const n = el.querySelector('[data-rol="nota"]');
      if (!n) return;
      n.classList.toggle('error', p.evento === 'error');
      n.innerHTML = `<span class="ev">${esc(p.evento || '')}</span>
        <span>${esc(p.nota || '')}${p.sugerencia ? ' <span class="sug">' + esc(p.sugerencia) + '</span>' : ''}</span>`;
    }

    /* ---------- control ---------- */

    function irA(n) { pausar(); aplicarPaso(n); }

    function reproducir() {
      if (!st.traza) return;
      if (st.paso >= st.traza.pasos.length - 1) st.paso = 0;
      st.corriendo = true;
      marcarPlay();
      clearInterval(st.timer);
      st.timer = setInterval(() => {
        if (st.paso >= st.traza.pasos.length - 1) { pausar(); return; }
        aplicarPaso(st.paso + 1);
      }, st.velocidad);
      (AYP._timers = AYP._timers || []).push(st.timer);
    }
    function pausar() {
      st.corriendo = false;
      clearInterval(st.timer); st.timer = null;
      marcarPlay();
    }
    function marcarPlay() {
      const b = el.querySelector('[data-a="play"]');
      if (!b) return;
      b.innerHTML = st.corriendo ? (icon('pause') || '❚❚') : (icon('play') || '▶');
      b.setAttribute('aria-label', st.corriendo ? 'Pausar' : 'Reproducir');
    }

    function sincronizarSeg() {
      const seg = el.querySelector('[data-rol="vista"]');
      if (seg) seg.querySelectorAll(':scope > button').forEach(b =>
        b.setAttribute('aria-pressed', String(b.dataset.v === st.vista)));
    }

    /* ---------- cableado ---------- */
    function cablear() {
      el.querySelectorAll('[data-rol="ctl"] .iconbtn').forEach(b => {
        b.addEventListener('click', () => {
          const a = b.dataset.a;
          if (a === 'play') { st.corriendo ? pausar() : reproducir(); }
          else if (a === 'atras') irA(st.paso - 1);
          else if (a === 'adelante') irA(st.paso + 1);
          else if (a === 'reset') irA(0);
          else if (a === 'final') irA(st.traza.pasos.length - 1);
        });
      });
      const barra = el.querySelector('[data-rol="barra"]');
      if (barra) barra.addEventListener('input', () => irA(+barra.value));
      const vel = el.querySelector('[data-rol="vel"]');
      if (vel) vel.addEventListener('change', () => {
        st.velocidad = +vel.value;
        if (st.corriendo) reproducir();
      });

      const segD = el.querySelector('[data-rol="dialecto"]');
      if (segD) segD.querySelectorAll(':scope > button').forEach(b =>
        b.addEventListener('click', () => {
          if (st.dialecto === b.dataset.v) return;
          fijarDialecto(b.dataset.v);
          segD.querySelectorAll(':scope > button').forEach(x =>
            x.setAttribute('aria-pressed', String(x.dataset.v === st.dialecto)));
          pintarCodigo();
          const b2 = el.querySelector('[data-rol="barra"]');
          if (b2) b2.max = String(Math.max(0, st.traza.pasos.length - 1));
          aplicarPaso(Math.min(st.paso, st.traza.pasos.length - 1));
        }));

      const segV = el.querySelector('[data-rol="vista"]');
      if (segV) segV.querySelectorAll(':scope > button').forEach(b =>
        b.addEventListener('click', () => {
          st.vista = b.dataset.v; sincronizarSeg(); pintarPaneles(pasoActual());
        }));

      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' && e.target.type !== 'range') return;
        const k = e.key;
        if (k === ' ') { e.preventDefault(); st.corriendo ? pausar() : reproducir(); }
        else if (k === 'ArrowRight') { e.preventDefault(); irA(st.paso + 1); }
        else if (k === 'ArrowLeft') { e.preventDefault(); irA(st.paso - 1); }
        else if (k === 'r' || k === 'R') { e.preventDefault(); irA(0); }
        else if (k === 'Home') { e.preventDefault(); irA(0); }
        else if (k === 'End') { e.preventDefault(); irA(st.traza.pasos.length - 1); }
      });
    }

    return {
      irA, reproducir, pausar,
      get paso() { return st.paso; },
      get traza() { return st.traza; },
      destruir() { pausar(); el.remove(); }
    };
  }

  /* Monta todos los [data-traza] de un contenedor a partir de un catálogo */
  function montarTodos(host, catalogo) {
    host.querySelectorAll('[data-traza]').forEach(n => {
      const spec = catalogo[n.dataset.traza];
      if (spec) montar(n, spec);
    });
  }

  AYP.Traza = { montar, montarTodos };
})();
