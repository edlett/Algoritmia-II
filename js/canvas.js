/* ============================================================
   canvas.js — motor de dibujo para estructuras DISCRETAS.

   El equivalente de plot.js de Cálculo II, pero aquí no hay plano
   cartesiano: hay celdas, rejillas, barras, marcos de pila y árboles.
   Todo en coordenadas de pantalla, con un sistema de «filas» apiladas
   para no tener que calcular posiciones a mano en cada visualizador.

   Se redibuja solo al cambiar de tema y al redimensionar.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};

  const REG = [];

  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const mix = (v, p) => `color-mix(in srgb, ${css(v)} ${p}%, transparent)`;
  const fmt = n => {
    if (n === null || n === undefined) return '·';
    if (typeof n === 'number') {
      const r = Math.round(n * 1000) / 1000;
      return String(Object.is(r, -0) ? 0 : r).replace('.', ',');
    }
    return String(n);
  };

  /* Colores de estado, los mismos tokens que usa la traza */
  const ESTADO = {
    normal: { bg: '--panel', bd: '--border2', fg: '--fg' },
    lee: { bg: null, bd: '--blue', fg: '--fg', mixbg: ['--blue', 18], dash: true },
    escribe: { bg: null, bd: '--green', fg: '--fg', mixbg: ['--green', 22], bold: true },
    activa: { bg: null, bd: '--violet', fg: '--fg', mixbg: ['--violet', 16] },
    apagada: { bg: null, bd: '--border', fg: '--fg3', mixbg: ['--fg3', 8], tachada: true },
    tenue: { bg: null, bd: '--border', fg: '--fg3', mixbg: ['--fg3', 6] },   /* ya procesado, no descartado */
    ok: { bg: null, bd: '--green', fg: '--green', mixbg: ['--green', 14] },
    aviso: { bg: null, bd: '--amber', fg: '--amber', mixbg: ['--amber', 16] },
    error: { bg: null, bd: '--red', fg: '--red', mixbg: ['--red', 14] }
  };

  function crear(canvas, opts) {
    opts = opts || {};
    const g = {
      canvas,
      ctx: canvas.getContext('2d'),
      ratio: opts.ratio || 0.52,
      maxH: opts.maxH || 420,
      minH: opts.minH || 180
    };

    g.fit = function () {
      const host = canvas.parentElement;
      const w = Math.max(260, host ? host.clientWidth : 700);
      const h = Math.max(g.minH, Math.min(g.maxH, Math.round(w * g.ratio)));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = '100%';
      canvas.style.height = h + 'px';
      g.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.w = w; g.h = h;
    };

    g.clear = function () { g.ctx.clearRect(0, 0, g.w, g.h); g.cursorY = 14; };

    /* ---------- primitivas ---------- */

    g.texto = function (x, y, txt, o) {
      o = o || {};
      const c = g.ctx; c.save();
      c.font = (o.peso ? o.peso + ' ' : '') + (o.size || 12) + 'px ' + (o.mono === false ? css('--sans') : css('--mono'));
      c.fillStyle = o.color ? css(o.color) : css('--fg2');
      c.textAlign = o.align || 'left';
      c.textBaseline = o.baseline || 'middle';
      c.fillText(txt, x, y);
      const wd = c.measureText(txt).width;
      c.restore();
      return wd;
    };

    g.etiqueta = function (x, y, txt, o) {
      o = o || {};
      return g.texto(x, y, txt, Object.assign({ size: 10, color: '--fg3' }, o));
    };

    g.caja = function (x, y, w, h, o) {
      o = o || {};
      const c = g.ctx; c.save();
      const r = o.r === undefined ? 6 : o.r;
      c.beginPath();
      if (c.roundRect) c.roundRect(x, y, w, h, r);
      else c.rect(x, y, w, h);
      if (o.fill) { c.fillStyle = o.fill; c.fill(); }
      if (o.color) {
        c.strokeStyle = css(o.color);
        c.lineWidth = o.lw || 1.2;
        if (o.dash) c.setLineDash([4, 3]);
        c.stroke();
      }
      c.restore();
    };

    /* Una celda de memoria: la unidad de todo lo demás */
    g.celda = function (x, y, w, h, valor, estado, o) {
      o = o || {};
      const e = ESTADO[estado || 'normal'] || ESTADO.normal;
      const fill = e.mixbg ? mix(e.mixbg[0], e.mixbg[1]) : css(e.bg || '--panel');
      g.caja(x, y, w, h, { fill, color: e.bd, dash: e.dash, r: o.r === undefined ? 5 : o.r, lw: e.bold ? 1.6 : 1.2 });
      const t = fmt(valor);
      g.texto(x + w / 2, y + h / 2, t, {
        align: 'center', color: e.fg, size: o.size || 12,
        peso: e.bold ? '600' : ''
      });
      if (e.tachada) {
        const c = g.ctx; c.save();
        c.strokeStyle = css('--fg3'); c.lineWidth = 1;
        c.beginPath(); c.moveTo(x + 5, y + h / 2); c.lineTo(x + w - 5, y + h / 2); c.stroke();
        c.restore();
      }
    };

    /* Fila de celdas = vector. Devuelve la geometría para poder anotar. */
    g.vector = function (datos, x, y, o) {
      o = o || {};
      const n = datos.length;
      const cw = o.cw || Math.max(24, Math.min(46, Math.floor((g.w - x - 20) / Math.max(1, n)) - 4));
      const ch = o.ch || 30;
      const gap = o.gap === undefined ? 4 : o.gap;
      const base = o.base === undefined ? 1 : o.base;
      const geo = [];
      for (let i = 0; i < n; i++) {
        const cx = x + i * (cw + gap);
        const est = (o.estados && o.estados[i]) || 'normal';
        g.celda(cx, y, cw, ch, datos[i], est, { size: o.size });
        if (o.indices !== false) g.etiqueta(cx + cw / 2, y + ch + 9, String(i + base), { align: 'center' });
        geo.push({ x: cx, y, w: cw, h: ch, cx: cx + cw / 2, cy: y + ch / 2, i });
      }
      if (o.nombre) g.texto(x, y - 11, o.nombre, { size: 11, color: '--fg2' });
      return { geo, cw, ch, gap, ancho: n * (cw + gap) - gap, alto: ch + (o.indices !== false ? 14 : 0) };
    };

    /* Rejilla = matriz */
    g.matriz = function (datos, x, y, o) {
      o = o || {};
      const filas = datos.length, cols = datos[0] ? datos[0].length : 0;
      const cw = o.cw || Math.max(22, Math.min(40, Math.floor((g.w - x - 30) / Math.max(1, cols)) - 4));
      const ch = o.ch || Math.min(28, cw);
      const gap = o.gap === undefined ? 3 : o.gap;
      const base = o.base === undefined ? 1 : o.base;
      const geo = [];
      for (let r = 0; r < filas; r++) {
        geo.push([]);
        for (let c = 0; c < cols; c++) {
          const cx = x + c * (cw + gap), cy = y + r * (ch + gap);
          const est = (o.estados && o.estados[r] && o.estados[r][c]) || 'normal';
          g.celda(cx, cy, cw, ch, datos[r][c], est, { size: o.size || 11 });
          geo[r].push({ x: cx, y: cy, w: cw, h: ch, cx: cx + cw / 2, cy: cy + ch / 2 });
        }
        g.etiqueta(x - 7, y + r * (ch + gap) + ch / 2, String(r + base), { align: 'right' });
      }
      for (let c = 0; c < cols; c++)
        g.etiqueta(x + c * (cw + gap) + cw / 2, y - 9, String(c + base), { align: 'center' });
      if (o.nombre) g.texto(x - 7, y - 22, o.nombre, { size: 11, color: '--fg2', align: 'right' });
      return { geo, cw, ch, gap, ancho: cols * (cw + gap) - gap, alto: filas * (ch + gap) - gap };
    };

    /* Barras proporcionales (ordenamiento) */
    g.barras = function (datos, x, y, w, h, o) {
      o = o || {};
      const n = datos.length;
      const bw = Math.max(6, Math.floor(w / n) - 4);
      const max = Math.max.apply(null, datos.concat([1]));
      const geo = [];
      for (let i = 0; i < n; i++) {
        const bh = Math.max(4, Math.round(datos[i] / max * (h - 18)));
        const bx = x + i * (bw + 4), by = y + h - bh - 16;
        const est = (o.estados && o.estados[i]) || 'normal';
        const e = ESTADO[est] || ESTADO.normal;
        g.caja(bx, by, bw, bh, {
          fill: e.mixbg ? mix(e.mixbg[0], e.mixbg[1]) : mix('--fg3', 12),
          color: e.bd, r: 3, lw: e.bold ? 1.6 : 1
        });
        if (bw >= 16) g.etiqueta(bx + bw / 2, y + h - 7, fmt(datos[i]), { align: 'center' });
        geo.push({ x: bx, y: by, w: bw, h: bh, cx: bx + bw / 2 });
      }
      return { geo, bw };
    };

    /* Marco de pila de llamadas */
    g.marco = function (x, y, w, h, titulo, sub, estado) {
      const e = ESTADO[estado || 'normal'] || ESTADO.normal;
      g.caja(x, y, w, h, {
        fill: e.mixbg ? mix(e.mixbg[0], e.mixbg[1]) : css('--panel2'),
        color: e.bd, r: 6
      });
      g.texto(x + 9, y + h / 2 - (sub ? 7 : 0), titulo, { size: 11, color: e.fg, peso: '600' });
      if (sub) g.texto(x + 9, y + h / 2 + 8, sub, { size: 10, color: '--fg3' });
    };

    /* Flecha entre dos puntos */
    g.flecha = function (x1, y1, x2, y2, o) {
      o = o || {};
      const c = g.ctx; c.save();
      c.strokeStyle = css(o.color || '--fg3');
      c.fillStyle = css(o.color || '--fg3');
      c.lineWidth = o.lw || 1.4;
      c.lineCap = 'round';
      if (o.dash) c.setLineDash([4, 3]);
      c.beginPath();
      if (o.curva) {
        const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.28 - 12;
        c.moveTo(x1, y1); c.quadraticCurveTo(mx, my, x2, y2);
      } else { c.moveTo(x1, y1); c.lineTo(x2, y2); }
      c.stroke();
      c.setLineDash([]);
      if (o.punta !== false) {
        const a = o.curva ? Math.atan2(y2 - Math.min(y1, y2), x2 - (x1 + x2) / 2) : Math.atan2(y2 - y1, x2 - x1);
        const s = o.s || 5;
        c.beginPath();
        c.moveTo(x2, y2);
        c.lineTo(x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4));
        c.lineTo(x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4));
        c.closePath(); c.fill();
      }
      c.restore();
    };

    /* Puntero triangular bajo una celda */
    g.puntero = function (cx, y, etiqueta, color) {
      const c = g.ctx; c.save();
      c.fillStyle = css(color || '--ptr');
      c.beginPath();
      c.moveTo(cx, y); c.lineTo(cx - 5, y + 7); c.lineTo(cx + 5, y + 7);
      c.closePath(); c.fill();
      c.restore();
      if (etiqueta) g.texto(cx, y + 16, etiqueta, { align: 'center', size: 10, color: color || '--ptr' });
    };

    /* Nodo de árbol / lista */
    g.nodo = function (cx, cy, txt, o) {
      o = o || {};
      const r = o.r || 17;
      const e = ESTADO[o.estado || 'normal'] || ESTADO.normal;
      const c = g.ctx; c.save();
      c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fillStyle = e.mixbg ? mix(e.mixbg[0], e.mixbg[1]) : css('--panel');
      c.fill();
      c.strokeStyle = css(e.bd); c.lineWidth = e.bold ? 1.8 : 1.2;
      if (e.dash) c.setLineDash([4, 3]);
      c.stroke(); c.restore();
      g.texto(cx, cy, txt, { align: 'center', size: o.size || 11, color: e.fg, peso: e.bold ? '600' : '' });
      return { cx, cy, r };
    };

    g.linea = function (x1, y1, x2, y2, o) {
      o = o || {};
      const c = g.ctx; c.save();
      c.strokeStyle = css(o.color || '--border2');
      c.lineWidth = o.lw || 1.2;
      if (o.dash) c.setLineDash(o.dash === true ? [4, 3] : o.dash);
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      c.restore();
    };

    /* Bloque de código corto, para señalar la línea viva */
    g.codigo = function (lineas, x, y, activa, o) {
      o = o || {};
      const lh = o.lh || 16;
      lineas.forEach((l, i) => {
        if (i === activa) {
          g.caja(x - 6, y + i * lh - lh / 2 - 1, o.w || 250, lh, { fill: mix('--blue', 12), color: null, r: 4 });
          g.linea(x - 6, y + i * lh - lh / 2 - 1, x - 6, y + i * lh + lh / 2 - 1, { color: '--blue', lw: 2 });
        }
        g.texto(x, y + i * lh, l, { size: 11, color: i === activa ? '--fg' : '--fg3' });
      });
      return lineas.length * lh;
    };

    g.fit();
    REG.push(g);
    return g;
  }

  function redibujar() {
    REG.forEach(g => { if (g.canvas.isConnected) { g.fit(); g.draw && g.draw(); } });
  }
  function reset() { REG.length = 0; }

  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(redibujar, 130); });

  AYP.Canvas = { crear, redibujar, reset, css, mix, fmt, ESTADO };
})();
