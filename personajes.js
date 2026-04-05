'use strict';

window.PERSONAJES_DATA = [
  {
    id: 'madara',
    sprite: '',
    name: 'Uchiha Madara',
    role: 'Clan Uchiha · Fantasma de la Guerra',
    emoji: '🩸',
    color: '#d64545',
    clan: 'uchiha',
    rank: 'KAGE',
    summary: {
      HP: 'Alto', MP: 'Muy Alto', ATK: 'Muy Alto', DEF: 'Alto',
      Vel: 'Alto', CRT: 'Muy Alto', CDMG: 'Muy Alto',
      EVA: 'Medio', RES: 'Alto', REGEN: 'Bajo'
    },
    formula: (lv) => ({
      XP: Math.round(70 * Math.pow(lv, 1.98)),
      HP: 120 + 17 * (lv - 1),
      MP: 130 + 17 * (lv - 1),
      ATK: 23 + 12 * (lv - 1),
      DEF: 13 + 5 * (lv - 1),
      VEL: +(12 + 2.7 * (lv - 1)).toFixed(1),
      CTR: +(10 + 0.32 * (lv - 1)).toFixed(2),
      CDMG: +(20 + 1.70 * (lv - 1)).toFixed(2),
      EVA: +(5 + 0.16 * (lv - 1)).toFixed(2),
      RES: +(11 + 0.14 * (lv - 1)).toFixed(2),
      REGEN: +(2 + 0.03 * (lv - 1)).toFixed(2),
      ASPD: 1.0
    })
  },
  {
    id: 'itachi',
    sprite: '',
    name: 'Uchiha Itachi',
    role: 'Clan Uchiha · Genio del Genjutsu',
    emoji: '🕊️',
    color: '#bb4444',
    clan: 'uchiha',
    rank: 'JONIN',
    summary: {
      HP: 'Bajo', MP: 'Muy Alto', ATK: 'Alto', DEF: 'Bajo',
      Vel: 'Alto', CRT: 'Muy Alto', CDMG: 'Muy Alto',
      EVA: 'Alto', RES: 'Alto', REGEN: 'Muy Bajo'
    },
    formula: (lv) => ({
      XP: Math.round(64 * Math.pow(lv, 1.95)),
      HP: 98 + 11 * (lv - 1),
      MP: 126 + 16 * (lv - 1),
      ATK: 20 + 10 * (lv - 1),
      DEF: 9 + 4 * (lv - 1),
      VEL: +(12.5 + 3 * (lv - 1)).toFixed(1),
      CTR: +(10 + 0.35 * (lv - 1)).toFixed(2),
      CDMG: +(18 + 1.60 * (lv - 1)).toFixed(2),
      EVA: +(6 + 0.24 * (lv - 1)).toFixed(2),
      RES: +(10 + 0.14 * (lv - 1)).toFixed(2),
      REGEN: +(1 + 0.01 * (lv - 1)).toFixed(2),
      ASPD: 1.0
    })
  },
  {
    id: 'obito',
    sprite: '',
    name: 'Uchiha Obito',
    role: 'Clan Uchiha · Kamui',
    emoji: '🌀',
    color: '#c85a3f',
    clan: 'uchiha',
    rank: 'ANBU',
    summary: {
      HP: 'Alto', MP: 'Alto', ATK: 'Alto', DEF: 'Medio',
      Vel: 'Alto', CRT: 'Alto', CDMG: 'Alto',
      EVA: 'Muy Alto', RES: 'Medio', REGEN: 'Bajo'
    },
    formula: (lv) => ({
      XP: Math.round(63 * Math.pow(lv, 1.93)),
      HP: 118 + 15 * (lv - 1),
      MP: 112 + 14 * (lv - 1),
      ATK: 19 + 10 * (lv - 1),
      DEF: 11 + 4 * (lv - 1),
      VEL: +(13 + 3 * (lv - 1)).toFixed(1),
      CTR: +(8 + 0.28 * (lv - 1)).toFixed(2),
      CDMG: +(15 + 1.30 * (lv - 1)).toFixed(2),
      EVA: +(8 + 0.28 * (lv - 1)).toFixed(2),
      RES: +(8 + 0.10 * (lv - 1)).toFixed(2),
      REGEN: +(2 + 0.02 * (lv - 1)).toFixed(2),
      ASPD: 1.0
    })
  },
  {
    id: 'sasuke',
    sprite: '',
    name: 'Uchiha Sasuke',
    role: 'Clan Uchiha · Avenger',
    emoji: '⚡',
    color: '#e84040',
    clan: 'uchiha',
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
    clan: 'uzumaki',
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
    clan: 'hatake',
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
