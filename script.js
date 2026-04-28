const SAVE_KEY = 'sasuke_idle_state_v2';
const ALWAYS_START_LEVEL_1 = true;

function createNewGame() {
  return {
    hero: { name: 'Sasuke Uchiha', rank: 'NOVATO' },
    progression: { level: 1, exp: 0, expToNext: 100 },
    resources: {
      hp: { cur: 1, max: 1, regen: 1 },
      mp: { cur: 1, max: 1, regen: 1 },
    },
    combat: {
      atk: 1,
      def: 1,
      speed: 1,
      crit: 1,
      resistance: 1,
      power: 5,
    },
    economy: { gold: 0 },
    equipment: [
      { name: 'Casco básico', icon: '⛑️' },
      { name: 'Armadura básica', icon: '🧥' },
      { name: 'Guantes básicos', icon: '🧤' },
      { name: 'Botas básicas', icon: '🥾' },
      { name: 'Arma básica', icon: '⚔️' },
      { name: 'Amuleto básico', icon: '📿' },
    ],
    skills: [
      { name: 'Katon: Gōkakyū', icon: '🔥', mastery: 1 },
      { name: 'Chidori', icon: '⚡', mastery: 1 },
    ],
  };
}

function safeNum(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function sanitizeEquipment(raw, baseEquipment) {
  if (!Array.isArray(raw) || !raw.length) return baseEquipment;
  return raw.map((slot, index) => ({
    name: slot?.name || baseEquipment[index % baseEquipment.length].name,
    icon: slot?.icon || baseEquipment[index % baseEquipment.length].icon,
  }));
}

function sanitizeSkills(raw, baseSkills) {
  if (!Array.isArray(raw) || !raw.length) return baseSkills;
  return raw.map((skill, index) => ({
    name: skill?.name || baseSkills[index % baseSkills.length].name,
    icon: skill?.icon || baseSkills[index % baseSkills.length].icon,
    mastery: Math.min(100, Math.max(1, Math.floor(safeNum(skill?.mastery, baseSkills[index % baseSkills.length].mastery)))),
  }));
}

function sanitizeState(raw) {
  const base = createNewGame();
  const state = raw && typeof raw === 'object' ? raw : {};

  const level = Math.max(1, Math.floor(safeNum(state.progression?.level, base.progression.level)));
  const expToNext = Math.max(1, Math.floor(safeNum(state.progression?.expToNext, base.progression.expToNext)));

  const hpMax = Math.max(1, Math.floor(safeNum(state.resources?.hp?.max, base.resources.hp.max)));
  const mpMax = Math.max(1, Math.floor(safeNum(state.resources?.mp?.max, base.resources.mp.max)));

  return {
    hero: {
      name: state.hero?.name || base.hero.name,
      rank: state.hero?.rank || base.hero.rank,
    },
    progression: {
      level,
      exp: Math.max(0, Math.floor(safeNum(state.progression?.exp, base.progression.exp))),
      expToNext,
    },
    resources: {
      hp: {
        max: hpMax,
        cur: Math.min(hpMax, Math.max(0, Math.floor(safeNum(state.resources?.hp?.cur, base.resources.hp.cur)))),
        regen: Math.max(0, safeNum(state.resources?.hp?.regen, base.resources.hp.regen)),
      },
      mp: {
        max: mpMax,
        cur: Math.min(mpMax, Math.max(0, Math.floor(safeNum(state.resources?.mp?.cur, base.resources.mp.cur)))),
        regen: Math.max(0, safeNum(state.resources?.mp?.regen, base.resources.mp.regen)),
      },
    },
    combat: {
      atk: Math.max(1, Math.floor(safeNum(state.combat?.atk, base.combat.atk))),
      def: Math.max(1, Math.floor(safeNum(state.combat?.def, base.combat.def))),
      speed: Math.max(1, Math.floor(safeNum(state.combat?.speed, base.combat.speed))),
      crit: Math.max(1, Math.floor(safeNum(state.combat?.crit, base.combat.crit))),
      resistance: Math.max(1, Math.floor(safeNum(state.combat?.resistance, base.combat.resistance))),
      power: Math.max(1, Math.floor(safeNum(state.combat?.power, base.combat.power))),
    },
    economy: {
      gold: Math.max(0, Math.floor(safeNum(state.economy?.gold, base.economy.gold))),
    },
    equipment: sanitizeEquipment(state.equipment, base.equipment),
    skills: sanitizeSkills(state.skills, base.skills),
  };
}

function loadState() {
  if (ALWAYS_START_LEVEL_1) {
    localStorage.removeItem(SAVE_KEY);
    return createNewGame();
  }

  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createNewGame();
    return sanitizeState(JSON.parse(raw));
  } catch {
    return createNewGame();
  }
}

