// logic-niveles.js
// SISTEMA DE PROGRESIÓN DE PERSONAJE (LVL 1 - 100)
// Autor: Para Uchiha Sasuke

// ============================================
// CONFIGURACIÓN BASE DEL PERSONAJE
// ============================================

const CONFIG_NIVELES = {
    // Estadísticas base para nivel 1
BASE: {
    HP: 100,
    MP: 100,
    ATAQUE: 25,
    DEFENSA: 20,
    VELOCIDAD: 100,
    CRITICO: 8,
    EVASION: 5,
    RESISTENCIA: 80,
    ORO: 100,
    XP: 0
},
    
    // Incrementos por nivel (por cada nivel subido)
INCREMENTOS: {
    HP: 25,
    MP: 15,
    ATAQUE: 12,
    DEFENSA: 8,
    VELOCIDAD: 2,
    CRITICO: 0.35,
    EVASION: 0.20,
    RESISTENCIA: 15
},
    
    // Límites máximos
    LIMITES: {
        CRITICO_MAX: 30,  // Máximo 30% de crítico
        EVASION_MAX: 17,  // Máximo 17% de evasión
        NIVEL_MAX: 100    // Nivel máximo
    }
};

// ============================================
// FUNCIONES DE CÁLCULO DE ESTADÍSTICAS
// ============================================

/**
 * Calcula la experiencia requerida para un nivel específico
 * Fórmula: XP_Req = 67.5 * (Nivel ^ 2)
 */
function calcularXPRequerida(nivel) {
    if (nivel <= 1) return 0;
    if (nivel > CONFIG_NIVELES.LIMITES.NIVEL_MAX) return Infinity;
    return Math.floor(67.5 * (nivel * nivel));
}

/**
 * Calcula el HP basado en el nivel
 */
function calcularHP(nivel) {
    return CONFIG_NIVELES.BASE.HP + (CONFIG_NIVELES.INCREMENTOS.HP * (nivel - 1));
}

/**
 * Calcula el MP basado en el nivel
 */
function calcularMP(nivel) {
    return CONFIG_NIVELES.BASE.MP + (CONFIG_NIVELES.INCREMENTOS.MP * (nivel - 1));
}

/**
 * Calcula el ataque basado en el nivel
 */
function calcularAtaque(nivel) {
    return CONFIG_NIVELES.BASE.ATAQUE + (CONFIG_NIVELES.INCREMENTOS.ATAQUE * (nivel - 1));
}

/**
 * Calcula la defensa basado en el nivel
 */
function calcularDefensa(nivel) {
    return CONFIG_NIVELES.BASE.DEFENSA + (CONFIG_NIVELES.INCREMENTOS.DEFENSA * (nivel - 1));
}

/**
 * Calcula la velocidad basado en el nivel
 */
function calcularVelocidad(nivel) {
    return CONFIG_NIVELES.BASE.VELOCIDAD + (CONFIG_NIVELES.INCREMENTOS.VELOCIDAD * (nivel - 1));
}

/**
 * Calcula el crítico basado en el nivel (con límite máximo)
 */
function calcularCritico(nivel) {
    let critico = CONFIG_NIVELES.BASE.CRITICO + (CONFIG_NIVELES.INCREMENTOS.CRITICO * (nivel - 1));
    return Math.min(critico, CONFIG_NIVELES.LIMITES.CRITICO_MAX);
}

/**
 * Calcula la evasión basado en el nivel (con límite máximo)
 */
function calcularEvasion(nivel) {
    let evasion = CONFIG_NIVELES.BASE.EVASION + (CONFIG_NIVELES.INCREMENTOS.EVASION * (nivel - 1));
    return Math.min(evasion, CONFIG_NIVELES.LIMITES.EVASION_MAX);
}

/**
 * Calcula la resistencia basado en el nivel
 */
function calcularResistencia(nivel) {
    return CONFIG_NIVELES.BASE.RESISTENCIA + (CONFIG_NIVELES.INCREMENTOS.RESISTENCIA * (nivel - 1));
}

/**
 * Calcula el rango basado en el nivel
 */
function calcularRango(nivel) {
    if (nivel <= 10) return "Genin";
    if (nivel <= 30) return "Chunin";
    if (nivel <= 60) return "Jonin";
    if (nivel <= 80) return "Anbu";
    return "Kage";
}

// ============================================
// OBJETO DEL PERSONAJE (UCHIHA SASUKE)
// ============================================

