(function () {
  const DEFAULT_HERO = window.CharacterStatsSystem
    ? window.CharacterStatsSystem.buildHeroSnapshot('naruto', 1, 0, window.CharacterStatsSystem.DEFAULT_RANK)
    : null;

  const STAT_ICON_MAP = { HP: '❤️', MP: '🔵', ATK: '⚔', DEF: '🛡', AGI: '💨', INT: '🧠', CRT: '◎', CDMG: '💥', EVA: '〇', REGEN: '♥', RES: '♾', LCK: '✦' };
  function getAllStatsMeta() {
    const meta = window.CharacterStatsSystem?.STAT_META || [];
    return meta.map((item) => ({
      key: item.key,
      name: item.label,
      icon: STAT_ICON_MAP[item.key] || '✦',
      suffix: item.suffix || ''
    }));
  }

  const SLOTS = [
    { id: 'weapon1', icon: '⚔', name: 'KATANA', level: 1, stats: { ATK: 2.5, CRT: 0.12, INT: 1.0, LCK: 0.5 }, statIcons: { ATK: '⚔', CRT: '◎', INT: '🧠', LCK: '✦' } },
    { id: 'weapon2', icon: '✦', name: 'SHURIKEN', level: 1, stats: { AGI: 2.0, CRT: 0.10, ATK: 1.5, EVA: 0.08 }, statIcons: { AGI: '💨', CRT: '◎', ATK: '⚔', EVA: '〇' } },
    { id: 'head', icon: '👹', name: 'MÁSCARA', level: 1, stats: { MP: 6.0, INT: 1.5, RES: 0.12, REGEN: 0.05 }, statIcons: { MP: '🔵', INT: '🧠', RES: '♾', REGEN: '♥' } },
    { id: 'chest', icon: '🥋', name: 'TÚNICA AMBU', level: 1, stats: { HP: 12.0, DEF: 3.0, RES: 0.15, EVA: 0.10 }, statIcons: { HP: '❤️', DEF: '🛡', RES: '♾', EVA: '〇' } },
    { id: 'gloves', icon: '🧤', name: 'GUANTELETES', level: 1, stats: { DEF: 2.0, ATK: 1.0, CDMG: 0.10, LCK: 1.0 }, statIcons: { DEF: '🛡', ATK: '⚔', CDMG: '💥', LCK: '✦' } },
    { id: 'boots', icon: '👟', name: 'BOTAS NINJA', level: 1, stats: { AGI: 3.0, EVA: 0.15, HP: 5.0, REGEN: 0.08 }, statIcons: { AGI: '💨', EVA: '〇', HP: '❤️', REGEN: '♥' } }
  ];

  let mounted = false;
  let refs = null;
  let selectedSpriteSrc = '';
  const character = { gold: 0, stats: {}, hero: DEFAULT_HERO, baseHero: DEFAULT_HERO, equipmentBonuses: {} };
  function syncGoldFromGlobalState() {
    if (window.GameState && typeof window.GameState.getGold === 'function') {
      character.gold = window.GameState.getGold();
    }
  }
  function buildEmptyStats() {
    return getAllStatsMeta().reduce((acc, meta) => {
      acc[meta.key] = 0;
      return acc;
    }, {});
  }
  function calcCostByLevel(level) {
    if (level <= 7) return 100 * Math.pow(1.5, level - 1);
    if (level <= 45) return 1200 + (level - 7) * 185;
    return 8225 + (level - 45) * 55;
  }
  function calcTotalSlotStat(levelStat, level) { return levelStat * level; }
  function calcEquipmentBonuses() {
    const totals = buildEmptyStats();
    SLOTS.forEach((slot) => {
      Object.entries(slot.stats).forEach(([statKey, valuePerLevel]) => {
        totals[statKey] = (totals[statKey] || 0) + calcTotalSlotStat(valuePerLevel, slot.level);
      });
    });
    return totals;
  }
  function applyEquipmentToHero(heroSnapshot, equipmentBonuses) {
    if (!heroSnapshot) return null;
    const baseStats = { ...(heroSnapshot.baseStats || heroSnapshot.stats || {}) };
    const statsWithEquipment = { ...baseStats };
    Object.entries(equipmentBonuses).forEach(([key, value]) => {
      statsWithEquipment[key] = (statsWithEquipment[key] || 0) + value;
    });
    return {
      ...heroSnapshot,
      baseStats,
      equipmentBonuses: { ...equipmentBonuses },
      stats: statsWithEquipment
    };
  }
  function refreshCharacterFromHero(heroSnapshot) {
    character.baseHero = heroSnapshot
      ? { ...heroSnapshot, stats: { ...(heroSnapshot.baseStats || heroSnapshot.stats || {}) } }
      : (character.baseHero || character.hero || DEFAULT_HERO);
    character.equipmentBonuses = calcEquipmentBonuses();
    character.hero = applyEquipmentToHero(character.baseHero, character.equipmentBonuses);
    character.stats = { ...(character.hero?.stats || {}) };
  }
  function syncHeroToGlobalState() {
    if (!window.CharacterStatsSystem || typeof window.CharacterStatsSystem.setActiveHero !== 'function' || !character.hero) return;
    window.CharacterStatsSystem.setActiveHero(character.hero);
  }
  refreshCharacterFromHero(DEFAULT_HERO);

  function getRarity(lvl) {
    if (lvl <= 5) return { label: 'Madera', border: '#8b5e3c', bg: 'linear-gradient(145deg, rgba(139,94,60,0.35), rgba(101,67,33,0.25))', glow: 'rgba(139,94,60,0.5)', textColor: '#d4a574', extra: false };
    if (lvl <= 15) return { label: 'Aprendiz', border: '#2ecc71', bg: 'linear-gradient(145deg, rgba(46,204,113,0.25), rgba(22,163,74,0.15))', glow: 'rgba(46,204,113,0.45)', textColor: '#7fffd4', extra: false };
    if (lvl <= 30) return { label: 'Chunin', border: '#3498db', bg: 'linear-gradient(145deg, rgba(52,152,219,0.28), rgba(29,78,216,0.18))', glow: 'rgba(52,152,219,0.45)', textColor: '#7dd3fc', extra: false };
    if (lvl <= 45) return { label: 'Jonin', border: '#f1c40f', bg: 'linear-gradient(145deg, rgba(241,196,15,0.28), rgba(161,98,7,0.18))', glow: 'rgba(241,196,15,0.5)', textColor: '#fde047', extra: false };
    if (lvl <= 60) return { label: 'ANBU', border: '#e74c3c', bg: 'linear-gradient(145deg, rgba(231,76,60,0.30), rgba(153,27,27,0.20))', glow: 'rgba(231,76,60,0.5)', textColor: '#fca5a5', extra: false };
    return { label: 'Legendario', border: '#e74c3c', bg: 'linear-gradient(145deg, rgba(231,76,60,0.35), rgba(139,0,0,0.30), rgba(255,200,60,0.15))', glow: 'rgba(231,76,60,0.7)', textColor: '#ffc83c', extra: true };
  }

  function calcCost(slot) { return Math.round(calcCostByLevel(slot.level)); }
  function calcStatBonus(baseValue, level) { return calcTotalSlotStat(baseValue, level); }

  function getStatDisplay(statKey, value) {
    const stat = getAllStatsMeta().find((s) => s.key === statKey);
    if (!stat) return value;
    let display = stat.prefix || '';
    display += stat.suffix === '%' ? Number(value || 0).toFixed(2) : Math.round(value);
    display += stat.suffix || '';
    return display;
  }

  function renderCharStats() {
    refs.charStats.innerHTML = '';
    getAllStatsMeta().slice(0, 10).forEach((stat) => {
      const item = document.createElement('div');
      item.className = 'hs-char-stat-item';
      item.innerHTML = `<span class="hs-char-stat-icon">${stat.icon}</span><span class="hs-char-stat-key">${stat.name}</span><span class="hs-char-stat-val ${stat.color || ''}">${getStatDisplay(stat.key, character.stats[stat.key])}</span>`;
      refs.charStats.appendChild(item);
    });
  }

  function renderHeroIdentity() {
    const hero = character.hero;
    if (!hero || !refs.root) return;

    refs.heroName.textContent = hero.name.toUpperCase();
    refs.heroClanName.textContent = hero.clanName;
    refs.heroRank.textContent = hero.rank || 'GENIN';
    refs.heroLevel.textContent = hero.level;
  }

  function createParticles(slotEl) {
    for (let p = 0; p < 6; p++) {
      const particle = document.createElement('div');
      particle.className = 'hs-particle';
      particle.style.cssText = `--tx:${(Math.random() * 70 - 35).toFixed(0)}px;--ty:${(Math.random() * 60 + 5).toFixed(0)}px;--dx:${(Math.random() * 16 - 8).toFixed(0)}px;--dur:${(1.2 + Math.random() * 1.8).toFixed(1)}s;--delay:${(Math.random() * 2).toFixed(1)}s;left:${15 + p * 12}%;top:${25 + Math.random() * 50}%`;
      slotEl.appendChild(particle);
    }
  }

  function createSlotElement(slot) {
    const rar = getRarity(slot.level);
    const el = document.createElement('div');
    el.className = `hs-gear-slot${rar.extra ? ' hs-legendary' : ''}`;
    el.style.border = `2px solid ${rar.border}`;
    el.style.background = rar.bg;
    el.style.boxShadow = `0 0 8px ${rar.glow}`;
    el.dataset.slotId = slot.id;
    if (rar.extra) {
      const aura = document.createElement('div');
      aura.className = 'hs-legendary-aura';
      el.appendChild(aura);
      createParticles(el);
    }

    el.innerHTML += `<div class="hs-slot-icon">${slot.icon}</div><div class="hs-slot-name" style="color:${rar.textColor}">${slot.name}</div><div class="hs-slot-level" style="color:${rar.textColor}">Lv.${slot.level}</div>`;
    el.addEventListener('click', () => openModal(slot, rar));
    return el;
  }

  function applySpriteToPanel() {
    if (!refs?.spriteImg || !refs?.spritePlaceholder) return;
    if (selectedSpriteSrc) {
      refs.spriteImg.src = selectedSpriteSrc;
      refs.spriteImg.classList.add('loaded');
      refs.spritePlaceholder.style.display = 'none';
      return;
    }
    refs.spriteImg.removeAttribute('src');
    refs.spriteImg.classList.remove('loaded');
    refs.spritePlaceholder.style.display = '';
  }

  function setCharacterSprite(spriteSrc = '') {
    selectedSpriteSrc = spriteSrc;
    if (!mounted || !refs) return;
    applySpriteToPanel();
  }

  function getHeroSnapshot() {
    return character.hero ? { ...character.hero, stats: { ...character.hero.stats } } : null;
  }

  let currentSlot = null;

  function openModal(slot, rar) {
    currentSlot = slot;
    refs.mIcon.textContent = slot.icon;
    refs.mName.textContent = slot.name;
    refs.mRarity.textContent = rar.label.toUpperCase();
    refs.mCost.textContent = calcCost(slot).toLocaleString();
    refs.upgradeStats.innerHTML = '';

    Object.entries(slot.stats).forEach(([statKey, baseValue]) => {
      const stat = getAllStatsMeta().find((s) => s.key === statKey);
      if (!stat) return;
      const current = calcStatBonus(baseValue, slot.level);
      const next = calcStatBonus(baseValue, slot.level + 1);
      const diff = next - current;
      const row = document.createElement('div');
      row.className = 'hs-upgrade-stat-row';
      row.innerHTML = `<span>${slot.statIcons[statKey] || stat.icon}</span><span>${stat.name}</span><span class="hs-upgrade-stat-current">${getStatDisplay(statKey, current)}</span><span>→</span><span class="hs-upgrade-stat-next">+${stat.suffix === '%' ? Number(diff).toFixed(2) : Number(diff).toFixed(1)}${stat.suffix || ''}</span>`;
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
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mounted) closeModal(); });

    refs.btnUpgrade.addEventListener('click', () => {
      if (!currentSlot) return;
      const cost = calcCost(currentSlot);
      if (character.gold < cost) {
        refs.btnUpgrade.textContent = '✦ ORO INSUFICIENTE';
        setTimeout(() => { refs.btnUpgrade.textContent = '▲ MEJORAR'; }, 1500);
        return;
      }
      if (currentSlot.level >= 80) {
        refs.btnUpgrade.textContent = '✦ MAX NIVEL';
        setTimeout(() => { refs.btnUpgrade.textContent = '▲ MEJORAR'; }, 1500);
        return;
      }

      character.gold -= cost;
      if (window.GameState && typeof window.GameState.setGold === 'function') {
        window.GameState.setGold(character.gold);
      }
      currentSlot.level += 1;
      refreshCharacterFromHero(character.baseHero);
      syncHeroToGlobalState();
      const rar = getRarity(currentSlot.level);
      renderCharStats();
      openModal(currentSlot, rar);

      const slotEl = refs.grid.querySelector(`[data-slot-id="${currentSlot.id}"]`);
      if (slotEl) {
        slotEl.classList.add('hs-rarity-updating');
        slotEl.style.border = `2px solid ${rar.border}`;
        slotEl.style.background = rar.bg;
        slotEl.style.boxShadow = `0 0 20px ${rar.glow}, inset 0 0 20px ${rar.glow}`;
        const nameEl = slotEl.querySelector('.hs-slot-name');
        const levelEl = slotEl.querySelector('.hs-slot-level');
        if (nameEl) nameEl.style.color = rar.textColor;
        if (levelEl) {
          levelEl.textContent = `Lv.${currentSlot.level}`;
          levelEl.style.color = rar.textColor;
        }

        if (rar.extra) {
          slotEl.classList.add('hs-legendary');
          if (!slotEl.querySelector('.hs-legendary-aura')) {
            const aura = document.createElement('div');
            aura.className = 'hs-legendary-aura';
            slotEl.prepend(aura);
          }
          slotEl.querySelectorAll('.hs-particle').forEach((p) => p.remove());
          createParticles(slotEl);
        } else {
          slotEl.classList.remove('hs-legendary');
          const aura = slotEl.querySelector('.hs-legendary-aura');
          if (aura) aura.remove();
          slotEl.querySelectorAll('.hs-particle').forEach((p) => p.remove());
        }
        setTimeout(() => slotEl.classList.remove('hs-rarity-updating'), 500);
      }

      refs.btnUpgrade.textContent = '✓ ¡MEJORADO!';
      setTimeout(() => { refs.btnUpgrade.textContent = '▲ MEJORAR'; }, 1200);
    });
  }

  function cacheRefs(root) {
    refs = {
      root,
      grid: root.querySelector('#hsGearGrid'),
      charStats: root.querySelector('#hsCharStats'),
      spriteImg: root.querySelector('#hsSpriteImg'),
      spritePlaceholder: root.querySelector('#hsSpritePlaceholder'),
      heroName: root.querySelector('#hsHeroName'),
      heroClanName: root.querySelector('#hsHeroClanName'),
      heroRank: root.querySelector('#hsHeroRank'),
      heroLevel: root.querySelector('#hsHeroLevel'),
      overlay: root.querySelector('#hsModalOverlay'),
      btnClose: root.querySelector('#hsModalClose'),
      btnUpgrade: root.querySelector('#hsBtnUpgrade'),
      mIcon: root.querySelector('#hsMIcon'),
      mName: root.querySelector('#hsMName'),
      mRarity: root.querySelector('#hsMRarity'),
      mCost: root.querySelector('#hsMCost'),
      upgradeStats: root.querySelector('#hsUpgradeStats')
    };
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
    refreshCharacterFromHero(window.CharacterStatsSystem?.getActiveHero() || DEFAULT_HERO);
    syncHeroToGlobalState();
    syncGoldFromGlobalState();
    renderCharStats();
    renderHeroIdentity();
    applySpriteToPanel();
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

  window.HeroSystem = { mount, unmount, isMounted: () => mounted, setCharacterSprite, getHeroSnapshot };

  window.addEventListener('ngs:hero-stats-updated', (event) => {
    const hero = event?.detail?.hero;
    refreshCharacterFromHero(hero || DEFAULT_HERO);
    if (!mounted || !refs) return;
    renderCharStats();
    renderHeroIdentity();
  });

  window.addEventListener('ngs:gold-updated', (event) => {
    const latestGold = event?.detail?.gold;
    character.gold = Math.max(0, Number(latestGold) || 0);
    if (!mounted || !refs) return;
  });
})();
