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
  { name: 'Bandido Sombra', hp: 80, mp: 30, atk: 2, def: 1, color: '#4a2a2a' },
  { name: 'Oni de Hierro', hp: 100, mp: 40, atk: 3, def: 2, color: '#3a3a4a' },
  { name: 'Demonio Bosque', hp: 120, mp: 50, atk: 4, def: 3, color: '#2a4a2a' }
];

const BattleAssetCache = window.__ngsBattleAssetCache || new Map();
window.__ngsBattleAssetCache = BattleAssetCache;

function loadAssetImage(src) {
  if (!src) return Promise.reject(new Error('Ruta de asset vacía'));
  if (BattleAssetCache.has(src)) return BattleAssetCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`No se pudo cargar asset: ${src}`));
    img.src = src;
  });
  BattleAssetCache.set(src, promise);
  return promise;
}

class BattleRunner {
  constructor(root, options = {}) {
    this.root = root;
    this.options = options;

    this.state = GameStates.MOVING;
    this.progress = 0;
    this.progressSpeed = 0.08;
    this.isRunning = false;
    this.roundCount = 0; // 🔁 Contador de rondas para modo infinito

    const globalState = window.GameState && typeof window.GameState.getState === 'function'
      ? window.GameState.getState()
      : null;
    this.player = {
      hp: globalState?.hp ?? 100,
      maxHp: globalState?.hpMax ?? 100,
      mp: globalState?.mp ?? 50,
      maxMp: globalState?.mpMax ?? 50,
      atk: globalState?.atk ?? 18,
      defense: globalState?.def ?? 5
    };

    this.enemy = {
      hp: 0,
      maxHp: 0,
      mp: 0,
      maxMp: 0,
      atk: 0,
      def: 0,
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
    this.destroyed = false;
    this.rafId = null;
    this.managedTimeouts = new Set();
    this.cacheDOM();
    this.playerAnimationClass = 'idle';
    this.playerVisual = {
      src: '',
      status: 'placeholder',
      requestId: 0,
      lastStableSrc: ''
    };
    this.enemyVisual = { timer: null };

    this.parallaxLayers = [];
    this.initParallax();

    this.handleRestart = this.restart.bind(this);
    this.bindRestart();
    this.handleStateUpdated = this.handleStateUpdated.bind(this);
    window.addEventListener('ngs:state-updated', this.handleStateUpdated);
    this.syncPlayerFromGlobal();
    this.syncPlayerVisualFromGlobal(true);
    this.configureEnemyVisual(this.options.enemyVisualConfig || null);
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
      this.dom.restartBtn.addEventListener('click', this.handleRestart);
    }
  }

  setManagedTimeout(callback, delay) {
    if (this.destroyed) return null;
    const timeoutId = setTimeout(() => {
      this.managedTimeouts.delete(timeoutId);
      if (this.destroyed) return;
      callback();
    }, delay);
    this.managedTimeouts.add(timeoutId);
    return timeoutId;
  }

  clearManagedTimeouts() {
    this.managedTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.managedTimeouts.clear();
  }

  handleStateUpdated() {
    this.syncPlayerFromGlobal();
    this.syncPlayerVisualFromGlobal();
    this.updatePlayerHP();
    this.updatePlayerMP();
  }

  syncPlayerFromGlobal() {
    if (!window.GameState || typeof window.GameState.getState !== 'function') return;
    const gameState = window.GameState.getState();
    this.player.maxHp = gameState.hpMax;
    this.player.maxMp = gameState.mpMax;
    this.player.hp = Math.max(0, Math.min(this.player.maxHp, gameState.hp));
    this.player.mp = Math.max(0, Math.min(this.player.maxMp, gameState.mp));
    this.player.atk = gameState.atk;
    this.player.defense = gameState.def;
  }

