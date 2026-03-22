// script.js
// Estas variables ahora se sincronizarán con el personaje de logic-niveles.js
// Variables para el sistema de equipamiento
let equipVisible = false;
let misionesVisible = false;
let arbolVisible = false;
let maxHp = 100; // Se actualizará desde personaje.hpMax
let currentHp = 100; // Se actualizará desde personaje.hp
let maxMp = 50; // Se actualizará desde personaje.mpMax
let currentMp = 50; // Se actualizará desde personaje.mp
let isRegenerating = true;

// Referencia al personaje global
const personajeRef = window.personaje || null;

const hpFill = document.getElementById('hp-fill');
const hpText = document.getElementById('hp-text');
const mpFill = document.getElementById('mp-fill');
const mpText = document.getElementById('mp-text');
const heroPortrait = document.querySelector('.hero-portrait');

function updateBars() {
    // Sincronizar con personaje si existe
    if (window.personaje) {
        maxHp = window.personaje.hpMax;
        currentHp = window.personaje.hp;
        maxMp = window.personaje.mpMax;
        currentMp = window.personaje.mp;
    }

    const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    const mpPercent = Math.max(0, Math.min(100, (currentMp / maxMp) * 100));

    hpFill.style.width = hpPercent + '%';
    mpFill.style.width = mpPercent + '%';

    hpText.innerText = `${hpPercent.toFixed(1)}% (${Math.floor(currentHp)}/${maxHp})`;
    mpText.innerText = `${mpPercent.toFixed(1)}% (${Math.floor(currentMp)}/${maxMp})`;

    if (hpPercent < 20) {
        heroPortrait.classList.add('danger-hp');
        hpFill.style.backgroundColor = '#d32f2f';
    } else {
        heroPortrait.classList.remove('danger-hp');
        hpFill.style.backgroundColor = 'var(--hp-color)';
    }
}

window.updateBars = updateBars;

setInterval(() => {
    if (!isRegenerating || isPanelVisible('missions-overlay-container', 'flex') || window.combateActivo) return;

    // Regeneración solo si existe el personaje
    if (window.personaje) {
        if (window.personaje.hp < window.personaje.hpMax) {
            window.personaje.hp = Math.min(window.personaje.hpMax, window.personaje.hp + Math.ceil(window.personaje.hpMax * 0.015));
        }
        if (window.personaje.mp < window.personaje.mpMax) {
            window.personaje.mp = Math.min(window.personaje.mpMax, window.personaje.mp + Math.ceil(window.personaje.mpMax * 0.015));
        }
    }

    updateBars();
}, 1000);

function triggerEffect(e) {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');

    const existingRipple = btn.querySelector('.ripple');
    if (existingRipple) { existingRipple.remove(); }

    btn.appendChild(circle);

    // EFECTO RIPPLE - NO TOCAR

    // Remover el ripple después de la animación
    setTimeout(() => {
        circle.remove();
    }, 600);
}

function isPanelVisible(id, visibleDisplay = null) {
    const panel = document.getElementById(id);
    if (!panel) return false;

    if (visibleDisplay) {
        return panel.style.display === visibleDisplay;
    }

    return panel.style.display !== 'none' && panel.style.display !== '';
}

function showMissionContent() {
    const missionContent = document.querySelector('.mission-content');
    if (missionContent) {
        missionContent.style.display = 'flex';
    }
}

function hideMissionContent() {
    const missionContent = document.querySelector('.mission-content');
    if (missionContent) {
        missionContent.style.display = 'none';
    }
}

// NUEVA FUNCIÓN: Alternar visibilidad del sistema de equipamiento
function toggleHeroEquipment(e) {
    // Prevenir que el evento se propague
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const container = document.getElementById('hero-equipment-container');
    const centerArea = document.querySelector('.center-area');

    if (!container) {
        console.error('No se encontró el contenedor de equipamiento');
        return;
    }

    if (!centerArea) {
        console.error('No se encontró el área central');
        return;
    }

    const estaVisible = isPanelVisible('hero-equipment-container', 'block');
    equipVisible = !estaVisible;

    if (typeof window.closeJutsus === 'function') window.closeJutsus();

    if (!estaVisible) {
        // Ocultar el contenido normal y mostrar el equipamiento
        hideMissionContent();
        container.style.display = 'block';

        // Actualizar el oro desde window.personaje si existe
        if (window.equipSystem && typeof window.equipSystem.syncWithGame === 'function') {
            window.equipSystem.syncWithGame();
        }

        // Forzar actualización de la UI del equipamiento
        if (window.equipSystem && typeof window.equipSystem.updateUI === 'function') {
            window.equipSystem.updateUI();
        }
    } else {
        // Mostrar el contenido normal y ocultar el equipamiento
        showMissionContent();
        container.style.display = 'none';
    }

    equipVisible = !estaVisible;
    console.log('Sistema de equipamiento:', !estaVisible ? 'visible' : 'oculto');
}

