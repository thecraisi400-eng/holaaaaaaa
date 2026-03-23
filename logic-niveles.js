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
    { id: 1, nombre: "Clan Uzumaki", titulo: "Vitalidad y sellado masivo", descripcion: "Vitalidad y sellado masivo.", buff: "🟢HP/DEF/RES", debuff: "🔴SPD/CRT/EVA", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 100, crtBase: 3, evaBase: 2, resBase: 150, hpG: 40, atkG: 7, defG: 8, spdG: 1.5, crtG: 0.15, evaG: 0.10, resG: 35 },
    { id: 2, nombre: "Clan Uchiha", titulo: "Genio del Sharingan", descripcion: "Genio del Sharingan.", buff: "🟢ATK/SPD/CRT", debuff: "🔴HP/DEF/RES", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 115, crtBase: 12, evaBase: 10, resBase: 50, hpG: 15, atkG: 13, defG: 5, spdG: 4, crtG: 1.8, evaG: 1.2, resG: 10 },
    { id: 3, nombre: "Clan Hyuga", titulo: "Defensa del Byakugan", descripcion: "Defensa del Byakugan.", buff: "🟢DEF/EVA/RES", debuff: "🔴HP/ATK/CRT", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 105, crtBase: 5, evaBase: 15, resBase: 80, hpG: 20, atkG: 10, defG: 12, spdG: 2.5, crtG: 0.40, evaG: 1.8, resG: 22 },
    { id: 4, nombre: "Clan Senju", titulo: "Cuerpo del Sabio", descripcion: "Cuerpo del Sabio.", buff: "🟢HP/DEF/RES", debuff: "🔴SPD/CRT/EVA", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 102, crtBase: 5, evaBase: 4, resBase: 110, hpG: 30, atkG: 11, defG: 10, spdG: 1.8, crtG: 0.35, evaG: 0.25, resG: 28 },
    { id: 5, nombre: "Clan Nara", titulo: "Estratega de sombras", descripcion: "Estratega de sombras.", buff: "🟢SPD/CRT/RES", debuff: "🔴HP/ATK/DEF", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 108, crtBase: 8, evaBase: 5, resBase: 130, hpG: 16, atkG: 10, defG: 6, spdG: 3.2, crtG: 0.75, evaG: 0.50, resG: 30 },
    { id: 6, nombre: "Clan Akimichi", titulo: "Fuerza bruta expansiva", descripcion: "Fuerza bruta expansiva.", buff: "🟢HP/ATK/DEF", debuff: "🔴SPD/CRT/EVA", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 85, crtBase: 4, evaBase: 1, resBase: 70, hpG: 45, atkG: 16, defG: 8, spdG: 0.5, crtG: 0.20, evaG: 0.01, resG: 14 },
    { id: 7, nombre: "Clan Aburame", titulo: "Desgaste de insectos", descripcion: "Desgaste de insectos.", buff: "🟢SPD/EVA/RES", debuff: "🔴HP/ATK/DEF", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 105, crtBase: 6, evaBase: 7, resBase: 180, hpG: 22, atkG: 8, defG: 9, spdG: 2.8, crtG: 0.45, evaG: 0.65, resG: 45 },
    { id: 8, nombre: "Clan Hozuki", titulo: "Cuerpo de agua fluido", descripcion: "Cuerpo de agua fluido.", buff: "🟢ATK/DEF/EVA", debuff: "🔴HP/CRT/RES", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 100, crtBase: 5, evaBase: 18, resBase: 40, hpG: 20, atkG: 11, defG: 18, spdG: 2.2, crtG: 0.30, evaG: 2.0, resG: 8 },
    { id: 9, nombre: "Clan Inuzuka", titulo: "Rastreador de colmillos", descripcion: "Rastreador de colmillos.", buff: "🟢ATK/SPD/EVA", debuff: "🔴DEF/CRT/RES", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 115, crtBase: 6, evaBase: 12, resBase: 40, hpG: 22, atkG: 14, defG: 5, spdG: 3.5, crtG: 0.40, evaG: 1.5, resG: 8 },
    { id: 10, nombre: "Clan Kaguya", titulo: "Danza de los huesos", descripcion: "Danza de los huesos.", buff: "🟢HP/ATK/DEF", debuff: "🔴SPD/CRT/EVA", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 95, crtBase: 5, evaBase: 2, resBase: 60, hpG: 32, atkG: 15, defG: 15, spdG: 1.2, crtG: 0.35, evaG: 0.10, resG: 12 },
    { id: 11, nombre: "Clan Sarutobi", titulo: "Maestría elemental", descripcion: "Maestría elemental.", buff: "🟢ATK/SPD/RES", debuff: "🔴HP/DEF/CRT", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 110, crtBase: 5, evaBase: 5, resBase: 100, hpG: 20, atkG: 11, defG: 7, spdG: 3.0, crtG: 0.45, evaG: 0.50, resG: 22 },
    { id: 12, nombre: "Clan Yuki", titulo: "Espejos de hielo", descripcion: "Espejos de hielo.", buff: "🟢SPD/EVA/RES", debuff: "🔴HP/ATK/DEF", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 130, crtBase: 8, evaBase: 15, resBase: 90, hpG: 15, atkG: 9, defG: 6, spdG: 5.0, crtG: 0.60, evaG: 1.8, resG: 25 },
    { id: 13, nombre: "Clan Kurama", titulo: "Ilusión espiritual", descripcion: "Ilusión espiritual.", buff: "🟢SPD/CRT/RES", debuff: "🔴HP/ATK/DEF", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 105, crtBase: 10, evaBase: 4, resBase: 160, hpG: 12, atkG: 10, defG: 4, spdG: 2.8, crtG: 1.2, evaG: 0.35, resG: 40 },
    { id: 14, nombre: "Clan Hatake", titulo: "Copiado y eficiencia", descripcion: "Copiado y eficiencia.", buff: "🟢SPD/CRT/EVA", debuff: "🔴HP/DEF/RES", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 120, crtBase: 12, evaBase: 10, resBase: 65, hpG: 16, atkG: 12, defG: 6, spdG: 4.5, crtG: 1.8, evaG: 1.4, resG: 15 },
    { id: 15, nombre: "Clan Chinoike", titulo: "Ojo de sangre", descripcion: "Ojo de sangre.", buff: "🟢ATK/CRT/RES", debuff: "🔴HP/DEF/SPD", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 98, crtBase: 15, evaBase: 5, resBase: 120, hpG: 18, atkG: 14, defG: 6, spdG: 1.5, crtG: 2.0, evaG: 0.45, resG: 30 },
    { id: 16, nombre: "Clan Jugo", titulo: "Energía de la naturaleza", descripcion: "Energía de la naturaleza.", buff: "🟢HP/ATK/CRT", debuff: "🔴DEF/SPD/EVA", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 92, crtBase: 12, evaBase: 0, resBase: 80, hpG: 35, atkG: 18, defG: 4, spdG: 1.0, crtG: 1.1, evaG: 0.01, resG: 20 },
    { id: 17, nombre: "Clan Onoki", titulo: "Polvo de desintegración", descripcion: "Polvo de desintegración.", buff: "🟢ATK/CRT/RES", debuff: "🔴HP/DEF/EVA", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 100, crtBase: 14, evaBase: 2, resBase: 130, hpG: 15, atkG: 19, defG: 4, spdG: 2.0, crtG: 1.8, evaG: 0.15, resG: 32 },
    { id: 18, nombre: "Clan Lee", titulo: "Esfuerzo de las puertas", descripcion: "Esfuerzo de las puertas.", buff: "🟢ATK/SPD/CRT", debuff: "🔴DEF/EVA/RES", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 135, crtBase: 15, evaBase: 3, resBase: 20, hpG: 25, atkG: 20, defG: 4, spdG: 5.5, crtG: 1.5, evaG: 0.25, resG: 5 },
    { id: 19, nombre: "Clan Otsutsuki", titulo: "Linaje celestial menor", descripcion: "Linaje celestial menor.", buff: "🟢HP/ATK/RES", debuff: "🔴DEF/SPD/EVA", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 95, crtBase: 8, evaBase: 2, resBase: 200, hpG: 40, atkG: 18, defG: 8, spdG: 1.5, crtG: 0.70, evaG: 0.15, resG: 55 },
    { id: 20, nombre: "Clan Hozuki", titulo: "Maestría en Siete Espadas", descripcion: "Maestría en Siete Espadas.", buff: "🟢ATK/SPD/DEF", debuff: "🔴HP/CRT/RES", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 110, crtBase: 5, evaBase: 6, resBase: 40, hpG: 20, atkG: 15, defG: 12, spdG: 3.0, crtG: 0.40, evaG: 0.50, resG: 8 },
    { id: 21, nombre: "Clan Amegakure", titulo: "Control de sellos de papel", descripcion: "Control de sellos de papel.", buff: "🟢SPD/EVA/RES", debuff: "🔴HP/ATK/DEF", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 118, crtBase: 7, evaBase: 18, resBase: 130, hpG: 16, atkG: 10, defG: 5, spdG: 4.2, crtG: 0.65, evaG: 2.1, resG: 32 },
    { id: 22, nombre: "Clan Fuuma", titulo: "Melodía de la pesadilla", descripcion: "Melodía de la pesadilla.", buff: "🟢ATK/SPD/CRT", debuff: "🔴HP/DEF/RES", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 122, crtBase: 10, evaBase: 6, resBase: 35, hpG: 15, atkG: 14, defG: 4, spdG: 4.5, crtG: 1.1, evaG: 0.60, resG: 7 },
    { id: 23, nombre: "Clan Shiin", titulo: "Ilusión rítmica", descripcion: "Ilusión rítmica.", buff: "🟢SPD/EVA/RES", debuff: "🔴HP/ATK/DEF", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 115, crtBase: 5, evaBase: 16, resBase: 140, hpG: 14, atkG: 8, defG: 5, spdG: 3.8, crtG: 0.40, evaG: 1.9, resG: 35 },
    { id: 24, nombre: "Clan Amagiri", titulo: "Trampa de gas tóxico", descripcion: "Trampa de gas tóxico.", buff: "🟢ATK/SPD/RES", debuff: "🔴HP/DEF/CRT", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 110, crtBase: 4, evaBase: 5, resBase: 120, hpG: 18, atkG: 12, defG: 7, spdG: 3.2, crtG: 0.35, evaG: 0.50, resG: 28 },
    { id: 25, nombre: "Clan Yota", titulo: "Furia de la naturaleza", descripcion: "Furia de la naturaleza.", buff: "🟢ATK/CRT/RES", debuff: "🔴HP/DEF/SPD", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 100, crtBase: 12, evaBase: 5, resBase: 115, hpG: 16, atkG: 18, defG: 4, spdG: 2.2, crtG: 1.4, evaG: 0.40, resG: 26 },
    { id: 26, nombre: "Clan Ryū", titulo: "Aliento de fuego ancestral", descripcion: "Aliento de fuego ancestral.", buff: "🟢HP/ATK/RES", debuff: "🔴DEF/SPD/EVA", hpBase: CONFIG_NIVELES.BASE.HP, atkBase: CONFIG_NIVELES.BASE.ATAQUE, defBase: CONFIG_NIVELES.BASE.DEFENSA, spdBase: 92, crtBase: 8, evaBase: 1, resBase: 145, hpG: 35, atkG: 16, defG: 8, spdG: 1.1, crtG: 0.65, evaG: 0.05, resG: 33 }
];

