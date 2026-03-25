(() => {
  const root = document.getElementById('startFlow');
  if (!root || !window.charData || !window.charLogic) return;

  const clans = window.charData.clans;
  const state = { clan: null, memberName: '', memberEmoji: '🥷' };

  const screens = {
    menu: root.querySelector('[data-screen="menu"]'),
    clan: root.querySelector('[data-screen="clan"]'),
    char: root.querySelector('[data-screen="char"]'),
  };

  const clanGrid = document.getElementById('sfClanGrid');
  const charList = document.getElementById('sfCharList');
  const clanLabel = document.getElementById('sfClanName');
  const customName = document.getElementById('sfCustomName');

  function showScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function clanCard(clan) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'sf-clan-card';
    const summaryRows = Object.entries(clan.summary)
      .map(([key, val]) => `<div class="sf-stat-row"><span>${key}</span><strong>${val}</strong></div>`)
      .join('');

    card.innerHTML = `
      <div class="sf-clan-name">${clan.emoji} ${clan.name}</div>
      <div class="sf-clan-rank">${clan.rank}</div>
      <div class="sf-clan-stats">${summaryRows}</div>
    `;

    card.addEventListener('click', () => {
      state.clan = clan;
      clanLabel.textContent = `${clan.emoji} ${clan.name}`;
      renderMembers(clan);
      customName.value = '';
      showScreen('char');
    });

    return card;
  }

  function renderClanGrid() {
    clanGrid.innerHTML = '';
    clans.forEach((clan) => clanGrid.appendChild(clanCard(clan)));
  }

  function renderMembers(clan) {
    charList.innerHTML = '';
    clan.members.forEach((name, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sf-char-btn';
      btn.innerHTML = `<span>${clan.memberEmoji[i]}</span><span>${name}</span>`;
      btn.addEventListener('click', () => {
        state.memberName = name;
        state.memberEmoji = clan.memberEmoji[i];
        customName.value = name;
      });
      charList.appendChild(btn);
    });
  }

  function startRun() {
    const heroName = customName.value.trim() || state.memberName;
    if (!state.clan || !heroName) return;

    window.charLogic.applyCharacterSetup({
      clan: state.clan,
      heroName,
      avatar: state.memberEmoji,
    });

    root.classList.add('hidden');
    document.getElementById('app').classList.remove('app-hidden');
    window.gameEngine.init();
  }

  root.querySelector('[data-action="new"]').addEventListener('click', () => showScreen('clan'));
  root.querySelector('[data-action="load"]').addEventListener('click', () => {
    root.querySelector('.sf-load-msg').classList.add('visible');
  });
  root.querySelector('[data-action="menu"]').addEventListener('click', () => showScreen('menu'));
  root.querySelector('[data-action="clan"]').addEventListener('click', () => showScreen('clan'));
  root.querySelector('[data-action="start"]').addEventListener('click', startRun);

  renderClanGrid();
  showScreen('menu');
})();
