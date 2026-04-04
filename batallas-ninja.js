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
  height: 405px;
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
  height: calc(405px - 32px - 20px - 28px - 96px);
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
/* BATTLE SCREEN (estructura Misiones/Bingo) */
#battle-screen.screen {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(8, 12, 20, 0.95);
  display: flex;
  flex-direction: column;
  z-index: 200;
  padding: 6px;
  gap: 6px;
}
#battle-screen.hidden { display: none !important; }
.battle-arena { display: flex; justify-content: space-between; gap: 10px; height: 128px; }
.character-card,
.enemy-card {
  width: 48%;
  border-radius: 12px;
  padding: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.character-card { background: #112240; border: 2px solid #1e4d8c; }
.enemy-card { background: #2a0a0a; border: 2px solid #b71c1c; }
.fighter-name { font-size: 9px; font-weight: bold; }
.fighter-rank { font-size: 7px; color: #f0c040; }
.card-emoji { font-size: 36px; line-height: 1; }
.bar-label {
  font-size: 7px;
  color: #c0d0e0;
  display: flex;
  justify-content: space-between;
}
.hp-bar,
.mp-bar { height: 8px; background: rgba(255,255,255,.08); border-radius: 8px; overflow: hidden; }
.hp-fill { width: 100%; height: 100%; background: #d32f2f; transition: width .2s; }
.mp-fill { width: 100%; height: 100%; background: #1565c0; transition: width .2s; }
.fighter-stats {
  display: flex;
  gap: 3px;
  justify-content: center;
  margin-top: 2px;
}
.fighter-stats .stat-chip { font-size: 7px; }
.combat-log {
  flex: 1;
  min-height: 48px;
  overflow-y: auto;
  font-size: 7.5px;
  padding: 4px;
  background: rgba(0,0,0,0.3);
  border-radius: 6px;
}
.combat-log::-webkit-scrollbar { width: 2px; }
.combat-log::-webkit-scrollbar-thumb { background: #1c2740; }
.battle-msg { padding: 1px 0; border-bottom: 1px solid rgba(255,255,255,.05); }
.battle-msg.dmg { color: #ff7a60; }
.battle-msg.heal { color: #40ff80; }
.battle-msg.info { color: #80a0c0; }
body.battle-only #top-bar,
body.battle-only #event-timer-bar,
body.battle-only #player-stats-bar,
body.battle-only #main-content,
body.battle-only #bottom-section {
  display: none !important;
}
body.battle-only #battle-screen.screen {
  position: static;
  inset: auto;
  background: #0d1117;
  height: 100%;
  min-height: 0;
  border-radius: 0;
}
body.battle-only #game-content {
  height: 100%;
}
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
    <div id="battle-screen" class="screen hidden">
      <div class="battle-arena">
        <div class="character-card" id="player-fighter"></div>
        <div class="enemy-card" id="enemy-fighter"></div>
      </div>
      <div id="battle-log" class="combat-log"></div>
      <div id="result-overlay"></div>
    </div>
  </div>

</div>

<script src="batallas-ninja-core.js"></script>
</body>
</html>`;

  let persistentIframe = null;
  let hiddenHost = null;

  function ensurePersistentIframe() {
    if (persistentIframe) return persistentIframe;

    persistentIframe = document.createElement('iframe');
    persistentIframe.title = 'Batallas Ninja';
    persistentIframe.srcdoc = BATALLAS_NINJA_SRCDOC;
    persistentIframe.style.width = '100%';
    persistentIframe.style.height = '100%';
    persistentIframe.style.border = '1px solid #1c2740';
    persistentIframe.style.borderRadius = '8px';

    hiddenHost = document.createElement('div');
    hiddenHost.style.position = 'fixed';
    hiddenHost.style.left = '-10000px';
    hiddenHost.style.top = '-10000px';
    hiddenHost.style.width = '1px';
    hiddenHost.style.height = '1px';
    hiddenHost.style.opacity = '0';
    hiddenHost.style.pointerEvents = 'none';
    hiddenHost.style.overflow = 'hidden';
    hiddenHost.appendChild(persistentIframe);
    document.body.appendChild(hiddenHost);

    return persistentIframe;
  }

  function mountIframeInHost(hostElement) {
    const iframe = ensurePersistentIframe();
    hostElement.appendChild(iframe);
  }

  function renderBatallasSection(centerEl) {
    centerEl.replaceChildren();

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '10px';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';

    const iframeHost = document.createElement('div');
    iframeHost.style.flex = '1';
    iframeHost.style.minHeight = '0';

    mountIframeInHost(iframeHost);

    wrapper.appendChild(iframeHost);
    centerEl.appendChild(wrapper);
  }

  function parkBatallasSection() {
    if (!persistentIframe || !hiddenHost) return;
    hiddenHost.appendChild(persistentIframe);
  }

  function syncPlayerStats(payload) {
    const iframe = ensurePersistentIframe();
    const targetWindow = iframe.contentWindow;
    if (!targetWindow) return false;

    try {
      targetWindow.postMessage({ type: 'BATALLAS_NINJA_SYNC_PLAYER_STATS', payload }, '*');
      if (targetWindow.BatallasNinjaBridge?.syncPlayerStats) {
        targetWindow.BatallasNinjaBridge.syncPlayerStats(payload);
      }
      return true;
    } catch (error) {
      console.warn('No se pudo sincronizar Batallas Ninja:', error);
      return false;
    }
  }

  window.BatallasNinjaModule = {
    renderBatallasSection,
    parkBatallasSection,
    syncPlayerStats
  };
})();
