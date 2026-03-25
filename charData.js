window.charData = {
  clans: [
    {
      id: 'hyuga',
      name: 'CLAN HYŪGA',
      emoji: '👁️',
      color: '#4db8ff',
      summary: { HP:'Muy Alto', MP:'Medio', ATK:'Medio', DEF:'Alto', VEL:'Medio', CTR:'Bajo', CDMG:'Medio', EVA:'Medio', RES:'Muy Alto', REGEN:'Bajo' },
      members: ['Neji Hyūga','Hinata Hyūga','Hiashi Hyūga','Hanabi Hyūga'],
      memberEmoji: ['🥋','🌸','🧘','🌺'],
      formula: (lv) => ({ XP: Math.round(55 * Math.pow(lv, 1.85)), hpMax: 120 + 18*(lv-1), mpMax: 80 + 10*(lv-1), atk: 15 + 9*(lv-1), def: Math.round(14 + 6*(lv-1)), vel: +(10 + 2.5*(lv-1)).toFixed(1), ctr: +(2 + 0.15*(lv-1)).toFixed(2), cdmg: +(150 + 1.0*(lv-1)).toFixed(2), eva: +(5 + 0.20*(lv-1)).toFixed(2), res: +(10 + 0.15*(lv-1)).toFixed(2), regen: +(1 + 0.02*(lv-1)).toFixed(2) })
    },
    {
      id: 'uchiha',
      name: 'CLAN UCHIHA',
      emoji: '🔥',
      color: '#ff4040',
      summary: { HP:'Medio', MP:'Muy Alto', ATK:'Muy Alto', DEF:'Bajo', VEL:'Alto', CTR:'Muy Alto', CDMG:'Muy Alto', EVA:'Alto', RES:'Medio', REGEN:'Bajo' },
      members: ['Madara Uchiha','Itachi Uchiha','Sasuke Uchiha','Obito Uchiha'],
      memberEmoji: ['💀','🌙','⚡','🌀'],
      formula: (lv) => ({ XP: Math.round(60 * Math.pow(lv, 1.90)), hpMax: 100 + 14*(lv-1), mpMax: 100 + 14*(lv-1), atk: 18 + 11*(lv-1), def: 10 + 5*(lv-1), vel: +(12 + 3*(lv-1)).toFixed(1), ctr: +(8 + 0.30*(lv-1)).toFixed(2), cdmg: +(155 + 1.50*(lv-1)).toFixed(2), eva: +(6 + 0.25*(lv-1)).toFixed(2), res: +(8 + 0.10*(lv-1)).toFixed(2), regen: +(2 + 0.03*(lv-1)).toFixed(2) })
    },
    {
      id: 'senju',
      name: 'CLAN SENJU',
      emoji: '🌿',
      color: '#40e080',
      summary: { HP:'Muy Alto', MP:'Muy Alto', ATK:'Alto', DEF:'Alto', VEL:'Medio', CTR:'Medio', CDMG:'Medio', EVA:'Bajo', RES:'Muy Alto', REGEN:'Muy Alto' },
      members: ['Hashirama Senju','Tobirama Senju','Tsunade Senju','Itama Senju'],
      memberEmoji: ['🌳','💧','👊','🍃'],
      formula: (lv) => ({ XP: Math.round(65 * Math.pow(lv, 1.88)), hpMax: 130 + 20*(lv-1), mpMax: 110 + 16*(lv-1), atk: 16 + 10*(lv-1), def: 12 + 6*(lv-1), vel: +(11 + 2.2*(lv-1)).toFixed(1), ctr: +(5 + 0.20*(lv-1)).toFixed(2), cdmg: +(152 + 1.20*(lv-1)).toFixed(2), eva: +(4 + 0.18*(lv-1)).toFixed(2), res: +(12 + 0.14*(lv-1)).toFixed(2), regen: +(4 + 0.05*(lv-1)).toFixed(2) })
    },
    {
      id: 'uzumaki',
      name: 'CLAN UZUMAKI',
      emoji: '🌀',
      color: '#ff8020',
      summary: { HP:'Muy Alto', MP:'Muy Alto', ATK:'Medio', DEF:'Medio', VEL:'Bajo', CTR:'Bajo', CDMG:'Medio', EVA:'Bajo', RES:'Muy Alto', REGEN:'Muy Alto' },
      members: ['Kushina Uzumaki','Naruto Uzumaki','Nagato Uzumaki','Karin Uzumaki'],
      memberEmoji: ['🦊','🍜','🌧️','💊'],
      formula: (lv) => ({ XP: Math.round(70 * Math.pow(lv, 1.82)), hpMax: 125 + 19*(lv-1), mpMax: 115 + 17*(lv-1), atk: 14 + 9*(lv-1), def: +(11 + 5.5*(lv-1)).toFixed(1), vel: +(9 + 2*(lv-1)).toFixed(1), ctr: +(4 + 0.18*(lv-1)).toFixed(2), cdmg: +(151 + 1.10*(lv-1)).toFixed(2), eva: +(3 + 0.15*(lv-1)).toFixed(2), res: +(14 + 0.16*(lv-1)).toFixed(2), regen: +(5 + 0.06*(lv-1)).toFixed(2) })
    }
  ],
  statLabels: [
    { key:'hpMax', icon:'❤️', label:'HP' },
    { key:'mpMax', icon:'💙', label:'MP' },
    { key:'atk', icon:'⚔️', label:'ATK' },
    { key:'def', icon:'🛡️', label:'DEF' },
    { key:'vel', icon:'⚡', label:'VEL' },
    { key:'ctr', icon:'🎯', label:'CTR', pct:true },
    { key:'cdmg', icon:'💥', label:'CDMG', pct:true },
    { key:'eva', icon:'💨', label:'EVA', pct:true },
    { key:'res', icon:'🧠', label:'RES', pct:true },
    { key:'regen', icon:'🌿', label:'REGEN', pct:true }
  ],
};