let personaje = {
    // Información básica
    nombre: "Uchiha Sasuke",
    nivel: 1,
    rango: "Genin",
    
    // Estadísticas principales (visibles en panel)
    hp: CONFIG_NIVELES.BASE.HP,
    hpMax: CONFIG_NIVELES.BASE.HP,
    mp: CONFIG_NIVELES.BASE.MP,
    mpMax: CONFIG_NIVELES.BASE.MP,
    ataque: CONFIG_NIVELES.BASE.ATAQUE,
    defensa: CONFIG_NIVELES.BASE.DEFENSA,
    oro: CONFIG_NIVELES.BASE.ORO,
    xp: 0,
    xpRequerida: calcularXPRequerida(2), // XP para llegar a nivel 2
    
    // Estadísticas ocultas (para futuras implementaciones)
    velocidad: CONFIG_NIVELES.BASE.VELOCIDAD,
    critico: CONFIG_NIVELES.BASE.CRITICO,
    evasion: CONFIG_NIVELES.BASE.EVASION,
    resistencia: CONFIG_NIVELES.BASE.RESISTENCIA,
    // Sistema de Equipamiento (Lo nuevo que pegas)
    equipNiveles: {
        cabeza: 1,
        pecho: 1,
        manos: 1,
        piernas: 1,
        pies: 1,
        accesorios: 1
    },
    equipBonos: {
        ATK: 0,
        DEF: 0,
        SPD: 0,
        CRT: 0,
        EVA: 0,
        RES: 0
    }

    ,
    arbolBonos: {
        hp: 0,
        ataque: 0,
        defensa: 0,
        velocidad: 0,
        critico: 0,
        evasion: 0
    }

};

// ============================================
// FUNCIONES DE ACTUALIZACIÓN
// ============================================

/**
 * Actualiza todas las estadísticas del personaje basado en su nivel actual
 */
function actualizarEstadisticasPorNivel() {
    const nivel = personaje.nivel;
    
    // Actualizar máximos
    personaje.hpMax = calcularHP(nivel);
    personaje.mpMax = calcularMP(nivel);
    personaje.ataque = calcularAtaque(nivel);
    personaje.defensa = calcularDefensa(nivel);
    personaje.velocidad = calcularVelocidad(nivel);
    personaje.critico = calcularCritico(nivel);
    personaje.evasion = calcularEvasion(nivel);
    personaje.resistencia = calcularResistencia(nivel);
    personaje.rango = calcularRango(nivel);
        
    // Calcular bonos de equipamiento
    const equipBonos = window.calcularBonosEquipamiento ? 
        window.calcularBonosEquipamiento(personaje.equipNiveles) : 
        { ATK: 0, DEF: 0, SPD: 0, CRT: 0, EVA: 0, RES: 0 };
    personaje.equipBonos = equipBonos;
    
    // Actualizar XP requerida para siguiente nivel
    personaje.xpRequerida = calcularXPRequerida(nivel + 1);
    
    // Restaurar HP y MP al máximo al subir nivel
    personaje.hp = personaje.hpMax;
    personaje.mp = personaje.mpMax;
}

/**
 * Añade experiencia al personaje y verifica si sube de nivel
 */
function ganarExperiencia(cantidad) {
    if (!cantidad || cantidad <= 0) return false;
    
    // Mostrar notificación de XP ganada (si existe el sistema)
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(`+${cantidad} XP`, "xp");
    }
    
    personaje.xp += cantidad;
    let nivelInicial = personaje.nivel;
    let subioNivel = false;
    
    // Verificar si puede subir múltiples niveles
    while (personaje.xp >= personaje.xpRequerida && personaje.nivel < CONFIG_NIVELES.LIMITES.NIVEL_MAX) {
        // Restar la XP requerida
        personaje.xp -= personaje.xpRequerida;
        
        // Subir de nivel
        personaje.nivel++;
        subioNivel = true;
        
        // Actualizar estadísticas por el nuevo nivel
        actualizarEstadisticasPorNivel();
        
        // Mostrar notificación de nivel subido
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(`¡NIVEL ${personaje.nivel}!`, "nivel");
        }
    }
    
    // Si subió de nivel, actualizar el panel visible
    if (subioNivel) {
        actualizarPanelVisible();
    } else {
        // Si solo ganó XP pero no subió nivel, actualizar solo la barra de XP
        actualizarBarraXP();
    }
    
    // Guardar partida automáticamente
    if (typeof guardarPartida === 'function') {
        guardarPartida();
    }
    
    return subioNivel;
}

/**
 * Añade oro al personaje
 */
function ganarOro(cantidad) {
    if (!cantidad || cantidad <= 0) return;
    
    personaje.oro += cantidad;
    
    // Mostrar notificación
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(`+${cantidad} Oro`, "oro");
    }
    
    // Actualizar el oro en el panel
    actualizarOroPanel();
    
    // Guardar partida
    if (typeof guardarPartida === 'function') {
        guardarPartida();
    }
}

