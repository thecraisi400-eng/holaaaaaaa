(() => {
  const $ = (s) => document.querySelector(s);
  const main = $('#mainView');
  const notifBadge = $('#notifBadge');
  const eventStart = Number(localStorage.getItem('ninja_event_start')) || Date.now();
  localStorage.setItem('ninja_event_start', String(eventStart));

  const ranks = ['Genin', 'Chunin', 'Jonin', 'Ambu', 'Kage'];
  const formulas = [
    (n) => ({ hp: 80 + 12 * (n - 1), atk: 22 + 11 * (n - 1), def: 5 + 4 * (n - 1), mp: 50 + 8 * (n - 1) }),
    (n) => ({ hp: 90 + 15 * (n - 1), atk: 28 + 16 * (n - 1), def: 6 + 3 * (n - 1), mp: 140 + 28 * (n - 1) }),
    (n) => ({ hp: 115 + 20 * (n - 1), atk: 20 + 13 * (n - 1), def: 8 + 7 * (n - 1), mp: 75 + 12 * (n - 1) }),
    (n) => ({ hp: 105 + 18 * (n - 1), atk: 12 + 4 * (n - 1), def: 12 + 9 * (n - 1), mp: 180 + 35 * (n - 1) }),
    (n) => ({ hp: 100 + 20 * (n - 1), atk: 18 + 8 * (n - 1), def: 8 + 5 * (n - 1), mp: 80 + 15 * (n - 1) }),
    (n) => ({ hp: 85 + 14 * (n - 1), atk: 14 + 7 * (n - 1), def: 6 + 4 * (n - 1), mp: 200 + 40 * (n - 1) }),
    (n) => ({ hp: 130 + 22 * (n - 1), atk: 16 + 9 * (n - 1), def: 9 + 6 * (n - 1), mp: 120 + 25 * (n - 1) }),
    (n) => ({ hp: 150 + 28 * (n - 1), atk: 35 + 18 * (n - 1), def: 2 + 1 * (n - 1), mp: 50 + 5 * (n - 1) }),
    (n) => ({ hp: 110 + 18 * (n - 1), atk: 10 + 5 * (n - 1), def: 12 + 8 * (n - 1), mp: 150 + 30 * (n - 1) }),
    (n) => ({ hp: 75 + 11 * (n - 1), atk: 20 + 10 * (n - 1), def: 4 + 3 * (n - 1), mp: 60 + 10 * (n - 1) }),
    (n) => ({ hp: 95 + 16 * (n - 1), atk: 24 + 12 * (n - 1), def: 7 + 5 * (n - 1), mp: 90 + 18 * (n - 1) }),
    (n) => ({ hp: 120 + 22 * (n - 1), atk: 12 + 6 * (n - 1), def: 15 + 10 * (n - 1), mp: 250 + 50 * (n - 1) }),
    (n) => ({ hp: 80 + 35 * (n - 1), atk: 10 + 20 * (n - 1), def: 5 + 15 * (n - 1), mp: 50 + 45 * (n - 1) }),
    (n) => ({ hp: 160 + 12 * (n - 1), atk: 40 + 6 * (n - 1), def: 20 + 4 * (n - 1), mp: 100 + 10 * (n - 1) }),
    (n) => ({ hp: 90 + 15 * (n - 1), atk: 15 + 8 * (n - 1), def: 8 + 6 * (n - 1), mp: 130 + 25 * (n - 1) }),
    (n) => ({ hp: 140 + 20 * (n - 1), atk: 30 + 15 * (n - 1), def: 5 + 3 * (n - 1), mp: 40 + 5 * (n - 1) }),
    (n) => ({ hp: 120 + 24 * (n - 1), atk: 25 + 14 * (n - 1), def: 10 + 7 * (n - 1), mp: 180 + 35 * (n - 1) }),
    (n) => ({ hp: 110 + 20 * (n - 1), atk: 18 + 10 * (n - 1), def: 11 + 8 * (n - 1), mp: 110 + 20 * (n - 1) }),
    (n) => ({ hp: 100 + 17 * (n - 1), atk: 22 + 12 * (n - 1), def: 14 + 9 * (n - 1), mp: 100 + 22 * (n - 1) }),
    (n) => ({ hp: 110 + 22 * (n - 1), atk: 14 + 6 * (n - 1), def: 12 + 8 * (n - 1), mp: 160 + 32 * (n - 1) }),
    (n) => ({ hp: 80 + 13 * (n - 1), atk: 26 + 14 * (n - 1), def: 4 + 2 * (n - 1), mp: 70 + 10 * (n - 1) }),
    (n) => ({ hp: 140 + 26 * (n - 1), atk: 22 + 11 * (n - 1), def: 10 + 6 * (n - 1), mp: 120 + 24 * (n - 1) }),
    (n) => ({ hp: 95 + 16 * (n - 1), atk: 18 + 9 * (n - 1), def: 7 + 5 * (n - 1), mp: 100 + 18 * (n - 1) }),
    (n) => ({ hp: 170 + 30 * (n - 1), atk: 10 + 5 * (n - 1), def: 18 + 14 * (n - 1), mp: 220 + 45 * (n - 1) }),
    (n) => ({ hp: 100 + 18 * (n - 1), atk: 32 + 16 * (n - 1), def: 3 + 2 * (n - 1), mp: 60 + 12 * (n - 1) }),
    (n) => ({ hp: 125 + 21 * (n - 1), atk: 20 + 10 * (n - 1), def: 9 + 7 * (n - 1), mp: 140 + 26 * (n - 1) }),
    (n) => ({ hp: 70 + 10 * (n - 1), atk: 15 + 7 * (n - 1), def: 5 + 3 * (n - 1), mp: 80 + 14 * (n - 1) }),
    (n) => ({ hp: 135 + 24 * (n - 1), atk: 28 + 13 * (n - 1), def: 6 + 5 * (n - 1), mp: 90 + 20 * (n - 1) }),
    (n) => ({ hp: 115 + 19 * (n - 1), atk: 16 + 8 * (n - 1), def: 14 + 10 * (n - 1), mp: 280 + 55 * (n - 1) }),
    (n) => ({ hp: 105 + 17 * (n - 1), atk: 25 + 12 * (n - 1), def: 8 + 6 * (n - 1), mp: 115 + 22 * (n - 1) }),
    (n) => ({ hp: 155 + 27 * (n - 1), atk: 38 + 17 * (n - 1), def: 4 + 3 * (n - 1), mp: 55 + 8 * (n - 1) }),
    (n) => ({ hp: 90 + 14 * (n - 1), atk: 12 + 5 * (n - 1), def: 11 + 9 * (n - 1), mp: 300 + 60 * (n - 1) }),
    (n) => ({ hp: 120 + 23 * (n - 1), atk: 21 + 11 * (n - 1), def: 12 + 8 * (n - 1), mp: 130 + 28 * (n - 1) }),
    (n) => ({ hp: 85 + 12 * (n - 1), atk: 30 + 15 * (n - 1), def: 5 + 4 * (n - 1), mp: 45 + 6 * (n - 1) })
  ];

  const baseNames = [
    'Naruto Uzumaki','Sasuke Uchiha','Kakashi Hatake','Sakura Haruno','Itachi Uchiha','Jiraiya','Hinata Hyuga','Gaara','Shikamaru Nara','Minato Namikaze','Madara Uchiha','Obito Uchiha','Orochimaru','Tsunade','Rock Lee','Neji Hyuga','Nagato (Pain)','Konan','Killer Bee','Temari','Kankuro','Ino Yamanaka','Choji Akimichi','Asuma Sarutobi','Hiruzen Sarutobi','Hashirama Senju','Tobirama Senju','Kushina Uzumaki','Sai','Yamato','Kisame Hoshigaki','Deidara','Sasori','Hidan','Kakuzu','Zetsu','Kabuto Yakushi','Kaguya Otsutsuki','Iruka Umino','Shino Aburame','Kiba Inuzuka','Akamaru','Tenten','Guy Might','Suigetsu Hozuki','Karin Uzumaki','Jugo','Danzo Shimura','Shisui Uchiha','Rin Nohara','Yahiko','Konohamaru Sarutobi','Hanabi Hyuga','Hiashi Hyuga','Hizashi Hyuga','Kimimaro','Haku','Zabuza Momochi','Cuarto Raikage','Onoki','Darui','Chojuro','Anko Mitarashi','Shizune','Kurenai Yuhi','Gamabunta','Katsuyu','Manda','Kurama','Shukaku','Hagoromo Otsutsuki','Hamura Otsutsuki','Indra Otsutsuki','Ashura Otsutsuki','Toneri Otsutsuki','Cuarto Kazekage','Chiyo','Ebizo','Utakata','Fuu','Roshi','Han','Yugito Nii','Yagura','Ibiki Morino'
  ];

  const unique = [...new Set(baseNames)];
  while (unique.length < 100) unique.push(`Shinobi Extra ${unique.length + 1}`);

  const state = {
    player: { name: 'Tu Ninja 🥷', level: 7, rank: 101, hp: 180, mp: 100, atk: 36, def: 18, jutsuPts: 0, oro: 0 },
    npcs: unique.slice(0, 100).map((name, i) => {
      const level = i + 1;
      const st = formulas[Math.floor(Math.random() * formulas.length)](level);
      const cadence = 60000 + Math.floor(Math.random() * (10800000 - 60000));
      return { name, rank: i + 1, level, ...st, cadence, nextAttackAt: Date.now() + cadence };
    }),
    news: [],
    notif: 0,
    lastCombats: []
  };

  function byRank(rank) { return state.npcs.find((n) => n.rank === rank); }
  function rewardFor(rank) {
    if (rank === 1) return '15.000 oro + 25 pts jutsu';
    if (rank === 2) return '10.000 oro + 15 pts jutsu';
    if (rank === 3) return '7.000 oro + 10 pts jutsu';
    if (rank <= 10) return '4.000 oro + 6 pts jutsu';
    if (rank <= 25) return '1.000 oro + 2 pts jutsu';
    if (rank <= 70) return '300 oro + 0 pts jutsu';
    return '100 oro + 0 pts jutsu';
  }
  function rewardApply(rank) {
    if (rank === 1) { state.player.oro += 15000; state.player.jutsuPts += 25; return; }
    if (rank === 2) { state.player.oro += 10000; state.player.jutsuPts += 15; return; }
    if (rank === 3) { state.player.oro += 7000; state.player.jutsuPts += 10; return; }
    if (rank <= 10) { state.player.oro += 4000; state.player.jutsuPts += 6; return; }
    if (rank <= 25) { state.player.oro += 1000; state.player.jutsuPts += 2; return; }
    if (rank <= 70) { state.player.oro += 300; }
  }

  function selectThreeTargets() {
    const r = state.player.rank;
    return [r - 1, r - 2, r - 3].filter((x) => x >= 1).map((rk) => {
      const npc = byRank(rk);
      const level = Math.max(state.player.level, Math.min(100, npc?.level || rk));
      const stats = formulas[Math.floor(Math.random() * formulas.length)](level);
      return { ...npc, ...stats, level, title: ranks[Math.floor(Math.random() * ranks.length)] };
    });
  }

  function fightSim(a, b) {
    let ahp = a.hp * 6;
    let bhp = b.hp * 6;
    while (ahp > 0 && bhp > 0) {
      bhp -= Math.max(1, a.atk - Math.floor(b.def * 0.45));
      if (bhp <= 0) break;
      ahp -= Math.max(1, b.atk - Math.floor(a.def * 0.45));
    }
    return ahp > 0;
  }

  function swapRanksIfPlayerWin(enemyRank) {
    const old = state.player.rank;
    const enemy = byRank(enemyRank);
    if (!enemy) return;
    enemy.rank = old;
    state.player.rank = enemyRank;
    state.npcs.sort((a, b) => a.rank - b.rank);
  }

  function logCombat(text) {
    state.lastCombats.unshift(text);
    if (state.lastCombats.length > 6) state.lastCombats.pop();
  }

  function runNpcWorld() {
    const now = Date.now();
    for (const n of state.npcs) {
      while (n.nextAttackAt <= now && now - eventStart <= 86400000) {
        const targetRank = n.rank - (1 + Math.floor(Math.random() * 3));
        if (targetRank < 1) { n.nextAttackAt += n.cadence; continue; }
        if (state.player.rank === targetRank) {
          const won = fightSim(n, state.player);
          state.notif += 1;
          if (won) {
            const prev = state.player.rank;
            state.player.rank = n.rank;
            n.rank = prev;
            state.news.unshift({ win: false, txt: `${n.name} te atacó y bajaste al rango #${state.player.rank}.` });
          } else {
            state.news.unshift({ win: true, txt: `${n.name} te atacó pero defendiste tu puesto.` });
          }
        } else {
          const target = byRank(targetRank);
          if (target && fightSim(n, target)) {
            const from = n.rank;
            n.rank = target.rank;
            target.rank = from;
          }
        }
        n.nextAttackAt += n.cadence;
      }
    }
    state.npcs.sort((a, b) => a.rank - b.rank);
    if (state.news.length > 20) state.news.length = 20;
    renderHome();
  }

  function renderRanking() {
    const remain = Math.max(0, 86400000 - (Date.now() - eventStart));
    const hh = String(Math.floor(remain / 3600000)).padStart(2, '0');
    const mm = String(Math.floor((remain % 3600000) / 60000)).padStart(2, '0');
    const ss = String(Math.floor((remain % 60000) / 1000)).padStart(2, '0');
    main.innerHTML = `<section class="screen"><div class="pill">🏆 BATALLAS NINJA | ⏳ ${hh}:${mm}:${ss}</div>${state.npcs.map(n => {
      const cls = n.rank === 1 ? 'r1' : n.rank <= 3 ? 'r23' : n.rank <= 10 ? 'r410' : n.rank <= 25 ? 'r1125' : '';
      const me = state.player.rank === n.rank ? 'you' : '';
      return `<div class="ranking-item ${cls} ${me}"><b>#${n.rank}</b><span>${n.name} · Recompensa: ${rewardFor(n.rank)}</span></div>`;
    }).join('')}<div class="pill">🥷 Tu posición actual: #${state.player.rank} | Oro: ${state.player.oro} | Pts Jutsu: ${state.player.jutsuPts}</div></section>`;
  }

  function renderInbox() {
    notifBadge.classList.add('hidden');
    state.notif = 0;
    main.innerHTML = `<section class="screen"><div class="pill">💬 Noticias de combate</div>${state.news.map(n => `<div class="tiny ${n.win ? 'good' : 'bad'}">${n.txt}</div>`).join('') || '<div class="tiny">Sin novedades.</div>'}</section>`;
  }

  function renderFight(enemy) {
    let pHp6 = state.player.hp * 6;
    let eHp6 = enemy.hp * 6;
    const pMax = pHp6;
    const eMax = eHp6;

    const draw = () => {
      main.innerHTML = `<section class="screen"><div class="fight-layout">
        <div class="fighter"><div class="avatar">🥷</div><b>${state.player.name}</b>
        <div class="bar"><div class="fill-hp" style="width:${Math.max(0, pHp6 / pMax * 100)}%"></div></div>
        <div class="bar"><div class="fill-mp" style="width:${Math.max(0, state.player.mp)}%"></div></div>
        <div>ATK ${state.player.atk} · DEF ${state.player.def}</div></div>
        <div class="fighter"><div class="avatar">👤</div><b>${enemy.name}</b>
        <div class="bar"><div class="fill-hp" style="width:${Math.max(0, eHp6 / eMax * 100)}%"></div></div>
        <div class="bar"><div class="fill-mp" style="width:${Math.max(0, enemy.mp % 100)}%"></div></div>
        <div>ATK ${enemy.atk} · DEF ${enemy.def}</div></div></div></section>`;
    };
    draw();

    const timer = setInterval(() => {
      eHp6 -= Math.max(1, state.player.atk - Math.floor(enemy.def * 0.45));
      if (eHp6 <= 0) {
        clearInterval(timer);
        showResult(true, enemy);
        return;
      }
      pHp6 -= Math.max(1, enemy.atk - Math.floor(state.player.def * 0.45));
      if (pHp6 <= 0) {
        clearInterval(timer);
        showResult(false, enemy);
        return;
      }
      draw();
    }, 300);
  }

  function showResult(won, enemy) {
    const res = document.createElement('div');
    res.className = 'center-overlay';
    res.textContent = won ? 'GANASTE 🎉' : 'PERDISTE 💀';
    main.appendChild(res);
    if (won) {
      const oldRank = state.player.rank;
      swapRanksIfPlayerWin(enemy.rank);
      rewardApply(state.player.rank);
      logCombat(`#${state.player.rank} ${state.player.name} venció a ${enemy.name}.`);
      if (oldRank === 16 && Math.random() < 0.10) {
        enemy.level += 1;
        enemy.hp += 20;
        state.news.unshift({ win: false, txt: `${enemy.name} entrenó y volverá a desafiarte pronto.` });
      }
    } else {
      logCombat(`#${enemy.rank} ${enemy.name} venció a ${state.player.name}.`);
    }
    setTimeout(renderHome, 3000);
  }

  function renderHome() {
    const targets = selectThreeTargets();
    notifBadge.textContent = state.notif;
    notifBadge.classList.toggle('hidden', state.notif === 0);

    main.innerHTML = `<section class="screen">
      <button class="pill" id="btnScroll">📜 BATALLAS NINJA (scroll)</button>
      <div class="tiny">📢 Evento activo 24h | Nivel jugador ${state.player.level} | Enemigos nivel ${state.player.level}-100</div>
      <div class="pill">🥷 Tu rango actual: #${state.player.rank} | Solo puedes retar #${Math.max(1, state.player.rank - 1)}, #${Math.max(1, state.player.rank - 2)}, #${Math.max(1, state.player.rank - 3)}</div>
      <div class="row">${targets.map((e) => `<article class="enemy-card"><div class="avatar">🖼️</div><b>#${e.rank} ${e.name}</b><div>${e.title}</div><div>HP ${Math.round(e.hp)}</div><div>ATK ${Math.round(e.atk)}</div><div>DEF ${Math.round(e.def)}</div><button data-rank="${e.rank}" class="btnFight">⚔️ Desafiar</button></article>`).join('')}</div>
      <div class="pill">🧾 Últimos combates (máx 6)</div>
      <div class="log-box">${state.lastCombats.map((l) => `<div>${l}</div>`).join('') || '<div>Sin resultados aún.</div>'}</div>
    </section>`;

    $('#btnScroll')?.addEventListener('click', renderHome);
    document.querySelectorAll('.btnFight').forEach((b) => b.addEventListener('click', () => {
      const enemy = byRank(Number(b.dataset.rank));
      if (enemy) renderFight(enemy);
    }));
  }

  $('#btnRanking').addEventListener('click', renderRanking);
  $('#btnInbox').addEventListener('click', renderInbox);

  renderHome();
  setInterval(() => {
    if (main.innerHTML.includes('BATALLAS NINJA |')) renderRanking();
    runNpcWorld();
  }, 1000);
})();
