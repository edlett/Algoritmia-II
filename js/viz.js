/* ============================================================
   viz.js — catálogo de visualizadores.

   La traza universal muestra el ESTADO de cualquier pseudocódigo.
   Estos visualizadores muestran la FORMA de un algoritmo concreto:
   lo que la traza no puede enseñar por sí sola —el perfil de las barras
   al ordenar, el árbol de llamadas, la mitad que se descarta, el reflejo
   sobre la diagonal—.

   Un tema declara `viz: 'id'` y aparece su pestaña «Ver».
   spec.draw(g, estado) devuelve { stats: [[clave, valor], …], note: '…' }.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const C = () => AYP.Canvas;
  const css = v => AYP.Canvas.css(v);
  const mix = (v, p) => AYP.Canvas.mix(v, p);
  const DEFS = {};
  const def = (id, spec) => { DEFS[id] = spec; };

  /* ---------------- infraestructura ---------------- */

  function controlesHtml(cs) {
    return cs.map(c => {
      if (c.t === 'play') return `<button type="button" class="btn primary" data-act="play">${AYP.icon('play')}${c.label || 'Animar'}</button>`;
      if (c.t === 'paso') return `<button type="button" class="btn" data-act="paso">Un paso</button>`;
      if (c.t === 'reset') return `<button type="button" class="btn" data-act="reset">Reiniciar</button>`;
      if (c.t === 'range') return `<label class="field"><span class="ctl-lbl">${c.label || c.key}</span> <input type="range" data-key="${c.key}" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${c.val}" aria-label="${c.aria || c.label || c.key}"></label>`;
      if (c.t === 'seg') return `<span class="seg2" data-key="${c.key}" role="group" aria-label="${c.aria || c.key}">${c.options.map(o => `<button type="button" data-v="${o[0]}" aria-pressed="${o[0] === c.val}">${o[1]}</button>`).join('')}</span>`;
      return '';
    }).join('');
  }

  function render(id, mount) {
    const spec = DEFS[id];
    if (!spec) return null;
    const el = document.createElement('div');
    el.className = 'viz';
    el.innerHTML = `
      <div class="vh"><span class="live" aria-hidden="true"></span><span class="vt">${spec.title}</span>${spec.sub ? `<span class="vsub">·&nbsp;${spec.sub}</span>` : ''}</div>
      <canvas role="img" aria-label="${spec.title}"></canvas>
      ${spec.legend ? `<div class="legend">${spec.legend.map(l =>
        `<span><i style="background:${l.bg === false ? 'transparent' : mix(l.c, 16)};border-color:${css(l.c)}"></i>${l.t}</span>`).join('')}</div>` : ''}
      <div class="status" aria-live="off"></div>
      ${spec.controls ? `<div class="controls">${controlesHtml(spec.controls)}</div>` : ''}`;
    mount.appendChild(el);

    const estado = {};
    (spec.controls || []).forEach(c => {
      if (c.key !== undefined) estado[c.key] = c.t === 'range' ? +c.val : c.val;
    });

    const g = C().crear(el.querySelector('canvas'), { ratio: spec.ratio, maxH: spec.maxH, minH: spec.minH });
    const status = el.querySelector('.status');
    const live = el.querySelector('.live');
    let timer = null, sigPrev = null, notaPrev = null, nodos = [];

    function pintarStatus(res) {
      if (!res) { status.innerHTML = ''; sigPrev = notaPrev = null; return; }
      const stats = res.stats || [];
      const sig = stats.map(s => s[0]).join('|');
      if (sig !== sigPrev) {
        sigPrev = sig;
        status.innerHTML =
          `<div class="vstats">${stats.map(s => `<span><i>${s[0]}</i><b></b></span>`).join('')}</div>` +
          `<span class="vnote"></span>`;
        nodos = [...status.querySelectorAll('.vstats b')];
        notaPrev = null;
      }
      stats.forEach((s, i) => { if (nodos[i]) nodos[i].textContent = s[1]; });
      const n = status.querySelector('.vnote');
      const nota = res.note || '';
      if (n && nota !== notaPrev) { notaPrev = nota; n.innerHTML = nota; }
    }

    g.draw = function () { g.clear(); pintarStatus(spec.draw(g, estado)); };

    el.querySelectorAll('input[type=range]').forEach(inp =>
      inp.addEventListener('input', () => { parar(); estado[inp.dataset.key] = +inp.value; g.draw(); }));

    el.querySelectorAll('.seg2').forEach(seg =>
      seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        estado[seg.dataset.key] = b.dataset.v;
        if (spec.alCambiar) spec.alCambiar(estado, seg.dataset.key, el);
        parar(); g.draw();
      })));

    function parar() { if (timer) { clearInterval(timer); timer = null; } live.classList.remove('on'); }

    const cfg = (spec.controls || []).find(c => c.t === 'play');
    const btnPlay = el.querySelector('[data-act="play"]');
    if (btnPlay && cfg && cfg.sweep) {
      btnPlay.addEventListener('click', () => {
        parar();
        live.classList.add('on');
        const s = cfg.sweep;
        const inp = el.querySelector(`input[data-key="${s.key}"]`);
        let v = estado[s.key] >= s.to ? s.from : estado[s.key];
        timer = setInterval(() => {
          v += (s.paso || 1);
          if (v >= s.to) { v = s.to; parar(); }
          estado[s.key] = v;
          if (inp) inp.value = v;
          g.draw();
        }, s.ms || 260);
        (AYP._timers = AYP._timers || []).push(timer);
      });
    }
    const btnPaso = el.querySelector('[data-act="paso"]');
    if (btnPaso && cfg && cfg.sweep) {
      btnPaso.addEventListener('click', () => {
        parar();
        const s = cfg.sweep;
        estado[s.key] = Math.min(s.to, (estado[s.key] || 0) + (s.paso || 1));
        const inp = el.querySelector(`input[data-key="${s.key}"]`);
        if (inp) inp.value = estado[s.key];
        g.draw();
      });
    }
    const btnReset = el.querySelector('[data-act="reset"]');
    if (btnReset) btnReset.addEventListener('click', () => {
      parar();
      (spec.controls || []).forEach(c => {
        if (c.key === undefined) return;
        estado[c.key] = c.t === 'range' ? +c.val : c.val;
        const inp = el.querySelector(`input[data-key="${c.key}"]`); if (inp) inp.value = c.val;
        const seg = el.querySelector(`.seg2[data-key="${c.key}"]`);
        if (seg) seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === c.val)));
      });
      g.draw();
    });

    g.draw();
    return el;
  }

  /* ================================================================
     Utilidades comunes
     ================================================================ */

  /* Reproduce la Burbuja del manual y devuelve la lista de estados */
  function pasosBurbuja(v0) {
    const a = v0.slice(), pasos = [];
    let comp = 0, swaps = 0;
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = i + 1; j < a.length; j++) {
        comp++;
        pasos.push({ a: a.slice(), i, j, comp, swaps, accion: 'compara' });
        if (a[i] > a[j]) {
          const t = a[i]; a[i] = a[j]; a[j] = t; swaps++;
          pasos.push({ a: a.slice(), i, j, comp, swaps, accion: 'intercambia' });
        }
      }
    }
    pasos.push({ a: a.slice(), i: -1, j: -1, comp, swaps, accion: 'fin' });
    return pasos;
  }

  const VEC = [5, 2, 9, 1, 7, 3, 8, 4];

  /* ================================================================
     CORTE 1 · VECTORES
     ================================================================ */

  def('burbuja', {
    title: 'El método de la Burbuja, por dentro',
    sub: 'cada barra es un elemento; la altura, su valor',
    ratio: 0.44, minH: 230,
    legend: [
      { c: '--blue', t: 'par que se compara' },
      { c: '--green', t: 'intercambio' },
      { c: '--fg3', t: 'ya en su sitio', bg: false }
    ],
    controls: [
      { t: 'play', label: 'Ordenar', sweep: { key: 'p', from: 0, to: pasosBurbuja(VEC).length - 1, paso: 1, ms: 240 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: pasosBurbuja(VEC).length - 1, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const pasos = pasosBurbuja(VEC);
      const st = pasos[Math.min(s.p, pasos.length - 1)];
      const estados = st.a.map((_, k) =>
        k === st.i || k === st.j ? (st.accion === 'intercambia' ? 'escribe' : 'lee')
          : (st.i >= 0 && k < st.i ? 'tenue' : 'normal'));
      const bh = g.h - 96;
      g.barras(st.a, 22, 14, g.w - 44, bh, { estados });
      const r = g.vector(st.a, 22, 14 + bh + 6, { estados, cw: Math.floor((g.w - 44) / st.a.length) - 4, ch: 26 });
      if (st.i >= 0 && r.geo[st.i] && r.geo[st.j]) {
        const A = r.geo[st.i], B = r.geo[st.j];
        g.flecha(A.cx, A.y + A.h + 18, B.cx, B.y + B.h + 18, {
          curva: true, color: st.accion === 'intercambia' ? '--green' : '--blue', punta: false
        });
        g.texto((A.cx + B.cx) / 2, A.y + A.h + 34,
          st.accion === 'intercambia' ? 'A(I) ↔ A(J)' : 'A(I) > A(J)?',
          { align: 'center', size: 10, color: st.accion === 'intercambia' ? '--green' : '--blue' });
      }
      return {
        stats: [['I', st.i < 0 ? '—' : st.i + 1], ['J', st.j < 0 ? '—' : st.j + 1],
          ['comparaciones', st.comp], ['intercambios', st.swaps]],
        note: st.accion === 'fin'
          ? `Ordenado con <b>${st.comp}</b> comparaciones y <b>${st.swaps}</b> intercambios. El número de comparaciones no depende de los datos: siempre es n(n−1)/2.`
          : st.accion === 'intercambia'
            ? 'Se cumple A(I) &gt; A(J): entran las tres líneas del intercambio con la temporal T.'
            : 'Se comparan las posiciones I y J. Lo que queda a la izquierda de I ya está en su sitio.'
      };
    }
  });

  def('busqueda-binaria', {
    title: 'Búsqueda binaria: la mitad que se tira',
    sub: 'sólo funciona si el vector ya está ordenado',
    ratio: 0.38, minH: 200,
    legend: [
      { c: '--violet', t: 'medio' },
      { c: '--blue', t: 'rango vivo' },
      { c: '--fg3', t: 'descartado', bg: false }
    ],
    controls: [
      { t: 'range', key: 'x', min: 2, max: 57, val: 44, label: 'buscar' },
      { t: 'play', label: 'Buscar', sweep: { key: 'p', from: 0, to: 4, paso: 1, ms: 700 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 4, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const A = [2, 5, 8, 12, 20, 31, 44, 57];
      let ini = 0, fin = A.length - 1, medio = -1, hallado = -1, k = 0;
      const hist = [];
      while (ini <= fin && k <= s.p && hallado < 0) {
        medio = Math.floor((ini + fin) / 2);
        hist.push({ ini, fin, medio });
        if (A[medio] === s.x) hallado = medio;
        else if (A[medio] < s.x) ini = medio + 1;
        else fin = medio - 1;
        k++;
      }
      const ult = hist[Math.min(s.p, hist.length - 1)] || { ini: 0, fin: A.length - 1, medio: -1 };
      const estados = A.map((_, i) =>
        i === ult.medio ? (A[i] === s.x ? 'ok' : 'activa')
          : (i < ult.ini || i > ult.fin) ? 'apagada' : 'lee');
      const r = g.vector(A, 26, 40, { estados, ch: 34, nombre: 'V' });
      if (r.geo[ult.ini]) g.puntero(r.geo[ult.ini].cx, 32 - 8, 'INI', '--blue');
      if (r.geo[ult.fin]) g.puntero(r.geo[ult.fin].cx, 32 - 8, 'FN', '--blue');
      if (ult.medio >= 0 && r.geo[ult.medio])
        g.puntero(r.geo[ult.medio].cx, 40 + 34 + 16, 'MEDIO', '--violet');
      g.texto(26, g.h - 26, 'MEDIO ← [| (INI + FN) / 2 |]', { size: 11, color: '--fg2' });
      const enc = hallado >= 0;
      return {
        stats: [['INI', ult.ini + 1], ['FN', ult.fin + 1], ['MEDIO', ult.medio + 1],
          ['quedan', Math.max(0, ult.fin - ult.ini + 1)]],
        note: enc
          ? `Encontrado en la posición <b>${hallado + 1}</b>. Con 8 elementos bastan 3 comparaciones; la búsqueda lineal habría necesitado hasta 8.`
          : (ult.ini > ult.fin ? 'El rango se cerró: el valor no está.'
            : 'Se compara con el elemento del medio y se descarta la mitad que no puede contenerlo.')
      };
    }
  });

  def('insercion', {
    title: 'Insertar en la posición K',
    sub: 'hay que desplazar DESDE EL FINAL hacia K',
    ratio: 0.42, minH: 210,
    legend: [
      { c: '--green', t: 'celda escrita' },
      { c: '--blue', t: 'celda leída' },
      { c: '--amber', t: 'posición K' }
    ],
    controls: [
      { t: 'seg', key: 'dir', val: 'bien', label: 'sentido', options: [['bien', 'Desde el final'], ['mal', 'Desde K (mal)']] },
      { t: 'play', label: 'Desplazar', sweep: { key: 'p', from: 0, to: 4, paso: 1, ms: 620 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 4, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const N = 5, K = 3, X = 99;
      const base = [10, 20, 30, 40, 50];
      const a = base.concat([null]);
      let lee = -1, escribe = -1;
      const pasos = [];
      if (s.dir === 'bien') {
        for (let i = N - 1; i >= K - 1; i--) pasos.push([i, i + 1]);
      } else {
        for (let i = K - 1; i <= N - 1; i++) pasos.push([i, i + 1]);
      }
      for (let k = 0; k < Math.min(s.p, pasos.length); k++) {
        const [de, a2] = pasos[k];
        a[a2] = a[de];
      }
      if (s.p > 0 && s.p <= pasos.length) { lee = pasos[s.p - 1][0]; escribe = pasos[s.p - 1][1]; }
      if (s.p > pasos.length) { a[K - 1] = X; escribe = K - 1; }
      const estados = a.map((_, i) =>
        i === escribe ? 'escribe' : i === lee ? 'lee' : (i === K - 1 ? 'aviso' : 'normal'));
      g.vector(a, 26, 46, { estados, ch: 36, nombre: 'V' });
      g.texto(26, 26, s.dir === 'bien'
        ? 'PARA I = N, K, -1 HAGA   V(I + 1) ← V(I)   F-PARA'
        : 'PARA I = K, N, 1 HAGA   V(I + 1) ← V(I)   F-PARA',
        { size: 11, color: s.dir === 'bien' ? '--fg2' : '--red' });
      g.texto(26, g.h - 26, 'K = ' + K + ' · X = ' + X, { size: 11, color: '--fg3' });
      const roto = s.dir === 'mal' && s.p >= 2;
      return {
        stats: [['K', K], ['paso', Math.min(s.p, pasos.length + 1)], ['N', N + (s.p > pasos.length ? 1 : 0)]],
        note: s.dir === 'mal'
          ? (roto ? 'Mira lo que pasa: la primera copia machaca el valor que todavía faltaba mover, y el vector se llena del mismo número. <b>Por eso se desplaza desde el final.</b>'
            : 'Sentido equivocado a propósito. Sigue pulsando para ver cómo se destruye el vector.')
          : (s.p > pasos.length ? 'Hueco abierto y valor colocado en V(K). Falta sólo <code class="inl">N ← N + 1</code>.'
            : 'Cada celda se copia una posición más allá, empezando por la última: así siempre se escribe sobre espacio ya libre.')
      };
    }
  });

  def('intercalacion', {
    title: 'Intercalación de dos vectores ordenados',
    sub: 'dos punteros avanzando a distinto ritmo',
    ratio: 0.5, minH: 250,
    legend: [
      { c: '--blue', t: 'candidato de A' },
      { c: '--violet', t: 'candidato de B' },
      { c: '--green', t: 'escrito en C' }
    ],
    controls: [
      { t: 'play', label: 'Fusionar', sweep: { key: 'p', from: 0, to: 9, paso: 1, ms: 560 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 9, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const A = [2, 7, 11, 20], B = [1, 5, 9, 14, 30];
      const C = new Array(A.length + B.length).fill(null);
      let i = 0, j = 0, k = 0;
      for (let n = 0; n < s.p && k < C.length; n++) {
        if (i < A.length && (j >= B.length || A[i] <= B[j])) { C[k++] = A[i++]; }
        else { C[k++] = B[j++]; }
      }
      const estA = A.map((_, x) => x < i ? 'tenue' : x === i ? 'lee' : 'normal');
      const estB = B.map((_, x) => x < j ? 'tenue' : x === j ? 'activa' : 'normal');
      const estC = C.map((v, x) => v === null ? 'normal' : x === k - 1 ? 'escribe' : 'ok');
      g.vector(A, 30, 30, { estados: estA, nombre: 'A', ch: 28, cw: 36 });
      g.vector(B, 30, 92, { estados: estB, nombre: 'B', ch: 28, cw: 36 });
      g.vector(C, 30, 160, { estados: estC, nombre: 'C', ch: 28, cw: 36 });
      const sig = i < A.length && (j >= B.length || A[i] <= B[j]) ? 'A' : 'B';
      return {
        stats: [['i', Math.min(i + 1, A.length)], ['j', Math.min(j + 1, B.length)], ['k', k]],
        note: k >= C.length
          ? 'C queda ordenado sin haber ordenado nada: sólo se compararon las cabezas. Ése es el truco de la intercalación.'
          : `Se comparan las cabezas: A(${i + 1}) = ${A[i]} contra B(${j + 1}) = ${B[j] === undefined ? '—' : B[j]}. Gana <b>${sig}</b> y su puntero avanza.`
      };
    }
  });

  def('patrones-vector', {
    title: 'Los cinco patrones, uno al lado del otro',
    sub: 'lo único que cambia es qué se inicializa y qué se actualiza',
    ratio: 0.42, minH: 210,
    legend: [{ c: '--blue', t: 'elemento en curso' }, { c: '--green', t: 'cumple la condición' }],
    controls: [
      { t: 'seg', key: 'modo', val: 'acumulador', options: [['acumulador', 'Acumulador'], ['contador', 'Contador'], ['maximo', 'Máximo'], ['bandera', 'Bandera']] },
      { t: 'play', label: 'Recorrer', sweep: { key: 'p', from: 0, to: 8, paso: 1, ms: 480 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 8, val: 0, label: 'I' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const V = [4, 7, 10, 3, 8, 5, 12, 6];
      const X = 8;
      let acc = 0, cont = 0, may = V[0], sw = 0, posSW = 0;
      const marca = [];
      for (let k = 0; k < Math.min(s.p, V.length); k++) {
        acc += V[k];
        if (V[k] % 2 === 0) { cont++; marca[k] = true; }
        if (V[k] > may) may = V[k];
        if (sw === 0) { posSW = k + 1; if (V[k] === X) sw = 1; }
      }
      const cur = Math.min(s.p, V.length) - 1;
      const estados = V.map((v, k) => {
        if (s.modo === 'bandera') return k > (sw ? posSW - 1 : cur) ? 'normal' : (v === X && sw ? 'ok' : k === cur ? 'lee' : 'tenue');
        if (k === cur) return 'lee';
        if (k > cur) return 'normal';
        if (s.modo === 'contador') return marca[k] ? 'ok' : 'apagada';
        if (s.modo === 'maximo') return v === may ? 'ok' : 'apagada';
        return 'tenue';
      });
      g.vector(V, 26, 52, { estados, ch: 36, nombre: 'V' });
      const CODIGO = {
        acumulador: ['S ← 0', 'PARA I = 1, N, 1 HAGA', '    S ← S + V(I)', 'F-PARA'],
        contador: ['C ← 0', 'PARA I = 1, N, 1 HAGA', '    SI (V(I) MOD 2 = 0) ENTONCES', '        C ← C + 1', '    F-SI', 'F-PARA'],
        maximo: ['MAY ← V(1)', 'PARA I = 2, N, 1 HAGA', '    SI (V(I) > MAY) ENTONCES', '        MAY ← V(I)', '    F-SI', 'F-PARA'],
        bandera: ['SW ← 0', 'MQ ((I <= N) y (SW = 0)) HAGA', '    SI (V(I) = X) ENTONCES', '        SW ← 1', '    SINO', '        I ← I + 1', '    F-SI', 'F_MQ']
      };
      g.codigo(CODIGO[s.modo], 30, 118, -1, { lh: 15, w: g.w - 60 });
      const VAL = { acumulador: [['S', acc]], contador: [['C', cont]], maximo: [['MAY', may]], bandera: [['SW', sw], ['I', posSW]] };
      const NOTA = {
        acumulador: 'Se inicializa <b>fuera</b> del ciclo. Dentro se suma el valor, no 1.',
        contador: 'El contador sube de uno en uno y sólo dentro del SI. Confundirlo con el acumulador es el error clásico.',
        maximo: 'Se inicializa con <b>V(1)</b> y el ciclo arranca en 2. Con 0 fallaría en un vector de negativos.',
        bandera: 'La condición del MQ es doble: o se encontró, o se acabó el vector. Sin el <code class="inl">I ← I + 1</code> del SINO no termina nunca.'
      };
      return {
        stats: [['I', Math.min(s.p, V.length)]].concat(VAL[s.modo]),
        note: NOTA[s.modo]
      };
    }
  });

  /* ================================================================
     CORTE 1 · MATRICES
     ================================================================ */

  const M3 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  const M4 = [[11, 12, 13, 14], [21, 22, 23, 24], [31, 32, 33, 34], [41, 42, 43, 44]];

  function ordenRecorrido(modo, n, m) {
    const o = [];
    if (modo === 'filas') { for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) o.push([i, j]); }
    else if (modo === 'columnas') { for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) o.push([i, j]); }
    else if (modo === 'principal') { for (let i = 0; i < Math.min(n, m); i++) o.push([i, i]); }
    else if (modo === 'secundaria') { for (let i = 0; i < Math.min(n, m); i++) o.push([i, m - i - 1]); }
    else if (modo === 'zigzag') {
      for (let i = 0; i < n; i++) {
        if (i % 2 === 0) for (let j = 0; j < m; j++) o.push([i, j]);
        else for (let j = m - 1; j >= 0; j--) o.push([i, j]);
      }
    } else if (modo === 'espiral') {
      let t = 0, b = n - 1, l = 0, r = m - 1;
      while (t <= b && l <= r) {
        for (let j = l; j <= r; j++) o.push([t, j]); t++;
        for (let i = t; i <= b; i++) o.push([i, r]); r--;
        if (t <= b) { for (let j = r; j >= l; j--) o.push([b, j]); b--; }
        if (l <= r) { for (let i = b; i >= t; i--) o.push([i, l]); l++; }
      }
    }
    return o;
  }

  def('recorridos-matriz', {
    title: 'Las seis formas de recorrer una matriz',
    sub: 'lo único que cambia es el orden de las casillas',
    ratio: 0.52, minH: 250,
    legend: [{ c: '--blue', t: 'casilla en curso' }, { c: '--green', t: 'ya visitada' }],
    controls: [
      { t: 'seg', key: 'modo', val: 'filas', options: [['filas', 'Filas'], ['columnas', 'Columnas'], ['principal', 'Diag. ppal'], ['secundaria', 'Diag. sec'], ['zigzag', 'Zig-zag'], ['espiral', 'Espiral']] },
      { t: 'play', label: 'Recorrer', sweep: { key: 'p', from: 0, to: 16, paso: 1, ms: 320 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 16, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const n = 4, m = 4;
      const orden = ordenRecorrido(s.modo, n, m);
      const hasta = Math.min(s.p, orden.length);
      const est = M4.map(f => f.map(() => 'normal'));
      for (let k = 0; k < hasta; k++) est[orden[k][0]][orden[k][1]] = 'ok';
      if (hasta > 0) est[orden[hasta - 1][0]][orden[hasta - 1][1]] = 'lee';
      const x0 = Math.max(40, (g.w - (m * 43)) / 2);
      const r = g.matriz(M4, x0, 42, { estados: est, nombre: 'M', cw: 40, ch: 30 });
      /* traza del camino */
      const cx = g.ctx; cx.save();
      cx.strokeStyle = css('--blue'); cx.lineWidth = 1.4; cx.globalAlpha = .5;
      cx.beginPath();
      for (let k = 0; k < hasta; k++) {
        const c = r.geo[orden[k][0]][orden[k][1]];
        k === 0 ? cx.moveTo(c.cx, c.cy) : cx.lineTo(c.cx, c.cy);
      }
      cx.stroke(); cx.restore();
      const COD = {
        filas: 'PARA I = 1, N, 1 · PARA J = 1, M, 1 · M(I,J)',
        columnas: 'PARA J = 1, M, 1 · PARA I = 1, N, 1 · M(I,J)',
        principal: 'PARA I = 1, N, 1 HAGA · M(I, I)',
        secundaria: 'PARA I = 1, N, 1 HAGA · M(I, N - I + 1)',
        zigzag: 'SI (I MOD 2 = 1) ENTONCES J = 1..M SINO J = M..1',
        espiral: 'cuatro límites que se cierran: t, b, l, r'
      };
      g.texto(x0, g.h - 22, COD[s.modo], { size: 11, color: '--fg2' });
      const NOTA = {
        principal: 'Un solo ciclo: fila y columna son el mismo índice.',
        secundaria: 'Ojo con el <b>+1</b>: con índices base 1 la fórmula es <code class="inl">M(I, N − I + 1)</code>. Escribir <code class="inl">N − I</code> se sale de la matriz.',
        zigzag: 'El SI sobre la paridad de I es lo único que lo separa de un recorrido normal.',
        espiral: 'No está en el syllabus, pero es el mejor ejercicio para entender límites móviles.',
        filas: 'Por cada vuelta de I, J da una vuelta completa: 16 visitas, no 8.',
        columnas: 'Mismo bucle, papeles intercambiados: J manda y I recorre.'
      };
      return {
        stats: [['visitadas', hasta], ['de', orden.length],
          ['I', hasta ? orden[hasta - 1][0] + 1 : '—'], ['J', hasta ? orden[hasta - 1][1] + 1 : '—']],
        note: NOTA[s.modo]
      };
    }
  });

  def('transpuesta', {
    title: 'Transpuesta: el reflejo sobre la diagonal',
    sub: 'B(I,J) ← A(J,I)',
    ratio: 0.46, minH: 230,
    legend: [{ c: '--blue', t: 'se lee en A' }, { c: '--green', t: 'se escribe en B' }, { c: '--violet', t: 'diagonal' }],
    controls: [
      { t: 'play', label: 'Transponer', sweep: { key: 'p', from: 0, to: 9, paso: 1, ms: 420 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 9, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const n = 3;
      const B = [[null, null, null], [null, null, null], [null, null, null]];
      const orden = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) orden.push([i, j]);
      const hasta = Math.min(s.p, orden.length);
      for (let k = 0; k < hasta; k++) { const [i, j] = orden[k]; B[i][j] = M3[j][i]; }
      const cur = hasta > 0 ? orden[hasta - 1] : null;
      const estA = M3.map((f, i) => f.map((_, j) =>
        cur && i === cur[1] && j === cur[0] ? 'lee' : (i === j ? 'activa' : 'normal')));
      const estB = B.map((f, i) => f.map((v, j) =>
        cur && i === cur[0] && j === cur[1] ? 'escribe' : (v === null ? 'normal' : (i === j ? 'activa' : 'ok'))));
      const cw = 36;
      const x1 = 44, x2 = x1 + n * (cw + 3) + 56;
      g.matriz(M3, x1, 44, { estados: estA, nombre: 'A', cw, ch: 28 });
      g.matriz(B, x2, 44, { estados: estB, nombre: 'B', cw, ch: 28 });
      g.flecha(x1 + n * (cw + 3) + 6, 44 + n * 15, x2 - 12, 44 + n * 15, { color: '--fg3' });
      return {
        stats: [['I', cur ? cur[0] + 1 : '—'], ['J', cur ? cur[1] + 1 : '—'], ['copiadas', hasta]],
        note: hasta >= orden.length
          ? 'La diagonal principal queda intacta: son las únicas casillas donde I = J. Si se transpone <i>in situ</i> recorriendo la matriz entera, se transpone dos veces y queda igual.'
          : 'Cada casilla de B se llena con la casilla espejo de A: fila y columna intercambiadas.'
      };
    }
  });

  def('multiplicacion', {
    title: 'Multiplicación: fila por columna',
    sub: 'C(I,J) acumula A(I,K) · B(K,J)',
    ratio: 0.5, minH: 250,
    legend: [{ c: '--blue', t: 'fila de A' }, { c: '--violet', t: 'columna de B' }, { c: '--green', t: 'celda de C' }],
    controls: [
      { t: 'play', label: 'Multiplicar', sweep: { key: 'p', from: 0, to: 12, paso: 1, ms: 480 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 12, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]];
      const C = [[null, null], [null, null]];
      /* 4 celdas × 2 productos = 8 pasos + 4 cierres */
      const seq = [];
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) seq.push({ i, j, k });
        seq.push({ i, j, k: -1 });
      }
      const hasta = Math.min(s.p, seq.length);
      let sum = 0;
      for (let n = 0; n < hasta; n++) {
        const q = seq[n];
        if (q.k === -1) { C[q.i][q.j] = sum; sum = 0; }
        else sum += A[q.i][q.k] * B[q.k][q.j];
      }
      const cur = hasta > 0 ? seq[hasta - 1] : null;
      const estA = A.map((f, i) => f.map((_, k) => cur && i === cur.i ? (k === cur.k ? 'lee' : 'activa') : 'normal'));
      const estB = B.map((f, k) => f.map((_, j) => cur && j === cur.j ? (k === cur.k ? 'lee' : 'activa') : 'normal'));
      const estC = C.map((f, i) => f.map((v, j) => cur && i === cur.i && j === cur.j ? 'escribe' : (v === null ? 'normal' : 'ok')));
      const cw = 40;
      const x1 = 46, x2 = x1 + 2 * (cw + 3) + 44, x3 = x2 + 2 * (cw + 3) + 48;
      g.matriz(A, x1, 60, { estados: estA, nombre: 'A', cw, ch: 30 });
      g.matriz(B, x2, 60, { estados: estB, nombre: 'B', cw, ch: 30 });
      g.matriz(C, x3, 60, { estados: estC, nombre: 'C', cw, ch: 30 });
      g.texto(x2 - 26, 60 + 32, '×', { size: 15, color: '--fg3', align: 'center' });
      g.texto(x3 - 26, 60 + 32, '=', { size: 15, color: '--fg3', align: 'center' });
      g.texto(46, g.h - 24, 'S ← 0  ·  PARA K = 1, M1, 1 HAGA  S ← S + A(I,K) * B(K,J)  ·  C(I,J) ← S',
        { size: 11, color: '--fg2' });
      return {
        stats: [['I', cur ? cur.i + 1 : '—'], ['J', cur ? cur.j + 1 : '—'],
          ['K', cur && cur.k >= 0 ? cur.k + 1 : '—'], ['S', cur && cur.k >= 0 ? sum : '—']],
        note: cur && cur.k === -1
          ? 'Cierre de la casilla: <code class="inl">C(I,J) ← S</code>. Y <b>S vuelve a 0</b> antes de la siguiente, o todo sale mal a partir de aquí.'
          : 'La fila I de A recorre la columna J de B, y los productos se van acumulando en S.'
      };
    }
  });

  def('cuadrantes', {
    title: 'Cuadrantes de una matriz 2N × 2N',
    sub: 'ejercicio 9 de subrutinas del manual',
    ratio: 0.5, minH: 240,
    legend: [{ c: '--blue', t: 'cuadrante I' }, { c: '--violet', t: 'cuadrante II' }, { c: '--green', t: 'intercambiados' }],
    controls: [
      { t: 'seg', key: 'q', val: 'ver', options: [['ver', 'Ver cuadrantes'], ['swap', 'Intercambiar I ↔ II']] },
      { t: 'reset' }
    ],
    draw(g, s) {
      const N = 2;
      let M = [[1, 2, 5, 6], [3, 4, 7, 8], [9, 10, 13, 14], [11, 12, 15, 16]];
      if (s.q === 'swap') {
        M = M.map(f => f.slice());
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
          const t = M[i][j]; M[i][j] = M[i][j + N]; M[i][j + N] = t;
        }
      }
      const est = M.map((f, i) => f.map((_, j) => {
        const q = (i < N ? 0 : 2) + (j < N ? 0 : 1);
        if (s.q === 'swap' && q <= 1) return 'ok';
        return q === 0 ? 'lee' : q === 1 ? 'activa' : 'normal';
      }));
      const cw = 42;
      const x0 = Math.max(44, (g.w - 4 * (cw + 3)) / 2);
      const r = g.matriz(M, x0, 52, { estados: est, nombre: 'A', cw, ch: 32 });
      /* separadores de cuadrante */
      const midX = r.geo[0][N].x - 2, midY = r.geo[N][0].y - 2;
      g.linea(midX, 44, midX, 52 + r.alto + 4, { color: '--fg3', dash: [5, 4], lw: 1.4 });
      g.linea(x0 - 6, midY, x0 + r.ancho + 6, midY, { color: '--fg3', dash: [5, 4], lw: 1.4 });
      ['I', 'II', 'III', 'IV'].forEach((et, k) => {
        const i = k < 2 ? 0 : N, j = (k % 2) ? N : 0;
        g.texto(r.geo[i][j].x + cw - 6, r.geo[i][j].y - 12, et, { size: 10, color: '--fg3' });
      });
      return {
        stats: [['N', N], ['tamaño', '2N × 2N = 4 × 4']],
        note: s.q === 'swap'
          ? 'El intercambio es celda a celda: <code class="inl">T ← A(I,J) · A(I,J) ← A(I,J+N) · A(I,J+N) ← T</code>, con I y J recorriendo sólo de 1 a N.'
          : 'Los cuatro bloques se indexan con desplazamientos de N. El cuadrante II empieza en la columna N+1; el III en la fila N+1.'
      };
    }
  });

  /* ================================================================
     CORTE 2 · CADENAS
     ================================================================ */

  def('operaciones-cadena', {
    title: 'Las primitivas de cadena, sobre la misma palabra',
    sub: "C ← 'argentina'",
    ratio: 0.4, minH: 200,
    legend: [{ c: '--blue', t: 'lo que devuelve' }, { c: '--fg3', t: 'lo que queda fuera', bg: false }],
    controls: [
      { t: 'seg', key: 'op', val: 'izq', options: [['izq', 'IZQ'], ['der', 'DER'], ['substr', 'SUBSTR'], ['long', 'LONG']] },
      { t: 'range', key: 'n', min: 1, max: 6, val: 3, label: 'n' },
      { t: 'range', key: 'p', min: 1, max: 7, val: 3, label: 'posini' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const C = 'argentina'.split('');
      const L = C.length;
      let dentro = () => false, expr = '', res = '';
      if (s.op === 'izq') { dentro = i => i < s.n; expr = `IZQ(C, ${s.n})`; res = C.slice(0, s.n).join(''); }
      else if (s.op === 'der') { dentro = i => i >= L - s.n; expr = `DER(C, ${s.n})`; res = C.slice(L - s.n).join(''); }
      else if (s.op === 'substr') { dentro = i => i >= s.p - 1 && i < s.p - 1 + s.n; expr = `SUBSTR(C, ${s.p}, ${s.n})`; res = C.slice(s.p - 1, s.p - 1 + s.n).join(''); }
      else { dentro = () => true; expr = 'LONG(C)'; res = String(L); }
      const est = C.map((_, i) => dentro(i) ? 'lee' : 'apagada');
      const r = g.vector(C, 24, 54, { estados: est, ch: 34, nombre: 'C', cw: Math.floor((g.w - 60) / L) - 4 });
      g.texto(24, 28, expr + '  →  ' + (s.op === 'long' ? res : "'" + res + "'"),
        { size: 13, color: '--fg', peso: '600' });
      if (s.op === 'substr' && r.geo[s.p - 1])
        g.puntero(r.geo[s.p - 1].cx, 54 + 34 + 16, 'posini', '--amber');
      g.texto(24, g.h - 24, 'Las posiciones se cuentan desde 1: SUBSTR(C, 1, 1) es el primer carácter.',
        { size: 11, color: '--fg3' });
      return {
        stats: [['LONG(C)', L], ['n', s.n], ['posini', s.op === 'substr' ? s.p : '—']],
        note: s.op === 'der'
          ? 'DER extrae desde la derecha pero <b>conserva el orden</b>: no invierte nada.'
          : s.op === 'substr'
            ? 'SUBSTR es la más general: con ella se pueden simular IZQ y DER.'
            : s.op === 'long' ? 'LONG cuenta caracteres, espacios incluidos.'
              : 'IZQ toma los n primeros. Si n supera la longitud, devuelve la cadena entera.'
      };
    }
  });

  def('ventana-deslizante', {
    title: 'Buscar una subcadena: la ventana que se desliza',
    sub: 'el ciclo llega a L1 − L2 + 1, no a L1',
    ratio: 0.42, minH: 210,
    legend: [{ c: '--blue', t: 'ventana actual' }, { c: '--green', t: 'coincidencia' }],
    controls: [
      { t: 'play', label: 'Buscar', sweep: { key: 'p', from: 1, to: 12, paso: 1, ms: 420 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 1, max: 12, val: 1, label: 'I' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const G = 'La nina de sus ojos'.split('');
      const B = 'nina';
      const L1 = G.length, L2 = B.length;
      const lim = L1 - L2 + 1;
      const I = Math.min(s.p, lim);
      const trozo = G.slice(I - 1, I - 1 + L2).join('');
      const hit = trozo === B;
      const est = G.map((_, k) => (k >= I - 1 && k < I - 1 + L2) ? (hit ? 'escribe' : 'lee') : 'normal');
      const cw = Math.max(15, Math.floor((g.w - 50) / L1) - 3);
      g.vector(G, 24, 56, { estados: est, ch: 32, cw, gap: 3, nombre: 'GRANDE' });
      g.texto(24, 30, `BUSCADA = '${B}'   ·   SUBSTR(GRANDE, ${I}, ${L2}) = '${trozo}'`,
        { size: 12, color: hit ? '--green' : '--fg2', peso: hit ? '600' : '' });
      g.texto(24, g.h - 24, `El ciclo va de 1 a L1 − L2 + 1 = ${L1} − ${L2} + 1 = ${lim}. Más allá la ventana ya no cabe.`,
        { size: 11, color: '--fg3' });
      return {
        stats: [['I', I], ['L1', L1], ['L2', L2], ['límite', lim]],
        note: hit
          ? `Coincide en la posición <b>${I}</b>. Con bandera, el ciclo para aquí.`
          : 'No coincide: la ventana avanza una posición y se vuelve a comparar.'
      };
    }
  });

  def('cadena-matriz', {
    title: 'Buscar una frase dentro de una matriz de frases',
    sub: 'punto 2 del preparcial, casilla por casilla',
    ratio: 0.52, minH: 240,
    legend: [{ c: '--blue', t: 'casilla inspeccionada' }, { c: '--green', t: 'encontrada' }],
    controls: [
      { t: 'play', label: 'Buscar', sweep: { key: 'p', from: 0, to: 12, paso: 1, ms: 420 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 12, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const M = [
        ['Gato con botas', 'Mar muerto', 'Soy capaz', 'Todo lo puedo'],
        ['Dama y caballero', 'Querer es poder', 'Dios te ama', 'Vida eterna'],
        ['La nina de sus ojos', 'Soy exitoso', 'La vida es bella', 'Naturaleza es vida']
      ];
      const ST1 = 'La nina';
      const orden = [];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) orden.push([i, j]);
      const hasta = Math.min(s.p, orden.length);
      let hallada = null;
      for (let k = 0; k < hasta; k++) {
        const [i, j] = orden[k];
        if (M[i][j].indexOf(ST1) >= 0) { hallada = [i, j]; break; }
      }
      const cur = hasta > 0 ? orden[Math.min(hasta, orden.length) - 1] : null;
      const cw = Math.max(60, Math.floor((g.w - 70) / 4) - 4);
      const y0 = 46, ch = 40;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
          const x = 40 + j * (cw + 4), y = y0 + i * (ch + 4);
          const esHit = hallada && hallada[0] === i && hallada[1] === j;
          const esCur = cur && cur[0] === i && cur[1] === j && !hallada;
          const est = esHit ? 'escribe' : esCur ? 'lee' : (hasta > orden.findIndex(o => o[0] === i && o[1] === j) ? 'tenue' : 'normal');
          const e = C().ESTADO[est];
          g.caja(x, y, cw, ch, {
            fill: e.mixbg ? mix(e.mixbg[0], e.mixbg[1]) : css('--panel'),
            color: e.bd, r: 5, dash: e.dash
          });
          const txt = M[i][j];
          const corto = txt.length > Math.floor(cw / 5.6) ? txt.slice(0, Math.floor(cw / 5.6) - 1) + '…' : txt;
          g.texto(x + cw / 2, y + ch / 2, corto, { align: 'center', size: 9, color: e.fg, mono: false });
        }
        g.etiqueta(33, y0 + i * (ch + 4) + ch / 2, String(i + 1), { align: 'right' });
      }
      for (let j = 0; j < 4; j++) g.etiqueta(40 + j * (cw + 4) + cw / 2, y0 - 10, String(j + 1), { align: 'center' });
      g.texto(40, 26, `st1 = "${ST1}"`, { size: 12, color: '--fg' });
      return {
        stats: [['i', cur ? cur[0] + 1 : '—'], ['j', cur ? cur[1] + 1 : '—'], ['revisadas', hasta]],
        note: hallada
          ? `Encontrada en <b>[${hallada[0] + 1}, ${hallada[1] + 1}]</b>, dentro de «${M[hallada[0]][hallada[1]]}». Ésa es exactamente la salida que pide el enunciado.`
          : 'Doble ciclo sobre la matriz y, dentro de cada casilla, la ventana deslizante del visualizador anterior. Tres niveles: por eso conviene separar la búsqueda en una función.'
      };
    }
  });

  /* ================================================================
     CORTE 3 · PROCEDIMIENTOS
     ================================================================ */

  def('pila-marcos', {
    title: 'Llamada y retorno: la pila de marcos',
    sub: 'la Figura 1 del manual, viva',
    ratio: 0.5, minH: 250,
    legend: [{ c: '--violet', t: 'marco activo' }, { c: '--border2', t: 'esperando', bg: false }],
    controls: [
      { t: 'play', label: 'Ejecutar', sweep: { key: 'p', from: 0, to: 10, paso: 1, ms: 620 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 10, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const guion = [
        { pila: ['INICIO'], linea: 0, txt: 'Empieza el algoritmo principal.' },
        { pila: ['INICIO'], linea: 1, txt: 'Se invoca saludar: el principal se detiene aquí.' },
        { pila: ['INICIO', 'saludar'], linea: 5, txt: 'Nace el marco de saludar, con su NOMBRE local.' },
        { pila: ['INICIO', 'saludar'], linea: 6, txt: 'Cuerpo de saludar.' },
        { pila: ['INICIO'], linea: 2, txt: 'Termina saludar: su marco desaparece y el control vuelve a la línea siguiente.' },
        { pila: ['INICIO'], linea: 3, txt: 'Se invoca despedir.' },
        { pila: ['INICIO', 'despedir'], linea: 8, txt: 'Marco de despedir.' },
        { pila: ['INICIO', 'despedir', 'saludar'], linea: 5, txt: 'despedir llama a saludar: tres marcos a la vez.' },
        { pila: ['INICIO', 'despedir'], linea: 9, txt: 'Vuelve a despedir.' },
        { pila: ['INICIO'], linea: 4, txt: 'Vuelve al principal.' },
        { pila: [], linea: 4, txt: 'Fin. La pila queda vacía: todo lo que se apiló se desapiló.' }
      ];
      const st = guion[Math.min(s.p, guion.length - 1)];
      const cod = [
        'INICIO', '    EJECUTE saludar(…)', '    ESCRIBA "volvi"',
        '    EJECUTE despedir()', 'FIN', 'SUBRUTINA saludar (NOMBRE)',
        '    ESCRIBA "Hola", NOMBRE', 'FIN_SUBRUTINA', 'SUBRUTINA despedir ()',
        '    EJECUTE saludar(…)', 'FIN_SUBRUTINA'
      ];
      g.codigo(cod, 26, 26, st.linea, { lh: 16, w: Math.min(280, g.w * 0.5) });
      const x = Math.min(320, g.w * 0.55), mw = Math.min(190, g.w - x - 24), mh = 34;
      g.texto(x, 20, 'PILA DE LLAMADAS', { size: 10, color: '--fg3' });
      const baseY = 30 + 3 * (mh + 6);
      st.pila.forEach((n, k) => {
        const y = baseY - k * (mh + 6);
        g.marco(x, y, mw, mh, n, k === 0 ? 'principal' : 'subrutina',
          k === st.pila.length - 1 ? 'activa' : 'normal');
      });
      if (!st.pila.length) g.texto(x, baseY + 14, '(vacía)', { size: 11, color: '--fg3' });
      return {
        stats: [['profundidad', st.pila.length], ['marco activo', st.pila[st.pila.length - 1] || '—']],
        note: st.txt
      };
    }
  });

  def('valor-vs-referencia', {
    title: 'Paso por valor contra paso por referencia',
    sub: '(E) recibe una copia · (S) y (E/S) reciben la caja misma',
    ratio: 0.46, minH: 230,
    legend: [{ c: '--blue', t: 'copia' }, { c: '--green', t: 'misma caja' }, { c: '--red', t: 'no cambia fuera' }],
    controls: [
      { t: 'seg', key: 'tipo', val: 'valor', options: [['valor', 'Escalar (E) · por valor'], ['ref', 'Arreglo (S) · por referencia']] },
      { t: 'play', label: 'Ejecutar', sweep: { key: 'p', from: 0, to: 3, paso: 1, ms: 800 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 3, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const porValor = s.tipo === 'valor';
      const fueraV = porValor ? 5 : (s.p >= 2 ? 999 : 5);
      const dentroV = s.p === 0 ? '—' : (s.p >= 2 ? 999 : 5);
      const yA = 58, w = 92, h = 44;
      const xF = 44, xD = Math.min(xF + 230, g.w - w - 40);

      g.texto(xF, 34, 'ALGORITMO PRINCIPAL', { size: 10, color: '--fg3' });
      g.texto(xD, 34, 'DENTRO DEL PROCEDIMIENTO', { size: 10, color: '--fg3' });

      const estF = (!porValor && s.p >= 2) ? 'escribe' : (porValor && s.p >= 3 ? 'error' : 'normal');
      g.caja(xF, yA, w, h, { fill: mix(estF === 'escribe' ? '--green' : estF === 'error' ? '--red' : '--fg3', estF === 'normal' ? 8 : 16), color: estF === 'escribe' ? '--green' : estF === 'error' ? '--red' : '--border2', r: 6 });
      g.texto(xF + w / 2, yA + h / 2 - 7, porValor ? 'A' : 'B(1)', { align: 'center', size: 11, color: '--fg2' });
      g.texto(xF + w / 2, yA + h / 2 + 9, String(fueraV), { align: 'center', size: 14, peso: '600', color: '--fg' });

      if (s.p >= 1) {
        const estD = s.p >= 2 ? 'escribe' : 'lee';
        const col = porValor ? '--blue' : '--green';
        g.caja(xD, yA, w, h, { fill: mix(col, 16), color: col, r: 6, dash: porValor });
        g.texto(xD + w / 2, yA + h / 2 - 7, porValor ? 'X (copia)' : 'V (la misma)', { align: 'center', size: 10, color: '--fg2' });
        g.texto(xD + w / 2, yA + h / 2 + 9, String(dentroV), { align: 'center', size: 14, peso: '600', color: '--fg' });
        g.flecha(xF + w + 6, yA + h / 2, xD - 8, yA + h / 2, { color: col, dash: porValor });
        g.texto((xF + w + xD) / 2, yA + h / 2 - 14, porValor ? 'copia' : 'referencia',
          { align: 'center', size: 10, color: col });
        if (!porValor && s.p >= 2)
          g.flecha(xD - 8, yA + h - 8, xF + w + 6, yA + h - 8, { color: '--green' });
      }

      g.codigo(porValor
        ? ['SUBRUTINA cambia (X)', '    X ← 999', 'FIN_SUBRUTINA', '', 'A ← 5', 'EJECUTE cambia(A)', 'ESCRIBA A']
        : ['SUBRUTINA cambia (V)', '    V(1) ← 999', 'FIN_SUBRUTINA', '', 'B(1) ← 5', 'EJECUTE cambia(B)', 'ESCRIBA B(1)'],
        xF, yA + h + 34, s.p >= 2 ? 1 : (s.p === 1 ? 5 : -1), { lh: 15, w: 240 });

      return {
        stats: [['fuera', fueraV], ['dentro', dentroV]],
        note: s.p < 3
          ? (porValor ? 'El procedimiento recibe una <b>copia</b>: lo que escriba dentro no sale.'
            : 'El procedimiento recibe la <b>caja misma</b>: lo que escriba dentro se ve fuera.')
          : (porValor
            ? 'Fuera, A <b>sigue valiendo 5</b>. Por eso un escalar que hay que devolver no puede ser de Entrada.'
            : 'Fuera, B(1) <b>ya vale 999</b>. Por eso llenar un vector obliga a usar subrutina: la función no podría.')
      };
    }
  });

  def('funcion-o-subrutina', {
    title: '¿Función o subrutina?',
    sub: 'el criterio que evalúa el parcial',
    ratio: 0.4, minH: 190,
    controls: [
      { t: 'seg', key: 'caso', val: 'promedio', options: [['promedio', 'Promedio'], ['ordenar', 'Ordenar'], ['contar', 'Contar'], ['llenar', 'Llenar']] },
      { t: 'reset' }
    ],
    draw(g, s) {
      const CASOS = {
        promedio: { q: 'El promedio de un vector', r: 'FUNCION', why: 'Un solo número.', cod: 'FUNCION promedio (N, V)\n    …\n    promedio ← S / N\nFIN_FUNCION' },
        ordenar: { q: 'El vector ya ordenado', r: 'SUBRUTINA', why: 'Un conjunto: el vector entero.', cod: 'SUBRUTINA ordenar (N, V)\n    { burbuja sobre V }\nFIN_SUBRUTINA' },
        contar: { q: 'Cuántos negativos hay', r: 'FUNCION', why: 'Un solo número.', cod: 'FUNCION negativos (N, V)\n    …\n    negativos ← C\nFIN_FUNCION' },
        llenar: { q: 'Llenar un vector leyendo del teclado', r: 'SUBRUTINA', why: 'El resultado es el vector: un conjunto.', cod: 'SUBRUTINA leavector (N, V)\n    PARA I = 1, N, 1 HAGA\n        LEA V(I)\n    F-PARA\nFIN_SUBRUTINA' }
      };
      const c = CASOS[s.caso];
      const esFun = c.r === 'FUNCION';
      g.texto(30, 32, c.q, { size: 14, color: '--fg', mono: false, peso: '600' });
      const w = Math.min(200, (g.w - 90) / 2), y = 58, h = 46;
      [['FUNCION', 'un solo dato'], ['SUBRUTINA', 'un conjunto, o nada']].forEach((op, k) => {
        const x = 30 + k * (w + 24);
        const activo = op[0] === c.r;
        g.caja(x, y, w, h, {
          fill: activo ? mix('--green', 16) : mix('--fg3', 5),
          color: activo ? '--green' : '--border2', r: 8, lw: activo ? 1.8 : 1.2
        });
        g.texto(x + w / 2, y + h / 2 - 8, op[0], { align: 'center', size: 12, peso: '600', color: activo ? '--green' : '--fg3' });
        g.texto(x + w / 2, y + h / 2 + 9, op[1], { align: 'center', size: 10, color: '--fg3' });
      });
      g.codigo(c.cod.split('\n'), 30, y + h + 30, -1, { lh: 15, w: g.w - 60 });
      return {
        stats: [['respuesta', c.r]],
        note: `<b>${c.why}</b> ` + (esFun
          ? 'Se invoca sin EJECUTE y su nombre sirve como variable dentro de una expresión.'
          : 'Se invoca con EJECUTE y devuelve por sus parámetros. Toda función puede escribirse como subrutina, pero no al revés.')
      };
    }
  });

  /* ================================================================
     CORTE 4 · RECURSIVIDAD Y MEMORIA
     ================================================================ */

  def('arbol-recursion', {
    title: 'El árbol de llamadas',
    sub: 'baja abriendo llamadas, sube plegando resultados',
    ratio: 0.55, minH: 260,
    legend: [{ c: '--blue', t: 'llamada abierta' }, { c: '--green', t: 'ya devolvió' }, { c: '--violet', t: 'caso base' }],
    controls: [
      { t: 'seg', key: 'f', val: 'fact', options: [['fact', 'factorial(5)'], ['fib', 'fib(5)']] },
      { t: 'play', label: 'Desplegar', sweep: { key: 'p', from: 0, to: 30, paso: 1, ms: 300 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 30, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      /* construir el árbol con orden de visita (pre) y de retorno (post) */
      const nodos = [];
      let orden = 0;
      function fact(n, prof, x) {
        const id = nodos.length;
        nodos.push({ n, prof, x, pre: orden++, post: -1, val: null, base: n === 0, hijos: [] });
        if (n > 0) { const h = fact(n - 1, prof + 1, x); nodos[id].hijos.push(h); }
        nodos[id].post = orden++;
        nodos[id].val = n === 0 ? 1 : n * nodos[nodos[id].hijos[0]].val;
        return id;
      }
      function fib(n, prof, x) {
        const id = nodos.length;
        nodos.push({ n, prof, x, pre: orden++, post: -1, val: null, base: n <= 2, hijos: [] });
        if (n > 2) {
          nodos[id].hijos.push(fib(n - 1, prof + 1, x - 1));
          nodos[id].hijos.push(fib(n - 2, prof + 1, x + 1));
        }
        nodos[id].post = orden++;
        nodos[id].val = n <= 2 ? 1 : nodos[nodos[id].hijos[0]].val + nodos[nodos[id].hijos[1]].val;
        return id;
      }
      s.f === 'fact' ? fact(5, 0, 0) : fib(5, 0, 0);

      /* colocar por nivel */
      const porNivel = {};
      nodos.forEach(nd => { (porNivel[nd.prof] = porNivel[nd.prof] || []).push(nd); });
      const niveles = Object.keys(porNivel).length;
      const dy = Math.min(46, (g.h - 60) / Math.max(1, niveles));
      Object.keys(porNivel).forEach(k => {
        const fila = porNivel[k];
        const dx = g.w / (fila.length + 1);
        fila.forEach((nd, i) => { nd.px = dx * (i + 1); nd.py = 34 + k * dy; });
      });

      /* aristas */
      nodos.forEach(nd => nd.hijos.forEach(h => {
        const c = nodos[h];
        const viva = s.p >= c.pre;
        g.linea(nd.px, nd.py + 17, c.px, c.py - 17, { color: viva ? '--border2' : '--border', dash: !viva });
      }));
      let devueltos = 0, abiertos = 0;
      nodos.forEach(nd => {
        if (s.p < nd.pre) return;
        const cerrado = s.p >= nd.post;
        if (cerrado) devueltos++; else abiertos++;
        const est = cerrado ? 'ok' : (nd.base ? 'activa' : 'lee');
        g.nodo(nd.px, nd.py, String(nd.n), { estado: est, r: 16 });
        if (cerrado) g.texto(nd.px, nd.py + 27, '→ ' + nd.val, { align: 'center', size: 10, color: '--green' });
      });
      g.texto(14, g.h - 14, s.f === 'fact'
        ? 'factorial(N) = N * factorial(N − 1)   ·   caso base N = 0'
        : 'fib(N) = fib(N−1) + fib(N−2)   ·   caso base N ≤ 2', { size: 11, color: '--fg3' });
      return {
        stats: [['llamadas', nodos.length], ['abiertas', abiertos], ['devueltas', devueltos],
          ['profundidad', niveles]],
        note: s.f === 'fib'
          ? `fib(5) hace <b>${nodos.length}</b> llamadas para un resultado que iterando cuesta 5 pasos: hay subárboles repetidos que se recalculan enteros. Compáralo con factorial, que llama una sola vez por nivel.`
          : 'Una llamada por nivel: el coste es la <b>memoria</b> de la pila, no el tiempo. Primero baja hasta el caso base y sólo entonces empieza a devolver.'
      };
    }
  });

  def('hanoi', {
    title: 'Torres de Hanói',
    sub: 'mover n discos cuesta 2ⁿ − 1 movimientos',
    ratio: 0.44, minH: 220,
    legend: [{ c: '--violet', t: 'disco que se mueve' }],
    controls: [
      { t: 'range', key: 'n', min: 1, max: 5, val: 3, label: 'discos' },
      { t: 'play', label: 'Resolver', sweep: { key: 'p', from: 0, to: 31, paso: 1, ms: 380 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 31, val: 0, label: 'movimiento' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const n = s.n;
      const movs = [];
      (function h(k, a, b, c) { if (k === 0) return; h(k - 1, a, c, b); movs.push([a, c, k]); h(k - 1, b, a, c); })(n, 0, 1, 2);
      const torres = [[], [], []];
      for (let d = n; d >= 1; d--) torres[0].push(d);
      const hasta = Math.min(s.p, movs.length);
      let ultimo = null;
      for (let k = 0; k < hasta; k++) {
        const [de, a, disco] = movs[k];
        torres[a].push(torres[de].pop());
        ultimo = disco;
      }
      const baseY = g.h - 42, tw = g.w / 3, maxW = tw - 34, dh = 15;
      for (let t = 0; t < 3; t++) {
        const cx = tw * t + tw / 2;
        g.linea(cx, baseY - (n + 0.6) * dh, cx, baseY, { color: '--border2', lw: 2 });
        g.linea(tw * t + 14, baseY, tw * (t + 1) - 14, baseY, { color: '--border2', lw: 2 });
        g.etiqueta(cx, baseY + 16, ['origen', 'auxiliar', 'destino'][t], { align: 'center' });
        torres[t].forEach((d, k) => {
          const w = maxW * (d / n) * 0.9;
          const y = baseY - (k + 1) * dh;
          const activo = d === ultimo && k === torres[t].length - 1 && hasta > 0;
          g.caja(cx - w / 2, y, w, dh - 2, {
            fill: mix(activo ? '--violet' : '--blue', activo ? 26 : 14),
            color: activo ? '--violet' : '--blue', r: 3
          });
          g.texto(cx, y + (dh - 2) / 2, String(d), { align: 'center', size: 9, color: '--fg2' });
        });
      }
      return {
        stats: [['discos', n], ['movimiento', hasta], ['total', movs.length], ['2ⁿ − 1', Math.pow(2, n) - 1]],
        note: hasta >= movs.length
          ? `Resuelto en <b>${movs.length}</b> movimientos, que es exactamente 2<sup>${n}</sup> − 1. Añadir un disco <b>duplica</b> el trabajo.`
          : 'Cada llamada mueve n−1 discos al auxiliar, pasa el grande, y vuelve a mover los n−1. Ahí están las dos preguntas: caso base n = 0, y cada llamada con un disco menos.'
      };
    }
  });

  def('lifo-fifo', {
    title: 'Pila contra cola',
    sub: 'LIFO y FIFO, con las mismas entradas',
    ratio: 0.44, minH: 210,
    legend: [{ c: '--green', t: 'entra' }, { c: '--amber', t: 'sale' }],
    controls: [
      { t: 'play', label: 'Operar', sweep: { key: 'p', from: 0, to: 7, paso: 1, ms: 620 } },
      { t: 'paso' },
      { t: 'range', key: 'p', min: 0, max: 7, val: 0, label: 'paso' },
      { t: 'reset' }
    ],
    draw(g, s) {
      const ops = [['in', 10], ['in', 20], ['in', 30], ['out'], ['out'], ['in', 40], ['out']];
      const pila = [], cola = [];
      let salP = [], salC = [];
      for (let k = 0; k < Math.min(s.p, ops.length); k++) {
        const [o, v] = ops[k];
        if (o === 'in') { pila.push(v); cola.push(v); }
        else { salP.push(pila.pop()); salC.push(cola.shift()); }
      }
      const ultimo = s.p > 0 && s.p <= ops.length ? ops[s.p - 1] : null;
      const w = Math.min(200, (g.w - 90) / 2);
      const cellH = 26;

      g.texto(40, 26, 'PILA (LIFO)', { size: 11, color: '--fg2' });
      g.texto(40 + w + 44, 26, 'COLA (FIFO)', { size: 11, color: '--fg2' });

      pila.forEach((v, k) => {
        const y = 46 + (pila.length - 1 - k) * (cellH + 3);
        const act = ultimo && ultimo[0] === 'in' && k === pila.length - 1;
        g.celda(40, y, w, cellH, v, act ? 'escribe' : 'normal');
      });
      cola.forEach((v, k) => {
        const x = 40 + w + 44 + k * 46;
        const act = ultimo && ultimo[0] === 'in' && k === cola.length - 1;
        g.celda(x, 46, 42, cellH, v, act ? 'escribe' : 'normal');
      });
      if (cola.length) {
        g.etiqueta(40 + w + 44 + 21, 46 + cellH + 10, 'frente', { align: 'center' });
        g.etiqueta(40 + w + 44 + (cola.length - 1) * 46 + 21, 46 + cellH + 22, 'final', { align: 'center' });
      }
      g.texto(40, g.h - 40, 'salieron: ' + (salP.length ? salP.join(', ') : '—'), { size: 11, color: '--amber' });
      g.texto(40 + w + 44, g.h - 40, 'salieron: ' + (salC.length ? salC.join(', ') : '—'), { size: 11, color: '--amber' });
      g.texto(40, g.h - 18, 'último en entrar, primero en salir', { size: 10, color: '--fg3' });
      g.texto(40 + w + 44, g.h - 18, 'primero en entrar, primero en salir', { size: 10, color: '--fg3' });
      return {
        stats: [['en la pila', pila.length], ['en la cola', cola.length]],
        note: salP.length
          ? `Con las mismas operaciones, la pila devolvió <b>${salP.join(', ')}</b> y la cola <b>${salC.join(', ')}</b>. La pila es exactamente lo que sostiene la recursividad: mira el panel «Pila de llamadas» de cualquier traza.`
          : 'Mismas entradas por los dos lados. La diferencia sólo se ve al empezar a sacar.'
      };
    }
  });

  /* ================================================================
     API
     ================================================================ */
  AYP.Viz = {
    render,
    existe: id => !!DEFS[id],
    ids: () => Object.keys(DEFS),
    montarTodos(host) {
      host.querySelectorAll('[data-viz]').forEach(n => render(n.dataset.viz, n));
    }
  };
})();
