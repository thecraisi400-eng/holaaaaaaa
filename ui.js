(() => {
  const { clans = [] } = window.gameData;
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
    document.getElementById('statAtk').textContent = state.atk.toLocaleString();
    document.getElementById('statDef').textContent = state.def.toLocaleString();

    const fill = document.getElementById('hpFill');
    fill.style.background = hpPct < 25
      ? 'linear-gradient(90deg,#7a1a1a,#c93b3b)'
      : 'linear-gradient(90deg,#2d9e55,#5de68c)';

    document.getElementById('missionProg').style.width = state.missionProg + '%';
  }

  function applyProfileToHud(state, heroProfile) {
    const nameEl = document.getElementById('charName');
    const rankEl = document.getElementById('charRank');
    const avatar = document.getElementById('avatarFrame');
    if (!heroProfile) return;
    nameEl.textContent = heroProfile.heroName.toUpperCase();
    rankEl.textContent = heroProfile.clanName.replace('CLAN ', '');
    avatar.innerHTML = `<div class="avatar-placeholder">${heroProfile.heroEmoji}</div><div class="avatar-corner"></div>`;
    updateBars(state);
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

  function initStartFlow(state) {
    const flow = document.getElementById('startFlow');
    const clanGrid = document.getElementById('startClanGrid');
    const charList = document.getElementById('startCharList');
    const selectedClan = document.getElementById('startSelectedClan');
    const profileBox = document.getElementById('startProfile');
    const msg = document.getElementById('startFlowMsg');
    let currentClan = null;
    let currentHero = null;

    const showScreen = (id) => {
      flow.querySelectorAll('.start-screen').forEach((el) => {
        el.classList.toggle('active', el.dataset.startScreen === id);
      });
    };

    const renderClans = () => {
      clanGrid.innerHTML = '';
      clans.forEach((clan) => {
        const card = document.createElement('button');
        card.className = 'start-clan-card';
        card.type = 'button';
        const stats = Object.entries(clan.summary)
          .map(([k, v]) => `<div class="start-stat"><span>${k}</span><b>${v}</b></div>`)
          .join('');
        card.innerHTML = `<div class="start-clan-title">${clan.emoji} ${clan.name}</div>${stats}`;
        card.addEventListener('click', () => {
          currentClan = clan;
          selectedClan.textContent = `${clan.emoji} ${clan.name}`;
          renderChars(clan);
          showScreen('char');
        });
        clanGrid.appendChild(card);
      });
    };

    const renderChars = (clan) => {
      charList.innerHTML = '';
      clan.members.forEach((name, i) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'start-char';
        card.textContent = `${clan.memberEmoji[i]} ${name}`;
        card.addEventListener('click', () => {
          currentHero = { name, emoji: clan.memberEmoji[i] };
          renderProfile();
          showScreen('profile');
        });
        charList.appendChild(card);
      });
    };

    const renderProfile = () => {
      const s = currentClan.stats;
      profileBox.innerHTML = `
        <div><strong>Héroe:</strong> ${currentHero.emoji} ${currentHero.name}</div>
        <div><strong>Clan:</strong> ${currentClan.name}</div>
        <div><strong>HP/MP:</strong> ${s.hpMax} / ${s.mpMax}</div>
        <div><strong>ATK/DEF:</strong> ${s.atk} / ${s.def}</div>
        <div><strong>VEL/CTR:</strong> ${s.vel} / ${s.ctr}%</div>
        <div><strong>EVA/RES:</strong> ${s.eva}% / ${s.res}%</div>
        <div><strong>REGEN/CDMG:</strong> ${s.regen}% / ${s.cdmg}%</div>
      `;
    };

    document.getElementById('btnNewGame').addEventListener('click', () => {
      renderClans();
      showScreen('clan');
    });
    document.getElementById('btnLoadGame').addEventListener('click', () => {
      msg.textContent = 'No se encontró ninguna partida guardada.';
    });
    flow.querySelectorAll('.start-back').forEach((btn) => {
      btn.addEventListener('click', () => showScreen(btn.dataset.back));
    });
    document.getElementById('btnConfirmHero').addEventListener('click', () => {
      if (!currentClan || !currentHero) return;
      const payload = {
        clanId: currentClan.id,
        clanName: currentClan.name,
        heroName: currentHero.name,
        heroEmoji: currentHero.emoji,
      };
      const stats = currentClan.stats;
      state.hpMax = stats.hpMax;
      state.hp = stats.hpMax;
      state.mpMax = stats.mpMax;
      state.mp = stats.mpMax;
      state.atk = stats.atk;
      state.def = stats.def;
      state.level = 1;
      state.exp = 0;
      state.expMax = 1000;
      state.activeSection = 'heroe';
      window.gameData.profile = payload;

      if (window.equipLogic) {
        window.equipLogic.setBaseStats({
          HP: stats.hpMax,
          MP: stats.mpMax,
          ATK: stats.atk,
          DEF: stats.def,
          VEL: stats.vel,
          CTR: stats.ctr,
          EVA: stats.eva,
          RES: stats.res,
          REGEN: stats.regen,
          CDMG: stats.cdmg,
        });
      }

      applyProfileToHud(state, payload);
      if (window.equipUI) window.equipUI.showHeroSection(true);
      document.querySelectorAll('.nav-btn').forEach((button) => button.classList.remove('active'));
      const heroBtn = document.getElementById('btn-heroe');
      if (heroBtn) heroBtn.classList.add('active');

      flow.classList.remove('visible');
      document.dispatchEvent(new CustomEvent('game:start-selected'));
    });
  }

  window.gameUI = {
    bindNavigation,
    applyProfileToHud,
    initStartFlow,
    spawnFloatText,
    spawnParticles,
    updateBars,
  };
})();
