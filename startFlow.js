(() => {
  const options = window.gameData.startOptions || [];
  const overlay = document.getElementById('start-overlay');
  const stepMenu = document.getElementById('start-step-menu');
  const stepStats = document.getElementById('start-step-stats');
  const stepChars = document.getElementById('start-step-chars');
  const statsGrid = document.getElementById('start-stats-grid');
  const charsList = document.getElementById('start-char-list');
  const selectedInfo = document.getElementById('start-selected-info');

  let selectedOption = null;
  const startHandlers = new Map();

  function bindStartAction(id, fn) {
    const node = document.getElementById(id);
    if (!node) return;
    const prev = startHandlers.get(node);
    if (prev) node.removeEventListener('click', prev);
    node.addEventListener('click', fn);
    startHandlers.set(node, fn);
  }

  function showStep(step) {
    [stepMenu, stepStats, stepChars].forEach((el) => el.classList.remove('active'));
    step.classList.add('active');
  }

  function colorClass(value) {
    if (/Muy Alto|Alto/i.test(value)) return 'is-high';
    if (/Bajo/i.test(value)) return 'is-low';
    return 'is-mid';
  }

  function computeLevelGains(option) {
    if (!option || typeof option.formula !== 'function') return {};
    const lv1 = option.formula(1) || {};
    const lv2 = option.formula(2) || {};
    const stats = ['HP', 'MP', 'ATK', 'DEF'];

    return stats.reduce((acc, key) => {
      const gain = (Number(lv2[key]) || 0) - (Number(lv1[key]) || 0);
      if (gain !== 0) acc[key] = gain;
      return acc;
    }, {});
  }

  function renderOptions() {
    statsGrid.innerHTML = '';
    options.forEach((opt) => {
      const card = document.createElement('button');
      card.className = 'start-stat-card';
      card.innerHTML = `
        <div class="start-stat-title">${opt.emoji} ${opt.name}</div>
        <div class="start-stat-body">
          ${Object.entries(opt.summary).map(([key, value]) => (
            `<div class="start-stat-row"><span>${key}</span><span class="${colorClass(value)}">${value}</span></div>`
          )).join('')}
        </div>
      `;
      card.addEventListener('click', () => {
        selectedOption = opt;
        renderCharacters();
        showStep(stepChars);
      });
      statsGrid.appendChild(card);
    });
  }

  function renderCharacters() {
    if (!selectedOption) return;
    selectedInfo.textContent = `${selectedOption.emoji} ${selectedOption.name}`;
    charsList.innerHTML = '';

    selectedOption.members.forEach((member) => {
      const btn = document.createElement('button');
      btn.className = 'start-char-btn';
      btn.innerHTML = `<span>${member.emoji}</span> <strong>${member.name}</strong>`;
      btn.addEventListener('click', () => startGame(member));
      charsList.appendChild(btn);
    });
  }

  function startGame(member) {
    const stats = selectedOption.formula(1);
    window.gameEngine.init({
      profile: {
        avatar: member.emoji,
        charName: member.name,
        rank: selectedOption.name,
        stats,
        levelGains: computeLevelGains(selectedOption),
        gold: 500,
      },
      forceNewGame: true,
    });
    overlay.classList.add('hidden');
  }

  bindStartAction('btn-new-run', () => {
    renderOptions();
    showStep(stepStats);
  });

  bindStartAction('btn-load-run', () => {
    const msg = document.getElementById('start-load-msg');
    if (!window.gameEngine || !window.gameEngine.hasSaveGame || !window.gameEngine.hasSaveGame()) {
      msg.textContent = 'No se encontró ninguna partida guardada.';
      return;
    }

    window.gameEngine.init();
    if (window.gameEngine.loadGame && !window.gameEngine.loadGame()) {
      msg.textContent = 'No se pudo cargar la partida guardada.';
      return;
    }

    overlay.classList.add('hidden');
    msg.textContent = '';
  });

  bindStartAction('btn-back-menu', () => showStep(stepMenu));
  bindStartAction('btn-back-stats', () => showStep(stepStats));

  showStep(stepMenu);

  if (window.gameEngine && window.gameEngine.hasSaveGame && window.gameEngine.hasSaveGame()) {
    window.gameEngine.init();
    overlay.classList.add('hidden');
  }
})();
