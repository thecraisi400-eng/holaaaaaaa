(function () {
  const ALL_STATS = [
    { key: 'STR', name: 'Fuerza', icon: '⚔', base: 284, color: '' },
    { key: 'AGI', name: 'Agilidad', icon: '💨', base: 197, color: 'speed' },
    { key: 'INT', name: 'Inteligencia', icon: '🧠', base: 156, color: '' },
    { key: 'LUK', name: 'Suerte', icon: '✦', base: 88, color: '' },
    { key: 'DEF', name: 'Defensa', icon: '🛡', base: 312, color: 'good' },
    { key: 'RES', name: 'Resistencia', icon: '♾', base: 241, color: '' },
    { key: 'CRI', name: 'Crítico', icon: '◎', base: 34, color: 'crit', suffix: '%' },
    { key: 'CD', name: 'Daño Crít.', icon: '💥', base: 218, color: 'crit', suffix: '%' },
    { key: 'EVA', name: 'Evasión', icon: '〇', base: 22, color: 'speed', suffix: '%' },
    { key: 'RgHP', name: 'Regen HP', icon: '♥', base: 145, color: 'good', prefix: '+' }
  ];

  const SLOTS = [
    { id: 'weapon1', icon: '⚔', name: 'Katana', level: 1, stats: { STR: 680, AGI: 45, CRI: 5, CD: 8 }, statIcons: { STR: '⚔', AGI: '💨', CRI: '◎', CD: '💥' }, costBase: 2800 },
    { id: 'weapon2', icon: '✦', name: 'Shurikens', level: 1, stats: { AGI: 195, LUK: 12, EVA: 8, STR: 30 }, statIcons: { AGI: '💨', LUK: '✦', EVA: '〇', STR: '⚔' }, costBase: 1200 },
    { id: 'head', icon: '👹', name: 'Máscara', level: 1, stats: { RES: 220, DEF: 380, INT: 25, RgHP: 15 }, statIcons: { RES: '♾', DEF: '🛡', INT: '🧠', RgHP: '♥' }, costBase: 450 },
    { id: 'chest', icon: '🥋', name: 'Túnica ANBU', level: 1, stats: { DEF: 312, RgHP: 280, RES: 150, STR: 80 }, statIcons: { DEF: '🛡', RgHP: '♥', RES: '♾', STR: '⚔' }, costBase: 5200 },
    { id: 'gloves', icon: '🧤', name: 'Guanteletes', level: 1, stats: { CRI: 87, DEF: 34, AGI: 20, STR: 45 }, statIcons: { CRI: '◎', DEF: '🛡', AGI: '💨', STR: '⚔' }, costBase: 1900 },
    { id: 'boots', icon: '👟', name: 'Botas Ninja', level: 1, stats: { AGI: 197, EVA: 22, INT: 18, LUK: 10 }, statIcons: { AGI: '💨', EVA: '〇', INT: '🧠', LUK: '✦' }, costBase: 780 }
  ];

  let mounted = false;
  let refs = null;
  const character = { gold: 24850, stats: {} };
  ALL_STATS.forEach((stat) => { character.stats[stat.key] = stat.base; });

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
    const stat = ALL_STATS.find((s) => s.key === statKey);
    if (!stat) return value;
    let display = stat.prefix || '';
    display += Math.round(value);
    display += stat.suffix || '';
    return display;
  }

  function renderCharStats() {
    refs.charStats.innerHTML = '';
    ALL_STATS.forEach((stat) => {
      const item = document.createElement('div');
      item.className = 'hs-char-stat-item';
      item.innerHTML = `<span class="hs-char-stat-icon">${stat.icon}</span><span class="hs-char-stat-key">${stat.name}</span><span class="hs-char-stat-val ${stat.color || ''}">${getStatDisplay(stat.key, character.stats[stat.key])}</span>`;
      refs.charStats.appendChild(item);
    });
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
        refs.spriteImg.src = event.target.result;
        refs.spriteImg.classList.add('loaded');
        refs.spritePlaceholder.style.display = 'none';
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
        refs.spriteImg.src = event.target.result;
        refs.spriteImg.classList.add('loaded');
        refs.spritePlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    });
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
      const stat = ALL_STATS.find((s) => s.key === statKey);
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
    refs.goldAmount.textContent = character.gold.toLocaleString();
    renderCharStats();
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

  window.HeroSystem = { mount, unmount, isMounted: () => mounted };
})();
