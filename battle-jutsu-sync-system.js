(function () {
  const JutsuBattleSyncSystem = {
    createController(config = {}) {
      const state = {
        timer: 0,
        activeOrb: null,
        activeOverlays: new Map()
      };

      const getEquippedSkills = (fighter) => {
        const src = fighter?.getEquippedSkills?.();
        if (!Array.isArray(src)) return [];
        return src.slice(0, 3).filter((skill) => skill && Number.isFinite(Number(skill.mpCost)));
      };

      const getAffordableSkills = (fighter) => getEquippedSkills(fighter).filter((skill) => {
        const mpCost = Number(skill.mpCost) || 0;
        return typeof fighter?.canUseSkill === 'function' ? fighter.canUseSkill(mpCost, skill) : false;
      });

      const randomSkill = (fighter) => {
        const available = getAffordableSkills(fighter);
        if (!available.length) return null;
        return available[Math.floor(Math.random() * available.length)];
      };

      const clearOverlay = (orb) => {
        if (!orb) return;
        const overlay = state.activeOverlays.get(orb.id);
        if (overlay?.el?.parentNode) overlay.el.parentNode.removeChild(overlay.el);
        state.activeOverlays.delete(orb.id);
      };

      const spawnOverlay = (orb) => {
        const battleRoot = config.getBattleRoot?.();
        if (!battleRoot) return;
        const el = document.createElement('div');
        el.className = 'ms-battle-jutsu-tag';
        el.textContent = orb.skill?.name || 'Jutsu';
        battleRoot.appendChild(el);
        state.activeOverlays.set(orb.id, { el, owner: orb.owner });
      };

      const tryCast = (owner, target) => {
        if (!owner || !target || owner.isDead || target.isDead) return false;
        if (state.activeOrb) return false;
        const skill = randomSkill(owner);
        if (!skill) return false;
        if (!owner.consumeSkillMp?.(skill)) return false;

        const originOrb = config.createOrb?.(owner, target, skill);
        if (!originOrb) return false;

        let castedOrbs = [originOrb];
        const canCounter = Math.random() <= 0.30;
        if (canCounter) {
          const counterSkill = randomSkill(target);
          if (counterSkill && target.consumeSkillMp?.(counterSkill)) {
            const counterOrb = config.createOrb?.(target, owner, counterSkill);
            if (!counterOrb) return false;
            originOrb.counterTargetOrbId = counterOrb.id;
            counterOrb.counterTargetOrbId = originOrb.id;
            castedOrbs = [originOrb, counterOrb];
          }
        }

        castedOrbs.forEach((orb) => {
          config.spawnOrb?.(orb);
          spawnOverlay(orb);
        });

        state.activeOrb = originOrb;
        config.setSkillCinematicActive?.(true);
        return true;
      };

      return {
        update(dtMs) {
          if (config.isGameOver?.()) return;
          state.timer += dtMs;
          if (state.timer < 1000) return;
          state.timer = 0;

          const fighters = config.getFighters?.() || [];
          if (fighters.length < 2) return;
          const [player, enemy] = fighters;
          if (Math.random() <= 0.25) tryCast(player, enemy);
          if (Math.random() <= 0.25) tryCast(enemy, player);
        },

        onOrbResolved(orb) {
          clearOverlay(orb);
          if (state.activeOrb?.id === orb?.id) {
            state.activeOrb = null;
            config.setSkillCinematicActive?.(false);
          }
        },

        syncOverlays(projectToScreen) {
          for (const [orbId, data] of state.activeOverlays.entries()) {
            if (!data?.owner || !data?.el) continue;
            const point = projectToScreen(data.owner.cx, data.owner.y - 16);
            data.el.style.left = `${point.x}px`;
            data.el.style.top = `${point.y}px`;
            data.el.style.transform = 'translate(-50%, -100%)';
            if (!config.isOrbAlive?.(orbId)) {
              clearOverlay({ id: orbId });
            }
          }
        },

        reset() {
          state.timer = 0;
          state.activeOrb = null;
          for (const [, data] of state.activeOverlays.entries()) {
            if (data?.el?.parentNode) data.el.parentNode.removeChild(data.el);
          }
          state.activeOverlays.clear();
          config.setSkillCinematicActive?.(false);
        }
      };
    }
  };

  window.JutsuBattleSyncSystem = JutsuBattleSyncSystem;
})();