  setPlayerAnimation(nextClass) {
    const allowed = ['idle', 'run', 'attack', 'victory'];
    if (!allowed.includes(nextClass)) return;
    this.dom.player.classList.remove(...allowed);
    this.dom.player.classList.add(nextClass);
    this.playerAnimationClass = nextClass;
  }

  getPlayerVisualFromState() {
    const gameState = window.GameState && typeof window.GameState.getState === 'function'
      ? window.GameState.getState()
      : null;
    return gameState?.characterVisual || null;
  }

  resolvePlayerSpriteSrc() {
    const visual = this.getPlayerVisualFromState();
    if (visual?.spriteSrc) return visual.spriteSrc;

    // Fallback resiliente por si la batalla inicia antes de sincronizar GameState.
    try {
      const rawSave = localStorage.getItem('ngs_rpg_save_data');
      if (!rawSave) return '';
      const parsed = JSON.parse(rawSave);
      return parsed?.characterSprite || '';
    } catch (error) {
      return '';
    }
  }

  syncPlayerVisualFromGlobal(force = false) {
    const nextSrc = this.resolvePlayerSpriteSrc();
    if (!force && nextSrc === this.playerVisual.src) return;
    this.applyPlayerVisual(nextSrc);
  }

  ensurePlayerVisualElements() {
    if (this.dom.playerSpriteSheet && this.dom.playerPlaceholder) return;
    let spriteEl = this.dom.player.querySelector('.player-sprite-sheet');
    if (!spriteEl) {
      spriteEl = document.createElement('div');
      spriteEl.className = 'player-sprite-sheet';
      this.dom.player.appendChild(spriteEl);
    }
    let placeholderEl = this.dom.player.querySelector('.player-sprite-placeholder');
    if (!placeholderEl) {
      placeholderEl = document.createElement('div');
      placeholderEl.className = 'player-sprite-placeholder';
      placeholderEl.textContent = '🥷';
      this.dom.player.appendChild(placeholderEl);
    }
    this.dom.playerSpriteSheet = spriteEl;
    this.dom.playerPlaceholder = placeholderEl;
  }

  async applyPlayerVisual(spriteSrc = '') {
    this.ensurePlayerVisualElements();
    const requestId = ++this.playerVisual.requestId;
    this.playerVisual.src = spriteSrc;
    this.dom.player.classList.add('player-sprite-mode');

    // Mantener último sprite estable evita parpadeo en transiciones de estado.
    if (!spriteSrc) {
      if (this.playerVisual.lastStableSrc) {
        this.playerVisual.status = 'ready';
        this.dom.player.classList.remove('player-sprite-fallback');
        this.dom.playerSpriteSheet.style.backgroundImage = `url("${this.playerVisual.lastStableSrc}")`;
        return;
      }
      this.playerVisual.status = 'placeholder';
      this.dom.player.classList.add('player-sprite-fallback');
      this.dom.playerSpriteSheet.style.backgroundImage = '';
      return;
    }

    try {
      await loadAssetImage(spriteSrc);
      if (this.playerVisual.requestId !== requestId) return;
      this.playerVisual.status = 'ready';
      this.playerVisual.lastStableSrc = spriteSrc;
      this.dom.player.classList.remove('player-sprite-fallback');
      this.dom.playerSpriteSheet.style.backgroundImage = `url("${spriteSrc}")`;
    } catch (error) {
      if (this.playerVisual.requestId !== requestId) return;
      this.playerVisual.status = 'error';
      if (this.playerVisual.lastStableSrc) {
        this.dom.player.classList.remove('player-sprite-fallback');
        this.dom.playerSpriteSheet.style.backgroundImage = `url("${this.playerVisual.lastStableSrc}")`;
        return;
      }
      this.dom.player.classList.add('player-sprite-fallback');
      this.dom.playerSpriteSheet.style.backgroundImage = '';
    }
  }

