import { createInitialState } from './core/state.js';
import { sections } from './data/sections.js';
import { getDomElements } from './ui/dom.js';
import { renderBars } from './ui/render-bars.js';
import { spawnParticles } from './effects/particles.js';
import { spawnFloatText } from './effects/float-text.js';
import { setupNavigation } from './features/navigation.js';

const state = createInitialState();
const elements = getDomElements();

renderBars(state, elements);
setupNavigation({
  state,
  sections,
  elements,
  spawnParticles,
  spawnFloatText,
});
