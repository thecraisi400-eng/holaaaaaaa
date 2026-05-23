const labels = {
  heroe: 'HÉROE',
  misiones: 'MISIONES',
  clanes: 'CLANES',
  eventos: 'EVENTOS',
  jutsus: 'JUTSUS',
  batallas: 'BATALLAS',
  invocaciones: 'INVOCAR',
  atributos: 'ATRIBUTOS',
  ajustes: 'AJUSTES',
};

export function setupNavigation({ state, sections, elements, spawnParticles, spawnFloatText, onSectionOpen }) {
  const { overlay, overlayTitle, overlayDesc, overlayClose, particleContainer } = elements;

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      spawnParticles(particleContainer, cx, cy, 'smoke');
      spawnParticles(particleContainer, cx, cy, 'chakra');

      const sec = btn.dataset.section;
      spawnFloatText(cx, cy, `▶ ${labels[sec] || sec}`, '#e8923a');

      document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeSection = sec;

      const info = sections[sec];
      if (info && overlay && overlayTitle && overlayDesc) {
        const handled = onSectionOpen ? onSectionOpen(sec) : false;
        if (!handled) {
          overlayTitle.innerHTML = `${info.icon} ${info.title}`;
          overlayDesc.textContent = info.desc;
        }
        overlay.classList.add('visible');
      }
    });
  });

  if (!overlayClose || !overlay) return;

  overlayClose.addEventListener('click', () => {
    overlay.classList.remove('visible');
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    spawnParticles(particleContainer, cx, cy, 'amber-spark');
  });
}
