(function () {
    window.deferGameBoot = true;

    const overlay = document.getElementById('pre-game-overlay');
    const initialScreen = document.getElementById('initial-screen');
    const nameScreen = document.getElementById('name-screen');
    const classScreen = document.getElementById('class-screen');
    const classOptionsDiv = document.getElementById('class-options');
    const continueHelp = document.getElementById('continue-help');

    const newGameBtn = document.getElementById('new-game-btn');
    const continueBtn = document.getElementById('continue-btn');
    const acceptNameBtn = document.getElementById('accept-name-btn');
    const refreshBtn = document.getElementById('refresh-classes-btn');
    const playerNameInput = document.getElementById('player-name');

    if (!overlay || !initialScreen || !nameScreen || !classScreen) {
        return;
    }

    let perfilPendiente = {
        nombre: '',
        claseId: null
    };

    function mostrarPantalla(screen) {
        initialScreen.style.display = screen === 'inicio' ? 'flex' : 'none';
        nameScreen.style.display = screen === 'nombre' ? 'flex' : 'none';
        classScreen.style.display = screen === 'clase' ? 'flex' : 'none';
    }

    function cerrarPreGame() {
        overlay.style.display = 'none';
        window.deferGameBoot = false;

        if (typeof window.updateBars === 'function') {
            window.updateBars();
        }

        if (typeof window.actualizarPanelVisible === 'function') {
            window.actualizarPanelVisible();
        }
    }

    function iniciarPartidaNueva() {
        if (typeof window.establecerPerfilInicial === 'function') {
            window.establecerPerfilInicial({
                nombre: perfilPendiente.nombre,
                claseId: perfilPendiente.claseId,
                nivel: 1,
                xp: 0,
                oro: window.CONFIG_NIVELES?.BASE?.ORO ?? 100
            });
        }

        if (typeof window.inicializarPersonaje === 'function') {
            window.inicializarPersonaje();
        }

        if (typeof window.iniciarAutoSave === 'function') {
            window.iniciarAutoSave(5);
        }

        if (typeof window.guardarPartida === 'function') {
            window.guardarPartida({ silent: true });
        }

        cerrarPreGame();
    }

    function continuarPartida() {
        if (typeof window.inicializarJuegoDesdeGuardado === 'function') {
            const cargado = window.inicializarJuegoDesdeGuardado();
            if (cargado) {
                cerrarPreGame();
                return;
            }
        }

        alert('No se encontró una partida guardada para continuar.');
        actualizarEstadoContinuar();
    }

    function generarOpcionesClase() {
        const clases = Array.isArray(window.CLASES_NINJA) ? window.CLASES_NINJA.slice() : [];
        classOptionsDiv.innerHTML = '';

        for (let i = clases.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [clases[i], clases[j]] = [clases[j], clases[i]];
        }

        clases.slice(0, 4).forEach((clase) => {
            const option = document.createElement('div');
            option.className = 'pre-scroll-item multiline';

            const brillo = document.createElement('div');
            brillo.className = 'pre-brillo';
            option.appendChild(brillo);

            const text = document.createElement('span');
            text.className = 'pre-scroll-text';
            text.innerHTML = `${clase.nombre}<span class="pre-scroll-subtext">${clase.buff} ${clase.debuff}</span>`;
            option.appendChild(text);

            option.addEventListener('click', () => {
                perfilPendiente.claseId = clase.id;
                iniciarPartidaNueva();
            });

            classOptionsDiv.appendChild(option);
        });
    }

    function actualizarEstadoContinuar() {
        const existeGuardado = typeof window.existePartidaGuardada === 'function' && window.existePartidaGuardada();
        continueBtn.style.opacity = existeGuardado ? '1' : '0.6';
        continueHelp.textContent = existeGuardado
            ? 'Se detectó una partida guardada lista para continuar.'
            : 'No hay una partida guardada todavía. Empieza una nueva.';
    }

    newGameBtn.addEventListener('click', () => {
        playerNameInput.value = '';
        mostrarPantalla('nombre');
        playerNameInput.focus();
    });

    continueBtn.addEventListener('click', () => {
        if (typeof window.existePartidaGuardada !== 'function' || !window.existePartidaGuardada()) {
            actualizarEstadoContinuar();
            return;
        }

        continuarPartida();
    });

    acceptNameBtn.addEventListener('click', () => {
        const nombre = playerNameInput.value.trim();
        if (!nombre) {
            alert('Ingresa un nombre para tu personaje.');
            return;
        }

        perfilPendiente.nombre = nombre.slice(0, 25);
        mostrarPantalla('clase');
        generarOpcionesClase();
    });

    playerNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            acceptNameBtn.click();
        }
    });

    refreshBtn.addEventListener('click', generarOpcionesClase);

    mostrarPantalla('inicio');
    actualizarEstadoContinuar();
})();