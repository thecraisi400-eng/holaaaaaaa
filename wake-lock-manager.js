(function () {
  const WakeLockManager = {
    sentinel: null,
    fallbackVideo: null,
    enabled: false,

    async acquire() {
      if (this.enabled) return;
      this.enabled = true;

      if ('wakeLock' in navigator && navigator.wakeLock?.request) {
        try {
          this.sentinel = await navigator.wakeLock.request('screen');
          this.sentinel.addEventListener('release', () => {
            this.sentinel = null;
            if (this.enabled && document.visibilityState === 'visible') {
              this.acquire();
            }
          });
          return;
        } catch (error) {
          console.warn('[WakeLock] No se pudo adquirir wake lock nativo, usando fallback.', error);
        }
      }

      this.enableFallback();
    },

    async release() {
      this.enabled = false;
      if (this.sentinel) {
        try {
          await this.sentinel.release();
        } catch (error) {
          console.warn('[WakeLock] Error liberando wake lock.', error);
        }
      }
      this.sentinel = null;
      this.disableFallback();
    },

    enableFallback() {
      if (this.fallbackVideo) return;
      const video = document.createElement('video');
      video.setAttribute('playsinline', 'true');
      video.setAttribute('muted', 'true');
      video.muted = true;
      video.loop = true;
      video.style.position = 'fixed';
      video.style.width = '1px';
      video.style.height = '1px';
      video.style.opacity = '0.0001';
      video.style.pointerEvents = 'none';
      video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAIG1kYXQhEAUgpAAAAAB1bWRhdGEAAAAB';
      document.body.appendChild(video);
      video.play().catch(() => {
        /* fallback best effort */
      });
      this.fallbackVideo = video;
    },

    disableFallback() {
      if (!this.fallbackVideo) return;
      this.fallbackVideo.pause();
      this.fallbackVideo.remove();
      this.fallbackVideo = null;
    },

    bindLifecycle() {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.enabled) {
          this.acquire();
        }
        if (document.visibilityState === 'hidden') {
          this.release();
        }
      });

      window.addEventListener('ngs:game-entered', () => this.acquire());
      window.addEventListener('ngs:resume', () => this.acquire());
      window.addEventListener('focus', () => {
        if (this.enabled) this.acquire();
      });

      window.addEventListener('ngs:pause', () => this.release());
      window.addEventListener('ngs:game-over', () => this.release());
      window.addEventListener('blur', () => this.release());
      window.addEventListener('pagehide', () => this.release());
    }
  };

  WakeLockManager.bindLifecycle();
  window.WakeLockManager = WakeLockManager;
})();
