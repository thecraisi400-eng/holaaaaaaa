// logic-combate.js
// SISTEMA DE COMBATE CON ESTADÍSTICAS DEL PERSONAJE
// Usa: ATK, DEF, CRT, EVA del personaje

// ============================================
// CONFIGURACIÓN DE COMBATE
// ============================================
const CONFIG_COMBATE = {
    // Multiplicadores de daño
    DANO_BASE: 1.0,        // Multiplicador base
    DANO_CRITICO: 1.5,      // Daño crítico (x1.5)
    
    // Mensajes de combate
    MENSAJES: {
        GOLPE: (dano) => `¡Golpe! ${dano} de daño`,
        CRITICO: (dano) => `¡CRÍTICO! ${dano} de daño`,
        EVASION: (enemigo) => `¡${enemigo} falló el ataque!`,
        DEFENSA: (dano) => `Daño reducido por defensa: ${dano}`,
        VICTORIA: (xp, oro) => `¡Victoria! +${xp} XP, +${oro} Oro`,
        DERROTA: `Has sido derrotado...`
    }
};

// ============================================
// ESTRUCTURA DE ENEMIGO
// ============================================
class Enemigo {
    constructor(nombre, nivel, hp, ataque, defensa, recompensaXP, recompensaOro) {
        this.nombre = nombre;
        this.nivel = nivel;
        this.hp = hp;
        this.hpMax = hp;
        this.ataque = ataque;
        this.defensa = defensa;
        this.recompensaXP = recompensaXP;
        this.recompensaOro = recompensaOro;
    }
    
    // Recibir daño
    recibirDano(dano) {
        this.hp = Math.max(0, this.hp - dano);
        return this.hp <= 0;
    }
    
    // ¿Está vivo?
    estaVivo() {
        return this.hp > 0;
    }
    
    // Resetear HP
    resetear() {
        this.hp = this.hpMax;
    }
}

// ============================================
// ESTADO DE COMBATE
// ============================================
let combateActivo = false;
let enemigoActual = null;
let turnoJugador = true;
let timeoutTurnoEnemigo = null;
let enemigoSpawneando = false;
let timeoutSpawnProteccion = null;

// Elementos del DOM (los crearemos si no existen)
let logCombateElement = null;
let enemigoNombreElement = null;
let enemigoHpBarElement = null;
let enemigoHpTextoElement = null;

// ============================================
// FUNCIONES DE CÁLCULO DE DAÑO
// ============================================

/**
 * Calcula el daño que hace el jugador
 * Usa: ATK del personaje + probabilidad de crítico
 */
function calcularDanoJugador() {
    if (!window.personaje) return 10; // Valor por defecto
    
    // Obtener ataque base del personaje
    let ataque = window.personaje.ataque || 15;
    
    // Pequeña variación aleatoria (±10%)
    let variacion = 0.9 + (Math.random() * 0.2);
    let dano = Math.floor(ataque * variacion);
    
    // Verificar crítico
    let probCritico = (window.personaje.critico || 5) / 100;
    let esCritico = Math.random() < probCritico;
    
    if (esCritico) {
        dano = Math.floor(dano * CONFIG_COMBATE.DANO_CRITICO);
    }
    
    return {
        dano: Math.max(1, dano), // Mínimo 1 de daño
        critico: esCritico
    };
}

/**
 * Verifica si el jugador evade el ataque
 * Usa: EVA del personaje
 */
function verificarEvasion() {
    if (!window.personaje) return false;
    
    let probEvasion = (window.personaje.evasion || 2) / 100;
    return Math.random() < probEvasion;
}

/**
 * Calcula el daño que recibe el jugador
 * Usa: DEF del personaje para mitigar
 */
function calcularDanoRecibido(danoBase, atacante) {
    if (!window.personaje) return danoBase;
    
    let defensa = window.personaje.defensa || 10;
    
    // Fórmula: daño recibido = daño base - (defensa / 2)
    // Mínimo 20% del daño base
    let mitigacion = Math.floor(defensa / 2);
    let danoFinal = Math.max(
        Math.floor(danoBase * 0.2), // Mínimo 20%
        danoBase - mitigacion
    );
    
    return danoFinal;
}

// ============================================
// FUNCIONES DE COMBATE
// ============================================

/**
 * Inicia un combate contra un enemigo
 */
