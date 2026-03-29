(() => {
  const RANKS = [
    { id:'D', name:'Genin', color:'#cd7f32', glow:'rgba(205,127,50,.55)', lore:'Tu chakra apenas despierta. Cada batalla forja el camino.', bonus:{ title:'Chakra Despierto', desc:'+10% a todos los stats pasivos', icon:'🌱' }, nodes:[{stat:'HP',icon:'💖',cost:5,gain:150,key:'hp'},{stat:'ATK',icon:'🗡️',cost:5,gain:40,key:'atk'},{stat:'DEF',icon:'🛡️',cost:5,gain:25,key:'def'},{stat:'SPD',icon:'🌪️',cost:5,gain:30,key:'spd'},{stat:'CRIT',icon:'🎯',cost:5,gain:8,key:'crit'}]},
    { id:'C', name:'Chuunin', color:'#8ec4e8', glow:'rgba(142,196,232,.55)', lore:'Los fundamentos se consolidan. El instinto comienza a guiarte.', bonus:{ title:'Mente Táctica', desc:'+15% velocidad de combate', icon:'⚡' }, nodes:[{stat:'HP',icon:'💖',cost:10,gain:200,key:'hp'},{stat:'ATK',icon:'🗡️',cost:10,gain:60,key:'atk'},{stat:'DEF',icon:'🛡️',cost:10,gain:40,key:'def'},{stat:'SPD',icon:'🌪️',cost:10,gain:45,key:'spd'},{stat:'CRIT',icon:'🎯',cost:10,gain:12,key:'crit'}]},
    { id:'B', name:'Veterano', color:'#ffd700', glow:'rgba(255,215,0,.55)', lore:'Has sobrevivido lo suficiente para soportar una carga superior.', bonus:{ title:'Cuerpo Forjado', desc:'+20% DEF y +20% HP máximo', icon:'🛡️' }, nodes:[{stat:'HP',icon:'💖',cost:20,gain:300,key:'hp'},{stat:'ATK',icon:'🗡️',cost:20,gain:80,key:'atk'},{stat:'DEF',icon:'🛡️',cost:20,gain:55,key:'def'},{stat:'SPD',icon:'🌪️',cost:20,gain:60,key:'spd'},{stat:'CRIT',icon:'🎯',cost:20,gain:18,key:'crit'}]},
    { id:'A', name:'Élite', color:'#d4d4ff', glow:'rgba(212,212,255,.55)', lore:'Tu presencia en el campo de batalla genera temor en el enemigo.', bonus:{ title:'Aura Élite', desc:'-15% daño recibido permanente', icon:'🌀' }, nodes:[{stat:'HP',icon:'💖',cost:40,gain:450,key:'hp'},{stat:'ATK',icon:'🗡️',cost:40,gain:120,key:'atk'},{stat:'DEF',icon:'🛡️',cost:40,gain:80,key:'def'},{stat:'SPD',icon:'🌪️',cost:40,gain:90,key:'spd'},{stat:'CRIT',icon:'🎯',cost:40,gain:28,key:'crit'}]},
    { id:'S', name:'Legendario', color:'#ff4a4a', glow:'rgba(255,74,74,.55)', lore:'Leyenda viviente. El chakra fluye sin restricción absoluta.', bonus:{ title:'Modo Leyenda', desc:'+50% poder en estado crítico', icon:'🔥' }, nodes:[{stat:'HP',icon:'💖',cost:80,gain:700,key:'hp'},{stat:'ATK',icon:'🗡️',cost:80,gain:180,key:'atk'},{stat:'DEF',icon:'🛡️',cost:80,gain:120,key:'def'},{stat:'SPD',icon:'🌪️',cost:80,gain:140,key:'spd'},{stat:'CRIT',icon:'🎯',cost:80,gain:42,key:'crit'}]}
  ];

  const POS = [
    { x: 50, y: 14 },
    { x: 86, y: 37 },
    { x: 72, y: 76 },
    { x: 28, y: 76 },
    { x: 14, y: 37 }
  ];

  const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[0,3]];

  window.ARBOL_RANKS_DATA = { RANKS, POS, EDGES };
})();
