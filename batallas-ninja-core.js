// ==================== ENTER GAME ====================
function enterGame() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('game-content').classList.add('visible');
  setTimeout(() => init(), 100);
}

// ==================== GAME DATA ====================
const NINJA_NAMES = [
  "Naruto Uzumaki","Sasuke Uchiha","Kakashi Hatake","Sakura Haruno","Itachi Uchiha",
  "Jiraiya","Hinata Hyuga","Gaara","Shikamaru Nara","Minato Namikaze",
  "Madara Uchiha","Obito Uchiha","Orochimaru","Tsunade","Rock Lee",
  "Neji Hyuga","Kiba Inuzuka","Nagato Pain","Konan","Killer Bee",
  "Temari","Kankuro","Ino Yamanaka","Choji Akimichi","Asuma Sarutobi",
  "Hiruzen Sarutobi","Hashirama Senju","Tobirama Senju","Kushina Uzumaki","Sai",
  "Yamato","Kisame Hoshigaki","Deidara","Sasori","Hidan",
  "Kakuzu","Zetsu","Kabuto Yakushi","Kaguya Otsutsuki","Iruka Umino",
  "Shino Aburame","Akamaru","Tenten","Guy Might","Suigetsu Hozuki",
  "Karin Uzumaki","Jugo","Danzo Shimura","Shisui Uchiha","Rin Nohara",
  "Yahiko","Konohamaru","Might Guy","Hanabi Hyuga","Hiashi Hyuga",
  "Hizashi Hyuga","Kimimaro","Haku","Zabuza Momochi","Kushina N",
  "Ay Raikage","Onoki","Darui","Chojuro","Mei Terumi",
  "Anko Mitarashi","Shizune","Kurenai Yuhi","Kotetsu Hagane","Izumo Kamizuki",
  "Baki","Gamabunta","Katsuyu","Manda","Kurama","Shukaku","Gyuki",
  "Hagoromo Otsutsuki","Hamura Otsutsuki","Indra Otsutsuki","Ashura Otsutsuki","Toneri Otsutsuki",
  "Cuarto Kazekage","Chiyo","Ebizo","Mizukage","Utakata",
  "Fuu","Roshi","Han","Yugito Nii","Yagura",
  "Ao","Mei Terumi","Chojuro B","Ibiki Morino","Anko Mitarashi",
  "Shizune B","Kurenai Y","Kotetsu H","Izumo K","Baki B"
];

const RANKS = ["Genin","Chunin","Jonin","Anbu","Kage"];
const RANK_CLASSES = ["rank-genin","rank-chunin","rank-jonin","rank-anbu","rank-kage"];
const EMOJIS = ["🔥","","🌪️","️","🌙","⭐","🗡️","","🦊","","❄️","️","🌀","","💀","⚡","🐍","🐸","🦅","🐺"];

