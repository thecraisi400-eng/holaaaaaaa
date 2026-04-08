(function () {
  const GameStates = Object.freeze({
    MOVING: 'MOVING',
    ENCOUNTER: 'ENCOUNTER',
    COMBAT: 'COMBAT',
    VICTORY: 'VICTORY',
    MISSION_DONE: 'MISSION_DONE'
  });

  const EnemyTypes = [
    { name: 'Bandido Sombra', hp: 80, mp: 30, atk: 2, def: 1 },
    { name: 'Oni de Hierro', hp: 100, mp: 40, atk: 3, def: 2 },
    { name: 'Demonio Bosque', hp: 120, mp: 50, atk: 4, def: 3 }
  ];

  class BattleRunner {
    constructor(host, options = {}) {
      this.host = host;
      this.options = options;
      this.state = GameStates.MOVING;
      this.progress = 0;
      this.progressSpeed = 0.08;
      this.isRunning = false;
      this.roundCount = 1;

      const activeHero = window.HeroSystem && typeof window.HeroSystem.getHeroSnapshot === 'function'
        ? window.HeroSystem.getHeroSnapshot()
        : null;
      const baseStats = activeHero?.stats || {};
      this.player = {
        hp: Math.max(1, Number(activeHero?.currentHp ?? baseStats.HP ?? 100) || 100),
        maxHp: Math.max(1, Number(baseStats.HP) || 100),
        mp: Math.max(0, Number(activeHero?.currentMp ?? baseStats.MP ?? 50) || 50),
        maxMp: Math.max(1, Number(baseStats.MP) || 50),
        atk: Math.max(1, Number(baseStats.ATK) || 18),
        defense: Math.max(0, Number(baseStats.DEF) || 5)
      };
      this.enemy = { hp: 0, maxHp: 0, mp: 0, maxMp: 0, atk: 0, defense: 0, name: '', index: 0 };

      const missionStats = this.options?.mission || {};
      this.missionEnemyProfile = {
        hp: Number.isFinite(Number(missionStats.hp)) ? Math.max(1, Number(missionStats.hp)) : -1,
        atk: Number.isFinite(Number(missionStats.atk)) ? Math.max(1, Number(missionStats.atk)) : -1,
        def: Number.isFinite(Number(missionStats.def)) ? Math.max(0, Number(missionStats.def)) : -1
      };

      this.autoMode = false;
      this.isPlayerTurn = true;
      this.combatLocked = false;
      this.subSkillsVisible = false;
      this.triggerPoints = [30, 60, 90];
      this.currentTriggerIndex = 0;
      this.dom = {};

      this.render();
      this.cacheDOM();
      this.initParallax();
      this.bindUI();
      this.updateProgressBar();
      this.updatePlayerHP();
      this.updatePlayerMP();
      this.syncBattleVitals();
      this.startRunner();
    }

    render() {
      this.host.innerHTML = `
        <div id="br-game-container" class="br-game-container">
          <div class="br-parallax-sky" id="br-layer-sky"></div>
          <div class="br-parallax-mountains" id="br-layer-mountains"></div>
          <div class="br-parallax-trees-back" id="br-layer-trees-back"></div>
          <div class="br-parallax-trees-front" id="br-layer-trees-front"></div>
          <div class="br-parallax-ground" id="br-layer-ground"></div>
          <div class="br-parallax-dust" id="br-layer-dust"></div>
          <div class="br-parallax-grass" id="br-layer-grass"></div>
          <div id="br-encounter-flash"></div>
          <div id="br-notification"></div>

          <div id="br-player" class="idle">
            <div class="ninja-head"></div><div class="ninja-body"></div><div class="ninja-scarf"></div>
            <div class="ninja-arms left"></div><div class="ninja-arms right"></div><div class="ninja-kunai"></div>
            <div class="ninja-legs left"></div><div class="ninja-legs right"></div>
          </div>

          <div id="br-enemy">
            <div class="enemy-horns"></div><div class="enemy-head"></div><div class="enemy-body"></div>
            <div class="enemy-arms left"></div><div class="enemy-arms right"></div><div class="enemy-sword"></div>
            <div class="enemy-legs left"></div><div class="enemy-legs right"></div>
          </div>

          <div id="br-ui-top"><span id="br-progress-label">Misión</span><div id="br-progress-bar-container">
            <div class="br-trigger-marker" style="left:30%"></div><div class="br-trigger-marker" style="left:60%"></div><div class="br-trigger-marker" style="left:90%"></div>
            <div id="br-progress-bar"></div></div><span id="br-progress-text">0%</span></div>

          <div id="br-combat-log"></div>
          <div id="br-sub-skills">
            <button class="br-sub-skill-slot fire" data-skill="fire"><span class="sub-icon">🔥</span><span class="sub-name">Fuego</span></button>
            <button class="br-sub-skill-slot water" data-skill="water"><span class="sub-icon">🌊</span><span class="sub-name">Agua</span></button>
            <button class="br-sub-skill-slot wind" data-skill="wind"><span class="sub-icon">🌪</span><span class="sub-name">Viento</span></button>
          </div>

          <div id="br-combat-panel">
            <div id="br-player-stats">
              <div class="br-stat-bar"><span class="br-stat-label">HP</span><div class="br-stat-bar-bg"><div id="br-hp-player-bar" class="br-stat-bar-fill hp"></div></div><span id="br-hp-player-text" class="br-stat-text">100/100</span></div>
              <div class="br-stat-bar"><span class="br-stat-label">MP</span><div class="br-stat-bar-bg"><div id="br-mp-player-bar" class="br-stat-bar-fill mp"></div></div><span id="br-mp-player-text" class="br-stat-text">50/50</span></div>
            </div>
            <div id="br-action-buttons">
              <button class="br-skill-btn attack-btn" id="br-attack-btn"><span class="skill-icon">⚔️</span><span class="skill-name">Ataque</span></button>
              <button class="br-skill-btn skill-type-btn" id="br-skill-btn"><span class="skill-icon">✨</span><span class="skill-name">Skills</span></button>
              <button class="br-skill-btn auto-btn" id="br-auto-btn"><span class="skill-icon">❎</span><span class="skill-name">Auto</span></button>
            </div>
            <div id="br-enemy-stats">
              <div class="br-stat-bar"><span id="br-hp-enemy-text" class="br-stat-text">80/80</span><div class="br-stat-bar-bg"><div id="br-hp-enemy-bar" class="br-stat-bar-fill hp"></div></div><span class="br-stat-label">HP</span></div>
              <div class="br-stat-bar"><span id="br-mp-enemy-text" class="br-stat-text">30/30</span><div class="br-stat-bar-bg"><div id="br-mp-enemy-bar" class="br-stat-bar-fill mp"></div></div><span class="br-stat-label">MP</span></div>
            </div>
          </div>
          <div class="br-victory-particles" id="br-victory-particles"></div>
          <div id="br-mission-complete"><h2>¡MISIÓN COMPLETA!</h2><p>Has derrotado a todos los enemigos</p><button id="br-restart-btn">Reiniciar</button></div>
        </div>`;
    }

    cacheDOM() {
      const q = (id) => this.host.querySelector(id);
      this.dom.player = q('#br-player'); this.dom.enemy = q('#br-enemy'); this.dom.progressBar = q('#br-progress-bar');
      this.dom.progressText = q('#br-progress-text'); this.dom.subSkills = q('#br-sub-skills'); this.dom.hpPlayerBar = q('#br-hp-player-bar');
      this.dom.hpPlayerText = q('#br-hp-player-text'); this.dom.mpPlayerBar = q('#br-mp-player-bar'); this.dom.mpPlayerText = q('#br-mp-player-text');
      this.dom.hpEnemyBar = q('#br-hp-enemy-bar'); this.dom.hpEnemyText = q('#br-hp-enemy-text'); this.dom.mpEnemyBar = q('#br-mp-enemy-bar');
      this.dom.mpEnemyText = q('#br-mp-enemy-text'); this.dom.notification = q('#br-notification'); this.dom.encounterFlash = q('#br-encounter-flash');
      this.dom.victoryParticles = q('#br-victory-particles'); this.dom.combatLog = q('#br-combat-log'); this.dom.autoBtn = q('#br-auto-btn');
      this.dom.missionComplete = q('#br-mission-complete'); this.dom.container = q('#br-game-container');
    }

    initParallax() {
      this.parallaxLayers = [
        { el: this.host.querySelector('#br-layer-sky'), speedClass: 'br-speed-slow' },
        { el: this.host.querySelector('#br-layer-mountains'), speedClass: 'br-speed-slow' },
        { el: this.host.querySelector('#br-layer-trees-back'), speedClass: 'br-speed-medium' },
        { el: this.host.querySelector('#br-layer-trees-front'), speedClass: 'br-speed-fast' },
        { el: this.host.querySelector('#br-layer-ground'), speedClass: 'br-speed-fastest' },
        { el: this.host.querySelector('#br-layer-dust'), speedClass: 'br-speed-fastest' },
        { el: this.host.querySelector('#br-layer-grass'), speedClass: 'br-speed-fast' }
      ];
    }

    bindUI() {
      this.host.querySelector('#br-attack-btn').addEventListener('click', () => this.useAttack());
      this.host.querySelector('#br-skill-btn').addEventListener('click', () => this.toggleSubSkills());
      this.host.querySelector('#br-auto-btn').addEventListener('click', () => this.toggleAuto());
      this.host.querySelector('#br-restart-btn').addEventListener('click', () => this.restart());
      this.host.querySelectorAll('#br-sub-skills .br-sub-skill-slot').forEach((btn) => {
        btn.addEventListener('click', () => this.useSubSkill(btn.dataset.skill));
      });
    }

    startRunner() { if (this.isRunning) return; this.isRunning = true; this.parallaxLayers.forEach(l => l.el.classList.add('br-parallax-scrolling', l.speedClass)); this.dom.player.className = 'run'; this.gameLoop(); }
    stopRunner() { this.isRunning = false; this.parallaxLayers.forEach(l => l.el.classList.remove('br-parallax-scrolling', l.speedClass)); this.dom.player.className = 'idle'; }

    gameLoop() {
      if (!this.isRunning) return;
      if (this.state === GameStates.MOVING) {
        this.progress += this.progressSpeed; this.updateProgressBar(); this.checkTriggers();
        if (this.progress >= 100) {
          this.progress = 0;
          this.currentTriggerIndex = 0;
          this.roundCount += 1;
          const roundLabel = this.roundCount === 2 ? 'Segunda Ronda' : `Ronda #${this.roundCount}`;
          this.showNotification(`🔄 ${roundLabel}`, 1500);
          this.showCombatLog(`¡${roundLabel} comenzada!`);
        }
      }
      requestAnimationFrame(() => this.gameLoop());
    }

    updateProgressBar() { const pct = Math.min(this.progress, 100); this.dom.progressBar.style.width = `${pct}%`; this.dom.progressText.textContent = `${Math.floor(pct)}%`; }
    checkTriggers() { if (this.currentTriggerIndex >= this.triggerPoints.length) return; if (this.progress >= this.triggerPoints[this.currentTriggerIndex]) { this.currentTriggerIndex += 1; this.triggerEncounter(); } }

    triggerEncounter() {
      this.state = GameStates.ENCOUNTER; this.stopRunner(); this.dom.encounterFlash.classList.add('active');
      setTimeout(() => this.dom.encounterFlash.classList.remove('active'), 400); this.showNotification('¡ENCUENTRO!', 1200);
      const enemyIdx = (this.roundCount * this.triggerPoints.length) + this.currentTriggerIndex - 1;
      const enemyData = EnemyTypes[enemyIdx % EnemyTypes.length];
      const missionHp = this.missionEnemyProfile.hp > 0 ? this.missionEnemyProfile.hp : enemyData.hp;
      const missionAtk = this.missionEnemyProfile.atk > 0 ? this.missionEnemyProfile.atk : enemyData.atk;
      const missionDef = this.missionEnemyProfile.def >= 0 ? this.missionEnemyProfile.def : enemyData.def;
      this.enemy = {
        hp: missionHp,
        maxHp: missionHp,
        mp: enemyData.mp,
        maxMp: enemyData.mp,
        atk: missionAtk,
        defense: missionDef,
        name: enemyData.name,
        index: enemyIdx
      };
      setTimeout(() => { this.dom.enemy.classList.add('visible'); this.updateEnemyHP(); this.updateEnemyMP(); this.state = GameStates.COMBAT; this.isPlayerTurn = true; this.combatLocked = false; this.showCombatLog(`¡${this.enemy.name} aparece!`); if (this.autoMode) setTimeout(() => this.autoCombatAction(), 500); }, 600);
    }

    useAttack() { if (this.state !== GameStates.COMBAT || this.combatLocked || !this.isPlayerTurn) return; this.combatLocked = true; this.dom.player.className = 'attack'; setTimeout(() => { const rawDamage = this.player.atk + Math.floor(Math.random()*5)-2; const damage = Math.max(1, rawDamage - this.enemy.defense); this.enemy.hp = Math.max(0, this.enemy.hp - damage); this.updateEnemyHP(); this.showDamageNumber(damage, this.dom.enemy); this.showHitEffect(this.dom.enemy); this.showCombatLog(`Atacas por ${damage} de daño!`); if (this.enemy.hp <= 0) setTimeout(() => this.enemyDefeated(), 400); else { this.isPlayerTurn = false; setTimeout(() => this.enemyTurn(), 800); } setTimeout(() => { this.dom.player.className = 'idle'; this.combatLocked = false; }, 400); }, 350); }

    useSubSkill(type) {
      if (this.state !== GameStates.COMBAT || this.combatLocked || !this.isPlayerTurn) return;
      const skillData = { fire: { name: '🔥 Bola de Fuego', dmg: 25, mpCost: 15 }, water: { name: '🌊 Torbellino', dmg: 20, mpCost: 12 }, wind: { name: '🌪 Corte Viento', dmg: 15, mpCost: 8 } };
      const skill = skillData[type]; if (!skill) return; this.combatLocked = true; this.closeSubSkills();
      if (this.player.mp < skill.mpCost) { this.showCombatLog('❌ ¡MP insuficiente!'); this.combatLocked = false; return; }
      this.player.mp -= skill.mpCost; this.updatePlayerMP(); this.dom.player.className = 'attack';
      setTimeout(() => { const rawDamage = skill.dmg + Math.floor(Math.random()*4)-1; const damage = Math.max(1, rawDamage - this.enemy.defense); this.enemy.hp = Math.max(0, this.enemy.hp - damage); this.updateEnemyHP(); this.showDamageNumber(damage, this.dom.enemy); this.showHitEffect(this.dom.enemy); this.showCombatLog(`${skill.name} — ${damage} de daño!`); if (this.enemy.hp <= 0) setTimeout(() => this.enemyDefeated(), 400); else { this.isPlayerTurn = false; setTimeout(() => this.enemyTurn(), 800); } setTimeout(() => { this.dom.player.className = 'idle'; this.combatLocked = false; }, 400); }, 350);
    }

    enemyTurn() {
      if (this.state !== GameStates.COMBAT) return;
      this.dom.enemy.classList.add('enemy-attack');
      setTimeout(() => { const damage = Math.max(1, this.enemy.atk + Math.floor(Math.random()*4)-2 - this.player.defense); this.player.hp = Math.max(0, this.player.hp - damage); this.updatePlayerHP(); this.showDamageNumber(damage, this.dom.player); this.showHitEffect(this.dom.player); this.showCombatLog(`${this.enemy.name} ataca por ${damage}!`); if (this.player.hp <= 0) { this.syncBattleVitals(); this.showNotification('¡DERROTADO!', 2000); setTimeout(() => this.missionComplete(), 1200); return; } setTimeout(() => { this.dom.enemy.classList.remove('enemy-attack'); this.isPlayerTurn = true; this.combatLocked = false; if (this.autoMode) setTimeout(() => this.autoCombatAction(), 500); }, 400); }, 450);
    }

    autoCombatAction() { if (this.state !== GameStates.COMBAT || !this.autoMode || this.player.hp <= 0 || this.enemy.hp <= 0) return; const roll = Math.random(); if (roll < 0.25 && this.player.mp >= 8) { const skills = ['fire','water','wind']; const costs = { fire: 15, water: 12, wind: 8 }; const available = skills.filter(s => this.player.mp >= costs[s]); if (available.length) this.useSubSkill(available[Math.floor(Math.random()*available.length)]); else this.useAttack(); } else this.useAttack(); }
    toggleAuto() { this.autoMode = !this.autoMode; const icon = this.dom.autoBtn.querySelector('.skill-icon'); if (this.autoMode) { this.dom.autoBtn.classList.add('active'); icon.textContent='✅'; if (this.state===GameStates.COMBAT && this.isPlayerTurn) setTimeout(()=>this.autoCombatAction(),250);} else { this.dom.autoBtn.classList.remove('active'); icon.textContent='❎'; } }

    enemyDefeated() {
      this.state = GameStates.VICTORY;
      this.dom.enemy.classList.add('defeated');
      this.dom.player.className = 'victory';
      this.showNotification('¡VICTORIA!', 1500);
      this.showCombatLog(`¡${this.enemy.name} derrotado!`);
      this.spawnVictoryParticles();

      if (typeof this.options.onVictory === 'function') {
        this.options.onVictory({ enemy: { ...this.enemy }, round: this.roundCount });
      }

      setTimeout(() => {
        this.dom.enemy.classList.remove('visible', 'defeated');
        this.dom.player.className = 'idle';
        this.state = GameStates.MOVING;
        this.startRunner();
      }, 1200);
    }

    updatePlayerHP() { const pct = (this.player.hp / this.player.maxHp) * 100; this.dom.hpPlayerBar.style.width = `${pct}%`; this.dom.hpPlayerText.textContent = `${this.player.hp}/${this.player.maxHp}`; this.syncBattleVitals(); }
    updatePlayerMP() { const pct = (this.player.mp / this.player.maxMp) * 100; this.dom.mpPlayerBar.style.width = `${pct}%`; this.dom.mpPlayerText.textContent = `${this.player.mp}/${this.player.maxMp}`; this.syncBattleVitals(); }
    updateEnemyHP() { const pct = this.enemy.maxHp ? (this.enemy.hp / this.enemy.maxHp) * 100 : 0; this.dom.hpEnemyBar.style.width = `${pct}%`; this.dom.hpEnemyText.textContent = `${this.enemy.hp}/${this.enemy.maxHp}`; }
    updateEnemyMP() { const pct = this.enemy.maxMp ? (this.enemy.mp / this.enemy.maxMp) * 100 : 0; this.dom.mpEnemyBar.style.width = `${pct}%`; this.dom.mpEnemyText.textContent = `${this.enemy.mp}/${this.enemy.maxMp}`; }

    showDamageNumber(damage, target) { const el = document.createElement('div'); el.className = 'br-damage-number'; el.textContent = `-${damage}`; const rect = target.getBoundingClientRect(); const c = this.dom.container.getBoundingClientRect(); el.style.left = `${rect.left - c.left + rect.width / 2 - 10}px`; el.style.top = `${rect.top - c.top}px`; this.dom.container.appendChild(el); setTimeout(() => el.remove(), 800); }
    showHitEffect(target) { const el = document.createElement('div'); el.className = 'br-hit-effect'; const rect = target.getBoundingClientRect(); const c = this.dom.container.getBoundingClientRect(); el.style.left = `${rect.left - c.left + rect.width/2 - 15}px`; el.style.top = `${rect.top - c.top + rect.height/2 - 15}px`; this.dom.container.appendChild(el); setTimeout(() => el.remove(), 400); }
    showNotification(text, duration=1200) { this.dom.notification.textContent = text; this.dom.notification.className = ''; void this.dom.notification.offsetWidth; this.dom.notification.classList.add('show'); setTimeout(() => this.dom.notification.classList.remove('show'), duration); }
    showCombatLog(text) { this.dom.combatLog.textContent = text; this.dom.combatLog.classList.add('visible'); clearTimeout(this._logTimeout); this._logTimeout = setTimeout(() => this.dom.combatLog.classList.remove('visible'), 2000); }
    spawnVictoryParticles() { this.dom.victoryParticles.innerHTML = ''; const colors = ['#ffcc00','#ff6644','#44cc66','#4488ff','#ff44aa']; for (let i=0;i<20;i+=1){const p=document.createElement('div'); p.className='br-victory-particle'; p.style.background=colors[Math.floor(Math.random()*colors.length)]; p.style.left='50%'; p.style.top='50%'; p.style.setProperty('--tx', `${Math.random()*200-100}px`); p.style.setProperty('--ty', `${Math.random()*200-100}px`); this.dom.victoryParticles.appendChild(p);} setTimeout(()=>{this.dom.victoryParticles.innerHTML='';},1200); }


    syncBattleVitals() {
      if (typeof this.options.onPlayerVitalsChange !== 'function') return;
      this.options.onPlayerVitalsChange({
        hp: this.player.hp,
        mp: this.player.mp,
        maxHp: this.player.maxHp,
        maxMp: this.player.maxMp
      });
    }

    toggleSubSkills() { this.subSkillsVisible = !this.subSkillsVisible; this.dom.subSkills.classList.toggle('visible', this.subSkillsVisible); }
    closeSubSkills() { this.subSkillsVisible = false; this.dom.subSkills.classList.remove('visible'); }

    missionComplete() { this.state = GameStates.MISSION_DONE; this.stopRunner(); this.dom.missionComplete.classList.add('visible'); }
    restart() { this.dom.missionComplete.classList.remove('visible'); this.state = GameStates.MOVING; this.progress = 0; this.currentTriggerIndex = 0; this.roundCount = 1; this.player.hp = this.player.maxHp; this.player.mp = this.player.maxMp; this.updateProgressBar(); this.updatePlayerHP(); this.updatePlayerMP(); this.startRunner(); }
    destroy() { this.stopRunner(); this.host.innerHTML = ''; }
  }

  const BattleRunnerSystem = {
    instance: null,
    mount(host, options = {}) { this.unmount(); if (!host) return; this.instance = new BattleRunner(host, options); },
    unmount() { if (!this.instance) return; this.instance.destroy(); this.instance = null; }
  };

  window.BattleRunnerSystem = BattleRunnerSystem;
})();
