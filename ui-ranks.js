(() => {
  let styleInjected = false;

  function injectStyle() {
    if (styleInjected) return;
    styleInjected = true;
    const style = document.createElement('style');
    style.id = 'arb-ranks-style';
    style.textContent = `
      #hud-center-content .arb-center-inner { width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; min-width:0; min-height:0; overflow:hidden; }
      #hud-center-content .arb-center-inner img { width:100%; height:100%; object-fit:contain; }
      .arb-gp{width:min(100%,355px);height:min(100%,500px);background:transparent;position:relative;overflow:hidden;border:1px solid rgba(63,168,255,.12);border-radius:6px;display:flex;flex-direction:column;--rc:#3fa8ff;color:#c9d4e8;font-family:'Courier New',Courier,monospace}
      .arb-hdr{flex-shrink:0;height:36px;background:#131a26;border-bottom:1px solid rgba(63,168,255,.08);display:flex;align-items:center;justify-content:space-between;padding:0 8px}
      .arb-mini{font-size:7px;color:#3d5070;text-transform:uppercase;letter-spacing:1px}
      .arb-pts{font-size:14px;font-weight:900;color:#3fa8ff;letter-spacing:2px;min-width:42px;text-align:right}
      .arb-tl{display:flex;gap:4px;align-items:center}
      .arb-rpip{width:26px;height:26px;border-radius:50%;background:#162035;border:1.5px solid #3d5070;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#3d5070;cursor:pointer;user-select:none}
      .arb-rpip.done{border-color:#ffd700;color:#ffd700}
      .arb-rpip.cur{border-color:var(--rc);color:var(--rc);box-shadow:0 0 8px var(--rc)}
      .arb-rpip.future{opacity:.35;cursor:not-allowed}
      .arb-body{flex:1;display:flex;overflow:hidden}
      .arb-stats{flex-shrink:0;width:82px;background:#131a26;border-right:1px solid rgba(63,168,255,.07);padding:5px 4px;display:flex;flex-direction:column;gap:3px}
      .arb-sr{display:flex;align-items:center;background:#1c2740;border-radius:3px;padding:3px 4px;border:1px solid rgba(63,168,255,.05);gap:2px}
      .arb-sn{font-size:5.5px;color:#3d5070;flex:1;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .arb-sv{font-size:7px;font-weight:700;color:#c9d4e8;min-width:26px;text-align:right}
      .arb-rp{flex:1;display:flex;flex-direction:column;padding:6px;gap:5px}
      .arb-rkhdr{height:42px;background:#131a26;border-radius:6px;padding:5px 8px;border:1px solid rgba(63,168,255,.08);display:flex;flex-direction:column;justify-content:center}
      .arb-rkbadge{font-size:12px;font-weight:900;color:var(--rc)} .arb-rkname{font-size:9px} .arb-rklore{font-size:6.5px;color:#3d5070;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .arb-cnst{flex:1;background:#131a26;border-radius:6px;border:1px solid rgba(63,168,255,.08);position:relative;overflow:hidden}
      .arb-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
      .arb-nw{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer}
      .arb-nd{width:40px;height:40px;border-radius:50%;background:#162035;border:2px solid #3d5070;display:flex;align-items:center;justify-content:center;font-size:20px}
      .arb-nd.act{background:#1c2740;border-color:var(--rc);box-shadow:0 0 22px var(--rc)}
      .arb-nd.avl{border-color:var(--rc)} .arb-nd.sil{opacity:.4} .arb-nd.lck{opacity:.7}
      .arb-nlbl{font-size:5.5px;color:#3d5070}
      .arb-rbonus{height:52px;background:#1c2740;border-radius:6px;border:1px solid rgba(63,168,255,.1);padding:5px 8px;display:flex;align-items:center;gap:8px}
      .arb-syn{height:28px;background:#131a26;border-radius:5px;border:1px solid rgba(63,168,255,.07);padding:0 8px;display:flex;align-items:center;gap:4px}
      .arb-bot{height:34px;background:#131a26;border-top:1px solid rgba(63,168,255,.07);display:flex;align-items:center;justify-content:space-between;padding:0 10px}
      .arb-btn{background:#162035;border:1px solid rgba(63,168,255,.2);color:#3fa8ff;font-size:7.5px;font-family:inherit;padding:4px 10px;border-radius:4px;cursor:pointer}
      .arb-status{font-size:6.5px;color:#3d5070;text-transform:uppercase}
      .arb-ov{display:none;position:absolute;inset:0;background:rgba(8,12,20,.88);z-index:50;flex-direction:column;align-items:center;justify-content:center;gap:10px}
      .arb-ov.show{display:flex}
    `;
    document.head.appendChild(style);
  }

  function createRanksUI({ container }) {
    injectStyle();
    const data = window.ARBOL_RANKS_DATA;
    const engine = window.createRanksEngine(data);
    const { RANKS, POS, EDGES } = data;
    const listeners = [];
    const on = (el, ev, fn, opts) => {
      el.addEventListener(ev, fn, opts);
      listeners.push(() => el.removeEventListener(ev, fn, opts));
    };

    const root = document.createElement('div');
    root.className = 'arb-center-inner';
    root.innerHTML = `
      <div class="arb-gp">
        <div class="arb-hdr"><div><span class="arb-mini">PC</span> <span class="arb-pts" id="arb-pts">0000</span></div><div class="arb-tl" id="arb-tl"></div></div>
        <div class="arb-body">
          <div class="arb-stats">
            <div class="arb-sr"><span>💖</span><span class="arb-sn">VIDA</span><span class="arb-sv" id="arb-hp"></span></div>
            <div class="arb-sr"><span>🗡️</span><span class="arb-sn">FUERZA</span><span class="arb-sv" id="arb-atk"></span></div>
            <div class="arb-sr"><span>🛡️</span><span class="arb-sn">DEF</span><span class="arb-sv" id="arb-def"></span></div>
            <div class="arb-sr"><span>🌪️</span><span class="arb-sn">AGIL</span><span class="arb-sv" id="arb-spd"></span></div>
            <div class="arb-sr"><span>🎯</span><span class="arb-sn">CRIT</span><span class="arb-sv" id="arb-crit"></span></div>
          </div>
          <div class="arb-rp">
            <div class="arb-rkhdr"><div><span class="arb-rkbadge" id="arb-badge"></span> <span class="arb-rkname" id="arb-name"></span></div><div class="arb-rklore" id="arb-lore"></div></div>
            <div class="arb-cnst" id="arb-cnst"><svg class="arb-svg" id="arb-svg"></svg></div>
            <div class="arb-rbonus"><span id="arb-bonus-ico"></span><div><div id="arb-bonus-t"></div><div class="arb-rklore" id="arb-bonus-d"></div></div></div>
            <div class="arb-syn"><span class="arb-mini">SINTONÍA</span><span id="arb-syn"></span></div>
          </div>
        </div>
        <div class="arb-bot"><button class="arb-btn" id="arb-add">⚡ Ganar PC</button><span class="arb-status" id="arb-status">Sistema de Rango Activo</span></div>
        <div class="arb-ov" id="arb-ov"><div id="arb-ov-ttl"></div></div>
      </div>`;
    container.replaceChildren(root);

    const refs = {
      gp: root.querySelector('.arb-gp'), pts: root.querySelector('#arb-pts'), tl: root.querySelector('#arb-tl'),
      hp: root.querySelector('#arb-hp'), atk: root.querySelector('#arb-atk'), def: root.querySelector('#arb-def'), spd: root.querySelector('#arb-spd'), crit: root.querySelector('#arb-crit'),
      badge: root.querySelector('#arb-badge'), name: root.querySelector('#arb-name'), lore: root.querySelector('#arb-lore'), cnst: root.querySelector('#arb-cnst'), svg: root.querySelector('#arb-svg'),
      bonusIco: root.querySelector('#arb-bonus-ico'), bonusT: root.querySelector('#arb-bonus-t'), bonusD: root.querySelector('#arb-bonus-d'), syn: root.querySelector('#arb-syn'), add: root.querySelector('#arb-add'), status: root.querySelector('#arb-status'),
      ov: root.querySelector('#arb-ov'), ovTtl: root.querySelector('#arb-ov-ttl')
    };

    function flashStatus(text) {
      refs.status.textContent = text;
      clearTimeout(refs.status._t);
      refs.status._t = setTimeout(() => { refs.status.textContent = 'Sistema de Rango Activo'; }, 2200);
    }

    function render() {
      const { state } = engine;
      const rank = RANKS[state.viewRank];
      refs.gp.style.setProperty('--rc', rank.color);
      refs.pts.textContent = String(state.pts).padStart(4, '0');
      refs.badge.textContent = `RANGO-${rank.id}`;
      refs.name.textContent = rank.name;
      refs.lore.textContent = rank.lore;
      refs.bonusIco.textContent = rank.bonus.icon;
      refs.bonusT.textContent = rank.bonus.title;
      refs.bonusD.textContent = rank.bonus.desc;
      refs.hp.textContent = state.stats.hp;
      refs.atk.textContent = state.stats.atk;
      refs.def.textContent = state.stats.def;
      refs.spd.textContent = state.stats.spd;
      refs.crit.textContent = state.stats.crit;

      refs.tl.replaceChildren();
      RANKS.forEach((r, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'arb-rpip';
        b.textContent = r.id;
        if (state.done[i]) b.classList.add('done');
        else if (i === state.curRank) b.classList.add('cur');
        else if (i > state.curRank) b.classList.add('future');
        on(b, 'click', () => { engine.setViewRank(i); render(); });
        refs.tl.appendChild(b);
      });

      const done = state.nodes[state.viewRank].filter(Boolean).length;
      refs.syn.textContent = `${done}/5`;
      renderConstellation();
    }

    function renderConstellation() {
      const { state } = engine;
      const rank = RANKS[state.viewRank];
      const rankNodes = state.nodes[state.viewRank];
      const w = refs.cnst.clientWidth || 220;
      const h = refs.cnst.clientHeight || 220;
      refs.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      refs.svg.innerHTML = EDGES.map(([a,b]) => {
        const ax = POS[a].x / 100 * w; const ay = POS[a].y / 100 * h;
        const bx = POS[b].x / 100 * w; const by = POS[b].y / 100 * h;
        const lit = rankNodes[a] && rankNodes[b];
        return `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${lit ? rank.color : 'rgba(63,168,255,.1)'}" stroke-width="${lit ? 1.5 : 0.7}"/>`;
      }).join('');
      refs.cnst.querySelectorAll('.arb-nw').forEach((n) => n.remove());

      rank.nodes.forEach((node, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'arb-nw';
        wrap.style.left = `${POS[idx].x}%`;
        wrap.style.top = `${POS[idx].y}%`;
        const nd = document.createElement('button');
        nd.type = 'button';
        nd.className = 'arb-nd';
        nd.textContent = node.icon;

        const isCurrent = state.viewRank === state.curRank;
        const isFuture = state.viewRank > state.curRank;
        const active = rankNodes[idx];
        const afford = state.pts >= node.cost;

        if (active) nd.classList.add('act');
        else if (isFuture) nd.classList.add('sil');
        else if (isCurrent && afford) nd.classList.add('avl');
        else nd.classList.add('lck');

        if (!active && !isFuture && isCurrent) {
          on(nd, 'click', () => {
            const result = engine.buyNode(idx);
            if (!result.ok) {
              if (result.code === 'insufficient') flashStatus('❌ PC Insuficientes');
              return;
            }
            flashStatus(`✓ ${result.node.stat} +${result.node.gain} desbloqueado`);
            render();
            if (result.rankCompletedNow) showAscension();
          });
        }

        const lbl = document.createElement('div');
        lbl.className = 'arb-nlbl';
        lbl.textContent = node.stat;
        wrap.append(nd, lbl);
        refs.cnst.appendChild(wrap);
      });
    }

    function showAscension() {
      const { state } = engine;
      const rank = RANKS[state.curRank];
      refs.ovTtl.textContent = `RANGO ${rank.id} COMPLETADO`;
      refs.ov.classList.add('show');
      setTimeout(() => {
        refs.ov.classList.remove('show');
        engine.advanceRankAfterAscension();
        render();
      }, 2800);
    }

    on(refs.add, 'click', () => {
      const earned = engine.addPoints();
      flashStatus(`+${earned} PC ganados en batalla`);
      render();
    });

    render();

    return {
      destroy() {
        listeners.forEach((off) => off());
        listeners.length = 0;
        clearTimeout(refs.status._t);
        container.replaceChildren();
      }
    };
  }

  window.createRanksUI = createRanksUI;
})();
