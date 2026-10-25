// Room codes easy to read aloud: 8 unambiguous symbols (no 0/O, 1/I/L), grouped 4-4.
// The Trystero appId already isolates rooms; ~32^8 codes is plenty for private games.
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

export const createRoomLink = (roomId, origin = globalThis.location?.origin ?? "") => {
  const isLocalRoot = ["localhost", "127.0.0.1"].includes(globalThis.location?.hostname) && globalThis.location?.pathname === "/";
  const roomPath = isLocalRoot ? "/" : "/games/FreeTheMemes/";
  const url = new URL(roomPath, origin || "http://localhost");
  url.searchParams.set("room", roomId);
  return url.toString();
};

// export const getRoomIdFromLocation = (search = globalThis.location?.search ?? "") => (
//   new URLSearchParams(search).get("room") || null
// );

const ROOM_PATTERN = /^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/;
export const isValidRoomCode = (code) => ROOM_PATTERN.test(code);

export const getRoomIdFromLocation = (search = globalThis.location?.search ?? "") => {
  const code = normalizeRoomCode(new URLSearchParams(search).get("room"));
  return ROOM_PATTERN.test(code) ? code : null;
};