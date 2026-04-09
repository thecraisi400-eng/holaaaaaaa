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
  characterVisual: { spriteSrc: '', characterId: '', characterName: '' }
};

function emitStateUpdated(reason = 'sync') {
  window.dispatchEvent(new CustomEvent('ngs:state-updated', {
    detail: {
      reason,
      state: { ...state }
    }
  }));
}

function updateState(partial, reason = 'update') {
  Object.assign(state, partial);
  updateBars();
  emitStateUpdated(reason);
}

function setGold(nextGold) {
  const normalizedGold = Math.max(0, Number(nextGold) || 0);
  updateState({ gold: normalizedGold }, 'gold');
  window.dispatchEvent(new CustomEvent('ngs:gold-updated', { detail: { gold: state.gold } }));
}

window.GameState = window.GameState || {};
window.GameState.getGold = () => state.gold;
window.GameState.setGold = setGold;
window.GameState.addGold = (gold) => setGold(state.gold + (Number(gold) || 0));
window.GameState.getState = () => ({ ...state });
window.GameState.syncHeroSnapshot = (snapshot) => {
  syncStateFromHero(snapshot);
  updateBars();
};
window.GameState.setCharacterVisual = (payload = {}) => {
  const visual = {
    spriteSrc: payload.spriteSrc || '',
    characterId: payload.characterId || '',
    characterName: payload.characterName || ''
  };
  updateState({ characterVisual: visual }, 'character-visual');
};
window.GameState.setPlayerVitals = ({ hp, mp }) => {
  const nextHp = hp == null ? state.hp : Math.max(0, Math.min(state.hpMax, Number(hp) || 0));
  const nextMp = mp == null ? state.mp : Math.max(0, Math.min(state.mpMax, Number(mp) || 0));
  updateState({ hp: nextHp, mp: nextMp }, 'player-vitals');
};

