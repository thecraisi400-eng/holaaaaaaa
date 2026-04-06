(function () {
  const HERO_ALL_STATS = [
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

  const createHeroSlots = () => ([
    {
      id: 'weapon1', icon: '⚔', name: 'Katana', level: 1,
      stats: { STR: 680, AGI: 45, CRI: 5, CD: 8 },
      statIcons: { STR: '⚔', AGI: '💨', CRI: '◎', CD: '💥' },
      costBase: 2800
    },
    {
      id: 'weapon2', icon: '✦', name: 'Shurikens', level: 1,
      stats: { AGI: 195, LUK: 12, EVA: 8, STR: 30 },
      statIcons: { AGI: '💨', LUK: '✦', EVA: '〇', STR: '⚔' },
      costBase: 1200
    },
    {
      id: 'head', icon: '👹', name: 'Máscara', level: 1,
      stats: { RES: 220, DEF: 380, INT: 25, RgHP: 15 },
      statIcons: { RES: '♾', DEF: '🛡', INT: '🧠', RgHP: '♥' },
      costBase: 450
    },
    {
      id: 'chest', icon: '🥋', name: 'Túnica ANBU', level: 1,
      stats: { DEF: 312, RgHP: 280, RES: 150, STR: 80 },
      statIcons: { DEF: '🛡', RgHP: '♥', RES: '♾', STR: '⚔' },
      costBase: 5200
    },
    {
      id: 'gloves', icon: '🧤', name: 'Guanteletes', level: 1,
      stats: { CRI: 87, DEF: 34, AGI: 20, STR: 45 },
      statIcons: { CRI: '◎', DEF: '🛡', AGI: '💨', STR: '⚔' },
      costBase: 1900
    },
    {
      id: 'boots', icon: '👟', name: 'Botas Ninja', level: 1,
      stats: { AGI: 197, EVA: 22, INT: 18, LUK: 10 },
      statIcons: { AGI: '💨', EVA: '〇', INT: '🧠', LUK: '✦' },
      costBase: 780
    }
  ]);

  function heroMarkup() {
    return `
      <div class="hero-system-shell" id="heroSystemShell">
        <div class="hs-sheet" id="hs-sheet">
          <div class="hs-corner tl"></div>
          <div class="hs-corner tr"></div>
          <div class="hs-corner bl"></div>
          <div class="hs-corner br"></div>

          <div class="hs-col-identity">
            <div class="hs-avatar-wrap">
              <div class="hs-avatar-ring"></div>
              <div class="hs-avatar"><div class="hs-avatar-inner">🥷</div></div>
            </div>
            <div class="hs-char-name">KAGE<br>RYUU</div>
            <div class="hs-char-clan"><span class="hs-clan-dot"></span><span class="hs-clan-name">Clan Uchiha</span><span class="hs-clan-dot"></span></div>
            <div class="hs-rank-badge">ANBU</div>
            <div class="hs-identity-divider"></div>
            <div class="hs-level-display">
              <div class="hs-level-lbl">Nivel</div>
              <div class="hs-level-num">54</div>
              <div class="hs-xp-mini-bar"><div class="hs-xp-mini-fill" style="width:67%"></div></div>
              <div class="hs-level-exp">67,400 / 100K EXP</div>
            </div>
          </div>

          <div class="hs-col-gear">
            <div class="hs-gear-header">
              <div class="hs-gear-title">⚔ Equipamiento</div>
              <div class="hs-gold-display"><span class="hs-gold-icon">◆</span><span id="hs-goldAmount">24,850</span></div>
            </div>
            <div class="hs-gear-grid" id="hs-gearGrid"></div>
            <div class="hs-gear-stats-divider"></div>
            <div class="hs-char-stats-panel" id="hs-charStats"></div>
          </div>

          <div class="hs-col-sprite">
            <div class="hs-sprite-title">✦ Sprite</div>
            <div class="hs-sprite-box" id="hs-spriteBox">
              <div class="hs-sprite-placeholder" id="hs-spritePlaceholder">
                <div class="hs-sprite-placeholder-icon">🎭</div>
                <div>Arrastra tu sprite aquí<br>o haz clic para cargar</div>
              </div>
              <img class="hs-sprite-img" id="hs-spriteImg" alt="Sprite del personaje">
              <input type="file" id="hs-spriteInput" class="hs-sprite-input" accept="image/*">
            </div>
            <div class="hs-vitals-divider"></div>
            <div class="hs-vital-bar-wrap">
              <div class="hs-vital-row"><div class="hs-vital-label hs-label-hp">HP</div><div class="hs-vital-bar"><div class="hs-vital-fill hs-hp-fill" style="width:78%"></div></div><div class="hs-vital-val">7,820</div></div>
              <div class="hs-vital-row"><div class="hs-vital-label hs-label-ckr">CKR</div><div class="hs-vital-bar"><div class="hs-vital-fill hs-chakra-fill" style="width:55%"></div></div><div class="hs-vital-val">2,750</div></div>
              <div class="hs-vital-row"><div class="hs-vital-label hs-label-exp">EXP</div><div class="hs-vital-bar"><div class="hs-vital-fill hs-exp-fill" style="width:67%"></div></div><div class="hs-vital-val">67.4k</div></div>
            </div>
          </div>

          <div class="hs-modal-overlay" id="hs-modalOverlay">
            <div class="hs-modal" id="hs-modal">
              <button class="hs-modal-close" id="hs-modalClose">✕</button>
              <div class="hs-modal-header">
                <div class="hs-modal-icon" id="hs-mIcon">⚔</div>
                <div class="hs-modal-title-group">
                  <div class="hs-modal-item-name" id="hs-mName">Katana Oscura</div>
                  <div class="hs-modal-rarity" id="hs-mRarity">ANBU</div>
                </div>
              </div>
              <div class="hs-modal-section">
                <div class="hs-modal-section-title">Costo de Mejora</div>
                <div class="hs-cost-row"><span class="hs-cost-icon">◆</span><span class="hs-cost-val" id="hs-mCost">3,200</span><span class="hs-cost-lbl">ORO</span></div>
              </div>
              <div class="hs-modal-section">
                <div class="hs-modal-section-title">Estadísticas a Mejorar</div>
                <div class="hs-upgrade-stats-grid" id="hs-upgradeStats"></div>
              </div>
              <button class="hs-btn-upgrade" id="hs-btnUpgrade">▲ MEJORAR</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.renderHeroSystem = function renderHeroSystem() {
    const host = document.getElementById('hud-center');
    if (!host) return;
    if (host.dataset.activeView === 'hero') return;

    host.innerHTML = heroMarkup();
    host.dataset.activeView = 'hero';

    const HERO_SLOTS = createHeroSlots();
    const character = { gold: 24850, stats: {} };
    HERO_ALL_STATS.forEach(stat => { character.stats[stat.key] = stat.base; });

    const byId = (id) => document.getElementById(id);

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
      const stat = HERO_ALL_STATS.find(s => s.key === statKey);
      if (!stat) return value;
      return `${stat.prefix || ''}${Math.round(value)}${stat.suffix || ''}`;
    }

    function renderCharStats() {
      const panel = byId('hs-charStats');
      panel.innerHTML = '';
      HERO_ALL_STATS.forEach(stat => {
        const item = document.createElement('div');
        item.className = 'hs-char-stat-item';
        item.innerHTML = `<span class="hs-char-stat-icon">${stat.icon}</span><span class="hs-char-stat-key">${stat.name}</span><span class="hs-char-stat-val ${stat.color || ''}">${getStatDisplay(stat.key, character.stats[stat.key])}</span>`;
        panel.appendChild(item);
      });
    }

    const grid = byId('hs-gearGrid');
    function createSlotElement(slot) {
      const rar = getRarity(slot.level);
      const el = document.createElement('div');
      el.className = `hs-gear-slot${rar.extra ? ' legendary' : ''}`;
      el.style.border = `2px solid ${rar.border}`;
      el.style.background = rar.bg;
      el.style.boxShadow = `0 0 8px ${rar.glow}`;
      el.dataset.slotId = slot.id;

      let legendaryAura = '';
      let particles = '';
      if (rar.extra) {
        legendaryAura = '<div class="hs-legendary-aura"></div>';
        for (let p = 0; p < 6; p++) {
          const tx = (Math.random() * 70 - 35).toFixed(0);
          const ty = (Math.random() * 60 + 5).toFixed(0);
          const dx = (Math.random() * 16 - 8).toFixed(0);
          const dur = (1.2 + Math.random() * 1.8).toFixed(1);
          const delay = (Math.random() * 2).toFixed(1);
          particles += `<div class="particle" style="--tx:${tx}px;--ty:${ty}px;--dx:${dx}px;--dur:${dur}s;--delay:${delay}s;left:${15 + p * 12}%;top:${25 + Math.random() * 50}%"></div>`;
        }
      }

      el.innerHTML = `${legendaryAura}<div class="hs-slot-icon">${slot.icon}</div><div class="hs-slot-name" style="color:${rar.textColor}">${slot.name}</div><div class="hs-slot-level" style="color:${rar.textColor}">Lv.${slot.level}</div>${particles}`;
      el.addEventListener('click', () => openModal(slot, rar));
      return el;
    }

    HERO_SLOTS.forEach(slot => grid.appendChild(createSlotElement(slot)));

    const spriteBox = byId('hs-spriteBox');
    const spriteImg = byId('hs-spriteImg');
    const spritePlaceholder = byId('hs-spritePlaceholder');
    const spriteInput = byId('hs-spriteInput');

    spriteBox.addEventListener('click', () => spriteInput.click());
    spriteInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) return alert('El archivo es demasiado grande. Máximo 2MB.');
      const reader = new FileReader();
      reader.onload = (event) => {
        spriteImg.src = event.target.result;
        spriteImg.classList.add('loaded');
        spritePlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    });

    spriteBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      spriteBox.style.borderColor = 'var(--teal)';
      spriteBox.style.boxShadow = '0 0 25px rgba(0,245,255,0.3)';
    });
    spriteBox.addEventListener('dragleave', (e) => {
      e.preventDefault();
      spriteBox.style.borderColor = '';
      spriteBox.style.boxShadow = '';
    });
    spriteBox.addEventListener('drop', (e) => {
      e.preventDefault();
      spriteBox.style.borderColor = '';
      spriteBox.style.boxShadow = '';
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      if (file.size > 2 * 1024 * 1024) return alert('El archivo es demasiado grande. Máximo 2MB.');
      const reader = new FileReader();
      reader.onload = (event) => {
        spriteImg.src = event.target.result;
        spriteImg.classList.add('loaded');
        spritePlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    });

    const overlay = byId('hs-modalOverlay');
    const btnClose = byId('hs-modalClose');
    const btnUpgrade = byId('hs-btnUpgrade');
    let currentSlot = null;

    function openModal(slot, rar) {
      currentSlot = slot;
      byId('hs-mIcon').textContent = slot.icon;
      byId('hs-mName').textContent = slot.name;
      byId('hs-mRarity').textContent = rar.label.toUpperCase();
      byId('hs-mCost').textContent = calcCost(slot).toLocaleString();

      const upgradeStats = byId('hs-upgradeStats');
      upgradeStats.innerHTML = '';
      Object.entries(slot.stats).forEach(([statKey, baseValue]) => {
        const stat = HERO_ALL_STATS.find(s => s.key === statKey);
        if (!stat) return;
        const current = calcStatBonus(baseValue, slot.level);
        const next = calcStatBonus(baseValue, slot.level + 1);
        const diff = next - current;
        const row = document.createElement('div');
        row.className = 'hs-upgrade-stat-row';
        row.innerHTML = `<span class="hs-upgrade-stat-icon">${slot.statIcons[statKey] || stat.icon}</span><span class="hs-upgrade-stat-name">${stat.name}</span><span class="hs-upgrade-stat-current">${getStatDisplay(statKey, current)}</span><span class="hs-upgrade-stat-arrow">→</span><span class="hs-upgrade-stat-next">+${diff}${stat.suffix || ''}</span>`;
        upgradeStats.appendChild(row);
      });
      overlay.classList.add('open');
    }

    function closeModal() {
      overlay.classList.remove('open');
      currentSlot = null;
    }

    btnClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    btnUpgrade.addEventListener('click', () => {
      if (!currentSlot) return;
      const cost = calcCost(currentSlot);
      if (character.gold < cost) {
        btnUpgrade.textContent = '✦ ORO INSUFICIENTE';
        return setTimeout(() => { btnUpgrade.textContent = '▲ MEJORAR'; }, 1500);
      }
      if (currentSlot.level >= 80) {
        btnUpgrade.textContent = '✦ MAX NIVEL';
        return setTimeout(() => { btnUpgrade.textContent = '▲ MEJORAR'; }, 1500);
      }

      character.gold -= cost;
      byId('hs-goldAmount').textContent = character.gold.toLocaleString();

      Object.entries(currentSlot.stats).forEach(([statKey, baseValue]) => {
        const diff = calcStatBonus(baseValue, currentSlot.level + 1) - calcStatBonus(baseValue, currentSlot.level);
        if (character.stats[statKey] !== undefined) character.stats[statKey] += diff;
      });

      currentSlot.level++;
      const rar = getRarity(currentSlot.level);
      renderCharStats();
      openModal(currentSlot, rar);

      const slotEl = grid.querySelector(`[data-slot-id="${currentSlot.id}"]`);
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
          slotEl.classList.add('legendary');
          if (!slotEl.querySelector('.hs-legendary-aura')) {
            const aura = document.createElement('div');
            aura.className = 'hs-legendary-aura';
            slotEl.prepend(aura);
          }
          slotEl.querySelectorAll('.particle').forEach((p) => p.remove());
          for (let p = 0; p < 6; p++) {
            const tx = (Math.random() * 70 - 35).toFixed(0);
            const ty = (Math.random() * 60 + 5).toFixed(0);
            const dx = (Math.random() * 16 - 8).toFixed(0);
            const dur = (1.2 + Math.random() * 1.8).toFixed(1);
            const delay = (Math.random() * 2).toFixed(1);
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `--tx:${tx}px;--ty:${ty}px;--dx:${dx}px;--dur:${dur}s;--delay:${delay}s;left:${15 + p * 12}%;top:${25 + Math.random() * 50}%`;
            slotEl.appendChild(particle);
          }
        } else {
          slotEl.classList.remove('legendary');
          const aura = slotEl.querySelector('.hs-legendary-aura');
          if (aura) aura.remove();
          slotEl.querySelectorAll('.particle').forEach((p) => p.remove());
        }
        setTimeout(() => slotEl.classList.remove('hs-rarity-updating'), 500);
      }

      btnUpgrade.textContent = '✓ ¡MEJORADO!';
      setTimeout(() => { btnUpgrade.textContent = '▲ MEJORAR'; }, 1200);
    });

    renderCharStats();
  };
})();
