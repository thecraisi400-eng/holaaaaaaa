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

const CLASES_NINJA = [
    { id: 1, nombre: "Uzumaki", buff: "🟢HP/RES", debuff: "🔴SPD/CRT/EVA", hpBase: 140, atkBase: 20, defBase: 15, spdBase: 100, crtBase: 3, evaBase: 2, resBase: 120, hpG: 40, atkG: 8, defG: 7, spdG: 1.5, crtG: 0.20, evaG: 0.15, resG: 25 },
    { id: 2, nombre: "Uchiha", buff: "🟢ATK/SPD/CRT/EVA", debuff: "🔴HP/DEF", hpBase: 90, atkBase: 30, defBase: 8, spdBase: 115, crtBase: 12, evaBase: 15, resBase: 50, hpG: 15, atkG: 13, defG: 5, spdG: 4, crtG: 1.5, evaG: 1.8, resG: 10 },
    { id: 3, nombre: "Taijutsu", buff: "🟢ATK/SPD", debuff: "🔴HP/DEF/RES", hpBase: 100, atkBase: 35, defBase: 6, spdBase: 140, crtBase: 10, evaBase: 8, resBase: 30, hpG: 20, atkG: 18, defG: 3, spdG: 6, crtG: 1.2, evaG: 0.9, resG: 5 },
    { id: 4, nombre: "Hyuga", buff: "🟢DEF/EVA/RES", debuff: "🔴ATK/CRT", hpBase: 110, atkBase: 18, defBase: 25, spdBase: 110, crtBase: 5, evaBase: 12, resBase: 80, hpG: 18, atkG: 10, defG: 12, spdG: 2.5, crtG: 0.45, evaG: 1.1, resG: 20 },
    { id: 5, nombre: "Inuzuka/Aburame", buff: "🟢SPD/RES", debuff: "🔴HP/ATK/DEF", hpBase: 105, atkBase: 20, defBase: 18, spdBase: 105, crtBase: 6, evaBase: 5, resBase: 60, hpG: 22, atkG: 9, defG: 9, spdG: 3, crtG: 0.5, evaG: 0.6, resG: 12 },
    { id: 6, nombre: "Kazekage", buff: "🟢DEF/RES", debuff: "🔴SPD/CRT", hpBase: 115, atkBase: 18, defBase: 30, spdBase: 95, crtBase: 4, evaBase: 5, resBase: 90, hpG: 20, atkG: 9, defG: 18, spdG: 1.2, crtG: 0.3, evaG: 0.4, resG: 22 },
    { id: 7, nombre: "Espadachín", buff: "🟢ATK/SPD/CRT", debuff: "🔴HP/DEF", hpBase: 80, atkBase: 38, defBase: 7, spdBase: 125, crtBase: 18, evaBase: 10, resBase: 40, hpG: 14, atkG: 15, defG: 4, spdG: 4.5, crtG: 2.5, evaG: 1.2, resG: 8 },
    { id: 8, nombre: "Nara", buff: "🟢SPD/RES", debuff: "🔴HP/DEF", hpBase: 95, atkBase: 22, defBase: 12, spdBase: 105, crtBase: 8, evaBase: 4, resBase: 130, hpG: 16, atkG: 10, defG: 6, spdG: 3, crtG: 0.75, evaG: 0.35, resG: 30 },
    { id: 9, nombre: "Marionetista", buff: "🟢ATK/SPD/CRT", debuff: "🔴HP/DEF", hpBase: 75, atkBase: 32, defBase: 8, spdBase: 110, crtBase: 10, evaBase: 7, resBase: 55, hpG: 12, atkG: 14, defG: 5, spdG: 2.8, crtG: 1.1, evaG: 0.85, resG: 10 },
    { id: 10, nombre: "Jinchuriki", buff: "🟢HP/ATK/RES", debuff: "🔴DEF/CRT/EVA", hpBase: 180, atkBase: 30, defBase: 8, spdBase: 100, crtBase: 4, evaBase: 2, resBase: 150, hpG: 55, atkG: 15, defG: 5, spdG: 2.5, crtG: 0.35, evaG: 0.15, resG: 40 },
    { id: 11, nombre: "Ninja Médico", buff: "🟢HP/DEF/RES", debuff: "🔴ATK/CRT/SPD", hpBase: 125, atkBase: 12, defBase: 20, spdBase: 105, crtBase: 2, evaBase: 8, resBase: 200, hpG: 30, atkG: 6, defG: 10, spdG: 2, crtG: 0.1, evaG: 0.75, resG: 50 },
    { id: 12, nombre: "Sellado Uzumaki", buff: "🟢DEF/RES", debuff: "🔴HP/ATK/SPD/CRT", hpBase: 100, atkBase: 15, defBase: 22, spdBase: 100, crtBase: 5, evaBase: 5, resBase: 250, hpG: 25, atkG: 8, defG: 8, spdG: 1.8, crtG: 0.4, evaG: 0.45, resG: 60 },
    { id: 13, nombre: "Largo Alcance", buff: "🟢ATK/SPD/CRT", debuff: "🔴HP/DEF/RES", hpBase: 80, atkBase: 35, defBase: 6, spdBase: 115, crtBase: 20, evaBase: 6, resBase: 40, hpG: 15, atkG: 14, defG: 4, spdG: 3.5, crtG: 2.8, evaG: 0.6, resG: 8 },
    { id: 14, nombre: "Infiltrado Raíz", buff: "🟢SPD/CRT/EVA", debuff: "🔴HP/DEF/RES", hpBase: 70, atkBase: 28, defBase: 5, spdBase: 130, crtBase: 15, evaBase: 25, resBase: 30, hpG: 12, atkG: 12, defG: 3, spdG: 5.5, crtG: 1.9, evaG: 3.0, resG: 5 },
    { id: 15, nombre: "Kaguya", buff: "🟢HP/ATK/DEF", debuff: "🔴SPD/EVA", hpBase: 140, atkBase: 30, defBase: 30, spdBase: 100, crtBase: 8, evaBase: 3, resBase: 50, hpG: 28, atkG: 14, defG: 15, spdG: 2, crtG: 0.65, evaG: 0.25, resG: 10 },
    { id: 16, nombre: "Sabio Serpiente", buff: "🟢SPD/EVA/RES", debuff: "🔴HP/DEF", hpBase: 110, atkBase: 24, defBase: 12, spdBase: 112, crtBase: 6, evaBase: 12, resBase: 100, hpG: 24, atkG: 11, defG: 7, spdG: 3.2, crtG: 0.5, evaG: 1.1, resG: 25 },
    { id: 17, nombre: "Otsutsuki", buff: "🟢HP/ATK/SPD/RES", debuff: "🔴EVA/DEF", hpBase: 200, atkBase: 45, defBase: 15, spdBase: 120, crtBase: 15, evaBase: 10, resBase: 300, hpG: 60, atkG: 20, defG: 12, spdG: 4, crtG: 1.5, evaG: 1.0, resG: 70 },
    { id: 18, nombre: "Kurama", buff: "🟢RES/CRT", debuff: "🔴HP/DEF/EVA", hpBase: 90, atkBase: 28, defBase: 6, spdBase: 110, crtBase: 10, evaBase: 8, resBase: 160, hpG: 14, atkG: 13, defG: 3, spdG: 3.2, crtG: 1.2, evaG: 0.95, resG: 38 },
    { id: 19, nombre: "Sarutobi", buff: "🟢SPD/RES", debuff: "🔴HP/DEF/CRT", hpBase: 105, atkBase: 22, defBase: 14, spdBase: 108, crtBase: 6, evaBase: 5, resBase: 75, hpG: 19, atkG: 10, defG: 8, spdG: 2.8, crtG: 0.55, evaG: 0.45, resG: 18 },
    { id: 20, nombre: "Senju", buff: "🟢HP/DEF/RES", debuff: "🔴SPD/CRT", hpBase: 150, atkBase: 24, defBase: 20, spdBase: 102, crtBase: 5, evaBase: 3, resBase: 140, hpG: 32, atkG: 11, defG: 20, spdG: 1.8, crtG: 0.4, evaG: 0.2, resG: 35 },
    { id: 21, nombre: "Hatake", buff: "🟢SPD/CRT/EVA/RES", debuff: "🔴HP/DEF", hpBase: 95, atkBase: 27, defBase: 10, spdBase: 120, crtBase: 12, evaBase: 10, resBase: 65, hpG: 16, atkG: 12, defG: 6, spdG: 4.5, crtG: 1.8, evaG: 1.4, resG: 15 },
    { id: 22, nombre: "Reanimado", buff: "🟢HP/RES", debuff: "🔴ATK/SPD/EVA", hpBase: 170, atkBase: 12, defBase: 8, spdBase: 95, crtBase: 2, evaBase: 0, resBase: 300, hpG: 35, atkG: 7, defG: 5, spdG: 1.2, crtG: 0.15, evaG: 0.01, resG: 75 }
];

