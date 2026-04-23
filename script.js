const state = {
  hp: 720,
  hpMax: 1000,
  mp: 290,
  mpMax: 500,
  exp: 4400,
  expMax: 10000,
  gold: 4320,
  atk: 1240,
  def: 880,
  level: 23,
  activeSection: 'heroe',
};


const heroPanel = new window.BotonHeroe('hero-panel-root', {
  initialGold: state.gold,
  onGoldChange: (nextGold) => {
    state.gold = nextGold;
    document.getElementById('statGold').textContent = state.gold.toLocaleString();
  document.getElementById('statAtk').textContent = state.atk.toLocaleString();
  document.getElementById('statDef').textContent = state.def.toLocaleString();
  },
  onStatsChange: (stats) => {
    state.atk = Math.round(stats.atk);
    state.def = Math.round(stats.def);
    document.getElementById('statAtk').textContent = state.atk.toLocaleString();
    document.getElementById('statDef').textContent = state.def.toLocaleString();
  },
});

const sections = {
  heroe: {
    icon: '🥷',
    title: 'HÉROE',
    desc: 'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.',
  },
  misiones: {
    icon: '📜',
    title: 'MISIONES',
    desc: 'Completa encargos diarios, semanales y de historia para ganar EXP, oro y materiales de mejora.',
  },
  clanes: {
    icon: '⛩️',
    title: 'CLANES',
    desc: 'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.',
  },
  eventos: {
    icon: '🎴',
    title: 'EVENTOS',
    desc: '¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.',
  },
  jutsus: {
    icon: '🌀',
    title: 'JUTSUS',
    desc: 'Gestiona tus técnicas ninja. Equipa hasta 4 jutsus activos y mejora sus rangos con sellos de chakra.',
  },
  batallas: {
    icon: '⚔️',
    title: 'BATALLAS',
    desc: 'Modo PvP y arena de rango. Desafía a otros jugadores y sube en la tabla clasificatoria mundial.',
  },
  invocaciones: {
    icon: '✨',
    title: 'INVOCACIONES',
    desc: 'Invoca nuevos compañeros y objetos míticos. Utiliza pergaminos de convocación para obtener aliados S-Rank.',
  },
  habilidades: {
    icon: '🌿',
    title: 'ÁRBOL DE HABILIDAD',
    desc: 'Asigna puntos de habilidad en ramas de Ninjutsu, Taijutsu y Genjutsu para personalizar tu estilo de combate.',
  },
  ajustes: {
    icon: '⚙️',
    title: 'AJUSTES',
    desc: 'Configura notificaciones, audio, gráficos y tu cuenta de shinobi. También puedes vincular tu aldea.',
  },
};

function updateBars() {
  state.exp = Math.min(state.expMax, state.exp + Math.floor(Math.random() * 28 + 8));

  const hpPct = Math.round((state.hp / state.hpMax) * 100);
  const mpPct = Math.round((state.mp / state.mpMax) * 100);
  const expPct = Math.round((state.exp / state.expMax) * 100);

  document.getElementById('hpFill').style.width = `${hpPct}%`;
  document.getElementById('mpFill').style.width = `${mpPct}%`;
  document.getElementById('expFill').style.width = `${expPct}%`;

  document.getElementById('hpCur').textContent = state.hp;
  document.getElementById('hpPct').textContent = `${hpPct}%`;
  document.getElementById('mpCur').textContent = state.mp;
  document.getElementById('mpPct').textContent = `${mpPct}%`;
  document.getElementById('charLevel').textContent = state.level;
  document.getElementById('expNext').textContent = `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
  document.getElementById('statGold').textContent = state.gold.toLocaleString();
  document.getElementById('statAtk').textContent = state.atk.toLocaleString();
  document.getElementById('statDef').textContent = state.def.toLocaleString();
}

setInterval(updateBars, 800);

function spawnParticles(x, y, type = 'chakra') {
  const container = document.getElementById('particleContainer');
  const count = type === 'smoke' ? 6 : 10;

  for (let i = 0; i < count; i += 1) {
    const p = document.createElement('div');
    p.className = `particle ${type}`;

    const size = type === 'smoke' ? (Math.random() * 18 + 10) : (Math.random() * 5 + 2);
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x - (size / 2)}px; top:${y - (size / 2)}px;
      --tx:${tx}px; --ty:${ty}px;
      animation-delay:${Math.random() * 0.1}s;
      animation-duration:${Math.random() * 0.4 + 0.5}s;
    `;

    container.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

function spawnFloatText(x, y, text, color = '#2ecfcf') {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.cssText = `left:${x - 30}px; top:${y - 20}px; color:${color};`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

const overlay = document.getElementById('section-overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayDesc = document.getElementById('overlayDesc');
const overlayClose = document.getElementById('overlayClose');

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

document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + (rect.width / 2);
    const cy = rect.top + (rect.height / 2);

    spawnParticles(cx, cy, 'smoke');
    spawnParticles(cx, cy, 'chakra');

    const sec = btn.dataset.section;
    spawnFloatText(cx, cy, `▶ ${labels[sec] || sec}`, '#e8923a');

    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeSection = sec;

    if (sec === 'heroe') {
      overlay.classList.remove('visible');
      heroPanel.show();
      return;
    }

    heroPanel.hide();
    const info = sections[sec];
    if (info) {
      overlayTitle.innerHTML = `${info.icon} ${info.title}`;
      overlayDesc.textContent = info.desc;
      overlay.classList.add('visible');
    }
  });
});

overlayClose.addEventListener('click', () => {
  overlay.classList.remove('visible');
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 'amber-spark');
});

if (state.activeSection === 'heroe') {
  heroPanel.show();
}

updateBars();
