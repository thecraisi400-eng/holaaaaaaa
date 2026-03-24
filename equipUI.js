(() => {
  const logic = window.equipLogic;
  const { EQUIPMENT_DATA, SLOT_ORDER, STAT_META } = logic;

  let currentUpgradeKey = null;
  let getGold = () => 0;
  let setGold = () => {};

  function renderStats() {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    const stats = logic.computeStats();
    grid.innerHTML = '';

    for (const meta of STAT_META) {
      const chip = document.createElement('div');
      chip.className = 'stat-chip';
      const value = meta.dummy ? '--' : logic.fmtStat(meta, stats[meta.key]);
      chip.innerHTML = `<span class="stat-icon">${meta.icon}</span><span class="stat-lbl">${meta.label}</span><span class="stat-val">${value}</span>`;
      grid.appendChild(chip);
    }
  }

  function renderEquipment() {
    const grid = document.getElementById('equipGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (const key of SLOT_ORDER) {
      const data = EQUIPMENT_DATA[key];
      const lvl = logic.levels[key];
      const slot = document.createElement('div');
      slot.className = `slot ${logic.rankClass(lvl)}`;
      slot.id = `slot-${key}`;
      slot.innerHTML = `<span class="slot-icon">${data.icon}</span><span class="slot-name">${data.name}</span><span class="slot-lvl">Nv. ${lvl}</span>`;
      slot.addEventListener('click', () => openUpgrade(key));
      grid.appendChild(slot);
    }
  }

  function closeUpgrade() {
    const overlay = document.getElementById('equipOverlay');
    if (overlay) overlay.classList.remove('active');
    currentUpgradeKey = null;
  }

  function openUpgrade(key) {
    currentUpgradeKey = key;
    renderUpgradeCard(key);
    const overlay = document.getElementById('equipOverlay');
    if (overlay) overlay.classList.add('active');
  }

  function renderUpgradeCard(key) {
    const data = EQUIPMENT_DATA[key];
    const lvl = logic.levels[key];
    const cost = logic.getUpgradeCost(key, lvl);
    const isMax = cost === null;
    const gold = getGold();
    const canBuy = !isMax && gold >= cost;
    const rk = logic.rankName(lvl);
    const rkNext = logic.rankName(lvl + 1);
    const card = document.getElementById('upgradeCard');
    if (!card) return;

    let html = `<span class="uc-close" id="ucClose">✕</span>
      <div class="uc-header"><span class="uc-icon">${data.icon}</span><div><div class="uc-name">${data.name}</div>
      <span class="uc-rank-badge" style="background:${rk.bg};color:${rk.color}">${rk.label}</span></div></div>
      <div class="uc-level-row"><div class="uc-lvl-block"><div class="uc-lvl-lbl">Nivel actual</div><div class="uc-lvl-num cur-num">${lvl}</div></div>
      <span class="uc-arrow">→</span><div class="uc-lvl-block"><div class="uc-lvl-lbl">Próximo nivel</div><div class="uc-lvl-num nxt-num" style="color:${isMax ? '#f0a500' : rkNext.color}">${isMax ? 'MAX' : lvl + 1}</div></div></div>`;

    if (isMax) {
      html += '<div class="uc-max-msg">⭐ ¡Nivel Máximo alcanzado! ⭐</div>';
    } else {
      html += '<div class="uc-stats-label">✦ Estadísticas por mejora</div><div class="uc-stats">';
      for (const [stat, amount] of Object.entries(data.stats)) {
        const meta = STAT_META.find(m => m.key === stat);
        html += `<div class="uc-stat-row"><span class="uc-stat-name">${meta ? meta.icon : ''} ${stat}</span><span class="uc-stat-gain">${logic.fmtGain(stat, amount)}</span></div>`;
      }
      html += `</div><div class="uc-cost-row"><div><div class="uc-cost-lbl">Costo de mejora</div><div class="uc-cost-val">🪙 ${logic.fmtNum(cost)}</div></div>
      <div class="uc-have-row"><div class="uc-have-lbl">Tu oro</div><div class="uc-have-val ${canBuy ? 'enough' : 'not-enough'}">${logic.fmtNum(gold)}</div></div></div>
      <button class="uc-btn ${canBuy ? 'can-upgrade' : 'cant-upgrade'}" id="ucUpgradeBtn">${canBuy ? '⬆ MEJORAR' : '❌ Oro insuficiente'}</button>`;
    }

    card.innerHTML = html;
    document.getElementById('ucClose').addEventListener('click', closeUpgrade);
    const btn = document.getElementById('ucUpgradeBtn');
    if (btn && canBuy) btn.addEventListener('click', () => doUpgrade(key));
  }

  function doUpgrade(key) {
    const lvl = logic.levels[key];
    const cost = logic.getUpgradeCost(key, lvl);
    const gold = getGold();
    if (cost === null || gold < cost) return;

    setGold(gold - cost);
    logic.levels[key] += 1;

    renderStats();
    renderEquipment();
    renderUpgradeCard(key);

    const slotEl = document.getElementById(`slot-${key}`);
    if (slotEl) {
      slotEl.classList.add('flash');
      setTimeout(() => slotEl.classList.remove('flash'), 600);
    }
  }

  function showHeroSection(show) {
    const heroPanel = document.getElementById('heroPanel');
    const defaultPanel = document.getElementById('centerDefault');
    if (!heroPanel || !defaultPanel) return;
    heroPanel.classList.toggle('active', show);
    defaultPanel.classList.toggle('hidden', show);
    if (!show) closeUpgrade();
  }

  function init(options = {}) {
    getGold = options.getGold || getGold;
    setGold = options.setGold || setGold;
    renderStats();
    renderEquipment();

    const overlay = document.getElementById('equipOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeUpgrade();
      });
    }
  }

  window.equipUI = {
    init,
    showHeroSection,
  };
})();
