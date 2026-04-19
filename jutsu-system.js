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

  const createDefaultSkillStats = () => ({
    level: 1,
    damage: 90,
    mpCost: 15,
    effect: 'Impacto chakra',
    buff: 'ATQ +2%',
    duration: 6
  });

  const getUpgradeTributes = (level) => ({
    scrolls: 2 + Math.floor(level / 2),
    crystals: 1 + Math.floor(level / 3)
  });

  const getNextStats = (stats) => ({
    damage: stats.damage + 15,
    mpCost: stats.mpCost + 3,
    effect: `${stats.effect} +`,
    buff: (() => {
      const match = /([+-]?\d+)%/.exec(stats.buff || '');
      if (!match) return `${stats.buff || 'Buff'} +`;
      const current = Number(match[1]);
      return stats.buff.replace(match[0], `${current + 2}%`);
    })(),
    duration: stats.duration + 1
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
      byCharacter: deepClone(CHARACTER_SKILL_BOOK),
      selectedLeftSlotIndex: null,
      resources: {
        scrolls: 30,
        crystals: 25
      }
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

      const closeModal = this.root.querySelector('#jsuSkillModalClose');
      const modalOverlay = this.root.querySelector('#jsuSkillModalOverlay');
      const equipBtn = this.root.querySelector('#jsuEquipBtn');
      const upgradeBtn = this.root.querySelector('#jsuUpgradeBtn');

      closeModal?.addEventListener('click', () => this.closeSkillModal());
      modalOverlay?.addEventListener('click', (event) => {
        if (event.target === modalOverlay) this.closeSkillModal();
      });
      equipBtn?.addEventListener('click', () => this.handleEquipToggleFromModal());
      upgradeBtn?.addEventListener('click', () => this.upgradeSelectedSkill());

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

    openSkillModal(leftSlotIndex) {
      const current = this.getActiveCharacterConfig();
      if (!current) return;

      const slotData = current.slots[leftSlotIndex];
      const skill = slotData?.skill;
      if (!skill) {
        this.setStatus(`⚠️ ${slotData?.key || 'slot'} vacío. Edita jutsu-system.js para añadir habilidades.`);
        return;
      }

      if (!skill.stats) skill.stats = createDefaultSkillStats();
      this.state.selectedLeftSlotIndex = leftSlotIndex;
      this.refreshModal();
      this.root.querySelector('#jsuSkillModalOverlay')?.classList.add('active');
    },

    closeSkillModal() {
      this.root.querySelector('#jsuSkillModalOverlay')?.classList.remove('active');
      this.state.selectedLeftSlotIndex = null;
    },

    getSelectedSkillContext() {
      const current = this.getActiveCharacterConfig();
      const leftSlotIndex = this.state.selectedLeftSlotIndex;
      if (!current || leftSlotIndex == null) return null;
      const slotData = current.slots[leftSlotIndex];
      if (!slotData?.skill) return null;
      return { current, leftSlotIndex, slotData, skill: slotData.skill };
    },

    findEquippedSlotForSkill(current, skillId) {
      return current.equipped.findIndex((value) => value?.id === skillId);
    },

    handleEquipToggleFromModal() {
      const context = this.getSelectedSkillContext();
      if (!context) return;
      const { current, skill } = context;

      const alreadyEquippedIndex = this.findEquippedSlotForSkill(current, skill.id);
      if (alreadyEquippedIndex >= 0) {
        current.equipped[alreadyEquippedIndex] = null;
        this.setStatus(`✕ ${skill.name} removida del círculo ${alreadyEquippedIndex + 1}`);
        this.renderSlots();
        this.refreshModal();
        return;
      }

      const firstEmpty = current.equipped.findIndex((value) => value == null);
      const targetIndex = firstEmpty >= 0 ? firstEmpty : 2;
      current.equipped[targetIndex] = deepClone(skill);
      this.spawnParticles(targetIndex);
      this.setStatus(`⬣ ${skill.name} equipada en círculo ${targetIndex + 1}`);
      this.renderSlots();
      this.refreshModal();
    },

    upgradeSelectedSkill() {
      const context = this.getSelectedSkillContext();
      if (!context) return;
      const { skill } = context;

      if (!skill.stats) skill.stats = createDefaultSkillStats();
      const cost = getUpgradeTributes(skill.stats.level || 1);
      const hasEnough = this.state.resources.scrolls >= cost.scrolls && this.state.resources.crystals >= cost.crystals;

      if (!hasEnough) {
        this.setStatus(`⚠️ Necesitas ${cost.scrolls}📜 y ${cost.crystals}💠 para mejorar.`);
        return;
      }

      this.state.resources.scrolls -= cost.scrolls;
      this.state.resources.crystals -= cost.crystals;

      const next = getNextStats(skill.stats);
      skill.stats = {
        level: (skill.stats.level || 1) + 1,
        damage: next.damage,
        mpCost: next.mpCost,
        effect: next.effect,
        buff: next.buff,
        duration: next.duration
      };

      this.renderTopResources();
      this.refreshModal();
      this.renderSlots();
      this.setStatus(`▲ ${skill.name} subió a nivel ${skill.stats.level}`);
    },

    refreshModal() {
      const context = this.getSelectedSkillContext();
      if (!context) return;
      const { current, skill } = context;
      const stats = skill.stats || createDefaultSkillStats();
      const next = getNextStats(stats);
      const eqIndex = this.findEquippedSlotForSkill(current, skill.id);
      const upgradeCost = getUpgradeTributes(stats.level || 1);

      this.root.querySelector('#jsuSkillModalName').textContent = `${skill.name} · Nv ${stats.level || 1}`;
      this.root.querySelector('#jsuSkillModalIcon').textContent = skill.em || '✦';
      this.root.querySelector('#jsuStatDamageCur').textContent = stats.damage;
      this.root.querySelector('#jsuStatMpCur').textContent = stats.mpCost;
      this.root.querySelector('#jsuStatEffectCur').textContent = stats.effect;
      this.root.querySelector('#jsuStatBuffCur').textContent = stats.buff;
      this.root.querySelector('#jsuStatDurationCur').textContent = `${stats.duration}s`;

      this.root.querySelector('#jsuStatDamageNext').textContent = next.damage;
      this.root.querySelector('#jsuStatMpNext').textContent = next.mpCost;
      this.root.querySelector('#jsuStatEffectNext').textContent = next.effect;
      this.root.querySelector('#jsuStatBuffNext').textContent = next.buff;
      this.root.querySelector('#jsuStatDurationNext').textContent = `${next.duration}s`;

      const equipBtn = this.root.querySelector('#jsuEquipBtn');
      if (equipBtn) {
        equipBtn.textContent = eqIndex >= 0 ? 'QUITAR' : 'EQUIPAR';
      }

      const upgradeBtn = this.root.querySelector('#jsuUpgradeBtn');
      if (upgradeBtn) {
        upgradeBtn.textContent = `MEJORAR (${upgradeCost.scrolls}📜 ${upgradeCost.crystals}💠)`;
      }
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
      this.renderTopResources();
      this.renderLibrary();
      this.renderSlots();
    },

    renderTopResources() {
      const scrollEl = this.root.querySelector('#jsuScrolls');
      const crystalEl = this.root.querySelector('#jsuCrystals');
      if (scrollEl) scrollEl.textContent = this.state.resources.scrolls;
      if (crystalEl) crystalEl.textContent = this.state.resources.crystals;
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

        button.addEventListener('click', () => this.openSkillModal(index));
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
