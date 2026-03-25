(() => {
  const initialTemplate = { ...window.gameData.initialState };

  function applyCharacterSetup(selection) {
    const { clan, heroName, avatar } = selection;
    const m = clan.modifiers;
    const nextState = {
      ...initialTemplate,
      hpMax: Math.round(initialTemplate.hpMax * m.hp),
      mpMax: Math.round(initialTemplate.mpMax * m.mp),
      atk: Math.round(initialTemplate.atk * m.atk),
      def: Math.round(initialTemplate.def * m.def),
    };

    nextState.hp = Math.min(nextState.hpMax, nextState.hp);
    nextState.mp = Math.min(nextState.mpMax, nextState.mp);

    window.gameData.initialState = nextState;
    window.gameData.profile = {
      heroName,
      rank: clan.rank,
      avatar,
      clanName: clan.name,
    };

    return nextState;
  }

  window.charLogic = { applyCharacterSetup };
})();