function iniciarCombate(enemigo) {
    if (combateActivo) {
        agregarLog("¡Ya estás en combate!");
        return false;
    }

    if (!window.personaje) {
        agregarLog("Error: Personaje no encontrado");
        return false;
    }

    if (window.personaje.hp <= 0) {
        agregarLog("No puedes combatir derrotado...");
        return false;
    }

    enemigoActual = enemigo;
    combateActivo = true;
    turnoJugador = false;
    enemigoSpawneando = true;

    if (window.jutsuSystem && typeof window.jutsuSystem.beginCombat === 'function') {
        window.jutsuSystem.beginCombat({ source: 'combate_principal' });
    }

    const btnAtacar = document.getElementById('btn-atacar');
    if (btnAtacar) {
        btnAtacar.disabled = true;
        btnAtacar.style.opacity = '0.4';
        btnAtacar.style.cursor = 'not-allowed';
    }

    agregarLog(`⚔️ ¡Combate contra ${enemigo.nombre} (Nv. ${enemigo.nivel})!`);

    if (enemigoHpBarElement) {
        enemigoHpBarElement.style.transition = 'none';
        enemigoHpBarElement.style.width = '0%';
    }

    const container = document.getElementById('combate-container');
    if (container) container.style.display = 'block';
    if (enemigoNombreElement) {
        enemigoNombreElement.textContent = `${enemigoActual.nombre} (Nv. ${enemigoActual.nivel})`;
    }
    if (enemigoHpTextoElement) {
        enemigoHpTextoElement.textContent = `${enemigoActual.hp}/${enemigoActual.hpMax}`;
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (enemigoHpBarElement) {
                enemigoHpBarElement.style.transition = 'width 0.8s ease';
                enemigoHpBarElement.style.width = '100%';
            }
            setTimeout(() => {
                enemigoSpawneando = false;
                turnoJugador = true;
                if (btnAtacar) {
                    btnAtacar.disabled = false;
                    btnAtacar.style.opacity = '';
                    btnAtacar.style.cursor = '';
                }
                agregarLog("¡Listo para atacar!");
            }, 900);
        });
    });

    return true;
}

/**
 * Ejecuta el turno del jugador (atacar)
 */
function atacar() {
    if (!combateActivo || !enemigoActual) {
        agregarLog("No hay combate activo");
        return false;
    }

    if (enemigoSpawneando) {
        return false;
    }

    if (!turnoJugador) {
        agregarLog("No es tu turno");
        return false;
    }

    if (!enemigoActual.estaVivo()) {
        finalizarCombate(true);
        return false;
    }
    
    // Calcular daño del jugador
    const resultado = calcularDanoJugador();
    let danoFinal = resultado.dano;
    let executeThresholdPct = 0;

    if (window.jutsuSystem && typeof window.jutsuSystem.preparePlayerTurn === 'function') {
        const jutsuTurn = window.jutsuSystem.preparePlayerTurn({
            source: 'combate_principal',
            enemy: enemigoActual,
            baseDamage: danoFinal,
            baseCritChance: (window.personaje?.critico || 5),
            enemyDefense: enemigoActual.defensa,
            addLog: agregarLog
        });
        danoFinal = jutsuTurn.damage;
        executeThresholdPct = jutsuTurn.executeThresholdPct || 0;
        if (jutsuTurn.guaranteedCrit) {
            resultado.critico = true;
        } else if (!resultado.critico && Math.random() * 100 < (jutsuTurn.critChance || 0)) {
            resultado.critico = true;
        }
        if (resultado.critico) {
            danoFinal = Math.floor(danoFinal * CONFIG_COMBATE.DANO_CRITICO);
        }
        resultado.dano = danoFinal;
    }
    
    // Aplicar daño al enemigo
    let enemigoMuerto = enemigoActual.recibirDano(resultado.dano);

    if (!enemigoMuerto && window.jutsuSystem && typeof window.jutsuSystem.afterPlayerAttack === 'function') {
        const postAttack = window.jutsuSystem.afterPlayerAttack({
            enemy: enemigoActual,
            damageDealt: resultado.dano,
            executeThresholdPct,
            addLog: agregarLog
        });
        if (postAttack.executed) enemigoMuerto = true;
    }
    
    // Mostrar mensaje
    if (resultado.critico) {
        agregarLog(CONFIG_COMBATE.MENSAJES.CRITICO(resultado.dano));
    } else {
        agregarLog(CONFIG_COMBATE.MENSAJES.GOLPE(resultado.dano));
    }
    
    // Actualizar UI del enemigo
    actualizarUIEnemigo();
    
    // Verificar si el enemigo murió
if (enemigoMuerto) {
    agregarLog("💀 ¡Enemigo derrotado!");
setTimeout(() => finalizarCombate(true), 2500);
} else {
    turnoJugador = false;
    timeoutTurnoEnemigo = setTimeout(() => turnoEnemigo(), 1000);
}
    
    return true;
}

