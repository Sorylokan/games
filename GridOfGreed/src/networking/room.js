// Room codes (like Free the Memes, but in the URL hash: #salle=...).
// Easy to read aloud: 8 unambiguous symbols (no 0/O, 1/I/L), grouped 4-4.
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

// Lenient input: lowercase, spaces, missing dash or underscore.
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

// Reads the code from the hash: #salle=ABCD-1234
export const getRoomIdFromLocation = (hash = globalThis.location?.hash ?? "") => {
  const code = normalizeRoomCode(new URLSearchParams(String(hash).replace(/^#/, "")).get("salle"));
  return ROOM_PATTERN.test(code) ? code : null;
};
