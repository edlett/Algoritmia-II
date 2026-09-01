/* ============================================================
   icons.js — juego de iconos SVG en línea.
   Sustituye la fuente Material Symbols (5,2 MB) por ~7 KB.
   Todos heredan currentColor, escalan con font-size y salen
   marcados aria-hidden: nunca se leen en voz alta.
   Uso:  AYP.icon('search')        → 16 px
         AYP.icon('search', 'lg')  → clase extra .icon.lg
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};

  /* Trazos de 24×24, stroke 1.8, extremos redondeados. */
  const P = {
    pause: '<path d="M9 5v14M15 5v14" stroke-width="2.4"/>',
    'chevron-left': '<path d="M15 18l-6-6 6-6"/>',
    skip: '<path d="M6 5.2v13.6L15 12z" fill="currentColor" stroke="none"/><path d="M18 5v14"/>',
    stack: '<rect x="4" y="14.5" width="16" height="5" rx="1.2"/><rect x="6" y="8.5" width="12" height="5" rx="1.2"/><rect x="8" y="2.5" width="8" height="5" rx="1.2"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
    braces: '<path d="M9 3.5c-2 0-2.5 1-2.5 3s0 3.5-2 3.5c1.5 0 2 1 2 3.5s.5 3.5 2.5 3.5"/><path d="M15 3.5c2 0 2.5 1 2.5 3s0 3.5 2 3.5c-1.5 0-2 1-2 3.5s-.5 3.5-2.5 3.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
    settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    chevron: '<path d="M9 18l6-6-6-6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    play: '<path d="M8 5.2v13.6L19 12z" fill="currentColor" stroke="none"/>',
    home: '<path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9.5 21v-6h5v6"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4.5h11l-2 3.5 2 3.5H5z"/>',
    tool: '<path d="M14.5 4.5a4.5 4.5 0 0 0 5.8 5.8L21 11l-8.5 8.5a2.5 2.5 0 0 1-3.5-3.5L17.5 7z"/><path d="M6.5 17.5l-2 2"/>',
    article: '<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8.5h8M8 12.5h8M8 16.5h5"/>',
    book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v18H5.5A1.5 1.5 0 0 1 4 19.5z"/><path d="M4 17h15"/><path d="M8.5 7.5h6"/>',
    bulb: '<path d="M9.5 18h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1 1 1.7v.4h5v-.4c0-.7.4-1.3 1-1.7A6 6 0 0 0 12 3z"/>',
    warning: '<path d="M12 3.8L21 19.5H3z"/><path d="M12 9.5v4.2"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6h.01"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.5"/><path d="M12 17h.01"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4h3"/><path d="M9.5 3h5"/>',
    chart: '<path d="M3.5 20.5h17"/><path d="M4 15.5l4.5-5 3.5 3 5.5-7"/>',
    grid: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9.5h17M3.5 15h17M9.5 3.5v17"/>',
    cards: '<rect x="7" y="6.5" width="13" height="14" rx="2"/><path d="M4 17V5.5A1.5 1.5 0 0 1 5.5 4H16"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-.9 4.7"/><path d="M20 5.5V11h-5.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17"/><path d="M8 3v4M16 3v4"/>',
    download: '<path d="M12 3.5v11"/><path d="M8 11l4 4 4-4"/><path d="M4.5 19.5h15"/>',
    upload: '<path d="M12 15.5v-11"/><path d="M8 8.5l4-4 4 4"/><path d="M4.5 19.5h15"/>',
    trash: '<path d="M4.5 6.5h15"/><path d="M9.5 6.5V4.2h5v2.3"/><path d="M6.5 6.5l1 13.3h9l1-13.3"/>',
    inbox: '<path d="M3.5 13.5h4l1.5 3h6l1.5-3h4"/><path d="M6 4.5h12l2.5 9v5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-5z"/>',
    error: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.7 2.7L16 9.5"/>',
    circle: '<circle cx="12" cy="12" r="9"/>',
    brain: '<path d="M12 5v14"/><path d="M12 6.5A3 3 0 0 0 6.6 8 2.8 2.8 0 0 0 5 13a3 3 0 0 0 2 5 2.7 2.7 0 0 0 5 .4"/><path d="M12 6.5A3 3 0 0 1 17.4 8 2.8 2.8 0 0 1 19 13a3 3 0 0 1-2 5 2.7 2.7 0 0 1-5 .4"/>',
    sigma: '<path d="M17.5 5.5H6.5l6 6.5-6 6.5h11"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/><path d="M12 8v4.4l3 1.8"/>',
    pencil: '<path d="M4 20l1-4L16.4 4.6a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L8 19z"/>',
    bolt: '<path d="M13.5 3L5 13.8h6L10.5 21 19 10.2h-6z"/>',
    ruler: '<path d="M3.5 14.2L14.2 3.5l6.3 6.3L9.8 20.5z"/><path d="M7 10.7l2 2M10 7.7l2 2M13 4.7l2 2"/>',
    hourglass: '<path d="M7 3.5h10M7 20.5h10"/><path d="M8 3.5v3.2c0 2 4 3.9 4 5.3s-4 3.3-4 5.3v3.2"/><path d="M16 3.5v3.2c0 2-4 3.9-4 5.3s4 3.3 4 5.3v3.2"/>'
  };

  /* Alias para no repetir dibujos que significan lo mismo */
  const ALIAS = {
    tune: 'settings', school: 'book', insights: 'chart', draw: 'pencil',
    tips_and_updates: 'bulb', quiz: 'help', menu_book: 'book',
    show_chart: 'chart', auto_stories: 'book', dataset: 'grid',
    construction: 'tool', style: 'cards', event: 'calendar', today: 'calendar',
    calendar_month: 'calendar', history_edu: 'history', psychology: 'brain',
    function: 'sigma', build: 'tool', restart_alt: 'refresh', cancel: 'error',
    priority_high: 'warning', 'delete': 'trash', 'play_arrow': 'play'
  };

  function icon(name, extra) {
    const key = ALIAS[name] || name;
    const d = P[key];
    if (!d) return '';
    return '<svg class="icon' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  AYP.icon = icon;
  AYP.iconNames = () => Object.keys(P);
})();
