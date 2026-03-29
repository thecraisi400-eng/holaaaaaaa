(() => {
  function createRanksGame(data) {
    const { RANKS } = data;
    const G = {
      pts: 50,
      curRank: 0,
      viewRank: 0,
      nodes: RANKS.map(() => [false, false, false, false, false]),
      done: [false, false, false, false, false],
      stats: { hp: 500, atk: 120, def: 80, spd: 95, crit: 15, chk: 200, pwr: 310 }
    };

    const handlers = {
      onStatus: () => {},
      onPointsFlash: () => {},
      onStatBoost: () => {},
      onAscension: () => {},
      onRender: () => {}
    };

    function setHandlers(nextHandlers = {}) {
      Object.assign(handlers, nextHandlers);
    }

    function buyNode(idx) {
      const R = RANKS[G.curRank];
      const node = R.nodes[idx];
      if (G.nodes[G.curRank][idx]) return;
      if (G.pts < node.cost) {
        handlers.onStatus('❌ PC Insuficientes');
        return;
      }

      G.pts -= node.cost;
      G.nodes[G.curRank][idx] = true;
      G.stats[node.key] += node.gain;

      handlers.onPointsFlash();
      handlers.onStatBoost(node.key);
      handlers.onStatus(`✓ ${node.stat} +${node.gain} desbloqueado`);

      const allDone = G.nodes[G.curRank].every(Boolean);
      if (allDone && !G.done[G.curRank]) {
        G.done[G.curRank] = true;
        handlers.onRender();
        handlers.onAscension();
      } else {
        handlers.onRender();
      }
    }

    function addPoints() {
      const earned = Math.floor(Math.random() * 18) + 8;
      G.pts += earned;
      handlers.onPointsFlash();
      handlers.onStatus(`+${earned} PC ganados en batalla`);
      handlers.onRender();
    }

    function viewRank(ri) {
      G.viewRank = ri;
      handlers.onRender();
    }

    function completeAscensionStep() {
      if (G.curRank < 4) {
        G.curRank += 1;
        G.viewRank = G.curRank;
      }
      handlers.onRender();
    }

    return {
      state: G,
      setHandlers,
      buyNode,
      addPoints,
      viewRank,
      completeAscensionStep
    };
  }

  window.createRanksGame = createRanksGame;
})();
