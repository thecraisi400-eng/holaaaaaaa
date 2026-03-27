(() => {
  if (window.__ninjaHud?.destroy) {
    window.__ninjaHud.destroy();
  }

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
    activeSection: 'heroe'
  };

  const sections = {
    heroe: { icon: '🥷', title: 'HÉROE', desc: 'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
    misiones: { icon: '📜', title: 'MISIONES', desc: '' },
    clanes: { icon: '⛩️', title: 'CLANES', desc: 'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
    eventos: { icon: '🎴', title: 'EVENTOS', desc: '¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
    jutsus: { icon: '🌀', title: 'JUTSUS', desc: 'Gestiona tus técnicas ninja. Equipa hasta 4 jutsus activos y mejora sus rangos con sellos de chakra.' },
    batallas: { icon: '⚔️', title: 'BATALLAS', desc: 'Modo PvP y arena de rango. Desafía a otros jugadores y sube en la tabla clasificatoria mundial.' },
    invocaciones: { icon: '✨', title: 'INVOCACIONES', desc: 'Invoca nuevos compañeros y objetos míticos. Utiliza pergaminos de convocación para obtener aliados S-Rank.' },
    habilidades: { icon: '🌿', title: 'ÁRBOL DE HABILIDAD', desc: 'Asigna puntos de habilidad en ramas de Ninjutsu, Taijutsu y Genjutsu para personalizar tu estilo de combate.' },
    ajustes: { icon: '⚙️', title: 'AJUSTES', desc: 'Configura notificaciones, audio, gráficos y tu cuenta de shinobi. También puedes vincular tu aldea.' }
  };

  const labels = {
    heroe: 'HÉROE',
    misiones: 'MISIONES',
    clanes: 'CLANES',
    eventos: 'EVENTOS',
    jutsus: 'JUTSUS',
    batallas: 'BATALLAS',
    invocaciones: 'INVOCAR',
    habilidades: 'ÁRBOL',
    ajustes: 'AJUSTES'
  };

  const refs = {
    nav: document.getElementById('hud-bottom'),
    overlay: document.getElementById('section-overlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayDesc: document.getElementById('overlayDesc'),
    particleContainer: document.getElementById('particleContainer'),
    hpFill: document.getElementById('hpFill'),
    mpFill: document.getElementById('mpFill'),
    expFill: document.getElementById('expFill'),
    hpCur: document.getElementById('hpCur'),
    hpPct: document.getElementById('hpPct'),
    mpCur: document.getElementById('mpCur'),
    mpPct: document.getElementById('mpPct'),
    expNext: document.getElementById('expNext'),
    statGold: document.getElementById('statGold')
  };

  const controller = new AbortController();
  const { signal } = controller;
  let barsIntervalId = null;

  function updateBars() {
    state.exp = Math.min(state.expMax, state.exp + Math.floor(Math.random() * 28 + 8));
    state.gold += Math.floor(Math.random() * 12 + 3);

    const hpPct = Math.round((state.hp / state.hpMax) * 100);
    const mpPct = Math.round((state.mp / state.mpMax) * 100);
    const expPct = Math.round((state.exp / state.expMax) * 100);

    refs.hpFill.style.width = `${hpPct}%`;
    refs.mpFill.style.width = `${mpPct}%`;
    refs.expFill.style.width = `${expPct}%`;

    refs.hpCur.textContent = state.hp;
    refs.hpPct.textContent = `${hpPct}%`;
    refs.mpCur.textContent = state.mp;
    refs.mpPct.textContent = `${mpPct}%`;
    refs.expNext.textContent = `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
    refs.statGold.textContent = state.gold.toLocaleString();
  }

  function spawnParticles(x, y, type = 'chakra') {
    const count = type === 'smoke' ? 6 : 10;

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('div');
      particle.className = `particle ${type}`;

      const size = type === 'smoke' ? Math.random() * 18 + 10 : Math.random() * 5 + 2;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      particle.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${x - size / 2}px`,
        `top:${y - size / 2}px`,
        `--tx:${tx}px`,
        `--ty:${ty}px`,
        `animation-delay:${Math.random() * 0.1}s`,
        `animation-duration:${Math.random() * 0.4 + 0.5}s`
      ].join(';');

      refs.particleContainer.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
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

  function closeOverlay() {
    refs.overlay.classList.remove('visible');
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    spawnParticles(cx, cy, 'amber-spark');
  }

  function setActiveButton(activeBtn) {
    refs.nav.querySelectorAll('.nav-btn.active').forEach((btn) => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  function openSection(sectionKey, buttonEl) {
    const info = sections[sectionKey];
    if (!info) return;

    const rect = buttonEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    spawnParticles(cx, cy, 'smoke');
    spawnParticles(cx, cy, 'chakra');
    spawnFloatText(cx, cy, `▶ ${labels[sectionKey] || sectionKey}`, '#e8923a');

    setActiveButton(buttonEl);
    state.activeSection = sectionKey;

    refs.overlayTitle.textContent = `${info.icon} ${info.title}`;
    refs.overlayDesc.textContent = info.desc;
    refs.overlay.classList.add('visible');
  }

  function handleNavClick(event) {
    const btn = event.target.closest('.nav-btn');
    if (!btn || !refs.nav.contains(btn)) return;

    const { section } = btn.dataset;
    openSection(section, btn);
  }

  function handleOverlayClick(event) {
    if (event.target.id === 'overlayClose' || event.target === refs.overlay) {
      closeOverlay();
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && refs.overlay.classList.contains('visible')) {
      closeOverlay();
    }
  }

  function start() {
    refs.nav.addEventListener('click', handleNavClick, { signal });
    refs.overlay.addEventListener('click', handleOverlayClick, { signal });
    document.addEventListener('keydown', handleKeyDown, { signal });

    updateBars();
    barsIntervalId = window.setInterval(updateBars, 800);
  }

  function destroy() {
    controller.abort();
    if (barsIntervalId !== null) {
      window.clearInterval(barsIntervalId);
      barsIntervalId = null;
    }
  }

  window.__ninjaHud = { destroy };
  start();
})();
