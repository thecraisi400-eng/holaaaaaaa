(function () {
  const BattleStates = Object.freeze({
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    ENCOUNTER: 'ENCOUNTER',
    COMBAT: 'COMBAT',
    CANCELLED: 'CANCELLED',
    ROUND_COMPLETE: 'ROUND_COMPLETE'
  });

  const RESERVED_REGISTRY = Object.freeze({
    ids: ['brdBattleContainer', 'brdAttackBtn', 'brdAutoBtn', 'brdLog', 'brdProgressFill', 'brdProgressText', 'brdAssaultLabel', 'brdEnemyName', 'brdHeroStats', 'brdEnemyStats'],
    classes: ['brd-battle-container', 'brd-btn', 'brd-log'],
    globals: ['RangoDBattleSystem']
  });

  const RANGO_D_CATALOG = Object.freeze({
    D: {
      reward: { expBase: 4, expVar: 2, oroBase: 8, oroVar: 3 },
      missions: [
        { id: 'd-1', enemy: 'Bandido Sombra', hp: 138, mp: 30, atk: 14, def: 5, expBase: 4, oroBase: 8 },
        { id: 'd-2', enemy: 'Goblin Merodeador', hp: 175, mp: 36, atk: 16, def: 6, expBase: 8, oroBase: 15 },
        { id: 'd-3', enemy: 'Jabalí Alfa', hp: 215, mp: 20, atk: 18, def: 8, expBase: 15, oroBase: 22 },
        { id: 'd-4', enemy: 'Rata Colosal', hp: 258, mp: 35, atk: 21, def: 10, expBase: 23, oroBase: 35 },
        { id: 'd-5', enemy: 'Bandido de Ruta', hp: 305, mp: 40, atk: 24, def: 12, expBase: 35, oroBase: 50 },
        { id: 'd-6', enemy: 'Bestia Nocturna', hp: 385, mp: 50, atk: 28, def: 15, expBase: 45, oroBase: 75 }
      ]
    }
  });

  class RangoDBattleSystem {
    constructor() {
      this.state = BattleStates.IDLE;
      this.sessionId = 0;
      this.progress = 0;
      this.assaultCount = 1;
      this.autoMode = false;
      this.turnLocked = false;
      this.currentMission = null;
      this.enemy = null;
      this.playerActionQueue = [];
      this.processingQueue = false;
      this.deliveredRewards = new Set();
      this.timers = new Set();
      this.rafId = null;
      this.dom = {};
      this.logger = [];
    }

    registerReservedNames(root) {
      RESERVED_REGISTRY.ids.forEach((id) => {
        const found = root.querySelectorAll(`#${id}`);
        if (found.length > 1) {
          this.log(`Conflicto detectado para ID reservado: ${id}`);
        }
      });
    }

    mount(root) {
      if (!root) return false;
      this.registerReservedNames(root);
      this.dom.root = root;
      this.dom.container = root.querySelector('#brdBattleContainer');
      this.dom.attackBtn = root.querySelector('#brdAttackBtn');
      this.dom.autoBtn = root.querySelector('#brdAutoBtn');
      this.dom.log = root.querySelector('#brdLog');
      this.dom.progressFill = root.querySelector('#brdProgressFill');
      this.dom.progressText = root.querySelector('#brdProgressText');
      this.dom.assaultLabel = root.querySelector('#brdAssaultLabel');
      this.dom.enemyName = root.querySelector('#brdEnemyName');
      this.dom.heroStats = root.querySelector('#brdHeroStats');
      this.dom.enemyStats = root.querySelector('#brdEnemyStats');
      if (!this.dom.container || !this.dom.attackBtn || !this.dom.autoBtn) return false;

      this.dom.attackBtn.onclick = () => this.enqueuePlayerAction({ type: 'attack' });
      this.dom.autoBtn.onclick = () => this.toggleAuto();
      return true;
    }

    startMission(mission, options = {}) {
      if (!mission || !this.validateStart(mission)) return false;
      this.cancelAll();
      this.sessionId += 1;
      this.currentMission = mission;
      this.progress = 0;
      this.state = BattleStates.RUNNING;
      this.autoMode = false;
      this.turnLocked = false;
      this.playerActionQueue = [];
      this.processingQueue = false;
      this.assaultCount = options.keepAssault ? this.assaultCount : 1;
      this.deliveredRewards.clear();
      this.renderVisibility(true);
      this.renderPlayerStats();
      this.log(`Inicio misión: ${mission.name}`);
      this.startProgressLoop(this.sessionId);
      return true;
    }

    validateStart(mission) {
      const hero = window.CharacterStatsSystem?.getActiveHero?.();
      if (!this.dom.container) return false;
      if (!hero || !hero.stats) return false;
      if (!Number.isFinite(hero.stats.HP) || !Number.isFinite(hero.stats.MP)) return false;
      return mission && Number.isFinite(mission.hp) && Number.isFinite(mission.atk);
    }

    renderVisibility(show) {
      if (!this.dom.container) return;
      this.dom.container.classList.toggle('brd-visible', Boolean(show));
      this.dom.container.setAttribute('aria-hidden', show ? 'false' : 'true');
    }

    startProgressLoop(sessionId) {
      const tick = () => {
        if (sessionId !== this.sessionId || this.state === BattleStates.CANCELLED || this.state === BattleStates.IDLE) return;
        if (this.state === BattleStates.RUNNING) {
          this.progress = Math.min(100, this.progress + 0.45);
          this.renderProgress();
          if (this.progress >= 100) {
            this.state = BattleStates.ROUND_COMPLETE;
            this.assaultCount += 1;
            this.progress = 0;
            this.log(`Asalto completado. ${this.assaultCount} Asalto`);
            this.state = BattleStates.RUNNING;
          }
          if (this.shouldEncounter()) {
            this.beginEncounter(sessionId);
          }
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    }

    shouldEncounter() {
      const marks = [30, 60, 90];
      return marks.some((m) => Math.abs(this.progress - m) < 0.3);
    }

    beginEncounter(sessionId) {
      if (this.state !== BattleStates.RUNNING) return;
      this.state = BattleStates.ENCOUNTER;
      this.enemy = {
        id: `${this.currentMission.id}-a${this.assaultCount}-p${Math.floor(this.progress)}`,
        name: this.currentMission.enemy,
        hp: this.currentMission.hp,
        hpMax: this.currentMission.hp,
        mp: this.currentMission.mp || 0,
        mpMax: this.currentMission.mp || 0,
        atk: this.currentMission.atk,
        def: this.currentMission.def
      };
      this.renderEnemyStats();
      this.log(`Encuentro: ${this.enemy.name}`);
      this.safeTimeout(() => {
        if (sessionId !== this.sessionId) return;
        this.state = BattleStates.COMBAT;
        if (this.autoMode) this.enqueuePlayerAction({ type: 'attack' });
      }, 350);
    }

    enqueuePlayerAction(action) {
      if (this.state !== BattleStates.COMBAT) return;
      if (!action || this.turnLocked) return;
      this.playerActionQueue.push(action);
      this.processQueue();
    }

    processQueue() {
      if (this.processingQueue || this.turnLocked || this.state !== BattleStates.COMBAT) return;
      const action = this.playerActionQueue.shift();
      if (!action) return;
      this.processingQueue = true;
      this.turnLocked = true;

      this.executePlayerAttack();
      this.safeTimeout(() => {
        if (this.state !== BattleStates.COMBAT) return;
        if (this.enemy.hp > 0) {
          this.executeEnemyAttack();
        }
        this.turnLocked = false;
        this.processingQueue = false;
        if (this.autoMode && this.state === BattleStates.COMBAT) this.enqueuePlayerAction({ type: 'attack' });
      }, 450);
    }

    executePlayerAttack() {
      const hero = this.getHeroCombatStats();
      const damage = this.clamp(Math.round(hero.atk - this.enemy.def * 0.25 + (Math.random() * 5 - 2)), 1, 999999);
      this.enemy.hp = this.clamp(this.enemy.hp - damage, 0, this.enemy.hpMax);
      this.log(`Golpeas por ${damage}.`);
      this.renderEnemyStats();
      if (this.enemy.hp <= 0) {
        this.commitRewards();
        this.state = BattleStates.RUNNING;
      }
    }

    executeEnemyAttack() {
      if (this.state !== BattleStates.COMBAT) return;
      const hero = this.getHeroCombatStats();
      const damage = this.clamp(Math.round(this.enemy.atk - hero.def * 0.2 + (Math.random() * 4 - 2)), 1, 999999);
      const nextHp = this.clamp(hero.hp - damage, 0, hero.hpMax);
      this.commitHeroResources({ hp: nextHp, mp: hero.mp });
      this.log(`${this.enemy.name} golpea por ${damage}.`);
      this.renderPlayerStats();
      if (nextHp <= 0) {
        this.log('Derrota del héroe.');
        this.cancelAll();
      }
    }

    getHeroCombatStats() {
      const hero = window.CharacterStatsSystem?.getActiveHero?.();
      const stats = hero?.stats || {};
      const combat = hero?.combat || {};
      return {
        hpMax: Number(stats.HP) || 1,
        mpMax: Number(stats.MP) || 1,
        hp: this.clamp(Number(combat.hp ?? stats.HP) || 0, 0, Number(stats.HP) || 1),
        mp: this.clamp(Number(combat.mp ?? stats.MP) || 0, 0, Number(stats.MP) || 1),
        atk: Number(stats.ATK) || 1,
        def: Number(stats.DEF) || 0
      };
    }

    commitHeroResources(resources) {
      const hero = window.CharacterStatsSystem?.getActiveHero?.();
      if (!hero) return;
      hero.combat = hero.combat || {};
      hero.combat.hp = this.clamp(resources.hp, 0, Number(hero.stats.HP) || 1);
      hero.combat.mp = this.clamp(resources.mp, 0, Number(hero.stats.MP) || 1);
      window.CharacterStatsSystem?.setActiveHero?.(hero);
      window.dispatchEvent(new CustomEvent('ngs:hero-combat-resource-updated', {
        detail: { hp: hero.combat.hp, hpMax: hero.stats.HP, mp: hero.combat.mp, mpMax: hero.stats.MP }
      }));
    }

    commitRewards() {
      if (!this.enemy || this.deliveredRewards.has(this.enemy.id)) return;
      this.deliveredRewards.add(this.enemy.id);
      const reward = this.calcReward(this.currentMission);
      const hero = window.CharacterStatsSystem?.getActiveHero?.();
      if (hero) {
        hero.exp = (Number(hero.exp) || 0) + reward.exp;
        window.CharacterStatsSystem?.setActiveHero?.(hero);
      }
      if (window.GameState?.getGold && window.GameState?.setGold) {
        window.GameState.setGold(window.GameState.getGold() + reward.gold);
      }
      this.log(`Victoria: +${reward.exp} EXP, +${reward.gold} Oro`);
    }

    calcReward(mission) {
      const expVar = Math.floor(Math.random() * 3);
      const goldVar = Math.floor(Math.random() * 4);
      return {
        exp: Math.max(1, (mission.expBase || RANGO_D_CATALOG.D.reward.expBase) + expVar),
        gold: Math.max(1, (mission.oroBase || RANGO_D_CATALOG.D.reward.oroBase) + goldVar)
      };
    }

    toggleAuto() {
      this.autoMode = !this.autoMode;
      if (this.dom.autoBtn) this.dom.autoBtn.textContent = this.autoMode ? 'AUTO: ON' : 'AUTO: OFF';
      if (this.autoMode && this.state === BattleStates.COMBAT) this.enqueuePlayerAction({ type: 'attack' });
    }

    renderProgress() {
      if (this.dom.progressFill) this.dom.progressFill.style.width = `${Math.round(this.progress)}%`;
      if (this.dom.progressText) this.dom.progressText.textContent = `${Math.round(this.progress)}%`;
      if (this.dom.assaultLabel) this.dom.assaultLabel.textContent = `${this.assaultCount} Asalto`;
    }

    renderPlayerStats() {
      const hero = this.getHeroCombatStats();
      if (!this.dom.heroStats) return;
      this.dom.heroStats.innerHTML = `HP ${hero.hp}/${hero.hpMax}<br>MP ${hero.mp}/${hero.mpMax}<br>ATK ${hero.atk} / DEF ${hero.def}`;
    }

    renderEnemyStats() {
      if (!this.enemy || !this.dom.enemyStats) return;
      if (this.dom.enemyName) this.dom.enemyName.textContent = this.enemy.name;
      this.dom.enemyStats.innerHTML = `HP ${this.enemy.hp}/${this.enemy.hpMax}<br>MP ${this.enemy.mp}/${this.enemy.mpMax}<br>ATK ${this.enemy.atk} / DEF ${this.enemy.def}`;
    }

    safeTimeout(fn, ms) {
      const id = setTimeout(() => {
        this.timers.delete(id);
        fn();
      }, ms);
      this.timers.add(id);
    }

    stopAllAsync() {
      this.timers.forEach((id) => clearTimeout(id));
      this.timers.clear();
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.playerActionQueue = [];
      this.processingQueue = false;
      this.turnLocked = false;
    }

    cancelAll() {
      this.state = BattleStates.CANCELLED;
      this.stopAllAsync();
      this.autoMode = false;
      if (this.dom.autoBtn) this.dom.autoBtn.textContent = 'AUTO: OFF';
      this.log('Sistema cancelado por navegación principal.');
      this.renderVisibility(false);
      this.enemy = null;
      this.currentMission = null;
      this.state = BattleStates.IDLE;
    }

    log(message) {
      this.logger.push({ at: Date.now(), message });
      if (this.dom.log) this.dom.log.textContent = message;
    }

    clamp(value, min, max) {
      return Math.max(min, Math.min(max, Number(value) || 0));
    }
  }

  window.RANGO_D_CATALOG = RANGO_D_CATALOG;
  window.RangoDBattleSystem = new RangoDBattleSystem();
})();
