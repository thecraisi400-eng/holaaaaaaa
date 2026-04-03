(() => {
  function ensureHudVisible() {
    const hudTop = document.getElementById('hud-top');
    const hudBottom = document.getElementById('hud-bottom');
    const hudCenter = document.getElementById('hud-center');

    [hudTop, hudBottom, hudCenter].forEach((node) => {
      if (!node) return;
      node.style.display = '';
      node.style.visibility = 'visible';
      node.style.opacity = '';
    });
  }

  function renderBatallasSection(container) {
    if (!container) return;

    ensureHudVisible();
    container.replaceChildren();

    const wrapper = document.createElement('div');
    wrapper.className = 'batallas-frame-wrapper';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.minHeight = '0';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'stretch';
    wrapper.style.justifyContent = 'stretch';

    const frame = document.createElement('iframe');
    frame.src = 'batallas-game.html';
    frame.title = 'Batallas Ninja';
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.minHeight = '0';
    frame.style.border = '0';
    frame.style.background = '#0d1117';

    wrapper.appendChild(frame);
    container.appendChild(wrapper);
  }

  window.renderBatallasSection = renderBatallasSection;
})();
