/**
 * enemy-sprites-manager.js
 * -----------------------------------------------
 * Gestor autocontenido de sprites enemigos por rango y enemyId.
 * - Registro modular por rank/enemyId.
 * - Precarga/caché con Promise + Image.
 * - Fallback por defecto en errores o rutas vacías.
 * - API orientada a integración con misiones y BattleRunner.
 *
 * Integración mínima:
 *   await window.EnemySpritesManager.preloadMissionEnemies('D', ['d_m1'])
 *   const visual = window.EnemySpritesManager.getEnemySprite('D', 'd_m1')
 *   // visual se pasa como enemyVisualConfig a initBattleRangoD
 */
(function () {
  const FALLBACK_KEY = '__fallback__';

  /** @type {Map<string, Map<string, EnemyVisualConfig>>} */
  const registryByRank = new Map();
  /** @type {Map<string, Promise<HTMLImageElement>>} */
  const imagePromiseCache = new Map();
  /** @type {Set<string>} */
  const loadedAssets = new Set();

  /**
   * @typedef {Object} EnemyVisualConfig
   * @property {string} enemyId
   * @property {string} rank
   * @property {string=} displayName
   * @property {{path:string,frameWidth:number,frameHeight:number,frameCount:number,animationFps:number}} spriteSheet
   * @property {{x:number,y:number,width:number,height:number}=} hitbox
   */

  const defaultFallback = {
    enemyId: FALLBACK_KEY,
    rank: 'GLOBAL',
    displayName: 'Fallback Enemy',
    spriteSheet: {
      path: '',
      frameWidth: 64,
      frameHeight: 64,
      frameCount: 1,
      animationFps: 6
    },
    hitbox: { x: 0, y: 0, width: 64, height: 64 }
  };

  /**
   * ⚠️ EDITA AQUÍ las rutas individuales de las 6 misiones de rango D.
   * Puedes reemplazar cada `path` por tus archivos reales PNG/JPG/WebP.
   */
  const DEFAULT_ENEMIES_BY_RANK = {
    D: {
      d_m1: {
        displayName: 'Lobos Hambrientos',
        spriteSheet: { path: 'assets/images/enemies/rank-d/mission-1.png', frameWidth: 136, frameHeight: 136, frameCount: 1, animationFps: 6 },
        hitbox: { x: 0, y: 0, width: 136, height: 136 }
      },
      d_m2: {
        displayName: 'Goblins Saqueadores',
        spriteSheet: { path: 'assets/images/enemies/rank-d/mission-2.png', frameWidth: 136, frameHeight: 136, frameCount: 1, animationFps: 6 },
        hitbox: { x: 0, y: 0, width: 136, height: 136 }
      },
      d_m3: {
        displayName: 'Jabalí Guardián',
        spriteSheet: { path: 'assets/images/enemies/rank-d/mission-3.png', frameWidth: 136, frameHeight: 136, frameCount: 1, animationFps: 6 },
        hitbox: { x: 0, y: 0, width: 136, height: 136 }
      },
      d_m4: {
        displayName: 'Rata Gigante',
        spriteSheet: { path: 'assets/images/enemies/rank-d/mission-4.png', frameWidth: 136, frameHeight: 136, frameCount: 1, animationFps: 6 },
        hitbox: { x: 0, y: 0, width: 136, height: 136 }
      },
      d_m5: {
        displayName: 'Bandido de Escolta',
        spriteSheet: { path: 'assets/images/enemies/rank-d/mission-5.png', frameWidth: 136, frameHeight: 136, frameCount: 1, animationFps: 6 },
        hitbox: { x: 0, y: 0, width: 136, height: 136 }
      },
      d_m6: {
        displayName: 'Bestia Nocturna',
        spriteSheet: { path: 'assets/images/enemies/rank-d/mission-6.png', frameWidth: 136, frameHeight: 136, frameCount: 1, animationFps: 6 },
        hitbox: { x: 0, y: 0, width: 136, height: 136 }
      }
    },
    C: {},
    B: {},
    A: {},
    S: {}
  };

  const missionEnemyMap = {
    D: ['d_m1', 'd_m2', 'd_m3', 'd_m4', 'd_m5', 'd_m6']
  };

  function normalizeRank(rank) {
    return String(rank || '').trim().toUpperCase();
  }

  function getRankBucket(rank, createIfMissing = false) {
    const normalizedRank = normalizeRank(rank);
    if (!normalizedRank) return null;
    if (!registryByRank.has(normalizedRank) && createIfMissing) {
      registryByRank.set(normalizedRank, new Map());
    }
    return registryByRank.get(normalizedRank) || null;
  }

  function cloneVisualConfig(config) {
    return {
      enemyId: config.enemyId,
      rank: config.rank,
      displayName: config.displayName || '',
      spriteSheet: {
        path: config.spriteSheet?.path || '',
        frameWidth: config.spriteSheet?.frameWidth || 64,
        frameHeight: config.spriteSheet?.frameHeight || 64,
        frameCount: Math.max(1, config.spriteSheet?.frameCount || 1),
        animationFps: Math.max(1, config.spriteSheet?.animationFps || 6)
      },
      hitbox: {
        x: config.hitbox?.x || 0,
        y: config.hitbox?.y || 0,
        width: config.hitbox?.width || (config.spriteSheet?.frameWidth || 64),
        height: config.hitbox?.height || (config.spriteSheet?.frameHeight || 64)
      }
    };
  }

  function loadImage(src) {
    if (!src) return Promise.reject(new Error('Ruta de sprite vacía'));
    if (imagePromiseCache.has(src)) return imagePromiseCache.get(src);

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        loadedAssets.add(src);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`No se pudo cargar sprite: ${src}`));
      img.src = src;
    });

    imagePromiseCache.set(src, promise);
    return promise;
  }

  function registerEnemy(rank, enemyId, enemyConfig) {
    const rankBucket = getRankBucket(rank, true);
    const normalizedEnemyId = String(enemyId || '').trim();
    if (!rankBucket || !normalizedEnemyId) return;

    const config = cloneVisualConfig({
      ...enemyConfig,
      enemyId: normalizedEnemyId,
      rank: normalizeRank(rank)
    });

    rankBucket.set(normalizedEnemyId, config);
  }

  function registerBulkByRank(rank, enemiesById = {}) {
    Object.entries(enemiesById).forEach(([enemyId, config]) => {
      registerEnemy(rank, enemyId, config);
    });
  }

  function registerDefaults() {
    registerEnemy('GLOBAL', FALLBACK_KEY, defaultFallback);
    Object.entries(DEFAULT_ENEMIES_BY_RANK).forEach(([rank, enemies]) => {
      registerBulkByRank(rank, enemies);
    });
  }

  function getFallbackSprite() {
    const globalBucket = getRankBucket('GLOBAL', false);
    const fallback = globalBucket?.get(FALLBACK_KEY) || defaultFallback;
    return cloneVisualConfig(fallback);
  }

  /**
   * Devuelve el sprite según rank + enemyId.
   * Si no existe, retorna fallback para no romper el render loop.
   */
  function getEnemySprite(rank, enemyId) {
    const rankBucket = getRankBucket(rank, false);
    const config = rankBucket?.get(String(enemyId || '').trim());
    if (!config) return getFallbackSprite();
    return cloneVisualConfig(config);
  }

  function getEnemyIdForMission(rank, missionIndex) {
    const rankKey = normalizeRank(rank);
    const missionIdx = Number(missionIndex);
    const list = missionEnemyMap[rankKey] || [];
    if (!Number.isInteger(missionIdx) || missionIdx < 0) return null;
    return list[missionIdx] || null;
  }

  async function preloadByEnemyList(rank, enemyIds = [], onProgress) {
    const cleanIds = enemyIds.filter(Boolean);
    if (cleanIds.length === 0) {
      onProgress?.({ loaded: 0, total: 0, status: 'empty' });
      return { loaded: 0, total: 0, errors: [] };
    }

    let loaded = 0;
    const total = cleanIds.length;
    const errors = [];
    onProgress?.({ loaded, total, status: 'loading' });

    for (const enemyId of cleanIds) {
      const config = getEnemySprite(rank, enemyId);
      const path = config.spriteSheet?.path || '';
      try {
        if (path) await loadImage(path);
      } catch (error) {
        errors.push({ rank: normalizeRank(rank), enemyId, error });
      } finally {
        loaded += 1;
        onProgress?.({ loaded, total, status: loaded === total ? 'done' : 'loading' });
      }
    }

    return { loaded, total, errors };
  }

  /**
   * Precarga sprites para una misión concreta (rank + índice).
   * Esto se llama ANTES de crear BattleRunner para evitar flicker.
   */
  async function preloadMissionEnemies(rank, missionIndexesOrEnemyIds, onProgress) {
    const normalizedRank = normalizeRank(rank);
    const inputList = Array.isArray(missionIndexesOrEnemyIds)
      ? missionIndexesOrEnemyIds
      : [missionIndexesOrEnemyIds];

    const enemyIds = inputList
      .map((value) => {
        if (typeof value === 'number' || /^\d+$/.test(String(value))) {
          return getEnemyIdForMission(normalizedRank, Number(value));
        }
        return String(value || '').trim();
      })
      .filter(Boolean);

    return preloadByEnemyList(normalizedRank, enemyIds, onProgress);
  }

  function resolveMissionEnemyVisual(rank, missionIndex) {
    const enemyId = getEnemyIdForMission(rank, missionIndex);
    if (!enemyId) return getFallbackSprite();
    return getEnemySprite(rank, enemyId);
  }

  function clearCache() {
    imagePromiseCache.clear();
    loadedAssets.clear();
  }

  function clearRank(rank) {
    const key = normalizeRank(rank);
    if (!key || key === 'GLOBAL') return;
    registryByRank.delete(key);
  }

  function reloadDefaults() {
    registryByRank.clear();
    clearCache();
    registerDefaults();
  }

  registerDefaults();

  window.EnemySpritesManager = {
    registerEnemy,
    registerBulkByRank,
    getEnemySprite,
    getEnemyIdForMission,
    resolveMissionEnemyVisual,
    preloadByEnemyList,
    preloadMissionEnemies,
    getFallbackSprite,
    clearCache,
    clearRank,
    reloadDefaults,
    debug: {
      registryByRank,
      imagePromiseCache,
      loadedAssets,
      missionEnemyMap
    }
  };
})();
