(() => {
  const logic = window.equipLogic;
  let currentState = null;
  let currentUpgradeKey = null;

  function getElements() {
    return {
      panel: document.getElementById('heroPanel'),
      statGold: document.getElementById('statGold'),
      statAtk: document.getElementById('statAtk'),
      statDef: document.getElementById('statDef'),
    };
  }

  function buildLayout() {
    const { panel } = getElements();
    if (!panel || panel.dataset.ready === 'true') return;

    panel.innerHTML = `
      <div class="hero-center-shell">
        <div class="hero-panel" id="heroPanelContent">
          <div class="hero-top-bar">
            <span class="hero-title-text">⚡ SHINOBI</span>
            <span class="hero-gold-text">🪙 <span id="heroGoldDisplay">0</span></span>
          </div>

          <div class="hero-section-label">── ESTADÍSTICAS ──</div>
          <div class="hero-stats-panel">
            <div class="hero-stats-grid" id="heroStatsGrid"></div>
          </div>

          <div class="hero-section-label">── EQUIPAMIENTO ──</div>
          <div class="hero-equip-grid" id="heroEquipGrid"></div>

          <div class="hero-overlay" id="heroOverlay">
            <div class="hero-upgrade-card" id="heroUpgradeCard"></div>
          </div>
        </div>
      </div>
    `;
    panel.dataset.ready = 'true';

    const overlay = document.getElementById('heroOverlay');
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeUpgrade();
      }
    });
  }

  function renderStats() {
    const grid = document.getElementById('heroStatsGrid');
    if (!grid || !currentState) return;

    const levels = logic.ensureEquipmentState(currentState);
    const stats = logic.computeStats(levels);
    grid.innerHTML = '';

    logic.statMeta.forEach((meta) => {
      const chip = document.createElement('div');
      chip.className = 'hero-stat-chip';
      chip.innerHTML = meta.dummy
        ? `
          <span class="hero-stat-icon">${meta.icon}</span>
          <span class="hero-stat-lbl">${meta.label}</span>
          <span class="hero-stat-val">?</span>
        `
        : `
          <span class="hero-stat-icon">${meta.icon}</span>
          <span class="hero-stat-lbl">${meta.label}</span>
          <span class="hero-stat-val">${logic.formatStat(meta, stats[meta.key])}</span>
        `;
      grid.appendChild(chip);
    });
  }

  function renderEquipment() {
    const grid = document.getElementById('heroEquipGrid');
    if (!grid || !currentState) return;

    const levels = logic.ensureEquipmentState(currentState);
    grid.innerHTML = '';

    logic.slotOrder.forEach((key) => {
      const equip = logic.equipment[key];
      const level = levels[key];
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = `hero-slot ${logic.rankClass(level)}`;
      slot.id = `hero-slot-${key}`;
      slot.innerHTML = `
        <span class="hero-slot-icon">${equip.icon}</span>
        <span class="hero-slot-name">${equip.name}</span>
        <span class="hero-slot-lvl">Nv. ${level}</span>
      `;
      slot.addEventListener('click', () => openUpgrade(key));
      grid.appendChild(slot);
    });
  }

  function renderGold(pulse = false) {
    const heroGold = document.getElementById('heroGoldDisplay');
    if (!heroGold || !currentState) return;

    heroGold.textContent = logic.formatNumber(currentState.gold);
    if (pulse) {
      heroGold.classList.remove('hero-gold-pulse');
      void heroGold.offsetWidth;
      heroGold.classList.add('hero-gold-pulse');
    }
  }

  function syncTopSummary() {
    if (!currentState) return;

    const levels = logic.ensureEquipmentState(currentState);
    const { statGold, statAtk, statDef } = getElements();
    const summary = logic.getSummaryStats(levels, currentState);

    if (statGold) statGold.textContent = currentState.gold.toLocaleString('es-ES');
    if (statAtk) statAtk.textContent = summary.atk.toLocaleString('es-ES');
    if (statDef) statDef.textContent = summary.def.toLocaleString('es-ES');
  }

  function renderUpgradeCard(key) {
    const card = document.getElementById('heroUpgradeCard');
    if (!card || !currentState) return;

    const levels = logic.ensureEquipmentState(currentState);
    const equip = logic.equipment[key];
    const level = levels[key];
    const cost = logic.getUpgradeCost(key, level);
    const maxLevel = equip.ranges[equip.ranges.length - 1].to;
    const isMax = cost === null || level >= maxLevel;
    const canUpgrade = !isMax && currentState.gold >= cost;
    const rank = logic.rankName(level);
    const nextRank = logic.rankName(level + 1);

    card.style.borderColor = `${rank.color}40`;

    let html = `
      <span class="hero-uc-close" id="heroUpgradeClose">✕</span>
      <div class="hero-uc-header">
        <span class="hero-uc-icon">${equip.icon}</span>
        <div>
          <div class="hero-uc-name">${equip.name}</div>
          <span class="hero-uc-rank-badge" style="background:${rank.bg};color:${rank.color}">${rank.label}</span>
        </div>
      </div>
      <div class="hero-uc-level-row">
        <div class="hero-uc-lvl-block">
          <div class="hero-uc-lvl-lbl">Nivel actual</div>
          <div class="hero-uc-lvl-num hero-cur-num">${level}</div>
        </div>
        <span class="hero-uc-arrow">→</span>
        <div class="hero-uc-lvl-block">
          <div class="hero-uc-lvl-lbl">Próximo nivel</div>
          <div class="hero-uc-lvl-num hero-nxt-num" style="color:${isMax ? '#f0a500' : nextRank.color}">
            ${isMax ? 'MAX' : level + 1}
          </div>
        </div>
      </div>
    `;

    if (isMax) {
      html += '<div class="hero-uc-max-msg">⭐ ¡Nivel Máximo alcanzado! ⭐</div>';
    } else {
      html += '<div class="hero-uc-stats-label">✦ Estadísticas por mejora</div><div class="hero-uc-stats">';
      Object.entries(equip.stats).forEach(([statKey, amount]) => {
        const meta = logic.statMeta.find((item) => item.key === statKey);
        html += `
          <div class="hero-uc-stat-row">
            <span class="hero-uc-stat-name">${meta ? meta.icon : ''} ${statKey}</span>
            <span class="hero-uc-stat-gain">${logic.formatGain(statKey, amount)}</span>
          </div>
        `;
      });
      html += `
        </div>
        <div class="hero-uc-cost-row">
          <div>
            <div class="hero-uc-cost-lbl">Costo de mejora</div>
            <div class="hero-uc-cost-val">🪙 ${logic.formatNumber(cost)}</div>
          </div>
          <div class="hero-uc-have-row">
            <div class="hero-uc-have-lbl">Tu oro</div>
            <div class="hero-uc-have-val ${canUpgrade ? 'hero-enough' : 'hero-not-enough'}">${logic.formatNumber(currentState.gold)}</div>
          </div>
        </div>
        <button class="hero-uc-btn ${canUpgrade ? 'can-upgrade' : 'cant-upgrade'}" id="heroUpgradeBtn" type="button">
          ${canUpgrade ? '⬆ MEJORAR' : '❌ Oro insuficiente'}
        </button>
      `;
    }

    card.innerHTML = html;

    const closeButton = document.getElementById('heroUpgradeClose');
    if (closeButton) closeButton.addEventListener('click', closeUpgrade);

    if (!isMax && canUpgrade) {
      const upgradeButton = document.getElementById('heroUpgradeBtn');
      if (upgradeButton) {
        upgradeButton.addEventListener('click', () => doUpgrade(key));
      }
    }
  }

  function openUpgrade(key) {
    currentUpgradeKey = key;
    renderUpgradeCard(key);
    document.getElementById('heroOverlay')?.classList.add('active');
  }

  function closeUpgrade() {
    currentUpgradeKey = null;
    document.getElementById('heroOverlay')?.classList.remove('active');
  }

  function doUpgrade(key) {
    if (!currentState) return;

    const result = logic.upgrade(currentState, key);
    if (!result.ok) return;

    renderGold(true);
    renderStats();
    renderEquipment();
    syncTopSummary();
    window.gameUI?.updateBars?.(currentState);

    const slot = document.getElementById(`hero-slot-${key}`);
    if (slot) {
      slot.classList.add('flash');
      window.setTimeout(() => slot.classList.remove('flash'), 600);
    }

    if (currentUpgradeKey) {
      renderUpgradeCard(currentUpgradeKey);
    }
  }

  function render() {
    buildLayout();
    renderGold();
    renderStats();
    renderEquipment();
    syncTopSummary();

    if (currentUpgradeKey) {
      renderUpgradeCard(currentUpgradeKey);
    }
  }

  function init(state) {
    currentState = state;
    logic.ensureEquipmentState(currentState);
    buildLayout();
    render();
  }

  function syncFromState(state) {
    currentState = state;
    if (!currentState) return;
    logic.ensureEquipmentState(currentState);
    renderGold();
    syncTopSummary();
    renderStats();
    if (currentUpgradeKey) {
      renderUpgradeCard(currentUpgradeKey);
    }
  }

  window.equipUI = {
    closeUpgrade,
    init,
    openUpgrade,
    render,
    syncFromState,
  };
})();
