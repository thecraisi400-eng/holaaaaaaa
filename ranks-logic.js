(() => {
  function createRanksLogic({ manager }) {
    const data = window.ARBOL_RANKS_DATA || {};
    const { RANKS } = data;
    if (!Array.isArray(RANKS) || RANKS.length === 0) {
      throw new Error('ARBOL_RANKS_DATA no disponible');
    }

    const base = (typeof manager?.getState === 'function' ? manager.getState() : {}) || {};
    const extras = base.extra || {};

    const S = {
      cp: Number.isFinite(base.pc) ? base.pc : 120,
      currentRank: 0,
      viewRank: 0,
      stats: {
        atk: Number.isFinite(base.atk) ? base.atk : 100,
        def: Number.isFinite(base.def) ? base.def : 80,
        hp: Number.isFinite(base.hp) ? base.hp : 500,
        spd: Number.isFinite(extras.spd) ? extras.spd : 60,
        chk: Number.isFinite(extras.chk) ? extras.chk : 200
      },
      progress: Array.from({ length: RANKS.length }, () => Array(5).fill(false)),
      bonusClaimed: Array(RANKS.length).fill(false)
    };

    function syncStateManager() {
      if (!manager || typeof manager.setState !== 'function') return;
      manager.setState({
        hp: S.stats.hp,
        atk: S.stats.atk,
        def: S.stats.def,
        pc: S.cp,
        extra: {
          spd: S.stats.spd,
          chk: S.stats.chk
        }
      });
    }

    function buyNode(vi, ni, nd) {
      const r = RANKS[vi];
      if (!r) return { ok: false, reason: 'rank-missing' };
      if (S.cp < r.cost) return { ok: false, reason: 'insufficient-pc' };
      if (S.progress[vi][ni]) return { ok: false, reason: 'already-bought' };

      S.cp -= r.cost;
      S.progress[vi][ni] = true;
      S.stats[nd.key] += nd.bonus;
      syncStateManager();

      return {
        ok: true,
        statKey: nd.key,
        done: S.progress[vi].filter(Boolean).length
      };
    }

    function claimBonus(vi) {
      if (S.bonusClaimed[vi]) return { ok: false, reason: 'already-claimed' };
      const r = RANKS[vi];
      if (!r) return { ok: false, reason: 'rank-missing' };

      Object.entries(r.bonus.grants).forEach(([key, val]) => {
        S.stats[key] += val;
      });
      S.bonusClaimed[vi] = true;

      const next = vi + 1;
      if (next < RANKS.length) {
        S.currentRank = next;
        S.viewRank = next;
      }

      syncStateManager();
      return { ok: true, grants: r.bonus.grants };
    }

    function destroy() {
      // reservado para timers futuros
    }

    syncStateManager();

    return {
      S,
      buyNode,
      claimBonus,
      destroy
    };
  }

  window.createRanksLogic = createRanksLogic;
})();
