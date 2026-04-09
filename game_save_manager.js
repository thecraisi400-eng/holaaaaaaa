(function () {
  const SAVE_KEY = 'ngs_rpg_save_data';
  const SAVE_VERSION = '1.0';
  const DEFAULT_AUTOSAVE_INTERVAL_MS = 30000;

  function createLocalStorageAdapter(namespaceKey) {
    return {
      read() {
        return localStorage.getItem(namespaceKey);
      },
      write(value) {
        localStorage.setItem(namespaceKey, value);
      },
      remove() {
        localStorage.removeItem(namespaceKey);
      },
      keys() {
        const all = [];
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          if (key) all.push(key);
        }
        return all;
      }
    };
  }

  const SaveManager = {
    config: {
      saveKey: SAVE_KEY,
      saveVersion: SAVE_VERSION,
      namespacePrefix: 'ngs_',
      autosaveIntervalMs: DEFAULT_AUTOSAVE_INTERVAL_MS,
      autosaveEnabled: true
    },
    _adapter: createLocalStorageAdapter(SAVE_KEY),
    _autosaveTimer: null,
    _collectors: [],
    _appliers: [],

    registerCollector(collectorFn) {
      if (typeof collectorFn === 'function') this._collectors.push(collectorFn);
    },

    registerApplier(applierFn) {
      if (typeof applierFn === 'function') this._appliers.push(applierFn);
    },

    _basePayload() {
      const session = window.NinjaGameStart && typeof window.NinjaGameStart.getSessionSnapshot === 'function'
        ? window.NinjaGameStart.getSessionSnapshot()
        : {};
      const gameState = window.GameState && typeof window.GameState.getState === 'function'
        ? window.GameState.getState()
        : null;
      const activeHero = window.CharacterStatsSystem && typeof window.CharacterStatsSystem.getActiveHero === 'function'
        ? window.CharacterStatsSystem.getActiveHero()
        : null;
      const heroSnapshot = window.HeroSystem && typeof window.HeroSystem.getHeroSnapshot === 'function'
        ? window.HeroSystem.getHeroSnapshot()
        : null;

      return {
        saveVersion: this.config.saveVersion,
        meta: {
          savedAt: Date.now(),
          reason: 'manual',
          appVersion: 'ngs-web-1.0'
        },
        session,
        systems: {
          gameState,
          activeHero,
          heroSnapshot,
          mission: {
            activeSection: gameState?.activeSection || 'heroe',
            heroLevel: window.MissionSystem?.heroLevel || 1,
            currentRank: window.MissionSystem?.currentRank || null,
            currentView: window.MissionSystem?.currentView || null
          }
        },
        custom: {}
      };
    },

    _safeParse(raw) {
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (error) {
        console.warn('[SaveManager] JSON corrupto, limpiando guardado.', error);
        this.clear();
        return null;
      }
    },

    _normalize(data) {
      if (!data || typeof data !== 'object') return null;
      if (!data.saveVersion) {
        return this.migrate(data);
      }
      if (data.saveVersion !== this.config.saveVersion) {
        return this.migrate(data);
      }
      return data;
    },

    save(reason = 'manual') {
      try {
        const payload = this._basePayload();
        payload.meta.reason = reason;

        this._collectors.forEach((collector) => {
          try {
            const ext = collector(payload);
            if (ext && typeof ext === 'object') {
              payload.custom = {
                ...payload.custom,
                ...ext
              };
            }
          } catch (collectorError) {
            console.warn('[SaveManager] Collector con error:', collectorError);
          }
        });

        this._adapter.write(JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('ngs:save-complete', { detail: { reason, saveData: payload } }));
        return payload;
      } catch (error) {
        console.error('[SaveManager] Error al guardar:', error);
        return null;
      }
    },

    load() {
      try {
        const raw = this._adapter.read();
        const parsed = this._safeParse(raw);
        if (!parsed) return null;
        const migrated = this._normalize(parsed);
        if (!migrated) return null;

        this._appliers.forEach((applier) => {
          try {
            applier(migrated);
          } catch (applierError) {
            console.warn('[SaveManager] Applier con error:', applierError);
          }
        });

        return migrated;
      } catch (error) {
        console.error('[SaveManager] Error al cargar:', error);
        return null;
      }
    },

    exists() {
      const raw = this._adapter.read();
      return Boolean(raw && raw.trim().length > 0);
    },

    clear() {
      try {
        this._adapter.remove();
      } catch (error) {
        console.error('[SaveManager] Error al limpiar guardado principal:', error);
      }

      try {
        const keys = this._adapter.keys();
        keys.forEach((key) => {
          if (key && key.startsWith(this.config.namespacePrefix)) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('[SaveManager] Error al limpiar namespace:', error);
      }
    },

    migrate(oldData) {
      if (!oldData || typeof oldData !== 'object') return null;

      const migrated = {
        saveVersion: this.config.saveVersion,
        meta: {
          savedAt: oldData.timestamp || Date.now(),
          reason: 'migrated',
          appVersion: 'ngs-web-1.0'
        },
        session: {
          selectedClan: oldData.clan || oldData.selectedClan || null,
          selectedCharacter: oldData.character || oldData.selectedCharacter || null,
          intro: {
            clan: oldData.clan || null,
            character: oldData.character || null,
            characterId: oldData.characterId || null,
            clanName: oldData.clanName || null,
            characterSprite: oldData.characterSprite || '',
            level: oldData.level || 1,
            rank: oldData.rank || 'GENIN',
            exp: oldData.exp || 0,
            playTime: oldData.playTime || '00:00'
          }
        },
        systems: {
          gameState: null,
          activeHero: null,
          heroSnapshot: null,
          mission: {
            activeSection: 'heroe',
            heroLevel: oldData.level || 1,
            currentRank: null,
            currentView: null
          }
        },
        custom: {}
      };

      try {
        this._adapter.write(JSON.stringify(migrated));
      } catch (error) {
        console.error('[SaveManager] Error migrando guardado:', error);
      }

      return migrated;
    },

    configure(partial = {}) {
      this.config = { ...this.config, ...(partial || {}) };
      if (partial.saveKey) {
        this._adapter = createLocalStorageAdapter(partial.saveKey);
      }
      this.restartAutosave();
    },

    startAutosave() {
      this.stopAutosave();
      if (!this.config.autosaveEnabled) return;
      const interval = Math.max(5000, Number(this.config.autosaveIntervalMs) || DEFAULT_AUTOSAVE_INTERVAL_MS);
      this._autosaveTimer = setInterval(() => this.save('interval'), interval);
    },

    stopAutosave() {
      if (!this._autosaveTimer) return;
      clearInterval(this._autosaveTimer);
      this._autosaveTimer = null;
    },

    restartAutosave() {
      this.stopAutosave();
      this.startAutosave();
    }
  };

  SaveManager.registerApplier((data) => {
    const introData = data?.session?.intro;
    if (window.NinjaGameStart && typeof window.NinjaGameStart.setSessionFromSave === 'function') {
      window.NinjaGameStart.setSessionFromSave({
        ...introData,
        clan: introData?.clan || data?.session?.selectedClan || null,
        character: introData?.character || data?.session?.selectedCharacter || null
      });
    }

    const gameState = data?.systems?.gameState;
    if (window.GameState && gameState) {
      if (typeof window.GameState.applySavedState === 'function') {
        window.GameState.applySavedState(gameState);
      }
      if (typeof window.GameState.setGold === 'function' && gameState.gold != null) {
        window.GameState.setGold(gameState.gold);
      }
      if (typeof window.GameState.setCharacterVisual === 'function' && gameState.characterVisual) {
        window.GameState.setCharacterVisual(gameState.characterVisual);
      }
      if (typeof window.GameState.setPlayerVitals === 'function') {
        window.GameState.setPlayerVitals({ hp: gameState.hp, mp: gameState.mp });
      }
    }

    const activeHero = data?.systems?.activeHero || data?.systems?.heroSnapshot;
    if (window.CharacterStatsSystem && activeHero && typeof window.CharacterStatsSystem.setActiveHero === 'function') {
      window.CharacterStatsSystem.setActiveHero(activeHero);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!window.SaveManager) return;
    if (document.visibilityState === 'hidden') {
      window.SaveManager.save('tab-hidden');
    }
  });

  window.addEventListener('beforeunload', () => {
    if (!window.SaveManager) return;
    window.SaveManager.save('beforeunload');
  });

  window.addEventListener('ngs:pause', () => SaveManager.save('pause'));
  window.addEventListener('ngs:level-changed', () => SaveManager.save('level-changed'));
  window.addEventListener('ngs:game-entered', () => SaveManager.save('game-entered'));

  window.SaveManager = SaveManager;
  window.SaveManager.startAutosave();
})();
