// Saved custom murals (in the browser) and the current draft.
import { STORAGE } from '../config.js';
import { store } from '../storage.js';
import { decodeMural, encodeMural } from '../core/mural-code.js';

// Stored as share codes: compact, and validated when read back.
export function list() {
  const raw = store.get(STORAGE.murals, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((e) => ({ id: e.id, updated: e.updated, ...decodeMural(e.code) }))
    .filter((e) => e.map)
    .sort((a, b) => b.updated - a.updated);
}

function write(entries) {
  store.set(STORAGE.murals, entries.map(({ id, updated, name, map }) => ({ id, updated, code: encodeMural({ name, map }) })));
}

// Saves (or updates a known id). Returns the id.
export function save(mural, id = null) {
  const entries = list();
  const now = Date.now();
  const existing = id && entries.find((e) => e.id === id);
  if (existing) Object.assign(existing, mural, { updated: now });
  else { id = 'm' + now.toString(36) + Math.random().toString(36).slice(2, 6); entries.push({ id, updated: now, ...mural }); }
  write(entries);
  return id;
}

export function remove(id) {
  write(list().filter((e) => e.id !== id));
}

export const get = (id) => list().find((e) => e.id === id) ?? null;

// Draft: saved on every change, survives a reload.
export const saveDraft = (mural, editingId) => store.set(STORAGE.draft, { code: encodeMural(mural), editingId });
export function loadDraft() {
  const d = store.get(STORAGE.draft, null);
  const mural = d && decodeMural(d.code);
  return mural ? { mural, editingId: d.editingId ?? null } : null;
}