/**
 * Resta oro del personaje (para compras)
 */
function gastarOro(cantidad) {
    if (!cantidad || cantidad <= 0) return false;
    if (personaje.oro < cantidad) return false;
    
    personaje.oro -= cantidad;
    actualizarOroPanel();
    
    if (typeof guardarPartida === 'function') {
        guardarPartida();
    }
    
    return true;
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN DEL PANEL VISIBLE
// ============================================

/**
 * Actualiza SOLO los elementos visibles en el panel
 * (Tal como pediste: ataque, defensa, oro, experiencia)
 */
function actualizarPanelVisible() {
    const nivelElement = document.getElementById('hero-level');
    if (nivelElement) nivelElement.textContent = personaje.nivel;

    const rangoElement = document.getElementById('rango-valor');
    if (rangoElement) rangoElement.textContent = personaje.rango;
    // Actualizar ataque en el panel
    const ataqueElement = document.getElementById('ataque-valor') || document.querySelector('.stat-ataque');
    if (ataqueElement) {
        ataqueElement.textContent = personaje.ataque + (personaje.equipBonos?.ATK || 0) + (personaje.arbolBonos?.ataque || 0);
    }
    
    // Actualizar defensa en el panel
    const defensaElement = document.getElementById('defensa-valor') || document.querySelector('.stat-defensa');
    if (defensaElement) {
        defensaElement.textContent = personaje.defensa + (personaje.equipBonos?.DEF || 0) + (personaje.arbolBonos?.defensa || 0);
    }
    
    // Actualizar oro en el panel
    actualizarOroPanel();
    
    // Actualizar barra de XP
    actualizarBarraXP();
    
    // Actualizar HP y MP (aunque no son visibles, los necesitas internamente)
    actualizarBarrasVitales();
}

/**
 * Actualiza específicamente el oro en el panel
 */
function actualizarOroPanel() {
    const oroElement = document.getElementById('oro-valor') || document.querySelector('.stat-oro');
    if (oroElement) {
        oroElement.textContent = personaje.oro;
    }
}

/**
 * Actualiza la barra de experiencia
 */
function actualizarBarraXP() {
const xpBar = document.getElementById('xp-fill');
    const xpTexto = document.getElementById('xp-text');
    const xpPorcentaje = document.getElementById('xp-porcentaje');

    const porcentaje = personaje.xpRequerida > 0
        ? (personaje.xp / personaje.xpRequerida) * 100
        : 0;

    if (xpBar) {
        xpBar.style.width = `${Math.min(porcentaje, 100)}%`;
    }

    if (xpTexto) {
        xpTexto.textContent = `${personaje.xp} / ${personaje.xpRequerida} XP`;
    }

    if (xpPorcentaje) {
        xpPorcentaje.textContent = `${Math.floor(porcentaje)}%`;
    }
}

/**
 * Actualiza las barras de HP y MP
 */
function actualizarBarrasVitales() {
    // Barra de HP
    const hpBar = document.getElementById('hp-barra') || document.querySelector('.barra-hp');
    if (hpBar) {
        const porcentajeHP = (personaje.hp / personaje.hpMax) * 100;
        hpBar.style.width = `${Math.max(porcentajeHP, 0)}%`;
    }
    
    // Barra de MP
    const mpBar = document.getElementById('mp-barra') || document.querySelector('.barra-mp');
    if (mpBar) {
        const porcentajeMP = (personaje.mp / personaje.mpMax) * 100;
        mpBar.style.width = `${Math.max(porcentajeMP, 0)}%`;
    }
    
    // Texto de HP si existe
    const hpTexto = document.getElementById('hp-texto') || document.querySelector('.hp-actual');
    if (hpTexto) {
        hpTexto.textContent = `${Math.floor(personaje.hp)}/${personaje.hpMax}`;
    }
    
    // Texto de MP si existe
    const mpTexto = document.getElementById('mp-texto') || document.querySelector('.mp-actual');
    if (mpTexto) {
        mpTexto.textContent = `${Math.floor(personaje.mp)}/${personaje.mpMax}`;
    }
}

// ============================================
// FUNCIÓN DE INICIALIZACIÓN
// ============================================

/**
 * Inicializa el personaje con los valores de nivel 1
 */
function inicializarPersonaje() {
    // Asegurar que el nombre sea Uchiha Sasuke
    personaje.nombre = "Uchiha Sasuke";
    
    // Resetear a nivel 1
    personaje.nivel = 1;
    personaje.xp = 0;
    personaje.oro = CONFIG_NIVELES.BASE.ORO;
    
    // Calcular todas las estadísticas para nivel 1
    actualizarEstadisticasPorNivel();
    
    // Actualizar el panel visible
    actualizarPanelVisible();
    
    console.log("Personaje inicializado: Uchiha Sasuke (Nivel 1)");
    console.log(`Estadísticas: ATK ${personaje.ataque} | DEF ${personaje.defensa} | Oro ${personaje.oro}`);
}

// ============================================
// EXPORTAR FUNCIONES (si usas módulos)
// ============================================

// Si estás en un entorno de navegador sin módulos, 
// estas funciones estarán disponibles globalmente
window.personaje = personaje;
window.ganarExperiencia = ganarExperiencia;
window.ganarOro = ganarOro;
window.gastarOro = gastarOro;
window.actualizarPanelVisible = actualizarPanelVisible;
window.inicializarPersonaje = inicializarPersonaje;
window.personaje = personaje; // Asegurar que está disponible globalmente
window.calcularAtaque = calcularAtaque;
window.calcularDefensa = calcularDefensa;
window.calcularHP = calcularHP;
window.calcularVelocidad = calcularVelocidad;
window.calcularCritico = calcularCritico;
window.calcularEvasion = calcularEvasion;
window.calcularResistencia = calcularResistencia;
window.CONFIG_NIVELES = CONFIG_NIVELES;

// La inicialización ahora la maneja sys-guardado.js
// Esta función se exporta pero no se auto-ejecuta
console.log('logic-niveles.js cargado - personaje listo para inicializar');

// ============================================
// FUNCIONES PARA EL SISTEMA DE EQUIPAMIENTO
// ============================================

/**
 * Calcula los bonos de equipamiento basado en los niveles
 * Esta función será llamada desde logic-equipamiento.js
 */
function calcularBonosEquipamiento(equipNiveles) {
    const bonosBase = {
        cabeza: { ATK: 0.3, CRT: 0.02, RES: 0.8 },
        pecho: { DEF: 0.4, RES: 0.8 },
        manos: { ATK: 0.3, SPD: 0.1, CRT: 0.02 },
        piernas: { DEF: 0.3, SPD: 0.1, EVA: 0.01 },
        pies: { SPD: 0.15, EVA: 0.015, RES: 0.3 },
        accesorios: { CRT: 0.03, EVA: 0.015, ATK: 0.2 }
    };
    
    let bonos = { ATK: 0, DEF: 0, SPD: 0, CRT: 0, EVA: 0, RES: 0 };
    
    // Calcular bonos para cada slot
    for (let slot in equipNiveles) {
        const nivel = equipNiveles[slot];
        const bonusSlot = bonosBase[slot];
        
        if (!bonusSlot) continue;
        
        // El nivel 1 no da bonus (es el nivel base)
        const nivelBonus = nivel - 1;
        if (nivelBonus <= 0) continue;
        
        for (let stat in bonusSlot) {
            bonos[stat] = (bonos[stat] || 0) + (bonusSlot[stat] * nivelBonus);
        }
    }
    
    return bonos;
}

/**
 * Actualiza los bonos de equipamiento en el personaje
 */
function actualizarBonosEquipamiento() {
    if (!personaje) return;
    
    personaje.equipBonos = calcularBonosEquipamiento(personaje.equipNiveles);
    actualizarPanelVisible();
    
    return personaje.equipBonos;
}

/**
 * Sube de nivel un slot de equipamiento
 */
function subirNivelEquipamiento(slot) {
    if (!personaje || !personaje.equipNiveles || !personaje.equipNiveles[slot]) {
        console.error('Slot de equipamiento no válido:', slot);
        return false;
    }
    
    personaje.equipNiveles[slot]++;
    actualizarBonosEquipamiento();
    
    // Guardar partida
    if (typeof guardarPartida === 'function') {
        guardarPartida();
    }
    
    return true;
}

/**
 * Obtiene el nivel de un slot específico
 */
function obtenerNivelEquipamiento(slot) {
    return personaje?.equipNiveles?.[slot] || 1;
}

/**
 * Sincroniza el oro del personaje con el sistema de equipamiento
 */
function sincronizarOroEquipamiento() {
    if (window.equipSystem && typeof window.equipSystem.setGold === 'function') {
        window.equipSystem.setGold(personaje?.oro || 0);
    }
}

// Exportar funciones de equipamiento
window.calcularBonosEquipamiento = calcularBonosEquipamiento;
window.actualizarBonosEquipamiento = actualizarBonosEquipamiento;
window.subirNivelEquipamiento = subirNivelEquipamiento;
window.obtenerNivelEquipamiento = obtenerNivelEquipamiento;
window.sincronizarOroEquipamiento = sincronizarOroEquipamiento;