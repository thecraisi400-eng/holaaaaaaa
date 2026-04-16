(function () {
  const NAV_SECTIONS_THAT_CANCEL = new Set([
    'heroe', 'misiones', 'clanes', 'eventos', 'jutsus', 'batallas', 'invocaciones', 'habilidades', 'ajustes'
  ]);

  const HERO_STAT_KEYS = ['HP', 'MP', 'ATK', 'DEF', 'AGI', 'INT', 'CRT', 'CDMG', 'EVA', 'REGEN', 'RES', 'LCK'];
  const ENEMY_IMAGE_BY_INDEX = {
    0: 'assets/images/enemies/rank-d/mission-1.png',
    1: 'assets/images/enemies/rank-d/mission-2.png',
    2: 'assets/images/enemies/rank-d/mission-3.png',
    3: 'assets/images/enemies/rank-d/mission-4.png',
    4: 'assets/images/enemies/rank-d/mission-5.png',
    5: 'assets/images/enemies/rank-d/mission-6.png'
  };

  const BattleMissionRankD = {
    mounted: false,
    timerId: null,
    host: null,
    mission: null,
    refs: null,
    round: 1,
    playerCurrent: null,
    playerBase: null,
    enemyCurrent: null,

    mount({ host, mission, missionIndex, rank, missionLabel }) {
      if (!host || !mission) return false;
      this.stop('reset');
      this.host = host;
      this.mission = { ...mission, missionIndex, rank, missionLabel };
      this.round = 1;

      const heroSnapshot = window.GameState && typeof window.GameState.getHeroSnapshot === 'function'
        ? window.GameState.getHeroSnapshot()
        : null;
      if (!heroSnapshot?.stats) return false;

      this.playerBase = {
        name: heroSnapshot.name || 'HÉROE',
        level: heroSnapshot.level || 1,
        stats: HERO_STAT_KEYS.reduce((acc, key) => {
          acc[key] = Number(heroSnapshot.stats[key]) || 0;
          return acc;
        }, {})
      };

      const currentVitals = window.GameState && typeof window.GameState.getCurrentVitals === 'function'
        ? window.GameState.getCurrentVitals()
        : null;

      const playerMaxHp = Math.max(1, this.playerBase.stats.HP);
      const playerMaxMp = Math.max(1, this.playerBase.stats.MP);
      this.playerCurrent = {
        hp: Math.max(0, Math.min(currentVitals?.hp ?? playerMaxHp, playerMaxHp)),
        mp: Math.max(0, Math.min(currentVitals?.mp ?? playerMaxMp, playerMaxMp))
      };

      this.enemyCurrent = this.buildEnemyFromMission();
      this.render();
      this.bindEvents();
      this.updateUI();
      this.startLoop();
      this.mounted = true;
      return true;
    },

    buildEnemyFromMission() {
      return {
        hp: this.mission.hp,
        hpMax: this.mission.hp,
        atk: this.mission.atk,
        def: this.mission.def,
        name: this.mission.name
      };
    },

    bindEvents() {
      if (!this.refs) return;
      this.refs.cancelBtn.addEventListener('click', () => this.stop('cancelled'));

      this.onNavSelected = (event) => {
        const section = event?.detail?.section;
        if (NAV_SECTIONS_THAT_CANCEL.has(section)) {
          this.stop('cancelled');
        }
      };
      window.addEventListener('ngs:main-nav-selected', this.onNavSelected);
    },

    startLoop() {
      this.timerId = setInterval(() => this.tick(), 900);
    },

    tick() {
      if (!this.mounted) return;
      if (this.playerCurrent.hp <= 0) {
        this.log('❌ Derrota. Tu HP llegó a 0.');
        this.stop('defeated');
        return;
      }

      const heroDamage = this.rollDamage(this.playerBase.stats.ATK, this.enemyCurrent.def, this.playerBase.stats.CRT, this.playerBase.stats.CDMG);
      this.enemyCurrent.hp = Math.max(0, this.enemyCurrent.hp - heroDamage);
      this.log(`⚔️ Golpeas y causas ${heroDamage} de daño.`);
      this.updateUI();

      if (this.enemyCurrent.hp <= 0) {
        this.onEnemyDefeated();
        return;
      }

      const enemyDamage = this.rollDamage(this.enemyCurrent.atk, this.playerBase.stats.DEF, 0, 0);
      this.playerCurrent.hp = Math.max(0, this.playerCurrent.hp - enemyDamage);
      this.log(`🩸 ${this.enemyCurrent.name} te golpea por ${enemyDamage}.`);

      if (window.GameState && typeof window.GameState.applyBattleVitals === 'function') {
        window.GameState.applyBattleVitals({ hp: this.playerCurrent.hp, mp: this.playerCurrent.mp });
      }

      if (this.playerCurrent.hp <= 0) {
        this.log('❌ Derrota. Tu HP llegó a 0.');
        this.stop('defeated');
      }

      this.updateUI();
    },

    rollDamage(attackerAtk, defenderDef, critRate, critDamage) {
      const base = Math.max(1, Math.round(attackerAtk * (0.75 + Math.random() * 0.35)));
      const reduced = Math.max(1, Math.round(base - defenderDef * 0.45));
      const critChance = Math.max(0, Number(critRate) || 0) / 100;
      if (Math.random() < critChance) {
        return Math.max(1, Math.round(reduced * (1 + ((Number(critDamage) || 0) / 100))));
      }
      return reduced;
    },

    onEnemyDefeated() {
      if (window.GameState && typeof window.GameState.grantMissionRewards === 'function') {
        window.GameState.grantMissionRewards({ xp: this.mission.xp, gold: this.mission.gold });
      }

      this.log(`✅ Victoria. +${this.mission.xp} EXP y +${this.mission.gold} ORO.`);
      this.showNextRound();
    },

    showNextRound() {
      if (!this.refs?.nextRound) return;
      this.refs.nextRound.classList.add('show');
      setTimeout(() => {
        if (!this.mounted) return;
        this.refs.nextRound.classList.remove('show');
        this.round += 1;
        this.enemyCurrent = this.buildEnemyFromMission();
        this.log(`🔁 Ronda ${this.round}: vuelve ${this.enemyCurrent.name}.`);
        this.updateUI();
      }, 1200);
    },

    log(message) {
      if (!this.refs?.log) return;
      const line = document.createElement('div');
      line.textContent = message;
      this.refs.log.prepend(line);
      while (this.refs.log.children.length > 8) {
        this.refs.log.removeChild(this.refs.log.lastChild);
      }
    },

    updateUI() {
      if (!this.refs) return;
      const heroMaxHp = Math.max(1, this.playerBase.stats.HP);
      const heroMaxMp = Math.max(1, this.playerBase.stats.MP);
      const heroHpPct = Math.round((this.playerCurrent.hp / heroMaxHp) * 100);
      const heroMpPct = Math.round((this.playerCurrent.mp / heroMaxMp) * 100);
      const enemyHpPct = Math.round((this.enemyCurrent.hp / this.enemyCurrent.hpMax) * 100);

      this.refs.title.textContent = `BATALLA MISION RANGO D · RONDA ${this.round}`;
      this.refs.heroName.textContent = `${this.playerBase.name} · Nv.${this.playerBase.level}`;
      this.refs.heroHpFill.style.width = `${Math.max(0, heroHpPct)}%`;
      this.refs.heroMpFill.style.width = `${Math.max(0, heroMpPct)}%`;
      this.refs.heroHpText.textContent = `${this.playerCurrent.hp} / ${heroMaxHp}`;
      this.refs.heroMpText.textContent = `${this.playerCurrent.mp} / ${heroMaxMp}`;

      this.refs.enemyName.textContent = `${this.enemyCurrent.name}`;
      this.refs.enemyHpFill.style.width = `${Math.max(0, enemyHpPct)}%`;
      this.refs.enemyHpText.textContent = `${this.enemyCurrent.hp} / ${this.enemyCurrent.hpMax}`;
      this.refs.enemyStats.textContent = `ATK ${this.enemyCurrent.atk} · DEF ${this.enemyCurrent.def}`;
    },

    render() {
      const enemyImageSrc = ENEMY_IMAGE_BY_INDEX[this.mission.missionIndex] || '';
      this.host.innerHTML = `
        <div class="brd-root">
          <div class="brd-title" id="brdTitle">BATALLA MISION RANGO D</div>
          <div class="brd-arena">
            <div class="brd-fighter">
              <div class="brd-name" id="brdHeroName">HÉROE</div>
              <div class="brd-bar-track"><div id="brdHeroHpFill" class="brd-bar-fill brd-hp"></div></div>
              <div class="brd-stat" id="brdHeroHpText">0 / 0</div>
              <div class="brd-bar-track"><div id="brdHeroMpFill" class="brd-bar-fill brd-mp"></div></div>
              <div class="brd-stat" id="brdHeroMpText">0 / 0</div>
              <div class="brd-stats-grid" id="brdHeroStatsGrid"></div>
            </div>

            <div class="brd-fighter">
              <div class="brd-name" id="brdEnemyName">ENEMIGO</div>
              <div class="brd-bar-track"><div id="brdEnemyHpFill" class="brd-bar-fill brd-hp"></div></div>
              <div class="brd-stat" id="brdEnemyHpText">0 / 0</div>
              <div class="brd-stat" id="brdEnemyStats">ATK 0 · DEF 0</div>
              ${enemyImageSrc ? `<img src="${enemyImageSrc}" alt="enemigo" style="width:100%;height:112px;object-fit:contain;border:1px solid #334155;border-radius:8px;background:#0b1220;">` : ''}
            </div>

            <div class="brd-next-round" id="brdNextRound">PROXIMA RONDA</div>
          </div>
          <div class="brd-footer">
            <div class="brd-log" id="brdLog"></div>
            <button class="brd-cancel-btn" id="brdCancelBtn">CANCELAR BATALLA</button>
          </div>
        </div>
      `;

      this.refs = {
        title: this.host.querySelector('#brdTitle'),
        heroName: this.host.querySelector('#brdHeroName'),
        heroHpFill: this.host.querySelector('#brdHeroHpFill'),
        heroMpFill: this.host.querySelector('#brdHeroMpFill'),
        heroHpText: this.host.querySelector('#brdHeroHpText'),
        heroMpText: this.host.querySelector('#brdHeroMpText'),
        heroStatsGrid: this.host.querySelector('#brdHeroStatsGrid'),
        enemyName: this.host.querySelector('#brdEnemyName'),
        enemyHpFill: this.host.querySelector('#brdEnemyHpFill'),
        enemyHpText: this.host.querySelector('#brdEnemyHpText'),
        enemyStats: this.host.querySelector('#brdEnemyStats'),
        nextRound: this.host.querySelector('#brdNextRound'),
        log: this.host.querySelector('#brdLog'),
        cancelBtn: this.host.querySelector('#brdCancelBtn')
      };

      this.refs.heroStatsGrid.innerHTML = HERO_STAT_KEYS
        .map((key) => `<div class="brd-stat">${key}: ${this.playerBase.stats[key] ?? 0}</div>`)
        .join('');

      this.log(`🎯 Inicias ${this.mission.missionLabel}: ${this.mission.name}.`);
    },

    stop(reason = 'cancelled') {
      if (reason !== 'reset') {
        window.dispatchEvent(new CustomEvent('ngs:rank-d-battle-stopped', { detail: { reason } }));
      }
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      if (this.onNavSelected) {
        window.removeEventListener('ngs:main-nav-selected', this.onNavSelected);
        this.onNavSelected = null;
      }
      if (this.mounted && window.GameState && typeof window.GameState.applyBattleVitals === 'function') {
        window.GameState.applyBattleVitals({ hp: this.playerCurrent?.hp, mp: this.playerCurrent?.mp });
      }

      if (this.host && reason === 'cancelled') {
        this.host.innerHTML = '';
      }

      if (reason === 'defeated' && this.refs?.cancelBtn) {
        this.refs.cancelBtn.disabled = true;
        this.refs.cancelBtn.textContent = 'BATALLA FINALIZADA';
      }

      if (reason !== 'defeated') {
        this.refs = null;
        this.host = null;
        this.mission = null;
        this.playerCurrent = null;
        this.playerBase = null;
        this.enemyCurrent = null;
      }
      this.mounted = false;
    }
  };

  window.BattleMissionRankD = BattleMissionRankD;
})();
