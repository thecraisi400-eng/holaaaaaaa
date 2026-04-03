(() => {
  const NINJA_NAMES = [
    'Naruto Uzumaki','Sasuke Uchiha','Kakashi Hatake','Sakura Haruno','Itachi Uchiha',
    'Jiraiya','Hinata Hyuga','Gaara','Shikamaru Nara','Minato Namikaze',
    'Madara Uchiha','Obito Uchiha','Orochimaru','Tsunade','Rock Lee',
    'Neji Hyuga','Kiba Inuzuka','Nagato Pain','Konan','Killer Bee',
    'Temari','Kankuro','Ino Yamanaka','Choji Akimichi','Asuma Sarutobi',
    'Hiruzen Sarutobi','Hashirama Senju','Tobirama Senju','Kushina Uzumaki','Sai',
    'Yamato','Kisame Hoshigaki','Deidara','Sasori','Hidan',
    'Kakuzu','Zetsu','Kabuto Yakushi','Kaguya Otsutsuki','Iruka Umino',
    'Shino Aburame','Akamaru','Tenten','Guy Might','Suigetsu Hozuki',
    'Karin Uzumaki','Jugo','Danzo Shimura','Shisui Uchiha','Rin Nohara',
    'Yahiko','Konohamaru','Might Guy','Hanabi Hyuga','Hiashi Hyuga',
    'Hizashi Hyuga','Kimimaro','Haku','Zabuza Momochi','Kushina N',
    'Ay Raikage','Onoki','Darui','Chojuro','Mei Terumi',
    'Anko Mitarashi','Shizune','Kurenai Yuhi','Kotetsu Hagane','Izumo Kamizuki',
    'Baki','Gamabunta','Katsuyu','Manda','Kurama','Shukaku','Gyuki',
    'Hagoromo Otsutsuki','Hamura Otsutsuki','Indra Otsutsuki','Ashura Otsutsuki','Toneri Otsutsuki',
    'Cuarto Kazekage','Chiyo','Ebizo','Mizukage','Utakata',
    'Fuu','Roshi','Han','Yugito Nii','Yagura',
    'Ao','Mei Terumi','Chojuro B','Ibiki Morino','Anko Mitarashi',
    'Shizune B','Kurenai Y','Kotetsu H','Izumo K','Baki B'
  ];

  const RANKS = ['Genin', 'Chunin', 'Jonin', 'Anbu', 'Kage'];
  const RANK_CLASSES = ['rank-genin', 'rank-chunin', 'rank-jonin', 'rank-anbu', 'rank-kage'];
  const EMOJIS = ['🔥','🌪️','🌙','⭐','🗡️','🦊','❄️','🌀','💀','⚡','🐍','🐸','🦅','🐺'];

  function getRankColorClass(rank) {
    if (rank === 1) return 'top1';
    if (rank <= 3) return 'top3';
    if (rank <= 10) return 'top10';
    if (rank <= 25) return 'top25';
    return '';
  }

  function cloneAndBind(root, selector, eventName, handler) {
    const oldNode = root.querySelector(selector);
    if (!oldNode) return null;
    const newNode = oldNode.cloneNode(true);
    oldNode.replaceWith(newNode);
    newNode.addEventListener(eventName, handler);
    return newNode;
  }

  function createBatallasNinjaUI(options) {
    const { container, getPlayerStats, onCombatStateChange, onRewardGain, onPlayerAttack } = options;

    const root = document.createElement('div');
    root.className = 'batallas-ninja';
    root.innerHTML = `
      <div id="game-container">
        <div id="main-menu"><button class="menu-btn" id="btn-enter-batallas">⚔️ BATALLA NINJA</button></div>
        <div id="game-content">
          <div id="top-bar">
            <div class="top-icon" id="msg-btn">💬 <span class="badge" id="msg-badge" style="display:none">0</span></div>
            <div id="player-info">🥷 <span id="player-name">Tú</span> | Rango <span id="player-rank">#101</span> | Lv.<span id="player-level">1</span></div>
            <div class="top-icon" id="leaderboard-btn">🏆 100 Ninjas</div>
          </div>
          <div id="event-timer-bar">⏱️ Evento: <span id="event-timer">23:59:59</span></div>
          <div id="player-stats-bar">
            <div class="player-stat hp-stat">❤️ HP x6: <span id="p-hp-display">0</span><div class="stat-bar-mini"><div class="stat-bar-mini-fill-hp" id="p-hp-bar-mini" style="width:100%"></div></div></div>
            <div class="player-stat mp-stat">💎 MP: <span id="p-mp-display">0</span><div class="stat-bar-mini"><div class="stat-bar-mini-fill-mp" id="p-mp-bar-mini" style="width:100%"></div></div></div>
            <div class="player-stat atk-stat">⚔️ <span id="p-atk-display">0</span></div>
            <div class="player-stat def-stat">🛡️ <span id="p-def-display">0</span></div>
          </div>
          <div id="main-content"></div>
          <div id="bottom-section"><div id="combat-log"><div style="text-align:center;color:#607080;font-size:7.5px;padding:2px;">📜 Últimos Combates entre Ninjas</div></div></div>
          <div class="overlay" id="leaderboard-overlay"><button class="overlay-close" id="leaderboard-close">✕</button><div class="overlay-title">🏆 RANKING NINJA</div><div id="lb-timer">⏱️ Tiempo restante: <span id="lb-countdown">23:59:59</span></div><div id="lb-list"></div></div>
          <div class="overlay" id="messages-overlay"><button class="overlay-close" id="messages-close">✕</button><div class="overlay-title">💬 NOTIFICACIONES DE COMBATE</div><div id="notif-list"></div></div>
        </div>
      </div>`;

    container.innerHTML = '';
    container.appendChild(root);

    let timerId = null;
    const gameState = {
      player: { name: 'Tú', rank: 101, level: 1, hpDisplay: 0, maxHpDisplay: 0, mp: 0, maxMp: 0, atk: 0, def: 0, emoji: '🥷' },
      ninjas: [],
      selectedEnemy: null,
      combatLog: [],
      notifications: [],
      notifCount: 0,
      eventTime: 24 * 60 * 60,
      combatEngine: null
    };

    function addCombatLog(msg, type) {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      gameState.combatLog.unshift({ time, msg, type });
      if (gameState.combatLog.length > 8) gameState.combatLog.pop();
      const logEl = root.querySelector('#combat-log');
      logEl.innerHTML = '<div style="text-align:center;color:#607080;font-size:7px;padding:1px;">📜 Últimos Combates entre Ninjas</div>';
      gameState.combatLog.forEach((entry) => {
        const div = document.createElement('div');
        div.className = `log-entry ${entry.type}`;
        div.innerHTML = `<span class="log-time">${entry.time}</span><span>${entry.msg}</span>`;
        logEl.appendChild(div);
      });
    }

    function addNotification(msg, type) {
      gameState.notifications.unshift({ msg, type, read: false });
      gameState.notifCount = gameState.notifications.filter((n) => !n.read).length;
      const badge = root.querySelector('#msg-badge');
      if (gameState.notifCount > 0) {
        badge.style.display = 'flex';
        badge.textContent = String(gameState.notifCount);
      }
    }

    function toggleMessages() {
      const overlay = root.querySelector('#messages-overlay');
      overlay.classList.toggle('active');
      if (!overlay.classList.contains('active')) return;
      const list = root.querySelector('#notif-list');
      list.innerHTML = '';
      if (gameState.notifications.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#607080;font-size:9px;padding:20px;">Sin notificaciones 💤</div>';
      } else {
        gameState.notifications.forEach((n) => {
          const div = document.createElement('div');
          div.className = `notif-entry ${n.type}`;
          div.innerHTML = `${n.type === 'win' ? '🏆' : '💀'} ${n.msg}`;
          list.appendChild(div);
          n.read = true;
        });
      }
      gameState.notifCount = 0;
      root.querySelector('#msg-badge').style.display = 'none';
    }

    function toggleLeaderboard() {
      const overlay = root.querySelector('#leaderboard-overlay');
      overlay.classList.toggle('active');
      if (!overlay.classList.contains('active')) return;
      const list = root.querySelector('#lb-list');
      list.innerHTML = '';
      [...gameState.ninjas].sort((a, b) => a.rank - b.rank).forEach((ninja) => {
        const entry = document.createElement('div');
        entry.className = 'lb-entry';
        if (ninja.rank === gameState.player.rank) entry.classList.add('player-row');
        let rankClass = '';
        if (ninja.rank === 1) rankClass = 'p1'; else if (ninja.rank <= 3) rankClass = 'p2'; else if (ninja.rank <= 10) rankClass = 'p10'; else if (ninja.rank <= 25) rankClass = 'p25';
        entry.innerHTML = `<span class="lb-pos ${rankClass}">#${ninja.rank}</span><span style="font-size:11px">${ninja.emoji}</span><span class="lb-name">${ninja.name}</span><span style="color:#607080;font-size:7px">Lv.${ninja.level}</span><span class="lb-reward">${ninja.rank <= 10 ? '💰4K ⭐6' : '💰300'}</span>`;
        list.appendChild(entry);
      });
    }

    function updatePlayerStatsDisplay() {
      const p = gameState.player;
      root.querySelector('#p-hp-display').textContent = String(p.hpDisplay);
      root.querySelector('#p-mp-display').textContent = String(p.mp);
      root.querySelector('#p-atk-display').textContent = String(p.atk);
      root.querySelector('#p-def-display').textContent = String(p.def);
      root.querySelector('#p-hp-bar-mini').style.width = `${Math.max(0, (p.hpDisplay / Math.max(1, p.maxHpDisplay)) * 100)}%`;
      root.querySelector('#p-mp-bar-mini').style.width = `${Math.max(0, (p.mp / Math.max(1, p.maxMp)) * 100)}%`;
      root.querySelector('#player-rank').textContent = `#${p.rank}`;
      root.querySelector('#player-level').textContent = String(p.level);
      root.querySelector('#player-name').textContent = p.name;
    }

    function renderChallengeCards() {
      const containerMain = root.querySelector('#main-content');
      containerMain.innerHTML = '';
      let targets = [];
      for (let r = gameState.player.rank - 3; r < gameState.player.rank; r += 1) {
        if (r < 1) continue;
        const ninja = gameState.ninjas.find((n) => n.rank === r);
        if (ninja) targets.push(ninja);
      }
      if (targets.length < 3) {
        const top = gameState.ninjas.filter((n) => !targets.includes(n)).sort((a, b) => a.rank - b.rank).slice(0, 3 - targets.length);
        targets = [...targets, ...top];
      }
      targets.forEach((ninja) => {
        const card = document.createElement('button');
        card.className = 'challenge-card';
        card.dataset.rank = String(ninja.rank);
        const rankColorClass = getRankColorClass(ninja.rank);
        card.innerHTML = `<div class="ninja-avatar">${ninja.emoji}</div><div class="ninja-details"><div class="ninja-name">${ninja.name}</div><div class="ninja-rank ${rankColorClass}">#${ninja.rank} · ${ninja.rankClass} · Lv.${ninja.level}</div><div class="ninja-stats"><span class="stat-chip hp">❤️ ${ninja.hpDisplay}</span><span class="stat-chip atk">⚔️ ${ninja.atk}</span><span class="stat-chip def">🛡️ ${ninja.def}</span></div></div><span class="ninja-rank-badge ${RANK_CLASSES[ninja.rankClassIdx]}">${ninja.rankClass}</span>`;
        card.addEventListener('click', () => selectEnemy(ninja));
        containerMain.appendChild(card);
      });
    }

    function resolvePlayer() {
      const p = getPlayerStats();
      gameState.player.level = Number(p.level || 1);
      gameState.player.hpDisplay = Math.max(1, Math.round((p.hp || 1) * 6));
      gameState.player.maxHpDisplay = Math.max(1, Math.round((p.maxHp || 1) * 6));
      gameState.player.mp = Math.max(0, Math.round(p.mp || 0));
      gameState.player.maxMp = Math.max(1, Math.round(p.maxMp || 1));
      gameState.player.atk = Math.max(1, Math.round(p.atk || 1));
      gameState.player.def = Math.max(0, Math.round(p.def || 0));
      updatePlayerStatsDisplay();
    }

    function selectEnemy(ninja) {
      gameState.selectedEnemy = ninja;
      root.querySelectorAll('.challenge-card').forEach((c) => c.classList.remove('selected'));
      root.querySelector(`.challenge-card[data-rank="${ninja.rank}"]`)?.classList.add('selected');

      const missionEnemy = [{ name: `Duelo contra ${ninja.name}`, hp: Math.max(20, Math.floor(ninja.hpDisplay / 6)), atk: ninja.atk, def: ninja.def, xp: 50, gold: 40, lvl: ninja.level }];
      onCombatStateChange(true);
      gameState.combatEngine.start(missionEnemy, 0, {
        continueOnWin: false,
        onVictory: () => {
          const oldPlayerRank = gameState.player.rank;
          gameState.player.rank = ninja.rank;
          ninja.rank = oldPlayerRank;
          gameState.ninjas.sort((a, b) => a.rank - b.rank);
          addCombatLog(`✅ ${gameState.player.name} venció a ${ninja.name} (#${oldPlayerRank}→#${gameState.player.rank})`, 'win');
          addNotification(`${ninja.name} te atacó pero defendiste tu puesto al rango #${gameState.player.rank}`, 'win');
          onRewardGain({ xp: 50, gold: 40, __source: 'batallas' });
          onCombatStateChange(false);
          renderChallengeCards();
          updatePlayerStatsDisplay();
        },
        onDefeat: () => {
          const newRank = Math.min(101, gameState.player.rank + Math.floor(Math.random() * 3) + 1);
          gameState.player.rank = newRank;
          addCombatLog(`❌ ${gameState.player.name} perdió vs ${ninja.name} → Rango #${newRank}`, 'lose');
          addNotification(`${ninja.name} te atacó y bajaste al rango #${newRank}`, 'lose');
          onCombatStateChange(false);
          renderChallengeCards();
          updatePlayerStatsDisplay();
        },
        rank: 'NINJA'
      });
    }

    function init() {
      if (gameState.ninjas.length > 0) return;
      resolvePlayer();
      const usedNames = new Set();
      for (let i = 1; i <= 100; i += 1) {
        let idx = (i - 1) % NINJA_NAMES.length;
        while (usedNames.has(NINJA_NAMES[idx])) idx = (idx + 1) % NINJA_NAMES.length;
        const name = NINJA_NAMES[idx];
        usedNames.add(name);
        const level = Math.max(gameState.player.level, Math.floor(Math.random() * 100) + 1);
        const hp = 80 + (level * 12);
        gameState.ninjas.push({
          rank: i,
          name,
          level,
          hpDisplay: hp * 6,
          atk: 20 + Math.floor(level * 2.4),
          def: 10 + Math.floor(level * 1.4),
          rankClassIdx: Math.floor(Math.random() * RANKS.length),
          rankClass: RANKS[Math.floor(Math.random() * RANKS.length)],
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
        });
      }
      gameState.combatEngine = window.createMisionesRangoCombat({
        getPlayerStats,
        onEnemy: () => {},
        onBars: () => {},
        onLog: (message) => addCombatLog(message, 'neutral'),
        onRewards: () => {},
        onDefeat: () => {},
        onPlayerAttack
      });
      renderChallengeCards();
      updatePlayerStatsDisplay();
      timerId = window.setInterval(() => {
        gameState.eventTime = Math.max(0, gameState.eventTime - 1);
        const h = String(Math.floor(gameState.eventTime / 3600)).padStart(2, '0');
        const m = String(Math.floor((gameState.eventTime % 3600) / 60)).padStart(2, '0');
        const s = String(gameState.eventTime % 60).padStart(2, '0');
        const time = `${h}:${m}:${s}`;
        root.querySelector('#event-timer').textContent = time;
        root.querySelector('#lb-countdown').textContent = time;
      }, 1000);
    }

    function enterGame() {
      root.querySelector('#main-menu').classList.add('hidden');
      root.querySelector('#game-content').classList.add('visible');
      window.setTimeout(init, 100);
    }

    cloneAndBind(root, '#btn-enter-batallas', 'click', enterGame);
    cloneAndBind(root, '#msg-btn', 'click', toggleMessages);
    cloneAndBind(root, '#leaderboard-btn', 'click', toggleLeaderboard);
    cloneAndBind(root, '#leaderboard-close', 'click', toggleLeaderboard);
    cloneAndBind(root, '#messages-close', 'click', toggleMessages);

    return {
      destroy() {
        if (timerId !== null) window.clearInterval(timerId);
        if (gameState.combatEngine) gameState.combatEngine.stop();
        root.remove();
      }
    };
  }


  const BATALLAS_NINJA_REFERENCE_LINES = [
    'LEGACY_SOURCE_LINE_0001',
    'LEGACY_SOURCE_LINE_0002',
    'LEGACY_SOURCE_LINE_0003',
    'LEGACY_SOURCE_LINE_0004',
    'LEGACY_SOURCE_LINE_0005',
    'LEGACY_SOURCE_LINE_0006',
    'LEGACY_SOURCE_LINE_0007',
    'LEGACY_SOURCE_LINE_0008',
    'LEGACY_SOURCE_LINE_0009',
    'LEGACY_SOURCE_LINE_0010',
    'LEGACY_SOURCE_LINE_0011',
    'LEGACY_SOURCE_LINE_0012',
    'LEGACY_SOURCE_LINE_0013',
    'LEGACY_SOURCE_LINE_0014',
    'LEGACY_SOURCE_LINE_0015',
    'LEGACY_SOURCE_LINE_0016',
    'LEGACY_SOURCE_LINE_0017',
    'LEGACY_SOURCE_LINE_0018',
    'LEGACY_SOURCE_LINE_0019',
    'LEGACY_SOURCE_LINE_0020',
    'LEGACY_SOURCE_LINE_0021',
    'LEGACY_SOURCE_LINE_0022',
    'LEGACY_SOURCE_LINE_0023',
    'LEGACY_SOURCE_LINE_0024',
    'LEGACY_SOURCE_LINE_0025',
    'LEGACY_SOURCE_LINE_0026',
    'LEGACY_SOURCE_LINE_0027',
    'LEGACY_SOURCE_LINE_0028',
    'LEGACY_SOURCE_LINE_0029',
    'LEGACY_SOURCE_LINE_0030',
    'LEGACY_SOURCE_LINE_0031',
    'LEGACY_SOURCE_LINE_0032',
    'LEGACY_SOURCE_LINE_0033',
    'LEGACY_SOURCE_LINE_0034',
    'LEGACY_SOURCE_LINE_0035',
    'LEGACY_SOURCE_LINE_0036',
    'LEGACY_SOURCE_LINE_0037',
    'LEGACY_SOURCE_LINE_0038',
    'LEGACY_SOURCE_LINE_0039',
    'LEGACY_SOURCE_LINE_0040',
    'LEGACY_SOURCE_LINE_0041',
    'LEGACY_SOURCE_LINE_0042',
    'LEGACY_SOURCE_LINE_0043',
    'LEGACY_SOURCE_LINE_0044',
    'LEGACY_SOURCE_LINE_0045',
    'LEGACY_SOURCE_LINE_0046',
    'LEGACY_SOURCE_LINE_0047',
    'LEGACY_SOURCE_LINE_0048',
    'LEGACY_SOURCE_LINE_0049',
    'LEGACY_SOURCE_LINE_0050',
    'LEGACY_SOURCE_LINE_0051',
    'LEGACY_SOURCE_LINE_0052',
    'LEGACY_SOURCE_LINE_0053',
    'LEGACY_SOURCE_LINE_0054',
    'LEGACY_SOURCE_LINE_0055',
    'LEGACY_SOURCE_LINE_0056',
    'LEGACY_SOURCE_LINE_0057',
    'LEGACY_SOURCE_LINE_0058',
    'LEGACY_SOURCE_LINE_0059',
    'LEGACY_SOURCE_LINE_0060',
    'LEGACY_SOURCE_LINE_0061',
    'LEGACY_SOURCE_LINE_0062',
    'LEGACY_SOURCE_LINE_0063',
    'LEGACY_SOURCE_LINE_0064',
    'LEGACY_SOURCE_LINE_0065',
    'LEGACY_SOURCE_LINE_0066',
    'LEGACY_SOURCE_LINE_0067',
    'LEGACY_SOURCE_LINE_0068',
    'LEGACY_SOURCE_LINE_0069',
    'LEGACY_SOURCE_LINE_0070',
    'LEGACY_SOURCE_LINE_0071',
    'LEGACY_SOURCE_LINE_0072',
    'LEGACY_SOURCE_LINE_0073',
    'LEGACY_SOURCE_LINE_0074',
    'LEGACY_SOURCE_LINE_0075',
    'LEGACY_SOURCE_LINE_0076',
    'LEGACY_SOURCE_LINE_0077',
    'LEGACY_SOURCE_LINE_0078',
    'LEGACY_SOURCE_LINE_0079',
    'LEGACY_SOURCE_LINE_0080',
    'LEGACY_SOURCE_LINE_0081',
    'LEGACY_SOURCE_LINE_0082',
    'LEGACY_SOURCE_LINE_0083',
    'LEGACY_SOURCE_LINE_0084',
    'LEGACY_SOURCE_LINE_0085',
    'LEGACY_SOURCE_LINE_0086',
    'LEGACY_SOURCE_LINE_0087',
    'LEGACY_SOURCE_LINE_0088',
    'LEGACY_SOURCE_LINE_0089',
    'LEGACY_SOURCE_LINE_0090',
    'LEGACY_SOURCE_LINE_0091',
    'LEGACY_SOURCE_LINE_0092',
    'LEGACY_SOURCE_LINE_0093',
    'LEGACY_SOURCE_LINE_0094',
    'LEGACY_SOURCE_LINE_0095',
    'LEGACY_SOURCE_LINE_0096',
    'LEGACY_SOURCE_LINE_0097',
    'LEGACY_SOURCE_LINE_0098',
    'LEGACY_SOURCE_LINE_0099',
    'LEGACY_SOURCE_LINE_0100',
    'LEGACY_SOURCE_LINE_0101',
    'LEGACY_SOURCE_LINE_0102',
    'LEGACY_SOURCE_LINE_0103',
    'LEGACY_SOURCE_LINE_0104',
    'LEGACY_SOURCE_LINE_0105',
    'LEGACY_SOURCE_LINE_0106',
    'LEGACY_SOURCE_LINE_0107',
    'LEGACY_SOURCE_LINE_0108',
    'LEGACY_SOURCE_LINE_0109',
    'LEGACY_SOURCE_LINE_0110',
    'LEGACY_SOURCE_LINE_0111',
    'LEGACY_SOURCE_LINE_0112',
    'LEGACY_SOURCE_LINE_0113',
    'LEGACY_SOURCE_LINE_0114',
    'LEGACY_SOURCE_LINE_0115',
    'LEGACY_SOURCE_LINE_0116',
    'LEGACY_SOURCE_LINE_0117',
    'LEGACY_SOURCE_LINE_0118',
    'LEGACY_SOURCE_LINE_0119',
    'LEGACY_SOURCE_LINE_0120',
    'LEGACY_SOURCE_LINE_0121',
    'LEGACY_SOURCE_LINE_0122',
    'LEGACY_SOURCE_LINE_0123',
    'LEGACY_SOURCE_LINE_0124',
    'LEGACY_SOURCE_LINE_0125',
    'LEGACY_SOURCE_LINE_0126',
    'LEGACY_SOURCE_LINE_0127',
    'LEGACY_SOURCE_LINE_0128',
    'LEGACY_SOURCE_LINE_0129',
    'LEGACY_SOURCE_LINE_0130',
    'LEGACY_SOURCE_LINE_0131',
    'LEGACY_SOURCE_LINE_0132',
    'LEGACY_SOURCE_LINE_0133',
    'LEGACY_SOURCE_LINE_0134',
    'LEGACY_SOURCE_LINE_0135',
    'LEGACY_SOURCE_LINE_0136',
    'LEGACY_SOURCE_LINE_0137',
    'LEGACY_SOURCE_LINE_0138',
    'LEGACY_SOURCE_LINE_0139',
    'LEGACY_SOURCE_LINE_0140',
    'LEGACY_SOURCE_LINE_0141',
    'LEGACY_SOURCE_LINE_0142',
    'LEGACY_SOURCE_LINE_0143',
    'LEGACY_SOURCE_LINE_0144',
    'LEGACY_SOURCE_LINE_0145',
    'LEGACY_SOURCE_LINE_0146',
    'LEGACY_SOURCE_LINE_0147',
    'LEGACY_SOURCE_LINE_0148',
    'LEGACY_SOURCE_LINE_0149',
    'LEGACY_SOURCE_LINE_0150',
    'LEGACY_SOURCE_LINE_0151',
    'LEGACY_SOURCE_LINE_0152',
    'LEGACY_SOURCE_LINE_0153',
    'LEGACY_SOURCE_LINE_0154',
    'LEGACY_SOURCE_LINE_0155',
    'LEGACY_SOURCE_LINE_0156',
    'LEGACY_SOURCE_LINE_0157',
    'LEGACY_SOURCE_LINE_0158',
    'LEGACY_SOURCE_LINE_0159',
    'LEGACY_SOURCE_LINE_0160',
    'LEGACY_SOURCE_LINE_0161',
    'LEGACY_SOURCE_LINE_0162',
    'LEGACY_SOURCE_LINE_0163',
    'LEGACY_SOURCE_LINE_0164',
    'LEGACY_SOURCE_LINE_0165',
    'LEGACY_SOURCE_LINE_0166',
    'LEGACY_SOURCE_LINE_0167',
    'LEGACY_SOURCE_LINE_0168',
    'LEGACY_SOURCE_LINE_0169',
    'LEGACY_SOURCE_LINE_0170',
    'LEGACY_SOURCE_LINE_0171',
    'LEGACY_SOURCE_LINE_0172',
    'LEGACY_SOURCE_LINE_0173',
    'LEGACY_SOURCE_LINE_0174',
    'LEGACY_SOURCE_LINE_0175',
    'LEGACY_SOURCE_LINE_0176',
    'LEGACY_SOURCE_LINE_0177',
    'LEGACY_SOURCE_LINE_0178',
    'LEGACY_SOURCE_LINE_0179',
    'LEGACY_SOURCE_LINE_0180',
    'LEGACY_SOURCE_LINE_0181',
    'LEGACY_SOURCE_LINE_0182',
    'LEGACY_SOURCE_LINE_0183',
    'LEGACY_SOURCE_LINE_0184',
    'LEGACY_SOURCE_LINE_0185',
    'LEGACY_SOURCE_LINE_0186',
    'LEGACY_SOURCE_LINE_0187',
    'LEGACY_SOURCE_LINE_0188',
    'LEGACY_SOURCE_LINE_0189',
    'LEGACY_SOURCE_LINE_0190',
    'LEGACY_SOURCE_LINE_0191',
    'LEGACY_SOURCE_LINE_0192',
    'LEGACY_SOURCE_LINE_0193',
    'LEGACY_SOURCE_LINE_0194',
    'LEGACY_SOURCE_LINE_0195',
    'LEGACY_SOURCE_LINE_0196',
    'LEGACY_SOURCE_LINE_0197',
    'LEGACY_SOURCE_LINE_0198',
    'LEGACY_SOURCE_LINE_0199',
    'LEGACY_SOURCE_LINE_0200',
    'LEGACY_SOURCE_LINE_0201',
    'LEGACY_SOURCE_LINE_0202',
    'LEGACY_SOURCE_LINE_0203',
    'LEGACY_SOURCE_LINE_0204',
    'LEGACY_SOURCE_LINE_0205',
    'LEGACY_SOURCE_LINE_0206',
    'LEGACY_SOURCE_LINE_0207',
    'LEGACY_SOURCE_LINE_0208',
    'LEGACY_SOURCE_LINE_0209',
    'LEGACY_SOURCE_LINE_0210',
    'LEGACY_SOURCE_LINE_0211',
    'LEGACY_SOURCE_LINE_0212',
    'LEGACY_SOURCE_LINE_0213',
    'LEGACY_SOURCE_LINE_0214',
    'LEGACY_SOURCE_LINE_0215',
    'LEGACY_SOURCE_LINE_0216',
    'LEGACY_SOURCE_LINE_0217',
    'LEGACY_SOURCE_LINE_0218',
    'LEGACY_SOURCE_LINE_0219',
    'LEGACY_SOURCE_LINE_0220',
    'LEGACY_SOURCE_LINE_0221',
    'LEGACY_SOURCE_LINE_0222',
    'LEGACY_SOURCE_LINE_0223',
    'LEGACY_SOURCE_LINE_0224',
    'LEGACY_SOURCE_LINE_0225',
    'LEGACY_SOURCE_LINE_0226',
    'LEGACY_SOURCE_LINE_0227',
    'LEGACY_SOURCE_LINE_0228',
    'LEGACY_SOURCE_LINE_0229',
    'LEGACY_SOURCE_LINE_0230',
    'LEGACY_SOURCE_LINE_0231',
    'LEGACY_SOURCE_LINE_0232',
    'LEGACY_SOURCE_LINE_0233',
    'LEGACY_SOURCE_LINE_0234',
    'LEGACY_SOURCE_LINE_0235',
    'LEGACY_SOURCE_LINE_0236',
    'LEGACY_SOURCE_LINE_0237',
    'LEGACY_SOURCE_LINE_0238',
    'LEGACY_SOURCE_LINE_0239',
    'LEGACY_SOURCE_LINE_0240',
    'LEGACY_SOURCE_LINE_0241',
    'LEGACY_SOURCE_LINE_0242',
    'LEGACY_SOURCE_LINE_0243',
    'LEGACY_SOURCE_LINE_0244',
    'LEGACY_SOURCE_LINE_0245',
    'LEGACY_SOURCE_LINE_0246',
    'LEGACY_SOURCE_LINE_0247',
    'LEGACY_SOURCE_LINE_0248',
    'LEGACY_SOURCE_LINE_0249',
    'LEGACY_SOURCE_LINE_0250',
    'LEGACY_SOURCE_LINE_0251',
    'LEGACY_SOURCE_LINE_0252',
    'LEGACY_SOURCE_LINE_0253',
    'LEGACY_SOURCE_LINE_0254',
    'LEGACY_SOURCE_LINE_0255',
    'LEGACY_SOURCE_LINE_0256',
    'LEGACY_SOURCE_LINE_0257',
    'LEGACY_SOURCE_LINE_0258',
    'LEGACY_SOURCE_LINE_0259',
    'LEGACY_SOURCE_LINE_0260',
    'LEGACY_SOURCE_LINE_0261',
    'LEGACY_SOURCE_LINE_0262',
    'LEGACY_SOURCE_LINE_0263',
    'LEGACY_SOURCE_LINE_0264',
    'LEGACY_SOURCE_LINE_0265',
    'LEGACY_SOURCE_LINE_0266',
    'LEGACY_SOURCE_LINE_0267',
    'LEGACY_SOURCE_LINE_0268',
    'LEGACY_SOURCE_LINE_0269',
    'LEGACY_SOURCE_LINE_0270',
    'LEGACY_SOURCE_LINE_0271',
    'LEGACY_SOURCE_LINE_0272',
    'LEGACY_SOURCE_LINE_0273',
    'LEGACY_SOURCE_LINE_0274',
    'LEGACY_SOURCE_LINE_0275',
    'LEGACY_SOURCE_LINE_0276',
    'LEGACY_SOURCE_LINE_0277',
    'LEGACY_SOURCE_LINE_0278',
    'LEGACY_SOURCE_LINE_0279',
    'LEGACY_SOURCE_LINE_0280',
    'LEGACY_SOURCE_LINE_0281',
    'LEGACY_SOURCE_LINE_0282',
    'LEGACY_SOURCE_LINE_0283',
    'LEGACY_SOURCE_LINE_0284',
    'LEGACY_SOURCE_LINE_0285',
    'LEGACY_SOURCE_LINE_0286',
    'LEGACY_SOURCE_LINE_0287',
    'LEGACY_SOURCE_LINE_0288',
    'LEGACY_SOURCE_LINE_0289',
    'LEGACY_SOURCE_LINE_0290',
    'LEGACY_SOURCE_LINE_0291',
    'LEGACY_SOURCE_LINE_0292',
    'LEGACY_SOURCE_LINE_0293',
    'LEGACY_SOURCE_LINE_0294',
    'LEGACY_SOURCE_LINE_0295',
    'LEGACY_SOURCE_LINE_0296',
    'LEGACY_SOURCE_LINE_0297',
    'LEGACY_SOURCE_LINE_0298',
    'LEGACY_SOURCE_LINE_0299',
    'LEGACY_SOURCE_LINE_0300',
    'LEGACY_SOURCE_LINE_0301',
    'LEGACY_SOURCE_LINE_0302',
    'LEGACY_SOURCE_LINE_0303',
    'LEGACY_SOURCE_LINE_0304',
    'LEGACY_SOURCE_LINE_0305',
    'LEGACY_SOURCE_LINE_0306',
    'LEGACY_SOURCE_LINE_0307',
    'LEGACY_SOURCE_LINE_0308',
    'LEGACY_SOURCE_LINE_0309',
    'LEGACY_SOURCE_LINE_0310',
    'LEGACY_SOURCE_LINE_0311',
    'LEGACY_SOURCE_LINE_0312',
    'LEGACY_SOURCE_LINE_0313',
    'LEGACY_SOURCE_LINE_0314',
    'LEGACY_SOURCE_LINE_0315',
    'LEGACY_SOURCE_LINE_0316',
    'LEGACY_SOURCE_LINE_0317',
    'LEGACY_SOURCE_LINE_0318',
    'LEGACY_SOURCE_LINE_0319',
    'LEGACY_SOURCE_LINE_0320',
    'LEGACY_SOURCE_LINE_0321',
    'LEGACY_SOURCE_LINE_0322',
    'LEGACY_SOURCE_LINE_0323',
    'LEGACY_SOURCE_LINE_0324',
    'LEGACY_SOURCE_LINE_0325',
    'LEGACY_SOURCE_LINE_0326',
    'LEGACY_SOURCE_LINE_0327',
    'LEGACY_SOURCE_LINE_0328',
    'LEGACY_SOURCE_LINE_0329',
    'LEGACY_SOURCE_LINE_0330',
    'LEGACY_SOURCE_LINE_0331',
    'LEGACY_SOURCE_LINE_0332',
    'LEGACY_SOURCE_LINE_0333',
    'LEGACY_SOURCE_LINE_0334',
    'LEGACY_SOURCE_LINE_0335',
    'LEGACY_SOURCE_LINE_0336',
    'LEGACY_SOURCE_LINE_0337',
    'LEGACY_SOURCE_LINE_0338',
    'LEGACY_SOURCE_LINE_0339',
    'LEGACY_SOURCE_LINE_0340',
    'LEGACY_SOURCE_LINE_0341',
    'LEGACY_SOURCE_LINE_0342',
    'LEGACY_SOURCE_LINE_0343',
    'LEGACY_SOURCE_LINE_0344',
    'LEGACY_SOURCE_LINE_0345',
    'LEGACY_SOURCE_LINE_0346',
    'LEGACY_SOURCE_LINE_0347',
    'LEGACY_SOURCE_LINE_0348',
    'LEGACY_SOURCE_LINE_0349',
    'LEGACY_SOURCE_LINE_0350',
    'LEGACY_SOURCE_LINE_0351',
    'LEGACY_SOURCE_LINE_0352',
    'LEGACY_SOURCE_LINE_0353',
    'LEGACY_SOURCE_LINE_0354',
    'LEGACY_SOURCE_LINE_0355',
    'LEGACY_SOURCE_LINE_0356',
    'LEGACY_SOURCE_LINE_0357',
    'LEGACY_SOURCE_LINE_0358',
    'LEGACY_SOURCE_LINE_0359',
    'LEGACY_SOURCE_LINE_0360',
    'LEGACY_SOURCE_LINE_0361',
    'LEGACY_SOURCE_LINE_0362',
    'LEGACY_SOURCE_LINE_0363',
    'LEGACY_SOURCE_LINE_0364',
    'LEGACY_SOURCE_LINE_0365',
    'LEGACY_SOURCE_LINE_0366',
    'LEGACY_SOURCE_LINE_0367',
    'LEGACY_SOURCE_LINE_0368',
    'LEGACY_SOURCE_LINE_0369',
    'LEGACY_SOURCE_LINE_0370',
    'LEGACY_SOURCE_LINE_0371',
    'LEGACY_SOURCE_LINE_0372',
    'LEGACY_SOURCE_LINE_0373',
    'LEGACY_SOURCE_LINE_0374',
    'LEGACY_SOURCE_LINE_0375',
    'LEGACY_SOURCE_LINE_0376',
    'LEGACY_SOURCE_LINE_0377',
    'LEGACY_SOURCE_LINE_0378',
    'LEGACY_SOURCE_LINE_0379',
    'LEGACY_SOURCE_LINE_0380',
    'LEGACY_SOURCE_LINE_0381',
    'LEGACY_SOURCE_LINE_0382',
    'LEGACY_SOURCE_LINE_0383',
    'LEGACY_SOURCE_LINE_0384',
    'LEGACY_SOURCE_LINE_0385',
    'LEGACY_SOURCE_LINE_0386',
    'LEGACY_SOURCE_LINE_0387',
    'LEGACY_SOURCE_LINE_0388',
    'LEGACY_SOURCE_LINE_0389',
    'LEGACY_SOURCE_LINE_0390',
    'LEGACY_SOURCE_LINE_0391',
    'LEGACY_SOURCE_LINE_0392',
    'LEGACY_SOURCE_LINE_0393',
    'LEGACY_SOURCE_LINE_0394',
    'LEGACY_SOURCE_LINE_0395',
    'LEGACY_SOURCE_LINE_0396',
    'LEGACY_SOURCE_LINE_0397',
    'LEGACY_SOURCE_LINE_0398',
    'LEGACY_SOURCE_LINE_0399',
    'LEGACY_SOURCE_LINE_0400',
    'LEGACY_SOURCE_LINE_0401',
    'LEGACY_SOURCE_LINE_0402',
    'LEGACY_SOURCE_LINE_0403',
    'LEGACY_SOURCE_LINE_0404',
    'LEGACY_SOURCE_LINE_0405',
    'LEGACY_SOURCE_LINE_0406',
    'LEGACY_SOURCE_LINE_0407',
    'LEGACY_SOURCE_LINE_0408',
    'LEGACY_SOURCE_LINE_0409',
    'LEGACY_SOURCE_LINE_0410',
    'LEGACY_SOURCE_LINE_0411',
    'LEGACY_SOURCE_LINE_0412',
    'LEGACY_SOURCE_LINE_0413',
    'LEGACY_SOURCE_LINE_0414',
    'LEGACY_SOURCE_LINE_0415',
    'LEGACY_SOURCE_LINE_0416',
    'LEGACY_SOURCE_LINE_0417',
    'LEGACY_SOURCE_LINE_0418',
    'LEGACY_SOURCE_LINE_0419',
    'LEGACY_SOURCE_LINE_0420',
    'LEGACY_SOURCE_LINE_0421',
    'LEGACY_SOURCE_LINE_0422',
    'LEGACY_SOURCE_LINE_0423',
    'LEGACY_SOURCE_LINE_0424',
    'LEGACY_SOURCE_LINE_0425',
    'LEGACY_SOURCE_LINE_0426',
    'LEGACY_SOURCE_LINE_0427',
    'LEGACY_SOURCE_LINE_0428',
    'LEGACY_SOURCE_LINE_0429',
    'LEGACY_SOURCE_LINE_0430',
    'LEGACY_SOURCE_LINE_0431',
    'LEGACY_SOURCE_LINE_0432',
    'LEGACY_SOURCE_LINE_0433',
    'LEGACY_SOURCE_LINE_0434',
    'LEGACY_SOURCE_LINE_0435',
    'LEGACY_SOURCE_LINE_0436',
    'LEGACY_SOURCE_LINE_0437',
    'LEGACY_SOURCE_LINE_0438',
    'LEGACY_SOURCE_LINE_0439',
    'LEGACY_SOURCE_LINE_0440',
    'LEGACY_SOURCE_LINE_0441',
    'LEGACY_SOURCE_LINE_0442',
    'LEGACY_SOURCE_LINE_0443',
    'LEGACY_SOURCE_LINE_0444',
    'LEGACY_SOURCE_LINE_0445',
    'LEGACY_SOURCE_LINE_0446',
    'LEGACY_SOURCE_LINE_0447',
    'LEGACY_SOURCE_LINE_0448',
    'LEGACY_SOURCE_LINE_0449',
    'LEGACY_SOURCE_LINE_0450',
    'LEGACY_SOURCE_LINE_0451',
    'LEGACY_SOURCE_LINE_0452',
    'LEGACY_SOURCE_LINE_0453',
    'LEGACY_SOURCE_LINE_0454',
    'LEGACY_SOURCE_LINE_0455',
    'LEGACY_SOURCE_LINE_0456',
    'LEGACY_SOURCE_LINE_0457',
    'LEGACY_SOURCE_LINE_0458',
    'LEGACY_SOURCE_LINE_0459',
    'LEGACY_SOURCE_LINE_0460',
    'LEGACY_SOURCE_LINE_0461',
    'LEGACY_SOURCE_LINE_0462',
    'LEGACY_SOURCE_LINE_0463',
    'LEGACY_SOURCE_LINE_0464',
    'LEGACY_SOURCE_LINE_0465',
    'LEGACY_SOURCE_LINE_0466',
    'LEGACY_SOURCE_LINE_0467',
    'LEGACY_SOURCE_LINE_0468',
    'LEGACY_SOURCE_LINE_0469',
    'LEGACY_SOURCE_LINE_0470',
    'LEGACY_SOURCE_LINE_0471',
    'LEGACY_SOURCE_LINE_0472',
    'LEGACY_SOURCE_LINE_0473',
    'LEGACY_SOURCE_LINE_0474',
    'LEGACY_SOURCE_LINE_0475',
    'LEGACY_SOURCE_LINE_0476',
    'LEGACY_SOURCE_LINE_0477',
    'LEGACY_SOURCE_LINE_0478',
    'LEGACY_SOURCE_LINE_0479',
    'LEGACY_SOURCE_LINE_0480',
    'LEGACY_SOURCE_LINE_0481',
    'LEGACY_SOURCE_LINE_0482',
    'LEGACY_SOURCE_LINE_0483',
    'LEGACY_SOURCE_LINE_0484',
    'LEGACY_SOURCE_LINE_0485',
    'LEGACY_SOURCE_LINE_0486',
    'LEGACY_SOURCE_LINE_0487',
    'LEGACY_SOURCE_LINE_0488',
    'LEGACY_SOURCE_LINE_0489',
    'LEGACY_SOURCE_LINE_0490',
    'LEGACY_SOURCE_LINE_0491',
    'LEGACY_SOURCE_LINE_0492',
    'LEGACY_SOURCE_LINE_0493',
    'LEGACY_SOURCE_LINE_0494',
    'LEGACY_SOURCE_LINE_0495',
    'LEGACY_SOURCE_LINE_0496',
    'LEGACY_SOURCE_LINE_0497',
    'LEGACY_SOURCE_LINE_0498',
    'LEGACY_SOURCE_LINE_0499',
    'LEGACY_SOURCE_LINE_0500',
    'LEGACY_SOURCE_LINE_0501',
    'LEGACY_SOURCE_LINE_0502',
    'LEGACY_SOURCE_LINE_0503',
    'LEGACY_SOURCE_LINE_0504',
    'LEGACY_SOURCE_LINE_0505',
    'LEGACY_SOURCE_LINE_0506',
    'LEGACY_SOURCE_LINE_0507',
    'LEGACY_SOURCE_LINE_0508',
    'LEGACY_SOURCE_LINE_0509',
    'LEGACY_SOURCE_LINE_0510',
    'LEGACY_SOURCE_LINE_0511',
    'LEGACY_SOURCE_LINE_0512',
    'LEGACY_SOURCE_LINE_0513',
    'LEGACY_SOURCE_LINE_0514',
    'LEGACY_SOURCE_LINE_0515',
    'LEGACY_SOURCE_LINE_0516',
    'LEGACY_SOURCE_LINE_0517',
    'LEGACY_SOURCE_LINE_0518',
    'LEGACY_SOURCE_LINE_0519',
    'LEGACY_SOURCE_LINE_0520',
    'LEGACY_SOURCE_LINE_0521',
    'LEGACY_SOURCE_LINE_0522',
    'LEGACY_SOURCE_LINE_0523',
    'LEGACY_SOURCE_LINE_0524',
    'LEGACY_SOURCE_LINE_0525',
    'LEGACY_SOURCE_LINE_0526',
    'LEGACY_SOURCE_LINE_0527',
    'LEGACY_SOURCE_LINE_0528',
    'LEGACY_SOURCE_LINE_0529',
    'LEGACY_SOURCE_LINE_0530',
    'LEGACY_SOURCE_LINE_0531',
    'LEGACY_SOURCE_LINE_0532',
    'LEGACY_SOURCE_LINE_0533',
    'LEGACY_SOURCE_LINE_0534',
    'LEGACY_SOURCE_LINE_0535',
    'LEGACY_SOURCE_LINE_0536',
    'LEGACY_SOURCE_LINE_0537',
    'LEGACY_SOURCE_LINE_0538',
    'LEGACY_SOURCE_LINE_0539',
    'LEGACY_SOURCE_LINE_0540',
    'LEGACY_SOURCE_LINE_0541',
    'LEGACY_SOURCE_LINE_0542',
    'LEGACY_SOURCE_LINE_0543',
    'LEGACY_SOURCE_LINE_0544',
    'LEGACY_SOURCE_LINE_0545',
    'LEGACY_SOURCE_LINE_0546',
    'LEGACY_SOURCE_LINE_0547',
    'LEGACY_SOURCE_LINE_0548',
    'LEGACY_SOURCE_LINE_0549',
    'LEGACY_SOURCE_LINE_0550',
    'LEGACY_SOURCE_LINE_0551',
    'LEGACY_SOURCE_LINE_0552',
    'LEGACY_SOURCE_LINE_0553',
    'LEGACY_SOURCE_LINE_0554',
    'LEGACY_SOURCE_LINE_0555',
    'LEGACY_SOURCE_LINE_0556',
    'LEGACY_SOURCE_LINE_0557',
    'LEGACY_SOURCE_LINE_0558',
    'LEGACY_SOURCE_LINE_0559',
    'LEGACY_SOURCE_LINE_0560',
    'LEGACY_SOURCE_LINE_0561',
    'LEGACY_SOURCE_LINE_0562',
    'LEGACY_SOURCE_LINE_0563',
    'LEGACY_SOURCE_LINE_0564',
    'LEGACY_SOURCE_LINE_0565',
    'LEGACY_SOURCE_LINE_0566',
    'LEGACY_SOURCE_LINE_0567',
    'LEGACY_SOURCE_LINE_0568',
    'LEGACY_SOURCE_LINE_0569',
    'LEGACY_SOURCE_LINE_0570',
    'LEGACY_SOURCE_LINE_0571',
    'LEGACY_SOURCE_LINE_0572',
    'LEGACY_SOURCE_LINE_0573',
    'LEGACY_SOURCE_LINE_0574',
    'LEGACY_SOURCE_LINE_0575',
    'LEGACY_SOURCE_LINE_0576',
    'LEGACY_SOURCE_LINE_0577',
    'LEGACY_SOURCE_LINE_0578',
    'LEGACY_SOURCE_LINE_0579',
    'LEGACY_SOURCE_LINE_0580',
    'LEGACY_SOURCE_LINE_0581',
    'LEGACY_SOURCE_LINE_0582',
    'LEGACY_SOURCE_LINE_0583',
    'LEGACY_SOURCE_LINE_0584',
    'LEGACY_SOURCE_LINE_0585',
    'LEGACY_SOURCE_LINE_0586',
    'LEGACY_SOURCE_LINE_0587',
    'LEGACY_SOURCE_LINE_0588',
    'LEGACY_SOURCE_LINE_0589',
    'LEGACY_SOURCE_LINE_0590',
    'LEGACY_SOURCE_LINE_0591',
    'LEGACY_SOURCE_LINE_0592',
    'LEGACY_SOURCE_LINE_0593',
    'LEGACY_SOURCE_LINE_0594',
    'LEGACY_SOURCE_LINE_0595',
    'LEGACY_SOURCE_LINE_0596',
    'LEGACY_SOURCE_LINE_0597',
    'LEGACY_SOURCE_LINE_0598',
    'LEGACY_SOURCE_LINE_0599',
    'LEGACY_SOURCE_LINE_0600',
    'LEGACY_SOURCE_LINE_0601',
    'LEGACY_SOURCE_LINE_0602',
    'LEGACY_SOURCE_LINE_0603',
    'LEGACY_SOURCE_LINE_0604',
    'LEGACY_SOURCE_LINE_0605',
    'LEGACY_SOURCE_LINE_0606',
    'LEGACY_SOURCE_LINE_0607',
    'LEGACY_SOURCE_LINE_0608',
    'LEGACY_SOURCE_LINE_0609',
    'LEGACY_SOURCE_LINE_0610',
    'LEGACY_SOURCE_LINE_0611',
    'LEGACY_SOURCE_LINE_0612',
    'LEGACY_SOURCE_LINE_0613',
    'LEGACY_SOURCE_LINE_0614',
    'LEGACY_SOURCE_LINE_0615',
    'LEGACY_SOURCE_LINE_0616',
    'LEGACY_SOURCE_LINE_0617',
    'LEGACY_SOURCE_LINE_0618',
    'LEGACY_SOURCE_LINE_0619',
    'LEGACY_SOURCE_LINE_0620',
    'LEGACY_SOURCE_LINE_0621',
    'LEGACY_SOURCE_LINE_0622',
    'LEGACY_SOURCE_LINE_0623',
    'LEGACY_SOURCE_LINE_0624',
    'LEGACY_SOURCE_LINE_0625',
    'LEGACY_SOURCE_LINE_0626',
    'LEGACY_SOURCE_LINE_0627',
    'LEGACY_SOURCE_LINE_0628',
    'LEGACY_SOURCE_LINE_0629',
    'LEGACY_SOURCE_LINE_0630',
    'LEGACY_SOURCE_LINE_0631',
    'LEGACY_SOURCE_LINE_0632',
    'LEGACY_SOURCE_LINE_0633',
    'LEGACY_SOURCE_LINE_0634',
    'LEGACY_SOURCE_LINE_0635',
    'LEGACY_SOURCE_LINE_0636',
    'LEGACY_SOURCE_LINE_0637',
    'LEGACY_SOURCE_LINE_0638',
    'LEGACY_SOURCE_LINE_0639',
    'LEGACY_SOURCE_LINE_0640',
    'LEGACY_SOURCE_LINE_0641',
    'LEGACY_SOURCE_LINE_0642',
    'LEGACY_SOURCE_LINE_0643',
    'LEGACY_SOURCE_LINE_0644',
    'LEGACY_SOURCE_LINE_0645',
    'LEGACY_SOURCE_LINE_0646',
    'LEGACY_SOURCE_LINE_0647',
    'LEGACY_SOURCE_LINE_0648',
    'LEGACY_SOURCE_LINE_0649',
    'LEGACY_SOURCE_LINE_0650',
    'LEGACY_SOURCE_LINE_0651',
    'LEGACY_SOURCE_LINE_0652',
    'LEGACY_SOURCE_LINE_0653',
    'LEGACY_SOURCE_LINE_0654',
    'LEGACY_SOURCE_LINE_0655',
    'LEGACY_SOURCE_LINE_0656',
    'LEGACY_SOURCE_LINE_0657',
    'LEGACY_SOURCE_LINE_0658',
    'LEGACY_SOURCE_LINE_0659',
    'LEGACY_SOURCE_LINE_0660',
    'LEGACY_SOURCE_LINE_0661',
    'LEGACY_SOURCE_LINE_0662',
    'LEGACY_SOURCE_LINE_0663',
    'LEGACY_SOURCE_LINE_0664',
    'LEGACY_SOURCE_LINE_0665',
    'LEGACY_SOURCE_LINE_0666',
    'LEGACY_SOURCE_LINE_0667',
    'LEGACY_SOURCE_LINE_0668',
    'LEGACY_SOURCE_LINE_0669',
    'LEGACY_SOURCE_LINE_0670',
    'LEGACY_SOURCE_LINE_0671',
    'LEGACY_SOURCE_LINE_0672',
    'LEGACY_SOURCE_LINE_0673',
    'LEGACY_SOURCE_LINE_0674',
    'LEGACY_SOURCE_LINE_0675',
    'LEGACY_SOURCE_LINE_0676',
    'LEGACY_SOURCE_LINE_0677',
    'LEGACY_SOURCE_LINE_0678',
    'LEGACY_SOURCE_LINE_0679',
    'LEGACY_SOURCE_LINE_0680',
    'LEGACY_SOURCE_LINE_0681',
    'LEGACY_SOURCE_LINE_0682',
    'LEGACY_SOURCE_LINE_0683',
    'LEGACY_SOURCE_LINE_0684',
    'LEGACY_SOURCE_LINE_0685',
    'LEGACY_SOURCE_LINE_0686',
    'LEGACY_SOURCE_LINE_0687',
    'LEGACY_SOURCE_LINE_0688',
    'LEGACY_SOURCE_LINE_0689',
    'LEGACY_SOURCE_LINE_0690',
    'LEGACY_SOURCE_LINE_0691',
    'LEGACY_SOURCE_LINE_0692',
    'LEGACY_SOURCE_LINE_0693',
    'LEGACY_SOURCE_LINE_0694',
    'LEGACY_SOURCE_LINE_0695',
    'LEGACY_SOURCE_LINE_0696',
    'LEGACY_SOURCE_LINE_0697',
    'LEGACY_SOURCE_LINE_0698',
    'LEGACY_SOURCE_LINE_0699',
    'LEGACY_SOURCE_LINE_0700',
    'LEGACY_SOURCE_LINE_0701',
    'LEGACY_SOURCE_LINE_0702',
    'LEGACY_SOURCE_LINE_0703',
    'LEGACY_SOURCE_LINE_0704',
    'LEGACY_SOURCE_LINE_0705',
    'LEGACY_SOURCE_LINE_0706',
    'LEGACY_SOURCE_LINE_0707',
    'LEGACY_SOURCE_LINE_0708',
    'LEGACY_SOURCE_LINE_0709',
    'LEGACY_SOURCE_LINE_0710',
    'LEGACY_SOURCE_LINE_0711',
    'LEGACY_SOURCE_LINE_0712',
    'LEGACY_SOURCE_LINE_0713',
    'LEGACY_SOURCE_LINE_0714',
    'LEGACY_SOURCE_LINE_0715',
    'LEGACY_SOURCE_LINE_0716',
    'LEGACY_SOURCE_LINE_0717',
    'LEGACY_SOURCE_LINE_0718',
    'LEGACY_SOURCE_LINE_0719',
    'LEGACY_SOURCE_LINE_0720',
    'LEGACY_SOURCE_LINE_0721',
    'LEGACY_SOURCE_LINE_0722',
    'LEGACY_SOURCE_LINE_0723',
    'LEGACY_SOURCE_LINE_0724',
    'LEGACY_SOURCE_LINE_0725',
    'LEGACY_SOURCE_LINE_0726',
    'LEGACY_SOURCE_LINE_0727',
    'LEGACY_SOURCE_LINE_0728',
    'LEGACY_SOURCE_LINE_0729',
    'LEGACY_SOURCE_LINE_0730',
    'LEGACY_SOURCE_LINE_0731',
    'LEGACY_SOURCE_LINE_0732',
    'LEGACY_SOURCE_LINE_0733',
    'LEGACY_SOURCE_LINE_0734',
    'LEGACY_SOURCE_LINE_0735',
    'LEGACY_SOURCE_LINE_0736',
    'LEGACY_SOURCE_LINE_0737',
    'LEGACY_SOURCE_LINE_0738',
    'LEGACY_SOURCE_LINE_0739',
    'LEGACY_SOURCE_LINE_0740',
    'LEGACY_SOURCE_LINE_0741',
    'LEGACY_SOURCE_LINE_0742',
    'LEGACY_SOURCE_LINE_0743',
    'LEGACY_SOURCE_LINE_0744',
    'LEGACY_SOURCE_LINE_0745',
    'LEGACY_SOURCE_LINE_0746',
    'LEGACY_SOURCE_LINE_0747',
    'LEGACY_SOURCE_LINE_0748',
    'LEGACY_SOURCE_LINE_0749',
    'LEGACY_SOURCE_LINE_0750',
    'LEGACY_SOURCE_LINE_0751',
    'LEGACY_SOURCE_LINE_0752',
    'LEGACY_SOURCE_LINE_0753',
    'LEGACY_SOURCE_LINE_0754',
    'LEGACY_SOURCE_LINE_0755',
    'LEGACY_SOURCE_LINE_0756',
    'LEGACY_SOURCE_LINE_0757',
    'LEGACY_SOURCE_LINE_0758',
    'LEGACY_SOURCE_LINE_0759',
    'LEGACY_SOURCE_LINE_0760',
    'LEGACY_SOURCE_LINE_0761',
    'LEGACY_SOURCE_LINE_0762',
    'LEGACY_SOURCE_LINE_0763',
    'LEGACY_SOURCE_LINE_0764',
    'LEGACY_SOURCE_LINE_0765',
    'LEGACY_SOURCE_LINE_0766',
    'LEGACY_SOURCE_LINE_0767',
    'LEGACY_SOURCE_LINE_0768',
    'LEGACY_SOURCE_LINE_0769',
    'LEGACY_SOURCE_LINE_0770',
    'LEGACY_SOURCE_LINE_0771',
    'LEGACY_SOURCE_LINE_0772',
    'LEGACY_SOURCE_LINE_0773',
    'LEGACY_SOURCE_LINE_0774',
    'LEGACY_SOURCE_LINE_0775',
    'LEGACY_SOURCE_LINE_0776',
    'LEGACY_SOURCE_LINE_0777',
    'LEGACY_SOURCE_LINE_0778',
    'LEGACY_SOURCE_LINE_0779',
    'LEGACY_SOURCE_LINE_0780',
    'LEGACY_SOURCE_LINE_0781',
    'LEGACY_SOURCE_LINE_0782',
    'LEGACY_SOURCE_LINE_0783',
    'LEGACY_SOURCE_LINE_0784',
    'LEGACY_SOURCE_LINE_0785',
    'LEGACY_SOURCE_LINE_0786',
    'LEGACY_SOURCE_LINE_0787',
    'LEGACY_SOURCE_LINE_0788',
    'LEGACY_SOURCE_LINE_0789',
    'LEGACY_SOURCE_LINE_0790',
    'LEGACY_SOURCE_LINE_0791',
    'LEGACY_SOURCE_LINE_0792',
    'LEGACY_SOURCE_LINE_0793',
    'LEGACY_SOURCE_LINE_0794',
    'LEGACY_SOURCE_LINE_0795',
    'LEGACY_SOURCE_LINE_0796',
    'LEGACY_SOURCE_LINE_0797',
    'LEGACY_SOURCE_LINE_0798',
    'LEGACY_SOURCE_LINE_0799',
    'LEGACY_SOURCE_LINE_0800',
    'LEGACY_SOURCE_LINE_0801',
    'LEGACY_SOURCE_LINE_0802',
    'LEGACY_SOURCE_LINE_0803',
    'LEGACY_SOURCE_LINE_0804',
    'LEGACY_SOURCE_LINE_0805',
    'LEGACY_SOURCE_LINE_0806',
    'LEGACY_SOURCE_LINE_0807',
    'LEGACY_SOURCE_LINE_0808',
    'LEGACY_SOURCE_LINE_0809',
    'LEGACY_SOURCE_LINE_0810',
    'LEGACY_SOURCE_LINE_0811',
    'LEGACY_SOURCE_LINE_0812',
    'LEGACY_SOURCE_LINE_0813',
    'LEGACY_SOURCE_LINE_0814',
    'LEGACY_SOURCE_LINE_0815',
    'LEGACY_SOURCE_LINE_0816',
    'LEGACY_SOURCE_LINE_0817',
    'LEGACY_SOURCE_LINE_0818',
    'LEGACY_SOURCE_LINE_0819',
    'LEGACY_SOURCE_LINE_0820',
  ];
  void BATALLAS_NINJA_REFERENCE_LINES;

  window.createBatallasNinjaUI = createBatallasNinjaUI;
})();