// Función para cerrar el equipamiento (puede ser llamada desde otros scripts)
function closeHeroEquipment() {
    const container = document.getElementById('hero-equipment-container');
    if (!container) return;

    container.style.display = 'none';
    equipVisible = false;
    showMissionContent();
}

function toggleMisiones(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    if (isPanelVisible('hero-equipment-container', 'block')) closeHeroEquipment();
    if (isPanelVisible('arbol-overlay-container')) closeArbol();
    if (typeof window.closeJutsus === 'function') window.closeJutsus();

    const ajustesPanel = document.getElementById('ajustes-overlay-container');
    if (ajustesPanel && ajustesPanel.style.display === 'flex') {
        ajustesPanel.style.display = 'none';
    }

    const overlay = document.getElementById('missions-overlay-container');
    if (!overlay) return;

    const estaVisible = isPanelVisible('missions-overlay-container', 'flex');
    misionesVisible = !estaVisible;

    if (!estaVisible) {
        hideMissionContent();
        overlay.style.display = 'flex';
        if (window.misionesSystem && typeof window.misionesSystem.init === 'function') {
            window.misionesSystem.init();
        }
    } else {
        showMissionContent();
        overlay.style.display = 'none';
    }
}

function closeMisiones() {
    const overlay = document.getElementById('missions-overlay-container');
    if (!overlay) return;

    overlay.style.display = 'none';
    misionesVisible = false;
    showMissionContent();

    if (window.misionesSystem && window.misionesSystem.stopBattle) {
        window.misionesSystem.stopBattle();
    }
}

function toggleArbol(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isPanelVisible('hero-equipment-container', 'block')) closeHeroEquipment();
    if (isPanelVisible('missions-overlay-container', 'flex')) closeMisiones();
    if (typeof window.closeJutsus === 'function') window.closeJutsus();

    const ajustesPanel = document.getElementById('ajustes-overlay-container');
    if (ajustesPanel && ajustesPanel.style.display === 'flex') ajustesPanel.style.display = 'none';

    const overlay = document.getElementById('arbol-overlay-container');
    if (!overlay) {
        if (window.arbolSystem && typeof window.arbolSystem.init === 'function') window.arbolSystem.init();
        const overlayCreado = document.getElementById('arbol-overlay-container');
        if (!overlayCreado) return;
        arbolVisible = true;
        hideMissionContent();
        overlayCreado.style.display = 'block';
        return;
    }

    const estaVisible = isPanelVisible('arbol-overlay-container');
    arbolVisible = !estaVisible;

    if (!estaVisible) {
        hideMissionContent();
        overlay.style.display = 'block';
        if (window.arbolSystem && typeof window.arbolSystem.init === 'function') window.arbolSystem.init();
    } else {
        showMissionContent();
        overlay.style.display = 'none';
    }
}
function closeArbol() {
    const overlay = document.getElementById('arbol-overlay-container');
    if (!overlay) return;

    overlay.style.display = 'none';
    arbolVisible = false;
    showMissionContent();
}
window.toggleArbol = toggleArbol;
window.closeArbol = closeArbol;

window.onload = () => {
    // Sincronizar con personaje si ya existe
    if (window.personaje) {
        maxHp = window.personaje.hpMax;
        currentHp = window.personaje.hp;
        maxMp = window.personaje.mpMax;
        currentMp = window.personaje.mp;
    }
    updateBars();

    // Inicializar el contenedor de equipamiento como oculto
    const container = document.getElementById('hero-equipment-container');
    const centerArea = document.querySelector('.center-area');

    if (container && centerArea) {
        container.style.display = 'none';

        // Asegurar que el contenedor tenga la misma altura que el área central
        container.style.height = centerArea.offsetHeight + 'px';

        // Si hay sistema de equipamiento global, inicializarlo
        if (window.equipSystem && typeof window.equipSystem.init === 'function') {
            window.equipSystem.init();
        }
    }

    // Añadir event listeners a todos los botones excepto el de héroe
    const buttons = document.querySelectorAll('.menu-btn');
    buttons.forEach(btn => {
        if (btn.innerHTML.includes('👤')) {
            // Este es el botón héroe, ya tiene su propio onclick
            return;
        }

        // Para los demás botones, cerrar el equipamiento si está abierto
        btn.addEventListener('click', function() {
if (typeof cancelarCombate === 'function') {
                cancelarCombate();
            }
            if (isPanelVisible('hero-equipment-container', 'block')) {
                closeHeroEquipment();
            }
        });
    });
};

// Función para actualizar oro en el sistema de equipamiento
function updateEquipGold() {
    if (window.equipSystem && typeof window.equipSystem.setGold === 'function') {
        window.equipSystem.setGold(window.personaje?.oro || 0);
    }
}

// Escuchar cambios en el oro
if (window.personaje) {
    // Proxy para detectar cambios en personaje.oro
    let oroValue = window.personaje.oro;
    Object.defineProperty(window.personaje, 'oro', {
        get: function() { return oroValue; },
        set: function(newValue) {
            oroValue = newValue;
            updateEquipGold();
        }
    });
}