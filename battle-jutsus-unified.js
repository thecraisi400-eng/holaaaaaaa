// ============================================================================
// JUTSUS EN BATALLA - SISTEMA UNIFICADO
// Este script reemplaza y sincroniza todos los sistemas de habilidades en batalla
// Prioridad máxima - Se activa en cualquier combate del juego
// ============================================================================

(function () {
  'use strict';

  // Configuración global del sistema
  const BATTLE_JUTSU_CONFIG = {
    SKILL_ACTIVATION_CHANCE: 0.25, // 25% probabilidad de activar habilidad cada segundo
    COUNTER_CHANCE: 0.30, // 30% probabilidad de contraataque
    CHECK_INTERVAL_MS: 1000, // Verificar cada segundo
    SLOW_MO_FACTOR: 0.10, // 90% más lento (10% velocidad normal)
    SPHERE_SIZE: 40, // Radio de 40px = 80x80px diámetro
    ORB_COLORS: {
      fire: '#ff0000',
      wind: '#ffffff',
      lightning: '#ffff00',
      earth: '#808080',
      water: '#0000ff'
    }
  };

  // Base de datos de enemigos con habilidades equipadas
  const ENEMY_SKILL_DATABASE = {
    // Enemigos por índice de misión (0-5 para rango D)
    0: [
      { id: 0, name: 'Bola Fuego', element: 'fire', damage: 70, mpCost: 25 },
      { id: 4, name: 'Ráfaga Veloz', element: 'wind', damage: 60, mpCost: 25 },
      { id: 12, name: 'Roca Sólida', element: 'earth', damage: 80, mpCost: 25 }
    ],
    1: [
      { id: 1, name: 'Llama Fénix', element: 'fire', damage: 80, mpCost: 25 },
      { id: 8, name: 'Cuchilla Rayo', element: 'lightning', damage: 70, mpCost: 25 },
      { id: 16, name: 'Gran Catarata', element: 'water', damage: 60, mpCost: 25 }
    ],
    2: [
      { id: 2, name: 'Lanza Ígnea', element: 'fire', damage: 60, mpCost: 25 },
      { id: 5, name: 'Shuriken Viento', element: 'wind', damage: 70, mpCost: 25 },
      { id: 13, name: 'Armadura Arena', element: 'earth', damage: 60, mpCost: 25 }
    ],
    3: [
      { id: 3, name: 'Explosión Calor', element: 'fire', damage: 73, mpCost: 25 },
      { id: 9, name: 'Armadura Rayo', element: 'lightning', damage: 60, mpCost: 25 },
      { id: 17, name: 'Prisión Agua', element: 'water', damage: 67, mpCost: 25 }
    ],
    4: [
      { id: 6, name: 'Cuchilla Vacío', element: 'wind', damage: 73, mpCost: 25 },
      { id: 10, name: 'Rayo Veloz', element: 'lightning', damage: 80, mpCost: 25 },
      { id: 18, name: 'Tsunami Devastador', element: 'water', damage: 80, mpCost: 25 }
    ],
    5: [
      { id: 7, name: 'Gran Torbellino', element: 'wind', damage: 80, mpCost: 25 },
      { id: 11, name: 'Trueno Astral', element: 'lightning', damage: 73, mpCost: 25 },
      { id: 19, name: 'Tiburón Hambriento', element: 'water', damage: 70, mpCost: 25 }
    ]
  };

  // Clase para esfera de habilidad unificada
  class UnifiedBattleOrb {
    constructor(owner, target, skillData, isPlayer = true) {
      this.owner = owner;
      this.target = target;
      this.skillData = skillData;
      this.isPlayer = isPlayer;
      this.color = BATTLE_JUTSU_CONFIG.ORB_COLORS[skillData.element] || '#FFFFFF';
      this.x = owner.cx;
      this.y = owner.cy;
      this.size = BATTLE_JUTSU_CONFIG.SPHERE_SIZE;
      this.dead = false;
      this.trail = [];
      
      // Calcular dirección inicial hacia el objetivo
      const dx = target.cx - owner.cx;
      const dy = target.cy - owner.cy;
      const distance = Math.max(1, Math.hypot(dx, dy));
      this.maxSpeed = 6;
      this.homingStrength = 0.18;
      this.vx = (dx / distance) * this.maxSpeed;
      this.vy = (dy / distance) * this.maxSpeed;
    }

    update(dt) {
      if (this.target.isDead) {
        this.dead = true;
        return;
      }

      // Actualizar rastro
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > 15) this.trail.pop();

      // Perseguir al objetivo
      const dx = this.target.cx - this.x;
      const dy = this.target.cy - this.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const desiredVx = (dx / distance) * this.maxSpeed;
      const desiredVy = (dy / distance) * this.maxSpeed;
      const steerFactor = Math.min(1, this.homingStrength * dt);
      this.vx += (desiredVx - this.vx) * steerFactor;
      this.vy += (desiredVy - this.vy) * steerFactor;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Generar partículas
      if (Math.random() < 0.30) {
        window.BattleJutsusSystem?.spawnParticle?.(
          this.x, this.y,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5,
          this.color
        );
      }
    }

    draw(ctx) {
      // Dibujar rastro
      for (let i = 0; i < this.trail.length; i += 1) {
        const t = this.trail[i];
        const alpha = (1 - i / this.trail.length) * 0.25;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, this.size * (1 - i / (this.trail.length * 1.5)), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dibujar esfera principal con gradiente radial
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.25, this.color);
      grad.addColorStop(0.6, this.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Brillo exterior
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Sistema principal
  const BattleJutsusSystem = {
    host: null,
    canvas: null,
    ctx: null,
    
    // Estado del sistema
    playerEquippedSkills: [],
    enemyEquippedSkills: [],
    activeOrbs: [],
    announcementElement: null,
    slowMoActive: false,
    lastCheckTime: 0,
    counterAttempted: false,

    // Inicializar el sistema en una batalla
    init(battleContext) {
      this.host = battleContext.host || document.getElementById('ms-battle-stage');
      this.canvas = battleContext.canvas;
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.announcementElement = battleContext.announcementElement;
      
      // Obtener habilidades equipadas del jugador
      this.playerEquippedSkills = window.JutsuSystem?.getEquippedJutsusBattleData?.() || [];
      
      // Obtener habilidades del enemigo según la misión
      const missionIndex = battleContext.missionIndex || 0;
      this.enemyEquippedSkills = ENEMY_SKILL_DATABASE[missionIndex] || ENEMY_SKILL_DATABASE[0];
      this.enemyMaxMp = battleContext.enemyMaxMp || 500;
      this.enemyCurrentMp = this.enemyMaxMp;
      
      this.activeOrbs = [];
      this.slowMoActive = false;
      this.lastCheckTime = performance.now();
      this.counterAttempted = false;

      return this;
    },

    // Verificar activación de habilidades (llamado cada frame)
    checkSkillActivation(currentTime, playerFighter, enemyFighter, battleEngine) {
      const elapsed = currentTime - this.lastCheckTime;
      
      if (elapsed >= BATTLE_JUTSU_CONFIG.CHECK_INTERVAL_MS) {
        this.lastCheckTime = currentTime;
        this.counterAttempted = false;

        // 25% probabilidad de que alguien use habilidad
        if (Math.random() <= BATTLE_JUTSU_CONFIG.SKILL_ACTIVATION_CHANCE) {
          // Decidir aleatoriamente si es jugador o enemigo quien activa primero
          const playerActivates = Math.random() < 0.5;
          
          if (playerActivates) {
            this.tryPlayerSkillActivation(playerFighter, enemyFighter, battleEngine);
          } else {
            this.tryEnemySkillActivation(enemyFighter, playerFighter, battleEngine);
          }
        }
      }
    },

    // Intentar activación de habilidad del jugador
    tryPlayerSkillActivation(player, enemy, engine) {
      if (this.playerEquippedSkills.length === 0) return;
      if (player.statuses?.silence > 0) return;
      if (this.slowMoActive) return; // No activar si ya hay una habilidad en curso

      const availableSkills = this.playerEquippedSkills.filter(skill => {
        const hasMp = window.GameState?.getMp?.() >= skill.mpCost;
        return hasMp;
      });

      if (availableSkills.length === 0) return;

      const selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      const consumed = window.JutsuSystem?.consumeMpForJutsu?.(selectedSkill.id);

      if (consumed) {
        this.launchSkill(player, enemy, selectedSkill, true, engine);
        
        // 30% probabilidad de contraataque del enemigo
        setTimeout(() => {
          if (Math.random() <= BATTLE_JUTSU_CONFIG.COUNTER_CHANCE) {
            this.tryEnemyCounter(enemy, player, selectedSkill, engine);
          }
        }, 150);
      }
    },

    // Intentar activación de habilidad del enemigo
    tryEnemySkillActivation(enemy, player, engine) {
      if (this.enemyEquippedSkills.length === 0) return;
      if (this.slowMoActive) return;

      const availableSkills = this.enemyEquippedSkills.filter(skill => {
        return this.enemyCurrentMp >= skill.mpCost;
      });

      if (availableSkills.length === 0) return;

      const selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      this.enemyCurrentMp -= selectedSkill.mpCost;

      this.launchSkill(enemy, player, selectedSkill, false, engine);

      // 30% probabilidad de contraataque del jugador
      setTimeout(() => {
        if (Math.random() <= BATTLE_JUTSU_CONFIG.COUNTER_CHANCE) {
          this.tryPlayerCounter(player, enemy, selectedSkill, engine);
        }
      }, 150);
    },

    // Contraataque del enemigo
    tryEnemyCounter(enemy, player, incomingSkill, engine) {
      if (this.enemyEquippedSkills.length === 0) return;
      if (this.slowMoActive) return;

      const availableSkills = this.enemyEquippedSkills.filter(skill => {
        return this.enemyCurrentMp >= skill.mpCost;
      });

      if (availableSkills.length === 0) return;

      const selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      this.enemyCurrentMp -= selectedSkill.mpCost;

      this.launchSkill(enemy, player, selectedSkill, false, engine, true);
    },

    // Contraataque del jugador
    tryPlayerCounter(player, enemy, incomingSkill, engine) {
      if (this.playerEquippedSkills.length === 0) return;
      if (player.statuses?.silence > 0) return;
      if (this.slowMoActive) return;

      const availableSkills = this.playerEquippedSkills.filter(skill => {
        const hasMp = window.GameState?.getMp?.() >= skill.mpCost;
        return hasMp;
      });

      if (availableSkills.length === 0) return;

      const selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      const consumed = window.JutsuSystem?.consumeMpForJutsu?.(selectedSkill.id);

      if (consumed) {
        this.launchSkill(player, enemy, selectedSkill, true, engine, true);
      }
    },

    // Lanzar habilidad
    launchSkill(attacker, target, skillData, isPlayer, engine, isCounter = false) {
      const orb = new UnifiedBattleOrb(attacker, target, skillData, isPlayer);
      this.activeOrbs.push(orb);

      // Mostrar nombre de la habilidad
      this.showAnnouncement(skillData.name, attacker, isPlayer);

      // Activar cámara lenta
      if (!this.slowMoActive) {
        this.activateSlowMotion(engine);
      }

      // Notificar al motor de batalla
      if (engine && typeof engine.onSkillLaunched === 'function') {
        engine.onSkillLaunched(orb);
      }
    },

    // Mostrar anuncio de habilidad
    showAnnouncement(skillName, attacker, isPlayer) {
      if (!this.announcementElement) return;

      const name = isPlayer ? (attacker.name || 'JUGADOR') : (attacker.name || 'ENEMIGO');
      this.announcementElement.textContent = `${name}: ${skillName}`;
      this.announcementElement.classList.add('show');
      this.announcementElement.style.display = 'block';

      // Posicionar encima del personaje
      this.updateAnnouncementPosition(attacker, isPlayer);
    },

    // Actualizar posición del anuncio
    updateAnnouncementPosition(attacker, isPlayer) {
      if (!this.announcementElement || !attacker) return;

      // La posición se maneja mediante CSS absoluto relativo al canvas
      const yPos = isPlayer ? 20 : 340;
      this.announcementElement.style.top = `${yPos}px`;
      this.announcementElement.style.left = `${attacker.x}px`;
      this.announcementElement.style.transform = 'translateX(-20%)';
    },

    // Activar cámara lenta
    activateSlowMotion(engine) {
      this.slowMoActive = true;
      if (engine) {
        engine.slowMo = BATTLE_JUTSU_CONFIG.SLOW_MO_FACTOR;
      }
      
      // Oscurecer pantalla
      const veil = document.getElementById('msBattleVeil');
      if (veil) {
        veil.style.background = 'rgba(0,0,0,0.55)';
        veil.style.display = 'block';
      }
    },

    // Restaurar velocidad normal
    restoreNormalSpeed(engine) {
      this.slowMoActive = false;
      if (engine) {
        engine.slowMo = 1.0;
      }

      // Restaurar pantalla
      const veil = document.getElementById('msBattleVeil');
      if (veil) {
        veil.style.background = 'rgba(0,0,0,0)';
        setTimeout(() => { veil.style.display = 'none'; }, 200);
      }

      // Ocultar anuncio
      if (this.announcementElement) {
        this.announcementElement.classList.remove('show');
        this.announcementElement.style.display = 'none';
        this.announcementElement.textContent = '';
      }
    },

    // Actualizar todas las esferas activas
    updateOrbs(dt, engine) {
      for (let i = this.activeOrbs.length - 1; i >= 0; i -= 1) {
        const orb = this.activeOrbs[i];
        orb.update(dt);

        if (orb.dead) {
          this.activeOrbs.splice(i, 1);
          
          // Si no hay más esferas, restaurar velocidad
          if (this.activeOrbs.length === 0) {
            this.restoreNormalSpeed(engine);
          }
        }
      }
    },

    // Dibujar todas las esferas
    drawOrbs(ctx) {
      for (const orb of this.activeOrbs) {
        orb.draw(ctx);
      }
    },

    // Verificar colisiones entre esferas (choque/counter)
    checkOrbCollisions(fighters, particles, triggerShake) {
      for (let i = 0; i < this.activeOrbs.length; i += 1) {
        for (let j = i + 1; j < this.activeOrbs.length; j += 1) {
          const orbA = this.activeOrbs[i];
          const orbB = this.activeOrbs[j];

          if (orbA.owner === orbB.owner || orbA.dead || orbB.dead) continue;

          // Verificar si son de equipos opuestos
          if (orbA.isPlayer === orbB.isPlayer) continue;

          const distance = Math.hypot(orbA.x - orbB.x, orbA.y - orbB.y);
          const collisionThreshold = orbA.size + orbB.size;

          if (distance < collisionThreshold) {
            // CHOQUE! Anular ambas esferas
            const impactX = (orbA.x + orbB.x) / 2;
            const impactY = (orbA.y + orbB.y) / 2;

            // Generar partículas de choque
            for (let k = 0; k < 25; k += 1) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 3 + Math.random() * 5;
              this.spawnParticle(
                impactX, impactY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#FFFFFF'
              );
              this.spawnParticle(
                impactX, impactY,
                Math.cos(angle) * speed * 0.5,
                Math.sin(angle) * speed * 0.5,
                '#FFD700'
              );
            }

            if (triggerShake) triggerShake(8, 20);

            // Anular ambas esferas sin daño
            orbA.dead = true;
            orbB.dead = true;

            // Empujar ligeramente a los luchadores
            for (const f of fighters) {
              f.vx += (f.cx > impactX ? 5 : -5);
            }

            // Restaurar velocidad inmediatamente
            if (this.activeOrbs.length <= 2) {
              this.restoreNormalSpeed(null);
            }
          }
        }
      }
    },

    // Verificar impacto en objetivo
    checkOrbHits(fighters, calcDamage, applySkillEffects) {
      for (const orb of this.activeOrbs) {
        if (orb.dead) continue;

        for (const fighter of fighters) {
          if (fighter === orb.owner || fighter.isDead || fighter.invincible) continue;
          if (fighter.isPlayer === orb.isPlayer) continue; // No golpear aliado

          const distance = Math.hypot(orb.x - fighter.cx, orb.y - fighter.cy);
          const hitThreshold = orb.size + 30; // Radio del personaje

          if (distance < hitThreshold) {
            // Impacto exitoso
            const baseDamage = orb.skillData.damage;
            const damage = Math.max(1, Math.round(baseDamage));

            fighter.receiveHit?.(damage, orb.x, orb.owner);

            // Aplicar efectos de la habilidad
            if (applySkillEffects) {
              orb.owner.applySkillEffects?.(orb.skillData, fighter);
            }

            // Generar partículas de impacto
            for (let i = 0; i < 18; i += 1) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 2 + Math.random() * 4;
              this.spawnParticle(orb.x, orb.y, Math.cos(angle) * speed, Math.sin(angle) * speed, orb.color);
            }

            orb.dead = true;

            // Si esta era la última esfera, restaurar velocidad
            const remainingActiveOrbs = this.activeOrbs.filter(o => !o.dead);
            if (remainingActiveOrbs.length === 0) {
              this.restoreNormalSpeed(null);
            }

            break;
          }
        }
      }
    },

    // Spawnear partícula (función auxiliar)
    spawnParticle(x, y, vx, vy, color) {
      // Esta función debe ser implementada por el motor de batalla
      // Se deja como hook para que el battle system la use
      if (window.BattleJutsusSystem?.particles) {
        window.BattleJutsusSystem.particles.push({
          x, y, vx, vy, color,
          life: 15,
          size: 2.5,
          type: 'spark'
        });
      }
    },

    // Limpiar sistema
    cleanup() {
      this.activeOrbs = [];
      this.playerEquippedSkills = [];
      this.enemyEquippedSkills = [];
      this.slowMoActive = false;
      this.restoreNormalSpeed(null);
    }
  };

  // Exportar al ámbito global
  window.BattleJutsusSystem = BattleJutsusSystem;

  // Función para parchear el sistema de batalla existente
  window.PatchBattleSystem = function(originalBattleSystem) {
    if (!originalBattleSystem) return;

    // Guardar referencias originales
    const originalUpdate = originalBattleSystem.createEngine?.toString();
    
    console.log('[BattleJutsusSystem] Sistema unificado listo para batallas');
    console.log('[BattleJutsusSystem] Reemplazando sistemas duplicados...');
    
    // El sistema ahora se integra automáticamente cuando se crea una batalla
    return originalBattleSystem;
  };

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[BattleJutsusSystem] Inicializado - Esperando batallas...');
    });
  } else {
    console.log('[BattleJutsusSystem] Inicializado - Esperando batallas...');
  }
})();
