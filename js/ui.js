/* ============================================================
   ui.js — piezas de interfaz compartidas por todas las vistas.

   Existe por una razón concreta: antes, la fila del banco de ejercicios
   estaba escrita a mano cuatro veces (tema, propuestos, simulacro,
   exámenes) y las cuatro copias se desincronizaron. Aquí hay una sola.

   Regla de este archivo: devuelve HTML o engancha eventos. No sabe nada
   del router ni de los datos del curso.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const I = (n, c) => AYP.icon(n, c);

  const esc = s => String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  /* Los textos del contenido llevan fragmentos de código entre acentos
     graves. Sólo esos van en monoespaciado; la frase que los rodea es
     prosa y se lee con la fuente de lectura. */
  const inl = s => esc(s)
    .replace(/`([^`]+)`/g, '<code class="inl">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  const plural = (n, sing, plur) => n === 1 ? sing : plur;
  const num = n => String(n).replace('.', ',');
  const n1 = x => (x === null || x === undefined) ? '—' : Number(x).toFixed(1).replace('.', ',');

  const DIF = { baja: 'Baja', media: 'Media', alta: 'Reto' };
  const FUENTE = { manual: 'del manual', parcial: 'cayó en parcial', clasico: 'clásico' };

  /* ---------- anillo de progreso ---------- */
  function ring(pct, o) {
    o = o || {};
    const size = o.size || 44, stroke = o.stroke || 4;
    const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
    const off = circ * (1 - Math.max(0, Math.min(100, pct)) / 100);
    const cx = size / 2;
    const lab = o.label !== undefined ? o.label : pct + '%';
    return `<span class="ring" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
        <circle class="rt" cx="${cx}" cy="${cx}" r="${r}" stroke-width="${stroke}"/>
        <circle class="rp${o.mastered ? ' mastered' : ''}" cx="${cx}" cy="${cx}" r="${r}"
          stroke-width="${stroke}" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
      </svg>${lab !== '' ? `<span class="lab">${lab}</span>` : ''}</span>`;
  }

  const chev = cls => `<span class="${cls || ''}">${I('chevron')}</span>`;
  const check = I('check');

  function crumbs(items) {
    return `<nav class="crumbs" aria-label="Migas de pan">` + items.map((it, i) =>
      i === items.length - 1
        ? `<span class="cur" aria-current="page">${esc(it[0])}</span>`
        : `<a href="${it[1]}">${esc(it[0])}</a>${chev('')}`).join('') + `</nav>`;
  }

  /* ============================================================
     ILUSTRACIONES — el vocabulario gráfico de la materia.
     Marcas de agua decorativas: monocromas, sin relleno, opacidad
     baja y aria-hidden. Nunca llevan información.
     ============================================================ */
  const ILU = {
    /* 1 · Arreglos: la matriz con su diagonal y una fila recorrida */
    1: `<g stroke="currentColor" fill="none" stroke-width="2.5" stroke-linejoin="round">
        <rect x="34" y="34" width="132" height="132" rx="6"/>
        <path d="M67 34v132M100 34v132M133 34v132M34 67h132M34 100h132M34 133h132"/>
        <path d="M34 34l132 132" stroke-width="4"/>
        <rect x="34" y="100" width="132" height="33" stroke-width="4"/></g>`,
    /* 2 · Cadenas: la ventana deslizante sobre los caracteres */
    2: `<g stroke="currentColor" fill="none" stroke-width="2.5" stroke-linejoin="round">
        <rect x="22" y="76" width="24" height="34" rx="4"/><rect x="46" y="76" width="24" height="34" rx="4"/>
        <rect x="70" y="76" width="24" height="34" rx="4"/><rect x="94" y="76" width="24" height="34" rx="4"/>
        <rect x="118" y="76" width="24" height="34" rx="4"/><rect x="142" y="76" width="24" height="34" rx="4"/>
        <rect x="64" y="68" width="84" height="50" rx="8" stroke-width="4.5"/>
        <path d="M64 132h84" stroke-width="3" stroke-linecap="round"/>
        <path d="M148 132l-10-7M148 132l-10 7" stroke-width="3" stroke-linecap="round"/></g>`,
    /* 3 · Subrutinas: la pila de marcos, con la llamada y el retorno */
    3: `<g stroke="currentColor" fill="none" stroke-width="2.5" stroke-linejoin="round">
        <rect x="46" y="126" width="118" height="32" rx="5"/>
        <rect x="58" y="88" width="106" height="32" rx="5"/>
        <rect x="70" y="50" width="94" height="32" rx="5"/>
        <path d="M36 142V66h20" stroke-linecap="round"/>
        <path d="M56 66l-9-6M56 66l-9 6" stroke-linecap="round"/></g>`,
    /* 4 · Recursividad: el árbol de llamadas hasta el caso base */
    4: `<g stroke="currentColor" fill="none" stroke-width="2.5">
        <path d="M100 52L62 92M100 52l38 40M62 112l-22 36M62 112l22 36M138 112l-22 36M138 112l22 36"/>
        <circle cx="100" cy="40" r="13"/><circle cx="62" cy="102" r="11"/><circle cx="138" cy="102" r="11"/>
        <circle cx="40" cy="158" r="9"/><circle cx="84" cy="158" r="9"/>
        <circle cx="116" cy="158" r="9"/><circle cx="160" cy="158" r="9"/></g>`
  };

  const ilu = (n, cls) =>
    `<svg class="${cls}" viewBox="0 0 200 200" fill="none" aria-hidden="true">${ILU[n] || ''}</svg>`;

  /* ============================================================
     ENCABEZADO DE VISTA
     ============================================================ */
  function hero(o) {
    return `<section class="hero">
      ${o.ilu ? ilu(o.ilu, 'hero-illu') : ''}
      ${o.pill ? `<span class="pill${o.pillCls ? ' ' + o.pillCls : ''}"><span class="g"></span>${esc(o.pill)}</span>` : ''}
      <h1>${esc(o.titulo)}</h1>
      ${o.lead ? `<p class="lead">${inl(o.lead)}</p>` : ''}
      ${(o.chips || []).length ? `<div class="meta">${o.chips.map(c =>
        `<span class="chip">${c[0] ? `<b>${esc(c[0])}</b> ` : ''}${esc(c[1])}</span>`).join('')}</div>` : ''}
    </section>`;
  }

  /* ============================================================
     TEORÍA — el procedimiento es prosa numerada, no código.
     ============================================================ */
  function teoriaHtml(t) {
    if (!t) return '';
    let h = '';
    if (t.concepto) h += `<p class="teoria-concepto">${inl(t.concepto)}</p>`;
    if (t.notacion) h += `<div class="fkey">$$${t.notacion}$$</div>`;
    if ((t.procedimiento || []).length) {
      h += `<div class="divlabel">Cómo se hace</div><div class="steps">` +
        t.procedimiento.map((p, i) => `<div class="step">
          <div class="sk">${String(i + 1).padStart(2, '0')}</div>
          <div><div class="stt">${inl(typeof p === 'string' ? p : p.titulo)}</div>
          ${(p.detalle) ? `<div class="sn">${inl(p.detalle)}</div>` : ''}</div>
        </div>`).join('') + `</div>`;
    }
    if (t.logica) h += `<div class="callout acc"><div class="ct">${I('target')}Por qué funciona</div><p>${inl(t.logica)}</p></div>`;
    if ((t.trampas || []).length) {
      h += `<div class="callout trap"><div class="ct">${I('warning')}Trampas frecuentes</div><ul>` +
        t.trampas.map(x => `<li>${inl(x)}</li>`).join('') + `</ul></div>`;
    }
    return h;
  }

  /* Pasos de un ejemplo resuelto: número, título, código y explicación. */
  function pasosHtml(pasos) {
    if (!(pasos || []).length) return '';
    const last = pasos.length - 1;
    return `<div class="steps">` + pasos.map((p, i) => `
      <div class="step${i === last ? ' step-final' : ''}">
        <div class="sk">${String(i + 1).padStart(2, '0')}</div>
        <div>
          ${p.titulo ? `<div class="stt">${inl(p.titulo)}</div>` : ''}
          ${p.codigo ? `<pre class="codigo sx">${esc(p.codigo)}</pre>` : ''}
          ${p.explicacion ? `<div class="sn">${inl(p.explicacion)}</div>` : ''}
        </div>
      </div>`).join('') + `</div>`;
  }

  /* ============================================================
     BANCO DE EJERCICIOS — una sola definición para toda la app.
     Estructura idéntica a la de Cálculo II: cabecera plegable con
     punto de estado, número, enunciado y metadatos; cuerpo con la
     pista, lo que debe salir, la solución ejecutable y el estado.
     ============================================================ */
  function bancoFila(ex, n, o) {
    o = o || {};
    const st = AYP.Store.exState(ex.id);
    const dif = ex.dificultad || 'media';
    const ests = ex.estructura || [];
    return `<div class="brow" data-ex="${esc(ex.id)}" data-st="${st}" data-dif="${dif}"
        data-sol="${ex.solucion ? 'si' : 'no'}" data-pat="${esc(ests.join(' '))}">
      <button type="button" class="bh" data-toggle aria-expanded="false">
        <span class="bdot ${st === 'pending' ? '' : st}"></span>
        <span class="bn">${esc(o.etiqueta || String(n).padStart(2, '0'))}</span>
        <span class="be">${esc(ex.enunciado)}</span>
        <span class="bmeta">
          ${dif !== 'media' ? `<span class="dif dif-${dif}" title="${DIF[dif]}"></span><span class="sr-only">${DIF[dif]}</span>` : ''}
          ${ex.destacado ? `<span class="pill violet">${esc(ex.destacado)}</span>` : ''}
          ${ex.solucion ? `<span class="hasw" title="Trae solución ejecutable">${I('play')}<span class="sr-only">con solución</span></span>` : ''}
        </span>
        ${chev('bchev')}
      </button>
      <div class="bbody"><div><div class="bpad">
        <div class="bmeta2">
          ${ests.map(x => `<span class="fchip">${esc(x)}</span>`).join('')}
          ${ex.fuente ? `<span class="fchip">${esc(FUENTE[ex.fuente] || ex.fuente)}</span>` : ''}
          ${ex.ref ? `<span class="muted">${esc(ex.ref)}</span>` : ''}
        </div>
        ${ex.pista ? `<p class="muted">${I('bulb')} ${inl(ex.pista)}</p>` : ''}
        ${ex.respuesta ? `<div class="eanswer"><span class="lbl">Debe salir</span><span>${esc(ex.respuesta)}</span></div>` : ''}
        ${ex.solucion ? `<div class="btnrow" style="margin-top:14px">
          <button type="button" class="btn sm primary" data-sol="${esc(ex.id)}">${I('play')}Ver la solución ejecutándose</button>
        </div><div data-solhost="${esc(ex.id)}"></div>` : ''}
        <div class="stateseg" data-stateseg role="group" aria-label="Estado del ejercicio">
          <button type="button" data-st="pending"${st === 'pending' ? ' class="on-pending"' : ''}>Pendiente</button>
          <button type="button" data-st="tried"${st === 'tried' ? ' class="on-tried"' : ''}>Lo intenté</button>
          <button type="button" data-st="mastered"${st === 'mastered' ? ' class="on-mastered"' : ''}>Lo domino</button>
        </div>
      </div></div></div>
    </div>`;
  }

  /* Engancha plegado, cambio de estado y solución ejecutable. */
  function wireBanco(scope, buscar, onChange) {
    scope.querySelectorAll('.brow[data-ex]').forEach(row => {
      if (row._wired) return; row._wired = true;
      const head = row.querySelector('.bh');
      if (head) head.addEventListener('click', () => {
        const abierto = row.classList.toggle('open');
        head.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      });
      row.querySelectorAll('.stateseg button').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation();
        const st = b.dataset.st;
        AYP.Store.setExState(row.dataset.ex, st);
        row.dataset.st = st;
        row.querySelectorAll('.stateseg button').forEach(x => x.className = '');
        b.className = 'on-' + st;
        const d = row.querySelector('.bdot');
        d.className = 'bdot ' + (st === 'pending' ? '' : st) + ' pop';
        if (onChange) onChange();
      }));
      const bs = row.querySelector('[data-sol]');
      if (bs) bs.addEventListener('click', e => {
        e.stopPropagation();
        const ex = buscar(bs.dataset.sol);
        const host = row.querySelector('[data-solhost]');
        if (!ex || !host) return;
        if (host.firstChild) { host.innerHTML = ''; bs.innerHTML = I('play') + 'Ver la solución ejecutándose'; return; }
        bs.innerHTML = I('close') + 'Ocultar la solución';
        AYP.Traza.montar(host, {
          titulo: ex.enunciado.slice(0, 70), fuente: ex.solucion,
          fuenteRef: ex.ref || ex.fuente || '', entradas: ex.entradas, precarga: ex.precarga
        });
      });
    });
  }

  /* Barra de filtros: dos filas para que nada quede apretado. */
  function filtrosBanco(ests) {
    return `<div class="fstrip2" data-fstrip>
      <div class="frow1">
        <span class="seg2" data-f="dif" role="group" aria-label="Dificultad">
          <button type="button" data-v="" aria-pressed="true">Todas</button>
          <button type="button" data-v="baja">Baja</button>
          <button type="button" data-v="media">Media</button>
          <button type="button" data-v="alta">Reto</button>
        </span>
        <span class="seg2" data-f="st" role="group" aria-label="Estado">
          <button type="button" data-v="" aria-pressed="true">Cualquiera</button>
          <button type="button" data-v="pending">Pendientes</button>
          <button type="button" data-v="tried">Intentados</button>
          <button type="button" data-v="mastered">Dominados</button>
        </span>
      </div>
      <div class="frow2">
        ${(ests || []).length ? `<select data-f="pat" aria-label="Estructura">
          <option value="">Cualquier estructura</option>
          ${ests.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('')}
        </select>` : ''}
        <span class="seg2" data-f="sol" role="group" aria-label="Solución">
          <button type="button" data-v="" aria-pressed="true">Con y sin solución</button>
          <button type="button" data-v="si">Sólo con solución</button>
        </span>
        <span class="muted" data-cuenta></span>
      </div>
    </div>`;
  }

  function wireFiltros(scope) {
    const fs = scope.querySelector('[data-fstrip]');
    if (!fs) return;
    const f = { dif: '', st: '', sol: '', pat: '' };
    const aplicar = () => {
      let n = 0;
      scope.querySelectorAll('.brow[data-ex]').forEach(row => {
        const ok =
          (!f.dif || row.dataset.dif === f.dif) &&
          (!f.st || row.dataset.st === f.st) &&
          (!f.sol || row.dataset.sol === f.sol) &&
          (!f.pat || (' ' + row.dataset.pat + ' ').indexOf(' ' + f.pat + ' ') >= 0);
        row.hidden = !ok;
        if (ok) n++;
      });
      const c = fs.querySelector('[data-cuenta]');
      if (c) c.textContent = n + ' ' + plural(n, 'ejercicio visible', 'ejercicios visibles');
    };
    fs.querySelectorAll('.seg2').forEach(seg =>
      seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        f[seg.dataset.f] = b.dataset.v;
        aplicar();
      })));
    const sel = fs.querySelector('select[data-f="pat"]');
    if (sel) sel.addEventListener('change', () => { f.pat = sel.value; aplicar(); });
    aplicar();
    return aplicar;
  }

  /* ---------- herramientas del corte: una sola lista ---------- */
  const HERRAMIENTAS = [
    ['propuestos', 'Ejercicios del manual', 'book', 'Los que el profesor tiene a mano para exámenes y talleres.'],
    ['patrones', 'Tarjetero de patrones', 'cards', 'Los fragmentos reutilizables que resuelven media pregunta.'],
    ['drill', 'Drill de estructura', 'bolt', 'Un enunciado y unos segundos para decir qué lo resuelve.'],
    ['traza', 'Drill de traza', 'timer', 'Predecir el siguiente estado: es el punto de prueba de escritorio.'],
    ['simulacro', 'Simulacro', 'hourglass', 'La plantilla real de la evaluación, con cronómetro.'],
    ['examen', 'Exámenes reales', 'history', 'Transcritos punto por punto, con cómo se falla cada uno.'],
    ['cronograma', 'Cronograma', 'calendar', 'Las semanas del semestre y sus sesiones de clase.']
  ];

  function toolGrid(c) {
    return `<div class="toolgrid">` + HERRAMIENTAS.map(([k, t, ic, d]) =>
      `<article class="tool"><div class="ti">${I(ic)}</div>
        <b><a href="#/corte/${c.num}/${k}">${esc(t)}</a></b><small>${esc(d)}</small></article>`).join('') +
      `<article class="tool"><div class="ti">${I('terminal')}</div>
        <b><a href="#/laboratorio">Banco de trabajo</a></b>
        <small>Pega cualquier pseudocódigo y velo ejecutarse paso a paso.</small></article></div>`;
  }

  /* Renderiza la notación matemática del contenedor, si KaTeX está cargado. */
  function math(el) { if (AYP.Kx) AYP.Kx.render(el); }

  AYP.ui = {
    esc, inl, plural, num, n1, DIF, FUENTE,
    ring, chev, check, crumbs, ilu, hero,
    teoriaHtml, pasosHtml,
    bancoFila, wireBanco, filtrosBanco, wireFiltros,
    HERRAMIENTAS, toolGrid, math
  };
})();
