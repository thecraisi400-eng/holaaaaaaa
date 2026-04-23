(function attachBotonHeroe(global) {
  const SLOT_META = {
    cabeza: { icon: '🪖', nombre: 'Cabeza', key: 'cabeza', perLevel: { atk: 0.3, crt: 0.02, res: 0.8 } },
    pecho: { icon: '🧥', nombre: 'Pecho', key: 'pecho', perLevel: { def: 0.4, res: 0.8 } },
    manos: { icon: '✋', nombre: 'Manos', key: 'manos', perLevel: { atk: 0.3, spd: 0.1, crt: 0.02 } },
    piernas: { icon: '🦵', nombre: 'Piernas', key: 'piernas', perLevel: { def: 0.3, spd: 0.1, eva: 0.01 } },
    pies: { icon: '👟', nombre: 'Pies', key: 'pies', perLevel: { spd: 0.15, eva: 0.015, res: 0.3 } },
    accesorios: { icon: '📿', nombre: 'Accesorios', key: 'accesorios', perLevel: { crt: 0.03, eva: 0.015, atk: 0.2 } },
  };

  const RANGE_COSTS = [
    { min: 1, max: 6, totalCost: 240 },
    { min: 6, max: 15, totalCost: 2376 },
    { min: 15, max: 30, totalCost: 16250 },
    { min: 30, max: 45, totalCost: 41040 },
    { min: 45, max: 60, totalCost: 76320 },
  ];

  const SLOT_ORDER = ['cabeza', 'pecho', 'manos', 'piernas', 'pies', 'accesorios'];

  const fmt = {
    num: (v) => Number(v).toLocaleString('es-ES', { maximumFractionDigits: 2 }),
    pct: (v) => `${Number(v).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}%`,
  };

  function getSlotRankClass(level) {
    if (level >= 45) return 'rango-amarillo';
    if (level >= 30) return 'rango-morado';
    if (level >= 15) return 'rango-azul';
    if (level >= 6) return 'rango-verde';
    return 'rango-gris';
  }

  function getCostForLevel(level) {
    const tier = RANGE_COSTS.find((r) => level >= r.min && level < r.max);
    if (!tier) return 0;
    const steps = tier.max - tier.min;
    return Math.round(tier.totalCost / steps);
  }

  function statLine(perLevel, levels) {
    const lines = [];
    Object.entries(perLevel).forEach(([k, v]) => {
      const gain = v * levels;
      if (k === 'crt' || k === 'eva') lines.push(`${k.toUpperCase()} +${fmt.pct(gain)}`);
      else lines.push(`${k.toUpperCase()} +${fmt.num(gain)}`);
    });
    return lines.join(' | ');
  }

  function ensureStyles() {
    if (document.getElementById('heroe-panel-style')) return;
    const st = document.createElement('style');
    st.id = 'heroe-panel-style';
    st.textContent = `
      .heroe-panel, .heroe-panel * { box-sizing: border-box; }
      .heroe-panel {
        width: 100%;
        height: 100%;
        max-width: 355px;
        max-height: 500px;
        margin: 0;
        background: rgba(255,255,255,0.06);
        border: 2px solid rgba(255,255,255,0.85);
        color: #fff;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 7px;
        overflow: hidden;
      }
      .heroe-top { display: grid; grid-template-columns: 84px 1fr; gap: 8px; min-height: 82px; }
      .heroe-avatar { border: 2px solid #fff; border-radius: 8px; background: rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:38px; }
      .heroe-basic { display:flex; flex-direction:column; gap:4px; min-width:0; }
      .heroe-rank { font-weight:700; color:#ffe680; font-size:13px; letter-spacing:.4px; }
      .bar-box { display:flex; flex-direction:column; gap:2px; }
      .bar-head { font-size:11px; display:flex; justify-content:space-between; }
      .bar-track { height: 8px; border-radius: 6px; background: rgba(255,255,255,0.2); overflow:hidden; }
      .bar-fill { height:100%; }
      .hp-fill { background: linear-gradient(90deg,#aa0000,#ff4444); }
      .mp-fill { background: linear-gradient(90deg,#1454ff,#3bc3ff); }
      .exp-fill { background: linear-gradient(90deg,#c79800,#ffe066); }
      .stats-card { background: rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.3); border-radius:8px; padding:6px; }
      .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 8px; font-size:12px; }
      .equip-title{ font-size:12px; font-weight:700; }
      .equip-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:6px; flex:1; min-height:175px; }
      .slot-btn{ border:none; border-radius:8px; color:#fff; padding:6px 5px; font-size:11px; cursor:pointer; min-height:52px; }
      .slot-btn span{ display:block; }
      .slot-btn .lvl{ font-size:10px; opacity:.9; margin-top:3px; }
      .rango-gris { background:#6b7280; }
      .rango-verde { background:#1f9d55; }
      .rango-azul { background:#2b6ee6; }
      .rango-morado { background:#7a3db8; }
      .rango-amarillo { background:#d0a60d; color:#1c1500; }
      .upgrade-overlay{ position:absolute; inset:0; background:rgba(0,0,0,.65); display:none; align-items:center; justify-content:center; }
      .upgrade-overlay.show{ display:flex; }
      .upgrade-card{ width: 320px; max-width:94%; background:#fff; color:#111827; border-radius:10px; padding:10px; }
      .upgrade-card h3{ font-size:14px; margin-bottom:6px; }
      .upgrade-line{ font-size:12px; margin:4px 0; }
      .upgrade-actions{ display:flex; gap:6px; margin-top:8px; }
      .upgrade-actions button{ flex:1; border:none; border-radius:6px; padding:7px 8px; font-weight:700; cursor:pointer; }
      .btn-up{ background:#16a34a; color:#fff; }
      .btn-close{ background:#374151; color:#fff; }
    `;
    document.head.appendChild(st);
  }

  function computeEquipmentBonus(equipLevels) {
    return SLOT_ORDER.reduce((acc, key) => {
      const cfg = SLOT_META[key];
      const lvl = equipLevels[key] || 1;
      const upgrades = Math.max(0, lvl - 1);
      Object.entries(cfg.perLevel).forEach(([stat, perLvl]) => {
        acc[stat] = (acc[stat] || 0) + (perLvl * upgrades);
      });
      return acc;
    }, {});
  }

  function createHeroRenderer() {
    ensureStyles();

    return function renderHero(container, state) {
      if (!container) return;
      if (!state.hero) {
        state.hero = {
          nombre: 'Uzumaki Naruto',
          rango: 'CHUNIN',
          oro: state.gold || 4320,
          baseStats: { atk: 1240, def: 880, spd: 320, crt: 11.2, eva: 6.7, res: 540 },
          equipment: { cabeza: 1, pecho: 1, manos: 1, piernas: 1, pies: 1, accesorios: 1 },
        };
      }

      const bonus = computeEquipmentBonus(state.hero.equipment);
      const heroStats = {
        atk: state.hero.baseStats.atk + (bonus.atk || 0),
        def: state.hero.baseStats.def + (bonus.def || 0),
        spd: state.hero.baseStats.spd + (bonus.spd || 0),
        crt: state.hero.baseStats.crt + (bonus.crt || 0),
        eva: state.hero.baseStats.eva + (bonus.eva || 0),
        res: state.hero.baseStats.res + (bonus.res || 0),
      };

      const hpPct = Math.round((state.hp / state.hpMax) * 100);
      const mpPct = Math.round((state.mp / state.mpMax) * 100);
      const expPct = Math.round((state.exp / state.expMax) * 100);

      container.innerHTML = `
        <div class="heroe-panel">
          <div class="heroe-top">
            <div class="heroe-avatar">🥷</div>
            <div class="heroe-basic">
              <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${state.hero.nombre}</div>
              <div class="heroe-rank">🏅 Rango actual: ${state.hero.rango}</div>
              <div class="bar-box"><div class="bar-head"><span>❤️ HP ${state.hp}/${state.hpMax}</span><span>${hpPct}%</span></div><div class="bar-track"><div class="bar-fill hp-fill" style="width:${hpPct}%"></div></div></div>
              <div class="bar-box"><div class="bar-head"><span>💧 MP ${state.mp}/${state.mpMax}</span><span>${mpPct}%</span></div><div class="bar-track"><div class="bar-fill mp-fill" style="width:${mpPct}%"></div></div></div>
              <div class="bar-box"><div class="bar-head"><span>✨ EXP ${fmt.num(state.exp)}/${fmt.num(state.expMax)}</span><span>${expPct}%</span></div><div class="bar-track"><div class="bar-fill exp-fill" style="width:${expPct}%"></div></div></div>
            </div>
          </div>

          <div class="stats-card">
            <div style="font-size:12px;font-weight:700;margin-bottom:4px;">📊 Estadísticas actuales</div>
            <div class="stats-grid">
              <div>⚔️ ATK: <b>${fmt.num(heroStats.atk)}</b></div>
              <div>🛡️ DEF: <b>${fmt.num(heroStats.def)}</b></div>
              <div>💨 SPD: <b>${fmt.num(heroStats.spd)}</b></div>
              <div>💥 CRT: <b>${fmt.pct(heroStats.crt)}</b></div>
              <div>🌀 EVA: <b>${fmt.pct(heroStats.eva)}</b></div>
              <div>🧱 RES: <b>${fmt.num(heroStats.res)}</b></div>
            </div>
          </div>

          <div class="equip-title">🧰 Equipamiento actual (toca para mejorar)</div>
          <div class="equip-grid">
            ${SLOT_ORDER.map((slot) => {
              const cfg = SLOT_META[slot];
              const lvl = state.hero.equipment[slot];
              return `<button class="slot-btn ${getSlotRankClass(lvl)}" data-slot="${slot}"><span>${cfg.icon} ${cfg.nombre}</span><span class="lvl">Nivel ${lvl}</span></button>`;
            }).join('')}
          </div>
        </div>
        <div class="upgrade-overlay" id="upgradeOverlay"></div>
      `;

      const overlay = container.querySelector('#upgradeOverlay');

      function openUpgrade(slotKey) {
        const cfg = SLOT_META[slotKey];
        const currentLevel = state.hero.equipment[slotKey];
        const nextLevel = Math.min(60, currentLevel + 1);
        const canUpgrade = currentLevel < 60;
        const cost = canUpgrade ? getCostForLevel(currentLevel) : 0;

        overlay.innerHTML = `
          <div class="upgrade-card">
            <h3>${cfg.icon} ${cfg.nombre} — Mejora</h3>
            <div class="upgrade-line">Nivel actual: <b>${currentLevel}</b></div>
            <div class="upgrade-line">Próximo nivel: <b>${nextLevel}</b></div>
            <div class="upgrade-line">Ganancia por mejora: <b>${statLine(cfg.perLevel, canUpgrade ? 1 : 0)}</b></div>
            <div class="upgrade-line">Costo de oro: <b>💰 ${fmt.num(cost)}</b></div>
            <div class="upgrade-line">Tu oro actual: <b>💰 ${fmt.num(state.hero.oro)}</b></div>
            <div class="upgrade-actions">
              <button class="btn-up" ${(!canUpgrade || state.hero.oro < cost) ? 'disabled' : ''}>Mejorar</button>
              <button class="btn-close">Cerrar</button>
            </div>
          </div>
        `;

        overlay.classList.add('show');
        overlay.querySelector('.btn-close').addEventListener('click', () => overlay.classList.remove('show'));

        const upBtn = overlay.querySelector('.btn-up');
        if (upBtn) {
          upBtn.addEventListener('click', () => {
            if (!canUpgrade || state.hero.oro < cost) return;
            state.hero.oro -= cost;
            state.hero.equipment[slotKey] = nextLevel;
            state.gold = state.hero.oro;
            const goldEl = document.getElementById('statGold');
            if (goldEl) goldEl.textContent = fmt.num(state.gold);
            renderHero(container, state);
          });
        }
      }

      container.querySelectorAll('.slot-btn').forEach((btn) => {
        btn.addEventListener('click', () => openUpgrade(btn.dataset.slot));
      });

      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) overlay.classList.remove('show');
      });
    };
  }

  global.createHeroRenderer = createHeroRenderer;
})(window);
