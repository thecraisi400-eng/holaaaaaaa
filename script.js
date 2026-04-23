const state = {
  maxHp: 5000,
  currentHp: 1000,
  maxMp: 2000,
  currentMp: 800,
  isRegenerating: true,
  gold: 1500,
  atk: 1250,
  def: 890,
  activeSection: 'heroe',
};

const sections = {
  misiones: {
    title: '📜 Misiones Shinobi',
    desc: 'Completa encargos diarios y de historia para recibir experiencia, pergaminos y materiales de mejora.',
  },
  clanes: {
    title: '⛩️ Clanes',
    desc: 'Reúnete con tu aldea, participa en guerras de clanes y desbloquea bonificaciones de equipo.',
  },
  eventos: {
    title: '⭐ Eventos',
    desc: 'El Festival de Chakra está activo: obtiene recompensas por tiempo limitado en desafíos especiales.',
  },
  jutsus: {
    title: '🔥 Jutsus',
    desc: 'Gestiona técnicas activas, combina elementos y crea tu estilo definitivo de combate.',
  },
  batallas: {
    title: '⚔️ Batallas',
    desc: 'Entra a la arena PvP y asciende en el ranking con tu escuadrón ninja.',
  },
  invocar: {
    title: '🐸 Invocaciones',
    desc: 'Invoca aliados y bestias para aumentar el poder general de tu héroe.',
  },
  arbol: {
    title: '🌳 Árbol de Habilidades',
    desc: 'Distribuye puntos para potenciar ataque, resistencia y control de chakra.',
  },
  ajustes: {
    title: '⚙️ Ajustes',
    desc: 'Configura gráficos, sonido y notificaciones de tu aventura ninja.',
  },
};

const hpFill = document.getElementById('hp-fill');
const hpText = document.getElementById('hp-text');
const mpFill = document.getElementById('mp-fill');
const mpText = document.getElementById('mp-text');
const heroPortrait = document.querySelector('.hero-portrait');
const sectionContent = document.getElementById('section-content');
const heroPanelRoot = document.getElementById('hero-panel-root');

const heroPanel = new window.BotonHeroe('hero-panel-root', {
  initialGold: state.gold,
  onGoldChange: (nextGold) => {
    state.gold = nextGold;
    document.getElementById('gold-val').textContent = state.gold.toLocaleString();
  },
  onStatsChange: (stats) => {
    state.atk = Math.round(stats.atk);
    state.def = Math.round(stats.def);
    document.getElementById('statAtk').textContent = state.atk.toLocaleString();
    document.getElementById('statDef').textContent = state.def.toLocaleString();
  },
});

function updateBars() {
  const hpPct = Math.max(0, Math.min(100, (state.currentHp / state.maxHp) * 100));
  const mpPct = Math.max(0, Math.min(100, (state.currentMp / state.maxMp) * 100));

  hpFill.style.width = `${hpPct}%`;
  mpFill.style.width = `${mpPct}%`;
  hpText.innerText = `${hpPct.toFixed(0)}%`;
  mpText.innerText = `${mpPct.toFixed(0)}%`;

  if (hpPct < 20) {
    heroPortrait.classList.add('danger-hp');
    hpFill.style.backgroundColor = '#f85149';
  } else {
    heroPortrait.classList.remove('danger-hp');
    hpFill.style.backgroundColor = 'var(--hp-color)';
  }
}

setInterval(() => {
  if (!state.isRegenerating) return;
  if (state.currentHp < state.maxHp) state.currentHp = Math.min(state.maxHp, state.currentHp + 50);
  if (state.currentMp < state.maxMp) state.currentMp = Math.min(state.maxMp, state.currentMp + 20);
  updateBars();
}, 1000);

function triggerEffect(event) {
  const btn = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - btn.getBoundingClientRect().left - radius}px`;
  circle.style.top = `${event.clientY - btn.getBoundingClientRect().top - radius}px`;
  circle.classList.add('ripple');

  const existing = btn.querySelector('.ripple');
  if (existing) existing.remove();
  btn.appendChild(circle);

  if (state.currentMp >= 50) {
    state.currentMp -= 50;
    updateBars();
  }
}

function renderSection(section) {
  if (section === 'heroe') {
    sectionContent.style.display = 'none';
    heroPanelRoot.style.display = 'flex';
    heroPanel.show();
    return;
  }

  heroPanel.hide();
  heroPanelRoot.style.display = 'none';
  sectionContent.style.display = 'flex';

  const info = sections[section];
  if (!info) return;

  sectionContent.innerHTML = `
    <h2 class="mission-title">${info.title}</h2>
    <p class="mission-desc">${info.desc}</p>
    <br>
    <p class="auto-mode">[ 🔄 Recompensas activas por conexión ]</p>
  `;
}

document.querySelectorAll('.menu-btn').forEach((btn) => {
  btn.addEventListener('click', (event) => {
    triggerEffect(event);

    document.querySelectorAll('.menu-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    state.activeSection = btn.dataset.section;
    renderSection(state.activeSection);
  });
});

window.onload = () => {
  document.getElementById('gold-val').textContent = state.gold.toLocaleString();
  document.getElementById('statAtk').textContent = state.atk.toLocaleString();
  document.getElementById('statDef').textContent = state.def.toLocaleString();

  updateBars();
  renderSection('heroe');
  console.log('✅ Nueva interfaz 20/60/20 aplicada con funciones de HÉROE activas');
};
