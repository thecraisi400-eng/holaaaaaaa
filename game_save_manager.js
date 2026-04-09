(function () {
  const SAVE_VERSION = '1.0';
  const SAVE_NAMESPACE = 'ngs_';
  const SAVE_KEY = `${SAVE_NAMESPACE}save_state`;
  const LEGACY_SAVE_KEY = `${SAVE_NAMESPACE}rpg_save_data`;

  const defaultConfig = {
    autoSaveIntervalMs: 30000,
    debug: false
  };

  const providers = new Map();
  let config = { ...defaultConfig };
  let autoSaveTimer = null;
  let initialized = false;
  let lastKnownLevel = null;

  const storageAdapter = {
    getItem(key) {
      return window.localStorage.getItem(key);
    },
    setItem(key, value) {
      window.localStorage.setItem(key, value);
    },
    removeItem(key) {
      window.localStorage.removeItem(key);
    },
    keys() {
      return Object.keys(window.localStorage);
    }
  };

  function log(...args) {
    if (!config.debug) return;
    console.log('[SaveManager]', ...args);
  }

  function safeJsonParse(raw) {
    if (!raw || typeof raw !== 'string') return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn('[SaveManager] JSON inválido en guardado.', error);
      return null;
    }
  }

  function getNamespacedStorageSnapshot() {
    const snapshot = {};
    storageAdapter.keys().forEach((key) => {
      if (!key || !key.startsWith(SAVE_NAMESPACE) || key === SAVE_KEY) return;
      const rawValue = storageAdapter.getItem(key);
      snapshot[key] = safeJsonParse(rawValue) ?? rawValue;
    });
    return snapshot;
  }

  function getCoreState() {
    const gameState = window.GameState && typeof window.GameState.getState === 'function'
      ? window.GameState.getState()
      : null;

    const heroSnapshot = window.HeroSystem && typeof window.HeroSystem.getHeroSnapshot === 'function'
      ? window.HeroSystem.getHeroSnapshot()
      : (window.CharacterStatsSystem?.getActiveHero?.() || null);

    const missionState = window.MissionSystem && typeof window.MissionSystem.getSerializableState === 'function'
      ? window.MissionSystem.getSerializableState()
      : null;

    const legacyProfile = safeJsonParse(storageAdapter.getItem(LEGACY_SAVE_KEY));

    return {
      gameState,
      heroSnapshot,
      missionState,
      profile: legacyProfile,
      ui: {
        visibility: document.visibilityState,
        activeElementId: document.activeElement?.id || null
      },
      namespacedStorage: getNamespacedStorageSnapshot()
    };
  }

  function runProvidersCollect() {
    const modules = {};
    providers.forEach((provider, key) => {
      if (!provider || typeof provider.collect !== 'function') return;
      try {
        modules[key] = provider.collect();
      } catch (error) {
        console.warn(`[SaveManager] Error recolectando módulo "${key}"`, error);
      }
    });
    return modules;
  }

  function runProvidersApply(data) {
    if (!data || typeof data !== 'object') return;
    providers.forEach((provider, key) => {
      if (!provider || typeof provider.apply !== 'function') return;
      try {
        provider.apply(data[key]);
      } catch (error) {
        console.warn(`[SaveManager] Error aplicando módulo "${key}"`, error);
      }
    });
  }

  function createEnvelope(payload = {}) {
    const now = Date.now();
    return {
      saveVersion: SAVE_VERSION,
      updatedAt: now,
      createdAt: payload.createdAt || now,
      data: {
        ...getCoreState(),
        ...payload,
        modules: {
          ...runProvidersCollect(),
          ...(payload.modules || {})
        }
      }
    };
  }

  function save(overrides = {}, reason = 'manual') {
    try {
      const previous = load();
      const createdAt = previous?.createdAt || Date.now();
      const mergedPayload = {
        ...(previous?.data || {}),
        ...overrides,
        createdAt
      };
      const envelope = createEnvelope(mergedPayload);
      storageAdapter.setItem(SAVE_KEY, JSON.stringify(envelope));
      log('Guardado OK', reason, envelope);
      window.dispatchEvent(new CustomEvent('ngs:save-success', { detail: { reason, save: envelope } }));
      return envelope;
    } catch (error) {
      console.error('[SaveManager] No se pudo guardar.', error);
      window.dispatchEvent(new CustomEvent('ngs:save-error', { detail: { reason, error } }));
      return null;
    }
  }

  function migrate(oldData) {
    if (!oldData || typeof oldData !== 'object') {
      return createEnvelope();
    }

    return createEnvelope({
      profile: {
        characterId: oldData.characterId || '',
        character: oldData.character || '',
        characterSprite: oldData.characterSprite || '',
        clan: oldData.clan || '',
        clanName: oldData.clanName || oldData.clan || '',
        level: oldData.level || 1,
        rank: oldData.rank || (window.CharacterStatsSystem?.DEFAULT_RANK || 'GENIN'),
        exp: oldData.exp || 0,
        timestamp: oldData.timestamp || Date.now(),
        playTime: oldData.playTime || '00:00:00'
      },
      legacySource: 'ngs_rpg_save_data'
    });
  }

  function load() {
    const raw = storageAdapter.getItem(SAVE_KEY);
    if (raw) {
      const parsed = safeJsonParse(raw);
      if (!parsed || typeof parsed !== 'object') {
        console.warn('[SaveManager] Guardado principal corrupto, se limpiará.');
        storageAdapter.removeItem(SAVE_KEY);
        return null;
      }

      if (!parsed.saveVersion || parsed.saveVersion !== SAVE_VERSION) {
        const migrated = migrate(parsed.data || parsed);
        storageAdapter.setItem(SAVE_KEY, JSON.stringify(migrated));
        return migrated;
      }

      return parsed;
    }

    const legacy = safeJsonParse(storageAdapter.getItem(LEGACY_SAVE_KEY));
    if (!legacy) return null;

    const migratedLegacy = migrate(legacy);
    storageAdapter.setItem(SAVE_KEY, JSON.stringify(migratedLegacy));
    return migratedLegacy;
  }

  function applyLoadedState(envelope) {
    if (!envelope?.data) return false;

    const { data } = envelope;
    if (window.GameState && typeof window.GameState.hydrate === 'function' && data.gameState) {
      window.GameState.hydrate(data.gameState);
    }

    if (window.CharacterStatsSystem && data.heroSnapshot) {
      window.CharacterStatsSystem.setActiveHero(data.heroSnapshot);
      window.dispatchEvent(new CustomEvent('ngs:hero-stats-updated', { detail: { hero: data.heroSnapshot } }));
    }

    if (window.MissionSystem && typeof window.MissionSystem.applySerializableState === 'function') {
      window.MissionSystem.applySerializableState(data.missionState || null);
    }

    runProvidersApply(data.modules);
    return true;
  }

  function exists() {
    return Boolean(storageAdapter.getItem(SAVE_KEY) || storageAdapter.getItem(LEGACY_SAVE_KEY));
  }

  function clear() {
    const keys = storageAdapter.keys().filter((key) => key && key.startsWith(SAVE_NAMESPACE));
    keys.forEach((key) => storageAdapter.removeItem(key));
    providers.forEach((provider) => {
      if (provider && typeof provider.clear === 'function') {
        try {
          provider.clear();
        } catch (error) {
          console.warn('[SaveManager] Error limpiando provider', error);
        }
      }
    });
    window.dispatchEvent(new CustomEvent('ngs:save-cleared'));
  }

  function startAutoSave(intervalMs = config.autoSaveIntervalMs) {
    stopAutoSave();
    autoSaveTimer = window.setInterval(() => save({}, 'interval'), Math.max(5000, Number(intervalMs) || 30000));
  }

  function stopAutoSave() {
    if (!autoSaveTimer) return;
    window.clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }

  function handleStateUpdated(event) {
    const gameState = event?.detail?.state;
    if (!gameState) return;
    if (lastKnownLevel == null) {
      lastKnownLevel = gameState.level;
      return;
    }
    if (gameState.level !== lastKnownLevel) {
      lastKnownLevel = gameState.level;
      save({}, 'level-change');
    }
  }

  function bindLifecycleEvents() {
    window.addEventListener('beforeunload', () => save({}, 'beforeunload'));
    window.addEventListener('pagehide', () => save({}, 'pagehide'));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        save({}, 'visibility-hidden');
      }
    });

    window.addEventListener('ngs:state-updated', handleStateUpdated);
    window.addEventListener('ngs:game-entered', () => save({}, 'game-entered'));
    window.addEventListener('ngs:game-paused', () => save({}, 'game-paused'));
  }

  function initAutoSave(nextConfig = {}) {
    config = { ...config, ...nextConfig };
    if (!initialized) {
      bindLifecycleEvents();
      initialized = true;
    }
    startAutoSave(config.autoSaveIntervalMs);
  }

  function registerProvider(key, provider) {
    if (!key || !provider) return;
    providers.set(key, provider);
  }

  window.SaveManager = {
    SAVE_KEY,
    SAVE_VERSION,
    initAutoSave,
    registerProvider,
    save,
    load,
    exists,
    clear,
    migrate,
    applyLoadedState,
    startAutoSave,
    stopAutoSave
  };
})();
