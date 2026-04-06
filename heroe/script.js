const playerSpriteURL = '';

const charStats = {
  hp: 7820, hpMax: 10000,
  chakra: 2750, chakraMax: 5000,
  exp: 67400, expMax: 100000,
  str: 284, agi: 197, int: 156, luk: 88,
  def: 312, res: 241,
  crit: 34, cd: 218, eva: 22, rgHp: 145,
  regenChakra: 88
};

function updateVitalsUI() {
  const hpPercent = (charStats.hp / charStats.hpMax) * 100;
  const ckPercent = (charStats.chakra / charStats.chakraMax) * 100;
  const expPercent = (charStats.exp / charStats.expMax) * 100;
  document.getElementById('vitalBars').innerHTML = `
    <div class="vital-row"><div class="vital-label" style="color:#ff4d4d">HP</div><div class="vital-bar"><div class="vital-fill hp-fill" style="width:${hpPercent}%"></div></div><div class="vital-val">${charStats.hp.toLocaleString()}</div></div>
    <div class="vital-row"><div class="vital-label" style="color:var(--blue-el)">CKR</div><div class="vital-bar"><div class="vital-fill chakra-fill" style="width:${ckPercent}%"></div></div><div class="vital-val">${charStats.chakra.toLocaleString()}</div></div>
    <div class="vital-row"><div class="vital-label" style="color:#ffdd55">EXP</div><div class="vital-bar"><div class="vital-fill exp-fill" style="width:${expPercent}%"></div></div><div class="vital-val">${(charStats.exp/1000).toFixed(1)}k</div></div>
  `;
}

function updateExtraStats() {
  const extraContainer = document.getElementById('extraStatsContainer');
  extraContainer.innerHTML = `
    <div class="stat-extra-item"><span class="stat-extra-icon">⚔</span><span class="stat-extra-key">STR</span><span class="stat-extra-val">${charStats.str}</span></div>
    <div class="stat-extra-item"><span class="stat-extra-icon">💨</span><span class="stat-extra-key">AGI</span><span class="stat-extra-val speed">${charStats.agi}</span></div>
    <div class="stat-extra-item"><span class="stat-extra-icon">🧠</span><span class="stat-extra-key">INT</span><span class="stat-extra-val">${charStats.int}</span></div>
    <div class="stat-extra-item"><span class="stat-extra-icon">✦</span><span class="stat-extra-key">LUK</span><span class="stat-extra-val">${charStats.luk}</span></div>
    <div class="stat-extra-item"><span class="stat-extra-icon">🛡</span><span class="stat-extra-key">DEF</span><span class="stat-extra-val good">${charStats.def}</span></div>
    <div class="stat-extra-item"><span class="stat-extra-icon">♾</span><span class="stat-extra-key">RES</span><span class="stat-extra-val">${charStats.res}</span></div>
    <div class="stat-extra-item"><span class="stat-extra-icon">◎</span><span class="stat-extra-key">CRI</span><span class="stat-extra-val crit">${charStats.crit}%</span></div>
    <div class="stat-extra-item"><span class="stat-extra-icon">💥</span><span class="stat-extra-key">CD</span><span class="stat-extra-val crit">${charStats.cd}%</span></div>
    <div class="stat-extra-item"><span class="stat-extra-icon">〇</span><span class="stat-extra-key">EVA</span><span class="stat-extra-val speed">${charStats.eva}%</span></div>
    <div class="stat-extra-item"><span class="stat-extra-icon">♥</span><span class="stat-extra-key">RgHP</span><span class="stat-extra-val good">+${charStats.rgHp}</span></div>
  `;
}

const SLOTS = [
  { id: 'weapon1', icon: '⚔', name: 'Katana', level: 1, stat1: 'Ataque', stat1val: 680, statIcon1: '⚔', costBase: 2800 },
  { id: 'weapon2', icon: '✦', name: 'Shurikens', level: 1, stat1: 'Vel. Ataque', stat1val: 195, statIcon1: '💨', costBase: 1200 },
  { id: 'head', icon: '🪖', name: 'Máscara', level: 1, stat1: 'Res. Genjutsu', stat1val: 220, statIcon1: '🧠', costBase: 450 },
  { id: 'chest', icon: '🥋', name: 'Túnica ANBU', level: 1, stat1: 'Defensa', stat1val: 312, statIcon1: '🛡', costBase: 5200 },
  { id: 'gloves', icon: '🧤', name: 'Guanteletes', level: 1, stat1: 'Precisión', stat1val: 87, statIcon1: '◎', costBase: 1900 },
  { id: 'boots', icon: '👟', name: 'Botas Ninja', level: 1, stat1: 'Velocidad', stat1val: 197, statIcon1: '💨', costBase: 780 }
];

