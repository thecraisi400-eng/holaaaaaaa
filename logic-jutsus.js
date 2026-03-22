(function () {
    'use strict';

    const STYLE_ID = 'jutsus-system-styles';
    const CONTAINER_ID = 'jutsus-overlay-container';
    const DEFAULT_JUTSUS = {
        slots: [null, null, null],
        skillLevels: {},
        selectedId: null
    };

    const SKILLS = [
        { id: 0, name: 'Filo Ígneo', icon: '🔥', desc: 'Ignora parte de la defensa, otorga evasión temporal y añade quemadura al golpe.', dur: '1 turno', statLabels: ['⚕️Perf', '💨Evas', '🔥Comb', '📈Prob', '🔵MP'], levels: [[5.0,2.0,1.0,3,20],[6.0,2.5,1.1,5,23],[7.0,3.0,1.2,8,27],[8.0,3.5,1.3,10,30],[9.0,4.0,1.4,13,33],[10.0,4.5,1.5,15,37],[11.0,5.0,1.6,18,40],[12.0,5.5,1.7,20,43],[13.0,6.0,1.8,23,47],[15.0,8.0,2.0,25,50]] },
        { id: 1, name: 'Baluarte Tóxico', icon: '☠️', desc: 'Aumenta crítico, reduce daño recibido y aplica veneno temporal.', dur: '1 turno', statLabels: ['💥Crit','🛡️Bloq','☠️Ven','📈Prob','🔵MP'], levels: [[10,3,5,3,20],[12,4,6,5,23],[14,5,7,8,27],[16,6,8,10,30],[18,7,9,13,33],[20,8,10,15,37],[22,9,11,18,40],[24,10,12,20,43],[26,11,13,23,47],[30,15,15,25,50]] },
        { id: 2, name: 'Ojo del Segador', icon: '👁️', desc: 'Mejora la precisión ofensiva, regenera vida y castiga al rival con hemorragia.', dur: '1 turno', statLabels: ['🎯Prec','❤️Reg','🩸Hem','📈Prob','🔵MP'], levels: [[4.0,0.5,1.0,3,20],[5.0,0.6,1.2,5,23],[6.0,0.7,1.4,8,27],[7.0,0.8,1.6,10,30],[8.0,0.9,1.8,13,33],[9.0,1.0,2.0,15,37],[10.0,1.1,2.2,18,40],[11.0,1.2,2.4,20,43],[12.0,1.3,2.6,23,47],[15.0,2.0,3.5,25,50]] },
        { id: 3, name: 'Espejo Glacial', icon: '🧊', desc: 'Roba vida con el golpe, refleja daño y tiene opción de congelar al rival un turno.', dur: '1 turno', statLabels: ['💧Dren','↩️Refl','❄️Cong','📈Prob','🔵MP'], levels: [[2.0,3.0,1.0,3,20],[2.5,4.0,1.1,5,23],[3.0,5.0,1.2,8,27],[3.5,6.0,1.3,10,30],[4.0,7.0,1.4,11,33],[4.5,8.0,1.5,15,37],[5.0,9.0,1.6,18,40],[5.5,10.0,1.7,20,43],[6.0,11.0,1.8,23,47],[8.0,15.0,2.2,25,50]] },
        { id: 4, name: 'Martillo Sísmico', icon: '⚡', desc: 'Añade hemorragia, otorga escudo temporal y puede aturdir al enemigo.', dur: '1 turno', statLabels: ['🩸Hem','🛡️Esc','😵Atrd','📈Prob','🔵MP'], levels: [[3.0,10,1.5,3,20],[3.5,12,1.7,5,23],[4.0,14,1.9,8,27],[4.5,16,2.1,10,30],[5.0,18,2.3,13,33],[5.5,20,2.5,15,37],[6.0,22,2.7,18,40],[6.5,24,3.0,20,43],[7.0,26,3.2,23,47],[9.0,35,3.5,25,50]] },
        { id: 5, name: 'Viento de Inercia', icon: '🌪️', desc: 'Otorga un segundo impacto, resistencia táctica y ralentiza al rival.', dur: '1 turno', statLabels: ['✌️Multi','💪Resil','🐢Ral','📈Prob','🔵MP'], levels: [[5,6,10,3,20],[6,7.5,11,5,23],[7,9,12,8,27],[8,10.5,13,10,30],[9,12,14,13,33],[10,13.5,15,15,37],[11,15,16,18,40],[12,16.5,17,20,43],[13,18,18,23,47],[16,25,25,25,50]] },
        { id: 6, name: 'Marca del Verdugo', icon: '💀', desc: 'Ejecuta mejor enemigos debilitados y fortalece la supervivencia temporal.', dur: '1 turno', statLabels: ['⚡Acel','🛡️Inm','⛓️Cad','📈Prob','🔵MP'], levels: [[8,0.5,15,3,20],[9,0.6,18,5,23],[10,0.7,21,8,27],[11,0.8,24,10,30],[12,1.0,27,13,33],[13,1.2,30,15,37],[14,1.4,33,18,40],[15,1.6,36,20,43],[16,1.8,39,23,47],[20,2.0,50,25,50]] },
        { id: 7, name: 'Sentencia Elemental', icon: '🌟', desc: 'Penetra defensas, potencia críticos y agrega una explosión de chakra.', dur: '1 turno', statLabels: ['🔓Pen','⚡EsqC','💣Mald','📈Prob','🔵MP'], levels: [[4,3,15,3,20],[5,4,18,5,23],[6,5,21,8,27],[7,6,24,10,30],[8,7,27,13,33],[9,8,30,15,37],[10,9,33,18,40],[11,10,36,20,43],[12,11,39,23,47],[15,15,50,25,50]] }
    ];

    const state = {
        initialized: false,
        selectedId: null,
        battleCounter: 0,
        activeBattles: new Map()
    };

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
                z-index: 105;
                border-radius: 10px;
                overflow: hidden;
                background: linear-gradient(180deg, rgba(247,240,232,0.98), rgba(237,229,216,0.98));
            }
            #${CONTAINER_ID}.active { display: block; }
            .jutsu-shell {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding: 6px;
                overflow: hidden;
                box-sizing: border-box;
                color: #2a1f14;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .jutsu-card {
                background: rgba(255,255,255,0.94);
                border: 1px solid #d4c4b0;
                border-radius: 12px;
                padding: 8px;
                box-shadow: 0 2px 8px rgba(100,60,20,0.13);
            }
            .jutsu-title {
                font-size: 9px;
                letter-spacing: 2.5px;
                color: #1a6b8a;
                text-transform: uppercase;
                margin-bottom: 7px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .jutsu-title::after {
                content: '';
                flex: 1;
                height: 1px;
                background: linear-gradient(90deg, #d4c4b0, transparent);
            }
            .jutsu-topbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 6px;
            }
            .jutsu-close {
                border: 1px solid #1a6b8a;
                background: white;
                color: #1a6b8a;
                border-radius: 999px;
                font-weight: 800;
                font-size: 11px;
                padding: 4px 10px;
                cursor: pointer;
            }
            .jutsu-slots-row, .jutsu-action-row {
                display: flex;
                gap: 6px;
                align-items: center;
            }
            .jutsu-slot {
                flex: 1;
                height: 54px;
                border: 2px solid #d4c4b0;
                border-radius: 10px;
                background: #ede5d8;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                transition: all 0.2s;
            }
            .jutsu-slot:hover { border-color: #1a6b8a; background: #e8f4f8; }
            .jutsu-slot.occupied { border-color: #5a9e1a; background: #f0f8e8; }
            .jutsu-slot::before, .jutsu-slot::after {
                content: '';
                position: absolute;
                width: 9px;
                height: 9px;
                border-style: solid;
                border-color: #c0550a;
                opacity: 0.5;
            }
            .jutsu-slot::before { top: 3px; left: 3px; border-width: 2px 0 0 2px; }
            .jutsu-slot::after { bottom: 3px; right: 3px; border-width: 0 2px 2px 0; }
            .jutsu-slot-empty { font-size: 20px; color: #d4c4b0; font-weight: 300; }
            .jutsu-slot-icon { font-size: 18px; line-height: 1; }
            .jutsu-slot-name { font-size: 7px; color: #7a6a58; margin-top: 2px; text-align: center; max-width: 90%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .jutsu-list {
                flex: 1;
                min-height: 0;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 5px;
                padding-right: 3px;
            }
            .jutsu-item {
                background: #fdf8f3;
                border: 1px solid #d4c4b0;
                border-radius: 9px;
                padding: 7px 9px;
                cursor: pointer;
                transition: all 0.18s;
            }
            .jutsu-item:hover { border-color: #1a6b8a; background: #edf6fa; transform: translateX(2px); }
            .jutsu-item.selected { border-color: #c0550a; background: #fdf3ec; box-shadow: 0 0 0 2px rgba(192,85,10,0.12); }
            .jutsu-item.equipped { border-left: 3px solid #5a9e1a; }
            .jutsu-item-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px; }
            .jutsu-item-name { font-size: 12px; font-weight: 700; }
            .jutsu-badge {
                font-size: 9px;
                padding: 1px 6px;
                border-radius: 10px;
                background: #ede5d8;
                color: #1a6b8a;
                font-weight: 700;
                border: 1px solid #d4c4b0;
                white-space: nowrap;
            }
            .jutsu-stats-row, .jutsu-mini-grid { display: flex; flex-wrap: wrap; gap: 8px; }
            .jutsu-chip { font-size: 9px; color: #7a6a58; display: flex; align-items: center; gap: 2px; white-space: nowrap; }
            .jutsu-chip span { color: #c0550a; font-weight: 700; }
            .jutsu-compare-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5px;
                margin-bottom: 7px;
            }
            .jutsu-compare-box {
                background: #ede5d8;
                border-radius: 8px;
                padding: 6px 8px;
                border: 1px solid #d4c4b0;
            }
            .jutsu-compare-box.next { border-color: rgba(90,158,26,0.5); background: #f2fae8; }
            .jutsu-compare-label {
                font-size: 8px;
                color: #7a6a58;
                letter-spacing: 1px;
                margin-bottom: 3px;
                font-weight: 800;
                text-transform: uppercase;
            }
            .jutsu-compare-stat { font-size: 9px; line-height: 1.55; }
            .jutsu-up { color: #5a9e1a; font-weight: 700; }
            .jutsu-btn {
                flex: 1;
                padding: 7px 4px;
                border-radius: 8px;
                border: none;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 1px;
                cursor: pointer;
                text-transform: uppercase;
            }
            .jutsu-btn-upgrade { background: linear-gradient(135deg, #c0550a, #a03d00); color: white; }
            .jutsu-btn-upgrade:disabled { background: #d9d0c7; color: #a89880; cursor: not-allowed; }
            .jutsu-btn-equip { background: linear-gradient(135deg, #5a9e1a, #3d7a10); color: white; }
            .jutsu-btn-equip.unequip { background: linear-gradient(135deg, #c0550a, #8a1a00); }
            .jutsu-hint { font-size: 9px; color: #7a6a58; text-align: center; padding: 10px; }
            .jutsu-gold { font-size: 10px; color: #b87800; font-weight: 700; background: #fff8e8; border: 1px solid #e8d090; border-radius: 10px; padding: 2px 8px; }
            .jutsu-footer-note {
                margin-top: 6px;
                font-size: 9px;
                line-height: 1.5;
                color: #5d4d3c;
                background: rgba(26,107,138,0.08);
                border: 1px solid rgba(26,107,138,0.16);
                border-radius: 8px;
                padding: 6px 8px;
            }
            .jutsu-glossary {
                display: grid;
                grid-template-columns: 1fr;
                gap: 6px;
                max-height: 108px;
                overflow-y: auto;
                margin-top: 8px;
            }
            .jutsu-glossary-item {
                background: white;
                border: 1px solid #d4c4b0;
                border-left: 3px solid #c0550a;
                border-radius: 8px;
                padding: 8px 10px;
            }
            .jutsu-glossary-item strong { color: #c0550a; }
            .jutsu-glossary-item p { font-size: 9px; color: #7a6a58; margin-top: 3px; line-height: 1.45; }
        `;
        document.head.appendChild(style);
    }

    function getContainer() {
        return document.getElementById(CONTAINER_ID);
    }

    function getSkillById(id) {
        return SKILLS.find((skill) => skill.id === id) || null;
    }

    function getLevel(skillId) {
        const data = ensureCharacterData();
        return Math.max(1, Number(data.skillLevels[skillId] || 1));
    }

    function getSkillStats(skillId, levelOverride) {
        const skill = getSkillById(skillId);
        if (!skill) return null;
        const level = Math.max(1, Math.min(skill.levels.length, levelOverride || getLevel(skillId)));
        return skill.levels[level - 1];
    }

    function upgradeCost(level) {
        return level * 120 + 80;
    }

    function formatStat(skill, index, value) {
        return (skill.id === 3 && index === 2) || (skill.id === 4 && index === 2) ? `${value}s` : `${value}%`;
    }

    function syncCharacterReference() {
        if (!window.personaje) return null;
        if (!window.personaje.jutsus || typeof window.personaje.jutsus !== 'object') {
            window.personaje.jutsus = JSON.parse(JSON.stringify(DEFAULT_JUTSUS));
        }
        if (!Array.isArray(window.personaje.jutsus.slots)) {
            window.personaje.jutsus.slots = [null, null, null];
        }
        if (!window.personaje.jutsus.skillLevels || typeof window.personaje.jutsus.skillLevels !== 'object') {
            window.personaje.jutsus.skillLevels = {};
        }
        SKILLS.forEach((skill) => {
            if (!window.personaje.jutsus.skillLevels[skill.id]) {
                window.personaje.jutsus.skillLevels[skill.id] = 1;
            }
        });
        if (typeof window.personaje.jutsus.selectedId === 'undefined') {
            window.personaje.jutsus.selectedId = null;
        }
        state.selectedId = window.personaje.jutsus.selectedId;
        return window.personaje.jutsus;
    }

    function ensureCharacterData() {
        return syncCharacterReference() || { ...DEFAULT_JUTSUS, skillLevels: Object.fromEntries(SKILLS.map((skill) => [skill.id, 1])) };
    }

    function saveSelection(selectedId) {
        const data = ensureCharacterData();
        data.selectedId = selectedId;
        state.selectedId = selectedId;
    }

    function getGold() {
        return Math.max(0, Number(window.personaje?.oro || 0));
    }

    function showToast(message) {
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion(message, 'sistema');
            return;
        }
        window.alert(message);
    }

    function renderSlots() {
        const data = ensureCharacterData();
        data.slots.forEach((skillId, index) => {
            const slot = document.getElementById(`jutsu-slot-${index}`);
            if (!slot) return;
            if (skillId === null || typeof skillId === 'undefined') {
                slot.classList.remove('occupied');
                slot.innerHTML = '<span class="jutsu-slot-empty">+</span>';
                return;
            }
            const skill = getSkillById(skillId);
            if (!skill) return;
            slot.classList.add('occupied');
            slot.innerHTML = `<span class="jutsu-slot-icon">${skill.icon}</span><span class="jutsu-slot-name">${skill.name}</span>`;
        });
    }

    function renderSkillList() {
        const list = document.getElementById('jutsu-skills-list');
        if (!list) return;
        const data = ensureCharacterData();
        list.innerHTML = '';
        SKILLS.forEach((skill) => {
            const level = getLevel(skill.id);
            const stats = skill.levels[level - 1];
            const equipped = data.slots.includes(skill.id);
            const selected = state.selectedId === skill.id;
            const item = document.createElement('div');
            item.className = `jutsu-item${selected ? ' selected' : ''}${equipped ? ' equipped' : ''}`;
            item.innerHTML = `
                <div class="jutsu-item-head">
                    <span class="jutsu-item-name">${skill.icon} ${skill.name}</span>
                    <span class="jutsu-badge">Nv.${level}${equipped ? ' ✓' : ''}</span>
                </div>
                <div class="jutsu-stats-row">
                    <div class="jutsu-chip">${skill.statLabels[0]} <span>${formatStat(skill, 0, stats[0])}</span></div>
                    <div class="jutsu-chip">${skill.statLabels[1]} <span>${formatStat(skill, 1, stats[1])}</span></div>
                    <div class="jutsu-chip">${skill.statLabels[2]} <span>${formatStat(skill, 2, stats[2])}</span></div>
                </div>
            `;
            item.addEventListener('click', () => selectSkill(skill.id));
            list.appendChild(item);
        });
    }

    function renderUpgradePanel() {
        const panel = document.getElementById('jutsu-upgrade-panel');
        if (!panel) return;
        if (state.selectedId === null || !getSkillById(state.selectedId)) {
            panel.innerHTML = '<p class="jutsu-hint">Selecciona una habilidad para ver detalles, mejorarla y equiparla.</p>';
            return;
        }

        const data = ensureCharacterData();
        const skill = getSkillById(state.selectedId);
        const level = getLevel(skill.id);
        const current = skill.levels[level - 1];
        const isMax = level >= skill.levels.length;
        const next = isMax ? null : skill.levels[level];
        const cost = isMax ? 0 : upgradeCost(level);
        const equipped = data.slots.includes(skill.id);
        const slotIndex = data.slots.indexOf(skill.id);
        const canAfford = getGold() >= cost && !isMax;

        const currentHtml = skill.statLabels.map((label, index) => `<div>${label}: ${formatStat(skill, index, current[index])}</div>`).join('');
        const nextHtml = isMax ? '<em style="color:#b87800">¡Nivel Máximo!</em>' : skill.statLabels.map((label, index) => {
            const increased = next[index] > current[index];
            return `<div>${label}: <span class="${increased ? 'jutsu-up' : ''}">${formatStat(skill, index, next[index])}${increased ? ' ▲' : ''}</span></div>`;
        }).join('');

        panel.innerHTML = `
            <div class="jutsu-topbar" style="margin-bottom:6px;">
                <span style="font-size:11px;font-weight:800;color:#c0550a;">${skill.icon} ${skill.name} — Nv.${level}</span>
                <span class="jutsu-gold">🪙 ${getGold()}</span>
            </div>
            <div class="jutsu-compare-grid">
                <div class="jutsu-compare-box">
                    <div class="jutsu-compare-label">⬛ Ahora</div>
                    <div class="jutsu-compare-stat">${currentHtml}</div>
                </div>
                <div class="jutsu-compare-box next">
                    <div class="jutsu-compare-label">🟩 Siguiente</div>
                    <div class="jutsu-compare-stat">${nextHtml}</div>
                </div>
            </div>
            <div class="jutsu-action-row">
                <button class="jutsu-btn jutsu-btn-upgrade" id="jutsu-upgrade-btn" ${canAfford ? '' : 'disabled'}>${isMax ? '⭐ MAX' : `⬆ Mejorar 🪙${cost}`}</button>
                <button class="jutsu-btn jutsu-btn-equip ${equipped ? 'unequip' : ''}" id="jutsu-equip-btn">${equipped ? '❌ Quitar' : '✅ Equipar'}</button>
            </div>
            <div class="jutsu-footer-note">
                Las estadísticas de Jutsus <strong>no se aplican al equiparlas</strong>. Solo se activan durante combate, cada turno vuelve a revisar su probabilidad, consumen MP al activarse y sus efectos se limpian al terminar la pelea.
            </div>
        `;

        const upgradeBtn = document.getElementById('jutsu-upgrade-btn');
        const equipBtn = document.getElementById('jutsu-equip-btn');
        if (upgradeBtn) upgradeBtn.addEventListener('click', () => upgradeSkill(skill.id));
        if (equipBtn) equipBtn.addEventListener('click', () => {
            if (equipped) {
                unequipSkill(slotIndex);
            } else {
                equipSkill(skill.id);
            }
        });
    }

    function renderGlossary() {
        const glossary = document.getElementById('jutsu-glossary');
        if (!glossary) return;
        glossary.innerHTML = SKILLS.map((skill) => `
            <div class="jutsu-glossary-item">
                <strong>${skill.icon} ${skill.name}</strong>
                <p>${skill.desc}</p>
                <p>⏱ Duración funcional: ${skill.dur}. Probabilidad y MP suben por nivel; el juego lanza la tirada en cada turno.</p>
            </div>
        `).join('');
    }

    function renderAll() {
        renderSlots();
        renderSkillList();
        renderUpgradePanel();
        renderGlossary();
    }

    function selectSkill(id) {
        saveSelection(id);
        renderSkillList();
        renderUpgradePanel();
    }

    function upgradeSkill(id) {
        const data = ensureCharacterData();
        const level = getLevel(id);
        const skill = getSkillById(id);
        if (!skill) return;
        if (level >= skill.levels.length) {
            showToast('⭐ Esta técnica ya está al máximo.');
            return;
        }
        const cost = upgradeCost(level);
        if (getGold() < cost) {
            showToast('❌ No tienes suficiente oro para mejorar este Jutsu.');
            return;
        }
        if (window.personaje) {
            window.personaje.oro = Math.max(0, getGold() - cost);
        }
        data.skillLevels[id] = level + 1;
        renderAll();
        if (typeof window.actualizarPanelVisible === 'function') window.actualizarPanelVisible();
        if (typeof window.guardarPartida === 'function') window.guardarPartida({ silent: true });
        showToast(`⬆️ ${skill.name} subió a nivel ${data.skillLevels[id]}.`);
    }

    function equipSkill(id) {
        const data = ensureCharacterData();
        if (data.slots.includes(id)) {
            showToast('⚠️ Ese Jutsu ya está equipado.');
            return;
        }
        const freeIndex = data.slots.indexOf(null);
        if (freeIndex === -1) {
            showToast('⚠️ No hay slots libres. Quita un Jutsu primero.');
            return;
        }
        data.slots[freeIndex] = id;
        renderAll();
        if (typeof window.guardarPartida === 'function') window.guardarPartida({ silent: true });
        showToast(`✅ ${getSkillById(id)?.name || 'Jutsu'} equipado.`);
    }

    function unequipSkill(index) {
        const data = ensureCharacterData();
        const skillId = data.slots[index];
        if (skillId === null || typeof skillId === 'undefined') return;
        data.slots[index] = null;
        renderAll();
        if (typeof window.guardarPartida === 'function') window.guardarPartida({ silent: true });
        showToast(`❌ ${getSkillById(skillId)?.name || 'Jutsu'} retirado.`);
    }

    function onSlotClick(index) {
        const data = ensureCharacterData();
        if (data.slots[index] !== null) {
            unequipSkill(index);
        }
    }

    function buildShell() {
        return `
            <div class="jutsu-shell">
                <div class="jutsu-card">
                    <div class="jutsu-topbar">
                        <div class="jutsu-title">🔥 Sistema de Jutsus</div>
                        <button class="jutsu-close" id="jutsu-close-btn">✖ Cerrar</button>
                    </div>
                    <div class="jutsu-slots-row">
                        <div class="jutsu-slot" id="jutsu-slot-0"></div>
                        <div class="jutsu-slot" id="jutsu-slot-1"></div>
                        <div class="jutsu-slot" id="jutsu-slot-2"></div>
                    </div>
                </div>
                <div class="jutsu-card" style="flex:1;display:flex;flex-direction:column;min-height:0;">
                    <div class="jutsu-title">📜 Biblioteca de Técnicas</div>
                    <div id="jutsu-skills-list" class="jutsu-list"></div>
                </div>
                <div class="jutsu-card">
                    <div class="jutsu-title">⚙ Preparación Shinobi</div>
                    <div id="jutsu-upgrade-panel"></div>
                    <div id="jutsu-glossary" class="jutsu-glossary"></div>
                </div>
            </div>
        `;
    }

    function bindUI() {
        const closeBtn = document.getElementById('jutsu-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeJutsus);
        [0, 1, 2].forEach((index) => {
            const slot = document.getElementById(`jutsu-slot-${index}`);
            if (slot) slot.addEventListener('click', () => onSlotClick(index));
        });
    }

    function ensureContainer() {
        injectStyles();
        let container = getContainer();
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

    function init() {
        const container = ensureContainer();
        if (!container) return false;
        syncCharacterReference();
        container.innerHTML = buildShell();
        bindUI();
        renderAll();
        state.initialized = true;
        return true;
    }

    function hideBaseContent() {
        if (typeof window.hideMissionContent === 'function') {
            window.hideMissionContent();
            return;
        }
        const content = document.querySelector('.mission-content');
        if (content) content.style.display = 'none';
    }

    function showBaseContent() {
        if (typeof window.showMissionContent === 'function') {
            window.showMissionContent();
            return;
        }
        const content = document.querySelector('.mission-content');
        if (content) content.style.display = 'flex';
    }

    function hideOtherPanels() {
        if (typeof window.closeHeroEquipment === 'function') window.closeHeroEquipment();
        if (typeof window.closeMisiones === 'function') window.closeMisiones();
        if (typeof window.closeArbol === 'function') window.closeArbol();
        if (typeof window.cerrarAjustes === 'function') window.cerrarAjustes();
        if (typeof window.closeBatallaNinja === 'function') window.closeBatallaNinja();

        ['hero-equipment-container', 'missions-overlay-container', 'arbol-overlay-container', 'ajustes-overlay-container', 'batalla-ninja-container'].forEach((id) => {
            const panel = document.getElementById(id);
            if (!panel) return;
            panel.style.display = id === 'ajustes-overlay-container' ? 'none' : 'none';
            panel.classList.remove('active');
        });
    }

    function toggleJutsus(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (!state.initialized) init();
        const container = getContainer();
        if (!container) return;
        const isVisible = container.classList.contains('active');
        if (typeof window.closeAllPanels === 'function') {
            window.closeAllPanels();
        }
        if (isVisible) {
            closeJutsus();
            return;
        }
        hideOtherPanels();
        syncCharacterReference();
        renderAll();
        hideBaseContent();
        container.classList.add('active');
        container.style.display = 'block';
    }

    function closeJutsus() {
        const container = getContainer();
        if (!container) return;
        container.classList.remove('active');
        container.style.display = 'none';
        showBaseContent();
    }

    function getEquippedSkills() {
        const data = ensureCharacterData();
        return data.slots.map((id) => getSkillById(id)).filter(Boolean);
    }

    function consumeMp(amount) {
        if (!window.personaje) return false;
        const cost = Math.max(0, Math.round(amount));
        if ((window.personaje.mp || 0) < cost) return false;
        window.personaje.mp -= cost;
        if (typeof window.updateBars === 'function') window.updateBars();
        return true;
    }

    function healPlayer(amount) {
        if (!window.personaje || amount <= 0) return 0;
        const before = window.personaje.hp || 0;
        window.personaje.hp = Math.min(window.personaje.hpMax || before, before + amount);
        if (typeof window.updateBars === 'function') window.updateBars();
        return Math.max(0, (window.personaje.hp || 0) - before);
    }

    function getEnemyRatios(enemy) {
        const hp = Math.max(1, Number(enemy?.hp || enemy?.currentHp || 1));
        const maxHp = Math.max(hp, Number(enemy?.maxHp || enemy?.stats?.hp || hp));
        return { hp, maxHp };
    }

    function createBattleState(source) {
        const id = `${source || 'battle'}-${Date.now()}-${++state.battleCounter}`;
        const battleState = {
            id,
            source: source || 'general',
            turn: 0,
            playerTurnEffects: null,
            enemyTurnEffects: null
        };
        state.activeBattles.set(id, battleState);
        return battleState;
    }

    function resolveEffects(skill, stats, phase, enemy) {
        const [primary, secondary, tertiary] = stats;
        const enemyRatios = getEnemyRatios(enemy);
        const effects = {
            player: {
                attackBonus: 0,
                damageMultiplier: 1,
                extraHitPercent: 0,
                critChanceBonus: 0,
                defenseIgnorePercent: 0,
                directDamage: 0,
                lifestealPercent: 0,
                executeThreshold: 0,
                guaranteedCrit: false,
                logs: []
            },
            enemy: {
                skipChance: 0,
                damageReductionPercent: 0,
                reflectPercent: 0,
                healFlat: 0,
                shield: 0,
                evadeBonus: 0,
                enemyAttackReductionPercent: 0,
                logs: []
            }
        };

        switch (skill.id) {
            case 0:
                if (phase === 'player') {
                    effects.player.defenseIgnorePercent += primary;
                    effects.player.directDamage += Math.ceil(enemyRatios.maxHp * (tertiary / 100));
                    effects.player.logs.push(`${skill.icon} ${skill.name} reduce la defensa rival y añade quemadura.`);
                } else {
                    effects.enemy.evadeBonus += secondary;
                    effects.enemy.logs.push(`${skill.icon} ${skill.name} mejora tu evasión este turno.`);
                }
                break;
            case 1:
                if (phase === 'player') {
                    effects.player.critChanceBonus += primary;
                    effects.player.directDamage += Math.ceil(enemyRatios.maxHp * (tertiary / 100));
                    effects.player.logs.push(`${skill.icon} ${skill.name} potencia tu crítico y deja veneno.`);
                } else {
                    effects.enemy.damageReductionPercent += secondary;
                    effects.enemy.logs.push(`${skill.icon} ${skill.name} reduce el daño recibido este turno.`);
                }
                break;
            case 2:
                if (phase === 'player') {
                    effects.player.attackBonus += Math.ceil(primary);
                    effects.player.directDamage += Math.ceil(enemyRatios.maxHp * (tertiary / 100));
                    effects.player.logs.push(`${skill.icon} ${skill.name} mejora el golpe y causa hemorragia.`);
                } else {
                    effects.enemy.healFlat += Math.max(1, Math.ceil((window.personaje?.hpMax || 100) * (secondary / 100)));
                    effects.enemy.logs.push(`${skill.icon} ${skill.name} regenera vida para este intercambio.`);
                }
                break;
            case 3:
                if (phase === 'player') {
                    effects.player.lifestealPercent += primary;
                    effects.player.logs.push(`${skill.icon} ${skill.name} activó drenaje de vida.`);
                } else {
                    effects.enemy.reflectPercent += secondary;
                    effects.enemy.skipChance += tertiary;
                    effects.enemy.logs.push(`${skill.icon} ${skill.name} puede congelar o reflejar daño.`);
                }
                break;
            case 4:
                if (phase === 'player') {
                    effects.player.directDamage += Math.ceil(enemyRatios.maxHp * (primary / 100));
                    effects.player.logs.push(`${skill.icon} ${skill.name} agrega hemorragia sísmica.`);
                } else {
                    effects.enemy.shield += Math.ceil((window.personaje?.hpMax || 100) * (secondary / 100));
                    effects.enemy.skipChance += tertiary;
                    effects.enemy.logs.push(`${skill.icon} ${skill.name} genera escudo y puede aturdir.`);
                }
                break;
            case 5:
                if (phase === 'player') {
                    effects.player.extraHitPercent += primary;
                    effects.player.logs.push(`${skill.icon} ${skill.name} prepara un segundo impacto.`);
                } else {
                    effects.enemy.damageReductionPercent += secondary;
                    effects.enemy.enemyAttackReductionPercent += tertiary;
                    effects.enemy.logs.push(`${skill.icon} ${skill.name} ralentiza al enemigo y mejora tu resistencia.`);
                }
                break;
            case 6:
                if (phase === 'player') {
                    effects.player.attackBonus += Math.ceil(primary);
                    effects.player.executeThreshold += tertiary;
                    effects.player.logs.push(`${skill.icon} ${skill.name} busca ejecutar al enemigo debilitado.`);
                } else {
                    effects.enemy.damageReductionPercent += Math.min(secondary * 10, 40);
                    effects.enemy.logs.push(`${skill.icon} ${skill.name} fortalece tu supervivencia momentánea.`);
                }
                break;
            case 7:
                if (phase === 'player') {
                    effects.player.defenseIgnorePercent += primary;
                    effects.player.critChanceBonus += secondary;
                    effects.player.directDamage += Math.ceil(enemyRatios.maxHp * (tertiary / 100));
                    effects.player.logs.push(`${skill.icon} ${skill.name} desata una explosión elemental.`);
                } else {
                    effects.enemy.evadeBonus += secondary;
                    effects.enemy.enemyAttackReductionPercent += Math.ceil(primary / 2);
                    effects.enemy.logs.push(`${skill.icon} ${skill.name} distorsiona el turno enemigo.`);
                }
                break;
            default:
                break;
        }

        return effects[phase];
    }

    function getEmptyPhaseEffects(phase) {
        return phase === 'player'
            ? { attackBonus: 0, damageMultiplier: 1, extraHitPercent: 0, critChanceBonus: 0, defenseIgnorePercent: 0, directDamage: 0, lifestealPercent: 0, executeThreshold: 0, guaranteedCrit: false, logs: [] }
            : { skipChance: 0, damageReductionPercent: 0, reflectPercent: 0, healFlat: 0, shield: 0, evadeBonus: 0, enemyAttackReductionPercent: 0, logs: [] };
    }

    function prepareTurn(battleState, phase, enemy, logFn) {
        const targetBattle = battleState || createBattleState('general');
        targetBattle.turn += 1;
        const effects = getEmptyPhaseEffects(phase);
        getEquippedSkills().forEach((skill) => {
            const stats = getSkillStats(skill.id);
            if (!stats) return;
            const procChance = stats[3];
            const mpCost = stats[4];
            if (Math.random() * 100 > procChance) return;
            if (!consumeMp(mpCost)) {
                if (typeof logFn === 'function') logFn(`🔵 MP insuficiente para activar ${skill.name}.`);
                return;
            }
            const resolved = resolveEffects(skill, stats, phase, enemy);
            Object.keys(resolved).forEach((key) => {
                if (key === 'logs') return;
                if (typeof effects[key] === 'number') {
                    effects[key] += resolved[key];
                } else if (typeof effects[key] === 'boolean') {
                    effects[key] = effects[key] || resolved[key];
                }
            });
            if (Array.isArray(resolved.logs)) {
                resolved.logs.forEach((line) => {
                    if (typeof logFn === 'function') logFn(line);
                    effects.logs.push(line);
                });
            }
        });

        if (phase === 'player') {
            targetBattle.playerTurnEffects = effects;
        } else {
            targetBattle.enemyTurnEffects = effects;
            if (effects.healFlat > 0) {
                const healed = healPlayer(effects.healFlat);
                if (healed > 0 && typeof logFn === 'function') {
                    logFn(`💚 Recuperas ${healed} HP por efecto de Jutsu.`);
                }
            }
        }
        return effects;
    }

    function applyPlayerDamage(baseDamage, enemy, battleState, logFn) {
        const effects = battleState?.playerTurnEffects || getEmptyPhaseEffects('player');
        const enemyDefense = Math.max(0, Number(enemy?.def || enemy?.stats?.def || 0));
        const defenseReduction = enemyDefense * (effects.defenseIgnorePercent / 100);
        const extraHit = Math.floor(baseDamage * (effects.extraHitPercent / 100));
        let finalDamage = Math.max(1, Math.floor(baseDamage + effects.attackBonus + extraHit + effects.directDamage + defenseReduction));

        const ratios = getEnemyRatios(enemy);
        if (effects.executeThreshold > 0 && (ratios.hp / ratios.maxHp) * 100 <= effects.executeThreshold) {
            finalDamage = Math.max(finalDamage, ratios.hp);
            if (typeof logFn === 'function') logFn('💀 Marca del Verdugo ejecuta al objetivo debilitado.');
        }

        if (effects.lifestealPercent > 0) {
            const healAmount = Math.max(1, Math.floor(finalDamage * (effects.lifestealPercent / 100)));
            const healed = healPlayer(healAmount);
            if (healed > 0 && typeof logFn === 'function') logFn(`💧 Robas ${healed} HP con tu Jutsu.`);
        }

        return finalDamage;
    }

    function modifyPlayerCritChance(baseCritChance, battleState) {
        const effects = battleState?.playerTurnEffects || getEmptyPhaseEffects('player');
        return baseCritChance + effects.critChanceBonus;
    }

    function beforeEnemyAttack(battleState, enemy, logFn) {
        const effects = battleState?.enemyTurnEffects || getEmptyPhaseEffects('enemy');
        const finalSkipChance = Math.max(0, effects.skipChance);
        if (finalSkipChance > 0 && Math.random() * 100 <= finalSkipChance) {
            if (typeof logFn === 'function') logFn(`❄️ ${enemy?.name || enemy?.nombre || 'El enemigo'} quedó afectado por un Jutsu y perdió el turno.`);
            return { skip: true, damageReductionPercent: effects.damageReductionPercent, enemyAttackReductionPercent: effects.enemyAttackReductionPercent };
        }
        return { skip: false, damageReductionPercent: effects.damageReductionPercent, enemyAttackReductionPercent: effects.enemyAttackReductionPercent };
    }

    function applyIncomingDamage(baseDamage, battleState, enemy, logFn) {
        const effects = battleState?.enemyTurnEffects || getEmptyPhaseEffects('enemy');
        let finalDamage = Math.max(1, Math.floor(baseDamage * (1 - (effects.damageReductionPercent / 100))));

        if (effects.shield > 0) {
            const absorbed = Math.min(effects.shield, finalDamage);
            finalDamage -= absorbed;
            if (typeof logFn === 'function' && absorbed > 0) logFn(`🛡️ Un escudo de Jutsu absorbió ${absorbed} daño.`);
        }

        if (effects.reflectPercent > 0 && enemy) {
            const reflected = Math.max(1, Math.floor(finalDamage * (effects.reflectPercent / 100)));
            if (typeof enemy.currentHp === 'number') enemy.currentHp = Math.max(0, enemy.currentHp - reflected);
            else if (typeof enemy.hp === 'number') enemy.hp = Math.max(0, enemy.hp - reflected);
            if (typeof logFn === 'function') logFn(`↩️ Reflejas ${reflected} daño al enemigo.`);
        }

        return Math.max(0, finalDamage);
    }

    function modifyEvasion(baseEvasion, battleState) {
        const effects = battleState?.enemyTurnEffects || getEmptyPhaseEffects('enemy');
        return baseEvasion + effects.evadeBonus;
    }

    function modifyEnemyDamage(baseDamage, battleState) {
        const effects = battleState?.enemyTurnEffects || getEmptyPhaseEffects('enemy');
        return Math.max(1, Math.floor(baseDamage * (1 - (effects.enemyAttackReductionPercent / 100))));
    }

    function endBattle(battleState) {
        if (!battleState) return;
        battleState.playerTurnEffects = null;
        battleState.enemyTurnEffects = null;
        state.activeBattles.delete(battleState.id);
        if (typeof window.updateBars === 'function') window.updateBars();
    }

    function restoreFromSave(data) {
        syncCharacterReference();
        if (!data || typeof data !== 'object') return;
        window.personaje.jutsus = {
            slots: Array.isArray(data.slots) ? data.slots.slice(0, 3).concat([null, null, null]).slice(0, 3) : [null, null, null],
            skillLevels: {},
            selectedId: typeof data.selectedId === 'number' ? data.selectedId : null
        };
        SKILLS.forEach((skill) => {
            const savedLevel = Number(data.skillLevels?.[skill.id] || 1);
            window.personaje.jutsus.skillLevels[skill.id] = Math.min(Math.max(1, savedLevel), skill.levels.length);
        });
        state.selectedId = window.personaje.jutsus.selectedId;
        if (state.initialized) renderAll();
    }

    window.jutsusSystem = {
        init,
        toggle: toggleJutsus,
        close: closeJutsus,
        render: renderAll,
        createBattleState,
        prepareTurn,
        applyPlayerDamage,
        modifyPlayerCritChance,
        beforeEnemyAttack,
        applyIncomingDamage,
        modifyEvasion,
        modifyEnemyDamage,
        endBattle,
        restoreFromSave,
        syncCharacterReference,
        getPersistentData: () => JSON.parse(JSON.stringify(ensureCharacterData()))
    };

    window.toggleJutsus = toggleJutsus;
    window.closeJutsus = closeJutsus;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
