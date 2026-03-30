'use strict';

(() => {
  if (window.stateManager) return;

  const state = {
    hp: 0,
    atk: 0,
    def: 0,
    skillTreeBonuses: {
      ATK: 0,
      DEF: 0,
      HP: 0,
      MP: 0,
      VEL: 0
    }
  };

  const subscribers = new Set();

  function getState() {
    return {
      ...state,
      skillTreeBonuses: { ...state.skillTreeBonuses }
    };
  }

  function emit() {
    const snapshot = getState();
    subscribers.forEach((fn) => fn(snapshot));
  }

  function setState(partial) {
    if (!partial || typeof partial !== 'object') return getState();

    if (partial.skillTreeBonuses && typeof partial.skillTreeBonuses === 'object') {
      state.skillTreeBonuses = {
        ...state.skillTreeBonuses,
        ...partial.skillTreeBonuses
      };
    }

    Object.entries(partial).forEach(([key, value]) => {
      if (key === 'skillTreeBonuses') return;
      state[key] = value;
    });

    emit();
    return getState();
  }

  function subscribe(callback) {
    if (typeof callback !== 'function') return () => {};
    subscribers.add(callback);
    callback(getState());
    return () => subscribers.delete(callback);
  }

  window.stateManager = {
    getState,
    setState,
    subscribe
  };
})();
