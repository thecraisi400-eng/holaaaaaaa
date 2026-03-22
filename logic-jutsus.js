(function () {
    const skills = [
        { id: 0, nombre: 'Filo Ígneo', desc: 'Ignora defensa física, otorga evasión y quema.', lv: 1, stats: { perf: 5.0, evas: 2.0, comb: 1.0, prob: 3, mp: 20 }, incr: { perf: 1.0, evas: 0.5, comb: 0.1, prob: 2, mp: 3 } },
        { id: 1, nombre: 'Baluarte Tóxico', desc: 'Potencia críticos, bloquea daño y envenena.', lv: 1, stats: { perf: 10.0, evas: 3.0, comb: 5.0, prob: 3, mp: 20 }, incr: { perf: 2.0, evas: 1.0, comb: 1.0, prob: 2, mp: 3 } },
        { id: 2, nombre: 'Ojo del Segador', desc: 'Precisión, regeneración y desangramiento.', lv: 1, stats: { perf: 4.0, evas: 0.5, comb: 1.0, prob: 3, mp: 20 }, incr: { perf: 1.0, evas: 0.1, comb: 0.2, prob: 2, mp: 3 } },
        { id: 3, nombre: 'Espejo Glacial', desc: 'Roba vida, devuelve daño y congela.', lv: 1, stats: { perf: 2.0, evas: 3.0, comb: 1.0, prob: 3, mp: 20 }, incr: { perf: 0.5, evas: 1.0, comb: 0.1, prob: 2, mp: 3 } },
        { id: 4, nombre: 'Martillo Sísmico', desc: 'Hemorragia crítica, escudos y aturdimiento.', lv: 1, stats: { perf: 3.0, evas: 10.0, comb: 1.5, prob: 3, mp: 20 }, incr: { perf: 0.5, evas: 2.0, comb: 0.2, prob: 2, mp: 3 } },
        { id: 5, nombre: 'Viento de Inercia', desc: 'Ataque doble, resiste aturdimiento y ralentiza.', lv: 1, stats: { perf: 5.0, evas: 6.0, comb: 10.0, prob: 3, mp: 20 }, incr: { perf: 1.0, evas: 1.5, comb: 1.0, prob: 2, mp: 3 } },
        { id: 6, nombre: 'Marca del Verdugo', desc: 'Ejecuta heridos, inmunidad y bloquea curas.', lv: 1, stats: { perf: 8.0, evas: 0.5, comb: 15.0, prob: 3, mp: 20 }, incr: { perf: 1.0, evas: 0.1, comb: 3.0, prob: 2, mp: 3 } },
        { id: 7, nombre: 'Sentencia Elemental', desc: 'Anula resistencias y asegura críticos.', lv: 1, stats: { perf: 4.0, evas: 3.0, comb: 15.0, prob: 3, mp: 20 }, incr: { perf: 1.0, evas: 1.0, comb: 3.0, prob: 2, mp: 3 } }
    ];

    const state = {
        playerGold: 1200,
        selectedSkillId: null,
        equippedSkills: [null, null, null],
        initialized: false
    };

    function getContainer() {
        return document.getElementById('jutsus-overlay-container');
    }

    function buildMarkup() {
        const container = getContainer();
        if (!container) return;

        container.innerHTML = `
            <div class="jutsus-shell">
                <div class="jutsus-header-slots">
                    <div class="jutsus-slot" id="jutsu-slot-0"></div>
                    <div class="jutsus-slot" id="jutsu-slot-1"></div>
                    <div class="jutsus-slot" id="jutsu-slot-2"></div>
                    <div class="jutsus-info-btn" id="jutsus-info-btn">?</div>
                </div>
                <div class="jutsus-library-section">
                    <div class="jutsus-library-title">Biblioteca de Técnicas</div>
                    <div class="jutsus-scroll-container" id="jutsus-skill-list"></div>
                </div>
                <div class="jutsus-upgrade-panel" id="jutsus-upgrade-panel">
                    <div id="jutsus-panel-empty" class="jutsus-empty-panel">Selecciona una técnica para mejorar</div>
                    <div id="jutsus-panel-content" style="display:none;">
                        <div class="jutsus-comparison-grid">
                            <div class="jutsus-comp-col" id="jutsus-stats-now"></div>
                            <div class="jutsus-comp-col jutsus-next-lvl" id="jutsus-stats-next"></div>
                        </div>
                        <div class="jutsus-actions">
                            <button class="jutsus-btn jutsus-btn-upgrade" id="jutsus-btn-upgrade">MEJORAR (500 🪙)</button>
                            <button class="jutsus-btn jutsus-btn-equip" id="jutsus-btn-action">EQUIPAR</button>
                        </div>
                    </div>
                </div>
                <div id="jutsus-glossary-modal">
                    <h2 style="color:#cc5500; text-align:center; margin-bottom:15px;">Glosario Shinobi</h2>
                    <div id="jutsus-glossary-content"></div>
                </div>
            </div>
        `;

        container.querySelector('#jutsus-info-btn').addEventListener('click', toggleGlossary);
        container.querySelector('#jutsus-btn-upgrade').addEventListener('click', upgradeSkill);
        container.querySelector('#jutsus-btn-action').addEventListener('click', handleEquip);
        container.querySelector('#jutsus-glossary-modal').addEventListener('click', toggleGlossary);
    }

    function renderList() {
        const list = document.getElementById('jutsus-skill-list');
        if (!list) return;

        list.innerHTML = '';
        skills.forEach((s) => {
            const div = document.createElement('div');
            div.className = `jutsus-skill-card ${state.selectedSkillId === s.id ? 'selected' : ''}`;
            div.addEventListener('click', () => selectSkill(s.id));
            div.innerHTML = `
                <h4>${s.nombre} (Nv.${s.lv})</h4>
                <div class="jutsus-skill-stats-quick">
                    <span>⚕️ ${s.stats.perf}%</span>
                    <span>💨 ${s.stats.evas}%</span>
                    <span>🔥 ${s.stats.comb}%</span>
                </div>
            `;
            list.appendChild(div);
        });
    }

    function selectSkill(id) {
        state.selectedSkillId = id;
        renderList();
        const s = skills.find((skill) => skill.id === id);
        if (!s) return;

        document.getElementById('jutsus-panel-empty').style.display = 'none';
        document.getElementById('jutsus-panel-content').style.display = 'block';
        document.getElementById('jutsus-stats-now').innerHTML = `
            <span>NOW:</span>
            <span>⚕️ Perf: ${s.stats.perf.toFixed(1)}%</span>
            <span>💨 Evas: ${s.stats.evas.toFixed(1)}%</span>
            <span>🔥 Comb: ${s.stats.comb.toFixed(1)}%</span>
            <span>🔵 MP: ${s.stats.mp}</span>
            <span>📈 Prob: ${s.stats.prob}%</span>
        `;

        const upgradeButton = document.getElementById('jutsus-btn-upgrade');
        if (s.lv < 10) {
            document.getElementById('jutsus-stats-next').innerHTML = `
                <span>NEXT:</span>
                <span>⚕️ Perf: ${(s.stats.perf + s.incr.perf).toFixed(1)}%</span>
                <span>💨 Evas: ${(s.stats.evas + s.incr.evas).toFixed(1)}%</span>
                <span>🔥 Comb: ${(s.stats.comb + s.incr.comb).toFixed(1)}%</span>
                <span>🔵 MP: ${s.stats.mp + s.incr.mp}</span>
                <span>📈 Prob: ${s.stats.prob + s.incr.prob}%</span>
            `;
            upgradeButton.classList.remove('jutsus-btn-disabled');
            upgradeButton.textContent = 'MEJORAR (500 🪙)';
            if (state.playerGold < 500) upgradeButton.classList.add('jutsus-btn-disabled');
        } else {
            document.getElementById('jutsus-stats-next').innerHTML = '<span>NIVEL MÁXIMO</span>';
            upgradeButton.classList.add('jutsus-btn-disabled');
            upgradeButton.textContent = 'NIVEL MÁXIMO';
        }

        const actionButton = document.getElementById('jutsus-btn-action');
        if (state.equippedSkills.includes(id)) {
            actionButton.textContent = 'QUITAR';
            actionButton.style.background = '#d32f2f';
        } else {
            actionButton.textContent = 'EQUIPAR';
            actionButton.style.background = '#cc5500';
        }
    }

    function upgradeSkill() {
        if (state.selectedSkillId === null) return;
        const skill = skills.find((s) => s.id === state.selectedSkillId);
        const button = document.getElementById('jutsus-btn-upgrade');
        if (!skill || !button || button.classList.contains('jutsus-btn-disabled')) return;

        if (skill.lv < 10 && state.playerGold >= 500) {
            state.playerGold -= 500;
            skill.lv += 1;
            skill.stats.perf += skill.incr.perf;
            skill.stats.evas += skill.incr.evas;
            skill.stats.comb += skill.incr.comb;
            skill.stats.mp += skill.incr.mp;
            skill.stats.prob += skill.incr.prob;
            selectSkill(state.selectedSkillId);
            updateSlotsUI();
        }
    }

    function handleEquip() {
        if (state.selectedSkillId === null) return;

        const index = state.equippedSkills.indexOf(state.selectedSkillId);
        if (index > -1) {
            state.equippedSkills[index] = null;
        } else {
            const emptySlot = state.equippedSkills.indexOf(null);
            if (emptySlot > -1) {
                state.equippedSkills[emptySlot] = state.selectedSkillId;
            } else {
                alert('Ranuras llenas. Quita una habilidad primero.');
            }
        }

        selectSkill(state.selectedSkillId);
        updateSlotsUI();
    }

    function updateSlotsUI() {
        state.equippedSkills.forEach((id, index) => {
            const slot = document.getElementById(`jutsu-slot-${index}`);
            if (!slot) return;
            if (id !== null) {
                const skill = skills.find((s) => s.id === id);
                slot.innerHTML = `<span class="jutsus-slot-label">${skill.nombre.split(' ')[0]}</span>`;
                slot.classList.add('active');
            } else {
                slot.innerHTML = '';
                slot.classList.remove('active');
            }
        });
    }

    function renderGlossary() {
        const content = document.getElementById('jutsus-glossary-content');
        if (!content) return;

        content.innerHTML = skills.map((skill) => `
            <div class="jutsus-glossary-item">
                <b>${skill.nombre}</b>
                <p>${skill.desc}</p>
            </div>
        `).join('');
    }

    function toggleGlossary() {
        const modal = document.getElementById('jutsus-glossary-modal');
        if (!modal) return;
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    }

    function init() {
        if (state.initialized) return;
        buildMarkup();
        renderList();
        renderGlossary();
        updateSlotsUI();
        state.initialized = true;
    }

    window.jutsusSystem = { init, selectSkill, upgradeSkill, handleEquip };
})();
