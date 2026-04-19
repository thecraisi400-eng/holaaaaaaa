(function () {
  const CHARACTER_IDS = [
    'asura', 'hagoromo', 'hashirama', 'indra', 'itachi', 'itama', 'kaguya', 'karin',
    'kushina', 'madara', 'nagato', 'naruto', 'obito', 'sasuke', 'tobirama', 'tsunade'
  ];

  const createEmptyCharacterConfig = (characterId) => ({
    characterId,
    slots: [
      { key: 'slot1', skill: null },
      { key: 'slot2', skill: null },
      { key: 'slot3', skill: null },
      { key: 'slot4', skill: null },
      { key: 'slot5', skill: null },
      { key: 'slot6', skill: null }
    ],
    equipped: [null, null, null]
  });

  // ===============================================================
  // EDITAR AQUÍ: habilidades únicas por personaje (solo por script)
  // skill: null => cuadro vacío
  // skill: { id: 'id_unico', name: 'Nombre habilidad', em: '🌀' }
  // ===============================================================
  const CHARACTER_SKILL_BOOK = {
    asura: createEmptyCharacterConfig('asura'),
    hagoromo: createEmptyCharacterConfig('hagoromo'),
    hashirama: createEmptyCharacterConfig('hashirama'),
    indra: createEmptyCharacterConfig('indra'),
    itachi: createEmptyCharacterConfig('itachi'),
    itama: createEmptyCharacterConfig('itama'),
    kaguya: createEmptyCharacterConfig('kaguya'),
    karin: createEmptyCharacterConfig('karin'),
    kushina: createEmptyCharacterConfig('kushina'),
    madara: createEmptyCharacterConfig('madara'),
    nagato: createEmptyCharacterConfig('nagato'),
    naruto: createEmptyCharacterConfig('naruto'),
    obito: createEmptyCharacterConfig('obito'),
    sasuke: createEmptyCharacterConfig('sasuke'),
    tobirama: createEmptyCharacterConfig('tobirama'),
    tsunade: createEmptyCharacterConfig('tsunade')
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  const JutsuSystem = {
    host: null,
    root: null,
    state: {
      activeCharacterId: null,
      byCharacter: deepClone(CHARACTER_SKILL_BOOK)
    },

    mount() {
      if (this.isMounted()) return;
      this.host = document.getElementById('hero-system-host');
      if (!this.host) return;
      const tpl = document.getElementById('jutsuSystemTemplate');
      if (!tpl) return;

      this.host.innerHTML = '';
      this.host.appendChild(tpl.content.cloneNode(true));
      this.root = this.host.querySelector('#jutsu-system-root');

      this.ensureCharacterStates();
      this.syncActiveCharacter();
      this.bindEvents();
      this.render();
    },

    unmount() {
      if (!this.host) return;
      window.removeEventListener('ngs:hero-stats-updated', this.handleHeroChange);
      this.host.innerHTML = '';
      this.root = null;
    },

    isMounted() {
      return Boolean(this.host && this.root && this.host.contains(this.root));
    },

    ensureCharacterStates() {
      CHARACTER_IDS.forEach((id) => {
        if (!this.state.byCharacter[id]) {
          this.state.byCharacter[id] = createEmptyCharacterConfig(id);
        }
      });
    },

    syncActiveCharacter() {
      const activeHero = window.CharacterStatsSystem?.getActiveHero?.();
      const heroId = activeHero?.characterId;
      const fallbackId = CHARACTER_IDS[0];
      this.state.activeCharacterId = CHARACTER_IDS.includes(heroId) ? heroId : fallbackId;
    },

    getActiveCharacterConfig() {
      const id = this.state.activeCharacterId;
      if (!id) return null;
      if (!this.state.byCharacter[id]) this.state.byCharacter[id] = createEmptyCharacterConfig(id);
      return this.state.byCharacter[id];
    },

    bindEvents() {
      this.root.querySelectorAll('.jsu-slot-circle').forEach((slotEl) => {
        slotEl.addEventListener('click', () => {
          const slotIndex = Number(slotEl.dataset.slot);
          this.unequipSlot(slotIndex);
        });
      });

      window.addEventListener('ngs:hero-stats-updated', this.handleHeroChange);
    },

    handleHeroChange: () => {
      if (!window.JutsuSystem || !window.JutsuSystem.isMounted()) return;
      window.JutsuSystem.syncActiveCharacter();
      window.JutsuSystem.render();
    },

    getEquippedSkills() {
      const current = this.getActiveCharacterConfig();
      if (!current) return [];
      return current.equipped
        .filter((skill) => skill && typeof skill === 'object')
        .map((skill) => ({ id: skill.id, name: skill.name, em: skill.em }));
    },

    equipFromLeftSlot(leftSlotIndex) {
      const current = this.getActiveCharacterConfig();
      if (!current) return;

      const slotData = current.slots[leftSlotIndex];
      const skill = slotData?.skill;
      if (!skill) {
        this.setStatus(`⚠️ ${slotData?.key || 'slot'} vacío. Edita jutsu-system.js para añadir habilidades.`);
        return;
      }

      const firstEmpty = current.equipped.findIndex((value) => value == null);
      const targetIndex = firstEmpty >= 0 ? firstEmpty : 2;
      current.equipped[targetIndex] = deepClone(skill);

      this.spawnParticles(targetIndex);
      this.setStatus(`⬣ ${skill.name} equipada en círculo ${targetIndex + 1}`);
      this.renderSlots();
    },

    unequipSlot(slotIndex) {
      const current = this.getActiveCharacterConfig();
      if (!current || Number.isNaN(slotIndex) || slotIndex < 0 || slotIndex > 2) return;

      const equippedSkill = current.equipped[slotIndex];
      if (!equippedSkill) return;

      current.equipped[slotIndex] = null;
      this.setStatus(`✕ ${equippedSkill.name} removida del círculo ${slotIndex + 1}`);
      this.renderSlots();
    },

    render() {
      this.renderCharacterLabel();
      this.renderLibrary();
      this.renderSlots();
    },

    renderCharacterLabel() {
      const label = this.root.querySelector('#jsuCharacterName');
      if (!label) return;
      const hero = window.CharacterStatsSystem?.getActiveHero?.();
      const name = hero?.name || this.state.activeCharacterId || '--';
      label.textContent = String(name).toUpperCase();
    },

    renderLibrary() {
      const lib = this.root.querySelector('#jsuSkillLib');
      if (!lib) return;
      const current = this.getActiveCharacterConfig();
      if (!current) return;

      lib.innerHTML = '';
      current.slots.forEach((slotData, index) => {
        const button = document.createElement('button');
        button.className = 'jsu-left-slot';
        button.type = 'button';

        const skill = slotData.skill;
        const icon = skill?.em || '⬚';
        const text = skill?.name || '';

        button.innerHTML = `
          <span class="jsu-left-slot-title">${slotData.key}</span>
          <span class="jsu-left-slot-icon">${icon}</span>
          <span class="jsu-left-slot-name">${text}</span>
        `;

        if (!skill) {
          button.classList.add('is-empty');
        }

        button.addEventListener('click', () => this.equipFromLeftSlot(index));
        lib.appendChild(button);
      });
    },

    renderSlots() {
      const current = this.getActiveCharacterConfig();
      if (!current) return;

      for (let i = 0; i < 3; i += 1) {
        const skill = current.equipped[i];
        const circle = this.root.querySelector(`#jsuSlot${i}`);
        const em = this.root.querySelector(`#jsuSlotEm${i}`);
        const name = this.root.querySelector(`#jsuSlotName${i}`);

        if (!circle || !em || !name) continue;

        if (skill) {
          circle.classList.remove('empty');
          circle.classList.add('has-skill');
          em.style.fontSize = '28px';
          em.style.opacity = '1';
          em.textContent = skill.em || '✦';
          name.textContent = skill.name || '';
        } else {
          circle.classList.add('empty');
          circle.classList.remove('has-skill', 'shake');
          em.style.fontSize = '20px';
          em.style.opacity = '0.25';
          em.textContent = '✦';
          name.textContent = '';
        }
      }
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
        if (el.textContent === msg) el.textContent = '';
      }, 2800);
    }
  };

  window.JutsuSystem = JutsuSystem;
}());
