'use strict';

window.EQUIPMENT_DATA = {
  cabeza: {
    name: 'Cabeza', icon: '🪖',
    stats: { HP: 4, MP: 2, RES: 0.5 },
    ranges: [
      { from:  1, to:  6, maxCost:    480 },
      { from:  6, to: 15, maxCost:   4277 },
      { from: 15, to: 30, maxCost:  26000 },
      { from: 30, to: 45, maxCost:  57456 },
      { from: 45, to: 60, maxCost: 106848 },
      { from: 60, to: 75, maxCost: 144000 }
    ]
  },
  pecho: {
    name: 'Pecho', icon: '🛡️',
    stats: { DEF: 1.2, HP: 6, REGEN: 0.08 },
    ranges: [
      { from:  1, to:  6, maxCost:    560 },
      { from:  6, to: 15, maxCost:   5040 },
      { from: 15, to: 30, maxCost:  29600 },
      { from: 30, to: 45, maxCost:  63000 },
      { from: 45, to: 60, maxCost: 114800 },
      { from: 60, to: 75, maxCost: 162000 }
    ]
  },
  manos: {
    name: 'Manos', icon: '🧤',
    stats: { ATK: 0.5, CTR: 0.04, ASPD: 0.02 },
    ranges: [
      { from:  1, to:  6, maxCost:    440 },
      { from:  6, to: 15, maxCost:   3780 },
      { from: 15, to: 30, maxCost:  24000 },
      { from: 30, to: 45, maxCost:  53200 },
      { from: 45, to: 60, maxCost: 100800 },
      { from: 60, to: 75, maxCost: 138000 }
    ]
  },
  piernas: {
    name: 'Piernas', icon: '👖',
    stats: { DEF: 0.8, EVA: 0.02, HP: 5 },
    ranges: [
      { from:  1, to:  6, maxCost:    500 },
      { from:  6, to: 15, maxCost:   4320 },
      { from: 15, to: 30, maxCost:  27200 },
      { from: 30, to: 45, maxCost:  58800 },
      { from: 45, to: 60, maxCost: 109200 },
      { from: 60, to: 75, maxCost: 150000 }
    ]
  },
  pies: {
    name: 'Pies', icon: '👟',
    stats: { VEL: 0.4, EVA: 0.03, ASPD: 0.01 },
    ranges: [
      { from:  1, to:  6, maxCost:    420 },
      { from:  6, to: 15, maxCost:   3600 },
      { from: 15, to: 30, maxCost:  22400 },
      { from: 30, to: 45, maxCost:  49000 },
      { from: 45, to: 60, maxCost:  95200 },
      { from: 60, to: 75, maxCost: 132000 }
    ]
  },
  accesorio: {
    name: 'Accesorio', icon: '💍',
    stats: { MP: 5, CDMG: 0.1, CTR: 0.05 },
    ranges: [
      { from:  1, to:  6, maxCost:    600 },
      { from:  6, to: 15, maxCost:   5760 },
      { from: 15, to: 30, maxCost:  32000 },
      { from: 30, to: 45, maxCost:  70000 },
      { from: 45, to: 60, maxCost: 133000 },
      { from: 60, to: 75, maxCost: 180000 }
    ]
  }
};

window.SLOT_ORDER = ['cabeza', 'pecho', 'manos', 'piernas', 'pies', 'accesorio'];

window.BASE_STATS = {
  HP: 100, MP: 50, ATK: 10, DEF: 5.0, VEL: 10.0,
  CTR: 5.0, EVA: 3.0, RES: 2.0, REGEN: 1.0, ASPD: 1.0, CDMG: 150.0
};

window.STAT_META = [
  { key:'HP',    icon:'❤️',  label:'HP',    pct:false },
  { key:'MP',    icon:'💧',  label:'MP',    pct:false },
  { key:'ATK',   icon:'⚔️',  label:'ATK',   pct:false },
  { key:'DEF',   icon:'🛡️',  label:'DEF',   pct:false },
  { key:'VEL',   icon:'⚡',  label:'VEL',   pct:false },
  { key:'CTR',   icon:'🎯',  label:'CTR',   pct:true  },
  { key:'EVA',   icon:'💨',  label:'EVA',   pct:true  },
  { key:'RES',   icon:'🔰',  label:'RES',   pct:true  },
  { key:'REGEN', icon:'🌿',  label:'REGEN', pct:true  },
  { key:'ASPD',  icon:'🌀',  label:'ASPD',  pct:false, dec:2 },
  { key:'CDMG',  icon:'💥',  label:'CDMG',  pct:true  },
  { key:'DUMMY', icon:'?',   label:'?',     pct:false, dummy: true }
];
