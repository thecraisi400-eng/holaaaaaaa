/**
 * Módulo: batallamisionrangod.js
 * Descripción: Sistema de combate "Battle Runner — Ninja Saga (Modo Infinito)" para Misiones Rango D.
 * Dependencias DOM: requiere un contenedor raíz con el HTML del juego (IDs #game-container, #player, #enemy, etc.).
 * Integración: cargar este archivo y llamar a window.initBattleRangoD(rootElement, options) al abrir una misión Rango D.
 */

// =============================================
// JAVASCRIPT — LÓGICA DEL JUEGO (FSM)
// =============================================
const GameStates = Object.freeze({
  MOVING: 'MOVING',
  ENCOUNTER: 'ENCOUNTER',
  COMBAT: 'COMBAT',
  VICTORY: 'VICTORY',
  MISSION_DONE: 'MISSION_DONE'
});

const EnemyTypes = [
  { name: 'Bandido Sombra', hp: 80, mp: 30, atk: 2, color: '#4a2a2a' },
  { name: 'Oni de Hierro', hp: 100, mp: 40, atk: 3, color: '#3a3a4a' },
  { name: 'Demonio Bosque', hp: 120, mp: 50, atk: 4, color: '#2a4a2a' }
];

class BattleRunner {
  constructor(root, options = {}) {
    this.root = root;
    this.options = options;

    this.state = GameStates.MOVING;
    this.progress = 0;
    this.progressSpeed = 0.08;
    this.isRunning = false;
    this.roundCount = 0; // 🔁 Contador de rondas para modo infinito

    this.player = {
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      atk: 18,
      defense: 5
    };

    this.enemy = {
      hp: 0,
      maxHp: 0,
      mp: 0,
      maxMp: 0,
      atk: 0,
      name: '',
      index: 0
    };

    this.autoMode = false;
    this.autoInterval = null;
    this.isPlayerTurn = true;
    this.combatLocked = false;
    this.subSkillsVisible = false;

    this.triggerPoints = [30, 60, 90];
    this.currentTriggerIndex = 0;
    this.triggersFired = [false, false, false];

    this.dom = {};
    this.cacheDOM();

    this.parallaxLayers = [];
    this.initParallax();

    this.bindRestart();
    this.startRunner();
  }

  // ===== Cacheo de nodos DOM =====
  cacheDOM() {
    this.dom.player = this.root.querySelector('#player');
    this.dom.enemy = this.root.querySelector('#enemy');
    this.dom.progressBar = this.root.querySelector('#progress-bar');
    this.dom.progressText = this.root.querySelector('#progress-text');
    this.dom.combatPanel = this.root.querySelector('#combat-panel');
    this.dom.subSkills = this.root.querySelector('#sub-skills');
    this.dom.hpPlayerBar = this.root.querySelector('#hp-player-bar');
    this.dom.hpPlayerText = this.root.querySelector('#hp-player-text');
    this.dom.mpPlayerBar = this.root.querySelector('#mp-player-bar');
    this.dom.mpPlayerText = this.root.querySelector('#mp-player-text');
    this.dom.hpEnemyBar = this.root.querySelector('#hp-enemy-bar');
    this.dom.hpEnemyText = this.root.querySelector('#hp-enemy-text');
    this.dom.mpEnemyBar = this.root.querySelector('#mp-enemy-bar');
    this.dom.mpEnemyText = this.root.querySelector('#mp-enemy-text');
    this.dom.notification = this.root.querySelector('#notification');
    this.dom.encounterFlash = this.root.querySelector('#encounter-flash');
    this.dom.victoryParticles = this.root.querySelector('#victory-particles');
    this.dom.combatLog = this.root.querySelector('#combat-log');
    this.dom.autoBtn = this.root.querySelector('#auto-btn');
    this.dom.missionComplete = this.root.querySelector('#mission-complete');
    this.dom.container = this.root.querySelector('#game-container');
    this.dom.restartBtn = this.root.querySelector('#restart-btn');
  }

  bindRestart() {
    if (this.dom.restartBtn) {
      this.dom.restartBtn.addEventListener('click', () => this.restart());
    }
  }

