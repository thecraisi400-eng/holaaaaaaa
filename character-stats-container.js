(function () {
  const DEFAULT_RANK = 'GENIN';

  const STAT_META = [
    { key: 'HP', label: 'HP', suffix: '' },
    { key: 'MP', label: 'MP', suffix: '' },
    { key: 'ATK', label: 'ATK', suffix: '' },
    { key: 'DEF', label: 'DEF', suffix: '' },
    { key: 'AGI', label: 'AGI', suffix: '' },
    { key: 'INT', label: 'INT', suffix: '' },
    { key: 'CRT', label: 'CRT', suffix: '%' },
    { key: 'CDMG', label: 'CDMG', suffix: '%' },
    { key: 'EVA', label: 'EVA', suffix: '%' },
    { key: 'REGEN', label: 'REGEN', suffix: '%' },
    { key: 'RES', label: 'RES', suffix: '%' },
    { key: 'LCK', label: 'LCK', suffix: '' }
  ];

  const XP_CHECKPOINTS = {
    madara: { 1: 0, 10: 7200, 20: 28500, 30: 64000, 40: 114500, 50: 180000, 60: 262000, 70: 358500, 80: 471000, 90: 598500, 100: 742000 },
    itachi: { 1: 50, 10: 5800, 20: 24000, 30: 58000, 40: 105000, 50: 165000, 60: 240000, 70: 328000, 80: 425000, 90: 540000, 100: 680000 },
    sasuke: { 1: 65, 10: 6500, 20: 26500, 30: 60000, 40: 107000, 50: 167500, 60: 241500, 70: 329000, 80: 430000, 90: 544500, 100: 672500 },
    obito: { 1: 75, 10: 7100, 20: 28000, 30: 62500, 40: 110000, 50: 172000, 60: 248000, 70: 338500, 80: 442000, 90: 558000, 100: 688000 },
    naruto: { 1: 80, 10: 7500, 20: 29000, 30: 63000, 40: 110500, 50: 171000, 60: 245000, 70: 332500, 80: 433500, 90: 548000, 100: 676000 },
    nagato: { 1: 90, 10: 8500, 20: 32000, 30: 68000, 40: 115000, 50: 175000, 60: 252000, 70: 345000, 80: 455000, 90: 582000, 100: 715000 },
    kushina: { 1: 70, 10: 7000, 20: 27500, 30: 61500, 40: 109000, 50: 169500, 60: 243500, 70: 331000, 80: 432000, 90: 546500, 100: 674000 },
    karin: { 1: 55, 10: 6200, 20: 25500, 30: 59500, 40: 106000, 50: 166500, 60: 240000, 70: 327000, 80: 425000, 90: 540500, 100: 670000 },
    hashirama: { 1: 95, 10: 8800, 20: 33500, 30: 71000, 40: 120000, 50: 182500, 60: 258000, 70: 348500, 80: 454000, 90: 576000, 100: 712500 },
    tobirama: { 1: 72, 10: 6950, 20: 27200, 30: 61000, 40: 108500, 50: 169000, 60: 243500, 70: 331250, 80: 432500, 90: 547000, 100: 675500 },
    tsunade: { 1: 78, 10: 7200, 20: 28500, 30: 64000, 40: 112000, 50: 173500, 60: 248000, 70: 336500, 80: 438000, 90: 552500, 100: 680000 },
    itama: { 1: 60, 10: 6000, 20: 25000, 30: 58000, 40: 105000, 50: 165000, 60: 240000, 70: 328000, 80: 428000, 90: 542000, 100: 670000 },
    kaguya: { 1: 98, 10: 8900, 20: 35000, 30: 72500, 40: 125000, 50: 190000, 60: 265000, 70: 355000, 80: 460000, 90: 580000, 100: 720000 },
    hagoromo: { 1: 105, 10: 9000, 20: 36000, 30: 73500, 40: 126500, 50: 192000, 60: 267500, 70: 358000, 80: 463500, 90: 584000, 100: 725000 },
    indra: { 1: 75, 10: 7100, 20: 27500, 30: 61500, 40: 109000, 50: 170000, 60: 244500, 70: 332000, 80: 433500, 90: 548500, 100: 678000 },
    asura: { 1: 85, 10: 7500, 20: 29000, 30: 63000, 40: 110500, 50: 171500, 60: 246000, 70: 334000, 80: 435500, 90: 550500, 100: 680000 }
  };

  const CHARACTER_PROFILES = {
    madara: { name: 'Madara Uchiha', clanName: 'CLAN UCHIHA', formulas: { CDMG: ['percent', 50, 1.5], MP: ['flat', 120, 12], INT: ['flat', 18, 1.2], ATK: ['flat', 20, 9], HP: ['flat', 150, 15], DEF: ['flat', 12, 5], AGI: ['flat', 10, 2.5], RES: ['percent', 8, 0.15], CRT: ['percent', 4, 0.1], EVA: ['percent', 1, 0.1], REGEN: ['percent', 1, 0.02], LCK: ['flat', 1, 0.05] } },
    itachi: { name: 'Itachi Uchiha', clanName: 'CLAN UCHIHA', formulas: { INT: ['flat', 25, 1.5], CRT: ['percent', 8, 0.3], EVA: ['percent', 5, 0.25], AGI: ['flat', 15, 2.5], MP: ['flat', 80, 9], ATK: ['flat', 12, 7], CDMG: ['percent', 20, 1.15], RES: ['percent', 5, 0.13], DEF: ['flat', 8, 4], LCK: ['flat', 2, 0.08], REGEN: ['percent', 1.5, 0.04], HP: ['flat', 100, 10] } },
    sasuke: { name: 'Sasuke Uchiha', clanName: 'CLAN UCHIHA', formulas: { AGI: ['flat', 20, 3], ATK: ['flat', 18, 8.5], CRT: ['percent', 6, 0.28], EVA: ['percent', 4, 0.22], HP: ['flat', 130, 14], MP: ['flat', 100, 8.5], INT: ['flat', 15, 1], CDMG: ['percent', 25, 1.2], DEF: ['flat', 10, 4.5], REGEN: ['percent', 2.5, 0.02], LCK: ['flat', 3, 0.06], RES: ['percent', 2, 0.08] } },
    obito: { name: 'Obito Uchiha', clanName: 'CLAN UCHIHA', formulas: { EVA: ['percent', 10, 0.35], REGEN: ['percent', 5, 0.05], HP: ['flat', 160, 16], RES: ['percent', 10, 0.15], MP: ['flat', 90, 8.5], DEF: ['flat', 12, 5.5], ATK: ['flat', 14, 7.5], AGI: ['flat', 12, 2], CDMG: ['percent', 15, 0.8], CRT: ['percent', 3, 0.15], LCK: ['flat', 2, 0.05], INT: ['flat', 5, 0.6] } },
    naruto: { name: 'Naruto Uzumaki', clanName: 'CLAN UZUMAKI', formulas: { MP: ['flat', 200, 25], HP: ['flat', 180, 20], REGEN: ['percent', 6, 0.06], LCK: ['flat', 10, 1.2], ATK: ['flat', 12, 8], DEF: ['flat', 10, 5], RES: ['percent', 8, 0.12], CDMG: ['percent', 15, 1.3], AGI: ['flat', 8, 1.5], INT: ['flat', 6, 0.8], CRT: ['percent', 2, 0.1], EVA: ['percent', 0.5, 0.05] } },
    nagato: { name: 'Nagato (Pain)', clanName: 'CLAN UZUMAKI', formulas: { RES: ['percent', 15, 0.35], INT: ['flat', 20, 1.4], MP: ['flat', 150, 15], DEF: ['flat', 15, 7], HP: ['flat', 140, 15], REGEN: ['percent', 3, 0.05], ATK: ['flat', 10, 8], CDMG: ['percent', 15, 1.2], LCK: ['flat', 2, 0.06], EVA: ['percent', 1, 0.08], CRT: ['percent', 2, 0.12], AGI: ['flat', 5, 0.8] } },
    kushina: { name: 'Kushina Uzumaki', clanName: 'CLAN UZUMAKI', formulas: { REGEN: ['percent', 8, 0.1], HP: ['flat', 190, 18], MP: ['flat', 140, 14], ATK: ['flat', 15, 8.5], RES: ['percent', 10, 0.15], DEF: ['flat', 12, 5.5], LCK: ['flat', 5, 0.1], AGI: ['flat', 10, 2], CRT: ['percent', 3, 0.12], CDMG: ['percent', 10, 0.9], EVA: ['percent', 1, 0.1], INT: ['flat', 4, 0.5] } },
    karin: { name: 'Karin Uzumaki', clanName: 'CLAN UZUMAKI', formulas: { INT: ['flat', 22, 1.6], REGEN: ['percent', 7, 0.08], MP: ['flat', 160, 12], EVA: ['percent', 6, 0.24], HP: ['flat', 140, 15], RES: ['percent', 9, 0.14], AGI: ['flat', 12, 2.2], LCK: ['flat', 8, 0.12], DEF: ['flat', 8, 4], CRT: ['percent', 2, 0.08], CDMG: ['percent', 12, 0.75], ATK: ['flat', 5, 6] } },
    hashirama: { name: 'Hashirama Senju', clanName: 'CLAN SENJU', formulas: { HP: ['flat', 220, 22], REGEN: ['percent', 7, 0.07], MP: ['flat', 150, 13], DEF: ['flat', 15, 6.5], RES: ['percent', 9, 0.13], ATK: ['flat', 14, 7.8], INT: ['flat', 12, 1.2], LCK: ['flat', 6, 0.1], AGI: ['flat', 8, 1.6], EVA: ['percent', 1.5, 0.11], CDMG: ['percent', 12, 0.85], CRT: ['percent', 1, 0.05] } },
    tobirama: { name: 'Tobirama Senju', clanName: 'CLAN SENJU', formulas: { INT: ['flat', 24, 1.6], AGI: ['flat', 18, 2.8], EVA: ['percent', 6, 0.26], MP: ['flat', 130, 11], RES: ['percent', 8, 0.14], CRT: ['percent', 4, 0.24], ATK: ['flat', 14, 7.8], DEF: ['flat', 11, 5.2], HP: ['flat', 120, 13], CDMG: ['percent', 15, 0.95], REGEN: ['percent', 2, 0.04], LCK: ['flat', 1, 0.04] } },
    tsunade: { name: 'Tsunade Senju', clanName: 'CLAN SENJU', formulas: { ATK: ['flat', 25, 10.5], HP: ['flat', 180, 19], REGEN: ['percent', 6, 0.08], RES: ['percent', 10, 0.18], MP: ['flat', 100, 9], DEF: ['flat', 15, 6], INT: ['flat', 18, 1.3], CDMG: ['percent', 20, 1.2], LCK: ['flat', 1, 0.05], AGI: ['flat', 8, 1.5], CRT: ['percent', 2, 0.1], EVA: ['percent', 0.5, 0.03] } },
    itama: { name: 'Itama Senju', clanName: 'CLAN SENJU', formulas: { LCK: ['flat', 15, 1.5], EVA: ['percent', 5, 0.25], AGI: ['flat', 15, 2.5], REGEN: ['percent', 5, 0.06], HP: ['flat', 130, 15], MP: ['flat', 110, 9], INT: ['flat', 10, 1.2], CRT: ['percent', 4, 0.2], ATK: ['flat', 10, 7], RES: ['percent', 5, 0.1], CDMG: ['percent', 10, 0.9], DEF: ['flat', 5, 4] } },
    kaguya: { name: 'Kaguya Ōtsutsuki', clanName: 'CLAN ŌTSUTSUKI', formulas: { MP: ['flat', 250, 25], INT: ['flat', 20, 1.5], RES: ['percent', 12, 0.35], REGEN: ['percent', 6, 0.08], HP: ['flat', 150, 15], ATK: ['flat', 15, 8.2], DEF: ['flat', 12, 5.5], CDMG: ['percent', 15, 1.25], CRT: ['percent', 2, 0.12], EVA: ['percent', 1, 0.09], LCK: ['flat', 2, 0.06], AGI: ['flat', 4, 0.6] } },
    hagoromo: { name: 'Hagoromo Ōtsutsuki', clanName: 'CLAN ŌTSUTSUKI', formulas: { RES: ['percent', 18, 0.35], INT: ['flat', 22, 1.5], MP: ['flat', 180, 18], DEF: ['flat', 15, 6.5], HP: ['flat', 160, 14], REGEN: ['percent', 4, 0.05], LCK: ['flat', 8, 0.12], AGI: ['flat', 10, 2], CRT: ['percent', 2, 0.1], CDMG: ['percent', 10, 0.8], EVA: ['percent', 1, 0.1], ATK: ['flat', 6, 6.2] } },
    indra: { name: 'Indra Ōtsutsuki', clanName: 'CLAN ŌTSUTSUKI', formulas: { CDMG: ['percent', 30, 2], INT: ['flat', 20, 1.5], CRT: ['percent', 8, 0.32], AGI: ['flat', 14, 2.6], MP: ['flat', 130, 10], ATK: ['flat', 12, 8], EVA: ['percent', 3, 0.18], DEF: ['flat', 10, 5], HP: ['flat', 125, 13], RES: ['percent', 5, 0.11], REGEN: ['percent', 2, 0.04], LCK: ['flat', 1, 0.02] } },
    asura: { name: 'Asura Ōtsutsuki', clanName: 'CLAN ŌTSUTSUKI', formulas: { REGEN: ['percent', 8, 0.12], HP: ['flat', 200, 18], DEF: ['flat', 15, 6.5], RES: ['percent', 10, 0.25], MP: ['flat', 140, 10], ATK: ['flat', 14, 7.8], LCK: ['flat', 10, 0.15], AGI: ['flat', 12, 2], EVA: ['percent', 2, 0.12], CRT: ['percent', 3, 0.1], CDMG: ['percent', 10, 0.85], INT: ['flat', 6, 0.8] } }
  };

  let activeHero = null;

  function clampLevel(level) {
    const parsed = Number(level);
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(100, Math.max(1, Math.floor(parsed)));
  }

  function calcStat(formula, level) {
    const [kind, base, perLevel] = formula;
    const value = base + perLevel * (level - 1);
    return kind === 'percent' ? Number(value.toFixed(2)) : Math.round(value);
  }

  function getXpAtLevel(characterId, level) {
    const table = XP_CHECKPOINTS[characterId];
    if (!table) return Math.max(0, (level - 1) * 1000);
    if (table[level] !== undefined) return table[level];

    const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
    const lower = keys.filter((k) => k < level).pop() || 1;
    const upper = keys.find((k) => k > level) || 100;
    const lowerXp = table[lower];
    const upperXp = table[upper];
    const ratio = (level - lower) / (upper - lower);
    return Math.round(lowerXp + (upperXp - lowerXp) * ratio);
  }

  function buildHeroSnapshot(characterId, level = 1, exp = null, rank = DEFAULT_RANK) {
    const profile = CHARACTER_PROFILES[characterId];
    if (!profile) return null;

    const clampedLevel = clampLevel(level);
    const stats = {};
    STAT_META.forEach((meta) => {
      const formula = profile.formulas[meta.key] || ['flat', 0, 0];
      stats[meta.key] = calcStat(formula, clampedLevel);
    });

    const currentLevelXpStart = getXpAtLevel(characterId, clampedLevel);
    const nextLevelXp = getXpAtLevel(characterId, Math.min(100, clampedLevel + 1));
    const totalExp = exp == null ? currentLevelXpStart : Math.max(0, Number(exp) || currentLevelXpStart);

    return {
      characterId,
      name: profile.name,
      clanName: profile.clanName,
      level: clampedLevel,
      rank: rank || DEFAULT_RANK,
      exp: totalExp,
      expCurrentLevelStart: currentLevelXpStart,
      expNextLevelTarget: nextLevelXp,
      stats,
      statsMeta: STAT_META
    };
  }

  function setActiveHero(snapshot) {
    activeHero = snapshot;
    window.dispatchEvent(new CustomEvent('ngs:hero-stats-updated', { detail: { hero: snapshot } }));
  }

  function getActiveHero() {
    return activeHero;
  }

  window.CharacterStatsSystem = {
    DEFAULT_RANK,
    CHARACTER_PROFILES,
    STAT_META,
    buildHeroSnapshot,
    setActiveHero,
    getActiveHero,
    getXpAtLevel
  };
})();
