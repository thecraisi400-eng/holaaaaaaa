(function initBotonHero(global) {
  function renderHeroSystem(container) {
    if (!container) return;

    container.innerHTML = `
      <section class="hero-system" aria-label="Panel del héroe">
        <header class="hero-system__top">
          <div class="hero-system__avatar" aria-label="Retrato del héroe">🥷</div>
          <div class="hero-system__identity">
            <div class="hero-system__name-row">
              <h2 class="hero-system__name">Sasuke Uchiha</h2>
              <span class="hero-system__tag">RANGO KAGE</span>
            </div>

            <div class="hero-system__meta">
              <span class="hero-system__pill">Nivel <strong>42</strong></span>
              <span class="hero-system__pill">ATK <strong>847</strong></span>
              <span class="hero-system__pill">DEF <strong>623</strong></span>
            </div>

            <div class="hero-system__xp">
              <div class="hero-system__xp-head">
                <span>Progreso</span>
                <span>7,100 / 10,000</span>
              </div>
              <div class="hero-system__xp-track">
                <div class="hero-system__xp-fill"></div>
              </div>
            </div>
          </div>
        </header>

        <section class="hero-system__grid">
          <article class="hero-card">
            <h3 class="hero-card__title">ESTADÍSTICAS</h3>
            <ul class="hero-stats-list">
              <li><span>❤️ Vida</span><strong>7,200</strong></li>
              <li><span>💧 Chakra</span><strong>2,750</strong></li>
              <li><span>⚡ Velocidad</span><strong>312</strong></li>
              <li><span>🎯 Crítico</span><strong>24%</strong></li>
              <li><span>🛡️ Resistencia</span><strong>191</strong></li>
            </ul>
          </article>

          <article class="hero-card">
            <h3 class="hero-card__title">EQUIPO</h3>
            <div class="hero-equip-grid">
              <div class="hero-slot">⛑️</div>
              <div class="hero-slot">🧥</div>
              <div class="hero-slot">🧤</div>
              <div class="hero-slot">🥾</div>
              <div class="hero-slot">⚔️</div>
              <div class="hero-slot">📿</div>
            </div>
          </article>
        </section>

        <section class="hero-card">
          <h3 class="hero-card__title">JUTSUS ACTIVOS</h3>
          <div class="hero-skills">
            <article class="hero-skill">
              <div class="hero-skill__icon">🔥</div>
              <div class="hero-skill__meta">
                <p class="hero-skill__name">Katon: Gōkakyū</p>
                <div class="hero-skill__bar"><span style="width:78%"></span></div>
              </div>
            </article>
            <article class="hero-skill">
              <div class="hero-skill__icon">⚡</div>
              <div class="hero-skill__meta">
                <p class="hero-skill__name">Chidori</p>
                <div class="hero-skill__bar"><span style="width:63%"></span></div>
              </div>
            </article>
          </div>
        </section>

        <footer class="hero-system__footer">
          <p class="hero-system__power">Poder total <strong>18,476</strong></p>
          <button type="button" class="hero-system__action">MEJORAR</button>
        </footer>
      </section>
    `;
  }

  global.BotonHero = { renderHeroSystem };
})(window);
