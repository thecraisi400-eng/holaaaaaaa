const HERO_STORAGE_KEY = 'hero_stats';
const HERO_BACKUP_KEY = 'hero_stats_backup';

export function initHeroSystem({
  triggerSelector,
  getStats,
  setStats,
  onOpen,
  onClose,
}) {
  const screen = document.getElementById('hero-screen');
  const trigger = document.querySelector(triggerSelector);
  const levelInput = document.getElementById('hero-level');
  const xpInput = document.getElementById('hero-xp');
  const saveBtn = document.getElementById('hero-save');
  const cancelBtn = document.getElementById('hero-cancel');
  const closeBtn = document.getElementById('hero-close');
  const panel = screen?.querySelector('.hero-panel');

  if (!screen || !trigger || !levelInput || !xpInput || !saveBtn || !cancelBtn || !closeBtn || !panel) {
    return { open: () => {}, close: () => {} };
  }

  if (screen.dataset.heroInitialized === 'true') {
    return { open: () => {}, close: () => {} };
  }
  screen.dataset.heroInitialized = 'true';

  const coerceNumber = (value, fallback = 0) => {
    const parsed = Number.parseInt(Number(value), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const hydrateForm = () => {
    const runtimeStats = getStats();
    const savedStats = JSON.parse(localStorage.getItem(HERO_STORAGE_KEY) || 'null');
    const merged = {
      level: coerceNumber(savedStats?.level, runtimeStats.level),
      xp: coerceNumber(savedStats?.xp, runtimeStats.xp),
    };
    levelInput.value = String(merged.level);
    xpInput.value = String(merged.xp);
    setStats(merged);
  };

  const open = () => {
    hydrateForm(); // regla 1: hidratar antes de mostrar
    sessionStorage.setItem(HERO_BACKUP_KEY, JSON.stringify(getStats())); // regla 5
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    onOpen();
  };

  const close = () => {
    screen.classList.remove('is-open');
    screen.setAttribute('aria-hidden', 'true');
    onClose();
  };

  trigger.addEventListener('click', open);

  panel.addEventListener('click', (event) => {
    event.stopPropagation(); // regla 6
  });

  closeBtn.addEventListener('click', close);

  cancelBtn.addEventListener('click', () => {
    const backupRaw = sessionStorage.getItem(HERO_BACKUP_KEY);
    if (backupRaw) {
      const backup = JSON.parse(backupRaw);
      setStats({
        level: coerceNumber(backup.level, 1),
        xp: coerceNumber(backup.xp, 0),
      });
      hydrateForm();
    }
    close();
  });

  saveBtn.addEventListener('click', () => {
    const next = {
      level: coerceNumber(levelInput.value, 1),
      xp: coerceNumber(xpInput.value, 0),
    };
    setStats(next);
    localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(next));
    close();
  });

  screen.addEventListener('click', (event) => {
    if (event.target === screen || event.target.classList.contains('hero-backdrop')) {
      close();
    }
  });

  return { open, close };
}
