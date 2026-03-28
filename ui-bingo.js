(() => {
  function fmtTime(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
    return `⏳ ${h}:${m}:${s}`;
  }

  function createLibroBingoUI(options) {
    const {
      root,
      getPlayerStats,
      combat,
      showScreen,
      onCombatStateChange,
      onRewards,
      setBattleMode
    } = options;

    const logic = window.createLibroBingoLogic();
    const listeners = [];
    const enemyListeners = [];
    const on = (el, evt, fn, opts) => {
      el.addEventListener(evt, fn, opts);
      listeners.push(() => el.removeEventListener(evt, fn, opts));
    };
    const onEnemy = (el, evt, fn, opts) => {
      el.addEventListener(evt, fn, opts);
      enemyListeners.push(() => el.removeEventListener(evt, fn, opts));
    };
    const clearEnemyListeners = () => {
      enemyListeners.forEach((off) => off());
      enemyListeners.length = 0;
    };

    const refs = {
      openBtn: root.querySelector('#open-libro-bingo'),
      rankScreen: root.querySelector('#bingo-rank-screen'),
      enemyScreen: root.querySelector('#bingo-enemies-screen'),
      timer: root.querySelector('#bingo-timer'),
      rankA: root.querySelector('#bingo-rank-option-a'),
      rankB: root.querySelector('#bingo-rank-option-b'),
      title: root.querySelector('#bingo-rank-title'),
      enemyList: root.querySelector('#bingo-enemy-list')
    };

    let timerInterval = null;
    let currentEnemyBattleId = null;

    function paintRankButton(button, rank) {
      if (!button || !rank) return;
      const meta = window.BINGO_RANK_META[rank];
      button.dataset.rank = rank;
      button.className = `rank-button ${meta.className}`;
      button.textContent = `📘 ${meta.label}`;
    }

    function refreshTimer() {
      refs.timer.textContent = fmtTime(logic.getTimeLeftMs());
    }

    function startTimer() {
      if (timerInterval) window.clearInterval(timerInterval);
      refreshTimer();
      timerInterval = window.setInterval(() => {
        refreshTimer();
        if (refs.rankA.classList.contains('hidden') && !logic.hasSelectedRank()) {
          renderRankOptions();
        }
      }, 1000);
    }

    function renderRankOptions() {
      const state = logic.getState();
      paintRankButton(refs.rankA, state.rankOptions[0]);
      paintRankButton(refs.rankB, state.rankOptions[1]);
      refs.rankA.classList.remove('hidden');
      refs.rankB.classList.remove('hidden');
      refreshTimer();
    }

    function renderCooldownOnly() {
      refs.rankA.classList.add('hidden');
      refs.rankB.classList.add('hidden');
      refreshTimer();
      showScreen('bingo-ranks');
    }

    function renderEnemyList() {
      clearEnemyListeners();
      const state = logic.getState();
      const selectedRank = state.selectedRank;
      const meta = selectedRank ? window.BINGO_RANK_META[selectedRank] : null;
      refs.title.textContent = meta ? `${meta.label} · Libro Bingo` : 'Libro Bingo';
      const player = getPlayerStats();
      const enemies = logic.getCurrentEnemies();
      refs.enemyList.replaceChildren();

      enemies.forEach((enemy) => {
        const btn = document.createElement('button');
        const lockedByLevel = player.level < enemy.lvl;
        btn.className = `mission-item mission-rank-${(selectedRank || '').toLowerCase()} ${(enemy.defeated || lockedByLevel) ? 'locked' : ''}`;
        btn.innerHTML = `
          <div class="mission-header">${enemy.name}</div>
          <div class="mission-details">
            <div class="mission-left">
              <span>⚡ XP: ${enemy.xp}</span>
              <span>💰 Oro: ${enemy.gold}</span>
            </div>
            <div class="mission-right">
              <span>❤️ HP: ${enemy.hp}</span>
              <span>⚔️ ATK: ${enemy.atk}</span>
              <span>🛡️ DEF: ${enemy.def}</span>
            </div>
          </div>
          <div class="mission-lock">${lockedByLevel ? `🔒 Nivel mínimo: ${enemy.lvl}` : (enemy.defeated ? (enemy.won ? '🏆 Superado' : '💀 Derrotado') : `🎲 Probabilidad: ${enemy.prob}`)}</div>`;

        if (!lockedByLevel && !enemy.defeated) {
          onEnemy(btn, 'click', () => {
            currentEnemyBattleId = enemy.id;
            if (typeof setBattleMode === 'function') setBattleMode('bingo');
            onCombatStateChange(true);
            showScreen('battle');
            combat.start([enemy], 0, {
              continueOnWin: false,
              onVictory: ({ rewards }) => {
                logic.markEnemyResult(currentEnemyBattleId, true);
                onRewards(rewards);
                currentEnemyBattleId = null;
                if (typeof setBattleMode === 'function') setBattleMode('rank');
                openBingoByState();
                onCombatStateChange(false);
              },
              onDefeat: () => {
                logic.markEnemyResult(currentEnemyBattleId, false);
                currentEnemyBattleId = null;
                if (typeof setBattleMode === 'function') setBattleMode('rank');
                openBingoByState();
                onCombatStateChange(false);
              }
            });
          });
        } else {
          btn.disabled = true;
        }

        refs.enemyList.appendChild(btn);
      });
    }

    function openBingoByState() {
      if (!logic.hasSelectedRank()) {
        clearEnemyListeners();
        renderRankOptions();
        showScreen('bingo-ranks');
        return;
      }

      if (logic.isSelectedRankCompleted()) {
        clearEnemyListeners();
        refs.enemyList.replaceChildren();
        renderCooldownOnly();
        return;
      }

      renderEnemyList();
      showScreen('bingo-enemies');
    }

    on(refs.openBtn, 'click', () => {
      openBingoByState();
    });

    const handleRankSelection = (event) => {
      const rank = event.currentTarget.dataset.rank;
      if (!rank) return;
      logic.selectRank(rank);
      renderEnemyList();
      showScreen('bingo-enemies');
    };

    on(refs.rankA, 'click', handleRankSelection);
    on(refs.rankB, 'click', handleRankSelection);


    startTimer();

    return {
      stopCombatIfAny() {
        combat.stop();
        currentEnemyBattleId = null;
        if (typeof setBattleMode === 'function') setBattleMode('rank');
      },
      destroy() {
        if (timerInterval) {
          window.clearInterval(timerInterval);
          timerInterval = null;
        }
        clearEnemyListeners();
        listeners.forEach((off) => off());
        listeners.length = 0;
      },
      backFromBattle() {
        this.stopCombatIfAny();
        if (typeof setBattleMode === 'function') setBattleMode('rank');
        openBingoByState();
        onCombatStateChange(false);
      },
      isBingoBattleActive() {
        return Boolean(currentEnemyBattleId);
      }
    };
  }

  window.createLibroBingoUI = createLibroBingoUI;
})();