/**
 * Turno del enemigo (ataca al jugador)
 */
function turnoEnemigo() {
    if (!combateActivo || !enemigoActual || !enemigoActual.estaVivo()) {
        finalizarCombate(true);
        return;
    }
    
    if (!window.personaje || window.personaje.hp <= 0) {
        finalizarCombate(false);
        return;
    }
    
    // Verificar evasión base
    if (verificarEvasion()) {
        agregarLog(CONFIG_COMBATE.MENSAJES.EVASION(enemigoActual.nombre));
        turnoJugador = true;
        return;
    }
    
    // Calcular daño enemigo (con variación)
    let danoBase = Math.floor(enemigoActual.ataque * (0.8 + Math.random() * 0.4));
    let danoReal = calcularDanoRecibido(danoBase, enemigoActual);
    let jutsuRespuesta = { damage: danoReal, skipped: false, reflectedDamage: 0 };

    if (window.jutsuSystem && typeof window.jutsuSystem.beforeEnemyAttack === 'function') {
        jutsuRespuesta = window.jutsuSystem.beforeEnemyAttack({
            source: 'combate_principal',
            enemy: enemigoActual,
            baseDamage: danoReal,
            addLog: agregarLog
        });
        if (jutsuRespuesta.skipped) {
            if (jutsuRespuesta.reflectedDamage && window.jutsuSystem.afterEnemyAttack) {
                window.jutsuSystem.afterEnemyAttack({ enemy: enemigoActual, damageTaken: 0, reflectedDamage: jutsuRespuesta.reflectedDamage, addLog: agregarLog });
                actualizarUIEnemigo();
            }
            if (!enemigoActual.estaVivo()) {
                finalizarCombate(true);
            } else {
                turnoJugador = true;
            }
            return;
        }
        danoReal = jutsuRespuesta.damage;
    }
    
    // Aplicar daño al jugador
    window.personaje.hp = Math.max(0, window.personaje.hp - danoReal);
    
    agregarLog(`${enemigoActual.nombre} ataca: ${danoReal} de daño`);

    if (window.jutsuSystem && typeof window.jutsuSystem.afterEnemyAttack === 'function') {
        window.jutsuSystem.afterEnemyAttack({
            enemy: enemigoActual,
            damageTaken: danoReal,
            reflectedDamage: jutsuRespuesta.reflectedDamage || 0,
            addLog: agregarLog
        });
        actualizarUIEnemigo();
    }
    
    // Actualizar UI
    if (typeof updateBars === 'function') {
        updateBars();
    }
    
    // Verificar si el jugador murió
    if (window.personaje.hp <= 0) {
        finalizarCombate(false);
    } else {
        turnoJugador = true;
    }
}

/**
 * Finaliza el combate
 */
function finalizarCombate(victoria) {
    if (!combateActivo) return;
    
    if (victoria && enemigoActual) {
        // Dar recompensas
        if (typeof ganarExperiencia === 'function') {
            ganarExperiencia(enemigoActual.recompensaXP);
        }
        
        if (typeof ganarOro === 'function') {
            ganarOro(enemigoActual.recompensaOro);
        }
        
        agregarLog(CONFIG_COMBATE.MENSAJES.VICTORIA(
            enemigoActual.recompensaXP,
            enemigoActual.recompensaOro
        ));
    } else {
        agregarLog(CONFIG_COMBATE.MENSAJES.DERROTA);
        // Aquí podrías agregar lógica de derrota (perder oro, revivir, etc.)
    }
    
    if (window.jutsuSystem && typeof window.jutsuSystem.endCombat === 'function') {
        window.jutsuSystem.endCombat({ addLog: agregarLog, silent: true });
    }

    // Limpiar combate
    combateActivo = false;
    enemigoActual = null;
    turnoJugador = true;
    
    // Limpiar UI de enemigo
    limpiarUIEnemigo();
}

// ============================================
// FUNCIONES DE UI
// ============================================

/**
 * Inicializa los elementos del DOM para combate
 */
