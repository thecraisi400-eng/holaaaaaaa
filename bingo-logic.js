(() => {
  const STORAGE_KEY = 'naruto_idle_libro_bingo_v1';
  const EVENT_DURATION_MS = 5 * 60 * 60 * 1000;

  const clampInt = (value, min, max) => Math.max(min, Math.min(max, Math.floor(value)));
  const randInt = (min, max) => clampInt(min + Math.random() * (max - min + 1), min, max);

  function pickRandomUnique(list, amount) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, amount);
  }

  function generateEnemy(rank, name, idx) {
    const meta = window.BINGO_RANK_META[rank];
    const hp = randInt(meta.stat.hp[0], meta.stat.hp[1]);
    const atk = randInt(meta.stat.atk[0], meta.stat.atk[1]);
    const def = randInt(meta.stat.def[0], meta.stat.def[1]);
    const xp = randInt(meta.stat.xp[0], meta.stat.xp[1]);
    const gold = meta.goldBase + randInt(0, 140);

    return {
      id: `${rank}-${Date.now()}-${idx}-${Math.floor(Math.random() * 99999)}`,
      name,
      hp,
      atk,
      def,
      xp,
      gold,
      lvl: meta.minLevel,
      prob: meta.prob,
      defeated: false,
      won: null
    };
  }

  function createNewState(now) {
    const rankOptions = pickRandomUnique(window.BINGO_RANK_ORDER, 2);
    return {
      startedAt: now,
      expiresAt: now + EVENT_DURATION_MS,
      rankOptions,
      selectedRank: null,
      enemiesByRank: {}
    };
  }

  function createLibroBingoLogic() {
    let cachedState = null;

    function readState() {
      if (cachedState) return cachedState;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.rankOptions)) return null;
        cachedState = parsed;
        return parsed;
      } catch {
        return null;
      }
    }

    function saveState(nextState) {
      cachedState = nextState;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }

    function getFreshState() {
      const now = Date.now();
      const loaded = readState();
      if (!loaded || typeof loaded.expiresAt !== 'number' || loaded.expiresAt <= now) {
        const created = createNewState(now);
        saveState(created);
        return created;
      }
      return loaded;
    }

    function ensureRankEnemies(state, rank) {
      const pool = window.BINGO_ENEMIES_BY_RANK[rank] || [];
      if (!state.enemiesByRank[rank] || !Array.isArray(state.enemiesByRank[rank])) {
        const selectedNames = pickRandomUnique(pool, Math.min(5, pool.length));
        state.enemiesByRank[rank] = selectedNames.map((name, idx) => generateEnemy(rank, name, idx));
      }
      return state.enemiesByRank[rank];
    }

    return {
      getState() {
        return getFreshState();
      },
      hasSelectedRank() {
        const state = getFreshState();
        return Boolean(state.selectedRank);
      },
      getTimeLeftMs() {
        const state = getFreshState();
        return Math.max(0, state.expiresAt - Date.now());
      },
      selectRank(rank) {
        const state = getFreshState();
        if (!state.rankOptions.includes(rank)) return null;
        state.selectedRank = rank;
        ensureRankEnemies(state, rank);
        saveState(state);
        return state;
      },
      getCurrentEnemies() {
        const state = getFreshState();
        if (!state.selectedRank) return [];
        const enemies = ensureRankEnemies(state, state.selectedRank);
        saveState(state);
        return enemies;
      },
      isSelectedRankCompleted() {
        const state = getFreshState();
        if (!state.selectedRank) return false;
        const enemies = ensureRankEnemies(state, state.selectedRank);
        saveState(state);
        return enemies.length > 0 && enemies.every((enemy) => enemy.defeated);
      },
      markEnemyResult(enemyId, won) {
        const state = getFreshState();
        if (!state.selectedRank) return;
        const enemies = ensureRankEnemies(state, state.selectedRank);
        const target = enemies.find((enemy) => enemy.id === enemyId);
        if (!target) return;
        target.defeated = true;
        target.won = Boolean(won);
        saveState(state);
      },
      clearSelection() {
        const state = getFreshState();
        state.selectedRank = null;
        saveState(state);
      }
    };
  }

  window.createLibroBingoLogic = createLibroBingoLogic;
})();
