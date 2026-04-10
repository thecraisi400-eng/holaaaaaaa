(function () {
  const KEEP_AWAKE_KEY = 'ngs_keep_awake_enabled';

  let wakeLock = null;
  let enabled = localStorage.getItem(KEEP_AWAKE_KEY) === '1';
  let gameplayActive = false;
  let reacquireTimerId = null;
  const REACQUIRE_DELAY_MS = 800;

  function clearReacquireTimer() {
    if (!reacquireTimerId) return;
    clearTimeout(reacquireTimerId);
    reacquireTimerId = null;
  }

  function shouldKeepAwake() {
    return enabled && gameplayActive && document.visibilityState === 'visible';
  }

  function scheduleReacquire() {
    if (!shouldKeepAwake() || reacquireTimerId) return;
    reacquireTimerId = setTimeout(() => {
      reacquireTimerId = null;
      requestWakeLock();
    }, REACQUIRE_DELAY_MS);
  }

  async function requestWakeLock() {
    if (!shouldKeepAwake() || !('wakeLock' in navigator)) return false;
    if (wakeLock) return true;

    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
        scheduleReacquire();
      });
      clearReacquireTimer();
      return true;
    } catch (error) {
      console.warn('No se pudo activar Screen Wake Lock:', error);
      scheduleReacquire();
      return false;
    }
  }

  async function releaseWakeLock() {
    clearReacquireTimer();
    if (!wakeLock) return;
    try {
      await wakeLock.release();
    } catch (_) {
      // noop
    } finally {
      wakeLock = null;
    }
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);
    localStorage.setItem(KEEP_AWAKE_KEY, enabled ? '1' : '0');
    if (enabled && gameplayActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }

  function setGameplayActive(nextGameplayActive) {
    gameplayActive = Boolean(nextGameplayActive);
    if (shouldKeepAwake()) {
      requestWakeLock();
      return;
    }
    releaseWakeLock();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && enabled && gameplayActive) {
      requestWakeLock();
      return;
    }
    releaseWakeLock();
  });

  window.addEventListener('focus', () => {
    if (!shouldKeepAwake()) return;
    requestWakeLock();
  });

  window.NGSWakeLockService = {
    isSupported: () => 'wakeLock' in navigator,
    isEnabled: () => enabled,
    isGameplayActive: () => gameplayActive,
    setEnabled,
    setGameplayActive,
    request: requestWakeLock,
    release: releaseWakeLock
  };
})();
