(function () {
  const missionsData = {
    D: [
      { name: 'Eliminar lobos hambrientos', xp: 8, gold: 12, hp: 98, atk: 10, def: 5, lvl: 1 },
      { name: 'Recuperar suministros robados por goblins', xp: 14, gold: 15, hp: 155, atk: 17, def: 7, lvl: 3 },
      { name: 'Proteger la aldea de jabalíes', xp: 20, gold: 22, hp: 215, atk: 25, def: 9, lvl: 5 },
      { name: 'Investigar ruinas infestadas de ratas gigantes', xp: 27, gold: 31, hp: 278, atk: 33, def: 15, lvl: 7 },
      { name: 'Escoltar a un mercader (bandido)', xp: 35, gold: 50, hp: 335, atk: 45, def: 23, lvl: 9 },
      { name: 'Cazar una bestia nocturna', xp: 45, gold: 75, hp: 425, atk: 60, def: 37, lvl: 12 }
    ],
    C: [
      { name: 'Limpiar una mina de murciélagos vampíricos', xp: 12, gold: 24, hp: 318, atk: 113, def: 72, lvl: 14 },
      { name: 'Derrotar a un grupo de orcos merodeadores', xp: 14, gold: 28, hp: 354, atk: 131, def: 83, lvl: 16 },
      { name: 'Rescatar a un rehén de los bandidos', xp: 16, gold: 32, hp: 390, atk: 149, def: 94, lvl: 18 },
      { name: 'Eliminar una amenaza de lobos de las nieves', xp: 18, gold: 36, hp: 426, atk: 166, def: 105, lvl: 20 },
      { name: 'Recuperar un artefacto custodiado por esqueletos', xp: 19, gold: 38, hp: 444, atk: 175, def: 110, lvl: 22 },
      { name: 'Acabar con un troll de las colinas', xp: 20, gold: 40, hp: 462, atk: 184, def: 116, lvl: 24 }
    ],
    B: [
      { name: 'Exterminar una colonia de arácnidos gigantes', xp: 22, gold: 44, hp: 498, atk: 201, def: 127, lvl: 28 },
      { name: 'Detener a un invoca demonios menores', xp: 24, gold: 48, hp: 534, atk: 219, def: 138, lvl: 32 },
      { name: 'Proteger una Ciudad de ataque de grifos salvajes', xp: 26, gold: 52, hp: 570, atk: 237, def: 149, lvl: 36 },
      { name: 'Investigar desapariciones en un bosque encantado', xp: 28, gold: 56, hp: 606, atk: 254, def: 160, lvl: 40 },
      { name: 'Derrotar a un caballero oscuro errante', xp: 29, gold: 58, hp: 624, atk: 263, def: 165, lvl: 45 },
      { name: 'Asaltar una fortaleza de ogros', xp: 30, gold: 60, hp: 642, atk: 272, def: 171, lvl: 50 }
    ],
    A: [
      { name: 'Eliminar a un dragón joven', xp: 32, gold: 64, hp: 678, atk: 289, def: 182, lvl: 55 },
      { name: 'Infiltrarse en una base de asesinos', xp: 34, gold: 68, hp: 714, atk: 307, def: 193, lvl: 50 },
      { name: 'Proteger una ciudad de un ataque.', xp: 36, gold: 72, hp: 750, atk: 325, def: 204, lvl: 55 },
      { name: 'Recuperar un tesoro de una tumba maldita', xp: 38, gold: 76, hp: 786, atk: 342, def: 215, lvl: 60 },
      { name: 'Derrotar a un guerrero legendario', xp: 39, gold: 78, hp: 804, atk: 351, def: 220, lvl: 65 },
      { name: 'Acabar con un demonio de las sombras', xp: 40, gold: 80, hp: 822, atk: 360, def: 226, lvl: 70 }
    ],
    S: [
      { name: 'Enfrentar a un dragón adulto', xp: 50, gold: 100, hp: 1002, atk: 448, def: 281, lvl: 75 },
      { name: 'Derrotar a un señor demonio menor', xp: 60, gold: 120, hp: 1182, atk: 536, def: 336, lvl: 80 },
      { name: 'Salvar el reino de un lich', xp: 70, gold: 140, hp: 1362, atk: 624, def: 391, lvl: 85 },
      { name: 'Enfrentar a un titán antiguo', xp: 80, gold: 160, hp: 1542, atk: 712, def: 446, lvl: 90 },
      { name: 'Combatir a un dios olvidado', xp: 90, gold: 180, hp: 1722, atk: 800, def: 501, lvl: 95 },
      { name: 'Derrotar al dragón anciano', xp: 100, gold: 200, hp: 1902, atk: 808, def: 556, lvl: 100 }
    ]
  };

  const battleMarkup = `
<div class="ms-rangod-battle-root" data-battle-rangod-autostart>
  <div id="game-container">
    <div class="parallax-sky" id="layer-sky"></div>
    <div class="parallax-mountains" id="layer-mountains"></div>
    <div class="parallax-trees-back" id="layer-trees-back"></div>
    <div class="parallax-trees-front" id="layer-trees-front"></div>
    <div class="parallax-ground" id="layer-ground"></div>
    <div class="parallax-dust" id="layer-dust"></div>
    <div class="parallax-grass" id="layer-grass"></div>
    <div id="encounter-flash"></div>
    <div id="notification"></div>
    <div id="enemy-preload-status" class="enemy-preload-status">
      <div class="enemy-preload-title">Precargando enemigo...</div>
      <div class="enemy-preload-bar-bg"><div id="enemy-preload-bar" class="enemy-preload-bar"></div></div>
      <div id="enemy-preload-text" class="enemy-preload-text">0%</div>
    </div>

    <div id="player" class="idle">
      <div class="ninja-head"></div><div class="ninja-body"></div><div class="ninja-scarf"></div>
      <div class="ninja-arms left"></div><div class="ninja-arms right"></div><div class="ninja-kunai"></div>
      <div class="ninja-legs left"></div><div class="ninja-legs right"></div>
    </div>

    <div id="enemy">
      <div class="enemy-horns"></div><div class="enemy-head"></div><div class="enemy-body"></div>
      <div class="enemy-arms left"></div><div class="enemy-arms right"></div><div class="enemy-sword"></div>
      <div class="enemy-legs left"></div><div class="enemy-legs right"></div>
    </div>

    <div id="ui-top">
      <span id="progress-label">Misión</span>
      <div id="progress-bar-container">
        <div class="trigger-marker" style="left:30%"></div>
        <div class="trigger-marker" style="left:60%"></div>
        <div class="trigger-marker" style="left:90%"></div>
        <div id="progress-bar"></div>
      </div>
      <span id="progress-text">0%</span>
    </div>

    <div id="combat-log"></div>

    <div id="sub-skills">
      <button class="sub-skill-slot fire" onclick="game.useSubSkill('fire')" title="Bola de Fuego — 25 DMG"><span class="sub-icon">🔥</span><span class="sub-name">Fuego</span></button>
      <button class="sub-skill-slot water" onclick="game.useSubSkill('water')" title="Torbellino — 20 DMG"><span class="sub-icon">🌊</span><span class="sub-name">Agua</span></button>
      <button class="sub-skill-slot wind" onclick="game.useSubSkill('wind')" title="Corte Viento — 15 DMG"><span class="sub-icon">🌪</span><span class="sub-name">Viento</span></button>
    </div>

    <div id="combat-panel">
      <!--
        Layout update (Rango D):
        Conservamos player-stats e IDs internos para no romper hooks JS de actualización,
        pero su visualización se controla por CSS para que no aparezca en el panel.
      -->
      <div id="player-stats">
        <div class="stat-bar"><span class="stat-label">HP</span><div class="stat-bar-bg"><div id="hp-player-bar" class="stat-bar-fill hp"></div></div><span id="hp-player-text" class="stat-text">100/100</span></div>
        <div class="stat-bar"><span class="stat-label">MP</span><div class="stat-bar-bg"><div id="mp-player-bar" class="stat-bar-fill mp"></div></div><span id="mp-player-text" class="stat-text">50/50</span></div>
      </div>
      <div id="action-buttons">
        <button class="skill-btn attack-btn" onclick="game.useAttack()" title="Ataque básico"><span class="skill-icon">⚔️</span><span class="skill-name">Ataque</span></button>
        <button class="skill-btn skill-type-btn" onclick="game.toggleSubSkills()" title="Ver habilidades especiales"><span class="skill-icon">✨</span><span class="skill-name">Skills</span></button>
        <button class="skill-btn auto-btn" id="auto-btn" onclick="game.toggleAuto()" title="Modo automático"><span class="skill-icon">❎</span><span class="skill-name">Auto</span></button>
      </div>
      <div id="enemy-stats">
        <div class="stat-bar"><span id="hp-enemy-text" class="stat-text">80/80</span><div class="stat-bar-bg"><div id="hp-enemy-bar" class="stat-bar-fill hp"></div></div><span class="stat-label">HP</span></div>
        <div class="stat-bar"><span id="mp-enemy-text" class="stat-text">30/30</span><div class="stat-bar-bg"><div id="mp-enemy-bar" class="stat-bar-fill mp"></div></div><span class="stat-label">MP</span></div>
      </div>
    </div>

    <div class="victory-particles" id="victory-particles"></div>

    <div id="mission-complete">
      <h2>¡MISIÓN COMPLETA!</h2>
      <p>Has derrotado a todos los enemigos</p>
      <button id="restart-btn">Reiniciar</button>
    </div>
  </div>
</div>`;

  const MissionSystem = {
    host: null,
    root: null,
    currentView: 'ms-view-main',
    heroLevel: 1,
    currentRank: null,
    battleGame: null,
    currentMission: null,
    pendingSnapshot: null,

    mount() {
      if (this.isMounted()) return;
      this.host = document.getElementById('hero-system-host');
      if (!this.host) return;

      const tpl = document.getElementById('missionSystemTemplate');
      if (!tpl) return;

      const fragment = tpl.content.cloneNode(true);
      this.host.innerHTML = '';
      this.host.appendChild(fragment);
      this.root = this.host.querySelector('#ms-game-container');
      this.bindEvents();
      this.resetToMain();
      if (this.pendingSnapshot) {
        this.applySnapshot(this.pendingSnapshot);
        this.pendingSnapshot = null;
      }
    },

    unmount() {
      this.destroyBattle();
      if (!this.host) return;
      this.host.innerHTML = '';
      this.root = null;
      this.currentView = 'ms-view-main';
      this.currentRank = null;
      this.currentMission = null;
    },

    isMounted() {
      return Boolean(this.host && this.root && this.host.contains(this.root));
    },

    setHeroLevel(level) {
      this.heroLevel = Math.max(1, Number(level) || 1);
      if (this.isMounted() && this.currentView === 'ms-view-missions' && this.currentRank) {
        this.showMissions(this.currentRank);
      }
    },

    bindEvents() {
      const onClick = (selector, handler) => {
        const el = this.root.querySelector(selector);
        if (el) el.addEventListener('click', handler);
      };

      onClick('#ms-openMissionsBtn', () => this.showRanks());
      onClick('#ms-backToMainBtn', () => this.goBack('ms-view-main'));
      onClick('#ms-backToRanksBtn', () => this.goBack('ms-view-ranks'));
      onClick('#ms-closeVictoryBtn', () => this.closeVictory());

      this.root.querySelectorAll('.ms-rank-btn').forEach((btn) => {
        btn.addEventListener('click', () => this.showMissions(btn.dataset.rank));
      });
    },

    switchView(fromId, toId, direction) {
      const fromEl = this.root.querySelector(`#${fromId}`);
      const toEl = this.root.querySelector(`#${toId}`);
      if (!fromEl || !toEl) return;

      if (direction === 'forward') {
        fromEl.style.transform = 'translateX(-100%)';
      } else {
        fromEl.style.transform = 'translateX(100%)';
      }
      fromEl.style.opacity = '0';
      fromEl.classList.remove('active');
      fromEl.style.pointerEvents = 'none';

      toEl.style.transform = 'translateX(0)';
      toEl.style.opacity = '1';
      toEl.classList.add('active');
      toEl.style.pointerEvents = 'all';

      this.currentView = toId;
      this.spawnParticles(toEl);
    },

    showRanks() {
      this.switchView('ms-view-main', 'ms-view-ranks', 'forward');
    },

    showMissions(rank) {
      this.currentRank = rank;
      const container = this.root.querySelector('#ms-missions-scroll');
      if (!container) return;

      const data = missionsData[rank] || [];
      container.innerHTML = '';

      data.forEach((mission, i) => {
        const locked = this.heroLevel < mission.lvl;
        const card = document.createElement('div');
        card.className = `ms-mission-card${locked ? ' locked' : ''}`;
        card.dataset.missionIndex = String(i);
        card.dataset.missionRank = rank;
        if (!locked) {
          card.classList.add('selectable');
          card.tabIndex = 0;
          card.setAttribute('role', 'button');
          card.setAttribute('aria-label', `Iniciar misión: ${mission.name}`);
        }
        card.innerHTML = `
          <div class="ms-mission-name">⚔️ ${mission.name}</div>
          <div class="ms-mission-body">
            <div class="ms-mission-rewards">
              <span class="ms-xp">✨ ${mission.xp} XP</span>
              <span class="ms-gold">💰 ${mission.gold} Oro</span>
            </div>
            <div class="ms-mission-enemy">
              <span class="ms-hp">❤️ HP: ${mission.hp}</span>
              <span class="ms-atk">⚔️ ATK: ${mission.atk}</span>
              <span class="ms-def">🛡️ DEF: ${mission.def}</span>
            </div>
          </div>
          <div class="ms-mission-lock ${!locked ? 'unlocked' : ''}">
            ${locked ? `🔒 Nivel ${mission.lvl} requerido` : '✅ Desbloqueado'}
          </div>
        `;

        if (!locked) {
          card.addEventListener('click', () => this.startFight(i, rank, card));
          card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            this.startFight(i, rank, card);
          });
        }

        card.style.opacity = '0';
        card.style.transform = 'translateY(8px)';
        container.appendChild(card);

        setTimeout(() => {
          card.style.transition = 'opacity .25s ease, transform .25s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50 * i);
      });

      this.switchView('ms-view-ranks', 'ms-view-missions', 'forward');
    },

    async startFight(index, rank, cardEl) {
      const mission = missionsData[rank]?.[index];
      if (!mission) return;
      this.currentMission = { rank, index, name: mission.name };
      const card = cardEl?.closest ? cardEl.closest('.ms-mission-card') : cardEl;
      if (!card) return;

      card.classList.add('ms-combat-flash');
      setTimeout(() => card.classList.remove('ms-combat-flash'), 600);

      if (rank === 'D' && typeof window.initBattleRangoD === 'function') {
        await this.showBattleRunner(mission, { rank, index });
        return;
      }

      this.grantMissionRewards(mission);
      const popup = this.root.querySelector('#ms-victoryPopup');
      const info = this.root.querySelector('#ms-victoryInfo');
      const rewards = this.root.querySelector('#ms-victoryRewards');
      if (info) info.textContent = `Misión: ${mission.name}`;
      if (rewards) {
        rewards.innerHTML = `<span style="color:#34d399">+${mission.xp} XP</span> &nbsp;|&nbsp; <span style="color:#fbbf24">+${mission.gold} Oro</span>`;
      }
      if (popup) popup.classList.add('show');
    },

    async showBattleRunner(mission, missionContext = {}) {
      const host = this.root.querySelector('#ms-rangod-battle-host');
      if (!host) return;

      this.destroyBattle();
      host.innerHTML = battleMarkup;
      const battleRoot = host.querySelector('.ms-rangod-battle-root');
      if (!battleRoot) return;
      const preloadStatus = battleRoot.querySelector('#enemy-preload-status');
      const preloadBar = battleRoot.querySelector('#enemy-preload-bar');
      const preloadText = battleRoot.querySelector('#enemy-preload-text');

      let enemyVisualConfig = null;
      if (window.EnemySpritesManager && typeof window.EnemySpritesManager.preloadMissionEnemies === 'function') {
        try {
          await window.EnemySpritesManager.preloadMissionEnemies(
            missionContext.rank,
            [missionContext.index],
            (progress) => {
              const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 100;
              if (preloadBar) preloadBar.style.width = `${pct}%`;
              if (preloadText) preloadText.textContent = `${pct}%`;
            }
          );
          enemyVisualConfig = window.EnemySpritesManager.resolveMissionEnemyVisual(
            missionContext.rank,
            missionContext.index
          );
        } catch (error) {
          enemyVisualConfig = window.EnemySpritesManager.getFallbackSprite();
          if (preloadText) preloadText.textContent = 'Error de precarga (fallback activo)';
        }
      }

      this.battleGame = window.initBattleRangoD(battleRoot, {
        missionContext: {
          rank: missionContext.rank,
          index: missionContext.index,
          name: mission.name
        },
        missionConfig: {
          hp: mission.hp,
          atk: mission.atk,
          def: mission.def,
          mp: Math.max(10, Math.floor(mission.hp * 0.2)),
          name: mission.name
        },
        enemyVisualConfig,
        onEnemyDefeated: () => this.grantMissionRewards(mission)
      });
      if (preloadStatus) preloadStatus.classList.add('hidden');

      this.switchView('ms-view-missions', 'ms-view-battle', 'forward');
    },

    destroyBattle() {
      if (this.battleGame && typeof this.battleGame.destroy === 'function') {
        this.battleGame.destroy();
      }
      this.battleGame = null;
      if (window.game) {
        window.game = null;
      }
      const host = this.root?.querySelector('#ms-rangod-battle-host');
      if (host) host.innerHTML = '';
    },

    getSnapshot() {
      return {
        currentView: this.currentView,
        currentRank: this.currentRank,
        heroLevel: this.heroLevel,
        isBattleActive: this.currentView === 'ms-view-battle' && Boolean(this.battleGame),
        currentMission: this.currentMission
          ? { ...this.currentMission }
          : { rank: '', index: -1, name: '' }
      };
    },

    applySnapshot(snapshot = {}) {
      if (!snapshot || typeof snapshot !== 'object') return;
      if (!this.isMounted()) {
        this.pendingSnapshot = snapshot;
        return;
      }

      this.heroLevel = Math.max(1, Number(snapshot.heroLevel) || 1);
      this.currentRank = snapshot.currentRank || null;
      const mission = snapshot.currentMission || {};
      this.currentMission = {
        rank: mission.rank || '',
        index: Number.isFinite(Number(mission.index)) ? Number(mission.index) : -1,
        name: mission.name || ''
      };

      if (this.currentRank) {
        this.showMissions(this.currentRank);
        return;
      }
      if (snapshot.currentView === 'ms-view-ranks') {
        this.showRanks();
        return;
      }
      this.resetToMain();
    },

    grantMissionRewards(mission) {
      if (!mission) return;
      if (window.HeroSystem && typeof window.HeroSystem.grantMissionRewards === 'function') {
        window.HeroSystem.grantMissionRewards({
          exp: mission.xp,
          gold: mission.gold
        });
        return;
      }
      if (window.HeroSystem && typeof window.HeroSystem.grantExperience === 'function') {
        window.HeroSystem.grantExperience(mission.xp);
      }
      if (window.GameState && typeof window.GameState.getGold === 'function' && typeof window.GameState.setGold === 'function') {
        window.GameState.setGold(window.GameState.getGold() + mission.gold);
      }
    },

    closeVictory() {
      const popup = this.root?.querySelector('#ms-victoryPopup');
      if (popup) popup.classList.remove('show');
    },

    goBack(target) {
      if (target === 'ms-view-main') {
        this.switchView('ms-view-ranks', 'ms-view-main', 'back');
      } else if (target === 'ms-view-ranks') {
        this.switchView('ms-view-missions', 'ms-view-ranks', 'back');
      } else if (target === 'ms-view-missions' && this.currentView === 'ms-view-battle') {
        this.destroyBattle();
        this.switchView('ms-view-battle', 'ms-view-missions', 'back');
      }
    },

    resetToMain() {
      const views = ['ms-view-main', 'ms-view-ranks', 'ms-view-missions', 'ms-view-battle'];
      views.forEach((id) => {
        const view = this.root?.querySelector(`#${id}`);
        if (!view) return;
        view.classList.remove('active');
        view.style.opacity = '0';
        view.style.transform = 'translateX(100%)';
        view.style.pointerEvents = 'none';
      });

      const main = this.root?.querySelector('#ms-view-main');
      if (!main) return;
      main.classList.add('active');
      main.style.opacity = '1';
      main.style.transform = 'translateX(0)';
      main.style.pointerEvents = 'all';
      this.currentView = 'ms-view-main';
      this.currentMission = null;
    },

    spawnParticles(el) {
      const colors = ['#60a5fa', '#fbbf24', '#34d399', '#a78bfa', '#f87171'];
      for (let i = 0; i < 10; i += 1) {
        const p = document.createElement('div');
        p.className = 'ms-particle';
        p.style.left = `${10 + Math.random() * 80}%`;
        p.style.top = `${30 + Math.random() * 40}%`;
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = `${1.2 + Math.random()}s`;
        p.style.animationDelay = `${Math.random() * 0.3}s`;
        el.appendChild(p);
        setTimeout(() => p.remove(), 2200);
      }
    }
  };

  window.MissionSystem = MissionSystem;
})();
