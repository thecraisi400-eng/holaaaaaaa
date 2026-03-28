(() => {
  function resolveEnemyEmoji(name) {
    const n = name.toLowerCase();
    if (n.includes('lobo')) return '🐺';
    if (n.includes('dragón') || n.includes('dragon')) return '🐉';
    if (n.includes('demonio')) return '👿';
    if (n.includes('ogro') || n.includes('troll')) return '👹';
    if (n.includes('araña') || n.includes('arácnido')) return '🕷️';
    if (n.includes('esqueleto')) return '💀';
    if (n.includes('bandido') || n.includes('merodeador')) return '⚔️';
    if (n.includes('rata')) return '🐀';
    if (n.includes('jabalí')) return '🐗';
    if (n.includes('grifo')) return '🦅';
    if (n.includes('caballero')) return '⚔️';
    if (n.includes('titán')) return '🗿';
    if (n.includes('dios')) return '👑';
    return '👹';
  }

  function createCombatEngine(config) {
    const {
      getPlayerStats,
      onBars,
      onLog,
      onEnemy,
      onRewards,
      onDefeat
    } = config;

    let battleInterval = null;
    let battleActive = false;
    let currentEnemy = null;
    let enemyIndex = 0;
    let currentMissionList = [];
    let battleLoopCount = 0;

    function loadEnemy(index) {
      const mission = currentMissionList[index];
      currentEnemy = { name: mission.name, hp: mission.hp, maxHp: mission.hp, atk: mission.atk, def: mission.def, xp: mission.xp, gold: mission.gold };
      onEnemy(currentEnemy, resolveEnemyEmoji(mission.name));
      onBars(getPlayerStats(), currentEnemy);
    }

    function start(missions, missionIndex, options = {}) {
      stop();
      const settings = {
        continueOnWin: options.continueOnWin !== false,
        onVictory: typeof options.onVictory === 'function' ? options.onVictory : null,
        onDefeat: typeof options.onDefeat === 'function' ? options.onDefeat : null
      };

      currentMissionList = missions;
      enemyIndex = missionIndex;
      battleLoopCount = 0;
      loadEnemy(enemyIndex);
      onLog(`⚔️ Auto-Battle iniciado contra: ${currentEnemy.name}`);

      battleActive = true;
      battleInterval = window.setInterval(() => {
        if (!battleActive) return;
        const playerStats = getPlayerStats();

        if (playerStats.hp > 0 && currentEnemy.hp > 0) {
          let dmg = Math.max(1, Math.floor(playerStats.atk - currentEnemy.def / 3 + Math.random() * 8));
          currentEnemy.hp -= dmg;
          if (currentEnemy.hp < 0) currentEnemy.hp = 0;
          onLog(`🥷 Atacas y causas ${dmg} daño.`);
          onBars(playerStats, currentEnemy);
          if (currentEnemy.hp <= 0) {
            const rewards = currentMissionList[enemyIndex];
            onLog(`💀 ¡Enemigo derrotado! +${rewards.xp} XP y +${rewards.gold} Oro.`);
            onRewards(rewards);

            if (!settings.continueOnWin) {
              battleActive = false;
              stop();
              if (settings.onVictory) settings.onVictory({ enemy: currentEnemy, rewards });
              return;
            }

            battleLoopCount += 1;
            loadEnemy(enemyIndex);
            onLog(`🔁 Iteración ${battleLoopCount}: ${currentEnemy.name} reaparece para continuar el Auto-Battle.`);
          }
        }

        if (playerStats.hp > 0 && currentEnemy.hp > 0) {
          let dmg = Math.max(1, Math.floor(currentEnemy.atk - playerStats.def / 3 + Math.random() * 6));
          playerStats.hp -= dmg;
          if (playerStats.hp < 0) playerStats.hp = 0;
          onLog(`👹 ${currentEnemy.name} ataca y causa ${dmg} daño.`);
          onBars(playerStats, currentEnemy);
          if (playerStats.hp <= 0) {
            onLog('😵 Has sido derrotado...');
            battleActive = false;
            stop();
            if (settings.onDefeat) settings.onDefeat({ enemy: currentEnemy });
            onDefeat();
          }
        }

        onBars(playerStats, currentEnemy);
      }, 700);
    }

    function stop() {
      if (battleInterval) {
        window.clearInterval(battleInterval);
        battleInterval = null;
      }
      battleActive = false;
    }

    return { start, stop };
  }

  window.createMisionesRangoCombat = createCombatEngine;
})();