const STAT_FORMULAS = [
  { hp: l=>80+12*(l-1), atk: l=>22+11*(l-1), def: l=>5+4*(l-1), spd: l=>120+5*(l-1), crt: l=>8+0.6*(l-1), eva: l=>10+0.5*(l-1), res: l=>50+8*(l-1) },
  { hp: l=>90+15*(l-1), atk: l=>28+16*(l-1), def: l=>6+3*(l-1), spd: l=>95+2*(l-1), crt: l=>4+0.2*(l-1), eva: l=>3+0.1*(l-1), res: l=>140+28*(l-1) },
  { hp: l=>115+20*(l-1), atk: l=>20+13*(l-1), def: l=>8+7*(l-1), spd: l=>105+3*(l-1), crt: l=>12+0.8*(l-1), eva: l=>5+0.2*(l-1), res: l=>75+12*(l-1) },
  { hp: l=>105+18*(l-1), atk: l=>12+4*(l-1), def: l=>12+9*(l-1), spd: l=>90+2*(l-1), crt: l=>2+0.05*(l-1), eva: l=>4+0.15*(l-1), res: l=>180+35*(l-1) },
  { hp: l=>100+20*(l-1), atk: l=>18+8*(l-1), def: l=>8+5*(l-1), spd: l=>100+2*(l-1), crt: l=>5+0.2*(l-1), eva: l=>2+0.1*(l-1), res: l=>80+15*(l-1) },
  { hp: l=>85+14*(l-1), atk: l=>14+7*(l-1), def: l=>6+4*(l-1), spd: l=>110+3.5*(l-1), crt: l=>3+0.15*(l-1), eva: l=>8+0.4*(l-1), res: l=>200+40*(l-1) },
  { hp: l=>130+22*(l-1), atk: l=>16+9*(l-1), def: l=>9+6*(l-1), spd: l=>90+1.5*(l-1), crt: l=>2+0.1*(l-1), eva: l=>1+0.05*(l-1), res: l=>120+25*(l-1) },
  { hp: l=>150+28*(l-1), atk: l=>35+18*(l-1), def: l=>2+1*(l-1), spd: l=>85+1*(l-1), crt: l=>15+1.2*(l-1), eva: l=>0, res: l=>50+5*(l-1) },
  { hp: l=>110+18*(l-1), atk: l=>10+5*(l-1), def: l=>12+8*(l-1), spd: l=>100+2.5*(l-1), crt: l=>1+0.05*(l-1), eva: l=>5+0.25*(l-1), res: l=>150+30*(l-1) },
  { hp: l=>75+11*(l-1), atk: l=>20+10*(l-1), def: l=>4+3*(l-1), spd: l=>140+6*(l-1), crt: l=>10+0.5*(l-1), eva: l=>12+0.6*(l-1), res: l=>60+10*(l-1) },
  { hp: l=>95+16*(l-1), atk: l=>24+12*(l-1), def: l=>7+5*(l-1), spd: l=>105+3*(l-1), crt: l=>20+1.5*(l-1), eva: l=>3+0.1*(l-1), res: l=>90+18*(l-1) },
  { hp: l=>120+22*(l-1), atk: l=>12+6*(l-1), def: l=>15+10*(l-1), spd: l=>95+2*(l-1), crt: l=>1+0.05*(l-1), eva: l=>2+0.1*(l-1), res: l=>250+50*(l-1) },
  { hp: l=>80+35*(l-1), atk: l=>10+20*(l-1), def: l=>5+15*(l-1), spd: l=>80+5*(l-1), crt: l=>0+2*(l-1), eva: l=>0+1*(l-1), res: l=>50+45*(l-1) },
  { hp: l=>160+12*(l-1), atk: l=>40+6*(l-1), def: l=>20+4*(l-1), spd: l=>110+1.5*(l-1), crt: l=>10+0.1*(l-1), eva: l=>5+0.05*(l-1), res: l=>100+10*(l-1) },
  { hp: l=>90+15*(l-1), atk: l=>15+8*(l-1), def: l=>8+6*(l-1), spd: l=>115+4*(l-1), crt: l=>5+0.3*(l-1), eva: l=>8+0.45*(l-1), res: l=>130+25*(l-1) },
  { hp: l=>140+20*(l-1), atk: l=>30+15*(l-1), def: l=>5+3*(l-1), spd: l=>100+3*(l-1), crt: l=>10+0.8*(l-1), eva: l=>2+0.2*(l-1), res: l=>40+5*(l-1) },
  { hp: l=>120+24*(l-1), atk: l=>25+14*(l-1), def: l=>10+7*(l-1), spd: l=>110+3.5*(l-1), crt: l=>8+0.4*(l-1), eva: l=>6+0.3*(l-1), res: l=>180+35*(l-1) },
  { hp: l=>110+20*(l-1), atk: l=>18+10*(l-1), def: l=>11+8*(l-1), spd: l=>95+2*(l-1), crt: l=>4+0.2*(l-1), eva: l=>2+0.1*(l-1), res: l=>110+20*(l-1) },
  { hp: l=>100+17*(l-1), atk: l=>22+12*(l-1), def: l=>14+9*(l-1), spd: l=>98+2.5*(l-1), crt: l=>6+0.35*(l-1), eva: l=>4+0.2*(l-1), res: l=>100+22*(l-1) },
  { hp: l=>110+22*(l-1), atk: l=>14+6*(l-1), def: l=>12+8*(l-1), spd: l=>92+2*(l-1), crt: l=>3+0.15*(l-1), eva: l=>4+0.2*(l-1), res: l=>160+32*(l-1) },
  { hp: l=>80+13*(l-1), atk: l=>26+14*(l-1), def: l=>4+2*(l-1), spd: l=>130+5*(l-1), crt: l=>15+1.2*(l-1), eva: l=>9+0.5*(l-1), res: l=>70+10*(l-1) },
  { hp: l=>140+26*(l-1), atk: l=>22+11*(l-1), def: l=>10+6*(l-1), spd: l=>88+1.5*(l-1), crt: l=>4+0.2*(l-1), eva: l=>1+0.05*(l-1), res: l=>120+24*(l-1) },
  { hp: l=>95+16*(l-1), atk: l=>18+9*(l-1), def: l=>7+5*(l-1), spd: l=>105+3*(l-1), crt: l=>6+0.4*(l-1), eva: l=>6+0.35*(l-1), res: l=>100+18*(l-1) },
  { hp: l=>170+30*(l-1), atk: l=>10+5*(l-1), def: l=>18+14*(l-1), spd: l=>75+1*(l-1), crt: l=>1+0.05*(l-1), eva: l=>0, res: l=>220+45*(l-1) },
  { hp: l=>100+18*(l-1), atk: l=>32+16*(l-1), def: l=>3+2*(l-1), spd: l=>110+4*(l-1), crt: l=>10+0.7*(l-1), eva: l=>5+0.3*(l-1), res: l=>60+12*(l-1) },
  { hp: l=>125+21*(l-1), atk: l=>20+10*(l-1), def: l=>9+7*(l-1), spd: l=>100+2.5*(l-1), crt: l=>5+0.25*(l-1), eva: l=>3+0.15*(l-1), res: l=>140+26*(l-1) },
  { hp: l=>70+10*(l-1), atk: l=>15+7*(l-1), def: l=>5+3*(l-1), spd: l=>150+7*(l-1), crt: l=>12+0.9*(l-1), eva: l=>15+1.2*(l-1), res: l=>80+14*(l-1) },
  { hp: l=>135+24*(l-1), atk: l=>28+13*(l-1), def: l=>6+5*(l-1), spd: l=>95+2*(l-1), crt: l=>18+1.8*(l-1), eva: l=>2+0.1*(l-1), res: l=>90+20*(l-1) },
  { hp: l=>115+19*(l-1), atk: l=>16+8*(l-1), def: l=>14+10*(l-1), spd: l=>85+1.8*(l-1), crt: l=>2+0.1*(l-1), eva: l=>4+0.2*(l-1), res: l=>280+55*(l-1) },
  { hp: l=>105+17*(l-1), atk: l=>25+12*(l-1), def: l=>8+6*(l-1), spd: l=>108+3.2*(l-1), crt: l=>7+0.45*(l-1), eva: l=>5+0.25*(l-1), res: l=>115+22*(l-1) },
  { hp: l=>155+27*(l-1), atk: l=>38+17*(l-1), def: l=>4+3*(l-1), spd: l=>82+1.2*(l-1), crt: l=>9+0.6*(l-1), eva: l=>1+0.05*(l-1), res: l=>55+8*(l-1) },
  { hp: l=>90+14*(l-1), atk: l=>12+5*(l-1), def: l=>11+9*(l-1), spd: l=>100+2.8*(l-1), crt: l=>4+0.15*(l-1), eva: l=>7+0.4*(l-1), res: l=>300+60*(l-1) },
  { hp: l=>120+23*(l-1), atk: l=>21+11*(l-1), def: l=>12+8*(l-1), spd: l=>98+2.2*(l-1), crt: l=>6+0.3*(l-1), eva: l=>3+0.15*(l-1), res: l=>130+28*(l-1) },
  { hp: l=>85+12*(l-1), atk: l=>30+15*(l-1), def: l=>5+4*(l-1), spd: l=>125+5.5*(l-1), crt: l=>25+2.2*(l-1), eva: l=>10+0.8*(l-1), res: l=>45+6*(l-1) }
];

