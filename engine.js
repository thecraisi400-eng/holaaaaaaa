(() => {
  const { initialState, sections } = window.gameData;
  const state = { ...initialState };
  const player = state;
  const STORAGE_KEY = 'naruto-idle-rpg-save-v1';
  const AUTO_SAVE_MS = 1000;
  const DEFAULT_LEVEL_GAINS = {
    HP: 12,
    MP: 8,
    ATK: 3,
    DEF: 3,
  };

  let started = false;
  let regenInterval = null;
  let regenTimeout = null;
  let wasFighting = false;
  let regenCheckerInterval = null;
  let autoSaveInterval = null;

  function updateUI() {
    if (window.gameUI) window.gameUI.updateBars(player);
    const atkNode = document.getElementById('statAtk');
    const defNode = document.getElementById('statDef');
    if (atkNode) atkNode.textContent = Math.round(player.atk).toLocaleString();
    if (defNode) defNode.textContent = Math.round(player.def).toLocaleString();
  }

  function sanitizeNumericMap(map) {
    if (!map || typeof map !== 'object') return {};
    return Object.entries(map).reduce((acc, [key, value]) => {
      const num = Number(value);
      if (Number.isFinite(num)) acc[key] = num;
      return acc;
    }, {});
  }

  function ensurePlayerInternals() {
    if (!player.baseStats || typeof player.baseStats !== 'object') {
      player.baseStats = {
        HP: Number(player.hpMax) || 0,
        MP: Number(player.mpMax) || 0,
        ATK: Number(player.atk) || 0,
        DEF: Number(player.def) || 0,
      };
    }
    player.baseStats = sanitizeNumericMap(player.baseStats);

    const gains = sanitizeNumericMap(player.levelGains);
    player.levelGains = {
      ...DEFAULT_LEVEL_GAINS,
      ...gains,
    };

    if (!Number.isFinite(player.level) || player.level < 1) player.level = 1;
    if (!Number.isFinite(player.exp) || player.exp < 0) player.exp = 0;
    if (!Number.isFinite(player.expMax) || player.expMax < 1) {
      player.expMax = nextExpRequirement(player.level + 1);
    }
  }

  function syncStatsWithEquipment() {
    if (!window.equipLogic || !window.equipLogic.computeStats) return;
    const equippedStats = window.equipLogic.computeStats(player.baseStats || {});
    player.hpMax = Math.round(equippedStats.HP || player.hpMax || 0);
    player.mpMax = Math.round(equippedStats.MP || player.mpMax || 0);
    player.atk = Number((equippedStats.ATK ?? player.atk).toFixed(1));
    player.def = Number((equippedStats.DEF ?? player.def).toFixed(1));
    player.regen = Number((equippedStats.REGEN ?? player.regen ?? 0).toFixed(2));
    player.hp = Math.min(player.hpMax, Math.max(0, player.hp));
    player.mp = Math.min(player.mpMax, Math.max(0, player.mp));
  }

  function isInBattle() {
    return Boolean(window.gameUI && window.gameUI.isMissionBattleActive && window.gameUI.isMissionBattleActive());
  }

  function applyOutOfCombatRegen() {
    const regenRate = 0.02;

    const hpGain = player.hp < player.hpMax
      ? Math.max(1, Math.round(player.hpMax * regenRate))
      : 0;
    const mpGain = player.mp < player.mpMax
      ? Math.max(1, Math.round(player.mpMax * regenRate))
      : 0;

    if (!hpGain && !mpGain) return;

    player.hp = Math.min(player.hpMax, player.hp + hpGain);
    player.mp = Math.min(player.mpMax, player.mp + mpGain);
    updateUI();
  }

  function stopRegenerationLoop() {
    if (regenInterval) {
      clearInterval(regenInterval);
      regenInterval = null;
    }
  }

  function startRegenerationLoop() {
    stopRegenerationLoop();
    regenInterval = setInterval(applyOutOfCombatRegen, 1000);
  }

  function clearRegenDelay() {
    if (regenTimeout) {
      clearTimeout(regenTimeout);
      regenTimeout = null;
    }
  }

  function handleRegeneration() {
    const isFighting = isInBattle();
    const isInHeroSection = player.activeSection === 'heroe';

    if (isFighting) {
      wasFighting = true;
      clearRegenDelay();
      stopRegenerationLoop();
      return;
    }

    if (!isInHeroSection) {
      wasFighting = false;
      clearRegenDelay();
      stopRegenerationLoop();
      return;
    }

    if (wasFighting) {
      if (regenInterval) return;
      clearRegenDelay();
      regenTimeout = setTimeout(() => {
        regenTimeout = null;
        if (!isInBattle() && player.activeSection === 'heroe') {
          wasFighting = false;
          startRegenerationLoop();
        }
      }, 2000);
      return;
    }

    if (!regenInterval) {
      startRegenerationLoop();
    }
  }

  function nextExpRequirement(level) {
    return Math.max(1, Math.round(120 * Math.pow(level, 1.3)));
  }

  function applyLevelUpStats() {
    ensurePlayerInternals();
    for (const [stat, amount] of Object.entries(player.levelGains || {})) {
      const gain = Number(amount) || 0;
      if (!gain) continue;
      player.baseStats[stat] = Math.max(0, (Number(player.baseStats[stat]) || 0) + gain);
    }

    syncStatsWithEquipment();
    player.hp = player.hpMax;
    player.mp = player.mpMax;
  }

  function addExperience(amount) {
    const gain = Math.max(0, Math.floor(Number(amount) || 0));
    if (!gain) return;
    ensurePlayerInternals();

    player.exp += gain;
    while (player.exp >= player.expMax) {
      player.exp -= player.expMax;
      player.level += 1;
      applyLevelUpStats();
      player.expMax = nextExpRequirement(player.level + 1);
    }
    updateUI();
  }

  function applyProfile(profile) {
    if (!profile) return;

    if (profile.avatar) {
      document.querySelector('#avatarFrame .avatar-placeholder').textContent = profile.avatar;
    }
    if (profile.charName) {
      document.getElementById('charName').textContent = profile.charName.toUpperCase();
    }
    if (profile.rank) {
      document.getElementById('charRank').textContent = profile.rank.toUpperCase();
    }

    if (profile.stats) {
      player.baseStats = {
        HP: Number(profile.stats.HP) || 0,
        MP: Number(profile.stats.MP) || 0,
        ATK: Number(profile.stats.ATK) || 0,
        DEF: Number(profile.stats.DEF) || 0,
      };
      player.levelGains = {
        ...DEFAULT_LEVEL_GAINS,
        ...sanitizeNumericMap(profile.levelGains),
      };
      player.hp = player.baseStats.HP;
      player.hpMax = player.baseStats.HP;
      player.mp = player.baseStats.MP;
      player.mpMax = player.baseStats.MP;
      player.atk = player.baseStats.ATK;
      player.def = player.baseStats.DEF;
      player.regen = Number(profile.stats.REGEN) || 0;
      player.exp = 0;
      player.level = 1;
      player.expMax = nextExpRequirement(2);
      player.gold = profile.gold ?? 0;
    }
    ensurePlayerInternals();
  }

  function buildSaveSnapshot() {
    ensurePlayerInternals();
    return {
      version: 1,
      savedAt: Date.now(),
      player: {
        hp: player.hp,
        hpMax: player.hpMax,
        mp: player.mp,
        mpMax: player.mpMax,
        exp: player.exp,
        expMax: player.expMax,
        gold: player.gold,
        atk: player.atk,
        def: player.def,
        level: player.level,
        activeSection: player.activeSection,
        regen: player.regen,
        baseStats: player.baseStats,
        levelGains: player.levelGains,
      },
      identity: {
        avatar: document.querySelector('#avatarFrame .avatar-placeholder')?.textContent || '',
        charName: document.getElementById('charName')?.textContent || '',
        rank: document.getElementById('charRank')?.textContent || '',
      },
      equipmentLevels: window.equipLogic?.levels ? { ...window.equipLogic.levels } : null,
    };
  }

  function saveGame() {
    try {
      const payload = buildSaveSnapshot();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.warn('No se pudo guardar la partida.', error);
      return false;
    }
  }

  function loadGameData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      console.warn('No se pudo cargar la partida guardada.', error);
      return null;
    }
  }

  function applySaveSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;
    const savedPlayer = snapshot.player;
    if (!savedPlayer || typeof savedPlayer !== 'object') return false;

    Object.assign(player, savedPlayer);
    ensurePlayerInternals();

    if (window.equipLogic?.levels && snapshot.equipmentLevels && typeof snapshot.equipmentLevels === 'object') {
      for (const key of Object.keys(window.equipLogic.levels)) {
        const lv = Number(snapshot.equipmentLevels[key]);
        if (Number.isFinite(lv) && lv >= 1) {
          window.equipLogic.levels[key] = Math.floor(lv);
        }
      }
    }

    const identity = snapshot.identity || {};
    if (identity.avatar) {
      const avatarNode = document.querySelector('#avatarFrame .avatar-placeholder');
      if (avatarNode) avatarNode.textContent = identity.avatar;
    }
    if (identity.charName) {
      const nameNode = document.getElementById('charName');
      if (nameNode) nameNode.textContent = String(identity.charName).toUpperCase();
    }
    if (identity.rank) {
      const rankNode = document.getElementById('charRank');
      if (rankNode) rankNode.textContent = String(identity.rank).toUpperCase();
    }

    syncStatsWithEquipment();
    updateUI();
    return true;
  }

  function hasSaveGame() {
    return Boolean(loadGameData());
  }

  function loadGame() {
    return applySaveSnapshot(loadGameData());
  }

  function startAutoSave() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(saveGame, AUTO_SAVE_MS);
  }

  function init(profile) {
    if (started) return;
    started = true;

    if (window.equipUI) {
      window.equipUI.init({
        getGold: () => player.gold,
        setGold: (value) => {
          player.gold = Math.max(0, value);
          updateUI();
        },
        getPlayer: () => player,
        onEquipmentChange: () => {
          syncStatsWithEquipment();
          updateUI();
        },
      });
      window.equipUI.showHeroSection(player.activeSection === 'heroe');
    }

    applyProfile(profile);
    syncStatsWithEquipment();
    window.gameUI.bindMissionDelegation(player);
    window.gameUI.bindNavigation(player, sections);
    handleRegeneration();
    if (regenCheckerInterval) clearInterval(regenCheckerInterval);
    regenCheckerInterval = setInterval(handleRegeneration, 250);
    startAutoSave();
    saveGame();
    updateUI();
  }

  window.updateUI = updateUI;
  window.gameEngine = {
    init,
    state: player,
    updateUI,
    addExperience,
    syncStatsWithEquipment,
    handleRegeneration,
    saveGame,
    loadGame,
    hasSaveGame,
  };
  window.player = player;
})();
