(() => {
  const state = {
    hp: 720,
    atk: 1240,
    def: 880,
    pc: 120,
    extra: {
      spd: 60,
      chk: 200
    }
  };

  const listeners = new Set();

  function emit() {
    const snapshot = getState();
    listeners.forEach((listener) => listener(snapshot));
  }

  function toSafeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function getState() {
    return {
      hp: state.hp,
      atk: state.atk,
      def: state.def,
      pc: state.pc,
      extra: { ...state.extra }
    };
  }

  function setState(patch = {}) {
    let dirty = false;

    if (Object.prototype.hasOwnProperty.call(patch, 'hp')) {
      state.hp = Math.max(0, Math.round(toSafeNumber(patch.hp, state.hp)));
      dirty = true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'atk')) {
      state.atk = Math.max(0, Math.round(toSafeNumber(patch.atk, state.atk)));
      dirty = true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'def')) {
      state.def = Math.max(0, Math.round(toSafeNumber(patch.def, state.def)));
      dirty = true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'pc')) {
      state.pc = Math.max(0, Math.round(toSafeNumber(patch.pc, state.pc)));
      dirty = true;
    }
    if (patch.extra && typeof patch.extra === 'object') {
      state.extra = { ...state.extra, ...patch.extra };
      dirty = true;
    }

    if (dirty) emit();
    return getState();
  }

  function updateStat(key, delta) {
    if (!Object.prototype.hasOwnProperty.call(state, key)) return getState();
    const next = toSafeNumber(state[key], 0) + toSafeNumber(delta, 0);
    return setState({ [key]: next });
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  window.stateManager = {
    getState,
    setState,
    updateStat,
    subscribe
  };
})();