// ==================== GAME STATE ====================

const BATALLAS_NINJA_SAVE_KEY = 'naruto_idle_batallas_ninja_v1';
const BATALLAS_NINJA_SAVE_VERSION = 1;
const BATALLAS_NINJA_EVENT_END_KEY = 'naruto_idle_batallas_ninja_event_end_at_v1';

function defaultGameState() {
  return {
    player: {
      name: "Tú",
      rank: 101,
      level: 7,
      hp: 200, maxHp: 200,
      mp: 50, maxMp: 50,
      atk: 30, def: 15, spd: 100, crt: 10, eva: 8, res: 60,
      formulaIdx: 0,
      emoji: "🥷"
    },
    ninjas: [],
    selectedEnemy: null,
    combatLog: [],
    notifications: [],
    notifCount: 0,
    eventTime: 24 * 60 * 60,
    eventEndAt: null,
    lastProcessedAt: null,
    battleActive: false,
    ninjaFirstAttackDone: {},
    battleIntervals: {}
  };
}

function nowMs() {
  return Date.now();
}

function getRandomAttackCooldown() {
  return Math.floor(Math.random() * 1741) + 60; // 1 a 30 minutos
}

function persistEventEndAt() {
  try {
    if (Number.isFinite(gameState.eventEndAt) && gameState.eventEndAt > 0) {
      window.localStorage.setItem(BATALLAS_NINJA_EVENT_END_KEY, String(Math.floor(gameState.eventEndAt)));
    }
  } catch (error) {
    console.warn('No se pudo guardar el fin del evento de Batallas Ninja:', error);
  }
}

function readStoredEventEndAt() {
  try {
    const raw = window.localStorage.getItem(BATALLAS_NINJA_EVENT_END_KEY);
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return Math.floor(parsed);
  } catch (error) {
    console.warn('No se pudo leer el fin del evento de Batallas Ninja:', error);
    return null;
  }
}

function persistEventEndAt() {
  try {
    if (Number.isFinite(gameState.eventEndAt) && gameState.eventEndAt > 0) {
      window.localStorage.setItem(BATALLAS_NINJA_EVENT_END_KEY, String(Math.floor(gameState.eventEndAt)));
    }
  } catch (error) {
    console.warn('No se pudo guardar el fin del evento de Batallas Ninja:', error);
  }
}

function readStoredEventEndAt() {
  try {
    const raw = window.localStorage.getItem(BATALLAS_NINJA_EVENT_END_KEY);
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return Math.floor(parsed);
  } catch (error) {
    console.warn('No se pudo leer el fin del evento de Batallas Ninja:', error);
    return null;
  }
}

function saveBattleProgress() {
  try {
    gameState.lastProcessedAt = nowMs();
    persistEventEndAt();
    const payload = {
      version: BATALLAS_NINJA_SAVE_VERSION,
      savedAt: new Date().toISOString(),
      gameState: {
        ...gameState,
        selectedEnemy: null,
        battleActive: false,
        battleIntervals: {},
        notifCount: gameState.notifications.filter((n) => !n.read).length
      }
    };
    window.localStorage.setItem(BATALLAS_NINJA_SAVE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('No se pudo guardar progreso de Batallas Ninja:', error);
  }
}

function normalizeLoadedState(rawState) {
  const base = defaultGameState();
  if (!rawState || typeof rawState !== 'object') return base;

  const player = rawState.player && typeof rawState.player === 'object'
    ? { ...base.player, ...rawState.player }
    : { ...base.player };

  const ninjas = Array.isArray(rawState.ninjas)
    ? rawState.ninjas
      .filter((ninja) => ninja && typeof ninja === 'object')
      .map((ninja) => ({
        ...ninja,
        rank: Math.max(1, Math.min(100, Math.floor(Number(ninja.rank) || 100))),
        level: Math.max(1, Math.min(100, Math.floor(Number(ninja.level) || 1))),
        hp: Math.max(1, Math.floor(Number(ninja.hp) || 1)),
        maxHp: Math.max(1, Math.floor(Number(ninja.maxHp) || Number(ninja.hp) || 1)),
        hpDisplay: Math.max(1, Math.floor(Number(ninja.hpDisplay) || (Number(ninja.hp) || 1) * 6)),
        maxHpDisplay: Math.max(1, Math.floor(Number(ninja.maxHpDisplay) || (Number(ninja.maxHp) || Number(ninja.hp) || 1) * 6)),
        nextAttackTime: Math.max(1, Math.floor(Number(ninja.nextAttackTime) || getRandomAttackCooldown())),
        nextAttackAt: Math.max(1, Math.floor(Number(ninja.nextAttackAt) || (nowMs() + (Math.floor(Number(ninja.nextAttackTime) || getRandomAttackCooldown()) * 1000)))),
        firstAttackDone: Boolean(ninja.firstAttackDone)
      }))
    : [];

  ninjas.sort((a, b) => a.rank - b.rank);

  const notifications = Array.isArray(rawState.notifications)
    ? rawState.notifications
      .filter((notification) => notification && typeof notification === 'object' && typeof notification.msg === 'string')
      .slice(0, 100)
      .map((notification) => ({
        msg: notification.msg,
        type: notification.type === 'lose' ? 'lose' : 'win',
        read: Boolean(notification.read)
      }))
    : [];

  const combatLog = Array.isArray(rawState.combatLog)
    ? rawState.combatLog
      .filter((entry) => entry && typeof entry === 'object' && typeof entry.msg === 'string')
      .slice(0, 8)
      .map((entry) => ({
        time: typeof entry.time === 'string' ? entry.time : '--:--:--',
        msg: entry.msg,
        type: entry.type || 'neutral'
      }))
    : [];

  return {
    ...base,
    ...rawState,
    player,
    ninjas,
    notifications,
    combatLog,
    selectedEnemy: null,
    battleActive: false,
    battleIntervals: {},
    eventTime: Math.max(0, Math.floor(Number(rawState.eventTime) || base.eventTime)),
    eventEndAt: Number(rawState.eventEndAt) > 0 ? Number(rawState.eventEndAt) : null,
    lastProcessedAt: Number(rawState.lastProcessedAt) > 0 ? Number(rawState.lastProcessedAt) : null,
    notifCount: notifications.filter((n) => !n.read).length
  };
}

function loadBattleProgress() {
  try {
    const raw = window.localStorage.getItem(BATALLAS_NINJA_SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== BATALLAS_NINJA_SAVE_VERSION || !parsed.gameState) {
      return null;
    }
    return normalizeLoadedState(parsed.gameState);
  } catch (error) {
    console.warn('No se pudo cargar progreso de Batallas Ninja:', error);
    return null;
  }
}

function setupAutoSave() {
  setInterval(saveBattleProgress, 5000);
  window.addEventListener('beforeunload', saveBattleProgress);
  window.addEventListener('pagehide', saveBattleProgress);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveBattleProgress();
  });
}

