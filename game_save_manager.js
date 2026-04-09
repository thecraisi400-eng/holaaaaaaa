(function () {
  const SAVE_NAMESPACE = 'ngs_';
  const MAIN_SAVE_KEY = `${SAVE_NAMESPACE}full_game_save_v2`;
  const LEGACY_SAVE_KEY = 'ngs_rpg_save_data';

  const state = {
    wakeLockSentinel: null,
    fallbackIntervalId: null,
    fallbackVideo: null,
    gameActive: false,
    initialized: false
  };

  function safeParse(json) {
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  function collectSaveData() {
    const gameState = window.GameState && typeof window.GameState.getState === 'function'
      ? window.GameState.getState()
      : null;
    const heroSnapshot = window.HeroSystem && typeof window.HeroSystem.getHeroSnapshot === 'function'
      ? window.HeroSystem.getHeroSnapshot()
      : null;
    const heroSystemState = window.HeroSystem && typeof window.HeroSystem.exportPersistentState === 'function'
      ? window.HeroSystem.exportPersistentState()
      : null;
    const missionState = window.MissionSystem && typeof window.MissionSystem.exportPersistentState === 'function'
      ? window.MissionSystem.exportPersistentState()
      : null;

    const baseSave = safeParse(localStorage.getItem(LEGACY_SAVE_KEY)) || {};
    const activeCharacter = heroSnapshot || baseSave;

    const saveData = {
      ...baseSave,
      characterId: activeCharacter.characterId || baseSave.characterId || '',
      character: activeCharacter.name || baseSave.character || '',
      clan: activeCharacter.clanId || baseSave.clan || '',
      clanName: activeCharacter.clanName || baseSave.clanName || '',
      level: activeCharacter.level || gameState?.level || baseSave.level || 1,
      rank: activeCharacter.rank || gameState?.rank || baseSave.rank || 'GENIN',
      exp: activeCharacter.exp || gameState?.exp || baseSave.exp || 0,
      characterSprite: gameState?.characterVisual?.spriteSrc || baseSave.characterSprite || '',
      timestamp: Date.now()
    };

    return {
      version: 2,
      timestamp: Date.now(),
      saveData,
      gameState,
      heroSnapshot,
      heroSystemState,
      missionState
    };
  }

  function persistSave(payload) {
    if (!payload) return null;
    localStorage.setItem(MAIN_SAVE_KEY, JSON.stringify(payload));
    localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(payload.saveData));
    window.dispatchEvent(new CustomEvent('ngs:save-updated', { detail: { payload } }));
    return payload;
  }

  function saveNow(reason = 'manual') {
    const payload = collectSaveData();
    if (!payload) return null;
    const persisted = persistSave(payload);
    window.dispatchEvent(new CustomEvent('ngs:autosave', { detail: { reason, timestamp: persisted.timestamp } }));
    return persisted;
  }

  function hasSave() {
    return Boolean(localStorage.getItem(MAIN_SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY));
  }

  function getSavePreview() {
    const payload = safeParse(localStorage.getItem(MAIN_SAVE_KEY));
    if (payload?.saveData) return payload.saveData;
    return safeParse(localStorage.getItem(LEGACY_SAVE_KEY));
  }

  function applyLoadedState(payload) {
    if (!payload) return null;
    if (window.HeroSystem && typeof window.HeroSystem.importPersistentState === 'function') {
      window.HeroSystem.importPersistentState(payload.heroSystemState || null);
    }
    if (window.MissionSystem && typeof window.MissionSystem.importPersistentState === 'function') {
      window.MissionSystem.importPersistentState(payload.missionState || null);
    }

    window.dispatchEvent(new CustomEvent('ngs:save-loaded', { detail: payload }));
    return payload.saveData || null;
  }

  function loadGame() {
    const payload = safeParse(localStorage.getItem(MAIN_SAVE_KEY));
    if (payload) {
      const saveData = applyLoadedState(payload);
      return { payload, saveData };
    }

    const legacySaveData = safeParse(localStorage.getItem(LEGACY_SAVE_KEY));
    if (!legacySaveData) return null;

    const migratedPayload = persistSave({
      version: 2,
      timestamp: Date.now(),
      saveData: legacySaveData,
      gameState: null,
      heroSnapshot: null,
      heroSystemState: null,
      missionState: null
    });

    applyLoadedState(migratedPayload);
    return { payload: migratedPayload, saveData: legacySaveData };
  }

  function clearAll() {
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key === LEGACY_SAVE_KEY || key.startsWith(SAVE_NAMESPACE)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => localStorage.removeItem(key));
    window.dispatchEvent(new CustomEvent('ngs:save-cleared'));
  }

  async function acquireWakeLock() {
    if (!state.gameActive || document.hidden) return;

    try {
      if ('wakeLock' in navigator && navigator.wakeLock?.request) {
        state.wakeLockSentinel = await navigator.wakeLock.request('screen');
        state.wakeLockSentinel.addEventListener('release', () => {
          state.wakeLockSentinel = null;
          if (state.gameActive && !document.hidden) {
            acquireWakeLock();
          }
        });
        return;
      }
    } catch (error) {
      state.wakeLockSentinel = null;
    }

    startFallbackWakeLock();
  }

  function createSilentVideoFallback() {
    if (state.fallbackVideo) return state.fallbackVideo;
    const video = document.createElement('video');
    video.setAttribute('muted', 'true');
    video.muted = true;
    video.setAttribute('playsinline', 'true');
    video.playsInline = true;
    video.setAttribute('loop', 'true');
    video.loop = true;
    video.style.position = 'fixed';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    video.style.left = '-9999px';
    video.src =
      'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAGG1kYXQhEAUgpGkAAAMAAQAAAwAABExuZGF0YQ==';
    document.body.appendChild(video);
    state.fallbackVideo = video;
    return video;
  }

  function startFallbackWakeLock() {
    if (state.fallbackIntervalId) return;

    const video = createSilentVideoFallback();
    const keepAlive = () => {
      if (!state.gameActive || document.hidden) return;
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      }
    };

    keepAlive();
    state.fallbackIntervalId = window.setInterval(keepAlive, 15000);
  }

  function releaseWakeLock() {
    if (state.wakeLockSentinel) {
      state.wakeLockSentinel.release().catch(() => {});
      state.wakeLockSentinel = null;
    }

    if (state.fallbackIntervalId) {
      clearInterval(state.fallbackIntervalId);
      state.fallbackIntervalId = null;
    }

    if (state.fallbackVideo) {
      state.fallbackVideo.pause();
    }
  }

  function setGameActive(isActive) {
    state.gameActive = Boolean(isActive);
    if (!state.gameActive) {
      releaseWakeLock();
      return;
    }
    acquireWakeLock();
  }

  function bindAutosaveListeners() {
    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target.closest('button, .nav-btn, [data-section], [role="button"]') : null;
      if (!target) return;
      saveNow('ui-click');
    }, true);

    window.addEventListener('ngs:state-updated', () => saveNow('state-updated'));
    window.addEventListener('ngs:hero-stats-updated', () => saveNow('hero-stats-updated'));
    window.addEventListener('beforeunload', () => saveNow('beforeunload'));
  }

  function bindWakeLockLifecycle() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        releaseWakeLock();
        return;
      }
      if (state.gameActive) acquireWakeLock();
    });

    window.addEventListener('focus', () => {
      if (state.gameActive && !document.hidden) acquireWakeLock();
    });

    window.addEventListener('blur', () => {
      releaseWakeLock();
    });

    window.addEventListener('pagehide', () => {
      releaseWakeLock();
    });

    window.addEventListener('pageshow', () => {
      if (state.gameActive && !document.hidden) acquireWakeLock();
    });

    window.addEventListener('ngs:game-entered', () => setGameActive(true));
    window.addEventListener('ngs:game-paused', () => setGameActive(false));
    window.addEventListener('ngs:game-over', () => setGameActive(false));
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    bindAutosaveListeners();
    bindWakeLockLifecycle();
  }

  window.GameSaveManager = {
    init,
    saveNow,
    loadGame,
    clearAll,
    hasSave,
    getSavePreview,
    setGameActive,
    keys: {
      MAIN_SAVE_KEY,
      LEGACY_SAVE_KEY,
      SAVE_NAMESPACE
    }
  };

  init();
})();
