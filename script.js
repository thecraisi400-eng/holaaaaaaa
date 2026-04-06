/* ─────────────────────────────────────────────
   ESTADO DEL JUEGO - VALORES BASE
───────────────────────────────────────────── */
const state = {
  hp: 1000,
  hpMax: 1000,
  mp: 500,
  mpMax: 500,
  exp: 0,
  expMax: 1000,
  gold: 24850,
  atk: 120,
  def: 80,
  level: 1,
  activeSection: 'heroe',
};

const sections = {
  heroe:        { icon:'🥷', title:'HÉROE',              desc:'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
  misiones:     { icon:'📜', title:'MISIONES',           desc:'Acepta misiones de rango D a S. Completa objetivos para ganar EXP, oro y recompensas exclusivas.' },
  clanes:       { icon:'⛩️', title:'CLANES',             desc:'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
  eventos:      { icon:'🎴', title:'EVENTOS',            desc:'¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
  jutsus:       { icon:'🌀', title:'JUTSUS',             desc:'Gestiona tus técnicas ninja. Equipa hasta 4 jutsus activos y mejora sus rangos con sellos de chakra.' },
  batallas:     { icon:'⚔️', title:'BATALLAS',           desc:'Modo PvP y arena de rango. Desafía a otros jugadores y sube en la tabla clasificatoria mundial.' },
  invocaciones: { icon:'✨', title:'INVOCACIONES',       desc:'Invoca nuevos compañeros y objetos míticos. Utiliza pergaminos de convocación para obtener aliados S-Rank.' },
  habilidades:  { icon:'🌿', title:'ÁRBOL DE HABILIDAD', desc:'Asigna puntos de habilidad en ramas de Ninjutsu, Taijutsu y Genjutsu para personalizar tu estilo de combate.' },
  ajustes:      { icon:'⚙️', title:'AJUSTES',            desc:'Configura notificaciones, audio, gráficos y tu cuenta de shinobi. También puedes vincular tu aldea.' },
};

const heroState = {
  clan: 'Clan Uchiha',
  rank: 'ANBU',
  heroName: 'KAGE RYUU',
  spriteUrl: '',
  baseStats: {
    str: 284,
    agi: 197,
    int: 156,
    luk: 88,
    def: 312,
    res: 241,
    crit: 34,
    cd: 218,
    eva: 22,
    rgHp: 145,
  },
  slots: [
    { id: 'weapon1', icon: '⚔', name: 'Katana', level: 1, stat1: 'Ataque', stat1val: 680, statIcon1: '⚔', costBase: 2800 },
    { id: 'weapon2', icon: '✦', name: 'Shurikens', level: 1, stat1: 'Vel. Ataque', stat1val: 195, statIcon1: '💨', costBase: 1200 },
    { id: 'head', icon: '🪖', name: 'Máscara', level: 1, stat1: 'Res. Genjutsu', stat1val: 220, statIcon1: '🧠', costBase: 450 },
    { id: 'chest', icon: '🥋', name: 'Túnica ANBU', level: 1, stat1: 'Defensa', stat1val: 312, statIcon1: '🛡', costBase: 5200 },
    { id: 'gloves', icon: '🧤', name: 'Guanteletes', level: 1, stat1: 'Precisión', stat1val: 87, statIcon1: '◎', costBase: 1900 },
    { id: 'boots', icon: '👟', name: 'Botas Ninja', level: 1, stat1: 'Velocidad', stat1val: 197, statIcon1: '💨', costBase: 780 },
  ],
};

const MAX_SLOT_LEVEL = 80;
const hudCenter = document.getElementById('hud-center');
const overlay = document.getElementById('section-overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayDesc = document.getElementById('overlayDesc');
const overlayClose = document.getElementById('overlayClose');
let destroyHeroSection = null;

/* ─────────────────────────────────────────────
   HUD TOP
───────────────────────────────────────────── */
function updateBars() {
  const hpPct  = Math.max(0, Math.min(100, Math.round((state.hp / Math.max(1, state.hpMax)) * 100)));
  const mpPct  = Math.max(0, Math.min(100, Math.round((state.mp / Math.max(1, state.mpMax)) * 100)));
  const expPct = Math.max(0, Math.min(100, Math.round((state.exp / Math.max(1, state.expMax)) * 100)));

  document.getElementById('hpFill').style.width  = `${hpPct}%`;
  document.getElementById('mpFill').style.width  = `${mpPct}%`;
  document.getElementById('expFill').style.width = `${expPct}%`;

  document.getElementById('hpCur').textContent = state.hp.toLocaleString();
  document.getElementById('hpMax').textContent = state.hpMax.toLocaleString();
  document.getElementById('hpPct').textContent = `${hpPct}%`;

  document.getElementById('mpCur').textContent = state.mp.toLocaleString();
  document.getElementById('mpMax').textContent = state.mpMax.toLocaleString();
  document.getElementById('mpPct').textContent = `${mpPct}%`;

  document.getElementById('expNext').textContent = `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;

  document.getElementById('statGold').textContent = state.gold.toLocaleString();
  document.getElementById('statAtk').textContent = state.atk.toLocaleString();
  document.getElementById('statDef').textContent = state.def.toLocaleString();
  document.getElementById('charRank').textContent = heroState.rank;
  document.getElementById('charName').textContent = heroState.heroName;
}

/* ─────────────────────────────────────────────
   FX
───────────────────────────────────────────── */
function spawnParticles(x, y, type = 'chakra') {
  const container = document.getElementById('particleContainer');
  const count = type === 'smoke' ? 6 : 10;

  for (let i = 0; i < count; i += 1) {
    const p = document.createElement('div');
    p.className = `particle ${type}`;

    const size = type === 'smoke' ? Math.random() * 18 + 10 : Math.random() * 5 + 2;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x - size / 2}px; top:${y - size / 2}px;
      --tx:${tx}px; --ty:${ty}px;
      animation-delay:${Math.random() * 0.1}s;
      animation-duration:${Math.random() * 0.4 + 0.5}s;
    `;

    container.appendChild(p);
    p.addEventListener('animationend', () => p.remove(), { once: true });
  }
}

function spawnFloatText(x, y, text, color = '#2ecfcf') {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.cssText = `left:${x - 30}px; top:${y - 20}px; color:${color};`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

/* ─────────────────────────────────────────────
   HERO MODULE
───────────────────────────────────────────── */
function getHeroStatsFromState() {
  return {
    hp: state.hp,
    hpMax: state.hpMax,
    chakra: state.mp,
    chakraMax: state.mpMax,
    exp: state.exp,
    expMax: state.expMax,
    ...heroState.baseStats,
  };
}

function getRarity(level) {
  if (level <= 5) return { label: 'Madera', color: '#c8a060', glow: 'rgba(139,94,60,0.5)', border: '#8b5e3c', bg: 'rgba(139,94,60,0.18)' };
  if (level <= 15) return { label: 'Aprendiz', color: '#2ecc71', glow: 'rgba(46,204,113,0.45)', border: '#2ecc71', bg: 'rgba(46,204,113,0.12)' };
  if (level <= 30) return { label: 'Chunin', color: '#3498db', glow: 'rgba(52,152,219,0.45)', border: '#3498db', bg: 'rgba(52,152,219,0.12)' };
  if (level <= 45) return { label: 'Jonin', color: '#f1c40f', glow: 'rgba(241,196,15,0.5)', border: '#f1c40f', bg: 'rgba(241,196,15,0.12)' };
  if (level <= 60) return { label: 'ANBU', color: '#e74c3c', glow: 'rgba(231,76,60,0.5)', border: '#e74c3c', bg: 'rgba(231,76,60,0.15)' };
  return { label: 'Legendario', color: '#ffc83c', goldColor: '#ffaa33', glow: 'rgba(231,76,60,0.7)', border: '#e74c3c', bg: 'rgba(231,76,60,0.22)', extra: true };
}

function calcCost(slot) {
  return slot.costBase + slot.level * (slot.level * 12);
}

function calcStat(base, level) {
  return Math.round(base * (1 + level * 0.028));
}

function renderHeroTemplate() {
  hudCenter.innerHTML = `
    <section class="hero-sheet-root" aria-label="Panel de héroe">
      <div class="hero-sheet" id="heroSheet">
        <div class="hero-corner tl"></div>
        <div class="hero-corner tr"></div>
        <div class="hero-corner bl"></div>
        <div class="hero-corner br"></div>

        <div class="hero-col-identity">
          <div class="hero-avatar-wrap">
            <div class="hero-avatar-ring"></div>
            <div class="hero-avatar"><div class="hero-avatar-inner">🥷</div></div>
          </div>
          <div class="hero-char-name">${heroState.heroName.replace(' ', '<br>')}</div>
          <div class="hero-char-clan"><span class="hero-clan-dot"></span><span>${heroState.clan}</span><span class="hero-clan-dot"></span></div>
          <div class="hero-rank-badge">${heroState.rank}</div>
          <div class="hero-identity-divider"></div>
          <div class="hero-level-display">
            <div class="hero-level-lbl">Nivel</div>
            <div class="hero-level-num">${state.level}</div>
            <div class="hero-xp-mini-bar"><div class="hero-xp-mini-fill" id="heroXpMini"></div></div>
            <div class="hero-level-sub" id="heroLevelSub"></div>
          </div>
        </div>

        <div class="hero-col-gear">
          <div class="hero-gear-header">
            <div class="hero-gear-title">⚔ Equipamiento</div>
            <div class="hero-gold-display"><span>◆</span><span id="heroGoldAmount">0</span></div>
          </div>
          <div class="hero-gear-grid" id="heroGearGrid"></div>
          <div class="hero-extra-stats-area">
            <div class="hero-transparent-line"></div>
            <div class="hero-stats-extra-title">⚡ ESTADÍSTICAS BASE ⚡</div>
            <div id="heroExtraStats" class="hero-stats-extra-grid"></div>
          </div>
        </div>

        <div class="hero-col-stats">
          <div class="hero-stats-title">▸ Recursos</div>
          <div class="hero-vital-bar-wrap" id="heroVitalBars"></div>
          <div class="hero-stats-divider"></div>
          <div class="hero-sprite-box">
            <div class="hero-sprite-preview">
              <img id="heroSpriteImage" alt="personaje sprite" style="display:none;" />
              <div class="hero-sprite-placeholder" id="heroSpritePlaceholder">🎴<br>SIN SPRITE</div>
            </div>
          </div>
        </div>

        <div class="hero-modal-overlay" id="heroModalOverlay" aria-hidden="true">
          <div class="hero-modal">
            <button class="hero-modal-close" id="heroModalClose" aria-label="Cerrar">✕</button>
            <div class="hero-modal-header">
              <div class="hero-modal-icon" id="heroMIcon">⚔</div>
              <div class="hero-modal-title-group">
                <div class="hero-modal-item-name" id="heroMName"></div>
                <div class="hero-modal-rarity" id="heroMRarity"></div>
              </div>
            </div>
            <div class="hero-modal-section">
              <div class="hero-modal-section-title">Costo Mejora</div>
              <div class="hero-cost-row"><span>◆</span><span id="heroMCost"></span><span>ORO</span></div>
            </div>
            <div class="hero-modal-section">
              <div class="hero-modal-section-title">Comparativa</div>
              <div class="hero-compare-grid" id="heroCompareGrid"></div>
            </div>
            <button class="hero-btn-upgrade" id="heroBtnUpgrade">▲ MEJORAR</button>
            <div class="hero-upgrade-msg" id="heroUpgradeMsg"></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function initHeroSection() {
  renderHeroTemplate();

  const root = hudCenter;
  const overlayEl = root.querySelector('#heroModalOverlay');
  const gearGridEl = root.querySelector('#heroGearGrid');
  const heroStats = getHeroStatsFromState();

  let currentSlotId = null;

  const setUpgradeMsg = (msg, isError = false) => {
    const msgEl = root.querySelector('#heroUpgradeMsg');
    if (!msgEl) return;
    msgEl.textContent = msg;
    msgEl.classList.toggle('error', isError);
  };

  const updateVitalsUI = () => {
    const hpPercent = Math.max(0, Math.min(100, (heroStats.hp / Math.max(1, heroStats.hpMax)) * 100));
    const ckPercent = Math.max(0, Math.min(100, (heroStats.chakra / Math.max(1, heroStats.chakraMax)) * 100));
    const expPercent = Math.max(0, Math.min(100, (heroStats.exp / Math.max(1, heroStats.expMax)) * 100));

    root.querySelector('#heroVitalBars').innerHTML = `
      <div class="hero-vital-row"><div class="hero-vital-label hp">HP</div><div class="hero-vital-bar"><div class="hero-vital-fill hp" style="width:${hpPercent}%"></div></div><div class="hero-vital-val">${heroStats.hp.toLocaleString()}</div></div>
      <div class="hero-vital-row"><div class="hero-vital-label ck">CKR</div><div class="hero-vital-bar"><div class="hero-vital-fill ck" style="width:${ckPercent}%"></div></div><div class="hero-vital-val">${heroStats.chakra.toLocaleString()}</div></div>
      <div class="hero-vital-row"><div class="hero-vital-label exp">EXP</div><div class="hero-vital-bar"><div class="hero-vital-fill exp" style="width:${expPercent}%"></div></div><div class="hero-vital-val">${(heroStats.exp / 1000).toFixed(1)}k</div></div>
    `;

    root.querySelector('#heroXpMini').style.width = `${expPercent}%`;
    root.querySelector('#heroLevelSub').textContent = `${heroStats.exp.toLocaleString()} / ${heroStats.expMax.toLocaleString()}`;
  };

  const updateExtraStats = () => {
    root.querySelector('#heroExtraStats').innerHTML = `
      <div class="hero-stat-extra-item"><span>⚔ STR</span><span class="hero-stat-extra-val">${heroStats.str}</span></div>
      <div class="hero-stat-extra-item"><span>💨 AGI</span><span class="hero-stat-extra-val speed">${heroStats.agi}</span></div>
      <div class="hero-stat-extra-item"><span>🧠 INT</span><span class="hero-stat-extra-val">${heroStats.int}</span></div>
      <div class="hero-stat-extra-item"><span>✦ LUK</span><span class="hero-stat-extra-val">${heroStats.luk}</span></div>
      <div class="hero-stat-extra-item"><span>🛡 DEF</span><span class="hero-stat-extra-val good">${heroStats.def}</span></div>
      <div class="hero-stat-extra-item"><span>♾ RES</span><span class="hero-stat-extra-val">${heroStats.res}</span></div>
      <div class="hero-stat-extra-item"><span>◎ CRI</span><span class="hero-stat-extra-val crit">${heroStats.crit}%</span></div>
      <div class="hero-stat-extra-item"><span>💥 CD</span><span class="hero-stat-extra-val crit">${heroStats.cd}%</span></div>
      <div class="hero-stat-extra-item"><span>〇 EVA</span><span class="hero-stat-extra-val speed">${heroStats.eva}%</span></div>
      <div class="hero-stat-extra-item"><span>♥ RgHP</span><span class="hero-stat-extra-val good">+${heroStats.rgHp}</span></div>
    `;
  };

  const updateGold = () => {
    root.querySelector('#heroGoldAmount').textContent = state.gold.toLocaleString();
    updateBars();
  };

  const openModal = (slotId) => {
    const slot = heroState.slots.find((s) => s.id === slotId);
    if (!slot) return;
    currentSlotId = slotId;
    const rarity = getRarity(slot.level);

    root.querySelector('#heroMIcon').textContent = slot.icon;
    root.querySelector('#heroMName').textContent = slot.name;
    root.querySelector('#heroMRarity').textContent = rarity.label.toUpperCase();
    root.querySelector('#heroMCost').textContent = calcCost(slot).toLocaleString();
    root.querySelector('#heroCompareGrid').innerHTML = `
      <div>${slot.statIcon1} ${slot.stat1}</div><div>${calcStat(slot.stat1val, slot.level)}</div><div>→</div><div>${calcStat(slot.stat1val, slot.level + 1)}</div>
      <div>▲ Nivel</div><div>Lv.${slot.level}</div><div>→</div><div>Lv.${slot.level + 1}</div>
    `;
    root.querySelector('.hero-modal').style.borderColor = `${rarity.color}aa`;
    overlayEl.classList.add('open');
    overlayEl.setAttribute('aria-hidden', 'false');
    setUpgradeMsg('');
  };

  const closeModal = () => {
    overlayEl.classList.remove('open');
    overlayEl.setAttribute('aria-hidden', 'true');
    currentSlotId = null;
    setUpgradeMsg('');
  };

  const renderSlots = () => {
    gearGridEl.innerHTML = '';
    heroState.slots.forEach((slot) => {
      const rarity = getRarity(slot.level);
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `hero-gear-slot${rarity.extra ? ' legendary' : ''}`;
      item.dataset.slotId = slot.id;
      item.setAttribute('aria-label', `${slot.name} nivel ${slot.level}`);
      item.style.cssText = `--slot-border:${rarity.border};--slot-bg:${rarity.bg};--slot-glow:${rarity.glow};--slot-color:${rarity.color};border-color:${rarity.color};`;
      item.innerHTML = `
        ${rarity.extra ? '<div class="hero-legendary-aura"></div>' : ''}
        <div class="hero-slot-icon">${slot.icon}</div>
        <div class="hero-slot-name">${slot.name}</div>
        <div class="hero-slot-level" style="color:${rarity.extra ? (rarity.goldColor || rarity.color) : rarity.color}">Lv.${slot.level}</div>
        <div class="hero-rarity-pill" style="background:${rarity.color}22;color:${rarity.color}">${rarity.label}</div>
      `;
      gearGridEl.appendChild(item);
    });
  };

  const loadSprite = () => {
    const img = root.querySelector('#heroSpriteImage');
    const placeholder = root.querySelector('#heroSpritePlaceholder');
    const cleanUrl = `${heroState.spriteUrl || ''}`.trim();

    if (!cleanUrl) {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
      placeholder.innerHTML = '🎴<br>SIN SPRITE';
      return;
    }

    img.src = cleanUrl;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    img.onerror = () => {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
      placeholder.innerHTML = '⚠️<br>Error imagen';
    };
  };

  const onGridClick = (event) => {
    const slotButton = event.target.closest('.hero-gear-slot');
    if (!slotButton) return;
    openModal(slotButton.dataset.slotId);
  };

  const onUpgrade = () => {
    if (!currentSlotId) return;
    const slot = heroState.slots.find((s) => s.id === currentSlotId);
    if (!slot || slot.level >= MAX_SLOT_LEVEL) {
      setUpgradeMsg('Nivel máximo alcanzado.', true);
      return;
    }

    const cost = calcCost(slot);
    if (state.gold < cost) {
      setUpgradeMsg('No tienes oro suficiente.', true);
      return;
    }

    state.gold -= cost;
    slot.level += 1;
    renderSlots();
    updateGold();
    openModal(slot.id);
    setUpgradeMsg('¡Mejora aplicada!');

    const rect = root.getBoundingClientRect();
    spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 'chakra');
    spawnFloatText(rect.left + rect.width / 2, rect.top + rect.height / 2, `- ${cost.toLocaleString()} oro`, '#e8923a');
  };

  const onOverlayClick = (event) => {
    if (event.target === overlayEl) closeModal();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') closeModal();
  };

  root.querySelector('#heroModalClose').addEventListener('click', closeModal);
  root.querySelector('#heroBtnUpgrade').addEventListener('click', onUpgrade);
  gearGridEl.addEventListener('click', onGridClick);
  overlayEl.addEventListener('click', onOverlayClick);
  document.addEventListener('keydown', onKeyDown);

  updateVitalsUI();
  updateExtraStats();
  updateGold();
  renderSlots();
  loadSprite();

  return () => {
    root.querySelector('#heroModalClose')?.removeEventListener('click', closeModal);
    root.querySelector('#heroBtnUpgrade')?.removeEventListener('click', onUpgrade);
    gearGridEl.removeEventListener('click', onGridClick);
    overlayEl.removeEventListener('click', onOverlayClick);
    document.removeEventListener('keydown', onKeyDown);
    hudCenter.innerHTML = '';
  };
}

function renderSection(sectionKey) {
  if (destroyHeroSection) {
    destroyHeroSection();
    destroyHeroSection = null;
  }

  if (sectionKey === 'heroe') {
    overlay.classList.remove('visible');
    destroyHeroSection = initHeroSection();
    return;
  }

  const info = sections[sectionKey];
  if (info) {
    overlayTitle.innerHTML = `${info.icon} ${info.title}`;
    overlayDesc.textContent = info.desc;
    overlay.classList.add('visible');
  }
}

/* ─────────────────────────────────────────────
   NAVEGACIÓN
───────────────────────────────────────────── */
document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    spawnParticles(cx, cy, 'smoke');
    spawnParticles(cx, cy, 'chakra');

    const sec = btn.dataset.section;
    const labels = {
      heroe: 'HÉROE',
      misiones: 'MISIONES',
      clanes: 'CLANES',
      eventos: 'EVENTOS',
      jutsus: 'JUTSUS',
      batallas: 'BATALLAS',
      invocaciones: 'INVOCAR',
      habilidades: 'ÁRBOL',
      ajustes: 'AJUSTES',
    };

    spawnFloatText(cx, cy, `▶ ${labels[sec] || sec}`, '#e8923a');

    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    state.activeSection = sec;
    renderSection(sec);
  });
});

overlayClose.addEventListener('click', () => {
  overlay.classList.remove('visible');
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  spawnParticles(cx, cy, 'amber-spark');
});

updateBars();
renderSection(state.activeSection);