let gameState = defaultGameState();
let gameInitialized = false;

function ensureTemporalState() {
  const now = nowMs();

  if (!Number.isFinite(gameState.eventEndAt) || gameState.eventEndAt <= 0) {
    const storedEventEndAt = readStoredEventEndAt();
    gameState.eventEndAt = Number.isFinite(storedEventEndAt) && storedEventEndAt > 0
      ? storedEventEndAt
      : now + (Math.max(0, gameState.eventTime) * 1000);
  }
  persistEventEndAt();

  gameState.ninjas.forEach((ninja) => {
    if (!Number.isFinite(ninja.nextAttackAt) || ninja.nextAttackAt <= 0) {
      const fallback = Math.max(1, Math.floor(Number(ninja.nextAttackTime) || getRandomAttackCooldown()));
      ninja.nextAttackAt = now + (fallback * 1000);
    }
  });

  gameState.lastProcessedAt = Number.isFinite(gameState.lastProcessedAt) && gameState.lastProcessedAt > 0
    ? gameState.lastProcessedAt
    : now;
}

function recalcEventTime() {
  const remainingMs = Math.max(0, gameState.eventEndAt - nowMs());
  gameState.eventTime = Math.floor(remainingMs / 1000);
}

function processOfflineProgress() {
  ensureTemporalState();
  const now = nowMs();
  const last = Math.min(gameState.lastProcessedAt || now, now);
  if (now <= last) {
    recalcEventTime();
    return;
  }

  const processUntil = Math.min(now, gameState.eventEndAt);

  gameState.ninjas.forEach((ninja) => {
    while (ninja.nextAttackAt <= processUntil) {
      let validTargets = gameState.ninjas.filter(n =>
        n.rank >= ninja.rank - 3 && n.rank < ninja.rank && n.rank !== ninja.rank
      );

      if (validTargets.length > 0) {
        let target = validTargets[Math.floor(Math.random() * validTargets.length)];
        simulateNinjaFight(ninja, target, { deferSave: true });
      }

      ninja.firstAttackDone = true;
      ninja.nextAttackAt += getRandomAttackCooldown() * 1000;
    }

    ninja.nextAttackTime = Math.max(1, Math.ceil((ninja.nextAttackAt - now) / 1000));
  });

  gameState.lastProcessedAt = now;
  recalcEventTime();
}

function normalizeIncomingPlayerStats(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const numeric = (value, fallback = 0) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.floor(parsed);
  };

  const maxHp = Math.max(1, numeric(raw.maxHp, gameState.player.maxHp));
  const hp = Math.max(0, Math.min(maxHp, numeric(raw.hp, gameState.player.hp)));
  const maxMp = Math.max(1, numeric(raw.maxMp, gameState.player.maxMp));
  const mp = Math.max(0, Math.min(maxMp, numeric(raw.mp, gameState.player.mp)));

  return {
    hp,
    maxHp,
    hpDisplay: maxHp > 0 ? hp * 6 : 0,
    maxHpDisplay: maxHp * 6,
    mp,
    maxMp,
    atk: Math.max(1, numeric(raw.atk, gameState.player.atk)),
    def: Math.max(1, numeric(raw.def, gameState.player.def)),
    level: Math.max(1, numeric(raw.level, gameState.player.level)),
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : gameState.player.name,
    emoji: typeof raw.emoji === 'string' && raw.emoji.trim() ? raw.emoji.trim() : gameState.player.emoji
  };
}

function applyExternalPlayerStats(rawStats) {
  const synced = normalizeIncomingPlayerStats(rawStats);
  if (!synced) return;

  gameState.player = {
    ...gameState.player,
    ...synced
  };

  updatePlayerStatsDisplay();
  updatePlayerDisplay();
  renderChallengeCards();
  if (gameInitialized && gameState.ninjas.length > 0) {
    saveBattleProgress();
  }
}

