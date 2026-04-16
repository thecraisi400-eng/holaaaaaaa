(function () {
  const SAVE_KEY = 'ngs_rpg_save_data';

  const CLANS = [
    {
      id: 'uchiha',
      name: 'CLAN UCHIHA',
      emoji: '🔥',
      desc: 'El Clan Uchiha es un linaje legendario de ninjas con el Sharingan, conocidos por su dominio del fuego y trágico destino.',
      lore: ''
    },
    {
      id: 'uzumaki',
      name: 'CLAN UZUMAKI',
      emoji: '🌀',
      desc: 'El Clan Uzumaki es un linaje famoso por su enorme vitalidad, dominio del sellado y distintivo cabello rojo en sus miembros.',
      lore: ''
    },
    {
      id: 'senju',
      name: 'CLAN SENJU',
      emoji: '🌳',
      desc: 'El Clan Senju es un linaje legendario de ninjas con gran vitalidad, conocidos por su dominio del bosque y voluntad de fuego.',
      lore: ''
    },
    {
      id: 'otsutsuki',
      name: 'CLAN ŌTSUTSUKI',
      emoji: '🌙',
      desc: 'El Clan Otsutsuki es una estirpe celestial de seres poderosos que viajan entre mundos para cosechar energía y alcanzar la divinidad.',
      lore: ''
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

      const loreHtml = clan.lore
        ? `<p class="ngs-clan-lore">${clan.lore}</p>`
        : '';

      card.innerHTML = `
        <div class="ngs-clan-emblema" style="color: ${clanColor};">${clan.emoji}</div>
        <h3>${clan.name}</h3>
        <p class="ngs-clan-desc">${clan.desc}</p>
        ${loreHtml}
        <button class="ngs-btn ngs-select-clan-btn ngs-select-clan-card-btn">Elegir Clan</button>
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
      
      // Obtener todas las estadísticas completas del personaje
      const allStats = heroSnapshot?.stats || {};
      const previewHP = allStats.HP ?? 100;
      const previewMP = allStats.MP ?? 100;
      const previewATK = allStats.ATK ?? character.stats.str;
      const previewDEF = allStats.DEF ?? 10;
      const previewAGI = allStats.AGI ?? 10;
      const previewINT = allStats.INT ?? 10;
      const previewCRT = allStats.CRT ?? 0;
      const previewCDMG = allStats.CDMG ?? 0;
      const previewEVA = allStats.EVA ?? 0;
      const previewREGEN = allStats.REGEN ?? 0;
      const previewRES = allStats.RES ?? 0;
      const previewLCK = allStats.LCK ?? 0;

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
        <div class="ngs-stats-grid">
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>❤️ HP</span><span>${previewHP}</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-hp" style="width: ${Math.min(100, previewHP / 2)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>🔵 MP</span><span>${previewMP}</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-mp" style="width: ${Math.min(100, previewMP / 2)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>⚔️ ATK</span><span>${previewATK}</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-atk" style="width: ${Math.min(100, previewATK / 2)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>🛡️ DEF</span><span>${previewDEF}</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-def" style="width: ${Math.min(100, previewDEF / 2)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>💨 AGI</span><span>${previewAGI}</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-agi" style="width: ${Math.min(100, previewAGI / 2)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>🧠 INT</span><span>${previewINT}</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-int" style="width: ${Math.min(100, previewINT / 2)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>◎ CRT</span><span>${previewCRT.toFixed(1)}%</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-crt" style="width: ${Math.min(100, previewCRT * 2)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>💥 CDMG</span><span>${previewCDMG.toFixed(1)}%</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-cdmg" style="width: ${Math.min(100, previewCDMG)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>〇 EVA</span><span>${previewEVA.toFixed(1)}%</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-eva" style="width: ${Math.min(100, previewEVA * 2)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>♥ REGEN</span><span>${previewREGEN.toFixed(1)}%</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-regen" style="width: ${Math.min(100, previewREGEN * 5)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>♾️ RES</span><span>${previewRES.toFixed(1)}%</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-res" style="width: ${Math.min(100, previewRES * 2)}%;"></div></div>
          </div>
          <div class="ngs-stat-item">
            <div class="ngs-stat-label"><span>✦ LCK</span><span>${previewLCK.toFixed(1)}</span></div>
            <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-lck" style="width: ${Math.min(100, previewLCK * 2)}%;"></div></div>
          </div>
        </div>
        <button class="ngs-btn ngs-select-char-btn">Iniciar Aventura</button>
      `;

      const selectCharBtn = card.querySelector('.ngs-select-char-btn');
      selectCharBtn.addEventListener('click', () => {
        const selectedClan = CLANS.find((c) => c.id === clanId);
        const saveObject = {
          characterId: character.id,
          character: character.name,
          characterSprite: character.img || '',
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

  function getCharacterById(characterId) {
    if (!characterId) return null;
    for (const clanChars of Object.values(CHARACTERS_BY_CLAN)) {
      const found = clanChars.find((character) => character.id === characterId);
      if (found) return found;
    }
    return null;
  }

  function enterGame() {
    const selectedCharacterMeta = getCharacterById(gameSavedData?.characterId);
    if (selectedCharacterMeta && !gameSavedData?.characterSprite) {
      gameSavedData.characterSprite = selectedCharacterMeta.img || '';
    }

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
