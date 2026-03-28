(() => {
  if (window.__ninjaHud?.destroy) {
    window.__ninjaHud.destroy();
  }

  const SAVE_KEY = 'ninjaHudSaveV1';

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
    activeSection: 'heroe',
    phase: 'boot',
    selectedCharacterId: null
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
    hpPct: document.getElementById('hpPct'),
    mpCur: document.getElementById('mpCur'),
    mpPct: document.getElementById('mpPct'),
    expNext: document.getElementById('expNext'),
    statAtk: document.getElementById('statAtk'),
    statDef: document.getElementById('statDef'),
    statGold: document.getElementById('statGold'),
    hpMax: document.getElementById('hpMax'),
    mpMax: document.getElementById('mpMax'),
    charName: document.getElementById('charName'),
    charRank: document.getElementById('charRank'),
    avatarFrame: document.getElementById('avatarFrame')
  };

  const controller = new AbortController();
  const { signal } = controller;
  let barsIntervalId = null;
  let heroCleanup = null;
  let menuRoot = null;

  const baseCharacter = {
    gold: state.gold,
    levels: { cabeza: 1, pecho: 1, manos: 1, piernas: 1, pies: 1, accesorio: 1 },
    level: 1,
    baseStats: { ...window.BASE_STATS }
  };

  window.gameCharacter = window.gameCharacter || new Proxy(baseCharacter, {
    set(target, prop, value) {
      target[prop] = value;
      if (prop === 'gold') {
        state.gold = value;
      }
      syncTopStats();
      persistGame();
      return true;
    }
  });

  function ensureCharacterLibrary() {
    if (Array.isArray(window.NINJA_CHARACTERS) && window.NINJA_CHARACTERS.length) return Promise.resolve();
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'personajes.js';
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  }

  function getCharacters() {
    if (Array.isArray(window.NINJA_CHARACTERS) && window.NINJA_CHARACTERS.length) {
      return window.NINJA_CHARACTERS;
    }
    return [
      {
        id: 'naruto',
        name: 'Naruto Uzumaki',
        role: 'Clan Uzumaki · Hokage',
        rank: 'CHUNIN',
        emoji: '🍥',
        color: '#ff8020',
        formula: (lv) => ({
          HP: 135 + 21 * (lv - 1), MP: 125 + 19 * (lv - 1), ATK: 18 + 11 * (lv - 1), DEF: 10 + 4 * (lv - 1),
          VEL: +(10 + 2 * (lv - 1)).toFixed(1), CTR: +(4 + 0.15 * (lv - 1)).toFixed(2), CDMG: +(150 + 1.0 * (lv - 1)).toFixed(2),
          EVA: +(3 + 0.10 * (lv - 1)).toFixed(2), RES: +(12 + 0.15 * (lv - 1)).toFixed(2), REGEN: +(5 + 0.06 * (lv - 1)).toFixed(2), ASPD: +(0.95 + 0.02 * (lv - 1)).toFixed(2), XP: Math.round(60 * Math.pow(lv, 1.9))
        })
      }
    ];
  }

  function getCurrentCharacterMeta() {
    const finder = window.getNinjaCharacterById;
    if (typeof finder === 'function') {
      return finder(state.selectedCharacterId);
    }
    return getCharacters().find((char) => char.id === state.selectedCharacterId) || getCharacters()[0];
  }

  function persistGame() {
    if (!state.selectedCharacterId) return;
    const payload = {
      selectedCharacterId: state.selectedCharacterId,
      gameCharacter: {
        gold: window.gameCharacter.gold,
        levels: window.gameCharacter.levels,
        level: window.gameCharacter.level,
        baseStats: window.gameCharacter.baseStats
      },
      hud: {
        hp: state.hp, hpMax: state.hpMax, mp: state.mp, mpMax: state.mpMax,
        exp: state.exp, expMax: state.expMax, level: state.level, gold: state.gold
      }
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  }

  function readSave() {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function applyCharacterSelection(characterId, saveData = null) {
    const nextLevel = saveData?.gameCharacter?.level || 1;
    const built = window.heroEngine.createCharacterState(characterId, nextLevel, saveData?.hud);
    if (!built) return false;

    const selectedCharacter = getCharacters().find((char) => char.id === built.characterId) || getCharacters()[0];
    state.selectedCharacterId = selectedCharacter.id;

    window.gameCharacter.level = built.level;
    window.gameCharacter.baseStats = { ...built.baseStats };
    window.gameCharacter.gold = saveData?.gameCharacter?.gold ?? state.gold;
    window.gameCharacter.levels = {
      cabeza: 1, pecho: 1, manos: 1, piernas: 1, pies: 1, accesorio: 1,
      ...(saveData?.gameCharacter?.levels || {})
    };

    state.level = built.level;
    state.hp = built.hp;
    state.hpMax = built.hpMax;
    state.mp = built.mp;
    state.mpMax = built.mpMax;
    state.exp = saveData?.hud?.exp ?? 0;
    state.expMax = built.expMax;
    state.gold = window.gameCharacter.gold;

    refs.charName.textContent = selectedCharacter.name.toUpperCase();
    refs.charRank.textContent = (selectedCharacter.rank || window.heroEngine.computeCurrentRank(state.level)).toUpperCase();
    refs.hpMax.textContent = Math.round(state.hpMax);
    refs.mpMax.textContent = Math.round(state.mpMax);

    const avatar = refs.avatarFrame.querySelector('.avatar-placeholder');
    if (avatar) {
      avatar.textContent = selectedCharacter.emoji;
    }

    syncTopStats();
    updateBars();
    persistGame();
    return true;
  }

  function syncTopStats() {
    const stats = window.heroEngine.computeStats(window.gameCharacter);
    refs.statGold.textContent = Number(window.gameCharacter.gold || 0).toLocaleString();
    refs.statAtk.textContent = Number(stats.ATK || 0).toLocaleString('es-ES', { maximumFractionDigits: 1 });
    refs.statDef.textContent = Number(stats.DEF || 0).toLocaleString('es-ES', { maximumFractionDigits: 1 });
  }

  function updateBars() {
    if (state.phase !== 'playing') return;

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

    refs.hpCur.textContent = Math.round(state.hp);
    refs.hpPct.textContent = `${hpPct}%`;
    refs.mpCur.textContent = Math.round(state.mp);
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
      persistGame();
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
    if (state.phase !== 'playing') return;

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

  function createStartMenu() {
    if (menuRoot) return menuRoot;
    menuRoot = document.createElement('div');
    menuRoot.id = 'startFlow';
    menuRoot.style.cssText = 'position:fixed;inset:0;background:rgba(3,8,16,.95);z-index:9999;display:flex;align-items:center;justify-content:center;font-family:Rajdhani,sans-serif;color:#d8eeff;';
    menuRoot.innerHTML = `
      <div style="width:min(540px,92vw);background:#0d162a;border:1px solid rgba(46,207,207,.4);padding:18px 16px 14px;border-radius:10px;box-shadow:0 0 0 1px rgba(232,146,58,.2) inset;">
        <h2 style="font-family:Orbitron,sans-serif;letter-spacing:.12em;color:#f0b24f;text-align:center;margin:0 0 10px;">NARUTO IDLE RPG</h2>
        <div data-screen="main" style="display:grid;gap:10px;">
          <button data-action="new" style="padding:12px;border:1px solid rgba(240,178,79,.45);background:#172747;color:#f7d38a;font-weight:700;border-radius:8px;cursor:pointer;">⚔ NUEVA PARTIDA</button>
          <button data-action="continue" style="padding:12px;border:1px solid rgba(46,207,207,.35);background:#15273b;color:#b5d8ff;font-weight:700;border-radius:8px;cursor:pointer;">◈ CONTINUAR</button>
          <p id="startMenuMsg" style="min-height:20px;font-size:.85rem;color:#86a8c5;margin:0;text-align:center;"></p>
        </div>
        <div data-screen="select" style="display:none;gap:8px;"></div>
      </div>`;
    document.body.appendChild(menuRoot);
    return menuRoot;
  }

  function renderCharacterSelect() {
    const root = createStartMenu();
    const main = root.querySelector('[data-screen="main"]');
    const select = root.querySelector('[data-screen="select"]');
    main.style.display = 'none';
    select.style.display = 'grid';

    select.innerHTML = '<button data-action="back" style="justify-self:start;padding:8px 10px;background:#1a2e42;color:#b7d6f4;border:1px solid rgba(46,207,207,.35);border-radius:6px;cursor:pointer;">← Volver</button>';
    for (const char of getCharacters()) {
      const card = document.createElement('button');
      card.type = 'button';
      card.dataset.action = 'pick';
      card.dataset.charId = char.id;
      card.style.cssText = `text-align:left;padding:10px 12px;border:1px solid ${char.color}55;background:#13243a;color:#e9f3ff;border-radius:8px;cursor:pointer;`;
      card.innerHTML = `<strong>${char.emoji} ${char.name}</strong><div style="font-size:.85rem;color:#8db4d8;margin-top:2px;">${char.role}</div>`;
      select.appendChild(card);
    }
  }

  function showMainStartMenu(message = '') {
    const root = createStartMenu();
    const main = root.querySelector('[data-screen="main"]');
    const select = root.querySelector('[data-screen="select"]');
    const msg = root.querySelector('#startMenuMsg');
    main.style.display = 'grid';
    select.style.display = 'none';
    msg.textContent = message;
  }

  function closeStartMenu() {
    if (menuRoot) {
      menuRoot.remove();
      menuRoot = null;
    }
    refs.app.style.visibility = 'visible';
    state.phase = 'playing';

    if (barsIntervalId === null) {
      updateBars();
      barsIntervalId = window.setInterval(updateBars, 800);
    }

    const heroBtn = document.getElementById('btn-heroe');
    if (heroBtn) {
      openSection('heroe', heroBtn);
    }
  }

  function handleStartFlowClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl || !menuRoot?.contains(actionEl)) return;

    const { action } = actionEl.dataset;
    if (action === 'new') {
      renderCharacterSelect();
      return;
    }
    if (action === 'back') {
      showMainStartMenu();
      return;
    }
    if (action === 'continue') {
      const saved = readSave();
      if (!saved?.selectedCharacterId) {
        showMainStartMenu('No hay partida guardada. Inicia una nueva partida.');
        return;
      }
      const ok = applyCharacterSelection(saved.selectedCharacterId, saved);
      if (!ok) {
        showMainStartMenu('La partida guardada no es válida.');
        return;
      }
      closeStartMenu();
      return;
    }
    if (action === 'pick') {
      const { charId } = actionEl.dataset;
      const ok = applyCharacterSelection(charId);
      if (!ok) return;
      closeStartMenu();
    }
  }

  function start() {
    refs.app.style.visibility = 'hidden';

    refs.nav.addEventListener('click', handleNavClick, { signal });
    refs.overlay.addEventListener('click', handleOverlayClick, { signal });
    document.addEventListener('keydown', handleKeyDown, { signal });
    document.addEventListener('click', handleStartFlowClick, { signal });
    window.addEventListener('beforeunload', persistGame, { signal });

    showMainStartMenu();
  }

  function destroy() {
    controller.abort();
    cleanupCenter();
    if (barsIntervalId !== null) {
      window.clearInterval(barsIntervalId);
      barsIntervalId = null;
    }
    if (menuRoot) {
      menuRoot.remove();
      menuRoot = null;
    }
  }

  window.__ninjaHud = { destroy };
  ensureCharacterLibrary().finally(start);
})();
