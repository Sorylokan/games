// Codes de salle (rôle identique à room.js de FTM).
// Différence : le brief GoG veut le code dans le hash de l'URL (#salle=...),
// pas dans un paramètre ?room=.
// Codes lisibles à voix haute : 8 symboles sans ambiguïté (ni 0/O, ni 1/I/L),
// groupés 4-4. L'appId Trystero isole déjà ces salles des autres applications.
const ROOM_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 8;

const defaultRandom = () => {
  if (globalThis.crypto?.getRandomValues) {
  const values = globalThis.crypto.getRandomValues(new Uint32Array(ROOM_CODE_LENGTH));
  let index = 0;
  return () => values[index++] / 2 ** 32;
  }
  return Math.random;
};

export const createRoomId = (random = null) => {
  const roll = random ?? defaultRandom();
  const symbols = Array.from(
  { length: ROOM_CODE_LENGTH },
  () => ROOM_ALPHABET[Math.floor(roll() * ROOM_ALPHABET.length)]
  );
  return `${symbols.slice(0, 4).join("")}-${symbols.slice(4).join("")}`;
};

// Accepte une saisie souple : minuscules, espaces, tiret omis ou souligné.
export const normalizeRoomCode = (input) => {
  const clean = String(input ?? "").trim().toUpperCase().replaceAll(" ", "").replaceAll("_", "-");
  if (!clean.includes("-") && clean.length === ROOM_CODE_LENGTH) {
  return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return clean;
};

export const createRoomLink = (roomId, base = globalThis.location?.href ?? "http://localhost/") => {
  const url = new URL(base);
  url.search = "";
  url.hash = `salle=${roomId}`;
  return url.toString();
};

const ROOM_PATTERN = /^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/;
export const isValidRoomCode = (code) => ROOM_PATTERN.test(code);

// Lit le code dans le hash : #salle=ABCD-1234
export const getRoomIdFromLocation = (hash = globalThis.location?.hash ?? "") => {
  const code = normalizeRoomCode(new URLSearchParams(String(hash).replace(/^#/, "")).get("salle"));
  return ROOM_PATTERN.test(code) ? code : null;
};
