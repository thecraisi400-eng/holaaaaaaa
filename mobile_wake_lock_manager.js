(function () {
  const WakeLockManager = {
    sentinel: null,
    enabled: true,
    hasNativeSupport: 'wakeLock' in navigator,
    fallbackAudioContext: null,
    fallbackOscillator: null,

    async acquire(reason = 'resume') {
      if (!this.enabled || document.visibilityState !== 'visible') return false;

      if (this.hasNativeSupport) {
        try {
          this.sentinel = await navigator.wakeLock.request('screen');
          this.sentinel.addEventListener('release', () => {
            this.sentinel = null;
            if (this.enabled && document.visibilityState === 'visible') {
              this.acquire('system-release');
            }
          });
          return true;
        } catch (error) {
          console.warn('[WakeLockManager] WakeLock nativo falló, usando fallback.', reason, error);
        }
      }

      return this.acquireFallback(reason);
    },

    async release(reason = 'pause') {
      if (this.sentinel) {
        try {
          await this.sentinel.release();
        } catch (error) {
          console.warn('[WakeLockManager] Error liberando wake lock.', reason, error);
        }
      }
      this.sentinel = null;
      this.releaseFallback();
    },

    async acquireFallback() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;

        if (!this.fallbackAudioContext) {
          this.fallbackAudioContext = new AudioCtx();
          this.fallbackOscillator = this.fallbackAudioContext.createOscillator();
          const gain = this.fallbackAudioContext.createGain();
          gain.gain.value = 0.00001;
          this.fallbackOscillator.connect(gain);
          gain.connect(this.fallbackAudioContext.destination);
          this.fallbackOscillator.start();
        }

        if (this.fallbackAudioContext.state === 'suspended') {
          await this.fallbackAudioContext.resume();
        }
        return true;
      } catch (error) {
        console.warn('[WakeLockManager] Fallback de wake lock no disponible.', error);
        return false;
      }
    },

    releaseFallback() {
      if (!this.fallbackAudioContext) return;
      if (this.fallbackAudioContext.state === 'running') {
        this.fallbackAudioContext.suspend().catch(() => {});
      }
    },

    bindLifecycle() {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.acquire('visibility-visible');
        } else {
          this.release('visibility-hidden');
        }
      });

      window.addEventListener('focus', () => this.acquire('window-focus'));
      window.addEventListener('blur', () => this.release('window-blur'));

      window.addEventListener('ngs:game-entered', () => this.acquire('game-entered'));
      window.addEventListener('ngs:game-resumed', () => this.acquire('game-resumed'));
      window.addEventListener('ngs:game-paused', () => this.release('game-paused'));
      window.addEventListener('ngs:game-over', () => this.release('game-over'));
    },

    init() {
      this.bindLifecycle();
    }
  };

  WakeLockManager.init();
  window.WakeLockManager = WakeLockManager;
})();
