(function () {
  const SLOT_COUNT = 6;
  const SAVE_KEY = 'ngs_rpg_save_data';
  const JUTSU_SAVE_KEY = 'ngs_jutsu_slots_by_character_v2';
  const DEFAULT_CHARACTER = 'global';
  const EMPTY_SLOTS = Array(SLOT_COUNT).fill(null);

  const CHARACTER_IDS = [
    'asura', 'hagoromo', 'hashirama', 'indra', 'itachi', 'itama',
    'kaguya', 'karin', 'kushina', 'madara', 'nagato', 'naruto',
    'obito', 'sasuke', 'tobirama', 'tsunade'
  ];

  function getEmptyCharacterState() {
    return {
      slots: [...EMPTY_SLOTS],
      skills: [],
      nextSkillId: 1
    };
  }

  function sanitizeCharacterState(rawCharacterState) {
    const base = getEmptyCharacterState();
    if (!rawCharacterState || typeof rawCharacterState !== 'object') {
      return base;
    }

    if (Array.isArray(rawCharacterState.skills)) {
      base.skills = rawCharacterState.skills
        .filter((skill) => skill && typeof skill === 'object' && typeof skill.id === 'string' && skill.id.trim() !== '')
        .map((skill) => ({
          id: skill.id,
          name: String(skill.name || '').trim(),
          em: String(skill.em || '✦').trim() || '✦'
        }))
        .filter((skill) => skill.name !== '');
    }

    if (Array.isArray(rawCharacterState.slots)) {
      for (let i = 0; i < SLOT_COUNT; i += 1) {
        const value = rawCharacterState.slots[i];
        base.slots[i] = typeof value === 'string' ? value : null;
      }
    }

    const maxNumericId = base.skills.reduce((maxId, skill) => {
      const suffix = Number(skill.id.replace(/^s/, ''));
      if (Number.isNaN(suffix)) return maxId;
      return Math.max(maxId, suffix);
    }, 0);

    const nextSkillId = Number(rawCharacterState.nextSkillId);
    base.nextSkillId = Number.isFinite(nextSkillId)
      ? Math.max(nextSkillId, maxNumericId + 1)
      : maxNumericId + 1;

    return base;
  }

  const JutsuSystem = {
    host: null,
    root: null,
    selectedSkillId: null,
    activeCharacterId: DEFAULT_CHARACTER,
    stateByCharacter: {},

    mount() {
      if (this.isMounted()) return;
      this.host = document.getElementById('hero-system-host');
      if (!this.host) return;
      const tpl = document.getElementById('jutsuSystemTemplate');
      if (!tpl) return;

      this.host.innerHTML = '';
      this.host.appendChild(tpl.content.cloneNode(true));
      this.root = this.host.querySelector('#jutsu-system-root');

      this.restoreState();
      this.syncCharacterFromStorage();
      this.bindEvents();
      this.renderCharacterTitle();
      this.renderLib();
      this.renderSlots();
    },

    unmount() {
      if (!this.host) return;
      this.host.innerHTML = '';
      this.root = null;
      this.selectedSkillId = null;
    },

    isMounted() {
      return Boolean(this.host && this.root && this.host.contains(this.root));
    },

    getCharacterState(characterId = this.activeCharacterId) {
      const id = characterId || DEFAULT_CHARACTER;
      if (!this.stateByCharacter[id]) {
        this.stateByCharacter[id] = getEmptyCharacterState();
      }
      return this.stateByCharacter[id];
    },

    getActiveSkills() {
      return this.getCharacterState().skills;
    },

    getSkillById(skillId) {
      if (!skillId) return null;
      return this.getActiveSkills().find((skill) => skill.id === skillId) || null;
    },

    getEquippedSkills() {
      const state = this.getCharacterState();
      return state.slots
        .map((skillId, index) => ({ skill: this.getSkillById(skillId), slot: index + 1 }))
        .filter((entry) => entry.skill)
        .map((entry) => ({ id: entry.skill.id, name: entry.skill.name, em: entry.skill.em, slot: entry.slot }));
    },

    restoreState() {
      try {
        const raw = localStorage.getItem(JUTSU_SAVE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        const sanitized = {};

        CHARACTER_IDS.forEach((characterId) => {
          sanitized[characterId] = sanitizeCharacterState(parsed?.[characterId]);
        });

        if (parsed?.[DEFAULT_CHARACTER]) {
          sanitized[DEFAULT_CHARACTER] = sanitizeCharacterState(parsed[DEFAULT_CHARACTER]);
        }

        this.stateByCharacter = sanitized;
      } catch (_error) {
        this.stateByCharacter = {};
      }
    },

    persistState() {
      localStorage.setItem(JUTSU_SAVE_KEY, JSON.stringify(this.stateByCharacter));
    },

    syncCharacterFromStorage() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        const save = raw ? JSON.parse(raw) : null;
        const characterId = save?.characterId;
        if (characterId && CHARACTER_IDS.includes(characterId)) {
          this.activeCharacterId = characterId;
        }
      } catch (_error) {
        this.activeCharacterId = DEFAULT_CHARACTER;
      }
      this.getCharacterState(this.activeCharacterId);
    },

    setActiveCharacter(characterId) {
      const nextCharacter = CHARACTER_IDS.includes(characterId) ? characterId : DEFAULT_CHARACTER;
      if (this.activeCharacterId === nextCharacter) return;

      this.activeCharacterId = nextCharacter;
      this.selectedSkillId = null;
      this.getCharacterState(nextCharacter);

      if (!this.isMounted()) return;
      this.closeDetail();
      this.renderCharacterTitle();
      this.renderLib();
      this.renderSlots();
      this.setStatus(`Sistema de habilidades cargado para ${nextCharacter.toUpperCase()}`);
    },

    bindEvents() {
      this.root.querySelectorAll('.jsu-slot-circle').forEach((slotEl) => {
        slotEl.addEventListener('dragover', (ev) => ev.preventDefault());
        slotEl.addEventListener('drop', (ev) => {
          ev.preventDefault();
          const slot = Number(slotEl.dataset.slot);
          const id = String(ev.dataTransfer?.getData('jutsuId') || '').trim();
          if (Number.isNaN(slot) || !id) return;
          this.equipInSlot(slot, id);
        });
      });

      const closeBtn = this.root.querySelector('#jsuDetailClose');
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeDetail());

      const equipBtn = this.root.querySelector('#jsuEquipBtn');
      if (equipBtn) equipBtn.addEventListener('click', () => this.equipFromDetail());

      const removeBtn = this.root.querySelector('#jsuRemoveBtn');
      if (removeBtn) removeBtn.addEventListener('click', () => this.removeFromSlot());

      const addSkillBtn = this.root.querySelector('#jsuAddSkillBtn');
      if (addSkillBtn) addSkillBtn.addEventListener('click', () => this.addSkillFromForm());

      const skillNameInput = this.root.querySelector('#jsuNewSkillName');
      if (skillNameInput) {
        skillNameInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            this.addSkillFromForm();
          }
        });
      }

      window.addEventListener('ngs:game-entered', (event) => {
        const nextCharacterId = event?.detail?.saveData?.characterId;
        this.setActiveCharacter(nextCharacterId);
      });
    },

    renderCharacterTitle() {
      const title = this.root.querySelector('#jsuCharacterScope');
      if (!title) return;
      title.textContent = `Personaje activo: ${this.activeCharacterId}`;
    },

    renderLib() {
      const lib = this.root.querySelector('#jsuSkillLib');
      if (!lib) return;
      lib.innerHTML = '';

      const skills = this.getActiveSkills();
      if (!skills.length) {
        const empty = document.createElement('div');
        empty.className = 'jsu-empty-lib';
        empty.textContent = 'Sin habilidades aún. Agrega habilidades personalizadas para este personaje.';
        lib.appendChild(empty);
        return;
      }

      skills.forEach((jutsu) => {
        const item = document.createElement('div');
        item.className = 'jsu-skill-icon';
        item.draggable = true;
        item.dataset.id = String(jutsu.id);
        item.innerHTML = `
          <span class="jsu-skill-lvl">${jutsu.id}</span>
          <span class="jsu-skill-em">${jutsu.em}</span>
          <span class="jsu-skill-name">${jutsu.name}</span>
        `;

        item.addEventListener('dragstart', (ev) => {
          ev.dataTransfer.setData('jutsuId', String(jutsu.id));
          item.classList.add('dragging');
          setTimeout(() => item.classList.remove('dragging'), 300);
        });

        item.addEventListener('click', () => this.openDetail(jutsu.id));
        lib.appendChild(item);
      });
    },

    addSkillFromForm() {
      const nameInput = this.root.querySelector('#jsuNewSkillName');
      const iconInput = this.root.querySelector('#jsuNewSkillIcon');

      const skillName = String(nameInput?.value || '').trim();
      const skillIcon = String(iconInput?.value || '').trim() || '✦';

      if (!skillName) {
        this.setStatus('Escribe un nombre para la habilidad antes de crearla.');
        return;
      }

      const state = this.getCharacterState();
      const skillId = `s${state.nextSkillId}`;
      state.nextSkillId += 1;
      state.skills.push({ id: skillId, name: skillName, em: skillIcon });
      this.persistState();
      this.renderLib();
      this.setStatus(`Habilidad "${skillName}" agregada a ${this.activeCharacterId}.`);

      nameInput.value = '';
      if (iconInput) iconInput.value = '';
    },

    openDetail(skillId) {
      const skill = this.getSkillById(skillId);
      if (!skill) return;
      this.selectedSkillId = skillId;

      this.root.querySelector('#jsuDpName').textContent = `${skill.em} ${skill.name}`;
      this.root.querySelector('#jsuDpId').textContent = skill.id;

      const state = this.getCharacterState();
      const equippedIn = state.slots.findIndex((slotSkillId) => slotSkillId === skill.id);
      this.root.querySelector('#jsuDpEquipState').textContent = equippedIn >= 0
        ? `Equipada en slot${equippedIn + 1}`
        : 'No equipada';

      const removeBtn = this.root.querySelector('#jsuRemoveBtn');
      if (removeBtn) removeBtn.disabled = equippedIn < 0;

      this.root.querySelector('#jsuDetailPanel').classList.add('visible');
    },

    closeDetail() {
      this.root.querySelector('#jsuDetailPanel').classList.remove('visible');
      this.selectedSkillId = null;
    },

    removeFromSlot() {
      if (!this.selectedSkillId) return;
      const state = this.getCharacterState();
      const slotIndex = state.slots.findIndex((slotSkillId) => slotSkillId === this.selectedSkillId);
      if (slotIndex < 0) return;

      state.slots[slotIndex] = null;
      this.persistState();
      this.renderSlots();
      this.openDetail(this.selectedSkillId);
      this.setStatus(`Habilidad removida de slot${slotIndex + 1}.`);
    },

    equipFromDetail() {
      if (!this.selectedSkillId) return;
      const state = this.getCharacterState();
      const empty = state.slots.indexOf(null);

      if (empty >= 0) {
        state.slots[empty] = this.selectedSkillId;
        this.spawnParticles(empty);
        this.setStatus(`Habilidad equipada en slot${empty + 1}.`);
      } else {
        state.slots[SLOT_COUNT - 1] = this.selectedSkillId;
        this.shakeSlot(SLOT_COUNT - 1);
        this.spawnParticles(SLOT_COUNT - 1);
        this.setStatus(`Todos los slots ocupados. Reemplazo automático en slot${SLOT_COUNT}.`);
      }

      this.persistState();
      this.renderSlots();
      this.openDetail(this.selectedSkillId);
    },

    equipInSlot(slot, skillId) {
      const state = this.getCharacterState();
      const skill = this.getSkillById(skillId);
      if (!skill || slot < 0 || slot >= SLOT_COUNT) return;

      state.slots[slot] = skillId;
      this.persistState();
      this.renderSlots();
      this.spawnParticles(slot);
      this.setStatus(`${skill.name} equipada en slot${slot + 1}.`);
    },

    clearSlot(slot) {
      const state = this.getCharacterState();
      if (slot < 0 || slot >= SLOT_COUNT) return;
      state.slots[slot] = null;
      this.persistState();
      this.renderSlots();
      this.setStatus(`slot${slot + 1} vacío.`);
    },

    renderSlots() {
      const state = this.getCharacterState();

      for (let i = 0; i < SLOT_COUNT; i += 1) {
        const skillId = state.slots[i];
        const skill = this.getSkillById(skillId);
        const circle = this.root.querySelector(`#jsuSlot${i}`);
        const em = this.root.querySelector(`#jsuSlotEm${i}`);
        const name = this.root.querySelector(`#jsuSlotName${i}`);
        const clearBtn = this.root.querySelector(`#jsuSlotClear${i}`);

        if (!circle || !em || !name || !clearBtn) continue;

        if (skill) {
          circle.classList.remove('empty');
          circle.classList.add('has-skill');
          em.style.fontSize = '26px';
          em.style.opacity = '1';
          em.textContent = skill.em;
          name.textContent = skill.name;
          circle.onclick = () => this.openDetail(skill.id);
          clearBtn.style.display = 'inline-flex';
          clearBtn.onclick = (event) => {
            event.stopPropagation();
            this.clearSlot(i);
          };
        } else {
          circle.classList.add('empty');
          circle.classList.remove('has-skill', 'shake');
          em.style.fontSize = '14px';
          em.style.opacity = '0.5';
          em.textContent = `slot${i + 1}`;
          name.textContent = '';
          circle.onclick = null;
          clearBtn.style.display = 'none';
        }
      }
    },

    shakeSlot(slot) {
      const el = this.root.querySelector(`#jsuSlot${slot}`);
      if (!el) return;
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 450);
    },

    spawnParticles(slot) {
      const container = this.root.querySelector(`#jsuPc${slot}`);
      if (!container) return;

      container.innerHTML = '';
      const colors = ['#00d4ff', '#ffffff', '#44aaff', '#00ffcc'];
      for (let i = 0; i < 14; i += 1) {
        const particle = document.createElement('div');
        particle.className = 'jsu-particle';
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const dist = 18 + Math.random() * 26;
        const tx = `${Math.cos(angle) * dist}px`;
        const ty = `${Math.sin(angle) * dist}px`;

        particle.style.cssText = `
          left:${34 + Math.random() * 12 - 6}px;
          top:${34 + Math.random() * 12 - 6}px;
          background:${colors[Math.floor(Math.random() * colors.length)]};
          --tx:${tx};
          --ty:${ty};
          animation-delay:${Math.random() * 0.15}s;
          width:${2 + Math.random() * 3}px;
          height:${2 + Math.random() * 3}px;
        `;
        container.appendChild(particle);
      }

      setTimeout(() => {
        container.innerHTML = '';
      }, 700);
    },

    setStatus(msg) {
      const el = this.root.querySelector('#jsuStatusMsg');
      if (!el) return;
      el.textContent = msg;
      setTimeout(() => {
        if (el.textContent === msg) {
          el.textContent = '';
        }
      }, 2800);
    }
  };

  window.JutsuSystem = JutsuSystem;
}());
