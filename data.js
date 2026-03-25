window.gameData = {
  initialState: {
    hp: 720,
    hpMax: 1000,
    mp: 290,
    mpMax: 500,
    exp: 4400,
    expMax: 10000,
    gold: 4320,
    atk: 1240,
    def: 880,
    level: 23,
    activeSection: 'heroe',
  },

  startOptions: [
    {
      id: 'hyuga',
      name: 'CLAN HYŪGA',
      emoji: '👁️',
      summary: { HP:'Muy Alto', MP:'Medio', ATK:'Medio', DEF:'Alto', Vel:'Medio', CRT:'Bajo' },
      members: [
        { name:'Neji Hyūga', emoji:'🥋' },
        { name:'Hinata Hyūga', emoji:'🌸' },
        { name:'Hiashi Hyūga', emoji:'🧘' },
        { name:'Hanabi Hyūga', emoji:'🌺' },
      ],
      formula: (lv) => ({
        XP: Math.round(55 * Math.pow(lv, 1.85)),
        HP: 120 + 18*(lv-1), MP: 80 + 10*(lv-1), ATK: 15 + 9*(lv-1), DEF: 14 + 6*(lv-1), Vel: +(10 + 2.5*(lv-1)).toFixed(1), CRT: +(2 + 0.15*(lv-1)).toFixed(2),
      }),
    },
    {
      id: 'uchiha',
      name: 'CLAN UCHIHA',
      emoji: '🔥',
      summary: { HP:'Medio', MP:'Muy Alto', ATK:'Muy Alto', DEF:'Bajo', Vel:'Alto', CRT:'Muy Alto' },
      members: [
        { name:'Madara Uchiha', emoji:'💀' },
        { name:'Itachi Uchiha', emoji:'🌙' },
        { name:'Sasuke Uchiha', emoji:'⚡' },
        { name:'Obito Uchiha', emoji:'🌀' },
      ],
      formula: (lv) => ({
        XP: Math.round(60 * Math.pow(lv, 1.9)),
        HP: 100 + 14*(lv-1), MP: 100 + 14*(lv-1), ATK: 18 + 11*(lv-1), DEF: 10 + 5*(lv-1), Vel: +(12 + 3*(lv-1)).toFixed(1), CRT: +(8 + 0.30*(lv-1)).toFixed(2),
      }),
    },
    {
      id: 'senju',
      name: 'CLAN SENJU',
      emoji: '🌿',
      summary: { HP:'Muy Alto', MP:'Muy Alto', ATK:'Alto', DEF:'Alto', Vel:'Medio', CRT:'Medio' },
      members: [
        { name:'Hashirama Senju', emoji:'🌳' },
        { name:'Tobirama Senju', emoji:'💧' },
        { name:'Tsunade Senju', emoji:'👊' },
        { name:'Itama Senju', emoji:'🍃' },
      ],
      formula: (lv) => ({
        XP: Math.round(65 * Math.pow(lv, 1.88)),
        HP: 130 + 20*(lv-1), MP: 110 + 16*(lv-1), ATK: 16 + 10*(lv-1), DEF: 12 + 6*(lv-1), Vel: +(11 + 2.2*(lv-1)).toFixed(1), CRT: +(5 + 0.20*(lv-1)).toFixed(2),
      }),
    },
    {
      id: 'uzumaki',
      name: 'CLAN UZUMAKI',
      emoji: '🌀',
      summary: { HP:'Muy Alto', MP:'Muy Alto', ATK:'Medio', DEF:'Medio', Vel:'Bajo', CRT:'Bajo' },
      members: [
        { name:'Kushina Uzumaki', emoji:'🦊' },
        { name:'Naruto Uzumaki', emoji:'🍜' },
        { name:'Nagato Uzumaki', emoji:'🌧️' },
        { name:'Karin Uzumaki', emoji:'💊' },
      ],
      formula: (lv) => ({
        XP: Math.round(70 * Math.pow(lv, 1.82)),
        HP: 125 + 19*(lv-1), MP: 115 + 17*(lv-1), ATK: 14 + 9*(lv-1), DEF: +(11 + 5.5*(lv-1)).toFixed(1), Vel: +(9 + 2*(lv-1)).toFixed(1), CRT: +(4 + 0.18*(lv-1)).toFixed(2),
      }),
    },
    {
      id: 'nara',
      name: 'CLAN NARA',
      emoji: '🦌',
      summary: { HP:'Bajo', MP:'Medio', ATK:'Bajo', DEF:'Bajo', Vel:'Bajo', CRT:'Muy Alto' },
      members: [
        { name:'Shikamaru Nara', emoji:'🌑' },
        { name:'Shikaku Nara', emoji:'🧠' },
        { name:'Shikadai Nara', emoji:'💨' },
        { name:'Ensui Nara', emoji:'🌫️' },
      ],
      formula: (lv) => ({
        XP: Math.round(58 * Math.pow(lv, 1.92)),
        HP: 95 + 12*(lv-1), MP: 90 + 12*(lv-1), ATK: 13 + 7*(lv-1), DEF: +(9 + 4.5*(lv-1)).toFixed(1), Vel: +(8 + 1.8*(lv-1)).toFixed(1), CRT: +(10 + 0.35*(lv-1)).toFixed(2),
      }),
    },
    {
      id: 'otsutsuki',
      name: 'CLAN ŌTSUTSUKI',
      emoji: '🌕',
      summary: { HP:'Muy Alto', MP:'Muy Alto', ATK:'Muy Alto', DEF:'Alto', Vel:'Alto', CRT:'Alto' },
      members: [
        { name:'Kaguya Ōtsutsuki', emoji:'👁️' },
        { name:'Hagoromo Ōtsutsuki', emoji:'☯️' },
        { name:'Hamura Ōtsutsuki', emoji:'🌙' },
        { name:'Toneri Ōtsutsuki', emoji:'🌑' },
      ],
      formula: (lv) => ({
        XP: Math.round(75 * Math.pow(lv, 1.95)),
        HP: 115 + 16*(lv-1), MP: 120 + 18*(lv-1), ATK: +(17 + 10.5*(lv-1)).toFixed(1), DEF: +(13 + 6.5*(lv-1)).toFixed(1), Vel: +(11 + 2.8*(lv-1)).toFixed(1), CRT: +(7 + 0.28*(lv-1)).toFixed(2),
      }),
    },
  ],
  sections: {
    heroe:        { icon:'🥷', title:'HÉROE',            desc:'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
    misiones:     { icon:'📜', title:'MISIONES',         desc:'Próximamente.' },
    clanes:       { icon:'⛩️', title:'CLANES',           desc:'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
    eventos:      { icon:'🎴', title:'EVENTOS',          desc:'¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
    jutsus:       { icon:'🌀', title:'JUTSUS',           desc:'Gestiona tus técnicas ninja. Equipa hasta 4 jutsus activos y mejora sus rangos con sellos de chakra.' },
    batallas:     { icon:'⚔️', title:'BATALLAS',         desc:'Modo PvP y arena de rango. Desafía a otros jugadores y sube en la tabla clasificatoria mundial.' },
    invocaciones: { icon:'✨', title:'INVOCACIONES',     desc:'Invoca nuevos compañeros y objetos míticos. Utiliza pergaminos de convocación para obtener aliados S-Rank.' },
    habilidades:  { icon:'🌿', title:'ÁRBOL DE HABILIDAD', desc:'Asigna puntos de habilidad en ramas de Ninjutsu, Taijutsu y Genjutsu para personalizar tu estilo de combate.' },
    ajustes:      { icon:'⚙️', title:'AJUSTES',          desc:'Configura notificaciones, audio, gráficos y tu cuenta de shinobi. También puedes vincular tu aldea.' },
  }
};
