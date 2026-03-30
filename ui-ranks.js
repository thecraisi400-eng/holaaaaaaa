(() => {
  const STYLE_ID = 'arbol-ranks-style-v2';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .arbol-stage{
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
        background:rgba(8, 12, 20, 0.85);
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:auto;
        padding:8px;
      }
      .arbol-stage::-webkit-scrollbar{width:8px;height:8px}
      .arbol-stage::-webkit-scrollbar-track{background:#0d1117}
      .arbol-stage::-webkit-scrollbar-thumb{background:#1c2740;border-radius:8px}

      .arbol-shell{
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
        display:flex;
      }

      .arbol-root{
        --ink:#0d1117;
        --panel:#131a26;
        --surface:#1c2740;
        --btn-bg:#162035;
        --overlay:rgba(8,12,20,0.85);
        --bronze:#cd7f32;
        --silver:#c0c0c0;
        --gold:#ffd700;
        --text-main:#e6edf3;
        --text-dim:#8b949e;
        --accent-green:#2ea043;
        --accent-red:#da3633;
        --rank-color:#cd7f32;
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
        background:var(--panel);
        border:2px solid var(--surface);
        box-shadow:0 0 20px rgba(0,0,0,0.5);
        display:flex;
        flex-direction:column;
        position:relative;
        overflow:hidden;
        color:var(--text-main);
        font-family:'Courier New', Courier, monospace;
      }

      .ar-top{
        height:40px;
        min-height:40px;
        background:var(--surface);
        border-bottom:1px solid var(--ink);
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        padding:0 10px;
      }
      .ar-rank-timeline{display:flex;gap:4px;overflow-x:auto;min-width:0;flex:1}
      .ar-rank-icon{
        min-width:52px;height:25px;padding:0 4px;border:1px solid var(--text-dim);
        background:var(--btn-bg);display:flex;align-items:center;justify-content:center;
        font-size:9px;cursor:pointer;opacity:.5;white-space:nowrap;position:relative;
      }
      .ar-rank-icon.active{opacity:1;border-color:var(--gold);box-shadow:0 0 5px var(--gold)}
      .ar-rank-icon.completed{opacity:1;background:var(--gold);color:var(--ink);font-weight:700}
      .ar-rank-icon.future::after{content:'🔒';position:absolute;top:-8px;right:-4px;font-size:10px}

      .ar-cp{font-size:14px;color:var(--gold);font-weight:700;white-space:nowrap;text-shadow:0 0 5px rgba(255,215,0,.5)}
      .counting-anim{animation:countUp .2s ease-out}
      @keyframes countUp{0%{transform:translateY(0)}50%{transform:translateY(-2px);color:#fff}100%{transform:translateY(0)}}

      .ar-main{
        flex:1;
        min-height:0;
        min-width:0;
        display:flex;
        gap:6px;
        padding:6px;
        overflow:hidden;
      }

      .ar-stats{
        width:25%;
        min-width:110px;
        background:var(--surface);
        border-radius:4px;
        padding:8px;
        display:flex;
        flex-direction:column;
        gap:6px;
        font-size:13px;
      }
      .ar-stat-row{display:flex;justify-content:space-between;border-bottom:1px solid var(--btn-bg);padding-bottom:4px}
      .ar-stat-val.updating{color:var(--accent-green);animation:flash .5s}
      @keyframes flash{0%{color:var(--text-main)}50%{color:var(--accent-green);text-shadow:0 0 5px var(--accent-green)}100%{color:var(--text-main)}}

      .ar-center{
        flex:1;
        min-width:0;
        min-height:0;
        background:var(--ink);
        border:1px solid var(--surface);
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        position:relative;
        overflow:hidden;
        padding:8px;
      }
      .ar-title{font-size:13px;color:var(--rank-color);font-weight:700;letter-spacing:.6px;text-align:center}
      .ar-lore{font-size:10px;color:var(--text-dim);text-align:center;margin-bottom:6px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

      .ar-locked-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:.2;color:var(--text-dim);font-size:24px;letter-spacing:4px}
      .ar-constellation{
        width:min(100%,340px);
        flex:1;
        min-height:120px;
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px;
        align-content:center;
        justify-items:center;
        z-index:2;
      }
      .ar-node:nth-child(5){grid-column:span 2}
      .ar-node{
        width:48px;height:48px;border-radius:50%;border:2px solid var(--text-dim);
        background:var(--btn-bg);display:flex;align-items:center;justify-content:center;
        font-size:20px;position:relative;transition:all .25s;cursor:default;
      }
      .ar-node.locked{opacity:.3;filter:grayscale(100%);cursor:not-allowed}
      .ar-node.available{border-color:var(--silver);animation:pulse 2s infinite;cursor:pointer}
      .ar-node.activated{background:var(--surface);border-color:var(--gold);box-shadow:0 0 10px var(--gold);color:var(--gold)}
      @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(192,192,192,.4)}70%{box-shadow:0 0 0 6px rgba(192,192,192,0)}100%{box-shadow:0 0 0 0 rgba(192,192,192,0)}}
      .ar-node::after{
        content:attr(data-info);
        position:absolute;
        left:110%;
        top:50%;
        transform:translateY(-50%);
        opacity:0;
        pointer-events:none;
        background:var(--overlay);
        border:1px solid var(--surface);
        padding:4px;
        font-size:9px;
        width:160px;
        white-space:normal;
        z-index:20;
        transition:opacity .2s;
      }
      .ar-node:hover::after{opacity:1}

      .ar-bonus{
        width:27%;
        min-width:130px;
        background:var(--surface);
        border:1px solid var(--text-dim);
        border-radius:4px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:6px;
        text-align:center;
        font-size:12px;
        padding:8px;
        opacity:.65;
        cursor:not-allowed;
        transition:all .3s;
      }
      .ar-bonus.unlocked{border-color:var(--gold);background:rgba(255,215,0,.1);opacity:1;cursor:pointer;animation:pulseGold 1.5s infinite}
      .ar-bonus.unlocked:hover{transform:scale(1.03)}
      @keyframes pulseGold{0%{box-shadow:0 0 0 0 rgba(255,215,0,.4)}70%{box-shadow:0 0 0 10px rgba(255,215,0,0)}100%{box-shadow:0 0 0 0 rgba(255,215,0,0)}}
      .ar-bonus-ico{font-size:26px;filter:grayscale(1)}
      .ar-bonus.unlocked .ar-bonus-ico{filter:grayscale(0);animation:glow 1s infinite alternate}
      @keyframes glow{from{text-shadow:0 0 2px var(--gold)}to{text-shadow:0 0 10px var(--gold),0 0 5px var(--gold)}}
      .ar-bonus-label{font-weight:700;color:var(--text-dim)}
      .ar-bonus.unlocked .ar-bonus-label{color:var(--gold)}
      .ar-bonus-sub{font-size:10px;color:var(--text-dim)}

      .ar-bottom{height:34px;min-height:34px;background:var(--surface);padding:4px 10px;display:flex;flex-direction:column;justify-content:center}
      .ar-progress{height:8px;background:var(--ink);border-radius:4px;display:flex;overflow:hidden}
      .ar-seg{flex:1;background:var(--btn-bg);border-right:1px solid var(--ink)}
      .ar-seg.filled{background:var(--rank-color)}
      .ar-lore-bottom{font-size:9px;color:var(--text-dim);text-align:center;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

      .ar-ascension{
        position:absolute;inset:0;z-index:100;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        background:var(--overlay);opacity:0;pointer-events:none;transition:opacity .5s;
      }
      .ar-ascension.active{opacity:1;pointer-events:all}
      .ar-asc-msg{font-size:24px;color:var(--gold);font-weight:700;letter-spacing:2px;text-shadow:0 0 10px var(--gold);animation:popIn .5s cubic-bezier(.175,.885,.32,1.275)}
      @keyframes popIn{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}

      @media (max-width: 420px){
        .ar-main{flex-direction:column}
        .ar-stats,.ar-bonus{width:100%;min-width:0}
        .ar-center{order:-1;min-height:190px}
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
                <div class="ar-title" id="ar-title"></div>
                <div class="ar-lore" id="ar-lore"></div>
                <div class="ar-locked-bg" id="ar-locked-bg"></div>
                <div class="ar-constellation" id="ar-constellation"></div>
              </div>
              <div class="ar-bonus" id="ar-bonus">
                <div class="ar-bonus-ico" id="ar-bonus-ico">🔒</div>
                <div class="ar-bonus-label" id="ar-bonus-label">BLOQUEADO</div>
                <div class="ar-bonus-sub" id="ar-bonus-sub">COMPLETA LOS 5 NODOS</div>
              </div>
            </div>
            <div class="ar-bottom">
              <div class="ar-progress" id="ar-progress"></div>
              <div class="ar-lore-bottom" id="ar-lore-bottom"></div>
            </div>
            <div class="ar-ascension" id="ar-ascension">
              <div class="ar-asc-msg" id="ar-asc-msg">RANGO COMPLETADO</div>
              <div style="font-size:12px;margin-top:10px;">ASCENDIENDO...</div>
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

    const ranks = ['GENIN', 'CHŪNIN', 'JŌNIN', 'ANBU', 'KAGE'];
    const statsConfig = [
      { id: 'atk', icon: '⚔️', label: 'ATK', increment: 5 },
      { id: 'def', icon: '🛡️', label: 'DEF', increment: 5 },
      { id: 'hp', icon: '❤️', label: 'HP', increment: 50 },
      { id: 'spd', icon: '⚡', label: 'SPD', increment: 1 },
      { id: 'chak', icon: '🌀', label: 'CHAK', increment: 20 }
    ];

    const rankBonuses = {
      GENIN: { icon: '🍥', text: '+10% DEF' },
      'CHŪNIN': { icon: '⚔️', text: '+10% ATK' },
      'JŌNIN': { icon: '❤️', text: '+15% HP' },
      ANBU: { icon: '⚡', text: '+20% SPD' },
      KAGE: { icon: '👑', text: 'MASTER' }
    };

    const rankLore = {
      GENIN: 'Academia: Tu cuerpo comienza a adaptarse al chakra básico.',
      'CHŪNIN': 'Has sobrevivido a misiones de rango bajo. Resistencia aumentada.',
      'JŌNIN': 'Estrategia y poder bruto se equilibran en tu ser.',
      ANBU: 'Eres una amenaza para la aldea. Maestría elemental.',
      KAGE: 'Tu presencia distorsiona el campo de batalla.'
    };

    const rankColors = {
      GENIN: '#cd7f32',
      'CHŪNIN': '#c0c0c0',
      'JŌNIN': '#b08d57',
      ANBU: '#e5e4e2',
      KAGE: '#ffd700'
    };

    const state = {
      currentRankIndex: 0,
      viewRankIndex: 0,
      combatPoints: 150,
      stats: { atk: 10, def: 10, hp: 100, spd: 5, chak: 50 },
      progress: ranks.map(() => [false, false, false, false, false]),
      bonusClaimed: ranks.map(() => false)
    };

    const listeners = [];
    const timers = new Set();
    let ascensionRunning = false;
    const q = (id) => container.querySelector(`#${id}`);
    const on = (el, ev, fn, opts) => {
      el.addEventListener(ev, fn, opts);
      listeners.push(() => el.removeEventListener(ev, fn, opts));
    };
    const setT = (fn, ms) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    function getDone(index) {
      return state.progress[index].filter(Boolean).length;
    }

    function refreshManagerStats() {
      if (manager?.setState) {
        manager.setState({
          atk: state.stats.atk,
          def: state.stats.def,
          hp: state.stats.hp
        });
      }
    }

    function animatePoints(targetValue) {
      let current = 0;
      const step = Math.ceil(targetValue / 20);
      const el = q('ar-cp');
      const interval = window.setInterval(() => {
        current += step;
        if (current >= targetValue) {
          current = targetValue;
          window.clearInterval(interval);
          timers.delete(interval);
        }
        state.combatPoints = current;
        el.textContent = `🌀 ${current}`;
        el.classList.add('counting-anim');
        setT(() => el.classList.remove('counting-anim'), 180);
      }, 30);
      timers.add(interval);
    }

    function renderTimeline() {
      const timeline = q('ar-rank-timeline');
      timeline.innerHTML = '';
      ranks.forEach((name, index) => {
        const icon = document.createElement('button');
        icon.type = 'button';
        icon.className = 'ar-rank-icon';
        icon.textContent = index < state.currentRankIndex ? `✓ ${name}` : name;
        if (index < state.currentRankIndex) icon.classList.add('completed');
        else if (index === state.currentRankIndex) icon.classList.add('active');
        else icon.classList.add('future');
        icon.addEventListener('click', () => {
          state.viewRankIndex = index;
          renderAll();
        });
        timeline.appendChild(icon);
      });
    }

    function renderStatsSheet() {
      const stats = q('ar-stats');
      stats.innerHTML = '';
      statsConfig.forEach(({ label, id }) => {
        const row = document.createElement('div');
        row.className = 'ar-stat-row';
        row.innerHTML = `<span>${label}</span><span id="ar-stat-${id}" class="ar-stat-val">${state.stats[id]}</span>`;
        stats.appendChild(row);
      });
    }

    function flashStat(id) {
      const el = q(`ar-stat-${id}`);
      if (!el) return;
      el.classList.remove('updating');
      void el.offsetWidth;
      el.classList.add('updating');
      setT(() => el.classList.remove('updating'), 520);
    }

    function renderProgress() {
      const bar = q('ar-progress');
      bar.innerHTML = '';
      const vi = state.viewRankIndex;
      for (let i = 0; i < 5; i += 1) {
        const seg = document.createElement('div');
        seg.className = `ar-seg ${state.progress[vi][i] ? 'filled' : ''}`;
        bar.appendChild(seg);
      }
    }

    function renderBonusPanel() {
      const vi = state.viewRankIndex;
      const bonus = rankBonuses[ranks[vi]];
      const done = getDone(vi);
      const isCurrent = vi === state.currentRankIndex;
      const isComplete = done === 5;
      const isPast = vi < state.currentRankIndex || state.bonusClaimed[vi];

      const panel = q('ar-bonus');
      const icon = q('ar-bonus-ico');
      const label = q('ar-bonus-label');
      const sub = q('ar-bonus-sub');

      panel.classList.remove('unlocked');
      if ((isCurrent && isComplete) || isPast) {
        panel.classList.add('unlocked');
        icon.textContent = bonus.icon;
        label.textContent = bonus.text;
        sub.textContent = isCurrent && isComplete ? 'CLICK PARA ASCENDER' : 'BONO OBTENIDO';
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

    function renderConstellation() {
      const vi = state.viewRankIndex;
      const currentRank = ranks[vi];
      const done = getDone(vi);
      const isCurrent = vi === state.currentRankIndex;
      const grid = q('ar-constellation');
      grid.innerHTML = '';

      q('ar-title').textContent = currentRank;
      q('ar-lore').textContent = rankLore[currentRank];
      q('ar-lore-bottom').textContent = `${currentRank}: ${rankLore[currentRank]}`;
      q('arbol-root').style.setProperty('--rank-color', rankColors[currentRank]);

      const futureRanks = ranks.slice(vi + 1).join(' ⛓ ');
      q('ar-locked-bg').textContent = futureRanks;

      statsConfig.forEach((stat, index) => {
        const node = document.createElement('button');
        node.type = 'button';
        node.className = 'ar-node';
        node.innerHTML = stat.icon;

        const active = state.progress[vi][index];
        const canBuy = isCurrent && !active && done === index && state.combatPoints >= 20;

        if (active) node.classList.add('activated');
        else if (canBuy) node.classList.add('available');
        else node.classList.add('locked');

        const currentVal = state.stats[stat.id];
        const nextVal = currentVal + stat.increment;
        node.setAttribute('data-info', `${stat.label}: +${stat.increment} (${currentVal} actuales → ${nextVal} tras mejora)`);

        if (canBuy) {
          node.addEventListener('click', () => {
            state.combatPoints -= 20;
            state.progress[vi][index] = true;
            state.stats[stat.id] += stat.increment;
            refreshManagerStats();
            flashStat(stat.id);
            const newDone = getDone(vi);
            if (newDone === 5) {
              renderAll();
              runAscension();
              return;
            }
            renderAll();
          });
        }

        grid.appendChild(node);
      });
    }

    function runAscension() {
      if (ascensionRunning) return;
      ascensionRunning = true;
      const ov = q('ar-ascension');
      const msg = q('ar-asc-msg');
      const rankName = ranks[state.currentRankIndex];
      msg.textContent = `RANGO COMPLETADO: ${rankName}`;
      ov.classList.add('active');

      setT(() => {
        state.bonusClaimed[state.currentRankIndex] = true;
        if (state.currentRankIndex < ranks.length - 1) {
          state.currentRankIndex += 1;
          state.viewRankIndex = state.currentRankIndex;
          state.combatPoints += 100;
        }
        ov.classList.remove('active');
        renderAll();
        ascensionRunning = false;
      }, 1400);
    }

    function bindBonus() {
      on(q('ar-bonus'), 'click', () => {
        if (state.viewRankIndex !== state.currentRankIndex) return;
        if (getDone(state.currentRankIndex) === 5) runAscension();
      });
    }

    function renderAll() {
      renderTimeline();
      q('ar-cp').textContent = `🌀 ${state.combatPoints}`;
      renderStatsSheet();
      renderConstellation();
      renderProgress();
      renderBonusPanel();
    }

    bindBonus();
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
