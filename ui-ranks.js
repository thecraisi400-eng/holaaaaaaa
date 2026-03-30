(() => {
  const STYLE_ID = 'arbol-ranks-style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .arbol-stage{width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:6px;background:rgba(8,12,20,.85);overflow:auto}
      .arbol-shell{width:min(100%,460px);height:min(100%,360px);max-width:460px;max-height:360px;display:flex;align-items:stretch;justify-content:center}
      .arbol-shell img{object-fit:contain;max-width:100%;max-height:100%}
      .arbol-root{--ink:#0d1117;--panel:#131a26;--surface:#1c2740;--btn-bg:#162035;--overlay:rgba(8,12,20,.85);--orange:#ff6b00;--gold:#ffd700;--green:#00ff88;--txt:#dde8ff;--muted:#4a6080;--rank-color:#cd7f32;width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:var(--ink);border:1px solid rgba(255,255,255,.08);box-shadow:0 0 24px rgba(0,0,0,.5);position:relative}
      #top-bar{height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 8px;background:var(--panel);border-bottom:1px solid rgba(255,255,255,.07)}
      #rank-timeline{display:flex;gap:4px}
      .tl-node{width:40px;height:26px;border-radius:4px;background:var(--btn-bg);display:flex;align-items:center;justify-content:center;font-size:7px;font-family:'Orbitron',sans-serif;color:var(--muted);cursor:pointer;border:1px solid transparent;position:relative;transition:transform .15s}
      .tl-node:hover{transform:scale(1.08)}
      .tl-node.completed{color:var(--gold);border-color:rgba(255,215,0,.35)}
      .tl-node.completed::after{content:'✓';position:absolute;top:-4px;right:-3px;color:var(--gold);font-size:8px}
      .tl-node.active{color:var(--rank-color);border-color:var(--rank-color);box-shadow:0 0 8px var(--rank-color)}
      .tl-node.future::after{content:'🔒';position:absolute;top:-4px;right:-3px;font-size:8px}
      #cp-box{display:flex;align-items:center;gap:5px;background:var(--surface);padding:3px 8px;border-radius:4px;border:1px solid rgba(255,165,0,.3)}
      #cp-box .lbl{font-size:7px;color:var(--muted);font-family:'Orbitron',sans-serif;letter-spacing:1px}
      #cp-value{font-size:14px;color:var(--orange);font-family:'Orbitron',sans-serif;min-width:30px;text-align:right}
      @keyframes cp-flash{0%{color:var(--gold);transform:scale(1.2)}100%{color:var(--orange);transform:scale(1)}}
      .cp-flash{animation:cp-flash .5s ease-out}

      #main-row{flex:1;display:flex;min-height:0}
      #stats-panel,#right-panel{background:var(--panel);padding:6px 4px;display:flex;flex-direction:column;gap:4px}
      #stats-panel{width:78px;border-right:1px solid rgba(255,255,255,.06)}
      #right-panel{width:82px;border-left:1px solid rgba(255,255,255,.06)}
      .stats-hdr{font-size:7px;letter-spacing:1px;color:var(--muted);font-family:'Orbitron',sans-serif;text-align:center}
      .stat-row{display:flex;gap:3px;align-items:center;background:var(--surface);padding:3px 4px;border-radius:3px;border:1px solid rgba(255,255,255,.05)}
      .stat-nm{font-size:8px;color:var(--muted);font-weight:700;flex:1}
      .stat-val{margin-left:auto;font-family:'Orbitron',sans-serif;font-size:9px;color:var(--txt)}
      @keyframes boost-anim{0%{transform:scale(1.35);color:var(--green)}100%{transform:scale(1);color:var(--txt)}}
      .stat-boosted{animation:boost-anim .65s ease-out}

      #center-panel{flex:1;display:flex;flex-direction:column;align-items:center;padding:5px 2px;position:relative;overflow:hidden}
      #rank-header{text-align:center;margin-bottom:3px}
      #rank-name{font-size:11px;color:var(--rank-color);font-family:'Orbitron',sans-serif;letter-spacing:1.6px;text-shadow:0 0 8px var(--rank-color)}
      #rank-lore{font-size:7px;color:var(--muted)}
      #constellation{position:relative;width:152px;height:128px;flex-shrink:0}
      #locked-ranks-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:0}
      .lock-shadow{position:absolute;font-family:'Orbitron',sans-serif;font-size:18px;color:rgba(255,255,255,.08);letter-spacing:2px}
      .lock-shadow small{font-size:11px;margin-left:4px}
      #c-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
      #center-emblem{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--rank-color);box-shadow:0 0 12px var(--rank-color);z-index:2;background:var(--surface)}
      .s-node{position:absolute;width:32px;height:32px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--btn-bg);border-radius:5px;border:1.5px solid rgba(255,255,255,.12);z-index:3;cursor:pointer}
      .s-node .n-lbl{font-size:6px;color:var(--muted)}
      .s-locked{opacity:.28;filter:grayscale(1);cursor:not-allowed}
      @keyframes node-pulse{0%,100%{box-shadow:0 0 4px var(--rank-color)}50%{box-shadow:0 0 12px var(--rank-color)}}
      .s-avail{border-color:var(--rank-color);animation:node-pulse 1.6s ease-in-out infinite}
      .s-active{border-color:var(--rank-color);box-shadow:0 0 8px var(--rank-color);background:rgba(255,255,255,.06)}
      .s-active .n-lbl{color:var(--rank-color)}
      .n-tip{opacity:0;pointer-events:none;position:absolute;left:108%;top:50%;transform:translateY(-50%);background:var(--overlay);font-size:8px;padding:4px 6px;border:1px solid var(--rank-color);border-radius:4px;white-space:nowrap;line-height:1.4;transition:opacity .2s;z-index:15}
      .s-node:hover:not(.s-locked) .n-tip{opacity:1}
      .n-tip b{color:var(--rank-color)}

      #syn-wrap{width:100%;margin-top:6px;padding:0 2px}
      #syn-lbl{display:flex;justify-content:space-between;font-size:7px;color:var(--muted);margin-bottom:3px}
      #syn-bar{display:flex;gap:2px;height:6px}
      .syn-seg{flex:1;background:var(--surface);border:1px solid rgba(255,255,255,.07);border-radius:2px}
      .syn-seg.on{background:var(--rank-color);box-shadow:0 0 4px var(--rank-color)}

      #bonus-card{flex:1;background:var(--surface);border-radius:4px;border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5px;text-align:center;position:relative;overflow:hidden}
      #bonus-lbl{font-size:7px;letter-spacing:1px;color:var(--muted);font-family:'Orbitron',sans-serif}
      #bonus-ico{font-size:20px}
      #bonus-name{font-size:9px;color:var(--rank-color);font-weight:700}
      #bonus-desc{font-size:7px;color:var(--muted);line-height:1.4}
      #bonus-state{font-size:7px;color:var(--gold);margin-top:4px}
      #bonus-lock{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,12,20,.72);font-size:18px}
      #bonus-lock.open{opacity:0;pointer-events:none}
      #next-shadow{background:var(--btn-bg);border:1px solid rgba(255,255,255,.06);border-radius:4px;min-height:36px;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:.55}
      #next-shadow .ns-badge{font-size:11px;font-family:'Orbitron',sans-serif;font-weight:900}
      #next-shadow .ns-lbl{font-size:6px;color:var(--muted)}

      #bottom-bar{height:28px;display:flex;align-items:center;gap:6px;padding:0 8px;background:var(--panel);border-top:1px solid rgba(255,255,255,.06)}
      #bot-rank{font-size:7px;color:var(--rank-color);font-family:'Orbitron',sans-serif;white-space:nowrap}
      #bot-lore{font-size:7.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

      #ascend-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,12,20,.88);z-index:50;opacity:0;pointer-events:none;transition:opacity .25s}
      #ascend-overlay.show{opacity:1;pointer-events:all}
      #ascend-msg{font-family:'Orbitron',sans-serif;font-size:14px;color:var(--gold);text-shadow:0 0 10px var(--gold);text-align:center;line-height:1.4}

      .arbol-stage::-webkit-scrollbar{width:4px;height:4px}
      .arbol-stage::-webkit-scrollbar-track{background:var(--ink)}
      .arbol-stage::-webkit-scrollbar-thumb{background:var(--surface);border-radius:2px}
    `;
    document.head.appendChild(style);
  }

  function template() {
    return `<div class="arbol-stage"><div class="arbol-shell"><div class="arbol-root" id="arbol-root"><div id="top-bar"><div id="rank-timeline"></div><div id="cp-box"><span>⚡</span><span class="lbl">PC</span><span id="cp-value">0</span></div></div><div id="main-row"><div id="stats-panel"><div class="stats-hdr">STATS</div><div class="stat-row"><span>⚔️</span><span class="stat-nm">ATK</span><span class="stat-val" id="sv-atk">0</span></div><div class="stat-row"><span>🛡️</span><span class="stat-nm">DEF</span><span class="stat-val" id="sv-def">0</span></div><div class="stat-row"><span>❤️</span><span class="stat-nm">HP</span><span class="stat-val" id="sv-hp">0</span></div><div class="stat-row"><span>💨</span><span class="stat-nm">SPD</span><span class="stat-val" id="sv-spd">0</span></div><div class="stat-row"><span>🔵</span><span class="stat-nm">CHK</span><span class="stat-val" id="sv-chk">0</span></div></div><div id="center-panel"><div id="rank-header"><div id="rank-name"></div><div id="rank-lore"></div></div><div id="constellation"><div id="locked-ranks-bg"></div><svg id="c-svg" viewBox="0 0 152 128"></svg><div id="center-emblem">⚡</div></div><div id="syn-wrap"><div id="syn-lbl"><span>SINTONÍA</span><span id="syn-count">0/5</span></div><div id="syn-bar"><div class="syn-seg" id="ss0"></div><div class="syn-seg" id="ss1"></div><div class="syn-seg" id="ss2"></div><div class="syn-seg" id="ss3"></div><div class="syn-seg" id="ss4"></div></div></div></div><div id="right-panel"><div id="bonus-card"><div id="bonus-lbl">BONO DE RANGO</div><div id="bonus-ico"></div><div id="bonus-name"></div><div id="bonus-desc"></div><div id="bonus-state"></div><div id="bonus-lock">🔒</div></div><div id="next-shadow"><span class="ns-badge">???</span><span class="ns-lbl">BLOQUEADO</span></div></div></div><div id="bottom-bar"><span id="bot-rank"></span><span id="bot-lore"></span></div><div id="ascend-overlay"><div id="ascend-msg">RANGO COMPLETADO</div></div></div></div></div>`;
  }

  function mountArbolUI({ container, manager }) {
    ensureStyle();
    container.replaceChildren();
    container.insertAdjacentHTML('beforeend', template());

    const data = window.ARBOL_RANKS_DATA;
    const logic = window.createRanksLogic({ manager });
    const { S } = logic;
    const listeners = [];
    const timers = new Set();
    const rafIds = new Set();
    const q = (id) => container.querySelector(`#${id}`);

    function on(el, event, handler, opts) {
      el.addEventListener(event, handler, opts);
      listeners.push(() => el.removeEventListener(event, handler, opts));
    }

    function setTimer(fn, ms) {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    }

    function animateCP(from, to) {
      const el = q('cp-value');
      const dur = 850;
      const start = Date.now();
      const tick = () => {
        const t = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(from + (to - from) * ease);
        if (t < 1) {
          const id = requestAnimationFrame(tick);
          rafIds.add(id);
        } else {
          el.textContent = String(to);
          el.classList.add('cp-flash');
          setTimer(() => el.classList.remove('cp-flash'), 450);
        }
      };
      tick();
    }

    function boostStat(key) {
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

    function refreshCPDisplay() {
      q('cp-value').textContent = String(S.cp);
    }

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
          S.viewRank = i;
          renderView();
        });
        tl.appendChild(div);
      });
    }

    function renderLockedBackground(viewIndex) {
      const bg = q('locked-ranks-bg');
      const future = data.RANKS.slice(viewIndex + 1, viewIndex + 3);
      bg.innerHTML = future.map((r, idx) => (
        `<div class="lock-shadow" style="transform:translate(${idx ? 28 : -26}px,${idx ? 18 : -15}px)">${r.short}<small>⛓</small></div>`
      )).join('');
    }

    function renderConstellation(vi, r, prog, isCurrent) {
      container.querySelectorAll('.s-node').forEach((n) => n.remove());
      renderLockedBackground(vi);

      let lines = '';
      for (let i = 0; i < 5; i += 1) {
        const a = data.POS[i];
        const b = data.POS[(i + 1) % 5];
        const lit = prog[i] && prog[(i + 1) % 5];
        lines += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${lit ? r.color : 'rgba(255,255,255,0.07)'}" stroke-width="${lit ? 1.6 : 1}" stroke-dasharray="${lit ? '' : '4 3'}" opacity="${lit ? 0.85 : 0.45}"/>`;
      }
      q('c-svg').innerHTML = lines;

      const con = q('constellation');
      r.nodes.forEach((nd, i) => {
        const act = prog[i];
        const isViewedFuture = vi > S.currentRank;
        const avail = isCurrent && !act && S.cp >= r.cost;
        const div = document.createElement('div');
        div.className = `s-node ${act ? 's-active' : avail ? 's-avail' : 's-locked'}`;
        div.style.left = `${data.POS[i].x}px`;
        div.style.top = `${data.POS[i].y}px`;
        const after = S.stats[nd.key] + nd.bonus;
        const tipSide = (i === 1 || i === 2) ? 'right:108%;left:auto;' : 'left:108%;';
        div.innerHTML = `<div class="n-ico">${nd.ico}</div><div class="n-lbl">${nd.stat}</div><div class="n-tip" style="${tipSide}"><b>${nd.stat}</b><br>${act ? '✓ Activado' : `Costo: ${r.cost} PC`}<br>${S.stats[nd.key]} actuales → <b>${after}</b> tras mejora</div>`;
        if (!act && isCurrent && !isViewedFuture) {
          on(div, 'click', () => {
            const result = logic.buyNode(vi, i, nd);
            if (!result.ok) return;
            refreshCPDisplay();
            boostStat(result.statKey);
            const rankDone = result.done === 5;
            if (rankDone) {
              runAscension(vi);
              return;
            }
            renderView();
          });
        }
        con.appendChild(div);
      });
    }

    function runAscension(rankIndex) {
      const ov = q('ascend-overlay');
      const rank = data.RANKS[rankIndex];
      const msg = q('ascend-msg');
      msg.textContent = `RANGO COMPLETADO\n${rank.name}`;
      ov.classList.add('show');
      setTimer(() => {
        logic.claimBonus(rankIndex);
        ov.classList.remove('show');
        renderTimeline();
        renderView();
      }, 950);
    }

    function renderView() {
      const vi = S.viewRank;
      const r = data.RANKS[vi];
      const prog = S.progress[vi];
      const done = prog.filter(Boolean).length;
      const isCurrent = vi === S.currentRank;
      const isPast = vi < S.currentRank;

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
      const bonusState = q('bonus-state');
      if (isPast || S.bonusClaimed[vi]) {
        lockEl.classList.add('open');
        bonusState.textContent = 'BONO OBTENIDO';
      } else if (done === 5 && isCurrent) {
        lockEl.classList.add('open');
        bonusState.textContent = 'LISTO PARA ASCENDER';
      } else if (vi > S.currentRank) {
        lockEl.classList.remove('open');
        bonusState.textContent = 'RANGO FUTURO · BLOQUEADO';
      } else {
        lockEl.classList.remove('open');
        bonusState.textContent = `Progreso ${done}/5`;
      }

      q('syn-count').textContent = `${done}/5`;
      for (let i = 0; i < 5; i += 1) q(`ss${i}`).classList.toggle('on', prog[i]);

      const ns = q('next-shadow');
      if (vi < data.RANKS.length - 1) {
        const nx = data.RANKS[vi + 1];
        ns.innerHTML = `<span class="ns-badge" style="color:${nx.color}">${nx.short}</span><span class="ns-lbl">BLOQUEADO</span>`;
        ns.style.display = 'flex';
      } else {
        ns.style.display = 'none';
      }

      renderConstellation(vi, r, prog, isCurrent);
    }

    renderTimeline();
    renderView();
    animateCP(Math.max(0, S.cp - 25), S.cp);

    return {
      destroy() {
        listeners.forEach((off) => off());
        listeners.length = 0;
        timers.forEach((id) => clearTimeout(id));
        timers.clear();
        rafIds.forEach((id) => cancelAnimationFrame(id));
        rafIds.clear();
        logic.destroy();
        container.replaceChildren();
      }
    };
  }

  window.mountArbolUI = mountArbolUI;
})();
