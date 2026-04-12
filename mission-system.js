(function () {
  const missionsData = {
    D: [
      { name: 'Eliminar lobos hambrientos', xp: 2, gold: 4, hp: 138, atk: 25, def: 17, lvl: 1 },
      { name: 'Recuperar suministros robados por goblins', xp: 4, gold: 8, hp: 174, atk: 43, def: 28, lvl: 3 },
      { name: 'Proteger la aldea de jabalíes', xp: 6, gold: 12, hp: 210, atk: 61, def: 39, lvl: 5 },
      { name: 'Investigar ruinas infestadas de ratas gigantes', xp: 8, gold: 16, hp: 246, atk: 78, def: 50, lvl: 7 },
      { name: 'Escoltar a un mercader (bandido)', xp: 9, gold: 18, hp: 264, atk: 87, def: 55, lvl: 9 },
      { name: 'Cazar una bestia nocturna', xp: 10, gold: 20, hp: 282, atk: 96, def: 61, lvl: 12 }
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

  const MissionSystem = {
    host: null,
    root: null,
    currentView: 'ms-view-main',
    heroLevel: 1,
    currentRank: null,
    activeBattle: null,

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
    },

    unmount() {
      if (!this.host) return;
      this.host.innerHTML = '';
      if (window.MissionBattleSystem && typeof window.MissionBattleSystem.unmount === 'function') {
        window.MissionBattleSystem.unmount();
      }
      this.root = null;
      this.currentView = 'ms-view-main';
      this.currentRank = null;
      this.activeBattle = null;
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
      onClick('#ms-backToMissionsBtn', () => this.goBack('ms-view-missions'));
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
        card.innerHTML = `
          <div class="ms-mission-name">⚔️ ${mission.name}</div>
          <button class="ms-fight-btn" ${locked ? 'disabled' : ''}>⚔️ LUCHAR</button>
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

        const fightBtn = card.querySelector('.ms-fight-btn');
        if (fightBtn) {
          fightBtn.addEventListener('click', () => this.startFight(i, rank, fightBtn));
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

    startFight(index, rank, btnEl) {
      const mission = missionsData[rank]?.[index];
      if (!mission) return;
      const card = btnEl.closest('.ms-mission-card');
      if (!card) return;

      card.classList.add('ms-combat-flash');
      setTimeout(() => card.classList.remove('ms-combat-flash'), 600);

      if (rank === 'D' && window.MissionBattleSystem) {
        this.openBattle(mission, rank, index);
        return;
      }

      this.applyRewardsAndPopup(mission);
    },

    applyRewardsAndPopup(mission) {
      if (window.HeroSystem && typeof window.HeroSystem.grantExperience === 'function') {
        window.HeroSystem.grantExperience(mission.xp);
      }
      if (window.GameState && typeof window.GameState.getGold === 'function' && typeof window.GameState.setGold === 'function') {
        window.GameState.setGold(window.GameState.getGold() + mission.gold);
      }

      const popup = this.root.querySelector('#ms-victoryPopup');
      const info = this.root.querySelector('#ms-victoryInfo');
      const rewards = this.root.querySelector('#ms-victoryRewards');
      if (info) info.textContent = `Misión: ${mission.name}`;
      if (rewards) {
        rewards.innerHTML = `<span style="color:#34d399">+${mission.xp} XP</span> &nbsp;|&nbsp; <span style="color:#fbbf24">+${mission.gold} Oro</span>`;
      }
      if (popup) popup.classList.add('show');
    },

    openBattle(mission, rank, index) {
      const battleHost = this.root?.querySelector('#ms-battle-stage');
      if (!battleHost || !window.MissionBattleSystem) return;

      this.activeBattle = { mission, rank, index };

      window.MissionBattleSystem.mount(battleHost, {
        onVictory: (winner) => {
          if (winner !== 'KAGUYA') {
            this.applyRewardsAndPopup(mission);
          }
        },
        onExit: () => {
          this.goBack('ms-view-missions');
        }
      });

      this.switchView('ms-view-missions', 'ms-view-battle', 'forward');
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
      } else if (target === 'ms-view-missions') {
        if (window.MissionBattleSystem && typeof window.MissionBattleSystem.unmount === 'function') {
          window.MissionBattleSystem.unmount();
        }
        this.switchView('ms-view-battle', 'ms-view-missions', 'back');
      }
    },

    resetToMain() {
      const main = this.root?.querySelector('#ms-view-main');
      const ranks = this.root?.querySelector('#ms-view-ranks');
      const missions = this.root?.querySelector('#ms-view-missions');
      if (!main || !ranks || !missions) return;

      [main, ranks, missions, this.root?.querySelector('#ms-view-battle')].filter(Boolean).forEach((view) => {
        view.classList.remove('active');
        view.style.opacity = '0';
        view.style.transform = 'translateX(100%)';
        view.style.pointerEvents = 'none';
      });

      main.classList.add('active');
      main.style.opacity = '1';
      main.style.transform = 'translateX(0)';
      main.style.pointerEvents = 'all';
      this.currentView = 'ms-view-main';
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
