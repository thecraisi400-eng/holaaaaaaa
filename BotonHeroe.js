(function heroModule() {
  const SLOT_COLORS = {
    gray: '#8d93a6',
    green: '#3ecb76',
    blue: '#4ea8ff',
    purple: '#a975ff',
    yellow: '#f6d057',
  };

  const slotDefinitions = {
    cabeza: {
      emoji: '🪖',
      nombre: 'Cabeza',
      baseStats: { atk: 6, crt: 0.45, res: 10 },
      growth: { atk: 0.3, crt: 0.02, res: 0.8 },
      keys: ['atk', 'crt', 'res'],
    },
    pecho: {
      emoji: '🧥',
      nombre: 'Pecho',
      baseStats: { def: 8, res: 16 },
      growth: { def: 0.4, res: 0.8 },
      keys: ['def', 'res'],
    },
    manos: {
      emoji: '✋',
      nombre: 'Manos',
      baseStats: { atk: 5, spd: 1.2, crt: 0.35 },
      growth: { atk: 0.3, spd: 0.1, crt: 0.02 },
      keys: ['atk', 'spd', 'crt'],
    },
    piernas: {
      emoji: '🦵',
      nombre: 'Piernas',
      baseStats: { def: 5, spd: 0.8, eva: 0.2 },
      growth: { def: 0.3, spd: 0.1, eva: 0.01 },
      keys: ['def', 'spd', 'eva'],
    },
    pies: {
      emoji: '👟',
      nombre: 'Pies',
      baseStats: { spd: 1.6, eva: 0.35, res: 4 },
      growth: { spd: 0.15, eva: 0.015, res: 0.3 },
      keys: ['spd', 'eva', 'res'],
    },
    accesorios: {
      emoji: '📿',
      nombre: 'Accesorios',
      baseStats: { crt: 0.55, eva: 0.2, atk: 3 },
      growth: { crt: 0.03, eva: 0.015, atk: 0.2 },
      keys: ['crt', 'eva', 'atk'],
    },
  };

  const rankBrackets = [
    { min: 1, max: 6, cost: 240 },
    { min: 6, max: 15, cost: 2376 },
    { min: 15, max: 30, cost: 16250 },
    { min: 30, max: 45, cost: 41040 },
    { min: 45, max: 60, cost: 76320 },
  ];

  const statMeta = {
    atk: { label: 'Ataque', icon: '⚔️' },
    def: { label: 'Defensa', icon: '🛡️' },
    spd: { label: 'Velocidad', icon: '💨' },
    crt: { label: 'Crítico', icon: '🎯', pct: true },
    eva: { label: 'Evasión', icon: '🌀', pct: true },
    res: { label: 'Resistencia', icon: '🧱' },
  };

  function toFixedSmart(value) {
    return Number(value).toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  }

  function getSlotColor(level) {
    if (level >= 45) return SLOT_COLORS.yellow;
    if (level >= 30) return SLOT_COLORS.purple;
    if (level >= 15) return SLOT_COLORS.blue;
    if (level >= 6) return SLOT_COLORS.green;
    return SLOT_COLORS.gray;
  }

  function getCurrentBracket(level) {
    return rankBrackets.find((b) => level >= b.min && level < b.max) || null;
  }

  function formatStat(key, value, withSign = false) {
    const prefix = withSign && value >= 0 ? '+' : '';
    const txt = `${prefix}${toFixedSmart(value)}`;
    return statMeta[key].pct ? `${txt}%` : txt;
  }

  class BotonHeroe {
    constructor(rootId, options = {}) {
      this.root = document.getElementById(rootId);
      this.onGoldChange = options.onGoldChange || (() => {});
      this.onStatsChange = options.onStatsChange || (() => {});
      this.state = {
        visible: false,
        rank: 'Chunin',
        gold: options.initialGold ?? 4320,
        selectedSlot: null,
        slots: {
          cabeza: 1,
          pecho: 1,
          manos: 1,
          piernas: 1,
          pies: 1,
          accesorios: 1,
        },
      };

      if (this.root) this.render();
    }

    getSlotStats(slotId, level) {
      const def = slotDefinitions[slotId];
      const currentLevel = level ?? this.state.slots[slotId];
      const stats = { ...def.baseStats };
      def.keys.forEach((key) => {
        stats[key] += def.growth[key] * Math.max(0, currentLevel - 1);
      });
      return stats;
    }

    getGlobalStats() {
      const total = { atk: 0, def: 0, spd: 0, crt: 0, eva: 0, res: 0 };
      Object.keys(this.state.slots).forEach((slotId) => {
        const stats = this.getSlotStats(slotId);
        Object.keys(total).forEach((key) => {
          total[key] += stats[key] || 0;
        });
      });
      return total;
    }

    show() {
      this.state.visible = true;
      this.render();
    }

    hide() {
      this.state.visible = false;
      this.state.selectedSlot = null;
      this.render();
    }

    selectSlot(slotId) {
      this.state.selectedSlot = slotId;
      this.render();
    }

    closeModal() {
      this.state.selectedSlot = null;
      this.render();
    }

    tryUpgradeSelected() {
      const slotId = this.state.selectedSlot;
      if (!slotId) return;

      const currentLevel = this.state.slots[slotId];
      if (currentLevel >= 60) return;

      const bracket = getCurrentBracket(currentLevel);
      if (!bracket) return;

      if (this.state.gold < bracket.cost) return;

      this.state.gold -= bracket.cost;
      this.state.slots[slotId] += 1;

      if (this.state.slots[slotId] >= 45) this.state.rank = 'Kage';
      else if (this.state.slots[slotId] >= 30) this.state.rank = 'Jonin';
      else if (this.state.slots[slotId] >= 15) this.state.rank = 'Tokubetsu Jonin';
      else if (this.state.slots[slotId] >= 6) this.state.rank = 'Genin Elite';

      this.onGoldChange(this.state.gold);
      this.onStatsChange(this.getGlobalStats());
      this.render();
    }

    renderStatsPanel() {
      const stats = this.getGlobalStats();
      const order = ['atk', 'def', 'spd', 'crt', 'eva', 'res'];
      return order.map((key) => {
        const meta = statMeta[key];
        return `
          <div class="hero-stat-card">
            <span>${meta.icon}</span>
            <span>${meta.label}</span>
            <strong>${formatStat(key, stats[key])}</strong>
          </div>
        `;
      }).join('');
    }

    renderSlots() {
      return Object.entries(slotDefinitions).map(([slotId, def]) => {
        const level = this.state.slots[slotId];
        const color = getSlotColor(level);
        return `
          <button class="slot-card" data-slot="${slotId}" style="--slot-color:${color}">
            <span class="slot-title">${def.emoji} ${def.nombre}</span>
            <span class="slot-level">Nv. ${level}</span>
          </button>
        `;
      }).join('');
    }

    renderModal() {
      const slotId = this.state.selectedSlot;
      if (!slotId) return '';

      const def = slotDefinitions[slotId];
      const level = this.state.slots[slotId];
      const nextLevel = Math.min(level + 1, 60);
      const currentStats = this.getSlotStats(slotId, level);
      const nextStats = this.getSlotStats(slotId, nextLevel);
      const gains = {};
      def.keys.forEach((key) => {
        gains[key] = (nextStats[key] || 0) - (currentStats[key] || 0);
      });

      const bracket = getCurrentBracket(level);
      const cost = bracket ? bracket.cost : 0;
      const canUpgrade = level < 60 && this.state.gold >= cost;

      return `
        <div class="slot-modal-backdrop" id="slotModalBackdrop">
          <div class="slot-modal">
            <h3>${def.emoji} ${def.nombre}</h3>
            <p><strong>Nivel actual:</strong> ${level}</p>
            <p><strong>Próximo nivel:</strong> ${nextLevel}</p>
            <div class="modal-grid">
              <div>
                <h4>Actual</h4>
                ${def.keys.map((key) => `<div>${statMeta[key].icon} ${statMeta[key].label}: <b>${formatStat(key, currentStats[key])}</b></div>`).join('')}
              </div>
              <div>
                <h4>Ganancia</h4>
                ${def.keys.map((key) => `<div>${statMeta[key].icon} ${statMeta[key].label}: <b>${formatStat(key, gains[key], true)}</b></div>`).join('')}
              </div>
            </div>
            <p><strong>Oro necesario:</strong> 💰 ${cost.toLocaleString()}</p>
            <div class="modal-actions">
              <button class="modal-btn close" id="closeSlotModal">Cerrar</button>
              <button class="modal-btn upgrade" id="upgradeSlot" ${canUpgrade ? '' : 'disabled'}>
                ${level >= 60 ? 'Nivel Máximo' : (canUpgrade ? 'Mejorar' : 'Oro Insuficiente')}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    bindEvents() {
      this.root.querySelectorAll('.slot-card').forEach((el) => {
        el.addEventListener('click', () => this.selectSlot(el.dataset.slot));
      });

      const close = this.root.querySelector('#closeSlotModal');
      const upgrade = this.root.querySelector('#upgradeSlot');
      const backdrop = this.root.querySelector('#slotModalBackdrop');

      if (close) close.addEventListener('click', () => this.closeModal());
      if (upgrade) upgrade.addEventListener('click', () => this.tryUpgradeSelected());
      if (backdrop) {
        backdrop.addEventListener('click', (event) => {
          if (event.target.id === 'slotModalBackdrop') this.closeModal();
        });
      }
    }

    render() {
      if (!this.root) return;

      this.root.innerHTML = this.state.visible ? `
        <section class="hero-panel" id="heroPanel">
          <div class="hero-content-grid">
            <div class="stats-box">
              ${this.renderStatsPanel()}
            </div>
            <div class="right-column">
              <div class="slots-grid">
                ${this.renderSlots()}
              </div>
              <div class="hero-sprite-box">
                <img src="assets/images/sasuke.webp" alt="Sprite de Sasuke" />
              </div>
            </div>
          </div>
          ${this.renderModal()}
        </section>
      ` : '';

      this.bindEvents();
    }
  }

  window.BotonHeroe = BotonHeroe;
})();
