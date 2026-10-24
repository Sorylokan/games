// Bibliothèque des fresques perso, gardée dans le navigateur, plus le brouillon en cours.
import { STORAGE } from '../config.js';
import { store } from '../storage.js';
import { decodeMural, encodeMural } from '../core/mural-code.js';

// On stocke les fresques sous forme de code : compact, et déjà validé au relecture.
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

// Enregistre (ou met à jour si id est connu). Renvoie l'id.
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

// Brouillon : sauvé à chaque modification, pour ne rien perdre en rechargeant la page.
export const saveDraft = (mural, editingId) => store.set(STORAGE.draft, { code: encodeMural(mural), editingId });
export function loadDraft() {
  const d = store.get(STORAGE.draft, null);
  const mural = d && decodeMural(d.code);
  return mural ? { mural, editingId: d.editingId ?? null } : null;
}
