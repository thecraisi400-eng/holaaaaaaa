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

