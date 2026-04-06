import { initHeroSystem } from './heroSystem.js';

const GAME_PROGRESS_KEY = 'game_progress';

const defaultStats = {
  level: 54,
  xp: 67400,
  hp: 7820,
  hpMax: 10000,
  chakra: 2750,
  chakraMax: 5000,
  expMax: 100000,
};

const savedProgress = JSON.parse(localStorage.getItem(GAME_PROGRESS_KEY) || 'null');
const stats = {
  ...defaultStats,
  level: Number(savedProgress?.level ?? defaultStats.level),
  xp: Number(savedProgress?.xp ?? defaultStats.xp),
};

const gameState = {
  isPaused: false,
  tick: 0,
};

const levelNum = document.getElementById('levelNum');
const vitalBars = document.getElementById('vitalBars');
const tickCount = document.getElementById('tickCount');
const loopStatus = document.getElementById('loopStatus');

function renderVitals() {
  const hpPercent = (Number(stats.hp) / Number(stats.hpMax)) * 100;
  const ckPercent = (Number(stats.chakra) / Number(stats.chakraMax)) * 100;
  const expPercent = (Number(stats.xp) / Number(stats.expMax)) * 100;
  levelNum.textContent = String(Number(stats.level));
  vitalBars.innerHTML = `
    <div>HP: ${Number(stats.hp).toLocaleString()} <progress max="100" value="${hpPercent}"></progress></div>
    <div>CKR: ${Number(stats.chakra).toLocaleString()} <progress max="100" value="${ckPercent}"></progress></div>
    <div>XP: ${Number(stats.xp).toLocaleString()} <progress max="100" value="${expPercent}"></progress></div>
  `;
}

function persistProgress() {
  localStorage.setItem(
    GAME_PROGRESS_KEY,
    JSON.stringify({
      level: Number(stats.level),
      xp: Number(stats.xp),
    }),
  );
}

function setPaused(nextPaused) {
  gameState.isPaused = nextPaused;
  loopStatus.textContent = nextPaused ? 'PAUSED' : 'RUNNING';
}

function gameLoop() {
  if (!gameState.isPaused) {
    gameState.tick += 1;
    tickCount.textContent = String(gameState.tick);
  }
  window.requestAnimationFrame(gameLoop);
}

initHeroSystem({
  triggerSelector: '#hero-option',
  getStats: () => ({ level: Number(stats.level), xp: Number(stats.xp) }),
  setStats: ({ level, xp }) => {
    stats.level = Number(level);
    stats.xp = Number(xp);
    renderVitals();
    persistProgress();
  },
  onOpen: () => setPaused(true),
  onClose: () => setPaused(false),
});

renderVitals();
persistProgress();
gameLoop();
