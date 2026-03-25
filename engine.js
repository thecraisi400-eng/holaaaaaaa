(() => {
  const { initialState, sections } = window.gameData;
  const state = { ...initialState };
  let started = false;

  function applyProfile(profile) {
    if (!profile) return;

    if (profile.avatar) {
      document.querySelector('#avatarFrame .avatar-placeholder').textContent = profile.avatar;
    }
    if (profile.charName) {
      document.getElementById('charName').textContent = profile.charName.toUpperCase();
    }
    if (profile.rank) {
      document.getElementById('charRank').textContent = profile.rank.toUpperCase();
    }

    if (profile.stats) {
      state.hp = Number(profile.stats.HP) || 0;
      state.hpMax = Number(profile.stats.HP) || 0;
      state.mp = Number(profile.stats.MP) || 0;
      state.mpMax = Number(profile.stats.MP) || 0;
      state.atk = Number(profile.stats.ATK) || 0;
      state.def = Number(profile.stats.DEF) || 0;
      state.exp = 0;
      state.expMax = Number(profile.stats.XP) || 0;
      state.level = 1;
      state.gold = profile.gold ?? 0;
      document.getElementById('statAtk').textContent = Math.round(state.atk).toLocaleString();
      document.getElementById('statDef').textContent = Math.round(state.def).toLocaleString();
    }
  }

  function init(profile) {
    if (started) return;
    started = true;

    if (window.equipUI) {
      window.equipUI.init({
        getGold: () => state.gold,
        setGold: (value) => {
          state.gold = Math.max(0, value);
          window.gameUI.updateBars(state);
        },
      });
      window.equipUI.showHeroSection(state.activeSection === 'heroe');
    }

    applyProfile(profile);
    window.gameUI.bindNavigation(state, sections);
    window.gameUI.updateBars(state);
  }

  window.gameEngine = {
    init,
    state,
  };
})();
