(function () {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const JUTSU_DB = [
    { id: 0, name: 'Llama Voraz', icon: '🔥', element: 'fire', baseDamage: 27, baseEffect: 'Ceguera (30% fallo por 4s)', baseBuff: '+10% ATK por 5s', baseCD: 3, currentLevel: 1 },
    { id: 1, name: 'Rayo Destellante', icon: '⚡', element: 'lightning', baseDamage: 29, baseEffect: 'Parálisis (-80% velocidad por 4s)', baseBuff: '+15% Evasión por 5s', baseCD: 2, currentLevel: 1 },
    { id: 2, name: 'Ráfaga Cortante', icon: '🌪️', element: 'wind', baseDamage: 20, baseEffect: 'Hemorragia (5% HP/s por 4s)', baseBuff: '+50% velocidad de ataque por 5s', baseCD: 2, currentLevel: 1 },
    { id: 3, name: 'Prisión Hidráulica', icon: '🌊', element: 'water', baseDamage: 23, baseEffect: 'Asfixia (4% HP/s por 4s)', baseBuff: '-35% cooldown a jutsus equipados (1 turno)', baseCD: 3, currentLevel: 1 },
    { id: 4, name: 'Escudo Telúrico', icon: '🪨', element: 'earth', baseDamage: 26, baseEffect: 'Pesadez (sin saltar por 4s)', baseBuff: 'Recibe 0 daño por 5s', baseCD: 3, currentLevel: 1 },
    { id: 5, name: 'Sello Prohibido', icon: '🔮', element: 'seal', baseDamage: 19, baseEffect: 'Silencio (sin habilidades por 4s)', baseBuff: '+5% regeneración de Chakra por 5s', baseCD: 2, currentLevel: 1 },
    { id: 6, name: 'Espejismo Mental', icon: '👁️', element: 'genjutsu', baseDamage: 24, baseEffect: 'Confusión (autodaño por 3s)', baseBuff: '+50% DEF por 5s', baseCD: 2, currentLevel: 1 },
    { id: 7, name: 'Bosque Viviente', icon: '🌿', element: 'wood', baseDamage: 29, baseEffect: 'Drenado de energía (5% HP/s por 4s)', baseBuff: '+7% regeneración HP por 5s', baseCD: 3, currentLevel: 1 },
    { id: 8, name: 'Impacto Brutal', icon: '💥', element: 'taijutsu', baseDamage: 21, baseEffect: 'Aturdimiento (inmóvil 4s)', baseBuff: 'Próximo golpe crítico', baseCD: 2, currentLevel: 1 },
    { id: 9, name: 'Aliento Vital', icon: '💚', element: 'medical', baseDamage: 22, baseEffect: 'Sordera (-20% DEF por 4s)', baseBuff: 'Limpieza + Inmunidad a debuffs por 5s', baseCD: 3, currentLevel: 1 }
  ].map((jutsu) => ({
    ...jutsu,
    baseMpCost: randInt(27, 37),
    extraDamageFromUpgrades: 0,
    extraMpFromUpgrades: 0
  }));

  const MAX_LEVEL = 10;

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

    getStats(jutsu) {
      const lvl = jutsu.currentLevel;
      const damage = jutsu.baseDamage + jutsu.extraDamageFromUpgrades;
      const cdReduction = (lvl - 1) * 0.08;
      const cd = Math.max(0.5, parseFloat((jutsu.baseCD * (1 - cdReduction)).toFixed(1)));
      const mpCost = jutsu.baseMpCost + jutsu.extraMpFromUpgrades;
      return { damage, cd, mpCost, level: lvl, isMax: lvl >= MAX_LEVEL };
    },

    getEquippedBattleLoadout() {
      return this.equipped
        .map((jutsuId, slot) => {
          if (jutsuId === null) return null;
          const jutsu = JUTSU_DB.find((entry) => entry.id === jutsuId);
          if (!jutsu) return null;
          const stats = this.getStats(jutsu);
          return {
            id: jutsu.id,
            slot,
            name: jutsu.name,
            icon: jutsu.icon,
            element: jutsu.element,
            damage: stats.damage,
            mpCost: stats.mpCost,
            cooldownMs: Math.round(stats.cd * 1000),
            level: stats.level
          };
        })
        .filter(Boolean);
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
      this.root.querySelector('#jts-popup-cd').textContent = `${stats.cd}s`;
      this.root.querySelector('#jts-popup-mp').textContent = `${stats.mpCost} MP`;

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
      jutsu.extraMpFromUpgrades += randInt(10, 19);
      jutsu.extraDamageFromUpgrades += randInt(17, 29);

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
    }
  };

  window.JutsuSystem = JutsuSystem;
})();
