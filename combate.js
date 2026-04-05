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
      chakraRate: 0,
      jutsuList: [
        { name: 'Rasengan', kanji: '螺', dmgMulti: 2.5, color: '#40C4FF', type: 'rasengan' },
        { name: 'Katon: Gōkakyū no Jutsu', kanji: '火', dmgMulti: 3.0, color: '#FF6B00', type: 'katon' },
        { name: 'Shadow Clone Barrage', kanji: '影', dmgMulti: 2.0, color: '#CE93D8', type: 'rasengan' },
        { name: 'Rasenshuriken', kanji: '風', dmgMulti: 3.5, color: '#69F0AE', type: 'rasengan' }
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
    let isHeroAttacking = false;
    let isEnemyAttacking = false;
    let isJutsuActive = false;

    function wait(ms) {
      return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function randInt(min, max) {
      return Math.floor(rand(min, max + 1));
    }

    function calculateDamage(attacker, defender, isCrit = false, multi = 1) {
      const base = Math.max(1, (Number(attacker.atk) || 1) * multi);
      const variance = 0.85 + Math.random() * 0.3;
      const defReduction = (Number(defender.def) || 0) * 0.3;
      let dmg = Math.max(1, (base * variance) - defReduction);
      if (isCrit) dmg *= HERO_CONFIG.critMulti;
      return Math.floor(dmg);
    }

    function setTurnIndicator(text) {
      const el = document.getElementById('turn-indicator');
      if (el) el.textContent = text;
    }

    function updateLog(line1, line2) {
      if (typeof onLog === 'function') onLog(line1, line2);
    }

    function syncPlayerChakra() {
      const player = getPlayerStats();
      if (!player) return;
      const maxMp = Math.max(1, Number(player.maxMp) || HERO_CONFIG.chakraMax);
      chakra = Math.max(0, Math.min(HERO_CONFIG.chakraMax, chakra));
      player.mp = Math.round((chakra / HERO_CONFIG.chakraMax) * maxMp);
    }

    function updateBars() {
      if (!currentEnemy) return;
      syncPlayerChakra();
      onBars(getPlayerStats(), currentEnemy);
      const heroEl = document.getElementById('hero');
      if (heroEl) heroEl.classList.toggle('chakra-ready', chakra >= HERO_CONFIG.chakraMax);
    }

    function clearTransientEffects() {
      const container = document.getElementById('game-container');
      if (!container) return;
      const nodes = container.querySelectorAll('.combat-text,.particle,.dash-trail,.speed-line,.projectile,.explosion');
      nodes.forEach((n) => n.remove());
      const kawarimi = document.getElementById('kawarimi-log');
      if (kawarimi) kawarimi.classList.remove('active');
      const overlay = document.getElementById('jutsu-overlay');
      if (overlay) overlay.classList.remove('active');
    }

    function screenShake(intensity = 'normal') {
      const container = document.getElementById('game-container');
      if (!container) return;
      const cls = intensity === 'critical' ? 'shake-crit' : 'shake';
      container.classList.add(cls);
      window.setTimeout(() => container.classList.remove(cls), intensity === 'critical' ? 400 : 300);
    }

    function hitFlash(targetId) {
      const el = document.getElementById(targetId);
      if (!el) return;
      el.classList.add('hit-flash');
      window.setTimeout(() => el.classList.remove('hit-flash'), 150);
    }

    function spawnCombatText(targetId, value, type = 'normal') {
      const container = document.getElementById('game-container');
      const target = document.getElementById(targetId);
      if (!container || !target) return;
      const txt = document.createElement('div');
      txt.className = `combat-text ${type}`;
      txt.textContent = `-${value}`;
      const rect = target.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      txt.style.left = `${rect.left - cRect.left + rect.width / 2 + rand(-15, 15)}px`;
      txt.style.top = `${rect.top - cRect.top + rand(-10, 10)}px`;
      container.appendChild(txt);
      window.setTimeout(() => txt.remove(), 1200);
    }

    function spawnImpactParticles(x, y, color = '#FFD600', count = 8) {
      const container = document.getElementById('game-container');
      if (!container) return;
      for (let i = 0; i < count; i += 1) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.background = color;
        const angle = (Math.PI * 2 * i) / count;
        const dist = rand(15, 40);
        p.style.setProperty('--px', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--py', `${Math.sin(angle) * dist}px`);
        container.appendChild(p);
        window.setTimeout(() => p.remove(), 600);
      }
    }

    function spawnDashTrail(character, direction) {
      const container = document.getElementById('game-container');
      const charEl = document.getElementById(character);
      if (!container || !charEl) return;
      const trail = document.createElement('div');
      trail.className = `dash-trail ${character}-trail`;
      const rect = charEl.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      trail.style.left = `${rect.left - cRect.left + (direction === 'right' ? 0 : rect.width)}px`;
      trail.style.bottom = `${container.offsetHeight - rect.bottom}px`;
      container.appendChild(trail);
      window.setTimeout(() => trail.remove(), 300);
    }

    function spawnSpeedLines(fromX, toX, y, color = 'rgba(255,255,255,0.3)') {
      const container = document.getElementById('game-container');
      if (!container) return;
      for (let i = 0; i < 3; i += 1) {
        const line = document.createElement('div');
        line.className = 'speed-line';
        line.style.left = `${Math.min(fromX, toX)}px`;
        line.style.top = `${y + rand(-15, 15)}px`;
        line.style.width = `${Math.abs(toX - fromX)}px`;
        line.style.background = `linear-gradient(90deg, transparent, ${color}, transparent)`;
        container.appendChild(line);
        window.setTimeout(() => line.remove(), 250);
      }
    }

    function triggerKawarimi() {
      const hero = document.getElementById('hero');
      const kawarimi = document.getElementById('kawarimi-log');
      const container = document.getElementById('game-container');
      if (!hero || !kawarimi || !container) return;
      const heroRect = hero.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      kawarimi.style.left = `${heroRect.left - cRect.left + heroRect.width / 2 - 15}px`;
      kawarimi.classList.add('active');
      hero.classList.add('hero-dodging');
      window.setTimeout(() => {
        kawarimi.classList.remove('active');
        hero.classList.remove('hero-dodging');
      }, 220);
    }

    function spawnExplosion(x, y, color = '#40C4FF') {
      const container = document.getElementById('game-container');
      if (!container) return;
      const exp = document.createElement('div');
      exp.className = 'explosion';
      exp.style.left = `${x}px`;
      exp.style.top = `${y}px`;
      for (let i = 0; i < 3; i += 1) {
        const ring = document.createElement('div');
        ring.className = 'explosion-ring';
        ring.style.borderColor = color;
        ring.style.animationDelay = `${i * 0.1}s`;
        exp.appendChild(ring);
      }
      container.appendChild(exp);
      window.setTimeout(() => exp.remove(), 700);
    }

    function showJutsuOverlay(jutsu) {
      return new Promise((resolve) => {
        const overlay = document.getElementById('jutsu-overlay');
        const nameEl = document.getElementById('jutsu-name');
        const kanjiEl = document.getElementById('jutsu-kanji');
        if (!overlay || !nameEl || !kanjiEl) {
          resolve();
          return;
        }
        kanjiEl.textContent = jutsu.kanji;
        nameEl.textContent = jutsu.name;
        nameEl.style.color = jutsu.color;
        nameEl.style.textShadow = `0 0 10px ${jutsu.color}, 0 0 20px ${jutsu.color}, 2px 2px 0 #000`;
        overlay.classList.add('active');
        window.setTimeout(() => {
          overlay.classList.remove('active');
          resolve();
        }, 900);
      });
    }

    function animateProjectile(fromEl, toEl, type, color) {
      return new Promise((resolve) => {
        const container = document.getElementById('game-container');
        if (!container || !fromEl || !toEl) {
          resolve();
          return;
        }
        const proj = document.createElement('div');
        proj.className = `projectile projectile-${type}`;
        if (type === 'katon') {
          proj.style.background = `radial-gradient(circle, #fff, ${color}, transparent)`;
        }

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        const startX = fromRect.left - cRect.left + fromRect.width / 2 - 12;
        const startY = fromRect.top - cRect.top + fromRect.height / 2 - 12;
        const endX = toRect.left - cRect.left + toRect.width / 2 - 15;
        const endY = toRect.top - cRect.top + toRect.height / 2 - 15;

        proj.style.left = `${startX}px`;
        proj.style.top = `${startY}px`;
        container.appendChild(proj);

        let progress = 0;
        const speed = 0.06;

        function frame() {
          progress += speed;
          if (progress >= 1) {
            proj.remove();
            resolve();
            return;
          }
          const arc = Math.sin(progress * Math.PI) * -40;
          const x = startX + (endX - startX) * progress;
          const y = startY + (endY - startY) * progress + arc;
          proj.style.left = `${x}px`;
          proj.style.top = `${y}px`;
          proj.style.transform = `scale(${0.8 + progress * 0.4})`;
          window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
      });
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
      updateLog(`⚔ Combate iniciado contra <span class="highlight">${currentEnemy.name}</span>`, '');
    }

    async function heroAttack(seq) {
      if (!battleActive || isHeroAttacking || isEnemyAttacking || isJutsuActive || seq !== battleSequence) return;
      isHeroAttacking = true;

      const hero = document.getElementById('hero');
      const enemy = document.getElementById('enemy');
      const container = document.getElementById('game-container');
      const heroRect = hero ? hero.getBoundingClientRect() : null;
      const cRect = container ? container.getBoundingClientRect() : null;

      if (hero) {
        hero.style.transform = `translateX(${rand(100, 120)}px)`;
        spawnDashTrail('hero', 'right');
        if (heroRect && cRect) {
          spawnSpeedLines(heroRect.left - cRect.left, heroRect.left - cRect.left + 110, heroRect.top - cRect.top + 35, 'rgba(255, 107, 0, 0.4)');
        }
      }

      await wait(120);
      const isCrit = Math.random() < HERO_CONFIG.critChance;
      const dmg = calculateDamage(getPlayerStats(), currentEnemy, isCrit);
      currentEnemy.hp = Math.max(0, currentEnemy.hp - dmg);

      hitFlash('enemy');
      spawnCombatText('enemy', dmg, isCrit ? 'critical' : 'normal');
      if (enemy && container) {
        const enemyRect = enemy.getBoundingClientRect();
        spawnImpactParticles(enemyRect.left - cRect.left + enemyRect.width / 2, enemyRect.top - cRect.top + enemyRect.height / 3, isCrit ? '#FF1744' : '#FFD600', isCrit ? 14 : 8);
      }
      screenShake(isCrit ? 'critical' : 'normal');
      updateBars();
      updateLog(`${getPlayerStats().name || 'Héroe'} ataca — <span class="dmg">-${dmg} Daño</span>${isCrit ? ' <span class="dmg">¡CRÍTICO!</span>' : ''}`);
      if (typeof onPlayerAttack === 'function') onPlayerAttack();

      await wait(80);
      if (hero) hero.style.transform = 'translateX(0)';
      await wait(200);
      isHeroAttacking = false;

      if (currentEnemy.hp <= 0) {
        await enemyDefeated(seq);
      }
    }

    async function executeJutsu(seq) {
      if (!battleActive || isHeroAttacking || isEnemyAttacking || isJutsuActive || seq !== battleSequence) return;
      isJutsuActive = true;

      const jutsu = HERO_CONFIG.jutsuList[randInt(0, HERO_CONFIG.jutsuList.length - 1)];
      const hero = document.getElementById('hero');
      const enemy = document.getElementById('enemy');

      setTurnIndicator(`🌀 ${jutsu.name}`);
      await showJutsuOverlay(jutsu);
      await animateProjectile(hero, enemy, jutsu.type, jutsu.color);

      const dmg = calculateDamage(getPlayerStats(), currentEnemy, false, jutsu.dmgMulti);
      currentEnemy.hp = Math.max(0, currentEnemy.hp - dmg);
      hitFlash('enemy');
      spawnCombatText('enemy', dmg, 'jutsu-dmg');

      if (enemy) {
        const container = document.getElementById('game-container');
        if (container) {
          const enemyRect = enemy.getBoundingClientRect();
          const cRect = container.getBoundingClientRect();
          const x = enemyRect.left - cRect.left + enemyRect.width / 2;
          const y = enemyRect.top - cRect.top + enemyRect.height / 3;
          spawnExplosion(x, y, jutsu.color);
          spawnImpactParticles(x, y, jutsu.color, 16);
        }
      }

      screenShake('critical');
      chakra = 0;
      updateBars();
      updateLog(`✨ <span class="jutsu-text">${jutsu.name}</span> — <span class="dmg">-${dmg} Daño</span>`);

      await wait(500);
      isJutsuActive = false;
      setTurnIndicator(`⚔ ${currentEnemy.name}`);

      if (currentEnemy.hp <= 0) {
        await enemyDefeated(seq);
      }
    }

    async function enemyAttack(seq) {
      if (!battleActive || isHeroAttacking || isEnemyAttacking || isJutsuActive || seq !== battleSequence) return;
      isEnemyAttacking = true;

      if (Math.random() < HERO_CONFIG.kawarimiChance) {
        triggerKawarimi();
        updateLog(`${getPlayerStats().name || 'Héroe'} usó <span class="jutsu-text">Kawarimi no Jutsu</span> — ¡Esquivó!`);
        await wait(400);
        isEnemyAttacking = false;
        return;
      }

      const enemy = document.getElementById('enemy');
      if (enemy) {
        enemy.style.transform = `translateX(-${rand(90, 110)}px)`;
        spawnDashTrail('enemy', 'left');
      }

      await wait(120);
      const player = getPlayerStats();
      const dmg = calculateDamage(currentEnemy, player);
      player.hp = Math.max(0, player.hp - dmg);

      hitFlash('hero');
      spawnCombatText('hero', dmg, 'normal');

      const hero = document.getElementById('hero');
      const container = document.getElementById('game-container');
      if (hero && container) {
        const heroRect = hero.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        spawnImpactParticles(heroRect.left - cRect.left + heroRect.width / 2, heroRect.top - cRect.top + heroRect.height / 3, '#FF5722', 6);
      }

      screenShake('normal');
      updateBars();
      updateLog(`${currentEnemy.name} ataca — <span class="dmg">-${dmg} Daño</span>`);

      await wait(80);
      if (enemy) enemy.style.transform = 'translateX(0)';
      await wait(200);
      isEnemyAttacking = false;

      if (player.hp <= 0) {
        heroDefeated(seq);
      }
    }

    async function enemyDefeated(seq) {
      if (!battleActive || seq !== battleSequence) return;
      battleActive = false;
      setTurnIndicator('🏆 ¡Victoria!');
      updateLog(`🏆 <span class="highlight">${currentEnemy.name}</span> ha sido derrotado`, '✨ ¡Gana EXP y recompensas!');

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
      updateLog(`💀 <span class="dmg">${getPlayerStats().name || 'Héroe'}</span> ha caído en combate`, '🔄 Reintentando...');
      if (typeof settings.onDefeat === 'function') settings.onDefeat();
      onDefeat();
    }

    function tick(timestamp) {
      if (!battleActive) return;
      if (!lastFrameTime) lastFrameTime = timestamp;
      const delta = timestamp - lastFrameTime;
      lastFrameTime = timestamp;

      chakra = Math.min(HERO_CONFIG.chakraMax, chakra + HERO_CONFIG.chakraRate * (delta / 1000));
      updateBars();

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

    function spawnAmbientLeaves() {
      const scene = document.getElementById('battle-scene');
      if (!scene) return;
      for (let i = 0; i < 3; i += 1) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf dynamic-leaf';
        leaf.style.left = `${rand(5, 95)}%`;
        leaf.style.animationDuration = `${rand(4, 7)}s`;
        leaf.style.animationDelay = `${rand(0, 4)}s`;
        leaf.style.width = `${rand(5, 9)}px`;
        leaf.style.height = `${rand(3, 5)}px`;
        leaf.style.background = `hsl(${randInt(90, 140)}, 50%, ${randInt(30, 50)}%)`;
        scene.appendChild(leaf);
      }
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

      const player = getPlayerStats();
      if (player) player.hp = player.maxHp;

      enemyIndex = Math.max(0, missionIndex || 0);
      chakra = HERO_CONFIG.chakraMax;
      isHeroAttacking = false;
      isEnemyAttacking = false;
      isJutsuActive = false;
      heroAttackTimer = 0;
      enemyAttackTimer = 0;
      battleSequence += 1;
      lastFrameTime = 0;
      clearTransientEffects();
      battleActive = true;
      spawnAmbientLeaves();
      loadEnemy(enemyIndex);
      updateBars();
      rafId = window.requestAnimationFrame(tick);
    }

    function stop() {
      battleActive = false;
      isHeroAttacking = false;
      isEnemyAttacking = false;
      isJutsuActive = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      battleSequence += 1;
      setTurnIndicator('⚔ Combate detenido');
      clearTransientEffects();
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
