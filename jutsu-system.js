(function () {
  const ITACHI_JUTSUS = [
    {
      id: 'katon_gokakyu',
      name: 'Katon: Gōkakyū no Jutsu',
      em: '🔥',
      dmg: '-40 HP + quemadura (-2% HP/s por 4s)',
      efecto: 'Quema objetivo y lo persigue hasta impactar',
      buff: '+10% ATK por 5s',
      dur: 'Impacto inmediato + DoT 4s'
    },
    {
      id: 'amaterasu',
      name: 'Amaterasu',
      em: '⚫',
      dmg: '-52 HP + quemadura intensa',
      efecto: 'Llama negra de alta precisión al objetivo',
      buff: 'Reduce movilidad del objetivo',
      dur: 'Impacto directo'
    },
    {
      id: 'yasaka_magatama',
      name: 'Yasaka Magatama',
      em: '🌀',
      dmg: '-45 HP',
      efecto: 'Proyectil espiritual de mediano alcance',
      buff: '+8% ATK por 4s',
      dur: 'Impacto directo'
    },
    {
      id: 'kage_bunshin',
      name: 'Kage Bunshin no Jutsu',
      em: '👥',
      dmg: 'Invoca 2 clones (20% stats)',
      efecto: 'Clones atacan al enemigo hasta morir',
      buff: 'Presión de combate constante',
      dur: 'Invocación persistente'
    },
    {
      id: 'tsukuyomi',
      name: 'Tsukuyomi',
      em: '🌑',
      dmg: '-100 HP + ralentiza 50% por 4s',
      efecto: 'Inmoviliza 4s dentro de esfera ilusoria',
      buff: '+20% ATK por 5s',
      dur: 'Control 4s + buff 5s'
    },
    {
      id: 'shuriken_kage_bunshin',
      name: 'Shuriken Kage Bunshin',
      em: '🗡️',
      dmg: '-38 HP',
      efecto: 'Multiplica proyectiles y aumenta presión ofensiva',
      buff: '+6% velocidad de ataque por 4s',
      dur: 'Impacto directo'
    }
  ];

  const JUTSUS_BY_CHARACTER = {
    itachi: ITACHI_JUTSUS
  };

  const UPGRADE_COSTS = { pergaminos: 15, chakra: 10 };

  const JutsuSystem = {
    host: null,
    root: null,
    selected: null,
    state: {
      activeCharacterId: null,
      levels: {},
      slots: [null, null, null],
      resources: { pergaminos: 120, chakra: 85 }
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
      this.syncActiveCharacter();
      this.bindEvents();
      this.renderLib();
      this.renderSlots();
      this.syncResources();
    },

    unmount() {
      if (!this.host) return;
      this.host.innerHTML = '';
      this.root = null;
      this.selected = null;
    },

    isMounted() {
      return Boolean(this.host && this.root && this.host.contains(this.root));
    },

    syncActiveCharacter() {
      const activeHero = window.CharacterStatsSystem?.getActiveHero?.() || null;
      this.state.activeCharacterId = activeHero?.characterId || null;
      const ids = this.getActiveJutsuLibrary().map((jutsu) => jutsu.id);
      const nextLevels = {};
      ids.forEach((id) => {
        nextLevels[id] = this.state.levels[id] || 1;
      });
      this.state.levels = nextLevels;

      if (!ids.length) {
        this.state.slots = [null, null, null];
        return;
      }
      this.state.slots = this.state.slots.map((slotId) => (ids.includes(slotId) ? slotId : null));
    },

    getActiveJutsuLibrary() {
      return JUTSUS_BY_CHARACTER[this.state.activeCharacterId] || [];
    },

    getJutsuById(id) {
      return this.getActiveJutsuLibrary().find((jutsu) => jutsu.id === id) || null;
    },

    getLvlClass(lv) {
      if (lv >= 10) return 'lv-sennin';
      if (lv >= 6) return 'lv-silver';
      return '';
    },

    bindEvents() {
      this.root.querySelectorAll('.jsu-slot-circle').forEach((slotEl) => {
        slotEl.addEventListener('dragover', (ev) => ev.preventDefault());
        slotEl.addEventListener('drop', (ev) => {
          ev.preventDefault();
          const slot = Number(slotEl.dataset.slot);
          const id = ev.dataTransfer?.getData('jutsuId');
          if (Number.isNaN(slot) || !id) return;
          this.equipInSlot(slot, id);
        });
      });

      const closeBtn = this.root.querySelector('#jsuDetailClose');
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeDetail());

      const upgradeBtn = this.root.querySelector('#jsuUpgradeBtn');
      if (upgradeBtn) upgradeBtn.addEventListener('click', () => this.upgradeSkill());

      const equipBtn = this.root.querySelector('#jsuEquipBtn');
      if (equipBtn) equipBtn.addEventListener('click', () => this.equipFromDetail());
    },

    renderLib() {
      const lib = this.root.querySelector('#jsuSkillLib');
      if (!lib) return;
      lib.innerHTML = '';

      this.syncActiveCharacter();
      const activeLibrary = this.getActiveJutsuLibrary();
      if (!activeLibrary.length) {
        const empty = document.createElement('div');
        empty.className = 'jsu-skill-icon';
        empty.style.gridColumn = '1 / -1';
        empty.style.cursor = 'default';
        empty.innerHTML = `
          <span class="jsu-skill-em">∅</span>
          <span class="jsu-skill-name">Sin habilidades disponibles para este personaje</span>
        `;
        lib.appendChild(empty);
        this.root.querySelector('.jsu-status-txt').textContent = 'Selecciona a ITACHI para ver habilidades';
        return;
      }

      this.root.querySelector('.jsu-status-txt').textContent = 'DRAG → SLOTS · CLICK → DETALLE';
      activeLibrary.forEach((jutsu) => {
        const lv = this.state.levels[jutsu.id] || 1;
        const cls = this.getLvlClass(lv);
        const item = document.createElement('div');
        item.className = `jsu-skill-icon ${cls}`.trim();
        item.draggable = true;
        item.dataset.id = String(jutsu.id);
        item.innerHTML = `
          <span class="jsu-skill-lvl">${lv >= 10 ? '✦' : lv}</span>
          <span class="jsu-skill-em">${jutsu.em}</span>
          <span class="jsu-skill-name">${jutsu.name}</span>
          ${lv >= 10 ? '<span class="jsu-passive-tag">SENNIN</span>' : ''}
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

    openDetail(id) {
      const jutsu = this.getJutsuById(id);
      if (!jutsu) return;
      const lv = this.state.levels[id] || 1;
      this.selected = id;

      const name = this.root.querySelector('#jsuDpName');
      name.textContent = `${jutsu.em} ${jutsu.name}`;
      name.classList.toggle('gold', lv >= 10);

      this.root.querySelector('#jsuDpDmg').textContent = jutsu.dmg;
      this.root.querySelector('#jsuDpEfecto').textContent = jutsu.efecto;
      this.root.querySelector('#jsuDpBuff').textContent = jutsu.buff;
      this.root.querySelector('#jsuDpDur').textContent = jutsu.dur;

      const passive = this.root.querySelector('#jsuDpPassive');
      passive.style.display = lv >= 10 ? 'block' : 'none';

      this.root.querySelector('#jsuDpLvlNum').textContent = `Lv ${lv >= 10 ? 'MAX' : lv}`;
      this.root.querySelector('#jsuDpBar').style.width = `${Math.min((lv / 10) * 100, 100)}%`;
      this.root.querySelector('#jsuUpgradeMsg').textContent = '';

      const upgradeBtn = this.root.querySelector('#jsuUpgradeBtn');
      upgradeBtn.disabled = lv >= 10;
      upgradeBtn.textContent = lv < 10
        ? `⬆ Mejorar (📜${UPGRADE_COSTS.pergaminos} 💠${UPGRADE_COSTS.chakra})`
        : '✦ Nivel Máximo';

      this.root.querySelector('#jsuDetailPanel').classList.add('visible');
    },

    closeDetail() {
      this.root.querySelector('#jsuDetailPanel').classList.remove('visible');
      this.selected = null;
    },

    syncResources() {
      this.root.querySelector('#jsuPergaminos').textContent = String(this.state.resources.pergaminos);
      this.root.querySelector('#jsuChakraRes').textContent = String(this.state.resources.chakra);
    },

    upgradeSkill() {
      if (this.selected == null) return;
      const id = this.selected;
      const lv = this.state.levels[id] || 1;
      if (lv >= 10) return;

      const { pergaminos, chakra } = this.state.resources;
      if (pergaminos < UPGRADE_COSTS.pergaminos || chakra < UPGRADE_COSTS.chakra) {
        this.root.querySelector('#jsuUpgradeMsg').textContent = '¡Recursos insuficientes!';
        return;
      }

      this.state.resources.pergaminos -= UPGRADE_COSTS.pergaminos;
      this.state.resources.chakra -= UPGRADE_COSTS.chakra;
      this.state.levels[id] = lv + 1;

      this.syncResources();
      this.setStatus(`⬆ ${this.getJutsuById(id)?.name || 'Jutsu'} mejorado → Lv ${this.state.levels[id]}`);
      this.openDetail(id);
      this.renderLib();
      this.renderSlots();
    },

    equipFromDetail() {
      if (this.selected == null) return;
      const id = this.selected;
      const empty = this.state.slots.indexOf(null);

      if (empty >= 0) {
        this.state.slots[empty] = id;
        this.renderSlots();
        this.spawnParticles(empty);
        this.setStatus(`⬣ ${this.getJutsuById(id)?.name || 'Jutsu'} equipado en slot ${empty + 1}`);
      } else {
        this.state.slots[2] = id;
        this.renderSlots();
        this.shakeSlot(2);
        this.spawnParticles(2);
        this.setStatus('⬣ Reemplazado en Jutsu Terciario');
      }

      this.closeDetail();
    },

    equipInSlot(slot, id) {
      if (!this.getJutsuById(id)) return;
      const allFull = this.state.slots.every((s) => s !== null);
      if (allFull && slot !== 2) {
        this.shakeSlot(2);
        this.state.slots[2] = id;
      } else {
        this.state.slots[slot] = id;
      }

      this.renderSlots();
      this.spawnParticles(slot);
      this.setStatus(`⬣ ${this.getJutsuById(id)?.name || 'Jutsu'} equipado`);
    },

    renderSlots() {
      this.syncActiveCharacter();
      for (let i = 0; i < 3; i += 1) {
        const id = this.state.slots[i];
        const circle = this.root.querySelector(`#jsuSlot${i}`);
        const em = this.root.querySelector(`#jsuSlotEm${i}`);
        const name = this.root.querySelector(`#jsuSlotName${i}`);

        if (id != null && this.getJutsuById(id)) {
          const jutsu = this.getJutsuById(id);
          circle.classList.remove('empty');
          circle.classList.add('has-skill');
          em.style.fontSize = '28px';
          em.style.opacity = '1';
          em.textContent = jutsu.em;
          name.textContent = jutsu.name;
          circle.onclick = () => this.openDetail(id);
        } else {
          this.state.slots[i] = null;
          circle.classList.add('empty');
          circle.classList.remove('has-skill', 'shake');
          em.style.fontSize = '20px';
          em.style.opacity = '0.25';
          em.textContent = '✦';
          name.textContent = '';
          circle.onclick = null;
        }
      }
    },

    shakeSlot(slot) {
      const el = this.root.querySelector(`#jsuSlot${slot}`);
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
      el.textContent = msg;
      setTimeout(() => {
        el.textContent = '';
      }, 2800);
    },

    getBattleLoadout(characterId) {
      const lib = JUTSUS_BY_CHARACTER[characterId] || [];
      if (!lib.length) return [];
      if (this.state.activeCharacterId !== characterId) return [];
      const ids = new Set(lib.map((skill) => skill.id));
      return this.state.slots
        .filter((id) => ids.has(id))
        .map((id) => lib.find((skill) => skill.id === id))
        .filter(Boolean);
    }
  };

  window.JutsuSystem = JutsuSystem;
}());
