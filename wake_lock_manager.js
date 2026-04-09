(function () {
  let wakeLock = null;
  let fallbackVideo = null;
  let active = false;

  async function requestWakeLock() {
    if (!active) return;

    if ('wakeLock' in navigator && navigator.wakeLock?.request) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
          if (active && document.visibilityState === 'visible') {
            requestWakeLock();
          }
        });
        return;
      } catch (error) {
        console.warn('[WakeLock] Error usando Wake Lock API, aplicando fallback.', error);
      }
    }

    applyFallback();
  }

  function applyFallback() {
    if (fallbackVideo) return;
    const video = document.createElement('video');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('muted', 'true');
    video.muted = true;
    video.loop = true;
    video.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;left:-9999px;top:-9999px;';
    video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb20AAAAGbWRhdAAAAA==';
    document.body.appendChild(video);

    video.play().catch(() => {});
    fallbackVideo = video;
  }

  function clearFallback() {
    if (!fallbackVideo) return;
    fallbackVideo.pause();
    fallbackVideo.removeAttribute('src');
    fallbackVideo.load();
    fallbackVideo.remove();
    fallbackVideo = null;
  }

  async function acquire(context = 'manual') {
    active = true;
    if (document.visibilityState !== 'visible') return;
    await requestWakeLock();
    window.dispatchEvent(new CustomEvent('ngs:wake-lock', { detail: { active: true, context } }));
  }

  async function release(context = 'manual') {
    active = false;
    if (wakeLock) {
      try {
        await wakeLock.release();
      } catch (error) {
        console.warn('[WakeLock] Error liberando lock', error);
      }
      wakeLock = null;
    }
    clearFallback();
    window.dispatchEvent(new CustomEvent('ngs:wake-lock', { detail: { active: false, context } }));
  }

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && active) {
      await requestWakeLock();
      return;
    }
    if (document.visibilityState === 'hidden') {
      if (wakeLock) {
        try {
          await wakeLock.release();
        } catch (error) {
          console.warn('[WakeLock] Error liberando en background', error);
        }
        wakeLock = null;
      }
      clearFallback();
    }
  });

  window.addEventListener('ngs:resume', () => acquire('resume-event'));
  window.addEventListener('ngs:pause', () => release('pause-event'));
  window.addEventListener('ngs:game-entered', () => acquire('game-entered'));
  window.addEventListener('ngs:game-over', () => release('game-over'));

  window.WakeLockManager = {
    acquire,
    release,
    isActive: () => active
  };
})();
