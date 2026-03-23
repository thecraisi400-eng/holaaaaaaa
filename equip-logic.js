(() => {
  const { baseStats, equipment, slotOrder, statMeta, defaultLevels } = window.equipData;

  function ensureEquipmentState(state) {
    if (!state.equipmentLevels) {
      state.equipmentLevels = { ...defaultLevels };
    }
    return state.equipmentLevels;
  }

  function getUpgradeCost(equipKey, currentLevel) {
    const ranges = equipment[equipKey].ranges;
    const maxLevel = ranges[ranges.length - 1].to;
    if (currentLevel >= maxLevel) return null;

    for (let index = 0; index < ranges.length; index += 1) {
      const range = ranges[index];
      if (currentLevel >= range.from && currentLevel < range.to) {
        const previousMax = index === 0 ? 0 : ranges[index - 1].maxCost;
        const totalUpgrades = range.to - range.from;
        const position = currentLevel - range.from + 1;
        return Math.round(previousMax + ((range.maxCost - previousMax) * position / totalUpgrades));
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

  function formatStat(meta, value) {
    if (meta.pct) return `${value.toFixed(2)}%`;
    if (meta.dec) return value.toFixed(meta.dec);
    return Number.isInteger(value) ? value : parseFloat(value.toFixed(1));
  }

  function formatGain(statKey, amount) {
    const percentKeys = ['CTR', 'EVA', 'RES', 'REGEN', 'CDMG'];
    if (percentKeys.includes(statKey)) return `+${amount.toFixed(2)}%`;
    if (statKey === 'ASPD') return `+${amount.toFixed(2)}`;
    return `+${amount}`;
  }

  function formatNumber(value) {
    return value.toLocaleString('es-ES');
  }

  function computeStats(levels) {
    const stats = { ...baseStats };

    slotOrder.forEach((key) => {
      const level = levels[key];
      const gains = level - 1;
      if (gains <= 0) return;

      Object.entries(equipment[key].stats).forEach(([statKey, amount]) => {
        stats[statKey] = (stats[statKey] || 0) + (amount * gains);
      });
    });

    return stats;
  }

  function upgrade(state, equipKey) {
    const levels = ensureEquipmentState(state);
    const level = levels[equipKey];
    const cost = getUpgradeCost(equipKey, level);

    if (cost === null || state.gold < cost) {
      return { ok: false, cost };
    }

    state.gold -= cost;
    levels[equipKey] += 1;

    return {
      ok: true,
      cost,
      newLevel: levels[equipKey],
      stats: computeStats(levels),
    };
  }

  function getSummaryStats(levels, state) {
    const stats = computeStats(levels);
    return {
      atk: Math.round(state.atk + (stats.ATK - baseStats.ATK)),
      def: Math.round(state.def + (stats.DEF - baseStats.DEF)),
    };
  }

  window.equipLogic = {
    computeStats,
    ensureEquipmentState,
    equipment,
    formatGain,
    formatNumber,
    formatStat,
    getSummaryStats,
    getUpgradeCost,
    rankClass,
    rankName,
    slotOrder,
    statMeta,
    upgrade,
  };
})();
