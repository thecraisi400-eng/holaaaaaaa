// logic-equipamiento.js
// SISTEMA DE EQUIPAMIENTO DEL HÉROE
// Basado en el script proporcionado, adaptado para tu juego

// ============================================
// VARIABLES DEL SISTEMA
// ============================================
let equipOroActual = 0;
let equipSelectedSlot = null;

// Estructura de datos del equipamiento
const equipData = {
    cabeza: { 
        name: "🪖 Cabeza", 
        level: 1, 
        gains: { ATK: 0.3, CRT: 0.02, RES: 0.8 },
        icon: "🪖"
    },
    pecho: { 
        name: "🧥 Pecho", 
        level: 1, 
        gains: { DEF: 0.4, RES: 0.8 },
        icon: "🧥"
    },
    manos: { 
        name: "🧤 Manos", 
        level: 1, 
        gains: { ATK: 0.3, SPD: 0.1, CRT: 0.02 },
        icon: "🧤"
    },
    piernas: { 
        name: "👖 Piernas", 
        level: 1, 
        gains: { DEF: 0.3, SPD: 0.1, EVA: 0.01 },
        icon: "👖"
    },
    pies: { 
        name: "👟 Pies", 
        level: 1, 
        gains: { SPD: 0.15, EVA: 0.015, RES: 0.3 },
        icon: "👟"
    },
    accesorios: { 
        name: "📿 Accesorios", 
        level: 1, 
        gains: { CRT: 0.03, EVA: 0.015, ATK: 0.2 },
        icon: "📿"
    }
};

// ============================================
// FUNCIONES DE CÁLCULO
// ============================================

/**
 * Calcula el costo de mejora según el nivel
 */
function equipGetUpgradeCost(level) {
    if (level < 6) return Math.floor(240 / 5); // 48 oro
    if (level < 15) return Math.floor(2376 / 9); // 264 oro
    if (level < 30) return Math.floor(16250 / 15); // 1083 oro
    if (level < 45) return Math.floor(41040 / 15); // 2736 oro
    return Math.floor(76320 / 15); // 5088 oro
}

/**
 * Obtiene el color del borde según el nivel
 */
function equipGetBorderColor(level) {
    if (level >= 45) return '#ffd700'; // Dorado
    if (level >= 30) return '#9c27b0'; // Morado
    if (level >= 15) return '#2196f3'; // Azul
    if (level >= 6) return '#4caf50'; // Verde
    return '#808080'; // Gris
}

/**
 * Obtiene la clase CSS para el borde según el nivel
 */
function equipGetBorderClass(level) {
    if (level >= 45) return 'equip-nivel-dorado';
    if (level >= 30) return 'equip-nivel-morado';
    if (level >= 15) return 'equip-nivel-azul';
    if (level >= 6) return 'equip-nivel-verde';
    return 'equip-nivel-gris';
}

// ============================================
// FUNCIONES DE SINCRONIZACIÓN CON PERSONAJE
// ============================================

/**
 * Sincroniza los datos con el personaje global
 */
function equipSyncWithGame() {
    if (!window.personaje) return;
    
    // Sincronizar oro
    equipOroActual = window.personaje.oro || 0;
    
    // Sincronizar niveles de equipamiento
    if (window.personaje.equipNiveles) {
        for (let slot in equipData) {
            if (window.personaje.equipNiveles[slot]) {
                equipData[slot].level = window.personaje.equipNiveles[slot];
            }
        }
    }
    
    // Actualizar UI
    equipUpdateUI();
}

/**
 * Guarda los cambios en el personaje
 */
function equipSaveToPersonaje() {
    if (!window.personaje) return;
    
    // Guardar niveles
    if (!window.personaje.equipNiveles) {
        window.personaje.equipNiveles = {};
    }
    
    for (let slot in equipData) {
        window.personaje.equipNiveles[slot] = equipData[slot].level;
    }
    
    // Actualizar bonos en el personaje
    if (typeof actualizarBonosEquipamiento === 'function') {
        actualizarBonosEquipamiento();
    }
    
    // Guardar partida
    if (typeof guardarPartida === 'function') {
        guardarPartida();
    }
}

/**
 * Establece el oro actual (llamado desde otros scripts)
 */
function equipSetGold(cantidad) {
    equipOroActual = cantidad;
    equipUpdateUI();
    
    // Si hay un popup abierto, actualizarlo
    if (equipSelectedSlot) {
        equipOpenPopup(equipSelectedSlot);
    }
}

// ============================================
// FUNCIONES DE RENDERIZADO
// ============================================

/**
 * Crea el HTML del sistema de equipamiento
 */
