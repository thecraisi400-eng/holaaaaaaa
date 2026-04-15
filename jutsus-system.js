(function () {
  // Base de datos de Jutsus organizada por categorías
  const JUTSU_CATEGORIES = {
    fire: {
      name: 'Fuego',
      icon: '🔥',
      color: '#ff4b4b',
      skills: [
        { id: 'fire_1', name: 'Bola Fuego', baseDamage: 70, effect: 'Quemadura (Baja -10% HP al enemigo durante 3 segundos)', buff: '', mpCost: 25, cooldown: 3 },
        { id: 'fire_2', name: 'Llama Fénix', baseDamage: 80, effect: 'Baja Evasión del enemigo en -30% durante 4 segundos', buff: '', mpCost: 25, cooldown: 3 },
        { id: 'fire_3', name: 'Lanza Ígnea', baseDamage: 60, effect: 'Baja Defensa del enemigo -25% durante 4 segundos', buff: '', mpCost: 25, cooldown: 3 },
        { id: 'fire_4', name: 'Explosión Calor', baseDamage: 73, effect: 'Aturdir al enemigo (Stun) al 4 segundos', buff: '', mpCost: 25, cooldown: 3 }
      ]
    },
    wind: {
      name: 'Viento',
      icon: '🌪️',
      color: '#ffffff',
      skills: [
        { id: 'wind_1', name: 'Ráfaga Veloz', baseDamage: 60, effect: 'Aumenta Evasion en +15% durante 4 segundos', buff: '+15% Evación', mpCost: 25, cooldown: 3 },
        { id: 'wind_2', name: 'Shuriken Viento', baseDamage: 70, effect: 'Hemorragia Grave al enemigo -25% HP', buff: '', mpCost: 25, cooldown: 3 },
        { id: 'wind_3', name: 'Cuchilla Vacío', baseDamage: 73, effect: 'Ignorar la Defensa del enemigo -20%', buff: '', mpCost: 25, cooldown: 3 },
        { id: 'wind_4', name: 'Gran Torbellino', baseDamage: 80, effect: 'Desorientar Enemigo no ataca durante 4 segundos', buff: '', mpCost: 25, cooldown: 3 }
      ]
    },
    lightning: {
      name: 'Trueno',
      icon: '⚡',
      color: '#ffd700',
      skills: [
        { id: 'lightning_1', name: 'Cuchilla Rayo', baseDamage: 70, effect: 'Perforar Defensa del enemigo -35% durante 4 segundos', buff: '', mpCost: 25, cooldown: 3 },
        { id: 'lightning_2', name: 'Armadura Rayo', baseDamage: 60, effect: 'Aumenta Agilidad en +40% durante 4 segundos', buff: '+40% Agilidad', mpCost: 25, cooldown: 3 },
        { id: 'lightning_3', name: 'Rayo Veloz', baseDamage: 80, effect: 'Aumenta El Crítico en +40%', buff: '+40% Crítico', mpCost: 25, cooldown: 3 },
        { id: 'lightning_4', name: 'Trueno Astral', baseDamage: 73, effect: 'Aturdir al enemigo durante 4 segundos', buff: '', mpCost: 25, cooldown: 3 }
      ]
    },
    earth: {
      name: 'Roca',
      icon: '🪨',
      color: '#8b8b8b',
      skills: [
        { id: 'earth_1', name: 'Roca Sólida', baseDamage: 80, effect: 'Aumenta Defensa en 45% durante 4 segundos', buff: '+45% Defensa', mpCost: 25, cooldown: 3 },
        { id: 'earth_2', name: 'Armadura Arena', baseDamage: 60, effect: 'Absorción Daño en 40%', buff: '40% Absorción', mpCost: 25, cooldown: 3 },
        { id: 'earth_3', name: 'Domo Tierra', baseDamage: 70, effect: 'Baja Defensa del enemigo 25% durante 4 segundos', buff: '', mpCost: 25, cooldown: 3 },
        { id: 'earth_4', name: 'Muro Piedra', baseDamage: 67, effect: 'Regenera 17% HP durante 4 segundos', buff: 'Regen 17% HP', mpCost: 25, cooldown: 3 }
      ]
    },
    water: {
      name: 'Agua',
      icon: '🌊',
      color: '#4b8bff',
      skills: [
        { id: 'water_1', name: 'Gran Catarata', baseDamage: 60, effect: 'Recuperación de MP 20% durante 3 segundo', buff: 'Recup 20% MP', mpCost: 25, cooldown: 3 },
        { id: 'water_2', name: 'Prisión Agua', baseDamage: 67, effect: 'Restricción al al enemigo (No mover) durante 4 segundos', buff: '', mpCost: 25, cooldown: 3 },
        { id: 'water_3', name: 'Torrente Brutal', baseDamage: 80, effect: 'Reducción MP al enemigo 15% durante 3 segundos', buff: '', mpCost: 25, cooldown: 3 },
        { id: 'water_4', name: 'Tiburón Hambriento', baseDamage: 70, effect: 'Robo de Chakra al enemigo 10% durante 3 segundos', buff: 'Robo 10% Chakra', mpCost: 25, cooldown: 3 }
      ]
    }
  };

  const MAX_LEVEL = 10;
  const UNLOCK_COST = 25; // Costo para desbloquear un jutsu
  const MAX_CLASSES = 2; // Máximo de clases que puede seleccionar el jugador

  const randomInt = (min, max) => Math.floor(Math.random() * ((max - min) + 1)) + min;

  const JutsuSystem = {
    host: null,
    root: null,
    resources: { scrolls: 100 }, // Inicia con 100 pergaminos
    equipped: [null, null, null],
    selectedJutsuId: null,
    selectedCategory: 'fire',
    unlockedSkills: {}, // Skills desbloqueadas: { skillId: { level: 1, damage: X, mpCost: Y } }
    unlockedCategories: [], // Categorías desbloqueadas (máximo 2)
    
    // Inicializa el estado guardado
    loadState() {
      const saved = localStorage.getItem('jutsuSystemState');
      if (saved) {
        const state = JSON.parse(saved);
        this.resources.scrolls = state.scrolls || 100;
        this.unlockedSkills = state.unlockedSkills || {};
        this.unlockedCategories = state.unlockedCategories || [];
        this.equipped = state.equipped || [null, null, null];
      }
    },
    
    // Guarda el estado
    saveState() {
      const state = {
        scrolls: this.resources.scrolls,
        unlockedSkills: this.unlockedSkills,
        unlockedCategories: this.unlockedCategories,
        equipped: this.equipped
      };
      localStorage.setItem('jutsuSystemState', JSON.stringify(state));
    },

    mount() {
      if (this.isMounted()) return;
      this.host = document.getElementById('hero-system-host');
      const tpl = document.getElementById('jutsuSystemTemplate');
      if (!this.host || !tpl) return;

      this.loadState();
      
      this.host.innerHTML = '';
      this.host.appendChild(tpl.content.cloneNode(true));
      this.root = this.host.querySelector('#jts-core');

      this.renderCategorySelector();
      this.renderLibrary();
      this.initDropZones();
      this.renderAllSlots();
      this.bindEvents();
      this.updateResourceDisplay();
      this.updateClassesCount();
    },

    unmount() {
      if (!this.host) return;
      this.saveState();
      this.host.innerHTML = '';
      this.root = null;
      this.selectedJutsuId = null;
    },

    isMounted() {
      return Boolean(this.host && this.root && this.host.contains(this.root));
    },

    getStats(skillId) {
      const skillData = this.unlockedSkills[skillId];
      if (!skillData) return null;
      
      return {
        damage: skillData.damage,
        mpCost: skillData.mpCost,
        level: skillData.level,
        isMax: skillData.level >= MAX_LEVEL
      };
    },

    bindEvents() {
      // Selector de categorías
      this.root.querySelectorAll('.jts-cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const element = e.target.dataset.element;
          if (element && !e.target.classList.contains('locked')) {
            this.selectCategory(element);
          }
        });
      });

      this.root.querySelector('#jts-popup-close')?.addEventListener('click', () => this.closeDetail());
      this.root.querySelector('#jts-detail-overlay')?.addEventListener('click', (event) => {
        if (event.target === this.root.querySelector('#jts-detail-overlay')) this.closeDetail();
      });
      this.root.querySelector('#jts-btn-upgrade')?.addEventListener('click', () => this.upgradeJutsu());
      this.root.querySelector('#jts-btn-unlock')?.addEventListener('click', () => this.unlockJutsu());
      this.root.querySelector('#jts-btn-equip-slot')?.addEventListener('click', () => {
        if (this.equipped.includes(this.selectedJutsuId)) this.unequipFromPopup();
        else this.equipFromPopup();
      });
    },

    selectCategory(category) {
      this.selectedCategory = category;
      
      // Actualizar botones de categoría
      this.root.querySelectorAll('.jts-cat-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.element === category) {
          btn.classList.add('active');
        }
      });

      // Actualizar header
      const catData = JUTSU_CATEGORIES[category];
      this.root.querySelector('#jts-current-element-icon').textContent = catData.icon;
      this.root.querySelector('#jts-current-element-name').textContent = `Habilidades ${catData.name}`;

      this.renderLibrary();
    },

    renderCategorySelector() {
      const buttons = this.root.querySelectorAll('.jts-cat-btn');
      buttons.forEach(btn => {
        const element = btn.dataset.element;
        const isUnlocked = this.unlockedCategories.includes(element);
        const isActive = element === this.selectedCategory;
        
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('locked', !isUnlocked && this.unlockedCategories.length >= MAX_CLASSES);
        
        // Si ya tiene 2 clases y esta no está desbloqueada, bloquearla
        if (!isUnlocked && this.unlockedCategories.length >= MAX_CLASSES) {
          btn.classList.add('locked');
        }
      });
    },

    renderLibrary() {
      const grid = this.root.querySelector('#jts-library-grid');
      if (!grid) return;
      grid.innerHTML = '';

      const category = JUTSU_CATEGORIES[this.selectedCategory];
      if (!category) return;

      category.skills.forEach((skill) => {
        const stats = this.getStats(skill.id);
        const isUnlocked = !!this.unlockedSkills[skill.id];
        
        const cell = document.createElement('div');
        cell.className = `jts-cell${!isUnlocked ? ' locked' : ''}`;
        cell.dataset.element = this.selectedCategory;
        cell.dataset.id = skill.id;
        
        if (stats) {
          cell.dataset.level = stats.isMax ? 'max' : String(stats.level);
        }

        const levelDisplay = stats ? (stats.isMax ? '仙' : `Lv.${stats.level}`) : '🔒';
        
        cell.innerHTML = `
          <span class="jts-level-badge">${levelDisplay}</span>
          <span class="jts-icon">${category.icon}</span>
          <span class="jts-name">${skill.name}</span>
          ${!isUnlocked ? `<span class="jts-unlock-badge">🔒 ${UNLOCK_COST} 📗</span>` : `<span class="jts-unlocked-badge">✓</span>`}
        `;

        cell.addEventListener('click', () => this.openDetail(skill.id));
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
          const jutsuId = event.dataTransfer.getData('text/plain');
          const slotIdx = Number(slot.dataset.slot);
          if (!jutsuId || !Number.isFinite(slotIdx)) return;
          this.equipToSlot(jutsuId, slotIdx);
        });
      });
    },

    equipToSlot(jutsuId, slotIdx) {
      if (!this.unlockedSkills[jutsuId]) return; // Solo puede equipar si está desbloqueado
      if (this.equipped[slotIdx] === jutsuId) return;

      const existingSlot = this.equipped.indexOf(jutsuId);
      if (existingSlot !== -1 && existingSlot !== slotIdx) {
        this.equipped[existingSlot] = null;
        this.renderSlot(existingSlot);
      }

      this.equipped[slotIdx] = jutsuId;
      this.renderSlot(slotIdx);
      this.saveState();
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

      // Encontrar el skill en todas las categorías
      let skill = null;
      let category = null;
      for (const catKey in JUTSU_CATEGORIES) {
        const found = JUTSU_CATEGORIES[catKey].skills.find(s => s.id === jutsuId);
        if (found) {
          skill = found;
          category = JUTSU_CATEGORIES[catKey];
          break;
        }
      }

      if (!skill) return;
      const stats = this.getStats(jutsuId);

      slotEl.classList.add(stats && stats.isMax ? 'jts-is-sennin' : 'jts-is-filled');
      slotEl.querySelector('.jts-slot-inner').innerHTML = `<div class="jts-slot-icon">${category.icon}</div><div class="jts-slot-name">${skill.name}</div>`;
      
      // Aplicar color según elemento
      const ring = slotEl.querySelector('.jts-slot-ring');
      if (ring) {
        ring.style.borderColor = category.color;
        ring.style.boxShadow = `0 0 10px ${category.color}40`;
      }
    },

    renderAllSlots() {
      for (let index = 0; index < this.equipped.length; index += 1) this.renderSlot(index);
    },

    openDetail(jutsuId) {
      this.selectedJutsuId = jutsuId;
      
      // Encontrar el skill en todas las categorías
      let skill = null;
      let category = null;
      for (const catKey in JUTSU_CATEGORIES) {
        const found = JUTSU_CATEGORIES[catKey].skills.find(s => s.id === jutsuId);
        if (found) {
          skill = found;
          category = JUTSU_CATEGORIES[catKey];
          break;
        }
      }
      
      if (!skill) return;
      
      const stats = this.getStats(jutsuId);
      const isUnlocked = !!this.unlockedSkills[jutsuId];

      this.root.querySelector('#jts-popup-icon').textContent = category.icon;
      this.root.querySelector('#jts-popup-name').textContent = skill.name;
      this.root.querySelector('#jts-popup-element').textContent = `Elemento: ${category.name}`;
      
      if (isUnlocked && stats) {
        this.root.querySelector('#jts-popup-damage').textContent = String(stats.damage);
        this.root.querySelector('#jts-popup-mp').textContent = String(stats.mpCost);
        this.root.querySelector('#jts-popup-cd').textContent = `${skill.cooldown}s`;
      } else {
        this.root.querySelector('#jts-popup-damage').textContent = String(skill.baseDamage);
        this.root.querySelector('#jts-popup-mp').textContent = String(skill.mpCost);
        this.root.querySelector('#jts-popup-cd').textContent = `${skill.cooldown}s`;
      }
      
      this.root.querySelector('#jts-popup-effect').textContent = skill.effect;
      this.root.querySelector('#jts-popup-buff').textContent = skill.buff || '—';

      const levelEl = this.root.querySelector('#jts-popup-level');
      const popupEl = this.root.querySelector('#jts-detail-popup');
      const passiveEl = this.root.querySelector('#jts-popup-passive');
      
      if (stats && stats.isMax) {
        levelEl.textContent = '仙 SENNIN';
        levelEl.classList.add('max');
        popupEl.classList.add('jts-sennin-popup');
        passiveEl.classList.add('visible');
      } else if (isUnlocked && stats) {
        levelEl.textContent = `Lv. ${stats.level} / ${MAX_LEVEL}`;
        levelEl.classList.remove('max');
        popupEl.classList.remove('jts-sennin-popup');
        passiveEl.classList.remove('visible');
      } else {
        levelEl.textContent = 'BLOQUEADO';
        levelEl.classList.remove('max');
        popupEl.classList.remove('jts-sennin-popup');
        passiveEl.classList.remove('visible');
      }

      // Botón de desbloquear
      const btnUnlock = this.root.querySelector('#jts-btn-unlock');
      const btnUpgrade = this.root.querySelector('#jts-btn-upgrade');
      const btnEquip = this.root.querySelector('#jts-btn-equip-slot');
      
      if (!isUnlocked) {
        btnUnlock.disabled = this.resources.scrolls < UNLOCK_COST;
        btnUnlock.textContent = `🔓 Desbloquear · 📗 ${UNLOCK_COST}`;
        btnUnlock.style.display = 'block';
        btnUpgrade.disabled = true;
        btnUpgrade.textContent = 'Bloqueado';
        btnEquip.disabled = true;
        btnEquip.textContent = 'Bloqueado';
      } else if (stats && stats.isMax) {
        btnUnlock.style.display = 'none';
        btnUpgrade.disabled = true;
        btnUpgrade.textContent = '✦ NIVEL MÁXIMO ✦';
        btnEquip.disabled = false;
        btnEquip.textContent = this.equipped.includes(jutsuId) ? 'Desequipar' : 'Equipar';
      } else {
        btnUnlock.style.display = 'none';
        const upgradeCost = this.getUpgradeCost(stats.level);
        btnUpgrade.disabled = this.resources.scrolls < upgradeCost;
        btnUpgrade.textContent = `⬆ Mejorar · 📗 ${upgradeCost}`;
        btnEquip.disabled = false;
        btnEquip.textContent = this.equipped.includes(jutsuId) ? 'Desequipar' : 'Equipar';
      }

      this.updateResourceDisplay();
      this.root.querySelector('#jts-detail-overlay').classList.add('active');
    },

    closeDetail() {
      this.root.querySelector('#jts-detail-overlay').classList.remove('active');
      this.selectedJutsuId = null;
    },

    getUpgradeCost(currentLevel) {
      // Fórmula: 25 + random(20-30) * nivel_siguiente
      const baseCost = 25;
      const randomFactor = randomInt(20, 30);
      const nextLevel = currentLevel + 1;
      return baseCost + (randomFactor * nextLevel);
    },

    unlockJutsu() {
      if (!this.selectedJutsuId) return;
      if (this.unlockedSkills[this.selectedJutsuId]) return; // Ya está desbloqueado
      if (this.resources.scrolls < UNLOCK_COST) return;

      // Verificar si la categoría está desbloqueada
      if (!this.unlockedCategories.includes(this.selectedCategory)) {
        if (this.unlockedCategories.length >= MAX_CLASSES) {
          alert('Ya has seleccionado el máximo de 2 clases de jutsus.');
          return;
        }
        // Desbloquear la categoría
        this.unlockedCategories.push(this.selectedCategory);
      }

      // Desbloquear el skill
      this.resources.scrolls -= UNLOCK_COST;
      
      // Encontrar el skill base
      let skill = null;
      for (const catKey in JUTSU_CATEGORIES) {
        const found = JUTSU_CATEGORIES[catKey].skills.find(s => s.id === this.selectedJutsuId);
        if (found) {
          skill = found;
          break;
        }
      }

      if (skill) {
        this.unlockedSkills[this.selectedJutsuId] = {
          level: 1,
          damage: skill.baseDamage,
          mpCost: skill.mpCost
        };
      }

      this.renderLibrary();
      this.renderCategorySelector();
      this.updateResourceDisplay();
      this.updateClassesCount();
      this.openDetail(this.selectedJutsuId);
      this.saveState();
    },

    upgradeJutsu() {
      if (!this.selectedJutsuId) return;
      const skillData = this.unlockedSkills[this.selectedJutsuId];
      if (!skillData) return;
      if (skillData.level >= MAX_LEVEL) return;

      const cost = this.getUpgradeCost(skillData.level);
      if (this.resources.scrolls < cost) return;

      // Incrementar stats aleatoriamente
      const damageIncrease = randomInt(10, 20);
      const mpIncrease = randomInt(7, 15);

      this.resources.scrolls -= cost;
      skillData.level += 1;
      skillData.damage += damageIncrease;
      skillData.mpCost += mpIncrease;

      this.renderLibrary();
      this.renderAllSlots();
      this.openDetail(this.selectedJutsuId);
      this.saveState();
    },

    equipFromPopup() {
      if (!this.selectedJutsuId) return;
      if (!this.unlockedSkills[this.selectedJutsuId]) return;
      
      const emptySlot = this.equipped.indexOf(null);
      if (emptySlot !== -1) {
        this.equipToSlot(this.selectedJutsuId, emptySlot);
      } else {
        this.equipToSlot(this.selectedJutsuId, 2);
      }
      this.renderAllSlots();
      this.openDetail(this.selectedJutsuId);
    },

    unequipFromPopup() {
      if (!this.selectedJutsuId) return;
      const idx = this.equipped.indexOf(this.selectedJutsuId);
      if (idx === -1) return;
      this.equipped[idx] = null;
      this.renderSlot(idx);
      this.openDetail(this.selectedJutsuId);
      this.saveState();
    },

    updateResourceDisplay() {
      this.root.querySelectorAll('#jts-res-scrolls, #jts-res-scrolls-main').forEach(el => {
        if (el) el.textContent = String(this.resources.scrolls);
      });
    },

    updateClassesCount() {
      const countEl = this.root.querySelector('#jts-classes-count');
      if (countEl) {
        countEl.textContent = this.unlockedCategories.length;
      }
    },

    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    },

    getEquippedJutsusBattleData() {
      return this.equipped
        .map((jutsuId) => {
          if (!jutsuId || !this.unlockedSkills[jutsuId]) return null;
          
          // Encontrar el skill
          let skill = null;
          let category = null;
          for (const catKey in JUTSU_CATEGORIES) {
            const found = JUTSU_CATEGORIES[catKey].skills.find(s => s.id === jutsuId);
            if (found) {
              skill = found;
              category = JUTSU_CATEGORIES[catKey];
              break;
            }
          }
          
          if (!skill) return null;
          
          const stats = this.getStats(jutsuId);
          return {
            id: jutsuId,
            name: skill.name,
            icon: category.icon,
            element: category.name.toLowerCase(),
            elementColor: category.color,
            damage: stats.damage,
            mpCost: stats.mpCost,
            cooldown: skill.cooldown
          };
        })
        .filter(Boolean);
    },

    consumeMpForJutsu(jutsuId) {
      const skillData = this.unlockedSkills[jutsuId];
      if (!skillData || !window.GameState || typeof window.GameState.consumeMp !== 'function') return false;
      const cost = skillData.mpCost;
      return window.GameState.consumeMp(cost);
    },

    // Método para obtener todos los jutsus disponibles (para visualización)
    getAllJutsus() {
      const allJutsus = [];
      for (const catKey in JUTSU_CATEGORIES) {
        JUTSU_CATEGORIES[catKey].skills.forEach(skill => {
          allJutsus.push({
            ...skill,
            category: catKey,
            categoryName: JUTSU_CATEGORIES[catKey].name,
            categoryIcon: JUTSU_CATEGORIES[catKey].icon,
            categoryColor: JUTSU_CATEGORIES[catKey].color
          });
        });
      }
      return allJutsus;
    },

    // Método para resetear el progreso (útil para testing)
    resetProgress() {
      localStorage.removeItem('jutsuSystemState');
      this.resources.scrolls = 100;
      this.unlockedSkills = {};
      this.unlockedCategories = [];
      this.equipped = [null, null, null];
      this.renderLibrary();
      this.renderCategorySelector();
      this.renderAllSlots();
      this.updateResourceDisplay();
      this.updateClassesCount();
    }
  };

  window.JutsuSystem = JutsuSystem;
})();
