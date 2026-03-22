// logic-bingo.js
(function () {

    const BINGO_KEY = 'bingo_state';

    const bingoPersonajes = {
        'Rango D': ['Naruto Uzumaki','Sasuke Uchiha','Sakura Haruno','Shikamaru Nara','Hinata Hyūga','Rock Lee','Neji Hyūga','Tenten','Gaara','Kankurō','Temari','Choji Akimichi','Ino Yamanaka','Kiba Inuzuka','Shino Aburame'],
        'Rango C': ['Sai Yamanaka','Yamato','Rin Nohara','Shizune','Ibiki Morino','Gamabunta','Gamakichi','Zabuza Momochi','Haku','Suigetsu Hōzuki','Darui','Karui','Guren','Kimimaro'],
        'Rango B': ['Might Guy','Kakashi Hatake','Jiraiya','Tsunade','Orochimaru','Danzō Shimura','Killer Bee','Chiyo','Anko Mitarashi','Utakata','Karin Uzumaki','Zetsu Blanco','Jugo'],
        'Rango A': ['Hashirama Senju','Tobirama Senju','Hiruzen Sarutobi','Minato Namikaze','Tsunade Senju','Tercer Kazekage','Tercer Mizukage','Ōnoki','Madara Uchiha','Itachi Uchiha','Shisui Uchiha','Pain','Konan','Obito Uchiha','Hanzō de la Salamandra'],
        'Rango S': ['Hagoromo Ōtsutsuki','Hamura Ōtsutsuki','Kaguya Ōtsutsuki','Isshiki Ōtsutsuki','Momoshiki Ōtsutsuki','Indra Ōtsutsuki','Ashura Ōtsutsuki','Kinshiki Ōtsutsuki','Urashiki Ōtsutsuki','Toneri Ōtsutsuki','Obito Jinchūriki del Jūbi','Madara Sabio de los Seis Caminos','Naruto Sabio de los Seis Caminos','Sasuke Rinnegan Supremo']
    };

const bingoConfig = {
        'Rango D': { nivelMin: 1,  nivelMax: 20,  oro: 200,  xp: 5  },
        'Rango C': { nivelMin: 20, nivelMax: 40,  oro: 400,  xp: 12 },
        'Rango B': { nivelMin: 40, nivelMax: 60,  oro: 700,  xp: 22 },
        'Rango A': { nivelMin: 60, nivelMax: 80,  oro: 1200, xp: 32 },
        'Rango S': { nivelMin: 80, nivelMax: 100, oro: 2000, xp: 50 }
    };

    const bingoMultiplicadores = [
        { hp:3.0,  atk:2.1,  def:2.7,  spd:1.8,  res:2.5,  crt:1.5,  eva:1.0 },
        { hp:1.9,  atk:2.2,  def:1.8,  spd:2.5,  res:2.0,  crt:2.1,  eva:1.0 },
        { hp:2.2,  atk:2.3,  def:2.0,  spd:2.0,  res:2.2,  crt:2.5,  eva:1.0 },
        { hp:2.5,  atk:2.0,  def:2.2,  spd:1.9,  res:4.0,  crt:1.8,  eva:1.0 },
        { hp:2.25, atk:2.25, def:2.25, spd:2.25, res:2.25, crt:2.25, eva:1.0 },
        { hp:2.5,  atk:1.9,  def:2.2,  spd:2.1,  res:3.0,  crt:2.0,  eva:2.0 },
        { hp:2.7,  atk:2.5,  def:1.7,  spd:1.9,  res:1.5,  crt:2.5,  eva:1.5 },
        { hp:1.8,  atk:2.1,  def:1.8,  spd:2.4,  res:2.0,  crt:3.0,  eva:2.8 },
        { hp:3.5,  atk:1.5,  def:3.0,  spd:1.5,  res:2.5,  crt:1.5,  eva:1.2 },
        { hp:2.2,  atk:2.0,  def:2.0,  spd:2.8,  res:2.0,  crt:1.75, eva:2.2 },
        { hp:2.4,  atk:2.2,  def:2.5,  spd:2.0,  res:3.5,  crt:1.5,  eva:2.0 }
    ];

let estado = {
    primeraVez: false,
    timerInicio: 0,
    timerSegundos: 0,
    misionActiva: false,
    rangoSeleccionado: false,
    rangosPendientes: [],
    rangoActual: '',
    enemigos: []
};

    let intervaloReloj = null;
    let intervaloBatalla = null;
    let bingoOverlay = null;
    let bingoJutsuBattle = null;

function cargarEstado() {
    try {
        const raw = localStorage.getItem(BINGO_KEY);
        if (raw) {
            const d = JSON.parse(raw);
            estado.primeraVez        = d.primeraVez        || false;
            estado.timerInicio       = d.timerInicio       || 0;
            estado.misionActiva      = d.misionActiva      || false;
            estado.rangoSeleccionado = d.rangoSeleccionado || false;
            estado.rangosPendientes  = d.rangosPendientes  || [];
            estado.rangoActual       = d.rangoActual       || '';
            estado.enemigos          = d.enemigos          || [];
            if (estado.timerInicio > 0) {
                const transcurridos = Math.floor((Date.now() - estado.timerInicio) / 1000);
                estado.timerSegundos = Math.max(0, 8 * 3600 - transcurridos);
                if (estado.timerSegundos === 0) {
                    estado.primeraVez = false; estado.timerInicio = 0;
                    estado.misionActiva = false; estado.rangoSeleccionado = false;
                    estado.rangosPendientes = []; estado.rangoActual = ''; estado.enemigos = [];
                    guardarEstado();
                }
            } else {
                estado.timerSegundos = 0;
            }
        }
    } catch(e) {}
}

function guardarEstado() {
    try {
        if (window._reiniciando) return;
        localStorage.setItem(BINGO_KEY, JSON.stringify(estado));
    } catch(e) {}
}

    function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generarEnemigos(rango) {
        const cfg = bingoConfig[rango];
        const lista = [...bingoPersonajes[rango]].sort(() => 0.5 - Math.random()).slice(0, 5);
        return lista.map(nombre => {
            const nivel = rnd(cfg.nivelMin, cfg.nivelMax);
            const mult  = bingoMultiplicadores[rnd(0, bingoMultiplicadores.length - 1)];

            const baseHP  = window.calcularHP          ? window.calcularHP(nivel)          : 100 + 25  * (nivel - 1);
            const baseATK = window.calcularAtaque       ? window.calcularAtaque(nivel)      : 25  + 12  * (nivel - 1);
            const baseDEF = window.calcularDefensa      ? window.calcularDefensa(nivel)     : 20  + 8   * (nivel - 1);
            const baseSPD = window.calcularVelocidad    ? window.calcularVelocidad(nivel)   : 100 + 2   * (nivel - 1);
            const baseCRT = window.calcularCritico      ? window.calcularCritico(nivel)     : Math.min(8 + 0.35 * (nivel - 1), 30);
            const baseRES = window.calcularResistencia  ? window.calcularResistencia(nivel) : 80  + 15  * (nivel - 1);
            const baseEVA = window.calcularEvasion      ? window.calcularEvasion(nivel)     : Math.min(5 + 0.20 * (nivel - 1), 17);

            const hp  = Math.floor(baseHP  * mult.hp);
            const atk = Math.floor(baseATK * mult.atk);
            const def = Math.floor(baseDEF * mult.def);
            const spd = Math.floor(baseSPD * mult.spd);
            const crt = Math.min(Math.floor(baseCRT * mult.crt), 100);
            const res = Math.floor(baseRES * mult.res);
            const eva = Math.min(parseFloat((baseEVA * mult.eva).toFixed(1)), 100);

            return {
                id: `bingo-${rango}-${nombre}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                nombre, nivel,
                atk, def, hp, spd, crt, res, eva,
                maxHp: hp,
                oro: cfg.oro + rnd(0, 100),
                xp: cfg.xp,
                fuente: 'libro_bingo',
                recompensaArbol: true,
                derrotado: false,
                gano: null
            };
        });
    }

    function getPlayer() {
        const p = window.personaje;
        if (!p) return { hp: 100, maxHp: 100, mp: 50, maxMp: 50, atk: 15, def: 10 };
        return {
            hp: p.hp, maxHp: p.hpMax,
            mp: p.mp, maxMp: p.mpMax,
            atk: p.ataque + (p.equipBonos?.ATK || 0),
            def: p.defensa
        };
    }

    function todosDerrotados() {
        return estado.enemigos.length > 0 && estado.enemigos.every(e => e.derrotado);
    }

function actualizarTimer() {
    const t = Math.max(0, estado.timerSegundos);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    const texto = (t === 0 && !estado.primeraVez)
        ? '✅ ¡Disponible!'
        : `⏳ ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    const el  = document.getElementById('bingo-timer-display');
    const el2 = document.getElementById('bingo-timer-enemigos');
    if (el)  el.innerText  = texto;
    if (el2) el2.innerText = texto;
    const btn = document.getElementById('bingo-empezar-btn');
    if (btn) {
        const bloqueado = estado.primeraVez && estado.timerSegundos > 0;
        btn.style.opacity       = bloqueado ? '0.5' : '1';
        btn.style.pointerEvents = bloqueado ? 'none' : 'auto';
    }
}

function iniciarReloj() {
    if (intervaloReloj) clearInterval(intervaloReloj);
    intervaloReloj = setInterval(() => {
        if (estado.timerInicio > 0) {
            const transcurridos = Math.floor((Date.now() - estado.timerInicio) / 1000);
            estado.timerSegundos = Math.max(0, 8 * 3600 - transcurridos);
            if (estado.timerSegundos === 0) {
                estado.primeraVez = false; estado.timerInicio = 0;
                estado.misionActiva = false; estado.rangoSeleccionado = false;
                estado.rangosPendientes = []; estado.rangoActual = ''; estado.enemigos = [];
                guardarEstado();
            }
            actualizarTimer();
            guardarEstado();
        }
    }, 1000);
}

    function mostrarPantalla(id) {
        ['bingo-screen-home','bingo-screen-timer','bingo-screen-rangos','bingo-screen-enemigos','bingo-screen-batalla'].forEach(s => {
            const el = document.getElementById(s);
            if (el) el.style.display = 'none';
        });
        const target = document.getElementById(id);
        if (target) target.style.display = 'flex';
    }

function renderEnemigos() {
    const lista = document.getElementById('bingo-lista-enemigos');
    if (!lista) return;
    lista.innerHTML = '';
    const _arbolPct = {'Rango D':10,'Rango C':20,'Rango B':30,'Rango A':40,'Rango S':50};
        const _pctArbol = _arbolPct[estado.rangoActual] || 0;
    estado.enemigos.forEach((e, i) => {
        const div = document.createElement('div');
        div.className = 'mis-mission-item' + (e.derrotado ? ' mis-locked' : '');
        div.style.borderLeftColor = e.derrotado ? '#aaa' : '#8B4513';
        div.style.boxSizing    = 'border-box';
        div.style.width        = '100%';
        div.style.padding      = '3px 6px';
        div.style.gap          = '1px';
        div.style.borderRadius = '6px';
        div.style.minHeight    = '0';
        div.innerHTML = `
            <div class="mis-mission-header" style="font-size:10px;margin-bottom:1px;line-height:1.2;">${e.derrotado ? (e.gano ? '🏆' : '💔') : '⚔️'} ${e.nombre}</div>
            <div class="mis-mission-details" style="font-size:9px;line-height:1.2;">
                <div class="mis-mission-left" style="gap:1px;">
                    <span style="padding:1px 4px;">⚔️ ${e.atk}</span>
                    <span style="padding:1px 4px;">🛡️ ${e.def}</span>
                </div>
                <div class="mis-mission-right" style="gap:1px;">
                    <span style="padding:1px 4px;">❤️ ${e.maxHp}</span>
                    <span style="padding:1px 4px;">💰 ${e.oro}</span>
                </div>
            </div>
            ${!e.derrotado && _pctArbol > 0 ? `<div style="font-size:8px;color:#a0d080;text-align:right;padding:1px 4px;">🌳 Árbol: ${_pctArbol}%</div>` : ''}
            ${e.derrotado ? '<div class="mis-mission-lock" style="padding:1px;font-size:9px;line-height:1.2;">' + (e.gano ? '✅ Eliminado' : '❌ Derrotado') + '</div>' : ''}
        `;
        if (!e.derrotado) {
            div.addEventListener('click', () => iniciarBatalla(i));
        }
        lista.appendChild(div);
    });
}

    function addLog(msg) {
        const log = document.getElementById('bingo-combat-log');
        if (!log) return;
        const entry = document.createElement('div');
        entry.className = 'mis-log-entry';
        entry.innerText = msg;
        log.insertBefore(entry, log.firstChild);
        if (log.children.length > 15) log.removeChild(log.lastChild);
    }

    function iniciarBatalla(idx) {
        if (intervaloBatalla) { clearInterval(intervaloBatalla); intervaloBatalla = null; }

        const enemigo = estado.enemigos[idx];
        if (!enemigo || enemigo.fuente !== 'libro_bingo') return;
        enemigo.hp = enemigo.maxHp;

        const charHp  = document.getElementById('bingo-char-hp');
        const charMp  = document.getElementById('bingo-char-mp');
        const enemHp  = document.getElementById('bingo-enemy-hp');
        const logEl   = document.getElementById('bingo-combat-log');

        if (logEl) logEl.innerHTML = '';
        if (charHp) charHp.style.width = '100%';
        if (charMp) charMp.style.width = '100%';
        if (enemHp) { enemHp.style.transition = 'none'; enemHp.style.width = '0%'; requestAnimationFrame(() => requestAnimationFrame(() => { enemHp.style.transition = 'width 1s ease'; enemHp.style.width = '100%'; })); }

        mostrarPantalla('bingo-screen-batalla');
        window.combateActivo = true;
        bingoJutsuBattle = window.jutsusSystem && typeof window.jutsusSystem.createBattleState === 'function'
            ? window.jutsusSystem.createBattleState('bingo')
            : null;

        intervaloBatalla = setInterval(() => {
            const player = getPlayer();
            if (player.hp <= 0 || enemigo.hp <= 0) return;

            if (window.jutsusSystem && typeof window.jutsusSystem.prepareTurn === 'function') {
                window.jutsusSystem.prepareTurn(bingoJutsuBattle, 'player', enemigo, addLog);
            }
            let dmgJugador = Math.max(1, Math.floor(player.atk - enemigo.def / 3 + Math.random() * 8));
            if (window.jutsusSystem && typeof window.jutsusSystem.applyPlayerDamage === 'function') {
                dmgJugador = window.jutsusSystem.applyPlayerDamage(dmgJugador, enemigo, bingoJutsuBattle, addLog);
            }
            enemigo.hp = Math.max(0, enemigo.hp - dmgJugador);
            addLog(`🥷 Atacas y causas ${dmgJugador} daño.`);

            if (charHp) charHp.style.width = Math.max(0, (player.hp / player.maxHp) * 100) + '%';
            if (charMp) charMp.style.width = Math.max(0, (player.mp / player.maxMp) * 100) + '%';
            if (enemHp) enemHp.style.width = Math.max(0, (enemigo.hp / enemigo.maxHp) * 100) + '%';

            if (typeof updateBars === 'function') updateBars();

            if (enemigo.hp <= 0) {
                addLog(`💀 ¡${enemigo.nombre} derrotado! +${enemigo.xp} XP y +${enemigo.oro} Oro.`);
                if (typeof window.ganarExperiencia === 'function') window.ganarExperiencia(enemigo.xp);
                if (typeof window.ganarOro === 'function') window.ganarOro(enemigo.oro);

                const enemigoDefinido = estado.enemigos[idx];
                const recompensaArbolPermitida = Boolean(
                    estado.misionActiva &&
                    estado.rangoSeleccionado &&
                    enemigoDefinido &&
                    enemigoDefinido.id === enemigo.id &&
                    enemigoDefinido.fuente === 'libro_bingo' &&
                    enemigoDefinido.recompensaArbol === true
                );

                // [BINGO→ARBOL] Probabilidad de punto árbol según rango
                const _arbolProb = {'Rango D':0.10,'Rango C':0.20,'Rango B':0.30,'Rango A':0.40,'Rango S':0.50};
                const _prob = recompensaArbolPermitida ? (_arbolProb[estado.rangoActual] || 0) : 0;
                if (_prob > 0 && Math.random() < _prob) {
                    if (typeof window.arbolRecibirPunto === 'function' && window.arbolRecibirPunto(1, 'bingo')) {
                        addLog('🌳 ¡+1 punto de habilidad para el Árbol!');
                    }
                }
                estado.enemigos[idx].derrotado = true;
                estado.enemigos[idx].gano = true;
                guardarEstado();
                clearInterval(intervaloBatalla);
                intervaloBatalla = null;
                window.combateActivo = false;
setTimeout(() => {
    if (todosDerrotados()) {
        estado.misionActiva = false;
        estado.rangoSeleccionado = false;
        guardarEstado();
        actualizarTimer();
        mostrarPantalla('bingo-screen-timer');
    } else {
        renderEnemigos();
        mostrarPantalla('bingo-screen-enemigos');
    }
}, 800);
                return;
            }

            if (window.jutsusSystem && typeof window.jutsusSystem.prepareTurn === 'function') {
                window.jutsusSystem.prepareTurn(bingoJutsuBattle, 'enemy', enemigo, addLog);
            }
            const controlTurno = window.jutsusSystem && typeof window.jutsusSystem.beforeEnemyAttack === 'function'
                ? window.jutsusSystem.beforeEnemyAttack(bingoJutsuBattle, enemigo, addLog)
                : { skip: false };
            if (controlTurno.skip) {
                return;
            }
            let dmgEnemigo = Math.max(1, Math.floor(enemigo.atk - player.def / 3 + Math.random() * 6));
            if (window.jutsusSystem && typeof window.jutsusSystem.modifyEnemyDamage === 'function') {
                dmgEnemigo = window.jutsusSystem.modifyEnemyDamage(dmgEnemigo, bingoJutsuBattle);
            }
            if (window.jutsusSystem && typeof window.jutsusSystem.applyIncomingDamage === 'function') {
                dmgEnemigo = window.jutsusSystem.applyIncomingDamage(dmgEnemigo, bingoJutsuBattle, enemigo, addLog);
            }
            if (window.personaje) window.personaje.hp = Math.max(0, window.personaje.hp - dmgEnemigo);
            addLog(`👹 ${enemigo.nombre} ataca y causa ${dmgEnemigo} daño.`);

            const playerPost = getPlayer();
            if (charHp) charHp.style.width = Math.max(0, (playerPost.hp / playerPost.maxHp) * 100) + '%';
            if (typeof updateBars === 'function') updateBars();

            if (playerPost.hp <= 0) {
                addLog(`😵 Has sido derrotado...`);
                estado.enemigos[idx].derrotado = true;
                estado.enemigos[idx].gano = false;
                guardarEstado();
                clearInterval(intervaloBatalla);
                intervaloBatalla = null;
                window.combateActivo = false;
                setTimeout(() => {
                    renderEnemigos();
                    mostrarPantalla('bingo-screen-enemigos');
                }, 800);
            }
        }, 700);
    }

    function detenerBatallaBingo() {
        if (intervaloBatalla) { clearInterval(intervaloBatalla); intervaloBatalla = null; }
        window.combateActivo = false;
        if (window.jutsusSystem && typeof window.jutsusSystem.endBattle === 'function') {
            window.jutsusSystem.endBattle(bingoJutsuBattle);
        }
        bingoJutsuBattle = null;
    }

function buildHTML() {
    return `
    <div id="bingo-inner" style="width:100%;height:100%;display:flex;flex-direction:column;gap:4px;padding:8px;overflow:hidden;box-sizing:border-box;">

        <!-- TIMER / EMPEZAR -->
        <div id="bingo-screen-timer" style="display:none;flex-direction:column;gap:16px;">
            <div id="bingo-timer-display" style="background:#1e2a3a;color:white;padding:8px;border-radius:30px;text-align:center;font-weight:bold;font-size:1.1rem;border:2px solid #c79a5e;">⏳ 24:00:00</div>
            <div class="mis-rank-button mis-rank-bingo bingo-scroll-item" id="bingo-empezar-btn"><div class="bingo-brillo"></div><span>⚔️ EMPEZAR</span></div>
        </div>

        <!-- SELECCIÓN DE RANGOS -->
        <div id="bingo-screen-rangos" style="display:none;flex-direction:column;gap:8px;">
            <div style="text-align:center;font-weight:bold;padding:4px;">✨ Elige tu rango ✨</div>
            <div class="mis-rank-button bingo-scroll-item" id="bingo-rango-1"><div class="bingo-brillo"></div><span id="bingo-rango-1-txt"></span></div>
            <div class="mis-rank-button bingo-scroll-item" id="bingo-rango-2"><div class="bingo-brillo"></div><span id="bingo-rango-2-txt"></span></div>
        </div>

        <!-- LISTA ENEMIGOS -->
        <div id="bingo-screen-enemigos" style="display:none;flex-direction:column;gap:8px;">
            <div id="bingo-rango-titulo" style="text-align:center;font-weight:bold;font-size:14px;padding:4px;"></div>
            <div id="bingo-lista-enemigos" style="display:flex;flex-direction:column;gap:4px;overflow:hidden;"></div>
<div id="bingo-timer-enemigos" style="background:#1e2a3a;color:white;padding:6px;border-radius:30px;text-align:center;font-weight:bold;font-size:0.95rem;border:2px solid #c79a5e;margin-top:4px;">⏳ --:--:--</div>
        </div>

        <!-- BATALLA -->
        <div id="bingo-screen-batalla" style="display:none;flex-direction:column;gap:8px;">
            <div class="mis-battle-arena">
                <div class="mis-character-card">
                    <div class="mis-card-emoji">🥷</div>
                    <div class="mis-hp-bar"><div class="mis-hp-fill" id="bingo-char-hp" style="width:100%;"></div></div>
                    <div class="mis-mp-bar"><div class="mis-mp-fill" id="bingo-char-mp" style="width:100%;"></div></div>
                    <div class="mis-bar-labels"><span>❤️</span><span>💙</span></div>
                </div>
                <div class="mis-enemy-card">
                    <div class="mis-card-emoji">👹</div>
                    <div class="mis-hp-bar"><div class="mis-hp-fill" id="bingo-enemy-hp" style="width:100%;"></div></div>
                    <div class="mis-mp-bar"><div class="mis-mp-fill" id="bingo-enemy-mp" style="width:100%;"></div></div>
                    <div class="mis-bar-labels"><span>❤️</span><span>💙</span></div>
                </div>
            </div>
            <div class="mis-combat-log" id="bingo-combat-log"></div>
            <div class="mis-stop-button bingo-scroll-item" id="bingo-stop-batalla"><div class="bingo-brillo"></div><span>⏹️ ABANDONAR</span></div>
        </div>

    </div>`;
}

function mostrarRangosGuardados() {
    const colores = { 'Rango D':'#a5d6a5','Rango C':'#b3e5fc','Rango B':'#ffcc80','Rango A':'#ef9a9a','Rango S':'#ce93d8' };
    const pick = estado.rangosPendientes;
    const r1 = document.getElementById('bingo-rango-1');
    const r2 = document.getElementById('bingo-rango-2');
    if (!r1 || !r2 || pick.length < 2) return;
    document.getElementById('bingo-rango-1-txt').innerText = pick[0];
    r1.style.background = colores[pick[0]];
    r1.dataset.rango = pick[0];
    document.getElementById('bingo-rango-2-txt').innerText = pick[1];
    r2.style.background = colores[pick[1]];
    r2.dataset.rango = pick[1];
}

function abrirLibroBingo() {
    cargarEstado();
    if (!document.getElementById('bingo-scroll-styles')) {
        const style = document.createElement('style');
        style.id = 'bingo-scroll-styles';
        style.textContent = `.bingo-scroll-item { position: relative !important; overflow: hidden !important; display: flex !important; justify-content: center !important; align-items: center !important; }`;
        document.head.appendChild(style);
    }

    const overlay = document.getElementById('missions-overlay-container');
    if (!overlay) return;

    overlay.innerHTML = buildHTML();
    iniciarReloj();
    actualizarTimer();

    if (estado.rangoSeleccionado && estado.misionActiva && !todosDerrotados()) {
        document.getElementById('bingo-rango-titulo').innerText = estado.rangoActual;
        renderEnemigos();
        mostrarPantalla('bingo-screen-enemigos');
    } else if (estado.rangosPendientes.length === 2 && !estado.rangoSeleccionado) {
        mostrarRangosGuardados();
        mostrarPantalla('bingo-screen-rangos');
    } else {
        mostrarPantalla('bingo-screen-timer');
    }

    document.getElementById('bingo-empezar-btn').addEventListener('click', () => {
        if (estado.primeraVez && estado.timerSegundos > 0) return;
        const rangos = ['Rango D','Rango C','Rango B','Rango A','Rango S'];
        const pick = [...rangos].sort(() => 0.5 - Math.random()).slice(0, 2);
        estado.rangosPendientes  = pick;
        estado.rangoSeleccionado = false;
        estado.misionActiva      = false;
        estado.enemigos          = [];
        guardarEstado();
        mostrarRangosGuardados();
        mostrarPantalla('bingo-screen-rangos');
    });

    ['bingo-rango-1','bingo-rango-2'].forEach(id => {
        document.getElementById(id).addEventListener('click', (e) => {
            if (estado.rangoSeleccionado) return;
            const rango = e.currentTarget.dataset.rango;
            if (!rango) return;
            estado.rangoActual       = rango;
            estado.rangoSeleccionado = true;
            estado.rangosPendientes  = [];
            estado.enemigos          = generarEnemigos(rango);
            estado.misionActiva      = true;
            estado.timerInicio       = Date.now();
            estado.timerSegundos     = 8 * 3600;
            estado.primeraVez        = true;
            guardarEstado();
            document.getElementById('bingo-rango-titulo').innerText = rango;
            renderEnemigos();
            mostrarPantalla('bingo-screen-enemigos');
        });
    });

    document.getElementById('bingo-stop-batalla').addEventListener('click', () => {
        detenerBatallaBingo();
        renderEnemigos();
        mostrarPantalla('bingo-screen-enemigos');
    });

    overlay.style.display = 'flex';
}

    window.abrirLibroBingo = abrirLibroBingo;
    window.detenerBatallaBingo = detenerBatallaBingo;
    window.resetearBingo = function() {
    if (intervaloReloj) { clearInterval(intervaloReloj); intervaloReloj = null; }
    if (intervaloBatalla) { clearInterval(intervaloBatalla); intervaloBatalla = null; }
    localStorage.removeItem(BINGO_KEY);
};

})();