window.addEventListener('message', (event) => {
  const data = event?.data;
  if (!data || data.type !== 'BATALLAS_NINJA_SYNC_PLAYER_STATS') return;
  applyExternalPlayerStats(data.payload);
});

window.BatallasNinjaBridge = {
  syncPlayerStats: applyExternalPlayerStats,
  getSnapshot: () => ({
    player: { ...gameState.player },
    rank: gameState.player.rank,
    combatLog: [...gameState.combatLog]
  })
};

// ==================== INITIALIZATION ====================
function init() {
  const loadedState = loadBattleProgress();
  if (loadedState && loadedState.ninjas.length > 0) {
    gameState = loadedState;
    processOfflineProgress();
    gameInitialized = true;

    updatePlayerStatsDisplay();
    renderChallengeCards();
    updatePlayerDisplay();
    renderCombatLog();
    setupAutoSave();
    startEventTimer();
    startNinjaAI();
    return;
  }

  let usedNames = new Set();
  for (let i = 1; i <= 100; i++) {
    let nameIdx = (i - 1) % NINJA_NAMES.length;
    let name = NINJA_NAMES[nameIdx];
    let attempts = 0;
    while (usedNames.has(name) && attempts < 200) {
      nameIdx = (nameIdx + 1) % NINJA_NAMES.length;
      name = NINJA_NAMES[nameIdx];
      attempts++;
    }
    usedNames.add(name);

    let minLevel = gameState.player.level;
    let maxLevel = 100;
    let level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    
    let formulaIdx = Math.floor(Math.random() * STAT_FORMULAS.length);
    let formula = STAT_FORMULAS[formulaIdx];
    let rankClassIdx = Math.floor(Math.random() * RANKS.length);
    let emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    let baseHp = Math.floor(formula.hp(level));
    
    const initialCooldown = getRandomAttackCooldown();
    let ninja = {
      rank: i,
      name: name,
      level: level,
      hp: baseHp,
      maxHp: baseHp,
      hpDisplay: baseHp * 6,
      maxHpDisplay: baseHp * 6,
      atk: Math.floor(formula.atk(level)),
      def: Math.floor(formula.def(level)),
      spd: Math.floor(formula.spd(level)),
      crt: Math.floor(formula.crt(level)),
      eva: Math.floor(formula.eva(level)),
      res: Math.floor(formula.res(level)),
      formulaIdx: formulaIdx,
      rankClass: RANKS[rankClassIdx],
      rankClassIdx: rankClassIdx,
      emoji: emoji,
      nextAttackTime: initialCooldown,
      nextAttackAt: nowMs() + (initialCooldown * 1000),
      firstAttackDone: false
    };

    gameState.ninjas.push(ninja);
  }

  gameState.player.formulaIdx = Math.floor(Math.random() * STAT_FORMULAS.length);
  let pf = STAT_FORMULAS[gameState.player.formulaIdx];
  let playerBaseHp = Math.floor(pf.hp(gameState.player.level));
  gameState.player.hp = playerBaseHp;
  gameState.player.maxHp = playerBaseHp;
  gameState.player.hpDisplay = playerBaseHp * 6;
  gameState.player.maxHpDisplay = playerBaseHp * 6;
  gameState.player.atk = Math.floor(pf.atk(gameState.player.level));
  gameState.player.def = Math.floor(pf.def(gameState.player.level));

  ensureTemporalState();
  gameInitialized = true;
  updatePlayerStatsDisplay();
  renderChallengeCards();
  updatePlayerDisplay();
  setupAutoSave();
  saveBattleProgress();
  startEventTimer();
  startNinjaAI();
}

// ==================== PLAYER STATS DISPLAY ====================
function updatePlayerStatsDisplay() {
  let p = gameState.player;
  document.getElementById('p-hp-display').textContent = p.hpDisplay;
  document.getElementById('p-mp-display').textContent = p.mp;
  document.getElementById('p-atk-display').textContent = p.atk;
  document.getElementById('p-def-display').textContent = p.def;

  let hpPct = (p.hpDisplay / p.maxHpDisplay) * 100;
  let mpPct = (p.mp / p.maxMp) * 100;
  document.getElementById('p-hp-bar-mini').style.width = hpPct + '%';
  document.getElementById('p-mp-bar-mini').style.width = mpPct + '%';
}

// ==================== RENDERING ====================
function getRankColorClass(rank) {
  if (rank === 1) return 'top1';
  if (rank <= 3) return 'top3';
  if (rank <= 10) return 'top10';
  if (rank <= 25) return 'top25';
  return '';
}

function renderChallengeCards() {
  const container = document.getElementById('main-content');
  container.innerHTML = '';

  let targets = [];
  for (let r = gameState.player.rank - 3; r < gameState.player.rank; r++) {
    if (r < 1) continue;
    let ninja = gameState.ninjas.find(n => n.rank === r);
    if (ninja) targets.push(ninja);
  }

  if (targets.length < 3) {
    let remaining = 3 - targets.length;
    let topNinjas = gameState.ninjas
      .filter(n => !targets.includes(n))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, remaining);
    targets = [...targets, ...topNinjas];
  }

  targets.forEach(ninja => {
    let card = document.createElement('div');
    card.className = 'challenge-card';
    card.dataset.rank = ninja.rank;
    card.onclick = () => selectEnemy(ninja);

    let rankColorClass = getRankColorClass(ninja.rank);

    card.innerHTML = `
      <div class="ninja-avatar">${ninja.emoji}</div>
      <div class="ninja-details">
        <div class="ninja-name">${ninja.name}</div>
        <div class="ninja-rank ${rankColorClass}">#${ninja.rank} · ${ninja.rankClass} · Lv.${ninja.level}</div>
        <div class="ninja-stats">
          <span class="stat-chip hp">❤️ ${ninja.hpDisplay}</span>
          <span class="stat-chip atk">⚔️ ${ninja.atk}</span>
          <span class="stat-chip def">🛡️ ${ninja.def}</span>
        </div>
      </div>
      <span class="ninja-rank-badge ${RANK_CLASSES[ninja.rankClassIdx]}">${ninja.rankClass}</span>
    `;
    container.appendChild(card);
  });
}

