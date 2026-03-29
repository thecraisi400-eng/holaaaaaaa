(() => {
  function createRanksEngine(data) {
    const { RANKS } = data;
    const state = {
      pts: 50,
      curRank: 0,
      viewRank: 0,
      nodes: RANKS.map(() => [false, false, false, false, false]),
      done: [false, false, false, false, false],
      stats: { hp: 500, atk: 120, def: 80, spd: 95, crit: 15, chk: 200, pwr: 310 }
    };

    function buyNode(idx) {
      const rank = RANKS[state.curRank];
      const node = rank.nodes[idx];
      if (state.nodes[state.curRank][idx]) return { ok: false, code: 'already' };
      if (state.pts < node.cost) return { ok: false, code: 'insufficient' };

      state.pts -= node.cost;
      state.nodes[state.curRank][idx] = true;
      state.stats[node.key] += node.gain;

      const allDone = state.nodes[state.curRank].every(Boolean);
      const rankCompletedNow = allDone && !state.done[state.curRank];
      if (rankCompletedNow) state.done[state.curRank] = true;

      return {
        ok: true,
        node,
        rankCompletedNow,
        rankIndex: state.curRank
      };
    }

    function addPoints() {
      const earned = Math.floor(Math.random() * 18) + 8;
      state.pts += earned;
      return earned;
    }

    function setViewRank(rankIndex) {
      state.viewRank = rankIndex;
    }

    function advanceRankAfterAscension() {
      if (state.curRank < RANKS.length - 1) {
        state.curRank += 1;
        state.viewRank = state.curRank;
      }
    }

    return {
      state,
      buyNode,
      addPoints,
      setViewRank,
      advanceRankAfterAscension
    };
  }

  window.createRanksEngine = createRanksEngine;
})();
