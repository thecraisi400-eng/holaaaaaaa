(function () {
  const KEEP_AWAKE_KEY = 'ngs_keep_awake_enabled';

  let wakeLock = null;
  let enabled = localStorage.getItem(KEEP_AWAKE_KEY) === '1';

  async function requestWakeLock() {
    if (!enabled || !('wakeLock' in navigator)) return false;
    if (wakeLock) return true;

    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
      });
      return true;
    } catch (error) {
      console.warn('No se pudo activar Screen Wake Lock:', error);
      return false;
    }
  }

  async function releaseWakeLock() {
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
    if (enabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && enabled) {
      requestWakeLock();
    }
  });

  window.NGSWakeLockService = {
    isSupported: () => 'wakeLock' in navigator,
    isEnabled: () => enabled,
    setEnabled,
    request: requestWakeLock,
    release: releaseWakeLock
  };
})();
