(() => {
  const BATTLE_RANKS = ['Genin', 'Chunin', 'Jonin', 'Anbu', 'Kage'];
  const AVATARS = ['🥷', '🔥', '⚡', '🌀', '🌙', '🐉', '🦊', '❄️', '💨', '🛡️'];
  const PLAYER_KEY = 'batallas_ninja_state_v1';

  const NINJA_POOL = [
    'Naruto Uzumaki', 'Sasuke Uchiha', 'Kakashi Hatake', 'Sakura Haruno', 'Itachi Uchiha',
    'Jiraiya', 'Hinata Hyuga', 'Gaara', 'Shikamaru Nara', 'Minato Namikaze',
    'Madara Uchiha', 'Obito Uchiha', 'Orochimaru', 'Tsunade', 'Rock Lee',
    'Neji Hyuga', 'Nagato (Pain)', 'Konan', 'Killer Bee', 'Temari',
    'Kankuro', 'Ino Yamanaka', 'Choji Akimichi', 'Asuma Sarutobi', 'Hiruzen Sarutobi',
    'Hashirama Senju', 'Tobirama Senju', 'Kushina Uzumaki', 'Sai', 'Yamato',
    'Kisame Hoshigaki', 'Deidara', 'Sasori', 'Hidan', 'Kakuzu',
    'Zetsu', 'Kabuto Yakushi', 'Kaguya Otsutsuki', 'Iruka Umino', 'Shino Aburame',
    'Kiba Inuzuka', 'Akamaru', 'Tenten', 'Guy Might', 'Suigetsu Hozuki',
    'Karin Uzumaki', 'Jugo', 'Danzo Shimura', 'Shisui Uchiha', 'Rin Nohara',
    'Yahiko', 'Konohamaru Sarutobi', 'Hanabi Hyuga', 'Hiashi Hyuga', 'Hizashi Hyuga',
    'Kimimaro', 'Haku', 'Zabuza Momochi', 'Cuarto Raikage', 'Onoki',
    'Darui', 'Chojuro', 'Anko Mitarashi', 'Shizune', 'Kurenai Yuhi',
    'Gamabunta', 'Katsuyu', 'Manda', 'Kurama', 'Shukaku',
    'Hagoromo Otsutsuki', 'Hamura Otsutsuki', 'Indra Otsutsuki', 'Ashura Otsutsuki', 'Toneri Otsutsuki',
    'Cuarto Kazekage', 'Chiyo', 'Ebizo', 'Utakata', 'Fuu',
    'Roshi', 'Han', 'Yugito Nii', 'Yagura', 'Ibiki Morino',
    'Mei Terumi', 'Ao', 'Baki', 'Kotetsu Hagane', 'Izumo Kamizuki',
    'Genma Shiranui', 'Hayate Gekko', 'Might Duy', 'Sakumo Hatake', 'Kurenai',
    'Shisui', 'Fugaku Uchiha', 'Mikoto Uchiha', 'Udon Ise', 'Moegi Kazamatsuri',
    'Kawaki', 'Boruto Uzumaki', 'Sarada Uchiha', 'Mitsuki', 'Delta'
  ];

  const FORMULAS = [
    { hp: l => 80 + (12 * (l - 1)), atk: l => 22 + (11 * (l - 1)), def: l => 5 + (4 * (l - 1)), spd: l => 120 + (5 * (l - 1)), crt: l => 8 + (0.6 * (l - 1)), eva: l => 10 + (0.5 * (l - 1)), res: l => 50 + (8 * (l - 1)) },
    { hp: l => 90 + (15 * (l - 1)), atk: l => 28 + (16 * (l - 1)), def: l => 6 + (3 * (l - 1)), spd: l => 95 + (2 * (l - 1)), crt: l => 4 + (0.2 * (l - 1)), eva: l => 3 + (0.1 * (l - 1)), res: l => 140 + (28 * (l - 1)) },
    { hp: l => 115 + (20 * (l - 1)), atk: l => 20 + (13 * (l - 1)), def: l => 8 + (7 * (l - 1)), spd: l => 105 + (3 * (l - 1)), crt: l => 12 + (0.8 * (l - 1)), eva: l => 5 + (0.2 * (l - 1)), res: l => 75 + (12 * (l - 1)) },
    { hp: l => 105 + (18 * (l - 1)), atk: l => 12 + (4 * (l - 1)), def: l => 12 + (9 * (l - 1)), spd: l => 90 + (2 * (l - 1)), crt: l => 2 + (0.05 * (l - 1)), eva: l => 4 + (0.15 * (l - 1)), res: l => 180 + (35 * (l - 1)) },
    { hp: l => 100 + (20 * (l - 1)), atk: l => 18 + (8 * (l - 1)), def: l => 8 + (5 * (l - 1)), spd: l => 100 + (2 * (l - 1)), crt: l => 5 + (0.2 * (l - 1)), eva: l => 2 + (0.1 * (l - 1)), res: l => 80 + (15 * (l - 1)) },
    { hp: l => 85 + (14 * (l - 1)), atk: l => 14 + (7 * (l - 1)), def: l => 6 + (4 * (l - 1)), spd: l => 110 + (3.5 * (l - 1)), crt: l => 3 + (0.15 * (l - 1)), eva: l => 8 + (0.4 * (l - 1)), res: l => 200 + (40 * (l - 1)) },
    { hp: l => 130 + (22 * (l - 1)), atk: l => 16 + (9 * (l - 1)), def: l => 9 + (6 * (l - 1)), spd: l => 90 + (1.5 * (l - 1)), crt: l => 2 + (0.1 * (l - 1)), eva: l => 1 + (0.05 * (l - 1)), res: l => 120 + (25 * (l - 1)) },
    { hp: l => 150 + (28 * (l - 1)), atk: l => 35 + (18 * (l - 1)), def: l => 2 + (1 * (l - 1)), spd: l => 85 + (1 * (l - 1)), crt: l => 15 + (1.2 * (l - 1)), eva: l => 0 + (0 * (l - 1)), res: l => 50 + (5 * (l - 1)) }
  ];

  function getReward(rank) {
    if (rank === 1) return '🥇 15000 oro + 25 pts Jutsus';
    if (rank === 2) return '🥈 10000 oro + 15 pts Jutsus';
    if (rank === 3) return '🥉 7000 oro + 10 pts Jutsus';
    if (rank <= 10) return '🏅 4000 oro + 6 pts Jutsus';
    if (rank <= 25) return '🎖️ 1000 oro + 2 pts Jutsus';
    if (rank <= 70) return '🪙 300 oro';
    return '—';
  }

  function rankClass(rank) {
    if (rank === 1) return 'bn-rank-first';
    if (rank <= 3) return 'bn-rank-top3';
    if (rank <= 10) return 'bn-rank-top10';
    if (rank <= 25) return 'bn-rank-top25';
    return '';
  }

  function nowSec() {
    return Math.floor(Date.now() / 1000);
  }

  function buildNinja(rank, minLevel) {
    const level = Math.floor(Math.random() * (100 - minLevel + 1)) + minLevel;
    const formula = FORMULAS[Math.floor(Math.random() * FORMULAS.length)];
    const baseHp = Math.floor(formula.hp(level));
    return {
      rank,
      level,
      hp: baseHp,
      hpX6: baseHp * 6,
      mp: 50,
      atk: Math.floor(formula.atk(level)),
      def: Math.floor(formula.def(level)),
      spd: Math.floor(formula.spd(level)),
      crt: Math.floor(formula.crt(level)),
      eva: Math.floor(formula.eva(level)),
      res: Math.floor(formula.res(level)),
      className: BATTLE_RANKS[Math.floor(Math.random() * BATTLE_RANKS.length)],
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      firstDelay: Math.floor(Math.random() * (3600 - 60 + 1)) + 60,
      cadence: 7200,
      nextAttackAt: 0,
      trainedOnce: false
    };
  }

  window.mountBatallasNinjaUI = function mountBatallasNinjaUI({ container, getPlayerStats }) {
    const root = document.createElement('div');
    root.className = 'bn-root';
    container.replaceChildren(root);

    const playerStats = getPlayerStats ? getPlayerStats() : { level: 7, atk: 35, def: 18, hp: 200, maxHp: 200, mp: 50, maxMp: 50 };
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem(PLAYER_KEY) || '{}');
      } catch {
        return {};
      }
    })();

    const state = {
      mode: 'menu',
      eventEndAt: saved.eventEndAt && saved.eventEndAt > nowSec() ? saved.eventEndAt : nowSec() + 24 * 3600,
      notifications: [],
      unread: 0,
      logs: [],
      selected: null,
      player: {
        name: 'Tú',
        rank: Number.isInteger(saved.playerRank) ? saved.playerRank : 101,
        level: Math.max(1, Number(playerStats.level || 7)),
        avatar: '🥷',
        hp: Math.max(1, Math.floor(playerStats.maxHp || playerStats.hp || 200)),
        mp: Math.max(1, Math.floor(playerStats.maxMp || playerStats.mp || 50)),
        atk: Math.max(1, Math.floor(playerStats.atk || 35)),
        def: Math.max(1, Math.floor(playerStats.def || 18))
      },
      ninjas: []
    };

    const uniqueNames = [...new Set(NINJA_POOL)].slice(0, 100);
    for (let i = 1; i <= 100; i += 1) {
      const ninja = buildNinja(i, state.player.level);
      ninja.name = uniqueNames[i - 1] || `Ninja ${i}`;
      ninja.nextAttackAt = nowSec() + ninja.firstDelay;
      state.ninjas.push(ninja);
    }

    const ensurePlayerRow = () => {
      if (state.player.rank <= 100) return;
      state.ninjas = state.ninjas.filter((n) => n.rank <= 100);
    };

    const save = () => {
      localStorage.setItem(PLAYER_KEY, JSON.stringify({
        eventEndAt: state.eventEndAt,
        playerRank: state.player.rank
      }));
    };

    const timeLeft = () => Math.max(0, state.eventEndAt - nowSec());
    const fmt = (v) => v.toLocaleString('es-ES');
    const hhmmss = (seconds) => {
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    function getPlayerTargets() {
      const r = state.player.rank;
      return [r - 1, r - 2, r - 3]
        .filter((x) => x >= 1)
        .map((rk) => state.ninjas.find((n) => n.rank === rk))
        .filter(Boolean);
    }

    function addLog(text, type) {
      state.logs.unshift({ text, type, t: new Date().toLocaleTimeString('es-ES', { hour12: false }) });
      if (state.logs.length > 6) state.logs.pop();
    }

    function addNotif(text, type) {
      state.notifications.unshift({ text, type, read: false });
      state.unread = state.notifications.filter((n) => !n.read).length;
    }

    function simulateNpcFight(attacker, defender) {
      const ap = attacker.atk * 2 + attacker.spd * 0.3 + attacker.crt * 0.5;
      const dp = defender.def * 2 + defender.res * 0.25 + defender.eva * 0.45;
      const win = ap * (0.75 + Math.random() * 0.6) > dp * (0.75 + Math.random() * 0.6);
      if (win) {
        const oldAtt = attacker.rank;
        attacker.rank = defender.rank;
        defender.rank = oldAtt;
        state.ninjas.sort((a, b) => a.rank - b.rank);
        addLog(`${attacker.name} venció a ${defender.name} y subió al #${attacker.rank}.`, 'win');
      } else {
        addLog(`${defender.name} defendió el #${defender.rank} contra ${attacker.name}.`, 'lose');
      }

      if (defender.rank === state.player.rank && win) {
        state.player.rank = Math.min(101, state.player.rank + 1);
        addNotif(`${attacker.name} te atacó y bajaste al rango #${state.player.rank}.`, 'lose');
      } else if (defender.rank === state.player.rank && !win) {
        addNotif(`${attacker.name} te atacó pero defendiste tu puesto.`, 'win');
      }
    }

    function simulateGlobal() {
      if (timeLeft() <= 0) return;
      const t = nowSec();
      state.ninjas.forEach((ninja) => {
        if (t < ninja.nextAttackAt) return;
        const up = state.ninjas.filter((n) => n.rank >= ninja.rank - 3 && n.rank < ninja.rank);
        const target = up[Math.floor(Math.random() * up.length)];
        if (target) simulateNpcFight(ninja, target);

        if (!ninja.trainedOnce && Math.random() < 0.1) {
          ninja.level = Math.min(100, ninja.level + 1);
          ninja.trainedOnce = true;
        }
        ninja.nextAttackAt = t + ninja.cadence;
      });
    }

    function fight(enemy) {
      state.mode = 'battle';
      const pHpMax = state.player.hp * 6;
      const eHpMax = enemy.hp * 6;
      let pHp = pHpMax;
      let eHp = eHpMax;

      const panel = document.createElement('div');
      panel.className = 'bn-fight';
      panel.innerHTML = `
        <div class="bn-fighter"><div class="bn-avatar">${state.player.avatar}</div><div class="bn-name">${state.player.name} #${state.player.rank}</div><div class="bn-bar"><span id="bn-ph">${fmt(pHp)}/${fmt(pHpMax)}</span></div><div class="bn-bar bn-mp">MP ${state.player.mp}</div><div class="bn-meta">⚔️ ${state.player.atk} · 🛡️ ${state.player.def}</div></div>
        <div class="bn-vs">⚔️</div>
        <div class="bn-fighter"><div class="bn-avatar">${enemy.avatar}</div><div class="bn-name">${enemy.name} #${enemy.rank}</div><div class="bn-bar"><span id="bn-eh">${fmt(eHp)}/${fmt(eHpMax)}</span></div><div class="bn-bar bn-mp">MP ${enemy.mp}</div><div class="bn-meta">⚔️ ${enemy.atk} · 🛡️ ${enemy.def}</div></div>
        <div class="bn-fight-log" id="bn-fight-log"></div>
      `;
      root.replaceChildren(panel);
      const pTxt = panel.querySelector('#bn-ph');
      const eTxt = panel.querySelector('#bn-eh');
      const l = panel.querySelector('#bn-fight-log');

      const turns = setInterval(() => {
        const pDmg = Math.max(1, state.player.atk - Math.floor(enemy.def * 0.45) + Math.floor(Math.random() * 12));
        eHp -= pDmg;
        l.innerHTML = `<div>🌀 Tú golpeas por ${pDmg}</div>${l.innerHTML}`;
        eTxt.textContent = `${fmt(Math.max(0, eHp))}/${fmt(eHpMax)}`;
        if (eHp <= 0) return done(true);

        const eDmg = Math.max(1, enemy.atk - Math.floor(state.player.def * 0.45) + Math.floor(Math.random() * 12));
        pHp -= eDmg;
        l.innerHTML = `<div>💥 ${enemy.name} golpea por ${eDmg}</div>${l.innerHTML}`;
        pTxt.textContent = `${fmt(Math.max(0, pHp))}/${fmt(pHpMax)}`;
        if (pHp <= 0) return done(false);
      }, 600);

      function done(win) {
        clearInterval(turns);
        const msg = document.createElement('div');
        msg.className = `bn-result ${win ? 'win' : 'lose'}`;
        msg.textContent = win ? '🏆 GANASTE' : '💀 PERDISTE';
        panel.appendChild(msg);

        if (win) {
          const old = state.player.rank;
          state.player.rank = enemy.rank;
          enemy.rank = old;
          addLog(`Tú venciste a ${enemy.name} y subiste al #${state.player.rank}.`, 'win');
          addNotif(`${enemy.name} te atacó pero defendiste tu puesto.`, 'win');
          if (Math.random() < 0.1) {
            enemy.level = Math.min(100, enemy.level + 1);
          }
        } else {
          addLog(`Perdiste vs ${enemy.name}. Te mantienes en #${state.player.rank}.`, 'lose');
          addNotif(`${enemy.name} te atacó y bajaste al rango #${state.player.rank}.`, 'lose');
        }

        state.ninjas.sort((a, b) => a.rank - b.rank);
        save();
        setTimeout(renderMain, 3000);
      }
    }

    function renderLeaderboard() {
      const list = state.ninjas.slice().sort((a, b) => a.rank - b.rank);
      const overlay = document.createElement('div');
      overlay.className = 'bn-overlay';
      overlay.innerHTML = `<button class="bn-close">✕</button><div class="bn-title">🏆 BATALLAS NINJA — 100 NINJAS</div><div class="bn-timer">⏳ ${hhmmss(timeLeft())}</div><div class="bn-list"></div>`;
      const listEl = overlay.querySelector('.bn-list');

      list.forEach((n) => {
        const row = document.createElement('div');
        row.className = `bn-row ${rankClass(n.rank)} ${n.rank === state.player.rank ? 'player' : ''}`;
        row.innerHTML = `<span>#${n.rank}</span><span>${n.avatar} ${n.name}</span><span>${getReward(n.rank)}</span>`;
        listEl.appendChild(row);
      });

      overlay.querySelector('.bn-close').addEventListener('click', () => {
        overlay.remove();
      });
      root.appendChild(overlay);
    }

    function renderNotifications() {
      const overlay = document.createElement('div');
      overlay.className = 'bn-overlay';
      overlay.innerHTML = `<button class="bn-close">✕</button><div class="bn-title">💬 NOTIFICACIONES</div><div class="bn-news"></div>`;
      const list = overlay.querySelector('.bn-news');
      if (!state.notifications.length) {
        list.innerHTML = '<div class="bn-line">Sin reportes por ahora.</div>';
      } else {
        state.notifications.forEach((n) => {
          const line = document.createElement('div');
          line.className = `bn-line ${n.type}`;
          line.textContent = n.text;
          list.appendChild(line);
          n.read = true;
        });
      }
      state.unread = 0;
      overlay.querySelector('.bn-close').addEventListener('click', () => {
        overlay.remove();
        renderMain();
      });
      root.appendChild(overlay);
    }

    function renderMain() {
      ensurePlayerRow();
      state.mode = 'main';
      const targets = getPlayerTargets();
      const topLogs = state.logs.map((item) => `<div class="bn-log ${item.type}"><span>${item.t}</span> ${item.text}</div>`).join('');
      root.innerHTML = `
        <div class="bn-top">
          <button class="bn-icon" id="bn-msg">💬 ${state.unread > 0 ? `<b>${state.unread}</b>` : ''}</button>
          <div class="bn-player">🥷 Rango #${state.player.rank} · Lv.${state.player.level}</div>
          <button class="bn-icon" id="bn-cup">🏆 100</button>
        </div>
        <div class="bn-time">⏱️ Evento termina en: <b>${hhmmss(timeLeft())}</b></div>
        <div class="bn-title">⚔️ BATALLAS NINJA</div>
        <div class="bn-cards"></div>
        <div class="bn-history"><h4>📜 Últimos combates</h4>${topLogs || '<div class="bn-log">Esperando actividad...</div>'}</div>
      `;

      const cards = root.querySelector('.bn-cards');
      targets.forEach((n) => {
        const card = document.createElement('button');
        card.className = 'bn-card';
        card.innerHTML = `<div class="bn-avatar">${n.avatar}</div><div><div class="bn-name">${n.name}</div><div class="bn-sub">#${n.rank} · ${n.className} · Lv.${n.level}</div><div class="bn-sub">❤️ ${fmt(n.hpX6)} · ⚔️ ${n.atk} · 🛡️ ${n.def}</div></div>`;
        card.addEventListener('click', () => fight(n));
        cards.appendChild(card);
      });

      root.querySelector('#bn-cup').addEventListener('click', renderLeaderboard);
      root.querySelector('#bn-msg').addEventListener('click', renderNotifications);
    }

    root.innerHTML = `
      <div class="bn-menu">
        <div class="bn-title">⚔️ BATALLAS</div>
        <button class="bn-start">🥷 BATALLAS NINJA</button>
      </div>
    `;

    const timerId = setInterval(() => {
      simulateGlobal();
      if (state.mode === 'main') renderMain();
      save();
    }, 1000);

    root.querySelector('.bn-start').addEventListener('click', renderMain);

    return {
      destroy() {
        clearInterval(timerId);
        save();
        root.remove();
      }
    };
  };
})();
