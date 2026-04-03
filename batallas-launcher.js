(() => {
  function renderBatallasSection(container) {
    if (!container) return;

    container.replaceChildren();

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';

    const frame = document.createElement('iframe');
    frame.src = 'batallas-game.html';
    frame.title = 'Batallas Ninja';
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.border = '0';
    frame.style.background = '#0d1117';

    wrapper.appendChild(frame);
    container.appendChild(wrapper);
  }

  window.renderBatallasSection = renderBatallasSection;
})();