function inicializarUICombate() {
    // Crear contenedor de combate si no existe
    if (!document.getElementById('combate-container')) {
        const combateHTML = `
            <div id="combate-container" style="display: none;">
                <div id="enemigo-info">
                    <h3 id="enemigo-nombre"></h3>
                    <div class="enemigo-hp-container">
                        <div id="enemigo-hp-barra" class="enemigo-hp-fill"></div>
                    </div>
                    <span id="enemigo-hp-texto"></span>
                </div>
                <div id="log-combate"></div>
                <button onclick="atacar()" id="btn-atacar">⚔️ Atacar</button>
                <button onclick="huir()" id="btn-huir">🏃 Huir</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', combateHTML);
    }
    
    // Obtener referencias
    logCombateElement = document.getElementById('log-combate');
    enemigoNombreElement = document.getElementById('enemigo-nombre');
    enemigoHpBarElement = document.getElementById('enemigo-hp-barra');
    enemigoHpTextoElement = document.getElementById('enemigo-hp-texto');
}

/**
 * Actualiza la UI del enemigo
 */
function actualizarUIEnemigo() {
    if (!enemigoActual) return;
    
    const container = document.getElementById('combate-container');
    if (container) container.style.display = 'block';
    
    if (enemigoNombreElement) {
        enemigoNombreElement.textContent = `${enemigoActual.nombre} (Nv. ${enemigoActual.nivel})`;
    }
    
    if (enemigoHpBarElement && enemigoHpTextoElement) {
        const porcentaje = (enemigoActual.hp / enemigoActual.hpMax) * 100;
        enemigoHpBarElement.style.width = `${Math.max(porcentaje, 0)}%`;
        enemigoHpTextoElement.textContent = `${enemigoActual.hp}/${enemigoActual.hpMax}`;
    }
}

/**
 * Limpia la UI del enemigo
 */
function limpiarUIEnemigo() {
    const container = document.getElementById('combate-container');
    if (container) container.style.display = 'none';
    
    if (logCombateElement) {
        logCombateElement.innerHTML = '';
    }
}

/**
 * Agrega un mensaje al log de combate
 */
function agregarLog(mensaje) {
    if (!logCombateElement) return;
    
    const entrada = document.createElement('div');
    entrada.className = 'log-entrada';
    entrada.textContent = mensaje;
    
    logCombateElement.appendChild(entrada);
    logCombateElement.scrollTop = logCombateElement.scrollHeight;
    
    // Limitar el log a 50 mensajes
    while (logCombateElement.children.length > 50) {
        logCombateElement.removeChild(logCombateElement.firstChild);
    }
}

/**
 * Intenta huir del combate
 */
function huir() {
    if (!combateActivo) return;
    
    // 70% de probabilidad de huir
    if (Math.random() < 0.7) {
        agregarLog("¡Has huido del combate!");
        combateActivo = false;
        enemigoActual = null;
        turnoJugador = true;
        limpiarUIEnemigo();
    } else {
        agregarLog("¡No pudiste huir!");
        turnoJugador = false;
        timeoutTurnoEnemigo = setTimeout(() => turnoEnemigo(), 1000);
    }
}

// ============================================
// ENEMIGOS DE EJEMPLO
// ============================================
const ENEMIGOS = {
    ZETSU: new Enemigo("Zetsu", 1, 50, 12, 5, 50, 20),
    ZETSU_2: new Enemigo("Zetsu Blanco", 2, 75, 15, 8, 75, 35),
    ZETSU_3: new Enemigo("Zetsu Negro", 3, 100, 18, 10, 100, 50),
    AKATSUKI: new Enemigo("Miembro Akatsuki", 5, 200, 25, 15, 200, 100)
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarUICombate();
    
    // Ejemplo de botones de combate (si existen)
    const btnZetsu = document.getElementById('btn-zetsu');
    if (btnZetsu) {
        btnZetsu.addEventListener('click', () => {
            iniciarCombate(ENEMIGOS.ZETSU);
        });
    }
    
    const btnAkatsuki = document.getElementById('btn-akatsuki');
    if (btnAkatsuki) {
        btnAkatsuki.addEventListener('click', () => {
            iniciarCombate(ENEMIGOS.AKATSUKI);
        });
    }
});

// ============================================
// EXPORTAR FUNCIONES
// ============================================

function cancelarCombate() {
    if (timeoutTurnoEnemigo) {
        clearTimeout(timeoutTurnoEnemigo);
        timeoutTurnoEnemigo = null;
    }
    combateActivo = false;
    enemigoActual = null;
    turnoJugador = true;
    limpiarUIEnemigo();
}
window.cancelarCombate = cancelarCombate;

window.iniciarCombate = iniciarCombate;
window.atacar = atacar;
window.huir = huir;
window.ENEMIGOS = ENEMIGOS;