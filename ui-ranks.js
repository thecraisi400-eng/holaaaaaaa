(() => {
  const STYLE_ID = 'arbol-ranks-style-v3';

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
        background: rgba(8, 12, 20, 0.85);
        overflow: auto;
      }

      .arbol-stage::-webkit-scrollbar { width: 8px; height: 8px; }
      .arbol-stage::-webkit-scrollbar-track { background: #0d1117; }
      .arbol-stage::-webkit-scrollbar-thumb { background: #1c2740; border-radius: 8px; }

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
        display: flex;
        flex-direction: column;
        background: var(--panel);
        border: 2px solid var(--surface);
        color: var(--text-main);
        overflow: hidden;
        font-family: 'Courier New', Courier, monospace;
      }

      .ar-top {
        height: 40px;
        background: var(--surface);
        border-bottom: 1px solid var(--ink);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 10px;
      }

      .ar-rank-timeline {
        display: flex;
        gap: 3px;
        overflow-x: auto;
        min-width: 0;
        flex: 1;
      }

      .ar-rank-icon {
        min-width: 50px;
        height: 25px;
        background: var(--btn-bg);
        border: 1px solid var(--text-dim);
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        padding: 0 4px;
        white-space: nowrap;
        opacity: .5;
        cursor: pointer;
      }

      .ar-rank-icon.active { opacity: 1; border-color: var(--gold); box-shadow: 0 0 5px var(--gold); }
      .ar-rank-icon.completed { opacity: 1; background: var(--gold); color: var(--ink); font-weight: 700; }

      .ar-cp {
        font-size: 14px;
        color: var(--gold);
        font-weight: 700;
        white-space: nowrap;
      }

      .ar-main {
        flex: 1;
        min-height: 0;
        min-width: 0;
        display: flex;
        gap: 6px;
        padding: 6px;
        overflow: hidden;
      }

      .ar-stats {
        width: 25%;
        min-width: 106px;
        background: var(--surface);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 7px;
        font-size: 13px;
      }

      .ar-stat-row { display: flex; justify-content: space-between; border-bottom: 1px solid var(--btn-bg); padding-bottom: 4px; }
      .ar-stat-val.updating { color: var(--accent-green); animation: flash .5s; }

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

      .ar-locked-bg {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: .15;
        color: var(--text-dim);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 34px;
        letter-spacing: 4px;
      }

      .ar-constellation {
        width: min(100%, 320px);
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        z-index: 2;
      }

      .ar-node:nth-child(5) { grid-column: span 2; justify-self: center; }

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
        font-size: 18px;
        position: relative;
        transition: all .2s;
        cursor: default;
      }

      .ar-node.locked { opacity: .3; filter: grayscale(1); cursor: not-allowed; }
      .ar-node.available { border-color: var(--silver); animation: pulse 2s infinite; cursor: pointer; }
      .ar-node.activated { background: var(--surface); border-color: var(--gold); box-shadow: 0 0 10px var(--gold); color: var(--gold); }

      .ar-node::after {
        content: attr(data-info);
        position: absolute;
        bottom: 112%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--overlay);
        border: 1px solid var(--surface);
        padding: 4px;
        width: 150px;
        text-align: center;
        font-size: 9px;
        opacity: 0;
        pointer-events: none;
        transition: opacity .2s;
        z-index: 10;
      }

      .ar-node:hover::after { opacity: 1; }

      .ar-bonus {
        width: 27%;
        min-width: 119px;
        background: var(--surface);
        border: 1px solid var(--text-dim);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 12px;
        padding: 7px;
        opacity: .6;
        cursor: not-allowed;
      }

      .ar-bonus.unlocked {
        border-color: var(--gold);
        background: rgba(255, 215, 0, 0.1);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
        opacity: 1;
        cursor: pointer;
        animation: pulse-gold 1.5s infinite;
      }

      .ar-bonus-ico { font-size: 26px; margin-bottom: 6px; filter: grayscale(1); }
      .ar-bonus.unlocked .ar-bonus-ico { filter: grayscale(0); animation: glow 1s infinite alternate; }
      .ar-bonus-label { font-weight: 700; color: var(--text-dim); }
      .ar-bonus.unlocked .ar-bonus-label { color: var(--gold); }
      .ar-bonus-sub { font-size: 9px; color: var(--text-dim); }

      .ar-bottom {
        height: 34px;
        background: var(--surface);
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 10px;
      }

      .ar-progress { width: 100%; height: 8px; background: var(--ink); border-radius: 4px; overflow: hidden; display: flex; }
      .ar-seg { flex: 1; background: var(--btn-bg); border-right: 1px solid var(--ink); }
      .ar-seg.filled { background: var(--rank-color); }
      .ar-lore { font-size: 9px; color: var(--text-dim); text-align: center; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .ar-ascension {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        z-index: 30;
        background: var(--overlay);
        opacity: 0;
        pointer-events: none;
        transition: opacity .5s;
      }

      .ar-ascension.active { opacity: 1; pointer-events: all; }
      .ar-asc-msg { font-size: 24px; color: var(--gold); font-weight: 700; text-shadow: 0 0 10px var(--gold); }

      @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(192,192,192,.4); } 70% { box-shadow: 0 0 0 6px rgba(192,192,192,0); } 100% { box-shadow: 0 0 0 0 rgba(192,192,192,0); } }
      @keyframes pulse-gold { 0% { box-shadow: 0 0 0 0 rgba(255,215,0,.4); } 70% { box-shadow: 0 0 0 10px rgba(255,215,0,0); } 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); } }
      @keyframes glow { from { text-shadow: 0 0 2px var(--gold); } to { text-shadow: 0 0 10px var(--gold), 0 0 5px var(--gold); } }
      @keyframes flash { 0% { color: var(--text-main); } 50% { color: var(--accent-green); } 100% { color: var(--text-main); } }
      @keyframes countUp { 0% { transform: translateY(0); } 50% { transform: translateY(-2px); color: #fff; } 100% { transform: translateY(0); } }
      .counting-anim { animation: countUp .2s ease-out; }

      @media (max-width: 420px) {
        .ar-main { flex-direction: column; overflow: auto; }
        .ar-stats, .ar-bonus { width: 100%; min-width: 0; }
        .ar-center { min-height: 200px; }
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
                <div class="ar-locked-bg" id="ar-locked-bg"></div>
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
              <div class="ar-lore" id="ar-lore">Cargando...</div>
            </div>

            <div class="ar-ascension" id="ar-ascension">
              <div class="ar-asc-msg" id="ar-asc-msg">RANGO COMPLETADO</div>
              <div style="font-size:12px;margin-top:10px;color:var(--text-main)">ASCENDIENDO...</div>
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
      D: 'Recluta: Tu cuerpo apenas inicia su adaptación al combate.',
      C: 'Superviviente: Tu resistencia ya supera al promedio.',
      B: 'Veterano: Has sobrevivido a lo suficiente para soportar más carga.',
      A: 'Élite: Tu control técnico en batalla es sobresaliente.',
      S: 'Ascendido: Tu presencia altera el ritmo del combate.'
    };

    const rankColors = {
      D: '#cd7f32',
      C: '#9a7b4f',
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

    function flashStat(key) {
      const el = q(`ar-stat-${key}`);
      if (!el) return;
      el.classList.remove('updating');
      void el.offsetWidth;
      el.classList.add('updating');
    }

    function renderTimeline() {
      const timeline = q('ar-rank-timeline');
      timeline.innerHTML = '';
      ranks.forEach((rank, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ar-rank-icon';

        if (index < state.currentRankIndex) {
          btn.classList.add('completed');
          btn.textContent = `✓ ${rank}`;
        } else if (index === state.currentRankIndex) {
          btn.classList.add('active');
          btn.textContent = rank;
        } else {
          btn.textContent = `🔒 ${rank}`;
        }

        btn.addEventListener('click', () => {
          state.viewRankIndex = index;
          renderAll();
        });

        timeline.appendChild(btn);
      });
    }

    function renderStats() {
      const wrap = q('ar-stats');
      wrap.innerHTML = '';
      statsConfig.forEach((s) => {
        const row = document.createElement('div');
        row.className = 'ar-stat-row';
        row.innerHTML = `<span>${s.label}</span><span class="ar-stat-val" id="ar-stat-${s.id}">${state.stats[s.id]}</span>`;
        wrap.appendChild(row);
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

      const future = ranks.slice(vi + 1).join(' ⛓ ');
      q('ar-locked-bg').textContent = future;

      statsConfig.forEach((stat, idx) => {
        const node = document.createElement('button');
        node.type = 'button';
        node.className = 'ar-node';
        node.innerHTML = stat.icon;

        const active = state.progress[vi][idx];
        const canBuy = isCurrent && !active && done === idx && state.combatPoints >= 20;
        if (active) node.classList.add('activated');
        else if (canBuy) node.classList.add('available');
        else node.classList.add('locked');

        const currentVal = state.stats[stat.id];
        const nextVal = currentVal + stat.increment;
        node.dataset.info = `+${stat.increment} ${stat.label}: ${currentVal} -> ${nextVal}`;

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
      const bar = q('ar-progress');
      bar.innerHTML = '';
      for (let i = 0; i < 5; i += 1) {
        const seg = document.createElement('div');
        seg.className = 'ar-seg';
        if (state.progress[vi][i]) seg.classList.add('filled');
        bar.appendChild(seg);
      }
    }

    function renderBonus() {
      const vi = state.viewRankIndex;
      const done = getDone(vi);
      const isCurrent = vi === state.currentRankIndex;
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
      const rank = ranks[vi];
      const bonus = rankBonuses[rank];
      const overlay = q('ar-ascension');
      q('ar-asc-msg').textContent = `RANGO COMPLETADO: ${rank}`;
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
      }, 1300);
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
