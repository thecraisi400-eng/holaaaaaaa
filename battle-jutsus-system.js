/**
 * BATTLE JUTSUS SYSTEM
 * Sistema unificado de habilidades JUTSU para todas las batallas del juego
 * 
 * Características:
 * - Sincronización con cualquier batalla existente
 * - Verificación de 3 slots de habilidades equipadas (personaje y enemigo)
 * - Activación aleatoria cada segundo con 25% de probabilidad
 * - Esfera de 80x80px que persigue al objetivo
 * - Efecto de cámara lenta (90% slow) al usar habilidad
 * - Colores de esfera según elemento (fuego=rojo, viento=blanco, agua=azul, rayo=amarillo, roca=gris)
 * - Cuadro con nombre de habilidad sobre el personaje
 * - Sistema de contraataque del enemigo (30% probabilidad)
 * - Sistema de contraataque del jugador (30% probabilidad)
 * - Consumo de MP correspondiente
 */

(function () {
  // Configuración del sistema
  const CONFIG = {
    SKILL_CHECK_INTERVAL: 1000, // ms - Verificar habilidades cada segundo
    SKILL_ACTIVATION_CHANCE: 0.25, // 25% probabilidad de activar habilidad
    COUNTER_CHANCE: 0.30, // 30% probabilidad de contraataque
    SLOW_MOTION_FACTOR: 0.10, // 90% lento (10% velocidad normal)
    SPHERE_SIZE: 40, // Radio de 40px = 80x80px diámetro
    SPHERE_SPEED: 6,
    HOMING_STRENGTH: 0.20,
    TRAIL_LENGTH: 15,
    PARTICLE_CHANCE: 0.35
  };

  // Colores de elementos para las esferas
  const ELEMENT_COLORS = {
    fire: '#ff0000',      // Rojo para fuego
    wind: '#ffffff',      // Blanco para viento
    water: '#0000ff',     // Azul para agua
    lightning: '#ffff00', // Amarillo para rayo
    earth: '#808080'      // Gris para roca/tierra
  };

  // Base de datos de habilidades del enemigo (si no tiene sistema Jutsu)
  const ENEMY_SKILL_DB = [
    { id: 'e0', name: 'Llama Voraz', element: 'fire', damage: 75, mpCost: 25, effect: 'Quemadura' },
    { id: 'e1', name: 'Rayo Destellante', element: 'lightning', damage: 70, mpCost: 25, effect: 'Parálisis' },
    { id: 'e2', name: 'Ráfaga Cortante', element: 'wind', damage: 65, mpCost: 25, effect: 'Hemorragia' },
    { id: 'e3', name: 'Prisión Hidráulica', element: 'water', damage: 68, mpCost: 25, effect: 'Asfixia' },
    { id: 'e4', name: 'Escudo Telúrico', element: 'earth', damage: 72, mpCost: 25, effect: 'Pesado' }
  ];

  /**
   * Clase SkillOrb - Representa la esfera de habilidad
   */
  class SkillOrb {
    constructor(owner, target, skillData, battleSystem) {
      this.owner = owner;
      this.target = target;
      this.skillData = skillData;
      this.battleSystem = battleSystem;
      
      // Determinar color según elemento
      this.color = skillData.sphereColor || ELEMENT_COLORS[skillData.element] || '#ffffff';
      
      // Posición inicial
      this.x = owner.cx || owner.x + (owner.width || 50) / 2;
      this.y = owner.cy || owner.y + (owner.height || 50) / 2;
      
      this.size = CONFIG.SPHERE_SIZE;
      this.dead = false;
      this.trail = [];
      
      // Calcular dirección inicial hacia el objetivo
      const dx = (target.cx || target.x + (target.width || 50) / 2) - this.x;
      const dy = (target.cy || target.y + (target.height || 50) / 2) - this.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      
      this.maxSpeed = CONFIG.SPHERE_SPEED;
      this.homingStrength = CONFIG.HOMING_STRENGTH;
      this.vx = (dx / distance) * this.maxSpeed;
      this.vy = (dy / distance) * this.maxSpeed;
    }

    update(dt) {
      // Verificar si el objetivo está muerto
      if (this.target.isDead || this.target.hp <= 0) {
        this.dead = true;
        return;
      }

      // Guardar posición para el trail
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > CONFIG.TRAIL_LENGTH) {
        this.trail.pop();
      }

      // Obtener posición actual del objetivo
      const targetCx = this.target.cx || this.target.x + (this.target.width || 50) / 2;
      const targetCy = this.target.cy || this.target.y + (this.target.height || 50) / 2;

      // Calcular dirección hacia el objetivo (homing)
      const dx = targetCx - this.x;
      const dy = targetCy - this.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      
      const desiredVx = (dx / distance) * this.maxSpeed;
      const desiredVy = (dy / distance) * this.maxSpeed;
      
      // Suavizar el movimiento
      const steerFactor = Math.min(1, this.homingStrength * dt);
      this.vx += (desiredVx - this.vx) * steerFactor;
      this.vy += (desiredVy - this.vy) * steerFactor;
      
      // Actualizar posición
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Generar partículas
      if (Math.random() < CONFIG.PARTICLE_CHANCE) {
        this.spawnParticle();
      }
    }

    spawnParticle() {
      if (this.battleSystem && typeof this.battleSystem.spawnParticle === 'function') {
        this.battleSystem.spawnParticle(
          this.x,
          this.y,
          (Math.random() - 0.5) * 1.6,
          (Math.random() - 0.5) * 1.6,
          this.color,
          11,
          2.2,
          'spark'
        );
      }
    }

    draw(ctx) {
      if (!ctx) return;

      // Dibujar trail
      for (let i = 0; i < this.trail.length; i += 1) {
        const t = this.trail[i];
        const alpha = (1 - i / this.trail.length) * 0.30;
        const size = this.size * (1 - i / (this.trail.length * 1.5));
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dibujar esfera principal con gradiente
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, this.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    checkCollision(target) {
      const targetCx = target.cx || target.x + (target.width || 50) / 2;
      const targetCy = target.cy || target.y + (target.height || 50) / 2;
      const distance = Math.hypot(this.x - targetCx, this.y - targetCy);
      
      return distance < this.size + (target.width || 50) / 2;
    }
  }

  /**
   * Clase SkillNameDisplay - Muestra el nombre de la habilidad sobre el personaje
   */
  class SkillNameDisplay {
    constructor(character, skillName, container) {
      this.character = character;
      this.skillName = skillName;
      this.container = container;
      this.element = null;
      this.active = true;
      
      this.create();
    }

    create() {
      if (!this.container) return;

      this.element = document.createElement('div');
      this.element.className = 'battle-skill-name-display';
      
      // Crear contenido con el nombre de la habilidad
      this.element.innerHTML = `
        <div class="skill-name-box">
          <span class="skill-name-text">${this.skillName}</span>
        </div>
      `;
      
      // Estilos inline para asegurar visibilidad
      this.element.style.cssText = `
        position: absolute;
        left: 0;
        top: -50px;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
      `;

      const box = this.element.querySelector('.skill-name-box');
      if (box) {
        box.style.cssText = `
          background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(50,50,50,0.95));
          border: 2px solid #FFD700;
          border-radius: 8px;
          padding: 8px 16px;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
          animation: skillNamePulse 0.5s ease-in-out infinite alternate;
        `;
      }

      const text = this.element.querySelector('.skill-name-text');
      if (text) {
        text.style.cssText = `
          color: #FFD700;
          font-family: 'Orbitron', 'Rajdhani', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
          letter-spacing: 1px;
        `;
      }

      this.container.appendChild(this.element);
      this.updatePosition();
    }

    updatePosition() {
      if (!this.element || !this.character) return;

      // Obtener posición del personaje
      const charX = this.character.x || 0;
      const charY = this.character.y || 0;
      const charWidth = this.character.width || 50;
      
      // Centrar sobre el personaje
      this.element.style.left = `${charX + (charWidth / 2) - (this.element.offsetWidth / 2)}px`;
      this.element.style.top = `${charY - 60}px`;
    }

    remove() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.active = false;
    }
  }

  /**
   * BattleJutsusSystem - Sistema principal de JUTSUS para batallas
   */
  const BattleJutsusSystem = {
    // Estado del sistema
    activeBattles: [],
    skillCheckTimers: new Map(),
    currentOrbs: [],
    activeNameDisplays: [],
    isSlowMotion: false,
    originalTimeScale: 1.0,

    /**
     * Inicializar el sistema para una batalla específica
     */
    initializeBattle(battleContext) {
      if (!battleContext) return;

      const battleId = battleContext.id || `battle_${Date.now()}`;
      
      // Registrar la batalla
      this.activeBattles.push({
        id: battleId,
        context: battleContext,
        playerCharacter: battleContext.player,
        enemyCharacter: battleContext.enemy,
        lastSkillCheck: Date.now(),
        skillTimer: null
      });

      // Configurar verificación periódica de habilidades
      this.startSkillCheckLoop(battleId);

      console.log(`[BattleJutsusSystem] Batalla ${battleId} inicializada`);
      return battleId;
    },

    /**
     * Iniciar bucle de verificación de habilidades (cada 1 segundo)
     */
    startSkillCheckLoop(battleId) {
      const battle = this.activeBattles.find(b => b.id === battleId);
      if (!battle) return;

      const checkSkills = () => {
        if (!battle.context.isActive) {
          this.stopSkillCheckLoop(battleId);
          return;
        }

        const now = Date.now();
        const deltaTime = now - battle.lastSkillCheck;

        if (deltaTime >= CONFIG.SKILL_CHECK_INTERVAL) {
          battle.lastSkillCheck = now;
          this.checkAndActivateSkills(battle);
        }

        battle.skillTimer = requestAnimationFrame(checkSkills);
      };

      battle.skillTimer = requestAnimationFrame(checkSkills);
    },

    /**
     * Detener bucle de verificación
     */
    stopSkillCheckLoop(battleId) {
      const battle = this.activeBattles.find(b => b.id === battleId);
      if (battle && battle.skillTimer) {
        cancelAnimationFrame(battle.skillTimer);
        battle.skillTimer = null;
      }
    },

    /**
     * Verificar y activar habilidades (25% probabilidad)
     */
    checkAndActivateSkills(battle) {
      const { playerCharacter, enemyCharacter } = battle;

      // Verificar si ya hay una habilidad activa (slow motion)
      if (this.isSlowMotion) return;

      // Intentar activar habilidad del jugador
      if (Math.random() <= CONFIG.SKILL_ACTIVATION_CHANCE) {
        this.tryActivateSkill(playerCharacter, enemyCharacter, battle, true);
        return; // Solo una habilidad a la vez
      }

      // Intentar activar habilidad del enemigo
      if (Math.random() <= CONFIG.SKILL_ACTIVATION_CHANCE) {
        this.tryActivateSkill(enemyCharacter, playerCharacter, battle, false);
      }
    },

    /**
     * Intentar activar una habilidad
     */
    tryActivateSkill(attacker, defender, battle, isPlayer) {
      // Obtener habilidades equipadas
      let equippedSkills = [];
      
      if (isPlayer) {
        // Obtener del sistema Jutsu
        equippedSkills = window.JutsuSystem?.getEquippedJutsusBattleData?.() || [];
      } else {
        // Enemigo - verificar si tiene sistema propio o usar default
        equippedSkills = enemyCharacter.equippedSkills || 
                        battle.context.enemySkills || 
                        this.generateEnemySkills();
      }

      // Filtrar habilidades válidas (máximo 3 slots)
      equippedSkills = equippedSkills.slice(0, 3);

      if (equippedSkills.length === 0) return;

      // Seleccionar habilidad al azar
      const selectedSkill = equippedSkills[Math.floor(Math.random() * equippedSkills.length)];
      if (!selectedSkill) return;

      // Verificar MP suficiente
      const currentMp = isPlayer ? 
        (window.GameState?.getMp?.() || 0) : 
        (enemyCharacter.mp || enemyCharacter.currentMp || 100);

      const mpCost = selectedSkill.mpCost || 25;
      if (currentMp < mpCost) return;

      // Consumir MP
      if (isPlayer) {
        const consumed = window.JutsuSystem?.consumeMpForJutsu?.(selectedSkill.id);
        if (!consumed && typeof window.GameState?.consumeMp === 'function') {
          window.GameState.consumeMp(mpCost);
        }
      } else {
        enemyCharacter.mp = currentMp - mpCost;
        enemyCharacter.currentMp = enemyCharacter.mp;
      }

      // Activar habilidad
      this.activateSkill(attacker, defender, selectedSkill, battle, isPlayer);
    },

    /**
     * Activar habilidad (crear esfera, slow motion, mostrar nombre)
     */
    activateSkill(attacker, defender, skill, battle, isPlayer) {
      console.log(`[BattleJutsusSystem] ${isPlayer ? 'Jugador' : 'Enemigo'} usa: ${skill.name}`);

      // Activar slow motion (90% lento)
      this.enableSlowMotion(battle);

      // Crear esfera de habilidad
      const orb = new SkillOrb(attacker, defender, skill, battle.context.battleSystem);
      this.currentOrbs.push({ orb, battle, isPlayer, skill });

      // Mostrar nombre de habilidad
      const battleContainer = battle.context.container || document.getElementById('ms-battle-stage');
      const nameDisplay = new SkillNameDisplay(attacker, skill.name, battleContainer);
      this.activeNameDisplays.push({ display: nameDisplay, orb, battle });

      // Verificar contraataque
      this.checkCounterAttack(defender, attacker, battle, !isPlayer);
    },

    /**
     * Verificar contraataque (30% probabilidad)
     */
    checkCounterAttack(defender, attacker, battle, isEnemyCountering) {
      if (Math.random() > CONFIG.COUNTER_CHANCE) return;

      // Pequeño delay para el contraataque
      setTimeout(() => {
        if (!battle.context.isActive || this.currentOrbs.length === 0) return;

        // Intentar contraatacar
        this.tryActivateSkill(defender, attacker, battle, !isEnemyCountering);
      }, 200);
    },

    /**
     * Activar slow motion
     */
    enableSlowMotion(battle) {
      if (this.isSlowMotion) return;
      
      this.isSlowMotion = true;
      this.originalTimeScale = battle.context.timeScale || 1.0;
      battle.context.timeScale = CONFIG.SLOW_MOTION_FACTOR;

      // Aplicar slow motion al sistema de batalla
      if (battle.context.battleSystem) {
        battle.context.battleSystem.slowMo = CONFIG.SLOW_MOTION_FACTOR;
      }

      // Oscurecer pantalla
      if (battle.context.veil) {
        battle.context.veil.style.background = 'rgba(0,0,0,0.48)';
      }
    },

    /**
     * Restaurar velocidad normal
     */
    restoreNormalSpeed(battle) {
      this.isSlowMotion = false;
      battle.context.timeScale = this.originalTimeScale;

      if (battle.context.battleSystem) {
        battle.context.battleSystem.slowMo = 1.0;
      }

      if (battle.context.veil) {
        battle.context.veil.style.background = 'rgba(0,0,0,0)';
      }
    },

    /**
     * Actualizar esferas y verificar colisiones
     */
    updateOrbs(dt) {
      for (let i = this.currentOrbs.length - 1; i >= 0; i -= 1) {
        const { orb, battle, isPlayer, skill } = this.currentOrbs[i];

        // Actualizar esfera
        orb.update(dt);

        // Actualizar posición del nombre
        const nameDisplayObj = this.activeNameDisplays.find(nd => nd.orb === orb);
        if (nameDisplayObj && nameDisplayObj.display) {
          nameDisplayObj.display.updatePosition();
        }

        // Verificar colisión con el objetivo
        const target = orb.target;
        if (orb.checkCollision(target)) {
          // Impacto exitoso
          this.handleOrbImpact(orb, target, skill, battle, isPlayer);
          this.currentOrbs.splice(i, 1);
          continue;
        }

        // Verificar colisión entre esferas (choque)
        for (let j = i - 1; j >= 0; j -= 1) {
          const otherOrb = this.currentOrbs[j].orb;
          const distance = Math.hypot(orb.x - otherOrb.x, orb.y - otherOrb.y);
          
          if (distance < orb.size + otherOrb.size) {
            // Choque de esferas - anular ambas
            this.handleOrbClash(orb, otherOrb, battle);
            this.currentOrbs.splice(i, 1);
            this.currentOrbs.splice(j, 1);
            break;
          }
        }

        // Eliminar esfera muerta
        if (orb.dead) {
          this.currentOrbs.splice(i, 1);
        }
      }
    },

    /**
     * Manejar impacto de esfera
     */
    handleOrbImpact(orb, target, skill, battle, isPlayer) {
      console.log(`[BattleJutsusSystem] Impacto de ${skill.name}`);

      // Restaurar velocidad normal
      this.restoreNormalSpeed(battle);

      // Remover nombre de habilidad
      const nameDisplayObj = this.activeNameDisplays.find(nd => nd.orb === orb);
      if (nameDisplayObj) {
        nameDisplayObj.display.remove();
        this.activeNameDisplays = this.activeNameDisplays.filter(nd => nd !== nameDisplayObj);
      }

      // Aplicar daño
      const damage = skill.damage || 70;
      if (target.receiveHit) {
        target.receiveHit(damage, orb.x, orb.owner);
      }

      // Aplicar efectos de la habilidad
      if (orb.owner && typeof orb.owner.applySkillEffects === 'function') {
        orb.owner.applySkillEffects(skill, target);
      }

      // Efectos visuales de impacto
      this.spawnImpactEffects(orb.x, orb.y, orb.color);
    },

    /**
     * Manejar choque de esferas (anulación mutua)
     */
    handleOrbClash(orb1, orb2, battle) {
      console.log('[BattleJutsusSystem] ¡Choque de habilidades!');

      // Restaurar velocidad normal
      this.restoreNormalSpeed(battle);

      // Remover nombres de habilidad
      this.activeNameDisplays.forEach((nd, index) => {
        if (nd.orb === orb1 || nd.orb === orb2) {
          nd.display.remove();
          this.activeNameDisplays.splice(index, 1);
        }
      });

      // Efectos visuales de choque
      const clashX = (orb1.x + orb2.x) / 2;
      const clashY = (orb1.y + orb2.y) / 2;
      this.spawnClashEffects(clashX, clashY);

      // Nadie recibe daño (anulación)
    },

    /**
     * Generar efectos de impacto
     */
    spawnImpactEffects(x, y, color) {
      const battle = this.activeBattles[0];
      if (!battle || !battle.context.battleSystem) return;

      const bs = battle.context.battleSystem;
      
      // Spawn partículas
      for (let i = 0; i < 16; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 4;
        bs.spawnParticle?.(
          x, y,
          Math.cos(ang) * spd,
          Math.sin(ang) * spd,
          color,
          20,
          3,
          'spark'
        );
      }
    },

    /**
     * Generar efectos de choque
     */
    spawnClashEffects(x, y) {
      const battle = this.activeBattles[0];
      if (!battle || !battle.context.battleSystem) return;

      const bs = battle.context.battleSystem;

      // Spawn partículas blancas y doradas
      for (let i = 0; i < 22; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 5;
        
        bs.spawnParticle?.(x, y, Math.cos(ang) * spd, Math.sin(ang) * spd, '#FFFFFF', 22, 3, 'spark');
        bs.spawnParticle?.(x, y, Math.cos(ang) * spd * 0.5, Math.sin(ang) * spd * 0.5, '#FFD700', 32, 2.5, 'spark');
      }

      // Screen shake
      if (bs.triggerShake) {
        bs.triggerShake(6, 18);
      }
    },

    /**
     * Generar habilidades aleatorias para enemigo
     */
    generateEnemySkills() {
      const numSkills = Math.floor(Math.random() * 3) + 1;
      const skills = [];
      
      for (let i = 0; i < numSkills; i += 1) {
        const randomSkill = ENEMY_SKILL_DB[Math.floor(Math.random() * ENEMY_SKILL_DB.length)];
        if (randomSkill && !skills.find(s => s.id === randomSkill.id)) {
          skills.push({
            ...randomSkill,
            sphereColor: ELEMENT_COLORS[randomSkill.element]
          });
        }
      }
      
      return skills;
    },

    /**
     * Limpiar sistema de una batalla
     */
    cleanupBattle(battleId) {
      const battleIndex = this.activeBattles.findIndex(b => b.id === battleId);
      if (battleIndex === -1) return;

      const battle = this.activeBattles[battleIndex];

      // Detener timers
      this.stopSkillCheckLoop(battleId);

      // Eliminar esferas activas
      this.currentOrbs = this.currentOrbs.filter(o => o.battle.id !== battleId);

      // Eliminar nombres de habilidad
      this.activeNameDisplays.forEach(nd => {
        if (nd.battle.id === battleId) {
          nd.display.remove();
        }
      });
      this.activeNameDisplays = this.activeNameDisplays.filter(nd => nd.battle.id !== battleId);

      // Restaurar velocidad si estaba en slow motion
      if (this.isSlowMotion) {
        this.restoreNormalSpeed(battle);
      }

      // Remover batalla
      this.activeBattles.splice(battleIndex, 1);

      console.log(`[BattleJutsusSystem] Batalla ${battleId} limpiada`);
    },

    /**
     * Renderizar esferas en el canvas
     */
    renderOrbs(ctx) {
      if (!ctx) return;

      this.currentOrbs.forEach(({ orb }) => {
        orb.draw(ctx);
      });
    }
  };

  // Exportar sistema globalmente
  window.BattleJutsusSystem = BattleJutsusSystem;

  // Agregar estilos CSS necesarios
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes skillNamePulse {
      from {
        transform: scale(1);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
      }
      to {
        transform: scale(1.05);
        box-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
      }
    }

    .battle-skill-name-display {
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleSheet);

  console.log('[BattleJutsusSystem] Sistema inicializado y listo para usar');
})();
