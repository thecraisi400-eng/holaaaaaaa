(function () {
  const HERO_SLOT_DATA = [
    { id: 'hs-weapon1', icon: '⚔', name: 'Katana', level: 1, stat1: 'Ataque', stat1val: 680, statIcon1: '⚔', costBase: 2800 },
    { id: 'hs-weapon2', icon: '✦', name: 'Shurikens', level: 1, stat1: 'Vel. Ataque', stat1val: 195, statIcon1: '💨', costBase: 1200 },
    { id: 'hs-head', icon: '🪖', name: 'Máscara', level: 1, stat1: 'Res. Genjutsu', stat1val: 220, statIcon1: '🧠', costBase: 450 },
    { id: 'hs-chest', icon: '🥋', name: 'Túnica ANBU', level: 1, stat1: 'Defensa', stat1val: 312, statIcon1: '🛡', costBase: 5200 },
    { id: 'hs-gloves', icon: '🧤', name: 'Guanteletes', level: 1, stat1: 'Precisión', stat1val: 87, statIcon1: '◎', costBase: 1900 },
    { id: 'hs-boots', icon: '👟', name: 'Botas Ninja', level: 1, stat1: 'Velocidad', stat1val: 197, statIcon1: '💨', costBase: 780 }
  ];

  const HERO_STATS = {
    hp: 7820,
    hpMax: 10000,
    chakra: 2750,
    chakraMax: 5000,
    exp: 67400,
    expMax: 100000,
    str: 284,
    agi: 197,
    int: 156,
    luk: 88,
    def: 312,
    res: 241,
    crit: 34,
    cd: 218,
    eva: 22,
    rgHp: 145,
    regenChakra: 88,
    gold: 24850
  };

  function getRarity(level) {
    if (level <= 5) return { label: 'Madera', color: '#c8a060', glow: 'rgba(139,94,60,0.5)', border: '#8b5e3c', bg: 'rgba(139,94,60,0.18)' };
    if (level <= 15) return { label: 'Aprendiz', color: '#2ecc71', glow: 'rgba(46,204,113,0.45)', border: '#2ecc71', bg: 'rgba(46,204,113,0.12)' };
    if (level <= 30) return { label: 'Chunin', color: '#3498db', glow: 'rgba(52,152,219,0.45)', border: '#3498db', bg: 'rgba(52,152,219,0.12)' };
    if (level <= 45) return { label: 'Jonin', color: '#f1c40f', glow: 'rgba(241,196,15,0.5)', border: '#f1c40f', bg: 'rgba(241,196,15,0.12)' };
    if (level <= 60) return { label: 'ANBU', color: '#e74c3c', glow: 'rgba(231,76,60,0.5)', border: '#e74c3c', bg: 'rgba(231,76,60,0.15)' };
    return { label: 'Legendario', color: '#ffc83c', goldColor: '#ffaa33', glow: 'rgba(231,76,60,0.7)', border: '#e74c3c', bg: 'rgba(231,76,60,0.22)', extra: true };
  }

  function calcCost(slot) {
    return slot.costBase + slot.level * (slot.level * 12);
  }

  function calcStat(base, level) {
    return Math.round(base * (1 + level * 0.028));
  }

  class HeroSystem {
    constructor(rootId = 'heroSystemRoot') {
      this.root = document.getElementById(rootId);
      this.currentSlot = null;
      this.slots = HERO_SLOT_DATA.map((slot) => ({ ...slot }));

      if (!this.root) return;

      this.cacheElements();
      this.bindEvents();
      this.renderAll();
    }

    cacheElements() {
      this.goldAmount = document.getElementById('hsGoldAmount');
      this.vitalBars = document.getElementById('hsVitalBars');
      this.extraStats = document.getElementById('hsExtraStatsContainer');
      this.gearGrid = document.getElementById('hsGearGrid');
      this.overlay = document.getElementById('hsModalOverlay');
      this.modal = document.getElementById('hsModal');
      this.modalClose = document.getElementById('hsModalClose');
      this.btnUpgrade = document.getElementById('hsBtnUpgrade');
      this.spriteImage = document.getElementById('hsSpriteImage');
      this.spritePlaceholder = document.getElementById('hsSpritePlaceholder');
    }

    bindEvents() {
      this.modalClose.addEventListener('click', () => this.closeModal());
      this.overlay.addEventListener('click', (event) => {
        if (event.target === this.overlay) this.closeModal();
      });

      this.btnUpgrade.addEventListener('click', () => {
        if (!this.currentSlot || this.currentSlot.level >= 80) return;
        this.currentSlot.level += 1;
        this.renderSlots();
        this.openModal(this.currentSlot, getRarity(this.currentSlot.level));
      });
    }

    renderAll() {
      this.goldAmount.textContent = HERO_STATS.gold.toLocaleString();
      this.renderVitals();
      this.renderExtraStats();
      this.renderSlots();
      this.loadSprite('');
    }

    renderVitals() {
      const hpPercent = (HERO_STATS.hp / HERO_STATS.hpMax) * 100;
      const ckrPercent = (HERO_STATS.chakra / HERO_STATS.chakraMax) * 100;
      const expPercent = (HERO_STATS.exp / HERO_STATS.expMax) * 100;

      this.vitalBars.innerHTML = `
        <div class="hs-vital-row"><div class="hs-vital-label hs-label-hp">HP</div><div class="hs-vital-bar"><div class="hs-vital-fill hs-hp-fill" style="width:${hpPercent}%"></div></div><div class="hs-vital-val">${HERO_STATS.hp.toLocaleString()}</div></div>
        <div class="hs-vital-row"><div class="hs-vital-label hs-label-chakra">CKR</div><div class="hs-vital-bar"><div class="hs-vital-fill hs-chakra-fill" style="width:${ckrPercent}%"></div></div><div class="hs-vital-val">${HERO_STATS.chakra.toLocaleString()}</div></div>
        <div class="hs-vital-row"><div class="hs-vital-label hs-label-exp">EXP</div><div class="hs-vital-bar"><div class="hs-vital-fill hs-exp-fill" style="width:${expPercent}%"></div></div><div class="hs-vital-val">${(HERO_STATS.exp / 1000).toFixed(1)}k</div></div>
      `;
    }

    renderExtraStats() {
      this.extraStats.innerHTML = `
        <div class="hs-stat-extra-item"><span>⚔ STR</span><span class="hs-stat-extra-val">${HERO_STATS.str}</span></div>
        <div class="hs-stat-extra-item"><span>💨 AGI</span><span class="hs-stat-extra-val hs-speed">${HERO_STATS.agi}</span></div>
        <div class="hs-stat-extra-item"><span>🧠 INT</span><span class="hs-stat-extra-val">${HERO_STATS.int}</span></div>
        <div class="hs-stat-extra-item"><span>✦ LUK</span><span class="hs-stat-extra-val">${HERO_STATS.luk}</span></div>
        <div class="hs-stat-extra-item"><span>🛡 DEF</span><span class="hs-stat-extra-val hs-good">${HERO_STATS.def}</span></div>
        <div class="hs-stat-extra-item"><span>♾ RES</span><span class="hs-stat-extra-val">${HERO_STATS.res}</span></div>
        <div class="hs-stat-extra-item"><span>◎ CRI</span><span class="hs-stat-extra-val hs-crit">${HERO_STATS.crit}%</span></div>
        <div class="hs-stat-extra-item"><span>💥 CD</span><span class="hs-stat-extra-val hs-crit">${HERO_STATS.cd}%</span></div>
        <div class="hs-stat-extra-item"><span>〇 EVA</span><span class="hs-stat-extra-val hs-speed">${HERO_STATS.eva}%</span></div>
        <div class="hs-stat-extra-item"><span>♥ RgHP</span><span class="hs-stat-extra-val hs-good">+${HERO_STATS.rgHp}</span></div>
      `;
    }

    renderSlots() {
      this.gearGrid.innerHTML = '';
      this.slots.forEach((slot) => {
        const rarity = getRarity(slot.level);
        const slotElement = document.createElement('button');
        slotElement.type = 'button';
        slotElement.className = 'hs-gear-slot';
        slotElement.style.cssText = `--hs-slot-border:${rarity.border};--hs-slot-bg:${rarity.bg};--hs-slot-glow:${rarity.glow};--hs-slot-color:${rarity.color};`;
        slotElement.innerHTML = `
          ${rarity.extra ? '<div class="hs-legendary-aura"></div>' : ''}
          <div class="hs-slot-icon">${slot.icon}</div>
          <div class="hs-slot-name">${slot.name}</div>
          <div class="hs-slot-level" style="color:${rarity.extra ? (rarity.goldColor || rarity.color) : rarity.color}">Lv.${slot.level}</div>
          <div class="hs-rarity-pill" style="background:${rarity.color}22;color:${rarity.color}">${rarity.label}</div>
        `;
        slotElement.addEventListener('click', () => this.openModal(slot, rarity));
        this.gearGrid.appendChild(slotElement);
      });
    }

    openModal(slot, rarity) {
      this.currentSlot = slot;
      const cost = calcCost(slot);
      const statCurr = calcStat(slot.stat1val, slot.level);
      const statNext = calcStat(slot.stat1val, slot.level + 1);

      document.getElementById('hsMIcon').textContent = slot.icon;
      document.getElementById('hsMName').textContent = slot.name;
      document.getElementById('hsMRarity').textContent = rarity.label.toUpperCase();
      document.getElementById('hsMCost').textContent = cost.toLocaleString();
      document.getElementById('hsCompareGrid').innerHTML = `
        <div class="hs-cmp-stat">${slot.statIcon1} ${slot.stat1}</div>
        <div class="hs-cmp-current">${statCurr}</div><div class="hs-cmp-arrow">→</div><div class="hs-cmp-next">${statNext}</div>
        <div class="hs-cmp-stat">▲ Nivel</div>
        <div class="hs-cmp-current">Lv.${slot.level}</div><div class="hs-cmp-arrow">→</div><div class="hs-cmp-next">Lv.${slot.level + 1}</div>
      `;

      this.modal.style.borderColor = `${rarity.color}99`;
      this.overlay.classList.add('open');
    }

    closeModal() {
      this.overlay.classList.remove('open');
      this.currentSlot = null;
    }

    loadSprite(playerSpriteURL) {
      if (playerSpriteURL && playerSpriteURL.trim()) {
        this.spriteImage.src = playerSpriteURL;
        this.spriteImage.style.display = 'block';
        this.spritePlaceholder.style.display = 'none';
        this.spriteImage.onerror = () => {
          this.spriteImage.style.display = 'none';
          this.spritePlaceholder.style.display = 'flex';
          this.spritePlaceholder.innerHTML = '⚠️<br>Error imagen';
        };
      } else {
        this.spriteImage.style.display = 'none';
        this.spritePlaceholder.style.display = 'flex';
        this.spritePlaceholder.innerHTML = '🎴<br>SIN SPRITE';
      }
    }

    show() {
      this.root.classList.remove('hs-hidden');
    }

    hide() {
      this.root.classList.add('hs-hidden');
      this.closeModal();
    }
  }

  window.HeroSystem = HeroSystem;
})();
