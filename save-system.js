(function () {
  const SAVE_VERSION = 2;
  const SLOT_COUNT = 3;
  const SLOT_PREFIX = 'ngs_save_slot_';
  const META_KEY = 'ngs_save_slots_meta';
  const TEMP_SUFFIX = '_temp';
  const BACKUP_SUFFIX = '_backup';

  function slotKey(slotId) {
    return `${SLOT_PREFIX}${slotId}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function safeParse(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function hashString(input) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function cleanNumber(value, fallback = 0, min = 0, max = Number.POSITIVE_INFINITY) {
    const normalized = Number(value);
    if (!Number.isFinite(normalized)) return fallback;
    return Math.min(max, Math.max(min, normalized));
  }

  function cleanString(value, fallback = '') {
    if (typeof value !== 'string') return fallback;
    return value;
  }

  function clampEquipmentLevel(level) {
    return cleanNumber(level, 1, 1, 80);
  }

  function normalizeSaveState(rawState = {}) {
    const equipment = rawState.equipment || {};
    const mission = rawState.mission || {};
    const options = rawState.options || {};
    const saveLog = rawState.saveLog || {};
    const currentMission = mission.currentMission || {};

    return {
      characterId: cleanString(rawState.characterId),
      character: cleanString(rawState.character),
      characterSprite: cleanString(rawState.characterSprite),
      clan: cleanString(rawState.clan),
      clanName: cleanString(rawState.clanName),
      level: cleanNumber(rawState.level, 1, 1),
      rank: cleanString(rawState.rank, 'GENIN') || 'GENIN',
      exp: cleanNumber(rawState.exp, 0, 0),
      expCurrentLevelStart: cleanNumber(rawState.expCurrentLevelStart, 0, 0),
      expMax: cleanNumber(rawState.expMax, 1000, 1),
      hp: cleanNumber(rawState.hp, 100, 0),
      hpMax: cleanNumber(rawState.hpMax, 100, 1),
      mp: cleanNumber(rawState.mp, 100, 0),
      mpMax: cleanNumber(rawState.mpMax, 100, 1),
      atk: cleanNumber(rawState.atk, 10, 0),
      def: cleanNumber(rawState.def, 10, 0),
      gold: cleanNumber(rawState.gold, 100, 0),
      activeSection: cleanString(rawState.activeSection, 'heroe') || 'heroe',
      playTime: cleanString(rawState.playTime, '00:00:00') || '00:00:00',
      equipment: {
        weapon1: clampEquipmentLevel(equipment.weapon1),
        weapon2: clampEquipmentLevel(equipment.weapon2),
        head: clampEquipmentLevel(equipment.head),
        chest: clampEquipmentLevel(equipment.chest),
        gloves: clampEquipmentLevel(equipment.gloves),
        boots: clampEquipmentLevel(equipment.boots)
      },
      mission: {
        currentView: cleanString(mission.currentView, 'ms-view-main') || 'ms-view-main',
        currentRank: cleanString(mission.currentRank),
        isBattleActive: Boolean(mission.isBattleActive),
        heroLevel: cleanNumber(mission.heroLevel, 1, 1),
        currentMission: {
          rank: cleanString(currentMission.rank),
          index: cleanNumber(currentMission.index, -1, -1),
          name: cleanString(currentMission.name)
        }
      },
      options: {
        keepAwakeEnabled: Boolean(options.keepAwakeEnabled)
      },
      saveLog: {
        lastSaveReason: cleanString(saveLog.lastSaveReason, 'manual') || 'manual',
        lastSaveAt: cleanNumber(saveLog.lastSaveAt, Date.now(), 0),
        lastSaveStatus: cleanString(saveLog.lastSaveStatus, 'ok') || 'ok',
        lastSaveError: cleanString(saveLog.lastSaveError)
      }
    };
  }

  function buildSummary(state) {
    const currentMissionText = state.mission.currentMission.rank
      ? `${state.mission.currentMission.rank}-${Math.max(1, state.mission.currentMission.index + 1)}`
      : 'Sin misión activa';

    return {
      character: state.character || 'Desconocido',
      clanName: state.clanName || 'Sin clan',
      level: state.level,
      rank: state.rank || 'GENIN',
      playTime: state.playTime || '00:00:00',
      gold: state.gold,
      hp: state.hp,
      mp: state.mp,
      activeSection: state.activeSection || 'heroe',
      currentMission: currentMissionText,
      integrityStatus: 'ok'
    };
  }

  function serializePayload(payload) {
    const serialized = JSON.stringify(payload);
    const checksum = hashString(serialized);
    return JSON.stringify({ checksum, payload });
  }

  function migratePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return { ok: false, error: 'invalid-payload' };
    }

    if (payload.version === SAVE_VERSION) {
      const normalizedState = normalizeSaveState(payload.state || {});
      return {
        ok: true,
        payload: {
          version: SAVE_VERSION,
          timestamp: cleanNumber(payload.timestamp, Date.now(), 0),
          savedAt: cleanString(payload.savedAt, nowIso()) || nowIso(),
          summary: buildSummary(normalizedState),
          state: normalizedState
        },
        migrated: false
      };
    }

    if (payload.version === 1) {
      const legacy = payload.state || {};
      const migratedState = normalizeSaveState({
        ...legacy,
        playTime: payload.summary?.playTime || '00:00:00'
      });

      return {
        ok: true,
        payload: {
          version: SAVE_VERSION,
          timestamp: cleanNumber(payload.timestamp, Date.now(), 0),
          savedAt: cleanString(payload.savedAt, nowIso()) || nowIso(),
          summary: buildSummary(migratedState),
          state: migratedState
        },
        migrated: true
      };
    }

    return { ok: false, error: 'unsupported-version' };
  }

  function deserializeWithValidation(raw) {
    const wrapped = safeParse(raw);
    if (!wrapped || typeof wrapped !== 'object') {
      return { ok: false, error: 'invalid-wrapper' };
    }

    const serializedPayload = JSON.stringify(wrapped.payload || {});
    const expectedChecksum = hashString(serializedPayload);

    if (!wrapped.checksum || wrapped.checksum !== expectedChecksum) {
      return { ok: false, error: 'checksum-mismatch' };
    }

    const migrated = migratePayload(wrapped.payload);
    if (!migrated.ok) {
      return { ok: false, error: migrated.error };
    }

    return { ok: true, payload: migrated.payload, migrated: migrated.migrated };
  }

  function buildPayload(data) {
    const normalizedState = normalizeSaveState(data || {});
    const timestamp = Date.now();
    const savedAt = nowIso();

    return {
      version: SAVE_VERSION,
      timestamp,
      savedAt,
      summary: buildSummary(normalizedState),
      state: normalizedState
    };
  }

  function readMeta() {
    return safeParse(localStorage.getItem(META_KEY)) || {};
  }

  function writeMeta(meta) {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  function persistToSlot(slotId, payload) {
    const mainKey = slotKey(slotId);
    const tempKey = `${mainKey}${TEMP_SUFFIX}`;
    const backupKey = `${mainKey}${BACKUP_SUFFIX}`;
    const serialized = serializePayload(payload);

    localStorage.setItem(tempKey, serialized);
    const validated = deserializeWithValidation(localStorage.getItem(tempKey));
    if (!validated.ok) {
      localStorage.removeItem(tempKey);
      return { ok: false, error: validated.error };
    }

    const previousRaw = localStorage.getItem(mainKey);
    if (previousRaw) {
      localStorage.setItem(backupKey, previousRaw);
    }

    localStorage.setItem(mainKey, serialized);
    localStorage.removeItem(tempKey);

    const meta = readMeta();
    meta[slotId] = {
      ...payload.summary,
      timestamp: payload.timestamp,
      savedAt: payload.savedAt,
      slotId,
      integrityStatus: 'ok'
    };
    writeMeta(meta);

    return { ok: true };
  }

  function inspectSlot(slotId) {
    const mainKey = slotKey(slotId);
    const raw = localStorage.getItem(mainKey);
    if (!raw) {
      return { slotId, hasData: false, integrityStatus: 'empty' };
    }

    const parsed = deserializeWithValidation(raw);
    if (parsed.ok) {
      return {
        slotId,
        hasData: true,
        ...parsed.payload.summary,
        timestamp: parsed.payload.timestamp,
        savedAt: parsed.payload.savedAt,
        integrityStatus: parsed.migrated ? 'migrated' : 'ok'
      };
    }

    const backupRaw = localStorage.getItem(`${mainKey}${BACKUP_SUFFIX}`);
    if (!backupRaw) {
      return { slotId, hasData: true, integrityStatus: 'corrupted', error: parsed.error };
    }

    const backupParsed = deserializeWithValidation(backupRaw);
    if (!backupParsed.ok) {
      return { slotId, hasData: true, integrityStatus: 'corrupted', error: backupParsed.error };
    }

    return {
      slotId,
      hasData: true,
      ...backupParsed.payload.summary,
      timestamp: backupParsed.payload.timestamp,
      savedAt: backupParsed.payload.savedAt,
      integrityStatus: 'backup-available'
    };
  }

  function readSlot(slotId) {
    const mainKey = slotKey(slotId);
    const raw = localStorage.getItem(mainKey);
    if (!raw) return { ok: false, error: 'not-found' };

    const parsed = deserializeWithValidation(raw);
    if (parsed.ok) {
      if (parsed.migrated) {
        persistToSlot(slotId, parsed.payload);
      }
      return {
        ok: true,
        state: parsed.payload.state,
        meta: parsed.payload.summary,
        integrityStatus: parsed.migrated ? 'migrated' : 'ok'
      };
    }

    const backupRaw = localStorage.getItem(`${mainKey}${BACKUP_SUFFIX}`);
    if (!backupRaw) return { ok: false, error: parsed.error };

    const backupParsed = deserializeWithValidation(backupRaw);
    if (!backupParsed.ok) return { ok: false, error: backupParsed.error };

    persistToSlot(slotId, backupParsed.payload);

    return {
      ok: true,
      state: backupParsed.payload.state,
      meta: backupParsed.payload.summary,
      recoveredFromBackup: true,
      integrityStatus: 'backup-restored'
    };
  }

  function listSlots() {
    const meta = readMeta();
    const slots = [];

    for (let slotId = 1; slotId <= SLOT_COUNT; slotId += 1) {
      const inspected = inspectSlot(slotId);
      slots.push({
        ...inspected,
        ...(meta[slotId] || {}),
        integrityStatus: inspected.integrityStatus || meta[slotId]?.integrityStatus || 'unknown'
      });
    }

    return slots;
  }

  function deleteSlot(slotId) {
    localStorage.removeItem(slotKey(slotId));
    localStorage.removeItem(`${slotKey(slotId)}${BACKUP_SUFFIX}`);
    localStorage.removeItem(`${slotKey(slotId)}${TEMP_SUFFIX}`);

    const meta = readMeta();
    delete meta[slotId];
    writeMeta(meta);
  }

  function duplicateSlot(fromSlotId, toSlotId) {
    const loaded = readSlot(fromSlotId);
    if (!loaded.ok) return loaded;
    return persistToSlot(toSlotId, buildPayload(loaded.state));
  }

  function findLatestSlot() {
    return listSlots()
      .filter((slot) => slot.hasData && slot.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }

  window.NGSSaveSystem = {
    SLOT_COUNT,
    SAVE_VERSION,
    buildPayload,
    save(slotId, saveData) {
      return persistToSlot(slotId, buildPayload(saveData));
    },
    load: readSlot,
    delete: deleteSlot,
    listSlots,
    inspectSlot,
    duplicate: duplicateSlot,
    findLatestSlot
  };
})();
