// sys-guardado.js
// SISTEMA DE GUARDADO AUTOMÁTICO (LocalStorage)
// ============================================
// CONFIGURACIÓN
// ============================================
const SAVE_KEY = 'uchiha_sasuke_save';
let _reiniciando = false;
const SAVE_VERSION = '1.0';

// ============================================
// GUARDAR PARTIDA
// ============================================
function guardarPartida(options = {}) {
    const silent = !!options.silent;
    // Verificar que existe el personaje
    if (!window.personaje) {
        console.warn('No se puede guardar: personaje no encontrado');
        return false;
    }

    // Crear objeto con los datos a guardar
    const datosGuardado = {
        version: SAVE_VERSION,
        fecha: new Date().toISOString(),
        nombre: window.personaje.nombre,
        claseId: window.personaje.clase?.id || null,
        nivel: window.personaje.nivel,
        xp: window.personaje.xp,
        oro: window.personaje.oro,
        hp: window.personaje.hp,
        hpMax: window.personaje.hpMax,
        mp: window.personaje.mp,
        mpMax: window.personaje.mpMax,
        ataque: window.personaje.ataque,
        defensa: window.personaje.defensa,
        // Guardamos también las estadísticas ocultas por si acaso
        velocidad: window.personaje.velocidad,
        critico: window.personaje.critico,
        evasion: window.personaje.evasion,
        resistencia: window.personaje.resistencia
                ,
        // Sistema de Equipamiento
        equipNiveles: window.personaje.equipNiveles || {
            cabeza: 1,
            pecho: 1,
            manos: 1,
            piernas: 1,
            pies: 1,
            accesorios: 1
        },
        equipBonos: window.personaje.equipBonos || {
            ATK: 0,
            DEF: 0,
            SPD: 0,
            CRT: 0,
            EVA: 0,
            RES: 0
        },
        bingo: window.bingoDatos || null
        ,
        arbolData: window.arbolSystem ? window.arbolSystem.obtenerDatos() : null,
        batallaNinja: window.batallaNinjaSystem && typeof window.batallaNinjaSystem.getPersistentState === 'function'
            ? window.batallaNinjaSystem.getPersistentState()
            : null
    };

    try {
        // Guardar en localStorage
        localStorage.setItem(SAVE_KEY, JSON.stringify(datosGuardado));
        console.log('Partida guardada exitosamente', datosGuardado);
        
        // Mostrar notificación si existe
        if (!silent && typeof mostrarNotificacion === 'function') {
            mostrarNotificacion('Partida guardada', 'sistema');
        }
        
        return true;
    } catch (error) {
        console.error('Error al guardar partida:', error);
        return false;
    }
}

