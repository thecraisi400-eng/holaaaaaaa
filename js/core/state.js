import { calcStats } from './stats.js';

export function createInitialState() {
  const state = {
    level: 1,
    exp: 0,
    gold: 100,
    activeSection: 'heroe',
  };

  const stats = calcStats(state.level);
  state.hpMax = stats.hp;
  state.hp = stats.hp;
  state.mpMax = stats.mp;
  state.mp = stats.mp;
  state.expMax = stats.xpReq;
  state.atk = stats.atk;
  state.def = stats.def;

  return state;
}
