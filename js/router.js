/* ============================================================
   router.js — enrutado por hash, sin dependencias.

   Escribe SÓLO dentro de #main. El armazón y la barra lateral los
   mantiene app.js, para que el camino no se reconstruya —ni pierda el
   scroll y las semanas abiertas— cada vez que se cambia de tema.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};

  /* ruta → nombre de la vista. Explícito a propósito: así una ruta
     inventada no puede llamar a cualquier función de AYP.views. */
  const SECC = {
    meta: 'meta', patrones: 'patrones', drill: 'drill', traza: 'drillTraza',
    cronograma: 'cronograma', simulacro: 'simulacro', examen: 'examenes',
    propuestos: 'propuestos'
  };

  const R = {
    ctx: {},
    ruta() { return (location.hash || '#/').slice(1).split('/').filter(Boolean); },
    ir(h) { location.hash = h; },

    resolver() {
      const p = R.ruta();
      const V = AYP.views;
      const main = document.getElementById('main');

      /* limpiar temporizadores y lienzos de la vista anterior */
      (AYP._timers || []).forEach(id => { clearTimeout(id); clearInterval(id); });
      AYP._timers = [];
      if (AYP.Canvas) AYP.Canvas.reset();

      let html = '', despues = null;
      const ctx = {};

      try {
        if (!p.length) ({ html, despues } = V.portada());
        else if (p[0] === 'corte') {
          const c = AYP.model.corteNum(p[1]);
          if (!c) html = V.error('No existe ese corte.');
          else {
            ctx.corte = c;
            const sec = p[2] || 'ruta';
            ctx.seccion = sec === 'ruta' ? null : sec;
            if (sec === 'ruta') ({ html, despues } = V.corte(c));
            else if (sec === 'tema') {
              const t = AYP.model.tema(p[3]);
              if (!t) html = V.error('No existe ese tema.');
              else { ctx.tema = t; ({ html, despues } = V.tema(c, t, p[4] || 'teoria')); }
            }
            else if (SECC[sec]) ({ html, despues } = V[SECC[sec]](c));
            else html = V.error('Sección desconocida.');
          }
        }
        else if (p[0] === 'laboratorio') ({ html, despues } = V.laboratorio());
        else html = V.error('Esa ruta no existe.');
      } catch (e) {
        console.error(e);
        html = V.error('Algo se rompió al construir la vista: ' + e.message);
      }

      R.ctx = ctx;
      main.innerHTML = `<div class="wrap view-enter">${html}</div>`;
      window.scrollTo(0, 0);
      if (despues) try { despues(main); } catch (e) { console.error(e); }
      if (AYP.ui) AYP.ui.math(main);
      AYP.app.despuesDeRender(ctx);
    },

    arrancar() {
      addEventListener('hashchange', R.resolver);
      R.resolver();
    }
  };

  AYP.router = R;
})();
