// data-misiones.js
(function() {

    const missionsData = {
        D: [
            { name: "Eliminar lobos hambrientos", xp: 20000000, gold: 400000, hp: 75, atk: 4, def: 2, lvl: 1 },
            { name: "Recuperar suministros robados por goblins", xp: 4, gold: 8, hp: 184, atk: 7.8, def: 6.6, lvl: 3 },
            { name: "Proteger la aldea de jabalíes", xp: 6, gold: 12, hp: 305, atk: 15.6, def: 8, lvl: 5 },
            { name: "Investigar ruinas infestadas de ratas gigantes", xp: 8, gold: 16, hp: 476, atk: 20.8, def: 27.6, lvl: 7 },
            { name: "Escoltar a un mercader (bandido)", xp: 9, gold: 18, hp: 584, atk: 29.2, def: 40.2, lvl: 9 },
            { name: "Cazar una bestia nocturna", xp: 10, gold: 20, hp: 672, atk: 67.2, def: 63.6, lvl: 12 }
        ],
        C: [
            { name: "Limpiar una mina de murciélagos vampíricos", xp: 12, gold: 24, hp: 318, atk: 113, def: 72, lvl: 14 },
            { name: "Derrotar a un grupo de orcos merodeadores", xp: 14, gold: 28, hp: 354, atk: 131, def: 83, lvl: 16 },
            { name: "Rescatar a un rehén de los bandidos", xp: 16, gold: 32, hp: 390, atk: 149, def: 94, lvl: 18 },
            { name: "Eliminar una amenaza de lobos de las nieves", xp: 18, gold: 36, hp: 426, atk: 166, def: 105, lvl: 20 },
            { name: "Recuperar un artefacto custodiado por esqueletos", xp: 19, gold: 38, hp: 444, atk: 175, def: 110, lvl: 22 },
            { name: "Acabar con un troll de las colinas", xp: 20, gold: 40, hp: 462, atk: 184, def: 116, lvl: 24 }
        ],
        B: [
            { name: "Exterminar una colonia de arácnidos gigantes", xp: 22, gold: 44, hp: 498, atk: 201, def: 127, lvl: 28 },
            { name: "Detener a un invocador de demonios menores", xp: 24, gold: 48, hp: 534, atk: 219, def: 138, lvl: 32 },
            { name: "Proteger una Ciudad de ataque de grifos salvajes", xp: 26, gold: 52, hp: 570, atk: 237, def: 149, lvl: 36 },
            { name: "Investigar desapariciones en un bosque encantado", xp: 28, gold: 56, hp: 606, atk: 254, def: 160, lvl: 40 },
            { name: "Derrotar a un caballero oscuro errante", xp: 29, gold: 58, hp: 624, atk: 263, def: 165, lvl: 45 },
            { name: "Asaltar una fortaleza de ogros", xp: 30, gold: 60, hp: 642, atk: 272, def: 171, lvl: 50 }
        ],
        A: [
            { name: "Eliminar a un dragón joven", xp: 32, gold: 64, hp: 678, atk: 289, def: 182, lvl: 55 },
            { name: "Infiltrarse en una base de asesinos", xp: 34, gold: 68, hp: 714, atk: 307, def: 193, lvl: 50 },
            { name: "Proteger una ciudad de un ataque", xp: 36, gold: 72, hp: 750, atk: 325, def: 204, lvl: 55 },
            { name: "Recuperar un tesoro de una tumba maldita", xp: 38, gold: 76, hp: 786, atk: 342, def: 215, lvl: 60 },
            { name: "Derrotar a un guerrero legendario", xp: 39, gold: 78, hp: 804, atk: 351, def: 220, lvl: 65 },
            { name: "Acabar con un demonio de las sombras", xp: 40, gold: 80, hp: 822, atk: 360, def: 226, lvl: 70 }
        ],
        S: [
            { name: "Enfrentar a un dragón adulto", xp: 50, gold: 100, hp: 1002, atk: 448, def: 281, lvl: 75 },
            { name: "Derrotar a un señor demonio menor", xp: 60, gold: 120, hp: 1182, atk: 536, def: 336, lvl: 80 },
            { name: "Salvar el reino de un lich", xp: 70, gold: 140, hp: 1362, atk: 624, def: 391, lvl: 85 },
            { name: "Enfrentar a un titán antiguo", xp: 80, gold: 160, hp: 1542, atk: 712, def: 446, lvl: 90 },
            { name: "Combatir a un dios olvidado", xp: 90, gold: 180, hp: 1722, atk: 800, def: 501, lvl: 95 },
            { name: "Derrotar al dragón anciano", xp: 100, gold: 200, hp: 1902, atk: 808, def: 556, lvl: 100 }
        ]
    };

    let battleInterval = null;
    let enemyTransition = false;
    let battleActive = false;
    let currentEnemy = null;
    let enemyIndex = 0;
    let currentMissionList = [];
    let currentRank = 'D';
    let currentScreen = 'ranks';

    function getPlayerStats() {
        const p = window.personaje;
        if (!p) return { lvl: 1, hp: 100, maxHp: 100, mp: 50, maxMp: 50, atk: 15, def: 10 };
        return {
            lvl: p.nivel,
            hp: p.hp,
            maxHp: p.hpMax,
            mp: p.mp,
            maxMp: p.mpMax,
            atk: p.ataque + (p.equipBonos?.ATK || 0),
            def: p.defensa
        };
    }

    function buildHTML() {
        return `
        <div id="mis-inner" class="mis-screen mis-active" style="display:flex; flex-direction:column; gap:8px; padding:10px; overflow-y:auto; height:100%; box-sizing:border-box;">

        <!-- PANTALLA: HOME -->
<div id="mis-home-screen" class="mis-screen mis-active" style="display:flex; flex-direction:column; gap:8px; align-items:center; justify-content:center; padding:20px;">
    <div id="mis-go-to-ranks" style="background:linear-gradient(135deg,#2E7D32,#2E7D32); color:#ffffff; border:3px solid #000000; border-radius:1px; padding:10px 32px; font-size:18px; font-weight:bold; cursor:pointer; text-align:center; width:100%; box-sizing:border-box; letter-spacing:1px; text-shadow:1px 1px 3px #000; box-shadow:0 4px 8px rgba(0,0,0,0.4),inset 0 0 10px rgba(0,0,0,0.2); position:relative; overflow:hidden;"><span style="position:absolute;left:0;top:0;width:8px;height:100%;background:#ffffff;border-right:1px solid #000000;"></span>📜 MISIONES RANGO<span style="position:absolute;right:0;top:0;width:8px;height:100%;background:#ffffff;border-left:1px solid #ffffff;"></span></div>
    <div id="mis-go-to-bingo" class="mis-rank-button mis-rank-bingo" style="margin-top:8px; padding:12px 12px; font-size:16px;">📘 LIBRO BINGO</div>
</div>

            <!-- PANTALLA: RANGOS -->
            <div id="mis-rank-screen" class="mis-screen mis-active">
                <div id="mis-rank-D" class="mis-rank-button mis-rank-d">📜 MISION RANGO D</div>
                <div id="mis-rank-C" class="mis-rank-button mis-rank-c">🔥 MISION RANGO C</div>
                <div id="mis-rank-B" class="mis-rank-button mis-rank-b">🌪️ MISION RANGO B</div>
                <div id="mis-rank-A" class="mis-rank-button mis-rank-a">💀 MISION RANGO A</div>
                <div id="mis-rank-S" class="mis-rank-button mis-rank-s">👑 MISION RANGO S</div>
                <div id="mis-back-to-main" class="mis-back-button">⬅️ Volver</div>
            </div>

            <!-- PANTALLA: LISTA DE MISIONES -->
            <div id="mis-missions-screen" class="mis-screen" style="display:none;"></div>

            <!-- PANTALLA: BATALLA -->
            <div id="mis-battle-screen" class="mis-screen" style="display:none; flex-direction:column; gap:8px;">
                <div id="mis-back-battle" class="mis-back-button">⬅️ Abandonar misión</div>
                <div class="mis-battle-arena">
                    <div class="mis-character-card">
                        <div class="mis-card-emoji">🥷</div>
                        <div class="mis-hp-bar"><div class="mis-hp-fill" id="mis-char-hp" style="width:100%;"></div></div>
                        <div class="mis-mp-bar"><div class="mis-mp-fill" id="mis-char-mp" style="width:100%;"></div></div>
                        <div class="mis-bar-labels"><span>❤️</span><span>💙</span></div>
                    </div>
                    <div class="mis-enemy-card">
                        <div class="mis-card-emoji" id="mis-enemy-emoji">👹</div>
                        <div class="mis-hp-bar"><div class="mis-hp-fill" id="mis-enemy-hp" style="width:100%;"></div></div>
                        <div class="mis-mp-bar"><div class="mis-mp-fill" id="mis-enemy-mp" style="width:100%;"></div></div>
                        <div class="mis-bar-labels"><span>❤️</span><span>💙</span></div>
                    </div>
                </div>
                <div class="mis-combat-log" id="mis-combat-log"></div>
                <div id="mis-stop-btn" class="mis-stop-button">⏹️ DETENER</div>
            </div>

        </div>`;
    }

    function showScreen(name) {
        const ranks = document.getElementById('mis-rank-screen');
        const home = document.getElementById('mis-home-screen');
        const missions = document.getElementById('mis-missions-screen');
        const battle = document.getElementById('mis-battle-screen');
        if (home) home.style.display = 'none';
        if (ranks) ranks.style.display = 'none';
        if (missions) missions.style.display = 'none';
        if (battle) battle.style.display = 'none';
        if (name === 'home' && home) home.style.display = 'flex';
        if (name === 'ranks' && ranks) ranks.style.display = 'flex';
        if (name === 'missions' && missions) missions.style.display = 'flex';
        if (name === 'battle' && battle) battle.style.display = 'flex';
        currentScreen = name;
    }

    function showMissions(rank) {
        currentRank = rank;
        const player = getPlayerStats();
        const missions = missionsData[rank];
        const screen = document.getElementById('mis-missions-screen');
        if (!screen) return;

        screen.innerHTML = '';
        screen.style.flexDirection = 'column';
        screen.style.gap = '8px';
        screen.style.overflowY = 'auto';

        const borderColors = { D: '#2e7d32', C: '#0277bd', B: '#ef6c00', A: '#b71c1c', S: '#4a148c' };

        missions.forEach((mission, index) => {
            const locked = player.lvl < mission.lvl;
            const div = document.createElement('div');
            div.className = 'mis-mission-item' + (locked ? ' mis-locked' : '');
            div.style.borderLeftColor = borderColors[rank];
            div.innerHTML = `
                <div class="mis-mission-header">${mission.name}</div>
                <div class="mis-mission-details">
                    <div class="mis-mission-left">
                        <span>⚡ XP: ${mission.xp}</span>
                        <span>💰 Oro: ${mission.gold}</span>
                    </div>
                    <div class="mis-mission-right">
                        <span>❤️ HP: ${mission.hp}</span>
                        <span>⚔️ ATK: ${mission.atk}</span>
                        <span>🛡️ DEF: ${mission.def}</span>
                    </div>
                </div>
                ${locked ? '<div class="mis-mission-lock">🔒 Nivel mínimo: ' + mission.lvl + '</div>' : ''}
            `;
            if (!locked) {
                div.addEventListener('click', () => startBattle(rank, index));
            }
            screen.appendChild(div);
        });

        const back = document.createElement('div');
        back.className = 'mis-back-button';
        back.innerText = '⬅️ Volver a Rangos';
        back.addEventListener('click', () => showScreen('ranks'));
        screen.appendChild(back);

        showScreen('missions');
    }

    function startBattle(rank, index) {
        if (battleInterval) { clearInterval(battleInterval); battleInterval = null; }

        currentMissionList = missionsData[rank];
        enemyIndex = index;

        const p = window.personaje;

        loadEnemy(enemyIndex);
        document.getElementById('mis-combat-log').innerHTML = '';
        showScreen('battle');

        battleActive = true;
        window.combateActivo = true;
        battleInterval = setInterval(() => {
            if (!battleActive || enemyTransition) return;
            const player = getPlayerStats();

            if (player.hp > 0 && currentEnemy.hp > 0) {
                let dmg = Math.max(1, Math.floor(player.atk - currentEnemy.def / 3 + Math.random() * 8));
                currentEnemy.hp -= dmg;
                if (currentEnemy.hp < 0) currentEnemy.hp = 0;
                addLog(`🥷 Atacas y causas ${dmg} daño.`);
                updateBattleBars();
                if (typeof updateBars === 'function') updateBars();

if (currentEnemy.hp <= 0) {
    const reward = currentMissionList[enemyIndex];
    addLog(`💀 ¡Enemigo derrotado! +${reward.xp} XP y +${reward.gold} Oro.`);
    if (typeof window.ganarExperiencia === 'function') window.ganarExperiencia(reward.xp);
    if (typeof window.ganarOro === 'function') window.ganarOro(reward.gold);
    enemyTransition = true;
setTimeout(() => {
        loadEnemy(enemyIndex);
        addLog(`⚔️ Nuevo enemigo: ${currentEnemy.name}`);
        setTimeout(() => {
            enemyTransition = false;
        }, 700);
    }, 500);
}
            }

            if (player.hp > 0 && currentEnemy.hp > 0) {
                let edmg = Math.max(1, Math.floor(currentEnemy.atk - player.def / 3 + Math.random() * 6));
                if (window.personaje) window.personaje.hp = Math.max(0, window.personaje.hp - edmg);
                addLog(`👹 ${currentEnemy.name} ataca y causa ${edmg} daño.`);
                updateBattleBars();

                if (getPlayerStats().hp <= 0) {
                    addLog(`😵 Has sido derrotado...`);
                    battleActive = false;
                    clearInterval(battleInterval);
                    battleInterval = null;
                }
            }

            updateBattleBars();
        }, 700);
    }

    function loadEnemy(index) {
        const mission = currentMissionList[index];
        currentEnemy = { name: mission.name, hp: mission.hp, maxHp: mission.hp, atk: mission.atk, def: mission.def };
        const name = mission.name.toLowerCase();
        let emoji = '👹';
        if (name.includes('lobo')) emoji = '🐺';
        else if (name.includes('dragón') || name.includes('dragon')) emoji = '🐉';
        else if (name.includes('demonio')) emoji = '👿';
        else if (name.includes('araña') || name.includes('arácnido')) emoji = '🕷️';
        else if (name.includes('esqueleto')) emoji = '💀';
        else if (name.includes('bandido') || name.includes('merodeador')) emoji = '⚔️';
        else if (name.includes('rata')) emoji = '🐀';
        else if (name.includes('jabalí')) emoji = '🐗';
        else if (name.includes('grifo')) emoji = '🦅';
        else if (name.includes('titán')) emoji = '🗿';
        else if (name.includes('dios')) emoji = '👑';
        const el = document.getElementById('mis-enemy-emoji');
        if (el) el.innerText = emoji;
const enemyHpEl = document.getElementById('mis-enemy-hp');
const charHpEl = document.getElementById('mis-char-hp');
const charMpEl = document.getElementById('mis-char-mp');
const playerData = getPlayerStats();
if (charHpEl) charHpEl.style.width = Math.max(0, (playerData.hp / playerData.maxHp) * 100) + '%';
if (charMpEl) charMpEl.style.width = Math.max(0, (playerData.mp / playerData.maxMp) * 100) + '%';
if (enemyHpEl) {
    enemyHpEl.style.transition = 'none';
    enemyHpEl.style.width = '0%';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            enemyHpEl.style.transition = 'width 1s ease';
            enemyHpEl.style.width = '100%';
        });
    });
}
    }

    function updateBattleBars() {
        const player = getPlayerStats();
        const charHp = document.getElementById('mis-char-hp');
        const charMp = document.getElementById('mis-char-mp');
        const enemyHp = document.getElementById('mis-enemy-hp');
        if (charHp) charHp.style.width = Math.max(0, (player.hp / player.maxHp) * 100) + '%';
        if (charMp) charMp.style.width = Math.max(0, (player.mp / player.maxMp) * 100) + '%';
        if (enemyHp && currentEnemy) enemyHp.style.width = Math.max(0, (currentEnemy.hp / currentEnemy.maxHp) * 100) + '%';
    }

    function addLog(msg) {
        const log = document.getElementById('mis-combat-log');
        if (!log) return;
        const entry = document.createElement('div');
        entry.className = 'mis-log-entry';
        entry.innerText = msg;
        log.insertBefore(entry, log.firstChild);
        if (log.children.length > 15) log.removeChild(log.lastChild);
    }

    function stopBattle() {
        if (battleInterval) { clearInterval(battleInterval); battleInterval = null; }
        battleActive = false;
        window.combateActivo = false;
        showScreen('home');
    }

    function init() {
        const overlay = document.getElementById('missions-overlay-container');
        if (!overlay) return;
        overlay.innerHTML = buildHTML();

        document.getElementById('mis-go-to-ranks').addEventListener('click', () => showScreen('ranks'));
        document.getElementById('mis-go-to-bingo').addEventListener('click', () => { if (typeof window.abrirLibroBingo === 'function') window.abrirLibroBingo(); });
        document.getElementById('mis-rank-D').addEventListener('click', () => showMissions('D'));
        document.getElementById('mis-rank-C').addEventListener('click', () => showMissions('C'));
        document.getElementById('mis-rank-B').addEventListener('click', () => showMissions('B'));
        document.getElementById('mis-rank-A').addEventListener('click', () => showMissions('A'));
        document.getElementById('mis-rank-S').addEventListener('click', () => showMissions('S'));
        document.getElementById('mis-back-to-main').addEventListener('click', () => {
            stopBattle();
            if (typeof window.closeMisiones === 'function') window.closeMisiones();
        });
        document.getElementById('mis-back-battle').addEventListener('click', stopBattle);
        document.getElementById('mis-stop-btn').addEventListener('click', stopBattle);

        showScreen('home');
    }

    window.misionesSystem = { init, stopBattle };
window.detenerBatallaMisiones = stopBattle;

})();

window.toggleMisiones = function(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    var missionContainer = document.getElementById('missions-overlay-container');
    var missionContent = document.querySelector('.mission-content');
    var isVisible = missionContainer && missionContainer.style.display === 'flex';
    if (typeof closeAllPanels === 'function') closeAllPanels();
    if (!isVisible) {
        if (missionContent) missionContent.style.display = 'none';
        if (missionContainer) missionContainer.style.display = 'flex';
        if (window.misionesSystem && typeof window.misionesSystem.init === 'function') {
            window.misionesSystem.init();
        }
    } else {
        if (missionContent) missionContent.style.display = '';
    }
};

window.closeMisiones = function() {
    if (window.misionesSystem && window.misionesSystem.stopBattle) window.misionesSystem.stopBattle();
    const missionContainer = document.getElementById('missions-overlay-container');
    const missionContent = document.querySelector('.mission-content');
    if (missionContainer) missionContainer.style.display = 'none';
    if (missionContent) missionContent.style.display = 'flex';
};