const CLASE_BASE = CLASES_NINJA.find((clase) => clase.nombre === "Clan Uchiha") || CLASES_NINJA[0];

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

    if (typeof window.updateBars === 'function') {
        window.updateBars();
    }
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

    if (typeof window.updateBars === 'function') {
        window.updateBars();
    }
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
    establecerPerfilInicial({
        nombre: personaje.nombre,
        claseId: personaje.clase?.id,
        nivel: personaje.nivel,
        xp: personaje.xp,
        oro: personaje.oro
    });
    
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
    personaje.nombre = (config.nombre || "Uchiha Sasuke").trim().slice(0, 25) || "Uchiha Sasuke";
    personaje.clase = { ...obtenerClasePorId(config.claseId || CLASE_BASE.id) };
    personaje.nivel = Math.max(1, Number(config.nivel) || 1);
    personaje.xp = Math.max(0, Number(config.xp) || 0);
    personaje.oro = config.oro ?? CONFIG_NIVELES.BASE.ORO;
    personaje.rango = calcularRango(personaje.nivel);

    personaje.hp = CONFIG_NIVELES.BASE.HP;
    personaje.hpMax = CONFIG_NIVELES.BASE.HP;
    personaje.mp = CONFIG_NIVELES.BASE.MP;
    personaje.mpMax = CONFIG_NIVELES.BASE.MP;
    personaje.ataque = CONFIG_NIVELES.BASE.ATAQUE;
    personaje.defensa = CONFIG_NIVELES.BASE.DEFENSA;
    personaje.velocidad = CONFIG_NIVELES.BASE.VELOCIDAD;
    personaje.critico = CONFIG_NIVELES.BASE.CRITICO;
    personaje.evasion = CONFIG_NIVELES.BASE.EVASION;
    personaje.resistencia = CONFIG_NIVELES.BASE.RESISTENCIA;
    personaje.xpRequerida = calcularXPRequerida(personaje.nivel + 1);

    personaje.equipNiveles = {
        cabeza: 1,
        pecho: 1,
        manos: 1,
        piernas: 1,
        pies: 1,
        accesorios: 1
    };
    personaje.equipBonos = {
        ATK: 0,
        DEF: 0,
        SPD: 0,
        CRT: 0,
        EVA: 0,
        RES: 0
    };
    personaje.arbolBonos = {
        hp: 0,
        ataque: 0,
        defensa: 0,
        velocidad: 0,
        critico: 0,
        evasion: 0
    };
    delete personaje._baseStats;
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