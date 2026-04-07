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
    { id: 'weapon1', icon: '⚔', name: 'Katana', level: 1, stats: { ATK: 68, AGI: 10, CRT: 2, CDMG: 4 }, statIcons: { ATK: '⚔', AGI: '💨', CRT: '◎', CDMG: '💥' }, costBase: 2800 },
    { id: 'weapon2', icon: '✦', name: 'Shurikens', level: 1, stats: { AGI: 20, LCK: 8, EVA: 2, ATK: 12 }, statIcons: { AGI: '💨', LCK: '✦', EVA: '〇', ATK: '⚔' }, costBase: 1200 },
    { id: 'head', icon: '👹', name: 'Máscara', level: 1, stats: { RES: 4, DEF: 24, INT: 8, REGEN: 1 }, statIcons: { RES: '♾', DEF: '🛡', INT: '🧠', REGEN: '♥' }, costBase: 450 },
    { id: 'chest', icon: '🥋', name: 'Túnica ANBU', level: 1, stats: { DEF: 28, REGEN: 1, RES: 3, HP: 65 }, statIcons: { DEF: '🛡', REGEN: '♥', RES: '♾', HP: '❤️' }, costBase: 5200 },
    { id: 'gloves', icon: '🧤', name: 'Guanteletes', level: 1, stats: { CRT: 3, DEF: 10, AGI: 8, ATK: 24 }, statIcons: { CRT: '◎', DEF: '🛡', AGI: '💨', ATK: '⚔' }, costBase: 1900 },
    { id: 'boots', icon: '👟', name: 'Botas Ninja', level: 1, stats: { AGI: 24, EVA: 2, INT: 6, LCK: 5 }, statIcons: { AGI: '💨', EVA: '〇', INT: '🧠', LCK: '✦' }, costBase: 780 }
  ];

  let mounted = false;
  let refs = null;
  let selectedSpriteSrc = '';
  const character = { gold: 0, stats: {}, hero: DEFAULT_HERO };
  function syncGoldFromGlobalState() {
    if (window.GameState && typeof window.GameState.getGold === 'function') {
      character.gold = window.GameState.getGold();
    }
  }
  function refreshCharacterFromHero(heroSnapshot) {
    character.hero = heroSnapshot || character.hero || DEFAULT_HERO;
    character.stats = { ...(character.hero?.stats || {}) };
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

  function calcCost(slot) { return Math.round(slot.costBase + slot.level * (slot.level * 12)); }
  function calcStatBonus(baseValue, level) { return Math.round(baseValue * (1 + level * 0.028)); }

  function getStatDisplay(statKey, value) {
    const stat = getAllStatsMeta().find((s) => s.key === statKey);
    if (!stat) return value;
    let display = stat.prefix || '';
    display += Math.round(value);
    display += stat.suffix || '';
    return display;
  }

  function renderCharStats() {
    refs.charStats.innerHTML = '';
    getAllStatsMeta().forEach((stat) => {
      const item = document.createElement('div');
      item.className = 'hs-char-stat-item';
      item.innerHTML = `<span class="hs-char-stat-icon">${stat.icon}</span><span class="hs-char-stat-key">${stat.name}</span><span class="hs-char-stat-val ${stat.color || ''}">${getStatDisplay(stat.key, character.stats[stat.key])}</span>`;
      refs.charStats.appendChild(item);
    });
  }

  function renderHeroIdentity() {
    const hero = character.hero;
    if (!hero || !refs.root) return;
    const levelProgressBase = hero.expCurrentLevelStart || 0;
    const expSpan = Math.max(1, (hero.expNextLevelTarget || 0) - levelProgressBase);
    const progress = Math.min(100, Math.max(0, ((hero.exp - levelProgressBase) / expSpan) * 100));

    refs.heroName.innerHTML = hero.name.toUpperCase().replace(/\s+/g, '<br>');
    refs.heroClanName.textContent = hero.clanName;
    refs.heroRank.textContent = hero.rank || 'GENIN';
    refs.leftHpValue.textContent = hero.stats.HP.toLocaleString();
    refs.leftMpValue.textContent = hero.stats.MP.toLocaleString();
    refs.leftExpValue.textContent = `${Math.round(progress)}%`;
    refs.leftHpFill.style.width = '100%';
    refs.leftMpFill.style.width = '100%';
    refs.leftExpFill.style.width = `${progress}%`;
    refs.heroLevel.textContent = hero.level;
    refs.xpMiniFill.style.width = `${progress}%`;
    refs.levelProgress.textContent = `${hero.exp.toLocaleString()} / ${hero.expNextLevelTarget.toLocaleString()} EXP`;
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

  function bindSpriteHandlers() {
    refs.spriteBox.addEventListener('click', () => refs.spriteInput.click());

    refs.spriteInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { alert('El archivo es demasiado grande. Máximo 2MB.'); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        selectedSpriteSrc = event.target.result;
        applySpriteToPanel();
      };
      reader.readAsDataURL(file);
    });

    refs.spriteBox.addEventListener('dragover', (e) => { e.preventDefault(); refs.spriteBox.style.borderColor = 'var(--hs-cyan)'; });
    refs.spriteBox.addEventListener('dragleave', (e) => { e.preventDefault(); refs.spriteBox.style.borderColor = ''; });
    refs.spriteBox.addEventListener('drop', (e) => {
      e.preventDefault();
      refs.spriteBox.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      if (file.size > 2 * 1024 * 1024) { alert('El archivo es demasiado grande. Máximo 2MB.'); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        selectedSpriteSrc = event.target.result;
        applySpriteToPanel();
      };
      reader.readAsDataURL(file);
    });
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
      row.innerHTML = `<span>${slot.statIcons[statKey] || stat.icon}</span><span>${stat.name}</span><span class="hs-upgrade-stat-current">${getStatDisplay(statKey, current)}</span><span>→</span><span class="hs-upgrade-stat-next">+${diff}${stat.suffix || ''}</span>`;
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
      refs.goldAmount.textContent = character.gold.toLocaleString();
      Object.entries(currentSlot.stats).forEach(([statKey, baseValue]) => {
        const currentBonus = calcStatBonus(baseValue, currentSlot.level);
        const nextBonus = calcStatBonus(baseValue, currentSlot.level + 1);
        const diff = nextBonus - currentBonus;
        if (character.stats[statKey] !== undefined) character.stats[statKey] += diff;
      });

      currentSlot.level += 1;
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
      goldAmount: root.querySelector('#hsGoldAmount'),
      spriteBox: root.querySelector('#hsSpriteBox'),
      spriteImg: root.querySelector('#hsSpriteImg'),
      spritePlaceholder: root.querySelector('#hsSpritePlaceholder'),
      spriteInput: root.querySelector('#hsSpriteInput'),
      heroName: root.querySelector('#hsHeroName'),
      heroClanName: root.querySelector('#hsHeroClanName'),
      heroRank: root.querySelector('#hsHeroRank'),
      leftHpFill: root.querySelector('#hsLeftHpFill'),
      leftMpFill: root.querySelector('#hsLeftMpFill'),
      leftExpFill: root.querySelector('#hsLeftExpFill'),
      leftHpValue: root.querySelector('#hsLeftHpValue'),
      leftMpValue: root.querySelector('#hsLeftMpValue'),
      leftExpValue: root.querySelector('#hsLeftExpValue'),
      heroLevel: root.querySelector('#hsHeroLevel'),
      xpMiniFill: root.querySelector('#hsXpMiniFill'),
      levelProgress: root.querySelector('#hsLevelProgress'),
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
    syncGoldFromGlobalState();
    refs.goldAmount.textContent = character.gold.toLocaleString();
    renderCharStats();
    renderHeroIdentity();
    applySpriteToPanel();
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

  window.HeroSystem = { mount, unmount, isMounted: () => mounted, setCharacterSprite };

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
    refs.goldAmount.textContent = character.gold.toLocaleString();
  });
})();
