const state = window.gameState;
const sections = window.gameSections;

/* ─────────────────────────────────────────────
   FEED DE COMBATE IDLE
───────────────────────────────────────────── */
const combatLines = [
  { actor:'Naruto', msg:'usa', jutsu:'Rasengan', dmg:'-342' },
  { actor:'Naruto', msg:'ataca a', jutsu:'Kabuto', dmg:'-128' },
  { actor:'Kabuto',  msg:'contraataca', jutsu:'', dmg:'-89' },
  { actor:'Naruto', msg:'recupera chakra', jutsu:'', heal:'+50 MP' },
  { actor:'Naruto', msg:'usa', jutsu:'Kage Bunshin no Jutsu', dmg:'-210' },
  { actor:'Kabuto',  msg:'usa', jutsu:'Chakra Escalpelo', dmg:'-155' },
  { actor:'Naruto', msg:'bloquea el ataque de', jutsu:'Kabuto', dmg:'-0' },
  { actor:'Naruto', msg:'obtiene', jutsu:'', heal:'+80 EXP' },
  { actor:'Naruto', msg:'usa', jutsu:'Tajuu Kage Bunshin', dmg:'-480' },
  { actor:'Kabuto',  msg:'es derrotado!', jutsu:'', dmg:'' },
];

let feedIndex = 0;
function addFeedLine() {
  const feed = document.getElementById('combatFeed');
  const d = combatLines[feedIndex % combatLines.length];
  feedIndex++;

  const now = new Date();
  const time = `${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  const line = document.createElement('div');
  line.className = 'feed-line';
  line.style.animationDelay = '0s';

  const timeEl   = document.createElement('span'); timeEl.className = 'feed-time'; timeEl.textContent = time;
  const actorEl  = document.createElement('span'); actorEl.className = 'feed-actor'; actorEl.textContent = d.actor;
  const msgEl    = document.createElement('span'); msgEl.className = 'feed-msg';   msgEl.textContent = ' ' + d.msg + ' ';
  line.append(timeEl, actorEl, msgEl);

  if (d.jutsu) {
    const jutsuEl = document.createElement('span'); jutsuEl.className = 'feed-jutsu';
    jutsuEl.textContent = d.jutsu + ' ';
    line.append(jutsuEl);
  }
  if (d.dmg && d.dmg !== '-0' && d.dmg !== '') {
    const dmgEl = document.createElement('span'); dmgEl.className = 'feed-dmg';
    dmgEl.textContent = d.dmg;
    line.append(dmgEl);
  }
  if (d.heal) {
    const healEl = document.createElement('span'); healEl.className = 'feed-heal';
    healEl.textContent = d.heal;
    line.append(healEl);
  }

  feed.appendChild(line);
  feed.scrollTop = feed.scrollHeight;

  // mantener máx 30 líneas
  while (feed.children.length > 30) feed.removeChild(feed.firstChild);
}
setInterval(addFeedLine, 1600);

/* ─────────────────────────────────────────────
   SIMULACIÓN IDLE: HP, MP, EXP, GOLD
───────────────────────────────────────────── */
function updateBars() {
  // HP baja lentamente, sube con regeneración
  state.hp = Math.max(10, Math.min(state.hpMax, state.hp + (Math.random() > .65 ? 8 : -14)));
  // MP flota
  state.mp = Math.max(30, Math.min(state.mpMax, state.mp + (Math.random() > .45 ? 12 : -20)));
  // EXP sube
  state.exp = Math.min(state.expMax, state.exp + Math.floor(Math.random() * 28 + 8));
  // Gold sube
  state.gold += Math.floor(Math.random() * 12 + 3);

  const hpPct  = Math.round(state.hp  / state.hpMax  * 100);
  const mpPct  = Math.round(state.mp  / state.mpMax  * 100);
  const expPct = Math.round(state.exp / state.expMax * 100);

  document.getElementById('hpFill').style.width  = hpPct  + '%';
  document.getElementById('mpFill').style.width  = mpPct  + '%';
  document.getElementById('expFill').style.width = expPct + '%';

  document.getElementById('hpCur').textContent  = state.hp;
  document.getElementById('hpPct').textContent  = hpPct  + '%';
  document.getElementById('mpCur').textContent  = state.mp;
  document.getElementById('mpPct').textContent  = mpPct  + '%';
  document.getElementById('expNext').textContent =
    `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;
  document.getElementById('statGold').textContent = state.gold.toLocaleString();

  // color HP crítico
  const fill = document.getElementById('hpFill');
  fill.style.background = hpPct < 25
    ? 'linear-gradient(90deg,#7a1a1a,#c93b3b)'
    : 'linear-gradient(90deg,#2d9e55,#5de68c)';

  // avance misión
  state.missionProg = Math.min(100, state.missionProg + .15);
  document.getElementById('missionProg').style.width = state.missionProg + '%';
  if (state.missionProg >= 100) state.missionProg = 0;
}
setInterval(updateBars, 800);

/* ─────────────────────────────────────────────
   PARTÍCULAS
───────────────────────────────────────────── */
function spawnParticles(x, y, type = 'chakra') {
  const container = document.getElementById('particleContainer');
  const count = type === 'smoke' ? 6 : 10;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = `particle ${type}`;

    const size = type === 'smoke'
      ? Math.random() * 18 + 10
      : Math.random() * 5 + 2;
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
    const tx    = Math.cos(angle) * dist;
    const ty    = Math.sin(angle) * dist;

    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x - size/2}px; top:${y - size/2}px;
      --tx:${tx}px; --ty:${ty}px;
      animation-delay:${Math.random() * .1}s;
      animation-duration:${Math.random() * .4 + .5}s;
    `;
    container.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

/* ─────────────────────────────────────────────
   TEXTO FLOTANTE
───────────────────────────────────────────── */
function spawnFloatText(x, y, text, color = '#2ecfcf') {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.cssText = `left:${x - 30}px; top:${y - 20}px; color:${color};`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/* ─────────────────────────────────────────────
   NAVEGACIÓN DE BOTONES
───────────────────────────────────────────── */
const overlay      = document.getElementById('section-overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayDesc  = document.getElementById('overlayDesc');
const overlayClose = document.getElementById('overlayClose');

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;

    // Efecto de partículas  (smoke + chakra)
    spawnParticles(cx, cy, 'smoke');
    spawnParticles(cx, cy, 'chakra');

    const sec = btn.dataset.section;

    // texto flotante con nombre de sección
    const labels = { heroe:'HÉROE', misiones:'MISIONES', clanes:'CLANES',
                     eventos:'EVENTOS', jutsus:'JUTSUS', batallas:'BATALLAS',
                     invocaciones:'INVOCAR', habilidades:'ÁRBOL', ajustes:'AJUSTES' };
    spawnFloatText(cx, cy, '▶ ' + (labels[sec] || sec), '#e8923a');

    // Marcar activo
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeSection = sec;

    // Abrir overlay
    const info = sections[sec];
    if (info) {
      overlayTitle.innerHTML = `${info.icon} ${info.title}`;
      overlayDesc.textContent = info.desc;
      overlay.classList.add('visible');
    }
  });
});

overlayClose.addEventListener('click', () => {
  overlay.classList.remove('visible');
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  spawnParticles(cx, cy, 'amber-spark');
});



/* ─────────────────────────────────────────────
   SEED INICIAL DEL FEED
───────────────────────────────────────────── */
for (let i = 0; i < 5; i++) addFeedLine();
