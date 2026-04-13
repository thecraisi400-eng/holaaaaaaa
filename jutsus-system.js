(function () {
  const JUTSU_DB = [
    { id: 0, name: 'Llama Voraz', icon: '🔥', element: 'fire', baseDamage: 27, baseEffect: 'Ceguera (-30% puntería)', baseBuff: '+10% Ataque físico', baseCD: 3, currentLevel: 1 },
    { id: 1, name: 'Rayo Destellante', icon: '⚡', element: 'lightning', baseDamage: 29, baseEffect: 'Parálisis (-80% velocidad)', baseBuff: '+15% Evasión', baseCD: 2, currentLevel: 1 },
    { id: 2, name: 'Ráfaga Cortante', icon: '🌪️', element: 'wind', baseDamage: 20, baseEffect: 'Hemorragia', baseBuff: '+Velocidad de ataque', baseCD: 2, currentLevel: 1 },
    { id: 3, name: 'Prisión Hidráulica', icon: '🌊', element: 'water', baseDamage: 23, baseEffect: 'Asfixia (No habilidades)', baseBuff: '-CD (Tiempos de espera)', baseCD: 3, currentLevel: 1 },
    { id: 4, name: 'Escudo Telúrico', icon: '🪨', element: 'earth', baseDamage: 26, baseEffect: 'Pesadez (No saltos)', baseBuff: 'Inmunidad a empujones', baseCD: 3, currentLevel: 1 },
    { id: 5, name: 'Sello Prohibido', icon: '🔮', element: 'seal', baseDamage: 19, baseEffect: 'Silencio (Bloquea especiales)', baseBuff: '+5% Chakra', baseCD: 2, currentLevel: 1 },
    { id: 6, name: 'Espejismo Mental', icon: '👁️', element: 'genjutsu', baseDamage: 24, baseEffect: 'Confusión (Controles invertidos)', baseBuff: 'Invisibilidad', baseCD: 2, currentLevel: 1 },
    { id: 7, name: 'Bosque Viviente', icon: '🌿', element: 'wood', baseDamage: 29, baseEffect: 'Drenado energía', baseBuff: 'Curación constante', baseCD: 3, currentLevel: 1 },
    { id: 8, name: 'Impacto Brutal', icon: '💥', element: 'taijutsu', baseDamage: 21, baseEffect: 'Aturdimiento', baseBuff: 'Próximo golpe crítico', baseCD: 2, currentLevel: 1 },
    { id: 9, name: 'Aliento Vital', icon: '💚', element: 'medical', baseDamage: 22, baseEffect: 'Sordera (-20% defensa)', baseBuff: 'Limpieza de debuffs', baseCD: 3, currentLevel: 1 }
  ];

  const MAX_LEVEL = 10;
  const MP_COST_WEIGHTS = {
    'Llama Voraz': 0.11,
    'Rayo Destellante': 0.125,
    'Ráfaga Cortante': 0.095,
    'Prisión Hidráulica': 0.12,
    'Escudo Telúrico': 0.14,
    'Sello Prohibido': 0.085,
    'Espejismo Mental': 0.105,
    'Bosque Viviente': 0.13,
    'Impacto Brutal': 0.09,
    'Aliento Vital': 0.1
  };

  const BATTLE_EFFECTS = {
    'Llama Voraz': {
      enemy: { type: 'blind', missChance: 0.30, durationSec: 4 },
      self: { type: 'atkBoost', value: 0.10, durationSec: 5 }
    },
    'Rayo Destellante': {
      enemy: { type: 'paralysis', speedMultiplier: 0.20, durationSec: 4 },
      self: { type: 'evasionBoost', value: 0.15, durationSec: 5 }
    },
    'Ráfaga Cortante': {
      enemy: { type: 'bleed', hpPercentPerSec: 0.05, durationSec: 4 },
      self: { type: 'attackSpeedBoost', value: 0.50, durationSec: 5 }
    },
    'Prisión Hidráulica': {
      enemy: { type: 'asphyxia', hpPercentPerSec: 0.04, durationSec: 4 },
      self: { type: 'nextCooldownReduction', value: 0.35, durationSec: 0 }
    },
    'Escudo Telúrico': {
      enemy: { type: 'heaviness', durationSec: 4 },
      self: { type: 'absoluteDefense', durationSec: 5 }
    },
    'Sello Prohibido': {
      enemy: { type: 'silence', durationSec: 4 },
      self: { type: 'chakraRegenBoost', value: 0.05, durationSec: 5 }
    },
    'Espejismo Mental': {
      enemy: { type: 'confusion', selfHitPercent: 0.03, durationSec: 3 },
      self: { type: 'defenseBoost', value: 0.50, durationSec: 5 }
    },
    'Bosque Viviente': {
      enemy: { type: 'energyDrain', hpPercentPerSec: 0.05, durationSec: 4 },
      self: { type: 'hpRegenBoost', value: 0.07, durationSec: 5 }
    },
    'Impacto Brutal': {
      enemy: { type: 'stun', durationSec: 4 },
      self: { type: 'nextHitCritical', durationSec: 0 }
    },
    'Aliento Vital': {
      enemy: { type: 'deafness', defenseReduction: 0.20, durationSec: 4 },
      self: { type: 'debuffCleanseImmunity', durationSec: 5 }
    }
  };

  const JutsuSystem = {
    host: null,
    root: null,
    resources: { scrolls: 50, chakra: 200 },
    equipped: [null, null, null],
    selectedJutsuId: null,

    mount() {
      if (this.isMounted()) return;
      this.host = document.getElementById('hero-system-host');
      const tpl = document.getElementById('jutsuSystemTemplate');
      if (!this.host || !tpl) return;

      this.host.innerHTML = '';
      this.host.appendChild(tpl.content.cloneNode(true));
      this.root = this.host.querySelector('#jts-core');

      this.renderLibrary();
      this.initDropZones();
      this.renderAllSlots();
      this.bindEvents();
      this.updateResourceDisplay();
    },

    unmount() {
      if (!this.host) return;
      this.host.innerHTML = '';
      this.root = null;
      this.selectedJutsuId = null;
    },

    isMounted() {
      return Boolean(this.host && this.root && this.host.contains(this.root));
    },

    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    ensureDamageProgression(jutsu) {
      if (!Array.isArray(jutsu.damageIncrements)) jutsu.damageIncrements = [];
      const extraDamage = jutsu.damageIncrements.reduce((sum, amount) => sum + amount, 0);
      return jutsu.baseDamage + extraDamage;
    },

    calcRosterMpRange() {
      const profiles = window.CharacterStatsSystem?.CHARACTER_PROFILES || {};
      const allMps = Object.values(profiles).flatMap((profile) => {
        const formula = profile?.formulas?.MP || ['flat', 100, 0];
        return [1, 100].map((level) => {
          const [kind, base, perLevel] = formula;
          const val = base + perLevel * (level - 1);
          return kind === 'percent' ? Number(val) : Math.round(val);
        });
      });
      const min = Math.min(...allMps, 1);
      const max = Math.max(...allMps, min + 1);
      return { min, max };
    },

    getMpCost(jutsu, heroLevel = 1) {
      const mpRange = this.calcRosterMpRange();
      const clampedLevel = Math.max(1, Math.min(100, Math.floor(Number(heroLevel) || 1)));
      const weight = MP_COST_WEIGHTS[jutsu.name] || 0.1;
      const mpSpan = mpRange.max - mpRange.min;
      const levelScaling = 1 + ((clampedLevel - 1) / 99) * 0.45;
      const upgradeScaling = 1 + (jutsu.currentLevel - 1) * 0.09;
      const rawCost = (mpRange.min + mpSpan * weight) * levelScaling * upgradeScaling;
      return Math.max(8, Math.round(rawCost));
    },

    getStats(jutsu) {
      const lvl = jutsu.currentLevel;
      const damage = this.ensureDamageProgression(jutsu);
      const cdReduction = (lvl - 1) * 0.08;
      const cd = Math.max(0.5, parseFloat((jutsu.baseCD * (1 - cdReduction)).toFixed(1)));
      const heroLevel = window.CharacterStatsSystem?.getActiveHero?.()?.level || 1;
      const mpCost = this.getMpCost(jutsu, heroLevel);
      return { damage, cd, level: lvl, isMax: lvl >= MAX_LEVEL, mpCost };
    },

    bindEvents() {
      this.root.querySelector('#jts-popup-close')?.addEventListener('click', () => this.closeDetail());
      this.root.querySelector('#jts-detail-overlay')?.addEventListener('click', (event) => {
        if (event.target === this.root.querySelector('#jts-detail-overlay')) this.closeDetail();
      });
      this.root.querySelector('#jts-btn-upgrade')?.addEventListener('click', () => this.upgradeJutsu());
      this.root.querySelector('#jts-btn-equip-slot')?.addEventListener('click', () => {
        if (this.equipped.includes(this.selectedJutsuId)) this.unequipFromPopup();
        else this.equipFromPopup();
      });
    },

    renderLibrary() {
      const grid = this.root.querySelector('#jts-library-grid');
      if (!grid) return;
      grid.innerHTML = '';

      JUTSU_DB.forEach((jutsu) => {
        const stats = this.getStats(jutsu);
        const cell = document.createElement('div');
        cell.className = 'jts-cell';
        cell.draggable = true;
        cell.dataset.id = String(jutsu.id);
        cell.dataset.level = stats.isMax ? 'max' : String(jutsu.currentLevel);

        const levelDisplay = stats.isMax ? '仙' : `Lv.${jutsu.currentLevel}`;
        cell.innerHTML = `
          <span class="jts-level-badge">${levelDisplay}</span>
          <span class="jts-icon">${jutsu.icon}</span>
          <span class="jts-name">${jutsu.name}</span>
          <span class="jts-element-badge ${jutsu.element}">${jutsu.element}</span>
        `;

        cell.addEventListener('dragstart', (event) => {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', String(jutsu.id));
        });
        cell.addEventListener('click', () => this.openDetail(jutsu.id));
        grid.appendChild(cell);
      });
    },

    initDropZones() {
      this.root.querySelectorAll('.jts-equip-slot').forEach((slot) => {
        slot.addEventListener('dragover', (event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        });

        slot.addEventListener('drop', (event) => {
          event.preventDefault();
          const jutsuId = Number(event.dataTransfer.getData('text/plain'));
          const slotIdx = Number(slot.dataset.slot);
          if (!Number.isFinite(jutsuId) || !Number.isFinite(slotIdx)) return;
          this.equipToSlot(jutsuId, slotIdx);
        });
      });
    },

    equipToSlot(jutsuId, slotIdx) {
      if (this.equipped[slotIdx] === jutsuId) return;
      const jutsu = JUTSU_DB.find((entry) => entry.id === jutsuId);
      if (!jutsu) return;

      const existingSlot = this.equipped.indexOf(jutsuId);
      if (existingSlot !== -1 && existingSlot !== slotIdx) {
        this.equipped[existingSlot] = null;
        this.renderSlot(existingSlot);
      }

      this.equipped[slotIdx] = jutsuId;
      this.renderSlot(slotIdx);
      this.spawnParticles(this.root.querySelector(`#jts-slot-${slotIdx}`), this.getStats(jutsu).isMax);
    },

    renderSlot(slotIdx) {
      const slotEl = this.root.querySelector(`#jts-slot-${slotIdx}`);
      if (!slotEl) return;

      const jutsuId = this.equipped[slotIdx];
      slotEl.classList.remove('jts-is-empty', 'jts-is-filled', 'jts-is-sennin');

      if (jutsuId === null) {
        slotEl.classList.add('jts-is-empty');
        slotEl.querySelector('.jts-slot-inner').innerHTML = '<div class="jts-slot-empty-text">⊕</div><div class="jts-slot-name">Vacío</div>';
        return;
      }

      const jutsu = JUTSU_DB.find((entry) => entry.id === jutsuId);
      if (!jutsu) return;
      const stats = this.getStats(jutsu);

      slotEl.classList.add(stats.isMax ? 'jts-is-sennin' : 'jts-is-filled');
      slotEl.querySelector('.jts-slot-inner').innerHTML = `<div class="jts-slot-icon">${jutsu.icon}</div><div class="jts-slot-name">${jutsu.name}</div>`;
    },

    renderAllSlots() {
      for (let index = 0; index < this.equipped.length; index += 1) this.renderSlot(index);
    },

    spawnParticles(slotEl, isGold = false) {
      if (!slotEl) return;
      const container = slotEl.querySelector('.jts-particle-container');
      if (!container) return;
      container.innerHTML = '';
      const count = isGold ? 20 : 14;

      for (let i = 0; i < count; i += 1) {
        const p = document.createElement('div');
        p.className = `jts-particle ${isGold ? 'jts-gold' : ''}`;
        const angle = (Math.PI * 2 * i) / count;
        const dist = 30 + Math.random() * 35;
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.marginLeft = '-2px';
        p.style.marginTop = '-2px';
        p.style.setProperty('--px', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--py', `${Math.sin(angle) * dist}px`);
        container.appendChild(p);
      }

      setTimeout(() => { container.innerHTML = ''; }, 900);
    },

    openDetail(jutsuId) {
      this.selectedJutsuId = jutsuId;
      const jutsu = JUTSU_DB.find((entry) => entry.id === jutsuId);
      if (!jutsu) return;
      const stats = this.getStats(jutsu);

      this.root.querySelector('#jts-popup-icon').textContent = jutsu.icon;
      this.root.querySelector('#jts-popup-name').textContent = jutsu.name;
      this.root.querySelector('#jts-popup-element').textContent = `Elemento: ${this.capitalize(jutsu.element)}`;
      this.root.querySelector('#jts-popup-damage').textContent = String(stats.damage);
      this.root.querySelector('#jts-popup-effect').textContent = jutsu.baseEffect;
      this.root.querySelector('#jts-popup-buff').textContent = jutsu.baseBuff;
      this.root.querySelector('#jts-popup-cd').textContent = `${stats.cd}s · MP ${stats.mpCost}`;

      const levelEl = this.root.querySelector('#jts-popup-level');
      const popupEl = this.root.querySelector('#jts-detail-popup');
      const passiveEl = this.root.querySelector('#jts-popup-passive');
      if (stats.isMax) {
        levelEl.textContent = '仙 SENNIN';
        levelEl.classList.add('max');
        popupEl.classList.add('jts-sennin-popup');
        passiveEl.classList.add('visible');
      } else {
        levelEl.textContent = `Lv. ${jutsu.currentLevel} / ${MAX_LEVEL}`;
        levelEl.classList.remove('max');
        popupEl.classList.remove('jts-sennin-popup');
        passiveEl.classList.remove('visible');
      }

      const btnUpgrade = this.root.querySelector('#jts-btn-upgrade');
      if (stats.isMax) {
        btnUpgrade.disabled = true;
        btnUpgrade.textContent = '✦ NIVEL MÁXIMO ✦';
      } else {
        const costScrolls = 10 * jutsu.currentLevel;
        const costChakra = 25 * jutsu.currentLevel;
        btnUpgrade.disabled = this.resources.scrolls < costScrolls || this.resources.chakra < costChakra;
        btnUpgrade.textContent = `⬆ Mejorar · 📜 ${costScrolls} · 🔵 ${costChakra}`;
      }

      const equipBtn = this.root.querySelector('#jts-btn-equip-slot');
      equipBtn.textContent = this.equipped.includes(jutsuId) ? 'Desequipar' : 'Equipar';

      this.updateResourceDisplay();
      this.root.querySelector('#jts-detail-overlay').classList.add('active');
    },

    closeDetail() {
      this.root.querySelector('#jts-detail-overlay').classList.remove('active');
      this.selectedJutsuId = null;
    },

    upgradeJutsu() {
      if (this.selectedJutsuId === null) return;
      const jutsu = JUTSU_DB.find((entry) => entry.id === this.selectedJutsuId);
      if (!jutsu) return;
      const stats = this.getStats(jutsu);
      if (stats.isMax) return;

      const costScrolls = 10 * jutsu.currentLevel;
      const costChakra = 25 * jutsu.currentLevel;
      if (this.resources.scrolls < costScrolls || this.resources.chakra < costChakra) return;

      this.resources.scrolls -= costScrolls;
      this.resources.chakra -= costChakra;
      jutsu.currentLevel += 1;
      if (!Array.isArray(jutsu.damageIncrements)) jutsu.damageIncrements = [];
      jutsu.damageIncrements.push(this.getRandomInt(17, 29));

      this.renderLibrary();
      this.renderAllSlots();
      this.openDetail(this.selectedJutsuId);
    },

    equipFromPopup() {
      if (this.selectedJutsuId === null) return;
      const emptySlot = this.equipped.indexOf(null);
      if (emptySlot !== -1) {
        this.equipToSlot(this.selectedJutsuId, emptySlot);
      } else {
        this.equipToSlot(this.selectedJutsuId, 2);
      }
      this.root.querySelector('#jts-btn-equip-slot').textContent = 'Desequipar';
    },

    unequipFromPopup() {
      if (this.selectedJutsuId === null) return;
      const idx = this.equipped.indexOf(this.selectedJutsuId);
      if (idx === -1) return;
      this.equipped[idx] = null;
      this.renderSlot(idx);
      this.root.querySelector('#jts-btn-equip-slot').textContent = 'Equipar';
    },

    updateResourceDisplay() {
      this.root.querySelector('#jts-res-scrolls').textContent = String(this.resources.scrolls);
      this.root.querySelector('#jts-res-chakra').textContent = String(this.resources.chakra);
    },

    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    },

    getEquippedBattleJutsus(heroSnapshot = null) {
      const heroLevel = heroSnapshot?.level || window.CharacterStatsSystem?.getActiveHero?.()?.level || 1;
      return this.equipped
        .map((jutsuId, slotIndex) => {
          if (jutsuId === null) return null;
          const jutsu = JUTSU_DB.find((entry) => entry.id === jutsuId);
          if (!jutsu) return null;
          const stats = this.getStats(jutsu);
          return {
            slotIndex,
            id: jutsu.id,
            name: jutsu.name,
            icon: jutsu.icon,
            damage: stats.damage,
            mpCost: this.getMpCost(jutsu, heroLevel),
            cooldownSec: stats.cd,
            level: jutsu.currentLevel,
            effects: BATTLE_EFFECTS[jutsu.name] || null
          };
        })
        .filter(Boolean);
    }
  };

  window.JutsuSystem = JutsuSystem;
})();
