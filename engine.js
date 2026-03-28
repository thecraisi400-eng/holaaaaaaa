'use strict';

function getUpgradeCost(equipKey, currentLevel) {
  const ranges = window.EQUIPMENT_DATA[equipKey].ranges;
  const maxLv = ranges[ranges.length - 1].to;
  if (currentLevel >= maxLv) return null;

  for (let i = 0; i < ranges.length; i += 1) {
    const r = ranges[i];
    if (currentLevel >= r.from && currentLevel < r.to) {
      const prevMax = i === 0 ? 0 : ranges[i - 1].maxCost;
      const n = r.to - r.from;
      const pos = currentLevel - r.from + 1;
      return Math.round(prevMax + (r.maxCost - prevMax) * pos / n);
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
  if (level >= 60) return { label:'LEGENDARIO', bg:'#7f1d1d', color:'#f87171' };
  if (level >= 45) return { label:'ÉPICO', bg:'#713f12', color:'#fbbf24' };
  if (level >= 30) return { label:'RARO', bg:'#3b0764', color:'#c084fc' };
  if (level >= 15) return { label:'AVANZADO', bg:'#1e3a8a', color:'#60a5fa' };
  if (level >= 6) return { label:'MEJORADO', bg:'#14532d', color:'#4ade80' };
  return { label:'BÁSICO', bg:'#1f2937', color:'#9ca3af' };
}

function fmtStat(meta, val) {
  if (meta.pct) return val.toFixed(2) + '%';
  if (meta.dec) return val.toFixed(meta.dec);
  return Number.isInteger(val) ? val : parseFloat(val.toFixed(1));
}

function fmtGain(key, amount) {
  const pctKeys = ['CTR', 'EVA', 'RES', 'REGEN', 'CDMG'];
  if (pctKeys.includes(key)) return `+${amount.toFixed(2)}%`;
  if (key === 'ASPD') return `+${amount.toFixed(2)}`;
  return `+${amount}`;
}

function fmtNum(n) {
  return n.toLocaleString('es-ES');
}

function computeStats(player) {
  const stats = { ...(player.baseStats || window.BASE_STATS) };
  for (const key of window.SLOT_ORDER) {
    const lvl = player.levels[key];
    const gains = lvl - 1;
    if (gains <= 0) continue;
    for (const [stat, amount] of Object.entries(window.EQUIPMENT_DATA[key].stats)) {
      stats[stat] = (stats[stat] || 0) + amount * gains;
    }
  }
  return stats;
}



function createCharacterState(characterId, level = 1, existing = null) {
  const getChar = window.getNinjaCharacterById || ((id) => (window.NINJA_CHARACTERS || []).find((char) => char.id === id));
  const char = getChar(characterId);
  if (!char) return null;

  const baseStats = char.formula(level);
  return {
    characterId: char.id,
    level,
    exp: existing?.exp || 0,
    expMax: baseStats.XP,
    hp: existing?.hp ?? baseStats.HP,
    hpMax: baseStats.HP,
    mp: existing?.mp ?? baseStats.MP,
    mpMax: baseStats.MP,
    atk: baseStats.ATK,
    def: baseStats.DEF,
    baseStats
  };
}

function computeCurrentRank(level) {
  if (level >= 50) return 'KAGE';
  if (level >= 35) return 'JONIN';
  if (level >= 20) return 'CHUNIN';
  return 'GENIN';
}

window.heroEngine = {
  getUpgradeCost,
  rankClass,
  rankName,
  fmtStat,
  fmtGain,
  fmtNum,
  computeStats,
  createCharacterState,
  computeCurrentRank
};
