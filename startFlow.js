(() => {
  const overlay = document.getElementById('start-overlay');
  if (!overlay) return;

  const screens = {
    menu: document.getElementById('s-menu'),
    load: document.getElementById('s-load'),
    clan: document.getElementById('s-clan'),
    char: document.getElementById('s-char'),
    profile: document.getElementById('s-profile'),
  };

  const clanGrid = document.getElementById('clan-grid');
  const charList = document.getElementById('char-list');
  const profileBody = document.getElementById('profile-body');
  const charClanLabel = document.getElementById('char-clan-label');
  const loadMsg = overlay.querySelector('.load-msg');

  const summaryIcons = { HP:'❤️', MP:'💙', ATK:'⚔️', DEF:'🛡️', Vel:'⚡', CRT:'🎯', CDMG:'💥', EVA:'💨', RES:'🧠', REGEN:'🌿' };
  const statLabels = [
    { k:'HP', icon:'❤️', label:'HP' },
    { k:'MP', icon:'💙', label:'MP' },
    { k:'ATK', icon:'⚔️', label:'ATK' },
    { k:'DEF', icon:'🛡️', label:'DEF' },
    { k:'Vel', icon:'⚡', label:'Vel' },
    { k:'CRT', icon:'🎯', label:'CRT', pct:true },
    { k:'CDMG', icon:'💥', label:'CDMG', pct:true },
    { k:'EVA', icon:'💨', label:'EVA', pct:true },
    { k:'RES', icon:'🧠', label:'RES', pct:true },
    { k:'REGEN', icon:'🌿', label:'REGEN', pct:true },
  ];

  const state = {
    activeScreen: 'menu',
    selectedClan: null,
    selectedChar: null,
  };

  const CLANS = (window.gameData?.startOptions || []).map((clan) => ({
    ...clan,
    color: clan.color || '#4db8ff',
    summary: {
      ...clan.summary,
      CDMG: clan.summary.CDMG || 'Medio',
      EVA: clan.summary.EVA || 'Medio',
      RES: clan.summary.RES || 'Medio',
      REGEN: clan.summary.REGEN || 'Bajo',
    },
    memberEmoji: clan.members.map((member) => member.emoji),
    members: clan.members.map((member) => member.name),
  }));

  let keydownHandler = null;

  function openScreen(id) {
    Object.values(screens).forEach((screen) => screen.classList.remove('active'));
    screens[id]?.classList.add('active');
    state.activeScreen = id;
  }

  function teardownOverlay() {
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
    overlay.removeEventListener('click', onOverlayClick);
    overlay.classList.add('hidden');
  }

  function colorClass(value) {
    const normalized = String(value).replace(/\s+/g, '').toLowerCase();
    if (normalized === 'muyalto') return 's-muy-alto';
    if (normalized === 'alto') return 's-alto';
    if (normalized === 'bajo') return 's-bajo';
    return 's-medio';
  }

  function renderClanGrid() {
    clanGrid.innerHTML = '';

    CLANS.forEach((clan, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'clan-card';
      card.style.setProperty('--clan-color', clan.color);
      card.dataset.clanIndex = String(index);

      const statsHtml = Object.entries(clan.summary).map(([key, value]) => `
        <div class="stat-row">
          <span>${summaryIcons[key] || ''} ${key}</span>
          <span class="${colorClass(value)}">${value}</span>
        </div>`).join('');

      card.innerHTML = `
        <div class="clan-name">${clan.emoji} ${clan.name}</div>
        <div class="clan-stats">${statsHtml}</div>
      `;

      clanGrid.appendChild(card);
    });
  }

  function renderCharacters() {
    if (!state.selectedClan) return;

    charClanLabel.textContent = state.selectedClan.name;
    charList.innerHTML = '';

    state.selectedClan.members.forEach((name, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'char-card';
      card.dataset.memberIndex = String(i);
      card.innerHTML = `
        <div class="char-avatar">${state.selectedClan.memberEmoji[i]}</div>
        <div class="char-info">
          <div class="char-name">${name}</div>
          <div class="char-clan-label">${state.selectedClan.name}</div>
        </div>
        <div class="char-arrow">›</div>
      `;

      charList.appendChild(card);
    });
  }

  function renderProfile() {
    if (!state.selectedClan || !state.selectedChar) return;

    const stats = state.selectedClan.formula(1);
    const statsMax = state.selectedClan.formula(100);
    const hpPct = Math.round((stats.HP / statsMax.HP) * 100);
    const mpPct = Math.round((stats.MP / statsMax.MP) * 100);

    const statsChips = statLabels.map((stat) => {
      const val = stat.pct ? `${stats[stat.k]}%` : stats[stat.k];
      return `<div class="stat-chip"><span class="chip-label">${stat.icon} ${stat.label}</span><span class="chip-val">${val}</span></div>`;
    }).join('');

    profileBody.innerHTML = `
      <div class="profile-hero">
        <div class="profile-ava">${state.selectedChar.emoji}</div>
        <div class="profile-meta">
          <div class="profile-name">${state.selectedChar.name}</div>
          <div class="profile-clan">${state.selectedClan.name}</div>
          <div class="profile-lvl-row">
            <div class="lvl-badge">LVL 1</div>
            <div class="xp-bar-wrap">
              <div class="xp-label">XP: 0 / ${stats.XP.toLocaleString()}</div>
              <div class="xp-bar"><div class="xp-fill" style="width:0%"></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="vitals">
        <div class="vital-row">
          <div>❤️</div>
          <div class="vital-label">HP</div>
          <div class="vital-bar"><div class="vital-fill fill-hp" style="width:${hpPct}%"></div></div>
          <div class="vital-val">${stats.HP}</div>
        </div>
        <div class="vital-row">
          <div>💙</div>
          <div class="vital-label">MP</div>
          <div class="vital-bar"><div class="vital-fill fill-mp" style="width:${mpPct}%"></div></div>
          <div class="vital-val">${stats.MP}</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stats-title">Estadísticas Base · Nivel 1</div>
        ${statsChips}
      </div>

      <button class="start-confirm-btn" type="button" data-action="confirm-start">⚔ Iniciar aventura</button>
    `;
  }

  function computeLevelGains(option) {
    const lv1 = option.formula(1) || {};
    const lv2 = option.formula(2) || {};
    const keys = ['HP', 'MP', 'ATK', 'DEF'];

    return keys.reduce((acc, key) => {
      const gain = (Number(lv2[key]) || 0) - (Number(lv1[key]) || 0);
      if (gain !== 0) acc[key] = gain;
      return acc;
    }, {});
  }

  function startGame() {
    if (!state.selectedClan || !state.selectedChar || !window.gameEngine?.init) return;

    window.gameEngine.init({
      profile: {
        avatar: state.selectedChar.emoji,
        charName: state.selectedChar.name,
        rank: state.selectedClan.name,
        stats: state.selectedClan.formula(1),
        levelGains: computeLevelGains(state.selectedClan),
        gold: 500,
      },
      forceNewGame: true,
    });

    teardownOverlay();
  }

  function tryLoadGame() {
    if (!window.gameEngine?.hasSaveGame || !window.gameEngine.hasSaveGame()) {
      loadMsg.innerHTML = '<span>📂</span>No se encontró ninguna partida guardada.';
      openScreen('load');
      return;
    }

    window.gameEngine.init();
    if (window.gameEngine.loadGame && !window.gameEngine.loadGame()) {
      loadMsg.innerHTML = '<span>⚠️</span>No se pudo cargar la partida guardada.';
      openScreen('load');
      return;
    }

    teardownOverlay();
  }

  function onOverlayClick(event) {
    const actionNode = event.target.closest('[data-action]');
    const clanNode = event.target.closest('.clan-card');
    const memberNode = event.target.closest('.char-card');

    if (actionNode) {
      const { action } = actionNode.dataset;
      if (action === 'to-menu') openScreen('menu');
      if (action === 'to-load') tryLoadGame();
      if (action === 'to-clan') {
        renderClanGrid();
        openScreen('clan');
      }
      if (action === 'to-char') openScreen('char');
      if (action === 'confirm-start') startGame();
      return;
    }

    if (clanNode) {
      const clan = CLANS[Number(clanNode.dataset.clanIndex)];
      if (!clan) return;
      state.selectedClan = clan;
      state.selectedChar = null;
      renderCharacters();
      openScreen('char');
      return;
    }

    if (memberNode && state.selectedClan) {
      const index = Number(memberNode.dataset.memberIndex);
      state.selectedChar = {
        name: state.selectedClan.members[index],
        emoji: state.selectedClan.memberEmoji[index],
      };
      renderProfile();
      openScreen('profile');
    }
  }

  function setupKeyboardNavigation() {
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
    }

    keydownHandler = (event) => {
      if (overlay.classList.contains('hidden') || event.key !== 'Escape') return;

      if (state.activeScreen === 'profile') {
        openScreen('char');
      } else if (state.activeScreen === 'char') {
        openScreen('clan');
      } else if (state.activeScreen === 'clan' || state.activeScreen === 'load') {
        openScreen('menu');
      }
    };

    document.addEventListener('keydown', keydownHandler);
  }

  function initStartFlow() {
    overlay.removeEventListener('click', onOverlayClick);
    overlay.addEventListener('click', onOverlayClick);

    setupKeyboardNavigation();
    openScreen('menu');

    if (window.gameEngine?.hasSaveGame && window.gameEngine.hasSaveGame()) {
      window.gameEngine.init();
      teardownOverlay();
    }
  }

  initStartFlow();
})();
