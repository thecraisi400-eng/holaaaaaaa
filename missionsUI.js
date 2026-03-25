(() => {
  const missionsData = {
    D: [
      { name: 'Eliminar lobos hambrientos', xp: 2, gold: 4, hp: 138, atk: 25, def: 17, lvl: 1 },
      { name: 'Recuperar suministros robados por goblins', xp: 4, gold: 8, hp: 174, atk: 43, def: 28, lvl: 3 },
      { name: 'Proteger la aldea de jabalíes', xp: 6, gold: 12, hp: 210, atk: 61, def: 39, lvl: 5 },
      { name: 'Investigar ruinas infestadas de ratas gigantes', xp: 8, gold: 16, hp: 246, atk: 78, def: 50, lvl: 7 },
      { name: 'Escoltar a un mercader (bandido)', xp: 9, gold: 18, hp: 264, atk: 87, def: 55, lvl: 9 },
      { name: 'Cazar una bestia nocturna', xp: 10, gold: 20, hp: 282, atk: 96, def: 61, lvl: 12 },
    ],
    C: [
      { name: 'Limpiar una mina de murciélagos vampíricos', xp: 12, gold: 24, hp: 318, atk: 113, def: 72, lvl: 14 },
      { name: 'Derrotar a un grupo de orcos merodeadores', xp: 14, gold: 28, hp: 354, atk: 131, def: 83, lvl: 16 },
      { name: 'Rescatar a un rehén de los bandidos', xp: 16, gold: 32, hp: 390, atk: 149, def: 94, lvl: 18 },
      { name: 'Eliminar una amenaza de lobos de las nieves', xp: 18, gold: 36, hp: 426, atk: 166, def: 105, lvl: 20 },
      { name: 'Recuperar un artefacto custodiado por esqueletos', xp: 19, gold: 38, hp: 444, atk: 175, def: 110, lvl: 22 },
      { name: 'Acabar con un troll de las colinas', xp: 20, gold: 40, hp: 462, atk: 184, def: 116, lvl: 24 },
    ],
    B: [
      { name: 'Exterminar una colonia de arácnidos gigantes', xp: 22, gold: 44, hp: 498, atk: 201, def: 127, lvl: 28 },
      { name: 'Detener a un invoca demonios menores', xp: 24, gold: 48, hp: 534, atk: 219, def: 138, lvl: 32 },
      { name: 'Proteger una Ciudad de ataque de grifos salvajes', xp: 26, gold: 52, hp: 570, atk: 237, def: 149, lvl: 36 },
      { name: 'Investigar desapariciones en un bosque encantado', xp: 28, gold: 56, hp: 606, atk: 254, def: 160, lvl: 40 },
      { name: 'Derrotar a un caballero oscuro errante', xp: 29, gold: 58, hp: 624, atk: 263, def: 165, lvl: 45 },
      { name: 'Asaltar una fortaleza de ogros', xp: 30, gold: 60, hp: 642, atk: 272, def: 171, lvl: 50 },
    ],
    A: [
      { name: 'Eliminar a un dragón joven', xp: 32, gold: 64, hp: 678, atk: 289, def: 182, lvl: 55 },
      { name: 'Infiltrarse en una base de asesinos', xp: 34, gold: 68, hp: 714, atk: 307, def: 193, lvl: 50 },
      { name: 'Proteger una ciudad de un ataque', xp: 36, gold: 72, hp: 750, atk: 325, def: 204, lvl: 55 },
      { name: 'Recuperar un tesoro de una tumba maldita', xp: 38, gold: 76, hp: 786, atk: 342, def: 215, lvl: 60 },
      { name: 'Derrotar a un guerrero legendario', xp: 39, gold: 78, hp: 804, atk: 351, def: 220, lvl: 65 },
      { name: 'Acabar con un demonio de las sombras', xp: 40, gold: 80, hp: 822, atk: 360, def: 226, lvl: 70 },
    ],
    S: [
      { name: 'Enfrentar a un dragón adulto', xp: 50, gold: 100, hp: 1002, atk: 448, def: 281, lvl: 75 },
      { name: 'Derrotar a un señor demonio menor', xp: 60, gold: 120, hp: 1182, atk: 536, def: 336, lvl: 80 },
      { name: 'Salvar el reino de un lich', xp: 70, gold: 140, hp: 1362, atk: 624, def: 391, lvl: 85 },
      { name: 'Enfrentar a un titán antiguo', xp: 80, gold: 160, hp: 1542, atk: 712, def: 446, lvl: 90 },
      { name: 'Combatir a un dios olvidado', xp: 90, gold: 180, hp: 1722, atk: 800, def: 501, lvl: 95 },
      { name: 'Derrotar al dragón anciano', xp: 100, gold: 200, hp: 1902, atk: 808, def: 556, lvl: 100 },
    ],
  };

  const state = {
    mounted: false,
    currentScreen: 'main',
    currentMissionList: [],
    enemyIndex: 0,
    battleInterval: null,
    battleActive: false,
    currentEnemy: null,
    playerStats: { hp: 200, maxHp: 200, mp: 100, maxMp: 100, atk: 20, def: 15, lvl: 1 },
    refs: {},
  };

  function enemyEmoji(name) {
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

  function stopBattleAndBackToMain() {
    if (state.battleInterval) {
      clearInterval(state.battleInterval);
      state.battleInterval = null;
    }
    state.battleActive = false;
    state.refs.battle.classList.add('hidden');
    state.refs.main.classList.remove('hidden');
    state.refs.ranks.classList.add('hidden');
    state.refs.missions.classList.add('hidden');
    state.currentScreen = 'main';
  }

  function updateBars() {
    const playerHpPct = Math.max(0, (state.playerStats.hp / state.playerStats.maxHp) * 100);
    const playerMpPct = Math.max(0, (state.playerStats.mp / state.playerStats.maxMp) * 100);

    state.refs.characterHp.style.width = `${playerHpPct}%`;
    state.refs.characterMp.style.width = `${playerMpPct}%`;
    state.refs.enemyMp.style.width = '100%';

    if (state.currentEnemy) {
      const enemyHpPct = Math.max(0, (state.currentEnemy.hp / state.currentEnemy.maxHp) * 100);
      state.refs.enemyHp.style.width = `${enemyHpPct}%`;
    }
  }

  function addLog(message) {
    const entry = document.createElement('div');
    entry.className = 'missions-log-entry';
    entry.textContent = message;
    state.refs.log.insertBefore(entry, state.refs.log.firstChild);
    if (state.refs.log.children.length > 15) {
      state.refs.log.removeChild(state.refs.log.lastChild);
    }
  }

  function loadEnemy(index) {
    const mission = state.currentMissionList[index];
    state.currentEnemy = {
      name: mission.name,
      hp: mission.hp,
      maxHp: mission.hp,
      atk: mission.atk,
      def: mission.def,
      xp: mission.xp,
      gold: mission.gold,
    };
    state.refs.enemyEmoji.textContent = enemyEmoji(mission.name);
    updateBars();
  }

  function startBattle(rank, missionIndex) {
    if (state.battleInterval) {
      clearInterval(state.battleInterval);
      state.battleInterval = null;
    }

    state.currentMissionList = missionsData[rank];
    state.enemyIndex = missionIndex;
    loadEnemy(state.enemyIndex);
    state.playerStats.hp = state.playerStats.maxHp;
    state.playerStats.mp = state.playerStats.maxMp;

    state.refs.missions.classList.add('hidden');
    state.refs.ranks.classList.add('hidden');
    state.refs.main.classList.add('hidden');
    state.refs.battle.classList.remove('hidden');
    state.currentScreen = 'battle';
    state.refs.log.innerHTML = '';

    state.battleActive = true;
    state.battleInterval = setInterval(() => {
      if (!state.battleActive) return;

      if (state.playerStats.hp > 0 && state.currentEnemy.hp > 0) {
        const dmg = Math.max(1, Math.floor(state.playerStats.atk - state.currentEnemy.def / 3 + Math.random() * 8));
        state.currentEnemy.hp = Math.max(0, state.currentEnemy.hp - dmg);
        addLog(`🥷 Atacas y causas ${dmg} daño.`);
        updateBars();

        if (state.currentEnemy.hp <= 0) {
          addLog(`💀 ¡Enemigo derrotado! +${state.currentMissionList[state.enemyIndex].xp} XP y +${state.currentMissionList[state.enemyIndex].gold} Oro.`);
          state.enemyIndex = (state.enemyIndex + 1) % state.currentMissionList.length;
          loadEnemy(state.enemyIndex);
          addLog(`⚔️ Nuevo enemigo: ${state.currentEnemy.name}`);
        }
      }

      if (state.playerStats.hp > 0 && state.currentEnemy.hp > 0) {
        const dmg = Math.max(1, Math.floor(state.currentEnemy.atk - state.playerStats.def / 3 + Math.random() * 6));
        state.playerStats.hp = Math.max(0, state.playerStats.hp - dmg);
        addLog(`👹 ${state.currentEnemy.name} ataca y causa ${dmg} daño.`);
        updateBars();

        if (state.playerStats.hp <= 0) {
          addLog('😵 Has sido derrotado...');
          state.battleActive = false;
          clearInterval(state.battleInterval);
          state.battleInterval = null;
        }
      }
    }, 700);
  }

  function showMissions(rank) {
    state.refs.missionsList.innerHTML = '';
    missionsData[rank].forEach((mission, index) => {
      const locked = state.playerStats.lvl < mission.lvl;
      const missionDiv = document.createElement('div');
      missionDiv.className = `missions-item missions-rank-${rank.toLowerCase()} ${locked ? 'locked' : ''}`;
      missionDiv.innerHTML = `
        <div class="missions-item-header">${mission.name}</div>
        <div class="missions-item-details">
          <div class="missions-item-col">
            <span>⚡ XP: ${mission.xp}</span>
            <span>💰 Oro: ${mission.gold}</span>
          </div>
          <div class="missions-item-col">
            <span>❤️ HP: ${mission.hp}</span>
            <span>⚔️ ATK: ${mission.atk}</span>
            <span>🛡️ DEF: ${mission.def}</span>
          </div>
        </div>
        ${locked ? `<div class="missions-lock">🔒 Nivel mínimo: ${mission.lvl}</div>` : ''}
      `;

      if (locked) {
        missionDiv.style.pointerEvents = 'none';
      } else {
        missionDiv.addEventListener('click', () => startBattle(rank, index));
      }

      state.refs.missionsList.appendChild(missionDiv);
    });

    state.refs.ranks.classList.add('hidden');
    state.refs.missions.classList.remove('hidden');
    state.currentScreen = 'missions';
  }

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div id="missions-main-screen" class="missions-screen">
        <div id="missions-main-btn" class="missions-menu-button">⚔️ MISIONES RANGO ⚔️</div>
      </div>
      <div id="missions-rank-screen" class="missions-screen hidden">
        <div data-rank="D" class="missions-rank-button rank-d">📜 MISION RANGO D</div>
        <div data-rank="C" class="missions-rank-button rank-c">🔥 MISION RANGO C</div>
        <div data-rank="B" class="missions-rank-button rank-b">🌪️ MISION RANGO B</div>
        <div data-rank="A" class="missions-rank-button rank-a">💀 MISION RANGO A</div>
        <div data-rank="S" class="missions-rank-button rank-s">👑 MISION RANGO S</div>
        <div id="missions-back-main" class="missions-back-button">⬅️ Volver</div>
      </div>
      <div id="missions-list-screen" class="missions-screen hidden">
        <div id="missions-list-wrap"></div>
        <div id="missions-back-ranks" class="missions-back-button">⬅️ Volver a Rangos</div>
      </div>
      <div id="missions-battle-screen" class="missions-screen hidden">
        <div id="missions-battle-abandon" class="missions-back-button">⬅️ Abandonar misión</div>
        <div class="missions-battle-arena">
          <div class="missions-character-card" id="character-card">
            <div class="missions-card-emoji">🥷</div>
            <div class="missions-bar"><div class="missions-hp-fill" id="missions-character-hp"></div></div>
            <div class="missions-bar"><div class="missions-mp-fill" id="missions-character-mp"></div></div>
            <div class="missions-bar-labels"><span>❤️</span><span>💙</span></div>
          </div>
          <div class="missions-enemy-card" id="enemy-card">
            <div class="missions-card-emoji" id="missions-enemy-emoji">👹</div>
            <div class="missions-bar"><div class="missions-hp-fill" id="missions-enemy-hp"></div></div>
            <div class="missions-bar"><div class="missions-mp-fill" id="missions-enemy-mp"></div></div>
            <div class="missions-bar-labels"><span>❤️</span><span>💙</span></div>
          </div>
        </div>
        <div class="missions-combat-log" id="missions-combat-log"></div>
        <div id="missions-stop-btn" class="missions-stop-button">⏹️ DETENER</div>
      </div>
    `;

    state.refs = {
      panel: container,
      main: container.querySelector('#missions-main-screen'),
      ranks: container.querySelector('#missions-rank-screen'),
      missions: container.querySelector('#missions-list-screen'),
      battle: container.querySelector('#missions-battle-screen'),
      missionsList: container.querySelector('#missions-list-wrap'),
      log: container.querySelector('#missions-combat-log'),
      characterHp: container.querySelector('#missions-character-hp'),
      characterMp: container.querySelector('#missions-character-mp'),
      enemyHp: container.querySelector('#missions-enemy-hp'),
      enemyMp: container.querySelector('#missions-enemy-mp'),
      enemyEmoji: container.querySelector('#missions-enemy-emoji'),
    };

    container.querySelector('#missions-main-btn').addEventListener('click', () => {
      state.refs.main.classList.add('hidden');
      state.refs.ranks.classList.remove('hidden');
      state.currentScreen = 'ranks';
    });

    container.querySelectorAll('.missions-rank-button').forEach((btn) => {
      btn.addEventListener('click', () => showMissions(btn.dataset.rank));
    });

    container.querySelector('#missions-back-main').addEventListener('click', () => {
      state.refs.ranks.classList.add('hidden');
      state.refs.main.classList.remove('hidden');
      state.currentScreen = 'main';
    });

    container.querySelector('#missions-back-ranks').addEventListener('click', () => {
      stopBattleAndBackToMain();
      state.refs.main.classList.add('hidden');
      state.refs.ranks.classList.remove('hidden');
      state.currentScreen = 'ranks';
    });

    container.querySelector('#missions-battle-abandon').addEventListener('click', stopBattleAndBackToMain);
    container.querySelector('#missions-stop-btn').addEventListener('click', stopBattleAndBackToMain);

    updateBars();
    state.mounted = true;
  }

  function show(playerState) {
    if (!state.mounted) render('missionsPanel');
    if (playerState) {
      state.playerStats.maxHp = Number(playerState.hpMax) || state.playerStats.maxHp;
      state.playerStats.hp = Number(playerState.hp) || state.playerStats.maxHp;
      state.playerStats.maxMp = Number(playerState.mpMax) || state.playerStats.maxMp;
      state.playerStats.mp = Number(playerState.mp) || state.playerStats.maxMp;
      state.playerStats.atk = Number(playerState.atk) || state.playerStats.atk;
      state.playerStats.def = Number(playerState.def) || state.playerStats.def;
      state.playerStats.lvl = Number(playerState.level) || state.playerStats.lvl;
      updateBars();
    }
    state.refs.panel.classList.add('active');
    state.refs.main.classList.remove('hidden');
    state.refs.ranks.classList.add('hidden');
    state.refs.missions.classList.add('hidden');
    state.refs.battle.classList.add('hidden');
    state.currentScreen = 'main';
  }

  function hide() {
    if (!state.mounted) return;
    stopBattleAndBackToMain();
    state.refs.panel.classList.remove('active');
  }

  window.missionsUI = {
    hide,
    show,
  };
})();