function getRarity(lvl) {
  if (lvl <= 5) return { label:'Madera', color:'#c8a060', glow:'rgba(139,94,60,0.5)', border:'#8b5e3c', bg:'rgba(139,94,60,0.18)' };
  if (lvl <= 15) return { label:'Aprendiz', color:'#2ecc71', glow:'rgba(46,204,113,0.45)', border:'#2ecc71', bg:'rgba(46,204,113,0.12)' };
  if (lvl <= 30) return { label:'Chunin', color:'#3498db', glow:'rgba(52,152,219,0.45)', border:'#3498db', bg:'rgba(52,152,219,0.12)' };
  if (lvl <= 45) return { label:'Jonin', color:'#f1c40f', glow:'rgba(241,196,15,0.5)', border:'#f1c40f', bg:'rgba(241,196,15,0.12)' };
  if (lvl <= 60) return { label:'ANBU', color:'#e74c3c', glow:'rgba(231,76,60,0.5)', border:'#e74c3c', bg:'rgba(231,76,60,0.15)' };
  return { label:'Legendario', color:'#ffc83c', goldColor:'#ffaa33', glow:'rgba(231,76,60,0.7)', border:'#e74c3c', bg:'rgba(231,76,60,0.22)', extra:true };
}

function calcCost(slot) { return slot.costBase + slot.level * (slot.level * 12); }
function calcStat(base, level) { return Math.round(base * (1 + level * 0.028)); }

const gearGrid = document.getElementById('gearGrid');
function renderSlots() {
  gearGrid.innerHTML = '';
  SLOTS.forEach(slot => {
    const rar = getRarity(slot.level);
    const el = document.createElement('div');
    el.className = 'gear-slot' + (rar.extra ? ' legendary' : '');
    el.style.cssText = `--slot-border: ${rar.border}; --slot-bg: ${rar.bg}; --slot-glow: ${rar.glow}; --slot-color: ${rar.color}; border-color: ${rar.color};`;
    const aura = rar.extra ? '<div class="legendary-aura"></div>' : '';
    el.innerHTML = `${aura}<div class="slot-icon">${slot.icon}</div><div class="slot-name">${slot.name}</div><div class="slot-level" style="color:${rar.extra ? rar.goldColor || rar.color : rar.color}">Lv.${slot.level}</div><div class="rarity-pill" style="background:${rar.color}22;color:${rar.color}">${rar.label}</div>`;
    el.addEventListener('click', () => openModal(slot, rar));
    gearGrid.appendChild(el);
  });
}

const overlay = document.getElementById('modalOverlay');
let currentSlot = null;
function openModal(slot, rar) {
  currentSlot = slot;
  const cost = calcCost(slot);
  const statCurr = calcStat(slot.stat1val, slot.level);
  const statNext = calcStat(slot.stat1val, slot.level + 1);
  document.getElementById('mIcon').textContent = slot.icon;
  document.getElementById('mName').textContent = slot.name;
  document.getElementById('mRarity').textContent = rar.label.toUpperCase();
  document.getElementById('mCost').textContent = cost.toLocaleString();
  document.getElementById('compareGrid').innerHTML = `
    <div class="cmp-stat-name">${slot.statIcon1} ${slot.stat1}</div>
    <div class="cmp-val current">${statCurr}</div><div class="cmp-arrow">→</div><div class="cmp-val next">${statNext}</div>
    <div class="cmp-stat-name" style="margin-top:4px;">▲ Nivel</div>
    <div class="cmp-val current">Lv.${slot.level}</div><div class="cmp-arrow">→</div><div class="cmp-val next">Lv.${slot.level + 1}</div>
  `;
  document.querySelector('.modal').style.borderColor = rar.color + 'aa';
  overlay.classList.add('open');
}

function closeModal() {
  overlay.classList.remove('open');
  currentSlot = null;
}

document.getElementById('modalClose').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.getElementById('btnUpgrade').addEventListener('click', () => {
  if (!currentSlot) return;
  if (currentSlot.level >= 80) return;
  currentSlot.level++;
  renderSlots();
  const newRar = getRarity(currentSlot.level);
  openModal(currentSlot, newRar);
});

function loadSprite() {
  const imgElement = document.getElementById('spriteImage');
  const placeholder = document.getElementById('spritePlaceholder');
  if (playerSpriteURL && playerSpriteURL.trim() !== '') {
    imgElement.src = playerSpriteURL;
    imgElement.style.display = 'block';
    placeholder.style.display = 'none';
    imgElement.onerror = () => {
      imgElement.style.display = 'none';
      placeholder.style.display = 'flex';
      placeholder.innerHTML = '⚠️<br>Error imagen';
    };
  } else {
    imgElement.style.display = 'none';
    placeholder.style.display = 'flex';
    placeholder.innerHTML = '🎴<br>SIN SPRITE';
  }
}

updateVitalsUI();
updateExtraStats();
renderSlots();
loadSprite();
