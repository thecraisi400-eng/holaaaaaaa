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


  function applyProfile(profile = {}) {
    if (profile.heroName) document.getElementById('charName').textContent = profile.heroName.toUpperCase();
    if (profile.rank) document.getElementById('charRank').textContent = profile.rank.toUpperCase();
    if (profile.avatar) {
      const frame = document.getElementById('avatarFrame');
      frame.innerHTML = `<div class="avatar-placeholder">${profile.avatar}</div><div class="avatar-corner"></div>`;
    }
  }

  function updateBars(state) {
    const hpPct = Math.round(state.hp / state.hpMax * 100);
    const mpPct = Math.round(state.mp / state.mpMax * 100);
    const expPct = Math.round(state.exp / state.expMax * 100);

    document.getElementById('hpFill').style.width = hpPct + '%';
    document.getElementById('mpFill').style.width = mpPct + '%';
    document.getElementById('expFill').style.width = expPct + '%';

    document.getElementById('hpCur').textContent = state.hp;
    document.getElementById('hpMax').textContent = state.hpMax;
    document.getElementById('hpPct').textContent = hpPct + '%';
    document.getElementById('mpCur').textContent = state.mp;
    document.getElementById('mpMax').textContent = state.mpMax;
    document.getElementById('mpPct').textContent = mpPct + '%';
    document.getElementById('statAtk').textContent = state.atk.toLocaleString();
    document.getElementById('statDef').textContent = state.def.toLocaleString();
    document.getElementById('expNext').textContent =
      `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
    document.getElementById('statGold').textContent = state.gold.toLocaleString();

    const fill = document.getElementById('hpFill');
    fill.style.background = hpPct < 25
      ? 'linear-gradient(90deg,#7a1a1a,#c93b3b)'
      : 'linear-gradient(90deg,#2d9e55,#5de68c)';

    document.getElementById('missionProg').style.width = state.missionProg + '%';
    const missionProgSolo = document.getElementById('missionProgSolo');
    if (missionProgSolo) missionProgSolo.style.width = state.missionProg + '%';
  }

  function showCenterPanels({ hero = false, missions = false } = {}) {
    const heroPanel = document.getElementById('heroPanel');
    const defaultPanel = document.getElementById('centerDefault');
    const missionsPanel = document.getElementById('missionsPanel');

    if (heroPanel) {
      heroPanel.classList.toggle('active', hero);
      heroPanel.setAttribute('aria-hidden', hero ? 'false' : 'true');
    }
    if (missionsPanel) {
      missionsPanel.classList.toggle('active', missions);
      missionsPanel.setAttribute('aria-hidden', missions ? 'false' : 'true');
    }
    if (defaultPanel) {
      defaultPanel.classList.toggle('hidden', hero || missions);
    }
  }

  function bindNavigation(state, sections) {
    showCenterPanels({
      hero: state.activeSection === 'heroe',
      missions: state.activeSection === 'misiones',
    });

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
          showCenterPanels({ hero: true, missions: false });
          if (window.equipUI) window.equipUI.showHeroSection(true);
          return;
        }

        if (sec === 'misiones') {
          overlay.classList.remove('visible');
          showCenterPanels({ hero: false, missions: true });
          if (window.equipUI) window.equipUI.showHeroSection(false);
          return;
        }

        showCenterPanels({ hero: false, missions: false });
        if (window.equipUI) window.equipUI.showHeroSection(false);
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
    applyProfile,
    updateBars,
  };
})();