function equipRender() {
    const container = document.getElementById('hero-equipment-container');
    if (!container) return;
    
    const html = `

        <div class="equip-stats-box">
            <div class="equip-stat-item"><span class="equip-stat-name">⚔️ Ataque</span> <span id="equip-stat-atk">${(window.personaje?.ataque || 10) + (window.personaje?.equipBonos?.ATK || 0)}</span></div>
            <div class="equip-stat-item"><span class="equip-stat-name">🛡️ Defensa</span> <span id="equip-stat-def">${(window.personaje?.defensa || 10) + (window.personaje?.equipBonos?.DEF || 0)}</span></div>
            <div class="equip-stat-item"><span class="equip-stat-name">⚡ Velocid.</span> <span id="equip-stat-spd">${(window.personaje?.velocidad || 5) + (window.personaje?.equipBonos?.SPD || 0)}</span></div>
            <div class="equip-stat-item"><span class="equip-stat-name">🎯 Crítico</span> <span id="equip-stat-crt">${((window.personaje?.critico || 5) + (window.personaje?.equipBonos?.CRT || 0)).toFixed(2)}%</span></div>
            <div class="equip-stat-item"><span class="equip-stat-name">💨 Evasión</span> <span id="equip-stat-eva">${((window.personaje?.evasion || 2) + (window.personaje?.equipBonos?.EVA || 0)).toFixed(2)}%</span></div>
            <div class="equip-stat-item"><span class="equip-stat-name">💖 Resist.</span> <span id="equip-stat-res">${(window.personaje?.resistencia || 0) + (window.personaje?.equipBonos?.RES || 0)}</span></div>
        </div>

        <div class="equip-equipment-grid">
            ${equipRenderSlot('cabeza')}
            ${equipRenderSlot('pecho')}
            ${equipRenderSlot('manos')}
            ${equipRenderSlot('piernas')}
            ${equipRenderSlot('pies')}
            ${equipRenderSlot('accesorios')}
        </div>

        <div class="equip-gold-display" style="display:none;">Oro actual: <span id="equip-current-gold">${equipOroActual}</span> 🪙</div>

        <div class="equip-upgrade-popup" id="equip-upgrade-popup">
            <div class="equip-popup-content">
                <div class="equip-popup-title" id="equip-popup-title">Mejorar Objeto</div>
                <div class="equip-popup-details" id="equip-popup-details"></div>
                <button class="equip-upgrade-btn" id="equip-btn-upgrade" onclick="equipUpgradeItem()">Mejorar (Coste: --)</button>
                <button class="equip-close-btn" onclick="equipClosePopup()">Cerrar</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Renderiza un slot específico
 */
function equipRenderSlot(slotKey) {
    const item = equipData[slotKey];
    const borderClass = equipGetBorderClass(item.level);
    
    return `
        <div class="equip-equip-slot ${borderClass}" id="equip-slot-${slotKey}" onclick="equipOpenPopup('${slotKey}')">
            <div class="equip-equip-icon">${item.icon}</div>
            <div class="equip-equip-name">${item.name.replace(/[🪖🧥🧤👖👟📿]/g, '').trim()}</div>
            <div class="equip-equip-level" id="equip-lvl-${slotKey}">Nv. ${item.level}</div>
        </div>
    `;
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN
// ============================================

/**
 * Actualiza toda la interfaz del equipamiento
 */
function equipUpdateUI() {
    // Actualizar oro
    const goldElement = document.getElementById('equip-current-gold');
    if (goldElement) goldElement.innerText = equipOroActual;
    
    // Actualizar estadísticas con bonos
    if (window.personaje) {
        const atkElement = document.getElementById('equip-stat-atk');
        if (atkElement) atkElement.innerText = (window.personaje.ataque || 10) + (window.personaje.equipBonos?.ATK || 0);
        
        const defElement = document.getElementById('equip-stat-def');
        if (defElement) defElement.innerText = (window.personaje.defensa || 10) + (window.personaje.equipBonos?.DEF || 0);
        
        const spdElement = document.getElementById('equip-stat-spd');
        if (spdElement) spdElement.innerText = (window.personaje.velocidad || 5) + (window.personaje.equipBonos?.SPD || 0);
        
        const crtElement = document.getElementById('equip-stat-crt');
        if (crtElement) crtElement.innerText = ((window.personaje.critico || 5) + (window.personaje.equipBonos?.CRT || 0)).toFixed(2) + '%';
        
        const evaElement = document.getElementById('equip-stat-eva');
        if (evaElement) evaElement.innerText = ((window.personaje.evasion || 2) + (window.personaje.equipBonos?.EVA || 0)).toFixed(2) + '%';
        
        const resElement = document.getElementById('equip-stat-res');
        if (resElement) resElement.innerText = (window.personaje.resistencia || 0) + (window.personaje.equipBonos?.RES || 0);
        
        // Actualizar HP/MP/EXP
        const hpText = document.getElementById('equip-hp-text');
        if (hpText) hpText.innerText = `${window.personaje.hp || 100} / ${window.personaje.hpMax || 100}`;
        
        const mpText = document.getElementById('equip-mp-text');
        if (mpText) mpText.innerText = `${window.personaje.mp || 50} / ${window.personaje.mpMax || 50}`;

        const hpFillEl = document.getElementById('equip-hp-fill');
if (hpFillEl) hpFillEl.style.width = `${Math.min(100, ((window.personaje.hp || 100) / (window.personaje.hpMax || 100)) * 100)}%`;

const mpFillEl = document.getElementById('equip-mp-fill');
if (mpFillEl) mpFillEl.style.width = `${Math.min(100, ((window.personaje.mp || 50) / (window.personaje.mpMax || 50)) * 100)}%`;
        
        const expFill = document.getElementById('equip-exp-fill');
        const expText = document.getElementById('equip-exp-text');
        if (expFill && expText) {
            const expPercent = (window.personaje.xp || 0) / (window.personaje.xpRequerida || 100) * 100;
            expFill.style.width = `${Math.min(expPercent, 100)}%`;
            expText.innerText = `${expPercent.toFixed(1)}%`;
        }
    }
    
    // Actualizar cada slot
    for (let slot in equipData) {
        const item = equipData[slot];
        const lvlElement = document.getElementById(`equip-lvl-${slot}`);
        const slotElement = document.getElementById(`equip-slot-${slot}`);
        
        if (lvlElement) lvlElement.innerText = `Nv. ${item.level}`;
        if (slotElement) {
            // Remover clases de color anteriores y añadir la nueva
            slotElement.className = `equip-equip-slot ${equipGetBorderClass(item.level)}`;
        }
    }
}

// ============================================
// FUNCIONES DEL POPUP
// ============================================

/**
 * Abre el popup de mejora para un slot
 */
function equipOpenPopup(slotKey) {
    equipSelectedSlot = slotKey;
    const item = equipData[slotKey];
    const cost = equipGetUpgradeCost(item.level);

    document.getElementById('equip-popup-title').innerText = `Mejorar ${item.name}`;
    
    let statsHtml = `<b>Nivel Actual:</b> ${item.level} ➔ <b>Próximo Nivel:</b> ${item.level + 1}<br><br>`;
    statsHtml += `<b>Estadísticas Ganadas (+1 Nivel):</b><br>`;
    
    for (let stat in item.gains) {
        let isPercentage = (stat === 'CRT' || stat === 'EVA') ? '%' : '';
        statsHtml += `• ${stat}: +${item.gains[stat]}${isPercentage}<br>`;
    }
    
    document.getElementById('equip-popup-details').innerHTML = statsHtml;
    
    const btn = document.getElementById('equip-btn-upgrade');
    btn.innerText = `Mejorar (Oro: ${cost})`;
    
    // Bloquear botón si no hay oro suficiente
    if (equipOroActual < cost) {
        btn.style.backgroundColor = 'gray';
        btn.disabled = true;
    } else {
        btn.style.backgroundColor = '#4CAF50';
        btn.disabled = false;
    }

    document.getElementById('equip-upgrade-popup').style.display = 'flex';
}

/**
 * Cierra el popup de mejora
 */
function equipClosePopup() {
    document.getElementById('equip-upgrade-popup').style.display = 'none';
    equipSelectedSlot = null;
}

/**
 * Mejora el item seleccionado
 */
function equipUpgradeItem() {
    if (!equipSelectedSlot) return;
    
    const item = equipData[equipSelectedSlot];
    const cost = equipGetUpgradeCost(item.level);

    if (equipOroActual >= cost) {
        equipOroActual -= cost;
        item.level += 1;
        
        // Sincronizar con personaje
        if (window.personaje) {
            window.personaje.oro = equipOroActual;
            equipSaveToPersonaje();
        }
        
        equipUpdateUI();
        equipOpenPopup(equipSelectedSlot); // Refresca el popup
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa el sistema de equipamiento
 */
function equipInit() {
    console.log('Inicializando sistema de equipamiento...');
    
    // Sincronizar con personaje
    equipSyncWithGame();
    
    // Renderizar el contenido
    equipRender();
    
    console.log('Sistema de equipamiento listo');
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.equipSystem = {
    init: equipInit,
    syncWithGame: equipSyncWithGame,
    updateUI: equipUpdateUI,
    setGold: equipSetGold,
    openPopup: equipOpenPopup,
    closePopup: equipClosePopup,
    upgradeItem: equipUpgradeItem
};

// Funciones globales para los onclick
window.equipOpenPopup = equipOpenPopup;
window.equipClosePopup = equipClosePopup;
window.equipUpgradeItem = equipUpgradeItem;
function toggleHeroEquipment(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    var heroContainer = document.getElementById('hero-equipment-container');
    var isVisible = heroContainer && heroContainer.style.display === 'block';
    if (typeof closeAllPanels === 'function') closeAllPanels();
    if (!isVisible) {
        if (heroContainer) {
            heroContainer.style.display = 'block';
            equipInit();
        }
    }
}
window.toggleHeroEquipment = toggleHeroEquipment;
console.log('logic-equipamiento.js cargado correctamente');