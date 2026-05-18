export function calcStats(level) {
  const lvl = level;
  return {
    xpReq: Math.round(67.5 * Math.pow(lvl, 2)),
    hp: 100 + (15 * (lvl - 1)),
    mp: 50 + (12 * (lvl - 1)),
    atk: 15 + (8 * (lvl - 1)),
    agi: 12 + (3 * (lvl - 1)),
    int: 10 + (10 * (lvl - 1)),
    luk: 5 + (0.5 * (lvl - 1)),
    def: 10 + (5 * (lvl - 1)),
    res: (6 + (0.12 * (lvl - 1))).toFixed(2),
    cri: (5 + (0.25 * (lvl - 1))).toFixed(2),
    cdmg: (150 + (2 * (lvl - 1))).toFixed(0),
  };
}
