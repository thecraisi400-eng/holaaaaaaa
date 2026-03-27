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

  function showStep(step) {
    [stepMenu, stepStats, stepChars].forEach((el) => el.classList.remove('active'));
    step.classList.add('active');
  }

  function colorClass(value) {
    if (/Muy Alto|Alto/i.test(value)) return 'is-high';
    if (/Bajo/i.test(value)) return 'is-low';
    return 'is-mid';
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
      avatar: member.emoji,
      charName: member.name,
      rank: selectedOption.name,
      stats,
      gold: 500,
    });
    overlay.classList.add('hidden');
  }

  document.getElementById('btn-new-run').addEventListener('click', () => {
    renderOptions();
    showStep(stepStats);
  });

  document.getElementById('btn-load-run').addEventListener('click', () => {
    const msg = document.getElementById('start-load-msg');
    msg.textContent = 'No se encontró ninguna partida guardada.';
  });

  document.getElementById('btn-back-menu').addEventListener('click', () => showStep(stepMenu));
  document.getElementById('btn-back-stats').addEventListener('click', () => showStep(stepStats));

  showStep(stepMenu);
})();
