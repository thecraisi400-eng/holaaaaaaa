(function () {
  const AUTO_TRIGGER_CHANCE = 0.25;
  const COUNTER_TRIGGER_CHANCE = 0.30;
  const AUTO_TRIGGER_INTERVAL_MS = 1000;

  function pickRandom(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)] || null;
  }

  function createManager(config = {}) {
    const state = {
      tickMs: 0
    };

    const fighterIds = Array.isArray(config.fighterIds) ? config.fighterIds.slice(0, 2) : [];

    const getSkillsForFighter = (fighterId) => {
      if (typeof config.getSkillsForFighter !== 'function') return [];
      const skills = config.getSkillsForFighter(fighterId);
      return Array.isArray(skills) ? skills.slice(0, 3) : [];
    };

    const canUseSkill = (fighterId, skill) => {
      if (typeof config.canUseSkill !== 'function') return true;
      return Boolean(config.canUseSkill(fighterId, skill));
    };

    const consumeMp = (fighterId, skill) => {
      if (typeof config.consumeMp !== 'function') return true;
      return Boolean(config.consumeMp(fighterId, skill));
    };

    const isLockedByProjectile = () => (typeof config.isLockedByProjectile === 'function' ? Boolean(config.isLockedByProjectile()) : false);

    const castSkill = (fighterId, targetId, skill, meta = {}) => {
      if (typeof config.castSkill !== 'function') return false;
      return Boolean(config.castSkill(fighterId, targetId, skill, meta));
    };

    function getUsableSkills(fighterId) {
      return getSkillsForFighter(fighterId).filter((skill) => canUseSkill(fighterId, skill));
    }

    function attemptCast(fighterId, targetId, meta = {}) {
      const usableSkills = getUsableSkills(fighterId);
      if (usableSkills.length === 0) return false;
      const chosenSkill = pickRandom(usableSkills);
      if (!chosenSkill) return false;
      if (!consumeMp(fighterId, chosenSkill)) return false;
      return castSkill(fighterId, targetId, chosenSkill, meta);
    }

    function tick(deltaMs = 0) {
      if (isLockedByProjectile() || fighterIds.length < 2) return;
      state.tickMs += deltaMs;
      if (state.tickMs < AUTO_TRIGGER_INTERVAL_MS) return;
      state.tickMs = 0;
      for (let i = 0; i < fighterIds.length; i += 1) {
        const fighterId = fighterIds[i];
        const targetId = fighterIds[(i + 1) % fighterIds.length];
        if (Math.random() <= AUTO_TRIGGER_CHANCE) {
          attemptCast(fighterId, targetId, { reason: 'auto' });
        }
      }
    }

    function onSkillCast(casterId, targetId, baseMeta = {}) {
      if (isLockedByProjectile()) return false;
      if (Math.random() > COUNTER_TRIGGER_CHANCE) return false;
      return attemptCast(targetId, casterId, { ...baseMeta, reason: 'counter', counterTo: casterId });
    }

    function reset() {
      state.tickMs = 0;
    }

    return {
      tick,
      onSkillCast,
      reset
    };
  }

  window.JutsuBattleSync = {
    createManager
  };
})();
