(function () {
  const state = window.gameState;
  const sections = window.gameSections;
  const combatLines = window.combatLines;
  const sectionLabels = window.sectionLabels;

  const overlay = document.getElementById('section-overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayDesc = document.getElementById('overlayDesc');
  const overlayClose = document.getElementById('overlayClose');

  let feedIndex = 0;

  function addFeedLine() {
    const feed = document.getElementById('combatFeed');
    const data = combatLines[feedIndex % combatLines.length];
    feedIndex += 1;

    const now = new Date();
    const time = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const line = document.createElement('div');
    line.className = 'feed-line';
    line.style.animationDelay = '0s';

    const timeEl = document.createElement('span');
    timeEl.className = 'feed-time';
    timeEl.textContent = time;

    const actorEl = document.createElement('span');
    actorEl.className = 'feed-actor';
    actorEl.textContent = data.actor;

    const msgEl = document.createElement('span');
    msgEl.className = 'feed-msg';
    msgEl.textContent = ` ${data.msg} `;

    line.append(timeEl, actorEl, msgEl);

    if (data.jutsu) {
      const jutsuEl = document.createElement('span');
      jutsuEl.className = 'feed-jutsu';
      jutsuEl.textContent = `${data.jutsu} `;
      line.append(jutsuEl);
    }

    if (data.dmg && data.dmg !== '-0' && data.dmg !== '') {
      const dmgEl = document.createElement('span');
      dmgEl.className = 'feed-dmg';
      dmgEl.textContent = data.dmg;
      line.append(dmgEl);
    }

    if (data.heal) {
      const healEl = document.createElement('span');
      healEl.className = 'feed-heal';
      healEl.textContent = data.heal;
      line.append(healEl);
    }

    feed.appendChild(line);
    feed.scrollTop = feed.scrollHeight;

    while (feed.children.length > 30) {
      feed.removeChild(feed.firstChild);
    }
  }

  function updateBars() {
    state.hp = Math.max(10, Math.min(state.hpMax, state.hp + (Math.random() > 0.65 ? 8 : -14)));
    state.mp = Math.max(30, Math.min(state.mpMax, state.mp + (Math.random() > 0.45 ? 12 : -20)));
    state.exp = Math.min(state.expMax, state.exp + Math.floor(Math.random() * 28 + 8));
    state.gold += Math.floor(Math.random() * 12 + 3);

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
    document.getElementById('expNext').textContent = `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
    document.getElementById('statGold').textContent = state.gold.toLocaleString();

    const hpFill = document.getElementById('hpFill');
    hpFill.style.background = hpPct < 25
      ? 'linear-gradient(90deg,#7a1a1a,#c93b3b)'
      : 'linear-gradient(90deg,#2d9e55,#5de68c)';

    state.missionProg = Math.min(100, state.missionProg + 0.15);
    document.getElementById('missionProg').style.width = `${state.missionProg}%`;
    if (state.missionProg >= 100) {
      state.missionProg = 0;
    }
  }

  function spawnParticles(x, y, type = 'chakra') {
    const container = document.getElementById('particleContainer');
    const count = type === 'smoke' ? 6 : 10;

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('div');
      particle.className = `particle ${type}`;

      const size = type === 'smoke' ? Math.random() * 18 + 10 : Math.random() * 5 + 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      particle.style.cssText = `
        width:${size}px; height:${size}px;
        left:${x - size / 2}px; top:${y - size / 2}px;
        --tx:${tx}px; --ty:${ty}px;
        animation-delay:${Math.random() * 0.1}s;
        animation-duration:${Math.random() * 0.4 + 0.5}s;
      `;

      container.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove());
    }
  }

  function spawnFloatText(x, y, text, color = '#2ecfcf') {
    const textElement = document.createElement('div');
    textElement.className = 'float-text';
    textElement.textContent = text;
    textElement.style.cssText = `left:${x - 30}px; top:${y - 20}px; color:${color};`;
    document.body.appendChild(textElement);
    textElement.addEventListener('animationend', () => textElement.remove());
  }

  function bindNavigation() {
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const sectionKey = btn.dataset.section;

        spawnParticles(centerX, centerY, 'smoke');
        spawnParticles(centerX, centerY, 'chakra');
        spawnFloatText(centerX, centerY, `▶ ${sectionLabels[sectionKey] || sectionKey}`, '#e8923a');

        document.querySelectorAll('.nav-btn').forEach((button) => button.classList.remove('active'));
        btn.classList.add('active');
        state.activeSection = sectionKey;

        const sectionInfo = sections[sectionKey];
        if (sectionInfo) {
          overlayTitle.innerHTML = `${sectionInfo.icon} ${sectionInfo.title}`;
          overlayDesc.textContent = sectionInfo.desc;
          overlay.classList.add('visible');
        }
      });
    });

    overlayClose.addEventListener('click', () => {
      overlay.classList.remove('visible');
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 'amber-spark');
    });
  }

  function initGameUi() {
    for (let i = 0; i < 5; i += 1) {
      addFeedLine();
    }

    bindNavigation();
    window.setInterval(addFeedLine, 1600);
    window.setInterval(updateBars, 800);
  }

  window.gameUi = {
    initGameUi,
  };
}());
