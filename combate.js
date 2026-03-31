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
    const TURN_MS = 700;

    function clearCombatEffects() {
      if (enemyStatus) {
        enemyStatus.effects = [];
        enemyStatus.stunTurns = 0;
        enemyStatus.freezeTurns = 0;
        enemyStatus.atkDebuffPct = 0;
        enemyStatus.defDebuffPct = 0;
        enemyStatus.skipNextTurn = false;
      }
      combatJutsus = [];
      turnCounter = 0;
    }

    function loadEnemy(index) {
      const mission = currentMissionList[index];
      currentEnemy = { name: mission.name, hp: mission.hp, maxHp: mission.hp, atk: mission.atk, def: mission.def, xp: mission.xp, gold: mission.gold, mp: 100, maxMp: 100 };
      enemyStatus = { stunTurns: 0, freezeTurns: 0, atkDebuffPct: 0, defDebuffPct: 0, skipNextTurn: false, effects: [] };
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
        const now = Date.now();
        enemyStatus.effects = enemyStatus.effects.filter((effect) => effect.expiresAt > now);
        enemyStatus.atkDebuffPct = 0;
        enemyStatus.defDebuffPct = 0;
        let atkMult = 1;
        let defMult = 1;
        let evadeChance = 0;
        let critChance = 0;
        let critDmg = 0;
        let extraHit = 0;
        let defensePen = 0;
        let enemyFailChance = 0;
        let counterChance = 0;
        let mpCostReductionPct = 0;
        let flatDamageReduction = 0;
        let shieldHp = 0;

        const addEffect = (kind, value, durationMs) => {
          enemyStatus.effects.push({ kind, value, expiresAt: now + Math.max(TURN_MS, durationMs || TURN_MS) });
        };

        enemyStatus.effects.forEach((effect) => {
          if (effect.kind === 'atkMult') atkMult += effect.value / 100;
          if (effect.kind === 'defMult') defMult += effect.value / 100;
          if (effect.kind === 'evade') evadeChance = Math.max(evadeChance, effect.value);
          if (effect.kind === 'critChance') critChance = Math.max(critChance, effect.value);
          if (effect.kind === 'critDmg') critDmg += effect.value;
          if (effect.kind === 'extraHit') extraHit = Math.max(extraHit, effect.value);
          if (effect.kind === 'defPen') defensePen += effect.value;
          if (effect.kind === 'enemyFail') enemyFailChance = Math.max(enemyFailChance, effect.value);
          if (effect.kind === 'counter') counterChance = Math.max(counterChance, effect.value);
          if (effect.kind === 'enemyAtkDebuff') enemyStatus.atkDebuffPct = Math.max(enemyStatus.atkDebuffPct, Math.abs(effect.value));
          if (effect.kind === 'enemyDefDebuff') enemyStatus.defDebuffPct = Math.max(enemyStatus.defDebuffPct, Math.abs(effect.value));
          if (effect.kind === 'costReduction') mpCostReductionPct = Math.max(mpCostReductionPct, Math.abs(effect.value));
          if (effect.kind === 'flatReduction') flatDamageReduction = Math.max(flatDamageReduction, effect.value);
          if (effect.kind === 'shield') shieldHp = Math.max(shieldHp, effect.value);
          if (effect.kind === 'burn' || effect.kind === 'poison') {
            const dot = Math.max(1, Math.floor(currentEnemy.maxHp * (effect.value / 100) * (TURN_MS / 1000)));
            currentEnemy.hp = Math.max(0, currentEnemy.hp - dot);
            onLog(`${effect.kind === 'burn' ? '🔥' : '☠️'} ${dot} daño por ${effect.kind === 'burn' ? 'quemadura' : 'veneno'}.`);
          }
        });

        combatJutsus.forEach((jutsu) => {
          const values = jutsu.values;
          const prob = Math.max(0, Number(values[3]) || 0);
          const durationMs = Number(jutsu.durationMs) || TURN_MS;
          const activated = Math.random() * 100 < prob;
          if (!activated) return;
          const baseCost = Math.max(0, Number(values[4]) || 0);
          const mpCost = Math.max(0, Math.floor(baseCost * (1 - (mpCostReductionPct / 100))));
          if (playerStats.mp < mpCost) return;
          playerStats.mp -= mpCost;
          onLog(`🌀 ${jutsu.name} activado (Prob ${prob}%).`);

          if (jutsu.id === 0) {
            addEffect('burn', Number(values[0]) || 0, durationMs);
            addEffect('defMult', Number(values[1]) || 0, durationMs);
            addEffect('flatReduction', Math.floor((Number(values[1]) || 0) / 3), durationMs);
            addEffect('enemyFail', Number(values[2]) || 0, durationMs);
          }
          if (jutsu.id === 1) {
            enemyStatus.freezeTurns = Math.max(enemyStatus.freezeTurns, 1);
            onLog(`❄️ ${jutsu.name} congeló al enemigo.`);
            addEffect('flatReduction', Number(values[1]) || 0, durationMs);
            addEffect('defPen', Number(values[2]) || 0, durationMs);
          }
          if (jutsu.id === 2) {
            addEffect('poison', Number(values[0]) || 0, durationMs);
            addEffect('atkMult', Number(values[1]) || 0, durationMs);
            addEffect('defMult', Number(values[1]) || 0, durationMs);
            addEffect('enemyDefDebuff', Number(values[2]) || 0, durationMs);
          }
          if (jutsu.id === 3) {
            enemyStatus.stunTurns = Math.max(enemyStatus.stunTurns, 1);
            addEffect('counter', Number(values[1]) || 0, durationMs);
            addEffect('enemyAtkDebuff', Number(values[2]) || 0, durationMs);
          }
          if (jutsu.id === 4) {
            if (Math.random() * 100 < Math.max(5, Number(values[0]) || 0)) enemyStatus.skipNextTurn = true;
            addEffect('evade', Number(values[1]) || 0, durationMs);
            addEffect('atkMult', Number(values[1]) || 0, durationMs);
            if (Math.random() * 100 < Math.max(5, Number(values[2]) || 0)) enemyStatus.skipNextTurn = true;
          }
          if (jutsu.id === 5) {
            playerStats.mp = Math.min(playerStats.maxMp, playerStats.mp + (Number(values[0]) || 0));
            const hpRegen = Math.max(1, Math.floor(playerStats.maxHp * ((Number(values[1]) || 0) / 100)));
            playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + hpRegen);
            addEffect('costReduction', Number(values[2]) || 0, durationMs);
          }
          if (jutsu.id === 6) {
            enemyStatus.stunTurns = Math.max(enemyStatus.stunTurns, Number(values[0]) || 1);
            addEffect('critChance', Number(values[1]) || 0, durationMs);
            addEffect('shield', Number(values[2]) || 0, durationMs);
          }
          if (jutsu.id === 7) {
            addEffect('extraHit', Number(values[0]) || 0, durationMs);
            addEffect('atkMult', Number(values[1]) || 0, durationMs * 2);
            addEffect('critDmg', Number(values[2]) || 0, durationMs);
            const hpCost = Math.max(1, Math.floor(playerStats.maxHp * 0.02));
            playerStats.hp = Math.max(1, playerStats.hp - hpCost);
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
              clearCombatEffects();
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
          dmg = Math.max(1, dmg - Math.floor(flatDamageReduction));
          if (shieldHp > 0) {
            const blocked = Math.min(dmg, shieldHp);
            dmg -= blocked;
            const shieldEffect = enemyStatus.effects.find((effect) => effect.kind === 'shield' && effect.value > 0);
            if (shieldEffect) shieldEffect.value = Math.max(0, shieldEffect.value - blocked);
          }
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
            clearCombatEffects();
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
      clearCombatEffects();
    }

    return { start, stop };
  }

  window.createMisionesRangoCombat = createCombatEngine;
})();
