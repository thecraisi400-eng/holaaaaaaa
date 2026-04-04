(() => {
  const DEFAULT_PLAYER = {
    name: 'Tú',
    emoji: '🥷',
    level: 1,
    hp: 720,
    maxHp: 1000,
    mp: 290,
    maxMp: 500,
    atk: 120,
    def: 80
  };

  const BATALLAS_NINJA_ENEMIES = [
    { id: 'bn-1', rank: 'D', lvl: 3, name: 'Genin Rebelde', hp: 180, atk: 28, def: 10, xp: 18, gold: 20 },
    { id: 'bn-2', rank: 'C', lvl: 8, name: 'Bandido del País del Té', hp: 320, atk: 42, def: 18, xp: 35, gold: 40 },
    { id: 'bn-3', rank: 'B', lvl: 13, name: 'Nukenin Silencioso', hp: 520, atk: 58, def: 24, xp: 52, gold: 62 },
    { id: 'bn-4', rank: 'A', lvl: 18, name: 'ANBU Corrupto', hp: 760, atk: 75, def: 31, xp: 74, gold: 92 },
    { id: 'bn-5', rank: 'S', lvl: 24, name: 'Espadachín de la Niebla', hp: 1040, atk: 96, def: 40, xp: 112, gold: 138 }
  ];

  const RANK_CLASS = {
    D: 'mission-rank-d',
    C: 'mission-rank-c',
    B: 'mission-rank-b',
    A: 'mission-rank-a',
    S: 'mission-rank-s'
  };

  let syncedPlayerStats = { ...DEFAULT_PLAYER };
  let cleanupCurrent = null;

  function getPlayerStats() {
    const source = window.stateManager?.getState?.();
    if (source && typeof source === 'object') {
      return {
        ...syncedPlayerStats,
        hp: Math.max(0, Math.round(Number(source.hp ?? syncedPlayerStats.hp))),
        maxHp: Math.max(1, Math.round(Number(source.maxHp ?? syncedPlayerStats.maxHp))),
        mp: Math.max(0, Math.round(Number(source.mp ?? syncedPlayerStats.mp))),
        maxMp: Math.max(1, Math.round(Number(source.maxMp ?? syncedPlayerStats.maxMp))),
        atk: Math.max(1, Math.round(Number(source.atk ?? syncedPlayerStats.atk))),
        def: Math.max(1, Math.round(Number(source.def ?? syncedPlayerStats.def))),
        level: Math.max(1, Math.round(Number(source.level ?? syncedPlayerStats.level))),
        name: source.name || syncedPlayerStats.name,
        emoji: source.emoji || syncedPlayerStats.emoji
      };
    }
    return { ...syncedPlayerStats };
  }

  function writeBackPlayerState(player) {
    if (!player) return;
    if (window.stateManager?.setState) {
      window.stateManager.setState({
        hp: Math.max(0, Math.round(Number(player.hp || 0))),
        mp: Math.max(0, Math.round(Number(player.mp || 0)))
      });
    }
  }

  function renderBatallasSection(centerEl) {
    if (typeof cleanupCurrent === 'function') {
      cleanupCurrent();
      cleanupCurrent = null;
    }

    const root = document.createElement('div');
    root.className = 'misiones-rango';
    root.innerHTML = `
      <div id="batallas-menu-screen" class="screen">
        <button id="open-batallas-ninja" class="menu-button">⚔️ BATALLAS NINJA ⚔️</button>
      </div>
      <div id="batallas-list-screen" class="screen hidden">
        <div class="section-label">⚔️ Rivales Ninja</div>
        <div id="batallas-ninja-enemy-list" class="bingo-enemy-list"></div>
        <button id="back-to-batallas-menu" class="back-button">⬅️ Volver</button>
      </div>
      <div id="batallas-battle-screen" class="screen hidden">
        <button id="back-from-batallas-battle" class="back-button">⬅️ Volver</button>
        <div class="battle-arena">
          <div class="character-card">
            <div class="card-emoji">🥷</div>
            <div class="hp-bar"><div class="hp-fill" id="bn-character-hp-fill"></div></div>
            <div class="mp-bar"><div class="mp-fill" id="bn-character-mp-fill"></div></div>
          </div>
          <div class="enemy-card">
            <div class="card-emoji" id="bn-enemy-emoji">👹</div>
            <div class="hp-bar"><div class="hp-fill" id="bn-enemy-hp-fill"></div></div>
            <div class="mp-bar"><div class="mp-fill" id="bn-enemy-mp-fill"></div></div>
          </div>
        </div>
        <div class="combat-log" id="bn-combat-log"></div>
        <button id="bn-stop-battle" class="stop-button">⏹️ DETENER</button>
      </div>
    `;

    centerEl.replaceChildren(root);

    const refs = {
      menu: root.querySelector('#batallas-menu-screen'),
      list: root.querySelector('#batallas-list-screen'),
      battle: root.querySelector('#batallas-battle-screen'),
      openNinja: root.querySelector('#open-batallas-ninja'),
      enemyList: root.querySelector('#batallas-ninja-enemy-list'),
      backList: root.querySelector('#back-to-batallas-menu'),
      backBattle: root.querySelector('#back-from-batallas-battle'),
      stopBattle: root.querySelector('#bn-stop-battle'),
      combatLog: root.querySelector('#bn-combat-log'),
      enemyEmoji: root.querySelector('#bn-enemy-emoji'),
      hpFill: root.querySelector('#bn-character-hp-fill'),
      mpFill: root.querySelector('#bn-character-mp-fill'),
      enemyHpFill: root.querySelector('#bn-enemy-hp-fill'),
      enemyMpFill: root.querySelector('#bn-enemy-mp-fill')
    };

    const listeners = [];
    const on = (el, evt, fn) => {
      el.addEventListener(evt, fn);
      listeners.push(() => el.removeEventListener(evt, fn));
    };

    const screenMap = {
      menu: refs.menu,
      list: refs.list,
      battle: refs.battle
    };

    const showScreen = (key) => {
      Object.values(screenMap).forEach((node) => node.classList.add('hidden'));
      (screenMap[key] || refs.menu).classList.remove('hidden');
    };

    const combat = window.createMisionesRangoCombat({
      getPlayerStats,
      onEnemy: (_, emoji) => {
        refs.enemyEmoji.textContent = emoji || '👹';
      },
      onBars: (player, enemy) => {
        refs.hpFill.style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;
        refs.mpFill.style.width = `${Math.max(0, (player.mp / player.maxMp) * 100)}%`;
        if (enemy) refs.enemyHpFill.style.width = `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
        refs.enemyMpFill.style.width = '100%';
        writeBackPlayerState(player);
      },
      onLog: (message) => {
        const row = document.createElement('div');
        row.className = 'log-entry';
        row.textContent = message;
        refs.combatLog.insertBefore(row, refs.combatLog.firstChild);
        if (refs.combatLog.children.length > 15) {
          refs.combatLog.removeChild(refs.combatLog.lastChild);
        }
      },
      onRewards: () => {},
      onPlayerAttack: () => {},
      onDefeat: () => {
        showScreen('list');
      }
    });

    function stopBattleAndGoList() {
      combat.stop();
      showScreen('list');
    }

    function startBattle(enemy) {
      const player = getPlayerStats();
      player.hp = Math.max(1, player.maxHp);
      player.mp = Math.max(0, player.maxMp);
      writeBackPlayerState(player);
      refs.combatLog.innerHTML = '';
      showScreen('battle');
      combat.start([enemy], 0, {
        continueOnWin: false,
        onVictory: () => {
          showScreen('list');
        },
        onDefeat: () => {
          showScreen('list');
        }
      });
    }

    function renderEnemyList() {
      refs.enemyList.replaceChildren();
      const player = getPlayerStats();
      BATALLAS_NINJA_ENEMIES.forEach((enemy) => {
        const locked = player.level < enemy.lvl;
        const item = document.createElement('button');
        item.className = `mission-item ${RANK_CLASS[enemy.rank] || ''} ${locked ? 'locked' : ''}`;
        item.innerHTML = `
          <div class="mission-header">${enemy.name}</div>
          <div class="mission-details">
            <div class="mission-left">
              <span>🏅 Rango: ${enemy.rank}</span>
              <span>⚡ XP: ${enemy.xp}</span>
              <span>💰 Oro: ${enemy.gold}</span>
            </div>
            <div class="mission-right">
              <span>❤️ HP: ${enemy.hp}</span>
              <span>⚔️ ATK: ${enemy.atk}</span>
              <span>🛡️ DEF: ${enemy.def}</span>
            </div>
          </div>
          <div class="mission-lock">${locked ? `🔒 Nivel mínimo: ${enemy.lvl}` : '✅ Disponible'}</div>
        `;
        if (locked) {
          item.disabled = true;
        } else {
          on(item, 'click', () => startBattle(enemy));
        }
        refs.enemyList.appendChild(item);
      });
    }

    on(refs.openNinja, 'click', () => {
      renderEnemyList();
      showScreen('list');
    });

    on(refs.backList, 'click', () => {
      combat.stop();
      showScreen('menu');
    });

    on(refs.backBattle, 'click', stopBattleAndGoList);
    on(refs.stopBattle, 'click', stopBattleAndGoList);

    cleanupCurrent = () => {
      combat.stop();
      listeners.forEach((off) => off());
      listeners.length = 0;
    };
  }

  function parkBatallasSection() {
    if (typeof cleanupCurrent === 'function') {
      cleanupCurrent();
      cleanupCurrent = null;
    }
  }

  function syncPlayerStats(payload) {
    if (!payload || typeof payload !== 'object') return false;

    syncedPlayerStats = {
      ...syncedPlayerStats,
      ...payload,
      hp: Math.max(0, Math.round(Number(payload.hp ?? syncedPlayerStats.hp))),
      maxHp: Math.max(1, Math.round(Number(payload.maxHp ?? syncedPlayerStats.maxHp))),
      mp: Math.max(0, Math.round(Number(payload.mp ?? syncedPlayerStats.mp))),
      maxMp: Math.max(1, Math.round(Number(payload.maxMp ?? syncedPlayerStats.maxMp))),
      atk: Math.max(1, Math.round(Number(payload.atk ?? syncedPlayerStats.atk))),
      def: Math.max(1, Math.round(Number(payload.def ?? syncedPlayerStats.def))),
      level: Math.max(1, Math.round(Number(payload.level ?? syncedPlayerStats.level)))
    };

    return true;
  }

  window.BatallasNinjaModule = {
    renderBatallasSection,
    parkBatallasSection,
    syncPlayerStats
  };
})();
