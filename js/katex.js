/* ============================================================
   katex.js — helpers de renderizado LaTeX (perezoso por vista)
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};

  const DELIMS = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false }
  ];

  const Kx = {
    /* Renderiza una expresión pura a string HTML */
    inline(tex) {
      try { return katex.renderToString(tex, { throwOnError: false, displayMode: false }); }
      catch (e) { return '<span class="mono">' + escapeHtml(tex) + '</span>'; }
    },
    block(tex) {
      try { return katex.renderToString(tex, { throwOnError: false, displayMode: true }); }
      catch (e) { return '<span class="mono">' + escapeHtml(tex) + '</span>'; }
    },
    /* Auto-render de un contenedor: procesa $...$ y \(...\) presentes en el texto */
    render(el) {
      if (!el || !window.renderMathInElement) return;
      try {
        renderMathInElement(el, {
          delimiters: DELIMS,
          throwOnError: false,
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          ignoredClasses: ['no-math']
        });
      } catch (e) { console.warn('KaTeX render error', e); }
    }
  };

  /* Escapa también comillas: seguro dentro de atributos HTML */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  AYP.Kx = Kx;
  AYP.esc = escapeHtml;
})();
