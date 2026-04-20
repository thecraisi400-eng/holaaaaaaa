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

  function calcularXP(nivel) {
    if (nivel <= 1) return 0;
    const base = 67.5;
    const exponente = 2.0;
    const xpAcumulada = Math.round(base * Math.pow(nivel - 1, exponente));
    return xpAcumulada;
  }

  const CHARACTER_PROFILES = {
    madara: { name: 'Madara Uchiha', clanName: 'CLAN UCHIHA', formulas: { CDMG: ['percent', 50, 1.5], MP: ['flat', 120, 12], INT: ['flat', 18, 1.2], ATK: ['flat', 20, 9], HP: ['flat', 150, 15], DEF: ['flat', 12, 5], AGI: ['flat', 10, 2.5], RES: ['percent', 8, 0.15], CRT: ['percent', 4, 0.1], EVA: ['percent', 1, 0.1], REGEN: ['percent', 1, 0.02], LCK: ['flat', 1, 0.05] } },
    itachi: { name: 'Itachi Uchiha', clanName: 'CLAN UCHIHA', formulas: { INT: ['flat', 25, 1.5], CRT: ['percent', 8, 0.3], EVA: ['percent', 5, 0.25], AGI: ['flat', 15, 2.5], MP: ['flat', 800, 9], ATK: ['flat', 12, 7], CDMG: ['percent', 20, 1.15], RES: ['percent', 5, 0.13], DEF: ['flat', 8, 4], LCK: ['flat', 2, 0.08], REGEN: ['percent', 1.5, 0.04], HP: ['flat', 100, 10] } },
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
    const targetLevel = clampLevel(level);
    return calcularXP(targetLevel);
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
    const parsedExp = exp == null ? currentLevelXpStart : Number(exp);
    const normalizedExp = Number.isFinite(parsedExp) ? parsedExp : currentLevelXpStart;
    const totalExp = Math.max(currentLevelXpStart, normalizedExp);

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
