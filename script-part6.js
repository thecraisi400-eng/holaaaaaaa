overlayClose.addEventListener('click', () => {
  overlay.classList.remove('visible');
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  spawnParticles(cx, cy, 'amber-spark');
});
