(() => {
  const { initialState, sections } = window.gameData;
  const state = { ...initialState };
  const player = state;
  let started = false;
  let regenInterval = null;
  let regenTimeout = null;
  let wasFighting = false;

  function updateUI() {
    if (window.gameUI) window.gameUI.updateBars(player);
    const atkNode = document.getElementById('statAtk');
    const defNode = document.getElementById('statDef');
    if (atkNode) atkNode.textContent = Math.round(player.atk).toLocaleString();
    if (defNode) defNode.textContent = Math.round(player.def).toLocaleString();
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
    if (player.hp <= 0) return;
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
    const isOutsideMissionPanel = player.activeSection !== 'misiones';

    if (isFighting) {
      wasFighting = true;
      clearRegenDelay();
      stopRegenerationLoop();
      return;
    }

    if (regenInterval) return;

    if (wasFighting) {
      clearRegenDelay();
      regenTimeout = setTimeout(() => {
        regenTimeout = null;
        if (!isInBattle()) {
          wasFighting = false;
          startRegenerationLoop();
        }
      }, 2000);
      return;
    }

    if (isOutsideMissionPanel || !isFighting) {
      startRegenerationLoop();
    }
  }

  function nextExpRequirement(level) {
    return Math.max(1, Math.round(120 * Math.pow(level, 1.3)));
  }

  function addExperience(amount) {
    const gain = Math.max(0, Math.floor(Number(amount) || 0));
    if (!gain) return;
    player.exp += gain;
    while (player.exp >= player.expMax) {
      player.exp -= player.expMax;
      player.level += 1;
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
    setInterval(handleRegeneration, 250);
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
  };
  window.player = player;
})();
