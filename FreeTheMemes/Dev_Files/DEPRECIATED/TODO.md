# Free the Memes - Development TODO

## Local rules engine

- [x] Character data and conventional HP
- [x] Damage, healing, death and victory conditions
- [x] Board positions, attack pairs and adjacency
- [x] Turn phases and extra-turn queue
- [x] Event resolution loop and Press F trigger
- [x] Language files with English fallback
- [x] Card catalog with stable IDs and translation keys
- [x] Decks, discard piles and recycling
- [x] Equipment acquisition and pending actions
- [x] Base combat and attack range
- [x] Area attacks and equipment rewards on kills
- [x] Local setup with documented character allocations
- [x] Authoritative movement action
- [x] Resolve every documented card effect
- [x] Implement all documented character abilities
- [x] Add remaining reactive triggers
- [x] Resolve area effects through the card/action system
- [x] Represent players with no area before their first movement roll
- [x] Run a complete local match simulation

## Client and multiplayer

- [ ] Browser UI
- [x] Lobby and room flow
- [x] Networking abstraction
- [x] Host authority and action requests
- [x] Public/private state serialization
- [x] Trystero/WebRTC adapter
- [ ] Reconnection handling

Every completed item should keep focused tests and pass `npm.cmd test`.