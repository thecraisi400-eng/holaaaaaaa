function getRandomElement(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function createAtributosController({ overlayTitle, overlayDesc }) {
  const atributosState = {
    nivel: 1,
    xpActual: 0,
    xpMax: 100,
    puntosDisponibles: 0,
    dpsActual: 1,
    filoNivel: 0,
    filoCosto: 1,
    filoMultiplicador: 1.45,
  };

  const initialCostOptions = [1.5, 1.9, 2.2, 2.5, 3.1, 3.5];
  const incrementOptions = [0.1, 0.17, 0.25, 0.29];

  function renderAtributos() {
    if (!overlayTitle || !overlayDesc) return;

    overlayTitle.innerHTML = '<span class="atributos-title">💪 Atributos</span>';
    overlayDesc.innerHTML = `
      <section class="atributos-panel">
        <div class="atributos-stats">
          <div class="atributo-item"><strong>Nivel</strong><span>${atributosState.nivel}</span></div>
          <div class="atributo-item"><strong>XP</strong><span>${atributosState.xpActual}/${atributosState.xpMax}</span></div>
          <div class="atributo-item"><strong>Puntos Disponibles</strong><span>${atributosState.puntosDisponibles}</span></div>
        </div>

        <div class="atributos-scroll" id="scroll-filo-carbono">
          <div class="scroll-header">
            <h3>Filo de Carbono</h3>
            <p>Incrementa el daño automático DPS infligido al tronco en cada golpe automático.</p>
          </div>
          <div class="scroll-meta">
            <span>Nivel: <b>${atributosState.filoNivel}</b></span>
            <span>DPS actual: <b>${atributosState.dpsActual.toFixed(2)}</b></span>
            <span>Multiplicador actual: <b>x${atributosState.filoMultiplicador.toFixed(2)}</b></span>
            <span>Costo próximo: <b>${atributosState.filoCosto}</b> punto(s)</span>
          </div>
          <button class="scroll-upgrade-btn" id="btn-filo-upgrade" type="button">Mejorar</button>
        </div>

        <div class="atributos-scroll atributos-scroll-empty"></div>
        <div class="atributos-scroll atributos-scroll-empty"></div>
        <div class="atributos-scroll atributos-scroll-empty"></div>
        <div class="atributos-scroll atributos-scroll-empty"></div>
      </section>
    `;

    const upgradeButton = document.getElementById('btn-filo-upgrade');
    if (upgradeButton) {
      upgradeButton.addEventListener('click', () => {
        if (atributosState.puntosDisponibles < atributosState.filoCosto) return;

        atributosState.puntosDisponibles -= atributosState.filoCosto;
        atributosState.filoNivel += 1;
        atributosState.dpsActual *= atributosState.filoMultiplicador;

        if (atributosState.filoNivel === 1) {
          atributosState.filoCosto = getRandomElement(initialCostOptions);
        } else {
          atributosState.filoMultiplicador += getRandomElement(incrementOptions);
          atributosState.filoCosto = getRandomElement(initialCostOptions);
        }

        renderAtributos();
      });
    }
  }

  return {
    renderAtributos,
  };
}
