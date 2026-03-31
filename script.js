(() => {
  const SAVE_STORAGE_KEY = 'naruto_idle_save_v1';
  const SAVE_VERSION = 1;
  const AUTO_SAVE_MS = 30000;

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
    activeSection: 'heroe',
    missionProgress: {
      totalWins: 0,
      rankWins: {},
      bingoWins: 0
    }
  };

  const sharedState = window.stateManager || null;
  if (sharedState?.setState) {
    sharedState.setState({ hp: state.hp, atk: state.atk, def: state.def });
  }

  const sections = {
    heroe: { icon: '🥷', title: 'HÉROE', desc: 'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
    misiones: { icon: '📜', title: 'MISIONES', desc: '' },
    clanes: { icon: '⛩️', title: 'CLANES', desc: 'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
    eventos: { icon: '🎴', title: 'EVENTOS', desc: '¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
    jutsus: { icon: '🌀', title: 'JUTSUS', desc: 'Gestiona tus técnicas ninja. Equipa hasta 3 jutsus activos y mejora sus rangos con sellos de chakra.' },
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
    charLevel: document.getElementById('charLevel'),
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
  let arbolCleanup = null;
  let jutsusCleanup = null;
  let selectedCharacter = null;
  let gameLaunched = false;
  let autoSaveIntervalId = null;
  let pendingAutoSaveTimeout = null;
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
    level: null,
    topGold: null,
    topAtk: null,
    topDef: null
  };

  const defaultLevels = { cabeza: 1, pecho: 1, manos: 1, piernas: 1, pies: 1, accesorio: 1 };
  const defaultTreeBonuses = { HP: 0, MP: 0, ATK: 0, DEF: 0, VEL: 0 };
  const defaultSkillPoints = 0;
  const defaultJutsusState = {
    chakra: 1200,
    levels: Array(8).fill(0),
    slots: [null, null, null]
  };
  const JUTSUS_UPGRADE_COST = 150;
  const JUTSUS_LIBRARY = [
    { id: 0, name: 'Sombra Ardiente', durationMs: 4500, descs: ['🔥 Quema constantemente ignorando una parte de la defensa enemiga.', '🛡️ Aumenta la defensa física y reduce el daño recibido de críticos.', '💨 Crea una probabilidad de que el ataque enemigo falle totalmente.'], statKeys: ['🔥Quem', '🛡️Def%', '💨Fallo%', '📈Prob', '🔵MP'], levels: [[4.0, 10.0, 5.0, 5, 25], [4.5, 12.0, 6.0, 7, 28], [5.0, 14.0, 7.0, 9, 32], [5.5, 16.0, 8.0, 12, 36], [6.0, 18.0, 9.0, 15, 40], [7.0, 20.0, 10.0, 18, 45], [8.0, 22.0, 12.0, 22, 50], [9.0, 25.0, 14.0, 25, 55], [10.0, 28.0, 16.0, 28, 60], [12.0, 35.0, 20.0, 35, 70]] },
    { id: 1, name: 'Colmillo Gélido', durationMs: 3500, descs: ['❄️ Reduce la velocidad del enemigo y puede congelarlo.', '❤️ Aumento masivo de la vida máxima (HP) del personaje.', '⚔️ Ataque que ignora la defensa del objetivo.'], statKeys: ['❄️-Veloc', '❤️HP%', '⚔️Penetr', '📈Prob', '🔵MP'], levels: [[15.0, 8.0, 10.0, 10, 30], [18.0, 10.0, 12.0, 12, 35], [21.0, 12.0, 14.0, 14, 40], [25.0, 15.0, 16.0, 17, 45], [30.0, 18.0, 18.0, 20, 50], [35.0, 22.0, 20.0, 24, 56], [40.0, 26.0, 22.0, 28, 62], [45.0, 30.0, 25.0, 32, 68], [48.0, 35.0, 28.0, 36, 75], [50.0, 45.0, 30.0, 45, 85]] },
    { id: 2, name: 'Explosión Ponzoñosa', durationMs: 5000, descs: ['☠️ Inflige daño continuo de veneno cada turno.', '📊 Mejora global de todas las estadísticas como ATK, DEF y VEL.', '🔻 Genera daño de área que reduce la defensa del enemigo.'], statKeys: ['☠️Veneno', '📊Stats%', '🔻-DefEn', '📈Prob', '🔵MP'], levels: [[3.0, 5.0, -4.0, 8, 40], [3.5, 6.0, -5.0, 10, 44], [4.0, 7.0, -6.0, 13, 48], [4.5, 8.0, -7.0, 16, 52], [5.0, 9.0, -8.0, 19, 56], [6.0, 10.0, -10.0, 22, 61], [7.0, 12.0, -12.0, 26, 66], [8.0, 14.0, -14.0, 30, 72], [9.0, 16.0, -16.0, 35, 78], [12.0, 20.0, -20.0, 40, 90]] },
    { id: 3, name: 'Dragón Tirano', durationMs: 3000, descs: ['👁️ Aturde al oponente y reduce su evasión significativamente.', '🔄 Aumenta la probabilidad de contraatacar tras recibir un golpe.', '📉 Baja el ataque de todos los enemigos por 3 turnos.'], statKeys: ['👁️-Evas', '🔄Contra%', '📉-AtkEn', '📈Prob', '🔵MP'], levels: [[-5.0, 10.0, -5.0, 15, 35], [-6.0, 12.0, -6.0, 18, 39], [-7.0, 14.0, -7.0, 21, 43], [-8.0, 16.0, -8.0, 24, 48], [-10.0, 18.0, -10.0, 28, 53], [-12.0, 21.0, -12.0, 32, 58], [-14.0, 24.0, -14.0, 36, 64], [-16.0, 27.0, -16.0, 40, 70], [-18.0, 30.0, -18.0, 45, 77], [-25.0, 40.0, -25.0, 55, 85]] },
    { id: 4, name: 'Flash Mental', durationMs: 4000, descs: ['🚫 Probabilidad de cancelar las habilidades del enemigo.', '💨 Incrementa tu velocidad de ataque y la evasión.', '🌀 Confunde al enemigo, haciendo que se ataque a sí mismo.'], statKeys: ['🚫Cancel', '💨Vel&Ev%', '🌀Confus', '📈Prob', '🔵MP'], levels: [[5.0, 4.0, 2.0, 6, 20], [6.0, 5.0, 3.0, 8, 24], [7.0, 6.0, 4.0, 11, 28], [9.0, 8.0, 5.0, 14, 32], [11.0, 10.0, 6.0, 17, 37], [13.0, 12.0, 8.0, 21, 42], [15.0, 14.0, 10.0, 25, 48], [18.0, 16.0, 12.0, 29, 54], [21.0, 19.0, 15.0, 34, 60], [25.0, 25.0, 20.0, 40, 70]] },
    { id: 5, name: 'Sifón Oscuro', durationMs: 0, descs: ['🩸 Roba una cantidad fija de puntos de chakra enemigo cada turno.', '💚 Regenera una porción de HP al inicio de cada turno.', '💸 Aumenta la evasión y reduce el coste de chakra de tus habilidades.'], statKeys: ['🩸RoboMP', '💚Regen%', '💸-Coste%', '📈Prob', '🔵MP'], units: ['Pts', '%', '%', '%', ''], levels: [[5, 2.0, -2.0, 100, 45], [7, 2.5, -3.0, 100, 45], [9, 3.0, -4.0, 100, 45], [12, 4.0, -5.0, 100, 45], [15, 5.0, -6.0, 100, 45], [18, 6.0, -8.0, 100, 45], [22, 7.0, -10.0, 100, 45], [26, 8.5, -12.0, 100, 45], [30, 10.0, -15.0, 100, 45], [40, 15.0, -20.0, 100, 45]] },
    { id: 6, name: 'Guardián Fantasma', durationMs: 2500, descs: ['😵 Aturde al enemigo impidiendo que ataque por 2 turnos.', '⚡ Aumento de la probabilidad de tu golpe crítico.', '🛡️ Absorbe una cantidad fija de daño antes de desaparecer.'], statKeys: ['😵Turnos', '⚡Crit%', '🛡️EscudHP', '📈Prob', '🔵MP'], units: ['T', '%', 'HP', '%', ''], levels: [[1, 5.0, 100, 10, 50], [1, 7.0, 150, 12, 55], [1, 9.0, 200, 15, 60], [1, 11.0, 300, 18, 66], [1, 14.0, 400, 21, 72], [2, 17.0, 550, 25, 79], [2, 20.0, 700, 29, 86], [2, 24.0, 900, 34, 94], [2, 28.0, 1150, 39, 102], [2, 35.0, 1500, 45, 120]] },
    { id: 7, name: 'Loto Volcánico', durationMs: 2000, descs: ['💥 Causa daño masivo pero reduce tu defensa temporalmente.', '⚔️ Incremento de ataque (ATK) permanente durante el combate.', '🎯 Aumento masivo de daño crítico a cambio de perder algo de HP.'], statKeys: ['💥DñoBase', '⚔️AtkPerm%', '🎯DñoCrit%', '📈Prob', '🔵MP'], units: ['%', '%', '%', '%', ''], levels: [[150, 2.0, 20.0, 50, 30], [165, 3.0, 25.0, 55, 35], [180, 4.0, 30.0, 60, 40], [200, 5.0, 35.0, 65, 45], [220, 6.0, 45.0, 70, 52], [245, 8.0, 55.0, 75, 59], [270, 10.0, 65.0, 80, 67], [300, 12.0, 80.0, 85, 75], [330, 15.0, 95.0, 90, 85], [400, 25.0, 120.0, 100, 100]] }
  ];
  const baseCharacter = {
    gold: state.gold,
    levels: { ...defaultLevels },
    treeBonuses: { ...defaultTreeBonuses },
    skillPoints: defaultSkillPoints,
    jutsus: { ...defaultJutsusState, levels: [...defaultJutsusState.levels], slots: [...defaultJutsusState.slots] }
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
  if (!window.gameCharacter.jutsus || typeof window.gameCharacter.jutsus !== 'object') {
    window.gameCharacter.jutsus = { ...defaultJutsusState, levels: [...defaultJutsusState.levels], slots: [...defaultJutsusState.slots] };
  }

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

  function sanitizeMissionProgress(raw) {
    const progress = raw && typeof raw === 'object' ? raw : {};
    const rankWins = {};
    if (progress.rankWins && typeof progress.rankWins === 'object') {
      Object.entries(progress.rankWins).forEach(([key, value]) => {
        const count = Number(value);
        if (Number.isFinite(count) && count > 0) {
          rankWins[key] = Math.floor(count);
        }
      });
    }

    const totalWins = Number.isFinite(Number(progress.totalWins)) ? Math.max(0, Math.floor(Number(progress.totalWins))) : 0;
    const bingoWins = Number.isFinite(Number(progress.bingoWins)) ? Math.max(0, Math.floor(Number(progress.bingoWins))) : 0;

    return { totalWins, rankWins, bingoWins };
  }

  function readSaveData() {
    try {
      const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== SAVE_VERSION || !parsed.payload) return null;
      return parsed.payload;
    } catch {
      return null;
    }
  }

  function buildSavePayload() {
    return {
      characterId: selectedCharacter?.id || null,
      state: {
        hp: Math.round(state.hp),
        hpMax: Math.round(state.hpMax),
        mp: Math.round(state.mp),
        mpMax: Math.round(state.mpMax),
        exp: Math.round(state.exp),
        expMax: Math.round(state.expMax),
        gold: Math.round(state.gold),
        level: Math.round(state.level),
        missionProgress: sanitizeMissionProgress(state.missionProgress)
      },
      equipment: {
        gold: Math.round(Number(window.gameCharacter?.gold || state.gold)),
        levels: { ...(window.gameCharacter?.levels || {}) },
        treeBonuses: { ...(window.gameCharacter?.treeBonuses || {}) },
        skillPoints: Math.max(0, Math.floor(Number(window.gameCharacter?.skillPoints) || 0)),
        jutsus: {
          chakra: Math.max(0, Math.floor(Number(window.gameCharacter?.jutsus?.chakra) || 0)),
          levels: Array.isArray(window.gameCharacter?.jutsus?.levels) ? window.gameCharacter.jutsus.levels.map((lv) => Math.max(0, Math.min(9, Math.floor(Number(lv) || 0)))) : [...defaultJutsusState.levels],
          slots: Array.isArray(window.gameCharacter?.jutsus?.slots) ? window.gameCharacter.jutsus.slots.map((slot) => (Number.isInteger(slot) ? slot : null)) : [...defaultJutsusState.slots]
        }
      },
      meta: {
        activeSection: state.activeSection,
        savedAt: new Date().toISOString()
      }
    };
  }

  function saveGame({ notify = false } = {}) {
    try {
      const wrapper = {
        version: SAVE_VERSION,
        payload: buildSavePayload()
      };
      window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(wrapper));
      if (notify) window.alert('✅ Partida guardada correctamente.');
      return true;
    } catch (error) {
      console.error('No se pudo guardar la partida', error);
      if (notify) window.alert('❌ Error al guardar la partida.');
      return false;
    }
  }

  function queueAutoSave() {
    if (!gameLaunched) return;
    if (pendingAutoSaveTimeout !== null) return;
    pendingAutoSaveTimeout = window.setTimeout(() => {
      pendingAutoSaveTimeout = null;
      saveGame();
    }, 600);
  }

  function clearAutoSaveQueue() {
    if (pendingAutoSaveTimeout !== null) {
      window.clearTimeout(pendingAutoSaveTimeout);
      pendingAutoSaveTimeout = null;
    }
  }

  function startAutoSave() {
    stopAutoSave();
    autoSaveIntervalId = window.setInterval(() => {
      saveGame();
    }, AUTO_SAVE_MS);
    document.addEventListener('visibilitychange', handleVisibilityAutoSave, { signal });
    window.addEventListener('beforeunload', handleBeforeUnloadAutoSave, { signal });
  }

  function stopAutoSave() {
    if (autoSaveIntervalId !== null) {
      window.clearInterval(autoSaveIntervalId);
      autoSaveIntervalId = null;
    }
    clearAutoSaveQueue();
  }

  function handleVisibilityAutoSave() {
    if (document.visibilityState === 'hidden') {
      saveGame();
    }
  }

  function handleBeforeUnloadAutoSave() {
    saveGame();
  }

  function hasSavedGame() {
    return Boolean(readSaveData());
  }

  function applySaveData(payload) {
    if (!payload || !payload.state) return null;

    const character = window.PERSONAJES_DATA.find((char) => char.id === payload.characterId) || window.PERSONAJES_DATA[0];
    if (!character) return null;

    applyCharacterToGame(character);

    const targetLevel = Math.max(1, Math.floor(Number(payload.state.level) || 1));
    state.level = targetLevel;
    updateLevelScaling();

    state.exp = Math.max(0, Math.floor(Number(payload.state.exp) || 0));
    state.expMax = Math.max(1, Math.floor(Number(payload.state.expMax) || character.formula(state.level).XP));
    state.hpMax = Math.max(1, Math.floor(Number(payload.state.hpMax) || state.hpMax));
    state.mpMax = Math.max(1, Math.floor(Number(payload.state.mpMax) || state.mpMax));
    state.hp = Math.max(0, Math.min(state.hpMax, Math.floor(Number(payload.state.hp) || state.hpMax)));
    state.mp = Math.max(0, Math.min(state.mpMax, Math.floor(Number(payload.state.mp) || state.mpMax)));
    state.gold = Math.max(0, Math.floor(Number(payload.state.gold) || 0));
    state.missionProgress = sanitizeMissionProgress(payload.state.missionProgress);

    const levels = payload.equipment?.levels && typeof payload.equipment.levels === 'object'
      ? payload.equipment.levels
      : {};
    const treeBonuses = payload.equipment?.treeBonuses && typeof payload.equipment.treeBonuses === 'object'
      ? payload.equipment.treeBonuses
      : {};
    const skillPoints = Math.max(0, Math.floor(Number(payload.equipment?.skillPoints) || 0));
    const rawJutsus = payload.equipment?.jutsus && typeof payload.equipment.jutsus === 'object'
      ? payload.equipment.jutsus
      : {};
    const jutsuLevels = Array.isArray(rawJutsus.levels) ? rawJutsus.levels : defaultJutsusState.levels;
    const jutsuSlots = Array.isArray(rawJutsus.slots) ? rawJutsus.slots : defaultJutsusState.slots;
    window.gameCharacter.levels = { ...defaultLevels, ...levels };
    window.gameCharacter.treeBonuses = { ...defaultTreeBonuses, ...treeBonuses };
    window.gameCharacter.skillPoints = skillPoints;
    window.gameCharacter.jutsus = {
      chakra: Math.max(0, Math.floor(Number(rawJutsus.chakra) || defaultJutsusState.chakra)),
      levels: [...defaultJutsusState.levels].map((_, index) => Math.max(0, Math.min(9, Math.floor(Number(jutsuLevels[index]) || 0)))),
      slots: [...defaultJutsusState.slots].map((_, index) => {
        const id = Number(jutsuSlots[index]);
        return Number.isInteger(id) && id >= 0 && id < JUTSUS_LIBRARY.length ? id : null;
      })
    };
    window.gameCharacter.gold = Math.max(0, Math.floor(Number(payload.equipment?.gold) || state.gold));
    state.gold = window.gameCharacter.gold;

    return character;
  }

  function recordMissionProgress(reward) {
    if (!reward || typeof reward !== 'object') return;
    if (!state.missionProgress || typeof state.missionProgress !== 'object') {
      state.missionProgress = sanitizeMissionProgress();
    }

    const source = reward.__source === 'bingo' ? 'bingo' : 'rank';
    state.missionProgress.totalWins += 1;

    if (source === 'bingo') {
      state.missionProgress.bingoWins += 1;
    } else {
      const rank = typeof reward.__rank === 'string' ? reward.__rank : 'GEN';
      state.missionProgress.rankWins[rank] = (state.missionProgress.rankWins[rank] || 0) + 1;
    }

    queueAutoSave();
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
    window.gameCharacter.treeBonuses = { ...defaultTreeBonuses };
    window.gameCharacter.skillPoints = defaultSkillPoints;
    window.gameCharacter.jutsus = { ...defaultJutsusState, levels: [...defaultJutsusState.levels], slots: [...defaultJutsusState.slots] };

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

    if (sharedState?.setState) {
      sharedState.setState({
        atk: Math.max(1, Math.round(stats.ATK || state.atk)),
        def: Math.max(1, Math.round(stats.DEF || state.def))
      });
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
    if (uiCache.level !== state.level) {
      uiCache.level = state.level;
      refs.charLevel.textContent = state.level;
    }

    if (sharedState?.setState) {
      sharedState.setState({ hp: state.hp });
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

  function refreshAllStatViews() {
    syncCombatResources();
    refreshResourceBars();
    syncTopStats();
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
      queueAutoSave();
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

  function stopHeroPassiveRegen() {
    if (barsIntervalId !== null) {
      window.clearInterval(barsIntervalId);
      barsIntervalId = null;
    }
  }

  function startHeroPassiveRegen() {
    stopHeroPassiveRegen();
    barsIntervalId = window.setInterval(() => {
      if (state.activeSection !== 'heroe') return;
      const hpRegen = Math.max(1, Math.round(state.hpMax * 0.05));
      const mpRegen = Math.max(1, Math.round(state.mpMax * 0.05));
      const nextHp = Math.min(state.hpMax, state.hp + hpRegen);
      const nextMp = Math.min(state.mpMax, state.mp + mpRegen);
      if (nextHp === state.hp && nextMp === state.mp) return;
      state.hp = nextHp;
      state.mp = nextMp;
      refreshResourceBars();
    }, 1000);
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
    if (typeof arbolCleanup === 'function') {
      arbolCleanup();
      arbolCleanup = null;
    }
    if (typeof jutsusCleanup === 'function') {
      jutsusCleanup();
      jutsusCleanup = null;
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

  function resolveEquippedJutsusForCombat() {
    const jutsuState = window.gameCharacter?.jutsus || defaultJutsusState;
    const slots = Array.isArray(jutsuState.slots) ? jutsuState.slots : [];
    const levels = Array.isArray(jutsuState.levels) ? jutsuState.levels : [];
    return slots
      .map((id) => (Number.isInteger(id) ? JUTSUS_LIBRARY[id] : null))
      .filter(Boolean)
      .map((skill) => {
        const levelIndex = Math.max(0, Math.min(9, Math.floor(Number(levels[skill.id]) || 0)));
        return { ...skill, levelIndex, level: levelIndex + 1, values: skill.levels[levelIndex] };
      });
  }

  window.resolveEquippedJutsusForCombat = resolveEquippedJutsusForCombat;

  function renderJutsusSection() {
    cleanupCenter();
    const panel = document.createElement('div');
    panel.className = 'jutsus-system';
    panel.innerHTML = `
      <div class="jutsu-top"><b>🈳 Chakra</b><span id="jutsu-chakra"></span></div>
      <div class="jutsu-slots" id="jutsu-slots"></div>
      <div class="jutsu-list" id="jutsu-list"></div>`;
    refs.center.appendChild(panel);

    const chakraEl = panel.querySelector('#jutsu-chakra');
    const slotsEl = panel.querySelector('#jutsu-slots');
    const listEl = panel.querySelector('#jutsu-list');

    const fmt = (v, unit) => {
      if (unit) return `${v}${unit}`;
      return Number.isInteger(v) ? `${v}%` : `${Number(v).toFixed(1)}%`;
    };
    const getState = () => {
      if (!window.gameCharacter.jutsus) {
        window.gameCharacter.jutsus = { ...defaultJutsusState, levels: [...defaultJutsusState.levels], slots: [...defaultJutsusState.slots] };
      }
      return window.gameCharacter.jutsus;
    };
    const slotOf = (id) => getState().slots.indexOf(id);

    const render = () => {
      const jutsuState = getState();
      chakraEl.textContent = Number(jutsuState.chakra || 0).toLocaleString('es-ES');

      slotsEl.innerHTML = '';
      jutsuState.slots.forEach((skillId, index) => {
        const slot = document.createElement('button');
        slot.className = 'jutsu-slot';
        const sk = Number.isInteger(skillId) ? JUTSUS_LIBRARY[skillId] : null;
        if (!sk) {
          slot.textContent = `Slot ${index + 1} vacío`;
        } else {
          slot.textContent = `${sk.name} Lv ${jutsuState.levels[skillId] + 1}`;
        }
        slot.addEventListener('click', () => {
          if (sk) {
            window.alert(`${sk.name} equipado en slot ${index + 1}`);
          }
        }, { signal });
        slotsEl.appendChild(slot);
      });

      listEl.innerHTML = '';
      JUTSUS_LIBRARY.forEach((sk) => {
        const lv = jutsuState.levels[sk.id];
        const values = sk.levels[lv];
        const equipped = slotOf(sk.id) >= 0;
        const card = document.createElement('div');
        card.className = 'jutsu-card';
        card.innerHTML = `
          <div class="jutsu-card-top">
            <span class="jutsu-name">${sk.name}</span>
            <span class="jutsu-lv">Lv ${lv + 1}/10 ${equipped ? '✔' : ''}</span>
          </div>
          <div class="jutsu-stats">${sk.statKeys.slice(0, 3).map((key, i) => `<span>${key} ${fmt(values[i], sk.units?.[i])}</span>`).join('')}</div>
          <div class="jutsu-desc">${sk.descs.join(' · ')}</div>
          <div class="jutsu-actions">
            <button data-action="upgrade" data-id="${sk.id}">🈳 ${JUTSUS_UPGRADE_COST} Mejorar</button>
            <button data-action="equip" data-id="${sk.id}">${equipped ? '✖ Quitar' : '+ Equipar'}</button>
          </div>`;
        listEl.appendChild(card);
      });
    };

    listEl.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      const skillId = Number(btn.dataset.id);
      const skill = JUTSUS_LIBRARY[skillId];
      if (!skill) return;
      const jutsuState = getState();
      const action = btn.dataset.action;

      if (action === 'upgrade') {
        if (jutsuState.levels[skillId] >= 9) return;
        if (jutsuState.chakra < JUTSUS_UPGRADE_COST) return;
        jutsuState.chakra -= JUTSUS_UPGRADE_COST;
        jutsuState.levels[skillId] += 1;
      } else if (action === 'equip') {
        const existing = slotOf(skillId);
        if (existing >= 0) {
          jutsuState.slots[existing] = null;
        } else {
          const free = jutsuState.slots.indexOf(null);
          if (free < 0) return;
          jutsuState.slots[free] = skillId;
        }
      }
      queueAutoSave();
      render();
    }, { signal });

    render();
    jutsusCleanup = () => panel.remove();
  }


  function renderMisionesSection() {
    cleanupCenter();

    const panel = document.createElement('div');
    panel.className = 'heroe-system';
    panel.style.padding = '0';
    refs.center.appendChild(panel);

    const playerStats = {
      get hp() { return sharedState?.getState ? sharedState.getState().hp : state.hp; },
      set hp(value) { state.hp = Math.max(0, Math.round(value)); refreshResourceBars(); },
      get maxHp() { return state.hpMax; },
      get mp() { return state.mp; },
      set mp(value) { state.mp = Math.max(0, Math.round(value)); refreshResourceBars(); },
      get maxMp() { return state.mpMax; },
      get atk() {
        const shared = sharedState?.getState ? sharedState.getState().atk : null;
        return Math.max(1, Math.round(shared || window.heroEngine.computeStats(window.gameCharacter).ATK || state.atk));
      },
      get def() {
        const shared = sharedState?.getState ? sharedState.getState().def : null;
        return Math.max(1, Math.round(shared || window.heroEngine.computeStats(window.gameCharacter).DEF || state.def));
      },
      get level() { return state.level; }
    };

    const ui = window.createMisionesRangoUI({
      container: panel,
      getPlayerStats: () => playerStats,
      onRewardGain: (reward) => {
        recordMissionProgress(reward);
        applyCombatRewards({ xp: reward.xp, gold: reward.gold });
      },
      onCombatStateChange: (active) => {
        refs.overlay.classList.remove('visible');
        refs.nav.style.pointerEvents = active ? 'none' : '';
        refs.nav.style.opacity = active ? '0.4' : '';
      },
      onPlayerAttack: () => {
        const playerStats = window.heroEngine.computeStats(window.gameCharacter);
        const regenPct = Math.max(0, Number(playerStats.REGEN) || 0);
        if (regenPct <= 0) return;

        const hpHeal = Math.max(1, Math.round(state.hpMax * (regenPct / 100)));
        const mpHeal = Math.max(1, Math.round(state.mpMax * (regenPct / 100)));
        const nextHp = Math.min(state.hpMax, state.hp + hpHeal);
        const nextMp = Math.min(state.mpMax, state.mp + mpHeal);

        if (nextHp === state.hp && nextMp === state.mp) return;
        state.hp = nextHp;
        state.mp = nextMp;
        refreshResourceBars();
      },
      onReturn: () => {
        refs.nav.style.pointerEvents = '';
        refs.nav.style.opacity = '';
      },
      onSkillPointEarned: ({ amount }) => {
        const gain = Math.max(0, Math.floor(Number(amount) || 0));
        if (gain <= 0) return;
        const current = Math.max(0, Math.floor(Number(window.gameCharacter.skillPoints) || 0));
        window.gameCharacter.skillPoints = current + gain;
        queueAutoSave();
      }
    });

    misionesCleanup = () => {
      ui.destroy();
      panel.remove();
      refs.nav.style.pointerEvents = '';
      refs.nav.style.opacity = '';
    };
  }

  function renderAjustesSection() {
    cleanupCenter();
    const panel = document.createElement('div');
    panel.className = 'heroe-system';
    panel.style.gap = '12px';
    panel.innerHTML = `
      <div class="section-label">── PERSISTENCIA DE PARTIDA ──</div>
      <div style="display:flex;flex-direction:column;gap:10px;padding:6px 8px;">
        <button class="menu-button" id="btn-save-manual">💾 Guardar ahora</button>
        <button class="menu-button menu-button-alt" id="btn-load-manual">📂 Cargar último guardado</button>
        <div style="font-size:.72rem;color:var(--text-mid);line-height:1.45;">
          El guardado automático ocurre cada 30 segundos, al cambiar de pestaña y durante eventos clave de progreso.
        </div>
      </div>
    `;
    refs.center.appendChild(panel);

    const saveBtn = panel.querySelector('#btn-save-manual');
    const loadBtn = panel.querySelector('#btn-load-manual');

    const handleSave = () => saveGame({ notify: true });
    const handleLoad = () => {
      const save = readSaveData();
      if (!save) {
        window.alert('No existe una partida guardada.');
        return;
      }
      applySaveData(save);
      refreshResourceBars();
      syncTopStats();
      if (state.activeSection === 'heroe') {
        renderHeroSection();
      }
      window.alert('✅ Partida cargada.');
    };

    saveBtn.addEventListener('click', handleSave, { signal });
    loadBtn.addEventListener('click', handleLoad, { signal });
  }

  function renderArbolSection() {
    cleanupCenter();
    if (typeof window.mountArbolUI !== 'function') {
      renderPlaceholder('habilidades');
      return;
    }

    const panel = document.createElement('div');
    panel.className = 'heroe-system';
    panel.style.padding = '0';
    panel.style.width = '100%';
    panel.style.height = '100%';
    panel.style.minHeight = '0';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    const hudCenter = document.getElementById('hud-center');
    if (hudCenter) {
      refs.center.replaceChildren(panel);
    } else {
      refs.center.appendChild(panel);
    }

    const ui = window.mountArbolUI({
      container: panel,
      manager: sharedState,
      getStats: () => window.heroEngine.computeStats(window.gameCharacter),
      getSkillPoints: () => Math.max(0, Math.floor(Number(window.gameCharacter.skillPoints) || 0)),
      spendSkillPoints: (cost) => {
        const amount = Math.max(0, Math.floor(Number(cost) || 0));
        const current = Math.max(0, Math.floor(Number(window.gameCharacter.skillPoints) || 0));
        if (amount <= 0 || current < amount) return false;
        window.gameCharacter.skillPoints = current - amount;
        queueAutoSave();
        return true;
      },
      onAllocateStat: ({ stat, amount }) => {
        if (!stat || !Number.isFinite(Number(amount))) return;
        const current = Number(window.gameCharacter.treeBonuses[stat] || 0);
        window.gameCharacter.treeBonuses[stat] = current + Number(amount);
        refreshAllStatViews();
        queueAutoSave();
      }
    });
    arbolCleanup = () => {
      ui.destroy();
      panel.remove();
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
      queueAutoSave();

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
      startHeroPassiveRegen();
      refs.overlay.classList.remove('visible');
      renderHeroSection();
      return;
    }

    if (sectionKey === 'misiones') {
      stopHeroPassiveRegen();
      refs.overlay.classList.remove('visible');
      renderMisionesSection();
      return;
    }

    if (sectionKey === 'ajustes') {
      stopHeroPassiveRegen();
      refs.overlay.classList.remove('visible');
      renderAjustesSection();
      return;
    }

    if (sectionKey === 'habilidades') {
      stopHeroPassiveRegen();
      refs.overlay.classList.remove('visible');
      renderArbolSection();
      return;
    }

    if (sectionKey === 'jutsus') {
      stopHeroPassiveRegen();
      refs.overlay.classList.remove('visible');
      renderJutsusSection();
      return;
    }

    stopHeroPassiveRegen();
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

  function mountStartMenu(onChooseCharacter, onLoadSavedGame) {
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
          <div class="load-msg" id="load-message"><span>📂</span>No se encontró ninguna partida guardada.</div>
          <button class="menu-btn btn-primary" id="load-confirm-btn" data-action="confirm-load" style="display:none;max-width:220px;margin-top:8px;">▶ CARGAR GUARDADO</button>
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
    const loadMessage = root.querySelector('#load-message');
    const loadConfirmBtn = root.querySelector('#load-confirm-btn');
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
      if (action === 'load-game') {
        if (hasSavedGame()) {
          loadMessage.innerHTML = '<span>📂</span>Partida detectada. Puedes continuar tu progreso.';
          loadConfirmBtn.style.display = '';
        } else {
          loadMessage.innerHTML = '<span>📂</span>No se encontró ninguna partida guardada.';
          loadConfirmBtn.style.display = 'none';
        }
        showScreen('s-load');
      }
      if (action === 'confirm-load') onLoadSavedGame();
      if (action === 'back-menu') showScreen('s-menu');
    }, { signal });
  }

  function unmountStartMenu() {
    document.getElementById('ninja-start-root')?.remove();
    document.getElementById('ninja-start-style')?.remove();
  }

  function launchGame(char, options = {}) {
    if (gameLaunched) return;
    gameLaunched = true;

    if (options.loadPayload) {
      applySaveData(options.loadPayload);
    } else {
      applyCharacterToGame(char);
      state.missionProgress = sanitizeMissionProgress();
    }
    unmountStartMenu();
    showMainHud();

    refs.nav.addEventListener('click', handleNavClick, { signal });
    refs.overlay.addEventListener('click', handleOverlayClick, { signal });
    document.addEventListener('keydown', handleKeyDown, { signal });

    refreshResourceBars();
    syncTopStats();
    startAutoSave();

    const heroBtn = document.getElementById('btn-heroe');
    if (heroBtn) {
      openSection('heroe', heroBtn);
    }

    if (!options.loadPayload) {
      saveGame();
    }
  }

  async function start() {
    hideMainHud();
    await ensureCharacterScript();
    mountStartMenu(
      (char) => {
        launchGame(char);
      },
      () => {
        const payload = readSaveData();
        if (!payload) {
          window.alert('No existe una partida guardada válida.');
          return;
        }
        launchGame(null, { loadPayload: payload });
      }
    );
  }

  function destroy() {
    saveGame();
    gameLaunched = false;
    controller.abort();
    cleanupCenter();
    unmountStartMenu();
    stopAutoSave();
    if (barsIntervalId !== null) window.clearInterval(barsIntervalId);
    barsIntervalId = null;
  }

  window.__ninjaHud = { destroy, selectedCharacter: () => selectedCharacter };
  start();
})();
