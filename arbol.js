(() => {
  const STYLE_ID = 'arbol-ui-style-v2';

  const CSS = `
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
      width: 100%;
      height: 100%;
      background: var(--ink);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--surface);
      font-size: 95%;
    }

    .arbol-root * { box-sizing: border-box; }

    .arbol-root ::-webkit-scrollbar { width: 8px; height: 8px; }
    .arbol-root ::-webkit-scrollbar-track { background: var(--ink); }
    .arbol-root ::-webkit-scrollbar-thumb { background: var(--btn-bg); border-radius: 8px; }

    .arbol-top {
      min-height: 44px;
      background: var(--surface);
      border-bottom: 1px solid var(--ink);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 8px;
      gap: 8px;
    }

    .arbol-timeline {
      display: flex;
      gap: 4px;
      overflow-x: auto;
      max-width: 70%;
    }

    .arbol-rank-btn {
      border: 1px solid var(--text-dim);
      color: var(--text-main);
      background: var(--btn-bg);
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 4px;
      opacity: 0.45;
      white-space: nowrap;
      cursor: pointer;
    }

    .arbol-rank-btn.current {
      opacity: 1;
      border-color: var(--gold);
      box-shadow: 0 0 10px #ffd70055;
    }

    .arbol-rank-btn.done {
      opacity: 1;
      color: var(--ink);
      background: var(--gold);
      font-weight: 700;
    }

    .arbol-points { color: var(--gold); font-weight: 700; font-size: 13px; }

    .arbol-main {
      width: 100%;
      height: 100%;
      min-height: 0;
      display: grid;
      grid-template-columns: 1fr;
      grid-auto-rows: minmax(100px, auto);
      gap: 7px;
      padding: 7px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .arbol-stats,
    .arbol-bonus,
    .arbol-constellation {
      background: var(--panel);
      border: 1px solid var(--surface);
      border-radius: 6px;
      min-height: 0;
    }

    .arbol-stats {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
    }

    .arbol-stat-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--btn-bg);
      padding-bottom: 5px;
      font-size: 12px;
    }

    .arbol-stat-value.bump {
      color: var(--accent-green);
      text-shadow: 0 0 6px var(--accent-green);
      transition: all .35s;
    }

    .arbol-constellation {
      background: linear-gradient(180deg, #0e1420 0%, #0b111b 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
    }

    .arbol-silhouette {
      position: absolute;
      inset: 18% 10%;
      border: 2px dashed #ffffff11;
      border-radius: 10px;
      opacity: 0.2;
      pointer-events: none;
    }

    .arbol-grid {
      z-index: 2;
      width: min(240px, 92%);
      display: grid;
      grid-template-columns: repeat(2, minmax(60px, 1fr));
      gap: 12px;
      justify-items: center;
      align-content: center;
    }

    .arbol-node {
      width: 53px;
      height: 53px;
      border-radius: 50%;
      border: 2px solid var(--text-dim);
      background: var(--btn-bg);
      color: var(--text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 23px;
      cursor: default;
      transition: all .25s;
      position: relative;
      overflow: visible;
    }

    .arbol-node:nth-child(5) { grid-column: 1 / span 2; }

    .arbol-node.locked { opacity: .35; filter: grayscale(1); }

    .arbol-node.available {
      border-color: var(--silver);
      color: var(--silver);
      cursor: pointer;
      animation: arbolPulse 1.8s infinite;
    }

    .arbol-node.active {
      border-color: var(--gold);
      color: var(--gold);
      box-shadow: 0 0 10px #ffd70088;
      background: var(--surface);
    }

    .arbol-tooltip {
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      background: var(--overlay);
      border: 1px solid var(--surface);
      border-radius: 4px;
      padding: 6px;
      font-size: 10px;
      width: 170px;
      opacity: 0;
      pointer-events: none;
      transition: opacity .2s;
      text-align: left;
      z-index: 6;
    }

    .arbol-node:hover .arbol-tooltip { opacity: 1; }

    .arbol-bonus {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: center;
      align-items: center;
      text-align: center;
      overflow: hidden;
    }

    .arbol-bonus-card {
      width: 100%;
      border: 1px solid var(--text-dim);
      border-radius: 6px;
      background: var(--btn-bg);
      padding: 10px;
      opacity: .65;
      cursor: not-allowed;
      transition: all .2s;
    }

    .arbol-bonus-card.ready {
      border-color: var(--gold);
      color: var(--gold);
      opacity: 1;
      cursor: pointer;
      box-shadow: 0 0 12px #ffd70044;
    }

    .arbol-progress-wrap {
      min-height: 44px;
      background: var(--surface);
      border-top: 1px solid var(--ink);
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .arbol-progress {
      width: 100%;
      height: 10px;
      display: flex;
      gap: 2px;
    }

    .arbol-progress > span {
      flex: 1;
      border-radius: 3px;
      background: var(--btn-bg);
    }

    .arbol-progress > span.fill { background: var(--bronze); }

    .arbol-lore {
      font-size: 11px;
      color: var(--text-dim);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .arbol-overlay {
      position: absolute;
      inset: 0;
      background: var(--overlay);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      z-index: 20;
      opacity: 0;
      pointer-events: none;
    }

    .arbol-overlay.show { opacity: 1; pointer-events: all; }

    @keyframes arbolPulse {
      0% { box-shadow: 0 0 0 0 #c0c0c066; }
      80% { box-shadow: 0 0 0 10px #c0c0c000; }
      100% { box-shadow: 0 0 0 0 #c0c0c000; }
    }

    @media (max-width: 820px) {
      .arbol-tooltip {
        left: 50%;
        top: -8px;
        transform: translate(-50%, -100%);
        width: 150px;
      }
    }
  `;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  window.mountArbolUI = function mountArbolUI({ container, manager, getStats, getSkillPoints, spendSkillPoints, onAllocateStat }) {
    ensureStyle();

    const ranks = [
      { id: 'GENIN', title: 'Genin', lore: 'Adaptación inicial al combate.', color: '#cd7f32', slotCost: 1, bonus: { icon: '🛡️', text: '+5% DEF', stat: 'def', mult: 1.05 } },
      { id: 'CHUNIN', title: 'Chūnin', lore: 'Refinamiento de técnica base.', color: '#8fbc8f', slotCost: 3, bonus: { icon: '⚔️', text: '+5% ATK', stat: 'atk', mult: 1.05 } },
      { id: 'JONIN', title: 'Jōnin', lore: 'Tu cuerpo soporta carga superior.', color: '#c0c0c0', slotCost: 6, bonus: { icon: '❤️', text: '+10% HP', stat: 'hp', mult: 1.1 } },
      { id: 'ANBU', title: 'ANBU', lore: 'Precisión y potencia avanzadas.', color: '#e5e4e2', slotCost: 10, bonus: { icon: '⚡', text: '+10% SPD', stat: 'spd', mult: 1.1 } },
      { id: 'KAGE', title: 'Kage', lore: 'Control total en zona de guerra.', color: '#ffd700', slotCost: 15, bonus: { icon: '🌀', text: '+12% CHAK', stat: 'chak', mult: 1.12 } }
    ];

    const nodeDefs = [
      { uiKey: 'atk', stat: 'ATK', icon: '⚔️', inc: 5, label: 'ATK' },
      { uiKey: 'def', stat: 'DEF', icon: '🛡️', inc: 5, label: 'DEF' },
      { uiKey: 'hp', stat: 'HP', icon: '❤️', inc: 50, label: 'HP' },
      { uiKey: 'spd', stat: 'VEL', icon: '⚡', inc: 1, label: 'SPD' },
      { uiKey: 'chak', stat: 'MP', icon: '🌀', inc: 20, label: 'CHAK' }
    ];

    const state = {
      rankIndex: 0,
      viewingRank: 0,
      unlockedByRank: [0, 0, 0, 0, 0],
      ascended: [false, false, false, false, false]
    };

    const root = document.createElement('section');
    root.className = 'arbol-root';
    root.innerHTML = `
      <div class="arbol-top">
        <div class="arbol-timeline" data-ui="timeline"></div>
        <div class="arbol-points" data-ui="points">🌀 0</div>
      </div>
      <div class="arbol-main">
        <aside class="arbol-stats" data-ui="stats"></aside>
        <div class="arbol-constellation">
          <div class="arbol-silhouette"></div>
          <div class="arbol-grid" data-ui="grid"></div>
        </div>
        <aside class="arbol-bonus">
          <div class="arbol-bonus-card" data-ui="bonusCard"></div>
        </aside>
      </div>
      <div class="arbol-progress-wrap">
        <div class="arbol-progress" data-ui="progress"></div>
        <div class="arbol-lore" data-ui="lore"></div>
      </div>
      <div class="arbol-overlay" data-ui="overlay"><div>RANGO COMPLETADO</div><small>Ascendiendo...</small></div>
    `;

    container.replaceChildren(root);

    const ui = {
      timeline: root.querySelector('[data-ui="timeline"]'),
      points: root.querySelector('[data-ui="points"]'),
      stats: root.querySelector('[data-ui="stats"]'),
      grid: root.querySelector('[data-ui="grid"]'),
      progress: root.querySelector('[data-ui="progress"]'),
      lore: root.querySelector('[data-ui="lore"]'),
      bonusCard: root.querySelector('[data-ui="bonusCard"]'),
      overlay: root.querySelector('[data-ui="overlay"]')
    };

    function syncExternalStats() {
      const stats = typeof getStats === 'function' ? getStats() : null;
      if (!stats) return;
      if (!manager?.setState) return;
      manager.setState({
        hp: Math.max(1, Math.round(Number(stats.HP || 0))),
        atk: Math.max(1, Math.round(Number(stats.ATK || 0))),
        def: Math.max(1, Math.round(Number(stats.DEF || 0)))
      });
    }

    function readDisplayedStats() {
      const stats = typeof getStats === 'function' ? getStats() : {};
      return {
        atk: Math.round(Number(stats.ATK || 0)),
        def: Math.round(Number(stats.DEF || 0)),
        hp: Math.round(Number(stats.HP || 0)),
        spd: Number(stats.VEL || 0),
        chak: Math.round(Number(stats.MP || 0))
      };
    }

    function getCurrentPoints() {
      if (typeof getSkillPoints !== 'function') return 0;
      return Math.max(0, Math.floor(Number(getSkillPoints()) || 0));
    }

    function renderTimeline() {
      ui.timeline.innerHTML = '';
      ranks.forEach((rank, idx) => {
        const btn = document.createElement('button');
        btn.className = 'arbol-rank-btn';
        btn.type = 'button';
        if (idx < state.rankIndex || state.ascended[idx]) {
          btn.classList.add('done');
          btn.textContent = `✓ ${rank.id}`;
        } else {
          btn.textContent = rank.id;
        }
        if (idx === state.viewingRank) btn.classList.add('current');
        if (idx > state.rankIndex) btn.textContent += ' 🔒';
        btn.addEventListener('click', () => {
          state.viewingRank = idx;
          renderAll();
        });
        ui.timeline.appendChild(btn);
      });
    }

    function renderStats() {
      ui.stats.innerHTML = '';
      const displayStats = readDisplayedStats();
      Object.entries(displayStats).forEach(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'arbol-stat-row';
        row.innerHTML = `<span>${key.toUpperCase()}</span><span class="arbol-stat-value" data-stat="${key}">${value}</span>`;
        ui.stats.appendChild(row);
      });
    }

    function flashStat(key) {
      const el = ui.stats.querySelector(`[data-stat="${key}"]`);
      if (!el) return;
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    }

    function renderNodes() {
      ui.grid.innerHTML = '';
      const activeRank = state.rankIndex;
      const viewing = state.viewingRank;
      const unlocked = state.unlockedByRank[viewing];
      const canInteract = viewing === activeRank;

      nodeDefs.forEach((node, idx) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'arbol-node';
        item.innerHTML = `<span>${node.icon}</span>`;

        if (idx < unlocked) {
          item.classList.add('active');
        } else if (idx === unlocked && canInteract) {
          item.classList.add('available');
          item.addEventListener('click', () => purchaseNode(idx));
        } else {
          item.classList.add('locked');
        }

        const displayStats = readDisplayedStats();
        const cur = displayStats[node.uiKey];
        const next = cur + node.inc;
        const tip = document.createElement('span');
        tip.className = 'arbol-tooltip';
        tip.textContent = `${node.label}: +${node.inc} (${cur} → ${next}) · Costo ${ranks[viewing].slotCost}`;
        item.appendChild(tip);
        ui.grid.appendChild(item);
      });
    }

    function renderProgress() {
      ui.progress.innerHTML = '';
      const rank = ranks[state.viewingRank];
      const done = state.unlockedByRank[state.viewingRank];
      for (let i = 0; i < 5; i += 1) {
        const seg = document.createElement('span');
        if (i < done) seg.classList.add('fill');
        seg.style.backgroundColor = i < done ? rank.color : '';
        ui.progress.appendChild(seg);
      }
      ui.lore.textContent = `${rank.id} (${rank.title}): ${rank.lore}`;
    }

    function renderBonus() {
      const rank = ranks[state.viewingRank];
      const isCurrent = state.viewingRank === state.rankIndex;
      const done = state.unlockedByRank[state.viewingRank] >= 5;
      const canClaim = isCurrent && done;
      ui.bonusCard.className = `arbol-bonus-card${canClaim ? ' ready' : ''}`;
      ui.bonusCard.innerHTML = `
        <div style="font-size:24px">${canClaim ? rank.bonus.icon : '🔒'}</div>
        <div style="font-weight:700;margin-top:6px;">${canClaim ? rank.bonus.text : 'BONO BLOQUEADO'}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">${canClaim ? 'Click para reclamar y avanzar.' : `Completa ${5 - state.unlockedByRank[state.viewingRank]} nodos.`}</div>
      `;
      ui.bonusCard.onclick = canClaim ? claimBonus : null;
    }

    function purchaseNode(index) {
      const rank = state.rankIndex;
      const cost = ranks[rank].slotCost;
      const currentPoints = getCurrentPoints();
      if (currentPoints < cost) {
        window.alert('Puntos insuficientes.');
        return;
      }
      if (index !== state.unlockedByRank[rank]) return;
      if (typeof spendSkillPoints === 'function' && !spendSkillPoints(cost)) {
        window.alert('Puntos insuficientes.');
        return;
      }

      state.unlockedByRank[rank] += 1;
      const def = nodeDefs[index];
      if (typeof onAllocateStat === 'function') {
        onAllocateStat({ stat: def.stat, amount: def.inc, source: 'node' });
      }
      syncExternalStats();
      renderStats();
      flashStat(def.uiKey);
      renderAll();
      ui.points.textContent = `🌀 ${Math.max(0, currentPoints - cost)}`;
    }

    function claimBonus() {
      const rank = ranks[state.rankIndex];
      const { stat, mult } = rank.bonus;
      const statMap = { atk: 'ATK', def: 'DEF', hp: 'HP', spd: 'VEL', chak: 'MP' };
      const liveStats = readDisplayedStats();
      const currentValue = Number(liveStats[stat] || 0);
      const increase = Math.max(1, Math.round(currentValue * (mult - 1)));
      if (typeof onAllocateStat === 'function') {
        onAllocateStat({ stat: statMap[stat], amount: increase, source: 'bonus' });
      }
      syncExternalStats();
      renderStats();
      flashStat(stat);
      state.ascended[state.rankIndex] = true;
      ui.overlay.classList.add('show');
      window.setTimeout(() => {
        ui.overlay.classList.remove('show');
        if (state.rankIndex < ranks.length - 1) {
          state.rankIndex += 1;
          state.viewingRank = state.rankIndex;
        }
        renderAll();
      }, 1200);
    }

    function renderAll() {
      renderTimeline();
      renderNodes();
      renderProgress();
      renderBonus();
      ui.points.textContent = `🌀 ${getCurrentPoints()}`;
      root.style.setProperty('--bronze', ranks[state.viewingRank].color);
    }

    renderStats();
    renderAll();

    return {
      destroy() {
        root.remove();
      }
    };
  };
})();
