(() => {
  function applySelection(selection) {
    const state = window.gameData?.initialState;
    if (!state || !selection) return;

    const stats = selection.stats;
    state.level = 1;
    state.rank = 'Genin';
    state.charName = selection.name;
    state.charClan = selection.clan.name;
    state.charEmoji = selection.emoji;

    state.hpMax = Math.round(stats.hpMax);
    state.mpMax = Math.round(stats.mpMax);
    state.hp = state.hpMax;
    state.mp = state.mpMax;

    state.exp = 0;
    state.expMax = Math.max(100, Math.round(stats.XP));
    state.gold = Math.max(400, state.gold);

    state.atk = Math.round(stats.atk);
    state.def = Math.round(stats.def);

    const nameNode = document.getElementById('charName');
    const rankNode = document.getElementById('charRank');
    const avatarFrame = document.getElementById('avatarFrame');
    const hpMaxNode = document.getElementById('hpMax');
    const mpMaxNode = document.getElementById('mpMax');
    const statAtkNode = document.getElementById('statAtk');
    const statDefNode = document.getElementById('statDef');

    if (nameNode) nameNode.textContent = selection.name.toUpperCase();
    if (rankNode) rankNode.textContent = 'GENIN';
    if (avatarFrame) avatarFrame.innerHTML = `<div class="avatar-placeholder">${selection.emoji}</div><div class="avatar-corner"></div>`;
    if (hpMaxNode) hpMaxNode.textContent = state.hpMax;
    if (mpMaxNode) mpMaxNode.textContent = state.mpMax;
    if (statAtkNode) statAtkNode.textContent = state.atk.toLocaleString('es-ES');
    if (statDefNode) statDefNode.textContent = state.def.toLocaleString('es-ES');
  }

  window.charLogic = { applySelection };
})();
