(() => {
  const overlay = document.getElementById('section-overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const overlayClose = document.getElementById('overlayClose');
  const statOrder = ['HP', 'MP', 'ATK', 'DEF', 'VEL', 'CTR', 'CDMG', 'EVA', 'RES', 'REGEN'];
  const statIcons = { HP: '❤️', MP: '💙', ATK: '⚔️', DEF: '🛡️', VEL: '⚡', CTR: '🎯', CDMG: '💥', EVA: '💨', RES: '🧠', REGEN: '🌿' };

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
    document.getElementById('hpMax').textContent = state.hpMax;
    document.getElementById('hpPct').textContent = hpPct + '%';
    document.getElementById('mpCur').textContent = state.mp;
    document.getElementById('mpMax').textContent = state.mpMax;
    document.getElementById('mpPct').textContent = mpPct + '%';
    document.getElementById('expNext').textContent =
      `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
    document.getElementById('statGold').textContent = state.gold.toLocaleString();

    const fill = document.getElementById('hpFill');
    fill.style.background = hpPct < 25
      ? 'linear-gradient(90deg,#7a1a1a,#c93b3b)'
      : 'linear-gradient(90deg,#2d9e55,#5de68c)';

    document.getElementById('missionProg').style.width = state.missionProg + '%';
  }

  function applyProfileToHUD(state, profile) {
    const nameEl = document.getElementById('charName');
    const rankEl = document.getElementById('charRank');
    if (nameEl) nameEl.textContent = profile.name.toUpperCase();
    if (rankEl) rankEl.textContent = profile.rank.toUpperCase();
    const atkEl = document.getElementById('statAtk');
    const defEl = document.getElementById('statDef');
    if (atkEl) atkEl.textContent = state.atk.toLocaleString('es-ES');
    if (defEl) defEl.textContent = state.def.toLocaleString('es-ES');
  }

  function initNewGameFlow({ state, presets, onComplete }) {
    const overlayEl = document.getElementById('newgame-overlay');
    const clanGrid = document.getElementById('ngClanGrid');
    const profileBox = document.getElementById('ngProfileBox');
    const nameInput = document.getElementById('ngNameInput');
    if (!overlayEl || !clanGrid || !profileBox || !nameInput || !Array.isArray(presets) || presets.length === 0) {
      onComplete({ profile: null });
      return;
    }

    let selectedClan = null;

    function openScreen(id) {
      document.querySelectorAll('.newgame-screen').forEach((screen) => {
        screen.classList.toggle('active', screen.dataset.screen === id);
      });
    }

    function renderProfilePreview(clan) {
      const lines = statOrder.map((key) => {
        const value = clan.summary[key] || '—';
        return `<div class="ng-profile-stat"><span>${statIcons[key]} ${key}</span><strong>${value}</strong></div>`;
      }).join('');
      profileBox.innerHTML = `
        <div class="ng-profile-name">${nameInput.value || 'Shinobi sin nombre'}</div>
        <div class="ng-profile-clan">${clan.emoji} ${clan.name}</div>
        <div class="ng-profile-stats">${lines}</div>
      `;
    }

    clanGrid.innerHTML = '';
    presets.forEach((clan) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'ng-clan-card';
      card.innerHTML = `
        <div class="ng-clan-name">${clan.emoji} ${clan.name}</div>
        ${Object.entries(clan.summary).slice(0, 6).map(([k, v]) => `<div class="ng-clan-stat"><span>${k}</span><strong>${v}</strong></div>`).join('')}
      `;
      card.addEventListener('click', () => {
        selectedClan = clan;
        renderProfilePreview(clan);
        openScreen('profile');
      });
      clanGrid.appendChild(card);
    });

    nameInput.addEventListener('input', () => {
      if (selectedClan) renderProfilePreview(selectedClan);
    });

    document.querySelectorAll('[data-back]').forEach((btn) => {
      btn.addEventListener('click', () => openScreen(btn.dataset.back));
    });

    document.getElementById('ngStartBtn').addEventListener('click', () => openScreen('clan'));
    document.getElementById('ngLoadBtn').addEventListener('click', () => openScreen('load'));
    document.getElementById('ngConfirmBtn').addEventListener('click', () => {
      if (!selectedClan) return;
      const rawName = nameInput.value.trim();
      const playerName = rawName || 'Shinobi Novato';
      const profile = {
        ...selectedClan,
        name: playerName,
      };
      overlayEl.classList.remove('active');
      onComplete({ profile });
    });
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
    applyProfileToHUD,
    initNewGameFlow,
  };
})();
