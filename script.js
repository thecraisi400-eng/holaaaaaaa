/* ─────────────────────────────────────────────
   ESTADO DEL JUEGO - VALORES FIJOS SOLICITADOS
───────────────────────────────────────────── */
const state = {
  hp: 100, hpMax: 100,
  mp: 100, mpMax: 100,
  exp: 0, expMax: 1000,
  gold: 100,
  atk: 10, def: 10,
  level: 1,
  rank: 'GENIN',
  heroSnapshot: null,
  expCurrentLevelStart: 0,
  activeSection: 'heroe',
  inBattle: false,
};

const SAVE_KEY = 'ngs_rpg_save_data';
const HERO_REGEN_RATE_PER_SECOND = 0.07;
const HERO_REGEN_INTERVAL_MS = 1000;
const BATTLE_HUD_UPDATE_INTERVAL_MS = 80;
let heroRegenIntervalId = null;
let lastBattleHudUpdateAt = 0;
let pendingBattleHudFrameId = null;
let pendingBattleHudPayload = null;

function setGold(nextGold) {
  const normalizedGold = Math.max(0, Number(nextGold) || 0);
  if (normalizedGold === state.gold) return;
  state.gold = normalizedGold;
  updateBars();
  window.dispatchEvent(new CustomEvent('ngs:gold-updated', { detail: { gold: state.gold } }));
}

function setHp(nextHp) {
  const normalizedHp = Math.max(0, Math.min(state.hpMax, Number(nextHp) || 0));
  if (normalizedHp === state.hp) return;
  state.hp = normalizedHp;
  updateBars();
}

function setMp(nextMp) {
  const normalizedMp = Math.max(0, Math.min(state.mpMax, Number(nextMp) || 0));
  if (normalizedMp === state.mp) return;
  state.mp = normalizedMp;
  updateBars();
}

function persistGameState() {
  try {
    const savedRaw = localStorage.getItem(SAVE_KEY);
    if (!savedRaw || !state.heroSnapshot) return;
    const saveObject = JSON.parse(savedRaw);
    const nextSave = {
      ...saveObject,
      level: state.heroSnapshot.level,
      exp: state.heroSnapshot.exp,
      rank: state.heroSnapshot.rank || saveObject.rank || 'GENIN',
      gold: state.gold,
      hp: state.hp,
      mp: state.mp,
      timestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(nextSave));
  } catch (error) {
    console.warn('No se pudo persistir el progreso.', error);
  }
}

function rankFromLevel(level) {
  if (level >= 80) return 'KAGE';
  if (level >= 60) return 'ANBU';
  if (level >= 40) return 'JONIN';
  if (level >= 20) return 'CHUNIN';
  return 'GENIN';
}

window.GameState = window.GameState || {};
window.GameState.getGold = () => state.gold;
window.GameState.setGold = setGold;
window.GameState.getHpState = () => ({ hp: state.hp, hpMax: state.hpMax });
window.GameState.getMpState = () => ({ mp: state.mp, mpMax: state.mpMax });
window.GameState.setHp = setHp;
window.GameState.setMp = setMp;
window.GameState.setBattleActive = (active) => { state.inBattle = Boolean(active); };
window.GameState.isBattleActive = () => state.inBattle;
window.GameState.persist = persistGameState;