  // ===== Configuración de parallax =====
  initParallax() {
    this.parallaxLayers = [
      { el: this.root.querySelector('#layer-sky'), speedClass: 'speed-slow' },
      { el: this.root.querySelector('#layer-mountains'), speedClass: 'speed-slow' },
      { el: this.root.querySelector('#layer-trees-back'), speedClass: 'speed-medium' },
      { el: this.root.querySelector('#layer-trees-front'), speedClass: 'speed-fast' },
      { el: this.root.querySelector('#layer-ground'), speedClass: 'speed-fastest' },
      { el: this.root.querySelector('#layer-dust'), speedClass: 'speed-fastest' },
      { el: this.root.querySelector('#layer-grass'), speedClass: 'speed-fast' }
    ].filter((layer) => Boolean(layer.el));
  }

  startRunner() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.parallaxLayers.forEach((layer) => {
      layer.el.classList.add('parallax-scrolling', layer.speedClass);
    });

    this.dom.player.className = 'run';
    this.gameLoop();
  }

  stopRunner() {
    this.isRunning = false;

    this.parallaxLayers.forEach((layer) => {
      layer.el.classList.remove('parallax-scrolling', layer.speedClass);
    });

    this.dom.player.className = 'idle';
  }

  gameLoop() {
    if (!this.isRunning) return;

    if (this.state === GameStates.MOVING) {
      this.progress += this.progressSpeed;
      this.updateProgressBar();
      this.checkTriggers();

      // 🔁 MODO INFINITO: Al llegar al 100%, reiniciar progresión en lugar de terminar
      if (this.progress >= 100) {
        this.progress = 0;
        this.currentTriggerIndex = 0;
        this.triggersFired = [false, false, false];
        this.roundCount++;

        this.showNotification(`🔄 Ronda #${this.roundCount + 1}`, 1500);
        this.showCombatLog('¡Nueva ronda comenzada!');

        // 🔁 Opcional: Curar parcialmente al jugador entre rondas (20% HP/MP)
        const healAmount = Math.floor(this.player.maxHp * 0.2);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + Math.floor(this.player.maxMp * 0.2));
        this.updatePlayerHP();
        this.updatePlayerMP();

        this.updateProgressBar();
        // Continuar el bucle sin detenerse
      }
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  updateProgressBar() {
    const pct = Math.min(this.progress, 100);
    this.dom.progressBar.style.width = `${pct}%`;
    this.dom.progressText.textContent = `${Math.floor(pct)}%`;
  }

  checkTriggers() {
    if (this.currentTriggerIndex >= this.triggerPoints.length) return;

    const nextTrigger = this.triggerPoints[this.currentTriggerIndex];
    if (this.progress >= nextTrigger) {
      this.triggersFired[this.currentTriggerIndex] = true;
      this.currentTriggerIndex++;
      this.triggerEncounter();
    }
  }

  triggerEncounter() {
    this.state = GameStates.ENCOUNTER;
    this.stopRunner();

    this.dom.encounterFlash.classList.add('active');
    setTimeout(() => this.dom.encounterFlash.classList.remove('active'), 400);

    this.showNotification('¡ENCUENTRO!', 1200);

    // 🔁 Usar módulo para ciclos infinitos de enemigos
    const enemyIdx = (this.roundCount * this.triggerPoints.length) + this.currentTriggerIndex - 1;
    const enemyData = EnemyTypes[enemyIdx % EnemyTypes.length];
    this.enemy = {
      hp: enemyData.hp,
      maxHp: enemyData.hp,
      mp: enemyData.mp,
      maxMp: enemyData.mp,
      atk: enemyData.atk,
      name: enemyData.name,
      index: enemyIdx
    };

    setTimeout(() => {
      this.dom.enemy.classList.add('visible');
      this.updateEnemyHP();
      this.updateEnemyMP();

      this.state = GameStates.COMBAT;
      this.isPlayerTurn = true;
      this.combatLocked = false;
      this.updatePlayerHP();
      this.updatePlayerMP();
      this.showCombatLog(`¡${this.enemy.name} aparece!`);

      if (this.autoMode && this.isPlayerTurn) {
        setTimeout(() => this.autoCombatAction(), 500);
      }
    }, 600);
  }

  useAttack() {
    if (this.state !== GameStates.COMBAT || this.combatLocked || !this.isPlayerTurn) return;
    this.combatLocked = true;

    this.dom.player.className = 'attack';

    setTimeout(() => {
      const baseDmg = this.player.atk;
      const variance = Math.floor(Math.random() * 5) - 2;
      const damage = Math.max(1, baseDmg + variance);

      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      this.updateEnemyHP();

      this.showDamageNumber(damage, this.dom.enemy);
      this.showHitEffect(this.dom.enemy);
      this.dom.container.classList.add('shake');
      setTimeout(() => this.dom.container.classList.remove('shake'), 300);

      this.showCombatLog(`Atacas por ${damage} de daño!`);

      if (this.enemy.hp <= 0) {
        setTimeout(() => this.enemyDefeated(), 400);
      } else {
        this.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 800);
      }

      setTimeout(() => {
        this.dom.player.className = 'idle';
        this.combatLocked = false;
      }, 400);
    }, 350);
  }

  useSubSkill(type) {
    if (this.state !== GameStates.COMBAT || this.combatLocked || !this.isPlayerTurn) return;
    this.combatLocked = true;
    this.closeSubSkills();

    const skillData = {
      fire: { name: '🔥 Bola de Fuego', dmg: 25, mpCost: 15, color: '#ff4422' },
      water: { name: '🌊 Torbellino', dmg: 20, mpCost: 12, color: '#4488ff' },
      wind: { name: '🌪 Corte Viento', dmg: 15, mpCost: 8, color: '#44cc66' }
    };

    const skill = skillData[type];
    if (!skill) {
      this.combatLocked = false;
      return;
    }

    if (this.player.mp < skill.mpCost) {
      this.showCombatLog('❌ ¡MP insuficiente!');
      this.combatLocked = false;
      return;
    }

    this.player.mp -= skill.mpCost;
    this.updatePlayerMP();

    this.dom.player.className = 'attack';

    setTimeout(() => {
      const damage = skill.dmg + Math.floor(Math.random() * 4) - 1;
      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      this.updateEnemyHP();

      this.showDamageNumber(damage, this.dom.enemy);
      this.showHitEffect(this.dom.enemy);
      this.dom.container.classList.add('shake');
      setTimeout(() => this.dom.container.classList.remove('shake'), 300);

      this.showCombatLog(`${skill.name} — ${damage} de daño!`);

      if (this.enemy.hp <= 0) {
        setTimeout(() => this.enemyDefeated(), 400);
      } else {
        this.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 800);
      }

      setTimeout(() => {
        this.dom.player.className = 'idle';
        this.combatLocked = false;
      }, 400);
    }, 350);
  }

  enemyTurn() {
    if (this.state !== GameStates.COMBAT) return;

    this.dom.enemy.classList.add('enemy-attack');

    setTimeout(() => {
      const baseDmg = this.enemy.atk;
      const variance = Math.floor(Math.random() * 4) - 2;
      const damage = Math.max(1, baseDmg + variance - this.player.defense);

      this.player.hp = Math.max(0, this.player.hp - damage);
      this.updatePlayerHP();

      this.showDamageNumber(damage, this.dom.player);
      this.showHitEffect(this.dom.player);
      this.dom.container.classList.add('shake');
      setTimeout(() => this.dom.container.classList.remove('shake'), 300);

      this.showCombatLog(`${this.enemy.name} ataca por ${damage}!`);

      if (this.player.hp <= 0) {
        this.showNotification('¡DERROTADO!', 2000);
        setTimeout(() => {
          this.stopAutoCombat();
          this.missionComplete();
          if (typeof this.options.onDefeat === 'function') {
            this.options.onDefeat();
          }
        }, 1500);
        return;
      }

      setTimeout(() => {
        this.dom.enemy.classList.remove('enemy-attack');
        this.isPlayerTurn = true;
        this.combatLocked = false;

        if (this.autoMode) {
          setTimeout(() => this.autoCombatAction(), 500);
        }
      }, 400);
    }, 450);
  }

  autoCombatAction() {
    if (this.state !== GameStates.COMBAT || !this.autoMode || this.player.hp <= 0 || this.enemy.hp <= 0) return;

    const roll = Math.random();
    if (roll < 0.25 && this.player.mp >= 8) {
      const skills = ['fire', 'water', 'wind'];
      const availableSkills = skills.filter((s) => {
        const costs = { fire: 15, water: 12, wind: 8 };
        return this.player.mp >= costs[s];
      });
      if (availableSkills.length > 0) {
        const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        this.useSubSkill(skill);
      } else {
        this.useAttack();
      }
    } else {
      this.useAttack();
    }
  }

  toggleAuto() {
    this.autoMode = !this.autoMode;

    const iconSpan = this.dom.autoBtn.querySelector('.skill-icon');
    if (this.autoMode) {
      this.dom.autoBtn.classList.add('active');
      iconSpan.textContent = '✅';
      this.showCombatLog('🔄 Auto Combat ACTIVADO');
      if (this.isPlayerTurn && this.state === GameStates.COMBAT) {
        setTimeout(() => this.autoCombatAction(), 300);
      }
    } else {
      this.dom.autoBtn.classList.remove('active');
      iconSpan.textContent = '❎';
      this.showCombatLog('Auto Combat DESACTIVADO');
      this.stopAutoCombat();
    }
  }

  stopAutoCombat() {
    this.autoMode = false;
    this.dom.autoBtn.classList.remove('active');
    const iconSpan = this.dom.autoBtn.querySelector('.skill-icon');
    if (iconSpan) iconSpan.textContent = '❎';
  }

  enemyDefeated() {
    this.state = GameStates.VICTORY;
    this.closeSubSkills();

    this.dom.enemy.classList.add('defeated');
    this.dom.player.className = 'victory';

    this.showNotification('¡VICTORIA!', 1500);
    this.showCombatLog(`¡${this.enemy.name} derrotado!`);

    if (typeof this.options.onEnemyDefeated === 'function') {
      this.options.onEnemyDefeated(this.enemy);
    }

    this.spawnVictoryParticles();

    setTimeout(() => {
      this.dom.enemy.classList.remove('visible', 'defeated');
      this.dom.enemy.classList.add('visible');
      this.dom.enemy.classList.remove('visible');
      this.dom.player.className = 'idle';

      this.state = GameStates.MOVING;
      this.startRunner();
    }, 2200);
  }

  updatePlayerHP() {
    const pct = (this.player.hp / this.player.maxHp) * 100;
    this.dom.hpPlayerBar.style.width = `${pct}%`;
    this.dom.hpPlayerText.textContent = `${this.player.hp}/${this.player.maxHp}`;

    if (pct <= 25) {
      this.dom.hpPlayerBar.style.background = 'linear-gradient(90deg, #cc2222, #ee4444)';
    } else if (pct <= 50) {
      this.dom.hpPlayerBar.style.background = 'linear-gradient(90deg, #cc8822, #eeaa44)';
    } else {
      this.dom.hpPlayerBar.style.background = 'linear-gradient(90deg, #22aa44, #44cc66)';
    }
  }

  updatePlayerMP() {
    const pct = (this.player.mp / this.player.maxMp) * 100;
    this.dom.mpPlayerBar.style.width = `${pct}%`;
    this.dom.mpPlayerText.textContent = `${this.player.mp}/${this.player.maxMp}`;
  }

  updateEnemyHP() {
    const pct = this.enemy.maxHp > 0 ? (this.enemy.hp / this.enemy.maxHp) * 100 : 0;
    this.dom.hpEnemyBar.style.width = `${pct}%`;
    this.dom.hpEnemyText.textContent = `${this.enemy.hp}/${this.enemy.maxHp}`;
  }

  updateEnemyMP() {
    const pct = this.enemy.maxMp > 0 ? (this.enemy.mp / this.enemy.maxMp) * 100 : 0;
    this.dom.mpEnemyBar.style.width = `${pct}%`;
    this.dom.mpEnemyText.textContent = `${this.enemy.mp}/${this.enemy.maxMp}`;
  }

  showDamageNumber(damage, target) {
    const el = document.createElement('div');
    el.className = 'damage-number';
    el.textContent = `-${damage}`;

    const rect = target.getBoundingClientRect();
    const containerRect = this.dom.container.getBoundingClientRect();

    el.style.left = `${rect.left - containerRect.left + rect.width / 2 - 10}px`;
    el.style.top = `${rect.top - containerRect.top}px`;

    this.dom.container.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  showHitEffect(target) {
    const el = document.createElement('div');
    el.className = 'hit-effect';

    const rect = target.getBoundingClientRect();
    const containerRect = this.dom.container.getBoundingClientRect();

    el.style.left = `${rect.left - containerRect.left + rect.width / 2 - 15}px`;
    el.style.top = `${rect.top - containerRect.top + rect.height / 2 - 15}px`;

    this.dom.container.appendChild(el);
    setTimeout(() => el.remove(), 400);
  }

  showNotification(text, duration = 1200) {
    this.dom.notification.textContent = text;
    this.dom.notification.className = '';
    void this.dom.notification.offsetWidth;
    this.dom.notification.classList.add('show');
    setTimeout(() => {
      this.dom.notification.classList.remove('show');
    }, duration);
  }

  showCombatLog(text) {
    this.dom.combatLog.textContent = text;
    this.dom.combatLog.classList.add('visible');
    clearTimeout(this._logTimeout);
    this._logTimeout = setTimeout(() => {
      this.dom.combatLog.classList.remove('visible');
    }, 2000);
  }

  spawnVictoryParticles() {
    this.dom.victoryParticles.innerHTML = '';
    const colors = ['#ffcc00', '#ff6644', '#44cc66', '#4488ff', '#ff44aa'];

    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'victory-particle';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = '50%';
      p.style.top = '50%';
      p.style.setProperty('--tx', `${Math.random() * 200 - 100}px`);
      p.style.setProperty('--ty', `${Math.random() * 200 - 100}px`);
      p.style.animationDelay = `${Math.random() * 0.3}s`;
      this.dom.victoryParticles.appendChild(p);
    }

    setTimeout(() => {
      this.dom.victoryParticles.innerHTML = '';
    }, 1200);
  }

  toggleSubSkills() {
    this.subSkillsVisible = !this.subSkillsVisible;
    if (this.subSkillsVisible) {
      this.dom.subSkills.classList.add('visible');
    } else {
      this.closeSubSkills();
    }
  }

  closeSubSkills() {
    this.subSkillsVisible = false;
    this.dom.subSkills.classList.remove('visible');
  }

  missionComplete() {
    // 🔁 Esta función se mantiene por compatibilidad, pero en modo infinito
    // solo se llama si el jugador es derrotado
    this.state = GameStates.MISSION_DONE;
    this.isRunning = false;
    this.stopAutoCombat();
    this.closeSubSkills();

    if (this.player.hp <= 0) {
      this.showNotification('¡GAME OVER!', 2000);
    } else {
      this.showNotification('¡MISIÓN COMPLETADA!', 2000);
    }

    setTimeout(() => {
      this.dom.missionComplete.classList.add('visible');
    }, 1000);
  }

  restart() {
    this.state = GameStates.MOVING;
    this.progress = 0;
    this.currentTriggerIndex = 0;
    this.triggersFired = [false, false, false];
    this.autoMode = false;
    this.isPlayerTurn = true;
    this.combatLocked = false;
    this.subSkillsVisible = false;
    this.roundCount = 0; // 🔁 Reset contador de rondas

    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;

    this.updateProgressBar();
    this.updatePlayerHP();
    this.updatePlayerMP();
    this.updateEnemyHP();
    this.updateEnemyMP();

    this.dom.player.className = 'idle';
    this.dom.enemy.classList.remove('visible', 'defeated');
    this.dom.missionComplete.classList.remove('visible');
    const iconSpan = this.dom.autoBtn.querySelector('.skill-icon');
    if (iconSpan) iconSpan.textContent = '❎';
    this.dom.autoBtn.classList.remove('active');
    this.dom.combatLog.classList.remove('visible');
    this.dom.victoryParticles.innerHTML = '';

    this.startRunner();
  }

  destroy() {
    this.stopRunner();
    clearTimeout(this._logTimeout);
  }
}

function initBattleRangoD(root, options = {}) {
  const game = new BattleRunner(root, options);
  window.game = game;
  return game;
}

window.BattleRunner = BattleRunner;
window.GameStates = GameStates;
window.EnemyTypes = EnemyTypes;
window.initBattleRangoD = initBattleRangoD;

// Inicialización segura opcional para integración directa en páginas aisladas.
document.addEventListener('DOMContentLoaded', () => {
  const autoRoot = document.querySelector('[data-battle-rangod-autostart]');
  if (autoRoot && !window.game) {
    window.game = new BattleRunner(autoRoot);
  }
});
