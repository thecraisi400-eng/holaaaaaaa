(function () {
  const GameStates = Object.freeze({ MOVING: 'MOVING', ENCOUNTER: 'ENCOUNTER', COMBAT: 'COMBAT', VICTORY: 'VICTORY', DONE: 'DONE' });

  class BattleRunnerInstance {
    constructor(root, options = {}) {
      this.root = root;
      this.options = options;
      this.state = GameStates.MOVING;
      this.progress = 0;
      this.progressSpeed = 0.08;
      this.roundCount = 0;
      this.isRunning = false;
      this.autoMode = false;
      this.isPlayerTurn = true;
      this.combatLocked = false;
      this.subSkillsVisible = false;
      this.triggerPoints = [30, 60, 90];
      this.currentTriggerIndex = 0;
      this.player = { hp: 100, maxHp: 100, mp: 50, maxMp: 50, atk: 18, defense: 5 };
      this.enemy = { hp: 0, maxHp: 0, mp: 0, maxMp: 0, atk: 0, name: '' };
      this.enemyTypes = [
        { name: 'Bandido Sombra', hp: 80, mp: 30, atk: 2 },
        { name: 'Oni de Hierro', hp: 100, mp: 40, atk: 3 },
        { name: 'Demonio Bosque', hp: 120, mp: 50, atk: 4 }
      ];
      this.cacheDOM();
      this.bindEvents();
      this.initParallax();
      this.updateProgressBar();
      this.updatePlayerHP();
      this.updatePlayerMP();
      this.startRunner();
    }

    cacheDOM() {
      const $ = (id) => this.root.querySelector(`#${id}`);
      this.dom = {
        container: $('br-game-container'), player: $('br-player'), enemy: $('br-enemy'), progressBar: $('br-progress-bar'), progressText: $('br-progress-text'),
        hpPlayerBar: $('br-hp-player-bar'), hpPlayerText: $('br-hp-player-text'), mpPlayerBar: $('br-mp-player-bar'), mpPlayerText: $('br-mp-player-text'),
        hpEnemyBar: $('br-hp-enemy-bar'), hpEnemyText: $('br-hp-enemy-text'), mpEnemyBar: $('br-mp-enemy-bar'), mpEnemyText: $('br-mp-enemy-text'),
        notification: $('br-notification'), encounterFlash: $('br-encounter-flash'), victoryParticles: $('br-victory-particles'), combatLog: $('br-combat-log'),
        autoBtn: $('br-auto-btn'), subSkills: $('br-sub-skills'), attackBtn: $('br-attack-btn'), skillsBtn: $('br-skills-btn')
      };
    }

    bindEvents() {
      this.dom.attackBtn?.addEventListener('click', () => this.useAttack());
      this.dom.skillsBtn?.addEventListener('click', () => this.toggleSubSkills());
      this.dom.autoBtn?.addEventListener('click', () => this.toggleAuto());
      this.dom.subSkills?.querySelectorAll('.br-sub-skill-slot').forEach((btn) => btn.addEventListener('click', () => this.useSubSkill(btn.dataset.skill)));
    }

    initParallax() {
      const layers = [
        ['br-layer-sky', 'br-speed-slow'], ['br-layer-mountains', 'br-speed-slow'], ['br-layer-trees-back', 'br-speed-medium'], ['br-layer-trees-front', 'br-speed-fast'],
        ['br-layer-ground', 'br-speed-fastest'], ['br-layer-dust', 'br-speed-fastest'], ['br-layer-grass', 'br-speed-fast']
      ];
      this.parallaxLayers = layers.map(([id, speedClass]) => ({ el: this.root.querySelector(`#${id}`), speedClass })).filter((x) => x.el);
    }

    startRunner() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.parallaxLayers.forEach((layer) => layer.el.classList.add('br-parallax-scrolling', layer.speedClass));
      this.dom.player.className = 'run';
      this.loop();
    }
    stopRunner() {
      this.isRunning = false;
      this.parallaxLayers.forEach((layer) => layer.el.classList.remove('br-parallax-scrolling', layer.speedClass));
      this.dom.player.className = 'idle';
    }

    loop() {
      if (!this.isRunning) return;
      if (this.state === GameStates.MOVING) {
        this.progress += this.progressSpeed;
        this.updateProgressBar();
        this.checkTriggers();
        if (this.progress >= 100) {
          this.progress = 0; this.currentTriggerIndex = 0; this.roundCount += 1;
          this.showNotification(`🔄 Ronda #${this.roundCount + 1}`, 1200);
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.floor(this.player.maxHp * 0.2));
          this.player.mp = Math.min(this.player.maxMp, this.player.mp + Math.floor(this.player.maxMp * 0.2));
          this.updatePlayerHP(); this.updatePlayerMP();
        }
      }
      this.raf = requestAnimationFrame(() => this.loop());
    }

    updateProgressBar() { const p = Math.min(this.progress, 100); this.dom.progressBar.style.width = `${p}%`; this.dom.progressText.textContent = `${Math.floor(p)}%`; }
    checkTriggers() {
      if (this.currentTriggerIndex >= this.triggerPoints.length || this.progress < this.triggerPoints[this.currentTriggerIndex]) return;
      this.currentTriggerIndex += 1; this.triggerEncounter();
    }

    triggerEncounter() {
      this.state = GameStates.ENCOUNTER; this.stopRunner();
      this.dom.encounterFlash.classList.add('active'); setTimeout(() => this.dom.encounterFlash.classList.remove('active'), 400);
      this.showNotification('¡ENCUENTRO!', 900);
      const idx = (this.roundCount * this.triggerPoints.length) + this.currentTriggerIndex - 1;
      const data = this.enemyTypes[idx % this.enemyTypes.length];
      this.enemy = { hp: data.hp, maxHp: data.hp, mp: data.mp, maxMp: data.mp, atk: data.atk, name: data.name };
      setTimeout(() => { this.dom.enemy.classList.add('visible'); this.updateEnemyHP(); this.updateEnemyMP(); this.state = GameStates.COMBAT; this.isPlayerTurn = true; this.showCombatLog(`¡${data.name} aparece!`); }, 500);
    }

    useAttack() {
      if (this.state !== GameStates.COMBAT || this.combatLocked || !this.isPlayerTurn) return;
      this.combatLocked = true; this.dom.player.className = 'attack';
      setTimeout(() => {
        const damage = Math.max(1, this.player.atk + Math.floor(Math.random() * 5) - 2);
        this.enemy.hp = Math.max(0, this.enemy.hp - damage); this.updateEnemyHP();
        this.showDamageNumber(damage, this.dom.enemy); this.showHitEffect(this.dom.enemy); this.screenShake(); this.showCombatLog(`Atacas por ${damage} de daño`);
        if (this.enemy.hp <= 0) setTimeout(() => this.enemyDefeated(), 350); else { this.isPlayerTurn = false; setTimeout(() => this.enemyTurn(), 700); }
        setTimeout(() => { this.dom.player.className = 'idle'; this.combatLocked = false; }, 350);
      }, 250);
    }

    useSubSkill(type) {
      if (this.state !== GameStates.COMBAT || this.combatLocked || !this.isPlayerTurn) return;
      const skillData = { fire: { name: '🔥 Bola de Fuego', dmg: 25, mpCost: 15 }, water: { name: '🌊 Torbellino', dmg: 20, mpCost: 12 }, wind: { name: '🌪 Corte Viento', dmg: 15, mpCost: 8 } };
      const skill = skillData[type]; if (!skill) return;
      if (this.player.mp < skill.mpCost) { this.showCombatLog('❌ MP insuficiente'); return; }
      this.combatLocked = true; this.closeSubSkills(); this.player.mp -= skill.mpCost; this.updatePlayerMP(); this.dom.player.className = 'attack';
      setTimeout(() => {
        const damage = skill.dmg + Math.floor(Math.random() * 4) - 1;
        this.enemy.hp = Math.max(0, this.enemy.hp - damage); this.updateEnemyHP();
        this.showDamageNumber(damage, this.dom.enemy); this.showHitEffect(this.dom.enemy); this.screenShake(); this.showCombatLog(`${skill.name} — ${damage} de daño`);
        if (this.enemy.hp <= 0) setTimeout(() => this.enemyDefeated(), 350); else { this.isPlayerTurn = false; setTimeout(() => this.enemyTurn(), 700); }
        setTimeout(() => { this.dom.player.className = 'idle'; this.combatLocked = false; }, 350);
      }, 250);
    }

    enemyTurn() {
      if (this.state !== GameStates.COMBAT) return;
      const damage = Math.max(1, this.enemy.atk + Math.floor(Math.random() * 4) - 2 - this.player.defense);
      this.player.hp = Math.max(0, this.player.hp - damage); this.updatePlayerHP();
      this.showDamageNumber(damage, this.dom.player); this.showHitEffect(this.dom.player); this.screenShake(); this.showCombatLog(`${this.enemy.name} ataca por ${damage}`);
      if (this.player.hp <= 0) { this.showNotification('¡DERROTADO!', 1500); setTimeout(() => this.finish(false), 1200); return; }
      this.isPlayerTurn = true; this.combatLocked = false; if (this.autoMode) setTimeout(() => this.autoCombatAction(), 350);
    }

    enemyDefeated() {
      this.state = GameStates.VICTORY; this.closeSubSkills(); this.dom.enemy.classList.add('defeated'); this.dom.player.className = 'victory';
      this.showNotification('¡VICTORIA!', 1200); this.showCombatLog(`¡${this.enemy.name} derrotado!`); this.spawnVictoryParticles();
      setTimeout(() => {
        this.dom.enemy.classList.remove('visible', 'defeated'); this.dom.player.className = 'idle';
        if (typeof this.options.onVictory === 'function') this.options.onVictory();
        this.finish(true);
      }, 1400);
    }

    toggleAuto() {
      this.autoMode = !this.autoMode;
      const icon = this.dom.autoBtn?.querySelector('.br-skill-icon');
      this.dom.autoBtn?.classList.toggle('active', this.autoMode);
      if (icon) icon.textContent = this.autoMode ? '✅' : '❎';
      this.showCombatLog(this.autoMode ? 'Auto ACTIVADO' : 'Auto DESACTIVADO');
      if (this.autoMode && this.isPlayerTurn && this.state === GameStates.COMBAT) setTimeout(() => this.autoCombatAction(), 250);
    }
    autoCombatAction() {
      if (!this.autoMode || this.state !== GameStates.COMBAT || !this.isPlayerTurn || this.combatLocked) return;
      const available = [['fire', 15], ['water', 12], ['wind', 8]].filter((x) => this.player.mp >= x[1]).map((x) => x[0]);
      if (Math.random() < 0.3 && available.length) this.useSubSkill(available[Math.floor(Math.random() * available.length)]); else this.useAttack();
    }
    toggleSubSkills() { this.subSkillsVisible = !this.subSkillsVisible; this.dom.subSkills.classList.toggle('visible', this.subSkillsVisible); }
    closeSubSkills() { this.subSkillsVisible = false; this.dom.subSkills.classList.remove('visible'); }

    updatePlayerHP() { const p = (this.player.hp / this.player.maxHp) * 100; this.dom.hpPlayerBar.style.width = `${p}%`; this.dom.hpPlayerText.textContent = `${this.player.hp}/${this.player.maxHp}`; }
    updatePlayerMP() { const p = (this.player.mp / this.player.maxMp) * 100; this.dom.mpPlayerBar.style.width = `${p}%`; this.dom.mpPlayerText.textContent = `${this.player.mp}/${this.player.maxMp}`; }
    updateEnemyHP() { const p = this.enemy.maxHp ? (this.enemy.hp / this.enemy.maxHp) * 100 : 0; this.dom.hpEnemyBar.style.width = `${p}%`; this.dom.hpEnemyText.textContent = `${this.enemy.hp}/${this.enemy.maxHp}`; }
    updateEnemyMP() { const p = this.enemy.maxMp ? (this.enemy.mp / this.enemy.maxMp) * 100 : 0; this.dom.mpEnemyBar.style.width = `${p}%`; this.dom.mpEnemyText.textContent = `${this.enemy.mp}/${this.enemy.maxMp}`; }

    showNotification(text, duration = 1200) { this.dom.notification.textContent = text; this.dom.notification.className = ''; void this.dom.notification.offsetWidth; this.dom.notification.classList.add('show'); setTimeout(() => this.dom.notification.classList.remove('show'), duration); }
    showCombatLog(text) { this.dom.combatLog.textContent = text; this.dom.combatLog.classList.add('visible'); clearTimeout(this.logTimeout); this.logTimeout = setTimeout(() => this.dom.combatLog.classList.remove('visible'), 1800); }
    screenShake() { this.dom.container.classList.add('br-shake'); setTimeout(() => this.dom.container.classList.remove('br-shake'), 300); }

    showDamageNumber(damage, target) {
      const el = document.createElement('div'); el.className = 'br-damage-number'; el.textContent = `-${damage}`;
      const r = target.getBoundingClientRect(); const c = this.dom.container.getBoundingClientRect();
      el.style.left = `${r.left - c.left + r.width / 2 - 10}px`; el.style.top = `${r.top - c.top}px`;
      this.dom.container.appendChild(el); setTimeout(() => el.remove(), 800);
    }
    showHitEffect(target) {
      const el = document.createElement('div'); el.className = 'br-hit-effect'; el.textContent = '✦';
      const r = target.getBoundingClientRect(); const c = this.dom.container.getBoundingClientRect();
      el.style.left = `${r.left - c.left + r.width / 2 - 10}px`; el.style.top = `${r.top - c.top + r.height / 2 - 10}px`;
      this.dom.container.appendChild(el); setTimeout(() => el.remove(), 300);
    }

    spawnVictoryParticles() {
      this.dom.victoryParticles.innerHTML = '';
      const colors = ['#ffcc00', '#ff6644', '#44cc66', '#4488ff', '#ff44aa'];
      for (let i = 0; i < 18; i += 1) {
        const p = document.createElement('div'); p.className = 'br-victory-particle';
        p.style.background = colors[Math.floor(Math.random() * colors.length)]; p.style.left = '50%'; p.style.top = '50%';
        p.style.setProperty('--tx', `${Math.random() * 200 - 100}px`); p.style.setProperty('--ty', `${Math.random() * 200 - 100}px`);
        this.dom.victoryParticles.appendChild(p);
      }
      setTimeout(() => { this.dom.victoryParticles.innerHTML = ''; }, 1000);
    }

    finish(victory) {
      if (this.state === GameStates.DONE) return;
      this.state = GameStates.DONE;
      this.stopRunner();
      cancelAnimationFrame(this.raf);
      if (typeof this.options.onFinish === 'function') this.options.onFinish(victory);
    }

    destroy() { this.state = GameStates.DONE; this.stopRunner(); cancelAnimationFrame(this.raf); }
  }

  const BattleRunnerSystem = {
    active: null,
    _destroying: false,
    launch(container, options = {}) {
      this.destroy();
      const tpl = document.getElementById('battleRunnerTemplate');
      if (!container || !tpl) return null;
      container.classList.add('ms-battle-mode');
      const fragment = tpl.content.cloneNode(true);
      container.appendChild(fragment);
      const battleRoot = container.querySelector('#br-game-container')?.parentElement || container;
      this.active = new BattleRunnerInstance(battleRoot, {
        ...options,
        onFinish: (victory) => {
          options.onFinish?.(victory);
          this.destroy();
        }
      });
      return this.active;
    },
    destroy() {
      if (this._destroying) return;
      this._destroying = true;
      if (this.active) this.active.destroy();
      this.active = null;
      const existing = document.getElementById('br-game-container');
      const msContainer = existing?.closest('.ms-game-container');
      if (existing) existing.remove();
      if (msContainer) msContainer.classList.remove('ms-battle-mode');
      this._destroying = false;
    }
  };

  window.BattleRunnerSystem = BattleRunnerSystem;
})();
