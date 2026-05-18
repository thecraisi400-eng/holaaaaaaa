const layoutParts = [
  { target: 'layout-part-1', file: 'part-1.html' },
  { target: 'layout-part-2', file: 'part-2.html' },
  { target: 'layout-part-3', file: 'part-3.html' },
  { target: 'layout-part-4', file: 'part-4.html' }
];

async function loadLayout() {
  for (const part of layoutParts) {
    const container = document.getElementById(part.target);
    if (!container) continue;

    const response = await fetch(part.file);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${part.file}`);
    }

    container.innerHTML = await response.text();
  }

  const gameScript = document.createElement('script');
  gameScript.src = 'script.js';
  document.body.appendChild(gameScript);
}

loadLayout().catch((error) => {
  console.error('Error cargando layout:', error);
});
