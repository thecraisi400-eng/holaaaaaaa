(() => {
  if (window.__ninjaHud?.destroy) {
    window.__ninjaHud.destroy();
  }

  const globalCharacter = window.personajeGlobal || {
    hp: 720,
    hpMax: 1000,
    mp: 290,
    mpMax: 500,
    exp: 4400,
    expMax: 10000,
    gold: 4320,
    atk: 1240,
    def: 880,
    level: 23,
    activeSection: 'heroe',
    heroLevels: { cabeza: 1, pecho: 1, manos: 1, piernas: 1, pies: 1, accesorio: 1 },
    heroStats: {}
  };
  window.personajeGlobal = globalCharacter;

  const state = globalCharacter;

  const sections = {
    heroe: { icon: '🥷', title: 'HÉROE', desc: 'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
    misiones: { icon: '📜', title: 'MISIONES', desc: '' },
    clanes: { icon: '⛩️', title: 'CLANES', desc: 'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
    eventos: { icon: '🎴', title: 'EVENTOS', desc: '¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
    jutsus: { icon: '🌀', title: 'JUTSUS', desc: 'Gestiona tus técnicas ninja. Equipa hasta 4 jutsus activos y mejora sus rangos con sellos de chakra.' },
    batallas: { icon: '⚔️', title: 'BATALLAS', desc: 'Modo PvP y arena de rango. Desafía a otros jugadores y sube en la tabla clasificatoria mundial.' },
    invocaciones: { icon: '✨', title: 'INVOCACIONES', desc: 'Invoca nuevos compañeros y objetos míticos. Utiliza pergaminos de convocación para obtener aliados S-Rank.' },
    habilidades: { icon: '🌿', title: 'ÁRBOL DE HABILIDAD', desc: 'Asigna puntos de habilidad en ramas de Ninjutsu, Taijutsu y Genjutsu para personalizar tu estilo de combate.' },
    ajustes: { icon: '⚙️', title: 'AJUSTES', desc: 'Configura notificaciones, audio, gráficos y tu cuenta de shinobi. También puedes vincular tu aldea.' }
  };

  const labels = {
    heroe: 'HÉROE',
    misiones: 'MISIONES',
    clanes: 'CLANES',
    eventos: 'EVENTOS',
    jutsus: 'JUTSUS',
    batallas: 'BATALLAS',
    invocaciones: 'INVOCAR',
    habilidades: 'ÁRBOL',
    ajustes: 'AJUSTES'
  };

  const refs = {
    nav: document.getElementById('hud-bottom'),
    centerContent: document.getElementById('hud-center-content'),
    overlay: document.getElementById('section-overlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayDesc: document.getElementById('overlayDesc'),
    particleContainer: document.getElementById('particleContainer'),
    hpFill: document.getElementById('hpFill'),
    mpFill: document.getElementById('mpFill'),
    expFill: document.getElementById('expFill'),
    hpCur: document.getElementById('hpCur'),
    hpPct: document.getElementById('hpPct'),
    mpCur: document.getElementById('mpCur'),
    mpPct: document.getElementById('mpPct'),
    expNext: document.getElementById('expNext'),
    statGold: document.getElementById('statGold')
  };

  const controller = new AbortController();
  const { signal } = controller;
  let barsIntervalId = null;
  let activeSectionCleanup = null;

  function updateBars() {
    state.exp = Math.min(state.expMax, state.exp + Math.floor(Math.random() * 28 + 8));
    state.gold += Math.floor(Math.random() * 12 + 3);

    const hpPct = Math.round((state.hp / state.hpMax) * 100);
    const mpPct = Math.round((state.mp / state.mpMax) * 100);
    const expPct = Math.round((state.exp / state.expMax) * 100);

    refs.hpFill.style.width = `${hpPct}%`;
    refs.mpFill.style.width = `${mpPct}%`;
    refs.expFill.style.width = `${expPct}%`;

    refs.hpCur.textContent = state.hp;
    refs.hpPct.textContent = `${hpPct}%`;
    refs.mpCur.textContent = state.mp;
    refs.mpPct.textContent = `${mpPct}%`;
    refs.expNext.textContent = `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
    refs.statGold.textContent = state.gold.toLocaleString();

    if (state.activeSection === 'heroe' && typeof activeSectionCleanup?.refresh === 'function') {
      activeSectionCleanup.refresh();
    }
  }

  function spawnParticles(x, y, type = 'chakra') {
    const count = type === 'smoke' ? 6 : 10;

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('div');
      particle.className = `particle ${type}`;

      const size = type === 'smoke' ? Math.random() * 18 + 10 : Math.random() * 5 + 2;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      particle.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${x - size / 2}px`,
        `top:${y - size / 2}px`,
        `--tx:${tx}px`,
        `--ty:${ty}px`,
        `animation-delay:${Math.random() * 0.1}s`,
        `animation-duration:${Math.random() * 0.4 + 0.5}s`
      ].join(';');

      refs.particleContainer.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    }
  }

  function spawnFloatText(x, y, text, color = '#2ecfcf') {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.cssText = `left:${x - 30}px; top:${y - 20}px; color:${color};`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  function closeOverlay() {
    refs.overlay.classList.remove('visible');
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    spawnParticles(cx, cy, 'amber-spark');
  }

  function setActiveButton(activeBtn) {
    refs.nav.querySelectorAll('.nav-btn.active').forEach((btn) => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  function cleanupCenterSection() {
    if (activeSectionCleanup?.destroy) {
      activeSectionCleanup.destroy();
    }
    activeSectionCleanup = null;
    refs.centerContent.innerHTML = '';
  }

  function renderHeroSection() {
    cleanupCenterSection();
    activeSectionCleanup = createHeroEquipView(refs.centerContent, state);
  }

  function openSection(sectionKey, buttonEl) {
    const info = sections[sectionKey];
    if (!info) return;

    const rect = buttonEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    spawnParticles(cx, cy, 'smoke');
    spawnParticles(cx, cy, 'chakra');
    spawnFloatText(cx, cy, `▶ ${labels[sectionKey] || sectionKey}`, '#e8923a');

    setActiveButton(buttonEl);
    state.activeSection = sectionKey;

    if (sectionKey === 'heroe') {
      closeOverlay();
      renderHeroSection();
      return;
    }

    cleanupCenterSection();
    refs.overlayTitle.textContent = `${info.icon} ${info.title}`;
    refs.overlayDesc.textContent = info.desc;
    refs.overlay.classList.add('visible');
  }

  function handleNavClick(event) {
    const btn = event.target.closest('.nav-btn');
    if (!btn || !refs.nav.contains(btn)) return;

    const { section } = btn.dataset;
    openSection(section, btn);
  }

  function handleOverlayClick(event) {
    if (event.target.id === 'overlayClose' || event.target === refs.overlay) {
      closeOverlay();
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && refs.overlay.classList.contains('visible')) {
      closeOverlay();
    }
  }

  function start() {
    refs.nav.addEventListener('click', handleNavClick, { signal });
    refs.overlay.addEventListener('click', handleOverlayClick, { signal });
    document.addEventListener('keydown', handleKeyDown, { signal });

    updateBars();
    renderHeroSection();
    barsIntervalId = window.setInterval(updateBars, 800);
  }

  function destroy() {
    controller.abort();
    cleanupCenterSection();
    if (barsIntervalId !== null) {
      window.clearInterval(barsIntervalId);
      barsIntervalId = null;
    }
  }

  function createHeroEquipView(container, characterState) {
    const root = document.createElement('div');
    root.className = 'hero-panel-shell';
    root.innerHTML = `
      <div class="panel" id="gamePanel">
        <div class="section-label">── ESTADÍSTICAS ──</div>
        <div class="stats-panel">
          <div class="stats-grid" id="statsGrid"></div>
        </div>
        <div class="section-label">── EQUIPAMIENTO ──</div>
        <div class="equip-grid" id="equipGrid"></div>
        <div class="overlay" id="overlay">
          <div class="upgrade-card" id="upgradeCard"></div>
        </div>
      </div>`;

    container.appendChild(root);

    const localController = new AbortController();
    const timeouts = new Set();

    const EQUIPMENT_DATA = {
      cabeza: {
        name: 'Cabeza', icon: '🪖',
        stats: { HP: 4, MP: 2, RES: 0.5 },
        ranges: [{ from: 1, to: 6, maxCost: 480 }, { from: 6, to: 15, maxCost: 4277 }, { from: 15, to: 30, maxCost: 26000 }, { from: 30, to: 45, maxCost: 57456 }, { from: 45, to: 60, maxCost: 106848 }, { from: 60, to: 75, maxCost: 144000 }]
      },
      pecho: {
        name: 'Pecho', icon: '🛡️',
        stats: { DEF: 1.2, HP: 6, REGEN: 0.08 },
        ranges: [{ from: 1, to: 6, maxCost: 560 }, { from: 6, to: 15, maxCost: 5040 }, { from: 15, to: 30, maxCost: 29600 }, { from: 30, to: 45, maxCost: 63000 }, { from: 45, to: 60, maxCost: 114800 }, { from: 60, to: 75, maxCost: 162000 }]
      },
      manos: {
        name: 'Manos', icon: '🧤',
        stats: { ATK: 0.5, CTR: 0.04, ASPD: 0.02 },
        ranges: [{ from: 1, to: 6, maxCost: 440 }, { from: 6, to: 15, maxCost: 3780 }, { from: 15, to: 30, maxCost: 24000 }, { from: 30, to: 45, maxCost: 53200 }, { from: 45, to: 60, maxCost: 100800 }, { from: 60, to: 75, maxCost: 138000 }]
      },
      piernas: {
        name: 'Piernas', icon: '👖',
        stats: { DEF: 0.8, EVA: 0.02, HP: 5 },
        ranges: [{ from: 1, to: 6, maxCost: 500 }, { from: 6, to: 15, maxCost: 4320 }, { from: 15, to: 30, maxCost: 27200 }, { from: 30, to: 45, maxCost: 58800 }, { from: 45, to: 60, maxCost: 109200 }, { from: 60, to: 75, maxCost: 150000 }]
      },
      pies: {
        name: 'Pies', icon: '👟',
        stats: { VEL: 0.4, EVA: 0.03, ASPD: 0.01 },
        ranges: [{ from: 1, to: 6, maxCost: 420 }, { from: 6, to: 15, maxCost: 3600 }, { from: 15, to: 30, maxCost: 22400 }, { from: 30, to: 45, maxCost: 49000 }, { from: 45, to: 60, maxCost: 95200 }, { from: 60, to: 75, maxCost: 132000 }]
      },
      accesorio: {
        name: 'Accesorio', icon: '💍',
        stats: { MP: 5, CDMG: 0.1, CTR: 0.05 },
        ranges: [{ from: 1, to: 6, maxCost: 600 }, { from: 6, to: 15, maxCost: 5760 }, { from: 15, to: 30, maxCost: 32000 }, { from: 30, to: 45, maxCost: 70000 }, { from: 45, to: 60, maxCost: 133000 }, { from: 60, to: 75, maxCost: 180000 }]
      }
    };
    const SLOT_ORDER = ['cabeza', 'pecho', 'manos', 'piernas', 'pies', 'accesorio'];
    const player = {
      get gold() { return characterState.gold; },
      set gold(v) { characterState.gold = v; },
      levels: characterState.heroLevels
    };
    const BASE_STATS = { HP: 100, MP: 50, ATK: 10, DEF: 5.0, VEL: 10.0, CTR: 5.0, EVA: 3.0, RES: 2.0, REGEN: 1.0, ASPD: 1.0, CDMG: 150.0 };
    const STAT_META = [
      { key: 'HP', icon: '❤️', label: 'HP', pct: false }, { key: 'MP', icon: '💧', label: 'MP', pct: false }, { key: 'ATK', icon: '⚔️', label: 'ATK', pct: false }, { key: 'DEF', icon: '🛡️', label: 'DEF', pct: false },
      { key: 'VEL', icon: '⚡', label: 'VEL', pct: false }, { key: 'CTR', icon: '🎯', label: 'CTR', pct: true }, { key: 'EVA', icon: '💨', label: 'EVA', pct: true }, { key: 'RES', icon: '🔰', label: 'RES', pct: true },
      { key: 'REGEN', icon: '🌿', label: 'REGEN', pct: true }, { key: 'ASPD', icon: '🌀', label: 'ASPD', pct: false, dec: 2 }, { key: 'CDMG', icon: '💥', label: 'CDMG', pct: true },
      { key: 'DUMMY', icon: '?', label: '?', pct: false, dummy: true }
    ];

    function getUpgradeCost(equipKey, currentLevel) {
      const ranges = EQUIPMENT_DATA[equipKey].ranges;
      const maxLv = ranges[ranges.length - 1].to;
      if (currentLevel >= maxLv) return null;
      for (let i = 0; i < ranges.length; i += 1) {
        const r = ranges[i];
        if (currentLevel >= r.from && currentLevel < r.to) {
          const prevMax = i === 0 ? 0 : ranges[i - 1].maxCost;
          const n = r.to - r.from;
          const pos = currentLevel - r.from + 1;
          return Math.round(prevMax + (r.maxCost - prevMax) * pos / n);
        }
      }
      return null;
    }

    function rankClass(level) {
      if (level >= 60) return 'rank-red';
      if (level >= 45) return 'rank-yellow';
      if (level >= 30) return 'rank-purple';
      if (level >= 15) return 'rank-blue';
      if (level >= 6) return 'rank-green';
      return 'rank-gray';
    }

    function rankName(level) {
      if (level >= 60) return { label: 'LEGENDARIO', bg: '#7f1d1d', color: '#f87171' };
      if (level >= 45) return { label: 'ÉPICO', bg: '#713f12', color: '#fbbf24' };
      if (level >= 30) return { label: 'RARO', bg: '#3b0764', color: '#c084fc' };
      if (level >= 15) return { label: 'AVANZADO', bg: '#1e3a8a', color: '#60a5fa' };
      if (level >= 6) return { label: 'MEJORADO', bg: '#14532d', color: '#4ade80' };
      return { label: 'BÁSICO', bg: '#1f2937', color: '#9ca3af' };
    }

    function fmtStat(meta, val) {
      if (meta.pct) return `${val.toFixed(2)}%`;
      if (meta.dec) return val.toFixed(meta.dec);
      return Number.isInteger(val) ? val : parseFloat(val.toFixed(1));
    }

    function fmtGain(key, amount) {
      const pctKeys = ['CTR', 'EVA', 'RES', 'REGEN', 'CDMG'];
      if (pctKeys.includes(key)) return `+${amount.toFixed(2)}%`;
      if (key === 'ASPD') return `+${amount.toFixed(2)}`;
      return `+${amount}`;
    }

    function fmtNum(n) { return n.toLocaleString('es-ES'); }

    function computeStats() {
      const stats = { ...BASE_STATS };
      for (const key of SLOT_ORDER) {
        const lvl = player.levels[key];
        const gains = lvl - 1;
        if (gains <= 0) continue;
        for (const [stat, amount] of Object.entries(EQUIPMENT_DATA[key].stats)) {
          stats[stat] = (stats[stat] || 0) + amount * gains;
        }
      }
      characterState.heroStats = stats;
      return stats;
    }

    function renderStats() {
      const grid = root.querySelector('#statsGrid');
      const stats = computeStats();
      grid.innerHTML = '';
      for (const meta of STAT_META) {
        const chip = document.createElement('div');
        chip.className = 'stat-chip';
        if (meta.dummy) {
          chip.innerHTML = `<span class="stat-icon">${meta.icon}</span><span class="stat-lbl">${meta.label}</span><span class="stat-val">--</span>`;
        } else {
          const val = stats[meta.key];
          chip.innerHTML = `<span class="stat-icon">${meta.icon}</span><span class="stat-lbl">${meta.label}</span><span class="stat-val">${fmtStat(meta, val)}</span>`;
        }
        grid.appendChild(chip);
      }
    }

    function renderEquipment() {
      const grid = root.querySelector('#equipGrid');
      grid.innerHTML = '';
      for (const key of SLOT_ORDER) {
        const data = EQUIPMENT_DATA[key];
        const lvl = player.levels[key];
        const rc = rankClass(lvl);
        const slot = document.createElement('div');
        slot.className = `slot ${rc}`;
        slot.id = `slot-${key}`;
        slot.innerHTML = `<span class="slot-icon">${data.icon}</span><span class="slot-name">${data.name}</span><span class="slot-lvl">Nv. ${lvl}</span>`;
        slot.addEventListener('click', () => openUpgrade(key), { signal: localController.signal });
        grid.appendChild(slot);
      }
    }

    let currentUpgradeKey = null;

    function openUpgrade(key) {
      currentUpgradeKey = key;
      renderUpgradeCard(key);
      root.querySelector('#overlay').classList.add('active');
    }

    function closeUpgrade() {
      root.querySelector('#overlay').classList.remove('active');
      currentUpgradeKey = null;
    }

    root.querySelector('#overlay').addEventListener('click', function onOverlayClick(e) {
      if (e.target === this) closeUpgrade();
    }, { signal: localController.signal });

    function renderUpgradeCard(key) {
      const data = EQUIPMENT_DATA[key];
      const lvl = player.levels[key];
      const cost = getUpgradeCost(key, lvl);
      const isMax = cost === null;
      const canBuy = !isMax && player.gold >= cost;
      const rk = rankName(lvl);
      const rkNext = rankName(lvl + 1);
      const card = root.querySelector('#upgradeCard');
      card.style.borderColor = `${rk.color}40`;

      let content = `<span class="uc-close" id="ucClose">✕</span><div class="uc-header"><span class="uc-icon">${data.icon}</span><div class="uc-head-info"><div class="uc-name">${data.name}</div><span class="uc-rank-badge" style="background:${rk.bg};color:${rk.color}">${rk.label}</span></div></div><div class="uc-level-row"><div class="uc-lvl-block"><div class="uc-lvl-lbl">Nivel actual</div><div class="uc-lvl-num cur-num">${lvl}</div></div><span class="uc-arrow">→</span><div class="uc-lvl-block"><div class="uc-lvl-lbl">Próximo nivel</div><div class="uc-lvl-num nxt-num" style="color:${isMax ? '#f0a500' : rkNext.color}">${isMax ? 'MAX' : lvl + 1}</div></div></div>`;

      if (isMax) {
        content += '<div class="uc-max-msg">⭐ ¡Nivel Máximo alcanzado! ⭐</div>';
      } else {
        content += '<div class="uc-stats-label">✦ Estadísticas por mejora</div><div class="uc-stats">';
        for (const [stat, amount] of Object.entries(data.stats)) {
          const meta = STAT_META.find((m) => m.key === stat);
          const icon = meta ? meta.icon : '';
          content += `<div class="uc-stat-row"><span class="uc-stat-name">${icon} ${stat}</span><span class="uc-stat-gain">${fmtGain(stat, amount)}</span></div>`;
        }
        content += `</div><div class="uc-cost-row"><div class="uc-cost-left"><div class="uc-cost-lbl">Costo de mejora</div><div class="uc-cost-val">🪙 ${fmtNum(cost)}</div></div><div class="uc-have-row"><div class="uc-have-lbl">Tu oro</div><div class="uc-have-val ${canBuy ? 'enough' : 'not-enough'}">${fmtNum(player.gold)}</div></div></div><button class="uc-btn ${canBuy ? 'can-upgrade' : 'cant-upgrade'}" id="ucUpgradeBtn">${canBuy ? '⬆ MEJORAR' : '❌ Oro insuficiente'}</button>`;
      }

      card.innerHTML = content;
      card.querySelector('#ucClose').addEventListener('click', closeUpgrade, { signal: localController.signal });
      if (!isMax) {
        const btn = card.querySelector('#ucUpgradeBtn');
        if (canBuy) btn.addEventListener('click', () => doUpgrade(key), { signal: localController.signal });
      }
    }

    function doUpgrade(key) {
      const lvl = player.levels[key];
      const cost = getUpgradeCost(key, lvl);
      if (cost === null || player.gold < cost) return;
      player.gold -= cost;
      player.levels[key] += 1;

      renderStats();
      refs.statGold.textContent = characterState.gold.toLocaleString();

      const slotEl = root.querySelector(`#slot-${key}`);
      if (slotEl) {
        const data = EQUIPMENT_DATA[key];
        const newLvl = player.levels[key];
        const rc = rankClass(newLvl);
        slotEl.className = `slot ${rc}`;
        slotEl.innerHTML = `<span class="slot-icon">${data.icon}</span><span class="slot-name">${data.name}</span><span class="slot-lvl">Nv. ${newLvl}</span>`;
        slotEl.addEventListener('click', () => openUpgrade(key), { signal: localController.signal });
        slotEl.classList.add('flash');
        const timeoutId = setTimeout(() => {
          slotEl.classList.remove('flash');
          timeouts.delete(timeoutId);
        }, 600);
        timeouts.add(timeoutId);
      }

      renderUpgradeCard(key);
    }

    function init() {
      renderStats();
      renderEquipment();
    }

    init();

    return {
      refresh: renderStats,
      destroy() {
        localController.abort();
        timeouts.forEach((id) => clearTimeout(id));
        timeouts.clear();
        root.remove();
      }
    };
  }

  window.__ninjaHud = { destroy };
  start();
})();
