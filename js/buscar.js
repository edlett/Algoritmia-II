/* ============================================================
   buscar.js — paleta de comandos (Ctrl+K o «/»).

   Indexa temas, ejemplos ejecutables, ejercicios, patrones y
   visualizadores. Es la manera rápida de llegar a cualquier sitio
   sin acordarse de en qué corte estaba.
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const norm = s => String(s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');

  let indice = null;

  function construir() {
    if (indice) return indice;
    const M = AYP.model, out = [];
    const corteNum = id => (M.cortes().find(c => c.id === id) || { num: 1 }).num;

    M.temas().forEach(t => {
      const n = corteNum(t.corte);
      out.push({ g: 'Temas', t: t.titulo, s: t.resumen, k: 'C' + n, ic: 'article',
        h: `#/corte/${n}/tema/${t.id}` });
      (t.ejemplos || []).forEach(e =>
        out.push({ g: 'Ejemplos ejecutables', t: e.enunciado, s: t.titulo + (e.fuente ? ' · ' + e.fuente : ''),
          k: 'ver', ic: 'play', h: `#/corte/${n}/tema/${t.id}/ver` }));
      (t.banco || []).forEach(e =>
        out.push({ g: 'Ejercicios', t: e.enunciado, s: t.titulo + (e.fuente ? ' · ' + e.fuente : ''),
          k: e.dificultad || '', ic: 'pencil', h: `#/corte/${n}/tema/${t.id}/ejercicios` }));
      (Array.isArray(t.viz) ? t.viz : t.viz ? [t.viz] : []).forEach(v =>
        out.push({ g: 'Visualizadores', t: v.replace(/-/g, ' '), s: t.titulo,
          k: 'ver', ic: 'chart', h: `#/corte/${n}/tema/${t.id}/ver` }));
    });

    M.patrones().forEach(p =>
      out.push({ g: 'Patrones', t: p.nombre, s: p.cuando, k: 'C' + p.corte, ic: 'cards',
        h: `#/corte/${p.corte}/patrones#${p.id}` }));

    M.cortes().forEach(c => {
      out.push({ g: 'Cortes', t: 'Corte ' + c.num + ': ' + c.titulo, s: c.resumenCorto, k: '', ic: 'layers', h: `#/corte/${c.num}` });
      [['meta', 'La meta'], ['patrones', 'Tarjetero'], ['drill', 'Drill de estructura'],
       ['traza', 'Drill de traza'], ['simulacro', 'Simulacro'], ['examen', 'Exámenes reales'],
       ['cronograma', 'Cronograma']].forEach(([k, n]) =>
        out.push({ g: 'Herramientas', t: n + ' · corte ' + c.num, s: c.titulo, k: '', ic: 'tool', h: `#/corte/${c.num}/${k}` }));
    });

    out.push({ g: 'Herramientas', t: 'Banco de trabajo', s: 'Pega cualquier pseudocódigo y velo correr', k: 'L', ic: 'terminal', h: '#/laboratorio' });

    out.forEach(o => { o._n = norm(o.t + ' ' + o.s + ' ' + o.g); });
    indice = out;
    return out;
  }

  function filtrar(q) {
    const items = construir();
    if (!q.trim()) {
      return items.filter(o => o.g === 'Cortes' || o.g === 'Herramientas').slice(0, 12);
    }
    const term = norm(q).split(/\s+/).filter(Boolean);
    return items
      .map(o => {
        let p = 0;
        for (const t of term) {
          const i = o._n.indexOf(t);
          if (i < 0) return null;
          p += i === 0 ? 3 : (o._n[i - 1] === ' ' ? 2 : 1);
        }
        if (o.g === 'Temas') p += 2;
        return { o, p };
      })
      .filter(Boolean)
      .sort((a, b) => b.p - a.p)
      .slice(0, 40)
      .map(x => x.o);
  }

  let abierto = null, sel = 0, lista = [];

  function abrir() {
    if (abierto) return;
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `
      <div class="palette" role="dialog" aria-modal="true" aria-label="Buscar">
        <input type="text" placeholder="Buscar temas, ejemplos, ejercicios, patrones…" aria-label="Buscar" autocomplete="off">
        <div class="results" role="listbox"></div>
        <div class="phint"><span>↑↓ moverse</span><span>Enter abrir</span><span>Esc cerrar</span></div>
      </div>`;
    document.body.appendChild(ov);
    abierto = ov;
    const inp = ov.querySelector('input'), res = ov.querySelector('.results');

    function pinta() {
      lista = filtrar(inp.value);
      sel = 0;
      if (!lista.length) { res.innerHTML = '<div class="pgroup">Sin resultados</div>'; return; }
      let html = '', grupo = null;
      lista.forEach((o, i) => {
        if (o.g !== grupo) { grupo = o.g; html += `<div class="pgroup">${esc(grupo)}</div>`; }
        html += `<button class="pitem" data-i="${i}" role="option">
          ${AYP.icon(o.ic)}
          <span class="pt">${esc(o.t)}${o.s ? ' <span style="color:var(--fg3)">· ' + esc(o.s.slice(0, 70)) + '</span>' : ''}</span>
          ${o.k ? `<span class="pk">${esc(o.k)}</span>` : ''}
        </button>`;
      });
      res.innerHTML = html;
      marcar();
      res.querySelectorAll('.pitem').forEach(b =>
        b.addEventListener('click', () => ir(+b.dataset.i)));
    }
    function marcar() {
      res.querySelectorAll('.pitem').forEach(b =>
        b.classList.toggle('sel', +b.dataset.i === sel));
      const s = res.querySelector('.pitem.sel');
      if (s) s.scrollIntoView({ block: 'nearest' });
    }
    function ir(i) {
      const o = lista[i];
      if (!o) return;
      cerrar();
      location.hash = o.h;
    }

    inp.addEventListener('input', pinta);
    ov.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(lista.length - 1, sel + 1); marcar(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); marcar(); }
      else if (e.key === 'Enter') { e.preventDefault(); ir(sel); }
    });
    ov.addEventListener('mousedown', e => { if (e.target === ov) cerrar(); });
    pinta();
    inp.focus();
  }

  function cerrar() {
    if (!abierto) return;
    abierto.remove();
    abierto = null;
  }

  AYP.Buscar = { abrir, cerrar, abierta: () => !!abierto, reindexar() { indice = null; } };
})();