  ensureEnemyVisualElements() {
    if (this.dom.enemySpriteSheet && this.dom.enemyPlaceholder) return;
    let spriteEl = this.dom.enemy.querySelector('.enemy-sprite-sheet');
    if (!spriteEl) {
      spriteEl = document.createElement('div');
      spriteEl.className = 'enemy-sprite-sheet';
      this.dom.enemy.appendChild(spriteEl);
    }
    let placeholderEl = this.dom.enemy.querySelector('.enemy-sprite-placeholder');
    if (!placeholderEl) {
      placeholderEl = document.createElement('div');
      placeholderEl.className = 'enemy-sprite-placeholder';
      placeholderEl.textContent = '👺';
      this.dom.enemy.appendChild(placeholderEl);
    }
    this.dom.enemySpriteSheet = spriteEl;
    this.dom.enemyPlaceholder = placeholderEl;
  }

  clearEnemyAnimationTimer() {
    if (this.enemyVisual.timer) {
      clearInterval(this.enemyVisual.timer);
      this.enemyVisual.timer = null;
    }
  }

  async configureEnemyVisual(enemyVisualConfig) {
    this.clearEnemyAnimationTimer();
    this.ensureEnemyVisualElements();
    this.enemyVisual.config = enemyVisualConfig || null;

    if (!enemyVisualConfig) {
      this.dom.enemy.classList.add('enemy-sprite-fallback');
      this.dom.enemy.classList.remove('enemy-sprite-mode');
      return;
    }

    const frameWidth = enemyVisualConfig?.spriteSheet?.frameWidth || 80;
    const frameHeight = enemyVisualConfig?.spriteSheet?.frameHeight || 80;
    const frameCount = Math.max(1, enemyVisualConfig?.spriteSheet?.frameCount || 1);
    const animationFps = Math.max(1, enemyVisualConfig?.spriteSheet?.animationFps || 6);
    const spritePath = enemyVisualConfig?.spriteSheet?.path || enemyVisualConfig?.spritePath || '';
    this.dom.enemy.style.setProperty('--enemy-hitbox-x', `${enemyVisualConfig?.hitbox?.x || 0}px`);
    this.dom.enemy.style.setProperty('--enemy-hitbox-y', `${enemyVisualConfig?.hitbox?.y || 0}px`);
    this.dom.enemy.style.setProperty('--enemy-hitbox-width', `${enemyVisualConfig?.hitbox?.width || frameWidth}px`);
    this.dom.enemy.style.setProperty('--enemy-hitbox-height', `${enemyVisualConfig?.hitbox?.height || frameHeight}px`);

    this.dom.enemySpriteSheet.style.width = `${frameWidth}px`;
    this.dom.enemySpriteSheet.style.height = `${frameHeight}px`;
    this.dom.enemySpriteSheet.style.backgroundSize = `${frameWidth * frameCount}px ${frameHeight}px`;

    if (!spritePath) {
      this.dom.enemy.classList.add('enemy-sprite-fallback');
      this.dom.enemy.classList.remove('enemy-sprite-mode');
      return;
    }

    try {
      await loadAssetImage(spritePath);
      this.dom.enemy.classList.add('enemy-sprite-mode');
      this.dom.enemy.classList.remove('enemy-sprite-fallback');
      this.dom.enemySpriteSheet.style.backgroundImage = `url("${spritePath}")`;

      let frame = 0;
      this.dom.enemySpriteSheet.style.backgroundPosition = '0px 0px';
      if (frameCount > 1) {
        this.enemyVisual.timer = setInterval(() => {
          frame = (frame + 1) % frameCount;
          this.dom.enemySpriteSheet.style.backgroundPosition = `-${frame * frameWidth}px 0px`;
        }, Math.round(1000 / animationFps));
      }
    } catch (error) {
      this.dom.enemy.classList.add('enemy-sprite-fallback');
      this.dom.enemy.classList.remove('enemy-sprite-mode');
      this.dom.enemySpriteSheet.style.backgroundImage = '';
    }
  }

