/* ============================================================
   app.js — arranque, armazón, barra lateral y atajos.

   El armazón (barra superior + rejilla) se construye UNA sola vez.
   El router escribe únicamente dentro de #main, y la barra lateral se
   repinta aparte conservando su scroll y qué semanas estaban abiertas.
   Antes se reconstruía todo en cada navegación y el camino saltaba.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const M = () => AYP.model, S = () => AYP.Store, U = () => AYP.ui;
  const I = (n, c) => AYP.icon(n, c);
  const esc = s => AYP.ui.esc(s);

  const App = {
    /* Sólo se recuerdan las DESVIACIONES del estado por defecto: qué
       semanas abrió el usuario a mano y cuáles cerró. Guardar «abiertas»
       a secas hacía que, al pasear por los temas, acabaran abiertas todas
       —el camino se convertía otra vez en una lista plana—. */
    _forz: {},

    init() {
      this.armazon();
      this.aplicarAjustes();
      this.eventos();
      AYP.router.arrancar();
      if (AYP.model.validar) AYP.model.validar();
    },

    /* ---------- armazón, una sola vez ---------- */
    armazon() {
      document.getElementById('app').innerHTML = `
        <a class="skiplink" href="#main">Saltar al contenido</a>
        <div id="scrollprog"></div>
        <header class="topbar">
          <button type="button" id="menuBtn" class="iconbtn" aria-label="Abrir la ruta del corte" aria-expanded="false">${I('menu')}</button>
          <a class="brand" href="#/">
            <span class="mark" data-mark aria-hidden="true">AP</span>
            <span class="bn" data-brandname>AyP II</span>
            <span class="sub" data-brandsub></span>
          </a>
          <div class="spacer"></div>
          <button type="button" class="searchbtn" data-act="buscar" aria-label="Buscar (Ctrl+K)">
            ${I('search')}<span>Buscar</span><kbd>Ctrl K</kbd></button>
          <a class="tb-prog" href="#/" title="Temas dominados en todo el semestre">
            <svg class="ringmini" viewBox="0 0 20 20" aria-hidden="true">
              <circle class="rt" cx="10" cy="10" r="8"/>
              <circle class="rp" data-ring cx="10" cy="10" r="8" stroke-dasharray="50.3" stroke-dashoffset="50.3"/></svg>
            <span data-pct>0%</span>
          </a>
          <details class="prefs" id="prefs">
            <summary class="iconbtn" aria-label="Apariencia">${I('tune')}</summary>
            <div class="prefbox">
              <div class="setrow">
                <div class="sinfo"><b>Tema</b></div>
                <span class="seg2" data-seg="tema" role="group" aria-label="Tema claro u oscuro">
                  <button type="button" data-v="light">Claro</button>
                  <button type="button" data-v="dark">Oscuro</button>
                </span>
              </div>
              <div class="setrow">
                <div class="sinfo"><b>Tamaño de letra</b><small>Afecta a todo el texto.</small></div>
                <label class="field"><span class="sr-only">Tamaño de letra</span>
                  <input type="range" data-set="fontScale" min="85" max="130" step="5">
                  <span data-out></span></label>
              </div>
              <div class="setrow">
                <div class="sinfo"><b>Movimiento</b><small>Desactiva animaciones y transiciones.</small></div>
                <span class="seg2" data-seg="motion" role="group" aria-label="Movimiento">
                  <button type="button" data-v="0">Normal</button>
                  <button type="button" data-v="1">Reducido</button>
                </span>
              </div>
            </div>
          </details>
          <button type="button" id="temaBtn" class="iconbtn" aria-label="Cambiar a tema oscuro">
            <span class="ic-sun">${I('sun')}</span>
            <span class="ic-moon" style="display:none">${I('moon')}</span>
          </button>
        </header>
        <div class="scrim" id="scrim"></div>
        <div class="layout">
          <aside class="rail" id="rail" aria-label="Camino del corte"></aside>
          <main class="stage" id="main" tabindex="-1"></main>
        </div>`;
    },

    /* ============================================================
       BARRA LATERAL — el camino del corte.
       Semanas encadenadas y desplegables que desembocan en la meta.
       ============================================================ */
    rail(ctx) {
      const rail = document.getElementById('rail');
      const layout = document.querySelector('.layout');
      const c = ctx && ctx.corte;

      layout.classList.toggle('solo', !c);
      rail.hidden = !c;
      if (!c) { rail.innerHTML = ''; return; }

      const scroll = rail.scrollTop;
      const forz = this._forz[c.id] || (this._forz[c.id] = { abrir: new Set(), cerrar: new Set() });
      const temaId = ctx.tema ? ctx.tema.id : null;
      const secc = ctx.seccion;
      const hoy = M().hoy();
      let h = '';

      /* ---- selector de corte ---- */
      const pc = M().temasCorte(c.id);
      h += `<details class="cortesel">
        <summary><span class="cnum">${c.num}</span>
          <span class="ctxt">${esc(c.titulo)}</span>
          <span class="cmeta">${pc.done}/${pc.total}</span>${I('chevron', 'chev')}</summary>
        <div class="clist">` + M().cortes().map(x => {
          const p = M().temasCorte(x.id);
          return `<a href="#/corte/${x.num}"${p.pct === 100 ? ' class="full"' : ''}${x.id === c.id ? ' aria-current="true"' : ''}>
            <span class="cnum">${p.pct === 100 ? I('check') : x.num}</span>
            <span class="ctxt">Corte ${x.num} · ${esc(x.titulo)}</span>
            <span class="cmeta">${p.done}/${p.total}</span></a>`;
        }).join('') + `</div></details>`;

      /* ---- el camino ---- */
      let nodos = `<a class="step raiz${!temaId && !secc ? ' on' : ''}" href="#/corte/${c.num}">
        <span class="sdot">${I('layers')}</span><span class="stxt">Ruta del corte</span></a>`;

      M().semanasCorte(c.id).forEach(s => {
        const ts = (s.temas || []).map(id => M().tema(id)).filter(Boolean);
        if (!ts.length) return;
        const hechos = ts.filter(t => S().temaDone(t.unidad, t.id)).length;
        const done = hechos === ts.length;
        const ahora = hoy >= s.ini && hoy <= s.fin;
        const pasada = hoy > s.fin;
        const aqui = ts.some(t => t.id === temaId);
        const empezada = !done && ts.some(t =>
          S().stats(M().temaBanco(t)).touched > 0 || S().temaDone(t.unidad, t.id));
        const cls = done ? 'done' : ahora ? 'now' : empezada ? 'part' : pasada ? 'part' : 'futura';
        /* por defecto se abre la semana en curso y la del tema abierto */
        const def = ahora || aqui;
        const abierta = aqui || (forz.cerrar.has(s.n) ? false : forz.abrir.has(s.n) ? true : def);

        nodos += `<details class="wk ${cls}" data-wk="${s.n}" data-def="${def ? 1 : 0}"${abierta ? ' open' : ''}>
          <summary class="wksum">
            <span class="wkdot">${done ? I('check') : s.n}</span>
            <span class="wkinfo"><b>Semana ${s.n}</b>
              <small>${esc(M().rango(s.ini, s.fin))} · ${hechos}/${ts.length}</small></span>
            <span class="wkbar"><i style="width:${Math.round(hechos / ts.length * 100)}%"></i></span>
            ${I('chevron', 'chev')}
          </summary>
          <div class="wksteps">` + ts.map(t => {
            const td = S().temaDone(t.unidad, t.id);
            const st = S().stats(M().temaBanco(t));
            const part = !td && st.touched > 0;
            return `<a class="step${td ? ' done' : part ? ' part' : ''}"
              ${temaId === t.id ? 'aria-current="page"' : ''} href="#/corte/${c.num}/tema/${t.id}">
              <span class="sdot">${td ? I('check') : ''}</span>
              <span class="stxt">${esc(t.titulo)}</span>
              <span class="sbar" title="${st.mastered} de ${st.total} ejercicios"><i style="width:${st.pctMastered}%"></i></span>
            </a>`;
          }).join('') + `</div></details>`;
      });

      /* ---- la meta cierra el camino y pesa más que cualquier paso ---- */
      const d = M().diasPara(c);
      const listo = M().listoParaMeta(c.id);
      nodos += `<a class="goal${listo ? ' listo' : ''}"${secc === 'meta' ? ' aria-current="page"' : ''} href="#/corte/${c.num}/meta">
        <span class="goaldot">${I('flag')}</span>
        <span class="goalinfo"><b>${esc(c.meta.nombre)}</b>
          <small>${d === null ? esc(c.meta.ventanaTxt) : d > 0 ? 'en ' + d + ' días' : d === 0 ? 'es hoy' : 'ya pasó'} · vale el ${c.meta.pct} %</small></span></a>`;

      h += `<nav class="path" aria-label="Camino del Corte ${c.num}">${nodos}</nav>`;

      /* ---- herramientas, plegadas ---- */
      h += `<details class="navtools nav-group"${secc && secc !== 'meta' ? ' open' : ''}>
        <summary>${I('chevron')}Herramientas del corte</summary>` +
        U().HERRAMIENTAS.map(([k, t]) => `<a class="navlink"${secc === k ? ' aria-current="page"' : ''}
          href="#/corte/${c.num}/${k}"><span class="dot"></span><span class="txt">${esc(t)}</span></a>`).join('') +
        `<a class="navlink" href="#/laboratorio"><span class="dot"></span><span class="txt">Banco de trabajo</span></a>
        </details>`;

      rail.innerHTML = h;
      rail.scrollTop = scroll;

      /* recordar sólo lo que el usuario cambia respecto del comportamiento
         por defecto; si lo devuelve a su sitio, se olvida. */
      rail.querySelectorAll('details[data-wk]').forEach(d2 => d2.addEventListener('toggle', () => {
        const n = +d2.dataset.wk, def = d2.dataset.def === '1';
        forz.abrir.delete(n); forz.cerrar.delete(n);
        if (d2.open !== def) (d2.open ? forz.abrir : forz.cerrar).add(n);
      }));

      if (!scroll) {
        const act = rail.querySelector('[aria-current="page"]') || rail.querySelector('.wk.now');
        if (act) act.scrollIntoView({ block: 'nearest' });
      }
    },

    /* ---------- después de pintar una vista ---------- */
    despuesDeRender(ctx) {
      this.rail(ctx || {});
      this.marca(ctx || {});
      this.anillo();
    },

    marca(ctx) {
      const mark = document.querySelector('[data-mark]');
      const name = document.querySelector('[data-brandname]');
      const sub = document.querySelector('[data-brandsub]');
      if (ctx.corte) {
        mark.textContent = 'C' + ctx.corte.num;
        name.textContent = 'Corte ' + ctx.corte.num;
        sub.textContent = '· ' + ctx.corte.titulo;
      } else {
        mark.textContent = 'AP';
        name.textContent = 'AyP II';
        sub.textContent = '';
      }
    },

    anillo() {
      const t = M().cortes().reduce((a, c) => {
        const p = M().temasCorte(c.id);
        return { d: a.d + p.done, t: a.t + p.total };
      }, { d: 0, t: 0 });
      const pct = t.t ? Math.round(t.d / t.t * 100) : 0;
      const r = document.querySelector('[data-ring]');
      const l = document.querySelector('[data-pct]');
      if (r) r.style.strokeDashoffset = (50.3 * (1 - pct / 100)).toFixed(1);
      if (l) l.textContent = pct + '%';
    },

    refrescarRail() { this.rail(AYP.router.ctx || {}); this.anillo(); },

    /* ---------- apariencia ---------- */
    aplicarAjustes() {
      const s = S().settings();
      const oscuro = s.theme === 'dark';
      document.documentElement.dataset.theme = oscuro ? 'dark' : 'light';
      document.documentElement.style.fontSize = ((s.fontScale || 100) / 100 * 16) + 'px';
      document.documentElement.classList.toggle('reduce-motion', !!s.reduceMotion);
      const m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute('content', oscuro ? '#000000' : '#ffffff');

      const b = document.getElementById('temaBtn');
      if (b) {
        b.querySelector('.ic-sun').style.display = oscuro ? 'none' : '';
        b.querySelector('.ic-moon').style.display = oscuro ? '' : 'none';
        b.setAttribute('aria-label', oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
      }
      const box = document.getElementById('prefs');
      if (box) {
        box.querySelectorAll('[data-seg="tema"] button').forEach(x =>
          x.setAttribute('aria-pressed', String(x.dataset.v === (oscuro ? 'dark' : 'light'))));
        box.querySelectorAll('[data-seg="motion"] button').forEach(x =>
          x.setAttribute('aria-pressed', String(!!s.reduceMotion === (x.dataset.v === '1'))));
        const r = box.querySelector('[data-set="fontScale"]');
        if (r) { r.value = s.fontScale || 100; box.querySelector('[data-out]').textContent = (s.fontScale || 100) + ' %'; }
      }
    },

    /* ---------- eventos globales ---------- */
    eventos() {
      const tema = v => { S().updateSettings({ theme: v }); this.aplicarAjustes(); if (AYP.Canvas && AYP.Canvas.redibujar) AYP.Canvas.redibujar(); };

      document.addEventListener('click', e => {
        if (e.target.closest('[data-act="buscar"]')) { AYP.Buscar.abrir(); return; }
        const seg = e.target.closest('[data-seg] button');
        if (seg) {
          const k = seg.closest('[data-seg]').dataset.seg;
          if (k === 'tema') tema(seg.dataset.v);
          else if (k === 'motion') { S().updateSettings({ reduceMotion: seg.dataset.v === '1' }); this.aplicarAjustes(); }
          return;
        }
        /* volver a pintar cuando se pulsa un enlace a la ruta actual */
        const a = e.target.closest('a[href^="#/"]');
        if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); AYP.router.resolver(); }
        /* cerrar la caja de apariencia al pulsar fuera */
        const p = document.getElementById('prefs');
        if (p && p.open && !e.target.closest('#prefs')) p.open = false;
      });

      document.addEventListener('input', e => {
        if (e.target.dataset && e.target.dataset.set === 'fontScale') {
          S().updateSettings({ fontScale: +e.target.value });
          this.aplicarAjustes();
        }
      });

      document.getElementById('temaBtn').addEventListener('click', () =>
        tema(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

      /* ---- teclado ---- */
      document.addEventListener('keydown', e => {
        const t = e.target;
        const escribiendo = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
        const capa = AYP.Buscar && AYP.Buscar.abierta();

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); AYP.Buscar.abrir(); return; }
        if (escribiendo || capa) return;
        if (t && t.closest && t.closest('.traza')) return;

        if (e.key === '/') { e.preventDefault(); AYP.Buscar.abrir(); }
        else if (e.key === 'Escape') {
          /* Escape cierra lo que esté abierto; no navega. */
          const p = document.getElementById('prefs');
          if (p && p.open) { p.open = false; return; }
          const rail = document.getElementById('rail');
          if (rail && rail.classList.contains('open')) cerrarRail();
        }
        else if (e.key === 'j' || e.key === 'k') {
          const ctx = AYP.router.ctx;
          if (!ctx || !ctx.corte || !ctx.tema) return;
          const ts = M().corteTemas(ctx.corte.id);
          const i = ts.findIndex(x => x.id === ctx.tema.id);
          const nx = ts[i + (e.key === 'j' ? 1 : -1)];
          if (nx) location.hash = `#/corte/${ctx.corte.num}/tema/${nx.id}`;
        }
      });

      /* ---- barra lateral en móvil ---- */
      const rail = document.getElementById('rail');
      const scrim = document.getElementById('scrim');
      const menu = document.getElementById('menuBtn');
      const abrir = f => {
        rail.classList.toggle('open', f);
        scrim.classList.toggle('show', f);
        menu.setAttribute('aria-expanded', f ? 'true' : 'false');
      };
      function cerrarRail() { abrir(false); }
      menu.addEventListener('click', () => abrir(!rail.classList.contains('open')));
      scrim.addEventListener('click', cerrarRail);
      rail.addEventListener('click', e => {
        if (e.target.closest('a[href]') && innerWidth <= 980) cerrarRail();
      });

      /* ---- barra de progreso de scroll ---- */
      const bar = document.getElementById('scrollprog');
      addEventListener('scroll', () => {
        const h = document.documentElement;
        const d = h.scrollHeight - h.clientHeight;
        bar.style.width = (d > 0 ? h.scrollTop / d * 100 : 0) + '%';
      }, { passive: true });
    }
  };

  AYP.app = App;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init());
  else App.init();
})();
