import test from "node:test";
import assert from "node:assert/strict";
import { createRoomId, createRoomLink, getRoomIdFromLocation } from "../src/networking/room.js";

test("room IDs are readable grouped codes", () => {
  assert.equal(createRoomId(() => 0), "AAAA-AAAA");
  assert.match(createRoomId(), /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
});

test("room links carry the room ID", () => {
  const link = createRoomLink("ABCD-EF23", "https://example.test");

  assert.equal(link, "https://example.test/games/FreeTheMemes/?room=ABCD-EF23");
  assert.equal(getRoomIdFromLocation("?room=ABCD-EF23"), "ABCD-EF23");
  assert.equal(getRoomIdFromLocation("?room=ftm-demo"), null); // malformed code: ignored
});