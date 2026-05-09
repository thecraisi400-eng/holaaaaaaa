(function initBotonPrestigio(global) {
  const PRESTIGIO_HTML = `
    <section class="prestigio-overlay" aria-label="Sistema de prestigio">
      <div class="prestigio-bg" aria-hidden="true"></div>
      <article class="prestigio-scroll" role="dialog" aria-modal="true" aria-labelledby="prestigio-title">
        <button type="button" class="prestigio-close" id="prestigio-close" aria-label="Cerrar prestigio">✕</button>
        <h2 id="prestigio-title">Altar de Prestigio</h2>
        <p class="prestigio-copy">Al renacer, sellas tu progreso temporal para desbloquear poder permanente.</p>

        <div class="prestigio-stats">
          <p><strong>Nivel Actual Alcanzado:</strong> <span id="prestigio-level">1</span></p>
          <p><strong>Bono de Daño a desbloquear:</strong> <span id="prestigio-bonus">0.00</span> DPS</p>
          <p><strong>Daño Permanente Total:</strong> <span id="prestigio-total">0.00</span> DPS</p>
        </div>

        <button type="button" class="prestigio-reset" id="prestigio-reset">Reiniciar Progreso</button>
      </article>
    </section>
  `;

  function calcularBonoPrestigio(nivelActual) {
    return Math.floor(nivelActual / 30) * 0.2;
  }

  function resetearRocasSiExiste() {
    if (typeof global.resetRockHpToLevel1 === 'function') {
      global.resetRockHpToLevel1();
      return;
    }

    if (Array.isArray(global.rocas)) {
      global.rocas.forEach((roca) => {
        if (Number.isFinite(roca?.hpInicialNivel1)) {
          roca.hp = roca.hpInicialNivel1;
        } else if (Number.isFinite(roca?.hpBase)) {
          roca.hp = roca.hpBase;
        }
      });
    }
  }

  function cerrarPrestigioSuave(container) {
    const overlay = container.querySelector('.prestigio-overlay');
    if (!overlay) return;
    overlay.classList.add('is-closing');
    setTimeout(() => {
      overlay.remove();
      container.classList.remove('prestigio-mounted');
    }, 260);
  }

  function renderPrestigioSystem(container, state, onCommit) {
    if (!container || !state?.progression) return;
    container.classList.add('prestigio-mounted');
    container.innerHTML = PRESTIGIO_HTML;

    global.dañoPermanenteTotal = Number(global.dañoPermanenteTotal || 0);
    const level = Math.max(1, Number(state.progression.level || 1));
    const bono = calcularBonoPrestigio(level);
    const puedeReiniciar = level >= 30;

    container.querySelector('#prestigio-level').textContent = level;
    container.querySelector('#prestigio-bonus').textContent = bono.toFixed(2);
    container.querySelector('#prestigio-total').textContent = global.dañoPermanenteTotal.toFixed(2);

    const resetBtn = container.querySelector('#prestigio-reset');
    if (!puedeReiniciar) {
      resetBtn.style.opacity = '0.5';
      resetBtn.style.pointerEvents = 'none';
      resetBtn.title = 'Debes llegar al nivel 30 para prestigiar.';
    }

    container.querySelector('#prestigio-close')?.addEventListener('click', () => {
      cerrarPrestigioSuave(container);
    });

    resetBtn?.addEventListener('click', () => {
      global.dañoPermanenteTotal += bono;
      state.progression.level = 1;
      state.progression.exp = 0;
      state.progression.expToNext = 100;
      resetearRocasSiExiste();
      onCommit?.();
      cerrarPrestigioSuave(container);
    });
  }

  global.BotonPrestigio = { renderPrestigioSystem, calcularBonoPrestigio };
})(window);
