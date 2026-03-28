'use strict';

window.PERSONAJES_DATA = [
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    role: 'Clan Uchiha · Avenger',
    emoji: '⚡',
    color: '#e84040',
    rank: 'GENIN',
    summary: {
      HP: 'Bajo', MP: 'Muy Alto', ATK: 'Muy Alto', DEF: 'Bajo',
      Vel: 'Muy Alto', CRT: 'Alto', CDMG: 'Muy Alto',
      EVA: 'Bajo', RES: 'Bajo', REGEN: 'Muy Bajo'
    },
    formula: (lv) => ({
      XP: Math.round(62 * Math.pow(lv, 1.93)),
      HP: 95 + 12 * (lv - 1),
      MP: 115 + 15 * (lv - 1),
      ATK: 19 + 11 * (lv - 1),
      DEF: 9 + 4 * (lv - 1),
      VEL: +(13 + 3 * (lv - 1)).toFixed(1),
      CTR: +(9 + 0.30 * (lv - 1)).toFixed(2),
      CDMG: +(16 + 1.50 * (lv - 1)).toFixed(2),
      EVA: +(4 + 0.15 * (lv - 1)).toFixed(2),
      RES: +(7 + 0.10 * (lv - 1)).toFixed(2),
      REGEN: +(1 + 0.02 * (lv - 1)).toFixed(2),
      ASPD: 1.0
    })
  },
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    role: 'Clan Uzumaki · Hokage',
    emoji: '🍥',
    color: '#ff8020',
    rank: 'CHUNIN',
    summary: {
      HP: 'Muy Alto', MP: 'Muy Alto', ATK: 'Alto', DEF: 'Bajo',
      Vel: 'Bajo', CRT: 'Bajo', CDMG: 'Bajo',
      EVA: 'Muy Bajo', RES: 'Alto', REGEN: 'Muy Alto'
    },
    formula: (lv) => ({
      XP: Math.round(60 * Math.pow(lv, 1.90)),
      HP: 135 + 21 * (lv - 1),
      MP: 125 + 19 * (lv - 1),
      ATK: 18 + 11 * (lv - 1),
      DEF: 10 + 4 * (lv - 1),
      VEL: +(10 + 2 * (lv - 1)).toFixed(1),
      CTR: +(4 + 0.15 * (lv - 1)).toFixed(2),
      CDMG: +(10 + 1.00 * (lv - 1)).toFixed(2),
      EVA: +(3 + 0.10 * (lv - 1)).toFixed(2),
      RES: +(12 + 0.15 * (lv - 1)).toFixed(2),
      REGEN: +(5 + 0.06 * (lv - 1)).toFixed(2),
      ASPD: 1.0
    })
  },
  {
    id: 'kakashi',
    name: 'Hatake Kakashi',
    role: 'Copy Ninja · Sensei',
    emoji: '📖',
    color: '#a0b0d0',
    rank: 'JONIN',
    summary: {
      HP: 'Bajo', MP: 'Bajo', ATK: 'Alto', DEF: 'Bajo',
      Vel: 'Muy Alto', CRT: 'Alto', CDMG: 'Muy Alto',
      EVA: 'Alto', RES: 'Bajo', REGEN: 'Muy Bajo'
    },
    formula: (lv) => ({
      XP: Math.round(59 * Math.pow(lv, 1.91)),
      HP: 90 + 10 * (lv - 1),
      MP: 85 + 9 * (lv - 1),
      ATK: 18 + 11 * (lv - 1),
      DEF: +(8 + 3.5 * (lv - 1)).toFixed(1),
      VEL: +(14 + 3.5 * (lv - 1)).toFixed(1),
      CTR: +(8 + 0.30 * (lv - 1)).toFixed(2),
      CDMG: +(16 + 1.55 * (lv - 1)).toFixed(2),
      EVA: +(7 + 0.25 * (lv - 1)).toFixed(2),
      RES: +(6 + 0.08 * (lv - 1)).toFixed(2),
      REGEN: +(1 + 0.01 * (lv - 1)).toFixed(2),
      ASPD: 1.0
    })
  }
];
