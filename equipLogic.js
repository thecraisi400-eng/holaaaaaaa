(() => {
  const { EQUIPMENT_DATA, SLOT_ORDER, BASE_STATS, STAT_META } = window.equipData;
  const levels = { cabeza: 1, pecho: 1, manos: 1, piernas: 1, pies: 1, accesorio: 1 };

  function getUpgradeCost(equipKey, currentLevel) {
    const ranges = EQUIPMENT_DATA[equipKey].ranges;
    const maxLv = ranges[ranges.length - 1].to;
    if (currentLevel >= maxLv) return null;

    for (let i = 0; i < ranges.length; i += 1) {
      const r = ranges[i];
      if (currentLevel >= r.from && currentLevel < r.to) {
        const prevMax = i === 0 ? 0 : ranges[i - 1].maxCost;
        const n = r.to - r.from;
        const pos = currentLevel - r.from + 1;
        return Math.round(prevMax + ((r.maxCost - prevMax) * pos) / n);
      }
    }
    return null;
  }

  function rankClass(level) {
    if (level >= 60) return 'rank-red';
    if (level >= 45) return 'rank-yellow';
    if (level >= 30) return 'rank-purple';
    if (level >= 15) return 'rank-blue';
    if (level >= 6) return 'rank-green';
    return 'rank-gray';
  }

  function rankName(level) {
    if (level >= 60) return { label: 'LEGENDARIO', bg: '#7f1d1d', color: '#f87171' };
    if (level >= 45) return { label: 'ÉPICO', bg: '#713f12', color: '#fbbf24' };
    if (level >= 30) return { label: 'RARO', bg: '#3b0764', color: '#c084fc' };
    if (level >= 15) return { label: 'AVANZADO', bg: '#1e3a8a', color: '#60a5fa' };
    if (level >= 6) return { label: 'MEJORADO', bg: '#14532d', color: '#4ade80' };
    return { label: 'BÁSICO', bg: '#1f2937', color: '#9ca3af' };
  }

  function computeStats() {
    const stats = { ...BASE_STATS };
    for (const key of SLOT_ORDER) {
      const gains = levels[key] - 1;
      if (gains <= 0) continue;
      for (const [stat, amount] of Object.entries(EQUIPMENT_DATA[key].stats)) {
        stats[stat] = (stats[stat] || 0) + (amount * gains);
      }
    }
    return stats;
  }

  function fmtNum(n) { return n.toLocaleString('es-ES'); }

  function fmtStat(meta, val) {
    if (meta.pct) return `${val.toFixed(2)}%`;
    if (meta.dec) return val.toFixed(meta.dec);
    return Number.isInteger(val) ? val : Number.parseFloat(val.toFixed(1));
  }

  function fmtGain(key, amount) {
    const pctKeys = ['CTR', 'EVA', 'RES', 'REGEN', 'CDMG'];
    if (pctKeys.includes(key)) return `+${amount.toFixed(2)}%`;
    if (key === 'ASPD') return `+${amount.toFixed(2)}`;
    return `+${amount}`;
  }

  window.equipLogic = {
    EQUIPMENT_DATA,
    SLOT_ORDER,
    STAT_META,
    levels,
    computeStats,
    fmtGain,
    fmtNum,
    fmtStat,
    getUpgradeCost,
    rankClass,
    rankName,
  };
})();
