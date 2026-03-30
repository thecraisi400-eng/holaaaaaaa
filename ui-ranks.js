(() => {
  const STYLE_ID = 'arbol-ranks-style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .arbol-container{width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;}
      .arbol-container img{object-fit:contain;max-width:100%;max-height:100%;}
      .arbol-root{--ink:#0d1117;--panel:#131a26;--surface:#1c2740;--btn-bg:#162035;--overlay:rgba(8,12,20,.92);--orange:#ff6b00;--gold:#ffd700;--green:#00ff88;--txt:#dde8ff;--muted:#4a6080;--rank-color:#cd7f32;width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:var(--ink)}
      #top-bar{height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 8px;background:var(--panel)}
      #rank-timeline{display:flex;gap:4px}.tl-node{width:40px;height:26px;border-radius:4px;background:var(--btn-bg);display:flex;align-items:center;justify-content:center;font-size:7px;color:var(--muted);cursor:pointer}.tl-node.completed{color:var(--gold)}.tl-node.active{color:var(--rank-color);box-shadow:0 0 8px var(--rank-color)}.tl-node.future{opacity:.5}
      #cp-box{display:flex;align-items:center;gap:5px;background:var(--surface);padding:3px 8px;border-radius:4px}#cp-value{font-size:14px;color:var(--orange)}
      #main-row{flex:1;display:flex;min-height:0}#stats-panel,#right-panel{width:82px;background:var(--panel);padding:6px 4px}#stats-panel{width:78px}#center-panel{flex:1;display:flex;flex-direction:column;align-items:center;padding:5px 2px;overflow:hidden}
      .stat-row{display:flex;gap:3px;background:var(--surface);padding:3px 4px;border-radius:3px;margin-top:3px}.stat-val{margin-left:auto}
      #rank-name{font-size:11px;color:var(--rank-color)}#rank-lore{font-size:7px;color:var(--muted)}#constellation{position:relative;width:152px;height:128px}#c-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
      #center-emblem{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--rank-color)}
      .s-node{position:absolute;width:32px;height:32px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--btn-bg);border-radius:5px}.s-locked{opacity:.3}.s-active{box-shadow:0 0 8px var(--rank-color)}.s-avail{border:1px solid var(--rank-color)}
      .n-tip{display:none;position:absolute;left:108%;top:50%;transform:translateY(-50%);background:var(--overlay);font-size:8px;padding:4px 6px;border:1px solid var(--rank-color)}.s-node:hover .n-tip{display:block}
      #syn-wrap{width:100%;margin-top:6px}#syn-bar{display:flex;gap:2px;height:5px}.syn-seg{flex:1;background:var(--surface)}.syn-seg.on{background:var(--rank-color)}
      #bonus-card{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;background:var(--surface)}#bonus-lock{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,12,20,.75)}#bonus-lock.open{opacity:0;pointer-events:none}
      #bonus-claim-btn{display:none;width:100%}.stat-boosted{animation:boost-anim .7s ease-out forwards}@keyframes boost-anim{0%{transform:scale(1.3);color:var(--green)}100%{transform:scale(1);color:var(--txt)}}.cp-flash{animation:cp-flash .5s ease-out forwards}@keyframes cp-flash{0%{color:var(--gold)}100%{color:var(--orange)}}
      #bottom-bar{height:28px;display:flex;align-items:center;gap:6px;padding:0 8px;background:var(--panel)}
    `;
    document.head.appendChild(style);
  }

  function template() {
    return `<div class="arbol-container"><div class="arbol-root" id="arbol-root"><div id="top-bar"><div id="rank-timeline"></div><div id="cp-box"><span>⚡</span><span class="lbl">PC</span><span id="cp-value">0</span></div></div><div id="main-row"><div id="stats-panel"><div class="stat-row"><span>⚔️</span><span>ATK</span><span class="stat-val" id="sv-atk">0</span></div><div class="stat-row"><span>🛡️</span><span>DEF</span><span class="stat-val" id="sv-def">0</span></div><div class="stat-row"><span>❤️</span><span>HP</span><span class="stat-val" id="sv-hp">0</span></div><div class="stat-row"><span>💨</span><span>SPD</span><span class="stat-val" id="sv-spd">0</span></div><div class="stat-row"><span>🔵</span><span>CHK</span><span class="stat-val" id="sv-chk">0</span></div></div><div id="center-panel"><div id="rank-header"><div id="rank-name"></div><div id="rank-lore"></div></div><div id="constellation"><svg id="c-svg" viewBox="0 0 152 128"></svg><div id="center-emblem">⚡</div></div><div id="syn-wrap"><div id="syn-lbl"><span>SINTONÍA</span><span id="syn-count">0/5</span></div><div id="syn-bar"><div class="syn-seg" id="ss0"></div><div class="syn-seg" id="ss1"></div><div class="syn-seg" id="ss2"></div><div class="syn-seg" id="ss3"></div><div class="syn-seg" id="ss4"></div></div></div></div><div id="right-panel"><div id="bonus-card"><div id="bonus-lbl">BONO</div><div id="bonus-ico"></div><div id="bonus-name"></div><div id="bonus-desc"></div><button id="bonus-claim-btn">RECLAMAR</button><div id="bonus-lock">🔒</div></div><div id="next-shadow"><span class="ns-badge">???</span><span class="ns-lbl">BLOQUEADO</span></div></div></div><div id="bottom-bar"><span id="bot-rank"></span><span id="bot-lore"></span></div></div></div>`;
  }

  function mountArbolUI({ container, manager }) {
    ensureStyle();
    container.replaceChildren();
    container.insertAdjacentHTML('beforeend', template());

    const data = window.ARBOL_RANKS_DATA;
    const logic = window.createRanksLogic({ manager });
    const { S } = logic;
    const listeners = [];
    const rafIds = new Set();
    const q = (id) => container.querySelector(`#${id}`);

    function on(el, event, handler, opts) {
      el.addEventListener(event, handler, opts);
      listeners.push(() => el.removeEventListener(event, handler, opts));
    }

    function animateCP(from, to) {
      const el = q('cp-value');
      const dur = 900;
      const start = Date.now();
      const tick = () => {
        const t = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(from + (to - from) * ease);
        if (t === 1) el.classList.add('cp-flash');
        if (t < 1) {
          const id = requestAnimationFrame(tick);
          rafIds.add(id);
        } else {
          el.textContent = String(to);
        }
      };
      tick();
    }

    function boostStat(key, delta) {
      const el = q(`sv-${key}`);
      if (!el) return;
      el.textContent = S.stats[key];
      el.classList.remove('stat-boosted');
      void el.offsetWidth;
      el.classList.add('stat-boosted');
      const end = () => el.classList.remove('stat-boosted');
      el.addEventListener('animationend', end, { once: true });
      listeners.push(() => el.removeEventListener('animationend', end));
    }

    function refreshCPDisplay() { q('cp-value').textContent = S.cp; }

    function renderTimeline() {
      const tl = q('rank-timeline');
      tl.innerHTML = '';
      data.RANKS.forEach((r, i) => {
        const div = document.createElement('div');
        div.className = 'tl-node';
        div.textContent = r.short;
        if (i < S.currentRank) div.classList.add('completed');
        else if (i === S.currentRank) div.classList.add('active');
        else div.classList.add('future');
        on(div, 'click', () => {
          if (i <= S.currentRank) {
            S.viewRank = i;
            renderView();
          }
        });
        tl.appendChild(div);
      });
    }

    function renderConstellation(vi, r, prog, isCurrent) {
      container.querySelectorAll('.s-node').forEach((n) => n.remove());
      let lines = '';
      for (let i = 0; i < 5; i += 1) {
        const a = data.POS[i];
        const b = data.POS[(i + 1) % 5];
        const lit = prog[i] && prog[(i + 1) % 5];
        lines += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${lit ? r.color : 'rgba(255,255,255,0.07)'}"/>`;
      }
      q('c-svg').innerHTML = lines;

      r.nodes.forEach((nd, i) => {
        const act = prog[i];
        const avail = isCurrent && !act && S.cp >= r.cost;
        const div = document.createElement('div');
        div.className = `s-node ${act ? 's-active' : avail ? 's-avail' : 's-locked'}`;
        div.style.left = `${data.POS[i].x}px`;
        div.style.top = `${data.POS[i].y}px`;
        div.innerHTML = `<div>${nd.ico}</div><div>${nd.stat}</div><div class="n-tip"><b>${nd.stat}</b><br>${act ? '✓ Activado' : `Costo: ${r.cost} PC`}<br>${S.stats[nd.key]} → <b>+${nd.bonus}</b></div>`;
        if (!act && isCurrent) {
          on(div, 'click', () => {
            const result = logic.buyNode(vi, i, nd);
            if (!result.ok) return;
            refreshCPDisplay();
            boostStat(result.statKey, nd.bonus);
            renderView();
          });
        }
        q('constellation').appendChild(div);
      });
    }

    function renderView() {
      const vi = S.viewRank;
      const r = data.RANKS[vi];
      const prog = S.progress[vi];
      const done = prog.filter(Boolean).length;
      const full = done === 5;
      const claimed = S.bonusClaimed[vi];
      const isCurrent = vi === S.currentRank;

      q('arbol-root').style.setProperty('--rank-color', r.color);
      q('rank-name').textContent = r.name;
      q('rank-lore').textContent = r.lore;
      q('bot-rank').textContent = `${r.name} · ${r.label}`;
      q('bot-lore').textContent = r.loreFull;
      q('bonus-ico').textContent = r.bonus.ico;
      q('bonus-name').textContent = r.bonus.name;
      q('bonus-desc').textContent = r.bonus.desc;
      ['atk', 'def', 'hp', 'spd', 'chk'].forEach((k) => { q(`sv-${k}`).textContent = S.stats[k]; });

      const lockEl = q('bonus-lock');
      const claimBtn = q('bonus-claim-btn');
      claimBtn.onclick = null;
      if (claimed) {
        lockEl.classList.add('open');
        claimBtn.style.display = 'flex';
        claimBtn.textContent = '✓ OBTENIDO';
      } else if (full && isCurrent) {
        lockEl.classList.add('open');
        claimBtn.style.display = 'flex';
        claimBtn.textContent = 'RECLAMAR';
        claimBtn.onclick = () => {
          const result = logic.claimBonus(vi);
          if (!result.ok) return;
          Object.keys(result.grants).forEach((k) => boostStat(k, result.grants[k]));
          renderTimeline();
          renderView();
        };
      } else {
        lockEl.classList.remove('open');
        claimBtn.style.display = 'none';
      }

      q('syn-count').textContent = `${done}/5`;
      for (let i = 0; i < 5; i += 1) q(`ss${i}`).classList.toggle('on', prog[i]);
      renderConstellation(vi, r, prog, isCurrent);
    }

    renderTimeline();
    renderView();
    animateCP(0, S.cp);

    return {
      destroy() {
        listeners.forEach((off) => off());
        listeners.length = 0;
        rafIds.forEach((id) => cancelAnimationFrame(id));
        rafIds.clear();
        logic.destroy();
        container.replaceChildren();
      }
    };
  }

  window.mountArbolUI = mountArbolUI;
})();
