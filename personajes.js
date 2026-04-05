'use strict';

(() => {
  const XP_FORMULA = (lv) => Math.round(60 * Math.pow(lv, 1.9));

  const CLAN_STATS = {
    uzumaki: {
      id: 'uzumaki',
      name: 'CLAN UZUMAKI',
      roleLabel: 'Clan Uzumaki',
      rank: 'CHUNIN',
      emoji: '🍥',
      color: '#ff8020',
      summary: {
        HP: 'Muy Alto', MP: 'Muy Alto', ATK: 'Medio', DEF: 'Alto',
        Vel: 'Bajo', CRT: 'Bajo', CDMG: 'Medio',
        EVA: 'Muy Bajo', RES: 'Muy Alto', REGEN: 'Muy Alto'
      },
      formula: (lv) => ({
        XP: XP_FORMULA(lv),
        HP: 150 + (25 * (lv - 1)),
        MP: 140 + (20 * (lv - 1)),
        ATK: 14 + (8 * (lv - 1)),
        DEF: 12 + (6 * (lv - 1)),
        VEL: +(10 + (2 * (lv - 1))).toFixed(2),
        CTR: +(5 + (0.15 * (lv - 1))).toFixed(2),
        CDMG: +(10 + (1.0 * (lv - 1))).toFixed(2),
        EVA: +(2 + (0.10 * (lv - 1))).toFixed(2),
        RES: +(15 + (0.50 * (lv - 1))).toFixed(2),
        REGEN: +(5 + (0.10 * (lv - 1))).toFixed(2),
        ASPD: 1.0
      })
    },
    uchiha: {
      id: 'uchiha',
      name: 'CLAN UCHIHA',
      roleLabel: 'Clan Uchiha',
      rank: 'GENIN',
      emoji: '⚡',
      color: '#e84040',
      summary: {
        HP: 'Bajo', MP: 'Alto', ATK: 'Muy Alto', DEF: 'Bajo',
        Vel: 'Muy Alto', CRT: 'Alto', CDMG: 'Muy Alto',
        EVA: 'Alto', RES: 'Muy Bajo', REGEN: 'Muy Bajo'
      },
      formula: (lv) => ({
        XP: XP_FORMULA(lv),
        HP: 95 + (12 * (lv - 1)),
        MP: 115 + (15 * (lv - 1)),
        ATK: 22 + (13 * (lv - 1)),
        DEF: 9 + (4 * (lv - 1)),
        VEL: +(18 + (5 * (lv - 1))).toFixed(2),
        CTR: +(10 + (0.40 * (lv - 1))).toFixed(2),
        CDMG: +(20 + (2.0 * (lv - 1))).toFixed(2),
        EVA: +(8 + (0.25 * (lv - 1))).toFixed(2),
        RES: +(5 + (0.10 * (lv - 1))).toFixed(2),
        REGEN: +(1 + (0.02 * (lv - 1))).toFixed(2),
        ASPD: 1.0
      })
    },
    senju: {
      id: 'senju',
      name: 'CLAN SENJU',
      roleLabel: 'Clan Senju',
      rank: 'JONIN',
      emoji: '🌳',
      color: '#4db86f',
      summary: {
        HP: 'Alto', MP: 'Muy Alto', ATK: 'Muy Alto', DEF: 'Muy Alto',
        Vel: 'Medio', CRT: 'Medio', CDMG: 'Alto',
        EVA: 'Medio', RES: 'Alto', REGEN: 'Medio'
      },
      formula: (lv) => ({
        XP: XP_FORMULA(lv),
        HP: 130 + (20 * (lv - 1)),
        MP: 125 + (18 * (lv - 1)),
        ATK: 22 + (12 * (lv - 1)),
        DEF: 15 + (8 * (lv - 1)),
        VEL: +(11 + (2.5 * (lv - 1))).toFixed(2),
        CTR: +(7 + (0.20 * (lv - 1))).toFixed(2),
        CDMG: +(15 + (1.20 * (lv - 1))).toFixed(2),
        EVA: +(5 + (0.12 * (lv - 1))).toFixed(2),
        RES: +(10 + (0.30 * (lv - 1))).toFixed(2),
        REGEN: +(3 + (0.05 * (lv - 1))).toFixed(2),
        ASPD: 1.0
      })
    },
    otsutsuki: {
      id: 'otsutsuki',
      name: 'CLAN OTSUTSUKI',
      roleLabel: 'Clan Otsutsuki',
      rank: 'KAGE',
      emoji: '🌙',
      color: '#c8d8ff',
      summary: {
        HP: 'Muy Alto', MP: 'Muy Alto', ATK: 'Muy Alto', DEF: 'Muy Alto',
        Vel: 'Muy Alto', CRT: 'Muy Alto', CDMG: 'Muy Alto',
        EVA: 'Alto', RES: 'Muy Alto', REGEN: 'Medio'
      },
      formula: (lv) => ({
        XP: XP_FORMULA(lv),
        HP: 200 + (30 * (lv - 1)),
        MP: 300 + (50 * (lv - 1)),
        ATK: 35 + (20 * (lv - 1)),
        DEF: 25 + (12 * (lv - 1)),
        VEL: +(20 + (5 * (lv - 1))).toFixed(2),
        CTR: +(15 + (0.50 * (lv - 1))).toFixed(2),
        CDMG: +(50 + (2.0 * (lv - 1))).toFixed(2),
        EVA: +(10 + (0.30 * (lv - 1))).toFixed(2),
        RES: +(40 + (0.60 * (lv - 1))).toFixed(2),
        REGEN: +(3 + (0.05 * (lv - 1))).toFixed(2),
        ASPD: 1.0
      })
    }
  };

  const CLAN_MEMBERS = {
    uzumaki: ['Kushina Uzumaki', 'Naruto Uzumaki', 'Nagato (Pain)', 'Karin Uzumaki'],
    uchiha: ['Madara Uchiha', 'Itachi Uchiha', 'Obito Uchiha', 'Sasuke Uchiha'],
    senju: ['Hashirama Senju', 'Tobirama Senju', 'Tsunade Senju', 'Itama Senju'],
    otsutsuki: ['Kaguya Otsutsuki', 'Hagoromo Otsutsuki', 'Indra Otsutsuki', 'Asura Otsutsuki']
  };

  const toId = (name) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  window.CLANES_DATA = Object.values(CLAN_STATS);
  window.PERSONAJES_DATA = Object.entries(CLAN_MEMBERS).flatMap(([clanId, names]) => {
    const clan = CLAN_STATS[clanId];
    return names.map((name) => ({
      id: toId(name),
      name,
      clanId,
      clanName: clan.name,
      role: clan.roleLabel,
      emoji: clan.emoji,
      color: clan.color,
      rank: clan.rank,
      summary: { ...clan.summary },
      formula: clan.formula
    }));
  });
})();
