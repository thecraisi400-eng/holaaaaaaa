(function () {
  const STAT_DEFS = [
    { key: 'HP', name: 'Vida', icon: '❤️', type: 'flat', color: 'good' },
    { key: 'MP', name: 'Chakra', icon: '🔵', type: 'flat', color: 'speed' },
    { key: 'ATK', name: 'Ataque', icon: '⚔️', type: 'flat' },
    { key: 'DEF', name: 'Defensa', icon: '🛡️', type: 'flat' },
    { key: 'INT', name: 'Inteligencia', icon: '🧠', type: 'flat' },
    { key: 'AGI', name: 'Agilidad', icon: '💨', type: 'flat', color: 'speed' },
    { key: 'RES', name: 'Resistencia', icon: '♾️', type: 'percent' },
    { key: 'CRT', name: 'Crítico', icon: '🎯', type: 'percent', color: 'crit' },
    { key: 'CDMG', name: 'Daño crítico', icon: '💥', type: 'percent', color: 'crit' },
    { key: 'EVA', name: 'Evasión', icon: '🌀', type: 'percent', color: 'speed' },
    { key: 'REGEN', name: 'Regeneración', icon: '✨', type: 'percent', color: 'good' },
    { key: 'LCK', name: 'Suerte', icon: '🍀', type: 'flat' }
  ];

  const FORMULA = (base, growth, category) => ({ base, growth, category });

  const CHARACTER_FORMULAS = {
    madara: { name: 'Madara Uchiha', stats: { CDMG: FORMULA(50, 1.5, 'Súper Alta'), MP: FORMULA(120, 12, 'Alta'), INT: FORMULA(18, 1.2, 'Alta'), ATK: FORMULA(20, 9, 'Alta'), HP: FORMULA(150, 15, 'Normal'), DEF: FORMULA(12, 5, 'Normal'), AGI: FORMULA(10, 2.5, 'Normal'), RES: FORMULA(8, 0.15, 'Normal'), CRT: FORMULA(4, 0.1, 'Baja'), EVA: FORMULA(1, 0.1, 'Baja'), REGEN: FORMULA(1, 0.02, 'Baja'), LCK: FORMULA(1, 0.05, 'Súper Baja') } },
    itachi: { name: 'Itachi Uchiha', stats: { INT: FORMULA(25, 1.5, 'Súper Alta'), CRT: FORMULA(8, 0.3, 'Alta'), EVA: FORMULA(5, 0.25, 'Alta'), AGI: FORMULA(15, 2.5, 'Alta'), MP: FORMULA(80, 9, 'Normal'), ATK: FORMULA(12, 7, 'Normal'), CDMG: FORMULA(20, 1.15, 'Normal'), RES: FORMULA(5, 0.13, 'Normal'), DEF: FORMULA(8, 4, 'Baja'), LCK: FORMULA(2, 0.08, 'Baja'), REGEN: FORMULA(1.5, 0.04, 'Baja'), HP: FORMULA(100, 10, 'Súper Baja') } },
    sasuke: { name: 'Sasuke Uchiha', stats: { AGI: FORMULA(20, 3, 'Súper Alta'), ATK: FORMULA(18, 8.5, 'Alta'), CRT: FORMULA(6, 0.28, 'Alta'), EVA: FORMULA(4, 0.22, 'Alta'), HP: FORMULA(130, 14, 'Normal'), MP: FORMULA(100, 8.5, 'Normal'), INT: FORMULA(15, 1, 'Normal'), CDMG: FORMULA(25, 1.2, 'Normal'), DEF: FORMULA(10, 4.5, 'Baja'), REGEN: FORMULA(2.5, 0.02, 'Baja'), LCK: FORMULA(3, 0.06, 'Baja'), RES: FORMULA(2, 0.08, 'Súper Baja') } },
    obito: { name: 'Obito Uchiha', stats: { EVA: FORMULA(10, 0.35, 'Súper Alta'), REGEN: FORMULA(5, 0.05, 'Alta'), HP: FORMULA(160, 16, 'Alta'), RES: FORMULA(10, 0.15, 'Alta'), MP: FORMULA(90, 8.5, 'Normal'), DEF: FORMULA(12, 5.5, 'Normal'), ATK: FORMULA(14, 7.5, 'Normal'), AGI: FORMULA(12, 2, 'Normal'), CDMG: FORMULA(15, 0.8, 'Baja'), CRT: FORMULA(3, 0.15, 'Baja'), LCK: FORMULA(2, 0.05, 'Baja'), INT: FORMULA(5, 0.6, 'Súper Baja') } },
    naruto: { name: 'Naruto Uzumaki', stats: { MP: FORMULA(200, 25, 'Súper Alta'), HP: FORMULA(180, 20, 'Alta'), REGEN: FORMULA(6, 0.06, 'Alta'), LCK: FORMULA(10, 1.2, 'Alta'), ATK: FORMULA(12, 8, 'Normal'), DEF: FORMULA(10, 5, 'Normal'), RES: FORMULA(8, 0.12, 'Normal'), CDMG: FORMULA(15, 1.3, 'Normal'), AGI: FORMULA(8, 1.5, 'Baja'), INT: FORMULA(6, 0.8, 'Baja'), CRT: FORMULA(2, 0.1, 'Baja'), EVA: FORMULA(0.5, 0.05, 'Súper Baja') } },
    nagato: { name: 'Nagato (Pain)', stats: { RES: FORMULA(15, 0.35, 'Súper Alta'), INT: FORMULA(20, 1.4, 'Alta'), MP: FORMULA(150, 15, 'Alta'), DEF: FORMULA(15, 7, 'Alta'), HP: FORMULA(140, 15, 'Normal'), REGEN: FORMULA(3, 0.05, 'Normal'), ATK: FORMULA(10, 8, 'Normal'), CDMG: FORMULA(15, 1.2, 'Normal'), LCK: FORMULA(2, 0.06, 'Baja'), EVA: FORMULA(1, 0.08, 'Baja'), CRT: FORMULA(2, 0.12, 'Baja'), AGI: FORMULA(5, 0.8, 'Súper Baja') } },
    kushina: { name: 'Kushina Uzumaki', stats: { REGEN: FORMULA(8, 0.1, 'Súper Alta'), HP: FORMULA(190, 18, 'Alta'), MP: FORMULA(140, 14, 'Alta'), ATK: FORMULA(15, 8.5, 'Alta'), RES: FORMULA(10, 0.15, 'Normal'), DEF: FORMULA(12, 5.5, 'Normal'), LCK: FORMULA(5, 0.1, 'Normal'), AGI: FORMULA(10, 2, 'Normal'), CRT: FORMULA(3, 0.12, 'Baja'), CDMG: FORMULA(10, 0.9, 'Baja'), EVA: FORMULA(1, 0.1, 'Baja'), INT: FORMULA(4, 0.5, 'Súper Baja') } },
    karin: { name: 'Karin Uzumaki', stats: { INT: FORMULA(22, 1.6, 'Súper Alta'), REGEN: FORMULA(7, 0.08, 'Alta'), MP: FORMULA(160, 12, 'Alta'), EVA: FORMULA(6, 0.24, 'Alta'), HP: FORMULA(140, 15, 'Normal'), RES: FORMULA(9, 0.14, 'Normal'), AGI: FORMULA(12, 2.2, 'Normal'), LCK: FORMULA(8, 0.12, 'Normal'), DEF: FORMULA(8, 4, 'Baja'), CRT: FORMULA(2, 0.08, 'Baja'), CDMG: FORMULA(12, 0.75, 'Baja'), ATK: FORMULA(5, 6, 'Súper Baja') } },
    hashirama: { name: 'Hashirama Senju', stats: { HP: FORMULA(220, 22, 'Súper Alta'), REGEN: FORMULA(7, 0.07, 'Alta'), MP: FORMULA(150, 13, 'Alta'), DEF: FORMULA(15, 6.5, 'Alta'), RES: FORMULA(9, 0.13, 'Normal'), ATK: FORMULA(14, 7.8, 'Normal'), INT: FORMULA(12, 1.2, 'Normal'), LCK: FORMULA(6, 0.1, 'Normal'), AGI: FORMULA(8, 1.6, 'Baja'), EVA: FORMULA(1.5, 0.11, 'Baja'), CDMG: FORMULA(12, 0.85, 'Baja'), CRT: FORMULA(1, 0.05, 'Súper Baja') } },
    tobirama: { name: 'Tobirama Senju', stats: { INT: FORMULA(24, 1.6, 'Súper Alta'), AGI: FORMULA(18, 2.8, 'Alta'), EVA: FORMULA(6, 0.26, 'Alta'), MP: FORMULA(130, 11, 'Alta'), RES: FORMULA(8, 0.14, 'Normal'), CRT: FORMULA(4, 0.24, 'Normal'), ATK: FORMULA(14, 7.8, 'Normal'), DEF: FORMULA(11, 5.2, 'Normal'), HP: FORMULA(120, 13, 'Baja'), CDMG: FORMULA(15, 0.95, 'Baja'), REGEN: FORMULA(2, 0.04, 'Baja'), LCK: FORMULA(1, 0.04, 'Súper Baja') } },
    tsunade: { name: 'Tsunade Senju', stats: { ATK: FORMULA(25, 10.5, 'Súper Alta'), HP: FORMULA(180, 19, 'Alta'), REGEN: FORMULA(6, 0.08, 'Alta'), RES: FORMULA(10, 0.18, 'Alta'), MP: FORMULA(100, 9, 'Normal'), DEF: FORMULA(15, 6, 'Normal'), INT: FORMULA(18, 1.3, 'Normal'), CDMG: FORMULA(20, 1.2, 'Normal'), LCK: FORMULA(1, 0.05, 'Baja'), AGI: FORMULA(8, 1.5, 'Baja'), CRT: FORMULA(2, 0.1, 'Baja'), EVA: FORMULA(0.5, 0.03, 'Súper Baja') } },
    itama: { name: 'Itama Senju', stats: { LCK: FORMULA(15, 1.5, 'Súper Alta'), EVA: FORMULA(5, 0.25, 'Alta'), AGI: FORMULA(15, 2.5, 'Alta'), REGEN: FORMULA(5, 0.06, 'Alta'), HP: FORMULA(130, 15, 'Normal'), MP: FORMULA(110, 9, 'Normal'), INT: FORMULA(10, 1.2, 'Normal'), CRT: FORMULA(4, 0.2, 'Normal'), ATK: FORMULA(10, 7, 'Baja'), RES: FORMULA(5, 0.1, 'Baja'), CDMG: FORMULA(10, 0.9, 'Baja'), DEF: FORMULA(5, 4, 'Súper Baja') } },
    kaguya: { name: 'Kaguya Ōtsutsuki', stats: { MP: FORMULA(250, 25, 'Súper Alta'), INT: FORMULA(20, 1.5, 'Alta'), RES: FORMULA(12, 0.35, 'Alta'), REGEN: FORMULA(6, 0.08, 'Alta'), HP: FORMULA(150, 15, 'Normal'), ATK: FORMULA(15, 8.2, 'Normal'), DEF: FORMULA(12, 5.5, 'Normal'), CDMG: FORMULA(15, 1.25, 'Normal'), CRT: FORMULA(2, 0.12, 'Baja'), EVA: FORMULA(1, 0.09, 'Baja'), LCK: FORMULA(2, 0.06, 'Baja'), AGI: FORMULA(4, 0.6, 'Súper Baja') } },
    hagoromo: { name: 'Hagoromo Ōtsutsuki', stats: { RES: FORMULA(18, 0.35, 'Súper Alta'), INT: FORMULA(22, 1.5, 'Alta'), MP: FORMULA(180, 18, 'Alta'), DEF: FORMULA(15, 6.5, 'Alta'), HP: FORMULA(160, 14, 'Normal'), REGEN: FORMULA(4, 0.05, 'Normal'), LCK: FORMULA(8, 0.12, 'Normal'), AGI: FORMULA(10, 2, 'Normal'), CRT: FORMULA(2, 0.1, 'Baja'), CDMG: FORMULA(10, 0.8, 'Baja'), EVA: FORMULA(1, 0.1, 'Baja'), ATK: FORMULA(6, 6.2, 'Súper Baja') } },
    indra: { name: 'Indra Ōtsutsuki', stats: { CDMG: FORMULA(30, 2, 'Súper Alta'), INT: FORMULA(20, 1.5, 'Alta'), CRT: FORMULA(8, 0.32, 'Alta'), AGI: FORMULA(14, 2.6, 'Alta'), MP: FORMULA(130, 10, 'Normal'), ATK: FORMULA(12, 8, 'Normal'), EVA: FORMULA(3, 0.18, 'Normal'), DEF: FORMULA(10, 5, 'Normal'), HP: FORMULA(125, 13, 'Baja'), RES: FORMULA(5, 0.11, 'Baja'), REGEN: FORMULA(2, 0.04, 'Baja'), LCK: FORMULA(1, 0.02, 'Súper Baja') } },
    asura: { name: 'Asura Ōtsutsuki', stats: { REGEN: FORMULA(8, 0.12, 'Súper Alta'), HP: FORMULA(200, 18, 'Alta'), DEF: FORMULA(15, 6.5, 'Alta'), RES: FORMULA(10, 0.25, 'Alta'), MP: FORMULA(140, 10, 'Normal'), ATK: FORMULA(14, 7.8, 'Normal'), LCK: FORMULA(10, 0.15, 'Normal'), AGI: FORMULA(12, 2, 'Normal'), EVA: FORMULA(2, 0.12, 'Baja'), CRT: FORMULA(3, 0.1, 'Baja'), CDMG: FORMULA(10, 0.85, 'Baja'), INT: FORMULA(6, 0.8, 'Súper Baja') } }
  };

  const SLOTS = [
    { id: 'weapon1', icon: '⚔', name: 'Katana', level: 1, stats: { ATK: 38, CRT: 1.2, CDMG: 2.2 }, costBase: 2800 },
    { id: 'weapon2', icon: '✦', name: 'Shurikens', level: 1, stats: { AGI: 24, EVA: 0.8, LCK: 3 }, costBase: 1200 },
    { id: 'head', icon: '👹', name: 'Máscara', level: 1, stats: { DEF: 18, RES: 0.6, INT: 4 }, costBase: 450 },
    { id: 'chest', icon: '🥋', name: 'Túnica ANBU', level: 1, stats: { DEF: 22, HP: 45, RES: 0.4 }, costBase: 5200 },
    { id: 'gloves', icon: '🧤', name: 'Guanteletes', level: 1, stats: { CRT: 0.9, ATK: 14 }, costBase: 1900 },
    { id: 'boots', icon: '👟', name: 'Botas Ninja', level: 1, stats: { AGI: 20, EVA: 1.1, REGEN: 0.12 }, costBase: 780 }
  ];

  let mounted = false;
  let refs = null;
  let currentHeroId = 'naruto';
  let currentLevel = 1;

  const character = { gold: 24850, stats: {} };

  function getStatDef(key) {
    return STAT_DEFS.find((s) => s.key === key);
  }

  function calculateHeroStats(heroId, level) {
    const hero = CHARACTER_FORMULAS[heroId] || CHARACTER_FORMULAS.naruto;
    const safeLevel = Math.max(1, Number(level) || 1);
    const calculated = {};
    STAT_DEFS.forEach((statDef) => {
      const formula = hero.stats[statDef.key] || FORMULA(0, 0, 'Normal');
      calculated[statDef.key] = formula.base + formula.growth * (safeLevel - 1);
    });
    return calculated;
  }

  function syncCharacterBaseStats() {
    character.stats = calculateHeroStats(currentHeroId, currentLevel);
  }

  function formatStatValue(statKey, value) {
    const statDef = getStatDef(statKey);
    if (!statDef) return String(value);
    if (statDef.type === 'percent') return `${Number(value).toFixed(2)}%`;
    return `${Math.round(value)}`;
  }

  function calcCost(slot) { return Math.round(slot.costBase + slot.level * (slot.level * 12)); }
  function calcStatBonus(baseValue, level) { return baseValue * (1 + level * 0.028); }

  function renderCharStats() {
    if (!refs?.charStats) return;
    refs.charStats.innerHTML = '';

    STAT_DEFS.forEach((stat) => {
      const item = document.createElement('div');
      item.className = 'hs-char-stat-item';
      item.innerHTML = `<span class="hs-char-stat-icon">${stat.icon}</span><span class="hs-char-stat-key">${stat.name}</span><span class="hs-char-stat-val ${stat.color || ''}">${formatStatValue(stat.key, character.stats[stat.key])}</span>`;
      refs.charStats.appendChild(item);
    });
  }

  function renderAdvancedStats() {
    if (!refs?.advancedStats) return;
    const hero = CHARACTER_FORMULAS[currentHeroId] || CHARACTER_FORMULAS.naruto;
    refs.advancedStats.innerHTML = '';

    STAT_DEFS.forEach((statDef) => {
      const formula = hero.stats[statDef.key];
      if (!formula) return;
      const row = document.createElement('div');
      row.className = 'hs-advanced-stat-row';
      row.innerHTML = `
        <div class="hs-advanced-stat-head">
          <span>${statDef.icon} ${statDef.name}</span>
          <span class="hs-advanced-cat">${formula.category}</span>
        </div>
        <div class="hs-advanced-values">
          <span>Base: ${formatStatValue(statDef.key, formula.base)}</span>
          <span>Crecimiento: +${formatStatValue(statDef.key, formula.growth)}</span>
          <span>Nv.${currentLevel}: ${formatStatValue(statDef.key, character.stats[statDef.key])}</span>
        </div>
      `;
      refs.advancedStats.appendChild(row);
    });
  }

  function createSlotElement(slot) {
    const el = document.createElement('div');
    el.className = 'hs-gear-slot';
    el.dataset.slotId = slot.id;
    el.innerHTML = `<div class="hs-slot-icon">${slot.icon}</div><div class="hs-slot-name">${slot.name}</div><div class="hs-slot-level">Lv.${slot.level}</div>`;
    el.addEventListener('click', () => openModal(slot));
    return el;
  }

  function bindSpriteHandlers() {
    refs.spriteBox.addEventListener('click', () => refs.spriteInput.click());
    refs.spriteInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file || file.size > 2 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        refs.spriteImg.src = event.target.result;
        refs.spriteImg.classList.add('loaded');
        refs.spritePlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    });
  }

  let currentSlot = null;

  function openModal(slot) {
    currentSlot = slot;
    refs.mIcon.textContent = slot.icon;
    refs.mName.textContent = slot.name;
    refs.mRarity.textContent = 'EQUIPO';
    refs.mCost.textContent = calcCost(slot).toLocaleString();
    refs.upgradeStats.innerHTML = '';

    Object.entries(slot.stats).forEach(([statKey, baseValue]) => {
      const statDef = getStatDef(statKey);
      if (!statDef) return;
      const current = calcStatBonus(baseValue, slot.level);
      const next = calcStatBonus(baseValue, slot.level + 1);
      const diff = next - current;
      const row = document.createElement('div');
      row.className = 'hs-upgrade-stat-row';
      row.innerHTML = `<span>${statDef.icon}</span><span>${statDef.name}</span><span class="hs-upgrade-stat-current">${formatStatValue(statKey, current)}</span><span>→</span><span class="hs-upgrade-stat-next">+${formatStatValue(statKey, diff)}</span>`;
      refs.upgradeStats.appendChild(row);
    });

    refs.overlay.classList.add('open');
  }

  function closeModal() {
    refs.overlay.classList.remove('open');
    currentSlot = null;
  }

  function bindModalHandlers() {
    refs.btnClose.addEventListener('click', closeModal);
    refs.overlay.addEventListener('click', (e) => { if (e.target === refs.overlay) closeModal(); });
    refs.btnUpgrade.addEventListener('click', () => {
      if (!currentSlot) return;
      const cost = calcCost(currentSlot);
      if (character.gold < cost) return;

      character.gold -= cost;
      refs.goldAmount.textContent = character.gold.toLocaleString();

      Object.entries(currentSlot.stats).forEach(([statKey, baseValue]) => {
        const currentBonus = calcStatBonus(baseValue, currentSlot.level);
        const nextBonus = calcStatBonus(baseValue, currentSlot.level + 1);
        const diff = nextBonus - currentBonus;
        character.stats[statKey] += diff;
      });

      currentSlot.level += 1;
      renderCharStats();
      renderAdvancedStats();
      const slotLevel = refs.grid.querySelector(`[data-slot-id="${currentSlot.id}"] .hs-slot-level`);
      if (slotLevel) slotLevel.textContent = `Lv.${currentSlot.level}`;
    });
  }

  function cacheRefs(root) {
    refs = {
      root,
      grid: root.querySelector('#hsGearGrid'),
      charStats: root.querySelector('#hsCharStats'),
      advancedStats: root.querySelector('#hsAdvancedStatsContainer'),
      goldAmount: root.querySelector('#hsGoldAmount'),
      spriteBox: root.querySelector('#hsSpriteBox'),
      spriteImg: root.querySelector('#hsSpriteImg'),
      spritePlaceholder: root.querySelector('#hsSpritePlaceholder'),
      spriteInput: root.querySelector('#hsSpriteInput'),
      overlay: root.querySelector('#hsModalOverlay'),
      btnClose: root.querySelector('#hsModalClose'),
      btnUpgrade: root.querySelector('#hsBtnUpgrade'),
      mIcon: root.querySelector('#hsMIcon'),
      mName: root.querySelector('#hsMName'),
      mRarity: root.querySelector('#hsMRarity'),
      mCost: root.querySelector('#hsMCost'),
      upgradeStats: root.querySelector('#hsUpgradeStats'),
      heroName: root.querySelector('.hs-char-name')
    };
  }


  function resolveHeroId(heroIdOrName) {
    if (!heroIdOrName) return 'naruto';
    if (CHARACTER_FORMULAS[heroIdOrName]) return heroIdOrName;
    const normalized = String(heroIdOrName)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z\s]/g, '');
    return Object.keys(CHARACTER_FORMULAS).find((id) => normalized.includes(id)) || 'naruto';
  }

  function updateHeroContext(heroId, level) {
    currentHeroId = resolveHeroId(heroId);
    currentLevel = Math.max(1, Number(level) || 1);
    syncCharacterBaseStats();

    if (refs?.heroName) {
      const displayName = (CHARACTER_FORMULAS[currentHeroId]?.name || 'Naruto Uzumaki').toUpperCase();
      refs.heroName.innerHTML = displayName.replace(/\s+/g, '<br>');
    }

    if (mounted) {
      renderCharStats();
      renderAdvancedStats();
    }

    return { ...character.stats };
  }

  function mount(hostId = 'hero-system-host') {
    const host = document.getElementById(hostId);
    const template = document.getElementById('heroSystemTemplate');
    if (!host || !template || mounted) return;

    host.innerHTML = '';
    host.appendChild(template.content.cloneNode(true));
    const root = host.querySelector('.hs-sheet');
    cacheRefs(root);
    refs.grid.innerHTML = '';
    SLOTS.forEach((slot) => refs.grid.appendChild(createSlotElement(slot)));
    refs.goldAmount.textContent = character.gold.toLocaleString();

    syncCharacterBaseStats();
    renderCharStats();
    renderAdvancedStats();
    bindSpriteHandlers();
    bindModalHandlers();
    mounted = true;
  }

  function unmount(hostId = 'hero-system-host') {
    const host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML = '';
    mounted = false;
    refs = null;
  }

  window.HeroSystem = {
    mount,
    unmount,
    isMounted: () => mounted,
    updateHeroContext,
    getCurrentStats: () => ({ ...character.stats })
  };
})();
