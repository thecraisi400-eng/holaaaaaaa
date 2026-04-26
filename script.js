const navButtons = document.querySelectorAll('[data-nav]');
const panelContainer = document.getElementById('panel-container');

function renderPlaceholder(name) {
  if (!panelContainer) return;
  panelContainer.innerHTML = `<div class="panel-placeholder">${name.toUpperCase()} (PRÓXIMAMENTE)</div>`;
}

function renderPanel(panelName) {
  if (panelName === 'heroe') {
    if (window.BotonHero?.renderHeroSystem) {
      window.BotonHero.renderHeroSystem(panelContainer);
    } else {
      renderPlaceholder('Error cargando HÉROE');
    }
    return;
  }

  renderPlaceholder(panelName);
}

function setActive(btn) {
  navButtons.forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  renderPanel(btn.dataset.panel || '');
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => setActive(btn));
});

renderPanel('heroe');

const stats = {
  hp: { cur: 7200, max: 10000, regen: 15 },
  mp: { cur: 2750, max: 5000, regen: 10 },
  exp: { cur: 3800, max: 10000, regen: 5 },
};

const fmt = (n) => Math.round(n).toLocaleString('es');

function updateBar(key) {
  const s = stats[key];
  const pct = Math.min(100, Math.round((s.cur / s.max) * 100));

  document.getElementById(`bar-${key}`).style.width = `${pct}%`;
  document.getElementById(`pct-${key}`).textContent = `${pct}%`;
  document.getElementById(`num-${key}`).textContent = `${fmt(s.cur)} / ${fmt(s.max)}`;
}

function tick() {
  ['hp', 'mp', 'exp'].forEach((key) => {
    const s = stats[key];

    if (s.cur < s.max) {
      s.cur = Math.min(s.max, s.cur + s.regen);
      updateBar(key);
    }

    if (key !== 'exp') {
      const ind = document.getElementById(`regen-${key}`);
      if (ind) ind.style.display = s.cur < s.max ? 'inline' : 'none';
    }
  });
}

setTimeout(() => {
  stats.hp.cur -= 1200;
  updateBar('hp');
}, 800);

setTimeout(() => {
  stats.mp.cur -= 800;
  updateBar('mp');
}, 1200);

setInterval(tick, 1200);
