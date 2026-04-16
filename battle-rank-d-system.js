(function () {
  // ────────────────────────────────────────────────────────
  // SISTEMA DE BATALLA - MISIÓN RANGO D
  // Contenedor: BATALLA MISION RANGO D
  // ────────────────────────────────────────────────────────

  const BATTLE_DATA = {
    D: [
      { name: 'Eliminar lobos hambrientos', xp: 2, gold: 4, hp: 138, atk: 25, def: 17, lvl: 1 },
      { name: 'Recuperar suministros robados por goblins', xp: 4, gold: 8, hp: 174, atk: 43, def: 28, lvl: 3 },
      { name: 'Proteger la aldea de jabalíes', xp: 6, gold: 12, hp: 210, atk: 61, def: 39, lvl: 5 },
      { name: 'Investigar ruinas infestadas de ratas gigantes', xp: 8, gold: 16, hp: 246, atk: 78, def: 50, lvl: 7 },
      { name: 'Escoltar a un mercader (bandido)', xp: 9, gold: 18, hp: 264, atk: 87, def: 55, lvl: 9 },
      { name: 'Cazar una bestia nocturna', xp: 10, gold: 20, hp: 282, atk: 96, def: 61, lvl: 12 }
    ]
  };

  const STAT_META = [
    { key: 'HP', label: 'HP', suffix: '' },
    { key: 'MP', label: 'MP', suffix: '' },
    { key: 'ATK', label: 'ATK', suffix: '' },
    { key: 'DEF', label: 'DEF', suffix: '' },
    { key: 'AGI', label: 'AGI', suffix: '' },
    { key: 'INT', label: 'INT', suffix: '' },
    { key: 'CRT', label: 'CRT', suffix: '%' },
    { key: 'CDMG', label: 'CDMG', suffix: '%' },
    { key: 'EVA', label: 'EVA', suffix: '%' },
    { key: 'REGEN', label: 'REGEN', suffix: '%' },
    { key: 'RES', label: 'RES', suffix: '%' },
    { key: 'LCK', label: 'LCK', suffix: '' }
  ];

  let battleSystemHost = null;
  let battleRoot = null;
  let isMounted = false;
  let currentMission = null;
  let playerStats = {};
  let enemyStats = {};
  let battleState = 'idle'; // idle, fighting, victory, defeated
  let battleRound = 1;
  let farmingMode = false;

  function mount(hostId = 'hero-system-host') {
    if (isMounted) return;
    
    battleSystemHost = document.getElementById(hostId);
    if (!battleSystemHost) return;

    // Crear contenedor HTML completo
    battleSystemHost.innerHTML = `
      <style>
        /* ────────────────────────────────────────────────────────
           ESTILOS DEL SISTEMA DE BATALLA RANGO D
           ──────────────────────────────────────────────────────── */
        #bmr-battle-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, rgba(10,15,30,0.95) 0%, rgba(20,25,45,0.9) 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Rajdhani', 'Arial Black', sans-serif;
        }

        .bmr-view {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: none;
          flex-direction: column;
          opacity: 0;
          transform: translateX(100%);
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
        }

        .bmr-view.active {
          display: flex;
          opacity: 1;
          transform: translateX(0);
          pointer-events: all;
        }

        /* Vista de Rangos */
        #bmr-view-ranks {
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .bmr-title {
          font-size: 1.4rem;
          color: #FFD700;
          text-align: center;
          margin-bottom: 25px;
          text-shadow: 0 0 10px rgba(255,215,0,0.5);
          letter-spacing: 2px;
        }

        .bmr-rank-btn {
          width: 280px;
          padding: 14px 20px;
          margin: 8px 0;
          background: linear-gradient(135deg, rgba(34,139,34,0.3) 0%, rgba(0,100,0,0.4) 100%);
          border: 2px solid rgba(100,255,100,0.4);
          border-radius: 8px;
          color: #90EE90;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
          box-shadow: 0 0 15px rgba(50,205,50,0.2);
        }

        .bmr-rank-btn:hover {
          background: linear-gradient(135deg, rgba(34,139,34,0.5) 0%, rgba(0,100,0,0.6) 100%);
          border-color: rgba(100,255,100,0.8);
          box-shadow: 0 0 25px rgba(50,205,50,0.4);
          transform: scale(1.02);
        }

        .bmr-rank-icon { font-size: 1.3rem; }
        .bmr-rank-label { flex: 1; text-align: left; padding-left: 12px; }
        .bmr-rank-arrow { font-size: 1.2rem; }

        /* Vista de Misiones */
        #bmr-view-missions {
          padding: 15px;
        }

        .bmr-mission-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 5px;
        }

        .bmr-mission-card {
          background: linear-gradient(135deg, rgba(40,50,80,0.6) 0%, rgba(20,30,60,0.7) 100%);
          border: 1px solid rgba(100,150,255,0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }

        .bmr-mission-card.locked {
          opacity: 0.5;
          filter: grayscale(0.6);
        }

        .bmr-mission-card.unlocked:hover {
          border-color: rgba(100,200,255,0.6);
          box-shadow: 0 0 15px rgba(100,150,255,0.3);
        }

        .bmr-mission-name {
          font-size: 0.85rem;
          color: #E0E0E0;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .bmr-mission-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .bmr-mission-rewards {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bmr-xp { color: #34d399; font-size: 0.75rem; }
        .bmr-gold { color: #fbbf24; font-size: 0.75rem; }

        .bmr-mission-enemy {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 0.7rem;
        }

        .bmr-hp { color: #ef4444; }
        .bmr-atk { color: #f97316; }
        .bmr-def { color: #3b82f6; }

        .bmr-fight-btn {
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, rgba(220,38,38,0.4) 0%, rgba(185,28,28,0.5) 100%);
          border: 1px solid rgba(239,68,68,0.5);
          border-radius: 6px;
          color: #fca5a5;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bmr-fight-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(220,38,38,0.6) 0%, rgba(185,28,28,0.7) 100%);
          border-color: rgba(239,68,68,0.8);
          box-shadow: 0 0 12px rgba(239,68,68,0.4);
        }

        .bmr-fight-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .bmr-lock-status {
          font-size: 0.65rem;
          color: #9ca3af;
          text-align: center;
          margin-top: 6px;
        }

        .bmr-lock-status.unlocked { color: #34d399; }

        .bmr-back-btn {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(150,150,150,0.4);
          border-radius: 6px;
          color: #9ca3af;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }

        .bmr-back-btn:hover {
          border-color: rgba(200,200,200,0.6);
          color: #e5e5e5;
        }

        /* Vista de Batalla */
        #bmr-view-battle {
          justify-content: space-between;
          padding: 10px;
        }

        .bmr-battle-header {
          text-align: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .bmr-battle-title {
          font-size: 0.9rem;
          color: #FFD700;
          text-shadow: 0 0 8px rgba(255,215,0,0.4);
        }

        .bmr-battle-area {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 5px;
          position: relative;
        }

        .bmr-fighter {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 45%;
        }

        .bmr-fighter-sprite {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, rgba(50,50,80,0.8) 0%, rgba(30,30,60,0.9) 100%);
          border: 2px solid rgba(150,150,200,0.4);
          border-radius: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2rem;
          margin-bottom: 8px;
          position: relative;
        }

        .bmr-player-sprite { border-color: rgba(100,200,255,0.5); }
        .bmr-enemy-sprite { border-color: rgba(255,100,100,0.5); }

        .bmr-fighter-name {
          font-size: 0.7rem;
          color: #E0E0E0;
          margin-bottom: 6px;
          text-align: center;
        }

        .bmr-hp-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(0,0,0,0.5);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .bmr-hp-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
          transition: width 0.3s ease;
        }

        .bmr-hp-text {
          font-size: 0.6rem;
          color: #9ca3af;
          text-align: center;
        }

        .bmr-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          width: 100%;
          margin-top: 6px;
        }

        .bmr-stat-item {
          font-size: 0.55rem;
          color: #9ca3af;
          text-align: center;
          background: rgba(0,0,0,0.3);
          padding: 2px 4px;
          border-radius: 3px;
        }

        .bmr-stat-key { color: #60a5fa; font-weight: 600; }
        .bmr-stat-val { color: #fbbf24; }

        .bmr-battle-log {
          height: 80px;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 8px;
          overflow-y: auto;
          font-size: 0.65rem;
          color: #d1d5db;
          margin-bottom: 10px;
        }

        .bmr-log-entry {
          margin-bottom: 4px;
          padding: 2px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .bmr-log-player { color: #60a5fa; }
        .bmr-log-enemy { color: #ef4444; }
        .bmr-log-crit { color: #fbbf24; font-weight: 700; }
        .bmr-log-victory { color: #34d399; font-weight: 700; }
        .bmr-log-defeat { color: #ef4444; font-weight: 700; }

        .bmr-battle-actions {
          display: flex;
          gap: 8px;
          padding-bottom: 10px;
        }

        .bmr-action-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bmr-attack-btn {
          background: linear-gradient(135deg, rgba(220,38,38,0.5) 0%, rgba(185,28,28,0.6) 100%);
          color: #fca5a5;
          border: 1px solid rgba(239,68,68,0.5);
        }

        .bmr-attack-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(220,38,38,0.7) 0%, rgba(185,28,28,0.8) 100%);
          box-shadow: 0 0 12px rgba(239,68,68,0.5);
        }

        .bmr-cancel-btn {
          background: transparent;
          color: #9ca3af;
          border: 1px solid rgba(150,150,150,0.4);
        }

        .bmr-cancel-btn:hover {
          border-color: rgba(200,200,200,0.6);
          color: #e5e5e5;
        }

        .bmr-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Anuncio de Próxima Ronda */
        .bmr-next-round-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.85);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .bmr-next-round-overlay.show {
          display: flex;
          animation: bmrFadeIn 0.3s ease;
        }

        @keyframes bmrFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .bmr-next-round-text {
          font-size: 1.8rem;
          color: #FFD700;
          font-weight: 900;
          text-shadow: 0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.5);
          letter-spacing: 4px;
          animation: bmrPulse 0.8s ease-in-out infinite alternate;
        }

        @keyframes bmrPulse {
          from { 
            transform: scale(1);
            filter: drop-shadow(0 0 10px rgba(255,215,0,0.5));
          }
          to { 
            transform: scale(1.1);
            filter: drop-shadow(0 0 30px rgba(255,215,0,0.9));
          }
        }

        /* Scrollbar */
        .bmr-mission-list::-webkit-scrollbar,
        .bmr-battle-log::-webkit-scrollbar {
          width: 4px;
        }

        .bmr-mission-list::-webkit-scrollbar-track,
        .bmr-battle-log::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
        }

        .bmr-mission-list::-webkit-scrollbar-thumb,
        .bmr-battle-log::-webkit-scrollbar-thumb {
          background: rgba(100,150,200,0.4);
          border-radius: 2px;
        }
      </style>

      <div id="bmr-battle-container">
        <!-- Vista de Rangos -->
        <div id="bmr-view-ranks" class="bmr-view">
          <div class="bmr-title">✦ SELECCIONA EL RANGO ✦</div>
          <button class="bmr-rank-btn" data-rank="D">
            <span class="bmr-rank-icon">🟢</span>
            <span class="bmr-rank-label">MISIÓN RANGO D</span>
            <span class="bmr-rank-arrow">›</span>
          </button>
          <button class="bmr-back-btn" id="bmr-back-to-main">← Volver</button>
        </div>

        <!-- Vista de Misiones -->
        <div id="bmr-view-missions" class="bmr-view">
          <div class="bmr-title">✦ MISIÓN RANGO D ✦</div>
          <div class="bmr-mission-list" id="bmr-mission-list"></div>
          <button class="bmr-back-btn" id="bmr-back-to-ranks">← Volver a Rangos</button>
        </div>

        <!-- Vista de Batalla -->
        <div id="bmr-view-battle" class="bmr-view">
          <div class="bmr-battle-header">
            <div class="bmr-battle-title" id="bmr-battle-mission-name">Misión</div>
          </div>

          <div class="bmr-battle-area">
            <!-- Jugador -->
            <div class="bmr-fighter bmr-player">
              <div class="bmr-fighter-sprite bmr-player-sprite">🥷</div>
              <div class="bmr-fighter-name" id="bmr-player-name">JUGADOR</div>
              <div class="bmr-hp-bar-container">
                <div class="bmr-hp-bar-fill" id="bmr-player-hp-bar" style="width: 100%"></div>
              </div>
              <div class="bmr-hp-text" id="bmr-player-hp-text">1000/1000</div>
              <div class="bmr-stats-grid" id="bmr-player-stats"></div>
            </div>

            <!-- Enemigo -->
            <div class="bmr-fighter bmr-enemy">
              <div class="bmr-fighter-sprite bmr-enemy-sprite">👹</div>
              <div class="bmr-fighter-name" id="bmr-enemy-name">ENEMIGO</div>
              <div class="bmr-hp-bar-container">
                <div class="bmr-hp-bar-fill" id="bmr-enemy-hp-bar" style="width: 100%"></div>
              </div>
              <div class="bmr-hp-text" id="bmr-enemy-hp-text">100/100</div>
              <div class="bmr-stats-grid" id="bmr-enemy-stats"></div>
            </div>
          </div>

          <div class="bmr-battle-log" id="bmr-battle-log"></div>

          <div class="bmr-battle-actions">
            <button class="bmr-action-btn bmr-attack-btn" id="bmr-attack-btn">⚔️ ATACAR</button>
            <button class="bmr-action-btn bmr-cancel-btn" id="bmr-cancel-btn">✕ CANCELAR</button>
          </div>

          <!-- Overlay de Próxima Ronda -->
          <div class="bmr-next-round-overlay" id="bmr-next-round-overlay">
            <div class="bmr-next-round-text">PRÓXIMA RONDA</div>
          </div>
        </div>
      </div>
    `;

    battleRoot = battleSystemHost.querySelector('#bmr-battle-container');
    bindEvents();
    switchView('bmr-view-ranks');
    isMounted = true;
  }

  function unmount(hostId = 'hero-system-host') {
    const host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML = '';
    battleSystemHost = null;
    battleRoot = null;
    isMounted = false;
    currentMission = null;
    battleState = 'idle';
    farmingMode = false;
  }

  function bindEvents() {
    if (!battleRoot) return;

    // Botón volver al main
    const backToMain = battleRoot.querySelector('#bmr-back-to-main');
    if (backToMain) {
      backToMain.addEventListener('click', () => {
        if (window.HeroSystem && typeof window.HeroSystem.mount === 'function') {
          window.HeroSystem.mount('hero-system-host');
        }
      });
    }

    // Botón de rango D
    const rankBtn = battleRoot.querySelector('.bmr-rank-btn[data-rank="D"]');
    if (rankBtn) {
      rankBtn.addEventListener('click', () => showMissions('D'));
    }

    // Botón volver a rangos
    const backToRanks = battleRoot.querySelector('#bmr-back-to-ranks');
    if (backToRanks) {
      backToRanks.addEventListener('click', () => switchView('bmr-view-ranks'));
    }

    // Botón atacar
    const attackBtn = battleRoot.querySelector('#bmr-attack-btn');
    if (attackBtn) {
      attackBtn.addEventListener('click', playerAttack);
    }

    // Botón cancelar
    const cancelBtn = battleRoot.querySelector('#bmr-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', cancelBattle);
    }
  }

  function switchView(viewId) {
    if (!battleRoot) return;

    const views = battleRoot.querySelectorAll('.bmr-view');
    views.forEach(view => {
      view.classList.remove('active');
    });

    const targetView = battleRoot.querySelector(`#${viewId}`);
    if (targetView) {
      targetView.classList.add('active');
    }
  }

  function getPlayerStats() {
    const hero = window.CharacterStatsSystem ? window.CharacterStatsSystem.getActiveHero() : null;
    
    if (hero && hero.stats) {
      return { ...hero.stats };
    }

    // Stats por defecto si no hay héroe
    const defaultStats = {};
    STAT_META.forEach(meta => {
      defaultStats[meta.key] = meta.key === 'HP' ? 1000 : (meta.key === 'MP' ? 500 : 100);
    });
    return defaultStats;
  }

  function getPlayerLevel() {
    const hero = window.CharacterStatsSystem ? window.CharacterStatsSystem.getActiveHero() : null;
    return hero ? hero.level : 1;
  }

  function showMissions(rank) {
    if (!BATTLE_DATA[rank]) return;

    const container = battleRoot.querySelector('#bmr-mission-list');
    if (!container) return;

    container.innerHTML = '';
    const missions = BATTLE_DATA[rank];
    const playerLevel = getPlayerLevel();

    missions.forEach((mission, index) => {
      const locked = playerLevel < mission.lvl;
      const card = document.createElement('div');
      card.className = `bmr-mission-card ${locked ? 'locked' : 'unlocked'}`;
      
      card.innerHTML = `
        <div class="bmr-mission-name">⚔️ ${mission.name}</div>
        <div class="bmr-mission-body">
          <div class="bmr-mission-rewards">
            <span class="bmr-xp">✨ ${mission.xp} XP</span>
            <span class="bmr-gold">💰 ${mission.gold} Oro</span>
          </div>
          <div class="bmr-mission-enemy">
            <span class="bmr-hp">❤️ HP: ${mission.hp}</span>
            <span class="bmr-atk">⚔️ ATK: ${mission.atk}</span>
            <span class="bmr-def">🛡️ DEF: ${mission.def}</span>
          </div>
        </div>
        <button class="bmr-fight-btn" ${locked ? 'disabled' : ''}>⚔️ Luchar</button>
        <div class="bmr-lock-status ${!locked ? 'unlocked' : ''}">
          ${locked ? `🔒 Nivel ${mission.lvl} requerido` : '✅ Desbloqueado'}
        </div>
      `;

      const fightBtn = card.querySelector('.bmr-fight-btn');
      if (fightBtn) {
        fightBtn.addEventListener('click', () => startBattle(index, rank));
      }

      container.appendChild(card);
    });

    switchView('bmr-view-missions');
  }

  function startBattle(missionIndex, rank) {
    currentMission = { ...BATTLE_DATA[rank][missionIndex] };
    battleRound = 1;
    farmingMode = false;

    // Obtener stats del jugador
    playerStats = getPlayerStats();
    playerStats.currentHp = playerStats.HP;

    // Configurar enemigo con stats de la misión
    enemyStats = {
      HP: currentMission.hp,
      ATK: currentMission.atk,
      DEF: currentMission.def,
      currentHp: currentMission.hp
    };

    // Actualizar UI de batalla
    updateBattleUI();
    
    // Limpiar log
    const log = battleRoot.querySelector('#bmr-battle-log');
    if (log) log.innerHTML = '';

    addLogEntry(`¡Batalla iniciada contra ${currentMission.name}!`, 'neutral');
    addLogEntry(`Ronda ${battleRound}`, 'neutral');

    // Mostrar vista de batalla
    switchView('bmr-view-battle');
    battleState = 'fighting';

    // Actualizar nombre de la misión
    const missionNameEl = battleRoot.querySelector('#bmr-battle-mission-name');
    if (missionNameEl) {
      missionNameEl.textContent = currentMission.name;
    }

    // Habilitar botón de ataque
    const attackBtn = battleRoot.querySelector('#bmr-attack-btn');
    if (attackBtn) {
      attackBtn.disabled = false;
    }
  }

  function updateBattleUI() {
    if (!battleRoot) return;

    // Actualizar jugador
    const playerHpBar = battleRoot.querySelector('#bmr-player-hp-bar');
    const playerHpText = battleRoot.querySelector('#bmr-player-hp-text');
    const playerName = battleRoot.querySelector('#bmr-player-name');

    if (playerHpBar && playerHpText && playerName) {
      const hpPercent = (playerStats.currentHp / playerStats.HP) * 100;
      playerHpBar.style.width = `${Math.max(0, hpPercent)}%`;
      playerHpText.textContent = `${Math.ceil(playerStats.currentHp)}/${playerStats.HP}`;
      
      const hero = window.CharacterStatsSystem ? window.CharacterStatsSystem.getActiveHero() : null;
      playerName.textContent = hero ? hero.name.split(' ')[0].toUpperCase() : 'JUGADOR';
    }

    // Actualizar stats del jugador
    const playerStatsGrid = battleRoot.querySelector('#bmr-player-stats');
    if (playerStatsGrid) {
      playerStatsGrid.innerHTML = '';
      STAT_META.slice(0, 6).forEach(stat => {
        const statItem = document.createElement('div');
        statItem.className = 'bmr-stat-item';
        statItem.innerHTML = `<span class="bmr-stat-key">${stat.label}</span><br><span class="bmr-stat-val">${getStatDisplay(stat.key, playerStats[stat.key])}</span>`;
        playerStatsGrid.appendChild(statItem);
      });
    }

    // Actualizar enemigo
    const enemyHpBar = battleRoot.querySelector('#bmr-enemy-hp-bar');
    const enemyHpText = battleRoot.querySelector('#bmr-enemy-hp-text');
    const enemyName = battleRoot.querySelector('#bmr-enemy-name');

    if (enemyHpBar && enemyHpText && enemyName) {
      const hpPercent = (enemyStats.currentHp / enemyStats.HP) * 100;
      enemyHpBar.style.width = `${Math.max(0, hpPercent)}%`;
      enemyHpText.textContent = `${Math.ceil(enemyStats.currentHp)}/${enemyStats.HP}`;
      enemyName.textContent = 'ENEMIGO';
    }

    // Actualizar stats del enemigo
    const enemyStatsGrid = battleRoot.querySelector('#bmr-enemy-stats');
    if (enemyStatsGrid) {
      enemyStatsGrid.innerHTML = '';
      const enemyStatKeys = ['HP', 'ATK', 'DEF'];
      enemyStatKeys.forEach(key => {
        const statItem = document.createElement('div');
        statItem.className = 'bmr-stat-item';
        statItem.innerHTML = `<span class="bmr-stat-key">${key}</span><br><span class="bmr-stat-val">${Math.round(enemyStats[key])}</span>`;
        enemyStatsGrid.appendChild(statItem);
      });
    }
  }

  function getStatDisplay(statKey, value) {
    const stat = STAT_META.find(s => s.key === statKey);
    if (!stat) return Math.round(value);
    
    let display = stat.suffix === '%' ? Number(value || 0).toFixed(2) : Math.round(value);
    display += stat.suffix || '';
    return display;
  }

  function addLogEntry(text, type = 'neutral') {
    const log = battleRoot.querySelector('#bmr-battle-log');
    if (!log) return;

    const entry = document.createElement('div');
    entry.className = `bmr-log-entry bmr-log-${type}`;
    entry.textContent = text;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  function playerAttack() {
    if (battleState !== 'fighting') return;

    const attackBtn = battleRoot.querySelector('#bmr-attack-btn');
    if (attackBtn) attackBtn.disabled = true;

    // Calcular daño del jugador
    const playerAtk = playerStats.ATK || 100;
    const enemyDef = enemyStats.DEF || 10;
    const critChance = playerStats.CRT || 5;
    const critDamage = playerStats.CDMG || 50;

    let damage = Math.max(1, playerAtk - enemyDef * 0.5);
    let isCrit = Math.random() * 100 < critChance;

    if (isCrit) {
      damage *= (1 + critDamage / 100);
    }

    damage = Math.round(damage);
    enemyStats.currentHp = Math.max(0, enemyStats.currentHp - damage);

    addLogEntry(`Atacas y causas ${damage} de daño${isCrit ? ' ¡CRÍTICO!' : ''}`, isCrit ? 'crit' : 'player');
    updateBattleUI();

    // Verificar victoria
    if (enemyStats.currentHp <= 0) {
      setTimeout(() => handleVictory(), 500);
      return;
    }

    // Turno del enemigo
    setTimeout(() => enemyAttack(), 800);
  }

  function enemyAttack() {
    if (battleState !== 'fighting') return;

    // Calcular daño del enemigo
    const enemyAtk = enemyStats.ATK || 50;
    const playerDef = playerStats.DEF || 50;
    const evadeChance = playerStats.EVA || 5;

    // Verificar esquive
    if (Math.random() * 100 < evadeChance) {
      addLogEntry('¡Esquivaste el ataque!', 'player');
      endTurn();
      return;
    }

    let damage = Math.max(1, enemyAtk - playerDef * 0.5);
    damage = Math.round(damage);
    playerStats.currentHp = Math.max(0, playerStats.currentHp - damage);

    addLogEntry(`El enemigo ataca y causa ${damage} de daño`, 'enemy');
    updateBattleUI();

    // Verificar derrota
    if (playerStats.currentHp <= 0) {
      setTimeout(() => handleDefeat(), 500);
      return;
    }

    endTurn();
  }

  function endTurn() {
    const attackBtn = battleRoot.querySelector('#bmr-attack-btn');
    if (attackBtn) attackBtn.disabled = false;
  }

  function handleVictory() {
    battleState = 'victory';

    // Mostrar anuncio de PRÓXIMA RONDA
    const overlay = battleRoot.querySelector('#bmr-next-round-overlay');
    if (overlay) {
      overlay.classList.add('show');
    }

    addLogEntry('¡Victoria! Enemigo derrotado.', 'victory');

    // Otorgar recompensas
    if (window.GameState && typeof window.GameState.setGold === 'function') {
      const currentGold = window.GameState.getGold();
      window.GameState.setGold(currentGold + currentMission.gold);
      addLogEntry(`+${currentMission.gold} Oro`, 'victory');
    }

    if (window.HeroSystem && typeof window.HeroSystem.grantExperience === 'function') {
      window.HeroSystem.grantExperience(currentMission.xp);
      addLogEntry(`+${currentMission.xp} XP`, 'victory');
    } else if (window.CharacterStatsSystem && typeof window.CharacterStatsSystem.getActiveHero === 'function') {
      // Sistema alternativo de experiencia
      const hero = window.CharacterStatsSystem.getActiveHero();
      if (hero) {
        const newExp = hero.exp + currentMission.xp;
        const updatedHero = window.CharacterStatsSystem.buildHeroSnapshot(
          hero.characterId,
          hero.level,
          newExp,
          hero.rank
        );
        window.CharacterStatsSystem.setActiveHero(updatedHero);
        addLogEntry(`+${currentMission.xp} XP`, 'victory');
      }
    }

    // Ocultar anuncio después de 2 segundos y reiniciar batalla
    setTimeout(() => {
      if (overlay) {
        overlay.classList.remove('show');
      }

      // Reiniciar para farmeo
      battleRound++;
      enemyStats.currentHp = enemyStats.HP;
      playerStats.currentHp = playerStats.HP; // Curar jugador para siguiente ronda
      
      addLogEntry(`--- Ronda ${battleRound} ---`, 'neutral');
      updateBattleUI();
      
      battleState = 'fighting';
      const attackBtn = battleRoot.querySelector('#bmr-attack-btn');
      if (attackBtn) attackBtn.disabled = false;
    }, 2000);
  }

  function handleDefeat() {
    battleState = 'defeated';
    addLogEntry('Has sido derrotado...', 'defeat');

    // Deshabilitar botón de ataque permanentemente
    const attackBtn = battleRoot.querySelector('#bmr-attack-btn');
    if (attackBtn) {
      attackBtn.disabled = true;
      attackBtn.textContent = '☠️ DERROTADO';
    }

    // El jugador puede cancelar para salir
  }

  function cancelBattle() {
    // Regresar a la vista de misiones
    farmingMode = false;
    currentMission = null;
    battleState = 'idle';
    switchView('bmr-view-missions');
  }

  // Exponer sistema globalmente
  window.BattleRankDSystem = {
    mount,
    unmount,
    isMounted: () => isMounted
  };
})();
