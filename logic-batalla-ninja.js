(function () {
    'use strict';

    const STYLE_ID = 'batalla-ninja-styles';
    const CONTAINER_ID = 'batalla-ninja-container';
    const PARTICIPANT_COUNT = 70;
    const PLAYER_DEFAULT_RANK = 71;
    const BATTLE_BUTTON_LABEL = 'Batallas';
    const NPC_BATTLE_DELAY = 12000;
    const PLAYER_BATTLE_TICK = 700;
    const RESULT_DELAY = 2200;
    const MAX_RANKING_LOGS = 5;
    const MAX_PERSONAL_LOGS = 20;
    const ENEMY_LEVEL_RANGE = 7;
    const CYCLE_DURATION = 24 * 60 * 60 * 1000;

    const rawNames = [
        'Naruto Uzumaki', 'Sasuke Uchiha', 'Kakashi Hatake', 'Sakura Haruno', 'Itachi Uchiha',
        'Jiraiya', 'Hinata Hyuga', 'Gaara', 'Shikamaru Nara', 'Minato Namikaze',
        'Madara Uchiha', 'Obito Uchiha', 'Orochimaru', 'Tsunade', 'Rock Lee',
        'Neji Hyuga', 'Nagato (Pain)', 'Konan', 'Killer Bee', 'Temari',
        'Kankuro', 'Ino Yamanaka', 'Choji Akimichi', 'Asuma Sarutobi', 'Hiruzen Sarutobi',
        'Hashirama Senju', 'Tobirama Senju', 'Kushina Uzumaki', 'Sai', 'Yamato',
        'Kisame Hoshigaki', 'Deidara', 'Sasori', 'Hidan', 'Kakuzu',
        'Zetsu', 'Kabuto Yakushi', 'Kaguya Otsutsuki', 'Iruka Umino', 'Shino Aburame',
        'Kiba Inuzuka', 'Akamaru', 'Tenten', 'Guy Might', 'Suigetsu Hozuki',
        'Karin Uzumaki', 'Jugo', 'Danzo Shimura', 'Shisui Uchiha', 'Rin Nohara',
        'Yahiko', 'Konohamaru Sarutobi', 'Hanabi Hyuga', 'Hiashi Hyuga', 'Hizashi Hyuga',
        'Kimimaro', 'Haku', 'Zabuza Momochi', 'Cuarto Raikage', 'Onoki',
        'Darui', 'Chojuro', 'Anko Mitarashi', 'Shizune', 'Kurenai Yuhi',
        'Gamabunta', 'Katsuyu', 'Manda', 'Kurama', 'Shukaku',
        'Hagoromo Otsutsuki', 'Hamura Otsutsuki', 'Indra Otsutsuki', 'Ashura Otsutsuki', 'Toneri Otsutsuki',
        'Cuarto Kazekage', 'Chiyo', 'Ebizo', 'Utakata', 'Fuu',
        'Roshi', 'Han', 'Yugito Nii', 'Yagura', 'Ibiki Morino'
    ];

    const formulas = [
        (lvl) => ({ hp: 100 + 25 * (lvl - 1), atk: 15 + 5 * (lvl - 1), def: 10 + 12 * (lvl - 1), spd: 80 + 1 * (lvl - 1), crt: 2 + 0.1 * (lvl - 1), eva: 0 + 0.05 * (lvl - 1), res: 100 + 20 * (lvl - 1) }),
        (lvl) => ({ hp: 80 + 10 * (lvl - 1), atk: 15 + 13 * (lvl - 1), def: 10 + 3 * (lvl - 1), spd: 120 + 4 * (lvl - 1), crt: 10 + 0.5 * (lvl - 1), eva: 5 + 0.4 * (lvl - 1), res: 40 + 5 * (lvl - 1) }),
        (lvl) => ({ hp: 90 + 12 * (lvl - 1), atk: 15 + 10 * (lvl - 1), def: 10 + 4 * (lvl - 1), spd: 105 + 2.5 * (lvl - 1), crt: 15 + 0.6 * (lvl - 1), eva: 5 + 0.2 * (lvl - 1), res: 150 + 25 * (lvl - 1) }),
        (lvl) => ({ hp: 70 + 8 * (lvl - 1), atk: 15 + 7 * (lvl - 1), def: 10 + 2 * (lvl - 1), spd: 140 + 5 * (lvl - 1), crt: 5 + 0.3 * (lvl - 1), eva: 15 + 0.7 * (lvl - 1), res: 60 + 8 * (lvl - 1) }),
        (lvl) => ({ hp: 120 + 30 * (lvl - 1), atk: 15 + 15 * (lvl - 1), def: 5 + 1 * (lvl - 1), spd: 90 + 1.5 * (lvl - 1), crt: 8 + 0.2 * (lvl - 1), eva: 0 + 0.05 * (lvl - 1), res: 80 + 15 * (lvl - 1) }),
        (lvl) => ({ hp: 110 + 18 * (lvl - 1), atk: 18 + 10 * (lvl - 1), def: 12 + 7 * (lvl - 1), spd: 105 + 2.2 * (lvl - 1), crt: 7 + 0.3 * (lvl - 1), eva: 4 + 0.2 * (lvl - 1), res: 80 + 12 * (lvl - 1) }),
        (lvl) => ({ hp: 200 + 50 * (lvl - 1), atk: 25 + 20 * (lvl - 1), def: 20 + 15 * (lvl - 1), spd: 110 + 3 * (lvl - 1), crt: 20 + 0.8 * (lvl - 1), eva: 10 + 0.5 * (lvl - 1), res: 200 + 40 * (lvl - 1) }),
        (lvl) => ({ hp: 95 + 14 * (lvl - 1), atk: 18 + 11 * (lvl - 1), def: 8 + 4 * (lvl - 1), spd: 105 + 2.5 * (lvl - 1), crt: 8 + 0.4 * (lvl - 1), eva: 3 + 0.2 * (lvl - 1), res: 180 + 35 * (lvl - 1) }),
        (lvl) => ({ hp: 95 + 14 * (lvl - 1), atk: 18 + 11 * (lvl - 1), def: 8 + 4 * (lvl - 1), spd: 105 + 2.5 * (lvl - 1), crt: 8 + 0.4 * (lvl - 1), eva: 3 + 0.2 * (lvl - 1), res: 180 + 35 * (lvl - 1) }),
        (lvl) => ({ hp: 85 + 11 * (lvl - 1), atk: 15 + 12 * (lvl - 1), def: 7 + 3 * (lvl - 1), spd: 130 + 4.5 * (lvl - 1), crt: 20 + 0.7 * (lvl - 1), eva: 6 + 0.3 * (lvl - 1), res: 70 + 10 * (lvl - 1) }),
        (lvl) => ({ hp: 160 + 35 * (lvl - 1), atk: 12 + 6 * (lvl - 1), def: 15 + 10 * (lvl - 1), spd: 85 + 1.2 * (lvl - 1), crt: 3 + 0.1 * (lvl - 1), eva: 1 + 0.05 * (lvl - 1), res: 120 + 18 * (lvl - 1) }),
        (lvl) => ({ hp: 80 + 9 * (lvl - 1), atk: 14 + 8 * (lvl - 1), def: 9 + 4 * (lvl - 1), spd: 115 + 3.5 * (lvl - 1), crt: 5 + 0.3 * (lvl - 1), eva: 18 + 0.8 * (lvl - 1), res: 160 + 30 * (lvl - 1) }),
        (lvl) => ({ hp: 100 + 15 * (lvl - 1), atk: 20 + 16 * (lvl - 1), def: 10 + 5 * (lvl - 1), spd: 110 + 2.8 * (lvl - 1), crt: 10 + 0.5 * (lvl - 1), eva: 4 + 0.2 * (lvl - 1), res: 90 + 12 * (lvl - 1) }),
        (lvl) => ({ hp: 65 + 7 * (lvl - 1), atk: 12 + 9 * (lvl - 1), def: 5 + 2 * (lvl - 1), spd: 150 + 6 * (lvl - 1), crt: 12 + 0.6 * (lvl - 1), eva: 20 + 1 * (lvl - 1), res: 50 + 5 * (lvl - 1) }),
        (lvl) => ({ hp: 140 + 28 * (lvl - 1), atk: 22 + 14 * (lvl - 1), def: 5 + 2 * (lvl - 1), spd: 100 + 2 * (lvl - 1), crt: 15 + 0.9 * (lvl - 1), eva: 0, res: 110 + 20 * (lvl - 1) })
    ];

    const state = {
        initialized: false,
        ninjas: [],
        playerRank: PLAYER_DEFAULT_RANK,
        currentView: 'scroll',
        countdownEnd: Date.now() + CYCLE_DURATION,
        countdownInterval: null,
        npcBattleInterval: null,
        rankingLogs: [],
        personalLogs: [],
        personalUnreadCount: 0,
        battleEnemy: null,
        battleInterval: null,
        resultTimer: null,
        battleActive: false,
        resultMessage: '',
        scrollPositions: {},
        lastSnapshot: null,
        lastNpcBattleAt: Date.now()
    };

    function queueSave() {
        if (typeof window.guardarPartida === 'function') {
            window.guardarPartida({ silent: true });
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${CONTAINER_ID} {
                display: none;
                width: 100%;
                height: 100%;
                position: absolute;
                inset: 0;
                z-index: 104;
                border-radius: 10px;
                overflow: hidden;
                background: radial-gradient(circle at top, rgba(255,255,255,0.92), rgba(247,235,218,0.98));
                box-sizing: border-box;
            }
            #${CONTAINER_ID}.active { display: block; }
            .bn-shell {
                width: 100%;
                height: 100%;
                padding: 8px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(243,228,207,0.98));
            }
            .bn-scroll-screen {
                flex: 1;
                display: flex;
                align-items: stretch;
                justify-content: flex-start;
                flex-direction: column;
                gap: 8px;
                padding: 10px;
                text-align: center;
            }
            .bn-close-top,
            .bn-icon-btn,
            .bn-stop-button {
                border: 1px solid #8e5a2b;
                background: rgba(255,255,255,0.94);
                color: #5d3412;
                border-radius: 999px;
                cursor: pointer;
                font-weight: 700;
                padding: 6px 12px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            }
            .bn-close-top { align-self: flex-end; }
            .bn-scroll-batalla {
                width: 100%;
                min-height: 48px;
                padding: 10px 32px;
                background: linear-gradient(135deg, #1565c0, #1976d2);
                border: 3px solid #000000;
                border-radius: 1px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.2);
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                letter-spacing: 1px;
            }
            .bn-scroll-batalla:hover { transform: scale(1.02); }
            .bn-scroll-batalla::before,
            .bn-scroll-batalla::after {
                content: '';
                position: absolute;
                width: 8px;
                height: 100%;
                background: #ffffff;
                border-right: 1px solid #000000;
                border-left: 1px solid #000000;
            }
            .bn-scroll-batalla::before { left: 0; }
            .bn-scroll-batalla::after { right: 0; }
            .bn-texto-batalla {
                color: #ffffff;
                font-weight: bold;
                font-size: 18px;
                letter-spacing: 1px;
                text-transform: uppercase;
                text-shadow: 1px 1px 3px #000;
                z-index: 1;
            }
            .bn-brillo {
                position: absolute;
                top: 0;
                left: -100%;
                width: 50%;
                height: 100%;
                background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
                transform: skewX(-25deg);
                animation: bn-iluminar 3s infinite;
            }
            @keyframes bn-iluminar {
                0% { left: -100%; }
                20%, 100% { left: 150%; }
            }
            .bn-scroll-note {
                font-size: 0.9rem;
                color: #5b3b1a;
                max-width: 280px;
                line-height: 1.45;
                font-weight: 600;
            }
            .bn-game-container {
                width: 100%;
                height: 100%;
                background: white;
                box-sizing: border-box;
                padding: 2.5px;
                position: relative;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15), 0 0 0 1px #d0b89c inset;
                border-radius: 16px;
                overflow: hidden;
                transition: background 0.3s, box-shadow 0.3s;
            }
            .bn-game-container.rango-bajo { background: #9156d2; }
            .bn-game-container.rango-medio { background: #3f8be6; }
            .bn-game-container.rango-alto { background: #e05636; box-shadow: 0 0 25px #f7d44a, 0 0 8px #ffb703 inset; }
            .bn-inner {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background: rgba(255,255,255,0.88);
                border-radius: 12px;
            }
            .bn-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 6px;
                padding: 6px 8px;
                background: rgba(255,255,255,0.84);
                border-bottom: 2px solid #b0703c;
                border-radius: 10px 10px 0 0;
                font-weight: bold;
                flex-shrink: 0;
            }
            .bn-timer {
                border: 1px solid #b0703c;
                border-radius: 30px;
                font-size: 13px;
                background: #2e1e0f;
                color: #f9e1a4;
                padding: 5px 10px;
                letter-spacing: 0.5px;
                box-shadow: inset 0 -2px 0 #5f3f1a;
                white-space: nowrap;
            }
            .bn-icon-btn span {
                font-size: 12px;
                background: #d4af37;
                color: white;
                padding: 0 6px;
                border-radius: 20px;
            }
            .bn-icon-btn .bn-notification-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 18px;
                height: 18px;
                margin-left: 6px;
                padding: 0 5px;
                border-radius: 999px;
                background: #111827;
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                line-height: 1;
            }
            .bn-icon-btn.bn-personal-victory {
                background: linear-gradient(135deg, #166534, #22c55e);
                border-color: #052e16;
                color: #f0fdf4;
            }
            .bn-icon-btn.bn-personal-defeat {
                background: linear-gradient(135deg, #991b1b, #ef4444);
                border-color: #450a0a;
                color: #fef2f2;
            }
            .bn-view {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 6px 4px;
                scrollbar-width: thin;
                scrollbar-color: #b88b4a #f2e0c0;
            }
            .bn-view::-webkit-scrollbar { width: 5px; }
            .bn-view::-webkit-scrollbar-thumb { background: #b88b4a; border-radius: 10px; }
            .bn-summary {
                background: #ccb28b;
                border-radius: 20px;
                padding: 8px;
                font-size: 12px;
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 6px;
                margin-bottom: 8px;
                color: #36210b;
                font-weight: 700;
                text-align: center;
            }
            .bn-stat-chip {
                background: rgba(255,250,235,0.95);
                border: 1px solid #b58b5a;
                border-radius: 14px;
                padding: 10px;
                text-align: center;
                font-size: 11px;
                color: #4b2d11;
                box-shadow: 0 2px 0 #7b5834;
            }
            .bn-enemy-card {
                background: rgba(255,250,235,0.95);
                border-radius: 18px;
                padding: 8px 6px;
                margin-bottom: 8px;
                display: grid;
                grid-template-columns: 32px 1fr 54px;
                align-items: center;
                gap: 4px;
                font-size: 10px;
                font-weight: 500;
                border: 1px solid #b58b5a;
                box-shadow: 0 3px 0 #7b5834;
                cursor: pointer;
                transition: 0.1s;
            }
            .bn-enemy-card:active { transform: translateY(2px); box-shadow: 0 1px 0 #7b5834; }
            .bn-enemy-emoji { font-size: 26px; text-align: center; filter: drop-shadow(2px 2px 0 #956b42); }
            .bn-enemy-info p { margin: 0; line-height: 1.2; }
            .bn-enemy-stats { background: #1f2c3a; color: #c6e9ff; border-radius: 12px; padding: 4px; text-align: center; font-size: 9px; }
            .bn-rank-row {
                display: flex;
                font-size: 11px;
                padding: 6px 8px;
                border-radius: 20px;
                margin: 3px 0;
                align-items: center;
                gap: 6px;
                background: rgba(255,255,240,0.75);
                border-left: 4px solid transparent;
            }
            .bn-rank-1 { background: #ffcccc; border-left-color: red; font-weight: bold; }
            .bn-rank-2, .bn-rank-3 { background: #fff2cc; border-left-color: gold; }
            .bn-rank-4to10 { background: #cce5ff; border-left-color: #3399ff; }
            .bn-rank-11to25 { background: #e0e0e0; border-left-color: #808080; }
            .bn-rank-26to70 { background: #f0f0f0; border-left-color: #a6a6a6; }
            .bn-player-rank-row { background: #b3ffb3 !important; border: 2px solid #2e7d32; }
            .bn-log-panel {
                background: #1e1e1e;
                color: #e0e0e0;
                padding: 8px;
                border-radius: 20px;
                font-size: 11px;
                font-family: 'Courier New', monospace;
                min-height: 130px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-top: 8px;
                border: 2px solid #b88b4a;
            }
            .bn-log-line {
                border-bottom: 1px dotted #444;
                padding: 4px 0;
                white-space: normal;
                word-break: break-word;
                line-height: 1.3;
            }
            .bn-victory-text { color: #a3e4a3; font-weight: bold; }
            .bn-defeat-text { color: #f5a3a3; font-weight: bold; }
            .bn-battle-screen {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 2px 2px 8px;
                width: 83%;
                margin: 0 auto;
                font-size: 0.83em;
            }
            .bn-battle-arena {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                background: rgba(255,245,225,0.9);
                border-radius: 18px;
                padding: 10px;
                border: 2px solid #c18d5d;
            }
            .bn-character-card,
            .bn-enemy-card-battle {
                background: rgba(255,255,255,0.92);
                border-radius: 16px;
                padding: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                border: 1px solid #d9ab7a;
            }
            .bn-card-emoji { font-size: 42px; }
            .bn-fighter-name {
                font-size: 12px;
                font-weight: 700;
                color: #4f2c0b;
                text-align: center;
            }
            .bn-hp-bar,
            .bn-mp-bar {
                width: 100%;
                height: 10px;
                border-radius: 999px;
                overflow: hidden;
                background: rgba(0,0,0,0.15);
            }
            .bn-hp-fill { height: 100%; background: linear-gradient(90deg, #ff6b6b, #d63031); width: 100%; }
            .bn-mp-fill { height: 100%; background: linear-gradient(90deg, #74b9ff, #0984e3); width: 100%; }
            .bn-bar-labels,
            .bn-fighter-stats {
                width: 100%;
                display: flex;
                justify-content: space-between;
                gap: 6px;
                font-size: 10px;
                color: #5a3a17;
                font-weight: 700;
            }
            .bn-fighter-stats { flex-wrap: wrap; justify-content: center; }
            .bn-combat-log {
                background: #111;
                color: #f3f3f3;
                border-radius: 16px;
                border: 2px solid #b88b4a;
                min-height: 140px;
                max-height: 190px;
                overflow-y: auto;
                padding: 8px;
                font-size: 11px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .bn-log-entry {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
                padding: 6px 8px;
                line-height: 1.35;
            }
            .bn-battle-actions {
                display: flex;
                justify-content: center;
            }
            .bn-result-overlay {
                background: rgba(0,0,0,0.76);
                border-radius: 50px;
                color: white;
                font-size: 28px;
                font-weight: bold;
                padding: 18px 10px;
                text-align: center;
                margin: 0 auto;
                width: min(220px, 100%);
                backdrop-filter: blur(2px);
                animation: bn-blink 0.6s infinite;
            }
            @keyframes bn-blink { 0% { opacity: 1; } 50% { opacity: 0.55; } }
        `;
        document.head.appendChild(style);
    }

    function shuffle(list) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function deriveRankTitle(level) {
        if (level <= 10) return 'Genin';
        if (level <= 30) return 'Chunin';
        if (level <= 60) return 'Jonin';
        if (level <= 80) return 'Anbu';
        return 'Kage';
    }

    function getPlayerSnapshot() {
        const p = window.personaje || {};
        const equipBonos = p.equipBonos || {};
        const arbolBonos = p.arbolBonos || {};
        const snapshot = {
            id: 'player',
            isPlayer: true,
            name: p.nombre || 'Uchiha Sasuke',
            level: p.nivel || 1,
            rankTitle: p.rango || deriveRankTitle(p.nivel || 1),
            rank: state.playerRank,
            stats: {
                hp: p.hpMax || p.hp || 100,
                mp: p.mpMax || p.mp || 100,
                atk: (p.ataque || 15) + (equipBonos.ATK || 0) + (arbolBonos.ataque || 0),
                def: (p.defensa || 10) + (equipBonos.DEF || 0) + (arbolBonos.defensa || 0),
                spd: (p.velocidad || 100) + (equipBonos.SPD || 0) + (arbolBonos.velocidad || 0),
                crt: (p.critico || 0) + (equipBonos.CRT || 0) + (arbolBonos.critico || 0),
                eva: (p.evasion || 0) + (equipBonos.EVA || 0) + (arbolBonos.evasion || 0),
                res: (p.resistencia || 0) + (equipBonos.RES || 0)
            },
            currentHp: Math.max(0, p.hp ?? p.hpMax ?? 100),
            currentMp: Math.max(0, p.mp ?? p.mpMax ?? 100)
        };
        state.lastSnapshot = snapshot;
        return snapshot;
    }

    function getPlayerLevel() {
        return Math.max(1, Number(window.personaje?.nivel) || 1);
    }

    function getRandomEnemyLevel() {
        const playerLevel = getPlayerLevel();
        return playerLevel + Math.floor(Math.random() * (ENEMY_LEVEL_RANGE + 1));
    }

    function refreshNinjaLevels() {
        const playerLevel = getPlayerLevel();
        state.ninjas.forEach((ninja) => {
            const maxAllowedLevel = playerLevel + ENEMY_LEVEL_RANGE;
            if (ninja.level < playerLevel || ninja.level > maxAllowedLevel) {
                ninja.level = getRandomEnemyLevel();
            }
            ninja.rankTitle = deriveRankTitle(ninja.level);
            ninja.stats = formulas[ninja.formulaIdx](ninja.level);
        });
    }

    function initNinjas() {
        if (state.ninjas.length) return;
        const shuffled = shuffle(rawNames).slice(0, PARTICIPANT_COUNT);
        for (let i = 0; i < PARTICIPANT_COUNT; i += 1) {
            const level = getRandomEnemyLevel();
            const formulaIdx = Math.floor(Math.random() * formulas.length);
            const stats = formulas[formulaIdx](level);
            state.ninjas.push({
                id: i,
                name: shuffled[i],
                rank: i + 1,
                level,
                formulaIdx,
                rankTitle: deriveRankTitle(level),
                stats
            });
        }
    }

    function ensureContainer() {
        let container = document.getElementById(CONTAINER_ID);
        if (container) return container;
        const centerArea = document.querySelector('.center-area');
        if (!centerArea) return null;
        if (getComputedStyle(centerArea).position === 'static') {
            centerArea.style.position = 'relative';
        }
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        centerArea.appendChild(container);
        return container;
    }

    function getBattleButton() {
        return Array.from(document.querySelectorAll('.menu-btn')).find((btn) => btn.textContent.includes(BATTLE_BUTTON_LABEL));
    }

    function hideBaseContent() {
        if (typeof window.hideMissionContent === 'function') {
            window.hideMissionContent();
            return;
        }
        const missionContent = document.querySelector('.mission-content');
        if (missionContent) missionContent.style.display = 'none';
    }

    function showBaseContent() {
        if (typeof window.showMissionContent === 'function') {
            window.showMissionContent();
            return;
        }
        const missionContent = document.querySelector('.mission-content');
        if (missionContent) missionContent.style.display = 'flex';
    }

    function hideOtherPanels() {
        if (typeof window.closeHeroEquipment === 'function') window.closeHeroEquipment();
        if (typeof window.closeMisiones === 'function') window.closeMisiones();
        if (typeof window.closeArbol === 'function') window.closeArbol();
        if (typeof window.cerrarAjustes === 'function') window.cerrarAjustes();

        ['hero-equipment-container', 'missions-overlay-container', 'jutsus-overlay-container', 'arbol-overlay-container'].forEach((id) => {
            const panel = document.getElementById(id);
            if (panel) panel.style.display = 'none';
        });
    }

    function updateRankVisual() {
        const container = document.getElementById('bnGameContainer');
        if (!container) return;
        container.classList.remove('rango-bajo', 'rango-medio', 'rango-alto');
        if (state.playerRank >= 50 && state.playerRank <= PLAYER_DEFAULT_RANK) container.classList.add('rango-bajo');
        else if (state.playerRank >= 30) container.classList.add('rango-medio');
        else container.classList.add('rango-alto');
    }

    function registerCombat(attacker, defender, attackerWon, oldRankAtt, oldRankDef) {
        const text = attackerWon
            ? `${attacker.name} #${oldRankAtt} venció a ${defender.name} #${oldRankDef} y subió al puesto #${attacker.rank}.`
            : `${attacker.name} #${oldRankAtt} perdió contra ${defender.name} #${oldRankDef} y se quedó en su puesto.`;
        const entry = { text, colorClass: attackerWon ? 'bn-victory-text' : 'bn-defeat-text' };
        state.rankingLogs.unshift(entry);
        if (state.rankingLogs.length > MAX_RANKING_LOGS) state.rankingLogs.pop();
        if (defender.isPlayer) {
            const personalEntry = attackerWon
                ? {
                    text: `${attacker.name} #${oldRankAtt} te derrotó y tomó el puesto #${oldRankDef}.`,
                    colorClass: 'bn-defeat-text',
                    outcome: 'defeat',
                    read: false
                }
                : {
                    text: `${attacker.name} #${oldRankAtt} te atacó, pero lo derrotaste y mantuviste el puesto #${oldRankDef}.`,
                    colorClass: 'bn-victory-text',
                    outcome: 'victory',
                    read: false
                };
            state.personalLogs.unshift(personalEntry);
            if (state.personalLogs.length > MAX_PERSONAL_LOGS) state.personalLogs.pop();
            state.personalUnreadCount = Math.min(99, state.personalUnreadCount + 1);
        }
        queueSave();
    }

    function renderLogLines(entries, emptyText) {
        if (!entries.length) return `<div class="bn-log-line">${escapeHtml(emptyText)}</div>`;
        return entries.slice(0, MAX_RANKING_LOGS).map((log) => `
            <div class="bn-log-line"><span class="${log.colorClass}">${escapeHtml(log.text)}</span></div>
        `).join('');
    }

    function getEntityByRank(rank) {
        if (state.playerRank === rank) {
            return getPlayerSnapshot();
        }
        return state.ninjas.find((ninja) => ninja.rank === rank) || null;
    }


    function setEntityRank(entity, newRank) {
        if (!entity) return;
        if (entity.isPlayer || entity.id === 'player') {
            state.playerRank = newRank;
            return;
        }
        const realEntity = state.ninjas.find((ninja) => ninja.id === entity.id);
        if (realEntity) realEntity.rank = newRank;
        entity.rank = newRank;
    }

    function normalizeRanks() {
        const seen = new Set();
        const participants = state.ninjas.concat(getPlayerSnapshot()).sort((a, b) => a.rank - b.rank);
        participants.forEach((entity, index) => {
            const intendedRank = index + 1;
            setEntityRank(entity, intendedRank);
            seen.add(intendedRank);
        });
    }

    function applyRankingResult(attacker, defender, attackerWon) {
        const oldRankAtt = attacker.rank;
        const oldRankDef = defender.rank;
        if (attackerWon) {
            setEntityRank(attacker, oldRankDef);
            setEntityRank(defender, oldRankAtt);
            attacker.rank = oldRankDef;
            defender.rank = oldRankAtt;
        } else {
            attacker.rank = oldRankAtt;
            defender.rank = oldRankDef;
        }
        normalizeRanks();
        attacker.rank = attacker.isPlayer ? state.playerRank : (state.ninjas.find((ninja) => ninja.id === attacker.id)?.rank ?? attacker.rank);
        defender.rank = defender.isPlayer ? state.playerRank : (state.ninjas.find((ninja) => ninja.id === defender.id)?.rank ?? defender.rank);
        return { oldRankAtt, oldRankDef };
    }

    function getChallengable() {
        const candidates = [];
        for (let rank = state.playerRank - 1; rank >= state.playerRank - 3 && rank >= 1; rank -= 1) {
            const target = getEntityByRank(rank);
            if (target && !target.isPlayer) candidates.push(target);
        }
        return candidates;
    }

    function computeMissionStyleDamage(attacker, defender, isPlayerAttacker) {
        const randomExtra = isPlayerAttacker ? Math.random() * 8 : Math.random() * 6;
        const raw = attacker.stats.atk - (defender.stats.def / 3) + randomExtra;
        return Math.max(1, Math.floor(raw));
    }

    function simulateRankingFight(attacker, defender) {
        let attackerHp = attacker.isPlayer ? getPlayerSnapshot().currentHp : attacker.stats.hp;
        let defenderHp = defender.isPlayer ? getPlayerSnapshot().currentHp : defender.stats.hp;
        let rounds = 0;

        while (attackerHp > 0 && defenderHp > 0 && rounds < 50) {
            defenderHp -= computeMissionStyleDamage(attacker, defender, true);
            if (defenderHp <= 0) break;
            attackerHp -= computeMissionStyleDamage(defender, attacker, false);
            rounds += 1;
        }

        const attackerWon = defenderHp <= 0;
        const result = applyRankingResult(attacker, defender, attackerWon);
        registerCombat(attacker, defender, attackerWon, result.oldRankAtt, result.oldRankDef);
        return attackerWon;
    }

    function saveScrollPosition() {
        const view = document.getElementById('bnViewContainer');
        if (!view) return;
        state.scrollPositions[state.currentView] = view.scrollTop;
    }

    function restoreScrollPosition(viewName) {
        const view = document.getElementById('bnViewContainer');
        if (!view) return;
        const saved = state.scrollPositions[viewName];
        if (typeof saved === 'number') {
            requestAnimationFrame(() => { view.scrollTop = saved; });
        }
    }

    function renderMain(snapshot) {
        const challengers = getChallengable();
        return `
            <div style="display:flex; flex-direction:column; gap:6px;">
                <div class="bn-summary">
                    <span>🏅 Puesto #${snapshot.rank}</span>
                    <span>⚔️ Nv.${snapshot.level}</span>
                    <span>${escapeHtml(snapshot.rankTitle)}</span>
                </div>
                ${challengers.map((enemy) => `
                    <div class="bn-enemy-card" onclick="window.batallaNinjaSystem.startBattle(${enemy.rank})">
                        <div class="bn-enemy-emoji">🥷</div>
                        <div class="bn-enemy-info">
                            <p><b>${escapeHtml(enemy.name)}</b> #${enemy.rank} · ${escapeHtml(enemy.rankTitle)}</p>
                            <p>❤️ ${enemy.stats.hp} ⚔️ ${enemy.stats.atk} 🛡️ ${enemy.stats.def}</p>
                        </div>
                        <div class="bn-enemy-stats">Lv.${enemy.level}</div>
                    </div>
                `).join('') || '<div class="bn-stat-chip">No hay rivales disponibles por encima de tu puesto actual.</div>'}
                <div id="bnRankingLogPanel" class="bn-log-panel">${renderLogLines(state.rankingLogs, '⚡ Esperando combates del ranking ninja...')}</div>
            </div>
        `;
    }

    function renderRanking() {
        const playerEntry = getPlayerSnapshot();
        const all = state.ninjas.concat(playerEntry).sort((a, b) => a.rank - b.rank);
        return `
            <div style="height:100%; overflow-y:auto;">
                ${all.map((ninja) => {
                    let reward = '💰20';
                    let colorClass = 'bn-rank-26to70';
                    if (ninja.rank === 1) { reward = '💰2.000'; colorClass = 'bn-rank-1'; }
                    else if (ninja.rank <= 3) { reward = '💰1.000'; colorClass = 'bn-rank-2'; }
                    else if (ninja.rank <= 10) { reward = '💰600'; colorClass = 'bn-rank-4to10'; }
                    else if (ninja.rank <= 25) { reward = '💰100'; colorClass = 'bn-rank-11to25'; }
                    if (ninja.isPlayer) colorClass += ' bn-player-rank-row';
                    return `
                        <div class="bn-rank-row ${colorClass}">
                            <span style="width:34px;">#${ninja.rank}</span>
                            <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(ninja.name)}</span>
                            <span>${reward}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderPersonal() {
        return `
            <div style="height:100%; overflow-y:auto; background:#1a0f0a; border-radius:20px; padding:10px;">
                <h3 style="color:gold; margin:0 0 8px; text-align:center;">📩 Ataques contra ti</h3>
                ${state.personalLogs.length
                    ? state.personalLogs.slice(0, MAX_PERSONAL_LOGS).map((log) => `<div style="background:#2a1a15; margin:4px 0; padding:6px; border-radius:12px;"><span class="${log.colorClass}">${escapeHtml(log.text)}</span></div>`).join('')
                    : '<div style="color:#ccc; padding:10px; text-align:center;">Nadie te ha atacado todavía.</div>'}
            </div>
        `;
    }

    function getPersonalLogButtonClass() {
        if (!state.personalUnreadCount) return '';
        const latest = state.personalLogs.find((log) => !log.read) || state.personalLogs[0];
        if (!latest) return '';
        if (latest.outcome === 'victory') return ' bn-personal-victory';
        if (latest.outcome === 'defeat') return ' bn-personal-defeat';
        return '';
    }

    function getPersonalLogBadge() {
        if (!state.personalUnreadCount) return '';
        return `<span class="bn-notification-badge">${state.personalUnreadCount}</span>`;
    }

    function markPersonalLogsAsRead() {
        if (!state.personalUnreadCount && !state.personalLogs.some((log) => log && log.read === false)) return;
        state.personalUnreadCount = 0;
        state.personalLogs = state.personalLogs.map((log) => ({ ...log, read: true }));
    }

    function getRankReward(rank) {
        if (rank === 1) return 2000;
        if (rank <= 3) return 1000;
        if (rank <= 10) return 600;
        if (rank <= 25) return 100;
        return 20;
    }

    function assignSequentialRanks() {
        state.ninjas
            .sort((a, b) => a.rank - b.rank)
            .forEach((ninja, index) => {
                ninja.rank = index + 1;
            });
    }

    function resetRankingCycle() {
        stopBattle({ silent: true, preserveView: true });
        refreshNinjaLevels();
        assignSequentialRanks();
        state.playerRank = PLAYER_DEFAULT_RANK;
        state.rankingLogs = [];
        state.personalLogs = [];
        state.personalUnreadCount = 0;
        state.battleEnemy = null;
        state.battleLogs = [];
        state.resultMessage = '';
        if (state.currentView !== 'scroll') {
            state.currentView = 'main';
        }
        state.countdownEnd = Date.now() + CYCLE_DURATION;
    }

    function awardCycleReward(rank) {
        const reward = getRankReward(rank);
        if (window.personaje) {
            window.personaje.oro = (window.personaje.oro || 0) + reward;
            if (typeof window.actualizarOroPanel === 'function') window.actualizarOroPanel();
        }
        return reward;
    }

    function processExpiredCycles() {
        let processed = false;
        while (Date.now() >= state.countdownEnd) {
            const finishedRank = state.playerRank;
            const reward = awardCycleReward(finishedRank);
            resetRankingCycle();
            processed = true;
            if (typeof window.mostrarNotificacion === 'function') {
                window.mostrarNotificacion(`Recompensa del ranking: +${reward} Oro`, 'oro');
            }
        }
        if (processed) {
            queueSave();
            if (document.getElementById(CONTAINER_ID) && document.getElementById(CONTAINER_ID).classList.contains('active')) {
                render();
            }
        }
        return processed;
    }

    function getBattleEnemyEmoji(name) {
        const value = String(name || '').toLowerCase();
        if (value.includes('uchiha')) return '🔥';
        if (value.includes('gaara')) return '🌪️';
        if (value.includes('kurama') || value.includes('shukaku')) return '🦊';
        if (value.includes('kage')) return '👑';
        if (value.includes('haku')) return '❄️';
        return '🥷';
    }

    function renderBattle(snapshot) {
        const enemy = state.battleEnemy;
        if (!enemy) return renderMain(snapshot);
        return `
            <div class="bn-battle-screen">
                <div class="bn-battle-arena">
                    <div class="bn-character-card">
                        <div class="bn-card-emoji">🌀</div>
                        <div class="bn-fighter-name">${escapeHtml(snapshot.name)}</div>
                        <div class="bn-hp-bar"><div id="bn-char-hp" class="bn-hp-fill"></div></div>
                        <div class="bn-mp-bar"><div id="bn-char-mp" class="bn-mp-fill"></div></div>
                        <div class="bn-bar-labels"><span>❤️ HP</span><span>💙 Chakra</span></div>
                        <div class="bn-fighter-stats"><span>⚔️ ${snapshot.stats.atk.toFixed(2)}</span><span>🛡️ ${snapshot.stats.def.toFixed(2)}</span></div>
                    </div>
                    <div class="bn-enemy-card-battle">
                        <div id="bn-enemy-emoji" class="bn-card-emoji">${getBattleEnemyEmoji(enemy.name)}</div>
                        <div class="bn-fighter-name">${escapeHtml(enemy.name)} #${enemy.rank}</div>
                        <div class="bn-hp-bar"><div id="bn-enemy-hp" class="bn-hp-fill"></div></div>
                        <div class="bn-mp-bar"><div id="bn-enemy-mp" class="bn-mp-fill"></div></div>
                        <div class="bn-bar-labels"><span>❤️ HP</span><span>💙 Chakra</span></div>
                        <div class="bn-fighter-stats"><span>⚔️ ${enemy.stats.atk}</span><span>🛡️ ${enemy.stats.def}</span></div>
                    </div>
                </div>
                <div id="bn-result-box" style="display:${state.resultMessage ? 'block' : 'none'};">${state.resultMessage ? `<div class="bn-result-overlay">${escapeHtml(state.resultMessage)}</div>` : ''}</div>
                <div id="bn-combat-log" class="bn-combat-log"></div>
                <div class="bn-battle-actions">
                    <button type="button" class="bn-stop-button" onclick="window.batallaNinjaSystem.stopBattle()">⏹️ DETENER</button>
                </div>
            </div>
        `;
    }

    function render() {
        const container = ensureContainer();
        if (!container) return;
        saveScrollPosition();
        refreshNinjaLevels();
        const snapshot = getPlayerSnapshot();

        if (state.currentView === 'scroll') {
            container.innerHTML = `
                <div class="bn-shell">
                    <div class="bn-scroll-screen">
                        <div class="bn-scroll-batalla" onclick="window.batallaNinjaSystem.enterArena()">
                            <div class="bn-brillo"></div>
                            <span class="bn-texto-batalla">BATALLA NINJA</span>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        let content = '';
        if (state.currentView === 'main') content = renderMain(snapshot);
        else if (state.currentView === 'ranking') content = renderRanking();
        else if (state.currentView === 'personal') content = renderPersonal();
        else if (state.currentView === 'battle' || state.currentView === 'result') content = renderBattle(snapshot);

        container.innerHTML = `
            <div class="bn-shell">
                <div id="bnGameContainer" class="bn-game-container rango-bajo">
                    <div class="bn-inner">
                        <div class="bn-header">
                            <button type="button" class="bn-icon-btn" onclick="window.batallaNinjaSystem.goBack()">◀</button>
                            <button type="button" class="bn-icon-btn" onclick="window.batallaNinjaSystem.toggleRanking()">🏆 <span>${PARTICIPANT_COUNT}</span></button>
                            <div id="bnTimerDisplay" class="bn-timer">23:59:59</div>
                            <button type="button" class="bn-icon-btn${getPersonalLogButtonClass()}" onclick="window.batallaNinjaSystem.togglePersonalLogs()">💬${getPersonalLogBadge()}</button>
                            <button type="button" class="bn-icon-btn" onclick="window.batallaNinjaSystem.close()">✕</button>
                        </div>
                        <div id="bnViewContainer" class="bn-view">${content}</div>
                    </div>
                </div>
            </div>
        `;

        updateRankVisual();
        updateTimerDisplay();
        restoreScrollPosition(state.currentView);

        if (state.currentView === 'battle' || state.currentView === 'result') {
            updateBattleBars();
            restoreBattleLog();
        }
    }

    function updateTimerDisplay() {
        const timerDisplay = document.getElementById('bnTimerDisplay');
        if (!timerDisplay) return;
        let diff = state.countdownEnd - Date.now();
        if (diff < 0) diff = 0;
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        timerDisplay.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function startTimerLoop() {
        if (state.countdownInterval) return;
        state.countdownInterval = window.setInterval(() => {
            processExpiredCycles();
            updateTimerDisplay();
        }, 1000);
    }

    function runNpcBattleTick(options = {}) {
        if (!options.force && (state.currentView === 'battle' || state.currentView === 'result')) return false;
        const eligibleAttackers = state.ninjas.filter((ninja) => ninja.rank > 3);
        if (!eligibleAttackers.length) return false;
        const attackerSource = eligibleAttackers[Math.floor(Math.random() * eligibleAttackers.length)];
        const candidateRanks = [attackerSource.rank - 1, attackerSource.rank - 2, attackerSource.rank - 3].filter((rank) => rank >= 1);
        const candidates = candidateRanks.map((rank) => getEntityByRank(rank)).filter(Boolean);
        if (!candidates.length) return false;

        const defenderSource = candidates[Math.floor(Math.random() * candidates.length)];
        const attacker = {
            ...attackerSource,
            isPlayer: false,
            stats: { ...attackerSource.stats },
            rank: attackerSource.rank
        };
        const defender = defenderSource.isPlayer
            ? { ...getPlayerSnapshot(), isPlayer: true, rank: state.playerRank, stats: { ...getPlayerSnapshot().stats } }
            : { ...defenderSource, isPlayer: false, stats: { ...defenderSource.stats }, rank: defenderSource.rank };

        simulateRankingFight(attacker, defender);
        state.lastNpcBattleAt = Date.now();
        if (document.getElementById(CONTAINER_ID) && document.getElementById(CONTAINER_ID).classList.contains('active') && ['main', 'ranking', 'personal'].includes(state.currentView)) {
            render();
        }
        queueSave();
        return true;
    }

    function processOfflineNpcBattles(referenceTime) {
        const now = Number(referenceTime) || Date.now();
        const lastTime = Number(state.lastNpcBattleAt) || now;
        const elapsed = Math.max(0, now - lastTime);
        const pendingTicks = Math.min(250, Math.floor(elapsed / NPC_BATTLE_DELAY));
        if (!pendingTicks) return;
        for (let i = 0; i < pendingTicks; i += 1) {
            runNpcBattleTick({ force: true });
        }
        state.lastNpcBattleAt = lastTime + (pendingTicks * NPC_BATTLE_DELAY);
    }

    function startNpcBattles() {
        if (state.npcBattleInterval) return;
        state.npcBattleInterval = window.setInterval(runNpcBattleTick, NPC_BATTLE_DELAY);
    }

    function openBattleNinja() {
        init();
        const container = ensureContainer();
        if (!container) return;
        stopBattle({ silent: true, preserveView: true });
        hideOtherPanels();
        hideBaseContent();
        container.classList.add('active');
        state.currentView = 'scroll';
        render();
        queueSave();
    }

    function closeBattleNinja(options) {
        const restoreBase = !options || options.restoreBase !== false;
        stopBattle({ silent: true, preserveView: true });
        state.currentView = 'scroll';
        state.resultMessage = '';
        const container = document.getElementById(CONTAINER_ID);
        if (container) container.classList.remove('active');
        if (restoreBase) showBaseContent();
        queueSave();
    }

    function enterArena() {
        state.currentView = 'main';
        state.resultMessage = '';
        render();
        queueSave();
    }

    function restoreBattleLog() {
        const log = document.getElementById('bn-combat-log');
        if (!log || !Array.isArray(state.battleLogs)) return;
        log.innerHTML = state.battleLogs.map((message) => `<div class="bn-log-entry">${escapeHtml(message)}</div>`).join('');
        log.scrollTop = log.scrollHeight;
    }

    function pushBattleLog(message) {
        if (!state.battleLogs) state.battleLogs = [];
        state.battleLogs.push(message);
        if (state.battleLogs.length > 20) state.battleLogs.shift();
        restoreBattleLog();
    }

    function updateBattleBars() {
        const player = getPlayerSnapshot();
        const enemy = state.battleEnemy;
        const charHp = document.getElementById('bn-char-hp');
        const charMp = document.getElementById('bn-char-mp');
        const enemyHp = document.getElementById('bn-enemy-hp');
        const enemyMp = document.getElementById('bn-enemy-mp');

        if (charHp) charHp.style.width = `${Math.max(0, Math.min(100, (player.currentHp / Math.max(player.stats.hp, 1)) * 100))}%`;
        if (charMp) charMp.style.width = `${Math.max(0, Math.min(100, (player.currentMp / Math.max(player.stats.mp, 1)) * 100))}%`;
        if (enemyHp && enemy) enemyHp.style.width = `${Math.max(0, Math.min(100, (enemy.currentHp / Math.max(enemy.stats.hp, 1)) * 100))}%`;
        if (enemyMp) enemyMp.style.width = '100%';
    }

    function finalizePlayerBattle(playerWon) {
        if (!state.battleEnemy) return;
        const enemy = state.battleEnemy;
        const realEnemy = state.ninjas.find((ninja) => ninja.id === enemy.id) || enemy;
        const playerEntry = getPlayerSnapshot();
        const enemyEntry = {
            ...realEnemy,
            isPlayer: false,
            rank: realEnemy.rank,
            stats: { ...realEnemy.stats }
        };
        const result = applyRankingResult(playerEntry, enemyEntry, playerWon);

        registerCombat({ ...playerEntry, rank: state.playerRank }, { ...enemyEntry, rank: realEnemy.rank }, playerWon, result.oldRankAtt, result.oldRankDef);
        state.resultMessage = playerWon ? '🏆 GANASTE' : '💔 PERDISTE';
        state.currentView = 'result';
        render();

        if (state.resultTimer) clearTimeout(state.resultTimer);
        state.resultTimer = window.setTimeout(() => {
            state.currentView = 'main';
            state.resultMessage = '';
            state.battleEnemy = null;
            state.battleLogs = [];
            render();
            queueSave();
        }, RESULT_DELAY);
        queueSave();
    }

    function stopBattle(options) {
        if (state.battleInterval) {
            clearInterval(state.battleInterval);
            state.battleInterval = null;
        }
        if (window.jutsusSystem && typeof window.jutsusSystem.endCombatSession === 'function') {
            window.jutsusSystem.endCombatSession();
        }
        if (state.resultTimer) {
            clearTimeout(state.resultTimer);
            state.resultTimer = null;
        }
        state.battleActive = false;
        window.combateActivo = false;
        if (!options || !options.preserveView) {
            state.currentView = 'main';
            state.resultMessage = '';
            state.battleEnemy = null;
            state.battleLogs = [];
            render();
        }
        queueSave();
    }

    function startPlayerBattleLoop() {
        if (!state.battleEnemy) return;
        if (state.battleInterval) clearInterval(state.battleInterval);
        state.battleActive = true;
        window.combateActivo = true;
        if (window.jutsusSystem && typeof window.jutsusSystem.startCombatSession === 'function') {
            window.jutsusSystem.startCombatSession();
        }
        state.battleInterval = window.setInterval(() => {
            if (!state.battleActive || !state.battleEnemy) return;
            const turnEffects = window.jutsusSystem && typeof window.jutsusSystem.resolveTurnEffects === 'function'
                ? window.jutsusSystem.resolveTurnEffects({ phase: 'turno arena ninja', onLog: pushBattleLog })
                : {};
            const player = getPlayerSnapshot();
            const enemy = state.battleEnemy;
            if (player.currentHp <= 0 || enemy.currentHp <= 0) return;

            const playerDamage = Math.max(1, Math.floor(computeMissionStyleDamage(player, enemy, true) * (turnEffects.damageMultiplier || 1)));
            enemy.currentHp = Math.max(0, enemy.currentHp - playerDamage);
            pushBattleLog(`🥷 Atacas a ${enemy.name} y causas ${playerDamage} de daño.`);
            updateBattleBars();
            if (typeof window.updateBars === 'function') window.updateBars();

            if (enemy.currentHp <= 0) {
                pushBattleLog(`💀 ¡${enemy.name} fue derrotado!`);
                stopBattle({ silent: true, preserveView: true });
                finalizePlayerBattle(true);
                return;
            }

            const evasionChance = ((window.personaje?.evasion || 0) + (turnEffects.evasionBonus || 0)) / 100;
            if (Math.random() < evasionChance) {
                pushBattleLog(`💨 ${enemy.name} falló por la evasión de tus Jutsus.`);
                updateBattleBars();
                if (typeof window.updateBars === 'function') window.updateBars();
                queueSave();
                return;
            }

            const enemyDamage = Math.max(1, Math.floor(computeMissionStyleDamage(enemy, player, false) * Math.max(0.2, 1 - ((turnEffects.mitigationBonus || 0) / 100))));
            if (window.personaje) {
                window.personaje.hp = Math.max(0, (window.personaje.hp || 0) - enemyDamage);
            }
            pushBattleLog(`👹 ${enemy.name} te golpea y causa ${enemyDamage} de daño.`);
            updateBattleBars();
            if (typeof window.updateBars === 'function') window.updateBars();

            if ((window.personaje && window.personaje.hp <= 0) || getPlayerSnapshot().currentHp <= 0) {
                pushBattleLog('😵 Has sido derrotado...');
                stopBattle({ silent: true, preserveView: true });
                finalizePlayerBattle(false);
            }
            queueSave();
        }, PLAYER_BATTLE_TICK);
    }

    function startBattle(enemyRank) {
        refreshNinjaLevels();
        const enemy = state.ninjas.find((ninja) => ninja.rank === enemyRank);
        if (!enemy) return;
        stopBattle({ silent: true, preserveView: true });
        state.battleEnemy = {
            ...enemy,
            stats: { ...enemy.stats },
            currentHp: enemy.stats.hp
        };
        state.battleLogs = [];
        state.resultMessage = '';
        state.currentView = 'battle';
        render();
        pushBattleLog(`⚔️ ¡Comienza el combate contra ${enemy.name} #${enemy.rank}!`);
        startPlayerBattleLoop();
        queueSave();
    }

    function goBack() {
        if (state.currentView === 'battle' || state.currentView === 'result') {
            stopBattle();
            return;
        }
        if (state.currentView === 'ranking' || state.currentView === 'personal') {
            state.currentView = 'main';
            render();
            queueSave();
            return;
        }
        if (state.currentView === 'main') {
            state.currentView = 'scroll';
            render();
            queueSave();
            return;
        }
        closeBattleNinja();
    }

    function toggleRanking() {
        if (state.currentView === 'battle' || state.currentView === 'result') return;
        state.currentView = state.currentView === 'ranking' ? 'main' : 'ranking';
        render();
        queueSave();
    }

    function togglePersonalLogs() {
        if (state.currentView === 'battle' || state.currentView === 'result') return;
        const opening = state.currentView !== 'personal';
        state.currentView = opening ? 'personal' : 'main';
        if (opening) markPersonalLogsAsRead();
        render();
        queueSave();
    }

    function getPersistentState() {
        return {
            ninjas: state.ninjas.map((ninja) => ({
                id: ninja.id,
                name: ninja.name,
                rank: ninja.rank,
                level: ninja.level,
                formulaIdx: ninja.formulaIdx,
                rankTitle: ninja.rankTitle,
                stats: { ...ninja.stats }
            })),
            playerRank: state.playerRank,
            currentView: ['ranking', 'personal', 'main', 'scroll'].includes(state.currentView) ? state.currentView : 'main',
            countdownEnd: state.countdownEnd,
            rankingLogs: state.rankingLogs.slice(0, MAX_RANKING_LOGS),
            personalLogs: state.personalLogs.slice(0, MAX_PERSONAL_LOGS),
            personalUnreadCount: state.personalUnreadCount,
            lastNpcBattleAt: state.lastNpcBattleAt,
            scrollPositions: { ...state.scrollPositions }
        };
    }


    function resetProgress() {
        stopBattle({ silent: true, preserveView: true });
        initNinjas();
        state.playerRank = PLAYER_DEFAULT_RANK;
        state.currentView = 'scroll';
        state.countdownEnd = Date.now() + CYCLE_DURATION;
        state.rankingLogs = [];
        state.personalLogs = [];
        state.personalUnreadCount = 0;
        state.battleEnemy = null;
        state.battleLogs = [];
        state.resultMessage = '';
        state.scrollPositions = {};
        state.lastSnapshot = null;
        state.lastNpcBattleAt = Date.now();
        if (document.getElementById(CONTAINER_ID) && document.getElementById(CONTAINER_ID).classList.contains('active')) {
            render();
        }
    }

    function loadPersistentState(savedState) {
        if (!savedState || typeof savedState !== 'object') return;
        initNinjas();
        if (Array.isArray(savedState.ninjas) && savedState.ninjas.length === PARTICIPANT_COUNT) {
            state.ninjas = savedState.ninjas.map((ninja, index) => ({
                id: typeof ninja.id === 'number' ? ninja.id : index,
                name: ninja.name || rawNames[index % rawNames.length],
                rank: Number(ninja.rank) || index + 1,
                level: Math.max(1, Number(ninja.level) || getRandomEnemyLevel()),
                formulaIdx: Number.isInteger(ninja.formulaIdx) ? ninja.formulaIdx % formulas.length : 0,
                rankTitle: ninja.rankTitle || deriveRankTitle(Number(ninja.level) || 1),
                stats: ninja.stats || formulas[0](Math.max(1, Number(ninja.level) || 1))
            }));
        }
        state.playerRank = Math.max(1, Number(savedState.playerRank) || PLAYER_DEFAULT_RANK);
        state.currentView = ['ranking', 'personal', 'main', 'scroll'].includes(savedState.currentView) ? savedState.currentView : 'scroll';
        state.countdownEnd = Number(savedState.countdownEnd) || (Date.now() + CYCLE_DURATION);
        state.rankingLogs = Array.isArray(savedState.rankingLogs) ? savedState.rankingLogs.slice(0, MAX_RANKING_LOGS) : [];
        state.personalLogs = Array.isArray(savedState.personalLogs)
            ? savedState.personalLogs.slice(0, MAX_PERSONAL_LOGS).map((log) => ({ ...log, read: log.read !== false }))
            : [];
        state.personalUnreadCount = Math.max(0, Math.min(99, Number(savedState.personalUnreadCount) || 0));
        state.lastNpcBattleAt = Number(savedState.lastNpcBattleAt) || Date.now();
        state.scrollPositions = savedState.scrollPositions && typeof savedState.scrollPositions === 'object'
            ? { ...savedState.scrollPositions }
            : {};
        processOfflineNpcBattles(Date.now());
        processExpiredCycles();
        normalizeRanks();
        if (document.getElementById(CONTAINER_ID) && document.getElementById(CONTAINER_ID).classList.contains('active')) {
            render();
        }
    }

    function bindButtons() {
        const buttons = Array.from(document.querySelectorAll('.menu-btn'));
        const battleButton = getBattleButton();

        buttons.forEach((button) => {
            if (button === battleButton || button.dataset.batallaNinjaCloseBound === '1') return;
            button.dataset.batallaNinjaCloseBound = '1';
            button.addEventListener('click', function () {
                closeBattleNinja({ restoreBase: false });
            }, true);
        });

        if (battleButton && battleButton.dataset.batallaNinjaBound !== '1') {
            battleButton.dataset.batallaNinjaBound = '1';
            battleButton.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                openBattleNinja();
            });
        }
    }

    function init() {
        if (state.initialized) {
            bindButtons();
            ensureContainer();
            return;
        }
        injectStyles();
        initNinjas();
        ensureContainer();
        bindButtons();
        startTimerLoop();
        processOfflineNpcBattles(Date.now());
        startNpcBattles();
        processExpiredCycles();
        state.initialized = true;
    }

    window.batallaNinjaSystem = {
        init,
        open: openBattleNinja,
        close: closeBattleNinja,
        enterArena,
        startBattle,
        stopBattle,
        goBack,
        toggleRanking,
        togglePersonalLogs,
        render,
        getPersistentState,
        loadPersistentState,
        resetProgress
    };

    window.toggleBatallaNinja = function (event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        openBattleNinja();
    };

    window.closeBatallaNinja = closeBattleNinja;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());