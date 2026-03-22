(function () {
    'use strict';

    const JUTSU_STYLE_ID = 'jutsus-system-styles';
    const JUTSU_CONTAINER_ID = 'jutsus-overlay-container';
    const SLOT_COUNT = 3;
    const DEFAULT_STATE = {
        slots: [null, null, null],
        skillLevels: {},
        selectedId: null
    };

    const SKILLS = [
        { id: 0, name: 'Filo Ígneo', icon: '🔥', desc: 'Ignora defensa física, otorga evasión y quema al enemigo.', dur: '3.0 seg', statLabels: ['⚕️Perf', '💨Evas', '🔥Comb', '📈Prob', '🔵MP'], levels: [[5.0, 2.0, 1.0, 3, 20], [6.0, 2.5, 1.1, 5, 23], [7.0, 3.0, 1.2, 8, 27], [8.0, 3.5, 1.3, 10, 30], [9.0, 4.0, 1.4, 13, 33], [10.0, 4.5, 1.5, 15, 37], [11.0, 5.0, 1.6, 18, 40], [12.0, 5.5, 1.7, 20, 43], [13.0, 6.0, 1.8, 23, 47], [15.0, 8.0, 2.0, 25, 50]] },
        { id: 1, name: 'Baluarte Tóxico', icon: '☠️', desc: 'Potencia críticos, bloquea daño a la mitad y envenena.', dur: '3 turnos', statLabels: ['💥Crit', '🛡️Bloq', '☠️Ven', '📈Prob', '🔵MP'], levels: [[10, 3, 5, 3, 20], [12, 4, 6, 5, 23], [14, 5, 7, 8, 27], [16, 6, 8, 10, 30], [18, 7, 9, 13, 33], [20, 8, 10, 15, 37], [22, 9, 11, 18, 40], [24, 10, 12, 20, 43], [26, 11, 13, 23, 47], [30, 15, 15, 25, 50]] },
        { id: 2, name: 'Ojo del Segador', icon: '👁️', desc: 'Asegura precisión, regenera vida y desangra al recibir daño.', dur: '4.0 seg', statLabels: ['🎯Prec', '❤️Reg', '🩸Hem', '📈Prob', '🔵MP'], levels: [[4.0, 0.5, 1.0, 3, 20], [5.0, 0.6, 1.2, 5, 23], [6.0, 0.7, 1.4, 8, 27], [7.0, 0.8, 1.6, 10, 30], [8.0, 0.9, 1.8, 13, 33], [9.0, 1.0, 2.0, 15, 37], [10.0, 1.1, 2.2, 18, 40], [11.0, 1.2, 2.4, 20, 43], [12.0, 1.3, 2.6, 23, 47], [15.0, 2.0, 3.5, 25, 50]] },
        { id: 3, name: 'Espejo Glacial', icon: '🧊', desc: 'Roba vida al dañar, devuelve daño y congela al rival.', dur: '2.2 seg', statLabels: ['💧Dren', '↩️Refl', '❄️Cong', '📈Prob', '🔵MP'], levels: [[2.0, 3.0, 1.0, 3, 20], [2.5, 4.0, 1.1, 5, 23], [3.0, 5.0, 1.2, 8, 27], [3.5, 6.0, 1.3, 10, 30], [4.0, 7.0, 1.4, 11, 33], [4.5, 8.0, 1.5, 15, 37], [5.0, 9.0, 1.6, 18, 40], [5.5, 10.0, 1.7, 20, 43], [6.0, 11.0, 1.8, 23, 47], [8.0, 15.0, 2.2, 25, 50]] },
        { id: 4, name: 'Martillo Sísmico', icon: '⚡', desc: 'Causa hemorragia crítica, crea escudos y aturde.', dur: '3.5 seg', statLabels: ['🩸Hem', '🛡️Esc', '😵Atrd', '📈Prob', '🔵MP'], levels: [[3.0, 10, 1.5, 3, 20], [3.5, 12, 1.7, 5, 23], [4.0, 14, 1.9, 8, 27], [4.5, 16, 2.1, 10, 30], [5.0, 18, 2.3, 13, 33], [5.5, 20, 2.5, 15, 37], [6.0, 22, 2.7, 18, 40], [6.5, 24, 3.0, 20, 43], [7.0, 26, 3.2, 23, 47], [9.0, 35, 3.5, 25, 50]] },
        { id: 5, name: 'Viento de Inercia', icon: '🌪️', desc: 'Ataca dos veces, resiste aturdimientos y ralentiza.', dur: '4 turnos', statLabels: ['✌️Multi', '💪Resil', '🐢Ral', '📈Prob', '🔵MP'], levels: [[5, 6, 10, 3, 20], [6, 7.5, 11, 5, 23], [7, 9, 12, 8, 27], [8, 10.5, 13, 10, 30], [9, 12, 14, 13, 33], [10, 13.5, 15, 15, 37], [11, 15, 16, 18, 40], [12, 16.5, 17, 20, 43], [13, 18, 18, 23, 47], [16, 25, 25, 25, 50]] },
        { id: 6, name: 'Marca del Verdugo', icon: '💀', desc: 'Ejecuta al enemigo herido, da inmunidad y bloquea curas.', dur: '2.0 seg', statLabels: ['⚡Acel', '🛡️Inm', '⛓️Cad', '📈Prob', '🔵MP'], levels: [[8, 0.5, 15, 3, 20], [9, 0.6, 18, 5, 23], [10, 0.7, 21, 8, 27], [11, 0.8, 24, 10, 30], [12, 1.0, 27, 13, 33], [13, 1.2, 30, 15, 37], [14, 1.4, 33, 18, 40], [15, 1.6, 36, 20, 43], [16, 1.8, 39, 23, 47], [20, 2.0, 50, 25, 50]] },
        { id: 7, name: 'Sentencia Elemental', icon: '🌟', desc: 'Anula resistencias, asegura críticos tras esquiva y explota.', dur: '4 turnos', statLabels: ['🔓Pen', '⚡EsqC', '💣Mald', '📈Prob', '🔵MP'], levels: [[4, 3, 15, 3, 20], [5, 4, 18, 5, 23], [6, 5, 21, 8, 27], [7, 6, 24, 10, 30], [8, 7, 27, 13, 33], [9, 8, 30, 15, 37], [10, 9, 33, 18, 40], [11, 10, 36, 20, 43], [12, 11, 39, 23, 47], [15, 15, 50, 25, 50]] }
    ];

    const state = {
        selectedId: null,
        combat: createCombatState(),
        panelVisible: false,
        toastTimer: null
    };

    function createCombatState() {
        return {
            active: false,
            source: null,
            enemyDots: [],
            playerEffects: {
                shield: 0,
                reflectPct: 0,
                reductionPct: 0,
                evadeBonusPct: 0,
                immunity: false,
                lastTurnEvaded: false,
                stunResistPct: 0
            },
            enemyEffects: {
                skipTurns: 0,
                slowPct: 0
            }
        };
    }

    function upgradeCost(level) {
        return level * 120 + 80;
    }

    function getSkillById(id) {
        return SKILLS.find((skill) => skill.id === id) || null;
    }

    function getSkillState() {
        if (!window.personaje) return { ...DEFAULT_STATE, skillLevels: getDefaultLevels() };
        if (!window.personaje.jutsus) {
            window.personaje.jutsus = {
                slots: [null, null, null],
                skillLevels: getDefaultLevels()
            };
        }
        if (!Array.isArray(window.personaje.jutsus.slots) || window.personaje.jutsus.slots.length !== SLOT_COUNT) {
            window.personaje.jutsus.slots = [null, null, null];
        }
        if (!window.personaje.jutsus.skillLevels || typeof window.personaje.jutsus.skillLevels !== 'object') {
            window.personaje.jutsus.skillLevels = getDefaultLevels();
        }
        SKILLS.forEach((skill) => {
            if (typeof window.personaje.jutsus.skillLevels[skill.id] !== 'number') {
                window.personaje.jutsus.skillLevels[skill.id] = 1;
            }
        });
        return window.personaje.jutsus;
    }

    function getDefaultLevels() {
        const levels = {};
        SKILLS.forEach((skill) => {
            levels[skill.id] = 1;
        });
        return levels;
    }

    function getSkillLevel(id) {
        return getSkillState().skillLevels[id] || 1;
    }

    function getSkillStats(id) {
        const skill = getSkillById(id);
        if (!skill) return null;
        return skill.levels[getSkillLevel(id) - 1];
    }

    function getEquippedSkills() {
        return getSkillState().slots.filter((id) => id !== null).map((id) => ({
            skill: getSkillById(id),
            level: getSkillLevel(id),
            stats: getSkillStats(id)
        })).filter((entry) => entry.skill && entry.stats);
    }

    function fmtStat(skill, index, value) {
        if ((skill.id === 3 && index === 2) || (skill.id === 4 && index === 2)) return `${value}s`;
        return `${value}%`;
    }

    function parseDurationToTurns(rawValue) {
        const text = String(rawValue || '').toLowerCase();
        const numeric = parseFloat(text.replace(',', '.'));
        if (!Number.isFinite(numeric)) return 1;
        if (text.includes('turn')) return Math.max(1, Math.round(numeric));
        return Math.max(1, Math.round(numeric));
    }

    function showToast(message) {
        const toast = document.getElementById('jutsu-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        if (state.toastTimer) clearTimeout(state.toastTimer);
        state.toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function ensureStyles() {
        if (document.getElementById(JUTSU_STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = JUTSU_STYLE_ID;
        style.textContent = `
            #${JUTSU_CONTAINER_ID} {
                display:none;
                position:absolute;
                inset:0;
                z-index:1005;
                border-radius:15px;
                overflow:hidden;
                background:linear-gradient(180deg, #f8f2eb 0%, #f0e6d8 100%);
                color:#2a1f14;
            }
            #${JUTSU_CONTAINER_ID}.active { display:block; }
            #${JUTSU_CONTAINER_ID} .jutsu-shell {
                width:100%; height:100%; display:flex; flex-direction:column; gap:6px; padding:6px;
                font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            #${JUTSU_CONTAINER_ID} .jutsu-card {
                background:#ffffffee; border:1px solid #d4c4b0; border-radius:12px; box-shadow:0 2px 8px rgba(100,60,20,0.13);
            }
            #${JUTSU_CONTAINER_ID} .jutsu-header { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 10px; }
            #${JUTSU_CONTAINER_ID} .jutsu-title { font-size:11px; letter-spacing:2px; font-weight:800; text-transform:uppercase; color:#1a6b8a; }
            #${JUTSU_CONTAINER_ID} .jutsu-close {
                border:1px solid #1a6b8a; background:white; color:#1a6b8a; border-radius:999px; padding:5px 10px; cursor:pointer; font-weight:800; font-size:10px;
            }
            #${JUTSU_CONTAINER_ID} .section-title { font-size:9px; letter-spacing:2px; color:#1a6b8a; text-transform:uppercase; margin-bottom:7px; font-weight:800; display:flex; align-items:center; gap:4px; }
            #${JUTSU_CONTAINER_ID} .section-title::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,#d4c4b0,transparent); }
            #${JUTSU_CONTAINER_ID} .slots-card, #${JUTSU_CONTAINER_ID} .upgrade-card { padding:8px; flex-shrink:0; }
            #${JUTSU_CONTAINER_ID} .library-card { padding:8px; flex:1; display:flex; flex-direction:column; min-height:0; }
            #${JUTSU_CONTAINER_ID} .slots-row { display:flex; align-items:center; gap:6px; }
            #${JUTSU_CONTAINER_ID} .skill-slot {
                flex:1; height:54px; border:2px solid #d4c4b0; border-radius:10px; background:#ede5d8; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; position:relative; overflow:hidden;
            }
            #${JUTSU_CONTAINER_ID} .skill-slot:hover { border-color:#1a6b8a; background:#e8f4f8; }
            #${JUTSU_CONTAINER_ID} .skill-slot.occupied { border-color:#5a9e1a; background:#f0f8e8; box-shadow:0 0 0 2px rgba(90,158,26,0.15); }
            #${JUTSU_CONTAINER_ID} .skill-slot::before, #${JUTSU_CONTAINER_ID} .skill-slot::after { content:''; position:absolute; width:9px; height:9px; border-style:solid; border-color:#c0550a; opacity:.5; }
            #${JUTSU_CONTAINER_ID} .skill-slot::before { top:3px; left:3px; border-width:2px 0 0 2px; }
            #${JUTSU_CONTAINER_ID} .skill-slot::after { bottom:3px; right:3px; border-width:0 2px 2px 0; }
            #${JUTSU_CONTAINER_ID} .slot-icon { font-size:18px; line-height:1; }
            #${JUTSU_CONTAINER_ID} .slot-name { font-size:7px; color:#7a6a58; margin-top:2px; text-align:center; max-width:90%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #${JUTSU_CONTAINER_ID} .slot-empty-text { font-size:20px; color:#d4c4b0; font-weight:300; }
            #${JUTSU_CONTAINER_ID} .btn-info {
                width:34px; height:34px; border:2px solid #1a6b8a; border-radius:50%; background:white; color:#1a6b8a; font-size:15px; font-weight:800; cursor:pointer; flex-shrink:0;
            }
            #${JUTSU_CONTAINER_ID} .skills-list { overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:5px; padding-right:3px; }
            #${JUTSU_CONTAINER_ID} .skills-list::-webkit-scrollbar, #${JUTSU_CONTAINER_ID} .glossary-body::-webkit-scrollbar { width:4px; }
            #${JUTSU_CONTAINER_ID} .skills-list::-webkit-scrollbar-thumb, #${JUTSU_CONTAINER_ID} .glossary-body::-webkit-scrollbar-thumb { background:#d4c4b0; border-radius:4px; }
            #${JUTSU_CONTAINER_ID} .skill-item { background:#fdf8f3; border:1px solid #d4c4b0; border-radius:9px; padding:7px 9px; cursor:pointer; transition:all .18s; }
            #${JUTSU_CONTAINER_ID} .skill-item:hover { border-color:#1a6b8a; background:#edf6fa; transform:translateX(2px); }
            #${JUTSU_CONTAINER_ID} .skill-item.selected { border-color:#c0550a; background:#fdf3ec; box-shadow:0 0 0 2px rgba(192,85,10,.12); }
            #${JUTSU_CONTAINER_ID} .skill-item.equipped { border-left:3px solid #5a9e1a; }
            #${JUTSU_CONTAINER_ID} .skill-item-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:6px; }
            #${JUTSU_CONTAINER_ID} .skill-item-name { font-size:12px; font-weight:700; color:#2a1f14; }
            #${JUTSU_CONTAINER_ID} .skill-level-badge { font-size:9px; padding:1px 6px; border-radius:10px; background:#ede5d8; color:#1a6b8a; font-weight:700; border:1px solid #d4c4b0; }
            #${JUTSU_CONTAINER_ID} .skill-stats-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
            #${JUTSU_CONTAINER_ID} .stat-chip { font-size:9px; color:#7a6a58; display:flex; align-items:center; gap:2px; white-space:nowrap; }
            #${JUTSU_CONTAINER_ID} .stat-chip span { color:#c0550a; font-weight:700; }
            #${JUTSU_CONTAINER_ID} .upgrade-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px; }
            #${JUTSU_CONTAINER_ID} .upgrade-name { font-size:11px; font-weight:800; color:#c0550a; }
            #${JUTSU_CONTAINER_ID} .gold-display { font-size:10px; color:#b87800; font-weight:700; background:#fff8e8; border:1px solid #e8d090; border-radius:10px; padding:2px 8px; }
            #${JUTSU_CONTAINER_ID} .compare-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:7px; }
            #${JUTSU_CONTAINER_ID} .compare-box { background:#ede5d8; border-radius:8px; padding:6px 8px; border:1px solid #d4c4b0; }
            #${JUTSU_CONTAINER_ID} .compare-box.next { border-color:rgba(90,158,26,.5); background:#f2fae8; }
            #${JUTSU_CONTAINER_ID} .compare-label { font-size:8px; color:#7a6a58; letter-spacing:1px; margin-bottom:3px; font-weight:800; text-transform:uppercase; }
            #${JUTSU_CONTAINER_ID} .compare-label.next-lbl { color:#5a9e1a; }
            #${JUTSU_CONTAINER_ID} .compare-stat { font-size:9px; color:#2a1f14; line-height:1.55; }
            #${JUTSU_CONTAINER_ID} .compare-stat .up { color:#5a9e1a; font-weight:700; }
            #${JUTSU_CONTAINER_ID} .action-row { display:flex; gap:6px; }
            #${JUTSU_CONTAINER_ID} .btn { flex:1; padding:7px 4px; border-radius:8px; border:none; font-size:10px; font-weight:800; letter-spacing:1px; cursor:pointer; text-transform:uppercase; }
            #${JUTSU_CONTAINER_ID} .btn-upgrade { background:linear-gradient(135deg,#c0550a,#a03d00); color:white; }
            #${JUTSU_CONTAINER_ID} .btn-upgrade:disabled { background:#d9d0c7; color:#a89880; cursor:not-allowed; }
            #${JUTSU_CONTAINER_ID} .btn-equip { background:linear-gradient(135deg,#5a9e1a,#3d7a10); color:white; }
            #${JUTSU_CONTAINER_ID} .btn-equip.unequip { background:linear-gradient(135deg,#c0550a,#8a1a00); }
            #${JUTSU_CONTAINER_ID} .select-hint, #${JUTSU_CONTAINER_ID} .jutsu-help { font-size:9px; color:#7a6a58; text-align:center; padding:8px; line-height:1.5; }
            #${JUTSU_CONTAINER_ID} .jutsu-help { background:#fff8e8; border:1px dashed #d4c4b0; border-radius:8px; margin-top:6px; }
            #${JUTSU_CONTAINER_ID} .glossary-overlay {
                display:none; position:absolute; inset:0; background:rgba(40,20,5,.45); z-index:1010; justify-content:center; align-items:center;
            }
            #${JUTSU_CONTAINER_ID} .glossary-overlay.open { display:flex; }
            #${JUTSU_CONTAINER_ID} .glossary-box { width:330px; max-height:460px; background:#fffdf9; border:2px solid #d4c4b0; border-radius:14px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 12px 40px rgba(100,60,20,.25); }
            #${JUTSU_CONTAINER_ID} .glossary-header { background:linear-gradient(90deg,#c0550a,#1a6b8a); padding:10px 14px; display:flex; justify-content:space-between; align-items:center; }
            #${JUTSU_CONTAINER_ID} .glossary-title { font-size:11px; font-weight:800; color:white; letter-spacing:2px; }
            #${JUTSU_CONTAINER_ID} .glossary-close { background:rgba(255,255,255,.2); border:none; color:white; font-size:14px; width:24px; height:24px; border-radius:50%; cursor:pointer; }
            #${JUTSU_CONTAINER_ID} .glossary-body { overflow-y:auto; padding:10px; flex:1; display:flex; flex-direction:column; gap:8px; background:#f5f0eb; }
            #${JUTSU_CONTAINER_ID} .glossary-item { background:white; border:1px solid #d4c4b0; border-left:3px solid #c0550a; border-radius:8px; padding:8px 10px; }
            #${JUTSU_CONTAINER_ID} .glossary-name { font-size:12px; font-weight:800; color:#c0550a; margin-bottom:3px; }
            #${JUTSU_CONTAINER_ID} .glossary-desc { font-size:10px; color:#7a6a58; margin-bottom:3px; }
            #${JUTSU_CONTAINER_ID} .glossary-dur { font-size:9px; color:#1a6b8a; font-weight:600; }
            #${JUTSU_CONTAINER_ID} .glossary-stats-title { font-size:8px; color:#2a1f14; margin:4px 0 2px; font-weight:800; letter-spacing:1px; text-transform:uppercase; }
            #${JUTSU_CONTAINER_ID} .glossary-level-row { font-size:8px; color:#7a6a58; line-height:1.7; }
            #jutsu-toast {
                position:fixed; bottom:20px; left:50%; transform:translateX(-50%) translateY(60px); background:white; border:1px solid #d4c4b0; color:#2a1f14; padding:8px 16px; border-radius:20px; font-size:11px; font-weight:600; z-index:2000; transition:transform .3s ease; white-space:nowrap; box-shadow:0 4px 16px rgba(100,60,20,.13);
            }
            #jutsu-toast.show { transform:translateX(-50%) translateY(0); }
        `;
        document.head.appendChild(style);
    }

    function ensureContainer() {
        ensureStyles();
        let container = document.getElementById(JUTSU_CONTAINER_ID);
        if (container) return container;
        const centerArea = document.querySelector('.center-area');
        if (!centerArea) return null;
        if (getComputedStyle(centerArea).position === 'static') centerArea.style.position = 'relative';
        container = document.createElement('div');
        container.id = JUTSU_CONTAINER_ID;
        centerArea.appendChild(container);
        container.innerHTML = `
            <div class="jutsu-shell">
                <div class="jutsu-card jutsu-header">
                    <div>
                        <div class="jutsu-title">🥷 Jutsus</div>
                        <div style="font-size:10px;color:#7a6a58;">Las técnicas equipadas solo aplican sus efectos cuando se activan en combate.</div>
                    </div>
                    <button type="button" class="jutsu-close" id="jutsu-close-btn">Cerrar</button>
                </div>
                <div class="jutsu-card slots-card">
                    <div class="section-title">⚔ Habilidades Equipadas</div>
                    <div class="slots-row">
                        <div class="skill-slot" data-slot="0"></div>
                        <div class="skill-slot" data-slot="1"></div>
                        <div class="skill-slot" data-slot="2"></div>
                        <button id="btn-jutsu-info" class="btn-info" type="button" title="Glosario de Habilidades">?</button>
                    </div>
                </div>
                <div class="jutsu-card library-card">
                    <div class="section-title">📜 Biblioteca de Técnicas</div>
                    <div id="jutsu-skills-list" class="skills-list"></div>
                </div>
                <div class="jutsu-card upgrade-card">
                    <div id="jutsu-upgrade-panel"></div>
                    <div class="jutsu-help">Las estadísticas de los JUTSUS no se suman al personaje por equiparlas. Cada turno del combate se verifica su probabilidad de activación, consumen MP al activarse y todos los efectos se eliminan al terminar la batalla.</div>
                </div>
                <div class="glossary-overlay" id="jutsu-glossary-overlay">
                    <div class="glossary-box">
                        <div class="glossary-header">
                            <span class="glossary-title">📖 GLOSARIO DE TÉCNICAS</span>
                            <button type="button" class="glossary-close" id="jutsu-glossary-close">✕</button>
                        </div>
                        <div class="glossary-body" id="jutsu-glossary-body"></div>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('jutsu-toast')) {
            const toast = document.createElement('div');
            toast.id = 'jutsu-toast';
            document.body.appendChild(toast);
        }

        container.querySelector('#jutsu-close-btn').addEventListener('click', closePanel);
        container.querySelector('#btn-jutsu-info').addEventListener('click', openGlossary);
        container.querySelector('#jutsu-glossary-close').addEventListener('click', closeGlossary);
        container.querySelector('#jutsu-glossary-overlay').addEventListener('click', (event) => {
            if (event.target.id === 'jutsu-glossary-overlay') closeGlossary();
        });
        Array.from(container.querySelectorAll('.skill-slot')).forEach((slot) => {
            slot.addEventListener('click', () => onSlotClick(Number(slot.dataset.slot)));
        });
        return container;
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
        if (window.batallaNinjaSystem && typeof window.batallaNinjaSystem.close === 'function') window.batallaNinjaSystem.close({ restoreBase: false });
        ['hero-equipment-container', 'missions-overlay-container', 'arbol-overlay-container', 'batalla-ninja-container'].forEach((id) => {
            const panel = document.getElementById(id);
            if (panel) panel.style.display = 'none';
        });
    }

    function openPanel() {
        const container = ensureContainer();
        if (!container) return;
        hideOtherPanels();
        hideBaseContent();
        state.panelVisible = true;
        container.classList.add('active');
        renderAll();
    }

    function closePanel() {
        const container = document.getElementById(JUTSU_CONTAINER_ID);
        if (container) container.classList.remove('active');
        state.panelVisible = false;
        showBaseContent();
    }

    function togglePanel(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (state.panelVisible) closePanel();
        else openPanel();
    }

    function renderAll() {
        renderSlots();
        renderSkillList();
        renderUpgradePanel();
    }

    function renderSlots() {
        const container = ensureContainer();
        if (!container) return;
        const jutsuState = getSkillState();
        Array.from(container.querySelectorAll('.skill-slot')).forEach((element, index) => {
            const id = jutsuState.slots[index];
            if (id !== null) {
                const skill = getSkillById(id);
                if (!skill) return;
                element.classList.add('occupied');
                element.innerHTML = `<span class="slot-icon">${skill.icon}</span><span class="slot-name">${escapeHtml(skill.name)}</span>`;
            } else {
                element.classList.remove('occupied');
                element.innerHTML = '<span class="slot-empty-text">+</span>';
            }
        });
    }

    function renderSkillList() {
        const list = document.getElementById('jutsu-skills-list');
        if (!list) return;
        const jutsuState = getSkillState();
        list.innerHTML = '';
        SKILLS.forEach((skill) => {
            const level = jutsuState.skillLevels[skill.id] || 1;
            const stats = skill.levels[level - 1];
            const equipped = jutsuState.slots.includes(skill.id);
            const selected = state.selectedId === skill.id;
            const item = document.createElement('div');
            item.className = `skill-item${selected ? ' selected' : ''}${equipped ? ' equipped' : ''}`;
            item.innerHTML = `
                <div class="skill-item-header">
                    <span class="skill-item-name">${skill.icon} ${escapeHtml(skill.name)}</span>
                    <span class="skill-level-badge">Nv.${level}${equipped ? ' ✓' : ''}</span>
                </div>
                <div class="skill-stats-row">
                    <div class="stat-chip">${skill.statLabels[0]} <span>${fmtStat(skill, 0, stats[0])}</span></div>
                    <div class="stat-chip">${skill.statLabels[1]} <span>${fmtStat(skill, 1, stats[1])}</span></div>
                    <div class="stat-chip">${skill.statLabels[2]} <span>${fmtStat(skill, 2, stats[2])}</span></div>
                </div>
            `;
            item.addEventListener('click', () => selectSkill(skill.id));
            list.appendChild(item);
        });
    }

    function selectSkill(id) {
        state.selectedId = id;
        renderSkillList();
        renderUpgradePanel();
    }

    function renderUpgradePanel() {
        const panel = document.getElementById('jutsu-upgrade-panel');
        if (!panel) return;
        const player = window.personaje || {};
        if (state.selectedId === null) {
            panel.innerHTML = '<p class="select-hint">Selecciona una habilidad para ver detalles, mejorarla o equiparla.</p>';
            return;
        }
        const skill = getSkillById(state.selectedId);
        if (!skill) return;
        const jutsuState = getSkillState();
        const level = jutsuState.skillLevels[skill.id] || 1;
        const current = skill.levels[level - 1];
        const maxLevel = skill.levels.length;
        const isMax = level >= maxLevel;
        const next = isMax ? null : skill.levels[level];
        const cost = isMax ? 0 : upgradeCost(level);
        const canAfford = (player.oro || 0) >= cost && !isMax;
        const equipped = jutsuState.slots.includes(skill.id);
        const slotIndex = jutsuState.slots.indexOf(skill.id);

        let nowHtml = '';
        let nextHtml = '';
        for (let i = 0; i < 5; i += 1) {
            nowHtml += `<div>${skill.statLabels[i]}: ${fmtStat(skill, i, current[i])}</div>`;
            if (next) {
                const up = next[i] > current[i];
                nextHtml += `<div>${skill.statLabels[i]}: <span class="${up ? 'up' : ''}">${fmtStat(skill, i, next[i])}${up ? ' ▲' : ''}</span></div>`;
            }
        }

        panel.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name">${skill.icon} ${escapeHtml(skill.name)} — Nv.${level}</span>
                <span class="gold-display">🪙 ${player.oro || 0}</span>
            </div>
            <div class="compare-grid">
                <div class="compare-box">
                    <div class="compare-label">⬛ Ahora</div>
                    <div class="compare-stat">${nowHtml}</div>
                </div>
                <div class="compare-box next">
                    <div class="compare-label next-lbl">🟩 Siguiente</div>
                    <div class="compare-stat">${isMax ? '<em style="color:#b87800">¡Nivel Máximo!</em>' : nextHtml}</div>
                </div>
            </div>
            <div class="action-row">
                <button type="button" class="btn btn-upgrade" id="jutsu-btn-upgrade" ${canAfford ? '' : 'disabled'}>${isMax ? '⭐ MAX' : `⬆ Mejorar 🪙${cost}`}</button>
                <button type="button" class="btn btn-equip ${equipped ? 'unequip' : ''}" id="jutsu-btn-equip">${equipped ? '❌ Quitar' : '✅ Equipar'}</button>
            </div>
        `;
        panel.querySelector('#jutsu-btn-upgrade').addEventListener('click', () => upgradeSkill(skill.id));
        panel.querySelector('#jutsu-btn-equip').addEventListener('click', () => {
            if (equipped) unequipSkill(slotIndex);
            else equipSkill(skill.id);
        });
    }

    function upgradeSkill(id) {
        if (!window.personaje) return;
        const jutsuState = getSkillState();
        const level = jutsuState.skillLevels[id] || 1;
        const skill = getSkillById(id);
        if (!skill) return;
        if (level >= skill.levels.length) {
            showToast('⭐ Nivel máximo alcanzado');
            return;
        }
        const cost = upgradeCost(level);
        if ((window.personaje.oro || 0) < cost) {
            showToast('❌ Oro insuficiente para mejorar este JUTSU');
            return;
        }
        window.personaje.oro -= cost;
        jutsuState.skillLevels[id] = level + 1;
        if (typeof window.updateBars === 'function') window.updateBars();
        if (typeof window.guardarPartida === 'function') window.guardarPartida({ silent: true });
        showToast(`⬆️ ${skill.name} subió a Nv.${jutsuState.skillLevels[id]}`);
        renderAll();
    }

    function equipSkill(id) {
        const jutsuState = getSkillState();
        if (jutsuState.slots.includes(id)) {
            showToast('⚠️ Ese JUTSU ya está equipado');
            return;
        }
        const freeIndex = jutsuState.slots.indexOf(null);
        if (freeIndex === -1) {
            showToast('⚠️ Sin slots libres. Quita una técnica primero.');
            return;
        }
        jutsuState.slots[freeIndex] = id;
        if (typeof window.guardarPartida === 'function') window.guardarPartida({ silent: true });
        showToast(`✅ ${getSkillById(id).name} equipado`);
        renderAll();
    }

    function unequipSkill(index) {
        const jutsuState = getSkillState();
        const id = jutsuState.slots[index];
        if (id === null || typeof id === 'undefined') return;
        jutsuState.slots[index] = null;
        if (typeof window.guardarPartida === 'function') window.guardarPartida({ silent: true });
        showToast(`❌ ${getSkillById(id).name} retirado`);
        renderAll();
    }

    function onSlotClick(index) {
        const id = getSkillState().slots[index];
        if (id !== null) unequipSkill(index);
    }

    function openGlossary() {
        const body = document.getElementById('jutsu-glossary-body');
        const overlay = document.getElementById('jutsu-glossary-overlay');
        if (!body || !overlay) return;
        body.innerHTML = SKILLS.map((skill) => {
            const rows = skill.levels.map((stats, index) => {
                const text = skill.statLabels.map((label, statIndex) => `${label}: ${fmtStat(skill, statIndex, stats[statIndex])}`).join(' · ');
                return `<div><strong>Nv${index + 1}:</strong> ${text}</div>`;
            }).join('');
            return `
                <div class="glossary-item">
                    <div class="glossary-name">${skill.icon} ${escapeHtml(skill.name)}</div>
                    <div class="glossary-desc">${escapeHtml(skill.desc)}</div>
                    <div class="glossary-dur">⏱ Duración: ${escapeHtml(skill.dur)}</div>
                    <div class="glossary-stats-title">Stats por nivel</div>
                    <div class="glossary-level-row">${rows}</div>
                </div>
            `;
        }).join('');
        overlay.classList.add('open');
    }

    function closeGlossary() {
        const overlay = document.getElementById('jutsu-glossary-overlay');
        if (overlay) overlay.classList.remove('open');
    }

    function normalizeCombatState() {
        if (!state.combat || typeof state.combat !== 'object') state.combat = createCombatState();
        if (!Array.isArray(state.combat.enemyDots)) state.combat.enemyDots = [];
        if (!state.combat.playerEffects) state.combat.playerEffects = createCombatState().playerEffects;
        if (!state.combat.enemyEffects) state.combat.enemyEffects = createCombatState().enemyEffects;
        return state.combat;
    }

    function beginCombat(meta) {
        const combat = createCombatState();
        combat.active = true;
        combat.source = meta && meta.source ? meta.source : 'generico';
        state.combat = combat;
        return combat;
    }

    function endCombat(options) {
        state.combat = createCombatState();
        if (!options || !options.silent) {
            const addLog = options && typeof options.addLog === 'function' ? options.addLog : null;
            if (addLog) addLog('🧹 Los efectos temporales de JUTSUS se disiparon al terminar el combate.');
        }
    }

    function applyEnemyDots(enemy, addLog) {
        const combat = normalizeCombatState();
        if (!combat.active || !enemy) return 0;
        let total = 0;
        combat.enemyDots = combat.enemyDots.filter((dot) => dot.turns > 0);
        combat.enemyDots.forEach((dot) => {
            const damage = Math.max(1, Math.floor((enemy.maxHp || enemy.hp || 1) * (dot.pct / 100)));
            enemy.hp = Math.max(0, enemy.hp - damage);
            total += damage;
            dot.turns -= 1;
            if (addLog) addLog(`${dot.icon} ${dot.name} inflige ${damage} de daño adicional.`);
        });
        combat.enemyDots = combat.enemyDots.filter((dot) => dot.turns > 0);
        return total;
    }

    function addOrRefreshDot(name, icon, pct, turns) {
        const combat = normalizeCombatState();
        const existing = combat.enemyDots.find((dot) => dot.name === name);
        if (existing) {
            existing.pct = Math.max(existing.pct, pct);
            existing.turns = Math.max(existing.turns, turns);
            return;
        }
        combat.enemyDots.push({ name, icon, pct, turns });
    }

    function consumeMp(cost) {
        if (!window.personaje) return false;
        if ((window.personaje.mp || 0) < cost) return false;
        window.personaje.mp = Math.max(0, window.personaje.mp - cost);
        if (typeof window.updateBars === 'function') window.updateBars();
        return true;
    }

    function healPlayer(percent, addLog, label) {
        if (!window.personaje) return 0;
        const heal = Math.max(1, Math.floor((window.personaje.hpMax || 1) * (percent / 100)));
        const before = window.personaje.hp;
        window.personaje.hp = Math.min(window.personaje.hpMax, window.personaje.hp + heal);
        const real = Math.max(0, window.personaje.hp - before);
        if (real > 0 && addLog) addLog(`💚 ${label} restaura ${real} HP.`);
        if (real > 0 && typeof window.updateBars === 'function') window.updateBars();
        return real;
    }

    function activateSkill(entry, enemy, addLog) {
        const combat = normalizeCombatState();
        const skill = entry.skill;
        const stats = entry.stats;
        const durationTurns = parseDurationToTurns(skill.dur);
        const result = {
            damageMultiplier: 1,
            extraFlatDamage: 0,
            ignoreDefensePct: 0,
            bonusCritPct: 0,
            guaranteedCrit: false,
            extraHitMultiplier: 0,
            executeThresholdPct: 0
        };

        switch (skill.id) {
            case 0:
                result.ignoreDefensePct = Math.max(result.ignoreDefensePct, stats[0]);
                combat.playerEffects.evadeBonusPct = Math.max(combat.playerEffects.evadeBonusPct, stats[1]);
                addOrRefreshDot('Quemadura', '🔥', stats[2], Math.max(1, durationTurns));
                if (addLog) addLog(`🔥 ${skill.name} se activa: ignora ${stats[0]}% de defensa y prepara una quemadura.`);
                break;
            case 1:
                result.bonusCritPct += stats[0];
                combat.playerEffects.reductionPct = Math.max(combat.playerEffects.reductionPct, stats[1]);
                addOrRefreshDot('Veneno', '☠️', stats[2], Math.max(1, durationTurns));
                if (addLog) addLog(`☠️ ${skill.name} se activa: +${stats[0]}% crítico y reduce ${stats[1]}% del daño recibido.`);
                break;
            case 2:
                healPlayer(stats[1], addLog, skill.name);
                addOrRefreshDot('Hemorragia', '🩸', stats[2], Math.max(1, durationTurns));
                result.damageMultiplier += stats[0] / 100;
                if (addLog) addLog(`👁️ ${skill.name} se activa: mejora la precisión ofensiva y deja hemorragia.`);
                break;
            case 3:
                combat.playerEffects.reflectPct = Math.max(combat.playerEffects.reflectPct, stats[1]);
                combat.enemyEffects.skipTurns = Math.max(combat.enemyEffects.skipTurns, Math.random() * 100 < Math.min(60, stats[2] * 10) ? 1 : 0);
                result.damageMultiplier += stats[0] / 100;
                if (addLog) addLog(`🧊 ${skill.name} se activa: roba vida y refleja ${stats[1]}% del daño.`);
                break;
            case 4:
                addOrRefreshDot('Hemorragia Sísmica', '🩸', stats[0], Math.max(1, durationTurns));
                combat.playerEffects.shield += Math.max(1, Math.floor((window.personaje?.hpMax || 1) * (stats[1] / 100)));
                combat.enemyEffects.skipTurns = Math.max(combat.enemyEffects.skipTurns, Math.random() * 100 < Math.min(65, stats[2] * 10) ? 1 : 0);
                if (addLog) addLog(`⚡ ${skill.name} se activa: crea un escudo de ${Math.floor((window.personaje?.hpMax || 1) * (stats[1] / 100))} y puede aturdir.`);
                break;
            case 5:
                result.extraHitMultiplier = Math.max(result.extraHitMultiplier, Math.max(0.35, stats[0] / 100));
                combat.playerEffects.stunResistPct = Math.max(combat.playerEffects.stunResistPct, stats[1]);
                combat.enemyEffects.slowPct = Math.max(combat.enemyEffects.slowPct, stats[2]);
                if (addLog) addLog(`🌪️ ${skill.name} se activa: añade un segundo golpe y ralentiza ${stats[2]}% al rival.`);
                break;
            case 6:
                result.damageMultiplier += stats[0] / 100;
                combat.playerEffects.immunity = Math.random() < Math.min(0.9, stats[1]);
                result.executeThresholdPct = Math.max(result.executeThresholdPct, stats[2]);
                if (addLog) addLog(`💀 ${skill.name} se activa: puede ejecutar enemigos por debajo de ${stats[2]}% de HP.`);
                break;
            case 7:
                result.ignoreDefensePct = Math.max(result.ignoreDefensePct, stats[0]);
                result.bonusCritPct += stats[1];
                result.extraFlatDamage += Math.max(1, Math.floor((enemy?.maxHp || enemy?.hp || 1) * (stats[2] / 100)));
                if (combat.playerEffects.lastTurnEvaded) result.guaranteedCrit = true;
                if (addLog) addLog(`🌟 ${skill.name} se activa: penetra ${stats[0]}% y prepara una explosión elemental.`);
                break;
            default:
                break;
        }

        return result;
    }

    function preparePlayerTurn(options) {
        const enemy = options && options.enemy ? options.enemy : null;
        const addLog = options && typeof options.addLog === 'function' ? options.addLog : null;
        const baseDamage = options && Number.isFinite(options.baseDamage) ? options.baseDamage : 0;
        const baseCritChance = options && Number.isFinite(options.baseCritChance) ? options.baseCritChance : (window.personaje?.critico || 0);
        const enemyDefense = options && Number.isFinite(options.enemyDefense) ? options.enemyDefense : (enemy?.def || enemy?.defensa || 0);
        const combat = normalizeCombatState();
        if (!combat.active) beginCombat({ source: options && options.source ? options.source : 'generico' });

        const dotDamage = applyEnemyDots(enemy, addLog);
        const response = {
            damage: baseDamage,
            critChance: baseCritChance,
            guaranteedCrit: false,
            extraHitDamage: 0,
            dotDamage
        };

        if (!window.personaje || !enemy || (enemy.hp || 0) <= 0) return response;

        getEquippedSkills().forEach((entry) => {
            const cost = entry.stats[4];
            const activationChance = entry.stats[3];
            if ((window.personaje.mp || 0) < cost) return;
            if ((Math.random() * 100) > activationChance) return;
            if (!consumeMp(cost)) return;
            if (addLog) addLog(`✨ ${entry.skill.name} se activó (${activationChance}% base) y consumió ${cost} MP.`);
            const activation = activateSkill(entry, enemy, addLog);
            const adjustedDefense = enemyDefense * (1 - (activation.ignoreDefensePct / 100));
            const defenseBonus = Math.max(0, enemyDefense - adjustedDefense);
            response.damage = Math.max(1, Math.floor((response.damage + defenseBonus + activation.extraFlatDamage) * activation.damageMultiplier));
            response.critChance += activation.bonusCritPct;
            response.guaranteedCrit = response.guaranteedCrit || activation.guaranteedCrit;
            response.executeThresholdPct = Math.max(response.executeThresholdPct || 0, activation.executeThresholdPct || 0);
            if (activation.extraHitMultiplier > 0) {
                response.extraHitDamage += Math.max(1, Math.floor(response.damage * activation.extraHitMultiplier));
            }
        });

        return response;
    }

    function beforeEnemyAttack(options) {
        const enemy = options && options.enemy ? options.enemy : null;
        const addLog = options && typeof options.addLog === 'function' ? options.addLog : null;
        const baseDamage = options && Number.isFinite(options.baseDamage) ? options.baseDamage : 0;
        const combat = normalizeCombatState();
        if (!combat.active) return { damage: baseDamage, skipped: false, reflectedDamage: 0 };

        if (combat.enemyEffects.skipTurns > 0) {
            combat.enemyEffects.skipTurns -= 1;
            if (addLog) addLog(`🥶 El enemigo perdió su turno por un JUTSU.`);
            return { damage: 0, skipped: true, reflectedDamage: 0 };
        }

        let damage = baseDamage;
        if (combat.enemyEffects.slowPct > 0) {
            damage = Math.max(1, Math.floor(damage * (1 - combat.enemyEffects.slowPct / 100)));
        }

        const evadeChance = (window.personaje?.evasion || 0) + combat.playerEffects.evadeBonusPct;
        if (Math.random() * 100 < evadeChance) {
            combat.playerEffects.lastTurnEvaded = true;
            if (addLog) addLog(`💨 Un JUTSU te permitió evadir el ataque enemigo.`);
            return { damage: 0, skipped: true, reflectedDamage: 0, evaded: true };
        }
        combat.playerEffects.lastTurnEvaded = false;

        if (combat.playerEffects.immunity) {
            combat.playerEffects.immunity = false;
            if (addLog) addLog('🛡️ Marca del Verdugo anuló por completo este golpe.');
            return { damage: 0, skipped: true, reflectedDamage: 0 };
        }

        if (combat.playerEffects.reductionPct > 0) {
            damage = Math.max(0, Math.floor(damage * (1 - combat.playerEffects.reductionPct / 100)));
        }

        if (combat.playerEffects.shield > 0) {
            const absorbed = Math.min(combat.playerEffects.shield, damage);
            combat.playerEffects.shield -= absorbed;
            damage -= absorbed;
            if (absorbed > 0 && addLog) addLog(`🛡️ Tu escudo de JUTSU absorbió ${absorbed} de daño.`);
        }

        return {
            damage: Math.max(0, damage),
            skipped: false,
            reflectedDamage: combat.playerEffects.reflectPct > 0 ? Math.max(1, Math.floor(baseDamage * (combat.playerEffects.reflectPct / 100))) : 0
        };
    }

    function afterPlayerAttack(options) {
        const enemy = options && options.enemy ? options.enemy : null;
        const addLog = options && typeof options.addLog === 'function' ? options.addLog : null;
        const damageDealt = options && Number.isFinite(options.damageDealt) ? options.damageDealt : 0;
        const response = { extraDamage: 0, executed: false };
        if (!enemy || !window.personaje) return response;

        const combat = normalizeCombatState();
        if (!combat.active) return response;

        const activeMirror = getEquippedSkills().find((entry) => entry.skill.id === 3);
        if (activeMirror && damageDealt > 0) {
            const lifesteal = Math.max(1, Math.floor(damageDealt * (activeMirror.stats[0] / 100)));
            const before = window.personaje.hp;
            window.personaje.hp = Math.min(window.personaje.hpMax, window.personaje.hp + lifesteal);
            const real = window.personaje.hp - before;
            if (real > 0 && addLog) addLog(`💧 Espejo Glacial drenó ${real} HP.`);
        }

        const finisher = options && Number.isFinite(options.executeThresholdPct) ? options.executeThresholdPct : 0;
        if (finisher > 0 && enemy.hp > 0 && enemy.maxHp > 0 && ((enemy.hp / enemy.maxHp) * 100) <= finisher) {
            enemy.hp = 0;
            response.executed = true;
            if (addLog) addLog(`☠️ Marca del Verdugo ejecutó al enemigo.`);
        }

        if (typeof window.updateBars === 'function') window.updateBars();
        return response;
    }

    function afterEnemyAttack(options) {
        const enemy = options && options.enemy ? options.enemy : null;
        const addLog = options && typeof options.addLog === 'function' ? options.addLog : null;
        const damageTaken = options && Number.isFinite(options.damageTaken) ? options.damageTaken : 0;
        const reflectedDamage = options && Number.isFinite(options.reflectedDamage) ? options.reflectedDamage : 0;
        if (!enemy) return { reflected: 0 };

        if (reflectedDamage > 0 && damageTaken > 0) {
            enemy.hp = Math.max(0, enemy.hp - reflectedDamage);
            if (addLog) addLog(`↩️ Tu JUTSU reflejó ${reflectedDamage} de daño al enemigo.`);
        }
        return { reflected: reflectedDamage };
    }

    function bindMenuButton() {
        const buttons = Array.from(document.querySelectorAll('.menu-btn'));
        const jutsuButton = buttons.find((button) => button.textContent.toUpperCase().includes('JUTSUS'));
        if (!jutsuButton || jutsuButton.dataset.jutsuBound === '1') return;
        jutsuButton.dataset.jutsuBound = '1';
        jutsuButton.addEventListener('click', togglePanel);
    }

    function init() {
        getSkillState();
        ensureContainer();
        bindMenuButton();
        renderAll();
    }

    window.toggleJutsus = togglePanel;
    window.closeJutsus = closePanel;
    window.jutsuSystem = {
        init,
        open: openPanel,
        close: closePanel,
        toggle: togglePanel,
        beginCombat,
        endCombat,
        preparePlayerTurn,
        beforeEnemyAttack,
        afterPlayerAttack,
        afterEnemyAttack,
        getEquippedSkills,
        getSkillState,
        render: renderAll
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