function selectEnemy(ninja) {
  if (gameState.battleActive) return;
  
  gameState.selectedEnemy = ninja;
  
  document.querySelectorAll('.challenge-card').forEach(c => c.classList.remove('selected'));
  let el = document.querySelector(`.challenge-card[data-rank="${ninja.rank}"]`);
  if (el) el.classList.add('selected');
  
  startBattle();
}

function updatePlayerDisplay() {
  document.getElementById('player-rank').textContent = `#${gameState.player.rank}`;
  document.getElementById('player-level').textContent = gameState.player.level;
  document.getElementById('player-name').textContent = gameState.player.name;
}

function showScreen(screenKey) {
  const battleScreen = document.getElementById('battle-screen');
  if (!battleScreen) return;

  if (screenKey === 'battle') {
    battleScreen.classList.remove('hidden');
    document.body.classList.add('battle-only');
    return;
  }

  battleScreen.classList.add('hidden');
  document.body.classList.remove('battle-only');
}

// ==================== BATTLE SYSTEM ====================
function startBattle() {
  if (!gameState.selectedEnemy || gameState.battleActive) return;

  let enemy = gameState.selectedEnemy;
  let player = gameState.player;
  gameState.battleActive = true;

  let playerBattleHp = player.hpDisplay;
  let playerMaxBattleHp = player.maxHpDisplay;
  let enemyBattleHp = enemy.hpDisplay;
  let enemyMaxBattleHp = enemy.maxHpDisplay;

  showScreen('battle');
  document.getElementById('result-overlay').className = '';
  document.getElementById('result-overlay').style.display = 'none';

  let battleLog = document.getElementById('battle-log');
  battleLog.innerHTML = '';

  document.getElementById('player-fighter').innerHTML = `
    <div class="fighter-name">${player.name}</div>
    <div class="fighter-rank">#${player.rank} · Lv.${player.level}</div>
    <div class="card-emoji">${player.emoji}</div>
    <div class="bar-label"><span>HP x6</span><span id="p-hp-text">${playerBattleHp}/${playerMaxBattleHp}</span></div>
    <div class="hp-bar"><div class="hp-fill" id="p-hp-bar" style="width:100%"></div></div>
    <div class="bar-label"><span>MP</span><span id="p-mp-text">${player.mp}/${player.maxMp}</span></div>
    <div class="mp-bar"><div class="mp-fill" id="p-mp-bar" style="width:${(player.mp/player.maxMp)*100}%"></div></div>
    <div class="fighter-stats">
      <span class="stat-chip atk">⚔️ ${player.atk}</span>
      <span class="stat-chip def">🛡️ ${player.def}</span>
    </div>
  `;

  document.getElementById('enemy-fighter').innerHTML = `
    <div class="fighter-name">${enemy.name}</div>
    <div class="fighter-rank">#${enemy.rank} · ${enemy.rankClass} · Lv.${enemy.level}</div>
    <div class="card-emoji">${enemy.emoji}</div>
    <div class="bar-label"><span>HP x6</span><span id="e-hp-text">${enemyBattleHp}/${enemyMaxBattleHp}</span></div>
    <div class="hp-bar"><div class="hp-fill" id="e-hp-bar" style="width:100%"></div></div>
    <div class="bar-label"><span>MP</span><span id="e-mp-text">${enemy.maxMp||50}/50</span></div>
    <div class="mp-bar"><div class="mp-fill" id="e-mp-bar" style="width:100%"></div></div>
    <div class="fighter-stats">
      <span class="stat-chip atk">⚔️ ${enemy.atk}</span>
      <span class="stat-chip def">🛡️ ${enemy.def}</span>
    </div>
  `;

  let pHp = playerBattleHp;
  let eHp = enemyBattleHp;

  let jutsus = ["Rasengan! 🌀","Chidori! ⚡","Katon! 🔥","Shadow Clone! 👥","Byakugan! 👁️","Eight Gates! 💥","Summoning! 🐸","Sage Mode! 🌿","Tailed Beast! 🦊","Puppet Jutsu! 🎭","Kirin! ⚡","Amaterasu! 🔥","Susanoo! 👻","Kage Bunshin! 🌀","Rasenshuriken! 🌪️"];

  function doTurn() {
    if (pHp <= 0 || eHp <= 0) {
      endBattle(pHp > 0, enemy);
      return;
    }

    let pDmg = Math.max(1, player.atk - Math.floor(enemy.def * 0.5) + Math.floor(Math.random() * 10));
    let eDmg = Math.max(1, enemy.atk - Math.floor(player.def * 0.5) + Math.floor(Math.random() * 10));

    let pJutsu = jutsus[Math.floor(Math.random() * jutsus.length)];
    eHp -= pDmg;
    addBattleLog(`${player.name} usó ${pJutsu} → -${pDmg} DMG`, 'dmg');

    updateHpBars(pHp, eHp, playerMaxBattleHp, enemyMaxBattleHp);

    if (eHp <= 0) {
      eHp = 0;
      updateHpBars(pHp, 0, playerMaxBattleHp, enemyMaxBattleHp);
      endBattle(true, enemy);
      return;
    }

    setTimeout(() => {
      let eJutsu = jutsus[Math.floor(Math.random() * jutsus.length)];
      pHp -= eDmg;
      addBattleLog(`${enemy.name} usó ${eJutsu} → -${eDmg} DMG`, 'dmg');
      updateHpBars(pHp, eHp, playerMaxBattleHp, enemyMaxBattleHp);

      if (pHp <= 0) {
        pHp = 0;
        updateHpBars(0, eHp, playerMaxBattleHp, enemyMaxBattleHp);
        endBattle(false, enemy);
      }
    }, 350);
  }

  let battleInterval = setInterval(() => {
    if (!gameState.battleActive) { clearInterval(battleInterval); return; }
    doTurn();
  }, 700);

  setTimeout(doTurn, 250);
}

