(function () {
  const STORAGE_KEYS = {
    final: 'ngs_save_bundle_v2',
    temp: 'ngs_save_bundle_v2.tmp',
    legacy: 'ngs_rpg_save_data',
    metrics: 'ngs_save_metrics_v1'
  };

  const SAVE_VERSION = 2;
  const MAX_CACHE_BYTES = 500 * 1024 * 1024;

  function now() {
    return Date.now();
  }

  function stableHash(input) {
    const str = String(input ?? '');
    let hash = 5381;
    for (let i = 0; i < str.length; i += 1) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return `djb2_${(hash >>> 0).toString(16)}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createDefaultSave() {
    return {
      save_version: SAVE_VERSION,
      player_progress: {
        characterId: null,
        character: null,
        characterSprite: '',
        clan: null,
        clanName: null,
        level: 1,
        rank: 'GENIN',
        exp: 0,
        gold: 100,
        hp: 100,
        mp: 100,
        playTime: '00:00:00',
        timestamp: now(),
        pending_sync: []
      },
      settings: {
        audioEnabled: true,
        musicVolume: 1,
        sfxVolume: 1,
        graphicsQuality: 'auto',
        locale: 'es-MX',
        updatedAt: now()
      },
      cache_index: [],
      telemetry: {
        cold_start_ms: null,
        warm_start_ms: null,
        load_errors: 0,
        parse_errors: 0,
        storage_used_bytes: 0,
        last_start_kind: null,
        updatedAt: now()
      },
      signature: ''
    };
  }

  function migrateIfNeeded(data) {
    if (!data || typeof data !== 'object') return createDefaultSave();

    if (data.save_version === SAVE_VERSION && data.player_progress && data.settings && Array.isArray(data.cache_index)) {
      return data;
    }

    const defaults = createDefaultSave();
    const mergedProgress = {
      ...defaults.player_progress,
      ...data,
      timestamp: data.timestamp || now()
    };

    return {
      ...defaults,
      player_progress: mergedProgress,
      save_version: SAVE_VERSION
    };
  }

  function getStorageUsedBytes() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key) || '';
      total += key.length + value.length;
    }
    return total * 2;
  }

  class SaveManager {
    constructor() {
      this.data = createDefaultSave();
      this.hasLoaded = false;
      this.pendingSaveTimeout = null;
      this.lastAssetTouchedAt = new Map();
    }

    buildSignature(payloadWithoutSignature) {
      return stableHash(JSON.stringify(payloadWithoutSignature));
    }

    buildSignedPayload(sourceData) {
      const payload = clone(sourceData);
      payload.save_version = SAVE_VERSION;
      payload.signature = '';
      payload.signature = this.buildSignature(payload);
      return payload;
    }

    readRaw(key) {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    }

    verifyPayload(payload) {
      if (!payload || typeof payload !== 'object') return false;
      const receivedSignature = payload.signature || '';
      const cloned = clone(payload);
      cloned.signature = '';
      const computed = this.buildSignature(cloned);
      return receivedSignature === computed;
    }

    loadAll({ measureStartup = false } = {}) {
      const startTs = performance.now();
      let loaded;
      let fromWarmCache = true;

      try {
        const tempPayload = this.readRaw(STORAGE_KEYS.temp);
        if (tempPayload && this.verifyPayload(tempPayload)) {
          loaded = migrateIfNeeded(tempPayload);
          localStorage.setItem(STORAGE_KEYS.final, JSON.stringify(tempPayload));
          localStorage.removeItem(STORAGE_KEYS.temp);
        }

        if (!loaded) {
          const finalPayload = this.readRaw(STORAGE_KEYS.final);
          if (finalPayload && this.verifyPayload(finalPayload)) {
            loaded = migrateIfNeeded(finalPayload);
          }
        }

        if (!loaded) {
          fromWarmCache = false;
          const legacyRaw = localStorage.getItem(STORAGE_KEYS.legacy);
          if (legacyRaw) {
            loaded = migrateIfNeeded(JSON.parse(legacyRaw));
          }
        }
      } catch (error) {
        loaded = createDefaultSave();
        loaded.telemetry.parse_errors += 1;
        fromWarmCache = false;
        console.warn('SaveManager: fallo de parseo al cargar.', error);
      }

      if (!loaded) {
        loaded = createDefaultSave();
        fromWarmCache = false;
      }

      loaded = migrateIfNeeded(loaded);
      loaded.telemetry.storage_used_bytes = getStorageUsedBytes();
      loaded.telemetry.updatedAt = now();
      this.data = loaded;
      this.hasLoaded = true;

      if (measureStartup) {
        const elapsed = Math.max(0, Math.round(performance.now() - startTs));
        loaded.telemetry.last_start_kind = fromWarmCache ? 'warm' : 'cold';
        if (fromWarmCache) loaded.telemetry.warm_start_ms = elapsed;
        else loaded.telemetry.cold_start_ms = elapsed;
        this.saveNow({ reason: 'startup-metrics' });
      }

      return clone(this.data);
    }

    saveNow({ reason = 'manual' } = {}) {
      if (!this.hasLoaded) this.loadAll();
      try {
        const payload = this.buildSignedPayload(this.data);
        const serialized = JSON.stringify(payload);
        localStorage.setItem(STORAGE_KEYS.temp, serialized);

        const reRead = this.readRaw(STORAGE_KEYS.temp);
        if (!reRead || !this.verifyPayload(reRead)) {
          throw new Error('Integridad inválida al guardar temporal.');
        }

        localStorage.setItem(STORAGE_KEYS.final, serialized);
        localStorage.removeItem(STORAGE_KEYS.temp);
        this.data.telemetry.storage_used_bytes = getStorageUsedBytes();
        localStorage.setItem(STORAGE_KEYS.metrics, JSON.stringify({ reason, savedAt: now() }));
        return true;
      } catch (error) {
        this.data.telemetry.load_errors += 1;
        console.warn(`SaveManager: saveNow falló (${reason}).`, error);
        return false;
      }
    }

    queueAutosave({ debounceMs = 6000, reason = 'autosave' } = {}) {
      if (this.pendingSaveTimeout) clearTimeout(this.pendingSaveTimeout);
      this.pendingSaveTimeout = setTimeout(() => {
        this.pendingSaveTimeout = null;
        this.saveNow({ reason });
      }, debounceMs);
    }

    updateProgress(patch, { autosave = true, reason = 'progress-update' } = {}) {
      if (!this.hasLoaded) this.loadAll();
      this.data.player_progress = {
        ...this.data.player_progress,
        ...(patch || {}),
        timestamp: now()
      };
      if (autosave) this.queueAutosave({ reason });
      return clone(this.data.player_progress);
    }

    updateSettings(patch, { autosave = true } = {}) {
      if (!this.hasLoaded) this.loadAll();
      this.data.settings = {
        ...this.data.settings,
        ...(patch || {}),
        updatedAt: now()
      };
      if (autosave) this.queueAutosave({ reason: 'settings-update' });
      return clone(this.data.settings);
    }

    getProgress() {
      if (!this.hasLoaded) this.loadAll();
      return clone(this.data.player_progress);
    }

    getSettings() {
      if (!this.hasLoaded) this.loadAll();
      return clone(this.data.settings);
    }

    getCacheIndex() {
      if (!this.hasLoaded) this.loadAll();
      return clone(this.data.cache_index);
    }

    tryGetCachedAsset(assetId, expectedHash = '') {
      if (!this.hasLoaded) this.loadAll();
      const entry = this.data.cache_index.find((item) => item.asset_id === assetId);
      if (!entry) return null;
      if (expectedHash && entry.hash !== expectedHash) return null;
      entry.last_used_at = now();
      this.lastAssetTouchedAt.set(assetId, entry.last_used_at);
      return clone(entry);
    }

    upsertCachedAsset(entry) {
      if (!this.hasLoaded) this.loadAll();
      const normalized = {
        asset_id: entry.asset_id,
        hash: entry.hash || stableHash(`${entry.asset_id}:${entry.local_path || ''}`),
        fecha: entry.fecha || now(),
        size_bytes: Math.max(0, Number(entry.size_bytes) || 0),
        local_path: entry.local_path || '',
        ttl_ms: Number(entry.ttl_ms) > 0 ? Number(entry.ttl_ms) : null,
        last_used_at: now()
      };
      const idx = this.data.cache_index.findIndex((item) => item.asset_id === normalized.asset_id);
      if (idx >= 0) this.data.cache_index[idx] = normalized;
      else this.data.cache_index.push(normalized);

      this.cleanupCache();
      this.queueAutosave({ reason: 'cache-upsert' });
      return clone(normalized);
    }

    cleanupCache() {
      if (!this.hasLoaded) this.loadAll();
      const currentTs = now();
      this.data.cache_index = this.data.cache_index.filter((asset) => {
        if (!asset.ttl_ms) return true;
        return (currentTs - Number(asset.fecha || currentTs)) <= asset.ttl_ms;
      });

      let totalBytes = this.data.cache_index.reduce((acc, entry) => acc + (Number(entry.size_bytes) || 0), 0);
      if (totalBytes <= MAX_CACHE_BYTES) return;

      this.data.cache_index.sort((a, b) => Number(a.last_used_at || 0) - Number(b.last_used_at || 0));
      while (this.data.cache_index.length && totalBytes > MAX_CACHE_BYTES) {
        const removed = this.data.cache_index.shift();
        totalBytes -= Number(removed?.size_bytes || 0);
      }
    }

    enqueueOfflineChange(change) {
      if (!this.hasLoaded) this.loadAll();
      this.data.player_progress.pending_sync.push({
        ...change,
        createdAt: now()
      });
      this.queueAutosave({ reason: 'pending-sync' });
    }

    syncPendingChanges({ resolver = 'server-priority' } = {}) {
      if (!this.hasLoaded) this.loadAll();
      const pending = [...this.data.player_progress.pending_sync];
      this.data.player_progress.pending_sync = [];
      this.data.player_progress.last_sync_resolver = resolver;
      this.data.player_progress.last_sync_at = now();
      this.saveNow({ reason: 'sync-pending' });
      return pending;
    }


    SaveNow(options) {
      return this.saveNow(options);
    }

    LoadAll(options) {
      return this.loadAll(options);
    }

    TryGetCachedAsset(assetId, expectedHash) {
      return this.tryGetCachedAsset(assetId, expectedHash);
    }

    clearAll() {
      localStorage.removeItem(STORAGE_KEYS.final);
      localStorage.removeItem(STORAGE_KEYS.temp);
      localStorage.removeItem(STORAGE_KEYS.legacy);
      localStorage.removeItem(STORAGE_KEYS.metrics);
      this.data = createDefaultSave();
      this.hasLoaded = true;
      this.saveNow({ reason: 'clear-all' });
    }
  }

  window.SaveManager = new SaveManager();
})();
