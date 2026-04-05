(() => {
  function resolveEnemyEmoji(name) {
    const n = String(name || '').toLowerCase();
    if (n.includes('lobo')) return '🐺';
    if (n.includes('dragón') || n.includes('dragon')) return '🐉';
    if (n.includes('demonio')) return '👿';
    if (n.includes('ogro') || n.includes('troll')) return '👹';
    if (n.includes('araña') || n.includes('arácnido')) return '🕷️';
    if (n.includes('esqueleto')) return '💀';
    if (n.includes('bandido') || n.includes('merodeador')) return '⚔️';
    if (n.includes('rata')) return '🐀';
    if (n.includes('jabalí')) return '🐗';
    if (n.includes('grifo')) return '🦅';
    if (n.includes('caballero')) return '⚔️';
    if (n.includes('titán')) return '🗿';
    if (n.includes('dios')) return '👑';
    return '👹';
  }

  function createCombatEngine(config) {
    const {
      getPlayerStats,
      onBars,
      onLog,
      onEnemy,
      onRewards,
      onDefeat,
      onPlayerAttack
    } = config;

    const HERO_CONFIG = {
      chakraMax: 100,
      critChance: 0.15,
      critMulti: 2,
      kawarimiChance: 0.12,
      attackInterval: 1800,
      speed: 1,
      jutsuList: [
        { name: 'Rasengan', dmgMulti: 2.5 },
        { name: 'Katon: Gōkakyū no Jutsu', dmgMulti: 3.0 },
        { name: 'Shadow Clone Barrage', dmgMulti: 2.0 },
        { name: 'Rasenshuriken', dmgMulti: 3.5 }
      ]
    };

    let rafId = null;
    let battleActive = false;
    let battleSequence = 0;
    let enemyIndex = 0;
    let currentEnemy = null;
    let currentMissionList = [];
    let settings = {};
    let heroAttackTimer = 0;
    let enemyAttackTimer = 0;
    let lastFrameTime = 0;
    let chakra = HERO_CONFIG.chakraMax;
    let busy = false;

    function wait(ms) {
      return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function calculateDamage(attacker, defender, isCrit = false, multi = 1) {
      const base = Math.max(1, (Number(attacker.atk) || 1) * multi);
      const variance = 0.85 + Math.random() * 0.3;
      const defReduction = (Number(defender.def) || 0) * 0.3;
      let dmg = Math.max(1, (base * variance) - defReduction);
      if (isCrit) dmg *= HERO_CONFIG.critMulti;
      return Math.floor(dmg);
    }

    function updateBars() {
      if (!currentEnemy) return;
      onBars(getPlayerStats(), currentEnemy);
    }

    function setTurnIndicator(text) {
      const el = document.getElementById('turn-indicator');
      if (el) el.textContent = text;
    }

    function shake(targetId = 'game-container', cls = 'shake') {
      const el = document.getElementById(targetId);
      if (!el) return;
      el.classList.add(cls);
      window.setTimeout(() => el.classList.remove(cls), 300);
    }

    function flash(targetId) {
      const el = document.getElementById(targetId);
      if (!el) return;
      el.classList.add('hit-flash');
      window.setTimeout(() => el.classList.remove('hit-flash'), 150);
    }

    function loadEnemy(index) {
      const mission = currentMissionList[index];
      currentEnemy = {
        name: mission.name,
        hp: mission.hp,
        maxHp: mission.hp,
        atk: mission.atk,
        def: mission.def,
        xp: mission.xp,
        gold: mission.gold
      };
      heroAttackTimer = 0;
      enemyAttackTimer = 0;
      onEnemy(currentEnemy, resolveEnemyEmoji(mission.name));
      updateBars();
      setTurnIndicator(`⚔ ${currentEnemy.name}`);
      onLog(`⚔ Combate iniciado contra ${currentEnemy.name}`);
    }

    async function heroAttack(seq) {
      if (!battleActive || busy || seq !== battleSequence) return;
      busy = true;
      const hero = document.getElementById('hero');
      if (hero) hero.style.transform = 'translateX(110px)';
      await wait(120);

      const isCrit = Math.random() < HERO_CONFIG.critChance;
      const dmg = calculateDamage(getPlayerStats(), currentEnemy, isCrit, 1);
      currentEnemy.hp = Math.max(0, currentEnemy.hp - dmg);
      flash('enemy');
      shake('game-container', isCrit ? 'shake-crit' : 'shake');
      onLog(`${getPlayerStats().name || 'Héroe'} golpea por ${dmg}${isCrit ? ' (CRÍTICO)' : ''}`);
      if (typeof onPlayerAttack === 'function') onPlayerAttack();
      updateBars();

      await wait(120);
      if (hero) hero.style.transform = 'translateX(0)';
      busy = false;

      if (currentEnemy.hp <= 0) {
        await enemyDefeated(seq);
      }
    }

    async function executeJutsu(seq) {
      if (!battleActive || busy || seq !== battleSequence) return;
      busy = true;
      const jutsu = HERO_CONFIG.jutsuList[Math.floor(Math.random() * HERO_CONFIG.jutsuList.length)];
      setTurnIndicator(`🌀 ${jutsu.name}`);
      onLog(`🌀 ${jutsu.name}`);
      await wait(250);

      const dmg = calculateDamage(getPlayerStats(), currentEnemy, false, jutsu.dmgMulti);
      currentEnemy.hp = Math.max(0, currentEnemy.hp - dmg);
      flash('enemy');
      shake('game-container', 'shake-crit');
      onLog(`✨ ${jutsu.name} inflige ${dmg} de daño`);
      chakra = 0;
      updateBars();
      await wait(320);
      setTurnIndicator(`⚔ ${currentEnemy.name}`);
      busy = false;

      if (currentEnemy.hp <= 0) {
        await enemyDefeated(seq);
      }
    }

    async function enemyAttack(seq) {
      if (!battleActive || busy || seq !== battleSequence) return;
      busy = true;

      if (Math.random() < HERO_CONFIG.kawarimiChance) {
        onLog('💨 Kawarimi no Jutsu: ¡esquiva perfecta!');
        await wait(180);
        busy = false;
        return;
      }

      const enemy = document.getElementById('enemy');
      if (enemy) enemy.style.transform = 'translateX(-100px)';
      await wait(120);
      const player = getPlayerStats();
      const dmg = calculateDamage(currentEnemy, player);
      player.hp = Math.max(0, player.hp - dmg);
      flash('hero');
      shake('game-container', 'shake');
      onLog(`${currentEnemy.name} inflige ${dmg} de daño`);
      updateBars();
      await wait(100);
      if (enemy) enemy.style.transform = 'translateX(0)';
      busy = false;

      if (player.hp <= 0) {
        heroDefeated(seq);
      }
    }

    async function enemyDefeated(seq) {
      if (!battleActive || seq !== battleSequence) return;
      battleActive = false;
      setTurnIndicator('🏆 ¡Victoria!');
      onLog(`🏆 ${currentEnemy.name} ha sido derrotado`);
      const rewards = { xp: currentEnemy.xp, gold: currentEnemy.gold };
      onRewards(rewards);

      if (settings.continueOnWin !== false && enemyIndex < currentMissionList.length - 1) {
        await wait(500);
        if (seq !== battleSequence) return;
        enemyIndex += 1;
        battleActive = true;
        loadEnemy(enemyIndex);
        return;
      }

      if (typeof settings.onVictory === 'function') {
        settings.onVictory({ rewards, enemy: currentEnemy, index: enemyIndex });
      }
    }

    function heroDefeated(seq) {
      if (!battleActive || seq !== battleSequence) return;
      battleActive = false;
      setTurnIndicator('💀 Derrota...');
      onLog('💀 Has caído en combate');
      if (typeof settings.onDefeat === 'function') settings.onDefeat();
      onDefeat();
    }

    function tick(timestamp) {
      if (!battleActive) return;
      if (!lastFrameTime) lastFrameTime = timestamp;
      const delta = timestamp - lastFrameTime;
      lastFrameTime = timestamp;

      heroAttackTimer += delta;
      enemyAttackTimer += delta;

      const heroCd = HERO_CONFIG.attackInterval / HERO_CONFIG.speed;
      const enemyCd = 2400 / 0.8;
      const seq = battleSequence;

      if (heroAttackTimer >= heroCd) {
        heroAttackTimer = 0;
        if (chakra >= HERO_CONFIG.chakraMax) {
          executeJutsu(seq);
        } else {
          heroAttack(seq);
        }
      }

      if (enemyAttackTimer >= enemyCd) {
        enemyAttackTimer = 0;
        enemyAttack(seq);
      }

      rafId = window.requestAnimationFrame(tick);
    }

    function start(missions, missionIndex, options = {}) {
      stop();
      currentMissionList = missions || [];
      if (!currentMissionList.length) return;
      settings = {
        continueOnWin: options.continueOnWin !== false,
        onVictory: typeof options.onVictory === 'function' ? options.onVictory : null,
        onDefeat: typeof options.onDefeat === 'function' ? options.onDefeat : null
      };
      enemyIndex = Math.max(0, missionIndex || 0);
      chakra = HERO_CONFIG.chakraMax;
      busy = false;
      battleSequence += 1;
      lastFrameTime = 0;
      battleActive = true;
      loadEnemy(enemyIndex);
      updateBars();
      rafId = window.requestAnimationFrame(tick);
    }

    function stop() {
      battleActive = false;
      busy = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      battleSequence += 1;
      setTurnIndicator('⚔ Combate detenido');
    }

    return {
      start,
      stop,
      isActive() {
        return battleActive;
      }
    };
  }

  window.createMisionesRangoCombat = createCombatEngine;
})();
