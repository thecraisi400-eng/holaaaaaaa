(() => {
  function crearIframeMisionesRango() {
    const iframe = document.createElement('iframe');
    iframe.className = 'misiones-rango-iframe';
    iframe.title = 'MISIONES RANGO';
    iframe.loading = 'lazy';
    iframe.src = 'misiones-rango.html';
    return iframe;
  }

  window.misionesCombate = {
    montarSistemaMisionesRango(container) {
      container.replaceChildren();
      const iframe = crearIframeMisionesRango();
      container.appendChild(iframe);
      return () => {
        iframe.src = 'about:blank';
        iframe.remove();
      };
    }
  };
})();
