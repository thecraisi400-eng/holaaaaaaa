(function () {
  const SAVE_VERSION = '1.0';
  const DEFAULT_NAMESPACE = 'ngs';
  const DEFAULT_KEY = 'save';

  const defaultConfig = {
    autoSaveIntervalMs: 30000,
    namespace: DEFAULT_NAMESPACE,
    key: DEFAULT_KEY,
    enabled: true,
    logger: console
  };

  function deepClone(data) {
    if (typeof structuredClone === 'function') {
      return structuredClone(data);
    }
    return JSON.parse(JSON.stringify(data));
  }

  function createStorageAdapter(storage = window.localStorage) {
    return {
      read(fullKey) {
        return storage.getItem(fullKey);
      },
      write(fullKey, value) {
        storage.setItem(fullKey, value);
      },
      remove(fullKey) {
        storage.removeItem(fullKey);
      },
      keys() {
        return Object.keys(storage);
      }
    };
  }

  const SaveManager = {
    version: SAVE_VERSION,
    config: { ...defaultConfig },
    adapter: createStorageAdapter(),
    saveTimer: null,
    delayedSaveTimer: null,
    wakeEventsBound: false,
    systems: new Map(),

    init(options = {}) {
      this.config = { ...this.config, ...options };
      if (options.adapter) {
        this.adapter = options.adapter;
      }
      this.bindLifecycleEvents();
      this.startAutoSave();
      return this;
    },

    getFullKey() {
      return `${this.config.namespace}:${this.config.key}`;
    },

    registerSystem(name, handlers = {}) {
      if (!name || typeof name !== 'string') return;
      this.systems.set(name, {
        collect: typeof handlers.collect === 'function' ? handlers.collect : null,
        apply: typeof handlers.apply === 'function' ? handlers.apply : null
      });
    },

    collectSystemsState() {
      const payload = {};
      this.systems.forEach((handlers, name) => {
        if (!handlers.collect) return;
        try {
          const value = handlers.collect();
          if (value !== undefined) {
            payload[name] = deepClone(value);
          }
        } catch (error) {
          this.logError(`No se pudo recolectar estado para "${name}"`, error);
        }
      });
      return payload;
    },

    applySystemsState(systemState = {}) {
      this.systems.forEach((handlers, name) => {
        if (!handlers.apply) return;
        try {
          handlers.apply(systemState?.[name]);
        } catch (error) {
          this.logError(`No se pudo restaurar estado para "${name}"`, error);
        }
      });
    },

    buildPayload(meta = {}) {
      return {
        saveVersion: this.version,
        savedAt: Date.now(),
        meta: {
          reason: meta.reason || 'manual',
          scene: meta.scene || 'unknown'
        },
        systems: this.collectSystemsState()
      };
    },

    save(meta = {}) {
      if (!this.config.enabled) return false;

      try {
        const payload = this.buildPayload(meta);
        this.adapter.write(this.getFullKey(), JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('ngs:save-complete', { detail: { payload } }));
        return true;
      } catch (error) {
        this.logError('Error al guardar partida', error);
        window.dispatchEvent(new CustomEvent('ngs:save-error', { detail: { error } }));
        return false;
      }
    },

    parse(rawData) {
      if (!rawData || typeof rawData !== 'string') return null;
      try {
        return JSON.parse(rawData);
      } catch (error) {
        this.logError('Save corrupto o JSON inválido', error);
        return null;
      }
    },

    migrate(oldData) {
      if (!oldData || typeof oldData !== 'object') return null;
      if (oldData.saveVersion === this.version) return oldData;

      const migrated = {
        saveVersion: this.version,
        savedAt: oldData.savedAt || oldData.timestamp || Date.now(),
        meta: oldData.meta || { reason: 'migration', scene: 'unknown' },
        systems: oldData.systems || {}
      };

      if (!migrated.systems.startMenu && (oldData.character || oldData.characterId || oldData.clan)) {
        migrated.systems.startMenu = {
          characterId: oldData.characterId || '',
          character: oldData.character || '',
          characterSprite: oldData.characterSprite || '',
          clan: oldData.clan || '',
          clanName: oldData.clanName || '',
          level: oldData.level || 1,
          rank: oldData.rank || 'GENIN',
          exp: oldData.exp || 0,
          playTime: oldData.playTime || '00:00:00',
          timestamp: oldData.timestamp || oldData.savedAt || Date.now()
        };
      }

      return migrated;
    },

    load() {
      const raw = this.adapter.read(this.getFullKey());
      if (!raw) return null;

      const parsed = this.parse(raw);
      if (!parsed) {
        window.dispatchEvent(new CustomEvent('ngs:save-error', { detail: { reason: 'parse' } }));
        return null;
      }

      const migrated = this.migrate(parsed);
      if (!migrated) return null;

      try {
        this.applySystemsState(migrated.systems);
        window.dispatchEvent(new CustomEvent('ngs:load-complete', { detail: { payload: migrated } }));
        return migrated;
      } catch (error) {
        this.logError('Error al aplicar save', error);
        window.dispatchEvent(new CustomEvent('ngs:load-error', { detail: { error } }));
        return null;
      }
    },

    peekRawData() {
      const raw = this.adapter.read(this.getFullKey());
      if (!raw) return null;
      const parsed = this.parse(raw);
      if (!parsed) return null;
      return this.migrate(parsed);
    },

    exists() {
      return Boolean(this.adapter.read(this.getFullKey()));
    },

    clear(scope = 'namespace') {
      if (scope === 'single') {
        this.adapter.remove(this.getFullKey());
      } else {
        const prefix = `${this.config.namespace}:`;
        this.adapter.keys()
          .filter((key) => key.startsWith(prefix) || key.startsWith('ngs_'))
          .forEach((key) => this.adapter.remove(key));
      }
      window.dispatchEvent(new CustomEvent('ngs:save-cleared', { detail: { scope } }));
      return true;
    },

    startAutoSave() {
      this.stopAutoSave();
      const every = Math.max(5000, Number(this.config.autoSaveIntervalMs) || 30000);
      this.saveTimer = window.setInterval(() => {
        this.save({ reason: 'interval', scene: this.getSceneName() });
      }, every);
    },

    stopAutoSave() {
      if (!this.saveTimer) return;
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    },

    bindLifecycleEvents() {
      if (this.wakeEventsBound) return;
      this.wakeEventsBound = true;

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.save({ reason: 'tab-hidden', scene: this.getSceneName() });
        }
      });

      window.addEventListener('pagehide', () => {
        this.save({ reason: 'pagehide', scene: this.getSceneName() });
      });

      window.addEventListener('beforeunload', () => {
        this.save({ reason: 'beforeunload', scene: this.getSceneName() });
      });

      window.addEventListener('ngs:pause', () => {
        this.save({ reason: 'pause', scene: this.getSceneName() });
      });

      window.addEventListener('ngs:hero-stats-updated', () => {
        this.save({ reason: 'level-change', scene: this.getSceneName() });
      });

      window.addEventListener('ngs:state-updated', () => {
        this.queueSave({ reason: 'state-change', scene: this.getSceneName() }, 1200);
      });

      window.addEventListener('ngs:hero-equipment-updated', () => {
        this.save({ reason: 'equipment-change', scene: this.getSceneName() });
      });
    },

    queueSave(meta = {}, delay = 800) {
      if (this.delayedSaveTimer) {
        clearTimeout(this.delayedSaveTimer);
      }
      this.delayedSaveTimer = window.setTimeout(() => {
        this.delayedSaveTimer = null;
        this.save(meta);
      }, Math.max(150, Number(delay) || 800));
    },

    getSceneName() {
      const app = document.getElementById('app');
      if (app && !app.classList.contains('game-shell-hidden')) return 'game';
      return 'menu';
    },

    logError(message, error) {
      const logger = this.config.logger || console;
      if (logger && typeof logger.error === 'function') {
        logger.error(`[SaveManager] ${message}`, error);
      }
    }
  };

  SaveManager.registerSystem('startMenu', {
    collect() {
      return window.NinjaGameStart && typeof window.NinjaGameStart.getSelectionData === 'function'
        ? window.NinjaGameStart.getSelectionData()
        : null;
    },
    apply(data) {
      if (window.NinjaGameStart && typeof window.NinjaGameStart.applySelectionData === 'function') {
        window.NinjaGameStart.applySelectionData(data || {});
      }
    }
  });

  SaveManager.registerSystem('gameState', {
    collect() {
      return window.GameState && typeof window.GameState.exportForSave === 'function'
        ? window.GameState.exportForSave()
        : (window.GameState?.getState?.() || null);
    },
    apply(data) {
      if (window.GameState && typeof window.GameState.applyFromSave === 'function') {
        window.GameState.applyFromSave(data || {});
      }
    }
  });

  SaveManager.registerSystem('heroSystem', {
    collect() {
      return window.HeroSystem && typeof window.HeroSystem.getPersistentState === 'function'
        ? window.HeroSystem.getPersistentState()
        : null;
    },
    apply(data) {
      if (window.HeroSystem && typeof window.HeroSystem.applyPersistentState === 'function') {
        window.HeroSystem.applyPersistentState(data || {});
      }
    }
  });

  SaveManager.registerSystem('missionSystem', {
    collect() {
      return window.MissionSystem && typeof window.MissionSystem.getPersistentState === 'function'
        ? window.MissionSystem.getPersistentState()
        : null;
    },
    apply(data) {
      if (window.MissionSystem && typeof window.MissionSystem.applyPersistentState === 'function') {
        window.MissionSystem.applyPersistentState(data || {});
      }
    }
  });

  SaveManager.init();
  window.SaveManager = SaveManager;
})();
