(function () {
  const BASE_W = 460;
  const BASE_H = 360;
  const SC = 0.75;
  const NW = Math.round(64 * SC);
  const NH = Math.round(64 * SC);
  const G = 0.44;
  const SPRITE_SIZE = 256;
  const SPRITE_FRAMES = 4;
  const SPRITE_FRAME_SIZE = SPRITE_SIZE / SPRITE_FRAMES;

  const HERO_BATTLE_SPRITES = {
    madara: 'assets/images/madara_battle.png',
    itachi: 'assets/images/itachi_battle.png',
    obito: 'assets/images/obito_battle.png',
    sasuke: 'assets/images/sasuke_battle.png',
    naruto: 'assets/images/naruto_battle.png',
    nagato: 'assets/images/nagato_battle.png',
    kushina: 'assets/images/kushina_battle.png',
    karin: 'assets/images/karin_battle.png',
    tsunade: 'assets/images/tsunade_battle.png',
    hashirama: 'assets/images/hashirama_battle.png',
    tobirama: 'assets/images/tobirama_battle.png',
    itama: 'assets/images/itama_battle.png',
    kaguya: 'assets/images/kaguya_battle.png',
    hagoromo: 'assets/images/hagoromo_battle.png',
    indra: 'assets/images/indra_battle.png',
    asura: 'assets/images/asura_battle.png'
  };

  const ENEMY_D_RANK_SPRITES = {
    1: 'assets/images/enemies/rank-d/mission-1.png',
    2: 'assets/images/enemies/rank-d/mission-2.png',
    3: 'assets/images/enemies/rank-d/mission-3.png',
    4: 'assets/images/enemies/rank-d/mission-4.png',
    5: 'assets/images/enemies/rank-d/mission-5.png',
    6: 'assets/images/enemies/rank-d/mission-6.png'
  };

  class DRankBattleEngine {
    constructor(root) {
      this.root = root;
      this.wrapper = root.querySelector('#drb-wrapper');
      this.canvas = root.querySelector('#drb-canvas');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.veil = root.querySelector('#drb-veil');
      this.roundAnnouncementEl = root.querySelector('#drb-round-announcement');
      this.winnerScreen = root.querySelector('#drb-winner-screen');
      this.winNameEl = root.querySelector('#drb-win-name');
      this.btnRestart = root.querySelector('#drb-btn-restart');
      this.btnExit = root.querySelector('#drb-btn-exit');

      this.W = BASE_W;
      this.H = BASE_H;
      this.displayW = BASE_W;
      this.displayH = BASE_H;
      this.GROUND = this.H - 50;

      this.running = false;
      this.animationId = 0;
      this.resizeObserver = null;

      this.onComplete = null;
      this.battleContext = null;
      this.combatAdapter = null;
      this.completionSent = false;

      this.particles = [];
      this.damageNums = [];
      this.jutsus = [];
      this.summons = [];
      this.fighters = [];
      this.hitStop = 0;
      this.slowMo = 1;
      this.frameN = 0;
      this.gameOver = false;
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeDur = 0;
      this.shakeAmp = 0;
      this.critFlash = 0;
      this.jutsuVeil = 0;
      this.skillRollTimer = 0;
      this.activeSkillProjectile = null;
      this.activeSkillLabel = null;
      this.activeSkillFxTimer = 0;
      this.bgMountains = [];
      this.bgMountains2 = [];
      this.bgRocks = [];
      this.bgClouds = [];
      this.lastTs = 0;
      this.spriteCache = new Map();

      this.boundLoop = this.loop.bind(this);
      this.bindUI();
      this.resizeCanvas();
      this.observeResize();
    }

    bindUI() {
      if (this.btnRestart) this.btnRestart.addEventListener('click', () => this.startGame());
      if (this.btnExit) this.btnExit.addEventListener('click', () => this.finishAndExit());
    }

    observeResize() {
      if (!this.wrapper || typeof ResizeObserver === 'undefined') return;
      this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
      this.resizeObserver.observe(this.wrapper);
    }

    resizeCanvas() {
      if (!this.wrapper || !this.canvas) return;
      const w = Math.max(280, Math.floor(this.wrapper.clientWidth));
      const h = Math.max(180, Math.floor(this.wrapper.clientHeight));
      this.canvas.width = w;
      this.canvas.height = h;
      this.displayW = w;
      this.displayH = h;
    }

    mountMission(battleContext, onComplete) {
      this.battleContext = battleContext || null;
      this.onComplete = typeof onComplete === 'function' ? onComplete : null;
      this.completionSent = false;
      this.combatAdapter = this.createCombatAdapter(this.battleContext);
      this.genBG();
      this.startGame();
      this.start();
      this.dispatchBattleEvent('ngs:battle-started', {
        context: this.battleContext,
        round: this.battleContext?.runtimeModifiers?.round || 1
      });
    }

    start() {
      if (!this.ctx || this.running) return;
      this.running = true;
      this.lastTs = 0;
      this.animationId = requestAnimationFrame((ts) => {
        this.lastTs = ts;
        this.animationId = requestAnimationFrame(this.boundLoop);
      });
    }

    stop() {
      this.running = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = 0;
      }
    }

    destroy() {
      this.stop();
      if (this.resizeObserver && this.wrapper) {
        this.resizeObserver.unobserve(this.wrapper);
      }
    }

    finishAndExit() {
      const winner = this.fighters.find((f) => !f.isDead);
      this.resolveCompletion(winner ? winner.name : '???', true);
    }

    dispatchBattleEvent(eventName, detail) {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    createCombatAdapter(battleContext) {
      const heroStats = battleContext?.heroSnapshot?.combatStats || {};
      const missionConfig = battleContext?.missionConfig || {};
      const baseHeroAtk = Number(heroStats.ATK || 8);
      const baseHeroDef = Number(heroStats.DEF || 8);
      const enemyAtkRaw = Number(missionConfig.atk || 12);
      const enemyDefRaw = Number(missionConfig.def || 8);
      const enemyHpRaw = Number(missionConfig.hp || 100);
      return {
        hero: {
          maxHp: Math.max(1, Number(heroStats.HP || 100)),
          maxMp: Math.max(0, Number(heroStats.MP || 0)),
          atk: baseHeroAtk,
          def: baseHeroDef,
          critChance: Math.min(0.5, 0.08 + Number(heroStats.CRT || 0) / 100),
          critMult: 1.45 + Number(heroStats.CDMG || 0) / 100,
          evadeChance: Math.min(0.45, Number(heroStats.EVA || 0) / 100),
          incomingMitigation: Math.min(0.65, baseHeroDef / (baseHeroDef + 170))
        },
        enemy: {
          maxHp: Math.max(10, enemyHpRaw),
          atk: Math.max(4, enemyAtkRaw * 0.46),
          def: Math.max(4, enemyDefRaw * 0.5),
          critChance: 0.1,
          critMult: 1.4,
          evadeChance: 0.08,
          incomingMitigation: Math.min(0.6, enemyDefRaw / (enemyDefRaw + 220))
        }
      };
    }

    getHeroEquippedSkills() {
      if (!window.JutsuSystem || typeof window.JutsuSystem.getEquippedSkills !== 'function') return [];
      return window.JutsuSystem.getEquippedSkills();
    }

    getEnemySkills() {
      const skills = this.battleContext?.missionConfig?.enemySkills;
      return Array.isArray(skills) ? skills.filter(Boolean) : [];
    }

    getAllCombatants() {
      return [...this.fighters, ...this.summons].filter((unit) => unit && !unit.isDead);
    }

    pickTargetFor(attacker) {
      const enemies = this.getAllCombatants().filter((unit) => unit.team !== attacker.team);
      if (!enemies.length) return null;
      enemies.sort((a, b) => Math.hypot(attacker.cx - a.cx, attacker.cy - a.cy) - Math.hypot(attacker.cx - b.cx, attacker.cy - b.cy));
      return enemies[0];
    }

    endCinematicSkill() {
      if (this.activeSkillLabel?.owner) this.activeSkillLabel.owner.skillLock = null;
      this.slowMo = 1;
      this.activeSkillProjectile = null;
      this.activeSkillLabel = null;
      this.activeSkillFxTimer = 0;
      if (this.veil) this.veil.style.background = 'rgba(0,0,0,0)';
    }

    beginCinematicSkill(owner, skillName, projectile) {
      this.slowMo = 0.15;
      this.activeSkillProjectile = projectile;
      this.activeSkillLabel = {
        name: skillName || 'Habilidad',
        owner
      };
      this.activeSkillFxTimer = 0;
      if (this.veil) this.veil.style.background = 'rgba(0,0,0,0.45)';
    }

    beginTimedSkillFx(owner, skillName, durationMs = 1000, slowMo = 0.30, darkness = 0.45) {
      this.slowMo = Math.max(0.05, Number(slowMo) || 0.30);
      this.activeSkillProjectile = null;
      this.activeSkillLabel = {
        name: skillName || 'Habilidad',
        owner
      };
      this.activeSkillFxTimer = Math.max(1, Math.round((durationMs / 1000) * 60));
      if (this.veil) this.veil.style.background = `rgba(0,0,0,${Math.max(0, Math.min(0.75, darkness))})`;
    }

    drawActiveSkillLabel(ctx) {
      if (!this.activeSkillLabel || !this.activeSkillLabel.owner || this.activeSkillLabel.owner.isDead) return;
      const owner = this.activeSkillLabel.owner;
      const text = this.activeSkillLabel.name;
      ctx.save();
      ctx.font = 'bold 12px Arial Black';
      const maxWidth = this.W * 0.84;
      const rawWidth = ctx.measureText(text).width + 20;
      const boxWidth = Math.min(maxWidth, rawWidth);
      const boxHeight = 24;
      const x = Math.max(6, Math.min(this.W - boxWidth - 6, owner.cx - boxWidth / 2));
      const y = Math.max(6, owner.y - 34);
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.2;
      ctx.fillRect(x, y, boxWidth, boxHeight);
      ctx.strokeRect(x, y, boxWidth, boxHeight);
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2, boxWidth - 12);
      ctx.restore();
    }

    drawEquippedSkillSlots(ctx) {
      const slotSize = 32;
      const gap = 6;
      const baseX = 10;
      const baseY = this.H - slotSize - 10;
      const equipped = this.getHeroEquippedSkills().slice(0, 3);
      const hero = this.fighters[0];

      for (let i = 0; i < 3; i += 1) {
        const slotX = baseX + i * (slotSize + gap);
        const slotY = baseY;
        const skill = equipped[i] || null;

        ctx.save();
        ctx.fillStyle = skill ? 'rgba(12,20,36,0.90)' : 'rgba(0,0,0,0.45)';
        ctx.strokeStyle = skill ? 'rgba(120,190,255,0.95)' : 'rgba(180,180,180,0.60)';
        ctx.lineWidth = 1.4;
        ctx.fillRect(slotX, slotY, slotSize, slotSize);
        ctx.strokeRect(slotX, slotY, slotSize, slotSize);

        if (skill) {
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 18px Arial';
          ctx.fillText(skill.em || '✦', slotX + slotSize / 2, slotY + slotSize / 2 + 1);
          const cdFrames = hero?.getSkillCooldown?.(skill.id) || 0;
          if (cdFrames > 0) {
            const ratio = Math.min(1, cdFrames / Math.max(1, (skill.cooldownSeconds || 13) * 60));
            const secs = Math.max(0, Math.ceil(cdFrames / 60));
            ctx.fillStyle = 'rgba(0,0,0,0.62)';
            ctx.fillRect(slotX, slotY + slotSize * (1 - ratio), slotSize, slotSize * ratio);
            ctx.fillStyle = '#ffe066';
            ctx.font = 'bold 10px Arial Black';
            ctx.fillText(`${secs}s`, slotX + slotSize / 2, slotY + slotSize / 2 + 11);
          }
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.22)';
          ctx.lineWidth = 1;
          ctx.strokeRect(slotX + 8, slotY + 8, slotSize - 16, slotSize - 16);
        }
        ctx.restore();
      }
    }

    tryAutoLaunchEquippedSkill(attacker, defender, chance, getSkills) {
      if (!attacker || !defender || attacker.isDead || defender.isDead) return;
      if (this.activeSkillProjectile) return;
      const skills = getSkills();
      if (!skills.length) return;
      if (Math.random() > chance) return;
      const selected = skills[Math.floor(Math.random() * skills.length)];
      if (!attacker.canUseSkill(selected)) return;
      attacker.launchJutsu(defender, {
        isEquipped: true,
        skillName: selected.name || selected,
        skillData: selected
      });
    }

    resolveCompletion(winnerName, forcedExit = false) {
      if (this.completionSent) return;
      this.completionSent = true;
      if (this.onComplete) {
        const victory = winnerName === 'UZUMAKI';
        const hero = this.fighters[0];
        const mpRatio = this.combatAdapter?.hero?.maxMp > 0 ? hero.mp / this.combatAdapter.hero.maxMp : 0;
        const mpCost = Math.round((this.battleContext?.heroSnapshot?.combatStats?.MP_MAX || this.combatAdapter?.hero?.maxMp || 0) * 0.02);
        this.onComplete({
          victory,
          winner: winnerName,
          mission: this.battleContext?.missionConfig,
          forcedExit,
          battleContext: this.battleContext,
          deltaStats: { hp: Math.max(0, Math.round(hero.hp)), mp: Math.max(0, Math.round(hero.mp - mpCost)), mpRatio }
        });
      }
      this.dispatchBattleEvent('ngs:battle-ended', {
        result: winnerName === 'UZUMAKI' ? 'victory' : 'defeat',
        context: this.battleContext,
        nextRound: false,
        forcedExit
      });
    }

    showWinner(name) {
      if (this.winNameEl) {
        this.winNameEl.textContent = name;
        this.winNameEl.style.color = name === 'UZUMAKI' ? '#FFD700' : '#CC88FF';
      }
      if (this.winnerScreen) this.winnerScreen.style.display = 'flex';
      this.resolveCompletion(name, false);
    }

    triggerShake(amp, dur) {
      this.shakeAmp = Math.max(this.shakeAmp, amp);
      this.shakeDur = Math.max(this.shakeDur, dur);
    }

    spawnSparks(x, y, n, color) {
      for (let i = 0; i < n; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const spd = 1.5 + Math.random() * 3.5;
        this.particles.push(new this.Particle(this, x, y, Math.cos(a) * spd, Math.sin(a) * spd, color, 18 + Math.random() * 10, 2 + Math.random() * 1.5, 'spark'));
      }
    }

    spawnSmoke(x, y, count) {
      const layers = [['#FFFFFF', 0.8], ['#BBBBBB', 0.5], ['#777777', 0.35]];
      for (let i = 0; i < count; i += 1) {
        const [col, spd] = layers[i % 3];
        this.particles.push(new this.Particle(
          this,
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

    genBG() {
      this.bgMountains = [
        { x: 0, y: 210 }, { x: 30, y: 160 }, { x: 60, y: 120 }, { x: 90, y: 80 }, { x: 110, y: 55 }, { x: 130, y: 75 },
        { x: 150, y: 100 }, { x: 175, y: 65 }, { x: 195, y: 40 }, { x: 215, y: 60 }, { x: 235, y: 90 }, { x: 250, y: 70 },
        { x: 270, y: 45 }, { x: 290, y: 70 }, { x: 310, y: 95 }, { x: 330, y: 60 }, { x: 355, y: 30 }, { x: 375, y: 55 },
        { x: 395, y: 80 }, { x: 415, y: 50 }, { x: 435, y: 75 }, { x: 460, y: 110 }, { x: 460, y: 210 }
      ];

      this.bgMountains2 = [
        { x: 0, y: 220 }, { x: 25, y: 185 }, { x: 55, y: 155 }, { x: 85, y: 175 }, { x: 115, y: 140 }, { x: 145, y: 160 },
        { x: 170, y: 125 }, { x: 200, y: 145 }, { x: 230, y: 115 }, { x: 260, y: 135 }, { x: 290, y: 155 }, { x: 320, y: 125 },
        { x: 350, y: 145 }, { x: 380, y: 165 }, { x: 410, y: 140 }, { x: 440, y: 160 }, { x: 460, y: 175 }, { x: 460, y: 220 }
      ];

      this.bgRocks = [];
      for (let i = 0; i < 10; i += 1) {
        this.bgRocks.push({ x: 20 + Math.random() * (this.W - 40), w: 8 + Math.random() * 18, h: 5 + Math.random() * 9, col: Math.random() < 0.5 ? '#7A6A55' : '#6A5A45' });
      }

      this.bgClouds = [];
      for (let i = 0; i < 5; i += 1) {
        this.bgClouds.push({ x: Math.random() * this.W, y: 15 + Math.random() * 55, w: 35 + Math.random() * 55, speed: 0.12 + Math.random() * 0.18 });
      }
    }

    drawBG(parallaxX) {
      const ctx = this.ctx;
      const sky = ctx.createLinearGradient(0, 0, 0, this.H);
      sky.addColorStop(0, '#5BA8D4'); sky.addColorStop(0.45, '#87CEEB'); sky.addColorStop(0.75, '#B8DEF0'); sky.addColorStop(1, '#D4EAF5');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, this.W, this.H);

      ctx.save();
      ctx.fillStyle = '#FFF8C0';
      ctx.beginPath(); ctx.arc(this.W - 40, 28, 16, 0, Math.PI * 2); ctx.fill();
      const sunGlow = ctx.createRadialGradient(this.W - 40, 28, 12, this.W - 40, 28, 38);
      sunGlow.addColorStop(0, 'rgba(255,240,150,0.35)'); sunGlow.addColorStop(1, 'rgba(255,240,150,0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath(); ctx.arc(this.W - 40, 28, 38, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      for (const cl of this.bgClouds) {
        cl.x -= cl.speed;
        if (cl.x < -cl.w - 20) cl.x = this.W + cl.w + 10;
        ctx.save();
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.ellipse(cl.x, cl.y, cl.w, cl.w * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cl.x - cl.w * 0.3, cl.y + cl.w * 0.05, cl.w * 0.55, cl.w * 0.32, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cl.x + cl.w * 0.3, cl.y + cl.w * 0.08, cl.w * 0.5, cl.w * 0.28, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = '#7A8E9E';
      ctx.beginPath();
      ctx.moveTo(this.bgMountains[0].x, this.H);
      for (const p of this.bgMountains) ctx.lineTo(p.x, p.y);
      ctx.lineTo(this.bgMountains[this.bgMountains.length - 1].x, this.H);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#A0B4C0';
      ctx.beginPath();
      ctx.moveTo(this.bgMountains[0].x, this.H);
      for (const p of this.bgMountains) ctx.lineTo(p.x, p.y);
      ctx.lineTo(this.bgMountains[this.bgMountains.length - 1].x, this.H);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#F0F4F8';
      ctx.beginPath();
      for (let i = 0; i < this.bgMountains.length; i += 1) {
        const p = this.bgMountains[i];
        if (i === 0) ctx.moveTo(p.x, p.y + 30);
        ctx.lineTo(p.x, p.y < 100 ? p.y : Math.min(p.y, 100));
      }
      for (let i = this.bgMountains.length - 1; i >= 0; i -= 1) {
        const p = this.bgMountains[i];
        if (p.y < 130) ctx.lineTo(p.x, p.y + 35); else { ctx.lineTo(p.x, 130); break; }
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#5A6E7E';
      ctx.beginPath();
      for (let i = 1; i < this.bgMountains.length - 1; i += 1) {
        const p = this.bgMountains[i];
        const prev = this.bgMountains[i - 1];
        if (p.y < 80 && prev.y > p.y) {
          ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 28, p.y + 50); ctx.lineTo(p.x - 8, p.y + 55); ctx.closePath();
        }
      }
      ctx.fill();

      ctx.save();
      ctx.translate(-parallaxX * 0.25, 0);
      ctx.fillStyle = '#8B9E7A';
      ctx.beginPath();
      ctx.moveTo(this.bgMountains2[0].x, this.H);
      for (const p of this.bgMountains2) ctx.lineTo(p.x, p.y);
      ctx.lineTo(this.bgMountains2[this.bgMountains2.length - 1].x, this.H);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(240,244,248,0.7)';
      for (const p of this.bgMountains2) {
        if (p.y < 140) { ctx.beginPath(); ctx.ellipse(p.x, p.y + 5, 8, 4, 0, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();

      ctx.save();
      ctx.translate(-parallaxX * 0.55, 0);
      for (let i = 0; i < 8; i += 1) {
        const tx = 25 + i * (this.W / 7.5);
        const th = 30 + ((i * 37) % 22);
        const tw = 9 + ((i * 13) % 7);
        ctx.fillStyle = '#5C4533'; ctx.fillRect(tx - 2, this.GROUND - th * 0.25, 4, th * 0.25);
        ctx.fillStyle = '#2E5E35';
        ctx.beginPath(); ctx.moveTo(tx, this.GROUND - th); ctx.lineTo(tx - tw, this.GROUND - th * 0.35); ctx.lineTo(tx + tw, this.GROUND - th * 0.35); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3A7242';
        ctx.beginPath(); ctx.moveTo(tx, this.GROUND - th * 0.75); ctx.lineTo(tx - tw * 0.85, this.GROUND - th * 0.2); ctx.lineTo(tx + tw * 0.85, this.GROUND - th * 0.2); ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      const grd = ctx.createLinearGradient(0, this.GROUND, 0, this.H);
      grd.addColorStop(0, '#8B6A3E'); grd.addColorStop(0.1, '#7A5A30'); grd.addColorStop(0.35, '#5C4220'); grd.addColorStop(1, '#3A2810');
      ctx.fillStyle = grd;
      ctx.fillRect(0, this.GROUND, this.W, this.H - this.GROUND);
      ctx.fillStyle = '#9E7A4A'; ctx.fillRect(0, this.GROUND, this.W, 3);
      ctx.fillStyle = '#B08850'; ctx.fillRect(0, this.GROUND, this.W, 1.5);

      ctx.strokeStyle = '#4A3018';
      ctx.lineWidth = 1.2;
      const rootPts = [
        [{ x: 30, y: this.GROUND + 4 }, { x: 50, y: this.GROUND + 12 }, { x: 65, y: this.GROUND + 8 }],
        [{ x: 120, y: this.GROUND + 2 }, { x: 105, y: this.GROUND + 14 }, { x: 90, y: this.GROUND + 10 }],
        [{ x: 200, y: this.GROUND + 5 }, { x: 220, y: this.GROUND + 16 }, { x: 240, y: this.GROUND + 11 }],
        [{ x: 310, y: this.GROUND + 3 }, { x: 295, y: this.GROUND + 13 }, { x: 280, y: this.GROUND + 9 }],
        [{ x: 380, y: this.GROUND + 4 }, { x: 400, y: this.GROUND + 15 }, { x: 415, y: this.GROUND + 10 }]
      ];
      for (const root of rootPts) {
        ctx.beginPath();
        ctx.moveTo(root[0].x, root[0].y);
        for (let k = 1; k < root.length; k += 1) ctx.lineTo(root[k].x, root[k].y);
        ctx.stroke();
      }

      for (const r of this.bgRocks) {
        ctx.fillStyle = r.col;
        ctx.beginPath(); ctx.ellipse(r.x, this.GROUND + r.h * 0.4, r.w, r.h, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,230,180,0.25)';
        ctx.beginPath(); ctx.ellipse(r.x + r.w * 0.25, this.GROUND + r.h * 0.2, r.w * 0.45, r.h * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.30)';
        ctx.beginPath(); ctx.ellipse(r.x - r.w * 0.2, this.GROUND + r.h * 0.45, r.w * 0.35, r.h * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      }

      for (const f of this.fighters) {
        const shLen = 18 + (this.GROUND - NH - f.y) * 0.05;
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#2A1A08';
        ctx.beginPath();
        ctx.moveTo(f.cx - NW * 0.4, this.GROUND);
        ctx.lineTo(f.cx + NW * 0.4, this.GROUND);
        ctx.lineTo(f.cx + NW * 0.4 - shLen, this.GROUND + 6);
        ctx.lineTo(f.cx - NW * 0.4 - shLen, this.GROUND + 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      const dustGrd = ctx.createLinearGradient(0, this.GROUND - 10, 0, this.GROUND + 18);
      dustGrd.addColorStop(0, 'rgba(180,140,80,0)');
      dustGrd.addColorStop(1, 'rgba(120,90,40,0.22)');
      ctx.fillStyle = dustGrd;
      ctx.fillRect(0, this.GROUND - 10, this.W, 28);
    }

    checkJutsuClash() {
      for (let i = 0; i < this.jutsus.length; i += 1) {
        for (let j = i + 1; j < this.jutsus.length; j += 1) {
          const a = this.jutsus[i];
          const b = this.jutsus[j];
          if (a.owner === b.owner || a.dead || b.dead) continue;
          if (Math.hypot(a.x - b.x, a.y - b.y) < a.size + b.size + 6) {
            if (a.piercesGenericProjectiles && b.isGenericProjectile) {
              b.dead = true;
              continue;
            }
            if (b.piercesGenericProjectiles && a.isGenericProjectile) {
              a.dead = true;
              continue;
            }
            const ex = (a.x + b.x) / 2;
            const ey = (a.y + b.y) / 2;
            for (let k = 0; k < 22; k += 1) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 3 + Math.random() * 5;
              this.particles.push(new this.Particle(this, ex, ey, Math.cos(ang) * spd, Math.sin(ang) * spd - 1, '#FFFFFF', 22, 3, 'spark'));
              this.particles.push(new this.Particle(this, ex, ey, Math.cos(ang) * spd * 0.5, Math.sin(ang) * spd * 0.5, '#FFD700', 32, 2.5, 'spark'));
            }
            this.critFlash = 2;
            this.triggerShake(6, 18);
            a.dead = true;
            b.dead = true;
            for (const f of this.fighters) f.vx += f.cx > ex ? 4.5 : -4.5;
          }
        }
      }
    }

    update(dt, dms) {
      this.frameN += 1;
      if (this.frameN % 65 === 0) {
        this.particles.push(new this.Particle(this, Math.random() * this.W, this.GROUND - 2, (Math.random() - 0.5) * 1.2, -0.3 - Math.random() * 0.5, Math.random() < 0.5 ? '#C8A870' : '#A88850', 90 + Math.random() * 60, 1.2 + Math.random(), 'dust'));
      }

      if (this.critFlash > 0) this.critFlash -= dt;
      if (this.shakeDur > 0) {
        this.shakeDur -= dt;
        const f = this.shakeDur / 10;
        this.shakeX = (Math.random() - 0.5) * this.shakeAmp * f;
        this.shakeY = (Math.random() - 0.5) * this.shakeAmp * f;
        if (this.shakeDur <= 0) { this.shakeX = 0; this.shakeY = 0; this.shakeAmp = 0; }
      }
      if (this.jutsuVeil > 0) {
        this.jutsuVeil -= dt;
        if (this.jutsuVeil <= 0) {
          this.jutsuVeil = 0;
          if (this.veil) this.veil.style.background = 'rgba(0,0,0,0)';
        }
      }
      if (this.activeSkillFxTimer > 0) {
        this.activeSkillFxTimer -= dt;
        if (this.activeSkillFxTimer <= 0 && !this.activeSkillProjectile) this.endCinematicSkill();
      }

      if (this.hitStop > 0) {
        this.hitStop -= dt;
        this.particles.forEach((p) => p.update(dt));
        this.particles = this.particles.filter((p) => !p.isDead());
        this.damageNums.forEach((d) => d.update(dt));
        this.damageNums = this.damageNums.filter((d) => !d.isDead());
        return;
      }

      const [f0, f1] = this.fighters;
      if (!f0 || !f1) return;
      this.skillRollTimer += dms;
      while (this.skillRollTimer >= 1000) {
        this.skillRollTimer -= 1000;
        this.tryAutoLaunchEquippedSkill(f0, f1, 0.35, () => this.getHeroEquippedSkills());
        this.tryAutoLaunchEquippedSkill(f1, f0, 0.20, () => this.getEnemySkills());
      }
      f0.update(dt, dms, this.pickTargetFor(f0));
      f1.update(dt, dms, this.pickTargetFor(f1));
      for (const summon of this.summons) summon.update(dt, dms, this.pickTargetFor(summon));

      for (const j of this.jutsus) j.update(dt);
      for (const j of this.jutsus) {
        if (j.dead) continue;
        for (const f of this.getAllCombatants()) {
          if (f === j.owner || f.team === j.ownerTeam || f.isDead || f.invincible) continue;
          if (Math.hypot(j.x - f.cx, j.y - f.cy) < j.size + NW / 2) {
            const isItachiKaton = j.skillData?.id === 'itachi-katon-gokakyu';
            if (isItachiKaton) {
              f.receiveHit(Number(j.skillData?.damage || 40), j.x, j.owner, false);
              f.applyBurn(0.02, 4, j.owner);
              j.owner.applyAtkBuff(0.10, 25);
            } else {
              const dmgPayload = this.calcDamage(j.owner, f, 'jutsu');
              f.receiveHit(dmgPayload.damage, j.x, j.owner, dmgPayload.crit);
            }
            for (let i = 0; i < 16; i += 1) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 2 + Math.random() * 4;
              this.particles.push(new this.Particle(this, j.x, j.y, Math.cos(ang) * spd, Math.sin(ang) * spd, j.color, 20, 3, 'spark'));
            }
            j.dead = true;
            if (j.isEquipped && this.activeSkillProjectile === j) this.endCinematicSkill();
          }
        }
      }

      this.checkJutsuClash();
      for (const j of this.jutsus) {
        if (j.dead && j.isEquipped && this.activeSkillProjectile === j) this.endCinematicSkill();
      }
      this.jutsus = this.jutsus.filter((j) => !j.dead);
      this.summons = this.summons.filter((s) => !s.isDead);
      this.particles.forEach((p) => p.update(dt));
      this.particles = this.particles.filter((p) => !p.isDead());
      this.damageNums.forEach((d) => d.update(dt));
      this.damageNums = this.damageNums.filter((d) => !d.isDead());
    }

    render() {
      const ctx = this.ctx;
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.displayW, this.displayH);
      const sx = this.displayW / this.W;
      const sy = this.displayH / this.H;
      ctx.save();
      ctx.scale(sx, sy);
      ctx.translate(this.shakeX, this.shakeY);

      if (this.critFlash > 1) {
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.fillRect(-this.shakeX, -this.shakeY, this.W, this.H);
        ctx.restore();
        return;
      }

      const avgX = this.fighters.reduce((s, f) => s + f.cx, 0) / this.fighters.length;
      const parallaxX = (avgX - this.W / 2) * 0.10;
      this.drawBG(parallaxX);
      for (const j of this.jutsus) j.draw(ctx);
      for (const f of this.fighters) f.draw(ctx);
      for (const summon of this.summons) summon.draw(ctx);
      for (const f of this.fighters) f.drawStatusEffects(ctx);
      for (const summon of this.summons) summon.drawStatusEffects(ctx);
      this.drawActiveSkillLabel(ctx);
      for (const p of this.particles) p.draw(ctx);
      for (const d of this.damageNums) d.draw(ctx);
      this.drawEquippedSkillSlots(ctx);

      if (this.gameOver && this.slowMo < 1) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,220,0,.22)';
        ctx.font = 'bold 14px Arial Black';
        ctx.textAlign = 'center';
        ctx.fillText('K.O.', this.W / 2, 28);
        ctx.restore();
      }

      ctx.restore();
    }

    startGame() {
      this.particles = [];
      this.damageNums = [];
      this.jutsus = [];
      this.summons = [];
      this.hitStop = 0;
      this.slowMo = 1;
      this.frameN = 0;
      this.gameOver = false;
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeDur = 0;
      this.shakeAmp = 0;
      this.critFlash = 0;
      this.jutsuVeil = 0;
      this.skillRollTimer = 0;
      this.activeSkillProjectile = null;
      this.activeSkillLabel = null;
      this.activeSkillFxTimer = 0;
      this.completionSent = false;
      if (this.veil) this.veil.style.background = 'rgba(0,0,0,0)';
      if (this.winnerScreen) this.winnerScreen.style.display = 'none';
      const heroCharacterId = this.battleContext?.heroSnapshot?.characterId || '';
      const heroSpritePath = HERO_BATTLE_SPRITES[heroCharacterId] || '';
      const missionIndex = Number(this.battleContext?.missionConfig?.missionIndex ?? 0) + 1;
      const enemySpritePath = ENEMY_D_RANK_SPRITES[missionIndex] || '';

      const heroProfile = this.buildSpriteProfile(heroSpritePath);
      const enemyProfile = this.buildSpriteProfile(enemySpritePath);
      this.fighters = [new this.Fighter(this, 70, 0, heroProfile), new this.Fighter(this, 360, 1, enemyProfile)];
      if (this.combatAdapter) {
        const heroRuntime = this.battleContext?.runtimeModifiers?.playerRuntime || {};
        const heroMaxHp = this.combatAdapter.hero.maxHp;
        const heroMaxMp = this.combatAdapter.hero.maxMp;
        const currentHp = Number(heroRuntime.currentHp ?? heroMaxHp);
        const currentMp = Number(heroRuntime.currentMp ?? heroMaxMp);
        this.fighters[0].maxHp = heroMaxHp;
        this.fighters[0].hp = Math.max(1, Math.min(heroMaxHp, currentHp));
        this.fighters[0].maxMp = heroMaxMp;
        this.fighters[0].mp = Math.max(0, Math.min(heroMaxMp, currentMp));
        this.fighters[0].combat = this.combatAdapter.hero;
        this.fighters[1].name = 'ENEMIGO D';
        this.fighters[1].maxHp = this.combatAdapter.enemy.maxHp;
        this.fighters[1].hp = this.combatAdapter.enemy.maxHp;
        this.fighters[1].combat = this.combatAdapter.enemy;
      }
      this.fighters[0].tX = 120 + Math.random() * 80;
      this.fighters[1].tX = 250 + Math.random() * 80;
    }

    showRoundAnnouncement() {
      if (!this.roundAnnouncementEl) return;
      this.roundAnnouncementEl.classList.remove('show');
      void this.roundAnnouncementEl.offsetWidth;
      this.roundAnnouncementEl.classList.add('show');
      setTimeout(() => this.roundAnnouncementEl?.classList.remove('show'), 1050);
    }

    buildSpriteProfile(path) {
      if (!path) return null;
      return {
        path,
        image: this.getSpriteImage(path),
        frameW: SPRITE_FRAME_SIZE,
        frameH: SPRITE_FRAME_SIZE,
        framesPerRow: SPRITE_FRAMES
      };
    }

    getSpriteImage(path) {
      if (!path) return null;
      if (this.spriteCache.has(path)) return this.spriteCache.get(path);
      const img = new Image();
      img.src = path;
      this.spriteCache.set(path, img);
      return img;
    }

    handleRoundVictory() {
      const hero = this.fighters[0];
      const runtime = this.battleContext?.runtimeModifiers?.playerRuntime;
      if (runtime) {
        runtime.currentHp = Math.max(1, Math.round(hero.hp));
        runtime.currentMp = Math.max(0, Math.round(hero.mp));
      }
      if (this.battleContext?.runtimeModifiers) {
        this.battleContext.runtimeModifiers.round = (this.battleContext.runtimeModifiers.round || 1) + 1;
      }
      if (this.onComplete) {
        this.onComplete({
          victory: true,
          nextRound: true,
          mission: this.battleContext?.missionConfig,
          battleContext: this.battleContext,
          deltaStats: { hp: runtime?.currentHp, mp: runtime?.currentMp }
        });
      }
      this.dispatchBattleEvent('ngs:battle-ended', {
        result: 'victory',
        rewards: { xp: this.battleContext?.missionConfig?.xp || 0, gold: this.battleContext?.missionConfig?.gold || 0 },
        delta: { hp: runtime?.currentHp, mp: runtime?.currentMp },
        context: this.battleContext,
        nextRound: true
      });
      this.showRoundAnnouncement();
      setTimeout(() => this.startGame(), 1000);
    }

    calcDamage(attacker, defender, type = 'basic') {
      const atkBase = attacker.combat?.atk || 10;
      const atkBuff = 1 + (attacker.atkBuff?.percent || 0);
      const atk = atkBase * atkBuff;
      const base = type === 'jutsu' ? atk * 1.15 : atk * 0.75;
      const defense = defender.combat?.def || 8;
      const defenseFactor = defense / (defense + 120);
      const mitigation = Math.min(0.8, (defender.combat?.incomingMitigation || 0) + defenseFactor * 0.35);
      let dmg = Math.max(2, base * (1 - mitigation) + Math.random() * 3);
      const crit = Math.random() < (attacker.combat?.critChance || 0.1);
      if (crit) dmg *= attacker.combat?.critMult || 1.5;
      return { damage: dmg, crit };
    }

    loop(ts) {
      if (!this.running) return;
      const rawDt = Math.min((ts - this.lastTs) / 16.667, 3);
      this.lastTs = ts;
      const dt = rawDt * this.slowMo;
      const dms = rawDt * 16.667 * this.slowMo;
      this.update(dt, dms);
      const hero = this.fighters[0];
      const enemy = this.fighters[1];
      this.dispatchBattleEvent('ngs:battle-tick', {
        round: this.battleContext?.runtimeModifiers?.round || 1,
        hero: { hp: Math.max(0, Math.round(hero?.hp || 0)), mp: Math.max(0, Math.round(hero?.mp || 0)) },
        enemy: { hp: Math.max(0, Math.round(enemy?.hp || 0)) }
      });
      this.render();
      this.animationId = requestAnimationFrame(this.boundLoop);
    }

    get Particle() {
      return class Particle {
        constructor(engine, x, y, vx, vy, color, life, size, type) {
          this.e = engine;
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
            this.vx = Math.sin(this.e.frameN * 0.025 + this.x * 0.08) * 0.7;
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
            ctx.translate(this.x, this.y); ctx.rotate(this.rot);
            ctx.fillRect(-this.size, -this.size * 0.4, this.size * 2, this.size * 0.8);
          } else {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
        }
        isDead() { return this.life <= 0 || (this.type === 'smoke' && this.size > 45); }
      };
    }

    get DamageNum() {
      return class DamageNum {
        constructor(x, y, val, crit) {
          this.x = x; this.y = y; this.val = typeof val === 'number' ? Math.round(val) : String(val); this.crit = crit;
          this.vx = (Math.random() - 0.5) * 2.5;
          this.vy = -4.5;
          this.life = 60;
          this.maxLife = 60;
        }
        update(dt) { this.x += this.vx * dt; this.vy += 0.18 * dt; this.y += this.vy * dt; this.life -= dt; }
        isDead() { return this.life <= 0; }
        draw(ctx) {
          const a = Math.max(0, this.life / this.maxLife);
          const isText = Number.isNaN(Number(this.val));
          const sz = isText ? 9 : (this.crit ? 15 : 11);
          ctx.save();
          ctx.globalAlpha = a;
          ctx.font = `bold ${sz}px Arial Black`;
          ctx.textAlign = 'center';
          ctx.strokeStyle = '#000'; ctx.lineWidth = 3.5; ctx.strokeText(this.val, this.x, this.y);
          ctx.fillStyle = isText ? '#60a5fa' : (this.crit ? '#FFE040' : '#FF6644'); ctx.fillText(this.val, this.x, this.y);
          if (this.crit) {
            ctx.font = 'bold 7px Arial';
            ctx.fillStyle = '#FFFACC';
            ctx.fillText('CRÍTICO!', this.x, this.y - 13);
          }
          ctx.restore();
        }
      };
    }

    get Jutsu() {
      return class Jutsu {
        constructor(x, y, vx, vy, owner, options = {}) {
          this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.owner = owner;
          this.ownerTeam = owner?.team ?? 0;
          this.skillData = options.skillData || null;
          this.color = this.skillData?.id === 'itachi-katon-gokakyu' ? '#ff2a2a' : owner.glowColor;
          this.size = this.skillData?.id === 'itachi-katon-gokakyu' ? 35 : 9;
          this.life = 200; this.dead = false; this.trail = [];
          this.isEquipped = Boolean(options.isEquipped);
          this.skillName = options.skillName || '';
          this.target = options.target || null;
          this.homing = this.skillData?.id === 'itachi-katon-gokakyu';
          this.piercesGenericProjectiles = this.homing;
          this.isGenericProjectile = !this.isEquipped;
        }
        update(dt) {
          this.trail.unshift({ x: this.x, y: this.y });
          if (this.trail.length > 12) this.trail.pop();
          if (this.homing && this.target && !this.target.isDead) {
            const dx = this.target.cx - this.x;
            const dy = this.target.cy - this.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const spd = 5.6;
            const steer = 0.18;
            this.vx += (((dx / d) * spd) - this.vx) * steer;
            this.vy += (((dy / d) * spd) - this.vy) * steer;
          }
          this.x += this.vx * dt; this.y += this.vy * dt; this.life -= dt;
          const e = this.owner.e;
          if (this.x < -12 || this.x > e.W + 12 || this.y < -12 || this.y > e.H + 12 || this.life <= 0) this.dead = true;
          if (Math.random() < 0.35) e.particles.push(new e.Particle(e, this.x, this.y, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, this.color, 10, 2, 'spark'));
        }
        draw(ctx) {
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
      };
    }

    get Fighter() {
      return class Fighter {
        constructor(engine, x, id, spriteProfile = null, options = {}) {
          this.e = engine;
          this.id = id;
          this.team = Number.isFinite(options.team) ? options.team : (id === 1 ? 1 : 0);
          this.isClone = Boolean(options.isClone);
          this.cloneOwner = options.cloneOwner || null;
          this.cloneLifetime = Math.max(0, Math.round((options.cloneLifetimeSeconds || 0) * 60));
          this.x = x;
          this.y = this.e.GROUND - NH;
          this.vx = 0;
          this.vy = 0;
          this.onGround = true;
          this.facingRight = id === 0;
          this.name = options.name || (id === 0 ? 'UZUMAKI' : 'UCHIHA');
          this.color = id === 0 ? '#E8A030' : '#6855CC';
          this.glowColor = id === 0 ? '#FF8C00' : '#9932CC';
          this.skinColor = id === 0 ? '#F5C09A' : '#D8C8E8';
          this.hp = 100;
          this.maxHp = 100;
          this.mp = 100;
          this.maxMp = 100;
          this.combat = null;
          this.dashTimer = 0;
          this.dashInterval = 800;
          this.tX = x;
          this.tY = this.e.GROUND - NH;
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
          this.spriteProfile = spriteProfile;
          this.skillCooldowns = {};
          this.skillLock = null;
          this.burn = null;
          this.atkBuff = null;
        }
        get cx() { return this.x + NW / 2; }
        get cy() { return this.y + NH / 2; }
        getSkillCooldown(skillId) { return Math.max(0, this.skillCooldowns?.[skillId] || 0); }
        canUseSkill(skillData = null) {
          if (!skillData?.id) return this.jutsuCD <= 0;
          return this.getSkillCooldown(skillData.id) <= 0;
        }
        applyBurn(percentPerSecond, durationSeconds, source) {
          this.burn = {
            percentPerSecond: Math.max(0, Number(percentPerSecond) || 0),
            ticksLeft: Math.max(1, Math.round(durationSeconds || 4)),
            tickTimer: 60,
            source
          };
        }
        applyAtkBuff(percent, durationSeconds) {
          this.atkBuff = {
            percent: Math.max(0, Number(percent) || 0),
            timer: Math.max(1, Math.round((durationSeconds || 1) * 60))
          };
        }

        receiveHit(rawDmg, fromX, attacker, forcedCrit = false) {
          if (this.isDead || this.invincible) return;
          if (Math.random() < (this.combat?.evadeChance || 0.08)) {
            this.e.damageNums.push(new this.e.DamageNum(this.cx, this.y - 7, 'EVA', false));
            return;
          }
          if (Math.random() < 0.15 && this.stunTimer <= 0) {
            this.doKawarimi(attacker);
            return;
          }
          let dmg = rawDmg;
          const canShield = !this.shieldBroken && !this.defBreak && this.shieldTime < 2000;
          if (canShield && Math.random() < 0.30) {
            dmg = rawDmg * 0.30;
            this.shieldTime += 500;
            this.e.spawnSparks(this.cx, this.cy, 6, '#88CCFF');
            if (this.shieldTime >= 2000) {
              this.shieldBroken = true;
              this.shieldBreakTimer = 90;
              this.shieldTime = 0;
              this.stunTimer = 35;
              this.e.spawnSparks(this.cx, this.cy, 12, '#44AAFF');
            }
          }

          this.dmgBurst += rawDmg;
          if (this.dmgBurst >= this.maxHp * 0.15) {
            this.defBreak = true;
            this.defBreakTimer = 90;
            this.dmgBurst = 0;
            for (let i = 0; i < 8; i += 1) this.e.particles.push(new this.e.Particle(this.e, this.cx, this.cy - NH * 0.5, (Math.random() - 0.5) * 4, -3 - Math.random() * 2, '#FF0000', 28, 3, 'spark'));
          }

          this.hp = Math.max(0, this.hp - dmg);
          const isCrit = forcedCrit || rawDmg >= 14;
          this.e.damageNums.push(new this.e.DamageNum(this.cx + (Math.random() - 0.5) * 8, this.y - 5, dmg, isCrit));
          const dir = fromX < this.cx ? 1 : -1;
          const clr = isCrit ? '#FFD700' : '#FF4422';
          for (let i = 0; i < (isCrit ? 16 : 9); i += 1) {
            const ang = (Math.random() - 0.5) * Math.PI * 0.85 + (dir > 0 ? 0 : Math.PI);
            const spd = 2 + Math.random() * 5;
            this.e.particles.push(new this.e.Particle(this.e, this.cx, this.cy, Math.cos(ang) * spd, Math.sin(ang) * spd - 1, clr, 18 + Math.random() * 10, 2 + Math.random() * 2, 'spark'));
          }
          this.vx += dir * 11;
          this.flashTimer = 18;
          this.stunTimer = 22;
          this.e.hitStop = 3;
          this.e.triggerShake(isCrit ? 6 : 2, isCrit ? 20 : 9);
          if (isCrit) this.e.critFlash = 2;
          if (this.hp <= 0 && !this.isDead) this.die();
        }

        doKawarimi(attacker) {
          const behind = attacker.facingRight ? attacker.x - NW - 28 : attacker.x + NW + 28;
          const nx = Math.max(5, Math.min(this.e.W - NW - 5, behind));
          this.e.spawnSmoke(this.cx, this.cy, 18);
          this.x = nx;
          this.y = this.e.GROUND - NH;
          this.vx = 0;
          this.vy = 0;
          this.onGround = true;
          this.invincible = true;
          this.invTimer = 35;
          this.e.spawnSmoke(this.cx, this.cy, 12);
          this.e.triggerShake(2, 6);
        }

        placeForEquippedSkill(target) {
          const distance = this.e.W * 0.70;
          const dir = this.cx < target.cx ? -1 : 1;
          const nx = target.x + (dir * distance);
          const lockedX = Math.max(4, Math.min(this.e.W - NW - 4, nx));
          const lockedY = Math.max(8, this.e.GROUND - NH - 145);
          this.x = lockedX;
          this.y = lockedY;
          this.vx = 0;
          this.vy = 0;
          this.onGround = false;
          this.skillLock = { x: lockedX, y: lockedY };
        }

        spawnKageBunshin(skillData, target, skillName) {
          const spritePath = 'assets/images/itachi_battle.png';
          const spriteProfile = this.e.buildSpriteProfile(spritePath);
          const cloneCount = Math.max(1, Math.round(skillData?.cloneCount || 2));
          const statScale = Math.max(0.05, Number(skillData?.cloneStatMultiplier || 0.20));
          const lifetimeSeconds = Math.max(1, Number(skillData?.cloneLifetimeSeconds || 13));
          const offsetStep = 30;
          for (let i = 0; i < cloneCount; i += 1) {
            const side = i % 2 === 0 ? -1 : 1;
            const offset = offsetStep + (Math.floor(i / 2) * 16);
            const spawnX = Math.max(4, Math.min(this.e.W - NW - 4, this.x + side * offset));
            const clone = new this.e.Fighter(this.e, spawnX, 100 + i, spriteProfile, {
              name: 'ITACHI CLON',
              team: this.team,
              isClone: true,
              cloneOwner: this,
              cloneLifetimeSeconds: lifetimeSeconds
            });
            clone.maxHp = Math.max(1, this.hp * statScale);
            clone.hp = clone.maxHp;
            clone.maxMp = Math.max(0, this.mp * statScale);
            clone.mp = clone.maxMp;
            clone.combat = {
              ...(this.combat || {}),
              atk: Math.max(1, (this.combat?.atk || 10) * statScale),
              def: Math.max(1, (this.combat?.def || 8) * statScale),
              maxHp: clone.maxHp,
              maxMp: clone.maxMp
            };
            clone.tX = target ? target.x : clone.x + (Math.random() - 0.5) * 90;
            clone.tY = this.e.GROUND - NH;
            this.e.spawnSmoke(clone.cx, clone.cy, 14);
            this.e.summons.push(clone);
          }
          this.e.beginTimedSkillFx(this, skillName, 1000, 0.30, 0.45);
        }

        vanishClone() {
          if (!this.isClone || this.isDead) return;
          this.e.spawnSmoke(this.cx, this.cy, 18);
          this.isDead = true;
        }

        launchJutsu(target, options = {}) {
          if (this.jutsuCD > 0) return;
          const skillData = options.skillData || null;
          const mpCost = Math.max(2, Math.round(skillData?.mpCost || this.maxMp * 0.02));
          if (this.mp < mpCost) return;
          const isEquipped = Boolean(options.isEquipped);
          const skillName = options.skillName || 'Habilidad';
          if (isEquipped && skillData?.id && this.getSkillCooldown(skillData.id) > 0) return;
          if (skillData?.id === 'itachi-kage-bunshin') {
            this.mp = Math.max(0, this.mp - mpCost);
            this.jutsuCD = 110;
            this.skillCooldowns[skillData.id] = Math.max(1, Math.round((skillData.cooldownSeconds || 20) * 60));
            this.spawnKageBunshin(skillData, target, skillName);
            this.flashTimer = 8;
            return;
          }
          if (isEquipped) this.placeForEquippedSkill(target);
          this.mp = Math.max(0, this.mp - mpCost);
          this.jutsuCD = isEquipped ? 120 : 90;
          if (isEquipped && skillData?.id) {
            this.skillCooldowns[skillData.id] = Math.max(1, Math.round((skillData.cooldownSeconds || 13) * 60));
          }
          const dx = target.cx - this.cx;
          const dy = target.cy - this.cy;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const spd = isEquipped ? 6.2 : 5;
          const projectile = new this.e.Jutsu(this.cx, this.cy, (dx / d) * spd, (dy / d) * spd, this, {
            isEquipped,
            skillName,
            skillData,
            target
          });
          this.e.jutsus.push(projectile);
          this.e.spawnSparks(this.cx, this.cy, 14, this.glowColor);
          this.e.triggerShake(6, 14);
          if (isEquipped) {
            this.tX = target.x;
            this.tY = this.e.GROUND - NH;
            this.e.beginCinematicSkill(this, skillName, projectile);
          }
          this.flashTimer = 8;
        }

        die() {
          if (this.isClone) {
            this.vanishClone();
            return;
          }
          this.isDead = true;
          this.e.slowMo = 0.16;
          this.e.gameOver = true;
          const winner = this.e.fighters.find((f) => !f.isDead);
          if (winner?.id === 0 && this.id === 1) {
            setTimeout(() => this.e.handleRoundVictory(), 1100);
            return;
          }
          setTimeout(() => this.e.resolveCompletion(winner ? winner.name : '???', false), 700);
        }

        update(dt, dms, enemy) {
          if (this.isDead) {
            this.deathT += dt;
            this.deathSmoke = Math.min(1, this.deathT * 0.09);
            if (this.deathT % 6 < 1) this.e.spawnSmoke(this.cx + (Math.random() - 0.5) * NW, this.cy + (Math.random() - 0.5) * NH, 3);
            return;
          }
          if (this.isClone && this.cloneLifetime > 0) {
            this.cloneLifetime -= dt;
            if (this.cloneLifetime <= 0) {
              this.vanishClone();
              return;
            }
          }
          if (this.e.hitStop > 0) return;

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
          Object.keys(this.skillCooldowns).forEach((skillId) => {
            this.skillCooldowns[skillId] = Math.max(0, this.skillCooldowns[skillId] - dt);
          });
          if (this.burn) {
            this.burn.tickTimer -= dt;
            if (this.burn.tickTimer <= 0) {
              const dotDamage = Math.max(1, this.maxHp * this.burn.percentPerSecond);
              this.hp = Math.max(0, this.hp - dotDamage);
              this.e.damageNums.push(new this.e.DamageNum(this.cx, this.y - 12, dotDamage, false));
              this.burn.ticksLeft -= 1;
              this.burn.tickTimer = 60;
              if (this.hp <= 0 && !this.isDead) this.die();
              if (this.burn.ticksLeft <= 0) this.burn = null;
            }
          }
          if (this.atkBuff) {
            this.atkBuff.timer -= dt;
            if (this.atkBuff.timer <= 0) this.atkBuff = null;
          }
          this.dmgBurstTimer += dms;
          if (this.dmgBurstTimer >= 2000) {
            this.dmgBurstTimer = 0;
            this.dmgBurst = 0;
          }

          if (!this.onGround) this.vy += G * dt;
          this.x += this.vx * dt;
          this.y += this.vy * dt;
          this.vx *= 0.87;
          if (this.y >= this.e.GROUND - NH) { this.y = this.e.GROUND - NH; this.vy = 0; this.onGround = true; } else this.onGround = false;
          if (this.y < 4) { this.y = 4; this.vy = 0; }
          if (this.skillLock) {
            this.x = this.skillLock.x;
            this.y = this.skillLock.y;
            this.vx = 0;
            this.vy = 0;
            return;
          }

          if (this.x <= 3) {
            this.x = 3;
            this.vx = 4.5;
            if (this.onGround) { this.vy = -9; this.onGround = false; }
          }
          if (this.x >= this.e.W - NW - 3) {
            this.x = this.e.W - NW - 3;
            this.vx = -4.5;
            if (this.onGround) { this.vy = -9; this.onGround = false; }
          }

          if (!enemy || enemy.isDead) return;
          this.facingRight = enemy.cx > this.cx;
          if (this.stunTimer > 0) return;

          this.dashTimer += dms;
          if (this.dashTimer >= this.dashInterval) {
            this.dashTimer = 0;
            const aerial = Math.random() < 0.38;
            this.tX = 22 + Math.random() * (this.e.W - 44 - NW);
            this.tY = aerial ? this.e.GROUND - NH - 55 - Math.random() * 130 : this.e.GROUND - NH;
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
          for (const t of this.trail) t.a -= 0.04 * dt;
          this.trail = this.trail.filter((t) => t.a > 0);

          if (!enemy.isDead) {
            const dist = Math.hypot(this.cx - enemy.cx, this.cy - enemy.cy);
            if (dist < 50 && this.atkCD <= 0) {
              const dmgPayload = this.e.calcDamage(this, enemy, 'basic');
              enemy.receiveHit(dmgPayload.damage, this.cx, this, dmgPayload.crit);
              this.atkCD = 42;
            } else if (dist > 150 && this.jutsuCD <= 0) {
              this.launchJutsu(enemy);
            }
          }
        }

        draw(ctx) {
          for (const t of this.trail) {
            ctx.save();
            ctx.globalAlpha = t.a * 0.45;
            ctx.fillStyle = this.glowColor;
            ctx.beginPath(); ctx.ellipse(t.x, t.y, NW * 0.38, NH * 0.38, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }

          const deadAlpha = this.isDead ? Math.max(0, 1 - this.deathSmoke) : 1;
          if (deadAlpha <= 0) return;

          if (this.drawSprite(ctx, deadAlpha)) {
            this.drawHPBar(ctx, deadAlpha);
            return;
          }

          const flashOn = this.flashTimer > 0 && Math.sin(this.flashTimer * 1.6) > 0;
          const bC = flashOn ? '#FF3333' : this.color;
          const sC = flashOn ? '#FF8866' : this.skinColor;

          ctx.save();
          ctx.globalAlpha = deadAlpha;
          if (!this.facingRight) {
            ctx.translate(this.x + NW / 2, 0); ctx.scale(-1, 1); ctx.translate(-(this.x + NW / 2), 0);
          }

          const x = this.x;
          const y = this.y;
          const lA = Math.sin(this.animF * Math.PI / 2) * 3;
          const jumping = !this.onGround;
          const sAlpha = Math.max(0, 0.4 - (this.e.GROUND - NH - this.y) * 0.006);

          ctx.globalAlpha = deadAlpha * sAlpha;
          ctx.fillStyle = 'rgba(0,0,0,.5)';
          ctx.beginPath(); ctx.ellipse(x + NW / 2, this.e.GROUND - 1, NW * 0.7, 4, 0, 0, Math.PI * 2); ctx.fill();

          ctx.globalAlpha = deadAlpha;
          ctx.fillStyle = '#222';
          ctx.fillRect(x + 1, y + NH - 5, NW * 0.42, 5);
          ctx.fillRect(x + NW * 0.55, y + NH - 5, NW * 0.42, 5);

          ctx.fillStyle = bC;
          ctx.fillRect(x + 2, y + NH * 0.62, NW * 0.4, NH * 0.36 + (jumping ? -lA : lA));
          ctx.fillRect(x + NW * 0.55, y + NH * 0.62, NW * 0.4, NH * 0.36 + (jumping ? lA : -lA));

          ctx.fillStyle = '#333';
          ctx.fillRect(x + 1, y + NH * 0.60, NW - 2, 3);
          ctx.fillStyle = bC;
          ctx.fillRect(x + 2, y + NH * 0.30, NW - 4, NH * 0.32);

          if (this.id === 0) {
            ctx.fillStyle = '#CC5500';
            ctx.fillRect(x + NW * 0.32, y + NH * 0.28, NW * 0.36, NH * 0.12);
          } else {
            ctx.fillStyle = '#3322AA';
            ctx.fillRect(x + NW * 0.32, y + NH * 0.28, NW * 0.36, NH * 0.12);
          }

          const aS = Math.cos(this.animF * Math.PI / 2) * 2;
          ctx.fillStyle = bC;
          ctx.fillRect(x - 4, y + NH * 0.32 + aS, 5, NH * 0.25);
          ctx.fillRect(x + NW - 1, y + NH * 0.32 - aS, 5, NH * 0.25);
          ctx.fillStyle = '#5A4030';
          ctx.fillRect(x - 4, y + NH * 0.50 + aS, 5, NH * 0.09);
          ctx.fillRect(x + NW - 1, y + NH * 0.50 - aS, 5, NH * 0.09);

          ctx.fillStyle = sC;
          ctx.fillRect(x + NW * 0.36, y + NH * 0.27, NW * 0.28, NH * 0.06);
          const hR = NW * 0.40;
          ctx.beginPath(); ctx.arc(x + NW / 2, y + NH * 0.155, hR, 0, Math.PI * 2); ctx.fill();

          if (this.id === 0) {
            ctx.fillStyle = '#FFD020';
            ctx.beginPath(); ctx.arc(x + NW / 2, y + NH * 0.10, hR, Math.PI, Math.PI * 2); ctx.fill();
            const spikes = [[-0.4, -7], [-0.1, -9], [0.2, -8], [0.5, -6]];
            for (const [ox, oy] of spikes) {
              ctx.beginPath();
              ctx.moveTo(x + NW * 0.25 + ox * NW * 0.5, y + NH * 0.08);
              ctx.lineTo(x + NW * 0.5 + ox * NW * 0.3, y + NH * 0.05 + oy);
              ctx.lineTo(x + NW * 0.65 + ox * NW * 0.3, y + NH * 0.09);
              ctx.closePath(); ctx.fill();
            }
          } else {
            ctx.fillStyle = '#111118';
            ctx.beginPath(); ctx.arc(x + NW / 2, y + NH * 0.10, hR, Math.PI, Math.PI * 2); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + NW * 0.15, y + NH * 0.07);
            ctx.quadraticCurveTo(x + NW * 0.75, y - 6, x + NW * 0.92, y + NH * 0.12);
            ctx.lineTo(x + NW / 2, y + NH * 0.07);
            ctx.closePath(); ctx.fill();
          }

          const hbCol = this.stunTimer > 0 || this.shieldBroken ? '#CC2222' : (this.id === 0 ? '#FF6600' : '#2233AA');
          ctx.fillStyle = hbCol;
          ctx.fillRect(x + NW * 0.10, y + NH * 0.07, NW * 0.80, 4);
          ctx.fillStyle = '#C8C8C8';
          ctx.fillRect(x + NW * 0.28, y + NH * 0.07, NW * 0.44, 4);
          ctx.strokeStyle = '#888';
          ctx.lineWidth = 0.6;
          ctx.strokeRect(x + NW * 0.28, y + NH * 0.07, NW * 0.44, 4);

          ctx.strokeStyle = '#999';
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(x + NW * 0.35, y + NH * 0.09); ctx.lineTo(x + NW * 0.65, y + NH * 0.09); ctx.stroke();
          ctx.fillStyle = '#111';
          ctx.beginPath(); ctx.arc(x + NW * 0.62, y + NH * 0.155, 2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#FFF';
          ctx.beginPath(); ctx.arc(x + NW * 0.635, y + NH * 0.150, 0.85, 0, Math.PI * 2); ctx.fill();

          if (this.id === 1 && this.jutsuCD < 25) {
            ctx.strokeStyle = 'rgba(220,0,0,.8)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(x + NW * 0.62, y + NH * 0.155, 2.3, 0, Math.PI * 2); ctx.stroke();
          }

          if (this.id === 0) {
            ctx.strokeStyle = '#C07848';
            ctx.lineWidth = 0.8;
            for (let j = 0; j < 3; j += 1) {
              ctx.beginPath();
              ctx.moveTo(x + NW * 0.54, y + NH * 0.155 + j * 2.4);
              ctx.lineTo(x + NW * 0.76, y + NH * 0.145 + j * 2.4 - 1);
              ctx.stroke();
            }
          }

          if (this.stunTimer > 8) {
            for (let i = 0; i < 3; i += 1) {
              const ang = this.e.frameN * 0.1 + i * Math.PI * 2 / 3;
              const sx = x + NW / 2 + Math.cos(ang) * (NW * 0.55 + 2);
              const sy = y - 4 + Math.sin(ang) * 4;
              ctx.fillStyle = '#FFD700';
              ctx.font = '8px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('★', sx, sy);
            }
          }

          if (this.defBreak) {
            ctx.globalAlpha = deadAlpha * 0.25;
            ctx.fillStyle = '#FF0000';
            ctx.beginPath(); ctx.arc(x + NW / 2, y + NH / 2, NW * 1.1, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = deadAlpha;
          }

          ctx.restore();
          this.drawHPBar(ctx, deadAlpha);
        }

        drawStatusEffects(ctx) {
          if (this.isDead || !this.burn) return;
          const cx = this.cx;
          const cy = this.cy;
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#ff2020';
          ctx.beginPath();
          ctx.arc(cx, cy, 35, 0, Math.PI * 2);
          ctx.fill();
          for (let i = 0; i < 12; i += 1) {
            const ang = (i / 12) * Math.PI * 2 + (this.e.frameN * 0.04);
            const radius = 8 + (i % 4) * 5;
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#ff4747';
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ang) * radius, cy + Math.sin(ang) * radius, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        drawSprite(ctx, deadAlpha = 1) {
          if (!this.spriteProfile?.image?.complete) return false;
          const image = this.spriteProfile.image;
          if (!image.naturalWidth || !image.naturalHeight) return false;

          const row = this.getSpriteRow();
          const frame = this.animF % (this.spriteProfile.framesPerRow || SPRITE_FRAMES);
          const sx = frame * this.spriteProfile.frameW;
          const sy = row * this.spriteProfile.frameH;

          ctx.save();
          ctx.globalAlpha = deadAlpha;
          if (!this.facingRight) {
            ctx.translate(this.x + NW / 2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(this.x + NW / 2), 0);
          }

          const shadowAlpha = Math.max(0, 0.35 - (this.e.GROUND - NH - this.y) * 0.005);
          ctx.globalAlpha = deadAlpha * shadowAlpha;
          ctx.fillStyle = 'rgba(0,0,0,.45)';
          ctx.beginPath();
          ctx.ellipse(this.x + NW / 2, this.e.GROUND - 1, NW * 0.7, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = deadAlpha;
          ctx.drawImage(
            image,
            sx,
            sy,
            this.spriteProfile.frameW,
            this.spriteProfile.frameH,
            this.x,
            this.y,
            NW,
            NH
          );
          ctx.restore();
          return true;
        }

        getSpriteRow() {
          if (this.stunTimer > 0 || this.flashTimer > 0) return 3; // hurt
          if (this.atkCD > 34 || this.jutsuCD > 86) return 2; // attack
          if (Math.abs(this.vx) + Math.abs(this.vy) > 1.2 || !this.onGround) return 1; // walk
          return 0; // idle
        }

        drawHPBar(ctx, alpha = 1) {
          const bW = 30;
          const bH = 4;
          const bx = this.x + NW / 2 - bW / 2;
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
          ctx.fillText(this.name, this.x + NW / 2, by - 3);
          ctx.restore();
        }
      };
    }
  }

  window.DRankBattleSystem = {
    engine: null,
    mount(rootEl, battleContext, onComplete) {
      if (!rootEl) return;
      if (!this.engine || this.engine.root !== rootEl) {
        if (this.engine) this.engine.destroy();
        this.engine = new DRankBattleEngine(rootEl);
      }
      this.engine.mountMission(battleContext, onComplete);
    },
    finishBattle() {
      if (!this.engine) return;
      this.engine.finishAndExit();
    },
    unmount() {
      if (!this.engine) return;
      this.engine.stop();
    }
  };
})();
