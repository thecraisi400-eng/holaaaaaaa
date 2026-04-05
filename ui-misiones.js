(() => {
  const RANKS = ['D', 'C', 'B', 'A', 'S'];

  function createMissionsUI(options) {
    const {
      container,
      getPlayerStats,
      onReturn,
      onRewardGain,
      onCombatStateChange,
      onPlayerAttack,
      onSkillPointEarned
    } = options;

    const listeners = [];
    const missionScreenListeners = [];
    const on = (el, evt, fn, opts) => {
      el.addEventListener(evt, fn, opts);
      listeners.push(() => el.removeEventListener(evt, fn, opts));
    };
    const onMissionScreen = (el, evt, fn, opts) => {
      el.addEventListener(evt, fn, opts);
      missionScreenListeners.push(() => el.removeEventListener(evt, fn, opts));
    };
    const clearMissionScreenListeners = () => {
      missionScreenListeners.forEach((off) => off());
      missionScreenListeners.length = 0;
    };

    let currentScreen = 'missions-menu';
    let currentMissionList = [];
    let activeBattleMode = 'rank';

    const root = document.createElement('div');
    root.className = 'misiones-rango';
    root.innerHTML = `
      <div id="missions-menu-screen" class="screen">
        <button id="open-rank-list" class="menu-button">⚔️ MISIONES RANGO ⚔️</button>
        <button id="open-libro-bingo" class="menu-button">📘 LIBRO BINGO</button>
      </div>
      <div id="rank-list-screen" class="screen hidden">
        <button id="rank-D" class="rank-button rank-d">📜 MISIONES RANGO D</button>
        <button id="rank-C" class="rank-button rank-c">🔥 MISIONES RANGO C</button>
        <button id="rank-B" class="rank-button rank-b">🌪️ MISIONES RANGO B</button>
        <button id="rank-A" class="rank-button rank-a">💀 MISIONES RANGO A</button>
        <button id="rank-S" class="rank-button rank-s">👑 MISIONES RANGO S</button>
        <button id="back-to-main-from-ranks" class="back-button">⬅️ Volver</button>
      </div>
      <div id="missions-screen" class="screen hidden">
        <button id="back-to-ranks-from-missions" class="back-button">⬅️ Volver a Rangos</button>
      </div>
      <div id="bingo-rank-screen" class="screen hidden">
        <div id="bingo-timer" class="menu-button menu-button-alt bingo-timer">⏳ 05:00:00</div>
        <button id="bingo-rank-option-a" class="rank-button rank-d">📘 Rango</button>
        <button id="bingo-rank-option-b" class="rank-button rank-c">📘 Rango</button>
      </div>
      <div id="bingo-enemies-screen" class="screen hidden">
        <div id="bingo-rank-title" class="section-label">📘 Libro Bingo</div>
        <div id="bingo-enemy-list" class="bingo-enemy-list"></div>
      </div>
      <div id="battle-screen" class="screen hidden">
        <button id="back-from-battle-to-main" class="back-button">⬅️ Abandonar misión</button>
        <div class="battle-wrapper" id="game-container">
          <div id="battle-scene">
            <div class="bg-layer bg-layer-1"></div>
            <div class="bg-layer bg-layer-2"></div>
            <div class="bg-layer bg-layer-3"></div>
          </div>
          <div id="ground"></div>
          <div id="hud">
            <div class="hud-unit hero">
              <div class="avatar hero-avatar"><div class="avatar-inner">🍥</div></div>
              <div class="hp-info">
                <div class="unit-name">Naruto Uzumaki</div>
                <div class="hp-bar-container"><div class="hp-bar hero-hp" id="hero-hp-bar" style="width:100%"></div></div>
                <div class="hp-text" id="hero-hp-text">1000 / 1000</div>
                <div class="chakra-bar-container"><div class="chakra-bar-fill" id="chakra-bar" style="width:100%"></div></div>
              </div>
            </div>
            <div class="hud-unit enemy">
              <div class="avatar enemy-avatar"><div class="avatar-inner" id="enemy-emoji">👹</div></div>
              <div class="hp-info">
                <div class="unit-name" id="enemy-name">Enemigo</div>
                <div class="hp-bar-container"><div class="hp-bar enemy-hp" id="enemy-hp-bar" style="width:100%"></div></div>
                <div class="hp-text" id="enemy-hp-text">800 / 800</div>
              </div>
            </div>
          </div>
          <div id="turn-indicator">⚔ Combate Iniciado</div>
          <div id="hero" class="character"><div class="fighter">🍥</div></div>
          <div id="enemy" class="character"><div class="fighter" id="enemy-fighter">👹</div></div>
          <div id="combat-log">
            <div class="log-line" id="log-1">⚔ ¡El combate ha comenzado!</div>
            <div class="log-line" id="log-2"></div>
          </div>
        </div>
        <button id="stop-battle-btn" class="stop-button">⏹️ DETENER</button>
      </div>
    `;

    container.replaceChildren(root);

    const screenMap = {
      'missions-menu': root.querySelector('#missions-menu-screen'),
      ranks: root.querySelector('#rank-list-screen'),
      missions: root.querySelector('#missions-screen'),
      'bingo-ranks': root.querySelector('#bingo-rank-screen'),
      'bingo-enemies': root.querySelector('#bingo-enemies-screen'),
      battle: root.querySelector('#battle-screen')
    };

    function showScreen(screenKey) {
      if (screenKey !== 'missions') {
        clearMissionScreenListeners();
      }
      Object.values(screenMap).forEach((node) => node.classList.add('hidden'));
      const target = screenMap[screenKey] || screenMap['missions-menu'];
      target.classList.remove('hidden');
      currentScreen = screenKey;
    }

    const combat = window.createMisionesRangoCombat({
      getPlayerStats,
      onEnemy: (_, emoji) => {
        root.querySelector('#enemy-emoji').textContent = emoji;
        root.querySelector('#enemy-fighter').textContent = emoji;
        root.querySelector('#enemy-name').textContent = _.name;
      },
      onBars: (player, enemy) => {
        root.querySelector('#hero-hp-bar').style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;
        root.querySelector('#chakra-bar').style.width = `${Math.max(0, (player.mp / player.maxMp) * 100)}%`;
        root.querySelector('#hero-hp-text').textContent = `${Math.max(0, Math.floor(player.hp))} / ${Math.max(1, Math.floor(player.maxHp))}`;
        if (enemy) {
          root.querySelector('#enemy-hp-bar').style.width = `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
          root.querySelector('#enemy-hp-text').textContent = `${Math.max(0, Math.floor(enemy.hp))} / ${Math.max(1, Math.floor(enemy.maxHp))}`;
        }
      },
      onLog: (message) => {
        const line1 = root.querySelector('#log-1');
        const line2 = root.querySelector('#log-2');
        line2.textContent = line1.textContent;
        line1.textContent = message;
      },
      onRewards: (rewards) => {
        onRewardGain({
          ...rewards,
          __source: activeBattleMode === 'bingo' ? 'bingo' : 'rank'
        });
      },
      onPlayerAttack,
      onDefeat: () => {
        if (activeBattleMode === 'bingo') return;
        onCombatStateChange(false);
      }
    });

    const bingoUI = window.createLibroBingoUI({
      root,
      getPlayerStats,
      combat,
      showScreen,
      onCombatStateChange,
      onRewards: onRewardGain,
      onPlayerAttack,
      onSkillPointEarned,
      setBattleMode: (mode) => {
        activeBattleMode = mode;
      }
    });

    function goMain() {
      combat.stop();
      bingoUI.stopCombatIfAny();
      bingoUI.pause();
      showScreen('missions-menu');
      onCombatStateChange(false);
      activeBattleMode = 'rank';
    }

    function showMissions(rank) {
      clearMissionScreenListeners();
      bingoUI.pause();
      const player = getPlayerStats();
      currentMissionList = window.MISIONES_RANGO_DATA[rank] || [];
      const missionsScreen = root.querySelector('#missions-screen');
      missionsScreen.replaceChildren();

      currentMissionList.forEach((mission, index) => {
        const locked = player.level < mission.lvl;
        const missionDiv = document.createElement('button');
        missionDiv.className = `mission-item mission-rank-${rank.toLowerCase()} ${locked ? 'locked' : ''}`;
        missionDiv.innerHTML = `
          <div class="mission-header">${mission.name}</div>
          <div class="mission-details">
            <div class="mission-left">
              <span>⚡ XP: ${mission.xp}</span>
              <span>💰 Oro: ${mission.gold}</span>
            </div>
            <div class="mission-right">
              <span>❤️ HP: ${mission.hp}</span>
              <span>⚔️ ATK: ${mission.atk}</span>
              <span>🛡️ DEF: ${mission.def}</span>
            </div>
          </div>
          ${locked ? `<div class="mission-lock">🔒 Nivel mínimo: ${mission.lvl}</div>` : ''}`;

        if (!locked) {
          onMissionScreen(missionDiv, 'click', () => {
            const current = getPlayerStats();
            current.hp = current.maxHp;
            current.mp = current.maxMp;
            root.querySelector('#log-1').textContent = '⚔ ¡El combate ha comenzado!';
            root.querySelector('#log-2').textContent = '';
            onCombatStateChange(true);
            activeBattleMode = 'rank';
            showScreen('battle');
            combat.start(currentMissionList, index, {
              rank
            });
          });
        } else {
          missionDiv.disabled = true;
        }

        missionsScreen.appendChild(missionDiv);
      });

      const backButton = document.createElement('button');
      backButton.id = 'back-to-ranks-from-missions';
      backButton.className = 'back-button';
      backButton.textContent = '⬅️ Volver a Rangos';
      onMissionScreen(backButton, 'click', () => {
        combat.stop();
        showScreen('ranks');
        onCombatStateChange(false);
      });
      missionsScreen.appendChild(backButton);

      showScreen('missions');
    }

    on(root.querySelector('#open-rank-list'), 'click', () => {
      bingoUI.pause();
      showScreen('ranks');
    });

    for (const rank of RANKS) {
      on(root.querySelector(`#rank-${rank}`), 'click', () => showMissions(rank));
    }

    on(root.querySelector('#back-to-main-from-ranks'), 'click', goMain);
    on(root.querySelector('#back-from-battle-to-main'), 'click', () => {
      if (activeBattleMode === 'bingo' && bingoUI.isBingoBattleActive()) {
        bingoUI.backFromBattle();
        return;
      }
      goMain();
    });
    on(root.querySelector('#stop-battle-btn'), 'click', () => {
      if (activeBattleMode === 'bingo' && bingoUI.isBingoBattleActive()) {
        bingoUI.backFromBattle();
        return;
      }
      goMain();
    });

    return {
      destroy() {
        combat.stop();
        bingoUI.destroy();
        clearMissionScreenListeners();
        listeners.forEach((off) => off());
        listeners.length = 0;
        root.remove();
        onReturn();
      },
      getCurrentScreen() {
        return currentScreen;
      }
    };
  }

  window.createMisionesRangoUI = createMissionsUI;
})();
