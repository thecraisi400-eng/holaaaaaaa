(() => {
  const STYLE_ID = 'arbol-ranks-style';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#arbol-root{--ink:#0d1117;--panel:#131a26;--surface:#1c2740;--btn-bg:#162035;--overlay:rgba(8,12,20,0.88);--text:#c9d4e8;--dim:#3d5070;--accent:#3fa8ff;--rc:#3fa8ff;display:flex;justify-content:center;align-items:center;min-height:100%;font-family:'Courier New',Courier,monospace}
#arbol-root *{box-sizing:border-box;margin:0;padding:0}
#arbol-root #gp{width:355px;height:500px;background:transparent;position:relative;overflow:hidden;border:1px solid rgba(63,168,255,.12);border-radius:6px;display:flex;flex-direction:column}
#arbol-root #hdr{height:36px;background:var(--panel);border-bottom:1px solid rgba(63,168,255,.08);display:flex;align-items:center;justify-content:space-between;padding:0 8px}
#arbol-root #pts-wrap{display:flex;align-items:center;gap:5px}#arbol-root #pts-lbl{font-size:7px;color:var(--dim)}#arbol-root #pts-val{font-size:14px;font-weight:900;color:var(--accent)}
#arbol-root #timeline{display:flex;gap:4px}.rpip{width:26px;height:26px;border-radius:50%;background:var(--btn-bg);border:1.5px solid var(--dim);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--dim);cursor:pointer}
.rpip.done{border-color:#ffd700;color:#ffd700}.rpip.cur{border-color:var(--rc);color:var(--rc);box-shadow:0 0 8px var(--rc)}.rpip.future{opacity:.35;cursor:not-allowed}
#arbol-root #body{flex:1;display:flex;overflow:hidden}#arbol-root #stats{width:82px;background:var(--panel);border-right:1px solid rgba(63,168,255,.07);padding:5px 4px;display:flex;flex-direction:column;gap:3px}
#arbol-root .stats-hd{font-size:6px;color:var(--dim);text-align:center}#arbol-root .sr{display:flex;align-items:center;background:var(--surface);border-radius:3px;padding:3px 4px;border:1px solid rgba(63,168,255,.05);gap:2px}
#arbol-root .si{font-size:10px;width:14px;text-align:center}#arbol-root .sn{font-size:5.5px;color:var(--dim);flex:1}#arbol-root .sv{font-size:7px;font-weight:700;color:var(--text);min-width:26px;text-align:right}
#arbol-root .stot{margin-top:auto;background:rgba(63,168,255,.05);border:1px solid rgba(63,168,255,.1);border-radius:3px;padding:4px 2px;text-align:center}.stot-lbl{font-size:5px;color:var(--dim)}.stot-v{font-size:10px;font-weight:900;color:var(--accent);margin-top:2px}
#arbol-root #rp{flex:1;display:flex;flex-direction:column;padding:6px;gap:5px}#arbol-root #rk-hdr{height:42px;background:var(--panel);border-radius:6px;padding:5px 8px;border:1px solid rgba(63,168,255,.08)}
#arbol-root #rk-row{display:flex;gap:7px}#arbol-root #rk-badge{font-size:12px;font-weight:900;color:var(--rc)}#arbol-root #rk-name{font-size:9px;color:var(--text)}#arbol-root #rk-lore{font-size:6.5px;color:var(--dim);margin-top:2px}
#arbol-root #cnst{flex:1;background:var(--panel);border-radius:6px;border:1px solid rgba(63,168,255,.08);position:relative;overflow:hidden}#arbol-root #cnst-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
#arbol-root .nw{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer;z-index:2}#arbol-root .nd{width:40px;height:40px;border-radius:50%;background:var(--btn-bg);border:2px solid var(--dim);display:flex;align-items:center;justify-content:center;font-size:20px}
#arbol-root .nd .emoji-color{filter:grayscale(1) brightness(0.3)}#arbol-root .nd.act .emoji-color{filter:grayscale(0) brightness(1)}#arbol-root .nd.lck .emoji-color{filter:grayscale(1) brightness(0.2)}#arbol-root .nd.sil .emoji-color{filter:grayscale(1) brightness(0.15);opacity:.3}#arbol-root .nd.avl .emoji-color{filter:grayscale(.7) brightness(.5)}
#arbol-root .nd.lck{opacity:.85;cursor:not-allowed}#arbol-root .nd.sil{opacity:.7;cursor:not-allowed;border-color:rgba(80,80,80,.3)}#arbol-root .nd.avl{border-color:var(--rc)}#arbol-root .nd.act{background:var(--surface);border-color:var(--rc);box-shadow:0 0 22px var(--rc)}
#arbol-root .nlbl{font-size:5.5px;color:var(--dim);margin-top:2px}.ntt{display:none;position:absolute;background:var(--overlay);border:1px solid rgba(63,168,255,.3);border-radius:5px;padding:5px 7px;width:96px;z-index:10;top:50%;transform:translateY(-50%);left:46px}.nw:hover .ntt{display:block}
#arbol-root #rbonus{height:52px;background:var(--surface);border-radius:6px;border:1px solid rgba(63,168,255,.1);padding:5px 8px;display:flex;align-items:center;gap:8px;position:relative;overflow:hidden}#arbol-root #rbonus.lck::after{content:'';position:absolute;inset:0;background:rgba(0,0,0,.52)}
#arbol-root #blck{display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:20px;z-index:2}#arbol-root #rbonus.lck #blck{display:flex;flex-direction:column;align-items:center}
#arbol-root #syn{height:28px;background:var(--panel);border-radius:5px;border:1px solid rgba(63,168,255,.07);padding:0 8px;display:flex;align-items:center;gap:4px}.syn-lbl{font-size:6px;color:var(--dim)}.syn-segs{display:flex;gap:3px;flex:1}.sseg{flex:1;height:10px;background:var(--btn-bg)}.sseg.on{background:var(--rc)}
#arbol-root #bot{height:34px;background:var(--panel);border-top:1px solid rgba(63,168,255,.07);display:flex;align-items:center;justify-content:space-between;padding:0 10px}#arbol-root #add-btn{background:var(--btn-bg);border:1px solid rgba(63,168,255,.2);color:var(--accent);font-size:7.5px;padding:4px 10px;border-radius:4px;cursor:pointer}
#arbol-root #status-txt{font-size:6.5px;color:var(--dim)}#arbol-root #asc-ov{display:none;position:absolute;inset:0;background:var(--overlay);z-index:200;flex-direction:column;align-items:center;justify-content:center;gap:10px}#arbol-root #asc-ov.show{display:flex}
`;
    document.head.appendChild(style);
  }

  function template() {
    return `<div id="arbol-root"><div id="gp"><div id="hdr"><div id="pts-wrap"><span id="pts-lbl">PC</span><span id="pts-val">0000</span></div><div id="timeline"><div class="rpip" data-r="0">D</div><div class="rpip" data-r="1">C</div><div class="rpip" data-r="2">B</div><div class="rpip" data-r="3">A</div><div class="rpip" data-r="4">S</div></div></div><div id="body"><div id="stats"><div class="stats-hd">⚡ ESTADÍSTICAS ⚡</div><div class="sr"><span class="si">💖</span><span class="sn">VIDA</span><span class="sv" id="v-hp">500</span></div><div class="sr"><span class="si">🗡️</span><span class="sn">FUERZA</span><span class="sv" id="v-atk">120</span></div><div class="sr"><span class="si">🛡️</span><span class="sn">DEF</span><span class="sv" id="v-def">80</span></div><div class="sr"><span class="si">🌪️</span><span class="sn">AGIL</span><span class="sv" id="v-spd">95</span></div><div class="sr"><span class="si">🎯</span><span class="sn">CRIT</span><span class="sv" id="v-crit">15</span></div><div class="sr"><span class="si">🌀</span><span class="sn">CHAKRA</span><span class="sv" id="v-chk">200</span></div><div class="sr"><span class="si">⚡</span><span class="sn">PODER</span><span class="sv" id="v-pwr">310</span></div><div class="stot"><div class="stot-lbl">💪 PODER TOTAL</div><div class="stot-v" id="v-tot">1320</div></div></div><div id="rp"><div id="rk-hdr"><div id="rk-row"><span id="rk-badge">RANGO-D</span><span id="rk-name">Genin</span></div><div id="rk-lore"></div></div><div id="cnst"><svg id="cnst-svg" xmlns="http://www.w3.org/2000/svg"></svg></div><div id="rbonus" class="lck"><div id="blck">🔒<span>Completa el Rango</span></div><span id="bic">🌱</span><div class="bi"><div class="bi-lbl">Bono de Rango</div><div class="bi-t" id="bt"></div><div class="bi-d" id="bd"></div></div><div id="bbar" style="width:0%"></div></div><div id="syn"><span class="syn-lbl">✨ SINTONÍA ✨</span><div class="syn-segs"><div class="sseg" id="ss0"></div><div class="sseg" id="ss1"></div><div class="sseg" id="ss2"></div><div class="sseg" id="ss3"></div><div class="sseg" id="ss4"></div></div><span class="syn-cnt" id="syn-cnt">0/5</span></div></div></div><div id="bot"><button id="add-btn">⚡ Ganar PC</button><span id="status-txt">Sistema de Rango Activo</span></div><div id="asc-ov"><div class="asc-em" id="asc-em">⭐</div><div class="asc-ttl" id="asc-ttl">RANGO COMPLETADO</div><div class="asc-sub" id="asc-sub">Ascendiendo…</div></div></div></div>`;
  }

  function createRanksUI({ container }) {
    ensureStyles();
    container.innerHTML = template();

    const root = container.querySelector('#arbol-root');
    const data = window.RANKS_DATA;
    const game = window.createRanksGame(data);
    const listeners = [];
    const timers = [];
    const $ = (sel) => root.querySelector(sel);
    const on = (el, evt, fn, opts) => {
      el.addEventListener(evt, fn, opts);
      listeners.push(() => el.removeEventListener(evt, fn, opts));
    };

    const setRC = (color) => $('#gp').style.setProperty('--rc', color);
    const flashStatus = (msg, dur = 2200) => {
      const el = $('#status-txt');
      el.textContent = msg;
      clearTimeout(el._t);
      el._t = setTimeout(() => { el.textContent = 'Sistema de Rango Activo'; }, dur);
      timers.push(el._t);
    };

    function renderStats() {
      const s = game.state.stats;
      $('#v-hp').textContent = s.hp; $('#v-atk').textContent = s.atk; $('#v-def').textContent = s.def;
      $('#v-spd').textContent = s.spd; $('#v-crit').textContent = s.crit; $('#v-chk').textContent = s.chk; $('#v-pwr').textContent = s.pwr;
      $('#v-tot').textContent = s.hp + s.atk * 3 + s.def * 2 + s.spd * 2 + s.crit * 5 + s.chk + s.pwr;
    }

    function renderCnst() {
      const { RANKS, POS, EDGES } = data;
      const G = game.state;
      const cnst = $('#cnst');
      const svg = $('#cnst-svg');
      const R = RANKS[G.viewRank];
      const ns = G.nodes[G.viewRank];
      const isCur = G.viewRank === G.curRank;
      const isFut = G.viewRank > G.curRank;
      cnst.querySelectorAll('.nw').forEach((n) => n.remove());
      const W = cnst.clientWidth || 261;
      const H = cnst.clientHeight || 230;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = EDGES.map(([a, b]) => {
        const ax = (POS[a].x / 100) * W, ay = (POS[a].y / 100) * H;
        const bx = (POS[b].x / 100) * W, by = (POS[b].y / 100) * H;
        const lit = ns[a] && ns[b];
        return `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${lit ? R.color : 'rgba(63,168,255,.07)'}" stroke-width="${lit ? 1.5 : 0.7}" />`;
      }).join('');

      R.nodes.forEach((node, i) => {
        const pos = POS[i]; const active = ns[i]; const afford = G.pts >= node.cost; const avail = isCur && !active && afford;
        const wrap = document.createElement('div'); wrap.className = 'nw'; wrap.style.left = `${pos.x}%`; wrap.style.top = `${pos.y}%`;
        const nd = document.createElement('div'); nd.className = 'nd';
        const emoji = document.createElement('span'); emoji.className = 'emoji-color'; emoji.textContent = node.icon; nd.appendChild(emoji);
        if (isFut) nd.classList.add('sil'); else if (active) nd.classList.add('act'); else if (avail) nd.classList.add('avl'); else nd.classList.add('lck');
        const lbl = document.createElement('div'); lbl.className = 'nlbl'; lbl.textContent = node.stat;
        const tt = document.createElement('div'); tt.className = 'ntt'; tt.innerHTML = `<div class="ntt-t">${node.icon} ${node.stat}</div><div class="ntt-b">Actual: ${G.stats[node.key]}</div><div class="ntt-a">+ ${node.gain} tras mejora</div><div class="ntt-b">Costo: ${node.cost} PC</div>`;
        if (pos.x > 60) { tt.style.left = 'auto'; tt.style.right = '46px'; }
        if (!active && !isFut && isCur) on(wrap, 'click', () => game.buyNode(i));
        wrap.append(nd, lbl, tt); cnst.appendChild(wrap);
      });
    }

    function render() {
      const { RANKS } = data;
      const G = game.state;
      const R = RANKS[G.viewRank];
      setRC(R.color);
      $('#pts-val').textContent = String(G.pts).padStart(4, '0');
      root.querySelectorAll('.rpip').forEach((p, i) => {
        p.className = 'rpip';
        if (G.done[i]) p.classList.add('done'); else if (i === G.curRank) p.classList.add('cur'); else if (i > G.curRank) p.classList.add('future');
      });
      $('#rk-badge').textContent = `RANGO-${R.id}`; $('#rk-name').textContent = R.name; $('#rk-lore').textContent = R.lore;
      const done5 = G.nodes[G.viewRank].filter(Boolean).length;
      $('#rbonus').classList.toggle('lck', done5 < 5); $('#bic').textContent = R.bonus.icon; $('#bt').textContent = R.bonus.title; $('#bd').textContent = R.bonus.desc;
      $('#bbar').style.width = `${(done5 / 5) * 100}%`;
      for (let i = 0; i < 5; i += 1) $('#ss' + i).classList.toggle('on', G.nodes[G.viewRank][i]);
      $('#syn-cnt').textContent = `${done5}/5`;
      renderStats();
      renderCnst();
    }

    function showAscension() {
      const { RANKS } = data;
      const G = game.state;
      const R = RANKS[G.curRank];
      const ems = ['⭐', '🌟', '💛', '💎', '🔥'];
      $('#asc-em').textContent = ems[G.curRank];
      $('#asc-ttl').textContent = `RANGO ${R.id} COMPLETADO`;
      const next = RANKS[G.curRank + 1];
      $('#asc-sub').textContent = next ? `Ascendiendo a ${next.name}…` : '¡Has alcanzado la Cima Legendaria!';
      const ov = $('#asc-ov');
      ov.classList.add('show');
      const t = setTimeout(() => { ov.classList.remove('show'); game.completeAscensionStep(); }, 2800);
      timers.push(t);
    }

    game.setHandlers({
      onStatus: flashStatus,
      onAscension: () => showAscension(),
      onRender: () => render()
    });

    root.querySelectorAll('.rpip').forEach((el) => on(el, 'click', () => game.viewRank(Number(el.dataset.r))));
    on($('#add-btn'), 'click', () => game.addPoints());

    const iv = setInterval(() => {
      const ptsEl = $('#pts-val');
      const current = Number(ptsEl.textContent) || 0;
      const target = game.state.pts;
      ptsEl.textContent = String(Math.min(current + 2, target)).padStart(4, '0');
      if (Number(ptsEl.textContent) >= target) clearInterval(iv);
    }, 25);
    timers.push(iv);
    render();

    return {
      destroy() {
        listeners.forEach((off) => off());
        listeners.length = 0;
        timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
        timers.length = 0;
        container.replaceChildren();
      }
    };
  }

  window.createRanksUI = createRanksUI;
})();
