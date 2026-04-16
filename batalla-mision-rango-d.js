/* ═══════════════════════════════════════════
   BATALLA MISION RANGO D - Sistema Completo
   Implementación encapsulada para evitar conflictos
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     CONFIGURACIÓN Y CONSTANTES ÚNICAS
     ───────────────────────────────────────────── */
  const BRD_CONFIG = {
    W: 460,
    H: 360,
    GROUND_OFFSET: 50,
    GRAVITY: 0.44,
    SCALE: 0.70,
    FIGHTER_WIDTH: 21,
    FIGHTER_HEIGHT: 35
  };

  BRD_CONFIG.GROUND = BRD_CONFIG.H - BRD_CONFIG.GROUND_OFFSET;
  BRD_CONFIG.NW = Math.round(30 * BRD_CONFIG.SCALE);
  BRD_CONFIG.NH = Math.round(50 * BRD_CONFIG.SCALE);

  /* ─────────────────────────────────────────────
     CLASES DEL SISTEMA DE BATALLA
     ───────────────────────────────────────────── */

  class BRDParticle {
    constructor(x, y, vx, vy, color, life, size, type) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.life = life;
      this.maxLife = life;
      this.size = size;
      this.type = type;
      this.alpha = 1;
      this.rot = Math.random() * Math.PI * 2;
      this.rotS = (Math.random() - 0.5) * 0.15;
      this.grav = (type === 'spark' || type === 'dust') ? BRD_CONFIG.GRAVITY * 0.45 : 0;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += this.grav * dt;
      if (this.type === 'smoke') {
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.size += 0.35 * dt;
      }
      if (this.type === 'leaf') {
        this.vx = Math.sin(BRDFrameNum * 0.025 + this.x * 0.08) * 0.7;
        this.vy += 0.025 * dt;
        this.rot += this.rotS * dt;
      }
      this.life -= dt;
      this.alpha = Math.max(0, this.life / this.maxLife);
    }

    draw(ctx) {
      if (this.alpha <= 0 || this.size <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      if (this.type === 'leaf') {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillRect(-this.size, -this.size * 0.4, this.size * 2, this.size * 0.8);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    isDead() {
      return this.life <= 0 || (this.type === 'smoke' && this.size > 45);
    }
  }

  class BRDDamageNum {
    constructor(x, y, val, crit) {
      this.x = x;
      this.y = y;
      this.val = Math.round(val);
      this.crit = crit;
      this.vx = (Math.random() - 0.5) * 2.5;
      this.vy = -4.5;
      this.life = 60;
      this.maxLife = 60;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.vy += 0.18 * dt;
      this.y += this.vy * dt;
      this.life -= dt;
    }

    isDead() {
      return this.life <= 0;
    }

    draw(ctx) {
      const a = Math.max(0, this.life / this.maxLife);
      const sz = this.crit ? 15 : 11;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `bold ${sz}px Arial Black`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3.5;
      ctx.strokeText(this.val, this.x, this.y);
      ctx.fillStyle = this.crit ? '#FFE040' : '#FF6644';
      ctx.fillText(this.val, this.x, this.y);
      if (this.crit) {
        ctx.font = 'bold 7px Arial';
        ctx.fillStyle = '#FFFACC';
        ctx.fillText('CRÍTICO!', this.x, this.y - 13);
      }
      ctx.restore();
    }
  }

  class BRDJutsu {
    constructor(x, y, vx, vy, owner) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.owner = owner;
      this.color = owner.glowColor;
      this.size = 9;
      this.life = 200;
      this.dead = false;
      this.trail = [];
      this.id = Math.random();
    }

    update(dt) {
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > 12) this.trail.pop();
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.life -= dt;
      if (this.x < -12 || this.x > BRD_CONFIG.W + 12 || this.y < -12 || this.y > BRD_CONFIG.H + 12 || this.life <= 0) {
        this.dead = true;
      }
      if (Math.random() < 0.35) {
        BRDParticles.push(new BRDParticle(this.x, this.y, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, this.color, 10, 2, 'spark'));
      }
    }

    draw(ctx) {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const r = this.size * (1 - i / this.trail.length) * 0.9;
        if (r <= 0) continue;
        ctx.save();
        ctx.globalAlpha = (1 - i / this.trail.length) * 0.55;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.2);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.35, this.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class BRDFighter {
    constructor(x, id, missionData = null) {
      this.id = id;
      this.x = x;
      this.y = BRD_CONFIG.GROUND - BRD_CONFIG.NH;
      this.vx = 0;
      this.vy = 0;
      this.onGround = true;
      this.facingRight = (id === 0);
      
      // Configuración basada en si es héroe o enemigo
      if (id === 0 && missionData) {
        // Héroe del jugador - usa datos del sistema global
        const heroSnapshot = window.CharacterStatsSystem?.getActiveHero?.() || null;
        this.name = heroSnapshot?.characterName?.toUpperCase() || 'UZUMAKI';
        this.hp = heroSnapshot?.stats?.HP || 100;
        this.maxHp = heroSnapshot?.stats?.HP || 100;
        this.atkPower = heroSnapshot?.stats?.ATK || 10;
        this.color = '#E8A030';
        this.glowColor = '#FF8C00';
        this.skinColor = '#F5C09A';
      } else {
        // Enemigo - usa datos de la misión
        this.name = missionData?.name?.toUpperCase().substring(0, 12) || 'ENEMY';
        this.hp = missionData?.hp || 100;
        this.maxHp = missionData?.hp || 100;
        this.atkPower = missionData?.atk || 10;
        this.color = '#6855CC';
        this.glowColor = '#9932CC';
        this.skinColor = '#D8C8E8';
      }

      this.dashTimer = 0;
      this.dashInterval = 800;
      this.tX = x;
      this.tY = BRD_CONFIG.GROUND - BRD_CONFIG.NH;
      this.atkCD = 0;
      this.jutsuCD = 0;
      this.shieldTime = 0;
      this.shieldBroken = false;
      this.shieldBreakTimer = 0;
      this.dmgBurst = 0;
      this.dmgBurstTimer = 0;
      this.defBreak = false;
      this.defBreakTimer = 0;
      this.stunTimer = 0;
      this.invincible = false;
      this.invTimer = 0;
      this.flashTimer = 0;
      this.animF = 0;
      this.animT = 0;
      this.trail = [];
      this.isDead = false;
      this.deathT = 0;
      this.deathSmoke = 0;
      this.winnerFlag = false;
      this.missionData = missionData;
    }

    get cx() {
      return this.x + BRD_CONFIG.NW / 2;
    }

    get cy() {
      return this.y + BRD_CONFIG.NH / 2;
    }

    receiveHit(rawDmg, fromX, attacker) {
      if (this.isDead || this.invincible) return;
      
      // Chance de Kawarimi
      if (Math.random() < 0.15 && this.stunTimer <= 0) {
        this.doKawarimi(attacker);
        return;
      }

      let dmg = rawDmg;
      let shielded = false;
      const canShield = !this.shieldBroken && !this.defBreak && this.shieldTime < 2000;
      
      if (canShield && Math.random() < 0.30) {
        dmg = rawDmg * 0.30;
        shielded = true;
        this.shieldTime += 500;
        BRDSpawnSparks(this.cx, this.cy, 6, '#88CCFF');
        if (this.shieldTime >= 2000) {
          this.shieldBroken = true;
          this.shieldBreakTimer = 90;
          this.shieldTime = 0;
          this.stunTimer = 35;
          BRDSpawnSparks(this.cx, this.cy, 12, '#44AAFF');
        }
      }

      this.dmgBurst += rawDmg;
      if (this.dmgBurst >= this.maxHp * 0.15) {
        this.defBreak = true;
        this.defBreakTimer = 90;
        this.dmgBurst = 0;
        for (let i = 0; i < 8; i++) {
          BRDParticles.push(new BRDParticle(this.cx, this.cy - BRD_CONFIG.NH * 0.5, (Math.random() - 0.5) * 4, -3 - Math.random() * 2, '#FF0000', 28, 3, 'spark'));
        }
      }

      this.hp = Math.max(0, this.hp - dmg);
      const isCrit = rawDmg >= 14;
      BRDDamageNums.push(new BRDDamageNum(this.cx + (Math.random() - 0.5) * 8, this.y - 5, dmg, isCrit));
      
      const dir = (fromX < this.cx) ? 1 : -1;
      const clr = isCrit ? '#FFD700' : '#FF4422';
      
      for (let i = 0; i < (isCrit ? 16 : 9); i++) {
        const ang = (Math.random() - 0.5) * Math.PI * 0.85 + (dir > 0 ? 0 : Math.PI);
        const spd = 2 + Math.random() * 5;
        BRDParticles.push(new BRDParticle(this.cx, this.cy, Math.cos(ang) * spd, Math.sin(ang) * spd - 1, clr, 18 + Math.random() * 10, 2 + Math.random() * 2, 'spark'));
      }

      this.vx += dir * 11;
      this.flashTimer = 18;
      this.stunTimer = 22;
      BRDHitStop = 3;
      BRDTriggerShake(isCrit ? 6 : 2, isCrit ? 20 : 9);
      if (isCrit) BRDCritFlash = 2;

      if (this.hp <= 0 && !this.isDead) {
        this.die();
      }
    }

    doKawarimi(attacker) {
      const behind = attacker.facingRight
        ? attacker.x - BRD_CONFIG.NW - 28
        : attacker.x + BRD_CONFIG.NW + 28;
      const nx = Math.max(5, Math.min(BRD_CONFIG.W - BRD_CONFIG.NW - 5, behind));
      BRDSpawnSmoke(this.cx, this.cy, 18);
      this.x = nx;
      this.y = BRD_CONFIG.GROUND - BRD_CONFIG.NH;
      this.vx = 0;
      this.vy = 0;
      this.onGround = true;
      this.invincible = true;
      this.invTimer = 35;
      BRDSpawnSmoke(this.cx, this.cy, 12);
      BRDTriggerShake(2, 6);
    }

    launchJutsu(target) {
      if (this.jutsuCD > 0) return;
      this.jutsuCD = 90;
      const dx = target.cx - this.cx;
      const dy = target.cy - this.cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const spd = 5;
      BRDJutsus.push(new BRDJutsu(this.cx, this.cy, (dx / d) * spd, (dy / d) * spd, this));
      BRDSpawnSparks(this.cx, this.cy, 14, this.glowColor);
      BRDJutsuVeil = 30;
      if (BRDVeilEl) {
        BRDVeilEl.style.background = 'rgba(0,0,0,0.22)';
      }
      BRDTriggerShake(6, 14);
      this.flashTimer = 8;
    }

    die() {
      this.isDead = true;
      BRDSlowMo = 0.16;
      BRDGameOver = true;
      const winner = BRDFighters.find(f => !f.isDead);
      setTimeout(() => BRDShowWinner(winner ? winner.name : '???'), 2600);
    }

    update(dt, dms, enemy) {
      if (this.isDead) {
        this.deathT += dt;
        this.deathSmoke = Math.min(1, this.deathT * 0.09);
        if (this.deathT % 6 < 1) {
          BRDSpawnSmoke(this.cx + (Math.random() - 0.5) * BRD_CONFIG.NW, this.cy + (Math.random() - 0.5) * BRD_CONFIG.NH, 3);
        }
        return;
      }

      if (BRDHitStop > 0) return;

      if (this.flashTimer > 0) this.flashTimer -= dt;
      if (this.stunTimer > 0) this.stunTimer -= dt;
      if (this.atkCD > 0) this.atkCD -= dt;
      if (this.jutsuCD > 0) this.jutsuCD -= dt;
      if (this.invTimer > 0) {
        this.invTimer -= dt;
        if (this.invTimer <= 0) this.invincible = false;
      }
      if (this.defBreakTimer > 0) {
        this.defBreakTimer -= dt;
        if (this.defBreakTimer <= 0) this.defBreak = false;
      }
      if (this.shieldBreakTimer > 0) {
        this.shieldBreakTimer -= dt;
        if (this.shieldBreakTimer <= 0) this.shieldBroken = false;
      }
      if (this.shieldTime > 0) this.shieldTime = Math.max(0, this.shieldTime - dms);
      this.dmgBurstTimer += dms;
      if (this.dmgBurstTimer >= 2000) {
        this.dmgBurstTimer = 0;
        this.dmgBurst = 0;
      }

      if (!this.onGround) this.vy += BRD_CONFIG.GRAVITY * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.87;

      if (this.y >= BRD_CONFIG.GROUND - BRD_CONFIG.NH) {
        this.y = BRD_CONFIG.GROUND - BRD_CONFIG.NH;
        this.vy = 0;
        this.onGround = true;
      } else {
        this.onGround = false;
      }
      if (this.y < 4) {
        this.y = 4;
        this.vy = 0;
      }
      if (this.x <= 3) {
        this.x = 3;
        this.vx = 4.5;
        if (this.onGround) {
          this.vy = -9;
          this.onGround = false;
        }
      }
      if (this.x >= BRD_CONFIG.W - BRD_CONFIG.NW - 3) {
        this.x = BRD_CONFIG.W - BRD_CONFIG.NW - 3;
        this.vx = -4.5;
        if (this.onGround) {
          this.vy = -9;
          this.onGround = false;
        }
      }

      this.facingRight = enemy.cx > this.cx;

      if (this.stunTimer > 0) return;

      this.dashTimer += dms;
      if (this.dashTimer >= this.dashInterval) {
        this.dashTimer = 0;
        const aerial = Math.random() < 0.38;
        this.tX = 22 + Math.random() * (BRD_CONFIG.W - 44 - BRD_CONFIG.NW);
        this.tY = aerial ? BRD_CONFIG.GROUND - BRD_CONFIG.NH - 55 - Math.random() * 130 : BRD_CONFIG.GROUND - BRD_CONFIG.NH;
      }

      const tdx = this.tX - this.x;
      const tdy = this.tY - this.y;
      const tLen = Math.sqrt(tdx * tdx + tdy * tdy);
      if (tLen > 8) {
        this.vx += (tdx / tLen) * 5 * 0.26;
        if (tdy < -22 && this.onGround) {
          this.vy = -11;
          this.onGround = false;
        }
      }

      this.animT += dt;
      if (this.animT > 3) {
        this.animT = 0;
        this.animF = (this.animF + 1) % 4;
        const spd = Math.abs(this.vx) + Math.abs(this.vy);
        if (spd > 3.5) {
          this.trail.unshift({ x: this.cx, y: this.cy, a: 0.5 });
          if (this.trail.length > 6) this.trail.pop();
        }
      }
      for (let t of this.trail) t.a -= 0.04 * dt;
      this.trail = this.trail.filter(t => t.a > 0);

      if (!enemy.isDead) {
        const dist = Math.hypot(this.cx - enemy.cx, this.cy - enemy.cy);
        if (dist < 50 && this.atkCD <= 0) {
          // Usar ATK del fighter para daño
          const baseDmg = this.atkPower || 10;
          const dmg = baseDmg * 0.8 + Math.random() * 7;
          enemy.receiveHit(dmg, this.cx, this);
          this.atkCD = 42;
        } else if (dist > 150 && this.jutsuCD <= 0) {
          this.launchJutsu(enemy);
        }
      }
    }

    draw(ctx) {
      // Trail
      for (const t of this.trail) {
        ctx.save();
        ctx.globalAlpha = t.a * 0.45;
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.ellipse(t.x, t.y, BRD_CONFIG.NW * 0.38, BRD_CONFIG.NH * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const deadAlpha = this.isDead ? Math.max(0, 1 - this.deathSmoke) : 1;
      if (deadAlpha <= 0) return;

      const flashOn = this.flashTimer > 0 && Math.sin(this.flashTimer * 1.6) > 0;
      const bC = flashOn ? '#FF3333' : this.color;
      const sC = flashOn ? '#FF8866' : this.skinColor;

      ctx.save();
      ctx.globalAlpha = deadAlpha;

      if (!this.facingRight) {
        ctx.translate(this.x + BRD_CONFIG.NW / 2, 0);
        ctx.scale(-1, 1);
        ctx.translate(-(this.x + BRD_CONFIG.NW / 2), 0);
      }

      const x = this.x;
      const y = this.y;
      const lA = Math.sin(this.animF * Math.PI / 2) * 3;
      const jumping = !this.onGround;
      const sAlpha = Math.max(0, 0.4 - (BRD_CONFIG.GROUND - BRD_CONFIG.NH - this.y) * 0.006);

      // Sombra
      ctx.globalAlpha = deadAlpha * sAlpha;
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.beginPath();
      ctx.ellipse(x + BRD_CONFIG.NW / 2, BRD_CONFIG.GROUND - 1, BRD_CONFIG.NW * 0.7, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = deadAlpha;

      // Cuerpo
      ctx.fillStyle = '#222';
      ctx.fillRect(x + 1, y + BRD_CONFIG.NH - 5, BRD_CONFIG.NW * 0.42, 5);
      ctx.fillRect(x + BRD_CONFIG.NW * 0.55, y + BRD_CONFIG.NH - 5, BRD_CONFIG.NW * 0.42, 5);

      ctx.fillStyle = bC;
      ctx.fillRect(x + 2, y + BRD_CONFIG.NH * 0.62, BRD_CONFIG.NW * 0.4, BRD_CONFIG.NH * 0.36 + (jumping ? -lA : lA));
      ctx.fillRect(x + BRD_CONFIG.NW * 0.55, y + BRD_CONFIG.NH * 0.62, BRD_CONFIG.NW * 0.4, BRD_CONFIG.NH * 0.36 + (jumping ? lA : -lA));

      ctx.fillStyle = '#333';
      ctx.fillRect(x + 1, y + BRD_CONFIG.NH * 0.60, BRD_CONFIG.NW - 2, 3);
      ctx.fillStyle = bC;
      ctx.fillRect(x + 2, y + BRD_CONFIG.NH * 0.30, BRD_CONFIG.NW - 4, BRD_CONFIG.NH * 0.32);

      // Detalles de clan
      if (this.id === 0) {
        ctx.fillStyle = '#CC5500';
        ctx.fillRect(x + BRD_CONFIG.NW * 0.32, y + BRD_CONFIG.NH * 0.28, BRD_CONFIG.NW * 0.36, BRD_CONFIG.NH * 0.12);
      } else {
        ctx.fillStyle = '#3322AA';
        ctx.fillRect(x + BRD_CONFIG.NW * 0.32, y + BRD_CONFIG.NH * 0.28, BRD_CONFIG.NW * 0.36, BRD_CONFIG.NH * 0.12);
      }

      // Brazos
      const aS = Math.cos(this.animF * Math.PI / 2) * 2;
      ctx.fillStyle = bC;
      ctx.fillRect(x - 4, y + BRD_CONFIG.NH * 0.32 + aS, 5, BRD_CONFIG.NH * 0.25);
      ctx.fillRect(x + BRD_CONFIG.NW - 1, y + BRD_CONFIG.NH * 0.32 - aS, 5, BRD_CONFIG.NH * 0.25);
      ctx.fillStyle = '#5A4030';
      ctx.fillRect(x - 4, y + BRD_CONFIG.NH * 0.50 + aS, 5, BRD_CONFIG.NH * 0.09);
      ctx.fillRect(x + BRD_CONFIG.NW - 1, y + BRD_CONFIG.NH * 0.50 - aS, 5, BRD_CONFIG.NH * 0.09);

      // Cuello
      ctx.fillStyle = sC;
      ctx.fillRect(x + BRD_CONFIG.NW * 0.36, y + BRD_CONFIG.NH * 0.27, BRD_CONFIG.NW * 0.28, BRD_CONFIG.NH * 0.06);

      // Cabeza
      const hR = BRD_CONFIG.NW * 0.40;
      ctx.fillStyle = sC;
      ctx.beginPath();
      ctx.arc(x + BRD_CONFIG.NW / 2, y + BRD_CONFIG.NH * 0.155, hR, 0, Math.PI * 2);
      ctx.fill();

      // Pelo según personaje
      if (this.id === 0) {
        ctx.fillStyle = '#FFD020';
        ctx.beginPath();
        ctx.arc(x + BRD_CONFIG.NW / 2, y + BRD_CONFIG.NH * 0.10, hR, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD020';
        const spikes = [[-0.4, -7], [-0.1, -9], [0.2, -8], [0.5, -6]];
        for (const [ox, oy] of spikes) {
          ctx.beginPath();
          ctx.moveTo(x + BRD_CONFIG.NW * 0.25 + ox * BRD_CONFIG.NW * 0.5, y + BRD_CONFIG.NH * 0.08);
          ctx.lineTo(x + BRD_CONFIG.NW * 0.5 + ox * BRD_CONFIG.NW * 0.3, y + BRD_CONFIG.NH * 0.05 + oy);
          ctx.lineTo(x + BRD_CONFIG.NW * 0.65 + ox * BRD_CONFIG.NW * 0.3, y + BRD_CONFIG.NH * 0.09);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#111118';
        ctx.beginPath();
        ctx.arc(x + BRD_CONFIG.NW / 2, y + BRD_CONFIG.NH * 0.10, hR, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + BRD_CONFIG.NW * 0.15, y + BRD_CONFIG.NH * 0.07);
        ctx.quadraticCurveTo(x + BRD_CONFIG.NW * 0.75, y - 6, x + BRD_CONFIG.NW * 0.92, y + BRD_CONFIG.NH * 0.12);
        ctx.lineTo(x + BRD_CONFIG.NW / 2, y + BRD_CONFIG.NH * 0.07);
        ctx.closePath();
        ctx.fill();
      }

      // Banda frontal
      const hbCol = this.stunTimer > 0 || this.shieldBroken ? '#CC2222' : (this.id === 0 ? '#FF6600' : '#2233AA');
      ctx.fillStyle = hbCol;
      ctx.fillRect(x + BRD_CONFIG.NW * 0.10, y + BRD_CONFIG.NH * 0.07, BRD_CONFIG.NW * 0.80, 4);
      ctx.fillStyle = '#C8C8C8';
      ctx.fillRect(x + BRD_CONFIG.NW * 0.28, y + BRD_CONFIG.NH * 0.07, BRD_CONFIG.NW * 0.44, 4);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(x + BRD_CONFIG.NW * 0.28, y + BRD_CONFIG.NH * 0.07, BRD_CONFIG.NW * 0.44, 4);
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + BRD_CONFIG.NW * 0.35, y + BRD_CONFIG.NH * 0.09);
      ctx.lineTo(x + BRD_CONFIG.NW * 0.65, y + BRD_CONFIG.NH * 0.09);
      ctx.stroke();

      // Ojo
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(x + BRD_CONFIG.NW * 0.62, y + BRD_CONFIG.NH * 0.155, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(x + BRD_CONFIG.NW * 0.635, y + BRD_CONFIG.NH * 0.150, 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Sharingan activo
      if (this.id === 1 && this.jutsuCD < 25) {
        ctx.strokeStyle = 'rgba(220,0,0,.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + BRD_CONFIG.NW * 0.62, y + BRD_CONFIG.NH * 0.155, 2.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Bigotes (solo héroe)
      if (this.id === 0) {
        ctx.strokeStyle = '#C07848';
        ctx.lineWidth = 0.8;
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.moveTo(x + BRD_CONFIG.NW * 0.54, y + BRD_CONFIG.NH * 0.155 + j * 2.4);
          ctx.lineTo(x + BRD_CONFIG.NW * 0.76, y + BRD_CONFIG.NH * 0.145 + j * 2.4 - 1);
          ctx.stroke();
        }
      }

      // Stun stars
      if (this.stunTimer > 8) {
        for (let i = 0; i < 3; i++) {
          const ang = BRDFrameNum * 0.1 + i * Math.PI * 2 / 3;
          const sx = x + BRD_CONFIG.NW / 2 + Math.cos(ang) * (BRD_CONFIG.NW * 0.55 + 2);
          const sy = y - 4 + Math.sin(ang) * 4;
          ctx.fillStyle = '#FFD700';
          ctx.font = '8px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('★', sx, sy);
        }
      }

      // Defense break effect
      if (this.defBreak) {
        ctx.globalAlpha = deadAlpha * 0.25;
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x + BRD_CONFIG.NW / 2, y + BRD_CONFIG.NH / 2, BRD_CONFIG.NW * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = deadAlpha;
      }

      ctx.restore();

      // Barra de HP
      this.drawHPBar(ctx, deadAlpha);
    }

    drawHPBar(ctx, alpha = 1) {
      const bW = 30;
      const bH = 4;
      const bx = this.x + BRD_CONFIG.NW / 2 - bW / 2;
      const by = this.y - 12;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(0,0,0,.75)';
      ctx.fillRect(bx - 1, by - 1, bW + 2, bH + 2);

      const r = this.hp / this.maxHp;
      ctx.fillStyle = r > 0.5 ? '#44EE44' : r > 0.25 ? '#FFAA00' : '#FF2222';
      ctx.fillRect(bx, by, bW * r, bH);

      ctx.font = 'bold 7px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = this.isDead ? '#666' : (this.id === 0 ? '#FFD700' : '#AA88FF');
      ctx.fillText(this.name.substring(0, 10), this.x + BRD_CONFIG.NW / 2, by - 3);
      ctx.restore();
    }
  }

  /* ─────────────────────────────────────────────
     VARIABLES DE ESTADO DEL SISTEMA
     ───────────────────────────────────────────── */
  let BRDCanvas = null;
  let BRDCtx = null;
  let BRDVeilEl = null;
  let BRDWinScreenEl = null;
  let BRDWinNameEl = null;
  let BRDHostContainer = null;

  let BRDParticles = [];
  let BRDDamageNums = [];
  let BRDJutsus = [];
  let BRDFighters = [];
  let BRDHitStop = 0;
  let BRDSlowMo = 1;
  let BRDFrameNum = 0;
  let BRDGameOver = false;

  let BRDShakeX = 0;
  let BRDShakeY = 0;
  let BRDShakeDur = 0;
  let BRDShakeAmp = 0;
  let BRDCritFlash = 0;
  let BRDJutsuVeil = 0;

  let BRDBgMountains = [];
  let BRDBgMountains2 = [];
  let BRDBgRocks = [];
  let BRDBgClouds = [];

  let BRDCurrentMission = null;
  let BRDIsRunning = false;
  let BRDAnimationId = null;
  let BRDLastTs = 0;

  /* ─────────────────────────────────────────────
     FUNCIONES DE UTILIDAD
     ───────────────────────────────────────────── */
  function BRDTriggerShake(amp, dur) {
    BRDShakeAmp = Math.max(BRDShakeAmp, amp);
    BRDShakeDur = Math.max(BRDShakeDur, dur);
  }

  function BRDSpawnSparks(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 3.5;
      BRDParticles.push(new BRDParticle(x, y, Math.cos(a) * spd, Math.sin(a) * spd, color, 18 + Math.random() * 10, 2 + Math.random() * 1.5, 'spark'));
    }
  }

  function BRDSpawnSmoke(x, y, count) {
    const layers = [['#FFFFFF', 0.8], ['#BBBBBB', 0.5], ['#777777', 0.35]];
    for (let i = 0; i < count; i++) {
      const [col, spd] = layers[i % 3];
      BRDParticles.push(new BRDParticle(
        x + (Math.random() - 0.5) * BRD_CONFIG.NW,
        y + (Math.random() - 0.5) * BRD_CONFIG.NH,
        (Math.random() - 0.5) * spd * 2,
        -spd - 0.5 - Math.random(),
        col,
        32 + Math.random() * 20,
        4 + Math.random() * 4 + (i % 3) * 1.5,
        'smoke'
      ));
    }
  }

  function BRDShowWinner(name) {
    if (BRDWinNameEl) {
      BRDWinNameEl.textContent = name;
      BRDWinNameEl.style.color = name.includes('UZUMAKI') || name.includes('UCHIHA') || name.includes('SENJU') || name.includes('OTSUTSUKI') ? '#FFD700' : '#CC88FF';
    }
    if (BRDWinScreenEl) {
      BRDWinScreenEl.style.display = 'flex';
    }

    // Notificar al sistema de misiones sobre la victoria
    if (BRDCurrentMission && window.MissionSystem) {
      // Aquí se podría llamar a una función para procesar recompensas
      console.log('[BATALLA RANGO D] Victoria reportada:', BRDCurrentMission.name);
    }
  }

  /* ─────────────────────────────────────────────
     GENERACIÓN Y DIBUJO DEL FONDO
     ───────────────────────────────────────────── */
  function BRDGenBG() {
    // Montañas traseras (picos nevados)
    const peaks = [
      { x: 0, y: 210 }, { x: 30, y: 160 }, { x: 60, y: 120 }, { x: 90, y: 80 }, { x: 110, y: 55 }, { x: 130, y: 75 },
      { x: 150, y: 100 }, { x: 175, y: 65 }, { x: 195, y: 40 }, { x: 215, y: 60 }, { x: 235, y: 90 }, { x: 250, y: 70 },
      { x: 270, y: 45 }, { x: 290, y: 70 }, { x: 310, y: 95 }, { x: 330, y: 60 }, { x: 355, y: 30 }, { x: 375, y: 55 },
      { x: 395, y: 80 }, { x: 415, y: 50 }, { x: 435, y: 75 }, { x: 460, y: 110 }, { x: 460, y: 210 }
    ];
    BRDBgMountains = peaks;

    // Montañas medias (segunda capa)
    const peaks2 = [
      { x: 0, y: 220 }, { x: 25, y: 185 }, { x: 55, y: 155 }, { x: 85, y: 175 }, { x: 115, y: 140 }, { x: 145, y: 160 },
      { x: 170, y: 125 }, { x: 200, y: 145 }, { x: 230, y: 115 }, { x: 260, y: 135 }, { x: 290, y: 155 }, { x: 320, y: 125 },
      { x: 350, y: 145 }, { x: 380, y: 165 }, { x: 410, y: 140 }, { x: 440, y: 160 }, { x: 460, y: 175 }, { x: 460, y: 220 }
    ];
    BRDBgMountains2 = peaks2;

    // Rocas del suelo
    BRDBgRocks = [];
    for (let i = 0; i < 10; i++) {
      BRDBgRocks.push({
        x: 20 + Math.random() * (BRD_CONFIG.W - 40),
        w: 8 + Math.random() * 18,
        h: 5 + Math.random() * 9,
        col: Math.random() < 0.5 ? '#7A6A55' : '#6A5A45'
      });
    }

    // Nubes
    BRDBgClouds = [];
    for (let i = 0; i < 5; i++) {
      BRDBgClouds.push({
        x: Math.random() * BRD_CONFIG.W,
        y: 15 + Math.random() * 55,
        w: 35 + Math.random() * 55,
        speed: 0.12 + Math.random() * 0.18
      });
    }
  }

  function BRDDrawBG(parallaxX) {
    if (!BRDCtx) return;

    // Cielo azul claro con gradiente diurno
    const sky = BRDCtx.createLinearGradient(0, 0, 0, BRD_CONFIG.H);
    sky.addColorStop(0, '#5BA8D4');
    sky.addColorStop(0.45, '#87CEEB');
    sky.addColorStop(0.75, '#B8DEF0');
    sky.addColorStop(1, '#D4EAF5');
    BRDCtx.fillStyle = sky;
    BRDCtx.fillRect(0, 0, BRD_CONFIG.W, BRD_CONFIG.H);

    // Sol
    BRDCtx.save();
    BRDCtx.fillStyle = '#FFF8C0';
    BRDCtx.beginPath();
    BRDCtx.arc(BRD_CONFIG.W - 40, 28, 16, 0, Math.PI * 2);
    BRDCtx.fill();
    const sunGlow = BRDCtx.createRadialGradient(BRD_CONFIG.W - 40, 28, 12, BRD_CONFIG.W - 40, 28, 38);
    sunGlow.addColorStop(0, 'rgba(255,240,150,0.35)');
    sunGlow.addColorStop(1, 'rgba(255,240,150,0)');
    BRDCtx.fillStyle = sunGlow;
    BRDCtx.beginPath();
    BRDCtx.arc(BRD_CONFIG.W - 40, 28, 38, 0, Math.PI * 2);
    BRDCtx.fill();
    BRDCtx.restore();

    // Nubes
    for (const cl of BRDBgClouds) {
      cl.x -= cl.speed;
      if (cl.x < -cl.w - 20) cl.x = BRD_CONFIG.W + cl.w + 10;
      BRDCtx.save();
      BRDCtx.globalAlpha = 0.88;
      BRDCtx.fillStyle = '#FFFFFF';
      BRDCtx.beginPath();
      BRDCtx.ellipse(cl.x, cl.y, cl.w, cl.w * 0.4, 0, 0, Math.PI * 2);
      BRDCtx.fill();
      BRDCtx.beginPath();
      BRDCtx.ellipse(cl.x - cl.w * 0.3, cl.y + cl.w * 0.05, cl.w * 0.55, cl.w * 0.32, 0, 0, Math.PI * 2);
      BRDCtx.fill();
      BRDCtx.beginPath();
      BRDCtx.ellipse(cl.x + cl.w * 0.3, cl.y + cl.w * 0.08, cl.w * 0.5, cl.w * 0.28, 0, 0, Math.PI * 2);
      BRDCtx.fill();
      BRDCtx.restore();
    }

    // Montañas lejanas
    BRDCtx.fillStyle = '#7A8E9E';
    BRDCtx.beginPath();
    BRDCtx.moveTo(BRDBgMountains[0].x, BRD_CONFIG.H);
    for (const p of BRDBgMountains) BRDCtx.lineTo(p.x, p.y);
    BRDCtx.lineTo(BRDBgMountains[BRDBgMountains.length - 1].x, BRD_CONFIG.H);
    BRDCtx.closePath();
    BRDCtx.fill();

    BRDCtx.fillStyle = '#A0B4C0';
    BRDCtx.beginPath();
    BRDCtx.moveTo(BRDBgMountains[0].x, BRD_CONFIG.H);
    for (const p of BRDBgMountains) BRDCtx.lineTo(p.x, p.y);
    BRDCtx.lineTo(BRDBgMountains[BRDBgMountains.length - 1].x, BRD_CONFIG.H);
    BRDCtx.closePath();
    BRDCtx.fill();

    // Nieve en picos
    BRDCtx.fillStyle = '#F0F4F8';
    BRDCtx.beginPath();
    for (let i = 0; i < BRDBgMountains.length; i++) {
      const p = BRDBgMountains[i];
      if (i === 0) BRDCtx.moveTo(p.x, p.y + 30);
      if (p.y < 100) {
        BRDCtx.lineTo(p.x, p.y);
      } else {
        BRDCtx.lineTo(p.x, Math.min(p.y, 100));
      }
    }
    for (let i = BRDBgMountains.length - 1; i >= 0; i--) {
      const p = BRDBgMountains[i];
      if (p.y < 130) {
        BRDCtx.lineTo(p.x, p.y + 35);
      } else {
        BRDCtx.lineTo(p.x, 130);
        break;
      }
    }
    BRDCtx.closePath();
    BRDCtx.fill();

    // Sombras en picos
    BRDCtx.fillStyle = '#5A6E7E';
    BRDCtx.beginPath();
    for (let i = 1; i < BRDBgMountains.length - 1; i++) {
      const p = BRDBgMountains[i];
      const prev = BRDBgMountains[i - 1];
      if (p.y < 80 && prev.y > p.y) {
        BRDCtx.moveTo(p.x, p.y);
        BRDCtx.lineTo(p.x - 28, p.y + 50);
        BRDCtx.lineTo(p.x - 8, p.y + 55);
        BRDCtx.closePath();
      }
    }
    BRDCtx.fill();

    // Montañas medias
    BRDCtx.save();
    BRDCtx.translate(-parallaxX * 0.25, 0);
    BRDCtx.fillStyle = '#8B9E7A';
    BRDCtx.beginPath();
    BRDCtx.moveTo(BRDBgMountains2[0].x, BRD_CONFIG.H);
    for (const p of BRDBgMountains2) BRDCtx.lineTo(p.x, p.y);
    BRDCtx.lineTo(BRDBgMountains2[BRDBgMountains2.length - 1].x, BRD_CONFIG.H);
    BRDCtx.closePath();
    BRDCtx.fill();
    BRDCtx.fillStyle = 'rgba(240,244,248,0.7)';
    for (const p of BRDBgMountains2) {
      if (p.y < 140) {
        BRDCtx.beginPath();
        BRDCtx.ellipse(p.x, p.y + 5, 8, 4, 0, 0, Math.PI * 2);
        BRDCtx.fill();
      }
    }
    BRDCtx.restore();

    // Árboles de pino
    BRDCtx.save();
    BRDCtx.translate(-parallaxX * 0.55, 0);
    for (let i = 0; i < 8; i++) {
      const tx = 25 + i * (BRD_CONFIG.W / 7.5);
      const th = 30 + ((i * 37) % 22);
      const tw = 9 + ((i * 13) % 7);
      BRDCtx.fillStyle = '#5C4533';
      BRDCtx.fillRect(tx - 2, BRD_CONFIG.GROUND - th * 0.25, 4, th * 0.25);
      BRDCtx.fillStyle = '#2E5E35';
      BRDCtx.beginPath();
      BRDCtx.moveTo(tx, BRD_CONFIG.GROUND - th);
      BRDCtx.lineTo(tx - tw, BRD_CONFIG.GROUND - th * 0.35);
      BRDCtx.lineTo(tx + tw, BRD_CONFIG.GROUND - th * 0.35);
      BRDCtx.closePath();
      BRDCtx.fill();
      BRDCtx.fillStyle = '#3A7242';
      BRDCtx.beginPath();
      BRDCtx.moveTo(tx, BRD_CONFIG.GROUND - th * 0.75);
      BRDCtx.lineTo(tx - tw * 0.85, BRD_CONFIG.GROUND - th * 0.2);
      BRDCtx.lineTo(tx + tw * 0.85, BRD_CONFIG.GROUND - th * 0.2);
      BRDCtx.closePath();
      BRDCtx.fill();
    }
    BRDCtx.restore();

    // Suelo
    const grd = BRDCtx.createLinearGradient(0, BRD_CONFIG.GROUND, 0, BRD_CONFIG.H);
    grd.addColorStop(0, '#8B6A3E');
    grd.addColorStop(0.10, '#7A5A30');
    grd.addColorStop(0.35, '#5C4220');
    grd.addColorStop(1, '#3A2810');
    BRDCtx.fillStyle = grd;
    BRDCtx.fillRect(0, BRD_CONFIG.GROUND, BRD_CONFIG.W, BRD_CONFIG.H - BRD_CONFIG.GROUND);

    BRDCtx.fillStyle = '#9E7A4A';
    BRDCtx.fillRect(0, BRD_CONFIG.GROUND, BRD_CONFIG.W, 3);
    BRDCtx.fillStyle = '#B08850';
    BRDCtx.fillRect(0, BRD_CONFIG.GROUND, BRD_CONFIG.W, 1.5);

    // Raíces
    BRDCtx.strokeStyle = '#4A3018';
    BRDCtx.lineWidth = 1.2;
    const rootPts = [
      [{ x: 30, y: BRD_CONFIG.GROUND + 4 }, { x: 50, y: BRD_CONFIG.GROUND + 12 }, { x: 65, y: BRD_CONFIG.GROUND + 8 }],
      [{ x: 120, y: BRD_CONFIG.GROUND + 2 }, { x: 105, y: BRD_CONFIG.GROUND + 14 }, { x: 90, y: BRD_CONFIG.GROUND + 10 }],
      [{ x: 200, y: BRD_CONFIG.GROUND + 5 }, { x: 220, y: BRD_CONFIG.GROUND + 16 }, { x: 240, y: BRD_CONFIG.GROUND + 11 }],
      [{ x: 310, y: BRD_CONFIG.GROUND + 3 }, { x: 295, y: BRD_CONFIG.GROUND + 13 }, { x: 280, y: BRD_CONFIG.GROUND + 9 }],
      [{ x: 380, y: BRD_CONFIG.GROUND + 4 }, { x: 400, y: BRD_CONFIG.GROUND + 15 }, { x: 415, y: BRD_CONFIG.GROUND + 10 }]
    ];
    for (const root of rootPts) {
      BRDCtx.beginPath();
      BRDCtx.moveTo(root[0].x, root[0].y);
      for (let k = 1; k < root.length; k++) BRDCtx.lineTo(root[k].x, root[k].y);
      BRDCtx.stroke();
    }

    // Rocas
    for (const r of BRDBgRocks) {
      BRDCtx.fillStyle = r.col;
      BRDCtx.beginPath();
      BRDCtx.ellipse(r.x, BRD_CONFIG.GROUND + r.h * 0.4, r.w, r.h, 0, 0, Math.PI * 2);
      BRDCtx.fill();
      BRDCtx.fillStyle = 'rgba(255,230,180,0.25)';
      BRDCtx.beginPath();
      BRDCtx.ellipse(r.x + r.w * 0.25, BRD_CONFIG.GROUND + r.h * 0.2, r.w * 0.45, r.h * 0.4, 0, 0, Math.PI * 2);
      BRDCtx.fill();
      BRDCtx.fillStyle = 'rgba(0,0,0,0.30)';
      BRDCtx.beginPath();
      BRDCtx.ellipse(r.x - r.w * 0.2, BRD_CONFIG.GROUND + r.h * 0.45, r.w * 0.35, r.h * 0.35, 0, 0, Math.PI * 2);
      BRDCtx.fill();
    }

    // Sombras de luchadores
    for (const f of BRDFighters) {
      const shLen = 18 + (BRD_CONFIG.GROUND - BRD_CONFIG.NH - f.y) * 0.05;
      BRDCtx.save();
      BRDCtx.globalAlpha = 0.18;
      BRDCtx.fillStyle = '#2A1A08';
      BRDCtx.beginPath();
      BRDCtx.moveTo(f.cx - BRD_CONFIG.NW * 0.4, BRD_CONFIG.GROUND);
      BRDCtx.lineTo(f.cx + BRD_CONFIG.NW * 0.4, BRD_CONFIG.GROUND);
      BRDCtx.lineTo(f.cx + BRD_CONFIG.NW * 0.4 - shLen, BRD_CONFIG.GROUND + 6);
      BRDCtx.lineTo(f.cx - BRD_CONFIG.NW * 0.4 - shLen, BRD_CONFIG.GROUND + 6);
      BRDCtx.closePath();
      BRDCtx.fill();
      BRDCtx.restore();
    }

    // Polvo del suelo
    const dustGrd = BRDCtx.createLinearGradient(0, BRD_CONFIG.GROUND - 10, 0, BRD_CONFIG.GROUND + 18);
    dustGrd.addColorStop(0, 'rgba(180,140,80,0)');
    dustGrd.addColorStop(1, 'rgba(120,90,40,0.22)');
    BRDCtx.fillStyle = dustGrd;
    BRDCtx.fillRect(0, BRD_CONFIG.GROUND - 10, BRD_CONFIG.W, 28);
  }

  /* ─────────────────────────────────────────────
     LÓGICA DE COMBATE
     ───────────────────────────────────────────── */
  function BRDCheckJutsuClash() {
    for (let i = 0; i < BRDJutsus.length; i++) {
      for (let j = i + 1; j < BRDJutsus.length; j++) {
        const a = BRDJutsus[i];
        const b = BRDJutsus[j];
        if (a.owner === b.owner || a.dead || b.dead) continue;
        if (Math.hypot(a.x - b.x, a.y - b.y) < a.size + b.size + 6) {
          const ex = (a.x + b.x) / 2;
          const ey = (a.y + b.y) / 2;
          for (let k = 0; k < 22; k++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 3 + Math.random() * 5;
            BRDParticles.push(new BRDParticle(ex, ey, Math.cos(ang) * spd, Math.sin(ang) * spd - 1, '#FFFFFF', 22, 3, 'spark'));
            BRDParticles.push(new BRDParticle(ex, ey, Math.cos(ang) * spd * 0.5, Math.sin(ang) * spd * 0.5, '#FFD700', 32, 2.5, 'spark'));
          }
          BRDCritFlash = 2;
          BRDTriggerShake(6, 18);
          a.dead = true;
          b.dead = true;
          for (const f of BRDFighters) {
            f.vx += (f.cx > ex ? 4.5 : -4.5);
          }
        }
      }
    }
  }

  function BRDUpdate(dt, dms) {
    BRDFrameNum++;

    // Partículas de polvo ambiente
    if (BRDFrameNum % 65 === 0) {
      BRDParticles.push(new BRDParticle(
        Math.random() * BRD_CONFIG.W,
        BRD_CONFIG.GROUND - 2,
        (Math.random() - 0.5) * 1.2,
        -0.3 - Math.random() * 0.5,
        Math.random() < 0.5 ? '#C8A870' : '#A88850',
        90 + Math.random() * 60,
        1.2 + Math.random(),
        'dust'
      ));
    }

    if (BRDCritFlash > 0) BRDCritFlash -= dt;
    if (BRDShakeDur > 0) {
      BRDShakeDur -= dt;
      const f = BRDShakeDur / 10;
      BRDShakeX = (Math.random() - 0.5) * BRDShakeAmp * f;
      BRDShakeY = (Math.random() - 0.5) * BRDShakeAmp * f;
      if (BRDShakeDur <= 0) {
        BRDShakeX = 0;
        BRDShakeY = 0;
        BRDShakeAmp = 0;
      }
    }
    if (BRDJutsuVeil > 0) {
      BRDJutsuVeil -= dt;
      if (BRDJutsuVeil <= 0) {
        BRDJutsuVeil = 0;
        if (BRDVeilEl) BRDVeilEl.style.background = 'rgba(0,0,0,0)';
      }
    }

    if (BRDHitStop > 0) {
      BRDHitStop -= dt;
      BRDParticles.forEach(p => p.update(dt));
      BRDParticles = BRDParticles.filter(p => !p.isDead());
      BRDDamageNums.forEach(d => d.update(dt));
      BRDDamageNums = BRDDamageNums.filter(d => !d.isDead());
      return;
    }

    const [f0, f1] = BRDFighters;
    f0.update(dt, dms, f1);
    f1.update(dt, dms, f0);

    for (const j of BRDJutsus) j.update(dt);

    for (const j of BRDJutsus) {
      if (j.dead) continue;
      for (const f of BRDFighters) {
        if (f === j.owner || f.isDead || f.invincible) continue;
        if (Math.hypot(j.x - f.cx, j.y - f.cy) < j.size + BRD_CONFIG.NW / 2) {
          const dmg = 10 + Math.random() * 10;
          f.receiveHit(dmg, j.x, j.owner);
          for (let i = 0; i < 16; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 4;
            BRDParticles.push(new BRDParticle(j.x, j.y, Math.cos(ang) * spd, Math.sin(ang) * spd, j.color, 20, 3, 'spark'));
          }
          j.dead = true;
        }
      }
    }

    BRDCheckJutsuClash();
    BRDJutsus = BRDJutsus.filter(j => !j.dead);

    BRDParticles.forEach(p => p.update(dt));
    BRDParticles = BRDParticles.filter(p => !p.isDead());
    BRDDamageNums.forEach(d => d.update(dt));
    BRDDamageNums = BRDDamageNums.filter(d => !d.isDead());
  }

  function BRDRender() {
    if (!BRDCtx) return;

    BRDCtx.save();
    BRDCtx.translate(BRDShakeX, BRDShakeY);

    if (BRDCritFlash > 1) {
      BRDCtx.fillStyle = 'rgba(255,255,255,.9)';
      BRDCtx.fillRect(-BRDShakeX, -BRDShakeY, BRD_CONFIG.W, BRD_CONFIG.H);
      BRDCtx.restore();
      return;
    }

    const avgX = BRDFighters.reduce((s, f) => s + f.cx, 0) / BRDFighters.length;
    const parallaxX = (avgX - BRD_CONFIG.W / 2) * 0.10;

    BRDDrawBG(parallaxX);

    for (const j of BRDJutsus) j.draw(BRDCtx);
    for (const f of BRDFighters) f.draw(BRDCtx);
    for (const p of BRDParticles) p.draw(BRDCtx);
    for (const d of BRDDamageNums) d.draw(BRDCtx);

    if (BRDGameOver && BRDSlowMo < 1) {
      BRDCtx.save();
      BRDCtx.fillStyle = 'rgba(255,220,0,.22)';
      BRDCtx.font = 'bold 14px Arial Black';
      BRDCtx.textAlign = 'center';
      BRDCtx.fillText('K.O.', BRD_CONFIG.W / 2, 28);
      BRDCtx.restore();
    }

    BRDCtx.restore();
  }

  function BRDLoop(ts) {
    const rawDt = Math.min((ts - BRDLastTs) / 16.667, 3);
    BRDLastTs = ts;
    const dt = rawDt * BRDSlowMo;
    const dms = rawDt * 16.667 * BRDSlowMo;

    BRDUpdate(dt, dms);
    BRDRender();

    if (BRDIsRunning) {
      BRDAnimationId = requestAnimationFrame(BRDLoop);
    }
  }

  function BRDStartGame(missionData) {
    BRDParticles = [];
    BRDDamageNums = [];
    BRDJutsus = [];
    BRDHitStop = 0;
    BRDSlowMo = 1;
    BRDFrameNum = 0;
    BRDGameOver = false;
    BRDShakeX = 0;
    BRDShakeY = 0;
    BRDShakeDur = 0;
    BRDShakeAmp = 0;
    BRDCritFlash = 0;
    BRDJutsuVeil = 0;

    if (BRDVeilEl) BRDVeilEl.style.background = 'rgba(0,0,0,0)';
    if (BRDWinScreenEl) BRDWinScreenEl.style.display = 'none';

    BRDCurrentMission = missionData;

    // Crear luchadores
    BRDFighters = [
      new BRDFighter(70, 0, missionData),
      new BRDFighter(BRD_CONFIG.W - 100, 1, missionData)
    ];
    BRDFighters[0].tX = 120 + Math.random() * 80;
    BRDFighters[1].tX = 250 + Math.random() * 80;

    BRDGenBG();

    BRDLastTs = performance.now();
    BRDIsRunning = true;
    BRDAnimationId = requestAnimationFrame(BRDLoop);
  }

  function BRDStopGame() {
    BRDIsRunning = false;
    if (BRDAnimationId) {
      cancelAnimationFrame(BRDAnimationId);
      BRDAnimationId = null;
    }
  }

  /* ─────────────────────────────────────────────
     INYECCIÓN DE UI EN EL DOM
     ───────────────────────────────────────────── */
  function BRDInjectStyles() {
    if (document.getElementById('brd-styles')) return;

    const style = document.createElement('style');
    style.id = 'brd-styles';
    style.textContent = `
      .brd-wrapper {
        position: relative;
        width: 460px;
        height: 360px;
        overflow: hidden;
        box-shadow:
          0 0 0 1px rgba(255,120,0,0.25),
          0 0 30px rgba(255,80,0,0.3),
          0 0 80px rgba(120,0,255,0.15);
        margin: 0 auto;
      }
      .brd-canvas {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        z-index: 2;
      }
      .brd-veil {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 8;
        background: rgba(0,0,0,0);
        transition: background 0.2s ease;
      }
      .brd-winner-screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 20;
        background: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%);
      }
      .brd-win-banner {
        border-top: 1px solid rgba(255,200,0,0.4);
        border-bottom: 1px solid rgba(255,200,0,0.4);
        padding: 12px 40px;
        text-align: center;
        animation: brdWinPulse 0.8s ease-in-out infinite alternate;
      }
      .brd-win-label {
        font-size: 10px;
        letter-spacing: 6px;
        color: #AA8800;
        margin-bottom: 4px;
        font-family: 'Arial Black', Impact, sans-serif;
      }
      .brd-win-name {
        font-size: 42px;
        font-weight: 900;
        letter-spacing: 5px;
        text-transform: uppercase;
        -webkit-text-stroke: 1px rgba(255,200,0,0.5);
        font-family: 'Arial Black', Impact, sans-serif;
      }
      .brd-win-sub {
        font-size: 11px;
        letter-spacing: 4px;
        color: #888;
        margin-top: 6px;
        font-family: 'Arial Black', Impact, sans-serif;
      }
      .brd-btn-restart {
        margin-top: 22px;
        padding: 9px 28px;
        background: transparent;
        border: 1px solid rgba(255,180,0,0.5);
        color: #FFD700;
        font-size: 11px;
        letter-spacing: 3px;
        cursor: pointer;
        text-transform: uppercase;
        transition: all 0.2s;
        font-family: 'Arial Black', Impact, sans-serif;
      }
      .brd-btn-restart:hover {
        background: rgba(255,180,0,0.15);
        border-color: rgba(255,180,0,0.9);
      }
      @keyframes brdWinPulse {
        from { filter: drop-shadow(0 0 8px rgba(255,200,0,0.3)); }
        to   { filter: drop-shadow(0 0 25px rgba(255,200,0,0.7)); }
      }
    `;
    document.head.appendChild(style);
  }

  function BRDCreateUI() {
    BRDInjectStyles();

    // Limpiar contenedor anterior si existe
    if (BRDHostContainer) {
      BRDHostContainer.innerHTML = '';
    }

    // Crear wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'brd-wrapper';
    wrapper.id = 'brd-wrapper';

    // Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'brd-canvas';
    canvas.id = 'brd-canvas';
    canvas.width = BRD_CONFIG.W;
    canvas.height = BRD_CONFIG.H;
    wrapper.appendChild(canvas);

    // Veil
    const veil = document.createElement('div');
    veil.className = 'brd-veil';
    veil.id = 'brd-veil';
    wrapper.appendChild(veil);

    // Winner screen
    const winScreen = document.createElement('div');
    winScreen.className = 'brd-winner-screen';
    winScreen.id = 'brd-winner-screen';
    winScreen.innerHTML = `
      <div class="brd-win-banner">
        <div class="brd-win-label">VENCEDOR</div>
        <div class="brd-win-name" id="brd-win-name">UZUMAKI</div>
        <div class="brd-win-sub">★ &nbsp; VICTORIA &nbsp; ★</div>
      </div>
      <button class="brd-btn-restart" id="brd-btn-restart">▶ &nbsp; NUEVA BATALLA</button>
    `;
    wrapper.appendChild(winScreen);

    // Insertar en el host
    const host = document.getElementById('hero-system-host');
    if (host) {
      host.appendChild(wrapper);
      BRDHostContainer = host;
    }

    // Referencias
    BRDCanvas = canvas;
    BRDCtx = canvas.getContext('2d');
    BRDVeilEl = veil;
    BRDWinScreenEl = winScreen;
    BRDWinNameEl = document.getElementById('brd-win-name');

    // Event listener para botón de reinicio
    const restartBtn = document.getElementById('brd-btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        BRDStartGame(BRDCurrentMission);
      });
    }
  }

  /* ─────────────────────────────────────────────
     API PÚBLICA DEL SISTEMA
     ───────────────────────────────────────────── */
  const BatallaRangoDSystem = {
    isActive: false,

    mount(missionData = null) {
      if (this.isActive) return;

      console.log('[BATALLA RANGO D] Iniciando sistema...');
      BRDCreateUI();
      BRDStartGame(missionData);
      this.isActive = true;
    },

    unmount() {
      if (!this.isActive) return;

      console.log('[BATALLA RANGO D] Deteniendo sistema...');
      BRDStopGame();

      if (BRDHostContainer) {
        BRDHostContainer.innerHTML = '';
        BRDHostContainer = null;
      }

      BRDCanvas = null;
      BRDCtx = null;
      BRDVeilEl = null;
      BRDWinScreenEl = null;
      BRDWinNameEl = null;
      BRDFighters = [];
      BRDParticles = [];
      BRDDamageNums = [];
      BRDJutsus = [];
      BRDCurrentMission = null;
      this.isActive = false;
    },

    startBattle(missionData) {
      if (!this.isActive) {
        this.mount(missionData);
      } else {
        BRDStartGame(missionData);
      }
    },

    isMounted() {
      return this.isActive && BRDHostContainer !== null;
    }
  };

  // Exportar al ámbito global
  window.BatallaRangoDSystem = BatallaRangoDSystem;

  console.log('[BATALLA RANGO D] Sistema cargado correctamente.');
})();
