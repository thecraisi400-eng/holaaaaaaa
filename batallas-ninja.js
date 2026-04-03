(() => {
  function createBatallasNinjaUI({ container }) {
    const root = document.createElement('div');
    root.className = 'batallas-ninja-host';

    const iframe = document.createElement('iframe');
    iframe.className = 'batallas-ninja-frame';
    iframe.title = 'Batallas Ninja';
    iframe.loading = 'eager';
    iframe.src = 'batallas-ninja-template.html';
    iframe.setAttribute('aria-label', 'Sección Batallas Ninja');

    root.appendChild(iframe);
    container.replaceChildren(root);

    return {
      destroy() {
        iframe.src = 'about:blank';
        root.remove();
      }
    };
  }

  window.createBatallasNinjaUI = createBatallasNinjaUI;
})();
