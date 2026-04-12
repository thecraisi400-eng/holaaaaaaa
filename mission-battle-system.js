(function () {
  const BattleSystem = {
    host: null,
    root: null,
    canvas: null,
    ctx: null,
    veil: null,
    winScreen: null,
    winName: null,
    onVictory: null,
    onExit: null,
    rafId: 0,
    lastTs: 0,

    mount(host, options = {}) {
      if (!host) return;
      this.unmount();

      const tpl = document.getElementById('missionBattleTemplate');
      if (!tpl) return;

      this.host = host;
      this.host.innerHTML = '';
      this.host.appendChild(tpl.content.cloneNode(true));

      this.root = this.host.querySelector('#msBattleShell');
      this.canvas = this.host.querySelector('#msBattleCanvas');
      this.ctx = this.canvas?.getContext('2d');
      this.veil = this.host.querySelector('#msBattleVeil');
      this.winScreen = this.host.querySelector('#msBattleWinner');
      this.winName = this.host.querySelector('#msBattleWinName');
      this.onVictory = options.onVictory;
      this.onExit = options.onExit;

      const restartBtn = this.host.querySelector('#msBattleRestart');
      const exitBtn = this.host.querySelector('#msBattleExit');
      if (restartBtn) restartBtn.addEventListener('click', () => this.startGame());
      if (exitBtn) exitBtn.addEventListener('click', () => {
        if (typeof this.onExit === 'function') this.onExit();
      });

      this.engine = this.createEngine();
      this.engine.genBG();
      this.engine.initSprites();
      this.startGame();
      this.rafId = requestAnimationFrame((ts) => {
        this.lastTs = ts;
        this.loop(ts);
      });
    },

    unmount() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      this.lastTs = 0;
      this.engine = null;
      if (this.host) this.host.innerHTML = '';
      this.host = null;
      this.root = null;
      this.canvas = null;
      this.ctx = null;
      this.veil = null;
      this.winScreen = null;
      this.winName = null;
      this.onVictory = null;
      this.onExit = null;
    },

    startGame() {
      if (!this.engine) return;
      this.engine.startGame();
      if (this.winScreen) this.winScreen.style.display = 'none';
    },

    showWinner(name) {
      if (!this.winName || !this.winScreen) return;
      this.winName.textContent = name;
      this.winName.style.color = name === 'SUSUKE' ? '#FFD700' : '#CC88FF';
      this.winScreen.style.display = 'flex';
      if (typeof this.onVictory === 'function') this.onVictory(name);
    },

    loop(ts) {
      if (!this.engine || !this.ctx) return;
      const rawDt = Math.min((ts - this.lastTs) / 16.667, 3);
      this.lastTs = ts;
      const dt = rawDt * this.engine.slowMo * this.engine.TIME_SCALE;
      const dms = rawDt * 16.667 * this.engine.slowMo * this.engine.TIME_SCALE;
      this.engine.update(dt, dms);
      this.engine.render();
      this.rafId = requestAnimationFrame((nextTs) => this.loop(nextTs));
    },

    createEngine() {
      const self = this;
      const TIME_SCALE = 1.0;
      const SPRITE_SCALE = 0.70;
      const DASH_EFFECT_W = 74;
      const DASH_EFFECT_H = 64;
      const PHYSICAL_ATTACK_CHANCE = 0.70;
      const W = 460;
      const H = 360;
      const GROUND = H - 50;
      const G = 0.44 * TIME_SCALE;
      const FRAME_SIZE = 64;
      const NW = Math.round(FRAME_SIZE * SPRITE_SCALE);
      const NH = Math.round(FRAME_SIZE * SPRITE_SCALE);
      const DASH_EW = Math.round(DASH_EFFECT_W * SPRITE_SCALE);
      const DASH_EH = Math.round(DASH_EFFECT_H * SPRITE_SCALE);

      const ctx = this.ctx;
      const veil = this.veil;
      let particles = [];
      let damageNums = [];
      let jutsus = [];
      let fighters = [];
      let hitStop = 0;
      let slowMo = 1;
      let frameN = 0;
      let gameOver = false;
      let shakeX = 0; let shakeY = 0; let shakeDur = 0; let shakeAmp = 0;
      let jutsuVeil = 0;
      const spriteSheets = {};
      let spritesLoaded = false;
      let bgMountains; let bgTrees; let bgStars;

      function loadSpriteSheet(path, callback) {
        const img = new Image();
        img.onload = () => callback(img);
        img.onerror = () => callback(null);
        img.src = path;
      }

      function initSprites() {
        let loaded = 0;
        const total = 2;
        loadSpriteSheet('assets/images/susuke_battle.png', (img) => {
          spriteSheets[0] = img;
          loaded += 1;
          if (loaded === total) spritesLoaded = true;
        });
        loadSpriteSheet('assets/images/kaguya_battle.png', (img) => {
          spriteSheets[1] = img;
          loaded += 1;
          if (loaded === total) spritesLoaded = true;
        });
      }

      class Particle {
        constructor(x, y, vx, vy, color, life, size, type) {
          this.x = x; this.y = y; this.vx = vx; this.vy = vy;
          this.color = color; this.life = life; this.maxLife = life;
          this.size = size; this.type = type;
          this.alpha = 1;
          this.rot = Math.random() * Math.PI * 2;
          this.rotS = (Math.random() - 0.5) * 0.15;
          this.grav = (type === 'spark' || type === 'dust') ? G * 0.45 : 0;
        }

        update(dt) {
          this.x += this.vx * dt; this.y += this.vy * dt;
          this.vy += this.grav * dt;
          if (this.type === 'smoke') { this.vx *= 0.97; this.vy *= 0.97; this.size += 0.35 * dt; }
          if (this.type === 'leaf') {
            this.vx = Math.sin(frameN * 0.025 + this.x * 0.08) * 0.7;
            this.vy += 0.025 * dt;
            this.rot += this.rotS * dt;
          }
          this.life -= dt;
          this.alpha = Math.max(0, this.life / this.maxLife);
        }

        draw() {
          if (this.alpha <= 0 || this.size <= 0) return;
          ctx.save(); ctx.globalAlpha = this.alpha;
          ctx.fillStyle = this.color;
          if (this.type === 'leaf') {
            ctx.translate(this.x, this.y); ctx.rotate(this.rot);
            ctx.fillRect(-this.size, -this.size * 0.4, this.size * 2, this.size * 0.8);
          } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        isDead() { return this.life <= 0 || (this.type === 'smoke' && this.size > 45); }
      }

      class DamageNum {
        constructor(x, y, val, crit) {
          this.x = x; this.y = y; this.val = Math.round(val); this.crit = crit;
          this.vx = (Math.random() - 0.5) * 2.5; this.vy = -4.5;
          this.life = 60; this.maxLife = 60;
        }

        update(dt) { this.x += this.vx * dt; this.vy += 0.18 * dt; this.y += this.vy * dt; this.life -= dt; }
        isDead() { return this.life <= 0; }

        draw() {
          const a = Math.max(0, this.life / this.maxLife);
          const sz = this.crit ? 15 : 11;
          ctx.save(); ctx.globalAlpha = a;
          ctx.font = `bold ${sz}px Arial Black`;
          ctx.textAlign = 'center';
          ctx.strokeStyle = '#000'; ctx.lineWidth = 3.5;
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

      class Jutsu {
        constructor(x, y, vx, vy, owner) {
          this.x = x; this.y = y; this.vx = vx; this.vy = vy;
          this.owner = owner; this.color = owner.glowColor;
          this.size = 9; this.life = 200; this.dead = false;
          this.trail = [];
        }

        update(dt) {
          this.trail.unshift({ x: this.x, y: this.y });
          if (this.trail.length > 12) this.trail.pop();
          this.x += this.vx * dt; this.y += this.vy * dt;
          this.life -= dt;
          if (this.x < -12 || this.x > W + 12 || this.y < -12 || this.y > H + 12 || this.life <= 0) this.dead = true;
          if (Math.random() < 0.35) particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, this.color, 10, 2, 'spark'));
        }

        draw() {
          for (let i = 0; i < this.trail.length; i += 1) {
            const t = this.trail[i];
            const r = this.size * (1 - i / this.trail.length) * 0.9;
            if (r <= 0) continue;
            ctx.save(); ctx.globalAlpha = (1 - i / this.trail.length) * 0.55;
            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(t.x, t.y, r, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
          const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.2);
          g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.35, this.color); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.save(); ctx.globalAlpha = 0.92; ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }

      class Fighter {
        constructor(x, id) {
          this.id = id; this.x = x; this.y = GROUND - NH;
          this.vx = 0; this.vy = 0; this.onGround = true;
          this.facingRight = (id === 0);
          this.name = id === 0 ? 'SUSUKE' : 'KAGUYA';
          this.color = id === 0 ? '#E8A030' : '#6855CC';
          this.glowColor = id === 0 ? '#FF8C00' : '#9932CC';
          this.hp = 100; this.maxHp = 100;
          this.dashTimer = 0; this.dashInterval = 800; this.tX = x; this.tY = GROUND - NH;
          this.atkCD = 0; this.jutsuCD = 0; this.stunTimer = 0;
          this.invincible = false; this.invTimer = 0;
          this.animF = 0; this.animT = 0; this.animState = 'idle'; this.trail = [];
          this.isDead = false; this.deathT = 0; this.deathSmoke = 0;
        }

        get cx() { return this.x + NW / 2; }
        get cy() { return this.y + NH / 2; }

        receiveHit(rawDmg, fromX, attacker) {
          if (this.isDead || this.invincible) return;
          if (Math.random() < 0.15 && this.stunTimer <= 0) { this.doKawarimi(attacker); return; }
          this.hp = Math.max(0, this.hp - rawDmg);
          const isCrit = rawDmg >= 14;
          damageNums.push(new DamageNum(this.cx + (Math.random() - 0.5) * 8, this.y - 5, rawDmg, isCrit));
          const dir = (fromX < this.cx) ? 1 : -1;
          const clr = isCrit ? '#FFD700' : '#FF4422';
          for (let i = 0; i < (isCrit ? 16 : 9); i += 1) {
            const ang = (Math.random() - 0.5) * Math.PI * 0.85 + (dir > 0 ? 0 : Math.PI);
            const spd = 2 + Math.random() * 5;
            particles.push(new Particle(this.cx, this.cy, Math.cos(ang) * spd, Math.sin(ang) * spd - 1, clr, 18 + Math.random() * 10, 2 + Math.random() * 2, 'spark'));
          }
          this.vx += dir * 11;
          triggerShake(isCrit ? 6 : 2, isCrit ? 20 : 9);
          this.stunTimer = 22;
          hitStop = 3;
          if (this.hp <= 0 && !this.isDead) this.die();
        }

        doKawarimi(attacker) {
          const behind = attacker.facingRight ? attacker.x - NW - 28 : attacker.x + NW + 28;
          const nx = Math.max(5, Math.min(W - NW - 5, behind));
          spawnSmoke(this.cx, this.cy, 18);
          this.x = nx; this.y = GROUND - NH; this.vx = 0; this.vy = 0; this.onGround = true;
          this.invincible = true; this.invTimer = 35;
          spawnSmoke(this.cx, this.cy, 12); triggerShake(2, 6);
        }

        launchJutsu(target) {
          if (this.jutsuCD > 0) return;
          this.jutsuCD = 90;
          const dx = target.cx - this.cx; const dy = target.cy - this.cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          const spd = 5;
          jutsus.push(new Jutsu(this.cx, this.cy, (dx / d) * spd, (dy / d) * spd, this));
          spawnSparks(this.cx, this.cy, 14, this.glowColor);
          jutsuVeil = 30;
          if (veil) veil.style.background = 'rgba(0,0,0,0.22)';
          triggerShake(6, 14);
        }

        die() {
          this.isDead = true; slowMo = 0.16; gameOver = true;
          const winner = fighters.find((f) => !f.isDead);
          setTimeout(() => self.showWinner(winner ? winner.name : '???'), 2600);
        }

        update(dt, dms, enemy) {
          if (this.isDead) {
            this.deathT += dt;
            this.deathSmoke = Math.min(1, this.deathT * 0.09);
            if (this.deathT % 6 < 1) spawnSmoke(this.cx + (Math.random() - 0.5) * NW, this.cy + (Math.random() - 0.5) * NH, 3);
            return;
          }
          if (hitStop > 0) return;
          if (this.stunTimer > 0) this.stunTimer -= dt;
          if (this.atkCD > 0) this.atkCD -= dt;
          if (this.jutsuCD > 0) this.jutsuCD -= dt;
          if (this.invTimer > 0) { this.invTimer -= dt; if (this.invTimer <= 0) this.invincible = false; }
          if (!this.onGround) this.vy += G * dt;
          this.x += this.vx * dt; this.y += this.vy * dt;
          this.vx *= 0.87;
          if (this.y >= GROUND - NH) { this.y = GROUND - NH; this.vy = 0; this.onGround = true; } else this.onGround = false;
          if (this.y < 4) { this.y = 4; this.vy = 0; }
          if (this.x <= 3) { this.x = 3; this.vx = 4.5; if (this.onGround) { this.vy = -9; this.onGround = false; } }
          if (this.x >= W - NW - 3) { this.x = W - NW - 3; this.vx = -4.5; if (this.onGround) { this.vy = -9; this.onGround = false; } }
          this.facingRight = enemy.cx > this.cx;
          if (this.stunTimer > 0) return;

          this.dashTimer += dms;
          if (this.dashTimer >= this.dashInterval) {
            this.dashTimer = 0;
            const aerial = Math.random() < 0.38;
            this.tX = 22 + Math.random() * (W - 44 - NW);
            this.tY = aerial ? GROUND - NH - 55 - Math.random() * 130 : GROUND - NH;
          }

          const tdx = this.tX - this.x; const tdy = this.tY - this.y;
          const tLen = Math.sqrt(tdx * tdx + tdy * tdy);
          if (tLen > 8) {
            this.vx += (tdx / tLen) * 5 * 0.26;
            if (tdy < -22 && this.onGround) { this.vy = -11; this.onGround = false; }
          }

          this.animT += dt;
          const moving = Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5;
          if (this.animT > 3) {
            this.animT = 0;
            this.animF = (this.animF + 1) % 4;
            this.animState = moving ? 'walk' : 'idle';
            if (moving && (Math.abs(this.vx) + Math.abs(this.vy)) > 3.5) {
              this.trail.unshift({ x: this.cx, y: this.cy, a: 0.6 });
              if (this.trail.length > 4) this.trail.pop();
            }
          }
          for (const t of this.trail) t.a -= 0.05 * dt;
          this.trail = this.trail.filter((t) => t.a > 0);

          if (!enemy.isDead) {
            const dist = Math.hypot(this.cx - enemy.cx, this.cy - enemy.cy);
            if (dist < 55 && this.atkCD <= 0) {
              if (Math.random() < PHYSICAL_ATTACK_CHANCE) {
                const dmg = 8 + Math.random() * 7;
                enemy.receiveHit(dmg, this.cx, this);
                this.atkCD = 42;
                this.animState = 'attack'; this.animF = 0; this.animT = 0;
              } else if (this.jutsuCD <= 0) this.launchJutsu(enemy);
            } else if (dist > 140 && this.jutsuCD <= 0 && Math.random() < 0.35) this.launchJutsu(enemy);
          }
        }

        draw() {
          const deadAlpha = this.isDead ? Math.max(0, 1 - this.deathSmoke) : 1;
          if (deadAlpha <= 0) return;
          ctx.save(); ctx.globalAlpha = deadAlpha;
          if (!this.facingRight) {
            ctx.translate(this.x + NW / 2, 0); ctx.scale(-1, 1); ctx.translate(-(this.x + NW / 2), 0);
          }
          const x = this.x; const y = this.y;
          const sAlpha = Math.max(0, 0.4 - (GROUND - NH - this.y) * 0.006);
          ctx.globalAlpha = deadAlpha * sAlpha;
          ctx.fillStyle = 'rgba(0,0,0,.5)';
          ctx.beginPath(); ctx.ellipse(x + NW / 2, GROUND - 1, NW * 0.7, 4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = deadAlpha;
          if (spritesLoaded && spriteSheets[this.id]) this.drawSpriteSheet(x, y); else this.drawFallback(x, y);
          this.drawInternalDashEffect(x, y);
          ctx.restore();
          this.drawHPBar(deadAlpha);
        }

        drawSpriteSheet(x, y) {
          const img = spriteSheets[this.id];
          if (!img) return;
          const stateMap = { idle: 0, walk: 1, attack: 2, hurt: 3 };
          const row = stateMap[this.animState] || 0;
          const col = this.animF % 4;
          const sx = col * FRAME_SIZE;
          const sy = row * FRAME_SIZE;
          ctx.drawImage(img, sx, sy, FRAME_SIZE, FRAME_SIZE, x, y, NW, NH);
        }

        drawFallback(x, y) {
          ctx.fillStyle = this.color;
          ctx.fillRect(x + 2, y + NH * 0.30, NW - 4, NH * 0.68);
          ctx.fillStyle = this.id === 0 ? '#FFD020' : '#111118';
          ctx.beginPath(); ctx.arc(x + NW / 2, y + NH * 0.155, NW * 0.40, 0, Math.PI * 2); ctx.fill();
        }

        drawInternalDashEffect(x, y) {
          for (const t of this.trail) {
            if (t.a <= 0) continue;
            ctx.save(); ctx.globalAlpha = t.a * 0.5;
            const g = ctx.createRadialGradient(x + NW / 2, y + NH / 2, 0, x + NW / 2, y + NH / 2, Math.max(DASH_EW, DASH_EH) * 0.6);
            g.addColorStop(0, this.glowColor); g.addColorStop(0.5, `${this.glowColor}88`); g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.ellipse(x + NW / 2, y + NH / 2, DASH_EW * 0.5, DASH_EH * 0.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
        }

        drawHPBar(alpha = 1) {
          const bW = 30; const bH = 4;
          const bx = this.x + NW / 2 - bW / 2;
          const by = this.y - 12;
          ctx.save(); ctx.globalAlpha = alpha;
          ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(bx - 1, by - 1, bW + 2, bH + 2);
          const r = this.hp / this.maxHp;
          ctx.fillStyle = r > 0.5 ? '#44EE44' : r > 0.25 ? '#FFAA00' : '#FF2222';
          ctx.fillRect(bx, by, bW * r, bH);
          ctx.font = 'bold 7px Arial';
          ctx.textAlign = 'center';
          ctx.fillStyle = this.isDead ? '#666' : (this.id === 0 ? '#FFD700' : '#AA88FF');
          ctx.fillText(this.name, this.x + NW / 2, by - 3);
          ctx.restore();
        }
      }

      function triggerShake(amp, dur) { shakeAmp = Math.max(shakeAmp, amp); shakeDur = Math.max(shakeDur, dur); }
      function spawnSparks(x, y, n, color) {
        for (let i = 0; i < n; i += 1) {
          const a = Math.random() * Math.PI * 2; const spd = 1.5 + Math.random() * 3.5;
          particles.push(new Particle(x, y, Math.cos(a) * spd, Math.sin(a) * spd, color, 18 + Math.random() * 10, 2 + Math.random() * 1.5, 'spark'));
        }
      }

      function spawnSmoke(x, y, count) {
        const layers = [['#FFFFFF', 0.8], ['#BBBBBB', 0.5], ['#777777', 0.35]];
        for (let i = 0; i < count; i += 1) {
          const [col, spd] = layers[i % 3];
          particles.push(new Particle(
            x + (Math.random() - 0.5) * NW,
            y + (Math.random() - 0.5) * NH,
            (Math.random() - 0.5) * spd * 2,
            -spd - 0.5 - Math.random(),
            col,
            32 + Math.random() * 20,
            4 + Math.random() * 4 + (i % 3) * 1.5,
            'smoke'
          ));
        }
      }

      function genBG() {
        bgMountains = [];
        for (let x = 0; x <= W; x += 18) bgMountains.push({ x, y: 95 + Math.sin(x * 0.018) * 65 + Math.sin(x * 0.055) * 28 + Math.cos(x * 0.03 + 1.2) * 20 });
        bgTrees = [];
        for (let i = 0; i < 14; i += 1) bgTrees.push({ x: 15 + Math.random() * (W - 30), y: GROUND - 35 - Math.random() * 55, h: 38 + Math.random() * 55, w: 10 + Math.random() * 14 });
        bgStars = [];
        for (let i = 0; i < 50; i += 1) bgStars.push({ x: (i * 97 + 13) % W, y: (i * 53 + 7) % (H * 0.52), s: (Math.random() < 0.1) ? 1.5 : 1, ph: Math.random() * Math.PI * 2 });
      }

      function drawBG(parallaxX) {
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#060412'); sky.addColorStop(0.5, '#150A30'); sky.addColorStop(1, '#200C08');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

        for (const st of bgStars) {
          const f = 0.5 + 0.5 * Math.sin(frameN * 0.04 + st.ph);
          ctx.globalAlpha = f * 0.75; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(st.x, st.y, st.s, st.s);
        }
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.shadowColor = '#FFFFDD'; ctx.shadowBlur = 18; ctx.fillStyle = '#FFFEE8';
        ctx.beginPath(); ctx.arc(375, 38, 20, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,.09)';
        ctx.beginPath(); ctx.arc(370, 34, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(382, 44, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();

        ctx.fillStyle = '#12091E'; ctx.beginPath(); ctx.moveTo(0, H);
        for (const p of bgMountains) ctx.lineTo(p.x, p.y);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#1A0E2A'; ctx.beginPath(); ctx.moveTo(0, H);
        for (const p of bgMountains) ctx.lineTo(p.x + 25, p.y + 38);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

        ctx.save(); ctx.translate(-parallaxX, 0);
        for (const t of bgTrees) {
          ctx.fillStyle = '#120C1C'; ctx.fillRect(t.x - 2.5, t.y + t.h * 0.12, 5, t.h * 0.35);
          ctx.fillStyle = '#0C1614';
          ctx.beginPath(); ctx.arc(t.x, t.y, t.w / 2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(t.x - t.w * 0.3, t.y + t.h * 0.12, t.w * 0.4, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(t.x + t.w * 0.3, t.y + t.h * 0.12, t.w * 0.4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

        const grd = ctx.createLinearGradient(0, GROUND, 0, H);
        grd.addColorStop(0, '#253A15'); grd.addColorStop(0.12, '#182810'); grd.addColorStop(1, '#0A1408');
        ctx.fillStyle = grd; ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.fillStyle = '#3A6022'; ctx.fillRect(0, GROUND, W, 3);
      }

      function checkJutsuClash() {
        for (let i = 0; i < jutsus.length; i += 1) {
          for (let j = i + 1; j < jutsus.length; j += 1) {
            const a = jutsus[i]; const b = jutsus[j];
            if (a.owner === b.owner || a.dead || b.dead) continue;
            if (Math.hypot(a.x - b.x, a.y - b.y) < a.size + b.size + 6) {
              const ex = (a.x + b.x) / 2; const ey = (a.y + b.y) / 2;
              for (let k = 0; k < 22; k += 1) {
                const ang = Math.random() * Math.PI * 2; const spd = 3 + Math.random() * 5;
                particles.push(new Particle(ex, ey, Math.cos(ang) * spd, Math.sin(ang) * spd - 1, '#FFFFFF', 22, 3, 'spark'));
                particles.push(new Particle(ex, ey, Math.cos(ang) * spd * 0.5, Math.sin(ang) * spd * 0.5, '#FFD700', 32, 2.5, 'spark'));
              }
              triggerShake(6, 18); a.dead = true; b.dead = true;
              for (const f of fighters) f.vx += (f.cx > ex ? 4.5 : -4.5);
            }
          }
        }
      }

      function update(dt, dms) {
        frameN += 1;
        if (frameN % 50 === 0) particles.push(new Particle(Math.random() * W, -5, 0, 0.4 + Math.random() * 0.6, Math.random() < 0.5 ? '#2A4A1A' : '#386020', 180 + Math.random() * 100, 2 + Math.random() * 1.5, 'leaf'));
        if (jutsuVeil > 0) { jutsuVeil -= dt; if (jutsuVeil <= 0) { jutsuVeil = 0; if (veil) veil.style.background = 'rgba(0,0,0,0)'; } }

        if (hitStop > 0) {
          hitStop -= dt;
          particles.forEach((p) => p.update(dt)); particles = particles.filter((p) => !p.isDead());
          damageNums.forEach((d) => d.update(dt)); damageNums = damageNums.filter((d) => !d.isDead());
          return;
        }

        if (shakeDur > 0) {
          shakeDur -= dt;
          const f = shakeDur / 10;
          shakeX = (Math.random() - 0.5) * shakeAmp * f;
          shakeY = (Math.random() - 0.5) * shakeAmp * f;
          if (shakeDur <= 0) { shakeX = 0; shakeY = 0; shakeAmp = 0; }
        }

        const [f0, f1] = fighters;
        f0.update(dt, dms, f1); f1.update(dt, dms, f0);
        for (const j of jutsus) j.update(dt);

        for (const j of jutsus) {
          if (j.dead) continue;
          for (const f of fighters) {
            if (f === j.owner || f.isDead || f.invincible) continue;
            if (Math.hypot(j.x - f.cx, j.y - f.cy) < j.size + NW / 2) {
              const dmg = 10 + Math.random() * 10;
              f.receiveHit(dmg, j.x, j.owner);
              for (let i = 0; i < 16; i += 1) {
                const ang = Math.random() * Math.PI * 2; const spd = 2 + Math.random() * 4;
                particles.push(new Particle(j.x, j.y, Math.cos(ang) * spd, Math.sin(ang) * spd, j.color, 20, 3, 'spark'));
              }
              j.dead = true;
            }
          }
        }

        checkJutsuClash();
        jutsus = jutsus.filter((j) => !j.dead);
        particles.forEach((p) => p.update(dt)); particles = particles.filter((p) => !p.isDead());
        damageNums.forEach((d) => d.update(dt)); damageNums = damageNums.filter((d) => !d.isDead());
      }

      function render() {
        ctx.save(); ctx.translate(shakeX, shakeY);
        const avgX = fighters.reduce((s, f) => s + f.cx, 0) / fighters.length;
        const parallaxX = (avgX - W / 2) * 0.10;
        drawBG(parallaxX);
        for (const j of jutsus) j.draw();
        for (const f of fighters) f.draw();
        for (const p of particles) p.draw();
        for (const d of damageNums) d.draw();
        if (gameOver && slowMo < 1) {
          ctx.save(); ctx.fillStyle = 'rgba(255,220,0,.22)'; ctx.font = 'bold 14px Arial Black'; ctx.textAlign = 'center'; ctx.fillText('K.O.', W / 2, 28); ctx.restore();
        }
        ctx.restore();
      }

      function startGame() {
        particles = []; damageNums = []; jutsus = [];
        hitStop = 0; slowMo = 1; frameN = 0; gameOver = false;
        shakeX = 0; shakeY = 0; shakeDur = 0; shakeAmp = 0;
        jutsuVeil = 0; if (veil) veil.style.background = 'rgba(0,0,0,0)';
        fighters = [new Fighter(70, 0), new Fighter(360, 1)];
        fighters[0].tX = 120 + Math.random() * 80;
        fighters[1].tX = 250 + Math.random() * 80;
      }

      return {
        TIME_SCALE,
        get slowMo() { return slowMo; },
        initSprites,
        genBG,
        update,
        render,
        startGame
      };
    }
  };

  window.MissionBattleSystem = BattleSystem;
})();