const sections = {
  heroe:        { icon:'🥷', title:'HÉROE',           desc:'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
  misiones:     { icon:'📜', title:'MISIONES',         desc:'Acepta misiones de rango D a S. Completa objetivos para ganar EXP, oro y recompensas exclusivas.' },
  clanes:       { icon:'⛩️', title:'CLANES',           desc:'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
  eventos:      { icon:'🎴', title:'EVENTOS',          desc:'¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
  jutsus:       { icon:'🌀', title:'JUTSUS',           desc:'Gestiona tus técnicas ninja. Equipa hasta 6 jutsus activos y mejora sus rangos con sellos de chakra.' },
  batallas:     { icon:'⚔️', title:'BATALLAS',         desc:'Modo PvP y arena de rango. Desafía a otros jugadores y sube en la tabla clasificatoria mundial.' },
  invocaciones: { icon:'✨', title:'INVOCACIONES',     desc:'Invoca nuevos compañeros y objetos míticos. Utiliza pergaminos de convocación para obtener aliados S-Rank.' },
  habilidades:  { icon:'🌿', title:'ÁRBOL DE HABILIDAD', desc:'Asigna puntos de habilidad en ramas de Ninjutsu, Taijutsu y Genjutsu para personalizar tu estilo de combate.' },
  ajustes:      { icon:'⚙️', title:'AJUSTES',          desc:'Configura notificaciones, audio, gráficos y tu cuenta de shinobi. También puedes vincular tu aldea.' },
};

function syncCharacterIdentity(saveData) {
  if (!saveData) return;

  const topNameEl = document.getElementById('charName');
  if (topNameEl && saveData.character) {
    topNameEl.textContent = saveData.character.toUpperCase();
  }

  const heroNameEl = document.querySelector('.hs-char-name');
  if (heroNameEl && saveData.character) {
    heroNameEl.innerHTML = saveData.character.toUpperCase().replace(/\s+/g, '<br>');
  }

  const heroClanEl = document.querySelector('.hs-char-clan-name');
  if (heroClanEl && saveData.clanName) {
    heroClanEl.textContent = saveData.clanName;
  }
}

function syncCharacterSprite(saveData) {
  const spriteSrc = saveData?.characterSprite;

  const topSpriteImg = document.getElementById('topCharacterSprite');
  const topSpritePlaceholder = document.getElementById('topCharacterSpritePlaceholder');
  if (topSpriteImg) {
    if (spriteSrc) {
      topSpriteImg.src = spriteSrc;
      topSpriteImg.style.display = 'block';
      if (topSpritePlaceholder) topSpritePlaceholder.style.display = 'none';
    } else {
      topSpriteImg.removeAttribute('src');
      topSpriteImg.style.display = '';
      if (topSpritePlaceholder) topSpritePlaceholder.style.display = '';
    }
  }

  if (window.HeroSystem && typeof window.HeroSystem.setCharacterSprite === 'function') {
    window.HeroSystem.setCharacterSprite(spriteSrc || '');
  }
}

function syncStateFromHero(snapshot) {
  if (!snapshot) return;
  const sameCharacter = state.heroSnapshot?.characterId === snapshot.characterId;
  const preservedHp = sameCharacter ? state.hp : snapshot.stats.HP;
  const preservedMp = sameCharacter ? state.mp : snapshot.stats.MP;

  state.heroSnapshot = snapshot;
  state.hp = Math.max(0, Math.min(snapshot.stats.HP, preservedHp));
  state.hpMax = snapshot.stats.HP;
  state.mp = Math.max(0, Math.min(snapshot.stats.MP, preservedMp));
  state.mpMax = snapshot.stats.MP;
  state.exp = snapshot.exp;
  state.expCurrentLevelStart = snapshot.expCurrentLevelStart || 0;
  state.expMax = snapshot.expNextLevelTarget;
  state.level = snapshot.level;
  state.atk = snapshot.stats.ATK;
  state.def = snapshot.stats.DEF;
  state.rank = snapshot.rank || 'GENIN';

  const rankEl = document.getElementById('charRank');
  if (rankEl) rankEl.textContent = state.rank;
  const atkEl = document.getElementById('statAtk');
  if (atkEl) atkEl.textContent = state.atk.toLocaleString();
  const defEl = document.getElementById('statDef');
  if (defEl) defEl.textContent = state.def.toLocaleString();
}

function stopHeroRegen() {
  if (!heroRegenIntervalId) return;
  clearInterval(heroRegenIntervalId);
  heroRegenIntervalId = null;
}

function runHeroRegenTick() {
  if (state.activeSection !== 'heroe') return;
  if (state.hpMax <= 0 && state.mpMax <= 0) return;

  const hpGain = state.hpMax > 0 ? Math.max(1, Math.round(state.hpMax * HERO_REGEN_RATE_PER_SECOND)) : 0;
  const mpGain = state.mpMax > 0 ? Math.max(1, Math.round(state.mpMax * HERO_REGEN_RATE_PER_SECOND)) : 0;
  const nextHp = Math.min(state.hpMax, state.hp + hpGain);
  const nextMp = Math.min(state.mpMax, state.mp + mpGain);
  const changed = nextHp !== state.hp || nextMp !== state.mp;
  if (!changed) return;

  setHp(nextHp);
  setMp(nextMp);
  persistGameState();
}

function startHeroRegen() {
  stopHeroRegen();
  heroRegenIntervalId = setInterval(runHeroRegenTick, HERO_REGEN_INTERVAL_MS);
}

window.ProgressionService = {
  applyRewards({ xp = 0, gold = 0, source = 'unknown', missionName = '' } = {}) {
    const hero = window.CharacterStatsSystem?.getActiveHero?.();
    if (!hero || !window.CharacterStatsSystem) return null;

    const totalXp = Math.max(0, Number(hero.exp || 0) + Math.max(0, Number(xp) || 0));
    let nextLevel = hero.level || 1;
    while (nextLevel < 100 && totalXp >= window.CharacterStatsSystem.getXpAtLevel(hero.characterId, nextLevel + 1)) {
      nextLevel += 1;
    }

    const nextRank = rankFromLevel(nextLevel);
    const updatedHero = window.CharacterStatsSystem.buildHeroSnapshot(hero.characterId, nextLevel, totalXp, nextRank);
    if (!updatedHero) return null;
    const equipmentBonuses = { ...(hero.equipmentBonuses || {}) };
    const derivedStats = { ...(updatedHero.stats || {}) };
    Object.entries(equipmentBonuses).forEach(([key, value]) => {
      derivedStats[key] = (derivedStats[key] || 0) + (Number(value) || 0);
    });
    updatedHero.baseStats = { ...(updatedHero.stats || {}) };
    updatedHero.equipmentBonuses = equipmentBonuses;
    updatedHero.stats = derivedStats;

    window.CharacterStatsSystem.setActiveHero(updatedHero);
    setGold(state.gold + Math.max(0, Number(gold) || 0));

    window.dispatchEvent(new CustomEvent('ngs:progression-updated', {
      detail: {
        source,
        missionName,
        rewards: { xp, gold },
        level: updatedHero.level,
        rank: updatedHero.rank
      }
    }));
    persistGameState();
    return updatedHero;
  }
};

function getSyncedHeroSnapshot(snapshot) {
  const heroFromPanel = window.HeroSystem && typeof window.HeroSystem.getHeroSnapshot === 'function'
    ? window.HeroSystem.getHeroSnapshot()
    : null;

  if (!heroFromPanel || !snapshot) return snapshot || heroFromPanel;
  if (heroFromPanel.characterId !== snapshot.characterId) return snapshot;

  return heroFromPanel;
}

/* ─────────────────────────────────────────────
   ACTUALIZACIÓN DE BARRAS - VALORES ESTÁTICOS
   ✅ Sin incremento automático de EXP, Gold, HP o MP
───────────────────────────────────────────── */
function updateBars() {
  // 🔒 Valores fijos - sin cambios automáticos
  const hpPct  = Math.round((state.hpMax > 0 ? state.hp / state.hpMax : 0) * 100);
  const mpPct  = Math.round((state.mpMax > 0 ? state.mp / state.mpMax : 0) * 100);
  const expSpan = Math.max(1, state.expMax - state.expCurrentLevelStart);
  const expPct = Math.round(Math.min(100, Math.max(0, ((state.exp - state.expCurrentLevelStart) / expSpan) * 100)));

  if (!updateBars.refs) {
    updateBars.refs = {
      hpFill: document.getElementById('hpFill'),
      mpFill: document.getElementById('mpFill'),
      expFill: document.getElementById('expFill'),
      hpCur: document.getElementById('hpCur'),
      hpMax: document.getElementById('hpMax'),
      hpPct: document.getElementById('hpPct'),
      mpCur: document.getElementById('mpCur'),
      mpMax: document.getElementById('mpMax'),
      mpPct: document.getElementById('mpPct'),
      expLevel: document.getElementById('expLevel'),
      expNext: document.getElementById('expNext'),
      statGold: document.getElementById('statGold')
    };
    updateBars.last = {};
  }
  const refs = updateBars.refs;
  const last = updateBars.last;

  if (last.hpPct !== hpPct && refs.hpFill) refs.hpFill.style.width = hpPct + '%';
  if (last.mpPct !== mpPct && refs.mpFill) refs.mpFill.style.width = mpPct + '%';
  if (last.expPct !== expPct && refs.expFill) refs.expFill.style.width = expPct + '%';

  if (last.hp !== state.hp && refs.hpCur) refs.hpCur.textContent = state.hp.toLocaleString();
  if (last.hpMax !== state.hpMax && refs.hpMax) refs.hpMax.textContent = state.hpMax.toLocaleString();
  if (last.hpPct !== hpPct && refs.hpPct) refs.hpPct.textContent = hpPct + '%';
  if (last.mp !== state.mp && refs.mpCur) refs.mpCur.textContent = state.mp.toLocaleString();
  if (last.mpMax !== state.mpMax && refs.mpMax) refs.mpMax.textContent = state.mpMax.toLocaleString();
  if (last.mpPct !== mpPct && refs.mpPct) refs.mpPct.textContent = mpPct + '%';

  const expNowInLevel = Math.max(0, state.exp - state.expCurrentLevelStart);
  const expNeededInLevel = Math.max(1, state.expMax - state.expCurrentLevelStart);
  if (last.level !== state.level && refs.expLevel) refs.expLevel.textContent = state.level;
  
  const expText = `${expNowInLevel.toLocaleString()} / ${expNeededInLevel.toLocaleString()} EXP — Próx. nivel: ${Math.max(0, state.expMax - state.exp).toLocaleString()}`;
  if (last.expText !== expText && refs.expNext) refs.expNext.textContent = expText;
  
  if (last.gold !== state.gold && refs.statGold) refs.statGold.textContent = state.gold.toLocaleString();

  updateBars.last = {
    hp: state.hp,
    hpMax: state.hpMax,
    hpPct,
    mp: state.mp,
    mpMax: state.mpMax,
    mpPct,
    expPct,
    level: state.level,
    expText,
    gold: state.gold
  };
}

// ✅ Llamada única al iniciar - SIN setInterval para valores estáticos
updateBars();

/* ─────────────────────────────────────────────
   PARTÍCULAS
───────────────────────────────────────────── */
function spawnParticles(x, y, type = 'chakra') {
  const container = document.getElementById('particleContainer');
  const count = type === 'smoke' ? 6 : 10;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = `particle ${type}`;

    const size = type === 'smoke'
      ? Math.random() * 18 + 10
      : Math.random() * 5 + 2;
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist;

    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x - size/2}px; top:${y - size/2}px;
      --tx:${tx}px; --ty:${ty}px;
      animation-delay:${Math.random() * .1}s;
      animation-duration:${Math.random() * .4 + .5}s;
    `;
    container.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

/* ─────────────────────────────────────────────
   TEXTO FLOTANTE
───────────────────────────────────────────── */
function spawnFloatText(x, y, text, color = '#2ecfcf') {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.cssText = `left:${x - 30}px; top:${y - 20}px; color:${color};`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/* ─────────────────────────────────────────────
   NAVEGACIÓN DE BOTONES
───────────────────────────────────────────── */
const overlay      = document.getElementById('section-overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayDesc  = document.getElementById('overlayDesc');
const overlayClose = document.getElementById('overlayClose');

function renderCenterSection(sectionKey) {
  const isHero = sectionKey === 'heroe';
  const isMissions = sectionKey === 'misiones';
  const isJutsus = sectionKey === 'jutsus';

  if (isHero) {
    overlay.classList.remove('visible');
    startHeroRegen();
    if (window.MissionSystem && window.MissionSystem.isMounted()) {
      window.MissionSystem.unmount();
    }
    if (window.JutsuSystem && window.JutsuSystem.isMounted()) {
      window.JutsuSystem.unmount();
    }
    if (window.HeroSystem && !window.HeroSystem.isMounted()) {
      window.HeroSystem.mount();
    }
    return;
  }

  if (isMissions) {
    overlay.classList.remove('visible');
    stopHeroRegen();
    if (window.HeroSystem && window.HeroSystem.isMounted()) {
      window.HeroSystem.unmount();
    }
    if (window.JutsuSystem && window.JutsuSystem.isMounted()) {
      window.JutsuSystem.unmount();
    }
    if (window.MissionSystem && !window.MissionSystem.isMounted()) {
      window.MissionSystem.mount();
    }
    if (window.MissionSystem) {
      window.MissionSystem.setHeroLevel(state.level);
    }
    return;
  }

  if (isJutsus) {
    overlay.classList.remove('visible');
    stopHeroRegen();
    if (window.HeroSystem && window.HeroSystem.isMounted()) {
      window.HeroSystem.unmount();
    }
    if (window.MissionSystem && window.MissionSystem.isMounted()) {
      window.MissionSystem.unmount();
    }
    if (window.JutsuSystem && !window.JutsuSystem.isMounted()) {
      window.JutsuSystem.mount();
    }
    return;
  }

  stopHeroRegen();
  if (window.HeroSystem && window.HeroSystem.isMounted()) {
    window.HeroSystem.unmount();
  }
  if (window.MissionSystem && window.MissionSystem.isMounted()) {
    window.MissionSystem.unmount();
  }
  if (window.JutsuSystem && window.JutsuSystem.isMounted()) {
    window.JutsuSystem.unmount();
  }

  const info = sections[sectionKey];
  if (info) {
    overlayTitle.innerHTML = `${info.icon} ${info.title}`;
    overlayDesc.textContent = info.desc;
    overlay.classList.add('visible');
  }
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    spawnParticles(cx, cy, 'smoke');
    spawnParticles(cx, cy, 'chakra');

    const sec = btn.dataset.section;
    const labels = { heroe:'HÉROE', misiones:'MISIONES', clanes:'CLANES', eventos:'EVENTOS', jutsus:'JUTSUS', batallas:'BATALLAS', invocaciones:'INVOCAR', habilidades:'ÁRBOL', ajustes:'AJUSTES' };
    spawnFloatText(cx, cy, '▶ ' + (labels[sec] || sec), '#e8923a');

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeSection = sec;
    renderCenterSection(sec);
  });
});

overlayClose.addEventListener('click', () => {
  overlay.classList.remove('visible');
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  spawnParticles(cx, cy, 'amber-spark');
});

renderCenterSection(state.activeSection);

window.addEventListener('ngs:game-entered', (event) => {
  const saveData = event?.detail?.saveData;
  syncCharacterIdentity(saveData);
  syncCharacterSprite(saveData);

  if (window.CharacterStatsSystem && saveData?.characterId) {
    const snapshot = window.CharacterStatsSystem.buildHeroSnapshot(
      saveData.characterId,
      saveData.level || 1,
      saveData.exp || 0,
      saveData.rank || window.CharacterStatsSystem.DEFAULT_RANK
    );
    if (snapshot) {
      window.CharacterStatsSystem.setActiveHero(snapshot);
      syncStateFromHero(getSyncedHeroSnapshot(snapshot));
      updateBars();
      if (window.MissionSystem) {
        window.MissionSystem.setHeroLevel(state.level);
      }
      if (saveData?.gold != null) {
        setGold(saveData.gold);
      }
      if (saveData?.hp != null) {
        setHp(saveData.hp);
      }
      if (saveData?.mp != null) {
        setMp(saveData.mp);
      }
    }
  }
});

window.addEventListener('ngs:hero-stats-updated', (event) => {
  const snapshot = event?.detail?.hero;
  if (!snapshot) return;
  syncStateFromHero(getSyncedHeroSnapshot(snapshot));
  updateBars();
  if (window.MissionSystem) {
    window.MissionSystem.setHeroLevel(state.level);
  }
});

window.addEventListener('ngs:battle-started', (event) => {
  const context = event?.detail?.context;
  if (!context) return;
  window.GameState.setBattleActive(true);
});

window.addEventListener('ngs:battle-tick', (event) => {
  const hero = event?.detail?.hero;
  if (!hero) return;
  pendingBattleHudPayload = hero;
  if (pendingBattleHudFrameId) return;

  pendingBattleHudFrameId = requestAnimationFrame(() => {
    pendingBattleHudFrameId = null;
    const now = performance.now();
    if (now - lastBattleHudUpdateAt < BATTLE_HUD_UPDATE_INTERVAL_MS) return;
    lastBattleHudUpdateAt = now;
    const payload = pendingBattleHudPayload;
    if (!payload) return;
    setHp(payload.hp);
    if (payload.mp != null) setMp(payload.mp);
  });
});

window.addEventListener('ngs:battle-ended', (event) => {
  const detail = event?.detail || {};
  const delta = detail.delta || {};
  if (delta.hp != null) setHp(delta.hp);
  if (delta.mp != null) setMp(delta.mp);
  if (!detail.nextRound) {
    window.GameState.setBattleActive(false);
    persistGameState();
  }
});