function updateHpBars(pHp, eHp, pMax, eMax) {
  let pPct = Math.max(0, (pHp / pMax) * 100);
  let ePct = Math.max(0, (eHp / eMax) * 100);
  let pEl = document.getElementById('p-hp-bar');
  let eEl = document.getElementById('e-hp-bar');
  if (pEl) pEl.style.width = pPct + '%';
  if (eEl) eEl.style.width = ePct + '%';
  let ptEl = document.getElementById('p-hp-text');
  let etEl = document.getElementById('e-hp-text');
  if (ptEl) ptEl.textContent = `${Math.max(0,Math.floor(pHp))}/${pMax}`;
  if (etEl) etEl.textContent = `${Math.max(0,Math.floor(eHp))}/${eMax}`;
}

function addBattleLog(msg, cls) {
  let log = document.getElementById('battle-log');
  let entry = document.createElement('div');
  entry.className = `battle-msg ${cls}`;
  entry.textContent = `⚡ ${msg}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function endBattle(won, enemy) {
  gameState.battleActive = false;

  let resultOverlay = document.getElementById('result-overlay');
  if (won) {
    resultOverlay.className = 'win active';
    resultOverlay.textContent = '🏆 ¡GANASTE! 🏆';
    resultOverlay.style.display = 'block';

    let oldPlayerRank = gameState.player.rank;
    let oldEnemyRank = enemy.rank;

    gameState.player.rank = oldEnemyRank;
    enemy.rank = oldPlayerRank;
    gameState.ninjas.sort((a, b) => a.rank - b.rank);

    if (Math.random() < 0.1) {
      enemy.level = Math.min(100, enemy.level + Math.floor(Math.random() * 5) + 1);
      let f = STAT_FORMULAS[enemy.formulaIdx];
      let newBaseHp = Math.floor(f.hp(enemy.level));
      enemy.hp = newBaseHp;
      enemy.maxHp = newBaseHp;
      enemy.hpDisplay = newBaseHp * 6;
      enemy.maxHpDisplay = newBaseHp * 6;
      enemy.atk = Math.floor(f.atk(enemy.level));
      enemy.def = Math.floor(f.def(enemy.level));
      addCombatLog(`📚 ${enemy.name} entrenó → Lv.${enemy.level}!`, 'neutral');
    }

    addCombatLog(`✅ ${gameState.player.name} venció a ${enemy.name} (Rango #${oldPlayerRank}→#${gameState.player.rank})`, 'win');
  } else {
    resultOverlay.className = 'lose active';
    resultOverlay.textContent = '💀 PERDISTE 💀';
    resultOverlay.style.display = 'block';

    addCombatLog(`❌ ${gameState.player.name} perdió vs ${enemy.name} y mantuvo el rango #${gameState.player.rank}`, 'lose');
  }

  updatePlayerDisplay();
  updatePlayerStatsDisplay();
  renderChallengeCards();
  saveBattleProgress();

  setTimeout(() => {
    showScreen('main');
    resultOverlay.className = '';
    resultOverlay.style.display = 'none';
    gameState.selectedEnemy = null;
  }, 3000);
}

// ==================== COMBAT LOG ====================
function addCombatLog(msg, type) {
  let now = new Date();
  let time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;

  gameState.combatLog.unshift({ time, msg, type });
  if (gameState.combatLog.length > 8) gameState.combatLog.pop();

  renderCombatLog();
  saveBattleProgress();
}

function renderCombatLog() {
  let logEl = document.getElementById('combat-log');
  logEl.innerHTML = '<div style="text-align:center;color:#607080;font-size:7px;padding:1px;">📜 Últimos Combates entre Ninjas</div>';

  gameState.combatLog.forEach(entry => {
    let div = document.createElement('div');
    div.className = `log-entry ${entry.type}`;
    div.innerHTML = `<span class="log-time">${entry.time}</span><span>${entry.msg}</span>`;
    logEl.appendChild(div);
  });
}

// ==================== NOTIFICATIONS ====================
function addNotification(msg, type) {
  gameState.notifications.unshift({ msg, type, read: false });
  gameState.notifCount = gameState.notifications.filter(n => !n.read).length;

  let badge = document.getElementById('msg-badge');
  if (gameState.notifCount > 0) {
    badge.style.display = 'flex';
    badge.textContent = gameState.notifCount;
  }
}

function toggleMessages() {
  let overlay = document.getElementById('messages-overlay');
  overlay.classList.toggle('active');

  if (overlay.classList.contains('active')) {
    let list = document.getElementById('notif-list');
    list.innerHTML = '';

    if (gameState.notifications.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#607080;font-size:9px;padding:20px;">Sin notificaciones 💤</div>';
    } else {
      gameState.notifications.forEach(n => {
        let div = document.createElement('div');
        div.className = `notif-entry ${n.type}`;
        div.innerHTML = `${n.type === 'win' ? '🏆' : '💀'} ${n.msg}`;
        list.appendChild(div);
        n.read = true;
      });
    }

    gameState.notifCount = 0;
    document.getElementById('msg-badge').style.display = 'none';
    saveBattleProgress();
  }
}

