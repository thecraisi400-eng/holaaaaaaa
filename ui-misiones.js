(() => {
  function crearBoton({ className, text }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    return button;
  }

  function renderMisionesMenu(mountNode, controller) {
    mountNode.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'misiones-system';

    const title = document.createElement('div');
    title.className = 'misiones-title';
    title.textContent = '── MENÚ DE MISIONES ──';

    const rangeBtn = crearBoton({
      className: 'misiones-entry misiones-entry-rango',
      text: '⚔️ MISIONES RANGO ⚔️'
    });

    const placeholderBtn = crearBoton({
      className: 'misiones-entry',
      text: '📦 Próximamente más sistemas'
    });
    placeholderBtn.disabled = true;

    const body = document.createElement('div');
    body.className = 'misiones-list';
    body.append(rangeBtn, placeholderBtn);

    const host = document.createElement('div');
    host.className = 'misiones-host hidden';

    const backBtn = crearBoton({
      className: 'misiones-back-btn',
      text: '⬅️ Volver a HÉROE'
    });

    const closeSystemBtn = crearBoton({
      className: 'misiones-back-btn hidden',
      text: '⬅️ Volver al menú de MISIONES'
    });

    wrap.append(title, body, host, closeSystemBtn, backBtn);
    mountNode.appendChild(wrap);

    let desmontarSistema = null;

    const abrirSistemaRango = () => {
      if (typeof desmontarSistema === 'function') {
        desmontarSistema();
      }
      body.classList.add('hidden');
      host.classList.remove('hidden');
      closeSystemBtn.classList.remove('hidden');
      desmontarSistema = window.misionesCombate.montarSistemaMisionesRango(host);
    };

    const cerrarSistemaRango = () => {
      if (typeof desmontarSistema === 'function') {
        desmontarSistema();
        desmontarSistema = null;
      }
      host.classList.add('hidden');
      host.replaceChildren();
      closeSystemBtn.classList.add('hidden');
      body.classList.remove('hidden');
    };

    rangeBtn.addEventListener('click', abrirSistemaRango, { signal: controller.signal });
    closeSystemBtn.addEventListener('click', cerrarSistemaRango, { signal: controller.signal });

    return { backBtn, abrirSistemaRango, cerrarSistemaRango };
  }

  window.uiMisiones = {
    mountMisionesSection({ mountNode, onBackToHero, autoOpenRango = false }) {
      const controller = new AbortController();
      const { backBtn, abrirSistemaRango, cerrarSistemaRango } = renderMisionesMenu(mountNode, controller);

      backBtn.addEventListener('click', () => {
        cerrarSistemaRango();
        onBackToHero?.();
      }, { signal: controller.signal });

      if (autoOpenRango) {
        abrirSistemaRango();
      }

      return () => {
        controller.abort();
        cerrarSistemaRango();
        mountNode.replaceChildren();
      };
    }
  };
})();
