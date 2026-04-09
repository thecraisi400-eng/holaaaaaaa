(function () {
  const SAVE_VERSION = 1;
  const SLOT_COUNT = 3;
  const SLOT_PREFIX = 'ngs_save_slot_';
  const META_KEY = 'ngs_save_slots_meta';
  const TEMP_SUFFIX = '_temp';

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

  function cleanNumber(value, fallback = 0, min = 0) {
    const normalized = Number(value);
    if (!Number.isFinite(normalized)) return fallback;
    return Math.max(min, normalized);
  }

  function serializePayload(payload) {
    const serialized = JSON.stringify(payload);
    const checksum = hashString(serialized);
    return JSON.stringify({ checksum, payload });
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

    const payload = wrapped.payload;
    if (!payload || typeof payload !== 'object') {
      return { ok: false, error: 'invalid-payload' };
    }

    if (payload.version !== SAVE_VERSION) {
      return { ok: false, error: 'unsupported-version' };
    }

    return { ok: true, payload };
  }

  function buildPayload(data) {
    const safe = data || {};
    return {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      savedAt: nowIso(),
      summary: {
        character: safe.character || 'Desconocido',
        clanName: safe.clanName || 'Sin clan',
        level: cleanNumber(safe.level, 1, 1),
        rank: safe.rank || 'GENIN',
        playTime: safe.playTime || '00:00:00'
      },
      state: {
        characterId: safe.characterId || '',
        character: safe.character || '',
        characterSprite: safe.characterSprite || '',
        clan: safe.clan || '',
        clanName: safe.clanName || '',
        level: cleanNumber(safe.level, 1, 1),
        rank: safe.rank || 'GENIN',
        exp: cleanNumber(safe.exp, 0, 0),
        hp: cleanNumber(safe.hp, 100, 0),
        mp: cleanNumber(safe.mp, 100, 0),
        gold: cleanNumber(safe.gold, 100, 0)
      }
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
    const serialized = serializePayload(payload);

    localStorage.setItem(tempKey, serialized);
    const validated = deserializeWithValidation(localStorage.getItem(tempKey));
    if (!validated.ok) {
      localStorage.removeItem(tempKey);
      return { ok: false, error: validated.error };
    }

    const previousRaw = localStorage.getItem(mainKey);
    if (previousRaw) {
      localStorage.setItem(`${mainKey}_backup`, previousRaw);
    }

    localStorage.setItem(mainKey, serialized);
    localStorage.removeItem(tempKey);

    const meta = readMeta();
    meta[slotId] = {
      ...payload.summary,
      timestamp: payload.timestamp,
      savedAt: payload.savedAt,
      slotId
    };
    writeMeta(meta);

    return { ok: true };
  }

  function readSlot(slotId) {
    const mainKey = slotKey(slotId);
    const raw = localStorage.getItem(mainKey);
    if (!raw) return { ok: false, error: 'not-found' };

    const parsed = deserializeWithValidation(raw);
    if (parsed.ok) {
      return { ok: true, state: parsed.payload.state, meta: parsed.payload.summary };
    }

    const backupRaw = localStorage.getItem(`${mainKey}_backup`);
    if (!backupRaw) return { ok: false, error: parsed.error };

    const backupParsed = deserializeWithValidation(backupRaw);
    if (!backupParsed.ok) return { ok: false, error: backupParsed.error };

    localStorage.setItem(mainKey, backupRaw);
    return {
      ok: true,
      state: backupParsed.payload.state,
      meta: backupParsed.payload.summary,
      recoveredFromBackup: true
    };
  }

  function listSlots() {
    const meta = readMeta();
    const slots = [];

    for (let slotId = 1; slotId <= SLOT_COUNT; slotId += 1) {
      const key = slotKey(slotId);
      const hasData = Boolean(localStorage.getItem(key));
      slots.push({
        slotId,
        hasData,
        ...(meta[slotId] || {})
      });
    }

    return slots;
  }

  function deleteSlot(slotId) {
    localStorage.removeItem(slotKey(slotId));
    localStorage.removeItem(`${slotKey(slotId)}_backup`);
    localStorage.removeItem(`${slotKey(slotId)}${TEMP_SUFFIX}`);

    const meta = readMeta();
    delete meta[slotId];
    writeMeta(meta);
  }

  function findLatestSlot() {
    return listSlots()
      .filter((slot) => slot.hasData && slot.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }

  window.NGSSaveSystem = {
    SLOT_COUNT,
    buildPayload,
    save(slotId, saveData) {
      return persistToSlot(slotId, buildPayload(saveData));
    },
    load: readSlot,
    delete: deleteSlot,
    listSlots,
    findLatestSlot
  };
})();