// ==================== LEADERBOARD ====================
function toggleLeaderboard() {
  let overlay = document.getElementById('leaderboard-overlay');
  overlay.classList.toggle('active');
  if (overlay.classList.contains('active')) {
    renderLeaderboard();
  }
}

function renderLeaderboard() {
  let list = document.getElementById('lb-list');
  list.innerHTML = '';

  let allSorted = [...gameState.ninjas].sort((a, b) => a.rank - b.rank);

  allSorted.forEach(ninja => {
    let entry = document.createElement('div');
    entry.className = 'lb-entry';
    if (ninja.rank === gameState.player.rank) entry.classList.add('player-row');

    let rankClass = '';
    if (ninja.rank === 1) rankClass = 'p1';
    else if (ninja.rank <= 3) rankClass = 'p2';
    else if (ninja.rank <= 10) rankClass = 'p10';
    else if (ninja.rank <= 25) rankClass = 'p25';

    let rewards = getRewards(ninja.rank);

    entry.innerHTML = `
      <span class="lb-pos ${rankClass}">#${ninja.rank}</span>
      <span style="font-size:11px">${ninja.emoji}</span>
      <span class="lb-name">${ninja.name}</span>
      <span style="color:#607080;font-size:7px">Lv.${ninja.level}</span>
      <span class="lb-reward">${rewards}</span>
    `;
    list.appendChild(entry);
  });
}

function getRewards(rank) {
  if (rank === 1) return '💰15K ⭐25';
  if (rank <= 3) return '💰10K ⭐15';
  if (rank <= 10) return '💰4K ⭐6';
  if (rank <= 25) return '💰1K ⭐2';
  if (rank <= 70) return '💰300';
  return '';
}

// ==================== EVENT TIMER ====================
function startEventTimer() {
  setInterval(() => {
    recalcEventTime();

    let h = Math.floor(gameState.eventTime / 3600);
    let m = Math.floor((gameState.eventTime % 3600) / 60);
    let s = gameState.eventTime % 60;
    let timeStr = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;

    document.getElementById('event-timer').textContent = timeStr;
    document.getElementById('lb-countdown').textContent = timeStr;

    if (gameState.eventTime <= 0) {
      document.getElementById('event-timer').textContent = '🏁 FINALIZADO';
    }
  }, 1000);
}

// ==================== NINJA AI ====================
function startNinjaAI() {
  setInterval(() => {
    const now = nowMs();
    if (now > gameState.lastProcessedAt + 1500) {
      processOfflineProgress();
    }

    gameState.ninjas.forEach(ninja => {
      if (ninja.nextAttackAt <= now) {
        let validTargets = gameState.ninjas.filter(n =>
          n.rank >= ninja.rank - 3 && n.rank < ninja.rank && n.rank !== ninja.rank
        );

        if (validTargets.length > 0) {
          let target = validTargets[Math.floor(Math.random() * validTargets.length)];
          simulateNinjaFight(ninja, target);
        }

        ninja.firstAttackDone = true;
        ninja.nextAttackAt = now + (getRandomAttackCooldown() * 1000);
      }

      ninja.nextAttackTime = Math.max(1, Math.ceil((ninja.nextAttackAt - now) / 1000));
    });

    gameState.lastProcessedAt = now;

    if (!gameState.battleActive) {
      renderChallengeCards();
    }
  }, 1000);
}

function simulateNinjaFight(attacker, defender, options = {}) {
  const { deferSave = false } = options;
  const wasPlayerDefender = defender.rank === gameState.player.rank;
  const oldPlayerRank = gameState.player.rank;
  let attackPower = attacker.atk * 2 + attacker.spd * 0.3 + attacker.crt * 0.5;
  let defensePower = defender.def * 2 + defender.res * 0.3 + defender.eva * 0.5;

  attackPower *= (0.7 + Math.random() * 0.6);
  defensePower *= (0.7 + Math.random() * 0.6);

  if (attackPower > defensePower) {
    let tempRank = attacker.rank;
    attacker.rank = defender.rank;
    defender.rank = tempRank;

    gameState.ninjas.sort((a, b) => a.rank - b.rank);

    addCombatLog(`⚔️ ${attacker.emoji} ${attacker.name} venció a ${defender.emoji} ${defender.name} (#${tempRank}→#${attacker.rank})`, 'win');

    if (wasPlayerDefender) {
      gameState.player.rank = defender.rank;
      addNotification(`${attacker.name} te atacó y bajaste de #${oldPlayerRank} a #${gameState.player.rank}`, 'lose');
    }
  } else {
    addCombatLog(`🛡️ ${defender.emoji} ${defender.name} defendió su puesto vs ${attacker.emoji} ${attacker.name}`, 'neutral');

    if (wasPlayerDefender) {
      addNotification(`${attacker.name} te atacó, defendiste tu puesto y conservaste el rango #${gameState.player.rank}`, 'win');
    }
  }

  if (Math.random() < 0.1) {
    let loser = attackPower > defensePower ? defender : attacker;
    loser.level = Math.min(100, loser.level + Math.floor(Math.random() * 3) + 1);
    let f = STAT_FORMULAS[loser.formulaIdx];
    let newBaseHp = Math.floor(f.hp(loser.level));
    loser.hp = newBaseHp;
    loser.maxHp = newBaseHp;
    loser.hpDisplay = newBaseHp * 6;
    loser.maxHpDisplay = newBaseHp * 6;
    loser.atk = Math.floor(f.atk(loser.level));
    loser.def = Math.floor(f.def(loser.level));
    addCombatLog(`📚 ${loser.name} entrenó → Lv.${loser.level}!`, 'neutral');
  }

  if (!deferSave) {
    saveBattleProgress();
  }
}
