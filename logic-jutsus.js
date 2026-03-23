(function () {
    'use strict';

    const STYLE_ID = 'naruto-jutsus-v2-styles';
    const CONTAINER_ID = 'jutsus-overlay-container';
    const DEFAULT_DATA = {
        slots: [null, null, null],
        skillLevels: {},
        selectedId: null
    };

    const SKILLS = [
        { id:0, name:'Filo Ígneo', icon:'🔥', desc:'Ignora defensa física, otorga evasión y quema al enemigo.', dur:'3.0s', labels:['Perf','Evas','Comb','Prob','MP'], icons:['⚕️','💨','🔥','📈','🔵'], levels:[[5,2,1,3,20],[6,2.5,1.1,5,23],[7,3,1.2,8,27],[8,3.5,1.3,10,30],[9,4,1.4,13,33],[10,4.5,1.5,15,37],[11,5,1.6,18,40],[12,5.5,1.7,20,43],[13,6,1.8,23,47],[15,8,2,25,50]] },
        { id:1, name:'Baluarte Tóxico', icon:'☠️', desc:'Potencia críticos, bloquea daño a la mitad y envenena.', dur:'3 turnos', labels:['Crit','Bloq','Veneno','Prob','MP'], icons:['⚔️','🛡️','☠️','📈','🔵'], levels:[[10,3,5,3,20],[12,4,6,5,23],[14,5,7,8,27],[16,6,8,10,30],[18,7,9,13,33],[20,8,10,15,37],[22,9,11,18,40],[24,10,12,20,43],[26,11,13,23,47],[30,15,15,25,50]] },
        { id:2, name:'Ojo del Segador', icon:'👁️', desc:'Asegura precisión, regenera vida y desangra al recibir daño.', dur:'4.0s', labels:['Prec','Reg','Hemorr','Prob','MP'], icons:['🎯','💚','🩸','📈','🔵'], levels:[[4,0.5,1,3,20],[5,0.6,1.2,5,23],[6,0.7,1.4,8,27],[7,0.8,1.6,10,30],[8,0.9,1.8,13,33],[9,1,2,15,37],[10,1.1,2.2,18,40],[11,1.2,2.4,20,43],[12,1.3,2.6,23,47],[15,2,3.5,25,50]] },
        { id:3, name:'Espejo Glacial', icon:'🧊', desc:'Roba vida al dañar, devuelve daño y congela al rival.', dur:'2.2s', labels:['Dren','Refl','Congel','Prob','MP'], icons:['🩸','🔄','🧊','📈','🔵'], levels:[[2,3,'1.0s',3,20],[2.5,4,'1.1s',5,23],[3,5,'1.2s',8,27],[3.5,6,'1.3s',10,30],[4,7,'1.4s',11,33],[4.5,8,'1.5s',15,37],[5,9,'1.6s',18,40],[5.5,10,'1.7s',20,43],[6,11,'1.8s',23,47],[8,15,'2.2s',25,50]] },
        { id:4, name:'Martillo Sísmico', icon:'🔨', desc:'Causa hemorragia crítica, crea escudos y aturde.', dur:'3.5s', labels:['Hemorr','Escudo','Aturd','Prob','MP'], icons:['🩸','🛡️','💫','📈','🔵'], levels:[[3,10,'1.5s',3,20],[3.5,12,'1.7s',5,23],[4,14,'1.9s',8,27],[4.5,16,'2.1s',10,30],[5,18,'2.3s',13,33],[5.5,20,'2.5s',15,37],[6,22,'2.7s',18,40],[6.5,24,'3.0s',20,43],[7,26,'3.2s',23,47],[9,35,'3.5s',25,50]] },
        { id:5, name:'Viento de Inercia', icon:'💨', desc:'Ataca dos veces, resiste aturdimientos y ralentiza.', dur:'4 turnos', labels:['Multi','Resil','Ralent','Prob','MP'], icons:['⚡','💪','⏱️','📈','🔵'], levels:[[5,6,-10,3,20],[6,7.5,-11,5,23],[7,9,-12,8,27],[8,10.5,-13,10,30],[9,12,-14,13,33],[10,13.5,-15,15,37],[11,15,-16,18,40],[12,16.5,-17,20,43],[13,18,-18,23,47],[16,25,-25,25,50]] },
        { id:6, name:'Marca del Verdugo', icon:'💀', desc:'Ejecuta al enemigo herido, da inmunidad y bloquea curas.', dur:'2.0s', labels:['Acel','Inmun','Cadena','Prob','MP'], icons:['⚡','🛡️','⛓️','📈','🔵'], levels:[[8,'0.5s',-15,3,20],[9,'0.6s',-18,5,23],[10,'0.7s',-21,8,27],[11,'0.8s',-24,10,30],[12,'1.0s',-27,13,33],[13,'1.2s',-30,15,37],[14,'1.4s',-33,18,40],[15,'1.6s',-36,20,43],[16,'1.8s',-39,23,47],[20,'2.0s',-50,25,50]] },
        { id:7, name:'Sentencia Elemental', icon:'⚡', desc:'Anula resistencias, asegura críticos tras esquiva y explota.', dur:'4 turnos', labels:['Penet','Esq.C','Maldec','Prob','MP'], icons:['🔓','🎯','💥','📈','🔵'], levels:[[4,3,15,3,20],[5,4,18,5,23],[6,5,21,8,27],[7,6,24,10,30],[8,7,27,13,33],[9,8,30,15,37],[10,9,33,18,40],[11,10,36,20,43],[12,11,39,23,47],[15,15,50,25,50]] }
    ];

    const state = { initialized: false, selectedId: null };

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
                background: rgba(8, 8, 16, 0.96);
                border-radius: 10px;
                overflow: hidden;
            }
            #${CONTAINER_ID}.active { display: flex !important; align-items: center; justify-content: center; }
            #${CONTAINER_ID} * { box-sizing: border-box; }
            .jv2-shell {
                width: 355px;
                max-width: 100%;
                height: 100%;
                max-height: 500px;
                background: transparent;
                display: flex;
                flex-direction: column;
                gap: 5px;
                overflow: hidden;
                padding: 3px;
                font-family: 'Segoe UI', sans-serif;
                position: relative;
            }
            .jv2-close {
                position: absolute;
                top: 6px;
                right: 6px;
                z-index: 3;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 2px solid #ffffff;
                background: rgba(0,0,0,.35);
                color: #fff;
                font-weight: bold;
                cursor: pointer;
            }
            .jv2-header {
                width: 100%; background: rgba(121,0,185,.18);
                border: 1.5px solid #7900B9; border-radius: 10px;
                padding: 7px 9px; display: flex; align-items: center; gap: 8px; flex-shrink: 0;
                margin-top: 24px;
            }
            .jv2-slots-row { display: flex; gap: 7px; flex: 1; }
            .jv2-slot {
                width: 74px; height: 74px; border: 2px solid #7900B9; border-radius: 8px;
                background: rgba(0,0,0,.4); display: flex; flex-direction: column;
                align-items: center; justify-content: center; cursor: pointer;
                position: relative; overflow: hidden; transition: border-color .2s, background .2s;
                color: #fff;
            }
            .jv2-slot:hover { border-color: #009DB9; background: rgba(0,157,185,.12); }
            .jv2-slot.filled { border-color: #41B900; background: rgba(65,185,0,.12); }
            .jv2-slot-lv { position: absolute; top: 2px; right: 4px; font-size: 7px; color: #41B900; font-weight: bold; }
            .jv2-slot-icon { font-size: 26px; }
            .jv2-slot-name { font-size: 7px; color: #ccc; text-align: center; margin-top: 2px; max-width: 70px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .jv2-slot-empty { font-size: 8.5px; color: #444; }
            .jv2-info-btn {
                width: 30px; height: 30px; border-radius: 50%;
                border: 2px solid #009DB9; background: rgba(0,157,185,.15);
                color: #009DB9; font-size: 14px; font-weight: bold;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                flex-shrink: 0; align-self: flex-start; margin-top: 20px; transition: background .2s;
            }
            .jv2-info-btn:hover { background: rgba(0,157,185,.35); }
            .jv2-library {
                width: 100%; background: rgba(0,0,0,.25);
                border: 1.5px solid #B91C00; border-radius: 10px;
                display: flex; flex-direction: column; overflow: hidden;
                flex-shrink: 0; max-height: 180px;
            }
            .jv2-lib-title {
                padding: 5px 10px; font-size: 9px; font-weight: bold;
                letter-spacing: 2px; color: #B91C00;
                border-bottom: 1px solid rgba(185,28,0,.3);
                text-transform: uppercase; flex-shrink: 0;
            }
            .jv2-skill-list {
                overflow-y: auto; flex: 1; padding: 5px 7px;
                display: flex; flex-direction: column; gap: 4px;
                scroll-behavior: smooth;
            }
            .jv2-skill-list::-webkit-scrollbar, .jv2-modal-body::-webkit-scrollbar { width: 4px; }
            .jv2-skill-list::-webkit-scrollbar-thumb { background: #B91C00; border-radius: 2px; }
            .jv2-skill-card {
                background: rgba(185,28,0,.08); border: 1.5px solid rgba(185,28,0,.25);
                border-radius: 7px; padding: 6px 8px; cursor: pointer;
                transition: border-color .2s, background .2s; flex-shrink: 0; color: #fff;
            }
            .jv2-skill-card:hover { border-color: #B91C00; background: rgba(185,28,0,.18); }
            .jv2-skill-card.selected { border-color: #41B900; background: rgba(65,185,0,.1); }
            .jv2-skill-card.equipped { border-left: 3px solid #41B900; }
            .jv2-sc-name { font-size: 10px; font-weight: bold; color: #fff; margin-bottom: 3px; display: flex; align-items: center; gap: 5px; }
            .jv2-eq-badge { font-size: 6.5px; background: #41B900; color: #000; border-radius: 3px; padding: 1px 3px; font-weight: bold; }
            .jv2-sc-stats { display: flex; gap: 6px; flex-wrap: wrap; }
            .jv2-stat { font-size: 8px; color: #bbb; display: flex; align-items: center; gap: 2px; white-space: nowrap; }
            .jv2-upgrade-panel {
                width: 100%; background: rgba(65,185,0,.07);
                border: 1.5px solid #41B900; border-radius: 10px;
                padding: 7px 9px; flex-shrink: 0;
                display: flex; flex-direction: column; gap: 5px; color: #fff;
            }
            .jv2-up-title { font-size: 8.5px; font-weight: bold; color: #41B900; letter-spacing: 1.5px; text-transform: uppercase; text-align: center; }
            .jv2-up-placeholder { text-align: center; color: #555; font-size: 9px; padding: 8px 0; }
            .jv2-gold { text-align: center; color: #ffd54f; font-size: 8px; letter-spacing: 1px; }
            .jv2-compare-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 4px; align-items: start; }
            .jv2-cbox { background: rgba(0,0,0,.3); border-radius: 6px; padding: 5px 6px; }
            .jv2-cbox-label { font-size: 7.5px; color: #777; margin-bottom: 3px; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
            .jv2-cstat { font-size: 8px; color: #bbb; display: flex; align-items: center; gap: 2px; margin-bottom: 1px; }
            .jv2-cstat.better { color: #41B900; font-weight: bold; }
            .jv2-c-arrow { font-size: 13px; color: #41B900; align-self: center; text-align: center; }
            .jv2-up-actions { display: flex; gap: 6px; }
            .jv2-btn { flex: 1; height: 29px; border-radius: 7px; border: none; font-size: 9px; font-weight: bold; letter-spacing: .8px; cursor: pointer; transition: opacity .2s, transform .1s; text-transform: uppercase; }
            .jv2-btn:active { transform: scale(.97); }
            .jv2-btn-upgrade { background: linear-gradient(135deg,#B91C00,#7900B9); color: #fff; }
            .jv2-btn-upgrade.off { background: #444; color: #666; cursor: not-allowed; }
            .jv2-btn-equip { background: linear-gradient(135deg,#41B900,#009DB9); color: #000; }
            .jv2-btn-equip.unequip { background: linear-gradient(135deg,#B91C00,#7900B9); color: #fff; }
            .jv2-modal-ov { position: absolute; inset: 0; background: rgba(0,0,0,.7); display: none; align-items: center; justify-content: center; z-index: 200; }
            .jv2-modal-ov.open { display: flex; }
            .jv2-modal { width: 310px; max-height: 400px; background: #0d0d1a; border: 2px solid #7900B9; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
            .jv2-modal-hdr { background: linear-gradient(90deg,#7900B9,#B91C00); padding: 9px 12px; font-size: 10px; font-weight: bold; color: #fff; letter-spacing: 2px; display: flex; justify-content: space-between; align-items: center; }
            .jv2-modal-close { background: none; border: none; color: #fff; font-size: 15px; cursor: pointer; }
            .jv2-modal-body { overflow-y: auto; flex: 1; padding: 8px 10px; display: flex; flex-direction: column; gap: 7px; }
            .jv2-modal-body::-webkit-scrollbar-thumb { background: #7900B9; border-radius: 2px; }
            .jv2-g-item { background: rgba(121,0,185,.1); border: 1px solid rgba(121,0,185,.3); border-radius: 7px; padding: 7px 9px; }
            .jv2-g-name { font-size: 10.5px; font-weight: bold; color: #c084fc; margin-bottom: 2px; }
            .jv2-g-desc { font-size: 9px; color: #aaa; line-height: 1.5; }
            .jv2-g-dur { font-size: 8px; color: #009DB9; margin-top: 3px; }
        `;
        document.head.appendChild(style);
    }

    function baseLevels() {
        return Object.fromEntries(SKILLS.map((skill) => [skill.id, 1]));
    }

    function coerceSkillId(id) {
        if (id === null || typeof id === 'undefined' || id === '') return null;
        const normalized = Number(id);
        return Number.isInteger(normalized) && getSkillById(normalized) ? normalized : null;
    }

    function ensureData() {
        if (!window.personaje) return null;
        if (!window.personaje.jutsus || typeof window.personaje.jutsus !== 'object') {
            window.personaje.jutsus = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
        if (!Array.isArray(window.personaje.jutsus.slots)) {
            window.personaje.jutsus.slots = [null, null, null];
        }
        if (!window.personaje.jutsus.skillLevels || typeof window.personaje.jutsus.skillLevels !== 'object') {
            window.personaje.jutsus.skillLevels = {};
        }
        window.personaje.jutsus.slots = window.personaje.jutsus.slots
            .slice(0, 3)
            .map((id) => coerceSkillId(id))
            .concat([null, null, null])
            .slice(0, 3);
        const defaults = baseLevels();
        Object.keys(defaults).forEach((id) => {
            const current = Number(window.personaje.jutsus.skillLevels[id] || 1);
            window.personaje.jutsus.skillLevels[id] = Math.min(Math.max(1, current), 10);
        });
        const persistedSelection = coerceSkillId(window.personaje.jutsus.selectedId);
        window.personaje.jutsus.selectedId = persistedSelection;
        if (persistedSelection !== null) {
            state.selectedId = persistedSelection;
        } else if (state.selectedId !== null && !getSkillById(state.selectedId)) {
            state.selectedId = null;
        }
        return window.personaje.jutsus;
    }

    function getData() {
        return ensureData() || {
            slots: [null, null, null],
            skillLevels: baseLevels(),
            selectedId: null
        };
    }

    function getSkillById(id) {
        const normalized = Number(id);
        return SKILLS.find((skill) => skill.id === normalized) || null;
    }

    function getSelectedSkillId(data) {
        const persistedSelection = coerceSkillId(data?.selectedId);
        if (persistedSelection !== null) {
            state.selectedId = persistedSelection;
            return persistedSelection;
        }
        return coerceSkillId(state.selectedId);
    }

    function fmt(value) {
        return typeof value === 'string' ? value : `${value}%`;
    }

    function cost(level) {
        return level * 150;
    }

    function currentGold() {
        return Number(window.personaje?.oro || 0);
    }

    function updateGoldUi() {
        if (typeof window.actualizarOroPanel === 'function') {
            window.actualizarOroPanel();
        } else {
            const goldNode = document.getElementById('oro-valor');
            if (goldNode) goldNode.textContent = String(currentGold());
        }
    }

    function showToast(message) {
        if (typeof window.mostrarNotificacion === 'function') {
            window.mostrarNotificacion(message, 'sistema');
        }
    }

    function saveSilently() {
        if (typeof window.guardarPartida === 'function') {
            window.guardarPartida({ silent: true });
        }
    }

    function renderSlots(data, root) {
        const row = root.querySelector('[data-role="slots-row"]');
        row.innerHTML = '';
        for (let i = 0; i < 3; i += 1) {
            const skillId = data.slots[i];
            const skill = skillId !== null ? getSkillById(skillId) : null;
            const slot = document.createElement('div');
            slot.className = `jv2-slot${skill ? ' filled' : ''}`;
            if (skill) {
                const level = data.skillLevels[skill.id] || 1;
                slot.innerHTML = `<div class="jv2-slot-lv">Lv${level}</div><div class="jv2-slot-icon">${skill.icon}</div><div class="jv2-slot-name">${skill.name}</div>`;
                slot.addEventListener('click', () => {
                    data.slots[i] = null;
                    saveSilently();
                    refresh(root);
                });
            } else {
                slot.innerHTML = '<div class="jv2-slot-empty">VACÍO</div>';
            }
            row.appendChild(slot);
        }
    }

    function renderList(data, root) {
        const list = root.querySelector('[data-role="skill-list"]');
        list.innerHTML = '';
        SKILLS.forEach((skill) => {
            const level = data.skillLevels[skill.id] || 1;
            const stats = skill.levels[level - 1];
            const equipped = data.slots.includes(skill.id);
            const card = document.createElement('div');
            card.className = `jv2-skill-card${data.selectedId === skill.id ? ' selected' : ''}${equipped ? ' equipped' : ''}`;
            card.innerHTML = `
                <div class="jv2-sc-name">${skill.icon} ${skill.name}
                    ${equipped ? '<span class="jv2-eq-badge">✓ SLOT</span>' : ''}
                    <span style="margin-left:auto;font-size:7.5px;color:#7900B9;font-weight:bold">Lv${level}</span>
                </div>
                <div class="jv2-sc-stats">
                    ${skill.labels.slice(0, 3).map((label, index) => `<span class="jv2-stat">${skill.icons[index]}&nbsp;${label}:<b style="color:#fff;margin-left:2px">${fmt(stats[index])}</b></span>`).join('')}
                    <span class="jv2-stat">🔵 MP:<b style="color:#009DB9;margin-left:2px">${stats[4]}</b></span>
                </div>`;
            card.addEventListener('click', () => {
                state.selectedId = skill.id;
                data.selectedId = skill.id;
                refresh(root);
                saveSilently();
            });
            list.appendChild(card);
        });
    }

    function upgradeSkill(skill, data, root) {
        const level = data.skillLevels[skill.id] || 1;
        const price = cost(level);
        if (level >= 10) return;
        const success = typeof window.gastarOro === 'function'
            ? window.gastarOro(price)
            : (() => {
                if (!window.personaje || currentGold() < price) return false;
                window.personaje.oro -= price;
                return true;
            })();
        if (!success) {
            showToast('❌ Oro insuficiente para mejorar este Jutsu.');
            return;
        }
        data.skillLevels[skill.id] = level + 1;
        updateGoldUi();
        saveSilently();
        showToast(`⬆️ ${skill.name} subió a nivel ${data.skillLevels[skill.id]}.`);
        refresh(root);
    }

    function toggleEquipSkill(skill, data, root) {
        const equippedIndex = data.slots.indexOf(skill.id);
        if (equippedIndex !== -1) {
            data.slots[equippedIndex] = null;
            saveSilently();
            refresh(root);
            return;
        }
        const free = data.slots.indexOf(null);
        if (free !== -1) {
            data.slots[free] = skill.id;
        } else {
            data.slots[0] = skill.id;
        }
        saveSilently();
        refresh(root);
    }

    function renderUpgrade(data, root) {
        const content = root.querySelector('[data-role="up-content"]');
        const goldLabel = root.querySelector('[data-role="gold"]');
        goldLabel.textContent = `ORO DISPONIBLE: 🪙 ${currentGold()}`;

        const selectedId = getSelectedSkillId(data);
        if (selectedId === null) {
            content.innerHTML = '<div class="jv2-up-placeholder">← Selecciona una habilidad</div>';
            return;
        }

        const skill = getSkillById(selectedId);
        if (!skill) {
            state.selectedId = null;
            data.selectedId = null;
            content.innerHTML = '<div class="jv2-up-placeholder">← Selecciona una habilidad válida</div>';
            return;
        }
        const level = data.skillLevels[skill.id] || 1;
        const current = skill.levels[level - 1];
        const next = skill.levels[Math.min(level, 9)];
        const maxed = level >= 10;
        const price = cost(level);
        const canBuy = currentGold() >= price;
        const equipped = data.slots.includes(skill.id);

        content.innerHTML = `
            <div class="jv2-compare-row">
                <div class="jv2-cbox">
                    <div class="jv2-cbox-label">Ahora (Lv${level})</div>
                    ${skill.labels.map((label, index) => `<div class="jv2-cstat">${skill.icons[index]} ${label}: <b>${fmt(current[index])}</b></div>`).join('')}
                </div>
                <div class="jv2-c-arrow">→</div>
                <div class="jv2-cbox">
                    <div class="jv2-cbox-label">${maxed ? '✓ MAX' : `Lv${level + 1}`}</div>
                    ${maxed
                        ? '<div style="font-size:9px;color:#41B900;text-align:center;margin-top:10px">¡NIVEL MÁXIMO!</div>'
                        : skill.labels.map((label, index) => `<div class="jv2-cstat${next[index] !== current[index] ? ' better' : ''}">${skill.icons[index]} ${label}: <b>${fmt(next[index])}</b></div>`).join('')}
                </div>
            </div>
            <div class="jv2-up-actions">
                <button class="jv2-btn jv2-btn-upgrade ${canBuy && !maxed ? '' : 'off'}" data-role="btn-upgrade">${maxed ? 'MAX ✓' : `MEJORAR 🪙${price}`}</button>
                <button class="jv2-btn jv2-btn-equip ${equipped ? 'unequip' : ''}" data-role="btn-equip">${equipped ? '⬆️ QUITAR' : '⬇️ EQUIPAR'}</button>
            </div>`;

        const upgradeBtn = content.querySelector('[data-role="btn-upgrade"]');
        const equipBtn = content.querySelector('[data-role="btn-equip"]');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                if (maxed || !canBuy) return;
                upgradeSkill(skill, data, root);
            });
        }
        if (equipBtn) {
            equipBtn.addEventListener('click', () => toggleEquipSkill(skill, data, root));
        }
    }

    function renderGlossary(root) {
        const modalBody = root.querySelector('[data-role="modal-body"]');
        modalBody.innerHTML = SKILLS.map((skill) => `
            <div class="jv2-g-item">
                <div class="jv2-g-name">${skill.icon} ${skill.name}</div>
                <div class="jv2-g-desc">${skill.desc}</div>
                <div class="jv2-g-dur">⏱ ${skill.dur} &nbsp;|&nbsp; ${skill.labels.join(', ')}</div>
            </div>`).join('');
    }

    function refresh(root) {
        const data = getData();
        renderSlots(data, root);
        renderList(data, root);
        renderUpgrade(data, root);
        renderGlossary(root);
    }

    function buildUi() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return null;
        if (container.dataset.initialized === 'true') return container;

        container.innerHTML = `
            <div class="jv2-shell">
                <button class="jv2-close" data-role="close">✕</button>
                <div class="jv2-header">
                    <div class="jv2-slots-row" data-role="slots-row"></div>
                    <button class="jv2-info-btn" data-role="open-modal">?</button>
                </div>
                <div class="jv2-library">
                    <div class="jv2-lib-title">⚔️ Biblioteca de Técnicas</div>
                    <div class="jv2-skill-list" data-role="skill-list"></div>
                </div>
                <div class="jv2-upgrade-panel">
                    <div class="jv2-up-title">🔮 Sistema de Evolución</div>
                    <div class="jv2-gold" data-role="gold"></div>
                    <div data-role="up-content"><div class="jv2-up-placeholder">← Selecciona una habilidad</div></div>
                </div>
                <div class="jv2-modal-ov" data-role="modal-ov">
                    <div class="jv2-modal">
                        <div class="jv2-modal-hdr">📜 GLOSARIO DE ATRIBUTOS <button class="jv2-modal-close" data-role="close-modal">✕</button></div>
                        <div class="jv2-modal-body" data-role="modal-body"></div>
                    </div>
                </div>
            </div>`;

        const modal = container.querySelector('[data-role="modal-ov"]');
        container.querySelector('[data-role="close"]').addEventListener('click', closeJutsus);
        container.querySelector('[data-role="open-modal"]').addEventListener('click', () => modal.classList.add('open'));
        container.querySelector('[data-role="close-modal"]').addEventListener('click', () => modal.classList.remove('open'));
        modal.addEventListener('click', (event) => {
            if (event.target === modal) modal.classList.remove('open');
        });

        container.dataset.initialized = 'true';
        return container;
    }

    function ensureInitialized() {
        injectStyles();
        const container = buildUi();
        if (!container) return null;
        state.initialized = true;
        refresh(container);
        return container;
    }

    function hideMissionContent() {
        const missionContent = document.querySelector('.mission-content');
        if (missionContent) missionContent.style.display = 'none';
    }

    function showMissionContent() {
        const missionContent = document.querySelector('.mission-content');
        if (missionContent) missionContent.style.display = 'flex';
    }

    function toggleJutsus(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const container = ensureInitialized();
        if (!container) return;
        const visible = container.classList.contains('active');
        if (visible) {
            closeJutsus();
            return;
        }
        if (typeof window.closeHeroEquipment === 'function') window.closeHeroEquipment();
        if (typeof window.closeMisiones === 'function') window.closeMisiones();
        if (typeof window.closeArbol === 'function') window.closeArbol();
        if (typeof window.closeBatallaNinja === 'function') window.closeBatallaNinja();
        const ajustes = document.getElementById('ajustes-overlay-container');
        if (ajustes) ajustes.style.display = 'none';
        hideMissionContent();
        refresh(container);
        container.classList.add('active');
        container.style.display = 'flex';
    }

    function closeJutsus() {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;
        container.classList.remove('active');
        container.style.display = 'none';
        showMissionContent();
    }

    function getPersistentData() {
        const data = getData();
        return {
            slots: data.slots.slice(0, 3),
            skillLevels: { ...data.skillLevels },
            selectedId: getSelectedSkillId(data)
        };
    }

    function restoreFromSave(saved) {
        if (!window.personaje) return;
        const base = getData();
        const slots = Array.isArray(saved?.slots) ? saved.slots.slice(0, 3) : base.slots;
        const skillLevels = baseLevels();
        SKILLS.forEach((skill) => {
            const rawLevel = Number(saved?.skillLevels?.[skill.id] || 1);
            skillLevels[skill.id] = Math.min(Math.max(1, rawLevel), 10);
        });
        const selectedId = coerceSkillId(saved?.selectedId);
        state.selectedId = selectedId;
        window.personaje.jutsus = {
            slots: slots.concat([null, null, null]).slice(0, 3).map((id) => coerceSkillId(id)),
            skillLevels,
            selectedId
        };
        const container = document.getElementById(CONTAINER_ID);
        if (container && container.dataset.initialized === 'true') refresh(container);
    }

    function createBattleState(source) {
        return { source, createdAt: Date.now(), equipped: getPersistentData().slots.filter((id) => id !== null) };
    }

    function noopReturnFirst(first) { return first; }

    window.jutsusSystem = {
        init: ensureInitialized,
        toggle: toggleJutsus,
        close: closeJutsus,
        getPersistentData,
        restoreFromSave,
        createBattleState,
        prepareTurn: function () {},
        modifyPlayerCritChance: noopReturnFirst,
        applyPlayerDamage: noopReturnFirst,
        modifyEvasion: noopReturnFirst,
        beforeEnemyAttack: function () { return { skip: false, blocked: false }; },
        modifyEnemyDamage: noopReturnFirst,
        applyIncomingDamage: noopReturnFirst,
        endBattle: function () {},
        getEquippedSkills: function () { return getPersistentData().slots.map((id) => getSkillById(id)).filter(Boolean); }
    };

    window.toggleJutsus = toggleJutsus;
    window.closeJutsus = closeJutsus;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureInitialized);
    } else {
        ensureInitialized();
    }
})();
