(function () {
  // New Jutsu Database organized by element categories
  const JUTSU_DB = [
    // 🔥 Fuego (Fire)
    { id: 0, name: 'Bola Fuego', icon: '🔥', element: 'fire', baseDamage: 70, baseEffect: 'Quemadura (Baja -10% HP al enemigo durante 3 segundos)', baseBuff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false },
    { id: 1, name: 'Llama Fénix', icon: '🔥', element: 'fire', baseDamage: 80, baseEffect: 'Baja Evasión del enemigo en -30% durante 4 segundos', baseBuff: '', baseCD: 3, currentLevel: 1, mpCost: 28, unlocked: false },
    { id: 2, name: 'Lanza Ígnea', icon: '🔥', element: 'fire', baseDamage: 60, baseEffect: 'Baja Defensa del enemigo -25% durante 4 segundos', baseBuff: '', baseCD: 3, currentLevel: 1, mpCost: 22, unlocked: false },
    { id: 3, name: 'Explosión Calor', icon: '🔥', element: 'fire', baseDamage: 73, baseEffect: 'Aturdir al enemigo (Stun) por 4 segundos', baseBuff: '', baseCD: 4, currentLevel: 1, mpCost: 30, unlocked: false },
    
    // 🌪️ Viento (Wind)
    { id: 4, name: 'Ráfaga Veloz', icon: '🌪️', element: 'wind', baseDamage: 60, baseEffect: 'Aumenta Evasión en +15% durante 4 segundos', baseBuff: '+15% Evasión', baseCD: 3, currentLevel: 1, mpCost: 22, unlocked: false },
    { id: 5, name: 'Shuriken Viento', icon: '🌪️', element: 'wind', baseDamage: 70, baseEffect: 'Hemorragia Grave al enemigo -25% HP', baseBuff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false },
    { id: 6, name: 'Cuchilla Vacío', icon: '🌪️', element: 'wind', baseDamage: 73, baseEffect: 'Ignorar la Defensa del enemigo -20%', baseBuff: '', baseCD: 3, currentLevel: 1, mpCost: 27, unlocked: false },
    { id: 7, name: 'Gran Torbellino', icon: '🌪️', element: 'wind', baseDamage: 80, baseEffect: 'Desorientar Enemigo no ataca durante 4 segundos', baseBuff: '', baseCD: 4, currentLevel: 1, mpCost: 30, unlocked: false },
    
    // ⚡ Trueno (Lightning)
    { id: 8, name: 'Cuchilla Rayo', icon: '⚡', element: 'lightning', baseDamage: 70, baseEffect: 'Perforar Defensa del enemigo -35% durante 4 segundos', baseBuff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false },
    { id: 9, name: 'Armadura Rayo', icon: '⚡', element: 'lightning', baseDamage: 60, baseEffect: 'Aumenta Agilidad en +40% durante 4 segundos', baseBuff: '+40% Agilidad', baseCD: 3, currentLevel: 1, mpCost: 22, unlocked: false },
    { id: 10, name: 'Rayo Veloz', icon: '⚡', element: 'lightning', baseDamage: 80, baseEffect: 'Aumenta El Crítico en +40%', baseBuff: '+40% Crítico', baseCD: 3, currentLevel: 1, mpCost: 28, unlocked: false },
    { id: 11, name: 'Trueno Astral', icon: '⚡', element: 'lightning', baseDamage: 73, baseEffect: 'Aturdir al enemigo durante 4 segundos', baseBuff: '', baseCD: 4, currentLevel: 1, mpCost: 30, unlocked: false },
    
    // 🪨 Roca (Earth)
    { id: 12, name: 'Roca Sólida', icon: '🪨', element: 'earth', baseDamage: 80, baseEffect: 'Aumenta Defensa en 45% durante 4 segundos', baseBuff: '+45% Defensa', baseCD: 3, currentLevel: 1, mpCost: 28, unlocked: false },
    { id: 13, name: 'Armadura Arena', icon: '🪨', element: 'earth', baseDamage: 60, baseEffect: 'Absorción Daño en 40%', baseBuff: '40% Absorción', baseCD: 3, currentLevel: 1, mpCost: 22, unlocked: false },
    { id: 14, name: 'Domo Tierra', icon: '🪨', element: 'earth', baseDamage: 70, baseEffect: 'Baja Defensa del enemigo 25% durante 4 segundos', baseBuff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false },
    { id: 15, name: 'Muro Piedra', icon: '🪨', element: 'earth', baseDamage: 67, baseEffect: 'Regenera 17% HP durante 4 segundos', baseBuff: 'Regeneración HP', baseCD: 4, currentLevel: 1, mpCost: 27, unlocked: false },
    
    // 🌊 Agua (Water)
    { id: 16, name: 'Gran Catarata', icon: '🌊', element: 'water', baseDamage: 60, baseEffect: 'Recuperación de MP 20% durante 3 segundos', baseBuff: '+20% MP', baseCD: 3, currentLevel: 1, mpCost: 22, unlocked: false },
    { id: 17, name: 'Prisión Agua', icon: '🌊', element: 'water', baseDamage: 67, baseEffect: 'Restricción al enemigo (No mover) durante 4 segundos', baseBuff: '', baseCD: 3, currentLevel: 1, mpCost: 25, unlocked: false },
    { id: 18, name: 'Tsunami Devastador', icon: '🌊', element: 'water', baseDamage: 80, baseEffect: 'Reducción MP al enemigo 15% durante 3 segundos', baseBuff: '', baseCD: 4, currentLevel: 1, mpCost: 30, unlocked: false },
    { id: 19, name: 'Tiburón Hambriento', icon: '🌊', element: 'water', baseDamage: 70, baseEffect: 'Robo de Chakra al enemigo 10% durante 3 segundos', baseBuff: 'Robo Chakra', baseCD: 3, currentLevel: 1, mpCost: 27, unlocked: false }
  ];

  const ELEMENT_CATEGORIES = ['fire', 'wind', 'lightning', 'earth', 'water'];
  const ELEMENT_EMOJIS = { fire: '🔥', wind: '🌪️', lightning: '⚡', earth: '🪨', water: '🌊' };
  const UNLOCK_COST = 25;
  const MAX_UNLOCKED_CATEGORIES = 2;

  const JutsuSystem = {
    host: null,
    root: null,
    resources: { scrolls: 100 },
    equipped: [null, null, null],
    selectedJutsuId: null,
    selectedCategory: 'fire',
    unlockedCategories: [],

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
      const damage = Math.round(jutsu.baseDamage);
      const cd = jutsu.baseCD;
      const mpCost = Math.round(jutsu.mpCost);
      return { damage, cd, mpCost, level: lvl, unlocked: jutsu.unlocked };
    },

    bindEvents() {
      this.root.querySelector('#jts-popup-close')?.addEventListener('click', () => this.closeDetail());
      this.root.querySelector('#jts-detail-overlay')?.addEventListener('click', (event) => {
        if (event.target === this.root.querySelector('#jts-detail-overlay')) this.closeDetail();
      });
      this.root.querySelector('#jts-btn-unlock')?.addEventListener('click', () => this.unlockCategory());
      this.root.querySelector('#jts-btn-equip-slot')?.addEventListener('click', () => {
        if (this.equipped.includes(this.selectedJutsuId)) this.unequipFromPopup();
        else this.equipFromPopup();
      });
      
      // Category tab buttons
      this.root.querySelectorAll('.jts-cat-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          const element = tab.dataset.element;
          this.selectCategory(element);
        });
      });
    },

    selectCategory(element) {
      // Check if category is locked (player already has 2 unlocked categories and this one isn't one of them)
      if (!this.unlockedCategories.includes(element) && this.unlockedCategories.length >= MAX_UNLOCKED_CATEGORIES) {
        return; // Can't select locked categories
      }
      
      this.selectedCategory = element;
      
      // Update active tab
      this.root.querySelectorAll('.jts-cat-tab').forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.element === element);
      });
      
      this.renderLibrary();
    },

    renderLibrary() {
      const grid = this.root.querySelector('#jts-library-grid');
      if (!grid) return;
      grid.innerHTML = '';

      // Filter jutsus by selected category
      const filteredJutsus = JUTSU_DB.filter(jutsu => jutsu.element === this.selectedCategory);

      filteredJutsus.forEach((jutsu) => {
        const cell = document.createElement('div');
        cell.className = 'jts-cell';
        cell.dataset.id = String(jutsu.id);
        cell.dataset.unlocked = jutsu.unlocked ? 'true' : 'false';
        
        // Show lock overlay if not unlocked
        const lockOverlay = jutsu.unlocked ? '' : '<div class="jts-lock-overlay">🔒 Bloqueado</div>';
        
        cell.innerHTML = `
          <span class="jts-icon">${jutsu.icon}</span>
          <span class="jts-name">${jutsu.name}</span>
          ${lockOverlay}
        `;

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
    },

    renderSlot(slotIdx) {
      const slotEl = this.root.querySelector(`#jts-slot-${slotIdx}`);
      if (!slotEl) return;

      const jutsuId = this.equipped[slotIdx];
      slotEl.classList.remove('jts-is-empty', 'jts-is-filled');

      if (jutsuId === null) {
        slotEl.classList.add('jts-is-empty');
        slotEl.querySelector('.jts-slot-inner').innerHTML = '<div class="jts-slot-empty-text">⊕</div><div class="jts-slot-name">Vacío</div>';
        return;
      }

      const jutsu = JUTSU_DB.find((entry) => entry.id === jutsuId);
      if (!jutsu) return;

      slotEl.classList.add('jts-is-filled');
      slotEl.querySelector('.jts-slot-inner').innerHTML = `<div class="jts-slot-icon">${jutsu.icon}</div><div class="jts-slot-name">${jutsu.name}</div>`;
    },

    renderAllSlots() {
      for (let index = 0; index < this.equipped.length; index += 1) this.renderSlot(index);
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
      this.root.querySelector('#jts-popup-effect').textContent = jutsu.baseEffect || 'N/A';
      this.root.querySelector('#jts-popup-buff').textContent = jutsu.baseBuff || 'N/A';
      this.root.querySelector('#jts-popup-cd').textContent = `${stats.cd}s · MP ${stats.mpCost}`;

      const btnUnlock = this.root.querySelector('#jts-btn-unlock');
      const btnEquip = this.root.querySelector('#jts-btn-equip-slot');
      
      if (jutsu.unlocked) {
        btnUnlock.style.display = 'none';
        btnEquip.disabled = false;
        btnEquip.textContent = this.equipped.includes(jutsuId) ? 'Desequipar' : 'Equipar';
      } else {
        btnUnlock.style.display = 'block';
        btnUnlock.disabled = this.resources.scrolls < UNLOCK_COST;
        btnUnlock.textContent = `🔓 Desbloquear (${UNLOCK_COST} 📗)`;
        btnEquip.disabled = true;
        btnEquip.textContent = 'Bloqueado';
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
      if (!jutsu || jutsu.unlocked) return;
      
      // Check if player can unlock more categories
      const categoryElement = jutsu.element;
      if (!this.unlockedCategories.includes(categoryElement) && this.unlockedCategories.length >= MAX_UNLOCKED_CATEGORIES) {
        alert('Ya has alcanzado el máximo de 2 categorías de Jutsus desbloqueadas.');
        return;
      }
      
      if (this.resources.scrolls < UNLOCK_COST) return;

      this.resources.scrolls -= UNLOCK_COST;
      
      // Unlock all jutsus in this category
      JUTSU_DB.forEach((j) => {
        if (j.element === categoryElement) {
          j.unlocked = true;
        }
      });
      
      // Add category to unlocked list
      if (!this.unlockedCategories.includes(categoryElement)) {
        this.unlockedCategories.push(categoryElement);
      }

      this.renderLibrary();
      this.openDetail(this.selectedJutsuId);
      this.updateResourceDisplay();
    },

    equipFromPopup() {
      if (this.selectedJutsuId === null) return;
      const jutsu = JUTSU_DB.find((entry) => entry.id === this.selectedJutsuId);
      if (!jutsu || !jutsu.unlocked) return;
      
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
      const scrollDisplays = this.root.querySelectorAll('#jts-res-scrolls, #jts-res-scrolls-count');
      scrollDisplays.forEach(el => {
        if (el) el.textContent = String(this.resources.scrolls);
      });
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
            damage: stats.damage,
            mpCost: stats.mpCost,
            cooldown: stats.cd
          };
        });
    },

    consumeMpForJutsu(jutsuId) {
      const jutsu = JUTSU_DB.find((entry) => entry.id === jutsuId);
      if (!jutsu || !window.GameState || typeof window.GameState.consumeMp !== 'function') return false;
      const cost = this.getStats(jutsu).mpCost;
      return window.GameState.consumeMp(cost);
    }
  };

  window.JutsuSystem = JutsuSystem;
})();