const sections = {
  heroe:        { icon:'🥷', title:'HÉROE',           desc:'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
  misiones:     { icon:'📜', title:'MISIONES',         desc:'Acepta misiones de rango D a S. Completa objetivos para ganar EXP, oro y recompensas exclusivas.' },
  clanes:       { icon:'⛩️', title:'CLANES',           desc:'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
  eventos:      { icon:'🎴', title:'EVENTOS',          desc:'¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
  jutsus:       { icon:'🌀', title:'JUTSUS',           desc:'Gestiona tus técnicas ninja. Equipa hasta 4 jutsus activos y mejora sus rangos con sellos de chakra.' },
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
  if (window.GameState && typeof window.GameState.setCharacterVisual === 'function') {
    window.GameState.setCharacterVisual({
      spriteSrc: spriteSrc || '',
      characterId: saveData?.characterId || '',
      characterName: saveData?.character || ''
    });
  }

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
  const nextHpMax = snapshot.stats.HP;
  const nextMpMax = snapshot.stats.MP;
  const nextHp = Math.max(0, Math.min(state.hp, nextHpMax));
  const nextMp = Math.max(0, Math.min(state.mp, nextMpMax));
  state.heroSnapshot = snapshot;
  state.hp = nextHp;
  state.hpMax = nextHpMax;
  state.mp = nextMp;
  state.mpMax = nextMpMax;
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
  emitStateUpdated('hero-snapshot');
}

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

  document.getElementById('hpFill').style.width  = hpPct  + '%';
  document.getElementById('mpFill').style.width  = mpPct  + '%';
  document.getElementById('expFill').style.width = expPct + '%';

  document.getElementById('hpCur').textContent  = state.hp.toLocaleString();
  document.getElementById('hpMax').textContent  = state.hpMax.toLocaleString();
  document.getElementById('hpPct').textContent  = hpPct  + '%';
  document.getElementById('mpCur').textContent  = state.mp.toLocaleString();
  document.getElementById('mpMax').textContent  = state.mpMax.toLocaleString();
  document.getElementById('mpPct').textContent  = mpPct  + '%';

  const expNowInLevel = Math.max(0, state.exp - state.expCurrentLevelStart);
  const expNeededInLevel = Math.max(1, state.expMax - state.expCurrentLevelStart);
  const levelEl = document.getElementById('expLevel');
  if (levelEl) levelEl.textContent = state.level;
  
  document.getElementById('expNext').textContent =
    `${expNowInLevel.toLocaleString()} / ${expNeededInLevel.toLocaleString()} EXP — Próx. nivel: ${Math.max(0, state.expMax - state.exp).toLocaleString()}`;
  
  document.getElementById('statGold').textContent = state.gold.toLocaleString();
}

// ✅ Llamada única al iniciar - SIN setInterval para valores estáticos
updateBars();
emitStateUpdated('bootstrap');

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
let heroRegenInterval = null;

function cleanupBattleProcesses() {
  if (window.MissionSystem && typeof window.MissionSystem.destroyBattle === 'function') {
    window.MissionSystem.destroyBattle();
  }
  if (window.game && typeof window.game.destroy === 'function') {
    window.game.destroy();
  }
  window.game = null;
}

function stopHeroRegeneration() {
  if (!heroRegenInterval) return;
  clearInterval(heroRegenInterval);
  heroRegenInterval = null;
}

function startHeroRegeneration() {
  if (heroRegenInterval) return;

  heroRegenInterval = setInterval(() => {
    if (state.activeSection !== 'heroe') {
      stopHeroRegeneration();
      return;
    }

    const hpRegen = Math.max(1, Math.round(state.hpMax * 0.07));
    const mpRegen = Math.max(1, Math.round(state.mpMax * 0.07));
    const nextHp = Math.min(state.hpMax, state.hp + hpRegen);
    const nextMp = Math.min(state.mpMax, state.mp + mpRegen);

    if (nextHp === state.hp && nextMp === state.mp) return;
    updateState({ hp: nextHp, mp: nextMp }, 'hero-regen');
  }, 1000);
}

function renderCenterSection(sectionKey) {
  const isHero = sectionKey === 'heroe';
  const isMissions = sectionKey === 'misiones';

  if (isHero) {
    startHeroRegeneration();
  } else {
    stopHeroRegeneration();
  }

  if (isHero) {
    overlay.classList.remove('visible');
    if (window.MissionSystem && window.MissionSystem.isMounted()) {
      window.MissionSystem.unmount();
    }
    if (window.HeroSystem && !window.HeroSystem.isMounted()) {
      window.HeroSystem.mount();
    }
    return;
  }

  if (isMissions) {
    overlay.classList.remove('visible');
    if (window.HeroSystem && window.HeroSystem.isMounted()) {
      window.HeroSystem.unmount();
    }
    if (window.MissionSystem && !window.MissionSystem.isMounted()) {
      window.MissionSystem.mount();
    }
    if (window.MissionSystem) {
      window.MissionSystem.setHeroLevel(state.level);
    }
    return;
  }

  if (window.HeroSystem && window.HeroSystem.isMounted()) {
    window.HeroSystem.unmount();
  }
  if (window.MissionSystem && window.MissionSystem.isMounted()) {
    window.MissionSystem.unmount();
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
    cleanupBattleProcesses();
    updateState({ activeSection: sec }, 'section-change');
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
    }
  }

  if (window.HeroSystem && typeof window.HeroSystem.applyEquipmentSnapshot === 'function' && saveData?.equipment) {
    window.HeroSystem.applyEquipmentSnapshot(saveData.equipment);
  }

  if (window.GameState && typeof window.GameState.setGold === 'function') {
    window.GameState.setGold(saveData?.gold ?? state.gold);
  }
  if (window.GameState && typeof window.GameState.setPlayerVitals === 'function') {
    window.GameState.setPlayerVitals({
      hp: saveData?.hp ?? state.hp,
      mp: saveData?.mp ?? state.mp
    });
  }

  if (window.MissionSystem && typeof window.MissionSystem.applySnapshot === 'function' && saveData?.mission) {
    window.MissionSystem.applySnapshot(saveData.mission);
  }

  const savedSection = saveData?.activeSection;
  if (savedSection && sections[savedSection]) {
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.section === savedSection));
    updateState({ activeSection: savedSection }, 'restore-section');
    renderCenterSection(savedSection);
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
