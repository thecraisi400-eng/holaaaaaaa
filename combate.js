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
    let playerStatus = null;
    let turnCounter = 0;
    let combatJutsus = [];
    let enemyIndex = 0;
    let currentMissionList = [];
    let battleLoopCount = 0;
    const ENEMY_DEFEAT_VISUAL_DELAY_MS = 320;
    const JUTSU_MP_COST_MULTIPLIER = 0.5;

    function loadEnemy(index) {
      const mission = currentMissionList[index];
      currentEnemy = { name: mission.name, hp: mission.hp, maxHp: mission.hp, atk: mission.atk, def: mission.def, xp: mission.xp, gold: mission.gold, mp: 100, maxMp: 100 };
      enemyStatus = {
        stunTurns: 0,
        freezeTurns: 0,
        skipNextTurn: false,
        atkDebuffPct: 0,
        atkDebuffTurns: 0,
        defDebuffPct: 0,
        defDebuffTurns: 0,
        speedDebuffPct: 0,
        speedDebuffTurns: 0,
        evadeDebuffPct: 0,
        evadeDebuffTurns: 0,
        burnPct: 0,
        burnTurns: 0,
        poisonPct: 0,
        poisonTurns: 0,
        cancelTurns: 0,
        confuseChancePct: 0,
        confuseTurns: 0
      };
      playerStatus = {
        defBuffPct: 0,
        defBuffTurns: 0,
        atkBuffPct: 0,
        atkBuffTurns: 0,
        speedBuffPct: 0,
        speedBuffTurns: 0,
        hpBuffPct: 0,
        hpBuffTurns: 0,
        evadeBuffPct: 0,
        evadeBuffTurns: 0,
        failEnemyChancePct: 0,
        failEnemyTurns: 0,
        critChancePct: 0,
        critChanceTurns: 0,
        critDamagePct: 0,
        critDamageTurns: 0,
        counterChancePct: 0,
        counterTurns: 0,
        defensePenPct: 0,
        defensePenTurns: 0,
        shieldHp: 0,
        chakraCostReductionPct: 0,
        chakraCostTurns: 0,
        permanentAtkPct: 0
      };
      onEnemy(currentEnemy, resolveEnemyEmoji(mission.name));
      onBars(getPlayerStats(), currentEnemy);
    }

    function durationTurns(durationMs) {
      if (!durationMs || durationMs <= 0) return 1;
      return Math.max(1, Math.round(durationMs / 700));
    }

    function decayStatusTurns() {
      const turnFields = [
        ['atkDebuffTurns', 'atkDebuffPct'],
        ['defDebuffTurns', 'defDebuffPct'],
        ['speedDebuffTurns', 'speedDebuffPct'],
        ['evadeDebuffTurns', 'evadeDebuffPct'],
        ['burnTurns', 'burnPct'],
        ['poisonTurns', 'poisonPct'],
        ['cancelTurns', null],
        ['confuseTurns', 'confuseChancePct']
      ];
      turnFields.forEach(([turnKey, valueKey]) => {
        if ((enemyStatus[turnKey] || 0) > 0) {
          enemyStatus[turnKey] -= 1;
          if (enemyStatus[turnKey] <= 0 && valueKey) enemyStatus[valueKey] = 0;
        }
      });

      const pTurnFields = [
        ['defBuffTurns', 'defBuffPct'],
        ['atkBuffTurns', 'atkBuffPct'],
        ['speedBuffTurns', 'speedBuffPct'],
        ['hpBuffTurns', 'hpBuffPct'],
        ['evadeBuffTurns', 'evadeBuffPct'],
        ['failEnemyTurns', 'failEnemyChancePct'],
        ['critChanceTurns', 'critChancePct'],
        ['critDamageTurns', 'critDamagePct'],
        ['counterTurns', 'counterChancePct'],
        ['defensePenTurns', 'defensePenPct'],
        ['chakraCostTurns', 'chakraCostReductionPct']
      ];
      pTurnFields.forEach(([turnKey, valueKey]) => {
        if ((playerStatus[turnKey] || 0) > 0) {
          playerStatus[turnKey] -= 1;
          if (playerStatus[turnKey] <= 0 && valueKey) playerStatus[valueKey] = 0;
        }
      });
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
        let extraHit = 0;
        decayStatusTurns();

        if (enemyStatus.burnTurns > 0 && enemyStatus.burnPct > 0) {
          const burn = Math.max(1, Math.floor(currentEnemy.maxHp * (enemyStatus.burnPct / 100)));
          currentEnemy.hp = Math.max(0, currentEnemy.hp - burn);
          onLog(`🔥 Quemadura activa: ${currentEnemy.name} pierde ${burn} HP.`);
        }
        if (enemyStatus.poisonTurns > 0 && enemyStatus.poisonPct > 0) {
          const poison = Math.max(1, Math.floor(currentEnemy.maxHp * (enemyStatus.poisonPct / 100)));
          currentEnemy.hp = Math.max(0, currentEnemy.hp - poison);
          onLog(`☠️ Veneno activo: ${currentEnemy.name} pierde ${poison} HP.`);
        }

        combatJutsus.forEach((jutsu) => {
          const values = jutsu.values;
          const baseCost = Math.max(0, Number(values[4]) || 0);
          const chakraDiscount = Math.max(0, Number(playerStatus.chakraCostReductionPct) || 0);
          const discountedCost = Math.max(0, baseCost * (1 - chakraDiscount / 100));
          const mpCost = Math.max(0, Math.floor(discountedCost * JUTSU_MP_COST_MULTIPLIER));
          if (playerStats.mp < mpCost) return;
          if (Math.random() * 100 > (Number(values[3]) || 0)) return;

          playerStats.mp = Math.max(0, playerStats.mp - mpCost);
          const subSkill = Math.floor(Math.random() * 3);
          const turns = durationTurns(jutsu.durationMs);

          if (jutsu.id === 0) {
            if (subSkill === 0) {
              enemyStatus.burnPct = Math.max(enemyStatus.burnPct, Number(values[0]) || 0);
              enemyStatus.burnTurns = Math.max(enemyStatus.burnTurns, turns);
              onLog(`🌀 ${jutsu.name} [Quem]: aplica quemadura (${values[0]}%) por ${turns} turnos.`);
            } else if (subSkill === 1) {
              playerStatus.defBuffPct = Math.max(playerStatus.defBuffPct, Number(values[1]) || 0);
              playerStatus.defBuffTurns = Math.max(playerStatus.defBuffTurns, turns);
              onLog(`🌀 ${jutsu.name} [Def%]: +${values[1]}% DEF durante ${turns} turnos.`);
            } else {
              playerStatus.failEnemyChancePct = Math.max(playerStatus.failEnemyChancePct, Number(values[2]) || 0);
              playerStatus.failEnemyTurns = Math.max(playerStatus.failEnemyTurns, turns);
              onLog(`🌀 ${jutsu.name} [Fallo%]: ${values[2]}% de fallo enemigo por ${turns} turnos.`);
            }
          } else if (jutsu.id === 1) {
            if (subSkill === 0) {
              enemyStatus.speedDebuffPct = Math.max(enemyStatus.speedDebuffPct, Number(values[0]) || 0);
              enemyStatus.speedDebuffTurns = Math.max(enemyStatus.speedDebuffTurns, turns);
              enemyStatus.freezeTurns = Math.max(enemyStatus.freezeTurns, 1);
              onLog(`🌀 ${jutsu.name} [-Veloc]: ralentiza ${values[0]}% y congela 1 turno.`);
            } else if (subSkill === 1) {
              playerStatus.hpBuffPct = Math.max(playerStatus.hpBuffPct, Number(values[1]) || 0);
              playerStatus.hpBuffTurns = Math.max(playerStatus.hpBuffTurns, turns);
              onLog(`🌀 ${jutsu.name} [HP%]: +${values[1]}% vida máxima temporal.`);
            } else {
              playerStatus.defensePenPct = Math.max(playerStatus.defensePenPct, Number(values[2]) || 0);
              playerStatus.defensePenTurns = Math.max(playerStatus.defensePenTurns, turns);
              onLog(`🌀 ${jutsu.name} [Penetr]: ignora ${values[2]}% de DEF enemiga.`);
            }
          } else if (jutsu.id === 2) {
            if (subSkill === 0) {
              enemyStatus.poisonPct = Math.max(enemyStatus.poisonPct, Number(values[0]) || 0);
              enemyStatus.poisonTurns = Math.max(enemyStatus.poisonTurns, turns);
              onLog(`🌀 ${jutsu.name} [Veneno]: daño continuo ${values[0]}% por ${turns} turnos.`);
            } else if (subSkill === 1) {
              playerStatus.atkBuffPct = Math.max(playerStatus.atkBuffPct, Number(values[1]) || 0);
              playerStatus.defBuffPct = Math.max(playerStatus.defBuffPct, Number(values[1]) || 0);
              playerStatus.speedBuffPct = Math.max(playerStatus.speedBuffPct, Number(values[1]) || 0);
              playerStatus.atkBuffTurns = Math.max(playerStatus.atkBuffTurns, turns);
              playerStatus.defBuffTurns = Math.max(playerStatus.defBuffTurns, turns);
              playerStatus.speedBuffTurns = Math.max(playerStatus.speedBuffTurns, turns);
              onLog(`🌀 ${jutsu.name} [Stats%]: ATK/DEF/VEL +${values[1]}% (${turns} turnos).`);
            } else {
              enemyStatus.defDebuffPct = Math.max(enemyStatus.defDebuffPct, Math.abs(Number(values[2]) || 0));
              enemyStatus.defDebuffTurns = Math.max(enemyStatus.defDebuffTurns, turns);
              onLog(`🌀 ${jutsu.name} [-DefEnem]: reduce DEF enemiga ${Math.abs(values[2])}%.`);
            }
          } else if (jutsu.id === 3) {
            if (subSkill === 0) {
              enemyStatus.evadeDebuffPct = Math.max(enemyStatus.evadeDebuffPct, Math.abs(Number(values[0]) || 0));
              enemyStatus.evadeDebuffTurns = Math.max(enemyStatus.evadeDebuffTurns, turns);
              onLog(`🌀 ${jutsu.name} [-Evas]: evasión enemiga ${Math.abs(values[0])}% menos.`);
            } else if (subSkill === 1) {
              playerStatus.counterChancePct = Math.max(playerStatus.counterChancePct, Number(values[1]) || 0);
              playerStatus.counterTurns = Math.max(playerStatus.counterTurns, turns);
              onLog(`🌀 ${jutsu.name} [Contra%]: ${values[1]}% contraataque por ${turns} turnos.`);
            } else {
              enemyStatus.atkDebuffPct = Math.max(enemyStatus.atkDebuffPct, Math.abs(Number(values[2]) || 0));
              enemyStatus.atkDebuffTurns = Math.max(enemyStatus.atkDebuffTurns, 3);
              onLog(`🌀 ${jutsu.name} [-AtkEnem]: ataque enemigo -${Math.abs(values[2])}% por 3 turnos.`);
            }
          } else if (jutsu.id === 4) {
            if (subSkill === 0) {
              enemyStatus.cancelTurns = Math.max(enemyStatus.cancelTurns, 3);
              onLog(`🌀 ${jutsu.name} [Cancel]: enemigo no activa jutsus por 3 turnos.`);
            } else if (subSkill === 1) {
              playerStatus.speedBuffPct = Math.max(playerStatus.speedBuffPct, Number(values[1]) || 0);
              playerStatus.evadeBuffPct = Math.max(playerStatus.evadeBuffPct, Number(values[1]) || 0);
              playerStatus.speedBuffTurns = Math.max(playerStatus.speedBuffTurns, turns);
              playerStatus.evadeBuffTurns = Math.max(playerStatus.evadeBuffTurns, turns);
              onLog(`🌀 ${jutsu.name} [Vel&Ev%]: +${values[1]}% velocidad/evasión.`);
            } else {
              enemyStatus.confuseChancePct = Math.max(enemyStatus.confuseChancePct, Number(values[2]) || 0);
              enemyStatus.confuseTurns = Math.max(enemyStatus.confuseTurns, turns);
              onLog(`🌀 ${jutsu.name} [Confus]: ${values[2]}% de autoataque enemigo.`);
            }
          } else if (jutsu.id === 5) {
            if (subSkill === 0) {
              const mpStolen = Math.max(0, Number(values[0]) || 0);
              currentEnemy.mp = Math.max(0, currentEnemy.mp - mpStolen);
              onLog(`🌀 ${jutsu.name} [RoboMP]: drena ${mpStolen} MP del enemigo (sin regeneración de MP propia en combate).`);
            } else if (subSkill === 1) {
              const hpRegen = Math.max(1, Math.floor(playerStats.maxHp * ((Number(values[1]) || 0) / 100)));
              playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + hpRegen);
              onLog(`🌀 ${jutsu.name} [Regen%]: recuperas ${hpRegen} HP.`);
            } else {
              playerStatus.evadeBuffPct = Math.max(playerStatus.evadeBuffPct, Math.abs(Number(values[2]) || 0));
              playerStatus.chakraCostReductionPct = Math.max(playerStatus.chakraCostReductionPct, Math.abs(Number(values[2]) || 0));
              playerStatus.evadeBuffTurns = Math.max(playerStatus.evadeBuffTurns, 3);
              playerStatus.chakraCostTurns = Math.max(playerStatus.chakraCostTurns, 3);
              onLog(`🌀 ${jutsu.name} [-Coste%]: coste MP y evasión mejoran ${Math.abs(values[2])}% por 3 turnos.`);
            }
          } else if (jutsu.id === 6) {
            if (subSkill === 0) {
              enemyStatus.stunTurns = Math.max(enemyStatus.stunTurns, Number(values[0]) || 1);
              onLog(`🌀 ${jutsu.name} [Turnos]: aturde ${values[0]} turno(s).`);
            } else if (subSkill === 1) {
              playerStatus.critChancePct = Math.max(playerStatus.critChancePct, Number(values[1]) || 0);
              playerStatus.critChanceTurns = Math.max(playerStatus.critChanceTurns, turns);
              onLog(`🌀 ${jutsu.name} [Crit%]: +${values[1]}% crítico por ${turns} turnos.`);
            } else {
              playerStatus.shieldHp += Math.max(0, Number(values[2]) || 0);
              onLog(`🌀 ${jutsu.name} [EscudoHP]: escudo +${values[2]} HP.`);
            }
          } else if (jutsu.id === 7) {
            if (subSkill === 0) {
              extraHit = Math.max(extraHit, Number(values[0]) || 0);
              playerStatus.defBuffPct = Math.min(playerStatus.defBuffPct, -10);
              playerStatus.defBuffTurns = Math.max(playerStatus.defBuffTurns, 1);
              onLog(`🌀 ${jutsu.name} [DañoBase]: golpe ${values[0]}% y defensa temporal reducida.`);
            } else if (subSkill === 1) {
              playerStatus.permanentAtkPct += Number(values[1]) || 0;
              onLog(`🌀 ${jutsu.name} [AtkPerm%]: ATK permanente +${values[1]}% en combate.`);
            } else {
              playerStatus.critDamagePct = Math.max(playerStatus.critDamagePct, Number(values[2]) || 0);
              playerStatus.critDamageTurns = Math.max(playerStatus.critDamageTurns, 1);
              const hpCost = Math.max(1, Math.floor(playerStats.maxHp * 0.03));
              playerStats.hp = Math.max(1, playerStats.hp - hpCost);
              onLog(`🌀 ${jutsu.name} [DañoCrit%]: +${values[2]}% crítico, -${hpCost} HP.`);
            }
          }
        });

        const atkMult = 1 + ((Number(playerStatus.atkBuffPct) || 0) / 100) + ((Number(playerStatus.permanentAtkPct) || 0) / 100);
        const defMult = Math.max(0.2, 1 + ((Number(playerStatus.defBuffPct) || 0) / 100));
        const evadeChance = Math.max(0, (Number(playerStatus.evadeBuffPct) || 0) + (Number(playerStatus.failEnemyChancePct) || 0));
        const critChance = Math.max(0, Number(playerStatus.critChancePct) || 0);
        const critDmg = Math.max(0, Number(playerStatus.critDamagePct) || 0);
        const defensePen = Math.max(0, Number(playerStatus.defensePenPct) || 0);
        const counterChance = Math.max(0, Number(playerStatus.counterChancePct) || 0);

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
          if (enemyStatus.confuseTurns > 0 && Math.random() * 100 < enemyStatus.confuseChancePct) {
            const selfDmg = Math.max(1, Math.floor(currentEnemy.atk * 0.5));
            currentEnemy.hp = Math.max(0, currentEnemy.hp - selfDmg);
            onLog(`🌀 Confusión: ${currentEnemy.name} se golpea y recibe ${selfDmg} daño.`);
            onBars(playerStats, currentEnemy);
            return;
          }
          if (Math.random() * 100 < evadeChance) {
            onLog(`💨 ${currentEnemy.name} falló su ataque.`);
            onBars(playerStats, currentEnemy);
            return;
          }
          const enemyAtk = currentEnemy.atk * (1 - (enemyStatus.atkDebuffPct / 100));
          let dmg = Math.max(1, Math.floor(enemyAtk - (playerStats.def * defMult) / 3 + Math.random() * 6));
          if (playerStatus.shieldHp > 0) {
            const blocked = Math.min(playerStatus.shieldHp, dmg);
            playerStatus.shieldHp -= blocked;
            dmg -= blocked;
            onLog(`🛡️ Escudo absorbe ${blocked} daño.`);
          }
          dmg = Math.max(0, dmg);
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
