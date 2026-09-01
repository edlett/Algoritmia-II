/* ============================================================
   sw.js — precaché completo. Sólo se registra bajo http(s).
   Al cambiar cualquier archivo hay que subir CACHE y el ?v= de index.html.
   Para probar cambios: desregistrar el service worker primero.
   ============================================================ */
const CACHE = 'aypii-v26';

const ARCHIVOS = [
  './', './index.html', './manifest.json',
  './css/fonts.css', './css/tokens.css', './css/base.css',
  './css/layout.css', './css/components.css', './css/traza.css', './css/views.css',
  './assets/fonts/geist.woff2', './assets/fonts/geist-mono.woff2',
  './assets/fonts/plus-jakarta-sans.woff2',
  './assets/icon-192.png', './assets/icon-512.png',
  './assets/katex/katex.min.css', './assets/katex/katex.min.js', './assets/katex/auto-render.min.js',
  './assets/katex/fonts/KaTeX_AMS-Regular.woff2',
  './assets/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
  './assets/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  './assets/katex/fonts/KaTeX_Fraktur-Bold.woff2',
  './assets/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  './assets/katex/fonts/KaTeX_Main-Bold.woff2',
  './assets/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  './assets/katex/fonts/KaTeX_Main-Italic.woff2',
  './assets/katex/fonts/KaTeX_Main-Regular.woff2',
  './assets/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  './assets/katex/fonts/KaTeX_Math-Italic.woff2',
  './assets/katex/fonts/KaTeX_SansSerif-Bold.woff2',
  './assets/katex/fonts/KaTeX_SansSerif-Italic.woff2',
  './assets/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  './assets/katex/fonts/KaTeX_Script-Regular.woff2',
  './assets/katex/fonts/KaTeX_Size1-Regular.woff2',
  './assets/katex/fonts/KaTeX_Size2-Regular.woff2',
  './assets/katex/fonts/KaTeX_Size3-Regular.woff2',
  './assets/katex/fonts/KaTeX_Size4-Regular.woff2',
  './assets/katex/fonts/KaTeX_Typewriter-Regular.woff2',
  './pseudo/lexer.js', './pseudo/parser.js', './pseudo/fmt.js', './pseudo/interp.js',
  './data/core.js', './data/patrones.js',
  './data/unidad1.js', './data/unidad2.js', './data/unidad3.js',
  './data/unidad4.js', './data/unidad5.js', './data/temas-extra.js', './data/banco1.js', './data/banco2.js',
  './data/banco3.js', './data/banco4.js', './data/propuestos.js', './data/examenes.js',
  './js/icons.js', './js/canvas.js', './js/viz.js', './js/store.js', './js/model.js', './js/traza.js',
  './js/buscar.js', './js/katex.js', './js/ui.js',
  './js/views-corte.js', './js/views-tools.js', './js/router.js', './js/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true })
      .then(r => r || fetch(e.request))
  );
});
