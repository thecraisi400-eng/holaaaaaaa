/* ─────────────────────────────────────────────
   ESTADO DEL JUEGO
───────────────────────────────────────────── */
const state = {
  hp: 720, hpMax: 1000,
  mp: 290, mpMax: 500,
  exp: 4400, expMax: 10000,
  gold: 4320, atk: 1240, def: 880,
  level: 23,
  activeSection: 'heroe',
  missionProg: 63,
};

/* ─────────────────────────────────────────────
   DATOS DE SECCIONES
───────────────────────────────────────────── */
const sections = {
  heroe:        { icon:'🥷', title:'HÉROE',           desc:'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
  misiones:     { icon:'📜', title:'MISIONES',         desc:'Tienes 3 misiones pendientes. Completa misiones diarias, de historia y especiales para ganar EXP y recursos.' },
  clanes:       { icon:'⛩️', title:'CLANES',           desc:'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
  eventos:      { icon:'🎴', title:'EVENTOS',          desc:'¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
  jutsus:       { icon:'🌀', title:'JUTSUS',           desc:'Gestiona tus técnicas ninja. Equipa hasta 4 jutsus activos y mejora sus rangos con sellos de chakra.' },
  batallas:     { icon:'⚔️', title:'BATALLAS',         desc:'Modo PvP y arena de rango. Desafía a otros jugadores y sube en la tabla clasificatoria mundial.' },
  invocaciones: { icon:'✨', title:'INVOCACIONES',     desc:'Invoca nuevos compañeros y objetos míticos. Utiliza pergaminos de convocación para obtener aliados S-Rank.' },
  habilidades:  { icon:'🌿', title:'ÁRBOL DE HABILIDAD', desc:'Asigna puntos de habilidad en ramas de Ninjutsu, Taijutsu y Genjutsu para personalizar tu estilo de combate.' },
  ajustes:      { icon:'⚙️', title:'AJUSTES',          desc:'Configura notificaciones, audio, gráficos y tu cuenta de shinobi. También puedes vincular tu aldea.' },
};

window.gameState = state;
window.gameSections = sections;
