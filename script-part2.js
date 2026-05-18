/* ─────────────────────────────────────────────
   FÓRMULAS DE ESTADÍSTICAS POR NIVEL
───────────────────────────────────────────── */
function calcStats(level) {
  const lvl = level;
  return {
    xpReq:  Math.round(67.5 * Math.pow(lvl, 2)),
    hp:     100 + (15 * (lvl - 1)),
    mp:     50  + (12 * (lvl - 1)),
    atk:    15  + (8  * (lvl - 1)),
    agi:    12  + (3  * (lvl - 1)),
    int:    10  + (10 * (lvl - 1)),
    luk:    5   + (0.5 * (lvl - 1)),
    def:    10  + (5  * (lvl - 1)),
    res:    (6  + (0.12 * (lvl - 1))).toFixed(2),
    cri:    (5  + (0.25 * (lvl - 1))).toFixed(2),
    cdmg:   (150 + (2  * (lvl - 1))).toFixed(0),
  };
}

/* ─────────────────────────────────────────────
   ESTADO DEL JUEGO
───────────────────────────────────────────── */
const state = {
  level: 1,
  exp: 0,
  gold: 100,
  activeSection: 'heroe',
};

// Calcular stats iniciales según nivel 1
let stats = calcStats(state.level);
state.hpMax  = stats.hp;
state.hp     = stats.hp;
state.mpMax  = stats.mp;
state.mp     = stats.mp;
state.expMax = stats.xpReq;
state.atk    = stats.atk;
state.def    = stats.def;

/* ─────────────────────────────────────────────
   DATOS DE SECCIONES
───────────────────────────────────────────── */
const sections = {
  heroe:        { icon:'🥷', title:'HÉROE',           desc:'Consulta y mejora el equipo de tu shinobi. Cambia armadura, armas y accesorios para maximizar tu poder de combate.' },
  misiones:     { icon:'📜', title:'MISIONES',         desc:'' },
  clanes:       { icon:'⛩️', title:'CLANES',           desc:'Únete o crea tu clan. Participa en guerras de clanes y desbloquea jutsus exclusivos de linaje.' },
  eventos:      { icon:'🎴', title:'EVENTOS',          desc:'¡Evento especial activo! Festival del Chakra Lunar: consigue multiplicadores ×3 de EXP durante 2 horas.' },
  jutsus:       { icon:'🌀', title:'JUTSUS',           desc:'Gestiona tus técnicas ninja. Equipa hasta 4 jutsus activos y mejora sus rangos con sellos de chakra.' },
  batallas:     { icon:'⚔️', title:'BATALLAS',         desc:'Modo PvP y arena de rango. Desafía a otros jugadores y sube en la tabla clasificatoria mundial.' },
  invocaciones: { icon:'✨', title:'INVOCACIONES',     desc:'Invoca nuevos compañeros y objetos míticos. Utiliza pergaminos de convocación para obtener aliados S-Rank.' },
  habilidades:  { icon:'🌿', title:'ÁRBOL DE HABILIDAD', desc:'Asigna puntos de habilidad en ramas de Ninjutsu, Taijutsu y Genjutsu para personalizar tu estilo de combate.' },
  ajustes:      { icon:'⚙️', title:'AJUSTES',          desc:'Configura notificaciones, audio, gráficos y tu cuenta de shinobi. También puedes vincular tu aldea.' },
};

/* ─────────────────────────────────────────────
   RENDERIZADO INICIAL DE BARRAS (sin auto-update)
───────────────────────────────────────────── */
function renderBars() {
  const hpPct  = Math.round(state.hp  / state.hpMax  * 100);
  const mpPct  = Math.round(state.mp  / state.mpMax  * 100);
  const expPct = state.expMax > 0 ? Math.round(state.exp / state.expMax * 100) : 0;

  document.getElementById('hpFill').style.width  = hpPct  + '%';
  document.getElementById('mpFill').style.width  = mpPct  + '%';
  document.getElementById('expFill').style.width = expPct + '%';

  document.getElementById('hpCur').textContent  = state.hp;
  document.getElementById('hpMax').textContent  = state.hpMax;
  document.getElementById('hpPct').textContent  = hpPct  + '%';
  document.getElementById('mpCur').textContent  = state.mp;
  document.getElementById('mpMax').textContent  = state.mpMax;
  document.getElementById('mpPct').textContent  = mpPct  + '%';
  document.getElementById('levelDisplay').textContent = state.level;
  document.getElementById('expNext').textContent =
    `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;

  document.getElementById('statGold').textContent = state.gold.toLocaleString();
  document.getElementById('statAtk').textContent  = state.atk;
  document.getElementById('statDef').textContent  = state.def;
}

// Render inicial
renderBars();

