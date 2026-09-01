/* ============================================================
   model.js — acceso a los datos del curso, calendario y validación.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const D = () => AYP.data;
  const DAY = 864e5;

  const M = {
    meta() { return D().meta; },
    cortes() { return D().cortes; },
    corte(id) { return D().cortes.find(c => c.id === id); },
    corteNum(n) { return D().cortes.find(c => c.num === +n); },

    unidades() { return Object.values(D().unidades || {}).sort((a, b) => a.id - b.id); },
    unidad(n) { return (D().unidades || {})[n]; },

    /* Todos los temas, en orden de semana.
       El banco grande vive aparte (data/banco*.js) y se funde aquí, para no
       tener archivos de unidad de miles de líneas. */
    temas() {
      if (M._cache) return M._cache;
      const extra = AYP.data.banco || {};
      const out = [];
      M.unidades().forEach(u => (u.temas || []).forEach(t => {
        const banco = (t.banco || []).concat(extra[t.id] || []);
        out.push(Object.assign({ unidad: u.id, unidadNombre: u.nombre, corte: u.corte }, t, { banco }));
      }));
      out.sort((a, b) => (a.semana - b.semana) || String(a.id).localeCompare(String(b.id)));
      M._cache = out;
      return out;
    },
    invalidar() { M._cache = null; },
    tema(id) { return M.temas().find(t => t.id === id); },
    corteTemas(corteId) { return M.temas().filter(t => t.corte === corteId); },

    patrones() { return D().patrones || []; },
    patron(id) { return M.patrones().find(p => p.id === id); },
    cortePatrones(num) { return M.patrones().filter(p => p.corte === +num); },

    cronograma() { return D().cronograma || []; },
    corteSemanas(corteId) { return M.cronograma().filter(s => s.corte === corteId); },

    /* ---------- ejercicios ---------- */
    temaBanco(t) { return (t.banco || []).map(e => e.id); },
    corteBanco(corteId) {
      let ids = [];
      M.corteTemas(corteId).forEach(t => { ids = ids.concat(M.temaBanco(t)); });
      return ids;
    },
    ejercicio(id) {
      let hit = null;
      M.temas().forEach(t => (t.banco || []).forEach(e => { if (e.id === id) hit = e; }));
      return hit;
    },
    ejemplos(corteId) {
      const out = [];
      M.corteTemas(corteId).forEach(t => (t.ejemplos || []).forEach(e =>
        out.push(Object.assign({ tema: t.id, temaTitulo: t.titulo }, e))));
      return out;
    },

    /* ---------- calendario ---------- */
    hoy() { return new Date().toISOString().slice(0, 10); },
    dias(a, b) { return Math.round((new Date(b) - new Date(a)) / DAY); },
    semanaActual() {
      const h = M.hoy();
      const cr = M.cronograma();
      for (const s of cr) if (h >= s.ini && h <= s.fin) return s;
      if (h < cr[0].ini) return null;
      const post = cr.filter(s => s.ini > h);
      return post.length ? post[0] : cr[cr.length - 1];
    },
    /* El corte «vivo» hoy: el primero cuya meta todavía no ha pasado */
    corteActivo() {
      const h = M.hoy();
      const c = M.cortes().find(c => !c.meta.ventana || h <= c.meta.ventana[1]);
      return c || M.cortes()[M.cortes().length - 1];
    },
    diasPara(corte) {
      if (!corte.meta.ventana) return null;
      return M.dias(M.hoy(), corte.meta.ventana[0]);
    },

    fecha(iso) {
      const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const d = new Date(iso + 'T00:00:00');
      return d.getDate() + ' ' + MES[d.getMonth()];
    },
    rango(a, b) {
      const A = new Date(a + 'T00:00:00'), B = new Date(b + 'T00:00:00');
      if (A.getMonth() === B.getMonth()) return A.getDate() + ' – ' + M.fecha(b);
      return M.fecha(a) + ' – ' + M.fecha(b);
    },

    /* ---------- progreso ---------- */
    progresoCorte(corteId) {
      const ids = M.corteBanco(corteId);
      const p = AYP.Store.all().progress || {};
      let dom = 0, int = 0;
      ids.forEach(id => { if (p[id] === 'mastered') dom++; else if (p[id] === 'tried') int++; });
      return { total: ids.length, dominados: dom, intentados: int, pct: ids.length ? Math.round(dom / ids.length * 100) : 0 };
    },
    temasCorte(corteId) {
      const ts = M.corteTemas(corteId);
      const done = ts.filter(t => AYP.Store.temaDone(t.unidad, t.id)).length;
      return { total: ts.length, done, pct: ts.length ? Math.round(done / ts.length * 100) : 0 };
    },


    /* ---------- horario y calendario de clases ----------
       El horario es dato del curso (data/core.js), no un ajuste. */
    DIAS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    horario() { return M.meta().horario || []; },
    horarioTxt() {
      return M.horario().map(h => M.DIAS[h.d] + ' ' + h.ini + '–' + h.fin).join(' · ');
    },
    /* Las sesiones reales de una semana del cronograma, con su fecha exacta. */
    sesiones(sem) {
      if (!sem || sem.pausa) return [];
      const out = [];
      const ini = new Date(sem.ini + 'T00:00:00');
      for (let k = 0; k < 7; k++) {
        const f = new Date(ini.getTime() + k * DAY);
        const h = M.horario().find(x => x.d === f.getDay());
        if (h) out.push({ fecha: f, iso: f.toISOString().slice(0, 10), ini: h.ini, fin: h.fin });
      }
      return out;
    },
    /* La siguiente clase a partir de hoy, dentro del semestre. */
    proximaClase() {
      const hoy = M.hoy();
      for (const s of M.cronograma()) {
        if (s.pausa) continue;
        for (const x of M.sesiones(s)) if (x.iso >= hoy) return x;
      }
      return null;
    },

    /* Semanas de un corte, ya sin recesos: el camino no muestra pausas. */
    semanasCorte(corteId) { return M.corteSemanas(corteId).filter(s => !s.pausa); },

    /* ---------- ¿estás al día? ----------
       Una sola pasada que responde qué falta, qué toca y qué viene. */
    pendientes() {
      const hoy = M.hoy();
      const sem = M.semanaActual();
      const corte = M.corteActivo();
      const atrasados = [], estaSemana = [], proxima = [];

      M.temas().forEach(t => {
        const s = M.cronograma().find(x => (x.temas || []).indexOf(t.id) >= 0);
        if (!s) return;
        if (AYP.Store.temaDone(t.unidad, t.id)) return;
        if (sem && s.n === sem.n) estaSemana.push(t);
        else if (sem && s.n === sem.n + 1) proxima.push(t);
        else if (hoy > s.fin) atrasados.push(t);
      });

      const ej = AYP.Store.stats(M.corteBanco(corte.id));
      const meta80 = Math.ceil(ej.total * 0.8);
      const faltan = Math.max(0, meta80 - ej.mastered);
      const dias = M.diasPara(corte);
      const ritmo = (dias && dias > 0) ? Math.ceil(faltan / dias) : faltan;

      return {
        corte, semana: sem, atrasados, estaSemana, proxima,
        ej, faltan, ritmo, dias,
        alDia: atrasados.length === 0
      };
    },

    /* ---------- agenda: sólo fechas que cambian una decisión ----------
       Evaluaciones y comienzos de tema. Nunca festivos ni recesos. */
    agenda(limite) {
      const hoy = M.hoy();
      const out = [];

      M.meta().evaluacion.forEach(e => {
        const c = M.cortes().find(x => x.num === e.corte);
        if (!c) return;
        const extra = (c.metasExtra || []).find(m => m.id === e.id);
        const v = extra ? null : (c.meta.id === e.id ? c.meta.ventana : null);
        const s = M.cronograma().find(x => x.n === e.semana);
        const iso = (v && v[0]) || (s && s.ini) || null;
        if (!iso || iso < hoy) return;
        out.push({
          iso, tipo: e.tipo === 'laboratorio' ? 'lab' : e.tipo === 'proyecto' ? 'proyecto' : 'meta',
          titulo: e.nombre, detalle: e.pct + ' % · ' + e.temas,
          href: '#/corte/' + c.num + '/meta'
        });
      });

      M.cronograma().forEach(s => {
        if (s.pausa || s.ini < hoy || !(s.temas || []).length) return;
        const c = s.corte ? M.cortes().find(x => x.id === s.corte) : null;
        if (!c) return;
        out.push({
          iso: s.ini, tipo: 'tema', titulo: s.tema,
          detalle: 'Semana ' + s.n + ' · Corte ' + c.num,
          href: '#/corte/' + c.num + '/tema/' + s.temas[0]
        });
      });

      out.sort((a, b) => a.iso < b.iso ? -1 : a.iso > b.iso ? 1 : 0);
      out.forEach(a => { a.fecha = new Date(a.iso + 'T00:00:00'); a.dias = M.dias(hoy, a.iso); });
      return limite ? out.slice(0, limite) : out;
    },

    /* El tema que conviene estudiar ahora: el primero sin marcar del corte. */
    recomendado(corteId) {
      return M.corteTemas(corteId).find(t => !AYP.Store.temaDone(t.unidad, t.id)) || null;
    },

    /* ¿Está el corte listo para su meta? */
    listoParaMeta(corteId) {
      const pt = M.temasCorte(corteId);
      const ej = AYP.Store.stats(M.corteBanco(corteId));
      return pt.pct === 100 && ej.pctMastered >= 80;
    },

    /* ---------- notas ---------- */
    notas() {
      const n = AYP.Store.all().notas || {};
      const out = {};
      Object.keys(n).forEach(k => { if (typeof n[k].nota === 'number') out[k] = n[k].nota; });
      return out;
    },
    setNota(evalId, v) { AYP.Store.setNota(evalId, 'nota', v); },
    definitiva() {
      const n = M.notas();
      let acum = 0, pesoVisto = 0;
      M.meta().evaluacion.forEach(e => {
        const v = n[e.id];
        if (typeof v === 'number') { acum += v * e.pct / 100; pesoVisto += e.pct; }
      });
      return { acum, pesoVisto, falta: 100 - pesoVisto };
    },
    /* Qué se necesita, en promedio, en lo que falta para llegar a 3,0 */
    necesita() {
      const { acum, falta } = M.definitiva();
      if (falta <= 0) return null;
      const req = (M.meta().aprueba - acum) / (falta / 100);
      return Math.max(0, Math.min(5, req));
    },

    /* ---------- validación ---------- */
    /* Comprueba que TODO el pseudocódigo del contenido compile y corra.
       Un ejemplo que no corre no sirve para nada en esta app. */
    validar() {
      const P = AYP.pseudo;
      const problemas = [];
      const vistos = {};
      M.temas().forEach(t => {
        (t.ejemplos || []).forEach(e => {
          if (vistos[e.id]) problemas.push({ id: e.id, q: 'id de ejemplo repetido' });
          vistos[e.id] = 1;
          if (!e.codigo) { problemas.push({ id: e.id, q: 'sin código' }); return; }
          const prog = P.compilar(e.codigo);
          if (prog.errores.length) {
            problemas.push({ id: e.id, q: 'no compila: L' + prog.errores[0].linea + ' ' + prog.errores[0].mensaje });
            return;
          }
          const r = P.ejecutar(prog, {
            entradas: (e.entradas || []).slice(),
            precarga: e.precarga || {}
          });
          if (r.error) problemas.push({ id: e.id, q: 'no corre: L' + r.error.linea + ' ' + r.error.mensaje });
        });
        (t.banco || []).forEach(e => {
          if (vistos[e.id]) problemas.push({ id: e.id, q: 'id de ejercicio repetido' });
          vistos[e.id] = 1;
          if (!e.enunciado) problemas.push({ id: e.id, q: 'sin enunciado' });
          if (!e.solucion) return;
          const pr = P.compilar(e.solucion);
          if (pr.errores.length) {
            problemas.push({ id: e.id, q: 'solucion no compila: L' + pr.errores[0].linea + ' ' + pr.errores[0].mensaje });
            return;
          }
          const rr = P.ejecutar(pr, { entradas: (e.entradas || []).slice(), precarga: e.precarga || {} });
          if (rr.error) problemas.push({ id: e.id, q: 'solucion no corre: L' + rr.error.linea + ' ' + rr.error.mensaje });
        });
        const vz = Array.isArray(t.viz) ? t.viz : (t.viz ? [t.viz] : []);
        vz.forEach(v => {
          if (AYP.Viz && !AYP.Viz.existe(v)) problemas.push({ id: t.id, q: 'visualizador inexistente: ' + v });
        });
        (t.patrones || []).forEach(p => {
          if (!M.patron(p)) problemas.push({ id: t.id, q: 'patrón inexistente: ' + p });
        });
      });
      (D().propuestos || []).forEach(e => {
        if (vistos[e.id]) problemas.push({ id: e.id, q: 'id de propuesto repetido' });
        vistos[e.id] = 1;
        if (!e.solucion) return;
        const prog = P.compilar(e.solucion);
        if (prog.errores.length) {
          problemas.push({ id: e.id, q: 'solucion no compila: L' + prog.errores[0].linea + ' ' + prog.errores[0].mensaje });
          return;
        }
        const r = P.ejecutar(prog, { entradas: (e.entradas || []).slice(), precarga: e.precarga || {} });
        if (r.error) problemas.push({ id: e.id, q: 'solucion no corre: L' + r.error.linea + ' ' + r.error.mensaje });
      });
      M.cronograma().forEach(s => (s.temas || []).forEach(id => {
        if (!M.tema(id)) problemas.push({ id: 'S' + s.n, q: 'tema de cronograma inexistente: ' + id });
      }));
      if (problemas.length) {
        console.warn('[AyP II] ' + problemas.length + ' problema(s) de contenido:');
        problemas.forEach(p => console.warn('  ' + p.id + ' → ' + p.q));
      } else {
        console.log('[AyP II] contenido validado: todo el pseudocódigo compila y corre.');
      }
      return problemas;
    }
  };

  AYP.model = M;
})();
