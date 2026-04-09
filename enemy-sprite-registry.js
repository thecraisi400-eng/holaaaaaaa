(function () {
  const DEFAULT_CONFIG_URL = 'assets/config/enemy-sprites.json';

  const FALLBACK_CONFIG = {
    enemies: [
      {
        id: 'default-rank-d',
        name: 'Enemigo de misión D',
        spriteSheet: {
          path: '',
          frameWidth: 64,
          frameHeight: 64,
          frameCount: 1,
          animationFps: 6
        },
        metadata: {
          tier: 'D',
          notes: 'Placeholder por defecto'
        }
      }
    ],
    missionEnemyMap: {
      'D:0': 'default-rank-d',
      'D:1': 'default-rank-d',
      'D:2': 'default-rank-d',
      'D:3': 'default-rank-d',
      'D:4': 'default-rank-d',
      'D:5': 'default-rank-d'
    }
  };

  const imagePromiseCache = new Map();

  function loadImage(src) {
    if (!src) return Promise.reject(new Error('Ruta de sprite vacía'));
    if (imagePromiseCache.has(src)) return imagePromiseCache.get(src);
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error(`No se pudo cargar sprite: ${src}`));
      img.src = src;
    });
    imagePromiseCache.set(src, promise);
    return promise;
  }

  function normalizeMissionContext(context = {}) {
    return {
      rank: context.rank || '',
      index: Number.isFinite(Number(context.index)) ? Number(context.index) : -1,
      name: context.name || '',
      id: context.id || ''
    };
  }

  function buildMissionKeys(context) {
    const normalized = normalizeMissionContext(context);
    const keys = [];
    if (normalized.id) keys.push(normalized.id);
    if (normalized.rank && normalized.index >= 0) keys.push(`${normalized.rank}:${normalized.index}`);
    if (normalized.rank && normalized.name) keys.push(`${normalized.rank}:${normalized.name}`);
    if (normalized.name) keys.push(normalized.name);
    return keys;
  }

  class EnemySpriteRegistry {
    constructor() {
      this.configUrl = DEFAULT_CONFIG_URL;
      this.config = null;
      this.enemiesById = new Map();
      this.missionMap = new Map();
      this.configPromise = null;
    }

    async loadConfig(configUrl = DEFAULT_CONFIG_URL) {
      if (this.config && this.configUrl === configUrl) return this.config;
      if (this.configPromise && this.configUrl === configUrl) return this.configPromise;
      this.configUrl = configUrl;

      this.configPromise = fetch(configUrl)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .catch(() => FALLBACK_CONFIG)
        .then((json) => {
          this.config = json || FALLBACK_CONFIG;
          this.rebuildIndexes();
          return this.config;
        });

      return this.configPromise;
    }

    rebuildIndexes() {
      this.enemiesById.clear();
      this.missionMap.clear();

      (this.config?.enemies || []).forEach((enemy) => {
        if (enemy?.id) this.enemiesById.set(enemy.id, enemy);
      });

      const mapping = this.config?.missionEnemyMap || {};
      Object.entries(mapping).forEach(([missionKey, enemyId]) => {
        this.missionMap.set(missionKey, enemyId);
      });
    }

    resolveEnemyForMission(context = {}) {
      const keys = buildMissionKeys(context);
      for (const key of keys) {
        const enemyId = this.missionMap.get(key);
        if (!enemyId) continue;
        const enemy = this.enemiesById.get(enemyId);
        if (enemy) return enemy;
      }
      return this.enemiesById.get('default-rank-d') || null;
    }

    async preloadForMission(context = {}, onProgress) {
      if (!this.config) {
        await this.loadConfig(this.configUrl);
      }

      const enemy = this.resolveEnemyForMission(context);
      if (!enemy) {
        onProgress?.({ loaded: 0, total: 0, status: 'empty' });
        return { enemy: null, errors: [new Error('No hay enemigo registrado')] };
      }

      const spritePath = enemy?.spriteSheet?.path || enemy?.spritePath || '';
      if (!spritePath) {
        onProgress?.({ loaded: 1, total: 1, status: 'placeholder' });
        return { enemy, errors: [] };
      }

      onProgress?.({ loaded: 0, total: 1, status: 'loading' });
      try {
        await loadImage(spritePath);
        onProgress?.({ loaded: 1, total: 1, status: 'ready' });
        return { enemy, errors: [] };
      } catch (error) {
        onProgress?.({ loaded: 1, total: 1, status: 'error', error });
        return { enemy, errors: [error] };
      }
    }
  }

  window.EnemySpriteRegistry = new EnemySpriteRegistry();
})();