  pushPlayerVitalsToGlobal() {
    if (!window.GameState || typeof window.GameState.setPlayerVitals !== 'function') return;
    window.GameState.setPlayerVitals({ hp: this.player.hp, mp: this.player.mp });
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

    this.setPlayerAnimation('run');
    this.gameLoop();
  }

  stopRunner() {
    this.isRunning = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.parallaxLayers.forEach((layer) => {
      layer.el.classList.remove('parallax-scrolling', layer.speedClass);
    });

    this.setPlayerAnimation('idle');
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

        this.updateProgressBar();
        // Continuar el bucle sin detenerse
      }
    }

    this.rafId = requestAnimationFrame(() => this.gameLoop());
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
    this.setManagedTimeout(() => this.dom.encounterFlash.classList.remove('active'), 400);

    this.showNotification('¡ENCUENTRO!', 1200);

    // 🔁 Usar módulo para ciclos infinitos de enemigos
    const enemyIdx = (this.roundCount * this.triggerPoints.length) + this.currentTriggerIndex - 1;
    const missionEnemy = this.options.missionConfig;
    const enemyData = missionEnemy || EnemyTypes[enemyIdx % EnemyTypes.length];
    this.enemy = {
      hp: enemyData.hp,
      maxHp: enemyData.hp,
      mp: enemyData.mp,
      maxMp: enemyData.mp,
      atk: enemyData.atk,
      def: enemyData.def || 0,
      name: enemyData.name,
      index: enemyIdx
    };

    this.setManagedTimeout(() => {
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
        this.setManagedTimeout(() => this.autoCombatAction(), 500);
      }
    }, 600);
  }

  useAttack() {
    if (this.state !== GameStates.COMBAT || this.combatLocked || !this.isPlayerTurn) return;
    this.combatLocked = true;

    this.setPlayerAnimation('attack');

    this.setManagedTimeout(() => {
      const baseDmg = this.player.atk;
      const variance = Math.floor(Math.random() * 5) - 2;
      const damage = Math.max(1, baseDmg + variance - this.enemy.def);

      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      this.updateEnemyHP();

      this.showDamageNumber(damage, this.dom.enemy);
      this.showHitEffect(this.dom.enemy);
      this.dom.container.classList.add('shake');
      this.setManagedTimeout(() => this.dom.container.classList.remove('shake'), 300);

      this.showCombatLog(`Atacas por ${damage} de daño!`);

      if (this.enemy.hp <= 0) {
        this.setManagedTimeout(() => this.enemyDefeated(), 400);
      } else {
        this.isPlayerTurn = false;
        this.setManagedTimeout(() => this.enemyTurn(), 800);
      }

      this.setManagedTimeout(() => {
        this.setPlayerAnimation('idle');
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
    this.pushPlayerVitalsToGlobal();

    this.setPlayerAnimation('attack');

    this.setManagedTimeout(() => {
      const damage = skill.dmg + Math.floor(Math.random() * 4) - 1;
      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      this.updateEnemyHP();

      this.showDamageNumber(damage, this.dom.enemy);
      this.showHitEffect(this.dom.enemy);
      this.dom.container.classList.add('shake');
      this.setManagedTimeout(() => this.dom.container.classList.remove('shake'), 300);

      this.showCombatLog(`${skill.name} — ${damage} de daño!`);

      if (this.enemy.hp <= 0) {
        this.setManagedTimeout(() => this.enemyDefeated(), 400);
      } else {
        this.isPlayerTurn = false;
        this.setManagedTimeout(() => this.enemyTurn(), 800);
      }

      this.setManagedTimeout(() => {
        this.setPlayerAnimation('idle');
        this.combatLocked = false;
      }, 400);
    }, 350);
  }

  enemyTurn() {
    if (this.state !== GameStates.COMBAT) return;

    this.dom.enemy.classList.add('enemy-attack');

    this.setManagedTimeout(() => {
      const baseDmg = this.enemy.atk;
      const variance = Math.floor(Math.random() * 4) - 2;
      const damage = Math.max(1, baseDmg + variance - this.player.defense);

      this.player.hp = Math.max(0, this.player.hp - damage);
      this.updatePlayerHP();
      this.pushPlayerVitalsToGlobal();

      this.showDamageNumber(damage, this.dom.player);
      this.showHitEffect(this.dom.player);
      this.dom.container.classList.add('shake');
      this.setManagedTimeout(() => this.dom.container.classList.remove('shake'), 300);

      this.showCombatLog(`${this.enemy.name} ataca por ${damage}!`);

      if (this.player.hp <= 0) {
        this.showNotification('¡DERROTADO!', 2000);
        this.setManagedTimeout(() => {
          this.stopAutoCombat();
          this.missionComplete();
          if (typeof this.options.onDefeat === 'function') {
            this.options.onDefeat();
          }
        }, 1500);
        return;
      }

      this.setManagedTimeout(() => {
        this.dom.enemy.classList.remove('enemy-attack');
        this.isPlayerTurn = true;
        this.combatLocked = false;

        if (this.autoMode) {
          this.setManagedTimeout(() => this.autoCombatAction(), 500);
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
        this.setManagedTimeout(() => this.autoCombatAction(), 300);
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
    this.setPlayerAnimation('victory');

    this.showNotification('¡VICTORIA!', 1500);
    this.showCombatLog(`¡${this.enemy.name} derrotado!`);

    if (typeof this.options.onEnemyDefeated === 'function') {
      this.options.onEnemyDefeated(this.enemy);
    }

    this.spawnVictoryParticles();

    this.setManagedTimeout(() => {
      this.dom.enemy.classList.remove('visible', 'defeated');
      this.dom.enemy.classList.add('visible');
      this.dom.enemy.classList.remove('visible');
      this.setPlayerAnimation('idle');

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
    this.setManagedTimeout(() => el.remove(), 800);
  }

  showHitEffect(target) {
    const el = document.createElement('div');
    el.className = 'hit-effect';

    const rect = target.getBoundingClientRect();
    const containerRect = this.dom.container.getBoundingClientRect();

    el.style.left = `${rect.left - containerRect.left + rect.width / 2 - 15}px`;
    el.style.top = `${rect.top - containerRect.top + rect.height / 2 - 15}px`;

    this.dom.container.appendChild(el);
    this.setManagedTimeout(() => el.remove(), 400);
  }

  showNotification(text, duration = 1200) {
    this.dom.notification.textContent = text;
    this.dom.notification.className = '';
    void this.dom.notification.offsetWidth;
    this.dom.notification.classList.add('show');
    this.setManagedTimeout(() => {
      this.dom.notification.classList.remove('show');
    }, duration);
  }

  showCombatLog(text) {
    this.dom.combatLog.textContent = text;
    this.dom.combatLog.classList.add('visible');
    clearTimeout(this._logTimeout);
    this._logTimeout = this.setManagedTimeout(() => {
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

    this.setManagedTimeout(() => {
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

    this.setManagedTimeout(() => {
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

    this.syncPlayerFromGlobal();

    this.updateProgressBar();
    this.updatePlayerHP();
    this.updatePlayerMP();
    this.updateEnemyHP();
    this.updateEnemyMP();

    this.setPlayerAnimation('idle');
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
    if (this.destroyed) return;
    this.destroyed = true;
    this.stopRunner();
    this.clearManagedTimeouts();
    clearTimeout(this._logTimeout);
    this._logTimeout = null;
    window.removeEventListener('ngs:state-updated', this.handleStateUpdated);
    if (this.dom.restartBtn) {
      this.dom.restartBtn.removeEventListener('click', this.handleRestart);
    }
    this.stopAutoCombat();
    this.closeSubSkills();
    this.state = GameStates.MISSION_DONE;
    this.combatLocked = false;
    this.isPlayerTurn = false;
    this.clearEnemyAnimationTimer();
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
