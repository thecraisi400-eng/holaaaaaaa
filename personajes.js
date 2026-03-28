'use strict';

window.PERSONAJES = [
  {
    id: 'sasuke',
    nombre: 'Sasuke Uchiha',
    rango: 'AVENGER',
    clan: 'Clan Uchiha',
    emoji: '⚡',
    color: '#e84040',
    baseLevel: 1,
    baseStats: {
      HP: 95,
      MP: 115,
      ATK: 19,
      DEF: 9,
      VEL: 13,
      CTR: 9,
      EVA: 4,
      RES: 7,
      REGEN: 1,
      ASPD: 1.2,
      CDMG: 16
    },
    growth: {
      HP: 12,
      MP: 15,
      ATK: 11,
      DEF: 4,
      VEL: 3,
      CTR: 0.30,
      EVA: 0.15,
      RES: 0.10,
      REGEN: 0.02,
      ASPD: 0.015,
      CDMG: 1.50
    },
    xpFormula(level) {
      return Math.round(62 * Math.pow(level, 1.93));
    }
  },
  {
    id: 'naruto',
    nombre: 'Naruto Uzumaki',
    rango: 'HOKAGE',
    clan: 'Clan Uzumaki',
    emoji: '🍥',
    color: '#ff8020',
    baseLevel: 1,
    baseStats: {
      HP: 135,
      MP: 125,
      ATK: 18,
      DEF: 10,
      VEL: 10,
      CTR: 4,
      EVA: 3,
      RES: 12,
      REGEN: 5,
      ASPD: 1.0,
      CDMG: 10
    },
    growth: {
      HP: 21,
      MP: 19,
      ATK: 11,
      DEF: 4,
      VEL: 2,
      CTR: 0.15,
      EVA: 0.10,
      RES: 0.15,
      REGEN: 0.06,
      ASPD: 0.01,
      CDMG: 1.0
    },
    xpFormula(level) {
      return Math.round(60 * Math.pow(level, 1.9));
    }
  },
  {
    id: 'kakashi',
    nombre: 'Hatake Kakashi',
    rango: 'SENSEI',
    clan: 'Copy Ninja',
    emoji: '📖',
    color: '#a0b0d0',
    baseLevel: 1,
    baseStats: {
      HP: 90,
      MP: 85,
      ATK: 18,
      DEF: 8,
      VEL: 14,
      CTR: 8,
      EVA: 7,
      RES: 6,
      REGEN: 1,
      ASPD: 1.25,
      CDMG: 16
    },
    growth: {
      HP: 10,
      MP: 9,
      ATK: 11,
      DEF: 3.5,
      VEL: 3.5,
      CTR: 0.30,
      EVA: 0.25,
      RES: 0.08,
      REGEN: 0.01,
      ASPD: 0.02,
      CDMG: 1.55
    },
    xpFormula(level) {
      return Math.round(59 * Math.pow(level, 1.91));
    }
  }
];
