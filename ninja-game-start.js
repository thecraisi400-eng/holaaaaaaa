(function () {
  const SAVE_KEY = 'ngs_rpg_save_data';

  const CLANS = [
    {
      id: 'uchiha',
      name: 'CLAN UCHIHA',
      emoji: '🔥',
      desc: 'Ojos carmesí que dominan las llamas del infierno, poseedores del Sharingan.',
      lore: 'Legado de la hoja oculta, el poder del odio y el amor se entrelazan.'
    },
    {
      id: 'uzumaki',
      name: 'CLAN UZUMAKI',
      emoji: '🌀',
      desc: 'Vitalidad inagotable y sellos prohibidos, espirales de destino.',
      lore: 'Sangre de la longevidad, guardianes del sello del nueve colas.'
    },
    {
      id: 'senju',
      name: 'CLAN SENJU',
      emoji: '🌳',
      desc: 'Herederos del bosque, voluntad de fuego y sabiduría milenaria.',
      lore: 'Fundadores de Konoha, su fuerza es la unión y la estrategia.'
    },
    {
      id: 'otsutsuki',
      name: 'CLAN ŌTSUTSUKI',
      emoji: '🌙',
      desc: 'Seres divinos llegados del cosmos, devoradores de chakra.',
      lore: 'Origen del poder divino, sus ojos ven más allá de los reinos.'
    }
  ];

  const CHARACTERS_BY_CLAN = {
    uchiha: [
      { id: 'madara', name: 'Madara Uchiha', sprite: '🔥', img: 'assets/images/madara.png', stats: { str: 98, agi: 85, int: 95 }, desc: 'Fantasma de la Uchiha' },
      { id: 'itachi', name: 'Itachi Uchiha', sprite: '🍥', img: 'assets/images/itachi.png', stats: { str: 92, agi: 96, int: 100 }, desc: 'Genio trágico' },
      { id: 'obito', name: 'Obito Uchiha', sprite: '🌀', img: 'assets/images/obito.png', stats: { str: 88, agi: 90, int: 85 }, desc: 'El que cruza el velo' },
      { id: 'sasuke', name: 'Sasuke Uchiha', sprite: '⚡', img: 'assets/images/sasuke.png', stats: { str: 94, agi: 93, int: 90 }, desc: 'Heredero del rencor' }
    ],
    uzumaki: [
      { id: 'naruto', name: 'Naruto Uzumaki', sprite: '🍥', img: 'assets/images/naruto.png', stats: { str: 96, agi: 92, int: 82 }, desc: 'Número uno hiperactivo' },
      { id: 'nagato', name: 'Nagato (Pain)', sprite: '👁️', img: 'assets/images/nagato.png', stats: { str: 97, agi: 78, int: 98 }, desc: 'Dios del dolor' },
      { id: 'kushina', name: 'Kushina Uzumaki', sprite: '🔗', img: 'assets/images/kushina.png', stats: { str: 88, agi: 85, int: 90 }, desc: 'Voluntad férrea' },
      { id: 'karin', name: 'Karin Uzumaki', sprite: '🔴', img: 'assets/images/karin.png', stats: { str: 70, agi: 88, int: 94 }, desc: 'Sensora de chakra' }
    ],
    senju: [
      { id: 'hashirama', name: 'Hashirama Senju', sprite: '🌲', img: 'assets/images/hashirama.png', stats: { str: 99, agi: 84, int: 96 }, desc: 'Dios de la madera' },
      { id: 'tobirama', name: 'Tobirama Senju', sprite: '💧', img: 'assets/images/tobirama.png', stats: { str: 90, agi: 97, int: 95 }, desc: 'Genio del agua' },
      { id: 'tsunade', name: 'Tsunade Senju', sprite: '💪', img: 'assets/images/tsunade.png', stats: { str: 100, agi: 75, int: 88 }, desc: 'La legendaria sanadora' },
      { id: 'itama', name: 'Itama Senju', sprite: '🍃', img: 'assets/images/itama.png', stats: { str: 75, agi: 82, int: 78 }, desc: 'Espíritu pacífico' }
    ],
    otsutsuki: [
      { id: 'kaguya', name: 'Kaguya Ōtsutsuki', sprite: '🌙', img: 'assets/images/kaguya.png', stats: { str: 100, agi: 95, int: 100 }, desc: 'Progenitora divina' },
      { id: 'hagoromo', name: 'Hagoromo Ōtsutsuki', sprite: '☀️', img: 'assets/images/hagoromo.png', stats: { str: 98, agi: 90, int: 100 }, desc: 'Sabio de los Seis Caminos' },
      { id: 'indra', name: 'Indra Ōtsutsuki', sprite: '⚡', img: 'assets/images/indra.png', stats: { str: 94, agi: 92, int: 96 }, desc: 'Creador del ninjutsu' },
      { id: 'asura', name: 'Asura Ōtsutsuki', sprite: '🌍', img: 'assets/images/asura.png', stats: { str: 96, agi: 88, int: 93 }, desc: 'Heredero de la voluntad' }
    ]
  };

  let currentClanSelected = null;
  let gameSavedData = null;
  let currentCharacterSelected = null;

  const introRoot = document.getElementById('ngsIntroRoot');
  const app = document.getElementById('app');
  const startScreen = document.getElementById('ngsStartScreen');
  const clanScreen = document.getElementById('ngsClanScreen');
  const characterScreen = document.getElementById('ngsCharacterScreen');
  const clanContainer = document.getElementById('ngsClanContainer');
  const charactersGrid = document.getElementById('ngsCharactersGrid');
  const selectedClanTitle = document.getElementById('ngsSelectedClanTitle');
  const loadPreviewDataDiv = document.getElementById('ngsSavePreviewData');

  if (!introRoot || !app || !startScreen || !clanScreen || !characterScreen) {
    return;
  }

  function showScreen(screenName) {
    startScreen.classList.add('ngs-hidden');
    clanScreen.classList.add('ngs-hidden');
    characterScreen.classList.add('ngs-hidden');

    if (screenName === 'start') startScreen.classList.remove('ngs-hidden');
    if (screenName === 'clan') clanScreen.classList.remove('ngs-hidden');
    if (screenName === 'character') characterScreen.classList.remove('ngs-hidden');
    playPlaceholderSound('ui-click');
  }

  function playPlaceholderSound(type) {
    if (type === 'ui-click') console.log('🔊 [SONIDO] UI click');
    if (type === 'select') console.log('🎵 [SONIDO] Selección épica');
  }

  function getClanColor(clanId) {
    const colors = {
      uchiha: '#ef4444',
      uzumaki: '#f59e0b',
      senju: '#10b981',
      otsutsuki: '#a855f7'
    };
    return colors[clanId] || '#e6b422';
  }

  function renderClans() {
    clanContainer.innerHTML = '';

    CLANS.forEach((clan) => {
      const card = document.createElement('div');
      card.className = 'ngs-clan-card';
      card.setAttribute('data-clan-id', clan.id);
      const clanColor = getClanColor(clan.id);

      card.innerHTML = `
        <div class="ngs-clan-emblema" style="color: ${clanColor};">${clan.emoji}</div>
        <h3>${clan.name}</h3>
        <p class="ngs-clan-desc">${clan.desc}</p>
        <p style="font-size:0.7rem; font-style:italic;">${clan.lore}</p>
        <button class="ngs-btn ngs-select-clan-btn" style="margin-top:1rem; padding:0.5rem 1rem;">Elegir Clan</button>
      `;

      const btn = card.querySelector('.ngs-select-clan-btn');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        playPlaceholderSound('select');
        currentClanSelected = clan.id;
        renderCharactersByClan(clan.id);
        selectedClanTitle.innerText = `Clan: ${clan.name}`;
        showScreen('character');
      });

      clanContainer.appendChild(card);
    });
  }

  function renderCharactersByClan(clanId) {
    const characters = CHARACTERS_BY_CLAN[clanId];
    if (!characters) return;

    charactersGrid.innerHTML = '';

    characters.forEach((character) => {
      const heroSnapshot = window.CharacterStatsSystem
        ? window.CharacterStatsSystem.buildHeroSnapshot(character.id, 1, 0, window.CharacterStatsSystem.DEFAULT_RANK)
        : null;
      const previewATK = heroSnapshot?.stats?.ATK ?? character.stats.str;
      const previewHP = heroSnapshot?.stats?.HP ?? 100;
      const previewMP = heroSnapshot?.stats?.MP ?? 100;
      const card = document.createElement('div');
      card.className = 'ngs-character-card';

      let spriteContent = '';
      if (character.img && character.img.trim() !== '') {
        spriteContent = `<img src="${character.img}" alt="${character.name}">`;
      } else {
        spriteContent = character.sprite;
      }

      card.innerHTML = `
        <div class="ngs-sprite-idle">${spriteContent}</div>
        <div class="ngs-character-name">${character.name}</div>
        <div class="ngs-stat-item">
          <div class="ngs-stat-label"><span>⚔️ ATK</span><span>${previewATK}</span></div>
          <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-str" style="width: ${Math.min(100, previewATK)}%;"></div></div>
        </div>
        <div class="ngs-stat-item">
          <div class="ngs-stat-label"><span>❤️ HP</span><span>${previewHP}</span></div>
          <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-agi" style="width: ${Math.min(100, Math.round((previewHP / 250) * 100))}%;"></div></div>
        </div>
        <div class="ngs-stat-item">
          <div class="ngs-stat-label"><span>🔵 MP</span><span>${previewMP}</span></div>
          <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-int" style="width: ${Math.min(100, Math.round((previewMP / 250) * 100))}%;"></div></div>
        </div>
        <button class="ngs-btn ngs-select-char-btn">Iniciar Aventura</button>
      `;

      const selectCharBtn = card.querySelector('.ngs-select-char-btn');
      selectCharBtn.addEventListener('click', () => {
        const selectedClan = CLANS.find((c) => c.id === clanId);
        const saveObject = {
          characterId: character.id,
          character: character.name,
          clan: clanId,
          clanName: selectedClan?.name || clanId,
          level: 1,
          rank: window.CharacterStatsSystem?.DEFAULT_RANK || 'GENIN',
          exp: 0,
          timestamp: Date.now(),
          playTime: '00:12:34'
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveObject));
        gameSavedData = saveObject;
        currentCharacterSelected = character.name;
        playPlaceholderSound('select');
        updateLoadPreview();
        enterGame();
      });

      charactersGrid.appendChild(card);
    });
  }

  function updateLoadPreview() {
    const savedRaw = localStorage.getItem(SAVE_KEY);

    if (savedRaw) {
      try {
        const data = JSON.parse(savedRaw);
        gameSavedData = data;
        currentCharacterSelected = data.character || null;
        currentClanSelected = data.clan || null;
        const dateStr = data.timestamp ? new Date(data.timestamp).toLocaleString() : 'desconocida';

        loadPreviewDataDiv.innerHTML = `🎮 ${data.character} | Nivel ${data.level || 1} | Tiempo: ${data.playTime || '00:00'} <br> <span style="font-size:0.7rem;">Guardado: ${dateStr}</span>`;
      } catch (e) {
        loadPreviewDataDiv.innerHTML = 'Error al leer guardado';
      }
    } else {
      loadPreviewDataDiv.innerHTML = 'No hay partida guardada. Comienza una nueva aventura.';
    }
  }

  function loadGameFromStorage() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      gameSavedData = data;
      currentClanSelected = data.clan || null;
      currentCharacterSelected = data.character || null;
      playPlaceholderSound('select');
      alert(`Partida cargada: ${data.character} (Clan ${data.clan}) - Nivel ${data.level || 1}\n¡Bienvenido de vuelta, héroe!`);
      enterGame();
    } else {
      alert('No hay partidas guardadas. Comienza Nueva Partida.');
    }
  }

  function enterGame() {
    introRoot.style.display = 'none';
    app.classList.remove('game-shell-hidden');
    window.dispatchEvent(new CustomEvent('ngs:game-entered', {
      detail: {
        selectedClan: currentClanSelected,
        selectedCharacter: currentCharacterSelected,
        saveData: gameSavedData
      }
    }));
  }

  function clearAllGameSaves() {
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key === SAVE_KEY || key.startsWith('ngs_')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => localStorage.removeItem(key));
    gameSavedData = null;
    currentClanSelected = null;
    currentCharacterSelected = null;
  }

  const optionsBtn = document.getElementById('ngsOptionsBtn');
  const optionsModal = document.getElementById('ngsOptionsModal');
  const closeOptionsBtn = document.getElementById('ngsCloseOptions');

  optionsBtn.addEventListener('click', () => {
    playPlaceholderSound('ui-click');
    optionsModal.style.display = 'flex';
    optionsModal.setAttribute('aria-hidden', 'false');
  });

  closeOptionsBtn.addEventListener('click', () => {
    optionsModal.style.display = 'none';
    optionsModal.setAttribute('aria-hidden', 'true');
  });

  optionsModal.addEventListener('click', (e) => {
    if (e.target === optionsModal) {
      optionsModal.style.display = 'none';
      optionsModal.setAttribute('aria-hidden', 'true');
    }
  });

  document.getElementById('ngsNewGameBtn').addEventListener('click', () => {
    playPlaceholderSound('select');
    clearAllGameSaves();
    updateLoadPreview();
    renderClans();
    showScreen('clan');
  });

  document.getElementById('ngsLoadGameBtn').addEventListener('click', () => {
    playPlaceholderSound('ui-click');
    loadGameFromStorage();
  });

  document.getElementById('ngsBackFromClan').addEventListener('click', () => {
    playPlaceholderSound('ui-click');
    showScreen('start');
  });

  document.getElementById('ngsBackFromChar').addEventListener('click', () => {
    playPlaceholderSound('ui-click');
    showScreen('clan');
    renderClans();
  });

  document.addEventListener('mousemove', (e) => {
    if (introRoot.style.display === 'none') return;

    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    const layers = introRoot.querySelectorAll('.ngs-layer');

    if (layers[0]) layers[0].style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    if (layers[1]) layers[1].style.transform = `translate(${x * -12}px, ${y * -8}px) scale(1.02)`;
    if (layers[2]) layers[2].style.transform = `translate(${x * 4}px, ${y * 3}px)`;
  });

  function init() {
    showScreen('start');
    updateLoadPreview();
  }

  window.addEventListener('storage', (e) => {
    if (e.key === SAVE_KEY) updateLoadPreview();
  });

  init();
})();
