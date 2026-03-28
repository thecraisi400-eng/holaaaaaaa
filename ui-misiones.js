(() => {
  const RANKS = ['D', 'C', 'B', 'A', 'S'];

  function createMissionsUI(options) {
    const {
      container,
      getPlayerStats,
      onReturn,
      onRewardGain,
      onCombatStateChange
    } = options;

    const listeners = [];
    const on = (el, evt, fn, opts) => {
      el.addEventListener(evt, fn, opts);
      listeners.push(() => el.removeEventListener(evt, fn, opts));
    };

    let currentScreen = 'main';
    let currentMissionList = [];

    const root = document.createElement('div');
    root.className = 'misiones-rango';
    root.innerHTML = `
      <div id="main-menu-screen" class="screen">
        <button id="open-misiones-menu" class="menu-button">📜 MISIONES</button>
        <button class="menu-button menu-button-alt">📦 Próximamente</button>
      </div>
      <div id="missions-menu-screen" class="screen hidden">
        <button id="open-rank-list" class="menu-button">⚔️ MISION RANGO ⚔️</button>
        <button id="back-to-main-from-missions-menu" class="back-button">⬅️ Volver</button>
      </div>
      <div id="rank-list-screen" class="screen hidden">
        <button id="rank-D" class="rank-button rank-d">📜 MISION RANGO D</button>
        <button id="rank-C" class="rank-button rank-c">🔥 MISION RANGO C</button>
        <button id="rank-B" class="rank-button rank-b">🌪️ MISION RANGO B</button>
        <button id="rank-A" class="rank-button rank-a">💀 MISION RANGO A</button>
        <button id="rank-S" class="rank-button rank-s">👑 MISION RANGO S</button>
        <button id="back-to-main-from-ranks" class="back-button">⬅️ Volver</button>
      </div>
      <div id="missions-screen" class="screen hidden">
        <button id="back-to-ranks-from-missions" class="back-button">⬅️ Volver a Rangos</button>
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

    const mainScreen = root.querySelector('#main-menu-screen');
    const missionsMenuScreen = root.querySelector('#missions-menu-screen');
    const rankScreen = root.querySelector('#rank-list-screen');
    const missionsScreen = root.querySelector('#missions-screen');
    const battleScreen = root.querySelector('#battle-screen');

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
      onRewards: onRewardGain,
      onDefeat: () => onCombatStateChange(false)
    });

    function goMain() {
      combat.stop();
      battleScreen.classList.add('hidden');
      missionsScreen.classList.add('hidden');
      rankScreen.classList.add('hidden');
      missionsMenuScreen.classList.add('hidden');
      mainScreen.classList.remove('hidden');
      currentScreen = 'main';
      onCombatStateChange(false);
    }

    function showMissions(rank) {
      const player = getPlayerStats();
      currentMissionList = window.MISIONES_RANGO_DATA[rank] || [];
      missionsScreen.innerHTML = '';

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
          on(missionDiv, 'click', () => {
            const current = getPlayerStats();
            current.hp = current.maxHp;
            current.mp = current.maxMp;
            root.querySelector('#combat-log').innerHTML = '';
            missionsScreen.classList.add('hidden');
            rankScreen.classList.add('hidden');
            mainScreen.classList.add('hidden');
            battleScreen.classList.remove('hidden');
            currentScreen = 'battle';
            onCombatStateChange(true);
            combat.start(currentMissionList, index);
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
      on(backButton, 'click', () => {
        combat.stop();
        missionsScreen.classList.add('hidden');
        rankScreen.classList.remove('hidden');
        currentScreen = 'ranks';
        onCombatStateChange(false);
      });
      missionsScreen.appendChild(backButton);

      rankScreen.classList.add('hidden');
      missionsMenuScreen.classList.add('hidden');
      missionsScreen.classList.remove('hidden');
      currentScreen = 'missions';
    }

    on(root.querySelector('#open-misiones-menu'), 'click', () => {
      mainScreen.classList.add('hidden');
      missionsMenuScreen.classList.remove('hidden');
      currentScreen = 'missions-menu';
    });

    on(root.querySelector('#open-rank-list'), 'click', () => {
      missionsMenuScreen.classList.add('hidden');
      rankScreen.classList.remove('hidden');
      currentScreen = 'ranks';
    });

    for (const rank of RANKS) {
      on(root.querySelector(`#rank-${rank}`), 'click', () => showMissions(rank));
    }

    on(root.querySelector('#back-to-main-from-missions-menu'), 'click', goMain);
    on(root.querySelector('#back-to-main-from-ranks'), 'click', goMain);
    on(root.querySelector('#back-from-battle-to-main'), 'click', goMain);
    on(root.querySelector('#stop-battle-btn'), 'click', goMain);

    return {
      destroy() {
        combat.stop();
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
