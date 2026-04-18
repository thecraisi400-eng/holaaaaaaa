(function () {
  const JUTSU_LIBRARY = [
    { id: 0, name: 'Llama Voraz', em: '🔥', dmg: 'Fuego DOT (quemadura continua)', efecto: 'Ceguera — -30% puntería', buff: '+10% Ataque físico', dur: '3s' },
    { id: 1, name: 'Rayo Destellante', em: '⚡', dmg: 'Eléctrico (descarga masiva)', efecto: 'Parálisis — -80% velocidad', buff: '+15% Evasión', dur: '2s' },
    { id: 2, name: 'Ráfaga Cortante', em: '🌀', dmg: 'Corte (laceración profunda)', efecto: 'Hemorragia — daño por tiempo', buff: '+Velocidad de ataque', dur: '2s' },
    { id: 3, name: 'Prisión Hidráulica', em: '💧', dmg: 'Presión (aplastamiento acuático)', efecto: 'Asfixia — bloquea habilidades', buff: '-CD Tiempos de espera', dur: '3s' },
    { id: 4, name: 'Escudo Telúrico', em: '🪨', dmg: 'Impacto (golpe sísmico)', efecto: 'Pesadez — sin saltos', buff: 'Inmunidad a empujones', dur: '3s' },
    { id: 5, name: 'Sello Prohibido', em: '🔮', dmg: 'Espiritual (devastación arcana)', efecto: 'Silencio — bloquea especiales', buff: '+5% Chakra pasivo', dur: '2s' }
  ];

  const UPGRADE_COSTS = { pergaminos: 15, chakra: 10 };

  const JutsuSystem = {
    host: null,
    root: null,
    selected: null,
    state: {
      levels: Array(JUTSU_LIBRARY.length).fill(1),
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

    bindEvents() {
      this.root.querySelectorAll('.jsu-slot-circle').forEach((slotEl) => {
        slotEl.addEventListener('dragover', (ev) => ev.preventDefault());
        slotEl.addEventListener('drop', (ev) => {
          ev.preventDefault();
          const slot = Number(slotEl.dataset.slot);
          const id = Number(ev.dataTransfer?.getData('jutsuId'));
          if (Number.isNaN(slot) || Number.isNaN(id)) return;
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

    getLvlClass(lv) {
      if (lv >= 10) return 'lv-sennin';
      if (lv >= 6) return 'lv-silver';
      return '';
    },

    renderLib() {
      const lib = this.root.querySelector('#jsuSkillLib');
      if (!lib) return;
      lib.innerHTML = '';

      JUTSU_LIBRARY.forEach((jutsu) => {
        const lv = this.state.levels[jutsu.id];
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
      const jutsu = JUTSU_LIBRARY[id];
      if (!jutsu) return;
      const lv = this.state.levels[id];
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
      const lv = this.state.levels[id];
      if (lv >= 10) return;

      const { pergaminos, chakra } = this.state.resources;
      if (pergaminos < UPGRADE_COSTS.pergaminos || chakra < UPGRADE_COSTS.chakra) {
        this.root.querySelector('#jsuUpgradeMsg').textContent = '¡Recursos insuficientes!';
        return;
      }

      this.state.resources.pergaminos -= UPGRADE_COSTS.pergaminos;
      this.state.resources.chakra -= UPGRADE_COSTS.chakra;
      this.state.levels[id] += 1;

      this.syncResources();
      this.setStatus(`⬆ ${JUTSU_LIBRARY[id].name} mejorado → Lv ${this.state.levels[id]}`);
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
        this.setStatus(`⬣ ${JUTSU_LIBRARY[id].name} equipado en slot ${empty + 1}`);
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
      const allFull = this.state.slots.every((s) => s !== null);
      if (allFull && slot !== 2) {
        this.shakeSlot(2);
        this.state.slots[2] = id;
      } else {
        this.state.slots[slot] = id;
      }

      this.renderSlots();
      this.spawnParticles(slot);
      this.setStatus(`⬣ ${JUTSU_LIBRARY[id].name} equipado`);
    },

    renderSlots() {
      for (let i = 0; i < 3; i += 1) {
        const id = this.state.slots[i];
        const circle = this.root.querySelector(`#jsuSlot${i}`);
        const em = this.root.querySelector(`#jsuSlotEm${i}`);
        const name = this.root.querySelector(`#jsuSlotName${i}`);

        if (id != null) {
          const jutsu = JUTSU_LIBRARY[id];
          circle.classList.remove('empty');
          circle.classList.add('has-skill');
          em.style.fontSize = '28px';
          em.style.opacity = '1';
          em.textContent = jutsu.em;
          name.textContent = jutsu.name;
          circle.onclick = () => this.openDetail(id);
        } else {
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

    getEquippedJutsus() {
      return this.state.slots
        .map((id) => (id == null ? null : JUTSU_LIBRARY[id]))
        .filter(Boolean)
        .map((jutsu) => ({ ...jutsu }));
    }
  };

  window.JutsuSystem = JutsuSystem;
}());
