export function spawnParticles(container, x, y, type = 'chakra') {
  if (!container) return;

  const count = type === 'smoke' ? 6 : 10;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = `particle ${type}`;

    const size = type === 'smoke'
      ? Math.random() * 18 + 10
      : Math.random() * 5 + 2;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (type === 'smoke' ? 45 : 55) + 10;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x - size / 2}px; top:${y - size / 2}px;
      --tx:${tx}px; --ty:${ty}px;
      animation-delay:${Math.random() * 0.1}s;
      animation-duration:${Math.random() * 0.4 + 0.5}s;
    `;
    container.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}
