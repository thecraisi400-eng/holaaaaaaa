(function initBotonHero(global) {
  function renderHeroSystem(container) {
    if (!container) return;

    container.innerHTML = `
      <section class="hero-system" aria-label="Sistema del héroe">
        <header class="hero-system__header">
          <div class="hero-system__profile">
            <p class="hero-system__level">Lvl 85</p>
            <p class="hero-system__rarity">ÉPICO</p>
            <h2 class="hero-system__name">Sir Kaelen</h2>
            <div class="hero-system__xp-wrap">
              <div class="hero-system__xp-fill"></div>
              <span class="hero-system__xp-text">69 / 99</span>
            </div>
          </div>
          <div class="hero-system__portrait" aria-label="Retrato del caballero">🛡️</div>
        </header>

        <div class="hero-system__mid">
          <section class="basic-stats">
            <h3 class="section-banner">ESTADÍSTICAS BÁSICAS</h3>
            <ul class="basic-stats__list">
              <li><span>❤️ PV</span><strong>15200</strong></li>
              <li><span>🗡️ Ataque</span><strong>4300</strong></li>
              <li><span>🛡️ Defensa</span><strong>2100</strong></li>
              <li><span>💥 Eofensa</span><strong>1100</strong></li>
              <li><span>🪓 Daño</span><strong>1200</strong></li>
              <li><span>🏹 Daño catia</span><strong>930</strong></li>
              <li><span>🧪 Resiitercia</span><strong>300</strong></li>
              <li><span>⚙️ Maestría</span><strong>200</strong></li>
            </ul>
          </section>

          <section class="equipment">
            <h3 class="section-title">EQUIPAMIENTO</h3>
            <div class="equipment__grid">
              <div class="slot">⛑️</div>
              <div class="slot">🧥</div>
              <div class="slot">🧤</div>
              <div class="slot">🥾</div>
              <div class="slot">⚔️</div>
              <div class="slot">🛡️</div>
              <div class="slot">🦵</div>
              <div class="slot">💍</div>
              <div class="slot">📿</div>
            </div>
          </section>
        </div>

        <section class="skills">
          <h3 class="section-title">HABILIDADES</h3>
          <div class="skills__grid">
            <article class="skill">
              <div class="skill__icon">✨</div>
              <div class="skill__meta">
                <p>Golpe Divino</p>
                <div class="skill__bar"><span style="width:75%"></span></div>
                <small>3 / 4</small>
              </div>
            </article>
            <article class="skill">
              <div class="skill__icon">🛡️</div>
              <div class="skill__meta">
                <p>Escudo Sagrado</p>
                <div class="skill__bar"><span style="width:67%"></span></div>
                <small>2 / 3</small>
              </div>
            </article>
            <article class="skill">
              <div class="skill__icon">📣</div>
              <div class="skill__meta">
                <p>Grito de Guerra</p>
                <div class="skill__bar"><span style="width:100%"></span></div>
                <small>5 / 5</small>
              </div>
            </article>
            <article class="skill">
              <div class="skill__icon">🔥</div>
              <div class="skill__meta">
                <p>Furia Elemental</p>
                <div class="skill__bar"><span style="width:60%"></span></div>
                <small>3 / 5</small>
              </div>
            </article>
          </div>
        </section>

        <footer class="hero-system__footer">
          <button type="button" class="level-up-btn" aria-label="Subir de nivel">⬆</button>
          <p class="total-damage">Daño Total: 700</p>
        </footer>
      </section>
    `;
  }

  global.BotonHero = { renderHeroSystem };
})(window);
