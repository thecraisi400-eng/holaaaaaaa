(function () {
  const GameStates = Object.freeze({ MOVING: 'MOVING', ENCOUNTER: 'ENCOUNTER', COMBAT: 'COMBAT', VICTORY: 'VICTORY', CANCELLED: 'CANCELLED' });

  class BattleRangoDRunner {
    constructor(host, mission) {
      this.host = host;
      this.mission = mission;
      this.state = GameStates.MOVING;
      this.progress = 0;
      this.progressSpeed = 0.08;
      this.roundCount = 1;
      this.currentTriggerIndex = 0;
      this.triggerPoints = [30, 60, 90];
      this.subSkillsVisible = false;
      this.autoMode = false;
      this.isPlayerTurn = true;
      this.combatLocked = false;
      this.isRunning = false;
      this.sessionId = Date.now();

      const battleStats = window.GameState?.getBattleStats?.() || { hp: 100, hpMax: 100, mp: 100, mpMax: 100, atk: 10, def: 10 };
      this.player = { hp: battleStats.hp, maxHp: battleStats.hpMax, mp: battleStats.mp, maxMp: battleStats.mpMax, atk: battleStats.atk, defense: battleStats.def };
      this.enemy = { hp: 0, maxHp: 0, mp: 0, maxMp: 0, atk: 0, def: 0, name: '' };

      this.dom = {};
      this.cacheDOM();
      this.initParallax();
      this.bindEvents();
      this.syncPlayerToGlobal();
      this.startRunner();
    }

    cacheDOM() {
      const q = (id) => this.host.querySelector(id);
      this.dom.container = q('#brd-game-container');
      this.dom.player = q('#brd-player');
      this.dom.enemy = q('#brd-enemy');
      this.dom.progressBar = q('#brd-progress-bar');
      this.dom.progressText = q('#brd-progress-text');
      this.dom.hpPlayerBar = q('#brd-hp-player-bar');
      this.dom.hpPlayerText = q('#brd-hp-player-text');
      this.dom.mpPlayerBar = q('#brd-mp-player-bar');
      this.dom.mpPlayerText = q('#brd-mp-player-text');
      this.dom.hpEnemyBar = q('#brd-hp-enemy-bar');
      this.dom.hpEnemyText = q('#brd-hp-enemy-text');
      this.dom.mpEnemyBar = q('#brd-mp-enemy-bar');
      this.dom.mpEnemyText = q('#brd-mp-enemy-text');
      this.dom.notification = q('#brd-notification');
      this.dom.encounterFlash = q('#brd-encounter-flash');
      this.dom.victoryParticles = q('#brd-victory-particles');
      this.dom.combatLog = q('#brd-combat-log');
      this.dom.autoBtn = q('#brd-auto-btn');
      this.dom.skillsPanel = q('#brd-sub-skills');
    }

    bindEvents() {
      this.host.querySelector('#brd-attack-btn')?.addEventListener('click', () => this.useAttack());
      this.host.querySelector('#brd-skills-btn')?.addEventListener('click', () => this.toggleSubSkills());
      this.host.querySelector('#brd-auto-btn')?.addEventListener('click', () => this.toggleAuto());
      this.host.querySelectorAll('#brd-sub-skills .brd-sub-skill-slot').forEach((btn) => btn.addEventListener('click', () => this.useSubSkill(btn.dataset.skill)));
    }

    initParallax() {
      this.parallaxLayers = [
        { el: this.host.querySelector('#brd-layer-sky'), speedClass: 'brd-speed-slow' },
        { el: this.host.querySelector('#brd-layer-mountains'), speedClass: 'brd-speed-slow' },
        { el: this.host.querySelector('#brd-layer-trees-back'), speedClass: 'brd-speed-medium' },
        { el: this.host.querySelector('#brd-layer-trees-front'), speedClass: 'brd-speed-fast' },
        { el: this.host.querySelector('#brd-layer-ground'), speedClass: 'brd-speed-fastest' },
        { el: this.host.querySelector('#brd-layer-dust'), speedClass: 'brd-speed-fastest' },
        { el: this.host.querySelector('#brd-layer-grass'), speedClass: 'brd-speed-fast' }
      ];
    }

    startRunner() {
      if (this.isRunning || this.state === GameStates.CANCELLED) return;
      this.isRunning = true;
      this.parallaxLayers.forEach((layer) => layer.el?.classList.add('brd-parallax-scrolling', layer.speedClass));
      this.dom.player.className = 'run';
      this.gameLoop(this.sessionId);
    }

    stopRunner() {
      this.isRunning = false;
      this.parallaxLayers.forEach((layer) => layer.el?.classList.remove('brd-parallax-scrolling', layer.speedClass));
      this.dom.player.className = 'idle';
    }

    gameLoop(sessionId) {
      if (!this.isRunning || this.state === GameStates.CANCELLED || this.sessionId !== sessionId) return;
      if (this.state === GameStates.MOVING) {
        this.progress += this.progressSpeed;
        this.updateProgressBar();
        this.checkTriggers();
        if (this.progress >= 100) {
          this.progress = 0;
          this.currentTriggerIndex = 0;
          this.roundCount += 1;
          this.showNotification(`${this.roundCount} Asalto`, 1400);
          this.showCombatLog(`Asalto ${this.roundCount} iniciado`);
          this.updateProgressBar();
        }
      }
      requestAnimationFrame(() => this.gameLoop(sessionId));
    }

    checkTriggers() {
      if (this.currentTriggerIndex >= this.triggerPoints.length) return;
      if (this.progress >= this.triggerPoints[this.currentTriggerIndex]) {
        this.currentTriggerIndex += 1;
        this.triggerEncounter();
      }
    }

    triggerEncounter() {
      this.state = GameStates.ENCOUNTER;
      this.stopRunner();
      this.dom.encounterFlash.classList.add('active');
      this.showNotification('¡ENCUENTRO!', 1200);
      setTimeout(() => this.dom.encounterFlash.classList.remove('active'), 400);

      const idx = (this.roundCount - 1) * this.triggerPoints.length + this.currentTriggerIndex;
      this.enemy = this.buildEnemyForMission(idx);

      setTimeout(() => {
        if (this.state === GameStates.CANCELLED) return;
        this.dom.enemy.classList.add('visible');
        this.updateEnemyHP();
        this.updateEnemyMP();
        this.state = GameStates.COMBAT;
        this.isPlayerTurn = true;
        this.combatLocked = false;
        this.updatePlayerHP();
        this.updatePlayerMP();
        this.showCombatLog(`¡${this.enemy.name} aparece!`);
        if (this.autoMode) setTimeout(() => this.autoCombatAction(), 500);
      }, 600);
    }

    buildEnemyForMission(index) {
      const names = ['Bandido Sombra', 'Oni de Hierro', 'Demonio Bosque'];
      const growth = 1 + ((this.roundCount - 1) * 0.08);
      const hp = Math.round(this.mission.hp * (0.7 + (index % 3) * 0.15) * growth);
      const atk = Math.max(1, Math.round(this.mission.atk * (0.5 + (index % 3) * 0.12) * growth));
      const mp = Math.max(10, Math.round(hp * 0.2));
      return { name: names[index % names.length], hp, maxHp: hp, mp, maxMp: mp, atk, def: this.mission.def };
    }

    useAttack() {
      if (this.state !== GameStates.COMBAT || this.combatLocked || !this.isPlayerTurn) return;
      this.combatLocked = true;
      this.dom.player.className = 'attack';
      setTimeout(() => {
        if (this.state !== GameStates.COMBAT) return;
        const variance = Math.floor(Math.random() * 5) - 2;
        const damage = Math.max(1, this.player.atk + variance - Math.floor(this.enemy.def * 0.35));
        this.enemy.hp = Math.max(0, this.enemy.hp - damage);
        this.updateEnemyHP();
        this.showDamageNumber(damage, this.dom.enemy);
        this.afterPlayerAction(`Atacas por ${damage} de daño!`);
      }, 300);
    }

    useSubSkill(type) {
      if (this.state !== GameStates.COMBAT || this.combatLocked || !this.isPlayerTurn) return;
      this.combatLocked = true;
      this.closeSubSkills();
      const skills = { fire: { name: '🔥 Bola de Fuego', dmg: 25, mp: 15 }, water: { name: '🌊 Torbellino', dmg: 20, mp: 12 }, wind: { name: '🌪 Corte Viento', dmg: 15, mp: 8 } };
      const skill = skills[type];
      if (!skill) return;
      if (this.player.mp < skill.mp) {
        this.showCombatLog('❌ MP insuficiente');
        this.combatLocked = false;
        return;
      }
      this.player.mp -= skill.mp;
      this.updatePlayerMP();
      this.syncPlayerToGlobal();
      this.dom.player.className = 'attack';
      setTimeout(() => {
        if (this.state !== GameStates.COMBAT) return;
        const damage = Math.max(1, skill.dmg + Math.floor(Math.random() * 4) - 1 - Math.floor(this.enemy.def * 0.25));
        this.enemy.hp = Math.max(0, this.enemy.hp - damage);
        this.updateEnemyHP();
        this.showDamageNumber(damage, this.dom.enemy);
        this.afterPlayerAction(`${skill.name} — ${damage} de daño!`);
      }, 300);
    }

    afterPlayerAction(logText) {
      this.showHitEffect(this.dom.enemy);
      this.dom.container.classList.add('shake');
      setTimeout(() => this.dom.container.classList.remove('shake'), 260);
      this.showCombatLog(logText);
      if (this.enemy.hp <= 0) {
        setTimeout(() => this.enemyDefeated(), 360);
      } else {
        this.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 700);
      }
      setTimeout(() => {
        if (this.state === GameStates.CANCELLED) return;
        this.dom.player.className = 'idle';
        this.combatLocked = false;
      }, 380);
    }

    enemyTurn() {
      if (this.state !== GameStates.COMBAT) return;
      this.dom.enemy.classList.add('enemy-attack');
      setTimeout(() => {
        if (this.state !== GameStates.COMBAT) return;
        const variance = Math.floor(Math.random() * 4) - 2;
        const damage = Math.max(1, this.enemy.atk + variance - this.player.defense);
        this.player.hp = Math.max(0, this.player.hp - damage);
        this.updatePlayerHP();
        this.syncPlayerToGlobal();
        this.showDamageNumber(damage, this.dom.player);
        this.showHitEffect(this.dom.player);
        this.showCombatLog(`${this.enemy.name} ataca por ${damage}`);
        if (this.player.hp <= 0) {
          this.cancel('derrota');
          return;
        }
        setTimeout(() => {
          this.dom.enemy.classList.remove('enemy-attack');
          this.isPlayerTurn = true;
          this.combatLocked = false;
          if (this.autoMode) setTimeout(() => this.autoCombatAction(), 450);
        }, 360);
      }, 420);
    }

    enemyDefeated() {
      if (this.state === GameStates.CANCELLED) return;
      this.state = GameStates.VICTORY;
      this.closeSubSkills();
      this.dom.enemy.classList.add('defeated');
      this.dom.player.className = 'victory';
      this.showNotification('¡VICTORIA!', 1200);
      this.showCombatLog(`+${this.mission.xp} EXP | +${this.mission.gold} Oro`);
      this.spawnVictoryParticles();
      window.GameState?.awardMissionRewards?.(this.mission.xp, this.mission.gold);

      setTimeout(() => {
        if (this.state === GameStates.CANCELLED) return;
        this.dom.enemy.classList.remove('visible', 'defeated');
        this.dom.player.className = 'idle';
        this.state = GameStates.MOVING;
        this.startRunner();
      }, 1700);
    }

    updateProgressBar() {
      const pct = Math.min(this.progress, 100);
      this.dom.progressBar.style.width = `${pct}%`;
      this.dom.progressText.textContent = `${Math.floor(pct)}%`;
    }

    updatePlayerHP() { const pct = (this.player.hp / this.player.maxHp) * 100; this.dom.hpPlayerBar.style.width = `${pct}%`; this.dom.hpPlayerText.textContent = `${this.player.hp}/${this.player.maxHp}`; }
    updatePlayerMP() { const pct = (this.player.mp / this.player.maxMp) * 100; this.dom.mpPlayerBar.style.width = `${pct}%`; this.dom.mpPlayerText.textContent = `${this.player.mp}/${this.player.maxMp}`; }
    updateEnemyHP() { const pct = (this.enemy.hp / this.enemy.maxHp) * 100; this.dom.hpEnemyBar.style.width = `${pct}%`; this.dom.hpEnemyText.textContent = `${this.enemy.hp}/${this.enemy.maxHp}`; }
    updateEnemyMP() { const pct = (this.enemy.mp / this.enemy.maxMp) * 100; this.dom.mpEnemyBar.style.width = `${pct}%`; this.dom.mpEnemyText.textContent = `${this.enemy.mp}/${this.enemy.maxMp}`; }

    showDamageNumber(damage, target) {
      const el = document.createElement('div');
      el.className = 'brd-damage-number';
      el.textContent = `-${damage}`;
      const rect = target.getBoundingClientRect();
      const base = this.dom.container.getBoundingClientRect();
      el.style.left = `${rect.left - base.left + rect.width / 2 - 10}px`;
      el.style.top = `${rect.top - base.top}px`;
      this.dom.container.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }

    showHitEffect(target) {
      const el = document.createElement('div');
      el.className = 'brd-hit-effect';
      const rect = target.getBoundingClientRect();
      const base = this.dom.container.getBoundingClientRect();
      el.style.left = `${rect.left - base.left + rect.width / 2 - 15}px`;
      el.style.top = `${rect.top - base.top + rect.height / 2 - 15}px`;
      this.dom.container.appendChild(el);
      setTimeout(() => el.remove(), 400);
    }

    showNotification(text, duration = 1200) {
      this.dom.notification.textContent = text;
      this.dom.notification.className = '';
      void this.dom.notification.offsetWidth;
      this.dom.notification.classList.add('show');
      setTimeout(() => this.dom.notification.classList.remove('show'), duration);
    }

    showCombatLog(text) {
      this.dom.combatLog.textContent = text;
      this.dom.combatLog.classList.add('visible');
      clearTimeout(this._logTimeout);
      this._logTimeout = setTimeout(() => this.dom.combatLog.classList.remove('visible'), 2000);
    }

    spawnVictoryParticles() {
      this.dom.victoryParticles.innerHTML = '';
      const colors = ['#ffcc00', '#ff6644', '#44cc66', '#4488ff', '#ff44aa'];
      for (let i = 0; i < 20; i += 1) {
        const p = document.createElement('div');
        p.className = 'brd-victory-particle';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.left = '50%'; p.style.top = '50%';
        p.style.setProperty('--tx', `${Math.random() * 200 - 100}px`);
        p.style.setProperty('--ty', `${Math.random() * 200 - 100}px`);
        this.dom.victoryParticles.appendChild(p);
      }
      setTimeout(() => { this.dom.victoryParticles.innerHTML = ''; }, 1200);
    }

    toggleSubSkills() {
      this.subSkillsVisible = !this.subSkillsVisible;
      this.dom.skillsPanel.classList.toggle('visible', this.subSkillsVisible);
    }

    closeSubSkills() {
      this.subSkillsVisible = false;
      this.dom.skillsPanel.classList.remove('visible');
    }

    toggleAuto() {
      this.autoMode = !this.autoMode;
      const icon = this.dom.autoBtn.querySelector('.skill-icon');
      if (this.autoMode) {
        this.dom.autoBtn.classList.add('active');
        if (icon) icon.textContent = '✅';
        if (this.state === GameStates.COMBAT && this.isPlayerTurn) setTimeout(() => this.autoCombatAction(), 300);
      } else {
        this.dom.autoBtn.classList.remove('active');
        if (icon) icon.textContent = '❎';
      }
    }

    autoCombatAction() {
      if (!this.autoMode || this.state !== GameStates.COMBAT || !this.isPlayerTurn) return;
      const roll = Math.random();
      if (roll < 0.25 && this.player.mp >= 8) {
        const options = ['fire', 'water', 'wind'].filter((s) => this.player.mp >= ({ fire: 15, water: 12, wind: 8 })[s]);
        this.useSubSkill(options[Math.floor(Math.random() * options.length)] || 'wind');
        return;
      }
      this.useAttack();
    }

    syncPlayerToGlobal() {
      window.GameState?.setBattleResources?.({ hp: this.player.hp, mp: this.player.mp });
    }

    cancel(reason = 'cancelled') {
      this.state = GameStates.CANCELLED;
      this.sessionId = Date.now();
      this.stopRunner();
      this.autoMode = false;
      this.closeSubSkills();
      clearTimeout(this._logTimeout);
      this.host.innerHTML = '';
      window.dispatchEvent(new CustomEvent('ngs:battle-cancelled', { detail: { reason } }));
    }
  }

  const BattleRangoDSystem = {
    host: null,
    runner: null,
    missionKey: null,

    start(mission) {
      if (!mission) return;
      this.stop('replace');
      this.host = document.getElementById('hero-system-host');
      const tpl = document.getElementById('battleRangoDTemplate');
      if (!this.host || !tpl) return;
      this.host.innerHTML = '';
      this.host.appendChild(tpl.content.cloneNode(true));
      this.runner = new BattleRangoDRunner(this.host, mission);
      this.missionKey = mission.name;
    },

    stop(reason = 'manual') {
      if (this.runner) this.runner.cancel(reason);
      this.runner = null;
      this.missionKey = null;
    },

    isActive() { return Boolean(this.runner && this.runner.state !== GameStates.CANCELLED); }
  };

  window.BattleRangoDSystem = BattleRangoDSystem;
})();