function saveState(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

const gameState = loadState();

const navButtons = document.querySelectorAll('[data-nav]');
const panelContainer = document.getElementById('panel-container');
let activePanel = 'heroe';

const fmt = (n) => Math.round(n).toLocaleString('es');

function deriveRank(level) {
  if (level >= 50) return 'KAGE';
  if (level >= 30) return 'JONIN';
  if (level >= 15) return 'CHUNIN';
  return 'NOVATO';
}

function refreshDerivedState() {
  gameState.hero.rank = deriveRank(gameState.progression.level);
  gameState.combat.power =
    gameState.combat.atk +
    gameState.combat.def +
    gameState.combat.speed +
    gameState.combat.crit +
    gameState.combat.resistance +
    gameState.progression.level;
}

function commitState() {
  refreshDerivedState();
  renderAll(activePanel);
  saveState(gameState);
}

function addExp(amount) {
  gameState.progression.exp += Math.max(0, Math.floor(safeNum(amount, 0)));

  while (gameState.progression.exp >= gameState.progression.expToNext) {
    gameState.progression.exp -= gameState.progression.expToNext;
    gameState.progression.level += 1;
    gameState.combat.atk += 1;
    gameState.combat.def += 1;
    gameState.combat.speed += 1;
    gameState.combat.crit += 1;
    gameState.combat.resistance += 1;
    gameState.resources.hp.max += 1;
    gameState.resources.mp.max += 1;
  }

  gameState.resources.hp.cur = Math.min(gameState.resources.hp.cur, gameState.resources.hp.max);
  gameState.resources.mp.cur = Math.min(gameState.resources.mp.cur, gameState.resources.mp.max);
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  Object.assign(gameState, createNewGame());
  commitState();
}

function updateBar(key, cur, max) {
  const safeMax = Math.max(1, safeNum(max, 1));
  const safeCur = Math.max(0, safeNum(cur, 0));
  const pct = Math.min(100, Math.round((safeCur / safeMax) * 100));
  document.getElementById(`bar-${key}`).style.width = `${pct}%`;
  document.getElementById(`pct-${key}`).textContent = `${pct}%`;
  document.getElementById(`num-${key}`).textContent = `${fmt(safeCur)} / ${fmt(safeMax)}`;
}

function renderTopHud() {
  document.getElementById('hero-name').textContent = gameState.hero.name;
  document.getElementById('nivel').textContent = gameState.progression.level;
  document.getElementById('hero-rank').textContent = gameState.hero.rank;
  document.getElementById('oro').textContent = fmt(gameState.economy.gold);
  document.getElementById('atk').textContent = gameState.combat.atk;
  document.getElementById('def').textContent = gameState.combat.def;

  updateBar('hp', gameState.resources.hp.cur, gameState.resources.hp.max);
  updateBar('mp', gameState.resources.mp.cur, gameState.resources.mp.max);
  updateBar('exp', gameState.progression.exp, gameState.progression.expToNext);

  const regenHp = document.getElementById('regen-hp');
  const regenMp = document.getElementById('regen-mp');
  regenHp.style.display = gameState.resources.hp.cur < gameState.resources.hp.max ? 'inline' : 'none';
  regenMp.style.display = gameState.resources.mp.cur < gameState.resources.mp.max ? 'inline' : 'none';
}

function renderPlaceholder(name) {
  panelContainer.innerHTML = `
    <section class="hero-card panel-placeholder">
      <h3>${name.toUpperCase()}</h3>
      <p>Panel en construcción, pero sincronizado con el estado global.</p>
      <p>Nivel actual: <strong>${gameState.progression.level}</strong> | Oro: <strong>${fmt(gameState.economy.gold)}</strong></p>
    </section>
  `;
}

function renderSettings() {
  panelContainer.innerHTML = `
    <section class="hero-card">
      <h3 class="hero-card__title">AJUSTES</h3>
      <p>Gestión de partida sincronizada.</p>
      <button id="new-game-btn" class="hero-system__action" type="button">REINICIAR PARTIDA (Nivel 1)</button>
    </section>
  `;

  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    resetGame();
  });
}

function train() {
  addExp(10);
  commitState();
}

function renderPanel(panelName) {
  if (panelName === 'heroe') {
    window.BotonHero?.renderHeroSystem(panelContainer, gameState);
    document.getElementById('train-btn')?.addEventListener('click', train);
    return;
  }

  if (panelName === 'ajustes') {
    renderSettings();
    return;
  }

  renderPlaceholder(panelName);
}

function renderAll(panelName = activePanel) {
  activePanel = panelName;
  renderTopHud();
  renderPanel(panelName);
}

function setActive(btn) {
  navButtons.forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const panel = btn.dataset.panel || 'heroe';
  renderAll(panel);
  saveState(gameState);
}

function regenTick() {
  ['hp', 'mp'].forEach((key) => {
    const resource = gameState.resources[key];
    if (resource.cur < resource.max) {
      resource.cur = Math.min(resource.max, resource.cur + resource.regen);
    }
  });

  renderTopHud();
  saveState(gameState);
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => setActive(btn));
});

commitState();
setInterval(regenTick, 1200);
