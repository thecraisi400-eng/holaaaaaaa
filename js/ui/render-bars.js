export function renderBars(state, elements) {
  const hpPct = Math.round(state.hp / state.hpMax * 100);
  const mpPct = Math.round(state.mp / state.mpMax * 100);
  const expPct = state.expMax > 0 ? Math.round(state.exp / state.expMax * 100) : 0;

  elements.hpFill.style.width = `${hpPct}%`;
  elements.mpFill.style.width = `${mpPct}%`;
  elements.expFill.style.width = `${expPct}%`;

  elements.hpCur.textContent = state.hp;
  elements.hpMax.textContent = state.hpMax;
  elements.hpPct.textContent = `${hpPct}%`;
  elements.mpCur.textContent = state.mp;
  elements.mpMax.textContent = state.mpMax;
  elements.mpPct.textContent = `${mpPct}%`;
  elements.levelDisplay.textContent = state.level;
  elements.expNext.textContent =
    `${state.exp.toLocaleString()} / ${state.expMax.toLocaleString()} EXP — Próx. nivel: ${(state.expMax - state.exp).toLocaleString()}`;

  elements.statGold.textContent = state.gold.toLocaleString();
  elements.statAtk.textContent = state.atk;
  elements.statDef.textContent = state.def;
}
