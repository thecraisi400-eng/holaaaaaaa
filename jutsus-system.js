(function () {
  // New Jutsu Database organized by element categories
  const JUTSU_DB = [
    // 🔥 FIRE abilities (Red sphere in battle)
    { id: 0, name: 'Bola Fuego', icon: '🔥', element: 'fire', baseDamage: 70, effect: 'Quemadura (Baja -10% HP al enemigo durante 3 segundos)', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ff0000' },
    { id: 1, name: 'Llama Fénix', icon: '🔥', element: 'fire', baseDamage: 80, effect: 'Baja Evasión del enemigo en -30% durante 4 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ff0000' },
    { id: 2, name: 'Lanza Ígnea', icon: '🔥', element: 'fire', baseDamage: 60, effect: 'Baja Defensa del enemigo -25% durante 4 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ff0000' },
    { id: 3, name: 'Explosión Calor', icon: '🔥', element: 'fire', baseDamage: 73, effect: 'Aumenta Ataque del personaje en 15% durante 3 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ff0000' },
    
    // 🌪️ WIND abilities (White sphere in battle)
    { id: 4, name: 'Ráfaga Veloz', icon: '🌪️', element: 'wind', baseDamage: 60, effect: 'Aumenta Evasion en +15% durante 4 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ffffff' },
    { id: 5, name: 'Shuriken Viento', icon: '🌪️', element: 'wind', baseDamage: 70, effect: 'Hemorragia Grave al enemigo -15% HP', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ffffff' },
    { id: 6, name: 'Cuchilla Vacío', icon: '🌪️', element: 'wind', baseDamage: 73, effect: 'Ignorar la Defensa del enemigo -20%', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ffffff' },
    { id: 7, name: 'Gran Torbellino', icon: '🌪️', element: 'wind', baseDamage: 80, effect: 'Aumento de Velocidad del personaje en 40% durante 3 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ffffff' },
    
    // ⚡ LIGHTNING abilities (Yellow sphere in battle)
    { id: 8, name: 'Cuchilla Rayo', icon: '⚡', element: 'lightning', baseDamage: 70, effect: 'Perforar Defensa del enemigo -35% durante 4 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ffff00' },
    { id: 9, name: 'Armadura Rayo', icon: '⚡', element: 'lightning', baseDamage: 60, effect: 'Aumenta Agilidad en +40% durante 4 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ffff00' },
    { id: 10, name: 'Rayo Veloz', icon: '⚡', element: 'lightning', baseDamage: 80, effect: 'Aumenta El Crítico en +40%', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ffff00' },
    { id: 11, name: 'Trueno Astral', icon: '⚡', element: 'lightning', baseDamage: 73, effect: 'Baja la velocidad del enemigo en 30% durante 4 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#ffff00' },
    
    // 🪨 EARTH abilities (Gray sphere in battle)
    { id: 12, name: 'Roca Sólida', icon: '🪨', element: 'earth', baseDamage: 80, effect: 'Aumenta Defensa en 45% durante 4 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#808080' },
    { id: 13, name: 'Armadura Arena', icon: '🪨', element: 'earth', baseDamage: 60, effect: 'Absorción Daño en 40%', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#808080' },
    { id: 14, name: 'Domo Tierra', icon: '🪨', element: 'earth', baseDamage: 70, effect: 'Baja Defensa del enemigo 25% durante 4 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#808080' },
    { id: 15, name: 'Muro Piedra', icon: '🪨', element: 'earth', baseDamage: 67, effect: 'Regenera 17% HP durante 4 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#808080' },
    
    // 🌊 WATER abilities (Blue sphere in battle)
    { id: 16, name: 'Gran Catarata', icon: '🌊', element: 'water', baseDamage: 60, effect: 'Recuperación de MP 20% durante 3 segundo', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#0000ff' },
    { id: 17, name: 'Prisión Agua', icon: '🌊', element: 'water', baseDamage: 67, effect: 'Regenera 7% de HP durante 3 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#0000ff' },
    { id: 18, name: 'Tsunami Devastador', icon: '🌊', element: 'water', baseDamage: 80, effect: 'Reducción MP al enemigo 15% durante 3 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#0000ff' },
    { id: 19, name: 'Tiburón Hambriento', icon: '🌊', element: 'water', baseDamage: 70, effect: 'Robo de Chakra al enemigo 10% durante 3 segundos', buff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false, sphereColor: '#0000ff' }
  ];

  const ELEMENTS = ['fire', 'wind', 'lightning', 'earth', 'water'];
  const MAX_LEVEL = 10;
  const UNLOCK_COST = 25; // Cost to unlock a jutsu category
  const MAX_UNLOCKED_CATEGORIES = 2; // Player can only unlock 2 categories

  const randomInt = (min, max) => Math.floor(Math.random() * ((max - min) + 1)) + min;

  const JutsuSystem = {
    host: null,
    root: null,
    resources: { scrolls: 100 }, // Start with 100 scrolls
    equipped: [null, null, null],
    selectedJutsuId: null,
    selectedCategory: 'fire',
    unlockedCategories: [], // Track which categories are unlocked

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
      this.initCategoryTabs();
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
      const damage = Math.round(jutsu.baseDamage);
      const cdReduction = (lvl - 1) * 0.08;
      const cd = Math.max(0.5, parseFloat((jutsu.baseCD * (1 - cdReduction)).toFixed(1)));
      const mpCost = Math.round(jutsu.mpCost);
      return { damage, cd, mpCost, level: lvl, isMax: lvl >= MAX_LEVEL };
    },

    bindEvents() {
      this.root.querySelector('#jts-popup-close')?.addEventListener('click', () => this.closeDetail());
      this.root.querySelector('#jts-detail-overlay')?.addEventListener('click', (event) => {
        if (event.target === this.root.querySelector('#jts-detail-overlay')) this.closeDetail();
      });
      this.root.querySelector('#jts-btn-upgrade')?.addEventListener('click', () => this.upgradeJutsu());
      this.root.querySelector('#jts-btn-unlock')?.addEventListener('click', () => this.unlockCategory());
      this.root.querySelector('#jts-btn-equip-slot')?.addEventListener('click', () => {
        if (this.equipped.includes(this.selectedJutsuId)) this.unequipFromPopup();
        else this.equipFromPopup();
      });
    },

    initCategoryTabs() {
      const tabs = this.root.querySelectorAll('.jts-category-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const element = tab.dataset.element;
          this.selectedCategory = element;
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.renderLibrary();
        });
      });
    },

    renderLibrary() {
      const grid = this.root.querySelector('#jts-library-grid');
      if (!grid) return;
      grid.innerHTML = '';

      // Filter jutsus by selected category
      const categoryJutsus = JUTSU_DB.filter(j => j.element === this.selectedCategory);

      categoryJutsus.forEach((jutsu) => {
        const stats = this.getStats(jutsu);
        const cell = document.createElement('div');
        cell.className = 'jts-cell';
        cell.draggable = jutsu.unlocked;
        cell.dataset.id = String(jutsu.id);
        cell.dataset.level = stats.isMax ? 'max' : String(jutsu.currentLevel);
        cell.dataset.unlocked = jutsu.unlocked ? 'true' : 'false';

        const levelDisplay = stats.isMax ? '仙' : `Lv.${jutsu.currentLevel}`;
        
        if (!jutsu.unlocked) {
          cell.innerHTML = `
            <span class="jts-lock-icon">🔒</span>
            <span class="jts-icon">${jutsu.icon}</span>
            <span class="jts-name">${jutsu.name}</span>
            <span class="jts-unlock-cost">25 📗</span>
          `;
          cell.style.opacity = '0.6';
        } else {
          cell.innerHTML = `
            <span class="jts-level-badge">${levelDisplay}</span>
            <span class="jts-icon">${jutsu.icon}</span>
            <span class="jts-name">${jutsu.name}</span>
          `;
        }

        if (jutsu.unlocked) {
          cell.addEventListener('dragstart', (event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(jutsu.id));
          });
        }
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
      if (!jutsu || !jutsu.unlocked) return;

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
      this.root.querySelector('#jts-popup-effect').textContent = jutsu.effect;
      this.root.querySelector('#jts-popup-buff').textContent = jutsu.buff || 'N/A';
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

      // Handle unlock button visibility
      const btnUnlock = this.root.querySelector('#jts-btn-unlock');
      const btnUpgrade = this.root.querySelector('#jts-btn-upgrade');
      const btnEquip = this.root.querySelector('#jts-btn-equip-slot');

      if (!jutsu.unlocked) {
        // Jutsu not unlocked - show unlock button, hide upgrade/equip
        btnUnlock.style.display = 'block';
        btnUpgrade.style.display = 'none';
        btnEquip.style.display = 'none';
        
        // Check if player can unlock more categories
        const canUnlockMore = this.unlockedCategories.length < MAX_UNLOCKED_CATEGORIES || this.unlockedCategories.includes(jutsu.element);
        btnUnlock.disabled = !canUnlockMore || this.resources.scrolls < UNLOCK_COST;
        
        if (!canUnlockMore) {
          btnUnlock.textContent = '❌ Límite Alcanzado (2/2)';
        } else {
          btnUnlock.textContent = `🔓 Desbloquear Jutsu (${UNLOCK_COST} 📗)`;
        }
      } else {
        // Jutsu unlocked - hide unlock button, show upgrade/equip
        btnUnlock.style.display = 'none';
        btnUpgrade.style.display = 'block';
        btnEquip.style.display = 'block';

        if (stats.isMax) {
          btnUpgrade.disabled = true;
          btnUpgrade.textContent = '✦ NIVEL MÁXIMO ✦';
        } else {
          const costScrolls = this.calculateUpgradeCost(jutsu.currentLevel);
          btnUpgrade.disabled = this.resources.scrolls < costScrolls;
          btnUpgrade.textContent = `⬆ Mejorar (${costScrolls} 📗)`;
        }

        btnEquip.textContent = this.equipped.includes(jutsuId) ? 'Desequipar' : 'Equipar';
      }

      this.updateResourceDisplay();
      this.root.querySelector('#jts-detail-overlay').classList.add('active');
    },

    closeDetail() {
      this.root.querySelector('#jts-detail-overlay').classList.remove('active');
      this.selectedJutsuId = null;
    },

    unlockCategory() {
      if (this.selectedJutsuId === null) return;
      const jutsu = JUTSU_DB.find((entry) => entry.id === this.selectedJutsuId);
      if (!jutsu) return;
      if (jutsu.unlocked) return;

      // Check if player can unlock more categories
      const categoryAlreadyUnlocked = this.unlockedCategories.includes(jutsu.element);
      const canUnlockMore = this.unlockedCategories.length < MAX_UNLOCKED_CATEGORIES;

      if (!categoryAlreadyUnlocked && !canUnlockMore) {
        alert('Ya has desbloqueado el máximo de 2 categorías de Jutsus.');
        return;
      }

      if (this.resources.scrolls < UNLOCK_COST) {
        alert('No tienes suficientes pergaminos (📗) para desbloquear este Jutsu.');
        return;
      }

      // Unlock all jutsus in this category
      this.resources.scrolls -= UNLOCK_COST;
      JUTSU_DB.forEach(j => {
        if (j.element === jutsu.element) {
          j.unlocked = true;
        }
      });

      if (!categoryAlreadyUnlocked) {
        this.unlockedCategories.push(jutsu.element);
      }

      this.renderLibrary();
      this.updateResourceDisplay();
      this.openDetail(this.selectedJutsuId);
    },

    calculateUpgradeCost(currentLevel) {
      // Base cost is 25 scrolls
      // Random factor between 20-30 multiplied by next level
      const randomFactor = randomInt(20, 30);
      const nextLevel = currentLevel + 1;
      return 25 + (randomFactor * nextLevel);
    },

    upgradeJutsu() {
      if (this.selectedJutsuId === null) return;
      const jutsu = JUTSU_DB.find((entry) => entry.id === this.selectedJutsuId);
      if (!jutsu || !jutsu.unlocked) return;
      const stats = this.getStats(jutsu);
      if (stats.isMax) return;

      const costScrolls = this.calculateUpgradeCost(jutsu.currentLevel);
      if (this.resources.scrolls < costScrolls) return;

      this.resources.scrolls -= costScrolls;
      jutsu.currentLevel += 1;
      // Random damage increase between 10-20
      jutsu.baseDamage += randomInt(10, 20);
      // Random MP cost increase between 7-15
      jutsu.mpCost += randomInt(7, 15);

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
      this.root.querySelector('#jts-header-scrolls').textContent = String(this.resources.scrolls);
    },

    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    },

    getEquippedJutsusBattleData() {
      return this.equipped
        .map((jutsuId) => JUTSU_DB.find((entry) => entry.id === jutsuId))
        .filter(Boolean)
        .map((jutsu) => {
          const stats = this.getStats(jutsu);
          return {
            id: jutsu.id,
            name: jutsu.name,
            icon: jutsu.icon,
            element: jutsu.element,
            damage: stats.damage,
            mpCost: stats.mpCost,
            cooldown: stats.cd,
            sphereColor: jutsu.sphereColor
          };
        });
    },

    getEnemyEquippedJutsusBattleData(limit = 3) {
      const maxSlots = Math.max(1, Math.min(3, Number(limit) || 3));
      const unlockedPool = JUTSU_DB.filter((jutsu) => jutsu.unlocked);
      const sourcePool = unlockedPool.length > 0 ? unlockedPool : JUTSU_DB.slice();
      const shuffled = sourcePool
        .map((entry) => ({ entry, sortKey: Math.random() }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .slice(0, maxSlots)
        .map(({ entry }) => entry);

      return shuffled.map((jutsu) => {
        const stats = this.getStats(jutsu);
        return {
          id: jutsu.id,
          name: jutsu.name,
          icon: jutsu.icon,
          element: jutsu.element,
          damage: stats.damage,
          mpCost: stats.mpCost,
          cooldown: stats.cd,
          sphereColor: jutsu.sphereColor
        };
      });
    },

    consumeMpForJutsu(jutsuId) {
      const jutsu = JUTSU_DB.find((entry) => entry.id === jutsuId);
      if (!jutsu || !window.GameState || typeof window.GameState.consumeMp !== 'function') return false;
      const cost = this.getStats(jutsu).mpCost;
      return window.GameState.consumeMp(cost);
    },

    addScrolls(amount) {
      this.resources.scrolls += amount;
      this.updateResourceDisplay();
    },

    getUnlockedCategories() {
      return this.unlockedCategories;
    }
  };

  window.JutsuSystem = JutsuSystem;
})();
