(() => {
  const overlay = document.getElementById('section-overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const overlayClose = document.getElementById('overlayClose');

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
      const dist = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${x - size / 2}px; top:${y - size / 2}px;
        --tx:${tx}px; --ty:${ty}px;
        animation-delay:${Math.random() * .1}s;
        animation-duration:${Math.random() * .4 + .5}s;
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

  function updateBars(state) {
    const hpPct = Math.round(state.hp / state.hpMax * 100);
    const mpPct = Math.round(state.mp / state.mpMax * 100);
    const expPct = Math.round(state.exp / state.expMax * 100);

    document.getElementById('hpFill').style.width = hpPct + '%';
    document.getElementById('mpFill').style.width = mpPct + '%';
    document.getElementById('expFill').style.width = expPct + '%';

    document.getElementById('hpCur').textContent = state.hp;
    document.getElementById('hpPct').textContent = hpPct + '%';
    document.getElementById('mpCur').textContent = state.mp;
    document.getElementById('mpPct').textContent = mpPct + '%';
    document.getElementById('expNext').textContent =
      `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
    document.getElementById('statGold').textContent = state.gold.toLocaleString();

    const fill = document.getElementById('hpFill');
    fill.style.background = hpPct < 25
      ? 'linear-gradient(90deg,#7a1a1a,#c93b3b)'
      : 'linear-gradient(90deg,#2d9e55,#5de68c)';

  }

  function bindNavigation(state, sections) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
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
          ajustes: 'AJUSTES'
        };

        spawnFloatText(cx, cy, '▶ ' + (labels[sec] || sec), '#e8923a');

        document.querySelectorAll('.nav-btn').forEach(button => button.classList.remove('active'));
        btn.classList.add('active');
        state.activeSection = sec;

        const info = sections[sec];
        if (sec === 'heroe') {
          overlay.classList.remove('visible');
          if (window.equipUI) window.equipUI.showHeroSection(true);
          return;
        }

        if (window.equipUI) window.equipUI.showHeroSection(false);
        if (sec === 'misiones') {
          overlayTitle.innerHTML = '📜 MISIONES';
          overlayDesc.textContent = 'Esta sección está vacía.';
          overlay.classList.add('visible');
          return;
        }

        if (info) {
          overlayTitle.innerHTML = `${info.icon} ${info.title}`;
          overlayDesc.textContent = info.desc;
          overlay.classList.add('visible');
        }
      });
    });

    overlayClose.addEventListener('click', () => {
      overlay.classList.remove('visible');
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      spawnParticles(cx, cy, 'amber-spark');
    });
  }

  window.gameUI = {
    bindNavigation,
    spawnFloatText,
    spawnParticles,
    updateBars,
  };
})();
