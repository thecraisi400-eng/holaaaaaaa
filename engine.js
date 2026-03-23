(() => {
  const { combatLines, initialState, sections } = window.gameData;
  const state = { ...initialState };
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

  function tickState() {
    state.hp = Math.max(10, Math.min(state.hpMax, state.hp + (Math.random() > .65 ? 8 : -14)));
    state.mp = Math.max(30, Math.min(state.mpMax, state.mp + (Math.random() > .45 ? 12 : -20)));
    state.exp = Math.min(state.expMax, state.exp + Math.floor(Math.random() * 28 + 8));
    state.gold += Math.floor(Math.random() * 12 + 3);

    state.missionProg = Math.min(100, state.missionProg + .15);
    window.gameUI.updateBars(state);

    if (state.missionProg >= 100) {
      state.missionProg = 0;
      window.gameUI.updateBars(state);
    }
  }

  function init() {
    window.equipUI?.init?.(state);
    window.gameUI.bindNavigation(state, sections);
    window.gameUI.updateBars(state);

    for (let i = 0; i < 5; i += 1) {
      addFeedLine();
    }

    setInterval(addFeedLine, 1600);
    setInterval(tickState, 800);
  }

  window.gameEngine = {
    addFeedLine,
    init,
    state,
    tickState,
  };

  init();
})();
