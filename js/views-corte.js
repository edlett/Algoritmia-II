/* ============================================================
   views-corte.js — portada, ruta del corte, tema y meta.
   Cada vista devuelve { html, despues }; `despues` recibe #main.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  AYP.views = AYP.views || {};
  const M = () => AYP.model, S = () => AYP.Store, U = () => AYP.ui;
  const I = (n, c) => AYP.icon(n, c);
  const esc = s => U().esc(s);
  const inl = s => U().inl(s);

  const DIAS3 = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

  function error(msg) {
    return `<div class="empty">${I('error', 'xl')}<p>${esc(msg)}</p>
      <a class="btn" href="#/">Volver a la portada</a></div>`;
  }

  /* ============================================================
     PORTADA — responde tres preguntas y ninguna más:
     ¿estás al día? · ¿por dónde entro? · ¿qué viene y cuándo?
     ============================================================ */
  function portada() {
    const p = M().pendientes();
    const sem = p.semana;
    const clase = M().proximaClase();
    const def = M().definitiva();
    const nec = M().necesita();
    const notas = M().notas();
    const ag = M().agenda(7);
    const pl = U().plural, n1 = U().n1, num = U().num;

    const listar = ts => ts.slice(0, 3).map(t => esc(t.titulo)).join(' · ') +
      (ts.length > 3 ? ` y ${ts.length - 3} más` : '');

    /* ---- tarjetas de «qué me falta»: sólo las que tienen algo que decir ---- */
    const tarjetas = [];
    if (p.atrasados.length) tarjetas.push({
      cls: 'urgente', k: 'Atrasado', v: `${p.atrasados.length} ${pl(p.atrasados.length, 'tema', 'temas')}`,
      d: listar(p.atrasados), h: `#/corte/${p.corte.num}/tema/${p.atrasados[0].id}`
    });
    if (p.estaSemana.length) tarjetas.push({
      cls: 'ahora', k: 'Esta semana', v: `${p.estaSemana.length} ${pl(p.estaSemana.length, 'tema', 'temas')}`,
      d: listar(p.estaSemana), h: `#/corte/${p.corte.num}/tema/${p.estaSemana[0].id}`
    });
    if (p.faltan) tarjetas.push({
      cls: '', k: 'Ejercicios del corte', v: `${p.ej.mastered}/${p.ej.total}`,
      d: `faltan ${p.faltan} para el 80 %${p.dias > 0 ? ` · ${p.ritmo} al día` : ''}`,
      h: `#/corte/${p.corte.num}/propuestos`
    });
    if (p.dias !== null && p.dias >= 0) tarjetas.push({
      cls: p.dias <= 7 ? 'urgente' : '', k: p.corte.meta.nombre,
      v: p.dias === 0 ? 'es hoy' : `${p.dias} días`,
      d: p.corte.meta.ventanaTxt, h: `#/corte/${p.corte.num}/meta`
    });
    if (p.proxima.length) tarjetas.push({
      cls: 'futuro', k: 'Viene después', v: sem ? `Semana ${sem.n + 1}` : 'Lo siguiente',
      d: listar(p.proxima), h: `#/corte/${p.corte.num}`
    });

    const ICONO = { meta: 'flag', lab: 'grid', proyecto: 'tool', tema: 'article' };

    /* ---- las cuatro tarjetas de corte ---- */
    const cortes = M().cortes().map(c => {
      const pt = M().temasCorte(c.id);
      const ej = S().stats(M().corteBanco(c.id));
      const d = M().diasPara(c);
      const activo = c.id === p.corte.id;
      const pasado = d !== null && d < 0;
      return `<article class="cortecard${activo ? ' now' : ''}">
        ${U().ilu(c.num, 'cc-illu')}
        <div class="cc-top">
          <div style="min-width:0">
            <div class="cc-k">Corte ${c.num}${activo ? ' · en curso' : pasado ? ' · cerrado' : ''}</div>
            <h3><a href="#/corte/${c.num}">${esc(c.titulo)}</a></h3>
          </div>
          ${U().ring(pt.pct, { size: 44, stroke: 4, mastered: pt.pct === 100 })}
        </div>
        <div class="cc-sub">${esc(c.resumenCorto)}</div>
        <div class="cc-meta">
          <span class="chip">S${c.semanas[0]}–${c.semanas[1]}</span>
          <span class="chip">${c.horas} h</span>
          <span class="chip"><b>${esc(c.meta.nombre)}</b> ${c.meta.pct} %</span>
        </div>
        <div class="cc-spacer"></div>
        <div class="trackbar"><i style="width:${pt.pct}%"></i></div>
        <div class="cc-foot">
          <span>${pt.done}/${pt.total} temas · ${ej.mastered}/${ej.total} ejercicios</span>
          <span>${d === null ? '' : pasado ? 'ya pasó' : d === 0 ? 'hoy' : 'en ' + d + ' d'}</span>
        </div>
      </article>`;
    }).join('');

    /* ---- las notas del semestre ---- */
    const filas = M().meta().evaluacion.map(e => {
      const c = M().cortes().find(x => x.num === e.corte);
      const v = notas[e.id];
      return `<div class="evrow">
        <span class="evn">${c ? `<a href="#/corte/${c.num}/meta">${esc(e.nombre)}</a>` : esc(e.nombre)}</span>
        <span class="evp">${e.pct} %</span>
        <input type="number" min="0" max="5" step="0.1" inputmode="decimal" data-nota="${e.id}"
          value="${typeof v === 'number' ? v : ''}" placeholder="—" aria-label="Nota de ${esc(e.nombre)}">
      </div>`;
    }).join('');

    return {
      html: `
      ${U().hero({
        ilu: p.corte.num,
        pill: sem ? (sem.pausa ? 'sin clases esta semana' : `semana ${sem.n} de 16`) : 'el semestre aún no empieza',
        titulo: 'Algoritmia y Programación II',
        lead: 'La materia se aprueba en pseudocódigo. Aquí se estudia **viéndolo ejecutarse**: cada algoritmo corre de verdad, paso a paso, con su hoja de prueba de escritorio.',
        chips: [
          clase ? ['Próxima clase', `${DIAS3[clase.fecha.getDay()]} ${M().fecha(clase.iso)} · ${clase.ini}`] : null,
          ['Próxima meta', `${p.corte.meta.nombre} · ${p.dias !== null && p.dias > 0 ? 'en ' + p.dias + ' días' : p.corte.meta.ventanaTxt}`],
          ['Temas', `${M().temas().length} en el semestre`]
        ].filter(Boolean)
      })}

      <section class="today">
        <div class="today-h">
          <span class="today-badge ${p.alDia ? 'ok' : 'warn'}">
            ${I(p.alDia ? 'check' : 'warning')}${p.alDia ? 'Estás al día'
              : `${p.atrasados.length} ${pl(p.atrasados.length, 'tema atrasado', 'temas atrasados')}`}</span>
          <span class="today-sub">Corte ${p.corte.num} · ${esc(p.corte.titulo)}</span>
        </div>
        ${tarjetas.length ? `<div class="today-grid">${tarjetas.map(t => `
          <a class="tcard ${t.cls}" href="${t.h}">
            <span class="tk">${esc(t.k)}</span><b>${esc(t.v)}</b><small>${esc(t.d)}</small>
          </a>`).join('')}</div>`
        : `<p class="muted">No queda nada pendiente en este corte. Lo siguiente es el simulacro cronometrado.</p>`}
      </section>

      <h2>Los cuatro cortes</h2>
      <div class="corte-grid">${cortes}</div>

      <h2>Lo que viene</h2>
      <p class="section-intro">Sólo lo que cambia lo que tienes que hacer: evaluaciones y temas nuevos.</p>
      <div class="agenda">${ag.length ? ag.map(a => `
        <a class="ag ${a.tipo}" href="${a.href}">
          <span class="agi">${I(ICONO[a.tipo] || 'article')}</span>
          <span class="agd"><b>${esc(M().fecha(a.iso))}</b><small>${DIAS3[a.fecha.getDay()]}</small></span>
          <span class="agt"><b>${esc(a.titulo)}</b><small>${esc(a.detalle)}</small></span>
          <span class="agc">${a.dias === 0 ? 'hoy' : a.dias === 1 ? 'mañana' : 'en ' + a.dias + ' d'}</span>
        </a>`).join('') : `<p class="muted" style="padding:14px">No queda ninguna fecha por delante.</p>`}</div>

      <h2>Tu nota</h2>
      <div class="grades">
        <div class="grade-big">
          <span class="k">${def.pesoVisto ? 'Acumulado' : 'Sin notas todavía'}</span>
          <span class="v">${def.pesoVisto ? num(def.acum.toFixed(2)) : '—'}</span>
          <span class="t">${def.pesoVisto} % del semestre evaluado</span>
          ${nec !== null && def.pesoVisto > 0
            ? `<span class="t">Necesitas <b>${num(nec.toFixed(2))}</b> de promedio en lo que falta para llegar a ${n1(M().meta().aprueba)}.</span>`
            : `<span class="t">Anota cada nota al recibirla y verás qué te falta.</span>`}
        </div>
        <div class="grade-rows">${filas}</div>
      </div>

      <h2>Lo que el curso da por sabido</h2>
      <p class="section-intro">AyP II no repasa nada de esto, y las fallas se pagan desde el Parcial 1.</p>
      <ul>
        <li>Las tres estructuras de control: secuencia, condicional y ciclo.</li>
        <li>Que <code class="inl">←</code> asigna y <code class="inl">=</code> compara.</li>
        <li>Variables, tipos y el operador <code class="inl">MOD</code>.</li>
        <li>Leer y escribir con <code class="inl">LEA</code> y <code class="inl">ESCRIBA</code>.</li>
        <li>Que el <code class="inl">PARA</code> lleva tres partes: inicio, fin y paso.</li>
      </ul>

      <div class="footer">
        <b>Algoritmia y Programación II</b> · ${esc(M().meta().codigo)} · ${esc(M().meta().periodo)} ·
        Universidad del Norte. Todo tu progreso se guarda en este navegador.
        <details class="backup">
          <summary>${I('download')}Copia de seguridad</summary>
          <p class="muted">Tu progreso vive sólo aquí. Exporta un <code class="inl">.json</code> de vez en cuando,
          sobre todo antes de cambiar de navegador.</p>
          <div class="btnrow">
            <button type="button" class="btn sm" data-act="export">${I('download')}Exportar</button>
            <label class="btn sm">${I('upload')}Importar
              <input type="file" accept="application/json" data-act="import" class="sr-only"></label>
            <button type="button" class="btn sm danger" data-act="reset">${I('trash')}Borrar todo</button>
          </div>
          <p class="muted" data-msg role="status" aria-live="polite"></p>
        </details>
      </div>`,

      despues(host) {
        host.querySelectorAll('[data-nota]').forEach(inp => inp.addEventListener('change', () => {
          const v = inp.value === '' ? null : parseFloat(String(inp.value).replace(',', '.'));
          M().setNota(inp.dataset.nota, v);
          AYP.router.resolver();
        }));

        const msg = host.querySelector('[data-msg]');
        const ex = host.querySelector('[data-act="export"]');
        if (ex) ex.addEventListener('click', () => {
          const blob = new Blob([S().export()], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'aypii-progreso.json'; a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          msg.textContent = 'Progreso exportado.';
        });
        const im = host.querySelector('[data-act="import"]');
        if (im) im.addEventListener('change', e => {
          const f = e.target.files[0]; if (!f) return;
          const r = new FileReader();
          r.onload = () => {
            try { S().import(r.result); AYP.router.resolver(); }
            catch (err) { msg.textContent = 'No se pudo: ' + err.message; }
          };
          r.readAsText(f);
        });
        const rs = host.querySelector('[data-act="reset"]');
        if (rs) rs.addEventListener('click', () => {
          if (confirm('Se borrará todo tu progreso de esta materia. ¿Seguro?')) {
            S().reset(); AYP.router.resolver();
          }
        });
      }
    };
  }

  /* ============================================================
     RUTA DEL CORTE — la línea de tiempo de tus clases.
     ============================================================ */
  function corte(c) {
    const hoy = M().hoy();
    const pt = M().temasCorte(c.id);
    const ej = S().stats(M().corteBanco(c.id));
    const d = M().diasPara(c);
    const rec = M().recomendado(c.id);
    let n = 0;

    const ruta = M().semanasCorte(c.id).map(s => {
      const ts = (s.temas || []).map(id => M().tema(id)).filter(Boolean);
      const ahora = hoy >= s.ini && hoy <= s.fin;
      const pasada = hoy > s.fin;
      const hito = s.hito ? M().meta().evaluacion.find(e => e.id === s.hito) : null;
      const ses = M().sesiones(s);

      return `<div class="wknode${ahora ? ' now' : pasada ? ' done' : ''}">
        <div class="wkhead">
          <span class="wkn">SEMANA ${s.n}</span>
          <span class="wkd">${esc(M().rango(s.ini, s.fin))}</span>
          ${hito ? `<span class="wkflag acc">${I('flag')} ${esc(hito.nombre)} · ${hito.pct} %</span>` : ''}
        </div>
        <div class="wkt">${esc(s.tema)}</div>
        ${ses.length ? `<div class="wksess">${I('calendar')} ${ses.map(x =>
          `${DIAS3[x.fecha.getDay()]} ${esc(M().fecha(x.iso))} · ${x.ini}`).join('&nbsp;&nbsp;·&nbsp;&nbsp;')}</div>` : ''}
        ${ts.map(t => {
          const done = S().temaDone(t.unidad, t.id);
          const st = S().stats(M().temaBanco(t));
          const part = !done && st.touched > 0;
          n++;
          return `<article class="tema${done ? ' done' : part ? ' part' : ''}">
            <div class="th">
              <span class="tk">${done ? U().check : String(n).padStart(2, '0')}</span>
              <span class="tt"><a href="#/corte/${c.num}/tema/${t.id}">${esc(t.titulo)}</a>
                <small>${t.horas} h${t.manual ? ' · ' + esc(t.manual) : ''}</small></span>
              ${t.clave ? '<span class="badge acc">clave en la meta</span>' : ''}
              <span class="tprog"><span class="minibar"><i style="width:${st.pctMastered}%"></i></span>${st.mastered}/${st.total}</span>
              ${U().chev('tchev')}
            </div>
          </article>`;
        }).join('')}
      </div>`;
    }).join('');

    return {
      html: `
      ${U().crumbs([['Portada', '#/'], [`Corte ${c.num}`, '']])}
      ${U().hero({
        ilu: c.num,
        pill: `Corte ${c.num} de 4 · ${c.horas} h · ${c.pct} % de la definitiva`,
        pillCls: d !== null && d >= 0 ? 'violet' : '',
        titulo: c.titulo,
        lead: c.lead
      })}

      <div class="state-panel">
        <div class="sp">
          <div class="k">${d !== null && d < 0 ? 'La meta ya pasó' : 'Faltan para la meta'}</div>
          <div class="v">${d === null ? '—' : d < 0 ? '—' : d}${d !== null && d >= 0 ? '<small>días</small>' : ''}</div>
          <div class="t">${esc(c.meta.nombre)} · ${esc(c.meta.ventanaTxt)}</div>
        </div>
        <div class="sp">
          <div class="k">Temas dominados</div>
          <div class="v">${pt.done}<small>/${pt.total}</small></div>
          <div class="trackbar"><i style="width:${pt.pct}%"></i></div>
        </div>
        <div class="sp">
          <div class="k">Ejercicios dominados</div>
          <div class="v">${ej.mastered}<small>/${ej.total}</small></div>
          <div class="trackbar"><i style="width:${ej.pctMastered}%"></i></div>
        </div>
      </div>

      ${rec ? `<div class="callout nota"><div class="ct">${I('target')}Siguiente paso</div>
        <p><b>${esc(rec.titulo)}</b> — semana ${rec.semana}, ${rec.horas} h. ${esc(rec.resumen || '')}</p>
        <p><a class="btn primary sm" href="#/corte/${c.num}/tema/${rec.id}">${I('play')}Estudiar ahora</a></p></div>`
      : `<div class="callout nota"><div class="ct">${I('check')}Ruta completa</div>
        <p>Los ${pt.total} temas están marcados como dominados. Queda el simulacro cronometrado.</p></div>`}

      <h2 id="ruta">Las semanas, clase por clase</h2>
      <div class="ruta">${ruta}</div>

      <div class="gate-teaser">
        <div class="gt-txt">
          <div class="gt-k">La meta del corte</div>
          <div class="gt-n">${esc(c.meta.nombre)}</div>
          <div class="gt-d">${esc(c.meta.ventanaTxt)} · vale el ${c.meta.pct} % de la definitiva${
            d !== null && d >= 0 ? ` · faltan ${d} días` : ''}</div>
        </div>
        <a class="btn primary" href="#/corte/${c.num}/meta">Prepararse ${I('chevron')}</a>
      </div>

      <h2>Herramientas de este corte</h2>
      ${U().toolGrid(c)}

      <h2>Qué entra</h2>
      <p>${inl(c.alcance)}</p>

      <div class="footer"><b>Corte ${c.num} · ${esc(c.titulo)}</b> — ${esc(c.resumenCorto)}</div>`,
      despues: null
    };
  }

  /* ============================================================
     TEMA
     ============================================================ */
  function tema(c, t, pestana) {
    const ejs = t.ejemplos || [];
    const banco = t.banco || [];
    const vizs = (Array.isArray(t.viz) ? t.viz : (t.viz ? [t.viz] : []))
      .filter(v => AYP.Viz && AYP.Viz.existe(v));
    const ts = M().corteTemas(c.id);
    const i = ts.findIndex(x => x.id === t.id);
    const prev = ts[i - 1], next = ts[i + 1];
    const st = S().stats(M().temaBanco(t));
    const hecho = S().temaDone(t.unidad, t.id);

    const tabs = [
      ['teoria', 'Teoría', 'book', ''],
      vizs.length || ejs.length ? ['ver', 'Ver', 'chart', ''] : null,
      ['ejemplos', 'Ejemplos', 'article', ejs.length],
      ['ejercicios', 'Ejercicios', 'grid', banco.length]
    ].filter(Boolean);

    let cuerpo = '';

    if (pestana === 'teoria') {
      cuerpo = U().teoriaHtml(t.teoria) +
        ((t.patrones || []).length ? `<div class="divlabel">Patrones que usa</div><div class="btnrow">
          ${t.patrones.map(id => { const p = M().patron(id); return p
            ? `<a class="chip" href="#/corte/${c.num}/patrones#${id}">${esc(p.nombre)}</a>` : ''; }).join('')}
        </div>` : '') +
        `<div class="btnrow" style="margin-top:22px">
          ${vizs.length || ejs.length ? `<a class="btn primary" href="#/corte/${c.num}/tema/${t.id}/ver">${I('play')}Verlo funcionar</a>` : ''}
          ${banco.length ? `<a class="btn" href="#/corte/${c.num}/tema/${t.id}/ejercicios">Ir a los ${banco.length} ejercicios</a>` : ''}
        </div>`;
    }
    else if (pestana === 'ver') {
      const partes = [];
      vizs.forEach(v => partes.push(`<div data-viz="${esc(v)}"></div>`));
      if (ejs.length) partes.push(`<h3>El algoritmo, ejecutándose</h3>
        <p class="muted">Espacio reproduce y pausa; las flechas avanzan y retroceden.
        La pestaña «Hoja» es la prueba de escritorio tal como se pide en el examen.</p>
        <div data-traza="0"></div>`);
      cuerpo = partes.length ? partes.join('')
        : `<div class="empty">${I('play', 'xl')}<p>Este tema todavía no tiene nada que ver.</p></div>`;
    }
    else if (pestana === 'ejemplos') {
      cuerpo = ejs.length
        ? ejs.map((e, k) => `
          <h3>${k + 1}. ${esc(e.enunciado)}</h3>
          ${e.fuente ? `<p class="muted">${esc(e.fuente)}</p>` : ''}
          ${U().pasosHtml(e.pasos)}
          <div data-traza="${k}"></div>
          ${e.explicacion ? `<p>${inl(e.explicacion)}</p>` : ''}`).join('<hr>')
        : `<div class="empty">${I('construction', 'xl')}<p>Sin ejemplos resueltos en este tema.</p></div>`;
    }
    else {
      const ests = [...new Set(banco.flatMap(e => e.estructura || []))].sort();
      const conSol = banco.filter(e => e.solucion).length;
      cuerpo = banco.length
        ? `<p class="section-intro">${banco.length} ejercicios, ${conSol} con solución que se ejecuta aquí mismo.
           Despliega uno para ver la pista, lo que debe salir y marcar cómo te fue.</p>
           ${U().filtrosBanco(ests)}
           <div class="bank">${banco.map((e, k) => U().bancoFila(e, k + 1)).join('')}</div>`
        : `<div class="empty">${I('construction', 'xl')}<p>Sin ejercicios todavía.</p></div>`;
    }

    return {
      html: `
      ${U().crumbs([['Portada', '#/'], [`Corte ${c.num}`, `#/corte/${c.num}`],
        [`Semana ${t.semana}`, `#/corte/${c.num}#ruta`], [t.titulo, '']])}

      <div class="tema-head">
        <div style="min-width:0">
          <div class="th-kicker">Semana ${t.semana} · ${t.horas} h · Unidad ${t.unidad}</div>
          <h1>${esc(t.titulo)}</h1>
          <p class="th-res">${esc(t.resumen || '')}</p>
          <div class="th-meta">
            ${t.manual ? `<span class="chip"><b>Manual</b> ${esc(t.manual)}</span>` : ''}
            <span class="chip"><b>Ejercicios</b> ${banco.length}</span>
            ${t.clave ? '<span class="chip"><b>Clave en la meta</b></span>' : ''}
          </div>
        </div>
        <div class="thring">
          ${U().ring(st.pctMastered, { size: 58, stroke: 5, mastered: st.pctMastered === 100 })}
          <span class="rl">${st.mastered}/${st.total} ejercicios</span>
        </div>
      </div>

      <div class="tabs">${tabs.map(([k, n2, ic, cnt]) =>
        `<a class="tab"${pestana === k ? ' aria-current="page"' : ''} href="#/corte/${c.num}/tema/${t.id}/${k}">
          ${I(ic)}${esc(n2)}${cnt !== '' ? `<span class="cnt">${cnt}</span>` : ''}</a>`).join('')}</div>

      <div class="pane">${cuerpo}</div>

      <div class="donebar">
        <button type="button" class="btn${hecho ? ' ok' : ''}" id="marcarTema">
          ${hecho ? U().check + ' Tema dominado' : I('circle') + ' Marcar como dominado'}</button>
        <span class="dstat" data-stat>${st.mastered}/${st.total} ejercicios · ${st.pctMastered} %</span>
      </div>

      <div class="tema-nav">
        ${prev ? `<a href="#/corte/${c.num}/tema/${prev.id}">
          <span class="k">← Anterior</span><span class="t">${esc(prev.titulo)}</span></a>` : '<span></span>'}
        ${next ? `<a class="right" href="#/corte/${c.num}/tema/${next.id}">
          <span class="k">Siguiente →</span><span class="t">${esc(next.titulo)}</span></a>`
        : `<a class="right" href="#/corte/${c.num}/meta">
          <span class="k">Fin de la ruta →</span><span class="t">${esc(c.meta.nombre)}</span></a>`}
      </div>`,

      despues(host) {
        if (AYP.Viz) AYP.Viz.montarTodos(host);

        host.querySelectorAll('[data-traza]').forEach(n2 => {
          const e = ejs[+n2.dataset.traza];
          if (!e) return;
          AYP.Traza.montar(n2, {
            titulo: e.enunciado, fuente: e.codigo, fuenteRef: e.fuente,
            entradas: e.entradas, precarga: e.precarga, hoja: e.hoja,
            dialecto: e.dialecto || 'libro'
          });
        });

        const refrescar = () => {
          const s2 = S().stats(M().temaBanco(t));
          const el = host.querySelector('[data-stat]');
          if (el) el.textContent = `${s2.mastered}/${s2.total} ejercicios · ${s2.pctMastered} %`;
          AYP.app.refrescarRail();
        };
        U().wireBanco(host, id => banco.find(x => x.id === id), refrescar);
        U().wireFiltros(host);

        const mt = host.querySelector('#marcarTema');
        if (mt) mt.addEventListener('click', () => {
          const v = !S().temaDone(t.unidad, t.id);
          S().setTemaDone(t.unidad, t.id, v);
          mt.classList.toggle('ok', v);
          mt.innerHTML = v ? U().check + ' Tema dominado' : I('circle') + ' Marcar como dominado';
          AYP.app.refrescarRail();
        });
      }
    };
  }

  /* ============================================================
     META DEL CORTE
     ============================================================ */
  function meta(c) {
    const ev = M().meta().evaluacion.filter(e => e.corte === c.num);
    const notas = M().notas();
    const pt = M().temasCorte(c.id);
    const ej = S().stats(M().corteBanco(c.id));
    const sim = S().simStats(c.id);
    const d = M().diasPara(c);

    const cks = [
      { ok: pt.pct === 100, t: `Los ${pt.total} temas del corte marcados como dominados`, pc: `${pt.done}/${pt.total}` },
      { ok: ej.pctMastered >= 80, t: 'Banco de ejercicios resuelto (meta: 80 %)', pc: `${ej.mastered}/${ej.total}` },
      { ok: sim.veces > 0, t: 'Simulacro cronometrado hecho al menos una vez', pc: sim.veces ? sim.veces + '×' : '—' }
    ];

    return {
      html: `
      ${U().crumbs([['Portada', '#/'], [`Corte ${c.num}`, `#/corte/${c.num}`], [c.meta.nombre, '']])}
      ${U().hero({
        pill: `Meta del Corte ${c.num}`, pillCls: 'violet',
        titulo: c.meta.nombre,
        lead: 'Todo lo anterior existe para esto. Aquí está la plantilla real de la evaluación y un semáforo honesto de si estás listo.'
      })}

      <div class="meta-gate">
        <div class="mg-h">
          <div class="k">${esc(c.meta.ventanaTxt)}${d !== null && d >= 0 ? ` · faltan ${d} días` : ''}</div>
          <h3>Vale el ${c.meta.pct} % de la definitiva</h3>
          <p>${inl(c.alcance)}</p>
        </div>
        <div class="mg-b">
          <h4 style="margin-top:0">La plantilla real</h4>
          <p class="muted">Lo que se ha visto caer en este corte, punto por punto.</p>
          <div class="bank">${c.plantilla.map((p, k) => `
            <div class="brow"><div class="bh" style="cursor:default">
              <span class="bn">${k + 1}</span>
              <span class="be"><b>${esc(p.et)}</b><small class="muted"> — ${esc(p.desc)}</small></span>
              ${p.tema && M().tema(p.tema) ? `<a class="btn sm" href="#/corte/${c.num}/tema/${esc(p.tema)}">Ir al tema</a>` : ''}
            </div></div>`).join('')}</div>

          <h4>¿Estás listo?</h4>
          <div class="checklist">${cks.map(k => `<div class="ck${k.ok ? ' ok' : ''}">
            <span class="box">${U().check}</span><span class="txt">${esc(k.t)}</span>
            <span class="pc">${esc(k.pc)}</span></div>`).join('')}</div>

          <div class="btnrow" style="margin-top:18px">
            <a class="btn primary" href="#/corte/${c.num}/simulacro">${I('hourglass')}Empezar simulacro</a>
            <a class="btn" href="#/corte/${c.num}/examen">Ver exámenes reales</a>
            <a class="btn" href="#/corte/${c.num}/propuestos">Ejercicios del manual</a>
          </div>
        </div>
      </div>

      <h2>Antes de entrar</h2>
      <div class="callout trap"><div class="ct">${I('target')}La pregunta que define si estás listo</div>
        <p>${inl(c.checklist)}</p></div>

      <h2>Tus notas de este corte</h2>
      <div class="grade-rows">${ev.map(e => `
        <div class="evrow">
          <span class="evn">${esc(e.nombre)}</span>
          <span class="evp">${e.pct} % · semana ${e.semana}</span>
          <input type="number" min="0" max="5" step="0.1" inputmode="decimal" data-nota="${e.id}"
            value="${typeof notas[e.id] === 'number' ? notas[e.id] : ''}" placeholder="—"
            aria-label="Nota de ${esc(e.nombre)}">
        </div>`).join('')}</div>
      <p class="muted">Se guardan solas. La portada recalcula qué necesitas en lo que falta.</p>`,

      despues(host) {
        host.querySelectorAll('[data-nota]').forEach(inp => inp.addEventListener('change', () => {
          const v = inp.value === '' ? null : parseFloat(String(inp.value).replace(',', '.'));
          M().setNota(inp.dataset.nota, v);
        }));
      }
    };
  }

  Object.assign(AYP.views, { error, portada, corte, tema, meta });
})();
