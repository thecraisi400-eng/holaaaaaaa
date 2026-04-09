(function () {
  const SAVE_VERSION = '1.0';
  const DEFAULT_STORAGE_KEY = 'ngs_game_save_v1';
  const LEGACY_KEYS = ['ngs_rpg_save_data'];

  function createLocalStorageAdapter(storageKey) {
    return {
      read() {
        return localStorage.getItem(storageKey);
      },
      write(value) {
        localStorage.setItem(storageKey, value);
      },
      remove() {
        localStorage.removeItem(storageKey);
      },
      exists() {
        return localStorage.getItem(storageKey) !== null;
      }
    };
  }

  const SaveManager = {
    saveVersion: SAVE_VERSION,
    config: {
      storageKey: DEFAULT_STORAGE_KEY,
      autoSaveIntervalMs: 30000,
      autoSaveEnabled: true,
      clearNamespacePrefix: 'ngs_',
      confirmNewGame: true
    },
    storage: null,
    providers: [],
    autoSaveTimer: null,
    initialized: false,

    init(customConfig = {}) {
      if (this.initialized) return;
      this.configure(customConfig);
      this.initialized = true;
    },

    configure(customConfig = {}) {
      this.config = { ...this.config, ...customConfig };
      this.storage = createLocalStorageAdapter(this.config.storageKey);
    },

    registerProvider(key, provider) {
      if (!key || typeof provider !== 'object') return;
      this.providers = this.providers.filter((entry) => entry.key !== key);
      this.providers.push({ key, provider });
    },

    collectState() {
      const payload = {
        saveVersion: this.saveVersion,
        timestamp: Date.now(),
        systems: {}
      };

      this.providers.forEach(({ key, provider }) => {
        if (typeof provider.serialize !== 'function') return;
        try {
          payload.systems[key] = provider.serialize();
        } catch (error) {
          console.warn(`[SaveManager] Error serializando ${key}:`, error);
          payload.systems[key] = {
            __error: true,
            message: error?.message || 'unknown'
          };
        }
      });

      return payload;
    },

    applyState(data) {
      if (!data || typeof data !== 'object') return false;
      const migrated = this.migrate(data);
      const systems = migrated?.systems || {};

      this.providers.forEach(({ key, provider }) => {
        if (typeof provider.deserialize !== 'function') return;
        try {
          provider.deserialize(systems[key]);
        } catch (error) {
          console.warn(`[SaveManager] Error aplicando ${key}:`, error);
        }
      });

      return true;
    },

    save(reason = 'manual') {
      try {
        const payload = this.collectState();
        payload.reason = reason;
        this.storage.write(JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('ngs:save-completed', { detail: { reason, payload } }));
        return payload;
      } catch (error) {
        console.error('[SaveManager] save() falló:', error);
        window.dispatchEvent(new CustomEvent('ngs:save-failed', { detail: { reason, error } }));
        return null;
      }
    },

    load() {
      try {
        let raw = this.storage.read();
        if (!raw) {
          const legacyRaw = localStorage.getItem(LEGACY_KEYS[0]);
          if (!legacyRaw) return null;
          const legacyParsed = JSON.parse(legacyRaw);
          const migratedLegacy = this.migrate(legacyParsed);
          this.storage.write(JSON.stringify(migratedLegacy));
          raw = this.storage.read();
        }
        const parsed = JSON.parse(raw);
        this.applyState(parsed);
        return parsed;
      } catch (error) {
        console.error('[SaveManager] load() falló, limpiando guardado corrupto:', error);
        this.clear({ keepLegacy: false });
        return null;
      }
    },

    exists() {
      try {
        return this.storage.exists() || LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null);
      } catch (error) {
        console.warn('[SaveManager] exists() falló:', error);
        return false;
      }
    },

    clear(options = {}) {
      const keepLegacy = Boolean(options.keepLegacy);
      try {
        this.storage.remove();
        const keys = [];
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (key.startsWith(this.config.clearNamespacePrefix)) keys.push(key);
        }

        keys.forEach((key) => {
          if (keepLegacy && LEGACY_KEYS.includes(key)) return;
          localStorage.removeItem(key);
        });

        window.dispatchEvent(new CustomEvent('ngs:save-cleared'));
      } catch (error) {
        console.error('[SaveManager] clear() falló:', error);
      }
    },

    migrate(oldData) {
      if (!oldData || typeof oldData !== 'object') {
        return {
          saveVersion: this.saveVersion,
          timestamp: Date.now(),
          systems: {}
        };
      }

      if (oldData.saveVersion === this.saveVersion && oldData.systems) {
        return oldData;
      }

      const legacy = oldData;
      const migrated = {
        saveVersion: this.saveVersion,
        timestamp: legacy.timestamp || Date.now(),
        systems: {
          profile: {
            selectedClan: legacy.clan || null,
            selectedCharacter: legacy.character || null,
            saveData: {
              characterId: legacy.characterId || '',
              character: legacy.character || '',
              characterSprite: legacy.characterSprite || '',
              clan: legacy.clan || '',
              clanName: legacy.clanName || '',
              level: legacy.level || 1,
              rank: legacy.rank || 'GENIN',
              exp: legacy.exp || 0,
              timestamp: legacy.timestamp || Date.now(),
              playTime: legacy.playTime || '00:00:00'
            }
          }
        }
      };

      return migrated;
    },

    startAutoSave() {
      this.stopAutoSave();
      if (!this.config.autoSaveEnabled) return;
      const interval = Math.max(5000, Number(this.config.autoSaveIntervalMs) || 30000);
      this.autoSaveTimer = setInterval(() => {
        this.save('interval');
      }, interval);
    },

    stopAutoSave() {
      if (!this.autoSaveTimer) return;
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    },

    bindLifecycle() {
      window.addEventListener('beforeunload', () => this.save('beforeunload'));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.save('visibility-hidden');
        }
      });

      window.addEventListener('ngs:checkpoint-save', (event) => {
        const reason = event?.detail?.reason || 'checkpoint';
        this.save(reason);
      });
    },

    getRawSave() {
      try {
        const raw = this.storage.read();
        if (raw) return JSON.parse(raw);
        const legacyRaw = localStorage.getItem(LEGACY_KEYS[0]);
        if (!legacyRaw) return null;
        return this.migrate(JSON.parse(legacyRaw));
      } catch (_error) {
        return null;
      }
    }
  };

  SaveManager.configure();
  SaveManager.bindLifecycle();
  SaveManager.startAutoSave();

  window.SaveManager = SaveManager;
})();
