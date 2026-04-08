(function () {
  const missionsData = {
    D: window.RANGO_D_CATALOG?.D?.missions || [
      { id: 'd-1', name: 'Eliminar lobos hambrientos', expBase: 4, oroBase: 8, hp: 138, mp: 30, atk: 14, def: 5, lvl: 1, enemy: 'Bandido Sombra' }
    ],
    C: [
      { name: 'Limpiar una mina de murciélagos vampíricos', xp: 12, gold: 24, hp: 318, atk: 113, def: 72, lvl: 14 },
      { name: 'Derrotar a un grupo de orcos merodeadores', xp: 14, gold: 28, hp: 354, atk: 131, def: 83, lvl: 16 }
    ],
    B: [
      { name: 'Exterminar una colonia de arácnidos gigantes', xp: 22, gold: 44, hp: 498, atk: 201, def: 127, lvl: 28 }
    ],
    A: [
      { name: 'Eliminar a un dragón joven', xp: 32, gold: 64, hp: 678, atk: 289, def: 182, lvl: 55 }
    ],
    S: [
      { name: 'Enfrentar a un dragón adulto', xp: 50, gold: 100, hp: 1002, atk: 448, def: 281, lvl: 75 }
    ]
  };

  const MissionSystem = {
    host: null,
    root: null,
    currentView: 'ms-view-main',
    heroLevel: 1,
    currentRank: null,
    enableRangoDBattleSystem: true,

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
      this.initBattleSystem();
      this.resetToMain();
    },

    initBattleSystem() {
      if (!window.RangoDBattleSystem || !this.root) return;
      window.RangoDBattleSystem.mount(this.root);
    },

    cancelAllActiveProcesses() {
      if (window.RangoDBattleSystem) {
        window.RangoDBattleSystem.cancelAll();
      }
    },

    unmount() {
      this.cancelAllActiveProcesses();
      if (!this.host) return;
      this.host.innerHTML = '';
      this.root = null;
      this.currentView = 'ms-view-main';
      this.currentRank = null;
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
      this.cancelAllActiveProcesses();
      this.switchView('ms-view-main', 'ms-view-ranks', 'forward');
    },

    showMissions(rank) {
      this.currentRank = rank;
      this.cancelAllActiveProcesses();
      const container = this.root.querySelector('#ms-missions-scroll');
      if (!container) return;

      const data = missionsData[rank] || [];
      container.innerHTML = '';

      data.forEach((mission, i) => {
        const locked = this.heroLevel < mission.lvl;
        const card = document.createElement('div');
        card.className = `ms-mission-card${locked ? ' locked' : ''}`;
        card.innerHTML = `
          <div class="ms-mission-name">⚔️ ${mission.name || mission.enemy}</div>
          <button class="ms-fight-btn" ${locked ? 'disabled' : ''}>⚔️ Luchar</button>
          <div class="ms-mission-body">
            <div class="ms-mission-rewards">
              <span class="ms-xp">✨ ${(mission.xp ?? mission.expBase ?? 0)} XP</span>
              <span class="ms-gold">💰 ${(mission.gold ?? mission.oroBase ?? 0)} Oro</span>
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

      if (rank === 'D' && this.enableRangoDBattleSystem && window.RangoDBattleSystem) {
        const started = window.RangoDBattleSystem.startMission({
          id: mission.id || `d-${index + 1}`,
          name: mission.name || mission.enemy,
          enemy: mission.enemy || mission.name,
          hp: mission.hp,
          mp: mission.mp || 0,
          atk: mission.atk,
          def: mission.def,
          expBase: mission.expBase ?? mission.xp,
          oroBase: mission.oroBase ?? mission.gold
        });
        if (started) return;
      }

      if (window.GameState && typeof window.GameState.getGold === 'function' && typeof window.GameState.setGold === 'function') {
        window.GameState.setGold(window.GameState.getGold() + (mission.gold || 0));
      }
    },

    goBack(target) {
      this.cancelAllActiveProcesses();
      if (target === 'ms-view-main') {
        this.switchView('ms-view-ranks', 'ms-view-main', 'back');
      } else if (target === 'ms-view-ranks') {
        this.switchView('ms-view-missions', 'ms-view-ranks', 'back');
      }
    },

    resetToMain() {
      const main = this.root?.querySelector('#ms-view-main');
      const ranks = this.root?.querySelector('#ms-view-ranks');
      const missions = this.root?.querySelector('#ms-view-missions');
      if (!main || !ranks || !missions) return;

      [main, ranks, missions].forEach((view) => {
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
      this.cancelAllActiveProcesses();
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
