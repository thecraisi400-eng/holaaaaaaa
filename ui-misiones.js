(() => {
  const RANKS = ['D', 'C', 'B', 'A', 'S'];

  function createMissionsUI(options) {
    const {
      container,
      getPlayerStats,
      onReturn,
      onRewardGain,
      onCombatStateChange,
      onPlayerAttack
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
        <div class="battle-arena">
          <div class="character-card" id="character-card">
            <div class="card-emoji">🥷</div>
            <div class="hp-bar"><div class="hp-fill" id="character-hp-fill"></div></div>
            <div class="mp-bar"><div class="mp-fill" id="character-mp-fill"></div></div>
          </div>
          <div class="enemy-card" id="enemy-card">
            <div class="card-emoji" id="enemy-emoji">👹</div>
            <div class="hp-bar"><div class="hp-fill" id="enemy-hp-fill"></div></div>
            <div class="mp-bar"><div class="mp-fill" id="enemy-mp-fill"></div></div>
          </div>
        </div>
        <div class="combat-log" id="combat-log"></div>
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
      },
      onBars: (player, enemy) => {
        root.querySelector('#character-hp-fill').style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;
        root.querySelector('#character-mp-fill').style.width = `${Math.max(0, (player.mp / player.maxMp) * 100)}%`;
        if (enemy) root.querySelector('#enemy-hp-fill').style.width = `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
        root.querySelector('#enemy-mp-fill').style.width = '100%';
      },
      onLog: (message) => {
        const logDiv = root.querySelector('#combat-log');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        logDiv.insertBefore(entry, logDiv.firstChild);
        if (logDiv.children.length > 15) logDiv.removeChild(logDiv.lastChild);
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
            root.querySelector('#combat-log').innerHTML = '';
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
