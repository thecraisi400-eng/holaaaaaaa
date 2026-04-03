(() => {
  const BATALLAS_NINJA_SRCDOC = String.raw`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Naruto Idle RPG - Ranking Ninja</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #0d1117;
  font-family: 'Segoe UI', Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #e6edf3;
  overflow: hidden;
}

/* ==================== GAME CONTAINER ==================== */
#game-container {
  width: 460px;
  height: 360px;
  background: #0d1117;
  position: relative;
  overflow: hidden;
  border: 1px solid #1c2740;
  border-radius: 8px;
}

/* ==================== MENU DENTRO DEL CONTAINER ==================== */
#main-menu {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  background: #0d1117;
  z-index: 50;
  transition: opacity 0.3s ease;
}
#main-menu.hidden {
  opacity: 0;
  pointer-events: none;
}
.menu-btn {
  padding: 10px 30px;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: #131a26;
  color: #f0c040;
  border: 1px solid #f0c040;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}
.menu-btn:hover {
  background: #f0c040;
  color: #0d1117;
}

/* ==================== GAME CONTENT (oculto al inicio) ==================== */
#game-content {
  display: none;
}
#game-content.visible {
  display: block;
}

/* TOP BAR */
#top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 6px;
  background: #131a26;
  height: 32px;
  border-bottom: 1px solid #1c2740;
}
.top-icon {
  cursor: pointer;
  position: relative;
  font-size: 16px;
  padding: 3px 7px;
  background: #162035;
  border-radius: 5px;
  border: 1px solid #1c2740;
  color: #f0c040;
  transition: all 0.2s;
}
.top-icon:hover { transform: scale(1.1); border-color: #f0c040; }
.badge {
  position: absolute;
  top: -3px; right: -3px;
  background: #ff4040;
  color: white;
  font-size: 8px;
  font-weight: bold;
  min-width: 14px;
  height: 14px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}
#player-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
}
#player-info span { color: #f0c040; font-weight: bold; }

/* EVENT TIMER BAR */
#event-timer-bar {
  text-align: center;
  padding: 2px;
  font-size: 9px;
  color: #ff8040;
  background: #131a26;
  border-bottom: 1px solid #1c2740;
  height: 20px;
  line-height: 16px;
}

/* PLAYER STATS BAR */
#player-stats-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 3px 6px;
  background: #1c2740;
  border-bottom: 1px solid #0d1117;
  height: 28px;
  gap: 4px;
}
.player-stat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: bold;
}
.player-stat.hp-stat { color: #ff6060; }
.player-stat.mp-stat { color: #60a0ff; }
.player-stat.atk-stat { color: #ff9040; }
.player-stat.def-stat { color: #40c0ff; }
.stat-bar-mini {
  width: 50px;
  height: 6px;
  background: #0d1117;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
}
.stat-bar-mini-fill-hp {
  height: 100%;
  background: linear-gradient(90deg, #ff4040, #ff8060);
  border-radius: 3px;
}
.stat-bar-mini-fill-mp {
  height: 100%;
  background: linear-gradient(90deg, #4060ff, #80a0ff);
  border-radius: 3px;
}

/* MAIN CONTENT */
#main-content {
  height: calc(360px - 32px - 20px - 28px - 96px);
  overflow-y: auto;
  padding: 3px 5px;
}
#main-content::-webkit-scrollbar { width: 3px; }
#main-content::-webkit-scrollbar-track { background: #131a26; }
#main-content::-webkit-scrollbar-thumb { background: #1c2740; border-radius: 2px; }

/* CHALLENGE CARDS */
.challenge-card {
  display: flex;
  align-items: center;
  background: #131a26;
  border: 1px solid #1c2740;
  border-radius: 5px;
  padding: 5px 7px;
  margin-bottom: 3px;
  cursor: pointer;
  transition: all 0.2s;
}
.challenge-card:hover { border-color: #f0c040; transform: translateX(2px); }
.challenge-card.selected { border-color: #40ff80; box-shadow: 0 0 8px rgba(64,255,128,0.3); }
.ninja-avatar {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  background: #1c2740;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.1);
}
.ninja-details {
  flex: 1;
  margin-left: 6px;
  min-width: 0;
}
.ninja-name {
  font-size: 10px;
  font-weight: bold;
  color: #e6edf3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ninja-rank {
  font-size: 9px;
  color: #f0c040;
  font-weight: bold;
}
.ninja-rank.top1 { color: #ff4040; }
.ninja-rank.top3 { color: #ffcc00; }
.ninja-rank.top10 { color: #4080ff; }
.ninja-rank.top25 { color: #888; }
.ninja-stats {
  display: flex;
  gap: 4px;
  font-size: 8px;
  margin-top: 1px;
  flex-wrap: wrap;
}
.stat-chip {
  background: #1c2740;
  padding: 1px 4px;
  border-radius: 3px;
  color: #a0b0c0;
}
.stat-chip.hp { color: #ff6060; }
.stat-chip.atk { color: #ff9040; }
.stat-chip.def { color: #60a0ff; }
.ninja-rank-badge {
  font-size: 8px;
  padding: 2px 5px;
  border-radius: 3px;
  font-weight: bold;
}
.rank-genin { background: #408040; color: #a0ffa0; }
.rank-chunin { background: #4040a0; color: #a0a0ff; }
.rank-jonin { background: #a04040; color: #ffa0a0; }
.rank-anbu { background: #604080; color: #d0a0ff; }
.rank-kage { background: #808040; color: #ffff80; }

/* BOTTOM SECTION */
#bottom-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 96px;
  background: #131a26;
  border-top: 1px solid #1c2740;
  display: flex;
  flex-direction: column;
}
#combat-log {
  flex: 1;
  overflow-y: auto;
  padding: 4px 6px;
  font-size: 8px;
  height: 100%;
}
#combat-log::-webkit-scrollbar { width: 3px; }
#combat-log::-webkit-scrollbar-track { background: #131a26; }
#combat-log::-webkit-scrollbar-thumb { background: #1c2740; border-radius: 2px; }
.log-entry {
  padding: 2px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  display: flex;
  gap: 3px;
  align-items: center;
}
.log-entry.win { color: #40ff80; }
.log-entry.lose { color: #ff4040; }
.log-entry.neutral { color: #80a0c0; }
.log-time { color: #607080; min-width: 30px; }

/* OVERLAYS */
.overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(8, 12, 20, 0.92);
  display: none;
  flex-direction: column;
  z-index: 100;
  padding: 6px;
  overflow-y: auto;
}
.overlay.active { display: flex; }
.overlay-close {
  align-self: flex-end;
  background: #162035;
  border: 1px solid #1c2740;
  color: #e6edf3;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.overlay-title {
  font-size: 13px;
  font-weight: bold;
  color: #f0c040;
  text-align: center;
  margin: 3px 0 5px 0;
}
/* LEADERBOARD */
.lb-entry {
  display: flex;
  align-items: center;
  padding: 2px 5px;
  margin-bottom: 1.5px;
  border-radius: 3px;
  background: #131a26;
  font-size: 8.5px;
  gap: 3px;
}
.lb-entry.player-row { border: 1px solid #f0c040; }
.lb-pos { min-width: 20px; font-weight: bold; text-align: center; font-size: 8px; }
.lb-pos.p1 { color: #ff4040; }
.lb-pos.p2, .lb-pos.p3 { color: #ffcc00; }
.lb-pos.p10 { color: #4080ff; }
.lb-pos.p25 { color: #888; }
.lb-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lb-reward { color: #80a0c0; font-size: 7.5px; }
#lb-timer {
  text-align: center;
  font-size: 10px;
  color: #ff8040;
  font-weight: bold;
  margin-bottom: 5px;
  padding: 3px;
  background: #131a26;
  border-radius: 4px;
}
/* BATTLE SCREEN */
#battle-screen {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(8, 12, 20, 0.95);
  display: none;
  flex-direction: column;
  z-index: 200;
  padding: 5px;
}
#battle-screen.active { display: flex; }
.battle-field {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 6px;
}
.battle-fighter {
  text-align: center;
  width: 45%;
}
.battle-fighter .ninja-avatar {
  width: 50px;
  height: 50px;
  font-size: 28px;
  margin: 0 auto 3px auto;
}
.battle-fighter .fighter-name {
  font-size: 9px;
  font-weight: bold;
  margin-bottom: 1px;
}
.battle-fighter .fighter-rank {
  font-size: 8px;
  color: #f0c040;
  margin-bottom: 3px;
}
.bar-container {
  width: 100%;
  height: 8px;
  background: #0d1117;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.5px;
  border: 1px solid rgba(255,255,255,0.1);
}
.bar-hp { height: 100%; background: linear-gradient(90deg, #ff4040, #ff8060); transition: width 0.3s; }
.bar-mp { height: 100%; background: linear-gradient(90deg, #4060ff, #80a0ff); transition: width 0.3s; }
.bar-label {
  font-size: 7px;
  color: #a0b0c0;
  display: flex;
  justify-content: space-between;
}
.fighter-stats {
  display: flex;
  gap: 3px;
  justify-content: center;
  margin-top: 3px;
}
.fighter-stats .stat-chip { font-size: 7px; }
#battle-log {
  height: 45px;
  overflow-y: auto;
  font-size: 7.5px;
  padding: 2px;
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
  margin-top: 3px;
}
#battle-log::-webkit-scrollbar { width: 2px; }
#battle-log::-webkit-scrollbar-thumb { background: #1c2740; }
.battle-msg { padding: 0.5px 0; }
.battle-msg.dmg { color: #ff6040; }
.battle-msg.heal { color: #40ff80; }
.battle-msg.info { color: #80a0c0; }
/* WIN/LOSE OVERLAY */
#result-overlay {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  z-index: 300;
  display: none;
  text-align: center;
  min-width: 160px;
}
#result-overlay.active { display: block; }
#result-overlay.win {
  background: rgba(40, 255, 80, 0.2);
  border: 2px solid #40ff80;
  color: #40ff80;
  text-shadow: 0 0 10px #40ff80;
}
#result-overlay.lose {
  background: rgba(255, 40, 40, 0.2);
  border: 2px solid #ff4040;
  color: #ff4040;
  text-shadow: 0 0 10px #ff4040;
}
/* NOTIFICATION PANEL */
.notif-entry {
  padding: 3px 5px;
  margin-bottom: 2px;
  border-radius: 3px;
  font-size: 8.5px;
  background: #131a26;
  border-left: 3px solid;
}
.notif-entry.win { border-color: #40ff80; color: #40ff80; }
.notif-entry.lose { border-color: #ff4040; color: #ff4040; }
</style>
</head>
<body>

<div id="game-container">

  <!-- ==================== MENU: Botón dentro del mismo cuadro ==================== -->
  <div id="main-menu">
    <button class="menu-btn" onclick="enterGame()">⚔️ BATALLA NINJA</button>
  </div>

  <!-- ==================== GAME CONTENT: Todo el juego ==================== -->
  <div id="game-content">
    <!-- TOP BAR -->
    <div id="top-bar">
      <div class="top-icon" id="msg-btn" onclick="toggleMessages()">
        💬 <span class="badge" id="msg-badge" style="display:none">0</span>
      </div>
      <div id="player-info">
        🥷 <span id="player-name">Tú</span> | Rango <span id="player-rank">#101</span> | Lv.<span id="player-level">7</span>
      </div>
      <div class="top-icon" onclick="toggleLeaderboard()">
        🏆 100 Ninjas
      </div>
    </div>

    <!-- EVENT TIMER -->
    <div id="event-timer-bar">
      ⏱️ Evento: <span id="event-timer">23:59:59</span>
    </div>

    <!-- PLAYER STATS BAR -->
    <div id="player-stats-bar">
      <div class="player-stat hp-stat">
        ❤️ HP x6: <span id="p-hp-display">1200</span>
        <div class="stat-bar-mini"><div class="stat-bar-mini-fill-hp" id="p-hp-bar-mini" style="width:100%"></div></div>
      </div>
      <div class="player-stat mp-stat">
        💎 MP: <span id="p-mp-display">50</span>
        <div class="stat-bar-mini"><div class="stat-bar-mini-fill-mp" id="p-mp-bar-mini" style="width:100%"></div></div>
      </div>
      <div class="player-stat atk-stat">⚔️ <span id="p-atk-display">30</span></div>
      <div class="player-stat def-stat">🛡️ <span id="p-def-display">15</span></div>
    </div>

    <!-- MAIN CONTENT - CHALLENGE CARDS -->
    <div id="main-content"></div>

    <!-- BOTTOM SECTION -->
    <div id="bottom-section">
      <div id="combat-log">
        <div style="text-align:center;color:#607080;font-size:7.5px;padding:2px;">📜 Últimos Combates entre Ninjas</div>
      </div>
    </div>

    <!-- LEADERBOARD OVERLAY -->
    <div class="overlay" id="leaderboard-overlay">
      <button class="overlay-close" onclick="toggleLeaderboard()">✕</button>
      <div class="overlay-title">🏆 RANKING NINJA</div>
      <div id="lb-timer">⏱️ Tiempo restante: <span id="lb-countdown">23:59:59</span></div>
      <div id="lb-list"></div>
    </div>

    <!-- MESSAGES OVERLAY -->
    <div class="overlay" id="messages-overlay">
      <button class="overlay-close" onclick="toggleMessages()">✕</button>
      <div class="overlay-title">💬 NOTIFICACIONES DE COMBATE</div>
      <div id="notif-list"></div>
    </div>

    <!-- BATTLE SCREEN -->
    <div id="battle-screen">
      <div class="battle-field">
        <div class="battle-fighter" id="player-fighter"></div>
        <div style="font-size:20px;color:#ff4040">⚔️</div>
        <div class="battle-fighter" id="enemy-fighter"></div>
      </div>
      <div id="battle-log"></div>
      <div id="result-overlay"></div>
    </div>
  </div>

</div>

<script src="batallas-ninja-core.js"></script>
</body>
</html>`;

  function renderBatallasSection(centerEl) {
    centerEl.replaceChildren();

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '10px';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '⚔️ BATALLAS NINJA';
    button.style.alignSelf = 'center';
    button.style.padding = '10px 14px';
    button.style.border = '1px solid #f0c040';
    button.style.background = '#131a26';
    button.style.color = '#f0c040';
    button.style.borderRadius = '8px';
    button.style.fontWeight = '700';
    button.style.cursor = 'pointer';

    const iframeHost = document.createElement('div');
    iframeHost.style.flex = '1';
    iframeHost.style.minHeight = '0';
    iframeHost.style.display = 'none';

    const iframe = document.createElement('iframe');
    iframe.title = 'Batallas Ninja';
    iframe.srcdoc = BATALLAS_NINJA_SRCDOC;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '1px solid #1c2740';
    iframe.style.borderRadius = '8px';

    button.addEventListener('click', () => {
      iframeHost.style.display = 'block';
      if (!iframe.parentNode) {
        iframeHost.appendChild(iframe);
      }
    });

    wrapper.appendChild(button);
    wrapper.appendChild(iframeHost);
    centerEl.appendChild(wrapper);
  }

  window.BatallasNinjaModule = {
    renderBatallasSection
  };
})();
