export const SAVE_SCHEMA = 'shioji-v004-save';
export const SAVE_SCHEMA_VERSION = 1;
export const LOCAL_SAVE_KEY = 'shioji-v004-autosave';

const MODES = new Set(['tutorial', 'sandbox', 'test']);

function clone(value) {
  return structuredClone(value);
}

export function createSavePayload({
  gameVersion,
  mode,
  engineState,
  inputJournal = [],
  tutorialState = null,
  economyHistory = [],
  savedAt = new Date().toISOString(),
}) {
  if (!MODES.has(mode)) throw new RangeError(`unknown save mode: ${mode}`);
  if (!engineState?.physical || !engineState?.economy
    || !Number.isSafeInteger(engineState.day) || !Number.isSafeInteger(engineState.tick)) {
    throw new TypeError('engine state is required');
  }
  if (!Array.isArray(inputJournal) || !Array.isArray(economyHistory)) {
    throw new TypeError('save history must be arrays');
  }
  return clone({
    schema: SAVE_SCHEMA,
    schemaVersion: SAVE_SCHEMA_VERSION,
    gameVersion,
    savedAt,
    mode,
    summary: {
      day: engineState.day,
      population: engineState.economy.households.reduce(
        (total, household) => total + (household.members?.length ?? 0),
        0,
      ),
    },
    engineState,
    inputJournal,
    tutorialState,
    economyHistory,
  });
}

export function validateSavePayload(value) {
  if (!value || value.schema !== SAVE_SCHEMA) {
    throw new Error('潮路の島の保存データではありません');
  }
  if (value.schemaVersion !== SAVE_SCHEMA_VERSION) {
    throw new Error(`未対応の保存版です: ${value.schemaVersion}`);
  }
  if (!MODES.has(value.mode)) throw new Error('開始モードが不正です');
  if (!value.engineState?.physical || !value.engineState?.economy
    || !Number.isSafeInteger(value.engineState.day)
    || !Number.isSafeInteger(value.engineState.tick)) {
    throw new Error('島の状態が壊れています');
  }
  if (!Array.isArray(value.inputJournal) || !Array.isArray(value.economyHistory)) {
    throw new Error('操作記録または統計記録が壊れています');
  }
  return clone(value);
}

export function parseSaveText(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('JSONとして読み取れませんでした');
  }
  return validateSavePayload(parsed);
}

export function readLocalSave(storage) {
  const text = storage?.getItem?.(LOCAL_SAVE_KEY);
  return text ? parseSaveText(text) : null;
}

export function writeLocalSave(storage, payload) {
  const validated = validateSavePayload(payload);
  storage.setItem(LOCAL_SAVE_KEY, JSON.stringify(validated));
  return validated;
}

export function saveFileName(payload) {
  const date = String(payload.savedAt ?? '').slice(0, 10).replaceAll('-', '');
  return `shioji-day${payload.summary?.day ?? 0}-${date || 'save'}.json`;
}