const CLASE_BASE = CLASES_NINJA.find((clase) => clase.nombre === "Uchiha") || CLASES_NINJA[0];

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
    return personaje.clase.hpBase + (personaje.clase.hpG * (nivel - 1));
}

/**
 * Calcula el MP basado en el nivel
 */
function calcularMP(nivel) {
    return personaje.clase.resBase + (personaje.clase.resG * (nivel - 1));
}

/**
 * Calcula el ataque basado en el nivel
 */
function calcularAtaque(nivel) {
    return personaje.clase.atkBase + (personaje.clase.atkG * (nivel - 1));
}

/**
 * Calcula la defensa basado en el nivel
 */
function calcularDefensa(nivel) {
    return personaje.clase.defBase + (personaje.clase.defG * (nivel - 1));
}

/**
 * Calcula la velocidad basado en el nivel
 */
function calcularVelocidad(nivel) {
    return personaje.clase.spdBase + (personaje.clase.spdG * (nivel - 1));
}

/**
 * Calcula el crítico basado en el nivel (con límite máximo)
 */
function calcularCritico(nivel) {
    let critico = personaje.clase.crtBase + (personaje.clase.crtG * (nivel - 1));
    return Math.min(critico, CONFIG_NIVELES.LIMITES.CRITICO_MAX);
}

