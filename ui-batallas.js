(() => {
  function createBatallasNinjaUI(options) {
    const {
      container,
      getPlayerStats,
      onCombatStateChange,
      onRewardGain,
      onPlayerAttack,
      onReturn
    } = options;

    const listeners = [];
    const timers = [];
    const on = (el, evt, fn, opts) => {
      if (!el) return;
      el.removeEventListener(evt, fn, opts);
      el.addEventListener(evt, fn, opts);
      listeners.push(() => el.removeEventListener(evt, fn, opts));
    };

    const NINJA_NAMES = [
      'Naruto Uzumaki', 'Sasuke Uchiha', 'Kakashi Hatake', 'Sakura Haruno', 'Itachi Uchiha', 'Jiraiya', 'Hinata Hyuga', 'Gaara', 'Shikamaru Nara', 'Minato Namikaze',
      'Madara Uchiha', 'Obito Uchiha', 'Orochimaru', 'Tsunade', 'Rock Lee', 'Neji Hyuga', 'Kiba Inuzuka', 'Nagato Pain', 'Konan', 'Killer Bee',
      'Temari', 'Kankuro', 'Ino Yamanaka', 'Choji Akimichi', 'Asuma Sarutobi', 'Hiruzen Sarutobi', 'Hashirama Senju', 'Tobirama Senju', 'Kushina Uzumaki', 'Sai',
      'Yamato', 'Kisame Hoshigaki', 'Deidara', 'Sasori', 'Hidan', 'Kakuzu', 'Zetsu', 'Kabuto Yakushi', 'Kaguya Otsutsuki', 'Iruka Umino',
      'Shino Aburame', 'Akamaru', 'Tenten', 'Guy Might', 'Suigetsu Hozuki', 'Karin Uzumaki', 'Jugo', 'Danzo Shimura', 'Shisui Uchiha', 'Rin Nohara'
    ];

    const RANKS = ['Genin', 'Chunin', 'Jonin', 'Anbu', 'Kage'];
    const RANK_CLASSES = ['rank-genin', 'rank-chunin', 'rank-jonin', 'rank-anbu', 'rank-kage'];
    const EMOJIS = ['🔥', '🌪️', '🌙', '⭐', '🗡️', '🦊', '❄️', '🌀', '💀', '⚡', '🐍', '🐸', '🦅', '🐺'];

    const STAT_FORMULAS = [
      { hp: (l) => 80 + 12 * (l - 1), atk: (l) => 22 + 11 * (l - 1), def: (l) => 5 + 4 * (l - 1), spd: (l) => 120 + 5 * (l - 1), crt: (l) => 8 + 0.6 * (l - 1), eva: (l) => 10 + 0.5 * (l - 1), res: (l) => 50 + 8 * (l - 1) },
      { hp: (l) => 90 + 15 * (l - 1), atk: (l) => 28 + 16 * (l - 1), def: (l) => 6 + 3 * (l - 1), spd: (l) => 95 + 2 * (l - 1), crt: (l) => 4 + 0.2 * (l - 1), eva: (l) => 3 + 0.1 * (l - 1), res: (l) => 140 + 28 * (l - 1) },
      { hp: (l) => 115 + 20 * (l - 1), atk: (l) => 20 + 13 * (l - 1), def: (l) => 8 + 7 * (l - 1), spd: (l) => 105 + 3 * (l - 1), crt: (l) => 12 + 0.8 * (l - 1), eva: (l) => 5 + 0.2 * (l - 1), res: (l) => 75 + 12 * (l - 1) },
      { hp: (l) => 105 + 18 * (l - 1), atk: (l) => 12 + 4 * (l - 1), def: (l) => 12 + 9 * (l - 1), spd: (l) => 90 + 2 * (l - 1), crt: (l) => 2 + 0.05 * (l - 1), eva: (l) => 4 + 0.15 * (l - 1), res: (l) => 180 + 35 * (l - 1) },
      { hp: (l) => 140 + 20 * (l - 1), atk: (l) => 30 + 15 * (l - 1), def: (l) => 5 + 3 * (l - 1), spd: (l) => 100 + 3 * (l - 1), crt: (l) => 10 + 0.8 * (l - 1), eva: (l) => 2 + 0.2 * (l - 1), res: (l) => 40 + 5 * (l - 1) }
    ];

    const root = document.createElement('div');
    root.className = 'batallas-ninja';
    root.innerHTML = `
      <div id="game-container">
        <div id="main-menu">
          <button class="menu-btn" id="enter-game-btn">⚔️ BATALLA NINJA</button>
        </div>

        <div id="game-content">
          <div id="top-bar">
            <button class="top-icon" id="msg-btn">💬 <span class="badge" id="msg-badge" style="display:none">0</span></button>
            <div id="player-info">🥷 <span id="player-name">Tú</span> | Rango <span id="player-rank">#101</span> | Lv.<span id="player-level">1</span></div>
            <button class="top-icon" id="lb-btn">🏆 100 Ninjas</button>
          </div>

          <div id="event-timer-bar">⏱️ Evento: <span id="event-timer">23:59:59</span></div>

          <div id="player-stats-bar">
            <div class="player-stat hp-stat">❤️ HP x6: <span id="p-hp-display">0</span><div class="stat-bar-mini"><div class="stat-bar-mini-fill-hp" id="p-hp-bar-mini" style="width:100%"></div></div></div>
            <div class="player-stat mp-stat">💎 MP: <span id="p-mp-display">0</span><div class="stat-bar-mini"><div class="stat-bar-mini-fill-mp" id="p-mp-bar-mini" style="width:100%"></div></div></div>
            <div class="player-stat atk-stat">⚔️ <span id="p-atk-display">0</span></div>
            <div class="player-stat def-stat">🛡️ <span id="p-def-display">0</span></div>
          </div>

          <div id="main-content"></div>

          <div id="bottom-section">
            <div id="combat-log"><div style="text-align:center;color:#607080;font-size:7.5px;padding:2px;">📜 Últimos Combates entre Ninjas</div></div>
          </div>

          <div class="overlay" id="leaderboard-overlay">
            <button class="overlay-close" id="leaderboard-close">✕</button>
            <div class="overlay-title">🏆 RANKING NINJA</div>
            <div id="lb-timer">⏱️ Tiempo restante: <span id="lb-countdown">23:59:59</span></div>
            <div id="lb-list"></div>
          </div>

          <div class="overlay" id="messages-overlay">
            <button class="overlay-close" id="messages-close">✕</button>
            <div class="overlay-title">💬 NOTIFICACIONES DE COMBATE</div>
            <div id="notif-list"></div>
          </div>

          <div id="battle-screen">
            <div class="battle-field">
              <div class="battle-fighter" id="player-fighter"></div>
              <div style="font-size:20px;color:#ff4040">⚔️</div>
              <div class="battle-fighter" id="enemy-fighter"></div>
            </div>
            <div id="battle-log"></div>
            <div id="result-overlay"></div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = '';
    container.appendChild(root);

    const refs = {
      mainMenu: root.querySelector('#main-menu'),
      gameContent: root.querySelector('#game-content'),
      mainContent: root.querySelector('#main-content'),
      combatLog: root.querySelector('#combat-log'),
      battleScreen: root.querySelector('#battle-screen'),
      battleLog: root.querySelector('#battle-log'),
      resultOverlay: root.querySelector('#result-overlay'),
      lbList: root.querySelector('#lb-list'),
      notifList: root.querySelector('#notif-list')
    };

    const gameState = {
      player: { name: 'Tú', rank: 101, level: 1, hp: 0, maxHp: 0, hpDisplay: 0, maxHpDisplay: 0, mp: 0, maxMp: 0, atk: 0, def: 0, spd: 100, crt: 10, eva: 8, res: 60, emoji: '🥷' },
      ninjas: [],
      selectedEnemy: null,
      combatLog: [],
      notifications: [],
      notifCount: 0,
      eventTime: 24 * 60 * 60,
      battleActive: false
    };

    const combat = window.createMisionesRangoCombat({
      getPlayerStats,
      onEnemy: (enemy, emoji) => {
        const enemyEl = root.querySelector('#enemy-fighter');
        if (!enemyEl) return;
        enemyEl.innerHTML = `
          <div class="ninja-avatar">${emoji}</div>
          <div class="fighter-name">${enemy.name}</div>
          <div class="fighter-rank">#${gameState.selectedEnemy?.rank || '?'} · ${gameState.selectedEnemy?.rankClass || ''} · Lv.${gameState.selectedEnemy?.level || ''}</div>
          <div class="bar-label"><span>HP x6</span><span id="e-hp-text">${Math.round(enemy.hp * 6)}/${Math.round(enemy.maxHp * 6)}</span></div>
          <div class="bar-container"><div class="bar-hp" id="e-hp-bar" style="width:100%"></div></div>
        `;
      },
      onBars: (player, enemy) => {
        updatePlayerStatsDisplay();
        const pHpBar = root.querySelector('#p-hp-bar');
        const pMpBar = root.querySelector('#p-mp-bar');
        const pHpText = root.querySelector('#p-hp-text');
        const pMpText = root.querySelector('#p-mp-text');
        if (pHpBar) pHpBar.style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;
        if (pMpBar) pMpBar.style.width = `${Math.max(0, (player.mp / player.maxMp) * 100)}%`;
        if (pHpText) pHpText.textContent = `${Math.round(player.hp * 6)}/${Math.round(player.maxHp * 6)}`;
        if (pMpText) pMpText.textContent = `${Math.round(player.mp)}/${Math.round(player.maxMp)}`;

        if (enemy) {
          const eHpBar = root.querySelector('#e-hp-bar');
          const eHpText = root.querySelector('#e-hp-text');
          if (eHpBar) eHpBar.style.width = `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
          if (eHpText) eHpText.textContent = `${Math.round(enemy.hp * 6)}/${Math.round(enemy.maxHp * 6)}`;
        }
      },
      onLog: (msg) => {
        addBattleLog(String(msg).replace(/Auto-Battle/g, 'Batalla Ninja'), 'info');
      },
      onRewards: (reward) => {
        onRewardGain(reward);
        const enemy = gameState.selectedEnemy;
        if (enemy) {
          const oldPlayerRank = gameState.player.rank;
          const oldEnemyRank = enemy.rank;
          gameState.player.rank = oldEnemyRank;
          enemy.rank = oldPlayerRank;
          gameState.ninjas.sort((a, b) => a.rank - b.rank);
          addCombatLog(`✅ ${gameState.player.name} venció a ${enemy.name} (#${oldEnemyRank}→#${gameState.player.rank})`, 'win');
          addNotification(`${enemy.name} te atacó pero defendiste tu puesto al rango #${gameState.player.rank}`, 'win');
        }
      },
      onDefeat: () => {
        const enemy = gameState.selectedEnemy;
        if (!enemy) return;
        const newRank = Math.min(101, gameState.player.rank + Math.floor(Math.random() * 5) + 1);
        gameState.player.rank = newRank;
        addCombatLog(`❌ ${gameState.player.name} perdió vs ${enemy.name} → Rango #${newRank}`, 'lose');
        addNotification(`${enemy.name} te atacó y bajaste al rango #${newRank}`, 'lose');
      },
      onPlayerAttack
    });

    function enterGame() {
      refs.mainMenu.classList.add('hidden');
      refs.gameContent.classList.add('visible');
      window.setTimeout(() => init(), 80);
    }

    function syncPlayerFromGame() {
      const p = getPlayerStats();
      gameState.player.level = Math.round(p.level || 1);
      gameState.player.hp = Math.round(p.hp);
      gameState.player.maxHp = Math.round(p.maxHp);
      gameState.player.hpDisplay = Math.round(p.hp * 6);
      gameState.player.maxHpDisplay = Math.round(p.maxHp * 6);
      gameState.player.mp = Math.round(p.mp);
      gameState.player.maxMp = Math.round(p.maxMp);
      gameState.player.atk = Math.round(p.atk);
      gameState.player.def = Math.round(p.def);
    }

    function init() {
      if (gameState.ninjas.length > 0) return;
      syncPlayerFromGame();

      const usedNames = new Set();
      for (let i = 1; i <= 100; i++) {
        let name = NINJA_NAMES[(i - 1) % NINJA_NAMES.length];
        let attempt = 0;
        while (usedNames.has(name) && attempt < NINJA_NAMES.length) {
          attempt += 1;
          name = NINJA_NAMES[(i + attempt) % NINJA_NAMES.length];
        }
        usedNames.add(name);

        const level = Math.floor(Math.random() * (100 - gameState.player.level + 1)) + gameState.player.level;
        const formulaIdx = Math.floor(Math.random() * STAT_FORMULAS.length);
        const formula = STAT_FORMULAS[formulaIdx];
        const rankClassIdx = Math.floor(Math.random() * RANKS.length);
        const baseHp = Math.floor(formula.hp(level));

        gameState.ninjas.push({
          rank: i,
          name,
          level,
          hp: baseHp,
          maxHp: baseHp,
          hpDisplay: baseHp * 6,
          maxHpDisplay: baseHp * 6,
          atk: Math.floor(formula.atk(level)),
          def: Math.floor(formula.def(level)),
          spd: Math.floor(formula.spd(level)),
          crt: Math.floor(formula.crt(level)),
          eva: Math.floor(formula.eva(level)),
          res: Math.floor(formula.res(level)),
          formulaIdx,
          rankClass: RANKS[rankClassIdx],
          rankClassIdx,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          nextAttackTime: Math.floor(Math.random() * 3540) + 60,
          firstAttackDone: false
        });
      }

      renderChallengeCards();
      renderLeaderboard();
      updatePlayerDisplay();
      updatePlayerStatsDisplay();
      startEventTimer();
      startNinjaAI();
    }

    function getRankColorClass(rank) {
      if (rank === 1) return 'top1';
      if (rank <= 3) return 'top3';
      if (rank <= 10) return 'top10';
      if (rank <= 25) return 'top25';
      return '';
    }

    function renderChallengeCards() {
      refs.mainContent.innerHTML = '';
      let targets = [];
      for (let r = gameState.player.rank - 3; r < gameState.player.rank; r++) {
        if (r < 1) continue;
        const ninja = gameState.ninjas.find((n) => n.rank === r);
        if (ninja) targets.push(ninja);
      }
      if (targets.length < 3) {
        targets = [...targets, ...gameState.ninjas.filter((n) => !targets.includes(n)).sort((a, b) => a.rank - b.rank).slice(0, 3 - targets.length)];
      }

      targets.forEach((ninja) => {
        const card = document.createElement('div');
        card.className = 'challenge-card';
        card.dataset.rank = String(ninja.rank);
        card.innerHTML = `
          <div class="ninja-avatar">${ninja.emoji}</div>
          <div class="ninja-details">
            <div class="ninja-name">${ninja.name}</div>
            <div class="ninja-rank ${getRankColorClass(ninja.rank)}">#${ninja.rank} · ${ninja.rankClass} · Lv.${ninja.level}</div>
            <div class="ninja-stats">
              <span class="stat-chip hp">❤️ ${ninja.hpDisplay}</span>
              <span class="stat-chip atk">⚔️ ${ninja.atk}</span>
              <span class="stat-chip def">🛡️ ${ninja.def}</span>
            </div>
          </div>
          <span class="ninja-rank-badge ${RANK_CLASSES[ninja.rankClassIdx]}">${ninja.rankClass}</span>
        `;
        on(card, 'click', () => selectEnemy(ninja));
        refs.mainContent.appendChild(card);
      });
    }

    function selectEnemy(ninja) {
      if (gameState.battleActive) return;
      gameState.selectedEnemy = ninja;
      refs.mainContent.querySelectorAll('.challenge-card').forEach((c) => c.classList.remove('selected'));
      const chosen = refs.mainContent.querySelector(`.challenge-card[data-rank="${ninja.rank}"]`);
      if (chosen) chosen.classList.add('selected');
      startBattle();
    }

    function updatePlayerDisplay() {
      root.querySelector('#player-rank').textContent = `#${gameState.player.rank}`;
      root.querySelector('#player-level').textContent = String(gameState.player.level);
      root.querySelector('#player-name').textContent = gameState.player.name;
    }

    function updatePlayerStatsDisplay() {
      syncPlayerFromGame();
      root.querySelector('#p-hp-display').textContent = String(gameState.player.hpDisplay);
      root.querySelector('#p-mp-display').textContent = String(gameState.player.mp);
      root.querySelector('#p-atk-display').textContent = String(gameState.player.atk);
      root.querySelector('#p-def-display').textContent = String(gameState.player.def);
      root.querySelector('#p-hp-bar-mini').style.width = `${Math.max(0, (gameState.player.hpDisplay / gameState.player.maxHpDisplay) * 100)}%`;
      root.querySelector('#p-mp-bar-mini').style.width = `${Math.max(0, (gameState.player.mp / gameState.player.maxMp) * 100)}%`;
    }

    function startBattle() {
      if (!gameState.selectedEnemy || gameState.battleActive) return;
      const enemy = gameState.selectedEnemy;
      const player = getPlayerStats();
      player.hp = player.maxHp;
      player.mp = player.maxMp;

      refs.battleScreen.classList.add('active');
      refs.battleLog.innerHTML = '';
      gameState.battleActive = true;
      onCombatStateChange(true);

      root.querySelector('#player-fighter').innerHTML = `
        <div class="ninja-avatar">${gameState.player.emoji}</div>
        <div class="fighter-name">${gameState.player.name}</div>
        <div class="fighter-rank">#${gameState.player.rank} · ${gameState.player.level} Lv.</div>
        <div class="bar-label"><span>HP x6</span><span id="p-hp-text">${Math.round(player.hp * 6)}/${Math.round(player.maxHp * 6)}</span></div>
        <div class="bar-container"><div class="bar-hp" id="p-hp-bar" style="width:100%"></div></div>
        <div class="bar-label"><span>MP</span><span id="p-mp-text">${Math.round(player.mp)}/${Math.round(player.maxMp)}</span></div>
        <div class="bar-container"><div class="bar-mp" id="p-mp-bar" style="width:100%"></div></div>
        <div class="fighter-stats"><span class="stat-chip atk">⚔️ ${Math.round(player.atk)}</span><span class="stat-chip def">🛡️ ${Math.round(player.def)}</span></div>
      `;

      combat.start([
        { name: enemy.name, hp: enemy.hp, atk: enemy.atk, def: enemy.def, xp: 100 + enemy.level * 6, gold: 50 + enemy.level * 4, lvl: enemy.level }
      ], 0, {
        continueOnWin: false,
        onVictory: () => {
          showResult('win', '🏆 ¡GANASTE! 🏆');
          finalizeBattle();
        },
        onDefeat: () => {
          showResult('lose', '💀 PERDISTE 💀');
          finalizeBattle();
        }
      });
    }

    function addBattleLog(msg, cls) {
      const entry = document.createElement('div');
      entry.className = `battle-msg ${cls}`;
      entry.textContent = `⚡ ${msg}`;
      refs.battleLog.appendChild(entry);
      refs.battleLog.scrollTop = refs.battleLog.scrollHeight;
    }

    function showResult(type, text) {
      refs.resultOverlay.className = `${type} active`;
      refs.resultOverlay.textContent = text;
      refs.resultOverlay.style.display = 'block';
    }

    function finalizeBattle() {
      gameState.battleActive = false;
      updatePlayerDisplay();
      updatePlayerStatsDisplay();
      renderChallengeCards();
      renderLeaderboard();
      window.setTimeout(() => {
        refs.battleScreen.classList.remove('active');
        refs.resultOverlay.className = '';
        refs.resultOverlay.style.display = 'none';
        gameState.selectedEnemy = null;
        onCombatStateChange(false);
      }, 2400);
    }

    function addCombatLog(msg, type) {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      gameState.combatLog.unshift({ time, msg, type });
      if (gameState.combatLog.length > 8) gameState.combatLog.pop();
      renderCombatLog();
    }

    function renderCombatLog() {
      refs.combatLog.innerHTML = '<div style="text-align:center;color:#607080;font-size:7px;padding:1px;">📜 Últimos Combates entre Ninjas</div>';
      gameState.combatLog.forEach((entry) => {
        const div = document.createElement('div');
        div.className = `log-entry ${entry.type}`;
        div.innerHTML = `<span class="log-time">${entry.time}</span><span>${entry.msg}</span>`;
        refs.combatLog.appendChild(div);
      });
    }

    function addNotification(msg, type) {
      gameState.notifications.unshift({ msg, type, read: false });
      gameState.notifCount = gameState.notifications.filter((n) => !n.read).length;
      const badge = root.querySelector('#msg-badge');
      if (gameState.notifCount > 0) {
        badge.style.display = 'flex';
        badge.textContent = String(gameState.notifCount);
      }
    }

    function toggleMessages() {
      const overlay = root.querySelector('#messages-overlay');
      overlay.classList.toggle('active');
      if (!overlay.classList.contains('active')) return;

      refs.notifList.innerHTML = '';
      if (gameState.notifications.length === 0) {
        refs.notifList.innerHTML = '<div style="text-align:center;color:#607080;font-size:9px;padding:20px;">Sin notificaciones 💤</div>';
      } else {
        gameState.notifications.forEach((n) => {
          const div = document.createElement('div');
          div.className = `notif-entry ${n.type}`;
          div.innerHTML = `${n.type === 'win' ? '🏆' : '💀'} ${n.msg}`;
          refs.notifList.appendChild(div);
          n.read = true;
        });
      }
      gameState.notifCount = 0;
      root.querySelector('#msg-badge').style.display = 'none';
    }

    function getRewards(rank) {
      if (rank === 1) return '💰15K ⭐25';
      if (rank <= 3) return '💰10K ⭐15';
      if (rank <= 10) return '💰4K ⭐6';
      if (rank <= 25) return '💰1K ⭐2';
      if (rank <= 70) return '💰300';
      return '';
    }

    function toggleLeaderboard() {
      const overlay = root.querySelector('#leaderboard-overlay');
      overlay.classList.toggle('active');
      if (overlay.classList.contains('active')) renderLeaderboard();
    }

    function renderLeaderboard() {
      refs.lbList.innerHTML = '';
      gameState.ninjas.slice().sort((a, b) => a.rank - b.rank).forEach((ninja) => {
        const entry = document.createElement('div');
        entry.className = 'lb-entry';
        if (ninja.rank === gameState.player.rank) entry.classList.add('player-row');
        let rankClass = '';
        if (ninja.rank === 1) rankClass = 'p1';
        else if (ninja.rank <= 3) rankClass = 'p2';
        else if (ninja.rank <= 10) rankClass = 'p10';
        else if (ninja.rank <= 25) rankClass = 'p25';

        entry.innerHTML = `
          <span class="lb-pos ${rankClass}">#${ninja.rank}</span>
          <span style="font-size:11px">${ninja.emoji}</span>
          <span class="lb-name">${ninja.name}</span>
          <span style="color:#607080;font-size:7px">Lv.${ninja.level}</span>
          <span class="lb-reward">${getRewards(ninja.rank)}</span>
        `;
        refs.lbList.appendChild(entry);
      });
    }

    function startEventTimer() {
      const id = window.setInterval(() => {
        gameState.eventTime = Math.max(0, gameState.eventTime - 1);
        const h = Math.floor(gameState.eventTime / 3600);
        const m = Math.floor((gameState.eventTime % 3600) / 60);
        const s = gameState.eventTime % 60;
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        root.querySelector('#event-timer').textContent = time;
        root.querySelector('#lb-countdown').textContent = time;
        updatePlayerStatsDisplay();
      }, 1000);
      timers.push(id);
    }

    function simulateNinjaFight(attacker, defender) {
      const attackPower = (attacker.atk * 2 + attacker.spd * 0.3 + attacker.crt * 0.5) * (0.7 + Math.random() * 0.6);
      const defensePower = (defender.def * 2 + defender.res * 0.3 + defender.eva * 0.5) * (0.7 + Math.random() * 0.6);
      if (attackPower > defensePower) {
        const temp = attacker.rank;
        attacker.rank = defender.rank;
        defender.rank = temp;
        gameState.ninjas.sort((a, b) => a.rank - b.rank);
        addCombatLog(`⚔️ ${attacker.emoji} ${attacker.name} venció a ${defender.emoji} ${defender.name}`, 'win');
      } else {
        addCombatLog(`🛡️ ${defender.emoji} ${defender.name} defendió su puesto`, 'neutral');
      }
    }

    function startNinjaAI() {
      const id = window.setInterval(() => {
        gameState.ninjas.forEach((ninja) => {
          ninja.nextAttackTime -= 1;
          if (ninja.nextAttackTime > 0) return;
          const validTargets = gameState.ninjas.filter((n) => n.rank >= ninja.rank - 3 && n.rank < ninja.rank && n.rank !== ninja.rank);
          if (validTargets.length > 0) {
            const target = validTargets[Math.floor(Math.random() * validTargets.length)];
            simulateNinjaFight(ninja, target);
          }
          ninja.nextAttackTime = ninja.firstAttackDone ? 7200 : 7200;
          ninja.firstAttackDone = true;
        });
        if (!gameState.battleActive) renderChallengeCards();
      }, 1000);
      timers.push(id);
    }

    on(root.querySelector('#enter-game-btn'), 'click', enterGame);
    on(root.querySelector('#msg-btn'), 'click', toggleMessages);
    on(root.querySelector('#messages-close'), 'click', toggleMessages);
    on(root.querySelector('#lb-btn'), 'click', toggleLeaderboard);
    on(root.querySelector('#leaderboard-close'), 'click', toggleLeaderboard);

    enterGame();

    return {
      destroy() {
        combat.stop();
        listeners.forEach((off) => off());
        timers.forEach((id) => window.clearInterval(id));
        listeners.length = 0;
        timers.length = 0;
        onCombatStateChange(false);
        root.remove();
        onReturn?.();
      }
    };
  }

  window.createBatallasNinjaUI = createBatallasNinjaUI;
})();
