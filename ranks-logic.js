(() => {
  function createRanksLogic({ root }) {
    const { RANKS, POS, EDGES } = window.ARBOL_RANKS_DATA || {};
    if (!RANKS || !POS || !EDGES) {
      throw new Error('ARBOL_RANKS_DATA no está disponible.');
    }

    const q = (id) => root.querySelector(`#${id}`);

    const G = {
      pts:       50,
      curRank:   0,
      viewRank:  0,
      nodes:     RANKS.map(() => [false,false,false,false,false]),
      done:      [false,false,false,false,false],
      stats:     {hp:500, atk:120, def:80, spd:95, crit:15, chk:200, pwr:310}
    };

    function setRC(color) {
      q('gp').style.setProperty('--rc', color);
    }

    function flashStatus(msg, dur=2200) {
      const el = q('status-txt');
      el.textContent = msg;
      clearTimeout(el._t);
      el._t = setTimeout(() => {
        el.textContent = 'Sistema de Rango Activo';
      }, dur);
    }

    function animatePts() {
      const el = q('pts-val');
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
    }

    function boostStat(key) {
      const el = q('v-' + key);
      if (!el) return;
      el.classList.remove('up');
      void el.offsetWidth;
      el.classList.add('up');
      setTimeout(() => el.classList.remove('up'), 700);
    }

    function render() {
      const R = RANKS[G.viewRank];
      setRC(R.color);

      q('pts-val').textContent = String(G.pts).padStart(4,'0');

      root.querySelectorAll('.rpip').forEach((p, i) => {
        p.className = 'rpip';
        if (G.done[i]) p.classList.add('done');
        else if (i === G.curRank) p.classList.add('cur');
        else if (i > G.curRank) p.classList.add('future');
      });

      q('rk-badge').textContent = `RANGO-${R.id}`;
      q('rk-name').textContent = R.name;
      q('rk-lore').textContent = R.lore;
      q('rk-badge').style.color = R.color;
      q('rk-badge').style.textShadow = `0 0 8px ${R.color}`;

      renderCnst();

      const done5 = G.nodes[G.viewRank].filter(Boolean).length;
      const bonus = R.bonus;
      q('rbonus').classList.toggle('lck', done5 < 5);
      q('bic').textContent = bonus.icon;
      q('bt').textContent = bonus.title;
      q('bd').textContent = bonus.desc;
      q('bt').style.color = R.color;
      q('bbar').style.width = `${(done5/5)*100}%`;
      q('bbar').style.background = R.color;
      q('bbar').style.boxShadow = `0 0 5px ${R.color}`;

      for (let i=0;i<5;i++) {
        const s = q('ss'+i);
        s.classList.toggle('on', G.nodes[G.viewRank][i]);
        s.style.background = G.nodes[G.viewRank][i] ? R.color : '';
        s.style.boxShadow = G.nodes[G.viewRank][i] ? `0 0 6px ${R.color}` : '';
      }
      q('syn-cnt').textContent = `${done5}/5`;

      renderStats();
    }

    function renderStats() {
      const s = G.stats;
      q('v-hp').textContent = s.hp;
      q('v-atk').textContent = s.atk;
      q('v-def').textContent = s.def;
      q('v-spd').textContent = s.spd;
      q('v-crit').textContent = s.crit;
      q('v-chk').textContent = s.chk;
      q('v-pwr').textContent = s.pwr;
      const tot = s.hp + s.atk*3 + s.def*2 + s.spd*2 + s.crit*5 + s.chk + s.pwr;
      q('v-tot').textContent = tot;
    }

    function renderCnst() {
      const cnst = q('cnst');
      const svg = q('cnst-svg');
      const R = RANKS[G.viewRank];
      const ns = G.nodes[G.viewRank];
      const isCur = G.viewRank === G.curRank;
      const isFut = G.viewRank > G.curRank;

      cnst.querySelectorAll('.nw').forEach((n) => n.remove());

      const W = cnst.clientWidth || 261;
      const H = cnst.clientHeight || 230;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

      svg.innerHTML = EDGES.map(([a,b]) => {
        const ax = POS[a].x/100*W, ay = POS[a].y/100*H;
        const bx = POS[b].x/100*W, by = POS[b].y/100*H;
        const lit = ns[a] && ns[b];
        return `
          <line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"
                stroke="${lit ? R.color : 'rgba(63,168,255,.07)'}"
                stroke-width="${lit ? 1.5 : 0.7}" opacity="${lit ? .9 : 1}"/>
          ${lit ? `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"
                   stroke="${R.color}" stroke-width="4" opacity=".14"/>` : ''}
        `;
      }).join('');

      R.nodes.forEach((node, i) => {
        const pos = POS[i];
        const active = ns[i];
        const afford = G.pts >= node.cost;
        const avail = isCur && !active && afford;

        const wrap = document.createElement('div');
        wrap.className = 'nw';
        wrap.style.left = pos.x + '%';
        wrap.style.top = pos.y + '%';

        const nd = document.createElement('div');
        nd.className = 'nd';

        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'emoji-color';
        emojiSpan.textContent = node.icon;
        emojiSpan.style.display = 'inline-block';
        emojiSpan.style.transition = 'all 0.3s ease';

        nd.appendChild(emojiSpan);

        if (isFut) nd.classList.add('sil');
        else if (active) {
          nd.classList.add('act');
          nd.style.borderColor=R.color;
          nd.style.boxShadow=`0 0 20px ${R.glow}`;
          emojiSpan.style.filter = 'grayscale(0) brightness(1)';
        }
        else if (avail) {
          nd.classList.add('avl');
          emojiSpan.style.filter = 'grayscale(0.8) brightness(0.4)';
        }
        else {
          nd.classList.add('lck');
          emojiSpan.style.filter = 'grayscale(1) brightness(0.2)';
        }

        const lbl = document.createElement('div');
        lbl.className = 'nlbl';
        lbl.textContent = node.stat;

        const tt = document.createElement('div');
        tt.className = 'ntt';
        const cur = G.stats[node.key];
        tt.innerHTML = `
          <div class="ntt-t">${node.icon} ${node.stat}</div>
          <div class="ntt-b">Actual: ${cur}</div>
          <div class="ntt-a">+ ${node.gain} tras mejora</div>
          <div class="ntt-b">Costo: ${node.cost} PC</div>
        `;
        if (pos.x > 60) {
          tt.style.left='auto';
          tt.style.right='46px';
        }

        if (!active && !isFut && isCur) wrap.onclick = () => buyNode(i);

        wrap.appendChild(nd);
        wrap.appendChild(lbl);
        wrap.appendChild(tt);
        cnst.appendChild(wrap);
      });
    }

    function buyNode(idx) {
      const R = RANKS[G.curRank];
      const node = R.nodes[idx];
      if (G.nodes[G.curRank][idx]) return;
      if (G.pts < node.cost) { flashStatus('❌ PC Insuficientes'); return; }

      G.pts -= node.cost;
      G.nodes[G.curRank][idx] = true;
      G.stats[node.key] += node.gain;

      animatePts();
      boostStat(node.key);
      flashStatus(`✓ ${node.stat} +${node.gain} desbloqueado`);

      const allDone = G.nodes[G.curRank].every(Boolean);
      if (allDone && !G.done[G.curRank]) {
        G.done[G.curRank] = true;
        render();
        setTimeout(showAscension, 350);
      } else {
        render();
      }
    }

    function showAscension() {
      const R = RANKS[G.curRank];
      const ems = ['⭐','🌟','💛','💎','🔥'];
      q('asc-em').textContent = ems[G.curRank];
      q('asc-ttl').textContent = `RANGO ${R.id} COMPLETADO`;
      const next = RANKS[G.curRank + 1];
      q('asc-sub').textContent = next
        ? `Ascendiendo a ${next.name}…`
        : '¡Has alcanzado la Cima Legendaria!';

      const ov = q('asc-ov');
      ov.style.setProperty('--rc', R.color);
      ov.classList.add('show');

      setTimeout(() => {
        ov.classList.remove('show');
        if (G.curRank < 4) {
          G.curRank++;
          G.viewRank = G.curRank;
        }
        render();
      }, 2800);
    }

    function viewRank(ri) {
      G.viewRank = ri;
      render();
    }

    function addPoints() {
      const earned = Math.floor(Math.random() * 18) + 8;
      G.pts += earned;
      animatePts();
      flashStatus(`+${earned} PC ganados en batalla`);
      render();
    }

    function init() {
      let d = 0;
      const target = G.pts;
      const iv = setInterval(() => {
        d = Math.min(d + 2, target);
        q('pts-val').textContent = String(d).padStart(4,'0');
        if (d >= target) clearInterval(iv);
      }, 25);
      render();
    }

    return { init, viewRank, addPoints, render };
  }

  window.createRanksLogic = createRanksLogic;
})();
