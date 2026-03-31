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
      onDefeat,
      onPlayerAttack
    } = config;

    let battleInterval = null;
    let enemyRespawnTimeout = null;
    let battleActive = false;
    let enemyTransitionPending = false;
    let currentEnemy = null;
    let enemyStatus = null;
    let turnCounter = 0;
    let combatJutsus = [];
    let enemyIndex = 0;
    let currentMissionList = [];
    let battleLoopCount = 0;
    const ENEMY_DEFEAT_VISUAL_DELAY_MS = 320;

    function loadEnemy(index) {
      const mission = currentMissionList[index];
      currentEnemy = { name: mission.name, hp: mission.hp, maxHp: mission.hp, atk: mission.atk, def: mission.def, xp: mission.xp, gold: mission.gold, mp: 100, maxMp: 100 };
      enemyStatus = { stunTurns: 0, freezeTurns: 0, atkDebuffPct: 0, defDebuffPct: 0, skipNextTurn: false };
      onEnemy(currentEnemy, resolveEnemyEmoji(mission.name));
      onBars(getPlayerStats(), currentEnemy);
    }

    function start(missions, missionIndex, options = {}) {
      stop();
      const settings = {
        continueOnWin: options.continueOnWin !== false,
        onVictory: typeof options.onVictory === 'function' ? options.onVictory : null,
        onDefeat: typeof options.onDefeat === 'function' ? options.onDefeat : null,
        rank: typeof options.rank === 'string' ? options.rank : null
      };

      currentMissionList = missions;
      enemyIndex = missionIndex;
      battleLoopCount = 0;
      enemyTransitionPending = false;
      loadEnemy(enemyIndex);
      combatJutsus = typeof window.resolveEquippedJutsusForCombat === 'function' ? window.resolveEquippedJutsusForCombat() : [];
      turnCounter = 0;
      onLog(`⚔️ Auto-Battle iniciado contra: ${currentEnemy.name}`);
      if (combatJutsus.length > 0) {
        onLog(`🌀 Jutsus equipados activos: ${combatJutsus.map((j) => `${j.name} Lv.${j.level}`).join(', ')}`);
      }

      battleActive = true;
      battleInterval = window.setInterval(() => {
        if (!battleActive) return;
        if (enemyTransitionPending) return;
        const playerStats = getPlayerStats();
        turnCounter += 1;
        let atkMult = 1;
        let defMult = 1;
        let evadeChance = 0;
        let critChance = 0;
        let critDmg = 0;
        let extraHit = 0;
        let defensePen = 0;
        let enemyFailChance = 0;
        let counterChance = 0;

        const activatedJutsus = combatJutsus.filter((jutsu) => {
          const activationChance = Math.max(0, Math.min(100, Number(jutsu.values?.[3]) || 0));
          return Math.random() * 100 < activationChance;
        });

        if (activatedJutsus.length > 0) {
          onLog(`🌀 Turno ${turnCounter}: ${activatedJutsus.map((jutsu) => `${jutsu.name} (${Math.max(0, Math.min(100, Number(jutsu.values?.[3]) || 0))}%)`).join(', ')} activado(s).`);
        }

        activatedJutsus.forEach((jutsu) => {
          const values = jutsu.values;
          if (jutsu.id === 0) {
            enemyFailChance += Math.max(0, Number(values[2]) || 0);
            defMult += (Number(values[1]) || 0) / 100;
            const burn = Math.max(1, Math.floor(currentEnemy.maxHp * ((Number(values[0]) || 0) / 100)));
            currentEnemy.hp = Math.max(0, currentEnemy.hp - burn);
            onLog(`🔥 ${jutsu.name} quema por ${burn}.`);
          }
          if (jutsu.id === 1) {
            defensePen += Number(values[2]) || 0;
            enemyStatus.freezeTurns = Math.max(enemyStatus.freezeTurns, 1);
            onLog(`❄️ ${jutsu.name} congeló al enemigo.`);
          }
          if (jutsu.id === 2) {
            atkMult += (Number(values[1]) || 0) / 100;
            defMult += (Number(values[1]) || 0) / 100;
            enemyStatus.defDebuffPct = Math.max(enemyStatus.defDebuffPct, Math.abs(Number(values[2]) || 0));
            const poison = Math.max(1, Math.floor(currentEnemy.maxHp * ((Number(values[0]) || 0) / 100)));
            currentEnemy.hp = Math.max(0, currentEnemy.hp - poison);
            onLog(`☠️ ${jutsu.name} envenena por ${poison}.`);
          }
          if (jutsu.id === 3) {
            counterChance = Math.max(counterChance, Number(values[1]) || 0);
            enemyStatus.atkDebuffPct = Math.max(enemyStatus.atkDebuffPct, Math.abs(Number(values[2]) || 0));
            enemyStatus.stunTurns = Math.max(enemyStatus.stunTurns, 1);
            onLog(`🌀 ${jutsu.name} aturdió al enemigo.`);
          }
          if (jutsu.id === 4) {
            evadeChance = Math.max(evadeChance, Number(values[1]) || 0);
            atkMult += (Number(values[1]) || 0) / 100;
            if (Math.random() * 100 < Math.max(0, Number(values[2]) || 0)) {
              enemyStatus.skipNextTurn = true;
              onLog(`🌀 ${jutsu.name} confundió al enemigo.`);
            }
          }
          if (jutsu.id === 5) {
            const hpRegen = Math.max(1, Math.floor(playerStats.maxHp * ((Number(values[1]) || 0) / 100)));
            playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + hpRegen);
            playerStats.mp = Math.min(playerStats.maxMp, playerStats.mp + (Number(values[0]) || 0));
            onLog(`🩸 ${jutsu.name}: +${hpRegen} HP, +${values[0]} MP.`);
          }
          if (jutsu.id === 6) {
            critChance = Math.max(critChance, Number(values[1]) || 0);
            enemyStatus.stunTurns = Math.max(enemyStatus.stunTurns, Number(values[0]) || 1);
            onLog(`😵 ${jutsu.name} aplica aturdimiento.`);
          }
          if (jutsu.id === 7) {
            atkMult += (Number(values[1]) || 0) / 100;
            critDmg += Number(values[2]) || 0;
            extraHit = Math.max(extraHit, Number(values[0]) || 0);
            const hpCost = Math.max(1, Math.floor(playerStats.maxHp * 0.02));
            playerStats.hp = Math.max(1, playerStats.hp - hpCost);
            onLog(`💥 ${jutsu.name} sacrifica ${hpCost} HP.`);
          }
        });

        if (playerStats.hp > 0 && currentEnemy.hp > 0) {
          const enemyDef = Math.max(0, currentEnemy.def * (1 - (enemyStatus.defDebuffPct / 100)) * (1 - defensePen / 100));
          let dmg = Math.max(1, Math.floor((playerStats.atk * atkMult) - enemyDef / 3 + Math.random() * 8));
          if (Math.random() * 100 < critChance) {
            dmg = Math.floor(dmg * (1.5 + critDmg / 100));
            onLog('🎯 ¡Golpe crítico potenciado por jutsus!');
          }
          if (extraHit > 0) {
            dmg += Math.floor((playerStats.atk * extraHit) / 100);
          }
          currentEnemy.hp -= dmg;
          if (currentEnemy.hp < 0) currentEnemy.hp = 0;
          onLog(`🥷 Atacas y causas ${dmg} daño.`);
          if (typeof onPlayerAttack === 'function') {
            onPlayerAttack({ playerStats, enemy: currentEnemy, damage: dmg });
          }
          onBars(playerStats, currentEnemy);
          if (currentEnemy.hp <= 0) {
            const rewards = currentMissionList[enemyIndex];
            onLog(`💀 ¡Enemigo derrotado! +${rewards.xp} XP y +${rewards.gold} Oro.`);
            onRewards({
              ...rewards,
              __rank: settings.rank
            });

            if (!settings.continueOnWin) {
              battleActive = false;
              stop();
              if (settings.onVictory) settings.onVictory({ enemy: currentEnemy, rewards });
              return;
            }

            battleLoopCount += 1;
            enemyTransitionPending = true;
            enemyRespawnTimeout = window.setTimeout(() => {
              enemyRespawnTimeout = null;
              if (!battleActive) return;
              loadEnemy(enemyIndex);
              enemyTransitionPending = false;
              onLog(`🔁 Iteración ${battleLoopCount}: ${currentEnemy.name} reaparece para continuar el Auto-Battle.`);
            }, ENEMY_DEFEAT_VISUAL_DELAY_MS);
            return;
          }
        }

        if (playerStats.hp > 0 && currentEnemy.hp > 0) {
          if (enemyStatus.stunTurns > 0 || enemyStatus.freezeTurns > 0 || enemyStatus.skipNextTurn) {
            enemyStatus.stunTurns = Math.max(0, enemyStatus.stunTurns - 1);
            enemyStatus.freezeTurns = Math.max(0, enemyStatus.freezeTurns - 1);
            enemyStatus.skipNextTurn = false;
            onLog(`💫 ${currentEnemy.name} pierde su turno.`);
            onBars(playerStats, currentEnemy);
            return;
          }
          if (Math.random() * 100 < Math.max(enemyFailChance, evadeChance)) {
            onLog(`💨 ${currentEnemy.name} falló su ataque.`);
            onBars(playerStats, currentEnemy);
            return;
          }
          const enemyAtk = currentEnemy.atk * (1 - (enemyStatus.atkDebuffPct / 100));
          let dmg = Math.max(1, Math.floor(enemyAtk - (playerStats.def * defMult) / 3 + Math.random() * 6));
          playerStats.hp -= dmg;
          if (playerStats.hp < 0) playerStats.hp = 0;
          onLog(`👹 ${currentEnemy.name} ataca y causa ${dmg} daño.`);
          if (counterChance > 0 && Math.random() * 100 < counterChance) {
            const counterDmg = Math.max(1, Math.floor((playerStats.atk * 0.35)));
            currentEnemy.hp = Math.max(0, currentEnemy.hp - counterDmg);
            onLog(`🔄 Contraataque activa ${counterDmg} daño.`);
          }
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
      if (enemyRespawnTimeout) {
        window.clearTimeout(enemyRespawnTimeout);
        enemyRespawnTimeout = null;
      }
      if (battleInterval) {
        window.clearInterval(battleInterval);
        battleInterval = null;
      }
      enemyTransitionPending = false;
      battleActive = false;
    }

    return { start, stop };
  }

  window.createMisionesRangoCombat = createCombatEngine;
})();
