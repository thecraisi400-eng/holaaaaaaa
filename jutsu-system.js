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
    equipped: [null, null, null, null, null, null]
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
  CHARACTER_SKILL_BOOK.itachi.slots[0].skill = {
    id: 'itachi-katon-gokakyu',
    name: '🔥 KATON: GŌKAKYŪ NO JUTSU',
    em: '🔥',
    level: 1,
    baseDamage: 40,
    damagePerLevel: 0,
    baseMpCost: 14,
    mpCostPerLevel: 0,
    baseDuration: 40,
    durationPerLevel: 0,
    burnPercent: 0.02,
    burnSeconds: 4,
    atkBuffPercent: 0.10,
    atkBuffSeconds: 25,
    cooldownSeconds: 40,
    effect: 'Quemadura -2% HP por 4s',
    buff: '+10% ATK por 25s',
    upgradeCost: { scrolls: 15, crystals: 9 },
    upgradeRules: {
      resourceAddMin: 10,
      resourceAddMax: 35,
      damageAddMin: 19,
      damageAddMax: 28,
      mpAddMin: 7,
      mpAddMax: 11
    }
  };
  CHARACTER_SKILL_BOOK.itachi.slots[1].skill = {
    id: 'itachi-kage-bunshin',
    name: '👥 KAGE BUNSHIN NO JUTSU',
    em: '👥',
    level: 1,
    baseDamage: 0,
    damagePerLevel: 0,
    baseMpCost: 17,
    mpCostPerLevel: 0,
    baseDuration: 47,
    durationPerLevel: 0,
    cloneLifetimeSeconds: 13,
    cloneCount: 2,
    cloneStatMultiplier: 0.10,
    cooldownSeconds: 47,
    aiRetryDelaySeconds: 10,
    effect: 'Crea 2 clones con 10% de stats',
    buff: '-',
    upgradeCost: { scrolls: 13, crystals: 9 },
    upgradeRules: {
      resourceAddMin: 10,
      resourceAddMax: 35,
      damageAddMin: 19,
      damageAddMax: 28,
      mpAddMin: 7,
      mpAddMax: 11
    }
  };
  CHARACTER_SKILL_BOOK.itachi.slots[2].skill = {
    id: 'itachi-shurikenjutsu',
    name: '⭐ SHURIKENJUTSU',
    em: '⭐',
    level: 1,
    baseDamage: 30,
    damagePerLevel: 0,
    baseMpCost: 13,
    mpCostPerLevel: 0,
    baseDuration: 32,
    durationPerLevel: 0,
    cooldownSeconds: 32,
    aiRetryDelaySeconds: 10,
    effect: '-',
    buff: '-',
    upgradeCost: { scrolls: 14, crystals: 12 },
    upgradeRules: {
      resourceAddMin: 10,
      resourceAddMax: 35,
      damageAddMin: 19,
      damageAddMax: 28,
      mpAddMin: 7,
      mpAddMax: 11
    }
  };
  CHARACTER_SKILL_BOOK.itachi.slots[3].skill = {
    id: 'itachi-tsukuyomi',
    name: '🌙 TSUKUYOMI',
    em: '🌙',
    level: 1,
    baseDamage: 100,
    damagePerLevel: 0,
    baseMpCost: 20,
    mpCostPerLevel: 0,
    baseDuration: 100,
    durationPerLevel: 0,
    cooldownSeconds: 100,
    ritualSeconds: 3,
    enemyStopSeconds: 4,
    selfHpPercentCost: 0.05,
    effect: 'Detiene al enemigo 4s',
    buff: 'Daña al jugador -5% HP',
    upgradeCost: { scrolls: 14, crystals: 12 },
    upgradeRules: {
      resourceAddMin: 10,
      resourceAddMax: 35,
      damageAddMin: 19,
      damageAddMax: 28,
      mpAddMin: 7,
      mpAddMax: 11
    }
  };
  CHARACTER_SKILL_BOOK.itachi.slots[4].skill = {
    id: 'itachi-amaterasu',
    name: '👁️ AMATERASU',
    em: '👁️',
    level: 1,
    baseDamage: 50,
    damagePerLevel: 0,
    baseMpCost: 15,
    mpCostPerLevel: 0,
    baseDuration: 145,
    durationPerLevel: 0,
    cooldownSeconds: 145,
    burnPercent: 0.08,
    burnSeconds: 3,
    selfHpPercentCost: 0.04,
    effect: 'Quemadura -7% HP por 3s',
    buff: 'Daña al jugador -3% HP',
    upgradeCost: { scrolls: 14, crystals: 12 },
    upgradeRules: {
      resourceAddMin: 10,
      resourceAddMax: 35,
      damageAddMin: 19,
      damageAddMax: 28,
      mpAddMin: 7,
      mpAddMax: 11
    }
  };
  CHARACTER_SKILL_BOOK.itachi.slots[5].skill = {
    id: 'itachi-susanoo',
    name: '🛡️ SUSANOO',
    em: '🛡️',
    level: 1,
    baseDamage: 24,
    damagePerLevel: 0,
    baseMpCost: 35,
    mpCostPerLevel: 0,
    baseDuration: 230,
    durationPerLevel: 0,
    atkBuffPercent: 0.35,
    defBuffPercent: 0.97,
    transformDurationSeconds: 29,
    cooldownSeconds: 230,
    aiUseChance: 0.35,
    effect: '-',
    buff: 'ATK +35% · DEF +97%',
    upgradeCost: { scrolls: 14, crystals: 12 },
    upgradeRules: {
      resourceAddMin: 10,
      resourceAddMax: 35,
      damageAddPercentMin: 1,
      damageAddPercentMax: 3,
      mpAddMin: 7,
      mpAddMax: 11
    }
  };
  CHARACTER_SKILL_BOOK.sasuke.slots[0].skill = {
    id: 'sasuke-chidori',
    name: '⚡ CHIDORI',
    em: '⚡',
    level: 1,
    baseDamage: 35,
    damagePerLevel: 0,
    baseMpCost: 11,
    mpCostPerLevel: 0,
    baseDuration: 25,
    durationPerLevel: 0,
    cooldownSeconds: 25,
    effect: '-',
    buff: '-',
    upgradeCost: { scrolls: 10, crystals: 7 },
    upgradeRules: {
      resourceAddMin: 10,
      resourceAddMax: 30,
      damageAddMin: 19,
      damageAddMax: 28,
      mpAddMin: 7,
      mpAddMax: 11
    }
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const DEFAULT_UPGRADE_COST = { scrolls: 5, crystals: 3 };
  const toNumber = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
  const randomInt = (min, max) => {
    const safeMin = Math.ceil(toNumber(min, 0));
    const safeMax = Math.floor(toNumber(max, safeMin));
    if (safeMax <= safeMin) return safeMin;
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  };

  function buildSkillStats(skill) {
    const level = Math.max(1, toNumber(skill.level, 1));
    const baseDamage = toNumber(skill.baseDamage, toNumber(skill.damage, 80));
    const damagePerLevel = toNumber(skill.damagePerLevel, Math.max(8, Math.round(baseDamage * 0.12)));
    const baseMpCost = toNumber(skill.baseMpCost, toNumber(skill.mpCost, 12));
    const mpCostPerLevel = toNumber(skill.mpCostPerLevel, 1);
    const baseDuration = toNumber(skill.baseDuration, toNumber(skill.duration, 6));
    const durationPerLevel = toNumber(skill.durationPerLevel, 1);
    const effect = String(skill.effect || 'Sin efecto');
    const buff = String(skill.buff || 'Sin buff');
    const rules = skill.upgradeRules || null;

    const current = {
      damage: baseDamage + ((level - 1) * damagePerLevel),
      mpCost: baseMpCost + ((level - 1) * mpCostPerLevel),
      duration: baseDuration + ((level - 1) * durationPerLevel),
      effect,
      buff
    };

    const nextNumeric = {
      damage: current.damage + damagePerLevel,
      mpCost: current.mpCost + mpCostPerLevel,
      duration: current.duration + durationPerLevel,
      effect: `${effect} +`,
      buff: `${buff} +`
    };

    const next = { ...nextNumeric };
    if (rules) {
      const minDamageAdd = Math.max(0, toNumber(rules.damageAddMin, 0));
      const maxDamageAdd = Math.max(minDamageAdd, toNumber(rules.damageAddMax, minDamageAdd));
      const minDamagePercent = Math.max(0, toNumber(rules.damageAddPercentMin, 0));
      const maxDamagePercent = Math.max(minDamagePercent, toNumber(rules.damageAddPercentMax, minDamagePercent));
      const minMpAdd = Math.max(0, toNumber(rules.mpAddMin, 0));
      const maxMpAdd = Math.max(minMpAdd, toNumber(rules.mpAddMax, minMpAdd));
      if (maxDamagePercent > 0) {
        const dmgMin = Math.round(current.damage * (1 + (minDamagePercent / 100)));
        const dmgMax = Math.round(current.damage * (1 + (maxDamagePercent / 100)));
        next.damage = dmgMin === dmgMax ? `${dmgMin}` : `${dmgMin} ~ ${dmgMax}`;
      } else {
        next.damage = minDamageAdd === maxDamageAdd
          ? `${current.damage + minDamageAdd}`
          : `${current.damage + minDamageAdd} ~ ${current.damage + maxDamageAdd}`;
      }
      next.mpCost = minMpAdd === maxMpAdd
        ? `${current.mpCost + minMpAdd}`
        : `${current.mpCost + minMpAdd} ~ ${current.mpCost + maxMpAdd}`;
      next.duration = durationPerLevel > 0
        ? `${nextNumeric.duration}s`
        : `${current.duration}s`;
      next.effect = `${effect} +`;
      next.buff = `${buff} +`;
    }

    return { level, current, next, nextNumeric };
  }

  const JutsuSystem = {
    host: null,
    root: null,
    state: {
      activeCharacterId: null,
      byCharacter: deepClone(CHARACTER_SKILL_BOOK),
      resources: {
        scrolls: 30,
        crystals: 25
      },
      selectedSkillIndex: null
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

      const closeBtn = this.root.querySelector('#jsuSkillModalClose');
      const modal = this.root.querySelector('#jsuSkillModal');
      const upgradeBtn = this.root.querySelector('#jsuUpgradeBtn');
      const equipBtn = this.root.querySelector('#jsuEquipBtn');
      closeBtn?.addEventListener('click', () => this.closeSkillModal());
      modal?.addEventListener('click', (event) => {
        if (event.target === modal) this.closeSkillModal();
      });
      upgradeBtn?.addEventListener('click', () => this.upgradeSelectedSkill());
      equipBtn?.addEventListener('click', () => this.toggleEquipSelectedSkill());

      window.addEventListener('ngs:hero-stats-updated', this.handleHeroChange);
    },

    handleHeroChange: () => {
      if (!window.JutsuSystem || !window.JutsuSystem.isMounted()) return;
      window.JutsuSystem.syncActiveCharacter();
      window.JutsuSystem.render();
    },

    buildSkillPayload(skill) {
      if (!skill || typeof skill !== 'object') return null;
      const stats = buildSkillStats(skill);
      return {
        id: skill.id,
        name: skill.name,
        em: skill.em,
        damage: stats.current.damage,
        mpCost: stats.current.mpCost,
        duration: stats.current.duration,
        cooldownSeconds: toNumber(skill.cooldownSeconds, stats.current.duration || 13),
        burnPercent: toNumber(skill.burnPercent, 0),
        burnSeconds: toNumber(skill.burnSeconds, 0),
        atkBuffPercent: toNumber(skill.atkBuffPercent, 0),
        atkBuffSeconds: toNumber(skill.atkBuffSeconds, 0),
        cloneLifetimeSeconds: toNumber(skill.cloneLifetimeSeconds, 0),
        cloneCount: toNumber(skill.cloneCount, 0),
        cloneStatMultiplier: toNumber(skill.cloneStatMultiplier, 0),
        aiRetryDelaySeconds: toNumber(skill.aiRetryDelaySeconds, 0),
        ritualSeconds: toNumber(skill.ritualSeconds, 0),
        enemyStopSeconds: toNumber(skill.enemyStopSeconds, 0),
        selfHpPercentCost: toNumber(skill.selfHpPercentCost, 0),
        amaterasuSlowMo: toNumber(skill.amaterasuSlowMo, 0.30),
        amaterasuDarkness: toNumber(skill.amaterasuDarkness, 0.45),
        defBuffPercent: toNumber(skill.defBuffPercent, 0),
        transformDurationSeconds: toNumber(skill.transformDurationSeconds, 0),
        aiUseChance: toNumber(skill.aiUseChance, 0)
      };
    },

    getEquippedSkills() {
      const current = this.getActiveCharacterConfig();
      if (!current) return [];
      return current.equipped
        .map((skill) => this.buildSkillPayload(skill))
        .filter(Boolean);
    },

    getEquippedSkillSlots() {
      const current = this.getActiveCharacterConfig();
      if (!current) return [];
      return current.equipped.map((skill) => this.buildSkillPayload(skill));
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
      this.state.selectedSkillIndex = leftSlotIndex;
      this.renderSkillModal();
      const modal = this.root.querySelector('#jsuSkillModal');
      modal?.classList.add('is-open');
      modal?.setAttribute('aria-hidden', 'false');
    },

    unequipSlot(slotIndex) {
      const current = this.getActiveCharacterConfig();
      if (!current || Number.isNaN(slotIndex) || slotIndex < 0 || slotIndex >= current.equipped.length) return;

      const equippedSkill = current.equipped[slotIndex];
      if (!equippedSkill) return;

      current.equipped[slotIndex] = null;
      this.setStatus(`✕ ${equippedSkill.name} removida del círculo ${slotIndex + 1}`);
      this.renderSlots();
    },

    render() {
      this.renderCharacterLabel();
      this.renderResources();
      this.renderLibrary();
      this.renderSlots();
      this.renderSkillModal();
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

    renderResources() {
      const scrollsEl = this.root.querySelector('#jsuScrolls');
      const crystalsEl = this.root.querySelector('#jsuCrystals');
      if (scrollsEl) scrollsEl.textContent = String(this.state.resources.scrolls);
      if (crystalsEl) crystalsEl.textContent = String(this.state.resources.crystals);
    },

    getSelectedSkillData() {
      const current = this.getActiveCharacterConfig();
      const idx = this.state.selectedSkillIndex;
      if (!current || idx == null) return null;
      const slotData = current.slots[idx];
      const skill = slotData?.skill;
      if (!skill) return null;
      return { current, idx, slotData, skill };
    },

    isSkillEquipped(skillId) {
      const current = this.getActiveCharacterConfig();
      if (!current) return false;
      return current.equipped.some((skill) => skill?.id === skillId);
    },

    renderSkillModal() {
      const data = this.getSelectedSkillData();
      if (!data) return;
      const { slotData, skill } = data;
      const stats = buildSkillStats(skill);
      const upgradeCost = skill.upgradeCost || DEFAULT_UPGRADE_COST;
      const isEquipped = this.isSkillEquipped(skill.id);

      this.root.querySelector('#jsuModalSkillIcon').textContent = skill.em || '✦';
      this.root.querySelector('#jsuModalSkillName').textContent = `${skill.name || 'Habilidad'} · Nv.${stats.level}`;
      this.root.querySelector('#jsuModalSkillSlot').textContent = slotData.key || 'slot';

      this.root.querySelector('#jsuStatDamage').textContent = stats.current.damage;
      this.root.querySelector('#jsuStatMp').textContent = stats.current.mpCost;
      this.root.querySelector('#jsuStatEffect').textContent = stats.current.effect;
      this.root.querySelector('#jsuStatBuff').textContent = stats.current.buff;
      this.root.querySelector('#jsuStatDuration').textContent = `${stats.current.duration}s`;

      this.root.querySelector('#jsuStatDamageNext').textContent = stats.next.damage;
      this.root.querySelector('#jsuStatMpNext').textContent = stats.next.mpCost;
      this.root.querySelector('#jsuStatEffectNext').textContent = stats.next.effect;
      this.root.querySelector('#jsuStatBuffNext').textContent = stats.next.buff;
      this.root.querySelector('#jsuStatDurationNext').textContent = String(stats.next.duration);

      this.root.querySelector('#jsuUpgradeScrollCost').textContent = String(upgradeCost.scrolls || 0);
      this.root.querySelector('#jsuUpgradeCrystalCost').textContent = String(upgradeCost.crystals || 0);
      this.root.querySelector('#jsuEquipBtn').textContent = isEquipped ? 'QUITAR' : 'EQUIPAR';
    },

    closeSkillModal() {
      const modal = this.root.querySelector('#jsuSkillModal');
      modal?.classList.remove('is-open');
      modal?.setAttribute('aria-hidden', 'true');
      this.state.selectedSkillIndex = null;
    },

    upgradeSelectedSkill() {
      const data = this.getSelectedSkillData();
      if (!data) return;
      const { skill } = data;
      const upgradeCost = skill.upgradeCost || DEFAULT_UPGRADE_COST;
      const neededScrolls = toNumber(upgradeCost.scrolls, 0);
      const neededCrystals = toNumber(upgradeCost.crystals, 0);

      if (this.state.resources.scrolls < neededScrolls || this.state.resources.crystals < neededCrystals) {
        this.setStatus('⚠️ No tienes suficientes 📜 y 💠 para mejorar.');
        return;
      }

      this.state.resources.scrolls -= neededScrolls;
      this.state.resources.crystals -= neededCrystals;
      skill.level = Math.max(1, toNumber(skill.level, 1) + 1);
      if (skill.upgradeRules) {
        const r = skill.upgradeRules;
        const addScrolls = randomInt(r.resourceAddMin, r.resourceAddMax);
        const addCrystals = randomInt(r.resourceAddMin, r.resourceAddMax);
        const addDamage = (r.damageAddPercentMin != null || r.damageAddPercentMax != null)
          ? Math.max(1, Math.round(toNumber(skill.baseDamage, 0) * (randomInt(r.damageAddPercentMin, r.damageAddPercentMax) / 100)))
          : randomInt(r.damageAddMin, r.damageAddMax);
        const addMpCost = randomInt(r.mpAddMin, r.mpAddMax);
        skill.baseDamage = toNumber(skill.baseDamage, 0) + addDamage;
        skill.baseMpCost = toNumber(skill.baseMpCost, 0) + addMpCost;
        if (!skill.upgradeCost) skill.upgradeCost = { ...DEFAULT_UPGRADE_COST };
        skill.upgradeCost.scrolls = toNumber(skill.upgradeCost.scrolls, 0) + addScrolls;
        skill.upgradeCost.crystals = toNumber(skill.upgradeCost.crystals, 0) + addCrystals;
      }

      this.renderResources();
      this.renderSkillModal();
      this.setStatus(`✨ ${skill.name} mejorada a nivel ${skill.level}.`);
    },

    toggleEquipSelectedSkill() {
      const data = this.getSelectedSkillData();
      if (!data) return;
      const { current, skill } = data;
      const equippedIndex = current.equipped.findIndex((equippedSkill) => equippedSkill?.id === skill.id);

      if (equippedIndex >= 0) {
        current.equipped[equippedIndex] = null;
        this.renderSlots();
        this.renderSkillModal();
        this.setStatus(`✕ ${skill.name} removida del círculo ${equippedIndex + 1}`);
        return;
      }

      const firstEmpty = current.equipped.findIndex((value) => value == null);
      const targetIndex = firstEmpty >= 0 ? firstEmpty : current.equipped.length - 1;
      current.equipped[targetIndex] = deepClone(skill);
      this.spawnParticles(targetIndex);
      this.renderSlots();
      this.renderSkillModal();
      this.setStatus(`⬣ ${skill.name} equipada en círculo ${targetIndex + 1}`);
    },

    renderSlots() {
      const current = this.getActiveCharacterConfig();
      if (!current) return;

      for (let i = 0; i < current.equipped.length; i += 1) {
        const skill = current.equipped[i];
        const circle = this.root.querySelector(`#jsuSlot${i}`);
        const em = this.root.querySelector(`#jsuSlotEm${i}`);
        const name = this.root.querySelector(`#jsuSlotName${i}`);

        if (!circle || !em || !name) continue;

        if (skill) {
          circle.classList.remove('empty');
          circle.classList.add('has-skill');
          em.style.fontSize = '22px';
          em.style.opacity = '1';
          em.textContent = skill.em || '✦';
          name.textContent = skill.name || '';
        } else {
          circle.classList.add('empty');
          circle.classList.remove('has-skill', 'shake');
          em.style.fontSize = '16px';
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
      const radius = container.clientWidth / 2;
      for (let i = 0; i < 14; i += 1) {
        const particle = document.createElement('div');
        particle.className = 'jsu-particle';
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const dist = 18 + Math.random() * 26;
        const tx = `${Math.cos(angle) * dist}px`;
        const ty = `${Math.sin(angle) * dist}px`;

        particle.style.cssText = `
          left:${radius + (Math.random() * 12 - 6)}px;
          top:${radius + (Math.random() * 12 - 6)}px;
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
