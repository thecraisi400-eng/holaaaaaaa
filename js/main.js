import { createInitialState } from './core/state.js';
import { sections } from './data/sections.js';
import { getDomElements } from './ui/dom.js';
import { renderBars } from './ui/render-bars.js';
import { spawnParticles } from './effects/particles.js';
import { spawnFloatText } from './effects/float-text.js';
import { setupNavigation } from './features/navigation.js';
import { createAtributosController } from './features/botonatributos.js';

const state = createInitialState();
const elements = getDomElements();

renderBars(state, elements);

const atributosController = createAtributosController({
  overlayTitle: elements.overlayTitle,
  overlayDesc: elements.overlayDesc,
});

setupNavigation({
  state,
  sections,
  elements,
  spawnParticles,
  spawnFloatText,
  onSectionOpen: (sectionKey) => {
    if (sectionKey === 'atributos') {
      atributosController.renderAtributos();
      return true;
    }
    return false;
  },
});
