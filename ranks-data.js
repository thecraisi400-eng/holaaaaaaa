(() => {
  const RANKS = [
    {
      id:'GENIN', short:'GNI', name:'GENIN', label:'Iniciado',
      color:'#cd7f32',
      lore:'Iniciación de Combate',
      loreFull:'Tu camino apenas comienza. Forja tu cuerpo en el crisol del combate.',
      bonus:{
        ico:'🏆', name:'Cuerpo Templado', desc:'+20 ATK · +15 DEF · +100 HP',
        grants:{ atk:20, def:15, hp:100, spd:8, chk:25 }
      },
      nodes:[
        { key:'atk', stat:'ATK', ico:'⚔️', bonus:20 },
        { key:'def', stat:'DEF', ico:'🛡️', bonus:15 },
        { key:'hp',  stat:'HP',  ico:'❤️', bonus:100},
        { key:'spd', stat:'SPD', ico:'💨', bonus:10 },
        { key:'chk', stat:'CHK', ico:'🔵', bonus:30 }
      ],
      cost: 15
    },
    {
      id:'CHUNIN', short:'CHN', name:'CHŪNIN', label:'Chūnin',
      color:'#c0c0c0',
      lore:'Prueba del Chūnin',
      loreFull:'Has pasado la primera criba. El camino ninja exige más de ti cada día.',
      bonus:{
        ico:'⭐', name:'Reflejos Ninja', desc:'+35 ATK · +30 DEF · +200 HP',
        grants:{ atk:35, def:30, hp:200, spd:18, chk:55 }
      },
      nodes:[
        { key:'atk', stat:'ATK', ico:'⚔️', bonus:35 },
        { key:'def', stat:'DEF', ico:'🛡️', bonus:30 },
        { key:'hp',  stat:'HP',  ico:'❤️', bonus:200},
        { key:'spd', stat:'SPD', ico:'💨', bonus:20 },
        { key:'chk', stat:'CHK', ico:'🔵', bonus:60 }
      ],
      cost: 25
    },
    {
      id:'JONIN', short:'JŌN', name:'JŌNIN', label:'Jōnin',
      color:'#ffd700',
      lore:'Veterano de Combate',
      loreFull:'Has sobrevivido suficiente para soportar una carga de combate muy superior.',
      bonus:{
        ico:'🔥', name:'Chakra Forjado', desc:'+60 ATK · +50 DEF · +350 HP',
        grants:{ atk:60, def:50, hp:350, spd:32, chk:95 }
      },
      nodes:[
        { key:'atk', stat:'ATK', ico:'⚔️', bonus:60 },
        { key:'def', stat:'DEF', ico:'🛡️', bonus:50 },
        { key:'hp',  stat:'HP',  ico:'❤️', bonus:350},
        { key:'spd', stat:'SPD', ico:'💨', bonus:35 },
        { key:'chk', stat:'CHK', ico:'🔵', bonus:100}
      ],
      cost: 40
    },
    {
      id:'ANBU', short:'ANBU', name:'ANBU', label:'Agente ANBU',
      color:'#b8acff',
      lore:'Agente en las Sombras',
      loreFull:'Tu poder desafía a los más temidos. Operás en las sombras donde la ley no llega.',
      bonus:{
        ico:'💠', name:'Dominio ANBU', desc:'+100 ATK · +85 DEF · +600 HP',
        grants:{ atk:100, def:85, hp:600, spd:58, chk:175 }
      },
      nodes:[
        { key:'atk', stat:'ATK', ico:'⚔️', bonus:100},
        { key:'def', stat:'DEF', ico:'🛡️', bonus:85 },
        { key:'hp',  stat:'HP',  ico:'❤️', bonus:600},
        { key:'spd', stat:'SPD', ico:'💨', bonus:60 },
        { key:'chk', stat:'CHK', ico:'🔵', bonus:180}
      ],
      cost: 60
    },
    {
      id:'KAGE', short:'KAGE', name:'KAGE', label:'Kage Supremo',
      color:'#ff3300',
      lore:'Shinobi Legendario',
      loreFull:'Tu nombre se susurra con miedo. Trasciendes por completo los límites humanos.',
      bonus:{
        ico:'👁️', name:'Poder del Kage', desc:'+200 ATK · +160 DEF · +1200 HP',
        grants:{ atk:200, def:160, hp:1200, spd:118, chk:395 }
      },
      nodes:[
        { key:'atk', stat:'ATK', ico:'⚔️', bonus:200},
        { key:'def', stat:'DEF', ico:'🛡️', bonus:160},
        { key:'hp',  stat:'HP',  ico:'❤️', bonus:1200},
        { key:'spd', stat:'SPD', ico:'💨', bonus:120},
        { key:'chk', stat:'CHK', ico:'🔵', bonus:400}
      ],
      cost: 100
    }
  ];

  const POS = [
    { x:76,  y:10  },
    { x:132, y:50  },
    { x:110, y:116 },
    { x:42,  y:116 },
    { x:20,  y:50  }
  ];

  window.ARBOL_RANKS_DATA = { RANKS, POS };
})();
