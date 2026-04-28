(function initBotonHero(global) {
  function renderHeroSystem(container, state) {
    if (!container || !state?.hero) return;

    const { hero, resources, combat, progression, equipment, skills } = state;
    const percentExp = Math.min(100, Math.round((progression.exp / progression.expToNext) * 100));

    container.innerHTML = `
      <section class="hero-system" aria-label="Panel del héroe">
        <header class="hero-system__top">
          <div class="hero-system__avatar" aria-label="Retrato del héroe">🥷</div>
          <div class="hero-system__identity">
            <div class="hero-system__name-row">
              <h2 class="hero-system__name">${hero.name}</h2>
              <span class="hero-system__tag">${hero.rank}</span>
            </div>

            <div class="hero-system__meta">
              <span class="hero-system__pill">Nivel <strong>${progression.level}</strong></span>
              <span class="hero-system__pill">ATK <strong>${combat.atk}</strong></span>
              <span class="hero-system__pill">DEF <strong>${combat.def}</strong></span>
            </div>

            <div class="hero-system__xp">
              <div class="hero-system__xp-head">
                <span>Progreso</span>
                <span>${progression.exp} / ${progression.expToNext}</span>
              </div>
              <div class="hero-system__xp-track">
                <div class="hero-system__xp-fill" style="width:${percentExp}%"></div>
              </div>
            </div>
          </div>
        </header>

        <section class="hero-system__grid">
          <article class="hero-card">
            <h3 class="hero-card__title">ESTADÍSTICAS</h3>
            <ul class="hero-stats-list">
              <li><span>❤️ Vida</span><strong>${resources.hp.cur}</strong></li>
              <li><span>💧 Chakra</span><strong>${resources.mp.cur}</strong></li>
              <li><span>⚡ Velocidad</span><strong>${combat.speed}</strong></li>
              <li><span>🎯 Crítico</span><strong>${combat.crit}%</strong></li>
              <li><span>🛡️ Resistencia</span><strong>${combat.resistance}</strong></li>
            </ul>
          </article>

          <article class="hero-card">
            <h3 class="hero-card__title">EQUIPO</h3>
            <div class="hero-equip-grid">
              ${equipment.map((slot) => `<div class="hero-slot" title="${slot.name}">${slot.icon}</div>`).join('')}
            </div>
          </article>
        </section>

        <section class="hero-card">
          <h3 class="hero-card__title">JUTSUS ACTIVOS</h3>
          <div class="hero-skills">
            ${skills.map((skill) => `
              <article class="hero-skill">
                <div class="hero-skill__icon">${skill.icon}</div>
                <div class="hero-skill__meta">
                  <p class="hero-skill__name">${skill.name}</p>
                  <div class="hero-skill__bar"><span style="width:${skill.mastery}%"></span></div>
                </div>
              </article>
            `).join('')}
          </div>
        </section>

        <footer class="hero-system__footer">
          <p class="hero-system__power">Poder total <strong>${combat.power}</strong></p>
          <button type="button" id="train-btn" class="hero-system__action">ENTRENAR (+10 EXP)</button>
        </footer>
      </section>
    `;
  }

  global.BotonHero = { renderHeroSystem };
})(window);
