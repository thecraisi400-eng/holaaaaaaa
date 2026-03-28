(() => {
  if (window.__ninjaHud?.destroy) {
    window.__ninjaHud.destroy();
  }

  const state = {
    hp: 720,
    hpMax: 1000,
    mp: 290,
    mpMax: 500,
    exp: 4400,
    expMax: 10000,
    gold: 4320,
    atk: 1240,
    def: 880,
    level: 23,
    activeSection: 'heroe'
  };

  const sections = {
    heroe: { icon: '🥷', title: 'HÉROE', desc: 'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
    misiones: { icon: '📜', title: 'MISIONES', desc: '' },
    clanes: { icon: '⛩️', title: 'CLANES', desc: 'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
    eventos: { icon: '🎴', title: 'EVENTOS', desc: '¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
    jutsus: { icon: '🌀', title: 'JUTSUS', desc: 'Gestiona tus técnicas ninja. Equipa hasta 4 jutsus activos y mejora sus rangos con sellos de chakra.' },
    batallas: { icon: '⚔️', title: 'BATALLAS', desc: 'Modo PvP y arena de rango. Desafía a otros jugadores y sube en la tabla clasificatoria mundial.' },
    invocaciones: { icon: '✨', title: 'INVOCACIONES', desc: 'Invoca nuevos compañeros y objetos míticos. Utiliza pergaminos de convocación para obtener aliados S-Rank.' },
    habilidades: { icon: '🌿', title: 'ÁRBOL DE HABILIDAD', desc: 'Asigna puntos de habilidad en ramas de Ninjutsu, Taijutsu y Genjutsu para personalizar tu estilo de combate.' },
    ajustes: { icon: '⚙️', title: 'AJUSTES', desc: 'Configura notificaciones, audio, gráficos y tu cuenta de shinobi. También puedes vincular tu aldea.' }
  };

  const labels = {
    heroe: 'HÉROE',
    misiones: 'MISIONES',
    clanes: 'CLANES',
    eventos: 'EVENTOS',
    jutsus: 'JUTSUS',
    batallas: 'BATALLAS',
    invocaciones: 'INVOCAR',
    habilidades: 'ÁRBOL',
    ajustes: 'AJUSTES'
  };

  const refs = {
    nav: document.getElementById('hud-bottom'),
    center: document.getElementById('hud-center-content'),
    overlay: document.getElementById('section-overlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayDesc: document.getElementById('overlayDesc'),
    particleContainer: document.getElementById('particleContainer'),
    hpFill: document.getElementById('hpFill'),
    mpFill: document.getElementById('mpFill'),
    expFill: document.getElementById('expFill'),
    hpCur: document.getElementById('hpCur'),
    hpPct: document.getElementById('hpPct'),
    mpCur: document.getElementById('mpCur'),
    mpPct: document.getElementById('mpPct'),
    expNext: document.getElementById('expNext'),
    statAtk: document.getElementById('statAtk'),
    statDef: document.getElementById('statDef'),
    statGold: document.getElementById('statGold')
  };

  const controller = new AbortController();
  const { signal } = controller;
  let barsIntervalId = null;
  let heroCleanup = null;

  const baseCharacter = {
    gold: state.gold,
    levels: { cabeza: 1, pecho: 1, manos: 1, piernas: 1, pies: 1, accesorio: 1 }
  };

  window.gameCharacter = window.gameCharacter || new Proxy(baseCharacter, {
    set(target, prop, value) {
      target[prop] = value;
      if (prop === 'gold') {
        state.gold = value;
      }
      syncTopStats();
      return true;
    }
  });

  function syncTopStats() {
    const stats = window.heroEngine.computeStats(window.gameCharacter);
    refs.statGold.textContent = Number(window.gameCharacter.gold || 0).toLocaleString();
    refs.statAtk.textContent = Number(stats.ATK || 0).toLocaleString('es-ES', { maximumFractionDigits: 1 });
    refs.statDef.textContent = Number(stats.DEF || 0).toLocaleString('es-ES', { maximumFractionDigits: 1 });
  }

  function updateBars() {
    state.exp = Math.min(state.expMax, state.exp + Math.floor(Math.random() * 28 + 8));
    if (state.activeSection !== 'heroe') {
      state.gold += Math.floor(Math.random() * 12 + 3);
      window.gameCharacter.gold = state.gold;
    }

    const hpPct = Math.round((state.hp / state.hpMax) * 100);
    const mpPct = Math.round((state.mp / state.mpMax) * 100);
    const expPct = Math.round((state.exp / state.expMax) * 100);

    refs.hpFill.style.width = `${hpPct}%`;
    refs.mpFill.style.width = `${mpPct}%`;
    refs.expFill.style.width = `${expPct}%`;

    refs.hpCur.textContent = state.hp;
    refs.hpPct.textContent = `${hpPct}%`;
    refs.mpCur.textContent = state.mp;
    refs.mpPct.textContent = `${mpPct}%`;
    refs.expNext.textContent = `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
    syncTopStats();
  }

  function spawnParticles(x, y, type = 'chakra') {
    const count = type === 'smoke' ? 6 : 10;

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('div');
      particle.className = `particle ${type}`;

      const size = type === 'smoke' ? Math.random() * 18 + 10 : Math.random() * 5 + 2;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      particle.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${x - size / 2}px`,
        `top:${y - size / 2}px`,
        `--tx:${tx}px`,
        `--ty:${ty}px`,
        `animation-delay:${Math.random() * 0.1}s`,
        `animation-duration:${Math.random() * 0.4 + 0.5}s`
      ].join(';');

      refs.particleContainer.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    }
  }

  function spawnFloatText(x, y, text, color = '#2ecfcf') {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.cssText = `left:${x - 30}px; top:${y - 20}px; color:${color};`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  function closeOverlay() {
    refs.overlay.classList.remove('visible');
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    spawnParticles(cx, cy, 'amber-spark');
  }

  function setActiveButton(activeBtn) {
    refs.nav.querySelectorAll('.nav-btn.active').forEach((btn) => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  function cleanupCenter() {
    if (typeof heroCleanup === 'function') {
      heroCleanup();
      heroCleanup = null;
    }
    refs.center.replaceChildren();
  }

  function renderPlaceholder(sectionKey) {
    cleanupCenter();
    const info = sections[sectionKey];
    const wrap = document.createElement('div');
    wrap.className = 'heroe-system';
    wrap.style.justifyContent = 'center';
    wrap.style.alignItems = 'center';
    wrap.innerHTML = `<div style="text-align:center;color:var(--text-mid)"><h3>${info.icon} ${info.title}</h3><p style="margin-top:6px;font-size:.8rem">${info.desc || 'Sin contenido por ahora.'}</p></div>`;
    refs.center.appendChild(wrap);
  }

  function renderHeroSection() {
    cleanupCenter();

    const panel = document.createElement('div');
    panel.className = 'heroe-system';
    panel.innerHTML = `
      <div class="section-label">── ESTADÍSTICAS ──</div>
      <div class="stats-panel">
        <div class="stats-grid" id="statsGrid"></div>
      </div>
      <div class="section-label">── EQUIPAMIENTO ──</div>
      <div class="equip-grid" id="equipGrid"></div>
      <div class="overlay" id="overlay">
        <div class="upgrade-card" id="upgradeCard"></div>
      </div>`;
    refs.center.appendChild(panel);

    const heroRefs = {
      statsGrid: panel.querySelector('#statsGrid'),
      equipGrid: panel.querySelector('#equipGrid'),
      overlay: panel.querySelector('#overlay'),
      upgradeCard: panel.querySelector('#upgradeCard')
    };

    const listeners = [];
    const on = (element, eventName, handler, options) => {
      element.addEventListener(eventName, handler, options);
      listeners.push(() => element.removeEventListener(eventName, handler, options));
    };

    let currentUpgradeKey = null;

    function renderStats() {
      const stats = window.heroEngine.computeStats(window.gameCharacter);
      heroRefs.statsGrid.innerHTML = '';
      for (const meta of window.STAT_META) {
        const chip = document.createElement('div');
        chip.className = 'stat-chip';
        if (meta.dummy) {
          chip.innerHTML = `
            <span class="stat-icon">${meta.icon}</span>
            <span class="stat-lbl">${meta.label}</span>
            <span class="stat-val">--</span>`;
        } else {
          const val = stats[meta.key];
          chip.innerHTML = `
            <span class="stat-icon">${meta.icon}</span>
            <span class="stat-lbl">${meta.label}</span>
            <span class="stat-val">${window.heroEngine.fmtStat(meta, val)}</span>`;
        }
        heroRefs.statsGrid.appendChild(chip);
      }
      syncTopStats();
    }

    function closeUpgrade() {
      heroRefs.overlay.classList.remove('active');
      currentUpgradeKey = null;
    }

    function renderUpgradeCard(key) {
      const data = window.EQUIPMENT_DATA[key];
      const lvl = window.gameCharacter.levels[key];
      const cost = window.heroEngine.getUpgradeCost(key, lvl);
      const isMax = cost === null;
      const canBuy = !isMax && window.gameCharacter.gold >= cost;
      const rk = window.heroEngine.rankName(lvl);
      const rkNext = window.heroEngine.rankName(lvl + 1);
      const card = heroRefs.upgradeCard;

      card.style.borderColor = `${rk.color}40`;

      let content = `
        <span class="uc-close" id="ucClose">✕</span>
        <div class="uc-header">
          <span class="uc-icon">${data.icon}</span>
          <div class="uc-head-info">
            <div class="uc-name">${data.name}</div>
            <span class="uc-rank-badge" style="background:${rk.bg};color:${rk.color}">${rk.label}</span>
          </div>
        </div>
        <div class="uc-level-row">
          <div class="uc-lvl-block">
            <div class="uc-lvl-lbl">Nivel actual</div>
            <div class="uc-lvl-num cur-num">${lvl}</div>
          </div>
          <span class="uc-arrow">→</span>
          <div class="uc-lvl-block">
            <div class="uc-lvl-lbl">Próximo nivel</div>
            <div class="uc-lvl-num nxt-num" style="color:${isMax ? '#f0a500' : rkNext.color}">
              ${isMax ? 'MAX' : lvl + 1}
            </div>
          </div>
        </div>`;

      if (isMax) {
        content += '<div class="uc-max-msg">⭐ ¡Nivel Máximo alcanzado! ⭐</div>';
      } else {
        content += '<div class="uc-stats-label">✦ Estadísticas por mejora</div>';
        content += '<div class="uc-stats">';
        for (const [stat, amount] of Object.entries(data.stats)) {
          const meta = window.STAT_META.find((m) => m.key === stat);
          const icon = meta ? meta.icon : '';
          content += `
            <div class="uc-stat-row">
              <span class="uc-stat-name">${icon} ${stat}</span>
              <span class="uc-stat-gain">${window.heroEngine.fmtGain(stat, amount)}</span>
            </div>`;
        }
        content += '</div>';
        content += `
          <div class="uc-cost-row">
            <div class="uc-cost-left">
              <div class="uc-cost-lbl">Costo de mejora</div>
              <div class="uc-cost-val">🪙 ${window.heroEngine.fmtNum(cost)}</div>
            </div>
            <div class="uc-have-row">
              <div class="uc-have-lbl">Tu oro</div>
              <div class="uc-have-val ${canBuy ? 'enough' : 'not-enough'}">${window.heroEngine.fmtNum(window.gameCharacter.gold)}</div>
            </div>
          </div>
          <button class="uc-btn ${canBuy ? 'can-upgrade' : 'cant-upgrade'}" id="ucUpgradeBtn">
            ${canBuy ? '⬆ MEJORAR' : '❌ Oro insuficiente'}
          </button>`;
      }

      card.innerHTML = content;
      const closeBtn = card.querySelector('#ucClose');
      if (closeBtn) on(closeBtn, 'click', closeUpgrade);

      if (!isMax && canBuy) {
        const upgradeBtn = card.querySelector('#ucUpgradeBtn');
        if (upgradeBtn) on(upgradeBtn, 'click', () => doUpgrade(key));
      }
    }

    function openUpgrade(key) {
      currentUpgradeKey = key;
      renderUpgradeCard(key);
      heroRefs.overlay.classList.add('active');
    }

    function renderEquipment() {
      heroRefs.equipGrid.innerHTML = '';
      for (const key of window.SLOT_ORDER) {
        const data = window.EQUIPMENT_DATA[key];
        const lvl = window.gameCharacter.levels[key];
        const rc = window.heroEngine.rankClass(lvl);
        const slot = document.createElement('div');
        slot.className = `slot ${rc}`;
        slot.id = `slot-${key}`;
        slot.innerHTML = `
          <span class="slot-icon">${data.icon}</span>
          <span class="slot-name">${data.name}</span>
          <span class="slot-lvl">Nv. ${lvl}</span>`;
        on(slot, 'click', () => openUpgrade(key));
        heroRefs.equipGrid.appendChild(slot);
      }
    }

    function doUpgrade(key) {
      const lvl = window.gameCharacter.levels[key];
      const cost = window.heroEngine.getUpgradeCost(key, lvl);
      if (cost === null || window.gameCharacter.gold < cost) return;

      window.gameCharacter.gold -= cost;
      window.gameCharacter.levels[key] += 1;
      state.gold = window.gameCharacter.gold;

      renderStats();

      const slotEl = heroRefs.equipGrid.querySelector(`#slot-${key}`);
      if (slotEl) {
        const data = window.EQUIPMENT_DATA[key];
        const newLvl = window.gameCharacter.levels[key];
        const rc = window.heroEngine.rankClass(newLvl);
        slotEl.className = `slot ${rc}`;
        slotEl.innerHTML = `
          <span class="slot-icon">${data.icon}</span>
          <span class="slot-name">${data.name}</span>
          <span class="slot-lvl">Nv. ${newLvl}</span>`;
        slotEl.classList.add('flash');
        window.setTimeout(() => slotEl.classList.remove('flash'), 600);
      }

      renderUpgradeCard(key);
    }

    on(heroRefs.overlay, 'click', (e) => {
      if (e.target === heroRefs.overlay) closeUpgrade();
    });

    renderStats();
    renderEquipment();

    heroCleanup = () => {
      listeners.forEach((off) => off());
      listeners.length = 0;
      currentUpgradeKey = null;
      heroRefs.overlay.classList.remove('active');
      panel.remove();
    };
  }

  function openSection(sectionKey, buttonEl) {
    const info = sections[sectionKey];
    if (!info) return;

    const rect = buttonEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    spawnParticles(cx, cy, 'smoke');
    spawnParticles(cx, cy, 'chakra');
    spawnFloatText(cx, cy, `▶ ${labels[sectionKey] || sectionKey}`, '#e8923a');

    setActiveButton(buttonEl);
    state.activeSection = sectionKey;

    if (sectionKey === 'heroe') {
      refs.overlay.classList.remove('visible');
      renderHeroSection();
      return;
    }

    renderPlaceholder(sectionKey);
    refs.overlayTitle.textContent = `${info.icon} ${info.title}`;
    refs.overlayDesc.textContent = info.desc;
    refs.overlay.classList.add('visible');
  }

  function handleNavClick(event) {
    const btn = event.target.closest('.nav-btn');
    if (!btn || !refs.nav.contains(btn)) return;

    const { section } = btn.dataset;
    openSection(section, btn);
  }

  function handleOverlayClick(event) {
    if (event.target.id === 'overlayClose' || event.target === refs.overlay) {
      closeOverlay();
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && refs.overlay.classList.contains('visible')) {
      closeOverlay();
    }
  }

  function start() {
    refs.nav.addEventListener('click', handleNavClick, { signal });
    refs.overlay.addEventListener('click', handleOverlayClick, { signal });
    document.addEventListener('keydown', handleKeyDown, { signal });

    updateBars();
    barsIntervalId = window.setInterval(updateBars, 800);

    const heroBtn = document.getElementById('btn-heroe');
    if (heroBtn) {
      openSection('heroe', heroBtn);
    }
  }

  function destroy() {
    controller.abort();
    cleanupCenter();
    if (barsIntervalId !== null) {
      window.clearInterval(barsIntervalId);
      barsIntervalId = null;
    }
  }

  window.__ninjaHud = { destroy };
  start();
})();
