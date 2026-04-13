(function () {
  const PLAYER_BATTLE_SPRITES = {
    asura: 'assets/images/asura_battle.png',
    hagoromo: 'assets/images/hagoromo_battle.png',
    hashirama: 'assets/images/hashirama_battle.png',
    indra: 'assets/images/indra_battle.png',
    itachi: 'assets/images/itachi_battle.png',
    itama: 'assets/images/itama_battle.png',
    kaguya: 'assets/images/kaguya_battle.png',
    karin: 'assets/images/karin_battle.png',
    kushina: 'assets/images/kushina_battle.png',
    madara: 'assets/images/madara_battle.png',
    nagato: 'assets/images/nagato_battle.png',
    naruto: 'assets/images/naruto_battle.png',
    obito: 'assets/images/obito_battle.png',
    sasuke: 'assets/images/susuke_battle.png',
    tobirama: 'assets/images/tobirama_battle.png',
    tsunade: 'assets/images/tsunade_battle.png'
  };

  const ENEMY_MISSION_SPRITES = {
    0: 'assets/images/enemies/rank-d/mission-1.png',
    1: 'assets/images/enemies/rank-d/mission-2.png',
    2: 'assets/images/enemies/rank-d/mission-3.png',
    3: 'assets/images/enemies/rank-d/mission-4.png',
    4: 'assets/images/enemies/rank-d/mission-5.png',
    5: 'assets/images/enemies/rank-d/mission-6.png'
  };

  const PLAYER_GLOW_COLORS = {
    asura: '#FFFFFF',
    hagoromo: '#FFFFFF',
    hashirama: '#FACC15',
    indra: '#A855F7',
    itachi: '#EF4444',
    itama: '#2DD4BF',
    kaguya: '#FFFFFF',
    karin: '#F97316',
    kushina: '#EF4444',
    madara: '#EF4444',
    nagato: '#A855F7',
    naruto: '#F97316',
    obito: '#A855F7',
    sasuke: '#A855F7',
    tobirama: '#3B82F6',
    tsunade: '#22C55E'
  };

  const ENEMY_GLOW_COLORS = {
    0: '#22C55E',
    1: '#3B82F6',
    2: '#92400E',
    3: '#92400E',
    4: '#22C55E',
    5: '#111111'
  };


  const SKILL_ORB_COLORS = {
    'Llama Voraz': '#FF0000',
    'Rayo Destellante': '#FFFF00',
    'Ráfaga Cortante': '#FFFFFF',
    'Prisión Hidráulica': '#0000FF',
    'Escudo Telúrico': '#FF8C00',
    'Sello Prohibido': '#8000FF',
    'Espejismo Mental': '#8B4513',
    'Bosque Viviente': '#00AA00',
    'Impacto Brutal': '#000000',
    'Aliento Vital': '#00AA00'
  };

  const BattleSystem = {
    host: null,
    root: null,
    canvas: null,
    ctx: null,
    veil: null,
    jutsuAnnouncement: null,
    winScreen: null,
    winName: null,
    roundBanner: null,
    roundBannerTimer: 0,
    jutsuAnnouncementTimer: 0,
    onVictory: null,
    onRoundComplete: null,
    onDefeat: null,
    onExit: null,
    rafId: 0,
    lastTs: 0,
    options: {},

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
      this.jutsuAnnouncement = this.host.querySelector('#msBattleJutsuAnnouncement');
      this.winScreen = this.host.querySelector('#msBattleWinner');
      this.winName = this.host.querySelector('#msBattleWinName');
      this.roundBanner = this.host.querySelector('#msBattleRoundBanner');
      this.onVictory = options.onVictory;
      this.onRoundComplete = options.onRoundComplete;
      this.onDefeat = options.onDefeat;
      this.onExit = options.onExit;
      this.options = options;

      const restartBtn = this.host.querySelector('#msBattleRestart');
      const exitBtn = this.host.querySelector('#msBattleExit');
      if (restartBtn) restartBtn.addEventListener('click', () => this.startGame());
      if (exitBtn) exitBtn.addEventListener('click', () => {
        if (typeof this.onExit === 'function') this.onExit();
      });

      this.engine = this.createEngine(options);
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
      clearTimeout(this.roundBannerTimer);
      this.roundBannerTimer = 0;
      clearTimeout(this.jutsuAnnouncementTimer);
      this.jutsuAnnouncementTimer = 0;
      if (this.host) this.host.innerHTML = '';
      this.host = null;
      this.root = null;
      this.canvas = null;
      this.ctx = null;
      this.veil = null;
      this.jutsuAnnouncement = null;
      this.winScreen = null;
      this.winName = null;
      this.roundBanner = null;
      this.onVictory = null;
      this.onRoundComplete = null;
      this.onDefeat = null;
      this.onExit = null;
      this.options = {};
    },

    startGame() {
      if (!this.engine) return;
      this.engine.startGame();
      if (this.winScreen) this.winScreen.style.display = 'none';
      if (this.roundBanner) this.roundBanner.style.display = 'none';
    },

    showRoundBanner() {
      if (!this.roundBanner) return;
      this.roundBanner.style.display = 'block';
      clearTimeout(this.roundBannerTimer);
      this.roundBannerTimer = setTimeout(() => {
        if (this.roundBanner) this.roundBanner.style.display = 'none';
      }, 1500);
    },

    showJutsuAnnouncement(name) {
      if (!this.jutsuAnnouncement) return;
      this.jutsuAnnouncement.textContent = name;
      this.jutsuAnnouncement.classList.remove('show');
      clearTimeout(this.jutsuAnnouncementTimer);
      window.requestAnimationFrame(() => this.jutsuAnnouncement.classList.add('show'));
      this.jutsuAnnouncementTimer = setTimeout(() => this.hideJutsuAnnouncement(), 1200);
    },

    hideJutsuAnnouncement() {
      if (!this.jutsuAnnouncement) return;
      this.jutsuAnnouncement.classList.remove('show');
      this.jutsuAnnouncement.textContent = '';
    },

    showWinner(name, winnerId) {
      if (!this.winName || !this.winScreen) return;
      this.winName.textContent = name;
      this.winName.style.color = winnerId === 0 ? '#FFD700' : '#CC88FF';
      this.winScreen.style.display = 'flex';
      if (typeof this.onVictory === 'function') this.onVictory({ name, winnerId });
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

    createEngine(options = {}) {
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

      const hero = options.heroSnapshot || window.CharacterStatsSystem?.getActiveHero?.() || null;
      const equippedJutsus = window.JutsuSystem?.getEquippedJutsusBattleData?.() || [];
      const mission = options.mission || {};
      const missionIndex = Number(options.missionIndex || 0);
      const playerCharacterId = hero?.characterId || 'naruto';
      const playerName = hero?.name || playerCharacterId.toUpperCase();

      const playerStats = {
        hp: Math.max(1, Math.round(hero?.stats?.HP || 100)),
        atk: Math.max(1, Number(hero?.stats?.ATK || 10)),
        def: Math.max(0, Number(hero?.stats?.DEF || 0))
      };

      const enemyStats = {
        hp: Math.max(1, Math.round(options.enemyStats?.hp || mission.hp || 120)),
        atk: Math.max(1, Number(options.enemyStats?.atk || mission.atk || 20)),
        def: Math.max(0, Number(options.enemyStats?.def || mission.def || 10))
      };

      const playerSprite = PLAYER_BATTLE_SPRITES[playerCharacterId] || PLAYER_BATTLE_SPRITES.naruto;
      const enemySprite = ENEMY_MISSION_SPRITES[missionIndex] || ENEMY_MISSION_SPRITES[0];
      const playerGlowColor = PLAYER_GLOW_COLORS[playerCharacterId] || '#FF8C00';
      const enemyGlowColor = ENEMY_GLOW_COLORS[missionIndex] || '#9932CC';

      const playerFighterCfg = {
        id: 0,
        x: 70,
        name: playerName.toUpperCase(),
        color: '#E8A030',
        glowColor: playerGlowColor,
        stats: playerStats,
        spritePath: playerSprite,
        isPlayer: true
      };

      const enemyFighterCfg = {
        id: 1,
        x: 360,
        name: `ENEMIGO M-${missionIndex + 1}`,
        color: '#6855CC',
        glowColor: enemyGlowColor,
        stats: enemyStats,
        spritePath: enemySprite,
        isPlayer: false
      };

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
      let autoJutsuTimer = 0;
      let currentSlowOrb = null;
      const spriteSheets = {};
      let spritesLoaded = false;
      let roundResolved = false;
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
        loadSpriteSheet(playerFighterCfg.spritePath, (img) => {
          spriteSheets[0] = img;
          loaded += 1;
          if (loaded === total) spritesLoaded = true;
        });
        loadSpriteSheet(enemyFighterCfg.spritePath, (img) => {
          spriteSheets[1] = img;
          loaded += 1;
          if (loaded === total) spritesLoaded = true;
        });
      }

      function syncMainHp(nextHp) {
        if (window.GameState && typeof window.GameState.setHp === 'function') {
          window.GameState.setHp(nextHp);
        }
      }
      function emitBattleSync(type, detail = {}) {
        window.dispatchEvent(new CustomEvent('ngs:battle-sync', { detail: { type, ...detail } }));
      }

      function finalizeRound(winner) {
        if (roundResolved) return;
        roundResolved = true;
        if (winner?.id === 0) {
          if (typeof self.onRoundComplete === 'function') self.onRoundComplete();
          if (typeof self.onVictory === 'function') self.onVictory({ name: winner.name, winnerId: winner.id });
          self.showRoundBanner();
          setTimeout(() => {
            if (!self.engine) return;
            startGame();
          }, 1500);
          return;
        }

        if (typeof self.onDefeat === 'function') self.onDefeat({ name: winner?.name || 'ENEMIGO', winnerId: winner?.id ?? -1 });
      }

      function calcDamage(baseAttack, targetDefense, varianceMin, varianceMax) {
        const raw = baseAttack * (varianceMin + Math.random() * (varianceMax - varianceMin));
        const reduced = raw - (targetDefense * 0.35);
        return Math.max(1, Math.round(reduced));
      }
      function clampTimer(current, durationMs) {
        return Math.max(current || 0, durationMs);
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

      class BattleSkillOrb {
        constructor(owner, target, skillData) {
          this.owner = owner;
          this.target = target;
          this.skillData = skillData;
          this.color = SKILL_ORB_COLORS[skillData?.name] || owner.glowColor;
          this.x = owner.cx;
          this.y = owner.cy;
          this.size = 40;
          this.dead = false;
          const dx = target.cx - owner.cx;
          const dy = target.cy - owner.cy;
          const distance = Math.max(1, Math.hypot(dx, dy));
          this.maxSpeed = 7;
          this.homingStrength = 0.22;
          this.vx = (dx / distance) * this.maxSpeed;
          this.vy = (dy / distance) * this.maxSpeed;
          this.trail = [];
        }

        update(dt) {
          if (this.target.isDead) {
            this.dead = true;
            return;
          }
          this.trail.unshift({ x: this.x, y: this.y });
          if (this.trail.length > 12) this.trail.pop();
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
          if (Math.random() < 0.35) {
            particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, this.color, 11, 2.2, 'spark'));
          }
        }

        draw() {
          for (let i = 0; i < this.trail.length; i += 1) {
            const t = this.trail[i];
            const alpha = (1 - i / this.trail.length) * 0.30;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.size * (1 - i / (this.trail.length * 1.5)), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
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
      }

      class Fighter {
        constructor(cfg) {
          this.id = cfg.id;
          this.x = cfg.x;
          this.y = GROUND - NH;
          this.vx = 0; this.vy = 0; this.onGround = true;
          this.facingRight = (cfg.id === 0);
          this.name = cfg.name;
          this.color = cfg.color;
          this.glowColor = cfg.glowColor;
          this.baseAtk = cfg.stats.atk;
          this.baseDef = cfg.stats.def;
          this.hp = cfg.stats.hp;
          this.maxHp = cfg.stats.hp;
          this.isPlayer = cfg.isPlayer;
          this.dashTimer = 0; this.dashInterval = 800; this.tX = cfg.x; this.tY = GROUND - NH;
          this.atkCD = 0; this.jutsuCD = 0; this.stunTimer = 0;
          this.invincible = false; this.invTimer = 0;
          this.animF = 0; this.animT = 0; this.animState = 'idle'; this.trail = [];
          this.isDead = false; this.deathT = 0; this.deathSmoke = 0;
          this.statuses = { blind: 0, paralysis: 0, bleeding: 0, asphyxia: 0, heavy: 0, silence: 0, confusion: 0, drainedEnergy: 0, deafness: 0 };
          this.buffs = {
            atkBoost: 0, evadeBoost: 0, atkSpeedBoost: 0, cdReductionTurns: 0, invulnerable: 0, chakraRegen: 0, defBoost: 0, hpRegen: 0, nextCrit: false, debuffImmunity: 0
          };
          this.dotTick = 0;
          this.buffTick = 0;
          this.externalFreeze = false;
        }

        get cx() { return this.x + NW / 2; }
        get cy() { return this.y + NH / 2; }

        receiveHit(rawDmg, fromX, attacker) {
          if (this.isDead || this.invincible) return;
          if (this.buffs.evadeBoost > 0 && Math.random() < 0.15) return;
          if (this.buffs.invulnerable > 0) rawDmg = 0;
          if (Math.random() < 0.15 && this.stunTimer <= 0) { this.doKawarimi(attacker); return; }
          this.hp = Math.max(0, this.hp - rawDmg);
          if (this.isPlayer) syncMainHp(this.hp);
          emitBattleSync('damage', {
            targetId: this.id,
            targetName: this.name,
            hp: this.hp,
            maxHp: this.maxHp,
            damage: rawDmg,
            fromX
          });
          const isCrit = rawDmg >= Math.max(14, this.maxHp * 0.12);
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

        getDefenseValue() {
          const defBoost = this.buffs.defBoost > 0 ? 1.5 : 1;
          const deafnessDebuff = this.statuses.deafness > 0 ? 0.8 : 1;
          return this.baseDef * defBoost * deafnessDebuff;
        }

        getAttackValue() {
          return this.baseAtk * (this.buffs.atkBoost > 0 ? 1.1 : 1);
        }

        applyStatus(name, durationMs) {
          if (this.buffs.debuffImmunity > 0) return;
          this.statuses[name] = clampTimer(this.statuses[name], durationMs);
        }

        applySkillEffects(skillData, target) {
          const sec = 1000;
          switch (skillData.name) {
            case 'Llama Voraz':
              target.applyStatus('blind', 4 * sec); this.buffs.atkBoost = clampTimer(this.buffs.atkBoost, 5 * sec); break;
            case 'Rayo Destellante':
              target.applyStatus('paralysis', 4 * sec); this.buffs.evadeBoost = clampTimer(this.buffs.evadeBoost, 5 * sec); break;
            case 'Ráfaga Cortante':
              target.applyStatus('bleeding', 4 * sec); this.buffs.atkSpeedBoost = clampTimer(this.buffs.atkSpeedBoost, 5 * sec); break;
            case 'Prisión Hidráulica':
              target.applyStatus('asphyxia', 4 * sec); this.buffs.cdReductionTurns = Math.max(this.buffs.cdReductionTurns, 1); break;
            case 'Escudo Telúrico':
              target.applyStatus('heavy', 4 * sec); this.buffs.invulnerable = clampTimer(this.buffs.invulnerable, 5 * sec); break;
            case 'Sello Prohibido':
              target.applyStatus('silence', 4 * sec); this.buffs.chakraRegen = clampTimer(this.buffs.chakraRegen, 5 * sec); break;
            case 'Espejismo Mental':
              target.applyStatus('confusion', 3 * sec); this.buffs.defBoost = clampTimer(this.buffs.defBoost, 5 * sec); break;
            case 'Bosque Viviente':
              target.applyStatus('drainedEnergy', 4 * sec); this.buffs.hpRegen = clampTimer(this.buffs.hpRegen, 5 * sec); break;
            case 'Impacto Brutal':
              target.stunTimer = Math.max(target.stunTimer, 4 * 60); this.buffs.nextCrit = true; break;
            case 'Aliento Vital':
              target.applyStatus('deafness', 4 * sec); this.buffs.debuffImmunity = clampTimer(this.buffs.debuffImmunity, 5 * sec); break;
            default:
              break;
          }
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
          if (this.jutsuCD > 0 || this.statuses.silence > 0) return;
          if (this.statuses.blind > 0 && Math.random() < 0.30) {
            this.jutsuCD = 20;
            return;
          }
          this.jutsuCD = this.buffs.cdReductionTurns > 0 ? 58 : 90;
          if (this.buffs.cdReductionTurns > 0) this.buffs.cdReductionTurns -= 1;
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
          setTimeout(() => finalizeRound(winner), 900);
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
          const speedScale = this.statuses.paralysis > 0 ? 0.2 : 1;
          if (!this.onGround) this.vy += G * dt;
          this.x += this.vx * dt * speedScale; this.y += this.vy * dt * speedScale;
          emitBattleSync('fighter-update', {
            fighterId: this.id,
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            stunTimer: this.stunTimer,
            atkCD: this.atkCD,
            jutsuCD: this.jutsuCD,
            invTimer: this.invTimer
          });
          this.vx *= 0.87;
          if (this.y >= GROUND - NH) { this.y = GROUND - NH; this.vy = 0; this.onGround = true; } else this.onGround = false;
          if (this.y < 4) { this.y = 4; this.vy = 0; }
          if (this.x <= 3) { this.x = 3; this.vx = 4.5; if (this.onGround) { this.vy = -9; this.onGround = false; } }
          if (this.x >= W - NW - 3) { this.x = W - NW - 3; this.vx = -4.5; if (this.onGround) { this.vy = -9; this.onGround = false; } }
          this.facingRight = enemy.cx > this.cx;
          if (this.externalFreeze) {
            this.vx = 0;
            this.vy = 0;
            this.tX = this.x;
            this.tY = this.y;
            this.animState = 'idle';
            this.animF = 0;
            return;
          }
          if (this.stunTimer > 0) return;
          this.dotTick += dms;
          this.buffTick += dms;
          if (this.dotTick >= 1000) {
            this.dotTick = 0;
            if (this.statuses.bleeding > 0) this.receiveHit(Math.max(1, Math.round(this.maxHp * 0.05)), this.cx, this);
            if (this.statuses.asphyxia > 0) this.receiveHit(Math.max(1, Math.round(this.maxHp * 0.04)), this.cx, this);
            if (this.statuses.drainedEnergy > 0) this.receiveHit(Math.max(1, Math.round(this.maxHp * 0.05)), this.cx, this);
            if (this.statuses.confusion > 0) this.receiveHit(Math.max(1, Math.round(this.maxHp * 0.03)), this.cx, this);
            if (this.buffs.hpRegen > 0) this.hp = Math.min(this.maxHp, this.hp + Math.round(this.maxHp * 0.07));
            if (this.buffs.chakraRegen > 0 && this.isPlayer) window.GameState?.setMp?.((window.GameState.getMp?.() || 0) + Math.round((window.GameState.getHeroSnapshot?.()?.stats?.MP || 100) * 0.05));
          }
          if (this.buffTick >= 100) {
            this.buffTick = 0;
            Object.keys(this.statuses).forEach((key) => { this.statuses[key] = Math.max(0, this.statuses[key] - 100); });
            Object.keys(this.buffs).forEach((key) => {
              if (typeof this.buffs[key] === 'number') this.buffs[key] = Math.max(0, this.buffs[key] - 100);
            });
          }

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
            if (tdy < -22 && this.onGround && this.statuses.heavy <= 0) { this.vy = -11; this.onGround = false; }
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
              if (this.statuses.blind > 0 && Math.random() < 0.30) {
                this.atkCD = 18;
                return;
              }
              if (Math.random() < PHYSICAL_ATTACK_CHANCE) {
                const nextCritical = this.buffs.nextCrit;
                this.buffs.nextCrit = false;
                const dmg = calcDamage(this.getAttackValue() * (nextCritical ? 1.7 : 1), enemy.getDefenseValue(), 0.75, 1.05);
                enemy.receiveHit(dmg, this.cx, this);
                this.atkCD = this.buffs.atkSpeedBoost > 0 ? 21 : 42;
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
            if (a instanceof BattleSkillOrb || b instanceof BattleSkillOrb) continue;
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
        f1.externalFreeze = Boolean(currentSlowOrb && !currentSlowOrb.dead && currentSlowOrb.owner === f0);
        autoJutsuTimer += dms;
        if (autoJutsuTimer >= 1000 && equippedJutsus.length > 0 && !gameOver) {
          autoJutsuTimer = 0;
          if (Math.random() <= 0.30 && f0.statuses.silence <= 0 && !currentSlowOrb) {
            const availableSkills = equippedJutsus.slice(0, 3);
            const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            const consumed = window.JutsuSystem?.consumeMpForJutsu?.(skill.id);
            if (consumed) {
              self.showJutsuAnnouncement(skill.name);
              const orb = new BattleSkillOrb(f0, f1, skill);
              jutsus.push(orb);
              currentSlowOrb = orb;
              slowMo = 0.05;
              jutsuVeil = 80;
              if (veil) veil.style.background = 'rgba(0,0,0,0.48)';
              if (f0.buffs.cdReductionTurns > 0) {
                f0.jutsuCD *= 0.65;
                f0.buffs.cdReductionTurns -= 1;
              }
            }
          }
        }
        f0.update(dt, dms, f1); f1.update(dt, dms, f0);
        for (const j of jutsus) j.update(dt);

        for (const j of jutsus) {
          if (j.dead) continue;
          for (const f of fighters) {
            if (f === j.owner || f.isDead || f.invincible) continue;
            if (Math.hypot(j.x - f.cx, j.y - f.cy) < j.size + NW / 2) {
              const isSkillOrb = j instanceof BattleSkillOrb;
              const baseDamage = isSkillOrb ? j.skillData.damage : j.owner.getAttackValue();
              const dmg = isSkillOrb ? Math.max(1, Math.round(baseDamage)) : calcDamage(baseDamage, f.getDefenseValue(), 0.9, 1.3);
              f.receiveHit(dmg, j.x, j.owner);
              if (isSkillOrb) {
                j.owner.applySkillEffects(j.skillData, f);
                if (currentSlowOrb === j) {
                  currentSlowOrb = null;
                  slowMo = 1;
                  if (veil) veil.style.background = 'rgba(0,0,0,0)';
                  self.hideJutsuAnnouncement();
                }
              }
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
        if (currentSlowOrb && currentSlowOrb.dead) {
          currentSlowOrb = null;
          slowMo = 1;
          if (veil) veil.style.background = 'rgba(0,0,0,0)';
          self.hideJutsuAnnouncement();
        }
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
        roundResolved = false;
        shakeX = 0; shakeY = 0; shakeDur = 0; shakeAmp = 0;
        jutsuVeil = 0; if (veil) veil.style.background = 'rgba(0,0,0,0)';
        autoJutsuTimer = 0;
        currentSlowOrb = null;
        self.hideJutsuAnnouncement();
        fighters = [new Fighter(playerFighterCfg), new Fighter(enemyFighterCfg)];

        const currentMainHp = window.GameState?.getHp?.();
        if (Number.isFinite(currentMainHp)) {
          fighters[0].hp = Math.max(1, Math.min(fighters[0].maxHp, Math.round(currentMainHp)));
        }
        syncMainHp(fighters[0].hp);

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
