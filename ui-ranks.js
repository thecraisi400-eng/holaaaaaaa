(() => {
  const STYLE_ID = 'arbol-ranks-style-v4';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .arbol-stage {
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ink, #0d1117);
        overflow: auto;
      }

      .arbol-stage::-webkit-scrollbar { width: 10px; height: 10px; }
      .arbol-stage::-webkit-scrollbar-track { background: #0d1117; }
      .arbol-stage::-webkit-scrollbar-thumb { background: #1c2740; border-radius: 10px; }

      .arbol-shell {
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        display: flex;
      }

      .arbol-root {
        --ink: #0d1117;
        --panel: #131a26;
        --surface: #1c2740;
        --btn-bg: #162035;
        --overlay: rgba(8, 12, 20, 0.85);
        --bronze: #cd7f32;
        --silver: #c0c0c0;
        --gold: #ffd700;
        --text-main: #e6edf3;
        --text-dim: #8b949e;
        --accent-green: #2ea043;
        --rank-color: #cd7f32;

        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        border: 1px solid var(--surface);
        background: var(--panel);
        color: var(--text-main);
        font-family: 'Courier New', Courier, monospace;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .ar-top {
        height: 42px;
        padding: 0 10px;
        border-bottom: 1px solid var(--ink);
        background: var(--surface);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .ar-rank-timeline {
        flex: 1;
        min-width: 0;
        display: flex;
        gap: 4px;
        overflow-x: auto;
      }

      .ar-rank-icon {
        min-width: 48px;
        height: 24px;
        border: 1px solid var(--text-dim);
        background: var(--btn-bg);
        color: var(--text-main);
        font-size: 10px;
        opacity: .6;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .ar-rank-icon.active {
        opacity: 1;
        border-color: var(--gold);
        box-shadow: 0 0 6px rgba(255, 215, 0, .55);
      }

      .ar-rank-icon.completed {
        opacity: 1;
        border-color: #b88f00;
        background: linear-gradient(180deg, #ffde6a, #d7aa13);
        color: #1b1f24;
        font-weight: 700;
      }

      .ar-cp {
        color: var(--gold);
        font-size: 14px;
        font-weight: 700;
      }

      .ar-main {
        flex: 1;
        min-width: 0;
        min-height: 0;
        padding: 6px;
        display: flex;
        gap: 6px;
        overflow: hidden;
      }

      .ar-stats {
        width: 26%;
        min-width: 106px;
        border-radius: 4px;
        background: var(--surface);
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 7px;
        font-size: 12px;
      }

      .ar-stat-row {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid var(--btn-bg);
        padding-bottom: 4px;
      }

      .ar-stat-val.updating {
        color: var(--accent-green);
        animation: flash .45s;
      }

      .ar-center {
        flex: 1;
        min-width: 0;
        min-height: 0;
        border: 1px solid var(--surface);
        background: var(--ink);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
      }

      .ar-constellation {
        width: min(100%, 320px);
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      .ar-node:nth-child(5) {
        grid-column: span 2;
        justify-self: center;
      }

      .ar-node {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2px solid var(--text-dim);
        background: var(--btn-bg);
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 19px;
        position: relative;
        transition: all .2s;
        cursor: default;
      }

      .ar-node.locked {
        opacity: .35;
        filter: grayscale(1);
        cursor: not-allowed;
      }

      .ar-node.available {
        border-color: var(--silver);
        cursor: pointer;
        animation: pulse 1.8s infinite;
      }

      .ar-node.activated {
        color: var(--gold);
        border-color: var(--gold);
        background: var(--surface);
        box-shadow: 0 0 12px rgba(255, 215, 0, .5);
      }

      .ar-node::after {
        content: attr(data-info);
        position: absolute;
        left: 110%;
        top: 50%;
        transform: translateY(-50%);
        background: var(--overlay);
        border: 1px solid var(--surface);
        color: var(--text-main);
        font-size: 9px;
        line-height: 1.3;
        width: 150px;
        padding: 5px;
        opacity: 0;
        pointer-events: none;
        transition: opacity .2s;
        z-index: 3;
      }

      .ar-node:hover::after { opacity: 1; }

      .ar-bonus {
        width: 28%;
        min-width: 119px;
        border-radius: 4px;
        border: 1px solid var(--text-dim);
        background: var(--surface);
        color: var(--text-main);
        padding: 8px;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 2px;
        opacity: .65;
        cursor: not-allowed;
      }

      .ar-bonus.unlocked {
        opacity: 1;
        cursor: pointer;
        border-color: var(--gold);
        background: rgba(255, 215, 0, .1);
        box-shadow: 0 0 14px rgba(255, 215, 0, .2);
        animation: pulseGold 1.6s infinite;
      }

      .ar-bonus-ico {
        font-size: 24px;
        filter: grayscale(1);
      }

      .ar-bonus.unlocked .ar-bonus-ico {
        filter: grayscale(0);
      }

      .ar-bonus-label {
        color: var(--text-dim);
        font-weight: 700;
      }

      .ar-bonus.unlocked .ar-bonus-label {
        color: var(--gold);
      }

      .ar-bonus-sub { font-size: 9px; color: var(--text-dim); }

      .ar-bottom {
        height: 36px;
        padding: 0 10px;
        background: var(--surface);
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .ar-progress {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        background: var(--ink);
      }

      .ar-seg {
        flex: 1;
        background: var(--btn-bg);
        border-right: 1px solid var(--ink);
      }

      .ar-seg.filled { background: var(--rank-color); }

      .ar-lore {
        margin-top: 2px;
        text-align: center;
        font-size: 9px;
        color: var(--text-dim);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ar-ascension {
        position: absolute;
        inset: 0;
        background: var(--overlay);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 20;
        opacity: 0;
        pointer-events: none;
        transition: opacity .3s;
      }

      .ar-ascension.active {
        opacity: 1;
        pointer-events: all;
      }

      .ar-asc-msg {
        color: var(--gold);
        font-size: 22px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .counting-anim { animation: countUp .2s ease-out; }

      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(192,192,192,.35); }
        70% { box-shadow: 0 0 0 8px rgba(192,192,192,0); }
        100% { box-shadow: 0 0 0 0 rgba(192,192,192,0); }
      }

      @keyframes pulseGold {
        0% { box-shadow: 0 0 0 0 rgba(255,215,0,.35); }
        70% { box-shadow: 0 0 0 10px rgba(255,215,0,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); }
      }

      @keyframes flash {
        0% { color: var(--text-main); }
        50% { color: var(--accent-green); text-shadow: 0 0 6px rgba(46,160,67,.8); }
        100% { color: var(--text-main); }
      }

      @keyframes countUp {
        0% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
        100% { transform: translateY(0); }
      }

      @media (max-width: 420px) {
        .ar-main {
          flex-direction: column;
          overflow: auto;
        }

        .ar-stats,
        .ar-bonus {
          width: 100%;
          min-width: 0;
        }

        .ar-center {
          min-height: 220px;
        }

        .ar-node::after {
          left: 50%;
          top: 115%;
          transform: translateX(-50%);
        }
      }
    `;

    document.head.appendChild(style);
  }

  function template() {
    return `
      <div class="arbol-stage">
        <div class="arbol-shell">
          <div class="arbol-root" id="arbol-root">
            <div class="ar-top">
              <div class="ar-rank-timeline" id="ar-rank-timeline"></div>
              <div class="ar-cp" id="ar-cp">🌀 0</div>
            </div>

            <div class="ar-main">
              <div class="ar-stats" id="ar-stats"></div>

              <div class="ar-center">
                <div class="ar-constellation" id="ar-constellation"></div>
              </div>

              <button class="ar-bonus" id="ar-bonus" type="button">
                <div class="ar-bonus-ico" id="ar-bonus-ico">🔒</div>
                <div class="ar-bonus-label" id="ar-bonus-label">BLOQUEADO</div>
                <div class="ar-bonus-sub" id="ar-bonus-sub">COMPLETA LOS 5 NODOS</div>
              </button>
            </div>

            <div class="ar-bottom">
              <div class="ar-progress" id="ar-progress"></div>
              <div class="ar-lore" id="ar-lore"></div>
            </div>

            <div class="ar-ascension" id="ar-ascension">
              <div class="ar-asc-msg" id="ar-asc-msg">RANGO COMPLETADO</div>
              <div style="font-size:12px;margin-top:8px;color:var(--text-main)">ASCENDIENDO...</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mountArbolUI({ container, manager }) {
    ensureStyle();
    container.replaceChildren();
    container.insertAdjacentHTML('beforeend', template());

    const ranks = ['D', 'C', 'B', 'A', 'S'];
    const statsConfig = [
      { id: 'atk', icon: '⚔️', label: 'ATK', increment: 5 },
      { id: 'def', icon: '🛡️', label: 'DEF', increment: 5 },
      { id: 'hp', icon: '❤️', label: 'HP', increment: 50 },
      { id: 'spd', icon: '⚡', label: 'SPD', increment: 1 },
      { id: 'chak', icon: '🌀', label: 'CHAK', increment: 20 }
    ];

    const rankLore = {
      D: 'Recluta: Tu cuerpo empieza a resistir el combate real.',
      C: 'Operativo: Tu adaptación mejora bajo presión.',
      B: 'Veterano: Has sobrevivido a suficiente batalla para cargar más poder.',
      A: 'Élite: Tu control técnico ya domina el campo de combate.',
      S: 'Supremo: Tu presencia altera por completo el enfrentamiento.'
    };

    const rankColors = {
      D: '#cd7f32',
      C: '#8f6a40',
      B: '#c0c0c0',
      A: '#e5e4e2',
      S: '#ffd700'
    };

    const rankBonuses = {
      D: { icon: '🛡️', text: '+10 DEF', grants: { def: 10 } },
      C: { icon: '⚔️', text: '+10 ATK', grants: { atk: 10 } },
      B: { icon: '❤️', text: '+150 HP', grants: { hp: 150 } },
      A: { icon: '⚡', text: '+3 SPD', grants: { spd: 3 } },
      S: { icon: '🌀', text: '+40 CHAK', grants: { chak: 40 } }
    };

    const state = {
      currentRankIndex: 0,
      viewRankIndex: 0,
      combatPoints: 0,
      stats: { atk: 10, def: 10, hp: 100, spd: 5, chak: 50 },
      progress: ranks.map(() => [false, false, false, false, false]),
      bonusClaimed: ranks.map(() => false)
    };

    const q = (id) => container.querySelector(`#${id}`);
    const listeners = [];
    const timers = new Set();

    const on = (el, ev, fn) => {
      el.addEventListener(ev, fn);
      listeners.push(() => el.removeEventListener(ev, fn));
    };

    function setTimer(fn, ms) {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    }

    function syncStateManager() {
      if (!manager?.setState) return;
      manager.setState({
        atk: state.stats.atk,
        def: state.stats.def,
        hp: state.stats.hp,
        extra: { spd: state.stats.spd, chk: state.stats.chak },
        pc: state.combatPoints
      });
    }

    function getDone(ri) {
      return state.progress[ri].filter(Boolean).length;
    }

    function flashStat(key) {
      const el = q(`ar-stat-${key}`);
      if (!el) return;
      el.classList.remove('updating');
      void el.offsetWidth;
      el.classList.add('updating');
    }

    function animatePoints(targetValue) {
      let current = 0;
      const el = q('ar-cp');
      const step = Math.max(1, Math.ceil(targetValue / 20));

      const id = setInterval(() => {
        current += step;
        if (current >= targetValue) {
          current = targetValue;
          clearInterval(id);
          timers.delete(id);
        }

        state.combatPoints = current;
        el.textContent = `🌀 ${current}`;
        el.classList.add('counting-anim');
        setTimer(() => el.classList.remove('counting-anim'), 200);
      }, 30);

      timers.add(id);
    }

    function renderTimeline() {
      const timeline = q('ar-rank-timeline');
      timeline.innerHTML = '';

      ranks.forEach((rank, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ar-rank-icon';

        if (idx < state.currentRankIndex) {
          btn.classList.add('completed');
          btn.textContent = `✓ ${rank}`;
        } else if (idx === state.currentRankIndex) {
          btn.classList.add('active');
          btn.textContent = rank;
        } else {
          btn.textContent = `🔒 ${rank}`;
        }

        btn.addEventListener('click', () => {
          state.viewRankIndex = idx;
          renderAll();
        });

        timeline.appendChild(btn);
      });
    }

    function renderStats() {
      const statsEl = q('ar-stats');
      statsEl.innerHTML = '';

      statsConfig.forEach((stat) => {
        const row = document.createElement('div');
        row.className = 'ar-stat-row';
        row.innerHTML = `<span>${stat.label}</span><span class="ar-stat-val" id="ar-stat-${stat.id}">${state.stats[stat.id]}</span>`;
        statsEl.appendChild(row);
      });
    }

    function renderConstellation() {
      const vi = state.viewRankIndex;
      const isCurrent = vi === state.currentRankIndex;
      const done = getDone(vi);
      const rank = ranks[vi];

      const grid = q('ar-constellation');
      grid.innerHTML = '';

      q('ar-lore').textContent = `${rank}: ${rankLore[rank]}`;
      q('arbol-root').style.setProperty('--rank-color', rankColors[rank]);

      statsConfig.forEach((stat, idx) => {
        const node = document.createElement('button');
        node.type = 'button';
        node.className = 'ar-node';
        node.innerHTML = stat.icon;

        const activated = state.progress[vi][idx];
        const canBuy = isCurrent && !activated && done === idx && state.combatPoints >= 20;

        if (activated) {
          node.classList.add('activated');
        } else if (canBuy) {
          node.classList.add('available');
        } else {
          node.classList.add('locked');
        }

        const currentVal = state.stats[stat.id];
        const nextVal = currentVal + stat.increment;
        node.dataset.info = `+${stat.increment} ${stat.label} actual ${currentVal} -> ${nextVal}`;

        if (canBuy) {
          node.addEventListener('click', () => {
            state.combatPoints -= 20;
            state.progress[vi][idx] = true;
            state.stats[stat.id] += stat.increment;

            flashStat(stat.id);
            syncStateManager();
            renderAll();
          });
        }

        grid.appendChild(node);
      });
    }

    function renderProgress() {
      const vi = state.viewRankIndex;
      const progress = q('ar-progress');
      progress.innerHTML = '';

      for (let i = 0; i < 5; i += 1) {
        const seg = document.createElement('div');
        seg.className = 'ar-seg';
        if (state.progress[vi][i]) seg.classList.add('filled');
        progress.appendChild(seg);
      }
    }

    function renderBonus() {
      const vi = state.viewRankIndex;
      const isCurrent = vi === state.currentRankIndex;
      const done = getDone(vi);
      const bonus = rankBonuses[ranks[vi]];

      const panel = q('ar-bonus');
      const icon = q('ar-bonus-ico');
      const label = q('ar-bonus-label');
      const sub = q('ar-bonus-sub');

      panel.classList.remove('unlocked');

      if (isCurrent && done === 5 && !state.bonusClaimed[vi]) {
        panel.classList.add('unlocked');
        icon.textContent = bonus.icon;
        label.textContent = bonus.text;
        sub.textContent = 'CLICK PARA DESBLOQUEAR BONO';
      } else if (state.bonusClaimed[vi]) {
        panel.classList.add('unlocked');
        icon.textContent = bonus.icon;
        label.textContent = bonus.text;
        sub.textContent = 'BONO OBTENIDO';
      } else if (vi > state.currentRankIndex) {
        icon.textContent = '🔒';
        label.textContent = 'RANGO FUTURO';
        sub.textContent = 'BLOQUEADO';
      } else {
        icon.textContent = '🔒';
        label.textContent = 'BLOQUEADO';
        sub.textContent = `COMPLETA ${5 - done} NODOS`;
      }
    }

    function triggerAscension() {
      const vi = state.currentRankIndex;
      const currentRank = ranks[vi];
      const bonus = rankBonuses[currentRank];
      const overlay = q('ar-ascension');

      q('ar-asc-msg').textContent = `RANGO COMPLETADO: ${currentRank}`;
      overlay.classList.add('active');

      setTimer(() => {
        Object.entries(bonus.grants).forEach(([key, val]) => {
          state.stats[key] += val;
          flashStat(key);
        });

        state.bonusClaimed[vi] = true;

        if (vi < ranks.length - 1) {
          state.currentRankIndex += 1;
          state.viewRankIndex = state.currentRankIndex;
        }

        overlay.classList.remove('active');
        syncStateManager();
        renderAll();
      }, 1400);
    }

    function renderAll() {
      q('ar-cp').textContent = `🌀 ${state.combatPoints}`;
      renderTimeline();
      renderStats();
      renderConstellation();
      renderProgress();
      renderBonus();
    }

    on(q('ar-bonus'), 'click', () => {
      const vi = state.viewRankIndex;
      if (vi !== state.currentRankIndex) return;
      if (getDone(vi) !== 5) return;
      if (state.bonusClaimed[vi]) return;
      triggerAscension();
    });

    renderAll();
    animatePoints(150);

    return {
      destroy() {
        listeners.forEach((off) => off());
        listeners.length = 0;

        timers.forEach((id) => {
          clearTimeout(id);
          clearInterval(id);
        });
        timers.clear();

        container.replaceChildren();
      }
    };
  }

  window.mountArbolUI = mountArbolUI;
})();
