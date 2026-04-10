(function () {
  const TEMPLATE_ID = 'battleSystemTemplate';

  class ShinobiBattleEngine {
    constructor(canvas, config = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.W = 460;
      this.H = 360;
      this.GROUND = this.H - 58;
      this.GRAVITY = 0.42;
      this.SS = 0.7;

      this.particles = [];
      this.projectiles = [];
      this.logEffects = [];
      this.fighters = [];
      this.hitStopLeft = 0;
      this.slowMo = false;
      this.slowMoTimer = 0;
      this.gameOver = false;
      this.winner = null;
      this.frameCount = 0;
      this.lastTS = 0;
      this.rafId = null;
      this.onBattleEnd = null;

      this.STARS = Array.from({ length: 18 }, () => ({
        x: Math.random() * this.W,
        y: Math.random() * (this.H * 0.55),
        r: Math.random() * 1.2 + 0.3,
      }));

      this.Fighter = this.createFighterClass();
      this.playerSpriteImage = null;
      this.enemySpriteImage = null;
      this.playerName = 'KAGE';
      this.enemyName = 'AKUMA';
      this.setBattleAssets(config);
    }

    createSpriteImage(src) {
      if (!src) return null;
      const img = new Image();
      img.src = src;
      return img;
    }

    setBattleAssets(config = {}) {
      this.playerName = config.playerName || 'KAGE';
      this.enemyName = config.enemyName || 'AKUMA';
      this.playerSpriteImage = this.createSpriteImage(config.playerSprite || '');
      this.enemySpriteImage = this.createSpriteImage(config.enemySprite || '');
    }

    rng(min, max) { return min + Math.random() * (max - min); }
    clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    dist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); }

    start(onBattleEnd) {
      this.onBattleEnd = onBattleEnd;
      this.initGame();
      this.rafId = requestAnimationFrame((ts) => this.loop(ts));
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    initGame() {
      this.fighters = [new this.Fighter(75, 1), new this.Fighter(this.W - 75, 2)];
      this.particles = [];
      this.projectiles = [];
      this.logEffects = [];
      this.hitStopLeft = 0;
      this.slowMo = false;
      this.slowMoTimer = 0;
      this.gameOver = false;
      this.winner = null;
      this.frameCount = 0;
      this.lastTS = performance.now();
    }

    createFighterClass() {
      const engine = this;

      return class Fighter {
        constructor(startX, team) {
          this.x = startX; this.y = engine.GROUND; this.vx = 0; this.vy = 0;
          this.team = team; this.facing = team === 1 ? 1 : -1; this.zIndex = team;
          this.name = team === 1 ? engine.playerName : engine.enemyName;
          this.bodyColor = team === 1 ? '#2255bb' : '#bb2222';
          this.auraColor = team === 1 ? '#55aaff' : '#ff8833';
          this.awakeColor = team === 1 ? '#00ffcc' : '#ffdd00';
          this.hbColor = team === 1 ? '#aa0000' : '#000088';
          this.maxHP = 320; this.hp = 320;
          this.maxChakra = 100; this.chakra = 0;
          this.shielding = false; this.shieldTick = 0; this.shieldCD = 0;
          this.guardBroken = false; this.guardBreakCD = 0;
          this.awakening = false; this.awakeSpd = 1.0; this.awakeFreeTimer = 0;
          this.kawaCD = 0;
          this.dashTarget = { x: startX, y: engine.GROUND };
          this.dashTimer = 800; this.onGround = true; this.jumpCD = 0;
          this.healing = false; this.healTick = 0; this.healCD = 0;
          this.atkCD = 0; this.jutsuCD = 0; this.jutsuFlash = 0;
          this.hitFlash = 0; this.stunTimer = 0;
          this.dead = false; this.deathTimer = 180;
          this.animTime = Math.random() * 100; this.legPhase = 0;
          this.spriteImage = team === 1 ? engine.playerSpriteImage : engine.enemySpriteImage;
        }

        get inAwakening() { return this.hp / this.maxHP < 0.2; }
        get needsPotion() { return this.hp / this.maxHP < 0.35; }
        get chakraFull() { return this.chakra >= this.maxChakra; }
        gainChakra(n) { this.chakra = Math.min(this.maxChakra, this.chakra + n); }

        tickTimers(dt) {
          this.animTime += dt * 0.003;
          this.legPhase = Math.sin(this.animTime * 4) * 6;
          this.hitFlash = Math.max(0, this.hitFlash - 1);
          this.stunTimer = Math.max(0, this.stunTimer - 1);
          this.jutsuCD = Math.max(0, this.jutsuCD - 1);
          this.atkCD = Math.max(0, this.atkCD - 1);
          this.kawaCD = Math.max(0, this.kawaCD - 1);
          this.healCD = Math.max(0, this.healCD - 1);
          this.jumpCD = Math.max(0, this.jumpCD - 1);
          this.jutsuFlash = Math.max(0, this.jutsuFlash - 1);
          this.shieldCD = Math.max(0, this.shieldCD - 1);
          if (this.guardBreakCD > 0) {
            this.guardBreakCD--;
            if (this.guardBreakCD === 0) this.guardBroken = false;
          }
        }

        update(enemy, dt) {
          if (this.dead) {
            this.vx *= 0.9; this.vy += engine.GRAVITY; this.x += this.vx; this.y += this.vy; this.deathTimer--; return;
          }

          this.tickTimers(dt);
          this.updateAwakening();

          if (this.stunTimer > 0) { this.physics(); this.wallBounce(); return; }

          if (this.shielding) {
            this.shieldTick++;
            if (this.shieldTick >= 120) {
              this.shielding = false; this.guardBroken = true; this.guardBreakCD = 80;
              this.stunTimer = 50; this.shieldTick = 0; this.shieldCD = 200;
            }
          }

          if (this.healing) { this.doHealRetreat(enemy); this.physics(); this.wallBounce(); return; }
          if (this.needsPotion && !this.healing && this.healCD <= 0) { this.healing = true; this.healTick = 90; }

          this.dashTimer -= dt;
          if (this.dashTimer <= 0) { this.dashTimer = engine.rng(700, 950); this.pickTarget(enemy); }

          this.moveDash();
          this.facing = enemy.x >= this.x ? 1 : -1;

          const d = engine.dist(this.x, this.y, enemy.x, enemy.y);
          if (this.chakraFull && this.jutsuCD <= 0 && !this.guardBroken) {
            this.launchJutsu(enemy);
          } else if (d > 150 && this.jutsuCD <= 0 && this.chakra >= 40 && !this.guardBroken) {
            this.launchJutsu(enemy);
          }

          if (d < 55 && this.atkCD <= 0 && !this.guardBroken) this.doMelee(enemy);

          this.physics(); this.wallBounce();
        }

        updateAwakening() {
          const was = this.awakening;
          this.awakening = this.inAwakening;
          if (this.awakening && !was) { this.awakeSpd = 1.4; this.awakeFreeTimer = 300; this.zIndex = 12; }
          if (this.awakeFreeTimer > 0) this.awakeFreeTimer--;
        }

        pickTarget(enemy) {
          if (this.needsPotion) return;
          const aerial = Math.random() < 0.38;
          const tx = enemy.x + engine.rng(aerial ? -60 : -90, aerial ? 60 : 90);
          const ty = aerial ? engine.GROUND - engine.rng(60, 130) : engine.GROUND;
          this.dashTarget = { x: engine.clamp(tx, 28, engine.W - 28), y: engine.clamp(ty, 35, engine.GROUND) };
        }

        moveDash() {
          const tdx = this.dashTarget.x - this.x;
          const tdy = this.dashTarget.y - this.y;
          const td = Math.hypot(tdx, tdy) || 1;
          const spd = 5.0 * this.awakeSpd;
          if (td > 8) {
            this.vx = (tdx / td) * spd;
            if (this.dashTarget.y < this.y - 10 && this.onGround && this.jumpCD <= 0) {
              this.vy = -(9 + 2 * (this.awakeSpd - 1));
              this.jumpCD = 55;
            }
          } else {
            this.vx *= 0.8;
          }
        }

        doHealRetreat(enemy) {
          this.healTick--;
          const dir = this.x < enemy.x ? -1 : 1;
          this.vx = dir * 3.0 * this.awakeSpd;
          if (this.healTick <= 0) {
            this.hp = Math.min(this.maxHP, this.hp + 100);
            this.healing = false;
            this.healCD = 280;
            engine.spawnHeal(this.x, this.y);
          }
        }

        launchJutsu(enemy) {
          const free = this.awakening && this.awakeFreeTimer > 0;
          if (!free) this.chakra -= 40;
          this.jutsuCD = engine.rng(90, 140);
          engine.fireJutsu(this, enemy);
        }

        doMelee(enemy) {
          this.atkCD = engine.rng(35, 55);
          const isCrit = Math.random() < 0.22;
          const dmg = isCrit ? engine.rng(28, 42) : engine.rng(12, 22);

          if (isCrit && enemy.kawaCD <= 0 && Math.random() < 0.15) {
            enemy.doKawarimi(this);
            return;
          }

          enemy.takeDmg(dmg, this.facing, isCrit);
          this.gainChakra(isCrit ? 18 : 10);
          if (isCrit) engine.triggerHitStop();
        }

        takeDmg(amount, kbDir, isCrit) {
          if (this.dead) return;
          let dmg = amount;
          let blocked = false;

          if (!this.guardBroken && !this.shielding && this.shieldCD <= 0 && Math.random() < 0.3) {
            this.shielding = true;
            this.shieldTick = 0;
          }
          if (this.shielding) { dmg *= 0.3; blocked = true; }

          if (this.healing) { this.healing = false; this.healCD = 280; }

          this.hp -= dmg;
          this.hitFlash = 16;
          this.stunTimer = blocked ? 6 : 14;
          this.vx = kbDir * 10;
          this.vy = -3.5;

          if (blocked) this.drawShieldBurst();
          else engine.spawnBurst(this.x, this.y - 28 * engine.SS, '#ff4422', 8);

          if (this.hp <= 0) { this.hp = 0; this.doDeath(); }
        }

        drawShieldBurst() {
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            engine.spawnP(this.x + Math.cos(a) * 20, this.y - 30 * engine.SS + Math.sin(a) * 20, {
              vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, life: 22, size: 4, color: '#88aaff', g: 0, spread: 0,
            });
          }
        }

        doKawarimi(attacker) {
          engine.spawnSmoke(this.x, this.y - 24);
          engine.spawnLog(this.x, this.y);
          this.x = engine.clamp(attacker.x + (-attacker.facing * 65), 30, engine.W - 30);
          this.y = engine.GROUND;
          this.vx = 0;
          this.vy = 0;
          this.kawaCD = 160;
          this.zIndex = 14;
          engine.spawnSmoke(this.x, this.y - 24);
        }

        wallBounce() {
          if (this.x < 22) {
            this.x = 22; this.vx = 3.5;
            if (this.onGround && this.jumpCD <= 0) { this.vy = -8; this.jumpCD = 45; }
            this.dashTarget = { x: engine.W / 2 + engine.rng(0, 80), y: engine.GROUND };
          }
          if (this.x > engine.W - 22) {
            this.x = engine.W - 22; this.vx = -3.5;
            if (this.onGround && this.jumpCD <= 0) { this.vy = -8; this.jumpCD = 45; }
            this.dashTarget = { x: engine.W / 2 - engine.rng(0, 80), y: engine.GROUND };
          }
          if (this.y < 22) { this.y = 22; this.vy = 3; }
        }

        physics() {
          this.vy += engine.GRAVITY;
          this.x += this.vx;
          this.y += this.vy;
          if (this.y >= engine.GROUND) { this.y = engine.GROUND; this.vy = 0; this.onGround = true; }
          else this.onGround = false;
          this.vx *= 0.87;
        }

        doDeath() {
          this.dead = true;
          this.vx = -this.facing * 3;
          this.vy = -6;
          engine.spawnSmoke(this.x, this.y - 24, 22);
          engine.triggerSlowMo();
          engine.triggerHitStop();
          engine.gameOver = true;
          engine.winner = engine.fighters.find((f) => f !== this);
          if (typeof engine.onBattleEnd === 'function') {
            setTimeout(() => engine.onBattleEnd(engine.winner), 300);
          }
        }

        draw() {
          const { ctx, SS } = engine;
          if (this.dead) {
            if (this.deathTimer > 80) {
              ctx.save();
              ctx.globalAlpha = (this.deathTimer - 80) / 100;
              this._drawSprite();
              ctx.restore();
            }
            return;
          }

          if (this.awakening) this._drawAura(this.awakeColor, 26 + Math.sin(Date.now() * 0.008) * 5);
          if (this.shielding && !this.guardBroken) this._drawShieldAura();

          if (this.jutsuFlash > 0) {
            const a = this.jutsuFlash / 14;
            ctx.save();
            ctx.globalAlpha = a * 0.85;
            ctx.fillStyle = this.auraColor;
            ctx.shadowColor = this.auraColor;
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(this.x, this.y - 30 * SS, 24 * SS, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          if (this.hitFlash > 0 && (this.hitFlash % 4) < 2) {
            ctx.save(); ctx.globalAlpha = 0.7; this._drawSprite('#ff2200'); ctx.restore();
          } else {
            this._drawSprite();
          }
        }

        _drawAura(color, r) {
          const { ctx, SS } = engine;
          ctx.save();
          const grad = ctx.createRadialGradient(this.x, this.y - 30 * SS, 0, this.x, this.y - 30 * SS, r);
          grad.addColorStop(0, `${color}aa`); grad.addColorStop(0.5, `${color}55`); grad.addColorStop(1, `${color}00`);
          ctx.fillStyle = grad;
          ctx.shadowColor = color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(this.x, this.y - 30 * SS, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        _drawShieldAura() {
          const t = Date.now() * 0.002;
          const { ctx, SS } = engine;
          ctx.save();
          ctx.strokeStyle = '#99bbff';
          ctx.shadowColor = '#6688ee';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.75;
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const a = (i / 6) * Math.PI * 2 + t;
            const r = 24 * SS;
            const px = this.x + Math.cos(a) * r;
            const py = this.y - 28 * SS + Math.sin(a) * r * 0.7;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = '#8899ff';
          ctx.fill();
          ctx.restore();
        }

        _drawSprite(overrideColor) {
          const { ctx, SS } = engine;
          const x = this.x; const y = this.y; const s = SS; const f = this.facing;
          const aw = this.awakening;
          const bc = overrideColor || this.bodyColor;
          ctx.save();
          ctx.translate(x, y);
          ctx.fillStyle = 'rgba(0,0,0,0.28)';
          ctx.beginPath();
          ctx.ellipse(0, 1, 15 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.scale(f, 1);

          if (!overrideColor && this.spriteImage && this.spriteImage.complete && this.spriteImage.naturalWidth > 0) {
            const w = 44 * s;
            const h = 60 * s;
            const bob = this.onGround ? Math.sin(this.animTime * 4) * 1.2 : 0;
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(this.spriteImage, -w / 2, -h + bob, w, h);
            ctx.restore();
            return;
          }

          const legOff = this.onGround ? Math.sin(this.animTime * 4) * 4 : 0;
          ctx.fillStyle = aw ? '#111133' : '#1e1e1e';
          ctx.beginPath(); ctx.roundRect(-9 * s, -22 * s + legOff, 7 * s, 22 * s, 2 * s); ctx.fill();
          ctx.beginPath(); ctx.roundRect(2 * s, -22 * s - legOff, 7 * s, 22 * s, 2 * s); ctx.fill();

          ctx.fillStyle = '#111';
          ctx.fillRect(-11 * s, -3 * s, 9 * s, 5 * s);
          ctx.fillRect(2 * s, -3 * s, 9 * s, 5 * s);

          ctx.fillStyle = bc; ctx.shadowColor = bc; ctx.shadowBlur = aw ? 10 : 0;
          ctx.beginPath(); ctx.roundRect(-11 * s, -44 * s, 22 * s, 22 * s, 3 * s); ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = 'rgba(255,255,255,0.13)';
          ctx.beginPath(); ctx.roundRect(-5 * s, -43 * s, 10 * s, 14 * s, 2 * s); ctx.fill();

          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(-11 * s, -24 * s, 22 * s, 4 * s);

          const armColor = overrideColor ? bc : (aw ? this.awakeColor : bc);
          ctx.fillStyle = armColor;
          ctx.beginPath(); ctx.roundRect(-18 * s, -44 * s + (this.onGround ? legOff * 0.5 : 0), 7 * s, 18 * s, 2 * s); ctx.fill();
          ctx.beginPath(); ctx.roundRect(11 * s, -44 * s - (this.onGround ? legOff * 0.5 : 0), 7 * s, 18 * s, 2 * s); ctx.fill();

          ctx.fillStyle = '#e8b980';
          ctx.beginPath(); ctx.arc(-14 * s, -27 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(14 * s, -27 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill();

          ctx.beginPath(); ctx.arc(0, -52 * s, 10 * s, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = aw ? this.awakeColor : '#1a1a1a';
          if (aw) { ctx.shadowColor = this.awakeColor; ctx.shadowBlur = 8; }
          ctx.beginPath(); ctx.arc(0, -57 * s, 8.5 * s, Math.PI, 0); ctx.fill(); ctx.shadowBlur = 0;

          const eyeColor = aw ? this.awakeColor : (overrideColor ? '#fff' : '#222');
          ctx.fillStyle = eyeColor;
          if (aw) { ctx.shadowColor = this.awakeColor; ctx.shadowBlur = 6; }
          ctx.fillRect(-6 * s, -55 * s, 3.5 * s, 3.5 * s);
          ctx.fillRect(2.5 * s, -55 * s, 3.5 * s, 3.5 * s);
          ctx.shadowBlur = 0;

          ctx.fillStyle = this.hbColor;
          ctx.fillRect(-10 * s, -60 * s, 20 * s, 5 * s);
          ctx.fillStyle = '#c0c0c0';
          ctx.fillRect(-6 * s, -60 * s, 12 * s, 5 * s);
          ctx.strokeStyle = '#555';
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.moveTo(-2 * s, -58.5 * s);
          ctx.lineTo(2 * s, -58.5 * s);
          ctx.moveTo(0, -60 * s);
          ctx.lineTo(0, -56 * s);
          ctx.stroke();

          if (this.guardBroken) {
            ctx.fillStyle = 'rgba(255,0,0,0.35)';
            ctx.beginPath();
            ctx.arc(0, -52 * s, 13 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      };
    }

    spawnP(x, y, o = {}) {
      this.particles.push({
        x, y,
        vx: (o.vx ?? 0) + (Math.random() - 0.5) * (o.spread ?? 3),
        vy: (o.vy ?? -1.5) + (Math.random() - 0.5) * (o.spread ?? 2),
        life: o.life ?? 28,
        maxLife: o.life ?? 28,
        color: o.color ?? '#fff',
        size: o.size ?? 3,
        g: o.g ?? 0.08,
        smoke: o.smoke ?? false,
        fade: o.fade ?? true,
      });
    }

    spawnSmoke(x, y, n = 14) {
      for (let i = 0; i < n; i++) {
        this.spawnP(x, y, {
          vx: this.rng(-4, 4), vy: this.rng(-5, 1), life: 40, size: this.rng(7, 14), color: 'rgba(210,210,210,0.85)', smoke: true, g: -0.04, spread: 0,
        });
      }
    }

    spawnBurst(x, y, color, n = 10) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + this.rng(0, 0.4);
        this.spawnP(x, y, {
          vx: Math.cos(a) * this.rng(2, 5), vy: Math.sin(a) * this.rng(2, 5) - 1, life: this.rng(15, 25), size: this.rng(2, 5), color, g: 0.04, spread: 0,
        });
      }
    }

    spawnTrail(x, y, color) {
      this.spawnP(x, y, { vx: this.rng(-1, 1), vy: this.rng(-1, 1), life: 14, size: this.rng(3, 7), color, g: -0.01, spread: 0 });
    }

    spawnHeal(x, y) {
      for (let i = 0; i < 8; i++) {
        this.spawnP(x, y - 20, { vx: this.rng(-2, 2), vy: this.rng(-3, -1), life: 35, size: 4, color: '#00ffaa', g: -0.03 });
      }
    }

    spawnLog(x, y) {
      this.logEffects.push({ x, y, timer: 25 });
      for (let i = 0; i < 8; i++) {
        this.spawnP(x, y, {
          vx: this.rng(-4, 4), vy: this.rng(-5, -1), life: 30, size: this.rng(3, 6), color: '#8B6914', g: 0.15, spread: 0,
        });
      }
      this.spawnSmoke(x, y, 8);
    }

    fireJutsu(shooter, target) {
      const dx = target.x - shooter.x;
      const dy = (target.y - 30 * this.SS) - (shooter.y - 30 * this.SS);
      const d = Math.hypot(dx, dy) || 1;
      const spd = 6.5;
      this.projectiles.push({
        x: shooter.x,
        y: shooter.y - 30 * this.SS,
        vx: (dx / d) * spd,
        vy: (dy / d) * spd,
        owner: shooter,
        dmg: 30 + Math.floor(this.rng(5, 25)),
        color: shooter.team === 1 ? '#00d4ff' : '#ff7700',
        glowColor: shooter.team === 1 ? '#00a8cc' : '#cc5500',
        life: 90,
        radius: 8,
      });
      shooter.jutsuFlash = 14;
    }

    triggerHitStop() { this.hitStopLeft = 3; }
    triggerSlowMo() { this.slowMo = true; this.slowMoTimer = 220; }

    updateParticles() {
      this.particles = this.particles.filter((p) => p.life > 0);
      for (const p of this.particles) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.94; p.life--; }
    }

    updateLogs() { this.logEffects = this.logEffects.filter((l) => l.timer-- > 0); }

    updateProjectiles() {
      this.projectiles = this.projectiles.filter((p) => p.life > 0);
      for (const p of this.projectiles) {
        p.x += p.vx; p.y += p.vy; p.life--;
        this.spawnTrail(p.x, p.y, p.color);
        if (p.x < 0 || p.x > this.W || p.y < 0 || p.y > this.H) { p.life = 0; continue; }

        for (const f of this.fighters) {
          if (f === p.owner || f.dead) continue;
          if (this.dist(f.x, f.y - 28 * this.SS, p.x, p.y) < 26) {
            if (f.kawaCD <= 0 && Math.random() < 0.15) {
              f.doKawarimi(p.owner);
            } else {
              f.takeDmg(p.dmg, p.vx > 0 ? 1 : -1, false);
              p.owner.gainChakra(10);
              this.triggerHitStop();
              this.spawnBurst(p.x, p.y, p.color, 14);
            }
            p.life = 0;
            break;
          }
        }
      }
    }

    drawBG() {
      const { ctx, W, H, GROUND } = this;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#010310'); sky.addColorStop(0.55, '#0c0824'); sky.addColorStop(1, '#0a120a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.fillStyle = '#ffffee';
      ctx.shadowColor = '#ffffaa';
      ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.arc(370, 45, 22, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (const s of this.STARS) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#06060e';
      ctx.beginPath();
      ctx.moveTo(0, GROUND - 10);
      for (const [mx, my] of [[50, GROUND - 85], [110, GROUND - 38], [175, GROUND - 108], [255, GROUND - 52], [340, GROUND - 92], [405, GROUND - 48], [460, GROUND - 65]]) {
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(460, GROUND);
      ctx.lineTo(0, GROUND);
      ctx.fill();

      const grd = ctx.createLinearGradient(0, GROUND, 0, H);
      grd.addColorStop(0, '#152008');
      grd.addColorStop(1, '#0a1005');
      ctx.fillStyle = grd;
      ctx.fillRect(0, GROUND, W, H - GROUND);

      ctx.strokeStyle = '#2d5018';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#3a7022';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(60,90,30,0.2)';
      ctx.lineWidth = 0.5;
      for (let tx = 0; tx < W; tx += 30) {
        ctx.beginPath();
        ctx.moveTo(tx, GROUND);
        ctx.lineTo(tx, H);
        ctx.stroke();
      }
    }

    drawParticles() {
      for (const p of this.particles) {
        const a = p.fade ? (p.life / p.maxLife) : 1;
        this.ctx.save();
        this.ctx.globalAlpha = a;
        this.ctx.fillStyle = p.color;
        if (p.smoke) {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife * 0.3), 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.shadowColor = p.color;
          this.ctx.shadowBlur = 4;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }
    }

    drawLogs() {
      for (const l of this.logEffects) {
        const a = l.timer / 25;
        this.ctx.save();
        this.ctx.globalAlpha = a;
        this.ctx.fillStyle = '#7a5c00';
        this.ctx.strokeStyle = '#5a3c00';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.ellipse(l.x, l.y - 20, 7, 18, 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.strokeStyle = '#9a7c20';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.ellipse(l.x, l.y - 20, 4, 6, 0.3, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }
    }

    drawProjectiles() {
      for (const p of this.projectiles) {
        this.ctx.save();
        this.ctx.globalAlpha = Math.min(1, p.life / 15);
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 14;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.radius * 0.35, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.restore();
      }
    }

    drawHUD() {
      const f1 = this.fighters[0];
      const f2 = this.fighters[1];
      const { ctx, W } = this;

      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, 48);
      ctx.strokeStyle = 'rgba(80,80,120,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 48); ctx.lineTo(W, 48); ctx.stroke();

      this.drawBar(8, 7, 170, 11, f1.hp / f1.maxHP, '#ee4433', f1.awakening ? f1.awakeColor : null);
      this.drawBar(8, 22, 170, 7, f1.chakra / f1.maxChakra, '#3377ee', null, true);
      this.drawBar(W - 178, 7, 170, 11, f2.hp / f2.maxHP, '#ee4433', f2.awakening ? f2.awakeColor : null, false, true);
      this.drawBar(W - 178, 22, 170, 7, f2.chakra / f2.maxChakra, '#3377ee', null, true, true);

      ctx.font = 'bold 9px Courier New';
      ctx.fillStyle = f1.awakening ? f1.awakeColor : '#cccccc';
      ctx.textAlign = 'left';
      ctx.fillText(f1.name, 8, 6);
      ctx.fillStyle = f2.awakening ? f2.awakeColor : '#cccccc';
      ctx.textAlign = 'right';
      ctx.fillText(f2.name, W - 8, 6);

      ctx.fillStyle = '#555577';
      ctx.font = 'bold 13px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('VS', W / 2, 20);

      ctx.font = '8px Courier New';
      ctx.fillStyle = '#aaaaaa';
      ctx.textAlign = 'left';
      ctx.fillText(Math.ceil(f1.hp), 8, 20);
      ctx.textAlign = 'right';
      ctx.fillText(Math.ceil(f2.hp), W - 8, 20);

      this.drawStatus(f1, 8, 34, false);
      this.drawStatus(f2, W - 8, 34, true);
    }

    drawBar(x, y, w, h, ratio, color, overrideColor, isChakra = false, flip = false) {
      const { ctx } = this;
      ctx.fillStyle = '#111';
      ctx.fillRect(x, y, w, h);
      const fc = overrideColor || color;
      ctx.fillStyle = fc;
      ctx.shadowColor = fc;
      ctx.shadowBlur = isChakra ? 6 : 3;
      const fw = w * this.clamp(ratio, 0, 1);
      if (flip) ctx.fillRect(x + w - fw, y, fw, h);
      else ctx.fillRect(x, y, fw, h);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x, y, w, h);
    }

    drawStatus(f, x, y, right) {
      const tags = [];
      if (f.awakening) tags.push({ t: '⚡ AWAKENING', c: f.awakeColor });
      if (f.healing) tags.push({ t: '✦ HEALING', c: '#00ffaa' });
      if (f.guardBroken) tags.push({ t: '✗ GUARD BREAK', c: '#ff4444' });
      if (f.shielding) tags.push({ t: '◈ SHIELD', c: '#99aaff' });
      this.ctx.font = '7px Courier New';
      this.ctx.textAlign = right ? 'right' : 'left';
      for (let i = 0; i < tags.length; i++) {
        this.ctx.fillStyle = tags[i].c;
        this.ctx.fillText(tags[i].t, x, y + i * 8);
      }
    }

    drawGameOver() {
      if (!this.gameOver || !this.winner) return;
      const { ctx, W, H } = this;
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(0, 0, W, H);
      const vig = ctx.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, W * 0.75);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      const wc = this.winner.awakeColor;
      ctx.strokeStyle = wc;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, H / 2 - 28 + i * 28);
        ctx.lineTo(W, H / 2 - 28 + i * 28);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.save();
      ctx.textAlign = 'center';
      const textGrad = ctx.createLinearGradient(W / 2 - 80, H / 2, W / 2 + 80, H / 2);
      textGrad.addColorStop(0, wc);
      textGrad.addColorStop(0.5, '#ffffff');
      textGrad.addColorStop(1, wc);
      ctx.fillStyle = textGrad;
      ctx.shadowColor = wc;
      ctx.shadowBlur = 28;
      ctx.font = 'bold 34px Courier New';
      ctx.fillText(this.winner.name, W / 2, H / 2 - 6);

      ctx.shadowBlur = 10;
      ctx.font = '12px Courier New';
      ctx.fillStyle = '#cccccc';
      ctx.fillText('WINS THE BATTLE', W / 2, H / 2 + 18);

      ctx.shadowBlur = 0;
      ctx.font = '8px Courier New';
      ctx.fillStyle = '#445';
      ctx.fillText('[ RESTART TO CONTINUE ]', W / 2, H / 2 + 44);
      ctx.restore();
    }

    render() {
      this.ctx.clearRect(0, 0, this.W, this.H);
      this.drawBG();
      if (this.slowMo) {
        this.ctx.fillStyle = 'rgba(0,5,20,0.12)';
        this.ctx.fillRect(0, 0, this.W, this.H);
      }
      this.drawLogs();
      this.drawParticles();
      this.drawProjectiles();
      const sorted = [...this.fighters].sort((a, b) => a.zIndex - b.zIndex);
      for (const f of sorted) f.draw();
      this.drawHUD();
      if (this.gameOver) this.drawGameOver();
    }

    loop(ts) {
      this.rafId = requestAnimationFrame((nextTs) => this.loop(nextTs));
      const rawDt = Math.min(ts - this.lastTS, 50);
      this.lastTS = ts;
      const dt = this.slowMo ? rawDt * 0.28 : rawDt;
      this.frameCount++;

      if (this.hitStopLeft > 0) {
        this.hitStopLeft--;
        this.render();
        return;
      }

      if (this.slowMo) {
        this.slowMoTimer--;
        if (this.slowMoTimer <= 0) this.slowMo = false;
      }

      if (!this.gameOver) {
        this.fighters[0].update(this.fighters[1], dt);
        this.fighters[1].update(this.fighters[0], dt);
        this.updateProjectiles();
      }

      this.updateParticles();
      this.updateLogs();
      this.render();
    }
  }

  const BattleSystem = {
    host: null,
    root: null,
    engine: null,
    pendingMission: null,
    round: 1,
    roundsWon: 0,
    continueTimer: null,
    callbacks: null,

    mount(mission, onComplete) {
      this.host = document.getElementById('hero-system-host');
      if (!this.host) return;
      const tpl = document.getElementById(TEMPLATE_ID);
      if (!tpl) return;

      this.host.innerHTML = '';
      this.host.appendChild(tpl.content.cloneNode(true));
      this.root = this.host.querySelector('#bs-root');
      const canvas = this.root?.querySelector('#bs-canvas');
      if (!canvas) return;

      this.pendingMission = mission;
      this.callbacks = typeof onComplete === 'function'
        ? { onBattleEnd: onComplete }
        : (onComplete || {});
      this.round = 1;
      this.roundsWon = 0;
      this.clearContinueTimer();
      const playerSprite = window.GameState && typeof window.GameState.getCharacterSprite === 'function'
        ? window.GameState.getCharacterSprite()
        : '';
      const playerName = window.GameState && typeof window.GameState.getCharacterName === 'function'
        ? window.GameState.getCharacterName()
        : 'KAGE';
      const enemySprite = mission?.enemySprite || '';
      const enemyName = mission?.name ? `ENEMIGO ${this.round}` : 'AKUMA';

      this.engine = new ShinobiBattleEngine(canvas, {
        playerSprite,
        enemySprite,
        playerName: (playerName || 'KAGE').toUpperCase(),
        enemyName,
      });
      this.engine.start((winner) => {
        const isWin = winner?.team === 1;
        if (isWin) {
          this.roundsWon += 1;
          if (typeof this.callbacks.onRoundWin === 'function') {
            this.callbacks.onRoundWin({
              round: this.round,
              roundsWon: this.roundsWon,
              mission: this.pendingMission,
              winner,
            });
          }
          this.round += 1;
          this.showRoundBanner(`RONDA ${this.round}`);
          this.clearContinueTimer();
          this.continueTimer = setTimeout(() => {
            if (!this.engine || !this.isMounted()) return;
            this.engine.initGame();
          }, 1300);
        } else if (typeof this.callbacks.onBattleEnd === 'function') {
          this.callbacks.onBattleEnd({
            didWin: false,
            winner,
            mission: this.pendingMission,
            roundsWon: this.roundsWon,
          });
        }
      });
      this.showRoundBanner(`RONDA ${this.round}`);
    },

    isMounted() {
      return Boolean(this.host && this.root && this.host.contains(this.root));
    },

    unmount() {
      this.clearContinueTimer();
      if (this.engine) this.engine.destroy();
      if (this.host) this.host.innerHTML = '';
      this.host = null;
      this.root = null;
      this.engine = null;
      this.pendingMission = null;
      this.round = 1;
      this.roundsWon = 0;
      this.callbacks = null;
    },

    clearContinueTimer() {
      if (this.continueTimer) {
        clearTimeout(this.continueTimer);
        this.continueTimer = null;
      }
    },

    showRoundBanner(text) {
      const banner = this.root?.querySelector('#bs-round-banner');
      if (!banner) return;
      banner.textContent = text;
      banner.classList.add('show');
      setTimeout(() => {
        if (banner.textContent === text) {
          banner.classList.remove('show');
        }
      }, 1100);
    }
  };

  window.BattleSystem = BattleSystem;
})();
