(() => {
  const { clans, statLabels } = window.charData;
  const storageKey = 'ninja_idle_save_v1';

  let selectedClan = null;
  let selectedCharacter = null;

  function showScreen(id) {
    document.querySelectorAll('.setup-screen').forEach((node) => node.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  }

  function getSummaryClass(label) {
    const key = label.toLowerCase().replace(' ', '');
    return ({ muyalto: 's-muy-alto', alto: 's-alto', medio: 's-medio', bajo: 's-bajo' })[key] || 's-medio';
  }

  function renderClanGrid() {
    const grid = document.getElementById('setupClanGrid');
    if (!grid) return;

    grid.innerHTML = clans.map((clan) => {
      const summary = Object.entries(clan.summary).map(([key, value]) => (
        `<div class="setup-stat-row"><span>${key}</span><span class="${getSummaryClass(value)}">${value}</span></div>`
      )).join('');
      return `
        <button class="setup-clan-card" data-clan="${clan.id}" style="--clan-color:${clan.color}">
          <div class="setup-clan-name">${clan.emoji} ${clan.name}</div>
          <div class="setup-clan-stats">${summary}</div>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.setup-clan-card').forEach((node) => {
      node.addEventListener('click', () => selectClan(node.dataset.clan));
    });
  }

  function selectClan(clanId) {
    selectedClan = clans.find((clan) => clan.id === clanId) || null;
    selectedCharacter = null;
    if (!selectedClan) return;

    document.getElementById('setupCharClan').textContent = selectedClan.name;
    const list = document.getElementById('setupCharList');
    list.innerHTML = selectedClan.members.map((name, idx) => `
      <button class="setup-char-card" data-char-index="${idx}">
        <span class="setup-char-avatar">${selectedClan.memberEmoji[idx]}</span>
        <span class="setup-char-name">${name}</span>
      </button>
    `).join('');

    list.querySelectorAll('.setup-char-card').forEach((node) => {
      node.addEventListener('click', () => selectCharacter(Number(node.dataset.charIndex)));
    });

    showScreen('setup-char');
  }

  function selectCharacter(index) {
    const name = selectedClan?.members?.[index];
    const emoji = selectedClan?.memberEmoji?.[index];
    if (!name || !emoji) return;

    selectedCharacter = {
      name,
      emoji,
      clan: selectedClan,
      level: 1,
      stats: selectedClan.formula(1),
    };

    renderProfile();
    showScreen('setup-profile');
  }

  function renderProfile() {
    const profile = document.getElementById('setupProfileBody');
    if (!profile || !selectedCharacter) return;

    const stats = selectedCharacter.stats;
    const statsHtml = statLabels.map((meta) => {
      const value = stats[meta.key];
      const out = meta.pct ? `${value}%` : value;
      return `<div class="setup-stat-chip"><span>${meta.icon} ${meta.label}</span><strong>${out}</strong></div>`;
    }).join('');

    profile.innerHTML = `
      <div class="setup-profile-hero">
        <div class="setup-profile-avatar">${selectedCharacter.emoji}</div>
        <div>
          <div class="setup-profile-name">${selectedCharacter.name}</div>
          <div class="setup-profile-clan">${selectedClan.name}</div>
          <div class="setup-profile-lvl">Nivel 1 · XP 0 / ${stats.XP.toLocaleString('es-ES')}</div>
        </div>
      </div>
      <div class="setup-profile-stats">${statsHtml}</div>
    `;
  }

  function completeSetup() {
    if (!selectedCharacter) return;
    window.charLogic.applySelection(selectedCharacter);
    const overlay = document.getElementById('startupOverlay');
    if (overlay) overlay.classList.remove('visible');
    window.gameEngine?.init?.();
  }

  function tryLoadSave() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      document.getElementById('setupLoadText').textContent = 'No se encontró ninguna partida guardada.';
      showScreen('setup-load');
      return;
    }

    try {
      const save = JSON.parse(raw);
      const syntheticSelection = {
        name: save.charName || window.gameData.initialState.charName,
        emoji: save.charEmoji || '🥷',
        clan: { name: save.charClan || 'Clan Shinobi' },
        stats: {
          XP: save.expMax || window.gameData.initialState.expMax,
          hpMax: save.hpMax || window.gameData.initialState.hpMax,
          mpMax: save.mpMax || window.gameData.initialState.mpMax,
          atk: save.atk || window.gameData.initialState.atk,
          def: save.def || window.gameData.initialState.def,
          vel: save.vel || 10,
          ctr: save.ctr || 5,
          cdmg: save.cdmg || 150,
          eva: save.eva || 3,
          res: save.res || 2,
          regen: save.regen || 1,
        }
      };
      window.charLogic.applySelection(syntheticSelection);
      Object.assign(window.gameData.initialState, save);
      document.getElementById('startupOverlay')?.classList.remove('visible');
      window.gameEngine?.init?.();
    } catch (_error) {
      document.getElementById('setupLoadText').textContent = 'Partida guardada inválida. Inicia una nueva partida.';
      showScreen('setup-load');
    }
  }

  function bindEvents() {
    document.getElementById('setupNewGameBtn')?.addEventListener('click', () => showScreen('setup-clan'));
    document.getElementById('setupLoadBtn')?.addEventListener('click', tryLoadSave);
    document.getElementById('setupBackMenu')?.addEventListener('click', () => showScreen('setup-menu'));
    document.getElementById('setupBackClan')?.addEventListener('click', () => showScreen('setup-clan'));
    document.getElementById('setupBackChar')?.addEventListener('click', () => showScreen('setup-char'));
    document.getElementById('setupBackLoad')?.addEventListener('click', () => showScreen('setup-menu'));
    document.getElementById('setupStartBtn')?.addEventListener('click', completeSetup);
  }

  function init() {
    renderClanGrid();
    bindEvents();
    showScreen('setup-menu');
    document.getElementById('startupOverlay')?.classList.add('visible');
  }

  window.charUI = { init };
})();
