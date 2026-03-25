(() => {
  const overlay = document.getElementById('section-overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const overlayClose = document.getElementById('overlayClose');
  const centerDefault = document.getElementById('centerDefault');

  const missionsData = {
    D: [
      { name: 'Eliminar lobos hambrientos', xp: 3, gold: 4, hp: 75, atk: 4, def: 2, lvl: 1 },
      { name: 'Recuperar suministros robados por goblins', xp: 5, gold: 8, hp: 315, atk: 13, def: 11, lvl: 3 },
      { name: 'Proteger la aldea de jabalíes', xp: 7, gold: 12, hp: 517, atk: 26, def: 24, lvl: 5 },
      { name: 'Investigar ruinas infestadas de ratas gigantes', xp: 9, gold: 16, hp: 720, atk: 44, def: 42, lvl: 7 },
      { name: 'Escoltar a un mercader (bandido)', xp: 12, gold: 18, hp: 930, atk: 69, def: 67, lvl: 9 },
      { name: 'Cazar una bestia nocturna', xp: 15, gold: 20, hp: 1200, atk: 111, def: 107, lvl: 12 },
    ],
    C: [
      { name: 'Limpiar una mina de murciélagos vampíricos', xp: 12, gold: 24, hp: 1455, atk: 158, def: 154, lvl: 14 },
      { name: 'Derrotar a un grupo de orcos merodeadores', xp: 14, gold: 28, hp: 1710, atk: 220, def: 208, lvl: 16 },
      { name: 'Rescatar a un rehén de los bandidos', xp: 16, gold: 32, hp: 2050, atk: 297, def: 285, lvl: 18 },
      { name: 'Eliminar una amenaza de lobos de las nieves', xp: 18, gold: 36, hp: 2400, atk: 391, def: 379, lvl: 20 },
      { name: 'Recuperar un artefacto custodiado por esqueletos', xp: 19, gold: 38, hp: 2800, atk: 501, def: 489, lvl: 22 },
      { name: 'Acabar con un troll de las colinas', xp: 20, gold: 40, hp: 3050, atk: 577, def: 565, lvl: 24 },
    ],
    B: [
      { name: 'Exterminar una colonia de arácnidos gigantes', xp: 22, gold: 44, hp: 498, atk: 201, def: 127, lvl: 28 },
      { name: 'Detener a un invocador de demonios menores', xp: 24, gold: 48, hp: 534, atk: 219, def: 138, lvl: 32 },
      { name: 'Proteger una ciudad de ataque de grifos salvajes', xp: 26, gold: 52, hp: 570, atk: 237, def: 149, lvl: 36 },
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
  const missionRanks = ['D', 'C', 'B', 'A', 'S'];
  const missionState = {
    step: 'root',
    currentRank: null,
    missionList: [],
    enemyIndex: 0,
    enemy: null,
    battleInterval: null,
    battleActive: false,
  };
  let missionDelegatedBound = false;
  let navigationBound = false;

  function spawnParticles(x, y, type = 'chakra') {
    const container = document.getElementById('particleContainer');
    const count = type === 'smoke' ? 6 : 10;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = `particle ${type}`;

      const size = type === 'smoke'
        ? Math.random() * 18 + 10
        : Math.random() * 5 + 2;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${x - size / 2}px; top:${y - size / 2}px;
        --tx:${tx}px; --ty:${ty}px;
        animation-delay:${Math.random() * .1}s;
        animation-duration:${Math.random() * .4 + .5}s;
      `;
      container.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  function spawnFloatText(x, y, text, color = '#2ecfcf') {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.cssText = `left:${x - 30}px; top:${y - 20}px; color:${color};`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  function updateBars(state) {
    const hpPct = state.hpMax > 0 ? Math.round(state.hp / state.hpMax * 100) : 0;
    const mpPct = state.mpMax > 0 ? Math.round(state.mp / state.mpMax * 100) : 0;
    const expPct = state.expMax > 0 ? Math.round(state.exp / state.expMax * 100) : 0;

    document.getElementById('hpFill').style.width = hpPct + '%';
    document.getElementById('mpFill').style.width = mpPct + '%';
    document.getElementById('expFill').style.width = expPct + '%';

    document.getElementById('hpCur').textContent = state.hp;
    document.getElementById('hpMax').textContent = state.hpMax;
    document.getElementById('hpPct').textContent = hpPct + '%';
    document.getElementById('mpCur').textContent = state.mp;
    document.getElementById('mpMax').textContent = state.mpMax;
    document.getElementById('mpPct').textContent = mpPct + '%';
    const levelNode = document.getElementById('levelValue');
    if (levelNode) levelNode.textContent = state.level;
    document.getElementById('expNext').textContent =
      `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${Math.max(0, state.expMax - state.exp).toLocaleString()}`;
    document.getElementById('statGold').textContent = state.gold.toLocaleString();

    const fill = document.getElementById('hpFill');
    fill.style.background = hpPct < 25
      ? 'linear-gradient(90deg,#7a1a1a,#c93b3b)'
      : 'linear-gradient(90deg,#2d9e55,#5de68c)';

  }

  function bindNavigation(state, sections) {
    if (navigationBound) return;
    navigationBound = true;

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        spawnParticles(cx, cy, 'smoke');
        spawnParticles(cx, cy, 'chakra');

        const sec = btn.dataset.section;
        const labels = {
          heroe: 'HÉROE',
          misiones: 'MISIONES',
          clanes: 'CLANES',
          eventos: 'EVENTOS',
          jutsus: 'JUTSUS',
          batallas: 'BATALLAS',
          invocaciones: 'INVOCAR',
          habilidades: 'ÁRBOL',
          ajustes: 'AJUSTES'
        };

        spawnFloatText(cx, cy, '▶ ' + (labels[sec] || sec), '#e8923a');

        document.querySelectorAll('.nav-btn').forEach(button => button.classList.remove('active'));
        btn.classList.add('active');
        state.activeSection = sec;

        const info = sections[sec];
        if (sec !== 'misiones') {
          stopMissionBattle();
        }

        if (sec === 'heroe') {
          overlay.classList.remove('visible');
          if (window.equipUI) window.equipUI.showHeroSection(true);
          if (window.updateUI) window.updateUI();
          return;
        }

        if (window.equipUI) window.equipUI.showHeroSection(false);
        if (sec === 'misiones') {
          overlay.classList.remove('visible');
          renderMissionRoot();
          return;
        }

        if (info) {
          overlayTitle.innerHTML = `${info.icon} ${info.title}`;
          overlayDesc.textContent = info.desc;
          overlay.classList.add('visible');
        }
      });
    });

    overlayClose.addEventListener('click', () => {
      overlay.classList.remove('visible');
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      spawnParticles(cx, cy, 'amber-spark');
    });
  }

  function clearCenterPanel() {
    if (!centerDefault) return;
    centerDefault.innerHTML = '';
  }

  function missionEnemyEmoji(name = '') {
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

  function addBattleLog(message) {
    const log = document.getElementById('missionBattleLog');
    if (!log) return;
    const row = document.createElement('div');
    row.className = 'mission-battle-log-row';
    row.textContent = message;
    log.prepend(row);
    if (log.children.length > 15) log.lastChild.remove();
  }

  function updateBattleBars(state) {
    const php = state.hpMax > 0 ? Math.max(0, Math.round((state.hp / state.hpMax) * 100)) : 0;
    const ehp = missionState.enemy && missionState.enemy.maxHp > 0
      ? Math.max(0, Math.round((missionState.enemy.hp / missionState.enemy.maxHp) * 100))
      : 0;
    const p = document.getElementById('missionPlayerHp');
    const e = document.getElementById('missionEnemyHp');
    if (p) p.style.width = `${php}%`;
    if (e) e.style.width = `${ehp}%`;
  }

  function loadMissionEnemy() {
    const mission = missionState.missionList[missionState.enemyIndex];
    missionState.enemy = {
      name: mission.name,
      hp: mission.hp,
      maxHp: mission.hp,
      atk: mission.atk,
      def: mission.def,
      xp: mission.xp,
      gold: mission.gold,
    };
    const emoji = document.getElementById('missionEnemyEmoji');
    if (emoji) emoji.textContent = missionEnemyEmoji(mission.name);
    const nameEl = document.getElementById('missionEnemyName');
    if (nameEl) nameEl.textContent = mission.name;
  }

  function stopMissionBattle() {
    if (missionState.battleInterval) {
      clearInterval(missionState.battleInterval);
      missionState.battleInterval = null;
    }
    missionState.battleActive = false;
  }

  function renderMissionRoot() {
    missionState.step = 'root';
    stopMissionBattle();
    clearCenterPanel();
    centerDefault.innerHTML = `
      <div class="missions-panel">
        <button class="missions-menu-btn" data-mission-action="open-ranks">⚔️ MISIONES RANGO ⚔️</button>
      </div>
    `;
  }

  function renderRankList() {
    missionState.step = 'ranks';
    stopMissionBattle();
    clearCenterPanel();
    centerDefault.innerHTML = `
      <div class="missions-panel">
        ${missionRanks.map((rank) => `<button class="missions-menu-btn rank-${rank.toLowerCase()}" data-mission-action="open-rank" data-rank="${rank}">MISION RANGO ${rank}</button>`).join('')}
        <button class="missions-back-btn" data-mission-action="back-root">⬅️ Volver</button>
      </div>
    `;
  }

  function renderMissionList(rank, state) {
    missionState.step = 'list';
    missionState.currentRank = rank;
    stopMissionBattle();
    clearCenterPanel();
    const missions = missionsData[rank] || [];
    const cards = missions.map((mission, index) => {
      const locked = state.level < mission.lvl;
      return `
        <button class="mission-row mission-rank-${rank.toLowerCase()} ${locked ? 'locked' : ''}" data-mission-action="start-mission" data-rank="${rank}" data-index="${index}" ${locked ? 'disabled' : ''}>
          <span class="mission-row-title">${mission.name}</span>
          <span class="mission-row-meta">Nv min ${mission.lvl} • XP ${mission.xp} • Oro ${mission.gold}</span>
          <span class="mission-row-meta">HP ${mission.hp} • ATK ${mission.atk} • DEF ${mission.def}</span>
        </button>
      `;
    }).join('');

    centerDefault.innerHTML = `
      <div class="missions-panel">
        <div class="missions-title">RANGO ${rank}</div>
        ${cards}
        <button class="missions-back-btn" data-mission-action="back-ranks">⬅️ Volver a rangos</button>
      </div>
    `;
  }

  function renderMissionBattle(state, rank, missionIndex) {
    stopMissionBattle();
    missionState.step = 'battle';
    missionState.currentRank = rank;
    missionState.missionList = missionsData[rank] || [];
    missionState.enemyIndex = missionIndex;
    state.hp = state.hpMax;
    state.mp = state.mpMax;
    loadMissionEnemy();
    clearCenterPanel();
    centerDefault.innerHTML = `
      <div class="missions-panel mission-battle">
        <div class="mission-battle-head">
          <div class="battle-card">
            <div class="battle-emoji">🥷</div>
            <div class="battle-name">Shinobi</div>
            <div class="battle-hp-track"><div id="missionPlayerHp" class="battle-hp-fill"></div></div>
          </div>
          <div class="battle-card enemy">
            <div class="battle-emoji" id="missionEnemyEmoji">👹</div>
            <div class="battle-name" id="missionEnemyName">Enemigo</div>
            <div class="battle-hp-track"><div id="missionEnemyHp" class="battle-hp-fill enemy"></div></div>
          </div>
        </div>
        <div id="missionBattleLog" class="mission-battle-log"></div>
        <button class="missions-stop-btn" data-mission-action="stop-battle">⏹️ DETENER</button>
      </div>
    `;
    updateBattleBars(state);
    missionState.battleActive = true;
    addBattleLog('⚔️ Comienza la misión.');

    missionState.battleInterval = setInterval(() => {
      if (!missionState.battleActive || !missionState.enemy) return;

      if (state.hp > 0 && missionState.enemy.hp > 0) {
        const dealt = Math.max(1, Math.floor(state.atk - (missionState.enemy.def / 3) + (Math.random() * 8)));
        missionState.enemy.hp = Math.max(0, missionState.enemy.hp - dealt);
        addBattleLog(`🥷 Atacas y causas ${dealt} daño.`);
        updateBattleBars(state);

        if (missionState.enemy.hp <= 0) {
          addBattleLog(`💀 Enemigo derrotado: +${missionState.enemy.xp} XP y +${missionState.enemy.gold} Oro.`);
          state.gold += missionState.enemy.gold;
          if (window.gameEngine && window.gameEngine.addExperience) {
            window.gameEngine.addExperience(missionState.enemy.xp);
          }
          if (window.updateUI) window.updateUI();
          missionState.enemyIndex = (missionState.enemyIndex + 1) % missionState.missionList.length;
          loadMissionEnemy();
          addBattleLog(`⚔️ Nuevo enemigo: ${missionState.enemy.name}`);
        }
      }

      if (state.hp > 0 && missionState.enemy.hp > 0) {
        const received = Math.max(1, Math.floor(missionState.enemy.atk - (state.def / 3) + (Math.random() * 6)));
        state.hp = Math.max(0, state.hp - received);
        addBattleLog(`👹 ${missionState.enemy.name} te golpea por ${received}.`);
        if (window.updateUI) window.updateUI();
        updateBattleBars(state);

        if (state.hp <= 0) {
          addBattleLog('😵 Has sido derrotado.');
          stopMissionBattle();
        }
      }
    }, 700);
  }

  function bindMissionDelegation(state) {
    if (!centerDefault || missionDelegatedBound) return;
    missionDelegatedBound = true;

    centerDefault.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-mission-action]');
      if (!trigger) return;
      const action = trigger.dataset.missionAction;

      if (action === 'open-ranks') return renderRankList();
      if (action === 'back-root') return renderMissionRoot();
      if (action === 'open-rank') return renderMissionList(trigger.dataset.rank, state);
      if (action === 'back-ranks') return renderRankList();
      if (action === 'stop-battle') return renderMissionList(missionState.currentRank, state);
      if (action === 'start-mission') {
        const rank = trigger.dataset.rank;
        const index = Number(trigger.dataset.index || 0);
        renderMissionBattle(state, rank, index);
      }
    });
  }

  window.gameUI = {
    bindNavigation,
    spawnFloatText,
    spawnParticles,
    updateBars,
    bindMissionDelegation,
    stopMissionBattle,
  };
})();
