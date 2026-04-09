(function () {
  const DEFAULT_SLOT = 1;

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
  let activeSlotId = DEFAULT_SLOT;
  let autoSaveTimer = null;

  const introRoot = document.getElementById('ngsIntroRoot');
  const app = document.getElementById('app');
  const startScreen = document.getElementById('ngsStartScreen');
  const clanScreen = document.getElementById('ngsClanScreen');
  const characterScreen = document.getElementById('ngsCharacterScreen');
  const clanContainer = document.getElementById('ngsClanContainer');
  const charactersGrid = document.getElementById('ngsCharactersGrid');
  const selectedClanTitle = document.getElementById('ngsSelectedClanTitle');
  const loadPreviewDataDiv = document.getElementById('ngsSavePreviewData');
  const loadSlotsModal = document.getElementById('ngsLoadSlotsModal');
  const slotsContainer = document.getElementById('ngsSlotsContainer');

  if (!introRoot || !app || !startScreen || !clanScreen || !characterScreen) {
    return;
  }
  if (!window.NGSSaveSystem) {
    console.error('NGSSaveSystem no está disponible.');
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
          <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-str" style="width: 100%;"></div></div>
        </div>
        <div class="ngs-stat-item">
          <div class="ngs-stat-label"><span>❤️ HP</span><span>${previewHP}</span></div>
          <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-agi" style="width: 100%;"></div></div>
        </div>
        <div class="ngs-stat-item">
          <div class="ngs-stat-label"><span>🔵 MP</span><span>${previewMP}</span></div>
          <div class="ngs-stat-bar-container"><div class="ngs-stat-fill ngs-int" style="width: 100%;"></div></div>
        </div>
        <button class="ngs-btn ngs-select-char-btn">Iniciar Aventura</button>
      `;

      const selectCharBtn = card.querySelector('.ngs-select-char-btn');
      selectCharBtn.addEventListener('click', () => {
        const selectedClan = CLANS.find((c) => c.id === clanId);
        const freshSave = {
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
        gameSavedData = freshSave;
        activeSlotId = DEFAULT_SLOT;
        window.NGSSaveSystem.save(activeSlotId, freshSave);
        currentCharacterSelected = character.name;
        playPlaceholderSound('select');
        updateLoadPreview();
        enterGame();
      });

      charactersGrid.appendChild(card);
    });
  }

  function updateLoadPreview() {
    const latest = window.NGSSaveSystem.findLatestSlot();
    if (!latest) {
      loadPreviewDataDiv.innerHTML = 'No hay partida guardada. Comienza una nueva aventura.';
      return;
    }

    const dateStr = latest.timestamp ? new Date(latest.timestamp).toLocaleString() : 'desconocida';
    loadPreviewDataDiv.innerHTML = `🎮 ${latest.character || 'Sin personaje'} | Nivel ${latest.level || 1} | Tiempo: ${latest.playTime || '00:00'} <br> <span style="font-size:0.7rem;">Slot ${latest.slotId} · Guardado: ${dateStr}</span>`;
  }

  function formatSlotDetails(slot) {
    if (!slot.hasData) {
      return '<div class=\"ngs-slot-meta\">Sin datos guardados</div>';
    }
    const date = slot.timestamp ? new Date(slot.timestamp).toLocaleString() : 'desconocida';
    return `<div class=\"ngs-slot-meta\">${slot.character || 'Sin personaje'} · Nivel ${slot.level || 1} · ${slot.rank || 'GENIN'}<br>Guardado: ${date}</div>`;
  }

  function renderLoadSlots() {
    const slots = window.NGSSaveSystem.listSlots();
    slotsContainer.innerHTML = '';

    slots.forEach((slot) => {
      const slotCard = document.createElement('div');
      slotCard.className = 'ngs-slot-card';
      slotCard.innerHTML = `
        <div class=\"ngs-slot-title\"><span>Slot ${slot.slotId}</span><span>${slot.hasData ? '✅ Ocupado' : '⬜ Vacío'}</span></div>
        ${formatSlotDetails(slot)}
        <div class=\"ngs-slot-actions\">
          <button class=\"ngs-btn\" data-load-slot=\"${slot.slotId}\" ${slot.hasData ? '' : 'disabled'}>Cargar</button>
          <button class=\"ngs-btn ngs-btn-secondary\" data-delete-slot=\"${slot.slotId}\" ${slot.hasData ? '' : 'disabled'}>Eliminar</button>
        </div>
      `;
      slotsContainer.appendChild(slotCard);
    });
  }

  function openLoadSlotsModal() {
    renderLoadSlots();
    loadSlotsModal.style.display = 'flex';
    loadSlotsModal.setAttribute('aria-hidden', 'false');
  }

  function closeLoadSlotsModal() {
    loadSlotsModal.style.display = 'none';
    loadSlotsModal.setAttribute('aria-hidden', 'true');
  }

  function loadGameFromSlot(slotId) {
    const loaded = window.NGSSaveSystem.load(slotId);
    if (!loaded.ok) {
      alert('No se pudo cargar la partida. Intenta con otro slot.');
      return;
    }

    const data = loaded.state;
    activeSlotId = slotId;
    gameSavedData = {
      ...data,
      playTime: loaded.meta?.playTime || '00:00:00'
    };
    currentClanSelected = data.clan || null;
    currentCharacterSelected = data.character || null;
    playPlaceholderSound('select');
    if (loaded.recoveredFromBackup) {
      alert('Se detectó corrupción en el guardado y se recuperó desde backup.');
    }
    closeLoadSlotsModal();
    updateLoadPreview();
    enterGame();
  }

  function collectRuntimeSaveData() {
    const currentState = window.GameState && typeof window.GameState.getState === 'function'
      ? window.GameState.getState()
      : {};
    const heroSnapshot = window.HeroSystem && typeof window.HeroSystem.getHeroSnapshot === 'function'
      ? window.HeroSystem.getHeroSnapshot()
      : null;

    return {
      ...(gameSavedData || {}),
      characterId: heroSnapshot?.characterId || gameSavedData?.characterId || '',
      character: gameSavedData?.character || currentCharacterSelected || '',
      clan: gameSavedData?.clan || currentClanSelected || '',
      clanName: gameSavedData?.clanName || '',
      characterSprite: currentState.characterVisual?.spriteSrc || gameSavedData?.characterSprite || '',
      level: heroSnapshot?.level || currentState.level || gameSavedData?.level || 1,
      rank: heroSnapshot?.rank || currentState.rank || gameSavedData?.rank || 'GENIN',
      exp: heroSnapshot?.exp || currentState.exp || gameSavedData?.exp || 0,
      hp: currentState.hp,
      mp: currentState.mp,
      gold: currentState.gold,
      timestamp: Date.now(),
      playTime: gameSavedData?.playTime || '00:12:34'
    };
  }

  function saveCurrentProgress(reason = 'manual') {
    if (!gameSavedData) return;
    const runtimeData = collectRuntimeSaveData();
    const saveResult = window.NGSSaveSystem.save(activeSlotId, runtimeData);
    if (!saveResult.ok) {
      console.warn(`No se pudo guardar (${reason}):`, saveResult.error);
      return;
    }
    gameSavedData = runtimeData;
    updateLoadPreview();
  }

  function scheduleAutosave(reason = 'autosave') {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => saveCurrentProgress(reason), 500);
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
    for (let slotId = 1; slotId <= window.NGSSaveSystem.SLOT_COUNT; slotId += 1) {
      window.NGSSaveSystem.delete(slotId);
    }
    gameSavedData = null;
    currentClanSelected = null;
    currentCharacterSelected = null;
    activeSlotId = DEFAULT_SLOT;
  }

  const optionsBtn = document.getElementById('ngsOptionsBtn');
  const optionsModal = document.getElementById('ngsOptionsModal');
  const closeOptionsBtn = document.getElementById('ngsCloseOptions');
  const keepAwakeToggle = document.getElementById('ngsKeepAwakeToggle');
  const closeLoadSlotsBtn = document.getElementById('ngsCloseLoadSlots');

  if (window.NGSWakeLockService && keepAwakeToggle) {
    keepAwakeToggle.checked = window.NGSWakeLockService.isEnabled();
    keepAwakeToggle.addEventListener('change', () => {
      window.NGSWakeLockService.setEnabled(keepAwakeToggle.checked);
    });
  }

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
    openLoadSlotsModal();
  });
  
  slotsContainer.addEventListener('click', (event) => {
    const loadBtn = event.target.closest('[data-load-slot]');
    if (loadBtn) {
      const slotId = Number(loadBtn.getAttribute('data-load-slot'));
      if (slotId) loadGameFromSlot(slotId);
      return;
    }

    const deleteBtn = event.target.closest('[data-delete-slot]');
    if (deleteBtn) {
      const slotId = Number(deleteBtn.getAttribute('data-delete-slot'));
      if (!slotId) return;
      const approved = confirm(`¿Eliminar Slot ${slotId}? Esta acción no se puede deshacer.`);
      if (!approved) return;
      window.NGSSaveSystem.delete(slotId);
      renderLoadSlots();
      updateLoadPreview();
    }
  });

  closeLoadSlotsBtn.addEventListener('click', closeLoadSlotsModal);
  loadSlotsModal.addEventListener('click', (e) => {
    if (e.target === loadSlotsModal) closeLoadSlotsModal();
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

  window.addEventListener('ngs:game-entered', () => {
    if (window.NGSWakeLockService && window.NGSWakeLockService.isEnabled()) {
      window.NGSWakeLockService.request();
    }
    scheduleAutosave('enter-game');
  });

  window.addEventListener('ngs:hero-stats-updated', () => scheduleAutosave('hero-stats'));
  window.addEventListener('ngs:state-updated', () => scheduleAutosave('state-updated'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveCurrentProgress('visibility-hidden');
    }
  });
  window.addEventListener('pagehide', () => saveCurrentProgress('pagehide'));
  window.addEventListener('beforeunload', () => saveCurrentProgress('beforeunload'));

  init();
})();