/**
 * Calcula la evasión basado en el nivel (con límite máximo)
 */
function calcularEvasion(nivel) {
    let evasion = personaje.clase.evaBase + (personaje.clase.evaG * (nivel - 1));
    return Math.min(evasion, CONFIG_NIVELES.LIMITES.EVASION_MAX);
}

/**
 * Calcula la resistencia basado en el nivel
 */
function calcularResistencia(nivel) {
    return personaje.clase.resBase + (personaje.clase.resG * (nivel - 1));
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
    clase: { ...CLASE_BASE },
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
    const nombreElement = document.getElementById('hero-name');
    if (nombreElement) nombreElement.textContent = personaje.nombre;

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
    establecerPerfilInicial();
    
    // Calcular todas las estadísticas para nivel 1
    actualizarEstadisticasPorNivel();
    
    // Actualizar el panel visible
    actualizarPanelVisible();
    
    console.log(`Personaje inicializado: ${personaje.nombre} (${personaje.clase.nombre})`);
    console.log(`Estadísticas: ATK ${personaje.ataque} | DEF ${personaje.defensa} | Oro ${personaje.oro}`);
}

function obtenerClasePorId(id) {
    return CLASES_NINJA.find((clase) => clase.id === Number(id)) || CLASE_BASE;
}

function establecerPerfilInicial(config = {}) {
    personaje.nombre = (config.nombre || personaje.nombre || "Uchiha Sasuke").trim().slice(0, 25) || "Uchiha Sasuke";
    personaje.clase = { ...obtenerClasePorId(config.claseId || personaje.clase?.id || CLASE_BASE.id) };
    personaje.nivel = config.nivel || 1;
    personaje.xp = config.xp || 0;
    personaje.oro = config.oro ?? CONFIG_NIVELES.BASE.ORO;
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
window.CLASES_NINJA = CLASES_NINJA;
window.obtenerClasePorId = obtenerClasePorId;
window.establecerPerfilInicial = establecerPerfilInicial;

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