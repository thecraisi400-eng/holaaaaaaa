(() => {
  if (window.__ninjaHud?.destroy) {
    window.__ninjaHud.destroy();
  }

  const state = {
    hp: 720,
    hpMax: 1000,
    mp: 290,
    mpMax: 500,
    exp: 0,
    expMax: 100,
    gold: 100,
    atk: 1240,
    def: 880,
    level: 1,
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
    app: document.getElementById('app'),
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
    hpMax: document.getElementById('hpMax'),
    hpPct: document.getElementById('hpPct'),
    mpCur: document.getElementById('mpCur'),
    mpMax: document.getElementById('mpMax'),
    mpPct: document.getElementById('mpPct'),
    expNext: document.getElementById('expNext'),
    statAtk: document.getElementById('statAtk'),
    statDef: document.getElementById('statDef'),
    statGold: document.getElementById('statGold'),
    charName: document.getElementById('charName'),
    charRank: document.getElementById('charRank'),
    avatarFrame: document.getElementById('avatarFrame')
  };

  const controller = new AbortController();
  const { signal } = controller;
  let barsIntervalId = null;
  let heroCleanup = null;
  let misionesCleanup = null;
  let selectedCharacter = null;
  let gameLaunched = false;
  const uiCache = {
    hpPct: null,
    mpPct: null,
    expPct: null,
    hp: null,
    hpMax: null,
    mp: null,
    mpMax: null,
    exp: null,
    expMax: null,
    topGold: null,
    topAtk: null,
    topDef: null
  };

  const defaultLevels = { cabeza: 1, pecho: 1, manos: 1, piernas: 1, pies: 1, accesorio: 1 };
  const baseCharacter = {
    gold: state.gold,
    levels: { ...defaultLevels }
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

  function ensureCharacterScript() {
    if (Array.isArray(window.PERSONAJES_DATA)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'personajes.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar personajes.js'));
      document.head.appendChild(script);
    });
  }

  function hideMainHud() {
    refs.app.style.display = 'none';
    refs.overlay.style.display = 'none';
    refs.particleContainer.style.display = 'none';
  }

  function showMainHud() {
    refs.app.style.display = '';
    refs.overlay.style.display = '';
    refs.particleContainer.style.display = '';
  }

  function applyCharacterToGame(char) {
    selectedCharacter = char;
    const baseStats = char.formula(1);

    window.BASE_STATS = {
      HP: baseStats.HP,
      MP: baseStats.MP,
      ATK: baseStats.ATK,
      DEF: baseStats.DEF,
      VEL: baseStats.VEL,
      CTR: baseStats.CTR,
      EVA: baseStats.EVA,
      RES: baseStats.RES,
      REGEN: baseStats.REGEN,
      ASPD: baseStats.ASPD,
      CDMG: baseStats.CDMG
    };

    state.level = 1;
    state.hp = baseStats.HP;
    state.hpMax = baseStats.HP;
    state.mp = baseStats.MP;
    state.mpMax = baseStats.MP;
    state.exp = 0;
    state.expMax = baseStats.XP;
    state.gold = 100;
    window.gameCharacter.gold = 100;
    window.gameCharacter.levels = { ...defaultLevels };

    refs.charName.textContent = char.name.toUpperCase();
    refs.charRank.textContent = char.rank;

    const avatar = refs.avatarFrame.querySelector('.avatar-placeholder');
    if (avatar) avatar.textContent = char.emoji;
  }

  function syncTopStats() {
    const stats = window.heroEngine.computeStats(window.gameCharacter);
    const nextGold = Number(window.gameCharacter.gold || 0).toLocaleString();
    const nextAtk = Number(stats.ATK || 0).toLocaleString('es-ES', { maximumFractionDigits: 1 });
    const nextDef = Number(stats.DEF || 0).toLocaleString('es-ES', { maximumFractionDigits: 1 });
    if (uiCache.topGold !== nextGold) {
      uiCache.topGold = nextGold;
      refs.statGold.textContent = nextGold;
    }
    if (uiCache.topAtk !== nextAtk) {
      uiCache.topAtk = nextAtk;
      refs.statAtk.textContent = nextAtk;
    }
    if (uiCache.topDef !== nextDef) {
      uiCache.topDef = nextDef;
      refs.statDef.textContent = nextDef;
    }
  }

  function refreshResourceBars() {
    const hpPct = Math.round((state.hp / state.hpMax) * 100);
    const mpPct = Math.round((state.mp / state.mpMax) * 100);
    const expPct = Math.round((state.exp / state.expMax) * 100);

    if (uiCache.hpPct !== hpPct) {
      uiCache.hpPct = hpPct;
      refs.hpFill.style.width = `${hpPct}%`;
      refs.hpPct.textContent = `${hpPct}%`;
    }
    if (uiCache.mpPct !== mpPct) {
      uiCache.mpPct = mpPct;
      refs.mpFill.style.width = `${mpPct}%`;
      refs.mpPct.textContent = `${mpPct}%`;
    }
    if (uiCache.expPct !== expPct) {
      uiCache.expPct = expPct;
      refs.expFill.style.width = `${expPct}%`;
    }
    if (uiCache.hp !== state.hp) {
      uiCache.hp = state.hp;
      refs.hpCur.textContent = state.hp;
    }
    if (uiCache.hpMax !== state.hpMax) {
      uiCache.hpMax = state.hpMax;
      refs.hpMax.textContent = state.hpMax;
    }
    if (uiCache.mp !== state.mp) {
      uiCache.mp = state.mp;
      refs.mpCur.textContent = state.mp;
    }
    if (uiCache.mpMax !== state.mpMax) {
      uiCache.mpMax = state.mpMax;
      refs.mpMax.textContent = state.mpMax;
    }
    if (uiCache.exp !== state.exp || uiCache.expMax !== state.expMax) {
      uiCache.exp = state.exp;
      uiCache.expMax = state.expMax;
      refs.expNext.textContent = `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
    }
  }

  function syncCombatResources() {
    const stats = window.heroEngine.computeStats(window.gameCharacter);
    const nextHpMax = Math.max(1, Math.round(stats.HP || state.hpMax));
    const nextMpMax = Math.max(1, Math.round(stats.MP || state.mpMax));
    const hpDelta = nextHpMax - state.hpMax;
    const mpDelta = nextMpMax - state.mpMax;

    state.hpMax = nextHpMax;
    state.mpMax = nextMpMax;
    state.hp = Math.max(0, Math.min(state.hpMax, state.hp + hpDelta));
    state.mp = Math.max(0, Math.min(state.mpMax, state.mp + mpDelta));
  }

  function updateLevelScaling() {
    if (!selectedCharacter) return;
    const leveledStats = selectedCharacter.formula(state.level);
    window.BASE_STATS = {
      HP: leveledStats.HP,
      MP: leveledStats.MP,
      ATK: leveledStats.ATK,
      DEF: leveledStats.DEF,
      VEL: leveledStats.VEL,
      CTR: leveledStats.CTR,
      EVA: leveledStats.EVA,
      RES: leveledStats.RES,
      REGEN: leveledStats.REGEN,
      ASPD: leveledStats.ASPD,
      CDMG: leveledStats.CDMG
    };
    syncCombatResources();
  }

  function applyCombatRewards(reward) {
    if (!reward) return;
    let valuesChanged = false;
    if (reward.gold > 0) {
      state.gold += reward.gold;
      window.gameCharacter.gold = state.gold;
      valuesChanged = true;
    }
    if (reward.xp > 0 && selectedCharacter) {
      state.exp += reward.xp;
      while (state.exp >= state.expMax) {
        state.exp -= state.expMax;
        state.level += 1;
        state.expMax = selectedCharacter.formula(state.level).XP;
        updateLevelScaling();
      }
      valuesChanged = true;
    }
    if (valuesChanged) {
      refreshResourceBars();
      syncTopStats();
    }
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
    if (typeof misionesCleanup === 'function') {
      misionesCleanup();
      misionesCleanup = null;
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


  function renderMisionesSection() {
    cleanupCenter();

    const panel = document.createElement('div');
    panel.className = 'heroe-system';
    panel.style.padding = '0';
    refs.center.appendChild(panel);

    const playerStats = {
      get hp() { return state.hp; },
      set hp(value) { state.hp = Math.max(0, Math.round(value)); refreshResourceBars(); },
      get maxHp() { return state.hpMax; },
      get mp() { return state.mp; },
      set mp(value) { state.mp = Math.max(0, Math.round(value)); refreshResourceBars(); },
      get maxMp() { return state.mpMax; },
      get atk() { return Math.max(1, Math.round(window.heroEngine.computeStats(window.gameCharacter).ATK || state.atk)); },
      get def() { return Math.max(1, Math.round(window.heroEngine.computeStats(window.gameCharacter).DEF || state.def)); },
      get level() { return state.level; }
    };

    const ui = window.createMisionesRangoUI({
      container: panel,
      getPlayerStats: () => playerStats,
      onRewardGain: ({ xp, gold }) => {
        applyCombatRewards({ xp, gold });
      },
      onCombatStateChange: (active) => {
        refs.overlay.classList.remove('visible');
        refs.nav.style.pointerEvents = active ? 'none' : '';
        refs.nav.style.opacity = active ? '0.4' : '';
      },
      onReturn: () => {
        refs.nav.style.pointerEvents = '';
        refs.nav.style.opacity = '';
      }
    });

    misionesCleanup = () => {
      ui.destroy();
      panel.remove();
      refs.nav.style.pointerEvents = '';
      refs.nav.style.opacity = '';
    };
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
      syncCombatResources();
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
      refreshResourceBars();
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

    if (sectionKey === 'misiones') {
      refs.overlay.classList.remove('visible');
      renderMisionesSection();
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

  function mountStartMenu(onChooseCharacter) {
    if (document.getElementById('ninja-start-root')) return;

    const style = document.createElement('style');
    style.id = 'ninja-start-style';
    style.textContent = `
      #ninja-start-root{position:fixed;inset:0;background:#050810;display:flex;justify-content:center;align-items:center;z-index:9999;font-family:'Exo 2',sans-serif;}
      #ninja-start-root #game{width:355px;height:500px;background:#fff;border-radius:4px;overflow:hidden;position:relative}
      #ninja-start-root .screen{width:355px;height:500px;background:#0d1117;position:absolute;top:0;left:0;display:none;flex-direction:column;overflow:hidden}
      #ninja-start-root .screen.active{display:flex}
      #ninja-start-root .menu-bg{position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 30%,rgba(232,160,32,.08) 0%,transparent 70%),radial-gradient(ellipse 80% 60% at 50% 80%,rgba(77,184,255,.06) 0%,transparent 70%),#0d1117}
      #ninja-start-root .menu-inner{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;width:100%;padding:0 24px}
      #ninja-start-root #s-menu{justify-content:center;align-items:center}
      #ninja-start-root .logo-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:28px}
      #ninja-start-root .logo-kanji{font-size:48px;line-height:1;margin-bottom:4px;filter:drop-shadow(0 0 12px rgba(232,160,32,.6))}
      #ninja-start-root .logo-title{font-family:'Cinzel',serif;font-size:22px;font-weight:900;color:#f0c040;letter-spacing:4px;text-shadow:0 0 20px rgba(240,192,64,.5);text-transform:uppercase}
      #ninja-start-root .logo-sub{font-size:9px;color:#6a82a0;letter-spacing:5px;text-transform:uppercase;margin-top:4px}
      #ninja-start-root .divider-line{width:160px;height:1px;background:linear-gradient(90deg,transparent,#e8a020,transparent);margin:20px 0}
      #ninja-start-root .menu-btn{width:100%;max-width:240px;padding:12px 0;margin-bottom:10px;border-radius:3px;cursor:pointer;font-family:'Cinzel',serif;font-size:13px;font-weight:600;letter-spacing:2px;border:none}
      #ninja-start-root .btn-primary{background:linear-gradient(135deg,#1e3060 0%,#162440 100%);color:#f0c040;border:1px solid rgba(240,192,64,.35)}
      #ninja-start-root .btn-secondary{background:#162035;color:#6a82a0;border:1px solid rgba(77,184,255,.18)}
      #ninja-start-root .menu-version{font-size:9px;color:#6a82a0;letter-spacing:2px;margin-top:20px;opacity:.5}
      #ninja-start-root .hdr{background:#131a26;border-bottom:1px solid rgba(77,184,255,.18);padding:6px 12px;display:flex;align-items:center;gap:8px;flex-shrink:0}
      #ninja-start-root .hdr-title{font-family:'Cinzel',serif;font-size:11px;color:#e8a020;letter-spacing:2px;text-transform:uppercase}
      #ninja-start-root .hdr-back{background:#162035;border:1px solid rgba(77,184,255,.18);color:#4db8ff;font-size:10px;padding:2px 8px;border-radius:2px;cursor:pointer}
      #ninja-start-root .char-scroll{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:10px}
      #ninja-start-root .char-sel-card{background:#131a26;border:1px solid rgba(77,184,255,.18);border-radius:4px;padding:10px 12px;cursor:pointer;display:flex;gap:12px;align-items:flex-start}
      #ninja-start-root .char-sel-ava{width:44px;height:44px;border-radius:50%;background:#1c2740;border:2px solid #e8a020;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
      #ninja-start-root .char-sel-name{font-family:'Cinzel',serif;font-size:11px;color:#c8d8f0;font-weight:600;letter-spacing:.5px;margin-bottom:2px}
      #ninja-start-root .char-sel-role{font-size:8px;color:#6a82a0;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px}
      #ninja-start-root .char-sel-bars{display:grid;grid-template-columns:1fr 1fr;gap:2px 10px}
      #ninja-start-root .cbar-row{font-size:8px;color:#6a82a0;display:flex;justify-content:space-between;line-height:1.5}
      #ninja-start-root .s-muy-alto{color:#4dffb0!important} #ninja-start-root .s-alto{color:#4db8ff!important} #ninja-start-root .s-medio{color:#c8d8f0!important} #ninja-start-root .s-bajo{color:#e87040!important} #ninja-start-root .s-muyBajo{color:#e84040!important}
      #ninja-start-root #s-load{justify-content:center;align-items:center}
      #ninja-start-root .load-msg{font-family:'Cinzel',serif;font-size:13px;color:#6a82a0;text-align:center;letter-spacing:2px;padding:0 32px;line-height:1.8}
      #ninja-start-root .load-msg span{display:block;font-size:32px;margin-bottom:12px}
      #ninja-start-root .load-back-btn{margin-top:24px;background:#162035;border:1px solid rgba(77,184,255,.18);color:#6a82a0;padding:8px 24px;border-radius:3px;cursor:pointer;font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px}
    `;

    const root = document.createElement('div');
    root.id = 'ninja-start-root';
    root.innerHTML = `
      <div id="game">
        <div id="s-menu" class="screen active">
          <div class="menu-bg"></div>
          <div class="menu-inner">
            <div class="logo-wrap">
              <div class="logo-kanji">忍</div>
              <div class="logo-title">NARUTO</div>
              <div class="logo-sub">Idle RPG</div>
            </div>
            <div class="divider-line"></div>
            <button class="menu-btn btn-primary" data-action="new-game">⚔ NUEVA PARTIDA</button>
            <button class="menu-btn btn-secondary" data-action="load-game">◈ CARGAR PARTIDA</button>
            <div class="menu-version">VER 0.1.0 · ALPHA</div>
          </div>
        </div>
        <div id="s-load" class="screen">
          <div class="load-msg"><span>📂</span>No se encontró ninguna partida guardada.</div>
          <button class="load-back-btn" data-action="back-menu">← VOLVER</button>
        </div>
        <div id="s-char" class="screen">
          <div class="hdr"><button class="hdr-back" data-action="back-menu">← Atrás</button><div class="hdr-title">Elige tu Personaje</div></div>
          <div class="char-scroll" id="char-grid"></div>
        </div>
      </div>`;

    document.head.appendChild(style);
    document.body.appendChild(root);

    const summaryIcons = { HP: '❤️', MP: '💙', ATK: '⚔️', DEF: '🛡️', Vel: '⚡', REGEN: '🌿' };
    const summaryClass = (val) => ({ 'Muy Alto': 's-muy-alto', Alto: 's-alto', Medio: 's-medio', Bajo: 's-bajo', 'Muy Bajo': 's-muyBajo' }[val] || 's-medio');
    const showScreen = (id) => {
      root.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
      root.querySelector(`#${id}`)?.classList.add('active');
    };

    const charGrid = root.querySelector('#char-grid');
    for (const char of window.PERSONAJES_DATA) {
      const card = document.createElement('div');
      card.className = 'char-sel-card';
      const keyStats = ['HP', 'MP', 'ATK', 'DEF', 'Vel', 'REGEN'];
      const barsHtml = keyStats.map((k) => {
        const value = char.summary[k];
        return `<div class="cbar-row"><span>${summaryIcons[k]} ${k}</span><span class="${summaryClass(value)}">${value}</span></div>`;
      }).join('');

      card.innerHTML = `
        <div class="char-sel-ava" style="border-color:${char.color}">${char.emoji}</div>
        <div class="char-sel-info">
          <div class="char-sel-name">${char.name}</div>
          <div class="char-sel-role">${char.role}</div>
          <div class="char-sel-bars">${barsHtml}</div>
        </div>`;

      card.addEventListener('click', () => onChooseCharacter(char), { once: true });
      charGrid.appendChild(card);
    }

    root.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      if (action === 'new-game') showScreen('s-char');
      if (action === 'load-game') showScreen('s-load');
      if (action === 'back-menu') showScreen('s-menu');
    }, { signal });
  }

  function unmountStartMenu() {
    document.getElementById('ninja-start-root')?.remove();
    document.getElementById('ninja-start-style')?.remove();
  }

  function launchGame(char) {
    if (gameLaunched) return;
    gameLaunched = true;

    applyCharacterToGame(char);
    unmountStartMenu();
    showMainHud();

    refs.nav.addEventListener('click', handleNavClick, { signal });
    refs.overlay.addEventListener('click', handleOverlayClick, { signal });
    document.addEventListener('keydown', handleKeyDown, { signal });

    refreshResourceBars();
    syncTopStats();

    const heroBtn = document.getElementById('btn-heroe');
    if (heroBtn) {
      openSection('heroe', heroBtn);
    }
  }

  async function start() {
    hideMainHud();
    await ensureCharacterScript();
    mountStartMenu((char) => {
      launchGame(char);
    });
  }

  function destroy() {
    gameLaunched = false;
    controller.abort();
    cleanupCenter();
    unmountStartMenu();
    if (barsIntervalId !== null) window.clearInterval(barsIntervalId);
    barsIntervalId = null;
  }

  window.__ninjaHud = { destroy, selectedCharacter: () => selectedCharacter };
  start();
})();
