/* ============================================================
   views-tools.js — tarjetero, drills, cronograma, simulacro,
   exámenes reales, ejercicios del manual y banco de trabajo.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.views = AYP.views || {};
  const M = () => AYP.model, S = () => AYP.Store, U = () => AYP.ui;
  const I = (n, c) => AYP.icon(n, c);
  const esc = s => U().esc(s);
  const inl = s => U().inl(s);
  const DIAS3 = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

  const cab = (c, titulo, lead, pill) =>
    U().crumbs([['Portada', '#/'], [`Corte ${c.num}`, `#/corte/${c.num}`], [titulo, '']]) +
    U().hero({ titulo, lead, pill: pill || `Corte ${c.num} · ${c.titulo}` });

  const cronometrar = (fn, ms) => {
    const id = setTimeout(fn, ms);
    (AYP._timers = AYP._timers || []).push(id);
    return id;
  };

  /* ============================================================
     TARJETERO DE PATRONES
     ============================================================ */
  function patrones(c) {
    const ps = M().cortePatrones(c.num);
    const lista = ps.length ? ps : M().patrones();
    return {
      html: cab(c, 'Tarjetero de patrones',
        'Aquí no se memorizan fórmulas sino fragmentos reutilizables. Si reconoces el patrón, el ejercicio ya está medio resuelto.') +
        lista.map(p => `
        <div class="example" id="${esc(p.id)}">
          <div class="eh">
            <span class="tag">patrón</span>
            <span class="ex"><b>${esc(p.nombre)}</b></span>
            ${p.tema && M().tema(p.tema) ? `<a class="btn sm" href="#/corte/${c.num}/tema/${esc(p.tema)}">Ir al tema</a>` : ''}
          </div>
          <div class="eb">
            <p class="muted" style="margin-top:0">${inl(p.cuando)}</p>
            <pre class="codigo">${esc(p.codigo)}</pre>
            <p><strong>Clave.</strong> ${inl(p.clave)}</p>
            <p class="muted"><strong>Trampa.</strong> ${inl(p.trampa)}</p>
          </div>
        </div>`).join('') +
        `<div class="footer">${lista.length} patrones${ps.length ? ' de este corte' : ' de todo el semestre'}.</div>`,
      despues: null
    };
  }

  /* ============================================================
     DRILL DE ESTRUCTURA
     ============================================================ */
  function drill(c) {
    const banco = [];
    M().corteTemas(c.id).forEach(t => (t.banco || []).forEach(e => {
      if ((e.estructura || []).length) banco.push(e);
    }));
    const opciones = [...new Set(banco.flatMap(e => e.estructura))];

    return {
      html: cab(c, 'Reconocer la estructura',
        'Se muestra un enunciado y hay que decir, en segundos, qué estructura lo resuelve. No se pide el algoritmo: se pide el reflejo.') +
        (banco.length ? `<div id="drill"></div>`
          : `<div class="empty">${I('construction', 'xl')}<p>Este corte todavía no tiene ejercicios etiquetados.</p></div>`),
      despues(host) {
        if (!banco.length) return;
        const cont = host.querySelector('#drill');
        let i = 0, aciertos = 0, hechas = 0;
        const orden = banco.slice().sort(() => Math.random() - 0.5);
        pinta();

        function pinta() {
          if (i >= orden.length) {
            cont.innerHTML = `<div class="empty">${I('check', 'xl')}
              <p>Ronda terminada: ${aciertos} de ${hechas}.</p>
              <button type="button" class="btn primary" id="otra">Otra ronda</button></div>`;
            cont.querySelector('#otra').addEventListener('click', () => {
              i = 0; aciertos = 0; hechas = 0; orden.sort(() => Math.random() - 0.5); pinta();
            });
            return;
          }
          const e = orden[i];
          cont.innerHTML = `
            <div class="drill-card">
              <div class="ftag2">${i + 1} de ${orden.length}</div>
              <div class="dq">${esc(e.enunciado)}</div>
              <div class="drill-opts">${opciones.map(o =>
                `<button type="button" class="dopt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>
              <p id="fb" style="min-height:24px;margin:16px 0 0"></p>
              <div class="drill-score"><span>Aciertos <b>${aciertos}</b></span><span>Hechas <b>${hechas}</b></span></div>
            </div>`;
          cont.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => {
            const ok = e.estructura.indexOf(b.dataset.o) >= 0;
            hechas++;
            if (ok) aciertos++;
            b.classList.add(ok ? 'right' : 'wrong');
            cont.querySelectorAll('[data-o]').forEach(x => {
              x.disabled = true;
              if (!ok && e.estructura.indexOf(x.dataset.o) >= 0) x.classList.add('right');
            });
            cont.querySelector('#fb').innerHTML = ok
              ? `<span style="color:var(--green)">Correcto.</span> Vale cualquiera de: ${esc(e.estructura.join(', '))}`
              : `<span style="color:var(--red)">No.</span> Era: ${esc(e.estructura.join(', '))}`;
            cronometrar(() => { i++; pinta(); }, ok ? 1000 : 1800);
          }));
        }
      }
    };
  }

  /* ============================================================
     DRILL DE TRAZA — predecir el siguiente estado
     ============================================================ */
  function drillTraza(c) {
    const ejs = M().ejemplos(c.id).filter(e => e.codigo);
    return {
      html: cab(c, 'Predecir el siguiente estado',
        'Es exactamente lo que califica el punto de prueba de escritorio: la traza se detiene y hay que decir cuánto vale una variable. Las preguntas las genera el motor a partir de la ejecución real, así que nunca se acaban.') +
        (ejs.length ? '<div id="dt"></div>'
          : `<div class="empty">${I('construction', 'xl')}<p>Este corte todavía no tiene ejemplos ejecutables.</p></div>`),
      despues(host) {
        if (!ejs.length) return;
        const cont = host.querySelector('#dt');
        const P = AYP.pseudo;
        let aciertos = 0, hechas = 0;
        siguiente();

        function siguiente() {
          let intento = 0, elegido = null;
          while (intento++ < 40 && !elegido) {
            const e = ejs[Math.floor(Math.random() * ejs.length)];
            const prog = P.compilar(e.codigo);
            if (prog.errores.length) continue;
            const r = P.ejecutar(prog, { entradas: (e.entradas || []).slice(), precarga: e.precarga || {} });
            if (r.error || r.pasos.length < 6) continue;
            /* Sólo sirven las asignaciones cuyo valor hay que CALCULAR:
               preguntar por `INI ← 1` no entrena nada. */
            const lineas = e.codigo.split('\n');
            const literal = n => /^\s*[\wÀ-ÿ_]+\s*(←|<-)\s*-?\d+(?:[.,]\d+)?\s*$/.test(lineas[n - 1] || '');
            const cands = r.pasos.map((p, k) => ({ p, k })).filter(x =>
              x.k > 2 && x.k < r.pasos.length - 1 && x.p.evento === 'asignacion' && x.p.cambio &&
              typeof x.p.cambio.ahora === 'number' && !literal(x.p.linea));
            if (!cands.length) continue;
            const jugosos = cands.filter(x => typeof x.p.cambio.antes === 'number');
            const pool = jugosos.length ? jugosos : cands;
            elegido = { e, r, pick: pool[Math.floor(Math.random() * pool.length)] };
          }
          if (!elegido) { cont.innerHTML = `<div class="empty"><p>No se pudo generar una pregunta.</p></div>`; return; }

          const { e, r, pick } = elegido;
          const antes = r.pasos[pick.k - 1];
          const vble = pick.p.cambio.nombre;
          const resp = pick.p.cambio.ahora;

          cont.innerHTML = `
            <div class="example">
              <div class="eh"><span class="tag">traza</span>
                <span class="ex">${esc(e.temaTitulo || '')}</span>
                <span class="pcount">${aciertos} de ${hechas}</span></div>
              <div class="eb">
                <p style="margin-top:0">La ejecución va por la línea <b>${pick.p.linea}</b>.
                Éste es el estado <em>justo antes</em> de ejecutarla:</p>
                <pre class="codigo">${esc(contexto(e.codigo, pick.p.linea))}</pre>
                <table class="tvars" style="max-width:340px">${Object.keys(antes.vars).map(k =>
                  `<tr><td class="k">${esc(k.toUpperCase())}</td><td class="v">${esc(P.texto(antes.vars[k]))}</td></tr>`).join('')}</table>
                <p style="margin:16px 0 6px">¿Cuánto valdrá <b>${esc(vble.toUpperCase())}</b> después de esa línea?</p>
                <div class="btnrow">
                  <input id="resp" inputmode="decimal" placeholder="valor" aria-label="Valor de ${esc(vble)}"
                    style="width:140px;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-family:var(--mono)">
                  <button type="button" class="btn primary" id="ok">Comprobar</button>
                  <button type="button" class="btn" id="skip">Otra</button>
                </div>
                <p id="fb" style="min-height:24px;margin:14px 0 0"></p>
              </div>
            </div>`;

          const inp = cont.querySelector('#resp');
          inp.focus();
          const comprobar = () => {
            const dado = (inp.value || '').trim().replace(',', '.');
            if (dado === '') return;
            hechas++;
            const bien = Math.abs(parseFloat(dado) - resp) < 1e-9;
            if (bien) aciertos++;
            cont.querySelector('#fb').innerHTML = bien
              ? `<span style="color:var(--green)">Correcto.</span> ${esc(pick.p.nota || '')}`
              : `<span style="color:var(--red)">No.</span> Era ${esc(P.texto(resp))}. ${esc(pick.p.nota || '')}`;
            cont.querySelector('#ok').disabled = true;
            cronometrar(siguiente, bien ? 1100 : 2600);
          };
          cont.querySelector('#ok').addEventListener('click', comprobar);
          inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') comprobar(); });
          cont.querySelector('#skip').addEventListener('click', siguiente);
        }

        function contexto(src, n) {
          const ls = src.split('\n');
          const a = Math.max(0, n - 3), b = Math.min(ls.length, n + 1);
          return ls.slice(a, b).map((l, k) => (a + k + 1 === n ? '▸ ' : '  ') + l).join('\n');
        }
      }
    };
  }

  /* ============================================================
     CRONOGRAMA — agrupado por corte, sin recesos ni columnas vacías
     ============================================================ */
  function cronograma(c) {
    const hoy = M().hoy();
    const grupos = M().cortes().map(co => {
      const filas = M().semanasCorte(co.id).map(s => {
        const act = hoy >= s.ini && hoy <= s.fin;
        const ev = s.hito ? M().meta().evaluacion.find(e => e.id === s.hito) : null;
        const ses = M().sesiones(s);
        return `<tr class="${act ? 'actual' : ''}">
          <td class="mono">S${s.n}</td>
          <td style="text-align:left">${esc(M().rango(s.ini, s.fin))}</td>
          <td style="text-align:left">${esc(s.tema)}
            ${ev ? `<span class="cronrow-flag exam">${esc(ev.nombre)} · ${ev.pct} %</span>` : ''}</td>
          <td class="sesiones">${ses.map(x => `${DIAS3[x.fecha.getDay()]} ${esc(M().fecha(x.iso))} <i>${x.ini}</i>`).join(' · ')}</td>
        </tr>`;
      }).join('');
      if (!filas) return '';
      return `<h3${co.id === c.id ? ' id="aqui"' : ''}>Corte ${co.num} · ${esc(co.titulo)}</h3>
        <div class="tablewrap"><table>
          <thead><tr><th>Semana</th><th>Fechas</th><th>Tema</th><th>Sesiones</th></tr></thead>
          <tbody>${filas}</tbody></table></div>`;
    }).join('');

    return {
      html: cab(c, 'Cronograma',
        `Las semanas de clase del semestre con sus sesiones reales, según tu horario: **${M().horarioTxt()}**.`) +
        grupos,
      despues: null
    };
  }

  /* ============================================================
     SIMULACRO
     ============================================================ */
  function simulacro(c) {
    const banco = [];
    M().corteTemas(c.id).forEach(t => (t.banco || []).forEach(e =>
      banco.push(Object.assign({ tema: t.id, temaTitulo: t.titulo }, e))));

    const puntos = c.plantilla.map(pl => {
      const tp = M().tema(pl.tema);
      const quiere = tp ? (tp.patrones || []) : [];
      const cand = banco.filter(e => (e.estructura || []).some(x => quiere.indexOf(x) >= 0));
      const pool = cand.length ? cand : banco;
      return { pl, ej: pool[Math.floor(Math.random() * pool.length)] };
    }).filter(p => p.ej);

    const mins = c.meta.id.indexOf('parcial') === 0 ? 90 : 60;
    const st = S().simStats(c.id);
    const pts = (5 / Math.max(1, puntos.length)).toFixed(1).replace('.', ',');

    return {
      html: cab(c, 'Simulacro',
        `La plantilla real de ${c.meta.nombre}, con cronómetro. Se resuelve **en papel**: aquí sólo están los enunciados y el reloj.`) + `
      <div class="simhead">
        <span class="clock" id="reloj">${mins}:00</span>
        <span class="lbl">${puntos.length} puntos · ${mins} minutos${st.veces ? ' · lo has hecho ' + st.veces + ' ' + U().plural(st.veces, 'vez', 'veces') : ''}
          ${st.best !== null ? ' · mejor tiempo ' + st.best + ' min' : ''}</span>
        <span style="flex:1"></span>
        <button type="button" class="btn primary" id="arrancar">Empezar</button>
        <button type="button" class="btn" id="entregar" disabled>Entregar</button>
      </div>

      ${puntos.map((p, k) => `
        <div class="simq">
          <div class="sqh">
            <span class="sqn">${k + 1}</span>
            <span class="sqt">${esc(p.pl.et)}</span>
            <span class="pcount">${pts} pts</span>
          </div>
          <div class="sqb">
            <div class="sqe">${esc(p.ej.enunciado)}</div>
            <div class="bmeta2">
              ${(p.ej.estructura || []).map(x => `<span class="fchip">${esc(x)}</span>`).join('')}
            </div>
            <details style="margin-top:12px"><summary class="muted">Pista y tema</summary>
              <p class="muted">${esc(p.ej.pista || 'Sin pista.')} ·
              <a href="#/corte/${c.num}/tema/${esc(p.ej.tema)}">${esc(p.ej.temaTitulo)}</a></p>
            </details>
          </div>
        </div>`).join('')}

      <div class="callout trap"><div class="ct">${I('target')}Antes de entregar</div>
        <p>${inl(c.checklist)}</p></div>
      <div class="btnrow"><button type="button" class="btn" id="otro">Generar otro simulacro</button></div>`,

      despues(host) {
        let seg = mins * 60, id = null, corriendo = false;
        const reloj = host.querySelector('#reloj');
        const pinta = () => {
          reloj.textContent = Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0');
          reloj.classList.toggle('low', seg < 300);
        };
        host.querySelector('#arrancar').addEventListener('click', e => {
          if (corriendo) { clearInterval(id); corriendo = false; e.target.textContent = 'Seguir'; return; }
          corriendo = true; e.target.textContent = 'Pausar';
          host.querySelector('#entregar').disabled = false;
          id = setInterval(() => { if (seg > 0) { seg--; pinta(); } else clearInterval(id); }, 1000);
          (AYP._timers = AYP._timers || []).push(id);
        });
        host.querySelector('#entregar').addEventListener('click', () => {
          clearInterval(id);
          S().simRecord(c.id, Math.round((mins * 60 - seg) / 60));
          reloj.textContent = 'entregado';
          reloj.classList.remove('low');
        });
        host.querySelector('#otro').addEventListener('click', () => AYP.router.resolver());
      }
    };
  }

  /* ============================================================
     EXÁMENES REALES
     ============================================================ */
  function examenes(c) {
    const exs = (AYP.data.examenes || []).filter(e => !e.corte || e.corte === c.id);
    if (!exs.length) return {
      html: cab(c, 'Exámenes reales', 'Transcritos punto por punto, con lo que pide cada uno y cómo se falla.') +
        `<div class="empty">${I('history', 'xl')}
          <p>Todavía no hay ningún examen transcrito de este corte.</p>
          <a class="btn" href="#/corte/3/examen">Ver el del Corte 3</a></div>`,
      despues: null
    };
    return {
      html: cab(c, 'Exámenes reales', 'Transcritos punto por punto, con lo que pide cada uno y cómo se falla.') +
        exs.map(e => `
        <h2>${esc(e.nombre)} · ${esc(e.periodo)}</h2>
        <p class="section-intro">${esc(e.nota)}</p>
        ${e.puntos.map(p => `
          <div class="simq">
            <div class="sqh">
              <span class="sqn">${p.n}</span>
              <span class="sqt">${esc(p.tipo)}</span>
              <span class="pcount">vale ${String(p.valor).replace('.', ',')}</span>
            </div>
            <div class="sqb">
              <div class="sqe">${esc(p.enunciado)}</div>
              ${p.literales ? `<ul>${p.literales.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
              ${p.ejemploDatos ? `<pre class="codigo">${esc(p.ejemploDatos)}</pre>` : ''}
              <p><strong>Qué pide.</strong> ${inl(p.quePide)}</p>
              <div class="callout trap"><div class="ct">${I('warning')}Cómo se falla</div>
                <ul>${p.comoSeFalla.map(x => `<li>${inl(x)}</li>`).join('')}</ul></div>
              ${p.nota ? `<p class="muted">${inl(p.nota)}</p>` : ''}
              <div class="btnrow">
                ${p.tema && M().tema(p.tema) ? `<a class="btn sm" href="#/corte/${c.num}/tema/${esc(p.tema)}">Ir al tema</a>` : ''}
                ${p.ejemplo && p.tema ? `<a class="btn sm primary" href="#/corte/${c.num}/tema/${esc(p.tema)}/ver">${I('play')}Verlo ejecutarse</a>` : ''}
              </div>
            </div>
          </div>`).join('')}`).join(''),
      despues: null
    };
  }

  /* ============================================================
     EJERCICIOS PROPUESTOS DEL MANUAL
     ============================================================ */
  function propuestos(c) {
    const todos = AYP.data.propuestos || [];
    const mios = todos.filter(p => p.corte === c.num);
    const lista = mios.length ? mios : todos;
    const grupos = {};
    lista.forEach(p => { (grupos[p.grupo] = grupos[p.grupo] || []).push(p); });
    const conSol = lista.filter(p => p.solucion).length;
    const ests = [...new Set(lista.flatMap(e => e.estructura || []))].sort();
    let n = 0;

    return {
      html: cab(c, 'Ejercicios del manual',
        `Los que el profesor tiene a mano para exámenes y talleres. ${lista.length} de este corte, ${conSol} con solución en pseudocódigo que se ejecuta aquí mismo.`) +
        U().filtrosBanco(ests) +
        Object.keys(grupos).map(g => `
          <h3>${esc(g)}</h3>
          <div class="bank">${grupos[g].map(p =>
            U().bancoFila(p, ++n, { etiqueta: String(p.n).padStart(2, '0') })).join('')}</div>`).join(''),
      despues(host) {
        U().wireBanco(host, id => (AYP.data.propuestos || []).find(x => x.id === id),
          () => AYP.app.refrescarRail());
        U().wireFiltros(host);
      }
    };
  }

  /* ============================================================
     BANCO DE TRABAJO
     ============================================================ */
  const EJEMPLO_INICIAL = `INICIO
    LEA N
    PARA I = 1, N, 1 HAGA
        LEA V(I)
    F-PARA
    MAY ← V(1)
    PARA I = 2, N, 1 HAGA
        SI (V(I) > MAY) ENTONCES
            MAY ← V(I)
        F-SI
    F-PARA
    ESCRIBA "El mayor elemento es", MAY
FIN`;

  function laboratorio() {
    const guardado = localStorage.getItem('aypii_lab') || EJEMPLO_INICIAL;
    const entradas = localStorage.getItem('aypii_lab_in') || '6, 12, 7, 30, 4, 30, 19';
    return {
      html: U().crumbs([['Portada', '#/'], ['Banco de trabajo', '']]) +
        U().hero({
          pill: 'la puerta por la que entra todo',
          titulo: 'Banco de trabajo',
          lead: 'Pega cualquier pseudocódigo —el del tablero, el de un parcial viejo, el tuyo— y velo ejecutarse paso a paso.'
        }) + `
      <div class="codigo-head"><span class="et">Pseudocódigo</span>
        <button type="button" class="btn sm" id="limpiar">Vaciar</button>
        <button type="button" class="btn sm" id="restaurar">Ejemplo</button>
      </div>
      <textarea class="editor" id="src" spellcheck="false" aria-label="Pseudocódigo a ejecutar">${esc(guardado)}</textarea>

      <div class="codigo-head"><span class="et">Entradas para los LEA, separadas por comas</span></div>
      <input id="ent" value="${esc(entradas)}" aria-label="Entradas separadas por comas"
        style="width:100%;padding:9px 12px;border:1px solid var(--border2);border-radius:var(--radius);font-family:var(--mono);font-size:var(--fs-sm);background:var(--bg)">
      <p class="muted" style="margin:6px 0 0">Los textos van entre comillas: <code class="inl">'argentina', 4</code>.
      Se consumen en el orden en que aparecen los <code class="inl">LEA</code>.</p>

      <div class="btnrow" style="margin-top:14px">
        <button type="button" class="btn primary" id="correr">${I('play')}Ejecutar</button>
        <span class="muted" id="estado"></span>
      </div>

      <div id="salida" style="margin-top:16px"></div>`,

      despues(host) {
        const src = host.querySelector('#src');
        const ent = host.querySelector('#ent');
        const out = host.querySelector('#salida');
        const estado = host.querySelector('#estado');

        host.querySelector('#limpiar').addEventListener('click', () => { src.value = ''; src.focus(); });
        host.querySelector('#restaurar').addEventListener('click', () => { src.value = EJEMPLO_INICIAL; correr(); });
        host.querySelector('#correr').addEventListener('click', correr);
        src.addEventListener('keydown', e => {
          if (e.key === 'Tab') { e.preventDefault(); insertar('    '); }
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); correr(); }
        });
        correr();

        function insertar(t) {
          const a = src.selectionStart, b = src.selectionEnd;
          src.value = src.value.slice(0, a) + t + src.value.slice(b);
          src.selectionStart = src.selectionEnd = a + t.length;
        }

        function parseEntradas(txt) {
          if (!txt.trim()) return [];
          return txt.split(',').map(x => {
            const t = x.trim();
            if (/^'.*'$/.test(t) || /^".*"$/.test(t)) return t.slice(1, -1);
            const n = Number(t.replace(',', '.'));
            return isNaN(n) ? t : n;
          });
        }

        function correr() {
          localStorage.setItem('aypii_lab', src.value);
          localStorage.setItem('aypii_lab_in', ent.value);
          out.innerHTML = '';
          const spec = { titulo: 'Tu pseudocódigo', fuente: src.value, entradas: parseEntradas(ent.value), hoja: null };
          const prog = AYP.pseudo.compilar(src.value);
          if (!prog.errores.length) {
            const r = AYP.pseudo.ejecutar(prog, { entradas: spec.entradas.slice() });
            const cols = new Set();
            r.pasos.forEach(p => Object.keys(p.vars || {}).forEach(k => cols.add(k)));
            spec.hoja = [...cols].slice(0, 8).map(k => k.toUpperCase());
            estado.textContent = r.error
              ? 'Se detuvo en la línea ' + r.error.linea
              : r.pasos.length + ' pasos · profundidad máxima ' + r.resumen.profundidadMax;
          } else {
            estado.textContent = prog.errores.length + ' ' + U().plural(prog.errores.length, 'error', 'errores') + ' de sintaxis';
          }
          AYP.Traza.montar(out, spec);
        }
      }
    };
  }

  Object.assign(AYP.views, {
    patrones, drill, drillTraza, cronograma, simulacro, examenes, propuestos, laboratorio
  });
})();
