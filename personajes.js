'use strict';

window.NINJA_CHARACTERS = [
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    role: 'Clan Uchiha · Avenger',
    rank: 'Nukenin',
    emoji: '⚡',
    color: '#e84040',
    formula: (lv) => ({
      HP: 95 + 12 * (lv - 1),
      MP: 115 + 15 * (lv - 1),
      ATK: 19 + 11 * (lv - 1),
      DEF: 9 + 4 * (lv - 1),
      VEL: +(13 + 3 * (lv - 1)).toFixed(1),
      CTR: +(9 + 0.30 * (lv - 1)).toFixed(2),
      CDMG: +(150 + 1.50 * (lv - 1)).toFixed(2),
      EVA: +(4 + 0.15 * (lv - 1)).toFixed(2),
      RES: +(7 + 0.10 * (lv - 1)).toFixed(2),
      REGEN: +(1 + 0.02 * (lv - 1)).toFixed(2),
      ASPD: +(1.1 + 0.03 * (lv - 1)).toFixed(2),
      XP: Math.round(62 * Math.pow(lv, 1.93))
    })
  },
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    role: 'Clan Uzumaki · Hokage',
    rank: 'Chunin',
    emoji: '🍥',
    color: '#ff8020',
    formula: (lv) => ({
      HP: 135 + 21 * (lv - 1),
      MP: 125 + 19 * (lv - 1),
      ATK: 18 + 11 * (lv - 1),
      DEF: 10 + 4 * (lv - 1),
      VEL: +(10 + 2 * (lv - 1)).toFixed(1),
      CTR: +(4 + 0.15 * (lv - 1)).toFixed(2),
      CDMG: +(150 + 1.00 * (lv - 1)).toFixed(2),
      EVA: +(3 + 0.10 * (lv - 1)).toFixed(2),
      RES: +(12 + 0.15 * (lv - 1)).toFixed(2),
      REGEN: +(5 + 0.06 * (lv - 1)).toFixed(2),
      ASPD: +(0.95 + 0.02 * (lv - 1)).toFixed(2),
      XP: Math.round(60 * Math.pow(lv, 1.9))
    })
  },
  {
    id: 'kakashi',
    name: 'Hatake Kakashi',
    role: 'Copy Ninja · Sensei',
    rank: 'Jonin',
    emoji: '📖',
    color: '#a0b0d0',
    formula: (lv) => ({
      HP: 90 + 10 * (lv - 1),
      MP: 85 + 9 * (lv - 1),
      ATK: 18 + 11 * (lv - 1),
      DEF: +(8 + 3.5 * (lv - 1)).toFixed(1),
      VEL: +(14 + 3.5 * (lv - 1)).toFixed(1),
      CTR: +(8 + 0.30 * (lv - 1)).toFixed(2),
      CDMG: +(150 + 1.55 * (lv - 1)).toFixed(2),
      EVA: +(7 + 0.25 * (lv - 1)).toFixed(2),
      RES: +(6 + 0.08 * (lv - 1)).toFixed(2),
      REGEN: +(1 + 0.01 * (lv - 1)).toFixed(2),
      ASPD: +(1.2 + 0.03 * (lv - 1)).toFixed(2),
      XP: Math.round(59 * Math.pow(lv, 1.91))
    })
  }
];

window.getNinjaCharacterById = function getNinjaCharacterById(id) {
  return window.NINJA_CHARACTERS.find((char) => char.id === id) || window.NINJA_CHARACTERS[0];
};
