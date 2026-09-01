/* ============================================================
   store.js — persistencia local: progreso, temas, racha y repaso
   ============================================================ */
(function () {
  window.AYP = window.AYP || {};
  const KEY = 'aypii_estudio_v1';
  const today = () => new Date().toISOString().slice(0, 10);

  const DEFAULT = {
    version: 2,
    progress: {},           // { exId: 'tried' | 'mastered' }
    temas: {},              // { 'u3:partes': true }
    streak: { last: null, count: 0, best: 0, days: [] },
    srs: {},                // { cardId: { box, due } }
    sim: {},                // { corteId: { best: minutos, veces } }
    notas: {},              // { corteId: { parcial: 0-5 | null, taller: 0-5 | null } }
    settings: {
      fontScale: 100,
      reduceMotion: false,
      theme: 'light'
    },
    createdAt: today()
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return migrate();
      const parsed = JSON.parse(raw);
      const st = Object.assign(structuredClone(DEFAULT), parsed, {
        settings: Object.assign({}, DEFAULT.settings, parsed.settings || {}),
        streak: Object.assign({}, DEFAULT.streak, parsed.streak || {})
      });
      /* Ajustes que existieron en versiones anteriores y ya no significan nada.
         Se limpian al cargar para que no reaparezcan al exportar el progreso. */
      ['horario', 'formulaBar', 'startDate'].forEach(k => delete st.settings[k]);
      return st;
    } catch (e) {
      console.warn('Estado corrupto, reiniciando', e);
      return structuredClone(DEFAULT);
    }
  }

  /* Rescata el progreso de la versión anterior de la app si existe */
  function migrate() {
    const s = structuredClone(DEFAULT);
    try {
      const old = localStorage.getItem('aypii_estudio_v1');
      if (old) {
        const o = JSON.parse(old);
        if (o.progress) s.progress = o.progress;
        if (o.streak) s.streak = Object.assign(s.streak, o.streak);
        if (o.srs) s.srs = o.srs;
      }
    } catch (e) { /* sin migración */ }
    return s;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.error('No se pudo guardar', e); }
  }

  const Store = {
    all() { return state; },
    settings() { return state.settings; },

    /* ---- ejercicios ---- */
    exState(id) { return state.progress[id] || 'pending'; },
    setExState(id, st) {
      if (st === 'pending') delete state.progress[id];
      else state.progress[id] = st;
      this.touchStreak(); save();
    },

    /* ---- temas ---- */
    temaKey(u, sid) { return 'u' + u + ':' + sid; },
    temaDone(u, sid) { return !!state.temas[this.temaKey(u, sid)]; },
    setTemaDone(u, sid, v) {
      const k = this.temaKey(u, sid);
      if (v) state.temas[k] = true; else delete state.temas[k];
      this.touchStreak(); save();
    },

    /* ---- racha ---- */
    touchStreak() {
      const t = today(), s = state.streak;
      if (s.last === t) return;
      const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      s.count = (s.last === yest) ? s.count + 1 : 1;
      s.last = t;
      s.best = Math.max(s.best || 0, s.count);
      if (!s.days.includes(t)) s.days.push(t);
      if (s.days.length > 400) s.days = s.days.slice(-400);
    },

    /* ---- estadísticas ---- */
    stats(exIds) {
      let tried = 0, mastered = 0;
      exIds.forEach(id => {
        const st = this.exState(id);
        if (st === 'mastered') mastered++;
        else if (st === 'tried') tried++;
      });
      const den = exIds.length || 1;
      return {
        total: exIds.length, tried, mastered,
        touched: tried + mastered,
        pctMastered: Math.round((mastered / den) * 100),
        pctTouched: Math.round(((tried + mastered) / den) * 100)
      };
    },

    /* ---- repaso espaciado ---- */
    srsCard(id) { return state.srs[id] || { box: 0, due: 0 }; },
    srsReview(id, ok) {
      const c = this.srsCard(id);
      c.box = ok ? Math.min(5, c.box + 1) : 1;
      c.due = Date.now() + [0, 1, 2, 4, 8, 16][c.box] * 864e5;
      state.srs[id] = c;
      this.touchStreak(); save();
    },
    srsDue(ids) { const now = Date.now(); return ids.filter(id => this.srsCard(id).due <= now); },

    /* ---- notas del corte: parcial 70 % + taller 30 % ---- */
    notas(corteId) {
      const n = state.notas[corteId] || {};
      return { parcial: n.parcial === undefined ? null : n.parcial,
               taller: n.taller === undefined ? null : n.taller };
    },
    setNota(corteId, campo, valor) {
      const n = state.notas[corteId] || {};
      if (valor === null || valor === '' || isNaN(valor)) delete n[campo];
      else n[campo] = Math.max(0, Math.min(5, +valor));
      state.notas[corteId] = n; save();
    },

    /* ---- simulacros ---- */
    simRecord(corteId, minutos) {
      const r = state.sim[corteId] || { best: null, veces: 0 };
      r.veces++;
      if (r.best === null || minutos < r.best) r.best = minutos;
      state.sim[corteId] = r; save();
    },
    simStats(corteId) { return state.sim[corteId] || { best: null, veces: 0 }; },

    updateSettings(patch) { Object.assign(state.settings, patch); save(); },

    export() { return JSON.stringify(state, null, 2); },
    import(json) {
      const parsed = (typeof json === 'string') ? JSON.parse(json) : json;
      if (!parsed || typeof parsed !== 'object' || !('progress' in parsed))
        throw new Error('Archivo de progreso no válido');
      state = Object.assign(structuredClone(DEFAULT), parsed);
      state.settings = Object.assign({}, DEFAULT.settings, parsed.settings || {});
      save(); return true;
    },
    reset() { state = structuredClone(DEFAULT); save(); }
  };

  AYP.Store = Store;
})();