// ============================================
// CARGAR PARTIDA
// ============================================
function cargarPartida(options = {}) {
    const silent = !!options.silent;
    // Verificar que existe el personaje
    if (!window.personaje) {
        console.warn('No se puede cargar: personaje no encontrado');
        return false;
    }

    try {
        // Obtener datos del localStorage
        const datosGuardados = localStorage.getItem(SAVE_KEY);
        
        if (!datosGuardados) {
            console.log('No hay partida guardada, iniciando nueva');
            return false;
        }

        const datos = JSON.parse(datosGuardados);
        
        // Verificar versión (por si cambia el formato en el futuro)
        if (datos.version !== SAVE_VERSION) {
            console.warn('Versión de guardado diferente, puede haber incompatibilidades');
        }

        // Restaurar datos básicos
        if (typeof establecerPerfilInicial === 'function') {
            establecerPerfilInicial({
                nombre: datos.nombre || 'Uchiha Sasuke',
                claseId: datos.claseId,
                nivel: datos.nivel || 1,
                xp: datos.xp || 0,
                oro: datos.oro ?? 100
            });
        } else {
            window.personaje.nivel = datos.nivel || 1;
            window.personaje.xp = datos.xp || 0;
            window.personaje.oro = datos.oro ?? 100;
            window.personaje.nombre = datos.nombre || 'Uchiha Sasuke';
        }
        
        // Restaurar HP y MP (con validación)
        window.personaje.hp = datos.hp || window.personaje.hpMax;
        window.personaje.mp = datos.mp || window.personaje.mpMax;
        
        // ACTUALIZAR ESTADÍSTICAS POR NIVEL
        // Esto recalculará ataque, defensa, etc. basado en el nivel cargado
        if (typeof actualizarEstadisticasPorNivel === 'function') {
            actualizarEstadisticasPorNivel();
                        
            // Restaurar niveles de equipamiento
            if (datos.equipNiveles) {
                window.personaje.equipNiveles = datos.equipNiveles;
            } else {
                // Si no hay datos de equipamiento, inicializar a nivel 1
                window.personaje.equipNiveles = {
                    cabeza: 1,
                    pecho: 1,
                    manos: 1,
                    piernas: 1,
                    pies: 1,
                    accesorios: 1
                };
            }
            
            // Restaurar bonos de equipamiento
            if (datos.equipBonos) {
                window.personaje.equipBonos = datos.equipBonos;
            } else {
                window.personaje.equipBonos = {
                    ATK: 0,
                    DEF: 0,
                    SPD: 0,
                    CRT: 0,
                    EVA: 0,
                    RES: 0
                };
            }
            
            // Recalcular bonos de equipamiento (por si cambiaron las fórmulas)
            if (typeof actualizarBonosEquipamiento === 'function') {
                actualizarBonosEquipamiento();
            }
        }
        
        // ACTUALIZAR PANEL VISIBLE
        if (typeof actualizarPanelVisible === 'function') {
            actualizarPanelVisible();
        }
        
        // ACTUALIZAR BARRAS (script.js)
        if (typeof updateBars === 'function') {
            updateBars();
        }

        if (datos.bingo) {
            window.bingoDatos = datos.bingo;
        }

        if (datos.arbolData && window.arbolSystem && typeof window.arbolSystem.cargarDatos === 'function') {
            window.arbolSystem.cargarDatos(datos.arbolData);
        }
        
        console.log('Partida cargada exitosamente', datos);
        
        // Mostrar notificación si existe
        if (datos.batallaNinja && window.batallaNinjaSystem && typeof window.batallaNinjaSystem.loadPersistentState === 'function') {
            window.batallaNinjaSystem.loadPersistentState(datos.batallaNinja);
        }

        if (!silent && typeof mostrarNotificacion === 'function') {
            mostrarNotificacion('Partida cargada', 'sistema');
        }
        
        return true;
    } catch (error) {
        console.error('Error al cargar partida:', error);
        return false;
    }
}

// ============================================
// ELIMINAR PARTIDA (RESET)
// ============================================
function resetearPartida() {
    try {
        // Borrar TODO el localStorage sin excepción
        _reiniciando = true;
window._reiniciando = true;
        localStorage.clear();

        // Limpiar variables globales en memoria
        window.bingoDatos = null;

        // Detener auto-save para que no vuelva a guardar antes de recargar
        if (typeof detenerAutoSave === 'function') {
            detenerAutoSave();
        }

        console.log('localStorage limpiado completamente. Recargando...');

        // Recargar la página para reinicio 100% limpio
        location.reload();

    } catch (error) {
        console.error('Error al resetear partida:', error);
        alert('❌ Error al reiniciar. Intenta de nuevo.');
        return false;
    }
}

// ============================================
// VERIFICAR SI EXISTE PARTIDA GUARDADA
// ============================================
function existePartidaGuardada() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

function inicializarJuegoDesdeGuardado() {
    iniciarAutoSave(5);

    if (existePartidaGuardada()) {
        console.log('Partida guardada encontrada, cargando...');
        return cargarPartida({ silent: true });
    }

    console.log('No hay partida guardada, iniciando nueva');
    if (typeof inicializarPersonaje === 'function') {
        inicializarPersonaje();
        return true;
    }

    return false;
}

// ============================================
// GUARDADO AUTOMÁTICO (OPCIONAL)
// ============================================
let autoSaveInterval = null;

function iniciarAutoSave(intervaloMinutos = 5) {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    autoSaveInterval = setInterval(() => {
        guardarPartida({ silent: true });
    }, intervaloMinutos * 60 * 1000);
    
    console.log(`Auto-save iniciado cada ${intervaloMinutos} minutos`);
}

function detenerAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('Auto-save detenido');
    }
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================
window.guardarPartida = guardarPartida;
window.cargarPartida = cargarPartida;
window.resetearPartida = resetearPartida;
window.existePartidaGuardada = existePartidaGuardada;
window.iniciarAutoSave = iniciarAutoSave;
window.detenerAutoSave = detenerAutoSave;
window.inicializarJuegoDesdeGuardado = inicializarJuegoDesdeGuardado;

// ============================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño retraso para asegurar que personaje existe
    setTimeout(() => {
        if (!window.deferGameBoot) {
            inicializarJuegoDesdeGuardado();
        }
    }, 200);
});

// ============================================
// GUARDAR AL CERRAR LA PESTAÑA (OPCIONAL)
// ============================================
window.addEventListener('beforeunload', () => {
    if (_reiniciando || window.deferGameBoot) return;
    guardarPartida({ silent: true });
});