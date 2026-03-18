// logic-arbol.js
// SISTEMA DE ÁRBOL DE HABILIDADES NINJA

(function () {

    // ==========================================
    // DATOS REALES DEL JUEGO
    // ==========================================

    const RANGOS = ['D', 'C', 'B', 'A', 'S'];

    const RANGO_EMOJI = { D: '🥉', C: '🥈', B: '🥇', A: '💎', S: '👑' };

    const RANGO_LORE = {
        D: 'Genin · Primeros pasos del shinobi',
        C: 'Chūnin · Voluntad de fuego despertada',
        B: 'Jōnin · Tácticas y sigilo avanzado',
        A: 'Anbu · Sigilo letal, misiones oscuras',
        S: 'Kage · Poder absoluto del Valle del Fin'
    };

    const ARBOL_DATA_VERSION = 2;


    const RANGO_BONO_COMPLETO = {
        D: '+50 ❤️  +3 🛡️',
        C: '+80 ❤️  +5 ⚔️  +2 🍃',
        B: '+120 ❤️  +8 ⚔️  +4 🛡️',
        A: '+180 ❤️  +12 ⚔️  +8 🛡️',
        S: '+250 ❤️  +20 ⚔️  +15 🛡️'
    };

    const RANGO_BONO_STATS = {
        D: { hp: 50,  ataque: 3,  defensa: 3,  velocidad: 0,  critico: 0 },
        C: { hp: 80,  ataque: 5,  defensa: 0,  velocidad: 2,  critico: 0 },
        B: { hp: 120, ataque: 8,  defensa: 4,  velocidad: 4,  critico: 1 },
        A: { hp: 180, ataque: 12, defensa: 8,  velocidad: 0,  critico: 2 },
        S: { hp: 250, ataque: 20, defensa: 15, velocidad: 10, critico: 3 }
    };

    const NODOS = {
        D: [
            { stat: 'hp',        emoji: '❤️', label: 'Vitalidad', valor: 50, costo: 1 },
            { stat: 'ataque',    emoji: '⚔️', label: 'Ataque',    valor: 8,  costo: 1 },
            { stat: 'defensa',   emoji: '🛡️', label: 'Defensa',   valor: 5,  costo: 1 },
            { stat: 'velocidad', emoji: '🍃', label: 'Velocidad', valor: 5,  costo: 1 },
            { stat: 'critico',   emoji: '🌀', label: 'Crítico',   valor: 1,  costo: 1 }
        ],
        C: [
            { stat: 'hp',        emoji: '❤️', label: 'Vitalidad', valor: 80,  costo: 2 },
            { stat: 'ataque',    emoji: '⚔️', label: 'Ataque',    valor: 15,  costo: 2 },
            { stat: 'defensa',   emoji: '🛡️', label: 'Defensa',   valor: 10,  costo: 2 },
            { stat: 'velocidad', emoji: '🍃', label: 'Velocidad', valor: 8,   costo: 2 },
            { stat: 'critico',   emoji: '🌀', label: 'Crítico',   valor: 1,   costo: 2 }
        ],
        B: [
            { stat: 'hp',        emoji: '❤️', label: 'Vitalidad', valor: 120, costo: 3 },
            { stat: 'ataque',    emoji: '⚔️', label: 'Ataque',    valor: 24,  costo: 3 },
            { stat: 'defensa',   emoji: '🛡️', label: 'Defensa',   valor: 16,  costo: 3 },
            { stat: 'velocidad', emoji: '🍃', label: 'Velocidad', valor: 12,  costo: 3 },
            { stat: 'critico',   emoji: '🌀', label: 'Crítico',   valor: 1,   costo: 3 }
        ],
        A: [
            { stat: 'hp',        emoji: '❤️', label: 'Vitalidad', valor: 150, costo: 4 },
            { stat: 'ataque',    emoji: '⚔️', label: 'Ataque',    valor: 26,  costo: 4 },
            { stat: 'defensa',   emoji: '🛡️', label: 'Defensa',   valor: 15,  costo: 4 },
            { stat: 'velocidad', emoji: '🍃', label: 'Velocidad', valor: 12,  costo: 4 },
            { stat: 'critico',   emoji: '🌀', label: 'Crítico',   valor: 1,   costo: 4 }
        ],
        S: [
            { stat: 'hp',        emoji: '❤️', label: 'Vitalidad', valor: 180, costo: 5 },
            { stat: 'ataque',    emoji: '⚔️', label: 'Ataque',    valor: 30,  costo: 5 },
            { stat: 'defensa',   emoji: '🛡️', label: 'Defensa',   valor: 25,  costo: 5 },
            { stat: 'velocidad', emoji: '🍃', label: 'Velocidad', valor: 20,  costo: 5 },
            { stat: 'critico',   emoji: '🌀', label: 'Crítico',   valor: 2,   costo: 5 }
        ]
    };

    // ==========================================
    // ESTADO INTERNO
    // ==========================================
    function crearActivacionesBase() {
        return {
            D: [false, false, false, false, false],
            C: [false, false, false, false, false],
            B: [false, false, false, false, false],
            A: [false, false, false, false, false],
            S: [false, false, false, false, false]
        };
    }

    function crearRangosCompletadosBase() {
        return { D: false, C: false, B: false, A: false, S: false };
    }

    let puntosGastados = 0;
    let puntosBonoArbol = 0;
    let activations = crearActivacionesBase();
    let rangosCompletados = crearRangosCompletadosBase();
    let viewingIdx = 0;

    // ==========================================
    // HELPERS
    // ==========================================
    function getPuntosTotal() {
        return puntosBonoArbol;
    }

    function getPuntosDisponibles() {
        return Math.max(0, getPuntosTotal() - puntosGastados);
    }

    function getIndiceRango(rKey) {
        return RANGOS.indexOf(rKey);
    }

    function isRangoDesbloqueado(rKey) {
        const idx = getIndiceRango(rKey);
        if (idx <= 0) return true;
        return Boolean(rangosCompletados[RANGOS[idx - 1]]);
    }

    function getRangoActualIdx() {
        for (let i = 0; i < RANGOS.length; i++) {
            if (!rangosCompletados[RANGOS[i]]) return i;
        }
        return RANGOS.length - 1;
    }

    // ==========================================
    // CÁLCULO DE BONOS
    // ==========================================
    function calcularBonosArbol() {
        let bonos = { hp: 0, ataque: 0, defensa: 0, velocidad: 0, critico: 0, evasion: 0 };

        for (let r = 0; r < RANGOS.length; r++) {
            let rKey = RANGOS[r];
            for (let n = 0; n < 5; n++) {
                if (activations[rKey][n]) {
                    let nodo = NODOS[rKey][n];
                    bonos[nodo.stat] = (bonos[nodo.stat] || 0) + nodo.valor;
                }
            }
        }

        for (let r = 0; r < RANGOS.length; r++) {
            let rKey = RANGOS[r];
            if (rangosCompletados[rKey]) {
                let b = RANGO_BONO_STATS[rKey];
                bonos.hp        += b.hp;
                bonos.ataque    += b.ataque;
                bonos.defensa   += b.defensa;
                bonos.velocidad += b.velocidad;
                bonos.critico   += b.critico;
            }
        }

        return bonos;
    }

    function aplicarBonosAlPersonaje() {
        if (!window.personaje) return;

        let bonos = calcularBonosArbol();
        window.personaje.arbolBonos = bonos;

        // Recalcular hpMax con bono sin resetear el HP actual
        if (typeof calcularHP === 'function') {
            let hpBase = calcularHP(window.personaje.nivel);
            window.personaje.hpMax = hpBase + bonos.hp;
            window.personaje.hp = Math.min(window.personaje.hp, window.personaje.hpMax);
        }

        // Guardar stats base la primera vez para no acumular bonos dobles
    if (window.personaje._baseStats === undefined) {
        window.personaje._baseStats = {
            ataque:    window.personaje.ataque    || 0,
            defensa:   window.personaje.defensa   || 0,
            velocidad: window.personaje.velocidad || 0,
            critico:   window.personaje.critico   || 0
        };
    }

    // Aplicar TODOS los bonos directamente al personaje
    window.personaje.ataque    = window.personaje._baseStats.ataque    + bonos.ataque;
    window.personaje.defensa   = window.personaje._baseStats.defensa   + bonos.defensa;
    window.personaje.velocidad = window.personaje._baseStats.velocidad + bonos.velocidad;
    window.personaje.critico   = window.personaje._baseStats.critico   + bonos.critico;
}

    // ==========================================
    // INYECTAR CSS
    // ==========================================
    function inyectarCSS() {
        if (document.getElementById('arbol-styles')) return;
        const style = document.createElement('style');
        style.id = 'arbol-styles';
        style.textContent = `
            #arbol-overlay-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #ffffff;
                display: flex;
                flex-direction: column;
            }
            .arbol-card {
                width: 100%;
                height: 100%;
                background: #ffffff;
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding: 8px;
                box-sizing: border-box;
                overflow: hidden;
                position: relative;
            }
            .arbol-close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: #e2e8f0;
                border: none;
                border-radius: 50%;
                width: 26px;
                height: 26px;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 20;
                color: #334155;
                font-weight: bold;
                line-height: 1;
            }
            .arbol-close-btn:hover { background: #cbd5e0; }
            .arbol-top-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8f9fc;
                padding: 5px 10px;
                border-radius: 40px;
                border: 1px solid #e9ecf0;
                flex-shrink: 0;
                margin-right: 30px;
            }
            .arbol-rank-strip { display: flex; gap: 5px; }
            .arbol-rank-badge {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: #edf2f7;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.2s;
            }
            .arbol-rank-badge.completado { background: #fef3c7; border-color: #fbbf24; }
            .arbol-rank-badge.actual     { background: #3182ce; border-color: #90cdf4; box-shadow: 0 0 0 3px rgba(49,130,206,0.25); }
            .arbol-rank-badge.bloqueado  { background: #e2e8f0; opacity: 0.5; cursor: not-allowed; }
            .arbol-rank-badge.viendo     { outline: 2px solid #3182ce; outline-offset: 1px; }
            .arbol-points-box {
                background: #1a202c;
                color: #fbbf24;
                padding: 4px 12px;
                border-radius: 40px;
                font-weight: 700;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .arbol-header { padding: 0 4px; flex-shrink: 0; }
            .arbol-rank-context {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
            }
            .arbol-rank-title  { font-weight: 700; font-size: 16px; color: #1e293b; }
            .arbol-rank-prog   { font-size: 12px; background: #eef2f6; padding: 3px 9px; border-radius: 40px; color: #334155; font-weight: 600; }
            .arbol-lore        { font-size: 11px; color: #5f6b7a; margin-top: 1px; }
            .arbol-main-row {
                display: flex;
                gap: 8px;
                flex: 1 1 auto;
                min-height: 0;
            }
            .arbol-constellation {
                flex: 3;
                background: #f1f5f9;
                border-radius: 20px;
                position: relative;
                overflow: hidden;
                border: 1px solid #dce3ec;
            }
            .arbol-nodes-area {
                position: relative;
                width: 100%;
                height: 100%;
            }
            .arbol-node {
                position: absolute;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: white;
                border: 2px solid #cbd5e0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                transform: translate(-50%, -50%);
                transition: all 0.2s;
                box-shadow: 0 3px 6px rgba(0,0,0,0.07);
                cursor: pointer;
            }
            .arbol-node.disponible {
                border-color: #3182ce;
                background: #ebf8ff;
                box-shadow: 0 0 0 4px rgba(49,130,206,0.2);
            }
            .arbol-node.activado {
                border-color: #d97706;
                background: #fef3c7;
                box-shadow: 0 0 0 4px rgba(245,158,11,0.2);
            }
            .arbol-node.bloqueado {
                border-color: #cbd5e0;
                background: #edf2f7;
                opacity: 0.7;
                cursor: not-allowed;
                pointer-events: none;
            }
            .arbol-node-tip {
                position: absolute;
                bottom: 110%;
                left: 50%;
                transform: translateX(-50%);
                background: #1e293b;
                color: white;
                font-size: 10px;
                padding: 4px 10px;
                border-radius: 20px;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.15s;
                z-index: 30;
            }
            .arbol-node:hover .arbol-node-tip { opacity: 1; }
            .arbol-nivel-req {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(241,245,249,0.93);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-radius: 20px;
                font-size: 12px;
                color: #64748b;
                font-weight: 600;
                gap: 4px;
                z-index: 5;
            }
            .arbol-bonus {
                flex: 1.2;
                background: #fef9e7;
                border-radius: 16px;
                border: 1px solid #fde68a;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 8px 4px;
                gap: 4px;
                flex-shrink: 0;
            }
            .arbol-bonus-label {
                font-size: 9px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #b45309;
                text-align: center;
            }
            .arbol-bonus-desc {
                font-size: 11px;
                font-weight: 700;
                color: #78350f;
                text-align: center;
                line-height: 1.4;
            }
            .arbol-bonus-icon { font-size: 30px; }
            .arbol-progress {
                display: flex;
                gap: 4px;
                background: #e9eef3;
                padding: 4px 8px;
                border-radius: 60px;
                flex-shrink: 0;
            }
            .arbol-seg {
                height: 7px;
                flex: 1;
                background: #cbd5e0;
                border-radius: 60px;
                transition: all 0.2s;
            }
            .arbol-seg.lleno     { background: #3182ce; box-shadow: 0 0 5px #3182ce; }
            .arbol-seg.lleno.r-c { background: #38a169; box-shadow: 0 0 5px #38a169; }
            .arbol-seg.lleno.r-b { background: #d69e2e; box-shadow: 0 0 5px #d69e2e; }
            .arbol-seg.lleno.r-a { background: #9f7aea; box-shadow: 0 0 5px #9f7aea; }
            .arbol-seg.lleno.r-s { background: #e53e3e; box-shadow: 0 0 5px #e53e3e; }
            .arbol-stats-bar {
                display: flex;
                justify-content: space-around;
                background: white;
                border-radius: 60px;
                padding: 6px 4px;
                border: 1px solid #e2e8f0;
                flex-shrink: 0;
            }
            .arbol-stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                min-width: 38px;
            }
            .arbol-stat-emoji { font-size: 16px; margin-bottom: 1px; }
            .arbol-stat-num {
                font-weight: 700;
                font-size: 12px;
                background: #f1f5f9;
                padding: 1px 7px;
                border-radius: 40px;
                color: #1e293b;
                transition: background 0.2s;
            }
            .arbol-stat-num.arbol-flash { background: #fbbf24 !important; }
            .arbol-ascend {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(255,255,255,0.88);
                backdrop-filter: blur(4px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                color: #1e293b;
                font-weight: 800;
                font-size: 18px;
                z-index: 50;
                pointer-events: none;
                text-align: center;
                gap: 8px;
                animation: arbolFadeIn 0.4s ease;
            }
            @keyframes arbolFadeIn { from { opacity: 0; } to { opacity: 1; } }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // RENDER COMPLETO
    // ==========================================
    function render() {
        const container = document.getElementById('arbol-overlay-container');
        if (!container) return;

        const rKey        = RANGOS[viewingIdx];
        const activos     = activations[rKey].filter(v => v).length;
        const puntosDisp  = getPuntosDisponibles();
        const desbloqueado = isRangoDesbloqueado(rKey);

        // Stats con bonos del árbol
        let bonos = calcularBonosArbol();
        let p = window.personaje;
        let stats = {
            hp:  p ? p.hpMax : 100,
            atq: p ? (p.ataque  + (p.equipBonos?.ATK || 0) + bonos.ataque)  : 25,
            def: p ? (p.defensa + (p.equipBonos?.DEF || 0) + bonos.defensa) : 20,
            vel: p ? (p.velocidad + bonos.velocidad) : 100,
            crt: p ? parseFloat((p.critico + bonos.critico).toFixed(1)) : 8
        };

        container.innerHTML = `
        <div class="arbol-card" id="arbol-card-inner">
            <button class="arbol-close-btn" onclick="window.closeArbol()">✕</button>

            <div class="arbol-top-bar">
                <div class="arbol-rank-strip" id="arbol-strip"></div>
                <div class="arbol-points-box">⚡ <span id="arbol-pts">${puntosDisp}</span></div>
            </div>

            <div class="arbol-header">
                <div class="arbol-rank-context">
                    <span class="arbol-rank-title">Rango ${rKey} ${RANGO_EMOJI[rKey]}</span>
                    <span class="arbol-rank-prog">${activos}/5</span>
                </div>
                <div class="arbol-lore">${RANGO_LORE[rKey]}</div>
            </div>

            <div class="arbol-main-row">
                <div class="arbol-constellation">
                    <div class="arbol-nodes-area" id="arbol-nodes"></div>
                    ${!desbloqueado
                        ? `<div class="arbol-nivel-req">🔒<span>Debes completar el rango ${RANGOS[Math.max(0, getIndiceRango(rKey) - 1)]}</span><span style="font-size:10px;color:#94a3b8">El Árbol ahora progresa solo por Libro Bingo</span></div>`
                        : ''}
                </div>
                <div class="arbol-bonus">
                    <div class="arbol-bonus-label">BONO<br>DE RANGO</div>
                    <div class="arbol-bonus-desc">${RANGO_BONO_COMPLETO[rKey]}</div>
                    <div class="arbol-bonus-icon">${rangosCompletados[rKey] ? '🏆' : '🔒'}</div>
                </div>
            </div>

            <div class="arbol-progress">
                <div class="arbol-seg" data-i="0"></div>
                <div class="arbol-seg" data-i="1"></div>
                <div class="arbol-seg" data-i="2"></div>
                <div class="arbol-seg" data-i="3"></div>
                <div class="arbol-seg" data-i="4"></div>
            </div>

            <div class="arbol-stats-bar">
                <div class="arbol-stat-item"><span class="arbol-stat-emoji">❤️</span><span class="arbol-stat-num" id="arbol-hp">${stats.hp}</span></div>
                <div class="arbol-stat-item"><span class="arbol-stat-emoji">⚔️</span><span class="arbol-stat-num" id="arbol-atq">${stats.atq}</span></div>
                <div class="arbol-stat-item"><span class="arbol-stat-emoji">🛡️</span><span class="arbol-stat-num" id="arbol-def">${stats.def}</span></div>
                <div class="arbol-stat-item"><span class="arbol-stat-emoji">🍃</span><span class="arbol-stat-num" id="arbol-vel">${stats.vel}</span></div>
                <div class="arbol-stat-item"><span class="arbol-stat-emoji">🌀</span><span class="arbol-stat-num" id="arbol-crt">${stats.crt}</span></div>
            </div>
        </div>
        `;

        renderTimeline();
        renderNodos();
        renderProgreso();
    }

    function renderTimeline() {
        const strip = document.getElementById('arbol-strip');
        if (!strip) return;
        const rangoActualIdx = getRangoActualIdx();
        strip.innerHTML = '';
        RANGOS.forEach((r, idx) => {
            const badge = document.createElement('div');
            badge.className = 'arbol-rank-badge';
            if (rangosCompletados[r])       badge.classList.add('completado');
            if (idx === rangoActualIdx)     badge.classList.add('actual');
            if (!isRangoDesbloqueado(r))   badge.classList.add('bloqueado');
            if (idx === viewingIdx)         badge.classList.add('viendo');
            badge.textContent = RANGO_EMOJI[r];
            badge.title = RANGO_LORE[r];
            badge.addEventListener('click', () => { viewingIdx = idx; render(); });
            strip.appendChild(badge);
        });
    }

    function renderNodos() {
        const area = document.getElementById('arbol-nodes');
        if (!area) return;

        const rKey           = RANGOS[viewingIdx];
        const nodos          = NODOS[rKey];
        const desbloqueado   = isRangoDesbloqueado(rKey);
        const puntosDisp     = getPuntosDisponibles();
        const rangoActualIdx = getRangoActualIdx();
        const isFuturo       = viewingIdx > rangoActualIdx;
        const isPasado       = viewingIdx < rangoActualIdx;

        const POS = [
            { top: '22%', left: '50%' },
            { top: '50%', left: '20%' },
            { top: '50%', left: '50%' },
            { top: '50%', left: '80%' },
            { top: '78%', left: '50%' }
        ];

        area.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const nodo = document.createElement('div');
            nodo.className = 'arbol-node';
            nodo.style.top  = POS[i].top;
            nodo.style.left = POS[i].left;

            const tip = document.createElement('span');
            tip.className = 'arbol-node-tip';
            tip.textContent = `${nodos[i].label} +${nodos[i].valor} · costo ${nodos[i].costo}⚡`;
            nodo.appendChild(tip);

            if (!desbloqueado || isFuturo) {
                nodo.classList.add('bloqueado');
                nodo.appendChild(document.createTextNode('🔒'));
            } else if (isPasado || activations[rKey][i]) {
                nodo.classList.add('activado');
                nodo.appendChild(document.createTextNode(nodos[i].emoji));
            } else {
                if (puntosDisp >= nodos[i].costo) {
                    nodo.classList.add('disponible');
                } else {
                    nodo.classList.add('bloqueado');
                }
                nodo.appendChild(document.createTextNode('⬆️'));
                if (viewingIdx === rangoActualIdx) {
                    (function (idx) {
                        nodo.addEventListener('click', () => activarNodo(idx));
                    })(i);
                }
            }
            area.appendChild(nodo);
        }
    }

    function renderProgreso() {
        const segs = document.querySelectorAll('.arbol-seg');
        if (!segs.length) return;
        const rKey   = RANGOS[viewingIdx];
        const activos = activations[rKey].filter(v => v).length;
        const COLOR  = { C: 'r-c', B: 'r-b', A: 'r-a', S: 'r-s' };
        segs.forEach((seg, idx) => {
            seg.className = 'arbol-seg';
            if (idx < activos) {
                seg.classList.add('lleno');
                if (COLOR[rKey]) seg.classList.add(COLOR[rKey]);
            }
        });
    }

    // ==========================================
    // ACTIVAR NODO
    // ==========================================
    function activarNodo(idx) {
        const rangoActualIdx = getRangoActualIdx();
        if (viewingIdx !== rangoActualIdx) return;
        const rKey = RANGOS[viewingIdx];
        if (activations[rKey][idx]) return;
        const nodo = NODOS[rKey][idx];
        if (getPuntosDisponibles() < nodo.costo) return;

        activations[rKey][idx] = true;
        puntosGastados += nodo.costo;

        // Verificar rango completado
        if (!rangosCompletados[rKey] && activations[rKey].every(v => v)) {
            rangosCompletados[rKey] = true;
            aplicarBonosAlPersonaje();
            guardarArbol();
            render();
            mostrarAscension(rKey);
            return;
        }

        aplicarBonosAlPersonaje();
        guardarArbol();
        render();
    }

    function mostrarAscension(rKey) {
        setTimeout(() => {
            const card = document.getElementById('arbol-card-inner');
            if (!card) return;
            const overlay = document.createElement('div');
            overlay.className = 'arbol-ascend';
            overlay.innerHTML = `<span>✦ RANGO ${rKey} COMPLETADO ✦</span><span style="font-size:32px">${RANGO_EMOJI[rKey]}</span>`;
            card.appendChild(overlay);
            setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 1600);
        }, 80);
    }

    // ==========================================
    // GUARDAR / CARGAR
    // ==========================================
    function guardarArbol() {
        if (typeof guardarPartida === 'function') guardarPartida();
    }

    function obtenerDatos() {
        return {
            version: ARBOL_DATA_VERSION,
            puntosGastados:   puntosGastados,
            puntosBonoArbol:  puntosBonoArbol,
            activations:      activations,
            rangosCompletados: rangosCompletados
        };
    }

    function normalizarActivaciones(raw) {
        const base = crearActivacionesBase();
        if (!raw || typeof raw !== 'object') return base;
        RANGOS.forEach((r) => {
            const lista = Array.isArray(raw[r]) ? raw[r] : [];
            base[r] = Array.from({ length: 5 }, (_, idx) => Boolean(lista[idx]));
        });
        return base;
    }

    function normalizarRangosCompletados(raw) {
        const base = crearRangosCompletadosBase();
        if (!raw || typeof raw !== 'object') return base;
        RANGOS.forEach((r) => {
            base[r] = Boolean(raw[r]);
        });
        return base;
    }

    function reiniciarProgresoArbol() {
        puntosGastados = 0;
        puntosBonoArbol = 0;
        activations = crearActivacionesBase();
        rangosCompletados = crearRangosCompletadosBase();
    }

    function cargarDatos(data) {
        if (!data || data.version !== ARBOL_DATA_VERSION) {
            reiniciarProgresoArbol();
            aplicarBonosAlPersonaje();
            return;
        }

        puntosGastados = Math.max(0, Number(data.puntosGastados) || 0);
        puntosBonoArbol = Math.max(0, Number(data.puntosBonoArbol) || 0);
        activations = normalizarActivaciones(data.activations);
        rangosCompletados = normalizarRangosCompletados(data.rangosCompletados);

        if (puntosGastados > puntosBonoArbol) {
            puntosGastados = puntosBonoArbol;
        }

        aplicarBonosAlPersonaje();
    }

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    function init() {
        inyectarCSS();
        if (typeof parchearActualizarStats === 'function') parchearActualizarStats();
        viewingIdx = getRangoActualIdx();
        render();
    }

    // ==========================================
    // EXPORTAR
    // ==========================================
    window.arbolSystem = {
        init:         init,
        render:       render,
        obtenerDatos: obtenerDatos,
        cargarDatos:  cargarDatos
    };

    console.log('logic-arbol.js cargado correctamente');

    // [BINGO→ARBOL] Recibe puntos desde logic-bingo.js
    window.arbolRecibirPunto = function(cantidad, origen) {
        if (origen !== 'bingo') return false;

        const puntos = Math.max(0, parseInt(cantidad, 10) || 0);
        if (puntos <= 0) return false;

        puntosBonoArbol += puntos;
        guardarArbol();
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion('🌳 +' + puntos + ' punto de Árbol');
        }
        var container = document.getElementById('arbol-overlay-container');
        if (container && container.style.display !== 'none') {
            render();
        }
        return true;
    };

})();

window.toggleArbol = function(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    var container = document.getElementById('arbol-overlay-container');
    var isVisible = container && container.style.display !== 'none' && container.style.display !== '';
    if (typeof closeAllPanels === 'function') closeAllPanels();
    if (!isVisible) {
        if (container) {
            container.style.display = 'flex';
            if (window.arbolSystem && typeof window.arbolSystem.init === 'function') {
                window.arbolSystem.init();
            }
        }
    }
};

window.closeArbol = function() {
    var container = document.getElementById('arbol-overlay-container');
    if (container) container.style.display = 'none';
};